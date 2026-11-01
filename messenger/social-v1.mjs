// NBL Social Stream Feeds v3 integration preview.
// UNLINKED and noindex until 2-account, moderation, cost and privacy checks pass.
// Existing Supabase human DMs remain unchanged; Beans AI and V12 are out of scope.
import { FeedsClient } from "https://esm.sh/@stream-io/feeds-client@2.9.0?bundle";

const STREAM_BRIDGE="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-stream";
const SOCIAL_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-social";
const CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT_PORTAL="https://accounts.newbeansland.org";
const LABELS={foryou:"For You",timeline:"Following",user:"My Posts",notification:"Notifications"};
const state={clerk:null,client:null,user:null,me:null,selected:"foryou",feed:null,unsubscribe:null,busy:false,timeline:null};
const $=s=>document.querySelector(s);
function element(tag,className,text){
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(text!==undefined)el.textContent=String(text);
  return el;
}
function status(text){$("#socialStatus").textContent=String(text);}
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
  const token=await authToken();
  const response=await fetch(url,{
    method:"POST",headers:{"authorization":"Bearer "+token,"content-type":"application/json"},
    body:JSON.stringify(body),cache:"no-store"
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok!==true)throw new Error(data.message||data.reason||"NBL service unavailable");
  return data;
}
async function session(){
  const [api,identity]=await Promise.all([
    secured(STREAM_BRIDGE,{action:"session"}),
    secured(SOCIAL_API,{action:"me"})
  ]);
  // Only the server chooses the Stream user ID and official Founder status.
  if(!api.user?.id||!api.key||!api.token)throw new Error("Stream identity was not verified.");
  state.user=api.user;
  state.me=identity.me;
  const handle=String(identity.me?.handle||"").replace(/^@/,"");
  $("#identityHandle").textContent=handle?"@"+handle:"Signed in to New Beansland";
  const client=new FeedsClient(api.key,{timeout:6500});
  await client.connectUser({id:api.user.id,name:api.user.name||"NBL member"},api.token);
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
      line.append(who,words);area.append(line);
    }
  }catch(error){area.replaceChildren(element("p","social-feedback",safeError(error)));}
}
function renderActivity(activity){
  const card=element("article","social-card");
  const authorId=String(activity.user?.id||activity.user_id||"");
  const signedActor=Boolean(/^user_[a-zA-Z0-9_-]+$/.test(authorId));
  const authorLabel=activity.user?.name||"NBL member";
  const head=element("div","social-author",authorLabel);
  const time=element("div","social-time",activity.created_at?new Date(activity.created_at).toLocaleString():"");
  const text=element("p","social-body",activity.text||"");
  const meta=element("div","social-meta",Number(activity.comment_count||0)+" comments");
  const actions=element("div","social-actions");
  const feedback=element("p","social-feedback","");
  const like=element("button",null,"♡ Like");like.type="button";
  like.addEventListener("click",async()=>{
    like.disabled=true;
    try{await state.client.addActivityReaction({activity_id:activity.id,type:"like",enforce_unique:true});
      feedback.textContent="Reaction saved.";}catch(e){feedback.textContent=safeError(e);}
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
  card.append(head,time,text,meta,actions,feedback,form,commentsArea);
  return card;
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
  const selected=state.selected;
  state.unsubscribe?.();state.unsubscribe=null;
  $("#feedTitle").textContent=LABELS[selected];
  $("#feedItems").replaceChildren(element("p","social-meta","Loading "+LABELS[selected]+"…"));
  status("Refreshing "+LABELS[selected]+"…");
  try{
    const feed=state.client.feed(selected,state.user.id);
    const response=await feed.getOrCreate({watch:true,limit:20});
    if(selected!==state.selected)return;
    state.feed=feed;
    const first=feed.state?.getLatestValue()?.activities||response.activities||[];
    renderFeed(first);
    if(feed.state?.subscribeWithSelector){
      state.unsubscribe=feed.state.subscribeWithSelector(
        s=>({activities:s.activities}), current=>{
          if(state.selected===selected)renderFeed(current.activities||[]);
        });
    }
    status(LABELS[selected]+" ready. Direct messages still live at NBL Messenger.");
  }catch(error){
    $("#feedItems").replaceChildren(element("p","social-feedback",safeError(error)));
    status("Stream Feeds could not load. Existing NBL messages remain available.");
  }
}
async function publishPost(event){
  event.preventDefault();
  if(state.busy||!state.client)return;
  const text=$("#postText").value.trim();
  if(!text||text.length>1500)return;
  state.busy=true;
  const submit=$("#postForm button[type=submit]");submit.disabled=true;
  try{
    const feed=state.client.feed("user",state.user.id);
    await feed.addActivity({type:"post",text});
    $("#postText").value="";$("#postCount").textContent="0 / 1500";
    status("Your NBL post was published.");
    state.selected="user";selectTab();await loadFeed();
  }catch(error){status("Post not published: "+safeError(error));}
  finally{state.busy=false;submit.disabled=false;}
}
function selectTab(){
  document.querySelectorAll("[data-feed]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.feed===state.selected)));
  $(".social-compose").hidden=state.selected==="notification";
}
async function boot(){
  $("#signIn").href=signInURL();
  $("#postForm").addEventListener("submit",publishPost);
  $("#postText").addEventListener("input",e=>{$("#postCount").textContent=e.target.value.length+" / 1500";});
  document.querySelectorAll("[data-feed]").forEach(button=>button.addEventListener("click",()=>{
    if(!state.client||state.selected===button.dataset.feed)return;
    state.selected=button.dataset.feed;selectTab();void loadFeed();
  }));
  $("#refreshFeed").addEventListener("click",()=>{void loadFeed();});
  $("#signOut").addEventListener("click",async()=>{
    try{state.unsubscribe?.();await state.client?.disconnectUser?.();await state.clerk.signOut();location.assign("/messenger/");}
    catch{location.assign("/messenger/");}
  });
  try{
    const c=await clerk();
    if(!c.isSignedIn||!c.session){status("Sign in to connect your NBL profile.");return;}
    await session();
    $("#guest").hidden=true;$("#identity").hidden=false;$("#socialApp").hidden=false;
    selectTab();await loadFeed();
  }catch(error){status("Social integration not available: "+safeError(error));}
}
void boot();
