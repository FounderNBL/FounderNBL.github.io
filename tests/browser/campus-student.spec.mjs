import {test,expect} from "@playwright/test";

test("old .org campus links still lead to independent nblschool.com",async({page})=>{
  const legacy=await page.request.get("/campus.html");
  const html=await legacy.text();
  expect(html).toContain('<meta http-equiv="refresh" content="0;url=https://nblschool.com/">');
  expect(html).toContain('href="https://nblschool.com/"');
  expect(html).not.toContain("data-campus-gate");
});
test("University admission is closed; free opening notification only",async({page})=>{
  await page.goto("/university.html");
  await expect(page).toHaveTitle(/Opening Soon/);
  await expect(page.getByRole("heading",{name:"The school is under construction."})).toBeVisible();
  await expect(page.locator("[data-nbl-university-interest-form]")).toHaveCount(1);
  await expect(page.locator('a[href="https://nblschool.com/"]')).toHaveCount(1);
  await expect(page.locator("#nblu-one-entry, #nblu-pay")).toHaveCount(0);
  await expect(page.getByText("No tuition", {exact:false}).first()).toBeVisible();
});
