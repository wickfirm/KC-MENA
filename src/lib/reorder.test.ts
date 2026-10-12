import { describe, expect, it } from "vitest";
import { assignSortSlots, reorder } from "./reorder";

describe("reorder", () => {
  it("moves an entry", () => {
    expect(reorder(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(reorder(["a", "b", "c", "d"], 3, 0)).toEqual(["d", "a", "b", "c"]);
  });
  it("returns the same array for no-ops and out-of-range moves", () => {
    const items = ["a", "b"];
    expect(reorder(items, 1, 1)).toBe(items);
    expect(reorder(items, -1, 0)).toBe(items);
    expect(reorder(items, 0, 5)).toBe(items);
  });
});

describe("assignSortSlots", () => {
  it("re-uses the group's own values, smallest first", () => {
    const current = new Map([[1, 10], [2, 40], [3, 25]]);
    const out = assignSortSlots([3, 1, 2], current);
    expect([...out.entries()]).toEqual([[3, 10], [1, 25], [2, 40]]);
  });
  it("keeps other groups' interleaving intact (slots are only permuted)", () => {
    const current = new Map([[1, 5], [2, 9]]);
    const out = assignSortSlots([2, 1], current);
    expect(new Set(out.values())).toEqual(new Set([5, 9]));
  });
  it("separates duplicate values so the new order sticks", () => {
    const current = new Map([[1, 0], [2, 0], [3, 0]]);
    const out = assignSortSlots([3, 1, 2], current);
    expect([...out.entries()]).toEqual([[3, 0], [1, 1], [2, 2]]);
  });
});
