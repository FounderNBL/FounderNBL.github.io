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

requireText(js,'NBL_BEANS_WEB_API=`\${NBL_CORE_API}/chat`',"Website Beans is not using the single NBL Core chat ingress.");
requireText(js,'NBL_SEARCH_API=`\${NBL_CORE_API}/search`',"Website search is not using NBL Core.");
forbidText(js,'functions/v1/beans-public',"Website still hardcodes the internal public Beans runtime.");
requireText(js,'const NBL_CORE_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core"',"NBL Core 1.0 website ingress is missing.");
requireText(js,'NBL_CHAT_GATEWAY_API=NBL_CORE_API',"Signed-in Beans and Chat billing are not routed through NBL Core.");
forbidText(js,'const NBL_CHAT_GATEWAY_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-chat-gateway"',"Website still hardcodes the pre-Core signed-in gateway.");
requireText(js,'const endpoint=NBL_BEANS_WEB_API',"Website Beans does not use one Core chat endpoint for guest and signed-in traffic.");
requireText(js,'data-nbl-chat-mode="beans"',"Beans mode is missing.");
requireText(js,'data-nbl-chat-mode="plus" role="tab" aria-controls="nbl-chat-panel-plus" aria-selected="false" aria-label="NBL University Professor Grey™ / Virgo System™" tabindex="-1" hidden',"Preserved University/Grey panel is not hidden from public Chat.");
requireText(js,'NBL_CHAT_PLUS_API',"NBL Plus runtime endpoint is missing.");
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
requireText(js,'Beans is your NBL AI assistant. NBL Chat is for people talking to people. NBL Plus adds premium Beans tools. NBL University adds Professor Grey™ and the Virgo System™ for guided learning, with enrollment controlled by LOCKE.',"NBL Plus brand line is missing.");
requireText(js,'data-nbl-drawer-tools',"Beans tools drawer entry is missing.");
requireText(js,'data-nbl-tools-toggle',"Beans + tool button is missing.");
requireText(js,'data-nbl-tool="attach"',"Photo/file tool is missing.");
requireText(js,'data-nbl-tool="web"',"Web tool is missing.");
requireText(js,'data-nbl-tool="code"',"Code/data tool is missing.");
requireText(js,'data-nbl-tool="artifact"',"Downloadable file/PDF creation tool is missing.");
requireText(js,'data-nbl-tool="image"',"Image creation tool is missing.");
requireText(js,'data-nbl-beans-mic',"Browser dictation control is missing.");
requireText(js,'appendBeansImages',"Generated-image rendering is missing.");
requireText(js,'appendBeansArtifacts',"Generated-file rendering is missing.");
requireText(js,'payload?.artifacts',"Generated-file payload is not rendered.");
requireText(js,'data-nbl-university-pdf-form',"University PDF submission control is missing.");
requireText(js,'action:"university_submit_pdf"',"University PDF submission is not connected to TEST/Registrar.");
requireText(js,'<h2 id="nbl-beans-title">Beans</h2>',"Overall website Chat title must be Beans, not the Plus tier.");
requireText(js,'data-nbl-chat-drawer',"Beans side drawer is missing.");
requireText(js,'data-nbl-drawer-new',"New Chat drawer action is missing.");
requireText(js,'data-nbl-drawer-grey hidden',"Preserved Grey drawer entry is not hidden from public Chat.");
requireText(js,'data-nbl-drawer-plans',"Membership & plans drawer action is missing.");
requireText(js,'?action=conversations',"Recent saved conversations are not loaded into the NBL drawer.");
requireText(js,'Beans: ${NBL_PRODUCT_PLANS.beans.price} · NBL Plus: ${NBL_PRODUCT_PLANS.chatPlus.price} · University: ${NBL_PRODUCT_PLANS.chatPlusUniversity.price} · NBL Usage: ${NBL_PRODUCT_PLANS.getMore.price}',"Drawer prices are not sourced from the canonical catalog.");
requireText(js,'${NBL_PRODUCT_PLANS.chatPlus.name} · ${NBL_PRODUCT_PLANS.chatPlus.price}',"NBL Plus drawer price is missing.");
requireText(js,'data-nbl-billing-plan="chat_plus_university"',"NBL University checkout action is missing.");
requireText(plans,'chatPlusUniversity:Object.freeze',"Canonical Plus + University tier is missing.");
for(const plan of ['foundation','full_nblu','nblu_continuation']) requireText(js,`data-nbl-billing-plan="${plan}"`,`Pricing drawer action missing: ${plan}`);
requireText(js,'${NBL_PRODUCT_PLANS.getMore.name} · ${NBL_PRODUCT_PLANS.getMore.price}',"Usage pack drawer price is missing.");
for(const value of ['Free to start','10 free successful Beans replies','$4.99 first month','$29.99/month','1,800 NBL Usage credits/month','$39.99/month','2,500 NBL Usage credits/month','$7 one-time','500 NBL Usage credits','$29.99 one-time','$449.99 one-time','$14.99/month']){
  requireText(plans,value,`Canonical locked product value is missing: ${value}`);
}
requireText(js,'NBL Plus is required to send them.',"Attachment Plus-boundary status is missing.");
forbidText(js,'data-nbl-tool="grey"',"Professor Grey™ must not appear as a public Beans / ordinary Chat Plus tool.");
forbidText(js,'mode:beansToolMode==="grey"?"grey_chat":"beans"',"Public Beans must not route ordinary Plus into Grey mode.");
requireText(js,'mode:"beans"',"Public Beans request must stay on the Beans rail.");
requireText(js,'Live web selected · NBL Plus.',"Web-tool Plus-boundary status is missing.");
requireText(js,'Code / data analysis selected · NBL Plus.',"Code-tool Plus-boundary status is missing.");
requireText(js,'PDF / file creation selected · NBL Plus.',"Artifact-tool Plus-boundary status is missing.");
requireText(js,'Image creation selected · NBL Plus.',"Image-tool Plus-boundary status is missing.");
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

if(!process.exitCode) console.log("[website-chat-plus] PASS: website Beans uses one NBL Core ingress for guest/signed-in Chat and search, routes authenticated use through metering, exposes premium Beans tools, keeps Professor Grey™ / Virgo System™ behind University entitlement, preserves history, and contains no public secrets.");
