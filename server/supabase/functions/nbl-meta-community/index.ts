// NBL Pulse — Founder-only Meta Page posting + Instagram comment tools.
// Isolated from the existing /nbl-instagram-connect publishing and /nbl-live services.
// No Meta token or Page credential ever leaves this service.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
import {createRemoteJWKSet,jwtVerify} from "npm:jose@5.9.6";

const API="v27.0",GRAPH="https://graph.facebook.com/"+API+"/";
const BASE=(Deno.env.get("SUPABASE_URL")||"").replace(/\/+$/,"");
const DB=createClient(BASE,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",{auth:{persistSession:false,autoRefreshToken:false}});
// Meta app ID is public; use the verified Pulse Live app ID when the optional env setting is missing.
const PULSE_APP_ID="1167499339147411";
const APP_ID=(Deno.env.get("NBL_PULSE_META_APP_ID")||PULSE_APP_ID).trim();
const APP_SECRET=(Deno.env.get("NBL_PULSE_META_APP_SECRET")||"").trim();
const AES_KEY=(Deno.env.get("NBL_CONNECT_TOKEN_AES_KEY")||"").trim();
const IG_TOKEN=(Deno.env.get("NBL_PULSE_INSTAGRAM_ACCESS_TOKEN")||"").trim();
const ISSUER="https://clerk.newbeansland.org";
const JWKS=createRemoteJWKSet(new URL(ISSUER+"/.well-known/jwks.json"));
const ALLOWED=new Set(["https://newbeansland.org","https://www.newbeansland.org"]);
const CALLBACK=BASE+"/functions/v1/nbl-meta-community/facebook/callback";
const text=new TextEncoder();
const numberId=x=>typeof x==="string"&&/^\d{6,30}$/.test(x);
const b64=bytes=>btoa(String.fromCharCode(...bytes));
function json(req,data,status=200){
 const o=req.headers.get("origin")||"";
 const h={"content-type":"application/json; charset=utf-8","cache-control":"no-store","vary":"Origin",
   "access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"authorization,content-type"};
 if(ALLOWED.has(o))h["access-control-allow-origin"]=o;
 return new Response(JSON.stringify(data),{status,headers:h});
}
function finish(status){return Response.redirect("https://newbeansland.org/pulse/?facebook_connect="+encodeURIComponent(status),303);}
async function founder(req){
 const value=req.headers.get("authorization")||"";
 if(!/^Bearer\s+/.test(value))return null;
 try{
  const jwt=value.replace(/^Bearer\s+/,"").trim();
  const {payload}=await jwtVerify(jwt,JWKS,{issuer:ISSUER});
  const id=typeof payload.sub==="string"?payload.sub:"";
  if(!id)return null;
  const row=await DB.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",id).maybeSingle();
  return !row.error&&row.data?.role==="founder"?id:null;
 }catch{return null;}
}
async function key(){
 if(AES_KEY){
  const raw=Uint8Array.from(atob(AES_KEY),ch=>ch.charCodeAt(0));
  if(raw.length!==32)throw Error("encryption_not_configured");
  return crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
 }
 // Derive a purpose-scoped encryption key from the already-configured Meta app
 // secret when a separate NBL_CONNECT_TOKEN_AES_KEY has not yet been provisioned.
 // No token or encryption key is exposed to the browser or persisted in source.
 if(APP_SECRET.length<16)throw Error("encryption_not_configured");
 const master=await crypto.subtle.importKey("raw",text.encode(APP_SECRET),"HKDF",false,["deriveKey"]);
 return crypto.subtle.deriveKey({
  name:"HKDF",hash:"SHA-256",salt:text.encode("NBL-Pulse-"+APP_ID),
  info:text.encode("facebook-page-access-token-AES-GCM-v1")
 },master,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function seal(token){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const bytes=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(),text.encode(token)));
 return {token_ciphertext:b64(bytes),token_nonce:b64(iv)};
}
async function open(row){
 const iv=Uint8Array.from(atob(row.token_nonce),c=>c.charCodeAt(0));
 const bytes=Uint8Array.from(atob(row.token_ciphertext),c=>c.charCodeAt(0));
 return new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv},await key(),bytes));
}
async function graph(method,path,token,params={}){
 const url=new URL(GRAPH+path);
 const data=new URLSearchParams(params);
 if(method==="GET")for(const [k,v] of data)url.searchParams.set(k,v);
 let res;
 try{
  res=await fetch(url,{method,headers:{"authorization":"Bearer "+token,"accept":"application/json",
    ...(method==="POST"?{"content-type":"application/x-www-form-urlencoded"}:{})},
    ...(method==="POST"?{body:data.toString()}:{}),signal:AbortSignal.timeout(12000)});
  const body=await res.json().catch(()=>null);
  return {ok:res.ok&&!body?.error,body,status:res.status};
 }catch{return {ok:false,body:null,status:502};}
}

