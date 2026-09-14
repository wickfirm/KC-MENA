import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_ABOUT_CONTENT, isAboutContent } from "@/lib/about-content";
import AboutPageView from "@/components/site/AboutPageView";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AboutDraftPreview() {
  if (!await getSession()) redirect("/admin/login");
  const page = await getPageBySlug("about-us", false);
  return <AboutPageView content={isAboutContent(page?.content) ? page.content : DEFAULT_ABOUT_CONTENT} />;
}
