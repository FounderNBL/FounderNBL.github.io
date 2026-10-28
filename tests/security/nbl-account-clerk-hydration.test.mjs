import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../../account.html",import.meta.url),"utf8");
const first=html.indexOf("const renderAuthState=()=>{");
const end=html.indexOf("clerk.addListener?.(renderAuthState);",first);
assert.ok(first>=0&&end>first,"NBL account must keep the Clerk listener-driven auth state");
const auth=html.slice(first,end);

test("Clerk account identity never switches from transient session id to stable user id",()=>{
  assert.match(auth,/const accountId=String\(clerk\.user\?\.id\|\|clerk\.session\?\.user\?\.id\|\|""\)/);
  assert.doesNotMatch(auth,/clerk\.session\?\.id/);
  assert.match(auth,/if\(!accountId\)\{/);
  assert.match(html,/clerk\.addListener\?\.\(renderAuthState\)/);
});
test("hydrating Clerk identity does not initialize account, redirect or charge",()=>{
  const waiting=auth.slice(auth.indexOf("if(!accountId){"),auth.indexOf("if(accountInitializationStarted&&accountId!==initializedAccountId)"));
  assert.match(waiting,/accountBody\.classList\.add\("hidden"\)/);
  assert.match(waiting,/return;/);
  assert.doesNotMatch(waiting,/location\.(?:assign|replace)|fetch\(|initializeSignedInAccount\(/);
  assert.match(html,/clerk\.addListener\?\.\(renderAuthState\)/);
});
test("true user-to-user account changes still deny stale history",()=>{
  assert.match(auth,/accountInitializationStarted&&accountId!==initializedAccountId/);
  assert.match(auth,/accountBody\.classList\.add\("hidden"\)/);
  assert.match(auth,/initializeSignedInAccount\(\)/);
});
