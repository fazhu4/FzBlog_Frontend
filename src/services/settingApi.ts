// 设置API服务
import { http } from './http'
import type { SettingDTO, ApiResponseSettingDTO } from '@/types/article'
import { buildImageUrl as buildFileImageUrl } from './file'

// 设置API服务类
class SettingApiService {
  private cache: ApiResponseSettingDTO | null = null
  private pending: Promise<ApiResponseSettingDTO> | null = null

  async getSettings(): Promise<ApiResponseSettingDTO> {
    if (this.cache) return this.cache
    if (this.pending) return this.pending
    this.pending = http.get<SettingDTO>('/settings').then(res => {
      this.cache = res
      return res
    })
    return this.pending
  }

  buildImageUrl(fileName: string): string {
    return buildFileImageUrl(fileName)
  }
}

export const settingApi = new SettingApiService()
export type { SettingApiService }
