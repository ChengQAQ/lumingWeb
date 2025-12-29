<template>
  <el-dialog
    title="Markdown文件编辑"
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
        <div style="display: flex">
          <div class="form-item" style="margin-right: 20px">
            <h3>选择学科</h3>
            <el-select
              v-model="formData.subject_name"
              placeholder="请选择学科"
              class="full-width"
              @change="handleSubjectChange"
              :loading="subjectLoading"
              filterable
            >
              <el-option
                v-for="subjectItem in subjectOptions"
                :key="subjectItem.subjectId || subjectItem.id"
                :label="subjectItem.subjectName || subjectItem.name"
                :value="subjectItem.subjectName || subjectItem.name"
              >
              </el-option>
            </el-select>
          </div>

          <!-- 章节路径选择 -->
          <div class="form-item">
            <h3>选择章节路径</h3>
            <div class="chapter-selector">
              <el-button
                type="primary"
                plain
                @click="openChapterSelector"
                :disabled="!formData.subject_name"
                class="chapter-select-button"
              >
                <i class="el-icon-folder-opened"></i>
                {{ formData.chapter_path || '点击选择章节路径' }}
              </el-button>
              <div v-if="formData.chapter_path" class="selected-path-display">
                <el-tag type="success" size="small" closable @close="clearChapterPath">
                  {{ formData.chapter_path }}
                </el-tag>
              </div>
            </div>
          </div>
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

      <div class="edit-content" :style="{overflowY: isEditing ? 'hidden' : 'auto'}">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-loading :loading="loading" text="正在加载Markdown文件..."/>
        </div>

        <!-- 编辑/预览模式：使用mavon-editor -->
        <div v-else class="edit-mode">
          <!-- 分隔符工具栏 -->
          <div v-if="isEditing" class="separator-toolbar">
            <span class="toolbar-label">分隔符：</span>
            <el-button size="small" @click="insertSeparator('=>*')" type="primary" plain>
              =>* 问题分隔符
            </el-button>
            <el-button size="small" @click="insertSeparator('=}*')" type="success" plain>
              =}* 答案分隔符
            </el-button>
            <el-button size="small" @click="insertSeparator('=?*')" type="warning" plain>
              =?* 解析分隔符
            </el-button>
          </div>

          <mavon-editor
            ref="editEditor"
            v-model="currentContent"
            :toolbars="toolbars"
            :boxShadow="false"
            :subfield="true"
            :defaultOpen="isEditing ? 'edit' : 'preview'"
            :editable="true"
            :toolbarsFlag="true"
            :navigation="false"
            :shortCut="false"
            :codeStyle="'github'"
            :ishljs="true"
            :autofocus="false"
            :placeholder="'请输入Markdown内容...'"
            :scrollStyle="true"
            :boxShadowStyle="'0 2px 12px 0 rgba(0, 0, 0, 0.1)'"
            :transition="true"
            @change="handleContentChange"
            :previewBackground="'#fff'"
            :html="false"
            :xssOptions="xssOptions"
            style="height: 58vh;"
          />
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

    <!-- 章节选择弹窗 -->
    <ChapterSelectorDialog
      :visible="chapterDialogVisible"
      :subject-name="formData.subject_name"
      :chapter-tree-data="chapterTreeData"
      @confirm="handleChapterSelectionConfirm"
      @close="handleChapterDialogClose"
    />

  </el-dialog>
</template>

<script>
import { marked } from 'marked'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { parseQuestionSplit, markdownTextToJson } from '@/api/system/teachingMaterials'
import { getChapterMap } from '@/api/system/chapterTitle'
import { listSubject } from '@/api/system/subject'
import ChapterSelectorDialog from '@/components/Dialogs/ChapterSelectorDialog'

