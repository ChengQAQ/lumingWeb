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

      <!-- 描述文字 -->
      <!-- <div class="distribution-description" v-if="distributionStats">
        <p>平均分: {{ distributionStats.mean }}分, 标准差: {{ distributionStats.stdDev }}分</p>
      </div> -->

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
      // 兼容旧的分数分布数据
      if (this.scoreDistributionData) {
        const distribution = this.scoreDistributionData.class_distribution || this.scoreDistributionData.grade_distribution
        if (distribution && distribution.score_segments && distribution.score_segments.length > 0) {
          return true
        }
      }
      return false
    },
    // 分数区间定义（兼容题目数量分布）
    scoreIntervals() {
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
      
      // 如果没有数据，返回空数组
      return []
    },
    // 分数分布表格数据
    scoreDistributionTableData() {
      const data = this.calculateScoreDistribution()
      if (!data || !data.intervals || data.intervals.length === 0) {
        return []
      }
      return [data]
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

      const data = this.scoreDistributionTableData[0]
      if (!data || !data.intervals) {
        return
      }

      // 准备图表数据
      const intervalLabels = this.scoreIntervals.map(interval => interval.label)
      const actualData = data.intervals.map(interval => interval.segment || 0)
      
      // 计算Y轴最大值，减少空白空间
      const maxValue = Math.max(...actualData, 0)
      const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : null

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '5%',
          top: '10%',
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
          name: this.scoreDistributionData && this.scoreDistributionData.distribution ? '人数' : '人数',
          min: 0,
          max: yAxisMax
        },
        series: [
          {
            name: '实际分布',
            type: 'line',
            smooth: false,
            data: actualData,
            itemStyle: {
              color: '#409eff'
            },
            lineStyle: {
              color: '#409eff',
              width: 2
            }
          }
        ]
      }

      this.distributionChart.setOption(option, true)
    },

    /** 加载分数分布数据 */
    async loadScoreDistribution() {
      // 从 props 获取 class_id 和 task_group_id
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

    /** 计算分数分布数据 */
    calculateScoreDistribution() {
      // 使用接口数据 - 题目分布数据
      if (this.scoreDistributionData && this.scoreDistributionData.distribution) {
        const distribution = this.scoreDistributionData.distribution
        if (distribution.question_count_segments && distribution.question_count_segments.length > 0) {
          const segments = distribution.question_count_segments
          const totalStudents = distribution.total_students || 0
          
          // 将接口数据转换为表格数据格式
          const intervals = segments.map(segment => ({
            segment: segment.current_count || 0,
            cumulative: segment.cumulative_count || 0
          }))

          return {
            className: this.className || '',
            actualCount: totalStudents,
            intervals: intervals
          }
        }
      }
      
      // 兼容旧的分数分布数据
      if (this.scoreDistributionData) {
        const distribution = this.scoreDistributionData.class_distribution || this.scoreDistributionData.grade_distribution
        if (distribution && distribution.score_segments && distribution.score_segments.length > 0) {
          const segments = distribution.score_segments
          const totalStudents = distribution.total_students || 0
          
          // 将接口数据转换为表格数据格式
          const intervals = segments.map(segment => ({
            segment: segment.current_count || 0,
            cumulative: segment.cumulative_count || 0
          }))

          return {
            className: this.className || this.scoreDistributionData.class_name || '',
            actualCount: totalStudents,
            intervals: intervals
          }
        }
      }

      // 如果没有数据，返回null
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

