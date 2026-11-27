// Still local media: shared by Still Camera, Still library, and Pulse Studios.
// Browser-only; never upload, publish, invoke a model, or spend credits.
const DB_NAME="nbl-still-media-v1", STORE="items", MAX_COUNT=40;
export const STILL_IMAGE_TYPES=new Set(["image/png","image/jpeg","image/webp"]);
export const STILL_VIDEO_TYPES=new Set(["video/mp4","video/webm"]);
export const STILL_MAX_IMAGE_BYTES=24*1024*1024;
export const STILL_MAX_VIDEO_BYTES=100*1024*1024;
export const STILL_TOTAL_BYTES=250*1024*1024;
const message=err=>err?.name==="QuotaExceededError"?"This browser is out of storage space. Download files you need, delete old Still items, then try again.":err?.message||"Still local storage is unavailable.";
function open(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){reject(Error("This browser has no local media storage. Download your file instead."));return;}
    let req;
    try{req=indexedDB.open(DB_NAME,1);}
    catch(err){reject(Error(message(err)));return;}
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:"id"});s.createIndex("createdAt","createdAt");}};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(Error(message(req.error)));
    req.onblocked=()=>reject(Error("Still storage is busy in another tab. Close that tab and retry."));
  });
}
async function transaction(mode,work){
  const db=await open();
  return new Promise((resolve,reject)=>{
    let tx,req,result,completed=false;
    const fail=err=>{if(completed)return;completed=true;db.close();reject(Error(message(err)));};
    try{
      tx=db.transaction(STORE,mode);
      req=work(tx.objectStore(STORE));
      req.onsuccess=()=>{result=req.result;};
      tx.oncomplete=()=>{if(completed)return;completed=true;db.close();resolve(result);};
      tx.onerror=()=>fail(tx.error);
      tx.onabort=()=>fail(tx.error);
    }catch(err){fail(err);}
  });
}
function info(item){return {id:item.id,name:item.name,kind:item.kind,type:item.type,size:item.size,createdAt:item.createdAt};}
export async function listStillMedia(){
  const values=await transaction("readonly",store=>store.getAll());
  return values.map(info).sort((a,b)=>b.createdAt-a.createdAt);
}
export async function getStillMedia(id){
  if(!/^[0-9a-f-]{36}$/i.test(String(id||"")))return null;
  return await transaction("readonly",store=>store.get(id))||null;
}
export async function deleteStillMedia(id){
  if(!/^[0-9a-f-]{36}$/i.test(String(id||"")))throw Error("Invalid Still item.");
  await transaction("readwrite",store=>store.delete(id));
}
export function stillFile(item){
  if(!item?.blob||!item.type||!item.name)throw Error("That saved Still file is unavailable.");
  return new File([item.blob],item.name,{type:item.type,lastModified:item.createdAt||Date.now()});
}
export async function saveStillMedia(input,options={}){
  if(!(input instanceof Blob)||input.size<1)throw Error("Choose a nonempty picture or video.");
  const type=String(input.type||"").split(";")[0].toLowerCase();
  const kind=STILL_IMAGE_TYPES.has(type)?"image":STILL_VIDEO_TYPES.has(type)?"video":null;
  if(!kind)throw Error("Still saves PNG, JPG, WebP, MP4 and WebM files.");
  const cap=kind==="image"?STILL_MAX_IMAGE_BYTES:STILL_MAX_VIDEO_BYTES;
  if(input.size>cap)throw Error(kind==="image"?"Images may be up to 24 MB.":"Recordings may be up to 100 MB.");
  const before=await listStillMedia();
  if(before.length>=MAX_COUNT||before.reduce((total,x)=>total+x.size,0)+input.size>STILL_TOTAL_BYTES)throw Error("Your local Still library is full (40 files or 250 MB). Download and delete items to make room.");
  if(!crypto?.randomUUID)throw Error("A secure browser is required to save local Still media.");
  const ext=type==="image/jpeg"?"jpg":type.split("/")[1];
  const raw=String(options.name||input.name||"still-"+kind+"-"+Date.now()+"."+ext);
  const name=raw.replace(/[\/\\\x00-\x1f]/g,"_").slice(0,100)||"still."+ext;
  const item={id:crypto.randomUUID(),name,kind,type,size:input.size,createdAt:Date.now(),blob:input};
  await transaction("readwrite",store=>store.add(item));
  return info(item);
}
