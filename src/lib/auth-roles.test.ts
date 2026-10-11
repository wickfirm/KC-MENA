import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ queryOne: vi.fn(), query: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { denyUnless, type SessionUser } from "./auth";

const admin: SessionUser = { id: 1, email: "a@x.co", name: "A", role: "admin" };
const editor: SessionUser = { id: 2, email: "e@x.co", name: "E", role: "editor" };

describe("denyUnless", () => {
  it("returns 401 without a session", async () => {
    const res = denyUnless(null, ["admin"]);
    expect(res?.status).toBe(401);
  });
  it("returns 403 for an editor on an admin-only route", async () => {
    const res = denyUnless(editor, ["admin"]);
    expect(res?.status).toBe(403);
    expect(await res!.json()).toEqual({ error: "You do not have permission to do that" });
  });
  it("lets an admin through", () => {
    expect(denyUnless(admin, ["admin"])).toBeNull();
  });
  it("lets either role through when both are allowed", () => {
    expect(denyUnless(editor, ["admin", "editor"])).toBeNull();
  });
});
