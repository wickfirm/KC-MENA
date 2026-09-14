# KC MENA Phase 2 — Modular Reset Plan

## Decision

Retain Next.js on Vercel, Supabase PostgreSQL, the delivered `public/` site, and the useful CMS foundations.  Reset the Phase 2 implementation so the supplied HTML remains the visual and layout source of truth, while the CMS provides constrained, purpose-built editing controls.

## Current-state findings

- The delivered static site is self-contained: each of its 14 HTML files contains a copied header and footer.
- Migrated Next.js public routes correctly use shared `SiteHeader`, `SiteFooter`, and `ContactDrawer`, but static fallback pages still use their duplicated shell.
- Five sector routes share one generic renderer. This changes the supplied template designs into a generic hero / metric / section / CTA pattern.
- Editors expose HTML or JSON. That is an implementation detail, not a client-friendly content workflow.
- The site route-group layout currently duplicates the root document structure. Consolidate document ownership in the root layout before further public-page migration.

## Target architecture

```
Root document layout
  Site shell: shared header, footer, contact drawer, global SEO defaults
    Template: Home
    Template: About
    Template: Business overview
    Template: Business detail
    Template: News and article
    Template: Legal
  Admin shell: authentication and CMS console

Templates compose approved modules:
  Hero | Intro | Image + copy | Metrics | Feature cards | Project collection
  Logo / link grid | Rich text | FAQ | CTA | Legal content
```

Each template owns its allowed module sequence and styling. Modules have typed content fields and validation. Editors see labels, text fields, image pickers, links, ordering controls, draft/preview/publish actions, and SEO fields — never raw HTML or JSON for normal editing.

## Migration order

1. **Foundation** — one valid root document layout; shared site shell; design tokens; no visual change.
2. **Reference template** — rebuild the supplied Home template section by section, with visual and responsive comparison against `public/index.html`.
3. **CMS experience** — create the module schemas and form controls required by Home; add preview and revision handling.
4. **Template families** — migrate About, Local Business, Global Business, Real Estate, Development, and F&B according to their actual supplied layouts. Do not route them through a universal business-page renderer.
5. **Content types** — complete News, Projects, Careers, FAQ, and legal content as distinct editorial workflows.
6. **Operational work** — forms/Salesforce, RSS, content loading, QA, accessibility, CMS training, and go-live.

The existing static rewrite remains only as a temporary page-by-page fallback. A route is migrated when it has visual parity, a usable editor, responsive checks, and a published-content fallback.

## Acceptance criteria for every migrated page

- Uses the shared site shell exactly once.
- Matches the supplied desktop and mobile design unless a deliberate approved change exists.
- Has no raw HTML/JSON requirement for standard client edits.
- Validates content and media at the module boundary.
- Supports draft, preview, publish, and revision recovery.
- Degrades gracefully if the database is temporarily unavailable.
- Meets semantic HTML, keyboard, image-alt, metadata, canonical, and performance checks.

## Explicit non-goals until the core templates are approved

- Salesforce dual-write
- RSS ingestion and moderation
- More generic page-builder fields
- Premature admin sections or workflow polish
