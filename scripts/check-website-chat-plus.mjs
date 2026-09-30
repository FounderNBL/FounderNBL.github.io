import fs from "node:fs";

const js=fs.readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../nbl-world-header.css",import.meta.url),"utf8");
const plans=fs.readFileSync(new URL("../nbl-product-plans.js",import.meta.url),"utf8");

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

requireText(js,'NBL_BEANS_WEB_API=NBL_CHAT_PLUS_API',"Regular Beans is not using the NBL Foundation runtime.");
requireText(js,'data-nbl-chat-mode="beans"',"Beans mode is missing.");
requireText(js,'data-nbl-chat-mode="plus"',"NBL Chat Plus mode is missing.");
requireText(js,'NBL_CHAT_PLUS_API',"NBL Chat Plus runtime endpoint is missing.");
requireText(js,'functions/v1/nbl-foundation-runtime',"Canonical NBL Foundation runtime endpoint is missing.");
requireText(js,'action:"status"',"Plus access is not checked server-side.");
requireText(js,'action:"chat"',"Unified Chat mode controller is missing.");
requireText(js,'mode:"guided_learning"', "Guided Learning mode request is missing.");
requireText(js,'conversationId:beansConversationId',"Guided Learning is not using the shared conversation rail.");
requireText(js,'APSK 101',"APSK 101 is missing.");
requireText(js,'ANSY 110',"ANSY 110 is missing.");
requireText(js,'EBPR 120',"EBPR 120 is missing.");
requireText(js,'beansHistoryLoadedFor',"Signed-in Beans history is not tracked per account.");
requireText(js,'clerk.addListener',"Account state changes do not retrigger Beans/Plus continuity.");
requireText(js,'Professor Grey',"Professor Grey UI is missing.");
requireText(js,'<h2 id="nbl-beans-title">NBL Chat</h2>',"Overall website Chat title must be NBL Chat, not the Plus tier.");
requireText(js,'data-nbl-chat-drawer',"NBL Chat side drawer is missing.");
requireText(js,'data-nbl-drawer-new',"New Chat drawer action is missing.");
requireText(js,'data-nbl-drawer-grey',"Professor Grey drawer action is missing.");
requireText(js,'data-nbl-drawer-plans',"Membership & plans drawer action is missing.");
requireText(js,'?action=conversations',"Recent saved conversations are not loaded into the NBL drawer.");
requireText(js,'${NBL_PRODUCT_PLANS.beans.price} Beans · ${NBL_PRODUCT_PLANS.chatPlus.price} Plus · Get More',"Drawer prices are not sourced from the canonical catalog.");
requireText(js,'${NBL_PRODUCT_PLANS.chatPlus.name} · ${NBL_PRODUCT_PLANS.chatPlus.price}',"NBL Chat Plus drawer price is missing.");
requireText(js,'${NBL_PRODUCT_PLANS.getMore.name} · ${NBL_PRODUCT_PLANS.getMore.price}',"Get More drawer price is missing.");
for(const value of ['$4.99/month','300 successful replies','$19.99/month','1,050 successful replies total','$9.99 one-time','+500 successful replies','$29.99 one-time','$49.99 one-time']){
  requireText(plans,value,`Canonical locked product value is missing: ${value}`);
}
requireText(js,'Guided Learning requires active course enrollment and Grey access for this account.',"Locked Plus state is missing.");
requireText(css,'.nbl-chat-modes',"Chat mode styling is missing.");
requireText(css,'.nbl-plus-access',"Plus access styling is missing.");
requireText(css,'.nbl-chat-drawer',"NBL Chat drawer styling is missing.");
requireText(css,'.nbl-chat-drawer-history-item',"Recent-chat drawer styling is missing.");
forbidText(js,'STRIPE_SECRET_KEY',"A Stripe secret marker appeared in public website code.");
forbidText(js,'SUPABASE_SERVICE_ROLE_KEY',"A Supabase service-role marker appeared in public website code.");
forbidText(js,'OPENAI_API_KEY',"An OpenAI secret marker appeared in public website code.");
forbidText(js,'sk-proj-',"An OpenAI private key marker appeared in public website code.");
forbidText(js,'nbl-chat.replit.app',"Website chat/account flow still depends on the old Replit runtime.");
forbidText(js,'NBL_ACCOUNT_API',"Legacy Replit account API constant appeared in public website code.");

const beansListener=(js.match(/beansToggle\.addEventListener\("click",openBeans\);/g)||[]).length;
if(beansListener!==1){
  console.error("[website-chat-plus] FAIL: Beans panel click listener count is",beansListener);
  process.exitCode=1;
}

if(!process.exitCode) console.log("[website-chat-plus] PASS: website-standard NBL Chat drawer, locked plan naming, account continuity, Foundation Beans, LOCKE-protected Grey, course choices, and public-secret guards are present.");
