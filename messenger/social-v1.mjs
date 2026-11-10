// NBL Pulse live text feeds on the existing .org website.
// Clerk-bound accounts, Stream user feeds and moderation review; media/Go Live remain separately disabled.
// Existing Supabase human DMs remain unchanged; Beans AI and V12 are out of scope.
import { FeedsClient } from "https://esm.sh/@stream-io/feeds-client@2.9.0?bundle";
import {parsePublicVideo,mountPublicVideo} from "./social-video-connect.mjs";

const STREAM_BRIDGE="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-stream";
const SOCIAL_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-social";
const CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT_PORTAL="https://accounts.newbeansland.org";
// Public deep links contain only a provider activity ID, never message bodies or account credentials.
// The NBL server/provider still decides which activity the signed-in viewer may read.
const PUBLIC_SOCIAL_URL="https://newbeansland.org/messenger/social-v1.html";
const linkedPostId=new URL(location.href).searchParams.get("post");
const LABELS={foryou:"For You",timeline:"Following",user:"My Posts",notification:"Notifications",friends:"Friends"};
const MAX_PHOTO_BYTES=8*1024*1024,MAX_VIDEO_BYTES=40*1024*1024,MAX_PHOTOS=4;
const IMAGE_TYPES=new Set(["image/jpeg","image/png","image/webp"]);
const VIDEO_TYPES=new Set(["video/mp4","video/webm"]);
const avatarCache=new Map();
function youtubeVideoId(raw){
  if(!raw||typeof raw!=="string")return null;
  try{
    const u=new URL(raw);
    if(u.protocol!=="https:")return null;
    const host=u.hostname.toLowerCase();
    let id=null;
    if(host==="youtu.be")id=u.pathname.slice(1);
    else if(["youtube.com","www.youtube.com","m.youtube.com"].includes(host)){
      id=u.pathname==="/watch"?u.searchParams.get("v"): /^\/(?:shorts|live|embed)\//.test(u.pathname)?u.pathname.split("/")[2]:null;
    }
    return typeof id==="string"&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
  }catch{return null;}
}
async function authorProfile(userId){
  if(userId===state.user?.id)return {avatarUrl:state.me?.avatarUrl,verified:state.me?.role==="founder"};
  if(!/^user_[A-Za-z0-9_-]+$/.test(userId))return null;
  if(!avatarCache.has(userId))avatarCache.set(userId,secured(SOCIAL_API,{action:"social_profile",userId}).then(x=>x.profile||null).catch(()=>null));
  return avatarCache.get(userId);
}
function hydrateAvatar(userId,img){
  const owner=state.clerk?.user?.id;
  void authorProfile(userId).then(profile=>{
    if(state.clerk?.user?.id!==owner||!img.isConnected)return;
    const src=trustedMediaLink(profile?.avatarUrl);
    if(src)img.src=src;
  });
}
function selectedMedia(){
  const files=Array.from(document.querySelector("#postMedia")?.files||[]);
  if(!files.length)return [];
  const images=files.filter(f=>IMAGE_TYPES.has(f.type));
  if(images.length===files.length&&files.length<=MAX_PHOTOS&&images.every(f=>f.size>0&&f.size<=MAX_PHOTO_BYTES))return files;
  // Member-controlled uploads use the existing Stream media service.
  const videos=files.filter(f=>VIDEO_TYPES.has(f.type));
  if(videos.length===1&&files.length===1&&videos[0].size>0&&videos[0].size<=MAX_VIDEO_BYTES)return files;
  throw new Error("Choose up to four JPEG/PNG/WebP photos (8 MB each), or one MP4/WebM video (40 MB).");
}
function trustedMediaLink(raw){
  try{
    const url=new URL(String(raw||""));
    return url.protocol==="https:"&&url.hostname.endsWith(".stream-io-cdn.com")?url.href:null;
  }catch{return null;}
}
const pulseInitialQuery=new URL(location.href).searchParams;
// Existing bookmarks to the former embedded inbox now open Messenger as its own page.
if(location.pathname.startsWith("/pulse")&&pulseInitialQuery.get("messages")==="1"){
  const destination=new URL("/messenger/",location.origin);
  const dm=pulseInitialQuery.get("dm")||"";
  if(/^@?[A-Za-z0-9_-]{2,64}$/.test(dm))destination.searchParams.set("dm",dm);
  location.replace(destination.pathname+destination.search);
}
const state={clerk:null,client:null,user:null,me:null,selected:"foryou",feed:null,unsubscribe:null,busy:false,timeline:null};
let initialNBLUserId=null,accountChanged=false;
function assertCurrentAccount(userId){
  if(accountChanged||!userId||state.clerk?.user?.id!==userId||!state.clerk?.isSignedIn||!state.clerk?.session)
    throw new Error("Your NBL account changed. Reload Social to continue securely.");
}
// A Clerk account switch must retire feeds and hide private notifications
// immediately. Stream never supplies or replaces NBL Messenger identity.
function handleNBLAccountChange(){
  const now=state.clerk?.isSignedIn&&state.clerk?.session?state.clerk?.user?.id:null;
  if(now===initialNBLUserId||accountChanged)return;
  accountChanged=true;
  state.unsubscribe?.();state.unsubscribe=null;
  void Promise.resolve(state.client?.disconnectUser?.()).catch(()=>{});
  state.client=null;state.feed=null;state.user=null;state.me=null;avatarCache.clear();
  $("#socialApp").hidden=true;$("#identity").hidden=true;$("#guest").hidden=true;
  status("Your NBL account changed. Refreshing to protect your feeds.");
  location.reload();
}
const $=s=>document.querySelector(s);
function element(tag,className,text){
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(text!==undefined)el.textContent=String(text);
  return el;
}
function status(text){$("#socialStatus").textContent=String(text);}
function isValidPostId(id){return typeof id==="string"&&/^[A-Za-z0-9._:-]{1,160}$/.test(id);}
function isShareablePost(activity){
  return activity?.type==="post"&&activity.visibility==="public"&&isValidPostId(activity.id);
}
function nblPostLink(id){
  const dest=new URL(PUBLIC_SOCIAL_URL);
  if(location.pathname.startsWith("/pulse"))dest.pathname="/pulse/";
  dest.searchParams.set("post",id);
  return dest.href;
}
// Facebook does not execute Pulse JavaScript. Its crawler needs the server-rendered
// per-post Open Graph image rather than the static /pulse/ landing-page metadata.
// The public Supabase preview checks the real Stream activity and only exposes
// photos/captions belonging to explicitly public, non-moderated posts.
function facebookShareLink(id){
  const shareURL="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-pulse-share?post="+encodeURIComponent(id);
  return "https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(shareURL);
}
function safeError(error){return String(error?.message||"Unable to connect to NBL Social right now.").slice(0,220);}
function signInURL(){
  const dest=new URL(location.href);
  dest.hash="";
  return ACCOUNT_PORTAL+"/sign-in?redirect_url="+encodeURIComponent(dest.href);
}
function clerkDomain(){
  const value=(CLERK_PUBLISHABLE_KEY.split("_")[2]||"").replace(/-/g,"+").replace(/_/g,"/");
  return atob(value.padEnd(Math.ceil(value.length/4)*4,"=")).replace(/\$/,"");
}
async function clerk(){
  if(state.clerk)return state.clerk;
  if(!window.Clerk){
    await new Promise((resolve,reject)=>{
      const s=document.createElement("script");
      s.src="https://"+clerkDomain()+"/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
      s.crossOrigin="anonymous";
      s.setAttribute("data-clerk-publishable-key",CLERK_PUBLISHABLE_KEY);
      s.onload=resolve;
      s.onerror=()=>reject(new Error("NBL account service could not load."));
      document.head.append(s);
    });
  }
  if(!window.Clerk)throw new Error("NBL account is unavailable.");
  await window.Clerk.load();
  state.clerk=window.Clerk;
  return state.clerk;
}
async function authToken(){
  const c=await clerk();
  if(!c.isSignedIn||!c.session)throw new Error("Please sign in to your NBL account.");
  const jwt=await c.session.getToken();
  if(!jwt)throw new Error("NBL session expired. Sign in again.");
  return jwt;
}
async function secured(url,body){
  const userId=state.clerk?.user?.id;
  const token=await authToken();
  assertCurrentAccount(userId);
  const response=await fetch(url,{
    method:"POST",headers:{"authorization":"Bearer "+token,"content-type":"application/json"},
    body:JSON.stringify(body),cache:"no-store"
  });
  const data=await response.json().catch(()=>({}));
  assertCurrentAccount(userId);
  if(!response.ok||data.ok!==true)throw new Error(data.message||data.reason||"NBL service unavailable");
  return data;
}
async function session(){
  const actorId=state.clerk?.user?.id;
  assertCurrentAccount(actorId);
  const identity=await secured(SOCIAL_API,{action:"me"});
  const api=await secured(STREAM_BRIDGE,{action:"session"});
  // Only the server chooses the Stream user ID and official Founder status.
  assertCurrentAccount(actorId);
  if(api.user?.id!==actorId)throw new Error("Social identity mismatch.");
  if(!api.user?.id||!api.key||!api.token)throw new Error("Stream identity was not verified.");
  state.user=api.user;
  state.me=identity.me;
  $("#identityAvatar").src=trustedMediaLink(identity.me?.avatarUrl)||"/messenger/icon.svg";
  document.querySelector("#composerAvatar")?.setAttribute("src",trustedMediaLink(identity.me?.avatarUrl)||"/messenger/icon.svg");
  const composerHandle=document.querySelector("#composerHandle");
  if(composerHandle)composerHandle.textContent=identity.me?.handle?"@"+identity.me.handle:"Your NBL account";
  const handle=String(identity.me?.handle||"").replace(/^@/,"");
  $("#identityHandle").textContent=handle?"@"+handle:"Signed in to New Beansland";
  const client=new FeedsClient(api.key,{timeout:6500});
  await client.connectUser({id:api.user.id,name:api.user.name||"NBL member"},api.token);
  try{assertCurrentAccount(actorId);}catch(error){await Promise.resolve(client.disconnectUser?.()).catch(()=>{});throw error;}
  state.client=client;
  state.timeline=client.feed("timeline",api.user.id);
}
function commentForm(activity,feedback){
  const form=element("form","social-comment-form");
  const id="comment-"+String(activity.id).replace(/[^a-zA-Z0-9_-]/g,"").slice(0,90);
  const label=element("label",null,"Comment (max 600 characters)");label.htmlFor=id;
  const input=element("textarea");input.id=id;input.required=true;input.maxLength=600;input.rows=2;
  const submit=element("button","btn small","Publish comment");submit.type="submit";
  form.append(label,input,submit);
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(!input.value.trim()||state.busy)return;
    state.busy=true;submit.disabled=true;
    try{
      await state.client.addComment({object_type:"activity",object_id:activity.id,comment:input.value.trim()});
      input.value="";feedback.textContent="Comment published.";
      await loadComments(activity,form.parentElement.querySelector(".social-comments"));
    }catch(error){feedback.textContent=safeError(error);}
    finally{state.busy=false;submit.disabled=false;}
  });
  return form;
}
async function loadComments(activity,area){
  area.replaceChildren(element("p","social-meta","Loading comments…"));
  try{
    const result=await state.client.getComments({object_type:"activity",object_id:activity.id,limit:15,sort:"last"});
    const comments=result.comments||[];
    area.replaceChildren();
    if(!comments.length){area.append(element("p","social-meta","No comments yet."));return;}
    for(const c of comments){
      const line=element("div","social-comment");
      const who=element("strong",null,c.user?.name||"NBL member");
      const words=element("p",null,c.comment||"");
      line.append(who,words);
    if(c.id&&c.user?.id!==state.user?.id){
      const report=element("button","btn small","Report comment");
      report.type="button";
      report.addEventListener("click",async()=>{
        report.disabled=true;
        try{
          await state.client.moderation.flag({entity_type:"stream:feeds:v3:comment",entity_id:c.id,reason:"member_safety_review"});
          feedback.textContent="Comment reported to the NBL review queue.";
        }catch(error){feedback.textContent="Report failed: "+safeError(error);}
        finally{report.disabled=false;}
      });
      line.append(report);
    }
    area.append(line);
    }
  }catch(error){area.replaceChildren(element("p","social-feedback",safeError(error)));}
}
function renderActivity(activity){
  const card=element("article","social-card");
  const authorId=String(activity.user?.id||activity.user_id||"");
  const signedActor=Boolean(/^user_[a-zA-Z0-9_-]+$/.test(authorId));
  const authorLabel=activity.user?.name||"NBL member";
  const head=element("div","social-author-row");
  const avatar=element("img","social-avatar");avatar.src="/messenger/icon.svg";avatar.alt=authorLabel+" profile picture";avatar.loading="lazy";
  head.append(avatar,element("div","social-author",authorLabel));
  const time=element("div","social-time",activity.created_at?new Date(activity.created_at).toLocaleString():"");
  const text=element("p","social-body",activity.text||"");
  const meta=element("div","social-meta",Number(activity.comment_count||0)+" comments");
  const actions=element("div","social-actions");
  const feedback=element("p","social-feedback","");
  let liked=Boolean((activity.own_reactions||[]).some(reaction=>reaction.type==="like"));
  let likeCount=Number(activity.reaction_groups?.like?.count||0);
  const like=element("button",null,"");like.type="button";
  const paintLike=()=>{like.textContent=(liked?"♥ Liked":"♡ Like")+" ("+Math.max(0,likeCount)+")";};
  paintLike();
  like.addEventListener("click",async()=>{
    like.disabled=true;
    try{
      if(liked)await state.client.deleteActivityReaction({activity_id:activity.id,type:"like"});
      else await state.client.addActivityReaction({activity_id:activity.id,type:"like",enforce_unique:true});
      liked=!liked;likeCount+=liked?1:-1;paintLike();
      feedback.textContent=liked?"You liked this post.":"Like removed.";
    }catch(e){feedback.textContent=safeError(e);}
    finally{like.disabled=false;}
  });
  const showComments=element("button",null,"Comments");showComments.type="button";
  const commentsArea=element("div","social-comments");commentsArea.hidden=true;
  const form=commentForm(activity,feedback);form.hidden=true;
  showComments.addEventListener("click",async()=>{
    const reveal=commentsArea.hidden;
    commentsArea.hidden=!reveal;form.hidden=!reveal;
    if(reveal)await loadComments(activity,commentsArea);
  });
  actions.append(like,showComments);
  if(activity.id&&authorId!==state.user.id){
    const reportPost=element("button",null,"Report post");reportPost.type="button";
    reportPost.addEventListener("click",async()=>{
      reportPost.disabled=true;
      try{
        await state.client.moderation.flag({entity_type:"stream:feeds:v3:activity",entity_id:activity.id,reason:"member_safety_review"});
        feedback.textContent="Post reported to the NBL review queue.";
      }catch(error){feedback.textContent="Report failed: "+safeError(error);}
      finally{reportPost.disabled=false;}
    });
    actions.append(reportPost);
  }
  if(isShareablePost(activity)){
    // Sharing is always the member's action, performed on Facebook's own screen.
    // This does not publish to or grant privileges over the official NBL Facebook Page.
    const share=element("a",null,"Share to Facebook");
    share.href=facebookShareLink(activity.id);
    share.target="_blank";
    share.rel="noopener noreferrer";
    share.setAttribute("aria-label","Share this public NBL post to your Facebook account");
    actions.append(share);
  }
  if(signedActor&&authorId!==state.user.id){
    const follow=element("button",null,"Follow");follow.type="button";
    let following=false;
    follow.addEventListener("click",async()=>{
      follow.disabled=true;
      try{
        if(!following){
          await state.client.getOrCreateFollows({follows:[{source:state.timeline.feed,target:"user:"+authorId}]});
          following=true;follow.textContent="Unfollow";
        }else{
          await state.client.getOrCreateUnfollows({follows:[{source:state.timeline.feed,target:"user:"+authorId}]});
          following=false;follow.textContent="Follow";
        }
        feedback.textContent=following?"Following this creator.":"Creator unfollowed.";
      }catch(error){feedback.textContent=safeError(error);}
      finally{follow.disabled=false;}
    });
    actions.append(follow);
    // Stream Feeds is PUBLIC social activity only. Look up the author's actual
    // NBL handle through the protected NBL backend, then open our existing
    // Messenger. No Stream Chat, new inbox, automatic DM, or credit usage.
    const message=element("button",null,"Message");message.type="button";
    message.setAttribute("aria-label","Message this NBL creator");
    message.addEventListener("click",async()=>{
      message.disabled=true;
      try{
        const result=await secured(SOCIAL_API,{action:"social_profile",userId:authorId});
        const handle=String(result.profile?.handle||"");
        if(!/^[A-Za-z0-9_-]{2,64}$/.test(handle))
          throw new Error("This creator cannot receive messages.");
        const url=new URL("/messenger/",location.origin);
        url.searchParams.set("dm",handle);
        location.assign(url.pathname+url.search);
      }catch(error){feedback.textContent="Messenger could not open: "+safeError(error);}
      finally{message.disabled=false;}
    });
    actions.append(message);
  }
  const media=element("div","social-media");
  for(const attachment of activity.attachments||[]){
    if(!attachment||!["image","video"].includes(attachment.type))continue;
    const address=trustedMediaLink(attachment.type==="image"?attachment.image_url:attachment.asset_url);
    if(!address)continue;
    if(attachment.type==="image"){
      const image=element("img");image.src=address;image.alt="Photo shared by "+authorLabel;
      image.loading="lazy";image.decoding="async";media.append(image);
    }else{
      const video=element("video");video.src=address;video.controls=true;
      video.preload="metadata";video.playsInline=true;video.setAttribute("aria-label","Video shared by "+authorLabel);
      media.append(video);
    }
  }
  mountPublicVideo(activity.custom,media);
  hydrateAvatar(authorId,avatar);
  card.append(head,time,text,media,meta,actions,feedback,form,commentsArea);
  return card;
}
async function loadLinkedPost(){
  if(linkedPostId===null)return;
  const panel=$("#sharedPost"),content=$("#sharedPostContent");
  panel.hidden=false;
  if(!isValidPostId(linkedPostId)){
    content.replaceChildren(element("p","social-feedback","That shared post link is invalid."));
    return;
  }
  content.replaceChildren(element("p","social-meta","Opening shared NBL post…"));
  const actorId=state.user?.id;
  try{
    assertCurrentAccount(actorId);
    const response=await state.client.getActivity({id:linkedPostId});
    assertCurrentAccount(actorId);
    const activity=response.activity;
    if(!isShareablePost(activity)||activity.id!==linkedPostId)
      throw new Error("This post is not publicly shareable.");
    content.replaceChildren(renderActivity(activity));
  }catch{
    if(accountChanged)return;
    content.replaceChildren(element("p","social-feedback","This public NBL post is unavailable or you do not have access to it."));
  }
}
function friendListItem(item){
  const line=element("div","friend-entry");
  const who=element("strong",null,"@"+item.handle+(item.verified?" · Verified":""));
  const current=element("span","social-meta",item.direction==="friends"?"Friends":item.direction==="incoming"?"Wants to be friends":"Request sent");
  const controls=element("div","social-actions");
  const choices=item.direction==="incoming"?[["friend_accept","Accept"],["friend_decline","Decline"]]:
    item.direction==="friends"?[["friend_remove","Remove friend"]]:[];
  for(const [action,title] of choices){
    const btn=element("button",null,title);btn.type="button";
    btn.addEventListener("click",async()=>{
      btn.disabled=true;
      try{
        await secured(SOCIAL_API,{action,handle:item.handle});
        status(title==="Accept"?"Friend request accepted.":title==="Decline"?"Request declined.":"Friend removed.");
        await loadFriends();
      }catch(error){status("Could not update friends: "+safeError(error));}
      finally{btn.disabled=false;}
    });
    controls.append(btn);
  }
  const picture=element("img","social-avatar");picture.src=trustedMediaLink(item.avatarUrl)||"/messenger/icon.svg";
  picture.alt="@"+item.handle+" profile picture";picture.loading="lazy";line.prepend(picture);
  line.append(who,current,controls);
  return line;
}
async function loadFriends(){
  const out=$("#friendItems");
  out.replaceChildren(element("p","social-meta","Loading your NBL friends…"));
  try{
    const actorId=state.user.id;
    const result=await secured(SOCIAL_API,{action:"friends_list"});
    assertCurrentAccount(actorId);
    const rows=Array.isArray(result.connections)?result.connections:[];
    out.replaceChildren();
    if(!rows.length){out.append(element("p","social-empty","No requests yet. Send one using someone's NBL username."));return;}
    for(const [label,direction] of [["Friend requests","incoming"],["Friends","friends"],["Sent requests","outgoing"]]){
      const section=rows.filter(row=>row.direction===direction);
      if(!section.length)continue;
      out.append(element("h3",null,label));
      for(const item of section)out.append(friendListItem(item));
    }
  }catch(error){out.replaceChildren(element("p","social-feedback","Friends unavailable: "+safeError(error)));}
}
async function requestFriend(event){
  event.preventDefault();
  const handle=$("#friendHandle").value.trim().replace(/^@/,"");
  if(!/^[A-Za-z0-9_-]{2,64}$/.test(handle)){status("Enter an NBL username.");return;}
  const button=$("#friendForm button[type=submit]");
  button.disabled=true;
  try{
    const result=await secured(SOCIAL_API,{action:"friend_request",handle});
    status(result.state==="friends"?"You're already friends.":result.state==="incoming"?"They already requested you. Accept in Friends.":"Friend request sent. The other member decides.");
    $("#friendHandle").value="";
    await loadFriends();
  }catch(error){status("Friend request failed: "+safeError(error));}
  finally{button.disabled=false;}
}

