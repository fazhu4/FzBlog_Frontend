<script setup lang="ts">
// 个人信息侧边栏组件
interface SocialLink {
  platform: string
  icon: string
  url: string
}

interface CategoryStat {
  name: string
  count: number
}

// 用户信息
const userInfo = {
  name: '法助',
  avatar: 'https://avatars.githubusercontent.com/u/26414?s=200&v=4',
  bio: '热爱技术，喜欢分享的前端开发者。专注于Vue、React和TypeScript。',
  location: '中国',
  website: 'https://github.com/fazhu',
}

// 社交媒体链接
const socialLinks: SocialLink[] = [
  { platform: 'GitHub', icon: '🐙', url: 'https://github.com/fazhu' },
  { platform: 'Twitter', icon: '🐦', url: 'https://twitter.com/fazhu' },
  { platform: '掘金', icon: '💎', url: 'https://juejin.cn/user/fazhu' },
  { platform: '知乎', icon: '📚', url: 'https://www.zhihu.com/people/fazhu' },
]

// 标签云
const popularTags = [
  'Vue 3',
  'TypeScript',
  '前端工程化',
  '性能优化',
  'React Hooks',
  'CSS Grid',
  '响应式设计',
  'Webpack',
  'Vite',
  'Node.js',
]
</script>

<template>
  <aside class="person-info-sidebar">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <!-- 头像 -->
      <div class="avatar-container">
        <img :src="userInfo.avatar" :alt="userInfo.name" class="avatar" />
      </div>

      <!-- 基本信息 -->
      <div class="user-basic-info">
        <h2 class="user-name">{{ userInfo.name }}</h2>
        <p class="user-bio">{{ userInfo.bio }}</p>
        <div class="user-location">
          <span class="location-icon">📍</span>
          {{ userInfo.location }}
        </div>
        <a :href="userInfo.website" class="user-website" target="_blank">
          <span class="website-icon">🌐</span>
          {{ userInfo.website }}
        </a>
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
      <h3 class="section-title">热门标签</h3>
      <div class="tags-cloud">
        <span v-for="tag in popularTags" :key="tag" class="tag">
          {{ tag }}
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
