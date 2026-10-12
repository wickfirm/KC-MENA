import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX,
  PAGE_SEO,
  TITLE_MAX,
  breadcrumbJsonLd,
  clampDescription,
  faqPageJsonLd,
  newsArticleJsonLd,
  pageMetadata,
  resolvePageSeo,
} from "./seo";
import { SITE_URL, absoluteUrl } from "./site";

describe("absoluteUrl", () => {
  it("joins root-relative paths to the canonical host", () => {
    expect(absoluteUrl("/about-us")).toBe(`${SITE_URL}/about-us`);
    expect(absoluteUrl("news")).toBe(`${SITE_URL}/news`);
    expect(absoluteUrl("/")).toBe(`${SITE_URL}/`);
  });
});

describe("clampDescription", () => {
  it("leaves short text alone and collapses whitespace", () => {
    expect(clampDescription("  One   line.\n Two. ")).toBe("One line. Two.");
  });

  it("cuts long text to the limit, preferring a sentence end", () => {
    const text = `${"A".repeat(120)}. ${"B".repeat(80)}.`;
    const out = clampDescription(text);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out.endsWith(".")).toBe(true);
  });

  it("falls back to a word boundary with an ellipsis", () => {
    const out = clampDescription("word ".repeat(60));
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns an empty string for empty input", () => {
    expect(clampDescription(undefined)).toBe("");
  });
});

describe("PAGE_SEO copy", () => {
  it("keeps every title and description within what search results show", () => {
    for (const [key, page] of Object.entries(PAGE_SEO)) {
      expect(page.title.length, `${key} title`).toBeLessThanOrEqual(TITLE_MAX);
      expect(page.description.length, `${key} description`).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(page.description.length, `${key} description`).toBeGreaterThanOrEqual(70);
      expect(page.path.startsWith("/"), `${key} path`).toBe(true);
    }
  });

  it("gives every page a unique title and description", () => {
    const pages = Object.values(PAGE_SEO);
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
  });
});

describe("resolvePageSeo", () => {
  it("uses the curated copy when the CMS fields are empty", () => {
    expect(resolvePageSeo("about-us", { title: "  ", description: "" })).toMatchObject({
      title: PAGE_SEO["about-us"].title,
      description: PAGE_SEO["about-us"].description,
    });
    expect(resolvePageSeo("about-us", null).title).toBe(PAGE_SEO["about-us"].title);
  });

  it("lets editors override each field separately from the CMS", () => {
    const seo = resolvePageSeo("about-us", { title: "Custom title" });
    expect(seo.title).toBe("Custom title");
    expect(seo.description).toBe(PAGE_SEO["about-us"].description);
  });

  it("ignores the old placeholder values left in the home page row", () => {
    const seo = resolvePageSeo("home", {
      title: "Kasumigaseki MENA",
      description: "Kasumigaseki MENA is a regional development, investment, and operating platform across the GCC and beyond.",
    });
    expect(seo.title).toBe(PAGE_SEO.home.title);
    expect(seo.description).toBe(PAGE_SEO.home.description);
  });
});

describe("pageMetadata", () => {
  it("sets an absolute title, canonical link and social cards", () => {
    const meta = pageMetadata({ title: "T", description: "D", path: "/contact-us" });
    expect(meta.title).toEqual({ absolute: "T" });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/contact-us`);
    expect(meta.openGraph).toMatchObject({ url: `${SITE_URL}/contact-us`, title: "T", description: "D", siteName: "Kasumigaseki MENA" });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", title: "T" });
  });

  it("uses the page's own image when given, as an absolute URL", () => {
    const meta = pageMetadata({ title: "T", description: "D", path: "/news/x", image: "/images/a.webp", type: "article" });
    expect(JSON.stringify(meta.openGraph)).toContain(`${SITE_URL}/images/a.webp`);
    expect(meta.openGraph).toMatchObject({ type: "article" });
  });
});

describe("structured data", () => {
  it("numbers breadcrumb items and makes their URLs absolute", () => {
    const ld = breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "News", path: "/news" }]);
    expect(ld.itemListElement[1]).toEqual({ "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` });
  });

  it("describes a news post as a NewsArticle published by the organisation", () => {
    const ld = newsArticleJsonLd({ slug: "a", title: "Hello", excerpt: "Short", cover_image: "https://cdn.example/x.jpg", published_at: "2026-10-01T00:00:00Z" });
    expect(ld).toMatchObject({
      "@type": "NewsArticle",
      headline: "Hello",
      url: `${SITE_URL}/news/a`,
      image: ["https://cdn.example/x.jpg"],
      datePublished: "2026-10-01T00:00:00.000Z",
    });
    expect(ld.publisher).toEqual({ "@id": `${SITE_URL}/#organization` });
  });

  it("strips markup from FAQ answers", () => {
    const ld = faqPageJsonLd([{ question: "Q?", answer: "<p>Yes &amp; no</p>" }]);
    expect(ld.mainEntity[0]).toEqual({ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "Yes & no" } });
  });
});
