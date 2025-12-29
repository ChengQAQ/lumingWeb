<template>
  <el-dialog
    title="预览"
    :visible.sync="dialogVisible"
    width="80%"
    :before-close="handleClose"
    class="preview-dialog"
    style="overflow: visible;min-width:1500px;"
    :modal="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="preview-dialog-content">
      <div class="preview-header-info">
        <div class="preview-header-main">
          <div class="preview-title">
            <!-- <span class="label">类型：</span> -->
            <div class="preview-type-tabs">
              <span
                class="preview-type-tab"
                :class="{ 'active': previewCreationMode === 'homework' }"
                @click="handleCreationModeChange('homework')"
              >
                作业
              </span>
              <span
                class="preview-type-tab"
                :class="{ 'active': previewCreationMode === 'paper' }"
                @click="handleCreationModeChange('paper')"
              >
                组卷
              </span>
            </div>
          </div>
          <div class="preview-subject">
            <el-select
              v-model="localSelectedSubject"
              placeholder="选择科目"
              filterable
              size="medium"
              style="width: 200px;"
              @change="handleSubjectChange"
              :loading="subjectLoading"
            >
              <el-option
                v-for="subjectItem in subjectList"
                :key="subjectItem.subjectId || subjectItem.id"
                :label="subjectItem.subjectName || subjectItem.name"
                :value="subjectItem.subjectName || subjectItem.name"
              >
              </el-option>
            </el-select>
          </div>
          <div class="preview-name">
            <el-input
              :value="previewCustomPaperName"
              @input="handleNameChange"
              placeholder="请输入任务名称"
              size="medium"
              style="width: 200px;border: 1px solid #409eff; border-radius: 5px;"
              maxlength="100"
            ></el-input>
          </div>
          <div class="preview-count">
            <span class="count-value">共{{ localQuestions ? localQuestions.length : 0 }}题</span>
          </div>
        </div>
        <div class="preview-actions">
          <el-button
            type="primary"
            size="medium"
            @click="handleConfirm"
            :loading="creating"
          >
            {{ creating ? '创建中...' : (previewCreationMode === 'homework' ? '创建作业' : '创建组卷') }}
          </el-button>
        </div>
      </div>

      <!-- 左右分布布局 -->
      <div class="preview-content-wrapper">
        <!-- 左侧：题目列表（可拖拽排序） -->
        <div class="preview-left-panel">
          <div class="preview-left-header">
            <span class="panel-title">题目列表（可拖拽调整顺序）</span>
            <span class="question-count">共{{ localQuestions ? localQuestions.length : 0 }}题</span>
          </div>
          <div class="preview-questions-list">
            <draggable
              :list="localQuestions"
              :animation="200"
              ghost-class="ghost-question"
              chosen-class="chosen-question"
              @end="onPreviewDragEnd"
            >
              <div
                v-for="(question, index) in (localQuestions || [])"
                :key="question.sid || question.SID || question.questionSid || index"
                class="preview-question-list-item"
                :class="{ 'active': previewCurrentQuestionIndex === index }"
                @click="selectPreviewQuestion(index)"
              >
                <div class="question-item-content">
                  <div class="question-item-main">
                    <div class="question-item-header">
                      <span class="question-item-number">第{{ index + 1 }}题</span>
                      <div class="question-item-meta">
                        <span class="question-item-type">{{ getQuestionType(question) }}</span>
                        <span class="question-item-difficulty">{{ getQuestionDifficulty(question) }}</span>
                      </div>
                    </div>
                    <div class="question-item-preview" v-html="getQuestionPreview(question)"></div>
                  </div>
                </div>
                <div class="question-item-actions">
                  <el-button
                    type="text"
                    icon="el-icon-delete"
                    size="small"
                    class="delete-question-btn"
                    @click.stop="removeQuestion(index)"
                    title="删除题目"
                  ></el-button>
                </div>
              </div>
            </draggable>
          </div>
        </div>

        <!-- 右侧：所有题目预览 -->
        <div class="preview-right-panel">
          <div class="preview-right-header">
            <span class="panel-title">题目预览</span>
            <span class="question-count">共{{ localQuestions ? localQuestions.length : 0 }}题</span>
          </div>
          <div class="preview-all-questions">
            <div
              v-for="(question, index) in (localQuestions || [])"
              :key="question.sid || question.SID || question.questionSid || index"
              class="preview-question-item"
              :class="{ 'active': previewCurrentQuestionIndex === index }"
              @click="selectPreviewQuestion(index)"
            >
              <div class="question-header">
                <span class="question-number">第{{ index + 1 }}题</span>
                <div class="question-meta">
                  <span class="question-type">{{ getQuestionType(question) }}</span>
                  <span class="question-difficulty">难度: {{ getQuestionDifficulty(question) }}</span>
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="showQuestionAnalysis(question, index)"
                    class="view-detail-btn"
                  >
                    查看详情
                  </el-button>
                  <el-button
                    type="text"
                    icon="el-icon-delete"
                    size="small"
                    class="delete-question-btn-right"
                    @click.stop="removeQuestion(index)"
                    title="删除题目"
                  ></el-button>
                </div>
              </div>
              <div class="question-content">
                <div class="question-text" v-html="processQuestionContent(question.question || question.Content || question.content || '')"></div>
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

                <!-- 子题目 -->
                <div v-if="question.children && parseChildren(question.children).length > 0" class="sub-questions">
                  <div
                    v-for="(subQuestion, subIndex) in parseChildren(question.children)"
                    :key="subIndex"
                    class="sub-question-item"
                  >
                    <div class="sub-question-header">
                      <span class="sub-question-number">（{{ subIndex + 1 }}）</span>
                      <span class="sub-question-type">{{ subQuestion.catename || subQuestion.qtype || subQuestion.CateName || '子题' }}</span>
                    </div>
                    <div class="sub-question-content" v-html="processQuestionContent(subQuestion.content || subQuestion.question || subQuestion.Content)"></div>

                    <!-- 子题目的选项 -->
                    <div class="sub-question-options" v-if="subQuestion.options || subQuestion.Options">
                      <div
                        v-for="(option, optionIndex) in parseOptions(subQuestion.options || subQuestion.Options)"
                        :key="optionIndex"
                        class="option-item"
                      >
                        <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                        <span class="option-content" v-html="processQuestionContent(removeOptionPrefix(option, optionIndex))"></span>
                      </div>
                    </div>

                    <!-- 子题目的答案 -->
                    <div class="sub-question-answer" v-if="subQuestion.answer || subQuestion.Answer || subQuestion.DisplayAnswer">
                      <div class="answer-label">答案：</div>
                      <div class="answer-content" v-html="processQuestionContent(subQuestion.answer || subQuestion.Answer || subQuestion.DisplayAnswer)"></div>
                    </div>

                    <!-- 子题目的解析 -->
                    <div class="sub-question-analysis" v-if="subQuestion.analysis || subQuestion.analyse || subQuestion.Method || subQuestion.Analyse">
                      <div class="analysis-label">解析：</div>
                      <div class="analysis-content" v-html="processQuestionContent(subQuestion.analysis || subQuestion.analyse || subQuestion.Method || subQuestion.Analyse)"></div>
                    </div>
                  </div>
                </div>

                <div class="question-answer" v-if="question.answer">
                  <div class="answer-label">答案：</div>
                  <div class="answer-content" v-html="processQuestionContent(question.answer)"></div>
                </div>
                <div class="question-analysis" v-if="question.analysis || question.analyse">
                  <div class="analysis-label">解析：</div>
                  <div class="analysis-content" v-html="processQuestionContent(question.analysis || question.analyse)"></div>
                </div>
              </div>
            </div>
            <div v-if="!localQuestions || localQuestions.length === 0" class="no-questions-hint">
              <i class="el-icon-info"></i>
              <span>暂无题目</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 解析弹窗 -->
    <QuestionAnalysisDialog
      :visible.sync="analysisVisible"
      :current-question="currentQuestion"
      :question-detail="questionDetail"
      :loading-detail="loadingDetail"
      :process-question-content="processQuestionContent"
      @close="closeAnalysis"
    />
  </el-dialog>
