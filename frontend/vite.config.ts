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
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Where FastAPI runs!
        changeOrigin: true,
        // Rewrite is usually not needed with your setup, but can be added if needed:
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});