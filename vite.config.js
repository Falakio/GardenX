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
        "name": "GardenX",
        "short_name": "GardenX",
        "theme_color": "#2c604a",
        "background_color": "#2c604a",
        "display": "standalone",
        "scope": "/",
        "start_url": "/",
        "description": "GardenX is a platform for organic farming and healthy living.",
        "orientation": "portrait",
        "icons": [
          {
            "src": "apple-touch-icon.png",
            "sizes": "1024x1024"
          }
        ],
        "display_override": [
          "standalone",
          "fullscreen",
          "minimal-ui"
        ],
        "lang": "en",
        "dir": "ltr"
      },
    }),
  ],
  server: {
    port: 3000,
  },
});