import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base works for GitHub Pages under any repo name
export default defineConfig({
  base: './',
  plugins: [react()],
})
