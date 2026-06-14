const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "dropmail.me",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.de",
  "maildrop.cc",
  "mailinator.com",
  "sharklasers.com",
  "temp-mail.org",
  "tempmail.com",
  "throwaway.email",
  "trashmail.com",
  "yopmail.com",
]);

function extractEmailDomain(email: string) {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase();
}

export function normalizeContactEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const domain = extractEmailDomain(trimmed);
  if (!domain) return trimmed;

  const local = trimmed.slice(0, trimmed.length - domain.length - 1);
  let normalizedDomain = domain;
  let normalizedLocal = local;

  if (domain === "googlemail.com") {
    normalizedDomain = "gmail.com";
  }

  if (normalizedDomain === "gmail.com") {
    normalizedLocal = normalizedLocal.split("+")[0].replace(/\./g, "");
  } else {
    normalizedLocal = normalizedLocal.split("+")[0];
  }

  return `${normalizedLocal}@${normalizedDomain}`;
}

function isBlockedDisposableDomain(domain: string) {
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;

  for (const blocked of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }

  return false;
}

export function isDisposableContactEmail(email: string) {
  const domain = extractEmailDomain(email);
  if (!domain) return false;
  return isBlockedDisposableDomain(domain);
}
