import { getSession } from "@/lib/auth";
import PasswordForm from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSession();

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Account</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 20 }}>
        Signed in as <strong>{user?.email}</strong>
        {user?.name ? ` (${user.name})` : ""}.
      </p>
      <PasswordForm />
    </>
  );
}
