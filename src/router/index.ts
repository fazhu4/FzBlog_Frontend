import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Editor from '@/views/Editor.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/article/:id',
      name: 'article-detail',
      component: ArticleDetail,
    },
    {
      path: '/editor',
      name: 'editor',
      component: Editor,
    },
  ],
})

export default router
