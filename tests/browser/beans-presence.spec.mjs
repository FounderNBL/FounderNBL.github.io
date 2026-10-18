import { test, expect } from "@playwright/test";

test("Beans stays visible as a separate character while messages scroll", async ({page}) => {
  await page.goto("/", {waitUntil:"domcontentloaded"});
  await page.getByRole("button", {name:"Open Beans"}).click();
  const stage=page.locator("#nbl-chat-panel-beans [data-nbl-beans-presence]");
  const artwork=stage.locator("img.nbl-beans-presence-art");
  await expect(stage).toBeVisible();
  await expect(artwork).toHaveAttribute("src","/Beans.png");
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
