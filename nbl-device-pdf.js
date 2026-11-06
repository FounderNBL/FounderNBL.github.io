/* NBL PDF Reader - on-device PDF.js viewer and optional Tesseract OCR.
   No documents uploaded, no OpenAI calls. Workers are downloaded lazily. */
(function(){
"use strict";
if(window.NblDevicePdf)return;
var MAX_BYTES=30*1024*1024,MAX_PAGES=600,MAX_PIXELS=4400000;
var pdf=null,loading=null,ocrWorker=null,pageNum=1,serial=0,priorFocus=null,previousBodyOverflow=null;
var currentFile=null,allPagesText=null,missingEmbeddedText=[],extracting=false,onAttach=null;
var overlay=document.createElement("div");
overlay.className="nbl-local-pdf";
overlay.hidden=true;
overlay.setAttribute("role","dialog");
overlay.setAttribute("aria-modal","true");
overlay.setAttribute("aria-label","NBL PDF Reader");
overlay.innerHTML='<section class="nbl-local-pdf-panel"><header><strong>NBL PDF Reader · free on-device</strong><button type="button" data-close>✕ Close</button></header><p>Read PDFs here without uploading or paying OpenAI. OCR runs on your device; the first use may download free language data. Extracting entire document text is free and on-device. Attaching a PDF to Beans is a separate, opt-in action; it never sends a message automatically and follows your existing membership and usage rules.</p><input type="file" accept=".pdf,application/pdf" aria-label="Choose local PDF" data-file><div class="nbl-local-pdf-actions"><button type="button" data-prev>← Previous</button><span data-count>Choose a PDF</span><button type="button" data-next>Next →</button><button type="button" data-ocr>OCR this page</button><button type="button" data-copy>Copy page text</button><button type="button" data-all>Extract entire PDF</button><button type="button" data-download>Download full text</button><button type="button" data-beans>Attach PDF to Beans</button></div><p data-status role="status" aria-live="polite"></p><div class="nbl-local-pdf-canvas"><canvas aria-label="PDF page rendering"></canvas></div><pre data-text aria-label="Extracted PDF text">No document selected.</pre></section>';
var style=document.createElement("style");
style.textContent=".nbl-local-pdf[hidden]{display:none!important}\n.nbl-local-pdf{position:fixed!important;inset:0!important;z-index:2147483647!important;box-sizing:border-box;width:100vw;height:100vh;height:100dvh;background:rgba(0,0,0,.92);display:flex;justify-content:center;align-items:stretch;padding:8px;overflow:hidden;overscroll-behavior:contain}\n.nbl-local-pdf *{box-sizing:border-box}\n.nbl-local-pdf-panel{background:#081727;color:#f3e8d2;border:1px solid #d6a14b;border-radius:16px;width:min(900px,100%);height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:12px;font:14px/1.5 system-ui}\n.nbl-local-pdf header,.nbl-local-pdf-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}\n.nbl-local-pdf header button{margin-left:auto}\n.nbl-local-pdf button{position:relative;appearance:none;flex-shrink:0;background:#192e46;color:#f3e8d2;border:1px solid #cfa758;border-radius:9px;min-height:48px;min-width:48px;padding:10px 13px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}\n.nbl-local-pdf button:disabled{opacity:.45}\n.nbl-local-pdf button:focus-visible,.nbl-local-pdf input:focus-visible{outline:3px solid #efd28d;outline-offset:2px}\n.nbl-local-pdf [data-file]{display:block;width:100%;max-width:100%;min-height:50px;padding:8px;color:#f3e8d2}\n.nbl-local-pdf-canvas{background:#38414b;text-align:center;overflow:visible}\n.nbl-local-pdf canvas{display:block;max-width:100%;height:auto;margin:auto;background:white}\n.nbl-local-pdf pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #556171;padding:12px;font:13px/1.5 monospace}\n.nbl-local-pdf p{font-size:12px;color:#dbc9ad}\n.nbl-local-pdf [data-count]{font-weight:600}\n@media(max-width:550px){.nbl-local-pdf{padding:4px}.nbl-local-pdf-panel{padding:12px}.nbl-local-pdf-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.nbl-local-pdf-actions [data-count]{order:-1;grid-column:1/-1;text-align:center;padding:5px}.nbl-local-pdf-actions button{width:100%;min-width:0;white-space:normal;font-size:14px}}";
document.head.append(style);document.body.append(overlay);
var $=q=>overlay.querySelector(q),file=$("[data-file]"),txt=$("[data-text]"),status=$("[data-status]"),canvas=$("canvas");
var prev=$("[data-prev]"),next=$("[data-next]"),ocr=$("[data-ocr]"),copy=$("[data-copy]"),count=$("[data-count]");
var all=$("[data-all]"),download=$("[data-download]"),beans=$("[data-beans]");
function say(t){status.textContent=t;}
function buttons(){prev.disabled=!pdf||pageNum<2;next.disabled=!pdf||pageNum>=pdf.numPages;ocr.disabled=!pdf;copy.disabled=!pdf||!txt.textContent;all.disabled=!pdf||extracting;download.disabled=!allPagesText;beans.disabled=!pdf||!currentFile;count.textContent=pdf?"Page "+pageNum+" / "+pdf.numPages:"Choose a PDF";}
function script(src,key){if(window[key])return Promise.resolve(window[key]);return new Promise((resolve,reject)=>{var s=document.createElement("script");s.src=src;s.onload=()=>window[key]?resolve(window[key]):reject(Error("PDF engine unavailable"));s.onerror=()=>reject(Error("Could not download open-source PDF engine"));document.head.append(s);});}
async function closePdf(){serial++;var old=pdf;pdf=null;if(old)try{await old.destroy();}catch{};if(ocrWorker)try{await ocrWorker.terminate();}catch{};ocrWorker=null;pageNum=1;currentFile=null;allPagesText=null;missingEmbeddedText=[];extracting=false;canvas.width=0;canvas.height=0;txt.textContent="";buttons();}
function pageText(layer){
 var rows=new Map();
 for(var item of layer.items||[]){var value=String(item.str||"").trim();if(!value)continue;var y=Math.round((item.transform?.[5]||0)/4)*4;if(!rows.has(y))rows.set(y,[]);rows.get(y).push({x:item.transform?.[4]||0,v:value});}
 return [...rows.entries()].sort((a,b)=>b[0]-a[0]).map(([,items])=>items.sort((a,b)=>a.x-b.x).map(e=>e.v).join(" ")).join("\n");
}
async function paint(id){
 if(!pdf)return;
 say("Rendering and extracting page on your device…");
 var page=await pdf.getPage(pageNum),native=page.getViewport({scale:1});
 var scale=Math.min(2,Math.sqrt(MAX_PIXELS/Math.max(1,native.width*native.height)));
 var viewport=page.getViewport({scale:scale});
 canvas.width=Math.floor(viewport.width);canvas.height=Math.floor(viewport.height);
 if(canvas.width*canvas.height>MAX_PIXELS+5000)throw Error("Page exceeds safe image limit");
 await page.render({canvasContext:canvas.getContext("2d",{alpha:false}),viewport:viewport}).promise;
 var layer=await page.getTextContent();
 if(id!==serial)return;
 txt.textContent=pageText(layer);
 if(!txt.textContent)txt.textContent="This page has no selectable text. Use OCR for image-only pages.";
 say("Rendered locally. Nothing was uploaded.");
 buttons();
}
async function read(f){
 var id=++serial;
 try{
 if(!f||f.size>MAX_BYTES||(!/\.pdf$/i.test(f.name)&&f.type!=="application/pdf"))throw Error("Choose a PDF up to 30 MB");
 say("Opening on-device PDF reader…");
 var engine=await script("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","pdfjsLib");
 engine.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
 var data=new Uint8Array(await f.arrayBuffer());
 if(id!==serial)return;
 if(String.fromCharCode(...data.slice(0,5))!=="%PDF-")throw Error("Invalid PDF header");
 if(pdf)await pdf.destroy();pdf=null;
 loading=engine.getDocument({data:data,isEvalSupported:false});pdf=await loading.promise;loading=null;
 if(pdf.numPages>MAX_PAGES)throw Error("PDF exceeds 600-page local limit");
 currentFile=f;allPagesText=null;missingEmbeddedText=[];pageNum=1;await paint(id);
 }catch(e){say(e?.message||"Unable to read PDF");await closePdf();}
}
async function change(n){if(!pdf)return;pageNum=Math.max(1,Math.min(pdf.numPages,pageNum+n));var id=++serial;try{await paint(id)}catch(e){say(e.message)}}
async function extractEntireDocument(){
 if(!pdf||extracting)return;
 var id=serial,doc=pdf,parts=[],total=0,missing=[];
 extracting=true;buttons();
 try{
  for(var p=1;p<=doc.numPages;p++){
   if(id!==serial||doc!==pdf)return;
   var page=await doc.getPage(p),layer=await page.getTextContent(),text=pageText(layer);
   if(!text.trim()){missing.push(p);text="[No embedded text on this page - OCR required]";}
   total+=text.length+48;
   if(total>5000000)throw Error("PDF text exceeds the 5-million-character on-device extraction limit. Use smaller documents.");
   parts.push("=== Page "+p+" / "+doc.numPages+" ===\n"+text);
   if(p%8===0||p===doc.numPages){
    say("Extracting entire PDF: "+p+" / "+doc.numPages+" pages. Nothing uploaded.");
    await new Promise(resolve=>setTimeout(resolve,0));
   }
  }
  if(id!==serial||doc!==pdf)return;
  allPagesText=parts.join("\n\n");missingEmbeddedText=missing;
  say(missing.length
    ?"Extracted "+doc.numPages+" pages, but "+missing.length+" image-only page(s) need OCR; entire content NOT verified."
    :"All "+doc.numPages+" pages have extractable text. Use Download full text, or attach the original PDF to Beans.");
 }catch(error){if(id===serial){allPagesText=null;missingEmbeddedText=[];say(error?.message||"Could not read the entire document.");}}
 finally{extracting=false;buttons();}
}
function downloadEntireText(){
 if(!allPagesText)return;
 var blob=new Blob([allPagesText],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=(currentFile?.name||"nbl-document").replace(/\.pdf$/i,"")+"-all-pages.txt";
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 say("Downloaded extracted text locally. No upload or AI call.");
}
async function scan(){
 if(!pdf)return;
 ocr.disabled=true;var id=serial,at=pageNum;
 try{
 say("Loading free local OCR engine and language data…");
 var engine=await script("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js","Tesseract");
 ocrWorker=ocrWorker||await engine.createWorker("eng");
 say("Recognizing this page locally…");
 var r=await ocrWorker.recognize(canvas);
 if(id!==serial||at!==pageNum)return;
 txt.textContent=String(r?.data?.text||"").trim()||"OCR found no readable words.";
 say("OCR finished. Please review accuracy.");
 }catch(e){say("Local OCR unavailable: "+(e?.message||"engine error"))}finally{buttons()}
}
$("[data-close]").addEventListener("click",async()=>{overlay.hidden=true;file.value="";await closePdf();document.body.style.overflow=previousBodyOverflow??"";previousBodyOverflow=null;onAttach=null;priorFocus?.focus?.();});
file.addEventListener("change",()=>{if(file.files?.[0])void read(file.files[0]);});
prev.addEventListener("click",()=>{void change(-1)});next.addEventListener("click",()=>{void change(1)});ocr.addEventListener("click",()=>{void scan()});
copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(txt.textContent);say("Copied page text.");}catch{say("Select page text manually to copy.");}});
all.addEventListener("click",()=>{void extractEntireDocument()});
download.addEventListener("click",downloadEntireText);
beans.addEventListener("click",async()=>{
 if(!currentFile){say("Choose a PDF first.");return;}
 if(!onAttach){say("Open this reader from Beans tools to attach the file.");return;}
 beans.disabled=true;
 try{
  await onAttach(currentFile);
  overlay.hidden=true;file.value="";await closePdf();
  document.body.style.overflow=previousBodyOverflow??"";previousBodyOverflow=null;
  onAttach=null;priorFocus?.focus?.();
 }catch(error){say(error?.message||"Could not attach PDF to Beans.");buttons();}
});
overlay.addEventListener("click",event=>event.stopPropagation());
overlay.addEventListener("keydown",e=>{if(e.key==="Escape")$("[data-close]").click();if(e.key==="Tab"){var choices=[...overlay.querySelectorAll("button:not(:disabled),input")];var i=choices.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();choices.at(-1).focus()}else if(!e.shiftKey&&i===choices.length-1){e.preventDefault();choices[0].focus()}}});
buttons();
window.NblDevicePdf={open(options={}){priorFocus=document.activeElement;onAttach=typeof options.onAttach==="function"?options.onAttach:null;previousBodyOverflow=document.body.style.overflow;document.body.style.overflow="hidden";overlay.hidden=false;file.focus();say("Choose a PDF. Local reading is free. AI attachment is a separate choice.");},close(){$("[data-close]").click()}};
})();