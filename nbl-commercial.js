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
    founder:'Founders-seal.png?v=be363e50',
    books:'NBL-Books.png?v=82ea58bb',
    clothing:'NBL-Clothing.png?v=d4378f3c',
    films:'NBL-Films.png?v=967b49ef',
    music:'NBL-Music.png?v=51ade71f',
    masterCommercial:'Identity%20isn%27t%20something%20you%20wear.mp4'
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
  const button=document.getElementById('nblCommercialPlay');
  if(video&&button){
    video.poster=asset.clothing;
    const source=video.querySelector('source');
    if(source&&source.getAttribute('src')!==asset.masterCommercial){
      source.setAttribute('src',asset.masterCommercial);
      video.load();
    }else if(!source&&video.getAttribute('src')!==asset.masterCommercial){
      video.setAttribute('src',asset.masterCommercial);
      video.load();
    }
    video.muted=false;
    video.removeAttribute('muted');
    const setLabel=()=>{button.textContent=video.paused?'Play Commercial':'Pause Commercial';};
    button.addEventListener('click',()=>{if(video.paused) video.play().catch(()=>{}); else video.pause();});
    video.addEventListener('play',setLabel);
    video.addEventListener('pause',setLabel);
    video.addEventListener('ended',setLabel);
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&!video.paused)video.pause();});
    const note=document.querySelector('.nbl-commercial-note');
    if(note)note.textContent='Finished NBL Clothing commercial · First drop now open';
    setLabel();
  }

  // Rank the homepage doors by what is actually open and useful now.
  const doorGrid=document.querySelector('.world-grid');
  if(doorGrid){
    const cards=[...doorGrid.querySelectorAll('.world-card')];
    const rank=card=>{
      const t=(card.querySelector('h3')?.textContent||'').toLowerCase();
      if(t.includes('university')) return 1;
      if(t.includes('books')) return 2;
      if(t.includes('clothing')) return 3;
      if(t.includes('city')) return 4;
      if(t.includes('studio')||t.includes('timmy')) return 5;
      if(t.includes('founder')) return 6;
      return 99;
    };
    cards.sort((a,b)=>rank(a)-rank(b)).forEach(card=>doorGrid.appendChild(card));
  }
})();
