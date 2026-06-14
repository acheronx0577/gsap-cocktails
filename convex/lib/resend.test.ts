import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { stubFetch } from "../../test/stub-fetch.ts";
import {
  getResendConfig,
  isSafeReplyToEmail,
  sendViaResend,
} from "./resend.ts";

const ENV_KEYS = [
  "RESEND_API_KEY",
  "CONTACT_EMAIL",
  "CONTACT_FROM",
] as const;

const originalEnv: Record<string, string | undefined> = {};
const PAYLOAD = {
  name: "Ada",
  email: "ada@example.com",
  message: "Hello",
};

function saveEnv() {
  for (const key of ENV_KEYS) {
    originalEnv[key] = process.env[key];
  }
}

function restoreEnv() {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
}

function withResendEnv() {
  saveEnv();
  process.env.RESEND_API_KEY = "re_test";
  process.env.CONTACT_EMAIL = "inbox@example.com";
}

describe("getResendConfig", () => {
  afterEach(restoreEnv);

  it("returns null when required env vars are missing", () => {
    saveEnv();
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_EMAIL;
    assert.equal(getResendConfig(), null);
  });

  it("falls back when CONTACT_FROM is blank", () => {
    withResendEnv();
    process.env.CONTACT_FROM = "   ";

    const config = getResendConfig();
    assert.ok(config);
    assert.equal(config.from, "Portfolio Contact <onboarding@resend.dev>");
  });
});

describe("isSafeReplyToEmail", () => {
  it("rejects CR/LF injection and invalid addresses", () => {
    assert.equal(isSafeReplyToEmail("ada@example.com\r\nBcc: evil@example.com"), false);
    assert.equal(isSafeReplyToEmail("not-an-email"), false);
  });

  it("accepts valid addresses", () => {
    assert.equal(isSafeReplyToEmail("ada@example.com"), true);
  });
});

describe("sendViaResend", () => {
  afterEach(restoreEnv);

  it("throws when config is missing", async () => {
    saveEnv();
    delete process.env.RESEND_API_KEY;
    await assert.rejects(() => sendViaResend(PAYLOAD), /missing Resend config/);
  });

  it("throws when reply-to is invalid", async () => {
    withResendEnv();
    await assert.rejects(
      () => sendViaResend({ ...PAYLOAD, email: "bad\r\nemail" }),
      /invalid reply-to email/,
    );
  });

  it("posts the expected payload and headers", async () => {
    withResendEnv();
    process.env.CONTACT_FROM = "Portfolio <onboarding@resend.dev>";

    const { captured, restore } = stubFetch(
      new Response(JSON.stringify({ id: "email_1" }), { status: 200 }),
    );
    try {
      await sendViaResend(PAYLOAD);

      assert.equal(captured.url, "https://api.resend.com/emails");
      assert.equal(captured.init?.method, "POST");
      assert.equal(
        (captured.init?.headers as Record<string, string>).Authorization,
        "Bearer re_test",
      );

      const body = JSON.parse(String(captured.init?.body));
      assert.equal(body.reply_to, "ada@example.com");
      assert.match(body.subject, /Portfolio contact from Ada/);
    } finally {
      restore();
    }
  });

  it("throws when Resend returns non-OK without leaking response body", async () => {
    withResendEnv();
    const { restore } = stubFetch(new Response("secret api error details", { status: 500 }));
    try {
      await assert.rejects(() => sendViaResend(PAYLOAD), /Resend send failed \(500\)/);
    } finally {
      restore();
    }
  });
});
