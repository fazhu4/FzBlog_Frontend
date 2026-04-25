// HTTP客户端封装
import type { ApiResponse } from '@/types/article'

// 环境变量中的API基础URL，
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
console.log('初始化API:  ' + import.meta.env.VITE_API_BASE_URL)

// 请求配置接口
interface RequestConfig extends RequestInit {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
}

// 构建完整的URL
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  // 如果endpoint已经是完整的URL，直接使用
  if (endpoint.startsWith('http')) {
    let url = endpoint
    if (params) {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value))
        }
      })
      const queryString = queryParams.toString()
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }
    return url
  }

  // 否则，使用API基础URL构建完整URL
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  let url = `${baseUrl}${normalizedEndpoint}`

  if (params) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  return url
}

// 处理响应
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data as ApiResponse<T>
}

// HTTP客户端类
class HttpClient {
  // 通用请求方法
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, headers = {}, ...restConfig } = config

    // 设置默认请求头
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // 构建完整URL
    const url = buildUrl(endpoint, params)
    console.log('请求的地址是：' + url)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

      const response = await fetch(url, {
        ...restConfig,
        headers: defaultHeaders,
        credentials: 'include', // 包含Cookie
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      return await handleResponse<T>(response)
    } catch (error) {
      console.error('Request failed:', error)
      // 提供更友好的错误信息
      let errorMessage = '网络请求失败'
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = '无法连接到服务器，请检查网络连接或确保后端服务已启动'
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = '请求超时，请稍后重试'
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      throw new Error(errorMessage)
    }
  }

  // GET请求
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
      params,
    })
  }

  // POST请求
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE请求
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    })
  }

  // PATCH请求
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// 导出单例实例
export const http = new HttpClient()

// 导出工具函数
export { buildUrl }
