(()=>{
  const root=document.documentElement;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const PORTAL_MS=600;

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

    window.addEventListener('pageshow',hidePortal);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initPortal,{once:true});
  }else{
    initPortal();
  }
})();
