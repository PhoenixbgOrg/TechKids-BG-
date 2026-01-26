import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/TechKids-BG-/',  // точно с тирето и големи/малки букви както е repo-то!
})
