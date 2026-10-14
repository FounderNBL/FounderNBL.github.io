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
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("user-test-two"));
  await expect(page.locator("[data-signout]")).toBeVisible();
  await expect(page.locator("[data-campus]")).toBeHidden();
  await expect.poll(()=>statusChecks).toBeGreaterThan(0);
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY(null));
  await expect(page.locator("[data-signout]")).toBeHidden();
  await expect(page.locator("[data-campus-gate]")).toBeVisible();
  await expect(page).toHaveURL(/\/campus\.html$/);
});
