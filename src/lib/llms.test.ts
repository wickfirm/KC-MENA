import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "./llms";
import { PAGE_SEO } from "./seo";
import { SITE_URL } from "./site";

const contact = { email: "info@example.com", phone: "+971 4 000 0000", address: ["Office 1", "Dubai, UAE"] };

describe("buildLlmsTxt", () => {
  it("opens with the company name and summary, then links every key page", () => {
    const text = buildLlmsTxt({ articles: [], faqs: [], contact });
    expect(text.startsWith("# Kasumigaseki MENA\n\n> ")).toBe(true);
    expect(text).toContain(PAGE_SEO.home.description);
    expect(text).toContain(`- [About Us](${SITE_URL}/about-us): ${PAGE_SEO["about-us"].description}`);
    expect(text).toContain(`${SITE_URL}/f-and-b`);
    expect(text).not.toContain("privacy-policy");
  });

  it("lists published news and FAQ answers when there are any", () => {
    const text = buildLlmsTxt({
      articles: [{ slug: "launch", title: "Launch", excerpt: "We launched." }],
      faqs: [{ question: "Where are you?", answer: "<p>Dubai Hills.</p>" }],
      contact,
    });
    expect(text).toContain(`## Latest news\n- [Launch](${SITE_URL}/news/launch): We launched.`);
    expect(text).toContain("### Where are you?\nDubai Hills.");
  });

  it("ends with contact details", () => {
    const text = buildLlmsTxt({ articles: [], faqs: [], contact });
    expect(text).toContain("## Contact\n- Email: info@example.com\n- Phone: +971 4 000 0000\n- Address: Office 1, Dubai, UAE");
  });
});
