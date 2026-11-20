// Official embeds only. No private social API tokens, arbitrary HTML, or iframe URLs from members.
export function parsePublicVideo(raw){
  if(typeof raw!=="string"||raw.length>12000)return null;
  // The official Threads "Copy embed code" option contains a canonical post URL.
  // Extract only that URL. Never inject the user's copied HTML or scripts.
  let source=raw.trim();
  if(source.startsWith("<blockquote")&&source.includes('data-text-post-permalink')){
    const m=source.match(/\bdata-text-post-permalink\s*=\s*["']([^"']{1,350})["']/i);
    if(!m)return null;
    source=m[1].replace(/&amp;/g,"&");
  }
  if(source.length>350)return null;
  try{
    const u=new URL(source);
    if(u.protocol!=="https:"||u.username||u.password||u.port)return null;
    const h=u.hostname.toLowerCase(),p=u.pathname;
    let id=null;
    if(h==="youtu.be")id=p.slice(1);
    else if(["youtube.com","www.youtube.com","m.youtube.com"].includes(h))
      id=p==="/watch"?u.searchParams.get("v"):/^\/(?:shorts|live|embed)\//.test(p)?p.split("/")[2]:null;
    if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))return {provider:"youtube",id};
    if(["facebook.com","www.facebook.com","m.facebook.com","web.facebook.com"].includes(h)){
      if(/^\/watch\/?$/.test(p)&&/^[0-9]{4,25}$/.test(u.searchParams.get("v")||""))
        return {provider:"facebook",url:"https://www.facebook.com/watch/?v="+u.searchParams.get("v")};
      if(/^\/(?:reel|videos)\/[0-9]{4,25}\/?$/.test(p)||/^\/[A-Za-z0-9._-]+\/videos\/[0-9]{4,25}\/?$/.test(p))
        return {provider:"facebook",url:"https://www.facebook.com"+p.replace(/\/?$/,"/")};
    }
    if(["instagram.com","www.instagram.com"].includes(h)){
      const m=p.match(/^\/(reel|p|tv)\/([A-Za-z0-9_-]{5,30})\/?$/);
      if(m)return {provider:"instagram",url:"https://www.instagram.com/"+m[1]+"/"+m[2]+"/"};
    }
    if(["threads.com","www.threads.com","threads.net","www.threads.net"].includes(h)){
      const m=p.match(/^\/@([A-Za-z0-9._]{1,30})\/post\/([A-Za-z0-9_-]{5,30})\/?$/);
      if(m)return {provider:"threads",url:"https://www.threads.com/@"+m[1]+"/post/"+m[2]+"/"};
      const short=p.match(/^\/t\/([A-Za-z0-9_-]{5,30})\/?$/);
      if(short)return {provider:"threads",url:"https://www.threads.com/t/"+short[1]+"/"};
      // Threads mobile share sheets often produce /share/ links, not post URLs.
      const share=p.match(/^\/share\/([A-Za-z0-9_-]{5,64})\/?$/);
      if(share)return {provider:"threads-share",url:"https://www.threads.com/share/"+share[1]};
    }
    if(["facebook.com","www.facebook.com","m.facebook.com","web.facebook.com"].includes(h)){
      const post=p.match(/^\/([A-Za-z0-9._-]{1,100})\/posts\/((?:\d{5,30}|pfbid[A-Za-z0-9]{12,140}))\/?$/);
      if(post)return {provider:"facebook-post",url:"https://www.facebook.com/"+post[1]+"/posts/"+post[2]+"/"};
      if(p==="/permalink.php"&&/^\d{4,30}$/.test(u.searchParams.get("id")||"")&&
        /^(?:\d{4,30}|pfbid[A-Za-z0-9]{12,140})$/.test(u.searchParams.get("story_fbid")||""))
        return {provider:"facebook-post",url:"https://www.facebook.com/permalink.php?story_fbid="+
          encodeURIComponent(u.searchParams.get("story_fbid"))+"&id="+u.searchParams.get("id")};
    }
    return null;
  }catch{return null;}
}
export async function resolvePublicVideo(clip){
 if(!clip||clip.provider!=="threads-share")return clip;
 const endpoint="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-public-threads-resolve/resolve?url="+encodeURIComponent(clip.url);
 const result=await fetch(endpoint,{credentials:"omit",signal:AbortSignal.timeout(12000)});
 if(!result.ok)throw new Error("Threads could not resolve the share link. Open the original post and try again.");
 const data=await result.json();
 const resolved=parsePublicVideo(data?.url);
 if(resolved?.provider!=="threads")throw new Error("Threads did not return a public post permalink.");
 return resolved;
}
function frame(title,source){
  const f=document.createElement("iframe");
  f.className="social-video-embed";f.title=title;f.src=source;f.loading="lazy";
  f.allow="autoplay; encrypted-media; picture-in-picture; web-share";f.allowFullscreen=true;
  f.referrerPolicy="strict-origin-when-cross-origin";
  return f;
}
export function mountPublicVideo(custom,media){
  const id=custom?.nbl_youtube_id;
  if(typeof id==="string"&&/^[A-Za-z0-9_-]{11}$/.test(id)){
    media.append(frame("YouTube video inside NBL Pulse","https://www.youtube-nocookie.com/embed/"+id));
    return;
  }
  const clip=parsePublicVideo(custom?.nbl_external_video_url);
  if(!clip||clip.provider==="youtube")return;
  const button=document.createElement("button");
  button.type="button";button.className="social-embed-play";
  button.textContent="Show public "+(clip.provider==="facebook"||clip.provider==="facebook-post"?"Facebook":clip.provider==="threads"||clip.provider==="threads-share"?"Threads":"Instagram")+" post in Pulse";
  button.addEventListener("click",async()=>{
    let target=clip;
    if(clip.provider==="threads-share"){
      button.disabled=true;button.textContent="Resolving Threads sharing link…";
      try{target=await resolvePublicVideo(clip);}
      catch{
        button.disabled=false;button.textContent="Could not resolve Threads link — try again";
        if(!media.querySelector("a[data-threads-fallback]")){
          const fallback=document.createElement("a");
          fallback.href=clip.url;fallback.target="_blank";fallback.rel="noopener noreferrer";
          fallback.dataset.threadsFallback="true";
          fallback.textContent="Open original Threads share link";
          media.append(fallback);
        }
        return;
      }
    }
    button.remove();
    if(target.provider==="facebook"||target.provider==="facebook-post"){
      const embedBase=target.provider==="facebook-post"?
        "https://www.facebook.com/plugins/post.php":"https://www.facebook.com/plugins/video.php";
      media.append(frame("Facebook "+(target.provider==="facebook-post"?"post":"video")+" inside NBL Pulse",
        embedBase+"?href="+encodeURIComponent(target.url)+"&show_text=true&width=500"));
    }else if(target.provider==="threads"){
      // Only official public Threads post markup; no member-supplied HTML or scripts.
      const quote=document.createElement("blockquote");
      quote.className="text-post-media";
      quote.dataset.textPostPermalink=target.url;
      quote.dataset.textPostVersion="0";
      const fallback=document.createElement("a");fallback.href=target.url;
      fallback.target="_blank";fallback.rel="noopener noreferrer";fallback.textContent="View original public Threads post";
      quote.append(fallback);media.append(quote);
      const script=document.createElement("script");
      script.src="https://www.threads.com/embed.js";script.async=true;
      document.head.append(script);
    }else{
      const quote=document.createElement("blockquote");
      quote.className="instagram-media";quote.dataset.instgrmPermalink=target.url;quote.dataset.instgrmVersion="14";
      const fallback=document.createElement("a");fallback.href=target.url;fallback.target="_blank";fallback.rel="noopener noreferrer";fallback.textContent="View the original if this post cannot be embedded";
      quote.append(fallback);media.append(quote);
      if(window.instgrm?.Embeds?.process){window.instgrm.Embeds.process();return;}
      if(!document.querySelector('script[data-pulse-instagram]')){
        const script=document.createElement("script");
        script.src="https://www.instagram.com/embed.js";script.async=true;
        script.dataset.pulseInstagram="true";script.onload=()=>window.instgrm?.Embeds?.process?.();
        document.head.append(script);
      }
    }
  });
  media.append(button);
}
