import { beforeEach, describe, expect, it, vi } from "vitest";

// Plain stub (not vi.fn) for the failing case: vitest otherwise reports a handled throw as a test failure.
const queryMock = vi.fn();
let failing = false;
vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => {
    if (failing) return Promise.reject(new Error("db down"));
    return queryMock(...args);
  },
}));

import { logActivity, rowId, rowLabel } from "./activity";

beforeEach(() => {
  queryMock.mockReset();
  failing = false;
});

describe("logActivity", () => {
  it("writes one row with the actor and stringified entity id", async () => {
    queryMock.mockResolvedValue([]);
    await logActivity({
      action: "content.save",
      summary: "Saved page",
      actor: { id: 7, email: "a@b.co", name: "Ana" },
      entityType: "page",
      entityId: 12,
    });
    const [, params] = queryMock.mock.calls[0];
    expect(params).toEqual(["content.save", "Saved page", 7, "a@b.co", "Ana", "page", "12", null]);
  });

  it("never throws when the database fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    failing = true;
    await expect(logActivity({ action: "auth.login_failed", summary: "x" })).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("truncates long summaries", async () => {
    queryMock.mockResolvedValue([]);
    await logActivity({ action: "content.save", summary: "x".repeat(900) });
    expect((queryMock.mock.calls[0][1] as string[])[1]).toHaveLength(500);
  });
});

describe("rowLabel / rowId", () => {
  it("prefers title, then name, question, slug, then id", () => {
    expect(rowLabel({ title: "T", name: "N" })).toBe("T");
    expect(rowLabel({ name: "N" })).toBe("N");
    expect(rowLabel({ question: "Q?" })).toBe("Q?");
    expect(rowLabel({ slug: "s" })).toBe("s");
    expect(rowLabel({ id: 3 })).toBe("#3");
    expect(rowLabel(undefined)).toBe("item");
  });
  it("reads ids safely", () => {
    expect(rowId({ id: 4 })).toBe(4);
    expect(rowId(null)).toBeUndefined();
  });
});
