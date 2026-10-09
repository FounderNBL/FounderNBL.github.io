import { test, expect } from "@playwright/test";

const checkingLive = Boolean(process.env.NBL_BASE_URL);
const expectBillingReleaseUi = !checkingLive || process.env.NBL_EXPECT_BILLING_LIVE === "1";

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

  test("Beans AI opens in a real browser", async ({ page }) => {
    await open("/", page);

    const launcher = page.getByRole("button", { name: "Open Beans" });
    await expect(launcher).toBeVisible();
    const launcherImage = launcher.locator("img");
    await expect(launcherImage).toHaveAttribute("src", "/NBLChat_Beans.png");
    await expect.poll(async () => launcherImage.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    await launcher.click();

    await expect(page.locator("#nbl-beans-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Beans" })).toBeVisible();
    await expect(page.locator(".nbl-beans-avatar")).toBeVisible();
    await expect(page.locator(".nbl-beans-avatar")).toHaveAttribute("src", "/NBLChat_Beans.png");
    await expect.poll(async () => page.locator(".nbl-beans-avatar").evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.getByRole("tab", { name: "Beans" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /NBL University Professor Grey™/i })).toBeHidden();
    await expect(page.getByRole("button", { name: "Open Beans tools" })).toBeVisible();
    await page.getByRole("button", { name: "Open Beans tools" }).click();
    await expect(page.getByRole("button", { name: /Photo \/ file/i })).toBeVisible();
    await expect(page.locator('[data-nbl-tool="grey"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Search the live web/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Code \/ data analysis/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create a PDF \/ file/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create an image/i })).toBeVisible();
    await expect(page.locator("[data-nbl-university-pdf-form]")).toHaveCount(1);
    if (expectBillingReleaseUi) {
      await page.getByRole("button", { name: /Open Beans menu/i }).click();
      await page.getByRole("button", { name: /Membership & plans/i }).click();
      await expect(page.getByRole("button", { name: "Choose Beans" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Choose NBL CHAT PLUS™" })).toBeVisible();
      await expect(page.getByRole("button", { name: /Choose Plus \+ University/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Get \+500 replies/i })).toBeVisible();
    }
  });

  test("live Beans keeps greeting and NBL acronym answers on the right rail", async ({ page }) => {
    test.skip(!process.env.NBL_BASE_URL, "Live semantic check only runs against the deployed web app.");
    await open("/", page);

    await page.getByRole("button", { name: "Open Beans" }).click();
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

  test("University enrollment hands off to NBL World while Beans stays here", async ({ page }) => {
    await open("/university.html", page);

    await expect(page).toHaveTitle(/New Beansland University/i);
    await expect(page.locator("body")).toContainText("NBL University lives in NBL World.");
    await expect(page.locator("body")).toContainText("Beans, the AI assistant");
    await expect(page.getByRole("link", { name: /View New Beansland University enrollment information/i })).toHaveAttribute(
      "href",
      "https://nblworld.com/university.html#enroll",
    );
    await expect(page.locator('[data-nbl-university-checkout]')).toHaveCount(0);
  });

  test("live NBL World campus and enrollment surface are reachable", async ({ page }) => {
    test.skip(!process.env.NBL_BASE_URL, "Live cross-site check only runs against deployed production.");

    await page.goto("https://nblworld.com/university.html#enroll", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/NBL University Campus/i);
    await expect(page.getByRole("heading", { name: "Student Campus" })).toBeVisible();
    await expect(page.locator('[data-nblu-checkout="foundation"]')).toBeVisible();
    await expect(page.locator('[data-nblu-checkout="full_foundation"]')).toBeVisible();
    await expect(page.locator('[data-nblu-checkout="full_nblu"]')).toBeVisible();
    await expect(page.locator("[data-campus-gate]")).toBeVisible();
  });

  test("account recovery uses the Clerk portal with a safe return URL", async ({ page }) => {
    await open("/account.html?source=smoke#account", page);

    const forgot = page.getByRole("link", { name: "Forgot password?" });
    const signIn = page.getByRole("button", { name: "Sign in / recover account" });
    await expect(forgot).toBeVisible();
    await expect(signIn).toBeVisible();

    const href = await forgot.getAttribute("href");
    expect(href).toBeTruthy();
    const portal = new URL(href);
    expect(portal.origin).toBe("https://accounts.newbeansland.org");
    expect(portal.pathname).toBe("/sign-in");

    const redirect = new URL(portal.searchParams.get("redirect_url"));
    const current = new URL(page.url());
    expect(redirect.origin).toBe(current.origin);
    expect(redirect.pathname).toBe("/account.html");
    expect(redirect.searchParams.get("source")).toBe("smoke");
    expect(redirect.hash).toBe("");

    if (expectBillingReleaseUi) {
      await expect(page.locator("#membershipCard")).toBeAttached();
    }
  });

  test("account sign-in remains usable when the Clerk bridge fails", async ({ page }) => {
    await page.route("**/*clerk.browser.js*", (route) => route.abort());
    await page.route("https://accounts.newbeansland.org/**", (route) => route.abort());
    await open("/account.html?source=bridge-failure#account", page);

    const signIn = page.getByRole("button", { name: "Sign in / recover account" });
    const forgot = page.getByRole("link", { name: "Forgot password?" });
    await expect(signIn).toBeVisible();
    await expect(forgot).toBeVisible();
    expect(await signIn.evaluate((button) => typeof button.onclick)).toBe("function");

    const href = new URL(await forgot.getAttribute("href"));
    expect(href.origin).toBe("https://accounts.newbeansland.org");
    expect(href.pathname).toBe("/sign-in");
    const redirect = new URL(href.searchParams.get("redirect_url"));
    expect(redirect.pathname).toBe("/account.html");
    expect(redirect.hash).toBe("");
  });
});
