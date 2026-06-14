import { createHash } from "node:crypto";

/** Set on Vercel/production when the platform strips client-supplied forwarding headers. */
function trustsProxyHeaders() {
  return process.env.TRUST_PROXY_HEADERS === "true";
}

function readTrustedProxyIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return null;
}

function clientFingerprint(request: Request) {
  const material = [
    request.headers.get("user-agent") ?? "",
    request.headers.get("accept-language") ?? "",
    request.headers.get("sec-ch-ua") ?? "",
  ].join("|");
  const digest = createHash("sha256").update(material).digest("hex").slice(0, 16);
  return `fp:${digest}`;
}

export function getClientIp(request: Request) {
  if (trustsProxyHeaders()) {
    const proxyIp = readTrustedProxyIp(request);
    if (proxyIp) return proxyIp;
  }

  return clientFingerprint(request);
}
