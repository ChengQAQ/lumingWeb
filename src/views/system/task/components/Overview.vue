<template>
  <div v-loading="loading" class="report-content">
    <div class="cards-container">
      <!-- 正确率 -->
      <div class="stat-card card-success">
        <div class="card-icon">✓</div>
        <div class="card-content">
          <div class="stat-value">{{ formatCorrectRate() }}</div>
          <div class="stat-label">最高正确率</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 应考/实考/缺考人数 -->
      <div class="stat-card card-info" @click="handleAbsentStudentsClick">
        <div class="card-icon">👥</div>
        <div class="card-content">
          <div class="stat-value">{{ formatExamCount() }}</div>
          <div class="stat-label">应考/实考/缺考人数</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 平均正确率 -->
      <div class="stat-card card-primary">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <div class="stat-value">{{ formatAvgCorrectRate() }}</div>
          <div class="stat-label">平均正确率</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 最高正确题数 -->
      <div class="stat-card card-success" @click="handleMaxCorrectCountClick">
        <div class="card-icon">⬆️</div>
        <div class="card-content">
          <div class="stat-value">{{ formatMaxCorrectCount() }}</div>
          <div class="stat-label">最高正确题数</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 最低正确题数 -->
      <div class="stat-card card-danger" @click="handleMinCorrectCountClick">
        <div class="card-icon">⬇️</div>
        <div class="card-content">
          <div class="stat-value">{{ formatMinCorrectCount() }}</div>
          <div class="stat-label">最低正确题数</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>
    </div>

    <!-- 最高正确题数学生弹窗 -->
    <el-dialog
      title="最高正确题数学生列表"
      :visible.sync="maxCorrectStudentsDialogVisible"
      width="500px"
      :close-on-click-modal="true"
    >
      <div class="students-list">
        <div v-if="currentMaxCorrectStudents.length === 0" class="no-data">
          暂无数据
        </div>
        <div v-else class="students-names">
          <span
            v-for="(student, index) in currentMaxCorrectStudents"
            :key="student.studentId || index"
            class="student-name"
          >
            {{ student.student_name }}
          </span>
        </div>
      </div>
    </el-dialog>

    <!-- 最低正确题数学生弹窗 -->
    <el-dialog
      title="最低正确题数学生列表"
      :visible.sync="minCorrectStudentsDialogVisible"
      width="500px"
      :close-on-click-modal="true"
    >
      <div class="students-list">
        <div v-if="currentMinCorrectStudents.length === 0" class="no-data">
          暂无数据
        </div>
        <div v-else class="students-names">
          <span
            v-for="(student, index) in currentMinCorrectStudents"
            :key="student.studentId || index"
            class="student-name"
          >
            {{ student.student_name }}
          </span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'Overview',
  props: {
    reportData: {
      type: Object,
      default: () => ({})
    },
    loading: {
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
      maxCorrectStudentsDialogVisible: false, // 最高正确题数学生弹窗显示状态
      minCorrectStudentsDialogVisible: false, // 最低正确题数学生弹窗显示状态
      currentMaxCorrectStudents: [], // 当前显示的最高正确题数学生列表
      currentMinCorrectStudents: [] // 当前显示的最低正确题数学生列表
    }
  },
  computed: {
    statistics() {
      return this.reportData.statistics || {}
    },
    // 题型分析列表
    questionTypeAnalysisList() {
      return this.reportData.question_type_analysis || []
    },
    // 从 props 中获取 allQuestionsSummary
    allQuestionsSummary() {
      return this.questionDetailData?.all_questions_summary || null
    }
  },
  methods: {
    /** 从 reportData 中获取统计数据 */
    getClassDistributionStats() {
      // 从 reportData 中获取 statistics（reportData 来自 getClassDistribution 接口）
      if (this.reportData && this.reportData.statistics) {
        return this.reportData.statistics
      }
      return null
    },
    /** 格式化百分比 */
    formatPercent(value) {
      if (value === null || value === undefined) return '-'
      if (typeof value === 'number') {
        return (value * 100).toFixed(1) + '%'
      }
      return value
    },
    /** 格式化考试人数 */
    formatExamCount() {
      const stats = this.statistics
      const shouldTake = stats.total_students !== undefined ? stats.total_students : '-'
      const actualTake = stats.submitted_students !== undefined ? stats.submitted_students : '-'
      const absent = stats.unsubmitted_students !== undefined ? stats.unsubmitted_students : '-'
      return `${shouldTake}/${actualTake}/${absent}`
    },
    /** 计算正确率 - 从所有题目中找出最高的得分率 */
    formatCorrectRate() {
      const questionAnalysis = this.reportData.question_analysis || []
      if (!questionAnalysis || questionAnalysis.length === 0) {
        return '-'
      }

      // 遍历所有题目，找出最高的得分率
      let maxScoreRate = null
      questionAnalysis.forEach(question => {
        if (question.score_rate !== null && question.score_rate !== undefined) {
          let rate = question.score_rate
          // 如果 score_rate 是百分比（>1），转换为小数
          if (rate > 1) {
            rate = rate / 100
          }
          // 更新最高得分率
          if (maxScoreRate === null || rate > maxScoreRate) {
            maxScoreRate = rate
          }
        }
      })

      if (maxScoreRate === null) {
        return '-'
      }

      return this.formatPercent(maxScoreRate)
    },
    /** 计算平均正确率 - 直接从接口返回的数据中获取总分的得分率 */
    formatAvgCorrectRate() {
      // 优先使用接口返回的 allQuestionsSummary.score_rate（与 QuestionAnalysis.vue 中的逻辑一致）
      if (this.allQuestionsSummary && this.allQuestionsSummary.score_rate !== null && this.allQuestionsSummary.score_rate !== undefined) {
        return this.formatPercent(this.allQuestionsSummary.score_rate)
      }

      // 如果没有找到，从 reportData 中直接获取总分的得分率
      const reportScoreRate = this.reportData.total_score_rate || this.reportData.score_rate
      if (reportScoreRate !== null && reportScoreRate !== undefined) {
        const rate = typeof reportScoreRate === 'number'
          ? (reportScoreRate > 1 ? reportScoreRate / 100 : reportScoreRate)
          : null
        if (rate !== null) {
          return this.formatPercent(rate)
        }
      }

      // 如果还没有找到，从 statistics 中计算（作为备选方案）
      const stats = this.statistics
      const totalMaxScore = stats.total_score || 0
      const totalAvgScore = stats.avg_score || 0
      if (totalMaxScore > 0) {
        return this.formatPercent(totalAvgScore / totalMaxScore)
      }

      return '-'
    },
    /** 格式化最高正确题数 - 从 classDistributionData 或 reportData 中获取 */
    formatMaxCorrectCount() {
      const stats = this.getClassDistributionStats()
      if (!stats) {
        return '-'
      }
      const mostCorrectStudents = stats.most_correct_students || {}
      
      // 从对象中获取第一个学生的 correct_count
      const studentIds = Object.keys(mostCorrectStudents)
      if (studentIds.length > 0) {
        const firstStudent = mostCorrectStudents[studentIds[0]]
        if (firstStudent && firstStudent.correct_count !== null && firstStudent.correct_count !== undefined) {
          return firstStudent.correct_count
        }
      }
      return '-'
    },
    /** 格式化最低正确题数 - 从 classDistributionData 或 reportData 中获取 */
    formatMinCorrectCount() {
      const stats = this.getClassDistributionStats()
      if (!stats) {
        return '-'
      }
      const leastCorrectStudents = stats.least_correct_students || {}
      
      // 从对象中获取第一个学生的 correct_count
      const studentIds = Object.keys(leastCorrectStudents)
      if (studentIds.length > 0) {
        const firstStudent = leastCorrectStudents[studentIds[0]]
        if (firstStudent && firstStudent.correct_count !== null && firstStudent.correct_count !== undefined) {
          return firstStudent.correct_count
        }
      }
      return '-'
    },
    /** 处理最高正确题数点击 */
    handleMaxCorrectCountClick() {
      const stats = this.getClassDistributionStats()
      if (!stats) {
        this.$message.info('暂无数据')
        return
      }
      const mostCorrectStudents = stats.most_correct_students || {}
      
      // 将对象转换为数组
      this.currentMaxCorrectStudents = Object.keys(mostCorrectStudents).map(studentId => ({
        studentId: studentId,
        student_name: mostCorrectStudents[studentId].student_name || `学生${studentId}`,
        correct_count: mostCorrectStudents[studentId].correct_count
      }))
      
      if (this.currentMaxCorrectStudents.length === 0) {
        this.$message.info('暂无数据')
        return
      }
      
      this.maxCorrectStudentsDialogVisible = true
    },
    /** 处理最低正确题数点击 */
    handleMinCorrectCountClick() {
      const stats = this.getClassDistributionStats()
      if (!stats) {
        this.$message.info('暂无数据')
        return
      }
      const leastCorrectStudents = stats.least_correct_students || {}
      
      // 将对象转换为数组
      this.currentMinCorrectStudents = Object.keys(leastCorrectStudents).map(studentId => ({
        studentId: studentId,
        student_name: leastCorrectStudents[studentId].student_name || `学生${studentId}`,
        correct_count: leastCorrectStudents[studentId].correct_count
      }))
      
      if (this.currentMinCorrectStudents.length === 0) {
        this.$message.info('暂无数据')
        return
      }
      
      this.minCorrectStudentsDialogVisible = true
    },
    /** 处理缺考学生点击 */
    handleAbsentStudentsClick() {
      this.$emit('show-absent-students')
    }
  }
}
</script>

