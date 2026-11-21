// NBL Pulse: Meta Instagram API Unified Login — Founder-only business authorization.
// DOES NOT replace Clerk sign-in, authorize public Pulse accounts, or publish content.
// Meta app configuration/secret and existing encrypted NBL Connect key stay server-side.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
import {createRemoteJWKSet,jwtVerify} from "npm:jose@5.9.6";

const ISSUER="https://clerk.newbeansland.org";
const JWKS=createRemoteJWKSet(new URL(ISSUER+"/.well-known/jwks.json"));
const PROJECT=(Deno.env.get("SUPABASE_URL")||"").replace(/\/+$/,"");
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const APP_ID=(Deno.env.get("NBL_PULSE_META_APP_ID")||"").trim();
const APP_SECRET=(Deno.env.get("NBL_PULSE_META_APP_SECRET")||"").trim();
const CONFIG_ID=(Deno.env.get("NBL_PULSE_INSTAGRAM_CONFIG_ID")||"").trim();
const AES_KEY=(Deno.env.get("NBL_CONNECT_TOKEN_AES_KEY")||"").trim();
// Founder-provided Meta token. Never expose it to a client or send it to any other host.
const INSTAGRAM_TOKEN=(Deno.env.get("NBL_PULSE_INSTAGRAM_ACCESS_TOKEN")||"").trim();
// The Founder supplies this private value directly in Supabase Secrets when configuring Meta webhooks.
const WEBHOOK_VERIFY_TOKEN=(Deno.env.get("NBL_PULSE_IG_WEBHOOK_VERIFY_TOKEN")||"").trim();
const VERSION="v27.0"; // Current Pulse source already uses this Graph API generation.
const CALLBACK=PROJECT+"/functions/v1/nbl-instagram-connect/callback";
// Existing Facebook Login for Business / Unified Login uses config_id, not
// a hand-built Instagram Login scope URL. Meta Dashboard's configuration
// must grant this exact permission for Graph API Instagram DMs.
const REQUIRED_DM_PERMISSION="instagram_manage_messages";
const ORIGINS=new Set(["https://newbeansland.org","https://www.newbeansland.org"]);
const enc=new TextEncoder();
const db=createClient(PROJECT,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});
const configured=()=>/^\d{6,24}$/.test(APP_ID)&&APP_SECRET.length>=16&&/^\d{6,24}$/.test(CONFIG_ID)&&AES_KEY.length>=40;
function response(req:Request,body:unknown,status=200){
 const origin=req.headers.get("origin")||"";
 const headers:Record<string,string>={
  "content-type":"application/json; charset=utf-8","cache-control":"no-store","vary":"Origin",
  "access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"authorization,content-type"
 };
 if(ORIGINS.has(origin))headers["access-control-allow-origin"]=origin;
 return new Response(JSON.stringify(body),{status,headers});
}
function finish(status:string){
 // Return no Meta code, token, query string, or state to any public page.
 return Response.redirect("https://newbeansland.org/pulse/?instagram_dm=1&instagram_connect="+encodeURIComponent(status),303);
}
function b64(bytes:Uint8Array){
 let s="";for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return btoa(s);
}
function randomState(){
 return b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
async function stateHash(s:string){
 if(!/^[A-Za-z0-9_-]{40,120}$/.test(s))throw Error("invalid_state");
 return b64(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))));
}
async function encryptToken(raw:string){
 if(typeof raw!=="string"||raw.length<10)throw Error("invalid_grant");
 const keyBytes=Uint8Array.from(atob(AES_KEY),c=>c.charCodeAt(0));
 if(keyBytes.byteLength!==32)throw Error("invalid_token_key");
 const key=await crypto.subtle.importKey("raw",keyBytes,{name:"AES-GCM"},false,["encrypt"]);
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const data=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(raw)));
 return {token_ciphertext:b64(data),token_nonce:b64(iv)};
}
// Founder-only OAuth grant lookup. No Instagram credentials leave this service.
type InboxToken={token:string|null,reason?:string,source?:"oauth"|"legacy"};
async function founderInboxToken(userId:string):Promise<InboxToken>{
 const {data,error}=await db.from("nbl_connected_accounts")
  .select("token_ciphertext,token_nonce,token_expires_at,permissions")
  .eq("clerk_user_id",userId).eq("provider","instagram").maybeSingle();
 if(error)return {token:null,reason:"instagram_dm_connection_unavailable"};
 if(data?.token_ciphertext&&data?.token_nonce){
  if(data.permissions?.messaging==="missing")
   return {token:null,reason:"instagram_dm_permission_missing"};
  if(data.token_expires_at&&Date.parse(data.token_expires_at)<Date.now()+60000)
   return {token:null,reason:"instagram_dm_oauth_expired"};
  try{
   const rawKey=Uint8Array.from(atob(AES_KEY),c=>c.charCodeAt(0));
   if(rawKey.byteLength!==32)throw Error("invalid_token_key");
   const key=await crypto.subtle.importKey("raw",rawKey,{name:"AES-GCM"},false,["decrypt"]);
   const iv=Uint8Array.from(atob(data.token_nonce),c=>c.charCodeAt(0));
   const cipher=Uint8Array.from(atob(data.token_ciphertext),c=>c.charCodeAt(0));
   if(iv.length!==12||cipher.length<16)throw Error("invalid_cipher");
   const token=new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv},key,cipher));
   if(token.length<10)throw Error("invalid_token");
   return {token,source:"oauth"};
  }catch{return {token:null,reason:"instagram_dm_connection_unavailable"};}
 }
 return INSTAGRAM_TOKEN?{token:INSTAGRAM_TOKEN,source:"legacy"}:
  {token:null,reason:"instagram_dm_connection_required"};
}
async function founderUser(req:Request){
 const authorization=req.headers.get("authorization")||"";
 const token=authorization.replace(/^Bearer\s+/i,"").trim();
 if(!/^Bearer\s+/i.test(authorization)||!token)return null;
 try{
  const {payload}=await jwtVerify(token,JWKS,{issuer:ISSUER});
  const id=typeof payload.sub==="string"?payload.sub:"";
  if(!id)return null;
  const r=await db.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",id).maybeSingle();
  return !r.error&&r.data?.role==="founder"?id:null;
 }catch{return null;}
}
async function begin(req:Request){
 const origin=req.headers.get("origin")||"";
 if(origin&&!ORIGINS.has(origin))return response(req,{ok:false,reason:"origin_not_allowed"},403);
 const id=await founderUser(req);
 if(!id)return response(req,{ok:false,reason:"founder_access_required"},403);
 if(!configured())return response(req,{ok:false,reason:"instagram_meta_secrets_not_configured"},503);
 const state=randomState(),hashed=await stateHash(state);
 // Business-asset selection can take longer than a normal login. Keep
 // state single-use and random, but give the Founder an hour to finish.
 const expires=new Date(Date.now()+60*60*1000).toISOString();
 const row=await db.from("nbl_connect_oauth_states").insert({
  state_hash:hashed,provider:"instagram",clerk_user_id:id,expires_at:expires
 });
 if(row.error)return response(req,{ok:false,reason:"oauth_state_unavailable"},503);
 const url=new URL("https://www.facebook.com/"+VERSION+"/dialog/oauth");
 for(const [key,value] of Object.entries({
   client_id:APP_ID,redirect_uri:CALLBACK,config_id:CONFIG_ID,
   response_type:"code",override_default_response_type:"true",auth_type:"rerequest",state
 }))url.searchParams.set(key,value);
 return response(req,{ok:true,authorization_url:url.toString(),redirect_uri:CALLBACK});
}
type MessagingGrantStatus="granted"|"missing"|"unverified";
async function inspectMessagingGrant(token:string):Promise<{status:MessagingGrantStatus,granted:string[]}>{
 // Facebook Login for Business configuration determines the permissions.
 // Read the issued user/system-user token permissions; never expose it in
 // URLs, telemetry, browser responses, or application logs.
 const url=new URL("https://graph.facebook.com/"+VERSION+"/me/permissions");
 url.searchParams.set("limit","100");
 try{
  const res=await fetch(url.toString(),{method:"GET",
   headers:{"authorization":"Bearer "+token,"accept":"application/json"},
   redirect:"error",signal:AbortSignal.timeout(9000)});
  if(!res.ok)return {status:"unverified",granted:[]};
  const body=await res.json();
  if(!Array.isArray(body?.data)||body?.paging?.next)return {status:"unverified",granted:[]};
  const granted=body.data.filter((v:any)=>typeof v?.permission==="string"&&v.status==="granted")
   .map((v:any)=>String(v.permission).slice(0,100)).slice(0,100);
  return {status:granted.includes(REQUIRED_DM_PERMISSION)?"granted":"missing",granted};
 }catch{return {status:"unverified",granted:[]};}
}
async function callback(req:Request){
 if(!configured())return finish("instagram_not_configured");
 const u=new URL(req.url);
 if(u.searchParams.has("error")||u.searchParams.has("error_reason"))return finish("instagram_declined");
 const state=u.searchParams.get("state")||"",code=u.searchParams.get("code")||"";
 if(!code||code.length>2500||!state)return finish("instagram_invalid_callback");
 let hashed="";
 try{hashed=await stateHash(state);}catch{return finish("instagram_invalid_state");}
 // Single use: no grant can be accepted for a different account, expired state or replay.
 const now=new Date().toISOString();
 const claimed=await db.from("nbl_connect_oauth_states").update({consumed_at:now})
  .eq("state_hash",hashed).eq("provider","instagram").is("consumed_at",null).gt("expires_at",now)
  .select("clerk_user_id").maybeSingle();
 const user=claimed.data?.clerk_user_id;
 if(claimed.error||!user)return finish("instagram_state_expired");
 try{
  const url=new URL("https://graph.facebook.com/"+VERSION+"/oauth/access_token");
  for(const [key,value] of Object.entries({
   client_id:APP_ID,client_secret:APP_SECRET,redirect_uri:CALLBACK,code
  }))url.searchParams.set(key,value);
  const grantResponse=await fetch(url.toString(),{headers:{"accept":"application/json"}});
  if(!grantResponse.ok)return finish("instagram_exchange_failed");
  const grant=await grantResponse.json();
  if(typeof grant?.access_token!=="string"||grant.access_token.length<10)return finish("instagram_exchange_failed");
  const encrypted=await encryptToken(grant.access_token);
  const dmGrant=await inspectMessagingGrant(grant.access_token);
  // Meta's Unified Login returns a business/system-user grant. It is NOT an
  // NBL member login, and this is not yet proof that an IG asset can publish.
  const expires=Number(grant.expires_in);
  const exp=Number.isFinite(expires)&&expires>0
   ?new Date(Date.now()+Math.min(expires,315360000)*1000).toISOString():null;
  const saved=await db.from("nbl_connected_accounts").upsert({
   clerk_user_id:user,provider:"instagram",
   external_account_id:"meta_business_authorization",
   external_label:"Instagram — NBL Pulse business authorization",
   ...encrypted,token_expires_at:exp,refresh_ciphertext:null,refresh_nonce:null,refresh_expires_at:null,
   permissions:{flow:"meta_unified_login",asset_access:"unverified",publishing:"not_verified",
    messaging:dmGrant.status,required_messaging_permission:REQUIRED_DM_PERMISSION,
    granted_scopes:dmGrant.granted},
   connected_at:now,updated_at:now
  },{onConflict:"clerk_user_id,provider"});
  if(saved.error)return finish("instagram_save_failed");
  // Do not claim that an inbox works merely because a token was returned.
  // Meta dashboard must grant instagram_manage_messages in the config_id.
  return finish(dmGrant.status==="missing"?"instagram_dm_permission_missing":"instagram_authorization_received");
 }catch{return finish("instagram_exchange_failed");}
}

