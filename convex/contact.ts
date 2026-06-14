import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { truncateResendError } from "./lib/emailSanitize";
import { recordAndCheckRate } from "./lib/rateLimit";
import { sendViaResend } from "./lib/resend";
import { validateContactPayload } from "./lib/validation";

export const prepareIngress = internalMutation({
  args: { ipHash: v.string() },
  handler: async (ctx, { ipHash }) => {
    const status = await recordAndCheckRate(ctx, ipHash);
    return { limited: status === "limited" };
  },
});

export const insertSubmission = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    ipHash: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = validateContactPayload({
      name: args.name,
      email: args.email,
      message: args.message,
    });
    if (parsed.ok === false) {
      throw new Error(`Invalid contact submission: ${parsed.error}`);
    }

    // Stored as plain text; escape on output (email HTML via buildContactHtml).
    return await ctx.db.insert("contactSubmissions", {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      ipHash: args.ipHash,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const markSent = internalMutation({
  args: { id: v.id("contactSubmissions"), error: v.optional(v.string()) },
  handler: async (ctx, { id, error }) => {
    await ctx.db.patch(id, {
      status: error ? "failed" : "sent",
      resendError: error ? truncateResendError(error) : undefined,
    });
  },
});

export const sendContactEmail = internalAction({
  args: {
    submissionId: v.id("contactSubmissions"),
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await sendViaResend(args);
      await ctx.runMutation(internal.contact.markSent, { id: args.submissionId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "send failed";
      await ctx.runMutation(internal.contact.markSent, {
        id: args.submissionId,
        error: message,
      });
    }
  },
});
