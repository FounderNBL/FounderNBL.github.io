import fs from "node:fs";

const header=fs.readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
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

// Auth/session regression checks mirrored from the Android audit where they apply to web.
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

// Beans continuity.
requireText(header,'beansHistoryLoadedFor',"Signed-in Beans history is not isolated per account.");
requireText(header,'conversationId:beansConversationId',"Beans conversation continuity is not sent to the backend.");
requireText(header,'NBL_ACCOUNT_STORE_API',"Account/history storage endpoint is missing.");

// Grey / Virgo / LOCKE parity.
requireText(header,'action:"status"',"Grey access is not checked server-side.");
requireText(header,'action:"grey"',"Grey request route is missing.");
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
  console.log("[website-chat-parity] PASS: website-owned auth/session, Beans continuity, Grey/LOCKE routing, course separation, source rendering, world routes, deletion controls, and secret guards are present.");
  console.log("[website-chat-parity] EXTERNAL LIVE CHECK: password Show/Hide, password reset/MFA, and Google sign-in are hosted by Clerk at accounts.newbeansland.org and cannot be proven by static website source.");
}
