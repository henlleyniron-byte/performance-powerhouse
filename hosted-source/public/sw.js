const CACHE='powerhouse-v4-community-2';
const ASSETS=['./','./index.html','./community-share.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./physics-intelligence/','./physics-intelligence/index.html','./physics-intelligence/styles.css','./physics-intelligence/app.js','./physics-intelligence/assets/physics-intelligence-data.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
