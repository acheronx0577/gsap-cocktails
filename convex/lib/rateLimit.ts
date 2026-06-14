import type { MutationCtx } from "../_generated/server";

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
/** Block on the 4th submit attempt (3 sends allowed per window). */
export const RATE_LIMIT_MAX = 3;

export const RATE_LIMIT_MESSAGE =
  "Too many messages — please wait before trying again.";

async function deleteRateEventsBefore(
  ctx: MutationCtx,
  ipHash: string,
  createdBefore: number,
) {
  const stale = await ctx.db
    .query("contactRateEvents")
    .withIndex("by_ip_created", (q) =>
      q.eq("ipHash", ipHash).lt("createdAt", createdBefore),
    )
    .collect();

  for (const row of stale) {
    await ctx.db.delete(row._id);
  }
}

export async function recordAndCheckRate(
  ctx: MutationCtx,
  ipHash: string,
): Promise<"limited" | "allowed"> {
  const now = Date.now();
  const since = now - RATE_LIMIT_WINDOW_MS;

  await deleteRateEventsBefore(ctx, ipHash, since);

  const recent = await ctx.db
    .query("contactRateEvents")
    .withIndex("by_ip_created", (q) =>
      q.eq("ipHash", ipHash).gte("createdAt", since),
    )
    .collect();

  if (recent.length >= RATE_LIMIT_MAX) {
    return "limited";
  }

  await ctx.db.insert("contactRateEvents", {
    ipHash,
    createdAt: now,
  });

  return "allowed";
}
