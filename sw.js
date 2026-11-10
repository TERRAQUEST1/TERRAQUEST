// TERRAQUEST service worker. При каждом новом релизе меняй номер версии V.
const V='tq-0.3.6';
const THREE='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled([...SHELL.map(u=>c.add(u)),c.add(THREE)])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.href===THREE){
    e.respondWith(caches.match(r,{ignoreVary:true}).then(m=>m||fetch(r).then(x=>{const cp=x.clone();caches.open(V).then(c=>c.put(r,cp));return x;})));
    return;
  }
  if(u.origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{
    const m=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(x=>{if(x&&x.ok)c.put(r,x.clone());return x;}).catch(()=>null);
    if(m){e.waitUntil(net);return m;}
    const x=await net;
    return x||(r.mode==='navigate'?c.match('index.html'):Response.error());
  }));
});
