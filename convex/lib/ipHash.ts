import { isIpAddress } from "./isIpAddress.ts";

const CLIENT_FINGERPRINT_RE = /^fp:[0-9a-f]{16}$/;

function requireRateLimitSalt() {
  const salt = process.env.RATE_LIMIT_SALT?.trim();
  if (!salt) {
    throw new Error(
      "RATE_LIMIT_SALT is not configured in the Convex dashboard environment",
    );
  }
  return salt;
}

export async function hashIp(ip: string) {
  if (!isIpAddress(ip) && !CLIENT_FINGERPRINT_RE.test(ip)) {
    throw new Error(`Invalid IP address: ${ip}`);
  }

  const salt = requireRateLimitSalt();
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
