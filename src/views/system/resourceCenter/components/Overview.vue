<template>
  <div v-loading="loading" class="report-content">
    <div class="cards-container">
      <!-- 平均分 -->
      <div class="stat-card card-success" @click="showAverageScoreDialog">
        <div class="card-icon">✓</div>
        <div class="card-content">
          <div class="stat-value">{{ formatAverageScore() }}</div>
          <div class="stat-label">平均分</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 最高分 -->
      <div class="stat-card card-info" @click="showHighestScoreDialog">
        <div class="card-icon">👥</div>
        <div class="card-content">
          <div class="stat-value">{{ formatHighestScore() }}</div>
          <div class="stat-label">最高分</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 最低分 -->
      <div class="stat-card card-primary" @click="showLowestScoreDialog">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <div class="stat-value">{{ formatLowestScore() }}</div>
          <div class="stat-label">最低分</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 中位数 -->
      <div class="stat-card card-success" @click="showMedianScoreDialog">
        <div class="card-icon">⬆️</div>
        <div class="card-content">
          <div class="stat-value">{{ formatMedianScore() }}</div>
          <div class="stat-label">中位数</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>

      <!-- 年级分数段统计 -->
      <div class="stat-card card-danger" @click="showScoreDistributionDialog">
        <div class="card-icon">⬇️</div>
        <div class="card-content">
          <div class="stat-value">{{ formatTotalStudents() }}</div>
          <div class="stat-label">年级总人数</div>
        </div>
        <div class="card-bg-decoration"></div>
      </div>
    </div>

    <!-- 平均分弹窗 -->
    <el-dialog
      title="平均分"
      :visible.sync="averageScoreDialogVisible"
      width="600px"
      :close-on-click-modal="true"
    >
      <el-table :data="averageScoreTableData" border stripe>
        <el-table-column prop="className" label="班级" align="center" width="200"></el-table-column>
        <el-table-column prop="score" label="平均分" align="center"></el-table-column>
      </el-table>
    </el-dialog>

    <!-- 最高分弹窗 -->
    <el-dialog
      title="最高分"
      :visible.sync="highestScoreDialogVisible"
      width="600px"
      :close-on-click-modal="true"
    >
      <el-table :data="highestScoreTableData" border stripe>
        <el-table-column prop="className" label="班级" align="center" width="200"></el-table-column>
        <el-table-column prop="score" label="最高分" align="center"></el-table-column>
      </el-table>
    </el-dialog>

    <!-- 最低分弹窗 -->
    <el-dialog
      title="最低分"
      :visible.sync="lowestScoreDialogVisible"
      width="600px"
      :close-on-click-modal="true"
    >
      <el-table :data="lowestScoreTableData" border stripe>
        <el-table-column prop="className" label="班级" align="center" width="200"></el-table-column>
        <el-table-column prop="score" label="最低分" align="center"></el-table-column>
      </el-table>
    </el-dialog>

    <!-- 中位数弹窗 -->
    <el-dialog
      title="中位数"
      :visible.sync="medianScoreDialogVisible"
      width="600px"
      :close-on-click-modal="true"
    >
      <el-table :data="medianScoreTableData" border stripe>
        <el-table-column prop="className" label="班级" align="center" width="200"></el-table-column>
        <el-table-column prop="score" label="中位数" align="center"></el-table-column>
      </el-table>
    </el-dialog>

    <!-- 年级分数段统计弹窗 -->
    <el-dialog
      title="年级分数段统计"
      :visible.sync="scoreDistributionDialogVisible"
      width="600px"
      :close-on-click-modal="true"
    >
      <el-table :data="scoreDistributionTableData" border stripe>
        <el-table-column prop="scoreRange" label="分数段" align="center" width="200"></el-table-column>
        <el-table-column prop="count" label="人数" align="center"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Overview',
  props: {
    examStatisticsData: {
      type: Object,
      default: null
    },
    classIdToNameMap: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      averageScoreDialogVisible: false,
      highestScoreDialogVisible: false,
      lowestScoreDialogVisible: false,
      medianScoreDialogVisible: false,
      scoreDistributionDialogVisible: false
    }
  },
  computed: {
    classStatistics() {
      return this.examStatisticsData?.data?.class_statistics || {}
    },
    studentStatistics() {
      return this.examStatisticsData?.data?.student_statistics || {}
    },
    scoreDistribution() {
      return this.examStatisticsData?.data?.score_distribution || {}
    },
    scoreDistributionTableData() {
      const data = this.scoreDistribution
      if (!data || typeof data !== 'object') return []
      const scoreRanges = ['0-59', '60-69', '70-79', '80-89', '90-100']
      return scoreRanges.map(range => ({
        scoreRange: range,
        count: data[range] ?? 0
      }))
    },
    averageScoreTableData() {
      return this.formatClassScoreData(this.classStatistics.class_average_score || {})
    },
    highestScoreTableData() {
      return this.formatClassScoreData(this.classStatistics.class_highest_score || {})
    },
    lowestScoreTableData() {
      return this.formatClassScoreData(this.classStatistics.class_lowest_score || {})
    },
    medianScoreTableData() {
      return this.formatClassScoreData(this.classStatistics.class_median_score || {})
    }
  },
  methods: {
    formatScore(value) {
      if (value == null) return '-'
      return typeof value === 'number' ? value.toFixed(2) : value
    },
    formatAverageScore() {
      const avgScore = this.studentStatistics.average_score
      return avgScore != null ? this.formatScore(avgScore) : '-'
    },
    formatHighestScore() {
      const maxScore = this.studentStatistics.max_score
      return maxScore != null ? this.formatScore(maxScore) : '-'
    },
    formatLowestScore() {
      const minScore = this.studentStatistics.min_score
      return minScore != null ? this.formatScore(minScore) : '-'
    },
    formatMedianScore() {
      const data = this.classStatistics.class_median_score || {}
      const scores = Object.values(data).filter(v => v != null)
      if (scores.length === 0) return '-'
      const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length
      return this.formatScore(avg)
    },
    formatTotalStudents() {
      const total = this.studentStatistics.total_students
      return total != null ? total : '-'
    },
    formatClassScoreData(scoreData) {
      if (!scoreData || typeof scoreData !== 'object') return []
      return Object.keys(scoreData).map(classId => {
        const score = scoreData[classId]
        const className = this.classIdToNameMap[classId] || 
                         this.classIdToNameMap[String(classId)] || 
                         this.classIdToNameMap[Number(classId)] || 
                         `班级${classId}`
        return {
          classId,
          className,
          score: score != null ? parseFloat(score).toFixed(2) : '-'
        }
      }).sort((a, b) => {
        // 按照班级ID的数字顺序排序
        const idA = Number(a.classId) || 0
        const idB = Number(b.classId) || 0
        return idA - idB
      })
    },
    showAverageScoreDialog() {
      this.averageScoreDialogVisible = true
    },
    showHighestScoreDialog() {
      this.highestScoreDialogVisible = true
    },
    showLowestScoreDialog() {
      this.lowestScoreDialogVisible = true
    },
    showMedianScoreDialog() {
      this.medianScoreDialogVisible = true
    },
    showScoreDistributionDialog() {
      this.scoreDistributionDialogVisible = true
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

    .card-icon {
      font-size: 36px;
    }
  }
}
</style>

