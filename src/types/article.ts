// 文章相关类型定义，基于OpenAPI规范

// 文章状态枚举
export enum ArticleStatus {
  DRAFT = 0, // 草稿
  PUBLISHED = 1, // 已发布
  DELETED = 2, // 已删除
}

// 文章状态文本映射
export const ArticleStatusText: Record<ArticleStatus, string> = {
  [ArticleStatus.DRAFT]: '草稿',
  [ArticleStatus.PUBLISHED]: '已发布',
  [ArticleStatus.DELETED]: '已删除',
}

// 标签DTO
export interface TagDTO {
  id: number
  name: string
}

// 创建文章请求
export interface CreateArticleRequest {
  title: string
  content?: string
  author: string
  status?: ArticleStatus
  tags?: number[] // 文章标签ID列表
  img?: string // 封面图片文件名
}

// 更新文章请求
export interface UpdateArticleRequest {
  title?: string
  content?: string
  author?: string
  status?: ArticleStatus
  tags?: number[] // 文章标签ID列表
  img?: string // 封面图片文件名
}

// 文章DTO
export interface ArticleDTO {
  id: number
  title: string
  content: string
  author: string
  status: ArticleStatus
  statusText: string // 前端显示用
  createTime: string // ISO 8601格式
  updateTime: string // ISO 8601格式
  img?: string // 文章封面图片
  tags?: number[] // 文章标签ID列表
}

// 文章数量统计DTO
export interface ArticleCountDTO {
  totalCount: number // 文章总数（不包含已删除的文章）
  publishedCount: number // 已发布文章数量
  draftCount: number // 草稿文章数量（只读）
}

// 批量删除请求
export interface BatchDeleteRequest {
  ids: number[] // 要删除的文章ID列表
}

// 批量删除结果DTO
export interface BatchDeleteResultDTO {
  totalCount: number // 总共尝试删除的文章数量
  successCount: number // 成功删除的文章数量
  failedCount: number // 删除失败的文章数量（只读）
}

// API响应基类
export interface ApiResponse<T = void> {
  success: boolean // 请求是否成功
  code: number // 状态码
  message: string // 响应消息
  timestamp: string // 响应时间戳（ISO 8601格式）
  data?: T // 响应数据
}

// 设置DTO
export interface SettingDTO {
  banner: string // 首页大图文件名
  avatar: string // 头像文件名
  self_introduction: string //自我介绍
}

// 特定API响应类型
export type ApiResponseVoid = ApiResponse<void>
export type ApiResponseArticleDTO = ApiResponse<ArticleDTO>
export type ApiResponseListArticleDTO = ApiResponse<ArticleDTO[]>
export type ApiResponseListTagDTO = ApiResponse<TagDTO[]>
export type ApiResponseArticleCountDTO = ApiResponse<ArticleCountDTO>
export type ApiResponseBatchDeleteResultDTO = ApiResponse<BatchDeleteResultDTO>
export type ApiResponseSettingDTO = ApiResponse<SettingDTO>
// 分页查询参数
export interface PaginationParams {
  pageNum?: number // 页码（从1开始）
  pageSize?: number // 每页大小（1-100）
}

// 文章查询参数
export interface ArticleQueryParams {
  pageNum?: number // 页码
  pageSize?: number // 每页大小
  author?: string // 作者名称
  keyword?: string // 搜索关键词
  status?: ArticleStatus // 文章状态
}

// 用于前端展示的文章卡片类型
export interface ArticleCard {
  id: number
  title: string
  excerpt: string
  date: string // 格式化后的日期
  author: string
  category: string // 可根据业务逻辑从标签或分类中提取
  img?: string
  readTime?: string
  tags?: string[]
}
