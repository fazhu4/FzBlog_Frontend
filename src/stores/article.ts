// 文章状态管理store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { articleApi } from '@/services/articleApi'
import {
  ArticleStatus,
  type ArticleDTO,
  type ArticleCard,
  type ArticleQueryParams,
  type ApiResponseListArticleDTO,
  type ApiResponseArticleDTO
} from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref<ArticleDTO[]>([])
  const articleCards = ref<ArticleCard[]>([])
  const currentArticle = ref<ArticleDTO | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const publishedCount = ref(0)

  // 计算属性
  const publishedArticles = computed(() =>
    articles.value.filter(article => article.status === ArticleStatus.PUBLISHED)
  )

  const draftArticles = computed(() =>
    articles.value.filter(article => article.status === ArticleStatus.DRAFT)
  )

  // 获取所有文章
  async function fetchAllArticles() {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.getAllArticles()
      if (response.success && response.data) {
        articles.value = response.data
        articleCards.value = articleApi.convertToArticleCards(response.data)
      } else {
        throw new Error(response.message || '获取文章列表失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('获取文章列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取已发布的文章（分页）
  async function fetchPublishedArticles(pageNum = 1, pageSize = 10, append = false) {
    isLoading.value = true
    error.value = null
    console.log(`Store: 开始获取已发布文章，pageNum=${pageNum}, pageSize=${pageSize}, append=${append}`)
    try {
      const response = await articleApi.getPublishedArticles({ pageNum, pageSize })
      console.log('Store: API响应成功:', response)
      if (response.success && response.data) {
        if (append) {
          // 追加模式：将新数据追加到已有列表末尾
          articleCards.value.push(...articleApi.convertToArticleCards(response.data))
        } else {
          // 替换模式：完全替换列表
          articles.value = response.data
          articleCards.value = articleApi.convertToArticleCards(response.data)
        }
        console.log('Store: 获取文章成功，当前总数:', articleCards.value.length)
        return response.data
      } else {
        throw new Error(response.message || '获取已发布文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Store: 获取已发布文章失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

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

  // 搜索文章
  async function searchArticles(keyword: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.searchArticles(keyword)
      if (response.success && response.data) {
        articles.value = response.data
        articleCards.value = articleApi.convertToArticleCards(response.data)
      } else {
        throw new Error(response.message || '搜索文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('搜索文章失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 根据作者获取文章
  async function fetchArticlesByAuthor(author: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.getArticlesByAuthor(author)
      if (response.success && response.data) {
        articles.value = response.data
        articleCards.value = articleApi.convertToArticleCards(response.data)
      } else {
        throw new Error(response.message || '获取作者文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('获取作者文章失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取文章数量统计
  async function fetchArticleCount() {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.getArticleCount()
      if (response.success && response.data) {
        totalCount.value = response.data.totalCount
        publishedCount.value = response.data.publishedCount
      } else {
        throw new Error(response.message || '获取文章统计失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('获取文章统计失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 创建文章
  async function createArticle(title: string, content: string, author: string, status = ArticleStatus.DRAFT) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.createArticle({ title, content, author, status })
      if (response.success && response.data) {
        // 将新文章添加到列表
        articles.value.unshift(response.data)
        articleCards.value.unshift(articleApi.convertToArticleCard(response.data))
        return response.data
      } else {
        throw new Error(response.message || '创建文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('创建文章失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新文章
  async function updateArticle(id: number, updates: any) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.updateArticle(id, updates)
      if (response.success && response.data) {
        // 更新文章列表中的文章
        const index = articles.value.findIndex(article => article.id === id)
        if (index !== -1) {
          articles.value[index] = response.data
          articleCards.value[index] = articleApi.convertToArticleCard(response.data)
        }
        // 如果当前文章是正在编辑的文章，也更新它
        if (currentArticle.value?.id === id) {
          currentArticle.value = response.data
        }
        return response.data
      } else {
        throw new Error(response.message || '更新文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('更新文章失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 删除文章
  async function deleteArticle(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.deleteArticle(id)
      if (response.success) {
        // 从列表中移除文章
        articles.value = articles.value.filter(article => article.id !== id)
        articleCards.value = articleCards.value.filter(card => card.id !== id)
        // 如果当前文章是正在查看的文章，清空它
        if (currentArticle.value?.id === id) {
          currentArticle.value = null
        }
        return true
      } else {
        throw new Error(response.message || '删除文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('删除文章失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 发布文章
  async function publishArticle(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.publishArticle(id)
      if (response.success) {
        // 更新文章状态
        await updateArticleStatus(id, ArticleStatus.PUBLISHED)
        return true
      } else {
        throw new Error(response.message || '发布文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('发布文章失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 撤回文章
  async function unpublishArticle(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await articleApi.unpublishArticle(id)
      if (response.success) {
        // 更新文章状态
        await updateArticleStatus(id, ArticleStatus.DRAFT)
        return true
      } else {
        throw new Error(response.message || '撤回文章失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('撤回文章失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 辅助函数：更新文章状态
  async function updateArticleStatus(id: number, status: ArticleStatus) {
    const article = articles.value.find(article => article.id === id)
    if (article) {
      article.status = status
      article.statusText = status === ArticleStatus.PUBLISHED ? '已发布' : '草稿'
    }
    if (currentArticle.value?.id === id) {
      currentArticle.value.status = status
      currentArticle.value.statusText = status === ArticleStatus.PUBLISHED ? '已发布' : '草稿'
    }
  }

  // 清空错误
  function clearError() {
    error.value = null
  }

  // 清空当前文章
  function clearCurrentArticle() {
    currentArticle.value = null
  }

  return {
    // 状态
    articles,
    articleCards,
    currentArticle,
    isLoading,
    error,
    totalCount,
    publishedCount,

    // 计算属性
    publishedArticles,
    draftArticles,

    // 方法
    fetchAllArticles,
    fetchPublishedArticles,
    fetchArticleById,
    searchArticles,
    fetchArticlesByAuthor,
    fetchArticleCount,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    clearError,
    clearCurrentArticle
  }
})