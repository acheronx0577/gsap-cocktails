export const CONTACT_FORM_LOADED_FIELD = "_ax_form_ts";
export const CONTACT_FORM_MIN_FILL_MS = 3000;
export const CONTACT_FORM_MAX_AGE_MS = 60 * 60 * 1000;

export function isContactFormSubmittedTooFast(
  formData: FormData,
  now = Date.now(),
) {
  const raw = formData.get(CONTACT_FORM_LOADED_FIELD);
  const loadedAt = Number(raw);

  if (!Number.isFinite(loadedAt) || loadedAt <= 0) {
    return true;
  }

  const elapsed = now - loadedAt;
  return elapsed < CONTACT_FORM_MIN_FILL_MS || elapsed > CONTACT_FORM_MAX_AGE_MS;
}
