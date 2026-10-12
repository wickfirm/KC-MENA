import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site";

/** Public pages are open to search engines and AI crawlers alike; the CMS, API and draft previews are not. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api", "/preview"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // Named explicitly so the site's stance on AI search and assistants is unambiguous.
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"], allow: "/", disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
