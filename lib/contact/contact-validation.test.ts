import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateContactFields } from "./contact-validation-core.ts";

function form(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

describe("validateContactFields", () => {
  it("accepts valid payload", () => {
    const result = validateContactFields(
      form({ Name: "Ada", Email: "ada@example.com", Message: "Hello" }),
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.name, "Ada");
      assert.equal(result.data.email, "ada@example.com");
      assert.equal(result.data.message, "Hello");
    }
  });

  it("rejects missing required fields", () => {
    const result = validateContactFields(form({ Name: "Ada" }));
    assert.equal(result.ok, false);
    if (result.ok === false) {
      assert.equal(result.field, "Email");
    }
  });

  it("rejects invalid email format", () => {
    const result = validateContactFields(
      form({ Name: "Ada", Email: "not-an-email", Message: "Hello" }),
    );
    assert.equal(result.ok, false);
    if (result.ok === false) {
      assert.equal(result.field, "Email");
    }
  });

  it("rejects disposable email domains", () => {
    const result = validateContactFields(
      form({ Name: "Ada", Email: "bot@mailinator.com", Message: "Hello" }),
    );
    assert.equal(result.ok, false);
    if (result.ok === false) {
      assert.equal(result.field, "Email");
      assert.equal(result.error, "Invalid email address format.");
    }
  });

  it("rejects overlong message", () => {
    const result = validateContactFields(
      form({
        Name: "Ada",
        Email: "ada@example.com",
        Message: "x".repeat(5001),
      }),
    );
    assert.equal(result.ok, false);
    if (result.ok === false) {
      assert.equal(result.field, "Message");
    }
  });
});
