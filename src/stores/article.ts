// 文章状态管理store
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { articleApi } from '@/services/articleApi'
import type { ArticleDTO } from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  const currentArticle = ref<ArticleDTO | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取文章详情
  async function fetchArticleById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.getArticleById(id)
      if (response.success && response.data) {
        currentArticle.value = response.data
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
    fetchArticleById,
    clearError,
    clearCurrentArticle,
  }
})
