import { test, expect } from "@playwright/test";

test("Beans welcome appears briefly then clears space for chat", async ({page}) => {
  await page.goto("/", {waitUntil:"domcontentloaded"});
  await page.getByRole("button", {name:"Open Beans"}).click();
  const stage=page.locator("#nbl-chat-panel-beans [data-nbl-beans-presence]");
  const artwork=stage.locator("img.nbl-beans-presence-art");
  await expect(stage).toBeVisible();
  await expect(artwork).toHaveAttribute("src","/Beans_Hi_Basic.png");
  await expect.poll(async()=>artwork.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  const style=await stage.evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(style).toContain("gradient");
  const log=page.locator("#nbl-chat-panel-beans [data-nbl-beans-log]");
  await log.evaluate(el=>{
    for(let i=0;i<30;i++){
      const div=document.createElement("div");
      div.className="nbl-beans-message is-beans";
      div.textContent="Test conversation message "+i;
      el.append(div);
    }
    el.scrollTop=el.scrollHeight;
  });
  await expect(stage).toBeHidden();
  await expect(page.locator("#nbl-beans-input")).toBeVisible();
  await expect(page.locator("#nbl-chat-panel-beans [data-nbl-beans-log]")).toBeVisible();
});

test("Five free Beans looks and a user background remain independent", async ({page}) => {
  await page.goto("/", {waitUntil:"domcontentloaded"});
  await page.getByRole("button", {name:"Open Beans"}).click();
  const image=page.locator("#nbl-chat-panel-beans .nbl-beans-presence-art");
  const stage=page.locator("#nbl-chat-panel-beans [data-nbl-beans-presence]");
  await page.locator("[data-nbl-customize-open]").click();
  const names=["standard","crossed","jersey","cargoWave","cargoPoint"];
  for(const name of names) await expect(page.locator(`[data-nbl-look="${name}"]`)).toBeEnabled();
  await expect(page.locator("[data-nbl-premium-outfits]")).toBeDisabled();
  await page.locator('[data-nbl-look="cargoWave"]').click();
  await expect(image).toHaveAttribute("src","/Beans_Hi_Cargo.png");
  await page.locator('[data-nbl-customize-tab="appearance"]').click();
  // A local image can change independently; do not upload it to Beans or replace the character.
  const tinyPng=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+tm1sAAAAASUVORK5CYII=","base64");
  await page.locator('[data-nbl-customize-photo="greeting"]').setInputFiles({name:"personal.png",mimeType:"image/png",buffer:tinyPng});
  await expect(image).toHaveAttribute("src","/Beans_Hi_Cargo.png");
  const customBackground=await stage.evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(customBackground).toContain("blob:");
  await page.locator('[data-nbl-customize-tab="wardrobe"]').click();
  await page.locator('[data-nbl-look="jersey"]').click();
  await expect(image).toHaveAttribute("src","/Beans_Hi_Soccer.png");
  const keptBackground=await stage.evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(keptBackground).toBe(customBackground);
  await page.locator('[data-nbl-look="standard"]').click();
  await expect(image).toHaveAttribute("src","/Beans_Hi_Basic.png");
  expect(await stage.evaluate(el=>getComputedStyle(el).backgroundImage)).toBe(customBackground);
});

test("Beans composer keeps the message field widest and exposes real microphone and intelligence controls", async ({page})=>{
  await page.goto("/",{waitUntil:"domcontentloaded"});
  await page.getByRole("button",{name:"Open Beans"}).click();
  const field=page.locator("#nbl-beans-input");
  const mic=page.locator("[data-nbl-beans-mic]");
  const intelligence=page.locator("[data-nbl-intelligence-toggle]");
  await expect(mic.locator("svg")).toBeVisible();
  await expect(intelligence).toBeVisible();
  const textWidth=await field.evaluate(el=>el.getBoundingClientRect().width);
  const micWidth=await mic.evaluate(el=>el.getBoundingClientRect().width);
  expect(textWidth).toBeGreaterThan(micWidth*3);
  await intelligence.click();
  await expect(page.locator("[data-nbl-intelligence-menu]")).toBeVisible();
  await page.locator('[data-nbl-intelligence-level="medium"]').click();
  await expect(intelligence).toHaveAttribute("aria-label","Beans intelligence: Medium");
  await field.fill("Test the welcome dismissal");
  await expect(page.locator("[data-nbl-beans-presence]")).toBeHidden();
});
