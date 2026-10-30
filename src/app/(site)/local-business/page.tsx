import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { notFound } from "next/navigation";
import { isLocalBusinessContent } from "@/lib/local-business-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import LocalBusinessPageView from "@/components/site/LocalBusinessPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("local-business"); return pageMetadata(resolvePageSeo("local-business", page?.seo)); }
export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("local-business"), getPublishedProjectsBySector("local-business")]);
  if (!isLocalBusinessContent(page?.content)) notFound();
  return (
    <>
      <LocalBusinessPageView content={page.content} projects={projects} />
      <JsonLd data={fixedPageJsonLd("local-business", resolvePageSeo("local-business", page?.seo))} />
    </>
  );
}
