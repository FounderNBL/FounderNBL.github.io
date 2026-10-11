/* NBL Reader v1: local-only EPUB + PDF library.
 * No upload, purchase, unlock, NBL customer-data API, or entitlement workaround.
 * EPUB.js 0.3.93 (BSD-2), PDF.js 3.11.174 (Apache-2), JSZip 3.10.1 (MIT).
 */
(() => {
  "use strict";
  const MAX_BOOK_BYTES = 30 * 1024 * 1024; // protect low-storage Android devices
  const DB_NAME = "nbl-reader-device-library-v1";
  const DB_VERSION = 1;
  const $ = id => document.getElementById(id);
  const els = {
    file: $("book-file"), status: $("reader-status"), grid: $("library-grid"),
    empty: $("library-empty"), count: $("library-count"), shelf: $("library-section"),
    reader: $("reader-section"), title: $("current-book-title"), details: $("current-book-details"),
    viewport: $("book-viewport"), epub: $("epub-area"), pdf: $("pdf-area"),
    canvas: $("pdf-canvas"), page: $("page-label"), bottomPage: $("bottom-page-label"),
    font: $("font-size"), theme: $("reading-theme"),
    prev: [$("prev-page"), $("bottom-prev")],
    next: [$("next-page"), $("bottom-next")],
    bookmark: $("save-position"), close: $("close-reader")
  };
  if (!els.file || !els.grid || !els.reader) return;
  const memory = new Map();
  const memoryPositions = new Map();
  let db = null;
  let storagePersistent = true;
  let active = null;
  let sessionNumber = 0;
  let pdfRenderQueue = Promise.resolve();

  function status(message, kind = "info") {
    els.status.textContent = message;
    els.status.dataset.kind = kind;
  }
  function errorMessage(error, fallback) {
    console.warn("NBL Reader issue:", error?.name || "error");
    return fallback;
  }
  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) { reject(new Error("unsupported")); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains("books")) database.createObjectStore("books", {keyPath:"id"});
        if (!database.objectStoreNames.contains("files")) database.createObjectStore("files", {keyPath:"id"});
        if (!database.objectStoreNames.contains("positions")) database.createObjectStore("positions", {keyPath:"id"});
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("storage_unavailable"));
      req.onblocked = () => reject(new Error("storage_blocked"));
    });
  }
  function transact(storeNames, mode, callback) {
    return new Promise((resolve, reject) => {
      if (!db) { reject(new Error("no_database")); return; }
      let result;
      const tx = db.transaction(storeNames, mode);
      const operations = callback(tx);
      if (operations) {
        operations.onsuccess = () => { result = operations.result; };
      }
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || new Error("storage_error"));
      tx.onabort = () => reject(tx.error || new Error("storage_aborted"));
    });
  }
  async function libraryEntries() {
    if (!db) return [...memory.values()].map(v => v.meta);
    const stored=await transact(["books"], "readonly", tx => tx.objectStore("books").getAll());
    const merged=new Map(stored.map(entry=>[entry.id,entry]));
    for(const entry of memory.values())merged.set(entry.meta.id,entry.meta);
    return [...merged.values()];
  }
  async function getFile(id) {
    if (memory.has(id)) return memory.get(id).file;
    if (!db) return null;
    const data = await transact(["files"], "readonly", tx => tx.objectStore("files").get(id));
    return data?.blob || null;
  }
  async function getPosition(id) {
    if (memoryPositions.has(id))return memoryPositions.get(id);
    if (!db) return null;
    return await transact(["positions"], "readonly", tx => tx.objectStore("positions").get(id)) || null;
  }
  async function storeImported(meta, file) {
    if (!db) { memory.set(meta.id,{meta,file}); return; }
    await transact(["books","files"],"readwrite",tx=>{
      tx.objectStore("books").put(meta);
      tx.objectStore("files").put({id:meta.id,blob:file});
    });
  }
  async function storePosition(position) {
    if (!db) { memoryPositions.set(position.id,position); return; }
    await transact(["positions"],"readwrite",tx=>tx.objectStore("positions").put(position));
  }
  async function eraseBook(id) {
    memory.delete(id);memoryPositions.delete(id);
    if (!db) return;
    await transact(["books","files","positions"],"readwrite",tx=>{
      tx.objectStore("books").delete(id);
      tx.objectStore("files").delete(id);
      tx.objectStore("positions").delete(id);
    });
  }
  function actionButton(label, className, onClick) {
    const btn = document.createElement("button");
    btn.type="button"; btn.className=className; btn.textContent=label;
    btn.addEventListener("click", onClick);
    return btn;
  }
  function formatBytes(n) { return n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + " MB" : Math.ceil(n / 1024) + " KB"; }
  function readingLabel(entry,pos) {
    if (!pos) return "Not started";
    if (entry.type==="pdf") return `Last read: page ${pos.page || 1}`;
    return pos.cfi ? "Continue reading" : "Not started";
  }
  async function refreshLibrary() {
    const books = (await libraryEntries()).slice().sort((a,b) => b.addedAt-a.addedAt);
    els.grid.replaceChildren();
    els.count.textContent = books.length + (books.length===1 ? " book" : " books");
    els.empty.hidden = books.length > 0;
    for (const entry of books) {
      const pos = await getPosition(entry.id).catch(() => null);
      const card=document.createElement("article");card.className="nr-book";
      const cover=document.createElement("div");
      cover.className="nr-book-art"+(entry.type==="pdf"?" pdf":"");
      cover.textContent=entry.type==="pdf"?"▤":"📖";
      cover.setAttribute("aria-hidden","true");
      const name=document.createElement("h3");name.textContent=entry.name;
      const detail=document.createElement("p");
      detail.textContent=`${entry.type.toUpperCase()} · ${formatBytes(entry.size)} · ${readingLabel(entry,pos)}`;
      const actions=document.createElement("div");actions.className="nr-book-actions";
      actions.append(
        actionButton(pos ? "Continue" : "Read", "nr-btn nr-btn-gold", async () => {
          try { await openBook(entry); } catch (e) { status(errorMessage(e,"Couldn't open this book. Try importing it again."),"error"); }
        }),
        actionButton("Remove", "nr-btn nr-btn-remove", async () => {
          if (!window.confirm(`Remove "${entry.name}" from this device's NBL Reader library? This won't delete the original file.`)) return;
          try {
            if (active?.entry.id === entry.id) await closeReader();
            await eraseBook(entry.id);
            await refreshLibrary();
            status("Removed from this device's reading shelf.","success");
          } catch (e) { status(errorMessage(e,"Couldn't remove the book."),"error"); }
        })
      );
      card.append(cover,name,detail,actions);
      els.grid.append(card);
    }
  }
  function classify(file) {
    const name=(file.name||"").toLowerCase();
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".epub")) return "epub";
    return null;
  }
  async function validateFile(file,type) {
    if (!type) throw new Error("Only EPUB and PDF books are supported.");
    if (file.size > MAX_BOOK_BYTES) throw new Error("This book exceeds the 30 MB per-file device limit.");
    if (file.size < 100) throw new Error("This file is too small to be a valid book.");
    const header=new Uint8Array(await file.slice(0,8).arrayBuffer());
    const pdf=String.fromCharCode(...header.slice(0,5)) === "%PDF-";
    const zip=header[0]===0x50 && header[1]===0x4b;
    if ((type==="pdf"&&!pdf)||(type==="epub"&&!zip)) throw new Error("The file doesn't appear to contain a valid "+type.toUpperCase()+" book.");
  }
  async function importBook(file) {
    const type=classify(file);
    await validateFile(file,type);
    const id=[file.name,file.size,file.lastModified].join("::");
    const existing=(await libraryEntries()).find(x=>x.id===id);
    if (!existing) {
      const meta={id,name:file.name.slice(0,180),type,size:file.size,addedAt:Date.now()};
      try {await storeImported(meta,file);}
      catch(e) {
        // Still allow reading during a private browsing/storage quota failure.
        memory.set(id,{meta,file});
        storagePersistent=false;
        status("Device storage is unavailable or full. Book available this session only.","error");
      }
    } else if (!db && !memory.has(id)) {
      memory.set(id,{meta:existing,file});
    }
    await refreshLibrary();
    const meta=existing||{id,name:file.name.slice(0,180),type,size:file.size,addedAt:Date.now()};
    await openBook(meta, file);
    if(storagePersistent)status("Book added to your local NBL Library.","success");
    else status("Book open for this session only. Your browser could not save it to this device; keep your original file.","error");
  }
  function setReaderButtons() {
    const has=Boolean(active);
    const atStart=has && active.entry.type==="pdf" && active.page<=1;
    const atEnd=has && active.entry.type==="pdf" && active.page>=active.pdf?.numPages;
    for(const b of els.prev)b.disabled=!has||atStart;
    for(const b of els.next)b.disabled=!has||atEnd;
    els.bookmark.disabled=!has;
  }
  function updatePageLabel(message) {
    els.page.textContent=message;els.bottomPage.textContent=message;
  }
  function setTheme(theme) {
    const palette={
      paper:{background:"#fdf9f0",color:"#191919"},
      sepia:{background:"#eee0bd",color:"#3b3024"},
      night:{background:"#172231",color:"#e8e5dc"}
    };
    const chosen=palette[theme]||palette.paper;
    els.viewport.dataset.theme=palette[theme]?theme:"paper";
    if (active?.rendition) {
      // Disable all EPUB scripted content. Apply presentation styles only.
      active.rendition.themes.default({
        body:{background:chosen.background+" !important",color:chosen.color+" !important"},
        "a":{color:theme==="night"?"#eac77c":"#775420"}
      });
    }
  }
  async function rememberPosition(notify=false) {
    if(!active)return;
    const p={
      id:active.entry.id,
      page:active.page||1,
      cfi:active.cfi||"",
      font:active.font||100,
      theme:active.theme||"paper",
      updatedAt:Date.now()
    };
    try {
      await storePosition(p);
      if(notify)status(storagePersistent?"Bookmark saved to this device.":"Bookmark saved for this session.","success");
    }catch(e){
      memoryPositions.set(p.id,p);
      storagePersistent=false;
      if(notify)status("Device storage blocked; bookmark lasts only this session.","error");
    }
  }
  async function releaseCurrent() {
    sessionNumber++;
    const old=active;
    active=null;
    setReaderButtons();
    if(!old)return;
    try {
      if(old.rendition)old.rendition.destroy();
      if(old.epub)old.epub.destroy();
      if(old.pdf) await old.pdf.destroy();
    }catch{}
    els.epub.replaceChildren();
    els.canvas.width=0;els.canvas.height=0;
  }
  async function closeReader() {
    await rememberPosition();
    await releaseCurrent();
    els.reader.hidden=true;els.shelf.hidden=false;
    els.epub.hidden=true;els.pdf.hidden=true;
    await refreshLibrary();
    els.shelf.scrollIntoView({behavior:"smooth",block:"start"});
  }
  async function openBook(entry, temporaryFile) {
    await releaseCurrent();
    const file=temporaryFile||await getFile(entry.id);
    if(!file)throw new Error("Book file not stored. Please import it again.");
    const pos=await getPosition(entry.id).catch(()=>null);
    const state={
      entry,page:pos?.page||1,cfi:pos?.cfi||"",
      font:pos?.font||100,theme:pos?.theme||"paper",
      epub:null,rendition:null,pdf:null
    };
    active=state;
    const mySession=sessionNumber;
    els.reader.hidden=false;els.shelf.hidden=true;
    els.title.textContent=entry.name;
    els.details.textContent=`${entry.type.toUpperCase()} · ${formatBytes(entry.size)} · Saved on this device`;
    els.font.value=String(state.font);
    els.theme.value=state.theme;
    els.epub.hidden=entry.type!=="epub";
    els.pdf.hidden=entry.type!=="pdf";
    els.viewport.setAttribute("aria-busy","true");
    updatePageLabel("Opening book…");
    setTheme(state.theme);
    try {
      if(entry.type==="epub")await openEpub(file,state,mySession);
      else await openPdf(file,state,mySession);
      if(mySession!==sessionNumber)return;
      status("Book open. Use Previous / Next or the arrow keys to turn pages.","success");
      els.reader.scrollIntoView({behavior:"smooth",block:"start"});
      els.viewport.focus({preventScroll:true});
    }catch(err) {
      if(mySession===sessionNumber){await releaseCurrent();els.reader.hidden=true;els.shelf.hidden=false;}
      throw err;
    }finally {
      if(mySession===sessionNumber)els.viewport.setAttribute("aria-busy","false");
    }
  }
  async function openEpub(file,state,mySession) {
    if(typeof window.ePub!=="function")throw new Error("EPUB engine unavailable. Check your internet connection.");
    const source=await file.arrayBuffer();
    if(mySession!==sessionNumber)return;
    const book=window.ePub(source,{openAs:"epub"});
    state.epub=book;
    await book.ready;
    if(mySession!==sessionNumber)return;
    const rendition=book.renderTo(els.epub,{
      width:"100%",height:"100%",flow:"paginated",spread:"none",
      allowScriptedContent:false
    });
    state.rendition=rendition;
    rendition.on("relocated",location=>{
      if(active!==state)return;
      const cfi=location?.start?.cfi;
      if(typeof cfi==="string"&&cfi){state.cfi=cfi;void rememberPosition();}
      const displayed=location?.start?.displayed;
      updatePageLabel(displayed?.page && displayed?.total ? `Page ${displayed.page} of ${displayed.total} in section` : "EPUB · reading");
    });
    setTheme(state.theme);
    rendition.themes.fontSize(state.font+"%");
    try {await rendition.display(state.cfi||undefined);}
    catch(e){state.cfi="";await rendition.display();}
    setReaderButtons();
  }
  async function openPdf(file,state,mySession) {
    const pdfjs=window.pdfjsLib;
    if(!pdfjs?.getDocument)throw new Error("PDF engine unavailable. Check your internet connection.");
    pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const data=new Uint8Array(await file.arrayBuffer());
    if(mySession!==sessionNumber)return;
    const task=pdfjs.getDocument({data,isEvalSupported:false});
    const pdf=await task.promise;
    if(mySession!==sessionNumber){await pdf.destroy();return;}
    state.pdf=pdf;
    state.page=Math.max(1,Math.min(pdf.numPages,state.page));
    await renderPdf(state,mySession);
  }
  async function renderPdf(state,mySession) {
    pdfRenderQueue=pdfRenderQueue.catch(()=>{}).then(async()=>{
      if(active!==state||mySession!==sessionNumber||!state.pdf)return;
      els.viewport.setAttribute("aria-busy","true");
      const page=await state.pdf.getPage(state.page);
      if(active!==state||mySession!==sessionNumber)return;
      const base=page.getViewport({scale:1});
      const width=Math.max(280,els.viewport.clientWidth-28);
      const zoom=Math.max(.5,Math.min(1.5,Number(state.font)/100));
      const scale=Math.min(width/base.width,1.5)*zoom;
      const view=page.getViewport({scale});
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const canvas=els.canvas;
      const ctx=canvas.getContext("2d",{alpha:false});
      canvas.width=Math.floor(view.width*dpr);
      canvas.height=Math.floor(view.height*dpr);
      canvas.style.width=Math.floor(view.width)+"px";
      canvas.style.height=Math.floor(view.height)+"px";
      await page.render({canvasContext:ctx,viewport:view,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;
      if(active!==state||mySession!==sessionNumber)return;
      updatePageLabel(`Page ${state.page} of ${state.pdf.numPages}`);
      setReaderButtons();
      els.viewport.scrollTop=0;
      void rememberPosition();
    }).catch(e=>{
      if(active===state)status(errorMessage(e,"Unable to draw this PDF page."),"error");
    }).finally(()=>{
      if(active===state&&mySession===sessionNumber)els.viewport.setAttribute("aria-busy","false");
    });
    return pdfRenderQueue;
  }
  function turn(direction) {
    if(!active)return;
    const state=active;
    if(state.entry.type==="epub"){
      if(state.rendition) {
        const task=direction>0?state.rendition.next():state.rendition.prev();
        Promise.resolve(task).catch(()=>status("Couldn't turn the EPUB page.","error"));
      }
    }else if(state.pdf){
      const next=Math.max(1,Math.min(state.pdf.numPages,state.page+direction));
      if(next!==state.page){state.page=next;void renderPdf(state,sessionNumber);}
    }
  }
  for (const button of els.prev)button.addEventListener("click",()=>turn(-1));
  for (const button of els.next)button.addEventListener("click",()=>turn(1));
  els.close.addEventListener("click",()=>void closeReader());
  els.bookmark.addEventListener("click",()=>void rememberPosition(true));
  els.font.addEventListener("change",()=>{
    if(!active)return;
    const n=Number(els.font.value);
    active.font=n;
    if(active.rendition)active.rendition.themes.fontSize(n+"%");
    if(active.pdf)void renderPdf(active,sessionNumber);
    void rememberPosition();
  });
  els.theme.addEventListener("change",()=>{
    if(!active)return;
    active.theme=els.theme.value;
    setTheme(active.theme);
    void rememberPosition();
  });
  els.file.addEventListener("change",async()=>{
    const file=els.file.files?.[0];
    els.file.value="";
    if(!file)return;
    try {status("Importing book…");await importBook(file);}
    catch(e){status(e instanceof Error?e.message:"Unable to import this book.","error");}
  });
  document.addEventListener("keydown",event=>{
    if(els.reader.hidden||event.altKey||event.ctrlKey||event.metaKey)return;
    if(["INPUT","SELECT","TEXTAREA","BUTTON"].includes(event.target?.tagName))return;
    if(event.key==="ArrowRight"){event.preventDefault();turn(1);}
    if(event.key==="ArrowLeft"){event.preventDefault();turn(-1);}
  });
  window.addEventListener("resize",()=>{
    if(!active)return;
    if(active.rendition)active.rendition.resize();
    if(active.pdf)void renderPdf(active,sessionNumber);
  });
  async function start(){
    try {db=await openDatabase();}
    catch(e){
      storagePersistent=false;
      status("Private or restricted browser mode: books may be available for this session only.","error");
    }
    try {await refreshLibrary();}
    catch(e){status("Unable to open the local reading shelf. Try allowing browser storage.","error");}
    setReaderButtons();
  }
  void start();
})();
