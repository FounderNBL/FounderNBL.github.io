// Resolve public Threads share URLs to official post permalinks.
// This endpoint never accepts arbitrary fetch hosts, credentials, private content, or HTML from callers.
const cors={
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Methods":"GET, OPTIONS",
 "Access-Control-Allow-Headers":"Content-Type",
 "Content-Type":"application/json; charset=utf-8",
 "Cache-Control":"public, max-age=300"
};
const reply=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:cors});
function postUrl(raw:string):string|null{
 try{
  const u=new URL(raw);
  if(u.protocol!=="https:"||!["www.threads.com","threads.com","www.threads.net","threads.net"].includes(u.hostname.toLowerCase())||u.username||u.password||u.port)return null;
  const m=u.pathname.match(/^\/@([A-Za-z0-9._]{1,30})\/post\/([A-Za-z0-9_-]{5,30})\/?$/);
  return m?"https://www.threads.com/@"+m[1]+"/post/"+m[2]+"/":null;
 }catch{return null;}
}
async function readLimited(response:Response,limit=131072):Promise<string>{
 const reader=response.body?.getReader();
 if(!reader)return "";
 const decoder=new TextDecoder();
 let size=0,html="";
 try{
  while(size<limit){
   const {done,value}=await reader.read();
   if(done)break;
   size+=value.length;
   html+=decoder.decode(value.slice(0,Math.max(0,limit-(size-value.length))),{stream:true});
  }
 }finally{await reader.cancel().catch(()=>{});}
 return html;
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="GET")return reply(405,{ok:false,reason:"method_not_allowed"});
 const request=new URL(req.url);
 if(!request.pathname.endsWith("/resolve"))return reply(404,{ok:false,reason:"not_found"});
 const raw=request.searchParams.get("url")||"";
 let share:string;
 try{
  const u=new URL(raw);
  if(u.protocol!=="https:"||!["threads.com","www.threads.com","threads.net","www.threads.net"].includes(u.hostname.toLowerCase())||u.username||u.password||u.port)
   return reply(400,{ok:false,reason:"invalid_threads_link"});
  const m=u.pathname.match(/^\/share\/([A-Za-z0-9_-]{5,64})\/?$/);
  if(!m)return reply(400,{ok:false,reason:"invalid_threads_share_link"});
  share=m[1];
 }catch{return reply(400,{ok:false,reason:"invalid_threads_link"});}
 try{
  // Only ever request the exact official Threads origin with a verified share code.
  // Manual redirects prevent accidental requests to an arbitrary redirected host.
  const url="https://www.threads.com/share/"+share;
  const r=await fetch(url,{redirect:"manual",headers:{"Accept":"text/html","User-Agent":"Mozilla/5.0 (compatible; NBLPulsePublicEmbed/1.0)"},signal:AbortSignal.timeout(9000)});
  const location=r.headers.get("location");
  if(location){
   const resolved=postUrl(new URL(location,url).toString());
   if(resolved){
    r.body?.cancel().catch(()=>{});
    return reply(200,{ok:true,url:resolved});
   }
  }
  // Some Threads responses are HTML containing the canonical permalink instead of a 30x.
  if(r.ok&&r.headers.get("content-type")?.includes("text/html")){
   const html=await readLimited(r);
   const pattern=/(?:<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']|<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'])/ig;
   for(const m of html.matchAll(pattern)){
    const candidate=(m[1]||m[2]||"").replace(/&amp;/g,"&");
    const resolved=postUrl(candidate);
    if(resolved)return reply(200,{ok:true,url:resolved});
   }
  }else{r.body?.cancel().catch(()=>{});}
  return reply(422,{ok:false,reason:"threads_share_not_resolved"});
 }catch{return reply(503,{ok:false,reason:"threads_unavailable"});}
});
