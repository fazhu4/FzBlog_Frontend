<script setup lang="ts">
// 大背景图区域组件
// 显示网站的主视觉区域，包含标题、描述和行动按钮
</script>

<template>
  <!-- 大背景图区） -->
  <!-- 注意：要更换背景图片，请修改.banner类的background-image属性 -->
  <section class="banner">
    <div class="banner-overlay"></div>
    <div class="banner-content">
      <!-- 主标题 -->
      <h2 class="banner-title">欢迎来到FzBlog</h2>
      <!-- 副标题/描述文字 -->
      <p class="banner-subtitle">
        一个分享技术、思考和创意的地<br />
        探索前端开发、设计思维和数字生活的无限可能
      </p>
      <!-- 行动按钮 -->
      <button class="banner-button">开始阅读</button>
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
/*
 * 重要：要更换背景图片，请修改下面的background-image URL
 * 将url('/path/to/your/image.jpg')替换为您的图片路径
 */
.banner {
  position: relative;
  height: 100vh; /* 占满整个视口高度 */
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;

  /* 背景图片设置 */
  background-image: url('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* 如果要使用本地图片：
   * 1. 将图片放入public或assets目录
   * 2. 修改background-image为：url('/images/your-image.jpg') 或 url('@/assets/your-image.jpg')
   */
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

.banner-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.banner-button:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
