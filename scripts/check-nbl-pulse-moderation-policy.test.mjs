import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const text = name => readFileSync(new URL("../"+name,import.meta.url),"utf8");
const p = JSON.parse(text("config/nbl-pulse/moderation-policy.review.json"));
const script = text("scripts/nbl-pulse-moderation-policy.mjs");
test("separate named policy never auto-enables feeds, chat, or livestream monitoring", () => {
  assert.equal(p.key,"pm:nbl-pulse-review-v1");
  assert.ok(!p.key.startsWith("feeds") && !p.key.startsWith("chat"));
  assert.ok(!("video_call_rule_config" in p));
  assert.match(script,/NBL_STREAM_MODERATION_APPLY_ACK/);
});
test("NBL slang and profanity aren't automatic violations", () => {
  const labels = p.ai_text_config.rules.map(r=>r.label);
  for (const label of ["VULGARITY","POLITICS","SEXTING","ADS","PLATFORM_BYPASS","FORBIDDEN_LANGUAGE"]) assert.ok(!labels.includes(label));
  assert.ok(!("block_list_config" in p));
});
test("high danger removed, low severity reviewed, no automatic user bans", () => {
  const threat = p.ai_text_config.rules.find(r=>r.label==="THREAT");
  assert.equal(threat.severity_rules.find(x=>x.severity==="low").action,"flag");
  assert.equal(threat.severity_rules.find(x=>x.severity==="critical").action,"remove");
  for (const r of p.ai_text_config.rules) {
    assert.ok([r.action,...(r.severity_rules || []).map(x=>x.action)].filter(Boolean).every(a=>["flag","remove"].includes(a)));
  }
});
test("image/video rules each have confidence thresholds",()=>{
  for(const c of ["ai_image_config","ai_video_config"]){
    assert.ok(p[c].rules.length > 0);
    for(const r of p[c].rules) assert.ok(Number.isInteger(r.min_confidence) && r.min_confidence >= 50 && r.min_confidence <= 100);
  }
});
test("dry run offline passes without API credentials", () => {
  const result = spawnSync(process.execPath,["scripts/nbl-pulse-moderation-policy.mjs","--dry-run"],{encoding:"utf8",env:{PATH:process.env.PATH,HOME:process.env.HOME}});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/UNATTACHED/);
  assert.match(result.stdout,/No API calls/);
});
test("apply without operator credentials fails closed", () => {
  const result = spawnSync(process.execPath,["scripts/nbl-pulse-moderation-policy.mjs","--apply"],{encoding:"utf8",env:{PATH:process.env.PATH,HOME:process.env.HOME}});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/STREAM_API_KEY and STREAM_API_SECRET/);
});
