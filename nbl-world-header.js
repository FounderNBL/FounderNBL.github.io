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