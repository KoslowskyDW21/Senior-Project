import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert() ],
  server: {
    port: 443,
    hmr: false,
    https: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
  // server: {
  //   https: {
  //     key: fs.readFileSync("key.pem"),
  //     cert: fs.readFileSync("cert.pem"),
  //   }
  // },
})
