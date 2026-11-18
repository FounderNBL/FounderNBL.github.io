import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const analytics=read("pulse/pulse-google-insights.mjs");
const ui=read("pulse/index.html");
const feed=read("messenger/social-v1.mjs");
const firebase=read("messenger/firebase-web.js");

assert.match(analytics,/MEASUREMENT_ID="G-WD6BG3KRP5"/);
assert.match(firebase,/measurementId:"G-WD6BG3KRP5"/,"Use existing NBL FOUNDATION measurement, not another key.");
assert.match(ui,/src="\/pulse\/pulse-google-insights\.mjs/);
for(const id of ["pulseInsightsEnable","pulseInsightsDisable","pulseInsightsStatus"])
  assert.match(ui,new RegExp('id="'+id+'"'));
for(const name of ["pulse_like_added","pulse_like_removed","pulse_comment_published",
  "pulse_post_submitted","pulse_share_link_opened","pulse_linked_post_opened","pulse_feed_loaded"]){
  assert.match(analytics,new RegExp('"'+name+'"'));
  assert.match(feed,new RegExp('"'+name+'"'));
}
assert.match(feed,/if\(location\.pathname==="\/pulse\/"\|\|location\.pathname==="\/pulse"\)/);
assert.match(feed,/await state\.client\.addActivityReaction/);
assert.match(feed,/await state\.client\.deleteActivityReaction/);
assert.match(feed,/announcePulseMetric\(liked\?"pulse_like_added":"pulse_like_removed"\)/);
assert.match(feed,/announcePulseMetric\("pulse_share_link_opened"\)/);
assert.match(analytics,/send_page_view:false/);
assert.match(analytics,/allow_google_signals:false/);
assert.match(analytics,/allow_ad_personalization_signals:false/);
assert.doesNotMatch(analytics,/STREAM_API_SECRET|CLERK_SECRET|FB_PAGE_ACCESS_TOKEN/);
assert.doesNotMatch(analytics,/activity_id|user_id|post_id|postId|email|phone_number|comment_text/);

function browser({consent=false,path="/pulse/"}={}){
  const store=new Map(consent?[["nbl-pulse-insights-consent-v1","yes"]]:[]);
  const elems=new Map();
  for(const id of ["pulseInsightsEnable","pulseInsightsDisable","pulseInsightsStatus"])
    elems.set(id,{hidden:false,disabled:false,textContent:"",listeners:{},addEventListener(type,cb){this.listeners[type]=cb;}});
  const listeners=new Map(),scripts=[];
  const document={
    readyState:"complete",
    getElementById:id=>elems.get(id)||null,
    addEventListener:(event,cb)=>listeners.set(event,cb),
    createElement:tag=>({tag}),
    head:{appendChild(script){scripts.push(script)}}
  };
  const localStorage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val),removeItem:key=>store.delete(key)};
  const window={};
  const sandbox={document,window,localStorage,location:{pathname:path},URL,Date,encodeURIComponent};
  vm.runInNewContext(analytics,sandbox);
  return {
    scripts,store,window,elems,listeners,
    click:id=>elems.get(id).listeners.click(),
    emit:(name,extra={})=>listeners.get("nbl:pulse:interaction")?.({detail:{name,...extra}})
  };
}

// No consent: no Google request or event collection; Pulse counts are independent.
const off=browser();
assert.equal(off.scripts.length,0);
off.emit("pulse_like_added");
assert.equal(off.window.dataLayer,undefined);

// Explicit opt-in loads only the public GA4 tag; no client/account/post ID.
off.click("pulseInsightsEnable");
assert.equal(off.store.get("nbl-pulse-insights-consent-v1"),"yes");
assert.equal(off.scripts.length,1);
assert.match(off.scripts[0].src,/^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-WD6BG3KRP5$/);
off.scripts[0].onload();
off.emit("pulse_like_added",{user_id:"DO_NOT_SEND",post_id:"DO_NOT_SEND",text:"PRIVATE"});
off.emit("not_a_real_event");
let logged=off.window.dataLayer.filter(item=>item[0]==="event");
assert.equal(logged.length,1);
assert.equal(logged[0][1],"pulse_like_added");
assert.equal(logged[0][2].nbl_surface,"pulse");
assert.ok(!JSON.stringify(off.window.dataLayer).includes("DO_NOT_SEND"));
assert.ok(!JSON.stringify(off.window.dataLayer).includes("PRIVATE"));

// External-share link clicks must not be represented as completed shares.
off.emit("pulse_share_link_opened");
logged=off.window.dataLayer.filter(item=>item[0]==="event");
assert.equal(logged.at(-1)[1],"pulse_share_link_opened");
assert.equal(logged.filter(item=>item[1]==="share").length,0);

// Opt-out stops recording from this browser, even if the script is already loaded.
off.click("pulseInsightsDisable");
assert.equal(off.store.has("nbl-pulse-insights-consent-v1"),false);
assert.equal(off.window["ga-disable-G-WD6BG3KRP5"],true);
const count=off.window.dataLayer.filter(item=>item[0]==="event").length;
off.emit("pulse_comment_published");
assert.equal(off.window.dataLayer.filter(item=>item[0]==="event").length,count);

// A saved opt-in is per-browser. Other pages do not initialize Pulse tracking.
const signed=browser({consent:true,path:"/messenger/"});
assert.equal(signed.scripts.length,0);
const restored=browser({consent:true});
assert.equal(restored.scripts.length,1);
console.log("PASS Pulse Google Insights: real Stream events, consent-first, PII-safe, OFF stops tracking.");
