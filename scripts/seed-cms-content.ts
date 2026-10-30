/**
 * Writes the delivered page copy into the CMS.
 * Existing structured edits are kept. Missing fields are filled.
 * Legacy legal HTML is converted to fields. A stub row is replaced.
 *
 *   npx vite-node scripts/seed-cms-content.ts
 */
import fs from "node:fs";
import postgres from "postgres";
import { DEFAULT_ABOUT_CONTENT, isAboutContent, type AboutContent } from "../src/lib/about-content";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent, isBusinessDetailSlug, withBusinessDefaults, type BusinessDetailContent } from "../src/lib/business-detail-content";
import { DEFAULT_CONTACT_CONTENT, isContactContent, withContactDefaults, type ContactContent } from "../src/lib/contact-content";
import { DEFAULT_HOME_CONTENT, normalizeHomeContent } from "../src/lib/home-content";
import { defaultLegalContent, isLegalSlug, legalDescription, parseLegacyLegalHtml, readLegalContent } from "../src/lib/legal-content";
import { LEGAL_PAGE_TITLES } from "../src/lib/legal-parse";
import { DEFAULT_LISTING_CONTENT, isListingContent, isListingSlug, withListingDefaults, type ListingContent } from "../src/lib/listing-content";
import { DEFAULT_LOCAL_BUSINESS, isLocalBusinessContent, type LocalBusinessContent } from "../src/lib/local-business-content";
import { PAGE_SEO, type PageKey } from "../src/lib/seo";
import { SETTINGS_KEY, normalizeSiteSettings } from "../src/lib/settings";

if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?/);
    if (match && match[2] !== "") process.env[match[1]] = match[2];
  }
}

const PLACEHOLDERS = new Set([
  "Kasumigaseki MENA",
  "Kasumigaseki MENA is a regional development, investment, and operating platform across the GCC and beyond.",
  "Privacy policy for Kasumigaseki MENA website visitors and enquiry submissions.",
  "Terms and conditions for using the Kasumigaseki MENA website.",
  "Cookie policy for the Kasumigaseki MENA website.",
  "Legal notice and corporate information for the Kasumigaseki MENA website.",
]);

const TITLES: Record<string, string> = {
  home: "Home",
  "about-us": "About Us",
  "local-business": "Local Business",
  "real-estate-development": "Development",
  "real-estate": "Investment & Asset Management",
  "f-and-b": "Food & Beverage",
  "global-businesses": "Global Business",
  careers: "Careers",
  faq: "FAQ",
  news: "News",
  "contact-us": "Contact Us",
};

function unwrap(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return value; }
}

function kept(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text && !PLACEHOLDERS.has(text) ? text : fallback;
}

function mergeAbout(value: unknown): AboutContent {
  if (!isAboutContent(value)) return structuredClone(DEFAULT_ABOUT_CONTENT);
  return {
    ...DEFAULT_ABOUT_CONTENT,
    ...value,
    hero: { ...DEFAULT_ABOUT_CONTENT.hero, ...value.hero, image: { ...DEFAULT_ABOUT_CONTENT.hero.image, ...value.hero.image } },
    overview: {
      ...DEFAULT_ABOUT_CONTENT.overview,
      ...value.overview,
      source: value.overview.source ?? DEFAULT_ABOUT_CONTENT.overview.source,
      action: { ...DEFAULT_ABOUT_CONTENT.overview.action, ...value.overview.action },
    },
    chairman: { ...DEFAULT_ABOUT_CONTENT.chairman, ...value.chairman, image: { ...DEFAULT_ABOUT_CONTENT.chairman.image, ...value.chairman.image } },
  };
}

