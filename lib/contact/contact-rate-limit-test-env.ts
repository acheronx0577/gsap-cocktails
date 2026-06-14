const ORIGINAL_SECRET = process.env.CONTACT_RATE_LIMIT_SECRET;

export function useContactRateLimitTestSecret() {
  process.env.CONTACT_RATE_LIMIT_SECRET = "test-contact-rate-limit-secret";

  return () => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.CONTACT_RATE_LIMIT_SECRET;
    } else {
      process.env.CONTACT_RATE_LIMIT_SECRET = ORIGINAL_SECRET;
    }
  };
}
