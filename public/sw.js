// Service Worker for EchoNow
// Provides offline support and caching for better performance

const CACHE_NAME = 'echonow-v1'
const STATIC_CACHE = 'echonow-static-v1'
const DYNAMIC_CACHE = 'echonow-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical static assets
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/auth\//,
  /^\/api\/dashboard\/stats$/,
  /^\/api\/content\/recent$/,
]

// Files that should always be fetched fresh
const NO_CACHE_PATTERNS = [
  /^\/api\/ai\/generate/,
  /^\/api\/webhooks\//,
  /^\/api\/auth\/session$/,
]

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip requests that should not be cached
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return
  }

  // Handle static files
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
        })
    )
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // Check if this API should be cached
    const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
    
    if (shouldCache) {
      event.respondWith(
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            return cache.match(request)
              .then((response) => {
                if (response) {
                  // Return cached response and update in background
                  fetch(request)
                    .then((fetchResponse) => {
                      if (fetchResponse.ok) {
                        cache.put(request, fetchResponse.clone())
                      }
                    })
                    .catch(() => {
                      // Ignore fetch errors for background updates
                    })
                  
                  return response
                }
                
                // No cache, fetch and cache
                return fetch(request)
                  .then((fetchResponse) => {
                    if (fetchResponse.ok) {
                      cache.put(request, fetchResponse.clone())
                    }
                    return fetchResponse
                  })
                  .catch(() => {
                    // Return a fallback response for API errors
                    return new Response(
                      JSON.stringify({ error: 'Offline - cached data not available' }),
                      {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'application/json' }
                      }
                    )
                  })
              })
          })
      )
    }
    return
  }

  // Handle page requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }
        
        return fetch(request)
          .then((fetchResponse) => {
            // Don't cache non-successful responses
            if (!fetchResponse.ok) {
              return fetchResponse
            }
            
            // Cache page responses
            if (fetchResponse.headers.get('content-type')?.includes('text/html')) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone())
                })
            }
            
            return fetchResponse
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('/')
              .then((fallback) => {
                return fallback || new Response(
                  '<h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p>',
                  {
                    headers: { 'Content-Type': 'text/html' }
                  }
                )
              })
          })
      })
  )
})

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag)
  
  if (event.tag === 'background-content-generation') {
    event.waitUntil(
      // Handle offline content generation requests
      handleOfflineContentGeneration()
    )
  }
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      actions: [
        {
          action: 'open',
          title: 'Open EchoNow'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        url: data.url || '/'
      }
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'EchoNow', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/'
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus()
            }
          }
          
          // If not, open a new window/tab
          if (clients.openWindow) {
            return clients.openWindow(url)
          }
        })
    )
  }
})

// Utility function for handling offline content generation
async function handleOfflineContentGeneration() {
  try {
    // Get pending requests from IndexedDB or localStorage
    // This would contain requests that were made while offline
    const pendingRequests = await getPendingRequests()
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.data)
        })
        
        if (response.ok) {
          // Request succeeded, remove from pending
          await removePendingRequest(request.id)
          
          // Notify the user
          await self.registration.showNotification('Content Generated', {
            body: 'Your offline content request has been processed!',
            icon: '/icons/icon-192x192.png',
            data: { url: '/dashboard' }
          })
        }
      } catch (error) {
        console.error('Failed to process offline request:', error)
      }
    }
  } catch (error) {
    console.error('Error handling offline content generation:', error)
  }
}

// Placeholder functions for request management
async function getPendingRequests() {
  // Implementation would depend on your offline storage strategy
  return []
}

async function removePendingRequest(id) {
  // Implementation would depend on your offline storage strategy
  console.log('Removing pending request:', id)
}