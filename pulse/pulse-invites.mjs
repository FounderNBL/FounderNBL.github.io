// NBL Pulse — public, user-initiated invitations. No OAuth scopes, tracking or contact imports.
export const PULSE_INVITE_URL="https://newbeansland.org/pulse/";
export const PULSE_INVITE_MESSAGE="Join me on NBL Pulse: "+PULSE_INVITE_URL;
export const PULSE_INVITE_TITLE="Join me on NBL Pulse";
export function inviteDestinations(){
  const message=encodeURIComponent(PULSE_INVITE_MESSAGE);
  return Object.freeze({
    facebook:"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(PULSE_INVITE_URL),
    whatsapp:"https://wa.me/?text="+message,
    sms:"sms:?body="+message,
    email:"mailto:?subject="+encodeURIComponent(PULSE_INVITE_TITLE)+"&body="+message
  });
}
export async function copyInviteLink(clipboard,doc){
  try{
    if(clipboard?.writeText){
      await clipboard.writeText(PULSE_INVITE_URL);
      return true;
    }
    if(!doc?.createElement || !doc.body)return false;
    const input=doc.createElement("textarea");
    input.value=PULSE_INVITE_URL;
    input.setAttribute("readonly","");
    input.style.position="fixed";input.style.left="-9999px";
    doc.body.appendChild(input);input.select();
    let result=false;
    try{result=doc.execCommand?.("copy")===true;}finally{input.remove();}
    return result;
  }catch{return false;}
}
export async function shareInvite({navigatorApi,doc,report}){
  const payload={title:PULSE_INVITE_TITLE,text:"Join me on NBL Pulse",url:PULSE_INVITE_URL};
  if(typeof navigatorApi?.share==="function"){
    try{
      await navigatorApi.share(payload);
      report("Share menu closed. Check the app you chose to confirm the invite was sent.");
      return "chooser";
    }catch(error){
      if(error?.name==="AbortError"){
        report("Invite canceled. Nothing was sent.");
        return "canceled";
      }
    }
  }
  if(await copyInviteLink(navigatorApi?.clipboard,doc)){
    report("Invite link copied! Paste it into Instagram, TikTok, Messenger, Snapchat or any other app.");
    return "copied";
  }
  report("Share this NBL link: "+PULSE_INVITE_URL);
  return "manual";
}
export function initializePulseInvites(doc=globalThis.document,navigatorApi=globalThis.navigator){
  if(!doc?.getElementById)return;
  const share=doc.getElementById("copyPulseInvite");
  const copy=doc.getElementById("pulseCopyInvite");
  const output=doc.getElementById("pulseInviteFeedback");
  if(!share || !copy || !output)return;
  const report=message=>{output.textContent=message;};
  const urls=inviteDestinations();
  for(const [type,url] of Object.entries(urls)){
    const anchor=doc.querySelector('[data-pulse-invite="'+type+'"]');
    if(anchor)anchor.href=url;
  }
  share.addEventListener("click",()=>{void shareInvite({navigatorApi,doc,report});});
  copy.addEventListener("click",async()=>{
    if(await copyInviteLink(navigatorApi?.clipboard,doc))report("NBL Pulse invite link copied. Send it privately to a friend.");
    else report("Copy this NBL link and send it to a friend: "+PULSE_INVITE_URL);
  });
}
if(typeof document!=="undefined"){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>initializePulseInvites(),{once:true});
  else initializePulseInvites();
}
