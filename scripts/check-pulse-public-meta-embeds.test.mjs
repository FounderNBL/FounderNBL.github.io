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

test("Threads mobile /share/ links and official embed code are safely parsed",()=>{
 assert.deepEqual(parsePublicVideo("https://www.threads.com/share/FQ88FtqTF"),{
  provider:"threads-share",url:"https://www.threads.com/share/FQ88FtqTF"
 });
 assert.deepEqual(parsePublicVideo("https://www.threads.com/share/Ft28fQA5h"),{
  provider:"threads-share",url:"https://www.threads.com/share/Ft28fQA5h"
 });
 const safeEmbed='<blockquote class="text-post-media" data-text-post-permalink="https://www.threads.com/@nycwillnoon/post/Df75NmboHQ_" data-text-post-version="0"><script>alert("unsafe")</script></blockquote>';
 assert.deepEqual(parsePublicVideo(safeEmbed),{
  provider:"threads",url:"https://www.threads.com/@nycwillnoon/post/Df75NmboHQ_/"
 });
 for(const raw of [
  "http://www.threads.com/share/FQ88FtqTF",
  "https://www.threads.com.evil.example/share/FQ88FtqTF",
  "https://www.threads.com/share/../@bad/post/Df75NmboHQ_",
  "https://www.threads.com/share/FQ88FtqTF/another",
  '<blockquote data-text-post-permalink="https://malicious.example/@user/post/Df75NmboHQ_"></blockquote>'
 ])assert.equal(parsePublicVideo(raw),null,raw);
 const resolver=readFileSync(new URL("../server/supabase/functions/nbl-public-threads-resolve/index.ts",import.meta.url),"utf8");
 assert.match(resolver,/redirect:"manual"/);
 assert.match(resolver,/threads_share_not_resolved/);
 assert.match(resolver,/postUrl\(new URL\(location,url\)\.toString\(\)\)/);
 assert.doesNotMatch(resolver,/eval\(|new Function/);
 assert.match(review,/resolvePublicVideo/);
 assert.match(review,/maxlength="12000"/);
 assert.match(feed,/resolvePublicVideo/);
});
