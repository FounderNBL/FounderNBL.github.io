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

requireText(js,'NBL_BEANS_WEB_API=NBL_CHAT_PLUS_API',"Signed-out Beans is not using the NBL Foundation runtime.");
requireText(js,'NBL_CHAT_GATEWAY_API',"Signed-in Beans gateway endpoint is missing.");
requireText(js,'const endpoint=accountToken?\`\${NBL_CHAT_GATEWAY_API}/chat\`:NBL_BEANS_WEB_API',"Signed-in Beans is not routed through the metered gateway.");
requireText(js,'data-nbl-chat-mode="beans"',"Beans mode is missing.");
requireText(js,'data-nbl-chat-mode="plus" role="tab" aria-controls="nbl-chat-panel-plus" aria-selected="false" aria-label="NBL University Professor Grey™" tabindex="-1" hidden',"Preserved University/Grey panel is not hidden from public Chat.");
requireText(js,'NBL_CHAT_PLUS_API',"NBL CHAT PLUS™ runtime endpoint is missing.");
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
requireText(js,'NBL CHAT PLUS™ features Professor Grey™ and the Virgo System™ — powered by OpenAI.',"NBL CHAT PLUS™ brand line is missing.");
requireText(js,'data-nbl-drawer-tools',"Beans tools drawer entry is missing.");
requireText(js,'data-nbl-tools-toggle',"Beans + tool button is missing.");
requireText(js,'data-nbl-tool="attach"',"Photo/file tool is missing.");
requireText(js,'data-nbl-tool="web"',"Web tool is missing.");
requireText(js,'data-nbl-tool="code"',"Code/data tool is missing.");
requireText(js,'data-nbl-tool="image"',"Image creation tool is missing.");
requireText(js,'data-nbl-tool="grey"',"Professor Grey™ / Virgo System™ Chat Plus tool is missing.");
requireText(js,'mode:beansToolMode==="grey"?"grey_chat":"beans"',"Professor Grey™ tool is not routed through the Chat Plus Grey mode.");
requireText(js,'payload?.speaker==="Professor Grey™"',"Professor Grey™ replies are not identified in the shared chat.");
requireText(js,'data-nbl-beans-mic',"Browser dictation control is missing.");
requireText(js,'appendBeansImages',"Generated-image rendering is missing.");
requireText(js,'<h2 id="nbl-beans-title">NBL Chat™</h2>',"Overall website Chat title must be NBL Chat™, not the Plus tier.");
requireText(js,'data-nbl-chat-drawer',"NBL Chat™ side drawer is missing.");
requireText(js,'data-nbl-drawer-new',"New Chat drawer action is missing.");
requireText(js,'data-nbl-drawer-grey hidden',"Preserved Grey drawer entry is not hidden from public Chat.");
requireText(js,'data-nbl-drawer-plans',"Membership & plans drawer action is missing.");
requireText(js,'?action=conversations',"Recent saved conversations are not loaded into the NBL drawer.");
requireText(js,'${NBL_PRODUCT_PLANS.beans.price} NBL Chat™ · ${NBL_PRODUCT_PLANS.chatPlus.price} NBL CHAT PLUS™ · Get More',"Drawer prices are not sourced from the canonical catalog.");
requireText(js,'${NBL_PRODUCT_PLANS.chatPlus.name} · ${NBL_PRODUCT_PLANS.chatPlus.price}',"NBL CHAT PLUS™ drawer price is missing.");
requireText(js,'${NBL_PRODUCT_PLANS.getMore.name} · ${NBL_PRODUCT_PLANS.getMore.price}',"Get More drawer price is missing.");
for(const value of ['$4.99/month','300 successful replies','$19.99/month','1,050 successful replies total','$9.99 one-time','+500 successful replies','$29.99 one-time','$49.99 one-time']){
  requireText(plans,value,`Canonical locked product value is missing: ${value}`);
}
requireText(js,'NBL CHAT PLUS™ is required to send them.',"Attachment Plus-boundary status is missing.");
requireText(js,'Live web selected · NBL CHAT PLUS™.',"Web-tool Plus-boundary status is missing.");
requireText(js,'Code / data analysis selected · NBL CHAT PLUS™.',"Code-tool Plus-boundary status is missing.");
requireText(js,'Image creation selected · NBL CHAT PLUS™.',"Image-tool Plus-boundary status is missing.");
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

if(!process.exitCode) console.log("[website-chat-plus] PASS: website NBL Chat™ routes signed-in use through metering, exposes Plus tools including Professor Grey™ / Virgo System™, keeps protected University Guided Learning separate, preserves history, and contains no public secrets.");
