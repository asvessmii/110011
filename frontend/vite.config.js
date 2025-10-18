import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
    host: '0.0.0.0',
    strictPort: false,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
  },
})