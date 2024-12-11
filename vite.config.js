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
        name: 'OIS Organic Garden',
        short_name: 'OIS Garden',
        description: 'An initiative to promote organic farming and healthy living by GEMS OIS.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.jpeg',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.jpeg',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.jpeg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
});