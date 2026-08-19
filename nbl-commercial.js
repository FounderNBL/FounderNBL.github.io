(()=>{
  if(!document.querySelector('script[data-nbl-portal-loader]')){
    const portal=document.createElement('script');
    portal.src='nbl-portal.js';
    portal.defer=true;
    portal.dataset.nblPortalLoader='true';
    document.head.appendChild(portal);
  }

  const video=document.getElementById('nblCommercialVideo');
  const audio=document.getElementById('nblCommercialAudio');
  const button=document.getElementById('nblCommercialPlay');
  if(!video||!audio||!button)return;

  const chorusStart=Number(video.dataset.chorusStart||42);
  const targetTime=()=>chorusStart+Math.max(0,video.currentTime||0);
  const seekAudio=()=>{
    const target=targetTime();
    if(!Number.isFinite(target))return;
    if(audio.readyState>0){
      try{audio.currentTime=target;}catch(_err){}
    }else{
      audio.addEventListener('loadedmetadata',()=>{
        try{audio.currentTime=targetTime();}catch(_err){}
      },{once:true});
    }
    audio.playbackRate=video.playbackRate||1;
  };
  const setLabel=()=>{button.textContent=video.paused?'Play Commercial + Chorus':'Pause Commercial';};
  const startAudio=()=>{seekAudio();audio.play().catch(()=>{});};

  button.addEventListener('click',()=>{
    if(video.paused){
      video.muted=true;
      seekAudio();
      video.play().catch(()=>{});
      audio.play().catch(()=>{});
    }else{
      video.pause();
      audio.pause();
    }
    setLabel();
  });

  video.addEventListener('play',()=>{startAudio();setLabel();});
  video.addEventListener('pause',()=>{audio.pause();setLabel();});
  video.addEventListener('seeking',seekAudio);
  video.addEventListener('ratechange',()=>{audio.playbackRate=video.playbackRate||1;});
  video.addEventListener('ended',()=>{
    audio.pause();
    if(audio.readyState>0){try{audio.currentTime=chorusStart;}catch(_err){}}
    setLabel();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();audio.pause();}});
  setLabel();
})();