type InstagramProbe={verified:boolean,provider:string,reason:string,account?:string,diagnostic?:string};
let probeCache:{until:number,value:InstagramProbe}|null=null;
async function graphMe(host:"graph.instagram.com"|"graph.facebook.com",fields:string){
 const url=new URL("https://"+host+"/"+VERSION+"/me");
 url.searchParams.set("fields",fields);
 // Authorization header prevents raw credentials from entering request URLs/logs.
 const res=await fetch(url.toString(),{
  method:"GET",headers:{"authorization":"Bearer "+INSTAGRAM_TOKEN,"accept":"application/json"},
  signal:AbortSignal.timeout(9000)
 });
 if(!res.ok){
  let code=0,subcode=0;
  try{const err=await res.json();code=Number(err?.error?.code)||0;subcode=Number(err?.error?.error_subcode)||0;}catch{}
  return {ok:false,body:null,status:res.status,code,subcode};
 }
 const body=await res.json();
 return {ok:true,body};
}
async function probeInstagram():Promise<InstagramProbe>{
 if(!INSTAGRAM_TOKEN)return {verified:false,provider:"none",reason:"instagram_token_secret_missing"};
 if(probeCache&&Date.now()<probeCache.until)return probeCache.value;
 let result:InstagramProbe={verified:false,provider:"unknown",reason:"meta_token_unverified"};
 try{
  // Instagram Login user token, valid only when the authorized asset is @nbl_world.
  const initialIg=await graphMe("graph.instagram.com","user_id,username");
  const ig=initialIg.ok?initialIg:await graphMe("graph.instagram.com","id,username");
  if(ig.ok&&typeof ig.body?.username==="string"){
   result=ig.body.username.toLowerCase()==="nbl_world"
     ?{verified:true,provider:"instagram_user",reason:"instagram_account_verified",account:"@nbl_world"}
     :{verified:false,provider:"instagram_user",reason:"instagram_account_mismatch"};
  }else{
   // Unified Login may issue a business/system-user token on graph.facebook.com.
   // A valid Meta token alone is NOT proof of access to the Instagram asset.
   const fb=await graphMe("graph.facebook.com","id,name");
   if(fb.ok&&fb.body&&typeof fb.body==="object"&&!fb.body.error){
    result={verified:false,provider:"meta_system_user",reason:"meta_token_valid_instagram_asset_unverified"};
    try{
     const assignedUrl=new URL("https://graph.facebook.com/"+VERSION+"/me/assigned_instagram_accounts");
     assignedUrl.searchParams.set("fields","id,username");
     const assigned=await fetch(assignedUrl.toString(),{
      method:"GET",headers:{"authorization":"Bearer "+INSTAGRAM_TOKEN,"accept":"application/json"},
      signal:AbortSignal.timeout(9000)
     });
     if(assigned.ok){
      const body=await assigned.json();
      if(Array.isArray(body?.data)&&body.data.some((a:unknown)=>
       typeof a==="object"&&a!==null&&
       (a as {username?:unknown}).username==="nbl_world"
      ))result={verified:true,provider:"meta_system_user",reason:"instagram_account_verified",account:"@nbl_world"};
     }
    }catch{/* Keep a valid Meta token distinct from verified Instagram access. */}
   }else result={verified:false,provider:"unknown",reason:"token_not_accepted_by_meta",
    diagnostic:"ig_"+String(ig.status||0)+"_"+String(ig.code||0)+"_fb_"+String(fb.status||0)+"_"+String(fb.code||0)+"_fbOk_"+String(fb.ok)+"_fbIdType_"+typeof fb.body?.id,
   };
  }
 }catch{result={verified:false,provider:"unknown",reason:"meta_verification_unavailable"};}
 if(!result.verified){
  try{
   const ig=await officialInstagramAccount();
   if(ig)result={verified:true,provider:ig.via==="instagram_login"?"instagram_user":"meta_system_user",
    reason:"instagram_account_verified",account:"@nbl_world"};
  }catch{/* Preserve the existing diagnostic. */}
 }
 probeCache={until:Date.now()+300000,value:result};
 return result;
}


