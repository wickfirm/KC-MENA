import { queryOne } from "@/lib/db";

export type NavItem = { label: string; href: string };

export type SiteSettings = {
  contact: { phone: string; email: string };
  address: { lines: string[] };
  brand: { footerCopy: string };
  links: { linkedin: string; corporate: string };
  nav: NavItem[];
  drawer: { locations: Array<{ title: string; lines: string[]; mapUrl: string }> };
};

const DEFAULTS: SiteSettings = {
  contact: { phone: "+971 43 88 3099", email: "info.dubai@kasumigaseki.co.jp" },
  address: { lines: ["Dubai Hills Estate, Business Park 4, Office 304-305", "Dubai, United Arab Emirates"] },
  brand: {
    footerCopy:
      "Kasumigaseki MENA connects regional opportunity with the discipline, capital strength, and operating expertise of Kasumigaseki Capital.",
  },
  links: { linkedin: "https://ae.linkedin.com/company/kasumigasekimiddleeast", corporate: "https://kasumigaseki.co.jp/en/" },
  nav: [
    { label: "About Us", href: "/about-us" },
    { label: "Local Business", href: "/local-business" },
    { label: "Global Business", href: "/global-businesses" },
    { label: "News", href: "/news" },
    { label: "Careers", href: "/careers" },
  ],
  drawer: {
    locations: [
      { title: "Dubai Office", lines: ["Dubai Hills Estate", "Business Park 4, Office 304-305", "Dubai, UAE"], mapUrl: "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" },
      { title: "Sales Centre", lines: ["Business Bay", "Dubai, UAE"], mapUrl: "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" },
      { title: "Miami Location", lines: ["Miami, Florida", "United States"], mapUrl: "https://www.google.com/maps/search/?api=1&query=Miami+Florida" },
      { title: "Kasumigaseki Restaurant", lines: ["Vida Emirates Hills", "Dubai, UAE"], mapUrl: "https://maps.app.goo.gl/i2oFuHW3icgJj1378?g_st=ac" },
    ],
  },
};

export const DEFAULT_SITE_SETTINGS = DEFAULTS;
export const SETTINGS_KEY = "site";

export type SiteSettingsInput = {
  contact?: { phone?: string; email?: string };
  address?: { lines?: string[] };
  brand?: { footerCopy?: string };
  links?: { linkedin?: string; corporate?: string };
  nav?: NavItem[];
  drawer?: { locations?: Array<{ title?: string; lines?: string[]; mapUrl?: string }> };
};

/** Merge partial input over defaults, keeping only well-formed values. */
export function normalizeSiteSettings(value: unknown): SiteSettings {
  const input = (value ?? {}) as SiteSettingsInput;
  const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
  const lines = (v: unknown, fallback: string[]) =>
    Array.isArray(v) && v.length > 0 && v.every((line) => typeof line === "string" && line.trim())
      ? v.map((line) => line.trim())
      : fallback;
  const nav =
    Array.isArray(input.nav) && input.nav.length > 0
      ? input.nav
          .filter((item): item is NavItem => Boolean(item) && typeof item?.label === "string" && typeof item?.href === "string")
          .map((item) => ({ label: item.label.trim(), href: item.href.trim() }))
          .slice(0, 8)
      : DEFAULTS.nav;
  const locationsRaw = Array.isArray(input.drawer?.locations) ? input.drawer!.locations! : [];
  const locations = locationsRaw
    .filter((loc): loc is { title: string; lines: string[]; mapUrl: string } =>
      Boolean(loc) && typeof loc?.title === "string" && Array.isArray(loc?.lines) && loc.lines.every((line) => typeof line === "string") && typeof loc?.mapUrl === "string"
    )
    .map((loc) => ({ title: loc.title.trim(), lines: loc.lines.map((line) => line.trim()).filter(Boolean), mapUrl: loc.mapUrl.trim() }))
    .slice(0, 8);
  if (!locations.length) locations.push(...DEFAULTS.drawer.locations);
  return {
    contact: {
      phone: str(input.contact?.phone, DEFAULTS.contact.phone),
      email: str(input.contact?.email, DEFAULTS.contact.email),
    },
    address: { lines: lines(input.address?.lines, DEFAULTS.address.lines) },
    brand: { footerCopy: str(input.brand?.footerCopy, DEFAULTS.brand.footerCopy) },
    links: {
      linkedin: str(input.links?.linkedin, DEFAULTS.links.linkedin),
      corporate: str(input.links?.corporate, DEFAULTS.links.corporate),
    },
    nav: nav.length ? nav : DEFAULTS.nav,
    drawer: { locations: locations.length ? locations : DEFAULTS.drawer.locations },
  };
}

/**
 * Fetch the site settings document. Falls back to the in-code defaults when
 * the row is missing or the database is unavailable — the public site never
 * fails because settings are down.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await queryOne<{ value: unknown }>("SELECT value FROM settings WHERE key = $1", [SETTINGS_KEY]);
    return normalizeSiteSettings(row?.value);
  } catch {
    return DEFAULTS;
  }
}