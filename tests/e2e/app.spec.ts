import { expect, test } from "@playwright/test";

test("shows sample hotspots and exports reports", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Interactive code stratigraphy/ }),
  ).toBeVisible();
  await expect(page.getByText("src/payments/ledger.ts").first()).toBeVisible();
  await page.getByRole("button", { name: "timeline" }).click();
  await expect(
    page.getByRole("img", { name: /Directory tree hotspot treemap/ }),
  ).toBeVisible();
});

test("filters paths and switches to reading route", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Filter by path").fill("routes");
  await expect(page.getByText("src/api/routes.ts")).toBeVisible();
  await expect(page.getByText("src/payments/ledger.ts")).toHaveCount(0);
  await page.getByRole("button", { name: "route" }).click();
  await expect(
    page.getByText("Step 1: read src/payments/ledger.ts"),
  ).toBeVisible();
});

test("stays usable on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByLabel("Analysis controls")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "JSON", exact: true }),
  ).toBeVisible();
});
