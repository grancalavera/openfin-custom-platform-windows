import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '192.168.68.65',
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        provider: resolve(__dirname, 'provider.html'),
        platformWindow: resolve(__dirname, 'platform-window.html'),
      },
    },
  },
})
