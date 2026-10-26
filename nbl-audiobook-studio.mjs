import {audiobookChapters,narrationTotals,allowedAudioFile,ebookCreditDisclosure} from "./nbl-audiobook-core.mjs";
const $=id=>document.getElementById(id);
const btn=$("audio-build"),chapter=$("audio-chapter"),output=$("audio-status"),summary=$("audio-summary");
let project=null,playUrl=null;
const aud=$("audio-track-player");
function say(message,kind="info"){output.textContent=message;output.dataset.kind=kind;}
function releaseAudio(){
  aud.pause();aud.removeAttribute("src");aud.load();
  if(playUrl){URL.revokeObjectURL(playUrl);playUrl=null;}
}
function clearProject(){
  project=null;chapter.replaceChildren();summary.hidden=true;$("audio-narration-text").value="";
  releaseAudio();$("audio-upload").value="";$("audio-file-name").textContent="";
  say("The manuscript changed. Rebuild your narration plan to include the edits.");
}
for(const id of ["title","author","manuscript"])$(id).addEventListener("input",()=>{if(project)clearProject();});
btn.addEventListener("click",()=>{
  try{
    clearProject();
    project=audiobookChapters({title:$("title").value,author:$("author").value,text:$("manuscript").value});
    for(const c of project.chapters){
      const option=document.createElement("option");option.value=String(c.index-1);option.textContent=c.index+". "+c.title;
      chapter.append(option);
    }
    const totals=narrationTotals(project);
    $("audio-count").textContent=totals.chapters+" chapters · "+totals.chunks+" narration segments · "+totals.characters+" characters";
    summary.hidden=false;
    loadChapter();
    say("Your NBL audiobook narration plan is ready. No AI audio has been generated, no provider charged, and no listener purchase created.","success");
  }catch(e){project=null;summary.hidden=true;say(e instanceof Error?e.message:"Couldn't prepare this audiobook.","error");}
});
function loadChapter(){
  releaseAudio();$("audio-file-name").textContent="";
  const c=project?.chapters?.[Number(chapter.value)];
  $("audio-narration-text").value=c?.text||"";
}
chapter.addEventListener("change",loadChapter);
$("audio-save-plan").addEventListener("click",()=>{
  if(!project)return;
  const blob=new Blob([JSON.stringify(project,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=project.fileName;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
  say("Narration-plan download requested. It contains your manuscript text, not synthesized audio.","success");
});
$("audio-upload").addEventListener("change",()=>{
  releaseAudio();
  const file=$("audio-upload").files?.[0];
  if(!file)return;
  const check=allowedAudioFile(file);
  if(!check.ok){$("audio-upload").value="";say(check.message,"error");return;}
  playUrl=URL.createObjectURL(file);aud.src=playUrl;$("audio-file-name").textContent=file.name;
  say("Local audio loaded for this chapter. Playback stays on this device; no upload or purchase occurred.","success");
});
$("audio-speak-preview").addEventListener("click",()=>{
  const c=project?.chapters?.[Number(chapter.value)];
  if(!c){say("Prepare an audiobook first.","error");return;}
  if(!("speechSynthesis" in window)){say("This browser does not offer a local speech preview.","error");return;}
  speechSynthesis.cancel();
  const speech=new SpeechSynthesisUtterance(c.text.slice(0,650));
  speech.rate=1.0;speech.lang="en-US";speechSynthesis.speak(speech);
  say("Playing a short built-in browser speech preview. This is NOT ElevenLabs narration or a finished audiobook.");
});
$("audio-stop-preview").addEventListener("click",()=>{if("speechSynthesis" in window)speechSynthesis.cancel();});
window.addEventListener("pagehide",()=>{releaseAudio();if("speechSynthesis" in window)speechSynthesis.cancel();});
const creditInfo=ebookCreditDisclosure({title:"Your next NBL eBook"});
$("ebook-credit-status").textContent=creditInfo.copy+" Your verified NBL Books credit balance and per-title offer must exist before redemption. Chat replies and Studios media credits cannot be silently taken.";
