import { test, expect } from "@playwright/test";

const streamEndpoint = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core/stream";

async function installClerk(page, signedIn = true) {
  await page.addInitScript(({ signedIn }) => {
    const session = { getToken: async () => "clerk-test-token" };
    window.Clerk = {
      load: async () => {},
      get isSignedIn() { return signedIn; },
      get session() { return signedIn ? session : null; },
      get user() { return signedIn ? { id: "user_test_member" } : null; },
      signOut: async () => {}
    };
  }, { signedIn });
}

test("signed-out visitors cannot query provider status or see a stream", async ({ page }) => {
  let apiCalls = 0;
  await installClerk(page, false);
  await page.route(streamEndpoint, async route => {
    apiCalls += 1;
    await route.fulfill({ status: 500, body: "{}" });
  });
  await page.goto("/studios-live.html");

  await expect(page.getByRole("heading", { name: "Live room" })).toBeVisible();
  await expect(page.getByText("Sign in with your NBL account to view Stream Video status or join.")).toBeVisible();
  await expect(page.getByText("SIGN IN REQUIRED")).toBeVisible();
  await expect(page.getByRole("button", { name: "Join live video" })).toBeHidden();
  expect(apiCalls).toBe(0);
});

test("member sees only server-sourced LIVE status and denied viewer access fails closed", async ({ page }) => {
  const actions = [];
  await installClerk(page);
  await page.route(streamEndpoint, async route => {
    const { action } = route.request().postDataJSON();
    actions.push(action);
    if (action === "status") {
      await route.fulfill({ json: { ok: true, provider: "stream_video", status: "LIVE", sessionId: "session-1" } });
    } else if (action === "host_access") {
      await route.fulfill({ status: 403, json: { ok: false } });
    } else if (action === "viewer_session") {
      await route.fulfill({ status: 403, json: { ok: false, message: "Viewer access is unavailable." } });
    } else {
      await route.fulfill({ status: 404, json: { ok: false } });
    }
  });
  await page.goto("/studios-live.html");

  await expect(page.getByText("LIVE", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Join live video" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter host backstage" })).toBeHidden();
  await page.getByRole("button", { name: "Join live video" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Viewer access is unavailable." })).toBeVisible();
  await expect(page.locator("[data-live-session]")).toBeHidden();
  expect(actions).toContain("status");
  expect(actions).toContain("host_access");
  expect(actions).toContain("viewer_session");
});

test("unavailable provider status is not shown as OFFLINE", async ({ page }) => {
  await installClerk(page);
  await page.route(streamEndpoint, async route => {
    await route.fulfill({ status: 503, json: { ok: false } });
  });
  await page.goto("/studios-live.html");

  await expect(page.getByText("UNAVAILABLE", { exact: true })).toBeVisible();
  await expect(page.getByText("Stream Video status could not be verified.", { exact: true })).toBeVisible();
  await expect(page.getByText("OFFLINE", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Join live video" })).toBeHidden();
});

test("a Stream session for another Clerk identity is rejected before the SDK loads", async ({ page }) => {
  let sdkRequests = 0;
  page.on("request", request => {
    if (request.url().endsWith("/assets/nbl-studios-live-sdk.js")) sdkRequests += 1;
  });
  await installClerk(page);
  await page.route(streamEndpoint, async route => {
    const { action } = route.request().postDataJSON();
    if (action === "status") {
      await route.fulfill({ json: { ok: true, provider: "stream_video", status: "LIVE", sessionId: "session-1" } });
    } else if (action === "viewer_session") {
      await route.fulfill({
        json: {
          ok: true,
          provider: "stream_video",
          apiKey: "public-test-key",
          callId: "call-1",
          sessionId: "session-1",
          userId: "user_another_member",
          token: "not-a-real-video-token"
        }
      });
    } else {
      await route.fulfill({ status: 403, json: { ok: false } });
    }
  });
  await page.goto("/studios-live.html");
  await page.getByRole("button", { name: "Join live video" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "account-bound Stream Video session" })).toBeVisible();
  await expect(page.locator("[data-live-session]")).toBeHidden();
  expect(sdkRequests).toBe(0);
  expect(page.url()).toContain("/studios-live.html");
});
