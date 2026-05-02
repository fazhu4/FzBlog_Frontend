const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:8083'

// 构建文件上传URL
const buildUploadUrl = (type?: string) => {
  const url = `${FILE_BASE_URL}/files/upload`
  return type ? `${url}?type=${type}` : url
}

// 构建图片URL
const buildImageUrl = (imgPath: string) => {
  if (!imgPath) return ''
  if (imgPath.startsWith('http')) {
    return imgPath
  }
  return `${FILE_BASE_URL}/files/view/${imgPath}`
}

export { buildUploadUrl, buildImageUrl }