const SUBJECT_PART_MAX = 200;
const RESEND_ERROR_MAX = 200;

/** Strip header-breaking characters from contact name before email subject. */
export function sanitizeEmailSubjectPart(value: string) {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SUBJECT_PART_MAX);
}

/** Store a short, non-sensitive Resend failure message in Convex. */
export function truncateResendError(message: string) {
  return message
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, RESEND_ERROR_MAX);
}
