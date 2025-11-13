import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to backend server in development
    // This prevents CORS issues and allows using relative URLs
    proxy: {
      '/api': {
        target: 'https://mini-store-erp-backend.onrender.com/api/v1',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
