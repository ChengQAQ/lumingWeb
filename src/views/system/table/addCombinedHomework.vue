<template>
  <div class="app-container">
    <div class="homework-builder">
      <!-- 左侧：数据源选择区域 -->
      <DataSourceSelector
        :data-source-type="dataSourceType"
        :chapter-options="chapterOptions"
        :knowledge-options="knowledgeOptions"
        :material-options="materialOptions"
        :loading-materials="loadingMaterials"
        :is-admin="isAdmin"
        :teacher-subject-name="teacherSubjectName"
        :selected-subject-for-material="selectedSubjectForMaterial"
        :material-subject-options="materialSubjectOptions"
        :selected-series-type="selectedSeriesType"
        :series-search-keyword="seriesSearchKeyword"
        :series-type-options="seriesTypeOptions"
        @switch-data-source="switchDataSource"
        @chapter-click="handleChapterClick"
        @knowledge-click="handleKnowledgeClick"
        @material-click="handleMaterialClick"
        @subject-change="onSubjectChange"
        @series-type-change="onSeriesTypeChange"
        @series-search="onSeriesSearch"
      >
        <!-- 拍照搜题插槽 -->
        <template #photo-search>
          <PhotoSearch
            :is-admin="isAdmin"
            :teacher-subject-name="teacherSubjectName"
            @search-success="handlePhotoSearchSuccess"
            @search-error="handlePhotoSearchError"
          />
        </template>
        
        <!-- 菁优网搜题插槽 -->
        <template #third-party-search>
          <ThirdPartySearch
            :is-admin="isAdmin"
            :teacher-subject-name="teacherSubjectName"
            :knowledge-options="knowledgeOptions"
            @search-success="handleThirdPartySearchSuccess"
            @search-error="handleThirdPartySearchError"
          />
        </template>
      </DataSourceSelector>

      <!-- 中间：题目展示区域 -->
      <QuestionList
        ref="questionListRef"
        :questions="filteredQuestions"
        :question-types="questionTypes"
        :selected-questions="selectedQuestions"
        :process-question-content="processQuestionContent"
        @show-analysis="showAnalysis"
        @add-to-paper="addToHomework"
      />

      <!-- 右侧：作业信息区域 -->
      <div class="right-panel">
        <!-- 作业信息 -->
        <PaperInfo
          :form="form"
          :subject-options="subjectOptions"
          :selected-questions="selectedQuestions"
          :is-homework="true"
          @generate-paper="generateHomework"
        />

        <!-- 已选题目 -->
        <SelectedQuestions
          :selected-questions="selectedQuestions"
          :process-question-content="processQuestionContent"
          @show-analysis="showAnalysis"
          @remove-from-paper="removeFromHomework"
        />
      </div>
    </div>

    <!-- 解析弹窗 -->
    <QuestionAnalysisDialog
      :visible="analysisVisible"
      :current-question="currentQuestion"
      :question-detail="questionDetail"
      :loading-detail="loadingDetail"
      :process-question-content="processQuestionContent"
      @close="closeAnalysis"
    />
  </div>
</template>

<script>
import { addTable } from "@/api/system/table"
import { getQuestionDetail } from "@/api/system/paper"
import latexRenderer from '@/utils/latexRenderer'
import { addLog } from "@/api/system/log.js"

// 导入组件
import DataSourceSelector from '@/components/PaperBuilder/DataSourceSelector.vue'
import QuestionList from '@/components/PaperBuilder/QuestionList.vue'
import PaperInfo from '@/components/PaperBuilder/PaperInfo.vue'
import SelectedQuestions from '@/components/PaperBuilder/SelectedQuestions.vue'
import QuestionAnalysisDialog from '@/components/PaperBuilder/QuestionAnalysisDialog.vue'
import PhotoSearch from '@/components/PaperBuilder/PhotoSearch.vue'
import ThirdPartySearch from '@/components/PaperBuilder/ThirdPartySearch.vue'
import questionSearchMixin from '@/components/PaperBuilder/questionSearchMixin.js'

