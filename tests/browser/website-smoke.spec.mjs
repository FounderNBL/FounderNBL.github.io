import { test, expect } from "@playwright/test";

async function open(path, page) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test.describe("New Beansland web app browser smoke", () => {
  test("home page exposes the core public doors", async ({ page }) => {
    await open("/", page);

    await expect(page).toHaveTitle(/New Beansland/i);
    await expect(page.locator('.world-card[href="books.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="stories.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="university.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="studio/"]')).toBeVisible();
    await expect(page.locator('.world-card[href="founder-office.html"]')).toBeVisible();
  });

  test("NBL Chat opens in a real browser", async ({ page }) => {
    await open("/", page);

    const launcher = page.getByRole("button", { name: "Open NBL Chat" });
    await expect(launcher).toBeVisible();
    await launcher.click();

    await expect(page.locator("#nbl-beans-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: "NBL Chat" })).toBeVisible();
    await expect(page.locator(".nbl-beans-avatar")).toBeVisible();
    await expect(page.locator(".nbl-beans-avatar")).toHaveAttribute("src", "/NBLChat_Beans.png");
    await expect(page.getByRole("tab", { name: "Beans" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /NBL University Professor Grey/i })).toBeHidden();
    await expect(page.getByRole("button", { name: "Open Beans tools" })).toBeVisible();
    await page.getByRole("button", { name: "Open Beans tools" }).click();
    await expect(page.getByRole("button", { name: /Photo \/ file/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Search the live web/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Code \/ data analysis/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create an image/i })).toBeVisible();
  });

  test("live Beans keeps greeting and NBL acronym answers on the right rail", async ({ page }) => {
    test.skip(!process.env.NBL_BASE_URL, "Live semantic check only runs against the deployed web app.");
    await open("/", page);

    await page.getByRole("button", { name: "Open NBL Chat" }).click();
    const input = page.locator("#nbl-beans-input");
    const send = page.locator("[data-nbl-beans-form] button[type=\"submit\"]");
    const beansReplies = page.locator("[data-nbl-beans-regular] .nbl-beans-message.is-beans p");

    await input.fill("Hi Beans");
    await send.click();
    await expect(beansReplies.last()).toHaveText("Hey. What's up?");

    await input.fill("What does NBL stand for?");
    await send.click();
    await expect(beansReplies.last()).toHaveText("NBL stands for New Beansland.");
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
    await expect(page.locator("#signInButton")).toBeVisible();
  });
});
