import test from "node:test";
import assert from "node:assert/strict";
import {handle} from "../server/cloudflare/pulse-share-worker.mjs";
import {pulseShareMetadata} from "../server/supabase/functions/nbl-pulse-share/share.mjs";
const id="post-123",base="https://newbeansland.org",url=base+"/pulse/share?post="+id;
const photo="https://images.stream-io-cdn.com/example.png";
const activity={id,type:"post",visibility:"public",user:{name:"NBLFounderOfficial"},text:"Shared a video",attachments:[{type:"image",image_url:photo}]};
test("the new first-party route renders HTML, actual image, identity and original post destination",async()=>{
 const r=await handle(new Request(url),async(u,opts)=>{
  assert.equal(new URL(u).searchParams.get("format"),"json");
  assert.equal(new URL(u).searchParams.get("post"),id);
  assert.equal(opts.redirect,"error");
  return Response.json(pulseShareMetadata(activity));
 });
 assert.equal(r.status,200);assert.match(r.headers.get("content-type"),/^text\/html/);
 const html=await r.text();
 assert.ok(html.includes("NBLFounderOfficial on NBL Pulse"));
 assert.ok(html.includes(photo));assert.ok(html.includes("Shared a photo"));
 assert.ok(html.includes(base+"/pulse/?post="+id));assert.ok(html.includes(url));
 assert.ok(!html.includes("supabase.co"));
});
test("private, deleted and moderated activities have no public metadata",()=>{
 for(const patch of [{visibility:"private"},{deleted:true},{deleted_at:"now"},{moderation:{action:"shadow_block"}}])
  assert.equal(pulseShareMetadata({...activity,...patch}),null);
});
test("temporary metadata failures remain retryable, not generic homepage redirects",async()=>{
 const req=new Request(url);
 for(const status of [500,503]){
  const r=await handle(req,async()=>new Response("oops",{status}));
  assert.equal(r.status,503);assert.equal(r.headers.get("retry-after"),"60");assert.equal(r.headers.get("location"),null);
 }
 assert.equal((await handle(req,async()=>new Response(null,{status:404}))).status,404);
});
test("safe escaping, correct HEAD and no arbitrary redirects or request methods",async()=>{
 const fake=async()=>Response.json({id,title:'"><script>evil</script>',description:"<bad>",image:"https://evil.example/a.png"});
 const r=await handle(new Request(url),fake),html=await r.text();
 assert.ok(!html.includes("<script>evil"));assert.ok(!html.includes("evil.example"));assert.ok(html.includes("&lt;bad&gt;"));
 assert.equal(await (await handle(new Request(url,{method:"HEAD"}),fake)).text(),"");
 assert.equal((await handle(new Request(url,{method:"POST"}),fake)).status,405);
 assert.equal((await handle(new Request(base+"/pulse/share?post=https://evil.example"),fake)).status,404);
});

test("NBL-hosted public photo is used in OG preview without allowing arbitrary hosts",async()=>{
 const ownPhoto=base+"/assets/studio/finished-cover.webp";
 const meta=pulseShareMetadata({...activity,attachments:[{type:"image",image_url:ownPhoto}]});
 assert.equal(meta.image,ownPhoto);
 const response=await handle(new Request(url),async()=>Response.json(meta));
 const html=await response.text();
 assert.equal(response.status,200);
 assert.ok(html.includes('property="og:image" content="'+ownPhoto+'"'));
 assert.ok(!html.includes("NBL_Pulse_Worldcard.png"));
 assert.equal(pulseShareMetadata({...activity,attachments:[{type:"image",image_url:"https://evil.example/cover.png"}]}).image,base+"/NBL-Brand.png");
});
