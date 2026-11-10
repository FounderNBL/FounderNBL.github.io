import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const code=read("nbl-world-header.js"),home=read("index.html");
test("Live website uses real NBL Core and GitHub-owned Beans",()=>{
 assert.match(home,/src="\/nbl-world-header\.js\?v=/);
 assert.match(code,/const NBL_CORE_API="https:\/\/tvypdakofcrlvnwporhh\.supabase\.co\/functions\/v1\/nbl-core"/);
 assert.ok(code.includes("const NBL_BEANS_WEB_API="));
 assert.ok(code.includes("NBL_CORE_API"));
 assert.ok(code.includes('const endpoint=NBL_BEANS_WEB_API;'));
 assert.ok(code.includes('requestBody={action:"chat",mode:"beans",clientChannel:"website"'));
 assert.ok(code.includes('headers.Authorization='));
 assert.doesNotMatch(code,/api\.anthropic\.com\/v1\/messages/);
 assert.doesNotMatch(code,/api\.openai\.com\/v1\/responses/);
});
