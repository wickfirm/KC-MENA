import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import { presignUpload, publicUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_PREFIXES = ["image/", "application/pdf"];

/**
 * POST /api/media/presign — issue a presigned PUT URL so the browser can
 * upload the file straight to Cloudflare R2 (keeps media off serverless).
 * Body: { filename, contentType, size }
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { filename?: string; contentType?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const filename = (body.filename ?? "").trim();
  const contentType = (body.contentType ?? "").trim();
  const size = Number(body.size ?? 0);

  if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  if (!ALLOWED_PREFIXES.some((p) => contentType.startsWith(p))) {
    return NextResponse.json({ error: "Only images and PDFs are allowed" }, { status: 400 });
  }
  if (size <= 0 || size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 25 MB" }, { status: 400 });
  }

  // Safe object key: media/<yyyy>/<mm>/<uuid>-<sanitised name>
  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
  const now = new Date();
  const key = `media/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeName || "file"}`;

  try {
    const uploadUrl = await presignUpload(key, contentType);
    return NextResponse.json({ uploadUrl, key, publicUrl: publicUrl(key) });
  } catch (err) {
    console.error("POST /api/media/presign error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not sign upload — check R2 configuration" },
      { status: 500 }
    );
  }
}
