import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { isVersionEntity, listVersions } from "@/lib/versions";

export const dynamic = "force-dynamic";

/** GET /api/versions?entity=news&id=12 — newest-first version list for one record. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  const entity = req.nextUrl.searchParams.get("entity");
  const id = req.nextUrl.searchParams.get("id");
  if (!isVersionEntity(entity) || !id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  // Anyone signed in may read the history of content they can see; settings history is admin-only.
  const denied = entity === "settings" ? denyUnlessCan(session, "settings.manage") : session ? null : denyUnlessCan(session, "inbox.read");
  if (denied) return denied;
  try {
    return NextResponse.json({ versions: await listVersions(entity, id) });
  } catch (error) {
    console.error("GET /api/versions error:", error);
    return NextResponse.json({ error: "Could not load version history" }, { status: 500 });
  }
}
