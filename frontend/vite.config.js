import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {}
  },
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: false,
  },
})