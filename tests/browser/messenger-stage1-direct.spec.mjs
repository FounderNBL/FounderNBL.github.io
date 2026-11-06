import { test, expect } from "@playwright/test";

// Stage 1 CONTRACT TEST with two simulated Clerk identities and a shared
// in-memory API. This checks real browser UI behavior, NOT real customer
// credentials, deployed backend security, or live person-to-person delivery.
test("Stage 1: two independent NBL accounts can exchange DM replies in the browser UI (simulated API)", async ({browser,baseURL})=>{
  const threadId="123e4567-e89b-42d3-a456-426614174111";
  let threadExists=false;
  const messages=[];
  const contexts=[];
  const members={
    "token-founder":{id:"founder_user",handle:"NBLFounderOfficial",role:"founder"},
    "token-member":{id:"member_user",handle:"newmember",role:"ordinary"}
  };
  function threadsFor(who){
    if(!threadExists)return [];
    const peer=who==="token-founder"
      ?{handle:"newmember",verified:false}
      :{handle:"NBLFounderOfficial",verified:true};
    return [{id:threadId,thread_type:"direct",peer,muted:false}];
  }
  async function makePage(who){
    const context=await browser.newContext();
    contexts.push(context);
    const page=await context.newPage();
    const identity=members[who];
    await page.addInitScript(({id,token})=>{
      const session={getToken:async()=>token};
      window.Clerk={
        load:async()=>{},
        get user(){return {id};},
        get session(){return session;},
        get isSignedIn(){return true;},
        addListener:()=>()=>{},
        signOut:async()=>{}
      };
    },{id:identity.id,token:who});
    await page.route("**/social-realtime.js*",route=>route.fulfill({
      status:200,contentType:"application/javascript",
      body:"window.NBLSocialRealtime={watchInbox(){return ()=>{}},watchThread(){return ()=>{}}};"
    }));
    await page.route("**/functions/v1/nbl-messenger-push",route=>route.fulfill({
      status:200,contentType:"application/json",
      body:JSON.stringify({ok:true,publicKey:"AA"})
    }));
    await page.route("**/functions/v1/nbl-meta-page-inbox*",route=>route.fulfill({
      status:403,contentType:"application/json",
      body:JSON.stringify({ok:false,reason:"not_in_stage1_test"})
    }));
    await page.route("**/functions/v1/nbl-social",async route=>{
      const token=(route.request().headers().authorization||"").replace(/^Bearer /i,"");
      const actor=members[token];
      if(!actor)return route.fulfill({status:401,contentType:"application/json",body:'{"ok":false,"reason":"sign_in_required"}'});
      const data=route.request().postDataJSON();
      let reply={ok:true};
      if(data.action==="me")reply.me={handle:actor.handle,role:actor.role};
      else if(data.action==="list_threads")reply.threads=threadsFor(token);
      else if(data.action==="find_users")reply.users=token==="token-member"?
        [{handle:"NBLFounderOfficial",verified:true}]:[];
      else if(data.action==="direct"){
        if(token==="token-member"&&data.handle==="NBLFounderOfficial"){
          threadExists=true;
          reply={ok:true,threadId,target:{handle:"NBLFounderOfficial",verified:true}};
        }else reply={ok:false,reason:"user_not_found"};
      }else if(data.action==="list_messages"){
        if(!threadExists)reply={ok:false,reason:"thread_access_denied"};
        else reply={ok:true,messages};
      }else if(data.action==="send"){
        if(!threadExists)reply={ok:false,reason:"thread_access_denied"};
        else{
          const sent={
            id:"123e4567-e89b-42d3-a456-"+String(messages.length+1).padStart(12,"0"),
            threadId,sender:{handle:actor.handle,verified:actor.role==="founder"},
            body:data.message,createdAt:new Date().toISOString(),deleted:false
          };
          messages.push(sent);
          reply={ok:true,message:sent};
        }
      }else throw Error("Unexpected API action: "+data.action);
      return route.fulfill({status:reply.ok?200:403,contentType:"application/json",body:JSON.stringify(reply)});
    });
    await page.goto(new URL("/messenger/",baseURL).href);
    await expect(page.locator("[data-chat-myhandle]")).toHaveText("@"+identity.handle);
    return page;
  }
  try{
    const founder=await makePage("token-founder");
    const member=await makePage("token-member");
    await expect(member.locator("[data-chat-featured-founder]")).toBeVisible();
    await expect(founder.locator("[data-chat-featured-founder]")).toBeHidden();
    await member.locator("[data-chat-featured-message]").click();
    await expect(member.locator("[data-chat-thread-title]")).toContainText("@NBLFounderOfficial");
    await member.locator("[data-chat-compose]").fill("Hello from a real member UI test.");
    await member.locator("[data-chat-send-form] button[type=submit]").click();
    await expect(member.locator("[data-chat-messages]")).toContainText("Hello from a real member UI test.");
    await founder.locator("[data-chat-refresh]").click();
    await founder.locator("[data-chat-threads] .thread").first().click();
    await expect(founder.locator("[data-chat-messages]")).toContainText("Hello from a real member UI test.");
    await founder.locator("[data-chat-compose]").fill("Hello back from the Founder UI test.");
    await founder.locator("[data-chat-send-form] button[type=submit]").click();
    await member.locator("[data-chat-refresh]").click();
    await expect(member.locator("[data-chat-messages]")).toContainText("Hello back from the Founder UI test.");
  }finally{
    await Promise.all(contexts.map(context=>context.close()));
  }
});
