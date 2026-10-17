import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";

test.beforeEach(async({page})=>{
  // Exercise the REAL page, IndexedDB, import/export buttons and NBL Reader.
  // Mock ONLY paid/external engine scripts so CI needs no CDN or provider key.
  await page.addInitScript(()=>{
    class FakePdf {
      constructor(){this.count=1;}
      setProperties(){}setFont(){}setFontSize(){}text(){}
      splitTextToSize(text){return String(text).match(/.{1,65}/g)||[""];}
      addPage(){this.count++;}
      output(format){if(format!=="blob")throw Error("not blob");
        return new Blob(["%PDF-1.7\n", "X".repeat(1400)],{type:"application/pdf"});}
    }
    window.jspdf={jsPDF:FakePdf};
    window.pdfjsLib={
      GlobalWorkerOptions:{},
      getDocument:()=>({promise:Promise.resolve({
        numPages:2,
        getPage:async number=>({
          getTextContent:async()=>({items:[{str:"Real text from page "+number+" that a user can edit."}]}),
          getViewport:({scale})=>({width:432*scale,height:648*scale}),
          render:()=>({promise:Promise.resolve()})
        }),
        destroy:async()=>{}
      })})
    };
  });
  for(const src of [
    "**/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "**/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js",
    "**/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    "**/npm/jszip@3.10.1/**",
    "**/npm/epubjs@0.3.93/**"
  ])await page.route(src,route=>route.fulfill({status:200,contentType:"application/javascript",body:"/* external engine mocked in this isolated test */"}));
});
test("NBL Books draft is given to NBL Reader and can be opened on the same device",async({page})=>{
  await page.goto("/book-creator.html");
  await expect(page.getByRole("heading",{name:"Create Your Own Book"})).toBeVisible();
  await page.locator("#title").fill("My Reader Test");
  await page.locator("#author").fill("NBL Guest");
  await page.locator("#manuscript").fill("This is a complete local draft produced for the book reader handoff test.");
  await page.locator("#make-pdf").click();
  await expect(page.locator("#creator-status")).toContainText("Your PDF is ready");
  await page.locator("#give-to-reader").click();
  await expect(page.locator("#creator-status")).toContainText("Saved");
  await page.getByRole("link",{name:"Open my library"}).click();
  await expect(page.locator("#library-count")).toHaveText("1 book");
  await expect(page.getByRole("heading",{name:"My-Reader-Test-reading-draft.pdf"})).toBeVisible();
  await page.getByRole("button",{name:"Read"}).click();
  await expect(page.locator("#page-label")).toHaveText("Page 1 of 2");
  await page.locator("#next-page").click();
  await expect(page.locator("#page-label")).toHaveText("Page 2 of 2");
  await page.locator("#save-position").click();
  await expect(page.locator("#reader-status")).toContainText("Bookmark saved");
});
test("PDF giver causes a device download, not a Lulu print order",async({page})=>{
  await page.goto("/book-creator.html");
  await page.locator("#title").fill("My Copy");
  await page.locator("#author").fill("Book Writer");
  await page.locator("#manuscript").fill("The user can download this reading draft freely without any order or bill.");
  await page.locator("#make-pdf").click();
  const wait=page.waitForEvent("download");
  await page.locator("#download-pdf").click();
  const download=await wait;
  assertPath(download.suggestedFilename());
  const path=await download.path();
  const bytes=readFileSync(path);
  expect(bytes.subarray(0,5).toString("utf8")).toBe("%PDF-");
  await expect(page.locator("#creator-status")).toContainText("Download requested");
  await expect(page.getByText("Lulu orders held")).toBeVisible();
});
function assertPath(name){if(name!=="My-Copy-reading-draft.pdf")throw Error("Incorrect delivered PDF filename: "+name);}
test("customer PDF can be read into editable manuscript without network upload",async({page})=>{
  await page.goto("/book-creator.html");
  const buffer=Buffer.from("%PDF-1.7\n"+"I".repeat(900));
  await page.locator("#import-file").setInputFiles({name:"My Source.pdf",mimeType:"application/pdf",buffer});
  await expect(page.locator("#creator-status")).toContainText("Extracted text from 2 PDF pages");
  await expect(page.locator("#manuscript")).toHaveValue(/Real text from page 2/);
  await expect(page.locator("#title")).toHaveValue("My Source");
});
