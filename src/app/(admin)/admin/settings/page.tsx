import VersionHistory from "@/components/admin/VersionHistory";
import { requireAdminPage } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import MissingCmsContent from "@/components/admin/MissingCmsContent";
import { SETTINGS_KEY, readStoredSiteSettings } from "@/lib/settings";
import SettingsEditor from "./SettingsEditor";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  await requireAdminPage();
  let settings;
  let dbError: string | null = null;
  try {
    const row = await queryOne<{ value: unknown }>("SELECT value FROM settings WHERE key = $1", [SETTINGS_KEY]);
    settings = readStoredSiteSettings(row?.value);
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
        <div className="card">Database not connected. Set <code>DATABASE_URL</code> and apply <code>db/schema.sql</code>.</div>
      ) : settings ? (
        <SettingsEditor settings={settings} />
      ) : (
        <MissingCmsContent name="site settings" />
      )}
    {!dbError ? <VersionHistory entity="settings" entityId={SETTINGS_KEY} /> : null}
    </>
  );
}