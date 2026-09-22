/*
 * Service worker SILABNU.
 * Menyimpan kerangka aplikasi (halaman pembungkus dan ikon) agar aplikasi dapat
 * diinstal dan tetap terbuka saat koneksi lemah. Isi SILABNU sendiri berasal
 * dari Apps Script dan selalu dimuat langsung dari server, tidak disimpan di sini.
 */
const VERSI_CACHE = 'silabnu-v7';
const BERKAS_INTI = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSI_CACHE).then(cache => cache.addAll(BERKAS_INTI)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Buang cache versi lama
  event.waitUntil(
    caches.keys().then(kunci => Promise.all(
      kunci.filter(k => k !== VERSI_CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Hanya berkas milik situs pembungkus yang ditangani; Apps Script dibiarkan langsung
  if (url.origin !== self.location.origin) return;

  // Halaman: ambil yang terbaru, pakai simpanan bila luring
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Ikon dan berkas lain: pakai simpanan lebih dulu
  event.respondWith(
    caches.match(event.request).then(simpan => simpan || fetch(event.request))
  );
});
