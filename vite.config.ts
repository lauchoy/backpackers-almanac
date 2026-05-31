import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Backpacker\'s Almanac — Yosemite North Rim',
        short_name: 'North Rim',
        description: 'Interactive trip companion for Yosemite North Rim backpacking',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,pmtiles}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'openmeteo-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.weather\.gov\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'nws-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/nps': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
