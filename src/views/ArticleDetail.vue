<template>
  <!-- 文章详情页容器 -->
  <div class="article-detail-page">
    <!-- 返回按钮和面包屑导航 -->
    <div class="navigation-header">
      <button @click="goBack" class="back-button">
        <span class="arrow">←</span> 返回文章列表
      </button>
      <nav class="breadcrumb">
        <span class="breadcrumb-item">首页</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">{{ articleForDisplay?.title }}</span>
      </nav>
    </div>

    <!-- 文章内容区域 -->
    <main class="article-content-container">
      <div class="container">
        <!-- 文章头部信息 -->
        <header v-if="articleForDisplay" class="article-header">
          <!-- 文章标题 -->
          <h1 class="article-title">{{ articleForDisplay.title }}</h1>

          <!-- 文章元信息 -->
          <div class="article-meta-info">
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span class="meta-text">{{ articleForDisplay.author }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-text">{{ articleForDisplay.date }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span class="meta-text">{{ articleForDisplay.readTime }} 阅读</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👀</span>
                <span class="meta-text">{{ articleForDisplay.views || 0 }} 阅读</span>
              </div>
            </div>
          </div>

  

          <!-- 文章封面图（如果有） -->
          <div v-if="articleForDisplay.img" class="article-hero-image">
            <img :src="articleForDisplay.img" :alt="articleForDisplay.title" />
            <div class="image-overlay"></div>
          </div>
        </header>

        <!-- 文章内容 -->
        <article v-if="!isLoading && articleForDisplay" class="article-body">
          <!-- 文章内容区域 -->
          <div class="content-wrapper">
            <!-- 文章正文内容（Markdown 渲染） -->
            <div ref="contentRef" class="article-paragraphs "></div>

            <!-- 侧边栏信息 -->
            <aside class="article-sidebar">


              <!-- 文章标签 -->
              <div v-if="articleForDisplay.tags && articleForDisplay.tags.length">
                <h4 >相关文章标签</h4>
                <div class="tags-list">
                  <span v-for="tag in articleForDisplay.tags" :key="tag" class="tag-item">{{ tag }}</span>
                </div>
              </div>
            </aside>
          </div>
         </article>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>正在加载文章内容...</p>
        </div>

        <!-- 错误状态 -->
        <div v-if="!isLoading && !articleForDisplay" class="error-state">
          <p class="error-message">文章加载失败或不存在</p>
          <button class="retry-button" @click="fetchArticle">重试</button>
        </div>
      </div>
       
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useArticleStore } from '@/stores/article'
import { http } from '@/services/http'
import type { ArticleDTO, TagDTO } from '@/types/article'
import { buildImageUrl } from '@/services/file'

// 组件属性
const router = useRouter()
const route = useRoute()
const articleStore = useArticleStore()

// 响应式数据
const article = ref<ArticleDTO | null>(null)
const isLoading = ref(false)
const contentRef = ref<HTMLDivElement | null>(null)

// 标签名称映射（id → name）
const tagMap = ref<Record<number, string>>({})