function renderFeed(rows){
  const out=$("#feedItems");out.replaceChildren();
  if(!rows.length){
    const message=state.selected==="foryou"?"The For You feed is quiet. It needs real community activity to get started.":
      state.selected==="timeline"?"Follow NBL creators to see their posts here.":
      state.selected==="notification"?"No notifications yet.":"You haven't posted anything yet.";
    out.append(element("p","social-empty",message));return;
  }
  for(const entry of rows){
    if(entry.id)out.append(renderActivity(entry));
    else {
      // Notification aggregation is a different shape than ordinary feed posts.
      const n=element("article","social-card");
      n.append(element("p","social-body",entry.text||entry.verb||entry.type||"Activity notification"));
      out.append(n);
    }
  }
}
async function loadFeed(){
  if(!state.client)return;
  if(state.selected==="friends"){await loadFriends();return;}
  const selected=state.selected;
  state.unsubscribe?.();state.unsubscribe=null;
  $("#feedTitle").textContent=LABELS[selected];
  $("#feedItems").replaceChildren(element("p","social-meta","Loading "+LABELS[selected]+"…"));
  status("Refreshing "+LABELS[selected]+"…");
  try{
    const actorId=state.user.id;
    assertCurrentAccount(actorId);
    const feed=state.client.feed(selected,actorId);
    const response=await feed.getOrCreate({watch:true,limit:20});
    assertCurrentAccount(actorId);
    if(selected!==state.selected)return;
    state.feed=feed;
    const first=feed.state?.getLatestValue()?.activities||response.activities||[];
    renderFeed(first);
    if(feed.state?.subscribeWithSelector){
      state.unsubscribe=feed.state.subscribeWithSelector(
        s=>({activities:s.activities}), current=>{
          if(!accountChanged&&state.selected===selected&&state.clerk?.user?.id===actorId)
            renderFeed(current.activities||[]);
        });
    }
    status(LABELS[selected]+" ready.");
  }catch(error){
    if(accountChanged)return;
    $("#feedItems").replaceChildren(element("p","social-feedback",safeError(error)));
    status("Stream Feeds could not load. Existing NBL messages remain available.");
  }
}
async function saveProfileAvatar(){
  if(!state.client||!state.clerk?.isSignedIn)return;
  const file=$("#profileAvatarFile").files?.[0],notice=$("#profileAvatarStatus"),button=$("#saveProfileAvatar");
  if(!file||!IMAGE_TYPES.has(file.type)||file.size<1||file.size>5*1024*1024){
    notice.textContent="Choose a JPEG, PNG or WebP picture up to 5 MB.";return;
  }
  const actorId=state.clerk.user.id;button.disabled=true;notice.textContent="Saving your profile picture…";
  let upload=null;
  try{
    upload=trustedMediaLink((await state.client.uploadImage({file})).file);
    if(!upload)throw new Error("Profile photo upload failed.");
    assertCurrentAccount(actorId);
    const updated=await secured(SOCIAL_API,{action:"profile_photo",avatarUrl:upload});
    assertCurrentAccount(actorId);
    state.me.avatarUrl=updated.avatarUrl;
    $("#identityAvatar").src=updated.avatarUrl||"/messenger/icon.svg";
    document.querySelector("#composerAvatar")?.setAttribute("src",updated.avatarUrl||"/messenger/icon.svg");
    avatarCache.delete(actorId);
    $("#profileAvatarFile").value="";
    notice.textContent="Profile picture saved for your NBL account.";
  }catch(error){
    if(upload)await state.client.deleteImage({url:upload}).catch(()=>{});
    notice.textContent="Picture not saved: "+safeError(error);
  }finally{button.disabled=false;}
}
async function publishPost(event){
  event.preventDefault();
  if(state.busy||!state.client)return;
  const text=$("#postText").value.trim();
  const videoLink=$("#videoLink").value.trim();
  const chosenVideo=videoLink?parsePublicVideo(videoLink):null;
  if(videoLink&&!chosenVideo){status("Use a public YouTube, Facebook video/Reel, or Instagram post/Reel link.");return;}
  if(videoLink&&!$("#videoShareRights").checked){
    status("Please confirm you own or have permission to share this video.");return;
  }
  const youtubeId=chosenVideo?.provider==="youtube"?chosenVideo.id:null;
  let files;
  try{files=selectedMedia();}catch(error){status(safeError(error));return;}
  if((!text&&!files.length&&!chosenVideo)||text.length>1500)return;
  state.busy=true;
  const submit=$("#postForm button[type=submit]");submit.disabled=true;
  try{
    const feed=state.client.feed("user",state.user.id);
    const attachments=[];
    let result;
    try{
      for(const file of files){
        // Stream authenticates uploads with the member's own Clerk-derived identity.
        const image=IMAGE_TYPES.has(file.type);
        const response=image?await state.client.uploadImage({file}):await state.client.uploadFile({file});
        const trusted=trustedMediaLink(response?.file);
        if(!trusted)throw new Error("Upload did not return a trusted Stream media link.");
        attachments.push(image?{type:"image",image_url:trusted,custom:{}}:{type:"video",asset_url:trusted,custom:{}});
      }
      result=await feed.addActivity({type:"post",text:text||"Shared a video",attachments,visibility:"public",
        ...(chosenVideo?{custom:youtubeId?{nbl_youtube_id:youtubeId}:{nbl_external_video_url:chosenVideo.url}}:{})});
    }catch(error){
      // Also clean up partial photo uploads when a later upload fails, rather
      // than only cleaning up when activity creation itself fails.
      for(const asset of attachments){
        try{
          if(asset.type==="image")await state.client.deleteImage({url:asset.image_url});
          else await state.client.deleteFile({url:asset.asset_url});
        }catch{}
      }
      throw error;
    }
    $("#postText").value="";$("#postCount").textContent="0 / 1500";
    $("#postMedia").value="";$("#videoLink").value="";$("#videoShareRights").checked=false;
    $("#mediaSelection").textContent="Up to 4 photos (8 MB each) or 1 video (40 MB).";
    const modAction=String(result?.activity?.moderation?.action||result?.moderation?.action||"").toLowerCase();
    status(["remove","shadow","shadow_block","bounce"].includes(modAction)
      ?"Your post was submitted to moderation and may not be visible to others.":"Your NBL post was published.");
    state.selected="user";selectTab();await loadFeed();
  }catch(error){status("Post not published: "+safeError(error));}
  finally{state.busy=false;submit.disabled=false;}
}
function selectTab(){
  document.querySelectorAll("[data-feed]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.feed===state.selected)));
  const friends=state.selected==="friends";
  $("#friendsPanel").hidden=!friends;
  $("#feedPanel").hidden=friends;
  $(".social-compose").hidden=friends||state.selected==="notification";
}
async function boot(){
  $("#signIn").href=signInURL();
  $("#postForm").addEventListener("submit",publishPost);
  document.querySelector("#copyPulseInvite")?.addEventListener("click",async()=>{
    const url="https://newbeansland.org/pulse/";
    // Instagram has no Facebook-style web link-sharing dialog. Use the phone's
    // native share sheet (Instagram if offered), with a copy-link fallback.
    if(navigator.share){
      try{
        await navigator.share({title:"NBL Pulse",text:"Join me on NBL Pulse",url});
        status("NBL Pulse invitation shared from your phone.");
        return;
      }catch(error){
        if(error?.name==="AbortError"){status("Share canceled. No invitation was sent.");return;}
      }
    }
    try{
      await navigator.clipboard.writeText(url);
      status("NBL Pulse invite link copied. Paste it into an Instagram DM.");
    }catch{status("Copy this link into Instagram: "+url);}
  });
  $("#saveProfileAvatar").addEventListener("click",()=>{void saveProfileAvatar();});
  $("#friendForm").addEventListener("submit",requestFriend);
  $("#postMedia").addEventListener("change",()=>{
    try{
      const files=selectedMedia();
      $("#mediaSelection").textContent=files.length?files.map(file=>file.name).join(", "):"No media selected.";
    }catch(error){$("#mediaSelection").textContent=safeError(error);}
  });
  $("#postText").addEventListener("input",e=>{$("#postCount").textContent=e.target.value.length+" / 1500";});
  document.querySelectorAll("[data-feed]").forEach(button=>button.addEventListener("click",()=>{
    if(button.dataset.feed==="messages"){location.assign("/messenger/");return;}
    if(!state.client||state.selected===button.dataset.feed)return;
    state.selected=button.dataset.feed;
    if(location.pathname.startsWith("/pulse")){
      const url=new URL(location.href);
      url.searchParams.delete("messages");url.searchParams.delete("dm");
      history.replaceState(history.state,"",url.pathname+url.search);
    }
    selectTab();
    void loadFeed();
  }));
  $("#refreshFeed").addEventListener("click",()=>{void loadFeed();});
  $("#signOut").addEventListener("click",async()=>{
    try{state.unsubscribe?.();await state.client?.disconnectUser?.();await state.clerk.signOut();location.assign("/pulse/");}
    catch{location.assign("/pulse/");}
  });
  try{
    const c=await clerk();
    initialNBLUserId=c.isSignedIn&&c.session?c.user?.id:null;
    c.addListener?.(handleNBLAccountChange);
    if(!initialNBLUserId){status("Sign in to connect your NBL profile.");return;}
    await session();
    assertCurrentAccount(initialNBLUserId);
    $("#guest").hidden=true;$("#identity").hidden=false;$("#socialApp").hidden=false;
    selectTab();
    await loadFeed();
    await loadLinkedPost();
  }catch(error){
    status("Social integration not available: "+safeError(error));
  }
}
void boot();
