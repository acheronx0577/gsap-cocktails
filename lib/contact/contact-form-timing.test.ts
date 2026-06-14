import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTACT_FORM_LOADED_FIELD,
  CONTACT_FORM_MAX_AGE_MS,
  CONTACT_FORM_MIN_FILL_MS,
  isContactFormSubmittedTooFast,
} from "./contact-form-timing.ts";

function form(loadedAt: string | number) {
  const fd = new FormData();
  fd.set(CONTACT_FORM_LOADED_FIELD, String(loadedAt));
  return fd;
}

describe("isContactFormSubmittedTooFast", () => {
  const now = 1_700_000_000_000;

  it("rejects missing or invalid timestamps", () => {
    assert.equal(isContactFormSubmittedTooFast(new FormData(), now), true);
    assert.equal(isContactFormSubmittedTooFast(form("nope"), now), true);
  });

  it("rejects submits faster than minimum fill time", () => {
    assert.equal(
      isContactFormSubmittedTooFast(
        form(now - CONTACT_FORM_MIN_FILL_MS + 1),
        now,
      ),
      true,
    );
  });

  it("accepts submits after minimum fill time", () => {
    assert.equal(
      isContactFormSubmittedTooFast(
        form(now - CONTACT_FORM_MIN_FILL_MS),
        now,
      ),
      false,
    );
  });

  it("rejects stale form tabs", () => {
    assert.equal(
      isContactFormSubmittedTooFast(
        form(now - CONTACT_FORM_MAX_AGE_MS - 1),
        now,
      ),
      true,
    );
  });
});