<style scoped lang="scss">
.report-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 0;
}

.stat-card {
  flex: 0 0 calc(25% - 15px);
  height: 200px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border-top: 4px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .card-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 48px;
    opacity: 0.15;
    z-index: 1;
  }

  .card-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 16px;
      color: #606266;
      font-weight: 500;
    }

    .stat-sublabel {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e4e7ed;
    }
  }

  .card-bg-decoration {
    position: absolute;
    bottom: -40px;
    right: -40px;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    opacity: 0.1;
    z-index: 0;
  }
}

// 主色卡片 - 蓝色
.card-primary {
  border-top-color: #409eff;
  background: linear-gradient(135deg, #ffffff 0%, #ecf5ff 100%);

  .stat-value {
    color: #409eff;
    text-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
  }

  .card-bg-decoration {
    background: radial-gradient(circle, #409eff 0%, transparent 70%);
  }

  &:hover {
    border-top-color: #66b1ff;
    background: linear-gradient(135deg, #ffffff 0%, #d9ecff 100%);
  }
}

// 成功色卡片 - 绿色
.card-success {
  border-top-color: #67c23a;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);

  .stat-value {
    color: #67c23a;
    text-shadow: 0 2px 4px rgba(103, 194, 58, 0.1);
  }

  .card-bg-decoration {
    background: radial-gradient(circle, #67c23a 0%, transparent 70%);
  }

  &:hover {
    border-top-color: #85ce61;
    background: linear-gradient(135deg, #ffffff 0%, #e1f3d8 100%);
  }
}

// 信息色卡片 - 青色
.card-info {
  border-top-color: #909399;
  background: linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%);

  .stat-value {
    color: #909399;
    text-shadow: 0 2px 4px rgba(144, 147, 153, 0.1);
  }

  .card-bg-decoration {
    background: radial-gradient(circle, #909399 0%, transparent 70%);
  }

  &:hover {
    border-top-color: #a6a9ad;
    background: linear-gradient(135deg, #ffffff 0%, #e9e9eb 100%);
  }
}

// 警告色卡片 - 橙色
.card-warning {
  border-top-color: #e6a23c;
  background: linear-gradient(135deg, #ffffff 0%, #fdf6ec 100%);

  .stat-value {
    color: #e6a23c;
    text-shadow: 0 2px 4px rgba(230, 162, 60, 0.1);
  }

  .card-bg-decoration {
    background: radial-gradient(circle, #e6a23c 0%, transparent 70%);
  }

  &:hover {
    border-top-color: #ebb563;
    background: linear-gradient(135deg, #ffffff 0%, #faecd8 100%);
  }
}

// 危险色卡片 - 红色
.card-danger {
  border-top-color: #f56c6c;
  background: linear-gradient(135deg, #ffffff 0%, #fef0f0 100%);

  .stat-value {
    color: #f56c6c;
    text-shadow: 0 2px 4px rgba(245, 108, 108, 0.1);
  }

  .card-bg-decoration {
    background: radial-gradient(circle, #f56c6c 0%, transparent 70%);
  }

  &:hover {
    border-top-color: #f78989;
    background: linear-gradient(135deg, #ffffff 0%, #fde2e2 100%);
  }
}

// 学生列表弹窗样式
.students-list {
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

// 响应式调整
@media (max-width: 1600px) {
  .stat-card {
    flex: 0 0 calc(20% - 16px);
  }
}

@media (max-width: 1400px) {
  .stat-card {
    height: 180px;
    padding: 20px;
    flex: 0 0 calc(20% - 16px);

    .stat-value {
      font-size: 32px;
    }

    .card-icon {
      font-size: 40px;
    }
  }
}

@media (max-width: 1200px) {
  .stat-card {
    height: 170px;
    padding: 18px;
    flex: 0 0 calc(25% - 15px);

    .stat-value {
      font-size: 30px;
    }

    .stat-label {
      font-size: 14px;
    }

    .card-icon {
      font-size: 36px;
      top: 15px;
      right: 15px;
    }
  }
}

@media (max-width: 992px) {
  .cards-container {
    gap: 16px;
    margin: 0 -8px;
  }

  .stat-card {
    height: 160px;
    padding: 16px;
    flex: 0 0 calc(33.333% - 11px);

    .stat-value {
      font-size: 28px;
    }

    .stat-label {
      font-size: 13px;
    }

    .card-icon {
      font-size: 32px;
    }
  }
}

@media (max-width: 768px) {
  .cards-container {
    gap: 12px;
    margin: 0 -6px;
  }

  .stat-card {
    height: 150px;
    padding: 14px;
    flex: 0 0 calc(50% - 6px);

    .stat-value {
      font-size: 26px;
    }

    .stat-label {
      font-size: 12px;
    }

    .card-icon {
      font-size: 28px;
      top: 12px;
      right: 12px;
    }

    .card-bg-decoration {
      width: 120px;
      height: 120px;
    }
  }
}

@media (max-width: 576px) {
  .report-content {
    padding: 0 10px;
  }

  .cards-container {
    gap: 10px;
    margin: 0 -5px;
  }

  .stat-card {
    height: auto;
    min-height: 140px;
    padding: 16px;
    flex: 0 0 calc(100% - 10px);

    .stat-value {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
    }

    .stat-sublabel {
      font-size: 11px;
      margin-top: 8px;
      padding-top: 8px;
    }

    .card-icon {
      font-size: 36px;
    }
  }
}
</style>

