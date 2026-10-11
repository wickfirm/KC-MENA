import { requireAdminPage } from "@/lib/auth";
import { query } from "@/lib/db";
import UsersManager, { type TeamUser } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const me = await requireAdminPage();
  let users: TeamUser[] = [];
  let dbError = false;
  try {
    users = await query<TeamUser>(
      "SELECT id, email, name, role, is_active, last_login_at, created_at FROM users ORDER BY created_at ASC"
    );
  } catch {
    dbError = true;
  }
  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Team</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 20 }}>
        Accounts that can sign in to this console. <strong>Administrators</strong> manage everything, including settings,
        team and the activity log. <strong>Editors</strong> manage content, uploads, submissions and RSS review.
      </p>
      {dbError ? (
        <div className="card">
          Database not connected, or the governance migration (<code>db/migrations/001-governance.sql</code>) has not
          been applied yet.
        </div>
      ) : (
        <UsersManager initial={users} meId={me.id} />
      )}
    </>
  );
}
