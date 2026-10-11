import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnless } from "@/lib/auth";
import { isVersionEntity, listVersions, versionRoles } from "@/lib/versions";

export const dynamic = "force-dynamic";

/** GET /api/versions?entity=news&id=12 — newest-first version list for one record. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  const entity = req.nextUrl.searchParams.get("entity");
  const id = req.nextUrl.searchParams.get("id");
  if (!isVersionEntity(entity) || !id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const denied = denyUnless(session, versionRoles(entity));
  if (denied) return denied;
  try {
    return NextResponse.json({ versions: await listVersions(entity, id) });
  } catch (error) {
    console.error("GET /api/versions error:", error);
    return NextResponse.json({ error: "Could not load version history" }, { status: 500 });
  }
}
