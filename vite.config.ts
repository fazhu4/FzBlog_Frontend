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

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// Vditor 运行时动态加载的子目录资源（通过 <script> 标签注入）
// 只拦截这些子路径，放行 dist 根目录文件（如 dist/index.css），避免干扰 Vite CSS 编译
const VDITOR_RUNTIME_DIRS = [
  'dist/js/',
  'dist/css/content-theme/',
  'dist/images/',
]

function extractVditorRelative(url: string, base: string): string | null {
  const pathname = url.split('?')[0]
  for (const basePrefix of [base, '/']) {
    const vditorPrefix = basePrefix + 'vditor/'
    if (!pathname.startsWith(vditorPrefix)) continue
    const relative = pathname.slice(vditorPrefix.length)
    if (VDITOR_RUNTIME_DIRS.some(dir => relative.startsWith(dir))) {
      return relative
    }
    return null
  }
  return null
}

function vditorPlugin(base: string) {
  const vditorRoot = path.resolve(__dirname, 'node_modules/vditor')

  function serveFile(url: string, res: any): boolean {
    const relativePath = extractVditorRelative(url, base)
    if (!relativePath) return false
    const filePath = path.join(vditorRoot, relativePath)
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath)
        const mime = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream'
        res.setHeader('Content-Type', mime)
        res.setHeader('Cache-Control', 'public, max-age=3600')
        res.end(content)
        return true
      }
    } catch { /* fall through */ }
    return false
  }

  return {
    name: 'vditor-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (serveFile(req.url || '/', res)) return
        next()
      })
    },
    writeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      const srcDist = path.join(vditorRoot, 'dist')
      const destDist = path.join(outDir, 'vditor', 'dist')
      console.log('[vditor-plugin] 复制 vditor 静态资源到构建输出...')
      copyDir(srcDist, destDist)
      console.log('[vditor-plugin] 复制完成')
    },
  }
}

export default defineConfig({
  base: '/FzBlog_Frontend/',
  plugins: [
    vue(),
    vueDevTools(),
    vditorPlugin('/FzBlog_Frontend/'),
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
