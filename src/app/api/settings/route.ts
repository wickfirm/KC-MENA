import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { SETTINGS_KEY, normalizeSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** GET /api/settings — current site settings (admin only) */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const row = await queryOne<{ value: unknown }>("SELECT value FROM settings WHERE key = $1", [SETTINGS_KEY]);
    return NextResponse.json({ settings: normalizeSiteSettings(row?.value) });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Could not load settings" }, { status: 500 });
  }
}

/** PUT /api/settings — save the whole settings document (admin only) */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { settings?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const settings = normalizeSiteSettings(body.settings);
  try {
    const rows = await query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
       RETURNING key, value, updated_at`,
      [SETTINGS_KEY, JSON.stringify(settings)]
    );
    return NextResponse.json({ settings: rows[0]?.value ?? settings });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }
}