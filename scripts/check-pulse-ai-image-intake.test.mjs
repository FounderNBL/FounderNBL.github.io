import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../pulse/ai-image-intake.mjs",import.meta.url),"utf8");
const html=readFileSync(new URL("../pulse/index.html",import.meta.url),"utf8");
const social=readFileSync(new URL("../messenger/social-v1.mjs",import.meta.url),"utf8");
test("AI image staging uses the real Pulse post form and preserves the Stream upload",()=>{
  for(const id of ["pulsePasteAiImage","pulseAiImagePreview","pulseAiImageHelp","pulseAiRemoveMedia","pulseAiDropTarget"])
    assert.ok(html.includes('id="'+id+'"'),"Missing "+id);
  assert.match(html,/src="\/pulse\/ai-image-intake\.mjs\?v=20261123-image-clipboard-v1"/);
  assert.match(source,/input\.files=transfer\.files/);
  assert.match(source,/input\.dispatchEvent\(new Event\("change"/);
  assert.match(social,/state\.client\.uploadImage\(\{file\}\)/);
  assert.match(social,/feed\.addActivity\(\{type:"post"/);
  assert.doesNotMatch(source,/\.addActivity\(|\.uploadImage\(|fetch\(|requestSubmit\(|\.submit\(/,
    "Staging must not publish, charge for generation or upload an image without explicit post approval");
});
test("pasting one valid clipboard PNG attaches a local file and previews without publishing",async()=>{
  const nodes=new Map(),objUrls=[];
  function mock(name){
    const handlers=new Map();
    return {
      name,handlers,hidden:false,textContent:"",files:[],children:[],value:"",
      addEventListener(kind,handler){handlers.set(kind,handler);},
      dispatchEvent(event){handlers.get(event.type)?.(event);},
      replaceChildren(...items){this.children=items;},
      append(...items){this.children.push(...items);}
    };
  }
  for(const id of ["#postForm","#postMedia","#pulsePasteAiImage","#pulseAiImagePreview",
      "#pulseAiImageHelp","#pulseAiDropTarget","#pulseAiRemoveMedia","#pulseComposerExtra"])
    nodes.set(id,mock(id));
  class FakeFile{
    constructor(chunks,name,options){
      this.name=name;this.type=options.type;
      this.size=chunks.reduce((n,x)=>n+(x.size??x.byteLength??0),0);
    }
  }
  class FakeTransfer{
    constructor(){this._files=[];this.items={add:f=>this._files.push(f)};}
    get files(){return this._files;}
  }
  const mockGlobals={
    document:{
      querySelector:s=>nodes.get(s)||null,
      createElement:s=>Object.assign(mock(s),{tagName:s.toUpperCase()})
    },
    navigator:{clipboard:{read:async()=>[{types:["image/png"],getType:async()=>({size:120})}]}},
    URL:{createObjectURL:()=>{const u="blob:test-"+objUrls.length;objUrls.push(u);return u;},revokeObjectURL:()=>{}},
    DataTransfer:FakeTransfer,File:FakeFile,
    Event:class{constructor(type){this.type=type;}},
    window:{addEventListener:()=>{}},Date
  };
  for(const [name,value] of Object.entries(mockGlobals)){
    Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  }
  await import("../pulse/ai-image-intake.mjs"); // known local module, never evaluated from untrusted text
  const input=nodes.get("#postMedia"),preview=nodes.get("#pulseAiImagePreview");
  nodes.get("#pulsePasteAiImage").handlers.get("click")();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(input.files.length,1);
  assert.equal(input.files[0].type,"image/png");
  assert.equal(preview.hidden,false);
  assert.equal(preview.children.length,1);
  assert.equal(nodes.get("#pulseComposerExtra").hidden,false);
  assert.match(nodes.get("#pulseAiImageHelp").textContent,/Nothing has been published/);
  nodes.get("#pulseAiRemoveMedia").handlers.get("click")();
  assert.equal(input.value,""); // The browser clears files when a file input value is reset.
});
