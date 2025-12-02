<template>
    <el-dialog
      title="文件预览"
      :visible.sync="dialogVisible"
      width="80%"
      height="90%"
      :close-on-click-modal="false"
      class="preview-dialog"
      @close="handleDialogClose"
    >
      <div class="preview-container">
        <!-- 文件预览内容 -->
        <div class="preview-content">
          <!-- 文件名显示 -->
          <div class="file-name-display">
            <h3>{{ currentFile && currentFile.userFname }}</h3>
          </div>

          <!-- 图片预览 -->
          <div v-if="isImageFile" class="image-preview">
            <img :src="previewUrl" alt="文件预览" class="preview-image" />
          </div>

          <!-- PDF预览 -->
          <div v-else-if="isPdfFile" class="pdf-preview">
            <iframe :src="previewUrl" class="pdf-iframe"></iframe>
          </div>

          <!-- 文本预览 -->
          <div v-else-if="isTextFile" class="text-preview">
            <div class="text-content" v-html="textContent"></div>
          </div>

          <!-- 视频预览 -->
          <div v-else-if="isVideoFile" class="video-preview">
            <video
              ref="videoPlayer"
              :src="previewUrl"
              controls
              autoplay
              preload="auto"
              class="video-player"
              @loadeddata="handleVideoLoaded"
            >
              您的浏览器不支持视频播放。
            </video>
          </div>

          <!-- 音频预览 -->
          <div v-else-if="isAudioFile" class="audio-preview">
            <audio
              ref="audioPlayer"
              :src="previewUrl"
              controls
              preload="metadata"
              class="audio-player"
            >
              您的浏览器不支持音频播放。
            </audio>
          </div>

          <!-- Word文档预览 -->
          <div v-else-if="isDocxFile" class="office-preview">
            <div v-if="docxLoading" class="loading-container">
              <i class="el-icon-loading"></i>
              <p>正在加载Word文档...</p>
              <p class="loading-tip">复杂文档可能需要更长时间，请耐心等待</p>
            </div>
            <div v-else-if="!previewUrl" class="error-container">
              <i class="el-icon-warning"></i>
              <p>预览URL无效，请重试</p>
            </div>
            <div v-else-if="docxRenderError" class="error-container">
              <i class="el-icon-warning"></i>
              <p>Word文档预览失败</p>
              <p class="error-tip">该文档格式复杂，无法在线预览</p>
            </div>
            <div v-else class="docx-wrapper">
              <vue-office-docx
                :key="docxKey"
                :src="previewUrl"
                style="height: 100%; width: 100%;"
                @rendered="onDocxRendered"
                @error="onOfficeError"
                @loading="onDocxLoading"
                @mounted="onDocxMounted"
              />
            </div>
          </div>

          <!-- Excel预览 -->
          <div v-else-if="isXlsxFile" class="office-preview">
            <vue-office-excel
              :src="previewUrl"
              style="height: 100%; width: 100%;"
              @rendered="onExcelRendered"
              @error="onOfficeError"
            />
          </div>

          <!-- PowerPoint预览 -->
          <div v-else-if="isPptxFile" class="office-preview">
            <vue-office-pptx
              :src="previewUrl"
              style="height: 100%; width: 100%;"
              @rendered="onPptxRendered"
              @error="onOfficeError"
            />
          </div>

          <!-- 不支持预览的文件类型 -->
          <div v-else class="unsupported-preview">
            <i class="el-icon-document"></i>
            <p>该文件类型暂不支持预览</p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="preview-actions">
          <el-button type="primary" @click="downloadFile" icon="el-icon-download">
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </template>

  <script>
  import { getPreviewPathPC, downloadFiles1 } from "@/api/system/knowledge"
  import { addLog } from "@/api/system/log.js"
  import VueOfficeDocx from '@vue-office/docx'
  import VueOfficeExcel from '@vue-office/excel'
  import VueOfficePptx from '@vue-office/pptx'
  // 引入样式文件
  import '@vue-office/docx/lib/index.css'
  import '@vue-office/excel/lib/index.css'

  export default {
    name: "FilePreview",
    components: {
      VueOfficeDocx,
      VueOfficeExcel,
      VueOfficePptx
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      file: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        dialogVisible: false, // 内部状态，用于控制对话框显示
        currentFile: null,
        previewUrl: '',
        textContent: '',
        docxLoading: false,
        previewRetryCount: 0,
        maxRetryCount: 2,
        docxKey: 0,
        docxTimeoutId: null,
        docxRenderError: false
      }
    },
    computed: {
      // 判断是否为图片文件
      isImageFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
        return imageTypes.some(type =>
          this.currentFile.fileType.toLowerCase().includes(type)
        )
      },
      // 判断是否为PDF文件
      isPdfFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        return this.currentFile.fileType.toLowerCase().includes('pdf')
      },
      // 判断是否为文本文件
      isTextFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        const textTypes = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js']
        return textTypes.some(type =>
          this.currentFile.fileType.toLowerCase().includes(type)
        )
      },
      // 判断是否为视频文件
      isVideoFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v']
        return videoTypes.some(type =>
          this.currentFile.fileType.toLowerCase().includes(type)
        )
      },
      // 判断是否为音频文件
      isAudioFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']
        return audioTypes.some(type =>
          this.currentFile.fileType.toLowerCase().includes(type)
        )
      },
      // 判断是否为Word文档
      isDocxFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        const docxTypes = ['docx', 'doc']
        return docxTypes.some(type =>
          this.currentFile.fileType.toLowerCase().includes(type)
        )
      },
      // 判断是否为Excel文件
      isXlsxFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        const xlsxTypes = ['xlsx', 'xls']
        return xlsxTypes.some(type =>
          this.currentFile.fileType.toLowerCase().includes(type)
        )
      },
      // 判断是否为PowerPoint文件
      isPptxFile() {
        if (!this.currentFile || !this.currentFile.fileType) return false
        const pptxTypes = ['pptx', 'ppt']
        return pptxTypes.some(type =>
          this.currentFile.fileType.toLowerCase().includes(type)
        )
      }
    },
    watch: {
      // 监听 visible prop 的变化，同步到内部状态
      visible(newVal) {
        this.dialogVisible = newVal
        if (newVal && this.file) {
          this.openPreview(this.file)
        } else if (!newVal) {
          this.resetPreview()
        }
      },
      // 监听内部状态变化，当对话框关闭时通知父组件
      dialogVisible(newVal) {
        if (!newVal) {
          // 对话框关闭时，通知父组件
          this.$emit('update:visible', false)
          this.$emit('close')
        }
      },
      file(newFile) {
        if (newFile && this.visible) {
          // 避免重复调用，只有在文件真正改变时才调用
          if (!this.currentFile || this.currentFile.fileId !== newFile.fileId) {
            this.openPreview(newFile)
          }
        }
      }
    },
    methods: {
      // 打开预览
      openPreview(file) {
        this.currentFile = file
        this.previewRetryCount = 0
        this.docxLoading = false
        this.docxRenderError = false

        // 使用新的API获取预览路径
        this.loadPreviewUrl(file)
      },

      // 加载预览URL的方法
      loadPreviewUrl(file) {
        getPreviewPathPC(file.fileId).then(response => {
          if (response) {
            // 验证URL是否有效
            this.validatePreviewUrl(response, file)
          } else {
            // 如果API调用失败，回退到原来的方式
            this.fallbackPreview(file)
          }
        }).catch(error => {
          console.error('获取预览路径失败:', error)
          // 回退到原来的方式
          this.fallbackPreview(file)
        })
      },

      // 验证预览URL
      validatePreviewUrl(url, file) {
        // 对于Word文档，设置加载状态
        if (this.isDocxFile) {
          this.docxLoading = true
          this.docxRenderError = false
          this.previewUrl = url
          this.docxTimeoutId = null

          // 强制重新渲染组件，避免DOM操作错误
          this.$nextTick(() => {
            this.docxKey++
          })
          console.log('开始加载Word文档:', url)

          // 设置更长的超时检查机制，给复杂文档更多时间
          this.setupDocxTimeout()
        } else {
          // 其他文件类型直接设置URL
          this.previewUrl = url

          // 根据文件类型设置预览
          if (this.isImageFile || this.isPdfFile) {
            // 对于图片和PDF，直接使用URL
          } else if (this.isVideoFile || this.isAudioFile || this.isXlsxFile) {
            // 对于视频和音频文件，直接使用URL
            // 视频文件自动播放
            if (this.isVideoFile) {
              this.$nextTick(() => {
                this.autoPlayVideo()
              })
            }
          } else if (this.isTextFile) {
            // 对于文本文件，读取内容
            this.loadTextContentFromUrl(url)
          } else if (this.isPptxFile) {
            // 对于PPTX文件，直接使用URL
          } else {
            // 不支持预览的文件类型
            this.previewUrl = ''
            this.textContent = ''
          }
        }
      },

      // 设置Word文档超时检查
      setupDocxTimeout() {
        // 清除之前的超时
        if (this.docxTimeoutId) {
          clearTimeout(this.docxTimeoutId)
        }

        // 设置更长的超时检查，给复杂文档更多时间
        this.docxTimeoutId = setTimeout(() => {
          if (this.docxLoading) {
            console.warn('Word文档加载超时，检查渲染状态')
            this.checkDocxRenderStatus()
          }
        }, 5000) // 5秒超时，给复杂文档更多时间
      },

      // 检查Word文档渲染状态
      checkDocxRenderStatus() {
        if (!this.docxLoading) {
          return // 已经不在加载状态
        }

        // 检查DOM中是否有渲染的内容
        const docxContainer = document.querySelector('.office-preview')
        if (docxContainer) {
          const hasContent = docxContainer.querySelector('iframe') ||
                            docxContainer.querySelector('.vue-office-docx') ||
                            docxContainer.innerHTML.trim().length > 100

          if (hasContent) {
            console.log('检测到文档已渲染，停止加载状态')
            this.docxLoading = false
            this.$message.success('Word文档加载完成')
            return
          }
        }

        // 如果没有内容，尝试重试
        if (this.previewRetryCount < this.maxRetryCount) {
          console.log('文档未渲染，尝试重新加载')
          this.retryPreview(this.currentFile)
        } else {
          console.error('文档渲染失败，已达重试上限')
          this.docxLoading = false
          this.$message.error('文档预览失败，请尝试下载文件查看')
        }
      },

      // 重试预览
      retryPreview(file) {
        // 如果文档已经加载完成，不需要重试
        if (!this.docxLoading) {
          console.log('文档已加载完成，取消重试')
          return
        }

        if (this.previewRetryCount < this.maxRetryCount) {
          this.previewRetryCount++
          console.log(`重试预览，第${this.previewRetryCount}次`)

          // 清除当前超时
          if (this.docxTimeoutId) {
            clearTimeout(this.docxTimeoutId)
            this.docxTimeoutId = null
          }

          // 延迟重试
          setTimeout(() => {
            // 再次检查是否还在加载状态
            if (this.docxLoading) {
              this.loadPreviewUrl(file)
            }
          }, 2000)
        } else {
          console.error('预览重试次数已达上限')
          this.docxLoading = false
          this.$message.error('文档预览失败，请尝试下载文件查看')
        }
      },

      // 回退预览方法
      fallbackPreview(file) {
        // 根据文件类型设置预览URL
        if (this.isImageFile || this.isPdfFile || this.isDocxFile || this.isXlsxFile) {
          // 对于图片和PDF，直接使用文件路径
          this.previewUrl = process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(file.filePath) + '&delete=' + false
        } else if (this.isVideoFile || this.isAudioFile) {
          // 对于视频和音频文件，直接使用文件路径
          this.previewUrl = process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(file.filePath) + '&delete=' + false
          // 视频文件自动播放
          if (this.isVideoFile) {
            this.$nextTick(() => {
              this.autoPlayVideo()
            })
          }
        } else if (this.isTextFile) {
          // 对于文本文件，尝试读取内容
          this.loadTextContent(file.filePath)
        } else if (this.isPptxFile) {
          // 对于PPTX文件，直接使用文件路径
          this.previewUrl = process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(file.filePath) + '&delete=' + false
        } else {
          // 不支持预览的文件类型
          this.previewUrl = ''
          this.textContent = ''
        }
      },

      // 加载文本文件内容
      async loadTextContent(filePath) {
        try {
          const response = await fetch(process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(filePath) + '&delete=' + false)
          if (response.ok) {
            const text = await response.text()
            // 简单的文本格式化
            this.textContent = text.replace(/\n/g, '<br>').replace(/\s{2}/g, '&nbsp;&nbsp;')
          } else {
            this.textContent = '无法加载文件内容'
          }
        } catch (error) {
          console.error('加载文本文件失败:', error)
          this.textContent = '加载文件内容失败'
        }
      },

      // 从URL加载文本文件内容
      async loadTextContentFromUrl(url) {
        try {
          const response = await fetch(url)
          if (response.ok) {
            const text = await response.text()
            // 简单的文本格式化
            this.textContent = text.replace(/\n/g, '<br>').replace(/\s{2}/g, '&nbsp;&nbsp;')
          } else {
            this.textContent = '无法加载文件内容'
          }
        } catch (error) {
          console.error('从URL加载文本文件失败:', error)
          this.textContent = '加载文件内容失败'
        }
      },

      // 下载文件
      downloadFile() {
        if (this.currentFile) {
          const formData = { fileIdList: [this.currentFile.fileId] }
          // 记录下载日志
          addLog({
            calledTableName: '文件',
            calledTableId: this.currentFile.fileId,
            isRead: 0,
            isClickRead: 0,
            isUsed: 1
          })
          downloadFiles1(formData).then(response => {
            this.handleDownloadResponse(response)
          }).catch(error => {
            this.handleDownloadError(error)
          })
        }
      },

      // 处理下载响应
      handleDownloadResponse(response) {
        let fileName = 'download'

        const contentDisposition = response.headers['content-disposition']
        if (contentDisposition) {
          // 改进的文件名解析逻辑，支持更多格式
          const patterns = [
            /filename="([^"]+)"/,
            /filename\*=UTF-8''([^;]+)/,
            /filename\*=UTF-8'[^']*'([^;]+)/,
            /filename\*=[^']*''([^;]+)/,
            /filename=([^;]+)/
          ]

          let matched = false
          for (let i = 0; i < patterns.length; i++) {
            const match = contentDisposition.match(patterns[i])
            if (match) {
              try {
                fileName = decodeURIComponent(match[1])
                if (fileName.includes('%')) {
                  fileName = decodeURIComponent(fileName)
                }
                matched = true
                break
              } catch (e) {
                console.warn('文件名解码失败，尝试下一个格式:', e)
                continue
              }
            }
          }

          if (!matched) {
            console.warn('未匹配到标准格式，尝试原始提取:', contentDisposition)
            try {
              const rawMatch = contentDisposition.split('filename=').pop().split(';')[0].replace(/"/g, '')
              fileName = decodeURIComponent(rawMatch)
            } catch (e) {
              console.error('原始提取也失败:', e)
              fileName = 'download'
            }
          }
        } else {
          console.warn('响应头中未找到 Content-Disposition，使用默认文件名')
        }

        // 检查文件名是否包含乱码字符
        if (fileName && /[\u0000-\u001F\u007F-\u009F]/.test(fileName)) {
          console.warn('检测到文件名包含控制字符，进行清理')
          fileName = fileName.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        }

        // 如果文件名为空或只包含空白字符，使用默认文件名
        if (!fileName || fileName.trim() === '') {
          fileName = 'download'
        }

        const isZipFile =
          response.headers['content-type'] === 'application/zip' ||
          response.headers['content-type'] === 'application/x-zip-compressed' ||
          (fileName && fileName.toLowerCase().endsWith('.zip'))

        if (isZipFile) {
          fileName = 'download.zip'
        }

        // 确保文件名是安全的
        fileName = this.sanitizeFileName(fileName)

        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()

        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }, 100)

        this.$message.success("下载成功")
      },

      // 清理文件名，确保安全
      sanitizeFileName(fileName) {
        if (!fileName) return 'download'

        // 移除或替换不安全的字符
        let sanitized = fileName
          .replace(/[<>:"/\\|?*]/g, '_') // 替换Windows不允许的字符
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
          .replace(/\s+/g, '_') // 替换多个空格为下划线
          .trim()

        // 确保文件名不为空
        if (!sanitized || sanitized === '') {
          sanitized = 'download'
        }

        // 限制文件名长度
        if (sanitized.length > 200) {
          const ext = sanitized.split('.').pop()
          const name = sanitized.substring(0, sanitized.lastIndexOf('.'))
          sanitized = name.substring(0, 200 - ext.length - 1) + '.' + ext
        }

        return sanitized
      },

      // 处理下载错误
      handleDownloadError(error) {
        console.error('下载失败:', error)

        if (error !== 'cancel') {
          if (error.response?.data instanceof Blob) {
            const reader = new FileReader()
            reader.onload = () => {
              try {
                const errorData = JSON.parse(reader.result)
                this.$message.error(errorData.msg || '下载失败')
              } catch (e) {
                this.$message.error(reader.result || '文件下载失败')
              }
            }
            reader.readAsText(error.response.data)
          } else if (error.response?.data) {
            this.$message.error(error.response.data.msg || '下载失败')
          } else {
            this.$message.error(error.message || '网络错误，无法连接到服务器')
          }
        }
      },

      // Word文档组件挂载回调
      onDocxMounted() {
        console.log('Word文档组件已挂载')
        setTimeout(() => {
          if (this.docxLoading) {
            console.log('Word文档组件挂载完成，但仍在加载中')
          }
        }, 1000)
      },

      // Word文档加载状态回调
      onDocxLoading(loading) {
        this.docxLoading = loading
        console.log('Word文档加载状态:', loading)
      },

      // Word文档渲染完成回调
      onDocxRendered() {
        console.log('Word文档渲染完成')
        this.docxLoading = false
        this.previewRetryCount = 0

        // 清除超时检查
        if (this.docxTimeoutId) {
          clearTimeout(this.docxTimeoutId)
          this.docxTimeoutId = null
        }

        // 显示成功提示
        this.$message.success('Word文档加载完成')
      },

      // Excel渲染完成回调
      onExcelRendered() {
        console.log('Excel表格渲染完成')
      },

      // PowerPoint渲染完成回调
      onPptxRendered() {
        console.log('PowerPoint演示文稿渲染完成')
      },

      // Office文档渲染错误回调
      onOfficeError(error) {
        // 停止加载状态
        this.docxLoading = false

        // 清除超时检查
        if (this.docxTimeoutId) {
          clearTimeout(this.docxTimeoutId)
          this.docxTimeoutId = null
        }

        // 检查是否是复杂的DOM操作错误
        if (error && error.message) {
          const isComplexError = error.message.includes('appendChild') ||
                                error.message.includes('beginChar') ||
                                error.message.includes('innerHTML') ||
                                error.message.includes('renderMmlDelimiter') ||
                                error.message.includes('Cannot read properties of undefined')

          if (isComplexError) {
            console.warn('检测到复杂DOM操作错误，启用降级模式')
            this.docxRenderError = true
            this.$message.warning('该文档格式复杂，无法在线预览，请下载查看')
            return
          }
        }

        // 根据错误类型提供更具体的错误信息
        let errorMessage = '文档预览失败'
        let shouldRetry = false

        if (error && error.message) {
          if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = '网络连接失败，请检查网络后重试'
            shouldRetry = true
          } else if (error.message.includes('format') || error.message.includes('parse')) {
            errorMessage = '文档格式不支持或文件损坏，请尝试下载文件查看'
          } else {
            errorMessage = `文档预览失败：${error.message}`
          }
        }

        // 如果是可重试的错误且未达到重试上限，则重试
        if (shouldRetry && this.previewRetryCount < this.maxRetryCount) {
          console.log('尝试重新渲染组件')
          this.retryPreview(this.currentFile)
          return
        }

        // 对于其他错误，也启用降级模式
        this.docxRenderError = true
        this.$message.error('文档预览失败，请下载文件查看')

        // 记录错误日志
        if (this.currentFile) {
          addLog({
            calledTableName: '文件预览错误',
            calledTableId: this.currentFile.fileId,
            isRead: 0,
            isClickRead: 0,
            isUsed: 0,
            errorInfo: error.message || '未知错误'
          })
        }
      },

      // 处理视频加载完成事件
      handleVideoLoaded() {
        // 视频加载完成后尝试自动播放
        this.autoPlayVideo()
      },
      // 自动播放视频
      autoPlayVideo() {
        if (this.$refs.videoPlayer) {
          const video = this.$refs.videoPlayer
          // 尝试播放，如果浏览器阻止自动播放，会返回一个 Promise
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // 自动播放成功
              console.log('视频自动播放成功')
            }).catch(error => {
              // 自动播放被阻止（通常是因为浏览器策略）
              console.log('视频自动播放被阻止，需要用户交互:', error)
              // 可以在这里显示提示信息，告知用户需要点击播放
            })
          }
        }
      },
      // 处理对话框关闭事件
      handleDialogClose() {
        // 停止视频播放
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.pause()
          this.$refs.videoPlayer.currentTime = 0
        }

        // 停止音频播放
        if (this.$refs.audioPlayer) {
          this.$refs.audioPlayer.pause()
          this.$refs.audioPlayer.currentTime = 0
        }

        // 清理预览相关数据
        this.resetPreview()

        // 注意：关闭事件已在 dialogVisible 的 watch 中处理，这里不需要再次触发
      },

      // 重置预览状态
      resetPreview() {
        this.currentFile = null
        this.previewUrl = ''
        this.textContent = ''
        this.docxLoading = false
        this.docxRenderError = false
        this.previewRetryCount = 0

        // 清除Word文档超时检查
        if (this.docxTimeoutId) {
          clearTimeout(this.docxTimeoutId)
          this.docxTimeoutId = null
        }

        console.log('预览状态已重置')
      }
    }
  }
  </script>

  <style scoped>
  /* 预览弹窗样式 */
  .preview-dialog {
    margin-top: -2vh;
  }

  .preview-dialog .el-dialog__body {
    padding: 0;
    max-height: 70vh;
    overflow: hidden;
  }

  .preview-container {
    height: 80vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
  }

  .preview-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .file-name-display {
    text-align: center;
    padding: 15px 20px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .file-name-display h3 {
    margin: 0;
    color: #303133;
    font-size: 18px;
    font-weight: 500;
    word-break: break-all;
  }

  .preview-actions {
    text-align: center;
    padding: 15px 20px;
    background: white;
    border-top: 1px solid #e4e7ed;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  }

  /* 图片预览样式 */
  .image-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 20px;
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* PDF预览样式 */
  .pdf-preview {
    flex: 1;
    padding: 20px;
  }

  .pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 4px;
  }

  /* 文本预览样式 */
  .text-preview {
    flex: 1;
    padding: 20px;
    overflow: auto;
    background: white;
    margin: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .text-content {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* 视频预览样式 */
  .video-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .video-player {
    min-width: 100%;
    min-height: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* 音频预览样式 */
  .audio-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .audio-player {
    width: 100%;
    max-width: 600px;
    height: 60px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Office文档预览样式 */
  .office-preview {
    flex: 1;
    background: white;
    margin: 10px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  /* 加载状态样式 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: #606266;
  }

  .loading-container i {
    font-size: 32px;
    margin-bottom: 16px;
    color: #409EFF;
    animation: rotate 1s linear infinite;
  }

  .loading-container p {
    font-size: 14px;
    margin: 0;
  }

  .loading-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }

  .error-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }

  /* Word文档包装器样式 */
  .docx-wrapper {
    flex: 1;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  /* 覆盖vue-office-docx内部样式，解除宽度限制 */
  .docx-wrapper ::v-deep .docx-wrapper {
    max-width: 100% !important;
    width: 100% !important;
  }

  .docx-wrapper ::v-deep .docx {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 auto;
    padding: 20px;
  }

  .docx-wrapper ::v-deep .docx-wrapper > section {
    max-width: 100% !important;
    width: 100% !important;
  }

  .docx-wrapper ::v-deep section.docx {
    max-width: 100% !important;
    width: 100% !important;
  }

  /* 覆盖文档内容区域宽度 */
  .docx-wrapper ::v-deep article {
    max-width: 100% !important;
    width: 100% !important;
  }

  /* 确保表格和其他内容也能全宽显示 */
  .docx-wrapper ::v-deep table {
    max-width: 100% !important;
    width: 100% !important;
  }

  .docx-wrapper ::v-deep .docx > section {
    max-width: none !important;
    width: 100% !important;
  }

  /* 错误状态样式 */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: #F56C6C;
  }

  .error-container i {
    font-size: 32px;
    margin-bottom: 16px;
    color: #F56C6C;
  }

  .error-container p {
    font-size: 14px;
    margin: 0;
  }

  /* 不支持预览的样式 */
  .unsupported-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #909399;
    background: white;
    margin: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .unsupported-preview i {
    font-size: 48px;
    margin-bottom: 16px;
    color: #c0c4cc;
  }

  .unsupported-preview p {
    margin: 8px 0;
    font-size: 14px;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .video-player {
      max-width: 100%;
      max-height: 60vh;
    }

    .audio-player {
      max-width: 100%;
    }

    .file-name-display h3 {
      font-size: 16px;
    }
  }
  </style>
