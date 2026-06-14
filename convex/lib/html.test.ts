import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildContactHtml, escapeHtml } from "./html.ts";

describe("escapeHtml", () => {
  it("escapes HTML special characters including single quotes", () => {
    assert.equal(
      escapeHtml(`a&b<c>"d"'e`),
      "a&amp;b&lt;c&gt;&quot;d&quot;&#39;e",
    );
    assert.equal(escapeHtml("already&amp;escaped"), "already&amp;amp;escaped");
  });
});

describe("buildContactHtml", () => {
  it("escapes fields, preserves line breaks, and uses expected structure", () => {
    const html = buildContactHtml({
      name: `<Ada O'Brien>`,
      email: "ada@example.com",
      message: "line1\nline2",
    });

    assert.match(html, /<p><strong>Name:<\/strong> &lt;Ada O&#39;Brien&gt;<\/p>/);
    assert.match(html, /<p><strong>Email:<\/strong> ada@example\.com<\/p>/);
    assert.match(html, /<p><strong>Message:<\/strong><\/p>/);
    assert.match(html, /<p>line1<br>line2<\/p>/);
    assert.doesNotMatch(html, /<Ada/);
  });
});
