/* Phone-first reading for the existing three-page Company Profile PDF.
   Keep the original PDF and desktop iframe intact. If PDF.js cannot load,
   the native iframe and direct/open/download links remain available. */
(() => {
  "use strict";
  if (!window.matchMedia("(max-width: 720px)").matches) return;

  const reader = document.getElementById("companyPdfReader");
  const canvas = document.getElementById("pdfCanvas");
  const status = document.getElementById("pdfPageStatus");
  const prev = document.getElementById("pdfPrev");
  const next = document.getElementById("pdfNext");
  if (!reader || !canvas || !status || !prev || !next) return;

  const PDF_URL = "/NBL_Company_Profile_Page2_World_Team_Updated.pdf";
  const LIBRARY_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  let currentPage = 1;
  let pdf = null;
  let rendering = false;

  const getLibrary = () => {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = LIBRARY_URL;
      script.async = true;
      script.onload = () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error("PDF reader unavailable"));
      script.onerror = () => reject(new Error("PDF reader unavailable"));
      document.head.appendChild(script);
    });
  };

  async function showPage(number) {
    if (!pdf || rendering || number < 1 || number > pdf.numPages) return;
    rendering = true;
    prev.disabled = true;
    next.disabled = true;
    try {
      const page = await pdf.getPage(number);
      const viewport = page.getViewport({ scale: 1 });
      const width = Math.max(240, reader.clientWidth - 26);
      const scale = width / viewport.width;
      const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const displayViewport = page.getViewport({ scale });
      canvas.width = Math.max(1, Math.ceil(displayViewport.width * pixelRatio));
      canvas.height = Math.max(1, Math.ceil(displayViewport.height * pixelRatio));
      canvas.style.width = Math.round(displayViewport.width) + "px";
      canvas.style.height = Math.round(displayViewport.height) + "px";
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      await page.render({
        canvasContext: context,
        viewport: page.getViewport({ scale: scale * pixelRatio })
      }).promise;
      currentPage = number;
      status.textContent = "Page " + number + " of " + pdf.numPages;
      canvas.setAttribute("aria-label", "New Beansland company profile, page " + number + " of " + pdf.numPages);
      reader.classList.add("pdf-ready");
    } catch {
      status.textContent = "Reader unavailable. Open the complete PDF below.";
      if (!reader.classList.contains("pdf-ready")) {
        // Mobile native PDF and fallback links remain visible.
      }
    } finally {
      rendering = false;
      prev.disabled = currentPage <= 1;
      next.disabled = !pdf || currentPage >= pdf.numPages;
    }
  }

  prev.addEventListener("click", () => { void showPage(currentPage - 1); });
  next.addEventListener("click", () => { void showPage(currentPage + 1); });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!rendering) void showPage(currentPage); }, 160);
  });

  void (async () => {
    try {
      const pdfjsLib = await getLibrary();
      pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
      pdf = await pdfjsLib.getDocument(PDF_URL).promise;
      await showPage(1);
    } catch {
      // Preserve native iframe + working download/open links.
    }
  })();
})();
