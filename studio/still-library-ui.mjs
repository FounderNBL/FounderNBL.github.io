import {listStillMedia,getStillMedia,saveStillMedia,deleteStillMedia,stillFile} from "/studio/still-media-library.mjs";
const $=id=>document.getElementById(id);
const host=$("still-local-list"),status=$("still-local-status"),input=$("still-local-import");
const say=message=>{status.textContent=message;};
const fileSize=bytes=>bytes>=1024*1024?(bytes/(1024*1024)).toFixed(1)+" MB":Math.max(1,Math.ceil(bytes/1024))+" KB";
const date=t=>new Date(t).toLocaleString();
let previewUrls=[];
function clearPreviews(){for(const u of previewUrls)URL.revokeObjectURL(u);previewUrls=[];}
function button(label,handler){const x=document.createElement("button");x.type="button";x.textContent=label;x.addEventListener("click",handler);return x;}
function link(label,url){const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=label;return a;}
async function refresh(){
  if(!host)return;
  clearPreviews();host.replaceChildren();
  try{
    const items=await listStillMedia();
    if(!items.length){const p=document.createElement("p");p.textContent="Nothing saved to this browser yet. Take a picture, record a video, or import your own media.";host.append(p);return;}
    for(const item of items){
      const article=document.createElement("article");article.className="still-local-item";
      const label=document.createElement("strong");label.textContent=item.name;
      const details=document.createElement("small");details.textContent=(item.kind==="video"?"Video":item.kind==="project"?"Layered PSD project":"Photo")+" · "+fileSize(item.size)+" · "+date(item.createdAt);
      const row=document.createElement("div");row.className="still-local-actions";
      if(item.kind!=="project")row.append(button("Preview",async()=>{
        const old=article.querySelector("[data-still-preview]");if(old){old.remove();return;}
        try{
          const record=await getStillMedia(item.id);if(!record)throw Error("File was deleted.");
          const url=URL.createObjectURL(record.blob);previewUrls.push(url);
          const el=document.createElement(item.kind==="image"?"img":"video");
          el.dataset.stillPreview="1";el.src=url;el.alt="Preview of "+item.name;
          el.style.maxWidth="100%";el.style.maxHeight="280px";el.style.display="block";el.style.marginTop="8px";
          if(item.kind==="video"){el.controls=true;el.preload="metadata";}
          article.append(el);
        }catch(err){say(err.message);}
      }));
      row.append(button("Download",async()=>{
        try{
          const record=await getStillMedia(item.id);if(!record)throw Error("File is unavailable.");
          const url=URL.createObjectURL(record.blob);
          const a=document.createElement("a");a.href=url;a.download=record.name;document.body.append(a);a.click();a.remove();
          window.setTimeout(()=>URL.revokeObjectURL(url),60000);
          say("Download requested. Keep copies of important files outside this browser.");
        }catch(err){say(err.message);}
      }));
      if(item.kind==="image"){
        row.append(link("Edit in Pulse", "/pulse/?still_media="+encodeURIComponent(item.id)));
        row.append(link("Advanced editor", "/studio/still-editor.html?still_media="+encodeURIComponent(item.id)));
      }else if(item.kind==="project"){
        row.append(link("Reopen layered project", "/studio/still-editor.html?still_media="+encodeURIComponent(item.id)));
      }else if(item.size<=40*1024*1024){
        row.append(link("Edit in Pulse", "/pulse/?still_media="+encodeURIComponent(item.id)));
      }else{
        const note=document.createElement("small");note.textContent="Pulse VideoBeats accepts up to 40 MB. Download this larger recording for another compatible editor.";row.append(note);
      }
      row.append(button("Delete",async()=>{
        if(!confirm("Delete this local Still item? It cannot be recovered from NBL."))return;
        try{await deleteStillMedia(item.id);say("Local file deleted.");await refresh();}
        catch(err){say(err.message);}
      }));
      article.append(label,details,row);host.append(article);
    }
  }catch(err){say(err.message+" You can still use the downloadable camera tools.");}
}
input?.addEventListener("change",async()=>{
  const files=Array.from(input.files||[]);if(!files.length)return;
  input.disabled=true;
  let count=0,errors=[];
  try{for(const file of files){try{let source=file;if(/\.psd$/i.test(file.name)&&file.size>=4){const head=new Uint8Array(await file.slice(0,4).arrayBuffer());if(String.fromCharCode(...head)==="8BPS")source=new File([file],file.name,{type:"image/vnd.adobe.photoshop"});}await saveStillMedia(source);count++;}catch(err){errors.push(file.name+": "+err.message);}}}
  finally{input.value="";input.disabled=false;}
  say(count+" file(s) saved to this browser."+(errors.length?" "+errors.slice(0,3).join(" "):""));
  await refresh();
});
$("still-local-refresh")?.addEventListener("click",refresh);
window.addEventListener("pagehide",clearPreviews);
await refresh();
