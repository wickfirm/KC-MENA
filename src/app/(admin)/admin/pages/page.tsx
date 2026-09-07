import ComingSoon from "@/components/admin/ComingSoon";

export default function PagesAdmin() {
  return (
    <ComingSoon
      title="Pages"
      phase="Phase 2 — Template build-out & CMS administration"
      bullets={[
        "Structured editor for all 14 site pages (hero, content blocks, CTAs, SEO)",
        "Publish/draft workflow with automatic revision history",
        "Privacy Policy, Terms & Conditions and Legal Notice wiring (content supplied by client's legal counsel)",
      ]}
    />
  );
}
