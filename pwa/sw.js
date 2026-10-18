// Service worker for the web (PWA) build. vite.config.mjs copies this file to
// dist/sw.js and fills in VERSION and PRECACHE. The KaiOS package does not use
// it: it is installed locally already.
//
// - The app shell (index.html, the modern JS/CSS chunks and images/) is cached
//   on install, so the app opens with no network.
// - Articles saved for offline reading live in IndexedDB
//   (src/res/SavedArticles.res); their images are in SAVED_IMAGE_CACHE, which
//   is served from here.

/* global __PRECACHE__ */
const VERSION = '__VERSION__'
const PRECACHE = __PRECACHE__
const SHELL_CACHE = 'shell-' + VERSION
const RUNTIME_CACHE = 'runtime'
// Must match imageCacheName in src/res/SavedArticles.res.
const SAVED_IMAGE_CACHE = 'saved-article-images'
const NAVIGATION_TIMEOUT = 4000

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(PRECACHE))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.indexOf('shell-') === 0 && key !== SHELL_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

const timeout = ms => new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error('timeout')), ms)
})

// Pages: the network first, so a new deployment shows up; the cached shell
// when offline or when the network is too slow.
const handleNavigation = request =>
  Promise.race([fetch(request), timeout(NAVIGATION_TIMEOUT)])
    .catch(() =>
      caches.match('index.html', { cacheName: SHELL_CACHE })
        .then(cached => cached || fetch(request))
    )

// Hashed assets and images never change under the same URL: cache first.
const handleAsset = request =>
  caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone()
      caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy))
    }
    return response
  }))

// Images of saved articles, whether requested by an <img> or a CSS background.
const handleWikimediaImage = request =>
  caches.open(SAVED_IMAGE_CACHE)
    .then(cache => cache.match(request.url, { ignoreVary: true }))
    .then(cached => cached || fetch(request))

const WIKIMEDIA_HOST = /(^|\.)(wikimedia|wikipedia)\.org$/

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(handleNavigation(request))
    } else if (/\/(assets|images)\/|\/manifest\.webmanifest$/.test(url.pathname)) {
      event.respondWith(handleAsset(request))
    }
    return
  }

  // Everything else (API calls, other images) goes straight to the network.
  if (request.destination === 'image' && WIKIMEDIA_HOST.test(url.hostname)) {
    event.respondWith(handleWikimediaImage(request))
  }
})
