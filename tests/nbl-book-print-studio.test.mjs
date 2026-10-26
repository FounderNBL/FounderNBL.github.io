import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NBL_PRINT_PACKAGES,selectPrintPackage,draftCoverDimensions,checkPrintFiles,
  prepareBookPrintQuoteRequest,priceFromVerifiedQuote,luluStatusToBeans,
  renderPrintInterior,renderPrintCover} from "../nbl-book-print-core.mjs";

class FakePdf{
  constructor({unit,format}){this.unit=unit;this.format=format;this.pages=1;this.actions=[];}
  setProperties(props){this.props=props;}
  setFont(){} setFontSize(){} setFillColor(){} setTextColor(){} rect(){} addImage(){}
  splitTextToSize(s){return String(s).match(/.{1,46}/g)||[""];}
  text(t,x,y){this.actions.push([t,x,y]);} addPage(){this.pages++;}
  output(mode){assert.equal(mode,"blob");return {type:"application/pdf",size:250};}
}
const sample={title:"NBL Print Test",author:"Test Author",text:"A book chapter for NBL with real words and ideas. ".repeat(110)};
test("Lulu official known 6x9 product candidates use migration-safe dotted identifiers",()=>{
  assert.equal(NBL_PRINT_PACKAGES.length,2);
  assert.ok(NBL_PRINT_PACKAGES.every(p=>/^[A-Z0-9]{9}\.[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{2}\.[A-Z0-9]{8}\.[A-Z0-9]{3}$/.test(p.pod_package_id)));
  assert.throws(()=>selectPrintPackage("fabricated"));
});
test("cover size and spine are a preliminary calculation and never Lulu approval",()=>{
  const result=draftCoverDimensions("bw_matte",120);
  assert.equal(result.heightIn,9.25);
  assert.ok(result.widthIn>12.25);
  assert.match(result.source,/NOT Lulu/);
  assert.throws(()=>draftCoverDimensions("bw_matte",-1));
});
test("renders separate interior and wraparound cover candidates",()=>{
  const interior=renderPrintInterior(sample,FakePdf,"bw_matte");
  const cover=renderPrintCover(sample,FakePdf,"bw_matte",interior.pages,{backText:"Read a story.",coverColor:"#1b4c6f"});
  assert.equal(interior.blob.type,"application/pdf");
  assert.equal(cover.blob.type,"application/pdf");
  assert.equal(cover.pages,1);
  assert.equal(cover.geometry.pageCount,interior.pages);
  assert.equal(interior.printReady,false);assert.equal(cover.printReady,false);
  const gate=checkPrintFiles({interior,cover,pageCount:interior.pages,packageId:"bw_matte"});
  assert.equal(gate.candidateReady,true);
  assert.equal(gate.luluValidated,false);
  assert.equal(gate.luluStatus,"NOT_SUBMITTED");
  assert.equal(checkPrintFiles({interior,pageCount:interior.pages,packageId:"bw_matte"}).candidateReady,false);
});
test("only actual verified quotes may show a customer estimate",()=>{
  assert.equal(priceFromVerifiedQuote({priceEstimate:{retailPriceUsd:4}}),null);
  const q=priceFromVerifiedQuote({ok:true,priceEstimate:{currency:"USD",retailPriceUsd:14.35,finalCheckoutAllowed:false},source:"Lulu"});
  assert.equal(q.amount,14.35);assert.equal(q.checkoutAllowed,false);
  const r=prepareBookPrintQuoteRequest({packageId:"bw_matte",pageCount:120,quantity:2,shippingAddress:{country_code:"US"}});
  assert.equal(r.action,"quote");assert.equal(r.line_items[0].quantity,2);
});
test("Lulu's result is translated without inventing an approval",()=>{
  assert.equal(luluStatusToBeans({status:"VALIDATING"}).state,"still_checking");
  assert.equal(luluStatusToBeans({status:"ERROR",errors:["fonts not embedded"]}).state,"needs_repair");
  assert.equal(luluStatusToBeans({status:"NORMALIZED"}).state,"passed_file_validation");
  assert.equal(luluStatusToBeans({}).state,"unverified");
});
test("website print UI is opt-in and does not include a print-job or checkout path",()=>{
  const html=readFileSync(new URL("../book-creator.html",import.meta.url),"utf8");
  const js=readFileSync(new URL("../nbl-book-print-studio.mjs",import.meta.url),"utf8");
  for(const field of ["print-prep","print-package","print-cover-image","print-build","print-ask-beans","download-cover","download-interior"])
    assert.match(html,new RegExp('id="'+field+'"'));
  assert.match(html,/Lulu validates/);
  assert.match(js,/renderPrintInterior\(/);assert.match(js,/renderPrintCover\(/);
  assert.doesNotMatch(js,/api\.lulu\.com|\/print-jobs\/|checkout\.sessions|Authorization:\s*"Bearer/);
  assert.match(js,/NOT validated/);
});
