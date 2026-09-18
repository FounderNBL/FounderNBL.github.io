(()=>{
  "use strict";
  const path=(location.pathname||"/").replace(/\/+/g,"/");
  const room=(()=>{
    if(path==="/"||/\/index\.html$/.test(path)||/\/home\.html$/.test(path)) return {label:"Stories · Questions · Worlds",key:"home"};
    if(/\/university(?:\.html)?$/.test(path)||/\/verify-credential\.html$/.test(path)||/\/university-thank-you\.html$/.test(path)) return {label:"New Beansland University",key:"university"};
    if(/\/books\.html$/.test(path)||/\/people-zoo/.test(path)||/\/doctor-rocketship/.test(path)) return {label:"NBL Books",key:"books"};
    if(/\/clothing\.html$/.test(path)) return {label:"NBL Clothing Co.",key:"clothing"};
    if(/\/stories\.html$/.test(path)) return {label:"TV & Film",key:"stories"};
    if(/\/studio\/?(?:index\.html)?$/.test(path)) return {label:"NBL Studio",key:"studio"};
    if(/\/founder-office\.html$/.test(path)) return {label:"Founder’s Office",key:"office"};
    if(/\/about\.html$/.test(path)||/\/jamel-hawkins\.html$/.test(path)) return {label:"About NBL",key:"about"};
    if(/\/privacy\.html$/.test(path)||/\/terms\.html$/.test(path)||/\/account-deletion\.html$/.test(path)||/\/nbl-chat-/.test(path)) return {label:"NBL Chat Legal",key:"legal"};
    return {label:"Stories · Questions · Worlds",key:""};
  })();

  const nav=[
    ["home","Home","/",false],
    ["university","University","/university.html",false],
    ["books","Books","/books.html",false],
    ["clothing","Clothing","/clothing.html",false],
    ["stories","TV & Film","/stories.html",false],
    ["studio","Studio","/studio/",false],
    ["office","Founder’s Office","/founder-office.html",false],
    ["about","About NBL","/about.html",false],
    ["","YouTube","https://www.youtube.com/@FounderNBL",true],
    ["","Instagram","https://www.instagram.com/newbeansland?igsi=MXFobHBhNG9tOXptZw==",true],
    ["","X","https://x.com/FounderNBL",true],
    ["","Contact","mailto:founder@newbeansland.org",false]
  ];

  const NBL_ACCOUNT_API="https://nbl-chat.replit.app";
  const NBL_CLERK_CONFIG=`${NBL_ACCOUNT_API}/api/config/clerk`;
  const NBL_ACCOUNT_PORTAL="https://accounts.newbeansland.org";
  let nblClerkPromise=null;
  let nblClerk=null;

  const accountPortalUrl=(page="/sign-in")=>{
    const redirectUrl=encodeURIComponent(location.href);
    return `${NBL_ACCOUNT_PORTAL}${page}?redirect_url=${redirectUrl}`;
  };

  const loadExternalScript=(src,attributes={})=>new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(script=>script.src===src);
    if(existing){
      if(existing.dataset.nblLoaded==="true") return resolve();
      existing.addEventListener("load",()=>resolve(),{once:true});
      existing.addEventListener("error",()=>reject(new Error("Authentication service failed to load.")),{once:true});
      return;
    }
    const script=document.createElement("script");
    script.src=src;
    script.async=true;
    Object.entries(attributes).forEach(([key,value])=>script.setAttribute(key,value));
    script.addEventListener("load",()=>{
      script.dataset.nblLoaded="true";
      resolve();
    },{once:true});
    script.addEventListener("error",()=>reject(new Error("Authentication service failed to load.")),{once:true});
    document.head.appendChild(script);
  });

  const decodeClerkDomain=publishableKey=>{
    const encoded=(publishableKey.split("_")[2]||"").replace(/-/g,"+").replace(/_/g,"/");
    const padded=encoded.padEnd(Math.ceil(encoded.length/4)*4,"=");
    return atob(padded).replace(/\$/,"");
  };

  const getNblClerk=()=>{
    if(nblClerk) return Promise.resolve(nblClerk);
    if(nblClerkPromise) return nblClerkPromise;
    nblClerkPromise=(async()=>{
      const response=await fetch(NBL_CLERK_CONFIG,{
        method:"GET",
        headers:{Accept:"application/json"},
        cache:"no-store",
        credentials:"omit"
      });
      if(!response.ok) throw new Error("NBL account connection is temporarily unavailable.");
      const payload=await response.json();
      const publishableKey=typeof payload.publishableKey==="string"?payload.publishableKey.trim():"";
      if(!publishableKey.startsWith("pk_live_")) throw new Error("NBL account connection is not configured for production.");
      const clerkDomain=decodeClerkDomain(publishableKey);
      if(!clerkDomain) throw new Error("NBL account connection is unavailable.");

      await loadExternalScript(
        `https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,
        {crossorigin:"anonymous","data-clerk-publishable-key":publishableKey}
      );

      if(!window.Clerk) throw new Error("NBL account connection failed to initialize.");
      await window.Clerk.load();
      nblClerk=window.Clerk;
      return nblClerk;
    })().catch(error=>{
      nblClerkPromise=null;
      throw error;
    });
    return nblClerkPromise;
  };

  const getUniversityPanel=()=>{
    if(room.key!=="university") return null;
    let panel=document.querySelector(".nbl-connected-account");
    if(panel) return panel;
    const main=document.querySelector("main");
    if(!main) return null;
    panel=document.createElement("section");
    panel.className="nbl-connected-account";
    panel.setAttribute("aria-labelledby","nbl-connected-account-title");
    panel.innerHTML=`
      <div class="nbl-connected-account-inner">
        <p class="nbl-connected-account-kicker">Optional connected account</p>
        <h2 id="nbl-connected-account-title">Use the same NBL account here and in NBL Chat.</h2>
        <p>Browsing the website, reading about the University, and using the normal checkout do not require an account. Sign in only if you want your University access to follow the same identity into NBL Chat.</p>
        <div class="nbl-connected-account-actions">
          <button type="button" data-nbl-panel-signin>Sign in / Create account</button>
          <button type="button" data-nbl-panel-request hidden>Request University access</button>
        </div>
        <p class="nbl-connected-account-status" data-nbl-panel-status>Account connection is optional.</p>
        <small>A University access request does not purchase or enroll you in a course. Founder approval and the existing manual course process remain unchanged.</small>
      </div>`;
    const hero=main.querySelector(".hero");
    if(hero) hero.insertAdjacentElement("afterend",panel);
    else main.prepend(panel);
    return panel;
  };

  const readUniversityAccess=async clerk=>{
    const panel=getUniversityPanel();
    if(!panel||!clerk?.isSignedIn||!clerk.session) return;
    const statusEl=panel.querySelector("[data-nbl-panel-status]");
    const requestButton=panel.querySelector("[data-nbl-panel-request]");
    try{
      statusEl.textContent="Checking connected University access…";
      const token=await clerk.session.getToken();
      const response=await fetch(`${NBL_ACCOUNT_API}/api/university/exam-prep/access`,{
        headers:{Accept:"application/json",Authorization:`Bearer ${token}`},
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(payload.message||"University access could not be checked.");
      const status=payload?.access?.status||"none";
      requestButton.hidden=!["none","revoked"].includes(status);
      if(status==="approved") statusEl.textContent="Account connected. University access is approved and follows this same account into NBL Chat.";
      else if(status==="pending") statusEl.textContent="Account connected. University access is pending Founder approval.";
      else if(status==="revoked") statusEl.textContent="Account connected. University access is not currently active.";
      else statusEl.textContent="Account connected. University access has not been requested.";
    }catch(error){
      requestButton.hidden=true;
      statusEl.textContent=error?.message||"University access is temporarily unavailable.";
    }
  };

  const setupNblAccountUi=header=>{
    const accountButton=header.querySelector(".nbl-world-account");
    const userHost=header.querySelector(".nbl-world-user");
    const panel=getUniversityPanel();
    const panelSignIn=panel?.querySelector("[data-nbl-panel-signin]");
    const panelRequest=panel?.querySelector("[data-nbl-panel-request]");
    const panelStatus=panel?.querySelector("[data-nbl-panel-status]");
    let clerk=null;

    const render=()=>{
      userHost.hidden=true;
      userHost.replaceChildren();
      accountButton.hidden=false;
      accountButton.disabled=false;
      if(!clerk) return;
      if(clerk.isSignedIn){
        accountButton.textContent="Account";
        accountButton.title="Manage your NBL account";
        if(panelSignIn) panelSignIn.hidden=true;
        void readUniversityAccess(clerk);
      }else{
        accountButton.textContent="Sign in / Create account";
        accountButton.title="";
        if(panelSignIn){
          panelSignIn.hidden=false;
          panelSignIn.disabled=false;
          panelSignIn.textContent="Sign in / Create account";
        }
        if(panelRequest) panelRequest.hidden=true;
        if(panelStatus) panelStatus.textContent="Account connection is optional.";
      }
    };

    const openAccount=()=>{
      location.href=accountPortalUrl(clerk?.isSignedIn?"/user":"/sign-in");
    };

    accountButton.addEventListener("click",openAccount);
    panelSignIn?.addEventListener("click",()=>{ location.href=accountPortalUrl("/sign-in"); });

    panelRequest?.addEventListener("click",async()=>{
      if(!clerk?.isSignedIn||!clerk.session) return;
      panelRequest.disabled=true;
      const original=panelRequest.textContent;
      panelRequest.textContent="Requesting…";
      try{
        const token=await clerk.session.getToken();
        const response=await fetch(`${NBL_ACCOUNT_API}/api/university/exam-prep/access/request`,{
          method:"POST",
          headers:{Accept:"application/json",Authorization:`Bearer ${token}`}
        });
        const payload=await response.json().catch(()=>({}));
        if(!response.ok) throw new Error(payload.message||"University access request failed.");
        if(panelStatus) panelStatus.textContent=payload?.access?.status==="approved"
          ?"Account connected. University access is already approved."
          :"Account connected. University access request is pending Founder approval.";
        panelRequest.hidden=true;
      }catch(error){
        if(panelStatus) panelStatus.textContent=error?.message||"University access request is temporarily unavailable.";
      }finally{
        panelRequest.disabled=false;
        panelRequest.textContent=original;
      }
    });

    void getNblClerk().then(loaded=>{
      clerk=loaded;
      clerk.addListener?.(render);
      render();
    }).catch(()=>{
      if(panelStatus) panelStatus.textContent="Account connection is optional. Sign in when you want to connect this site with NBL Chat.";
    });
  };

  document.body.dataset.nblRoom=room.key||"other";

  if(!document.querySelector('link[rel="manifest"]')){
    const manifest=document.createElement("link");
    manifest.rel="manifest";
    manifest.href="/site.webmanifest";
    document.head.appendChild(manifest);
  }
  if(!document.querySelector('link[rel="apple-touch-icon"]')){
    const touch=document.createElement("link");
    touch.rel="apple-touch-icon";
    touch.href="/NBL-New-Official-Seal.png";
    document.head.appendChild(touch);
  }
  if(!document.getElementById("nbl-world-jsonld")){
    const jsonld=document.createElement("script");
    jsonld.id="nbl-world-jsonld";
    jsonld.type="application/ld+json";
    jsonld.textContent=JSON.stringify({
      "@context":"https://schema.org",
      "@graph":[
        {
          "@type":"Organization",
          "@id":"https://newbeansland.org/#organization",
          "name":"New Beansland",
          "alternateName":["NBL","New Beansland™","NBL™"],
          "url":"https://newbeansland.org/",
          "logo":"https://newbeansland.org/NBL-New-Official-Seal.png",
          "email":"founder@newbeansland.org",
          "founder":{"@type":"Person","name":"Jamel Hawkins","url":"https://newbeansland.org/jamel-hawkins.html"}
        },
        {
          "@type":"WebSite",
          "@id":"https://newbeansland.org/#website",
          "url":"https://newbeansland.org/",
          "name":"New Beansland",
          "description":"Stories. Questions. Worlds.",
          "publisher":{"@id":"https://newbeansland.org/#organization"}
        }
      ]
    });
    document.head.appendChild(jsonld);
  }

  const header=document.createElement("header");
  header.className="nbl-world-header";
  header.innerHTML=`
    <div class="nbl-world-header-inner">
      <a class="nbl-world-brand" href="/" aria-label="New Beansland home">
        <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="New Beansland official seal" width="52" height="52">
        <span class="nbl-world-brand-copy">
          <strong>New Beansland™</strong>
          <small>${room.label}</small>
        </span>
      </a>
      <button class="nbl-world-menu" type="button" aria-expanded="false" aria-controls="nbl-world-nav" aria-label="Open New Beansland rooms">Rooms</button>
      <nav class="nbl-world-nav" id="nbl-world-nav" aria-label="New Beansland main navigation">
        ${nav.map(([key,label,href,external])=>`<a href="${href}"${room.key===key&&key?' aria-current="page"':''}${external?' target="_blank" rel="noopener noreferrer"':''}>${label}</a>`).join("")}
        <button class="nbl-world-account" type="button">Sign in / Create account</button>
        <div class="nbl-world-user" hidden aria-label="NBL account"></div>
      </nav>
    </div>`;

  const menu=header.querySelector(".nbl-world-menu");
  const setOpen=open=>{
    header.classList.toggle("is-open",open);
    document.body.classList.toggle("nbl-world-menu-open",open);
    menu.setAttribute("aria-expanded",open?"true":"false");
    menu.setAttribute("aria-label",open?"Close New Beansland rooms":"Open New Beansland rooms");
    menu.textContent=open?"Close":"Rooms";
  };
  menu.addEventListener("click",()=>setOpen(!header.classList.contains("is-open")));
  header.querySelectorAll(".nbl-world-nav a").forEach(a=>a.addEventListener("click",()=>setOpen(false)));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape") setOpen(false);
  });

  const legacy=[];
  if(room.key==="home") legacy.push(document.querySelector("body > .site-header"));
  if(room.key==="university") legacy.push(document.querySelector("body > .site-header"));
  if(room.key==="books") legacy.push(document.querySelector("body > .site-header"));
  if(room.key==="clothing") legacy.push(document.querySelector("body > .header"));
  if(room.key==="studio") legacy.push(document.querySelector(".studio-header .back"));
  if(room.key==="about") legacy.push(document.querySelector("main.wrap > .top"));
  if(room.key==="office") legacy.push(document.querySelector(".home-button"));
  legacy.filter(Boolean).forEach(el=>el.classList.add("nbl-world-legacy-header"));

  if(room.key==="home"){
    const oldFooter=document.querySelector("body > footer:not(.nbl-world-footer), main > footer:not(.nbl-world-footer), body > .footer:not(.nbl-world-footer), main > .footer:not(.nbl-world-footer)");
    if(oldFooter) oldFooter.classList.add("nbl-world-legacy-footer");
  }

  document.body.prepend(header);
  document.body.classList.add("nbl-world-ready");
  setupNblAccountUi(header);

  if(room.key==="home"&&!document.querySelector(".nbl-beta-signup")){
    const beta=document.createElement("section");
    beta.className="nbl-beta-signup";
    beta.setAttribute("aria-labelledby","nbl-beta-title");
    beta.innerHTML=`
      <div class="nbl-beta-inner">
        <p class="nbl-beta-kicker">Beans · Beta testing</p>
        <h2 id="nbl-beta-title">Get on the list for what Beans is testing next.</h2>
        <p>Join the NBL email list for an invitation to beta test NBL Chat when the next round is ready.</p>
        <form class="nbl-beta-form">
          <label for="nbl-beta-email">Email address</label>
          <div class="nbl-beta-row">
            <input id="nbl-beta-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
            <button type="submit">Join the beta list</button>
          </div>
          <small>Your address is not stored on this website. Submitting opens an email to New Beansland so you can request beta access.</small>
        </form>
      </div>`;
    beta.querySelector("form").addEventListener("submit",event=>{
      event.preventDefault();
      const email=beta.querySelector("input").value.trim();
      if(!email) return;
      const subject=encodeURIComponent("NBL Chat Beta Testing List");
      const body=encodeURIComponent(`Please add ${email} to the NBL Chat beta-testing email list.`);
      location.href=`mailto:founder@newbeansland.org?subject=${subject}&body=${body}`;
    });
    document.body.append(beta);
  }

  if(!document.querySelector(".nbl-world-footer")){
    const footer=document.createElement("footer");
    footer.className="nbl-world-footer";
    footer.innerHTML=`
      <div class="nbl-world-footer-inner">
        <p class="nbl-world-footer-mark"><strong>New Beansland™</strong> Stories. Questions. Worlds.</p>
        <nav class="nbl-world-footer-links" aria-label="Legal and support">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/nbl-chat-support.html">Support</a>
          <a href="/nbl-chat-legal.html">Legal</a>
          <a href="mailto:founder@newbeansland.org">Contact</a>
        </nav>
      </div>`;
    document.body.append(footer);
  }
})();