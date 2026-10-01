import fs from "node:fs";

const header=fs.readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
const plans=fs.readFileSync(new URL("../nbl-product-plans.js",import.meta.url),"utf8");
const account=fs.readFileSync(new URL("../account.html",import.meta.url),"utf8");
const deletion=fs.readFileSync(new URL("../account-deletion.html",import.meta.url),"utf8");

let failed=false;
function requireText(source,text,message){
  if(!source.includes(text)){
    console.error("[website-chat-parity] FAIL:",message);
    failed=true;
  }
}
function forbidText(source,text,message){
  if(source.includes(text)){
    console.error("[website-chat-parity] FAIL:",message);
    failed=true;
  }
}

// Website Chat is the UX/behavior standard. Mobile follows this contract where native platform differences require it.
requireText(header,'accountPortalUrl("/sign-in")',"Website sign-in is not routed through the production account portal.");
requireText(header,'redirect_url=',"Sign-in does not preserve a safe return URL.");
requireText(header,'clerk.addListener?.(render)',"Header account state can go stale after sign-in/sign-out.");
requireText(header,'clerk.addListener(()=>{',"Beans/Plus state is not refreshed when Clerk account state changes.");
requireText(account,'id="passwordHelpButton"',"Forgot-password entry point is missing.");
requireText(account,'Manage sign-in & security',"Security/account controls are missing.");
requireText(account,'id="signOutButton"',"Sign-out control is missing.");
requireText(account,'id="username"',"NBL username control is missing.");
requireText(account,'id="deleteDataButton"',"Self-service NBL data deletion is missing.");
requireText(account,'id="deleteAccountButton"',"Account deletion handoff is missing.");
requireText(deletion,'Delete Your Account & Data',"Public account-deletion instructions are missing.");

// Passwords remain entirely inside Clerk-hosted auth. Public NBL code must not collect/store them.
forbidText(account,'type="password"',"A local website password field appeared; password handling must stay in Clerk.");
forbidText(header,'type="password"',"A local header password field appeared; password handling must stay in Clerk.");
forbidText(header,'resetPasswordEmailCode',"Website code should not store/process reset credentials locally.");

// Current backend boundary: public website must not depend on the old Replit account runtime.
forbidText(header,'nbl-chat.replit.app',"Website still depends on the old Replit account runtime.");
forbidText(header,'NBL_ACCOUNT_API',"Legacy Replit account API constant is still present.");
forbidText(header,'exam-prep/access',"Legacy Replit University access route is still present.");
requireText(header,'fetch(NBL_CHAT_PLUS_API',"University account status is not using the canonical NBL Foundation runtime.");
requireText(header,'NBL CHAT PLUS™ features Professor Grey™ and the Virgo System™ — powered by OpenAI.',"Public Chat header does not state the trademarked Plus brand line.");

