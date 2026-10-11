import { describe, expect, it } from "vitest";
import { allowedStatus, can, canViewPath, mayEditContent, normaliseRole, roleLabel } from "./permissions";

describe("can", () => {
  it("gives admin everything", () => {
    for (const p of ["content.delete", "settings.manage", "team.manage", "activity.read", "media.delete"] as const) {
      expect(can("admin", p)).toBe(true);
    }
  });
  it("lets editors publish but not delete or manage settings/team", () => {
    expect(can("editor", "content.publish")).toBe(true);
    expect(can("editor", "content.editLive")).toBe(true);
    expect(can("editor", "content.delete")).toBe(false);
    expect(can("editor", "settings.manage")).toBe(false);
    expect(can("editor", "team.manage")).toBe(false);
    expect(can("editor", "media.delete")).toBe(false);
  });
  it("limits contributors to writing drafts and uploading media", () => {
    expect(can("contributor", "content.write")).toBe(true);
    expect(can("contributor", "media.upload")).toBe(true);
    expect(can("contributor", "content.publish")).toBe(false);
    expect(can("contributor", "content.editLive")).toBe(false);
    expect(can("contributor", "inbox.read")).toBe(false);
  });
  it("makes viewers read-only", () => {
    expect(can("viewer", "inbox.read")).toBe(true);
    for (const p of ["content.write", "content.editLive", "content.publish", "media.upload", "rss.review", "messages.manage"] as const) {
      expect(can("viewer", p)).toBe(false);
    }
  });
  it("treats unknown roles as viewer", () => {
    expect(normaliseRole("superuser")).toBe("viewer");
    expect(can(undefined, "content.write")).toBe(false);
  });
});

describe("mayEditContent", () => {
  it("always lets editors and admins edit", () => {
    expect(mayEditContent("editor", "published")).toBe(true);
    expect(mayEditContent("admin", "published")).toBe(true);
  });
  it("lets contributors edit only what is not live", () => {
    expect(mayEditContent("contributor", "draft")).toBe(true);
    expect(mayEditContent("contributor", "in_review")).toBe(true);
    expect(mayEditContent("contributor", undefined)).toBe(true);
    expect(mayEditContent("contributor", "published")).toBe(false);
  });
  it("never lets viewers edit", () => {
    expect(mayEditContent("viewer", "draft")).toBe(false);
  });
});

describe("allowedStatus", () => {
  it("passes any status for roles that can publish", () => {
    expect(allowedStatus("editor", "published")).toBe("published");
  });
  it("lets a contributor save a draft or submit for review, nothing else", () => {
    expect(allowedStatus("contributor", "in_review")).toBe("in_review");
    expect(allowedStatus("contributor", "draft")).toBe("draft");
    expect(allowedStatus("contributor", "published")).toBe("draft");
    expect(allowedStatus("contributor", "open")).toBe("draft");
  });
});

describe("canViewPath", () => {
  it("restricts team, settings and activity to admins", () => {
    for (const p of ["/admin/users", "/admin/settings", "/admin/activity"]) {
      expect(canViewPath("admin", p)).toBe(true);
      expect(canViewPath("editor", p)).toBe(false);
      expect(canViewPath("viewer", p)).toBe(false);
    }
  });
  it("keeps contributors out of live pages, submissions and the RSS queue", () => {
    for (const p of ["/admin/site/home", "/admin/pages/3", "/admin/faqs", "/admin/jobs/2", "/admin/submissions", "/admin/rss"]) {
      expect(canViewPath("contributor", p)).toBe(false);
      expect(canViewPath("editor", p)).toBe(true);
    }
    expect(canViewPath("contributor", "/admin/news/5")).toBe(true);
    expect(canViewPath("contributor", "/admin/projects")).toBe(true);
    expect(canViewPath("contributor", "/admin/media")).toBe(true);
  });
  it("does not match on prefixes that merely look similar", () => {
    expect(canViewPath("editor", "/admin/users-guide")).toBe(true);
  });
});

describe("roleLabel", () => {
  it("labels roles", () => {
    expect(roleLabel("contributor")).toBe("Contributor");
    expect(roleLabel("nope")).toBe("Viewer");
  });
});
