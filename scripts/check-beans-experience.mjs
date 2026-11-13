import fs from "node:fs";
import assert from "node:assert/strict";
import {inflateSync} from "node:zlib";
const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const host=read("nbl-world-header.js");
const ui=read("nbl-beans-experience.js");
const css=read("nbl-beans-experience.css");
const requireText=(s,needle)=>assert.ok(s.includes(needle),"Missing Beans experience contract: "+needle);
requireText(host,'src="/nbl-beans-experience.js?v=20261112-five-new-art"');
requireText(ui,"data-nbl-customize-open");
requireText(ui,"data-nbl-customize-tab");
requireText(ui,"data-nbl-customize-photo");
requireText(ui,"--nbl-beans-chat-color");
requireText(ui,"nbl.beans.appearance.v1.");
requireText(ui,"nbl.beans.local-image.v1.");
requireText(ui,"const allowedTypes=new Set");
requireText(ui,'["image/png","image/jpeg","image/webp","image/gif"]');
requireText(ui,"file.size>8*1024*1024");
for(const [key,file] of Object.entries({
 standard:"Beans_Hi_Basic.png",
 crossed:"Beans_Crossarmed.png",
 jersey:"Beans_Hi_Soccer.png",
 cargoWave:"Beans_Hi_Cargo.png",
 cargoPoint:"Beans_Peace_Sign.png"
})){
 requireText(ui,`${key}:Object.freeze({src:"/${file}"`);
 requireText(ui,`data-nbl-look="${key}"`);
 assert.ok(fs.existsSync(new URL("../"+file,import.meta.url)),"Missing official Beans asset: "+file);
}

function inspectTransparentCharacterPng(name){
 const png=fs.readFileSync(new URL("../"+name,import.meta.url));
 assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a",name+" must be a PNG");
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 assert.equal(png[24],8,name+" must use 8-bit channels");
 assert.equal(png[25],6,name+" must be RGBA so customer backgrounds remain independently visible");
 const segments=[];let pos=8;
 while(pos<png.length){
  const len=png.readUInt32BE(pos),type=png.toString("ascii",pos+4,pos+8);
  if(type==="IDAT")segments.push(png.subarray(pos+8,pos+8+len));
  pos+=12+len;
  if(type==="IEND")break;
 }
 assert.ok(segments.length>0,name+" missing PNG image data");
 const raw=inflateSync(Buffer.concat(segments));
 const stride=width*4;let offset=0,prior=Buffer.alloc(stride);
 let transparent=0,visible=0;
 for(let y=0;y<height;y++){
  const filter=raw[offset++],scan=Buffer.from(raw.subarray(offset,offset+stride));offset+=stride;
  assert.ok(filter>=0&&filter<=4,name+" unsupported PNG filter");
  for(let x=0;x<stride;x++){
   const left=x>=4?scan[x-4]:0,up=prior[x],upperLeft=x>=4?prior[x-4]:0;
   let predictor=0;
   if(filter===1)predictor=left;
   else if(filter===2)predictor=up;
   else if(filter===3)predictor=Math.floor((left+up)/2);
   else if(filter===4){
    const p=left+up-upperLeft;
    const a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-upperLeft);
    predictor=a<=b&&a<=c?left:b<=c?up:upperLeft;
   }
   scan[x]=(scan[x]+predictor)&255;
  }
  for(let x=3;x<stride;x+=4){
   if(scan[x]===0)transparent++;
   if(scan[x]>0)visible++;
  }
  prior=scan;
 }
 assert.ok(transparent>width*height*.05,name+" has no usable transparent surroundings for a customer background");
 assert.ok(visible>width*height*.05,name+" has no usable visible Beans character");
}

for(const name of [
 "Beans_Hi_Basic.png","Beans_Crossarmed.png",
 "Beans_Hi_Soccer.png","Beans_Hi_Cargo.png",
 "Beans_Peace_Sign.png"
]) inspectTransparentCharacterPng(name);
requireText(ui,"3. Premium wardrobe");
requireText(ui,"data-nbl-premium-outfits disabled aria-disabled");
assert.ok(!ui.includes("/Beans.png")&&!ui.includes("/NBLChat_Beans.png"),"Retired small Beans artwork is active.");
requireText(ui,"const preset={look:\"standard\"");
requireText(ui,"slots=[\"chat\",\"sidebar\",\"greeting\"]");
requireText(ui,"Your photos and colors. Only NBL-approved character clothing.");
requireText(ui,'<a href="/stories.html">The City · preview</a>');
requireText(ui,'drawerScroll.insertBefore(explore,history)');
requireText(ui,"input.dispatchEvent(new Event");
requireText(css,"@media(min-width:1200px)");
requireText(css,"@media(max-width:1199px)");
requireText(css,"@media(max-width:600px)");
requireText(css,"--nbl-beans-custom-greeting");
requireText(css,"--nbl-beans-custom-sidebar");
requireText(css,"--nbl-beans-custom-chat");
// Pinned conversations remain real saved chats, not links to other NBL products.
assert.ok(!ui.includes("data-nbl-beans-pinned-world"),"Worlds are not pinned chats.");
assert.ok(!ui.includes("Stripe"),"Wardrobe is not authorized to create payments.");
assert.ok(!ui.includes("fetch("),"Personalization must never send phone photos to a remote endpoint.");
assert.ok(!ui.includes("nblschool.com/professor-grey"),"Grey is not a Beans wardrobe or chat mode.");
console.log("Beans experience source checks passed (five free official looks, independent local backgrounds, locked future premium).");
