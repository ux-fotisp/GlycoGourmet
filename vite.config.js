import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'recipe_detail_desktop.png'],
      manifest: {
        name: 'GlycoGourmet Patient Portal',
        short_name: 'GlycoGourmet',
        description: 'Deterministic clinical-grade dietary prescription and metabolic forecasting ecosystem',
        theme_color: '#1B3B22',
        background_color: '#F6F4EE',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          {
            src: 'recipe_detail_desktop.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'recipe_detail_desktop.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Deterministic metabolic & excursion calculations / assets
            urlPattern: /.*(?:metabolicEngine|excursionEngine|recommendationEngine).*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'clinical-math-engines',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
            },
          },
          {
            // Strapi API clinical records (Meal Plans, Client Profiles, Ingredients, Recipes)
            urlPattern: /^https?:\/\/.*\/api\/(?:client-profiles|prescribed-meal-plans|recipes|ingredients|clinics).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'strapi-clinical-data',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
