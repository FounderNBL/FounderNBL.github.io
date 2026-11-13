import { test, expect } from "@playwright/test";

const checkingLive = Boolean(process.env.NBL_BASE_URL);
const expectBillingReleaseUi = !checkingLive || process.env.NBL_EXPECT_BILLING_LIVE === "1";

async function open(path, page) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test.describe("New Beansland web app browser smoke", () => {
  test("home page exposes the core public doors", async ({ page }) => {
    await open("/", page);

    await expect(page).toHaveTitle(/New Beansland/i);
    await expect(page.locator('.world-card[href="books.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="stories.html"]')).toHaveCount(0);
    await expect(page.locator('.world-card[href="university.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="studio/"]')).toBeVisible();
    await expect(page.locator('.world-card[href="studios.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="games.html"]')).toBeVisible();
    await expect(page.locator('.world-card[href="clothing.html"]')).toBeVisible();
    await expect(page.locator('.world-grid .world-card')).toHaveCount(6);
    await expect(page.locator('.world-grid .world-card').last()).toHaveAttribute('href','university.html');
  });


  test("official Founder World Card artwork survives all deferred scripts", async ({ page }) => {
    await page.goto("/", {waitUntil:"load"});
    const cards=[
      ["clothing.html","NBL_Clothing_Co.png"],
      ["books.html","NBL_Books.png"],
      ["games.html","NBL_Games.png"],
      ["studio/","NBL_Music_Productions%20(1).png"],
      ["studios.html","NBL_Studios.png"],
      ["university.html","NBL_University.png"]
    ];
    await expect(page.locator(".world-card.official-art")).toHaveCount(6);
    for(const [href,name] of cards) {
      const img=page.locator('.world-card.official-art[href="'+href+'"] .media img');
      await expect.poll(async()=>img.getAttribute("src")).toContain(name);
      await expect(img).toHaveCSS("object-fit","contain");
      await expect.poll(async()=>img.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
    }
    await expect(page.locator('.world-card[href="clothing.html"]')).toHaveCount(1);
    await expect(page.locator('.world-card.official-art').first()).toHaveCSS("aspect-ratio","4 / 3");
    const order=await page.locator(".world-grid .world-card").evaluateAll(nodes=>nodes.map(node=>node.getAttribute("href")));
    expect(order).toEqual(cards.map(([href])=>href));

    // All six cards must be visually even on both desktop and phone viewports,
    // despite portrait book art and landscape studio, clothing, and games art.
    const layout=await page.locator(".world-grid .world-card").evaluateAll(nodes=>nodes.map(card=>{
      const {width,height}=card.getBoundingClientRect();
      const image=card.querySelector(".media img");
      const fill=getComputedStyle(card.querySelector(".media"),"::before").backgroundImage;
      return {width,height,imageSrc:image.getAttribute("src"),fill};
    }));
    const widths=layout.map(card=>card.width),heights=layout.map(card=>card.height);
    expect(Math.max(...widths)-Math.min(...widths)).toBeLessThanOrEqual(2);
    expect(Math.max(...heights)-Math.min(...heights)).toBeLessThanOrEqual(2);
    for(const card of layout){
      expect(card.height).toBeGreaterThan(0);
      expect(Math.abs(card.width/card.height-4/3)).toBeLessThan(.04);
      expect(card.fill).toContain(card.imageSrc);
    }
  });

  test("Beans PDF Reader opens a local PDF without an AI or upload request",async({page})=>{
    let pdfUploads=0;
    await page.route("**/functions/v1/**",route=>{
      if(route.request().method()==="POST")pdfUploads++;
      return route.fulfill({status:200,contentType:"application/json",body:"{}"});
    });
    await page.route("**/pdf.js/3.11.174/pdf.min.js",route=>route.fulfill({
      status:200,contentType:"application/javascript",
      body:"window.pdfjsLib={GlobalWorkerOptions:{},getDocument:()=>({promise:Promise.resolve({numPages:2,destroy:async()=>{},getPage:async()=>({getViewport:()=>({width:400,height:520}),render:()=>({promise:Promise.resolve()}),getTextContent:async()=>({items:[{str:'Local NBL PDF page',transform:[1,0,0,1,20,100]}]})})})})};"
    }));
    await page.route("**/tesseract.js@5.1.1/**",route=>route.fulfill({
      status:200,contentType:"application/javascript",
      body:"window.Tesseract={createWorker:async()=>({recognize:async()=>({data:{text:'Scanned NBL page'}}),terminate:async()=>{}})};"
    }));
    await open("/",page);
    await page.getByRole("button",{name:"Open Beans"}).click();
    await page.getByRole("button",{name:"Open Beans tools"}).click();
    await page.locator('[data-nbl-tool="pdf-local"]').click();
    const pdf=page.getByRole("dialog",{name:"NBL PDF Reader"});
    await expect(pdf).toBeVisible();
    await pdf.locator('[data-file]').setInputFiles({name:"local.pdf",mimeType:"application/pdf",buffer:Buffer.from("%PDF-1.7\n"+" ".repeat(1000))});
    await expect(pdf.locator('[data-count]')).toContainText("1 / 2");
    await expect(pdf.locator('[data-text]')).toContainText("Local NBL PDF page");
    await pdf.getByRole("button",{name:"Next →"}).click();
    await expect(pdf.locator('[data-count]')).toContainText("2 / 2");
    await pdf.getByRole("button",{name:"OCR this page"}).click();
    await expect(pdf.locator('[data-text]')).toContainText("Scanned NBL page");
    await pdf.getByRole("button",{name:"Extract entire PDF"}).click();
    await expect(pdf.locator("[data-status]")).toContainText("All 2 pages have extractable text");
    const saved=page.waitForEvent("download");
    await pdf.getByRole("button",{name:"Download full text"}).click();
    expect((await saved).suggestedFilename()).toBe("local-all-pages.txt");
    expect(pdfUploads).toBe(0);
    // Ask Beans is opt-in: attaching only adds a draft file; no AI request is made.
    await pdf.getByRole("button",{name:"Attach PDF to Beans"}).click();
    await expect(pdf).toBeHidden();
    await expect(page.locator('[data-nbl-beans-attachments]')).toContainText("local.pdf");
    expect(pdfUploads).toBe(0);
    await page.getByRole("button",{name:"Open Beans tools"}).click();
    await page.locator('[data-nbl-tool="pdf-local"]').click();
    await expect(pdf).toBeVisible();
    await pdf.getByRole("button",{name:"Close"}).click();
    await expect(pdf).toBeHidden();
  });

  test("local PDF reader accepts a 369-page file, checks mobile button hit targets, and extracts all text",async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.route("**/pdf.js/3.11.174/pdf.min.js",route=>route.fulfill({
      status:200,contentType:"application/javascript",
      body:`window.pdfjsLib={GlobalWorkerOptions:{},getDocument:()=>({promise:Promise.resolve({numPages:369,destroy:async()=>{},getPage:async n=>({getViewport:()=>({width:400,height:520}),render:()=>({promise:Promise.resolve()}),getTextContent:async()=>({items:[{str:'Page '+n+' of 369',transform:[1,0,0,1,20,100]}]})})})})};`
    }));
    await page.goto("/");
    await page.getByRole("button",{name:"Open Beans"}).click();
    await page.getByRole("button",{name:"Open Beans tools"}).click();
    await page.locator('[data-nbl-tool="pdf-local"]').click();
    const dialog=page.getByRole("dialog",{name:"NBL PDF Reader"});
    await dialog.locator("[data-file]").setInputFiles({
      name:"full-182-conversations.pdf",mimeType:"application/pdf",
      buffer:Buffer.from("%PDF-1.7\\n"+" ".repeat(1200))
    });
    await expect(dialog.locator("[data-count]")).toContainText("Page 1 / 369");
    // This checks actual pointer hit geometry on a phone-sized viewport.
    for(const name of ["[data-next]","[data-ocr]","[data-all]","[data-beans]"]){
      const target=dialog.locator(name);
      await target.scrollIntoViewIfNeeded();
      const hit=await target.evaluate(button=>{
        const box=button.getBoundingClientRect();
        const top=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
        return button===top||button.contains(top);
      });
      expect(hit,`Wrong mobile touch target for ${name}`).toBe(true);
    }
    await dialog.locator("[data-all]").click();
    await expect(dialog.locator("[data-status]")).toContainText("All 369 pages have extractable text",{timeout:30000});
    await expect(dialog.locator("[data-download]")).toBeEnabled();
    await dialog.locator("[data-next]").click();
    await expect(dialog.locator("[data-count]")).toContainText("Page 2 / 369");
  });

  test("Canva is paused while Beans image, camera and files remain available",async({page})=>{
    await open("/",page);
    await page.getByRole("button",{name:"Open Beans"}).click();
    const beans=page.locator("#nbl-beans-panel");
    await page.getByRole("button",{name:"Open Beans tools"}).click();
    await expect(page.locator('[data-nbl-tool="still-canva"]')).toHaveCount(0);
    await expect(page.locator('[data-nbl-tool="image"]')).toBeVisible();
    await expect(page.locator('[data-nbl-tool="still-camera"]')).toBeVisible();
    await expect(page.locator('[data-nbl-tool="attach"]')).toBeVisible();
    await expect(beans.locator("#nbl-beans-input")).toBeVisible();
    await expect(beans.locator("#nbl-beans-title")).toContainText("Beans");
  });

  test("signed-in NBL account also appears signed in to desktop Beans, using the shared Clerk singleton", async ({ page }) => {
    // Model an account already signed into the website before Beans opens.
    // No real identity, model calls, paid tools or account data are used.
    await page.setViewportSize({width:1366,height:768});
    await page.addInitScript(() => {
      window.Clerk={
        isSignedIn:true,
        session:{id:"session_fixture",getToken:async()=>"fixture.jwt"},
        user:{id:"user_fixture",primaryEmailAddress:{emailAddress:"test@example.org"}},
        async load(){}, addListener(){}
      };
    });
    await page.route("https://tvypdakofcrlvnwporhh.supabase.co/**", route => route.fulfill({
      status:200, contentType:"application/json",
      body:JSON.stringify({conversations:[],messages:[],meter:{}})
    }));
    await open("/",page);
    await page.getByRole("button",{name:"Open Beans"}).click();
    const drawer=page.locator("[data-nbl-chat-drawer]");
    await expect(drawer).toBeVisible();
    await expect(drawer).not.toHaveAttribute("hidden",/./);
    await expect(drawer.locator("[data-nbl-drawer-account-action]")).toHaveText("Sign out");
    await expect(page.locator("[data-nbl-beans-auth-note]")).toBeHidden();
    expect(await page.evaluate(()=>window.NBLAccountBridge.getToken())).toBe("fixture.jwt");
  });

  test("laptop-sized Beans fits the screen and its menu can scroll and switch official looks", async ({ page }) => {
    await page.setViewportSize({width:1024,height:680});
    await open("/",page);
    await page.getByRole("button",{name:"Open Beans"}).click();
    const drawer=page.locator("[data-nbl-chat-drawer]");
    const toggle=page.getByRole("button",{name:"Open Beans menu"});
    await expect(toggle).toBeVisible();
    await expect(drawer).toBeHidden();
    await toggle.click();
    await expect(drawer).toBeVisible();
    await drawer.locator("[data-nbl-drawer-plans]").click();
    await drawer.locator("details.nbl-drawer-category:not([hidden]) summary").click();
    const scroll=await drawer.locator(".nbl-chat-drawer-scroll").evaluate(el=>{
      el.scrollTop=el.scrollHeight;
      return {top:el.scrollTop,overflow:el.scrollHeight>el.clientHeight};
    });
    expect(scroll.overflow).toBe(true);
    expect(scroll.top).toBeGreaterThan(0);
    await page.getByRole("button",{name:"Close Beans menu"}).click();
    const form=await page.locator("[data-nbl-beans-form]").evaluate(el=>{
      const rect=el.getBoundingClientRect();
      return {top:rect.top,bottom:rect.bottom,height:rect.height};
    });
    expect(form.height).toBeGreaterThan(30);
    expect(form.bottom).toBeLessThanOrEqual(681);
    await page.locator("[data-nbl-customize-open]").click();
    await page.locator('[data-nbl-look="crossed"]').click();
    await expect(page.locator("[data-nbl-beans-presence] img.nbl-beans-presence-art")).toHaveAttribute("src","/Beans_Crossarmed.png");
    await page.locator('[data-nbl-look="jersey"]').click();
    await expect(page.locator("[data-nbl-beans-presence] img.nbl-beans-presence-art")).toHaveAttribute("src","/Beans_Hi_Soccer.png");
  });

  test("Beans AI opens in a real browser", async ({ page }) => {
    await open("/", page);

    const launcher = page.getByRole("button", { name: "Open Beans" });
    await expect(launcher).toBeVisible();
    const launcherImage = launcher.locator("img");
    await expect(launcherImage).toHaveAttribute("src", "/Beans_Hi_Basic.png");
    await expect.poll(async () => launcherImage.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    await launcher.click();

    await expect(page.locator("#nbl-beans-panel")).toBeVisible();
    await expect(page.locator("#nbl-beans-title")).toBeVisible();
    await expect(page.locator(".nbl-beans-head .nbl-beans-grey-link")).toHaveCount(0);
    await expect(page.locator(".nbl-beans-head .nbl-beans-people-link")).toHaveCount(0);
    // Desktop Beans shows a standing sidebar; mobile uses its accessible drawer toggle.
    const mobile=await page.evaluate(()=>matchMedia("(max-width:959px)").matches);
    if(mobile)await page.getByRole("button",{name:"Open Beans menu"}).click();
    const drawer=page.locator("[data-nbl-chat-drawer]");
    await expect(drawer).toBeVisible();
    await expect(drawer.locator(".nbl-beans-library-link")).toBeVisible();
    await expect(drawer.locator(".nbl-beans-explore-worlds")).toBeVisible();
    await drawer.locator(".nbl-beans-explore-worlds summary").click();
    await expect(drawer.getByRole("link",{name:"The City · preview"})).toHaveAttribute("href","/stories.html");
    await expect(drawer.getByRole("link",{name:/Talk to Grey/})).toHaveCount(0);
    await expect(drawer.getByRole("link",{name:/Talk to People/})).toHaveCount(0);
    await expect(drawer.getByRole("link",{name:/Privacy & AI notice/})).toHaveAttribute("href","/privacy.html");
    if(mobile)await page.getByRole("button",{name:"Close Beans menu"}).click();
    await expect(page.locator(".nbl-beans-avatar")).toBeVisible();
    await expect(page.locator(".nbl-beans-avatar")).toHaveAttribute("src","/Beans_Hi_Basic.png");
    await expect(page.getByRole("tab",{name:"Beans"})).toBeHidden();
    await expect(page.locator("[data-nbl-quick-toggle]")).toBeHidden();
    await expect(page.locator("[data-nbl-quick-selector]")).toBeHidden();
    await expect(page.locator("[data-nbl-beans-regular]")).toBeVisible();
    await expect(page.getByRole("tab",{name:/NBL University Professor Grey™/i})).toBeHidden();
    await expect(page.locator(".nbl-beans-hero-copy")).toBeVisible();
    await page.locator("[data-nbl-customize-open]").click();
    await expect(page.locator("[data-nbl-customize-section='wardrobe']")).toBeVisible();
    for(const name of ["standard","crossed","jersey","cargoWave","cargoPoint"]){
      await expect(page.locator(`[data-nbl-look='${name}']`)).toBeEnabled();
    }
    await expect(page.locator("[data-nbl-premium-outfits]")).toBeDisabled();
    await page.locator("[data-nbl-customize-tab='appearance']").click();
    await expect(page.locator("[data-nbl-customize-photo='chat']")).toHaveAttribute("accept","image/png,image/jpeg,image/webp,image/gif");
    await page.locator("[data-nbl-customize-color]").fill("#e6cda5");
    await expect(page.locator(".nbl-beans-card")).toHaveCSS("--nbl-beans-chat-color","#e6cda5");
    await page.locator("[data-nbl-customize-close]").click();
    await expect(page.getByRole("button",{name:"Open Beans tools"})).toBeVisible();
    await page.getByRole("button",{name:"Open Beans tools"}).click();
    await expect(page.getByRole("button",{name:/Photo \/ file/i})).toBeVisible();
    await expect(page.locator('[data-nbl-tool="grey"]')).toHaveCount(0);
    await expect(page.getByRole("button",{name:/Search the live web/i})).toBeVisible();
    await expect(page.getByRole("button",{name:/Code \/ data analysis/i})).toBeVisible();
    await expect(page.getByRole("button",{name:/Create a PDF \/ file/i})).toBeVisible();
    await expect(page.getByRole("button",{name:/Create an image/i})).toBeVisible();
    await expect(page.locator("[data-nbl-university-pdf-form]")).toHaveCount(1);
    await page.getByRole("button",{name:"Open Beans tools"}).click();
    if(expectBillingReleaseUi){
      if(mobile)await page.getByRole("button",{name:"Open Beans menu"}).click();
      await page.locator("[data-nbl-drawer-plans]").click();
      await expect(page.locator("details.nbl-drawer-category:not([hidden])")).toHaveCount(1);
      await expect(page.locator("details.nbl-drawer-category[hidden]")).toHaveCount(2);
      await page.locator("details.nbl-drawer-category:not([hidden]) summary").click();
      await expect(page.getByRole("button",{name:"Beans Starter",exact:true})).toBeEnabled();
      await expect(page.getByRole("button",{name:"NBL Basic",exact:true})).toBeEnabled();
       await expect(page.getByRole("button",{name:"NBL Plus",exact:true})).toBeEnabled();
       await expect(page.getByRole("button",{name:"Founder's Deluxe",exact:true})).toBeEnabled();
      await expect(page.getByRole("button",{name:/Get \+500 replies/i})).toBeVisible();
      await expect(page.getByRole("button",{name:"University membership checkout pending",exact:true})).toBeHidden();
      if(mobile)await page.getByRole("button",{name:"Close Beans menu"}).click();
    }
  });

  test("live guest Beans offers free sign-in without consuming a reply", async ({ page }) => {
    test.skip(!process.env.NBL_BASE_URL, "Live authentication UI check only runs against deployed website.");
    await open("/", page);
    await page.getByRole("button", { name: "Open Beans" }).click();
    const input = page.locator("#nbl-beans-input");
    const send = page.locator("[data-nbl-beans-form] button[type=\"submit\"]");
    const answers = page.locator("[data-nbl-beans-regular] .nbl-beans-message.is-beans p");
    await input.fill("Hi Beans");
    await send.click();
    await expect(page.locator("[data-nbl-beans-auth-note]")).toBeVisible();
    await expect(input).toHaveValue("Hi Beans");
    await expect(answers).toHaveCount(1);
    const signIn = new URL(await page.locator("[data-nbl-beans-signin]").getAttribute("href"));
    const signUp = new URL(await page.locator("[data-nbl-beans-signup]").getAttribute("href"));
    expect(signIn.origin).toBe("https://accounts.newbeansland.org");
    expect(signIn.pathname).toBe("/sign-in");
    expect(signUp.pathname).toBe("/sign-up");
  });

  test("University World Card opens a free-notifications page, not tuition checkout",async({page})=>{
    await open("/",page);
    const card=page.locator('.world-grid .world-card[href="university.html"]');
    await expect(card).toHaveCount(1);
    await card.click();
    await expect(page).toHaveURL(/\/university\.html$/);
    await expect(page.getByRole("heading",{name:"The school is under construction."})).toBeVisible();
    await expect(page.getByRole("heading",{name:"Sign up for free opening updates"})).toBeVisible();
    await expect(page.locator("form[data-nbl-university-interest-form]")).toHaveCount(1);
    await expect(page.locator("#interestKind option")).toHaveCount(3);
    await expect(page.getByRole("button",{name:"Join free notification list"})).toBeVisible();
    await expect(page.getByText("No payment is required or accepted.",{exact:false})).toBeVisible();
    await expect(page.locator('a[href="https://nblschool.com/"]')).toHaveCount(1);
    await expect(page.locator("#nblu-one-entry,#nblu-program,#nblu-offer-price,[data-campus-gate],[data-study-lab],[data-coursework-pdf]")).toHaveCount(0);
  });

  test("old .org campus addresses forward to the independent school, not another classroom",async({page})=>{
    for(const path of ["/campus.html","/university-campus.html"]){
      const response=await page.request.get(path);
      const html=await response.text();
      expect(html).toContain('url=https://nblschool.com/');
      expect(html).not.toContain('data-campus-gate');
    }
  });

  const registeredRoutes = [
    "/", "/books.html", "/stories.html", "/founder-office.html",
    "/studio/", "/account.html", "/university.html", "/campus.html", "/chat.html", "/voice-lab.html"
  ];
  for (const route of registeredRoutes) {
    test("live registered route " + route + " responds without error", async ({ page }) => {
      test.skip(!process.env.NBL_BASE_URL, "External route only; source tests run locally.");
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response, "Expected a response for " + route).not.toBeNull();
      const status = response.status();
      const headers = response.headers();
      if (status === 403 && String(headers["cf-mitigated"] || "").toLowerCase() === "challenge") {
        console.log("NBL_EXTERNAL_UNVERIFIED url=" + route + " http=403 cf-mitigated=challenge cf-ray=" + String(headers["cf-ray"] || "unknown"));
        test.skip(true, "UNVERIFIED: Cloudflare challenged the automated runner; independent human/device proof is still required.");
      }
      expect(status, "Expected " + route + " to be reachable; HTTP " + status).toBeLessThan(400);
    });
  }

  test("legacy same-origin NBL Messenger route offers real member-search and DM affordances", async ({page}) => {
    await open("/chat.html",page);
    await expect(page).toHaveTitle(/NBL Messenger/);
    await expect(page.locator("[data-chat-guest]")).toBeVisible();
    await expect(page.locator("[data-chat-app]")).toBeHidden();
    await expect(page.locator("[data-chat-find-form]")).toHaveCount(1);
    await expect(page.locator("[data-chat-dm-form]")).toHaveCount(1);
    const signInUrl=new URL(await page.getByRole("link",{name:/Sign in \/ create account/i}).getAttribute("href"));
    expect(signInUrl.origin).toBe("https://accounts.newbeansland.org");
    expect(signInUrl.pathname).toBe("/sign-in");
    const returnTo=new URL(signInUrl.searchParams.get("redirect_url"));
    expect(returnTo.origin).toBe(new URL(page.url()).origin);
    expect(returnTo.pathname).toBe("/chat.html");
  });

  test("account recovery uses the Clerk portal with a safe return URL", async ({ page }) => {
    await open("/account.html?source=smoke#account", page);

    const forgot = page.getByRole("link", { name: "Forgot password?" });
    const signIn = page.getByRole("button", { name: "Sign in / recover account" });
    await expect(forgot).toBeVisible();
    await expect(signIn).toBeVisible();

    const href = await forgot.getAttribute("href");
    expect(href).toBeTruthy();
    const portal = new URL(href);
    expect(portal.origin).toBe("https://accounts.newbeansland.org");
    expect(portal.pathname).toBe("/sign-in");

    const redirect = new URL(portal.searchParams.get("redirect_url"));
    const current = new URL(page.url());
    expect(redirect.origin).toBe(current.origin);
    expect(redirect.pathname).toBe("/account.html");
    expect(redirect.searchParams.get("source")).toBe("smoke");
    expect(redirect.hash).toBe("");

    if (expectBillingReleaseUi) {
      await expect(page.locator("#membershipCard")).toBeAttached();
    }
  });

  test("account sign-in remains usable when the Clerk bridge fails", async ({ page }) => {
    await page.route("**/*clerk.browser.js*", (route) => route.abort());
    await page.route("https://accounts.newbeansland.org/**", (route) => route.abort());
    await open("/account.html?source=bridge-failure#account", page);

    const signIn = page.getByRole("button", { name: "Sign in / recover account" });
    const forgot = page.getByRole("link", { name: "Forgot password?" });
    await expect(signIn).toBeVisible();
    await expect(forgot).toBeVisible();
    expect(await signIn.evaluate((button) => typeof button.onclick)).toBe("function");

    const href = new URL(await forgot.getAttribute("href"));
    expect(href.origin).toBe("https://accounts.newbeansland.org");
    expect(href.pathname).toBe("/sign-in");
    const redirect = new URL(href.searchParams.get("redirect_url"));
    expect(redirect.pathname).toBe("/account.html");
    expect(redirect.hash).toBe("");
  });

  test("Clerk delayed sign-in renders account without reloading or redirecting", async ({ page }) => {
    await page.addInitScript(() => {
      // addInitScript also fires inside child frames. A widget or authentication
      // iframe is not a second top-level page load or a redirect loop.
      if (window.self !== window.top) return;
      const k="nbl-auth-loop-browser-loads";
      sessionStorage.setItem(k,String(Number(sessionStorage.getItem(k)||"0")+1));
    });
    // No real user, credential, checkout, or Stripe charge is involved.
    await page.route("**/npm/@clerk/clerk-js@6/dist/clerk.browser.js", route => route.fulfill({
      status:200,
      contentType:"application/javascript",
      body:"window.__nblAuthTestClerk={isSignedIn:false,session:null,user:null,listeners:[],"+
        "async load(){},addListener(fn){this.listeners.push(fn);},"+
        "change(signedIn,userId='user_test_one'){this.isSignedIn=signedIn;"+
        "this.session=signedIn?{id:'session_test',getToken:async()=>null}:null;"+
        "this.user=signedIn?{id:userId,primaryEmailAddress:{emailAddress:'test@example.org'}}:null;"+
        "this.listeners.forEach(fn=>fn());}};window.Clerk=window.__nblAuthTestClerk;"
    }));
    await page.route("https://tvypdakofcrlvnwporhh.supabase.co/**", route => route.fulfill({
      status:200,
      contentType:"application/json",
      body:JSON.stringify({profile:{username:""},usage:{conversations:0,messages:0,modelResponses:0},conversations:[],deliveries:[],meter:{}})
    }));
    await open("/account.html?source=payment-redirect-test",page);
    await expect(page.locator("#signedOut")).toBeVisible();
    await expect(page.locator("#accountBody")).toBeHidden();

    // Portal return can precede Clerk session synchronization.
    // The account must initialize in place, without a second page load.
    await page.evaluate(() => window.__nblAuthTestClerk.change(true));
    await expect(page.locator("#accountBody")).toBeVisible();
    await expect(page.locator("#identityLine")).toContainText("test@example.org");
    expect(new URL(page.url()).searchParams.get("source")).toBe("payment-redirect-test");
    expect(await page.evaluate(() => Number(sessionStorage.getItem("nbl-auth-loop-browser-loads")))).toBe(1);

    // A signed-in account missing its JWT must not bounce back to Clerk.
    const paymentResult=await page.evaluate(async () => {
      try{
        await window.NBLBillingBridge.checkout("beans");
        return "unexpected success";
      }catch(error){
        return String(error.message||error);
      }
    });
    expect(paymentResult).toMatch(/signed in.*secure session.*not finished connecting/i);
    expect(new URL(page.url()).pathname).toBe("/account.html");

    // Another identity must never see the previously initialized account.
    await page.evaluate(() => window.__nblAuthTestClerk.change(true,"user_test_two"));
    await expect(page.locator("#accountBody")).toBeHidden();
    await expect(page.locator("#signedOut")).toBeVisible();
    expect(await page.evaluate(() => Number(sessionStorage.getItem("nbl-auth-loop-browser-loads")))).toBe(1);

    await page.evaluate(() => window.__nblAuthTestClerk.change(false));
    await expect(page.locator("#accountBody")).toBeHidden();
  });

  test("truly signed-out checkout offers sign-in without automatic navigation", async ({ page }) => {
    await page.route("**/npm/@clerk/clerk-js@6/dist/clerk.browser.js", route => route.fulfill({
      contentType:"application/javascript",
      body:"window.Clerk={isSignedIn:false,session:null,async load(){},addListener(){}};"
    }));
    await open("/account.html?source=signout-test",page);
    const result=await page.evaluate(() => window.NBLBillingBridge.checkout("beans"));
    expect(result.signInRequired).toBe(true);
    const portal=new URL(result.signInUrl);
    expect(portal.origin).toBe("https://accounts.newbeansland.org");
    const destination=new URL(portal.searchParams.get("redirect_url"));
    expect(destination.pathname).toBe("/account.html");
    expect(destination.searchParams.get("source")).toBe("signout-test");
    expect(page.url()).toContain("/account.html?source=signout-test");
  });
});
