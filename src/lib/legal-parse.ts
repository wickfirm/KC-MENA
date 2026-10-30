export const LEGAL_SLUGS = ["privacy-policy", "terms-and-conditions", "cookie-policy", "legal-notice"] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalRun = { text: string; href?: string };

export type LegalBlock =
  | { type: "paragraph"; runs: LegalRun[] }
  | { type: "list"; items: Array<{ lead: string; text: string }> }
  | { type: "button"; label: string };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

export type LegalContent = {
  version: 1;
  title: string;
  eyebrow: string;
  meta: { updatedLabel: string; updated: string; company: string; location: string };
  sections: LegalSection[];
};

export const LEGAL_PAGE_TITLES: Record<LegalSlug, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-and-conditions": "Terms & Conditions",
  "cookie-policy": "Cookie Policy",
  "legal-notice": "Legal Notice",
};

export function isLegalSlug(value: string): value is LegalSlug {
  return LEGAL_SLUGS.includes(value as LegalSlug);
}

export function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function textOf(html: string): string {
  return inlineText(html).trim();
}

/** Collapse source whitespace but keep a single space where the HTML had one beside a link. */
function inlineText(html: string): string {
  const decoded = decodeHtml(html.replace(/<[^>]+>/g, ""));
  const leading = /^\s/.test(decoded) ? " " : "";
  const trailing = /\s$/.test(decoded) ? " " : "";
  const middle = decoded.trim().replace(/\s+/g, " ");
  if (!middle) return leading || trailing ? " " : "";
  return `${leading}${middle}${trailing}`;
}

function parseRuns(html: string): LegalRun[] {
  const runs: LegalRun[] = [];
  const re = /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const before = inlineText(html.slice(last, match.index));
    if (before) runs.push({ text: before });
    const label = textOf(match[2]);
    if (label) runs.push({ text: label, href: decodeHtml(match[1]) });
    last = match.index + match[0].length;
  }
  const after = inlineText(html.slice(last));
  if (after) runs.push({ text: after });
  return runs.length ? runs : [{ text: "" }];
}

/** Turn the delivered legal HTML (or an older CMS row) into structured fields. */
export function parseLegacyLegalHtml(metaHtml: string, bodyHtml: string, title: string, eyebrow = "Legal"): LegalContent {
  const metaLines = decodeHtml(metaHtml.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sections: LegalSection[] = [];
  for (const part of bodyHtml.split(/<h2[^>]*>/i).slice(1)) {
    const end = part.search(/<\/h2>/i);
    if (end < 0) continue;
    const heading = textOf(part.slice(0, end));
    const rest = part.slice(end);
    const blocks: LegalBlock[] = [];
    const blockRe = /<(p|ul)\b[^>]*>[\s\S]*?<\/\1>/gi;
    let block: RegExpExecArray | null;
    while ((block = blockRe.exec(rest))) {
      const html = block[0];
      if (block[1].toLowerCase() === "ul") {
        const items = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => {
          const strong = item[1].match(/<strong>([\s\S]*?)<\/strong>/i);
          const lead = strong ? textOf(strong[1]) : "";
          const text = textOf(item[1].replace(/<strong>[\s\S]*?<\/strong>/i, ""));
          return { lead, text };
        });
        blocks.push({ type: "list", items });
      } else if (/data-cookie-settings/.test(html)) {
        blocks.push({ type: "button", label: textOf(html) });
      } else {
        const inner = html.replace(/^<p\b[^>]*>/i, "").replace(/<\/p>$/i, "");
        blocks.push({ type: "paragraph", runs: parseRuns(inner) });
      }
    }
    sections.push({ heading, blocks });
  }
  return {
    version: 1,
    title,
    eyebrow,
    meta: {
      updatedLabel: metaLines[0] || "Last updated",
      updated: metaLines[1] || "",
      company: metaLines[2] || "",
      location: metaLines.slice(3).join(", "),
    },
    sections,
  };
}

export function isLegalContent(value: unknown): value is LegalContent {
  const content = value as Partial<LegalContent> | null;
  return Boolean(
    content &&
      content.version === 1 &&
      typeof content.title === "string" &&
      typeof content.eyebrow === "string" &&
      typeof content.meta?.updatedLabel === "string" &&
      typeof content.meta?.updated === "string" &&
      typeof content.meta?.company === "string" &&
      typeof content.meta?.location === "string" &&
      Array.isArray(content.sections) &&
      content.sections.every((section) => typeof section?.heading === "string" && Array.isArray(section.blocks))
  );
}
