// NBL Pulse: bring an AI-generated image from the clipboard or a local file
// into the existing real post composer. Never uploads or posts until the
// signed-in member deliberately submits #postForm; Stream owns media storage.
const form=document.querySelector("#postForm");
const input=document.querySelector("#postMedia");
const pasteButton=document.querySelector("#pulsePasteAiImage");
const preview=document.querySelector("#pulseAiImagePreview");
const help=document.querySelector("#pulseAiImageHelp");
const dropZone=document.querySelector("#pulseAiDropTarget");
const removeButton=document.querySelector("#pulseAiRemoveMedia");
const extra=document.querySelector("#pulseComposerExtra");
const ALLOWED=new Set(["image/png","image/jpeg","image/webp"]);
const MAX_IMAGES=4,MAX_BYTES=8*1024*1024;
let previewRevision=0;
function setHelp(message){if(help)help.textContent=message;}
async function renderPreviews(){
  if(!preview||!input)return;
  const revision=++previewRevision;
  preview.replaceChildren();
  const photos=Array.from(input.files||[]).filter(f=>ALLOWED.has(f.type));
  preview.hidden=!photos.length;
  if(removeButton)removeButton.hidden=!(input.files?.length);
  // Decode into a canvas instead of assigning user-provided file data to a
  // DOM image URL. No arbitrary document, SVG or HTML resource is loaded.
  for(const file of photos){
    const figure=document.createElement("figure");
    const canvas=document.createElement("canvas");
    canvas.width=320;canvas.height=320;
    canvas.setAttribute("role","img");
    canvas.setAttribute("aria-label","Image awaiting approval for a Pulse Beat");
    const caption=document.createElement("figcaption");
    caption.textContent=file.name;
    figure.append(canvas,caption);
    preview.append(figure);
    try{
      const bitmap=await createImageBitmap(file);
      if(revision!==previewRevision){bitmap.close?.();return;}
      const ctx=canvas.getContext("2d");
      if(ctx&&bitmap.width>0&&bitmap.height>0){
        const scale=Math.min(canvas.width/bitmap.width,canvas.height/bitmap.height);
        const width=Math.max(1,Math.round(bitmap.width*scale));
        const height=Math.max(1,Math.round(bitmap.height*scale));
        ctx.drawImage(bitmap,Math.floor((canvas.width-width)/2),Math.floor((canvas.height-height)/2),width,height);
      }
      bitmap.close?.();
    }catch{
      caption.textContent=file.name+" (preview unavailable; file still attached)";
    }
  }
}
function addImages(files){
  if(!input||!form||!extra)return false;
  const incoming=Array.from(files||[]);
  if(!incoming.length)return false;
  if(incoming.some(f=>!ALLOWED.has(f.type)||f.size<1||f.size>MAX_BYTES)){
    setHelp("Use PNG, JPG or WebP images of 8 MB or less each. Nothing was attached.");
    return false;
  }
  const existing=Array.from(input.files||[]);
  if(existing.some(f=>!ALLOWED.has(f.type))){
    setHelp("Remove your selected video before adding an image.");
    return false;
  }
  if(existing.length+incoming.length>MAX_IMAGES){
    setHelp("Pulse accepts up to four photos per post. Remove an image first.");
    return false;
  }
  try{
    // Real File objects travel through the existing authenticated Stream upload.
    // This avoids GitHub, unsigned URLs, external image fetches and paid API calls.
    const transfer=new DataTransfer();
    for(const file of [...existing,...incoming])transfer.items.add(file);
    input.files=transfer.files;
    extra.hidden=false;
    input.dispatchEvent(new Event("change",{bubbles:true}));
    setHelp(incoming.length+" image"+(incoming.length===1?"":"s")+" attached for preview. Nothing has been published.");
    return true;
  }catch{
    setHelp("Your browser cannot transfer copied images directly. Save the picture and choose it with Add photos.");
    return false;
  }
}
async function pasteFromClipboard(){
  if(!navigator.clipboard?.read){
    setHelp("Clipboard image access is unavailable here. Save the picture and choose it using Add photos.");
    return;
  }
  try{
    const items=await navigator.clipboard.read(),files=[];
    for(const item of items){
      const type=item.types.find(t=>ALLOWED.has(t));
      if(!type)continue;
      const blob=await item.getType(type);
      const ext=type==="image/jpeg"?"jpg":type==="image/webp"?"webp":"png";
      files.push(new File([blob],"pulse-ai-image-"+Date.now()+"."+ext,{type}));
    }
    if(!files.length){setHelp("No picture is copied. Copy the image in ChatGPT, then tap Paste AI image.");return;}
    addImages(files);
  }catch{
    setHelp("Clipboard access was blocked. Save the picture and select it with Add photos instead.");
  }
}
if(form&&input&&pasteButton&&preview&&help){
  pasteButton.addEventListener("click",()=>{void pasteFromClipboard();});
  input.addEventListener("change",()=>{void renderPreviews();});
  form.addEventListener("paste",event=>{
    const data=event.clipboardData;
    if(!data)return;
    const files=Array.from(data.items||[]).filter(item=>item.kind==="file").map(item=>item.getAsFile()).filter(Boolean);
    if(!files.some(f=>ALLOWED.has(f.type)))return; // Never intercept caption text.
    event.preventDefault();
    addImages(files);
  });
  form.addEventListener("dragover",event=>{
    if(Array.from(event.dataTransfer?.types||[]).includes("Files"))event.preventDefault();
  });
  form.addEventListener("drop",event=>{
    const files=Array.from(event.dataTransfer?.files||[]);
    if(!files.some(f=>ALLOWED.has(f.type)))return;
    event.preventDefault();
    addImages(files);
  });
  if(dropZone){
    dropZone.addEventListener("dragover",event=>{
      if(Array.from(event.dataTransfer?.types||[]).includes("Files"))event.preventDefault();
    });
  }
  removeButton?.addEventListener("click",()=>{
    input.value="";
    input.dispatchEvent(new Event("change",{bubbles:true}));
    setHelp("Images removed from this draft. Nothing was posted.");
  });
  void renderPreviews();
}