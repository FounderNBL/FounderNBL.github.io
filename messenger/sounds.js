/* NBL Messenger sounds: each signed-in account chooses its own in-app alert.
   Add later sounds by uploading their original audio under /assets/sounds/
   and adding an entry to /messenger/sounds.json. Background OS notification
   audio is device-managed; service workers cannot play an MP3. */
(()=>{
"use strict";
const FALLBACK={id:"infinity",name:"NBL Infinity ♾️",url:"/assets/sounds/nbl-infinity.mp3"};
const VALID_ID=/^[a-z0-9][a-z0-9_-]{0,39}$/;
const VALID_FILE=/^\/assets\/sounds\/[A-Za-z0-9_-]{1,80}\.(?:mp3|ogg|wav)$/;
let catalog=[FALLBACK],owner=null,selected="infinity",muted=false,audio=null,lastPlayed=0;
function key(id){return "nbl-messenger-sounds-v1:"+id;}
function valid(entry){
 return entry&&typeof entry.id==="string"&&VALID_ID.test(entry.id)&&
 typeof entry.name==="string"&&entry.name.length>=1&&entry.name.length<=60&&
 typeof entry.url==="string"&&VALID_FILE.test(entry.url);
}
async function loadCatalog(){
 try{
  const res=await fetch("/messenger/sounds.json?v=1",{credentials:"same-origin",cache:"no-store"});
  if(!res.ok)throw Error();
  const json=await res.json();
  if(!Array.isArray(json.sounds))throw Error();
  const ids=new Set(["infinity"]);
  const additions=[];
  for(const entry of json.sounds.slice(0,30)){
   if(!valid(entry)||ids.has(entry.id))continue;
   ids.add(entry.id);additions.push({id:entry.id,name:entry.name,url:entry.url});
  }
  catalog=[FALLBACK,...additions];
 }catch{catalog=[FALLBACK];}
 // Don't keep a removed/custom file selected after a library update.
 if(!catalog.some(x=>x.id===selected))selected="infinity";
 return options();
}
function setUser(id){
 owner=typeof id==="string"&&/^user_[A-Za-z0-9_-]{3,100}$/.test(id)?id:null;
 selected="infinity";muted=false;audio?.pause();audio=null;
 if(!owner)return;
 try{
  const saved=JSON.parse(localStorage.getItem(key(owner))||"null");
  if(typeof saved?.selected==="string"&&VALID_ID.test(saved.selected))selected=saved.selected;
  if(typeof saved?.muted==="boolean")muted=saved.muted;
  else muted=window.NBLInfinitySound?.enabled?.()===false;
 }catch{muted=window.NBLInfinitySound?.enabled?.()===false;}
}
function save(){
 if(!owner)return;
 try{localStorage.setItem(key(owner),JSON.stringify({selected,muted}));}catch{}
}
function options(){return catalog.map(x=>({id:x.id,name:x.name}));}
function getSettings(){return {selected,muted};}
function choose(id){
 if(!owner||!catalog.some(x=>x.id===id))return false;
 if(selected!==id){selected=id;audio?.pause();audio=null;}
 save();return true;
}
function setMuted(value){if(!owner)return;muted=Boolean(value);save();if(muted)audio?.pause();}
function play(kind,{preview=false}={}){
 if(!owner||(!preview&&muted)||!["message","call"].includes(kind))return false;
 const current=catalog.find(x=>x.id===selected);
 if(!current)return false;
 const now=Date.now();
 if(!preview&&now-lastPlayed<700)return false;
 lastPlayed=now;
 try{
  if(!audio||audio.src!==new URL(current.url,location.origin).href){
   audio=new Audio(current.url);audio.preload="auto";audio.volume=0.65;
  }
  audio.pause();audio.currentTime=0;
  const task=audio.play();
  if(task?.catch)void task.catch(()=>{}); // Browser autoplay may block non-click playback.
  return true;
 }catch{return false;}
}
window.NBLMessengerSounds=Object.freeze({
 loadCatalog,setUser,options,getSettings,choose,setMuted,
 play,preview:()=>play("message",{preview:true})
});
})();