export default {
  name: "AddCombinedHomework",
  mixins: [questionSearchMixin],
  components: {
    DataSourceSelector,
    QuestionList,
    PaperInfo,
    SelectedQuestions,
    QuestionAnalysisDialog,
    PhotoSearch,
    ThirdPartySearch
  },
  data() {
    return {
      form: {
        subject: null,
        customPaperName: null,
        questionIds: null,
        knowledgePointIds: null,
        knowledgeCode: [],
        questionUrl: []
      },
      // 解析弹窗
      analysisVisible: false,
      currentQuestion: null,
      questionDetail: null,
      loadingDetail: false
    }
  },
  created() {
    // mixin 中的方法
    this.getSubjectOptions()
    this.loadChapterList()
    this.loadKnowledgeList()
    this.loadTeacherInfo()
    this.loadMaterialSubjectOptions()
  },
  methods: {
    // 处理拍照搜题成功
    handlePhotoSearchSuccess(questions) {
      this.allQuestions = questions || []
      this.filteredQuestions = [...this.allQuestions]
      this.filterQuestions()
      // 记录日志
      if (this.filteredQuestions.length > 0) {
        const ids = this.filteredQuestions.map(item => item.sid).join(',')
        addLog({
          calledTableName: '作业',
          calledTableId: ids,
          isRead: 1,
          isClickRead: 0,
          isUsed: 0
        })
      }
      // 重置滚动条
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },
    
    // 处理拍照搜题错误
    handlePhotoSearchError(error) {
      this.allQuestions = []
      this.filteredQuestions = []
    },
    
    // 处理菁优网搜题成功
    handleThirdPartySearchSuccess(questions, total) {
      this.allQuestions = questions || []
      this.filteredQuestions = [...this.allQuestions]
      this.filterQuestions()
      // 记录日志
      if (this.filteredQuestions.length > 0) {
        const ids = this.filteredQuestions.map(item => item.sid).join(',')
        addLog({
          calledTableName: '作业',
          calledTableId: ids,
          isRead: 1,
          isClickRead: 0,
          isUsed: 0
        })
      }
      // 重置滚动条
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },
    
    // 处理菁优网搜题错误
    handleThirdPartySearchError(error) {
      this.allQuestions = []
      this.filteredQuestions = []
    },
    // mixin 中已包含的方法，这里只需要实现特有的方法
    showAnalysis(question) {
      this.currentQuestion = question
      this.analysisVisible = true
      this.loadingDetail = true
      this.questionDetail = null
      // 新增：解析记录日志
      addLog({
        calledTableName: '作业',
        calledTableId: question.sid,
        isRead: 0,
        isClickRead: 1,
        isUsed: 0
      });
      // 构建请求数据
      const requestData = {
        subject_name: this.getSubjectFromChapter(question),
        sids: [question.sid]
      }
      
      // 调用API获取题目详情
      getQuestionDetail(requestData).then(res => {
        console.log('API响应:', res)
        // 检查响应数据格式
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          // 新格式：{questions: [...]}，取第一个题目
          this.questionDetail = res.questions[0]
        } else if (res && res.SID) {
          // 直接返回题目详情数据
          this.questionDetail = res
        } else if (res && res.code === 200 && res.data) {
          // 标准格式：{code: 200, data: {...}}
          this.questionDetail = res.data
        } else {
          this.$message.error('获取题目详情失败: 数据格式错误')
        }
      }).catch(error => {
        console.error('获取题目详情失败:', error)
        this.$message.error('获取题目详情失败: ' + (error.message || '网络错误'))
      }).finally(() => {
        this.loadingDetail = false
      })
    },
    addToHomework(question) {
      if (!this.isQuestionSelected(question.sid)) {
        this.selectedQuestions.push(question)
        this.filterSelectedQuestions()
        // 新增：添加到作业记录日志
        addLog({
          calledTableName: '作业',
          calledTableId: question.sid,
          isRead: 0,
          isClickRead: 0,
          isUsed: 1
        });
      }
    },
    removeFromHomework(sid) {
      const index = this.selectedQuestions.findIndex(q => q.sid === sid)
      if (index > -1) {
        this.selectedQuestions.splice(index, 1)
        this.filterSelectedQuestions()
      }
    },
    isQuestionSelected(sid) {
      return this.selectedQuestions.some(q => q.sid === sid)
    },
    generateHomework(form) {
      if (this.selectedQuestions.length === 0) {
        this.$message.warning('请先选择题目')
        return
      }

          // 构建提交数据
          const submitData = {
        subject: form.subject,
        customPaperName: form.customPaperName,
            questionIds: this.selectedQuestions.map(q => q.sid).join(','),
            knowledgePointIds: this.currentChapter ? this.buildChapterPath(this.currentChapter) : ''
          }

          addTable(submitData).then(() => {
            this.$modal.msgSuccess('作业创建成功')
            this.goBack()
          }).catch(error => {
            this.$message.error('作业创建失败：' + error.message)
      })
    },
    // getSubjectFromChapter 已在 mixin 中实现
    isCorrectOption(index, answers) {
      // 判断选项是否为正确答案
      if (!answers || !Array.isArray(answers)) return false
      return answers.includes(index.toString())
    },
    processQuestionContent(content) {
      if (!content) return ''
      
      // 使用latexRenderer组件处理题目内容，包括HTML解码和LaTeX渲染
      let processedContent = latexRenderer.processQuestionContent(content)
      
      // 处理可编辑答案输入区域 - 支持多种格式
      return processedContent
        .replace(
          /<!--BA--><div (?:class="quizPutTag"|class="\\quizPutTag\\") contenteditable="true">\s*(&nbsp;)?<\/div><!--EA-->/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        )
        .replace(
          /<div class='quizPutTag' contenteditable='true'>&nbsp;<\/div>/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        )
    },
    extractAnswerFromMethod(method) {
      if (!method) return ''
      // 从解析中提取答案部分
      const answerMatch = method.match(/故选[：:]\s*([^<]+)/)
      if (answerMatch) {
        const answer = this.decodeHtmlEntities(answerMatch[1])
        return `<strong>答案：</strong>${answer}`
      }
      // 如果没有找到"故选"，尝试其他模式
      const otherMatch = method.match(/答案[：:]\s*([^<]+)/)
      if (otherMatch) {
        const answer = this.decodeHtmlEntities(otherMatch[1])
        return `<strong>答案：</strong>${answer}`
      }
      return method
    },
    decodeHtmlEntities(text) {
      if (!text) return ''
      const textarea = document.createElement('textarea')
      textarea.innerHTML = text
      return textarea.value
    },
    goBack() {
      this.$router.push('/student/table')
      // 添加一个标记，表示需要刷新列表
      this.$store.commit('setNeedRefresh', true)
    },
    // 以下方法已在 mixin 中实现：
    // onSubjectChange, loadMaterialList, applyMaterialFilters, 
    // onSeriesTypeChange, onSeriesSearch, buildMaterialTree, 
    // parseContentsToTree, buildMaterialPath, loadQuestionsByMaterial
    closeAnalysis() {
      this.analysisVisible = false
      this.currentQuestion = null
      this.questionDetail = null
    },
    // 重置题目列表滚动条
    resetQuestionListScroll() {
      if (this.$refs.questionListRef) {
        this.$refs.questionListRef.resetScroll()
      }
    },
    
    // 获取日志表名（mixin 需要）
    getLogTableName() {
      return '作业'
    }
  }
}
</script>

<style scoped>
.homework-builder {
  display: flex;
  height: calc(100vh - 200px);
  gap: 20px;
}

.right-panel {
  width: 350px;
  flex-shrink: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
}


/* 数学公式错误样式 */
.math-error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  display: inline-block;
  margin: 0 2px;
}

/* KaTeX 数学公式样式优化 */
.katex {
  font-size: 1.1em;
}

.katex-display {
  margin: 1em 0;
  text-align: center;
}

/* 确保数学公式在选项中的正确显示 */
.option-content .katex,
.question-content .katex,
.analysis-content .katex,
.analyse-content .katex,
.discuss-content .katex {
  font-size: 1em;
  line-height: 1.2;
}
</style>