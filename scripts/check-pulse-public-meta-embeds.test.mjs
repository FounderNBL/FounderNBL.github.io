import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parsePublicVideo} from "../messenger/social-video-connect.mjs";

const review=readFileSync(new URL("../pulse/embed-preview.html",import.meta.url),"utf8");
const feed=readFileSync(new URL("../messenger/social-video-connect.mjs",import.meta.url),"utf8");

test("public Meta embeds only accept specifically supported HTTPS URLs",()=>{
 assert.deepEqual(parsePublicVideo("https://www.threads.com/@threads/post/DCkkKl_OGb1"),{
  provider:"threads",url:"https://www.threads.com/@threads/post/DCkkKl_OGb1/"
 });
 assert.deepEqual(parsePublicVideo("https://www.threads.net/@threads/post/DCkkKl_OGb1"),{
  provider:"threads",url:"https://www.threads.com/@threads/post/DCkkKl_OGb1/"
 });
 assert.deepEqual(parsePublicVideo("https://www.instagram.com/p/C8h9Yi7ABCD/"),{
  provider:"instagram",url:"https://www.instagram.com/p/C8h9Yi7ABCD/"
 });
 assert.deepEqual(parsePublicVideo("https://www.facebook.com/NewBeansland/posts/pfbid0nWhZeiMVjzLHVjzR6QngXeVug8Nw4YxncbbZrquMu72r3HM8a73k55keRWiaWNLTl"),{
  provider:"facebook-post",url:"https://www.facebook.com/NewBeansland/posts/pfbid0nWhZeiMVjzLHVjzR6QngXeVug8Nw4YxncbbZrquMu72r3HM8a73k55keRWiaWNLTl/"
 });
 for(const url of [
  "https://threads.com.evil.example/@threads/post/DCkkKl_OGb1",
  "http://www.instagram.com/p/C8h9Yi7ABCD/",
  "https://www.instagram.com.evil.example/p/C8h9Yi7ABCD/",
  "https://www.facebook.com:444/NewBeansland/posts/123456",
  "https://alice:secret@www.threads.com/@threads/post/DCkkKl_OGb1",
  "javascript:alert(1)",
  "https://www.threads.com/@threads/likes",
  "https://www.instagram.com/stories/example/12345/"
 ])assert.equal(parsePublicVideo(url),null,url);
});

test("public review page shows separate Meta and Threads previews without secret access",()=>{
 assert.match(review,/<form data-embed="meta">/);
 assert.match(review,/<form data-embed="threads">/);
 assert.match(review,/import \{parsePublicVideo,mountPublicVideo\}/);
 assert.match(review,/No credentials, API keys, private messages/);
 assert.match(feed,/www\.threads\.com\/embed\.js/);
 assert.match(feed,/www\.instagram\.com\/embed\.js/);
 assert.match(feed,/facebook\.com\/plugins\//);
 assert.doesNotMatch(review,/access_token=|app_secret|Bearer\s/);
});
