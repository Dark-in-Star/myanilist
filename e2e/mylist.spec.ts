import { expect, test } from "@playwright/test";
import { loginAs } from "./auth-helpers";

test.describe("My lists (logged out)", () => {
  test("my anime list prompts login instead of erroring", async ({ page }) => {
    await page.goto("/mylist/anime");
    await expect(page.getByText("Log in with MyAnimeList").first()).toBeVisible();
    await expect(page.getByText("Something went wrong")).not.toBeVisible();
  });

  test("my manga list prompts login instead of erroring", async ({ page }) => {
    await page.goto("/mylist/manga");
    await expect(page.getByText("Log in with MyAnimeList").first()).toBeVisible();
    await expect(page.getByText("Something went wrong")).not.toBeVisible();
  });

  test("profile page prompts login instead of erroring", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText("Log in with MyAnimeList").first()).toBeVisible();
  });
});

test.describe("My lists (logged in)", () => {
  test("my anime list renders real entries", async ({ page, baseURL }) => {
    await loginAs(page, baseURL!);
    await page.goto("/mylist/anime");

    await expect(page.getByRole("heading", { name: "My Anime List" })).toBeVisible();
    await expect(page.locator('a[href^="/anime/"]').first()).toBeVisible();
  });

  test("my manga list renders real entries", async ({ page, baseURL }) => {
    await loginAs(page, baseURL!);
    await page.goto("/mylist/manga");

    await expect(page.getByRole("heading", { name: "My Manga List" })).toBeVisible();
    await expect(page.locator('a[href^="/manga/"]').first()).toBeVisible();
  });

  test("status tabs filter the anime list without erroring", async ({ page, baseURL }) => {
    await loginAs(page, baseURL!);
    await page.goto("/mylist/anime");

    const completedTab = page.getByRole("link", { name: /^Completed/ });
    await completedTab.scrollIntoViewIfNeeded();
    await completedTab.click();
    await expect(page).toHaveURL(/status=completed/);
    await expect(page.getByRole("heading", { name: "My Anime List" })).toBeVisible();
  });

  test("profile page renders account info and stats", async ({ page, baseURL }) => {
    await loginAs(page, baseURL!);
    await page.goto("/profile");

    await expect(page.getByText("Mock User")).toBeVisible();
    await expect(page.getByText("Mean Score")).toBeVisible();
  });
});
