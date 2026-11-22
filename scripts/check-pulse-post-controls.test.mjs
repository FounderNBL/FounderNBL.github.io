import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ownPost,mutateOwnPost,mediaCaption,displayedCaption} from "../messenger/pulse-post-controls.mjs";
const actor="user_owner",other="user_other";
const activity={id:"post-1",type:"post",user:{id:actor},text:"Original",attachments:[{type:"image",image_url:"https://example.test/image"}]};
function fixture(original=activity){
 const operations=[];
 const client={
  async getActivity(args){operations.push(["get",args]);return {activity:original};},
  async deleteActivity(args){operations.push(["delete",args]);},
  async updateActivityPartial(args){operations.push(["edit",args]);}
 };
 return {operations,client};
}
function call(f,extra={}){
 return mutateOwnPost({client:f.client,activity,actor,assertAccount:id=>assert.equal(id,actor),action:"delete",...extra});
}
test("owner checks reject another author, invalid IDs and non-post activity",()=>{
 assert.equal(ownPost(activity,actor),true);
 assert.equal(ownPost(activity,other),false);
 assert.equal(ownPost({...activity,type:"notification"},actor),false);
 assert.equal(ownPost({...activity,id:"../bad"},actor),false);
});
test("delete removes the real Stream activity globally, not merely the display",async()=>{
 const f=fixture();await call(f);
 assert.deepEqual(f.operations,[["get",{id:"post-1"}],["delete",{id:"post-1",hard_delete:true,delete_notification_activity:true}]]);
});
test("even a stale or spoofed displayed owner cannot delete another member's activity",async()=>{
 const f=fixture({...activity,user:{id:other}});
 await assert.rejects(call(f),/no longer belongs/);
 assert.deepEqual(f.operations,[["get",{id:"post-1"}]]);
 const g=fixture();await assert.rejects(call(g,{actor:other,assertAccount:()=>{}}),/own posts/);
 assert.equal(g.operations.length,0);
});
test("account switch during ownership lookup aborts before the mutation",async()=>{
 const f=fixture();let checks=0;
 await assert.rejects(call(f,{assertAccount:()=>{if(++checks===2)throw Error("account changed");}}),/account changed/);
 assert.equal(f.operations.length,1);
});
test("caption edits preserve media, visibility and custom fields and run activity processors",async()=>{
 const f=fixture();await call(f,{action:"edit",caption:"Updated"});
 assert.deepEqual(f.operations,[["get",{id:"post-1"}],["edit",{id:"post-1",set:{text:"Updated"},run_activity_processors:true}]]);
});
test("provider rejection propagates; do not falsely report success",async()=>{
 const f=fixture();f.client.deleteActivity=async()=>{throw Error("provider permission denied");};
 await assert.rejects(call(f),/permission denied/);
});
test("photo-only activity captions are correct, including old automatically generated labels",()=>{
 assert.equal(mediaCaption([{type:"image"}]),"Shared a photo");
 assert.equal(mediaCaption([{type:"image"},{type:"image"}]),"Shared photos");
 assert.equal(mediaCaption([{type:"video"}]),"Shared a video");
 assert.equal(mediaCaption([],true),"Shared a public link");
 assert.equal(displayedCaption({...activity,text:"Shared a video"}),"Shared a photo");
 assert.equal(displayedCaption({...activity,text:"My photo"}),"My photo");
 assert.equal(displayedCaption({...activity,text:"Shared a video",custom:{nbl_youtube_id:"example"}}),"Shared a video");
});
test("Pulse exposes its owner menu, explicit delete confirmation, and all-view refresh",()=>{
 const js=readFileSync(new URL("../messenger/social-v1.mjs",import.meta.url),"utf8");
 const page=readFileSync(new URL("../pulse/index.html",import.meta.url),"utf8");
 assert.match(js,/ownPost\(activity,state\.user\?\.id\)/);
 assert.match(js,/window\.confirm\("Permanently delete this post from Pulse/);
 assert.match(js,/Edit Post/);
 assert.match(js,/Delete Post/);
 assert.match(js,/deletedPostIds\.add\(activity\.id\)/);
 assert.match(js,/rows\.filter\(row=>!deletedPostIds\.has\(row\.id\)&&!row\.deleted_at\)/);
 assert.match(js,/if\(linkedPostId===activity\.id\)await loadLinkedPost\(\)/);
 assert.match(page,/pulse-post-menu-options/);
});
