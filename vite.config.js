import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'GardenX',
        short_name: 'GardenX',
        description: 'A school initiative to promote organic farming and healthy living. Order Now!',
        theme_color: '#2c604a',
        background_color: '#2c604a',
        start_url: '/',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.jpeg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: '/pwa-512x512.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
          {
            src: '/pwa-512x512.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any maskable'
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpeg,svg}'],
      }
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
