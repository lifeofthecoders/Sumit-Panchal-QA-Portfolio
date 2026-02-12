import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Sumit-Panchal-QA-Portfolio/',
  plugins: [react()],

  build: {
    chunkSizeWarningLimit: 1000,
  },

})

