/* Pulse Stories: surface the videos already visible in Stream Feeds.
 * No new APIs, uploads, reposts, or changes to Meta/YouTube publishing.
 * Static source links keep the rail useful when the current feed is quiet.
 */
function initializePulseStories(){
  const section=document.querySelector("#pulseStories");
  const strip=document.querySelector("#pulseStoryFeedVideos");
  const feed=document.querySelector("#feedItems");
  if(!section||!strip||!feed)return;
  function highlightFor(card,index){
    const media=card.querySelector(".social-media");
    if(!media)return null;
    const video=media.querySelector("video");
    const youtube=media.querySelector('iframe[src^="https://www.youtube-nocookie.com/embed/"]');
    const embedded=media.querySelector(".social-embed-play");
    if(!video&&!youtube&&!embedded)return null;
    const provider=youtube?"YouTube":embedded
      ?(embedded.textContent.match(/YouTube|Instagram|Facebook|Threads/i)?.[0]||"Social video")
      :"Pulse video";
    const author=card.querySelector(".social-author")?.textContent?.trim()||"NBL member";
    const button=document.createElement("button");
    button.type="button";
    button.className="pulse-highlight pulse-story-video-highlight";
    button.setAttribute("aria-label","Open "+provider+" from "+author+" in your Pulse feed");
    const circle=document.createElement("span");
    circle.className="pulse-highlight-circle pulse-story-video-circle";
    circle.setAttribute("aria-hidden","true");
    const play=document.createElement("span");
    play.className="pulse-story-video-play";
    play.textContent="▶";
    if(youtube){
      const match=youtube.getAttribute("src")?.match(/^https:\/\/www\.youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?#]|$)/);
      if(match){
        const cover=document.createElement("img");
        cover.src="https://i.ytimg.com/vi/"+match[1]+"/hqdefault.jpg";
        cover.alt="";cover.loading="lazy";cover.referrerPolicy="no-referrer";
        circle.append(cover);
      }
    }
    circle.append(play);
    const name=document.createElement("span");
    name.className="pulse-story-video-title";
    name.textContent=provider;
    button.append(circle,name);
    button.addEventListener("click",()=>{
      if(!card.isConnected)return;
      card.scrollIntoView({block:"center",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
      if(video){video.focus({preventScroll:true});void video.play().catch(()=>{});}
      else if(embedded){embedded.click();}
      else if(youtube){youtube.focus({preventScroll:true});}
    });
    return button;
  }
  function sync(){
    // Read the live, already-authorized feed DOM; never fetch private media or create new posts.
    const cards=[...feed.querySelectorAll(".social-card")].slice(0,16);
    const videos=[];
    for(let i=0;i<cards.length&&videos.length<6;i++){
      const item=highlightFor(cards[i],i);
      if(item)videos.push(item);
    }
    strip.replaceChildren(...videos);
    strip.hidden=videos.length===0;
    section.dataset.hasVideoHighlights=String(videos.length>0);
  }
  new MutationObserver(sync).observe(feed,{childList:true});
  sync();
}
if(document.readyState==="loading")
  document.addEventListener("DOMContentLoaded",initializePulseStories,{once:true});
else initializePulseStories();
