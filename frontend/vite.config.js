import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3011',
      '/notes': 'http://localhost:3011',
      '/tasks': 'http://localhost:3011',
      '/links': 'http://localhost:3011',
      '/logs':  'http://localhost:3011',
    }
  }
})
