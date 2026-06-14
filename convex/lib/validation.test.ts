import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateContactPayload } from "./validation.ts";

describe("validateContactPayload", () => {
  it("accepts valid payload", () => {
    const result = validateContactPayload({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.name, "Ada");
    }
  });

  it("rejects invalid email values", () => {
    for (const email of ["", "not-an-email"]) {
      const result = validateContactPayload({
        name: "Ada",
        email,
        message: "Hello",
      });
      assert.equal(result.ok, false);
      if (result.ok === false) {
        assert.equal(result.field, "Email");
      }
    }
  });
});
