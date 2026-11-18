// Pure, client-side helpers for NBL Pulse's existing Stream Feeds websocket.
// Notices only describe public Beats actually received by a member's watched feed.
// They do NOT send push, create a separate notification backend, or fetch other users' posts.
const HANDLE=/^[A-Za-z0-9_-]{2,64}$/;
const ACTIVITY=/^[A-Za-z0-9._:-]{1,160}$/;
const ACTOR=/^user_[A-Za-z0-9_-]+$/;
const BLOCKED=new Set(["remove","shadow","shadow_block","bounce"]);
export function pulseHandle(profile){
  const raw=typeof profile?.handle==="string"?profile.handle.replace(/^@/,""):"";
  return HANDLE.test(raw)?"@"+raw:null;
}
function authorId(activity){
  return String(activity?.user?.id||activity?.user_id||"");
}
function eligible(activity,viewerId,now){
  if(!activity||activity.type!=="post"||activity.visibility!=="public"||
     !ACTIVITY.test(String(activity.id||"")))return false;
  const owner=authorId(activity);
  if(!ACTOR.test(owner)||owner===viewerId)return false;
  const moderation=String(activity.moderation?.action||"").toLowerCase();
  if(BLOCKED.has(moderation))return false;
  const when=Date.parse(String(activity.created_at||""));
  return Number.isFinite(when)&&when>=now-5*60*1000&&when<=now+60*1000;
}
export function createNewBeatTracker(){
  const seen=new Set();
  const MAX_SEEN=512;
  function remember(activity){
    const id=String(activity?.id||"");
    if(!ACTIVITY.test(id))return false;
    if(seen.has(id))return false;
    seen.add(id);
    while(seen.size>MAX_SEEN)seen.delete(seen.values().next().value);
    return true;
  }
  return {
    // Do not alert on initial load or on switching between pre-existing feeds.
    prime(rows){
      for(const item of Array.isArray(rows)?rows:[])remember(item);
    },
    // Only new, visible, recent posts received after the watch starts.
    collect(rows,viewerId,now=Date.now()){
      const fresh=[];
      for(const item of Array.isArray(rows)?rows:[]){
        if(remember(item)&&eligible(item,viewerId,now))fresh.push(item);
      }
      // One concise notice for latest new post; no notification flood.
      fresh.sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
      return fresh.slice(0,1);
    }
  };
}
