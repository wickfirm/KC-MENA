import { query } from "@/lib/db";
import MediaLibrary from "./MediaLibrary";

export const dynamic = "force-dynamic";

type MediaRow = {
  id: number;
  url: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

/** True when every R2 env var is present (checked server-side only). */
const r2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE_URL
);

export default async function MediaAdminPage() {
  let rows: MediaRow[] = [];
  let dbError: string | null = null;
  try {
    rows = await query<MediaRow>(
      "SELECT id, url, filename, mime_type, size_bytes, created_at FROM media_assets ORDER BY created_at DESC, id DESC LIMIT 200"
    );
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
  }

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Media Library</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 20 }}>
        Upload images for news covers, page content, and projects. Copy a URL and paste it into any editor
        (e.g. the News cover-image field).
      </p>

      {!r2Configured && (
        <div className="card" style={{ borderLeft: "4px solid #b98a2e", marginBottom: 20 }}>
          Cloudflare R2 is not configured yet — set <code>R2_ACCOUNT_ID</code>, <code>R2_ACCESS_KEY_ID</code>,{" "}
          <code>R2_SECRET_ACCESS_KEY</code>, <code>R2_BUCKET</code> and <code>R2_PUBLIC_BASE_URL</code> in{" "}
          <code>.env.local</code> and Vercel. Uploading is disabled until then.
        </div>
      )}
      {dbError && (
        <div className="card" style={{ borderLeft: "4px solid #b5342c", marginBottom: 20 }}>
          Database not connected — set <code>DATABASE_URL</code> and apply <code>db/schema.sql</code>.
        </div>
      )}

      {r2Configured && !dbError && <MediaLibrary rows={rows} />}
    </>
  );
}
