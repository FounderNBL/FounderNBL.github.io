import {prepareManuscript,exportReadingDraft,readImportedPdf,giveToLocalReader,MAX_IMPORT_BYTES} from "/nbl-book-creator-core.mjs";

const $=id=>document.getElementById(id);
const form=$("book-form"),input=$("import-file"),status=$("creator-status");
const delivery=$("delivery-actions"),details=$("delivery-details"),readerLink=$("open-reader");
let output=null;
function say(message,kind="info"){status.textContent=message;status.dataset.kind=kind;}
function model(){return {title:$("title").value,author:$("author").value,text:$("manuscript").value};}
function resetOutput(){output=null;delivery.hidden=true;details.hidden=true;readerLink.hidden=true;}
for(const id of ["title","author","manuscript"]){
  $(id).addEventListener("input",()=>{if(output){resetOutput();say("Manuscript changed. Create a new PDF to include your edits.");}});
}
form.addEventListener("submit",event=>{
  event.preventDefault();
  try{
    output=exportReadingDraft(prepareManuscript(model()),window.jspdf?.jsPDF);
    delivery.hidden=false;details.hidden=false;readerLink.hidden=true;
    details.textContent="Created "+output.pages+"-page reading draft. This is not a print-ready Lulu cover or interior.";
    say("Your PDF is ready. Download it or add it to NBL Reader on this device.","success");
  }catch(error){resetOutput();say(error instanceof Error?error.message:"PDF creation failed.","error");}
});
$("clear-form").addEventListener("click",()=>{
  if(!window.confirm("Clear this book draft from the editor? Save a copy first."))return;
  form.reset();resetOutput();say("Editor cleared. No file was deleted from your Reader library.");
});
$("download-pdf").addEventListener("click",()=>{
  if(!output)return;
  const url=URL.createObjectURL(output.blob);
  const a=document.createElement("a");
  a.href=url;a.download=output.filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  say("Download requested. Check your device's downloads for "+output.filename+".","success");
});
$("give-to-reader").addEventListener("click",async()=>{
  if(!output)return;
  const button=$("give-to-reader");button.disabled=true;
  try{
    const saved=await giveToLocalReader(output);
    readerLink.hidden=false;
    say("Saved "+saved.filename+" to NBL Reader on this device. Open the library to view it.","success");
  }catch(error){say((error instanceof Error?error.message:"Could not save locally.")+" You can still download your PDF.","error");}
  finally{button.disabled=false;}
});
input.addEventListener("change",async()=>{
  const file=input.files?.[0];input.value="";
  if(!file)return;
  resetOutput();
  try{
    if(file.size>MAX_IMPORT_BYTES)throw Error("Choose a file no larger than 12 MB.");
    const name=String(file.name||"").toLowerCase();
    if(name.endsWith(".txt")||name.endsWith(".md")){
      const text=await file.text();
      if(text.length>180000)throw Error("Manuscript is too long.");
      $("manuscript").value=text;
      if(!$("title").value.trim())$("title").value=file.name.replace(/\.(md|txt)$/i,"").slice(0,130);
      say("Text imported locally. Review your book before creating the PDF.","success");
    }else if(name.endsWith(".pdf")){
      say("Reading PDF locally…");
      const pdfjs=window.pdfjsLib;
      if(pdfjs?.GlobalWorkerOptions)pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const result=await readImportedPdf(file,pdfjs);
      $("manuscript").value=result.text;
      if(!$("title").value.trim())$("title").value=file.name.replace(/\.pdf$/i,"").slice(0,130);
      say("Extracted text from "+result.pages+" PDF pages. Please review formatting and names.","success");
    }else throw Error("Choose a PDF, TXT or Markdown manuscript.");
  }catch(error){say(error instanceof Error?error.message:"Could not read the file.","error");}
});
