import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const pricing=read("pricing.html");
const campus=read("campus.html");
const campusAlias=read("university-campus.html");
const university=read("university-enrollment.html");
const header=read("nbl-world-header.js");
const terms=read("terms.html");
const books=read("books.html");
const music=read("studio/catalog.js");
const musicPage=read("studio/index.html");
const reader=read("reader.html");

test("$29.99 Foundation Materials contains only 2 physical books and first month Beans; ebooks are separate",()=>{
 assert.match(pricing,/Two physical books plus the first month of Beans\. No ebooks, digital course materials, or University enrollment are included\./);
 assert.match(university,/Two physical books and one month of regular Beans\. No ebooks, coursework or University access are included\./);
 assert.match(header,/Two physical books and one month of Beans; no ebooks or University materials included/);
 assert.match(terms,/one-time with two physical books and one month of Beans; ebooks and University course access are not included/);
 assert.doesNotMatch(pricing,/Two physical books and digital course materials plus the first month of Beans/);
 assert.doesNotMatch(header,/Two books, course materials and one month of Beans/);
});

test("University course ebooks stay behind enrolled Grey while public tuition is separate",()=>{
 for(const content of [campus,campusAlias]){
  assert.match(content,/href="\/university-enrollment\.html#enroll"/);
  assert.match(content,/LOCKE opens the classroom only when that account has University enrollment/);
  assert.doesNotMatch(content,/class="enrollment-grid"/);
 }
 assert.match(university,/Foundation \+ University · \$34\.99 once — planned/);
 assert.match(university,/Two physical books and one month of regular Beans\. No ebooks, coursework or University access are included/);
 assert.match(university,/data-nbl-university-checkout="foundation" disabled/);
 assert.match(header,/University checkout verification pending/);
});

test("already-built NBL Music catalog and NBL Books digital Payhip/Reader remain independent",()=>{
 assert.match(musicPage,/<h1>NBL Music Productions<\/h1>/);
 assert.match(music,/purchaseUrl: ""/);
 assert.match(books,/Digital · Payhip/);
 assert.match(books,/NBL Reader™/);
 assert.match(books,/eBook \/ digital bundle → Payhip/);
 assert.match(reader,/EPUB \+ PDF/);
 assert.match(reader,/does not yet sync purchases, University entitlements, or other devices/);
});
