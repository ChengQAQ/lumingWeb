<template>
    <div v-loading="loading" class="question-analysis-content">
      <!-- 题目分析表格 -->
      <div class="question-analysis-table-wrapper">
        <el-table
          :data="questionAnalysisTableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
          :show-overflow-tooltip="true"
        >
          <el-table-column prop="className" label="班级" align="center" width="150" fixed="left">
            <template slot-scope="scope">
              <span>{{ scope.row.className || '-' }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="rank" label="名次" align="center" width="80"></el-table-column> -->
  
          <!-- 总分列（始终显示） -->
          <el-table-column label="总计" align="center" min-width="240">
            <el-table-column prop="totalScore.totalScore" label="总分" align="center" width="80">
              <template slot-scope="scope">
                {{ formatScore(scope.row.totalScore.totalScore) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalScore.scoreRate" label="得分率" align="center" width="100">
              <template slot-scope="scope">
                <span :style="getScoreRateStyle(scope.row.totalScore.scoreRate)">
                  {{ formatPercent(scope.row.totalScore.scoreRate) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="totalScore.avgScore" label="平均分" align="center" width="80">
              <template slot-scope="scope">
                {{ formatScore(scope.row.totalScore.avgScore) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalScore.totalQuestions" label="总学生数" align="center" width="100">
              <template slot-scope="scope">
                <span class="total-questions-count">{{ scope.row.totalScore.totalQuestions }}</span>
              </template>
            </el-table-column>
          </el-table-column>
  
          <!-- 动态生成题型列 -->
          <el-table-column
            v-for="(typeAnalysis, typeIndex) in questionTypeAnalysisList"
            :key="'type-' + typeIndex"
            :label="typeAnalysis.question_type"
            align="center"
            min-width="180"
          >
            <el-table-column :prop="'typeData.' + typeIndex + '.avgScore'" label="均分" align="center" width="80">
              <template slot-scope="scope">
                {{ formatScore(getTypeAvgScoreByIndex(typeIndex)) }}
              </template>
            </el-table-column>
            <el-table-column :prop="'typeData.' + typeIndex + '.scoreRate'" label="得分率" align="center" width="100">
              <template slot-scope="scope">
                <span :style="getScoreRateStyle(getTypeScoreRateByIndex(typeIndex))">
                  {{ formatPercent(getTypeScoreRateByIndex(typeIndex)) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :prop="'typeData.' + typeIndex + '.totalQuestions'" label="总题数" align="center" width="100">
              <template slot-scope="scope">
                <span class="total-questions-count">{{ getTypeTotalQuestionsByIndex(typeIndex) }}</span>
              </template>
            </el-table-column>
          </el-table-column>
  
          <!-- 该题型下的所有题目列 -->
          <el-table-column
            v-for="(questionItem, questionIndex) in allQuestionColumns"
            :key="'question-' + questionItem.typeIndex + '-' + questionItem.qIndex"
            :label="'第' + (questionItem.question.question_index || questionItem.qIndex + 1) + '题'"
            align="center"
            min-width="180"
          >
            <el-table-column :prop="'questions.' + questionItem.question.question_id + '.avgScore'" label="均分" align="center" width="80">
              <template slot-scope="scope">
                {{ formatScore(scope.row.questions[questionItem.question.question_id].avgScore) }}
              </template>
            </el-table-column>
            <el-table-column :prop="'questions.' + questionItem.question.question_id + '.scoreRate'" label="得分率" align="center" width="100">
              <template slot-scope="scope">
                <span :style="getScoreRateStyle( scope.row.questions[questionItem.question.question_id].scoreRate)">
                  {{ formatPercent(scope.row.questions[questionItem.question.question_id].scoreRate) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :prop="'questions.' + questionItem.question.question_id + '.fullScoreCount'" label="满分人数" align="center" width="100">
              <template slot-scope="scope">
                <span 
                  class="full-score-count clickable" 
                  @click="showFullScoreStudents(questionItem.question.question_id, scope.row)"
                  :title="'点击查看满分学生' "
                >
                  {{ scope.row.questions[questionItem.question.question_id] ? scope.row.questions[questionItem.question.question_id].fullScoreCount : 0 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :prop="'questions.' + questionItem.question.question_id + '.wrongAnswerCount'" label="错误人数" align="center" width="100">
              <template slot-scope="scope">
                <span 
                  class="wrong-answer-count clickable" 
                  @click="showWrongAnswerStudents(questionItem.question.question_id, scope.row)"
                  :title="'点击查看错误学生'"
                >
                  {{ scope.row.questions[questionItem.question.question_id] ? scope.row.questions[questionItem.question.question_id].wrongAnswerCount : 0 }}
                </span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
  
      <!-- 满分学生弹窗 -->
      <el-dialog
        title="满分学生列表"
        :visible.sync="fullScoreStudentsDialogVisible"
        width="500px"
        :close-on-click-modal="true"
      >
        <div class="full-score-students-list">
          <div v-if="currentFullScoreStudents.length === 0" class="no-data">
            暂无满分学生
          </div>
          <div v-else class="students-names">
            <span
              v-for="(student, index) in currentFullScoreStudents"
              :key="student.student_id || index"
              class="student-name"
            >
              {{ student.nick_name }}
            </span>
          </div>
        </div>
      </el-dialog>
  
      <!-- 错误学生弹窗 -->
      <el-dialog
        title="错误学生列表"
        :visible.sync="wrongAnswerStudentsDialogVisible"
        width="500px"
        :close-on-click-modal="true"
      >
        <div class="wrong-answer-students-list">
          <div v-if="currentWrongAnswerStudents.length === 0" class="no-data">
            暂无错误学生
          </div>
          <div v-else class="students-names">
            <span
              v-for="(student, index) in currentWrongAnswerStudents"
              :key="student.student_id || index"
              class="student-name"
            >
              {{ student.nick_name }}
            </span>
          </div>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { getExamQuestionAnalysis } from '@/api/system/exam'
  
  export default {
    name: 'QuestionAnalysis',
    props: {
      loading: {
        type: Boolean,
        default: false
      },
      active: {
        type: Boolean,
        default: false
      },
      examId: {
        type: [String, Number],
        default: null
      },
      classIds: {
        type: Array,
        default: () => []
      },
      classIdToNameMap: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        classAnalyses: [], // 存储班级分析数据（res.data.class_analyses）
        questionTypeStats: [], // 存储题型统计数据
        fullScoreStudentsDialogVisible: false, // 满分学生弹窗显示状态
        currentFullScoreStudents: [], // 当前显示的满分学生列表
        wrongAnswerStudentsDialogVisible: false, // 错误学生弹窗显示状态
        currentWrongAnswerStudents: [], // 当前显示的错误学生列表
        loadingQuestionAnalysis: false // 题目分析数据加载状态
      }
    },
    watch: {
      // 监听 active 属性，当标签页被激活时调用接口
      active: {
        handler(newVal) {
          if (newVal && this.examId) {
            // 一进入题目分析界面就调用接口
            this.loadQuestionDetailAnalysis()
          }
        },
        immediate: true // 立即执行一次
      },
      // 监听 examId 变化，重新加载数据（仅在激活状态下）
      examId: {
        handler() {
          if (this.active && this.examId) {
            // examId 变化时重新加载数据
            this.loadQuestionDetailAnalysis()
          }
        },
        immediate: true // 立即执行一次
      },
      // 监听 classIds 变化，重新加载数据（仅在激活状态下）
      classIds: {
        handler() {
          if (this.active && this.examId) {
            // classIds 变化时重新加载数据
            this.loadQuestionDetailAnalysis()
          }
        },
        immediate: false
      }
    },
    mounted() {
      // 组件挂载后，如果 active 为 true 且有 examId，立即调用接口
      if (this.active && this.examId) {
        this.loadQuestionDetailAnalysis()
      }
    },
    computed: {
      // 题型分析列表
      questionTypeAnalysisList() {
        return this.questionTypeStats.filter(item => item && item.question_type)
      },
      // 所有题目列的数据（扁平化处理，避免嵌套 v-for）
      allQuestionColumns() {
        const columns = []
        
        // 从第一个班级的 questions 中提取题目信息（所有班级的题目应该是一样的）
        if (this.classAnalyses && this.classAnalyses.length > 0) {
          const firstClass = this.classAnalyses[0]
          if (firstClass && firstClass.questions && Array.isArray(firstClass.questions)) {
            firstClass.questions.forEach((question, qIndex) => {
              columns.push({
                typeIndex: 0,
                qIndex: question.question_index - 1 || qIndex,
                question: {
                  question_id: question.question_id,
                  question_index: question.question_index
                }
              })
            })
          }
        }
        
        return columns
      },
      // 题目分析表格数据
      questionAnalysisTableData() {
        return this.processQuestionAnalysis()
      }
    },
    methods: {
      /** 加载题目详细分析数据 */
      loadQuestionDetailAnalysis() {
        // 如果没有 examId，不调用接口
        if (!this.examId) {
          return
        }
        
        // 如果正在加载，直接返回，避免重复调用
        if (this.loadingQuestionAnalysis) {
          return
        }
        
        this.loadingQuestionAnalysis = true

        // 调用考试题目分析接口
        getExamQuestionAnalysis({
          exam_id: this.examId,
          class_ids: this.classIds || [] // 使用传入的 class_ids
        }).then(response => {
          // 处理接口返回的数据
          if (response && response.data) {
            this.classAnalyses = Array.isArray(response.data.class_analyses) ? response.data.class_analyses : []
            this.questionTypeStats = Array.isArray(response.data.question_type_stats) ? response.data.question_type_stats : []
          } else {
            this.classAnalyses = []
            this.questionTypeStats = []
          }
        }).catch(error => {
          console.error('获取考试题目分析数据失败:', error)
          this.classAnalyses = []
          this.questionTypeStats = []
        }).finally(() => {
          this.loadingQuestionAnalysis = false
        })
      },
      /** 格式化百分比 */
      formatPercent(value) {
        if (value === null || value === undefined) return '-'
        if (typeof value === 'number') {
          return (value * 100).toFixed(1) + '%'
        }
        return value
      },
      /** 格式化分数 */
      formatScore(value) {
        if (value === null || value === undefined) return '-'
        if (typeof value === 'number') {
          return value.toFixed(2)
        }
        return value
      },
      /** 根据得分率获取颜色样式 */
      getScoreRateStyle(scoreRate) {
        if (scoreRate === null || scoreRate === undefined) {
          return {
            backgroundColor: '#f5f7fa',
            color: '#909399',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            minWidth: '50px',
            textAlign: 'center'
          }
        }
  
        // 将得分率转换为 0-1 的数值
        let rate = typeof scoreRate === 'number' ? scoreRate : parseFloat(scoreRate)
        if (rate > 1) {
          rate = rate / 100 // 如果是百分比，转换为小数
        }
        rate = Math.max(0, Math.min(1, rate)) // 限制在 0-1 之间
  
        // 得分率越低，颜色越深（红色）
        // 0% -> 深红色 rgb(255, 200, 200), 100% -> 浅红色 rgb(255, 240, 240)
        // 使用线性插值计算颜色
        const red = 255
        const green = 240 - Math.floor((1 - rate) * 40) // 240 -> 200
        const blue = 240 - Math.floor((1 - rate) * 40)  // 240 -> 200
  
        return {
          backgroundColor: `rgb(${red}, ${green}, ${blue})`,
          color: rate < 0.5 ? '#303133' : '#606266', // 颜色深时文字用深色，颜色浅时文字用浅色
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block',
          minWidth: '50px',
          textAlign: 'center',
          fontWeight: '500'
        }
      },
      /** 处理题目分析数据，生成表格数据 */
      processQuestionAnalysis() {
        // 优先使用新格式数据（class_analyses）
        if (this.classAnalyses && this.classAnalyses.length > 0) {
          return this.classAnalyses.map(classAnalysis => {
            // 优先使用接口返回的 class_name
            let className = classAnalysis.class_name || ''
            // 如果接口没有返回 class_name，使用 classIdToNameMap 映射
            if (!className && classAnalysis.class_id) {
              const classIdStr = String(classAnalysis.class_id)
              const classIdNum = Number(classAnalysis.class_id)
              className = this.classIdToNameMap[classIdStr] || 
                          this.classIdToNameMap[classIdNum] || 
                          this.classIdToNameMap[classAnalysis.class_id] || 
                          ''
            }
            const totalScore = classAnalysis.total_score || 0
            const averageScore = classAnalysis.average_score || 0
            const totalStudents = classAnalysis.total_students || 0
            
            // 使用接口返回的 score_rate，如果是百分比形式需要转换
            let totalScoreRate = null
            if (classAnalysis.score_rate !== null && classAnalysis.score_rate !== undefined) {
              totalScoreRate = typeof classAnalysis.score_rate === 'number'
                ? (classAnalysis.score_rate > 1 ? classAnalysis.score_rate / 100 : classAnalysis.score_rate)
                : null
            } else if (totalScore > 0) {
              // 如果没有 score_rate，则计算
              totalScoreRate = averageScore / totalScore
            }
            
            // 处理题目数据
            const questionsData = {}
            if (classAnalysis.questions && Array.isArray(classAnalysis.questions)) {
              classAnalysis.questions.forEach(question => {
                questionsData[question.question_id] = {
                  avgScore: question.average_score || 0,
                  scoreRate: question.score_rate ? (question.score_rate > 1 ? question.score_rate / 100 : question.score_rate) : 0,
                  fullScoreCount: question.full_score_count || 0,
                  wrongAnswerCount: question.error_count || 0,
                  maxScore: question.full_score || 0,
                  question: question // 保存完整的题目对象，用于显示学生列表
                }
              })
            }
            
            // 处理题型数据（暂时为空，如果需要可以后续从 questions 中统计）
            const typeData = []
            
            return {
              className: className,
              rank: 1,
              totalScore: {
                totalScore: totalScore, // 总分
                avgScore: parseFloat(averageScore.toFixed(2)), // 平均分
                scoreRate: totalScoreRate, // 得分率
                fullScoreCount: 0, // 可以从 questions 中统计
                totalQuestions: totalStudents // 总学生数
              },
              typeData: typeData,
              questions: questionsData
            }
          })
        }
        
        return []
      },
      /** 根据索引获取题型的平均分 */
      getTypeAvgScoreByIndex(typeIndex) {
        const typeList = this.questionTypeAnalysisList
        if (typeIndex >= 0 && typeIndex < typeList.length) {
          const typeAnalysis = typeList[typeIndex]
          const questionType = typeAnalysis.question_type
          const typeStat = this.questionTypeStats.find(t => t.question_type === questionType)
          return typeStat && typeStat.avg_score !== null && typeStat.avg_score !== undefined ? typeStat.avg_score : null
        }
        return null
      },
      /** 根据索引获取题型的得分率 */
      getTypeScoreRateByIndex(typeIndex) {
        const typeList = this.questionTypeAnalysisList
        if (typeIndex >= 0 && typeIndex < typeList.length) {
          const typeAnalysis = typeList[typeIndex]
          const questionType = typeAnalysis.question_type
          const typeStat = this.questionTypeStats.find(t => t.question_type === questionType)
          if (typeStat && typeStat.score_rate !== null && typeStat.score_rate !== undefined) {
            return typeStat.score_rate
          }
        }
        return null
      },
      /** 根据索引获取题型的总题数 */
      getTypeTotalQuestionsByIndex(typeIndex) {
        const typeList = this.questionTypeAnalysisList
        if (typeIndex >= 0 && typeIndex < typeList.length) {
          const typeAnalysis = typeList[typeIndex]
          const questionType = typeAnalysis.question_type
          const typeStat = this.questionTypeStats.find(t => t.question_type === questionType)
          return typeStat && typeStat.total_questions !== null && typeStat.total_questions !== undefined ? typeStat.total_questions : 0
        }
        return 0
      },
      /** 显示满分学生弹窗 */
      showFullScoreStudents(questionId, row) {
        if (!questionId || !row) return
        
        // 使用当前行的题目数据
        if (row && row.questions && row.questions[questionId] && row.questions[questionId].question) {
          const question = row.questions[questionId].question
          if (question.correct_students) {
            const correctStudents = Array.isArray(question.correct_students) 
              ? question.correct_students 
              : []
            // 使用 nick_name 或 student_name
            this.currentFullScoreStudents = correctStudents.map(student => ({
              student_id: student.student_id,
              student_name: student.nick_name || student.student_name || ''
            }))
            this.fullScoreStudentsDialogVisible = true
            return
          }
        }
        
        this.currentFullScoreStudents = []
        this.fullScoreStudentsDialogVisible = true
      },
      /** 显示错误学生弹窗 */
      showWrongAnswerStudents(questionId, row) {
        if (!questionId || !row) return
        
        // 使用当前行的题目数据
        const question = row.questions && row.questions[questionId] && row.questions[questionId].question
        if (question && question.wrong_students) {
          const wrongStudents = Array.isArray(question.wrong_students) ? question.wrong_students : []
          this.currentWrongAnswerStudents = wrongStudents.map(student => ({
            student_id: student.student_id,
            student_name: student.nick_name || student.student_name || ''
          }))
        } else {
          this.currentWrongAnswerStudents = []
        }
        this.wrongAnswerStudentsDialogVisible = true
      }
    }
  }
  </script>
  
  <style scoped lang="scss">
  .question-analysis-content {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .question-analysis-table-wrapper {
    overflow-x: auto;
  
    // 自定义横向滚动条样式，增加滚动条高度（宽度）
    &::-webkit-scrollbar {
      height: 12px; // 增加滚动条高度
    }
  
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 6px;
    }
  
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 6px;
  
      &:hover {
        background: #a8a8a8;
      }
    }
  
    // 兼容 Firefox
    scrollbar-width: thick;
    scrollbar-color: #c1c1c1 #f1f1f1;
  
    ::v-deep .el-table {
      .full-score-count {
        color: #409eff;
        font-weight: 500;
      }
      .total-questions-count {
        color: #409eff;
        font-weight: 500;
      }
  
      .el-table__cell {
        padding: 12px 0;
      }
  
      .el-table__header-wrapper {
        .el-table__header {
          th {
            background-color: #f5f7fa !important;
          }
        }
      }
    }
    // 确保固定列正常显示
    ::v-deep .el-table__fixed {
      height: auto !important;
    }
    
    ::v-deep .el-table__fixed-right {
      height: auto !important;
    }
    
    // 覆盖 Element UI 的 is-hidden 规则，强制显示固定列的内容
    ::v-deep .el-table .el-table__cell.is-hidden > * {
      visibility: visible !important;
    }
    
    ::v-deep .el-table__fixed .el-table__cell.is-hidden > * {
      visibility: visible !important;
    }
    
    // 确保固定列的表头和表体都可见
    ::v-deep .el-table__fixed-header-wrapper {
      z-index: 12 !important;
    }
    
    ::v-deep .el-table__fixed-body-wrapper {
      z-index: 11 !important;
      height: auto !important;
    }
    
    // 确保固定列的单元格内容可见
    ::v-deep .el-table__fixed .el-table__body td {
      overflow: visible !important;
    }
    
    ::v-deep .el-table__fixed .el-table__body td.cell {
      overflow: visible !important;
      white-space: normal !important;
    }
    
    // 确保固定列的表头可见
    ::v-deep .el-table__fixed .el-table__header th {
      overflow: visible !important;
    }
    
    ::v-deep .el-table__fixed .el-table__header th .cell {
      overflow: visible !important;
      white-space: normal !important;
    }
    
    ::v-deep .el-table__body-wrapper {
      overflow-x: auto;
      overflow-y: auto;
      z-index: 1;
    }
  
    .full-score-count.clickable,
    .wrong-answer-count.clickable {
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.3s;
      
      &:hover {
        color: #66b1ff;
      }
    }
  
    .wrong-answer-count {
      color: #f56c6c;
      font-weight: 500;
    }
  }
  
  /* 满分学生弹窗样式 */
  .full-score-students-list,
  .wrong-answer-students-list {
    padding: 10px 0;
    min-height: 60px;
  
    .no-data {
      text-align: center;
      color: #909399;
      padding: 40px 0;
      font-size: 14px;
    }
  
    .students-names {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      color: #303133;
      font-size: 14px;
  
      .student-name {
        display: inline-block;
        padding: 6px 12px;
        margin: 0;
        background-color: #f5f7fa;
        border-radius: 4px;
        min-width: 80px;
        text-align: center;
        flex: 0 0 calc(25% - 12px);
        box-sizing: border-box;
      }
    }
  }
  </style>
  
  