import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Remove http-proxy-middleware import if present
// import { createProxyMiddleware } from 'http-proxy-middleware';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000, // Or let Vite pick automatically by removing this line
    // Remove any 'proxy' or 'configure' properties here
  },
});