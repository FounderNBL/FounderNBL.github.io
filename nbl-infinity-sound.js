/* NBL Infinity — temporary sound identity shared by Beans, human Chat and University.
   The MP3 must be published on this SAME website origin at /assets/sounds/nbl-infinity.mp3.
   Browser autoplay/user-gesture rules apply; no push notification claim.
   Original sounds only; this helper does not borrow movie audio. */
(()=>{
"use strict";
const PATH="/assets/sounds/nbl-infinity.mp3";
const CATEGORIES=new Set(["beans","people","university"]);
let audio=null;
let lastPlayed=0;
function enabled(){
  try{return localStorage.getItem("nbl-infinity-muted")!=="true";}
  catch{return true;}
}
function setMuted(muted){
  try{localStorage.setItem("nbl-infinity-muted",String(Boolean(muted)));}
  catch{}
}
function play(category){
  if(!CATEGORIES.has(category)||!enabled())return false;
  // Prevent multiple realtime callbacks/duplicate browser surfaces from chiming together.
  const now=Date.now();
  if(now-lastPlayed<650)return false;
  lastPlayed=now;
  try{
    if(!audio){audio=new Audio(PATH);audio.preload="auto";audio.volume=0.65;}
    audio.pause();
    audio.currentTime=0;
    const pending=audio.play();
    if(pending?.catch)void pending.catch(()=>{}); // missing file or browser autoplay prohibition
    return true;
  }catch{return false;}
}
window.NBLInfinitySound=Object.freeze({play,enabled,setMuted,path:PATH});
})();
