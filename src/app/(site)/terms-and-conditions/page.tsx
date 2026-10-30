import LegalDocument, { legalMetadata } from "@/components/site/LegalDocument";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return legalMetadata("terms-and-conditions");
}

export default function TermsPage() {
  return <LegalDocument slug="terms-and-conditions" />;
}
