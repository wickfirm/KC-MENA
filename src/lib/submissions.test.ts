import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ query: vi.fn() }));

import { CV_MAX_BYTES, cvObjectKey, cvProblem } from "./submissions";
import { buildLeadPayload } from "./salesforce";

describe("cvProblem", () => {
  const ok = { name: "Jane Doe CV.pdf", size: 120_000, type: "application/pdf" };
  it("accepts PDF and Word files", () => {
    expect(cvProblem(ok)).toBeNull();
    expect(cvProblem({ name: "cv.docx", size: 1000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBeNull();
    expect(cvProblem({ name: "cv.doc", size: 1000, type: "" })).toBeNull();
  });
  it("rejects empty, oversized and wrong-type files", () => {
    expect(cvProblem({ ...ok, size: 0 })).toMatch(/empty/);
    expect(cvProblem({ ...ok, size: CV_MAX_BYTES + 1 })).toMatch(/4 MB/);
    expect(cvProblem({ name: "evil.exe", size: 10, type: "application/pdf" })).toMatch(/PDF or Word/);
    expect(cvProblem({ name: "cv.pdf", size: 10, type: "text/html" })).toMatch(/PDF or Word/);
  });
});

describe("cvObjectKey", () => {
  it("builds a dated, sanitised key", () => {
    expect(cvObjectKey("Jane  Doe's CV (final).PDF", "uuid-1", new Date("2026-10-11T00:00:00Z"))).toBe("cv/2026/10/uuid-1-jane-doe-s-cv-final-.pdf");
  });
  it("never contains path separators from the file name", () => {
    expect(cvObjectKey("../../etc/passwd.pdf", "u", new Date("2026-01-01T00:00:00Z"))).not.toContain("..");
  });
});

describe("buildLeadPayload", () => {
  it("splits first/last name and includes context in the description", () => {
    const p = buildLeadPayload({ name: "Jane Q Doe", email: "j@x.co", phone: "+971", type: "enquiry", subject: "Hello", message: "Body", source: "contact-us" });
    expect(p).toMatchObject({ FirstName: "Jane", LastName: "Q Doe", Email: "j@x.co", Phone: "+971", LeadSource: "Web" });
    expect(p.Description).toBe("Type: enquiry\nSubject: Hello\nSource: contact-us\nBody");
  });
  it("handles a single-word name and omits empty optional fields", () => {
    const p = buildLeadPayload({ name: "Madonna", email: "m@x.co", type: "contact" });
    expect(p.LastName).toBe("Madonna");
    expect(p).not.toHaveProperty("FirstName");
    expect(p).not.toHaveProperty("Phone");
  });
});
