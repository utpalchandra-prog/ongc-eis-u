// ═══════════════════════════════════════════════════════════════════
// CACHE NAME IS DERIVED FROM THE '?v=' QUERY STRING USED WHEN THIS
// FILE WAS REGISTERED (see index.html: sw.js?v=<APP_VERSION>).
// This means the cache name always tracks index.html's single
// APP_VERSION constant automatically — nothing needs to be hand-edited
// in this file on every release, so it can never drift out of sync
// with the UI version badge again.
// ═══════════════════════════════════════════════════════════════════
var SW_VERSION = (function(){
  try{
    var m = self.location.search.match(/[?&]v=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : 'v0';
  }catch(e){ return 'v0'; }
})();
var CACHE = 'ongc-eis-' + SW_VERSION;
var ASSETS = [
  '/ongc-eis-u/',
  '/ongc-eis-u/index.html',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url=e.request.url;
  var isHTML=url.indexOf('.html')!==-1||url.endsWith('/ongc-eis-u/')||url.endsWith('/ongc-eis-u');
  if(isHTML){
    e.respondWith(fetch(e.request).then(function(r){
      var c=r.clone();
      caches.open(CACHE).then(function(cache){cache.put(e.request,c);});
      return r;
    }).catch(function(){return caches.match(e.request);}));
  } else {
    e.respondWith(caches.match(e.request).then(function(cached){
      return cached||fetch(e.request).then(function(r){
        var c=r.clone();
        caches.open(CACHE).then(function(cache){cache.put(e.request,c);});
        return r;
      });
    }));
  }
});
