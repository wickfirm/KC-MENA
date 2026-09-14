import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
const SECTORS = ["real-estate", "real-estate-development", "f-and-b", "local-business", "global-businesses"];

export type ProjectPayload = {
  name?: string; slug?: string; sector?: string; status?: string; location?: string;
  summary?: string; description?: string; images?: string[]; metadata?: Record<string, unknown>; sort_order?: number;
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const projects = await query("SELECT * FROM projects ORDER BY sector, sort_order, name LIMIT 200");
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: "Could not load projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let p: ProjectPayload;
  try { p = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  const name = p.name?.trim();
  const sector = p.sector ?? "";
  if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  if (!SECTORS.includes(sector)) return NextResponse.json({ error: "Choose a valid sector" }, { status: 400 });
  const slug = slugify(p.slug?.trim() || name);
  try {
    const rows = await query(
      `INSERT INTO projects (slug, name, sector, status, location, summary, description, images, metadata, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10) RETURNING *`,
      [slug, name, sector, p.status === "published" ? "published" : "draft", p.location?.trim() || null,
       p.summary?.trim() || null, p.description?.trim() || null, JSON.stringify(p.images ?? []),
       JSON.stringify(p.metadata ?? {}), Number.isFinite(p.sort_order) ? p.sort_order : 0]
    );
    return NextResponse.json({ project: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: "Could not save project. The slug may already be in use." }, { status: 500 });
  }
}
