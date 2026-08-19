(()=>{
  if(!document.querySelector('script[data-nbl-portal-loader]')&&!document.querySelector('script[src$="nbl-portal.js"]')){
    const portal=document.createElement('script');
    portal.src='nbl-portal.js';
    portal.defer=true;
    portal.dataset.nblPortalLoader='true';
    document.head.appendChild(portal);
  }

  const officialMark='NBL-New-Official-Seal.png';

  // Use the newly approved NBL mark in the three homepage positions the Founder identified.
  const headerMark=document.querySelector('.brand-banner img');
  if(headerMark){
    headerMark.src=officialMark;
    headerMark.alt='New Beansland official mark';
  }
  const sealRow=document.querySelectorAll('.seal-row img');
  if(sealRow[0]){
    sealRow[0].src=officialMark;
    sealRow[0].alt='New Beansland official mark';
  }
  if(sealRow[1]){
    sealRow[1].src='Founder-seal.png';
    sealRow[1].alt="Founder's seal";
  }
  const footerMark=document.querySelector('.footer-mark');
  if(footerMark){
    footerMark.src=officialMark;
    footerMark.alt='New Beansland official mark';
  }

  // Keep the destination grid as a clean 3 x 2 layout on larger screens and fill the sixth door with Clothing.
  if(!document.getElementById('nbl-home-catalog-style')){
    const style=document.createElement('style');
    style.id='nbl-home-catalog-style';
    style.textContent='@media (min-width:801px){.world-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}.nbl-clothing-card .media img{object-fit:cover;object-position:center 38%}.nbl-clothing-card .status{color:#f0c56f}';
    document.head.appendChild(style);
  }

  const grid=document.querySelector('.world-grid');
  if(grid&&!document.getElementById('nbl-clothing-card')){
    const card=document.createElement('a');
    card.id='nbl-clothing-card';
    card.className='world-card nbl-clothing-card';
    card.href='clothing.html';
    card.setAttribute('aria-label','Enter the NBL Clothing Co. catalog');
    card.innerHTML='<div class="media"><img src="NBL-Clothing.png" alt="NBL Clothing Co. collection" loading="lazy" decoding="async" width="400" height="300"></div><div class="card-body"><span class="status">Open</span><h3>NBL Clothing Co.</h3><p>Catalog, commercial, statement pieces, and coming-soon drops from New Beansland.</p><span class="enter">Enter the Catalog →</span></div>';
    grid.appendChild(card);
  }

  const video=document.getElementById('nblCommercialVideo');
  const audio=document.getElementById('nblCommercialAudio');
  const button=document.getElementById('nblCommercialPlay');
  if(!video||!audio||!button)return;

  // The live ad now uses the approved short commercial instead of the longer cut.
  const shortVideo='NBL-Commercial-Short-last.mp4';
  const source=video.querySelector('source');
  if(source){
    if(source.getAttribute('src')!==shortVideo){
      source.setAttribute('src',shortVideo);
      video.load();
    }
  }else if(video.getAttribute('src')!==shortVideo){
    video.setAttribute('src',shortVideo);
    video.load();
  }

  const chorusStart=42;
  const adDuration=30;
  const chorusEnd=chorusStart+adDuration;
  video.dataset.chorusStart=String(chorusStart);
  video.dataset.adDuration=String(adDuration);

  const targetTime=()=>chorusStart+Math.min(adDuration,Math.max(0,video.currentTime||0));
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

  const setLabel=()=>{
    button.textContent=video.paused?'Play 30-Second Commercial':'Pause Commercial';
  };

  const resetAd=()=>{
    audio.pause();
    try{video.currentTime=0;}catch(_err){}
    if(audio.readyState>0){try{audio.currentTime=chorusStart;}catch(_err){}}
    setLabel();
  };

  const startAudio=()=>{
    seekAudio();
    audio.play().catch(()=>{});
  };

  button.addEventListener('click',()=>{
    if(video.paused){
      if((video.currentTime||0)>=adDuration-.08){
        try{video.currentTime=0;}catch(_err){}
      }
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
  video.addEventListener('timeupdate',()=>{
    if((video.currentTime||0)>=adDuration){
      video.pause();
      resetAd();
    }
  });
  video.addEventListener('ended',resetAd);
  audio.addEventListener('timeupdate',()=>{
    if((audio.currentTime||0)>=chorusEnd)audio.pause();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();audio.pause();}});

  const note=document.querySelector('.nbl-commercial-note');
  if(note)note.textContent='30-second NBL Clothing commercial · Catalog now open';
  setLabel();
})();
