(()=>{
  const video=document.getElementById('nblCommercialVideo');
  const audio=document.getElementById('nblCommercialAudio');
  const button=document.getElementById('nblCommercialPlay');
  if(!video||!audio||!button)return;

  const chorusStart=Number(video.dataset.chorusStart||42);
  const syncAudio=()=>{
    const target=chorusStart+Math.max(0,video.currentTime||0);
    if(Number.isFinite(target))audio.currentTime=target;
    audio.playbackRate=video.playbackRate||1;
  };
  const setLabel=()=>{button.textContent=video.paused?'Play Commercial + Chorus':'Pause Commercial';};
  const startAudio=()=>{syncAudio();audio.play().catch(()=>{});};

  button.addEventListener('click',()=>{
    if(video.paused){
      video.muted=true;
      syncAudio();
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
  video.addEventListener('seeking',syncAudio);
  video.addEventListener('ratechange',()=>{audio.playbackRate=video.playbackRate||1;});
  video.addEventListener('ended',()=>{audio.pause();audio.currentTime=chorusStart;setLabel();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();audio.pause();}});
  setLabel();
})();
