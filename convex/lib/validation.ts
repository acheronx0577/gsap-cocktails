/** Mirrors lib/contact/contact-validation.ts (Convex cannot import app code). */
export const NAME_MAX = 500;
export const EMAIL_MAX = 254;
export const MESSAGE_MAX = 5000;

const LOOSE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactField = "Name" | "Email" | "Message";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

type ValidationError = {
  ok: false;
  error: string;
  field: ContactField;
};

type ValidationSuccess = {
  ok: true;
  data: ContactPayload;
};

export type ValidationResult = ValidationError | ValidationSuccess;

function fieldError(message: string, field: ContactField): ValidationError {
  return { ok: false, error: message, field };
}

function parseContactFields(input: {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}): ContactPayload {
  return {
    name: String(input.name ?? "").trim(),
    email: String(input.email ?? "").trim(),
    message: String(input.message ?? "").trim(),
  };
}

function validateRequiredFields({ name, email, message }: ContactPayload) {
  if (!name) return fieldError("Name is required.", "Name");
  if (!email) return fieldError("Email is required.", "Email");
  if (!message) return fieldError("Message is required.", "Message");
  return null;
}

function validateFieldLengths({ name, email, message }: ContactPayload) {
  if (name.length > NAME_MAX) {
    return fieldError(
      `Name exceeds maximum length of ${NAME_MAX} characters.`,
      "Name",
    );
  }
  if (email.length > EMAIL_MAX) {
    return fieldError(
      `Email exceeds maximum length of ${EMAIL_MAX} characters.`,
      "Email",
    );
  }
  if (message.length > MESSAGE_MAX) {
    return fieldError(
      `Message exceeds maximum length of ${MESSAGE_MAX} characters.`,
      "Message",
    );
  }
  return null;
}

export function validateContactPayload(input: {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}): ValidationResult {
  const fields = parseContactFields(input);
  const requiredError = validateRequiredFields(fields);
  if (requiredError) return requiredError;

  const lengthError = validateFieldLengths(fields);
  if (lengthError) return lengthError;

  if (!LOOSE_EMAIL_REGEX.test(fields.email)) {
    return fieldError("Invalid email address format.", "Email");
  }

  return { ok: true, data: fields };
}
