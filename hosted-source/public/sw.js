const CACHE='powerhouse-v6-evidence-20261007';
const ASSETS=['./powerhouse/model.js','./powerhouse/app.js','./powerhouse/styles.css','./index.html','./evidence-rules.js','./al-performance-command-centre.html','./community-share.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./study-tracker/','./study-tracker/index.html','./study-tracker/styles.css','./study-tracker/app.js','./resource-desk/index.html','./resource-desk/styles.css','./resource-desk/app.js','./resource-desk/catalogue.json','./resource-desk/biology-review-queue.json','./resource-desk/biology-review-queue.csv','./physics-intelligence/','./physics-intelligence/index.html','./physics-intelligence/styles.css','./physics-intelligence/app.js','./physics-intelligence/assets/physics-intelligence-data.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('powerhouse-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||['/signin-with-chatgpt','/signout-with-chatgpt','/callback'].includes(url.pathname))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok&&response.type!=='opaque'&&new URL(response.url).origin===self.location.origin&&!response.headers.get('cache-control')?.includes('private')){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}));}
    return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate')return await caches.match('./index.html')||new Response('Offline. Reconnect to load this page.',{status:503});
    return new Response('Offline asset unavailable',{status:503});
  }));
});
