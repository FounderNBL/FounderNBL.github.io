// Exclusive NBL Music Productions listening companion.
// This is inert until the separate, Founder-approved nbl-music backend has a
// published rights-verified release with a distinct preview rendition.
// Do not add download links, private object paths or payment URLs here.
(()=>{
  "use strict";
  const root=document.getElementById("exclusiveCatalog");
  const list=document.getElementById("exclusiveTrackList");
  const audio=document.getElementById("exclusiveAudio");
  const status=document.getElementById("exclusiveStatus");
  const now=document.getElementById("exclusiveNow");
  if(!root||!list||!audio||!status||!now)return;

  // Public endpoint identifier only, NEVER a privileged Supabase key.
  const ENDPOINT="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-music";
  let currentSession="",lastTick=0,playedSeconds=0,recorded=false,attempted=false;
  async function request(action,data={}){
    const response=await fetch(ENDPOINT,{
      method:"POST",mode:"cors",credentials:"omit",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({action,...data})
    });
    if(!response.ok)throw new Error("music_request_unavailable");
    return response.json();
  }
  function notice(text){status.textContent=text;}
  function render(track){
    const item=document.createElement("button");
    item.type="button";
    item.className="track-row";
    const cover=document.createElement("img");
    cover.alt="";
    if(track.cover&&track.cover.startsWith("https://newbeansland.org/"))cover.src=track.cover;
    const facts=document.createElement("span");facts.className="track-meta";
    const title=document.createElement("strong");title.textContent=track.title;
    const credits=document.createElement("span");
    credits.textContent=track.artist+(track.featuredArtists?" ft. "+track.featuredArtists:"");
    facts.append(title,credits);
    const marker=document.createElement("span");
    marker.className="track-badge";marker.textContent="Listen";
    item.append(cover,facts,marker);
    item.addEventListener("click",async()=>{
      audio.pause();audio.removeAttribute("src");audio.load();
      currentSession="";playedSeconds=0;lastTick=0;recorded=false;attempted=false;
      notice("Preparing your private listening preview…");
      try{
        document.getElementById("audio")?.pause();
        const result=await request("listen_start",{trackId:track.id});
        if(!result.ok||!result.previewOnly||!result.sessionId||!result.streamUrl)
          throw new Error("preview_not_ready");
        currentSession=result.sessionId;
        audio.src=result.streamUrl;
        now.textContent="Now playing: "+track.title+" — "+credits.textContent;
        notice("Listen free. Exclusive downloads are not available for purchase yet.");
        await audio.play();
      }catch{
        currentSession="";
        notice("That preview is unavailable right now. Try another record.");
      }
    });
    return item;
  }
  audio.addEventListener("play",()=>{lastTick=Date.now();});
  audio.addEventListener("pause",()=>{lastTick=0;});
  audio.addEventListener("ended",()=>{lastTick=0;});
  audio.addEventListener("timeupdate",async()=>{
    if(!currentSession||audio.paused||recorded||attempted)return;
    const t=Date.now();
    if(lastTick){
      const elapsed=(t-lastTick)/1000;
      // Ignore huge jumps from background suspension; seeking is not listening.
      if(elapsed>0&&elapsed<=3)playedSeconds+=elapsed;
    }
    lastTick=t;
    if(playedSeconds<30)return;
    attempted=true;
    try{
      const result=await request("listen_count",{sessionId:currentSession});
      recorded=result.ok===true;
      // Count receipt is internal analytics, never a promise of streaming royalties.
    }catch{
      // No automatic retry storm, and no false successful-play claim.
    }
  });
  request("catalog").then(data=>{
    if(!data.ok||!Array.isArray(data.releases)||data.releases.length===0)return;
    for(const track of data.releases)list.appendChild(render(track));
    root.hidden=false;
    notice("Choose a track to listen. Download checkout is not open yet.");
  }).catch(()=>{
    // Fail closed; the free, public City/showcase player above keeps working.
  });
})();
