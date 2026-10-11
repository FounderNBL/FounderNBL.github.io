import { test, expect } from "@playwright/test";

// A live CI reader reload can be challenged by Cloudflare even after the
// original page loaded. Skip ONLY when the response explicitly identifies a
// Cloudflare bot challenge; unexplained HTTP errors still fail normally.
async function reloadAndCheckCloudflare(page) {
  const response = await page.reload({waitUntil:"domcontentloaded"});
  if (response?.status() === 403 &&
      String(response.headers()["cf-mitigated"] || "").toLowerCase() === "challenge") {
    console.log("NBL_EXTERNAL_UNVERIFIED reader-reload http=403 cf-mitigated=challenge cf-ray=" +
      String(response.headers()["cf-ray"] || "unknown"));
    test.skip(true, "UNVERIFIED: Cloudflare challenged automated reader reload; requires independent device proof.");
  }
}

// Real browser tests for browser/IndexedDB interaction. Reader engines are
// deliberately mocked so tests never depend on a third-party CDN, paid key,
// customer account, or external book content.
test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    window.pdfjsLib={
      GlobalWorkerOptions:{},
      getDocument(){
        return {promise:Promise.resolve({
          numPages:3,
          getPage:async()=>({
            getViewport:({scale})=>({width:500*scale,height:700*scale}),
            render:()=>({promise:Promise.resolve()})
          }),
          destroy:async()=>{}
        })};
      }
    };
    window.ePub=()=>{
      let relocation=null;
      const rendition={
        themes:{default(){},fontSize(){}},
        on(event,handler){if(event==="relocated")relocation=handler;},
        async display(){
          relocation?.({start:{cfi:"epubcfi(/6/2)",displayed:{page:1,total:8}}});
        },
        async next(){relocation?.({start:{cfi:"epubcfi(/6/4)",displayed:{page:2,total:8}}});},
        async prev(){relocation?.({start:{cfi:"epubcfi(/6/2)",displayed:{page:1,total:8}}});},
        resize(){},
        destroy(){}
      };
      return {ready:Promise.resolve(),renderTo:()=>rendition,destroy(){}};
    };
  });
  for(const url of [
    "**/npm/jszip@3.10.1/**",
    "**/npm/epubjs@0.3.93/**",
    "**/ajax/libs/pdf.js/3.11.174/pdf.min.js"
  ]) {
    await page.route(url,route=>route.fulfill({
      status:200,contentType:"application/javascript",
      body:"/* Local Playwright mock loaded through init script */"
    }));
  }
});

test("NBL Books provides a free local reader door",async({page})=>{
  await page.goto("/books.html",{waitUntil:"domcontentloaded"});
  await expect(page.getByRole("link",{name:/Open My Library/i})).toHaveAttribute("href","/reader.html");
  await page.goto("/reader.html",{waitUntil:"domcontentloaded"});
  await expect(page.getByRole("heading",{name:/Your Library. Your Stories/i})).toBeVisible();
  await expect(page.locator("#library-empty")).toBeVisible();
  await expect(page.locator("#library-count")).toHaveText("0 books");
  await expect(page.locator("#book-file")).toHaveAttribute("accept",/\.epub,\.pdf/);
});

test("PDF imported on device turns pages, saves progress and is removable",async({page})=>{
  await page.goto("/reader.html",{waitUntil:"domcontentloaded"});
  const fakePdf=Buffer.from("%PDF-1.7\n"+"X".repeat(1024));
  await page.locator("#book-file").setInputFiles({name:"Test Story.pdf",mimeType:"application/pdf",buffer:fakePdf});
  await expect(page.locator("#reader-section")).toBeVisible();
  await expect(page.locator("#page-label")).toHaveText("Page 1 of 3");
  await page.locator("#next-page").click();
  await expect(page.locator("#page-label")).toHaveText("Page 2 of 3");
  await page.locator("#save-position").click();
  await expect(page.locator("#reader-status")).toContainText(/Bookmark saved/);
  await reloadAndCheckCloudflare(page);
  await expect(page.locator("#library-count")).toHaveText("1 book");
  await page.getByRole("button",{name:/Continue/}).click();
  await expect(page.locator("#page-label")).toHaveText("Page 2 of 3");
  await page.locator("#close-reader").click();
  page.once("dialog",dialog=>dialog.accept());
  await page.getByRole("button",{name:"Remove"}).click();
  await expect(page.locator("#library-count")).toHaveText("0 books");
});

test("EPUB reads with text size/theme and remembers CFI",async({page})=>{
  await page.goto("/reader.html",{waitUntil:"domcontentloaded"});
  const fakeEpub=Buffer.concat([Buffer.from([0x50,0x4b,0x03,0x04]),Buffer.alloc(1024,66)]);
  await page.locator("#book-file").setInputFiles({name:"My Story.epub",mimeType:"application/epub+zip",buffer:fakeEpub});
  await expect(page.locator("#reader-section")).toBeVisible();
  await expect(page.locator("#page-label")).toContainText("Page 1 of 8");
  await page.locator("#next-page").click();
  await expect(page.locator("#page-label")).toContainText("Page 2 of 8");
  await page.locator("#font-size").selectOption("125");
  await page.locator("#reading-theme").selectOption("sepia");
  await page.locator("#save-position").click();
  await expect(page.locator("#reader-status")).toContainText("Bookmark saved");
  await reloadAndCheckCloudflare(page);
  await page.getByRole("button",{name:"Continue"}).click();
  await expect(page.locator("#font-size")).toHaveValue("125");
  await expect(page.locator("#reading-theme")).toHaveValue("sepia");
});

test("invalid file never enters the local library",async({page})=>{
  await page.goto("/reader.html",{waitUntil:"domcontentloaded"});
  await page.locator("#book-file").setInputFiles({name:"not-a-book.pdf",mimeType:"application/pdf",buffer:Buffer.from("fake".repeat(80))});
  await expect(page.locator("#reader-status")).toContainText(/doesn't appear/);
  await expect(page.locator("#library-count")).toHaveText("0 books");
});
