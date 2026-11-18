// NBL Pulse Home: recent real public Beats from the viewer's existing For You
// feed and their existing own post feed. No reposting, copies or invented posts.
const HELD=new Set(["remove","shadow","shadow_block","shadow_blocked","bounce","ban"]);
export function recentHomeBeats(feeds,{limit=8}={}){
  const unique=new Map();
  for(const feed of feeds||[]){
    for(const item of Array.isArray(feed)?feed:[]){
      const id=String(item?.id||"");
      const created=Date.parse(String(item?.created_at||""));
      if(!id||item?.type!=="post"||item?.visibility!=="public"||
         item?.deleted_at||item?.hidden===true||!Number.isFinite(created)||
         HELD.has(String(item?.moderation?.action||item?.moderation_action||"").toLowerCase()))
        continue;
      const previous=unique.get(id);
      if(!previous||created>Date.parse(previous.created_at))unique.set(id,item);
    }
  }
  const n=Number.isInteger(limit)?Math.max(1,Math.min(limit,20)):8;
  return [...unique.values()].sort((a,b)=>
    Date.parse(b.created_at)-Date.parse(a.created_at)||
    String(a.id).localeCompare(String(b.id))
  ).slice(0,n);
}
