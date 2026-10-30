import LegalDocument, { legalMetadata } from "@/components/site/LegalDocument";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return legalMetadata("legal-notice");
}

export default function LegalNoticePage() {
  return <LegalDocument slug="legal-notice" />;
}
