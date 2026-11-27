// No video URL is assigned until a visitor explicitly activates a cover.
(()=> {
  const buttons=Array.from(document.querySelectorAll("[data-nbl-live-cover]"));
  if(!buttons.length)return;
  let active=null, generation=0;
  const status=(button,playing,label)=>{
    button.setAttribute("aria-pressed",String(playing));
    button.setAttribute("aria-label",(playing?"Stop animation of ":"Animate ")+button.dataset.title+" cover");
    button.querySelector(".nbl-cover-hint").textContent=label;
  };
  function stop(button=active){
    if(!button)return;
    if(button===active){active=null;generation++;}
    const video=button.querySelector("video"),image=button.querySelector("img");
    video.pause();video.removeAttribute("src");video.load();
    video.hidden=true;image.hidden=false;status(button,false,"▶ Touch to animate");
  }
  for(const button of buttons){
    const video=button.querySelector("video"),image=button.querySelector("img");
    button.addEventListener("click",()=>{
      if(active===button){stop();return;}
      stop();active=button;const request=++generation;
      status(button,true,"Loading… · Tap to stop");
      video.muted=true;video.src=button.dataset.video;
      // Remain on the original still until the browser actually plays video.
      video.play().then(()=>{
        if(active!==button||request!==generation)return;
        video.hidden=false;image.hidden=true;status(button,true,"■ Tap to stop");
      }).catch(()=>{
        if(active!==button||request!==generation)return;
        stop(button);status(button,false,"▶ Tap to retry");
      });
    });
    video.addEventListener("error",()=>{if(active===button){stop(button);status(button,false,"▶ Tap to retry");}});
  }
  document.addEventListener("click",event=>{if(active&&!active.contains(event.target))stop();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
  window.addEventListener("pagehide",()=>stop());
  document.addEventListener("keydown",event=>{if(event.key==="Escape")stop();});
})();
