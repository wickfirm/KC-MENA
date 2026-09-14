/**
 * Builds "KC MENA - Content Tracker.xlsx" — one sheet (tab) per page of the
 * delivered static site in /public, listing the current content (headings,
 * paragraphs, stats, links, buttons, images, form fields…) with empty
 * "New Content" / "Notes" columns for the copy review.
 *
 * Run from the repo root:  node scripts/build-content-tracker.mjs
 * Requires devDependencies: cheerio, exceljs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as cheerio from "cheerio";
import ExcelJS from "exceljs";

// ---------------------------------------------------------------------------
// Page inventory (folder in /public → friendly tab name)
// ---------------------------------------------------------------------------
const PAGES = [
  { slug: "index", label: "Home" },
  { slug: "about-us", label: "About Us" },
  { slug: "global-businesses", label: "Global Businesses" },
  { slug: "local-business", label: "Local Business" },
  { slug: "real-estate", label: "Real Estate" },
  { slug: "real-estate-development", label: "Real Estate Development" },
  { slug: "f-and-b", label: "F&B" },
  { slug: "news", label: "News" },
  { slug: "careers", label: "Careers" },
  { slug: "contact-us", label: "Contact Us" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-and-conditions", label: "Terms & Conditions" },
  { slug: "legal-notice", label: "Legal Notice" },
  { slug: "cookie-policy", label: "Cookie Policy" },
];

// ── workbook columns ──
const HEADERS = ["#", "Section", "Type", "Current Content", "Details", "New Content", "Notes"];
const COLS = [5, 30, 18, 85, 45, 60, 35];

// ── helpers ──
const clean = (t) => (t ?? "").replace(/\s+/g, " ").trim();
const cleanLabel = (t) =>
  repairMoji(t)
    .replace(/<!--|-->/g, "")
    .replace(/[^\x20-\x7E]+/g, " — ")
    .replace(/\s+/g, " ")
    .trim();
const stripArrows = (t) => t.replace(/[\u2190-\u21FF\u00D7\u203A\u00BB]/g, "").replace(/\s+/g, " ").trim();

// Tags whose text fully covers their inline children (no need to emit children separately)
const COVERING = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "figcaption", "blockquote",
  "button", "label", "th", "td", "dt", "dd", "legend", "caption", "a",
]);
// Elements removed entirely (site chrome / non-content)
const CHROME = [
  "script", "style", "noscript", "template", "header", "footer", "svg",
  ".contact-backdrop", ".contact-drawer", ".nav-toggle", ".site-logo", "iframe",
  ".media-lb", // hidden media lightbox overlay (display:none) — UI chrome, not content
];

// ---------------------------------------------------------------------------
// Mojibake repair.
// The delivered HTML files are double-encoded: original UTF-8 was decoded as
// Windows-1252 and re-saved as UTF-8, so em dashes render as "â€”", arrows as
// "â†—", etc. We reverse that ONLY for text that decodes cleanly back to UTF-8
// (fatal-flag decode protects legitimate text from being touched).
// ---------------------------------------------------------------------------
const cp1252 = new TextDecoder("windows-1252");
const cp1252ToByte = new Map();
for (let b = 0; b < 256; b++) cp1252ToByte.set(cp1252.decode(Uint8Array.of(b)), b);
const utf8Fatal = new TextDecoder("utf-8", { fatal: true });
function repairMoji(s) {
  if (!s || !/\u00C3|\u00E2/.test(s)) return s; // fast path: no mojibake starters
  const bytes = Uint8Array.from([...s].map((ch) => cp1252ToByte.get(ch) ?? 0x00ff));
  try {
    return utf8Fatal.decode(bytes);
  } catch {
    return s; // not actually mojibake — leave untouched
  }
}


function labelFor(el, $, labelMap) {
  let lbl = labelMap.get(el[0]) ?? "";
  if (lbl) return lbl;
  const h = el.closest("h2,h3,h4,h5").first();
  if (h.length) return clean(h.text());
  return "";
}

function formLabel($, el) {
  const id = el.attr("id");
  if (id) {
    const l = $(`label[for="${id}"]`).first();
    if (l.length) return clean(l.text());
  }
  const wrap = el.closest(".form-field, .form-row, .consent, label").first();
  if (wrap.length) {
    const l = wrap.find("label").first();
    if (l.length) return clean(l.text());
  }
  return clean(el.attr("placeholder") ?? el.attr("name") ?? "");
}

function directText($, el) {
  const clone = el.clone();
  clone.find("br").replaceWith(" "); // keep line breaks as spaces (addresses, legal meta)
  clone.find("*").remove(); // keep only direct text nodes
  return clean(clone.text());
}

function hasCoveringAncestor($, el) {
  return el.parents().toArray().some((n) => COVERING.has(n.tagName));
}

function typeFor($, el) {
  const cls = (el.attr("class") ?? "").split(/\s+/);
  if (el.is("h1")) return "Page title (H1)";
  if (/^h[2-6]$/.test(el[0].tagName)) return `Heading (${el[0].tagName.toUpperCase()})`;
  if (el.is("p")) return "Paragraph";
  if (el.is("li")) return "Bullet";
  if (el.is("a")) return "Link";
  if (el.is("button")) return "Button";
  if (el.is("img")) return "Image";
  if (el.is("video")) return "Video";
  if (el.is("time")) return "Date";
  if (el.is("th,td")) return "Table cell";
  if (el.is("dt")) return "Term";
  if (el.is("dd")) return "Definition";
  if (el.is("figcaption")) return "Caption";
  if (el.is("blockquote")) return "Quote";
  if (el.is("strong,b")) return "Bold text";
  if (el.is("span") && cls.includes("eyebrow")) return "Kicker";
  if (el.closest(".about-stat, .stat, [class*=stat]").length) return "Stat";
  return "Text";
}

/**
 * Walk the (chrome-stripped) body in document order and emit content rows.
 */
