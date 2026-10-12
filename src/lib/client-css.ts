// The client-delivered stylesheets (reference/), rendered verbatim on the public site.
import type { CSSProperties } from "react";
import { CLIENT_HERO_BACKGROUND, type CLIENT_PAGE_CSS } from "./client-css.generated";
export { CLIENT_PAGE_CSS, CLIENT_SITE_CSS } from "./client-css.generated";

export type ClientPage = keyof typeof CLIENT_PAGE_CSS;

/**
 * The delivered hero-band `background` for a page with its image swapped for the CMS one.
 * With the delivered image this computes exactly what the reference CSS does.
 */
export function clientHeroBackground(page: ClientPage, image: string | null | undefined): CSSProperties | undefined {
  const declaration = CLIENT_HERO_BACKGROUND[page];
  if (!declaration || !image) return undefined;
  return { background: declaration.replace(/url\('[^']*'\)/, `url('${image.replace(/'/g, "%27")}')`) };
}

/** Concatenated contents of every inline <style> block in a delivered HTML page. */
export function extractInlineCss(html: string): string {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
}

/**
 * Delivered inline `style="... !important"` attributes. React inline styles cannot carry
 * `!important`, so these are emitted as equivalent rules, scoped to the page that had them.
 */
export const CLIENT_INLINE_OVERRIDES: Partial<Record<ClientPage, string>> = {
  "global-businesses":
    ".biz-platform{padding-bottom:28px !important}" +
    ".biz-band{padding-top:36px !important;padding-bottom:0 !important}" +
    ".global-map-cta{padding-top:72px !important;padding-bottom:56px !important}",
};
