import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canViewPath, roleLabel } from "@/lib/permissions";
import LogoutButton from "./LogoutButton";
import AdminNav from "@/components/admin/AdminNav";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import EditorEnhancer from "@/components/admin/EditorEnhancer";
import "./admin-ux.css";

export const dynamic = "force-dynamic";

type NavItem = { href: string; label: string };
type NavGroup = { heading?: string; adminOnly?: boolean; items: NavItem[] };

const navGroups: NavGroup[] = [
  { items: [{ href: "/admin", label: "Dashboard" }, { href: "/admin/guide", label: "Guide" }] },
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  // Real (database-backed) access check for the screen being opened; the middleware only fast-rejects.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (user && pathname && !canViewPath(user.role, pathname)) redirect("/admin?denied=1");
  const groups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((item) => !user || canViewPath(user.role, item.href)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div data-role={user?.role ?? "viewer"} className="cms-shell">
      <aside className="cms-side">
        <div className="cms-side__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Landscape%20-%20Logo%20-%20Wordmark%20KME.webp" alt="Kasumigaseki" width={170} />
          <p>CMS Console</p>
        </div>
        <AdminNav groups={groups} />
        {user && (
          <div className="cms-side__foot">
            <p className="cms-side__name">{user.name || user.email}</p>
            <p className="cms-side__role">{roleLabel(user.role)}</p>
            <p>
              <Link href="/admin/account">My account</Link>
            </p>
            <LogoutButton />
          </div>
        )}
      </aside>
      <main className="cms-main">
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
