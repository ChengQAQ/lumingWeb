<template>
  <div>
    <el-dialog
      title="编辑题目"
      :visible.sync="dialogVisible"
      width="85%"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
      top="2vh !important"
      height="96vh"
      style="overflow: visible;"
      append-to-body
      :modal="true"
      :modal-append-to-body="true"
      @close="handleDialogClose"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <i class="el-icon-loading"></i>
        <p>正在加载题目详情...</p>
      </div>

      <!-- 题目编辑内容 -->
      <div class="question-edit-container" v-else-if="localQuestion">
        <!-- 题目编辑区域 -->
        <div class="question-edit-section">
          <div class="edit-header">
            <h4>编辑题目</h4>
            <div class="edit-actions">
              <el-button size="small" @click="resetQuestionContent">
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </div>
          </div>

          <!-- 题目基本信息 -->
          <!-- <div class="question-basic-info">
            <el-form ref="elForm" :model="localQuestion">
              <el-row :gutter="20">
                <el-col :span="4">
                  <el-form-item label="学科">
                    <el-select v-model="localQuestion.subject_name" placeholder="请选择学科" style="width: 100%" @change="handleQuestionSubjectChange">
                      <el-option-group label="初中科目">
                        <el-option label="初中数学" value="初中数学"></el-option>
                        <el-option label="初中科学" value="初中科学"></el-option>
                        <el-option label="初中语文" value="初中语文"></el-option>
                        <el-option label="初中英语" value="初中英语"></el-option>
                        <el-option label="初中历史" value="初中历史"></el-option>
                        <el-option label="初中政治" value="初中政治"></el-option>
                        <el-option label="初中地理" value="初中地理"></el-option>
                      </el-option-group>
                      <el-option-group label="高中科目">
                        <el-option label="高中物理" value="高中物理"></el-option>
                        <el-option label="高中数学" value="高中数学"></el-option>
                        <el-option label="高中化学" value="高中化学"></el-option>
                        <el-option label="高中生物" value="高中生物"></el-option>
                        <el-option label="高中语文" value="高中语文"></el-option>
                        <el-option label="高中英语" value="高中英语"></el-option>
                        <el-option label="高中通用" value="高中通用"></el-option>
                        <el-option label="高中历史" value="高中历史"></el-option>
                        <el-option label="高中政治" value="高中政治"></el-option>
                        <el-option label="高中地理" value="高中地理"></el-option>
                        <el-option label="高中信息" value="高中信息"></el-option>
                      </el-option-group>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="题型">
                    <el-select
                      v-model="localQuestion.qtype"
                      placeholder="请选择题型"
                      style="width: 100%"
                      :loading="questionTypesLoading"
                      @change="handleQuestionTypeChange"
                    >
                      <el-option
                        v-for="option in questionTypeOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="分数">
                    <el-input-number
                      v-model="localQuestion.score"
                      :min="0"
                      :max="100"
                      placeholder="请输入分数"
                      style="width: 100%"
                      @change="handleScoreChange"
                    ></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="试题来源">
                    <div class="label-input-container">
                      <el-input
                        v-model="localQuestion.label"
                        placeholder="请输入试题来源"
                        @change="handleLabelChange"
                        @input="handleLabelInput"
                        :class="{ 'label-error': isImageParseFailed(localQuestion.label) }"
                      ></el-input>
                      <div v-if="isImageParseFailed(localQuestion.label)" class="label-error-tip">
                        <i class="el-icon-warning"></i>
                        内容为"图片解析失败"，请修改试题来源
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div> -->

          <!-- 题目内容 -->
          <div class="question-content-section">
            <div class="field-header">
              <span class="field-label">题目</span>
              <el-button size="mini" type="primary" @click="openEditDialog('question')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="current-question-content">
                <div
                  class="content-preview"
                  v-html="getProcessedQuestionContent()"
                ></div>
              </div>
            </div>
          </div>

          <!-- 选项编辑（如果是选择题） -->
          <div class="options-section" v-if="isChoiceQuestion(localQuestion)">
            <div class="field-header">
              <span class="field-label">选项</span>
              <el-button size="mini" type="primary" @click="openEditDialog('options')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="options-preview">
                <div v-if="(localQuestion.Options && localQuestion.Options.length > 0) || (localQuestion.options && localQuestion.options.length > 0)">
                  <div v-for="(option, index) in (localQuestion.Options || localQuestion.options || [])" :key="index" class="option-item">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="option-content" v-html="getProcessedContent(option)"></span>
                  </div>
                </div>
                <div v-else class="no-options-tip">
                  <i class="el-icon-info"></i>
                  <span>暂无选项，请点击"修改/编辑"添加选项</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 答案编辑 -->
          <div class="answer-section">
            <div class="field-header">
              <span class="field-label">答案</span>
              <el-button size="mini" type="primary" @click="openEditDialog('answer')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="answer-display">
                <span v-if="getAnswerDisplayValue()" class="answer-tag correct">
                  <span v-html="getProcessedContent(getAnswerDisplayValue())"></span>
                </span>
                <div v-else-if="localQuestion.Method && localQuestion.CateName === '解答题'" class="answer-text">
                  <div v-html="getProcessedContent(extractAnswerFromMethod(localQuestion.Method))"></div>
                </div>
                <div v-else class="answer-empty">
                  答案为空
                </div>
              </div>
            </div>
          </div>

          <!-- 解析内容 -->
          <div class="analysis-content-section">
            <div class="field-header">
              <span class="field-label">解析</span>
              <el-button size="mini" type="primary" @click="openEditDialog('analysis')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="content-preview" v-html="getProcessedContent(localQuestion.Analyse || '解析内容为空')"></div>
            </div>
          </div>

          <!-- 方法内容 -->
          <div class="method-content-section">
            <div class="field-header">
              <span class="field-label">方法</span>
              <el-button size="mini" type="primary" @click="openEditDialog('method')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="content-preview" v-html="getProcessedContent(localQuestion.Method || '方法内容为空')"></div>
            </div>
          </div>

          <!-- 讨论内容 -->
          <!-- <div class="discuss-content-section">
            <div class="field-header">
              <span class="field-label">讨论</span>
              <el-button size="mini" type="primary" @click="openEditDialog('discuss')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="content-preview" v-html="getProcessedContent(localQuestion.Discuss || '讨论内容为空')"></div>
            </div>
          </div> -->
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-container">
        <i class="el-icon-warning"></i>
        <p>题目数据不存在</p>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          <i class="el-icon-check"></i>
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 内容编辑弹窗 - 移到外部避免嵌套问题 -->
    <ContentEditDialog
      :visible="editDialogVisible"
      :title="editDialogTitle"
      :content="editingContent"
      :placeholder="editPlaceholder"
      :edit-type="editDialogType"
      :question-data="localQuestion"
      @confirm="handleContentEditConfirm"
      @close="handleContentEditClose"
    />
  </div>
