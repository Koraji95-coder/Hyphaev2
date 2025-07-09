import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your FastAPI backend
        changeOrigin: true,
        ws: true,
        secure: false,                   // <-- allow HTTP / self-signed certs in dev
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // optional
      },
    },
  },
});
