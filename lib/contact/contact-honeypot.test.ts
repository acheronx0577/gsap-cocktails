import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HONEYPOT_FIELD_NAME, isHoneypotTripped } from "./contact-honeypot.ts";

describe("isHoneypotTripped", () => {
  it("returns false when honeypot field is empty", () => {
    const formData = new FormData();
    formData.set("Name", "Ada");
    assert.equal(isHoneypotTripped(formData), false);
  });

  it("returns true when honeypot field is filled", () => {
    const formData = new FormData();
    formData.set(HONEYPOT_FIELD_NAME, "bot");
    assert.equal(isHoneypotTripped(formData), true);
  });
});
