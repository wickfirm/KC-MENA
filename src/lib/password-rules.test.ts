import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "./password-rules";

describe("passwordProblem", () => {
  it("rejects short passwords", () => {
    expect(passwordProblem("abc123")).toMatch(String(MIN_PASSWORD_LENGTH));
  });
  it("requires letters and digits", () => {
    expect(passwordProblem("abcdefghijkl")).not.toBeNull();
    expect(passwordProblem("1234567890123")).not.toBeNull();
  });
  it("accepts a valid password", () => {
    expect(passwordProblem("StrongPass12")).toBeNull();
  });
});
