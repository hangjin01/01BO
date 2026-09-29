import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      base: './',
      server: {
        port: 5173,
        host: '127.0.0.1',
        proxy: { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false } },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
