import type { Metadata } from "next";
import "./home.css";
import HomePageView from "@/components/site/HomePageView";
import { normalizeHomeContent } from "@/lib/home-content";
import { getPageBySlug } from "@/lib/pages";

export const dynamic = "force-dynamic";

const DEFAULT_SEO = {
  title: "Kasumigaseki MENA | Development, Investment & Operations Across the GCC",
  description: "Kasumigaseki MENA is the regional subsidiary of Kasumigaseki Capital, headquartered in Tokyo, building across Development, Investment & Asset Management, and Food & Beverage.",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("home");
  const seo = page?.seo;
  const title = seo?.title && seo.title !== "Kasumigaseki MENA" ? seo.title : DEFAULT_SEO.title;
  const description = seo?.description && seo.description !== "Kasumigaseki MENA is a regional development, investment, and operating platform across the GCC and beyond." ? seo.description : DEFAULT_SEO.description;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://kasumigaseki.ae/" },
    openGraph: { title, description, url: "https://kasumigaseki.ae/" },
    twitter: { title, description },
  };
}

export default async function HomePage() {
  const page = await getPageBySlug("home");
  const document = normalizeHomeContent(page?.content);
  return <HomePageView document={document} />;
}
