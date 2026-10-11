import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { ingestActiveFeeds } from "@/lib/rss-ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST /api/rss/ingest — pull every active feed and queue new items for review. */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let result;
  try {
    result = await ingestActiveFeeds();
  } catch (error) {
    console.error("POST /api/rss/ingest error (loading sources):", error);
    return NextResponse.json({ error: "Could not load feed sources" }, { status: 500 });
  }
  if (!result) return NextResponse.json({ error: "No active feed sources to fetch. Add one first." }, { status: 400 });

  await logActivity({ action: "rss.ingest", summary: `Fetched RSS feeds, ${result.imported} new item(s)`, actor: session });
  return NextResponse.json({ ok: true, imported: result.imported, sources: result.sources });
}
