import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prepareManuscript,pdfFileName,exportReadingDraft,readImportedPdf,MAX_IMPORT_BYTES} from "../nbl-book-creator-core.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("customer can write a book without orders or account information",()=>{
  const manuscript=prepareManuscript({title:"First NBL book",author:"Guest Author",text:"This is a real beginning to a personal NBL book."});
  assert.equal(manuscript.title,"First NBL book");
  assert.equal(pdfFileName("../Hello? World"),"Hello-World-reading-draft.pdf");
  assert.throws(()=>prepareManuscript({title:"A",author:"B",text:"short"}));
  assert.throws(()=>prepareManuscript({title:"Long",author:"NBL",text:"x".repeat(180001)}),/too long/);
});

class FakePdf {
  constructor(){this.pages=1;this.writes=[];}
  setProperties(properties){this.props=properties;}
  setFont(){}
  setFontSize(){}
  splitTextToSize(text){return String(text).match(/.{1,50}/g)||[""];}
  text(v,x,y){this.writes.push([v,x,y]);}
  addPage(){this.pages++;}
  output(fmt){assert.equal(fmt,"blob");return new Blob(["%PDF-1.7\ndraft\n"],{type:"application/pdf"});}
}

test("PDF giver paginates long manuscript and returns a downloadable reading-only PDF",()=>{
  let many=("The NBL story continues with our characters, words, and questions. ").repeat(700);
  const out=exportReadingDraft({title:"Our First Story",author:"Reader",text:many},FakePdf);
  assert.ok(out.blob instanceof Blob);
  assert.equal(out.blob.type,"application/pdf");
  assert.ok(out.pages>1);
  assert.equal(out.filename,"Our-First-Story-reading-draft.pdf");
  assert.equal(out.printReady,false);
});

test("PDF reader extracts local text and rejects scans, oversize files or spoofed PDF",async()=>{
  let destroyed=0;
  const pdfjs={getDocument:({data,isEvalSupported})=>{
    assert.equal(isEvalSupported,false);
    assert.equal(String.fromCharCode(...data.slice(0,5)),"%PDF-");
    return {promise:Promise.resolve({
      numPages:2,
      getPage:async p=>({getTextContent:async()=>({items:[{str:"Page "+p+" has a story we own."}]})}),
      destroy:async()=>{destroyed++;}
    })};
  }};
  const file={name:"source.pdf",size:100,arrayBuffer:async()=>new TextEncoder().encode("%PDF-1.5\nexample").buffer};
  const result=await readImportedPdf(file,pdfjs);
  assert.equal(result.pages,2);
  assert.match(result.text,/Page 2 has a story/);
  assert.equal(destroyed,1);
  await assert.rejects(()=>readImportedPdf({...file,name:"fake.pdf",arrayBuffer:async()=>new TextEncoder().encode("NOT-A-PDF").buffer},pdfjs),/valid PDF/);
  await assert.rejects(()=>readImportedPdf({...file,size:MAX_IMPORT_BYTES+1},pdfjs),/12 MB/);
  const scans={getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>({getTextContent:async()=>({items:[]})}),destroy:async()=>{}})})};
  await assert.rejects(()=>readImportedPdf(file,scans),/no extractable text/);
});

test("Reader and giver share the exact indexedDB schema and use private, local files",()=>{
  const reader=read("nbl-reader.js");
  const creator=read("nbl-book-creator-core.mjs");
  const client=read("nbl-book-creator.js");
  const page=read("book-creator.html");
  const store=reader.match(/const DB_NAME = "([^"]+)"/)?.[1];
  assert.equal(store,"nbl-reader-device-library-v1");
  assert.match(creator,/open\("nbl-reader-device-library-v1",1\)/);
  for(const key of ["books","files","positions"])assert.ok(reader.includes('createObjectStore("'+key+'"')&&creator.includes('"'+key+'"'));
  assert.match(client,/giveToLocalReader\(output\)/);
  assert.match(client,/URL\.createObjectURL\(output\.blob\)/);
  assert.match(client,/readImportedPdf\(file,pdfjs\)/);
  assert.match(page,/id="import-file"/);
  assert.match(page,/id="download-pdf"/);
  assert.match(page,/id="give-to-reader"/);
  assert.match(page,/Lulu orders held/);
  assert.doesNotMatch(client,/print-jobs\/|checkout\.sessions|api\.lulu\.com|stripe/i);
});

test("bookstore has live, no-charge draft door with custom printing held",()=>{
  const books=read("books.html"),reader=read("reader.html");
  assert.match(books,/href="\/book-creator\.html"/);
  assert.match(books,/Not yet accepting custom-book orders/);
  assert.match(reader,/href="\/book-creator\.html"/);
});

test("approved Lulu Direct showcase is rendered once with its only loader script",()=>{
  const books=read("books.html");
  const id="7cc013d3-dd8e-469d-8c75-fc11b81c7584";
  const widgets=[...books.matchAll(/<lulu-buy-button\\b[^>]*>/g)];
  assert.equal(widgets.length,1,"NBL Books should not show duplicate Lulu checkouts");
  assert.match(widgets[0][0],new RegExp('buy-button-id="'+id+'"'));
  assert.match(widgets[0][0],/variant="product-showcase"/);
  assert.equal((books.match(/https:\/\/js\\.lulu\\.com\/lulu-buy\\.js/g)||[]).length,1,
    "Load official Lulu checkout JS only once");
  assert.match(books,/max-width:720px/);
});
