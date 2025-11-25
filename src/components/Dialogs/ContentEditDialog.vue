<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="85%"
    :before-close="handleDialogClose"
    top="2vh !important"
    height="96vh !important"
    append-to-body
    :modal="true"
    style="overflow: visible;"
    :modal-append-to-body="true"
    @close="handleDialogClose"
  >
    <div class="edit-dialog-container">
      <div class="edit-header">
        <div class="header-info">
          <h4>{{ title }}</h4>
          <p class="header-tip">
            <i class="el-icon-info"></i>
            支持Markdown格式编辑，可以插入图片、表格、公式等
          </p>
        </div>
        <div class="header-actions">
          <el-button size="small" @click="toggleEditMode">
            <i :class="isEditing ? 'el-icon-view' : 'el-icon-edit'"></i>
            {{ isEditing ? '预览' : '编辑' }}
          </el-button>
          <el-button size="small" @click="resetContent">
            <i class="el-icon-refresh"></i>
            重置内容
          </el-button>
        </div>
      </div>
      
      <div class="edit-content">
        
        <!-- 编辑模式：使用mavon-editor -->
        <div v-if="isEditing" class="edit-mode">
          <!-- 自定义工具栏 -->
          <div class="custom-toolbar">
            <el-button size="small" @click="showImageUploadDialog">
              <i class="el-icon-picture"></i>
              上传图片
            </el-button>
            <span class="toolbar-tip">支持Markdown格式编辑,可以插入图片、表格、公式等</span>
            
            <!-- 图片预览区域 -->
            <div v-if="imageUrl" class="image-preview-section">
              <div class="image-preview-wrapper">
                <img 
                  :src="imageUrl" 
                  :alt="selectedFile ? selectedFile.name : '图片预览'"
                  class="toolbar-image-preview"
                  @error="handleImageError"
                />
                <div class="image-actions">
                  <el-button size="mini" @click="copyImageUrl" icon="el-icon-copy-document">复制链接</el-button>
                  <el-button size="mini" @click="insertImageToEditor" type="primary" icon="el-icon-picture">插入图片</el-button>
                  <el-button size="mini" @click="clearImagePreview" icon="el-icon-close">清除</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 符号工具栏 -->
          <SymbolToolbar @insert-symbol="insertQuickText" />
          
          <mavon-editor
            ref="editEditor"
            v-model="currentContent"
            :toolbars="toolbars"
            :boxShadow="false"
            :subfield="true"
            :defaultOpen="'edit'"
            :editable="true"
            :toolbarsFlag="true"
            :navigation="false"
            :shortCut="false"
            :codeStyle="'github'"
            :ishljs="true"
            :autofocus="false"
            :placeholder="placeholder"
            :scrollStyle="true"
            :boxShadowStyle="'0 2px 12px 0 rgba(0, 0, 0, 0.1)'"
            :transition="true"
            @change="handleContentChange"
            :previewBackground="'#fff'"
            :html="false"
            :xssOptions="xssOptions"
            style="height: 400px;"
          />
        </div>

        <!-- 预览模式：使用marked渲染 -->
        <div v-else class="preview-mode">
          <div ref="markdownContainer" class="markdown-preview" v-html="renderedMarkdown"></div>
        </div>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button type="primary" @click="confirmSave">
        <i class="el-icon-check"></i>
        保存修改
      </el-button>
    </div>

    <!-- 图片上传弹框 -->
    <el-dialog
      title="上传图片"
      :visible.sync="imageUploadVisible"
      width="500px"
      :before-close="handleImageUploadClose"
      append-to-body
    >
      <div class="image-upload-container">
        <div class="upload-section">
          <h4>选择学科</h4>
          <el-select 
            v-model="selectedSubject" 
            placeholder="请选择学科" 
            class="full-width"
            :loading="teacherInfoLoading"
          >
            <el-option
              v-for="subject in subjectOptions"
              :key="subject"
              :label="subject"
              :value="subject"
            />
          </el-select>
          <div v-if="selectedSubject && questionData && questionData.subject_name" 
               class="auto-selected-tip">
            <i class="el-icon-check"></i>
            已自动选择当前题目的学科：{{ selectedSubject }}
            <span v-if="questionData.subject_name !== selectedSubject" class="original-subject">
              (原科目：{{ questionData.subject_name }})
            </span>
          </div>
        </div>
        
        <div class="upload-section">
          <h4>选择图片文件</h4>
          <el-upload
            class="image-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-success="handleImageUploadSuccess"
            :on-error="handleImageUploadError"
            :on-change="handleFileChange"
            action=""
            :auto-upload="false"
            accept="image/*"
          >
            <el-button size="small" type="primary" :disabled="!selectedSubject">
              <i class="el-icon-upload"></i>
              选择图片
            </el-button>
          </el-upload>
          <p class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</p>
          <div v-if="selectedFile" class="file-info">
            <p><strong>已选择文件：</strong>{{ selectedFile.name }}</p>
            <p><strong>文件大小：</strong>{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        
        <div v-if="imageUrl" class="upload-section">
          <h4>图片预览</h4>
          <div class="image-preview-container">
            <img 
              :src="imageUrl" 
              :alt="selectedFile ? selectedFile.name : '图片预览'"
              class="image-preview"
              @error="handleImageError"
            />
            <div class="image-link-section">
              <h5>图片链接</h5>
              <el-input
                v-model="imageUrl"
                readonly
                placeholder="图片上传后将显示链接"
                class="image-link-input"
              >
                <el-button slot="append" @click="copyImageUrl">复制</el-button>
              </el-input>
            </div>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleImageUploadClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="insertImageToEditor"
          :disabled="!selectedFile || !selectedSubject"
        >
          <i class="el-icon-picture"></i>
          插入图片
        </el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import SymbolToolbar from '@/components/SymbolToolbar'
import { marked } from 'marked'
import { uploadImage } from '@/api/system/teacher'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export default {
  name: 'ContentEditDialog',
  components: {
    SymbolToolbar,
    mavonEditor
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '内容编辑'
    },
    content: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    editType: {
      type: String,
      default: 'question'
    },
    questionData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      isEditing: true,
      currentContent: '',
      originalContent: '', // 存储原始内容用于重置
      renderedMarkdown: '',
      
      // 图片上传相关
      teacherInfo: null,
      teacherInfoLoading: false,
      imageUploadVisible: false,
      imageFile: null,
      selectedFile: null,
      imageUrl: '',
      selectedSubject: '',
      subjectOptions: [],
      
      // 编辑器工具栏配置
      toolbars: {
        bold: true,
        italic: true,
        header: true,
        underline: true,
        strikethrough: true,
        mark: true,
        superscript: true,
        subscript: true,
        quote: true,
        ol: true,
        ul: true,
        link: true,
        imagelink: false, // 禁用图片链接功能
        code: true,
        table: true,
        fullscreen: true,
        readmodel: true,
        htmlcode: true,
        help: true,
        undo: true,
        redo: true,
        trash: true,
        save: false,
        navigation: true,
        alignleft: true,
        aligncenter: true,
        alignright: true,
        subfield: true,
        preview: true
      }
    }
  },
  computed: {
    xssOptions() {
      return {
        whiteList: {
          h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
          p: [], div: [], span: [], strong: [], em: [], b: [], i: [],
          ul: [], ol: [], li: [], blockquote: [], code: [], pre: [],
          table: [], thead: [], tbody: [], tr: [], th: [], td: [],
          a: ['href', 'title'], img: ['src', 'alt', 'title'],
          hr: [], br: []
        }
      }
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
        if (newVal) {
          this.initDialog()
        }
      },
      immediate: true
    },
    content: {
      handler(newVal) {
        this.currentContent = newVal || ''
        this.updateRenderedMarkdown()
      },
      immediate: true
    }
  },
  methods: {
    // 初始化弹窗
    initDialog() {
      this.originalContent = this.content || ''
      this.currentContent = this.content || ''
      this.isEditing = true
      this.updateRenderedMarkdown()
    },

    // 更新渲染的Markdown
    updateRenderedMarkdown() {
      this.renderedMarkdown = this.renderMarkdown(this.currentContent)
    },

    // 使用marked渲染Markdown
    renderMarkdown(markdown) {
      if (!markdown) return ''
      
      // 如果是数组，转换为字符串
      let markdownText = markdown
      if (Array.isArray(markdown)) {
        markdownText = markdown.join('\n')
      } else if (typeof markdown !== 'string') {
        markdownText = String(markdown)
      }
      
      const options = { 
        breaks: true, 
        gfm: true, 
        headerIds: false, 
        mangle: false, 
        tables: true 
      }
      let html = marked.parse(markdownText, options)
      html = html.replace(/<table>/g, '<table border="1" style="border-collapse: collapse;">')
      
      // 渲染数学公式
      html = this.renderMathFormulas(html)
      
      return html
    },

    // 渲染数学公式
    renderMathFormulas(html) {
      if (!html) return html
      
      try {
        // 预处理：去除化学公式中的 \ce 前缀
        html = html.replace(/\\ce\{([^}]+)\}/g, (match, formula) => {
          return formula // 直接返回化学公式内容，去除 \ce 前缀
        })
        
        // 渲染LaTeX行内公式 \(...\)
        html = html.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX LaTeX inline formula error:', e, 'Formula:', formula)
            return `<span class="math-error" title="公式渲染错误: ${e.message}">\\(${formula}\\)</span>`
          }
        })
        
        // 渲染LaTeX块级公式 \[...\]
        html = html.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX LaTeX display formula error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\[${formula}\\]</div>`
          }
        })
        
        // 渲染行内公式 $...$
        html = html.replace(/\$([^$]+)\$/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX inline formula error:', e, 'Formula:', formula)
            return `<span class="math-error" title="公式渲染错误: ${e.message}">$${formula}$</span>`
          }
        })
        
        // 渲染块级公式 $$...$$
        html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX display formula error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">$$${formula}$$</div>`
          }
        })
        
        // 渲染LaTeX环境 \begin{equation}...\end{equation}
        html = html.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (match, formula) => {
          try {
            return katex.renderToString(formula.trim(), {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX equation error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{equation}${formula}\\end{equation}</div>`
          }
        })
        
        // 渲染LaTeX环境 \begin{align}...\end{align}
        html = html.replace(/\\begin\{align\}([\s\S]*?)\\end\{align\}/g, (match, formula) => {
          try {
            return katex.renderToString(formula.trim(), {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX align error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{align}${formula}\\end{align}</div>`
          }
        })
        
        // 渲染LaTeX环境 \begin{pmatrix}...\end{pmatrix}
        html = html.replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g, (match, formula) => {
          try {
            return katex.renderToString(formula.trim(), {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX pmatrix error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{pmatrix}${formula}\\end{pmatrix}</div>`
          }
        })
        
        // 渲染LaTeX环境 \begin{bmatrix}...\end{bmatrix}
        html = html.replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g, (match, formula) => {
          try {
            return katex.renderToString(formula.trim(), {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX bmatrix error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{bmatrix}${formula}\\end{bmatrix}</div>`
          }
        })
        
        // 渲染LaTeX环境 \begin{vmatrix}...\end{vmatrix}
        html = html.replace(/\\begin\{vmatrix\}([\s\S]*?)\\end\{vmatrix\}/g, (match, formula) => {
          try {
            return katex.renderToString(formula.trim(), {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX vmatrix error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{vmatrix}${formula}\\end{vmatrix}</div>`
          }
        })
        
        // 渲染LaTeX环境 \begin{Vmatrix}...\end{Vmatrix}
        html = html.replace(/\\begin\{Vmatrix\}([\s\S]*?)\\end\{Vmatrix\}/g, (match, formula) => {
          try {
            return katex.renderToString(formula.trim(), {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX Vmatrix error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{Vmatrix}${formula}\\end{Vmatrix}</div>`
          }
        })
        
        // 渲染LaTeX环境 \begin{cases}...\end{cases}
        html = html.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (match, formula) => {
          try {
            return katex.renderToString(formula.trim(), {
              throwOnError: false,
              displayMode: true,
              strict: false
            })
          } catch (e) {
            console.warn('KaTeX cases error:', e, 'Formula:', formula)
            return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{cases}${formula}\\end{cases}</div>`
          }
        })
        
      } catch (e) {
        console.error('Math formula rendering error:', e)
      }
      
      return html
    },

    // 切换编辑模式
    toggleEditMode() {
      if (this.isEditing) {
        this.updateRenderedMarkdown()
      }
      this.isEditing = !this.isEditing
      console.log('切换编辑模式:', this.isEditing ? '编辑' : '预览')
    },

    // 重置内容
    resetContent() {
      this.currentContent = this.originalContent
      this.updateRenderedMarkdown()
      this.$message.success('内容已重置')
    },

    // 处理内容变化
    handleContentChange() {
      this.updateRenderedMarkdown()
      this.$emit('content-change', this.currentContent)
    },

    // 确认保存
    confirmSave() {
      if (!this.currentContent) {
        this.$message.error('内容不能为空')
        return
      }
      
      this.$emit('confirm', {
        content: this.currentContent,
        editType: this.editType
      })
      
      this.handleDialogClose()
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false
      this.currentContent = ''
      this.originalContent = ''
      this.renderedMarkdown = ''
      this.isEditing = true
      this.clearImagePreview()
      this.$emit('close')
    },

    // 显示图片上传弹框
    async showImageUploadDialog() {
      this.imageUploadVisible = true
      this.imageUrl = ''
      this.selectedSubject = ''
      
      // 获取老师信息
      try {
        this.teacherInfoLoading = true
        // 使用模拟数据，保持原有逻辑
        this.subjectOptions = [
          '语文', '数学', '英语', '物理', '化学', '生物', '信息', 
          '素质教育', '科学', '通用', '历史', '政治', '地理', 
          'python', '体育', '音乐', '心理', '美术', '劳技', '社会'
        ]
      } catch (error) {
        console.error('获取老师信息失败:', error)
        this.$message.error('获取老师信息失败')
        // 使用默认科目列表
        this.subjectOptions = [
          '语文', '数学', '英语', '物理', '化学', '生物', '信息', 
          '素质教育', '科学', '通用', '历史', '政治', '地理', 
          'python', '体育', '音乐', '心理', '美术', '劳技', '社会'
        ]
      } finally {
        this.teacherInfoLoading = false
      }
      
      // 自动设置当前题目的科目
      if (this.questionData && this.questionData.subject_name) {
        const currentSubject = this.questionData.subject_name
        // 提取基础学科名称（去掉"高中"、"初中"等前缀）
        const baseSubject = this.extractBaseSubject(currentSubject)
        
        // 检查基础科目是否在可选科目列表中
        if (this.subjectOptions.includes(baseSubject)) {
          this.selectedSubject = baseSubject
          console.log('自动设置科目为:', baseSubject, '(原科目:', currentSubject, ')')
        } else {
          console.log('当前题目科目不在可选列表中:', baseSubject, '(原科目:', currentSubject, ')')
          // 如果当前科目不在列表中，可以选择第一个科目或保持为空
          if (this.subjectOptions.length > 0) {
            this.selectedSubject = this.subjectOptions[0]
            console.log('使用默认科目:', this.subjectOptions[0])
          }
        }
      } else {
        console.log('没有当前题目或科目信息')
        // 如果没有当前题目，可以选择第一个科目
        if (this.subjectOptions.length > 0) {
          this.selectedSubject = this.subjectOptions[0]
          console.log('使用默认科目:', this.subjectOptions[0])
        }
      }
    },

    // 提取基础学科名称（去掉"高中"、"初中"等前缀）
    extractBaseSubject(subjectName) {
      if (!subjectName) return ''
      
      // 定义需要去掉的前缀
      const prefixes = ['高中', '初中']
      
      // 遍历前缀，找到匹配的就去掉
      for (const prefix of prefixes) {
        if (subjectName.startsWith(prefix)) {
          return subjectName.substring(prefix.length)
        }
      }
      
      // 如果没有匹配的前缀，直接返回原名称
      return subjectName
    },

    handleFileChange(file, fileList) {
      // 文件选择时的处理
      if (file && file.raw) {
        this.selectedFile = file.raw
        this.imageFile = file.raw
      }
    },

    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      if (!this.selectedSubject) {
        this.$message.error('请先选择学科!')
        return false
      }

      // 保存选中的文件
      this.selectedFile = file
      this.imageFile = file
      
      // 不在这里自动上传，等用户点击"插入图片"时再上传
      return false // 阻止自动上传
    },

    async uploadImageFile(file) {
      try {
        // 生成带时间戳的文件名
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        const newFileName = `${fileNameWithoutExt}_${timestamp}.${fileExtension}`
        
        // 创建新的文件对象，使用带时间戳的文件名
        const fileWithTimestamp = new File([file], newFileName, {
          type: file.type,
          lastModified: file.lastModified
        })

        const formData = new FormData()
        formData.append('file', fileWithTimestamp)
        formData.append('subjectName', this.selectedSubject)

        const response = await uploadImage(formData)
        if (response && response.code === 200) {
          this.imageUrl = response.data
          this.$message.success('图片上传成功!')
        } else {
          this.$message.error(response.msg || '图片上传失败!')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败!')
      }
    },

    handleImageUploadSuccess(response, file, fileList) {
      // 这个方法不会被调用，因为我们阻止了自动上传
    },

    handleImageUploadError(error, file, fileList) {
      this.$message.error('图片上传失败!')
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    handleImageError(event) {
      console.error('图片加载失败:', event)
      this.$message.error('图片加载失败，请检查链接是否正确')
    },

    clearImagePreview() {
      this.imageUrl = ''
      this.selectedFile = null
      this.imageFile = null
    //   this.$message.success('图片预览已清除')
    },

    copyImageUrl() {
      if (this.imageUrl) {
        navigator.clipboard.writeText(this.imageUrl).then(() => {
          this.$message.success('图片链接已复制到剪贴板!')
        }).catch(() => {
          // 降级处理
          const textArea = document.createElement('textarea')
          textArea.value = this.imageUrl
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          this.$message.success('图片链接已复制到剪贴板!')
        })
      }
    },

    async insertImageToEditor() {
      if (!this.selectedFile || !this.selectedSubject) {
        this.$message.warning('请先选择学科和图片文件!')
        return
      }

      // 如果没有imageUrl，先上传图片
      if (!this.imageUrl) {
        try {
          this.$message.info('正在上传图片，请稍候...')
          await this.uploadImageFile(this.selectedFile)
          
          // 上传失败时直接返回
          if (!this.imageUrl) {
            return
          }
        } catch (error) {
          this.$message.error('图片上传失败!')
          return
        }
      }

      // 插入图片到mavon-editor - 保持原有的imageHtml格式
      const imageHtml = `<img src="${this.imageUrl}">`
      
      // 直接添加到内容中，避免insertText方法的问题
      this.currentContent += imageHtml
      this.updateRenderedMarkdown()
      this.$message.success('图片已添加到内容中!')

      // 插入成功后关闭弹框
      this.handleImageUploadClose()
    },

    handleImageUploadClose() {
      this.imageUploadVisible = false
      // 保留图片URL和相关数据，不清除
      // this.imageUrl = ''
      // this.selectedSubject = ''
      // this.selectedFile = null
      // this.imageFile = null
    },

    // 插入快速文本
    insertQuickText(data) {
      if (data && data.symbol) {
        this.currentContent += data.symbol
        this.updateRenderedMarkdown()
      }
    }
  }
}
</script>

<style scoped>
.edit-dialog-container {
  padding: 0;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.header-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.header-tip {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.header-tip i {
  margin-right: 5px;
  color: #409eff;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-content {
    height: 65vh;
    overflow-y: auto;
    min-height: 450px;
}

.edit-mode {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.custom-toolbar {
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.toolbar-tip {
  color: #909399;
  font-size: 12px;
}

.image-preview-section {
  margin-top: 10px;
  width: 100%;
}

.image-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.toolbar-image-preview {
  max-width: 100px;
  max-height: 100px;
  border-radius: 4px;
}

.image-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-mode {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  background-color: #fff;
  min-height: 400px;
}

.markdown-preview {
  line-height: 1.6;
  color: #303133;
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin: 20px 0 10px 0;
  color: #303133;
}

.markdown-preview p {
  margin: 10px 0;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.markdown-preview table th,
.markdown-preview table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-preview table th {
  background-color: #f5f5f5;
}

.markdown-preview code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.markdown-preview pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-preview blockquote {
  border-left: 4px solid #409eff;
  margin: 10px 0;
  padding-left: 15px;
  color: #606266;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

.image-upload-container {
  padding: 0;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.full-width {
  width: 100%;
}

.auto-selected-tip {
  margin-top: 8px;
  padding: 8px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.auto-selected-tip i {
  color: #67c23a;
  margin-right: 5px;
}

.original-subject {
  color: #909399;
}

.image-uploader {
  width: 100%;
}

.upload-area {
  width: 100%;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-area i {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.file-info {
  margin-top: 10px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.file-info p {
  margin: 4px 0;
}

.image-preview-container {
  text-align: center;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.image-link-section {
  margin-top: 15px;
}

.image-link-section h5 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.image-link-input {
  width: 100%;
}

/* 数学公式渲染样式 */
.math-error {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* KaTeX 公式样式优化 */
.katex {
  font-size: 1.1em;
}

.katex-display {
  margin: 1em 0;
  text-align: center;
}

/* 行内公式样式 */
.markdown-preview .katex {
  margin: 0 2px;
}

/* 块级公式样式 */
.markdown-preview .katex-display {
  margin: 20px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

/* 数学公式在预览模式下的特殊样式 */
.preview-mode .katex {
  color: #303133;
}

.preview-mode .katex-display {
  background-color: #f5f7fa;
  border-left-color: #67c23a;
}
</style>