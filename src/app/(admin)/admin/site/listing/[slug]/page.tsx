import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_LISTING_CONTENT, isListingContent, isListingSlug, LISTING_SLUGS, withListingDefaults } from "@/lib/listing-content";
import ListingEditor from "./ListingEditor";

export const dynamic = "force-dynamic";

const DESCRIPTIONS: Record<string, string> = {
  careers: "Careers page shell — hero, introduction, and the message shown when no roles are open. Job listings are managed under Jobs.",
  faq: "FAQ page shell — hero, heading, and introduction. Individual questions are managed under FAQs.",
  news: "News index shell — hero, heading, introduction, featured-video band, external insight cards, and the disclaimer.",
};

export function generateStaticParams() {
  return LISTING_SLUGS.map((slug) => ({ slug }));
}

export default async function ListingAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isListingSlug(slug)) notFound();

  const page = await getPageBySlug(slug);
  const content = withListingDefaults(slug, isListingContent(page?.content) ? page.content : DEFAULT_LISTING_CONTENT[slug]);

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Edit page: {content.hero.title}</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 20 }}>{DESCRIPTIONS[slug]}</p>
      <ListingEditor
        slug={slug}
        content={content}
        status={page?.status === "draft" ? "draft" : "published"}
        seo={{ title: page?.seo?.title, description: page?.seo?.description }}
      />
    </>
  );
}
