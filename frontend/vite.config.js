import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In Docker the backend is reachable as http://backend:5000 from the frontend
// container. Locally (npm run dev without Docker) it is http://localhost:5000.
const target = process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow any host header (Docker VM IP, tunnels, live previews, ...)
    allowedHosts: true,
    proxy: {
      '/api': { target, changeOrigin: true },
      '/uploads': { target, changeOrigin: true },
      '/health': { target, changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});
