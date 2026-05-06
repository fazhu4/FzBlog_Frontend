<template>
  <div class="editor-page">
    <div class="container">
      <h1>文章编辑器</h1>
      <div class="editor-layout">
        <!-- 左侧文章列表 -->
        <div class="sidebar">
          <div class="sidebar-header">
            <button class="btn btn-primary" @click="createNewArticle">新建文章</button>
            <div class="filter">
              <select v-model="filterStatus" @change="applyFilters">
                <option value="">全部</option>
                <option :value="ArticleStatus.DRAFT">草稿</option>
                <option :value="ArticleStatus.PUBLISHED">已发布</option>
              </select>
            </div>
          </div>
          <div class="sidebar-tags">
            <div v-if="loadingTags" class="tag-loading">加载标签中...</div>
            <div v-else class="filter-tags-cloud">
              <span
                v-for="tag in availableTags"
                :key="tag.id"
                :class="['filter-tag', { 'filter-tag-active': selectedFilterTagIds.has(tag.id) }]"
                @click="toggleFilterTag(tag.id)"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
          <div class="article-list">
            <div v-if="loadingArticles" class="loading">加载中...</div>
            <div v-else-if="loadError" class="error">{{ loadError }}</div>
            <div v-else-if="articles.length === 0" class="empty">暂无文章</div>
            <div
              v-else
              v-for="article in articles"
              :key="article.id"
              class="article-item"
              :class="{ active: currentArticle?.id === article.id }"
              @click="selectArticle(article)"
            >
              <div class="article-title">{{ article?.title || '无标题' }}</div>
              <div class="article-meta">
                <span class="status" :class="getStatusClass(article.status)">{{ getStatusText(article.status) }}</span>
                <span class="date">{{ formatDate(article.createTime) }}</span>
              </div>
              <div class="article-actions">
                <button class="btn-icon" @click.stop="deleteArticle(article)" title="删除">🗑️</button>
                <button v-if="article.status === ArticleStatus.DRAFT" class="btn-icon" @click.stop="publishArticle(article)" title="发布">🚀</button>
                <button v-if="article.status === ArticleStatus.PUBLISHED" class="btn-icon" @click.stop="unpublishArticle(article)" title="撤回">↩️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧编辑器 -->
        <div class="editor-main">
          <div v-if="currentArticle">
            <div class="editor-header">
              <div class="cover-image-section">
                <div class="cover-image-wrapper">
                  <div v-if="coverImagePreview" class="cover-preview">
                    <img :src="coverImagePreview" alt="封面预览" />
                    <button class="btn-remove-cover" @click="removeCoverImage" title="移除封面">✕</button>
                  </div>
                  <label v-else class="cover-upload-area">
                    <input type="file" accept="image/*" @change="onCoverFileChange" hidden :disabled="uploadingCover" />
                    <span v-if="uploadingCover" class="cover-upload-text">上传中...</span>
                    <template v-else>
                      <span class="cover-upload-icon">🖼️</span>
                      <span class="cover-upload-text">点击上传封面图</span>
                    </template>
                  </label>
                </div>
              </div>
              <input
                type="text"
                class="title-input"
                placeholder="文章标题" required
                v-model="currentArticle.title"
              />
              <div class="editor-meta">
                <input
                  type="text"
                  class="author-input"
                  placeholder="作者" required
                  v-model="currentArticle.author"
                />
                <select v-model="currentArticle.status" @change="onStatusChange">
                  <option :value="ArticleStatus.DRAFT">草稿</option>
                  <option :value="ArticleStatus.PUBLISHED">已发布</option>
                </select>
                <div class="tags-selector">
                  <div v-if="loadingTags" class="tag-loading">加载标签中...</div>
                  <div v-else class="tags-grid">
                    <span
                      v-for="tag in availableTags"
                      :key="tag.id"
                      class="tag-chip"
                      :class="{ selected: selectedTagIds.includes(tag.id) }"
                      @click="toggleTag(tag.id)"
                    >
                      {{ tag.name }}
                    </span>
                  </div>
                </div>
                <div class="editor-actions">
                  <button class="btn btn-primary" @click="saveArticle(false)">保存</button>
                  <button class="btn btn-danger" @click="discardChanges" v-if="hasChanges">放弃更改</button>
                </div>
              </div>
            </div>
            <div class="editor-container">
              <!-- Vditor Markdown编辑器 -->
              <div ref="editorRef" class="vditor-editor"></div>
            </div>
            <div class="editor-footer">
              <div class="save-status">
                <span v-if="saving">保存中...</span>
                <span v-else-if="lastSaved">已保存 {{ lastSaved }}</span>
              </div>
              <div class="word-count">字数: {{ wordCount }}</div>
            </div>
          </div>
          <div v-else class="editor-empty">
            <p>选择一篇文章进行编辑，或创建新文章</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { articleApi } from '@/services/articleApi'
