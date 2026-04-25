// 文章API服务
import { http } from './http'
import {
  ArticleStatus,
  type CreateArticleRequest,
  type UpdateArticleRequest,
  type ArticleDTO,
  type ArticleCountDTO,
  type BatchDeleteRequest,
  type BatchDeleteResultDTO,
  type ApiResponseVoid,
  type ApiResponseArticleDTO,
  type ApiResponseListArticleDTO,
  type ApiResponseArticleCountDTO,
  type ApiResponseBatchDeleteResultDTO,
  type PaginationParams,
  type ArticleQueryParams,
} from '@/types/article'

// 文章API服务类
class ArticleApiService {
  /**
   * 创建文章
   */
  async createArticle(data: CreateArticleRequest): Promise<ApiResponseArticleDTO> {
    return http.post<ArticleDTO>(`/articles`, data)
  }

  /**
   * 获取所有文章列表
   */
  async getAllArticles(): Promise<ApiResponseListArticleDTO> {
    return http.get<ArticleDTO[]>('/articles')
  }

  /**
   * 获取文章详情
   */
  async getArticleById(id: number): Promise<ApiResponseArticleDTO> {
    return http.get<ArticleDTO>(`/articles/${id}`)
  }

  /**
   * 更新文章信息
   */
  async updateArticle(id: number, data: UpdateArticleRequest): Promise<ApiResponseArticleDTO> {
    return http.put<ArticleDTO>(`/articles/${id}`, data)
  }

  /**
   * 删除文章（软删除）
   */
  async deleteArticle(id: number): Promise<ApiResponseVoid> {
    return http.delete<void>(`/articles/${id}`)
  }

  /**
   * 获取已发布的文章列表（分页）
   */
  async getPublishedArticles(params?: PaginationParams): Promise<ApiResponseListArticleDTO> {
    console.log('API: getPublishedArticles called with params:', params)
    // 将PaginationParams转换为Record<string, string | number | boolean | undefined>
    const queryParams = params
      ? {
          pageNum: params.pageNum,
          pageSize: params.pageSize,
        }
      : undefined
    const result = await http.get<ArticleDTO[]>('/articles/published', queryParams)
    console.log('API: getPublishedArticles result:', result)
    return result
  }

  /**
   * 发布文章
   */
  async publishArticle(id: number): Promise<ApiResponseVoid> {
    return http.patch<void>(`/articles/${id}/publish`)
  }

  /**
   * 撤回文章
   */
  async unpublishArticle(id: number): Promise<ApiResponseVoid> {
    return http.patch<void>(`/articles/${id}/unpublish`)
  }

  /**
   * 根据作者获取文章列表
   */
  async getArticlesByAuthor(author: string): Promise<ApiResponseListArticleDTO> {
    return http.get<ArticleDTO[]>(`/articles/author/${encodeURIComponent(author)}`)
  }

  /**
   * 搜索文章
   */
  async searchArticles(keyword: string): Promise<ApiResponseListArticleDTO> {
    return http.get<ArticleDTO[]>('/articles/search', { keyword })
  }

  /**
   * 获取文章数量统计
   */
  async getArticleCount(): Promise<ApiResponseArticleCountDTO> {
    return http.get<ArticleCountDTO>(`/articles/count`)
  }

  /**
   * 批量删除文章
   */
  async deleteArticlesBatch(data: BatchDeleteRequest): Promise<ApiResponseBatchDeleteResultDTO> {
    return http.delete<BatchDeleteResultDTO>(`/articles/batch`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * 通用文章查询方法
   */
  async queryArticles(params: ArticleQueryParams): Promise<ApiResponseListArticleDTO> {
    // 根据参数决定调用哪个接口
    if (params.keyword) {
      return this.searchArticles(params.keyword)
    } else if (params.author) {
      return this.getArticlesByAuthor(params.author)
    } else if (params.status === ArticleStatus.PUBLISHED) {
      return this.getPublishedArticles({
        pageNum: params.pageNum,
        pageSize: params.pageSize,
      })
    } else {
      return this.getAllArticles()
    }
  }

  /**
   * 将ArticleDTO转换为前端展示的ArticleCard格式
   */
  convertToArticleCard(article: ArticleDTO): any {
    // 这里可以根据实际业务需求进行转换
    // 例如：从content中提取excerpt，格式化日期等
    const content = article.content || ''
    const excerpt =
      content.length > 100 ? content.substring(0, 100) + '...' : content

    // 将ISO日期格式化为YYYY-MM-DD
    const date = new Date(article.createTime).toISOString().split('T')[0]

    // 估算阅读时间（假设平均阅读速度200字/分钟）
    const wordCount = article.content.length
    const readTimeMinutes = Math.ceil(wordCount / 200)
    const readTime = `${readTimeMinutes}分钟`

    return {
      id: article.id,
      title: article.title,
      excerpt,
      date,
      author: article.author,
      category: article.statusText || '未分类',
      img: article.img, // 传递图片字段
      readTime,
      tags: [article.statusText],
    }
  }

  /**
   * 批量转换ArticleDTO为ArticleCard
   */
  convertToArticleCards(articles: ArticleDTO[]): any[] {
    return articles.map((article) => this.convertToArticleCard(article))
  }
}

// 导出单例实例
export const articleApi = new ArticleApiService()

// 导出类型
export type { ArticleApiService }
