// Open a customer-chosen saved Still photo/video in the EXISTING Pulse Studios editors.
// No upload, post, publish, paid model call, or external token exchange.
import {getStillMedia,stillFile} from "/studio/still-media-library.mjs";
import {fileToInput,STUDIO_LIMITS,IMAGE_TYPES,VIDEO_TYPES} from "/pulse/studios-core.mjs";
import {openPulseStudios} from "/pulse/pulse-studios.mjs";
const url=new URL(location.href),id=url.searchParams.get("still_media");
if(id){
  url.searchParams.delete("still_media");
  history.replaceState(history.state,"",url.pathname+url.search+url.hash);
  const showError=text=>{
    const notice=document.createElement("p");
    notice.setAttribute("role","alert");
    notice.style.cssText="margin:12px;padding:14px;border:1px solid #c89c65;border-radius:9px;color:#ffe6b0;background:#1d1525";
    notice.textContent=text+" Open Still to choose another file.";
    const link=document.createElement("a");link.href="/still.html#still-local-heading";link.textContent=" Open Still library";
    link.style.color="#ffe0a1";notice.append(link);document.body.prepend(notice);
  };
  try{
    const item=await getStillMedia(id);
    if(!item)throw Error("That saved Still item is no longer available in this browser.");
    if(item.kind==="image"&&(!IMAGE_TYPES.has(item.type)||item.size>STUDIO_LIMITS.imageBytes))
      throw Error("Pulse PhotoBeats accepts JPG, PNG or WebP up to 24 MB.");
    if(item.kind==="video"&&(!VIDEO_TYPES.has(item.type)||item.size>STUDIO_LIMITS.videoBytes))
      throw Error("Pulse VideoBeats accepts MP4 or WebM up to 40 MB.");
    if(!["image","video"].includes(item.kind))throw Error("Unsupported Still media.");
    const kind=item.kind==="image"?"photo":"video";
    const input=document.getElementById(kind==="photo"?"psPhotoFile":"psVideoFile");
    if(!input)throw Error("The existing Pulse Studios editor is unavailable.");
    await openPulseStudios("download",kind);
    fileToInput(input,stillFile(item));
    const notice=document.getElementById(kind==="photo"?"psPhotoStatus":"psVideoStatus");
    if(notice)notice.textContent="Opening your Still file in "+(kind==="photo"?"PhotoBeats":"VideoBeats")+". Nothing is posted; edit and export when ready.";
  }catch(err){showError(err?.message||"Could not load this Still file.");}
}
