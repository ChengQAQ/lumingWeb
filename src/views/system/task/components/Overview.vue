<template>
  <div v-loading="loading" class="report-content">
    <div class="cards-container">
      <!-- 考试类型：显示所有数据 -->
      <template v-if="!isHomework">
        <!-- 本次班级平均分排名 -->
        <div class="stat-card card-primary">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="stat-value">{{ reportData.classRank || '-' }}</div>
            <div class="stat-label">本次班级平均分排名</div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>

        <!-- 批改率 -->
        <div class="stat-card card-success" @click="handleCorrectionRateClick">
          <div class="card-icon">✓</div>
          <div class="card-content">
            <div class="stat-value">{{ formatCorrectionRate() }}</div>
            <div class="stat-label">批改率</div>
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

        <!-- 卷面满分 -->
        <div class="stat-card card-warning">
          <div class="card-icon">💯</div>
          <div class="card-content">
            <div class="stat-value">{{ reportData.fullScore || '-' }}</div>
            <div class="stat-label">卷面满分</div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>

        <!-- 班级最高分 -->
        <div class="stat-card card-primary">
          <div class="card-icon">⬆️</div>
          <div class="card-content">
            <div class="stat-value">{{ statistics.max_score !== null ? statistics.max_score : '-' }}</div>
            <div class="stat-label">班级最高分</div>
            <div class="stat-sublabel" v-if="reportData.gradeMaxScore">
              年级最高分: {{ reportData.gradeMaxScore }}
            </div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>

        <!-- 班级最低分 -->
        <div class="stat-card card-danger">
          <div class="card-icon">⬇️</div>
          <div class="card-content">
            <div class="stat-value">{{ statistics.min_score !== null ? statistics.min_score : '-' }}</div>
            <div class="stat-label">班级最低分</div>
            <div class="stat-sublabel" v-if="reportData.gradeMinScore !== undefined">
              年级最低分: {{ reportData.gradeMinScore }}
            </div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>

        <!-- 班级平均分 -->
        <div class="stat-card card-success">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <div class="stat-value">{{ formatScore(statistics.avg_score) }}</div>
            <div class="stat-label">班级平均分</div>
            <div class="stat-sublabel" v-if="reportData.gradeAvgScore !== undefined">
              年级平均分: {{ formatScore(reportData.gradeAvgScore) }}
            </div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>

        <!-- 班级中位数 -->
        <div class="stat-card card-info">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="stat-value">{{ statistics.median_score !== null ? statistics.median_score : '-' }}</div>
            <div class="stat-label">班级中位数</div>
            <div class="stat-sublabel" v-if="reportData.gradeMedian !== undefined">
              年级中位数: {{ reportData.gradeMedian }}
            </div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>
      </template>

      <!-- 作业类型：显示部分数据 -->
      <template v-else>
        <!-- 正确率 -->
        <div class="stat-card card-success">
          <div class="card-icon">✓</div>
          <div class="card-content">
            <div class="stat-value">{{ formatCorrectRate() }}</div>
            <div class="stat-label">正确率</div>
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
        <div class="stat-card card-success">
          <div class="card-icon">⬆️</div>
          <div class="card-content">
            <div class="stat-value">{{ formatMaxCorrectCount() }}</div>
            <div class="stat-label">最高正确题数</div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>

        <!-- 最低正确题数 -->
        <div class="stat-card card-danger">
          <div class="card-icon">⬇️</div>
          <div class="card-content">
            <div class="stat-value">{{ formatMinCorrectCount() }}</div>
            <div class="stat-label">最低正确题数</div>
          </div>
          <div class="card-bg-decoration"></div>
        </div>
      </template>
    </div>
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
    }
  },
  computed: {
    statistics() {
      return this.reportData.statistics || {}
    },
    // 判断是否为作业类型
    isHomework() {
      // 从路由参数或接口返回数据中获取任务类型
      const taskType = this.$route.query.task_type || this.reportData.task_type || this.reportData.taskType
      // 判断是否为作业类型（作业、自定义作业）
      return taskType === '作业' || taskType === '自定义作业'
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
    /** 格式化考试人数 */
    formatExamCount() {
      const stats = this.statistics
      const shouldTake = stats.total_students !== undefined ? stats.total_students : '-'
      const actualTake = stats.submitted_students !== undefined ? stats.submitted_students : '-'
      const absent = stats.unsubmitted_students !== undefined ? stats.unsubmitted_students : '-'
      return `${shouldTake}/${actualTake}/${absent}`
    },
    /** 计算批改率 */
    formatCorrectionRate() {
      const stats = this.statistics
      // 使用 unsubmitted_students 和 graded_students 计算
      // 已提交学生数 = 总学生数 - 未提交学生数
      // 批改率 = 已批改学生数 / 已提交学生数
      if (stats.total_students === null || stats.total_students === undefined) {
        return '-'
      }
      if (stats.unsubmitted_students === null || stats.unsubmitted_students === undefined) {
        return '-'
      }
      if (stats.graded_students === null || stats.graded_students === undefined) {
        return '-'
      }
      const submittedStudents = stats.total_students - stats.unsubmitted_students
      if (submittedStudents === 0) {
        return '-'
      }
      const rate = stats.graded_students / submittedStudents
      return this.formatPercent(rate)
    },
    /** 计算正确率 */
    formatCorrectRate() {
      const stats = this.statistics
      // 正确率 = 正确题数 / 总题数
      if (stats.total_questions === 0 || stats.total_questions === null || stats.total_questions === undefined) {
        return '-'
      }
      if (stats.correct_questions === null || stats.correct_questions === undefined) {
        return '-'
      }
      const rate = stats.correct_questions / stats.total_questions
      return this.formatPercent(rate)
    },
    /** 计算平均正确率 */
    formatAvgCorrectRate() {
      const stats = this.statistics
      // 平均正确率 = 平均正确题数 / 总题数
      if (stats.total_questions === 0 || stats.total_questions === null || stats.total_questions === undefined) {
        return '-'
      }
      if (stats.avg_correct_questions === null || stats.avg_correct_questions === undefined) {
        return '-'
      }
      const rate = stats.avg_correct_questions / stats.total_questions
      return this.formatPercent(rate)
    },
    /** 格式化最高正确题数 */
    formatMaxCorrectCount() {
      const stats = this.statistics
      if (stats.max_correct_questions !== null && stats.max_correct_questions !== undefined) {
        return stats.max_correct_questions
      }
      return '-'
    },
    /** 格式化最低正确题数 */
    formatMinCorrectCount() {
      const stats = this.statistics
      if (stats.min_correct_questions !== null && stats.min_correct_questions !== undefined) {
        return stats.min_correct_questions
      }
      return '-'
    },
    /** 处理批改率点击 */
    handleCorrectionRateClick() {
      this.$emit('show-correction-rate')
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

