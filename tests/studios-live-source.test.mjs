import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../studios-live.html", import.meta.url), "utf8");
const client = readFileSync(new URL("../studios-live.js", import.meta.url), "utf8");
const sdkSource = readFileSync(new URL("../studio/live-video/src/index.jsx", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../studio/live-video/package.json", import.meta.url), "utf8"));
const docs = readFileSync(new URL("../docs/studios-live-mvp.md", import.meta.url), "utf8");

test("preview remains unlinked, noindex, and generic", () => {
  assert.match(page, /name="robots" content="noindex,nofollow"/);
  assert.doesNotMatch(page, /rel="canonical"|<nav\b|<a\b[^>]*href="\/studios-live/);
  assert.match(page, /Unlinked preview/);
  assert.match(page + client, /NBL member/);
  assert.doesNotMatch(page + client, /@FounderNBL|official creator launch|stage name/i);
});

test("Video status and sessions are fail-closed and Clerk-authenticated", () => {
  assert.match(client, /functions\/v1\/nbl-core/);
  assert.match(client, /CORE_API \+ "\/stream"/);
  assert.match(client, /"Authorization": "Bearer " \+ token/);
  assert.match(client, /payload\.provider !== "stream_video"/);
  assert.match(client, /payload\.status\)/);
  assert.match(client, /payload\.userId !== userId/);
  assert.match(client, /"host_backstage"/);
  assert.match(client, /"viewer_session"/);
  assert.match(client, /window\.isSecureContext/);
  assert.match(client, /markStatusUnavailable/);
  assert.doesNotMatch(client, /localStorage|sessionStorage|role\s*:/);
  assert.doesNotMatch(client, /\/social.*health|chat.*health/i);
});

test("Stream Video is a pinned local SDK bundle with provider-side host permissions", () => {
  assert.equal(packageJson.dependencies["@stream-io/video-react-sdk"], "1.44.0");
  assert.equal(packageJson.dependencies.react, "19.3.1");
  assert.match(sdkSource, /EmbeddedLivestream/);
  assert.match(sdkSource, /callType="livestream"/);
  assert.match(sdkSource, /name: "NBL member"/);
  assert.doesNotMatch(sdkSource, /https?:\/\/|role\s*:/);
  assert.match(docs, /join-backstage/);
  assert.match(docs, /UNVERIFIED/);
});

test("audience messages use human moderation actions and safe text rendering", () => {
  for (const action of ["chat_history", "chat_send", "chat_mute", "chat_report", "chat_block_sender"]) {
    assert.ok(client.includes(`"${action}"`), `missing action ${action}`);
  }
  assert.match(client, /body\.textContent = String\(message\.body \|\| ""\)/);
  assert.match(page, /do not use Beans AI or NBL Usage credits/);
  assert.match(docs, /existing human member-chat moderation/);
});
