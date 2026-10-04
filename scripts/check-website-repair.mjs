import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root=new URL("..",import.meta.url);
const rootPath=fileURLToPath(root);
const read=relative=>fs.readFileSync(new URL(relative,root),"utf8");
const header=read("nbl-world-header.js");
const plans=read("nbl-product-plans.js");
const support=read("nbl-chat-support.html");
const legal=read("nbl-chat-legal.html");
const terms=read("terms.html");
const privacy=read("privacy.html");
const deletion=read("account-deletion.html");
const university=read("university.html");
const account=read("account.html");
const universityCheckout=read("nbl-university-checkout.js");
let failed=false;

function requireText(source,text,message){
  if(!source.includes(text)){
    console.error("[website-repair] FAIL:",message);
    failed=true;
  }
}

function forbidText(source,text,message){
  if(source.includes(text)){
    console.error("[website-repair] FAIL:",message);
    failed=true;
  }
}

const block=(start,end)=>header.slice(header.indexOf(start),header.indexOf(end,header.indexOf(start)));
const historyLoad=block("const loadSignedInBeansHistory=async()=>{","const replaceBeansConversation=");
const newConversation=block("const startNewBeansConversation=()=>{","const loadDrawerConversation=");
const oldConversation=block("const loadDrawerConversation=async(id)=>{","const renderChatDrawerHistory=");
const signOut=block('chatDrawerAccountAction.addEventListener("click",async()=>{',"for(const button of modeButtons)");
const accountListener=block("clerk.addListener(()=>{","});\n  }).catch");
const popstate=block('window.addEventListener("popstate",()=>{','document.addEventListener("keydown",event=>{');
const plusLock=block("const showPlusLocked=","const showPlusReady=");
const drawerOpen=block("const setChatDrawerOpen=open=>{","const appendPlusMessage=");
const beansChat=block('beansForm.addEventListener("submit",async event=>{','plusForm.addEventListener("submit",async event=>{');
const plusChat=block('plusForm.addEventListener("submit",async event=>{','plusCourse.addEventListener("change",()=>{');

requireText(historyLoad,"beansHistoryRequestGeneration","Latest history load has no request-generation guard.");
requireText(historyLoad,"beansAccountGeneration","Latest history load has no account-generation guard.");
requireText(historyLoad,"beansConversationGeneration","Latest history load has no conversation-generation guard.");
requireText(historyLoad,"currentClerkUserId()!==identity.userId","Latest history may render for a different signed-in user.");
requireText(newConversation,"invalidateBeansHistoryLoad();","New Chat does not invalidate latest history.");
requireText(newConversation,"beansConversationGeneration++;","New Chat does not advance the conversation generation.");
requireText(oldConversation,"invalidateBeansHistoryLoad();","Opening an old conversation does not invalidate latest history.");
requireText(oldConversation,"currentClerkUserId()!==identity.userId","Old conversation load does not verify the active account.");
requireText(signOut,"clearBeansTranscript(","Sign-out does not clear the in-memory Beans transcript.");
requireText(signOut,"showPlusLocked(","Sign-out does not clear/hide the Professor Grey transcript.");
requireText(accountListener,"beansAccountGeneration++;","Clerk account changes do not advance the account generation.");
requireText(accountListener,"invalidateBeansHistoryLoad();","Clerk account changes do not invalidate outstanding history loads.");
requireText(accountListener,"if(!accountChanged)","Same-user Clerk/session updates should not reload the latest conversation.");
requireText(accountListener,"clearBeansTranscript(","Account switch/sign-out does not clear the visible Beans transcript.");
requireText(plusLock,"clearPlusTranscript();","Loss of Professor Grey access leaves its in-memory transcript intact.");
requireText(plusChat,"accessRequestGeneration!==plusAccessRequestGeneration","Professor Grey responses are not guarded against account/access changes.");
requireText(plusChat,"currentClerkUserId()!==identity.userId","Professor Grey response does not verify the active account.");
requireText(beansChat,"accountGeneration!==beansAccountGeneration","Beans responses are not guarded against account changes.");
requireText(beansChat,"conversationGeneration!==beansConversationGeneration","Beans responses are not guarded against New Chat or conversation switches.");
requireText(beansChat,"currentClerkUserId()!==requestedUserId","Beans responses do not verify the active signed-in account.");
requireText(header,"let activeBeansChatController=null;","Website Chat has no cancellable active request state.");
requireText(newConversation,"cancelActiveBeansChat();","New Chat does not cancel the previous Beans request.");
requireText(oldConversation,"cancelActiveBeansChat();","Opening saved history does not cancel the previous Beans request.");
requireText(signOut,"cancelActiveBeansChat();","Sign-out leaves the previous Beans request running.");
requireText(accountListener,"cancelActiveBeansChat();","Account switching leaves the previous Beans request running.");
requireText(beansChat,'if(!text||beansSubmit.disabled) return;',"Website Chat can double-submit while a send is already starting.");
requireText(beansChat,"signal:controller.signal","Website Chat requests are not cancellable.");
requireText(beansChat,"cache:\"no-store\"","Website Chat requests are missing explicit no-store behavior.");
requireText(beansChat,"userMessageEl?.remove();","Failed sends leave a false successful user turn in the transcript.");
requireText(beansChat,"beansHistory.pop();","Failed sends leave the unsent user turn in conversation context.");
requireText(beansChat,"Your message is still here so you can try again.","Failed sends do not preserve the user's message for retry.");
requireText(header,'data-nbl-beans-stop',"Website Chat is missing a visible Stop control.");
requireText(header,'cancelActiveBeansChat({announce:true})',"Website Stop control is not wired to cancel the active request.");
requireText(header,'renderBeansContent',"Website Chat is missing safe rich reply rendering.");
requireText(header,'Copy Beans reply',"Website Chat is missing per-reply copy.");
requireText(header,'Read Beans reply aloud',"Website Chat is missing per-reply read aloud.");
requireText(header,'event.key!=="Enter"||event.shiftKey||event.isComposing',"Website composer is missing Enter-to-send / Shift+Enter newline behavior.");
requireText(header,"beansForm.requestSubmit(beansSubmit);","Enter-to-send is not routed through the real Chat form.");

