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
          <div v-if="articleForDisplay.imageUrl" class="article-hero-image">
            <img :src="articleForDisplay.imageUrl" :alt="articleForDisplay.title" />
            <div class="image-overlay"></div>
          </div>
        </header>

        <!-- 文章内容 -->
        <article v-if="!isLoading && articleForDisplay" class="article-body">
          <!-- 文章内容区域 -->
          <div class="content-wrapper">
            <!-- 文章正文内容（Markdown 渲染） -->
            <div ref="contentRef" class="article-paragraphs markdown-body"></div>

            <!-- 侧边栏信息 -->
            <aside class="article-sidebar">


              <!-- 文章标签 -->
              <div class="tags-section" v-if="articleForDisplay.tags && articleForDisplay.tags.length">
                <h4 class="section-title">相关文章标签</h4>
                <div class="tags-list">
                  <span v-for="tag in articleForDisplay.tags" :key="tag" class="tag-item">{{ tag }}</span>
                </div>
              </div>

              <!-- 推荐阅读 -->
              <div class="related-articles">
                <h4 class="section-title">推荐阅读</h4>
                <div class="related-list">
                  <div v-for="i in 3" :key="i" class="related-item">
                    <div class="related-title">相关文章标题 {{ i }}</div>
                    <div class="related-meta">2024-01-{{ 15 - i }}</div>
                  </div>
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
import type { ArticleDTO } from '@/types/article'

// 组件属性
const router = useRouter()
const route = useRoute()
const articleStore = useArticleStore()

// 响应式数据
const article = ref<ArticleDTO | null>(null)
const isLiked = ref(false)
const isBookmarked = ref(false)
const likeCount = ref(42)
const isLoading = ref(false)
const contentRef = ref<HTMLDivElement | null>(null)

// 计算属性：将ArticleDTO转换为前端展示格式
const articleForDisplay = computed(() => {
  if (!article.value) return null

  // 从ArticleDTO转换为前端需要的格式
  const content = article.value.content || ''
  const excerpt = content.length > 150 ? content.substring(0, 150) + '...' : content
  const date = new Date(article.value.createTime).toISOString().split('T')[0]

  // 估算阅读时间
  const wordCount = content.length
  const readTimeMinutes = Math.ceil(wordCount / 200)
  const readTime = `${readTimeMinutes}分钟`

  const tags = article.value.tags?.length ? article.value.tags : []

  // 如果有分类信息，可以从其他字段获取
  const category = article.value.statusText || '未分类'

  return {
    id: article.value.id,
    title: article.value.title,
    excerpt,
    date,
    author: article.value.author,
    category,
    content,
    readTime,
    tags,
    imageUrl:"",
    views: 1250,
    likes: 89,
  }
})

// 渲染 Markdown 内容
const renderMarkdown = async () => {
  if (!contentRef.value || !article.value?.content) return

  try {
    await Vditor.preview(contentRef.value, article.value.content, {
      cdn: '/vditor',
      lang: 'zh_CN',
      mode: 'light',
      theme: {
        current: 'light',
        path: '/vditor/dist/css/content-theme',
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

const shareArticle = () => {
  if (navigator.share && article.value) {
    navigator.share({
      title: article.value.title,
      text: article.value.content?.substring(0, 100) || '',
      url: window.location.href,
    })
  } else {
    // 降级处理：复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
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

.article-excerpt-large {
  font-size: 1.25rem;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-left: 4px solid #4f46e5;
  border-radius: 0.5rem;
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
  margin-bottom: 4rem;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

/* Markdown 内容样式 */
.article-paragraphs {
  font-size: 1.125rem;
  line-height: 1.8;
}

/* 侧边栏样式 */
.article-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.author-card {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #111827;
}

.author-bio {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.author-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background-color: #f3f4f6;
  color: #6b7280;
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

.related-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.related-item {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.related-item:hover {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.related-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #111827;
}

.related-meta {
  font-size: 0.75rem;
  color: #9ca3af;
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

/* 文章底部交互区域 */
.article-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
  margin-top: 3rem;
}

.interaction-bar {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.interaction-bar button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.share-button {
  background-color: #4f46e5;
  color: white;
}

.share-button:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.like-button {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.like-button:hover {
  background-color: #4f46e5;
  color: white;
}

.bookmark-button {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.bookmark-button:hover {
  background-color: #10b981;
  color: white;
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

  .interaction-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .interaction-bar button {
    justify-content: center;
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
