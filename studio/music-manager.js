// NBL Music Productions: Founder-only, manual private release staging.
// Never exposes master files or publishes without an explicit Founder click.
// Requires the separately reviewed/deployed nbl-music service; no Stripe.
(()=>{
  "use strict";
  const API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-music";
  const URL="https://tvypdakofcrlvnwporhh.supabase.co";
  const KEY="sb_publishable_IuiM2Ee9gJp9Vchozncc2Q_PfFkqogl";
  const SDK="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js";
  const $=id=>document.getElementById(id);
  const root=$("musicReleaseEditor"),form=$("musicReleaseForm");
  const save=$("musicReleaseSave"),publishBox=$("musicReleasePublish");
  const publish=$("musicPublishButton"),message=$("musicReleaseMessage");
  if(!root||!form)return;
  let signedId="",sdkPromise=null,submitting=false;
  async function auth(){
    const bridge=window.NBLAccountBridge;
    if(!bridge)throw Error("NBL account service unavailable.");
    const clerk=await bridge.getClerk();
    if(!clerk?.isSignedIn)throw Error("Sign in to your NBL account.");
    const token=await bridge.getToken();
    if(!token)throw Error("NBL account session expired.");
    return token;
  }
  async function call(action,data={}){
    const token=await auth();
    const r=await fetch(API,{method:"POST",mode:"cors",credentials:"omit",
      headers:{"content-type":"application/json","authorization":"Bearer "+token},
      body:JSON.stringify({action,...data})
    });
    const body=await r.json().catch(()=>({}));
    if(!r.ok||!body.ok)throw Error(body.reason||"Music management is unavailable.");
    return body;
  }
  async function client(){
    if(!sdkPromise)sdkPromise=new Promise((resolve,reject)=>{
      if(window.supabase?.createClient)return resolve(window.supabase);
      const tag=document.createElement("script");
      tag.src=SDK;tag.async=true;tag.crossOrigin="anonymous";
      tag.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(Error("Storage connection unavailable."));
      tag.onerror=()=>reject(Error("Storage connection unavailable."));
      document.head.append(tag);
    });
    const sdk=await sdkPromise;
    return sdk.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  }
  async function upload(kind,file){
    if(!(file instanceof File)||file.size<1||file.size>52428800)
      throw Error("Choose a file under 50 MB.");
    if(!/^(audio\/mpeg|audio\/mp4|audio\/x-m4a|audio\/wav|audio\/x-wav|video\/mp4)$/.test(file.type))
      throw Error("Only MP3, M4A or MP4 files are supported.");
    const ticket=await call("founder_upload_prepare",{kind,mime:file.type,size:file.size});
    const storage=await client();
    const r=await storage.storage.from(ticket.bucket).uploadToSignedUrl(
      ticket.path,ticket.token,file,{contentType:file.type,upsert:false}
    );
    if(r.error)throw Error(kind+" private upload failed. No release published.");
    return ticket.path;
  }
  // Verify the backend privileges first. No private edit UI for ordinary accounts.
  call("founder_stats").then(info=>{
    if(info.ok)root.hidden=false;
  }).catch(()=>{root.hidden=true;});
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(submitting)return;
    const f=new FormData(form);
    if(!f.get("rightsConfirmed")){message.textContent="Verify your release rights first.";return;}
    const preview=f.get("previewFile"),master=f.get("masterFile");
    submitting=true;save.disabled=true;publishBox.hidden=true;signedId="";
    try{
      message.textContent="Uploading the private listening copy…";
      const previewKey=await upload("preview",preview);
      message.textContent="Uploading the private download master…";
      const masterKey=await upload("master",master);
      message.textContent="Saving release as a private draft…";
      const id=String(f.get("releaseId")||"").trim();
      const result=await call("founder_release_draft",{
        id,title:String(f.get("title")||"").trim(),
        artist:String(f.get("artist")||"").trim(),
        featuredArtists:String(f.get("featured")||"").trim(),
        coverUrl:String(f.get("coverUrl")||"").trim(),
        durationSeconds:Number(f.get("durationSeconds")),
        previewKey,masterKey,rightsConfirmed:true
      });
      signedId=result.id;publishBox.hidden=false;
      message.textContent="Saved privately. Only you can publish the listening copy.";
    }catch(e){message.textContent=e?.message||"The release was not saved.";}
    finally{submitting=false;save.disabled=false;}
  });
  publish.addEventListener("click",async()=>{
    if(!signedId||submitting)return;
    if(!window.confirm("Publish "+signedId+" for free streaming on the NBL Music Productions website? This does NOT enable downloads or sales."))return;
    submitting=true;publish.disabled=true;
    try{
      const r=await call("founder_release_publish",{id:signedId,confirmPublish:true});
      if(r.state!=="published")throw Error("Publication not verified.");
      message.textContent="Listening release published in the private music catalog. Paid downloads remain disabled.";
      publishBox.hidden=true;
    }catch(e){message.textContent=e?.message||"Publication not completed.";}
    finally{submitting=false;publish.disabled=false;}
  });
})();
