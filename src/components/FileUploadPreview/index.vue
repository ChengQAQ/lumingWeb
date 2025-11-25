<template>
  <div>
    <!-- 文件上传对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文件用途" prop="filePurpose">
              <el-input v-model="form.filePurpose" :placeholder="defaultFilePurpose" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件名" prop="userFname">
              <el-input v-model="form.userFname" placeholder="请输入文件名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-select
                v-model="form.grade"
                placeholder="请选择年级"
                style="width: 100%"
                :disabled="!isAdmin && autoGrade !== null"
                clearable
              >
                <el-option label="初中" value="初中" />
                <el-option label="高中" value="高中" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程名" prop="subjectName">
              <el-select
                v-model="form.subjectName"
                placeholder="请选择课程名"
                style="width: 100%"
                :disabled="!isAdmin && autoSubjectCode !== null"
                clearable
              >
                <el-option
                  v-for="subject in subjectList"
                  :key="subject.subjectCode"
                  :label="`${subject.subjectName}`"
                  :value="subject.subjectCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="groupLabel" prop="teachingIds">
              <el-select
                v-model="form.teachingIds"
                :placeholder="`请选择${groupLabel}`"
                style="width: 100%"
                multiple
                clearable
              >
                <el-option
                  v-for="group in groupList"
                  :key="group.id"
                  :label="group.groupName"
                  :value="group.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="文件" prop="filePath">
          <file-upload v-model="form.filePath" :limit="1"/>
          <div class="upload-tip">
            <i class="el-icon-info"></i>
            请先上传文件，然后填写其他信息，最后点击"确定"
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文件预览弹窗 -->
    <el-dialog
      title="文件预览"
      :visible.sync="previewVisible"
      width="80%"
      height="90%"
      :close-on-click-modal="false"
      class="preview-dialog"
      @close="handlePreviewDialogClose"
    >
      <div class="preview-container">
        <!-- 文件名显示 -->
        <div class="file-name-display">
          <h3>{{ (currentPreviewFile && currentPreviewFile.userFname) || '文件预览' }}</h3>
          <div class="preview-actions">
            <el-button size="small" icon="el-icon-download" @click="downloadFile">下载</el-button>
            <el-button size="small" icon="el-icon-refresh" @click="retryPreview(currentPreviewFile)">刷新</el-button>
          </div>
        </div>
        
        <!-- 预览内容 -->
        <div class="preview-content">
          <!-- 加载状态 -->
          <div v-if="docxLoading" class="preview-loading">
            <i class="el-icon-loading" style="font-size: 24px; margin-right: 8px;"></i>
            <span>正在加载文档，请稍候...</span>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="docxRenderError" class="preview-error">
            <i class="el-icon-warning preview-error-icon"></i>
            <div class="preview-error-text">该文档格式复杂，无法在线预览</div>
            <div class="preview-error-actions">
              <el-button type="primary" @click="downloadFile">下载文件</el-button>
              <el-button @click="retryPreview(currentPreviewFile)">重试预览</el-button>
            </div>
          </div>
          
          <!-- 图片预览 -->
          <div v-else-if="isImageFile" class="image-preview">
            <img :src="previewUrl" :alt="currentPreviewFile && currentPreviewFile.userFname" class="preview-image" />
          </div>
          
          <!-- PDF预览 -->
          <div v-else-if="isPdfFile" class="pdf-preview">
            <iframe :src="previewUrl" class="preview-pdf" frameborder="0"></iframe>
          </div>
          
          <!-- 视频预览 -->
          <div v-else-if="isVideoFile" class="video-preview">
            <video :src="previewUrl" controls class="preview-video" ref="videoPlayer">
              您的浏览器不支持视频播放
            </video>
          </div>
          
          <!-- 音频预览 -->
          <div v-else-if="isAudioFile" class="audio-preview">
            <audio :src="previewUrl" controls class="preview-audio" ref="audioPlayer">
              您的浏览器不支持音频播放
            </audio>
          </div>
          
          <!-- 文本文件预览 -->
          <div v-else-if="isTextFile" class="text-preview">
            <div class="preview-text" v-html="textContent"></div>
          </div>
          
          <!-- Word文档预览 -->
          <div v-else-if="isDocxFile" class="office-preview">
            <VueOfficeDocx
              :key="docxKey"
              :src="previewUrl"
              @mounted="onDocxMounted"
              @loading="onDocxLoading"
              @rendered="onDocxRendered"
              @error="onOfficeError"
            />
          </div>
          
          <!-- Excel表格预览 -->
          <div v-else-if="isXlsxFile" class="office-preview">
            <VueOfficeExcel
              :src="previewUrl"
              @rendered="onExcelRendered"
              @error="onOfficeError"
            />
          </div>
          
          <!-- PowerPoint预览 -->
          <div v-else-if="isPptxFile" class="office-preview">
            <VueOfficePptx
              :src="previewUrl"
              @rendered="onPptxRendered"
              @error="onOfficeError"
            />
          </div>
          
          <!-- 不支持预览的文件类型 -->
          <div v-else class="preview-error">
            <i class="el-icon-document preview-error-icon"></i>
            <div class="preview-error-text">该文件类型不支持在线预览</div>
            <div class="preview-error-actions">
              <el-button type="primary" @click="downloadFile">下载文件</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addKnowledge, updateKnowledge, getKnowledge, downloadFiles1, getPreviewPathPC } from '@/api/system/knowledge'
