// NBL Books Creator — local-first. No customer uploads, payment, or print order.
// Reuse this core in the on-site editor and in contract tests.
export const MAX_MANUSCRIPT_CHARS = 180000;
export const MAX_IMPORT_BYTES = 12 * 1024 * 1024;
export const MAX_IMPORT_PAGES = 120;
const clean = (value, max) => String(value || "").replace(/\r\n?/g, "\n").trim().slice(0, max);

export function prepareManuscript(input) {
  const title = clean(input?.title, 130);
  const author = clean(input?.author, 100);
  const text = clean(input?.text, MAX_MANUSCRIPT_CHARS + 1);
  if (title.length < 2) throw Error("Add a book title.");
  if (author.length < 2) throw Error("Add an author name.");
  if (!text || text.length < 20) throw Error("Write at least 20 characters before exporting.");
  if (text.length > MAX_MANUSCRIPT_CHARS) throw Error("Book is too long for the local draft editor.");
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) throw Error("Remove binary/control characters from the manuscript.");
  return { title, author, text };
}
export function pdfFileName(title) {
  const filename = clean(title, 90).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 _-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
  return (filename || "nbl-book") + "-reading-draft.pdf";
}
export function exportReadingDraft(manuscript, JsPdf) {
  const m = prepareManuscript(manuscript);
  if (typeof JsPdf !== "function") throw Error("PDF maker unavailable. Reconnect and try again.");
  // This is a READING DRAFT, not a print-ready Lulu cover or interior.
  const doc = new JsPdf({unit:"pt",format:[432,648],orientation:"portrait",compress:true});
  if (typeof doc.splitTextToSize !== "function" || typeof doc.output !== "function") throw Error("PDF maker unavailable.");
  doc.setProperties({title:m.title,author:m.author,subject:"NBL Books personal reading draft (not print-ready)"});
  let page=1, y=89;
  const width=432, left=53, right=53, bottom=587, step=17;
  const nextPage=()=>{ doc.addPage();page++;y=65; };
  const line=(words, font=11)=>{
    doc.setFont("helvetica","normal");doc.setFontSize(font);
    const sections=doc.splitTextToSize(String(words),width-left-right);
    for(const section of sections) {
      if(y+step>bottom)nextPage();
      doc.text(section,left,y);y+=step;
    }
  };
  doc.setFont("helvetica","bold");doc.setFontSize(21);
  for(const chunk of doc.splitTextToSize(m.title,326)){doc.text(chunk,left,y);y+=29;}
  y+=16;doc.setFont("helvetica","normal");doc.setFontSize(12);doc.text("By "+m.author,left,y);
  y+=45;
  line("NBL Books · Personal reading draft. Review before printing.",9);
  y+=15;
  for(const paragraph of m.text.split(/\n/)) {
    if(!paragraph.trim()) { y+=10; if(y>bottom)nextPage();continue; }
    line(paragraph);
    y+=5;
  }
  // The reading file excludes commercial Lulu cover/bleed/package preparation.
  return {blob:doc.output("blob"),pages:page,filename:pdfFileName(m.title),manuscript:m,printReady:false};
}
export async function readImportedPdf(file, pdfjs) {
  if (!file || !/\.pdf$/i.test(file.name || "") || file.size < 50 || file.size > MAX_IMPORT_BYTES)
    throw Error("Choose a PDF no larger than 12 MB.");
  if (!pdfjs?.getDocument) throw Error("PDF reader unavailable. Check your connection.");
  const data=new Uint8Array(await file.arrayBuffer());
  if (String.fromCharCode(...data.slice(0,5)) !== "%PDF-") throw Error("This is not a valid PDF.");
  const task=pdfjs.getDocument({data,isEvalSupported:false});
  let pdf;
  try{
    pdf=await task.promise;
    if(pdf.numPages<1 || pdf.numPages>MAX_IMPORT_PAGES)throw Error("PDF must contain 1–120 pages.");
    const chunks=[];
    for(let i=1;i<=pdf.numPages;i++){
      const pg=await pdf.getPage(i);
      const content=await pg.getTextContent();
      const strings=(Array.isArray(content?.items)?content.items:[])
        .map(x=>typeof x?.str==="string"?x.str:"").filter(Boolean);
      chunks.push(strings.join(" "));
      if(chunks.join("\n\n").length>MAX_MANUSCRIPT_CHARS)
        throw Error("PDF text is too long for the draft editor.");
    }
    const text=chunks.join("\n\n").trim();
    if(text.length<20)throw Error("This PDF has no extractable text. Scanned or image-only PDFs can still be read in NBL Reader.");
    return {text,pages:pdf.numPages};
  } finally {
    if(pdf && typeof pdf.destroy==="function")await pdf.destroy();
  }
}
export async function giveToLocalReader(output, databaseFactory=globalThis.indexedDB) {
  if(!output?.blob || !(output.blob instanceof Blob))throw Error("Create a PDF before adding it to your library.");
  if(!databaseFactory)throw Error("Browser library unavailable. Download the PDF instead.");
  const filename=output.filename || "nbl-book-reading-draft.pdf";
  const file=new File([output.blob],filename,{type:"application/pdf",lastModified:Date.now()});
  const id=[file.name,file.size,file.lastModified].join("::");
  return await new Promise((resolve,reject)=>{
    const req=databaseFactory.open("nbl-reader-device-library-v1",1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      for(const name of ["books","files","positions"]){
        if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:"id"});
      }
    };
    req.onerror=()=>reject(Error("Device library unavailable. Download the PDF instead."));
    req.onblocked=()=>reject(Error("Close NBL Reader, then retry saving."));
    req.onsuccess=()=>{
      const db=req.result;
      const transaction=db.transaction(["books","files"],"readwrite");
      transaction.objectStore("books").put({id,name:file.name,type:"pdf",size:file.size,addedAt:Date.now()});
      transaction.objectStore("files").put({id,blob:file});
      transaction.oncomplete=()=>{db.close();resolve({id,filename});};
      transaction.onerror=()=>{db.close();reject(Error("Device library unavailable. Download the PDF instead."));};
      transaction.onabort=()=>{db.close();reject(Error("Device library unavailable. Download the PDF instead."));};
    };
  });
}