import { http } from '@/services/http'
import { buildUploadUrl, buildImageUrl } from '@/services/file'
import type { ArticleDTO, CreateArticleRequest, UpdateArticleRequest, TagDTO } from '@/types/article'
import { ArticleStatus, ArticleStatusText } from '@/types/article'

// 文章列表相关
const articles = ref<ArticleDTO[]>([])
const allArticles = ref<ArticleDTO[]>([]) // 缓存全量数据，筛选时不再请求
const loadingArticles = ref(false)
const filterStatus = ref<ArticleStatus | ''>('')
const loadError = ref<string>('')

// Vditor编辑器相关
const editorRef = ref<HTMLDivElement | null>(null)
const vditorInstance = shallowRef<Vditor | null>(null)
const vditorReady = ref(false)

// 当前编辑文章
const currentArticle = ref<ArticleDTO | null>(null)
const originalArticle = ref<ArticleDTO | null>(null)

// 标签相关
const availableTags = ref<TagDTO[]>([])
const selectedTagIds = ref<number[]>([])
const loadingTags = ref(false)
const selectedFilterTagIds = ref<Set<number>>(new Set())

// 封面图相关
const coverImagePreview = ref<string>('')
const coverImgName = ref<string>('')
const originalCoverImgName = ref<string>('')
const uploadingCover = ref(false)

// 上传封面图
const onCoverFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingCover.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    // todo: 上传图片封装
    const res = await fetch(buildUploadUrl('content'), {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    const filename = data.data?.filename // 修改为从 data.data（原data未处理返回值） 中获取 filename
    if (filename) {
      coverImgName.value = filename
      coverImagePreview.value = buildImageUrl(filename)
      if (currentArticle.value) {
        currentArticle.value.img = filename
      }
    } else {
      alert('封面上传失败：' + (data?.message + '未获取到文件名'))
    }
  } catch (err) {
    console.error('封面上传失败:', err)
    alert('封面上传失败')
  } finally {
    uploadingCover.value = false
    input.value = ''
  }
}

// 移除封面图
const removeCoverImage = () => {
  coverImagePreview.value = ''
  coverImgName.value = ''
  if (currentArticle.value) {
    currentArticle.value.img = undefined
  }
}

// 获取标签列表
const loadTags = async () => {
  loadingTags.value = true
  try {
    const res = await http.get<TagDTO[]>('/tags')
    if (res.success && res.data) {
      availableTags.value = res.data
    }
  } catch (error) {
    console.error('加载标签列表失败:', error)
  } finally {
    loadingTags.value = false
  }
}

// 切换标签选中状态（编辑器）
const toggleTag = (tagId: number) => {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index === -1) {
    selectedTagIds.value.push(tagId)
  } else {
    selectedTagIds.value.splice(index, 1)
  }
}

// 切换标签筛选状态（列表过滤）
const toggleFilterTag = (tagId: number) => {
  if (selectedFilterTagIds.value.has(tagId)) {
    selectedFilterTagIds.value.delete(tagId)
  } else {
    selectedFilterTagIds.value.add(tagId)
  }
  selectedFilterTagIds.value = new Set(selectedFilterTagIds.value)
  applyFilters()
}

