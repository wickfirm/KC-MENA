import LegalDocument, { legalMetadata } from "@/components/site/LegalDocument";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return legalMetadata("privacy-policy");
}

export default function PrivacyPolicyPage() {
  return <LegalDocument slug="privacy-policy" />;
}