// Instagram business/system-user account discovery is rechecked before EVERY write.
// Restrict integration to the official NBL asset, never the first arbitrary shared account.
type InstagramTarget={
 id:string,host:"graph.facebook.com"|"graph.instagram.com",token:string,via:"assigned"|"page"|"instagram_login",pageId?:string
};
async function officialInstagramAccount(accessToken=INSTAGRAM_TOKEN):Promise<InstagramTarget|null>{
 if(!accessToken)return null;
 const validId=(v:unknown)=>/^\d{6,30}$/.test(String(v||""));
 const correctName=(v:unknown)=>typeof v==="string"&&v.toLowerCase()==="nbl_world";
 // Preserve the original system-user path, including pagination.
 let after:string|undefined;
 const seen=new Set<string>();
 for(let page=0;page<20;page++){
  try{
   const u=new URL("https://graph.facebook.com/"+VERSION+"/me/assigned_instagram_accounts");
   u.searchParams.set("fields","id,username");
   if(after)u.searchParams.set("after",after);
   const r=await fetch(u,{headers:{"authorization":"Bearer "+accessToken,"accept":"application/json"},
    signal:AbortSignal.timeout(9000)});
   if(!r.ok)break;
   const body=await r.json();
   if(!Array.isArray(body?.data))break;
   const found=body.data.filter((a:unknown)=>typeof a==="object"&&a!==null&&
    correctName((a as {username?:unknown}).username)&&validId((a as {id?:unknown}).id));
   if(found.length===1)return {id:String(found[0].id),host:"graph.facebook.com",token:accessToken,via:"assigned"};
   if(found.length>1)return null;
   const next=body.paging?.cursors?.after;
   if(!body.data.length||!next||seen.has(next)||next===after)break;
   seen.add(next);after=next;
  }catch{break;}
 }
 // Facebook Login for Business may expose Instagram through its authorized Page.
 try{
  const u=new URL("https://graph.facebook.com/"+VERSION+"/me/accounts");
  u.searchParams.set("fields","id,access_token,instagram_business_account{id,username}");
  u.searchParams.set("limit","100");
  const r=await fetch(u,{headers:{"authorization":"Bearer "+accessToken,"accept":"application/json"},
   signal:AbortSignal.timeout(9000)});
  if(r.ok){
   const body=await r.json();
   if(Array.isArray(body?.data)){
    const matches=body.data.filter((page:unknown)=>{
     if(typeof page!=="object"||page===null)return false;
     const ig=(page as {instagram_business_account?:{id?:unknown,username?:unknown}}).instagram_business_account;
     return ig&&validId(ig.id)&&correctName(ig.username);
    });
    if(matches.length===1){
     const page=matches[0];
     const t=typeof page.access_token==="string"&&page.access_token.length>10?page.access_token:accessToken;
     return {id:String(page.instagram_business_account.id),host:"graph.facebook.com",token:t,via:"page",pageId:String(page.id)};
    }
    if(matches.length>1)return null;
   }
  }
 }catch{/* Try direct Instagram Login. */}
 // Business Login for Instagram uses a different Graph host; it does not have
 // to expose /me/assigned_instagram_accounts on Facebook Graph.
 for(const fields of ["user_id,username","id,username"]){
  try{
   const u=new URL("https://graph.instagram.com/"+VERSION+"/me");
   u.searchParams.set("fields",fields);
   const r=await fetch(u,{headers:{"authorization":"Bearer "+accessToken,"accept":"application/json"},
    signal:AbortSignal.timeout(9000)});
   if(!r.ok)continue;
   const a=await r.json();
   const id=a?.user_id||a?.id;
   if(correctName(a?.username)&&validId(id))
    return {id:String(id),host:"graph.instagram.com",token:accessToken,via:"instagram_login"};
  }catch{/* Continue to alternate field request. */}
 }
 return null;
}
async function metaGet(path:string,params?:Record<string,string>,host:"graph.facebook.com"|"graph.instagram.com"="graph.facebook.com",token=INSTAGRAM_TOKEN){
 const url=new URL("https://"+host+"/"+VERSION+"/"+path);
 for(const [k,v] of Object.entries(params||{}))url.searchParams.set(k,v);
 const res=await fetch(url.toString(),{
  headers:{"authorization":"Bearer "+token,"accept":"application/json"},
  signal:AbortSignal.timeout(10000)
 });
 const body=await res.json().catch(()=>null);
 return {ok:res.ok&&!body?.error,body};
}
async function metaPost(path:string,data:Record<string,string>,host:"graph.facebook.com"|"graph.instagram.com"="graph.facebook.com",token=INSTAGRAM_TOKEN){
 const res=await fetch("https://"+host+"/"+VERSION+"/"+path,{
  method:"POST",headers:{"authorization":"Bearer "+token,
   "content-type":"application/x-www-form-urlencoded","accept":"application/json"},
  body:new URLSearchParams(data).toString(),signal:AbortSignal.timeout(15000)
 });
 const body=await res.json().catch(()=>null);
 return {ok:res.ok&&!body?.error,body};
}
async function instagramPublishingCheck(req:Request){
 if(!INSTAGRAM_TOKEN)return response(req,{ok:true,account_verified:false,reason:"instagram_token_secret_missing",publish_permission:"unknown"},200);
 try{
  const ig=await officialInstagramAccount();
  if(!ig)return response(req,{ok:true,account_verified:false,reason:"official_account_not_accessible",publish_permission:"unknown"});
  const permissions=await metaGet("me/permissions",undefined,ig.host,ig.token);
  let grant:"granted"|"missing"|"unknown"="unknown";
  if(permissions.ok&&Array.isArray(permissions.body?.data)){
   grant=permissions.body.data.some((p:unknown)=>typeof p==="object"&&p!==null&&
    (p as {permission?:unknown}).permission==="instagram_content_publish"&&
    (p as {status?:unknown}).status==="granted")?"granted":"missing";
  }
  // A scope list isn't proof that an individual operation will work.
  const limit=await metaGet(ig.id+"/content_publishing_limit",{"fields":"config,quota_usage"},ig.host,ig.token);
  return response(req,{
   ok:true,account_verified:true,account:"@nbl_world",access_mode:ig.via,publish_permission:grant,
   publishing_limit_accessible:limit.ok,publishing_status:"not_live_tested"
  });
 }catch{return response(req,{ok:false,reason:"meta_unavailable"},503);}
}
function allowedPublicPhoto(value:unknown):value is string{
 if(typeof value!=="string"||value.length>2400)return false;
 try{
  const u=new URL(value);
  if(u.protocol!=="https:"||u.username||u.password||u.port||u.hash)return false;
  // Pulse uploads images to Stream's HTTPS CDN, sometimes with a signed query
  // and no file extension. Meta fetches the same image that the Founder posted.
  if(u.hostname.endsWith(".stream-io-cdn.com"))
   return u.pathname.startsWith("/")&&u.pathname.length>1;
  // Existing static public JPEG media destinations remain supported.
  if(u.search)return false;
  if(["newbeansland.org","www.newbeansland.org"].includes(u.hostname))
   return /\.(?:jpg|jpeg)$/i.test(u.pathname);
  if(u.hostname==="tvypdakofcrlvnwporhh.supabase.co")
   return u.pathname.startsWith("/storage/v1/object/public/")&&/\.(?:jpg|jpeg)$/i.test(u.pathname);
  return false;
 }catch{return false;}
}
function allowedPublicReel(value:unknown):value is string{
 if(typeof value!=="string"||value.length>2400)return false;
 try{
  const u=new URL(value);
  if(u.protocol!=="https:"||u.username||u.password||u.port||u.hash)return false;
  // Stream's authenticated media uploader returns public CDN links. No arbitrary
  // URL fetch is performed by this function; Meta retrieves the original upload.
  return u.hostname.endsWith(".stream-io-cdn.com")&&u.pathname.startsWith("/")&&u.pathname.length>1;
 }catch{return false;}
}
async function founderPublish(req:Request,kind:"prepare"|"confirm"|"status"){
 const origin=req.headers.get("origin")||"";
 if(origin&&!ORIGINS.has(origin))return response(req,{ok:false,reason:"origin_not_allowed"},403);
 if(!await founderUser(req))return response(req,{ok:false,reason:"founder_access_required"},403);
 if(!INSTAGRAM_TOKEN)return response(req,{ok:false,reason:"instagram_token_missing"},503);
 let body:Record<string,unknown>;
 try{
  if(Number(req.headers.get("content-length")||"0")>8192)return response(req,{ok:false,reason:"request_too_large"},413);
  const raw=await req.text();if(raw.length>8192)return response(req,{ok:false,reason:"request_too_large"},413);
  body=JSON.parse(raw);
  if(!body||Array.isArray(body)||typeof body!=="object")throw Error();
 }catch{return response(req,{ok:false,reason:"invalid_json"},400);}
 if(body.confirm!==kind)return response(req,{ok:false,reason:"explicit_confirmation_required"},400);
 try{
  const ig=await officialInstagramAccount();
  if(!ig)return response(req,{ok:false,reason:"official_instagram_not_accessible"},403);
  if(kind==="prepare"){
   const isReel=body.media_type==="REELS";
   const caption=body.caption;
   if(typeof caption!=="string"||caption.length>2100)
    return response(req,{ok:false,reason:"invalid_caption"},400);
   if(isReel&&!allowedPublicReel(body.video_url))
    return response(req,{ok:false,reason:"invalid_public_reel_url"},400);
   if(!isReel&&!allowedPublicPhoto(body.image_url))
    return response(req,{ok:false,reason:"invalid_public_jpeg_or_caption"},400);
   // Preparing is not publishing. The Founder must explicitly confirm later.
   // Instagram publishes as @nbl_world. Identify the original verified Pulse
   // Founder in the caption without changing or spoofing external identities.
   const credit="Originally on NBL Pulse · @NBLFounderOfficial";
   const stamped=caption.trim().slice(0,2100-credit.length-2)+"\n\n"+credit;
   const media=isReel
    ?{media_type:"REELS",video_url:String(body.video_url),caption:stamped}
    :{image_url:String(body.image_url),caption:stamped};
   const created=await metaPost(ig.id+"/media",media,ig.host,ig.token);
   if(!created.ok||!/^\d{6,30}$/.test(String(created.body?.id||"")))
    return response(req,{ok:false,reason:"meta_media_prepare_rejected"},502);
   return response(req,{ok:true,container_id:String(created.body.id),published:false,account:"@nbl_world"});
  }
  const creation=body.creation_id;
  if(typeof creation!=="string"||!/^\d{6,30}$/.test(creation))
   return response(req,{ok:false,reason:"invalid_creation_id"},400);
  // Read-only status check: never publishes. Distinguish processing from a
  // terminal media error before the Founder attempts to publish.
  const status=await metaGet(creation,{"fields":"status_code"},ig.host,ig.token);
  if(!status.ok)return response(req,{ok:false,reason:"media_container_status_unavailable"},502);
  const code=["IN_PROGRESS","FINISHED","PUBLISHED","ERROR","EXPIRED"]
   .includes(status.body?.status_code)?status.body.status_code:"UNKNOWN";
  if(kind==="status")return response(req,{
   ok:true,status_code:code,ready:code==="FINISHED",
   // These are safe finite values; no provider token or raw error contents.
   terminal:code==="ERROR"||code==="EXPIRED"||code==="PUBLISHED"
  });
  if(code!=="FINISHED")
   return response(req,{
    ok:false,reason:code==="ERROR"?"media_container_failed":
     code==="EXPIRED"?"media_container_expired":
     code==="PUBLISHED"?"media_container_already_published":"media_container_not_ready",
    status_code:code
   },409);
  // Founder must independently call /publish/confirm to authorize external publication.
  const published=await metaPost(ig.id+"/media_publish",{creation_id:creation},ig.host,ig.token);
  if(!published.ok||!/^\d{6,30}$/.test(String(published.body?.id||"")))
   return response(req,{ok:false,reason:"meta_publish_rejected"},502);
  // After Meta confirms publication, return the actual Instagram permalink if available.
  // This is useful evidence for Meta review, not a claim about cross-platform sharing.
  let permalink:string|null=null;
  try{
   const link=await metaGet(String(published.body.id),{"fields":"permalink"},ig.host,ig.token);
   if(link.ok&&typeof link.body?.permalink==="string"){
    const u=new URL(link.body.permalink);
    if(u.protocol==="https:"&&["instagram.com","www.instagram.com"].includes(u.hostname))
     permalink=u.href;
   }
  }catch{}
  return response(req,{ok:true,published:true,media_id:String(published.body.id),permalink,account:"@nbl_world"});
 }catch{return response(req,{ok:false,reason:"meta_unavailable"},503);}
}
// Founder-only Instagram Direct inbox. Meta is the source of truth: we do not
// copy DM bodies into NBL databases, logs, analytics or public feeds. Polling
// refreshes incoming messages while the Pulse inbox is open.
// Messaging with Facebook Login requires the linked Page's own token, not
// the assigned Instagram publishing token. Keep publishing discovery unchanged.
async function officialInstagramInboxAccount(accessToken:string):Promise<InstagramTarget|null>{
 const pageId="1249164184954203"; // Existing official New Beansland Page.
 const valid=(v:unknown)=>/^\d{6,50}$/.test(String(v||""));
 function fromPage(page:any):InstagramTarget|null{
  const ig=page?.instagram_business_account;
  if(String(page?.id)!==pageId||!valid(ig?.id)||String(ig?.username||"").toLowerCase()!=="nbl_world"||
    typeof page?.access_token!=="string"||page.access_token.length<10)return null;
  return {id:String(ig.id),host:"graph.facebook.com",token:page.access_token,via:"page",pageId};
 }
 // Direct lookup avoids losing a linked Page beyond /me/accounts pagination.
 for(const path of [pageId,"me/accounts"]){
  let after:string|undefined;
  const seen=new Set<string>();
  for(let i=0;i<10;i++){
   try{
    const u=new URL("https://graph.facebook.com/"+VERSION+"/"+path);
    u.searchParams.set("fields","id,access_token,instagram_business_account{id,username}");
    if(path==="me/accounts"){u.searchParams.set("limit","100");if(after)u.searchParams.set("after",after);}
    const res=await fetch(u,{headers:{authorization:"Bearer "+accessToken,accept:"application/json"},
     redirect:"error",signal:AbortSignal.timeout(9000)});
    if(!res.ok)break;
    const body=await res.json();
    if(path===pageId){const target=fromPage(body);if(target)return target;break;}
    for(const page of Array.isArray(body?.data)?body.data:[]){const target=fromPage(page);if(target)return target;}
    const next=body?.paging?.cursors?.after;
    if(!body?.paging?.next||typeof next!=="string"||seen.has(next))break;
    seen.add(next);after=next;
   }catch{break;}
  }
 }
 const alternate=await officialInstagramAccount(accessToken);
 return alternate?.host==="graph.instagram.com"?alternate:null;
}
const IG_CONVERSATION_ID=/^[A-Za-z0-9_=-]{6,512}$/;
const IG_PARTICIPANT_ID=/^\d{6,50}$/;
function safeMessage(record:any){
 const sender=record?.from||{};
 return {
  id:String(record?.id||"").slice(0,100),
  text:typeof record?.message==="string"?record.message.slice(0,4000):"",
  sender_id:String(sender.id||"").slice(0,80),
  sender_username:typeof sender.username==="string"?sender.username.slice(0,80):"",
  created_at:typeof record?.created_time==="string"?record.created_time:""
 };
}
function privateGraphError(req:Request,status:number,body:any){
 const code=Number(body?.error?.code)||0;
 const subcode=Number(body?.error?.error_subcode)||0;
 const permission=[10,190,200,201,250].includes(code)||status===401||status===403;
 const reason=code===190?"instagram_dm_oauth_expired":
  subcode===2534037?"instagram_dm_routing_owned":
  permission?"instagram_dm_permission_or_token_required":
  status===429?"instagram_dm_rate_limited":"instagram_dm_meta_unavailable";
 // Only numeric provider diagnostics, never Meta's raw response or private content.
 return response(req,{ok:false,reason,meta_error_code:code||null,meta_error_subcode:subcode||null},permission?403:status===429?429:503);
}
async function graphInboxRead(path:string,params:Record<string,string>,ig:InstagramTarget){
 const u=new URL("https://"+ig.host+"/"+VERSION+"/"+path);
 for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);
 const res=await fetch(u,{headers:{"authorization":"Bearer "+ig.token,"accept":"application/json"},
  redirect:"error",signal:AbortSignal.timeout(11000)});
 const data=await res.json().catch(()=>null);
 return {ok:res.ok&&!data?.error,status:res.status,data};
}
async function privateInbox(req:Request,action:"list"|"thread"|"reply"){
 const origin=req.headers.get("origin")||"";
 if(!ORIGINS.has(origin))return response(req,{ok:false,reason:"origin_not_allowed"},403);
 const actor=await founderUser(req);
 if(!actor)return response(req,{ok:false,reason:"founder_access_required"},403);
 if(Number(req.headers.get("content-length")||0)>5000)return response(req,{ok:false,reason:"invalid_request"},413);
 let body:any;
 try{const raw=await req.text();if(raw.length>5000)throw Error();body=JSON.parse(raw);
  if(!body||Array.isArray(body)||typeof body!=="object")throw Error();
 }catch{return response(req,{ok:false,reason:"invalid_json"},400);}
 if(body.action!==action)return response(req,{ok:false,reason:"invalid_action"},400);
 const grant=await founderInboxToken(actor);
 if(!grant.token)return response(req,{ok:false,reason:grant.reason||"instagram_dm_connection_required"},409);
 try{
  const ig=await officialInstagramInboxAccount(grant.token);
  if(!ig)return response(req,{ok:false,reason:"instagram_dm_page_access_required"},403);
  const ownIds=new Set([ig.id,...(ig.pageId?[ig.pageId]:[])]);
  if(action==="list"){
   const params:Record<string,string>={fields:"id,updated_time,participants{id,username}",limit:"25"};
   if(ig.host==="graph.facebook.com")params.platform="instagram";
   const inboxId=ig.host==="graph.facebook.com"?ig.pageId:ig.id;
   if(!inboxId)return response(req,{ok:false,reason:"instagram_dm_page_access_required"},403);
   const list=await graphInboxRead(inboxId+"/conversations",params,ig);
   if(!list.ok)return privateGraphError(req,list.status,list.data);
   const conversations=(Array.isArray(list.data?.data)?list.data.data:[]).map((c:any)=>({
    id:String(c.id||""),updated_at:String(c.updated_time||"").slice(0,60),
    people:(Array.isArray(c.participants?.data)?c.participants.data:[])
     .filter((p:any)=>p&&p.id&&!ownIds.has(String(p.id)))
     .map((p:any)=>({id:String(p.id).slice(0,80),username:typeof p.username==="string"?p.username.slice(0,80):""}))
   })).filter((c:any)=>IG_CONVERSATION_ID.test(c.id));
   return response(req,{ok:true,account:"@nbl_world",conversations,has_more:!!list.data?.paging?.next,
    mode:ig.via});
  }
  const conversationId=String(body.conversation_id||"");
  if(!IG_CONVERSATION_ID.test(conversationId))return response(req,{ok:false,reason:"invalid_conversation"},400);
  // Verify the conversation belongs to @nbl_world, never trust a client ID.
  const details=await graphInboxRead(encodeURIComponent(conversationId),
   {fields:"id,participants{id,username},updated_time"},ig);
  if(!details.ok)return privateGraphError(req,details.status,details.data);
  const members=Array.isArray(details.data?.participants?.data)?details.data.participants.data:[];
  const owner=members.some((p:any)=>ownIds.has(String(p?.id||"")));
  const others=members.filter((p:any)=>IG_PARTICIPANT_ID.test(String(p?.id||""))&&!ownIds.has(String(p.id)));
  if(!owner||others.length!==1||String(details.data?.id)!==conversationId)
   return response(req,{ok:false,reason:"conversation_not_owned"},403);
  const thread=await graphInboxRead(encodeURIComponent(conversationId)+"/messages",
   {fields:"id,message,created_time,from{id,username},to{id,username}",limit:"20"},ig);
  if(!thread.ok)return privateGraphError(req,thread.status,thread.data);
  const messages=(Array.isArray(thread.data?.data)?thread.data.data:[]).map(safeMessage)
   .filter((m:any)=>m.id&&m.created_at).sort((a:any,b:any)=>Date.parse(a.created_at)-Date.parse(b.created_at));
  const lastInbound=messages.filter((m:any)=>m.sender_id===String(others[0].id))
   .map((m:any)=>Date.parse(m.created_at)).filter((n:number)=>Number.isFinite(n)).sort((a:number,b:number)=>b-a)[0]||0;
  const replyWindowOpen=lastInbound>0&&Date.now()-lastInbound<=24*60*60*1000&&lastInbound-Date.now()<60000;
  if(action==="thread")return response(req,{ok:true,conversation_id:conversationId,account:"@nbl_world",
   participant:{id:String(others[0].id),username:String(others[0].username||"").slice(0,80)},
   messages,reply_window_open:replyWindowOpen});
  const message=body.message;
  if(body.confirm!=="send"||typeof message!=="string"||message.trim().length<1||new TextEncoder().encode(message.trim()).length>1000)
   return response(req,{ok:false,reason:"invalid_or_unconfirmed_reply"},400);
  // Meta requires the customer to initiate and imposes a standard reply window.
  if(!replyWindowOpen)return response(req,{ok:false,reason:"instagram_dm_reply_window_closed"},403);
  // Facebook Login sends through the linked Page's messages endpoint;
  // Instagram Login sends through the verified Instagram business user.
  const sendId=ig.host==="graph.facebook.com"?ig.pageId:ig.id;
  if(!sendId||!IG_PARTICIPANT_ID.test(sendId))
   return response(req,{ok:false,reason:"instagram_dm_page_access_required"},403);
  // Use Meta's documented Instagram freeform text envelope for Page login.
  const payload={recipient:{id:String(others[0].id)},message:{text:message.trim()}};
  const pageLogin=ig.host==="graph.facebook.com";
  const sendBody=pageLogin?new URLSearchParams({recipient:JSON.stringify(payload.recipient),message:JSON.stringify(payload.message)}):JSON.stringify(payload);
  const outbound=await fetch("https://"+ig.host+"/"+VERSION+"/"+sendId+"/messages",{
   method:"POST",headers:{"authorization":"Bearer "+ig.token,"content-type":pageLogin?"application/x-www-form-urlencoded":"application/json","accept":"application/json"},
   body:sendBody,
   redirect:"error",signal:AbortSignal.timeout(12000)
  });
  const sent=await outbound.json().catch(()=>null);
  if(!outbound.ok||sent?.error)return privateGraphError(req,outbound.status,sent);
  if(typeof sent?.message_id!=="string"||!sent.message_id||(sent.recipient_id!=null&&String(sent.recipient_id)!==String(others[0].id)))
   return response(req,{ok:false,reason:"instagram_dm_send_unconfirmed"},502);
  return response(req,{ok:true,sent:true,conversation_id:conversationId,message_id:String(sent.message_id||sent.id).slice(0,120)});
 }catch{return response(req,{ok:false,reason:"instagram_dm_meta_unavailable"},503);}
}
// Verified Meta webhook transport; the Pulse inbox reads the latest messages directly.

