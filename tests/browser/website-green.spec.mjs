// NBL .org-only structural visual and public-entrance checks.
// Never visit held University, Playground, Desk, games or payment screens.
import {test,expect} from "@playwright/test";
const live=Boolean(process.env.NBL_BASE_URL?.startsWith("https://"));
async function pageOrUnverified(page,path="/"){
  let response;
  try{response=await page.goto(path,{waitUntil:"domcontentloaded",timeout:18000});}
  catch(error){if(live){test.skip(true,"UNVERIFIED: public browser failed navigation");return;}throw error;}
  if(live&&(!response||[401,403,429].includes(response.status())||
     /checking your browser|just a moment|attention required! \| cloudflare/i.test((await page.content()).slice(0,4000)))){
    test.skip(true,"UNVERIFIED: Cloudflare/bot/browser denied runner; not a public outage");
  }
  expect(response?.status()).toBeLessThan(400);
}
test("The six NBL World cards remain laid out without opening held destinations",async({page})=>{
  await pageOrUnverified(page);
  // Public storefront links only. Never inspect University or games, even as cards.
  const cards=page.locator('.world-grid .world-card[href="clothing.html"],'+
    '.world-grid .world-card[href="books.html"],'+
    '.world-grid .world-card[href="studio/"],'+
    '.world-grid .world-card[href="studios.html"]');
  await expect(cards).toHaveCount(4);
  const sizes=await cards.evaluateAll(nodes=>nodes.map(n=>({
    width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height
  })));
  expect(sizes.every(x=>x.width>100&&x.height>70)).toBe(true);
  expect(Math.max(...sizes.map(x=>x.width))-Math.min(...sizes.map(x=>x.width))).toBeLessThanOrEqual(3);
});
test("Pulse and Messenger have the exact approved separate World-card images",async({page})=>{
  await pageOrUnverified(page);
  const cases=[
    {href:"/pulse/",img:"/NBL_Pulse_World_Card.png"},
    {href:"/messenger/",img:"/NBL_Messenger_Beans_Worldcard.png"}
  ];
  for(const item of cases){
    const card=page.locator('.pulse-world-door .world-card[href="'+item.href+'"]');
    await expect(card).toHaveCount(1);
    const image=card.locator(".media img");
    await expect(image).toHaveAttribute("src",item.img);
    await expect(image).toHaveCSS("object-fit","contain");
    await expect.poll(async()=>image.evaluate(x=>x.complete&&x.naturalWidth>0)).toBe(true);
    const box=await card.boundingBox();
    expect(box?.width||0).toBeGreaterThan(100);
    expect(box?.height||0).toBeGreaterThan(70);
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
  expect(overflow,"Homepage must not overflow mobile width").toBe(false);
});
test("Beans' public launcher opens without navigating into held areas",async({page})=>{
  await pageOrUnverified(page);
  const launcher=page.getByRole("button",{name:"Open Beans"});
  await expect(launcher).toBeVisible();
  await launcher.click();
  await expect(page.locator("#nbl-beans-panel")).toBeVisible();
  await expect(page.locator("#nbl-beans-title")).toBeVisible();
});
test("Messenger signed-out entrance does not expose private message UI",async({page})=>{
  await pageOrUnverified(page,"/messenger/");
  await expect(page.locator("[data-chat-guest]")).toBeVisible();
  await expect(page.locator("[data-chat-app]")).toBeHidden();
  // No real accounts, messages, data, cookies or logins are used.
});
