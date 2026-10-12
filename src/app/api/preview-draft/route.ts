import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { previewTarget, saveDraft } from "@/lib/preview-drafts";

export const dynamic = "force-dynamic";

/**
 * POST /api/preview-draft — park what an editor was about to save so /preview/* can render it.
 * Body: { path, payload } where path is the save endpoint (e.g. /api/site-pages/home).
 * Nothing is saved or published; the draft is private to the signed-in user and expires.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  let body: { path?: string; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const target = typeof body.path === "string" ? previewTarget(body.path) : null;
  if (!target) return NextResponse.json({ error: "This screen cannot be previewed before saving." }, { status: 400 });

  const denied = denyUnlessCan(session, target.permission);
  if (denied || !session) return denied!;
  if (!body.payload || typeof body.payload !== "object") {
    return NextResponse.json({ error: "Nothing to preview" }, { status: 400 });
  }

  try {
    await saveDraft(session.id, target.key, body.payload);
    return NextResponse.json({ ok: true, url: target.url });
  } catch (error) {
    console.error("POST /api/preview-draft error:", error);
    return NextResponse.json({ error: "Could not prepare the preview" }, { status: 500 });
  }
}
