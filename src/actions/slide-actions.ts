"use server";

import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { generateUniqueCode } from "@/lib/utils";
import { s3BucketName, s3Client, s3Endpoint } from "@/lib/s3";
import type {
  CreateSlideActionState,
  GetSlideActionState,
} from "@/types/slide";

const SLIDE_TTL_MS = 5 * 60 * 1000;
const MAX_CREATE_ATTEMPTS = 3;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["ppt", "pptx"] as const;

type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

function isUniqueCodeCollision(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedExtension(extension: string): extension is AllowedExtension {
  return ALLOWED_EXTENSIONS.includes(extension as AllowedExtension);
}

async function deleteFileFromS3(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: s3BucketName,
    Key: fileKey,
  });

  await s3Client.send(command);
}

async function uploadSlideToS3(
  file: File,
  code: string,
  extension: AllowedExtension,
): Promise<string> {
  const fileKey = `slides/${code}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type || "application/octet-stream",
  });

  await s3Client.send(command);
  return fileKey;
}

function normalizeEndpoint(rawEndpoint: string): string {
  return rawEndpoint.replace(/\/+$/, "");
}

function buildDirectFileUrl(fileKey: string): string {
  const endpoint = normalizeEndpoint(s3Endpoint);
  return `${endpoint}/${s3BucketName}/${fileKey}`;
}

async function cleanupExpiredSlides(): Promise<void> {
  const fiveMinutesAgo = new Date(Date.now() - SLIDE_TTL_MS);
  const expiredSlides = await db.sharing_Doc.findMany({
    where: {
      createdAt: { lt: fiveMinutesAgo },
      fileKey: { startsWith: "slides/" },
    },
    select: {
      id: true,
      fileKey: true,
    },
  });

  if (expiredSlides.length === 0) {
    return;
  }

  await Promise.allSettled(
    expiredSlides.map((slide) => deleteFileFromS3(slide.fileKey)),
  );

  await db.sharing_Doc.deleteMany({
    where: {
      id: {
        in: expiredSlides.map((slide) => slide.id),
      },
    },
  });
}

export async function createSharedSlide(
  _prevState: CreateSlideActionState,
  formData: FormData,
): Promise<CreateSlideActionState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size <= 0) {
    return {
      success: false,
      error: "Please upload a valid file",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: "File size must be 5MB or less",
    };
  }

  const extension = getExtension(file.name);
  if (!isAllowedExtension(extension)) {
    return {
      success: false,
      error: "Only .ppt and .pptx files are allowed",
    };
  }

  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];

  try {
    await cleanupExpiredSlides();

    for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
      const uniqueCode = generateUniqueCode();
      const fileKey = `slides/${uniqueCode}.${extension}`;

      try {
        const newEntry = await db.sharing_Doc.create({
          data: {
            code: uniqueCode,
            fileKey,
            fileName: file.name,
            fileType: extension,
            identifier: ip,
          },
        });

        try {
          await uploadSlideToS3(file, uniqueCode, extension);
        } catch (s3Error) {
          console.error("S3 upload error, rolling back DB entry:", s3Error);
          await db.sharing_Doc.delete({ where: { id: newEntry.id } });
          throw new Error("S3 upload failed");
        }

        return {
          success: true,
          code: newEntry.code,
          expiresAt: newEntry.createdAt.getTime() + SLIDE_TTL_MS,
        };
      } catch (error) {
        if (isUniqueCodeCollision(error) && attempt < MAX_CREATE_ATTEMPTS - 1) {
          continue;
        }

        throw error;
      }
    }

    return {
      success: false,
      error: "Could not generate a unique code, try again",
    };
  } catch {
    return {
      success: false,
      error: "There was a server error while saving the slide",
    };
  }
}

export async function getSlideByCode(
  _prevState: GetSlideActionState,
  formData: FormData,
): Promise<GetSlideActionState> {
  const rawCode = (formData.get("code") as string | null)?.trim() ?? "";
  const code = rawCode.toUpperCase();

  if (code.length === 0) {
    return { error: "Code is required" };
  }

  await cleanupExpiredSlides();

  const entry = await db.sharing_Doc.findUnique({
    where: { code },
  });

  if (!entry || !entry.fileKey.startsWith("slides/")) {
    return { error: "Code not found" };
  }

  const isExpired = Date.now() - entry.createdAt.getTime() > SLIDE_TTL_MS;
  if (isExpired) {
    await Promise.allSettled([
      deleteFileFromS3(entry.fileKey),
      db.sharing_Doc.delete({ where: { id: entry.id } }),
    ]);

    return { error: "The slide has expired" };
  }

  try {
    if (!isAllowedExtension(entry.fileType)) {
      return { error: "The stored slide type is not supported" };
    }

    const url = buildDirectFileUrl(entry.fileKey);

    return {
      success: true,
      name: entry.fileName,
      url,
      fileType: entry.fileType,
    };
  } catch {
    return { error: "There was a server error while retrieving the slide" };
  }
}
