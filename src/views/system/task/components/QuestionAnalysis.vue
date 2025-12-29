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
        <el-table-column style="background-color: #f5f7fa;" prop="className" label="班级" align="center" width="150" fixed="left"></el-table-column>
        <!-- <el-table-column prop="rank" label="名次" align="center" width="80"></el-table-column> -->

        <!-- 总分列（始终显示） -->
        <el-table-column label="总分" align="center" min-width="180">
          <el-table-column prop="totalScore.avgScore" label="均分" align="center" width="80">
            <template slot-scope="scope">
              {{ formatScore(getAllQuestionsAvgScore()) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalScore.scoreRate" label="得分率" align="center" width="100">
            <template slot-scope="scope">
              <span :style="getScoreRateStyle(getAllQuestionsScoreRate())">
                {{ formatPercent(getAllQuestionsScoreRate()) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalScore.totalQuestions" label="总题数" align="center" width="100">
            <template slot-scope="scope">
              <span class="total-questions-count">{{ getAllQuestionsTotalQuestions() }}</span>
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
          :label="'第' + (questionItem.qIndex + 1) + '题'"
          align="center"
          min-width="180"
        >
          <el-table-column :prop="'questions.' + questionItem.question.question_id + '.avgScore'" label="均分" align="center" width="80">
            <template slot-scope="scope">
              {{ formatScore(getQuestionAvgScore(questionItem.question.question_id)) }}
            </template>
          </el-table-column>
          <el-table-column :prop="'questions.' + questionItem.question.question_id + '.scoreRate'" label="得分率" align="center" width="100">
            <template slot-scope="scope">
              <span :style="getScoreRateStyle(getQuestionScoreRate(questionItem.question.question_id))">
                {{ formatPercent(getQuestionScoreRate(questionItem.question.question_id)) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :prop="'questions.' + questionItem.question.question_id + '.fullScoreCount'" label="满分人数" align="center" width="100">
            <template slot-scope="scope">
              <span 
                class="full-score-count clickable" 
                @click="showFullScoreStudents(questionItem.question.question_id)"
                :title="getFullScoreCount(questionItem.question.question_id) > 0 ? '点击查看满分学生' : ''"
              >
                {{ getFullScoreCount(questionItem.question.question_id) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :prop="'questions.' + questionItem.question.question_id + '.wrongAnswerCount'" label="错误人数" align="center" width="100">
            <template slot-scope="scope">
              <span 
                class="wrong-answer-count clickable" 
                @click="showWrongAnswerStudents(questionItem.question.question_id)"
                :title="getWrongAnswerCount(questionItem.question.question_id) > 0 ? '点击查看错误学生' : ''"
              >
                {{ getWrongAnswerCount(questionItem.question.question_id) }}
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
            {{ student.student_name || student }}
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
            {{ student.student_name || student }}
          </span>
        </div>
      </div>
    </el-dialog>
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
    },
    active: {
      type: Boolean,
      default: false
    },
    questionDetailData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      fullScoreStudentsDialogVisible: false, // 满分学生弹窗显示状态
      currentFullScoreStudents: [], // 当前显示的满分学生列表
      wrongAnswerStudentsDialogVisible: false, // 错误学生弹窗显示状态
      currentWrongAnswerStudents: [], // 当前显示的错误学生列表
      currentQuestionId: null // 当前查看的题目ID
    }
  },
  computed: {
    // 从 props 中获取 questionDetails
    questionDetails() {
      return this.questionDetailData?.question_details || []
    },
    // 从 props 中获取 questionTypeStats
    questionTypeStats() {
      return this.questionDetailData?.question_type_stats || []
    },
    // 从 props 中获取 allQuestionsSummary
    allQuestionsSummary() {
      return this.questionDetailData?.all_questions_summary || null
    },
    // 题型分析列表（优先使用接口返回的 question_type_stats，否则使用 reportData）
    questionTypeAnalysisList() {
      // 优先使用接口返回的 question_type_stats
      if (this.questionTypeStats && this.questionTypeStats.length > 0) {
        return this.questionTypeStats.filter(item => item && item.question_type)
      }
      // 如果没有，使用 reportData 中的数据
      const typeAnalysis = this.reportData.question_type_analysis || []
      return typeAnalysis.filter(item => item && item.question_type)
    },
    // 所有题目列的数据（扁平化处理，避免嵌套 v-for）
    allQuestionColumns() {
      const columns = []
      const questionAnalysis = this.reportData.question_analysis || []
      const questionTypeAnalysis = this.reportData.question_type_analysis || []
      // 用于跟踪已添加的题目ID，避免重复渲染
      const addedQuestionIds = new Set()
      // 全局题目索引，用于显示"第X题"
      let globalQuestionIndex = 0

      // 优先使用接口返回的 questionDetails 顺序（如果已加载）
      // 这样可以确保题目顺序和详细数据顺序一致
      if (this.questionDetails && this.questionDetails.length > 0) {
        // 创建一个 question_id 到 question 的映射
        const questionMap = new Map()
        questionAnalysis.forEach(q => {
          const qId = String(q.question_id)
          if (!questionMap.has(qId)) {
            questionMap.set(qId, q)
          }
        })

        // 按照 questionDetails 的顺序来构建列
        this.questionDetails.forEach((questionDetail, index) => {
          const questionId = String(questionDetail.question_id)
          // 如果题目ID已存在，跳过（避免重复渲染）
          if (addedQuestionIds.has(questionId)) {
            return
          }
          // 从 questionAnalysis 中查找对应的题目信息（用于获取题型等信息）
          const question = questionMap.get(questionId) || questionDetail
          // 查找题型索引
          const questionType = question.question_type || questionDetail.question_type
          const typeIndex = questionTypeAnalysis.findIndex(t => t.question_type === questionType)
          
          // 标记该题目已添加
          addedQuestionIds.add(questionId)
          // 添加到列中，使用全局索引
          columns.push({
            typeIndex: typeIndex >= 0 ? typeIndex : 0,
            qIndex: globalQuestionIndex,
            question: question // 使用 questionAnalysis 中的题目数据，确保有完整的题目信息
          })
          globalQuestionIndex++
        })
      } else {
        // 如果 questionDetails 还未加载，使用原来的逻辑
        questionTypeAnalysis.forEach((typeAnalysis, typeIndex) => {
          const questionType = typeAnalysis.question_type
          const typeQuestions = questionAnalysis.filter(q => q.question_type === questionType)

          typeQuestions.forEach((question, qIndex) => {
            const questionId = String(question.question_id)
            // 如果题目ID已存在，跳过（避免重复渲染）
            if (addedQuestionIds.has(questionId)) {
              return
            }
            // 标记该题目已添加
            addedQuestionIds.add(questionId)
            // 添加到列中，使用全局索引
            columns.push({
              typeIndex: typeIndex,
              qIndex: globalQuestionIndex,
              question: question
            })
            globalQuestionIndex++
          })
        })
      }

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
    },
    /** 获取总分的平均分 */
    getAllQuestionsAvgScore() {
      if (this.allQuestionsSummary && this.allQuestionsSummary.avg_score !== null && this.allQuestionsSummary.avg_score !== undefined) {
        return this.allQuestionsSummary.avg_score
      }
      // 如果没有找到，从 reportData 中获取
      const totalAvgScore = this.reportData.statistics?.avg_score
      return totalAvgScore !== null && totalAvgScore !== undefined ? totalAvgScore : null
    },
    /** 获取总分的得分率 */
    getAllQuestionsScoreRate() {
      if (this.allQuestionsSummary && this.allQuestionsSummary.score_rate !== null && this.allQuestionsSummary.score_rate !== undefined) {
        return this.allQuestionsSummary.score_rate
      }
      // 如果没有找到，从 reportData 中计算
      const stats = this.reportData.statistics || {}
      const totalMaxScore = stats.total_score || 0
      const totalAvgScore = stats.avg_score || 0
      if (totalMaxScore > 0) {
        return totalAvgScore / totalMaxScore
      }
      return this.reportData.total_score_rate || null
    },
    /** 获取总题数 */
    getAllQuestionsTotalQuestions() {
      if (this.allQuestionsSummary && this.allQuestionsSummary.total_questions !== null && this.allQuestionsSummary.total_questions !== undefined) {
        return this.allQuestionsSummary.total_questions
      }
      // 如果没有找到，从 reportData 中获取
      const questionAnalysis = this.reportData.question_analysis || []
      return questionAnalysis.length || 0
    },
    /** 根据索引获取题型的平均分 */
    getTypeAvgScoreByIndex(typeIndex) {
      const typeList = this.questionTypeAnalysisList
      if (typeIndex >= 0 && typeIndex < typeList.length) {
        const typeAnalysis = typeList[typeIndex]
        const questionType = typeAnalysis.question_type
        // 优先使用接口返回的数据
        const typeStat = this.questionTypeStats.find(t => t.question_type === questionType)
        if (typeStat && typeStat.avg_score !== null && typeStat.avg_score !== undefined) {
          return typeStat.avg_score
        }
        // 如果没有找到，从 reportData 中获取
        return typeAnalysis.avg_score || null
      }
      return null
    },
    /** 根据索引获取题型的得分率 */
    getTypeScoreRateByIndex(typeIndex) {
      const typeList = this.questionTypeAnalysisList
      if (typeIndex >= 0 && typeIndex < typeList.length) {
        const typeAnalysis = typeList[typeIndex]
        const questionType = typeAnalysis.question_type
        // 优先使用接口返回的数据
        const typeStat = this.questionTypeStats.find(t => t.question_type === questionType)
        if (typeStat && typeStat.score_rate !== null && typeStat.score_rate !== undefined) {
          return typeStat.score_rate
        }
        // 如果没有找到，从 reportData 中获取并计算
        const avgScore = typeAnalysis.avg_score || 0
        const totalScore = typeAnalysis.total_score || typeAnalysis.max_possible_score || 0
        if (totalScore > 0) {
          return avgScore / totalScore
        }
        return typeAnalysis.correct_rate || null
      }
      return null
    },
    /** 根据索引获取题型的总题数 */
    getTypeTotalQuestionsByIndex(typeIndex) {
      const typeList = this.questionTypeAnalysisList
      if (typeIndex >= 0 && typeIndex < typeList.length) {
        const typeAnalysis = typeList[typeIndex]
        const questionType = typeAnalysis.question_type
        // 优先使用接口返回的数据
        const typeStat = this.questionTypeStats.find(t => t.question_type === questionType)
        if (typeStat && typeStat.total_questions !== null && typeStat.total_questions !== undefined) {
          return typeStat.total_questions
        }
        // 如果没有找到，从 reportData 中获取
        // 统计该题型的题目数量
        const questionAnalysis = this.reportData.question_analysis || []
        const typeQuestions = questionAnalysis.filter(q => q.question_type === questionType)
        return typeQuestions.length || 0
      }
      return 0
    },
    /** 获取指定题目的平均分 */
    getQuestionAvgScore(questionId) {
      if (!questionId) return null
      // 优先使用接口返回的详细数据
      const questionDetail = this.questionDetails.find(q => {
        // 支持精确匹配和字符串匹配
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      if (questionDetail && questionDetail.avg_score !== null && questionDetail.avg_score !== undefined) {
        return questionDetail.avg_score
      }
      // 如果没有找到详细数据，从 reportData 中获取
      const question = this.reportData.question_analysis?.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      return question ? (question.avg_score || null) : null
    },
    /** 获取指定题目的得分率 */
    getQuestionScoreRate(questionId) {
      if (!questionId) return null
      // 优先使用接口返回的详细数据
      const questionDetail = this.questionDetails.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      if (questionDetail && questionDetail.score_rate !== null && questionDetail.score_rate !== undefined) {
        return questionDetail.score_rate
      }
      // 如果没有找到详细数据，从 reportData 中获取
      const question = this.reportData.question_analysis?.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      return question ? (question.score_rate || null) : null
    },
    /** 获取指定题目的满分人数 */
    getFullScoreCount(questionId) {
      if (!questionId) return 0
      // 优先使用接口返回的详细数据
      const questionDetail = this.questionDetails.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      if (questionDetail && questionDetail.full_score_students) {
        // full_score_students 是对象数组，直接返回数组长度
        return Array.isArray(questionDetail.full_score_students) ? questionDetail.full_score_students.length : 0
      }
      // 如果没有找到详细数据，从 reportData 中获取
      const question = this.reportData.question_analysis?.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      if (question) {
        const maxScore = question.max_score || 0
        const avgScore = question.avg_score || 0
        const totalStudents = question.total_students || 0
        return maxScore > 0 && avgScore >= maxScore ? totalStudents : 0
      }
      return 0
    },
    /** 显示满分学生弹窗 */
    showFullScoreStudents(questionId) {
      if (!questionId) return
      
      this.currentQuestionId = questionId
      const questionDetail = this.questionDetails.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      
      if (questionDetail && questionDetail.full_score_students) {
        const fullScoreStudents = Array.isArray(questionDetail.full_score_students) 
          ? questionDetail.full_score_students 
          : []
        // 提取 student_name，如果已经是字符串则直接使用
        this.currentFullScoreStudents = fullScoreStudents.map(student => {
          if (typeof student === 'string') {
            return { student_name: student }
          }
          return student
        })
      } else {
        this.currentFullScoreStudents = []
      }
      
      this.fullScoreStudentsDialogVisible = true
    },
    /** 获取指定题目的错误人数 */
    getWrongAnswerCount(questionId) {
      if (!questionId) return 0
      // 优先使用接口返回的详细数据
      const questionDetail = this.questionDetails.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      if (questionDetail) {
        // 优先使用 wrong_answer_count 字段
        if (questionDetail.wrong_answer_count !== null && questionDetail.wrong_answer_count !== undefined) {
          return questionDetail.wrong_answer_count
        }
        // 如果没有，使用 wrong_answer_students 数组长度
        if (questionDetail.wrong_answer_students) {
          return Array.isArray(questionDetail.wrong_answer_students) ? questionDetail.wrong_answer_students.length : 0
        }
      }
      return 0
    },
    /** 显示错误学生弹窗 */
    showWrongAnswerStudents(questionId) {
      if (!questionId) return
      
      this.currentQuestionId = questionId
      const questionDetail = this.questionDetails.find(q => {
        return q.question_id === questionId || String(q.question_id) === String(questionId)
      })
      
      if (questionDetail && questionDetail.wrong_answer_students) {
        const wrongAnswerStudents = Array.isArray(questionDetail.wrong_answer_students) 
          ? questionDetail.wrong_answer_students 
          : []
        // 提取 student_name，如果已经是字符串则直接使用
        this.currentWrongAnswerStudents = wrongAnswerStudents.map(student => {
          if (typeof student === 'string') {
            return { student_name: student }
          }
          return student
        })
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
  ::v-deep .el-table__fixed {
    height: 92% !important;
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

