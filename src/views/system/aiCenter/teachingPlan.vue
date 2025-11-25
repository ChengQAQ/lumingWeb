<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>AI教案生成</h2>
      <p class="page-description">上传课件文件，AI将为您生成专业的教案</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：文件上传和生成区域 -->
      <div class="left-panel">
        <div class="upload-section">
          <h3>文件上传</h3>
          <div class="upload-area">
            <el-upload
              ref="upload"
              :action="uploadAction"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :on-change="handleFileChange"
              :file-list="fileList"
              :limit="1"
              :auto-upload="false"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              drag
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">
                支持 PDF、Word、PowerPoint 格式，单个文件不超过 50MB
              </div>
            </el-upload>
          </div>
          
          

          <div class="action-section">
            <el-button v-if="!generating" type="primary" size="large" :disabled="!canGenerate" @click="generateTeachingPlan" style="width: 100%">生成教案</el-button>
            <div v-else class="generating-actions">
              <el-button type="warning" size="large" @click="cancelGeneration" style="width: calc(100% - 120px)">取消生成</el-button>
              <el-button type="info" size="large" :loading="true" style="width: 110px">生成中...</el-button>
            </div>
                         <div v-if="!canGenerate" style="margin-top: 10px; font-size: 12px; color: #909399;">
               <div v-if="!selectedFile">请先选择文件</div>
             </div>
          </div>
        </div>

        <!-- 生成历史 -->
        <div class="history-section">
          <h3>生成历史</h3>
          <div class="history-list">
            <div 
              v-for="item in historyList" 
              :key="item.id"
              class="history-item"
              @click="loadHistoryItem(item)"
            >
              <div class="history-info">
                <div class="history-title">{{ item.fileName }}</div>
                <div class="history-time">{{ formatTime(item.createTime) }}</div>
              </div>
              <div class="history-actions">
                <el-button type="text" size="small" @click.stop="deleteHistory(item)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：预览和编辑区域 -->
      <div class="right-panel">
        <div class="preview-header">
          <h3>教案预览</h3>
          <div class="preview-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click="toggleEdit"
              :disabled="!currentMarkdown"
            >
              {{ isEditing ? '预览' : '编辑' }}
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="downloadDocx"
              :disabled="!currentMarkdown"
            >
              下载
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="saveToMyFiles"
              :disabled="!currentMarkdown"
            >
              保存到我的文件
            </el-button>
          </div>
        </div>

        <div class="preview-content">
          <!-- 编辑模式：使用mavon-editor -->
          <div v-if="isEditing && currentMarkdown" class="edit-mode">
            <mavon-editor
              ref="mdEditor"
              v-model="editingMarkdown"
              :toolbars="toolbars"
              :boxShadow="false"
              :subfield="true"
              :defaultOpen="'preview'"
              :editable="true"
              :toolbarsFlag="true"
              :navigation="false"
              :shortCut="false"
              :codeStyle="'github'"
              :ishljs="true"
              :autofocus="false"
              :placeholder="'在这里编辑教案内容...'"
              :scrollStyle="true"
              :boxShadowStyle="'0 2px 12px 0 rgba(0, 0, 0, 0.1)'"
              :transition="true"
              :previewBackground="'#fff'"
              :html="false"
              :xssOptions="xssOptions"
              @save="saveEdit"
              style="height: 100%;"
            />
            <div class="edit-actions">
              <el-button @click="cancelEdit">取消</el-button>
              <el-button type="primary" @click="saveEdit">保存</el-button>
            </div>
          </div>

          <!-- 预览模式：使用marked渲染 -->
          <div v-else-if="currentMarkdown" class="preview-mode">
            <div ref="markdownContainer" class="markdown-preview" v-html="renderedMarkdown"></div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="请上传文件并生成教案"></el-empty>
          </div>
        </div>
      </div>
    </div>

         <!-- 保存到我的文件弹窗 -->
     <el-dialog 
       title="保存到我的文件" 
       :visible.sync="saveDialogVisible" 
       width="500px"
     >
               <el-form :model="saveForm" :rules="saveRules" ref="saveForm" label-width="120px">
          <el-form-item label="*文件用途" prop="filePurpose">
            <el-input v-model="saveForm.filePurpose" placeholder="教案" disabled />
          </el-form-item>
          <el-form-item label="*用户自定义文件名" prop="userFname">
            <el-input v-model="saveForm.userFname" placeholder="请输入用户自定义文件名" />
          </el-form-item>
          <el-form-item label="*课程名" prop="subjectName">
            <el-select
              v-model="saveForm.subjectName"
              placeholder="请选择课程名"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="subject in subjectList"
                :key="subject.subjectCode"
                :label="`${subject.subjectCode} - ${subject.subjectName}`"
                :value="subject.subjectCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="章节" prop="knowledge">
            <el-cascader
              v-model="saveForm.knowledge"
              :options="chapterOptions"
              :props="chapterProps"
              placeholder="请选择章节（选填）"
              clearable
              :show-all-levels="true"
            ></el-cascader>
          </el-form-item>
        </el-form>
       <div slot="footer" class="dialog-footer">
         <el-button @click="saveDialogVisible = false">取消</el-button>
         <el-button type="primary" @click="confirmSave" :loading="saving">
           {{ saving ? '保存中...' : '确定' }}
         </el-button>
       </div>
     </el-dialog>
  </div>
