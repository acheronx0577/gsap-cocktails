import { createHmac, timingSafeEqual } from "node:crypto";
import {
  CONTACT_RATE_LIMIT_WINDOW_MS,
  pruneContactRateTimestamps,
} from "./contact-rate-limit-shared.ts";

export const CONTACT_RATE_COOKIE_NAME = "ax_contact_rl";
const COOKIE_VERSION = "v1";

function getCookieSecret() {
  return (
    process.env.CONTACT_RATE_LIMIT_SECRET ||
    process.env.CONTACT_INGRESS_SECRET ||
    "dev-only-contact-rate-limit"
  );
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getCookieSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function getCookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}

function isValidSignature(encodedPayload: string, signature: string) {
  const expected = signPayload(encodedPayload);
  const actual = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    actual.length === expectedBuffer.length &&
    timingSafeEqual(actual, expectedBuffer)
  );
}

function decodeTimestampPayload(encodedPayload: string) {
  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as { t?: unknown };
    if (!Array.isArray(parsed.t)) return null;
    return parsed.t.filter((value): value is number => typeof value === "number");
  } catch {
    return null;
  }
}

function isCookieVersionValid(version: string | undefined) {
  return version === COOKIE_VERSION;
}

function hasCookieParts(
  encodedPayload: string | undefined,
  signature: string | undefined,
) {
  return Boolean(encodedPayload && signature);
}

function trustedCookiePayload(raw: string) {
  const parts = raw.split(".");
  const encodedPayload = parts[1];
  const signature = parts[2];
  if (!isCookieVersionValid(parts[0])) return null;
  if (!hasCookieParts(encodedPayload, signature)) return null;
  return isValidSignature(encodedPayload, signature) ? encodedPayload : null;
}

function parseContactRateCookieValue(raw: string) {
  const encodedPayload = trustedCookiePayload(raw);
  if (!encodedPayload) return [];
  return decodeTimestampPayload(encodedPayload) ?? [];
}

export function readContactRateCookieTimestamps(request: Request, now = Date.now()) {
  const raw = getCookieValue(request, CONTACT_RATE_COOKIE_NAME);
  if (!raw) return [];
  return pruneContactRateTimestamps(parseContactRateCookieValue(raw), now);
}

export function buildContactRateCookieHeader(timestamps: number[]) {
  const payload = JSON.stringify({
    t: pruneContactRateTimestamps(timestamps, Date.now()),
  });
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
  const value = `${COOKIE_VERSION}.${encodedPayload}.${signPayload(encodedPayload)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const maxAge = Math.floor(CONTACT_RATE_LIMIT_WINDOW_MS / 1000);

  return `${CONTACT_RATE_COOKIE_NAME}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}
