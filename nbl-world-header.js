(()=>{
  "use strict";
  const path=(location.pathname||"/").replace(/\/+/g,"/");
  const room=(()=>{
    if(path==="/"||/\/index\.html$/.test(path)||/\/home\.html$/.test(path)) return {label:"Stories · Questions · Worlds",key:"home"};
    if(/\/university(?:\.html)?$/.test(path)||/\/verify-credential\.html$/.test(path)) return {label:"New Beansland University",key:"university"};
    if(/\/books\.html$/.test(path)||/\/people-zoo/.test(path)||/\/doctor-rocketship/.test(path)) return {label:"NBL Books",key:"books"};
    if(/\/clothing\.html$/.test(path)) return {label:"NBL Clothing Co.",key:"clothing"};
    if(/\/stories\.html$/.test(path)) return {label:"TV & Film",key:"stories"};
    if(/\/studio\/?(?:index\.html)?$/.test(path)) return {label:"NBL Studio",key:"studio"};
    if(/\/founder-office\.html$/.test(path)) return {label:"Founder’s Office",key:"office"};
    if(/\/about\.html$/.test(path)) return {label:"About NBL",key:"about"};
    return {label:"Stories · Questions · Worlds",key:""};
  })();

  const nav=[
    ["home","Home","/"],
    ["university","University","/university.html"],
    ["books","Books","/books.html"],
    ["clothing","Clothing","/clothing.html"],
    ["stories","TV & Film","/stories.html"],
    ["studio","Studio","/studio/"],
    ["office","Founder’s Office","/founder-office.html"],
    ["about","About","/about.html"]
  ];

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
      <nav class="nbl-world-nav" aria-label="New Beansland main navigation">
        ${nav.map(([key,label,href])=>`<a href="${href}"${room.key===key?' aria-current="page"':''}>${label}</a>`).join("")}
      </nav>
    </div>`;

  const legacy=[];
  if(room.key==="home") legacy.push(document.querySelector("body > .site-header"));
  if(room.key==="university") legacy.push(document.querySelector("body > .site-header"));
  if(room.key==="books") legacy.push(document.querySelector("body > .site-header"));
  if(room.key==="clothing") legacy.push(document.querySelector("body > .header"));
  if(room.key==="studio") legacy.push(document.querySelector(".studio-header"));
  if(room.key==="about") legacy.push(document.querySelector("main.wrap > .top"));
  if(room.key==="office") legacy.push(document.querySelector(".home-button"));
  legacy.filter(Boolean).forEach(el=>el.classList.add("nbl-world-legacy-header"));

  document.body.prepend(header);
  document.body.classList.add("nbl-world-ready");
})();