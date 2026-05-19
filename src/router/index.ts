import { createRouter, createWebHistory ,createWebHashHistory} from 'vue-router'
import Home from '@/views/Home.vue'
import Editor from '@/views/Editor.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import About from '@/views/About.vue'

const useHashMode = import.meta.env.VITE_ROUTER_MODE === 'hash'

const router = createRouter({
 history: useHashMode 
    ? createWebHashHistory(import.meta.env.BASE_URL)   // hash 模式，同样传入 BASE_URL
    : createWebHistory(import.meta.env.BASE_URL),      // history 模式
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
      path: '/editor/fazhu',
      name: 'editor',
      component: Editor,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
})

export default router
