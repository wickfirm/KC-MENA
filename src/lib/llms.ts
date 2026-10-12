import { PAGE_SEO, SITE_NAME, clampDescription, plainText, type PageKey } from "./seo";
import { absoluteUrl } from "./site";

type Article = { slug: string; title: string; excerpt?: string | null };
type Faq = { question: string; answer: string };
type Contact = { email: string; phone: string; address: string[] };

const KEY_PAGES: PageKey[] = ["about-us", "local-business", "real-estate-development", "real-estate", "f-and-b", "global-businesses", "news", "faq", "careers", "contact-us"];

/**
 * The /llms.txt document (llmstxt.org): a short plain-text guide to the site for AI assistants and answer
 * engines. Every line comes from the site's own copy, so it stays in step with the CMS.
 */
export function buildLlmsTxt(input: { articles: Article[]; faqs: Faq[]; contact: Contact }): string {
  const link = (label: string, path: string, text: string) => `- [${label}](${absoluteUrl(path)}): ${text}`;
  const parts: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${PAGE_SEO.home.description}`,
    "",
    "Kasumigaseki MENA is based in Dubai, United Arab Emirates. Its parent company, Kasumigaseki Capital, is headquartered in Tokyo and operates logistics, hotel and healthcare businesses worldwide.",
    "",
    "## Key pages",
    ...KEY_PAGES.map((key) => link(PAGE_SEO[key].name, PAGE_SEO[key].path, PAGE_SEO[key].description)),
  ];
  if (input.articles.length) {
    parts.push("", "## Latest news", ...input.articles.map((article) => link(article.title, `/news/${article.slug}`, clampDescription(article.excerpt) || article.title)));
  }
  if (input.faqs.length) {
    parts.push("", "## Frequently asked questions");
    for (const faq of input.faqs) parts.push("", `### ${faq.question}`, plainText(faq.answer));
  }
  parts.push("", "## Contact", `- Email: ${input.contact.email}`, `- Phone: ${input.contact.phone}`, `- Address: ${input.contact.address.join(", ")}`, "");
  return parts.join("\n");
}
