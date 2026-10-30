import defaultsFile from "./legal-defaults.json";
import {
  LEGAL_PAGE_TITLES,
  isLegalContent,
  parseLegacyLegalHtml,
  type LegalContent,
  type LegalSlug,
} from "./legal-parse";

export {
  LEGAL_PAGE_TITLES,
  LEGAL_SLUGS,
  isLegalContent,
  isLegalSlug,
  parseLegacyLegalHtml,
  type LegalBlock,
  type LegalContent,
  type LegalRun,
  type LegalSection,
  type LegalSlug,
} from "./legal-parse";

type StoredDefault = LegalContent & { description?: string };

const defaults = defaultsFile as Record<LegalSlug, StoredDefault>;

export function defaultLegalContent(slug: LegalSlug): LegalContent {
  const { description: _description, ...content } = structuredClone(defaults[slug]);
  return content;
}

/** The CMS document only. Legacy HTML is not rendered; the seed script converts it once. */
export function readLegalContent(value: unknown): LegalContent | null {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }
  return isLegalContent(value) ? value : null;
}

/** Structured legal content, upgraded from an older HTML row when that is what the database still holds. */
export function resolveLegalContent(slug: LegalSlug, value: unknown, title?: string): LegalContent {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return defaultLegalContent(slug); }
  }
  if (isLegalContent(value)) return value;
  const legacy = value as { meta?: unknown; body?: unknown } | null;
  if (legacy && typeof legacy.meta === "string" && typeof legacy.body === "string" && /<h2[\s>]/i.test(legacy.body)) {
    const parsed = parseLegacyLegalHtml(legacy.meta, legacy.body, title || LEGAL_PAGE_TITLES[slug]);
    if (parsed.sections.length > 0) return parsed;
  }
  return defaultLegalContent(slug);
}

export function legalDescription(slug: LegalSlug): string {
  return defaults[slug].description ?? "";
}
