import ComingSoon from "@/components/admin/ComingSoon";

export default function RssAdmin() {
  return (
    <ComingSoon
      title="RSS Pipeline"
      phase="Phase 3 — Integrations (RSS filter/approval pipeline)"
      bullets={[
        "Register and activate RSS sources",
        "Automatic ingestion of feed items into a review queue",
        "Approve → becomes a News draft; Reject → removed from queue",
      ]}
    />
  );
}
