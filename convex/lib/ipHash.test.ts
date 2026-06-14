import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashIp } from "./ipHash.ts";

const ORIGINAL_SALT = process.env.RATE_LIMIT_SALT;

describe("hashIp", () => {
  afterEach(() => {
    if (ORIGINAL_SALT === undefined) {
      delete process.env.RATE_LIMIT_SALT;
    } else {
      process.env.RATE_LIMIT_SALT = ORIGINAL_SALT;
    }
  });

  it("throws when RATE_LIMIT_SALT is missing", async () => {
    delete process.env.RATE_LIMIT_SALT;
    await assert.rejects(() => hashIp("203.0.113.44"), /RATE_LIMIT_SALT/);
  });

  it("hashes with configured salt", async () => {
    process.env.RATE_LIMIT_SALT = "test-salt";
    const hash = await hashIp("203.0.113.44");
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it("hashes local client fingerprints", async () => {
    process.env.RATE_LIMIT_SALT = "test-salt";
    const hash = await hashIp("fp:0123456789abcdef");
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it("rejects malformed IP addresses", async () => {
    process.env.RATE_LIMIT_SALT = "test-salt";
    await assert.rejects(() => hashIp("not-an-ip"), /Invalid IP address/);
  });
});
