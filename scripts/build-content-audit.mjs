// Build KC-Content-Audit.xlsx + content/google-doc-templates/*.docx from the
// delivered content snapshot. Mirrors the KPD-Content-Audit approach:
//   - Section Audit: ONE ROW PER SECTION (current content as a labeled blob),
//     not one row per text node. ~10-15 rows per page.
//   - Page SEO: meta titles/descriptions comparable across pages.
//   - Dashboard: COUNTIFS pipeline per page.
//   - Reference: lifecycle, working rules, ID scheme.
//   - content/google-doc-templates/: one .docx per page with [ID] headings so
//     client feedback maps 1:1 to audit rows. Long copy is written in Docs only.
// Sources: KC MENA - Content Tracker.xlsx, public/ static HTML,
// db/seed-faqs.sql, 2026 marketing deck (voice/keywords layer).
// Requires: npm i --no-save exceljs docx
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

const ROOT = path.resolve(import.meta.dirname, "..");
const TRACKER = path.join(ROOT, "KC MENA - Content Tracker.xlsx");
const REVIEW_DIR = path.join(ROOT, "KC-Content-Review");
const OUT = path.join(REVIEW_DIR, "KC-Content-Audit.xlsx");
const TPL_DIR = path.join(REVIEW_DIR, "google-doc-templates");

/* ---------- 1. Read the tracker (minimal xlsx reader, no deps) ---------- */
const tmp = path.join(os.tmpdir(), "kc-audit-tracker");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
execSync(`tar -xf "${TRACKER}" -C "${tmp}"`);

const dec = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#8212;/g, "\u2014")
    .replace(/&amp;/g, "&");

const shared = [
  ...fs
    .readFileSync(path.join(tmp, "xl", "sharedStrings.xml"), "utf8")
    .matchAll(/<si>([\s\S]*?)<\/si>/g),
].map((m) =>
  dec([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")),
);

const wbXml = fs.readFileSync(path.join(tmp, "xl", "workbook.xml"), "utf8");
const rels = fs.readFileSync(
  path.join(tmp, "xl", "_rels", "workbook.xml.rels"),
  "utf8",
);
const relMap = new Map(
  [...rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)].map((m) => [
    m[1],
    m[2],
  ]),
);
const trackerTabs = {};
for (const m of wbXml.matchAll(
  /<sheet[^>]*?name="([^"]+)"[^>]*?r:id="(rId\d+)"/g,
)) {
  const name = dec(m[1]);
  const file = path.join(tmp, "xl", relMap.get(m[2]));
  const xml = fs.readFileSync(file, "utf8");
  const rows = [];
  for (const rm of xml.matchAll(
    /<row[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g,
  )) {
    const cells = {};
    for (const cm of rm[2].matchAll(
      /<c r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g,
    )) {
      const col = cm[1];
      const t = cm[2].match(/t="(\w+)"/)?.[1];
      const inner = cm[3];
      let v = "";
      if (t === "s") {
        const vm = inner.match(/<v>(\d+)<\/v>/);
        v = vm ? shared[+vm[1]] : "";
      } else {
        const vm = inner.match(/<v>([\s\S]*?)<\/v>/);
        v = vm ? vm[1] : "";
      }
      if (v !== "") cells[col] = dec(v);
    }
    rows.push(cells);
  }
  trackerTabs[name] = rows; // row 0 = tab title, row 1 = headers, rows 2+ = granular rows
}

/* ---------- 2. Page registry + static-site meta ---------- */
const htmlOf = (rel) => fs.readFileSync(path.join(ROOT, "public", rel), "utf8");
const metaOf = (rel) => {
  const html = htmlOf(rel);
  return {
    title: dec((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "").trim(),
    desc: dec(
      (
        html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) ||
        html.match(/<meta\s+content="([^"]*)"\s+name="description"/i) ||
        []
      )[1] || "",
    ),
    h1: (
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || []
    )[1]
      ?.replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  };
};

