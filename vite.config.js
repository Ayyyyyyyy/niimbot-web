import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// Load self-signed certificates (Fallback method - you can likely remove this block if using mkcert)
const loadCerts = () => {
  const certDir = path.join(process.cwd(), '.certs')
  const keyPath = path.join(certDir, 'key.pem')
  const certPath = path.join(certDir, 'cert.pem')

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    // ✅ ENABLED: Automatically generates valid HTTPS certs
    mkcert({
      // Adding your IP here ensures the cert works when accessing from mobile/LAN
      hosts: ['localhost', '10.0.0.40']
    }),
  ],
  server: {
    host: true, // Exposes server to LAN (0.0.0.0)
    port: 5173,
    strictPort: false, // <--- ALLOWS auto-switching to 5174, 5175...
    https: true,


    // Proxy Ollama API to bypass CORS
    proxy: {
      '/api/ollama': {
        target: 'http://10.0.0.40:11434',
        changeOrigin: true,
        secure: false, // Allow HTTPS frontend to talk to HTTP backend
        rewrite: (path) => path.replace(/^\/api\/ollama/, '/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('referer')
            console.log('Proxying:', req.method, req.url)
          })
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message)
          })
        },
      },
    },
  },
})
