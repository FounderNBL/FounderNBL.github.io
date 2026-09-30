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
    if(/\/account\.html$/.test(path)) return {label:"My NBL Account",key:"account"};
    if(/\/search\.html$/.test(path)) return {label:"Search New Beansland",key:"search"};
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
    ["search","Search","#nbl-search",false]
  ];

  const NBL_PUBLIC_BEANS_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/beans-public";
  const NBL_CHAT_PLUS_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-foundation-runtime";
  const NBL_CHAT_GATEWAY_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-chat-gateway";
  const NBL_ACCOUNT_STORE_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-account";
  const NBL_SEARCH_API=NBL_PUBLIC_BEANS_API;
  const NBL_BEANS_WEB_API=NBL_CHAT_PLUS_API;
  const NBL_PRODUCT_PLANS=window.NBL_PRODUCT_PLANS;
  const NBL_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
  const NBL_ACCOUNT_PORTAL="https://accounts.newbeansland.org";
  let nblClerkPromise=null;
  let nblClerk=null;

  const safeReturnUrl=()=>{
    const url=new URL(location.href);
    url.hash="";
    return url.href;
  };

  const accountPortalUrl=(page="/sign-in")=>{
    const redirectUrl=encodeURIComponent(safeReturnUrl());
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
      const publishableKey=NBL_CLERK_PUBLISHABLE_KEY;
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


  const getNblBeansAuthToken=async()=>{
    try{
      const clerk=await getNblClerk();
      if(!clerk?.isSignedIn||!clerk.session) return null;
      const token=await clerk.session.getToken();
      return typeof token==="string"&&token.trim()?token.trim():null;
    }catch{
      return null;
    }
  };

  window.NBLAccountBridge={
    getClerk:getNblClerk,
    getToken:getNblBeansAuthToken,
    api:NBL_ACCOUNT_STORE_API
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
        </div>
        <p class="nbl-connected-account-status" data-nbl-panel-status>Account connection is optional.</p>
        <small>LOCKE checks Guided Learning access server-side. Checkout and enrollment stay separate from this account-status check.</small>
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
    try{
      statusEl.textContent="Checking Guided Learning access…";
      const token=await clerk.session.getToken();
      const response=await fetch(NBL_CHAT_PLUS_API,{
        method:"POST",
        headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({action:"status"}),
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(response.status===401){
        statusEl.textContent="Your NBL session needs to be refreshed. Sign in again to check Guided Learning access.";
        return;
      }
      if(!response.ok) throw new Error("Guided Learning access could not be checked right now.");
      statusEl.textContent=payload?.chatPlus?.allowed===true
        ?"Account connected. Guided Learning access is active in NBL Chat Plus."
        :"Account connected. Guided Learning access is not active for this account.";
    }catch(error){
      statusEl.textContent=error?.message||"Guided Learning access is temporarily unavailable.";
    }
  };

  const setupNblAccountUi=header=>{
    const accountButton=header.querySelector(".nbl-world-account");
    const userHost=header.querySelector(".nbl-world-user");
    if(!accountButton||!userHost) return;
    const panel=getUniversityPanel();
    const panelSignIn=panel?.querySelector("[data-nbl-panel-signin]");
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
        return;
      }

      if(clerk.isSignedIn){
        const user=clerk.user;
        const displayName=(user?.unsafeMetadata?.displayName||user?.publicMetadata?.displayName||user?.username||user?.fullName||user?.firstName||user?.primaryEmailAddress?.emailAddress||"Account").trim();
        accountButton.textContent=displayName;
        accountButton.title="Manage your NBL account";
        void (async()=>{
          try{
            const token=await getNblBeansAuthToken();
            if(!token) return;
            const response=await fetch(`${NBL_ACCOUNT_STORE_API}?action=summary`,{
              headers:{Accept:"application/json",Authorization:`Bearer ${token}`},
              cache:"no-store"
            });
            const payload=await response.json().catch(()=>({}));
            const username=String(payload?.profile?.username||"").trim();
            if(response.ok&&username) accountButton.textContent=username;
          }catch{}
        })();
        if(panelSignIn) panelSignIn.hidden=true;
        void readUniversityAccess(clerk);
      }else{
        accountButton.textContent="Sign in";
        accountButton.title="Sign in to your NBL account";
        if(panelSignIn){
          panelSignIn.hidden=false;
          panelSignIn.disabled=false;
          panelSignIn.textContent="Sign in";
        }
        if(panelStatus) panelStatus.textContent="Account connection is optional.";
      }
    };

    const openSignIn=()=>{
      location.href=accountPortalUrl("/sign-in");
    };

    const openAccount=()=>{
      if(clerk?.isSignedIn){
        location.href="/account.html";
        return;
      }
      openSignIn();
    };

    accountButton.addEventListener("click",openAccount);
    panelSignIn?.addEventListener("click",openSignIn);

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
  header.innerHTML=room.key==="home"?`
    <div class="nbl-world-header-inner nbl-world-header-home">
      <a class="nbl-world-brand" href="/" aria-label="New Beansland home">
        <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="New Beansland official seal" width="52" height="52">
        <span class="nbl-world-brand-copy">
          <strong>New Beansland™</strong>
          <small>${room.label}</small>
        </span>
      </a>
      <div class="nbl-world-home-actions">
        <button class="nbl-world-beans-toggle nbl-world-chat-launch" type="button" aria-expanded="false" aria-controls="nbl-beans-panel" aria-label="Open NBL Chat">
          <img src="data:image/webp;base64,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" alt="" aria-hidden="true">
          <span>NBL Chat</span>
        </button>
        <a class="nbl-world-nblworld-link" href="https://nblworld.com/" aria-label="Enter NBL World">NBL World</a>
      </div>
    </div>`:`
    <div class="nbl-world-header-inner">
      <a class="nbl-world-brand" href="/" aria-label="New Beansland home">
        <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="New Beansland official seal" width="52" height="52">
        <span class="nbl-world-brand-copy">
          <strong>New Beansland™</strong>
          <small>${room.label}</small>
        </span>
      </a>
      <button class="nbl-world-beans-toggle" type="button" aria-expanded="false" aria-controls="nbl-beans-panel" aria-label="Open NBL Chat">NBL Chat</button>
      <button class="nbl-world-account nbl-world-account-primary" type="button">Sign in</button>
      <div class="nbl-world-user" hidden aria-label="NBL account"></div>
      <button class="nbl-world-menu" type="button" aria-expanded="false" aria-controls="nbl-world-nav" aria-label="Open New Beansland worlds">Worlds</button>
      <nav class="nbl-world-nav" id="nbl-world-nav" aria-label="New Beansland main navigation">
        ${nav.map(([key,label,href,external])=>`<a href="${href}"${key==="search"?' data-nbl-open-search':''}${room.key===key&&key?' aria-current="page"':''}${external?' target="_blank" rel="noopener noreferrer"':''}>${label}</a>`).join("")}
      </nav>
    </div>`;

  let searchTrigger=null;
  const beansToggle=header.querySelector(".nbl-world-beans-toggle");
  const searchPanel=document.createElement("section");
  searchPanel.className="nbl-search-panel";
  searchPanel.id="nbl-search-panel";
  searchPanel.hidden=true;
  searchPanel.setAttribute("aria-label","Search New Beansland");
  searchPanel.innerHTML=`
    <div class="nbl-search-card" role="dialog" aria-modal="true" aria-labelledby="nbl-search-title">
      <div class="nbl-search-head">
        <div>
          <p class="nbl-search-kicker">New Beansland · Public search</p>
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
      <p class="nbl-search-meta" data-nbl-search-meta>New Beansland public search</p>
    </div>`;

  const beansPanel=document.createElement("section");
  beansPanel.className="nbl-beans-panel";
  beansPanel.id="nbl-beans-panel";
  beansPanel.hidden=true;
  beansPanel.setAttribute("aria-label","NBL Chat");
  beansPanel.innerHTML=`
    <div class="nbl-beans-card" role="dialog" aria-modal="true" aria-labelledby="nbl-beans-title">
      <div class="nbl-beans-head">
        <button class="nbl-chat-drawer-toggle" type="button" data-nbl-chat-drawer-toggle aria-expanded="false" aria-controls="nbl-chat-drawer" aria-label="Open NBL Chat menu">
          <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="" aria-hidden="true">
        </button>
        <div class="nbl-beans-title-wrap">
          <img src="/NBLChat_Beans.png" alt="Beans" class="nbl-beans-avatar">
          <div>
            <p class="nbl-beans-kicker">New Beansland</p>
            <h2 id="nbl-beans-title">NBL Chat</h2>
            <p class="nbl-beans-note">Beans is the front door. Professor Grey is the Guided Learning experience inside NBL Chat Plus.</p>
          </div>
        </div>
        <button class="nbl-beans-close" type="button" data-nbl-beans-close aria-label="Close NBL Chat">✕</button>
      </div>

      <div class="nbl-chat-drawer-shade" data-nbl-chat-drawer-shade hidden></div>
      <aside class="nbl-chat-drawer" id="nbl-chat-drawer" data-nbl-chat-drawer aria-label="NBL Chat menu" tabindex="-1" hidden>
        <div class="nbl-chat-drawer-head">
          <img src="/NBLChat_Beans.png" alt="Beans" class="nbl-chat-drawer-logo">
          <div>
            <p>New Beansland™</p>
            <strong>NBL Chat</strong>
            <small>Beans, tools, history, and your NBL account.</small>
          </div>
          <button type="button" data-nbl-chat-drawer-close aria-label="Close NBL Chat menu">✕</button>
        </div>
        <div class="nbl-chat-drawer-scroll">
          <button class="nbl-chat-drawer-item" type="button" data-nbl-drawer-new>
            <img src="/NBLChat_Beans.png" alt="" aria-hidden="true">
            <span><strong>New chat</strong><small>Start fresh with Beans</small></span>
          </button>

          <section class="nbl-chat-drawer-history" aria-labelledby="nbl-chat-drawer-history-title">
            <div class="nbl-chat-drawer-section-head">
              <strong id="nbl-chat-drawer-history-title">Recent conversations</strong>
              <a href="/account.html">Manage all</a>
            </div>
            <p data-nbl-drawer-history-status>Sign in to see saved conversations.</p>
            <div data-nbl-drawer-history-list></div>
          </section>

          <button class="nbl-chat-drawer-item" type="button" data-nbl-drawer-grey hidden>
            <img src="/NBL_University.png" alt="" aria-hidden="true">
            <span><strong>Professor Grey</strong><small>NBL University faculty · University entitlement required</small></span>
          </button>

          <button class="nbl-chat-drawer-item" type="button" data-nbl-drawer-plans aria-expanded="false">
            <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="" aria-hidden="true">
            <span><strong>Membership &amp; plans</strong><small>${NBL_PRODUCT_PLANS.beans.price} Beans · ${NBL_PRODUCT_PLANS.chatPlus.price} Plus · Get More</small></span>
          </button>
          <div class="nbl-chat-drawer-plans" data-nbl-drawer-plan-card hidden>
            <article><strong>${NBL_PRODUCT_PLANS.beans.name} · ${NBL_PRODUCT_PLANS.beans.price}</strong><span>${NBL_PRODUCT_PLANS.beans.replies} per billing period.</span></article>
            <article><strong>${NBL_PRODUCT_PLANS.chatPlus.name} · ${NBL_PRODUCT_PLANS.chatPlus.price}</strong><span>${NBL_PRODUCT_PLANS.chatPlus.replies} + plan-approved premium Beans tools. University / Professor Grey access is separate.</span></article>
            <article><strong>${NBL_PRODUCT_PLANS.getMore.name} · ${NBL_PRODUCT_PLANS.getMore.price}</strong><span>${NBL_PRODUCT_PLANS.getMore.replies}. ${NBL_PRODUCT_PLANS.getMore.expiry}</span></article>
          </div>

          <a class="nbl-chat-drawer-item" href="/university.html">
            <img src="/NBL_University.png" alt="" aria-hidden="true">
            <span><strong>NBL University</strong><small>Courses and University doors · separate from Chat Plus</small></span>
          </a>

          <button class="nbl-chat-drawer-item" type="button" data-nbl-drawer-tools>
            <span class="nbl-chat-drawer-fallback" aria-hidden="true">+</span>
            <span><strong>Beans tools</strong><small>Photos, files, web, code/data, and image creation</small></span>
          </button>

          <a class="nbl-chat-drawer-item" href="/account.html">
            <span class="nbl-chat-drawer-fallback" aria-hidden="true">NBL</span>
            <span><strong>Account</strong><small>Username, security, usage, and saved history</small></span>
          </a>

          <a class="nbl-chat-drawer-item" href="/">
            <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="" aria-hidden="true">
            <span><strong>New Beansland</strong><small>Return to the public world</small></span>
          </a>
        </div>
        <div class="nbl-chat-drawer-foot">
          <button class="nbl-chat-drawer-account" type="button" data-nbl-drawer-account-action>Sign in</button>
        </div>
      </aside>

      <div class="nbl-chat-modes" role="tablist" aria-label="NBL Chat mode">
        <button id="nbl-chat-tab-beans" type="button" class="is-active" data-nbl-chat-mode="beans" role="tab" aria-controls="nbl-chat-panel-beans" aria-selected="true" tabindex="0">Beans</button>
        <button id="nbl-chat-tab-plus" type="button" data-nbl-chat-mode="plus" role="tab" aria-controls="nbl-chat-panel-plus" aria-selected="false" aria-label="NBL University Professor Grey" tabindex="-1" hidden>University</button>
      </div>

      <section id="nbl-chat-panel-beans" role="tabpanel" aria-labelledby="nbl-chat-tab-beans" tabindex="0" data-nbl-beans-regular>
        <div class="nbl-beans-log" data-nbl-beans-log aria-live="polite">
          <div class="nbl-beans-message is-beans"><strong>Beans</strong><p>I'm Beans. What's up?</p></div>
        </div>
        <form class="nbl-beans-form" data-nbl-beans-form>
          <label for="nbl-beans-input">Message Beans</label>
          <div class="nbl-beans-tool-state" data-nbl-tool-state hidden>
            <span data-nbl-tool-mode-label>Auto</span>
            <button type="button" data-nbl-tool-reset aria-label="Clear selected Beans tool">×</button>
          </div>
          <div class="nbl-beans-attachments" data-nbl-beans-attachments hidden></div>
          <div class="nbl-beans-composer">
            <div class="nbl-beans-tools-wrap">
              <button class="nbl-beans-tool-toggle" type="button" data-nbl-tools-toggle aria-expanded="false" aria-controls="nbl-beans-tools-menu" aria-label="Open Beans tools">+</button>
              <div class="nbl-beans-tools-menu" id="nbl-beans-tools-menu" data-nbl-tools-menu hidden>
                <button type="button" data-nbl-tool="attach"><strong>Photo / file</strong><span>Analyze an image, PDF, text, CSV, or JSON file · Plus</span></button>
                <button type="button" data-nbl-tool="web"><strong>Search the live web</strong><span>Force a current web search · Plus</span></button>
                <button type="button" data-nbl-tool="code"><strong>Code / data analysis</strong><span>Run Python in a secure OpenAI container · Plus</span></button>
                <button type="button" data-nbl-tool="image"><strong>Create an image</strong><span>Generate an image from your next prompt · Plus</span></button>
                <button type="button" data-nbl-tool="read"><strong>Read last reply</strong><span>Use your browser's speech voice</span></button>
              </div>
              <input data-nbl-beans-file type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown,text/csv,application/json" multiple hidden>
            </div>
            <textarea id="nbl-beans-input" name="message" rows="2" maxlength="4000" placeholder="Ask Beans anything…" required></textarea>
            <button class="nbl-beans-mic" type="button" data-nbl-beans-mic aria-label="Dictate a message to Beans">🎙</button>
            <button class="nbl-beans-send" type="submit">Send</button>
          </div>
        </form>
        <p class="nbl-beans-note" style="margin-top:10px">
          Signed-in chats may be stored with your NBL account and processed by service providers to provide NBL Chat. Beans can make mistakes, so verify important information and do not rely on Beans alone for legal, medical, financial, or safety decisions. <a href="/privacy.html" style="color:inherit;text-decoration:underline">Privacy</a>
        </p>
        <p class="nbl-beans-status" data-nbl-beans-status role="status">Beans includes limited free replies. Sign in to keep your history and use your NBL membership.</p>
      </section>

      <section id="nbl-chat-panel-plus" class="nbl-plus-shell" role="tabpanel" aria-labelledby="nbl-chat-tab-plus" tabindex="0" data-nbl-plus hidden>
        <div class="nbl-plus-access" data-nbl-plus-access tabindex="-1">
          <p class="nbl-beans-kicker">NBL Chat Plus</p>
          <h3>Beans · Guided Learning on · Professor Grey</h3>
          <p data-nbl-plus-access-copy>Turn on Guided Learning after LOCKE confirms your course enrollment and Grey access.</p>
          <button type="button" data-nbl-plus-signin>Sign in to check access</button>
        </div>

        <div data-nbl-plus-live hidden>
          <div class="nbl-plus-course">
            <label for="nbl-plus-course">Current course</label>
            <select id="nbl-plus-course" data-nbl-plus-course>
              <option value="APSK 101">APSK 101 · Skeptical Inquiry</option>
              <option value="ANSY 110">ANSY 110 · Analogical Reasoning</option>
              <option value="EBPR 120">EBPR 120 · Evidence-Based Practice</option>
            </select>
          </div>
          <div class="nbl-beans-log nbl-plus-log" data-nbl-plus-log aria-live="polite">
            <div class="nbl-beans-message is-beans"><strong>Professor Grey</strong><p>Choose your course and ask me about the lesson.</p></div>
          </div>
          <form class="nbl-beans-form" data-nbl-plus-form>
            <label for="nbl-plus-input">Ask Professor Grey</label>
            <div class="nbl-beans-row">
              <textarea id="nbl-plus-input" name="message" rows="2" maxlength="3500" placeholder="Ask about your course…" required></textarea>
              <button type="submit">Send</button>
            </div>
          </form>
          <p class="nbl-beans-note" style="margin-top:10px">Guided Learning is Beans in Professor Grey mode. Grey can teach and practice from the protected course library, but test answers, rubrics, grading keys, and future assessment material stay sealed.</p>
          <p class="nbl-beans-status" data-nbl-plus-status role="status">Professor Grey is ready for the selected course.</p>
        </div>
      </section>
    </div>`;

  const beansClose=beansPanel.querySelector("[data-nbl-beans-close]");
  const chatDrawer=beansPanel.querySelector("[data-nbl-chat-drawer]");
  const chatDrawerShade=beansPanel.querySelector("[data-nbl-chat-drawer-shade]");
  const chatDrawerToggle=beansPanel.querySelector("[data-nbl-chat-drawer-toggle]");
  const chatDrawerClose=beansPanel.querySelector("[data-nbl-chat-drawer-close]");
  const chatDrawerNew=beansPanel.querySelector("[data-nbl-drawer-new]");
  const chatDrawerGrey=beansPanel.querySelector("[data-nbl-drawer-grey]");
  const chatDrawerPlans=beansPanel.querySelector("[data-nbl-drawer-plans]");
  const chatDrawerPlanCard=beansPanel.querySelector("[data-nbl-drawer-plan-card]");
  const chatDrawerHistoryStatus=beansPanel.querySelector("[data-nbl-drawer-history-status]");
  const chatDrawerHistoryList=beansPanel.querySelector("[data-nbl-drawer-history-list]");
  const chatDrawerAccountAction=beansPanel.querySelector("[data-nbl-drawer-account-action]");
  const beansForm=beansPanel.querySelector("[data-nbl-beans-form]");
  const beansInput=beansPanel.querySelector("#nbl-beans-input");
  const beansSubmit=beansForm.querySelector('button[type="submit"]');
  const beansToolsToggle=beansPanel.querySelector("[data-nbl-tools-toggle]");
  const beansToolsMenu=beansPanel.querySelector("[data-nbl-tools-menu]");
  const beansFileInput=beansPanel.querySelector("[data-nbl-beans-file]");
  const beansAttachmentsEl=beansPanel.querySelector("[data-nbl-beans-attachments]");
  const beansToolState=beansPanel.querySelector("[data-nbl-tool-state]");
  const beansToolModeLabel=beansPanel.querySelector("[data-nbl-tool-mode-label]");
  const beansToolReset=beansPanel.querySelector("[data-nbl-tool-reset]");
  const beansMic=beansPanel.querySelector("[data-nbl-beans-mic]");
  const chatDrawerTools=beansPanel.querySelector("[data-nbl-drawer-tools]");
  const beansLog=beansPanel.querySelector("[data-nbl-beans-log]");
  const beansStatus=beansPanel.querySelector("[data-nbl-beans-status]");
  const regularBeansShell=beansPanel.querySelector("[data-nbl-beans-regular]");
  const plusShell=beansPanel.querySelector("[data-nbl-plus]");
  const modeButtons=[...beansPanel.querySelectorAll("[data-nbl-chat-mode]")];
  const plusAccess=beansPanel.querySelector("[data-nbl-plus-access]");
  const plusAccessCopy=beansPanel.querySelector("[data-nbl-plus-access-copy]");
  const plusSignIn=beansPanel.querySelector("[data-nbl-plus-signin]");
  const plusLive=beansPanel.querySelector("[data-nbl-plus-live]");
  const plusCourse=beansPanel.querySelector("[data-nbl-plus-course]");
  const plusLog=beansPanel.querySelector("[data-nbl-plus-log]");
  const plusForm=beansPanel.querySelector("[data-nbl-plus-form]");
  const plusInput=beansPanel.querySelector("#nbl-plus-input");
  const plusSubmit=plusForm.querySelector('button[type="submit"]');
  const plusStatus=beansPanel.querySelector("[data-nbl-plus-status]");
  const beansHistory=[{role:"assistant",content:"I'm Beans. What's up?"}];
  const plusHistory=[{role:"assistant",content:"Choose your course and ask me about the lesson."}];
  let beansConversationId=null;
  let beansHistoryLoadedFor=null;
  let beansHistoryLoadingFor=null;
  let beansHistoryRequestGeneration=0;
  let beansConversationGeneration=0;
  let beansAccountGeneration=0;
  let beansIdentityUserId=null;
  let activeChatMode="beans";
  let plusAccessCheckedFor=null;
  let plusAccessLoadingFor=null;
  let plusAccessRequestGeneration=0;
  let plusAllowed=false;
  let chatDrawerCloseTimer=null;
  let chatDrawerOpener=null;
  let chatHistoryEntry=null;
  let drawerHistoryRequestGeneration=0;
  let beansToolMode="auto";
  let beansAttachments=[];

  const modalInertState=new Map();
  const setModalIsolation=(panel,open)=>{
    for(const child of [...document.body.children]){
      if(child===panel||child.tagName==="SCRIPT") continue;
      if(open){
        if(!modalInertState.has(child)) modalInertState.set(child,Boolean(child.inert));
        child.inert=true;
      }else if(modalInertState.has(child)){
        child.inert=modalInertState.get(child);
        modalInertState.delete(child);
      }
    }
  };

  const appendBeansMessage=(role,content)=>{
    const wrap=document.createElement("div");
    wrap.className=`nbl-beans-message ${role==="assistant"?"is-beans":"is-user"}`;
    const who=document.createElement("strong");
    who.textContent=role==="assistant"?"Beans":"You";
    const p=document.createElement("p");
    p.textContent=content;
    wrap.append(who,p);
    beansLog.appendChild(wrap);
    beansLog.scrollTop=beansLog.scrollHeight;
  };

  const appendBeansSources=sources=>{
    const list=Array.isArray(sources)?sources.filter(item=>item&&typeof item.url==="string"&&/^https?:\/\//i.test(item.url)).slice(0,8):[];
    if(!list.length) return;
    const box=document.createElement("div");
    box.setAttribute("aria-label","Beans web sources");
    box.style.margin="8px 0 14px";
    box.style.padding="10px 12px";
    box.style.border="1px solid rgba(255,255,255,.12)";
    box.style.borderRadius="12px";
    box.style.background="rgba(255,255,255,.035)";
    const label=document.createElement("strong");
    label.textContent="Sources";
    label.style.display="block";
    label.style.marginBottom="6px";
    box.appendChild(label);
    for(const item of list){
      const a=document.createElement("a");
      a.href=item.url;
      a.target="_blank";
      a.rel="noopener noreferrer";
      a.textContent=String(item.title||item.url).slice(0,160);
      a.style.display="block";
      a.style.margin="4px 0";
      a.style.color="inherit";
      a.style.textDecoration="underline";
      box.appendChild(a);
    }
    beansLog.appendChild(box);
    beansLog.scrollTop=beansLog.scrollHeight;
  };

  const appendBeansImages=images=>{
    const list=Array.isArray(images)?images.filter(src=>typeof src==="string"&&src.startsWith("data:image/")).slice(0,2):[];
    for(const src of list){
      const figure=document.createElement("figure");
      figure.className="nbl-beans-generated";
      const img=document.createElement("img");
      img.src=src;
      img.alt="Image created by Beans";
      img.loading="eager";
      figure.appendChild(img);
      beansLog.appendChild(figure);
    }
    if(list.length) beansLog.scrollTop=beansLog.scrollHeight;
  };

  const setBeansToolMenu=open=>{
    beansToolsMenu.hidden=!open;
    beansToolsToggle.setAttribute("aria-expanded",open?"true":"false");
  };

  const renderBeansToolState=()=>{
    const labels={web:"Live web",code:"Code / data",image:"Create image",auto:"Auto"};
    const hasSpecial=beansToolMode!=="auto";
    beansToolModeLabel.textContent=labels[beansToolMode]||"Auto";
    beansToolState.hidden=!hasSpecial;
    beansAttachmentsEl.hidden=!beansAttachments.length;
    beansAttachmentsEl.replaceChildren();
    for(const [index,item] of beansAttachments.entries()){
      const chip=document.createElement("span");
      chip.className="nbl-beans-attachment-chip";
      const label=document.createElement("span");
      label.textContent=item.name;
      const remove=document.createElement("button");
      remove.type="button";
      remove.setAttribute("aria-label",`Remove ${item.name}`);
      remove.textContent="×";
      remove.addEventListener("click",()=>{
        beansAttachments.splice(index,1);
        renderBeansToolState();
      });
      chip.append(label,remove);
      beansAttachmentsEl.appendChild(chip);
    }
  };

  const clearBeansTools=()=>{
    beansToolMode="auto";
    beansAttachments=[];
    beansFileInput.value="";
    setBeansToolMenu(false);
    renderBeansToolState();
  };

  const fileToBeansAttachment=file=>new Promise((resolve,reject)=>{
    if(!file||file.size>4*1024*1024) return reject(new Error("Each Beans upload must be 4 MB or smaller right now."));
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("That file could not be read."));
    reader.onload=()=>{
      const value=String(reader.result||"");
      const comma=value.indexOf(",");
      if(comma<0) return reject(new Error("That file could not be prepared."));
      resolve({name:file.name||"attachment",mime:file.type||"application/octet-stream",data:value.slice(comma+1),size:file.size});
    };
    reader.readAsDataURL(file);
  });

  const addBeansFiles=async files=>{
    const incoming=[...(files||[])].slice(0,3);
    const next=[...beansAttachments];
    let total=next.reduce((sum,item)=>sum+Number(item.size||0),0);
    for(const file of incoming){
      if(next.length>=3) break;
      if(total+file.size>8*1024*1024) throw new Error("Beans can take up to 8 MB across this message right now.");
      const item=await fileToBeansAttachment(file);
      next.push(item);
      total+=item.size;
    }
    beansAttachments=next;
    renderBeansToolState();
    beansStatus.textContent=`${beansAttachments.length} attachment${beansAttachments.length===1?"":"s"} ready. NBL Chat Plus is required to send them.`;
  };

  const lastBeansReply=()=>[...beansHistory].reverse().find(item=>item.role==="assistant"&&String(item.content||"").trim())?.content||"";

  const startBeansDictation=()=>{
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){
      beansStatus.textContent="Voice dictation is not available in this browser.";
      return;
    }
    const recognition=new SpeechRecognition();
    recognition.lang=navigator.language||"en-US";
    recognition.interimResults=false;
    recognition.maxAlternatives=1;
    beansMic.disabled=true;
    beansStatus.textContent="Listening…";
    recognition.onresult=event=>{
      const text=event.results?.[0]?.[0]?.transcript||"";
      if(text) beansInput.value=(beansInput.value.trim()?beansInput.value.trim()+" ":"")+text;
    };
    recognition.onerror=()=>{beansStatus.textContent="I couldn't hear that clearly. You can type instead.";};
    recognition.onend=()=>{
      beansMic.disabled=false;
      if(beansInput.value.trim()) beansStatus.textContent="Dictation added. Send when ready.";
      beansInput.focus();
    };
    recognition.start();
  };

  const getSignedInNblIdentity=async()=>{
    try{
      const clerk=await getNblClerk();
      if(!clerk?.isSignedIn||!clerk.session) return null;
      const userId=String(clerk.user?.id||clerk.session?.user?.id||"signed-in");
      const token=await clerk.session.getToken();
      if(typeof token!=="string"||!token.trim()) return null;
      return {userId,token:token.trim()};
    }catch{
      return null;
    }
  };

  const currentClerkUserId=()=>{
    if(!nblClerk?.isSignedIn) return null;
    return String(nblClerk.user?.id||nblClerk.session?.user?.id||"signed-in");
  };

  const invalidateBeansHistoryLoad=()=>{
    beansHistoryRequestGeneration++;
    beansHistoryLoadingFor=null;
  };

  const clearBeansTranscript=status=>{
    beansLog.replaceChildren();
    beansHistory.length=0;
    beansHistory.push({role:"assistant",content:"I'm Beans. What's up?"});
    appendBeansMessage("assistant",beansHistory[0].content);
    beansConversationId=null;
    beansHistoryLoadedFor=null;
    beansStatus.textContent=status;
  };

  const clearPlusTranscript=()=>{
    plusHistory.length=0;
    plusHistory.push({role:"assistant",content:"Choose your course and ask me about the lesson."});
    plusLog.replaceChildren();
    appendPlusMessage("assistant",plusHistory[0].content);
  };

  const loadSignedInBeansHistory=async()=>{
    const knownUserId=currentClerkUserId();
    if(knownUserId&&(beansHistoryLoadedFor===knownUserId||beansHistoryLoadingFor===knownUserId)) return;
    const requestGeneration=++beansHistoryRequestGeneration;
    const accountGeneration=beansAccountGeneration;
    const conversationGeneration=beansConversationGeneration;
    const identity=await getSignedInNblIdentity();
    if(requestGeneration!==beansHistoryRequestGeneration||accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration) return;
    if(!identity){
      beansHistoryLoadedFor=null;
      beansHistoryLoadingFor=null;
      return;
    }
    if(beansHistoryLoadedFor===identity.userId||beansHistoryLoadingFor===identity.userId) return;
    if(currentClerkUserId()!==identity.userId) return;
    beansHistoryLoadingFor=identity.userId;
    try{
      const response=await fetch(`${NBL_ACCOUNT_STORE_API}?action=latest`,{
        headers:{Accept:"application/json",Authorization:`Bearer ${identity.token}`},
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(payload.message||"Saved conversation could not be loaded.");
      const currentUserId=currentClerkUserId();
      if(requestGeneration!==beansHistoryRequestGeneration||accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||currentUserId!==identity.userId) return;
      const saved=Array.isArray(payload?.messages)?payload.messages:[];
      beansConversationId=payload?.conversation?.id?String(payload.conversation.id):null;
      if(saved.length){
        beansLog.replaceChildren();
        beansHistory.length=0;
        for(const item of saved.slice(-40)){
          const role=item?.role==="assistant"?"assistant":"user";
          const content=String(item?.content||"").trim();
          if(!content) continue;
          beansHistory.push({role,content});
          appendBeansMessage(role,content);
        }
        beansStatus.textContent="Saved conversation restored from your NBL account.";
      }else{
        beansStatus.textContent="Beans recognizes your NBL account. New conversations will save here.";
      }
      beansHistoryLoadedFor=identity.userId;
    }catch(error){
      if(requestGeneration!==beansHistoryRequestGeneration||accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||error?.name==="AbortError") return;
      beansStatus.textContent=error?.message||"Beans is live. Saved history is temporarily unavailable.";
    }finally{
      if(requestGeneration===beansHistoryRequestGeneration&&beansHistoryLoadingFor===identity.userId) beansHistoryLoadingFor=null;
    }
  };

  const replaceBeansConversation=(messages,conversationId,{status="Saved conversation opened from your NBL account.",loadedFor=null}={})=>{
    const saved=Array.isArray(messages)?messages:[];
    beansLog.replaceChildren();
    beansHistory.length=0;
    for(const item of saved.slice(-80)){
      const role=item?.role==="assistant"?"assistant":"user";
      const content=String(item?.content||"").trim();
      if(!content) continue;
      beansHistory.push({role,content});
      appendBeansMessage(role,content);
    }
    if(!beansHistory.length){
      const welcome={role:"assistant",content:"I'm Beans. What's up?"};
      beansHistory.push(welcome);
      appendBeansMessage(welcome.role,welcome.content);
    }
    beansConversationId=conversationId?String(conversationId):null;
    if(loadedFor) beansHistoryLoadedFor=loadedFor;
    beansStatus.textContent=status;
  };

  const startNewBeansConversation=()=>{
    invalidateBeansHistoryLoad();
    beansConversationGeneration++;
    const userId=currentClerkUserId();
    clearPlusTranscript();
    replaceBeansConversation(
      [{role:"assistant",content:"I'm Beans. What's up?"}],
      null,
      {
        status:userId?"New Beans conversation started. It will save to your NBL account.":"New Beans conversation started.",
        loadedFor:userId
      }
    );
    setChatMode("beans");
  };

  const loadDrawerConversation=async(id)=>{
    invalidateBeansHistoryLoad();
    const requestGeneration=beansHistoryRequestGeneration;
    const accountGeneration=beansAccountGeneration;
    const conversationGeneration=++beansConversationGeneration;
    const userIdAtRequest=currentClerkUserId();
    const identity=await getSignedInNblIdentity();
    if(!identity||requestGeneration!==beansHistoryRequestGeneration||accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||identity.userId!==userIdAtRequest) return;
    chatDrawerHistoryStatus.textContent="Opening conversation…";
    try{
      const response=await fetch(`${NBL_ACCOUNT_STORE_API}?action=conversation&id=${encodeURIComponent(id)}`,{
        headers:{Accept:"application/json",Authorization:`Bearer ${identity.token}`},
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(payload?.message||"That conversation could not be opened.");
      if(requestGeneration!==beansHistoryRequestGeneration||accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||currentClerkUserId()!==identity.userId) return;
      replaceBeansConversation(payload?.messages,id,{loadedFor:identity.userId});
      setChatMode("beans");
      setChatDrawerOpen(false);
    }catch(error){
      if(requestGeneration!==beansHistoryRequestGeneration||accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||error?.name==="AbortError") return;
      chatDrawerHistoryStatus.textContent=error?.message||"That conversation could not be opened.";
    }
  };

  const renderChatDrawerHistory=async()=>{
    const requestGeneration=++drawerHistoryRequestGeneration;
    const accountGeneration=beansAccountGeneration;
    chatDrawerHistoryList.replaceChildren();
    const identity=await getSignedInNblIdentity();
    if(requestGeneration!==drawerHistoryRequestGeneration||accountGeneration!==beansAccountGeneration) return;
    if(!identity){
      chatDrawerHistoryStatus.textContent="Sign in to see saved conversations.";
      return;
    }
    chatDrawerHistoryStatus.textContent="Loading saved conversations…";
    try{
      const response=await fetch(`${NBL_ACCOUNT_STORE_API}?action=conversations`,{
        headers:{Accept:"application/json",Authorization:`Bearer ${identity.token}`},
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(payload?.message||"Saved conversations could not be loaded.");
      if(requestGeneration!==drawerHistoryRequestGeneration||accountGeneration!==beansAccountGeneration||currentClerkUserId()!==identity.userId) return;
      const conversations=Array.isArray(payload?.conversations)?payload.conversations.slice(0,8):[];
      if(!conversations.length){
        chatDrawerHistoryStatus.textContent="No saved Beans conversations yet.";
        return;
      }
      chatDrawerHistoryStatus.textContent="";
      for(const item of conversations){
        const button=document.createElement("button");
        button.type="button";
        button.className="nbl-chat-drawer-history-item";
        const title=document.createElement("strong");
        title.textContent=String(item?.title||"Beans conversation").slice(0,90);
        const when=document.createElement("small");
        const stamp=Date.parse(item?.updated_at||"");
        when.textContent=Number.isFinite(stamp)?new Date(stamp).toLocaleString():"Saved conversation";
        button.append(title,when);
        button.addEventListener("click",()=>{void loadDrawerConversation(item.id)});
        chatDrawerHistoryList.appendChild(button);
      }
    }catch(error){
      if(requestGeneration!==drawerHistoryRequestGeneration||accountGeneration!==beansAccountGeneration) return;
      chatDrawerHistoryStatus.textContent=error?.message||"Saved conversations could not be loaded.";
    }
  };

  const updateChatDrawerAccountAction=async()=>{
    try{
      const clerk=await getNblClerk();
      chatDrawerAccountAction.textContent=clerk?.isSignedIn?"Sign out":"Sign in";
    }catch{
      chatDrawerAccountAction.textContent="Sign in";
    }
  };

  const setChatDrawerOpen=open=>{
    if(chatDrawerCloseTimer){
      clearTimeout(chatDrawerCloseTimer);
      chatDrawerCloseTimer=null;
    }
    if(open){
      chatDrawerOpener=chatDrawerToggle;
      chatDrawer.hidden=false;
      chatDrawerShade.hidden=false;
      chatDrawer.inert=false;
      chatDrawerToggle.setAttribute("aria-expanded","true");
      requestAnimationFrame(()=>chatDrawer.classList.add("is-open"));
      void Promise.all([renderChatDrawerHistory(),updateChatDrawerAccountAction()]);
      window.setTimeout(()=>{
        if(!chatDrawer.hidden&&chatDrawer.classList.contains("is-open")) chatDrawer.querySelector("[data-nbl-chat-drawer-close]")?.focus();
      },20);
      return;
    }
    if(chatDrawer.hidden&&chatDrawerCloseTimer===null) return;
    chatDrawer.classList.remove("is-open");
    chatDrawerToggle.setAttribute("aria-expanded","false");
    chatDrawer.inert=true;
    (chatDrawerOpener?.isConnected?chatDrawerOpener:chatDrawerToggle).focus();
    chatDrawerCloseTimer=setTimeout(()=>{
      chatDrawer.hidden=true;
      chatDrawerShade.hidden=true;
      chatDrawerCloseTimer=null;
    },180);
  };

  chatDrawer.addEventListener("keydown",event=>{
    if(event.key!=="Tab") return;
    const focusable=[...chatDrawer.querySelectorAll('button:not([disabled]),a[href]')].filter(element=>!element.closest("[hidden]"));
    if(!focusable.length){
      event.preventDefault();
      chatDrawer.focus();
      return;
    }
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(event.shiftKey&&(document.activeElement===first||!chatDrawer.contains(document.activeElement))){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey&&(document.activeElement===last||!chatDrawer.contains(document.activeElement))){
      event.preventDefault();
      first.focus();
    }
  });

  const appendPlusMessage=(role,content)=>{
    const wrap=document.createElement("div");
    wrap.className=`nbl-beans-message ${role==="assistant"?"is-beans":"is-user"}`;
    const who=document.createElement("strong");
    who.textContent=role==="assistant"?"Professor Grey":"You";
    const p=document.createElement("p");
    p.textContent=content;
    wrap.append(who,p);
    plusLog.appendChild(wrap);
    plusLog.scrollTop=plusLog.scrollHeight;
  };

  const appendPlusSources=sources=>{
    const list=Array.isArray(sources)?sources.filter(Boolean).slice(0,8):[];
    if(!list.length) return;
    const box=document.createElement("div");
    box.className="nbl-plus-sources";
    const label=document.createElement("strong");
    label.textContent="Sources";
    box.appendChild(label);
    for(const item of list){
      const title=String(item?.title||"NBL University").slice(0,160);
      const course=String(item?.courseCode||"").slice(0,30);
      const page=Number.isFinite(Number(item?.page))?` · p. ${Number(item.page)}`:"";
      const sourceName=String(item?.sourceName||"").slice(0,80);
      const suffix=`${course?` · ${course}`:""}${sourceName&&!course?` · ${sourceName}`:""}${page}`;
      const url=typeof item?.url==="string"&&/^https?:\/\//i.test(item.url)?item.url:"";
      if(url){
        const link=document.createElement("a");
        link.href=url;
        link.target="_blank";
        link.rel="noopener noreferrer";
        link.textContent=`${title}${suffix}`;
        box.appendChild(link);
      }else{
        const line=document.createElement("span");
        line.textContent=`${title}${suffix}`;
        box.appendChild(line);
      }
    }
    plusLog.appendChild(box);
    plusLog.scrollTop=plusLog.scrollHeight;
  };

  const showPlusLocked=(message,{signedOut=false}={})=>{
    plusAllowed=false;
    plusLive.hidden=true;
    plusAccess.hidden=false;
    plusAccessCopy.textContent=message;
    plusSignIn.hidden=!signedOut;
    clearPlusTranscript();
  };

  const showPlusReady=()=>{
    plusAllowed=true;
    plusAccess.hidden=true;
    plusLive.hidden=false;
    plusStatus.textContent=`Professor Grey is ready · ${plusCourse.value}`;
  };

  const refreshPlusAccess=async({force=false}={})=>{
    if(!force&&plusAccessLoadingFor===currentClerkUserId()) return;
    const accessRequestGeneration=++plusAccessRequestGeneration;
    const accountGeneration=beansAccountGeneration;
    const identity=await getSignedInNblIdentity();
    if(accessRequestGeneration!==plusAccessRequestGeneration||accountGeneration!==beansAccountGeneration) return;
    if(!identity){
      plusAccessCheckedFor=null;
      plusAccessLoadingFor=null;
      showPlusLocked("Sign in with your NBL account to check NBL Chat Plus access.",{signedOut:true});
      return;
    }
    if(currentClerkUserId()!==identity.userId) return;
    if(!force&&plusAccessCheckedFor===identity.userId){
      if(plusAllowed) showPlusReady();
      return;
    }
    if(plusAccessLoadingFor===identity.userId) return;
    plusAccessLoadingFor=identity.userId;
    plusSignIn.hidden=true;
    plusAccess.hidden=false;
    plusLive.hidden=true;
    plusAccessCopy.textContent="Checking NBL Chat Plus access…";
    try{
      const response=await fetch(NBL_CHAT_PLUS_API,{
        method:"POST",
        headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${identity.token}`},
        body:JSON.stringify({action:"status"}),
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(accessRequestGeneration!==plusAccessRequestGeneration||accountGeneration!==beansAccountGeneration||currentClerkUserId()!==identity.userId) return;
      if(response.status===401){
        plusAccessCheckedFor=null;
        return showPlusLocked("Your NBL session needs to be refreshed. Sign in again to check Plus access.",{signedOut:true});
      }
      if(!response.ok) throw new Error("NBL Chat Plus access could not be checked right now.");
      plusAccessCheckedFor=identity.userId;
      if(payload?.chatPlus?.allowed===true) showPlusReady();
      else showPlusLocked("Guided Learning requires active course enrollment and Grey access for this account.");
    }catch(error){
      if(accessRequestGeneration!==plusAccessRequestGeneration||accountGeneration!==beansAccountGeneration||currentClerkUserId()!==identity.userId) return;
      plusAccessCheckedFor=null;
      showPlusLocked(error?.message||"NBL Chat Plus access could not be checked right now.");
    }finally{
      if(accessRequestGeneration===plusAccessRequestGeneration&&plusAccessLoadingFor===identity.userId) plusAccessLoadingFor=null;
    }
  };

  const setChatMode=(mode,{focusInput=true}={})=>{
    activeChatMode=mode==="plus"?"plus":"beans";
    const isPlus=activeChatMode==="plus";
    regularBeansShell.hidden=isPlus;
    plusShell.hidden=!isPlus;
    for(const button of modeButtons){
      const selected=button.dataset.nblChatMode===activeChatMode;
      button.classList.toggle("is-active",selected);
      button.setAttribute("aria-selected",selected?"true":"false");
      button.tabIndex=selected?0:-1;
    }
    if(isPlus){
      void refreshPlusAccess();
      if(focusInput) window.setTimeout(()=>{ if(plusAllowed) plusInput.focus(); else if(!plusSignIn.hidden) plusSignIn.focus(); else plusAccess.focus(); },20);
    }else{
      void loadSignedInBeansHistory();
      if(focusInput) window.setTimeout(()=>beansInput.focus(),20);
    }
  };

  const closeBeans=({fromPopState=false}={})=>{
    const shouldConsumeHistory=!fromPopState&&Boolean(chatHistoryEntry)&&window.history.state?.nblChatOverlay===chatHistoryEntry;
    setChatDrawerOpen(false);
    setModalIsolation(beansPanel,false);
    beansPanel.hidden=true;
    document.body.classList.remove("nbl-beans-open");
    beansToggle.setAttribute("aria-expanded","false");
    beansToggle.focus();
    chatHistoryEntry=null;
    if(shouldConsumeHistory) window.history.back();
  };

  const openBeans=()=>{
    if(!beansPanel.hidden) return;
    setOpen(false);
    if(!searchPanel.hidden) closeSearch();
    chatHistoryEntry=`nbl-chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.history.pushState({...window.history.state,nblChatOverlay:chatHistoryEntry},"",location.href);
    beansPanel.hidden=false;
    setModalIsolation(beansPanel,true);
    document.body.classList.add("nbl-beans-open");
    beansToggle.setAttribute("aria-expanded","true");
    if(activeChatMode==="plus") void refreshPlusAccess({force:true});
    else void loadSignedInBeansHistory();
    window.setTimeout(()=>{
      if(activeChatMode==="plus"&&plusAllowed) plusInput.focus();
      else if(activeChatMode==="plus"&&!plusSignIn.hidden) plusSignIn.focus();
      else if(activeChatMode==="plus") plusAccess.focus();
      else if(activeChatMode==="beans") beansInput.focus();
    },20);
  };

  beansForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const text=beansInput.value.trim();
    if(!text) return;
    await loadSignedInBeansHistory();
    const accountGeneration=beansAccountGeneration;
    const conversationGeneration=beansConversationGeneration;
    const requestedUserId=currentClerkUserId();
    beansInput.value="";
    appendBeansMessage("user",text);
    beansHistory.push({role:"user",content:text});
    beansSubmit.disabled=true;
    beansInput.disabled=true;
    beansStatus.textContent="Beans is thinking…";

    try{
      const headers={
        Accept:"application/json",
        "Content-Type":"application/json"
      };
      const accountToken=await getNblBeansAuthToken();
      if(accountToken) headers.Authorization=`Bearer ${accountToken}`;
      const requestId=(globalThis.crypto?.randomUUID?.()||`web-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      const requestBody={action:"chat",mode:"beans",requestId,conversationId:beansConversationId,timeZone:(Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"),messages:beansHistory.slice(-12),toolMode:beansToolMode,attachments:beansAttachments.map(({name,mime,data})=>({name,mime,data}))};
      const endpoint=accountToken?`${NBL_CHAT_GATEWAY_API}/chat`:NBL_BEANS_WEB_API;
      const response=await fetch(endpoint,{
        method:"POST",
        headers,
        body:JSON.stringify(requestBody)
      });
      const payload=await response.json().catch(()=>({}));
      if(accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||currentClerkUserId()!==requestedUserId) return;
      if(!response.ok) throw new Error(payload.message||"Beans could not answer just now.");
      const reply=String(payload.message||payload.reply||"").trim();
      if(!reply) throw new Error("Beans returned no text.");
      if(payload?.conversationId) beansConversationId=String(payload.conversationId);
      beansHistory.push({role:"assistant",content:reply});
      appendBeansMessage("assistant",reply);
      appendBeansSources(payload?.sources);
      appendBeansImages(payload?.generatedImages);
      const used=Array.isArray(payload?.toolsUsed)?payload.toolsUsed:[];
      beansStatus.textContent=payload?.webSearchUsed
        ?"Beans checked the live web."
        :used.includes("code")
          ?"Beans used the code/data tool."
          :used.includes("image")
            ?"Beans created an image."
            :payload?.authenticated
              ?(payload?.username?`Saved to ${payload.username}'s NBL account.`:"Saved to your NBL account.")
              :"Beans replied.";
      clearBeansTools();
    }catch(error){
      if(accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||currentClerkUserId()!==requestedUserId) return;
      const message=error?.message||"Beans could not answer just now.";
      appendBeansMessage("assistant",message);
      beansStatus.textContent=message;
    }finally{
      beansSubmit.disabled=false;
      beansInput.disabled=false;
      beansInput.focus();
    }
  });

  beansToolsToggle.addEventListener("click",()=>setBeansToolMenu(beansToolsMenu.hidden));
  beansToolReset.addEventListener("click",clearBeansTools);
  beansFileInput.addEventListener("change",async()=>{
    try{await addBeansFiles(beansFileInput.files);}catch(error){beansStatus.textContent=error?.message||"That upload could not be added.";}
  });
  beansMic.addEventListener("click",startBeansDictation);
  beansToolsMenu.addEventListener("click",event=>{
    const button=event.target.closest("[data-nbl-tool]");
    if(!button) return;
    const tool=button.dataset.nblTool;
    if(tool==="attach"){
      setBeansToolMenu(false);
      beansFileInput.click();
      return;
    }
    if(tool==="read"){
      setBeansToolMenu(false);
      const reply=lastBeansReply();
      if(!reply){beansStatus.textContent="Beans has not replied yet.";return;}
      if(!("speechSynthesis" in window)){beansStatus.textContent="Read aloud is not available in this browser.";return;}
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(reply));
      beansStatus.textContent="Reading Beans' last reply aloud.";
      return;
    }
    if(["web","code","image"].includes(tool)){
      beansToolMode=tool;
      setBeansToolMenu(false);
      renderBeansToolState();
      beansStatus.textContent=tool==="web"?"Live web selected · NBL Chat Plus.":tool==="code"?"Code / data analysis selected · NBL Chat Plus.":"Image creation selected · NBL Chat Plus.";
      beansInput.focus();
    }
  });
  chatDrawerTools?.addEventListener("click",()=>{
    setChatDrawerOpen(false);
    setBeansToolMenu(true);
    beansToolsToggle.focus();
  });

  plusForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const text=plusInput.value.trim();
    if(!text||!plusAllowed) return;
    const accountGeneration=beansAccountGeneration;
    const accessRequestGeneration=plusAccessRequestGeneration;
    const requestedUserId=currentClerkUserId();
    const identity=await getSignedInNblIdentity();
    if(!identity||accountGeneration!==beansAccountGeneration||accessRequestGeneration!==plusAccessRequestGeneration||!plusAllowed||identity.userId!==requestedUserId){
      if(accountGeneration===beansAccountGeneration&&!identity) showPlusLocked("Sign in with your NBL account to use NBL Chat Plus.",{signedOut:true});
      return;
    }
    if(currentClerkUserId()!==identity.userId){
      showPlusLocked("Sign in with your NBL account to use NBL Chat Plus.",{signedOut:true});
      return;
    }
    plusInput.value="";
    appendPlusMessage("user",text);
    plusHistory.push({role:"user",content:text});
    beansHistory.push({role:"user",content:text});
    plusSubmit.disabled=true;
    plusInput.disabled=true;
    plusCourse.disabled=true;
    plusStatus.textContent="Professor Grey is thinking…";
    try{
      const response=await fetch(NBL_CHAT_PLUS_API,{
        method:"POST",
        headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${identity.token}`},
        body:JSON.stringify({action:"chat",mode:"guided_learning",conversationId:beansConversationId,courseCode:plusCourse.value,messages:beansHistory.slice(-12)})
      });
      const payload=await response.json().catch(()=>({}));
      if(accountGeneration!==beansAccountGeneration||accessRequestGeneration!==plusAccessRequestGeneration||!plusAllowed||currentClerkUserId()!==identity.userId) return;
      if(response.status===401||response.status===403){
        plusAccessCheckedFor=null;
        showPlusLocked(response.status===401?"Your NBL session needs to be refreshed.":"Guided Learning requires active course enrollment and Grey access for this account.",{signedOut:response.status===401});
        return;
      }
      if(!response.ok) throw new Error(payload.message||"Professor Grey could not answer just now.");
      const reply=String(payload.message||"").trim();
      if(!reply) throw new Error("Professor Grey returned no answer.");
      if(payload?.conversationId) beansConversationId=String(payload.conversationId);
      plusHistory.push({role:"assistant",content:reply});
      beansHistory.push({role:"assistant",content:reply});
      appendPlusMessage("assistant",reply);
      appendPlusSources(payload?.sources);
      plusStatus.textContent=`Professor Grey · ${plusCourse.value}`;
    }catch(error){
      if(accountGeneration!==beansAccountGeneration||accessRequestGeneration!==plusAccessRequestGeneration||currentClerkUserId()!==identity.userId) return;
      const message=error?.message||"Professor Grey could not answer just now.";
      appendPlusMessage("assistant",message);
      plusStatus.textContent=message;
    }finally{
      plusSubmit.disabled=false;
      plusInput.disabled=false;
      plusCourse.disabled=false;
      if(plusAllowed) plusInput.focus();
    }
  });

  plusCourse.addEventListener("change",()=>{
    plusHistory.length=0;
    plusHistory.push({role:"assistant",content:"Choose your course and ask me about the lesson."});
    plusLog.replaceChildren();
    appendPlusMessage("assistant","Choose your course and ask me about the lesson.");
    plusStatus.textContent=`Professor Grey is ready · ${plusCourse.value}`;
  });

  plusSignIn.addEventListener("click",()=>{
    location.href=accountPortalUrl("/sign-in");
  });

  chatDrawerToggle.addEventListener("click",()=>setChatDrawerOpen(!chatDrawer.classList.contains("is-open")));
  chatDrawerClose.addEventListener("click",()=>setChatDrawerOpen(false));
  chatDrawerShade.addEventListener("click",()=>setChatDrawerOpen(false));
  chatDrawerNew.addEventListener("click",async()=>{
    setChatDrawerOpen(false);
    await startNewBeansConversation();
  });
  chatDrawerGrey?.addEventListener("click",()=>{
    setChatDrawerOpen(false);
    location.href="/university.html";
  });
  chatDrawerPlans.addEventListener("click",()=>{
    chatDrawerPlanCard.hidden=!chatDrawerPlanCard.hidden;
    chatDrawerPlans.setAttribute("aria-expanded",chatDrawerPlanCard.hidden?"false":"true");
  });
  chatDrawerAccountAction.addEventListener("click",async()=>{
    try{
      const clerk=await getNblClerk();
      if(clerk?.isSignedIn){
        await clerk.signOut();
        beansAccountGeneration++;
        invalidateBeansHistoryLoad();
        plusAccessRequestGeneration++;
        beansIdentityUserId=null;
        beansHistoryLoadedFor=null;
        beansHistoryLoadingFor=null;
        plusAccessCheckedFor=null;
        plusAccessLoadingFor=null;
        plusAllowed=false;
        clearBeansTranscript("You are signed out. Sign in to keep your history.");
        showPlusLocked("Sign in with your NBL account to check NBL Chat Plus access.",{signedOut:true});
        startNewBeansConversation();
        setChatDrawerOpen(false);
        return;
      }
    }catch{}
    location.href=accountPortalUrl("/sign-in");
  });

  for(const button of modeButtons){
    button.addEventListener("click",()=>setChatMode(button.dataset.nblChatMode));
  }
  const modeTabList=beansPanel.querySelector('[role="tablist"]');
  modeTabList.addEventListener("keydown",event=>{
    if(!["ArrowRight","ArrowLeft","Home","End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex=modeButtons.indexOf(document.activeElement);
    const nextIndex=event.key==="Home"?0:event.key==="End"?modeButtons.length-1:(currentIndex+(event.key==="ArrowRight"?1:-1)+modeButtons.length)%modeButtons.length;
    setChatMode(modeButtons[nextIndex].dataset.nblChatMode,{focusInput:false});
    modeButtons[nextIndex].focus();
  });

  void getNblClerk().then(clerk=>{
    if(typeof clerk?.addListener!=="function") return;
    beansIdentityUserId=currentClerkUserId();
    clerk.addListener(()=>{
      const nextUserId=currentClerkUserId();
      const accountChanged=nextUserId!==beansIdentityUserId;
      if(!accountChanged){
        if(!beansPanel.hidden&&chatDrawer.classList.contains("is-open")) void updateChatDrawerAccountAction();
        return;
      }
      beansIdentityUserId=nextUserId;
      beansAccountGeneration++;
      invalidateBeansHistoryLoad();
      drawerHistoryRequestGeneration++;
      plusAccessRequestGeneration++;
      beansHistoryLoadedFor=null;
      plusAccessCheckedFor=null;
      plusAccessLoadingFor=null;
      plusAllowed=false;
      clearBeansTranscript(nextUserId?"Account changed. Saved history is loading…":"You are signed out. Sign in to keep your history.");
      showPlusLocked(nextUserId?"Checking NBL Chat Plus access…":"Sign in with your NBL account to check NBL Chat Plus access.",{signedOut:!nextUserId});
      if(beansPanel.hidden) return;
      if(chatDrawer.classList.contains("is-open")){
        void renderChatDrawerHistory();
        void updateChatDrawerAccountAction();
      }
      if(activeChatMode==="plus") void refreshPlusAccess({force:true});
      else void loadSignedInBeansHistory();
    });
  }).catch(()=>{});

  beansToggle.addEventListener("click",openBeans);
  beansClose.addEventListener("click",closeBeans);
  beansPanel.addEventListener("click",event=>{
    if(event.target===beansPanel) closeBeans();
  });

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
    setModalIsolation(searchPanel,false);
    searchPanel.hidden=true;
    document.body.classList.remove("nbl-search-open");
    if(searchTrigger){
      searchTrigger.setAttribute("aria-expanded","false");
      searchTrigger.focus();
    }
  };

  const openSearch=()=>{
    setOpen(false);
    if(!beansPanel.hidden) closeBeans();
    searchPanel.hidden=false;
    setModalIsolation(searchPanel,true);
    document.body.classList.add("nbl-search-open");
    if(searchTrigger) searchTrigger.setAttribute("aria-expanded","true");
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
        const rawSourceUrl=typeof result?.sourceUrl==="string"?result.sourceUrl.trim():"";
        let sourceUrl="";
        if(rawSourceUrl){
          try{
            const parsedSourceUrl=new URL(rawSourceUrl,location.origin);
            if(parsedSourceUrl.protocol==="https:") sourceUrl=parsedSourceUrl.href;
          }catch{}
        }
        if(sourceUrl){
          const sourceLink=document.createElement("a");
          sourceLink.className="nbl-search-source";
          sourceLink.href=sourceUrl;
          sourceLink.textContent="View public source";
          card.append(sourceLink);
        }
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

    searchMeta.textContent="New Beansland public search";
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
    searchStatus.textContent="Searching New Beansland…";
    searchMeta.textContent="New Beansland public search";

    try{
      const response=await fetch(`${NBL_SEARCH_API}?q=${encodeURIComponent(query)}`,{
        method:"GET",
        headers:{Accept:"application/json"},
        cache:"no-store",
        credentials:"omit",
        signal:controller.signal
      });
      let payload=await response.json().catch(()=>({}));
      if(!response.ok){
        throw new Error(payload?.message||"NBL Search is not ready right now.");
      }
      if(/\b(price|pricing|prices|cost|costs|plan|plans|membership|how much)\b/i.test(query)&&["results","not_found"].includes(payload?.status)){
        const catalogText=[
          `${NBL_PRODUCT_PLANS.beans.name}: ${NBL_PRODUCT_PLANS.beans.price}, ${NBL_PRODUCT_PLANS.beans.replies}.`,
          `${NBL_PRODUCT_PLANS.chatPlus.name}: ${NBL_PRODUCT_PLANS.chatPlus.price}, ${NBL_PRODUCT_PLANS.chatPlus.replies}.`,
          `${NBL_PRODUCT_PLANS.getMore.name}: ${NBL_PRODUCT_PLANS.getMore.price}, ${NBL_PRODUCT_PLANS.getMore.replies}. ${NBL_PRODUCT_PLANS.getMore.expiry}`,
          `${NBL_PRODUCT_PLANS.foundationProgram.name}: ${NBL_PRODUCT_PLANS.foundationProgram.price}.`,
          `${NBL_PRODUCT_PLANS.fullFoundation.name}: ${NBL_PRODUCT_PLANS.fullFoundation.price}.`,
          "These catalog prices do not mean website checkout is available."
        ].join(" ");
        payload={...payload,status:"results",results:[{title:"New Beansland public plan catalog",excerpt:catalogText,sourceUrl:"https://newbeansland.org/nbl-chat-support.html"},...(Array.isArray(payload?.results)?payload.results:[])]};
      }
      renderSearchResults(payload);
    }catch(error){
      if(error?.name==="AbortError") return;
      clearSearchResults();
      searchStatus.textContent=error?.message||"NBL Search is not ready right now. Try again later.";
      searchMeta.textContent="New Beansland public search";
    }finally{
      if(activeSearchController===controller) activeSearchController=null;
      searchSubmit.disabled=false;
      searchInput.disabled=false;
    }
  });

  searchClose.addEventListener("click",closeSearch);
  searchPanel.addEventListener("click",event=>{
    if(event.target===searchPanel) closeSearch();
  });

  const menu=header.querySelector(".nbl-world-menu");
  const setOpen=open=>{
    if(!menu) return;
    header.classList.toggle("is-open",open);
    document.body.classList.toggle("nbl-world-menu-open",open);
    menu.setAttribute("aria-expanded",open?"true":"false");
    menu.setAttribute("aria-label",open?"Close New Beansland worlds":"Open New Beansland worlds");
    menu.textContent=open?"Close":"Worlds";
  };
  if(menu){
    menu.addEventListener("click",()=>setOpen(!header.classList.contains("is-open")));
    header.querySelectorAll(".nbl-world-nav a").forEach(a=>a.addEventListener("click",()=>setOpen(false)));
  }
  window.addEventListener("popstate",()=>{
    if(beansPanel.hidden) return;
    if(chatDrawer.classList.contains("is-open")){
      setChatDrawerOpen(false);
      if(chatHistoryEntry) window.history.pushState({...window.history.state,nblChatOverlay:chatHistoryEntry},"",location.href);
      return;
    }
    closeBeans({fromPopState:true});
  });
  document.addEventListener("keydown",event=>{
    if(event.key!=="Escape") return;
    if(!beansPanel.hidden){
      if(chatDrawer.classList.contains("is-open")){
        setChatDrawerOpen(false);
        return;
      }
      closeBeans();
      return;
    }
    if(!searchPanel.hidden){
      closeSearch();
      return;
    }
    if(menu) setOpen(false);
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
  document.body.append(beansPanel);
  document.body.classList.add("nbl-world-ready");
  setupNblAccountUi(header);

  if(room.key==="home"&&!document.querySelector(".nbl-beta-signup")){
    const beta=document.createElement("section");
    beta.className="nbl-beta-signup";
    beta.setAttribute("aria-labelledby","nbl-beta-title");
    beta.innerHTML=`
      <div class="nbl-beta-inner">
        <img class="nbl-beta-beans" src="/NBLChat_Beans.png" alt="Beans from NBL Chat">
        <p class="nbl-beta-kicker">NBL Chat · What’s next</p>
        <h2 id="nbl-beta-title">Get updates on what Beans is building next.</h2>
        <p>Join the NBL email list for updates about future NBL Chat features and upcoming testing opportunities.</p>
        <form class="nbl-beta-form">
          <label for="nbl-beta-email">Email address</label>
          <div class="nbl-beta-row">
            <input id="nbl-beta-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
            <button type="submit">Get future updates</button>
          </div>
          <small>Your address is not stored on this website. Submitting opens an email to New Beansland so you can request future-feature updates.</small>
        </form>
      </div>`;
    beta.querySelector("form").addEventListener("submit",event=>{
      event.preventDefault();
      const email=beta.querySelector("input").value.trim();
      if(!email) return;
      const subject=encodeURIComponent("NBL Chat Future Features");
      const body=encodeURIComponent(`Please add ${email} to the NBL Chat future-features update list.`);
      location.href=`mailto:founder@newbeansland.org?subject=${subject}&body=${body}`;
    });
    document.body.append(beta);
  }

  if(!document.querySelector(".nbl-world-footer")){
    const footer=document.createElement("footer");
    footer.className="nbl-world-footer";
    footer.innerHTML=room.key==="home"?`
      <div class="nbl-world-footer-inner">
        <p class="nbl-world-footer-mark"><strong>New Beansland™</strong> Stories. Questions. Worlds.</p>
        <nav class="nbl-world-footer-links" aria-label="New Beansland footer navigation">
          <a href="/about.html">About NBL</a>
          <span class="nbl-social-links" aria-label="New Beansland social media">
            <a class="nbl-social-link" href="https://www.facebook.com/share/1GmSXTMfDs/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.414c0-3.025 1.792-4.695 4.533-4.695 1.312 0 2.686.236 2.686.236v2.969h-1.513c-1.491 0-1.956.93-1.956 1.885v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.099 24 12.073z"/></svg>
            </a>
            <a class="nbl-social-link" href="https://www.youtube.com/@FounderNBL" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.5v-7L15.9 12l-6.3 3.5z"/></svg>
            </a>
            <a class="nbl-social-link" href="https://www.instagram.com/newbeansland/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.7" r="1.2"/></svg>
            </a>
            <a class="nbl-social-link" href="https://x.com/FounderNBL" target="_blank" rel="noopener noreferrer" aria-label="X" title="X">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
            </a>
          </span>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/nbl-chat-support.html">Support</a>
          <a href="/nbl-chat-legal.html">Legal</a>
          <a href="mailto:founder@newbeansland.org">Contact</a>
        </nav>
      </div>`:`
      <div class="nbl-world-footer-inner">
        <p class="nbl-world-footer-mark"><strong>New Beansland™</strong> Stories. Questions. Worlds.</p>
        <nav class="nbl-world-footer-links" aria-label="New Beansland footer navigation">
          <a href="/about.html">About NBL</a>
          <a href="#nbl-search" data-nbl-open-search>Search NBL</a>
          <a href="https://www.youtube.com/@FounderNBL" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="https://www.instagram.com/newbeansland/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://x.com/FounderNBL" target="_blank" rel="noopener noreferrer">X</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/nbl-chat-support.html">Support</a>
          <a href="/nbl-chat-legal.html">Legal</a>
          <a href="mailto:founder@newbeansland.org">Contact</a>
        </nav>
      </div>`;
    document.body.append(footer);
  }

  const footerSearch=document.querySelector("[data-nbl-footer-search]");
  if(footerSearch){
    footerSearch.addEventListener("click",()=>{
      searchTrigger=footerSearch;
      if(searchPanel.hidden) openSearch();
      else closeSearch();
    });
  }
  document.addEventListener("click",event=>{
    const searchLink=event.target?.closest?.("[data-nbl-open-search]");
    if(!searchLink) return;
    event.preventDefault();
    searchTrigger=searchLink;
    openSearch();
  });
})();