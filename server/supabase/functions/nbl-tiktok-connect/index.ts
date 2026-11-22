// NBL Pulse — independent TikTok OAuth and posting. No secrets or provider access tokens in browser responses.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
import {createRemoteJWKSet,jwtVerify} from "npm:jose@5.9.6";
const root="https://newbeansland.org", callback=root+"/pulse/tiktok-callback.html";
const issuer="https://clerk.newbeansland.org", jwks=createRemoteJWKSet(new URL(issuer+"/.well-known/jwks.json"));
const origins=new Set([root,"https://www.newbeansland.org"]);
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
const enc=new TextEncoder(), dec=new TextDecoder();
const maxBytes=20*1024*1024, api="https://open.tiktokapis.com/v2/";
const modes=["sandbox","production"] as const;
type Mode=typeof modes[number];
function config(mode:Mode){
 const prefix=mode==="sandbox"?"NBL_TIKTOK_SANDBOX_":"NBL_TIKTOK_";
 return {key:(Deno.env.get(prefix+"CLIENT_KEY")||"").trim(),secret:(Deno.env.get(prefix+"CLIENT_SECRET")||"").trim()};
}
function enabled(mode:Mode){const c=config(mode);return !!(c.key&&c.secret&&Deno.env.get("NBL_CONNECT_TOKEN_AES_KEY"))&&(mode==="sandbox"||Deno.env.get("NBL_TIKTOK_PRODUCTION_ENABLED")==="true");}
function json(req:Request,body:unknown,status=200){
 const origin=req.headers.get("origin")||"";
 const headers:Record<string,string>={"content-type":"application/json","cache-control":"no-store","vary":"Origin","access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"authorization,content-type"};
 if(origins.has(origin))headers["access-control-allow-origin"]=origin;
 return new Response(JSON.stringify(body),{status,headers});
}
class Failure extends Error {constructor(public reason:string,public status=400){super(reason);}}
const fail=(reason:string,status=400):never=>{throw new Failure(reason,status);};
const b64=(b:Uint8Array)=>btoa(String.fromCharCode(...b));
const un64=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const hash=async(s:string)=>b64(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))));
const stateValue=()=>b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
async function aes(){const raw=un64(Deno.env.get("NBL_CONNECT_TOKEN_AES_KEY")||"");if(raw.length!==32)fail("encryption_unavailable",503);return crypto.subtle.importKey("raw",raw,"AES-GCM",false,["encrypt","decrypt"]);}
async function seal(token:string,owner:string,mode:Mode,kind:string){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:enc.encode(owner+"|"+mode+"|"+kind)},await aes(),enc.encode(token));
 return b64(iv)+"."+b64(new Uint8Array(cipher));
}
async function unseal(s:string,owner:string,mode:Mode,kind:string){
 const [iv,cipher]=s.split(".");
 return dec.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:un64(iv),additionalData:enc.encode(owner+"|"+mode+"|"+kind)},await aes(),un64(cipher)));
}
async function member(req:Request){
 const token=req.headers.get("authorization")||"";
 if(!token.startsWith("Bearer "))return fail("sign_in_required",401);
 try{const {payload}=await jwtVerify(token.slice(7),jwks,{issuer,algorithms:["RS256"]});
  if(!payload.sub||!origins.has(String(payload.azp||"")))return fail("sign_in_required",401);
  return payload.sub;
 }catch{return fail("sign_in_required",401);}
}
function safeCode(s:unknown){return typeof s==="string"&&/^[a-zA-Z0-9_.-]{1,100}$/.test(s)?s:"provider_request_failed";}
async function provider(path:string,token:string,body?:unknown){
 const r=await fetch(api+path,{method:body===undefined?"GET":"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:body===undefined?undefined:JSON.stringify(body),redirect:"error",signal:AbortSignal.timeout(15000)});
 const v=await r.json();
 if(!r.ok||v.error?.code!=="ok")return fail(safeCode(v.error?.code),r.status===429?429:422);
 return v.data;
}
async function oauth(mode:Mode,params:Record<string,string>){
 const c=config(mode);
 const r=await fetch(api+"oauth/token/",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_key:c.key,client_secret:c.secret,...params}),redirect:"error",signal:AbortSignal.timeout(15000)});
 const v=await r.json();
 if(!r.ok||typeof v.access_token!=="string"||typeof v.refresh_token!=="string"||typeof v.open_id!=="string"||!(Number(v.expires_in)>0)||!(Number(v.refresh_expires_in)>0))return fail(safeCode(v.error),422);
 return v;
}
const grantScope=(v:any)=>String(v.scope||"").split(",").filter((x:string)=>/^[a-z_.]+$/.test(x));
const until=(n:number)=>new Date(Date.now()+n*1000).toISOString();
async function fields(v:any,id:string,mode:Mode){
 return {open_id:v.open_id,scopes:grantScope(v),access_cipher:await seal(v.access_token,id,mode,"access"),refresh_cipher:await seal(v.refresh_token,id,mode,"refresh"),access_until:until(Number(v.expires_in)),refresh_until:until(Number(v.refresh_expires_in))};
}
const accountRef=(g:any,id:string,mode:Mode)=>hash(id+"|"+mode+"|"+g.open_id+"|"+g.connected_at);
const grantQuery=(id:string,mode:Mode)=>db.from("nbl_tiktok_grants").select("*").eq("member_id",id).eq("environment",mode);
async function grant(id:string,mode:Mode){
 const r=await grantQuery(id,mode).maybeSingle();if(r.error)fail("connection_store_unavailable",503);return r.data;
}
async function access(id:string,mode:Mode,scope?:string){
 let g=await grant(id,mode);if(!g) return fail("connect_tiktok_first",409);
 if(scope&&!g.scopes.includes(scope))return fail("scope_not_authorized",403);
 if(Date.parse(g.access_until)>Date.now()+60000)return {g,token:await unseal(g.access_cipher,id,mode,"access")};
 if(Date.parse(g.refresh_until)<=Date.now())return fail("reconnect_tiktok",409);
 // Database lease protects rotating refresh tokens from concurrent requests.
 const lease=until(45);
 const lock=await db.from("nbl_tiktok_grants").update({refresh_lock:lease}).eq("member_id",id).eq("environment",mode).eq("access_cipher",g.access_cipher).or("refresh_lock.is.null,refresh_lock.lt."+new Date().toISOString()).select("member_id").maybeSingle();
 if(lock.error||!lock.data)return fail("refresh_in_progress",409);
 try{
  const v=await oauth(mode,{grant_type:"refresh_token",refresh_token:await unseal(g.refresh_cipher,id,mode,"refresh")});
  if(v.open_id!==g.open_id)return fail("provider_identity_mismatch",409);
  const next=await fields(v,id,mode);
  const saved=await db.from("nbl_tiktok_grants").update({...next,refresh_lock:null}).eq("member_id",id).eq("environment",mode).eq("refresh_lock",lease).eq("access_cipher",g.access_cipher).select("*").maybeSingle();
  if(saved.error||!saved.data)return fail("reconnect_tiktok",409);
  g=saved.data;if(scope&&!g.scopes.includes(scope))return fail("scope_not_authorized",403);
  return {g,token:v.access_token};
 }finally{await db.from("nbl_tiktok_grants").update({refresh_lock:null}).eq("member_id",id).eq("environment",mode).eq("refresh_lock",lease);}
}
async function revoke(id:string,mode:Mode){
 const g=await grant(id,mode);if(!g)return;
 let a;try{a=await access(id,mode);}catch(e){if(!(e instanceof Failure)||e.reason!=="reconnect_tiktok")throw e;}
 const c=config(mode);
 const r=a?await fetch(api+"oauth/revoke/",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_key:c.key,client_secret:c.secret,token:a.token}),redirect:"error",signal:AbortSignal.timeout(15000)}):null;
 if(r&&!r.ok)fail("revoke_not_confirmed",422);
 const d=await db.from("nbl_tiktok_grants").delete().eq("member_id",id).eq("environment",mode).eq("open_id",g.open_id).eq("connected_at",g.connected_at);
 if(d.error)fail("connection_store_unavailable",503);
 await db.from("nbl_tiktok_posts").delete().eq("member_id",id).eq("environment",mode).eq("open_id",g.open_id);
 await db.from("nbl_tiktok_states").delete().eq("member_id",id).eq("environment",mode);
}
async function webhook(req:Request){
 const raw=await req.text();if(raw.length>65536)return json(req,{ok:false},413);
 const sig=Object.fromEntries((req.headers.get("TikTok-Signature")||"").split(",").map(v=>v.trim().split("=")));
 if(!/^\d{10}$/.test(sig.t||"")||! /^[0-9a-f]{64}$/i.test(sig.s||"")||Math.abs(Date.now()/1000-Number(sig.t))>300)return json(req,{ok:false},401);
 let body:any;try{body=JSON.parse(raw);}catch{return json(req,{ok:false},400);}
 const mode=modes.find(m=>config(m).key&&config(m).secret&&config(m).key===body.client_key);if(!mode)return json(req,{ok:false},401);
 const key=await crypto.subtle.importKey("raw",enc.encode(config(mode).secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const bytes=Uint8Array.from(sig.s.match(/../g)!,v=>parseInt(v,16));
 if(!await crypto.subtle.verify("HMAC",key,bytes,enc.encode(sig.t+"."+raw)))return json(req,{ok:false},401);
 if(body.event==="authorization.removed"&&typeof body.user_openid==="string"&&Number.isFinite(body.create_time)){
  const d=await db.from("nbl_tiktok_grants").delete().eq("environment",mode).eq("open_id",body.user_openid).lte("connected_at",new Date(body.create_time*1000).toISOString());
  if(d.error)return json(req,{ok:false},503);
 }
 // Posting status is checked against the owner's grant through the authenticated status endpoint.
 return json(req,{ok:true});
}
Deno.serve(async req=>{
 const path=new URL(req.url).pathname.split("/").pop();
 if(req.method==="OPTIONS")return json(req,{ok:true});
 try{
  if(path==="health"&&req.method==="GET"){const checks=await Promise.all(["nbl_tiktok_grants","nbl_tiktok_states","nbl_tiktok_posts"].map(t=>db.from(t).select("member_id",{head:true,count:"exact"}).limit(0)));const ok=checks.every(x=>!x.error);return json(req,{ok},ok?200:503);}
  if(path==="webhook"&&req.method==="POST")return await webhook(req);
  if(req.method!=="POST")return json(req,{ok:false},405);
  if(!origins.has(req.headers.get("origin")||""))return fail("origin_not_allowed",403);
  const id=await member(req);
  const multipart=req.headers.get("content-type")?.startsWith("multipart/form-data");
  const len=Number(req.headers.get("content-length")||0);if(len>maxBytes+65536)fail("file_too_large",413);
  const form=multipart?await req.formData():null;
  const body=form?Object.fromEntries(form):await req.json();
  const action=String(body.action||"");
  if(action==="configuration")return json(req,{ok:true,sandbox:enabled("sandbox"),production:enabled("production")});
  const mode=body.mode as Mode;if(!modes.includes(mode)||!enabled(mode))return fail("environment_not_configured",503);
  if(action==="begin"){
   const state=stateValue();
   // Remove expired states only; no external account or content change.
   await db.from("nbl_tiktok_states").delete().lt("expires_at",new Date().toISOString());
   const r=await db.from("nbl_tiktok_states").insert({state_hash:await hash(state),member_id:id,environment:mode,expires_at:until(600)});
   if(r.error)fail("oauth_state_unavailable",503);
   const scopes=["user.info.basic","video.upload","video.publish"];
   if(body.display===true)scopes.push("video.list");
   const url=new URL("https://www.tiktok.com/v2/auth/authorize/");
   url.search=new URLSearchParams({client_key:config(mode).key,scope:scopes.join(","),response_type:"code",redirect_uri:callback,state}).toString();
   return json(req,{ok:true,url:url.href});
  }
  if(action==="callback"){
   if(!/^[A-Za-z0-9_-]{43}$/.test(body.state||"")||typeof body.code!=="string"||body.code.length>2500||!body.code)fail("invalid_callback");
   const r=await db.from("nbl_tiktok_states").update({consumed_at:new Date().toISOString()}).eq("state_hash",await hash(body.state)).eq("member_id",id).eq("environment",mode).is("consumed_at",null).gt("expires_at",new Date().toISOString()).select("member_id").maybeSingle();
   if(r.error||!r.data)fail("oauth_state_expired",409);
   const v=await oauth(mode,{grant_type:"authorization_code",code:body.code,redirect_uri:callback});
   if(!grantScope(v).includes("user.info.basic"))fail("scope_not_authorized",403);
   const profile=await provider("user/info/?fields=open_id,display_name",v.access_token);
   if(profile.user?.open_id!==v.open_id)fail("provider_identity_mismatch",409);
   const r2=await db.from("nbl_tiktok_grants").upsert({member_id:id,environment:mode,label:String(profile.user.display_name||"TikTok account").slice(0,200),...await fields(v,id,mode),connected_at:new Date().toISOString(),refresh_lock:null});
   if(r2.error)fail("connection_store_unavailable",503);
   return json(req,{ok:true});
  }
  if(action==="connection"){
   const g=await grant(id,mode);return json(req,{ok:true,connected:!!g,label:g?.label||"",account_ref:g?await accountRef(g,id,mode):null,scopes:g?.scopes||[]});
  }
  if(action==="disconnect"){await revoke(id,mode);return json(req,{ok:true});}
  if(action==="creator"){
   const a=await access(id,mode,"video.publish");
   const data=await provider("post/publish/creator_info/query/",a.token,{});
   return json(req,{ok:true,creator:data});
  }
  if(action==="videos"){
   const a=await access(id,mode,"video.list");
   const data=await provider("video/list/?fields=id,title,share_url,duration,view_count,like_count",a.token,{max_count:20});
   return json(req,{ok:true,videos:data.videos||[]});
  }
  if(action==="status"){
   const g=await grant(id,mode);if(!g)fail("connect_tiktok_first",409);
   const r=await db.from("nbl_tiktok_posts").select("publish_id").eq("member_id",id).eq("environment",mode).eq("open_id",g.open_id).eq("publish_id",String(body.publish_id||"")).maybeSingle();
   if(r.error||!r.data)fail("post_not_found",404);
   const a=await access(id,mode);const data=await provider("post/publish/status/fetch/",a.token,{publish_id:r.data.publish_id});
   return json(req,{ok:true,status:safeCode(data.status),reason:data.fail_reason?safeCode(data.fail_reason):null});
  }
  if(action==="upload"){
   if(body.consent!=="yes"||!(body.file instanceof File)||!body.file.size||body.file.size>maxBytes||!["video/mp4","video/quicktime","video/webm"].includes(body.file.type))fail("select_supported_video_and_consent");
   const file=body.file as File,direct=body.kind==="direct";
   if(!direct&&body.kind!=="draft")fail("invalid_post_type");
   const a=await access(id,mode,direct?"video.publish":"video.upload");
   if(body.account!==await accountRef(a.g,id,mode))fail("account_changed",409);
   const payload:any={source_info:{source:"FILE_UPLOAD",video_size:file.size,chunk_size:file.size,total_chunk_count:1}};
   if(direct){
    const c=await provider("post/publish/creator_info/query/",a.token,{});
    const privacy=String(body.privacy||"");
    if(!Array.isArray(c.privacy_level_options)||!c.privacy_level_options.includes(privacy))fail("privacy_not_available");
    // Private test posts only before audit (must be deliberately selected).
    if(mode==="sandbox"&&privacy!=="SELF_ONLY")fail("sandbox_private_only");
    const duration=Number(body.duration);
    if(!Number.isFinite(duration)||duration<=0||duration>Number(c.max_video_post_duration_sec)||!Number.isFinite(Number(c.max_video_post_duration_sec)))fail("video_duration_not_allowed");
    const commercial=body.commercial==="yes",own=commercial&&body.own_brand==="yes",paid=commercial&&body.paid_brand==="yes";
    if(commercial&&!own&&!paid||paid&&privacy==="SELF_ONLY")fail("commercial_disclosure_required");
    if(paid&&body.branded_consent!=="yes")fail("commercial_consent_required");
    payload.post_info={title:String(body.title||"").slice(0,2200),privacy_level:privacy,disable_comment:c.comment_disabled===true||body.comment!=="yes",disable_duet:c.duet_disabled===true||body.duet!=="yes",disable_stitch:c.stitch_disabled===true||body.stitch!=="yes",brand_organic_toggle:own,brand_content_toggle:paid};
   }
   const data=await provider(direct?"post/publish/video/init/":"post/publish/inbox/video/init/",a.token,payload);
   const u=new URL(data.upload_url);
   if(u.origin!=="https://open-upload.tiktokapis.com"||u.username||u.password||typeof data.publish_id!=="string"||data.publish_id.length>128)fail("invalid_upload_target",502);
   // Record ownership before uploading bytes, so the client can check status without arbitrary provider IDs.
   const rec=await db.from("nbl_tiktok_posts").insert({member_id:id,environment:mode,open_id:a.g.open_id,publish_id:data.publish_id});
   if(rec.error)fail("post_tracking_unavailable",503);
   const uploaded=await fetch(u.href,{method:"PUT",headers:{"content-type":file.type,"content-length":String(file.size),"content-range":"bytes 0-"+(file.size-1)+"/"+file.size},body:file,redirect:"error",signal:AbortSignal.timeout(80000)});
   if(uploaded.status!==201)return json(req,{ok:false,reason:"upload_not_confirmed",publish_id:data.publish_id},502);
   return json(req,{ok:true,publish_id:data.publish_id});
  }
  return fail("unknown_action",404);
 }catch(e){return e instanceof Failure?json(req,{ok:false,reason:e.reason},e.status):json(req,{ok:false,reason:"tiktok_request_unavailable"},503);}
});
