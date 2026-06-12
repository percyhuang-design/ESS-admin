import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // 與 Aligner (5173) 錯開,兩個專案可同時開
    host: true,
  },
})
