import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/rh-app/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('pdfjs-dist')) return 'pdf-worker'
          if (id.includes('node_modules') && (id.includes('react') || id.includes('router'))) return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5176,
    strictPort: true,
    host: '0.0.0.0',
  },
})
