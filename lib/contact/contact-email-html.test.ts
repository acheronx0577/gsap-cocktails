import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildContactHtml, escapeHtml } from "./contact-email-html.ts";

describe("contact-email-html re-export", () => {
  it("re-exports convex html helpers", () => {
    assert.equal(escapeHtml(`<'`), "&lt;&#39;");
    assert.match(
      buildContactHtml({ name: "Ada", email: "a@b.co", message: "Hi" }),
      /<strong>Name:<\/strong> Ada/,
    );
  });
});
