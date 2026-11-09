// Public app shell only. NEVER cache identity, messages, or Supabase responses.
const CACHE = "nbl-messenger-shell-20261109-standalone";
const SHELL = ["/messenger/","/messenger/app.css","/messenger/messenger-skin.css","/messenger/app.js","/messenger/icon.svg","/messenger/manifest.webmanifest"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith("nbl-messenger-shell-") && name !== CACHE).map(name => caches.delete(name)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !SHELL.includes(url.pathname)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(() => caches.match(event.request)));
});

// Persistent message and incoming-call notifications. Never cache private content.
self.addEventListener("push", event => {
  event.waitUntil((async () => {
    let data={};
    try { data=event.data?.json()||{}; } catch { data={}; }
    const validId=typeof data.callId==="string"
      &&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.callId);
    const isCall=data.type==="video_call"&&validId;
    const title=isCall?"Incoming NBL video call":
      typeof data.title==="string"?data.title.slice(0,100):"NBL Messenger";
    const body=isCall?"Tap to answer the private video call.":
      typeof data.body==="string"?data.body.slice(0,140):"You have a new message.";
    // Destinations are assembled locally, never read from untrusted push URLs.
    const url=isCall?"/messenger/call.html?call="+encodeURIComponent(data.callId):"/messenger/";
    const tag=isCall?"nbl-video-"+data.callId:
      typeof data.tag==="string"&&/^nbl-messenger-[a-f0-9-]{36}$/.test(data.tag)
        ?data.tag:"nbl-messenger";
    const options={
      body,icon:"/messenger/icon.svg",badge:"/messenger/icon.svg",
      tag,renotify:true,data:{url},silent:false
    };
    if(isCall)options.actions=[{action:"answer",title:"Answer"}];
    await self.registration.showNotification(title,options);
  })());
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const saved=String(event.notification.data?.url||"");
    // Both the path and call ID must be safe even when another script sent push.
    const target=/^\/messenger\/call\.html\?call=[0-9a-f-]{36}$/i.test(saved)
      ?saved:"/messenger/";
    const url=new URL(target,self.location.origin).href;
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    // A call notification MUST open its own call link, not an unrelated chat tab.
    if(target!=="/messenger/"){await self.clients.openWindow(url);return;}
    const existing=windows.find(client=>{
      try{return new URL(client.url).origin===self.location.origin
        &&new URL(client.url).pathname.startsWith("/messenger/");}catch{return false;}
    });
    if(existing){await existing.focus();return;}
    await self.clients.openWindow(url);
  })());
});
