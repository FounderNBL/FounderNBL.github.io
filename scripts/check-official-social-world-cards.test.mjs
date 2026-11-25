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
test("Social World cards retain separate original art and destinations",()=>{
 assert.ok(door,"social World-card section is present");
 for(const c of cases){
  assert.ok(door.includes('href="'+c.href+'"'),c.label+" must retain its own route");
  assert.ok(door.includes('src="'+c.img+'"'),c.label+" must show the exact approved PNG");
 }
 assert.ok(!door.includes("pulse-world.svg"),"Pulse placeholder must not remain");
 assert.ok(!door.includes("messenger/icon.svg"),"Messenger placeholder must not remain on World card");
 assert.ok(!door.includes("NBL_Messenger_Beans_Worldcard.png"),"Messenger card must not use the retired Beans artwork");
 assert.match(door,/Brought to you by NBL Pulse/,"Messenger must credit NBL Pulse");
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
 assert.match(pulse,/class="pulse-brand"[^>]*>[\s\S]*?\/assets\/brand\/nbl-official-mark\.png/);
});

test("Homepage consistently names the existing private messaging door Pulse Connect",()=>{
 assert.match(door,/<h3>Pulse Connect™<\/h3>/);
 assert.match(door,/Open Pulse Connect →/);
 assert.match(html,/aria-label="Open Pulse Connect"/);
 assert.match(html,/href="\/messenger\/">Pulse Connect<\/a>/);
 assert.doesNotMatch(door,/<h3>NBL Messenger/);
});
