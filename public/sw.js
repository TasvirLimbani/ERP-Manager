// const CACHE_NAME = 'fair-method-v1'
// const URLS_TO_CACHE = [
//   '/',
//   '/dashboard',
//   '/offline.html',
// ]

// // Install event - cache resources
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(URLS_TO_CACHE)
//     })
//   )
// })

// // Activate event - clean up old caches
// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             return caches.delete(cacheName)
//           }
//         })
//       )
//     })
//   )
// })

// // Fetch event - network first with cache fallback
// self.addEventListener('fetch', (event) => {
//   if (event.request.method !== 'GET') {
//     return
//   }

//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         if (!response || response.status !== 200 || response.type === 'error') {
//           return response
//         }

//         const responseToCache = response.clone()
//         caches.open(CACHE_NAME).then((cache) => {
//           cache.put(event.request, responseToCache)
//         })

//         return response
//       })
//       .catch(() => {
//         return caches.match(event.request).then((response) => {
//           return response || new Response('Offline - Resource not available', { status: 503 })
//         })
//       })
//   )
// })



const CACHE_NAME = 'fair-method-v2'

// ✅ Install - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// ✅ Activate - clean old caches + take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    )
  )
  self.clients.claim()
})

// ✅ Fetch - NETWORK FIRST (no aggressive caching)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response // ✅ always fresh data
      })
      .catch(() => {
        return caches.match(event.request) || new Response('Offline', { status: 503 })
      })
  )
})