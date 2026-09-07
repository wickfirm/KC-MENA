import ComingSoon from "@/components/admin/ComingSoon";

export default function ProjectsAdmin() {
  return (
    <ComingSoon
      title="Projects"
      phase="Phase 2 — Template build-out & CMS administration"
      bullets={[
        "Manage listings across Real Estate, Real Estate Development, F&B, Local and Global Businesses",
        "Sector-specific fields, image galleries and ordering",
        "Publish/draft workflow",
      ]}
    />
  );
}
