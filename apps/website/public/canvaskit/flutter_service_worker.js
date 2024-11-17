'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"ogp.png": "f3b0d658491711d999577906360e731b",
"flutter_bootstrap.js": "f9b8f987d39ad1abfd2b9c91fe21b205",
"version.json": "97a4eb23434b364e6755e56a665bb588",
"index.html": "b9c0b50cda1169b0ddf28ed9687e3777",
"/": "b9c0b50cda1169b0ddf28ed9687e3777",
"main.dart.js": "9db154cffa9ee67f349dfd200810dc28",
"flutter.js": "f393d3c16b631f36852323de8e583132",
"index.js": "77c1a3cd16b58857a9fab7ffca0a6049",
"index.css": "5d4a2472a82cff8f1bfc6e5249be68fd",
"_headers": "053a8cdbac61f12f09ec8cd70cc3d746",
"_routes.json": "a0b50c5d190bce56f18e0432c5f3e37c",
"_redirect": "56b663ecbad97bbdb849543579e7df85",
"assets/AssetManifest.json": "f3f7ef95342702614223656beaaf782b",
"assets/NOTICES": "607e6395c5b7719795a00c0c9a238346",
"assets/FontManifest.json": "ad5acd13cb05f7f43be3a5e808adc306",
"assets/AssetManifest.bin.json": "0258eff44752374508ab68840cea00a8",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "2030abeb36998c400245cc101c2ad98a",
"assets/fonts/MaterialIcons-Regular.otf": "18ede6bc549e7202646047ea75cb6ead",
"assets/assets/svg/products/medium.svg": "330c8b4fa9889e9677d92a408504c0fc",
"assets/assets/svg/products/github.svg": "6792afa85dd5d9650e877d7bff9dc813",
"assets/assets/svg/products/x.svg": "2a7a1f5a3934a9245f4b18d53765646d",
"assets/assets/svg/products/note.svg": "cd33b08f161f8dd877843c5c516ae265",
"assets/assets/svg/products/qiita.svg": "c564a29d40932add7e1535a9942664cf",
"assets/assets/svg/products/zenn.svg": "88266a9622048357aee8bc1cf7171b62",
"assets/assets/svg/products/discord.svg": "9dddb6280f60243145fa1c5c61cd3b6c",
"assets/assets/svg/bg_footer.svg": "4633f92a146f097b350615e583c1f2c5",
"assets/assets/svg/bg_top.svg": "84e3560646b1f64683df8a0e20881ce3",
"assets/assets/svg/bg_bottom.svg": "855aad791299931fcc04027e18ec5e09",
"assets/assets/svg/flutter_icon.svg": "6ad10f687d4224a1bb29b6484d45f96a",
"assets/assets/images/icon.webp": "de56943cb9ae0250ae34f5f48ac6cb2b",
"assets/assets/images/dash.webp": "051816d487067d5c8e73068313d89db2",
"assets/assets/fonts/NotoSansJP/NotoSansJP-Regular.otf": "9c2cc6fe1f598328c265633e0464b4ca",
"assets/assets/fonts/NotoSansJP/NotoSansJP-Medium.otf": "f9a2e2cb6e93aa8ec452ad48c0954e4b",
"assets/assets/fonts/NotoSansJP/NotoSansJP-Bold.otf": "080526524381a9d25bd47c5ca085de0f",
"assets/assets/fonts/NotoSansJP/OFL.txt": "6c7802e99b3d76592e59e8d703e5c0f0",
"assets/assets/fonts/Poppins/Poppins-Medium.ttf": "bf59c687bc6d3a70204d3944082c5cc0",
"assets/assets/fonts/Poppins/OFL.txt": "17293189e4ca3f79c0bcca524d41ba52",
"assets/assets/fonts/Poppins/Poppins-Regular.ttf": "093ee89be9ede30383f39a899c485a82",
"assets/assets/fonts/Poppins/Poppins-Bold.ttf": "08c20a487911694291bd8c5de41315ad",
"canvaskit/skwasm.js": "694fda5704053957c2594de355805228",
"canvaskit/skwasm.js.symbols": "262f4827a1317abb59d71d6c587a93e2",
"canvaskit/canvaskit.js.symbols": "48c83a2ce573d9692e8d970e288d75f7",
"canvaskit/skwasm.wasm": "9f0c0c02b82a910d12ce0543ec130e60",
"canvaskit/chromium/canvaskit.js.symbols": "a012ed99ccba193cf96bb2643003f6fc",
"canvaskit/chromium/canvaskit.js": "671c6b4f8fcc199dcc551c7bb125f239",
"canvaskit/chromium/canvaskit.wasm": "b1ac05b29c127d86df4bcfbf50dd902a",
"canvaskit/canvaskit.js": "66177750aff65a66cb07bb44b8c6422b",
"canvaskit/canvaskit.wasm": "1f237a213d7370cf95f443d896176460",
"canvaskit/skwasm.worker.js": "89990e8c92bcb123999aa81f7e203b1c"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