const STATIC = "Static via rewrite (public/)";
const DBPAGE = "Next route + CMS DB";
const PAGES = [
  { id: "HOM", page: "Home", tab: "Home", tpl: "01-home", url: "https://kasumigaseki.ae/", route: STATIC, file: "public/index.html", ...metaOf("index.html"), schema: "Organization, WebSite" },
  { id: "ABU", page: "About Us", tab: "About Us", tpl: "02-about-us", url: "https://kasumigaseki.ae/about-us/", route: STATIC, file: "public/about-us/index.html", ...metaOf("about-us/index.html"), schema: "AboutPage, Organization" },
  { id: "GBZ", page: "Global Businesses", tab: "Global Businesses", tpl: "03-global-businesses", url: "https://kasumigaseki.ae/global-businesses/", route: STATIC, file: "public/global-businesses/index.html", ...metaOf("global-businesses/index.html"), schema: "WebPage, BreadcrumbList" },
  { id: "LOB", page: "Local Business", tab: "Local Business", tpl: "04-local-business", url: "https://kasumigaseki.ae/local-business/", route: STATIC, file: "public/local-business/index.html", ...metaOf("local-business/index.html"), schema: "WebPage, BreadcrumbList" },
  { id: "RE", page: "Real Estate", tab: "Real Estate", tpl: "05-real-estate", url: "https://kasumigaseki.ae/real-estate/", route: STATIC, file: "public/real-estate/index.html", ...metaOf("real-estate/index.html"), schema: "WebPage, BreadcrumbList" },
  { id: "RED", page: "Real Estate Development", tab: "Real Estate Development", tpl: "06-real-estate-development", url: "https://kasumigaseki.ae/real-estate-development/", route: STATIC, file: "public/real-estate-development/index.html", ...metaOf("real-estate-development/index.html"), schema: "WebPage, BreadcrumbList" },
  { id: "FNB", page: "F&B", tab: "F&B", tpl: "07-fnb", url: "https://kasumigaseki.ae/f-and-b/", route: STATIC, file: "public/f-and-b/index.html", ...metaOf("f-and-b/index.html"), schema: "WebPage, BreadcrumbList" },
  { id: "NWS", page: "News", tab: "News", tpl: "08-news", url: "https://kasumigaseki.ae/news/", route: DBPAGE, file: "src/app/(site)/news/page.tsx (DB: news_posts)", title: "News — Kasumigaseki MENA", desc: "Latest local and international news of Kasumigaseki MENA and Kasumigaseki Capital.", h1: "News", schema: "CollectionPage, ItemList" },
  { id: "FAQ", page: "FAQ", tab: null, tpl: "09-faq", url: "https://kasumigaseki.ae/faq/", route: DBPAGE, file: "src/app/(site)/faq/page.tsx (DB: faqs)", title: "FAQ", desc: "Frequently asked questions about Kasumigaseki Capital MENA — our businesses, projects, and how to reach us.", h1: "FAQ", schema: "FAQPage" },
  { id: "CAR", page: "Careers", tab: "Careers", tpl: "10-careers", url: "https://kasumigaseki.ae/careers/", route: STATIC, file: "public/careers/index.html", ...metaOf("careers/index.html"), schema: "WebPage, BreadcrumbList (JobPosting when jobs CMS lands)" },
  { id: "CON", page: "Contact Us", tab: "Contact Us", tpl: "11-contact-us", url: "https://kasumigaseki.ae/contact-us/", route: STATIC, file: "public/contact-us/index.html", ...metaOf("contact-us/index.html"), schema: "ContactPage, Organization (contactPoint)" },
  { id: "PRC", page: "Privacy Policy", tab: "Privacy Policy", tpl: "12-legal", url: "https://kasumigaseki.ae/privacy-policy/", route: DBPAGE, file: "src/app/(site)/privacy-policy/page.tsx (DB: pages)", ...metaOf("privacy-policy/index.html"), schema: "WebPage" },
  { id: "TRM", page: "Terms & Conditions", tab: "Terms & Conditions", tpl: "12-legal", url: "https://kasumigaseki.ae/terms-and-conditions/", route: DBPAGE, file: "src/app/(site)/terms-and-conditions/page.tsx (DB: pages)", ...metaOf("terms-and-conditions/index.html"), schema: "WebPage" },
  { id: "LGN", page: "Legal Notice", tab: "Legal Notice", tpl: "12-legal", url: "https://kasumigaseki.ae/legal-notice/", route: DBPAGE, file: "src/app/(site)/legal-notice/page.tsx (DB: pages)", ...metaOf("legal-notice/index.html"), schema: "WebPage" },
  { id: "CKP", page: "Cookie Policy", tab: "Cookie Policy", tpl: "12-legal", url: "https://kasumigaseki.ae/cookie-policy/", route: DBPAGE, file: "src/app/(site)/cookie-policy/page.tsx (DB: pages)", ...metaOf("cookie-policy/index.html"), schema: "WebPage" },
  { id: "NWS", page: "News article (template)", tab: null, tpl: "08-news", url: "https://kasumigaseki.ae/news/[slug]/", route: "Next route /news/[slug] + CMS DB", file: "src/app/(site)/news/[slug]/page.tsx (DB: news_posts)", title: "(per post)", desc: "(per post)", h1: "(per post)", schema: "Article (NewsArticle), BreadcrumbList" },
];

// Audit notes on observed title/URL mismatches (attached to the Page meta row).
const META_NOTES = {
  Careers: "Title tag brands 'Kasumigaseki Capital' (not MENA).",
  "Contact Us": "Title tag brands 'Kasumigaseki Capital' (not MENA).",
  "Real Estate": "Title/H1 say 'Investment & Asset Management' while URL is /real-estate/ — decide canonical phrasing.",
  "Global Businesses": "Title/H1 use singular 'Global Business'; nav label matches. Consistent but note for keyword choice.",
};

/* ---------- 3. Consolidate tracker rows -> one audit row per section ------
 * KPD approach: a row is a reviewable SECTION. All text nodes of the section
 * are merged into 'Current Content' as labeled lines. Sections with many rows
 * are split at Kicker boundaries into named subsections. */
const coarseType = (section, lines) => {
  const s = section.toUpperCase();
  if (s.startsWith("PAGE META")) return "Meta";
  if (s.startsWith("HERO")) return "Hero";
  const formFields = lines.filter((l) => /^(Form field|Button)/.test(l.label)).length;
  if (s.includes("FORM") || formFields >= 3) return "Form";
  if (s.startsWith("CONTACT") || s.startsWith("FOOTER") || s.startsWith("NAV")) return "Form";
  if (/article template/i.test(section)) return "Template";
  return "Body";
};

const consolidateTab = (tabName) => {
  const rows = (trackerTabs[tabName] || []).slice(2);
  // group by carried section
  const groups = [];
  let current = null;
  let carried = "";
  for (const row of rows) {
    const section = row.B || carried;
    if (row.B) carried = row.B;
    if (!row.B && !row.C && !row.D) continue;
    if (!current || current.section !== section) {
      current = { section, lines: [] };
      groups.push(current);
    }
    current.lines.push({ label: row.C || "", text: row.D || "", note: row.G || "" });
  }
  // split oversized groups at Kicker boundaries
  const split = [];
  for (const g of groups) {
    if (g.lines.length <= 15) {
      split.push(g);
      continue;
    }
    let sub = null;
    let subName = "";
    for (const l of g.lines) {
      if (l.label === "Kicker" && sub) {
        sub = null; // close current subsection; next line opens a new one
      }
      if (!sub) {
        subName = g.section;
        sub = { section: subName, lines: [] };
        split.push(sub);
      }
      sub.lines.push(l);
    }
  }
  return split.map((g) => {
    // merge adjacent Stat value+label pairs into single lines
    const lines = [];
    for (const l of g.lines) {
      const prev = lines[lines.length - 1];
      if (l.label === "Stat" && prev && prev.label === "Stat" && !prev.pairDone) {
        prev.text = `${prev.text} — ${l.text}`;
        prev.pairDone = true;
        continue;
      }
      lines.push({ ...l });
    }
    const blob = lines
      .map((l) => (l.label ? `${l.label}: ${l.text}` : l.text))
      .join("\n");
    return {
      section: g.section.replace(/\s*\(.*?\)\s*$/, "").trim() || g.section,
      type: coarseType(g.section, lines),
      current: blob,
      note: g.lines.find((l) => l.note)?.note || "",
    };
  });
};

