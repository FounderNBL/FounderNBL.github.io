// Public crawler preview for a PUBLIC Stream Feed post — no Clerk session required.
// First-party Worker reads JSON; previously shared Supabase URLs redirect to NewBeansland.org.
// Never accept arbitrary image URLs, activity user ID or HTML from browser input.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {SignJWT} from "npm:jose@5.9.6";
import {validPulsePostId,pulseShareMetadata} from "./share.mjs";
const API=(Deno.env.get("STREAM_API_KEY")||"").trim();
const SECRET=(Deno.env.get("STREAM_API_SECRET")||"").trim();
function response(body:string,status=200,extra:Record<string,string>={}){
  return new Response(body,{status,headers:{"content-type":"application/json; charset=utf-8",
    "x-content-type-options":"nosniff","referrer-policy":"no-referrer",
    "cache-control":"public, max-age=30",...extra}});
}
Deno.serve(async req=>{
  if(req.method!=="GET"&&req.method!=="HEAD")return response("Method not allowed",405);
  const url=new URL(req.url);
  const id=url.searchParams.get("post");
  if(!validPulsePostId(id))return response("Post not found",404);
  if(url.searchParams.get("format")!=="json")return new Response(null,{status:302,headers:{
    location:"https://newbeansland.org/pulse/share?post="+encodeURIComponent(id),"cache-control":"no-store"}});
  if(!API||!SECRET)return response("Preview temporarily unavailable",503,{"cache-control":"no-store"});
  let upstream;
  try{
    const token=await new SignJWT({server:true}).setProtectedHeader({alg:"HS256",typ:"JWT"})
      .setIssuedAt().setExpirationTime(Math.floor(Date.now()/1000)+60)
      .sign(new TextEncoder().encode(SECRET));
    upstream=await fetch("https://feeds.stream-io-api.com/api/v2/feeds/activities/"+
      encodeURIComponent(id)+"?api_key="+encodeURIComponent(API),{
      headers:{"authorization":token,"stream-auth-type":"jwt",accept:"application/json"},
      signal:AbortSignal.timeout(7000)
    });
  }catch{return response("Preview temporarily unavailable",503,{"cache-control":"no-store"});}
  if(upstream.status===404)return response("Post not found",404);
  if(!upstream.ok)return response("Preview temporarily unavailable",503,{"cache-control":"no-store"});
  const body=await upstream.json().catch(()=>null);
  const meta=pulseShareMetadata(body?.activity);
  if(!meta||meta.id!==id)return response("Post not found",404,{"cache-control":"no-store"});
  return response(req.method==="HEAD"?"":JSON.stringify(meta),200,{"cache-control":"no-store"});
});
