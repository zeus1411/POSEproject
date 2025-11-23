import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: false, // Cho phép fallback sang port khác nếu 5173 bị chiếm
      host: '0.0.0.0', // Cho phép truy cập từ mạng local
      open: true, // Tự mở browser khi start
      cors: true,
      // Proxy API requests to backend
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      // Đảm bảo env vars được define đúng
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
})