// Website-standard Chat shell and Beans continuity.
requireText(header,'data-nbl-chat-drawer',"Website-standard NBL Chat™ drawer is missing.");
requireText(header,'NBL Chat™',"NBL Chat™ trademark display is missing.");
requireText(header,'NBL CHAT PLUS™',"NBL CHAT PLUS™ trademark display is missing.");
requireText(header,'Professor Grey™',"Professor Grey™ trademark display is missing.");
requireText(header,'Virgo System™',"Virgo System™ trademark display is missing.");
requireText(header,'powered by OpenAI',"OpenAI provider brand line is missing.");
requireText(header,'data-nbl-drawer-new',"Website-standard New Chat action is missing.");
requireText(header,'?action=conversations',"Website-standard recent Chat history is missing.");
requireText(header,'data-nbl-drawer-grey hidden',"Preserved Professor Grey entry must stay hidden from public Chat.");
requireText(header,'data-nbl-drawer-tools',"Website-standard Beans tools entry is missing.");
requireText(header,'data-nbl-drawer-plans',"Website-standard Membership & Plans entry is missing.");
requireText(header,'${NBL_PRODUCT_PLANS.beans.price} NBL Chat™ · ${NBL_PRODUCT_PLANS.chatPlus.price} NBL CHAT PLUS™ · Get More',"Website-standard plan labels do not use the canonical catalog.");
requireText(plans,'price:"$4.99/month"',"Canonical Beans plan price is missing.");
requireText(header,'beansHistoryLoadedFor',"Signed-in Beans history is not isolated per account.");
requireText(header,'conversationId:beansConversationId',"Beans conversation continuity is not sent to the backend.");
requireText(header,'NBL_CHAT_GATEWAY_API',"Signed-in Beans metering gateway is missing.");
requireText(header,'meter:requestNblMeter',"Website membership meter bridge is missing.");
requireText(account,'id="membershipCard"',"Account membership status card is missing.");
requireText(account,'data-account-billing-plan="chat_plus"',"Account Chat Plus checkout action is missing.");
requireText(header,'toolMode:beansToolMode',"Beans tool selection is not sent to the backend.");
requireText(header,'attachments:beansAttachments.map',"Beans attachments are not sent to the backend.");
requireText(header,'data-nbl-tool="knowledge-upload"',"Beans saved-knowledge upload control is missing.");
requireText(header,'data-nbl-tool="knowledge"',"Beans saved-knowledge search control is missing.");
requireText(header,'"/knowledge/upload"',"Beans saved-knowledge upload API route is missing.");
requireText(header,'"/knowledge/status"',"Beans saved-knowledge status API route is missing.");
requireText(header,'"/knowledge/delete"',"Beans saved-knowledge delete API route is missing.");
requireText(header,'data-nbl-tool="voice-mode"',"Beans OpenAI voice-mode control is missing.");
requireText(header,'"/voice/transcribe"',"Beans OpenAI transcription route is missing.");
requireText(header,'"/voice/speak"',"Beans OpenAI speech route is missing.");
requireText(header,'appendBeansFileSources(payload?.fileSources)',"Saved-file citations are not rendered.");
requireText(header,'MediaRecorder',"OpenAI voice recording does not use browser audio capture.");
requireText(header,'browserBeansDictation',"Browser dictation fallback is missing.");
requireText(header,'NBL_ACCOUNT_STORE_API',"Account/history storage endpoint is missing.");

// Preserved University source remains present but is not a Chat Plus door.
requireText(header,'action:"status"',"Preserved University access check is missing.");
requireText(header,'action:"chat"',"Unified Foundation request route is missing.");
requireText(header,'APSK 101',"APSK 101 is missing.");
requireText(header,'ANSY 110',"ANSY 110 is missing.");
requireText(header,'EBPR 120',"EBPR 120 is missing.");
requireText(header,'plusHistory.length=0',"Changing courses does not clear prior-course chat context.");
requireText(header,'label.textContent="Sources"',"Grey source display is missing.");
requireText(header,'/^https?:\\/\\//i.test(item.url)',"Grey web citations are not URL-validated.");
requireText(header,'link.rel="noopener noreferrer"',"Grey external source links lack opener protection.");

// Core world doors used by the Android pocket version must remain available on web.
for(const route of ["/","/books.html","/stories.html","/founder-office.html","/studio/","/university.html"]){
  requireText(header,route,`World route missing from website header: ${route}`);
}

// Public-secret guard.
for(const forbidden of [
  "STRIPE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "sk-proj-",
  "NBL_GUIDED_ACCESS_SYNC_SECRET",
  "NBL_UNIVERSITY_PROGRESS_SYNC_SECRET"
]){
  forbidText(header,forbidden,`Private secret marker appeared in public website code: ${forbidden}`);
  forbidText(account,forbidden,`Private secret marker appeared in public account page: ${forbidden}`);
}

if(failed){
  process.exitCode=1;
}else{
  console.log("[website-chat-parity] PASS: website-standard drawer/navigation, website-owned auth/session, metered Beans continuity, premium tool controls including saved knowledge and voice, hidden/preserved University source, world routes, deletion controls, and secret guards are present.");
  console.log("[website-chat-parity] EXTERNAL LIVE CHECK: Clerk-hosted account flows and responsive browser behavior still require a real browser pass after this source audit.");
}
