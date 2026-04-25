<script setup lang="ts">
import { RouterLink } from 'vue-router'

// 导航栏组件
// 接收isScrolled属性，用于控制滚动时的样式变化

// 定义组件接收的属性
defineProps<{
  isScrolled: boolean
}>()
</script>

<template>
  <!-- 吸顶导航栏 -->
  <!-- :class指令根据isScrolled的值动态添加'navbar-scrolled'类 -->
  <header class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="navbar-container">
      <!-- 网站Logo -->
      <div class="logo">
        <h1>FzBlog</h1>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <!-- 使用router-link进行页面导航（需要配置Vue Router） -->
        <RouterLink to="/" class="nav-link" active-class="active">首页</RouterLink>
        <RouterLink to="/fazhu" class="nav-link" active-class="active">编辑器</RouterLink>
        <a href="#" class="nav-link">分类</a>
        <a href="#" class="nav-link">标签</a>
        <a href="#" class="nav-link">关于</a>
      </nav>

      <!-- 搜索框 -->
      <div class="search-box">
        <input type="text" placeholder="搜索文章..." class="search-input">
        <button class="search-button">
          <!-- 搜索图标 -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/*
 * 吸顶导航栏样式
 * 注意：导航栏默认是半透明背景，滚动后会变为白色背景
 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 0;
  /* 半透明白色背景，添加毛玻璃效果 */
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* 滚动后的导航栏样式 */
.navbar-scrolled {
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo样式 */
.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
  margin: 0;
}

/* 导航菜单样式 */
.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #4f46e5;
}

.nav-link.active {
  color: #4f46e5;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #4f46e5;
}

/* 搜索框样式 */
.search-box {
  display: flex;
  align-items: center;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.search-input {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  outline: none;
  width: 200px;
}

.search-button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #4f46e5;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button:hover {
  background-color: #4338ca;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    gap: 1rem;
  }

  .search-input {
    width: 150px;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>