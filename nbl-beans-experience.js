(()=>{
"use strict";
// Beans personalization is a purely local visual layer. No user media is sent to NBL.
// Character artwork is an NBL-approved allowlist; no user-uploaded character outfits.
const panel=document.getElementById("nbl-beans-panel");
if(!panel||panel.querySelector("[data-nbl-customize-open]"))return;
const card=panel.querySelector(".nbl-beans-card");
const art=panel.querySelector(".nbl-beans-presence-art");
const presence=panel.querySelector("[data-nbl-beans-presence]");
const head=panel.querySelector(".nbl-beans-head");
const drawer=panel.querySelector("[data-nbl-chat-drawer]");
const drawerScroll=panel.querySelector(".nbl-chat-drawer-scroll");
const history=panel.querySelector(".nbl-chat-drawer-history");
const regular=panel.querySelector("[data-nbl-beans-regular]");
const log=panel.querySelector("[data-nbl-beans-log]");
const input=panel.querySelector("#nbl-beans-input");
if(!card||!art||!presence||!head||!drawer||!regular||!log||!input)return;

const approved=Object.freeze({
 standard:Object.freeze({src:"/Beans_Hi_Basic.png",title:"Standard Beans",alt:"Official standard Beans waving in his NBL outfit"}),
 crossed:Object.freeze({src:"/Beans_Crossarmed.png",title:"Arms crossed",alt:"Beans in his Messenger outfit, arms crossed"}),
 jersey:Object.freeze({src:"/Beans_Hi_Soccer.png",title:"NBL soccer",alt:"Beans waving in his NBL soccer"}),
 cargoWave:Object.freeze({src:"/Beans_Hi_Cargo.png",title:"Cargo outfit · wave",alt:"Beans waving in his NBL cargo outfit"}),
 cargoPoint:Object.freeze({src:"/Beans_Peace_Sign.png",title:"Cargo outfit · point",alt:"Beans making a peace sign in his NBL outfit"})
});
// All five Founder-uploaded looks are free. Slot 3 is reserved for future paid NBL outfits; no checkout yet.
// The character and each local background are independent preferences.
const preset={look:"standard",color:"#fff8ee"};
let preferences={...preset};
let activeUser="";
let mountedUrls={};
let generation=0;
const slots=["chat","sidebar","greeting"];
const userId=()=>String(window.Clerk?.user?.id||"");
const stateKey=id=>"nbl.beans.appearance.v1."+id;
const assetKey=(id,slot)=>"nbl.beans.local-image.v1."+id+"."+slot;

const style=document.createElement("link");
style.rel="stylesheet";
style.href="/nbl-beans-experience.css?v=20261112-five-new-art";
style.dataset.nblBeansExperience="true";
document.head.appendChild(style);

const title=document.createElement("div");
title.className="nbl-beans-hero-copy";
title.innerHTML='<span class="nbl-beans-hero-tag">Beans · Personal AI</span><h3>Hi! I’m Beans. 👋</h3><p>Your NBL personal AI assistant. Ask me anything, get things done, or explore New Beansland with me.</p>';
presence.appendChild(title);
const suggestions=document.createElement("nav");
suggestions.className="nbl-beans-shortcuts";
suggestions.setAttribute("aria-label","Beans quick actions and real NBL destinations");
suggestions.innerHTML=[
'<button type="button" data-nbl-beans-explore>◈ <span>Show me NBL worlds</span></button>',
'<button type="button" data-nbl-beans-prompt="Help me write a song">♫ <span>Help me write a song</span></button>',
'<button type="button" data-nbl-beans-prompt="How do I start Foundation?">✦ <span>How do I start Foundation?</span></button>',
'<a href="/books.html">▣ <span>Take me to Books</span></a>'
].join("");
presence.insertAdjacentElement("afterend",suggestions);
suggestions.addEventListener("click",event=>{
 const trigger=event.target.closest("[data-nbl-beans-explore]");
 if(trigger){
  explore.open=true;
  if(window.matchMedia("(max-width:959px)").matches){
   const toggle=panel.querySelector("[data-nbl-chat-drawer-toggle]");
   if(toggle?.getAttribute("aria-expanded")!=="true")toggle?.click();
  }
  explore.querySelector("summary").focus();
  return;
 }
 const button=event.target.closest("[data-nbl-beans-prompt]");
 if(!button)return;
 input.value=button.dataset.nblBeansPrompt;
 input.dispatchEvent(new Event("input",{bubbles:true}));
 input.focus();
});

const explore=document.createElement("details");
explore.className="nbl-beans-explore-worlds";
explore.innerHTML=[
'<summary>◈ Explore NBL Worlds <span aria-hidden="true">⌄</span></summary>',
'<nav aria-label="Public New Beansland destinations">',
'<a href="/">New Beansland home</a>',
'<a href="/books.html">Books</a>',
'<a href="/stories.html">The City · preview</a>',
'<a href="/studio/">NBL Music Productions</a>',
'<a href="/studios.html">NBL Studios</a>',
'<a href="/founder-office.html">Founder’s Office</a>',
'<a href="https://nblworld.com/">NBL World · shop</a>',
'</nav>'
].join("");
drawerScroll.insertBefore(explore,history);
const library=document.createElement("a");
library.href="/account.html";
library.className="nbl-beans-library-link";
library.textContent="▤ Library & saved chats";
drawerScroll.insertBefore(library,explore);

const open=document.createElement("button");
open.type="button";
open.className="nbl-beans-customize-open";
open.dataset.nblCustomizeOpen="";
open.textContent="✦ Customize Beans";
open.setAttribute("aria-haspopup","dialog");
open.setAttribute("aria-expanded","false");
head.insertBefore(open,head.querySelector("[data-nbl-beans-close]"));

const sheet=document.createElement("section");
sheet.className="nbl-beans-customize-sheet";
sheet.hidden=true;
sheet.setAttribute("role","dialog");
sheet.setAttribute("aria-modal","false");
sheet.setAttribute("aria-labelledby","nbl-beans-customize-title");
sheet.innerHTML=[
'<div class="nbl-beans-customize-head"><div><h3 id="nbl-beans-customize-title">Customize Beans</h3><p>Your photos and colors. Only NBL-approved character clothing.</p></div><button type="button" data-nbl-customize-close aria-label="Close customization">✕</button></div>',
'<div class="nbl-beans-customize-tabs" role="tablist" aria-label="Personalization options"><button type="button" data-nbl-customize-tab="wardrobe" role="tab" aria-selected="true">Wardrobe</button><button type="button" data-nbl-customize-tab="appearance" role="tab" aria-selected="false">Appearance</button></div>',
'<div data-nbl-customize-section="wardrobe"><p><strong>1. Standard Beans</strong> starts everyone off. <strong>2. All five official looks</strong> are free to choose. Switching Beans keeps your chosen background.</p>',
'<button type="button" class="nbl-beans-look" data-nbl-look="standard"><img src="/Beans_Hi_Basic.png" alt=""><span><strong>Standard Beans</strong><small>Official default · Free</small></span><span aria-hidden="true" data-nbl-look-check="standard">○</span></button>',
'<button type="button" class="nbl-beans-look" data-nbl-look="crossed"><img src="/Beans_Crossarmed.png" alt=""><span><strong>Arms crossed · Messenger</strong><small>Official NBL look · Free</small></span><span aria-hidden="true" data-nbl-look-check="crossed">○</span></button>',
'<button type="button" class="nbl-beans-look" data-nbl-look="jersey"><img src="/Beans_Hi_Soccer.png" alt=""><span><strong>Soccer · Hello</strong><small>Official NBL look · Free</small></span><span aria-hidden="true" data-nbl-look-check="jersey">○</span></button>',
'<button type="button" class="nbl-beans-look" data-nbl-look="cargoWave"><img src="/Beans_Hi_Cargo.png" alt=""><span><strong>Cargo · Hello</strong><small>Official NBL look · Free</small></span><span aria-hidden="true" data-nbl-look-check="cargoWave">○</span></button>',
'<button type="button" class="nbl-beans-look" data-nbl-look="cargoPoint"><img src="/Beans_Peace_Sign.png" alt=""><span><strong>Peace sign</strong><small>Official NBL look · Free</small></span><span aria-hidden="true" data-nbl-look-check="cargoPoint">○</span></button>',
'<button type="button" class="nbl-beans-look" data-nbl-premium-outfits disabled aria-disabled="true" title="Premium outfit purchases are not available yet"><span class="nbl-beans-look-placeholder" aria-hidden="true">✦</span><span><strong>3. Premium wardrobe</strong><small>Locked · Special outfits to purchase and unlock later</small></span><span aria-hidden="true">🔒</span></button>',
'<p class="nbl-beans-lock-note">Premium NBL outfits are reserved for a later release. No prices, checkout or unlock are active. All five current looks remain free.</p></div>',
'<div data-nbl-customize-section="appearance" hidden><p>Choose pictures from your own phone or device. Images remain on this device, not in Beans’ chat or NBL storage.</p>',
'<label class="nbl-beans-color-choice">Chat background color <input type="color" data-nbl-customize-color value="#fff8ee"></label>',
'<div class="nbl-beans-photo-choices">',
'<div><label>Chat background <input type="file" data-nbl-customize-photo="chat" accept="image/png,image/jpeg,image/webp,image/gif"></label><button type="button" data-nbl-customize-clear="chat">Clear</button></div>',
'<div><label>Sidebar background <input type="file" data-nbl-customize-photo="sidebar" accept="image/png,image/jpeg,image/webp,image/gif"></label><button type="button" data-nbl-customize-clear="sidebar">Clear</button></div>',
'<div><label>“Hi, I’m Beans” background <input type="file" data-nbl-customize-photo="greeting" accept="image/png,image/jpeg,image/webp,image/gif"></label><button type="button" data-nbl-customize-clear="greeting">Clear</button></div>',
'</div><button type="button" class="nbl-beans-reset" data-nbl-customize-reset>Reset my appearance</button></div>',
'<p class="nbl-beans-customize-status" data-nbl-customize-status role="status" aria-live="polite"></p>'
].join("");
card.appendChild(sheet);
const note=sheet.querySelector("[data-nbl-customize-status]");
const color=sheet.querySelector("[data-nbl-customize-color]");
const sections=[...sheet.querySelectorAll("[data-nbl-customize-section]")];
const allowedTypes=new Set(["image/png","image/jpeg","image/webp","image/gif"]);
const setNotice=message=>{note.textContent=message;};
const setSheet=visible=>{
 sheet.hidden=!visible;
 open.setAttribute("aria-expanded",visible?"true":"false");
 if(visible){syncProfile();sheet.querySelector("[data-nbl-customize-close]").focus();}
 else open.focus();
};
open.addEventListener("click",()=>setSheet(sheet.hidden));
sheet.querySelector("[data-nbl-customize-close]").addEventListener("click",()=>setSheet(false));
sheet.querySelectorAll("[data-nbl-customize-tab]").forEach(button=>{
 button.addEventListener("click",()=>{
  const mode=button.dataset.nblCustomizeTab;
  sheet.querySelectorAll("[data-nbl-customize-tab]").forEach(t=>t.setAttribute("aria-selected",t===button?"true":"false"));
  sections.forEach(s=>{s.hidden=s.dataset.nblCustomizeSection!==mode;});
 });
});
sheet.addEventListener("keydown",event=>{if(event.key==="Escape"){event.stopPropagation();setSheet(false);}});

const revoke=slot=>{
 if(mountedUrls[slot])URL.revokeObjectURL(mountedUrls[slot]);
 delete mountedUrls[slot];
};
const applyPhoto=(slot,blob)=>{
 revoke(slot);
 const key=slot==="chat"?"--nbl-beans-custom-chat":slot==="sidebar"?"--nbl-beans-custom-sidebar":"--nbl-beans-custom-greeting";
 if(blob){
  const url=URL.createObjectURL(blob);
  mountedUrls[slot]=url;
  card.style.setProperty(key,'url("'+url+'")');
 }else card.style.removeProperty(key);
};
const applyColor=value=>{
 if(!/^#[0-9a-f]{6}$/i.test(value))return;
 card.style.setProperty("--nbl-beans-chat-color",value);
 const n=parseInt(value.slice(1),16);
 const r=(n>>16)&255,g=(n>>8)&255,b=n&255;
 const dark=(r*299+g*587+b*114)/1000<145;
 card.classList.toggle("nbl-beans-dark-chat",dark);
 color.value=value;
};
const applyLook=look=>{
 const selected=approved[look]||approved.standard;
 preferences.look=approved[look]?look:"standard";
 art.src=selected.src;
 art.alt=selected.alt;
 sheet.querySelectorAll("[data-nbl-look]").forEach(b=>{
  const chosen=b.dataset.nblLook===preferences.look;
  b.setAttribute("aria-pressed",chosen?"true":"false");
  b.querySelector("[data-nbl-look-check]").textContent=chosen?"✓":"○";
 });
};
const save=()=>{
 if(!activeUser)return;
 try{localStorage.setItem(stateKey(activeUser),JSON.stringify({look:preferences.look,color:preferences.color}));}
 catch{setNotice("Preferences work in this session, but device settings could not be saved.");}
};
const openDb=()=>new Promise((resolve,reject)=>{
 if(!window.indexedDB){reject(new Error("Device storage not available"));return;}
 const request=indexedDB.open("nbl-beans-personal-photos",1);
 request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("photos"))request.result.createObjectStore("photos");};
 request.onsuccess=()=>resolve(request.result);
 request.onerror=()=>reject(request.error||new Error("Device storage unavailable"));
});
const withStore=async(mode,act)=>{
 const db=await openDb();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction("photos",mode);
   const req=act(tx.objectStore("photos"));
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||new Error("Could not store your photo"));
   tx.onabort=()=>reject(tx.error||new Error("Photo storage transaction failed"));
  });
 }finally{db.close();}
};
const photoGet=key=>withStore("readonly",store=>store.get(key));
const photoSet=(key,value)=>withStore("readwrite",store=>store.put(value,key));
const photoDelete=key=>withStore("readwrite",store=>store.delete(key));
const reloadPhotos=async(user,epoch)=>{
 for(const slot of slots){
  if(epoch!==generation)return;
  try{
   const blob=user?await photoGet(assetKey(user,slot)):null;
   if(epoch!==generation)return;
   applyPhoto(slot,blob instanceof Blob&&allowedTypes.has(blob.type)?blob:null);
  }catch{if(epoch===generation)applyPhoto(slot,null);}
 }
};
function syncProfile(){
 const user=userId();
 if(activeUser===user)return;
 activeUser=user;
 const epoch=++generation;
 slots.forEach(slot=>applyPhoto(slot,null));
 preferences={...preset};
 if(user){
  try{
   const stored=JSON.parse(localStorage.getItem(stateKey(user))||"null");
   if(stored&&approved[stored.look])preferences.look=stored.look; // Legacy classic/nbl choices fall back to Standard.
   if(stored&&/^#[0-9a-f]{6}$/i.test(stored.color))preferences.color=stored.color;
  }catch{}
 }
 applyLook(preferences.look);
 applyColor(preferences.color);
 void reloadPhotos(user,epoch);
 setNotice(user?"Your appearance settings are private to this account and device.":"Sign in to save your personal appearance settings on this device.");
}
sheet.querySelectorAll("[data-nbl-look]").forEach(button=>button.addEventListener("click",()=>{
 syncProfile();applyLook(button.dataset.nblLook);save();
 setNotice("Official NBL character look selected.");
}));
color.addEventListener("input",()=>{
 syncProfile();preferences.color=color.value;applyColor(color.value);save();
});
sheet.querySelectorAll("[data-nbl-customize-photo]").forEach(inputEl=>{
 inputEl.addEventListener("change",async()=>{
  syncProfile();
  const file=inputEl.files?.[0];
  const slot=inputEl.dataset.nblCustomizePhoto;
  inputEl.value="";
  if(!file)return;
  if(!allowedTypes.has(file.type)||file.size>8*1024*1024||file.size<=0){
   setNotice("Choose a PNG, JPG, WEBP or GIF image no larger than 8 MB.");return;
  }
  const user=activeUser,epoch=generation;
  applyPhoto(slot,file);
  if(!user){setNotice("Preview applied. Sign in to save the photo on this device.");return;}
  try{
   await photoSet(assetKey(user,slot),file);
   if(epoch===generation)setNotice("Your personal photo is saved on this device only.");
  }catch{
   if(epoch===generation)setNotice("Photo preview applied, but device storage was unavailable. It may not survive a reload.");
  }
 });
});
sheet.querySelectorAll("[data-nbl-customize-clear]").forEach(button=>button.addEventListener("click",async()=>{
 syncProfile();
 const slot=button.dataset.nblCustomizeClear,user=activeUser;
 applyPhoto(slot,null);
 try{if(user)await photoDelete(assetKey(user,slot));setNotice("Personal background cleared.");}
 catch{setNotice("Background cleared for this session. Device storage could not be changed.");}
}));
sheet.querySelector("[data-nbl-customize-reset]").addEventListener("click",async()=>{
 syncProfile();
 const user=activeUser,epoch=++generation;
 preferences={...preset};applyLook(preset.look);applyColor(preset.color);
 for(const slot of slots)applyPhoto(slot,null);
 if(user){
  try{localStorage.removeItem(stateKey(user));}catch{}
  try{await Promise.all(slots.map(slot=>photoDelete(assetKey(user,slot))));}catch{}
 }
 if(epoch===generation)setNotice("Your Beans appearance has been reset.");
});
// Old account themes never bleed into a different account on shared devices.
panel.addEventListener("click",syncProfile,true);
window.addEventListener("focus",syncProfile);
window.addEventListener("pagehide",()=>slots.forEach(revoke),{once:true});
syncProfile();
})();