/* ---------- 3b. SEO/AEO draft layer (from 2026 marketing deck) ---------- */
const PAGEPLAN = {
  "Home": {
    ptitle: "Kasumigaseki MENA | Development & Investment in the GCC",
    pdesc: "Kasumigaseki MENA is the Dubai-based arm of Tokyo-listed Kasumigaseki Capital — development, investment & asset management, and food & beverage.",
    kw: "Kasumigaseki MENA; Japanese real estate investment company Dubai",
    voice: "House line 'Turning Challenge into Value.' Deck frames parent as TSE Prime-listed (3498), $5.17bn pipeline, 129 projects; MENA entity = Kasumigaseki Middle East Investment Management L.L.C. Brand guide: restrained, content-first.",
  },
  "About Us": {
    ptitle: "About Us | Kasumigaseki MENA",
    pdesc: "The GCC platform of Kasumigaseki Capital — the TSE Prime-listed developer founded in Tokyo in 2011 — its leadership, strategy and regional track record.",
    kw: "Kasumigaseki Capital; TSE Prime listed developer",
    voice: "Deck: founded Sept 2011; Mothers 2018, Prime Oct 2023; leadership Ogawa (Founder & Chairman), Komoto (President & CEO); 'seasoned experts... imbued with entrepreneurial drive'; 90 Dubai staff. Local chairman Alabbar Alfalasi is a strong E-E-A-T signal — expand his message.",
  },
  "Global Businesses": {
    ptitle: "Global Businesses | Kasumigaseki MENA",
    pdesc: "Kasumigaseki Capital's global platforms: LOGI FLAG logistics, FHG hotels, CLASWELL healthcare and overseas development across Japan, Dubai and the US.",
    kw: "Kasumigaseki Capital businesses; LOGI FLAG; FHG hotels; CLASWELL",
    voice: "Deck pillars (Feb 2026): Logistics 29 projects/$2.33bn (LOGI FLAG frozen/chilled/automated, COLD X NETWORK); Hotel 68 projects/$2.30bn (FHG 'self hospitality': fav, FAV LUX, seven x seven, edit x seven, BASE LAYER, HOTEL FORK & KNIFE); Healthcare 17/CLASWELL hospice residences; Overseas: Dubai, Miami Worldcenter, KSA MOU.",
  },
  "Local Business": {
    ptitle: "Local Business | Kasumigaseki MENA",
    pdesc: "Kasumigaseki MENA's Dubai platform spans property development, investment & asset management, and F&B — extending Japanese discipline to the GCC.",
    kw: "Dubai real estate platform; investment and development Dubai",
    voice: "Deck positions Dubai ops as full platform 'same business model as in Japan' — fund-based development, disciplined underwriting. Anchor stats: 14,000 sq ft sales centre, 452,389 sq ft BUA, 203,575 sq ft GSA.",
  },
  "Real Estate": {
    ptitle: "Investment & Asset Management | Kasumigaseki MENA",
    pdesc: "Real estate investment and asset management in Dubai — a US$304M portfolio across 60 units in Downtown, Dubai Hills, Hartland and Palm Jumeirah.",
    kw: "real estate investment Dubai; asset management Dubai",
    voice: "Deck: US$304.4M total investment across 60 units; 26 units + 3 plots held (US$156.48M) in Downtown, Dubai Hills, Hartland, Palm Jumeirah. Dubai thesis: 2040 Master Plan to 5.8M population, 3rd most affordable top-25 city, 6th safest. NOTE: deck figures pending public-use clearance.",
  },
  "Real Estate Development": {
    ptitle: "Property Development in Dubai | Kasumigaseki MENA",
    pdesc: "Dubai property development by Kasumigaseki MENA — land strategy, product creation, capital structuring and sales, from Meydan Horizon to Emerald Hills.",
    kw: "property development company Dubai; Meydan Horizon residence",
    voice: "Deck: Meydan Horizon = first branded residential development (452,389 sq ft BUA, 1-3BR, opposite Ras Al Khor sanctuary); Emerald Hills villa JV with Daito Trust Construction; Business Bay Sales Centre (14,000 sq ft) opening soon. 'Value created before verticals'.",
  },
  "F&B": {
    ptitle: "Food & Beverage | Kasumigaseki MENA",
    pdesc: "Tokyo-rooted Neo-Japanese dining in Dubai: charcoal fire, premium ingredients and precise service from the Kasumigaseki hospitality family.",
    kw: "Neo-Japanese restaurant Dubai; Kasumigaseki Restaurant",
    voice: "Deck culinary anchors: HOTEL FORK & KNIFE 'culinary experience at the core', wood-fired gastronomy, 'Tradition Served Quietly.' Map to Kasumigaseki Restaurant at Vida Emirates Hills, chef Keigo Abe (Michelin-selected, Tokyo).",
  },
  "News": {
    ptitle: "News & Updates | Kasumigaseki MENA",
    pdesc: "Latest news from Kasumigaseki MENA and Kasumigaseki Capital — projects, partnerships and market commentary across the GCC and Japan.",
    kw: "Kasumigaseki MENA news; Kasumigaseki Capital news",
    voice: "Deck 'Events/Media' pages model the announcement voice: factual, visual, date-stamped. News can carry GCC milestones + parent IR updates (linked, not duplicated).",
  },
  "FAQ": {
    ptitle: "FAQs | Kasumigaseki MENA",
    pdesc: "Frequently asked questions about Kasumigaseki MENA — our businesses, Dubai projects, and how to reach the team.",
    kw: "Kasumigaseki MENA FAQ",
    voice: "8 seeded Q&As already question-shaped. AEO: 40-60 word answer-first blocks; add entries for Meydan Horizon, the restaurant, and careers routing.",
  },
  "Careers": {
    ptitle: "Careers | Kasumigaseki MENA",
    pdesc: "Careers at Kasumigaseki MENA in Dubai — build across development, investment, asset management and food & beverage.",
    kw: "real estate careers Dubai; Kasumigaseki jobs",
    voice: "Deck: 90 employees in Dubai (Feb 2026); culture line 'seasoned experts... imbued with entrepreneurial drive'. Job board comes with the jobs CMS (Phase 2).",
  },
  "Contact Us": {
    ptitle: "Contact Us | Kasumigaseki MENA",
    pdesc: "Contact Kasumigaseki MENA — Dubai Hills Estate office, Business Bay sales centre, and enquiry routing for corporate, investor and partnership matters.",
    kw: "Kasumigaseki MENA contact; Dubai Hills Estate office",
    voice: "Deck: Dubai Hills Estate Business Park 4 office; Business Bay Sales Centre (14,000 sq ft, Downtown/sea views) opening soon — add as enquiry route once open.",
  },
  "Privacy Policy": {
    ptitle: "Privacy Policy | Kasumigaseki MENA",
    pdesc: "How Kasumigaseki MENA collects, uses, stores and protects personal data — on this website and in enquiry submissions.",
    kw: "Kasumigaseki privacy policy",
    voice: "Legal pages must stay consistent with regulated-entity naming (deck carries FIBO registration + disclaimers for the parent).",
  },
  "Terms & Conditions": {
    ptitle: "Terms & Conditions | Kasumigaseki MENA",
    pdesc: "The terms and conditions that govern use of the Kasumigaseki MENA website, including limitations of liability and intellectual property.",
    kw: "Kasumigaseki terms and conditions",
    voice: "Keep aligned with parent's disclaimer language (deck p.49-50).",
  },
  "Legal Notice": {
    ptitle: "Legal Notice | Kasumigaseki MENA",
    pdesc: "Legal notice and corporate information for Kasumigaseki Middle East Investment Management L.L.C., the Kasumigaseki Capital subsidiary in Dubai.",
    kw: "Kasumigaseki legal notice",
    voice: "Entity: Kasumigaseki Middle East Investment Management L.L.C. (deck cover).",
  },
  "Cookie Policy": {
    ptitle: "Cookie Policy | Kasumigaseki MENA",
    pdesc: "How kasumigaseki.ae uses cookies and similar technologies, what they do, and how you can manage them in your browser.",
    kw: "Kasumigaseki cookie policy",
    voice: "Standard; keep in sync with any future analytics/CRM stack (Phase 3 Salesforce).",
  },
  "News article (template)": {
    ptitle: "(per post — [Topic] | Kasumigaseki MENA)",
    pdesc: "Per post: open with who/what/where/when in the first 40 words; end with a CTA link.",
    kw: "(per post)",
    voice: "Deck announcement voice: factual, visual, date-stamped.",
  },
};
for (const [page, plan] of Object.entries(PAGEPLAN)) {
  if (plan.ptitle.length > 60) throw new Error(`Title >60 for ${page}: ${plan.ptitle.length}`);
  if (plan.pdesc.length > 155) throw new Error(`Description >155 for ${page}: ${plan.pdesc.length}`);
}

