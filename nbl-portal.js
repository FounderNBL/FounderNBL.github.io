(()=>{
  const root=document.documentElement;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const PORTAL_MS=600;
  const CONTACT_EMAIL='founder@newbeansland.org';
  const LEGACY_CONTACT_EMAIL='foundernewbeansland@gmail.com';
  window.NBL_CONTACT_EMAIL=CONTACT_EMAIL;

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

  const PLAYGROUND_RAW='https://raw.githubusercontent.com/FounderNBL/New-Beansland-Playground/main/';
  const PLAYGROUND_CDN='https://cdn.jsdelivr.net/gh/FounderNBL/New-Beansland-Playground@main/';

  const cleanName=value=>{
    if(!value) return '';
    try{
      const url=new URL(value,location.href);
      return decodeURIComponent(url.pathname.split('/').pop()||'');
    }catch{
      return String(value).split('?')[0].split('/').pop()||'';
    }
  };

  const playgroundCdn=value=>{
    if(!value||!value.startsWith(PLAYGROUND_RAW)) return value;
    let relative=value.slice(PLAYGROUND_RAW.length);
    relative=relative.replace(/^NBL-model-front\.jpg(?=\?|$)/,'NBL%20model-front.jpg');
    return PLAYGROUND_CDN+relative;
  };

  function refreshContactEmail(){
    const scope=document.body||document.documentElement;
    if(!scope) return;

    document.querySelectorAll('a[href^="mailto:"]').forEach(link=>{
      const href=link.getAttribute('href')||'';
      if(href.includes(LEGACY_CONTACT_EMAIL)){
        link.setAttribute('href',href.split(LEGACY_CONTACT_EMAIL).join(CONTACT_EMAIL));
      }
      if((link.textContent||'').includes(LEGACY_CONTACT_EMAIL)){
        link.textContent=(link.textContent||'').split(LEGACY_CONTACT_EMAIL).join(CONTACT_EMAIL);
      }
    });

    const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const parent=node.parentElement;
      if(!parent||['SCRIPT','STYLE','TEXTAREA','NOSCRIPT'].includes(parent.tagName)) return;
      if(!(node.nodeValue||'').includes(LEGACY_CONTACT_EMAIL)) return;
      node.nodeValue=(node.nodeValue||'').split(LEGACY_CONTACT_EMAIL).join(CONTACT_EMAIL);
    });
  }

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
      'New_New_homepage.png':ASSET.homepage,
      'NBL-pose-template.png':'NBL-pose-template.png?v=52e5072b',
      'NBL-hat-sweats-outfit.png':'NBL-hat-sweats-outfit.png?v=fc219ae8',
      'NBL-highs.png':'NBL-highs.png?v=8ecf8bfc',
      'NBL model-front.jpg':'NBL-Model-Front.png?v=f50ded9c',
      'NBL-model-front.jpg':'NBL-Model-Front.png?v=f50ded9c'
    };

    document.querySelectorAll('img').forEach(img=>{
      let original=img.getAttribute('src')||'';
      const cdnSource=playgroundCdn(original);
      if(cdnSource!==original){
        img.setAttribute('src',cdnSource);
        original=cdnSource;
      }

      const replacement=directMap[cleanName(original)];
      if(replacement && original!==replacement) img.setAttribute('src',replacement);
    });

    document.querySelectorAll('video[poster]').forEach(video=>{
      const replacement=directMap[cleanName(video.getAttribute('poster'))];
      if(replacement && video.getAttribute('poster')!==replacement) video.setAttribute('poster',replacement);
    });

    document.querySelectorAll('link[rel~="icon"]').forEach(link=>{
      const name=cleanName(link.getAttribute('href'));
      if(['nbl-logo.jpg','nbl-logo.png','nbl-primary-logo.png'].includes(name)) link.setAttribute('href',ASSET.brand);
    });

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

  function activateClothingLiveFixes(){
    if(!/\/clothing\.html$/.test(location.pathname)) return;
    root.classList.add('nbl-clothing-live');

    const audio=document.getElementById('clothingTrack');
    if(audio && cleanName(audio.getAttribute('src'))==='NBL clothes .mp3'){
      audio.setAttribute('src','NBL%20clothes2.mp3?v=ffc7ddb4');
      audio.load();
    }
  }

  function activateIdentityDrop(){
    if(!/\/clothing\.html$/.test(location.pathname)) return;

    const cards=[...document.querySelectorAll('#statements .product')];
    const card=cards.find(item=>(item.querySelector('h3')?.textContent||'').includes('Identity'));
    if(!card) return;

    const heading=card.querySelector('h3');
    if(heading) heading.textContent='Identity T — NBL Clothing Co.™';

    const description=card.querySelector('.product-copy p');
    if(description) description.innerHTML='Identity isn’t something you wear. It’s something you own.<br><br><strong>Black · 2X · $34.99</strong><br>Limited first drop: 4 available.';

    const actions=card.querySelector('.actions');
    if(actions){
      actions.innerHTML='';
      const status=document.createElement('span');
      status.className='status';
      status.textContent='Available Now · $34.99';
      const buy=document.createElement('a');
      buy.className='request-btn';
      buy.href='https://s.newbeansland.org';
      buy.textContent='Buy the Identity T';
      actions.append(status,buy);
    }

    const intro=document.querySelector('main > .section .section-head p:last-child');
    if(intro && intro.textContent.includes('Every item below is a preview')){
      intro.textContent='Most pieces below are previews. The Identity T is available now as the first official NBL Clothing Co.™ drop.';
    }
  }

  function activateLuluDirectBuy(){
    if(!/\/books\.html$/.test(location.pathname)) return;
    if(document.querySelector('[data-nbl-lulu-direct]')) return;

    const bookGrid=document.querySelector('.book-grid');
    if(!bookGrid) return;

    if(!document.querySelector('script[data-nbl-lulu-buy]')){
      const loader=document.createElement('script');
      loader.defer=true;
      loader.src='https://js.lulu.com/lulu-buy.js';
      loader.dataset.nblLuluBuy='true';
      document.head.appendChild(loader);
    }

    const direct=document.createElement('div');
    direct.dataset.nblLuluDirect='true';
    direct.style.margin='0 0 24px';
    direct.style.padding='20px';
    direct.style.border='1px solid rgba(214,161,74,.34)';
    direct.style.borderRadius='14px';
    direct.style.background='linear-gradient(145deg,rgba(11,27,43,.96),rgba(3,11,19,.98))';

    const kicker=document.createElement('p');
    kicker.className='kicker';
    kicker.textContent='Buy Direct';

    const heading=document.createElement('h3');
    heading.style.margin='6px 0 10px';
    heading.style.color='var(--gold-light,#f0c873)';
    heading.textContent='New Beansland™ Books · Lulu Direct';

    const note=document.createElement('p');
    note.style.margin='0 0 16px';
    note.style.color='var(--muted,#cfc3ad)';
    note.style.font='0.92rem/1.5 Arial,sans-serif';
    note.textContent='Buy this print edition directly through New Beansland™. Lulu handles secure checkout, printing, and shipping.';

    const button=document.createElement('lulu-buy-button');
    button.setAttribute('buy-button-id','b3397f16-c591-4571-88f5-d5bdf5082246');
    button.setAttribute('variant','product-showcase');

    direct.append(kicker,heading,note,button);
    bookGrid.before(direct);
  }

  function initMediaPerformance(){
    if(root.dataset.nblMediaOptimized==='true') return;
    root.dataset.nblMediaOptimized='true';

    document.querySelectorAll('img').forEach(img=>{
      if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
      const priority=img.getAttribute('fetchpriority')==='high'||img.classList.contains('hero-media')||Boolean(img.closest('.site-header'));
      if(!priority&&!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
    });

    document.querySelectorAll('video,audio').forEach(media=>{
      const hadAutoplay=media.hasAttribute('autoplay');
      media.removeAttribute('autoplay');
      media.autoplay=false;
      media.pause();
      if(!media.hasAttribute('preload')) media.setAttribute('preload','metadata');
      if(media.tagName==='VIDEO'&&hadAutoplay&&!media.hasAttribute('controls')){
        media.setAttribute('controls','');
      }
    });
  }

  refreshCurrentAssets();
  refreshContactEmail();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{refreshCurrentAssets();refreshContactEmail();applyTrademark();activateClothingLiveFixes();activateIdentityDrop();activateLuluDirectBuy()},{once:true});
  }else{
    refreshContactEmail();
    applyTrademark();
    activateClothingLiveFixes();
    activateIdentityDrop();
    activateLuluDirectBuy();
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
    refreshContactEmail();
    applyTrademark();
    activateClothingLiveFixes();
    activateIdentityDrop();
    activateLuluDirectBuy();
    initMediaPerformance();
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

    window.addEventListener('pageshow',()=>{refreshCurrentAssets();refreshContactEmail();applyTrademark();activateClothingLiveFixes();activateIdentityDrop();activateLuluDirectBuy();hidePortal();});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initPortal,{once:true});
  }else{
    initPortal();
  }
})();
