import { queryOne } from "@/lib/db";
import type { TypeScale } from "@/lib/type-style";
import { isTypeScale } from "@/lib/type-style";

export type NavItem = { label: string; href: string };
export type FooterLink = { label: string; href: string };
export type FooterColumn = { heading: string; links: FooterLink[] };
export type DrawerCopy = {
  eyebrow: string;
  heading: string;
  body: string;
  directionsLabel: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitLabel: string;
  successMessage: string;
  directPrompt: string;
};
export type CookieCopy = {
  title: string;
  body: string;
  policyLabel: string;
  policyHref: string;
  manageLabel: string;
  necessaryLabel: string;
  acceptLabel: string;
  saveLabel: string;
  essentialTitle: string;
  essentialBody: string;
  analyticsTitle: string;
  analyticsBody: string;
  mediaTitle: string;
  mediaBody: string;
};

export type SiteSettings = {
  contact: { phone: string; email: string };
  address: { lines: string[] };
  brand: { footerCopy: string };
  links: { linkedin: string; corporate: string };
  nav: NavItem[];
  chrome: { contactLabel: string; logoAlt: string };
  footerColumns: FooterColumn[];
  copyright: string;
  bottomLinks: FooterLink[];
  drawer: { locations: Array<{ title: string; lines: string[]; mapUrl: string }> };
  drawerCopy: DrawerCopy;
  cookie: CookieCopy;
  /** Applies to every page until a page or section sets its own type. */
  type?: TypeScale;
  newsletter?: {
    hidden?: boolean;
    eyebrow: string;
    heading: string;
    body: string;
    emailLabel: string;
    placeholder: string;
    submitLabel: string;
    consent: string;
    successMessage: string;
    errorMessage: string;
    recipientEmail: string;
    emailSubject: string;
    delivery: "inbox" | "email" | "both";
  };
};