</template>

<script>
import { getQuestionDetail } from "@/api/system/paper"
import { addTable } from "@/api/system/table"
import { addPaper } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import draggable from 'vuedraggable'
import latexRenderer from '@/utils/latexRenderer'
import QuestionAnalysisDialog from '@/components/PaperBuilder/QuestionAnalysisDialog.vue'

export default {
  name: "PreviewDialog",
  components: {
    draggable,
    QuestionAnalysisDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedQuestions: {
      type: Array,
      default: () => []
    },
    previewCreationMode: {
      type: String,
      default: 'homework'
    },
    previewCustomPaperName: {
      type: String,
      default: ''
    },
    subject: {
      type: String,
      default: ''
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    teacherSubjectName: {
      type: String,
      default: ''
    },
    selectedSubject: {
      type: String,
      default: ''
    },
    getSubjectFromChapter: {
      type: Function,
      default: () => ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      localQuestions: [],
      previewCurrentQuestionIndex: 0,
      // 解析弹窗
      analysisVisible: false,
      currentQuestion: null,
      questionDetail: null,
      loadingDetail: false,
      // 科目相关
      localSelectedSubject: '',
      subjectList: [],
      subjectLoading: false,
      // 创建作业/组卷加载状态
      creating: false
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
      if (newVal) {
        // 初始化选中第一个题目
        this.previewCurrentQuestionIndex = 0
        // 复制题目列表到本地，避免直接修改 props
        this.localQuestions = JSON.parse(JSON.stringify(this.selectedQuestions))
        // 初始化科目选择
        this.initSubject()
        // 加载科目列表
        this.loadSubjectList()
        // 如果任务名称为空，自动生成
        if (!this.previewCustomPaperName || !this.previewCustomPaperName.trim()) {
          this.generateTaskName()
        }
        // 自动加载所有题目的详情
        this.$nextTick(() => {
          this.loadAllQuestionsDetail()
        })
      }
    },
    dialogVisible(newVal) {
      this.$emit('update:visible', newVal)
      if (!newVal) {
        this.$emit('close')
      }
    },
    selectedQuestions: {
      handler(newVal) {
        if (this.dialogVisible) {
          this.localQuestions = JSON.parse(JSON.stringify(newVal))
        }
      },
      deep: true
    },
    // 监听任务类型变化，自动更新任务名称
    previewCreationMode: {
      handler(newVal, oldVal) {
        if (this.dialogVisible) {
          if (!this.previewCustomPaperName || !this.previewCustomPaperName.trim()) {
            // 如果任务名称为空，重新生成
            this.generateTaskName()
          } else if (oldVal && this.previewCustomPaperName) {
            // 如果任务名称已存在，检查是否是自动生成的格式，如果是则更新
            const taskType = newVal === 'homework' ? '作业' : '组卷'
            const oldTaskType = oldVal === 'homework' ? '作业' : '组卷'
            // 如果任务名称以旧的任务类型结尾，则更新为新的任务类型
            if (this.previewCustomPaperName.endsWith(oldTaskType)) {
              const baseName = this.previewCustomPaperName.slice(0, -oldTaskType.length)
              this.$emit('update:previewCustomPaperName', baseName + taskType)
            }
          }
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    handleCreationModeChange(value) {
      this.$emit('update:previewCreationMode', value)
      // 切换任务类型时，如果任务名称为空或使用默认格式，则重新生成
      if (!this.previewCustomPaperName || !this.previewCustomPaperName.trim()) {
        this.generateTaskName()
      }
    },
    // 初始化科目选择
    initSubject() {
      // 优先使用本地选中的科目
      if (this.localSelectedSubject) {
        // 确保 localSelectedSubject 是单个科目名称，而不是多个科目拼接的字符串
        if (this.localSelectedSubject && typeof this.localSelectedSubject === 'string' && this.localSelectedSubject.includes(',')) {
          this.localSelectedSubject = this.localSelectedSubject.split(',')[0].trim()
        }
        return
      }
      // 使用传入的科目
      let subjectName = this.subject || this.selectedSubject || ''
      // 如果没有科目，尝试使用教师科目
      if (!subjectName && !this.isAdmin && this.teacherSubjectName) {
        subjectName = this.teacherSubjectName
      }
      // 确保 subjectName 是单个科目名称，而不是多个科目拼接的字符串
      if (subjectName && typeof subjectName === 'string' && subjectName.includes(',')) {
        subjectName = subjectName.split(',')[0].trim()
      }
      this.localSelectedSubject = subjectName
    },

    // 加载科目列表
    loadSubjectList() {
      if (this.subjectList.length > 0) {
        return
      }
      if (this.subjectLoading) return
      this.subjectLoading = true
      listSubject().then(response => {
        if (response && response.code === 200) {
          const options = response.rows || response.data || []
          this.subjectList = Array.isArray(options) ? options : []
        } else {
          this.subjectList = []
        }
        this.subjectLoading = false
      }).catch(error => {
        console.error('获取科目列表失败:', error)
        this.subjectList = []
        this.subjectLoading = false
      })
    },

    // 处理科目变化
    handleSubjectChange(subjectName) {
      this.localSelectedSubject = subjectName
      // 如果任务名称为空或使用默认格式，重新生成
      if (!this.previewCustomPaperName || !this.previewCustomPaperName.trim()) {
        this.generateTaskName()
      } else {
        // 如果任务名称已存在，检查是否是自动生成的格式，如果是则更新科目部分
        const taskType = this.previewCreationMode === 'homework' ? '作业' : '组卷'
        if (this.previewCustomPaperName.endsWith(taskType)) {
          const dateStr = this.previewCustomPaperName.match(/\d{2}\.\d{2}/)
          if (dateStr) {
            this.$emit('update:previewCustomPaperName', `${subjectName || ''}${dateStr[0]}${taskType}`)
          }
        }
      }
    },

    // 生成任务名称：科目+时间+任务类型
    generateTaskName() {
      // 获取科目，优先使用本地选中的科目
      let subjectName = this.localSelectedSubject || this.subject || this.selectedSubject || ''

      // 如果没有科目，尝试使用教师科目
      if (!subjectName && !this.isAdmin && this.teacherSubjectName) {
        subjectName = this.teacherSubjectName
      }

      // 获取当前日期，格式为 MM.DD
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const dateStr = `${month}.${day}`

      // 获取任务类型
      const taskType = this.previewCreationMode === 'homework' ? '作业' : '组卷'

      // 生成任务名称
      let taskName = ''
      if (subjectName) {
        taskName = `${subjectName}${dateStr}${taskType}`
      } else {
        taskName = `${dateStr}${taskType}`
      }

      // 更新任务名称
      this.$emit('update:previewCustomPaperName', taskName)
    },
    handleNameChange(value) {
      this.$emit('update:previewCustomPaperName', value)
    },
    handleConfirm() {
      // 验证任务名称
      if (!this.previewCustomPaperName || !this.previewCustomPaperName.trim()) {
        this.$message.warning('请输入任务名称')
        return
      }
      // 验证科目
      if (!this.localSelectedSubject) {
        this.$message.warning('请选择科目')
        return
      }
      // 验证题目
      if (!this.localQuestions || this.localQuestions.length === 0) {
        this.$message.warning('请至少选择一道题目')
        return
      }

      // 构建提交数据
      const questionIds = this.localQuestions.map(q => {
        // 获取题目ID，支持多种字段名
        return q.sid || q.SID || q.questionSid || ''
      }).filter(id => id).join(',')

      if (!questionIds) {
        this.$message.warning('题目ID获取失败，请检查题目数据')
        return
      }

      // 获取科目值：使用用户选中的科目
      let subjectValue = this.localSelectedSubject || ''
      if (!subjectValue) {
        // 如果没有选中科目，使用传入的默认值
        subjectValue = this.subject || this.selectedSubject || this.teacherSubjectName || ''
      }

      // 确保 subjectValue 是单个科目名称，而不是多个科目拼接的字符串
      // 如果包含逗号，说明可能是多个科目拼接的，只取第一个
      if (subjectValue && typeof subjectValue === 'string' && subjectValue.includes(',')) {
        subjectValue = subjectValue.split(',')[0].trim()
      }

      const submitData = {
        customPaperName: this.previewCustomPaperName.trim(),
        questionIds: questionIds,
        knowledgePointIds: '', // 知识点ID，可以为空
        subject: subjectValue
      }

      // 设置加载状态
      this.creating = true

      // 根据创建模式调用不同的API
      const apiMethod = this.previewCreationMode === 'homework' ? addTable : addPaper
      const successMessage = this.previewCreationMode === 'homework' ? '作业创建成功' : '组卷创建成功'

      apiMethod(submitData).then(response => {
        if (response && (response.code === 200 || response.status === 200 || response.success)) {
          this.$message.success(successMessage)
          // 同步题目顺序到父组件
          this.$emit('update:selectedQuestions', this.localQuestions)
          // 触发 confirm 事件，传递数据给父组件
          this.$emit('confirm', {
            creationMode: this.previewCreationMode,
            customPaperName: this.previewCustomPaperName.trim(),
            questions: this.localQuestions,
            subject: this.localSelectedSubject
          })
          // 关闭弹窗
          this.dialogVisible = false
        } else {
          this.$message.error((this.previewCreationMode === 'homework' ? '作业' : '组卷') + '创建失败：' + (response.msg || '未知错误'))
        }
      }).catch(error => {
        console.error('创建失败:', error)
        this.$message.error((this.previewCreationMode === 'homework' ? '作业' : '组卷') + '创建失败：' + (error.message || '网络错误'))
      }).finally(() => {
        this.creating = false
      })
    },
    // 加载所有题目的详情
    loadAllQuestionsDetail() {
      if (!this.localQuestions || this.localQuestions.length === 0) {
        return
      }

      // 优先使用本地选中的科目作为 subject_name
      let subjectName = this.localSelectedSubject || this.selectedSubject || ''

      // 如果没有选择科目，尝试使用教师科目
      if (!subjectName && !this.isAdmin && this.teacherSubjectName) {
        subjectName = this.teacherSubjectName
      }

      // 收集所有需要加载详情的题目ID
      const questionIds = []
      const questionsToLoad = []

      this.localQuestions.forEach((question, index) => {
        // 如果题目还没有详情数据，需要加载
        if (!question.answer && !question.analysis && !question.analyse) {
          // 获取题目ID，支持多种字段名
          const questionId = question.sid || question.SID || question.questionSid
          if (questionId) {
            questionIds.push(questionId)
            questionsToLoad.push({ question, index })
          } else {
            console.warn('题目缺少ID字段:', question)
          }
        }
      })

      // 如果没有需要加载的题目，直接返回
      if (questionIds.length === 0) {
        return
      }

      // 批量加载题目详情
      if (subjectName) {
        const requestData = {
          subject_name: subjectName,
          sids: questionIds
        }

        getQuestionDetail(requestData).then(res => {
          let details = []
          if (res && res.questions && Array.isArray(res.questions)) {
            details = res.questions
          } else if (res && res.code === 200 && res.data) {
            details = Array.isArray(res.data) ? res.data : [res.data]
          }

          // 将详情数据合并到对应的题目对象中
          if (details && details.length > 0) {
            const detailMap = {}
            details.forEach(detail => {
              // 支持多种ID字段名
              const detailId = detail.sid || detail.SID || detail.questionSid
              if (detailId) {
                detailMap[detailId] = detail
              }
            })

            questionsToLoad.forEach(({ question, index }) => {
              // 获取题目ID，支持多种字段名
              const questionId = question.sid || question.SID || question.questionSid
              const detail = detailMap[questionId]
              if (detail) {
                // 合并详情数据，保留原有的children结构
                const existingChildren = question.children
                // 使用 Vue.set 确保响应式更新
                Object.keys(detail).forEach(key => {
                  this.$set(question, key, detail[key])
                })
                // 如果详情中有children数据，使用详情中的；否则保留原有的
                if (detail.children || detail.Children) {
                  this.$set(question, 'children', detail.children || detail.Children)
                } else if (existingChildren) {
                  this.$set(question, 'children', existingChildren)
                }
                // 确保 question 字段存在（用于预览显示）
                if (!question.question && detail.Content) {
                  this.$set(question, 'question', detail.Content)
                }
                // 确保 options 字段存在
                if (!question.options && detail.Options) {
                  this.$set(question, 'options', detail.Options)
                }
              }
            })
            // 强制更新视图
            this.$forceUpdate()
          }
        }).catch(error => {
          console.error('批量加载题目详情失败:', error)
        })
      }
    },
    // 选择预览题目（用于高亮显示）
    selectPreviewQuestion(index) {
      if (!this.localQuestions || index < 0 || index >= this.localQuestions.length) {
        return
      }
      this.previewCurrentQuestionIndex = index

      // 滚动到对应的题目预览位置
      this.$nextTick(() => {
        this.scrollToQuestion(index)
      })

      // 如果题目还没有详情数据，尝试加载
      const question = this.localQuestions[index]
      if (!question.answer && !question.analysis && !question.analyse) {
        // 优先使用选择的科目作为 subject_name
        let subjectName = this.selectedSubject || ''

        // 如果没有选择科目，尝试使用教师科目
        if (!subjectName && !this.isAdmin && this.teacherSubjectName) {
          subjectName = this.teacherSubjectName
        }

        // 如果还是没有科目，则从章节路径中提取（作为备选）
        if (!subjectName) {
          subjectName = this.getSubjectFromChapter(question)
        }

        if (subjectName) {
          // 获取题目ID，支持多种字段名
          const questionId = question.sid || question.SID || question.questionSid
          if (!questionId) {
            console.warn('题目缺少ID字段，无法加载详情:', question)
            return
          }
          // 构建请求数据
          const requestData = {
            subject_name: subjectName,
            sids: [questionId]
          }

          // 调用API获取题目详情
          getQuestionDetail(requestData).then(res => {
            let detail = null
            if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
              detail = res.questions[0]
            } else if (res && res.SID) {
              detail = res
            } else if (res && res.code === 200 && res.data) {
              detail = res.data
            }

            if (detail) {
              // 将详情数据合并到题目对象中，保留原有的children结构
              const existingChildren = question.children
              // 使用 Vue.set 确保响应式更新
              Object.keys(detail).forEach(key => {
                this.$set(question, key, detail[key])
              })
              // 如果详情中有children数据，使用详情中的；否则保留原有的
              if (detail.children || detail.Children) {
                this.$set(question, 'children', detail.children || detail.Children)
              } else if (existingChildren) {
                this.$set(question, 'children', existingChildren)
              }
              // 确保 question 字段存在（用于预览显示）
              if (!question.question && detail.Content) {
                this.$set(question, 'question', detail.Content)
              }
              // 确保 options 字段存在
              if (!question.options && detail.Options) {
                this.$set(question, 'options', detail.Options)
              }
              // 强制更新视图
              this.$forceUpdate()
            }
          }).catch(error => {
            console.error('获取题目详情失败:', error)
          })
        }
      }
    },
    // 拖拽结束处理
    onPreviewDragEnd() {
      // 拖拽后更新当前选中题目的索引（如果题目顺序改变了）
      if (this.previewCurrentQuestionIndex >= this.localQuestions.length) {
        this.previewCurrentQuestionIndex = this.localQuestions.length - 1
      }
    },
    // 删除题目
    removeQuestion(index) {
      if (!this.localQuestions || index < 0 || index >= this.localQuestions.length) {
        return
      }

      // 获取要删除的题目
      const question = this.localQuestions[index]
      const questionId = question.sid || question.SID || question.questionSid

      // 从本地列表中移除
      this.localQuestions.splice(index, 1)

      // 如果删除的是当前选中的题目，调整选中索引
      if (this.previewCurrentQuestionIndex === index) {
        // 如果删除的是最后一个，选中前一个
        if (this.previewCurrentQuestionIndex >= this.localQuestions.length) {
          this.previewCurrentQuestionIndex = Math.max(0, this.localQuestions.length - 1)
        }
        // 如果删除的不是最后一个，索引会自动指向下一个（因为数组元素前移）
      } else if (this.previewCurrentQuestionIndex > index) {
        // 如果删除的题目在当前选中题目之前，需要将选中索引减1
        this.previewCurrentQuestionIndex--
      }

      // 同步更新到父组件和 store
      this.$emit('update:selectedQuestions', this.localQuestions)

      // 如果 store 可用，也从 store 中移除
      if (this.$store && this.$store.commit && questionId) {
        this.$store.commit('removeSelectedQuestion', questionId)
      }

      // 如果题目列表为空，关闭弹窗
      if (this.localQuestions.length === 0) {
        this.$message.info('题目列表已为空')
        this.dialogVisible = false
      } else {
        this.$message.success('已删除题目')
      }
    },
    // 获取题目预览文本（用于左侧列表显示）
    getQuestionPreview(question) {
      if (!question) return '无题目内容'
      // 支持多种字段名：question, Content, content
      const text = question.question || question.Content || question.content
      if (!text) return '无题目内容'
      // 移除HTML标签，只保留文本
      const textOnly = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
      // 截取前100个字符
      return textOnly.length > 100 ? textOnly.substring(0, 100) + '...' : textOnly
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
    // 获取题目类型
    getQuestionType(question) {
      return question.catename || question.CateName || question.qtype || '未知题型'
    },
    // 获取题目难度
    getQuestionDifficulty(question) {
      const difficulty = question.difficulty || question.degree || question.Degree
      if (typeof difficulty === 'string' && ['简单', '较易', '中等', '较难', '困难', 'easy', 'easier', 'medium', 'harder', 'hard'].includes(difficulty)) {
        return difficulty
      }
      const diff = parseFloat(difficulty)
      if (!isNaN(diff)) {
        if (diff > 0 && diff <= 0.2) return '困难'
        if (diff > 0.2 && diff <= 0.4) return '较难'
        if (diff > 0.4 && diff <= 0.6) return '中等'
        if (diff > 0.6 && diff <= 0.8) return '较易'
        if (diff > 0.8 && diff <= 1) return '简单'
      }
      return '未知'
    },
    // 解析选项
    parseOptions(options) {
      if (!options) return []
      if (Array.isArray(options)) return options
      if (typeof options === 'string') {
        try {
          const parsed = JSON.parse(options)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return options.split(',').filter(opt => opt.trim())
        }
      }
      return []
    },
    // 移除选项前缀
    removeOptionPrefix(option, index) {
      if (!option) return ''
      const prefix = String.fromCharCode(65 + index) + '.'
      if (option.trim().startsWith(prefix)) {
        return option.trim().substring(prefix.length).trim()
      }
      return option
    },
    // 解析子题目
    parseChildren(children) {
      if (!children) return []
      if (Array.isArray(children)) return children
      if (typeof children === 'string') {
        try {
          const parsed = JSON.parse(children)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }
      return []
    },
    // 显示题目解析
    showQuestionAnalysis(question, index) {
      this.currentQuestion = question
      this.analysisVisible = true
      this.loadingDetail = true
      this.questionDetail = null

      // 优先使用本地选中的科目作为 subject_name
      let subjectName = this.localSelectedSubject || ''
      if (!subjectName) {
        if (this.isAdmin && this.selectedSubject) {
          subjectName = this.selectedSubject
        } else if (!this.isAdmin && this.teacherSubjectName) {
          subjectName = this.teacherSubjectName
        } else {
          subjectName = this.getSubjectFromChapter(question)
        }
      }

      // 如果题目已经有详情数据，直接使用
      if (question.answer || question.analysis || question.analyse) {
        this.questionDetail = question
        this.loadingDetail = false
        return
      }

      // 获取题目ID，支持多种字段名
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        console.warn('题目缺少ID字段，无法加载详情:', question)
        this.loadingDetail = false
        return
      }

      // 构建请求数据
      const requestData = {
        subject_name: subjectName,
        sids: [questionId]
      }

      // 调用API获取题目详情
      getQuestionDetail(requestData).then(res => {
        let detail = null
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          detail = res.questions[0]
        } else if (res && res.SID) {
          detail = res
        } else if (res && res.code === 200 && res.data) {
          detail = res.data
        }

        if (detail) {
          // 将详情数据合并到题目对象中，保留原有的children结构
          const existingChildren = question.children
          Object.assign(question, detail)
          // 如果详情中有children数据，使用详情中的；否则保留原有的
          if (detail.children || detail.Children) {
            question.children = detail.children || detail.Children
          } else if (existingChildren) {
            question.children = existingChildren
          }
          this.questionDetail = question
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
    // 关闭解析弹窗
    closeAnalysis() {
      this.analysisVisible = false
      this.currentQuestion = null
      this.questionDetail = null
    },
    // 滚动到指定题目的预览位置
    scrollToQuestion(index) {
      // 找到右侧预览区域的容器
      const previewContainer = this.$el.querySelector('.preview-all-questions')
      if (!previewContainer) {
        return
      }

      // 找到对应的题目元素
      const questionItems = previewContainer.querySelectorAll('.preview-question-item')
      if (questionItems && questionItems[index]) {
        const targetElement = questionItems[index]
        // 滚动到目标元素，使其可见
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }
}
</script>

<style scoped>
/* 预览弹窗样式 */
.preview-dialog-content {
  display: flex;
  flex-direction: column;
  height: 70vh;
  padding: 0 10px;
}

.preview-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0px 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.preview-header-main {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
  flex: 1;
}

.preview-name {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 200px;
}

.preview-header-info .label {
  font-weight: 600;
  color: #606266;
  margin-right: 10px;
  font-size: 14px;
}

.preview-type-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f7fa;
  padding: 4px;
  border-radius: 8px;
}

.preview-type-tab {
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
  position: relative;
}

.preview-type-tab:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.preview-type-tab.active {
  color: #409eff;
  background: #fff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
  font-weight: 600;
}

.preview-type-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 3px;
  background: #409eff;
  border-radius: 2px 2px 0 0;
}

.preview-subject {
  display: flex;
  align-items: center;
}

.preview-subject .el-select {
  width: 200px;
}

.preview-count {
  display: flex;
  align-items: center;
}

.preview-count .count-value {
  font-size: 16px;
  color: #67c23a;
  font-weight: 600;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
  border-radius: 8px;
  border: 1px solid #b3e19d;
  white-space: nowrap;
}

.preview-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.preview-actions .el-button {
  padding: 12px 32px;
  margin-left: 10px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.preview-actions .el-button:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

/* 左右分布布局 */
.preview-content-wrapper {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 左侧面板 */
.preview-left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.preview-left-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.preview-left-header .panel-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.preview-left-header .question-count {
  font-size: 12px;
  color: #909399;
}

.preview-questions-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.preview-question-list-item {
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  cursor: move;
  transition: all 0.3s;
  position: relative;
  user-select: none;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.preview-question-list-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.preview-question-list-item.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.25);
  border-left: 3px solid #409eff;
}

.preview-question-list-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #409eff;
  border-radius: 8px 0 0 8px;
}

.question-item-content {
  display: flex;
  align-items: flex-start;
}

.question-item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.question-item-number {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: inline-flex;
  align-items: center;
}

.preview-question-list-item.active .question-item-number {
  color: #409eff;
}

.question-item-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.question-item-type {
  background: #409eff;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.question-item-difficulty {
  color: #909399;
  font-size: 11px;
  padding: 3px 8px;
  background: #f5f7fa;
  border-radius: 10px;
  white-space: nowrap;
}

.question-item-preview {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
}

.preview-question-list-item.active .question-item-preview {
  border-top-color: #d9ecff;
}

.question-item-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
  flex-shrink: 0;
}

.delete-question-btn {
  color: #f56c6c;
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-question-list-item:hover .delete-question-btn {
  opacity: 1;
}

.delete-question-btn:hover {
  color: #f78989;
  background-color: rgba(245, 108, 108, 0.1);
}

/* 拖拽样式 */
.ghost-question {
  opacity: 0.5;
  background: #f0f9ff;
}

.chosen-question {
  border-color: #409eff;
}

/* 右侧面板 */
.preview-right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  min-width: 0;
}

.preview-right-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.preview-right-header .panel-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.preview-right-header .question-count {
  font-size: 12px;
  color: #909399;
}

.preview-all-questions {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
}

.preview-question-item {
  margin-bottom: 10px;
  padding: 5px 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-question-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.preview-question-item.active {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.preview-question-item .question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 15px; */
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-question-item .question-number {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.preview-question-item .question-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.view-detail-btn {
  color: #409eff;
  padding: 0 8px;
  font-size: 12px;
}

.view-detail-btn:hover {
  color: #66b1ff;
}

.delete-question-btn-right {
  color: #f56c6c;
  padding: 0 8px;
  font-size: 14px;
  margin-left: 8px;
}

.delete-question-btn-right:hover {
  color: #f78989;
  background-color: rgba(245, 108, 108, 0.1);
}

.preview-question-item .question-type {
  background: #409eff;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.preview-question-item .question-difficulty {
  color: #909399;
  font-size: 12px;
}

.preview-question-item .question-content {
  padding: 10px 0 0;
  overflow: hidden;
  word-wrap: break-word;
}

.preview-question-item .question-text {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #303133;
  font-size: 14px;
  overflow: hidden;
  word-wrap: break-word;
}

.preview-question-item .question-options {
  margin: 15px 0 0;
}

.preview-question-item .option-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: flex-start;
}

.preview-question-item .option-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
}

.preview-question-item .option-content {
  flex: 1;
  line-height: 1.6;
  color: #606266;
  overflow: hidden;
  word-wrap: break-word;
}

.preview-question-item .question-answer {
  margin: 15px 0;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
}

.preview-question-item .answer-label {
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 8px;
}

.preview-question-item .answer-content {
  line-height: 1.6;
  color: #303133;
  overflow: hidden;
  word-wrap: break-word;
}

.preview-question-item .question-analysis {
  margin: 15px 0;
  padding: 12px;
  background: #fff7e6;
  border-radius: 6px;
  border-left: 3px solid #e6a23c;
}

.preview-question-item .analysis-label {
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 8px;
}

.preview-question-item .analysis-content {
  line-height: 1.6;
  color: #303133;
  overflow: hidden;
  word-wrap: break-word;
}

/* 子题目样式 */
.sub-questions {
  /* margin: 20px 0; */
  padding: 15px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.sub-question-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
}

.sub-question-item:last-child {
  margin-bottom: 0;
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.sub-question-number {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}

.sub-question-type {
  background: #67c23a;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.sub-question-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #303133;
  font-size: 14px;
  overflow: hidden;
  word-wrap: break-word;
}

.sub-question-options {
  margin: 12px 0;
}

.sub-question-options .option-item {
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
  display: flex;
  align-items: flex-start;
}

.sub-question-options .option-label {
  font-weight: bold;
  color: #67c23a;
  margin-right: 8px;
  min-width: 20px;
}

.sub-question-options .option-content {
  flex: 1;
  line-height: 1.6;
  color: #606266;
  overflow: hidden;
  word-wrap: break-word;
}

.sub-question-answer {
  margin: 12px 0;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
}

.sub-question-answer .answer-label {
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 6px;
  font-size: 12px;
}

.sub-question-answer .answer-content {
  line-height: 1.6;
  color: #303133;
  font-size: 13px;
  overflow: hidden;
  word-wrap: break-word;
}

.sub-question-analysis {
  margin: 12px 0;
  padding: 10px;
  background: #fff7e6;
  border-radius: 6px;
  border-left: 3px solid #e6a23c;
}

.sub-question-analysis .analysis-label {
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 6px;
  font-size: 12px;
}

.sub-question-analysis .analysis-content {
  line-height: 1.6;
  color: #303133;
  font-size: 13px;
  overflow: hidden;
  word-wrap: break-word;
}

.no-questions-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: 10px;
}

.no-questions-hint i {
  font-size: 48px;
}

/* 图片样式补充*/
.preview-question-item >>> img,
.preview-question-item /deep/ img,
.preview-question-item ::v-deep img,
.sub-question-item >>> img,
.sub-question-item /deep/ img,
.sub-question-item ::v-deep img {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

