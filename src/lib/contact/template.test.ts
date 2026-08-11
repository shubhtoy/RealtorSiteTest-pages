import { describe, expect, it } from "vitest";
import { renderTemplate } from "./template";

const form = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "555-1234",
  bedroom: "2BR",
  moveIn: "Within 30 days",
  tourType: "In-person",
  message: "Looking forward to it",
};

describe("renderTemplate", () => {
  it("substitutes {{field}} tokens", () => {
    expect(renderTemplate("Hi {{fullName}}", form)).toBe("Hi Jane Doe");
  });

  it("substitutes single-brace {field} tokens", () => {
    expect(renderTemplate("Plan: {bedroom}", form)).toBe("Plan: 2BR");
  });

  it("handles multiple tokens and newlines", () => {
    expect(renderTemplate("{{fullName}}\n{{moveIn}} / {{tourType}}", form)).toBe(
      "Jane Doe\nWithin 30 days / In-person",
    );
  });

  it("replaces unknown tokens with empty string", () => {
    expect(renderTemplate("X{{missing}}Y", form)).toBe("XY");
  });

  it("returns non-template text unchanged", () => {
    expect(renderTemplate("no tokens here", form)).toBe("no tokens here");
  });
});
