// NBL Messenger WEB only — Firebase initialization is optional and consent-first.
// The Firebase client configuration identifies a public web app, not a server secret.
// Existing Clerk sign-in, Supabase messages, Stream calls and VAPID push remain untouched.
// Never include message text, names, handles, Clerk IDs or private thread identifiers in analytics.
const CONFIG=Object.freeze({
  apiKey:"AIzaSyAX67NUg_cEMQwAjpftE5G8upaNn_M1QvI",
  authDomain:"project-e2272e79-b25e-4100-908.firebaseapp.com",
  projectId:"project-e2272e79-b25e-4100-908",
  storageBucket:"project-e2272e79-b25e-4100-908.firebasestorage.app",
  messagingSenderId:"956070126246",
  appId:"1:956070126246:web:d817e7fdd36d72f1980a67",
  measurementId:"G-WD6BG3KRP5"
});
const CONSENT_KEY="nbl-messenger-firebase-analytics-consent-v1";
const SDK="https://www.gstatic.com/firebasejs/13.2.0/";
const allow=document.querySelector("[data-messenger-analytics-enable]");
const stop=document.querySelector("[data-messenger-analytics-disable]");
const note=document.querySelector("[data-messenger-analytics-status]");
let analyticsClient=null;
let sdkPromise=null;
let consentEpoch=0;

function consented(){
  try{return localStorage.getItem(CONSENT_KEY)==="yes";}catch{return false;}
}
function saveConsent(value){
  try{
    if(value)localStorage.setItem(CONSENT_KEY,"yes");
    else localStorage.removeItem(CONSENT_KEY);
    return true;
  }catch{return false;}
}
function render(message){
  const enabled=consented();
  if(allow)allow.hidden=enabled;
  if(stop)stop.hidden=!enabled;
  if(note)note.textContent=message||(enabled
    ?"Optional Google Analytics enabled on this browser."
    :"Optional Google Analytics is off. Messenger still works normally.");
}
function loadSdk(){
  if(!sdkPromise){
    // Only fetch the Google SDK after an explicit opt-in or a stored prior opt-in.
    sdkPromise=Promise.all([
      import(SDK+"firebase-app.js"),
      import(SDK+"firebase-analytics.js")
    ]).then(([app,analytics])=>({app,analytics})).catch(error=>{
      sdkPromise=null;
      throw error;
    });
  }
  return sdkPromise;
}
async function enable(){
  const ticket=++consentEpoch;
  if(allow)allow.disabled=true;
  render("Connecting optional analytics…");
  try{
    const {app,analytics}=await loadSdk();
    // A user may opt out while SDKs are downloading. Do not initialize in that case.
    if(ticket!==consentEpoch)return;
    if(!(await analytics.isSupported()))throw new Error("Analytics not supported.");
    if(ticket!==consentEpoch)return;
    // No Firebase Auth, Firestore, Storage, Messaging or Cloud Functions SDKs are loaded.
    // Firebase Analytics uses the default app; do not override a different project's app.
    const existing=app.getApps().find(item=>item.name==="[DEFAULT]");
    if(existing&&existing.options.projectId!==CONFIG.projectId){
      throw new Error("Existing Firebase project does not match NBL FOUNDATION.");
    }
    if(!consented()&&!saveConsent(true)){
      render("This browser cannot store your choice. Analytics remains off.");
      return;
    }
    const client=analyticsClient||(analyticsClient={
      value:analytics.getAnalytics(existing||app.initializeApp(CONFIG)),
      setCollection:analytics.setAnalyticsCollectionEnabled
    });
    if(ticket!==consentEpoch){
      client.setCollection(client.value,false);
      return;
    }
    client.setCollection(client.value,true);
    render("Optional Google Analytics is on. No message contents or account IDs are sent by NBL.");
  }catch{
    if(ticket===consentEpoch){
      saveConsent(false);
      render("Google Analytics wasn't available. Messenger and notifications are unaffected.");
    }
  }finally{
    if(allow)allow.disabled=false;
  }
}
function disable(){
  consentEpoch++;
  saveConsent(false);
  if(analyticsClient)analyticsClient.setCollection(analyticsClient.value,false);
  render("Optional Google Analytics is off. Your NBL messages and calls are unchanged.");
}
if(allow&&stop&&note){
  allow.addEventListener("click",()=>{void enable();});
  stop.addEventListener("click",disable);
  render();
  if(consented())void enable(); // Restore a previously selected browser preference.
}
