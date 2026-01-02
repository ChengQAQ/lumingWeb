<template>
  <div v-loading="loading || loadingDistribution" class="distribution-content">
    <div class="student-distribution-section">
      <!-- 图表区域 -->
      <div class="distribution-chart-container" v-if="hasDistributionData">
        <div ref="distributionChart" class="distribution-chart" style="width: 100%; height: 500px;"></div>
        <div class="full-score-label" v-if="scoreDistributionData && scoreDistributionData.distribution">
          总题数{{ scoreDistributionData.distribution.total_questions || 0 }}
        </div>
      </div>
      <div v-else class="no-data-container">
        <div class="no-data-text">暂无数据</div>
      </div>

      <!-- 统计信息 -->
      <div class="distribution-stats" v-if="examStatistics">
        <div class="stats-title">统计信息</div>
        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">平均分：</span>
            <span class="stat-value">{{ examStatistics.mean || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">标准差：</span>
            <span class="stat-value">{{ examStatistics.std_dev || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最高分：</span>
            <span class="stat-value">{{ examStatistics.max || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最低分：</span>
            <span class="stat-value">{{ examStatistics.min || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">中位数：</span>
            <span class="stat-value">{{ examStatistics.median || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 分布表格 -->
      <div class="distribution-table-wrapper" v-if="hasDistributionData">
        <el-table
          :data="scoreDistributionTableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
          max-height="400"
        >
          <el-table-column prop="className" label="班级" align="center" width="150" fixed="left"></el-table-column>
          <el-table-column prop="actualCount" label="实考人数" align="center" width="100"></el-table-column>

          <!-- 动态生成分数区间列 -->
          <el-table-column
            v-for="(interval, index) in scoreIntervals"
            :key="'interval-' + index"
            :label="interval.label"
            align="center"
            min-width="120"
          >
            <el-table-column prop="'intervals.' + index + '.segment'" label="本段" align="center" width="60">
              <template slot-scope="scope">
                {{ scope.row.intervals && scope.row.intervals[index] ? scope.row.intervals[index].segment : 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="'intervals.' + index + '.cumulative'" label="累计" align="center" width="60">
              <template slot-scope="scope">
                {{ scope.row.intervals && scope.row.intervals[index] ? scope.row.intervals[index].cumulative : 0 }}
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
      <div v-else class="no-data-container">
        <div class="no-data-text">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getScoreDistribution, getQuestionDistribution } from '@/api/system/task'
import { getScoreDistribution as getExamScoreDistribution } from '@/api/system/exam'
import * as echarts from 'echarts'
import resize from '@/views/dashboard/mixins/resize'

export default {
  name: 'StudentDistribution',
  mixins: [resize],
  props: {
    reportData: {
      type: Object,
      default: () => ({})
    },
    className: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    examId: {
      type: [String, Number],
      default: null
    },
    classId: {
      type: [String, Number],
      default: null
    },
    taskGroupId: {
      type: [String, Number],
      default: null
    },
    // 是否激活（用于控制是否加载数据）
    active: {
      type: Boolean,
      default: false
    },
    classIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      distributionChart: null, // 分布图表实例
      fullScore: 108, // 满分
      distributionStats: null, // 分布统计信息
      scoreDistributionData: null, // 分数分布接口数据
      loadingDistribution: false // 分数分布数据加载状态
    }
  },
  computed: {
    statistics() {
      return this.reportData.statistics || {}
    },
    // 是否有分布数据
    hasDistributionData() {
      // 检查题目分布数据
      if (this.scoreDistributionData && this.scoreDistributionData.distribution &&
        this.scoreDistributionData.distribution.question_count_segments &&
        this.scoreDistributionData.distribution.question_count_segments.length > 0) {
        return true
      }
      // 检查年级分布数据
      if (this.scoreDistributionData && this.scoreDistributionData.grade_distribution &&
        this.scoreDistributionData.grade_distribution.score_segments &&
        this.scoreDistributionData.grade_distribution.score_segments.length > 0) {
        return true
      }
      // 检查班级分布数据
      if (this.scoreDistributionData && this.scoreDistributionData.class_distribution &&
        this.scoreDistributionData.class_distribution.score_segments &&
        this.scoreDistributionData.class_distribution.score_segments.length > 0) {
        return true
      }
      return false
    },
    // 分数区间定义（使用年级数据的区间）
    scoreIntervals() {
      // 优先使用年级分布数据的区间
      if (this.scoreDistributionData && this.scoreDistributionData.grade_distribution &&
        this.scoreDistributionData.grade_distribution.score_segments) {
        const segments = this.scoreDistributionData.grade_distribution.score_segments
        return segments.map(segment => ({
          label: segment.segment_name,
          min: parseInt(segment.segment_range.split('-')[0]) || 0,
          max: parseInt(segment.segment_range.split('-')[1]) || 0
        }))
      }

      // 如果使用的是题目分布数据，使用接口返回的区间
      if (this.scoreDistributionData && this.scoreDistributionData.distribution &&
        this.scoreDistributionData.distribution.question_count_segments) {
        const segments = this.scoreDistributionData.distribution.question_count_segments
        return segments.map(segment => ({
          label: segment.segment_name,
          min: parseInt(segment.segment_range.split('-')[0]) || 0,
          max: parseInt(segment.segment_range.split('-')[1]) || 0
        }))
      }

      // 兼容旧的分数分布数据（class_distribution）
      if (this.scoreDistributionData && this.scoreDistributionData.class_distribution &&
        this.scoreDistributionData.class_distribution.score_segments) {
        const segments = this.scoreDistributionData.class_distribution.score_segments
        return segments.map(segment => ({
          label: segment.segment_name,
          min: parseInt(segment.segment_range.split('-')[0]) || 0,
          max: parseInt(segment.segment_range.split('-')[1]) || 0
        }))
      }

      return []
    },
    // 考试统计信息
    examStatistics() {
      // 优先使用班级分布统计信息（如果选择了班级）
      if (this.scoreDistributionData && this.scoreDistributionData.class_distribution &&
        this.scoreDistributionData.class_distribution.statistics) {
        return this.scoreDistributionData.class_distribution.statistics
      }
      // 如果没有班级统计信息，使用年级分布统计信息
      if (this.scoreDistributionData && this.scoreDistributionData.grade_distribution &&
        this.scoreDistributionData.grade_distribution.statistics) {
        return this.scoreDistributionData.grade_distribution.statistics
      }
      return null
    },
    // 分数分布表格数据
    scoreDistributionTableData() {
      const gradeData = this.calculateGradeDistribution()
      const classData = this.calculateClassDistribution()
      const result = []
      if (gradeData && gradeData.intervals && gradeData.intervals.length > 0) {
        result.push(gradeData)
      }
      if (classData && classData.intervals && classData.intervals.length > 0) {
        result.push(classData)
      }
      return result
    }
  },
  watch: {
    // 监听数据变化，重新调整图表大小
    scoreDistributionTableData: {
      handler() {
        this.$nextTick(() => {
          if (this.distributionChart) {
            this.distributionChart.resize()
            this.updateDistributionChart()
          } else {
            // 如果图表未初始化，初始化它
            this.initDistributionChart()
          }
        })
      },
      deep: true
    },
    // 监听 active 变化，当标签页激活时加载数据
    active: {
      handler(newVal) {
        if (newVal) {
          // 标签页激活时，加载数据
          this.loadScoreDistribution()
        }
      },
      immediate: false
    },
    // 监听 examId 和 classId 变化，重新加载数据（仅在激活状态下）
    examId: {
      handler() {
        if (this.active) {
          this.loadScoreDistribution()
        }
      },
      immediate: false
    },
    classId: {
      handler() {
        if (this.active) {
          this.loadScoreDistribution()
        }
      },
      immediate: false
    },
    taskGroupId: {
      handler() {
        if (this.active) {
          this.loadScoreDistribution()
        }
      },
      immediate: false
    },
    // 监听 classIds 变化，重新加载数据（仅在激活状态下）
    classIds: {
      handler() {
        if (this.active) {
          this.loadScoreDistribution()
        }
      },
      immediate: false
    }
  },
  mounted() {
    // 不再在 mounted 时自动加载数据，等待父组件通知
    // 延迟初始化，确保容器已完全渲染
    this.$nextTick(() => {
      setTimeout(() => {
        this.initDistributionChart()
      }, 100)
    })
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.distributionChart) {
      this.distributionChart.dispose()
      this.distributionChart = null
    }
  },
  methods: {
    /** 初始化分布图表 */
    initDistributionChart() {
      if (!this.$refs.distributionChart) {
        return
      }
      if (this.distributionChart) {
        this.distributionChart.dispose()
        this.distributionChart = null
      }
      // 确保容器有正确的宽度
      const chartContainer = this.$refs.distributionChart
      if (!chartContainer) {
        return
      }

      // 如果容器宽度为0或太小，延迟初始化
      if (chartContainer.offsetWidth === 0 || chartContainer.offsetWidth < 100) {
        setTimeout(() => {
          this.initDistributionChart()
        }, 200)
        return
      }

      // 确保容器样式正确
      if (chartContainer.style.width !== '100%') {
        chartContainer.style.width = '100%'
      }

      this.distributionChart = echarts.init(chartContainer, null, {
        width: chartContainer.offsetWidth || 'auto',
        height: chartContainer.offsetHeight || 500
      })

      this.updateDistributionChart()

      // 确保图表正确调整大小
      this.$nextTick(() => {
        if (this.distributionChart) {
          this.distributionChart.resize({
            width: chartContainer.offsetWidth,
            height: chartContainer.offsetHeight
          })
        }
      })
    },

    /** 处理窗口大小变化 */
    handleResize() {
      if (this.distributionChart) {
        this.distributionChart.resize()
      }
    },

    /** 重写resize方法以支持分布图表 */
    resize() {
      if (this.distributionChart) {
        this.distributionChart.resize()
      }
    },

    /** 更新分布图表 */
    updateDistributionChart() {
      if (!this.distributionChart || !this.hasDistributionData || !this.scoreDistributionTableData || this.scoreDistributionTableData.length === 0) {
        return
      }

      const intervalLabels = this.scoreIntervals.map(interval => interval.label)
      const series = []

      // 年级数据线
      const gradeData = this.scoreDistributionTableData.find(item => item.className === '年级' || !item.className)
      if (gradeData && gradeData.intervals) {
        const gradeValues = gradeData.intervals.map(interval => interval.segment || 0)
        series.push({
          name: '年级',
          type: 'line',
          smooth: true,
          data: gradeValues,
          itemStyle: {
            color: '#409eff'
          },
          lineStyle: {
            color: '#409eff',
            width: 2
          }
        })
      }

      // 班级数据线
      const classData = this.scoreDistributionTableData.find(item => item.className && item.className !== '年级')
      if (classData && classData.intervals) {
        const classValues = classData.intervals.map(interval => interval.segment || 0)
        series.push({
          name: classData.className,
          type: 'line',
          smooth: true,
          data: classValues,
          itemStyle: {
            color: '#67c23a'
          },
          lineStyle: {
            color: '#67c23a',
            width: 2
          }
        })
      }

      if (series.length === 0) {
        return
      }

      // 计算Y轴最大值
      const allValues = series.flatMap(s => s.data)
      const maxValue = Math.max(...allValues, 0)
      const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : null

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: series.map(s => s.name),
          top: 10
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '5%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: intervalLabels,
          name: this.scoreDistributionData && this.scoreDistributionData.distribution ? '答对题目数量' : '分数区间',
          nameLocation: 'middle',
          nameGap: 50,
          axisLabel: {
            rotate: 45,
            interval: 0,
            margin: 15
          }
        },
        yAxis: {
          type: 'value',
          name: '人数',
          min: 0,
          max: yAxisMax
        },
        series: series
      }

      this.distributionChart.setOption(option, true)
    },

    /** 加载分数分布数据 */
    async loadScoreDistribution() {
      // 如果有 examId，调用考试分数分布接口
      if (this.examId) {
        // 如果正在加载，直接返回，避免重复调用
        if (this.loadingDistribution) {
          return
        }
        // 从 classIds 数组中取第一个值作为 class_id
        const classId = this.classIds && this.classIds.length > 0 ? this.classIds[0] : null
        // 如果已经加载过相同 examId 和 classId 的数据，不再重复加载
        if (this.scoreDistributionData && 
            this.scoreDistributionData.exam_id === this.examId &&
            this.scoreDistributionData.class_id === classId) {
          return
        }
        this.loadingDistribution = true
        try {
          const requestData = {
            exam_id: this.examId
          }
          // 如果有 classId，添加到请求参数中
          if (classId) {
            requestData.class_id = classId
          }
          const response = await getExamScoreDistribution(requestData)

          if (response && response.success && response.data) {
            // 保存完整的响应数据，并记录 exam_id 和 class_id
            this.scoreDistributionData = {
              ...response.data,
              exam_id: this.examId,
              class_id: classId
            }

            // 更新满分
            if (response.data.total_score) {
              this.fullScore = response.data.total_score
            }

            // 更新统计信息（优先从 class_distribution 中获取，如果没有则从 grade_distribution 中获取）
            let stats = null
            if (response.data.class_distribution && response.data.class_distribution.statistics) {
              stats = response.data.class_distribution.statistics
            } else if (response.data.grade_distribution && response.data.grade_distribution.statistics) {
              stats = response.data.grade_distribution.statistics
            }
            
            if (stats) {
              this.distributionStats = {
                mean: parseFloat(stats.mean || 0),
                stdDev: parseFloat(stats.std_dev || 0),
                min: parseFloat(stats.min || 0),
                max: parseFloat(stats.max || 0),
                median: parseFloat(stats.median || 0),
                isNormal: true
              }
            }
          } else {
            this.$message.error(response.message || '获取分数分布数据失败')
            this.scoreDistributionData = null
          }
        } catch (error) {
          console.error('获取考试分数分布数据失败:', error)
          this.$message.error('获取分数分布数据失败：' + (error.message || '网络错误'))
          this.scoreDistributionData = null
        } finally {
          this.loadingDistribution = false
        }
        return
      }

      // 原有的逻辑：从 props 获取 class_id 和 task_group_id
      const classId = this.classId
      const taskGroupId = this.taskGroupId

      if (!classId || !taskGroupId) {
        console.warn('缺少 class_id 或 task_group_id 参数，无法加载题目分布数据')
        return
      }

      // 如果已经加载过相同的数据，不再重复加载
      if (this.scoreDistributionData &&
        this.scoreDistributionData.class_id === classId &&
        this.scoreDistributionData.task_group_id === taskGroupId) {
        return
      }

      this.loadingDistribution = true
      try {
        const response = await getQuestionDistribution({
          class_id: classId,
          task_group_id: taskGroupId
        })

        if (response && response.code === 0 && response.distribution) {
          // 保存完整的响应数据
          this.scoreDistributionData = {
            class_id: response.class_id,
            task_group_id: response.task_group_id,
            task_info: response.task_info,
            distribution: response.distribution
          }

          // 更新统计信息
          if (response.distribution.statistics) {
            const stats = response.distribution.statistics
            this.distributionStats = {
              mean: parseFloat(stats.mean_correct || 0),
              stdDev: parseFloat(stats.std_dev || 0),
              isNormal: true
            }
          }
        } else if (response && response.code === 200 && response.data) {
          // 兼容旧的接口格式
          this.scoreDistributionData = response.data

          // 更新满分
          if (response.data.total_score) {
            this.fullScore = response.data.total_score
          }

          // 更新统计信息
          if (response.data.class_distribution && response.data.class_distribution.statistics) {
            const stats = response.data.class_distribution.statistics
            this.distributionStats = {
              mean: parseFloat(stats.mean || 0),
              stdDev: parseFloat(stats.std_dev || 0),
              isNormal: true
            }
          } else if (response.data.grade_distribution && response.data.grade_distribution.statistics) {
            const stats = response.data.grade_distribution.statistics
            this.distributionStats = {
              mean: parseFloat(stats.mean || 0),
              stdDev: parseFloat(stats.std_dev || 0),
              isNormal: true
            }
          }
        }
      } catch (error) {
        console.error('获取题目分布数据失败:', error)
        this.$message.error('获取题目分布数据失败：' + (error.message || '网络错误'))
      } finally {
        this.loadingDistribution = false
      }
    },

    /** 计算年级分数分布数据 */
    calculateGradeDistribution() {
      // 使用接口数据 - 题目分布数据
      if (this.scoreDistributionData && this.scoreDistributionData.distribution) {
        const distribution = this.scoreDistributionData.distribution
        if (distribution.question_count_segments && distribution.question_count_segments.length > 0) {
          const segments = distribution.question_count_segments
          const totalStudents = distribution.total_students || 0

          const intervals = segments.map(segment => ({
            segment: segment.current_count || 0,
            cumulative: segment.cumulative_count || 0
          }))

          return {
            className: this.className || '年级',
            actualCount: totalStudents,
            intervals: intervals
          }
        }
      }

      // 使用年级分布数据（grade_distribution）
      if (this.scoreDistributionData && this.scoreDistributionData.grade_distribution) {
        const distribution = this.scoreDistributionData.grade_distribution
        if (distribution.score_segments && distribution.score_segments.length > 0) {
          const segments = distribution.score_segments
          const totalStudents = distribution.total_students || 0

          const intervals = segments.map(segment => ({
            segment: segment.current_count || 0,
            cumulative: segment.cumulative_count || 0
          }))

          return {
            className: '年级',
            actualCount: totalStudents,
            intervals: intervals
          }
        }
      }

      return null
    },
    /** 计算班级分数分布数据 */
    calculateClassDistribution() {
      // 使用班级分布数据（class_distribution）
      if (this.scoreDistributionData && this.scoreDistributionData.class_distribution) {
        const distribution = this.scoreDistributionData.class_distribution
        if (distribution.score_segments && distribution.score_segments.length > 0) {
          const segments = distribution.score_segments
          const totalStudents = distribution.total_students || 0

          const intervals = segments.map(segment => ({
            segment: segment.current_count || 0,
            cumulative: segment.cumulative_count || 0
          }))

          return {
            className: this.scoreDistributionData.class_name || this.className || '班级',
            actualCount: totalStudents,
            intervals: intervals
          }
        }
      }

      return null
    }
  }
}
</script>

<style scoped lang="scss">
// 学生分布内容样式
.distribution-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  margin: 0;
}

// 学生分布区域
.student-distribution-section {
  background: #fff;
  border-radius: 8px;
}

.distribution-chart-container {
  position: relative;
  width: 100%;

  .distribution-chart {
    background: #fff;
    width: 100% !important;
  }

  .full-score-label {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 14px;
    color: #fff;
    background-color: #f87219;
    font-weight: 500;
    z-index: 10;
    padding: 4px 8px;
    border-radius: 13px;
  }
}

.distribution-description {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;

  p {
    margin: 8px 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 统计信息样式
.distribution-stats {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  .stats-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #409eff;
  }

  .stats-content {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;

    .stat-item {
      display: flex;
      align-items: center;
      font-size: 14px;

      .stat-label {
        color: #606266;
        font-weight: 500;
        margin-right: 8px;
      }

      .stat-value {
        color: #303133;
        font-weight: 600;
        font-size: 16px;
        color: #409eff;
      }
    }
  }
}

.distribution-table-wrapper {
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }

  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;

  ::v-deep .el-table__fixed {
    height: 92%;
  }
}

.no-data-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;

  .no-data-text {
    font-size: 16px;
    color: #909399;
    text-align: center;
  }
}
</style>

