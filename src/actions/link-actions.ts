"use server";

import { db } from "@/lib/db";
import {
  getClientIpFromHeaders,
  hashClientIdentifier,
} from "@/lib/client-identity";
import { decryptLink, encryptLink } from "@/lib/hash";
import {
  enforceCreateRateLimit,
  enforceReadFailureRateLimit,
  enforceReadRateLimit,
  getLookupCooldown,
  registerLookupFailure,
  registerLookupSuccess,
} from "@/lib/rate-limit";
import { generateUniqueCode } from "@/lib/utils";
import { headers } from "next/headers";
import type { CreateLinkActionState, GetLinkActionState } from "@/types/link";

const LINK_TTL_MS = 5 * 60 * 1000;
const MAX_CREATE_ATTEMPTS = 5;

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
  const clientId = hashClientIdentifier(getClientIpFromHeaders(headerList));
  const createLimit = enforceCreateRateLimit(clientId);

  if (!createLimit.allowed) {
    return {
      success: false,
      error: `Too many creations. Try again in ${createLimit.retryAfterSeconds}s`,
    };
  }

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
                identifier: clientId,
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

  const entry = await db.sharing_Link.findUnique({
    where: { code },
  });

  if (!entry) {
    const readFailureLimit = enforceReadFailureRateLimit(clientId);
    registerLookupFailure(clientId);

    if (!readFailureLimit.allowed) {
      return {
        error: `Too many failed attempts. Try again in ${readFailureLimit.retryAfterSeconds}s`,
      };
    }

    return { error: "Code not found or expired" };
  }

  const isExpired = Date.now() - entry.createdAt.getTime() > LINK_TTL_MS;
  if (isExpired) {
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
    const link = decryptLink(entry.link);
    registerLookupSuccess(clientId);
    return { success: true, link };
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
