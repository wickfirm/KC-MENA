import LegalDocument, { legalMetadata } from "@/components/site/LegalDocument";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return legalMetadata("cookie-policy");
}

export default function CookiePolicyPage() {
  return <LegalDocument slug="cookie-policy" />;
}
