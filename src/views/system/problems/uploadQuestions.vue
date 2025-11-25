<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>教案文档上传与解析</h2>
      <p class="page-description">支持PDF/Word/MD格式文档上传，自动解析生成教案内容</p>
    </div>

    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" finish-status="success" align-center>
      <el-step title="文档上传" description="上传题目和解析文档"></el-step>
      <el-step title="内容解析" description="自动解析文档内容"></el-step>
      <el-step title="教案生成" description="生成完整教案"></el-step>
      <el-step title="预览编辑" description="预览和编辑教案"></el-step>
    </el-steps>

    <!-- 第一步：文档上传 -->
    <div v-if="currentStep === 0" class="step-content">
      <!-- 科目选择 -->
      <el-card class="subject-card" shadow="hover" style="margin-bottom: 20px;">
        <div slot="header" class="card-header">
          <span>选择科目</span>
        </div>
        <el-form :inline="true">
          <el-form-item label="科目名称">
            <el-select v-model="selectedSubject" placeholder="请选择科目" @change="handleSubjectChange">
              <el-option 
                v-for="subject in subjectList" 
                :key="subject.value" 
                :label="subject.label" 
                :value="subject.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <el-row :gutter="20">
        <!-- 题目文档上传 -->
        <el-col :span="12">
          <el-card class="upload-card" shadow="hover">
            <div slot="header" class="card-header">
              <span>题目文档上传</span>
              <el-select 
                v-model="selectedQuestionFileType" 
                size="small" 
                style="width: 120px;"
                @change="handleQuestionFileTypeChange"
              >
                <el-option 
                  v-for="option in fileTypeOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value"
                >
                </el-option>
              </el-select>
            </div>
            
            <el-upload
              class="upload-dragger"
              drag
              :action="questionUploadUrl"
              :headers="uploadHeaders"
              :data="questionUploadData"
              :before-upload="beforeQuestionUpload"
              :on-success="handleQuestionSuccess"
              :on-error="handleQuestionError"
              :file-list="questionFileList"
              :accept="questionAcceptTypes"
              :limit="1"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将题目{{ selectedQuestionFileType === 'pdf' ? 'PDF' : 'Word' }}文档拖到此处，或<em>点击上传</em>
              </div>
              <div class="el-upload__tip" slot="tip">
                支持{{ selectedQuestionFileType === 'pdf' ? 'PDF' : 'Word(doc/docx)' }}格式，文件大小不超过20MB
              </div>
            </el-upload>
          </el-card>
        </el-col>

        <!-- 解析文档上传 -->
        <el-col :span="12">
          <el-card class="upload-card" shadow="hover">
            <div slot="header" class="card-header">
              <span>解析文档上传</span>
              <el-select 
                v-model="selectedAnalysisFileType" 
                size="small" 
                style="width: 120px;"
                @change="handleAnalysisFileTypeChange"
              >
                <el-option 
                  v-for="option in fileTypeOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value"
                >
                </el-option>
              </el-select>
            </div>
            
            <el-upload
              class="upload-dragger"
              drag
              :action="analysisUploadUrl"
              :headers="uploadHeaders"
              :data="analysisUploadData"
              :before-upload="beforeAnalysisUpload"
              :on-success="handleAnalysisSuccess"
              :on-error="handleAnalysisError"
              :file-list="analysisFileList"
              :accept="analysisAcceptTypes"
              :limit="1"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将解析{{ selectedAnalysisFileType === 'pdf' ? 'PDF' : 'Word' }}文档拖到此处，或<em>点击上传</em>
              </div>
              <div class="el-upload__tip" slot="tip">
                支持{{ selectedAnalysisFileType === 'pdf' ? 'PDF' : 'Word(doc/docx)' }}格式，文件大小不超过20MB
              </div>
            </el-upload>
          </el-card>
        </el-col>
      </el-row>

      <!-- 上传完成后的操作 -->
      <div v-if="questionContent || analysisContent" class="upload-complete">
        <el-alert
          title="文档上传完成"
          type="success"
          :closable="false"
          show-icon>
          <template slot="default">
            <p>题目文档：{{ questionFileList.length > 0 ? questionFileList[0].name : '未上传' }}</p>
            <p>解析文档：{{ analysisFileList.length > 0 ? analysisFileList[0].name : '未上传' }}</p>
            <el-button type="primary" @click="generateLessonPlan" :loading="generating">
              生成教案
            </el-button>
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 第二步：内容解析 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-card class="parsing-card" shadow="hover">
        <div slot="header" class="card-header">
          <span>文档内容解析</span>
        </div>
        
        <div class="parsing-content">
          <div class="parsing-item">
            <h4>题目内容解析</h4>
            <div class="content-preview">
              <div v-if="questionContent" class="content-text" v-html="formatContent(questionContent)"></div>
              <div v-else class="no-content">暂无题目内容</div>
            </div>
          </div>
          
          <div class="parsing-item">
            <h4>解析内容解析</h4>
            <div class="content-preview">
              <div v-if="analysisContent" class="content-text" v-html="formatContent(analysisContent)"></div>
              <div v-else class="no-content">暂无解析内容</div>
            </div>
          </div>
        </div>

        <div class="parsing-actions">
          <el-button @click="currentStep = 0">返回上一步</el-button>
          <el-button type="primary" @click="generateLessonPlan" :loading="generating">
            生成教案
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 第三步：教案生成 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-card class="generating-card" shadow="hover">
        <div slot="header" class="card-header">
          <span>教案生成中</span>
        </div>
        
        <div class="generating-content">
          <el-progress :percentage="generatingProgress" :status="generatingStatus"></el-progress>
          <p class="generating-text">{{ generatingText }}</p>
          
          <div v-if="lessonPlanGenerated" class="generated-preview">
            <h4>生成的教案内容：</h4>
            <div class="lesson-plan-preview" v-html="formatContent(lessonPlanContent)"></div>
          </div>
        </div>

        <div class="generating-actions">
          <el-button @click="currentStep = 1">返回上一步</el-button>
          <el-button 
            type="primary" 
            @click="goToPreviewEdit" 
            :disabled="!lessonPlanGenerated"
          >
            进入预览编辑
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 第四步：预览编辑 -->
    <div v-if="currentStep === 3" class="step-content">
      <el-card class="preview-edit-card" shadow="hover">
        <div slot="header" class="card-header">
          <span>教案预览与编辑</span>
          <div class="card-actions">
            <el-button-group>
              <el-button 
                :type="viewMode === 'preview' ? 'primary' : ''" 
                @click="viewMode = 'preview'"
              >
                预览模式
              </el-button>
              <el-button 
                :type="viewMode === 'edit' ? 'primary' : ''" 
                @click="viewMode = 'edit'"
              >
                编辑模式
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 预览模式 -->
        <div v-if="viewMode === 'preview'" class="preview-mode">
          <div class="preview-header">
            <span>教案预览</span>
            <el-button type="text" @click="refreshPreview">刷新预览</el-button>
          </div>
          <div class="preview-content" v-html="formatContent(lessonPlanContent)"></div>
        </div>

        <!-- 编辑模式 -->
        <div v-if="viewMode === 'edit'" class="edit-mode">
          <el-tabs v-model="activeEditTab" type="card">
            <el-tab-pane label="题目编辑" name="question">
              <div class="editor-container">
                <div class="editor-header">
                  <span>题目内容编辑</span>
                  <el-button type="text" @click="clearQuestion">清空</el-button>
                </div>
                <el-input
                  v-model="questionContent"
                  type="textarea"
                  :rows="15"
                  placeholder="编辑题目内容..."
                  class="markdown-editor"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="解析编辑" name="analysis">
              <div class="editor-container">
                <div class="editor-header">
                  <span>解析内容编辑</span>
                  <el-button type="text" @click="clearAnalysis">清空</el-button>
                </div>
                <el-input
                  v-model="analysisContent"
                  type="textarea"
                  :rows="15"
                  placeholder="编辑解析内容..."
                  class="markdown-editor"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="完整教案" name="lesson">
              <div class="editor-container">
                <div class="editor-header">
                  <span>完整教案编辑</span>
                  <el-button type="text" @click="clearLessonPlan">清空</el-button>
                </div>
                <el-input
                  v-model="lessonPlanContent"
                  type="textarea"
                  :rows="15"
                  placeholder="编辑完整教案内容..."
                  class="markdown-editor"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="preview-edit-actions">
          <el-button @click="currentStep = 2">返回上一步</el-button>
          <el-button @click="resetAll">重置全部</el-button>
          <el-button type="primary" @click="saveLessonPlan" :loading="saving">
            保存教案
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 加载中遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <i class="el-icon-loading"></i>
        <p>{{ loadingText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'
import { saveQuestion } from '@/api/system/problems'

export default {
  name: 'UploadQuestions',
  data() {
    return {
      // 上传API配置
      uploadApis: {
        pdf: {
          question: '/system/questionDocumentUpload/upload',
          analysis: '/system/questionDocumentUpload/upload'
        },
        word: {
          question: '/system/questionDocumentUpload/upload',
          analysis: '/system/questionDocumentUpload/upload'
        }
      },
      uploadHeaders: {
        'Content-Type': 'multipart/form-data'
      },
      
      // 文件类型选择
      selectedQuestionFileType: 'pdf',
      selectedAnalysisFileType: 'pdf',
      fileTypeOptions: [
        { label: 'PDF文档', value: 'pdf' },
        { label: 'Word文档', value: 'word' }
      ],
      
      // 科目选择
      selectedSubject: '高中数学',
      subjectList: [
        { label: '高中数学', value: '高中数学' },
        { label: '高中物理', value: '高中物理' },
        { label: '高中化学', value: '高中化学' },
        { label: '高中生物', value: '高中生物' },
        { label: '高中英语', value: '高中英语' },
        { label: '高中语文', value: '高中语文' },
        { label: '初中数学', value: '初中数学' },
        { label: '初中物理', value: '初中物理' },
        { label: '初中化学', value: '初中化学' },
        { label: '初中生物', value: '初中生物' },
        { label: '初中英语', value: '初中英语' },
        { label: '初中语文', value: '初中语文' }
      ],
      
      // 步骤控制
      currentStep: 0,
      
      // 文件列表
      questionFileList: [],
      analysisFileList: [],
      
      // 编辑内容
      questionContent: '',
      analysisContent: '',
      lessonPlanContent: '',
      
      // 界面状态
      activeEditTab: 'question',
      viewMode: 'preview', // preview 或 edit
      loading: false,
      loadingText: '处理中...',
      saving: false,
      generating: false,
      
      // 教案生成状态
      lessonPlanGenerated: false,
      generatingProgress: 0,
      generatingStatus: '',
      generatingText: '准备生成教案...'
    }
  },
  computed: {
    // 预览内容
    previewContent() {
      if (this.viewMode === 'preview') {
        return this.lessonPlanContent ? marked(this.lessonPlanContent) : '<p>暂无教案内容</p>'
      }
      return '<p>请选择要预览的内容</p>'
    },
    
    // 题目文档上传URL
    questionUploadUrl() {
      return this.uploadApis[this.selectedQuestionFileType].question
    },
    
    // 解析文档上传URL
    analysisUploadUrl() {
      return this.uploadApis[this.selectedAnalysisFileType].analysis
    },
    
    // 题目文档上传数据
    questionUploadData() {
      return {
        subject_name: this.selectedSubject,
        file_type: this.selectedQuestionFileType
      }
    },
    
    // 解析文档上传数据
    analysisUploadData() {
      return {
        subject_name: this.selectedSubject,
        file_type: this.selectedAnalysisFileType
      }
    },
    
    // 题目文档接受的文件类型
    questionAcceptTypes() {
      return this.selectedQuestionFileType === 'pdf' 
        ? '.pdf' 
        : '.doc,.docx'
    },
    
    // 解析文档接受的文件类型
    analysisAcceptTypes() {
      return this.selectedAnalysisFileType === 'pdf' 
        ? '.pdf' 
        : '.doc,.docx'
    }
  },
  methods: {
    // 题目文档上传前处理
    beforeQuestionUpload(file) {
      let isValidType = false
      let fileTypeName = ''
      
      if (this.selectedQuestionFileType === 'pdf') {
        isValidType = file.type === 'application/pdf'
        fileTypeName = 'PDF'
      } else if (this.selectedQuestionFileType === 'word') {
        isValidType = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                     file.type === 'application/msword'
        fileTypeName = 'Word'
      }
      
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isValidType) {
        this.$message.error(`只能上传${fileTypeName}格式的文件!`)
        return false
      }
      if (!isLt20M) {
        this.$message.error('上传文件大小不能超过 20MB!')
        return false
      }

      this.loading = true
      this.loadingText = `正在解析题目${fileTypeName}文档...`
      return true
    },

    // 题目文档上传成功
    handleQuestionSuccess(response, file) {
      this.loading = false
      const fileTypeName = this.selectedQuestionFileType === 'pdf' ? 'PDF' : 'Word'
      
      if (response && response.code === 200) {
        this.questionContent = response.data || response.content || ''
        this.$message.success(`题目${fileTypeName}解析成功`)
        this.currentStep = 1
      } else {
        this.$message.error(`题目${fileTypeName}解析失败：` + (response.msg || response.message || '未知错误'))
      }
    },

    // 题目文档上传失败
    handleQuestionError(error) {
      this.loading = false
      const fileTypeName = this.selectedQuestionFileType === 'pdf' ? 'PDF' : 'Word'
      console.error(`题目${fileTypeName}上传失败:`, error)
      this.$message.error(`题目${fileTypeName}上传失败，请重试`)
    },

    // 解析文档上传前处理
    beforeAnalysisUpload(file) {
      let isValidType = false
      let fileTypeName = ''
      
      if (this.selectedAnalysisFileType === 'pdf') {
        isValidType = file.type === 'application/pdf'
        fileTypeName = 'PDF'
      } else if (this.selectedAnalysisFileType === 'word') {
        isValidType = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                     file.type === 'application/msword'
        fileTypeName = 'Word'
      }
      
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isValidType) {
        this.$message.error(`只能上传${fileTypeName}格式的文件!`)
        return false
      }
      if (!isLt20M) {
        this.$message.error('上传文件大小不能超过 20MB!')
        return false
      }

      this.loading = true
      this.loadingText = `正在解析解析${fileTypeName}文档...`
      return true
    },

    // 解析文档上传成功
    handleAnalysisSuccess(response, file) {
      this.loading = false
      const fileTypeName = this.selectedAnalysisFileType === 'pdf' ? 'PDF' : 'Word'
      
      if (response && response.code === 200) {
        this.analysisContent = response.data || response.content || ''
        this.$message.success(`解析${fileTypeName}解析成功`)
        this.currentStep = 1
      } else {
        this.$message.error(`解析${fileTypeName}解析失败：` + (response.msg || response.message || '未知错误'))
      }
    },

    // 解析文档上传失败
    handleAnalysisError(error) {
      this.loading = false
      const fileTypeName = this.selectedAnalysisFileType === 'pdf' ? 'PDF' : 'Word'
      console.error(`解析${fileTypeName}上传失败:`, error)
      this.$message.error(`解析${fileTypeName}上传失败，请重试`)
    },

    // 科目变化处理
    handleSubjectChange(subject) {
      this.selectedSubject = subject
      this.$message.success(`已切换到${subject}科目`)
    },

    // 题目文档文件类型变化处理
    handleQuestionFileTypeChange(fileType) {
      this.selectedQuestionFileType = fileType
      this.questionFileList = [] // 清空已上传的文件列表
      const fileTypeName = fileType === 'pdf' ? 'PDF' : 'Word'
      this.$message.success(`题目文档类型已切换到${fileTypeName}格式`)
    },

    // 解析文档文件类型变化处理
    handleAnalysisFileTypeChange(fileType) {
      this.selectedAnalysisFileType = fileType
      this.analysisFileList = [] // 清空已上传的文件列表
      const fileTypeName = fileType === 'pdf' ? 'PDF' : 'Word'
      this.$message.success(`解析文档类型已切换到${fileTypeName}格式`)
    },

    // 格式化内容显示
    formatContent(content) {
      if (!content) return '<p>暂无内容</p>'
      return marked(content)
    },

    // 生成教案
    async generateLessonPlan() {
      this.generating = true
      this.currentStep = 2
      this.generatingProgress = 0
      this.generatingStatus = 'active'
      this.generatingText = '正在生成教案...'

      try {
        // 模拟教案生成过程
        const steps = [
          { progress: 20, text: '分析题目内容...' },
          { progress: 40, text: '分析解析内容...' },
          { progress: 60, text: '整合教学内容...' },
          { progress: 80, text: '生成教案结构...' },
          { progress: 100, text: '教案生成完成!' }
        ]

        for (let i = 0; i < steps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          this.generatingProgress = steps[i].progress
          this.generatingText = steps[i].text
        }

        // 生成教案内容
        this.lessonPlanContent = this.generateLessonPlanContent()
        this.lessonPlanGenerated = true
        this.generatingStatus = 'success'
        this.generating = false

        this.$message.success('教案生成成功!')
      } catch (error) {
        console.error('教案生成失败:', error)
        this.generatingStatus = 'exception'
        this.generatingText = '教案生成失败'
        this.generating = false
        this.$message.error('教案生成失败，请重试')
      }
    },

    // 生成教案内容
    generateLessonPlanContent() {
      const currentDate = new Date().toLocaleDateString()
      
      return `# 教案

**生成时间：** ${currentDate}

## 一、教学目标

### 知识目标
- 掌握相关知识点
- 理解题目解题思路

### 能力目标
- 提高分析问题能力
- 培养解题技巧

## 二、教学内容

### 题目内容
${this.questionContent || '暂无题目内容'}

### 解析内容
${this.analysisContent || '暂无解析内容'}

## 三、教学重点
- 重点掌握题目涉及的核心概念
- 理解解题方法和思路

## 四、教学难点
- 难点1：相关概念的理解
- 难点2：解题思路的掌握

## 五、教学过程

### 1. 导入新课
通过题目引入，激发学生兴趣

### 2. 讲授新课
详细讲解题目内容和解题思路

### 3. 巩固练习
通过类似题目进行练习

### 4. 课堂小结
总结本节课的重点内容

## 六、作业布置
- 完成相关练习题
- 复习本节课内容

## 七、教学反思
- 教学效果评估
- 改进建议`
    },

    // 进入预览编辑
    goToPreviewEdit() {
      this.currentStep = 3
      this.viewMode = 'preview'
    },

    // 复制解析到题目
    copyAnalysisToQuestion() {
      if (this.analysisContent) {
        this.questionContent = this.analysisContent
        this.$message.success('解析内容已复制到题目编辑区')
        this.activeEditTab = 'question'
      }
    },

    // 清空题目内容
    clearQuestion() {
      this.$confirm('确定要清空题目内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.questionContent = ''
        this.$message.success('题目内容已清空')
      })
    },

    // 清空解析内容
    clearAnalysis() {
      this.$confirm('确定要清空解析内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.analysisContent = ''
        this.$message.success('解析内容已清空')
      })
    },

    // 清空教案内容
    clearLessonPlan() {
      this.$confirm('确定要清空教案内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.lessonPlanContent = ''
        this.$message.success('教案内容已清空')
      })
    },

    // 刷新预览
    refreshPreview() {
      this.$forceUpdate()
      this.$message.success('预览已刷新')
    },

    // 重置全部
    resetAll() {
      this.$confirm('确定要重置所有内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.questionContent = ''
        this.analysisContent = ''
        this.lessonPlanContent = ''
        this.questionFileList = []
        this.analysisFileList = []
        this.currentStep = 0
        this.viewMode = 'preview'
        this.lessonPlanGenerated = false
        this.generatingProgress = 0
        this.generatingStatus = ''
        this.$message.success('所有内容已重置')
      })
    },

    // 保存教案
    async saveLessonPlan() {
      if (!this.lessonPlanContent.trim()) {
        this.$message.warning('请输入教案内容')
        return
      }

      this.saving = true
      try {
        const lessonPlanData = {
          title: '教案',
          content: this.lessonPlanContent,
          question: this.questionContent,
          analysis: this.analysisContent,
          type: 'lesson_plan',
          source: 'document_upload'
        }

        const response = await saveQuestion(lessonPlanData)
        if (response.code === 200) {
          this.$message.success('教案保存成功')
          this.resetAll()
        } else {
          this.$message.error('教案保存失败：' + response.msg)
        }
      } catch (error) {
        console.error('保存教案失败:', error)
        this.$message.error('保存教案失败，请重试')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

/* 步骤指示器样式 */
.el-steps {
  margin-bottom: 40px;
}

/* 步骤内容样式 */
.step-content {
  margin-top: 30px;
}

.upload-card {
  height: 300px;
}

.parsing-card, .generating-card, .preview-edit-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.upload-dragger {
  width: 100%;
  height: 200px;
}

/* 上传完成提示 */
.upload-complete {
  margin-top: 20px;
}

.upload-complete .el-alert {
  text-align: center;
}

.upload-complete p {
  margin: 5px 0;
  color: #606266;
}

/* 解析内容样式 */
.parsing-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.parsing-item {
  flex: 1;
}

.parsing-item h4 {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 16px;
}

.content-preview {
  height: 200px;
  overflow-y: auto;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}

.content-text {
  line-height: 1.6;
}

.no-content {
  color: #909399;
  font-style: italic;
}

.parsing-actions, .generating-actions, .preview-edit-actions {
  text-align: center;
  margin-top: 20px;
}

.parsing-actions .el-button,
.generating-actions .el-button,
.preview-edit-actions .el-button {
  margin: 0 10px;
}

/* 生成进度样式 */
.generating-content {
  text-align: center;
  padding: 20px;
}

.generating-text {
  margin: 15px 0;
  color: #606266;
  font-size: 16px;
}

.generated-preview {
  margin-top: 30px;
  text-align: left;
}

.generated-preview h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.lesson-plan-preview {
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}

/* 预览编辑模式样式 */
.preview-mode, .edit-mode {
  min-height: 400px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 500;
  color: #606266;
}

.preview-content {
  min-height: 400px;
  overflow-y: auto;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}

.editor-container {
  min-height: 400px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 500;
  color: #606266;
}

.markdown-editor {
  min-height: 350px;
}

/* 加载中遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.loading-content i {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 10px;
}

.loading-content p {
  margin: 0;
  color: #606266;
}

/* 预览内容样式 */
.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.preview-content h1 {
  font-size: 24px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.preview-content h2 {
  font-size: 20px;
  color: #409eff;
}

.preview-content h3 {
  font-size: 18px;
  color: #606266;
}

.preview-content p {
  margin-bottom: 15px;
  line-height: 1.8;
  color: #606266;
}

.preview-content code {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e6a23c;
}

.preview-content pre {
  background-color: #f4f4f4;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  border-left: 4px solid #409eff;
}

.preview-content blockquote {
  border-left: 4px solid #409eff;
  margin: 15px 0;
  padding-left: 15px;
  color: #666;
  background-color: #f8f9fa;
  padding: 10px 15px;
}

.preview-content ul,
.preview-content ol {
  padding-left: 25px;
  margin-bottom: 15px;
}

.preview-content li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.preview-content strong {
  color: #303133;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .parsing-content {
    flex-direction: column;
  }
  
  .parsing-item {
    margin-bottom: 20px;
  }
  
  .upload-card {
    height: auto;
    min-height: 250px;
  }
  
  .upload-dragger {
    height: 150px;
  }
}
</style>