"use server";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { headers } from "next/headers";
import {
  getClientIpFromHeaders,
  hashClientIdentifier,
} from "@/lib/client-identity";
import { db } from "@/lib/db";
import {
  enforceCreateRateLimit,
  enforceReadFailureRateLimit,
  enforceReadRateLimit,
  getLookupCooldown,
  registerLookupFailure,
  registerLookupSuccess,
} from "@/lib/rate-limit";
import { generateUniqueCode } from "@/lib/utils";
import { s3BucketName, s3Client } from "@/lib/s3";
import type {
  CreateSlideActionState,
  GetSlideActionState,
} from "@/types/slide";

const SLIDE_TTL_MS = 5 * 60 * 1000;
const MAX_CREATE_ATTEMPTS = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const PRESIGNED_URL_TTL_SECONDS = 120;
const ALLOWED_EXTENSIONS = ["ppt", "pptx"] as const;
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP_SIGNATURE = [0x50, 0x4b];

const MIME_BY_EXTENSION: Record<AllowedExtension, string> = {
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const ALLOWED_MIME_BY_EXTENSION: Record<AllowedExtension, readonly string[]> = {
  ppt: ["application/vnd.ms-powerpoint", "application/octet-stream"],
  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/octet-stream",
  ],
};

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

function startsWithSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }

  return signature.every((value, index) => bytes[index] === value);
}

async function validateSlideFile(
  file: File,
  extension: AllowedExtension,
): Promise<Buffer | null> {
  if (file.type) {
    const allowedMime = ALLOWED_MIME_BY_EXTENSION[extension];
    if (!allowedMime.includes(file.type)) {
      return null;
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileBytes = new Uint8Array(buffer.subarray(0, 16));

  const hasExpectedSignature =
    (extension === "ppt" && startsWithSignature(fileBytes, OLE_SIGNATURE)) ||
    (extension === "pptx" && startsWithSignature(fileBytes, ZIP_SIGNATURE));

  if (!hasExpectedSignature) {
    return null;
  }

  return buffer;
}

async function uploadSlideToS3(
  fileBuffer: Buffer,
  code: string,
  extension: AllowedExtension,
): Promise<string> {
  const fileKey = `slides/${code}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: MIME_BY_EXTENSION[extension],
  });

  await s3Client.send(command);
  return fileKey;
}

async function buildPresignedFileUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: s3BucketName,
    Key: fileKey,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: PRESIGNED_URL_TTL_SECONDS,
  });
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

  const validatedBuffer = await validateSlideFile(file, extension);
  if (!validatedBuffer) {
    return {
      success: false,
      error: "The uploaded file does not match the expected slide format",
    };
  }

  const headerList = await headers();
  const clientId = hashClientIdentifier(getClientIpFromHeaders(headerList));
  const createLimit = enforceCreateRateLimit(clientId);

  if (!createLimit.allowed) {
    return {
      success: false,
      error: `Too many creations. Try again in ${createLimit.retryAfterSeconds}s`,
    };
  }

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
            identifier: clientId,
          },
        });

        try {
          await uploadSlideToS3(validatedBuffer, uniqueCode, extension);
        } catch {
          console.error("S3 upload failed while creating slide share");
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

  const headerList = await headers();
  const clientId = hashClientIdentifier(getClientIpFromHeaders(headerList));

  const readLimit = enforceReadRateLimit(clientId);
  if (!readLimit.allowed) {
    return {
      error: `Too many reads. Try again in ${readLimit.retryAfterSeconds}s`,
    };
  }

  const cooldown = getLookupCooldown(clientId);
  if (!cooldown.allowed) {
    return {
      error: `Too many failed attempts. Try again in ${cooldown.retryAfterSeconds}s`,
    };
  }

  await cleanupExpiredSlides();

  const entry = await db.sharing_Doc.findUnique({
    where: { code },
  });

  if (!entry || !entry.fileKey.startsWith("slides/")) {
    const readFailureLimit = enforceReadFailureRateLimit(clientId);
    registerLookupFailure(clientId);

    if (!readFailureLimit.allowed) {
      return {
        error: `Too many failed attempts. Try again in ${readFailureLimit.retryAfterSeconds}s`,
      };
    }

    return { error: "Code not found or expired" };
  }

  const isExpired = Date.now() - entry.createdAt.getTime() > SLIDE_TTL_MS;
  if (isExpired) {
    await Promise.allSettled([
      deleteFileFromS3(entry.fileKey),
      db.sharing_Doc.delete({ where: { id: entry.id } }),
    ]);

    const readFailureLimit = enforceReadFailureRateLimit(clientId);
    registerLookupFailure(clientId);

    if (!readFailureLimit.allowed) {
      return {
        error: `Too many failed attempts. Try again in ${readFailureLimit.retryAfterSeconds}s`,
      };
    }

    return { error: "Code not found or expired" };
  }

  try {
    if (!isAllowedExtension(entry.fileType)) {
      const readFailureLimit = enforceReadFailureRateLimit(clientId);
      registerLookupFailure(clientId);

      if (!readFailureLimit.allowed) {
        return {
          error: `Too many failed attempts. Try again in ${readFailureLimit.retryAfterSeconds}s`,
        };
      }

      return { error: "Code not found or expired" };
    }

    const url = await buildPresignedFileUrl(entry.fileKey);
    registerLookupSuccess(clientId);

    return {
      success: true,
      name: entry.fileName,
      url,
      fileType: entry.fileType,
    };
  } catch {
    const readFailureLimit = enforceReadFailureRateLimit(clientId);
    registerLookupFailure(clientId);

    if (!readFailureLimit.allowed) {
      return {
        error: `Too many failed attempts. Try again in ${readFailureLimit.retryAfterSeconds}s`,
      };
    }

    return { error: "Code not found or expired" };
  }
}
