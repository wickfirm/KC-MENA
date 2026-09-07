import ComingSoon from "@/components/admin/ComingSoon";

export default function SubmissionsAdmin() {
  return (
    <ComingSoon
      title="Submissions"
      phase="Phase 3 — Integrations (Salesforce dual-write)"
      bullets={[
        "Every contact/enquiry/career form submission stored in the CMS database",
        "Automatic dual-write to Salesforce with sync status tracking and retries",
        "Export and filtering by type, source page and sync state",
      ]}
    />
  );
}
