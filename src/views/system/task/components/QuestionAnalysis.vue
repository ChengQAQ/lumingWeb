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
      >
        <el-table-column prop="className" label="班级" align="center" width="150" fixed="left"></el-table-column>
        <el-table-column prop="rank" label="名次" align="center" width="80"></el-table-column>

        <!-- 总分列（始终显示） -->
        <el-table-column label="总分" align="center" min-width="180">
          <el-table-column prop="totalScore.avgScore" label="均分" align="center" width="80"></el-table-column>
          <el-table-column prop="totalScore.scoreRate" label="得分率" align="center" width="100">
            <template slot-scope="scope">
              <span :style="getScoreRateStyle(scope.row.totalScore.scoreRate)">
                {{ formatPercent(scope.row.totalScore.scoreRate) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalScore.fullScoreCount" label="满分人数" align="center" width="100">
            <template slot-scope="scope">
              <span class="full-score-count">{{ scope.row.totalScore.fullScoreCount }}</span>
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
              {{ formatScore(scope.row.typeData && scope.row.typeData[typeIndex] && scope.row.typeData[typeIndex].avgScore) }}
            </template>
          </el-table-column>
          <el-table-column :prop="'typeData.' + typeIndex + '.scoreRate'" label="得分率" align="center" width="100">
            <template slot-scope="scope">
              <span :style="getScoreRateStyle(scope.row.typeData && scope.row.typeData[typeIndex] && scope.row.typeData[typeIndex].scoreRate)">
                {{ formatPercent(scope.row.typeData && scope.row.typeData[typeIndex] && scope.row.typeData[typeIndex].scoreRate) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :prop="'typeData.' + typeIndex + '.fullScoreCount'" label="满分人数" align="center" width="100">
            <template slot-scope="scope">
              <span class="full-score-count">{{ (scope.row.typeData && scope.row.typeData[typeIndex] && scope.row.typeData[typeIndex].fullScoreCount) || 0 }}</span>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- 该题型下的所有题目列 -->
        <el-table-column
          v-for="(questionItem, questionIndex) in allQuestionColumns"
          :key="'question-' + questionItem.typeIndex + '-' + questionItem.qIndex"
          :label="'第' + (questionItem.qIndex + 1) + '题'"
          align="center"
          min-width="180"
        >
          <el-table-column :prop="'questions.' + questionItem.question.question_id + '.avgScore'" label="均分" align="center" width="80">
            <template slot-scope="scope">
              {{ formatScore(scope.row.questions && scope.row.questions[questionItem.question.question_id] && scope.row.questions[questionItem.question.question_id].avgScore) }}
            </template>
          </el-table-column>
          <el-table-column :prop="'questions.' + questionItem.question.question_id + '.scoreRate'" label="得分率" align="center" width="100">
            <template slot-scope="scope">
              <span :style="getScoreRateStyle(scope.row.questions && scope.row.questions[questionItem.question.question_id] && scope.row.questions[questionItem.question.question_id].scoreRate)">
                {{ formatPercent(scope.row.questions && scope.row.questions[questionItem.question.question_id] && scope.row.questions[questionItem.question.question_id].scoreRate) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :prop="'questions.' + questionItem.question.question_id + '.fullScoreCount'" label="满分人数" align="center" width="100">
            <template slot-scope="scope">
              <span class="full-score-count">{{ (scope.row.questions && scope.row.questions[questionItem.question.question_id] && scope.row.questions[questionItem.question.question_id].fullScoreCount) || 0 }}</span>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionAnalysis',
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
  computed: {
    // 题型分析列表（根据 question_type_analysis 动态生成）
    questionTypeAnalysisList() {
      const typeAnalysis = this.reportData.question_type_analysis || []
      return typeAnalysis.filter(item => item && item.question_type)
    },
    // 所有题目列的数据（扁平化处理，避免嵌套 v-for）
    allQuestionColumns() {
      const columns = []
      const questionAnalysis = this.reportData.question_analysis || []
      const questionTypeAnalysis = this.reportData.question_type_analysis || []

      questionTypeAnalysis.forEach((typeAnalysis, typeIndex) => {
        const questionType = typeAnalysis.question_type
        const typeQuestions = questionAnalysis.filter(q => q.question_type === questionType)

        typeQuestions.forEach((question, qIndex) => {
          columns.push({
            typeIndex: typeIndex,
            qIndex: qIndex,
            question: question
          })
        })
      })

      return columns
    },
    // 题目分析表格数据
    questionAnalysisTableData() {
      return this.processQuestionAnalysis()
    }
  },
  methods: {
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
      const questionAnalysis = this.reportData.question_analysis || []
      const questionTypeAnalysis = this.reportData.question_type_analysis || []
      const className = this.className || this.reportData.className || ''
      const classRank = this.reportData.classRank || 1

      // 计算总分数据
      let totalAvgScore = 0
      let totalMaxScore = 0
      let totalFullScoreCount = 0

      // 处理每个题目的数据
      const questionsData = {}
      questionAnalysis.forEach(item => {
        const questionId = item.question_id
        const avgScore = item.avg_score || 0
        const maxScore = item.max_score || 0
        const scoreRate = item.score_rate || 0
        const totalStudents = item.total_students || 0

        // 累计总分
        totalAvgScore += avgScore
        totalMaxScore += maxScore
        if (maxScore > 0 && avgScore >= maxScore) {
          totalFullScoreCount += totalStudents
        }

        // 保存题目数据
        questionsData[questionId] = {
          avgScore: avgScore,
          scoreRate: scoreRate,
          fullScoreCount: maxScore > 0 && avgScore >= maxScore ? totalStudents : 0,
          maxScore: maxScore
        }
      })

      // 处理题型数据
      const typeData = []
      questionTypeAnalysis.forEach((typeItem, index) => {
        const questionType = typeItem.question_type
        const avgScore = (typeItem.avg_score !== null && typeItem.avg_score !== undefined) ? typeItem.avg_score : 0
        const maxPossibleScore = (typeItem.max_possible_score !== null && typeItem.max_possible_score !== undefined) ? typeItem.max_possible_score : 0
        const totalScore = (typeItem.total_score !== null && typeItem.total_score !== undefined) ? typeItem.total_score : maxPossibleScore
        const correctRate = typeItem.correct_rate || 0

        // 计算该题型的得分率
        // 优先使用 total_score，如果没有则使用 max_possible_score，最后使用 correct_rate
        let scoreRate = 0
        if (totalScore && totalScore > 0) {
          scoreRate = avgScore / totalScore
        } else if (maxPossibleScore && maxPossibleScore > 0) {
          scoreRate = avgScore / maxPossibleScore
        } else {
          scoreRate = correctRate > 1 ? correctRate / 100 : correctRate
        }

        // 计算满分人数（需要从题目数据中统计）
        let fullScoreCount = 0
        const typeQuestions = questionAnalysis.filter(q => q.question_type === questionType)
        typeQuestions.forEach(q => {
          const qMaxScore = q.max_score || 0
          const qAvgScore = q.avg_score || 0
          const qTotalStudents = q.total_students || 0
          if (qMaxScore > 0 && qAvgScore >= qMaxScore) {
            fullScoreCount += qTotalStudents
          }
        })

        typeData[index] = {
          avgScore: parseFloat(avgScore.toFixed(2)),
          scoreRate: scoreRate,
          fullScoreCount: fullScoreCount,
          maxScore: totalScore || maxPossibleScore || 0
        }
      })

      // 计算总分的得分率
      let totalScoreRate = null
      if (totalMaxScore > 0) {
        totalScoreRate = totalAvgScore / totalMaxScore
      } else {
        // 如果 totalMaxScore 为0，尝试从 reportData 中获取总分的得分率
        const reportScoreRate = this.reportData.total_score_rate || this.reportData.score_rate
        if (reportScoreRate !== null && reportScoreRate !== undefined) {
          totalScoreRate = typeof reportScoreRate === 'number' 
            ? (reportScoreRate > 1 ? reportScoreRate / 100 : reportScoreRate)
            : null
        }
      }

      return [{
        className: className,
        rank: classRank,
        totalScore: {
          avgScore: parseFloat(totalAvgScore.toFixed(2)),
          scoreRate: totalScoreRate,
          fullScoreCount: totalFullScoreCount
        },
        typeData: typeData,
        questions: questionsData
      }]
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
  ::v-deep .el-table__fixed {
    height: 92% !important;
  }
}
</style>

