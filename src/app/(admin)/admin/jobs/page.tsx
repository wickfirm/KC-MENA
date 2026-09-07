import ComingSoon from "@/components/admin/ComingSoon";

export default function JobsAdmin() {
  return (
    <ComingSoon
      title="Careers"
      phase="Phase 2 — Template build-out & CMS administration"
      bullets={[
        "Create, open and close job openings",
        "Department, location and employment-type metadata",
        "Applications flow into Submissions with Salesforce dual-write",
      ]}
    />
  );
}
