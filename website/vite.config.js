import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pages için göreceli path
  build: {
    outDir: '../docs', // Ana dizindeki docs klasörüne çıktı ver
    emptyOutDir: true
  }
})
