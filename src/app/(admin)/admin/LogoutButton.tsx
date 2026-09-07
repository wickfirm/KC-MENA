"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
      style={{
        background: "transparent",
        border: "1px solid #4a4a4a",
        color: "#c7c7c7",
        padding: "6px 14px",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        cursor: "pointer",
        borderRadius: 2,
      }}
    >
      Sign out
    </button>
  );
}
