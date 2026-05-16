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

// 递归复制目录
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

// 在请求路径中定位 /vditor/ 的偏移量，提取其后的相对路径
function extractVditorRelative(url: string): string | null {
  const idx = url.indexOf('/vditor/')
  if (idx === -1) return null
  return url.slice(idx + '/vditor/'.length).split('?')[0]
}

function vditorPlugin() {
  const vditorRoot = path.resolve(__dirname, 'node_modules/vditor')

  // 开发模式：将 /vditor/* 和 /{base}vditor/* 映射到 node_modules/vditor/*
  function serveFile(url: string, res: any): boolean {
    const relativePath = extractVditorRelative(url)
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
    // 开发服务器：拦截 /vditor/ 请求，直接从 node_modules 返回文件
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (serveFile(req.url || '/', res)) return
        next()
      })
    },
    // 生产构建：将 node_modules/vditor/dist 复制到 dist/vditor/dist，
    // 使得 {base}vditor/dist/... 路径在部署后能找到文件
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

// https://vite.dev/config/
export default defineConfig({
  base: '/FzBlog_Frontend/',
  plugins: [
    vue(),
    vueDevTools(),
    vditorPlugin(),
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
