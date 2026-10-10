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
requireText(js,'NBL CHAT PLUS™ adds premium Beans tools. NBL CHAT PLUS™ + University adds Professor Grey™ and the Virgo System™ for guided course teaching — powered by OpenAI.',"NBL CHAT PLUS™ brand line is missing.");
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
requireText(js,'<h2 id="nbl-beans-title">Beans</h2>',"Website AI dialog must be called Beans, not NBL Chat.");
requireText(js,'data-nbl-chat-drawer',"NBL Chat™ side drawer is missing.");
requireText(js,'data-nbl-drawer-new',"New Chat drawer action is missing.");
requireText(js,'data-nbl-drawer-grey hidden',"Preserved Grey drawer entry is not hidden from public Chat.");
requireText(js,'data-nbl-drawer-plans',"Membership & plans drawer action is missing.");
requireText(js,'?action=conversations',"Recent saved conversations are not loaded into the NBL drawer.");
requireText(js,'${NBL_PRODUCT_PLANS.beans.price} Beans · ${NBL_PRODUCT_PLANS.foundationProgram.price} Foundation · ${NBL_PRODUCT_PLANS.fullNblu.price} Full NBLU',"Three public offers must be catalog-driven.");
for(const plan of ['beans','foundation','full_nblu']) requireText(js,`data-nbl-billing-plan="${plan}"`,`Pricing drawer action missing: ${plan}`);
for(const plan of ['chat_plus','chat_plus_university','topup_500','full_foundation','nblu_continuation']) forbidText(js,`data-nbl-billing-plan="${plan}"`,`Retired offer still marketed in drawer: ${plan}`);
for(const value of ['$4.99/month','300 successful replies','$34.99 one-time','$449.99 one-time']) requireText(plans,value,`Approved public plan value missing: ${value}`);
requireText(js,'100 non-expiring NBL Studios bonus credits',"Beans loyalty/rollover information missing.");
requireText(js,'NBL CHAT PLUS™ is required to send them.',"Attachment Plus-boundary status is missing.");
forbidText(js,'data-nbl-tool="grey"',"Professor Grey™ must not appear as a public Beans / ordinary Chat Plus tool.");
forbidText(js,'mode:beansToolMode==="grey"?"grey_chat":"beans"',"Public Beans must not route ordinary Chat Plus into Grey mode.");
requireText(js,'mode:"beans"',"Public Beans request must stay on the Beans rail.");
requireText(js,'Live web selected · NBL CHAT PLUS™.',"Web-tool Plus-boundary status is missing.");
requireText(js,'Code / data analysis selected · NBL CHAT PLUS™.',"Code-tool Plus-boundary status is missing.");
requireText(js,'PDF / file creation selected · NBL CHAT PLUS™.',"Artifact-tool Plus-boundary status is missing.");
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

if(!process.exitCode) console.log("[website-chat-plus] PASS: website NBL Chat™ uses one NBL Core ingress for guest/signed-in Chat and search, routes authenticated use through metering, exposes premium Beans tools, keeps Professor Grey™ / Virgo System™ behind University entitlement, preserves history, and contains no public secrets.");
