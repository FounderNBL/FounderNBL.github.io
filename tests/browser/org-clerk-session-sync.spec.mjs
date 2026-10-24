import {test,expect} from "@playwright/test";

// Browser-only Clerk fixture: proves the UI reacts when Clerk restores an
// existing account AFTER initial load. It does not impersonate a real customer.
const mockClerk=String.raw`
(()=>{
  const listeners=[];
  let id=null;
  const session={getToken:async()=>"fixture-session-token"};
  window.Clerk={
    load:async()=>{},
    addListener:callback=>{listeners.push(callback);return ()=>{};},
    get isSignedIn(){return Boolean(id);},
    get session(){return id?session:null;},
    get user(){return id?{id}:null;},
    signOut:async()=>{id=null;for(const f of listeners)f({session:null,user:null});}
  };
  window.__NBL_TEST_SET_IDENTITY=userId=>{
    id=userId;
    for(const f of listeners)f({session:id?session:null,user:id?{id}:null});
  };
})();
`;
async function mockSession(page){
  await page.route("https://clerk.newbeansland.org/npm/**",route=>route.fulfill({
    status:200, contentType:"application/javascript", headers:{"Access-Control-Allow-Origin":"*"}, body:mockClerk
  }));
}
test("member Chat recovers a late Clerk session without redirect or leaking former messages",async({page})=>{
  await mockSession(page);
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core/social",async route=>{
    const {action}=route.request().postDataJSON();
    const data=action==="me"?{ok:true,me:{handle:"test-member"}}:
      action==="list_threads"?{ok:true,threads:[]}:{ok:true,messages:[]};
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(data)});
  });
  await page.goto("/chat.html");
  await expect(page.locator("[data-chat-guest]")).toBeVisible();
  await expect(page.locator("[data-chat-app]")).toBeHidden();
  await page.waitForFunction(()=>typeof window.__NBL_TEST_SET_IDENTITY === "function");
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("user-test-one"));
  await expect(page.locator("[data-chat-userbar]")).toBeVisible();
  await expect(page.locator("[data-chat-app]")).toBeVisible();
  await expect(page.locator("[data-chat-guest]")).toBeHidden();
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY(null));
  await expect(page.locator("[data-chat-guest]")).toBeVisible();
  await expect(page.locator("[data-chat-app]")).toBeHidden();
  await expect(page.locator("[data-chat-threads]")).toBeEmpty();
  await expect(page).toHaveURL(/\/chat\.html$/);
});
test("University rechecks LOCKE when Clerk restores a member identity",async({page})=>{
  await mockSession(page);
  let statusChecks=0;
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core/university",async route=>{
    const {action}=route.request().postDataJSON();
    if(action==="university_status")statusChecks++;
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,university:{allowed:false}})});
  });
  await page.goto("/campus.html");
  await expect(page.locator("[data-campus-gate]")).toBeVisible();
  await expect(page.locator("[data-campus]")).toBeHidden();
  await page.waitForFunction(()=>typeof window.__NBL_TEST_SET_IDENTITY === "function");
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("user-test-two"));
  await expect(page.locator("[data-signout]")).toBeVisible();
  await expect(page.locator("[data-campus]")).toBeHidden();
  await expect.poll(()=>statusChecks).toBeGreaterThan(0);
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY(null));
  await expect(page.locator("[data-signout]")).toBeHidden();
  await expect(page.locator("[data-campus-gate]")).toBeVisible();
  await expect(page).toHaveURL(/\/campus\.html$/);
});


test("stale account A requests cannot overwrite account B after Clerk switches mid-response",async({page})=>{
  await mockSession(page);
  let callCount=0,heldOld=0,completedOld=0;
  let releaseOldRequests;
  const oldRequestsReleased=new Promise(resolve=>{releaseOldRequests=resolve;});
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core/social",async route=>{
    const {action}=route.request().postDataJSON();
    const index=++callCount;
    const fromOldAccount=index<=2;
    if(fromOldAccount){
      heldOld++;
      await oldRequestsReleased;
    }
    const label=fromOldAccount?"ACCOUNT_A_PRIVATE":"account-b";
    const body=action==="me"?{ok:true,me:{handle:label}}:
      action==="list_threads"?{ok:true,threads:[{
        id:fromOldAccount?"a-only":"b-only",
        title:fromOldAccount?"ACCOUNT_A_PRIVATE_THREAD":"B visible conversation",
        thread_type:"circle"
      }]}:{ok:true,messages:[]};
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(body)});
    if(fromOldAccount)completedOld++;
  });
  await page.goto("/chat.html");
  await page.waitForFunction(()=>typeof window.__NBL_TEST_SET_IDENTITY==="function");
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("account-A"));
  await expect.poll(()=>heldOld).toBe(2);
  // Account A's responses are still pending at the network boundary.
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("account-B"));
  await expect(page.locator("[data-chat-myhandle]")).toHaveText("@account-b");
  await expect(page.locator("[data-chat-threads]")).toContainText("B visible conversation");
  releaseOldRequests();
  await expect.poll(()=>completedOld).toBe(2);
  await expect(page.locator("[data-chat-myhandle]")).toHaveText("@account-b");
  await expect(page.locator("[data-chat-threads]")).toContainText("B visible conversation");
  await expect(page.locator("[data-chat-threads]")).not.toContainText("ACCOUNT_A_PRIVATE");
  await expect(page.locator("[data-chat-messages]")).not.toContainText("ACCOUNT_A_PRIVATE");
});
