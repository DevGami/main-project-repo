import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Build directly into FastAPI's static directory
    outDir: path.resolve(__dirname, '../static'),
    emptyOutDir: true,
  },
  server: {
    // Proxy API calls to FastAPI during dev
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
