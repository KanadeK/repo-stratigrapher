import { describe, expect, it } from "vitest";
import { maskEmail, redactSecrets, sanitizeText } from "../../src/core/privacy";

describe("privacy helpers", () => {
  it("masks emails by default", () => {
    expect(maskEmail("Ari <ari.maintainer@example.test>")).toContain(
      "ar***@example.test",
    );
  });

  it("redacts common token shapes", () => {
    expect(
      redactSecrets("token ghp_123456789012345678901234567890123456"),
    ).toContain("[redacted-secret]");
  });

  it("sanitizes text with both controls", () => {
    expect(
      sanitizeText("mika@example.test sk-123456789012345678901234", true),
    ).not.toContain("mika@example.test");
  });
});