</template>

<script>
import ContentEditDialog from '@/components/Dialogs/ContentEditDialog'
import { marked } from 'marked'
import { getKnowledgePoints, updateQuestion } from '@/api/system/teachingMaterials'
import { getQuestionTypes as getQuestionTypesFromUtils, getQuestionTypeCode, formatQuestionTypeOptions } from "@/utils/questionTypeMappings"
import katex from 'katex'
import 'katex/dist/katex.min.css'

export default {
  name: 'QuestionEditDialog',
  components: {
    ContentEditDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    question: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    processQuestionContent: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      localQuestion: null,
      originalQuestion: null, // 保存原始题目数据，用于比较哪些字段被修改了

      // 题型选择相关
      questionTypesLoading: false,
      questionTypeOptions: [],

      // 知识点相关
      availableKnowledgePoints: [],
      knowledgePointsLoading: false,

      // 标签和话题
      availableTags: [],
      availableTopics: [],

      // 编辑弹窗相关
      editDialogVisible: false,
      editDialogType: '',
      editDialogTitle: '',
      editingContent: '',
      editPlaceholder: '',

      // 保存状态
      saving: false,

      // 科目代码映射字典
      SUBJECT_CODE_DICT: {
        "小学数学": "10",
        "小学语文": "11",
        "小学英语": "12",
        "小学科学": "14",
        "小学道德与法治": "15",
        "初中数学": "20",
        "初中物理": "21",
        "初中化学": "22",
        "初中生物": "23",
        "初中科学": "24",
        "初中地理": "25",
        "初中语文": "26",
        "初中英语": "27",
        "初中道德与法治": "28",
        "初中历史": "29",
        "高中数学": "30",
        "高中物理": "31",
        "高中化学": "32",
        "高中生物": "33",
        "高中地理": "35",
        "高中语文": "36",
        "高中英语": "37",
        "高中政治": "38",
        "高中历史": "39",
        "高中信息": "42",
        "高中通用": "43"
      }
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
        if (newVal && this.question) {
          this.initDialog()
        }
      },
      immediate: true
    },
    question: {
      handler(newVal) {
        if (newVal) {
          // 深拷贝保存原始数据和当前编辑数据
          this.originalQuestion = JSON.parse(JSON.stringify(newVal))
          this.localQuestion = JSON.parse(JSON.stringify(newVal))
        } else {
          this.originalQuestion = null
          this.localQuestion = null
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 初始化弹窗
    initDialog() {
      if (this.localQuestion && this.localQuestion.subject_name) {
        this.loadQuestionTypes(this.localQuestion.subject_name)
      } else {
        this.loadQuestionTypes()
      }
      this.initAvailableData()
    },

    // 加载题型列表
    async loadQuestionTypes(subjectName) {
      if (!subjectName) {
        this.questionTypeOptions = []
        return
      }

      try {
        this.questionTypesLoading = true
        const typeMapping = getQuestionTypesFromUtils(subjectName)
        if (typeMapping && Object.keys(typeMapping).length > 0) {
          this.questionTypeOptions = formatQuestionTypeOptions(subjectName)
        } else {
          this.questionTypeOptions = []
        }
      } catch (error) {
        console.error('加载题型列表失败:', error)
        this.questionTypeOptions = []
      } finally {
        this.questionTypesLoading = false
      }
    },

    // 初始化可用数据
    initAvailableData() {
      if (this.localQuestion) {
        this.availableKnowledgePoints = this.localQuestion.knowledge_points || []
        this.availableTags = this.localQuestion.tags || []
        this.availableTopics = this.localQuestion.topic || []
      }
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false
      this.$emit('close')
    },

    // 比较两个值是否相等（处理数组和对象）
    isValueEqual(val1, val2) {
      if (val1 === val2) return true
      if (val1 == null || val2 == null) return val1 === val2
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false
        return val1.every((item, index) => this.isValueEqual(item, val2[index]))
      }
      if (typeof val1 === 'object' && typeof val2 === 'object') {
        const keys1 = Object.keys(val1)
        const keys2 = Object.keys(val2)
        if (keys1.length !== keys2.length) return false
        return keys1.every(key => this.isValueEqual(val1[key], val2[key]))
      }
      return false
    },

    // 获取字段值（支持多个可能的字段名）
    getFieldValue(question, fieldNames) {
      for (const fieldName of fieldNames) {
        if (question[fieldName] !== undefined && question[fieldName] !== null) {
          return question[fieldName]
        }
      }
      return undefined
    },

    // 获取修改过的字段
    getChangedFields() {
      if (!this.localQuestion || !this.originalQuestion) {
        return {}
      }

      const changedFields = {}

      // 定义API需要的字段及其对应的本地字段名（按优先级排序）
      // 注意：Java接口接收的是小写字段名（如 displayanswer），Python后端会将其转换为大写存储
      const apiFields = {
        'Analyse': ['Analyse', 'analyse', 'analysis'],
        'Method': ['Method', 'method'],
        'source': ['source'],
        'label': ['label'],
        'question': ['Content', 'content', 'question'],
        'Score': ['Score', 'score'],
        'displayanswer': ['DisplayAnswer', 'displayanswer', 'answer', 'answers'], // Java接口需要小写
        'test_sid': ['test_sid', 'testSid', 'SID', 'sid', 'questionSid']
      }

      // 检查每个API字段
      Object.keys(apiFields).forEach(apiField => {
        const localFieldNames = apiFields[apiField]

        // 获取当前值和原始值
        const currentValue = this.getFieldValue(this.localQuestion, localFieldNames)
        const originalValue = this.getFieldValue(this.originalQuestion, localFieldNames)

        // 如果值存在且不同，则添加到changedFields
        if (currentValue !== undefined && !this.isValueEqual(currentValue, originalValue)) {
          // 特殊处理：question字段需要从Content/content/question获取
          if (apiField === 'question') {
            const questionContent = this.getFieldValue(this.localQuestion, ['Content', 'content', 'question'])
            if (questionContent) {
              changedFields[apiField] = questionContent
            }
          }
          // 特殊处理：displayanswer字段需要从DisplayAnswer/displayanswer获取（传给Java接口用小写）
          else if (apiField === 'displayanswer') {
            const answerContent = this.getFieldValue(this.localQuestion, ['DisplayAnswer', 'displayanswer'])
            if (answerContent) {
              changedFields[apiField] = answerContent
            }
          }
          // 其他字段直接使用当前值
          else {
            changedFields[apiField] = currentValue
          }
        }
      })

      return changedFields
    },

    // 保存题目
    async handleSave() {
      if (!this.localQuestion) {
        this.$message.warning('题目数据不存在')
        return
      }

      // 确保答案字段同步
      this.ensureAnswerSync(this.localQuestion)

      // 获取修改过的字段
      const changedFields = this.getChangedFields()

      // 如果没有修改任何字段，提示用户
      if (Object.keys(changedFields).length === 0) {
        this.$message.info('没有检测到任何修改')
        this.handleDialogClose()
        return
      }

      // 获取题目的 SID（用于更新）
      const questionSid = this.getFieldValue(this.localQuestion, ['test_sid', 'testSid', 'SID', 'sid', 'questionSid'])
      if (!questionSid) {
        this.$message.error('无法获取题目ID，无法保存')
        return
      }

      // 构建请求数据，只包含修改过的字段
      // 必须包含 test_sid 用于标识要更新的题目
      const updateData = {
        ...changedFields,
        test_sid: questionSid
      }

      // 如果 changedFields 中已经有 test_sid，使用 changedFields 中的值（覆盖）
      if (changedFields.test_sid) {
        updateData.test_sid = changedFields.test_sid
      }

      try {
        this.saving = true
        console.log('保存题目，修改的字段:', changedFields)
        console.log('发送到API的数据:', updateData)

        const response = await updateQuestion(updateData)

        console.log('API响应:', response)

        // code === 200 表示成功
        if (response && response.code === 200) {
          this.$message.success('题目保存成功')
          // 更新原始数据为当前数据，以便下次比较
          this.originalQuestion = JSON.parse(JSON.stringify(this.localQuestion))
          // 触发保存事件，传递修改后的题目
          this.$emit('save', this.localQuestion)
          this.handleDialogClose()
        } else {
          // 获取错误信息，优先使用服务器返回的错误信息
          let errorMsg = '保存失败'
          if (response) {
            errorMsg = response.msg || response.message || response.data?.msg || response.data?.message || '保存失败'
          }
          // 如果错误信息包含"未找到要更新的题目"，直接显示
          if (errorMsg && errorMsg.includes('未找到要更新的题目')) {
            this.$message.error(errorMsg)
          } else {
            this.$message.error(`保存失败: ${errorMsg}`)
          }
        }
      } catch (error) {
        console.error('保存题目失败:', error)
        // 处理网络错误或异常
        let errorMsg = '网络错误'
        if (error.response && error.response.data) {
          errorMsg = error.response.data.msg || error.response.data.message || error.message || '网络错误'
        } else if (error.message) {
          errorMsg = error.message
        }
        this.$message.error(`保存失败: ${errorMsg}`)
      } finally {
        this.saving = false
      }
    },

    // 处理题目学科变化
    handleQuestionSubjectChange(subjectName) {
      if (this.localQuestion) {
        const subjectCode = this.getSubjectCode(subjectName)
        this.localQuestion.subject_name = subjectName
        this.localQuestion.subject_code = subjectCode
        this.loadQuestionTypes(subjectName)
      }
    },

    // 处理题型变化
    handleQuestionTypeChange(value) {
      if (this.localQuestion) {
        this.localQuestion.qtype = value
        this.localQuestion.catename = value

        const subjectName = this.localQuestion.subject_name
        if (subjectName && subjectName !== '未指定科目') {
          const cateValue = getQuestionTypeCode(subjectName, value)
          if (cateValue > 0) {
            this.localQuestion.cate = cateValue
          } else {
            this.localQuestion.cate = 0
          }
        }
      }
    },

    // 处理分数变化
    handleScoreChange(value) {
      if (this.localQuestion) {
        this.localQuestion.score = value
        this.localQuestion.Score = value
      }
    },

    // 处理标签变化
    handleLabelChange(value) {
      if (this.localQuestion) {
        this.localQuestion.label = value
      }
    },

    // 处理标签实时输入变化
    handleLabelInput(value) {
      if (this.localQuestion) {
        this.localQuestion.label = value
      }
    },

    // 处理主题/话题变化
    handleTopicChange(selectedTopics) {
      if (this.localQuestion) {
        this.localQuestion.topic = selectedTopics
      }
    },

    // 处理难度系数变化
    handleDegreeChange(degree) {
      if (this.localQuestion) {
        this.localQuestion.degree = degree
      }
    },

    // 处理知识点变化
    handleKnowledgePointsChange(selectedPoints) {
      if (this.localQuestion) {
        this.localQuestion.knowledge_points = selectedPoints
      }
    },

    // 处理知识点下拉框焦点事件
    async handleKnowledgePointsFocus() {
      const subjectName = this.localQuestion?.subject_name
      if (subjectName && (subjectName.includes('英语') || subjectName.includes('语文'))) {
        await this.loadKnowledgePointsForSubject(subjectName)
      }
    },

    // 加载指定学科的知识点
    async loadKnowledgePointsForSubject(subjectName) {
      try {
        this.knowledgePointsLoading = true
        const response = await getKnowledgePoints(subjectName)
        if (response.code === 0 && response.data && Array.isArray(response.data)) {
          const knowledgePoints = response.data.map(item => {
            const pathParts = item.path.split('/')
            return pathParts[pathParts.length - 1] || item.path
          })
          const existingPoints = new Set(this.availableKnowledgePoints)
          knowledgePoints.forEach(point => {
            if (point && point.trim()) {
              existingPoints.add(point.trim())
            }
          })
          this.availableKnowledgePoints = Array.from(existingPoints)
        }
      } catch (error) {
        console.error('加载知识点失败:', error)
      } finally {
        this.knowledgePointsLoading = false
      }
    },

    // 处理标签变化
    handleTagsChange(value) {
      if (this.localQuestion) {
        this.localQuestion.tags = value
      }
    },

    // 格式化难度系数提示
    formatDegreeTooltip(value) {
      if (value <= 0.3) {
        return `困难 (${value})`
      } else if (value <= 0.7) {
        return `中等 (${value})`
      } else {
        return `简单 (${value})`
      }
    },

    // 打开编辑弹窗
    openEditDialog(type) {
      console.log('openEditDialog 被调用, type:', type)
      console.log('localQuestion:', this.localQuestion)

      if (!this.localQuestion) {
        this.$message.warning('题目数据不存在')
        return
      }

      let title = ''
      let content = ''
      let placeholder = ''

      switch (type) {
        case 'question':
          title = '编辑题目内容'
          // 优先使用 Content 字段（接口返回的字段，可能包含图片）
          content = this.localQuestion.Content || this.localQuestion.content || this.localQuestion.question || ''
          placeholder = '请输入题目内容...'
          break
        case 'options':
          title = '编辑选项'
          // 优先使用 Options 字段（接口返回的字段）
          const optionsArray = this.localQuestion.Options || this.localQuestion.options || []
          // 去掉选项中的 A.、B.、C.、D. 等前缀
          const cleanedOptions = optionsArray.map(opt => this.removeOptionPrefix(opt))
          content = Array.isArray(cleanedOptions) ? cleanedOptions.join('\n') : ''
          placeholder = '请输入选项，每行一个选项...'
          break
        case 'answer':
          title = '编辑答案'
          content = this.getAnswerContent()
          if (content === '答案为空') {
            content = ''
          }
          placeholder = '请输入答案'
          break
        case 'analysis':
          title = '编辑解析'
          content = this.localQuestion.Analyse || ''
          placeholder = '请输入解析内容...'
          break
        case 'method':
          title = '编辑方法'
          content = this.localQuestion.Method || ''
          placeholder = '请输入方法内容...'
          break
        case 'discuss':
          title = '编辑讨论'
          content = this.localQuestion.Discuss || ''
          placeholder = '请输入讨论内容...'
          break
        default:
          this.$message.error('未知的编辑类型')
          return
      }

      console.log('设置弹窗数据:', { title, content, placeholder, type })

      // 使用 $set 确保响应式更新
      this.$set(this, 'editDialogType', type)
      this.$set(this, 'editDialogTitle', title)
      this.$set(this, 'editingContent', content)
      this.$set(this, 'editPlaceholder', placeholder)
      this.$set(this, 'editDialogVisible', true)

      console.log('editDialogVisible 已设置为:', this.editDialogVisible)
      console.log('所有弹窗相关数据:', {
        editDialogVisible: this.editDialogVisible,
        editDialogTitle: this.editDialogTitle,
        editingContent: this.editingContent,
        editDialogType: this.editDialogType,
        editPlaceholder: this.editPlaceholder,
        localQuestion: this.localQuestion
      })

      // 强制更新视图
      this.$forceUpdate()

      // 确保在下一个tick后设置，以便Vue能够正确响应
      this.$nextTick(() => {
        console.log('编辑弹窗状态 (nextTick):', {
          editDialogVisible: this.editDialogVisible,
          editDialogTitle: this.editDialogTitle,
          editingContent: this.editingContent,
          editDialogType: this.editDialogType
        })

        // 再次检查并强制更新
        if (!this.editDialogVisible) {
          console.warn('editDialogVisible 在 nextTick 中为 false，重新设置')
          this.$set(this, 'editDialogVisible', true)
          this.$forceUpdate()
        }
      })
    },

    // 处理内容编辑确认
    handleContentEditConfirm(data) {
      if (!this.localQuestion) {
        return
      }

      const content = data.content

      switch (this.editDialogType) {
        case 'question':
          // 同时设置 Content、content 和 question（保持兼容性）
          this.localQuestion.Content = content
          this.localQuestion.content = content
          this.localQuestion.question = content
          break
        case 'options':
          // 同时设置 Options 和 options（保持兼容性）
          // 去掉选项中的 A.、B.、C.、D. 等前缀
          const optionsArray = content.split('\n')
            .filter(opt => opt.trim())
            .map(opt => this.removeOptionPrefix(opt.trim()))
          this.$set(this.localQuestion, 'Options', optionsArray)
          this.$set(this.localQuestion, 'options', optionsArray)
          break
        case 'answer':
          // 同时设置 DisplayAnswer 和 displayanswer（保持兼容性）
          this.localQuestion.DisplayAnswer = content
          this.localQuestion.displayanswer = content
          if (content.includes(',')) {
            this.localQuestion.answers = content.split(',').map(ans => ans.trim()).filter(ans => ans)
          } else {
            this.localQuestion.answers = [content]
          }
          break
        case 'analysis':
          this.localQuestion.Analyse = content
          break
        case 'method':
          this.localQuestion.Method = content
          break
        case 'discuss':
          this.localQuestion.Discuss = content
          break
      }

      this.$message.success('内容保存成功')
      this.$forceUpdate()
    },

    // 处理内容编辑关闭
    handleContentEditClose() {
      this.editDialogVisible = false
      this.editDialogType = ''
      this.editDialogTitle = ''
      this.editingContent = ''
      this.editPlaceholder = ''
    },

    // 重置题目内容
    resetQuestionContent() {
      this.$confirm('确定要重置当前题目的内容吗？', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.question) {
          this.localQuestion = JSON.parse(JSON.stringify(this.question))
        }
        this.$message.success('题目内容已重置')
      }).catch(() => {
        this.$message.info('已取消重置')
      })
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

    // 获取答案显示值（与查看解析的逻辑一致，用于显示）
    getAnswerDisplayValue() {
      if (!this.localQuestion) {
        return ''
      }

      // 优先使用 DisplayAnswer 字段（接口返回的字段）
      if (this.localQuestion.DisplayAnswer && this.localQuestion.DisplayAnswer.trim()) {
        return this.localQuestion.DisplayAnswer.trim()
      } else if (this.localQuestion.displayanswer && this.localQuestion.displayanswer.trim()) {
        return this.localQuestion.displayanswer.trim()
      }

      return ''
    },

    // 获取答案内容（用于编辑，包含所有可能的字段）
    getAnswerContent() {
      if (!this.localQuestion) {
        return '答案为空'
      }

      let answerContent = ''

      // 优先使用 DisplayAnswer 字段（接口返回的字段）
      if (this.localQuestion.DisplayAnswer && this.localQuestion.DisplayAnswer.trim()) {
        answerContent = this.localQuestion.DisplayAnswer.trim()
      } else if (this.localQuestion.displayanswer && this.localQuestion.displayanswer.trim()) {
        answerContent = this.localQuestion.displayanswer.trim()
      }
      // 如果还是没有，尝试使用 answers 数组
      else if (this.localQuestion.answers && this.localQuestion.answers.length > 0) {
        answerContent = this.localQuestion.answers.join(', ')
      } else if (this.localQuestion.answer && this.localQuestion.answer.trim()) {
        answerContent = this.localQuestion.answer.trim()
      }

      return answerContent || '答案为空'
    },

    // 从解析中提取答案部分（与查看解析的逻辑一致）
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

    // 解码HTML实体
    decodeHtmlEntities(text) {
      if (!text) return ''
      const textarea = document.createElement('textarea')
      textarea.innerHTML = text
      return textarea.value
    },

    // 获取处理后的题目内容（优先使用Content字段，支持图片）
    getProcessedQuestionContent() {
      if (!this.localQuestion) {
        return '题目内容为空'
      }

      // 优先使用 Content 字段（可能包含图片数据）
      let content = this.localQuestion.Content || this.localQuestion.content || this.localQuestion.question || ''

      if (!content) {
        return '题目内容为空'
      }

      // 如果有 processQuestionContent 方法，使用它处理（支持图片、数学公式等）
      if (this.processQuestionContent && typeof this.processQuestionContent === 'function') {
        return this.processQuestionContent(content)
      }

      // 否则使用 renderMarkdown 处理
      return this.renderMarkdown(content)
    },

    // 通用的内容处理方法（用于选项、答案、解析等）
    getProcessedContent(content) {
      if (!content || content === '答案为空' || content === '解析内容为空' || content === '方法内容为空' || content === '讨论内容为空') {
        return content || ''
      }

      // 如果有 processQuestionContent 方法，使用它处理（支持图片、数学公式等）
      if (this.processQuestionContent && typeof this.processQuestionContent === 'function') {
        return this.processQuestionContent(content)
      }

      // 否则使用 renderMarkdown 处理
      return this.renderMarkdown(content)
    },

    // 检查label是否为图片解析失败
    isImageParseFailed(label) {
      if (!label || typeof label !== 'string') {
        return false
      }

      const failedKeywords = [
        '图片解析失败',
        '图片解析错误',
        '图片处理失败',
        '图片处理错误',
        'image parse failed',
        'image processing failed',
        '图片无法解析',
        '图片识别失败'
      ]

      return failedKeywords.some(keyword =>
        label.toLowerCase().includes(keyword.toLowerCase())
      )
    },

    // 判断是否是选择题
    isChoiceQuestion(question) {
      if (!question) return false
      const choiceTypes = ['选择题', '多选题', '单选题', '多选题', '不定项选择题']
      return choiceTypes.includes(question.qtype) ||
        (question.Options && question.Options.length > 0) ||
        (question.options && question.options.length > 0)
    },

    // 根据科目名称获取科目代码
    getSubjectCode(subjectName) {
      if (!subjectName || typeof subjectName !== 'string') {
        return ''
      }
      return this.SUBJECT_CODE_DICT[subjectName] || ''
    },

    // 去掉选项前缀（A.、A、B.、B、 等）
    removeOptionPrefix(option) {
      if (!option || typeof option !== 'string') {
        return option || ''
      }

      // 去掉首尾空格
      let cleanedOption = option.trim()

      const prefixPattern1 = /^[A-Z]\.\s*/  // A. 格式
      const prefixPattern2 = /^[A-Z]、\s*/  // A、格式

      // 如果匹配到前缀，去掉它
      if (prefixPattern1.test(cleanedOption)) {
        cleanedOption = cleanedOption.replace(prefixPattern1, '').trim()
      } else if (prefixPattern2.test(cleanedOption)) {
        cleanedOption = cleanedOption.replace(prefixPattern2, '').trim()
      }

      return cleanedOption
    },

    // 确保答案字段同步
    ensureAnswerSync(question) {
      if (!question) return

      // 优先使用 DisplayAnswer 字段（接口返回的字段）
      let displayAnswer = question.DisplayAnswer || question.displayanswer || ''

      if (displayAnswer && displayAnswer.trim()) {
        // 同步到 displayanswer（保持兼容性）
        question.displayanswer = displayAnswer.trim()
        question.DisplayAnswer = displayAnswer.trim()

        // 如果 answers 为空，从 DisplayAnswer 生成 answers
        if (!question.answers || question.answers.length === 0) {
          if (displayAnswer.includes(',')) {
            question.answers = displayAnswer.split(',').map(ans => ans.trim()).filter(ans => ans)
          } else {
            question.answers = [displayAnswer.trim()]
          }
        }
      } else if (question.answers && question.answers.length > 0) {
        // 如果 answers 有值但 DisplayAnswer 为空，同步到 DisplayAnswer 和 displayanswer
        const answerStr = question.answers.join(', ')
        if (!question.DisplayAnswer || !question.DisplayAnswer.trim()) {
          question.DisplayAnswer = answerStr
        }
        if (!question.displayanswer || !question.displayanswer.trim()) {
          question.displayanswer = answerStr
        }
      }

      // 递归处理子题
      if (question.children && Array.isArray(question.children)) {
        question.children.forEach(subQuestion => {
          this.ensureAnswerSync(subQuestion)
        })
      }
    }
  }
}
</script>

