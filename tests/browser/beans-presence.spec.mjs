import { test, expect } from "@playwright/test";

test("Beans stays visible as a separate character while messages scroll", async ({page}) => {
  await page.goto("/", {waitUntil:"domcontentloaded"});
  await page.getByRole("button", {name:"Open Beans"}).click();
  const stage=page.locator("#nbl-chat-panel-beans [data-nbl-beans-presence]");
  const artwork=stage.locator("img.nbl-beans-presence-art");
  await expect(stage).toBeVisible();
  await expect(artwork).toHaveAttribute("src","/beans_01_wave_nbl.png");
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
  await expect(stage).toBeVisible();
  await expect(artwork).toBeVisible();
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
  await expect(image).toHaveAttribute("src","/beans_04_cargo_wave_messenger.png");
  await page.locator('[data-nbl-customize-tab="appearance"]').click();
  // A local image can change independently; do not upload it to Beans or replace the character.
  const tinyPng=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+tm1sAAAAASUVORK5CYII=","base64");
  await page.locator('[data-nbl-customize-photo="greeting"]').setInputFiles({name:"personal.png",mimeType:"image/png",buffer:tinyPng});
  await expect(image).toHaveAttribute("src","/beans_04_cargo_wave_messenger.png");
  const customBackground=await stage.evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(customBackground).toContain("blob:");
  await page.locator('[data-nbl-customize-tab="wardrobe"]').click();
  await page.locator('[data-nbl-look="jersey"]').click();
  await expect(image).toHaveAttribute("src","/beans_03_jersey_wave.png");
  const keptBackground=await stage.evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(keptBackground).toBe(customBackground);
  await page.locator('[data-nbl-look="standard"]').click();
  await expect(image).toHaveAttribute("src","/beans_01_wave_nbl.png");
  expect(await stage.evaluate(el=>getComputedStyle(el).backgroundImage)).toBe(customBackground);
});