requireText(header,'["search","Search","#nbl-search",false]',"Search navigation still targets a missing page.");
requireText(header,'data-nbl-open-search',"Search links do not open the existing modal.");
const findHtml=(directory)=>{
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const entryPath=path.join(directory,entry.name);
    if(entry.isDirectory()) return entry.name===".git"?[]:findHtml(entryPath);
    return entry.isFile()&&entry.name.endsWith(".html")?[entryPath]:[];
  });
};
for(const filename of findHtml(rootPath)){
  const html=fs.readFileSync(filename,"utf8");
  const headerScript=html.indexOf("nbl-world-header.js");
  if(headerScript>=0){
    const catalogScript=html.indexOf("nbl-product-plans.js");
    if(catalogScript<0||catalogScript>headerScript){
      console.error("[website-repair] FAIL: shared header loads without its earlier canonical catalog in",path.relative(rootPath,filename));
      failed=true;
    }
  }
  if(/<a\b[^>]*\bhref\s*=\s*["'][^"']*(?:^|\/)search\.html(?:[?#][^"']*)?["']/i.test(html)){
    console.error("[website-repair] FAIL: visible Search link points to /search.html in",path.relative(rootPath,filename));
    failed=true;
  }
}

requireText(header,'aria-label="Open NBL Chat™"',"The Chat launcher is not named NBL Chat.");
requireText(header,'<img src="/NBLChat_Beans.png" alt="" aria-hidden="true">',"Homepage Chat launcher is not using the stable NBL Chat artwork.");
forbidText(header,'data:image/webp;base64,',"Inline Base64 Chat artwork returned; use the stable repository asset.");
requireText(header,'<h2 id="nbl-beans-title">NBL Chat™</h2>',"The Chat dialog title is not NBL Chat.");
requireText(header,'data-nbl-chat-mode="beans" role="tab"',"Beans is not named as the regular Chat tab.");
requireText(header,'data-nbl-chat-mode="plus" role="tab" aria-controls="nbl-chat-panel-plus" aria-selected="false" aria-label="NBL University Professor Grey™ / Virgo System™" tabindex="-1" hidden',"Preserved Professor Grey tab is not hidden from public Chat.");
requireText(header,'NBL CHAT PLUS™ adds premium Beans tools. NBL CHAT PLUS™ + University adds Professor Grey™ and the Virgo System™ for guided course teaching — powered by OpenAI.',"Public Chat does not carry the current Plus / Plus + University brand boundary.");
for(const stale of ["Talk to Beans","Beans is free to use. No account required.","beta test NBL Chat","request beta access"]){
  forbidText(header,stale,`Stale Chat naming/status wording remains: ${stale}`);
}
requireText(header,"Beans includes limited free replies. Sign in to keep your history","Limited-free and signed-in history context is missing.");
requireText(header,"future NBL Chat™ features and upcoming testing opportunities","Homepage still describes Chat as unreleased.");

