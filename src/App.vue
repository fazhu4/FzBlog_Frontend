<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { settingApi } from '@/services/settingApi'

onMounted(async () => {
  try {
    const res = await settingApi.getSettings()
    if (res.success && res.data?.background) {
      const url = settingApi.buildImageUrl(res.data.background)
      document.body.style.backgroundImage = `url('${url}')`
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
    }
  } catch (err) {
    console.error('加载背景图失败:', err)
  }
})
</script>


<template>
  <header class="app-header">
    <nav class="nav-container">
      <div class="logo">FzBlog</div>
      <div class="nav-links">
        <RouterLink to="/" class="nav-link">首页</RouterLink>
        <RouterLink to="/editor" class="nav-link">编辑器</RouterLink>
      </div>
    </nav>
  </header>
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196f3;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
}

.nav-link:hover {
  color: #2196f3;
}

.nav-link.router-link-active {
  color: #2196f3;
  border-bottom: 2px solid #2196f3;
}

.app-main {
  min-height: calc(100vh - 60px);
}
</style>
