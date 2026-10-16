// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.jpg', 'favicon.ico'],

      /* ---------------- Manifest ---------------- */
      manifest: {
        name: 'Hammouda Shop Admin',
        short_name: 'Admin',
        description: 'Gère ta boutique où que tu sois.',
        start_url: '/admin/dashboard',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        lang: 'fr',
        dir: 'ltr',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      /* ---------------- Service worker ---------------- */
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,webp,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//],

        runtimeCaching: [
          /* Vite-built assets — cache-first, 1 year */
          {
            urlPattern: /^https?:\/\/[^/]+\/assets\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-v1',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          /* Uploaded images — cache-first, 30 days */
          {
            urlPattern: /\/uploads\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploads-v1',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          /* Analytics + dashboard — stale-while-revalidate, 10 min */
          {
            urlPattern: /\/api\/admin\/(analytics|dashboard)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-analytics-v1',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 10 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          /* Other admin GET requests — network-first, fall back to cache */
          {
            urlPattern: /\/api\/admin\/.*/i,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'api-admin-v1',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          /* Auth — never cache */
          {
            urlPattern: /\/api\/auth\/.*/i,
            handler: 'NetworkOnly',
          },

          /* Notifications unread count — never cache */
          {
            urlPattern: /\/api\/admin\/notifications\/unread-count/i,
            handler: 'NetworkOnly',
          },
        ],
      },

      /* ---------------- Dev ---------------- */
      devOptions: {
        enabled: false,
      },
    }),
  ],
})