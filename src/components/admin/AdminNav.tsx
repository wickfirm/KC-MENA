"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavGroup = { heading?: string; items: { href: string; label: string }[] };

/**
 * Sidebar navigation with the current screen highlighted. The group list is decided on the server
 * (per role, from src/lib/permissions.ts) and passed in; this component only adds the active state.
 */
export default function AdminNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname() ?? "";
  // The longest matching href wins, so /admin/site/home does not also light up /admin.
  const hrefs = groups.flatMap((g) => g.items.map((i) => i.href));
  const active = hrefs
    .filter((h) => (h === "/admin" ? pathname === "/admin" : pathname === h || pathname.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav className="cms-nav" aria-label="Admin">
      {groups.map((group, i) => (
        <div key={group.heading ?? i} className="cms-nav__group">
          {group.heading && <p className="cms-nav__heading">{group.heading}</p>}
          {group.items.map((item) => (
            <Link key={item.href} href={item.href} className={item.href === active ? "is-active" : undefined} aria-current={item.href === active ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
