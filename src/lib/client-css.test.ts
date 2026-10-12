import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLIENT_PAGE_CSS, CLIENT_SITE_CSS, clientHeroBackground, extractInlineCss } from "./client-css";

const ref = (...p: string[]) => readFileSync(path.join(process.cwd(), "reference", ...p), "utf8");

describe("client reference CSS", () => {
  it("ships the delivered site.css byte for byte", () => {
    expect(CLIENT_SITE_CSS).toBe(ref("css", "site.css"));
  });

  it.each(Object.keys(CLIENT_PAGE_CSS))("ships the delivered inline <style> of %s byte for byte", (page) => {
    const html = page === "home" ? ref("index.html") : ref(page, "index.html");
    expect(CLIENT_PAGE_CSS[page as keyof typeof CLIENT_PAGE_CSS]).toBe(extractInlineCss(html));
  });

  it("covers every delivered page", () => {
    expect(Object.keys(CLIENT_PAGE_CSS).sort()).toEqual([
      "about-us", "careers", "contact-us", "cookie-policy", "f-and-b", "global-businesses", "home",
      "legal-notice", "local-business", "news", "privacy-policy", "real-estate",
      "real-estate-development", "terms-and-conditions",
    ]);
  });
});

describe("clientHeroBackground", () => {
  it("keeps the delivered hero declaration and only swaps in the CMS image", () => {
    expect(clientHeroBackground("real-estate", "/media/new hero.webp")).toEqual({
      background:
        "linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.4) 55%, rgba(10,10,10,0.82) 100%), url('/media/new hero.webp') center/cover no-repeat",
    });
  });

  it("escapes quotes in image URLs", () => {
    expect(clientHeroBackground("news", "/a'b.jpg")?.background).toContain("url('/a%27b.jpg')");
  });

  it("returns nothing when there is no image, so the delivered CSS applies untouched", () => {
    expect(clientHeroBackground("real-estate", "")).toBeUndefined();
  });
});
