# HANDOFF — Content Audit Phase (KC MENA)

Status snapshot for the next session. Written 2026-09-14. Repo: KC MENA `Front-end website`, branch `main`, last commit `1cc4619`. **Nothing in this phase is committed yet.**

## What this phase produced

Goal: audit all 14 site pages' content and rewrite it SEO/AEO-first, following the client's marketing deck (2026 Company & Department Introduction, 50pp + KPD Brand Guidelines), using the same approach as the sister project's `KPD-Content-Audit.xlsx` (`.../KPD/Front-end website/`).

### Files (all uncommitted)

| Path | What it is |
|---|---|
| `scripts/build-content-audit.mjs` | **The generator.** Parses `KC MENA - Content Tracker.xlsx` (minimal built-in xlsx reader), `public/` static HTML (titles/meta/H1), `db/seed-faqs.sql`; merges the SEO/AEO draft layer (`PAGEPLAN` + `REWRITES` constants — all proposed copy lives in this file as source); writes the full deliverable. |
| `KC-Content-Review/` | **Client deliverable folder.** `KC-Content-Audit.xlsx` + `google-doc-templates/*.docx` (13 files). Zip-ready; relative hyperlinks verified. |
| `KC-Content-Review.zip` | User-created zip for the client. |
| `AGENTS.md` | Updated: generator command added to Commands section. |
| `package.json` / lock | `cheerio` + `exceljs` added as devDependencies (saved). |

### Deliverable structure (KC-Content-Audit.xlsx)

- **Section Audit** — 110 consolidated rows, ONE ROW PER SECTION (KPD parity; text nodes merged into labeled `Current Content` blobs). Columns: ID, Site Tab, Page, File, Section, Type, Current, Rewritten copy, keywords, Intent, AEO question(s), Status, Client feedback, Doc link, Notes. Status + Intent dropdowns, autofilter, frozen header.
- **Page SEO** — 16 rows: current vs proposed meta titles (≤60) / descriptions (≤155), target keywords, suggested schema, deck-derived voice notes. All `Drafted`.
- **Dashboard** — COUNTIFS pipeline per page (Sections → Drafted → … → In CMS, % done). Ranges `$C$2:$C$400` / `$M$2:$M$400`.
- **Reference** — status lifecycle, working rules, ID scheme → docx mapping, deck provenance + confidentiality note.

Google-Doc templates: one .docx per page (`00-globals` … `12-legal`), `[ID]` headings matching audit rows 1:1, current copy + `PROPOSED (draft)` blocks in red. Meta sections excluded (metadata is managed on Page SEO). Paragraph spacing: `after:160, line:276`; headings 240–360.

ID scheme: `GLB HOM ABU GBZ LOB RE RED FNB NWS(+NWS-ART) FAQ CAR CON PRC TRM LGN CKP`.

## Commands

```bash
node scripts/build-content-audit.mjs   # regenerate workbook + templates into KC-Content-Review/
npm i --no-save docx                   # REQUIRED before rerunning (not in package.json)
npm i --no-save pdf-parse              # only for re-extracting the marketing deck PDFs
```

- `exceljs` is a saved devDep; **`docx` and `pdf-parse` are `--no-save` only** — a fresh `npm install` purges them.
- Script validates proposed titles ≤60 / descriptions ≤155 chars and **throws** if exceeded.
- **Regenerating OVERWRITES the workbook.** Once the client starts marking it up, stop regenerating; the xlsx becomes the hand-edited source of truth.

## Content state

- Page SEO: all 16 rows `Drafted`.
- Section Audit: **27/110 `Drafted`** — all page-meta rows + 12 hero/intro/anchor rewrites (answer-first 40–60 words; AEO questions on 9 rows: "What is Meydan Horizon?" etc.). Remaining 83 rows `Not started`.
- Marketing deck extract (text) lives in `%TEMP%/202604-Company-Department-Introduction-20260429-2.txt` (ephemeral); re-extract from `.../KC MENA/Marketing Collaterals/` if needed. Key facts used: TSE Prime 3498, founded 2011, $5.17bn/129 projects, Dubai $304.4M/60 units, Meydan Horizon 452,389 sq ft, 90 Dubai staff, chef Keigo Abe.
- Client review **not started**. Client email draft was written in chat only (not saved).

## Open flags (also in sheet Notes)

1. Real Estate "By The Numbers" stat pairing vs deck (US$304.4M across 60 units vs US$156.5M held 26+3) — client to confirm.
2. Careers + Contact title tags brand "Kasumigaseki Capital" not MENA.
3. Deck figures are investor-confidential — client must clear which are public-safe.
4. `/real-estate` URL vs "Investment & Asset Management" title/H1 phrasing.

## Next steps

1. Send `KC-Content-Review.zip` + email; feedback lands in `Client feedback` column citing row IDs (or Google Doc comments after templates are pasted into Docs and links swapped).
2. Draft the remaining 83 Section Audit rows (pattern: short/medium copy in sheet; long copy only in the page's Doc).
3. As pages reach `Approved`: enter copy in CMS (`/admin`). DB-driven: News (`news_posts`), FAQ (`faqs`), legal (`pages.content` JSONB). Static pages still migrate to Next routes in Phase 2.
4. Do NOT commit the deliverable folder or tracker without user instruction.
