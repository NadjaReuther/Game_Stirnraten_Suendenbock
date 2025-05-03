//Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('stirnraten-cache').then(cache =>
        {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/icon.png',
                '/script.js',
                '/words.json'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});