function extractRows($) {
  const rows = [];
  // Section labels from HTML comments (e.g. <!-- HERO -->), assigned
  // in document order to every subsequent element until the next comment.
  const labelMap = new WeakMap();
  let label = "";
  (function walk(node) {
    if (!node) return;
    if (node.nodeType === 8) {
      const t = cleanLabel(node.data);
      if (t) label = t;
      return;
    }
    if (node.nodeType !== 1) return;
    labelMap.set(node, label);
    for (const c of node.childNodes) walk(c);
  })($("body")[0]);

  const emit = (section, type, content, details = "") => {
    if (!content) return;
    rows.push({ section, type, content: repairMoji(content), details: repairMoji(details) });
  };

  function walkEl(el) {
    const tag = el[0].tagName;
    const section = labelFor(el, $, labelMap);
    const cls = (el.attr("class") ?? "").split(/\s+/);

    // ---- media ----
    if (el.is("img")) {
      const src = el.attr("src") ?? "";
      const alt = el.attr("alt") ?? "";
      const deco = el.attr("aria-hidden") === "true" ? "decorative · " : "";
      emit(section, "Image", alt || "(no alt)", deco + src);
      return;
    }
    if (el.is("video")) {
      const src = el.find("source").first().attr("src") ?? "";
      const poster = el.attr("poster") ?? "";
      emit(section, "Video", "Hero / background video", `src: ${src}${poster ? ` · poster: ${poster}` : ""}`);
      return;
    }
    if (tag === "source") return;

    // ---- form fields ----
    if (el.is("input,select,textarea")) {
      if (el.attr("type") === "hidden") return;
      if (el.is("input[type=submit],input[type=button]")) {
        emit(section, "Button", clean(el.attr("value") ?? "Submit"), `input type="${el.attr("type")}"`);
        return;
      }
      const label = formLabel($, el);
      const ph = el.attr("placeholder");
      const req = el.attr("required") !== undefined ? " · required" : "";
      let details = `${el[0].tagName} · name="${el.attr("name") ?? ""}" · type="${el.attr("type") ?? ""}"${req}`;
      if (el.is("select")) {
        const opts = el.find("option").toArray().map((o) => {
          const o$ = $(o);
          return (o$.attr("selected") !== undefined ? "* " : "") + clean(o$.text());
        });
        details += " · options: " + opts.join(" | ");
      } else if (el.attr("accept")) {
        details += ` · accept="${el.attr("accept")}"`;
      }
      emit(section, "Form field", label + (ph ? ` — placeholder: "${ph}"` : ""), details);
      return;
    }

    // chrome / hidden
    if (CHROME.includes(tag)) return;
    if (el.attr("aria-hidden") === "true" && !el.is("span,div")) return;

    // ---- links (standalone only — text otherwise covered by parent) ----
    if (el.is("a")) {
      if (hasCoveringAncestor($, el)) return;
      let text = stripArrows(clean(el.text()));
      if (!text) return;
      emit(section, "Link", text, el.attr("href") ?? "");
      return;
    }

    // ---- inline emphasis (strong/b/em/span/time…) outside covering tags ----
    if (el.is("strong,b,em,i,span,time,mark,sub,sup")) {
      if (hasCoveringAncestor($, el)) return;
      const text = directText($, el);
      if (!text) return;
      if (el.is("time")) emit(section, "Date", text, "");
      else emit(section, typeFor($, el), text, "");
      return;
    }

    // ---- leaf content tags ----
    if (el.is("p,li,h1,h2,h3,h4,h5,h6,figcaption,blockquote,dt,dd,th,td,legend,caption")) {
      if (el.is("label") && el.attr("for")) return; // label handled by its field
      emit(section, typeFor($, el), clean(el.text()), "");
      return;
    }
    if (el.is("button")) {
      emit(section, "Button", stripArrows(clean(el.text())), `type="${el.attr("type") ?? "button"}"`);
      return;
    }

    // ---- containers: emit direct text (if any) and recurse ----
    if (el.is("div,section,span,article,aside,figure,ul,ol,table,thead,tbody,tr,fieldset,form,main")) {
      const text = directText($, el);
      if (text && !/^[\W_]+$/.test(text)) emit(section, typeFor($, el), text, "");
      for (const c of el.children().toArray()) walkEl($(c));
    }
  }

  for (const c of $("body").children().toArray()) walkEl($(c));

  // de-dup adjacent identical rows (defensive)
  return rows.filter((r, i) => i === 0 || JSON.stringify(r) !== JSON.stringify(rows[i - 1]));
}

