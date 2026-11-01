import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      base: './',
      server: {
        port: 5173,
        host: '127.0.0.1',
        // Keep browser cookies first-party during localhost development.
        proxy: { '/api': { target: 'https://api.01bo.cloud', changeOrigin: true, secure: true } },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
