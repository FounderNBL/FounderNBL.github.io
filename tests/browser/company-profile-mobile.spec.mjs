import { test, expect } from "@playwright/test";

for (const viewport of [
  { width: 390, height: 844, name: "mobile" },
  { width: 1280, height: 800, name: "desktop" },
]) {
  test(`${viewport.name} company profile is a single image page without PDF downloads or buttons`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/company-profile.html");
    const profile = page.getByRole("img", { name: /New Beansland company profile/ });
    await expect(profile).toBeVisible();
    await expect(page.locator("main img")).toHaveCount(1);
    // The company profile is a single image with no page-level controls.
    // Browser/hosting providers may inject unrelated controls outside <main>;
    // those must not be mistaken for NBL's PDF navigation or download buttons.
    await expect(page.locator("main iframe, main embed, main object, main canvas, main button, main a, main nav.pages")).toHaveCount(0);
    await expect(page.locator('a[href$=".pdf"], iframe[src*=".pdf"]')).toHaveCount(0);
    const fits = await profile.evaluate(img => img.getBoundingClientRect().right <= window.innerWidth + 1);
    expect(fits).toBe(true);
    const mask = await page.locator(".profile-art").evaluate(el => {
      const style = window.getComputedStyle(el, "::after");
      return { content: style.content, position: style.position, width: style.width };
    });
    expect(mask.content).toBe('""');
    expect(mask.position).toBe("absolute");
    expect(Number.parseFloat(mask.width)).toBeGreaterThan(0);
  });
}

test("homepage company profile links only to one-page presentation", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#nbl-company-profile");
  await expect(section).toContainText("one-page NBL Company Profile");
  await expect(section.locator('a[href="company-profile.html"]')).toHaveCount(2);
  await expect(section.locator(".profile-cta-cover")).toHaveCount(1);
});
