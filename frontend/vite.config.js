import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend talks directly to the Pure Java backend on port 8080.
// No proxy needed — API_BASE_URL in config.js is set to http://localhost:8080
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
})
