import { test, expect } from "@playwright/test";

async function open(path, page) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test.describe("New Beansland web app browser smoke", () => {
  test("home page exposes the core public doors", async ({ page }) => {
    await open("/", page);

    await expect(page).toHaveTitle(/New Beansland/i);
    await expect(page.locator('a[href="books.html"]').first()).toBeVisible();
    await expect(page.locator('a[href="stories.html"]').first()).toBeVisible();
    await expect(page.locator('a[href="university.html"]').first()).toBeVisible();
    await expect(page.locator('a[href="studio/"]').first()).toBeVisible();
    await expect(page.locator('a[href="founder-office.html"]').first()).toBeVisible();
  });

  test("NBL Chat opens in a real browser", async ({ page }) => {
    await open("/", page);

    const launcher = page.getByRole("button", { name: "Open NBL Chat" });
    await expect(launcher).toBeVisible();
    await launcher.click();

    await expect(page.locator("#nbl-beans-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: "NBL Chat" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Beans" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Professor Grey/i })).toBeVisible();
  });

  test("University remains an enrollment door, not a public classroom", async ({ page }) => {
    await open("/university.html", page);

    await expect(page).toHaveTitle(/New Beansland University/i);
    await expect(page.locator("body")).toContainText("Foundation Program");
    await expect(page.locator("body")).toContainText(/enrollment/i);
  });

  test("account recovery remains reachable", async ({ page }) => {
    await open("/account.html", page);

    await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
  });
});
