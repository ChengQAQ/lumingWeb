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
              {{ (scope.row.proportion + '%') }}
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
              {{ (scope.row.proportion + '%')  }}
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
import { questionTypeAnalysis, questionTypeAnalysisWithStudents } from '@/api/system/task'

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
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      typeAnalysisView: 'class', // 题型分析视图：'class' 班级整体，'student' 学生明细
      questionTypeAnalysisData: [], // 存储接口返回的题型分析数据
      questionTypeAnalysisWithStudentsData: null, // 存储学生分析接口返回的数据
      hasLoaded: false, // 标记是否已经调用过接口
      hasLoadedStudents: false // 标记是否已经调用过学生分析接口
    }
  },
  computed: {
    // 从 reportData 中获取 question_analysis 数据
    questionAnalysis() {
      return this.reportData.question_analysis || []
    },
    // 学生列表（从接口返回的数据中提取）
    studentList() {
      if (!this.questionTypeAnalysisWithStudentsData || !this.questionTypeAnalysisWithStudentsData.question_type_analysis) {
        return []
      }
      
      // 从第一个题型的 student_scores 中提取学生列表（所有题型的学生应该是一样的）
      const firstType = this.questionTypeAnalysisWithStudentsData.question_type_analysis[0]
      if (!firstType || !firstType.student_scores || !Array.isArray(firstType.student_scores)) {
        return []
      }
      
      return firstType.student_scores.map(student => ({
        id: student.student_id,
        name: student.student_name || `学生${student.student_id}`
      }))
    },
    // 题型分析表格数据（优先使用接口返回的数据）
    typeAnalysisTableData() {
      // 优先使用接口返回的数据
      if (this.questionTypeAnalysisData && this.questionTypeAnalysisData.length > 0) {
        return this.questionTypeAnalysisData.map(item => {
          // 处理 score_rate，如果是百分比需要转换
          let scoreRate = item.score_rate
          if (scoreRate !== null && scoreRate !== undefined) {
            if (scoreRate > 1) {
              scoreRate = scoreRate / 100 // 如果是百分比，转换为小数
            }
          }

          return {
            questionType: item.question_type_name || item.question_type || '',
            scoreValue: item.total_score || 0,
            proportion: item.proportion || 0,
            difficulty: item.difficulty !== null && item.difficulty !== undefined ? item.difficulty : 0,
            discrimination: item.discrimination !== null && item.discrimination !== undefined ? item.discrimination : 0,
            avgScore: item.avg_score !== null && item.avg_score !== undefined ? item.avg_score : 0,
            scoreRate: scoreRate
          }
        })
      }

      // 如果没有接口数据，使用原来的计算方式
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
    // 学生明细表格数据（使用新接口返回的数据）
    studentDetailTableData() {
      if (!this.questionTypeAnalysisWithStudentsData || !this.questionTypeAnalysisWithStudentsData.question_type_analysis) {
        return []
      }
      
      const questionTypeAnalysis = this.questionTypeAnalysisWithStudentsData.question_type_analysis
      
      return questionTypeAnalysis.map(item => {
        // 处理 class_score_rate，如果是百分比需要转换
        let classScoreRate = item.class_score_rate
        if (classScoreRate !== null && classScoreRate !== undefined) {
          if (classScoreRate > 1) {
            classScoreRate = classScoreRate / 100 // 如果是百分比，转换为小数
          }
        }
        
        // 构建学生数据数组，按照 studentList 的顺序
        const students = this.studentList.map(student => {
          // 在当前题型的 student_scores 中查找该学生的数据
          const studentScore = item.student_scores && Array.isArray(item.student_scores)
            ? item.student_scores.find(s => s.student_id === student.id)
            : null
          
          if (!studentScore) {
            return {
              score: null,
              scoreRate: null
            }
          }
          
          // 处理 score_rate，如果是百分比需要转换
          let scoreRate = studentScore.score_rate
          if (scoreRate !== null && scoreRate !== undefined) {
            if (scoreRate > 1) {
              scoreRate = scoreRate / 100 // 如果是百分比，转换为小数
            }
          }
          
          return {
            score: studentScore.score !== null && studentScore.score !== undefined ? studentScore.score : null,
            scoreRate: scoreRate
          }
        })
        
        return {
          questionType: item.question_type_name || '',
          scoreValue: item.total_score || 0,
          proportion: item.proportion || 0,
          difficulty: item.difficulty !== null && item.difficulty !== undefined ? item.difficulty : 0,
          discrimination: item.discrimination !== null && item.discrimination !== undefined ? item.discrimination : 0,
          classScore: item.class_avg_score !== null && item.class_avg_score !== undefined ? item.class_avg_score : 0,
          classScoreRate: classScoreRate,
          students: students
        }
      })
    }
  },
  watch: {
    // 监听 active 属性，当标签页被激活时调用接口
    active(newVal) {
      if (newVal && !this.hasLoaded) {
        this.loadQuestionTypeAnalysis()
        this.hasLoaded = true
      }
    },
    // 监听 typeAnalysisView，当切换到学生明细时调用学生分析接口
    typeAnalysisView(newVal) {
      if (newVal === 'student' && !this.hasLoadedStudents) {
        this.loadQuestionTypeAnalysisWithStudents()
        this.hasLoadedStudents = true
      }
    }
  },
  methods: {
    /** 加载题型分析数据 */
    loadQuestionTypeAnalysis() {
      const classId = this.$route.query.class_id
      const taskGroupId = this.$route.query.task_group_id

      if (!classId || !taskGroupId) {
        return
      }

      questionTypeAnalysis({
        class_id: classId,
        task_group_id: taskGroupId
      }).then(response => {
        // 直接使用 response.question_type_analysis，不判断 code
        if (response && response.question_type_analysis) {
          this.questionTypeAnalysisData = Array.isArray(response.question_type_analysis) 
            ? response.question_type_analysis 
            : []
        } else {
          this.questionTypeAnalysisData = []
        }
        console.log('题型分析数据:', response)
      }).catch(error => {
        console.error('获取题型分析数据失败:', error)
        this.questionTypeAnalysisData = []
      })
    },
    /** 加载学生分析数据 */
    async loadQuestionTypeAnalysisWithStudents() {
      const classId = this.$route.query.class_id
      const taskGroupId = this.$route.query.task_group_id

      if (!classId || !taskGroupId) {
        return
      }

      try {
        const response = await questionTypeAnalysisWithStudents({
          class_id: classId,
          task_group_id: taskGroupId
        })
        
        // 从 response.question_type_analysis 获取数据
        if (response && response.question_type_analysis) {
          this.questionTypeAnalysisWithStudentsData = {
            question_type_analysis: Array.isArray(response.question_type_analysis) 
              ? response.question_type_analysis 
              : []
          }
        } else {
          this.questionTypeAnalysisWithStudentsData = { question_type_analysis: [] }
        }
        console.log('学生分析数据:', this.questionTypeAnalysisWithStudentsData)
      } catch (error) {
        console.error('获取学生分析数据失败:', error)
        this.questionTypeAnalysisWithStudentsData = { question_type_analysis: [] }
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

