(()=>{
  const root=document.documentElement;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const PORTAL_MS=600;

  /*
    Canonical live asset resolver.
    The Founder intentionally deleted/re-uploaded several files with the same names.
    Version tokens below force browsers/CDNs to request the current blobs instead of
    continuing to show a stale cached image from an older upload.
  */
  const ASSET={
    brand:'NBL-Brand.png?v=08394b14',
    seal:'NBL-New-Official-Seal.png?v=c52ddcff',
    founder:'Founder-seal.png?v=e2f2c5bc',
    books:'NBL-Books.png?v=82ea58bb',
    clothing:'NBL-Clothing.png?v=d4378f3c',
    films:'NBL-Films.png?v=967b49ef',
    music:'NBL-Music.png?v=51ade71f',
    studios:'NBL-Studios.png?v=2b993fb1',
    homepage:'New_New_homepage.png?v=4b17e759',
    doctorFront:'doc-rock-ogfront-cover.png?v=29d94c6f',
    doctorBack:'doc-rock-ogback-cover.png?v=8820a16c'
  };

  const cleanName=value=>{
    if(!value) return '';
    try{
      const url=new URL(value,location.href);
      return decodeURIComponent(url.pathname.split('/').pop()||'');
    }catch{
      return String(value).split('?')[0].split('/').pop()||'';
    }
  };

  function applyTrademark(){
    const mark=value=>String(value)
      .replace(/NEW BEANSLAND(?!™)/g,'NEW BEANSLAND™')
      .replace(/New Beansland(?!™)/g,'New Beansland™');

    if(document.title) document.title=mark(document.title);

    const walker=document.createTreeWalker(document.body||document.documentElement,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const parent=node.parentElement;
      if(!parent||['SCRIPT','STYLE','TEXTAREA','NOSCRIPT'].includes(parent.tagName)) return;
      if(!/New Beansland|NEW BEANSLAND/.test(node.nodeValue||'')) return;
      node.nodeValue=mark(node.nodeValue);
    });

    document.querySelectorAll('img[alt]').forEach(img=>{
      const next=mark(img.getAttribute('alt')||'');
      if(next!==img.getAttribute('alt')) img.setAttribute('alt',next);
    });
  }

  function refreshCurrentAssets(){
    const directMap={
      'nbl-logo.jpg':ASSET.brand,
      'nbl-logo.png':ASSET.brand,
      'nbl-primary-logo.png':ASSET.brand,
      'nbl-official-seal.png':ASSET.seal,
      'official-nbl-emblem.png':ASSET.brand,
      'nbl-books-imprint.png':ASSET.books,
      'NBL-Books.png':ASSET.books,
      'NBL-Clothing.png':ASSET.clothing,
      'NBL-Films.png':ASSET.films,
      'NBL-Music.png':ASSET.music,
      'NBL-Studios.png':ASSET.studios,
      'Founder-seal.png':ASSET.founder,
      'doctor-rocketship-front.png':ASSET.doctorFront,
      'doctor-rocketship-standard-back.png':ASSET.doctorBack,
      'new-beansland-homepage.png':ASSET.homepage,
      'New_New_homepage.png':ASSET.homepage
    };

    document.querySelectorAll('img').forEach(img=>{
      const replacement=directMap[cleanName(img.getAttribute('src'))];
      if(replacement && img.getAttribute('src')!==replacement) img.setAttribute('src',replacement);
    });

    document.querySelectorAll('video[poster]').forEach(video=>{
      const replacement=directMap[cleanName(video.getAttribute('poster'))];
      if(replacement && video.getAttribute('poster')!==replacement) video.setAttribute('poster',replacement);
    });

    document.querySelectorAll('link[rel~="icon"]').forEach(link=>{
      const name=cleanName(link.getAttribute('href'));
      if(['nbl-logo.jpg','nbl-logo.png','nbl-primary-logo.png'].includes(name)) link.setAttribute('href',ASSET.brand);
    });

    /* Homepage destination art: always prefer the latest approved division marks. */
    document.querySelectorAll('.world-card').forEach(card=>{
      const title=(card.querySelector('h3')?.textContent||'').trim().toLowerCase();
      const image=card.querySelector('.media img');
      if(!image) return;
      if(title.includes('nbl books')) image.src=ASSET.books;
      else if(title==='the city'||title.includes('the city')) image.src=ASSET.films;
      else if(title.includes('timmy v')) image.src=ASSET.music;
      else if(title.includes('clothing')) image.src=ASSET.clothing;
    });

    const banner=document.querySelector('.brand-banner img');
    if(banner) banner.src=ASSET.brand;
    const footer=document.querySelector('.footer-mark');
    if(footer) footer.src=ASSET.brand;
    const seals=document.querySelectorAll('.seal-row img');
    if(seals[0]) seals[0].src=ASSET.seal;
    if(seals[1]) seals[1].src=ASSET.founder;
  }

  /* Run immediately and once more after DOM construction for late markup. */
  refreshCurrentAssets();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{refreshCurrentAssets();applyTrademark()},{once:true});
  }else{
    applyTrademark();
  }

  if(!document.querySelector('link[data-nbl-portal-style]')){
    const style=document.createElement('link');
    style.rel='stylesheet';
    style.href='nbl-portal.css';
    style.dataset.nblPortalStyle='true';
    document.head.appendChild(style);
  }

  function syncNBLPortalEnvironment(){
    const currentHour=new Date().getHours();
    const isNight=currentHour>=18||currentHour<6;
    root.classList.toggle('nbl-night',isNight);
    root.classList.toggle('nbl-day',!isNight);
    root.dataset.nblEnvironment=isNight?'night':'day';
  }

  syncNBLPortalEnvironment();
  window.setInterval(syncNBLPortalEnvironment,60000);
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) syncNBLPortalEnvironment();
  });

  function initPortal(){
    refreshCurrentAssets();
    applyTrademark();
    let gateMask=document.getElementById('nbl-gate-mask');
    if(!gateMask){
      gateMask=document.createElement('div');
      gateMask.id='nbl-gate-mask';
      gateMask.className='nbl-portal-overlay portal-visible';
      gateMask.setAttribute('aria-hidden','true');
      document.body.prepend(gateMask);
    }

    const hidePortal=()=>{
      window.requestAnimationFrame(()=>{
        window.requestAnimationFrame(()=>{
          gateMask.classList.remove('portal-visible');
          gateMask.classList.add('portal-hidden');
        });
      });
    };

    hidePortal();

    document.addEventListener('click',event=>{
      const targetLink=event.target.closest('a');
      if(!targetLink||!targetLink.href) return;
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return;
      if(targetLink.target==='_blank'||targetLink.hasAttribute('download')) return;

      let destination;
      try{destination=new URL(targetLink.href,window.location.href)}catch{return;}
      if(!['http:','https:'].includes(destination.protocol)) return;
      if(destination.origin!==window.location.origin) return;

      const sameDocument=destination.pathname===window.location.pathname&&destination.search===window.location.search;
      if(sameDocument&&destination.hash) return;
      if(destination.href===window.location.href) return;

      event.preventDefault();
      gateMask.classList.remove('portal-hidden');
      gateMask.classList.add('portal-visible');

      window.setTimeout(()=>{
        window.location.assign(destination.href);
      },reduceMotion.matches?0:PORTAL_MS);
    });

    window.addEventListener('pageshow',()=>{refreshCurrentAssets();applyTrademark();hidePortal();});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initPortal,{once:true});
  }else{
    initPortal();
  }
})();
