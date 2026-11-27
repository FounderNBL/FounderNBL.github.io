import {test,expect} from "@playwright/test";

// Exercise the real website composer and renderer. Sessions and responses are
// fixtures; this suite never contacts Clerk, a model, billing or customer data.
async function prepare(page,{signedIn=true,reply={},chatHandler=null,connectHandler=null}={}){
  const calls=[];
  await page.addInitScript(({signedIn})=>{
    let userId=signedIn?"user_service_fixture":null;
    const listeners=[];
    window.Clerk={
      load:async()=>{},addListener:fn=>{listeners.push(fn);},
      get isSignedIn(){return Boolean(userId);},
      get user(){return userId?{id:userId,primaryEmailAddress:{emailAddress:"services@example.test"}}:null;},
      get session(){return userId?{getToken:async()=>"fixture.service.token"}:null;}
    };
    window.__serviceFixtureAccount=id=>{userId=id;listeners.forEach(fn=>fn());};
  },{signedIn});
  await page.route("https://clerk.newbeansland.org/**",route=>route.abort());
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/**",async route=>{
    const request=route.request();
    const url=new URL(request.url());
    calls.push({path:url.pathname,method:request.method(),authorization:request.headers().authorization,body:request.postDataJSON()});
    if(url.pathname.endsWith("/nbl-core/connect")&&connectHandler)return connectHandler(route);
    if(url.pathname.endsWith("/nbl-core/chat")){
      if(chatHandler) return chatHandler(route);
      return route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({
        message:"Here is the NBL service you asked for.",authenticated:true,
        toolsUsed:["nbl_services"],readOnly:true,serviceVerified:true,...reply
      })});
    }
    return route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({messages:[],conversations:[],meter:{},providers:[],knowledge:{}})});
  });
  await page.goto("/",{waitUntil:"domcontentloaded"});
  await page.getByRole("button",{name:"Open Beans",exact:true}).click();
  await expect(page.locator("[data-nbl-drawer-account-action]")).toHaveText(signedIn?"Sign out":"Sign in");
  return calls;
}

async function send(page,text="Open my NBL service"){
  await page.locator("#nbl-beans-input").fill(text);
  await page.locator("#nbl-beans-input").press("Enter");
}

const destinations=[
  ["music","Open Identity","https://newbeansland.org/studio/?track=identity"],
  ["books","Open NBL Books","https://newbeansland.org/books.html"],
  ["reader","Open NBL Reader","https://newbeansland.org/reader.html"],
  ["creator","Open Book Creator","https://newbeansland.org/book-creator.html"],
  ["studio","Open video creator","https://newbeansland.org/studio/creator.html"],
  ["Pulse","Open NBL Pulse","https://newbeansland.org/pulse/"],
  ["Messenger","Open NBL Messenger","https://newbeansland.org/messenger/"],
  ["account","Open NBL account","https://newbeansland.org/account.html"],
  ["clothing","Open NBL clothing","https://newbeansland.org/clothing.html"]
];

for(const [department,label,url] of destinations){
  test(`website Beans renders the ${department} service action from its chat response`,async({page})=>{
    const calls=await prepare(page,{reply:{actions:[{label,url}]}});
    await send(page);
    const group=page.getByRole("group",{name:"NBL services",exact:true});
    const link=group.getByRole("link",{name:label,exact:true});
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href",url);
    await expect(link).toHaveAttribute("target","_blank");
    await expect(link).toHaveAttribute("rel","noopener noreferrer");
    await expect(page.locator("[data-nbl-beans-status]")).toHaveText("Beans checked the NBL service.");
    const chat=calls.filter(call=>call.path.endsWith("/nbl-core/chat"));
    expect(chat).toHaveLength(1);
    expect(chat[0].authorization).toBe("Bearer fixture.service.token");
    expect(chat[0].body.clientChannel).toBe("website");
    expect(chat[0].body.messages.at(-1).content).toBe("Open my NBL service");
    expect(calls.some(call=>/billing|checkout|generate|reserve/.test(call.path))).toBe(false);
    const box=await link.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
}

test("service action click opens the exact track without replacing the Beans conversation",async({page,context})=>{
  await context.route("https://newbeansland.org/studio/**",route=>route.fulfill({
    status:200,contentType:"text/html",body:"<title>NBL Music destination fixture</title><h1>NBL Music destination</h1>"
  }));
  await prepare(page,{reply:{message:"Identity is in the published music catalog.",actions:[{label:"Open Identity",url:destinations[0][2]}]}});
  await send(page,"Find Identity in NBL Music");
  const opened=context.waitForEvent("page");
  await page.getByRole("group",{name:"NBL services"}).getByRole("link",{name:"Open Identity"}).click();
  const player=await opened;
  await expect(player).toHaveURL(destinations[0][2]);
  await expect(player.getByRole("heading",{name:"NBL Music destination"})).toBeVisible();
  await expect(page.locator("[data-nbl-beans-log]")).toContainText("Identity is in the published music catalog.");
});

test("navigation-only replies remain useful without claiming a service was verified",async({page})=>{
  await prepare(page,{reply:{serviceVerified:false,actions:[{label:"Open NBL Reader",url:destinations[2][2]}]}});
  await send(page,"Open my reader");
  await expect(page.getByRole("group",{name:"NBL services"}).getByRole("link",{name:"Open NBL Reader"})).toBeVisible();
  await expect(page.locator("[data-nbl-beans-status]")).toHaveText("Open the NBL service from Beans' reply.");
});

test("malformed or unsafe actions are discarded, labels stay text, and links are bounded",async({page})=>{
  const invalid=[null,{}, {label:"Missing URL"}, {label:"",url:destinations[0][2]},
    {label:"script",url:"javascript:alert(1)"},
    {label:"external",url:"https://newbeansland.org.evil.test/studio/"},
    {label:"credentials",url:"https://attacker@newbeansland.org/studio/"},
    {label:"insecure",url:"http://newbeansland.org/reader.html"},
    {label:"command",url:"https://newbeansland.org/account.html?action=delete"},
    {label:"checkout",url:"https://newbeansland.org/billing/checkout"},
    {label:"extra music command",url:"https://newbeansland.org/studio/?track=identity&buy=true"},
    {label:"duplicate selectors",url:"https://newbeansland.org/studio/?track=identity&track=other"},
    {label:"hash",url:"https://newbeansland.org/reader.html#command"}];
  const literal='<img src=x onerror="window.__unsafeAction=true">';
  await prepare(page,{reply:{actions:[...invalid,
    {label:literal,url:destinations[0][2]},
    {label:"duplicate",url:destinations[0][2]},
    ...destinations.slice(1,6).map(([,label,url])=>({label,url}))]}});
  await send(page);
  const group=page.getByRole("group",{name:"NBL services"});
  await expect(group.getByRole("link")).toHaveCount(4);
  await expect(group.getByRole("link",{name:literal,exact:true})).toBeVisible();
  await expect(group.locator("img,script")).toHaveCount(0);
  expect(await page.evaluate(()=>window.__unsafeAction)).toBeUndefined();
  await expect(group.getByRole("link",{name:"duplicate",exact:true})).toHaveCount(0);
});

test("ordinary replies still render when actions are missing or malformed",async({page})=>{
  await prepare(page,{reply:{message:"Hey. What's up?",toolsUsed:[],actions:{url:destinations[0][2]}}});
  await send(page,"Hi Beans");
  await expect(page.locator("[data-nbl-beans-log]")).toContainText("Hey. What's up?");
  await expect(page.getByRole("group",{name:"NBL services"})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Copy Beans reply"}).last()).toBeVisible();
});

test("signed-out messages stay unsent and do not expose service actions",async({page})=>{
  const calls=await prepare(page,{signedIn:false});
  await send(page,"Check my Studio wallet");
  await expect(page.locator("[data-nbl-beans-status]")).toContainText("Create a free NBL account or sign in");
  await expect(page.locator("#nbl-beans-input")).toHaveValue("Check my Studio wallet");
  expect(calls.filter(call=>call.path.endsWith("/nbl-core/chat"))).toHaveLength(0);
  await expect(page.getByRole("group",{name:"NBL services"})).toHaveCount(0);
});

test("a late service response cannot appear after the NBL account changes",async({page})=>{
  let release;
  let finish;
  const pending=new Promise(resolve=>{release=resolve;});
  const completed=new Promise(resolve=>{finish=resolve;});
  const calls=await prepare(page,{chatHandler:async route=>{
    await pending;
    await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({
      message:"Private fixture balance: 731 credits",toolsUsed:["nbl_services"],serviceVerified:true,
      actions:[{label:"Open video creator",url:destinations[4][2]}]
    })}).catch(()=>{});
    finish();
  }});
  await send(page,"Check my Studio wallet");
  await expect.poll(()=>calls.some(call=>call.path.endsWith("/nbl-core/chat"))).toBe(true);
  await page.evaluate(()=>window.__serviceFixtureAccount("user_other_fixture"));
  release();
  await completed;
  await expect(page.locator("[data-nbl-beans-form] button[type=submit]")).toBeEnabled();
  await expect(page.locator("[data-nbl-beans-log]")).not.toContainText("731 credits");
  await expect(page.getByRole("group",{name:"NBL services"})).toHaveCount(0);
});

test("sidebar Tools remains open after its opening click and Still does not block other tools",async({page})=>{
 await page.setViewportSize({width:1376,height:736});
 await prepare(page,{connectHandler:route=>route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({providers:[{id:"canva",configured:true}],connections:[{provider:"canva",label:"Fixture Canva"}],canvaDesignWriteAvailable:true})})});
 await page.locator("[data-nbl-drawer-tools]").click();
 await expect(page.locator("[data-nbl-tools-menu]")).toBeVisible();
 await page.locator('[data-nbl-tool="still-canva"]').click();
 await expect(page.getByRole("button",{name:"Show my Canva designs"})).toBeVisible();
 await expect(page.getByRole("button",{name:"Disconnect Canva"})).toBeVisible();
 await page.locator("[data-nbl-drawer-tools]").click();
 await expect(page.locator("[data-nbl-still-tools]")).toBeHidden();
 await expect(page.locator("[data-nbl-tools-menu]")).toBeVisible();
 await page.locator('[data-nbl-tool="voice-settings"]').click();
 await expect(page.locator("[data-nbl-voice-settings]")).toBeVisible();
 const fits=await page.locator(".nbl-chat-drawer-scroll").evaluate(el=>el.scrollWidth<=el.clientWidth+1);
 expect(fits).toBe(true);
});