import { addLog } from '@/api/system/log'
import { getInfo } from '@/api/login'
import FileUpload from '@/components/FileUpload'
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePptx from '@vue-office/pptx'
import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'

export default {
  name: "FileUploadPreview",
  components: {
    FileUpload,
    VueOfficeDocx,
    VueOfficeExcel,
    VueOfficePptx
  },
  props: {
    // 文件用途默认值
    defaultFilePurpose: {
      type: String,
      default: '文件'
    },
    // 组标签名称
    groupLabel: {
      type: String,
      default: '组'
    },
    // 课程列表
    subjectList: {
      type: Array,
      default: () => []
    },
    // 组列表
    groupList: {
      type: Array,
      default: () => []
    },
    // 是否显示课程名选择
    showSubjectSelect: {
      type: Boolean,
      default: true
    },
    // 是否显示组选择
    showGroupSelect: {
      type: Boolean,
      default: true
    },
    // 默认学科代码（自动选择用户的学科）
    defaultSubjectCode: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // 弹窗相关
      open: false,
      title: '',
      form: {
        fileId: null,
        filePurpose: this.defaultFilePurpose,
        userFname: '',
        filePath: null,
        grade: '',
        subjectName: '',
        teachingIds: []
      },
      rules: {
        filePurpose: [
          { required: true, message: '文件用途不能为空', trigger: 'blur' }
        ],
        userFname: [
          { required: true, message: '文件名不能为空', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        subjectName: [
          { required: false, message: '请输入课程名', trigger: 'blur' }
        ],
        filePath: [
          { required: true, message: '请选择文件', trigger: 'change' }
        ],
        teachingIds: [
          { required: true, message: `请选择${this.groupLabel}`, trigger: 'change' }
        ]
      },
      // 自动选择的年级和课程
      autoGrade: null,
      autoSubjectCode: null,
      // 是否是管理员
      isAdmin: false,

      // 预览相关
      previewVisible: false,
      currentPreviewFile: null,
      previewUrl: '',
      textContent: '',
      docxLoading: false,
      previewRetryCount: 0,
      maxRetryCount: 3,
      docxKey: 0,
      docxTimeoutId: null,
      docxRenderError: false
    }
  },
  created() {
    this.checkAdminStatus()
    this.loadUserInfo()
  },
  computed: {
    // 文件类型判断
    isImageFile() {
      if (!this.currentPreviewFile) return false
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return imageTypes.includes(fileType)
    },
    
    isPdfFile() {
      if (!this.currentPreviewFile) return false
      return this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase() === 'pdf'
    },
    
    isTextFile() {
      if (!this.currentPreviewFile) return false
      const textTypes = ['txt', 'md', 'json', 'xml', 'csv', 'log']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return textTypes.includes(fileType)
    },
    
    isVideoFile() {
      if (!this.currentPreviewFile) return false
      const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return videoTypes.includes(fileType)
    },
    
    isAudioFile() {
      if (!this.currentPreviewFile) return false
      const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return audioTypes.includes(fileType)
    },
    
    isDocxFile() {
      if (!this.currentPreviewFile) return false
      const docxTypes = ['doc', 'docx']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return docxTypes.includes(fileType)
    },
    
    isXlsxFile() {
      if (!this.currentPreviewFile) return false
      const xlsxTypes = ['xls', 'xlsx']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return xlsxTypes.includes(fileType)
    },
    
    isPptxFile() {
      if (!this.currentPreviewFile) return false
      const pptxTypes = ['ppt', 'pptx']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return pptxTypes.includes(fileType)
    }
  },
  methods: {
    // 检查是否是管理员
    checkAdminStatus() {
      const roles = this.$store.getters.roles || []
      this.isAdmin = roles.includes('admin')
    },
    
    // 加载用户信息并自动选择年级和课程
    async loadUserInfo() {
      try {
        const response = await getInfo()
        if (response.code === 200 && response.user) {
          const user = response.user
          
          // 根据teachingGrade判断年级
          if (user.teachingGrade) {
            const teachingGrade = user.teachingGrade
            // 如果包含高一、高二、高三，则为高中
            if (teachingGrade.includes('高一') || teachingGrade.includes('高二') || teachingGrade.includes('高三')) {
              this.autoGrade = '高中'
            }
            // 如果包含七年级、八年级、九年级，则为初中
            else if (teachingGrade.includes('七年级') || teachingGrade.includes('八年级') || teachingGrade.includes('九年级')) {
              this.autoGrade = '初中'
            }
          }
          
          // 根据subjectName自动选择课程
          if (user.subjectName) {
            // 将中文学科名转换为英文代码
            this.autoSubjectCode = this.convertSubjectToCode(user.subjectName)
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    
    // 将中文学科名转换为英文代码
    convertSubjectToCode(subjectName) {
      const subjectMap = {
        "物理": "physics",
        "数学": "math", 
        "化学": "chemistry",
        "生物": "biology",
        "科学": "science",
        "语文": "chinese",
        "英语": "english",
        "信息": "tech",
        "通用": "common",
        "历史": "history",
        "政治": "politics",
        "地理": "geography",
        "python": "python"
      }
      
      return subjectMap[subjectName] || null
    },
    
    // 打开添加对话框
    openAddDialog() {
      this.reset()
      
      // 如果不是管理员，自动设置年级和课程
      if (!this.isAdmin) {
        this.$nextTick(() => {
          // 自动设置年级
          if (this.autoGrade) {
            this.form.grade = this.autoGrade
          }
          
          // 自动设置课程（优先使用autoSubjectCode，如果没有则使用defaultSubjectCode）
          const subjectCode = this.autoSubjectCode || this.defaultSubjectCode
          if (subjectCode) {
            const matchedSubject = this.subjectList.find(
              subject => subject.subjectCode === subjectCode
            )
            if (matchedSubject) {
              this.form.subjectName = matchedSubject.subjectCode
            }
          }
        })
      } else {
        // 管理员可以手动选择，但如果有默认值也自动填充
        this.$nextTick(() => {
          if (this.autoGrade) {
            this.form.grade = this.autoGrade
          }
          if (this.defaultSubjectCode) {
            const matchedSubject = this.subjectList.find(
              subject => subject.subjectCode === this.defaultSubjectCode
            )
            if (matchedSubject) {
              this.form.subjectName = matchedSubject.subjectCode
            }
          }
        })
      }
      
      this.open = true
      this.title = "添加文件"
    },

    // 打开修改对话框
    openEditDialog(fileId) {
      this.reset()
      getKnowledge(fileId).then(response => {
        this.form = { ...response.data }
        this.open = true
        this.title = "修改文件"
      })
    },

    // 提交表单
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let formData = Object.assign({}, this.form)
          
          // 处理teachingIds，将数组转换为逗号分隔的字符串
          if (formData.teachingIds && Array.isArray(formData.teachingIds)) {
            formData.teachingIds = formData.teachingIds.join(',')
          }

          if (this.form.fileId != null) {
            updateKnowledge(formData).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功")
                this.open = false
                this.$emit('refresh')
              } else {
                this.$modal.msgError("修改失败：" + (response.msg || "未知错误"))
              }
            }).catch(error => {
              console.error("修改文件失败:", error)
              this.$modal.msgError("修改失败：" + (error.message || "网络错误"))
            })
          } else {
            formData.uploadUserId = this.$store.getters.userId || 1
            formData.uploadTime = new Date().toISOString().split('T')[0]
            addKnowledge(formData).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("新增成功")
                this.open = false
                this.$emit('refresh')
              } else {
                this.$modal.msgError("新增失败：" + (response.msg || "未知错误"))
              }
            }).catch(error => {
              console.error("新增文件失败:", error)
              this.$modal.msgError("新增失败：" + (error.message || "网络错误"))
            })
          }
        }
      })
    },

    // 取消操作
    cancel() {
      this.open = false
      this.reset()
    },

    // 重置表单
    reset() {
      this.form = {
        fileId: null,
        filePurpose: this.defaultFilePurpose,
        userFname: '',
        filePath: null,
        grade: '',
        subjectName: '',
        teachingIds: []
      }
      this.resetForm("form")
    },

    // 预览文件
    handlePreview(row) {
      this.currentPreviewFile = row
      this.previewVisible = true
      this.previewRetryCount = 0
      this.docxLoading = false
      
      // 使用新的API获取预览路径
      this.loadPreviewUrl(row)
    },

    // 加载预览URL
    loadPreviewUrl(row) {
      getPreviewPathPC(row.fileId).then(response => {
        if (response) {
          this.validatePreviewUrl(response, row)
        } else {
          this.fallbackPreview(row)
        }
      }).catch(error => {
        console.error('获取预览路径失败:', error)
        this.fallbackPreview(row)
      })
    },

    // 验证预览URL
    validatePreviewUrl(url, row) {
      if (this.isDocxFile) {
        this.docxLoading = true
        this.docxRenderError = false
        this.previewUrl = url
        this.docxTimeoutId = null
        
        this.$nextTick(() => {
          this.docxKey++
        })
        console.log('开始加载Word文档:', url)
        
        this.setupDocxTimeout()
      } else {
        this.previewUrl = url
        
        if (this.isImageFile || this.isPdfFile) {
          // 对于图片和PDF，直接使用URL
        } else if (this.isVideoFile || this.isAudioFile || this.isXlsxFile) {
          // 对于视频和音频文件，直接使用URL
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
      if (this.docxTimeoutId) {
        clearTimeout(this.docxTimeoutId)
      }
      
      this.docxTimeoutId = setTimeout(() => {
        if (this.docxLoading) {
          console.warn('Word文档加载超时，检查渲染状态')
          this.checkDocxRenderStatus()
        }
      }, 5000)
    },

    // 检查Word文档渲染状态
    checkDocxRenderStatus() {
      if (!this.docxLoading) {
        return
      }
      
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
      
      if (this.previewRetryCount < this.maxRetryCount) {
        console.log('文档未渲染，尝试重新加载')
        this.retryPreview(this.currentPreviewFile)
      } else {
        console.error('文档渲染失败，已达重试上限')
        this.docxLoading = false
        this.$message.error('文档预览失败，请尝试下载文件查看')
      }
    },

    // 重试预览
    retryPreview(row) {
      if (!this.docxLoading) {
        console.log('文档已加载完成，取消重试')
        return
      }
      
      if (this.previewRetryCount < this.maxRetryCount) {
        this.previewRetryCount++
        console.log(`重试预览，第${this.previewRetryCount}次`)
        
        if (this.docxTimeoutId) {
          clearTimeout(this.docxTimeoutId)
          this.docxTimeoutId = null
        }
        
        setTimeout(() => {
          if (this.docxLoading) {
            this.loadPreviewUrl(row)
          }
        }, 2000)
      } else {
        console.error('预览重试次数已达上限')
        this.docxLoading = false
        this.$message.error('文档预览失败，请尝试下载文件查看')
      }
    },

    // 回退预览方法
    fallbackPreview(row) {
      if (this.isImageFile || this.isPdfFile || this.isDocxFile || this.isXlsxFile) {
        this.previewUrl = process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(row.filePath) + '&delete=' + false
      } else if (this.isVideoFile || this.isAudioFile) {
        this.previewUrl = process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(row.filePath) + '&delete=' + false
      } else if (this.isTextFile) {
        this.loadTextContent(row.filePath)
      } else if (this.isPptxFile) {
        this.previewUrl = process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(row.filePath) + '&delete=' + false
      } else {
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
      if (this.currentPreviewFile) {
        const formData = { fileIdList: [this.currentPreviewFile.fileId] }
        addLog({
          calledTableName: '文件',
          calledTableId: this.currentPreviewFile.fileId,
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
    handleDownloadResponse(response, fileName) {
      let downloadFileName = fileName || 'download'

      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const match1 = contentDisposition.match(/filename="([^"]+)"/)
        const match2 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)

        if (match1) {
          downloadFileName = match1[1]
        } else if (match2) {
          downloadFileName = decodeURIComponent(match2[1])
        } else {
          const rawMatch = contentDisposition.split('filename=').pop().split(';')[0].replace(/"/g, '')
          downloadFileName = decodeURIComponent(rawMatch)
        }
      }

      const isZipFile =
        response.headers['content-type'] === 'application/zip' ||
        response.headers['content-type'] === 'application/x-zip-compressed' ||
        (downloadFileName && downloadFileName.toLowerCase().endsWith('.zip'))

      if (isZipFile) {
        downloadFileName = 'download.zip'
      }

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
      
      if (this.docxTimeoutId) {
        clearTimeout(this.docxTimeoutId)
        this.docxTimeoutId = null
      }
      
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
      this.docxLoading = false
      
      if (this.docxTimeoutId) {
        clearTimeout(this.docxTimeoutId)
        this.docxTimeoutId = null
      }
      
      if (error && error.message) {
        const isComplexError = error.message.includes('appendChild') || 
                              error.message.includes('beginChar') ||
                              error.message.includes('innerHTML') ||
                              error.message.includes('renderMmlDelimiter') ||
                              error.message.includes('Cannot read properties of undefined')
        
        if (isComplexError) {
          console.warn('检测到复杂DOM操作错误，启用降级模式')
          this.docxRenderError = true
          this.$message.warning('该文档格式复杂，无法在线预览')
          return
        }
      }
      
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
      
      if (shouldRetry && this.previewRetryCount < this.maxRetryCount) {
        console.log('尝试重新渲染组件')
        this.retryPreview(this.currentPreviewFile)
        return
      }
      
      this.docxRenderError = true
      this.$message.error('文档预览失败，请下载文件查看')
      
      if (this.currentPreviewFile) {
        addLog({
          calledTableName: '文件预览错误',
          calledTableId: this.currentPreviewFile.fileId,
          isRead: 0,
          isClickRead: 0,
          isUsed: 0,
          errorInfo: error.message || '未知错误'
        })
      }
    },

    // 处理预览弹窗关闭事件
    handlePreviewDialogClose() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause()
        this.$refs.videoPlayer.currentTime = 0
      }
      
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.pause()
        this.$refs.audioPlayer.currentTime = 0
      }
      
      this.currentPreviewFile = null
      this.previewUrl = ''
      this.textContent = ''
      this.docxLoading = false
      this.docxRenderError = false
      this.previewRetryCount = 0
      
      if (this.docxTimeoutId) {
        clearTimeout(this.docxTimeoutId)
        this.docxTimeoutId = null
      }
      
      console.log('预览弹窗已关闭，媒体播放已停止')
    }
  }
}
</script>

<style scoped>
.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.upload-tip i {
  margin-right: 4px;
  color: #409EFF;
}

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
  margin-top: -20px;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.file-name-display {
  text-align: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name-display h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* padding: 20px; */
  background: #fff;
}

.preview-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
}

.preview-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #f56c6c;
}

.preview-error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.preview-error-text {
  font-size: 14px;
  margin-bottom: 16px;
}

.preview-error-actions {
  display: flex;
  gap: 10px;
}

/* 文件类型预览样式 */
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
  /* padding: 20px; */
}

.preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

/* 视频和音频预览样式 */
.video-preview, .audio-preview {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /* padding: 20px; */
}

.preview-video, .preview-audio {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.preview-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

/* Office文档预览样式 */
.office-preview {
  flex: 1;
  padding: 20px;
  min-height: 500px;
}
</style>
