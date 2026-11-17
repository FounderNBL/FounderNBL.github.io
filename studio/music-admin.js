// Founder-only NBL Music analytics. Public HTML contains NO protected rows.
// All counts require a real Clerk token and server-side privileged authorization.
(()=>{
  const endpoint="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-music";
  const $=id=>document.getElementById(id);
  const status=$("musicAdminStatus"),data=$("musicAdminData"),tracks=$("musicAdminTracks");
  const button=$("musicAdminRefresh");
  let checking=false;
  async function refresh(){
    if(checking)return;
    checking=true;button.disabled=true;data.hidden=true;tracks.replaceChildren();
    try{
      const bridge=window.NBLAccountBridge;
      if(!bridge)throw Error("NBL account connection is unavailable.");
      const clerk=await bridge.getClerk();
      if(!clerk?.isSignedIn)throw Error("Sign in to your NBL account first.");
      const token=await bridge.getToken();
      if(!token)throw Error("Your sign-in needs refreshing.");
      const reply=await fetch(endpoint,{
        method:"POST",mode:"cors",credentials:"omit",
        headers:{"content-type":"application/json","authorization":"Bearer "+token},
        body:JSON.stringify({action:"founder_stats"})
      });
      if(reply.status===403)throw Error("Only the verified Founder can view these records.");
      if(!reply.ok)throw Error("The music records are not ready.");
      const result=await reply.json();
      if(!result.ok||!Array.isArray(result.tracks))throw Error("The music records are not ready.");
      $("musicAdminTotal").textContent=Number(result.qualifiedListensTotal||0).toLocaleString();
      for(const t of result.tracks){
        const row=document.createElement("article");row.className="track-row";
        const text=document.createElement("span");text.className="track-meta";
        const name=document.createElement("strong");name.textContent=t.title+" — "+t.artist;
        const meta=document.createElement("span");meta.textContent=t.state+" · "+
          Number(t.sessionStarts||0)+" session starts · "+
          Number(t.qualifiedListens||0)+" qualified listens";
        text.append(name,meta);row.appendChild(text);tracks.appendChild(row);
      }
      data.hidden=false;
      status.textContent=result.tracks.length?"Record totals loaded.":"No records available yet.";
    }catch(error){status.textContent=error?.message||"Unavailable.";}
    finally{checking=false;button.disabled=false;}
  }
  button.addEventListener("click",refresh);
  refresh();
})();
