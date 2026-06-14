import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeEmailSubjectPart,
  truncateResendError,
} from "./emailSanitize.ts";

describe("sanitizeEmailSubjectPart", () => {
  it("removes newlines and collapses whitespace", () => {
    assert.equal(sanitizeEmailSubjectPart("Ada\r\nO'Brien"), "Ada O'Brien");
  });
});

describe("truncateResendError", () => {
  it("truncates long API error bodies", () => {
    const long = "x".repeat(300);
    assert.equal(truncateResendError(long).length, 200);
  });
});
