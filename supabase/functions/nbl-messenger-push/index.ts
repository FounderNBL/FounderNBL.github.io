import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { createRemoteJWKSet, jwtVerify, importPKCS8, SignJWT } from "npm:jose@5.9.6";
import { sendPushNotification } from "npm:@mmmike/web-push@1.5.0/send";

// NBL Messenger phone push. Reuses existing nbl-social, Clerk, LOCKE rules,
// NBL Infinity in-page sound, and the existing /messenger/ service worker.
// No customer purchase, Beans usage debit, third-party messaging provider,
// or raw private message content in lock-screen notifications.
const BASE=(Deno.env.get("SUPABASE_URL")||"").replace(/\/+$/,"");
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(BASE,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});
const ISSUER="https://clerk.newbeansland.org";
const jwks=createRemoteJWKSet(new URL(ISSUER+"/.well-known/jwks.json"));
const TRUSTED=new Set(["https://newbeansland.org","https://www.newbeansland.org","https://foundernbl.github.io"]);
const DEFAULT_TITLE="NBL Messenger";
const DEFAULT_BODY="You have a new message.";
const VIDEO_INVITE_RE=/^NBL video call invitation: https:\/\/newbeansland\.org\/messenger\/call\.html\?call=([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
const SUBJECT="https://newbeansland.org/";
type Dict=Record<string,unknown>;
function cors(req:Request){
 const o=(req.headers.get("origin")||"").replace(/\/$/,"");
 const h:Record<string,string>={"content-type":"application/json; charset=utf-8","cache-control":"no-store","vary":"origin","access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"authorization,content-type"};
 if(TRUSTED.has(o))h["access-control-allow-origin"]=o;
 return h;
}
function respond(req:Request,body:unknown,code=200){return new Response(JSON.stringify(body),{status:code,headers:cors(req)});}
function clean(v:unknown,max:number){return typeof v==="string"?v.replace(/[\u0000-\u001f\u007f]+/g," ").trim().slice(0,max):"";}
function validEndpoint(raw:unknown){
 const urlText=typeof raw==="string"?raw:"";
 if(urlText.length<25||urlText.length>2500)return false;
 try{
  const u=new URL(urlText);
  if(u.protocol!=="https:"||u.username||u.password||u.hash||(u.port&&u.port!=="443"))return false;
  const host=u.hostname.toLowerCase();
  // Do not let client-supplied push subscriptions turn this sender into SSRF.
  return host==="fcm.googleapis.com"||host==="fcmregistrations.googleapis.com"||
    host==="updates.push.services.mozilla.com"||host==="push.services.mozilla.com"||
    host==="web.push.apple.com"||host.endsWith(".push.apple.com")||
    host.endsWith(".notify.windows.com");
 }catch{return false;}
}
function safeKeys(k:any){return Boolean(k&&typeof k.p256dh==="string"&&/^[A-Za-z0-9_-]{70,120}$/.test(k.p256dh)&&typeof k.auth==="string"&&/^[A-Za-z0-9_-]{16,60}$/.test(k.auth));}
function base64url(bytes:ArrayBuffer|Uint8Array){
 const data=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 let raw="";for(const n of data)raw+=String.fromCharCode(n);
 return btoa(raw).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}
async function config(){
 const found=await db.from("nbl_messenger_push_settings").select("*").eq("id",true).maybeSingle();
 if(found.error)throw Error("push_config_unavailable");
 if(found.data)return found.data;
 // Provision one stable VAPID pair using Web Crypto. It stays in service-role-only DB.
 // Insert-on-conflict prevents simultaneous first requests from rotating the key.
 const pair=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
 const pub=base64url(await crypto.subtle.exportKey("raw",pair.publicKey));
 const privateJwk=await crypto.subtle.exportKey("jwk",pair.privateKey);
 const priv=String(privateJwk.d||"");
 if(!priv||!pub)throw Error("push_key_generation_failed");
 const inserted=await db.from("nbl_messenger_push_settings").upsert(
  {id:true,vapid_public_key:pub,vapid_private_key:priv},
  {onConflict:"id",ignoreDuplicates:true}
 );
 if(inserted.error)throw Error("push_config_initialization_failed");
 const saved=await db.from("nbl_messenger_push_settings").select("*").eq("id",true).single();
 if(saved.error||!saved.data)throw Error("push_config_unavailable");
 return saved.data;
}
async function actor(req:Request){
 const raw=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9_.-]{24,16000}$/.test(raw))return null;
 try{
  const {payload}=await jwtVerify(raw.slice(7),jwks,{issuer:ISSUER});
  const id=typeof payload.sub==="string"?payload.sub:"";
  if(!id||!/^user_[A-Za-z0-9]+$/.test(id))return null;
  const r=await db.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",id).maybeSingle();
  return {id,role:clean(r.data?.role,30).toLowerCase()};
 }catch{return null;}
}
function asVapid(row:any){return {publicKey:String(row.vapid_public_key),privateKey:String(row.vapid_private_key),subject:SUBJECT};}
function uiConfig(row:any,founder:boolean){
 return {ok:true,enabled:true,publicKey:String(row.vapid_public_key),title:String(row.notification_title||DEFAULT_TITLE),body:String(row.notification_body||DEFAULT_BODY),showSender:row.show_sender===true,founderControls:founder,sound:"nbl-infinity-in-app",backgroundSound:"device-managed"};
}

// Android FCM extends the existing Clerk-verified direct-message delivery path.
// NEVER send tokens, user identifiers, message bodies or service credentials to clients.
// The service account JSON must be injected as an Edge Function secret at deployment.
// No key belongs in Android, GitHub or the VAPID browser-push configuration.
const FCM_PROJECT="project-e2272e79-b25e-4100-908";
const FCM_CREDENTIALS=Deno.env.get("NBL_FCM_SERVICE_ACCOUNT_JSON")||"";
const FCM_SCOPE="https://www.googleapis.com/auth/firebase.messaging";
const DEVICE_KEY_RE=/^[A-Za-z0-9_-]{43}$/;
const FCM_TOKEN_RE=/^[A-Za-z0-9_.:\-]{40,4096}$/;
let googleAccess:{token:string,expires:number}|null=null;

async function secretHash(key:string){
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key));
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("");
}
function androidProof(body:Dict){
 const key=body.deviceKey, token=body.fcmToken;
 if(typeof key!=="string"||!DEVICE_KEY_RE.test(key))return null;
 if(token!==undefined&&(typeof token!=="string"||!FCM_TOKEN_RE.test(token)))return null;
 return {key,token:typeof token==="string"?token:null};
}
async function devicePossession(req:Request,body:Dict,action:string){
 const p=androidProof(body);
 if(!p||(action==="android_refresh"&&!p.token))return respond(req,{ok:false,reason:"invalid_android_device"},400);
 const hash=await secretHash(p.key);
 if(action==="android_unlink"){
  const removed=await db.from("nbl_pulse_android_devices").delete().eq("device_hash",hash);
  if(removed.error)throw Error("device_unlink_failed");
  return respond(req,{ok:true,unlinked:true});
 }
 const found=await db.from("nbl_pulse_android_devices").select("device_hash").eq("device_hash",hash).maybeSingle();
 if(found.error)throw Error("device_lookup_failed");
 if(!found.data)return respond(req,{ok:false,reason:"device_not_linked"},404);
 const updated=await db.from("nbl_pulse_android_devices").update({fcm_token:p.token,updated_at:new Date().toISOString()})
   .eq("device_hash",hash);
 if(updated.error)return respond(req,{ok:false,reason:"device_update_failed"},409);
 return respond(req,{ok:true,updated:true});
}
async function subscribeAndroid(req:Request,body:Dict,userId:string){
 const hash=body.deviceHash;
 const token=body.fcmToken;
 if(typeof hash!=="string"||!/^[0-9a-f]{64}$/.test(hash)||
    typeof token!=="string"||!FCM_TOKEN_RE.test(token))
   return respond(req,{ok:false,reason:"invalid_android_device"},400);
 const previous=await db.from("nbl_pulse_android_devices").select("clerk_user_id").eq("device_hash",hash).maybeSingle();
 if(previous.error)throw Error("device_lookup_failed");
 if(previous.data&&previous.data.clerk_user_id!==userId)
  return respond(req,{ok:false,reason:"phone_linked_to_another_account"},409);
 const duplicate=await db.from("nbl_pulse_android_devices").select("clerk_user_id,device_hash").eq("fcm_token",token).maybeSingle();
 if(duplicate.error)throw Error("device_token_lookup_failed");
 if(duplicate.data&&duplicate.data.device_hash!==hash)
  return respond(req,{ok:false,reason:"token_already_registered"},409);
 const owned=await db.from("nbl_pulse_android_devices").select("device_hash")
   .eq("clerk_user_id",userId).eq("enabled",true).limit(9);
 if(owned.error)throw Error("device_limit_lookup_failed");
 if((owned.data||[]).length>=8&&!previous.data)
  return respond(req,{ok:false,reason:"device_limit_reached"},409);
 const saved=await db.from("nbl_pulse_android_devices").upsert({
   device_hash:hash,clerk_user_id:userId,fcm_token:token,enabled:true,updated_at:new Date().toISOString()
 },{onConflict:"device_hash"});
 if(saved.error)throw Error("device_subscription_failed");
 return respond(req,{ok:true,linked:true,deviceHash:hash});
}
async function googleBearer(){
 if(!FCM_CREDENTIALS)return null;
 if(googleAccess&&Date.now()<googleAccess.expires)return googleAccess.token;
 const parsed=JSON.parse(FCM_CREDENTIALS);
 if(parsed.project_id!==FCM_PROJECT||parsed.type!=="service_account"||
    typeof parsed.private_key!=="string"||!parsed.private_key.startsWith("-----BEGIN PRIVATE KEY-----")||
    typeof parsed.client_email!=="string"||!parsed.client_email.endsWith(".gserviceaccount.com"))
    throw Error("fcm_credentials_invalid");
 const key=await importPKCS8(parsed.private_key,"RS256");
 const now=Math.floor(Date.now()/1000);
 const assertion=await new SignJWT({
    iss:parsed.client_email,sub:parsed.client_email,scope:FCM_SCOPE,aud:"https://oauth2.googleapis.com/token"
 }).setProtectedHeader({alg:"RS256",typ:"JWT"}).setIssuedAt(now).setExpirationTime(now+3600).sign(key);
 const response=await fetch("https://oauth2.googleapis.com/token",{
   method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion}),
   signal:AbortSignal.timeout(8000)
 });
 if(!response.ok)throw Error("fcm_oauth_unavailable");
 const result=await response.json();
 if(typeof result.access_token!=="string")throw Error("fcm_oauth_invalid");
 googleAccess={token:result.access_token,expires:Date.now()+Math.min(3000,Math.max(60,Number(result.expires_in||3600)-120))*1000};
 return googleAccess.token;
}
async function sendAndroid(token:string,callId:string){
 const bearer=await googleBearer();
 if(!bearer)return "not_configured";
 const message={
   token,
   data:callId
    ?{type:"call",target:"/messenger/call.html?call="+callId}
    :{type:"message",target:"/messenger/"},
   android:{priority:callId?"HIGH":"NORMAL",ttl:callId?"120s":"3600s"}
 };
 const response=await fetch("https://fcm.googleapis.com/v1/projects/"+FCM_PROJECT+"/messages:send",{
   method:"POST",headers:{"authorization":"Bearer "+bearer,"content-type":"application/json"},
   body:JSON.stringify({message}),signal:AbortSignal.timeout(9000)
 });
 if(response.ok)return "sent";
 const error=await response.json().catch(()=>null);
 const status=String(error?.error?.status||"");
 const details=Array.isArray(error?.error?.details)?error.error.details:[];
 if(status==="NOT_FOUND"||status==="UNREGISTERED"||
    details.some((d:any)=>d?.errorCode==="UNREGISTERED"))return "gone";
 return "failed";
}
async function notifyAndroid(ids:string[],callId:string){
 let sent=0,gone=0,failed=0,skipped=0;
 if(!FCM_CREDENTIALS)return {sent,gone,failed,skipped:ids.length?"credentials_missing":0};
 for(const member of ids.slice(0,10)){
  const list=await db.from("nbl_pulse_android_devices").select("device_hash,fcm_token")
   .eq("clerk_user_id",member).eq("enabled",true).order("updated_at",{ascending:false}).limit(8);
  if(list.error){failed++;continue;}
  for(const device of list.data||[]){
   try{
    const result=await sendAndroid(String(device.fcm_token),callId);
    if(result==="sent")sent++;
    else if(result==="gone"){
     gone++;
     await db.from("nbl_pulse_android_devices").delete().eq("device_hash",device.device_hash);
    }else if(result==="not_configured")skipped++;
    else failed++;
   }catch{failed++;}
  }
 }
 return {sent,gone,failed,skipped};
}

