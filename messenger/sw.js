// Public app shell only. NEVER cache identity, messages, or Supabase responses.
const CACHE = "nbl-messenger-shell-20261031-phone-alert";
const SHELL = ["/messenger/","/messenger/app.css","/messenger/app.js","/messenger/icon.svg","/messenger/manifest.webmanifest"];
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

// Existing NBL Messenger service worker now displays persistent browser push.
// It never caches private threads, tokens, message text, or notification payloads.
self.addEventListener("push", event => {
  event.waitUntil((async () => {
    let data={};
    try { data=event.data?.json()||{}; } catch { data={}; }
    const title=typeof data.title==="string"?data.title.slice(0,100):"NBL Messenger";
    const body=typeof data.body==="string"?data.body.slice(0,140):"You have a new message.";
    // Notification destinations are always on this Messenger origin and path.
    const url="/messenger/";
    const tag=typeof data.tag==="string"&&/^nbl-messenger-[a-f0-9-]{36}$/.test(data.tag)
      ? data.tag : "nbl-messenger";
    await self.registration.showNotification(title,{
      body,icon:"/messenger/icon.svg",badge:"/messenger/icon.svg",
      tag,renotify:true,data:{url},silent:false
    });
  })());
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const url=new URL("/messenger/",self.location.origin).href;
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    const existing=windows.find(client=>{
      try{return new URL(client.url).origin===self.location.origin
        &&new URL(client.url).pathname.startsWith("/messenger/");}catch{return false;}
    });
    if(existing){await existing.focus();return;}
    await self.clients.openWindow(url);
  })());
});
