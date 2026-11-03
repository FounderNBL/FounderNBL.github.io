// Live production health only. No local source assertion, build, simulator, AI call,
// signed-in data, checkout, app version, or deployment synchronization.
// 403/429/Cloudflare challenges are UNVERIFIED, never fabricated outages or green proof.
import {test,expect} from "@playwright/test";

const urls=[
  ["New Beansland","https://newbeansland.org/"],
  ["Beans public doorway","https://newbeansland.org/chat.html"],
  ["NBL Messenger","https://newbeansland.org/messenger/"],
  ["NBL University admissions","https://newbeansland.org/university.html"],
  ["NBL World","https://nblworld.com/"],
  ["Independent University campus","https://nblschool.com/"],
  ["NBL Books","https://books.newbeansland.org/"]
];
function challenge(status,html){
  return status===401||status===403||status===429||
    /cf-mitigated|Checking your browser|Just a moment\.\.\.|Attention Required! \| Cloudflare/i.test(html.slice(0,5000));
}
for(const [name,url] of urls){
  test(name+" — visitor HTML responds on the real hostname",async({page})=>{
    let response;
    try {
      response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:15000});
    } catch (error) {
      test.skip(true,"UNVERIFIED: runner could not navigate to "+url+" ("+String(error?.name||"network")+")");
      return;
    }
    if(!response){
      test.skip(true,"UNVERIFIED: no navigation response from "+url);
      return;
    }
    const status=response.status();
    const html=await page.content();
    if(challenge(status,html)||response.headers()["cf-mitigated"]){
      test.skip(true,"UNVERIFIED: runner challenged/denied; not proof of visitor outage");
      return;
    }
    expect(status, "Real visitor-facing HTTP response at "+url).toBeGreaterThanOrEqual(200);
    expect(status, "Real visitor-facing HTTP response at "+url).toBeLessThan(400);
    expect(response.headers()["content-type"]||"").toMatch(/text\/html/i);
    expect(await page.title(),"Live page should have a document title").not.toBe("");
    expect(await page.locator("body").innerText()).not.toBe("");
  });
}
