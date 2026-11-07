import fs from "node:fs";
import assert from "node:assert/strict";
const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const host=read("nbl-world-header.js");
const ui=read("nbl-beans-experience.js");
const css=read("nbl-beans-experience.css");
const requireText=(s,needle)=>assert.ok(s.includes(needle),"Missing Beans experience contract: "+needle);
requireText(host,'src="/nbl-beans-experience.js?v=20261107-five-free"');
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
 standard:"beans_01_wave_nbl.png",
 crossed:"beans_02_arms_crossed_messenger.png",
 jersey:"beans_03_jersey_wave.png",
 cargoWave:"beans_04_cargo_wave_messenger.png",
 cargoPoint:"beans_05_cargo_point_messenger.png"
})){
 requireText(ui,`${key}:Object.freeze({src:"/${file}"`);
 requireText(ui,`data-nbl-look="${key}"`);
 assert.ok(fs.existsSync(new URL("../"+file,import.meta.url)),"Missing official Beans asset: "+file);
}
requireText(ui,"3. Premium wardrobe");
requireText(ui,"data-nbl-premium-outfits disabled aria-disabled");
assert.ok(!ui.includes("/Beans.png")&&!ui.includes("/NBLChat_Beans.png"),"Retired small Beans artwork is active.");
requireText(ui,"const preset={look:\"standard\"");
requireText(ui,"slots=[\"chat\",\"sidebar\",\"greeting\"]");
requireText(ui,"Your photos and colors. Only NBL-approved character clothing.");
requireText(ui,'<a href="/stories.html">The City · preview</a>');
requireText(ui,'drawerScroll.insertBefore(explore,history)');
requireText(ui,"input.dispatchEvent(new Event");
requireText(css,"@media(min-width:960px)");
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
