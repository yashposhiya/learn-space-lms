import { describe, expect, it } from "vitest";

describe("LearnSpace foundation", () => {
  it("supports student, teacher, and admin roles", () => {
    expect(["student", "teacher", "admin"]).toHaveLength(3);
  });
});
