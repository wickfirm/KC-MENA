import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { cvBucket, getObject } from "@/lib/r2";
import type { CvMeta } from "@/lib/submissions";

export const dynamic = "force-dynamic";

/** GET /api/submissions/:id/cv — authenticated download of an applicant's CV. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const denied = denyUnlessCan(session, "inbox.read");
  if (denied || !session) return denied!;

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const row = await queryOne<{ meta: { cv?: CvMeta | null } | null }>("SELECT meta FROM contact_submissions WHERE id = $1", [id]);
    const cv = row?.meta?.cv;
    if (!cv) return NextResponse.json({ error: "No CV stored for this submission" }, { status: 404 });

    const object = await getObject(cvBucket(), cv.key);
    const filename = cv.name.replace(/[^\w.\- ]+/g, "_");
    return new NextResponse(object.stream, {
      headers: {
        "Content-Type": cv.type || object.contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...(object.length ? { "Content-Length": String(object.length) } : {}),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/submissions/:id/cv error:", error);
    return NextResponse.json({ error: "Could not retrieve the CV" }, { status: 500 });
  }
}
