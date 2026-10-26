// NBL Books Print Studio — candidate files only. Lulu is final authority.
// No API keys, customer upload, checkout, remote file validation or print orders.
import {prepareManuscript} from "./nbl-book-creator-core.mjs";

export const NBL_PRINT_PACKAGES=Object.freeze([
  Object.freeze({id:"bw_matte",name:"6 × 9 Paperback · Black & white · Matte",pod_package_id:"0600X0900BWSTDPB060UW444MXX",trimWidth:6,trimHeight:9,pagesPerInch:444}),
  Object.freeze({id:"color_gloss",name:"6 × 9 Paperback · Full color · Gloss",pod_package_id:"0600X0900FCSTDPB080CW444GXX",trimWidth:6,trimHeight:9,pagesPerInch:444})
]);
const BLEED=0.125; // draft cover bleed in inches, not an official dimensions result
const RENDER_MARGIN=0.7; // keep text in a comfortable live area, including gutter
const n=val=>Number(val);
const round=v=>Number(v.toFixed(5));
export function selectPrintPackage(id){
  const pack=NBL_PRINT_PACKAGES.find(x=>x.id===id);
  if(!pack)throw Error("Choose one of the supported NBL print formats.");
  return pack;
}
export function draftCoverDimensions(packageId,pageCount){
  const pack=selectPrintPackage(packageId);
  if(!Number.isInteger(pageCount)||pageCount<2||pageCount>2000)throw Error("Lulu needs a valid final page count before cover sizing.");
  // Planning dimension ONLY. Verify exact width/height with Lulu Cover Dimensions API.
  const spineIn=pageCount/pack.pagesPerInch;
  return Object.freeze({widthIn:round(pack.trimWidth*2+spineIn+BLEED*2),
    heightIn:round(pack.trimHeight+BLEED*2),spineIn:round(spineIn),
    bleedIn:BLEED,pageCount,podPackageId:pack.pod_package_id,
    source:"NBL preliminary math; NOT Lulu cover dimensions approval"});
}
export function checkPrintFiles({interior,cover,pageCount,packageId}={}){
  const errors=[];
  try{selectPrintPackage(packageId);}catch(e){errors.push(e.message);}
  if(!Number.isInteger(pageCount)||pageCount<2)errors.push("Interior needs at least two pages for Lulu file review.");
  if(!interior?.blob||interior.blob.type!=="application/pdf")errors.push("Print interior PDF is missing.");
  if(!cover?.blob||cover.blob.type!=="application/pdf")errors.push("Full-wrap cover PDF is missing.");
  if(interior?.pages!==pageCount)errors.push("Interior page count changed; regenerate the matching cover.");
  return {candidateReady:errors.length===0,luluValidated:false,luluStatus:"NOT_SUBMITTED",errors,
    message:errors.length?errors.join(" "):"Your print candidates are prepared. Lulu has NOT checked the files; no print order or payment has occurred."};
}
export function prepareBookPrintQuoteRequest({packageId,pageCount,quantity=1,shippingAddress,shippingOption="MAIL"}={}){
  const pack=selectPrintPackage(packageId);
  if(!Number.isInteger(pageCount)||pageCount<2||pageCount>2000)throw Error("Finish pagination before requesting a print quote.");
  if(!Number.isInteger(quantity)||quantity<1||quantity>100)throw Error("Choose 1–100 copies.");
  if(!shippingAddress||typeof shippingAddress!=="object")throw Error("An actual shipping address is required for a Lulu quote.");
  return {action:"quote",line_items:[{pod_package_id:pack.pod_package_id,page_count:pageCount,quantity}],
    shipping_address:shippingAddress,shipping_option:shippingOption};
}
export function priceFromVerifiedQuote(quote){
  // Never present a guessed Lulu cost or NBL margin as a customer checkout amount.
  if(quote?.ok!==true||quote?.priceEstimate?.finalCheckoutAllowed!==false||
    !Number.isFinite(quote?.priceEstimate?.retailPriceUsd))return null;
  return {amount:quote.priceEstimate.retailPriceUsd,currency:quote.priceEstimate.currency,
    estimate:true,source:quote.source||"Lulu cost calculation",checkoutAllowed:false};
}
export function luluStatusToBeans(data={}){
  const status=String(data.status||"").toUpperCase();
  const details=Array.isArray(data.errors)?data.errors.filter(x=>typeof x==="string").slice(0,8):[];
  switch(status){
    case "VALIDATED":case "NORMALIZED":
      return {state:"passed_file_validation",message:"Lulu checked that file and says it passed. That isn't a print order yet.",problems:[]};
    case "VALIDATING":case "NORMALIZING":
      return {state:"still_checking",message:"Lulu is still checking the pages. No need to guess—let's use the result when it arrives.",problems:[]};
    case "ERROR":case "REJECTED":
      return {state:"needs_repair",message:details.length
        ?"Lulu found a problem: "+details.join("; ")+". Fix that before we offer printing."
        :"Lulu rejected this file. We need its detailed error before guessing at the fix.",problems:details};
    default:return {state:"unverified",message:"Lulu hasn't confirmed this file. Don't call it print-ready yet.",problems:[]};
  }
}
export function renderPrintInterior(manuscript,JsPdf,packageId){
  const m=prepareManuscript(manuscript),pack=selectPrintPackage(packageId);
  if(typeof JsPdf!=="function")throw Error("PDF export is not available in this browser.");
  const doc=new JsPdf({unit:"in",format:[pack.trimWidth,pack.trimHeight],compress:true});
  doc.setProperties({title:m.title,author:m.author,subject:"NBL print candidate — pending Lulu validation"});
  const left=RENDER_MARGIN, right=pack.trimWidth-RENDER_MARGIN, bottom=pack.trimHeight-RENDER_MARGIN;
  let pages=1,y=1.05;
  const newPage=()=>{doc.addPage();pages++;y=RENDER_MARGIN;};
  const text=(value,fontSize=10)=>{
    doc.setFont("helvetica","normal");doc.setFontSize(fontSize);
    // jsPDF text units use 'in' because document units are inches.
    const lines=doc.splitTextToSize(String(value),right-left);
    const step=(fontSize*1.55)/72;
    for(const line of lines){
      if(y+step>bottom)newPage();
      doc.text(line,left,y);y+=step;
    }
  };
  doc.setFont("helvetica","bold");doc.setFontSize(18);
  doc.text(m.title.slice(0,95),pack.trimWidth/2,y,{align:"center"});
  y+=0.55;
  doc.setFont("helvetica","normal");doc.setFontSize(12);
  doc.text("by "+m.author.slice(0,75),pack.trimWidth/2,y,{align:"center"});
  newPage();
  for(const paragraph of m.text.split(/\n/)){
    if(!paragraph.trim()){y+=0.11;if(y>bottom)newPage();continue;}
    text(paragraph);
    y+=0.10;
    if(y>bottom)newPage();
  }
  return {blob:doc.output("blob"),pages,filename:"nbl-interior-candidate.pdf",
    printReady:false,luluValidated:false,packageId,trimIn:[pack.trimWidth,pack.trimHeight]};
}
export function renderPrintCover(manuscript,JsPdf,packageId,pageCount,{backText="",coverColor="#0d3550",artworkDataUrl=""}={}){
  const m=prepareManuscript(manuscript),pack=selectPrintPackage(packageId);
  if(typeof JsPdf!=="function")throw Error("PDF cover maker unavailable.");
  const g=draftCoverDimensions(packageId,pageCount);
  const doc=new JsPdf({unit:"in",format:[g.widthIn,g.heightIn],orientation:"landscape",compress:true});
  doc.setProperties({title:m.title+" cover",author:m.author,subject:"NBL cover candidate — Lulu dimensions not verified"});
  const rgb=/^#[0-9a-f]{6}$/i.test(coverColor)?coverColor:"#0d3550";
  const [r,gg,b]=[1,3,5].map(i=>parseInt(rgb.slice(i,i+2),16));
  doc.setFillColor(r,gg,b);doc.rect(0,0,g.widthIn,g.heightIn,"F");
  const frontX=BLEED+pack.trimWidth+g.spineIn;
  if(artworkDataUrl&&/^data:image\/(png|jpe?g|webp);base64,/.test(artworkDataUrl)){
    // Picture is laid over the front panel. A production export must check
    // effective image DPI, crop, ICC profile and licensed rights.
    const format=artworkDataUrl.startsWith("data:image/png")?"PNG":"JPEG";
    doc.addImage(artworkDataUrl,format,frontX,BLEED,pack.trimWidth,pack.trimHeight);
    doc.setFillColor(0,0,0);doc.rect(frontX,BLEED,pack.trimWidth,1.8,"F");
  }
  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold");doc.setFontSize(21);
  const titleLines=doc.splitTextToSize(m.title,pack.trimWidth-1.5).slice(0,5);
  let y=BLEED+0.82;
  for(const line of titleLines){doc.text(line,frontX+pack.trimWidth/2,y,{align:"center"});y+=0.37;}
  doc.setFont("helvetica","normal");doc.setFontSize(13);
  doc.text(m.author.slice(0,72),frontX+pack.trimWidth/2,BLEED+pack.trimHeight-0.80,{align:"center"});
  doc.setFontSize(12);
  const description=String(backText||"").trim().slice(0,900);
  if(description){
    let backY=BLEED+0.85;const lines=doc.splitTextToSize(description,pack.trimWidth-1.6).slice(0,42);
    for(const line of lines){if(backY>BLEED+pack.trimHeight-1.25)break;doc.text(line,BLEED+0.75,backY);backY+=0.24;}
  }
  // Intentionally leave barcode and spine text off the preliminary cover until
  // barcode/ISBN entitlement, approved template and exact width are resolved.
  return {blob:doc.output("blob"),pages:1,filename:"nbl-cover-candidate.pdf",
    printReady:false,luluValidated:false,packageId,geometry:g};
}
