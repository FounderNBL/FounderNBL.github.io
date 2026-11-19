// Founder-only Meta review workflow on NBL Pulse; Member/Messenger access is unchanged.
// The authenticated call supplied by the Pulse shell owns the Clerk session.
const el=(tag,cls,text)=>{
 const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;
};
const LINK_OK=url=>{
 try{const u=new URL(url);return u.protocol==="https:"&&(u.hostname==="www.facebook.com"||u.hostname==="facebook.com"||u.hostname==="www.instagram.com"||u.hostname==="instagram.com")?u.href:null;}
 catch{return null;}
};
function externalLink(url,title){
 const safe=LINK_OK(url);if(!safe)return null;
 const a=el("a","btn small",title);a.href=safe;a.target="_blank";a.rel="noopener noreferrer";return a;
}
function errorText(error){
 return String(error?.message||"This Meta connection is not ready.").replace(/[_]+/g," ").slice(0,200);
}
export function founderFacebookShareButton({activity,invoke,feedback}){
 const button=el("button",null,"Send to NBL Facebook Page");button.type="button";
 button.setAttribute("aria-label","Publish this original public Pulse post to the official NBL Facebook Page");
 let done=false;
 button.addEventListener("click",async()=>{
  if(done||button.disabled)return;
  const postId=activity?.id,caption=String(activity?.text||"").trim();
  if(typeof postId!=="string"||!postId||!caption){
   feedback.textContent="Add a caption to the Pulse post before sharing it to Facebook.";return;
  }
  if(!window.confirm("Publish this Pulse post to the official NBL Facebook Page?"))return;
  button.disabled=true;
  feedback.textContent="Publishing to the NBL Facebook Page…";
  try{
   const link=new URL("/pulse/",location.origin);link.searchParams.set("post",postId);
   const out=await invoke("/facebook/publish",{confirm:"publish",message:caption.slice(0,1500),link:link.href});
   if(out.published!==true)throw Error("Facebook did not confirm publication.");
   done=true;button.textContent="Published to Facebook Page";
   feedback.textContent="Published to the NBL Facebook Page.";
   const a=externalLink(out.post_url,"View Facebook post");if(a)feedback.append(a);
  }catch(error){feedback.textContent="Facebook Page post not published: "+errorText(error);}
  finally{button.disabled=done;}
 });
 return button;
}
export function initMetaCommunity(invoke){
 const root=document.querySelector("#feedPanel")?.parentElement;
 if(!root||document.querySelector("#pulseMetaCommunity"))return;
 const panel=el("section","social-list pulse-meta-community");
 panel.id="pulseMetaCommunity";
 panel.setAttribute("aria-label","Founder Facebook Page and Instagram comment management");
 const title=el("h2",null,"NBL Page & Instagram tools");
 const info=el("p","social-meta","Founder-only controls for reviewing Meta permissions. Nothing posts automatically.");
 const status=el("p","social-feedback");status.setAttribute("role","status");
 const controls=el("div","social-actions");
 const content=el("div","pulse-meta-results");
 const reload=el("button","btn small","Check connections");
 const pageConnect=el("button","btn small","Connect NBL Facebook Page");
 const pagePosts=el("button","btn small","View Facebook Page posts");
 const igMedia=el("button","btn small","Manage Instagram comments");
 const review=el("button","btn small","Check Meta API permissions");
 const apiReport=el("p","social-feedback");apiReport.setAttribute("role","status");
 reload.type=pageConnect.type=pagePosts.type=igMedia.type=review.type="button";
 controls.append(reload,pageConnect,pagePosts,igMedia,review);
 panel.append(title,info,status,controls,apiReport,content);
 root.insertBefore(panel,document.querySelector("#feedPanel"));
 const notice=new URL(location.href).searchParams.get("facebook_connect");
 if(notice){
  status.textContent=notice==="connected"?"NBL Facebook Page connection completed. Checking it…":
    "Facebook did not finish connecting ("+String(notice).slice(0,50)+").";
 }
 const busy=(btn,work)=>async()=>{
  btn.disabled=true;try{await work();}
  catch(error){status.textContent=errorText(error);}
  finally{btn.disabled=false;}
 };
 const setLinks=items=>{
  content.replaceChildren();
  if(!items.length){content.append(el("p","social-meta","No recent public posts were returned."));return;}
  for(const item of items){
   const row=el("article","pulse-meta-result");
   row.append(el("p","social-body",String(item.message||"Post on Facebook").slice(0,750)));
   const url=externalLink(item.permalink_url,"View on Facebook");
   if(url)row.append(url);
   content.append(row);
  }
 };
 const loadStatus=async()=>{
  const r=await invoke("/status",{});
  status.textContent=(r.facebook_connected?"Facebook Page connected ("+r.facebook_page+").":"Facebook Page authorization needed.")+
    " "+(r.instagram_connected?"Official Instagram connected.":"Instagram token or asset not available.");
  pageConnect.hidden=!!r.facebook_connected||!r.facebook_login_ready;
  pagePosts.hidden=!r.facebook_connected;
  igMedia.hidden=!r.instagram_connected;
  if(!r.facebook_connected&&!r.facebook_login_ready)
   status.textContent+=" Facebook authorization is not ready; check Meta app settings.";
 };
 reload.addEventListener("click",busy(reload,loadStatus));
 review.addEventListener("click",busy(review,async()=>{
  apiReport.textContent="Checking which Meta app owns the existing Instagram token…";
  const r=await invoke("/review/diagnostics",{});
  const ig=r.instagram||{};
  if(ig.status==="verified"){
   const match=ig.matches_pulse_app===true?"Instagram token belongs to NBL Pulse Live.":
     "Instagram token is not associated with NBL Pulse Live.";
   const missing=Array.isArray(ig.missing_scopes)?ig.missing_scopes:[];
   apiReport.textContent=match+(missing.length?
     " Permissions missing from this token: "+missing.join(", ")+".":" Required Instagram scopes are present.");
  }else if(ig.status==="token_invalid"){
   apiReport.textContent="Instagram token is invalid. Reauthorization is required before new API tests.";
  }else if(ig.status==="instagram_token_missing"){
   apiReport.textContent="Instagram API token is missing from Pulse's backend.";
  }else{
   apiReport.textContent="Meta could not verify which app issued the Instagram token ("+String(ig.status||"unavailable")+").";
  }
  if(r.facebook_oauth_ready===true)
   apiReport.textContent+=" Facebook Page connection is ready to begin; Meta's callback URL must be allowed.";
  else apiReport.textContent+=" Facebook Page authorization still needs Meta app configuration.";
 }));
 pageConnect.addEventListener("click",busy(pageConnect,async()=>{
  status.textContent="Opening Meta's Facebook Page authorization…";
  const r=await invoke("/facebook/begin",{});
  const target=new URL(String(r.authorization_url||""));
  if(target.protocol!=="https:"||target.hostname!=="www.facebook.com"||!target.pathname.endsWith("/dialog/oauth"))
   throw Error("Meta authorization URL not verified.");
  location.assign(target.href);
 }));
 pagePosts.addEventListener("click",busy(pagePosts,async()=>{
  status.textContent="Reading the connected NBL Facebook Page…";
  const r=await invoke("/facebook/posts",{});
  setLinks(Array.isArray(r.posts)?r.posts:[]);
  status.textContent="Connected Facebook Page: "+String(r.page_name||"New Beansland");
 }));
 igMedia.addEventListener("click",busy(igMedia,async()=>{
  status.textContent="Loading posts from @nbl_world…";
  const r=await invoke("/instagram/media",{});
  content.replaceChildren();
  const media=Array.isArray(r.media)?r.media:[];
  if(!media.length){content.append(el("p","social-meta","No recent Instagram media was returned."));return;}
  for(const item of media){
   if(!/^\d{6,30}$/.test(String(item.id||"")))continue;
   const row=el("article","pulse-meta-result");
   const summary=el("p","social-body",item.caption||"Instagram photo / video");row.append(summary);
   const anchor=externalLink(item.permalink,"View on Instagram");if(anchor)row.append(anchor);
   const commentButton=el("button","btn small","Read comments ("+Number(item.comments_count||0)+")");
   const comments=el("div","pulse-meta-comments");
   commentButton.type="button";
   commentButton.addEventListener("click",busy(commentButton,async()=>{
    const c=await invoke("/instagram/comments",{media_id:String(item.id)});
    comments.replaceChildren();
    const list=Array.isArray(c.comments)?c.comments:[];
    if(!list.length){comments.append(el("p","social-meta","No accessible comments on this post."));return;}
    for(const comment of list){
     const line=el("div","pulse-meta-comment");
     line.append(el("strong",null,"@"+String(comment.username||"viewer")),
       el("p",null,String(comment.text||"")));
     const form=el("form","pulse-meta-reply");
     const input=el("textarea");input.rows=2;input.maxLength=600;
     input.required=true;input.placeholder="Reply to this Instagram comment";
     const submit=el("button","btn small","Publish Instagram reply");submit.type="submit";
     form.append(input,submit);
     form.addEventListener("submit",async event=>{
      event.preventDefault();const message=input.value.trim();
      if(!message||!window.confirm("Reply publicly as @nbl_world on Instagram?"))return;
      submit.disabled=true;
      try{
       const out=await invoke("/instagram/reply",{
        confirm:"reply",media_id:String(item.id),comment_id:String(comment.id),message
       });
       if(out.replied!==true)throw Error("Instagram reply was not confirmed.");
       input.value="";status.textContent="Instagram comment reply published.";
      }catch(error){status.textContent="Instagram reply failed: "+errorText(error);}
      finally{submit.disabled=false;}
     });
     line.append(form);comments.append(line);
    }
    status.textContent="Comments loaded from the selected @nbl_world post.";
   }));
   row.append(commentButton,comments);content.append(row);
  }
  status.textContent="Select an Instagram post to read or reply to comments.";
 }));
 void loadStatus().catch(e=>{status.textContent="Meta connection status: "+errorText(e);});
}