// 获取所有标签
const fetchTags = async () => {
  try {
    const res = await http.get<TagDTO[]>('/tags')
    if (res.success && res.data) {
      const map: Record<number, string> = {}
      res.data.forEach(tag => {
        map[tag.id] = tag.name
      })
      tagMap.value = map
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

// 计算属性：将ArticleDTO转换为前端展示格式
const articleForDisplay = computed(() => {
  if (!article.value) return null

  const content = article.value.content || ''
  const date = new Date(article.value.createTime).toISOString().split('T')[0]

  // 估算阅读时间
  const readTimeMinutes = Math.ceil(content.length / 200)
  const readTime = `${readTimeMinutes}分钟`

  // 将标签ID转换为标签名称
  const tags = (article.value.tags || [])
    .map(id => tagMap.value[id] || `#${id}`)
    .filter(Boolean)

  return {
    id: article.value.id,
    title: article.value.title,
    date,
    author: article.value.author,
    content,
    readTime,
    tags,
    img: buildImageUrl(article.value.img || ''),
    views: 1250,
  }
})

// 渲染 Markdown 内容
const renderMarkdown = async () => {
  if (!contentRef.value || !article.value?.content) return

  try {
    await Vditor.preview(contentRef.value, article.value.content, {
      cdn: import.meta.env.BASE_URL + 'vditor',
      lang: 'zh_CN',
      mode: 'light',
      theme: {
        current: 'light',
        path: import.meta.env.BASE_URL + 'vditor/dist/css/content-theme',
      },
      hljs: {
        lineNumber: true,
        style: 'github',
      },
      markdown: {
        autoSpace: true,
        codeBlockPreview: true,
        fixTermTypo: true,
        footnotes: true,
        gfmAutoLink: true,
        listStyle: true,
        mark: true,
        toc: true,
      },
      speech: {
        enable: false,
      },
    })
  } catch (error) {
    console.error('渲染 Markdown 失败:', error)
    // 降级为纯文本显示
    if (contentRef.value) {
      contentRef.value.innerHTML = `<pre>${article.value?.content || ''}</pre>`
    }
  }
}

// 获取文章数据
const fetchArticle = async () => {
  // 从路由参数中获取文章ID
  const articleId = parseInt(route.params.id as string, 10)

  if (isNaN(articleId)) {
    article.value = null
    return
  }

  isLoading.value = true
  try {
    const articleData = await articleStore.fetchArticleById(articleId)
    article.value = articleData
    // 数据加载完成后渲染 Markdown
    if (articleData?.content) {
      setTimeout(() => renderMarkdown(), 50)
    }
  } catch (error) {
    console.error('获取文章失败:', error)
    article.value = null
  } finally {
    isLoading.value = false
  }
}

// 方法
const goBack = () => {
  router.back()
}

// 监听路由变化，当文章ID改变时重新获取数据
watch(
  () => route.params.id as string,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchArticle()
    }
  },
)

// 生命周期钩子
onMounted(() => {
  fetchTags()
  fetchArticle()
})
</script>

<style scoped>
/* 文章详情页全局样式 */
.article-detail-page {
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
  color: #1f2937;
  line-height: 1.6;
}

/* 导航头部样式 */
.navigation-header {
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.back-button:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.breadcrumb-item {
  color: #6b7280;
}

.breadcrumb-item.active {
  color: #4f46e5;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #d1d5db;
}

/* 主容器样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 文章头部样式 */
.article-header {
  margin-bottom: 3rem;
  position: relative;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #111827;
}

.article-meta-info {
  margin-bottom: 2rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-icon {
  font-size: 1rem;
}

.article-hero-image {
  width: 100%;
  height: 400px;
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.article-hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
}

/* 文章主体样式 */
.article-body {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 4rem;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
}

/* Markdown 内容样式 */
.article-paragraphs {
  font-size: 1.125rem;
  line-height: 1.8;
}

/* 侧边栏样式 */
.article-sidebar {
  position: sticky;
  top: 5rem;
  height: fit-content;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background-color: #9db7ea;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background-color: #4f46e5;
  color: white;
}



/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .article-sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 768px) {
  .navigation-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .container {
    padding: 0 1rem;
  }

  .article-title {
    font-size: 2rem;
  }

  .article-hero-image {
    height: 250px;
  }

  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }

}

@media (max-width: 480px) {
  .meta-grid {
    grid-template-columns: 1fr;
  }

  .article-paragraphs {
    font-size: 1rem;
  }
}

/* 错误状态样式 */
.error-state {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #fef2f2;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
  margin: 2rem 0;
}

.error-message {
  color: #dc2626;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.retry-button {
  padding: 0.5rem 1.5rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background-color: #b91c1c;
}
</style>
