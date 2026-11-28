(()=>{
"use strict";
if(document.getElementById("nbl-still-camera-launcher"))return;
const style=document.createElement("style");
style.textContent=".nbl-still-launcher{position:fixed;left:14px;bottom:18px;z-index:2147482900;min-height:48px;border:2px solid #e5bb6e;border-radius:999px;background:#0b1829;color:#ffdb9e;font:700 14px system-ui,sans-serif;padding:10px 14px;box-shadow:0 7px 26px #0009;cursor:pointer}.nbl-still-launcher:focus-visible{outline:3px solid white;outline-offset:3px}.nbl-still-modal{border:2px solid #e5bb6e;border-radius:14px;background:#071421;color:#fff;width:min(820px,100vw - 18px);height:min(92dvh,920px);max-width:calc(100vw - 12px);max-height:calc(100dvh - 12px);padding:0;overflow:hidden}.nbl-still-modal::backdrop{background:#000c}.nbl-still-wrap{display:flex;flex-direction:column;height:100%}.nbl-still-close{font:700 15px system-ui,sans-serif;background:#dcb46b;color:#091624;border:0;padding:10px;cursor:pointer;min-height:44px}.nbl-still-frame{border:0;width:100%;flex:1;min-height:0}@media(max-width:560px){.nbl-still-modal{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:0}.nbl-still-launcher{bottom:max(18px,env(safe-area-inset-bottom));left:12px}.nbl-still-launcher.nbl-still-launcher-pulse{bottom:calc(94px + env(safe-area-inset-bottom));left:12px}}";
document.head.appendChild(style);
const button=document.createElement("button");
button.id="nbl-still-camera-launcher";button.type="button";button.className="nbl-still-launcher";
button.textContent="📷 Still";button.setAttribute("aria-label","Open Still camera");
// Pulse has a fixed mobile navigation bar: never cover Home/Watch/Live/Messages.
// Keep the portable camera separate from Pulse navigation without intercepting its taps.
if(/^\/pulse\/?(?:index\.html)?$/.test(location.pathname))button.classList.add("nbl-still-launcher-pulse");
const modal=document.createElement("dialog");modal.className="nbl-still-modal";
modal.setAttribute("aria-label","Still camera");modal.innerHTML='<div class="nbl-still-wrap"><button type="button" class="nbl-still-close" aria-label="Close Still camera">Close Still</button></div>';
const wrap=modal.firstElementChild;
function close(){if(modal.open)modal.close();}
button.addEventListener("click",()=>{
  if(modal.open)return;
  const frame=document.createElement("iframe");
  frame.className="nbl-still-frame";frame.title="Still camera and local recorder";
  frame.allow="camera; microphone";frame.referrerPolicy="same-origin";
  frame.src="/studio/still-camera.html";
  wrap.appendChild(frame);
  modal.showModal();
});
modal.querySelector(".nbl-still-close").addEventListener("click",close);
modal.addEventListener("close",()=>{
  const frame=modal.querySelector("iframe");if(frame)frame.remove();
  button.focus();
});
window.addEventListener("message",event=>{
  const frame=modal.querySelector("iframe");
  if(frame&&event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==="nbl-still-camera-close")close();
});
document.body.append(button,modal);
})();