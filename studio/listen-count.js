// NBL Music Productions first-party listening receipt for existing PUBLIC songs.
// Analytics is optional: playback and existing free downloads work even if this
// separately deployed endpoint is unavailable. No external ad-tracking SDK.
(()=>{
  "use strict";
  const audio=document.getElementById("audio");
  const tracks=Array.isArray(window.NBL_TRACKS)?window.NBL_TRACKS:[];
  if(!audio||!tracks.length)return;
  const ENDPOINT="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-music";
  let activeId="",sessionId="",lastTick=0,listened=0,requested=false,counted=false,claimPending=false;
  function selected(){
    const src=audio.currentSrc||audio.src;
    if(!src)return "";
    const item=tracks.find(t=>t.audio&&new URL(t.audio,location.href).href===src);
    return item?.id||"";
  }
  function reset(){
    activeId=selected();sessionId="";lastTick=0;listened=0;
    requested=false;counted=false;claimPending=false;
  }
  async function send(action,data={}){
    const response=await fetch(ENDPOINT,{
      method:"POST",mode:"cors",credentials:"omit",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({action,...data})
    });
    if(!response.ok)throw new Error("music_analytics_unavailable");
    return response.json();
  }
  audio.addEventListener("loadedmetadata",reset);
  audio.addEventListener("playing",()=>{
    const id=selected();
    if(!id)return;
    if(id!==activeId)reset();
    lastTick=Date.now();
    if(requested)return;
    requested=true;
    send("public_listen_start",{trackId:id}).then(result=>{
      if(result.ok&&activeId===id&&result.sessionId)sessionId=result.sessionId;
    }).catch(()=>{
      // Silent analytics failure: the free soundtrack player must keep working.
    });
  });
  audio.addEventListener("pause",()=>{lastTick=0;});
  audio.addEventListener("ended",()=>{lastTick=0;});
  audio.addEventListener("timeupdate",()=>{
    if(audio.paused||!activeId||counted||claimPending)return;
    const now=Date.now();
    if(lastTick){
      const seconds=(now-lastTick)/1000;
      if(seconds>0&&seconds<=3)listened+=seconds;
    }
    lastTick=now;
    if(listened<30||!sessionId)return;
    claimPending=true;
    send("listen_count",{sessionId}).then(result=>{
      counted=result.ok===true;
    }).catch(()=>{
      // Never fabricate a counted listen. Retry is not automatic.
    });
  });
})();
