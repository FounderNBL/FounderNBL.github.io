// Founder-approved Pulse / Messenger artwork: exact original bytes, not placeholders.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const door=html.split('<section class="pulse-world-door"')[1]?.split("</section>")[0]||"";
const cases=[
 {label:"Pulse",href:"/pulse/",img:"/NBL_Pulse_World_Card.png",
  file:"NBL_Pulse_World_Card.png",
  hash:"7f0833f25852a2839cdbbdbdfeb3a26481acb3c674e9cb32d62079bb8af7b6e1",
  width:1672,height:941},
 {label:"Messenger",href:"/messenger/",img:"/NBL_Messenger_Beans_Worldcard.png",
  file:"NBL_Messenger_Beans_Worldcard.png",
  hash:"0c6041b211aa0b1f4d32db4108a0ad440f9ea069d51ccfba7609d8a6fab1fdd7",
  width:1254,height:1254}
];
test("The two social World cards use separate original art and unchanged destinations",()=>{
 assert.ok(door,"social World-card section is present");
 for(const c of cases){
  assert.ok(door.includes('href="'+c.href+'"'),c.label+" must retain its own route");
  assert.ok(door.includes('src="'+c.img+'"'),c.label+" must show the exact approved PNG");
 }
 assert.ok(!door.includes("pulse-world.svg"),"Pulse placeholder must not remain");
 assert.ok(!door.includes("messenger/icon.svg"),"Messenger placeholder must not remain on World card");
 assert.match(html,/\.pulse-world-door \.social-door-grid \.world-card \.media img,[\s\S]*?object-fit:contain;object-position:center/,
  "full approved World-card art must remain uncropped");
});
for(const c of cases){
 test(c.label+" official PNG preserves exact source hash and dimensions",()=>{
  const bytes=readFileSync(new URL("../"+c.file,import.meta.url));
  assert.equal(bytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.equal(bytes.readUInt32BE(16),c.width);
  assert.equal(bytes.readUInt32BE(20),c.height);
  assert.equal(createHash("sha256").update(bytes).digest("hex"),c.hash);
 });
}
