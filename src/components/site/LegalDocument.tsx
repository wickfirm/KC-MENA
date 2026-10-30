import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientPageCss from "@/components/site/ClientPageCss";
import LegalPageView from "@/components/site/LegalPageView";
import JsonLd from "@/components/site/JsonLd";
import { readLegalContent, type LegalSlug } from "@/lib/legal-content";
import { getPageBySlug } from "@/lib/pages";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";

export async function legalMetadata(slug: LegalSlug): Promise<Metadata> {
  const page = await getPageBySlug(slug);
  return pageMetadata(resolvePageSeo(slug, page?.seo));
}

export default async function LegalDocument({ slug }: { slug: LegalSlug }) {
  const page = await getPageBySlug(slug);
  const content = readLegalContent(page?.content);
  if (!content) notFound();
  return (
    <>
      <ClientPageCss page={slug} />
      <LegalPageView content={content} />
      <JsonLd data={fixedPageJsonLd(slug, resolvePageSeo(slug, page?.seo))} />
    </>
  );
}
