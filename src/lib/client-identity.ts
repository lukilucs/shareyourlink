import { createHmac } from "node:crypto";

const IP_PATTERN_V4 =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IP_PATTERN_V6 = /^[0-9a-fA-F:]+$/;

function normalizeRawIp(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice("::ffff:".length);
  }

  return trimmed;
}

function parseForwardedFor(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const firstHop = value.split(",")[0]?.trim() ?? "";
  return firstHop.length > 0 ? firstHop : null;
}

function isValidIpAddress(value: string): boolean {
  return IP_PATTERN_V4.test(value) || IP_PATTERN_V6.test(value);
}

function getIdentityHashSecret(): string {
  const secret = process.env.IDENTIFIER_HASH_SECRET || process.env.HASH_SECRET;

  if (!secret) {
    throw new Error(
      "Missing IDENTIFIER_HASH_SECRET environment variable (or HASH_SECRET fallback)",
    );
  }

  return secret;
}

export function getClientIpFromHeaders(headerList: Headers): string {
  const candidates = [
    headerList.get("x-real-ip"),
    parseForwardedFor(headerList.get("x-forwarded-for")),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = normalizeRawIp(candidate);
    if (isValidIpAddress(normalized)) {
      return normalized;
    }
  }

  return "unknown";
}

export function hashClientIdentifier(value: string): string {
  const secret = getIdentityHashSecret();
  return createHmac("sha256", secret).update(value).digest("hex");
}
