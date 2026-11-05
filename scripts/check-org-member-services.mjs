import fs from "node:fs";
const read=name=>fs.readFileSync(new URL("../"+name,import.meta.url),"utf8");
const files={
  landing:read("university-enrollment.html"),campus:read("campus.html"),university:read("university.js"),
  chat:read("chat.html"),messages:read("chat.js"),voice:read("voice-lab.html"),
  voiceJs:read("voice-lab.js"),realtime:read("social-realtime.js"),lab:read("study-lab.mjs"),
  header:read("nbl-world-header.js"),account:read("account.html")
};
const failures=[];
const need=(key,needle,why)=>{if(!files[key].includes(needle))failures.push(why);};
const forbid=(key,needle,why)=>{if(files[key].includes(needle))failures.push(why);};

// One Clerk production origin. Account and payment screens must stay on .org.
need("account",'accounts.newbeansland.org',"Verified .org account portal missing.");
need("chat",'href="https://newbeansland.org/messenger/"',"Person-to-person messaging must canonically identify NBL Messenger on .org.");
need("campus",'url=https://nblschool.com/',"Old .org campus must redirect to the school website.");
// Messenger and Professor Grey exist independently; neither belongs in the Beans assistant drawer.
forbid("header",'class="nbl-chat-drawer-item nbl-beans-people-link"',"Person messaging must not be a Beans menu item.");
forbid("header",'class="nbl-chat-drawer-item nbl-beans-grey-link"',"Professor Grey must not be a Beans menu item.");
need("header",'data-nbl-beans-regular',"Beans' own assistant chat panel must remain available.");
need("landing",'url=https://newbeansland.org/university.html#enroll',"Legacy enrollment must redirect to the single cashier page.");
const currentAdmissions=read("university.html");
const currentBilling=read("university-storefront.js");
if(!currentAdmissions.includes('id="nblu-one-entry"'))failures.push("The one-page University admissions entry is missing.");
if(!currentBilling.includes('if(!item.plan)'))failures.push("Held University plans must not create unsupported checkouts.");
if(!currentBilling.includes('"/billing/checkout"'))failures.push("University checkout must use the NBL billing gateway.");

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
// Academic source is no longer served as a .org classroom; the school has its own domain.
need("campus","url=https://nblschool.com/","Legacy campus does not forward to school.com.");
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
need("voice","This page is unavailable.","Internal voice lab must not be reachable on public site.");
forbid("voiceJs","founder_sample","Public voice-lab script must not execute privileged operations.");

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
  console.log("[org-member-services] PASS: single .org admissions cashier, independent school.com campus and old-route forwarding, shared Clerk identity, existing member messaging and billing guardrails.");
}
