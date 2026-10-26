// NBL Audiobook Studio — original local chapter planner, no synthesis or payment.
// Voice generation belongs on an authorized server, never in browser keys.
import {prepareManuscript} from "./nbl-book-creator-core.mjs";
export const MAX_AUDIO_CHAPTERS=60;
export const NARRATION_CHUNK_LIMIT=6000;
const isHeading=text=>/^(?:chapter\s+(?:\d+|[IVXLCDM]+)(?:\s*[:.\-–—]\s*.+)?|prologue(?:\s*[:.\-–—]\s*.+)?|epilogue(?:\s*[:.\-–—]\s*.+)?|part\s+(?:\d+|[IVXLCDM]+)(?:\s*[:.\-–—]\s*.+)?)$/i.test(text.trim());
const clean=s=>String(s||"").replace(/\r\n?/g,"\n").trim();
const slug=s=>clean(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70)||"book";
function segments(text,limit){
  if(!Number.isInteger(limit)||limit<100||limit>10000)throw Error("Narration chunk size is invalid.");
  const pieces=[];
  let rest=clean(text);
  while(rest.length>limit){
    const slice=rest.slice(0,limit);
    const candidates=[slice.lastIndexOf("\n"),slice.lastIndexOf(". "),slice.lastIndexOf("! "),slice.lastIndexOf("? "),slice.lastIndexOf("; "),slice.lastIndexOf(" ")];
    const offset=candidates.find(x=>x>Math.floor(limit*.55));
    const pos=offset>=0?offset+1:limit;
    const fragment=rest.slice(0,pos).trim();
    if(!fragment)throw Error("Cannot divide narration text safely.");
    pieces.push(fragment);rest=rest.slice(pos).trimStart();
  }
  if(rest)pieces.push(rest);
  return pieces;
}
export function audiobookChapters(manuscript,{chunkLimit=NARRATION_CHUNK_LIMIT}={}){
  const m=prepareManuscript(manuscript);
  const chapters=[];let cur={title:"Opening",lines:[]},sawHeading=false;
  const flush=()=>{const t=cur.lines.join("\n").trim();if(t)chapters.push({title:cur.title,text:t});};
  for(const line of m.text.split("\n")){
    if(isHeading(line)){flush();cur={title:line.trim().slice(0,120),lines:[]};sawHeading=true;}
    else cur.lines.push(line);
  }flush();
  if(chapters.length===0)throw Error("Add readable text for narration.");
  if(chapters.length>MAX_AUDIO_CHAPTERS)throw Error("This book has more chapters than one NBL audiobook project can handle.");
  if(chapters.length===1&&!sawHeading)chapters[0].title="Full reading";
  return {version:1,title:m.title,author:m.author,chapters:chapters.map((x,i)=>({
    index:i+1,title:x.title,text:x.text,
    chunks:segments(x.text,chunkLimit).map((s,j)=>({index:j+1,text:s,charCount:s.length}))
  })),narrationStatus:"NOT_GENERATED",provider:"none",paidProviderCalled:false,
  fileName:slug(m.title)+"-nbl-audiobook-narration-plan.json"};
}
export function narrationTotals(project){
  const chapters=Array.isArray(project?.chapters)?project.chapters:[];
  return {chapters:chapters.length,chunks:chapters.reduce((n,c)=>n+(c.chunks?.length||0),0),
    characters:chapters.reduce((n,c)=>n+(c.chunks||[]).reduce((m,x)=>m+x.charCount,0),0)};
}
export function allowedAudioFile(file){
  if(!file||!["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/mp4","audio/ogg"].includes(file.type) ||
     !Number.isFinite(file.size)||file.size<100||file.size>100*1024*1024)
     return {ok:false,message:"Choose an MP3, WAV, M4A or OGG file under 100 MB that you own or have permission to use."};
  return {ok:true};
}
export function ebookCreditDisclosure({title,creditCost,balance,alreadyOwned=false,entitled=false}={}){
  const name=String(title||"").trim().slice(0,130);
  if(!name)throw Error("Missing eBook title.");
  if(entitled||alreadyOwned)return Object.freeze({title:name,cost:0,remaining:balance,needsConfirm:false,
    canRedeem:false,reason:entitled?"included_entitlement":"already_owned",
    copy:entitled?"Included with your verified enrollment. No credits deducted.":"You already own this eBook. No credits deducted."});
  const valid=x=>Number.isInteger(x)&&x>=0;
  if(!valid(creditCost)||creditCost===0||!valid(balance))
    return Object.freeze({title:name,cost:null,remaining:null,needsConfirm:false,canRedeem:false,reason:"unverified_credit_offer",
      copy:"NBL hasn't verified the book's credit cost and your eligible account balance. No credit deduction is available yet."});
  const canRedeem=balance>=creditCost;
  return Object.freeze({title:name,cost:creditCost,balance,remaining:balance-creditCost,needsConfirm:canRedeem,
    canRedeem,reason:canRedeem?"ready_for_confirmation":"insufficient_credits",
    copy:canRedeem?name+" uses "+creditCost+" NBL Books credits. You have "+balance+"; after confirmation you will have "+(balance-creditCost)+". No additional cash checkout for this eBook."
      :name+" needs "+creditCost+" NBL Books credits, but you have "+balance+". No deduction was made."});
}
