//Service Worker
// Konstanten für Cache-Namen und Ressourcen
const CACHE_NAME = 'stirnsuende-cache-v1';
const RESOURCES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.png',
    '/script.js',
    '/style.css'
];

self.addEventListener('install', event => {
    console.log('Service Worker wird installiert...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache =>
            {
                console.log('Cache angelegt...');
                return cache.addAll(RESOURCES_TO_CACHE);
            })
            .catch(error =>
            {
                console.error('Fehler beim Caching der Ressourcen:', error);
            })
    );

    self.skipWaiting(); // Aktiviert den Service Worker sofort nach der Installation
});

//Aktivieren des Service Workers
self.addEventListener('activate', event => {
    console.log('Service Worker aktiviert...');
    // Alte Caches löschen
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                        return cacheName !== CACHE_NAME;})
                    .map(cacheName => {
                        console.log('Alter Cache wird gelöscht:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    return self.clients.claim(); // Macht den Service Worker sofort aktiv für alle Clients
});

self.addEventListener('fetch', event => {
    console.log('Fetch-Anfrage abgefangen:', event.request.url);

    event.respondWith(
        // Überprüfen, ob die Anfrage im Cache vorhanden ist
        caches.match(event.request)
            .then(cachedResponse => {
                // Wenn die Anfrage im Cache vorhanden ist, gebe die gecachte Antwort zurück
                if (cachedResponse) {
                    console.log('Gecachte Antwort gefunden:', event.request.url);
                    return cachedResponse;
                }
                // Andernfalls die Anfrage an das Netzwerk senden
                console.log('Netzwerkanfrage für:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Überprüfen, ob die Antwort gültig ist
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // Kopiere (Klonen) die Antwort, um sie im Cache zu speichern
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                console.log('Antwort wird im Cache gespeichert:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch fehlgeschlagen:', error);
                        // Optional: Hier könnte eine Offline-Seite zurückgegeben werden
                        return new Response('Offline Modus: Diese Ressource ist nicht verfügbar');
            });
        })
    );
});