<style scoped>
/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 300px;
}

.loading-container i {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 15px;
  animation: rotate 1s linear infinite;
}

.loading-container p {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 300px;
}

.empty-container i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 15px;
}

.empty-container p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

/* 题目编辑容器样式 */
.question-edit-container {
  padding: 0;
}

.question-edit-section {
  padding: 20px;
  overflow-y: auto;
  max-height: 70vh;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.edit-header h4 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.question-basic-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.question-content-section,
.analysis-content-section,
.method-content-section,
.discuss-content-section,
.knowledge-points-section,
.tags-section,
.options-section,
.answer-section,
.topic-section,
.degree-section {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
}

.field-label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.field-content {
  padding: 20px;
}

.content-preview {
  min-height: 60px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  line-height: 1.6;
  color: #606266;
}

.content-preview:empty::before {
  content: "内容为空";
  color: #c0c4cc;
  font-style: italic;
}

.options-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  align-items: center;
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  margin-right: 10px;
  min-width: 20px;
}

.option-content {
  flex: 1;
  color: #606266;
  line-height: 1.5;
}

/* 无选项提示样式 */
.no-options-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  color: #909399;
  font-size: 14px;
  text-align: center;
  justify-content: center;
}

.no-options-tip i {
  font-size: 16px;
  color: #409eff;
}

