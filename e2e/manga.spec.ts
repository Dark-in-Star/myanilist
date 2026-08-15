import { expect, test } from "@playwright/test";
import { loginAs } from "./auth-helpers";

test.describe("Manga browsing", () => {
  test("ranking tabs switch the active ranking type", async ({ page }) => {
    await page.goto("/manga");
    await expect(page.getByRole("heading", { name: "Manga Rankings" })).toBeVisible();

    await page.getByRole("link", { name: "Popularity" }).click();
    await expect(page).toHaveURL(/type=bypopularity/);

    await expect(page.locator('a[href^="/manga/"]').first()).toBeVisible();
  });

  test("detail page shows synopsis and info panel with a login prompt when logged out", async ({ page }) => {
    await page.goto("/manga?type=all");
    await page.locator('a[href^="/manga/"]').first().click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Log in with MyAnimeList").first()).toBeVisible();
    await expect(page.getByText("Chapters", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Volumes", { exact: true }).first()).toBeVisible();
  });

  test("detail page shows a real list status editor when logged in", async ({ page, baseURL }) => {
    await loginAs(page, baseURL!);
    await page.goto("/manga?type=all");
    await page.locator('a[href^="/manga/"]').first().click();

    await expect(page.getByText("Your list status")).toBeVisible();
    await expect(page.getByLabel("Status")).toBeVisible();
  });
});
