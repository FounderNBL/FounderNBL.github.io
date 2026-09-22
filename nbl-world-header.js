(()=>{
  "use strict";
  const path=(location.pathname||"/").replace(/\/+/g,"/");
  const room=(()=>{
    if(path==="/"||/\/index\.html$/.test(path)||/\/home\.html$/.test(path)) return {label:"Stories · Questions · Worlds",key:"home"};
    if(/\/university(?:\.html)?$/.test(path)||/\/verify-credential\.html$/.test(path)||/\/university-thank-you\.html$/.test(path)) return {label:"New Beansland University",key:"university"};
    if(/\/books\.html$/.test(path)||/\/people-zoo/.test(path)||/\/doctor-rocketship/.test(path)) return {label:"NBL Books",key:"books"};
    if(/\/clothing\.html$/.test(path)) return {label:"NBL Clothing Co.",key:"clothing"};
    if(/\/nbl-kids\.html$/.test(path)) return {label:"NBL Kids",key:"kids"};
    if(/\/shanique\.html$/.test(path)) return {label:"Shanique Washington",key:"her"};
    if(/\/stories\.html$/.test(path)) return {label:"TV & Film",key:"stories"};
    if(/\/studio\/?(?:index\.html)?$/.test(path)) return {label:"Timmy V Studios",key:"studio"};
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
    ["kids","NBL Kids","/nbl-kids.html",false],
    ["stories","TV & Film","/stories.html",false],
    ["studio","Timmy V Studios","/studio/",false],
    ["office","Founder’s Office","/founder-office.html",false],
    ["about","About NBL","/about.html",false],
    ["","YouTube","https://www.youtube.com/@FounderNBL",true],
    ["","Instagram","https://www.instagram.com/newbeansland/",true],
    ["","X","https://x.com/FounderNBL",true],
    ["","Contact","mailto:founder@newbeansland.org",false]
  ];

  const NBL_ACCOUNT_API="https://nbl-chat.replit.app";
  const NBL_SEARCH_API=`${NBL_ACCOUNT_API}/api/search/nbl`;
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

    const addAuxButton=(label,handler)=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="nbl-world-account nbl-world-account-secondary";
      button.textContent=label;
      button.addEventListener("click",handler);
      userHost.appendChild(button);
      userHost.hidden=false;
      return button;
    };

    const render=()=>{
      userHost.hidden=true;
      userHost.replaceChildren();
      accountButton.hidden=false;
      accountButton.disabled=false;

      if(!clerk){
        accountButton.textContent="Sign in";
        accountButton.title="Sign in to your NBL account";
        addAuxButton("Create account",()=>{ location.href=accountPortalUrl("/sign-up"); });
        return;
      }

      if(clerk.isSignedIn){
        const user=clerk.user;
        const displayName=(user?.fullName||user?.firstName||user?.primaryEmailAddress?.emailAddress||"Account").trim();
        accountButton.textContent=displayName;
        accountButton.title="Manage your NBL account";
        const signOutButton=addAuxButton("Sign out",async()=>{
          signOutButton.disabled=true;
          signOutButton.textContent="Signing out…";
          try{
            await clerk.signOut();
            render();
          }catch{
            signOutButton.disabled=false;
            signOutButton.textContent="Sign out";
          }
        });
        if(panelSignIn) panelSignIn.hidden=true;
        void readUniversityAccess(clerk);
      }else{
        accountButton.textContent="Sign in";
        accountButton.title="Sign in to your NBL account";
        addAuxButton("Create account",()=>{
          try{
            clerk.openSignUp({fallbackRedirectUrl:location.href});
          }catch{
            location.href=accountPortalUrl("/sign-up");
          }
        });
        if(panelSignIn){
          panelSignIn.hidden=false;
          panelSignIn.disabled=false;
          panelSignIn.textContent="Sign in";
        }
        if(panelRequest) panelRequest.hidden=true;
        if(panelStatus) panelStatus.textContent="Account connection is optional.";
      }
    };

    const openSignIn=()=>{
      if(clerk){
        try{
          clerk.openSignIn({fallbackRedirectUrl:location.href});
          return;
        }catch{}
      }
      location.href=accountPortalUrl("/sign-in");
    };

    const openAccount=()=>{
      if(clerk?.isSignedIn){
        try{
          clerk.openUserProfile();
          return;
        }catch{}
      }
      openSignIn();
    };

    accountButton.addEventListener("click",openAccount);
    panelSignIn?.addEventListener("click",openSignIn);

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

    render();
    accountButton.disabled=true;
    accountButton.textContent="Connecting…";
    void getNblClerk().then(loaded=>{
      clerk=loaded;
      clerk.addListener?.(render);
      render();
    }).catch(()=>{
      accountButton.disabled=false;
      accountButton.textContent="Sign in";
      if(panelStatus) panelStatus.textContent="Account connection is temporarily unavailable here. You can still use the NBL account portal.";
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
      <button class="nbl-world-search-toggle" type="button" aria-expanded="false" aria-controls="nbl-search-panel">Search</button>
      <button class="nbl-world-account nbl-world-account-primary" type="button">Sign in</button>
      <div class="nbl-world-user" hidden aria-label="NBL account"></div>
      <button class="nbl-world-menu" type="button" aria-expanded="false" aria-controls="nbl-world-nav" aria-label="Open New Beansland rooms">Rooms</button>
      <nav class="nbl-world-nav" id="nbl-world-nav" aria-label="New Beansland main navigation">
        ${nav.map(([key,label,href,external])=>`<a href="${href}"${room.key===key&&key?' aria-current="page"':''}${external?' target="_blank" rel="noopener noreferrer"':''}>${label}</a>`).join("")}
      </nav>
    </div>`;

  const searchToggle=header.querySelector(".nbl-world-search-toggle");
  const searchPanel=document.createElement("section");
  searchPanel.className="nbl-search-panel";
  searchPanel.id="nbl-search-panel";
  searchPanel.hidden=true;
  searchPanel.setAttribute("aria-label","Search New Beansland");
  searchPanel.innerHTML=`
    <div class="nbl-search-card" role="dialog" aria-modal="true" aria-labelledby="nbl-search-title">
      <div class="nbl-search-head">
        <div>
          <p class="nbl-search-kicker">Founder’s Code · NBL only</p>
          <h2 id="nbl-search-title">Search New Beansland</h2>
          <p class="nbl-search-note">This searches New Beansland only. No OpenAI. No web search.</p>
        </div>
        <button class="nbl-search-close" type="button" data-nbl-search-close aria-label="Close NBL Search">✕</button>
      </div>
      <form class="nbl-search-form" data-nbl-search-form>
        <label for="nbl-search-input">What are you looking for?</label>
        <div class="nbl-search-row">
          <input id="nbl-search-input" name="q" type="search" inputmode="search" autocomplete="off" maxlength="220" placeholder="Search New Beansland…" required>
          <button type="submit">Search</button>
        </div>
      </form>
      <p class="nbl-search-status" data-nbl-search-status role="status" aria-live="polite">Search the NBL system. Results replace each other — this is not a chat.</p>
      <div class="nbl-search-results" data-nbl-search-results></div>
      <a class="nbl-search-google" data-nbl-search-google href="https://www.google.com/" target="_blank" rel="noopener noreferrer" hidden>Not here? Check Google ↗</a>
      <p class="nbl-search-meta" data-nbl-search-meta>Founder’s Code only · No model fallback</p>
    </div>`;

  const searchForm=searchPanel.querySelector("[data-nbl-search-form]");
  const searchInput=searchPanel.querySelector("#nbl-search-input");
  const searchSubmit=searchForm.querySelector('button[type="submit"]');
  const searchStatus=searchPanel.querySelector("[data-nbl-search-status]");
  const searchResults=searchPanel.querySelector("[data-nbl-search-results]");
  const searchGoogle=searchPanel.querySelector("[data-nbl-search-google]");
  const searchMeta=searchPanel.querySelector("[data-nbl-search-meta]");
  const searchClose=searchPanel.querySelector("[data-nbl-search-close]");
  let activeSearchController=null;

  const closeSearch=()=>{
    activeSearchController?.abort();
    activeSearchController=null;
    searchPanel.hidden=true;
    document.body.classList.remove("nbl-search-open");
    searchToggle.setAttribute("aria-expanded","false");
    searchToggle.focus();
  };

  const openSearch=()=>{
    setOpen(false);
    searchPanel.hidden=false;
    document.body.classList.add("nbl-search-open");
    searchToggle.setAttribute("aria-expanded","true");
    window.setTimeout(()=>searchInput.focus(),20);
  };

  const clearSearchResults=()=>{
    searchResults.replaceChildren();
    searchGoogle.hidden=true;
  };

  const renderSearchResults=payload=>{
    clearSearchResults();
    const results=Array.isArray(payload?.results)?payload.results:[];
    if(payload?.status==="results"&&results.length){
      searchStatus.textContent=`Found ${results.length} NBL result${results.length===1?"":"s"}.`;
      for(const result of results){
        const card=document.createElement("article");
        card.className="nbl-search-result";
        const title=document.createElement("h3");
        title.textContent=typeof result?.title==="string"?result.title:"New Beansland";
        const excerpt=document.createElement("p");
        excerpt.textContent=typeof result?.excerpt==="string"?result.excerpt:"";
        card.append(title,excerpt);
        searchResults.append(card);
      }
    }else{
      searchStatus.textContent=payload?.message||"That is not in the public New Beansland search yet. Try again later.";
      if(payload?.status==="not_found"){
        const query=typeof payload?.query==="string"?payload.query:searchInput.value.trim();
        searchGoogle.href=`https://www.google.com/search?q=${encodeURIComponent(query)}`;
        searchGoogle.hidden=false;
      }
    }

    const version=typeof payload?.founderCodeVersion==="string"?payload.founderCodeVersion:"";
    searchMeta.textContent=version
      ? `Founder’s Code v${version} · NBL only · No OpenAI · No web search`
      : "Founder’s Code only · NBL only · No OpenAI · No web search";
  };

  searchForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const query=searchInput.value.trim().replace(/\s+/g," ");
    if(!query){
      searchStatus.textContent="Type something from New Beansland to search.";
      return;
    }

    activeSearchController?.abort();
    const controller=new AbortController();
    activeSearchController=controller;
    clearSearchResults();
    searchSubmit.disabled=true;
    searchInput.disabled=true;
    searchStatus.textContent="Searching Founder’s Code…";
    searchMeta.textContent="Founder’s Code only · No model fallback";

    try{
      const response=await fetch(`${NBL_SEARCH_API}?q=${encodeURIComponent(query)}`,{
        method:"GET",
        headers:{Accept:"application/json"},
        cache:"no-store",
        credentials:"omit",
        signal:controller.signal
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok){
        throw new Error(payload?.message||"NBL Search is not ready right now.");
      }
      renderSearchResults(payload);
    }catch(error){
      if(error?.name==="AbortError") return;
      clearSearchResults();
      searchStatus.textContent=error?.message||"NBL Search is not ready right now. Try again later.";
      searchMeta.textContent="Founder’s Code connection unavailable · No OpenAI fallback used";
    }finally{
      if(activeSearchController===controller) activeSearchController=null;
      searchSubmit.disabled=false;
      searchInput.disabled=false;
    }
  });

  searchToggle.addEventListener("click",()=>{
    if(searchPanel.hidden) openSearch();
    else closeSearch();
  });
  searchClose.addEventListener("click",closeSearch);
  searchPanel.addEventListener("click",event=>{
    if(event.target===searchPanel) closeSearch();
  });

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
    if(event.key!=="Escape") return;
    if(!searchPanel.hidden){
      closeSearch();
      return;
    }
    setOpen(false);
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
  document.body.append(searchPanel);
  document.body.classList.add("nbl-world-ready");
  setupNblAccountUi(header);

  if(room.key==="home"&&!document.querySelector(".nbl-beta-signup")){
    const beta=document.createElement("section");
    beta.className="nbl-beta-signup";
    beta.setAttribute("aria-labelledby","nbl-beta-title");
    beta.innerHTML=`
      <div class="nbl-beta-inner">
        <img class="nbl-beta-beans" src="/NBLChat_Beans.png" alt="Beans from NBL Chat">
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