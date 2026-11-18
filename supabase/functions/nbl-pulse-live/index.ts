// NBL Pulse Live provider readiness endpoint (not a broadcasting API).
// Zero billable Google operations: GET lists at most one channel, only if enabled.
// No creator actions are exposed; public calls never receive access tokens.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {inspectGoogleLive,googleLiveConfiguration} from "./google-auth.ts";
const headers={"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"};
Deno.serve(async(req:Request)=>{
 if(req.method!=="GET")return new Response(JSON.stringify({ok:false,reason:"method_not_allowed"}),{status:405,headers});
 const u=new URL(req.url);
 if(u.searchParams.get("action")!=="readiness")return new Response(JSON.stringify({ok:false,reason:"unsupported_action"}),{status:404,headers});
 // Public response is deliberately limited to non-sensitive status codes.
 // Do not return project ID, region, identity, access token, channel IDs or cost data.
 const configured=googleLiveConfiguration();
 if(!configured.ok)return new Response(JSON.stringify({ok:false,provider:"google",reason:configured.reason,broadcasting:false}),{status:503,headers});
 const state=await inspectGoogleLive();
 return new Response(JSON.stringify({ok:state.ok,provider:"google",reason:state.reason,broadcasting:false}),{status:state.ok?200:503,headers});
});
