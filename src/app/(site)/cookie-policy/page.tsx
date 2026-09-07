import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LegalPageView from "@/components/site/LegalPageView";
import { getPageBySlug } from "@/lib/pages";

export const dynamic = "force-dynamic";

const SLUG = "cookie-policy";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SLUG);
  return {
    title: page?.seo?.title ?? `${page?.title ?? "Cookie Policy"} | Kasumigaseki MENA`,
    description: page?.seo?.description,
  };
}

export default async function CookiePolicyPage() {
  const page = await getPageBySlug(SLUG);
  if (!page) notFound();
  return <LegalPageView title={page.title} meta={page.content?.meta} body={page.content?.body} />;
}
