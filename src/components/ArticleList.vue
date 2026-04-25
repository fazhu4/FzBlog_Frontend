<script setup lang="ts">
// 文章列表组件
// 使用Pinia store获取文章列表

import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { useArticleStore } from '@/stores/article'
import type { ArticleCard } from '@/types/article'

// 获取路由实例
const router = useRouter()
const articleStore = useArticleStore()

// 响应式数据
const articles = ref<ArticleCard[]>([])
const isLoading = ref(false)

// 文件服务基础URL
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:8083'

// 构建图片URL
const buildImageUrl = (imgPath: string) => {
  if (!imgPath) return ''
  // 如果已经是完整URL，直接返回
  if (imgPath.startsWith('http')) {
    return imgPath
  }
  // 否则构建完整URL
  return `${FILE_BASE_URL}/api/files/view/${imgPath}`
}

// 定义组件接收的属性（可选，用于外部传入文章数据）
const props = defineProps<{
  useApi?: boolean // 是否使用API获取数据，默认true
  externalArticles?: ArticleCard[] // 外部传入的文章数据
}>()

// 初始化
const init = async () => {
  if (props.externalArticles && props.externalArticles.length > 0) {
    // 使用外部传入的文章数据
    articles.value = props.externalArticles
  } else {
    // 使用API获取已发布的文章
    isLoading.value = true
    try {
      await articleStore.fetchPublishedArticles(1, 10)
      articles.value = articleStore.articleCards
    } catch (error) {
      console.error('获取文章列表失败:', error)
      // 可以显示错误提示
    } finally {
      isLoading.value = false
    }
  }
  console.log('获取的后端 数据' + articles.value[0]?.img)
}

// 跳转到文章详情页
const goToArticleDetail = (articleId: number) => {
  router.push(`/article/${articleId}`)
}

// 加载更多文章
const loadMoreArticles = async () => {
  // 这里可以实现分页加载更多文章
  // 暂时先重新加载第一页
  await init()
}

// 监听外部文章数据变化
watch(
  () => props.externalArticles,
  (newArticles) => {
    if (newArticles && newArticles.length > 0) {
      articles.value = newArticles
    }
  },
  { immediate: true },
)

// 组件挂载时初始化
onMounted(() => {
  if (!props.externalArticles || props.externalArticles.length === 0) {
    init()
  }
})
</script>

<template>
  <!-- 文章列表区域 -->
  <main class="articles-section">
    <div class="container">
      <!-- 区域标题 -->
      <div class="section-header">
        <h2 class="section-title">最新文章</h2>
        <p class="section-subtitle">探索我们最新的技术分享和思考</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载文章...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="articleStore.error" class="error-state">
        <p class="error-message">{{ articleStore.error }}</p>
        <button class="retry-button" @click="init">重试</button>
      </div>

      <!-- 文章列表 -->
      <div v-else-if="articles.length > 0" class="articles-list">
        <!-- 使用v-for指令循环渲染文章列表 -->
        <!-- :key属性为每个文章提供唯一标识，帮助Vue高效更新DOM -->
        <article
          v-for="(article, index) in articles"
          :key="article.id"
          :class="['article-card', index % 2 === 0 ? 'left-image' : 'right-image']"
          style="cursor: pointer"
        >
          <!-- 文章图片（如果有） -->
          <div v-if="article.img" class="article-image">
            <img :src="buildImageUrl(article.img)" :alt="article.title" />
            <!-- 类别标签放在图片上 -->
            <div class="article-category">{{ article.category }}</div>
          </div>

          <!-- 文章内容 -->
          <div class="article-content">
            <!-- 如果没有图片，显示类别标签在内容区域 -->
            <div v-if="!article.img" class="article-category no-image">
              {{ article.category }}
            </div>

            <!-- 文章标题 -->
            <h3 class="article-title">{{ article.title }}</h3>

            <!-- 文章摘要 -->
            <p class="article-excerpt">{{ article.excerpt }}</p>

            <!-- 文章元信息（作者、日期、阅读时间） -->
            <div class="article-meta">
              <div class="meta-left">
                <span class="article-author">{{ article.author }}</span>
                <span class="article-date">{{ article.date }}</span>
                <span v-if="article.readTime" class="article-read-time">{{
                  article.readTime
                }}</span>
              </div>
            </div>

            <!-- 文章标签 -->
            <div class="article-tags" v-if="article.tags && article.tags.length">
              <span v-for="tag in article.tags" :key="tag" class="article-tag">{{ tag }}</span>
            </div>

            <!-- 阅读更多按钮 -->
            <button
              class="article-read-more"
              @click.stop="goToArticleDetail(article.id)"
              @click.prevent
            >
              阅读全文
            </button>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>暂无文章</p>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="articles.length > 0 && !isLoading" class="load-more-container">
        <button class="load-more-button" @click="loadMoreArticles">加载更多文章</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 文章区域样式 */
.articles-section {
  padding: 5rem 0;
  background-color: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 0;
  padding-right: 1.5rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

/* 文章列表布局 */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-bottom: 3rem;
}

/* 文章卡片样式 */
.article-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
}

/* 左图右文布局（偶数索引：0, 2, 4...） */
.article-card.left-image {
  flex-direction: row;
}

/* 右图左文布局（奇数索引：1, 3, 5...） */
.article-card.right-image {
  flex-direction: row-reverse;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.article-category {
  display: inline-block;
  background-color: #4f46e5;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  align-self: flex-start;
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.article-category.no-image {
  position: static;
  margin-bottom: 1rem;
}

/* 文章图片 */
.article-image {
  position: relative;
  width: 40%;
  aspect-ratio: 16/9;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.article-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.article-excerpt {
  color: #6b7280;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.article-meta {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.article-author,
.article-date,
.article-read-time {
  display: flex;
  align-items: center;
}

.article-author::before {
  content: '👤';
  margin-right: 0.25rem;
}

.article-date::before {
  content: '📅';
  margin-right: 0.25rem;
}

.article-read-time::before {
  content: '⏱️';
  margin-right: 0.25rem;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.article-tag {
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.article-read-more {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  margin-top: auto;
}

.article-read-more:hover {
  background-color: #4f46e5;
  color: white;
}

/* 加载更多按钮 */
.load-more-container {
  text-align: center;
}

.load-more-button {
  padding: 0.875rem 2.5rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.load-more-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.load-more-button:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
}

.load-more-button:active::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

.load-more-button:hover {
  background-color: #4338ca;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .article-card.left-image,
  .article-card.right-image {
    flex-direction: column;
  }

  .article-image {
    width: 100%;
    aspect-ratio: 16/9;
    height: auto;
  }
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .articles-list {
    gap: 1.5rem;
  }

  .article-image {
    aspect-ratio: 16/9;
    height: auto;
  }

  .article-content {
    padding: 1.25rem;
  }

  .meta-left {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .articles-list {
    gap: 1rem;
  }

  .article-image {
    aspect-ratio: 16/9;
    height: auto;
  }

  .article-content {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .meta-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
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

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  font-size: 1.125rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin: 2rem 0;
}
</style>
