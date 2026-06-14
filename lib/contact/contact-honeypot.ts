const FIELD = "_gotcha";

export const HONEYPOT_FIELD_NAME = FIELD;

export function isHoneypotTripped(formData: FormData) {
  return String(formData.get(FIELD) ?? "").trim().length > 0;
}
