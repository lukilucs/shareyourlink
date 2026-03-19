"use server";

import { db } from "@/lib/db";
import { hashLink } from "@/lib/hash";
import { generateUniqueCode } from "@/lib/utils";
import { headers } from "next/headers";

export async function createSharedLink(formData: FormData) {
  const rawLink = formData.get("url") as string;

  if (!rawLink || !rawLink.startsWith("http")) {
    return {
      error: "Please enter a valid URL (including http/https)",
    };
  }

  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];

  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    await db.sharing_Link.deleteMany({
      where: {
        createdAt: { lt: fiveMinutesAgo },
      },
    });

    const uniqueCode = await generateUniqueCode();
    const hashedLink = await hashLink(rawLink);

    const newEntry = await db.sharing_Link.create({
      data: {
        code: uniqueCode,
        link: hashedLink,
        identifier: ip,
      },
    });

    return {
      success: true,
      code: newEntry.code,
    };
  } catch (error) {
    return { error: "There was a server error while generating the link" };
  }
}

export async function getLinkByCode(formData: FormData) {
  const code = formData.get("code") as string;

  const entry = await db.sharing_Link.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!entry) return { error: "Code not found" };

  const isExpired = Date.now() - entry.createdAt.getTime() > 5 * 60 * 1000;
  if (isExpired) return { error: "The link has expired" };

  return { success: true, link: entry.link };
}
