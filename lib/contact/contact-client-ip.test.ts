import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getClientIp } from "./contact-client-ip.ts";

const ORIGINAL_TRUST = process.env.TRUST_PROXY_HEADERS;

describe("getClientIp", () => {
  afterEach(() => {
    if (ORIGINAL_TRUST === undefined) {
      delete process.env.TRUST_PROXY_HEADERS;
    } else {
      process.env.TRUST_PROXY_HEADERS = ORIGINAL_TRUST;
    }
  });

  it("reads x-forwarded-for only when proxy headers are trusted", () => {
    process.env.TRUST_PROXY_HEADERS = "true";
    const request = new Request("http://localhost/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.44, 10.0.0.1" },
    });
    assert.equal(getClientIp(request), "203.0.113.44");
  });

  it("ignores spoofed forwarding headers when proxy trust is disabled", () => {
    delete process.env.TRUST_PROXY_HEADERS;
    const request = new Request("http://localhost/api/contact", {
      headers: {
        "x-forwarded-for": "203.0.113.44",
        "user-agent": "test-agent",
        "accept-language": "en-US",
      },
    });
    assert.match(getClientIp(request), /^fp:[0-9a-f]{16}$/);
  });
});
