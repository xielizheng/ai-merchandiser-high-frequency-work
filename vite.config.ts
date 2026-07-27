import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.SITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.tunnelmole.net'],
  },
})
