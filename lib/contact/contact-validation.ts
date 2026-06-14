import { NextResponse } from "next/server";
import { validateContactFields } from "./contact-validation-core";

export function validateContactRequest(formData: FormData) {
  const result = validateContactFields(formData);
  if (result.ok === false) {
    return NextResponse.json(
      { ok: false, error: result.error, field: result.field },
      { status: 400 },
    );
  }

  return result.data;
}
