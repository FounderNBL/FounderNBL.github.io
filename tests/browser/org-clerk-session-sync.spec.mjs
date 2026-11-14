import {test,expect} from "@playwright/test";
test("University is open for public tours but its .org entrance has no Clerk, enrollment or checkout",async({page})=>{
 let checkoutCalls=0;
 await page.route("**/functions/v1/nbl-chat-gateway/billing/checkout",route=>{checkoutCalls++;return route.abort();});
 const r=await page.request.get("/university.html");
 const html=await r.text();
 expect(html).toContain("url=https://nblschool.com/");
 expect(html).not.toContain("data-nbl-university-interest-form");
 expect(html).not.toContain("nblu-pay");
 expect(html).not.toContain("Sign up & continue to payment");
 expect(checkoutCalls).toBe(0);
});