// 状态
const saving = ref(false)
const lastSaved = ref<string>('')
const hasChanges = computed(() => {
  if (!currentArticle.value || !originalArticle.value) return false
  const tagsChanged =
    JSON.stringify(currentArticle.value.tags?.sort()) !==
    JSON.stringify(originalArticle.value.tags?.sort())
  return (
    currentArticle.value.title !== originalArticle.value.title ||
    currentArticle.value.content !== originalArticle.value.content ||
    currentArticle.value.author !== originalArticle.value.author ||
    currentArticle.value.status !== originalArticle.value.status ||
    currentArticle.value.img !== originalArticle.value.img ||
    tagsChanged
  )
})

const wordCount = computed(() => {
  if (!currentArticle.value?.content) return 0
  const content = currentArticle.value.content
  // 统计中文字符数 + 英文单词数
  const chineseChars = (content.match(/[一-龥]/g) || []).length
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length
  return chineseChars + englishWords
})

// 从服务器拉取全量文章列表
const fetchArticles = async () => {
  loadingArticles.value = true
  loadError.value = ''
  try {
    const response = await articleApi.getAllArticles()
    if (response.success && response.data) {
      allArticles.value = response.data
      applyFilters()
    } else {
      loadError.value = `加载失败: ${response.message} (代码: ${response.code})`
      console.error('加载文章列表失败:', response)
    }
  } catch (error) {
    loadError.value = `加载出错: ${error instanceof Error ? error.message : String(error)}`
    console.error('加载文章列表出错:', error)
  } finally {
    loadingArticles.value = false
  }
}

// 本地筛选（不请求服务器）
const applyFilters = () => {
  let filtered = allArticles.value
  if (filterStatus.value !== '') {
    filtered = filtered.filter(article => article.status === filterStatus.value)
  }
  if (selectedFilterTagIds.value.size > 0) {
    const selectedIds = Array.from(selectedFilterTagIds.value)
    filtered = filtered.filter(
      article => selectedIds.every(tagId => article.tags?.includes(tagId))
    )
  }
  articles.value = filtered
}

// 创建新文章
const createNewArticle = () => {
  const newArticle: ArticleDTO = {
    id: 0,
    title: '新文章',
    content: '',
    author: '法助',
    status: ArticleStatus.DRAFT,
    statusText: ArticleStatusText[ArticleStatus.DRAFT],
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    tags: []
  }
  articles.value.unshift(newArticle)
  selectArticle(newArticle)
}

