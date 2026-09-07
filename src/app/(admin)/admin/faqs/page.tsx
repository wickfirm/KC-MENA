import ComingSoon from "@/components/admin/ComingSoon";

export default function FaqsAdmin() {
  return (
    <ComingSoon
      title="FAQ"
      phase="Phase 2 — Template build-out & CMS administration"
      bullets={[
        "Add, reorder and categorise questions for the new FAQ page",
        "Publish/unpublish individual entries",
        "Copywriting support included in scope",
      ]}
    />
  );
}