/* 标签输入容器样式 */
.label-input-container {
  width: 100%;
}

.label-input-container .el-input {
  width: 100%;
}

.label-input-container .el-input.is-focus .el-input__inner {
  border-color: #409eff;
}

/* 标签错误样式 */
.label-error .el-input__inner {
  border-color: #f56c6c !important;
  background-color: #fef0f0;
}

.label-error .el-input__inner:focus {
  border-color: #f56c6c !important;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

/* 标签错误提示样式 */
.label-error-tip {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  font-size: 12px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.label-error-tip i {
  font-size: 14px;
}

/* 难度系数提示样式 */
.degree-tips {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.degree-tips .tip-item {
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 答案显示样式（与查看解析一致） */
.answer-display {
  margin-top: 10px;
}

.answer-tag {
  display: inline-block;
  color: black;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
  font-size: 12px;
}

.answer-tag.correct {
  font-weight: bold;
}

.answer-text {
  background: #f0f9ff;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
  margin-top: 10px;
  line-height: 1.6;
  color: #606266;
}

.answer-empty {
  color: #909399;
  font-style: italic;
  padding: 10px;
  text-align: center;
}

/* 滚动条样式 */
.question-edit-section::-webkit-scrollbar {
  width: 6px;
}

.question-edit-section::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.question-edit-section::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 图片样式 */
.content-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

/* KaTeX数学公式样式 */
.content-preview .katex {
  font-size: 1.1em;
  line-height: 1.2;
}

.content-preview .katex-display {
  margin: 1em 0;
  text-align: center;
  padding: 0.5em 0;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.content-preview .katex-display .katex {
  font-size: 1.2em;
}

.content-preview .math-error {
  color: #f56c6c;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  display: inline-block;
  margin: 0 2px;
}

.content-preview .math-error:hover {
  background: #fde2e2;
}

/* 行内数学公式样式 */
.content-preview .katex-inline {
  display: inline;
  margin: 0 2px;
}

/* 块级数学公式样式 */
.content-preview .katex-block {
  display: block;
  margin: 15px 0;
  text-align: center;
}

/* 数学公式容器样式 */
.content-preview .math-container {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.content-preview .math-container .katex-display {
  margin: 0;
  background: transparent;
  border: none;
  padding: 0;
}

/* 数学公式在表格中的样式 */
.content-preview table .katex {
  font-size: 0.9em;
}

.content-preview table .katex-display {
  margin: 0.5em 0;
  padding: 0.3em 0;
}

/* 选项预览中的数学公式样式 */
.option-content .katex {
  font-size: 1em;
  line-height: 1.3;
}

.option-content .katex-display {
  margin: 0.5em 0;
  padding: 0.3em 0;
  background: #f0f2f5;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

/* Markdown预览样式 */
.content-preview h1,
.content-preview h2,
.content-preview h3,
.content-preview h4,
.content-preview h5,
.content-preview h6 {
  margin: 20px 0 10px 0;
  color: #303133;
}

.content-preview p {
  margin: 10px 0;
}

.content-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.content-preview table th,
.content-preview table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.content-preview table th {
  background-color: #f5f5f5;
}

.content-preview code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.content-preview pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.content-preview blockquote {
  border-left: 4px solid #409eff;
  margin: 10px 0;
  padding-left: 15px;
  color: #606266;
}
</style>
