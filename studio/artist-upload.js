// Signed-in NBL Music artist uploads. Never upload to the public GitHub repo
// or finished masters bucket. Artist intake defaults OFF server-side.
(()=>{
  "use strict";
  const API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-music-artist-intake";
  const SB_URL="https://tvypdakofcrlvnwporhh.supabase.co";
  // Already public NBL Supabase publishable key, same as social-realtime.js.
  const PUBLIC_KEY="sb_publishable_IuiM2Ee9gJp9Vchozncc2Q_PfFkqogl";
  const SDK="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js";
  const $=id=>document.getElementById(id);
  const form=$("artistUploadForm"),notice=$("artistUploadStatus"),submit=$("artistUploadSubmit"),list=$("artistSubmissionList");
  let sdkPromise;
  async function supabaseClient(){
    if(!sdkPromise)sdkPromise=new Promise((resolve,reject)=>{
      if(window.supabase?.createClient)return resolve(window.supabase);
      const script=document.createElement("script");script.async=true;script.src=SDK;
      script.crossOrigin="anonymous";
      script.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(Error("Upload equipment unavailable."));
      script.onerror=()=>reject(Error("Upload equipment unavailable."));
      document.head.append(script);
    });
    const sdk=await sdkPromise;
    return sdk.createClient(SB_URL,PUBLIC_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  }
  async function token(){
    const bridge=window.NBLAccountBridge;
    if(!bridge)throw Error("NBL sign-in connection unavailable.");
    const clerk=await bridge.getClerk();
    if(!clerk?.isSignedIn)throw Error("Please sign in to your NBL account.");
    const t=await bridge.getToken();
    if(!t)throw Error("Your NBL sign-in has expired. Sign in again.");
    return t;
  }
  async function call(action,fields={}){
    const t=await token();
    const r=await fetch(API,{method:"POST",mode:"cors",credentials:"omit",
      headers:{"content-type":"application/json","authorization":"Bearer "+t},
      body:JSON.stringify({action,...fields})
    });
    const body=await r.json().catch(()=>({}));
    if(!r.ok||!body.ok)throw Error(body.reason||"Submission service is unavailable.");
    return body;
  }
  function showStatus(t){notice.textContent=t;}
  async function load(){
    try{
      const config=await call("status");
      form.hidden=!config.artistUploadsOpen;
      showStatus(config.artistUploadsOpen?"Artist submissions are open for private review.":
        "Artist intake is not open yet. No uploads or fees are being accepted.");
      const items=await call("my_submissions");
      list.replaceChildren();
      for(const item of items.submissions||[]){
        const row=document.createElement("div");row.className="track-row";
        const text=document.createElement("span");text.className="track-meta";
        const name=document.createElement("strong");name.textContent=item.title+" — "+item.artist;
        const progress=document.createElement("span");progress.textContent=item.status.replaceAll("_"," ");
        text.append(name,progress);row.appendChild(text);list.appendChild(row);
      }
    }catch(error){form.hidden=true;showStatus(error?.message||"Please sign in.");}
  }
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const f=new FormData(form),file=f.get("audioFile");
    if(!(file instanceof File)||file.size<1||file.size>52428800){
      showStatus("Choose an MP3, M4A, WAV or MP4 file of 50 MB or less.");return;
    }
    if(!f.get("rightsConfirmed")){showStatus("Confirm your distribution rights.");return;}
    submit.disabled=true;
    try{
      showStatus("Preparing your protected upload…");
      const ticket=await call("prepare",{
        title:String(f.get("songTitle")||"").trim(),
        artist:String(f.get("artistName")||"").trim(),
        filename:file.name,mime:file.type,size:file.size,rightsConfirmed:true
      });
      const client=await supabaseClient();
      showStatus("Uploading to NBL's private submissions storage…");
      const uploaded=await client.storage.from(ticket.bucket)
        .uploadToSignedUrl(ticket.path,ticket.token,file,{contentType:file.type,upsert:false});
      if(uploaded.error)throw Error("Upload failed; the song was not submitted.");
      const receipt=await call("complete",{id:ticket.id});
      if(receipt.status!=="pending_review")throw Error("Upload requires review confirmation.");
      form.reset();
      showStatus("Your song was received privately and is awaiting NBL review.");
      await load();
    }catch(error){showStatus(error?.message||"Upload unavailable.");}
    finally{submit.disabled=false;}
  });
  void load();
})();