requireText(header,'chatDrawer.querySelector("[data-nbl-chat-drawer-close]")?.focus()',"Opening the drawer does not move focus inside it.");
requireText(header,'if(opening)setBeansToolMenu(false);',"Opening the Chat drawer does not close the Beans tool menu.");
requireText(drawerOpen,'chatDrawer.inert=false',"The drawer is not available to keyboard focus when opened.");
requireText(drawerOpen,'chatDrawer.inert=true',"The drawer is not removed from focus when closed.");
requireText(header,'if(event.shiftKey&&(document.activeElement===first||!chatDrawer.contains(document.activeElement)))',"Drawer focus is not trapped on Shift+Tab.");
requireText(header,'else if(!event.shiftKey&&(document.activeElement===last||!chatDrawer.contains(document.activeElement)))',"Drawer focus is not trapped on Tab.");
requireText(header,'chatDrawerOpener?.isConnected?chatDrawerOpener:chatDrawerToggle',"Drawer close does not restore focus to its opener.");
requireText(header,'event.key!=="Escape"',"Escape handling for overlays is missing.");
requireText(header,'aria-controls="nbl-chat-panel-beans"',"Beans tab does not control its tabpanel.");
requireText(header,'aria-controls="nbl-chat-panel-plus"',"Preserved University tabpanel relationship is missing.");
requireText(header,'data-nbl-tools-toggle',"Beans + tools control is missing.");
requireText(header,'data-nbl-drawer-tools',"Beans tools drawer control is missing.");
requireText(header,'event.key==="ArrowRight"',"Arrow-key tab navigation is missing.");
requireText(header,'if(event.target===beansPanel) closeBeans();',"Outer Chat backdrop does not close the dialog.");
requireText(popstate,"setChatDrawerOpen(false);","Back does not close the drawer first.");
requireText(popstate,"window.history.pushState","Back does not preserve the open Chat state after dismissing the drawer.");
requireText(header,"window.history.pushState({...window.history.state,nblChatOverlay:chatHistoryEntry}","Opening Chat does not create a UI history state.");
requireText(header,"const shouldConsumeHistory=!fromPopState","Closing Chat does not distinguish UI-close from browser Back.");
requireText(header,"if(shouldConsumeHistory) window.history.back();","Closing Chat leaves a duplicate same-page history entry behind.");

