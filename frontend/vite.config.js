import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  rollupOptions: {
    external: ['prop-types']
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://chat-reenbit2024-tgnx.vercel.app/?vercelToolbarCode=EZEXpaz28BjDgFp',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: process.env.VITE_SOCKET_URL || 'https://chat-reenbit2024-tgnx.vercel.app/?vercelToolbarCode=EZEXpaz28BjDgFp',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
