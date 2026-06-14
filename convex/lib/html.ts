/** Canonical contact email HTML helpers; re-exported by src/.../contact-email-html.ts. */
export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildContactHtml({ name, email, message }: ContactPayload) {
  const body = escapeHtml(message).replace(/\n/g, "<br>");
  return `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Message:</strong></p>
<p>${body}</p>`;
}
