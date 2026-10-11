import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";
import { ingestActiveFeeds } from "@/lib/rss-ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/rss-ingest — scheduled feed fetch (see vercel.json). Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET`. New items only enter the review queue as
 * `pending`; nothing is published without an editor approving it.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await ingestActiveFeeds();
    const imported = result?.imported ?? 0;
    await logActivity({ action: "rss.ingest", summary: `Scheduled RSS fetch, ${imported} new item(s)` });
    return NextResponse.json({ ok: true, imported, sources: result?.sources ?? [] });
  } catch (error) {
    console.error("GET /api/cron/rss-ingest error:", error);
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
  }
}
