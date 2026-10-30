import { describe, expect, it } from "vitest";
import { mergeType, typeStyle } from "./type-style";

describe("type cascade", () => {
  it("lets a page override the site and a section override the page", () => {
    const merged = mergeType(
      { size: "m", weight: "400", font: "figtree" },
      { size: "l" },
      { weight: "700", italic: true },
    );
    expect(merged).toEqual({ font: "figtree", size: "l", weight: "700", italic: true });
  });

  it("leaves the design untouched when every level is blank", () => {
    expect(typeStyle({}, {}, {}, "heading")).toBeUndefined();
  });

  it("applies only the properties that were chosen", () => {
    expect(typeStyle({ heading: { size: "xl" } }, { heading: { italic: true } }, undefined, "heading")).toEqual({
      fontSize: "clamp(1.8rem, 3.4vw, 2.8rem)",
      fontStyle: "italic",
    });
  });
});
