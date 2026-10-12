// Canonical site identity: the single source of truth for absolute URLs used by
// metadata, the sitemap, robots.txt, llms.txt and structured data. Override
// NEXT_PUBLIC_SITE_URL only where a different host is canonical; preview
// deployments must never become canonical.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kasumigaseki.ae").replace(/\/+$/, "");

/** Stable ids so the structured data on every page points at the same entities. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Absolute URL for a root-relative path ("/news" -> "https://kasumigaseki.ae/news"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Media URLs are either already absolute (R2 / external) or root-relative. Spaces are encoded. */
export function mediaUrl(url: string): string {
  const absolute = /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
  return absolute.replace(/ /g, "%20");
}
