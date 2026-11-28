// Public post previews only. Never render user HTML or nonpublic Stream activities.
export function validPulsePostId(id){
  return typeof id==="string" && /^[A-Za-z0-9._:-]{1,160}$/.test(id);
}
export function escapeShareHTML(input){
  return String(input??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}
export function safePulsePhoto(url){
  try{
    const u=new URL(String(url||""));
    // Public, first-party NBL artwork is safe to preview too; reject arbitrary third-party hosts.
    const stream=u.hostname.toLowerCase().endsWith(".stream-io-cdn.com");
    const firstParty=u.hostname==="newbeansland.org" &&
      /^\/(?:assets\/|studio\/|[A-Za-z0-9_-]+\.(?:png|jpe?g|webp)$)/i.test(u.pathname) &&
      /\.(?:png|jpe?g|webp)$/i.test(u.pathname);
    return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&
      (stream||firstParty)&&u.href.length<=1600 ? u.href:null;
  }catch{return null;}
}
export function pulseShareMetadata(activity){
  if(!activity || activity.type!=="post"||activity.visibility!=="public"||
      activity.deleted_at || activity.deleted===true || activity.hidden===true || ["remove","shadow","shadow_block","shadow_blocked","bounce","ban"].includes(String(activity.moderation?.action||activity.moderation_action||"").toLowerCase()) ||
      !validPulsePostId(String(activity.id||"")))return null;
  const author=String(activity.user?.name||"NBL member").replace(/\s+/g," ").trim().slice(0,80)||"NBL member";
  let text=String(activity.text||"").replace(/\s+/g," ").trim().slice(0,220);
  const photos=Array.isArray(activity.attachments)?activity.attachments:[];
  const image=photos.find(a=>a?.type==="image"&&safePulsePhoto(a?.image_url));
  const thumbnail=photos.find(a=>a?.type==="video"&&safePulsePhoto(a?.thumb_url||a?.image_url));
  if(text==="Shared a video"&&photos.length&&photos.every(a=>a?.type==="image")&&
      !activity.custom?.nbl_youtube_id&&!activity.custom?.nbl_external_video_url)
    text=photos.length===1?"Shared a photo":"Shared photos";
  return {id:String(activity.id),title:author+" on NBL Pulse",
    description:text||"See this public post on NBL Pulse.",
    image:safePulsePhoto(image?.image_url)||safePulsePhoto(thumbnail?.thumb_url||thumbnail?.image_url)||"https://newbeansland.org/NBL-Brand.png",
    photo:!!image};
}
