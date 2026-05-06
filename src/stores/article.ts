// 文章状态管理store
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { articleApi } from '@/services/articleApi'
import type { ArticleDTO } from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  const currentArticle = ref<ArticleDTO | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 文章缓存：列表页获取到完整数据后存入，详情页优先读取，避免重复请求
  const articleCache = ref<Record<number, ArticleDTO>>({})

  // 缓存多篇文章（列表页获取到数据后调用）
  function cacheArticles(articles: ArticleDTO[]) {
    articles.forEach((article) => {
      articleCache.value[article.id] = article
    })
  }

  // 从缓存获取单篇文章
  function getCachedArticle(id: number): ArticleDTO | null {
    return articleCache.value[id] || null
  }

  // 获取文章详情（先查缓存，缓存未命中才请求接口）
  async function fetchArticleById(id: number) {
    // 优先从缓存读取
    const cached = getCachedArticle(id)
    if (cached) {
      currentArticle.value = cached
      return cached
    }

    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.getArticleById(id)
      if (response.success && response.data) {
        currentArticle.value = response.data
        // 也存入缓存
        articleCache.value[id] = response.data
        return response.data
      } else {
        throw new Error(response.message || '获取文章详情失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('获取文章详情失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentArticle() {
    currentArticle.value = null
  }

  return {
    currentArticle,
    isLoading,
    error,
    articleCache,
    cacheArticles,
    getCachedArticle,
    fetchArticleById,
    clearError,
    clearCurrentArticle,
  }
})
