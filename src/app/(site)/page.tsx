import type { Metadata } from "next";
import HomePageView from "@/components/site/HomePageView";
import { DEFAULT_HOME_CONTENT } from "@/lib/home-content";
import { getPageBySlug } from "@/lib/pages";
import { validateModuleDocument, type ModuleDocument } from "@/lib/content-modules";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kasumigaseki MENA",
  description: "Kasumigaseki MENA is a regional development, investment, and operating platform across the GCC and beyond.",
  alternates: { canonical: "https://kasumigaseki.ae/" },
};

export default async function HomePage() {
  const page = await getPageBySlug("home");
  const content = page?.content;
  const document = validateModuleDocument(content).length === 0 ? content as ModuleDocument : DEFAULT_HOME_CONTENT;
  return <HomePageView document={document} />;
}
