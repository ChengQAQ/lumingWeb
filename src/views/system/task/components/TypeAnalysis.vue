<template>
  <div v-loading="loading" class="type-analysis-content">
    <!-- 班级整体表格 -->
    <div v-show="typeAnalysisView === 'class'" class="type-analysis-section">
      <h3 class="section-title">班级整体</h3>
      <!-- 切换按钮 -->
      <div class="type-analysis-switch">
        <el-radio-group v-model="typeAnalysisView" size="medium">
          <el-radio-button label="class">班级整体</el-radio-button>
          <el-radio-button label="student">学生明细</el-radio-button>
        </el-radio-group>
      </div>
      <div class="type-analysis-table-wrapper">
        <el-table
          :data="typeAnalysisTableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
          fit
        >
          <el-table-column prop="questionType" label="题型名称" align="center" min-width="120"></el-table-column>
          <el-table-column prop="scoreValue" label="分值" align="center" min-width="100"></el-table-column>
          <el-table-column prop="proportion" label="占比" align="center" min-width="100">
            <template slot-scope="scope">
              {{ formatPercent(scope.row.proportion) }}
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" align="center" min-width="100">
            <template slot-scope="scope">
              {{ formatScore(scope.row.difficulty) }}
            </template>
          </el-table-column>
          <el-table-column prop="discrimination" label="区分度" align="center" min-width="100">
            <template slot-scope="scope">
              {{ formatScore(scope.row.discrimination) }}
            </template>
          </el-table-column>

          <!-- 班级数据列（合并表头） -->
          <el-table-column :label="className" align="center" min-width="200" v-if="className">
            <el-table-column prop="avgScore" label="均分" align="center" min-width="100">
              <template slot-scope="scope">
                {{ formatScore(scope.row.avgScore) }}
              </template>
            </el-table-column>
            <el-table-column prop="scoreRate" label="得分率" align="center" min-width="100">
              <template slot-scope="scope">
                <span :style="getScoreRateStyle(scope.row.scoreRate)">
                  {{ formatPercent(scope.row.scoreRate) }}
                </span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 学生明细表格 -->
    <div v-show="typeAnalysisView === 'student'" class="type-analysis-section">
      <h3 class="section-title">学生明细</h3>
      <!-- 切换按钮 -->
      <div class="type-analysis-switch">
        <el-radio-group v-model="typeAnalysisView" size="medium">
          <el-radio-button label="class">班级整体</el-radio-button>
          <el-radio-button label="student">学生明细</el-radio-button>
        </el-radio-group>
      </div>
      <div class="type-analysis-table-wrapper">
        <el-table
          :data="studentDetailTableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
          fit
        >
          <el-table-column prop="questionType" label="题型名称" align="center" min-width="120" fixed="left"></el-table-column>
          <el-table-column prop="scoreValue" label="分值" align="center" min-width="100"></el-table-column>
          <el-table-column prop="proportion" label="占比" align="center" min-width="100">
            <template slot-scope="scope">
              {{ formatPercent(scope.row.proportion) }}
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" align="center" min-width="100">
            <template slot-scope="scope">
              {{ formatScore(scope.row.difficulty) }}
            </template>
          </el-table-column>
          <el-table-column prop="discrimination" label="区分度" align="center" min-width="100">
            <template slot-scope="scope">
              {{ formatScore(scope.row.discrimination) }}
            </template>
          </el-table-column>

          <!-- 班级整体列 -->
          <el-table-column :label="className" align="center" min-width="200" v-if="className">
            <el-table-column prop="classScore" label="得分" align="center" min-width="100">
              <template slot-scope="scope">
                {{ formatScore(scope.row.classScore) }}
              </template>
            </el-table-column>
            <el-table-column prop="classScoreRate" label="得分率" align="center" min-width="100">
              <template slot-scope="scope">
                <span :style="getScoreRateStyle(scope.row.classScoreRate)">
                  {{ formatPercent(scope.row.classScoreRate) }}
                </span>
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 动态生成学生列 -->
          <el-table-column
            v-for="(student, index) in studentList"
            :key="'student-' + index"
            :label="student.name"
            align="center"
            min-width="200"
          >
            <el-table-column :prop="'students.' + index + '.score'" label="得分" align="center" min-width="100">
              <template slot-scope="scope">
                {{ scope.row.students && scope.row.students[index] && scope.row.students[index].score !== null ? formatScore(scope.row.students[index].score) : '--' }}
              </template>
            </el-table-column>
            <el-table-column :prop="'students.' + index + '.scoreRate'" label="得分率" align="center" min-width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.students && scope.row.students[index] && scope.row.students[index].scoreRate !== null" :style="getScoreRateStyle(scope.row.students[index].scoreRate)">
                  {{ formatPercent(scope.row.students[index].scoreRate) }}
                </span>
                <span v-else>--</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserInfos } from '@/api/system/teacher'