// Section-level rewrites (short/medium copy only — long copy goes in the Doc).
const REWRITES = [
  { page: "Home", sec: "HERO", aeo: "What is Kasumigaseki MENA?",
    text: "Kasumigaseki MENA is the Dubai-based regional platform of Kasumigaseki Capital, a Tokyo Stock Exchange Prime-listed developer and investor. From development and investment to asset management and food & beverage, we turn challenge into value across the GCC and beyond." },
  { page: "About Us", sec: "INTRO + BUSINESS LINES", aeo: "Who owns Kasumigaseki MENA?",
    text: "Kasumigaseki MENA is the regional subsidiary of Kasumigaseki Capital Co., Ltd., a Tokyo-headquartered real estate developer founded in 2011 and listed on the Tokyo Stock Exchange Prime Market (securities code 3498). From Dubai, we extend that discipline across development, investment & asset management, and food & beverage." },
  { page: "Global Businesses", sec: "TRACK RECORD NUMBERS", aeo: "What businesses does Kasumigaseki Capital operate?",
    text: "Kasumigaseki Capital's pipeline and assets under management total US$5.17 billion across 129 projects: US$2.33 billion in logistics (29 projects), US$2.30 billion in hotels (68 projects), US$0.28 billion in healthcare (17), and US$0.19 billion in overseas and other businesses, as of February 28, 2026." },
  { page: "Global Businesses", sec: "3 BUSINESSES GLOBALLY",
    text: "Beyond the region, Kasumigaseki Capital operates three established platforms: LOGI FLAG logistics (dry, chilled, frozen and automated warehouses), FAV Hospitality Group hotels across five brands, and CLASWELL healthcare residences — plus overseas development in Dubai, the United States and Saudi Arabia." },
  { page: "Local Business", sec: "LOCAL BUSINESS OVERVIEW", aeo: "What does Kasumigaseki MENA do in Dubai?",
    text: "Kasumigaseki MENA in Dubai — three active business lines on one platform." },
  { page: "Real Estate", sec: "INVESTMENT BUSINESS", aeo: "Where does Kasumigaseki MENA invest in Dubai?",
    text: "Kasumigaseki MENA's investment and asset management business has deployed US$304.4 million across 60 residential units in Dubai's strongest districts — Downtown, Dubai Hills, Hartland and Palm Jumeirah — with 26 units and three plots actively held as of February 28, 2026. We identify inefficiencies in product, location and timing, and underwrite for the long term." },
  { page: "Real Estate Development", sec: "MEYDAN HORIZON", aeo: "What is Meydan Horizon?",
    text: "Meydan Horizon is Kasumigaseki MENA's first branded residential development: 452,389 sq ft of built-up area opposite Ras Al Khor Wildlife Sanctuary, offering elegantly designed one- to three-bedroom luxury residences with direct access to Dubai's core districts." },
  { page: "F&B", sec: "F&B BUSINESS", aeo: "What kind of restaurant is Kasumigaseki?",
    text: "Kasumigaseki Restaurant, led by chef Keigo Abe, brings Tokyo-rooted Neo-Japanese cuisine to Vida Emirates Hills: a charcoal fire-led menu, premium sourcing, and service design shaped by the group's hospitality platform — authentic Japanese dining translated for Dubai without dilution." },
  { page: "News", sec: "INTRO",
    text: "Local and international news of Kasumigaseki MENA and Kasumigaseki Capital — project milestones, partnerships and market commentary across the GCC and Japan, with investor updates from Tokyo." },
  { page: "Careers", sec: "APPLICATION FORM", aeo: "How do I apply for a job at Kasumigaseki MENA?",
    text: "Complete the form below and a member of our team will be in touch. Kasumigaseki MENA's Dubai team is 90 people strong and growing across development, investment & asset management, and food & beverage — share your profile and tell us where you'd fit." },
  { page: "Contact Us", sec: "GENERAL CONTACT FORM", aeo: "How do I contact Kasumigaseki MENA?",
    text: "Complete the form and a member of our team will be in touch. Corporate, investor, partnership and business enquiries are handled from our Dubai Hills Estate office (Business Park 4, Office 304-305); development and sales enquiries are served by the Business Bay sales centre." },
  { page: "FAQ", sec: "INTRO",
    text: "Frequently Asked Questions — clear answers about Kasumigaseki MENA's businesses, Dubai projects and contact routes: who we are, what we build, and how to reach the team." },
];

