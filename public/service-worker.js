const FILES_TO_CACHE = [
  `/`,
  `/index.html`,
  `index.js`,
  `manifest.webManifest`,
  `service-worker.js`,
  `style.css`,
];

const CACHE_NAME = `static-cache-v2`;
const DATA_CACHE_NAME = `data-cache-v1`;

// install
self.addEventListener(`install`, (event) => {
  console.log(`begin install`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`Your files were pre-cached successfully!`);
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// activate
self.addEventListener(`activate`, (event) => {
  console.log(`begin activate`);
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            Console.log(`Removing old cache data`, key);
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );

  self.ClientRectList.claim();
});

// fetch
self.addEventListener(`fetch`, (event) => {
  console.log(`begin fetch`);
  // cache successful requests to the API
  if (event.request.url.includes(`/`)) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) =>
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, responses.clone());
              }

              return response;
            })
            .catch((err) => {
              cache.match(event.request);
              console.error(err);
            })
        )
        .catch((err) => console.error(err))
    );
  } else {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request))
        .catch((err) => console.error(err))
    );
  }
});
