import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9912
  },
  optimizeDeps: {
    include: ['@sopia-bot/core', 'crypto-js']
  }
})