/* ---------- 3c. Build consolidated audit rows ---------- */
const audit = [];
const glbRows = [
  ["Header & Navigation", "src/components/site/SiteHeader.tsx (all pages)", "Nav",
    "Logo (links Home). Nav: About Us, Local Business, Global Business, News, Careers. Right: 'Contact Us' link (opens Contact Drawer) + mobile hamburger. Same header on every page."],
  ["Footer", "src/components/site/SiteFooter.tsx (all pages)", "Footer",
    "Brand block: logo, copy 'Kasumigaseki MENA connects regional opportunity with the discipline, capital strength, and operating expertise of Kasumigaseki Capital.', address 'Dubai Hills Estate, Business Park 4, Office 304-305, Dubai, UAE', LinkedIn + Kasumigaseki Capital corporate site links.\nColumns — Company: About Us, Careers, News, Contact Us. Local Business: Overview, Development, Investment & Asset Management, Food & Beverage. Global Business: Overview, Global Map (map.kasumigaseki.ae), Logistics (logiflag.com), Hotel Business (favhospitalitygroup.com), Healthcare (kc-welfare.co.jp). Media & Resources: Parent IR, Kasumigaseki Capital news, Global Site.\nLegal links + copyright."],
  ["Contact Drawer", "src/components/site/ContactDrawer.tsx (all pages)", "Form",
    "Eyebrow 'Get in Touch'; H2 'Contact Us'; intro 'Reach the Kasumigaseki MENA team, or visit one of our company locations.'\nLocations: Dubai Office (Dubai Hills Estate, Business Park 4, Office 304-305); Sales Centre (Business Bay); Miami Location (Miami, Florida); Kasumigaseki Restaurant (Vida Emirates Hills).\nForm: Full Name, Email, Message. Submit 'Send Enquiry'. Currently mailto: fallback via /js/site.js (contact_submissions table + Salesforce dual-write queued for Phase 3)."],
];
glbRows.forEach((r, i) =>
  audit.push({ id: `GLB-${String(i + 1).padStart(2, "0")}`, tab: "Global (all pages)", page: r[0], file: r[1], section: r[0], type: r[2], current: r[3], note: "" }),
);

