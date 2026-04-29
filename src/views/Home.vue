<template>
  <div class="home">
    <HomepageBanner />

    <section class="content-section">
      <div class="content-inner">
        <aside class="sidebar-wrapper">
          <PersonInfoSidebar @update:selected-tags="onSelectedTagsChange" />
        </aside>
        <div class="articles-wrapper">
          <ArticleList :selected-tags="selectedTags" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HomepageBanner from '@/components/HomepageBanner.vue'
import PersonInfoSidebar from '@/components/PersonInfoSidebar.vue'
import ArticleList from '@/components/ArticleList.vue'

const selectedTags = ref<number[]>([])

const onSelectedTagsChange = (tagIds: number[]) => {
  selectedTags.value = tagIds
}
</script>

<style scoped>
.content-section {
  background-color: #f9fafb;
}

.content-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 0 1rem;
}

.sidebar-wrapper {
  flex-shrink: 0;
  width: 320px;
  align-self: stretch;
}

.articles-wrapper {
  flex: 1;
  min-width: 0;
}

@media (max-width: 1024px) {
  .content-inner {
    flex-direction: column;
    padding: 1rem;
  }

  .sidebar-wrapper {
    width: 100%;
  }
}
</style>
