function hexFromBuffer(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacIpHint(secret: string, ipHint: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(ipHint),
  );
  return hexFromBuffer(signature);
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// HMAC verify for Next-signed ipHint values
// fallow-ignore-next-line complexity
export async function verifySignedIpHint(
  ipHint: unknown,
  ipHintSignature: unknown,
) {
  const secret = process.env.CONTACT_INGRESS_SECRET?.trim();
  const ip = String(ipHint ?? "").trim();
  const signature = String(ipHintSignature ?? "").trim();
  if (!secret || !ip || !signature) return null;

  const expected = await hmacIpHint(secret, ip);
  if (!timingSafeEqualHex(signature, expected)) return null;
  return ip;
}
