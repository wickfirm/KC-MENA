import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ query: vi.fn(), queryOne: vi.fn() }));

import { buildRestoreQuery, entityIdFromRow, isVersionEntity, snapshotFromRow } from "./versions";

describe("snapshotFromRow", () => {
  it("keeps only editable columns and never the slug", () => {
    const snap = snapshotFromRow("news", { id: 3, slug: "x", title: "T", excerpt: "E", body: "B", status: "draft", source: "rss", created_by: 1 });
    expect(snap).toMatchObject({ title: "T", excerpt: "E", body: "B", status: "draft", cover_image: null });
    expect(snap).not.toHaveProperty("slug");
    expect(snap).not.toHaveProperty("source");
  });
  it("normalises dates to ISO strings", () => {
    const snap = snapshotFromRow("news", { published_at: new Date("2026-10-11T10:00:00Z") });
    expect(snap.published_at).toBe("2026-10-11T10:00:00.000Z");
  });
});

describe("entityIdFromRow", () => {
  it("uses slug for pages, key for settings, id for the rest", () => {
    expect(entityIdFromRow("page", { id: 9, slug: "about-us" })).toBe("about-us");
    expect(entityIdFromRow("settings", { key: "site" })).toBe("site");
    expect(entityIdFromRow("faq", { id: 12 })).toBe("12");
    expect(entityIdFromRow("faq", {})).toBeNull();
  });
});

describe("buildRestoreQuery", () => {
  it("casts JSON columns and targets the right key", () => {
    const { text, params } = buildRestoreQuery("page", "about-us", { title: "About", status: "published", content: { a: 1 }, seo: {} });
    expect(text).toContain("UPDATE pages SET title = $2, status = $3, content = $4::text::jsonb, seo = $5::text::jsonb, updated_at = now() WHERE slug = $1");
    expect(params).toEqual(["about-us", "About", "published", '{"a":1}', "{}"]);
  });
  it("unwraps JSON columns that were snapshotted as strings (pre-fix versions)", () => {
    const { params } = buildRestoreQuery("page", "home", { title: "Home", seo: '{"title":"T"}' });
    expect(params[2]).toBe('{"title":"T"}');
  });
  it("uses a numeric id for id-keyed entities", () => {
    const { params } = buildRestoreQuery("faq", "12", { question: "Q", answer: "A" });
    expect(params[0]).toBe(12);
  });
  it("ignores unknown columns (no SQL injection through snapshot keys)", () => {
    const { text } = buildRestoreQuery("faq", "1", { question: "Q", "answer; DROP TABLE users": "x" });
    expect(text).not.toContain("DROP");
  });
  it("refuses an empty snapshot", () => {
    expect(() => buildRestoreQuery("faq", "1", { nope: 1 })).toThrow();
  });
});

describe("isVersionEntity", () => {
  it("accepts known entities only", () => {
    expect(isVersionEntity("news")).toBe(true);
    expect(isVersionEntity("users")).toBe(false);
    expect(isVersionEntity("constructor")).toBe(false);
  });
});
