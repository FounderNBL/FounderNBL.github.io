// Pulse Studios / PhotoBeats & FaceBeats. Local edits only; actual uploading
// remains in the existing signed-in Pulse profile / post handlers.
import {IMAGE_TYPES,STUDIO_LIMITS,aspectFor,coverGeometry,outputSize,validateLocalFile,fileToInput} from "./studios-core.mjs";
const $=s=>document.querySelector(s);
const modal=$("#pulseStudiosDialog");
let bitmap=null,sourceName="pulse-beat",facePoints=null,faceDetector=null,rotation=0,flip=false,currentTarget="download",frameId=0;
const photo=$("#psPhotoCanvas"),photoInput=$("#psPhotoFile"),status=$("#psPhotoStatus");
function message(text){if(status)status.textContent=text;}
function number(id,fallback=0){return Number($(id)?.value??fallback)||fallback;}
function settings(){return {ratio:$("#psPhotoAspect")?.value||"square",zoom:number("#psPhotoZoom",100)/100,panX:number("#psPhotoPanX"),panY:number("#psPhotoPanY"),rotation,flip,brightness:number("#psPhotoBrightness",100),contrast:number("#psPhotoContrast",100),saturation:number("#psPhotoSaturation",100),text:$("#psPhotoText")?.value||"",face:$("#psFacePreset")?.value||"none"};}
export function renderBeatImage(ctx,image,options,outputWidth,outputHeight,landmarks=null){
  const {scale,shiftX,shiftY}=coverGeometry(image.width,image.height,outputWidth,outputHeight,options);
  ctx.clearRect(0,0,outputWidth,outputHeight);
  ctx.save();
  ctx.translate(outputWidth/2+shiftX,outputHeight/2+shiftY);
  ctx.rotate((options.rotation||0)*Math.PI/180);
  ctx.scale(options.flip?-1:1,1);
  ctx.filter=`brightness(${Math.max(0,Math.min(200,options.brightness??100))}%) contrast(${Math.max(0,Math.min(200,options.contrast??100))}%) saturate(${Math.max(0,Math.min(200,options.saturation??100))}%)`;
  ctx.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);
  ctx.filter="none";
  // Landmark overlays move and rotate WITH the photographed face.
  if(landmarks && options.face && options.face!=="none"){
    const point=n=>landmarks[n]&&[(landmarks[n].x-.5)*image.width*scale,(landmarks[n].y-.5)*image.height*scale];
    const cheek=(n)=>{const p=point(n);if(!p)return;ctx.beginPath();ctx.ellipse(p[0],p[1],image.width*scale*.065,image.height*scale*.04,0,0,Math.PI*2);ctx.fill();};
    if(options.face==="blush"||options.face==="glow"){
      ctx.fillStyle="rgba(255,94,139,.24)";cheek(205);cheek(425);
    }
    if(options.face==="lips"||options.face==="glow"){
      const ids=[61,40,37,0,267,270,291,321,314,17,84,91];
      if(ids.every(n=>point(n))){ctx.beginPath();ids.forEach((n,i)=>{const p=point(n);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.closePath();ctx.fillStyle="rgba(204,37,91,.36)";ctx.fill();}
    }
  }
  ctx.restore();
  if(options.text?.trim()){
    const label=options.text.trim().slice(0,100);
    ctx.font=`bold ${Math.max(15,Math.round(outputWidth/24))}px system-ui,sans-serif`;
    ctx.textAlign="center";ctx.textBaseline="bottom";
    ctx.lineWidth=Math.max(3,outputWidth/190);ctx.strokeStyle="rgba(0,0,0,.85)";
    ctx.strokeText(label,outputWidth/2,outputHeight-20,outputWidth*.94);
    ctx.fillStyle="#fff";ctx.fillText(label,outputWidth/2,outputHeight-20,outputWidth*.94);
  }
}
function paintCanvas(canvas,size){
  const opts=settings(),[a,b]=aspectFor(opts.ratio,bitmap.width,bitmap.height);
  const target=outputSize([a,b],size);canvas.width=target.width;canvas.height=target.height;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw Error("Canvas is not supported by your browser.");
  renderBeatImage(ctx,bitmap,opts,target.width,target.height,facePoints);
}
function resetEdits(){
  rotation=0;flip=false;facePoints=null;
  for(const [id,v] of [["#psPhotoZoom","100"],["#psPhotoPanX","0"],["#psPhotoPanY","0"],["#psPhotoBrightness","100"],["#psPhotoContrast","100"],["#psPhotoSaturation","100"]])if($(id))$(id).value=v;
  if($("#psFacePreset"))$("#psFacePreset").value="none";
  if($("#psPhotoText"))$("#psPhotoText").value="";
  render();message("Adjustments reset. The original picture is still loaded.");
}
function render(){
  if(!bitmap||!photo)return;
  if(frameId)cancelAnimationFrame(frameId);
  frameId=requestAnimationFrame(()=>{frameId=0;try{paintCanvas(photo,720);}catch(error){message(error.message);}});
}
async function loadPhoto(file){
  validateLocalFile(file,IMAGE_TYPES,STUDIO_LIMITS.imageBytes);
  const next=await createImageBitmap(file);
  if(next.width*next.height>32*1024*1024){next.close?.();throw Error("That picture is too large to edit safely (32 megapixels maximum).");}
  bitmap?.close?.();bitmap=next;sourceName=file.name.replace(/\.[^.]+$/,"").slice(0,70)||"pulse-beat";facePoints=null;
  rotation=0;flip=false;
  for(const [id,v] of [["#psPhotoZoom","100"],["#psPhotoPanX","0"],["#psPhotoPanY","0"],["#psPhotoBrightness","100"],["#psPhotoContrast","100"],["#psPhotoSaturation","100"]])if($(id))$(id).value=v;
  if($("#psFacePreset"))$("#psFacePreset").value="none";
  if($("#psPhotoText"))$("#psPhotoText").value="";
  if($("#psPhotoAspect"))$("#psPhotoAspect").value=currentTarget==="profile"?"square":"original";
  render();message("Picture loaded. Editing is free and stays on your device until you choose what to do.");
}
export async function prepareBeatImage(target="download"){
  if(!bitmap)throw Error("Choose a picture first.");
  const opts=settings();
  if(target==="profile")opts.ratio="square"; // Profile avatars are always square before circular UI masking.
  const mime=target==="profile"?"image/jpeg":($("#psPhotoFormat")?.value||"image/jpeg");
  const cap=target==="profile"?STUDIO_LIMITS.profileBytes:target==="post"?STUDIO_LIMITS.postImageBytes:24*1024*1024;
  const size=target==="profile"?512:Math.min(2048,Math.max(256,number("#psPhotoSize",1080)));
  const ext=mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg";
  for(const pixels of [size,Math.min(size,1280),Math.min(size,1080),720,512,360]){
    const output=document.createElement("canvas");
    if(target==="profile"){
      output.width=pixels;output.height=pixels;
      renderBeatImage(output.getContext("2d"),bitmap,opts,pixels,pixels,facePoints);
    }else paintCanvas(output,pixels);
    for(const quality of [0.92,0.82,0.7]){
      const blob=await new Promise(resolve=>output.toBlob(resolve,mime,quality));
      if(blob&&blob.size>0&&blob.size<=cap)
        return new File([blob],`${sourceName}-beat.${ext}`,{type:blob.type||mime});
    }
  }
  throw Error("Edited image is too large for this destination. Try JPG or a smaller size.");
}
function download(file){
  const url=URL.createObjectURL(file),link=document.createElement("a");
  link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function faceBeats(){
  if(!bitmap){message("Choose a photo first.");return;}
  const button=$("#psFaceDetect");button.disabled=true;message("Loading FaceBeats locally. No Google API key or paid generation required…");
  try{
    if(!faceDetector){
      const {FaceLandmarker,FilesetResolver}=await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs");
      const vision=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm");
      faceDetector=await FaceLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",delegate:"CPU"},runningMode:"IMAGE",numFaces:1});
    }
    facePoints=faceDetector.detect(bitmap)?.faceLandmarks?.[0]||null;
    if(!facePoints){message("No face was detected in this picture. Regular editing still works.");return;}
    if($("#psFacePreset")?.value==="none")$("#psFacePreset").value="glow";
    render();message("Face detected. Choose Glow, Blush, or Lip color. The effect is included when you export.");
  }catch(error){message("FaceBeats tracking unavailable on this device/network. Photo editing still works.");}
  finally{button.disabled=false;}
}
async function usePhoto(target){
  const button=target==="post"?$("#psUsePost"):target==="profile"?$("#psUseProfile"):$("#psDownloadPhoto");
  button.disabled=true;
  try{
    const file=await prepareBeatImage(target);
    if(target==="post"){
      const input=$("#postMedia");
      if(input.files?.length&&!confirm("Replace the selected draft media with this edited photo?"))return;
      fileToInput(input,file);
      const extra=$("#pulseComposerExtra");if(extra)extra.hidden=false;
      message("Edited photo is attached to your existing Beat draft. Publish Beat when YOU choose.");
    }else if(target==="profile"){
      fileToInput($("#profileAvatarFile"),file);
      message("Edited profile photo is staged. Press Save picture in your NBL profile to publish it.");
    }else{download(file);message("Saved your edited picture to this device.");}
  }catch(error){message(error?.message||"Could not export photo.");}
  finally{button.disabled=false;}
}
export async function openPulseStudios(target="download",kind="photo"){
  if(!modal)return;
  currentTarget=target;modal.showModal();
  for(const b of modal.querySelectorAll("[data-ps-tab]"))b.setAttribute("aria-selected",String(b.dataset.psTab===kind));
  for(const panel of modal.querySelectorAll("[data-ps-panel]"))panel.hidden=panel.dataset.psPanel!==kind;
  const active=target==="profile"?$("#profileAvatarFile")?.files?.[0]:target==="post"?Array.from($("#postMedia")?.files||[]).find(f=>IMAGE_TYPES.has(f.type)):null;
  if(active&&kind==="photo")try{await loadPhoto(active);}catch(error){message(error.message);}
  if(target==="profile")message("PhotoBeats: edit your profile picture; Save picture still requires your approval.");
}
function init(){
  if(!modal)return;
  $("#psOpenPost")?.addEventListener("click",()=>void openPulseStudios("post","photo"));
  $("#psOpenProfile")?.addEventListener("click",()=>void openPulseStudios("profile","photo"));
  $("#psOpenMenu")?.addEventListener("click",()=>void openPulseStudios("download","photo"));
  $("#psClose")?.addEventListener("click",()=>modal.close());
  modal.addEventListener("click",e=>{if(e.target===modal)modal.close();});
  photoInput?.addEventListener("change",async()=>{try{if(photoInput.files?.[0])await loadPhoto(photoInput.files[0]);}catch(e){message(e.message);}});
  for(const id of ["#psPhotoAspect","#psPhotoZoom","#psPhotoPanX","#psPhotoPanY","#psPhotoBrightness","#psPhotoContrast","#psPhotoSaturation","#psPhotoText","#psFacePreset"])$(id)?.addEventListener("input",render);
  $("#psPhotoRotate")?.addEventListener("click",()=>{rotation=(rotation+90)%360;render();});
  $("#psPhotoFlip")?.addEventListener("click",()=>{flip=!flip;render();});
  $("#psPhotoReset")?.addEventListener("click",resetEdits);
  $("#psFaceDetect")?.addEventListener("click",()=>void faceBeats());
  $("#psUsePost")?.addEventListener("click",()=>void usePhoto("post"));
  $("#psUseProfile")?.addEventListener("click",()=>void usePhoto("profile"));
  $("#psDownloadPhoto")?.addEventListener("click",()=>void usePhoto("download"));
  modal.querySelectorAll("[data-ps-tab]").forEach(b=>b.addEventListener("click",()=>{
    modal.querySelectorAll("[data-ps-tab]").forEach(item=>item.setAttribute("aria-selected",String(item===b)));
    modal.querySelectorAll("[data-ps-panel]").forEach(panel=>panel.hidden=panel.dataset.psPanel!==b.dataset.psTab);
  }));
}
init();
