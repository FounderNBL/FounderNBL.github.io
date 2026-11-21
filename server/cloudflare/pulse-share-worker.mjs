// Dedicated, narrowly routed Worker for public Pulse sharing. No provider credentials.
const base="https://newbeansland.org";
const path="/pulse/share";
const backend="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-pulse-share";
const valid=id=>typeof id==="string"&&/^[A-Za-z0-9._:-]{1,160}$/.test(id);
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
function imageURL(raw){
 try{const u=new URL(raw);if(u.protocol==="https:"&&!u.username&&!u.password&&u.href.length<=1600&&
 (u.hostname.endsWith(".stream-io-cdn.com")||u.href===base+"/NBL-Brand.png"))return u.href;}catch{}
 return base+"/NBL-Brand.png";
}
export function render(meta,id){
 const canonical=base+path+"?post="+encodeURIComponent(id);
 const dest=base+"/pulse/?post="+encodeURIComponent(id);
 const title=escape(String(meta.title||"NBL Pulse").slice(0,100));
 const description=escape(String(meta.description||"See this public post on NBL Pulse.").slice(0,220));
 const image=escape(imageURL(meta.image));
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>'+title+'</title><meta property="og:type" content="article"><meta property="og:site_name" content="NBL Pulse">'+
 '<meta property="og:url" content="'+escape(canonical)+'"><meta property="og:title" content="'+title+'">'+
 '<meta property="og:description" content="'+description+'"><meta property="og:image" content="'+image+'">'+
 '<meta property="og:image:secure_url" content="'+image+'"><meta name="twitter:card" content="summary_large_image">'+
 '<meta name="robots" content="noindex"><link rel="canonical" href="'+escape(canonical)+'"></head>'+
 '<body><main><h1>'+title+'</h1><p>'+description+'</p><img src="'+image+'" alt="Pulse post preview" width="320">'+
 '<p><a href="'+escape(dest)+'">Open this post on NBL Pulse</a></p></main>'+
 '<script>location.replace('+JSON.stringify(dest)+');</script></body></html>';
}
export async function handle(request,fetcher=fetch){
 const url=new URL(request.url);
 if(url.hostname!=="newbeansland.org"||![path,path+"/"].includes(url.pathname))return new Response("Not found",{status:404});
 if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed",{status:405,headers:{allow:"GET, HEAD"}});
 const id=url.searchParams.get("post");
 if(!valid(id))return new Response("Post not found",{status:404});
 const destination=base+"/pulse/?post="+encodeURIComponent(id);
 const fallback=()=>new Response(null,{status:302,headers:{location:destination,"cache-control":"no-store"}});
 try{
  const source=new URL(backend);source.searchParams.set("post",id);source.searchParams.set("format","json");
  const result=await fetcher(source.toString(),{headers:{accept:"application/json"},redirect:"error",signal:AbortSignal.timeout(10000)});
  if(result.status===404)return new Response(request.method==="HEAD"?null:"This Pulse post is no longer available.",{status:404,headers:{"cache-control":"no-store"}});
  if(!result.ok)return fallback();
  const meta=await result.json();
  if(meta?.id!==id)return fallback();
  return new Response(request.method==="HEAD"?null:render(meta,id),{headers:{
   "content-type":"text/html; charset=utf-8","x-content-type-options":"nosniff","referrer-policy":"no-referrer",
   "cache-control":"no-store","content-security-policy":"default-src 'none'; img-src https://*.stream-io-cdn.com https://newbeansland.org; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  }});
 }catch{return fallback();}
}
export default {fetch:request=>handle(request)};
