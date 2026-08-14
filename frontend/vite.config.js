import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // <-- Add this line so relative asset paths load correctly
  server: {
    host: true,
    allowedHosts: [
      'ophitic-deloris-streaky.ngrok-free.dev'
    ]
  }
})