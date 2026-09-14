import type { Metadata } from "next";
import { redirect } from "next/navigation";
import HomePageView from "@/components/site/HomePageView";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_HOME_CONTENT } from "@/lib/home-content";
import { validateModuleDocument, type ModuleDocument } from "@/lib/content-modules";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Home preview", robots: { index: false, follow: false } };

export default async function HomePreviewPage() {
  if (!await getSession()) redirect("/admin/login?next=/preview/home");
  const page = await getPageBySlug("home", false);
  const document = validateModuleDocument(page?.content).length === 0 ? page?.content as ModuleDocument : DEFAULT_HOME_CONTENT;
  return <HomePageView document={document} />;
}
