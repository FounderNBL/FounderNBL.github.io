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
let loading=null;

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
async function loadAnalytics(){
  if(analyticsClient)return analyticsClient;
  if(!loading){
    loading=(async()=>{
      // Load Google SDKs only after consent; this site uses no npm/bundler.
      const [{initializeApp,getApps},{isSupported,getAnalytics,setAnalyticsCollectionEnabled}]=await Promise.all([
        import(SDK+"firebase-app.js"),
        import(SDK+"firebase-analytics.js")
      ]);
      if(!(await isSupported()))throw new Error("Analytics isn't supported in this browser.");
      const app=getApps().find(item=>item.name==="nbl-messenger-web")
        ||initializeApp(CONFIG,"nbl-messenger-web");
      return {analytics:getAnalytics(app),setAnalyticsCollectionEnabled};
    })();
  }
  try{
    analyticsClient=await loading;
    return analyticsClient;
  }catch(error){
    loading=null;
    throw error;
  }
}
async function enable(){
  if(allow)allow.disabled=true;
  render("Connecting optional analytics…");
  try{
    const client=await loadAnalytics();
    // Do not store the opt-in until Google Analytics is actually ready.
    client.setAnalyticsCollectionEnabled(client.analytics,true);
    if(!saveConsent(true)){
      client.setAnalyticsCollectionEnabled(client.analytics,false);
      render("This browser cannot save your choice. Analytics remains off.");
      return;
    }
    render("Optional Google Analytics is on. No message contents or account IDs are sent by NBL.");
  }catch{
    saveConsent(false);
    render("Google Analytics wasn't available. Messenger and notifications are unaffected.");
  }finally{
    if(allow)allow.disabled=false;
  }
}
function disable(){
  saveConsent(false);
  if(analyticsClient){
    analyticsClient.setAnalyticsCollectionEnabled(analyticsClient.analytics,false);
  }
  render("Optional Google Analytics is off. Your NBL messages and calls are unchanged.");
}
if(allow&&stop&&note){
  allow.addEventListener("click",()=>{void enable();});
  stop.addEventListener("click",disable);
  render();
  if(consented())void enable(); // Previously opted-in on this browser.
}
