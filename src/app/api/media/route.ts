import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export type MediaPayload = {
  url?: string;
  filename?: string;
  mime_type?: string;
  size_bytes?: number;
  alt?: string;
};

/** GET /api/media — list assets, newest first (admin only) */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query(
    "SELECT id, url, filename, mime_type, size_bytes, alt, created_at FROM media_assets ORDER BY created_at DESC, id DESC LIMIT 200"
  );
  return NextResponse.json({ media: rows });
}

/** POST /api/media — register an asset after its browser upload completed (admin only) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let p: MediaPayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!p.url?.startsWith("http")) {
    return NextResponse.json({ error: "A valid uploaded URL is required" }, { status: 400 });
  }
  if (!p.filename?.trim()) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  try {
    const rows = await query(
      `INSERT INTO media_assets (url, filename, mime_type, size_bytes, alt, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        p.url,
        p.filename.trim(),
        p.mime_type ?? null,
        Number.isFinite(p.size_bytes) ? p.size_bytes! : null,
        p.alt?.trim() || null,
        session.id,
      ]
    );
    return NextResponse.json({ media: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/media error:", err);
    return NextResponse.json({ error: "Could not register media" }, { status: 500 });
  }
}