// ---------------------------------------------------------------------------
// Workbook assembly
// ---------------------------------------------------------------------------
const wb = new ExcelJS.Workbook();
wb.creator = "KC MENA build script";
wb.created = new Date();

const DARK = "FF0A0A0A";
const LIGHT = "FFF5F5F5";

function styleSheet(ws, headerText) {
  ws.mergeCells(1, 1, 1, HEADERS.length);
  const title = ws.getCell(1, 1);
  title.value = headerText;
  title.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  title.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(1).height = 24;

  HEADERS.forEach((h, i) => {
    const c = ws.getCell(2, i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
    c.alignment = { vertical: "middle" };
  });
  ws.getRow(2).height = 20;
  ws.views = [{ state: "frozen", ySplit: 2 }];
  HEADERS.forEach((_, i) => {
    ws.getColumn(i + 1).width = COLS[i];
    ws.getColumn(i + 1).alignment = { vertical: "top", wrapText: true };
  });
}

// ── Overview sheet ──
{
  const ws = wb.addWorksheet("Overview", { properties: { tabColor: { argb: DARK } } });
  const OV = ["#", "Page", "URL", "Status on site", "Notes"];
  ws.mergeCells(1, 1, 1, 5);
  const t = ws.getCell(1, 1);
  t.value = "KC MENA — Site Content Tracker · Source: delivered static site (public/)";
  t.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  ws.getRow(1).height = 24;

  ws.mergeCells(2, 1, 2, 5);
  ws.getCell(2, 1).value =
    "How to use: each page has its own tab below. 'Current Content' holds the text as shipped;\n" +
    "write the new version in 'New Content' and use 'Notes' for instructions. Paths under Details are relative to /public.\n" +
    "Pages already rebuilt as Next.js routes (news, privacy-policy, terms-and-conditions, cookie-policy, legal-notice)\n" +
    "render identical content from the CMS database; /faq is a new build and has no static page here.";
  ws.getCell(2, 1).alignment = { wrapText: true, vertical: "top" };
  ws.getRow(2).height = 64;

  OV.forEach((h, i) => {
    const c = ws.getCell(3, i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  });
  ws.getRow(3).height = 18;
  ws.views = [{ state: "frozen", ySplit: 3 }];
  [5, 30, 34, 24, 70].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
    ws.getColumn(i + 1).alignment = { vertical: "top", wrapText: true };
  });

  const MIGRATED = new Set(["news", "privacy-policy", "terms-and-conditions", "cookie-policy", "legal-notice"]);
  PAGES.forEach((p, i) => {
    const url = p.slug === "index" ? "/" : `/${p.slug}/`;
    ws.addRow([
      i + 1,
      p.label,
      `https://kasumigaseki.ae${url}`,
      MIGRATED.has(p.slug) ? "Next.js route + CMS DB" : "Static HTML (via rewrite)",
      MIGRATED.has(p.slug) ? "Content identical to the static page at migration time (seeded from it)." : "Pending Phase 2 migration.",
    ]);
  });
}

// ── Page sheets ──
for (const page of PAGES) {
  const file = page.slug === "index" ? join("public", "index.html") : join("public", page.slug, "index.html");
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    console.error(`!! missing ${file} — skipping`);
    continue;
  }
  const $ = cheerio.load(html);

  // strip chrome
  $(CHROME.join(",")).remove();

  const title = clean($("title").text());
  const canonical = $('link[rel="canonical"]').attr("href") ?? "";
  const desc = clean($('meta[name="description"]').attr("content") ?? "");

  const rows = extractRows($);
  const url = page.slug === "index" ? "/" : `/${page.slug}/`;

  const ws = wb.addWorksheet(page.label, { properties: { tabColor: { argb: DARK } } });
  styleSheet(ws, `${page.label} — ${url}  (${title})`);

  let n = 2;
  if (desc) ws.addRow([1, "Page meta", "Meta description", desc, "", "", ""]);
  if (canonical) ws.addRow([n++, "Page meta", "Canonical URL", canonical, "", "", ""]);

  const sectionFill = {};
  rows.forEach((r, i) => {
    const cur = ws.addRow([i + 1, r.section, r.type, r.content, r.details, "", ""]);
    // banding by section
    if (r.section && !(r.section in sectionFill)) sectionFill[r.section] = Object.keys(sectionFill).length % 2 === 1;
    if (sectionFill[r.section]) {
      cur.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } };
    }
  });

  console.log(`${page.label.padEnd(24)} ${String(rows.length).padStart(4)} rows`);
}

const out = join(process.cwd(), "KC MENA - Content Tracker.xlsx");
await wb.xlsx.writeFile(out);
console.log(`\n✔ Wrote ${out} (${wb.worksheets.length} sheets)`);