async function instagramReviewDiagnostics(){
 if(!IG_TOKEN)return {status:"instagram_token_missing",matches_pulse_app:null};
 if(APP_ID!==PULSE_APP_ID||APP_SECRET.length<16)
  return {status:"pulse_app_credentials_missing",matches_pulse_app:null};
 const url=new URL(GRAPH+"debug_token");
 url.searchParams.set("input_token",IG_TOKEN);
 try{
  // The official debugger first tries the Pulse app's app token. If the
  // Instagram token came from a different Meta app, Meta may reject that check;
  // try the provided token as a self-debug credential without revealing it.
  let data=null;
  for(const bearer of [APP_ID+"|"+APP_SECRET,IG_TOKEN]){
   const r=await fetch(url,{
    method:"GET",headers:{"authorization":"Bearer "+bearer,"accept":"application/json"},
    redirect:"error",signal:AbortSignal.timeout(9000)
   });
   const body=await r.json().catch(()=>null);
   if(r.ok&&!body?.error&&body?.data){data=body.data;break;}
  }
  if(!data)return {status:"token_debug_unavailable",matches_pulse_app:null};
  const scopes=Array.isArray(data.scopes)?data.scopes.filter(x=>typeof x==="string"):[];
  // Meta exposes different scope names for the Instagram Business login and
  // legacy Facebook-login flows. A missing legacy string is NOT proof that an
  // authorized Meta system-user token lacks working media/comment access.
  const recognized=[
   "instagram_basic","instagram_content_publish","instagram_manage_comments",
   "instagram_business_basic","instagram_business_content_publish",
   "instagram_business_content_publishing","instagram_business_manage_comments"
  ];
  return {
   status:data.is_valid===true?"verified":"token_invalid",
   matches_pulse_app:String(data.app_id||"")===PULSE_APP_ID,
   token_app_id:/^\d{6,24}$/.test(String(data.app_id||""))?String(data.app_id):null,
   token_type:["USER","PAGE","APP","SYSTEM_USER"].includes(String(data.type||""))?data.type:"unknown",
   permissions_reported:recognized.filter(p=>scopes.includes(p)),
   // No missing_scopes: the debugger may not list Page tasks or equivalent
   // permissions for system-user credentials. Only Meta's review UI can
   // confirm whether required API calls have been credited.
   scopes_list_available:Array.isArray(data.scopes)
  };
 }catch{return {status:"token_debug_unavailable",matches_pulse_app:null};}
}

