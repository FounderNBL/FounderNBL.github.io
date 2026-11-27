// The customer deliberately opens the free third-party Photopea editor.
// Only after this click does Still send a selected local saved photo.
import {getStillMedia,saveStillMedia} from "/studio/still-media-library.mjs";
const $=id=>document.getElementById(id);
const frame=$("editor"),launch=$("launch"),close=$("close"),save=$("save"),status=$("editorStatus");
const selectedId=new URL(location.href).searchParams.get("still_media");
let inputBlob=null,ready=false,transferred=false,exportPending=false,timeout=null;
const say=text=>{status.textContent=text;};
const isPng=b=>{
  const a=new Uint8Array(b,0,Math.min(8,b.byteLength));
  return a.length===8&&[137,80,78,71,13,10,26,10].every((x,i)=>a[i]===x);
};
function resetExport(){
  exportPending=false;
  if(timeout!==null)clearTimeout(timeout);
  timeout=null;
}
launch.addEventListener("click",async()=>{
  launch.disabled=true;
  try{
    inputBlob=null;
    if(selectedId){
      const saved=await getStillMedia(selectedId);
      if(!saved)throw Error("This Still photo is missing. Open the library and select a saved photo.");
      if(saved.kind!=="image")throw Error("Advanced editor accepts pictures, not video.");
      inputBlob=saved.blob;
      say("Loading the editor. Your selected photo will be passed to Photopea only after it is ready.");
    }else say("Loading Photopea. Use File > Open to select a photo you want to edit.");
    ready=false;transferred=false;
    frame.hidden=false;frame.src="https://www.photopea.com/";
    launch.hidden=true;close.hidden=false;save.hidden=false;
  }catch(err){say(err.message);launch.disabled=false;}
});
close.addEventListener("click",()=>{
  resetExport();ready=false;transferred=false;inputBlob=null;
  frame.removeAttribute("src");frame.hidden=true;
  close.hidden=true;save.hidden=true;save.disabled=true;
  launch.hidden=false;launch.disabled=false;
  say("Editor closed. Your local Still library is unchanged.");
});
save.addEventListener("click",()=>{
  if(!ready||exportPending)return;
  exportPending=true;save.disabled=true;
  try{
    frame.contentWindow.postMessage('app.activeDocument.saveToOE("png");',"https://www.photopea.com");
    timeout=setTimeout(()=>{
      if(exportPending){resetExport();save.disabled=false;say("Editor export didn't finish. Try again or download directly from Photopea.");}
    },45000);
    say("Saving edited PNG into your local Still library...");
  }catch(err){resetExport();save.disabled=false;say(err.message);}
});
window.addEventListener("message",async event=>{
  if(frame.hidden||event.origin!=="https://www.photopea.com"||event.source!==frame.contentWindow)return;
  if(exportPending&&event.data instanceof ArrayBuffer){
    const buffer=event.data;
    resetExport();
    try{
      if(!isPng(buffer))throw Error("Editor did not return a valid PNG.");
      const saved=await saveStillMedia(new Blob([buffer],{type:"image/png"}),{name:"still-edited-"+Date.now()+".png"});
      say("Edited image saved to the Still library. Nothing was published or charged.");
      const link=$("openSaved");link.href="/still.html#still-local-heading";link.hidden=false;
    }catch(err){say("Could not store edited image: "+err.message+". Use Photopea's File menu to export it.");}
    save.disabled=false;return;
  }
  if(event.data!=="done")return;
  ready=true;save.disabled=false;
  if(!transferred&&inputBlob){
    transferred=true;
    try{
      const array=await inputBlob.arrayBuffer();
      if(frame.hidden)return;
      frame.contentWindow.postMessage(array,"https://www.photopea.com",[array]);
      say("Your Still photo is now in Photopea. Edit it, then select Save edited PNG to Still library.");
    }catch(err){say("Could not load the saved photo into the editor: "+err.message);}
  }else if(!inputBlob&&!transferred){transferred=true;say("Photopea is ready. Use File > Open, then Save edited PNG to Still library.");}
});
window.addEventListener("pagehide",resetExport);
