<script setup lang="ts">
// 文章列表组件
// 使用Pinia store获取文章列表

import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { articleApi } from '@/services/articleApi'
import type { ArticleCard } from '@/types/article'
import { buildImageUrl } from '@/services/file'

// 获取路由实例
const router = useRouter()

// 响应式数据
const articles = ref<ArticleCard[]>([])
const initialLoading = ref(false) // 首次加载
const loadingMore = ref(false)    // 加载更多中
const pageNum = ref(1)
const hasMore = ref(true)
const error = ref<string | null>(null)
const tagMap = ref<Record<number, string>>({}) // 标签ID -> 标签名称
const isFirstLoad = ref(true)
const PAGE_SIZE = 7


// 定义组件接收的属性（可选，用于外部传入文章数据）
const props = defineProps<{
  externalArticles?: ArticleCard[]
  selectedTags?: number[]
}>()

// 获取所有标签
const fetchTags = async () => {
  try {
    const response = await articleApi.getTags()
    if (response.success && response.data) {
      const map: Record<number, string> = {}
      response.data.forEach(tag => { map[tag.id] = tag.name })
      tagMap.value = map
    }
  } catch (err) {
    console.error('获取标签列表失败:', err)
  }
}

// 将文章DTO的tag IDs映射为tag名称并填充到cards上
const fillArticleTags = (cards: ArticleCard[], tagIdsList: (number[] | undefined)[]) => {
  tagIdsList.forEach((tagIds, i) => {
    if (tagIds && tagIds.length > 0 && i < cards.length && cards[i]!=null) {
      cards[i].tags = tagIds.map(id => tagMap.value[id]).filter((name): name is string => !!name)
    }
  })
}

// 初始化
const init = async () => {
  pageNum.value = 1
  hasMore.value = true
  error.value = null

  if (props.externalArticles && props.externalArticles.length > 0) {
    articles.value = props.externalArticles
    return
  }

  // 只有首次加载才显示全屏 loading，标签切换时静默刷新
  if (isFirstLoad.value) {
    initialLoading.value = true
  }
  try {
    // 并行获取文章列表和标签
    const [articleRes] = await Promise.all([
      articleApi.getPublishedArticles({ pageNum: 1, pageSize: PAGE_SIZE }, props.selectedTags),
      fetchTags(),
    ])
    if (articleRes.success && articleRes.data) {
      const cards = articleApi.convertToArticleCards(articleRes.data)
      fillArticleTags(cards, articleRes.data.map(d => d.tags))
      articles.value = cards
      if (articleRes.data.length < PAGE_SIZE) {
        hasMore.value = false
      }
    } else {
      throw new Error(articleRes.message || '获取文章列表失败')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误'
    console.error('获取文章列表失败:', err)
  } finally {
    initialLoading.value = false
    isFirstLoad.value = false
  }
}

// 跳转到文章详情页
const goToArticleDetail = (articleId: number) => {
  router.push(`/article/${articleId}`)
}

// 加载更多文章
const loadMoreArticles = async () => {
  if (loadingMore.value || !hasMore.value) return
  pageNum.value++
  loadingMore.value = true
  try {
    const response = await articleApi.getPublishedArticles({ pageNum: pageNum.value, pageSize: PAGE_SIZE }, props.selectedTags)
    if (response.success && response.data) {
      const newCards = articleApi.convertToArticleCards(response.data)
      fillArticleTags(newCards, response.data.map(d => d.tags))
      articles.value.push(...newCards)
      if (response.data.length < PAGE_SIZE) {
        hasMore.value = false
      }
    } else {
      throw new Error(response.message || '加载更多文章失败')
    }
  } catch (err) {
    console.error('加载更多文章失败:', err)
    pageNum.value--
  } finally {
    loadingMore.value = false
  }
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

// 标签变化时静默重新拉取，不显示全屏 loading
watch(
  () => props.selectedTags,
  () => {
    if (!isFirstLoad.value) {
      init()
    }
  },
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

      <!-- 首次加载状态 -->
      <div v-if="initialLoading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载文章...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
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
          @click="goToArticleDetail(article.id)"
        >
          <!-- 文章图片（如果有） -->
          <div v-if="article.img" class="article-image">
            <img :src="buildImageUrl(article.img)" :alt="article.title" />
          </div>

          <!-- 文章内容 -->
          <div class="article-content">

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
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>暂无文章</p>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="articles.length > 0 && hasMore" class="load-more-container">
        <button class="load-more-button" :disabled="loadingMore" @click="loadMoreArticles">
          {{ loadingMore ? '加载中...' : '加载更多文章' }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 文章区域样式  TODO*/
.articles-section {
  padding: 5rem 0;
  background-color: #fecaca;
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
  cursor: pointer;
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
  margin-top: auto;
}

.article-tag {
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
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

.load-more-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

/* 空状态样式 TODO */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  font-size: 1.125rem;
  border-radius: 0.5rem;
  margin: 2rem 0;
  background-color: #4f46e5; 
}
</style>
