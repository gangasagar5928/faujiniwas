import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 4000000,
        navigateFallbackDenylist: [/^\/.*\.html$/, /^\/app/]
      },
      manifest: false, // We already have a manifest in public/manifest.json
    }),
    {
      name: 'dev-server-app-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url, 'http://localhost');
          if (url.pathname === '/app' || url.pathname.startsWith('/app/')) {
            req.url = '/app.html' + url.search;
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    modulePreload: {
      resolveDependencies(filename, deps, { hostId }) {
        if (hostId && (hostId.includes('index.html') || hostId.includes('landing.jsx'))) {
          return deps.filter(dep => !dep.includes('leaflet') && !dep.includes('firebase') && !dep.includes('framer-motion'));
        }
        return deps;
      }
    },
    rollupOptions: {
      input: {
        main: './index.html',
        app: './app.html'
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet') || id.includes('react-leaflet-cluster')) {
            return 'leaflet';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          if (id.includes('node_modules/zustand')) {
            return 'zustand';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/@remix-run') || id.includes('node_modules/react-router')) {
            return 'router';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet', 'react-leaflet-cluster'],
  },
});

