import test from "node:test";
import assert from "node:assert/strict";
import {createNewBeatTracker,pulseHandle} from "../messenger/pulse-new-beat.mjs";

const now=Date.parse("2026-11-17T19:00:00Z");
const owner="user_othercreator";
const viewer="user_founder";
const activity=(id,created=now-1000)=>({
  id,type:"post",visibility:"public",
  user:{id:owner},created_at:new Date(created).toISOString(),
  text:"A new Beat"
});

test("only verified-looking Pulse handle text appears",()=>{
  assert.equal(pulseHandle({handle:"nbl_artist"}),"@nbl_artist");
  assert.equal(pulseHandle({handle:"@nbl_artist"}),"@nbl_artist");
  for(const handle of ["","<img src=x>","user name","https://bad.example","@"]){
    assert.equal(pulseHandle({handle}),null);
  }
  assert.equal(pulseHandle(null),null);
});

test("previous posts never look newly published",()=>{
  const watch=createNewBeatTracker();
  const old=activity("first");
  const newer=activity("second");
  watch.prime([old]);
  assert.deepEqual(watch.collect([old,newer],viewer,now).map(x=>x.id),["second"]);
  assert.deepEqual(watch.collect([old,newer],viewer,now),[]);
});

test("notices exclude viewer, nonpublic, moderated and non-post entries",()=>{
  const watch=createNewBeatTracker();
  const rows=[
    {...activity("self"),user:{id:viewer}},
    {...activity("private"),visibility:"private"},
    {...activity("shadow"),moderation:{action:"shadow_block"}},
    {...activity("removed"),moderation:{action:"remove"}},
    {...activity("repost"),type:"comment"},
    {...activity("noauthor"),user:{id:""}},
    {...activity("public")}
  ];
  assert.deepEqual(watch.collect(rows,viewer,now).map(x=>x.id),["public"]);
});

test("avoid stale or future activity spam",()=>{
  const watch=createNewBeatTracker();
  assert.deepEqual(watch.collect([
    activity("old",now-6*60*1000),
    activity("future",now+2*60*1000),
    {...activity("invalid"),created_at:"not-a-date"},
    activity("recent",now-2000)
  ],viewer,now).map(x=>x.id),["recent"]);
});

test("one latest notice per update, no duplicate across feeds",()=>{
  const watch=createNewBeatTracker();
  const rows=[activity("earlier",now-4000),activity("latest",now-500)];
  assert.deepEqual(watch.collect(rows,viewer,now).map(x=>x.id),["latest"]);
  watch.prime(rows);
  assert.deepEqual(watch.collect(rows,viewer,now),[]);
});
