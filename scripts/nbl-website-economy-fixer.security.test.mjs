import test from "node:test";
import assert from "node:assert/strict";
import {
 mkdtempSync,writeFileSync,readFileSync,chmodSync,statSync,
 symlinkSync,lstatSync,readdirSync,rmSync
} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {applyEdits} from "./nbl-website-economy-fixer.mjs";

const singleEdit={path:"index.html",find:"old",replace:"new"};

test("real approved repair stages privately, atomically replaces the source and preserves mode",()=>{
 const root=mkdtempSync(join(tmpdir(),"nbl-fixer-secure-"));
 try{
  const target=join(root,"index.html");
  writeFileSync(target,"old","utf8");
  chmodSync(target,0o644);
  const before=lstatSync(target);
  assert.deepEqual(applyEdits(root,[singleEdit]),["index.html"]);
  assert.equal(readFileSync(target,"utf8"),"new");
  assert.equal(statSync(target).mode&0o777,0o644);
  assert.notEqual(lstatSync(target).ino,before.ino);
  assert.deepEqual(readdirSync(root),["index.html"]);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test("approved path pointing to a symlink cannot overwrite the linked file",()=>{
 const root=mkdtempSync(join(tmpdir(),"nbl-fixer-link-"));
 const outside=mkdtempSync(join(tmpdir(),"nbl-fixer-victim-"));
 try{
  const victim=join(outside,"victim.html");
  writeFileSync(victim,"old","utf8");
  symlinkSync(victim,join(root,"index.html"));
  assert.throws(()=>applyEdits(root,[singleEdit]),/repair_target_not_regular_file/);
  assert.equal(readFileSync(victim,"utf8"),"old");
  assert.equal(lstatSync(join(root,"index.html")).isSymbolicLink(),true);
  assert.deepEqual(readdirSync(root),["index.html"]);
 }finally{
  rmSync(root,{recursive:true,force:true});
  rmSync(outside,{recursive:true,force:true});
 }
});

test("injected test-only writer keeps the existing edit contract",()=>{
 const writes=[];
 const result=applyEdits("/virtual-checkout",[singleEdit],{
  read:()=> "old",
  write:(file,text)=>writes.push({file,text})
 });
 assert.deepEqual(result,["index.html"]);
 assert.deepEqual(writes,[{file:"/virtual-checkout/index.html",text:"new"}]);
});
