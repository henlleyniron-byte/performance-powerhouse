const CACHE='powerhouse-v8-subject-intelligence-20261014';
const ASSETS=['./chemistry-intelligence/index.html','./chemistry-intelligence/source-audit.json','./biology-intelligence/index.html','./biology-intelligence/source-audit.json','./subject-intelligence/styles.css','./subject-intelligence/model.js','./subject-intelligence/app.js','./powerhouse/planning.js','./powerhouse/planning-ui.js','./powerhouse/planning.css','./powerhouse/verification.js','./powerhouse/verification-ui.js','./powerhouse/model.js','./powerhouse/app.js','./powerhouse/styles.css','./index.html','./evidence-rules.js','./al-performance-command-centre.html','./community-share.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./study-tracker/','./study-tracker/index.html','./study-tracker/styles.css','./study-tracker/app.js','./resource-desk/index.html','./resource-desk/styles.css','./resource-desk/app.js','./resource-desk/catalogue.json','./resource-desk/biology-review-queue.json','./resource-desk/biology-review-queue.csv','./physics-intelligence/','./physics-intelligence/index.html','./physics-intelligence/styles.css','./physics-intelligence/app.js','./physics-intelligence/assets/physics-intelligence-data.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('powerhouse-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
async function fetchOnline(request){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{return await fetch(request,{signal:controller.signal})}finally{clearTimeout(timer)}}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/signin')||url.pathname.startsWith('/signout')||url.pathname.startsWith('/auth/')||url.pathname.startsWith('/oauth/')||url.pathname==='/callback')return;
  event.respondWith(fetchOnline(event.request).then(response=>{
    if(response.ok&&!response.redirected&&response.type!=='opaque'&&new URL(response.url).origin===self.location.origin&&!/private|no-store/i.test(response.headers.get('cache-control')||'')){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}));}
    return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate'){const directory=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;const page=await caches.match(directory);return page||new Response('This page is not available offline. Reconnect to load it.',{status:503,headers:{'content-type':'text/plain;charset=utf-8'}})}
    return new Response('Offline asset unavailable',{status:503});
  }));
});
