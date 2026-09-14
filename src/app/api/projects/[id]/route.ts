import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ProjectPayload } from "../route";

export const dynamic = "force-dynamic";
const SECTORS = ["real-estate", "real-estate-development", "f-and-b", "local-business", "global-businesses"];
function idFrom(value: string) { const id = Number(value); return Number.isInteger(id) ? id : null; }

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = idFrom((await ctx.params).id); if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try { const project = await queryOne("SELECT * FROM projects WHERE id = $1", [id]); return project ? NextResponse.json({ project }) : NextResponse.json({ error: "Project not found" }, { status: 404 }); }
  catch (err) { console.error("GET /api/projects/:id error:", err); return NextResponse.json({ error: "Could not load project" }, { status: 500 }); }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = idFrom((await ctx.params).id); if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  let p: ProjectPayload; try { p = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  if (p.sector !== undefined && !SECTORS.includes(p.sector)) return NextResponse.json({ error: "Choose a valid sector" }, { status: 400 });
  try {
    const rows = await query(
      `UPDATE projects SET name=COALESCE($2,name), slug=COALESCE($3,slug), sector=COALESCE($4,sector), status=COALESCE($5,status),
       location=$6, summary=$7, description=$8, images=COALESCE($9::jsonb,images), metadata=COALESCE($10::jsonb,metadata),
       sort_order=COALESCE($11,sort_order), updated_at=now() WHERE id=$1 RETURNING *`,
      [id, p.name?.trim() || null, p.slug ? slugify(p.slug) : null, p.sector ?? null,
       p.status === "published" ? "published" : p.status === "draft" ? "draft" : null,
       p.location?.trim() || null, p.summary?.trim() || null, p.description?.trim() || null,
       p.images ? JSON.stringify(p.images) : null, p.metadata ? JSON.stringify(p.metadata) : null,
       Number.isFinite(p.sort_order) ? p.sort_order : null]
    );
    return rows[0] ? NextResponse.json({ project: rows[0] }) : NextResponse.json({ error: "Project not found" }, { status: 404 });
  } catch (err) { console.error("PUT /api/projects/:id error:", err); return NextResponse.json({ error: "Could not update project" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = idFrom((await ctx.params).id); if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try { const row = await queryOne("DELETE FROM projects WHERE id = $1 RETURNING id", [id]); return row ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Project not found" }, { status: 404 }); }
  catch (err) { console.error("DELETE /api/projects/:id error:", err); return NextResponse.json({ error: "Could not delete project" }, { status: 500 }); }
}
