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
    if(/\/privacy\.html$/.test(path)||/\/terms\.html$/.test(path)||/\/account-deletion\.html$/.test(path)||/\/nbl-chat-/.test(path)) return {label:"NBL Chat™ Legal",key:"legal"};
    return {label:"Stories · Questions · Worlds",key:""};
  })();

  const nav=[
    ["home","Home","/",false],
    ["university","University","/university.html",false],
    ["books","Books","/books.html",false],
    ["clothing","Clothing","https://new-beansland.myshopify.com",true],
    ["shop","Shop","https://new-beansland.myshopify.com",true],
    ["kids","NBL Kids","/nbl-kids.html",false],
    ["stories","TV & Film","/stories.html",false],
    ["studio","Timmy V Studios","/studio/",false],
    ["office","Founder’s Office","/founder-office.html",false],
    ["search","Search","#nbl-search",false]
  ];

  const NBL_CHAT_PLUS_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-foundation-runtime";
  const NBL_CORE_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core";
  const NBL_CHAT_GATEWAY_API=NBL_CORE_API;
  const NBL_ACCOUNT_STORE_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-account";
  const NBL_FULFILLMENT_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/locke-fulfillment";
  const NBL_SEARCH_API=`${NBL_CORE_API}/search`;
  const NBL_BEANS_WEB_API=`${NBL_CORE_API}/chat`;
  const NBL_PRODUCT_PLANS=window.NBL_PRODUCT_PLANS;
  const NBL_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
  const NBL_ACCOUNT_PORTAL="https://accounts.newbeansland.org";
  let nblClerkPromise=null;
  let nblClerk=null;

  const safeReturnUrl=(href=location.href)=>{
    let url;
    try{
      url=new URL(href,location.href);
    }catch{
      url=new URL("/",location.origin);
    }
    if(!["http:","https:"].includes(url.protocol)||url.origin!==location.origin){
      url=new URL("/",location.origin);
    }
    url.username="";
    url.password="";
    url.hash="";
    for(const key of ["__clerk_synced","__clerk_status","session_id"]){
      url.searchParams.delete(key);
    }
    return url.href;
  };

  const accountPortalUrl=(page="/sign-in",href=location.href)=>{
    const portalPage=page==="/user"?"/user":"/sign-in";
    const redirectUrl=encodeURIComponent(safeReturnUrl(href));
    return `${NBL_ACCOUNT_PORTAL}${portalPage}?redirect_url=${redirectUrl}`;
  };

  window.NBLAuthFlow=Object.freeze({safeReturnUrl,accountPortalUrl});

  const loadExternalScript=(src,attributes={})=>new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(script=>script.src===src);
    if(existing){
      if(existing.dataset.nblLoaded==="true") return resolve();
      if(existing.dataset.nblFailed==="true") return reject(new Error("Authentication service failed to load."));
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
    script.addEventListener("error",()=>{
      script.dataset.nblFailed="true";
      reject(new Error("Authentication service failed to load."));
    },{once:true});
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

  const trustedNblBillingDestination=value=>{
    const url=new URL(String(value||""));
    if(url.protocol!=="https:"||!["buy.stripe.com","billing.stripe.com"].includes(url.hostname)){
      throw new Error("The secure billing destination could not be verified.");
    }
    return url.href;
  };
  const requestNblBilling=async({plan=null,portal=false}={})=>{
    const token=await getNblBeansAuthToken();
    if(!token) return {signInRequired:true,signInUrl:accountPortalUrl("/sign-in")};
    const route=portal?"/billing/portal":"/billing/checkout";
    const response=await fetch(`${NBL_CHAT_GATEWAY_API}${route}`,{
      method:"POST",
      headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify(portal?{}:{plan}),
      cache:"no-store"
    });
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(payload?.message||"Secure billing is temporarily unavailable.");
    const destination=portal
      ?payload?.portalUrl
      :payload?.route==="manage_existing_subscription"
        ?payload?.portalUrl
        :payload?.checkoutUrl;
    return {
      signInRequired:false,
      payload,
      destination:trustedNblBillingDestination(destination)
    };
  };

  const requestNblMeter=async()=>{
    const token=await getNblBeansAuthToken();
    if(!token) return {signInRequired:true,signInUrl:accountPortalUrl("/sign-in"),meter:null};
    const response=await fetch(`${NBL_CHAT_GATEWAY_API}/chat/meter`,{
      method:"GET",
      headers:{Accept:"application/json",Authorization:`Bearer ${token}`},
      cache:"no-store"
    });
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(payload?.message||"Membership status is temporarily unavailable.");
    return {signInRequired:false,meter:payload?.meter||null};
  };

  window.NBLBillingBridge={
    checkout:plan=>requestNblBilling({plan}),
    portal:()=>requestNblBilling({portal:true}),
    meter:requestNblMeter
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
        <p class="nbl-connected-account-kicker">Student account</p>
        <h2 id="nbl-connected-account-title">Use the same NBL account for enrollment and the campus.</h2>
        <p>You can browse the University without signing in. Enrollment checkout requires your NBL account so LOCKE can attach the verified Stripe purchase to the correct student record.</p>
        <div class="nbl-connected-account-actions">
          <button type="button" data-nbl-panel-signin>Sign in / Create account</button>
        </div>
        <p class="nbl-connected-account-status" data-nbl-panel-status>Sign in before enrollment checkout.</p>
        <small>LOCKE checks University access server-side. Stripe handles payment; University doors open only after the verified purchase is attached to this NBL identity.</small>
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
      statusEl.textContent="Checking NBL University access…";
      const token=await clerk.session.getToken();
      const response=await fetch(NBL_CHAT_PLUS_API,{
        method:"POST",
        headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({action:"status"}),
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(response.status===401){
        statusEl.textContent="Your NBL session needs to be refreshed. Sign in again to check NBL University access.";
        return;
      }
      if(!response.ok) throw new Error("NBL University access could not be checked right now.");
      statusEl.textContent=payload?.university?.allowed===true
        ?"Account connected. NBL University access is active for this account."
        :"Account connected. NBL University enrollment is not active for this account.";
    }catch(error){
      statusEl.textContent=error?.message||"NBL University access is temporarily unavailable.";
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
        void (async()=>{
          try{
            const token=await getNblBeansAuthToken();
            if(!token) return;
            const response=await fetch(NBL_FULFILLMENT_API,{
              method:"POST",
              headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${token}`},
              body:JSON.stringify({operation:"founder_pending_count"}),
              cache:"no-store"
            });
            if(!response.ok) return;
            const payload=await response.json().catch(()=>({}));
            const pending=Number(payload?.pending||0);
            if(pending>0){
              addAuxButton(`LOCKE ${pending}`,()=>{location.href="/account.html#founder-actions"});
            }
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
        if(panelStatus) panelStatus.textContent="Sign in before enrollment checkout.";
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
        <button class="nbl-world-beans-toggle nbl-world-chat-launch" type="button" aria-expanded="false" aria-controls="nbl-beans-panel" aria-label="Open NBL Chat™">
          <img src="/NBLChat_Beans.png" alt="" aria-hidden="true">
          <span>NBL Chat™</span>
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
      <button class="nbl-world-beans-toggle" type="button" aria-expanded="false" aria-controls="nbl-beans-panel" aria-label="Open NBL Chat™">NBL Chat™</button>
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
  beansPanel.setAttribute("aria-label","NBL Chat™");
  beansPanel.innerHTML=`
    <div class="nbl-beans-card" role="dialog" aria-modal="true" aria-labelledby="nbl-beans-title">
      <div class="nbl-beans-head">
        <button class="nbl-chat-drawer-toggle" type="button" data-nbl-chat-drawer-toggle aria-expanded="false" aria-controls="nbl-chat-drawer" aria-label="Open NBL Chat™ menu">
          <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="" aria-hidden="true">
        </button>
        <div class="nbl-beans-title-wrap">
          <img src="/NBLChat_Beans.png" alt="Beans" class="nbl-beans-avatar">
          <div>
            <p class="nbl-beans-kicker">New Beansland</p>
            <h2 id="nbl-beans-title">NBL Chat™</h2>
            <p class="nbl-beans-note">Beans is NBL Chat™. NBL CHAT PLUS™ adds premium Beans tools. NBL CHAT PLUS™ + University adds Professor Grey™ and the Virgo System™ for guided course teaching — powered by OpenAI. Protected course teaching remains controlled by LOCKE and the account’s University entitlement.</p>
          </div>
        </div>
        <button class="nbl-beans-close" type="button" data-nbl-beans-close aria-label="Close NBL Chat™">✕</button>
      </div>

      <div class="nbl-chat-drawer-shade" data-nbl-chat-drawer-shade hidden></div>
      <aside class="nbl-chat-drawer" id="nbl-chat-drawer" data-nbl-chat-drawer aria-label="NBL Chat™ menu" tabindex="-1" hidden>
        <div class="nbl-chat-drawer-head">
          <img src="/NBLChat_Beans.png" alt="Beans" class="nbl-chat-drawer-logo">
          <div>
            <p>New Beansland™</p>
            <strong>NBL Chat™</strong>
            <small>Beans, tools, history, and your NBL account.</small>
          </div>
          <button type="button" data-nbl-chat-drawer-close aria-label="Close NBL Chat™ menu">✕</button>
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
            <span><strong>Professor Grey™</strong><small>Virgo System™ faculty layer · NBL University entitlement required</small></span>
          </button>

          <button class="nbl-chat-drawer-item" type="button" data-nbl-drawer-plans aria-expanded="false">
            <img src="/NBL-New-Official-Seal.png?v=c52ddcff" alt="" aria-hidden="true">
            <span><strong>Membership &amp; plans</strong><small>${NBL_PRODUCT_PLANS.beans.price} NBL Chat™ · ${NBL_PRODUCT_PLANS.chatPlus.price} NBL CHAT PLUS™ · ${NBL_PRODUCT_PLANS.chatPlusUniversity.price} + University · Get More</small></span>
          </button>
          <div class="nbl-chat-drawer-plans" data-nbl-drawer-plan-card hidden>
            <article><strong>${NBL_PRODUCT_PLANS.beans.name} · ${NBL_PRODUCT_PLANS.beans.price}</strong><span>${NBL_PRODUCT_PLANS.beans.replies} per billing period.</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="beans">Choose Beans</button></article>
            <article><strong>${NBL_PRODUCT_PLANS.chatPlus.name} · ${NBL_PRODUCT_PLANS.chatPlus.price}</strong><span>${NBL_PRODUCT_PLANS.chatPlus.replies} + plan-approved premium Beans tools. ${NBL_PRODUCT_PLANS.chatPlus.brandLine}. No University course teaching.</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="chat_plus">Choose NBL CHAT PLUS™</button></article>
            <article><strong>${NBL_PRODUCT_PLANS.chatPlusUniversity.name} · ${NBL_PRODUCT_PLANS.chatPlusUniversity.price}</strong><span>${NBL_PRODUCT_PLANS.chatPlusUniversity.replies}. ${NBL_PRODUCT_PLANS.chatPlusUniversity.brandLine}. Physical books are not included in this monthly tier.</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="chat_plus_university">Choose Plus + University</button></article>
            <article><strong>${NBL_PRODUCT_PLANS.getMore.name} · ${NBL_PRODUCT_PLANS.getMore.price}</strong><span>${NBL_PRODUCT_PLANS.getMore.replies}. ${NBL_PRODUCT_PLANS.getMore.expiry}</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="topup_500">Get +500 replies</button></article>
            <article><strong>${NBL_PRODUCT_PLANS.foundationProgram.name} · ${NBL_PRODUCT_PLANS.foundationProgram.price}</strong><span>2 physical books + 2 ebooks + one month regular NBL Chat™. Self-directed/offline coursework is supported: complete the work, upload the PDF, and use NBL's grading flow. No University month included.</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="foundation">Choose Foundation</button></article>
            <article><strong>${NBL_PRODUCT_PLANS.guidedFoundation.name} · ${NBL_PRODUCT_PLANS.guidedFoundation.price}</strong><span>Foundation physical + digital materials plus one month of the full University guided experience with Professor Grey™ / Virgo System™.</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="full_foundation">Choose Guided Foundation</button></article>
            <article><strong>${NBL_PRODUCT_PLANS.fullNblu.name} · ${NBL_PRODUCT_PLANS.fullNblu.price}</strong><span>Six months of the full University experience plus the staged physical-book and ebook entitlement across the planned program as material is completed and released. Shipping may be charged separately for physical stage packs.</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="full_nblu">Choose Full NBLU</button></article>
            <article><strong>${NBL_PRODUCT_PLANS.nbluContinuation.name} · ${NBL_PRODUCT_PLANS.nbluContinuation.price}</strong><span>Owner-only continuation after the included six-month Full NBLU guided period.</span><button class="nbl-billing-action" type="button" data-nbl-billing-plan="nblu_continuation">Continue Full NBLU</button></article>
            <button class="nbl-billing-manage" type="button" data-nbl-billing-portal>Manage billing</button>
            <p class="nbl-billing-status" data-nbl-billing-status role="status">Sign in with your NBL account before checkout so LOCKE can attach the purchase to the right account.</p>
          </div>

          <a class="nbl-chat-drawer-item" href="/university.html">
            <img src="/NBL_University.png" alt="" aria-hidden="true">
            <span><strong>NBL University</strong><small>Courses and University doors · separate from Chat Plus</small></span>
          </a>

          <button class="nbl-chat-drawer-item" type="button" data-nbl-drawer-tools>
            <span class="nbl-chat-drawer-fallback" aria-hidden="true">+</span>
            <span><strong>Beans tools</strong><small>Photos, saved knowledge, web, code/data, images, and voice</small></span>
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

      <div class="nbl-chat-modes" role="tablist" aria-label="NBL Chat™ mode">
        <button id="nbl-chat-tab-beans" type="button" class="is-active" data-nbl-chat-mode="beans" role="tab" aria-controls="nbl-chat-panel-beans" aria-selected="true" tabindex="0">Beans</button>
        <button id="nbl-chat-tab-plus" type="button" data-nbl-chat-mode="plus" role="tab" aria-controls="nbl-chat-panel-plus" aria-selected="false" aria-label="NBL University Professor Grey™ / Virgo System™" tabindex="-1" hidden>University</button>
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
          <div class="nbl-beans-knowledge" data-nbl-beans-knowledge hidden></div>
          <div class="nbl-beans-composer">
            <div class="nbl-beans-tools-wrap">
              <button class="nbl-beans-tool-toggle" type="button" data-nbl-tools-toggle aria-expanded="false" aria-controls="nbl-beans-tools-menu" aria-label="Open Beans tools">+</button>
              <div class="nbl-beans-tools-menu" id="nbl-beans-tools-menu" data-nbl-tools-menu hidden>
                <button type="button" data-nbl-tool="attach"><strong>Photo / file</strong><span>Analyze an image, PDF, text, CSV, or JSON file · Plus</span></button>
                <button type="button" data-nbl-tool="knowledge-upload"><strong>Save knowledge file</strong><span>Keep a supported file searchable across chats · Plus</span></button>
                <button type="button" data-nbl-tool="knowledge"><strong>Search saved knowledge</strong><span>Ask Beans about files saved to your NBL account · Plus</span></button>
                <button type="button" data-nbl-tool="web"><strong>Search the live web</strong><span>Force a current web search · Plus</span></button>
                <button type="button" data-nbl-tool="code"><strong>Code / data analysis</strong><span>Run Python in a secure OpenAI container · Plus</span></button>
                <button type="button" data-nbl-tool="image"><strong>Create an image</strong><span>Generate an image from your next prompt · Plus</span></button>
                <button type="button" data-nbl-tool="voice-mode"><strong>OpenAI voice mode</strong><span>Speak with Beans and hear replies · Plus</span></button>
                <button type="button" data-nbl-tool="read"><strong>Read last reply</strong><span>OpenAI voice on Plus; browser voice otherwise</span></button>
              </div>
              <input data-nbl-beans-file type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown,text/csv,application/json" multiple hidden>
              <input data-nbl-beans-knowledge-file type="file" accept=".pdf,.txt,.md,.json,.html,.css,.js,.ts,.py,.doc,.docx,.pptx,.c,.cpp,.cs,.go,.java,.php,.rb,.sh,.tex,application/pdf,application/json,text/plain,text/markdown,text/html" hidden>
            </div>
            <textarea id="nbl-beans-input" name="message" rows="2" maxlength="4000" placeholder="Ask Beans anything…" required></textarea>
            <button class="nbl-beans-mic" type="button" data-nbl-beans-mic aria-label="Dictate a message to Beans">🎙</button>
            <button class="nbl-beans-stop" type="button" data-nbl-beans-stop aria-label="Stop Beans response" hidden>Stop</button>
            <button class="nbl-beans-send" type="submit">Send</button>
          </div>
        </form>
        <p class="nbl-beans-note" style="margin-top:10px">
          Signed-in chats may be stored with your NBL account and processed by service providers to provide NBL Chat™. Beans can make mistakes, so verify important information and do not rely on Beans alone for legal, medical, financial, or safety decisions. <a href="/privacy.html" style="color:inherit;text-decoration:underline">Privacy</a>
        </p>
        <p class="nbl-beans-status" data-nbl-beans-status role="status">Beans includes limited free replies. Sign in to keep your history and use your NBL membership.</p>
      </section>

      <section id="nbl-chat-panel-plus" class="nbl-plus-shell" role="tabpanel" aria-labelledby="nbl-chat-tab-plus" tabindex="0" data-nbl-plus hidden>
        <div class="nbl-plus-access" data-nbl-plus-access tabindex="-1">
          <p class="nbl-beans-kicker">NBL CHAT PLUS™ + University</p>
          <h3>Professor Grey™ · Virgo System™ · powered by OpenAI</h3>
          <p data-nbl-plus-access-copy>Turn on Guided Learning after LOCKE confirms your course enrollment and Professor Grey™ access.</p>
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
            <div class="nbl-beans-message is-beans"><strong>Professor Grey™</strong><p>Choose your course and ask me about the lesson.</p></div>
          </div>
          <form class="nbl-beans-form" data-nbl-plus-form>
            <label for="nbl-plus-input">Ask Professor Grey™</label>
            <div class="nbl-beans-row">
              <textarea id="nbl-plus-input" name="message" rows="2" maxlength="3500" placeholder="Ask about your course…" required></textarea>
              <button type="submit">Send</button>
            </div>
          </form>
          <p class="nbl-beans-note" style="margin-top:10px">Professor Grey™ is the teaching persona inside the Virgo System™, powered by OpenAI. Course teaching and practice remain available only when LOCKE confirms eligible NBL University access; test answers, rubrics, grading keys, and future assessment material stay sealed.</p>
          <p class="nbl-beans-status" data-nbl-plus-status role="status">Professor Grey™ is ready for the selected course.</p>
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
  const billingButtons=[...beansPanel.querySelectorAll("[data-nbl-billing-plan]")];
  const billingPortal=beansPanel.querySelector("[data-nbl-billing-portal]");
  const billingStatus=beansPanel.querySelector("[data-nbl-billing-status]");
  const chatDrawerHistoryStatus=beansPanel.querySelector("[data-nbl-drawer-history-status]");
  const chatDrawerHistoryList=beansPanel.querySelector("[data-nbl-drawer-history-list]");
  const chatDrawerAccountAction=beansPanel.querySelector("[data-nbl-drawer-account-action]");
  const beansForm=beansPanel.querySelector("[data-nbl-beans-form]");
  const beansInput=beansPanel.querySelector("#nbl-beans-input");
  const beansSubmit=beansForm.querySelector('button[type="submit"]');
  const beansToolsToggle=beansPanel.querySelector("[data-nbl-tools-toggle]");
  const beansToolsMenu=beansPanel.querySelector("[data-nbl-tools-menu]");
  const beansFileInput=beansPanel.querySelector("[data-nbl-beans-file]");
  const beansKnowledgeFileInput=beansPanel.querySelector("[data-nbl-beans-knowledge-file]");
  const beansAttachmentsEl=beansPanel.querySelector("[data-nbl-beans-attachments]");
  const beansKnowledgeEl=beansPanel.querySelector("[data-nbl-beans-knowledge]");
  const beansToolState=beansPanel.querySelector("[data-nbl-tool-state]");
  const beansToolModeLabel=beansPanel.querySelector("[data-nbl-tool-mode-label]");
  const beansToolReset=beansPanel.querySelector("[data-nbl-tool-reset]");
  const beansMic=beansPanel.querySelector("[data-nbl-beans-mic]");
  const beansStop=beansPanel.querySelector("[data-nbl-beans-stop]");
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
  let beansKnowledgeState=null;
  let beansVoiceMode=false;
  let beansVoiceRecorder=null;
  let beansVoiceStream=null;
  let beansVoiceChunks=[];
  let beansVoicePlayer=null;
  let activeBeansChatController=null;

  const setBeansBusy=busy=>{
    beansForm.toggleAttribute("aria-busy",Boolean(busy));
    beansSubmit.disabled=Boolean(busy);
    beansStop.hidden=!busy;
  };

  const cancelActiveBeansChat=({announce=false}={})=>{
    if(activeBeansChatController){
      activeBeansChatController.abort();
      activeBeansChatController=null;
    }
    setBeansBusy(false);
    if(announce) beansStatus.textContent="Stopped. Your message stays in this conversation.";
  };

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

  const copyBeansText=async value=>{
    const text=String(value||"");
    if(!text) return false;
    try{
      await navigator.clipboard.writeText(text);
      return true;
    }catch{
      const area=document.createElement("textarea");
      area.value=text;
      area.setAttribute("readonly","");
      area.style.position="fixed";
      area.style.opacity="0";
      document.body.appendChild(area);
      area.select();
      let copied=false;
      try{copied=document.execCommand("copy");}catch{}
      area.remove();
      return copied;
    }
  };

  const appendBeansInline=(host,value)=>{
    const text=String(value||"");
    const pattern=/(`[^`\n]+`|https?:\/\/[^\s<]+)/g;
    let cursor=0;
    for(const match of text.matchAll(pattern)){
      const index=match.index??0;
      if(index>cursor) host.append(document.createTextNode(text.slice(cursor,index)));
      const token=match[0];
      if(token.startsWith("`")&&token.endsWith("`")){
        const code=document.createElement("code");
        code.textContent=token.slice(1,-1);
        host.append(code);
      }else{
        try{
          const url=new URL(token);
          if(url.protocol==="http:"||url.protocol==="https:"){
            const link=document.createElement("a");
            link.href=url.href;
            link.target="_blank";
            link.rel="noopener noreferrer";
            link.textContent=token;
            host.append(link);
          }else host.append(document.createTextNode(token));
        }catch{host.append(document.createTextNode(token));}
      }
      cursor=index+token.length;
    }
    if(cursor<text.length) host.append(document.createTextNode(text.slice(cursor)));
  };

  const renderBeansContent=(host,value)=>{
    host.replaceChildren();
    const text=String(value||"").replace(/\r\n/g,"\n");
    const segments=text.split("```");
    for(let index=0;index<segments.length;index++){
      const segment=segments[index];
      if(!segment) continue;
      if(index%2===1){
        const newline=segment.indexOf("\n");
        const maybeLanguage=newline>=0?segment.slice(0,newline).trim():"";
        const codeText=(newline>=0&&/^[a-z0-9_+#.-]{1,24}$/i.test(maybeLanguage)?segment.slice(newline+1):segment).replace(/\n$/,"");
        const block=document.createElement("div");
        block.className="nbl-beans-code";
        const toolbar=document.createElement("div");
        toolbar.className="nbl-beans-code-head";
        const label=document.createElement("span");
        label.textContent=(newline>=0&&/^[a-z0-9_+#.-]{1,24}$/i.test(maybeLanguage)?maybeLanguage:"code");
        const copy=document.createElement("button");
        copy.type="button";
        copy.textContent="Copy";
        copy.addEventListener("click",async()=>{
          const ok=await copyBeansText(codeText);
          copy.textContent=ok?"Copied":"Copy";
          window.setTimeout(()=>{copy.textContent="Copy";},1200);
        });
        toolbar.append(label,copy);
        const pre=document.createElement("pre");
        const code=document.createElement("code");
        code.textContent=codeText;
        pre.append(code);
        block.append(toolbar,pre);
        host.append(block);
        continue;
      }

      let list=null;
      let listType="";
      for(const rawLine of segment.split("\n")){
        const line=rawLine.trimEnd();
        if(!line.trim()){
          list=null;
          listType="";
          continue;
        }
        const bullet=line.match(/^\s*[-*]\s+(.+)$/);
        const numbered=line.match(/^\s*\d+[.)]\s+(.+)$/);
        const heading=line.match(/^\s*#{1,3}\s+(.+)$/);
        if(bullet||numbered){
          const type=bullet?"ul":"ol";
          if(!list||listType!==type){
            list=document.createElement(type);
            listType=type;
            host.append(list);
          }
          const item=document.createElement("li");
          appendBeansInline(item,(bullet||numbered)[1]);
          list.append(item);
          continue;
        }
        list=null;
        listType="";
        if(heading){
          const h=document.createElement("h4");
          appendBeansInline(h,heading[1]);
          host.append(h);
          continue;
        }
        const p=document.createElement("p");
        appendBeansInline(p,line);
        host.append(p);
      }
    }
  };

  const appendBeansMessage=(role,content,speaker="Beans")=>{
    const wrap=document.createElement("div");
    wrap.className=`nbl-beans-message ${role==="assistant"?"is-beans":"is-user"}`;
    const who=document.createElement("strong");
    who.textContent=role==="assistant"?(speaker||"Beans"):"You";
    const body=document.createElement("div");
    body.className="nbl-beans-message-body";
    if(role==="assistant") renderBeansContent(body,content);
    else{
      const p=document.createElement("p");
      p.textContent=content;
      body.append(p);
    }
    wrap.append(who,body);
    if(role==="assistant"){
      const actions=document.createElement("div");
      actions.className="nbl-beans-message-actions";
      const copy=document.createElement("button");
      copy.type="button";
      copy.textContent="Copy";
      copy.setAttribute("aria-label","Copy Beans reply");
      copy.addEventListener("click",async()=>{
        const ok=await copyBeansText(content);
        copy.textContent=ok?"Copied":"Copy";
        window.setTimeout(()=>{copy.textContent="Copy";},1200);
      });
      const read=document.createElement("button");
      read.type="button";
      read.textContent="Read";
      read.setAttribute("aria-label","Read Beans reply aloud");
      read.addEventListener("click",()=>{void speakBeansReply(content);});
      actions.append(copy,read);
      wrap.append(actions);
    }
    beansLog.appendChild(wrap);
    beansLog.scrollTop=beansLog.scrollHeight;
    return wrap;
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

  const appendBeansFileSources=sources=>{
    const list=Array.isArray(sources)?sources.filter(item=>item&&typeof item.filename==="string").slice(0,8):[];
    if(!list.length) return;
    const box=document.createElement("div");
    box.setAttribute("aria-label","Beans saved knowledge sources");
    box.style.margin="8px 0 14px";
    box.style.padding="10px 12px";
    box.style.border="1px solid rgba(255,255,255,.12)";
    box.style.borderRadius="12px";
    box.style.background="rgba(255,255,255,.035)";
    const label=document.createElement("strong");
    label.textContent="Saved knowledge";
    label.style.display="block";
    label.style.marginBottom="6px";
    box.appendChild(label);
    for(const item of list){
      const row=document.createElement("div");
      row.textContent=String(item.filename||"Saved file").slice(0,180);
      row.style.margin="4px 0";
      box.appendChild(row);
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
    const labels={web:"Live web",code:"Code / data",image:"Create image",knowledge:"Saved knowledge",grey:"Professor Grey™",auto:"Auto"};
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
    beansStatus.textContent=`${beansAttachments.length} attachment${beansAttachments.length===1?"":"s"} ready. NBL CHAT PLUS™ is required to send them.`;
  };

  const callBeansUtility=async(route,body={})=>{
    const token=await getNblBeansAuthToken();
    if(!token) throw new Error("Sign in with your NBL account first.");
    const response=await fetch(`${NBL_CHAT_GATEWAY_API}${route}`,{
      method:"POST",
      headers:{Accept:"application/json","Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify(body),
      cache:"no-store"
    });
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(payload?.message||"That Beans tool is temporarily unavailable.");
    return payload;
  };

  const renderBeansKnowledge=state=>{
    beansKnowledgeState=state&&typeof state==="object"?state:null;
    const files=Array.isArray(beansKnowledgeState?.files)?beansKnowledgeState.files:[];
    beansKnowledgeEl.replaceChildren();
    if(!beansKnowledgeState){
      beansKnowledgeEl.hidden=true;
      return;
    }
    const head=document.createElement("div");
    head.className="nbl-beans-knowledge-head";
    const usedMb=(Number(beansKnowledgeState?.totalBytes||0)/(1024*1024)).toFixed(1);
    head.textContent=`Saved knowledge · ${files.length}/20 files · ${usedMb}/50 MB`;
    beansKnowledgeEl.appendChild(head);
    if(!files.length){
      const empty=document.createElement("span");
      empty.className="nbl-beans-attachment-chip";
      empty.textContent="No saved knowledge files yet.";
      beansKnowledgeEl.appendChild(empty);
    }
    for(const item of files){
      const chip=document.createElement("span");
      chip.className="nbl-beans-attachment-chip";
      const label=document.createElement("span");
      const status=item?.status==="completed"?"ready":item?.status==="failed"?"failed":"processing";
      label.textContent=`${String(item?.filename||"Saved file").slice(0,140)} · ${status}`;
      const remove=document.createElement("button");
      remove.type="button";
      remove.setAttribute("aria-label",`Remove ${String(item?.filename||"saved file")}`);
      remove.textContent="×";
      remove.addEventListener("click",async()=>{
        remove.disabled=true;
        try{
          beansStatus.textContent="Removing saved knowledge…";
          const payload=await callBeansUtility("/knowledge/delete",{fileId:String(item?.id||"")});
          renderBeansKnowledge(payload?.knowledge);
          beansStatus.textContent="Saved knowledge file removed.";
        }catch(error){
          beansStatus.textContent=error?.message||"That saved file could not be removed.";
          remove.disabled=false;
        }
      });
      chip.append(label,remove);
      beansKnowledgeEl.appendChild(chip);
    }
    beansKnowledgeEl.hidden=false;
  };

  const loadBeansKnowledge=async()=>{
    beansStatus.textContent="Checking saved knowledge…";
    const payload=await callBeansUtility("/knowledge/status");
    renderBeansKnowledge(payload?.knowledge);
    beansStatus.textContent="Saved knowledge is ready.";
    return payload?.knowledge||null;
  };

  const uploadBeansKnowledgeFile=async file=>{
    if(!file) return;
    beansStatus.textContent="Saving file to Beans knowledge…";
    const item=await fileToBeansAttachment(file);
    const payload=await callBeansUtility("/knowledge/upload",{
      file:{name:item.name,mime:item.mime,data:item.data}
    });
    renderBeansKnowledge(payload?.knowledge);
    beansStatus.textContent=payload?.uploaded?.status==="completed"
      ?"Saved knowledge file is ready."
      :"Saved knowledge file is processing. Beans will search it when ready.";
  };

  const browserBeansDictation=()=>{
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

  const plusVoiceEligible=async()=>{
    try{
      const result=await requestNblMeter();
      const meter=result?.meter||null;
      return Boolean(!result?.signInRequired&&(meter?.privileged||meter?.planKey==="chat_plus"));
    }catch{return false;}
  };

  const blobToBase64=blob=>new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("That recording could not be prepared."));
    reader.onload=()=>{
      const value=String(reader.result||"");
      const comma=value.indexOf(",");
      resolve(comma>=0?value.slice(comma+1):"");
    };
    reader.readAsDataURL(blob);
  });

  const stopBeansVoiceTracks=()=>{
    try{beansVoiceStream?.getTracks?.().forEach(track=>track.stop());}catch{}
    beansVoiceStream=null;
  };

  const toggleBeansVoiceRecording=async()=>{
    if(beansVoiceRecorder?.state==="recording"){
      beansVoiceRecorder.stop();
      return;
    }
    if(!(await plusVoiceEligible())){
      browserBeansDictation();
      return;
    }
    if(!navigator.mediaDevices?.getUserMedia||!("MediaRecorder" in window)){
      browserBeansDictation();
      return;
    }
    try{
      beansVoiceStream=await navigator.mediaDevices.getUserMedia({audio:true});
      const preferred=MediaRecorder.isTypeSupported?.("audio/webm;codecs=opus")
        ?"audio/webm;codecs=opus"
        :MediaRecorder.isTypeSupported?.("audio/webm")
          ?"audio/webm"
          :MediaRecorder.isTypeSupported?.("audio/mp4")
            ?"audio/mp4"
            :"";
      beansVoiceChunks=[];
      beansVoiceRecorder=preferred?new MediaRecorder(beansVoiceStream,{mimeType:preferred}):new MediaRecorder(beansVoiceStream);
      beansVoiceRecorder.addEventListener("dataavailable",event=>{if(event.data?.size) beansVoiceChunks.push(event.data);});
      beansVoiceRecorder.addEventListener("stop",async()=>{
        const recorder=beansVoiceRecorder;
        beansVoiceRecorder=null;
        stopBeansVoiceTracks();
        beansMic.disabled=true;
        beansStatus.textContent="Beans is transcribing…";
        try{
          const mime=String(recorder?.mimeType||"audio/webm").split(";")[0]||"audio/webm";
          const blob=new Blob(beansVoiceChunks,{type:mime});
          beansVoiceChunks=[];
          const data=await blobToBase64(blob);
          const ext=mime==="audio/mp4"?"m4a":mime==="audio/wav"?"wav":"webm";
          const payload=await callBeansUtility("/voice/transcribe",{audio:{name:`beans-voice.${ext}`,mime,data}});
          const text=String(payload?.text||"").trim();
          if(text) beansInput.value=(beansInput.value.trim()?beansInput.value.trim()+" ":"")+text;
          beansStatus.textContent=text?"OpenAI voice transcription added. Send when ready.":"I couldn't hear that clearly.";
        }catch(error){
          beansStatus.textContent=error?.message||"Beans could not transcribe that recording.";
        }finally{
          beansMic.disabled=false;
          beansInput.focus();
        }
      },{once:true});
      beansVoiceRecorder.start();
      beansStatus.textContent="Listening with OpenAI voice… tap the mic again to stop.";
    }catch{
      stopBeansVoiceTracks();
      browserBeansDictation();
    }
  };

  const browserSpeakBeans=text=>{
    if(!("speechSynthesis" in window)) throw new Error("Read aloud is not available in this browser.");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const speakBeansReply=async(text,{forceOpenAi=false}={})=>{
    const value=String(text||"").trim();
    if(!value) return;
    if(forceOpenAi||await plusVoiceEligible()){
      try{
        const payload=await callBeansUtility("/voice/speak",{text:value});
        if(typeof payload?.audio==="string"&&payload.audio.startsWith("data:audio/")){
          try{beansVoicePlayer?.pause?.();}catch{}
          beansVoicePlayer=new Audio(payload.audio);
          await beansVoicePlayer.play();
          return;
        }
      }catch(error){
        if(forceOpenAi) beansStatus.textContent=error?.message||"OpenAI voice is temporarily unavailable.";
      }
    }
    try{browserSpeakBeans(value);}catch(error){beansStatus.textContent=error?.message||"Read aloud is not available.";}
  };

  const lastBeansReply=()=>[...beansHistory].reverse().find(item=>item.role==="assistant"&&String(item.content||"").trim())?.content||"";

  const startBeansDictation=()=>{ void toggleBeansVoiceRecording(); };

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
    cancelActiveBeansChat();
    invalidateBeansHistoryLoad();
    beansConversationGeneration++;
    beansInput.value="";
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
    cancelActiveBeansChat();
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
    who.textContent=role==="assistant"?"Professor Grey™":"You";
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
    plusStatus.textContent=`Professor Grey™ is ready · ${plusCourse.value}`;
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
      showPlusLocked("Sign in with your NBL account to check NBL University access.",{signedOut:true});
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
    plusAccessCopy.textContent="Checking NBL University access…";
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
        return showPlusLocked("Your NBL session needs to be refreshed. Sign in again to check University access.",{signedOut:true});
      }
      if(!response.ok) throw new Error("NBL University access could not be checked right now.");
      plusAccessCheckedFor=identity.userId;
      if(payload?.university?.allowed===true) showPlusReady();
      else showPlusLocked("Professor Grey™ requires active NBL University enrollment for this account.");
    }catch(error){
      if(accessRequestGeneration!==plusAccessRequestGeneration||accountGeneration!==beansAccountGeneration||currentClerkUserId()!==identity.userId) return;
      plusAccessCheckedFor=null;
      showPlusLocked(error?.message||"NBL University access could not be checked right now.");
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
    if(!text||beansSubmit.disabled) return;

    const preflightAccountGeneration=beansAccountGeneration;
    const preflightConversationGeneration=beansConversationGeneration;
    const preflightUserId=currentClerkUserId();
    setBeansBusy(true);
    beansStatus.textContent="Beans is getting ready…";

    await loadSignedInBeansHistory();
    if(preflightAccountGeneration!==beansAccountGeneration||preflightConversationGeneration!==beansConversationGeneration||currentClerkUserId()!==preflightUserId){
      setBeansBusy(false);
      return;
    }

    const accountGeneration=beansAccountGeneration;
    const conversationGeneration=beansConversationGeneration;
    const requestedUserId=currentClerkUserId();
    const controller=new AbortController();
    activeBeansChatController?.abort();
    activeBeansChatController=controller;
    beansInput.value="";
    beansInput.style.height="";
    const userMessageEl=appendBeansMessage("user",text);
    beansHistory.push({role:"user",content:text});
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
      const endpoint=NBL_BEANS_WEB_API;
      const response=await fetch(endpoint,{
        method:"POST",
        headers,
        body:JSON.stringify(requestBody),
        signal:controller.signal,
        cache:"no-store"
      });
      const payload=await response.json().catch(()=>({}));
      if(accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||currentClerkUserId()!==requestedUserId) return;
      if(!response.ok) throw new Error(payload.message||"Beans could not answer just now.");
      const reply=String(payload.message||payload.reply||"").trim();
      if(!reply) throw new Error("Beans returned no text.");
      if(payload?.conversationId) beansConversationId=String(payload.conversationId);
      beansHistory.push({role:"assistant",content:reply});
      appendBeansMessage("assistant",reply,String(payload?.speaker||"Beans"));
      appendBeansSources(payload?.sources);
      appendBeansFileSources(payload?.fileSources);
      appendBeansImages(payload?.generatedImages);
      const used=Array.isArray(payload?.toolsUsed)?payload.toolsUsed:[];
      beansStatus.textContent=payload?.speaker==="Professor Grey™"
        ?"Professor Grey™ answered through the Virgo System™."
        :payload?.webSearchUsed
          ?"Beans checked the live web."
          :used.includes("code")
          ?"Beans used the code/data tool."
          :used.includes("image")
            ?"Beans created an image."
            :used.includes("file")&&Array.isArray(payload?.fileSources)&&payload.fileSources.length
              ?"Beans searched your saved knowledge."
              :payload?.authenticated
                ?(payload?.username?`Saved to ${payload.username}'s NBL account.`:"Saved to your NBL account.")
                :"Beans replied.";
      if(beansVoiceMode) void speakBeansReply(reply,{forceOpenAi:true});
      clearBeansTools();
    }catch(error){
      if(accountGeneration!==beansAccountGeneration||conversationGeneration!==beansConversationGeneration||currentClerkUserId()!==requestedUserId||error?.name==="AbortError") return;
      const last=beansHistory.at(-1);
      if(last?.role==="user"&&last?.content===text) beansHistory.pop();
      userMessageEl?.remove();
      if(!beansInput.value.trim()) beansInput.value=text;
      const message=error?.message||"Beans could not answer just now.";
      beansStatus.textContent=`${message} Your message is still here so you can try again.`;
    }finally{
      if(activeBeansChatController===controller) activeBeansChatController=null;
      setBeansBusy(false);
      beansInput.focus();
    }
  });

  beansStop.addEventListener("click",()=>cancelActiveBeansChat({announce:true}));

  const resizeBeansComposer=()=>{
    beansInput.style.height="auto";
    beansInput.style.height=`${Math.min(180,Math.max(54,beansInput.scrollHeight))}px`;
  };
  beansInput.addEventListener("input",resizeBeansComposer);

  beansInput.addEventListener("keydown",event=>{
    if(event.key!=="Enter"||event.shiftKey||event.isComposing) return;
    event.preventDefault();
    if(beansSubmit.disabled){
      beansStatus.textContent="Beans is still working on the last message. You can keep typing while it finishes.";
      return;
    }
    beansForm.requestSubmit(beansSubmit);
  });

  beansToolsToggle.addEventListener("click",()=>setBeansToolMenu(beansToolsMenu.hidden));
  beansToolReset.addEventListener("click",clearBeansTools);
  beansFileInput.addEventListener("change",async()=>{
    try{await addBeansFiles(beansFileInput.files);}catch(error){beansStatus.textContent=error?.message||"That upload could not be added.";}
  });
  beansKnowledgeFileInput.addEventListener("change",async()=>{
    const file=beansKnowledgeFileInput.files?.[0]||null;
    beansKnowledgeFileInput.value="";
    try{await uploadBeansKnowledgeFile(file);}catch(error){beansStatus.textContent=error?.message||"That file could not be saved to Beans knowledge.";}
  });
  beansMic.addEventListener("click",startBeansDictation);
  beansToolsMenu.addEventListener("click",async event=>{
    const button=event.target.closest("[data-nbl-tool]");
    if(!button) return;
    const tool=button.dataset.nblTool;
    if(tool==="attach"){
      setBeansToolMenu(false);
      beansFileInput.click();
      return;
    }
    if(tool==="knowledge-upload"){
      setBeansToolMenu(false);
      beansKnowledgeFileInput.click();
      return;
    }
    if(tool==="knowledge"){
      setBeansToolMenu(false);
      try{
        const state=await loadBeansKnowledge();
        if(!Number(state?.fileCount||0)){
          beansStatus.textContent="Save a knowledge file first.";
          return;
        }
        beansToolMode="knowledge";
        renderBeansToolState();
        beansStatus.textContent="Saved knowledge selected · ask Beans about your files.";
        beansInput.focus();
      }catch(error){beansStatus.textContent=error?.message||"Saved knowledge is temporarily unavailable.";}
      return;
    }
    if(tool==="voice-mode"){
      setBeansToolMenu(false);
      if(!(await plusVoiceEligible())){
        beansStatus.textContent="OpenAI voice mode requires NBL CHAT PLUS™. The mic still supports browser dictation.";
        return;
      }
      beansVoiceMode=!beansVoiceMode;
      beansStatus.textContent=beansVoiceMode
        ?"OpenAI voice mode is on. Tap the mic to talk; Beans will speak replies."
        :"OpenAI voice mode is off.";
      return;
    }
    if(tool==="read"){
      setBeansToolMenu(false);
      const reply=lastBeansReply();
      if(!reply){beansStatus.textContent="Beans has not replied yet.";return;}
      beansStatus.textContent="Reading Beans' last reply aloud.";
      void speakBeansReply(reply);
      return;
    }
    if(["web","code","image"].includes(tool)){
      beansToolMode=tool;
      setBeansToolMenu(false);
      renderBeansToolState();
      beansStatus.textContent=tool==="web"?"Live web selected · NBL CHAT PLUS™.":tool==="code"?"Code / data analysis selected · NBL CHAT PLUS™.":"Image creation selected · NBL CHAT PLUS™.";
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
      if(accountGeneration===beansAccountGeneration&&!identity) showPlusLocked("Sign in with your NBL account to use NBL University.",{signedOut:true});
      return;
    }
    if(currentClerkUserId()!==identity.userId){
      showPlusLocked("Sign in with your NBL account to use NBL University.",{signedOut:true});
      return;
    }
    plusInput.value="";
    appendPlusMessage("user",text);
    plusHistory.push({role:"user",content:text});
    beansHistory.push({role:"user",content:text});
    plusSubmit.disabled=true;
    plusInput.disabled=true;
    plusCourse.disabled=true;
    plusStatus.textContent="Professor Grey™ is thinking…";
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
      if(!response.ok) throw new Error(payload.message||"Professor Grey™ could not answer just now.");
      const reply=String(payload.message||"").trim();
      if(!reply) throw new Error("Professor Grey™ returned no answer.");
      if(payload?.conversationId) beansConversationId=String(payload.conversationId);
      plusHistory.push({role:"assistant",content:reply});
      beansHistory.push({role:"assistant",content:reply});
      appendPlusMessage("assistant",reply);
      appendPlusSources(payload?.sources);
      plusStatus.textContent=`Professor Grey™ · ${plusCourse.value}`;
    }catch(error){
      if(accountGeneration!==beansAccountGeneration||accessRequestGeneration!==plusAccessRequestGeneration||currentClerkUserId()!==identity.userId) return;
      const message=error?.message||"Professor Grey™ could not answer just now.";
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
    plusStatus.textContent=`Professor Grey™ is ready · ${plusCourse.value}`;
  });

  plusSignIn.addEventListener("click",()=>{
    location.href=accountPortalUrl("/sign-in");
  });

  chatDrawerToggle.addEventListener("click",()=>{
    const opening=!chatDrawer.classList.contains("is-open");
    if(opening)setBeansToolMenu(false);
    setChatDrawerOpen(opening);
  });
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

  const runBillingAction=async({plan=null,portal=false}={})=>{
    billingButtons.forEach(button=>button.disabled=true);
    if(billingPortal) billingPortal.disabled=true;
    if(billingStatus) billingStatus.textContent=portal?"Opening secure billing…":"Preparing secure checkout…";
    try{
      const result=portal
        ?await window.NBLBillingBridge.portal()
        :await window.NBLBillingBridge.checkout(plan);
      if(result?.signInRequired){
        if(billingStatus) billingStatus.textContent="Sign in with your NBL account before checkout.";
        location.href=result.signInUrl;
        return;
      }
      const payload=result?.payload||{};
      if(billingStatus){
        billingStatus.textContent=payload?.route==="manage_existing_subscription"
          ?(payload?.message||"Opening billing management for your existing membership…")
          :"Opening Stripe secure checkout…";
      }
      location.href=result.destination;
    }catch(error){
      if(billingStatus) billingStatus.textContent=error?.message||"Secure billing is temporarily unavailable.";
    }finally{
      billingButtons.forEach(button=>button.disabled=false);
      if(billingPortal) billingPortal.disabled=false;
    }
  };
  billingButtons.forEach(button=>button.addEventListener("click",()=>runBillingAction({plan:button.dataset.nblBillingPlan||""})));
  billingPortal?.addEventListener("click",()=>runBillingAction({portal:true}));

  chatDrawerAccountAction.addEventListener("click",async()=>{
    try{
      const clerk=await getNblClerk();
      if(clerk?.isSignedIn){
        await clerk.signOut();
        cancelActiveBeansChat();
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
        showPlusLocked("Sign in with your NBL account to check NBL University access.",{signedOut:true});
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
      cancelActiveBeansChat();
      beansAccountGeneration++;
      invalidateBeansHistoryLoad();
      drawerHistoryRequestGeneration++;
      plusAccessRequestGeneration++;
      beansHistoryLoadedFor=null;
      plusAccessCheckedFor=null;
      plusAccessLoadingFor=null;
      plusAllowed=false;
      clearBeansTranscript(nextUserId?"Account changed. Saved history is loading…":"You are signed out. Sign in to keep your history.");
      showPlusLocked(nextUserId?"Checking NBL University access…":"Sign in with your NBL account to check NBL University access.",{signedOut:!nextUserId});
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
          `${NBL_PRODUCT_PLANS.chatPlusUniversity.name}: ${NBL_PRODUCT_PLANS.chatPlusUniversity.price}, ${NBL_PRODUCT_PLANS.chatPlusUniversity.replies}; guided course teaching, ebook coupon redemption.`,
          `${NBL_PRODUCT_PLANS.getMore.name}: ${NBL_PRODUCT_PLANS.getMore.price}, ${NBL_PRODUCT_PLANS.getMore.replies}. ${NBL_PRODUCT_PLANS.getMore.expiry}`,
          `${NBL_PRODUCT_PLANS.foundationProgram.name}: ${NBL_PRODUCT_PLANS.foundationProgram.price}.`,
          `${NBL_PRODUCT_PLANS.fullFoundation.name}: ${NBL_PRODUCT_PLANS.fullFoundation.price}.`,
          `${NBL_PRODUCT_PLANS.fullNblu.name}: ${NBL_PRODUCT_PLANS.fullNblu.price}.`,
          `${NBL_PRODUCT_PLANS.nbluContinuation.name}: ${NBL_PRODUCT_PLANS.nbluContinuation.price}.`,
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
        <img class="nbl-beta-beans" src="/NBLChat_Beans.png" alt="Beans from NBL Chat™">
        <p class="nbl-beta-kicker">NBL Chat™ · What’s next</p>
        <h2 id="nbl-beta-title">Get updates on what Beans is building next.</h2>
        <p>Join the NBL email list for updates about future NBL Chat™ features and upcoming testing opportunities.</p>
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
      const subject=encodeURIComponent("NBL Chat™ Future Features");
      const body=encodeURIComponent(`Please add ${email} to the NBL Chat™ future-features update list.`);
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
          <a href="https://new-beansland.myshopify.com" target="_blank" rel="noopener noreferrer">Shop NBL</a>
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
          <a href="https://new-beansland.myshopify.com" target="_blank" rel="noopener noreferrer">Shop NBL</a>
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