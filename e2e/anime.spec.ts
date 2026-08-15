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

  test("load more appends results in place, without navigating or reloading the page", async ({ page }) => {
    await page.goto("/anime?type=all");
    const initialCount = await page.locator('a[href^="/anime/"]').count();
    const urlBefore = page.url();

    const loadMore = page.getByRole("button", { name: "Load more" });
    await expect(loadMore).toBeVisible();
    await loadMore.click();

    await expect
      .poll(async () => page.locator('a[href^="/anime/"]').count())
      .toBeGreaterThan(initialCount);

    // A real navigation (the old bug) would change the URL; an in-place append does not.
    expect(page.url()).toBe(urlBefore);
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
    // Runs against the in-memory mock server (e2e/mock-server.mjs), never the real
    // myanilist-server / a live MyAnimeList account.
    await page.goto("/anime?type=all");
    await page.locator('a[href^="/anime/"]').first().click();
    await expect(page).toHaveURL(/\/anime\/\d+/);

    await page.getByLabel("Status").selectOption("plan_to_watch");
    // selectOption only waits for the DOM value to change, not for the underlying
    // Server Action (fired via startTransition) to finish — wait for the select to
    // re-enable (it's disabled while the mutation is pending) before reloading.
    await expect(page.getByLabel("Status")).toBeEnabled();
    await page.reload();
    await expect(page.getByLabel("Status")).toHaveValue("plan_to_watch");

    await page.getByRole("button", { name: "Remove from list" }).click();
    await expect(page.getByText("Removed from your list.")).toBeVisible();
  });
});
