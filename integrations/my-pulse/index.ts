import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "npm:jose@5.9.6";
import { validateDraft, fingerprint } from "./bridge-policy.mjs";

// Independent, OFF by default. Not connected to ChatGPT until a Founder-approved
// connector is registered. No Meta publishing path is enabled here.
const env=(key:string)=>(Deno.env.get(key)||"").trim();
const ISSUER="https://clerk.newbeansland.org";
const JWKS=createRemoteJWKSet(new URL(ISSUER+"/.well-known/jwks.json"));
const BRIDGE_KEY=env("MY_PULSE_BRIDGE_KEY");
const APPROVAL_KEY=env("MY_PULSE_APPROVAL_KEY");
const PUBLISH_ENABLED=env("MY_PULSE_PUBLISH_ENABLED")==="true";
const STREAM_KEY=env("STREAM_API_KEY");
const STREAM_SECRET=env("STREAM_API_SECRET");
const db=createClient(env("SUPABASE_URL"),env("SUPABASE_SERVICE_ROLE_KEY"),{
  auth:{persistSession:false,autoRefreshToken:false}
});
function output(body:unknown,status=200){
  return new Response(JSON.stringify(body),{status,headers:{
    "content-type":"application/json; charset=utf-8","cache-control":"no-store",
    "x-content-type-options":"nosniff"
  }});
}
function denied(){return output({ok:false,error:"unauthorized"},401);}
function bearer(req:Request){
  const match=/^Bearer (.+)$/i.exec(req.headers.get("authorization")||"");
  return match?.[1]?.trim()||"";
}
function secretEquals(a:string,b:string){
  if(!a||!b||a.length!==b.length)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
function connector(req:Request){return BRIDGE_KEY.length>=32&&secretEquals(bearer(req),BRIDGE_KEY);}
async function founder(req:Request){
  const token=bearer(req);
  if(!token)return null;
  try{
    const {payload}=await jwtVerify(token,JWKS,{issuer:ISSUER});
    const userId=String(payload.sub||"");
    if(!/^user_[A-Za-z0-9_-]+$/.test(userId))return null;
    const {data,error}=await db.from("nbl_chat_usage_accounts")
      .select("role").eq("clerk_user_id",userId).maybeSingle();
    if(error||data?.role!=="founder")return null;
    return userId;
  }catch{return null;}
}
async function parse(req:Request){
  if(Number(req.headers.get("content-length")||0)>24000)throw Error("request_too_large");
  const raw=await req.text();
  if(raw.length>24000)throw Error("request_too_large");
  return JSON.parse(raw);
}
async function authorize(draft:ReturnType<typeof validateDraft>, founderId:string){
  const hash=await fingerprint(draft);
  // Approval lasts five minutes and binds ONE exact media/caption/account set.
  const approval=await new SignJWT({hash,founderId,channels:draft.channels})
    .setProtectedHeader({alg:"HS256",typ:"JWT"})
    .setIssuer("nbl-my-pulse").setAudience("nbl-my-pulse-publish")
    .setIssuedAt().setExpirationTime("5m")
    .sign(new TextEncoder().encode(APPROVAL_KEY));
  return {approval,hash,expiresInSeconds:300};
}
async function verifyApproval(token:string,draft:ReturnType<typeof validateDraft>){
  const {payload}=await jwtVerify(token,new TextEncoder().encode(APPROVAL_KEY),{
    issuer:"nbl-my-pulse",audience:"nbl-my-pulse-publish"
  });
  const hash=await fingerprint(draft);
  if(payload.hash!==hash||typeof payload.founderId!=="string")throw Error("approval_mismatch");
  return {hash,founderId:payload.founderId};
}
async function postPulse(draft:ReturnType<typeof validateDraft>,founderId:string,hash:string){
  if(!STREAM_KEY||!STREAM_SECRET)throw Error("stream_not_configured");
  const token=await new SignJWT({server:true})
    .setProtectedHeader({alg:"HS256",typ:"JWT"})
    .setIssuedAt().setExpirationTime("1m")
    .sign(new TextEncoder().encode(STREAM_SECRET));
  const activityId="my-pulse-"+hash.slice(0,48);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(
      "https://feeds.stream-io-api.com/api/v2/feeds/activities?api_key="+encodeURIComponent(STREAM_KEY),
      {method:"POST",signal:controller.signal,
       headers:{"authorization":"Bearer "+token,"stream-auth-type":"jwt","content-type":"application/json"},
       body:JSON.stringify({
         id:activityId,feeds:["user:"+founderId],user_id:founderId,
         type:"post",text:draft.caption,visibility:"public",force_moderation:true,
         attachments:draft.media.map(image_url=>({type:"image",image_url,custom:{}}))
       })}
    );
    const responseBody=await response.json().catch(()=>({}));
    if(!response.ok)return {ok:false,status:response.status,error:"pulse_provider_rejected"};
    return {ok:true,channel:"pulse",activityId:String(responseBody.activity?.id||activityId),
      moderation:responseBody.activity?.moderation?.action||"not_reported",
      publishedAt:new Date().toISOString()};
  }finally{clearTimeout(timeout);}
}
Deno.serve(async(req:Request)=>{
  if(req.method!=="POST")return output({ok:false,error:"method_not_allowed"},405);
  try{
    const body=await parse(req);
    const action=body.action;
    if(action==="status"){
      if(!connector(req))return denied();
      return output({ok:true,bridge:"my-pulse",available:true,
        channels:{pulse:PUBLISH_ENABLED&&!!STREAM_KEY&&!!STREAM_SECRET,
          facebook_page:false,instagram:false},
        connectedToChatGPT:false});
    }
    const draft=validateDraft(body.draft);
    if(action==="prepare"){
      if(!connector(req))return denied();
      return output({ok:true,state:"DRAFT_NOT_POSTED",hash:await fingerprint(draft),draft});
    }
    if(action==="approve"){
      if(!APPROVAL_KEY||APPROVAL_KEY.length<32)return output({ok:false,error:"approval_unconfigured"},503);
      const userId=await founder(req);
      if(!userId)return denied();
      // Authorization never means publishing. It is scoped to this exact draft.
      if(draft.channels.some(c=>c!=="pulse")||draft.accounts.pulse!==userId)
        return output({ok:false,error:"unsupported_account_or_channel"},409);
      return output({ok:true,...await authorize(draft,userId)});
    }
    if(action==="publish"){
      if(!connector(req))return denied();
      if(!PUBLISH_ENABLED)return output({ok:false,error:"publishing_disabled"},409);
      if(!APPROVAL_KEY||APPROVAL_KEY.length<32)return output({ok:false,error:"approval_unconfigured"},503);
      if(draft.channels.length!==1||draft.channels[0]!=="pulse")
        return output({ok:false,error:"channel_not_connected"},409);
      const verified=await verifyApproval(String(body.approval||""),draft);
      if(draft.accounts.pulse!==verified.founderId)return denied();
      return output(await postPulse(draft,verified.founderId,verified.hash));
    }
    return output({ok:false,error:"unknown_action"},400);
  }catch(e){
    const name=e instanceof Error?e.message:"bad_request";
    const invalid=/^(invalid_|untrusted_|approval_mismatch|request_too_large)/.test(name);
    return output({ok:false,error:invalid?name:"request_rejected"},invalid?400:401);
  }
});