// FAQ page rows (not in the tracker — built from the Next route + seed).
const faqSeed = fs.readFileSync(path.join(ROOT, "db", "seed-faqs.sql"), "utf8");
const faqQuestions = [...faqSeed.matchAll(/\('([^']{10,200})',/g)].map((m) => m[1]);
const faqSections = [
  { section: "Page meta", type: "Meta", current: `Meta description: Frequently asked questions about Kasumigaseki Capital MENA — our businesses, projects, and how to reach us.\nCanonical URL: https://kasumigaseki.ae/faq/`, note: "" },
  { section: "HERO", type: "Hero", current: "Page title (H1): FAQ (hero band, background image quality2.webp).", note: "" },
  { section: "INTRO", type: "Body", current: "Heading (H2): Frequently Asked Questions.\nParagraph: Everything about Kasumigaseki MENA — our businesses, projects, and how to work with us.", note: "" },
  { section: "FAQ LIST", type: "Body", current: `Accordion: 8 Q&A entries managed in /admin/faqs (DB: faqs, seeded from db/seed-faqs.sql):\n${faqQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\nGrouped by category; empty-state fallback shows info.dubai@kasumigaseki.co.jp.`, note: "First-class CMS resource — AEO questions can become managed FAQ entries (FAQPage JSON-LD)." },
];
faqSections.forEach((s, i) =>
  audit.push({ id: `FAQ-${String(i + 1).padStart(2, "0")}`, tab: "FAQ", page: "FAQ", file: "src/app/(site)/faq/page.tsx (DB: faqs)", ...s }),
);

for (const p of PAGES) {
  if (!p.tab) continue;
  let n = 0;
  for (const g of consolidateTab(p.tab)) {
    n += 1;
    const note =
      g.section === "Page meta" && META_NOTES[p.page]
        ? [g.note, META_NOTES[p.page]].filter(Boolean).join(" ")
        : g.note;
    audit.push({
      id: `${p.id}-${String(n).padStart(2, "0")}`,
      tab: p.tab,
      page: p.page,
      file: p.file,
      section: g.section,
      type: g.type,
      current: g.current,
      note,
    });
  }
  if (p.page === "News") {
    audit.push({
      id: "NWS-ART", tab: "News", page: "News article (template)", file: "src/app/(site)/news/[slug]/page.tsx (DB: news_posts)",
      section: "Article template (/news/[slug])", type: "Template",
      current: "Per-post fields: title, slug, category, hero image, body, published date — managed in /admin/news. Rewrites here define the standing article structure (lede, subheads, CTA).",
      note: "",
    });
  }
}

let draftedRows = 0;
for (const a of audit) {
  const plan = PAGEPLAN[a.page];
  if (plan && a.type === "Meta") {
    a.rewrite = `Meta description: ${plan.pdesc}`;
    a.status = "Drafted";
    draftedRows++;
  }
  const rw = REWRITES.find(
    (r) => !r._used && r.page === a.page && a.section.startsWith(r.sec),
  );
  if (rw) {
    rw._used = true;
    a.rewrite = rw.text;
    if (rw.aeo) a.aeo = rw.aeo;
    a.status = "Drafted";
    draftedRows++;
  }
  if (a.page === "Real Estate" && a.section.startsWith("INVESTMENT NUMBERS")) {
    a.note = (a.note ? a.note + " " : "") + "Check stat pairing vs deck: US$304.4M total investment across 60 units; 26 units + 3 plots held valued US$156.5M.";
  }
}
const unmatched = REWRITES.filter((r) => !r._used).map((r) => `${r.page}/${r.sec}`);
if (unmatched.length) console.warn("UNMATCHED REWRITES:", unmatched.join(" ; "));

/* ---------- 4. Workbook ---------- */
const wb = new ExcelJS.Workbook();
wb.creator = "KC MENA content pipeline";
const INK = "FF0A0A0A";
const headStyle = (ws, ncols) => {
  const r = ws.getRow(1);
  r.font = { bold: true, color: { argb: "FFFFFFFF" } };
  r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
  r.height = 22;
  r.alignment = { vertical: "middle" };
  for (let c = 1; c <= ncols; c++) r.getCell(c).border = { bottom: { style: "thin" } };
};
const STATUS = '"Not started,Drafted,In review,Client edits,Approved,In CMS"';
const INTENT = '"Informational,Commercial,Transactional,Navigational"';

/* --- Sheet 1: Section Audit --- */
const sa = wb.addWorksheet("Section Audit", { views: [{ state: "frozen", ySplit: 1 }], properties: { tabColor: { argb: INK } } });
sa.columns = [
  { header: "ID", key: "id", width: 9 },
  { header: "Site Tab", key: "tab", width: 17 },
  { header: "Page", key: "page", width: 20 },
  { header: "File", key: "file", width: 32 },
  { header: "Section", key: "section", width: 26 },
  { header: "Type", key: "type", width: 12 },
  { header: "Current Content (from delivered site)", key: "current", width: 60 },
  { header: "Rewritten copy (short/medium only — long copy in Doc)", key: "rewrite", width: 46 },
  { header: "Primary keyword", key: "kw", width: 20 },
  { header: "Secondary keywords", key: "kw2", width: 22 },
  { header: "Intent", key: "intent", width: 14 },
  { header: "AEO question(s)", key: "aeo", width: 34 },
  { header: "Status", key: "status", width: 13 },
  { header: "Client feedback", key: "feedback", width: 24 },
  { header: "Doc link", key: "doc", width: 11 },
  { header: "Notes / Source", key: "note", width: 26 },
];
for (const a of audit) sa.addRow({ ...a, status: a.status || "Not started" });
const tplOf = (page) => {
  if (["Header & Navigation", "Footer", "Contact Drawer"].includes(page)) return "00-globals.docx";
  return `${PAGES.find((p) => p.page === page)?.tpl ?? "00-globals"}.docx`;
};
for (let r = 2; r <= audit.length + 1; r++) {
  const tpl = tplOf(sa.getCell(`C${r}`).value);
  sa.getCell(`O${r}`).value = { text: tpl, hyperlink: `google-doc-templates/${tpl}` };
  sa.getCell(`O${r}`).font = { color: { argb: "FF0563C1" }, underline: true };
}
sa.autoFilter = { from: "A1", to: { row: audit.length + 1, column: 16 } };
headStyle(sa, 16);
for (let r = 2; r <= audit.length + 1; r++) {
  for (const c of ["G", "H", "L", "P"]) sa.getCell(`${c}${r}`).alignment = { wrapText: true, vertical: "top" };
  sa.getCell(`M${r}`).dataValidation = { type: "list", allowBlank: true, formulae: [STATUS] };
  sa.getCell(`K${r}`).dataValidation = { type: "list", allowBlank: true, formulae: [INTENT] };
}

/* --- Sheet 2: Page SEO --- */
const ps = wb.addWorksheet("Page SEO", { views: [{ state: "frozen", ySplit: 1 }], properties: { tabColor: { argb: "FF8B1A1A" } } });
ps.columns = [
  { header: "Page", key: "page", width: 22 },
  { header: "ID", key: "id", width: 7 },
  { header: "URL (canonical)", key: "url", width: 42 },
  { header: "Route (existing)", key: "route", width: 26 },
  { header: "Current meta title", key: "title", width: 44 },
  { header: "Current meta description", key: "desc", width: 56 },
  { header: "Current H1", key: "h1", width: 30 },
  { header: "Proposed meta title (<=60 chars)", key: "ptitle", width: 34 },
  { header: "Proposed meta description (<=155 chars)", key: "pdesc", width: 40 },
  { header: "Target keyword", key: "kw", width: 24 },
  { header: "Suggested schema", key: "schema", width: 36 },
  { header: "Voice/positioning note (from deck)", key: "voice", width: 34 },
  { header: "Status", key: "status", width: 13 },
  { header: "Doc link", key: "doc", width: 11 },
];
for (const p of PAGES) {
  const plan = PAGEPLAN[p.page] || {};
  ps.addRow({ ...p, ptitle: plan.ptitle, pdesc: plan.pdesc, kw: plan.kw, voice: plan.voice, status: plan ? "Drafted" : "Not started" });
}
for (let r = 2; r <= PAGES.length + 1; r++) {
  const tpl = `${PAGES[r - 2].tpl}.docx`;
  ps.getCell(`N${r}`).value = { text: tpl, hyperlink: `google-doc-templates/${tpl}` };
  ps.getCell(`N${r}`).font = { color: { argb: "FF0563C1" }, underline: true };
}
ps.autoFilter = { from: "A1", to: { row: PAGES.length + 1, column: 14 } };
headStyle(ps, 14);
for (let r = 2; r <= PAGES.length + 1; r++) {
  for (const c of ["E", "F", "I", "L"]) ps.getCell(`${c}${r}`).alignment = { wrapText: true, vertical: "top" };
  ps.getCell(`M${r}`).dataValidation = { type: "list", allowBlank: true, formulae: [STATUS] };
}

/* --- Sheet 3: Dashboard --- */
const dashPages = [
  ["Header & Navigation", "GLB"], ["Footer", "GLB"], ["Contact Drawer", "GLB"],
  ...PAGES.map((p) => [p.page, p.id]),
];
const db_ = wb.addWorksheet("Dashboard", { properties: { tabColor: { argb: "FF1F6E43" } } });
db_.columns = [
  { header: "Page", key: "page", width: 24 },
  { header: "ID", key: "id", width: 7 },
  { header: "Sections", width: 10 }, { header: "Drafted", width: 10 }, { header: "In review", width: 10 },
  { header: "Client edits", width: 12 }, { header: "Approved", width: 10 }, { header: "In CMS", width: 9 },
  { header: "% done", width: 9 }, { header: "Reviewer", width: 14 }, { header: "Blockers / notes", width: 40 },
];
dashPages.forEach(([page, id], i) => {
  const r = i + 2;
  db_.getRow(r).values = [page, id];
  db_.getCell(`C${r}`).value = { formula: `COUNTIF('Section Audit'!$C$2:$C$400,$A${r})` };
  for (const [col, state] of [["D", "Drafted"], ["E", "In review"], ["F", "Client edits"], ["G", "Approved"], ["H", "In CMS"]]) {
    db_.getCell(`${col}${r}`).value = { formula: `COUNTIFS('Section Audit'!$C$2:$C$400,$A${r},'Section Audit'!$M$2:$M$400,"${state}")` };
  }
  db_.getCell(`I${r}`).value = { formula: `IF(C${r}=0,0,(G${r}+H${r})/C${r})` };
  db_.getCell(`I${r}`).numFmt = "0%";
});
headStyle(db_, 11);

/* --- Sheet 4: Reference --- */
const rf = wb.addWorksheet("Reference", { properties: { tabColor: { argb: "FF666666" } } });
rf.columns = [{ width: 16 }, { width: 110 }];
const refRows = [
  ["KC MENA Content Audit — Reference", ""],
  ["", ""],
  ["STATUS LIFECYCLE (dropdown in 'Status' columns)", ""],
  ["Not started", "Row identified; no rewrite work begun."],
  ["Drafted", "SEO/AEO rewrite written (in sheet for short copy, in page Doc for long copy)."],
  ["In review", "Sent to client; awaiting feedback."],
  ["Client edits", "Client left feedback in 'Client feedback' column; revision needed."],
  ["Approved", "Client approved; ready to enter CMS."],
  ["In CMS", "Copy entered and saved in the CMS (verify /admin)."],
  ["", ""],
  ["WORKING RULES", ""],
  ["1", "One row per SECTION (granular text nodes live inside 'Current Content'). Long copy is written ONLY in the page's Google Doc; the sheet holds short/medium copy, keywords, metadata, status."],
  ["2", "Meta titles/descriptions live in the 'Page SEO' tab (short, cross-page comparable)."],
  ["3", "Client feedback goes ONLY in the 'Client feedback' column (short notes), citing the row ID."],
  ["4", "Do not edit copy in two places. Docs freeze at 'Approved'; the CMS becomes the single source of truth at 'In CMS'."],
  ["5", "Current copy in this sheet is the audit snapshot; the source tracker (KC MENA - Content Tracker.xlsx) stays untouched."],
  ["6", "DB-driven pages (News, FAQ, legal) are edited in the CMS at 'In CMS' time — pages.content JSONB / news_posts / faqs."],
  ["", ""],
  ["ID SCHEME", ""],
  ["GLB", "Header & Navigation, Footer, Contact Drawer — 00-globals.docx"],
  ["HOM", "Home — 01-home.docx"],
  ["ABU", "About Us — 02-about-us.docx"],
  ["GBZ", "Global Businesses — 03-global-businesses.docx"],
  ["LOB", "Local Business — 04-local-business.docx"],
  ["RE", "Real Estate (Investment & Asset Management) — 05-real-estate.docx"],
  ["RED", "Real Estate Development — 06-real-estate-development.docx"],
  ["FNB", "F&B — 07-fnb.docx"],
  ["NWS", "News + News article template — 08-news.docx"],
  ["FAQ", "FAQ — 09-faq.docx"],
  ["CAR", "Careers — 10-careers.docx"],
  ["CON", "Contact Us — 11-contact-us.docx"],
  ["PRC/TRM/LGN/CKP", "Privacy Policy, Terms & Conditions, Legal Notice, Cookie Policy — 12-legal.docx"],
  ["", ""],
  ["GOOGLE-DOC TEMPLATES", ""],
  ["google-doc-templates/", "13 .docx starters (one per page + globals + legal), in this folder next to the workbook. Paste one per Google Doc; keep the [ID] headings so feedback maps 1:1 to audit rows. 'Doc link' columns are pre-filled with the file path — swap for the live Google Doc URL once created."],
  ["", ""],
  ["SEO/AEO AUDIT", ""],
  ["Intent values", "Informational / Commercial / Transactional / Navigational (dropdown)."],
  ["AEO question(s)", "The People-Also-Ask / AI-Overview style question this section should answer directly. One per row where relevant."],
  ["Marketing deck", "Distilled into 'Voice/positioning note' on the Page SEO tab. Source: 2026 Company & Department Introduction (50pp, CONFIDENTIAL) + KPD Brand Guidelines — confirm which deck figures are cleared for public site use before publishing."],
  ["", ""],
  ["AEO WITHIN EXISTING UI", ""],
  ["Front-end", "Stays as-is; no new sections or modules anywhere."],
  ["FAQ", "/faq is a first-class CMS resource (/admin/faqs). AEO questions can become managed FAQ entries rendered with FAQPage JSON-LD."],
  ["Other pages", "Question-shaped H2/H3s + 40-60 word answer-first paragraphs within existing sections (driven by the 'AEO question(s)' column)."],
  ["Long-tail Q&A", "Published as News posts in the CMS, internally linked to business pages."],
];
refRows.forEach(([a, b]) => rf.addRow([a, b]));
rf.getRow(1).font = { bold: true, size: 13 };
for (let r = 2; r <= rf.rowCount; r++) {
  const a = rf.getCell(`A${r}`).value;
  if (a && !rf.getCell(`B${r}`).value) rf.getRow(r).font = { bold: true };
}
rf.getColumn(2).alignment = { wrapText: true, vertical: "top" };

fs.mkdirSync(REVIEW_DIR, { recursive: true });
await wb.xlsx.writeFile(OUT);

/* ---------- 5. Google-Doc templates (.docx, one per page) ---------- */
fs.mkdirSync(TPL_DIR, { recursive: true });
const tplGroups = [
  { file: "00-globals.docx", title: "KC MENA — Globals (Header, Footer, Contact Drawer)", pages: ["Header & Navigation", "Footer", "Contact Drawer"] },
  ...[...new Set(PAGES.map((p) => p.tpl))]
    .filter((t) => t !== "00-globals")
    .map((t) => {
      const p = PAGES.find((x) => x.tpl === t);
      return { file: `${t}.docx`, title: `KC MENA — ${p.page}`, pages: null, tpl: t };
    }),
];
let docCount = 0;
for (const g of tplGroups) {
  const rows = (g.pages
    ? audit.filter((a) => g.pages.includes(a.page))
    : audit.filter((a) => PAGES.find((p) => p.page === a.page && p.tpl === g.tpl)?.page === a.page && (g.tpl !== "12-legal" || true))
  ).filter((a) => a.type !== "Meta"); // meta titles/descriptions live in the 'Page SEO' sheet
  const P = (opts) => new Paragraph(opts);
  const body = (text) => P({ text, spacing: { after: 160, line: 276 } });
  const children = [
    P({ text: g.title, heading: HeadingLevel.TITLE, spacing: { after: 240 } }),
    P({
      children: [new TextRun({
        text: "Paste-ready starter. Keep the [ID] headings so feedback maps 1:1 to the audit sheet. Long copy is written here only; short copy also lives in KC-Content-Audit.xlsx. (Meta titles/descriptions are managed on the 'Page SEO' sheet, not here.)",
        italics: true, color: "666666",
      })],
      spacing: { after: 360 },
    }),
  ];
  let lastPage = null;
  for (const a of rows) {
    if (a.page !== lastPage) {
      children.push(P({ text: a.page, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } }));
      lastPage = a.page;
    }
    children.push(P({ text: `[${a.id}] ${a.section}`, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } }));
    for (const line of a.current.split("\n")) {
      children.push(body(line));
    }
    if (a.rewrite) {
      children.push(P({ children: [new TextRun({ text: "PROPOSED (draft):", bold: true })], spacing: { before: 200, after: 80 } }));
      for (const line of String(a.rewrite).split("\n")) {
        children.push(P({ spacing: { after: 160, line: 276 }, children: [new TextRun({ text: line, color: "8B1A1A" })] }));
      }
    }
  }
  const doc = new Document({ sections: [{ children }] });
  await Packer.toBuffer(doc).then((buf) => fs.writeFileSync(path.join(TPL_DIR, g.file), buf));
  docCount++;
}

console.log(
  `Wrote ${OUT} — Section Audit: ${audit.length} consolidated rows (${draftedRows} drafted); Page SEO: ${PAGES.length} rows; Dashboard: ${dashPages.length} pages; Doc templates: ${docCount} files in ${TPL_DIR}.`,
);
