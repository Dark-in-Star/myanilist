import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("renders the hero, search bar, and ranking rows", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /track everything you watch and read/i })).toBeVisible();
    await expect(page.locator('input[placeholder="Search anime or manga..."]:visible').first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Currently Airing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Top Anime" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Top Manga" })).toBeVisible();
  });

  test("view all link navigates to the anime ranking page", async ({ page }) => {
    await page.goto("/");

    await page
      .locator("section", { has: page.getByRole("heading", { name: "Top Anime" }) })
      .getByRole("link", { name: /view all/i })
      .click();

    await expect(page).toHaveURL(/\/anime\?type=all/);
    await expect(page.getByRole("heading", { name: "Anime Rankings" })).toBeVisible();
  });

  test("a ranking card links to its anime detail page", async ({ page }) => {
    await page.goto("/");

    const firstCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Currently Airing" }) })
      .locator('a[href^="/anime/"]')
      .first();
    await firstCard.click();

    await expect(page).toHaveURL(/\/anime\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
