import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        globIgnores: ['**/home.html'],
        maximumFileSizeToCacheInBytes: 4000000,
        navigateFallbackDenylist: [/^\/home\.html/]
      },
      manifest: false, // We already have a manifest in public/manifest.json
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet') || id.includes('react-leaflet-cluster')) {
            return 'leaflet';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/zustand')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet', 'react-leaflet-cluster'],
  },
});