function mergeLocal(value: unknown): LocalBusinessContent {
  if (!isLocalBusinessContent(value)) return structuredClone(DEFAULT_LOCAL_BUSINESS);
  return {
    ...DEFAULT_LOCAL_BUSINESS,
    ...value,
    hero: { ...DEFAULT_LOCAL_BUSINESS.hero, ...value.hero },
    intro: { ...DEFAULT_LOCAL_BUSINESS.intro, ...value.intro },
    panels: value.panels.map((panel, index) => ({ ...DEFAULT_LOCAL_BUSINESS.panels[index], ...panel, linkLabel: panel.linkLabel || DEFAULT_LOCAL_BUSINESS.panels[index]?.linkLabel || "Know More" })),
    contact: { ...DEFAULT_LOCAL_BUSINESS.contact, ...value.contact },
    projectsHeading: value.projectsHeading || "Projects in the UAE",
    projectsEyebrow: value.projectsEyebrow || "Our Projects",
  };
}

function mergeListing(slug: string, value: unknown): ListingContent {
  const fallback = DEFAULT_LISTING_CONTENT[slug as keyof typeof DEFAULT_LISTING_CONTENT];
  if (!isListingSlug(slug) || !isListingContent(value)) return structuredClone(fallback);
  return withListingDefaults(slug, value);
}

function pageContent(slug: string, value: unknown): unknown {
  const current = unwrap(value);
  if (slug === "home") return current ? normalizeHomeContent(current) : structuredClone(DEFAULT_HOME_CONTENT);
  if (slug === "about-us") return mergeAbout(current);
  if (slug === "local-business") return mergeLocal(current);
  if (isBusinessDetailSlug(slug)) return withBusinessDefaults(slug, isBusinessDetailContent(current) ? current : DEFAULT_BUSINESS_DETAILS[slug]);
  if (slug === "contact-us") return withContactDefaults(isContactContent(current) ? current : DEFAULT_CONTACT_CONTENT);
  if (isListingSlug(slug)) return mergeListing(slug, current);
  if (isLegalSlug(slug)) {
    const structured = readLegalContent(current);
    if (structured) return structured;
    const legacy = current as { meta?: unknown; body?: unknown } | null;
    if (legacy && typeof legacy.meta === "string" && typeof legacy.body === "string" && /<h2[\s>]/i.test(legacy.body)) {
      return parseLegacyLegalHtml(legacy.meta, legacy.body, LEGAL_PAGE_TITLES[slug]);
    }
    return defaultLegalContent(slug);
  }
  throw new Error(`No CMS document for ${slug}`);
}

function pageSeo(slug: string, seo: { title?: string; description?: string } | null): { title: string; description: string } {
  const curated = PAGE_SEO[slug as PageKey];
  const description = isLegalSlug(slug) ? legalDescription(slug) || curated.description : curated.description;
  return { title: kept(seo?.title, curated.title), description: kept(seo?.description, description) };
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, connect_timeout: 15 });
const slugs = Object.keys(TITLES).concat(["privacy-policy", "terms-and-conditions", "cookie-policy", "legal-notice"]);

try {
  for (const slug of slugs) {
    const rows = await sql<Array<{ title: string; status: string; content: unknown; seo: { title?: string; description?: string } | null }>>`SELECT title, status, content, seo FROM pages WHERE slug = ${slug}`;
    const row = rows[0];
    const content = pageContent(slug, row?.content);
    const seo = pageSeo(slug, row?.seo ?? null);
    const title = isLegalSlug(slug) && content && typeof content === "object" && "title" in content && typeof content.title === "string" ? content.title : (row?.title || TITLES[slug]);
    const status = row?.status === "draft" ? "draft" : "published";
    await sql`
      INSERT INTO pages (slug, title, status, content, seo)
      VALUES (${slug}, ${title}, ${status}, ${JSON.stringify(content)}::text::jsonb, ${JSON.stringify(seo)}::text::jsonb)
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, seo = EXCLUDED.seo, updated_at = now()
    `;
    console.log(`${row ? "updated" : "inserted"} ${slug}`);
  }

  const settingsRows = await sql<Array<{ value: unknown }>>`SELECT value FROM settings WHERE key = ${SETTINGS_KEY}`;
  const settings = normalizeSiteSettings(settingsRows[0]?.value);
  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(settings)}::text::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
  console.log(`${settingsRows[0] ? "updated" : "inserted"} site settings`);
} finally {
  await sql.end();
}