async function notify(messageId:string){
 const id=/^[0-9a-f]{8}-[0-9a-f-]{27,40}$/i.test(messageId)?messageId:"";
 if(!id)return {sent:0,gone:0,failed:0,reason:"invalid_message"};
 const m=await db.from("nbl_social_messages").select("id,thread_id,sender_user_id,body,deleted_at").eq("id",id).maybeSingle();
 if(m.error||!m.data||m.data.deleted_at)return {sent:0,gone:0,failed:0,reason:"no_message"};
 const thread=await db.from("nbl_social_threads").select("thread_type").eq("id",m.data.thread_id).maybeSingle();
 if(thread.error||thread.data?.thread_type!=="direct")return {sent:0,gone:0,failed:0,reason:"not_direct"};
 // An invitation text alone cannot trigger the incoming-call notification.
 // Verify the saved call, its sender/thread, recipient, status and expiry.
 const invite=VIDEO_INVITE_RE.exec(String(m.data.body||""));
 let callId="",callRecipient="";
 if(invite){
  const match=await db.from("nbl_video_calls")
   .select("id,thread_id,caller_user_id,recipient_user_id,status,expires_at")
   .eq("id",invite[1]).maybeSingle();
  const c=match.data;
  if(match.error||!c||c.status!=="pending"||Date.parse(c.expires_at)<=Date.now()
     ||c.thread_id!==m.data.thread_id||c.caller_user_id!==m.data.sender_user_id)
   return {sent:0,gone:0,failed:0,reason:"invalid_call"};
  callId=String(c.id);callRecipient=String(c.recipient_user_id);
 }
 const recipients=await db.from("nbl_social_thread_members").select("clerk_user_id,muted,contact_nickname").eq("thread_id",m.data.thread_id);
 if(recipients.error)throw Error("push_member_lookup_failed");
 const ids=(recipients.data||[]).filter((x:any)=>x.clerk_user_id!==m.data.sender_user_id&&x.muted!==true&&(!callId||x.clerk_user_id===callRecipient)).map((x:any)=>String(x.clerk_user_id));
 if(!ids.length)return {sent:0,gone:0,failed:0};
 const conf=await config();
 const privateNicknames=new Map((recipients.data||[]).map((x:any)=>[String(x.clerk_user_id),clean(x.contact_nickname,48)]));
 let display=String(conf.notification_title||DEFAULT_TITLE);
 if(conf.show_sender===true){
  const [profile,role]=await Promise.all([
   db.from("nbl_account_profiles").select("username").eq("clerk_user_id",m.data.sender_user_id).maybeSingle(),
   db.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",m.data.sender_user_id).maybeSingle()
  ]);
  const handle=String(role.data?.role)==="founder"?"NBLFounderOfficial":clean(profile.data?.username,30);
  // A provisional NBLMember... ID is not a human-readable name.
  if(handle)display+=" · "+(/^NBLMember[a-f0-9]{12,24}$/i.test(handle)?"NBL member":"@"+handle);
 }
 const body=callId?"Tap to answer this private video call.":clean(conf.notification_body,140)||DEFAULT_BODY;
 let sent=0,gone=0,failed=0;
 for(const member of ids.slice(0,10)){
  // A recipient's private contact label can only appear on THAT recipient's device.
  const nickname=privateNicknames.get(member);
  const title=callId?"Incoming NBL video call":(
    conf.show_sender===true&&nickname
      ?String(conf.notification_title||DEFAULT_TITLE)+" · "+nickname
      :display
  ).slice(0,100);
  const q=await db.from("nbl_messenger_push_subscriptions").select("endpoint,p256dh,auth_secret").eq("clerk_user_id",member).eq("enabled",true).order("updated_at",{ascending:false}).limit(8);
  if(q.error){failed++;continue;}
  for(const sub of q.data||[]){
   if(!validEndpoint(sub.endpoint)){failed++;continue;}
   try{
    const alive=await sendPushNotification(
     {endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth_secret}},
     callId
     ?{title,body,url:"/messenger/call.html?call="+callId,tag:"nbl-video-"+callId,type:"video_call",callId}
     :{title,body,url:"/messenger/",tag:"nbl-messenger-"+String(m.data.thread_id),type:"human_message"},
     asVapid(conf)
    );
    if(alive){sent++;}else{
     gone++;await db.from("nbl_messenger_push_subscriptions").delete().eq("endpoint",sub.endpoint).eq("clerk_user_id",member);
    }
   }catch{failed++;} // Sender failure must NEVER take human messages offline.
  }
 }
 const native=await notifyAndroid(ids,callId);
 return {sent,gone,failed,androidSent:native.sent,androidGone:native.gone,androidFailed:native.failed,androidSkipped:native.skipped};
}
Deno.serve(async(req:Request)=>{
 const origin=(req.headers.get("origin")||"").replace(/\/$/,"");
 if(origin&&!TRUSTED.has(origin))return respond(req,{ok:false,reason:"origin_not_allowed"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
 if(req.method!=="POST")return respond(req,{ok:false,reason:"method_not_allowed"},405);
 let body:Dict={};
 try{body=await req.json();}catch{return respond(req,{ok:false,reason:"invalid_json"},400);}
 const action=clean(body.action,36).toLowerCase();
 if(action==="deliver"){
  const internal=req.headers.get("authorization")||"";
  if(!SERVICE||internal!=="Bearer "+SERVICE)return respond(req,{ok:false,reason:"internal_service_required"},403);
  try{
   const result=await notify(clean(body.messageId,80));
   return respond(req,{ok:true,...result});
  }catch{return respond(req,{ok:false,reason:"notification_delivery_unavailable"},503);}
 }
 // Native proof-of-possession only; it never authorizes new account ownership.
 if(action==="android_refresh"||action==="android_unlink"){
  try{return await devicePossession(req,body,action);}
  catch{return respond(req,{ok:false,reason:"device_service_unavailable"},503);}
 }
 const me=await actor(req);
 if(!me)return respond(req,{ok:false,reason:"sign_in_required"},401);
 try{
  if(action==="android_subscribe")return await subscribeAndroid(req,body,me.id);
  if(action==="android_revoke"){
   const hash=body.deviceHash;
   if(typeof hash!=="string"||!/^[0-9a-f]{64}$/.test(hash))
     return respond(req,{ok:false,reason:"invalid_android_device"},400);
   const deleted=await db.from("nbl_pulse_android_devices").delete()
     .eq("device_hash",hash).eq("clerk_user_id",me.id);
   if(deleted.error)throw Error("android_revoke_failed");
   return respond(req,{ok:true,unlinked:true});
  }
  if(action==="push_config")return respond(req,uiConfig(await config(),me.role==="founder"));
  if(action==="push_subscribe"){
   const sub=body.subscription as any;
   const endpoint=typeof sub?.endpoint==="string"?sub.endpoint:"";
   if(!validEndpoint(endpoint)||!safeKeys(sub?.keys))return respond(req,{ok:false,reason:"invalid_push_subscription"},400);
   const existing=await db.from("nbl_messenger_push_subscriptions").select("endpoint").eq("clerk_user_id",me.id).order("created_at",{ascending:true}).limit(20);
   if(existing.error)throw Error("subscription_count_failed");
   // Avoid unbounded device registrations. A browser may refresh its subscription.
   if((existing.data||[]).length>=8&&!existing.data?.some((s:any)=>s.endpoint===endpoint)){
    return respond(req,{ok:false,reason:"device_limit_reached"},409);
   }
   const saved=await db.from("nbl_messenger_push_subscriptions").upsert(
    {endpoint,clerk_user_id:me.id,p256dh:sub.keys.p256dh,auth_secret:sub.keys.auth,updated_at:new Date().toISOString(),enabled:true},
    {onConflict:"endpoint"}
   );
   if(saved.error)throw Error("push_subscription_unavailable");
   return respond(req,{ok:true,subscribed:true});
  }
  if(action==="push_unsubscribe"){
   const endpoint=typeof body.endpoint==="string"?body.endpoint:"";
   if(!validEndpoint(endpoint))return respond(req,{ok:false,reason:"invalid_push_endpoint"},400);
   const dropped=await db.from("nbl_messenger_push_subscriptions").delete().eq("endpoint",endpoint).eq("clerk_user_id",me.id);
   if(dropped.error)throw Error("push_unsubscribe_unavailable");
   return respond(req,{ok:true,unsubscribed:true});
  }
  if(action==="push_template_set"){
   if(me.role!=="founder")return respond(req,{ok:false,reason:"founder_required"},403);
   const title=clean(body.title,55),text=clean(body.body,140);
   if(title.length<3||text.length<5)return respond(req,{ok:false,reason:"invalid_notification_template"},400);
   const showSender=body.showSender===true;
   await config();
   const saved=await db.from("nbl_messenger_push_settings").update({
    notification_title:title,notification_body:text,show_sender:showSender,updated_at:new Date().toISOString()
   }).eq("id",true);
   if(saved.error)throw Error("push_template_update_failed");
   return respond(req,uiConfig(await config(),true));
  }
  return respond(req,{ok:false,reason:"unsupported_action"},400);
 }catch{return respond(req,{ok:false,reason:"push_service_unavailable"},503);}
});
