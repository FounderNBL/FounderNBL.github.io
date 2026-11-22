// TikTok authorization UI: no secrets or provider tokens stored in the browser.
const API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-tiktok-connect";
const KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const $=id=>document.getElementById(id);
let busy=false,configured={sandbox:false,production:false},connected=false;
function status(s){$("status").textContent=s;}
function domain(){const s=KEY.split("_")[2].replace(/-/g,"+").replace(/_/g,"/");return atob(s.padEnd(Math.ceil(s.length/4)*4,"=")).replace(/\$/,"");}
async function token(){if(!window.Clerk){await new Promise((ok,no)=>{const el=document.createElement("script");el.src="https://"+domain()+"/npm/@clerk/clerk-js@6/dist/clerk.browser.js";el.setAttribute("data-clerk-publishable-key",KEY);el.onload=ok;el.onerror=no;document.head.append(el);});}await window.Clerk.load();if(!window.Clerk.isSignedIn)throw Error("Sign in to your NBL account first.");const t=await window.Clerk.session?.getToken();if(!t)throw Error("NBL sign-in expired.");return t;}
async function api(action,more={}){const res=await fetch(API,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+await token()},body:JSON.stringify({action,mode:$("mode").value,...more}),cache:"no-store"});const v=await res.json().catch(()=>({}));if(!res.ok||!v.ok)throw Error(v.reason||"TikTok connection unavailable");return v;}
function buttons(){const ready=!!configured[$("mode").value];$("connect").disabled=busy||!ready;$("check").disabled=busy||!ready;$("creator").disabled=busy||!ready||!connected;$("disconnect").disabled=busy||!ready||!connected;}
async function run(fn){busy=true;buttons();try{await fn();}catch(e){status("Could not complete: "+e.message);}finally{busy=false;buttons();}}
async function refresh(){const c=await api("configuration");configured=c;const mode=$("mode").value;if(!c[mode]){connected=false;status(mode+" is not configured on the server yet.");return;}const v=await api("connection");connected=v.connected;status(v.connected?"Connected: "+v.label+"\nPermissions: "+v.scopes.join(", "):"Not connected yet. Select Connect TikTok to authorize this account.");}
$("mode").addEventListener("change",()=>run(refresh));
$("check").addEventListener("click",()=>run(refresh));
$("connect").addEventListener("click",()=>run(async()=>{const v=await api("begin");if(!v.url?.startsWith("https://www.tiktok.com/"))throw Error("Unexpected authorization URL");location.assign(v.url);}));
$("creator").addEventListener("click",()=>run(async()=>{const v=await api("creator");status("TikTok posting permissions available. Privacy choices: "+(v.creator?.privacy_level_options||[]).join(", "));}));
$("disconnect").addEventListener("click",()=>{if(!confirm("Disconnect this TikTok account from Pulse?"))return;run(async()=>{await api("disconnect");await refresh();});});
run(async()=>{const qs=new URLSearchParams(location.search);const code=qs.get("code"),state=qs.get("state"),error=qs.get("error");if(error){history.replaceState(null,"",location.pathname);throw Error("TikTok declined authorization: "+error);}if(code&&state){const mode=sessionStorage.getItem("nbl-tiktok-oauth-mode")||"sandbox";$("mode").value=mode;await api("callback",{code,state});history.replaceState(null,"",location.pathname);sessionStorage.removeItem("nbl-tiktok-oauth-mode");}await refresh();});
$("connect").addEventListener("click",()=>sessionStorage.setItem("nbl-tiktok-oauth-mode",$("mode").value));
