import { test, expect } from "@playwright/test";

// Synthetic Clerk identities, no actual customer credentials or private data.
const identityFixture = String.raw\`
(() => {
  const listeners=[];
  let current=null;
  const session={getToken:async()=>"fake-fixture-token"};
  window.Clerk={
    load:async()=>{},
    addListener:callback=>{listeners.push(callback);return()=>{};},
    get isSignedIn(){return Boolean(current);},
    get session(){return current?session:null;},
    get user(){return current?{id:current}:null;},
    signOut:async()=>{current=null;listeners.forEach(f=>f({session:null,user:null}));}
  };
  window.__NBL_TEST_SET_IDENTITY=id=>{
    current=id;
    listeners.forEach(f=>f({session:id?session:null,user:id?{id}:null}));
  };
})();
\`;
test.beforeEach(async({page})=>{
  await page.addInitScript({content:identityFixture});
  await page.route("**/social-realtime.js*",route=>route.fulfill({
    status:200,contentType:"application/javascript",
    body:"window.NBLSocialRealtime={watchInbox(){return ()=>{}},watchThread(){return ()=>{}}};"
  }));
});

test("Messenger independently restores Clerk session and clears private UI on logout",async({page})=>{
  await page.route("**/functions/v1/nbl-social",route=>{
    const {action}=route.request().postDataJSON();
    const payload=action==="me"?{ok:true,me:{handle:"alice"}}:
      action==="list_threads"?{ok:true,threads:[{id:"private-a",title:"PRIVATE_A_THREAD",thread_type:"circle"}]}:
      {ok:true,messages:[]};
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(payload)});
  });
  await page.goto("/messenger/");
  await expect(page.locator("[data-chat-app]")).toBeHidden();
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("user_A"));
  await expect(page.locator("[data-chat-myhandle]")).toHaveText("@alice");
  await expect(page.locator("[data-chat-threads]")).toContainText("PRIVATE_A_THREAD");
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY(null));
  await expect(page.locator("[data-chat-app]")).toBeHidden();
  await expect(page.locator("[data-chat-guest]")).toBeVisible();
  await expect(page.locator("[data-chat-threads]")).toBeEmpty();
  await expect(page.locator("[data-chat-messages]")).not.toContainText("PRIVATE_A_THREAD");
  await expect(page.locator("[data-chat-myhandle]")).toHaveText("@NBL member");
});

test("Messenger ignores delayed account A responses after account B signs in",async({page})=>{
  let requestsA=0,completedA=0;
  let releaseA;
  const waitA=new Promise(resolve=>{releaseA=resolve;});
  let current="A";
  await page.route("**/functions/v1/nbl-social",async route=>{
    const {action}=route.request().postDataJSON();
    const isA=current==="A";
    if(isA){requestsA++;await waitA;}
    const prefix=isA?"ACCOUNT_A_PRIVATE":"account-b";
    const payload=action==="me"?{ok:true,me:{handle:prefix}}:
      action==="list_threads"?{ok:true,threads:[{id:isA?"thread-A":"thread-B",title:isA?"ACCOUNT_A_PRIVATE_THREAD":"B visible conversation",thread_type:"circle"}]}:
      {ok:true,messages:[]};
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(payload)});
    if(isA)completedA++;
  });
  await page.goto("/messenger/");
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("user_A"));
  await expect.poll(()=>requestsA).toBe(2);
  current="B";
  await page.evaluate(()=>window.__NBL_TEST_SET_IDENTITY("user_B"));
  await expect(page.locator("[data-chat-myhandle]")).toHaveText("@account-b");
  await expect(page.locator("[data-chat-threads]")).toContainText("B visible conversation");
  releaseA();
  await expect.poll(()=>completedA).toBe(2);
  await expect(page.locator("[data-chat-myhandle]")).toHaveText("@account-b");
  await expect(page.locator("[data-chat-threads]")).not.toContainText("ACCOUNT_A_PRIVATE");
  await expect(page.locator("[data-chat-messages]")).not.toContainText("ACCOUNT_A_PRIVATE");
});
