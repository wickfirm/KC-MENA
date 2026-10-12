import { query } from "@/lib/db";
import { buildLlmsTxt } from "@/lib/llms";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** /llms.txt: a plain-text map of the site for AI assistants. A database problem degrades to the fixed pages. */
export async function GET() {
  const settings = await getSiteSettings();
  let articles: { slug: string; title: string; excerpt: string | null }[] = [];
  let faqs: { question: string; answer: string }[] = [];
  try {
    [articles, faqs] = await Promise.all([
      query<{ slug: string; title: string; excerpt: string | null }>(
        `SELECT slug, title, excerpt FROM news_posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST LIMIT 10`
      ),
      query<{ question: string; answer: string }>(`SELECT question, answer FROM faqs WHERE is_published = true ORDER BY sort_order ASC, id ASC`),
    ]);
  } catch {
    // keep the fixed pages
  }
  const body = buildLlmsTxt({
    articles,
    faqs,
    contact: { email: settings.contact.email, phone: settings.contact.phone, address: settings.address.lines },
  });
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
