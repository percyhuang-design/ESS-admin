import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// build 用 /ESS-admin/ (GitHub Pages 專案頁子路徑);dev 維持 / (本地 preview 不受影響)
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ESS-admin/' : '/',
  plugins: [react()],
  server: {
    port: 5174, // 與 Aligner (5173) 錯開,兩個專案可同時開
    host: true,
  },
}))
