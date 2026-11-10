// NBL Pulse visual controls only. Stream/Clerk posting engine remains unchanged.
function initializePulseVisualControls(){
  const composer=document.querySelector("#postForm");
  const extra=document.querySelector("#pulseComposerExtra");
  const upload=document.querySelector("#postMedia");
  const videoLink=document.querySelector("#videoLink");
  if(!composer||!extra||!upload||!videoLink)return;
  const feedItems=document.querySelector("#feedItems");
  const feedTitle=document.querySelector("#feedTitle");
  const welcome=document.querySelector(".pulse-welcome-post");
  if(feedItems&&feedTitle&&welcome){
    const syncWelcome=()=>{
      const hasRealPosts=Boolean(feedItems.querySelector(".social-card"));
      const forYou=feedTitle.textContent.trim()==="For You";
      const isQuiet=Boolean(feedItems.querySelector(".social-empty"));
      welcome.hidden=!forYou||hasRealPosts||!isQuiet;
    };
    new MutationObserver(syncWelcome).observe(feedItems,{childList:true});
    new MutationObserver(syncWelcome).observe(feedTitle,{childList:true,subtree:true,characterData:true});
    syncWelcome();
  }
  const acceptAll="image/jpeg,image/png,image/webp,video/mp4,video/webm";
  for(const button of document.querySelectorAll("[data-pulse-compose]")){
    button.addEventListener("click",()=>{
      const action=button.getAttribute("data-pulse-compose");
      extra.hidden=false;
      if(action==="link"){
        videoLink.focus();
        videoLink.scrollIntoView({block:"nearest",behavior:"auto"});
        return;
      }
      upload.accept=action==="video"?"video/mp4,video/webm":"image/jpeg,image/png,image/webp";
      upload.multiple=action!=="video";
      upload.click();
    });
  }
  upload.addEventListener("change",()=>{extra.hidden=false;upload.accept=acceptAll;upload.multiple=true;});
  const openComposer=event=>{
    const link=event.target.closest('a[href="#composeTitle"]');
    if(!link)return;
    const input=document.querySelector("#postText");
    if(!input)return;
    event.preventDefault();
    input.scrollIntoView({block:"center",behavior:"smooth"});
    input.focus({preventScroll:true});
  };
  document.addEventListener("click",openComposer);
  for(const button of document.querySelectorAll(".pulse-mobile-more-options [data-feed]")){
    button.addEventListener("click",()=>{const menu=button.closest("details");if(menu)menu.open=false;});
  }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializePulseVisualControls,{once:true});
else initializePulseVisualControls();