const DEFAULTS: SiteSettings = {
  contact: { phone: "+971 43 88 3099", email: "info.dubai@kasumigaseki.co.jp" },
  address: { lines: ["Dubai Hills Estate, Business Park 4, Office 304-305", "Dubai, UAE"] },
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
  chrome: { contactLabel: "Contact Us", logoAlt: "Kasumigaseki Capital" },
  footerColumns: [
    { heading: "Company", links: [{ label: "About Us", href: "/about-us/" }, { label: "Careers", href: "/careers/" }, { label: "News", href: "/news/" }, { label: "Contact Us", href: "/contact-us/" }] },
    { heading: "Local Business", links: [{ label: "Overview", href: "/local-business/" }, { label: "Development", href: "/real-estate-development/" }, { label: "Investment & Asset Management", href: "/real-estate/" }, { label: "Food & Beverage", href: "/f-and-b/" }] },
    { heading: "Global Business", links: [{ label: "Overview", href: "/global-businesses/" }, { label: "Global Map", href: "https://map.kasumigaseki.ae/" }, { label: "Logistics", href: "https://logiflag.com/" }, { label: "Hotel Business", href: "https://favhospitalitygroup.com/" }, { label: "Healthcare", href: "https://kc-welfare.co.jp/" }] },
    { heading: "Media & Resources", links: [{ label: "Parent IR", href: "https://kasumigaseki.co.jp/en/ir/" }, { label: "Kasumigaseki Capital", href: "https://kasumigaseki.co.jp/en/" }, { label: "News", href: "/news/" }] },
    { heading: "Legal & Contact", links: [{ label: "Terms & Conditions", href: "/terms-and-conditions/" }, { label: "Privacy Policy", href: "/privacy-policy/" }, { label: "Cookie Policy", href: "/cookie-policy/" }, { label: "Legal Notice", href: "/legal-notice/" }] },
  ],
  copyright: "© {year} Kasumigaseki Capital MENA. All rights reserved.",
  bottomLinks: [
    { label: "Terms", href: "/terms-and-conditions/" },
    { label: "Privacy", href: "/privacy-policy/" },
    { label: "Cookies", href: "/cookie-policy/" },
    { label: "Legal Notice", href: "/legal-notice/" },
  ],
  drawerCopy: {
    eyebrow: "Get in Touch",
    heading: "Contact Us",
    body: "Reach the Kasumigaseki MENA team, or visit one of our company locations.",
    directionsLabel: "Get Directions ↗",
    nameLabel: "Full Name",
    emailLabel: "Email",
    messageLabel: "Message",
    submitLabel: "Send Enquiry",
    successMessage: "Thank you — your enquiry has been received.",
    directPrompt: "Prefer to reach us directly?",
  },
  cookie: {
    title: "Cookie and usage consent",
    body: "We use essential technologies to run this site. With your consent, we may also use usage analytics and functional media services to improve the website and support embedded content. Read our",
    policyLabel: "Cookie Policy",
    policyHref: "/cookie-policy/",
    manageLabel: "Manage choices",
    necessaryLabel: "Necessary only",
    acceptLabel: "Accept all",
    saveLabel: "Save choices",
    essentialTitle: "Essential",
    essentialBody: "Required for navigation, security, consent storage, and core website functionality.",
    analyticsTitle: "Usage analytics",
    analyticsBody: "Helps us understand site usage and improve performance and content.",
    mediaTitle: "Functional media",
    mediaBody: "Supports embedded video, map, social, and external content features.",
  },
  drawer: {
    locations: [
      { title: "Dubai Office", lines: ["Dubai Hills Estate, Business Park 4, Office 304-305"], mapUrl: "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" },
      { title: "Sales Centre", lines: ["Business Bay"], mapUrl: "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" },
      { title: "Miami Location", lines: ["Miami, Florida"], mapUrl: "https://www.google.com/maps/search/?api=1&query=Miami+Florida" },
      { title: "Kasumigaseki Restaurant", lines: ["Vida Emirates Hills"], mapUrl: "https://maps.app.goo.gl/i2oFuHW3icgJj1378?g_st=ac" },
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
  chrome?: { contactLabel?: string; logoAlt?: string };
  footerColumns?: FooterColumn[];
  copyright?: string;
  bottomLinks?: FooterLink[];
  drawer?: { locations?: Array<{ title?: string; lines?: string[]; mapUrl?: string }> };
  drawerCopy?: Partial<DrawerCopy>;
  cookie?: Partial<CookieCopy>;
  type?: unknown;
  newsletter?: Partial<NonNullable<SiteSettings["newsletter"]>>;
};

/** Merge partial input over defaults, keeping only well-formed values. */
export function normalizeSiteSettings(value: unknown): SiteSettings {
  const input = (value ?? {}) as SiteSettingsInput;
  const str = (v: unknown, fallback: string) => (typeof v === "string" ? v.trim() : fallback);
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
  const links = (value: unknown, fallback: FooterLink[]) =>
    Array.isArray(value)
      ? value
          .filter((item): item is FooterLink => Boolean(item) && typeof item?.label === "string" && typeof item?.href === "string")
          .map((item) => ({ label: item.label.trim(), href: item.href.trim() }))
          .filter((item) => item.label && item.href)
      : fallback;
  const columns = Array.isArray(input.footerColumns)
    ? input.footerColumns
        .map((column) => ({
          heading: typeof column?.heading === "string" ? column.heading.trim() : "",
          links: links(column?.links, []),
        }))
        .filter((column) => column.heading)
    : DEFAULTS.footerColumns;
  const drawerCopy = { ...DEFAULTS.drawerCopy, ...(input.drawerCopy ?? {}) };
  const cookie = { ...DEFAULTS.cookie, ...(input.cookie ?? {}) };
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
    chrome: {
      contactLabel: str(input.chrome?.contactLabel, DEFAULTS.chrome.contactLabel),
      logoAlt: str(input.chrome?.logoAlt, DEFAULTS.chrome.logoAlt),
    },
    footerColumns: columns.length ? columns : DEFAULTS.footerColumns,
    copyright: str(input.copyright, DEFAULTS.copyright),
    bottomLinks: links(input.bottomLinks, DEFAULTS.bottomLinks),
    drawer: { locations: locations.length ? locations : DEFAULTS.drawer.locations },
    drawerCopy: {
      eyebrow: str(drawerCopy.eyebrow, DEFAULTS.drawerCopy.eyebrow),
      heading: str(drawerCopy.heading, DEFAULTS.drawerCopy.heading),
      body: str(drawerCopy.body, DEFAULTS.drawerCopy.body),
      directionsLabel: str(drawerCopy.directionsLabel, DEFAULTS.drawerCopy.directionsLabel),
      nameLabel: str(drawerCopy.nameLabel, DEFAULTS.drawerCopy.nameLabel),
      emailLabel: str(drawerCopy.emailLabel, DEFAULTS.drawerCopy.emailLabel),
      messageLabel: str(drawerCopy.messageLabel, DEFAULTS.drawerCopy.messageLabel),
      submitLabel: str(drawerCopy.submitLabel, DEFAULTS.drawerCopy.submitLabel),
      successMessage: str(drawerCopy.successMessage, DEFAULTS.drawerCopy.successMessage),
      directPrompt: str(drawerCopy.directPrompt, DEFAULTS.drawerCopy.directPrompt),
    },
    type: isTypeScale(input.type) ? input.type : undefined,
    newsletter: input.newsletter && typeof input.newsletter.heading === "string" ? {
      hidden: input.newsletter.hidden === true,
      eyebrow: str(input.newsletter.eyebrow, ""),
      heading: input.newsletter.heading,
      body: str(input.newsletter.body, ""),
      emailLabel: str(input.newsletter.emailLabel, "Email"),
      placeholder: str(input.newsletter.placeholder, ""),
      submitLabel: str(input.newsletter.submitLabel, "Subscribe"),
      consent: str(input.newsletter.consent, ""),
      successMessage: str(input.newsletter.successMessage, "Thank you. You are subscribed."),
      errorMessage: str(input.newsletter.errorMessage, "Could not subscribe. Please try again."),
      recipientEmail: str(input.newsletter.recipientEmail, ""),
      emailSubject: str(input.newsletter.emailSubject, "Newsletter"),
      delivery: input.newsletter.delivery === "inbox" || input.newsletter.delivery === "email" ? input.newsletter.delivery : "both",
    } : undefined,
    cookie: {
      title: str(cookie.title, DEFAULTS.cookie.title),
      body: str(cookie.body, DEFAULTS.cookie.body),
      policyLabel: str(cookie.policyLabel, DEFAULTS.cookie.policyLabel),
      policyHref: str(cookie.policyHref, DEFAULTS.cookie.policyHref),
      manageLabel: str(cookie.manageLabel, DEFAULTS.cookie.manageLabel),
      necessaryLabel: str(cookie.necessaryLabel, DEFAULTS.cookie.necessaryLabel),
      acceptLabel: str(cookie.acceptLabel, DEFAULTS.cookie.acceptLabel),
      saveLabel: str(cookie.saveLabel, DEFAULTS.cookie.saveLabel),
      essentialTitle: str(cookie.essentialTitle, DEFAULTS.cookie.essentialTitle),
      essentialBody: str(cookie.essentialBody, DEFAULTS.cookie.essentialBody),
      analyticsTitle: str(cookie.analyticsTitle, DEFAULTS.cookie.analyticsTitle),
      analyticsBody: str(cookie.analyticsBody, DEFAULTS.cookie.analyticsBody),
      mediaTitle: str(cookie.mediaTitle, DEFAULTS.cookie.mediaTitle),
      mediaBody: str(cookie.mediaBody, DEFAULTS.cookie.mediaBody),
    },
  };
}

/** Empty chrome used only when the CMS row cannot be read. It contains no page copy. */
export function blankSiteSettings(): SiteSettings {
  const empty = "";
  return {
    contact: { phone: empty, email: empty },
    address: { lines: [] },
    brand: { footerCopy: empty },
    links: { linkedin: empty, corporate: empty },
    nav: [],
    chrome: { contactLabel: empty, logoAlt: empty },
    footerColumns: [],
    copyright: empty,
    bottomLinks: [],
    drawer: { locations: [] },
    drawerCopy: { eyebrow: empty, heading: empty, body: empty, directionsLabel: empty, nameLabel: empty, emailLabel: empty, messageLabel: empty, submitLabel: empty, successMessage: empty, directPrompt: empty },
    cookie: { title: empty, body: empty, policyLabel: empty, policyHref: empty, manageLabel: empty, necessaryLabel: empty, acceptLabel: empty, saveLabel: empty, essentialTitle: empty, essentialBody: empty, analyticsTitle: empty, analyticsBody: empty, mediaTitle: empty, mediaBody: empty },
  };
}

/** The settings document as stored. Missing structure does not get copy filled in. */
export function readStoredSiteSettings(value: unknown): SiteSettings | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Partial<SiteSettings>;
  if (!row.contact || !row.brand || !row.chrome || !row.drawerCopy || !row.cookie || !Array.isArray(row.nav) || !Array.isArray(row.footerColumns) || !row.drawer) return null;
  return row as SiteSettings;
}

/**
 * Fetch the site settings document. A database failure leaves the chrome blank
 * rather than substituting the seed copy.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await queryOne<{ value: unknown }>("SELECT value FROM settings WHERE key = $1", [SETTINGS_KEY]);
    return readStoredSiteSettings(row?.value) ?? blankSiteSettings();
  } catch {
    return blankSiteSettings();
  }
}
