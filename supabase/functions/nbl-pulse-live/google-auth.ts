// Google Cloud Live Stream authentication for Pulse, server-side only.
// Uses Application Default Credentials (metadata server or workload identity).
// No downloadable service account JSON and no browser-exposed Google tokens.
// Deliberately read-only: never creates channels, inputs or billable resources.
const LIVE_SCOPE="https://www.googleapis.com/auth/cloud-platform";
const METADATA_URL="http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";
const API_ROOT="https://livestream.googleapis.com/v1";
type Health={ok:boolean;reason:string;projectConfigured:boolean;regionConfigured:boolean};
function projectId():string{return (Deno.env.get("NBL_GOOGLE_PROJECT_ID")||"").trim();}
function region():string{return (Deno.env.get("NBL_GOOGLE_LIVE_REGION")||"").trim();}
function enabled():boolean{return Deno.env.get("NBL_GOOGLE_LIVE_ENABLED")==="true";}
function configuration():Health{
 const projectConfigured=!!projectId(),regionConfigured=!!region();
 if(!enabled())return {ok:false,reason:"google_live_disabled",projectConfigured,regionConfigured};
 if(!projectConfigured||!regionConfigured)return {ok:false,reason:"google_live_configuration_missing",projectConfigured,regionConfigured};
 return {ok:true,reason:"configured_not_verified",projectConfigured,regionConfigured};
}
async function googleAccessToken():Promise<string>{
 // Metadata identity is only available on Google-managed workloads with
 // explicitly assigned IAM identity; Supabase Edge does NOT provide it.
 // Do not substitute a hardcoded token or client-supplied credentials.
 const r=await fetch(METADATA_URL,{headers:{"Metadata-Flavor":"Google"},signal:AbortSignal.timeout(2500)});
 if(!r.ok)throw new Error("google_workload_identity_unavailable");
 const data=await r.json();
 if(!data?.access_token||!String(data?.scope||LIVE_SCOPE).includes("cloud-platform"))
   throw new Error("google_workload_identity_unavailable");
 return data.access_token;
}
export async function inspectGoogleLive():Promise<Health>{
 const config=configuration();
 if(!config.ok)return config;
 try{
  const token=await googleAccessToken();
  const url=`${API_ROOT}/projects/${encodeURIComponent(projectId())}/locations/${encodeURIComponent(region())}/channels?pageSize=1`;
  const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(5000)});
  return {...config,ok:response.ok,reason:response.ok?"google_live_read_only_access_verified":response.status===403?"google_live_permission_denied":"google_live_unavailable"};
 }catch{return {...config,ok:false,reason:"google_workload_identity_unavailable"};}
}
export {configuration as googleLiveConfiguration};
