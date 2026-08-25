(()=>{
  if(!document.querySelector('script[data-nbl-portal-loader]')&&!document.querySelector('script[src$="nbl-portal.js"]')){
    const portal=document.createElement('script');
    portal.src='nbl-portal.js';
    portal.defer=true;
    portal.dataset.nblPortalLoader='true';
    document.head.appendChild(portal);
  }

  const asset={
    brand:'NBL-Brand.png?v=08394b14',
    seal:'NBL-New-Official-Seal.png?v=c52ddcff',
    founder:'Founder-seal.png?v=e2f2c5bc',
    books:'NBL-Books.png?v=82ea58bb',
    clothing:'NBL-Clothing.png?v=d4378f3c',
    films:'NBL-Films.png?v=967b49ef',
    music:'NBL-Music.png?v=51ade71f',
    shortVideo:'NBL-Commercial-Short-last.mp4?v=dacadaf1',
    clothesAudio:'NBL%20clothes%20.mp3?v=dfcc9f8b'
  };

  // Replace every visible homepage division mark with the current approved upload.
  const headerMark=document.querySelector('.brand-banner img');
  if(headerMark){headerMark.src=asset.brand;headerMark.alt='New Beansland brand mark';}

  document.querySelectorAll('.world-card').forEach(card=>{
    const title=(card.querySelector('h3')?.textContent||'').toLowerCase();
    const img=card.querySelector('.media img');
    if(!img)return;
    if(title.includes('nbl books')) img.src=asset.books;
    else if(title.includes('the city')) img.src=asset.films;
    else if(title.includes('timmy v')){
      img.src=asset.music;
      card.href='studio/';
      const status=card.querySelector('.status');
      const heading=card.querySelector('h3');
      const copy=card.querySelector('.card-body p');
      const enter=card.querySelector('.enter');
      if(status)status.textContent='Open';
      if(heading)heading.textContent='NBL Studio';
      if(copy)copy.textContent='Music, trailers, commercials and New Beansland studio media — all behind one open door.';
      if(enter)enter.textContent='Enter Studio →';
    }
  });

  document.querySelectorAll('a[href="coming-soon.html?room=timmy-v"]').forEach(link=>{
    link.href='studio/';
    if(link.closest('.nav'))link.textContent='NBL Studio';
  });

  const sealRow=document.querySelectorAll('.seal-row img');
  if(sealRow[0]){sealRow[0].src=asset.seal;sealRow[0].alt='New Beansland official seal';}
  if(sealRow[1]){sealRow[1].src=asset.founder;sealRow[1].alt="Founder's seal";}
  const footerMark=document.querySelector('.footer-mark');
  if(footerMark){footerMark.src=asset.brand;footerMark.alt='New Beansland brand mark';}

  const icon=document.querySelector('link[rel~="icon"]');
  if(icon) icon.href=asset.brand;

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
    card.innerHTML=`<div class="media"><img src="${asset.clothing}" alt="NBL Clothing Co. collection" loading="lazy" decoding="async" width="400" height="300"></div><div class="card-body"><span class="status">Open</span><h3>NBL Clothing Co.</h3><p>Catalog, commercial, statement pieces, and coming-soon drops from New Beansland.</p><span class="enter">Enter the Catalog →</span></div>`;
    grid.appendChild(card);
  }

  const video=document.getElementById('nblCommercialVideo');
  const audio=document.getElementById('nblCommercialAudio');
  const button=document.getElementById('nblCommercialPlay');
  if(!video||!audio||!button)return;

  video.poster=asset.clothing;
  const source=video.querySelector('source');
  if(source&&source.getAttribute('src')!==asset.shortVideo){source.setAttribute('src',asset.shortVideo);video.load();}
  else if(!source&&video.getAttribute('src')!==asset.shortVideo){video.setAttribute('src',asset.shortVideo);video.load();}

  const audioSource=audio.querySelector('source');
  if(audioSource&&audioSource.getAttribute('src')!==asset.clothesAudio){audioSource.setAttribute('src',asset.clothesAudio);audio.load();}

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

  const setLabel=()=>{button.textContent=video.paused?'Play 30-Second Commercial':'Pause Commercial';};
  const resetAd=()=>{
    audio.pause();
    try{video.currentTime=0;}catch(_err){}
    if(audio.readyState>0){try{audio.currentTime=chorusStart;}catch(_err){}}
    setLabel();
  };
  const startAudio=()=>{seekAudio();audio.play().catch(()=>{});};

  button.addEventListener('click',()=>{
    if(video.paused){
      if((video.currentTime||0)>=adDuration-.08){try{video.currentTime=0;}catch(_err){}}
      video.muted=true;
      seekAudio();
      // Start both media elements from the same user gesture for mobile browsers.
      audio.play().catch(()=>{});
      video.play().catch(()=>{});
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
    if((video.currentTime||0)>=adDuration){video.pause();resetAd();}
    else if(!audio.paused&&Math.abs((audio.currentTime||0)-targetTime())>.4)seekAudio();
  });
  video.addEventListener('ended',resetAd);
  audio.addEventListener('timeupdate',()=>{if((audio.currentTime||0)>=chorusEnd)audio.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();audio.pause();}});

  const note=document.querySelector('.nbl-commercial-note');
  if(note)note.textContent='30-second NBL Clothing commercial · Catalog now open';
  setLabel();
})();
