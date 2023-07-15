import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/template-admin/',
  resolve: {
    alias: {
      '@src': '/src',
    }
  },
  logLevel: 'info',
  server: {
    port: 4001,
    host: true,
    proxy: {
      '/template-admin/api': {
        target: 'http://127.0.0.1:3000/',
        ws: true,
        rewrite: (path) => path.replace(/^\/template-admin\/api/, '')
      }
    }
  },
})
