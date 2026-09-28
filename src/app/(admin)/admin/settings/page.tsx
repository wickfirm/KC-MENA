import { queryOne } from "@/lib/db";
import { SETTINGS_KEY, normalizeSiteSettings } from "@/lib/settings";
import SettingsEditor from "./SettingsEditor";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  let settings;
  let dbError: string | null = null;
  try {
    const row = await queryOne<{ value: unknown }>("SELECT value FROM settings WHERE key = $1", [SETTINGS_KEY]);
    settings = normalizeSiteSettings(row?.value);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
    settings = undefined;
  }

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Site Settings</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 20 }}>
        Global details used across every page: header navigation, footer brand block, contact details, and the
        contact-drawer locations.
      </p>
      {dbError ? (
        <div className="card">
          Database not connected — showing the built-in defaults. Set <code>DATABASE_URL</code> and apply{" "}
          <code>db/schema.sql</code> to save changes.
        </div>
      ) : (
        <SettingsEditor settings={settings!} />
      )}
    </>
  );
}