function webhookReady(){return APP_SECRET.length>=16&&WEBHOOK_VERIFY_TOKEN.length>=20;}
async function webhook(req:Request){
 if(!webhookReady())return response(req,{ok:false,reason:"webhook_secrets_missing"},503);
 if(req.method==="GET"){
  const u=new URL(req.url);
  const challenge=u.searchParams.get("hub.challenge")||"";
  if(u.searchParams.get("hub.mode")!=="subscribe"||
    u.searchParams.get("hub.verify_token")!==WEBHOOK_VERIFY_TOKEN||
    !/^[A-Za-z0-9_-]{1,160}$/.test(challenge))
   return response(req,{ok:false,reason:"webhook_verification_failed"},403);
  return new Response(challenge,{status:200,headers:{
   "content-type":"text/plain; charset=utf-8","cache-control":"no-store"}});
 }
 if(req.method!=="POST")return response(req,{ok:false,reason:"method_not_allowed"},405);
 const signature=req.headers.get("x-hub-signature-256")||"";
 if(!/^sha256=[a-f0-9]{64}$/i.test(signature))
  return response(req,{ok:false,reason:"invalid_signature"},403);
 const raw=await req.arrayBuffer();
 if(raw.byteLength>1024*1024)return response(req,{ok:false,reason:"request_too_large"},413);
 const key=await crypto.subtle.importKey("raw",enc.encode(APP_SECRET),
  {name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const sig=Uint8Array.from((signature.slice(7).match(/../g)||[]),s=>parseInt(s,16));
 const verified=await crypto.subtle.verify("HMAC",key,sig,raw);
 if(!verified)return response(req,{ok:false,reason:"invalid_signature"},403);
 // No private message bodies are stored. The signed-in inbox pulls from Meta.
 // The webhook is authenticated and acknowledged; polling picks up new DMs.
 return response(req,{ok:true,received:true,processing:"inbox_polling"});
}

Deno.serve(async(req:Request)=>{
 const pathname=new URL(req.url).pathname;
 if(req.method==="OPTIONS")return response(req,{ok:true},200);
 if(pathname.endsWith("/webhook"))return webhook(req);
 if(req.method==="GET"&&pathname.endsWith("/callback"))return callback(req);
 if(req.method==="GET"&&pathname.endsWith("/publishing-check"))return instagramPublishingCheck(req);
 if(req.method==="POST"&&pathname.endsWith("/inbox/list"))return privateInbox(req,"list");
 if(req.method==="POST"&&pathname.endsWith("/inbox/thread"))return privateInbox(req,"thread");
 if(req.method==="POST"&&pathname.endsWith("/inbox/reply"))return privateInbox(req,"reply");
 if(req.method==="POST"&&pathname.endsWith("/publish/prepare"))return founderPublish(req,"prepare");
 if(req.method==="POST"&&pathname.endsWith("/publish/status"))return founderPublish(req,"status");
 if(req.method==="POST"&&pathname.endsWith("/publish/confirm"))return founderPublish(req,"confirm");
 if(req.method==="GET"&&pathname.endsWith("/token-check")){
  const check=await probeInstagram();
  return response(req,{ok:true,token_secret_present:!!INSTAGRAM_TOKEN,...check,publishing_status:"not_verified"});
 }
 if(req.method==="GET")return response(req,{
  ok:true,service:"nbl_instagram_unified_login",callback_url:CALLBACK,
  configuration_ready:configured(),instagram_token_secret_present:!!INSTAGRAM_TOKEN,member_login:"clerk_unchanged",
  publishing_status:"not_verified"
 });
 if(req.method==="POST"&&pathname.endsWith("/begin"))return begin(req);
 return response(req,{ok:false,reason:"not_found"},404);
});
