<template>
  <div>
    <!-- 文件操作按钮组 -->
    <div class="file-operations">
      <el-button
        size="mini"
        type="text"
        icon="el-icon-view"
        @click="handlePreview"
        class="preview-btn"
      >预览</el-button>
      <el-button
        size="mini"
        type="text"
        icon="el-icon-edit"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        size="mini"
        type="text"
        icon="el-icon-delete"
        @click="handleDelete"
      >删除</el-button>
      <el-button
        size="mini"
        type="text"
        icon="el-icon-download"
        @click="handleDownload"
      >下载</el-button>
    </div>
  </div>
</template>

<script>
import { delKnowledge, downloadFiles1 } from '@/api/system/knowledge'
import { addLog } from '@/api/system/log'

export default {
  name: "FileOperations",
  props: {
    // 文件数据
    file: {
      type: Object,
      required: true
    },
    // 是否显示预览按钮
    showPreview: {
      type: Boolean,
      default: true
    },
    // 是否显示修改按钮
    showUpdate: {
      type: Boolean,
      default: true
    },
    // 是否显示删除按钮
    showDelete: {
      type: Boolean,
      default: true
    },
    // 是否显示下载按钮
    showDownload: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    // 预览文件
    handlePreview() {
      this.$emit('preview', this.file)
    },

    // 修改文件
    handleUpdate() {
      this.$emit('update', this.file)
    },

    // 删除文件
    handleDelete() {
      this.$confirm(`确定要删除文件"${this.file.userFname || this.file.fileName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delKnowledge(this.file.fileId).then(response => {
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.$emit('refresh')
          } else {
            this.$message.error('删除失败：' + response.msg)
          }
        }).catch(error => {
          this.$message.error('删除失败：' + error.message)
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 下载文件
    handleDownload() {
      if (!this.file.fileId) {
        this.$message.error('文件ID不存在，无法下载')
        return
      }
      
      this.$modal.confirm('是否确认下载该文件？').then(() => {
        const formData = { fileIdList: [this.file.fileId] }
        return downloadFiles1(formData)
      }).then(response => {
        this.handleDownloadResponse(response, this.file.userFname)
      }).catch(error => {
        this.handleDownloadError(error)
      })
    },

    // 处理下载响应
    handleDownloadResponse(response, fileName) {
      let downloadFileName = fileName || 'download'

      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        // 尝试多种标准/非标准格式解析
        const patterns = [
          /filename="([^"]+)"/,                 // filename="xxx"
          /filename\*=UTF-8''([^;]+)/,            // filename*=UTF-8''xxx
          /filename\*=UTF-8'[^']*'([^;]+)/,       // filename*=UTF-8'zh-CN'xxx
          /filename\*=[^']*''([^;]+)/,            // filename*=GBK''xxx
          /filename=([^;]+)/                      // filename=xxx
        ]

        let matched = false
        for (let i = 0; i < patterns.length; i++) {
          const m = contentDisposition.match(patterns[i])
          if (m) {
            let candidate = (m[1] || '').trim().replace(/^"|"$/g, '')
            try {
              // 优先按 URL 编码解码
              if (/%[0-9A-Fa-f]{2}/.test(candidate)) {
                candidate = decodeURIComponent(candidate)
              } else {
                // 兼容 Latin1 -> UTF8 的场景
                candidate = decodeURIComponent(escape(candidate))
              }
            } catch (e) {
              // 解码失败时，保留原值
            }
            // 将加号还原为空格（部分服务端会把空格编码为+）
            candidate = candidate.replace(/\+/g, ' ')
            downloadFileName = candidate
            matched = true
            break
          }
        }

        if (!matched) {
          // 回退解析
          try {
            const raw = contentDisposition.split('filename=').pop().split(';')[0].replace(/"/g, '')
            downloadFileName = decodeURIComponent(raw)
          } catch (e) {
            // 继续回退到默认名
          }
        }
      }

      const isZipFile =
        response.headers['content-type'] === 'application/zip' ||
        response.headers['content-type'] === 'application/x-zip-compressed' ||
        (downloadFileName && downloadFileName.toLowerCase().endsWith('.zip'))

      if (isZipFile) {
        downloadFileName = 'download.zip'
      }

      // 清理非法字符，避免 Windows 下载名乱码/不合法
      downloadFileName = this.sanitizeFileName(downloadFileName)

      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadFileName
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      this.$modal.msgSuccess("下载成功")
    },

    // 清理文件名，确保跨平台安全
    sanitizeFileName(fileName) {
      if (!fileName) return 'download'
      let sanitized = fileName
        .replace(/[<>:"/\\|?*]/g, '_')        // Windows 不允许字符
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 控制字符
        .replace(/\s+/g, ' ')                  // 归一化空白
        .trim()

      if (!sanitized) sanitized = 'download'

      // 限制长度，保留扩展名
      if (sanitized.length > 200) {
        const idx = sanitized.lastIndexOf('.')
        if (idx > 0) {
          const name = sanitized.substring(0, idx)
          const ext = sanitized.substring(idx)
          sanitized = name.substring(0, Math.max(1, 200 - ext.length)) + ext
        } else {
          sanitized = sanitized.substring(0, 200)
        }
      }
      return sanitized
    },

    // 处理下载错误
    handleDownloadError(error) {
      console.error('下载失败:', error)

      if (error !== 'cancel') {
        if (error.response && error.response.data instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result)
              this.$modal.msgError(errorData.msg || '下载失败')
            } catch (e) {
              this.$modal.msgError(reader.result || '文件下载失败')
            }
          }
          reader.readAsText(error.response.data)
        } else if (error.response && error.response.data) {
          this.$modal.msgError(error.response.data.msg || '下载失败')
        } else {
          this.$modal.msgError(error.message || '网络错误，无法连接到服务器')
        }
      }
    }
  }
}
</script>

<style scoped>
.file-operations {
  display: flex;
  gap: 8px;
}

.preview-btn {
  color: #409EFF;
}

.preview-btn:hover {
  color: #66b1ff;
}
</style>
