import {prepareManuscript} from "./nbl-book-creator-core.mjs";
import {NBL_PRINT_PACKAGES,renderPrintInterior,renderPrintCover,checkPrintFiles} from "./nbl-book-print-core.mjs";

const $=id=>document.getElementById(id);
const $status=$("print-status"),ready=$("print-candidates"),downloadInterior=$("download-interior"),downloadCover=$("download-cover");
const select=$("print-package");
if(!select||!$status)throw new Error("NBL Print Studio page is incomplete.");
for(const pack of NBL_PRINT_PACKAGES){
  const option=document.createElement("option");option.value=pack.id;option.textContent=pack.name;select.append(option);
}
let current=null,artworkDataUrl="";
const notify=(text,kind="info")=>{$status.textContent=text;$status.dataset.kind=kind;};
const invalidate=()=>{current=null;ready.hidden=true;notify("Print files need a fresh preparation before Lulu can review them.");};
for(const id of ["title","author","manuscript","print-package","print-blurb","print-cover-color"]){
  $(id)?.addEventListener("input",invalidate);
}
const art=$("print-cover-image");
art.addEventListener("change",async()=>{
  invalidate();
  const file=art.files?.[0];
  if(!file){artworkDataUrl="";return;}
  if(!/^image\/(png|jpeg)$/.test(file.type)||file.size>6*1024*1024){
    artworkDataUrl="";art.value="";notify("Use a JPEG or PNG cover image no bigger than 6 MB.","error");return;
  }
  artworkDataUrl=await new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=()=>reject(Error("Cover image could not be read."));reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file);
  }).catch(e=>{notify(e.message,"error");return "";});
});
function manuscript(){
  return prepareManuscript({title:$("title").value,author:$("author").value,text:$("manuscript").value});
}
$("print-build").addEventListener("click",()=>{
  current=null;ready.hidden=true;
  try{
    const m=manuscript(),pdf=window.jspdf?.jsPDF;
    const interior=renderPrintInterior(m,pdf,select.value);
    const cover=renderPrintCover(m,pdf,select.value,interior.pages,{
      backText:$("print-blurb").value,coverColor:$("print-cover-color").value,artworkDataUrl
    });
    const check=checkPrintFiles({interior,cover,packageId:select.value,pageCount:interior.pages});
    if(!check.candidateReady)throw Error(check.message);
    current={interior,cover};
    ready.hidden=false;
    $("print-pages").textContent=String(interior.pages);
    $("print-size").textContent=cover.geometry.widthIn.toFixed(3)+" × "+cover.geometry.heightIn.toFixed(3)+" in (estimate)";
    notify("Beans helped prepare your interior and wraparound cover drafts. Lulu has NOT validated them or approved an order. Review both files and do not submit payment.","success");
  }catch(e){notify(e instanceof Error?e.message:"Print preparation failed.","error");}
});
const download=(blob,name)=>{
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
};
downloadInterior.addEventListener("click",()=>{
  if(!current)return;download(current.interior.blob,current.interior.filename);
  notify("Interior candidate downloaded. Still pending Lulu's official file validation.");
});
downloadCover.addEventListener("click",()=>{
  if(!current)return;download(current.cover.blob,current.cover.filename);
  notify("Cover candidate downloaded. Dimensions are preliminary until Lulu's exact cover template is checked.");
});
$("print-ask-beans").addEventListener("click",()=>{
  const beansButton=document.querySelector('button[aria-label="Open Beans"]');
  if(!beansButton){notify("Beans chat isn't available on this page right now. You can still work on the book here.","error");return;}
  beansButton.click();
  const input=$("nbl-beans-input");
  if(input){
    const title=$("title").value.trim().slice(0,130);
    input.value="Help me develop ORIGINAL cover art for my "+(title?'book called "'+title+'"':"book")+". Ask about genre, audience, color and visual direction before making the image. I need a cover suited to a full-wrap paperback; do not claim Lulu approved it.";
    input.focus();
    input.dispatchEvent(new Event("input",{bubbles:true}));
  }
});
// Customer printing isn't activated by client-side state. This version creates
// local candidate files only. Future server bridge will require ownership,
// upload consent, real Lulu asynchronous validation, exact template, verified
// destination quote, customer approval and payment reconciliation.
