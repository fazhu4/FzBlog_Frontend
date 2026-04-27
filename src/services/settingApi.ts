// 设置API服务
import { http } from './http'
import type { SettingDTO, ApiResponseSettingDTO } from '@/types/article'

// 文件服务基础URL
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:8083'

// 设置API服务类
class SettingApiService {
  /**
   * 获取站点设置
   */
  async getSettings(): Promise<ApiResponseSettingDTO> {
    return http.get<SettingDTO>('/api/settings/setting')
  }

  /**
   * 构建文件完整URL
   */
  buildImageUrl(fileName: string): string {
    if (!fileName) return ''
    if (fileName.startsWith('http')) {
      return fileName
    }
    return `${FILE_BASE_URL}/api/files/view/${fileName}`
  }
}

// 导出单例实例
export const settingApi = new SettingApiService()

// 导出类型
export type { SettingApiService }
