const BEARER_PREFIX = "Bearer ";

function timingSafeEqualSecretToken(secret: string, token: string) {
  const enc = new TextEncoder();
  const secretBytes = enc.encode(secret);
  const tokenBytes = enc.encode(token);
  const tokenBuf = new Uint8Array(secretBytes.length);
  tokenBuf.set(tokenBytes.subarray(0, Math.min(tokenBytes.length, tokenBuf.length)));

  let mismatch = 0;
  for (let i = 0; i < secretBytes.length; i += 1) {
    mismatch |= secretBytes[i] ^ tokenBuf[i];
  }

  return mismatch === 0 && tokenBytes.length === secretBytes.length;
}

export function isAuthorized(request: Request) {
  const secret = process.env.CONTACT_INGRESS_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith(BEARER_PREFIX)) return false;

  const token = auth.slice(BEARER_PREFIX.length);
  return timingSafeEqualSecretToken(secret, token);
}