async function instagramId(){
 if(!IG_TOKEN)return null;
 const r=await graph("GET","me/assigned_instagram_accounts",IG_TOKEN,{fields:"id,username",limit:"100"});
 if(!r.ok||!Array.isArray(r.body?.data))return null;
 const matches=r.body.data.filter(p=>p.username==="nbl_world"&&numberId(p.id));
 return matches.length===1?String(matches[0].id):null;
}
async function facebookPage(user){
 const r=await DB.from("nbl_connected_accounts")
  .select("external_account_id,external_label,token_ciphertext,token_nonce,token_expires_at")
  .eq("clerk_user_id",user).eq("provider","facebook").maybeSingle();
 if(r.error||!r.data||!numberId(r.data.external_account_id))return null;
 if(r.data.token_expires_at&&new Date(r.data.token_expires_at).getTime()<Date.now())return null;
 try{return {id:r.data.external_account_id,name:r.data.external_label,token:await open(r.data)};}
 catch{return null;}
}
function safePagePost(p){
 return {id:String(p.id||"").slice(0,80),message:String(p.message||"").slice(0,1800),
  created_time:String(p.created_time||"").slice(0,60),
  permalink_url:typeof p.permalink_url==="string"&&/^https:\/\/www\.facebook\.com\//.test(p.permalink_url)?p.permalink_url:null};
}
function safeMedia(m){
 return {id:String(m.id||""),caption:String(m.caption||"").slice(0,250),
  permalink:typeof m.permalink==="string"&&/^https:\/\/(?:www\.)?instagram\.com\//.test(m.permalink)?m.permalink:null,
  comments_count:Number(m.comments_count||0),timestamp:String(m.timestamp||"").slice(0,40)};
}
async function ownMedia(id,account){
 const r=await graph("GET",account+"/media",IG_TOKEN,
  {fields:"id,caption,permalink,comments_count,timestamp",limit:"50"});
 if(!r.ok||!Array.isArray(r.body?.data))return {ok:false,items:[]};
 const items=r.body.data.filter(m=>numberId(String(m.id||"")));
 return {ok:true,items,idIsMine:id?items.some(m=>String(m.id)===id):undefined};
}
async function beginFacebook(req,user){
 if(APP_ID!==PULSE_APP_ID||APP_SECRET.length<16)
  return json(req,{ok:false,reason:"facebook_oauth_secrets_unavailable"},503);
 const nonce=b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
 const digest=b64(new Uint8Array(await crypto.subtle.digest("SHA-256",text.encode(nonce))));
 const exp=new Date(Date.now()+10*60*1000).toISOString();
 const r=await DB.from("nbl_connect_oauth_states").insert({
  provider:"facebook",clerk_user_id:user,state_hash:digest,expires_at:exp
 });
 if(r.error)return json(req,{ok:false,reason:"facebook_oauth_state_unavailable"},503);
 const u=new URL("https://www.facebook.com/"+API+"/dialog/oauth");
 for(const [k,v] of Object.entries({
  client_id:APP_ID,redirect_uri:CALLBACK,state:nonce,response_type:"code",
  scope:"pages_show_list,pages_read_engagement,pages_manage_posts"
 }))u.searchParams.set(k,v);
 return json(req,{ok:true,authorization_url:u.toString()});
}
async function facebookCallback(req){
 if(APP_ID!==PULSE_APP_ID||APP_SECRET.length<16)return finish("not_configured");
 const q=new URL(req.url).searchParams,nonce=q.get("state")||"",code=q.get("code")||"";
 if(q.get("error")||!code||code.length>2500||!/^[A-Za-z0-9_-]{40,120}$/.test(nonce))return finish("denied");
 const digest=b64(new Uint8Array(await crypto.subtle.digest("SHA-256",text.encode(nonce))));
 const now=new Date().toISOString();
 const r=await DB.from("nbl_connect_oauth_states").update({consumed_at:now})
  .eq("state_hash",digest).eq("provider","facebook").is("consumed_at",null).gt("expires_at",now)
  .select("clerk_user_id").maybeSingle();
 const user=r.data?.clerk_user_id;
 if(r.error||!user)return finish("expired");
 try{
  const tokenUrl=new URL(GRAPH+"oauth/access_token");
  for(const [k,v] of Object.entries({client_id:APP_ID,client_secret:APP_SECRET,redirect_uri:CALLBACK,code}))
   tokenUrl.searchParams.set(k,v);
  const response=await fetch(tokenUrl,{signal:AbortSignal.timeout(15000)});
  const grant=await response.json().catch(()=>null);
  if(!response.ok||typeof grant?.access_token!=="string")return finish("exchange_failed");
  let userToken=grant.access_token;
  // Prefer a long-lived grant. Page tokens are stored encrypted, not in browser data.
  const long=await fetch(GRAPH+"oauth/access_token?"+new URLSearchParams({
   grant_type:"fb_exchange_token",client_id:APP_ID,client_secret:APP_SECRET,fb_exchange_token:userToken
  }),{signal:AbortSignal.timeout(15000)}).then(r=>r.json()).catch(()=>null);
  if(typeof long?.access_token==="string")userToken=long.access_token;
  const pages=await graph("GET","me/accounts",userToken,{fields:"id,name,access_token,tasks",limit:"100"});
  if(!pages.ok||!Array.isArray(pages.body?.data))return finish("pages_unavailable");
  const owned=pages.body.data.filter(p=>
    numberId(String(p.id||""))&&typeof p.access_token==="string"&&
    /^New Beansland(?:\s*™)?$/i.test(String(p.name||"").trim())&&
    (!Array.isArray(p.tasks)||p.tasks.includes("CREATE_CONTENT")||p.tasks.includes("MANAGE")));
  if(owned.length!==1)return finish("official_page_not_found");
  const page=owned[0],enc=await seal(page.access_token);
  const saved=await DB.from("nbl_connected_accounts").upsert({
   clerk_user_id:user,provider:"facebook",external_account_id:String(page.id),external_label:String(page.name),
   ...enc,token_expires_at:null,permissions:{flow:"facebook_page_login",scope_requested:[
      "pages_show_list","pages_read_engagement","pages_manage_posts"]},
   connected_at:now,updated_at:now
  },{onConflict:"clerk_user_id,provider"});
  if(saved.error)return finish("save_failed");
  return finish("connected");
 }catch{return finish("unavailable");}
}
async function actions(req,user,route){
 const raw=await req.text();
 if(raw.length>4096)return json(req,{ok:false,reason:"request_too_large"},413);
 let body;
 try{body=raw?JSON.parse(raw):{};if(!body||typeof body!=="object"||Array.isArray(body))throw Error();}
 catch{return json(req,{ok:false,reason:"invalid_json"},400);}
 if(route==="/status"){
  const [page,ig]=await Promise.all([facebookPage(user),instagramId()]);
  return json(req,{ok:true,facebook_connected:!!page,facebook_page:page?.name||null,
   instagram_connected:!!ig,facebook_login_ready:/^\d{6,24}$/.test(APP_ID)&&APP_SECRET.length>=16});
 }
 if(route==="/review/diagnostics")return json(req,{ok:true,instagram:await instagramReviewDiagnostics(),facebook_oauth_ready:APP_ID===PULSE_APP_ID&&APP_SECRET.length>=16,facebook_connected:!!(await facebookPage(user))});
 if(route==="/facebook/begin")return beginFacebook(req,user);
 if(route==="/facebook/posts"||route==="/facebook/publish"){
  const page=await facebookPage(user);
  if(!page)return json(req,{ok:false,reason:"facebook_page_not_connected"},409);
  if(route==="/facebook/posts"){
   const r=await graph("GET",page.id+"/posts",page.token,
    {fields:"id,message,created_time,permalink_url",limit:"10"});
   return r.ok&&Array.isArray(r.body?.data)
    ?json(req,{ok:true,page_name:page.name,posts:r.body.data.map(safePagePost)})
    :json(req,{ok:false,reason:"facebook_page_permission_or_token_unavailable"},502);
  }
  const message=body.message,link=body.link;
  if(body.confirm!=="publish"||typeof message!=="string"||!message.trim()||message.length>1500)
   return json(req,{ok:false,reason:"explicit_confirm_and_message_required"},400);
  if(typeof link!=="string"||link.length>400)return json(req,{ok:false,reason:"invalid_pulse_link"},400);
  let target;
  try{
   target=new URL(link);
   if(target.origin!=="https://newbeansland.org"||target.pathname!=="/pulse/"||
     !/^[A-Za-z0-9._:-]{1,160}$/.test(target.searchParams.get("post")||"")||
     target.searchParams.size!==1||target.hash)throw Error();
  }catch{return json(req,{ok:false,reason:"invalid_pulse_link"},400);}
  const r=await graph("POST",page.id+"/feed",page.token,{message:message.trim(),link:target.href});
  if(!r.ok||typeof r.body?.id!=="string")return json(req,{ok:false,reason:"facebook_publish_rejected"},502);
  const posted=await graph("GET",String(r.body.id),page.token,{fields:"permalink_url"});
  const url=typeof posted.body?.permalink_url==="string"&&
   /^https:\/\/(?:www\.)?facebook\.com\//.test(posted.body.permalink_url)
    ?posted.body.permalink_url:null;
  return json(req,{ok:true,published:true,post_id:r.body.id,post_url:url});
 }
 if(route==="/instagram/media"||route==="/instagram/comments"||route==="/instagram/reply"){
  const ig=await instagramId();
  if(!ig)return json(req,{ok:false,reason:"official_instagram_not_accessible"},409);
  if(route==="/instagram/media"){
   const m=await ownMedia(null,ig);
   return m.ok?json(req,{ok:true,account:"@nbl_world",media:m.items.slice(0,12).map(safeMedia)})
    :json(req,{ok:false,reason:"instagram_media_permission_unavailable"},502);
  }
  const mediaId=body.media_id;
  if(!numberId(mediaId))return json(req,{ok:false,reason:"invalid_media_id"},400);
  const owned=await ownMedia(mediaId,ig);
  if(!owned.ok)return json(req,{ok:false,reason:"instagram_media_unavailable"},502);
  if(!owned.idIsMine)return json(req,{ok:false,reason:"not_official_instagram_media"},403);
  const c=await graph("GET",mediaId+"/comments",IG_TOKEN,
   {fields:"id,text,username,timestamp",limit:"50"});
  if(!c.ok||!Array.isArray(c.body?.data))return json(req,{ok:false,reason:"instagram_comments_permission_unavailable"},502);
  const comments=c.body.data.filter(x=>numberId(String(x.id||""))).map(x=>({
   id:String(x.id),text:String(x.text||"").slice(0,1100),username:String(x.username||"").slice(0,80),
   timestamp:String(x.timestamp||"").slice(0,50)
  }));
  if(route==="/instagram/comments")return json(req,{ok:true,comments,media_id:mediaId});
  if(body.confirm!=="reply"||!numberId(body.comment_id)||
    !comments.some(c=>c.id===body.comment_id)||
    typeof body.message!=="string"||body.message.trim().length<1||body.message.length>600)
   return json(req,{ok:false,reason:"invalid_comment_or_reply_confirmation"},400);
  const r=await graph("POST",body.comment_id+"/replies",IG_TOKEN,{message:body.message.trim()});
  return r.ok&&numberId(String(r.body?.id||""))
   ?json(req,{ok:true,replied:true,reply_id:String(r.body.id)})
   :json(req,{ok:false,reason:"instagram_comment_reply_rejected"},502);
 }
 return json(req,{ok:false,reason:"not_found"},404);
}
Deno.serve(async(req)=>{
 const pathname=new URL(req.url).pathname;
 const split=pathname.indexOf("/nbl-meta-community");
 const path=split>=0?pathname.slice(split+"/nbl-meta-community".length)||"/":pathname;
 if(req.method==="OPTIONS")return json(req,{ok:true});
 if(req.method==="GET"&&path==="/facebook/callback")return facebookCallback(req);
 if(req.method==="GET"&&path==="/")return json(req,{ok:true,service:"nbl_meta_community",founder_only:true});
 if(req.method!=="POST")return json(req,{ok:false,reason:"method_not_allowed"},405);
 const origin=req.headers.get("origin")||"";
 if(origin&&!ALLOWED.has(origin))return json(req,{ok:false,reason:"origin_not_allowed"},403);
 const id=await founder(req);
 if(!id)return json(req,{ok:false,reason:"founder_access_required"},403);
 try{return await actions(req,id,path);}catch{return json(req,{ok:false,reason:"service_unavailable"},503);}
});
