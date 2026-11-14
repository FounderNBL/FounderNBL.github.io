import {test,expect} from "@playwright/test";

test("all old .org University pages lead to independent nblschool.com",async({page})=>{
 for(const path of ["/campus.html","/university-campus.html","/university.html","/university-enrollment.html"]){
  const response=await page.request.get(path);
  const html=await response.text();
  expect(html).toContain('url=https://nblschool.com/');
  expect(html).toContain('href="https://nblschool.com/"');
  expect(html).not.toContain("data-campus-gate");
  expect(html).not.toContain("data-nbl-university-interest-form");
  expect(html).not.toContain("checkout.stripe.com");
 }
});
