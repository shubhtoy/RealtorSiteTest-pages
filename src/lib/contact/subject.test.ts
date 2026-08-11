import { describe, expect, it } from "vitest";

import { renderSubject } from "./subject";

const form = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "5551234567",
  bedroom: "2BR",
  moveIn: "Sept",
  tourType: "In person",
  message: "hi",
};

describe("renderSubject", () => {
  it("falls back to a default subject for an empty template", () => {
    expect(renderSubject("", form)).toBe("New Tour Request - Jane Doe");
    expect(renderSubject("   ", form)).toBe("New Tour Request - Jane Doe");
  });

  it("substitutes {{field}} tokens", () => {
    expect(renderSubject("Lead: {{fullName}} ({{bedroom}})", form)).toBe("Lead: Jane Doe (2BR)");
  });

  it("substitutes single-brace {field} tokens", () => {
    expect(renderSubject("From {email}", form)).toBe("From jane@example.com");
  });

  it("replaces unknown tokens with empty string", () => {
    expect(renderSubject("X {{unknown}} Y", form)).toBe("X  Y");
  });

  it("leaves literal text without tokens unchanged", () => {
    expect(renderSubject("Static subject", form)).toBe("Static subject");
  });
});
