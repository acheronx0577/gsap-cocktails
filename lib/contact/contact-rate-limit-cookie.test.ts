import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  buildContactRateCookieHeader,
  CONTACT_RATE_COOKIE_NAME,
  readContactRateCookieTimestamps,
} from "./contact-rate-limit-cookie.ts";
import { CONTACT_RATE_LIMIT_WINDOW_MS } from "./contact-rate-limit-shared.ts";
import { useContactRateLimitTestSecret } from "./contact-rate-limit-test-env.ts";

function requestWithCookie(value: string) {
  return new Request("http://localhost/api/contact", {
    headers: { cookie: `${CONTACT_RATE_COOKIE_NAME}=${encodeURIComponent(value)}` },
  });
}

describe("contact rate limit cookie", () => {
  let restoreSecret: (() => void) | undefined;

  beforeEach(() => {
    restoreSecret = useContactRateLimitTestSecret();
  });

  afterEach(() => {
    restoreSecret?.();
  });

  it("round-trips signed timestamps", () => {
    const now = Date.now();
    const header = buildContactRateCookieHeader([now - 1000, now - 500, now]);
    const value = header.split("=")[1]?.split(";")[0] ?? "";
    const request = requestWithCookie(decodeURIComponent(value));
    const timestamps = readContactRateCookieTimestamps(request, now);

    assert.equal(timestamps.length, 3);
  });

  it("rejects tampered cookie signatures", () => {
    const now = Date.now();
    const header = buildContactRateCookieHeader([now]);
    const value = decodeURIComponent(header.split("=")[1]?.split(";")[0] ?? "");
    const tampered = `${value.slice(0, -1)}x`;

    assert.deepEqual(readContactRateCookieTimestamps(requestWithCookie(tampered), now), []);
  });

  it("drops timestamps outside the window", () => {
    const now = Date.now();
    const stale = now - CONTACT_RATE_LIMIT_WINDOW_MS - 1000;
    const header = buildContactRateCookieHeader([stale, now]);
    const value = decodeURIComponent(header.split("=")[1]?.split(";")[0] ?? "");
    const timestamps = readContactRateCookieTimestamps(
      requestWithCookie(value),
      now,
    );

    assert.equal(timestamps.length, 1);
  });
});
