import {test,expect} from "@playwright/test";
test("old .org campus and University pages lead to independent nblschool.com",async({page})=>{
 for(const path of ["/campus.html","/university-campus.html","/university.html"]){
  const response=await page.request.get(path);
  const html=await response.text();
  expect(html).toContain('url=https://nblschool.com/');
  expect(html).toContain('href="https://nblschool.com/"');
  expect(html).not.toContain("data-campus-gate");
 }
});
test("University remains closed for tuition; free updates are a separate optional .org service",async({page})=>{
 await page.goto("/university-updates.html");
 await expect(page.getByRole("heading",{name:"The school is under construction."})).toBeVisible();
 await expect(page.locator("[data-nbl-university-interest-form]")).toHaveCount(1);
 await expect(page.locator("#nblu-one-entry, #nblu-pay")).toHaveCount(0);
 await expect(page.getByText("we are not accepting tuition",{exact:false}).first()).toBeVisible();
});
