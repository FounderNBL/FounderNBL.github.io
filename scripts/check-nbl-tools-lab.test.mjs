import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const lab=fs.readFileSync(path.join(root,'tools-lab.html'),'utf8');
const studios=fs.readFileSync(path.join(root,'studios.html'),'utf8');
const script=lab.match(/<script>([\s\S]*?)<\/script>/)?.[1]||'';

test('lab script parses without dependencies or external AI services',()=>{
 assert.ok(script.length>5000,'inline script should exist');
 assert.doesNotThrow(()=>new vm.Script(script,{filename:'tools-lab-inline.js'}));
 assert.doesNotMatch(lab,/<script[^>]+src=/i,'no remote scripts');
 assert.doesNotMatch(script,/\b(?:api\.openai\.com|api\.runwayml\.com|api\.elevenlabs\.io)\b/i);
});

test('Every programmatic ID lookup has one matching HTML element',()=>{
 const ids=[...lab.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'no duplicate HTML IDs');
 for(const match of script.matchAll(/\$\('([^']+)'\)/g))
  assert.ok(ids.includes(match[1]),'missing control '+match[1]);
});

test('NBL artwork importer stays same-origin and user-initiated',()=>{
 assert.match(script,/\$\('load-nbl-art'\)\.addEventListener\('click'/);
 assert.match(script,/url\.origin!==location\.origin/);
 assert.match(script,/credentials:'same-origin'/);
 for(const file of ['NBL_Studios.png','NBL_University.png','NBL_Books.png','NBL_Games.png',
  'NBL_Pulse_World_Card.png','NBL_Messenger_Beans_Worldcard.png'])
  assert.ok(script.includes('/'+file),'missing official artwork '+file);
});

test('NBL graphic composer and project exports are implemented',()=>{
 for(const id of ['nbl-compose','nbl-preset','nbl-fit','nbl-title','nbl-subtitle','nbl-compose-download',
 'nbl-export-manifest','nbl-manifest-download','cat-export'])
  assert.ok(lab.includes('id="'+id+'"'),id);
 assert.match(script,/blobFromCanvas\(cv,'image\/png'\)/);
 assert.match(script,/application\/json/);
 assert.match(script,/currentFile/);
});

test('Studios links to the lab but preserves paid video creator',()=>{
 assert.match(studios,/href="\/tools-lab\.html"/);
 assert.match(studios,/href="\/studio\/creator\.html"/);
 assert.match(lab,/No paid APIs, checkout, or AI model/);
});
