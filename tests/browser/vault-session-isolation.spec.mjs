import {test, expect} from "@playwright/test";

// Fully isolated in-browser account fixture: exercises the real page and its
// NBLAccountBridge without touching customer accounts or making bank requests.
const fakeClerk=String.raw`
(()=>{
 let active=null;
 const listeners=[];
 const session={getToken:async()=>active?"fixture-token-"+active:null};
 window.Clerk={
  load:async()=>{},
  addListener:fn=>{listeners.push(fn);return ()=>{};},
  get isSignedIn(){return Boolean(active);},
  get session(){return active?session:null;},
  get user(){return active?{id:active}:null;}
 };
 window.__VAULT_CLERK={setIdentity:id=>{active=id;listeners.forEach(fn=>fn());}};
})();
`;

const own=(n)=>({ok:true,customer:{
 beans:{freeRepliesRemaining:n,paidRepliesRemaining:n+1,purchasedTopupRepliesRemaining:n+2},
 studios:{creditsRemaining:n+3}
}});
const founder=()=>({ok:true,founder:{
 financials:{verified:false},resources:[],accounts:[],
 accountCount:0,accountsPage:0,accountsPerPage:25
}});

async function setup(page){
 await page.addInitScript(()=>{
  const original=window.fetch.bind(window);
  window.__VAULT_REQUESTS=[];
  window.__VAULT_REPLY=(idx,json,status=200)=>{
   const item=window.__VAULT_REQUESTS[idx];
   if(!item||item.replied)throw new Error("No pending Vault request "+idx);
   item.replied=true;
   item.resolve(new Response(JSON.stringify(json),{status,headers:{"Content-Type":"application/json"}}));
  };
  window.fetch=(url,opts={})=>{
   if(!String(url).includes("/functions/v1/nbl-vault"))return original(url,opts);
   return new Promise(resolve=>window.__VAULT_REQUESTS.push({
    url:String(url),authorization:opts.headers?.Authorization,replied:false,resolve
   }));
  };
 });
 await page.route("https://clerk.newbeansland.org/npm/**",route=>route.fulfill({
  status:200,contentType:"application/javascript",
  headers:{"Access-Control-Allow-Origin":"*"},body:fakeClerk
 }));
 await page.goto("/vault.html");
 await expect(page.locator("#signin")).toBeVisible();
}
const switchTo=(page,id)=>page.evaluate(id=>window.__VAULT_CLERK.setIdentity(id),id);
const waitRequest=(page,count)=>page.waitForFunction(n=>window.__VAULT_REQUESTS.length>=n,count);
const reply=(page,idx,data,status)=>page.evaluate(({idx,data,status})=>window.__VAULT_REPLY(idx,data,status),{idx,data,status});

for(const platform of ["normal"]) {
 test("Vault ignores a late previous-user response after account switch",async({page})=>{
  await setup(page);
  await switchTo(page,"user_A");
  await waitRequest(page,1);
  await switchTo(page,"user_B");
  await waitRequest(page,2);
  const requests=await page.evaluate(()=>window.__VAULT_REQUESTS.map(r=>({url:r.url,auth:r.authorization})));
  expect(requests[0].auth).toBe("Bearer fixture-token-user_A");
  expect(requests[1].auth).toBe("Bearer fixture-token-user_B");
  await reply(page,1,own(37));
  await expect(page.locator("#free")).toHaveText("37");
  await waitRequest(page,3);
  await reply(page,2,{code:"FOUNDER_REQUIRED"},403);
  await reply(page,0,own(99));
  await expect(page.locator("#free")).toHaveText("37");
  await expect(page.locator("#studio")).toHaveText("40");
  await expect(page.locator("#founder")).toBeHidden();
  await expect(page).toHaveURL(/\/vault\.html$/);
 });

 test("sign-out clears Founder and customer balances even with requests pending",async({page})=>{
  await setup(page);
  await switchTo(page,"user_FOUNDER");
  await waitRequest(page,1);
  await reply(page,0,own(6));
  await waitRequest(page,2);
  await reply(page,1,founder());
  await expect(page.locator("#founder")).toBeVisible();
  await expect(page.locator("#free")).toHaveText("6");
  await page.locator("#refresh").click();
  await waitRequest(page,3);
  await switchTo(page,null);
  await expect(page.locator("#founder")).toBeHidden();
  await expect(page.locator("#free")).toHaveText("—");
  await expect(page.locator("#studio")).toHaveText("—");
  await expect(page.locator("#signin")).toBeVisible();
  await reply(page,2,own(500));
  await expect(page.locator("#free")).toHaveText("—");
  await expect(page.locator("#accounts")).toBeEmpty();
  await expect(page).toHaveURL(/\/vault\.html$/);
 });
}
