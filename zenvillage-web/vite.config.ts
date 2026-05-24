import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo-icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'ZenAndVillage',
        short_name: 'ZenAndVillage',
        description: 'Connected Communities. Intelligent Operations. Peaceful Living.',
        theme_color: '#0d9488',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png',              sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',            sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',            sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png',  sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // App shell — CacheFirst
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' },
          },
          {
            // API GET requests — NetworkFirst with 10s timeout
            urlPattern: ({ request, url }) =>
              request.method === 'GET' && url.pathname.startsWith('/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 200, maxAgeSeconds: 300 },
              // Sensitive endpoints served NetworkOnly
              plugins: [],
            },
          },
          {
            // S3 uploads — StaleWhileRevalidate
            urlPattern: /^https:\/\/.*\.s3\..*\.amazonaws\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 's3-uploads-cache' },
          },
        ],
        // POST/PATCH/DELETE are NetworkOnly by default (not cached)
        navigateFallback: '/index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
