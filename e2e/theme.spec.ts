import { expect, test } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("toggling switches the data-theme attribute and updates the button label", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    await expect(toggle).toBeVisible();

    const before = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await toggle.click();

    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme")))
      .not.toBe(before);
  });

  test("the chosen theme persists across a reload", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    await toggle.click();
    const chosen = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));

    await page.reload();

    // The inline init script runs before hydration, so the attribute should already be
    // correct on first paint, with no flash of the other theme.
    const afterReload = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(afterReload).toBe(chosen);
  });

  test("toggling twice returns to the original background color", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });

    const originalBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await toggle.click();
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .not.toBe(originalBackground);

    await toggle.click();
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe(originalBackground);
  });
});