</template>

<script>
                       import { convertTeachplan } from "@/api/system/aiCenter"
    import { saveAs } from 'file-saver'
    import { convertMarkdownToDocx, convertMarkdownToDocxBlob, showFileNameDialog } from '@/utils/markdownToDocx'
    import * as marked from 'marked'  // 导入整个模块
    // import marked from 'marked'
    // const marked = require('marked')
    import { mavonEditor } from 'mavon-editor'
    import 'mavon-editor/dist/css/index.css'
    import { listSubject } from "@/api/system/subject"
    import { sysGetchaptermap } from "@/api/system/knowledge"
    import request from '@/utils/request'

export default {
  name: "TeachingPlan",
  components: {
    mavonEditor
  },
  data() {
    return {
      // 上传相关
      uploadAction: '#',
      fileList: [],
      selectedFile: null,
      
      // 生成相关
      selectedProvider: 'kimi',
      generating: false,
      cancelSource: null,
      currentMarkdown: '',
      editingMarkdown: '',
      isEditing: false,
      
      // 历史记录
      historyList: [],
      
             // 保存相关
       saveDialogVisible: false,
       saving: false,
       subjectList: [], // 课程列表
       chapterOptions: [], // 章节选项
       chapterProps: {
         label: 'label',
         value: 'value',
         children: 'children',
         checkStrictly: true
       },
                            saveForm: {
          filePurpose: '教案',
          userFname: '',
          subjectName: '',
          knowledge: ''
        },
        saveRules: {
          userFname: [
            { required: true, message: '请输入用户自定义文件名', trigger: 'blur' }
          ],
          subjectName: [
            { required: true, message: '请选择课程名', trigger: 'change' }
          ]
        },
      
      // mavon-editor配置
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
        imagelink: true,
        code: true,
        table: true,
        help: true,
        save: false
      },
      xssOptions: {
        whiteList: {
          // 允许的标签和属性
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
  computed: {
         canGenerate() {
       return this.selectedFile
     },
    renderedMarkdown() {
      if (!this.currentMarkdown) return ''
      
      // 配置marked选项
      const options = {
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false,
        tables: true
      }
      
      // 解析Markdown
      let html = marked.parse(this.currentMarkdown, options)
      
      // 确保表格有边框属性
      html = html.replace(/<table>/g, '<table border="1" style="border-collapse: collapse;">')
      
      return html
    }
  },
     created() {
     this.loadHistoryFromStorage()
     this.loadSubjectList()
     this.loadChapterList()
   },
  methods: {
    // 文件上传相关
    beforeUpload(file) {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)
      const isLt50M = file.size / 1024 / 1024 < 50

      if (!isValidType) {
        this.$message.error('只能上传 PDF、Word、PowerPoint 格式的文件!')
        return false
      }
      if (!isLt50M) {
        this.$message.error('文件大小不能超过 50MB!')
        return false
      }

      // 设置选中的文件
      this.selectedFile = file
      this.$message.success('文件选择成功，可以开始生成教案')
      return false // 阻止自动上传
    },
    
    handleUploadSuccess(response, file) {
      this.$message.success('文件上传成功')
      this.selectedFile = file
    },
    
    handleUploadError(err) {
      this.$message.error('文件上传失败')
    },

    handleFileChange(file, fileList) {
      if (file && file.raw) {
        this.selectedFile = file.raw
        this.$message.success('文件选择成功，可以开始生成教案')
      }
    },

    // 生成教案
    async generateTeachingPlan() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择文件')
        return
      }

      this.generating = true
      
      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        formData.append('provider', this.selectedProvider)

        // 显示长时间处理的提示
        this.$message({
          message: 'AI正在生成教案，请耐心等待...',
          type: 'info',
          duration: 0,
          showClose: false
        })

        const CancelToken = (await import('axios')).default.CancelToken
        this.cancelSource = CancelToken.source()
        const response = await convertTeachplan(formData, { cancelToken: this.cancelSource.token })
        
        // 关闭之前的提示
        this.$message.closeAll()
        
        if (response.status === 'success' && response.markdown) {
          this.currentMarkdown = response.markdown
          this.editingMarkdown = response.markdown
          this.$message({
            message: '教案生成成功',
            type: 'success',
            showClose: true
          })
          
          // 保存到历史记录
          this.saveToHistory({
            id: Date.now(),
            fileName: this.selectedFile.name,
            markdown: response.markdown,
            provider: this.selectedProvider,
            createTime: new Date().toISOString()
          })
        } else {
          this.$message.error(response.msg || '生成失败')
        }
      } catch (error) {
        // 关闭之前的提示
        this.$message.closeAll()
        
        console.error('生成教案失败:', error)
        
        // 根据错误类型显示不同的提示
        if (error.message && error.message.includes('timeout')) {
          this.$message.error('生成超时，请稍后重试或联系管理员')
        } else if (error.message && error.message.includes('Network Error')) {
          this.$message.error('网络连接异常，请检查网络后重试')
        } else {
          this.$message.error('生成失败：' + (error.message || '网络错误'))
        }
      } finally {
        this.generating = false
      }
    },

    // 编辑相关
    async toggleEdit() {
      if (this.isEditing) {
        this.isEditing = false
        return
      }
      
      try {
        console.log('开始进入编辑模式...')
        
        // 进入编辑模式：直接编辑markdown内容
        this.editingMarkdown = this.currentMarkdown
        this.isEditing = true
        
        this.$nextTick(() => {
          const editor = this.$refs.mdEditor
          if (editor) {
            console.log('找到编辑器元素')
            // 简化焦点设置，避免复杂的引用链
            try {
              editor.focus()
            } catch (e) {
              console.log('编辑器焦点设置失败，但不影响使用')
            }
          } else {
            console.error('找不到编辑器元素')
          }
        })
      } catch (error) {
        console.error('进入编辑模式失败:', error)
        this.$message.error('进入编辑模式失败: ' + error.message)
      }
    },

    cancelEdit() {
      this.isEditing = false
    },

    async saveEdit() {
      try {
        // 直接使用编辑的markdown内容
        this.currentMarkdown = this.editingMarkdown
        this.isEditing = false
        
        this.$message.success('编辑保存成功')
      } catch (error) {
        console.error('保存编辑失败:', error)
        this.$message.error('保存编辑失败: ' + error.message)
      }
    },

    cancelGeneration() {
      try {
        if (this.cancelSource) this.cancelSource.cancel('canceled')
      } finally {
        this.generating = false
        this.cancelSource = null
        this.$message.closeAll()
        this.$message.info('已取消生成')
      }
    },

    // 下载功能
    async downloadDocx() {
      if (!this.currentMarkdown) return
      
      try {
        // 获取最新的Markdown内容（如果在编辑模式，获取编辑后的内容）
        let latestMarkdown = this.currentMarkdown
        if (this.isEditing) {
          latestMarkdown = this.editingMarkdown
        }
        
        // 生成DOCX Blob
        const blob = await convertMarkdownToDocxBlob(latestMarkdown)
        
        // 显示文件名输入对话框
        const defaultBase = `${this.selectedFile?.name?.replace(/\.[^/.]+$/, '') || '教案'}_教案`
        showFileNameDialog(defaultBase, async (name) => {
          saveAs(blob, `${name}.docx`)
          this.$message.success('文件下载成功')
        }, this)
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('下载失败: ' + error.message)
      }
    },

               // 保存到我的文件
      saveToMyFiles() {
        if (!this.currentMarkdown) return
        
        this.saveForm.userFname = `${this.selectedFile?.name?.replace(/\.[^/.]+$/, '') || '教案'}_教案`
        this.saveForm.filePurpose = '教案'
        this.saveDialogVisible = true
      },

     

                   async confirmSave() {
        this.$refs.saveForm.validate(async (valid) => {
          if (valid) {
            this.saving = true
            
            try {
              // 获取最新的Markdown内容（如果在编辑模式，获取编辑后的内容）
              let latestMarkdown = this.currentMarkdown
              if (this.isEditing) {
                latestMarkdown = this.editingMarkdown
              }
              
              // 生成DOCX Blob
              const docxBlob = await convertMarkdownToDocxBlob(latestMarkdown)
              
                             // 处理章节选择
               let knowledgeValue = ''
               if (this.saveForm.knowledge && this.saveForm.knowledge.length > 0) {
                 // 如果是级联选择器的值，需要转换为路径字符串
                 if (Array.isArray(this.saveForm.knowledge)) {
                   knowledgeValue = this.saveForm.knowledge.join('/')
                 } else {
                   knowledgeValue = this.saveForm.knowledge
                 }
               }
               
               // 创建FormData
               const formData = new FormData()
               formData.append('filePurpose', this.saveForm.filePurpose)
               formData.append('filePath', `/teacher/${this.saveForm.userFname}.docx`)
               formData.append('knowledge', knowledgeValue)
               formData.append('subjectName', this.saveForm.subjectName)
               formData.append('userFname', this.saveForm.userFname)
              
              // 添加DOCX文件
              formData.append('file', docxBlob, `${this.saveForm.userFname}.docx`)

              // 调用API接口
              const response = await request({
                url: '/system/teacher/addFile',
                method: 'post',
                data: formData,
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              })
              
              if (response.code === 200) {
                this.$message.success('保存成功')
                this.saveDialogVisible = false
                this.resetSaveForm()
              } else {
                this.$message.error(response.msg || '保存失败')
              }
            } catch (error) {
              console.error('保存文件失败:', error)
              this.$message.error('保存失败：' + (error.message || '网络错误'))
            } finally {
              this.saving = false
            }
          }
        })
      },

                   resetSaveForm() {
        this.saveForm = {
          filePurpose: '教案',
          userFname: '',
          subjectName: '',
          knowledge: ''
        }
      },

    // 历史记录相关
    loadHistoryFromStorage() {
      console.log('Attempting to load history from localStorage...');
      const history = localStorage.getItem('teachingPlanHistory')
      if (history) {
        this.historyList = JSON.parse(history)
        console.log('History loaded successfully:', this.historyList);
      } else {
        this.historyList = []
        console.log('No history found in localStorage, initializing empty list.');
      }
    },

    saveToHistory(item) {
      console.log('Attempting to save item to history:', item);
      this.historyList.unshift(item)
      // 只保留最近20条记录
      if (this.historyList.length > 20) {
        this.historyList = this.historyList.slice(0, 20)
      }
      try {
        const historyString = JSON.stringify(this.historyList);
        localStorage.setItem('teachingPlanHistory', historyString);
        console.log('History saved successfully to localStorage:', this.historyList);
      } catch (e) {
        console.error('Error saving history to localStorage:', e);
        this.$message.error('保存历史记录失败');
      }
    },

    loadHistoryItem(item) {
      if (!item || !item.markdown) {
        this.$message.warning('历史记录数据不完整，无法加载')
        return
      }
      this.currentMarkdown = item.markdown
      this.editingMarkdown = item.markdown
      this.selectedProvider = item.provider || 'kimi'
      this.$message.success('已加载历史记录')
    },

    downloadHistory(item) {
      // 显示文件名修改弹窗
      const defaultFileName = `${item.fileName}_教案`
      showFileNameDialog(defaultFileName, (fileName) => {
        // 用户确认后，显示格式选择
        this.$confirm('请选择下载格式', '选择格式', {
          confirmButtonText: 'DOCX格式',
          cancelButtonText: 'MD格式',
          distinguishCancelAndClose: true,
          type: 'info'
        }).then(() => {
          // 用户选择DOCX格式
          this.downloadAsDocx(item.markdown, fileName)
        }).catch((action) => {
          if (action === 'cancel') {
            // 用户选择MD格式
            this.downloadAsMarkdown(item.markdown, fileName)
          }
        })
      }, this)
    },

    downloadAsDocx(markdown, fileName) {
      this.$message.info('正在转换文件格式...')
      convertMarkdownToDocx(markdown, fileName, 'docx').then(success => {
        if (success) {
          this.$message.success('文件下载成功')
        } else {
          this.$message.error('文件转换失败，请重试')
        }
      })
    },

    downloadAsMarkdown(markdown, fileName) {
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const finalFileName = `${fileName}.md`
      saveAs(blob, finalFileName)
      this.$message.success('文件下载成功')
    },

    deleteHistory(item) {
      this.$confirm('确定要删除这条历史记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.historyList.findIndex(h => h.id === item.id)
        if (index > -1) {
          this.historyList.splice(index, 1)
          localStorage.setItem('teachingPlanHistory', JSON.stringify(this.historyList))
          this.$message.success('删除成功')
        }
      })
    },

         formatTime(timeStr) {
       return new Date(timeStr).toLocaleString()
     },
     
     // 加载课程列表
     loadSubjectList() {
       listSubject().then(response => {
         this.subjectList = response.rows || []
       }).catch(error => {
         console.error('获取课程数据失败:', error)
         this.$message.error('获取课程数据失败')
       })
     },
     
     // 加载章节列表
     loadChapterList() {
       sysGetchaptermap().then(response => {
         if (response.code === 200) {
           this.chapterOptions = response.data || []
         } else {
           this.$message.error('获取章节列表失败：' + response.msg)
         }
       }).catch(error => {
         this.$message.error('获取章节列表失败：' + error.message)
       })
     }
   }
 }
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.left-panel {
  width: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.upload-section,
.history-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.upload-section h3,
.history-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.upload-area {
  margin-bottom: 20px;
}



.action-section {
  margin-bottom: 20px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background: #f0f9ff;
  border-color: #409eff;
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.preview-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.edit-mode {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* mavon-editor 自定义样式 */
.edit-mode .v-note-wrapper {
  height: 100% !important;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.edit-mode .v-note-wrapper .v-note-op {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.edit-mode .v-note-wrapper .v-note-show {
  background: #fff;
}

.edit-mode .v-note-wrapper .v-note-edit {
  background: #fff;
  font-family: 'Courier New', Consolas, Monaco, monospace;
}

.edit-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-mode {
  height: 100%;
}





.markdown-preview {
  line-height: 1.6;
  color: #303133;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.markdown-preview h1 {
  font-size: 24px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.markdown-preview h2 {
  font-size: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 6px;
}

.markdown-preview h3 {
  font-size: 18px;
}

.markdown-preview p {
  margin-bottom: 12px;
}

.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  border: 3px solid #409eff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: #fff;
}

.markdown-preview th,
.markdown-preview td {
  border: 2px solid #409eff !important;
  padding: 12px 16px;
  text-align: left;
  vertical-align: top;
  position: relative;
}

.markdown-preview th {
  background: #409eff !important;
  font-weight: 600;
  color: #fff !important;
  border-bottom: 2px solid #409eff !important;
}

.markdown-preview td {
  background: #fff !important;
  border: 2px solid #409eff !important;
}

.markdown-preview tr:hover td {
  background: #f0f9ff !important;
}

/* 确保表格边框在所有情况下都可见 */
.markdown-preview table,
.markdown-preview table * {
  border-color: #409eff !important;
}

/* 增强表格样式，确保边框显示 */
.markdown-preview table {
  border-spacing: 0 !important;
  border-collapse: collapse !important;
}

.markdown-preview table th,
.markdown-preview table td {
  border: 2px solid #409eff !important;
  border-collapse: collapse !important;
}

/* 确保表格在marked渲染后仍有边框 */
.markdown-preview table[border="1"] {
  border: 3px solid #409eff !important;
}

.markdown-preview table[border="1"] th,
.markdown-preview table[border="1"] td {
  border: 2px solid #409eff !important;
}

/* 数学公式样式 */
.markdown-preview .math {
  font-family: 'Times New Roman', serif;
  font-size: 1.1em;
  line-height: 1.4;
}

.markdown-preview .math-inline {
  display: inline;
  padding: 0 4px;
}

.markdown-preview .math-display {
  display: block;
  text-align: center;
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

/* 增强代码块样式 */
.markdown-preview pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 15px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.markdown-preview code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}



.markdown-preview blockquote {
  border-left: 4px solid #409eff;
  padding-left: 15px;
  margin: 15px 0;
  color: #606266;
  background: #f0f9ff;
  padding: 10px 15px;
  border-radius: 4px;
}





.markdown-preview .code-block {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 15px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.45;
}

.markdown-preview .code-block code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-family: inherit;
  font-size: inherit;
}

.markdown-preview ul,
.markdown-preview ol {
  margin: 10px 0;
  padding-left: 20px;
}

.markdown-preview li {
  margin: 5px 0;
  line-height: 1.6;
}

.markdown-preview hr {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 20px 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar,
.preview-content::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-thumb,
.preview-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-track,
.preview-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 200px);
  }
  
  .left-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .upload-section,
  .history-section {
    flex: 1;
    min-width: 300px;
  }
  
  .history-section {
    min-width: 100%;
    order: 2;
  }
  
  .right-panel {
    min-height: 500px;
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .page-header h2 {
    font-size: 20px;
  }
  
  .page-description {
    font-size: 13px;
  }
  
  .left-panel {
    flex-direction: column;
    gap: 12px;
  }
  
  .upload-section,
  .history-section {
    min-width: auto;
    padding: 15px;
  }
  
  .upload-section h3,
  .history-section h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .preview-header {
    padding: 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .preview-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .preview-content {
    padding: 15px;
  }
  
  .edit-actions {
    margin-top: 12px;
    flex-direction: column;
    gap: 8px;
  }
  
  .edit-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .page-header {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .page-header h2 {
    font-size: 18px;
  }
  
  .page-description {
    font-size: 12px;
  }
  
  .main-content {
    gap: 12px;
  }
  
  .left-panel {
    gap: 10px;
  }
  
  .upload-section,
  .history-section {
    padding: 12px;
  }
  
  .upload-section h3,
  .history-section h3 {
    font-size: 15px;
    margin-bottom: 10px;
  }
  
  .preview-header {
    padding: 12px;
  }
  
  .preview-header h3 {
    font-size: 16px;
  }
  
  .preview-actions {
    gap: 8px;
  }
  
  .preview-actions .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .preview-content {
    padding: 12px;
  }
  
  .history-item {
    padding: 10px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .history-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .markdown-preview {
    padding: 15px;
  }
  
  .markdown-preview h1 {
    font-size: 20px;
  }
  
  .markdown-preview h2 {
    font-size: 18px;
  }
  
  .markdown-preview h3 {
    font-size: 16px;
  }
  
  .markdown-preview table {
    font-size: 12px;
  }
  
  .markdown-preview th,
  .markdown-preview td {
    padding: 8px 10px;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 8px;
  }
  
  .page-header {
    padding: 10px;
  }
  
  .page-header h2 {
    font-size: 16px;
  }
  
  .upload-section,
  .history-section {
    padding: 10px;
  }
  
  .preview-header {
    padding: 10px;
  }
  
  .preview-content {
    padding: 10px;
  }
  
  .preview-actions .el-button {
    font-size: 11px;
    padding: 6px 10px;
  }
  
  .markdown-preview {
    padding: 12px;
  }
  
  .markdown-preview h1 {
    font-size: 18px;
  }
  
  .markdown-preview h2 {
    font-size: 16px;
  }
  
  .markdown-preview h3 {
    font-size: 14px;
  }
  
  .markdown-preview table {
    font-size: 11px;
  }
  
  .markdown-preview th,
  .markdown-preview td {
    padding: 6px 8px;
  }
}

</style>
