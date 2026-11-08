// Official embeds only. No private social API tokens, arbitrary HTML, or iframe URLs from members.
export function parsePublicVideo(raw){
  if(typeof raw!=="string"||raw.length>350)return null;
  try{
    const u=new URL(raw);
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
    return null;
  }catch{return null;}
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
  button.textContent="Play "+(clip.provider==="facebook"?"Facebook":"Instagram")+" video in Pulse";
  button.addEventListener("click",()=>{
    button.remove();
    if(clip.provider==="facebook"){
      media.append(frame("Facebook video inside NBL Pulse","https://www.facebook.com/plugins/video.php?href="+encodeURIComponent(clip.url)+"&show_text=false&width=560"));
    }else{
      const quote=document.createElement("blockquote");
      quote.className="instagram-media";quote.dataset.instgrmPermalink=clip.url;quote.dataset.instgrmVersion="14";
      const fallback=document.createElement("a");fallback.href=clip.url;fallback.target="_blank";fallback.rel="noopener noreferrer";fallback.textContent="View the original if this post cannot be embedded";
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
