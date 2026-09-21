const CACHE='powerhouse-v5-20260908-1';
const ASSETS=[
  './','./index.html','./v5.css','./v5-additions.js','./community-share.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './study-tracker/','./study-tracker/index.html','./study-tracker/tracker.css','./study-tracker/tracker.js',
  './physics-intelligence/','./physics-intelligence/index.html','./physics-intelligence/styles.css','./physics-intelligence/app.js','./physics-intelligence/assets/physics-intelligence-data.json'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response && response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request,{ignoreSearch:true});if(cached)return cached;
    if(event.request.mode==='navigate'){
      if(url.pathname.includes('/study-tracker'))return caches.match('./study-tracker/index.html');
      if(url.pathname.includes('/physics-intelligence'))return caches.match('./physics-intelligence/index.html');
      return caches.match('./index.html');
    }
    return Response.error();
  }));
});
