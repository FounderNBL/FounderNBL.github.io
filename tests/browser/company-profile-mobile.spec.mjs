import { test, expect } from "@playwright/test";

test("mobile company profile fits the actual PDF pages to the screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.pdfjsLib = {
      GlobalWorkerOptions: {},
      getDocument() {
        return { promise: Promise.resolve({
          numPages: 3,
          async getPage() {
            return {
              getViewport({ scale }) { return { width: 612 * scale, height: 792 * scale }; },
              render() { return { promise: Promise.resolve() }; }
            };
          }
        }) };
      }
    };
  });
  await page.goto("/company-profile.html");
  const viewer = page.locator("#companyPdfReader");
  await expect(viewer).toHaveClass(/pdf-ready/);
  await expect(page.locator("#pdfPageStatus")).toHaveText("Page 1 of 3");
  await expect(page.locator("#pdfCanvas")).toBeVisible();
  await expect(page.locator("#pdfPrev")).toBeDisabled();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.locator("#pdfPageStatus")).toHaveText("Page 2 of 3");
  const fits = await page.locator("#pdfCanvas").evaluate(el => el.getBoundingClientRect().right <= window.innerWidth);
  expect(fits).toBe(true);
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(page.locator("#pdfPageStatus")).toHaveText("Page 1 of 3");
  await expect(page.locator('a[download][href*="NBL_Company_Profile_"]')).toHaveCount(1);
});

test("desktop company profile keeps its complete PDF embed", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/company-profile.html");
  await expect(page.locator("#companyPdfReader iframe")).toBeVisible();
  await expect(page.locator("#companyPdfReader")).not.toHaveClass(/pdf-ready/);
});
