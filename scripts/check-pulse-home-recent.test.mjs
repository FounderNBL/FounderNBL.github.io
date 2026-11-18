import test from "node:test";
import assert from "node:assert/strict";
import {recentHomeBeats} from "../messenger/pulse-home-recent.mjs";

const beat=(id,minute)=>({
  id,type:"post",visibility:"public",
  created_at:new Date(Date.UTC(2026,10,17,20,minute)).toISOString(),
  user:{id:"user_example"},text:"Real Beat "+id
});
test("Home includes own post even when For You is empty",()=>{
  assert.deepEqual(recentHomeBeats([[],[beat("my-music-photo",21)]]).map(x=>x.id),["my-music-photo"]);
});
test("Home sorts newest and shows at most eight",()=>{
  const all=Array.from({length:14},(_,i)=>beat("b"+i,i));
  assert.deepEqual(recentHomeBeats([all.slice(0,7),all.slice(7)]).map(x=>x.id),
    ["b13","b12","b11","b10","b9","b8","b7","b6"]);
});
test("Same Beat in own and recommendation feeds appears only once",()=>{
  const shared=beat("same",30);
  assert.deepEqual(recentHomeBeats([[shared],[shared]]).map(x=>x.id),["same"]);
});
test("Home excludes private, held, removed, and non-post content",()=>{
  const rows=[
    {...beat("private",0),visibility:"private"},
    {...beat("moderated",1),moderation:{action:"shadow"}},
    {...beat("deleted",2),deleted_at:"2026-11-17T21:00:00Z"},
    {...beat("hidden",3),hidden:true},
    {...beat("comment",4),type:"comment"},
    beat("real",5)
  ];
  assert.deepEqual(recentHomeBeats([rows]).map(x=>x.id),["real"]);
});
test("No imaginary posts when none exist and input is safe",()=>{
  assert.deepEqual(recentHomeBeats([[],null]),[]);
  assert.deepEqual(recentHomeBeats(null),[]);
  assert.deepEqual(recentHomeBeats([[beat("real",0)]],{limit:100}).map(x=>x.id),["real"]);
});
