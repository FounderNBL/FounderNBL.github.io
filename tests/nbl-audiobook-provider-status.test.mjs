import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Public site no longer exposes backend voice provider status checks",()=>{
 const js=readFileSync(new URL("../nbl-audiobook-founder-lab.js",import.meta.url),"utf8");
 const page=readFileSync(new URL("../audiobook-founder-lab.html",import.meta.url),"utf8");
 assert.match(page,/This page is unavailable/);
 assert.doesNotMatch(page+js,/providersConfigured|founder_sample|audio-lab-consent|nbl-audiobook-lab|service credentials/);
});