export default {
  name: 'TypeAnalysis',
  props: {
    reportData: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      typeAnalysisView: 'class', // 题型分析视图：'class' 班级整体，'student' 学生明细
      studentInfoMap: {} // 学生ID到学生信息的映射
    }
  },
  computed: {
    // 从 reportData 中获取 question_analysis 数据
    questionAnalysis() {
      return this.reportData.question_analysis || []
    },
    // 从 reportData 中获取 student_question_scores 数据
    studentQuestionScores() {
      return this.reportData.student_question_scores || []
    },
    // 学生列表（从 student_question_scores 中提取，并使用 studentInfoMap 获取姓名）
    studentList() {
      if (!this.studentQuestionScores || this.studentQuestionScores.length === 0) {
        return []
      }
      return this.studentQuestionScores.map(item => {
        const studentId = item.student_id
        const studentInfo = this.studentInfoMap[studentId]
        // 优先使用接口获取的姓名，其次使用 student_name，最后使用默认值
        const name = studentInfo 
          ? (studentInfo.nickName || studentInfo.userName || studentInfo.name || `学生${studentId}`)
          : (item.student_name || `学生${studentId}`)
        
        return {
          id: studentId,
          name: name
        }
      })
    },
    // 题型分析表格数据（使用 reportData.question_analysis）
    typeAnalysisTableData() {
      const questionAnalysis = this.questionAnalysis

      if (!questionAnalysis || questionAnalysis.length === 0) {
        return []
      }

      // 按题型分组
      const typeMap = {}
      questionAnalysis.forEach(question => {
        const questionType = question.question_type
        if (!questionType || questionType.trim() === '') {
          return // 跳过没有题型的题目
        }
        if (!typeMap[questionType]) {
          typeMap[questionType] = {
            questionType: questionType,
            questions: [],
            totalMaxScore: 0,
            totalAvgScore: 0,
            questionCount: 0
          }
        }
        typeMap[questionType].questions.push(question)
        typeMap[questionType].totalMaxScore += question.max_score || 0
        typeMap[questionType].totalAvgScore += question.avg_score || 0
        typeMap[questionType].questionCount += 1
      })

      // 计算总分（所有题型的max_score之和）
      const totalScore = Object.values(typeMap).reduce((sum, type) => sum + type.totalMaxScore, 0)

      // 转换为表格数据格式
      return Object.values(typeMap).map(type => {
        const scoreValue = type.totalMaxScore
        const proportion = totalScore > 0 ? (scoreValue / totalScore) : 0
        const avgScore = type.questionCount > 0 ? (type.totalAvgScore / type.questionCount) : 0
        const avgMaxScore = type.questionCount > 0 ? (scoreValue / type.questionCount) : 0
        const scoreRate = avgMaxScore > 0 ? (avgScore / avgMaxScore) : 0

        // 计算难度和区分度（暂时设为0，因为接口数据中没有）
        const difficulty = 0
        const discrimination = 0

        return {
          questionType: type.questionType,
          scoreValue: scoreValue,
          proportion: proportion,
          difficulty: difficulty,
          discrimination: discrimination,
          avgScore: avgScore,
          scoreRate: scoreRate
        }
      })
    },
    // 学生明细表格数据（使用 reportData.student_question_scores 和 question_analysis）
    studentDetailTableData() {
      const questionAnalysis = this.questionAnalysis
      const studentQuestionScores = this.studentQuestionScores

      if (!questionAnalysis || questionAnalysis.length === 0) {
        return []
      }

      // 按题型分组
      const typeMap = {}
      questionAnalysis.forEach(question => {
        const questionType = question.question_type
        if (!questionType || questionType.trim() === '') {
          return // 跳过没有题型的题目
        }
        if (!typeMap[questionType]) {
          typeMap[questionType] = {
            questionType: questionType,
            questions: [],
            totalMaxScore: 0,
            totalAvgScore: 0,
            questionCount: 0
          }
        }
        typeMap[questionType].questions.push(question)
        typeMap[questionType].totalMaxScore += question.max_score || 0
        typeMap[questionType].totalAvgScore += question.avg_score || 0
        typeMap[questionType].questionCount += 1
      })

      // 计算总分
      const totalScore = Object.values(typeMap).reduce((sum, type) => sum + type.totalMaxScore, 0)

      // 构建学生分数映射（question_id -> student_id -> score）
      const studentScoreMap = {}
      studentQuestionScores.forEach(studentData => {
        const studentId = studentData.student_id
        const questionScores = studentData.question_scores || {}
        Object.keys(questionScores).forEach(questionId => {
          if (!studentScoreMap[questionId]) {
            studentScoreMap[questionId] = {}
          }
          studentScoreMap[questionId][studentId] = questionScores[questionId]
        })
      })

      // 转换为表格数据格式
      return Object.values(typeMap).map(type => {
        const scoreValue = type.totalMaxScore
        const proportion = totalScore > 0 ? (scoreValue / totalScore) : 0
        const classScore = type.questionCount > 0 ? (type.totalAvgScore / type.questionCount) : 0
        const avgMaxScore = type.questionCount > 0 ? (scoreValue / type.questionCount) : 0
        const classScoreRate = avgMaxScore > 0 ? (classScore / avgMaxScore) : 0

        // 计算难度和区分度（暂时设为0）
        const difficulty = 0
        const discrimination = 0

        // 构建学生数据：计算每个学生在该题型下的总得分
        const students = this.studentList.map(student => {
          const studentId = student.id
          let totalStudentScore = 0
          let hasScore = false

          // 遍历该题型下的所有题目，累加该学生的得分
          type.questions.forEach(question => {
            const questionId = question.question_id
            if (studentScoreMap[questionId] && studentScoreMap[questionId][studentId] !== undefined) {
              const score = studentScoreMap[questionId][studentId]
              if (score !== null && score !== undefined) {
                totalStudentScore += score
                hasScore = true
              }
            }
          })

          // 计算得分率
          const scoreRate = scoreValue > 0 && hasScore ? (totalStudentScore / scoreValue) : null

          return {
            score: hasScore ? totalStudentScore : null,
            scoreRate: scoreRate
          }
        })

        return {
          questionType: type.questionType,
          scoreValue: scoreValue,
          proportion: proportion,
          difficulty: difficulty,
          discrimination: discrimination,
          classScore: classScore,
          classScoreRate: classScoreRate,
          students: students
        }
      })
    }
  },
  watch: {
    // reportData 变化时，加载学生信息
    reportData: {
      handler(newVal) {
        if (newVal && newVal.student_question_scores) {
          this.loadStudentInfos()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    /** 加载学生信息 */
    async loadStudentInfos() {
      const studentQuestionScores = this.studentQuestionScores
      
      if (!studentQuestionScores || studentQuestionScores.length === 0) {
        return
      }

      // 提取所有学生ID
      const studentIds = studentQuestionScores
        .map(item => item.student_id)
        .filter(id => id !== null && id !== undefined)

      if (studentIds.length === 0) {
        return
      }

      // 检查是否已经有这些学生的信息（避免重复请求）
      const needLoadIds = studentIds.filter(id => !this.studentInfoMap[id])
      
      if (needLoadIds.length === 0) {
        return
      }

      try {
        const response = await getUserInfos(needLoadIds)
        
        if (response && response.code === 200 && response.data) {
          const studentsData = Array.isArray(response.data) ? response.data : []
          
          // 构建学生信息映射
          studentsData.forEach(student => {
            const id = student.userId || student.id || student.studentId
            if (id) {
              this.$set(this.studentInfoMap, id, student)
            }
          })
        }
      } catch (error) {
        console.error('获取学生信息失败:', error)
        // 不显示错误提示，避免影响用户体验
      }
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
      const red = 255
      const green = 240 - Math.floor((1 - rate) * 40) // 240 -> 200
      const blue = 240 - Math.floor((1 - rate) * 40)  // 240 -> 200

      return {
        backgroundColor: `rgb(${red}, ${green}, ${blue})`,
        color: rate < 0.5 ? '#303133' : '#606266',
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'inline-block',
        minWidth: '50px',
        textAlign: 'center',
        fontWeight: '500'
      }
    },
  }
}
</script>

<style scoped lang="scss">
.type-analysis-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  margin: 0;
}

.type-analysis-switch {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
  position: absolute;
  top: -20px;
  right: 0;

  ::v-deep .el-radio-group {
    .el-radio-button__inner {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.type-analysis-section {
  margin-bottom: 30px;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #409eff;
  }
}

.type-analysis-table-wrapper {
  width: 100%;
  overflow-x: auto;

  // 自定义横向滚动条样式
  &::-webkit-scrollbar {
    height: 12px;
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

  scrollbar-width: thick;
  scrollbar-color: #c1c1c1 #f1f1f1;

  ::v-deep .el-table {
    width: 100% !important;

    .el-table__cell {
      padding: 12px 0;
    }

    .el-table__header-wrapper {
      width: 100%;

      .el-table__header {
        width: 100% !important;

        th {
          background-color: #f5f7fa !important;
        }
      }
    }

    .el-table__body-wrapper {
      width: 100% !important;
    }

    .el-table__body {
      width: 100% !important;
    }
  }
  ::v-deep .el-table__fixed {
    height: 92% !important;
  }
}
</style>

