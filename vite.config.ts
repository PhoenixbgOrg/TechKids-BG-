
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Важно: Това позволява сайтът да работи в подпапка на GitHub (https://user.github.io/repo/)
})
