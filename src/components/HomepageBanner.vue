<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { settingApi } from '@/services/settingApi'



// 默认首页大图（API 失败时的 fallback）
const DEFAULT_BANNER = ''

const bannerUrl = ref(DEFAULT_BANNER)

const loadBanner = async () => {
  try {
    const response = await settingApi.getSettings()

    if (response.success && response.data?.banner) {
      bannerUrl.value = settingApi.buildImageUrl(response.data.banner)
    }
  } catch (err) {
    console.error('获取首页大图失败，使用默认图片:', err)
  } finally {
  }
}

onMounted(() => {
  loadBanner()
})
</script>

<template>


  <!-- 大背景图区） -->
  <section
    class="banner"
    :style="{ backgroundImage: `url('${bannerUrl}')` }"
  >
    <div class="banner-overlay"></div>
    <div class="banner-content">
      <!-- 主标题 -->
      <h2 class="banner-title">欢迎来到FzBlog</h2>
      <!-- 副标题/描述文字 -->
      <p class="banner-subtitle">
        一个分享技术、思考和生活的个人博客<br />
        
      </p>

    </div>

    <!-- 向下滚动指示器 -->
    <div class="scroll-indicator">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="7 13 12 18 17 13"></polyline>
        <line x1="12" y1="6" x2="12" y2="17"></line>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.banner {
  position: relative;
  height: 95vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 背景覆盖层，增强文字可读性 */
.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 1.5rem;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}


/* 向下滚动指示器 */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  animation: bounce 2s infinite;
  color: white;
  opacity: 0.8;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-title {
    font-size: 2.5rem;
  }

  .banner-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .banner {
    min-height: 500px;
  }

  .banner-title {
    font-size: 2rem;
  }
}
</style>
