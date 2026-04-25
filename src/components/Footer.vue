<script setup lang="ts">
// 页脚组件
// 显示网站底部信息和链接
</script>

<template>
  <!-- 页脚 -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <h3>FzBlog</h3>
          <p>一个专注于技术分享和思考的博客平台</p>
        </div>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">联系</a>
          <a href="#">隐私政策</a>
          <a href="#">使用条款</a>
        </div>
      </div>
      <div class="footer-copyright">
        <p>© 2024 FzBlog. 保留所有权利.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* 页脚样式 */
.footer {
  background-color: #1f2937;
  color: white;
  padding: 3rem 0 1.5rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.footer-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.footer-info p {
  color: rgba(255, 255, 255, 0.7);
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-copyright {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .footer-links {
    flex-wrap: wrap;
  }
}
</style>