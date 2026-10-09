import { getPageBySlug } from "@/lib/pages";

export const LISTING_SLUGS = ["careers", "faq", "news"] as const;

export type ListingSlug = (typeof LISTING_SLUGS)[number];

export type InsightCard = { tag: string; href: string; image?: string };

export type ListingContent = {
  version: 1;
  hero: { title: string; image: string };
  eyebrow?: string;
  heading: string;
  intro: string;
  emptyMessage?: string;
  /** Careers only: copy rendered in the application form band. */
  careerForm?: { eyebrow: string; heading: string; body: string; offices: Array<{ title: string; address: string }>; consent: string; submitLabel: string };
  /** News-index only: the featured-video band. */
  featuredVideo?: { heading: string; body: string };
  /** News-index only: the three external insight cards under the feed. */
  insightCards?: InsightCard[];
  /** News-index only: the disclaimer band copy. */
  disclaimer?: string;
};

const defaults: Record<ListingSlug, ListingContent> = {
  careers: {
    version: 1,
    hero: { title: "Careers", image: "/images/office.webp" },
    eyebrow: "Opportunities",
    heading: "Build the next chapter with us.",
    intro: "We welcome thoughtful introductions from people interested in building across our regional platform.",
    emptyMessage: "There are no open roles listed today. We welcome thoughtful introductions from people interested in building across our regional platform.",
    careerForm: {
      eyebrow: "Application Form",
      heading: "Tell us where you'd fit.",
      body: "Complete the form below and a member of our team will be in touch using the details you provide.",
      offices: [{ title: "Dubai Office", address: "Dubai Hills Estate\nBusiness Park 4, Office 304-305\nDubai, UAE" }, { title: "Sales Centre", address: "Business Bay\nDubai, UAE" }],
      consent: "I consent to being contacted by Kasumigaseki regarding this application.",
      submitLabel: "Submit Application",
    },
  },
  faq: {
    version: 1,
    hero: { title: "FAQ", image: "/images/quality2.webp" },
    heading: "Frequently Asked Questions",
    intro: "Everything about Kasumigaseki MENA — our businesses, projects, and how to work with us.",
    emptyMessage: "Questions are being prepared — in the meantime, reach us at info.dubai@kasumigaseki.co.jp.",
  },
  news: {
    version: 1,
    hero: { title: "News", image: "/images/sales center b2.webp" },
    heading: "Latest News",
    intro: "Local and international news of Kasumigaseki, including external coverage and official updates from Kasumigaseki Capital.",
    featuredVideo: {
      heading: "Coming Soon",
      body: "A dedicated space for future video announcements, leadership interviews, and project updates from Kasumigaseki MENA.",
    },
    insightCards: [
      { tag: "Kasumigaseki Capital News", href: "https://kasumigaseki.co.jp/en/news/", image: "/images/city_tokyo.webp" },
      { tag: "Investor Relations Updates", href: "https://kasumigaseki.co.jp/en/ir/", image: "/images/Reception kpd.webp" },
      { tag: "Kasumigaseki Capital Global Site", href: "https://kasumigaseki.co.jp/en/", image: "/images/logistics_home.webp" },
    ],
    disclaimer:
      "The content above and in the linked materials is provided for general informational purposes only and does not constitute investment, legal, or tax advice. It should not be relied upon as the basis for any investment decision and does not represent an offer of advisory services or an offer to invest in any product, vehicle, or asset class. Any projections, estimates, forecasts, targets, or opinions expressed are subject to change without notice and may differ from views expressed by others. Certain information may be drawn from third-party sources; Kasumigaseki Capital has not independently verified such information and makes no representation as to its accuracy or completeness.",
  },
};

export const DEFAULT_LISTING_CONTENT = defaults;

export function withListingDefaults(slug: ListingSlug, content: ListingContent): ListingContent {
  return { ...defaults[slug], ...content, hero: { ...defaults[slug].hero, ...content.hero }, careerForm: content.careerForm ?? defaults[slug].careerForm };
}

export function isListingSlug(value: string): value is ListingSlug {
  return LISTING_SLUGS.includes(value as ListingSlug);
}

export function isListingContent(value: unknown): value is ListingContent {
  const content = value as Partial<ListingContent> | null;
  const cardOk = (card: unknown) => {
    const c = card as Partial<InsightCard> | null;
    return Boolean(c) && typeof c?.tag === "string" && typeof c?.href === "string" && (c?.image === undefined || typeof c?.image === "string");
  };
  return Boolean(
    content &&
      content.version === 1 &&
      typeof content.hero?.title === "string" &&
      typeof content.hero?.image === "string" &&
      (content.eyebrow === undefined || typeof content.eyebrow === "string") &&
      typeof content.heading === "string" &&
      typeof content.intro === "string" &&
      (content.emptyMessage === undefined || typeof content.emptyMessage === "string") &&
      (content.careerForm === undefined || (typeof content.careerForm?.eyebrow === "string" && typeof content.careerForm?.heading === "string" && typeof content.careerForm?.body === "string" && typeof content.careerForm?.consent === "string" && typeof content.careerForm?.submitLabel === "string" && Array.isArray(content.careerForm.offices) && content.careerForm.offices.every((office) => typeof office?.title === "string" && typeof office?.address === "string"))) &&
      (content.featuredVideo === undefined || (typeof content.featuredVideo?.heading === "string" && typeof content.featuredVideo?.body === "string")) &&
      (content.insightCards === undefined || (Array.isArray(content.insightCards) && content.insightCards.every(cardOk))) &&
      (content.disclaimer === undefined || typeof content.disclaimer === "string")
  );
}

/**
 * Listing-page content for careers / faq / news index. Falls back to the
 * in-code defaults when the row is missing or the database is unavailable.
 */
export async function getListingContent(slug: ListingSlug): Promise<ListingContent> {
  try {
    const page = await getPageBySlug(slug);
    if (!isListingContent(page?.content)) return defaults[slug];
    return withListingDefaults(slug, page.content);
  } catch {
    return defaults[slug];
  }
}
