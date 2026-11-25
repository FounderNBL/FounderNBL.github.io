import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const home=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const page=readFileSync(new URL("../build-a-block.html",import.meta.url),"utf8");
const block=home.slice(home.indexOf('<section class="build-block-feature"'),home.indexOf('<section class="pulse-world-door"'));

test("homepage remains a large feature, not a seventh World Card",()=>{
  const cards=home.slice(home.indexOf('<div class="world-grid">'),home.indexOf('</div></section>',home.indexOf('<div class="world-grid">')));
  assert.equal((cards.match(/class="world-card official-art reveal"/g)||[]).length,6);
  assert.ok(!cards.includes("Build-A-Block"));
  assert.ok(block.includes('href="build-a-block.html#programs"'));
  assert.ok(block.includes('href="build-a-block.html#get-involved"'));
  assert.ok(!block.includes('mailto:'));
});

test("public interactions have content and no unverified checkout",()=>{
  assert.equal((page.match(/<details class="card program-card">/g)||[]).length,4);
  assert.equal((page.slice(page.indexOf('<div class="faq">'),page.indexOf('</div></div></section>',page.indexOf('<div class="faq">'))).match(/<details>/g)||[]).length,6);
  for(const id of ["mission","programs","pilot","questions","get-involved"])assert.ok(page.includes('id="'+id+'"'));
  assert.ok(page.includes('id="block-interest"'));
  assert.ok(page.includes('window.location.href=url'));
  assert.ok(page.includes('form.reportValidity()'));
  assert.ok(page.includes('website does not submit or store your request'));
  assert.doesNotMatch(page,/checkout\.stripe\.com|buy\.stripe\.com|id="accountability"|Donate Now|tax-deductible receipts available/i);
  assert.ok(page.includes("No money is collected on this page."));
});

test("registration is an honest email-preparation flow, not a backend claim",()=>{
  assert.ok(page.includes('name="consent" type="checkbox" required'));
  assert.ok(page.includes('name="email" type="email"'));
  assert.ok(page.includes('name="message" maxlength="800"'));
  assert.ok(page.includes('mailto:founder@newbeansland.org?subject='));
  assert.ok(!page.includes('fetch('));
  assert.match(page,/For youth participation, a parent or guardian should make the first inquiry/);
});

test("Founder-uploaded illustration is used and its clickable image is not cropped",()=>{
 const asset="/file_00000000474481f5986763efd34915a7.png";
 assert.match(home,/class="build-block-visual" href="build-a-block\.html#programs"/);
 assert.ok(block.includes('src="'+asset+'"'));
 assert.ok(page.includes('src="'+asset+'"'));
 assert.match(home,/\.build-block-visual img\{width:100%;height:auto;display:block;object-fit:contain\}/);
 assert.ok(!block.includes('<svg '));
 assert.match(page,/Concept illustration of the community vision/);
});

test("Freddie profile has sourced public background, portrait and independence",()=>{
 const profile=readFileSync(new URL("../freddie-pickens.html",import.meta.url),"utf8");
 assert.ok(page.includes('href="/freddie-pickens.html"'));
 assert.ok(profile.includes("<h1>Freddie<br>Pickens</h1>"));
 assert.ok(profile.includes("Originator &amp; Community Program Lead"));
 assert.ok(profile.includes("Opening Minds and Hearts Inc"));
 assert.ok(profile.includes('designation <strong>“Other”</strong>'));
 assert.ok(profile.includes("OMAH is not being presented as an NBL program, sponsor, or partner"));
 assert.ok(profile.includes("https://www.bizprofile.net/ca/oakland/opening-minds-and-hearts"));
 assert.ok(profile.includes("https://www.omah.org/ongoing-explorations/new-york"));
 const photo=profile.match(/src="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/)?.[1];
 assert.ok(photo&&photo.length===5244);
 const bytes=Buffer.from(photo,"base64");
 assert.equal(bytes.subarray(0,4).toString(),"RIFF");
 assert.equal(bytes.subarray(8,12).toString(),"WEBP");
 assert.doesNotMatch(profile,/375 Putnam|42 Villanova|Donate Now|checkout\.stripe\.com/);
});
