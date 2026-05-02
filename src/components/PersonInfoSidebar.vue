<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { settingApi } from '@/services/settingApi'
import { articleApi } from '@/services/articleApi'
import type { TagDTO } from '@/types/article'

// 个人信息侧边栏组件
interface SocialLink {
  platform: string
  icon: string
  url: string
}
const self_introduction =ref("这个人很懒，什么都没写，快去催他");
const loadInfo = async () => {
  try {
    const response = await settingApi.getSettings()
    if (response.success && response.data?.self_introduction) {
      self_introduction.value = response.data.self_introduction
    }
  } catch (err) {
    console.error('获取个人介绍失败')
  }
}

settingApi.getSettings()
// 用户信息
const userInfo = {
  name: '法助',
  bio: self_introduction,
  location: '南京邮电大学通达学院',
}

const avatarUrl = ref()

const loadAvatar = async () => {
  try {
    const response = await settingApi.getSettings()
    if (response.success && response.data?.avatar) {
      avatarUrl.value = settingApi.buildImageUrl(response.data.avatar)
    }
  } catch (err) {
    console.error('获取头像设置失败', err)
  }
}

onMounted(() => {
  loadInfo()
  loadAvatar()
  loadTags()
})

// 社交媒体链接
const socialLinks: SocialLink[] = [
  { platform: 'GitHub', icon: '🐙', url: 'https://github.com/fazhu4' },
  { platform: 'bilibili', icon: '📺', url: 'https://space.bilibili.com/176326681?spm_id_from=333.1007.0.0' },
  { platform: '邮箱', icon: '📨', url: 'https://juejin.cn/user/fazhu' },
  { platform: 'QQ', icon: '🐧', url: 'https://qm.qq.com/cgi-bin/qm/qr?k=a-XTxdLrnevkqoGTgPUQ43v9ZNShRYNK' },
]

// 标签列表（从后端获取）
const tags = ref<TagDTO[]>([])
const selectedTagIds = ref<Set<number>>(new Set())

const emit = defineEmits<{
  (e: 'update:selectedTags', tagIds: number[]): void
}>()

const loadTags = async () => {
  try {
    const response = await articleApi.getTags()
    if (response.success && response.data) {
      tags.value = response.data
    }
  } catch (err) {
    console.error('获取标签列表失败:', err)
  }
}

const toggleTag = (tagId: number) => {
  if (selectedTagIds.value.has(tagId)) {
    selectedTagIds.value.delete(tagId)
  } else {
    selectedTagIds.value.add(tagId)
  }
  // 触发响应式更新
  selectedTagIds.value = new Set(selectedTagIds.value)
  emit('update:selectedTags', Array.from(selectedTagIds.value))
}
</script>

<template>
  <aside class="person-info-sidebar">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <!-- 头像 -->
      <div class="avatar-container">
        <img :src="avatarUrl" :alt="userInfo.name" class="avatar" />
      </div>

      <!-- 基本信息 -->
      <div class="user-basic-info">
        <h2 class="user-name">{{ userInfo.name }}</h2>
        <p class="user-bio">{{ userInfo.bio }}</p>
        <div class="user-location">
          <span class="location-icon">📍</span>
          {{ userInfo.location }}
        </div>
      </div>

      <!-- 社交媒体链接 -->
      <div class="social-links">
        <h3 class="section-title">社交媒体</h3>
        <div class="links-grid">
          <a
            v-for="link in socialLinks"
            :key="link.platform"
            :href="link.url"
            :title="link.platform"
            class="social-link"
            target="_blank"
          >
            <span class="social-icon">{{ link.icon }}</span>
            <span class="social-platform">{{ link.platform }}</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 标签云 -->
    <div class="tags-card">
      <h3 class="section-title">标签</h3>
      <div class="tags-cloud">
        <span
          v-for="tag in tags"
          :key="tag.id"
          :class="['tag', { 'tag-active': selectedTagIds.has(tag.id) }]"
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.person-info-sidebar {
  position: sticky;
  top: 80px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.user-basic-info {
  text-align: center;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.user-bio {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.user-location,
.user-website {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.user-website {
  text-decoration: none;
  transition: color 0.2s ease;
}

.user-website:hover {
  color: #4f46e5;
}

.location-icon,
.website-icon {
  font-size: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.social-links {
  margin-top: 1.5rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #4b5563;
  transition: all 0.2s ease;
}

.social-link:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.social-icon {
  font-size: 1.25rem;
}

.social-platform {
  font-size: 0.875rem;
  font-weight: 500;
}

.stats-card,
.tags-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: #e5e7eb;
}

.category-name {
  font-size: 0.875rem;
  color: #4b5563;
}

.category-count {
  background-color: #4f46e5;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 2rem;
  text-align: center;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tag:hover {
  background-color: #e5e7eb;
  color: #4f46e5;
}

.tag-active {
  background-color: #4f46e5;
  color: #ffffff;
}

.tag-active:hover {
  background-color: #4338ca;
  color: #ffffff;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .person-info-sidebar {
    position: static;
    width: 100%;
    max-width: 400px;
    margin: 0 auto 2rem;
  }
}

@media (max-width: 768px) {
  .person-info-sidebar {
    max-width: 100%;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }

  .tags-cloud {
    gap: 0.375rem;
  }

  .tag {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
