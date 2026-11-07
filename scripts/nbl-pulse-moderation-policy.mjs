#!/usr/bin/env node
// NBL Pulse: named, UNATTACHED Stream moderation policy. Safe offline default.
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";

const config = JSON.parse(readFileSync(new URL("../config/nbl-pulse/moderation-policy.review.json", import.meta.url), "utf8"));
const POLICY_KEY = "pm:nbl-pulse-review-v1";
const EXPECTED_APP_ID = "1732290";
const mode = process.argv[2] || "--dry-run";

function validate(p) {
  if (p.key !== POLICY_KEY || p.key.startsWith("feeds") || p.key.startsWith("chat")) throw Error("Unsafe key: no default policy may be changed");
  if (!Array.isArray(p.ai_text_config?.rules) || p.ai_text_config.rules.length === 0) throw Error("Text rules missing");
  for (const r of p.ai_text_config.rules) {
    if (!/^[A-Z_]+$/.test(r.label || "")) throw Error("Text label invalid");
    if (["VULGARITY","POLITICS","FORBIDDEN_LANGUAGE","PLATFORM_BYPASS","SEXTING","ADS"].includes(r.label)) throw Error("NBL free expression category must not be blocked");
    const actions = [r.action,...(r.severity_rules || []).map(x => x.action)].filter(Boolean);
    if (!actions.length || actions.some(a => !["flag","remove"].includes(a))) throw Error("Unsafe text action");
    if ((r.severity_rules || []).some(x => !["low","medium","high","critical"].includes(x.severity))) throw Error("Invalid severity");
  }
  for (const section of ["ai_image_config","ai_video_config"]) {
    if (!p[section] || !Array.isArray(p[section].rules) || !p[section].rules.length) throw Error("Missing media policy");
    for (const r of p[section].rules) {
      if (!["Explicit","Violence","Hate Symbols","PII"].includes(r.label)) throw Error("Unsupported media label");
      if (section === "ai_video_config" && r.label === "PII") throw Error("Video does not support PII rule");
      if (!["flag","remove"].includes(r.action)) throw Error("Unsafe media action");
      if (!Number.isInteger(r.min_confidence) || r.min_confidence < 1 || r.min_confidence > 100) throw Error("Invalid confidence");
    }
  }
  for (const extra of ["block_list_config","llm_config","video_call_rule_config","flood_config"]) {
    if (Object.hasOwn(p,extra)) throw Error("Unexpected additional moderation engine");
  }
}
validate(config);
if (!["--dry-run","--inspect","--apply"].includes(mode) || process.argv.length > 3) throw Error("Use --dry-run, --inspect, or --apply");

if (mode === "--dry-run") {
  console.log("PASS: NBL Pulse policy validated offline.");
  console.log("Key: "+POLICY_KEY+" (UNATTACHED; no Feeds, Messenger or Go Live rule changed)");
  console.log("Text: "+config.ai_text_config.rules.length+"; images: "+config.ai_image_config.rules.length+"; uploaded video: "+config.ai_video_config.rules.length);
  console.log("No API calls, no provider cost.");
} else {
  const key = process.env.STREAM_API_KEY || "";
  const secret = process.env.STREAM_API_SECRET || "";
  if (!key || !secret) throw Error("STREAM_API_KEY and STREAM_API_SECRET required in secure environment");
  if (mode === "--apply") {
    if (process.env.NBL_STREAM_APP_ENV !== "DEV") throw Error("Refusing write outside acknowledged Stream DEV environment");
    if (process.env.NBL_STREAM_MODERATION_APPLY_ACK !== "CREATE_UNATTACHED_NBL_PULSE_POLICY") throw Error("Missing explicit policy creation acknowledgment");
  }
  const now = Math.floor(Date.now()/1000);
  const enc = x => Buffer.from(JSON.stringify(x)).toString("base64url");
  const unsigned = enc({alg:"HS256",typ:"JWT"})+"."+enc({server:true,iat:now,exp:now+120});
  const jwt = unsigned+"."+createHmac("sha256",secret).update(unsigned).digest("base64url");
  const q = "?api_key="+encodeURIComponent(key);
  const base = "https://chat.stream-io-api.com/api/v2";
  const auth = {authorization:"Bearer "+jwt,"stream-auth-type":"jwt",accept:"application/json"};
  async function request(path,method="GET",body) {
    const response = await fetch(base+path+q,{
      method,
      headers:{...auth,...(body?{"content-type":"application/json"}:{})},
      body:body?JSON.stringify(body):undefined,
      signal:AbortSignal.timeout(12000)
    });
    const data = await response.json().catch(()=>({}));
    return {status:response.status,ok:response.ok,data};
  }
  if (mode === "--apply") {
    const app = await request("/app");
    if (!app.ok) throw Error("Stream application verification failed: HTTP "+app.status);
    const actualID = String(app.data?.app?.id || app.data?.id || "");
    if (actualID !== EXPECTED_APP_ID) throw Error("Stream app identity not independently verified; refusing to write");
  }
  const endpoint = "/moderation/config/"+encodeURIComponent(POLICY_KEY);
  const old = await request(endpoint);
  if (mode === "--inspect") {
    if (old.status === 404) console.log("Named draft policy not found; no change made.");
    else if (old.ok) console.log("Named draft policy exists; no change made.");
    else throw Error("Unable to inspect policy: HTTP "+old.status);
  } else {
    if (old.ok) throw Error("Existing policy found; refusing to overwrite");
    if (old.status !== 404) throw Error("Policy preflight failed; HTTP "+old.status);
    const write = await request("/moderation/config","POST",config);
    if (!write.ok) throw Error("Stream draft policy creation failed: HTTP "+write.status);
    const verify = await request(endpoint);
    if (!verify.ok || verify.data?.config?.key !== POLICY_KEY) throw Error("Write may have succeeded but readback could not verify exact policy; check Stream dashboard");
    console.log("VERIFIED: named NBL Pulse draft moderation policy created; NOT attached to Feeds or Chat.");
  }
}
