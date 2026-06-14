import { isDisposableContactEmail } from "./contact-email-policy.ts";

const NAME_MAX = 500;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 5000;
const LOOSE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactField = "Name" | "Email" | "Message";

type ContactFields = {
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
  data: ContactFields;
};

export type ContactFieldsResult = ValidationError | ValidationSuccess;

function validationError(message: string, field: ContactField): ValidationError {
  return { ok: false, error: message, field };
}

function parseContactFields(formData: FormData): ContactFields {
  return {
    name: String(formData.get("Name") ?? "").trim(),
    email: String(formData.get("Email") ?? "").trim(),
    message: String(formData.get("Message") ?? "").trim(),
  };
}

function validateRequiredFields(fields: ContactFields) {
  if (!fields.name) return validationError("Name is required.", "Name");
  if (!fields.email) return validationError("Email is required.", "Email");
  if (!fields.message) return validationError("Message is required.", "Message");
  return null;
}

function validateFieldLengths(fields: ContactFields) {
  if (fields.name.length > NAME_MAX) {
    return validationError(
      `Name exceeds maximum length of ${NAME_MAX} characters.`,
      "Name",
    );
  }
  if (fields.email.length > EMAIL_MAX) {
    return validationError(
      `Email exceeds maximum length of ${EMAIL_MAX} characters.`,
      "Email",
    );
  }
  if (fields.message.length > MESSAGE_MAX) {
    return validationError(
      `Message exceeds maximum length of ${MESSAGE_MAX} characters.`,
      "Message",
    );
  }
  return null;
}

function validateEmailField(email: string) {
  if (!LOOSE_EMAIL_REGEX.test(email)) {
    return validationError("Invalid email address format.", "Email");
  }

  if (isDisposableContactEmail(email)) {
    return validationError("Invalid email address format.", "Email");
  }

  return null;
}

export function validateContactFields(formData: FormData): ContactFieldsResult {
  const fields = parseContactFields(formData);
  const requiredError = validateRequiredFields(fields);
  if (requiredError) return requiredError;

  const lengthError = validateFieldLengths(fields);
  if (lengthError) return lengthError;

  const emailError = validateEmailField(fields.email);
  if (emailError) return emailError;

  return { ok: true, data: fields };
}
