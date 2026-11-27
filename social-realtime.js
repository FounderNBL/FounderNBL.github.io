/* NBL Social private Realtime notification client.
   Never sends messages or exposes protected social data through Realtime.
   Existing nbl-social API is the only message reader/writer.
   Falls back to authenticated auto-refresh if the project's Clerk third-party
   JWT integration has not been enabled for Realtime yet.
*/
(()=>{
"use strict";
const URL="https://tvypdakofcrlvnwporhh.supabase.co";
const PUBLISHABLE_KEY="sb_publishable_IuiM2Ee9gJp9Vchozncc2Q_PfFkqogl";
const SDK="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js";
let sdkPromise=null;
async function loadSDK(){
  if(window.supabase?.createClient)return window.supabase;
  if(sdkPromise)return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
    const tag=document.createElement("script");tag.src=SDK;tag.async=true;
    tag.crossOrigin="anonymous";
    tag.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error("Supabase Realtime SDK unavailable"));
    tag.onerror=()=>reject(new Error("Supabase Realtime SDK download failed"));
    document.head.append(tag);
  });
  sdkPromise=sdkPromise.catch(error=>{sdkPromise=null;throw error;});
  return sdkPromise;
}
function watchTopic(topic,getToken,onRefresh){
  if(!/^nbl-social:(thread:[0-9a-f-]{36}|inbox:[a-zA-Z0-9_-]{3,128})$/.test(String(topic||"")))return ()=>{};
  let active=true,subscribed=false,client=null,channel=null,refreshPending=false,connecting=false,tokenRefreshing=false;
  let lastFetched=Date.now(),lastReconnect=0,tokenUpdated=0;
  const notify=()=>{
    if(!active||document.hidden||refreshPending)return;
    refreshPending=true;
    Promise.resolve().then(async()=>{if(active)await onRefresh();})
      .catch(()=>{})
      .finally(()=>{lastFetched=Date.now();refreshPending=false;});
  };
  function dropConnection(){
    const oldClient=client,oldChannel=channel;
    channel=null;client=null;subscribed=false;
    if(oldClient){
      const removed=oldChannel?Promise.resolve().then(()=>oldClient.removeChannel(oldChannel)):Promise.resolve();
      void removed.catch(()=>{}).finally(()=>{try{oldClient.realtime.disconnect();}catch{}});
    }
  }
  async function connect(){
    if(!active||channel||connecting||Date.now()-lastReconnect<45000)return;
    connecting=true;lastReconnect=Date.now();
    try{
      const sdk=await loadSDK();if(!active)return;
      const token=await getToken();if(!active||!token)return;
      client=sdk.createClient(URL,PUBLISHABLE_KEY,{
        auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false},
        realtime:{params:{eventsPerSecond:5}}
      });
      const ownClient=client;
      await ownClient.realtime.setAuth(token);if(!active||client!==ownClient)return;
      const ownChannel=ownClient.channel(topic,{config:{private:true}});
      channel=ownChannel;
      ownChannel.on("broadcast",{event:"changed"},()=>{if(channel===ownChannel)notify();})
        .subscribe(state=>{
          if(!active||channel!==ownChannel)return;
          subscribed=state==="SUBSCRIBED";
          if(subscribed)notify();
          if(state==="CHANNEL_ERROR"||state==="TIMED_OUT"||state==="CLOSED")dropConnection();
        });
      tokenUpdated=Date.now();
    }catch{dropConnection();}finally{connecting=false;}
  }
  const pulse=window.setInterval(()=>{
    if(!active||document.hidden)return;
    if(!subscribed&&Date.now()-lastFetched>14000)notify();
    if(subscribed&&Date.now()-lastFetched>60000)notify();
    if(!channel&&Date.now()-lastReconnect>45000)void connect();
    if(client&&channel&&!tokenRefreshing&&Date.now()-tokenUpdated>90000){
      const ownClient=client,ownChannel=channel;
      tokenRefreshing=true;
      void Promise.resolve().then(getToken).then(token=>{
        if(!active||client!==ownClient||channel!==ownChannel)return;
        if(!token){dropConnection();return;}
        tokenUpdated=Date.now();return ownClient.realtime.setAuth(token);
      }).catch(()=>{if(client===ownClient&&channel===ownChannel)dropConnection();}).finally(()=>{tokenRefreshing=false;});
    }
  },4000);
  const visible=()=>{
    if(active&&!document.hidden){notify();if(!subscribed&&!channel)void connect();}
  };
  document.addEventListener("visibilitychange",visible);
  window.addEventListener("online",visible);
  void connect();
  return ()=>{
    active=false;subscribed=false;
    window.clearInterval(pulse);
    document.removeEventListener("visibilitychange",visible);
    window.removeEventListener("online",visible);
    dropConnection();
  };
}
function watchThread(threadId,getToken,onRefresh){
  const id=String(threadId||"");
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return ()=>{};
  return watchTopic("nbl-social:thread:"+id,getToken,onRefresh);
}
function watchInbox(clerkUserId,getToken,onRefresh){
  const id=String(clerkUserId||"");
  if(!/^[a-zA-Z0-9_-]{3,128}$/.test(id))return ()=>{};
  return watchTopic("nbl-social:inbox:"+id,getToken,onRefresh);
}
window.NBLSocialRealtime={watchThread,watchInbox};
})();
