import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NewsArticleView from "./NewsArticleView";

/**
 * The public /news/[slug] page and the admin draft preview share this one component, so a layout change
 * shows up in both. These assertions pin the structure the delivered design's CSS depends on.
 */
const post = {
  title: "Quarterly update",
  excerpt: "A short summary.",
  body: "First paragraph.\n\nSecond paragraph.",
  cover_image: "/images/cover.jpg",
  category: "Insights",
  published_at: "2026-10-11T08:00:00.000Z",
};

describe("NewsArticleView", () => {
  const html = renderToStaticMarkup(<NewsArticleView post={post} />);

  it("renders the hero, article and disclaimer sections in order", () => {
    const hero = html.indexOf('class="hero-band"');
    const article = html.indexOf('class="article-body"');
    const disclaimer = html.indexOf('class="section disclaimer"');
    expect(hero).toBeGreaterThan(-1);
    expect(article).toBeGreaterThan(hero);
    expect(disclaimer).toBeGreaterThan(article);
  });

  it("shows the post content", () => {
    expect(html).toContain("<h1");
    expect(html).toContain("Quarterly update");
    expect(html).toContain("A short summary.");
    expect(html).toContain("<p>First paragraph.</p>");
    expect(html).toContain("<p>Second paragraph.</p>");
    expect(html).toContain("Insights");
    expect(html).toContain("11 October 2026");
    expect(html).toContain("url(&#x27;/images/cover.jpg&#x27;) center/cover no-repeat");
    expect(html).toContain("Back to News");
  });

  it("falls back to the default hero image and category", () => {
    const fallback = renderToStaticMarkup(<NewsArticleView post={{ ...post, cover_image: null, category: null, published_at: null }} />);
    expect(fallback).toContain("/images/city_tokyo.webp");
    expect(fallback).toContain(">News</span>");
    expect(fallback).not.toContain("October");
  });
});
