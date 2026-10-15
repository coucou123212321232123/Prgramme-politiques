import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Application installable (PWA) : manifeste, service worker, fonctionnement hors ligne.
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: './',
        name: 'Présidentielle 2027 – Comparateur de programmes',
        short_name: 'Présidentielle 27',
        description:
          'Outil indépendant et non officiel pour consulter et comparer, thème par thème, les programmes des candidats à la présidentielle 2027.',
        lang: 'fr',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        background_color: '#f7f7f5',
        theme_color: '#17171a',
        categories: ['news', 'education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
        shortcuts: [
          { name: 'Comparateur', short_name: 'Comparer', url: './#/comparateur', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Tous les thèmes', short_name: 'Thèmes', url: './#/themes', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Programmes', url: './#/programmes', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  // Chemins relatifs : l'app peut être servie depuis n'importe quel sous-dossier (GitHub Pages…).
  base: './',
  build: { chunkSizeWarningLimit: 800 },
});
