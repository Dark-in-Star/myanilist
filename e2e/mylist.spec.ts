import { expect, test } from "@playwright/test";

test.describe("My lists", () => {
  test("my anime list renders entries or a clear not-connected message", async ({ page }) => {
    await page.goto("/mylist/anime");
    await expect(page.getByRole("heading", { name: "My Anime List" })).toBeVisible();

    const notConnected = page.getByText("Not connected to MyAnimeList");
    const rows = page.locator('a[href^="/anime/"]');
    const empty = page.getByText("Nothing here yet");

    await expect(notConnected.or(rows.first()).or(empty)).toBeVisible();
  });

  test("my manga list renders entries or a clear not-connected message", async ({ page }) => {
    await page.goto("/mylist/manga");
    await expect(page.getByRole("heading", { name: "My Manga List" })).toBeVisible();

    const notConnected = page.getByText("Not connected to MyAnimeList");
    const rows = page.locator('a[href^="/manga/"]');
    const empty = page.getByText("Nothing here yet");

    await expect(notConnected.or(rows.first()).or(empty)).toBeVisible();
  });

  test("status tabs filter the anime list without erroring", async ({ page }) => {
    await page.goto("/mylist/anime");

    const notConnected = await page.getByText("Not connected to MyAnimeList").isVisible();
    test.skip(notConnected, "myanilist-server has no MAL access token configured");

    const completedTab = page.getByRole("link", { name: /^Completed/ });
    await completedTab.scrollIntoViewIfNeeded();
    await completedTab.click();
    await expect(page).toHaveURL(/status=completed/);
    await expect(page.getByRole("heading", { name: "My Anime List" })).toBeVisible();
  });

  test("profile page renders account info or a clear not-connected message", async ({ page }) => {
    await page.goto("/profile");

    const notConnected = page.getByText("Not connected to MyAnimeList");
    const stats = page.getByText("Mean Score");

    await expect(notConnected.or(stats)).toBeVisible();
  });
});
