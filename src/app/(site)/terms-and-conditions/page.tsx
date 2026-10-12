import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ClientPageCss from "@/components/site/ClientPageCss";
import LegalPageView from "@/components/site/LegalPageView";
import JsonLd from "@/components/site/JsonLd";
import { getPageBySlug } from "@/lib/pages";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SLUG = "terms-and-conditions" as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SLUG);
  return pageMetadata(resolvePageSeo(SLUG, page?.seo));
}

export default async function TermsPage() {
  const page = await getPageBySlug(SLUG);
  if (!page) notFound();
  return (
    <><ClientPageCss page="terms-and-conditions" />
      <LegalPageView title={page.title} meta={page.content?.meta} body={page.content?.body} />
      <JsonLd data={fixedPageJsonLd(SLUG, resolvePageSeo(SLUG, page.seo))} />
    </>
  );
}
