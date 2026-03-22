"use server";

import { db } from "@/lib/db";
import { decryptLink, encryptLink } from "@/lib/hash";
import { generateUniqueCode } from "@/lib/utils";
import { headers } from "next/headers";

const LINK_TTL_MS = 5 * 60 * 1000;
const MAX_CREATE_ATTEMPTS = 3;

export type CreateLinkActionState =
  | { success: true; code: string; expiresAt: number }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };

export type GetLinkActionState =
  | { success: true; link: string }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };

// isUniqueCodeCollision checks if the error is a Prisma unique constraint violation for the code field
function isUniqueCodeCollision(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

// isValidHttpUrl checks if the provided string is a valid HTTP or HTTPS URL
function isValidHttpUrl(rawLink: string): boolean {
  try {
    const parsed = new URL(rawLink);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// createSharedLink handles the creation of a new shared link. It validates the input URL, generates a unique code, and stores the encrypted link in the database with an expiration time. It also handles potential collisions in code generation and cleans up expired links.
export async function createSharedLink(
  _prevState: CreateLinkActionState,
  formData: FormData,
): Promise<CreateLinkActionState> {
  const rawLink = (formData.get("url") as string | null)?.trim() ?? "";

  if (!isValidHttpUrl(rawLink)) {
    return {
      success: false,
      error: "Please enter a valid URL (including http/https)",
    };
  }

  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];

  try {
    const encryptedLink = encryptLink(rawLink);

    for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
      const uniqueCode = generateUniqueCode();
      const fiveMinutesAgo = new Date(Date.now() - LINK_TTL_MS);

      try {
        const newEntry = await db.$transaction(async (tx) => {
          await tx.sharing_Link.deleteMany({
            where: {
              createdAt: { lt: fiveMinutesAgo },
            },
          });

          return tx.sharing_Link.create({
            data: {
              code: uniqueCode,
              link: encryptedLink,
              identifier: ip,
            },
          });
        });

        return {
          success: true,
          code: newEntry.code,
          expiresAt: newEntry.createdAt.getTime() + LINK_TTL_MS,
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
      error: "There was a server error while generating the link",
    };
  }
}

// getLinkByCode retrieves the original link associated with a given code. It checks if the code exists, verifies that it hasn't expired, and decrypts the stored link before returning it. If any step fails, it returns an appropriate error message.
export async function getLinkByCode(
  _prevState: GetLinkActionState,
  formData: FormData,
): Promise<GetLinkActionState> {
  const code = formData.get("code") as string;

  const entry = await db.sharing_Link.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!entry) return { error: "Code not found" };

  const isExpired = Date.now() - entry.createdAt.getTime() > LINK_TTL_MS;
  if (isExpired) return { error: "The link has expired" };

  try {
    const link = decryptLink(entry.link);
    return { success: true, link };
  } catch {
    return { error: "The stored link is invalid or has been tampered with" };
  }
}
