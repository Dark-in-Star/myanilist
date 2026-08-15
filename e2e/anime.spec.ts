import { expect, test } from "@playwright/test";

test.describe("Anime browsing", () => {
  test("ranking tabs switch the active ranking type", async ({ page }) => {
    await page.goto("/anime");
    await expect(page.getByRole("heading", { name: "Anime Rankings" })).toBeVisible();

    await page.getByRole("link", { name: "Airing Now" }).click();
    await expect(page).toHaveURL(/type=airing/);

    const grid = page.locator('a[href^="/anime/"]');
    await expect(grid.first()).toBeVisible();
  });

  test("load more appends additional results", async ({ page }) => {
    await page.goto("/anime?type=all");
    const initialCount = await page.locator('a[href^="/anime/"]').count();

    const loadMore = page.getByRole("link", { name: "Load more" });
    await expect(loadMore).toBeVisible();
    await loadMore.click();

    await expect(page).toHaveURL(/limit=48/);
    await expect
      .poll(async () => page.locator('a[href^="/anime/"]').count())
      .toBeGreaterThan(initialCount);
  });

  test("detail page shows synopsis, info panel, and a list status editor", async ({ page }) => {
    await page.goto("/anime?type=all");
    await page.locator('a[href^="/anime/"]').first().click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Your list status")).toBeVisible();
    await expect(page.getByText("Type", { exact: true })).toBeVisible();
    await expect(page.getByText("Episodes", { exact: true })).toBeVisible();
  });

  test("changing the list status dropdown persists after reload, then can be removed", async ({ page }) => {
    // Uses the real myanilist-server, which is backed by a live MyAnimeList account and has no
    // sandbox mode, so this test cleans up the entry it creates instead of leaving it behind.
    await page.goto("/anime?type=all");
    await page.locator('a[href^="/anime/"]').first().click();
    await expect(page).toHaveURL(/\/anime\/\d+/);

    await page.getByLabel("Status").selectOption("plan_to_watch");

    await expect
      .poll(
        async () => {
          await page.reload();
          return page.getByLabel("Status").inputValue();
        },
        { timeout: 15_000 },
      )
      .toBe("plan_to_watch");

    await page.getByRole("button", { name: "Remove from list" }).click();
    await expect(page.getByText("Removed from your list.")).toBeVisible();
  });
});
