import fs from "node:fs";
import assert from "node:assert/strict";
const read=p=>fs.readFileSync(p,"utf8");
const source=read("nbl-infinity-sound.js");
const header=read("nbl-world-header.js");
const people=read("chat.js");
const member=read("member-chat.js");
for(const path of ["assets/sounds/nbl-infinity.mp3","assets/sounds/nbl-infinity.ogg","assets/sounds/nbl-infinity.wav"]){
 assert.ok(fs.statSync(path).size>1000,"NBL Infinity audio is not on the website: "+path);
}
assert.ok(fs.readFileSync("assets/sounds/nbl-infinity.ogg").subarray(0,4).equals(Buffer.from("OggS")),"OGG is malformed");
assert.equal(fs.readFileSync("assets/sounds/nbl-infinity.wav").toString("ascii",0,4),"RIFF");
assert.equal(fs.readFileSync("assets/sounds/nbl-infinity.mp3").toString("ascii",0,3),"ID3");
assert.ok(source.includes('const PATH="/assets/sounds/nbl-infinity.mp3"'));
for(const kind of ["beans","people","university"])assert.ok(source.includes('"'+kind+'"'));
assert.ok(header.includes('window.NBLInfinitySound?.play("beans")'));
assert.ok(header.includes('window.NBLInfinitySound?.play("university")'));
for(const [name,app] of [["chat.js",people],["member-chat.js",member]]){
 assert.ok(app.includes('rememberIncoming(id,payload.messages||[],{announce:true})'),"no incoming guard in "+name);
 assert.ok(app.includes('!state.selected?.muted'),"muted human conversations sound in "+name);
 assert.ok(app.includes('!item.deleted'),"deleted messages may ring in "+name);
 assert.ok(app.includes('window.NBLInfinitySound?.play("people")'),"missing human sound in "+name);
}
for(const path of ["chat.html","member-chat.html"]){
 const html=read(path);
 assert.ok(html.includes("nbl-infinity-sound.js"),"no sound script in "+path);
 assert.ok(html.includes("data-nbl-infinity-preview"),"no sound user-gesture preview in "+path);
}
console.log("[website-infinity] PASS: verified three original media formats and Beans/Messenger/University real-reply sound paths.");
