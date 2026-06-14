import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RATE_LIMIT_MESSAGE } from "../../convex/lib/rateLimit.ts";
import { CONTACT_RATE_LIMIT_MESSAGE } from "./contact-rate-limit-shared.ts";

describe("contact rate limit copy", () => {
  it("matches Convex authoritative throttle message", () => {
    assert.equal(CONTACT_RATE_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE);
  });
});
