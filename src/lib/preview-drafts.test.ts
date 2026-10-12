import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ query: vi.fn(), queryOne: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getSession: vi.fn() }));

import { DRAFT_MAX_AGE_MS, draftRowKey, isFreshDraft, previewTarget } from "./preview-drafts";

describe("previewTarget", () => {
  it("maps the fixed site pages", () => {
    expect(previewTarget("/api/site-pages/home")).toEqual({ key: "page:home", url: "/preview/home?draft=1", permission: "content.editLive" });
    expect(previewTarget("/api/site-pages/about")?.url).toBe("/preview/about?draft=1");
    expect(previewTarget("/api/site-pages/local-business")?.url).toBe("/preview/local-business?draft=1");
  });
  it("maps business and listing pages by slug", () => {
    expect(previewTarget("/api/site-pages/business/real-estate")).toMatchObject({ key: "page:business/real-estate", url: "/preview/business/real-estate?draft=1" });
    expect(previewTarget("/api/site-pages/listing/careers")?.key).toBe("page:listing/careers");
  });
  it("maps news posts (existing and new) with write permission", () => {
    expect(previewTarget("/api/news/12")).toEqual({ key: "news:12", url: "/preview/news/12?draft=1", permission: "content.write" });
    expect(previewTarget("/api/news")?.key).toBe("news:new");
  });
  it("rejects anything else, including path tricks", () => {
    for (const p of ["/api/users", "/api/settings", "/api/site-pages/contact", "/api/site-pages/business/../../users", "/api/site-pages/business/A_B", "/api/news/abc", "/api/pages/3"]) {
      expect(previewTarget(p)).toBeNull();
    }
  });
});

describe("drafts", () => {
  it("keys drafts per user so users never see each other's previews", () => {
    expect(draftRowKey(3, "page:home")).toBe("preview:3:page:home");
    expect(draftRowKey(4, "page:home")).not.toBe(draftRowKey(3, "page:home"));
  });
  it("expires after two hours and rejects malformed rows", () => {
    const now = 1_000_000_000;
    expect(isFreshDraft({ payload: {}, savedAt: now - 1000 }, now)).toBe(true);
    expect(isFreshDraft({ payload: {}, savedAt: now - DRAFT_MAX_AGE_MS - 1 }, now)).toBe(false);
    expect(isFreshDraft({ payload: {}, savedAt: now + 5000 }, now)).toBe(false);
    expect(isFreshDraft({ savedAt: now }, now)).toBe(false);
    expect(isFreshDraft(null)).toBe(false);
    expect(isFreshDraft("x")).toBe(false);
  });
});
