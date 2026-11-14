import {test,expect} from "@playwright/test";

test("University is closed, free notification signup only, no checkout",async({page})=>{
 let checkoutCalls=0;
 await page.route("**/functions/v1/nbl-chat-gateway/billing/checkout",route=>{
   checkoutCalls++;
   return route.abort();
 });
 await page.goto("/university-updates.html");
 await expect(page.getByText("The school is under construction.")).toBeVisible();
 await expect(page.locator("[data-nbl-university-interest-form]")).toBeVisible();
 await expect(page.locator("[data-nbl-university-interest-submit]")).toHaveText("Join free notification list");
 await expect(page.locator("[name=emailOptIn]")).toBeChecked();
 await expect(page.locator("#nblu-pay")).toHaveCount(0);
 await expect(page.locator("text=Sign up & continue to payment")).toHaveCount(0);
 expect(checkoutCalls).toBe(0);
});
