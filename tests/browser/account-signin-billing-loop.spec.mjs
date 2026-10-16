import {test,expect} from "@playwright/test";

// Isolated browser fixture: no actual Clerk accounts, Stripe charges or secrets.
const mockClerk=String.raw`
(()=>{
  const listeners=[];
  let identity=null;
  let mode="normal";
  let tokenCalls=0;
  const session={
    getToken:async(options)=>{
      tokenCalls++;
      if(mode==="recover"&&tokenCalls===1) return null;
      if(mode==="unavailable") return null;
      return "test-clerk-session-token";
    },
    get user(){return identity?{id:identity}:null;}
  };
  window.Clerk={
    load:async()=>{},
    addListener:fn=>{listeners.push(fn);return ()=>{};},
    get isSignedIn(){return Boolean(identity);},
    get session(){return identity?session:null;},
    get user(){return identity?{id:identity,primaryEmailAddress:{emailAddress:"fixture@example.test"}}:null;},
    signOut:async()=>{identity=null;listeners.forEach(fn=>fn());}
  };
  window.__NBL_FIXTURE={
    setIdentity:id=>{identity=id;listeners.forEach(fn=>fn());},
    mode:value=>{mode=value;tokenCalls=0;},
    tokenCalls:()=>tokenCalls
  };
})();
`;

async function configure(page){
  await page.route("https://clerk.newbeansland.org/npm/**",route=>route.fulfill({
    status:200,contentType:"application/javascript",
    headers:{"Access-Control-Allow-Origin":"*"},body:mockClerk
  }));
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-account**",route=>{
    const url=new URL(route.request().url());
    const payload=url.searchParams.get("action")==="summary"
      ?{profile:{username:"fixture"},usage:{conversations:0,messages:0,modelResponses:0}}
      :{conversations:[]};
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(payload)});
  });
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-chat-gateway/chat/meter",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({meter:{membershipStatus:"free",totalReplyRemaining:0}})})
  );
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/locke-fulfillment",route=>
    route.fulfill({status:403,contentType:"application/json",body:'{"message":"fixture forbidden"}'})
  );
}

test("Clerk restores late on account page without reload or portal bounce",async({page})=>{
  await configure(page);
  const pages=[];
  page.on("framenavigated",frame=>{if(frame===page.mainFrame())pages.push(frame.url());});
  await page.goto("/account.html");
  await expect(page.locator("#signedOut")).toBeVisible();
  await page.evaluate(()=>window.__NBL_FIXTURE.setIdentity("fixture_member_1"));
  await expect(page.locator("#accountBody")).toBeVisible();
  await expect(page.locator("#signedOut")).toBeHidden();
  await expect(page.locator("#identityLine")).toContainText("fixture@example.test");
  await page.evaluate(()=>window.__NBL_FIXTURE.setIdentity(null));
  await expect(page.locator("#accountBody")).toBeHidden();
  await expect(page.locator("#signedOut")).toBeVisible();
  expect(pages).toHaveLength(1);
  await expect(page).toHaveURL(/\/account\.html$/);
});

test("billing waits for a refreshed Clerk token and never reopens sign-in",async({page})=>{
  await configure(page);
  const seen=[];
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-chat-gateway/billing/checkout",route=>{
    const cors={
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Headers":"Authorization, Content-Type, Accept",
      "Access-Control-Allow-Methods":"POST, OPTIONS"
    };
    if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers:cors});
    seen.push({auth:route.request().headers().authorization,body:route.request().postDataJSON()});
    return route.fulfill({status:200,headers:cors,contentType:"application/json",body:JSON.stringify({checkoutUrl:"https://checkout.stripe.com/c/pay/fixture"})});
  });
  // Start on the homepage to avoid unrelated automatic account metering.
  // This tests the exact same shared checkout bridge used by the account page.
  await page.goto("/");
  await page.evaluate(()=>window.NBLAccountBridge.getClerk());
  await page.evaluate(()=>{
    window.__NBL_FIXTURE.setIdentity("fixture_member_1");
    window.__NBL_FIXTURE.mode("recover");
  });
  const result=await page.evaluate(()=>window.NBLBillingBridge.checkout("beans"));
  expect(result.signInRequired).toBe(false);
  expect(result.destination).toBe("https://checkout.stripe.com/c/pay/fixture");
  expect(seen).toEqual([{auth:"Bearer test-clerk-session-token",body:{plan:"beans"}}]);
  expect(await page.evaluate(()=>window.__NBL_FIXTURE.tokenCalls())).toBeGreaterThanOrEqual(2);
  await expect(page).toHaveURL(/\/$/);
});

test("signed-in but unavailable token stays on account page with an error; no redirect",async({page})=>{
  await configure(page);
  await page.goto("/account.html");
  await page.evaluate(()=>{
    window.__NBL_FIXTURE.setIdentity("fixture_member_1");
    window.__NBL_FIXTURE.mode("unavailable");
  });
  await expect(page.locator("#accountBody")).toBeVisible();
  const response=await page.evaluate(async()=>{
    try {return {value:await window.NBLBillingBridge.checkout("beans")};}
    catch(error){return {error:error.message};}
  });
  expect(response.value).toBeUndefined();
  expect(response.error).toMatch(/signed in.*session has not finished connecting/i);
  await expect(page).toHaveURL(/\/account\.html$/);
});

test("genuinely signed-out checkout offers one safe account return URL",async({page})=>{
  await configure(page);
  await page.goto("/account.html");
  const result=await page.evaluate(()=>window.NBLBillingBridge.checkout("beans"));
  expect(result.signInRequired).toBe(true);
  const url=new URL(result.signInUrl);
  expect(url.origin).toBe("https://accounts.newbeansland.org");
  expect(url.pathname).toBe("/sign-in");
  expect(url.searchParams.get("redirect_url")).toBe(new URL("/account.html",page.url()).href);
  await expect(page).toHaveURL(/\/account\.html$/);
});
