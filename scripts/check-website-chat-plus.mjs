import fs from "node:fs";

const js=fs.readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../nbl-world-header.css",import.meta.url),"utf8");

function requireText(source,text,message){
  if(!source.includes(text)){
    console.error("[website-chat-plus] FAIL:",message);
    process.exitCode=1;
  }
}
function forbidText(source,text,message){
  if(source.includes(text)){
    console.error("[website-chat-plus] FAIL:",message);
    process.exitCode=1;
  }
}

requireText(js,'NBL_BEANS_WEB_API=NBL_PUBLIC_BEANS_API',"Regular guest Beans no longer uses the existing beans-public runtime.");
requireText(js,'data-nbl-chat-mode="beans"',"Beans mode is missing.");
requireText(js,'data-nbl-chat-mode="plus"',"NBL Chat Plus mode is missing.");
requireText(js,'NBL_CHAT_PLUS_API',"NBL Chat Plus gateway is missing.");
requireText(js,'action:"status"',"Plus access is not checked server-side.");
requireText(js,'action:"grey"',"Professor Grey runtime route is missing.");
requireText(js,'APSK 101',"APSK 101 is missing.");
requireText(js,'ANSY 110',"ANSY 110 is missing.");
requireText(js,'EBPR 120',"EBPR 120 is missing.");
requireText(js,'beansHistoryLoadedFor',"Signed-in Beans history is not tracked per account.");
requireText(js,'clerk.addListener',"Account state changes do not retrigger Beans/Plus continuity.");
requireText(js,'Professor Grey',"Professor Grey UI is missing.");
requireText(js,'NBL Chat Plus guided learning is not active for this account.',"Locked Plus state is missing.");
requireText(css,'.nbl-chat-modes',"Chat mode styling is missing.");
requireText(css,'.nbl-plus-access',"Plus access styling is missing.");
forbidText(js,'STRIPE_SECRET_KEY',"A Stripe secret marker appeared in public website code.");
forbidText(js,'SUPABASE_SERVICE_ROLE_KEY',"A Supabase service-role marker appeared in public website code.");
forbidText(js,'OPENAI_API_KEY',"An OpenAI secret marker appeared in public website code.");
forbidText(js,'sk-proj-',"An OpenAI private key marker appeared in public website code.");

const beansListener=(js.match(/beansToggle\.addEventListener\("click",openBeans\);/g)||[]).length;
if(beansListener!==1){
  console.error("[website-chat-plus] FAIL: Beans panel click listener count is",beansListener);
  process.exitCode=1;
}

if(!process.exitCode) console.log("[website-chat-plus] PASS: regular Beans, account continuity, protected Plus routes, course choices, and public-secret guards are present.");
