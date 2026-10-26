import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {audiobookChapters,narrationTotals,allowedAudioFile,ebookCreditDisclosure} from "../nbl-audiobook-core.mjs";
const manuscript={title:"A New Beansland Story",author:"NBL Author",text:"Prologue\nThe long road began here.\nChapter 1: Arrival\n"+("An original sentence with a full stop. ".repeat(440))+"\nChapter 2: Home\nReturn to the porch."};
test("audiobook chapters are original full-length segments without provider calls",()=>{
 const result=audiobookChapters(manuscript);
 assert.equal(result.chapters.length,3);
 assert.equal(result.narrationStatus,"NOT_GENERATED");
 assert.equal(result.paidProviderCalled,false);
 assert.match(result.fileName,/nbl-audiobook-narration-plan\.json/);
 const totals=narrationTotals(result);
 assert.ok(totals.chunks>=4);
 assert.equal(totals.chapters,3);
 const fromText=result.chapters.map(x=>x.text).join("\n");
 assert.match(fromText,/Return to the porch/);
});
test("long unheaded work is a single audiobook with split narration chunks",()=>{
 const text="An NBL story uses chapters and narration. ".repeat(200);
 const result=audiobookChapters({title:"Long Story",author:"NBL",text},{chunkLimit:450});
 assert.equal(result.chapters.length,1);
 assert.equal(result.chapters[0].title,"Full reading");
 assert.ok(result.chapters[0].chunks.every(c=>c.charCount<=450));
});
test("reject invalid or oversized chapter projects",()=>{
 const text=Array.from({length:61},(_,i)=>"Chapter "+(i+1)+"\nA meaningful chapter starts here.").join("\n");
 assert.throws(()=>audiobookChapters({title:"Many Chapters",author:"NBL",text}),/too many chapters/i);
 assert.throws(()=>audiobookChapters({title:"",author:"NBL",text:"Some original story words."}),/title/i);
});
test("audio-file intake restricts type and size",()=>{
 assert.equal(allowedAudioFile({type:"audio/mpeg",size:15000}).ok,true);
 assert.equal(allowedAudioFile({type:"text/html",size:15000}).ok,false);
 assert.equal(allowedAudioFile({type:"audio/mpeg",size:151*1024*1024}).ok,false);
});
test("ebooks cannot be priced or deducted from guessed credits",()=>{
 const unknown=ebookCreditDisclosure({title:"An NBL eBook"});
 assert.equal(unknown.canRedeem,false);assert.equal(unknown.cost,null);
 const quote=ebookCreditDisclosure({title:"An NBL eBook",creditCost:3,balance:9});
 assert.equal(quote.remaining,6);
 assert.equal(quote.needsConfirm,true);
 assert.match(quote.copy,/No additional cash checkout/);
 const short=ebookCreditDisclosure({title:"An NBL eBook",creditCost:4,balance:2});
 assert.equal(short.canRedeem,false);
 assert.equal(ebookCreditDisclosure({title:"An NBL eBook",entitled:true}).cost,0);
});
test("new audiobook UI includes local player and truthful credit disclosure",()=>{
 const html=readFileSync(new URL("../book-creator.html",import.meta.url),"utf8");
 const js=readFileSync(new URL("../nbl-audiobook-studio.mjs",import.meta.url),"utf8");
 for(const id of ["audiobook-studio","audio-build","audio-chapter","audio-upload","audio-track-player","audio-save-plan","ebook-credit-policy","ebook-credit-status"])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/src="\/nbl-audiobook-studio\.mjs"/);
 assert.match(html,/not enabled for customers yet/);
 assert.match(js,/URL\.createObjectURL\(file\)/);
 assert.doesNotMatch(js,/ELEVENLABS_API_KEY|OPENAI_API_KEY|checkout\.sessions|nbl_studios_reserve|api\.elevenlabs\.io/);
});