for(const value of ['$4.99/month','300 successful replies','$19.99/month','1,050 successful replies total','$9.99 one-time','+500 successful replies','$29.99 one-time','$49.99 one-time','$149.99 one-time','$14.99/month']){
  requireText(plans,value,`Canonical locked plan value is missing: ${value}`);
}
const planFields=["beans.price","beans.replies","chatPlus.price","chatPlus.replies","getMore.price","getMore.replies","foundationProgram.price","guidedFoundation.price","fullNblu.price","nbluContinuation.price"].map(dataNblPlanValue=>({dataset:{nblPlanValue:dataNblPlanValue},textContent:""}));
const planContext={window:{},document:{querySelectorAll:()=>planFields}};
vm.runInNewContext(plans,planContext);
for(const field of planFields){
  const expected=field.dataset.nblPlanValue.split(".").reduce((value,key)=>value?.[key],planContext.window.NBL_PRODUCT_PLANS);
  if(field.textContent!==expected){
    console.error("[website-repair] FAIL: canonical plan field was not hydrated:",field.dataset.nblPlanValue);
    failed=true;
  }
}
requireText(header,"NBL_PRODUCT_PLANS.getMore.expiry","Drawer does not use the canonical non-expiring reply-balance wording.");
requireText(header,"NBL_PRODUCT_PLANS.foundationProgram.price","Public search does not use the canonical Foundation Program price.");
requireText(terms,'data-nbl-plan-value="foundationProgram.price"',"Terms do not use the canonical Foundation Program price.");
requireText(terms,'data-nbl-plan-value="guidedFoundation.price"',"Terms do not use the canonical Guided Foundation price.");
requireText(terms,'data-nbl-plan-value="fullNblu.price"',"Terms do not use the canonical Full NBLU price.");
requireText(terms,'data-nbl-plan-value="nbluContinuation.price"',"Terms do not use the canonical Full NBLU owner continuation price.");
requireText(terms,"University checkout is handled on NBLWorld.com.","Terms do not preserve the Chat / University commerce split.");
requireText(university,'https://nblworld.com/university.html#enroll',"Public University handoff does not point to NBL World enrollment.");
requireText(university,"regular Beans / NBL Chat™","Public University handoff does not preserve regular Chat on NewBeansland.org.");
requireText(university,"NBL CHAT PLUS™ provides upgraded Beans tools on NewBeansland.org. NBL CHAT PLUS™ + University adds Professor Grey™ / Virgo System™ guided course teaching","Public University handoff does not preserve the current Plus / Plus + University boundary.");
forbidText(university,'data-nbl-university-checkout',"Public New Beansland University page still contains University checkout controls.");
forbidText(university,'nbl-university-checkout.js',"Public New Beansland University page still loads the retired University checkout bridge.");
forbidText(university,"https://buy.stripe.com/","Public New Beansland University page contains a raw Stripe checkout.");
requireText(header,"window.NBLBillingBridge","Shared authenticated billing bridge is missing.");
requireText(header,"meter:requestNblMeter","Shared membership meter bridge is missing.");
requireText(account,'id="membershipCard"',"Account membership card is missing.");
requireText(account,'data-account-billing-plan="beans"',"Account Beans checkout control is missing.");
requireText(account,'data-account-billing-plan="chat_plus"',"Account Chat Plus checkout control is missing.");
requireText(account,'data-account-billing-plan="topup_500"',"Account Get More checkout control is missing.");
requireText(account,"renderMembership","Account membership meter rendering is missing.");
for(const staleUniversityAccountCopy of [
  "Optional connected account",
  "using the normal checkout do not require an account",
  "Account connection is optional.",
  "Checkout and enrollment stay separate from this account-status check."
]){
  forbidText(header,staleUniversityAccountCopy,"University account panel still describes enrollment identity as optional.");
}
requireText(header,'data-nbl-billing-plan="beans"',"Beans checkout control is missing.");
requireText(header,'data-nbl-billing-plan="chat_plus"',"Chat Plus checkout control is missing.");
requireText(header,'data-nbl-billing-plan="topup_500"',"Get More checkout control is missing.");
requireText(header,'/billing/checkout',"Chat checkout is not routed through the server gateway.");
requireText(header,'/billing/portal',"Billing management is not routed through the server gateway.");
requireText(support,'data-nbl-plan-value="chatPlus.price"',"Support does not use the canonical Chat Plus price.");
requireText(support,'https://nblworld.com/university.html#enroll',"Support does not route University enrollment to NBL World.");
forbidText(support,"and Full Foundation at","Chat support still markets the retired Full Foundation name.");
requireText(support,"Signed-in website checkout is available from Membership & plans in NBL Chat™.","Support does not document signed-in Chat checkout.");
requireText(terms,"Signed-in website checkout is available through NBL Chat™","Terms do not document authenticated Chat checkout.");
requireText(privacy,"signed-in website checkout is handed off to Stripe","Privacy does not document Stripe checkout handling.");
requireText(deletion,"Deleting NBL application data does not by itself cancel an active Stripe subscription","Account deletion does not explain active subscription cancellation.");
for(const staleBillingCopy of ["website checkout/payment rails for the Chat plans are not currently available","website checkout/payment rails for these plans are not currently available","The public Chat-plan catalog is not a website checkout"]){
  forbidText(support,staleBillingCopy,"Support still says checkout is unavailable.");
  forbidText(terms,staleBillingCopy,"Terms still say checkout is unavailable.");
  forbidText(privacy,staleBillingCopy,"Privacy still says checkout is unavailable.");
  forbidText(deletion,staleBillingCopy,"Account deletion still says checkout is unavailable.");
}
requireText(terms,"Beans includes limited free replies.","Terms omit the limited free Beans allowance.");
requireText(privacy,'data-nbl-plan-value="getMore.replies"',"Privacy does not use canonical reply allowances.");
requireText(deletion,'data-nbl-plan-value="getMore.price"',"Account deletion information omits the canonical Get More catalog.");
requireText(privacy,"Sign-in and password/security controls are handled by Clerk.","Privacy does not preserve Clerk-owned security.");
requireText(deletion,"Clerk's secure account controls","Account deletion does not retain Clerk-owned security.");
for(const [page,source] of [["Support",support],["Legal",legal],["Account Deletion",deletion]]){
  requireText(source,'nbl-world-header.css',"Shared website shell CSS is missing from "+page+".");
  requireText(source,'nbl-world-header.js',"Shared website shell JavaScript is missing from "+page+".");
}
for(const obsolete of ["Google Play","Android app","return to the Android","Google Play Billing"]){
  forbidText(support,obsolete,"Support has obsolete platform-first instructions.");
  forbidText(terms,obsolete,"Terms have obsolete platform-first payment wording.");
  forbidText(privacy,obsolete,"Privacy has obsolete platform-first payment wording.");
  forbidText(deletion,obsolete,"Account deletion has obsolete platform-first payment wording.");
}

for(const forbidden of ["STRIPE_SECRET_KEY","SUPABASE_SERVICE_ROLE_KEY","OPENAI_API_KEY","sk-proj-","NBL_GUIDED_ACCESS_SYNC_SECRET","NBL_UNIVERSITY_PROGRESS_SYNC_SECRET"]){
  forbidText(header,forbidden,`Public header contains a private secret marker: ${forbidden}`);
  forbidText(plans,forbidden,`Public catalog contains a private secret marker: ${forbidden}`);
}

if(failed) process.exitCode=1;
else console.log("[website-repair] PASS: NBL Chat™ stays Beans-first on NewBeansland.org, preserved Grey/Virgo source remains hidden and University-gated, University commerce hands off to NBL World, Chat billing stays authenticated, and existing history/accessibility/security boundaries remain intact.");
