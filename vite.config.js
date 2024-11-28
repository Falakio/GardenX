import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Babel configuration for Fast Refresh
      babel: {
        plugins: [
          '@babel/plugin-transform-react-jsx',
        ],
      },
      // Fast Refresh options
      fastRefresh: true,
    }),
  ],
  server: {
    port: 3000,
    hmr: {
      overlay: true,
      // Force server-side HMR for client components
      clientPort: 3000,
    },
  },
})
