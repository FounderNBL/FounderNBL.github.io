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
    await expect(page.locator('.world-card[href="stories.html"]')).toHaveCount(0);
    await expect(page.locator('.world-card[href="university.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="studio/"]')).toBeVisible();
    await expect(page.locator('.world-card[href="games.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="clothing.html"]')).toBeVisible();
    await expect(page.locator('.world-grid .world-card')).toHaveCount(6);
    await expect(page.locator('.world-grid .world-card').last()).toHaveAttribute('href','university.html');
  });


  test("official Founder World Card artwork survives all deferred scripts", async ({ page }) => {
    await page.goto("/", {waitUntil:"load"});
    const cards=[
      ["books.html","NBL_Books_New.png"],
      ["studio/","NBL_Music_Productions.png"],
      ["games.html","NBL_Games.png"],
      ["studio/#movie-studio","NBL_Studios.png"],
      ["clothing.html","NBL_Clothing_Co.png"]
    ];
    await expect(page.locator(".world-card.official-art")).toHaveCount(5);
    for(const [href,name] of cards) {
      const img=page.locator('.world-card.official-art[href="'+href+'"] .media img');
      await expect.poll(async()=>img.getAttribute("src")).toContain(name+"?v=");
      await expect.poll(async()=>img.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
    }
    await expect(page.locator('.world-card[href="clothing.html"]')).toHaveCount(1);
    await expect(page.locator('.world-card.official-art').first()).toHaveCSS("aspect-ratio","3 / 4");
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
    await expect(page.locator("#nbl-beans-title")).toBeVisible();
    await expect(page.locator(".nbl-beans-avatar")).toBeVisible();
    await expect(page.locator(".nbl-beans-avatar")).toHaveAttribute("src", "/NBLChat_Beans.png");
    await expect.poll(async () => page.locator(".nbl-beans-avatar").evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.getByRole("tab", { name: "Beans" })).toBeVisible();
    await expect(page.locator(".nbl-beans-grey-link")).toHaveAttribute("href", "/university-campus.html#grey");
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
      await expect(page.getByRole("button", { name: "Plus checkout pending" })).toBeDisabled();
      await expect(page.getByRole("button", { name: /Plus \+ University checkout pending/i })).toBeDisabled();
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

  test("University enrollment and held checkout stay on .org", async ({ page }) => {
    await open("/university.html", page);

    await expect(page).toHaveTitle(/New Beansland University/i);
    await expect(page.locator("body")).toContainText("Beans, the AI assistant");
    await expect(page.getByRole("heading", { name: "University enrollment and payment" })).toBeVisible();
    await expect(page.locator('[data-nbl-university-checkout="foundation"]')).toBeDisabled();
    await expect(page.locator('[data-nbl-university-checkout="full_foundation"]')).toBeDisabled();
    await expect(page.getByRole("link", { name: /Enter the student campus/i })).toHaveAttribute(
      "href", "/university-campus.html#grey",
    );
    await expect(page.locator('a[href^="https://nblworld.com/university"]')).toHaveCount(0);
  });

  test("protected University campus is served on the verified .org Clerk origin", async ({ page }) => {
    await open("/university-campus.html", page);
    await expect(page).toHaveTitle(/NBL University Campus/i);
    await expect(page.getByRole("heading", { name: "Student Campus" })).toBeVisible();
    await expect(page.locator("[data-campus-gate]")).toBeVisible();
    await expect(page.locator('[data-nblu-checkout="foundation"]')).toBeDisabled();
    await expect(page.locator('[data-nblu-checkout="full_foundation"]')).toBeDisabled();
  });

  test("human-to-human member Chat is independently available on .org", async ({ page }) => {
    await open("/member-chat.html", page);
    await expect(page).toHaveTitle(/NBL Member Chat/i);
    await expect(page.getByRole("heading", { name: "NBL Chat" })).toBeVisible();
    await expect(page.locator("[data-chat-guest]")).toBeVisible();
    await expect(page.locator("[data-chat-app]")).toBeHidden();
    await expect(page.locator("[data-chat-find-form]")).toHaveCount(1);
    await expect(page.locator("[data-chat-dm-form]")).toHaveCount(1);
  });

  // The Inspector tests each route separately. A confirmed Cloudflare browser
  // challenge to the CI runner is UNVERIFIED, never a PASS or a customer outage.
  const registeredRoutes = [
    "/", "/books.html", "/stories.html", "/founder-office.html",
    "/studio/", "/account.html", "/university.html", "/university-campus.html", "/member-chat.html",
    "https://nblworld.com/", "https://nblworld.com/university.html"
  ];
  for (const route of registeredRoutes) {
    test("live registered route " + route + " responds without error", async ({ page }) => {
      test.skip(!process.env.NBL_BASE_URL, "External route only; source tests run locally.");
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response, "Expected a response for " + route).not.toBeNull();
      const status = response.status();
      const headers = response.headers();
      if (status === 403 && String(headers["cf-mitigated"] || "").toLowerCase() === "challenge") {
        console.log("NBL_EXTERNAL_UNVERIFIED url=" + route + " http=403 cf-mitigated=challenge cf-ray=" + String(headers["cf-ray"] || "unknown"));
        test.skip(true, "UNVERIFIED: Cloudflare challenged the automated runner; independent human/device proof is still required.");
      }
      expect(status, "Expected " + route + " to be reachable; HTTP " + status).toBeLessThan(400);
    });
  }

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
