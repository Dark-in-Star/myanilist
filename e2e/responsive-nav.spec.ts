import { expect, test } from "@playwright/test";

test.describe("Responsive navigation", () => {
  test("desktop viewport shows the full inline nav without a hamburger menu", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop-only assertions");

    await page.goto("/");
    await expect(page.getByRole("link", { name: "Anime", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Manga", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Toggle menu" })).toBeHidden();
  });

  test("mobile viewport hides inline nav links behind a hamburger toggle", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only assertions");

    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await expect(toggle).toBeVisible();
    await expect(page.getByRole("link", { name: "Anime", exact: true })).toBeHidden();

    await toggle.click();
    await expect(page.getByRole("link", { name: "Anime", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Manga", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "My Anime List" })).toBeVisible();

    await toggle.click();
    await expect(page.getByRole("link", { name: "Anime", exact: true })).toBeHidden();
  });

  test("the media grid uses more columns on wider viewports", async ({ page, isMobile }) => {
    test.skip(isMobile, "resizes the viewport directly instead");

    await page.goto("/anime?type=all");
    const grid = page.locator('a[href^="/anime/"]').first().locator("xpath=..");

    const countColumns = () =>
      grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);

    await page.setViewportSize({ width: 375, height: 800 });
    const mobileColumns = await countColumns();

    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopColumns = await countColumns();

    expect(desktopColumns).toBeGreaterThan(mobileColumns);
  });
});
