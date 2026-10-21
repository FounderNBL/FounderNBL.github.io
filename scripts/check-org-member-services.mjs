import fs from "node:fs";
const read=name=>fs.readFileSync(new URL("../"+name,import.meta.url),"utf8");
const files={
  landing:read("university.html"),campus:read("campus.html"),university:read("university.js"),
  chat:read("chat.html"),messages:read("chat.js"),voice:read("voice-lab.html"),
  voiceJs:read("voice-lab.js"),realtime:read("social-realtime.js"),lab:read("study-lab.mjs"),
  header:read("nbl-world-header.js"),account:read("account.html")
};
const failures=[];
const need=(key,needle,why)=>{if(!files[key].includes(needle))failures.push(why);};
const forbid=(key,needle,why)=>{if(files[key].includes(needle))failures.push(why);};

// One Clerk production origin. Account and payment screens must stay on .org.
need("account",'accounts.newbeansland.org',"Verified .org account portal missing.");
need("chat",'href="https://newbeansland.org/chat.html"',"Person-to-person Chat must canonically live on .org.");
need("campus",'href="https://newbeansland.org/campus.html"',"Student campus must canonically live on .org.");
need("header",'href="/messenger/"',"Talk to People must open independent .org Messenger.");
need("header",'href="/campus.html#grey"',"Talk to Grey must open the protected .org campus.");
need("landing",'href="/campus.html"',"University enrollment must open .org classroom.");
need("landing",'data-nbl-university-checkout="foundation" disabled',"University enrollment checkout was unlocked without verification.");
need("landing",'data-nbl-university-checkout="full_foundation" disabled',"Guided enrollment checkout was unlocked without verification.");

// Human Chat is only for signed-in people; messaging is bound to Core/Supabase.
need("chat",'data-chat-guest',"Missing signed-out person-to-person Chat entrance.");
need("chat",'data-chat-app hidden',"Signed-out private messages may become visible.");
need("chat",'data-chat-find-form',"Member handle search is missing.");
need("chat",'data-chat-dm-form',"Start-direct-message control is missing.");
need("messages",'const SOCIAL_API=NBL_CORE_API+"/social"',"Human messages must use guarded NBL Core.");
need("messages",'session.getToken()',"Human messages are missing a Clerk session token.");
need("messages",'"Authorization":"Bearer "+token',"Human messages must send a bearer token.");
need("messages",'action:"direct"',"Start-direct-message API action is missing.");
need("messages",'action:"send"',"Message-send API action is missing.");
forbid("messages",'localStorage.setItem',"Do not cache human Chat tokens or sessions in localStorage.");

// LOCKE/Registrar must gate every protected course action, not just hide content.
need("campus",'data-campus-gate',"University LOCKE gate is missing.");
need("campus",'data-campus hidden',"Protected student campus must be hidden before verification.");
need("campus",'id="grey"',"Professor Grey link no longer reaches its destination.");
need("campus",'data-study-lab',"Student Study Lab is missing.");
need("university",'const API=NBL_CORE_API+"/university"',"Campus must use verified Core University ingress.");
need("university",'const UNIVERSITY_PUBLIC_CHECKOUT_ENABLED=false',"University public checkout release hold was changed.");
need("university",'clerk.session.getToken()',"Campus bearer identity is missing.");
need("university",'action:"university_status"',"Protected University status verification is missing.");
need("university",'action:"grey"',"Professor Grey must go through protected University runtime.");
need("university",'trustedBillingDestination',"Protected checkout destination allowlist is missing.");
need("university",'/study-lab.mjs',"University must load student-safe local Study Lab.");
need("lab",'action: "university_submit_work"',"Study Lab must save to the protected Registrar API.");
need("realtime",'config:{private:true}',"Realtime channels must be private.");
need("realtime",'watchThread',"Private thread updates must be available.");
need("voiceJs",'clerk.session.getToken()',"Founder voice calls must require a Clerk session.");
need("voiceJs",'Bearer',"Voice calls must include a bearer token.");

// No remote domain owns a second Clerk customer session; .com is only a shop destination.
for(const key of ["landing","campus","chat","voice"]){
  forbid(key,'nblworld.com/university.html',"Legacy .com University route returned.");
  forbid(key,'nblworld.com/chat.html',"Legacy .com human Chat route returned.");
  forbid(key,'nblworld.com/voice-lab.html',"Legacy .com Founder voice route returned.");
}
for(const key of ["campus","chat","university","messages","voiceJs","realtime","lab"]){
  for(const secret of ["STRIPE_SECRET_KEY","SUPABASE_SERVICE_ROLE_KEY","OPENAI_API_KEY","sk-proj-"]){
    forbid(key,secret,key+" exposes a protected credential marker: "+secret);
  }
}
forbid("campus",'https://buy.stripe.com/',"Do not replace approved billing gateway with raw Stripe links.");
forbid("university",'https://buy.stripe.com/',"Do not embed raw Stripe purchase URLs.");
if(failures.length){
  failures.forEach(x=>console.error("[org-member-services] FAIL:",x));
  process.exitCode=1;
}else{
  console.log("[org-member-services] PASS: .org Clerk origin, person-to-person Chat, LOCKE-gated Grey/campus, server-only private actions, held enrollment checkout and same-origin member navigation.");
}
