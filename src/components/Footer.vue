<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <h3 class="footer-logo">FzBlog</h3>
        <p class="footer-tagline">一个神入的博客平台</p>
      </div>
      <nav class="footer-links">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/editor">编辑器</RouterLink>
        <a href="#" @click.prevent>归档</a>
        <a href="#" @click.prevent>关于</a>
        <a href="#" @click.prevent>RSS</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} FzBlog. 保留所有权利.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #1a1a2e;
  color: rgba(255, 255, 255, 0.85);
  padding: 2.5rem 1.5rem 1.25rem;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-logo {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: #fff;
  letter-spacing: 0.02em;
}

.footer-tagline {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 1.75rem;
  flex-wrap: wrap;
}

.footer-links a {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #fff;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    gap: 1.25rem;
  }
}
</style>
