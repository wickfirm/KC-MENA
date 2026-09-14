import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_LOCAL_BUSINESS, isLocalBusinessContent } from "@/lib/local-business-content";
import LocalBusinessPageView from "@/components/site/LocalBusinessPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("local-business"); return { title: page?.seo?.title || "Local Business", description: page?.seo?.description, alternates: { canonical: "https://kasumigaseki.ae/local-business/" } }; }
export default async function Page() { const page = await getPageBySlug("local-business"); return <LocalBusinessPageView content={isLocalBusinessContent(page?.content) ? page.content : DEFAULT_LOCAL_BUSINESS} />; }
