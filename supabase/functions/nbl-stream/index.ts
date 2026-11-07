// NBL Stream bridge: Clerk is the sole identity authority; Stream secret never reaches clients.
// Existing NBL Social DMs, moderation, University rooms, wallets and Messenger stay intact.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createRemoteJWKSet,jwtVerify,SignJWT} from "npm:jose@5.9.6";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";

const STREAM_KEY=(Deno.env.get("STREAM_API_KEY")||"").trim();
const STREAM_SECRET=(Deno.env.get("STREAM_API_SECRET")||"").trim();
const BASE=(Deno.env.get("SUPABASE_URL")||"").replace(/\/+$/,"");
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const ISSUER="https://clerk.newbeansland.org";
const JWKS=createRemoteJWKSet(new URL(ISSUER+"/.well-known/jwks.json"));
const db=createClient(BASE,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});
const ALLOWED=new Set(["https://newbeansland.org","https://www.newbeansland.org","https://foundernbl.github.io"]);
let lastHealth:{at:number;healthy:boolean;code:string}|null=null;
let lastPulseModeration:{at:number;ready:boolean;code:string}|null=null;

function cors(req:Request){
  const origin=(req.headers.get("origin")||"").replace(/\/$/,"");
  const h:Record<string,string>={
    "content-type":"application/json; charset=utf-8","cache-control":"no-store","vary":"origin",
    "access-control-allow-methods":"GET, POST, OPTIONS",
    "access-control-allow-headers":"authorization,content-type,apikey,x-client-info"
  };
  if(ALLOWED.has(origin))h["access-control-allow-origin"]=origin;
  return h;
}
function json(req:Request,value:unknown,status=200){
  return new Response(JSON.stringify(value),{status,headers:cors(req)});
}
function goodOrigin(req:Request){
  const origin=(req.headers.get("origin")||"").replace(/\/$/,"");
  return !origin||ALLOWED.has(origin);
}
function bearer(req:Request){
  const value=req.headers.get("authorization")||"";
  return value.toLowerCase().startsWith("bearer ")?value.slice(7).trim():"";
}
async function verifiedActor(req:Request){
  const token=bearer(req);
  if(!token)return null;
  try{
    const result=await jwtVerify(token,JWKS,{issuer:ISSUER});
    return typeof result.payload.sub==="string"&&/^user_[a-z0-9_-]+$/i.test(result.payload.sub)
      ?result.payload.sub:null;
  }catch{return null;}
}
function configReady(){
  // Stream app keys are public identifiers; the API secret is never returned.
  return STREAM_KEY.length>4 && STREAM_SECRET.length>=12;
}
async function signedToken(payload:Record<string,unknown>,ttl:number){
  return new SignJWT(payload).setProtectedHeader({alg:"HS256",typ:"JWT"})
    .setIssuedAt().setExpirationTime(Math.floor(Date.now()/1000)+ttl)
    .sign(new TextEncoder().encode(STREAM_SECRET));
}
// Validates BOTH the installed key and secret against the real Stream application.
// Read-only /app request. 60-second isolate cache guards incidental repeated probes.
async function streamHealth(){
  if(!configReady())return {healthy:false,code:!STREAM_KEY?"CONFIG_MISSING_KEY":!STREAM_SECRET?"CONFIG_MISSING_SECRET":STREAM_KEY.length<=4?"CONFIG_INVALID_KEY_LENGTH":"CONFIG_INVALID_SECRET_LENGTH"};
  if(lastHealth && Date.now()-lastHealth.at<60000)return lastHealth;
  const auth=await signedToken({server:true},60);
  let healthy=false,code="STREAM_UNAVAILABLE";
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),6500);
    try{
      const response=await fetch("https://chat.stream-io-api.com/api/v2/app?api_key="+encodeURIComponent(STREAM_KEY),{
        headers:{"authorization":auth,"stream-auth-type":"jwt","accept":"application/json"},
        signal:controller.signal
      });
      healthy=response.ok;
      code=healthy?"CONNECTED":response.status===401||response.status===403?"STREAM_CREDENTIALS_REJECTED":
        response.status===404?"STREAM_APP_NOT_FOUND":"STREAM_HTTP_"+response.status;
    }finally{clearTimeout(timeout);}
  }catch{code="STREAM_UNAVAILABLE";}
  lastHealth={at:Date.now(),healthy,code};
  return lastHealth;
}
// Pulse activities are added to 'user' feeds. The provider group policy
// is an enforceable default for ALL members, not a client-side voluntary hint.
// Never mint public Feeds tokens when the text moderation policy is absent.
async function pulseModerationHealth(){
  if(!configReady())return {ready:false,code:"STREAM_CREDENTIALS_UNAVAILABLE"};
  if(lastPulseModeration && Date.now()-lastPulseModeration.at<45000)return lastPulseModeration;
  let ready=false,code="PULSE_MODERATION_UNAVAILABLE";
  try{
    const auth=await signedToken({server:true},60);
    const response=await fetch(
      "https://chat.stream-io-api.com/api/v2/moderation/config/feeds%3Auser?api_key="+encodeURIComponent(STREAM_KEY),
      {headers:{authorization:auth,"stream-auth-type":"jwt",accept:"application/json"},signal:AbortSignal.timeout(6500)}
    );
    if(response.ok){
      const payload=await response.json().catch(()=>({}));
      const config=payload?.config;
      ready=config?.key==="feeds:user"&&config?.ai_text_config?.enabled===true
        &&Array.isArray(config?.ai_text_config?.rules)&&config.ai_text_config.rules.length>=8;
      code=ready?"MODERATION_CONNECTED":"PULSE_POLICY_NOT_READY";
    }else code=response.status===404?"PULSE_POLICY_NOT_INSTALLED":"MODERATION_HTTP_"+response.status;
  }catch{code="PULSE_MODERATION_UNAVAILABLE";}
  lastPulseModeration={at:Date.now(),ready,code};
  return lastPulseModeration;
}
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  if(!goodOrigin(req))return json(req,{ok:false,reason:"origin_not_allowed"},403);
  const url=new URL(req.url);
  if(req.method==="GET" && url.searchParams.get("action")==="health"){
    const h=await streamHealth();
    return json(req,{ok:h.healthy,provider:"Stream",connected:h.healthy,code:h.code},h.healthy?200:503);
  }
  if(req.method==="GET" && url.searchParams.get("action")==="pulse-readiness"){
    const [stream,moderation]=await Promise.all([streamHealth(),pulseModerationHealth()]);
    return json(req,{ok:stream.healthy&&moderation.ready,connected:stream.healthy,
      moderation_ready:moderation.ready,code:!stream.healthy?stream.code:moderation.code},
      stream.healthy&&moderation.ready?200:503);
  }
  if(req.method!=="POST")return json(req,{ok:false,reason:"method_not_allowed"},405);
  const actor=await verifiedActor(req);
  if(!actor)return json(req,{ok:false,reason:"sign_in_required"},401);
  const body=await req.json().catch(()=>({}));
  if(body?.action!=="session")return json(req,{ok:false,reason:"unsupported_action"},400);
  const h=await streamHealth();
  if(!h.healthy)return json(req,{ok:false,reason:h.code},503);
  const moderation=await pulseModerationHealth();
  if(!moderation.ready)return json(req,{ok:false,reason:moderation.code},503);
  const [profile,role]=await Promise.all([
    db.from("nbl_account_profiles").select("username").eq("clerk_user_id",actor).maybeSingle(),
    db.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",actor).maybeSingle()
  ]);
  if(profile.error||role.error)return json(req,{ok:false,reason:"identity_unavailable"},503);
  const founder=String(role.data?.role||"").toLowerCase()==="founder";
  const name=founder?"NBLFounderOfficial":String(profile.data?.username||"NBL member")
    .replace(/[^a-zA-Z0-9_-]/g,"").slice(0,30)||"NBL member";
  const token=await signedToken({user_id:actor},3600);
  return json(req,{ok:true,provider:"Stream",key:STREAM_KEY,user:{id:actor,name},
    token,expiresIn:3600,officialFounder:founder});
});