// 初始化Vditor编辑器
const initVditor = () => {
  if (!editorRef.value) {
    console.error('编辑器容器未找到')
    return
  }

  vditorReady.value = false

  // 如果已有实例，先销毁
  if (vditorInstance.value) {
    try {
      vditorInstance.value.destroy()
    } catch (error) {
      console.warn('销毁Vditor实例时出错:', error)
    }
    vditorInstance.value = null
  }

  try {
    vditorInstance.value = new Vditor(editorRef.value, {
      height: 'auto',
      minHeight: 400,
      placeholder: '输入文章内容，支持Markdown格式...',
      lang: 'zh_CN',
      toolbar: [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        'link',
        '|',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'quote',
        'line',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        '|',
        'upload',
        'table',
        '|',
        'undo',
        'redo',
        '|',
        'fullscreen',
        'preview',
        'both',
        'outline',
        'help'
      ],
      cache: {
        enable: false
      },
      cdn: '/vditor',
      _lutePath: '/vditor/dist/js/lute/lute.min.js',
      mode: 'sv',
      preview: {
        delay: 100,
        hljs: {
          lineNumber: true
        },
        markdown: {
          // 关闭 HTML 净化，允许 http:// 外链图片
          sanitize: false,
          autoSpace: true,
          fixTermTypo: true,
          toc: true,
          footnotes: true,
          gfmAutoLink: true,
          listStyle: true,
          mark: true,
        },
        transform: (html: string) => {
          // 为文件服务的图片添加懒加载
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          doc.querySelectorAll('img[src^="/img/"]').forEach(img => {
            img.setAttribute('loading', 'lazy')
          })
          return doc.body.innerHTML
        }
      },
      upload: {
        accept: 'image/*,.mp3,.wav,.mp4',
        handler: (files: File[]) => {
          const file = files[0]
          if (!file) return Promise.resolve('')

          // ========== 编辑器上传占位：生成唯一占位符并插入 ==========
          const placeholderId = `__UPLOAD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}__`
          const placeholderMd = `![⟳ 上传中...](${placeholderId})\n`
          if (vditorInstance.value) {
            vditorInstance.value.insertValue(placeholderMd)
          }
          // ========== END ==========

          const formData = new FormData()
          formData.append('file', file)

          return fetch(buildUploadUrl(), {
            method: 'POST',
            body: formData,
          })
            .then(res => res.json())
            .then(data => {
              const filename = data.data?.filename
              if (filename && vditorInstance.value) {
                // ========== 编辑器上传占位：替换为实际图片 ==========
                const viewUrl = buildImageUrl(filename)
                const content = vditorInstance.value.getValue()
                vditorInstance.value.setValue(
                  content.replace(`![⟳ 上传中...](${placeholderId})`, `![](${viewUrl})`)
                )
                // ========== END ==========
                return ''
              }
              throw new Error('上传响应中未找到文件路径')
            })
            .catch((err) => {
              console.error('图片上传失败:', err)
              // ========== 编辑器上传占位：替换为失败提示 ==========
              if (vditorInstance.value) {
                const content = vditorInstance.value.getValue()
                vditorInstance.value.setValue(
                  content.replace(`![⟳ 上传中...](${placeholderId})`, `> ⚠ 图片上传失败`)
                )
              }
              // ========== END ==========
              return Promise.resolve(err instanceof Error ? err.message : '上传失败')
            })
            .finally(() => {
              // ========== 编辑器上传占位：结束 ==========
              // ========== END ==========
            })
        }
      },
      input: (value: string) => {
        if (currentArticle.value) {
          currentArticle.value.content = value
        }
      },
      after: () => {
        vditorReady.value = true
        // 如果有当前文章，设置编辑器内容
        if (currentArticle.value) {
          updateVditorContent(currentArticle.value.content || '')
        }
      },
      resize: {
        enable: true
      },
      debugger: false,
      typewriterMode: false
    })
  } catch (error) {
    console.error('初始化Vditor失败:', error)
    vditorInstance.value = null
    vditorReady.value = false
  }
}

// 更新Vditor编辑器内容
const updateVditorContent = (content: string) => {
  if (!vditorReady.value || !vditorInstance.value) {
    return
  }

  try {
    const currentValue = vditorInstance.value.getValue()
    if (currentValue !== content) {
      vditorInstance.value.setValue(content || '')
    }
  } catch (error) {
    console.error('更新Vditor内容失败:', error)
  }
}

// 选择文章
const selectArticle = async (article: ArticleDTO) => {
  if (hasChanges.value && !confirm('您有未保存的更改，是否放弃？')) {
    return
  }

  const articleCopy: ArticleDTO = {
    ...article,
    content: article.content || '',
    tags: article.tags || []
  }
  currentArticle.value = articleCopy
  originalArticle.value = JSON.parse(JSON.stringify(articleCopy))
  selectedTagIds.value = [...(articleCopy.tags || [])]

  // 恢复封面图状态
  coverImgName.value = articleCopy.img || ''
  originalCoverImgName.value = coverImgName.value
  coverImagePreview.value = articleCopy.img ? buildImageUrl(articleCopy.img) : ''

  // 更新编辑器内容
  updateVditorContent(articleCopy.content)
}

