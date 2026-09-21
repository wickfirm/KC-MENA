import type { Metadata } from "next";
import "./about.css";
import AboutPageView from "@/components/site/AboutPageView";
import { DEFAULT_ABOUT_CONTENT, isAboutContent } from "@/lib/about-content";
import { getPageBySlug } from "@/lib/pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About Us", description: "Learn about Kasumigaseki MENA, its regional business platform, leadership, vision, and principles.", alternates: { canonical: "https://kasumigaseki.ae/about-us/" } };

export default async function AboutPage() {
  const page = await getPageBySlug("about-us");
  return <AboutPageView content={isAboutContent(page?.content) ? page.content : DEFAULT_ABOUT_CONTENT} />;
}
