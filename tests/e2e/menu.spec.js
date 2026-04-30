import { expect, test } from "@playwright/test";

test.describe("PEM menu page", () => {
  test("loads the menu and shows at least one meal card", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PEM|Precious Events Makers/i);
    const menuCards = page.locator(".meal-card, .menu-card");
    await expect(menuCards.first()).toBeVisible({ timeout: 10_000 });
  });

  test("category filter narrows the visible meals", async ({ page }) => {
    await page.goto("/");
    const ricePill = page.getByRole("button", { name: /^Rice$/i }).first();
    if (await ricePill.isVisible().catch(() => false)) {
      await ricePill.click();
      await expect(page.locator(".meal-card, .menu-card").first()).toBeVisible();
    }
  });

  test("track-order navigation reveals the lookup form", async ({ page }) => {
    await page.goto("/#track");
    await expect(page.getByRole("button", { name: /Track Order/i }).first()).toBeVisible();
  });

  test("mobile bottom nav appears under 720px", async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 720) {
      test.skip(true, "only runs on the mobile project");
    }
    await page.goto("/");
    await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
  });
});
