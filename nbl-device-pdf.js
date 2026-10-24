/* NBL PDF Reader - on-device PDF.js viewer and optional Tesseract OCR.
   No documents uploaded, no OpenAI calls. Workers are downloaded lazily. */
(function(){
"use strict";
if(window.NblDevicePdf)return;
var MAX_BYTES=30*1024*1024,MAX_PAGES=150,MAX_PIXELS=4400000;
var pdf=null,loading=null,ocrWorker=null,pageNum=1,serial=0,priorFocus=null;
var overlay=document.createElement("div");
overlay.className="nbl-local-pdf";
overlay.hidden=true;
overlay.setAttribute("role","dialog");
overlay.setAttribute("aria-modal","true");
overlay.setAttribute("aria-label","NBL PDF Reader");
overlay.innerHTML='<section class="nbl-local-pdf-panel"><header><strong>NBL PDF Reader · free on-device</strong><button type="button" data-close>✕ Close</button></header><p>Read PDFs here without uploading or paying OpenAI. OCR runs on your device; the first use may download free language data. Asking Beans AI about a PDF is a separate action.</p><input type="file" accept=".pdf,application/pdf" aria-label="Choose local PDF" data-file><div class="nbl-local-pdf-actions"><button type="button" data-prev>← Previous</button><span data-count>Choose a PDF</span><button type="button" data-next>Next →</button><button type="button" data-ocr>OCR this page</button><button type="button" data-copy>Copy text</button></div><p data-status role="status" aria-live="polite"></p><div class="nbl-local-pdf-canvas"><canvas aria-label="PDF page rendering"></canvas></div><pre data-text aria-label="Extracted PDF text">No document selected.</pre></section>';
var style=document.createElement("style");
style.textContent=".nbl-local-pdf[hidden]{display:none!important}.nbl-local-pdf{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.9);display:flex;justify-content:center;align-items:center;padding:10px}.nbl-local-pdf-panel{background:#081727;color:#f3e8d2;border:1px solid #d6a14b;border-radius:16px;width:min(900px,100%);max-height:97vh;overflow:auto;padding:12px;font:14px/1.5 system-ui}.nbl-local-pdf header,.nbl-local-pdf-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0}.nbl-local-pdf header button{margin-left:auto}.nbl-local-pdf button{background:#192e46;color:#f3e8d2;border:1px solid #cfa758;border-radius:8px;padding:9px;cursor:pointer}.nbl-local-pdf button:disabled{opacity:.45}.nbl-local-pdf button:focus-visible,.nbl-local-pdf input:focus-visible{outline:3px solid #efd28d}.nbl-local-pdf-canvas{max-height:55vh;overflow:auto;background:#38414b;text-align:center}.nbl-local-pdf canvas{max-width:100%;height:auto;background:white}.nbl-local-pdf pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:16vh;overflow:auto;border:1px solid #556171;padding:8px;font:13px/1.5 monospace}.nbl-local-pdf p{font-size:12px;color:#dbc9ad}@media(max-width:550px){.nbl-local-pdf{padding:2px}.nbl-local-pdf-canvas{max-height:45vh}}";
document.head.append(style);document.body.append(overlay);
var $=q=>overlay.querySelector(q),file=$("[data-file]"),txt=$("[data-text]"),status=$("[data-status]"),canvas=$("canvas");
var prev=$("[data-prev]"),next=$("[data-next]"),ocr=$("[data-ocr]"),copy=$("[data-copy]"),count=$("[data-count]");
function say(t){status.textContent=t;}
function buttons(){prev.disabled=!pdf||pageNum<2;next.disabled=!pdf||pageNum>=pdf.numPages;ocr.disabled=!pdf;copy.disabled=!txt.textContent;count.textContent=pdf?"Page "+pageNum+" / "+pdf.numPages:"Choose a PDF";}
function script(src,key){if(window[key])return Promise.resolve(window[key]);return new Promise((resolve,reject)=>{var s=document.createElement("script");s.src=src;s.onload=()=>window[key]?resolve(window[key]):reject(Error("PDF engine unavailable"));s.onerror=()=>reject(Error("Could not download open-source PDF engine"));document.head.append(s);});}
async function closePdf(){serial++;var old=pdf;pdf=null;if(old)try{await old.destroy();}catch{};if(ocrWorker)try{await ocrWorker.terminate();}catch{};ocrWorker=null;pageNum=1;canvas.width=0;canvas.height=0;txt.textContent="";buttons();}
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
 var rows=new Map();
 for(var item of layer.items||[]){var value=String(item.str||"").trim();if(!value)continue;var y=Math.round((item.transform?.[5]||0)/4)*4;if(!rows.has(y))rows.set(y,[]);rows.get(y).push({x:item.transform?.[4]||0,v:value});}
 txt.textContent=[...rows.entries()].sort((a,b)=>b[0]-a[0]).map(([,items])=>items.sort((a,b)=>a.x-b.x).map(e=>e.v).join(" ")).join("\n");
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
 if(pdf.numPages>MAX_PAGES)throw Error("PDF exceeds 150-page local limit");
 pageNum=1;await paint(id);
 }catch(e){say(e?.message||"Unable to read PDF");await closePdf();}
}
async function change(n){if(!pdf)return;pageNum=Math.max(1,Math.min(pdf.numPages,pageNum+n));var id=++serial;try{await paint(id)}catch(e){say(e.message)}}
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
$("[data-close]").addEventListener("click",async()=>{overlay.hidden=true;file.value="";await closePdf();priorFocus?.focus?.();});
file.addEventListener("change",()=>{if(file.files?.[0])void read(file.files[0]);});
prev.addEventListener("click",()=>{void change(-1)});next.addEventListener("click",()=>{void change(1)});ocr.addEventListener("click",()=>{void scan()});
copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(txt.textContent);say("Copied page text.");}catch{say("Select text manually to copy.");}});
overlay.addEventListener("keydown",e=>{if(e.key==="Escape")$("[data-close]").click();if(e.key==="Tab"){var choices=[...overlay.querySelectorAll("button:not(:disabled),input")];var i=choices.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();choices.at(-1).focus()}else if(!e.shiftKey&&i===choices.length-1){e.preventDefault();choices[0].focus()}}});
buttons();
window.NblDevicePdf={open(){priorFocus=document.activeElement;overlay.hidden=false;file.focus();say("Choose a PDF. All document processing remains on your device.");},close(){$("[data-close]").click()}};
})();