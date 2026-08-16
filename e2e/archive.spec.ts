import { expect, test } from "@playwright/test";

test.describe("Anime archive", () => {
  test("nav link opens the archive with a default season selected", async ({ page }) => {
    await page.goto("/");

    // On narrow viewports the nav links live behind the hamburger toggle.
    const toggle = page.getByRole("button", { name: "Toggle menu" });
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    await page.locator("a:visible", { hasText: "Archive" }).click();

    await expect(page).toHaveURL(/\/archive$/);
    await expect(page.getByRole("heading", { name: "Anime Archive" })).toBeVisible();
    await expect(page.locator('a[href^="/anime/"]').first()).toBeVisible();
  });

  test("the year/season modal jumps straight to the chosen season", async ({ page }) => {
    await page.goto("/archive?year=2023&season=fall");
    await expect(page.getByRole("button", { name: "Fall 2023" })).toBeVisible();

    await page.getByRole("button", { name: "Fall 2023" }).click();
    await page.getByRole("combobox", { name: "Year" }).click();
    await page.getByRole("option", { name: "2019" }).click();
    await page.getByRole("button", { name: "Winter", exact: true }).click();
    await page.getByRole("button", { name: "Go" }).click();

    await expect(page).toHaveURL(/year=2019&season=winter/);
    await expect(page.getByRole("button", { name: "Winter 2019" })).toBeVisible();
  });

  test("prev/next navigation rolls over into adjacent years", async ({ page, isMobile }) => {
    test.skip(isMobile, "prev/next labels are hidden on narrow viewports");

    await page.goto("/archive?year=2024&season=winter");

    await page.getByRole("link", { name: /Fall 2023/ }).click();
    await expect(page).toHaveURL(/year=2023&season=fall/);
    await expect(page.getByRole("button", { name: "Fall 2023" })).toBeVisible();

    await page.getByRole("link", { name: /Winter 2024/ }).click();
    await expect(page).toHaveURL(/year=2024&season=winter/);
  });

  test("a season with no results shows an explicit empty state, not a crash", async ({ page }) => {
    await page.goto("/archive?year=1917&season=winter");
    await expect(page.getByText("Nothing on record")).toBeVisible();
    await expect(page.getByText("Something went wrong")).not.toBeVisible();
  });
});
