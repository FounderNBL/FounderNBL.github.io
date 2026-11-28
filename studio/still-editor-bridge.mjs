// The customer deliberately opens the free third-party Photopea editor.
// Only after this click does Still send a selected local saved photo.
import {getStillMedia,saveStillMedia} from "/studio/still-media-library.mjs";
const $=id=>document.getElementById(id);
const frame=$("editor"),launch=$("launch"),close=$("close"),save=$("save"),saveProject=$("saveProject"),status=$("editorStatus");
const selectedId=new URL(location.href).searchParams.get("still_media");
let inputBlob=null,ready=false,transferred=false,exportPending=false,exportFormat="",timeout=null;
const say=text=>{status.textContent=text;};
const isPng=b=>{
  const a=new Uint8Array(b,0,Math.min(8,b.byteLength));
  return a.length===8&&[137,80,78,71,13,10,26,10].every((x,i)=>a[i]===x);
};
const isPsd=b=>{const x=new Uint8Array(b,0,Math.min(4,b.byteLength));return x.length===4&&String.fromCharCode(...x)==="8BPS";};
function resetExport(){
  exportPending=false;exportFormat="";
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
      if(saved.kind!=="image"&&saved.kind!=="project")throw Error("Advanced editor accepts photos and PSD projects, not videos.");
      inputBlob=saved.blob;
      say("Loading the editor. Your selected photo will be passed to Photopea only after it is ready.");
    }else say("Loading Photopea. Use File > Open to select a photo you want to edit.");
    ready=false;transferred=false;
    frame.hidden=false;frame.src="https://www.photopea.com/";
    launch.hidden=true;close.hidden=false;save.hidden=false;saveProject.hidden=false;
  }catch(err){say(err.message);launch.disabled=false;}
});
close.addEventListener("click",()=>{
  resetExport();ready=false;transferred=false;inputBlob=null;
  frame.removeAttribute("src");frame.hidden=true;
  close.hidden=true;save.hidden=true;save.disabled=true;saveProject.hidden=true;saveProject.disabled=true;
  launch.hidden=false;launch.disabled=false;
  say("Editor closed. Your local Still library is unchanged.");
});
function requestExport(format){
  if(!ready||exportPending)return;
  exportPending=true;exportFormat=format;save.disabled=true;saveProject.disabled=true;
  try{
    frame.contentWindow.postMessage('app.activeDocument.saveToOE("'+format+'");',"https://www.photopea.com");
    timeout=setTimeout(()=>{
      if(exportPending){resetExport();save.disabled=false;saveProject.disabled=false;say("Editor export didn't finish. Try again or download from Photopea.");}
    },45000);
    say("Saving "+(format==="psd"?"editable PSD project":"finished PNG")+" into local Still library...");
  }catch(err){resetExport();save.disabled=false;saveProject.disabled=false;say(err.message);}
}
save.addEventListener("click",()=>requestExport("png"));
saveProject.addEventListener("click",()=>requestExport("psd"));
window.addEventListener("message",async event=>{
  if(frame.hidden||event.origin!=="https://www.photopea.com"||event.source!==frame.contentWindow)return;
  if(exportPending&&event.data instanceof ArrayBuffer){
    const buffer=event.data,format=exportFormat;
    resetExport();
    try{
      if(format==="png"&&!isPng(buffer))throw Error("Editor did not return a valid PNG.");
      if(format==="psd"&&!isPsd(buffer))throw Error("Editor did not return a valid PSD.");
      const type=format==="psd"?"image/vnd.adobe.photoshop":"image/png";
      await saveStillMedia(new Blob([buffer],{type}),{name:"still-"+(format==="psd"?"project":"edited")+"-"+Date.now()+"."+format});
      say(format==="psd"?"Editable layered project saved to Still library. Reopen it later in Photopea.":"Finished image saved to Still library. Nothing was published or charged.");
      const link=$("openSaved");link.href="/still.html#still-local-heading";link.hidden=false;
    }catch(err){say("Could not store editor output: "+err.message+". Use Photopea's File menu to export.");}
    save.disabled=false;saveProject.disabled=false;return;
  }
  if(event.data!=="done")return;
  ready=true;save.disabled=false;saveProject.disabled=false;
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
