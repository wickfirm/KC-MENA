import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canViewPath, roleLabel } from "@/lib/permissions";
import LogoutButton from "./LogoutButton";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import EditorEnhancer from "@/components/admin/EditorEnhancer";
import "./admin-ux.css";

export const dynamic = "force-dynamic";

type NavItem = { href: string; label: string };
type NavGroup = { heading?: string; adminOnly?: boolean; items: NavItem[] };

const navGroups: NavGroup[] = [
  { items: [{ href: "/admin", label: "Dashboard" }] },
  {
    heading: "Site pages",
    items: [
      { href: "/admin/site/home", label: "Home page" },
      { href: "/admin/site/about", label: "About Us" },
      { href: "/admin/site/local-business", label: "Local Business" },
      { href: "/admin/site/business/real-estate-development", label: "Development" },
      { href: "/admin/site/business/real-estate", label: "Investment & Asset Mgmt" },
      { href: "/admin/site/business/f-and-b", label: "Food & Beverage" },
      { href: "/admin/site/business/global-businesses", label: "Global Business" },
      { href: "/admin/site/contact", label: "Contact Us" },
      { href: "/admin/site/listing/careers", label: "Careers page" },
      { href: "/admin/site/listing/faq", label: "FAQ page" },
      { href: "/admin/site/listing/news", label: "News page" },
      { href: "/admin/pages", label: "Other pages" },
    ],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/news", label: "News" },
      { href: "/admin/faqs", label: "FAQ" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/jobs", label: "Careers" },
      { href: "/admin/media", label: "Media" },
    ],
  },
  {
    heading: "Inbox",
    items: [
      { href: "/admin/submissions", label: "Submissions" },
      { href: "/admin/rss", label: "RSS Pipeline" },
    ],
  },
  {
    heading: "Administration",
    adminOnly: true,
    items: [
      { href: "/admin/settings", label: "Site Settings" },
      { href: "/admin/users", label: "Team" },
      { href: "/admin/activity", label: "Activity log" },
    ],
  },
];

const linkStyle: React.CSSProperties = { padding: "7px 12px", borderRadius: 2, fontSize: "0.85rem", fontWeight: 600, display: "block" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  // Real (database-backed) access check for the screen being opened; the middleware only fast-rejects.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (user && pathname && !canViewPath(user.role, pathname)) redirect("/admin?denied=1");
  const groups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((item) => !user || canViewPath(user.role, item.href)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div data-role={user?.role ?? "viewer"} style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          background: "#0a0a0a",
          color: "#c7c7c7",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 24px 22px", borderBottom: "1px solid #2a2a2a" }}>
          <p style={{ fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>KC MENA</p>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9a9a9a" }}>
            CMS Console
          </p>
        </div>
        <nav aria-label="Admin" style={{ flex: 1, padding: "10px 12px" }}>
          {groups.map((group, i) => (
            <div key={group.heading ?? i} style={{ marginBottom: 10 }}>
              {group.heading && (
                <p
                  style={{
                    padding: "10px 12px 4px",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#7d7d7d",
                  }}
                >
                  {group.heading}
                </p>
              )}
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} style={linkStyle}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        {user && (
          <div style={{ padding: "16px 24px 0", borderTop: "1px solid #2a2a2a", fontSize: "0.8rem" }}>
            <p style={{ color: "#fff", fontWeight: 600 }}>{user.name || user.email}</p>
            <p style={{ color: "#9a9a9a", marginBottom: 6 }}>{roleLabel(user.role)}</p>
            <p style={{ marginBottom: 10 }}>
              <Link href="/admin/account" style={{ textDecoration: "underline", color: "#c7c7c7" }}>
                My account
              </Link>
            </p>
            <LogoutButton />
          </div>
        )}
      </aside>
      <main style={{ flex: 1, padding: "32px 40px", minWidth: 0 }}>
        {user?.role === "viewer" && (
          <div className="card" style={{ borderLeft: "4px solid var(--grey-4)", marginBottom: 20, padding: "12px 18px", fontSize: ".85rem" }}>
            You have view-only access. You can look at everything you are allowed to see, but changes are disabled.
          </div>
        )}
        {user?.role === "contributor" && (
          <div className="card" style={{ borderLeft: "4px solid var(--grey-4)", marginBottom: 20, padding: "12px 18px", fontSize: ".85rem" }}>
            You are a Contributor: your news and projects are saved as drafts (news can be submitted for review). An Editor publishes them.
          </div>
        )}
        {children}
      </main>
      <UnsavedGuard />
      <EditorEnhancer role={user?.role ?? "viewer"} />
    </div>
  );
}
