import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_LOCAL_BUSINESS, isLocalBusinessContent } from "@/lib/local-business-content";
import LocalBusinessPageView from "@/components/site/LocalBusinessPageView";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function LocalBusinessDraftPreview() {
  if (!await getSession()) redirect("/admin/login");
  const page = await getPageBySlug("local-business", false);
  return <LocalBusinessPageView content={isLocalBusinessContent(page?.content) ? page.content : DEFAULT_LOCAL_BUSINESS} />;
}
