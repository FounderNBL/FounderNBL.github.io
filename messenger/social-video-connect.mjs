// Official public-provider embeds only. Never accept arbitrary HTML, iframe URLs or Meta tokens.
// Members choose an existing public post. Loading external providers requires a separate click.
export function parsePublicVideo(raw){
  if(typeof raw!=="string"||raw.length>600)return null;
  try{
    const u=new URL(raw.trim());
    if(u.protocol!=="https:"||u.username||u.password||u.port)return null;
    const h=u.hostname.toLowerCase(),p=u.pathname;
    let id=null;
    if(h==="youtu.be")id=p.slice(1);
    else if(["youtube.com","www.youtube.com","m.youtube.com"].includes(h))
      id=p==="/watch"?u.searchParams.get("v"):/^\/(?:shorts|live|embed)\//.test(p)?p.split("/")[2]:null;
    if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))return {provider:"youtube",id};
    if(["facebook.com","www.facebook.com","m.facebook.com","web.facebook.com"].includes(h)){
      const watch=u.searchParams.get("v");
      if(/^\/watch\/?$/.test(p)&&/^[0-9]{4,25}$/.test(watch||""))
        return {provider:"facebook",kind:"video",url:"https://www.facebook.com/watch/?v="+watch};
      if(/^\/(?:reel|videos)\/[0-9]{4,25}\/?$/.test(p)||/^\/[A-Za-z0-9._-]+\/videos\/[0-9]{4,25}\/?$/.test(p))
        return {provider:"facebook",kind:"video",url:"https://www.facebook.com"+p.replace(/\/?$/,"/")};
      if(/^\/(?:[A-Za-z0-9._-]{1,100}\/posts\/(?:pfbid[A-Za-z0-9]{8,200}|[0-9]{4,25})|groups\/[A-Za-z0-9._-]{1,100}\/posts\/[0-9]{4,25})\/?$/.test(p))
        return {provider:"facebook",kind:"post",url:"https://www.facebook.com"+p.replace(/\/?$/,"/")};
      const story=u.searchParams.get("story_fbid"),owner=u.searchParams.get("id");
      if(p==="/permalink.php"&&/^(?:[0-9]{4,25}|pfbid[A-Za-z0-9]{8,200})$/.test(story||"")&&/^[0-9]{4,25}$/.test(owner||""))
        return {provider:"facebook",kind:"post",url:"https://www.facebook.com/permalink.php?story_fbid="+encodeURIComponent(story)+"&id="+owner};
    }
    if(["instagram.com","www.instagram.com"].includes(h)){
      const match=p.match(/^\/(reel|p|tv)\/([A-Za-z0-9_-]{5,30})\/?$/);
      if(match)return {provider:"instagram",kind:"post",url:"https://www.instagram.com/"+match[1]+"/"+match[2]+"/"};
    }
    if(["threads.com","www.threads.com","threads.net","www.threads.net"].includes(h)){
      const match=p.match(/^\/(@[A-Za-z0-9._]{1,40}\/post\/|t\/)([A-Za-z0-9_-]{5,40})\/?$/);
      if(match)return {provider:"threads",kind:"post",url:"https://www.threads.com/"+match[1]+match[2]};
    }
    return null;
  }catch{return null;}
}
function frame(title,source,isPost=false){
  const f=document.createElement("iframe");
  f.className="social-video-embed"+(isPost?" social-post-embed":"");
  f.title=title;f.src=source;f.loading="lazy";
  f.allow="autoplay; encrypted-media; picture-in-picture; web-share";f.allowFullscreen=true;
  f.referrerPolicy="strict-origin-when-cross-origin";
  return f;
}
function instagramEmbed(clip,media){
  const quote=document.createElement("blockquote");
  quote.className="instagram-media";quote.dataset.instgrmPermalink=clip.url;quote.dataset.instgrmVersion="14";
  media.append(quote);
  if(window.instgrm?.Embeds?.process){window.instgrm.Embeds.process();return;}
  if(!document.querySelector("script[data-pulse-instagram]")){
    const script=document.createElement("script");script.src="https://www.instagram.com/embed.js";
    script.async=true;script.dataset.pulseInstagram="true";
    script.onload=()=>window.instgrm?.Embeds?.process?.();
    document.head.append(script);
  }
}
function threadsEmbed(clip,media){
  const quote=document.createElement("blockquote");
  quote.className="text-post-media";quote.dataset.textPostPermalink=clip.url;
  quote.dataset.textPostVersion="0";
  media.append(quote);
  // Meta's official script discovers public Threads posts on load. Re-insert on
  // each viewer click so later cards also render, with no third-party code before consent.
  const script=document.createElement("script");
  script.src="https://www.threads.com/embed.js";script.async=true;
  document.head.append(script);
  script.addEventListener("load",()=>script.remove(),{once:true});
  script.addEventListener("error",()=>script.remove(),{once:true});
}
export function mountPublicVideo(custom,media){
  const id=custom?.nbl_youtube_id;
  if(typeof id==="string"&&/^[A-Za-z0-9_-]{11}$/.test(id)){
    media.append(frame("YouTube video inside NBL Pulse","https://www.youtube-nocookie.com/embed/"+id));
    return;
  }
  // nbl_external_video_url is the existing Stream custom field; kept compatible
  // for earlier public Facebook/Instagram videos while also supporting public posts.
  const clip=parsePublicVideo(custom?.nbl_external_video_url);
  if(!clip||clip.provider==="youtube")return;
  const labels={facebook:"Facebook",instagram:"Instagram",threads:"Threads"};
  const host=labels[clip.provider];
  const wrap=document.createElement("div");wrap.className="social-provider-embed";
  const button=document.createElement("button");
  button.type="button";button.className="social-embed-play";
  button.textContent="Show public "+host+" "+(clip.kind==="video"?"video":"post")+" in Pulse";
  const source=document.createElement("a");
  source.className="social-provider-source";source.href=clip.url;
  source.target="_blank";source.rel="noopener noreferrer";
  source.textContent="View original on "+host;
  button.addEventListener("click",()=>{
    button.disabled=true;button.remove();
    if(clip.provider==="facebook"){
      const plugin=clip.kind==="video"?"video.php":"post.php";
      wrap.prepend(frame("Public Facebook "+(clip.kind==="video"?"video":"post")+" in NBL Pulse",
        "https://www.facebook.com/plugins/"+plugin+"?href="+encodeURIComponent(clip.url)+
        "&show_text=true&width=500",clip.kind!=="video"));
    }else if(clip.provider==="instagram")instagramEmbed(clip,wrap);
    else threadsEmbed(clip,wrap);
  });
  wrap.append(button,source);media.append(wrap);
}
