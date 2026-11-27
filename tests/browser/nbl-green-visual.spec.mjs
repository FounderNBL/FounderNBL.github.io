// Website GREEN visual/interaction proof. Only approved public .org surfaces.
// NBLU, games, billing and all authenticated customer material are OUT OF SCOPE.
import {test,expect} from "@playwright/test";
async function visit(page,path="/"){
 let response;
 try{response=await page.goto(path,{waitUntil:"domcontentloaded",timeout:18000});}
 catch{test.skip(true,"UNVERIFIED: runner/browser could not reach "+path);return false;}
 if(!response){test.skip(true,"UNVERIFIED: no navigation response");return false;}
 if([401,403,429].includes(response.status())||response.headers()["cf-mitigated"]){
   test.skip(true,"UNVERIFIED: external runner received an access challenge");return false;
 }
 const body=await page.content();
 if(/Checking your browser|Just a moment\.\.\.|Attention Required! \| Cloudflare/i.test(body.slice(0,2000))){
   test.skip(true,"UNVERIFIED: challenge interstitial");return false;
 }
 expect(response.status(),"public route must respond successfully").toBeLessThan(400);
 return true;
}
test("Pulse and Messenger have exact approved artwork, separate links, and uncropped images",async({page},info)=>{
 if(!await visit(page))return;
 const cases=[["/pulse/","/NBL_Pulse_Worldcard.png",0,0],
              ["/messenger/","/NBL_Messenger_Worldcard.png",1672,941]];
 const cards=page.locator(".pulse-world-door .social-door-grid .world-card");
 await expect(cards).toHaveCount(2);
 for(const [href,src,width,height] of cases){
   const card=cards.filter({has:page.locator('a[href="'+href+'"]')});
   // Use direct descendant query because filter(has) on same element does not match itself.
   const node=page.locator('.pulse-world-door .social-door-grid a.world-card[href="'+href+'"]');
   await expect(node).toHaveCount(1);
   // Lazy-loaded media must enter the viewport after the longer homepage gains sections.
   await node.scrollIntoViewIfNeeded();
   const img=node.locator(".media img");
   await expect(img).toHaveAttribute("src",src);
   await expect(img).toHaveCSS("object-fit","contain");
   await expect.poll(async()=>img.evaluate((i,size)=>i.complete&&i.naturalWidth>0&&i.naturalHeight>0&&(!size.width||i.naturalWidth===size.width)&&(!size.height||i.naturalHeight===size.height),{width,height})).toBe(true);
   await expect(node).toBeVisible();
   const clipped=await node.evaluate(el=>{
     const r=el.getBoundingClientRect();
     return r.width<=0||r.height<=0||r.left< -2||r.right>innerWidth+2;
   });
   expect(clipped,"approved card must not overflow phone/desktop width").toBe(false);
 }
 // University and games are deliberately outside this visual inspection scope.
 await page.screenshot({path:"test-results/nbl-green-home-"+info.project.name+".png",animations:"disabled"});
});
test("Beans opens independently from Pulse and Messenger",async({page})=>{
 if(!await visit(page))return;
 const open=page.getByRole("button",{name:"Open Beans"});
 await expect(open).toBeVisible();
 await open.click();
 await expect(page.locator("#nbl-beans-panel")).toBeVisible();
 await expect(page.locator(".nbl-beans-head .nbl-beans-people-link")).toHaveCount(0);
});
test("Messenger public door never displays private threads to signed-out visitors",async({page})=>{
 if(!await visit(page,"/messenger/"))return;
 await expect(page.locator("[data-chat-guest]")).toBeVisible();
 await expect(page.locator("[data-chat-app]")).toBeHidden();
 await expect(page.locator("[data-chat-messages]")).not.toContainText("PRIVATE_A_THREAD");
});

test("Three live covers are static until activated; only one may load at a time",async({page})=>{
 const mediaRequests=[];
 page.on("request",r=>{if(/(?:live-cover\.mp4|doctor-rocketship-live-cover\.mp4|doc-rock-islamic-digital\.mp4)(?:\?|$)/.test(r.url()))mediaRequests.push(r.url());});
 if(!await visit(page))return;
 const cards=page.locator("[data-nbl-live-cover]");
 await expect(cards).toHaveCount(3);
 for(let i=0;i<3;i++){
   const c=cards.nth(i);await c.scrollIntoViewIfNeeded();
   await expect(c.locator("img")).toBeVisible();
   await expect.poll(()=>c.locator("img").evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
   await expect(c.locator("video")).toBeHidden();
   expect(await c.locator("video").getAttribute("src")).toBeNull();
   await expect(c).toHaveAttribute("aria-pressed","false");
 }
 expect(mediaRequests).toEqual([]);
 // Exercise actual source assignment on user click. Codec support may vary across browser hosts.
 // Hold media requests until state can be checked, without claiming playback proof.
 const held=new Set();
 await page.route("**/*.mp4",async route=>{const url=route.request().url();if(!/(?:live-cover\.mp4|doctor-rocketship-live-cover\.mp4|doc-rock-islamic-digital\.mp4)$/.test(url))return route.continue();held.add(route);});
 await cards.nth(0).click();
 await expect(cards.nth(0).locator("video")).toHaveAttribute("src","assets/books/people-zoo/live-cover.mp4");
 await expect(cards.nth(0)).toHaveAttribute("aria-pressed","true");
 await cards.nth(1).click();
 await expect(cards.nth(0)).toHaveAttribute("aria-pressed","false");
 expect(await cards.nth(0).locator("video").getAttribute("src")).toBeNull();
 await expect(cards.nth(0).locator("img")).toBeVisible();
 await expect(cards.nth(1).locator("video")).toHaveAttribute("src","doctor-rocketship-live-cover.mp4");
 await cards.nth(1).click();
 await expect(cards.nth(1)).toHaveAttribute("aria-pressed","false");
 expect(await cards.nth(1).locator("video").getAttribute("src")).toBeNull();
 for(const route of held)await route.abort().catch(()=>{});
});
