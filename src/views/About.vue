<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import Vditor from 'vditor'
import PersonInfoSidebar from '@/components/PersonInfoSidebar.vue'
import { settingApi } from '@/services/settingApi'

const selfIntroduction = ref('')
const contentRef = ref<HTMLDivElement>()

onMounted(async () => {
  try {
    const response = await settingApi.getSettings()
    if (response.success && response.data?.about) {
      selfIntroduction.value = response.data.about
    }
  } catch (err) {
    console.error('获取个人介绍失败:', err)
  }

  if (selfIntroduction.value) {
    await nextTick()
    Vditor.preview(contentRef.value!, selfIntroduction.value, {
      mode: 'light',
      theme: { current: 'classic' },
      hljs: { style: 'github' },
      markdown: { autoSpace: true },
    })
  }
})
</script>

<template>
  <div class="about-page">
    <div class="about-container">
      <aside class="about-sidebar">
        <PersonInfoSidebar :show-tags="false" />
      </aside>
      <div class="about-document">
        <div class="document-paper">
          <div v-if="!selfIntroduction" class="document-empty">
            <div class="empty-icon">📝</div>
            <h2>暂无个人介绍</h2>
            <p>博主正在努力撰写中...</p>
          </div>
          <div v-else ref="contentRef" class="document-content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  flex: 1;
  background-color: #f0f0f0;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.about-sidebar {
  flex-shrink: 0;
  width: 320px;
}

.about-document {
  flex: 1;
  min-width: 0;
}

.document-paper {
  background-color: #fff;
  border-radius: 4px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 3rem 2.5rem;
  min-height: 600px;
  position: relative;
}

.document-paper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2196f3, #4f46e5);
  border-radius: 4px 4px 0 0;
}

.document-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.document-empty h2 {
  font-size: 1.5rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.document-empty p {
  font-size: 0.95rem;
  color: #9ca3af;
}

/* Vditor 预览内容样式覆盖 */
.document-content {
  color: #1f2937;
  line-height: 1.8;
  font-size: 1rem;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .about-container {
    flex-direction: column;
    align-items: center;
  }

  .about-sidebar {
    width: 100%;
    max-width: 400px;
  }

  .about-document {
    width: 100%;
  }

  .document-paper {
    padding: 2rem 1.5rem;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 1rem;
  }

  .document-paper {
    padding: 1.5rem 1rem;
  }
}
</style>
