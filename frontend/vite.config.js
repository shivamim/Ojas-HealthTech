import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    // Brotli pre-compression - 15-25% better than gzip
    compression({ 
      algorithm: 'brotliCompress', 
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
    // Gzip fallback for older browsers
    compression({ 
      algorithm: 'gzip', 
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    // FIX: Disable sourcemaps in production - prevents source code exposure
    sourcemap: process.env.NODE_ENV !== 'production',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Charts library (large, separate chunk)
          charts: ['recharts'],
          // Data fetching
          query: ['@tanstack/react-query'],
          // UI icons
          ui: ['lucide-react'],
          // Utilities
          utils: ['date-fns', 'axios'],
        }
      }
    }
  }
})
