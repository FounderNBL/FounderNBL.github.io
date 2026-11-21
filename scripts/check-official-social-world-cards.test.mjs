// Exact Founder-uploaded Pulse and Messenger artwork, not placeholders.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const door=html.split('<section class="pulse-world-door"')[1]?.split("</section>")[0]||"";
const cases=[
 {label:"Pulse",href:"/pulse/",img:"/NBL_Pulse_Worldcard.png",
  file:"NBL_Pulse_Worldcard.png",gitBlobSha1:"31803af57c53a84bdbdf60d3494e16bb4bb0ffbb",sizeBytes:2143645},
 {label:"Messenger",href:"/messenger/",img:"/NBL_Messenger_Worldcard.png",
  file:"NBL_Messenger_Worldcard.png",
  gitBlobSha1:"89a9e27d8a0004462349af7614178710c50e3b90",sizeBytes:2074930,
  width:1672,height:941}
];
test("Pulse sole active Social card; both approved artworks preserved",()=>{
 assert.ok(door,"social World-card section is present");
 const c=cases[0];
 assert.ok(door.includes('href="'+c.href+'"'));
 assert.ok(door.includes('src="'+c.img+'"'));
 assert.doesNotMatch(door,/href="\/messenger\/"|src="\/NBL_Messenger_Worldcard.png"/);
 assert.ok(!door.includes("pulse-world.svg"),"Pulse placeholder must not remain");
 assert.ok(!door.includes("messenger/icon.svg"),"Messenger placeholder must not remain on World card");
 assert.ok(!door.includes("NBL_Messenger_Beans_Worldcard.png"),"Messenger card must not use the retired Beans artwork");
 assert.match(html,/\.pulse-world-door \.social-door-grid \.world-card \.media img,[\s\S]*?object-fit:contain;object-position:center/,"keep entire card art uncropped");
});
for(const c of cases){
 test(c.label+" official PNG retains exact source Git blob or SHA-256 hash",()=>{
  const bytes=readFileSync(new URL("../"+c.file,import.meta.url));
  assert.equal(bytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.ok(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0);
  if(c.width)assert.equal(bytes.readUInt32BE(16),c.width);
  if(c.height)assert.equal(bytes.readUInt32BE(20),c.height);
  if(c.sizeBytes)assert.equal(bytes.length,c.sizeBytes);
  const digest=c.gitBlobSha1
    ?createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex")
    :createHash("sha256").update(bytes).digest("hex");
  assert.equal(digest,c.gitBlobSha1||c.hash);
 });
}
test("Pulse icon is used without replacing the New Beansland company identity",()=>{
 const pulse=readFileSync(new URL("../pulse/index.html",import.meta.url),"utf8");
 assert.match(pulse,/NBL%20Pulse_Icon\.png/);
 assert.match(pulse,/class="pulse-company-logo"[^>]*>[\s\S]*?nbl-official-mark\.png/);
});
