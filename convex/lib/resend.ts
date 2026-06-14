import { sanitizeEmailSubjectPart } from "./emailSanitize.ts";
import { buildContactHtml, type ContactPayload } from "./html.ts";

const LOOSE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_API_URL = "https://api.resend.com/emails";

export function isSafeReplyToEmail(email: string) {
  if (/[\r\n]/.test(email)) return false;
  return LOOSE_EMAIL_REGEX.test(email);
}

export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const inbox = process.env.CONTACT_EMAIL;
  if (!apiKey || !inbox) return null;
  const from =
    process.env.CONTACT_FROM?.trim() || "Portfolio Contact <onboarding@resend.dev>";
  return { apiKey, inbox, from };
}

export async function sendViaResend(payload: ContactPayload) {
  const config = getResendConfig();
  if (!config) {
    throw new Error("missing Resend config (RESEND_API_KEY, CONTACT_EMAIL)");
  }
  if (!isSafeReplyToEmail(payload.email)) {
    throw new Error("invalid reply-to email");
  }

  // fixed Resend API host only (RESEND_API_URL constant)
  // fallow-ignore-next-line security-sink
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.inbox],
      reply_to: payload.email,
      subject: `Portfolio contact from ${sanitizeEmailSubjectPart(payload.name)}`,
      html: buildContactHtml(payload),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend send failed (${response.status})`);
  }
}
