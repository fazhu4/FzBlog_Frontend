import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
}

// 将 /vditor/* 请求映射到 node_modules/vditor/*，解决 Vditor cdn 配置的本地加载问题
// Vditor 默认 cdn 格式为 https://unpkg.com/vditor@x.x.x，不含 /dist
// 资源路径为 {cdn}/dist/js/...，所以 /vditor 应对应到 node_modules/vditor
function vditorStaticPlugin() {
  const vditorRoot = path.resolve(__dirname, 'node_modules/vditor')
  return {
    name: 'vditor-static',
    configureServer(server: any) {
      server.middlewares.use('/vditor', (req: any, res: any, next: any) => {
        const relativePath = (req.url || '/').split('?')[0].replace(/^\/vditor\/?/, '')
        const filePath = path.join(vditorRoot, relativePath)
        try {
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath)
            const mime = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream'
            res.setHeader('Content-Type', mime)
            res.setHeader('Cache-Control', 'public, max-age=3600')
            res.end(content)
            return
          }
        } catch { /* fall through to next middleware */ }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/FzBlog_Frontend/',
  plugins: [
    vue(),
    vueDevTools(),
    vditorStaticPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/files': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/img': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    }
  },
})