// 保存文章
const saveArticle = async (publish: boolean) => {
  if (!currentArticle.value) return

  saving.value = true
  try {
    const articleToSave = currentArticle.value
    if (publish) {
      articleToSave.status = ArticleStatus.PUBLISHED
    }
    articleToSave.statusText = ArticleStatusText[articleToSave.status]

    let response
    if (articleToSave.id === 0) {
      const request: CreateArticleRequest = {
        title: articleToSave.title,
        content: articleToSave.content,
        author: articleToSave.author,
        status: articleToSave.status,
        tags: selectedTagIds.value,
        img: coverImgName.value || undefined
      }
      response = await articleApi.createArticle(request)
      if (response.success && response.data) {
        articles.value = articles.value.filter(a => a.id !== 0)
        articles.value.unshift(response.data)
        currentArticle.value = response.data
        originalArticle.value = JSON.parse(JSON.stringify(response.data))
        selectedTagIds.value = [...(response.data.tags || [])]
                coverImgName.value = response.data.img || ''
        originalCoverImgName.value = coverImgName.value
        coverImagePreview.value = response.data.img ? buildImageUrl(response.data.img) : ''
      }
    } else {
      const request: UpdateArticleRequest = {
        title: articleToSave.title,
        content: articleToSave.content,
        author: articleToSave.author,
        status: articleToSave.status,
        tags: selectedTagIds.value,
        img: coverImgName.value || undefined
      }
      response = await articleApi.updateArticle(articleToSave.id, request)
      if (response.success && response.data) {
        const index = articles.value.findIndex(a => a.id === articleToSave.id)
        if (index !== -1) {
          articles.value[index] = response.data
        }
        currentArticle.value = response.data
        originalArticle.value = JSON.parse(JSON.stringify(response.data))
        selectedTagIds.value = [...(response.data.tags || [])]
                coverImgName.value = response.data.img || ''
        originalCoverImgName.value = coverImgName.value
        coverImagePreview.value = response.data.img ? buildImageUrl(response.data.img) : ''
      }
    }

    if (response.success) {
      lastSaved.value = new Date().toLocaleTimeString()
      await fetchArticles()
    } else {
      alert(`保存失败: ${response.message} (代码: ${response.code})`)
    }
  } catch (error) {
    console.error('保存文章出错:', error)
    alert(`保存失败: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    saving.value = false
  }
}

// 删除文章
const deleteArticle = async (article: ArticleDTO) => {
  if (!confirm(`确定删除文章 "${article.title}" 吗？`)) return

  try {
    const response = await articleApi.deleteArticle(article.id)
    if (response.success) {
      allArticles.value = allArticles.value.filter(a => a.id !== article.id)
      applyFilters()
      if (currentArticle.value?.id === article.id) {
        currentArticle.value = null
        originalArticle.value = null
      }
    } else {
      alert(`删除失败: ${response.message} (代码: ${response.code})`)
    }
  } catch (error) {
    console.error('删除文章出错:', error)
    alert(`删除失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 发布文章
const publishArticle = async (article: ArticleDTO) => {
  try {
    const response = await articleApi.publishArticle(article.id)
    if (response.success) {
      await fetchArticles()
      if (currentArticle.value?.id === article.id) {
        currentArticle.value.status = ArticleStatus.PUBLISHED
        currentArticle.value.statusText = ArticleStatusText[ArticleStatus.PUBLISHED]
      }
    } else {
      alert(`发布失败: ${response.message} (代码: ${response.code})`)
    }
  } catch (error) {
    console.error('发布文章出错:', error)
    alert(`发布失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 撤回文章
const unpublishArticle = async (article: ArticleDTO) => {
  try {
    const response = await articleApi.unpublishArticle(article.id)
    if (response.success) {
      await fetchArticles()
      if (currentArticle.value?.id === article.id) {
        currentArticle.value.status = ArticleStatus.DRAFT
        currentArticle.value.statusText = ArticleStatusText[ArticleStatus.DRAFT]
      }
    } else {
      alert(`撤回失败: ${response.message} (代码: ${response.code})`)
    }
  } catch (error) {
    console.error('撤回文章出错:', error)
    alert(`撤回失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 放弃更改
const discardChanges = () => {
  if (originalArticle.value) {
    currentArticle.value = JSON.parse(JSON.stringify(originalArticle.value))
    selectedTagIds.value = [...(currentArticle.value?.tags || [])]
        coverImgName.value = originalCoverImgName.value
    coverImagePreview.value = originalCoverImgName.value ? buildImageUrl(originalCoverImgName.value) : ''
    updateVditorContent(currentArticle.value?.content || '')
  }
}

// 状态变化处理
const onStatusChange = () => {
  if (currentArticle.value) {
    currentArticle.value.statusText = ArticleStatusText[currentArticle.value.status]
  }
}

// 工具函数
const getStatusText = (status: ArticleStatus) => ArticleStatusText[status]
const getStatusClass = (status: ArticleStatus) => {
  return {
    [ArticleStatus.DRAFT]: 'status-draft',
    [ArticleStatus.PUBLISHED]: 'status-published',
    [ArticleStatus.DELETED]: 'status-deleted'
  }[status]
}
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 监听当前文章变化，初始化编辑器
watch(currentArticle, (newArticle, oldArticle) => {
  if (newArticle) {
    // 使用 setTimeout 确保 DOM 完全渲染后再初始化 Vditor
    nextTick(() => {
      setTimeout(() => {
        if (!vditorInstance.value) {
          initVditor()
        } else if (oldArticle?.id !== newArticle.id) {
          // 切换文章时更新内容
          updateVditorContent(newArticle.content || '')
        }
      }, 50)
    })
  } else {
    // 没有选中文章时销毁编辑器
    if (vditorInstance.value) {
      try {
        vditorInstance.value.destroy()
      } catch (error) {
        console.warn('销毁Vditor失败:', error)
      }
      vditorInstance.value = null
      vditorReady.value = false
    }
  }
})

// 初始化
onMounted(() => {
  fetchArticles()
  loadTags()
})

// 组件卸载时清理编辑器
onUnmounted(() => {
  vditorReady.value = false
  if (vditorInstance.value) {
    try {
      vditorInstance.value.destroy()
    } catch (error) {
      console.warn('卸载时销毁Vditor失败:', error)
    }
  }
  vditorInstance.value = null
})
</script>

<style scoped>
.editor-page {
  padding: 3rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  background-color: #f0f2f5;
  border-radius: 12px;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.editor-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 80px;
}

.sidebar-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sidebar-header .btn {
  flex: 1;
}

.filter select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.sidebar-tags {
  padding: 0.75rem 0;
  border-top: 1px solid #eee;
  margin-bottom: 0.5rem;
}

.filter-tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.filter-tag {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  background-color: #e9ecef;
  color: #495057;
  border-radius: 1rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.filter-tag:hover {
  background-color: #dee2e6;
  color: #212529;
}

.filter-tag-active {
  background-color: #4f46e5;
  color: #fff;
}

.filter-tag-active:hover {
  background-color: #4338ca;
  color: #fff;
}

.article-list {
  flex: 1;
  overflow-y: auto;
  max-height: 35rem;
}

.article-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.article-item:hover {
  background-color: #e9ecef;
}

.article-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.article-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
}

.status {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.status-draft {
  background-color: #ffecb3;
  color: #ff9800;
}

.status-published {
  background-color: #c8e6c9;
  color: #4caf50;
}

.status-deleted {
  background-color: #ffcdd2;
  color: #f44336;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
}

.editor-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.editor-header {
  margin-bottom: 1rem;
}

.cover-image-section {
  margin-bottom: 1rem;
}

.cover-image-wrapper {
  max-width: 320px;
}

.cover-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.cover-preview img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.btn-remove-cover {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-remove-cover:hover {
  background: rgba(244, 67, 54, 0.8);
}

.cover-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  gap: 0.5rem;
}

.cover-upload-area:hover {
  border-color: #2196f3;
  background-color: #f5f8ff;
}

.cover-upload-icon {
  font-size: 2rem;
}

.cover-upload-text {
  font-size: 0.875rem;
  color: #888;
}

.title-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  border: none;
  border-bottom: 2px solid #eee;
  margin-bottom: 1rem;
}

.title-input:focus {
  outline: none;
  border-bottom-color: #2196f3;
}

.editor-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.author-input, .editor-meta select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.editor-container {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vditor-editor {
  flex: 1;
  min-height: 0;
}

.editor-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 1.2rem;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.875rem;
  color: #666;
}

.save-status {
  color: #4caf50;
}

.word-count {
  color: #666;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:hover {
  background-color: #1976d2;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.tags-selector {
  flex: 1;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
  transition: all 0.2s ease;
  user-select: none;
}

.tag-chip:hover {
  background-color: #e3f2fd;
  border-color: #90caf9;
  color: #1976d2;
}

.tag-chip.selected {
  background-color: #1976d2;
  color: #fff;
  border-color: #1976d2;
}

.tag-loading {
  font-size: 0.8rem;
  color: #999;
}

.loading, .empty, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #f44336;
}
</style>
