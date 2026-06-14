import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDisposableContactEmail,
  normalizeContactEmail,
} from "./contact-email-policy.ts";

describe("normalizeContactEmail", () => {
  it("strips Gmail dots and plus aliases", () => {
    assert.equal(
      normalizeContactEmail("Ada.Lovelace+news@gmail.com"),
      "adalovelace@gmail.com",
    );
  });

  it("normalizes googlemail.com to gmail.com", () => {
    assert.equal(
      normalizeContactEmail("user@googlemail.com"),
      "user@gmail.com",
    );
  });

  it("strips plus alias on non-Gmail domains", () => {
    assert.equal(
      normalizeContactEmail("user+tag@example.com"),
      "user@example.com",
    );
  });
});

describe("isDisposableContactEmail", () => {
  it("blocks known disposable domains", () => {
    assert.equal(isDisposableContactEmail("bot@mailinator.com"), true);
    assert.equal(isDisposableContactEmail("bot@sub.mailinator.com"), true);
  });

  it("allows regular domains", () => {
    assert.equal(isDisposableContactEmail("ada@example.com"), false);
  });
});
