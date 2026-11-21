// Owner-only post operations using the signed-in member's Stream client.
export function ownPost(activity,actor){
 return !!actor&&/^user_[A-Za-z0-9_-]+$/.test(actor)&&activity?.type==="post"&&
  typeof activity.id==="string"&&/^[A-Za-z0-9._:-]{1,160}$/.test(activity.id)&&
  String(activity.user?.id||activity.user_id||"")===actor;
}
export function mediaCaption(attachments=[],external=false){
 if(external)return "Shared a public link";
 if(attachments.some(a=>a?.type==="video"))return "Shared a video";
 if(attachments.some(a=>a?.type==="image"))return attachments.length===1?"Shared a photo":"Shared photos";
 return "";
}
export function displayedCaption(activity){
 const text=String(activity?.text||"");
 const media=activity?.attachments||[];
 if(text==="Shared a video"&&media.length&&media.every(a=>a?.type==="image")&&
  !activity?.custom?.nbl_youtube_id&&!activity?.custom?.nbl_external_video_url)
  return mediaCaption(media);
 return text;
}
export async function mutateOwnPost({client,activity,actor,assertAccount,action,caption}){
 assertAccount(actor);
 if(!ownPost(activity,actor))throw Error("You can manage only your own posts.");
 // Re-read the original activity under the active user's provider session.
 const result=await client.getActivity({id:activity.id});
 assertAccount(actor);
 const original=result?.activity;
 if(!ownPost(original,actor)||original.id!==activity.id)
  throw Error("This post is unavailable or no longer belongs to your account.");
 if(action==="delete"){
  // Delete the actual activity across all feeds. Do not delete CDN media
  // or independent posts on Meta, which may share the same source asset.
  await client.deleteActivity({id:original.id,hard_delete:true,delete_notification_activity:true});
 }else if(action==="edit"){
  if(typeof caption!=="string"||caption.length>1500)throw Error("Use no more than 1,500 characters.");
  const value=caption.trim();
  if(!value&&!(original.attachments||[]).length&&!original.custom?.nbl_youtube_id&&!original.custom?.nbl_external_video_url)
   throw Error("A text-only post cannot be empty.");
  // Partial update leaves attachments, visibility, feed destinations and custom
  // metadata untouched and runs the existing activity processors.
  await client.updateActivityPartial({id:original.id,set:{text:value},run_activity_processors:true});
 }else throw Error("Unknown post action.");
 assertAccount(actor);
}
