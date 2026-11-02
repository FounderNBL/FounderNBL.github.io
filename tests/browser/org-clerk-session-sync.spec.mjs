import {test,expect} from "@playwright/test";

test("the existing NBL account authenticates the single tuition checkout without exposing a school login",async({page})=>{
  await page.addInitScript(()=>{
    window.Clerk={
      load:async()=>{},
      isSignedIn:true,
      user:{id:"user_test_student"},
      session:{getToken:async()=>"mock-nbl-token"}
    };
  });
  let attempts=0;
  await page.route("**/functions/v1/nbl-chat-gateway/billing/checkout",async route=>{
    attempts++;
    expect(route.request().headers().authorization).toBe("Bearer mock-nbl-token");
    const data=route.request().postDataJSON();
    expect(data.plan).toBe("full_foundation");
    await route.fulfill({status:423,headers:{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"},body:JSON.stringify({message:"University checkout is held pending release verification. No charge was made."})});
  });
  await page.goto("/university.html");
  await page.locator("#nblu-program").selectOption("full_foundation");
  await page.locator("#nblu-pay").click();
  await expect(page.locator("#nblu-payment-status")).toContainText("No charge was made.");
  expect(attempts).toBe(1);
  await page.locator("#nblu-program").selectOption("full_nblu_diy");
  await page.locator("#nblu-pay").click();
  await expect(page.locator("#nblu-payment-status")).toContainText("not yet connected to an approved payment route");
  expect(attempts).toBe(1);
});