import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/faqs", label: "FAQ" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/jobs", label: "Careers" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/rss", label: "RSS Pipeline" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          background: "#0a0a0a",
          color: "#c7c7c7",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 24px 22px", borderBottom: "1px solid #2a2a2a" }}>
          <p style={{ fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>KC MENA</p>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9a9a9a" }}>
            CMS Console
          </p>
        </div>
        <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "9px 12px",
                borderRadius: 2,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {user && (
          <div style={{ padding: "16px 24px 0", borderTop: "1px solid #2a2a2a", fontSize: "0.8rem" }}>
            <p style={{ color: "#fff", fontWeight: 600 }}>{user.name || user.email}</p>
            <p style={{ color: "#9a9a9a", marginBottom: 10 }}>{user.role}</p>
            <LogoutButton />
          </div>
        )}
      </aside>
      <main style={{ flex: 1, padding: "32px 40px", minWidth: 0 }}>{children}</main>
    </div>
  );
}
