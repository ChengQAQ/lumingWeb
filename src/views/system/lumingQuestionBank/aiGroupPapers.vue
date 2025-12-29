<template>
  <div class="ai-group-papers-container">
    <div class="question-bank-builder">
      <!-- 左侧：章节选择 -->
      <div class="left-panel">

        <div class="data-source-content">
          <div class="source-title">章节选择</div>

          <!-- 章节树 -->
          <div class="chapter-tree">
            <div v-if="!selectedSubject" class="no-chapters">
              <i class="el-icon-info"></i>
              <p>请先选择科目</p>
            </div>
            <div v-else-if="chapterOptions.length === 0" class="no-chapters">
              <i class="el-icon-loading"></i>
              <p>暂无数据</p>
              <p class="no-data-tip">正在加载章节数据...</p>
            </div>
            <el-tree
              v-else
              ref="chapterTree"
              :data="filteredChapterOptions"
              :props="chapterProps"
              node-key="value"
              :expand-on-click-node="false"
              @check="handleChapterCheck"
              @node-click="handleNodeClick"
              :highlight-current="false"
              :default-expand-all="false"
              show-checkbox
              :check-strictly="true"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span :title="node.label" class="node-label">{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </div>
      </div>

      <!-- 中间：题目展示区域 -->
      <div class="center-panel-wrapper">
        <!-- 题目参数配置区域 -->
        <div class="params-section" v-if="selectedSubject">
          <h3>题目参数配置</h3>
          <div v-if="questionTypesLoading" class="loading-tip">
            <i class="el-icon-loading"></i>
            <span>正在加载题型...</span>
        </div>
          <el-form v-else-if="questionTypes && questionTypes.length > 0" :model="questionParams" size="small" class="compact-form">
            <!-- 难度选择 -->
            <div class="difficulty-selector">
              <el-form-item label="难度" class="difficulty-form-item">
                <el-select
                  v-model="paperDifficulty"
                  placeholder="请选择难度"
                  size="small"
                  style="width: 150px"
                >
                  <el-option label="简单" value="easy"></el-option>
                  <el-option label="较易" value="easier"></el-option>
                  <el-option label="适中" value="medium"></el-option>
                  <el-option label="较难" value="harder"></el-option>
                  <el-option label="困难" value="hard"></el-option>
                </el-select>
              </el-form-item>
            </div>
            <!-- 题型数量配置 -->
            <el-row :gutter="10">
              <el-col
                v-for="questionType in questionTypes"
                :key="questionType.name"
                :span="3"
                class="param-col"
              >
                <el-form-item
                  :label="questionType.name"
                  class="compact-form-item"
                >
                  <el-input-number
                    v-model="questionParams[questionType.name]"
                    :min="0"
                    :max="20"
                    controls-position="right"
                    size="small"
                    style="width: 100%"
                    placeholder="0-20"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 生成按钮 -->
            <div class="generate-button-wrapper">
              <el-button
                type="primary"
                size="small"
                :loading="generating"
                :disabled="!canGenerate"
                @click="generatePaper"
                icon="el-icon-magic-stick"
              >
                {{ generating ? '生成中...' : '生成试卷' }}
              </el-button>
              <el-button
                type="success"
                size="small"
                :loading="creatingHomework"
                :disabled="generatedQuestions.length === 0 || !selectedSubject"
                @click="createHomeworkDirectly"
                icon="el-icon-document-add"
                style="margin-left: 10px;"
              >
                {{ creatingHomework ? '生成中...' : '一键生成组卷' }}
              </el-button>
              <el-button
                type="warning"
                size="small"
                :loading="creatingPaper"
                :disabled="generatedQuestions.length === 0 || !selectedSubject"
                @click="createPaperDirectly"
                icon="el-icon-document-add"
                style="margin-left: 10px;"
              >
                {{ creatingPaper ? '生成中...' : '一键生成试卷' }}
              </el-button>
            </div>
          </el-form>
          <div v-else class="no-types-tip">
            <i class="el-icon-warning"></i>
            <span>暂无可用的题型，请先选择科目</span>
        </div>
        </div>
        <div v-else class="params-section">
          <h3>题目参数配置</h3>
          <div class="no-subject-tip">
            <i class="el-icon-info"></i>
            <span>请先选择科目以加载题型</span>
      </div>
    </div>

        <!-- 题目列表显示区域 -->
        <div class="question-list-wrapper">
          <GeneratedQuestionList
            ref="questionListRef"
            :questions="generatedQuestions"
            :question-types="questionTypes"
            :selected-questions="selectedQuestions"
            :process-question-content="processQuestionContent"
            :subject-name="selectedSubject"
            @show-analysis="showAnalysis"
            @toggle-selection="toggleQuestionSelection"
            @show-similar-questions="showSimilarQuestions"
          />
        </div>
      </div>
    </div>

    <!-- 题目分析弹窗 -->
    <QuestionAnalysisDialog
      :visible="questionAnalysisDialogVisible"
      :current-question="currentAnalysisQuestion"
      :question-detail="questionDetail"
      :loading-detail="loadingDetail"
      :process-question-content="processQuestionContent"
      @close="closeAnalysis"
    />

    <!-- 相似题目弹窗 -->
    <el-dialog
      title="相似题目"
      :visible.sync="similarQuestionsDialogVisible"
      width="80%"
      :close-on-click-modal="false"
      append-to-body
    >
      <!-- 数量选择下拉框 -->
      <div class="similar-questions-header">
        <span class="limit-label">显示数量：</span>
        <el-select
          v-model="similarQuestionsLimit"
          placeholder="请选择数量"
          size="small"
          style="width: 120px"
          @change="handleSimilarQuestionsLimitChange"
        >
          <el-option label="10" :value="10"></el-option>
          <el-option label="15" :value="15"></el-option>
          <el-option label="20" :value="20"></el-option>
        </el-select>
      </div>
      <div v-if="loadingSimilarQuestions" class="loading-container">
        <i class="el-icon-loading"></i>
        <span>正在加载相似题目...</span>
      </div>
      <div v-else-if="similarQuestions.length === 0" class="no-data-container">
        <el-empty description="暂无相似题目"></el-empty>
      </div>
      <div v-else class="similar-questions-list">
        <div
          v-for="(question, index) in similarQuestions"
          :key="question.sid || question.SID || question.questionSid || index"
          class="similar-question-item"
        >
          <div class="question-header">
            <div class="question-header-left">
              <span class="question-type">{{ question.catename || '未知题型' }}</span>
              <span class="question-difficulty">难度: {{ question.degree || '未知' }}</span>
            </div>
            <div class="question-actions">
              <el-button
                v-if="!isSimilarQuestionSelected(question)"
                type="text"
                size="small"
                @click="addSimilarQuestionToPaper(question)"
                class="add-to-paper-btn"
              >
                添加题目
              </el-button>
              <el-button
                v-else
                type="text"
                size="small"
                @click="removeSimilarQuestionFromPaper(question)"
                class="remove-from-paper-btn"
              >
                移除题目
              </el-button>
            </div>
          </div>
          <div class="question-content">
            <div class="question-text">
              <span v-if="question.label" class="question-label">{{ question.label }}</span>
              <span v-html="processQuestionContent(question.question || question.Content || question.content)"></span>
            </div>
            <div class="question-options" v-if="question.options || question.Options">
              <div
                v-for="(option, optIndex) in parseOptions(question.options || question.Options)"
                :key="optIndex"
                class="option-item"
              >
                <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                <span class="option-content" v-html="processQuestionContent(removeOptionPrefix(option, optIndex))"></span>
              </div>
            </div>
            <!-- 显示答案 -->
            <div v-if="question.displayanswer || question.answers" class="question-answer">
              <strong>答案：</strong>
              <span>{{ question.displayanswer || formatAnswers(question.answers) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeSimilarQuestions">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import questionSearchMixin from '@/components/PaperBuilder/questionSearchMixin.js'
import { getQuestionTypes } from '@/api/system/paper'
import { getTeacherInfo, recommendSimilarPaperUpdate, generatePaperByChapterList } from '@/api/system/teacher'
import GeneratedQuestionList from '@/components/PaperBuilder/GeneratedQuestionList.vue'
import QuestionAnalysisDialog from '@/components/PaperBuilder/QuestionAnalysisDialog.vue'
import latexRenderer from '@/utils/latexRenderer'
import { getQuestionDetail } from '@/api/system/paper'
import { addLog } from '@/api/system/log.js'
import { addTable } from '@/api/system/table'
import { addPaper } from '@/api/system/paper'

export default {
  name: "aiGroupPapers",
  mixins: [questionSearchMixin],
  components: {
    GeneratedQuestionList,
    QuestionAnalysisDialog
  },
  props: {
    // 从父组件接收科目选择
    selectedSubject: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 当前选中的章节（数组，支持多选）
      selectedChapters: [],
      // 章节树引用
      chapterTreeRef: null,
      // 章节树配置
      chapterProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true,
        emitPath: false,
        expandTrigger: 'click'
      },
      // 题目参数配置（动态，根据题型生成）
      questionParams: {},
      // 题型加载状态
      questionTypesLoading: false,
      // 试卷难度
      paperDifficulty: 'easy',
      // 生成状态
      generating: false,
      // 标记是否正在加载，避免重复调用
      isLoadingChapterList: false,
      // 标记是否已经初始化完成
      isInitialized: false,
      // 生成的题目列表
      generatedQuestions: [],
      // 题目分析弹窗显示状态
      questionAnalysisDialogVisible: false,
      // 当前分析的题目
      currentAnalysisQuestion: null,
      // 题目详情
      questionDetail: null,
      // 加载题目详情状态
      loadingDetail: false,
      // 相似题目弹窗显示状态
      similarQuestionsDialogVisible: false,
      // 相似题目列表
      similarQuestions: [],
      // 加载相似题目状态
      loadingSimilarQuestions: false,
      // 当前查看相似题目的题目
      currentSimilarQuestion: null,
      // 相似题目数量限制
      similarQuestionsLimit: 10,
      // 保存相似题目请求参数，用于重新调用接口
      similarQuestionsRequestData: null,
      // 一键生成组卷状态
      creatingHomework: false,
      // 一键生成试卷状态
      creatingPaper: false
    }
  },
  created() {
    // 加载科目列表（虽然不显示下拉框，但可能需要用于其他逻辑）
    this.getSubjectOptions()
    // 先加载教师信息（重写后的方法不会自动调用 loadChapterList，由 watch 统一处理）
    this.loadTeacherInfoWithoutChapterList().then(() => {
      this.isInitialized = true
      // 初始化完成后，如果已经有科目，触发一次加载
      if (this.selectedSubject) {
        this.loadDataForSubject(this.selectedSubject)
      } else {
        // 如果没有科目，只加载版本列表
    this.loadVersionList()
      }
    })
  },
  watch: {
    // 监听科目变化（从父组件传入），重新加载章节列表
    selectedSubject: {
      handler(newVal, oldVal) {
        // 如果还没有初始化完成，等待初始化完成
        if (!this.isInitialized) {
          return
        }

        // 如果是第一次初始化（immediate: true 触发），且没有科目，不执行
        if (oldVal === undefined && !newVal) {
          // 初始化时如果没有科目，只加载版本列表（不传科目）
          this.loadVersionList()
          return
        }

        // 如果科目没有变化，不重复加载
        if (oldVal === newVal) {
          return
        }

        // 如果科目发生变化，清空当前选中的章节
        if (oldVal !== undefined && oldVal !== newVal) {
          this.selectedChapters = []
          // 重置版本选择
          this.selectedVersion = ''
          // 清空树的选择状态
          this.$nextTick(() => {
            if (this.$refs.chapterTree) {
              this.$refs.chapterTree.setCheckedKeys([])
            }
          })
        }

        // 加载数据
        if (newVal) {
          this.loadDataForSubject(newVal)
        } else {
          // 科目清空时，重新加载所有数据
          this.loadChapterList()
          this.loadVersionList()
          // 清空题型和参数
          this.questionTypes = []
          this.questionParams = {}
        }
      },
      immediate: true
    },
  },
  methods: {
    // 重写 loadTeacherInfo，不自动调用 loadChapterList，避免重复调用
    loadTeacherInfoWithoutChapterList() {
      return getTeacherInfo().then(res => {
        if (res.code === 200) {
          // 将教师信息保存到 store
          this.$store.commit('setTeacherInfo', res.data)
          this.teacherInfo = res.data
          this.isAdmin = this.checkIsAdmin()
          // 注意：不在这里调用 loadChapterList，由 watch selectedSubject 统一处理
        } else {
          console.error('获取教师信息失败:', res)
        }
      }).catch(error => {
        console.error('获取教师信息失败:', error)
      })
    },
    // 统一加载科目相关数据的方法，避免重复调用
    loadDataForSubject(subject) {
      // 如果正在加载，跳过
      if (this.isLoadingChapterList) {
        return
      }
      this.isLoadingChapterList = true

      // 重新加载章节列表（按科目过滤）
      const chapterListPromise = this.loadChapterList(subject)
      // 如果返回 Promise，使用 finally；否则直接重置标志
      if (chapterListPromise && typeof chapterListPromise.finally === 'function') {
        chapterListPromise.finally(() => {
          this.isLoadingChapterList = false
        })
      } else {
        // 如果 loadChapterList 不返回 Promise，延迟重置标志
            this.$nextTick(() => {
          this.isLoadingChapterList = false
        })
      }

      // 重新加载版本列表（按科目过滤）
      this.loadVersionList(subject)
      // 重新加载题型列表
      this.loadQuestionTypes()
    },
    // 章节复选框变化处理
    handleChapterCheck(data, checkedInfo) {
      // 获取所有选中的节点
      const checkedKeys = checkedInfo.checkedKeys || []
      const halfCheckedKeys = checkedInfo.halfCheckedKeys || []

      // 根据选中的key找到对应的章节数据
      this.selectedChapters = this.getChaptersByKeys(checkedKeys)

      console.log('选中的章节:', this.selectedChapters)
      // 这里可以根据需要添加后续处理逻辑，比如加载题目等
    },
    // 节点点击处理（点击文字时，如果是叶子节点则切换选中状态）
    handleNodeClick(data, node, component) {
      // 判断是否是叶子节点：没有子节点或者子节点为空
      const isLeaf = !node.childNodes || node.childNodes.length === 0 || (data.children && data.children.length === 0)

      if (isLeaf) {
        // 如果是叶子节点（最后一级），点击文字时切换选中状态
        const isChecked = node.checked
        const newCheckedState = !isChecked

        // 使用 setChecked 方法切换选中状态
        this.$refs.chapterTree.setChecked(data.value, newCheckedState)

        // 手动触发更新，确保 selectedChapters 同步更新
        this.$nextTick(() => {
          // 获取当前所有选中的节点
          const checkedKeys = this.$refs.chapterTree.getCheckedKeys()
          const halfCheckedKeys = this.$refs.chapterTree.getHalfCheckedKeys ? this.$refs.chapterTree.getHalfCheckedKeys() : []

          // 手动调用 handleChapterCheck 来更新 selectedChapters
          this.handleChapterCheck(data, {
            checkedKeys: checkedKeys || [],
            halfCheckedKeys: halfCheckedKeys || []
          })
        })
      } else {
        // 非叶子节点，点击时展开/收起
        node.expanded = !node.expanded
      }
    },
    // 根据key数组获取章节数据
    getChaptersByKeys(keys) {
      const chapters = []
      const findChapter = (nodes, targetKeys) => {
        if (!nodes || !Array.isArray(nodes)) return
        nodes.forEach(node => {
          if (targetKeys.includes(node.value)) {
            chapters.push(node)
          }
          if (node.children && node.children.length > 0) {
            findChapter(node.children, targetKeys)
          }
        })
      }
      // 在原始数据中查找（包含最外层）
      findChapter(this.chapterOptions, keys)
      return chapters
    },
    // 重写 loadQuestionTypes 方法，初始化 questionParams
    loadQuestionTypes() {
      if (!this.selectedSubject) {
        this.questionTypes = []
        this.questionParams = {}
        return
      }

      this.questionTypesLoading = true

      // 调用 mixin 中的方法获取题型
      const subjectName = this.selectedSubject || ''

      if (!subjectName) {
        this.questionTypes = []
        this.questionParams = {}
        this.questionTypesLoading = false
        return
      }

      // 直接使用导入的 getQuestionTypes API
      getQuestionTypes(subjectName).then(res => {
        if (res.message === 'success' && res.question_types) {
          // 将题型对象转换为数组
          this.questionTypes = Object.keys(res.question_types).map(name => ({
            name,
            count: res.question_types[name]
          }))

          // 初始化 questionParams，为每个题型设置默认值1
          const newParams = {}
          this.questionTypes.forEach(type => {
            // 如果之前已经有值，保留；否则设置为1
            newParams[type.name] = this.questionParams[type.name] || 1
          })
          this.questionParams = newParams

          console.log('获取到的题型列表:', this.questionTypes)
          console.log('题目参数配置:', this.questionParams)
        } else {
          console.error('获取题型列表失败:', res)
          this.questionTypes = []
          this.questionParams = {}
        }
      }).catch(error => {
        console.error('获取题型列表失败:', error)
        this.questionTypes = []
        this.questionParams = {}
      }).finally(() => {
        this.questionTypesLoading = false
      })
    },
    // 生成试卷
    async generatePaper() {
      if (!this.canGenerate) {
        this.$message.warning('请先选择科目、章节、难度，并至少设置一个题型的数量')
        return
      }

      // 构建章节路径数组
      const chapters = this.selectedChapters.map(chapter => {
        let path = ''
        // 优先使用 content 字段，如果没有则使用构建的路径
        if (chapter.content) {
          path = chapter.content
        } else {
          // 使用 buildChapterPath 方法构建路径
          path = this.buildChapterPath(chapter)
        }

        // 去掉版本信息：路径格式通常是 level/subject/version/chapter1/chapter2/...
        // 需要去掉第三个部分（索引2）的版本信息
        if (path) {
          const pathParts = path.split('/')
          // 如果路径至少有3个部分（level/subject/version），去掉版本部分
          if (pathParts.length >= 3) {
            // 去掉索引为2的部分（版本信息）
            pathParts.splice(2, 1)
            path = pathParts.join('/')
          }
        }

        return path
      })

      // 构建题型对象（只包含数量大于0的题型）
      const questionTypes = {}
      Object.keys(this.questionParams).forEach(typeName => {
        const count = this.questionParams[typeName]
        if (count > 0) {
          questionTypes[typeName] = count
        }
      })

      // 从章节路径中提取 level（如 "middle" 或 "high"）
      let level = 'middle' // 默认值
      if (chapters.length > 0) {
        const firstPath = chapters[0]
        if (firstPath.startsWith('middle/')) {
          level = 'middle'
        } else if (firstPath.startsWith('high/')) {
          level = 'high'
        } else if (firstPath.startsWith('primary/')) {
          level = 'primary'
        }
      }

      // 构建请求参数
      const requestData = {
        chapters: chapters,
        subject: this.selectedSubject,
        level: level,
        paper_difficulty: this.paperDifficulty,
        question_types: questionTypes
      }

      console.log('生成试卷请求参数:', requestData)

      this.generating = true
      try {
        const response = await generatePaperByChapterList(requestData)
          this.$message.success(response.message)
            this.generatedQuestions = response.data.questions

          // 生成试卷后，等待组件更新后加载收藏状态
          this.$nextTick(() => {
            if (this.$refs.questionListRef && this.generatedQuestions.length > 0) {
              // 手动触发加载收藏状态
              this.$refs.questionListRef.loadFavoriteStatus()
            }
          })
      } catch (error) {
        console.error('生成试卷失败:', error)
        this.$message.error('生成试卷失败：' + (error.message || '网络错误'))
        this.generatedQuestions = []
      } finally {
        this.generating = false
      }
    },
    // 处理题目内容
    processQuestionContent(content) {
      if (!content) return ''
      // 使用latexRenderer组件处理题目内容
      let processedContent = latexRenderer.processQuestionContent(content)
      // 处理可编辑答案输入区域
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
    // 显示题目分析
    showAnalysis(question) {
      this.currentAnalysisQuestion = question
      this.questionAnalysisDialogVisible = true
      this.loadingDetail = true
      this.questionDetail = null

      // 记录日志
      addLog({
        calledTableName: this.getLogTableName(),
        calledTableId: question.sid || question.SID || question.questionSid,
        isRead: 0,
        isClickRead: 1,
        isUsed: 0
      })

      // 优先使用选择的科目作为 subject_name
      let subjectName = this.selectedSubject || ''

      // 如果还是没有科目，使用默认值
      if (!subjectName) {
        subjectName = '高中通用'
      }

      // 构建请求数据
      const requestData = {
        subject_name: subjectName,
        sids: [question.sid || question.SID || question.questionSid]
      }

      // 调用API获取题目详情
      getQuestionDetail(requestData).then(res => {
        // 检查响应数据格式
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          this.questionDetail = res.questions[0]
        } else if (res && res.SID) {
          this.questionDetail = res
        } else if (res && res.code === 200 && res.data) {
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
    // 关闭题目分析
    closeAnalysis() {
      this.questionAnalysisDialogVisible = false
      this.currentAnalysisQuestion = null
      this.questionDetail = null
    },
    // 切换题目选择状态（添加/移除题目）
    toggleQuestionSelection(question) {
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        this.$message.warning('题目ID不存在')
        return
      }

      // 检查是否已选中
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      const isSelected = selectedQuestions.some(q => {
        const qId = q.sid || q.SID || q.questionSid
        return qId && (qId === questionId || String(qId) === String(questionId))
      })

      if (isSelected) {
        // 已选中，移除
        this.$store.commit('removeSelectedQuestion', questionId)
        this.$message.success('题目已从已选列表移除')
      } else {
        // 未选中，添加
        this.$store.commit('addSelectedQuestion', question)
        this.$message.success('题目已添加到已选列表')
        // 记录日志
        addLog({
          calledTableName: this.getLogTableName(),
          calledTableId: questionId,
          isRead: 0,
          isClickRead: 0,
          isUsed: 1
        })
      }
    },
    // 显示相似题目
    async showSimilarQuestions(question) {
      this.currentSimilarQuestion = question
      this.similarQuestionsDialogVisible = true
      this.loadingSimilarQuestions = true
      this.similarQuestions = []

      // 获取题目ID
      const sid = question.sid || question.SID || question.questionSid
      if (!sid) {
        this.$message.warning('题目ID不存在')
        this.loadingSimilarQuestions = false
        return
      }

      // 构建章节路径数组
      const chapters = this.selectedChapters.map(chapter => {
        let path = ''
        if (chapter.content) {
          path = chapter.content
        } else {
          path = this.buildChapterPath(chapter)
        }

        // 去掉版本信息
        if (path) {
          const pathParts = path.split('/')
          if (pathParts.length >= 3) {
            pathParts.splice(2, 1)
            path = pathParts.join('/')
          }
        }

        return path
      })

      // 获取中文科目名称
      const subject = this.selectedSubject || ''

      // 构建请求参数
      const requestData = {
        sid: sid,
        chapters: chapters,
        subject: subject,
        limit: this.similarQuestionsLimit
      }

      // 保存请求参数，用于重新调用接口
      this.similarQuestionsRequestData = requestData

      console.log('相似题目请求参数:', requestData)

      try {
        const response = await recommendSimilarPaperUpdate(requestData)

        if (response.code === 200) {
          // 接口返回 data.similar_questions
          if (response.data && response.data.similar_questions && Array.isArray(response.data.similar_questions)) {
            this.similarQuestions = response.data.similar_questions
          } else {
            this.similarQuestions = []
            this.$message.warning('未获取到相似题目数据')
          }
          console.log('相似题目结果:', this.similarQuestions)
        } else {
          this.$message.error(response.msg || '获取相似题目失败')
          this.similarQuestions = []
        }
      } catch (error) {
        console.error('获取相似题目失败:', error)
        this.$message.error('获取相似题目失败：' + (error.message || '网络错误'))
        this.similarQuestions = []
      } finally {
        this.loadingSimilarQuestions = false
      }
    },
    // 关闭相似题目弹窗
    closeSimilarQuestions() {
      this.similarQuestionsDialogVisible = false
      this.similarQuestions = []
      this.currentSimilarQuestion = null
      this.similarQuestionsRequestData = null
    },
    // 处理相似题目数量限制变化
    async handleSimilarQuestionsLimitChange(limit) {
      if (!this.similarQuestionsRequestData) {
        return
      }

      // 更新limit值
      this.similarQuestionsRequestData.limit = limit

      // 重新调用接口
      this.loadingSimilarQuestions = true
      this.similarQuestions = []

      try {
        const response = await recommendSimilarPaperUpdate(this.similarQuestionsRequestData)

        if (response.code === 200) {
          // 接口返回 data.similar_questions
          if (response.data && response.data.similar_questions && Array.isArray(response.data.similar_questions)) {
            this.similarQuestions = response.data.similar_questions
          } else {
            this.similarQuestions = []
            this.$message.warning('未获取到相似题目数据')
          }
          console.log('相似题目结果:', this.similarQuestions)
        } else {
          this.$message.error(response.msg || '获取相似题目失败')
          this.similarQuestions = []
        }
      } catch (error) {
        console.error('获取相似题目失败:', error)
        this.$message.error('获取相似题目失败：' + (error.message || '网络错误'))
        this.similarQuestions = []
      } finally {
        this.loadingSimilarQuestions = false
      }
    },
    // 检查相似题目是否已选中
    isSimilarQuestionSelected(question) {
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) return false

      const selectedQuestions = this.$store.getters.selectedQuestions || []
      return selectedQuestions.some(q => {
        const qId = q.sid || q.SID || q.questionSid
        return qId && (qId === questionId || String(qId) === String(questionId))
      })
    },
    // 添加相似题目到试卷
    addSimilarQuestionToPaper(question) {
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        this.$message.warning('题目ID不存在')
        return
      }

      // 检查是否已选中
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      const isSelected = selectedQuestions.some(q => {
        const qId = q.sid || q.SID || q.questionSid
        return qId && (qId === questionId || String(qId) === String(questionId))
      })

      if (isSelected) {
        this.$message.warning('该题目已在已选列表中')
        return
      }

      // 添加到试卷
      this.$store.commit('addSelectedQuestion', question)
      this.$message.success('题目已添加到已选列表')
      // 记录日志
      addLog({
        calledTableName: this.getLogTableName(),
        calledTableId: questionId,
        isRead: 0,
        isClickRead: 0,
        isUsed: 1
      })
      // 强制更新组件，使按钮状态正确显示
      this.$forceUpdate()
    },
    // 从试卷移除相似题目
    removeSimilarQuestionFromPaper(question) {
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        this.$message.warning('题目ID不存在')
        return
      }

      // 从试卷移除
      this.$store.commit('removeSelectedQuestion', questionId)
      this.$message.success('题目已从已选列表移除')
      // 强制更新组件，使按钮状态正确显示
      this.$forceUpdate()
    },
    // 解析选项（用于相似题目显示）
    parseOptions(options) {
      if (!options) return []
      if (typeof options === 'string') {
        try {
          const parsed = JSON.parse(options)
          return Array.isArray(parsed) ? parsed : [options]
        } catch {
          return [options]
        }
      }
      return Array.isArray(options) ? options : []
    },
    // 移除选项前缀（用于相似题目显示）
    removeOptionPrefix(option, index) {
      if (typeof option !== 'string') return option
      return option.replace(/^[A-Z][\.、]\s*/, '')
    },
    // 格式化答案（用于相似题目显示）
    formatAnswers(answers) {
      if (!answers) return ''
      if (typeof answers === 'string') {
        try {
          // 尝试解析 JSON 字符串，如 "['1']"
          const parsed = JSON.parse(answers)
          if (Array.isArray(parsed)) {
            return parsed.join(', ')
          }
          return parsed
        } catch {
          return answers
        }
      }
      if (Array.isArray(answers)) {
        return answers.join(', ')
      }
      return String(answers)
    },
    // 一键生成组卷
    async createHomeworkDirectly() {
      if (this.generatedQuestions.length === 0) {
        this.$message.warning('请先生成题目')
        return
      }
      if (!this.selectedSubject) {
        this.$message.warning('请先选择科目')
        return
      }

      this.creatingHomework = true
      try {
        // 获取所有题目的 sid
        const questionIds = this.generatedQuestions.map(q => {
          return q.sid || q.SID || q.questionSid
        }).filter(id => id)

        if (questionIds.length === 0) {
          this.$message.warning('没有找到有效的题目ID')
          return
        }

        // 生成任务名称：科目 + 时间 + 组卷
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const customPaperName = `${this.selectedSubject}${month}.${day}组卷`

        // 构建提交数据
        const submitData = {
          subject: this.selectedSubject,
          customPaperName: customPaperName,
          questionIds: questionIds.join(','),
          knowledgePointIds: ''
        }

        console.log('一键生成组卷请求参数:', submitData)

        // 调用创建组卷接口
        const response = await addTable(submitData)
        if (response && (response.code === 200 || response.status === 200 || response.success)) {
          this.$message.success(`组卷创建成功：${customPaperName}`)
        } else {
          this.$message.error('组卷创建失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('一键生成组卷失败:', error)
        this.$message.error('组卷创建失败：' + (error.message || '网络错误'))
      } finally {
        this.creatingHomework = false
      }
    },
    // 一键生成试卷
    async createPaperDirectly() {
      if (this.generatedQuestions.length === 0) {
        this.$message.warning('请先生成题目')
        return
      }
      if (!this.selectedSubject) {
        this.$message.warning('请先选择科目')
        return
      }

      this.creatingPaper = true
      try {
        // 获取所有题目的 sid
        const questionIds = this.generatedQuestions.map(q => {
          return q.sid || q.SID || q.questionSid
        }).filter(id => id)

        if (questionIds.length === 0) {
          this.$message.warning('没有找到有效的题目ID')
          return
        }
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const customPaperName = `${this.selectedSubject}${month}.${day}试卷`

        // 构建提交数据
        const submitData = {
          subject: this.selectedSubject,
          customPaperName: customPaperName,
          questionIds: questionIds.join(','),
          knowledgePointIds: ''
        }

        // 调用创建试卷接口
        const response = await addPaper(submitData)
        if (response && (response.code === 200 || response.status === 200 || response.success)) {
          this.$message.success(`试卷创建成功：${customPaperName}`)
        } else {
          this.$message.error('试卷创建失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('一键生成试卷失败:', error)
        this.$message.error('试卷创建失败：' + (error.message || '网络错误'))
      } finally {
        this.creatingPaper = false
      }
    }
  },
  computed: {
    // 从 store 获取已选题目
    selectedQuestions() {
      return this.$store.getters.selectedQuestions || []
    },
    canGenerate() {
      // 需要满足：选择了科目、选择了至少一个章节、选择了难度、至少有一个题型数量大于0
      if (!this.selectedSubject || !this.selectedChapters || this.selectedChapters.length === 0) {
        return false
      }
      if (!this.paperDifficulty) {
        return false
      }
      // 检查是否至少有一个题型数量大于0
      const hasQuestionType = Object.values(this.questionParams).some(count => count > 0)
      return hasQuestionType
    },
    // 过滤掉最外层的章节选项
    filteredChapterOptions() {
      if (!this.chapterOptions || this.chapterOptions.length === 0) {
        return []
      }

      // 如果最外层只有一个节点，且该节点有子节点，则返回其子节点
      // 否则返回所有节点的子节点合并后的数组
      const result = []

      this.chapterOptions.forEach(node => {
        if (node.children && node.children.length > 0) {
          // 将子节点添加到结果中
          result.push(...node.children)
        }
      })

      // 如果没有子节点，返回空数组（或者返回原始数据，根据实际需求）
      return result.length > 0 ? result : this.chapterOptions
    }
  }
}
</script>

<style scoped>
.ai-group-papers-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.question-bank-builder {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 20px;
}

/* 左侧面板样式 */
.left-panel {
  width: 350px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.data-source-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.source-title {
  padding: 10px 15px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
  color: #303133;
  font-size: 14px;
}


.chapter-tree {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  min-width: 0;
}

.custom-tree-node > span {
  flex: 1;
  min-width: 0;
}

.node-label {
  cursor: pointer;
  user-select: none;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.node-label:hover {
  background-color: #f0f9ff;
}

.no-chapters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
}

.no-chapters i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

.no-chapters i.el-icon-loading {
  animation: rotate 1s linear infinite;
}

.no-chapters p {
  margin: 8px 0;
  font-size: 14px;
}

.no-data-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 5px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 滚动条样式 */
.chapter-tree::-webkit-scrollbar {
  width: 6px;
}

.chapter-tree::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.chapter-tree::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 中间面板样式 */
.center-panel-wrapper {
  flex: 1;
  min-width: 1050px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  gap: 20px;
}

/* 题目参数配置区域 */
.params-section {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.params-section h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

/* 紧凑表单样式 */
.compact-form {
  margin: 0;
}

.compact-form-item {
  margin-bottom: 5px;
}

.compact-form-item ::v-deep .el-form-item {
  margin-bottom: 5px;
}

.compact-form-item ::v-deep .el-form-item__label {
  font-size: 11px;
  padding: 0 0 3px 0;
  line-height: 1.1;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-form-item ::v-deep .el-form-item__content {
  line-height: 1.1;
}

.compact-form-item ::v-deep .el-input-number {
  width: 100%;
}

.compact-form-item ::v-deep .el-input-number .el-input__inner {
  padding: 0 25px 0 5px;
  height: 28px;
  line-height: 28px;
  font-size: 12px;
}

.param-col {
  margin-bottom: 5px;
}

/* 难度选择器 */
.difficulty-selector {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.difficulty-form-item {
  margin-bottom: 0;
}

.difficulty-form-item ::v-deep .el-form-item__label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

/* 生成按钮 */
.generate-button-wrapper {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.param-tip {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.loading-tip,
.no-types-tip,
.no-subject-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  gap: 8px;
}

.loading-tip i {
  animation: rotate 1s linear infinite;
}

.no-types-tip i,
.no-subject-tip i {
  font-size: 16px;
  color: #c0c4cc;
}

.no-subject-hint,
.no-chapter-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.selected-chapter-info {
  width: 100%;
}

.chapter-info-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.chapter-info-content p {
  margin: 10px 0;
}

.chapter-info-content strong {
  color: #303133;
  margin-right: 8px;
}

.chapter-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.chapter-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.chapter-path {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.question-list-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 相似题目弹窗样式 */
.similar-questions-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.limit-label {
  font-size: 14px;
  color: #606266;
}

.loading-container,
.no-data-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  flex-direction: column;
  gap: 10px;
}

.loading-container i {
  font-size: 24px;
  color: #409eff;
}

.similar-questions-list {
  max-height: 600px;
  overflow-y: auto;
}

.similar-question-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 15px;
  background: #fff;
  padding: 15px;
}

.similar-question-item .question-header {
  padding: 10px 0;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.similar-question-item .question-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.similar-question-item .question-type {
  background: #409eff;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.similar-question-item .question-difficulty {
  font-size: 12px;
  color: #606266;
}

.similar-question-item .question-content {
  font-size: 14px;
  line-height: 1.8;
}

.similar-question-item .question-text {
  margin-bottom: 15px;
  color: #303133;
}

.similar-question-item .question-options {
  margin-top: 15px;
}

.similar-question-item .option-item {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.8;
}

.similar-question-item .option-label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
  min-width: 24px;
}

.similar-question-item .option-content {
  flex: 1;
  color: #303133;
}
</style>