export default {
  name: 'MarkdownEditDialog',
  components: {
    mavonEditor,
    ChapterSelectorDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Markdown文件编辑'
    },
    markdownData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      dialogVisible: false,
      isEditing: true,
      currentContent: '',
      originalContent: '',
      renderedMarkdown: '',
      loading: false,
      markdownInfo: null,

      // 表单数据
      formData: {
        subject_name: '',
        chapter_path: ''
      },
      chapterDialogVisible: false,
      chapterTreeData: [], // 存储章节树数据
      // 科目选项列表
      subjectOptions: [],
      subjectLoading: false,

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
        imagelink: false,
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
        // 弹窗打开时，加载科目列表
        if (newVal) {
          this.loadSubjectList()
        }
        if (newVal && this.markdownData) {
          this.initDialog()
        }
      },
      immediate: true
    },
    markdownData: {
      handler(newVal) {
        if (newVal && this.dialogVisible) {
          this.initDialog()
        }
      },
      deep: true
    }
  },
  methods: {
    // 初始化弹窗
    async initDialog() {
      if (!this.markdownData) {
        this.$message.error('没有Markdown数据')
        return
      }

      this.loading = true
      this.markdownInfo = this.markdownData.markdown || null

      try {
        let markdownContent = ''

        // 优先使用返回的content字段（可能是合并后的内容）
        if (this.markdownData.content) {
          markdownContent = this.markdownData.content
        }
        // 如果有原始数据需要分别加载
        else if (this.markdownData._questionData || this.markdownData._analysisData) {
          // 分别加载题目和解析文档的内容
          const parts = []

          // 加载题目文档
          if (this.markdownData._questionData) {
            let questionContent = ''
            if (this.markdownData._questionData.content) {
              questionContent = this.markdownData._questionData.content
            } else if (this.markdownData._questionData.markdown && this.markdownData._questionData.markdown.download_url) {
              questionContent = await this.loadMarkdownFromUrl(this.markdownData._questionData.markdown.download_url)
            }

            if (questionContent) {
              parts.push('# 题目文档\n\n' + questionContent)
            }
          }

          // 加载解析文档
          if (this.markdownData._analysisData) {
            let analysisContent = ''
            if (this.markdownData._analysisData.content) {
              analysisContent = this.markdownData._analysisData.content
            } else if (this.markdownData._analysisData.markdown && this.markdownData._analysisData.markdown.download_url) {
              analysisContent = await this.loadMarkdownFromUrl(this.markdownData._analysisData.markdown.download_url)
            }

            if (analysisContent) {
              if (parts.length > 0) {
                parts.push('\n\n---\n\n')
              }
              parts.push('# 解析文档\n\n' + analysisContent)
            }
          }

          markdownContent = parts.join('')
        }
        // 如果有markdown下载地址，从URL加载
        else if (this.markdownInfo && this.markdownInfo.download_url) {
          markdownContent = await this.loadMarkdownFromUrl(this.markdownInfo.download_url)
        } else {
          this.$message.warning('未找到Markdown内容')
          markdownContent = ''
        }

        // 处理图片路径 - 如果返回数据中有images信息，替换Markdown中的图片路径
        if (this.markdownData.images && this.markdownData.images.download_url) {
          markdownContent = this.processImagePaths(markdownContent, this.markdownData.images.download_url)
        }

        this.originalContent = markdownContent
        this.currentContent = markdownContent
        this.updateRenderedMarkdown()
      } catch (error) {
        console.error('初始化Markdown内容失败:', error)
        this.$message.error('加载Markdown内容失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    // 处理图片路径 - 将相对路径转换为完整URL
    processImagePaths(markdownContent, imagesBaseUrl) {
      if (!markdownContent || !imagesBaseUrl) {
        return markdownContent
      }

      // 处理Markdown中的图片路径
      // 匹配格式: ![](images/xxx.jpg) 或 ![alt](images/xxx.jpg)
      const imagePattern = /!\[([^\]]*)\]\((images\/[^)]+)\)/g

      return markdownContent.replace(imagePattern, (match, alt, imagePath) => {
        // 如果路径已经是完整URL，不处理
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return match
        }

        // 构建完整的图片URL
        let fullImageUrl = imagesBaseUrl
        if (!fullImageUrl.endsWith('/')) {
          fullImageUrl += '/'
        }
        if (imagePath.startsWith('images/')) {
          // 如果imagesBaseUrl已经包含images目录，直接拼接文件名
          const fileName = imagePath.replace('images/', '')
          fullImageUrl += fileName
        } else {
          fullImageUrl += imagePath
        }

        // 如果是相对路径，添加base API
        if (!fullImageUrl.startsWith('http://') && !fullImageUrl.startsWith('https://')) {
          fullImageUrl = process.env.VUE_APP_BASE_API + fullImageUrl
        }

        return `![${alt}](${fullImageUrl})`
      })
    },

    // 从URL加载Markdown文件
    async loadMarkdownFromUrl(url) {
      try {
        // 如果URL是相对路径，添加base API
        let fullUrl = url
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          fullUrl = process.env.VUE_APP_BASE_API + url
        }

        const response = await fetch(fullUrl)
        if (response.ok) {
          const text = await response.text()
          return text
        } else {
          throw new Error('HTTP ' + response.status)
        }
      } catch (error) {
        console.error('从URL加载Markdown失败:', error)
        throw error
      }
    },

    // 下载Markdown文件
    downloadMarkdown() {
      if (this.markdownInfo && this.markdownInfo.download_url) {
        let url = this.markdownInfo.download_url
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = process.env.VUE_APP_BASE_API + url
        }
        window.open(url, '_blank')
      }
    },

    // 更新渲染的Markdown
    updateRenderedMarkdown() {
      this.renderedMarkdown = this.renderMarkdown(this.currentContent)
    },

    // 使用marked渲染Markdown
    renderMarkdown(markdown) {
      if (!markdown) return ''

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
          return formula
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

      } catch (e) {
        console.error('Math formula rendering error:', e)
      }

      return html
    },

    // 切换编辑模式
    toggleEditMode() {
      // 调用 mavon-editor 自带的预览切换方法
      const editor = this.$refs.editEditor
      if (editor && typeof editor.togglePreview === 'function') {
        editor.togglePreview()
        // 切换状态以更新按钮文本
        this.isEditing = !this.isEditing
      } else {
        // 降级处理：如果方法不存在，使用原来的逻辑
        if (this.isEditing) {
          this.updateRenderedMarkdown()
        }
        this.isEditing = !this.isEditing
      }
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

    // 从合并后的内容中提取题目和解析部分
    extractQuestionAndAnswerContent(content) {
      if (!content || !content.trim()) {
      return {
        questions_content: '',
        answers_content: '',
        question_separator: '=>*',
        answer_separator: '=}*',
        parse_separator: '=?*'
      }
      }

      let questions_content = ''
      let answers_content = ''

      // 检查内容是否包含合并标记（题目文档和解析文档）
      const questionHeader = '# 题目文档'
      const analysisHeader = '# 解析文档'
      const separator = '---'

      if (content.includes(questionHeader) && content.includes(analysisHeader)) {
        // 内容已合并，需要分离
        const questionIndex = content.indexOf(questionHeader)
        const analysisIndex = content.indexOf(analysisHeader)

        // 提取题目部分（从"# 题目文档"到"---"或"# 解析文档"之间的内容）
        let questionEndIndex = content.indexOf(separator, questionIndex)
        if (questionEndIndex === -1 || questionEndIndex > analysisIndex) {
          questionEndIndex = analysisIndex
        }

        if (questionIndex !== -1 && questionEndIndex !== -1) {
          questions_content = content.substring(
            questionIndex + questionHeader.length,
            questionEndIndex
          ).trim()
        }

        // 提取解析部分（从"# 解析文档"之后的内容）
        if (analysisIndex !== -1) {
          answers_content = content.substring(
            analysisIndex + analysisHeader.length
          ).trim()
        }
      } else {
        // 内容未合并，可能是单独的题目或解析
        // 如果有原始数据，尝试从原始数据中获取
        if (this.markdownData && this.markdownData._questionData) {
          // 如果当前内容看起来像题目内容，使用当前内容
          questions_content = content.trim()
        } else if (this.markdownData && this.markdownData._analysisData) {
          // 如果当前内容看起来像解析内容，使用当前内容
          answers_content = content.trim()
        } else {
          // 无法判断，默认作为题目内容
          questions_content = content.trim()
        }
      }

      return {
        questions_content: questions_content || '',
        answers_content: answers_content || '',
        question_separator: '=>*',
        answer_separator: '=}*',
        parse_separator: '=?*'
      }
    },

    // 确认保存
    async confirmSave() {
      if (!this.currentContent || !this.currentContent.trim()) {
        this.$message.warning('内容不能为空')
        return
      }

      // 校验学科和章节路径
      if (!this.formData.subject_name) {
        this.$message.warning('请选择学科')
        return
      }

      if (!this.formData.chapter_path) {
        this.$message.warning('请选择章节路径')
        return
      }

      try {
        // 提取题目和解析内容
        const parseData = this.extractQuestionAndAnswerContent(this.currentContent)

        // 添加学科和章节路径
        parseData.subject_name = this.formData.subject_name
        parseData.chapter_path = this.formData.chapter_path

        console.log('提取后的数据:', parseData)

        // 显示加载提示
        const loading = this.$loading({
          lock: true,
          text: '正在保存并解析...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        try {
          // 调用接口
          const response = await parseQuestionSplit(parseData)

          loading.close()

          console.log('保存接口返回:', response)

          // 处理新的返回格式：{ errors: null, result: "...", total: 6 }
          // 或者标准格式：{ code: 200, data: {...}, msg: "..." }
          let isSuccess = false
          let errorMessage = ''
          let resultData = null

          // 检查新格式（errors字段）
          if (response && typeof response === 'object') {
            if (response.errors === null || response.errors === undefined) {
              // errors为null或undefined，表示成功
              isSuccess = true
              resultData = {
                result: response.result,
                total: response.total
              }
            } else if (response.errors) {
              // errors有值，表示失败
              isSuccess = false
              errorMessage = typeof response.errors === 'string'
                ? response.errors
                : (response.errors.message || JSON.stringify(response.errors))
            } else if (response.code === 200) {
              // 标准格式：code为200表示成功
              isSuccess = true
              resultData = response.data || response
            } else {
              // 其他情况，检查是否有错误信息
              isSuccess = false
              errorMessage = response.msg || response.message || '保存失败'
            }
          } else {
            isSuccess = false
            errorMessage = '返回数据格式错误'
          }

          if (isSuccess) {
            const successMessage = resultData && resultData.total
              ? `保存成功！共解析 ${resultData.total} 道题目`
              : '保存成功！'
            this.$message.success(successMessage)

            // 调用 markdown-text-to-json 接口
            if (resultData && resultData.result) {
              try {
                // 使用 FormData 格式，参数名为下划线命名
                const formData = new FormData()
                formData.append('markdown_content', String(resultData.result || ''))
                formData.append('subject_name', String(this.formData.subject_name || ''))
                formData.append('path', String(this.formData.chapter_path || ''))
                formData.append('separator', '=>*')

                console.log('调用 markdown-text-to-json 接口，参数:', {
                  markdown_content: String(resultData.result || ''),
                  subject_name: String(this.formData.subject_name || ''),
                  path: String(this.formData.chapter_path || ''),
                  separator: '=>*'
                })

                const jsonResponse = await markdownTextToJson(formData)
                console.log('markdown-text-to-json 接口返回:', jsonResponse)

                // 接口执行成功后，触发任务列表刷新事件
                this.$emit('refresh-task-list')
              } catch (jsonError) {
                console.error('调用 markdown-text-to-json 接口失败:', jsonError)
                // 不阻止保存成功的提示，只记录错误
              }
            }

            this.$emit('confirm', {
              content: this.currentContent,
              markdownData: this.markdownData,
              parseResult: resultData
            })
            this.handleDialogClose()
          } else {
            this.$message.error(errorMessage || '保存失败')
          }
        } catch (error) {
          loading.close()
          console.error('保存失败:', error)
          // 检查错误响应中是否包含errors字段
          if (error.response && error.response.data) {
            const errorData = error.response.data
            if (errorData.errors) {
              const errorMsg = typeof errorData.errors === 'string'
                ? errorData.errors
                : (errorData.errors.message || JSON.stringify(errorData.errors))
              this.$message.error('保存失败：' + errorMsg)
            } else {
              this.$message.error('保存失败：' + (error.message || '未知错误'))
            }
          } else {
            this.$message.error('保存失败：' + (error.message || '未知错误'))
          }
        }
      } catch (error) {
        console.error('解析内容失败:', error)
        this.$message.error('解析内容失败：' + (error.message || '未知错误'))
      }
    },

    // 处理学科变化
    async handleSubjectChange(subjectName) {
      // 学科变化时，清空章节路径和章节树数据
      if (subjectName) {
        this.formData.chapter_path = ''
        this.chapterTreeData = []
        // 调用接口获取章节树数据
        await this.loadChapterTreeData()
        // 自动打开章节选择弹窗
        this.$nextTick(() => {
          this.openChapterSelector()
        })
      }
    },

    // 加载章节树数据
    async loadChapterTreeData() {
      if (!this.formData.subject_name) {
        this.chapterTreeData = []
        return
      }

      try {
        // 调用 getchaptermap 接口
        const response = await getChapterMap()
        console.log('章节树API响应:', response)

        if (response && response.code === 200) {
          // 过滤最后一级节点
          let filteredData = this.filterLastLevelNodes(response.data || [])

          // 根据学科过滤章节数据
          this.chapterTreeData = this.filterChapterTreeBySubject(filteredData, this.formData.subject_name)

          console.log('章节树已加载:', {
            subject: this.formData.subject_name,
            treeNodes: this.chapterTreeData.length
          })
        } else {
          console.warn('章节树数据格式不正确:', response)
          this.chapterTreeData = []
        }
      } catch (error) {
        console.error('加载章节树失败:', error)
        this.$message.error('获取章节树失败：' + (error.message || '网络错误'))
        this.chapterTreeData = []
      }
    },

    // 过滤最后一级节点
    filterLastLevelNodes(nodes) {
      return nodes.map(node => {
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: this.filterLastLevelNodes(node.children)
          }
        }
        return node
      })
    },

    // 解析学科名称，提取年级和学科
    parseSubjectName(subjectName) {
      if (!subjectName) return { stage: null, subject: null }

      let stage = null
      let subject = subjectName

      // 检查是否包含年级信息
      if (subjectName.includes('初中')) {
        stage = '初中'
        subject = subjectName.replace('初中', '').trim()
      } else if (subjectName.includes('高中')) {
        stage = '高中'
        subject = subjectName.replace('高中', '').trim()
      }

      return { stage, subject }
    },

    // 根据学科过滤章节树
    filterChapterTreeBySubject(allChapterData, subjectName) {
      if (!subjectName) return allChapterData

      console.log('开始过滤学科:', subjectName)
      console.log('原始章节数据:', allChapterData)

      // 解析学科名称，提取年级和学科
      const { stage, subject } = this.parseSubjectName(subjectName)
      console.log('解析结果 - 年级:', stage, '学科:', subject)

      // 如果没有年级信息，返回原始数据
      if (!stage) {
        console.log('未找到年级信息，返回原始数据')
        return allChapterData
      }

      // 查找匹配的年级和学科
      for (const stageNode of allChapterData) {
        // 检查年级是否匹配
        if (stageNode.label && stageNode.label.includes(stage)) {
          console.log('找到匹配的年级:', stageNode.label)

          if (stageNode.children) {
            for (const subjectNode of stageNode.children) {
              // 检查学科是否匹配
              if (subject && subjectNode.label && subjectNode.label.includes(subject)) {
                console.log('找到匹配的学科:', subjectNode.label)
                return [{
                  label: stageNode.label,
                  value: stageNode.value,
                  children: [subjectNode]
                }]
              }
            }
          }
        }
      }

      // 如果没有找到匹配的，返回空数组
      console.warn('未找到匹配的学科数据:', subjectName)
      return []
    },

    // 打开章节选择器
    openChapterSelector() {
      if (!this.formData.subject_name) {
        this.$message.warning('请先选择学科')
        return
      }
      this.chapterDialogVisible = true
      this.$message.info('请选择章节路径')
    },

    // 处理章节选择确认
    handleChapterSelectionConfirm(data) {
      if (data && data.chapterPath) {
        this.formData.chapter_path = data.chapterPath
        this.$message.success('章节路径已选择：' + data.chapterPath)
      }
      this.chapterDialogVisible = false
    },

    // 关闭章节选择弹窗
    handleChapterDialogClose() {
      this.chapterDialogVisible = false
    },

    // 清除章节路径
    clearChapterPath() {
      this.formData.chapter_path = ''
      this.$message.info('已清除章节路径')
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false
      this.currentContent = ''
      this.originalContent = ''
      this.renderedMarkdown = ''
      this.isEditing = true
      this.loading = false
      this.markdownInfo = null
      // 重置表单数据
      this.formData.subject_name = ''
      this.formData.chapter_path = ''
      this.$emit('close')
    },

    // 插入分隔符
    insertSeparator(separator) {
      try {
        // 获取编辑器实例
        const editor = this.$refs.editEditor
        if (!editor) {
          // 降级处理：如果无法获取编辑器实例，则添加到末尾
          this.currentContent += separator
          this.updateRenderedMarkdown()
          this.$message.success(`已插入分隔符: ${separator}`)
          return
        }

        // 方法1：直接操作DOM中的textarea元素（最可靠的方法）
        const editorElement = editor.$el
        if (editorElement) {
          const textarea = editorElement.querySelector('textarea')
          if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const content = textarea.value || ''

            // 在光标位置插入文本
            const newContent = content.substring(0, start) + separator + content.substring(end)
            textarea.value = newContent

            // 触发input事件以更新v-model
            const inputEvent = new Event('input', { bubbles: true })
            textarea.dispatchEvent(inputEvent)

            // 设置新的光标位置
            const newCursorPos = start + separator.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
            textarea.focus()

            // 更新currentContent以同步数据
            this.currentContent = newContent
            this.updateRenderedMarkdown()
            this.$message.success(`已插入分隔符: ${separator}`)
            return
          }
        }

        // 方法2：通过mavon-editor的内部结构操作
        if (editor.$refs && editor.$refs.textarea) {
          const textareaElement = editor.$refs.textarea.$el ?
            editor.$refs.textarea.$el.querySelector('textarea') :
            editor.$refs.textarea

          if (textareaElement) {
            const start = textareaElement.selectionStart || 0
            const end = textareaElement.selectionEnd || start
            const content = textareaElement.value || ''

            // 在光标位置插入文本
            const newContent = content.substring(0, start) + separator + content.substring(end)
            textareaElement.value = newContent

            // 触发input事件
            const inputEvent = new Event('input', { bubbles: true })
            textareaElement.dispatchEvent(inputEvent)

            // 设置新的光标位置
            const newCursorPos = start + separator.length
            textareaElement.setSelectionRange(newCursorPos, newCursorPos)
            textareaElement.focus()

            // 更新currentContent以同步数据
            this.currentContent = newContent
            this.updateRenderedMarkdown()
            this.$message.success(`已插入分隔符: ${separator}`)
            return
          }
        }

        // 方法3：使用mavon-editor的CodeMirror API
        if (editor.s_markdown) {
          try {
            // 在光标位置插入分隔符
            editor.s_markdown.replaceSelection(separator)
            // 更新内容
            this.currentContent = editor.s_markdown.getValue()
            this.updateRenderedMarkdown()
            this.$message.success(`已插入分隔符: ${separator}`)
            return
          } catch (error) {
            console.warn('CodeMirror方法失败:', error)
          }
        }

        // 最终降级处理：添加到末尾
        this.currentContent += separator
        this.updateRenderedMarkdown()
        this.$message.success(`已插入分隔符: ${separator}`)
      } catch (error) {
        console.error('插入分隔符失败:', error)
        // 降级处理：添加到末尾
        this.currentContent += separator
        this.updateRenderedMarkdown()
        this.$message.success(`已插入分隔符: ${separator}`)
      }
    },
    // 加载科目列表
    loadSubjectList() {
      if (this.subjectLoading) return
      this.subjectLoading = true
      listSubject().then(response => {
        if (response && response.code === 200) {
          const options = response.rows || response.data || []
          this.subjectOptions = Array.isArray(options) ? options : []
        } else {
          this.subjectOptions = []
        }
        this.subjectLoading = false
      }).catch(error => {
        console.error('获取科目列表失败:', error)
        this.subjectOptions = []
        this.subjectLoading = false
      })
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

.form-selection-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.form-item {
  display: flex;
  align-items: center;
  h3 {
    width: 90px;
    margin: 0 0 5px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}



.full-width {
  width: 100%;
}

.chapter-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chapter-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

.selected-path-display {
  margin-top: 8px;
}

.selected-path-display .el-tag {
  max-width: 100%;
  word-break: break-all;
}

.header-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.header-tip {
  margin: 0 0 8px 0;
  color: #909399;
  font-size: 13px;
}

.header-tip i {
  margin-right: 5px;
  color: #409eff;
}

.markdown-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-content {
  height: 65vh;
  /* overflow-y: auto; */
  min-height: 450px;
}

.loading-container {
  height: 65vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-mode {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.separator-toolbar {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-right: 4px;
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

.markdown-preview .katex {
  margin: 0 2px;
}

.markdown-preview .katex-display {
  margin: 20px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.preview-mode .katex {
  color: #303133;
}

.preview-mode .katex-display {
  background-color: #f5f7fa;
  border-left-color: #67c23a;
}

::v-deep .v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper .content-input-wrapper {
  padding: 8px 25px 15px 0;
}
</style>

