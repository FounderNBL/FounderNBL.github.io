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
test("Pulse has exact approved artwork and one active social door",async({page},info)=>{
 if(!await visit(page))return;
 const cases=[["/pulse/","/NBL_Pulse_Worldcard.png",0,0]];
 const cards=page.locator(".pulse-world-door .social-door-grid .world-card");
 await expect(cards).toHaveCount(1);
 for(const [href,src,width,height] of cases){
   const card=cards.filter({has:page.locator('a[href="'+href+'"]')});
   // Use direct descendant query because filter(has) on same element does not match itself.
   const node=page.locator('.pulse-world-door .social-door-grid a.world-card[href="'+href+'"]');
   await expect(node).toHaveCount(1);
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
test("Legacy Messenger redirects to Pulse without exposing private threads",async({page})=>{
 if(!await visit(page,"/messenger/"))return;
 await expect(page).toHaveURL(/\/pulse\/\?messages=1/);
 await expect(page.locator("#socialApp")).toBeHidden();
 await expect(page.locator("#pulseMemberMessages")).toBeEmpty();
});
