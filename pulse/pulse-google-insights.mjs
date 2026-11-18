// Pulse Insights — optional, consent-first Google Analytics 4 event reporting.
// Reuses the existing public NBL FOUNDATION web measurement ID.
// Stream Feeds remains the source of truth for actual likes/comments.
// No names, user IDs, post IDs, URLs, captions, media or message data leave NBL.
const MEASUREMENT_ID="G-WD6BG3KRP5";
const CONSENT_KEY="nbl-pulse-insights-consent-v1";
const EVENT_TYPES=new Set([
  "pulse_like_added",
  "pulse_like_removed",
  "pulse_comment_published",
  "pulse_post_submitted",
  "pulse_share_link_opened",
  "pulse_linked_post_opened",
  "pulse_feed_loaded"
]);
const CONSENT_DENIED=Object.freeze({
  analytics_storage:"denied",
  ad_storage:"denied",
  ad_user_data:"denied",
  ad_personalization:"denied"
});
const isPulse=location.pathname==="/pulse/"||location.pathname==="/pulse";
let enabled=false,ready=false,tagStarted=false;
const el=id=>document.getElementById(id);
function consented(){
  try{return localStorage.getItem(CONSENT_KEY)==="yes";}catch{return false;}
}
function saveConsent(allow){
  try{
    if(allow)localStorage.setItem(CONSENT_KEY,"yes");
    else localStorage.removeItem(CONSENT_KEY);
    return true;
  }catch{return false;}
}
function gtag(...args){
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push(args);
}
function render(note){
  const on=el("pulseInsightsEnable"),off=el("pulseInsightsDisable"),status=el("pulseInsightsStatus");
  if(on){on.hidden=enabled;on.disabled=tagStarted&&!ready&&enabled;}
  if(off)off.hidden=!enabled;
  if(status)status.textContent=note||(enabled
    ?"Optional Google engagement statistics enabled on this browser."
    :"Google engagement statistics OFF. Likes and comments still work.");
}
function begin(){
  if(tagStarted)return;
  tagStarted=true;
  // This page never fetches Google's script without prior opt-in.
  // Even after opt-in, advertising/personalization remain denied.
  gtag("consent","default",CONSENT_DENIED);
  gtag("consent","update",{analytics_storage:"granted"});
  gtag("js",new Date());
  gtag("config",MEASUREMENT_ID,{
    send_page_view:false,
    allow_google_signals:false,
    allow_ad_personalization_signals:false,
    page_location:"https://newbeansland.org/pulse/",
    page_title:"NBL Pulse"
  });
  const script=document.createElement("script");
  script.async=true;
  script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(MEASUREMENT_ID);
  script.onload=()=>{
    ready=true;
    if(!enabled)gtag("consent","update",CONSENT_DENIED);
    render(enabled?"Pulse Insights reporting is enabled.":"Pulse Insights reporting is off.");
  };
  script.onerror=()=>{
    ready=false;
    enabled=false;
    saveConsent(false);
    window["ga-disable-"+MEASUREMENT_ID]=true;
    render("Google Analytics could not connect. Pulse likes and comments are unaffected.");
  };
  document.head.appendChild(script);
}
function enable(){
  if(!saveConsent(true)){
    render("Your browser cannot save consent; optional analytics remains OFF.");
    return;
  }
  enabled=true;
  window["ga-disable-"+MEASUREMENT_ID]=false;
  if(tagStarted)gtag("consent","update",{analytics_storage:"granted"});
  else begin();
  render(ready?"Optional Google engagement statistics are enabled.":"Connecting optional Google Analytics…");
}
function disable(){
  enabled=false;
  saveConsent(false);
  window["ga-disable-"+MEASUREMENT_ID]=true;
  if(tagStarted)gtag("consent","update",CONSENT_DENIED);
  render("Google statistics OFF. Your NBL likes, posts and comments still work.");
}
function capture(event){
  // Only NBL-authored, finite event types. Never trust caller-supplied
  // event names/parameters or send content identifiers to Google.
  const name=event?.detail?.name;
  if(!enabled||!ready||!consented()||!EVENT_TYPES.has(name))return;
  gtag("event",name,{nbl_surface:"pulse",content_type:"post"});
}
function mount(){
  const allow=el("pulseInsightsEnable"),stop=el("pulseInsightsDisable"),status=el("pulseInsightsStatus");
  if(!isPulse||!allow||!stop||!status)return;
  document.addEventListener("nbl:pulse:interaction",capture);
  allow.addEventListener("click",enable);
  stop.addEventListener("click",disable);
  window["ga-disable-"+MEASUREMENT_ID]=!consented();
  render();
  if(consented())enable();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
