import {test,expect} from "@playwright/test";

test("old .org campus links lead directly to independent nblschool.com",async({page})=>{
  const legacy=await page.request.get("/campus.html");
  const html=await legacy.text();
  expect(html).toContain('<meta http-equiv="refresh" content="0;url=https://nblschool.com/">');
  expect(html).toContain('href="https://nblschool.com/"');
  expect(html).not.toContain('data-campus-gate');
  expect(html).not.toContain('data-study-lab');
});
test("the .org campus checkout is one admissions page with a separate school link",async({page})=>{
  await page.goto("/university.html");
  await expect(page).toHaveTitle(/Registration & Tuition/);
  await expect(page.getByRole("heading",{name:"Welcome to NBL University."})).toBeVisible();
  await expect(page.locator("#nblu-one-entry")).toHaveCount(1);
  await expect(page.locator("#nblu-program option")).toHaveCount(8);
  await expect(page.locator('a[href="https://nblschool.com/"]')).toHaveCount(1);
  await expect(page.locator('[data-campus-gate], [data-study-lab], [data-social-dm-handle]')).toHaveCount(0);
  await page.locator("#nblu-program").selectOption("full_nblu_diy");
  await expect(page.locator("#nblu-offer-price")).toHaveText("$184.99 once");
  await expect(page.locator("#nblu-offer-desc")).toContainText("without physical books");
  await page.locator("#nblu-program").selectOption("full_nblu");
  await expect(page.locator("#nblu-offer-price")).toHaveText("$449.99 once");
});