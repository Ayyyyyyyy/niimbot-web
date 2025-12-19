import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Load self-signed certificates
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
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    https: loadCerts(),
    // Fix HMR websocket for network access
    hmr: {
      host: '10.0.0.40',
    },
    // Proxy Ollama API to bypass CORS
    proxy: {
      '/api/ollama': {
        target: 'http://10.0.0.40:11434',
        changeOrigin: true,
        secure: false, // Allow HTTPS frontend to HTTP backend
        rewrite: (path) => path.replace(/^\/api\/ollama/, '/api'),
        configure: (proxy, options) => {
          // Remove Origin header to prevent Ollama 403 CORS rejection
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            console.log('Proxying:', req.method, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
          });
        },
      },
    },
  },
})
