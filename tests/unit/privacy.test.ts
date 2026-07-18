import { describe, expect, it } from "vitest";
import { maskEmail, redactSecrets, sanitizeText } from "../../src/core/privacy";

describe("privacy helpers", () => {
  it("masks emails by default", () => {
    expect(maskEmail("Ari <ari.maintainer@example.test>")).toContain(
      "ar***@example.test",
    );
  });

  it("redacts common token shapes", () => {
    const testToken = ["ghp", "123456789012345678901234567890123456"].join("_");

    expect(redactSecrets(`token ${testToken}`)).toContain("[redacted-secret]");
  });

  it("sanitizes text with both controls", () => {
    const testToken = ["sk", "123456789012345678901234"].join("-");

    expect(sanitizeText(`mika@example.test ${testToken}`, true)).not.toContain(
      "mika@example.test",
    );
  });
});
