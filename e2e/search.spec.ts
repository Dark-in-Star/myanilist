import { expect, test } from "@playwright/test";

test.describe("Search", () => {
  test("searching from the home page shows anime results", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator('input[placeholder="Search anime or manga..."]:visible').first();
    await searchInput.fill("mock anime");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=mock/);
    await expect(page.getByRole("heading", { name: /results for/i })).toBeVisible();
    await expect(page.locator('a[href^="/anime/"]').first()).toBeVisible();
  });

  test("switching to the manga tab re-runs the search against manga", async ({ page }) => {
    await page.goto("/search?q=mock&type=anime");
    await expect(page.getByRole("heading", { name: /results for/i })).toBeVisible();

    await page.getByRole("link", { name: "manga", exact: true }).click();

    await expect(page).toHaveURL(/type=manga/);
    await expect(page.locator('a[href^="/manga/"]').first()).toBeVisible();
  });

  test("an empty query prompts the user to search instead of erroring", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("Search for anime or manga")).toBeVisible();
  });

  test("a search always renders either results or an explicit no-results state, never a crash", async ({ page }) => {
    await page.goto("/search?q=zzzzzznonexistenttitlezzzzzz");

    const results = page.locator('a[href^="/anime/"]');
    const noResults = page.getByText("No results found");
    await expect(results.first().or(noResults)).toBeVisible();
    await expect(page.getByText("Something went wrong")).not.toBeVisible();
  });
});
