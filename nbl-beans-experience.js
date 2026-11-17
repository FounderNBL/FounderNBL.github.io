(()=>{
"use strict";
// Beans is Tony's assistant, NOT the separate Little Beans children's character.
// Visual-only layer: keep the existing chat, authentication, intelligence and tools.
// App and website share the stable NBL infinity + Beans wordmark. Seasonal releases
// may change colors of the approved mark, not the product's personality or behavior.
const panel=document.getElementById("nbl-beans-panel");
if(!panel||panel.querySelector(".nbl-beans-hero-copy"))return;
const presence=panel.querySelector("[data-nbl-beans-presence]");
const drawerScroll=panel.querySelector(".nbl-chat-drawer-scroll");
const history=panel.querySelector(".nbl-chat-drawer-history");
const regular=panel.querySelector("[data-nbl-beans-regular]");
const log=panel.querySelector("[data-nbl-beans-log]");
const input=panel.querySelector("#nbl-beans-input");
if(!presence||!drawerScroll||!history||!regular||!log||!input)return;
const stylesheet=document.createElement("link");
stylesheet.rel="stylesheet";
stylesheet.href="/nbl-beans-experience.css?v=20261117-beans-logo";
stylesheet.dataset.nblBeansExperience="true";
document.head.appendChild(stylesheet);
// This is the approved Beans-specific infinity+wordmark asset slot.
// Until the Founder uploads it, the site keeps its existing NBL infinity mark.
// The historical cartoon is never used in active Beans UI.
const officialBeansIcon="/assets/brand/beans-infinity.png";
const previewIcon=new Image();
previewIcon.onload=()=>{
  for(const img of document.querySelectorAll(
   ".nbl-world-beans-toggle img,.nbl-beans-avatar,.nbl-chat-drawer-logo,.nbl-beans-presence-art,.nbl-chat-drawer-item[data-nbl-drawer-new] img"
  ))img.src=officialBeansIcon;
};
previewIcon.src=officialBeansIcon;


const title=document.createElement("div");
title.className="nbl-beans-hero-copy";
title.innerHTML='<span class="nbl-beans-hero-tag">Beans · Personal AI</span><h3>Hi! I’m Beans. 👋</h3><p>Your NBL personal AI assistant. Ask me anything, get things done, or explore New Beansland with me.</p>';
presence.appendChild(title);
const suggestions=document.createElement("nav");
suggestions.className="nbl-beans-shortcuts";
suggestions.setAttribute("aria-label","Beans quick actions and NBL destinations");
suggestions.innerHTML=[
 '<button type="button" data-nbl-beans-explore>◈ <span>Explore New Beansland</span></button>',
 '<button type="button" data-nbl-beans-prompt="Help me write a song">♫ <span>Help me write a song</span></button>',
 '<a href="/studio/">♫ <span>Listen to NBL Music</span></a>',
 '<a href="/books.html">▣ <span>NBL Books</span></a>'
].join("");
presence.insertAdjacentElement("afterend",suggestions);

const library=document.createElement("a");
library.href="/account.html";
library.className="nbl-beans-library-link";
library.textContent="▤ Library & saved chats";
drawerScroll.insertBefore(library,history);
const explore=document.createElement("details");
explore.className="nbl-beans-explore-worlds";
explore.innerHTML=[
 '<summary>◈ Explore NBL <span aria-hidden="true">⌄</span></summary>',
 '<nav aria-label="Public New Beansland destinations">',
 '<a href="/">NBL Home</a>',
 '<a href="/pulse/">NBL Pulse</a>',
 '<a href="/studio/">NBL Music Productions · Official Player</a>',
 '<a href="/books.html">NBL Books</a>',
 '<a href="/studios.html">NBL Studios</a>',
 '<a href="/founder-office.html">Founder’s Office</a>',
 '<a href="https://nblworld.com/">NBL World · shop</a>',
 '</nav>'
].join("");
drawerScroll.insertBefore(explore,history);
let introCollapsed=false;
let introTimer=null;
const collapseIntro=()=>{
 if(introCollapsed)return;
 introCollapsed=true;
 if(introTimer!==null){window.clearTimeout(introTimer);introTimer=null;}
 regular.classList.add("nbl-beans-intro-collapsed");
};
const startIntro=()=>{
 if(introCollapsed||panel.hidden||introTimer!==null)return;
 introTimer=window.setTimeout(collapseIntro,window.matchMedia("(max-width:600px)").matches?4500:6000);
};
const observer=new MutationObserver(startIntro);
observer.observe(panel,{attributes:true,attributeFilter:["hidden"]});
if(!panel.hidden)startIntro();
input.addEventListener("input",()=>{if(input.value.trim())collapseIntro();});
input.addEventListener("pointerdown",collapseIntro);
log.addEventListener("scroll",()=>{if(log.scrollTop>15)collapseIntro();},{passive:true});
suggestions.addEventListener("click",event=>{
 collapseIntro();
 const trigger=event.target.closest("[data-nbl-beans-explore]");
 if(trigger){
  explore.open=true;
  if(window.matchMedia("(max-width:1199px)").matches){
   const toggle=panel.querySelector("[data-nbl-chat-drawer-toggle]");
   if(toggle?.getAttribute("aria-expanded")!=="true")toggle?.click();
  }
  explore.querySelector("summary")?.focus();
  return;
 }
 const button=event.target.closest("[data-nbl-beans-prompt]");
 if(!button)return;
 input.value=button.dataset.nblBeansPrompt;
 input.dispatchEvent(new Event("input",{bubbles:true}));
 input.focus();
});
window.addEventListener("pagehide",()=>{
 if(introTimer!==null)window.clearTimeout(introTimer);
 observer.disconnect();
},{once:true});
})();
