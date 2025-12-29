<template>
  <div class="app-container">
    <div class="tabs-container">
      <el-tabs v-model="activeTab" class="report-tabs">
        <!-- 总计 Tab -->
        <el-tab-pane label="总计" name="overview">
          <Overview
            :exam-statistics-data="examStatisticsData"
            :class-id-to-name-map="classIdToNameMap"
            :loading="statisticsLoading"
          />
        </el-tab-pane>

        <!-- 题目分析 Tab -->
        <el-tab-pane label="题目分析" name="analysis">
          <QuestionAnalysis
            :loading="loading"
            :active="activeTab === 'analysis'"
            :exam-id="currentExamId"
            :class-ids="selectedClassId ? [String(selectedClassId)] : []"
            :class-id-to-name-map="classIdToNameMap"
          />
        </el-tab-pane>

        <!-- 学生分布 Tab -->
        <el-tab-pane label="学生分布" name="distribution">
          <StudentDistribution
            ref="studentDistribution"
            :report-data="reportData"
            :class-name="className"
            :loading="loading"
            :exam-id="currentExamId"
            :class-id="$route.query.class_id"
            :task-group-id="$route.query.task_group_id"
            :active="activeTab === 'distribution'"
            :class-ids="selectedClassId ? [String(selectedClassId)] : []"
          />
        </el-tab-pane>
      </el-tabs>
      <!-- 科目下拉框、班级下拉框和统计下拉框 -->
      <div class="subject-select-wrapper">
        <el-select
          v-model="selectedSubject"
          placeholder="选择科目"
          size="small"
          style="width: 200px; margin-right: 10px;"
          v-if="examsWithDetailScore && examsWithDetailScore.length > 0"
          @change="handleSubjectChange"
        >
          <el-option
            v-for="(exam, index) in examsWithDetailScore"
            :key="exam.exam_id || index"
            :label="exam.subject_name"
            :value="exam.subject_name"
          >
          </el-option>
        </el-select>
        <el-select
          v-model="selectedClassId"
          placeholder="选择班级"
          clearable
          size="small"
          style="width: 200px; margin-right: 10px;"
          v-show="activeTab !== 'overview' && classOptions && classOptions.length > 0"
          @change="handleClassChange"
        >
          <el-option
            v-for="classOption in classOptions"
            :key="classOption.deptId"
            :label="classOption.deptName"
            :value="classOption.deptId"
          >
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- 缺考学生弹窗 -->
    <el-dialog
      title="缺考学生列表"
      :visible.sync="absentStudentsDialogVisible"
      width="600px"
      :close-on-click-modal="true"
    >
      <div v-loading="loadingStudents" class="absent-students-list">
        <div v-if="absentStudents.length === 0" class="no-data">
          暂无缺考学生
        </div>
        <div v-else class="students-names">
          <span
            v-for="(student, index) in absentStudents"
            :key="student.id || index"
            class="student-name"
          >
            {{ student.name || `学生${student.id}` }}
          </span>
        </div>
      </div>
    </el-dialog>

    <!-- 批改率弹窗 -->
    <el-dialog
      title="批改率"
      :visible.sync="correctionRateDialogVisible"
      width="600px"
      :close-on-click-modal="true"
    >
      <div v-loading="loadingCorrectionRate" class="correction-rate-table">
        <el-table
          :data="correctionRateData"
          border
          style="width: 100%"
        >
          <el-table-column prop="className" label="班级" align="center" width="200"></el-table-column>
          <el-table-column prop="submissionRate" label="提交率" align="center">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.submissionRateColor }">
                {{ scope.row.submissionRate }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="correctionRate" label="批改率" align="center">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.correctionRateColor }">
                {{ scope.row.correctionRate }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getClassDistribution } from '@/api/system/task'
import { getUserInfos, listClass } from '@/api/system/teacher'
import { listDepts, batchQuery } from '@/api/system/dept'
import StudentDistribution from './StudentDistribution.vue'
import Overview from './Overview.vue'
import QuestionAnalysis from './QuestionAnalysis.vue'
import { getExamStatistics } from '@/api/system/exam'

export default {
  name: 'TaskReport',
  components: {
    StudentDistribution,
    Overview,
    QuestionAnalysis
  },
  data() {
    return {
      loading: false,
      reportData: {},
      lastClassId: null,
      lastTaskGroupId: null,
      absentStudentsDialogVisible: false,
      absentStudents: [],
      loadingStudents: false,
      correctionRateDialogVisible: false,
      correctionRateData: [],
      loadingCorrectionRate: false,
      activeTab: 'overview', // 当前激活的 tab（默认显示总计）
      className: '', // 班级名称
      classNameLoaded: false, // 标记班级名称是否已加载
      examsWithDetailScore: [], // 从父组件传递的考试数据
      selectedSubject: '', // 选中的科目
      selectedStatistics: '', // 选中的统计项
      statisticsLoading: false, // 统计数据加载状态
      statisticsOptions: [], // 统计选项列表
      examStatisticsData: null, // 考试统计数据
      classIdToNameMap: {}, // 班级ID到班级名称的映射
      classOptions: [], // 班级选项列表（从 batchQuery 获取）
      selectedClassId: null // 选中的班级ID（单选）
    }
  },
  created() {
    // 从 localStorage 获取传递的数据
    this.loadDataFromStorage()

    // 移除 loadClassOptions() 调用，不需要一进入页面就调用
    // this.loadClassOptions()
    this.loadReportData()
  },
  activated() {
    // 页面被激活时（从缓存中恢复），检查参数是否变化
    const classId = this.$route.query.class_id
    const taskGroupId = this.$route.query.task_group_id
    const lastClassId = this.lastClassId
    const lastTaskGroupId = this.lastTaskGroupId

    // 如果参数有变化，重新加载数据
    if (classId !== lastClassId || taskGroupId !== lastTaskGroupId) {
      this.lastClassId = classId
      this.lastTaskGroupId = taskGroupId
      this.loadReportData()
    }
  },
  mounted() {
  },
  methods: {
    /** 从 localStorage 加载数据 */
    loadDataFromStorage() {
      const storedData = localStorage.getItem('examsWithDetailScore')
      if (storedData) {
        try {
          this.examsWithDetailScore = JSON.parse(storedData)
          // 如果有数据，默认选中第一个科目
          if (this.examsWithDetailScore.length > 0) {
            this.selectedSubject = this.examsWithDetailScore[0].subject_name || this.examsWithDetailScore[0].subjectName || ''
          }
        } catch (e) {
          console.error('解析传递的数据失败:', e)
          // 如果解析失败，清除无效数据
          localStorage.removeItem('examsWithDetailScore')
        }
      }
    },
    /** 加载报告数据 */
    loadReportData() {
      if (this.examsWithDetailScore && this.examsWithDetailScore.length > 0) {
        // 考试报告模式，不需要加载旧的报告数据
        this.reportData = {}
        return
      }

      // 兼容旧逻辑：如果有 classId 和 taskGroupId，则调用旧接口
      const classId = this.$route.query.class_id
      const taskGroupId = this.$route.query.task_group_id

      if (!classId || !taskGroupId) {
        // 不再显示错误提示，直接返回
        return
      }

      // 检查班级ID是否变化（在更新之前检查）
      const classIdChanged = this.lastClassId && this.lastClassId !== classId

      // 如果班级ID变化了，重置班级名称加载状态
      if (classIdChanged) {
        this.classNameLoaded = false
        this.className = ''
      }

      // 保存当前参数
      this.lastClassId = classId
      this.lastTaskGroupId = taskGroupId

      this.loading = true
      getClassDistribution({
        class_id: classId,
        task_group_id: taskGroupId
      }).then(res => {
        this.reportData = res
        console.log('报告数据:', this.reportData)
        // 数据加载完成后，如果班级ID变化了或还没加载过，重新加载班级名称
        if (classIdChanged || !this.classNameLoaded) {
          this.loadClassName()
        } else {
          // 如果已经加载过且班级ID没变化，优先使用从接口获取的班级名称
          this.className = this.reportData.className || this.className || '当前班级'
        }
        this.loading = false
      }).catch(error => {
        console.error('获取报告数据失败:', error)
        this.$message.error('获取报告数据失败：' + (error.message || '网络错误'))
        this.loading = false
      })
    },
    /** 显示缺考学生弹窗 */
    async showAbsentStudentsDialog() {
      const stats = this.statistics
      const studentIds = stats.unsubmitted_student_ids || []

      if (!studentIds || studentIds.length === 0) {
        this.$message.info('暂无缺考学生')
        return
      }

      this.absentStudentsDialogVisible = true
      this.loadingStudents = true
      this.absentStudents = []

      try {
        console.log(studentIds)
        const response = await getUserInfos(studentIds)

        if (response.code === 200 && response.data) {
          // 处理返回的学生数据
          const studentsData = Array.isArray(response.data) ? response.data : []

          // 创建ID到学生信息的映射
          const studentMap = {}
          studentsData.forEach(student => {
            // 支持多种可能的ID字段名
            const id = student.userId || student.id || student.studentId
            if (id) {
              studentMap[id] = student
            }
          })

          // 根据原始ID顺序构建学生列表
          this.absentStudents = studentIds.map(id => {
            const student = studentMap[id]
            return {
              id: id,
              name: student ? (student.nickName || student.userName || student.name || `学生${id}`) : `学生${id}`
            }
          })
        } else {
          // 如果接口返回格式不符合预期，使用ID作为名称
          this.absentStudents = studentIds.map(id => ({
            id: id,
            name: `学生${id}`
          }))
        }
      } catch (error) {
        console.error('获取缺考学生信息失败:', error)
        this.$message.error('获取缺考学生信息失败')
        // 如果获取失败，至少显示ID
        this.absentStudents = studentIds.map(id => ({
          id: id,
          name: `学生${id}`
        }))
      } finally {
        this.loadingStudents = false
      }
    },
    /** 加载班级选项 */
    loadClassOptions() {
      listClass().then(response => {
        if (response.code === 200) {
          // 处理对象格式的数据，转换为数组格式
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            this.classOptions = Object.keys(response.data).map(key => ({
              deptId: key,
              deptName: response.data[key]
            }))
          } else {
            this.classOptions = response.data || response.rows || []
          }
        } else {
          console.error('获取班级列表失败：', response.msg)
          this.classOptions = []
        }
      }).catch(error => {
        console.error('获取班级列表失败：', error)
        this.classOptions = []
      })
    },
    /** 根据班级ID获取班级名称 */
    async getClassNameById(classId) {
      if (!classId) return '-'
      try {
        // 传递数组格式，与getUserInfos保持一致
        const response = await listDepts([classId])
        if (response.code === 200 && response.data && response.data.length > 0) {
          return response.data[0].deptName || `班级ID: ${classId}`
        }
        return `班级ID: ${classId}`
      } catch (error) {
        console.error('获取班级名称失败:', error)
        return `班级ID: ${classId}`
      }
    },
    /** 显示批改率弹窗 */
    async showCorrectionRateDialog() {
      // 从URL参数中获取class_id
      const classId = this.$route.query.class_id
      const stats = this.statistics

      if (!classId) {
        this.$message.warning('缺少班级ID参数')
        return
      }

      this.correctionRateDialogVisible = true
      this.loadingCorrectionRate = true

      try {
        // 根据class_id获取班级名称（异步）
        const className = await this.getClassNameById(classId)

        // 使用页面已有的统计数据计算
        const totalStudents = stats.total_students || 0
        const submittedStudents = stats.submitted_students || 0
        const gradedStudents = stats.graded_students || 0

        // 计算提交率：提交人数 / 总人数
        const submissionRate = totalStudents > 0
          ? ((submittedStudents / totalStudents) * 100).toFixed(1) + '%'
          : '0%'

        // 计算批改率：已批改人数 / 总人数
        const correctionRate = totalStudents > 0
          ? ((gradedStudents / totalStudents) * 100).toFixed(1) + '%'
          : '0%'

        this.correctionRateData = [{
          classId: classId,
          className: className,
          submissionRate: submissionRate,
          correctionRate: correctionRate,
          submissionRateColor: '#f56c6c', // 红色
          correctionRateColor: '#f56c6c' // 红色
        }]
      } catch (error) {
        console.error('获取班级名称失败:', error)
        this.$message.error('获取班级名称失败')
      } finally {
        this.loadingCorrectionRate = false
      }
    },
    /** 返回上一页 */
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    },

    /** 加载班级名称 */
    async loadClassName() {
      const classId = this.$route.query.class_id

      // 优先使用从接口根据 classId 获取的班级名称，而不是 reportData 中的 className
      // 因为 reportData.className 可能是旧的或错误的数据
      if (classId) {
        try {
          const fetchedClassName = await this.getClassNameById(classId)
          if (fetchedClassName && fetchedClassName !== `班级ID: ${classId}`) {
            this.className = fetchedClassName
          } else {
            // 如果接口获取失败，再尝试使用 reportData 中的班级名称
            this.className = this.reportData?.className || '当前班级'
          }
          this.classNameLoaded = true
        } catch (error) {
          console.error('获取班级名称失败:', error)
          // 如果接口获取失败，再尝试使用 reportData 中的班级名称
          this.className = this.reportData?.className || '当前班级'
          this.classNameLoaded = true
        }
      } else {
        // 如果没有 classId，使用 reportData 中的班级名称
        this.className = this.reportData?.className || '当前班级'
        this.classNameLoaded = true
      }
    },
    /** 处理科目选择变化 */
    handleSubjectChange() {
      // 科目变化时，调用统计接口
      if (this.currentExamId) {
        this.loadExamStatistics()
      }
      // 清空班级选择
      this.selectedClassId = null
      this.classOptions = []
    },
    /** 处理班级选择变化 */
    handleClassChange() {
      // 班级选择变化时，子组件会通过 watch class-ids prop 自动重新加载数据
      console.log('选中的班级ID:', this.selectedClassId)
      // 子组件会自动使用 this.classIds 调用接口，传递 class_ids 字段
    },
    /** 加载考试统计数据 */
    async loadExamStatistics() {
      if (!this.currentExamId) {
        return
      }

      // 如果正在加载，直接返回，避免重复调用
      if (this.statisticsLoading) {
        return
      }

      this.statisticsLoading = true
      try {
        const response = await getExamStatistics(this.currentExamId)

        // 处理接口返回的数据
        if (response) {
          this.examStatisticsData = response
          // 根据返回的数据生成下拉框选项
          // 这里需要根据实际返回的数据结构来调整
          // 暂时先设置为空数组，等待用户确认数据结构
          this.statisticsOptions = []

          // 如果返回的是数组，可以直接使用
          if (Array.isArray(response)) {
            this.statisticsOptions = response.map((item, index) => ({
              label: item.name || item.label || `统计项${index + 1}`,
              value: item.value || item.id || index
            }))
          } else if (response.data && Array.isArray(response.data)) {
            this.statisticsOptions = response.data.map((item, index) => ({
              label: item.name || item.label || `统计项${index + 1}`,
              value: item.value || item.id || index
            }))
          }

          // 获取班级ID列表并调用 batchQuery 接口
          if (response.data && response.data.class_statistics && response.data.class_statistics.class_ids) {
            const classIds = response.data.class_statistics.class_ids
            if (Array.isArray(classIds) && classIds.length > 0) {
              try {
                const batchResponse = await batchQuery(classIds)
                if (batchResponse && batchResponse.data && Array.isArray(batchResponse.data)) {
                  // 存储班级选项列表
                  this.classOptions = batchResponse.data.map(dept => ({
                    deptId: dept.deptId,
                    deptName: dept.deptName
                  }))

                  // 构建班级ID到班级名称的映射
                  this.classIdToNameMap = {}
                  batchResponse.data.forEach(dept => {
                    if (dept.deptId && dept.deptName) {
                      this.classIdToNameMap[dept.deptId] = dept.deptName
                    }
                  })

                  console.log('班级选项列表:', this.classOptions)
                  console.log('班级ID到名称映射:', this.classIdToNameMap)
                }
              } catch (batchError) {
                console.error('批量查询班级信息失败:', batchError)
                // 不显示错误提示，避免干扰用户
              }
            }
          }

          console.log('考试统计数据:', response)
        }
      } catch (error) {
        console.error('获取考试统计数据失败:', error)
        this.$message.error('获取考试统计数据失败：' + (error.message || '网络错误'))
        this.statisticsOptions = []
        this.examStatisticsData = null
      } finally {
        this.statisticsLoading = false
      }
    }
  },
  computed: {
    statistics() {
      return this.reportData.statistics || {}
    },
    // 根据选中的科目获取对应的 exam_id
    currentExamId() {
      if (!this.selectedSubject || !this.examsWithDetailScore || this.examsWithDetailScore.length === 0) {
        return null
      }
      const selectedExam = this.examsWithDetailScore.find(exam =>
        (exam.subject_name || exam.subjectName) === this.selectedSubject
      )
      return selectedExam ? (selectedExam.exam_id || null) : null
    }
  },
  watch: {
    // 监听 currentExamId 变化，调用统计接口
    currentExamId(newVal) {
      if (newVal) {
        this.loadExamStatistics()
      } else {
        this.statisticsOptions = []
        this.selectedStatistics = ''
        this.examStatisticsData = null
      }
    }
  },
}
</script>

<style scoped lang="scss">
.report-header {
  margin-bottom: 20px;
  padding: 0 15px;
}

.report-content {
  min-height: 500px;
  padding: 0 15px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 0 -10px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-top: 3px solid transparent;
  flex: 0 0 calc(20% - 16px);
  min-width: 0;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06);

    .card-icon {
      transform: scale(1.15) rotate(5deg);
    }

    .stat-value {
      transform: scale(1.05);
    }

    .card-bg-decoration {
      opacity: 0.15;
      transform: scale(1.1);
    }
  }

  .card-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 48px;
    opacity: 0.15;
    transition: all 0.4s ease;
    z-index: 1;
  }

  .card-content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .stat-value {
    font-size: 38px;
    font-weight: 800;
    margin-bottom: 10px;
    line-height: 1.2;
    transition: all 0.3s ease;
    letter-spacing: -1px;
  }

  .stat-label {
    font-size: 15px;
    color: #606266;
    margin-bottom: 6px;
    font-weight: 600;
    line-height: 1.4;
  }

  .stat-sublabel {
    font-size: 12px;
    color: #909399;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    font-weight: 500;
  }

  .card-bg-decoration {
    position: absolute;
    bottom: -30px;
    right: -30px;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    z-index: 0;
    opacity: 0.08;
    transition: all 0.5s ease;
    filter: blur(20px);
  }
}

// 主色调卡片 - 蓝色
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
  .report-header {
    padding: 0 10px;
  }

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

// 缺考学生弹窗样式
.absent-students-list {
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
      flex: 0 0 calc(25% - 12px); // 一行4个，每个占25%减去gap
      box-sizing: border-box;
    }
  }
}

.dialog-footer {
  text-align: right;
}

// Tab 样式
.report-tabs {
  width: 100%;

  ::v-deep .el-tabs__header {
    margin-bottom: 20px;
  }

  ::v-deep .el-tabs__item {
    font-size: 16px;
    font-weight: 500;
    padding: 0 30px;
    height: 50px;
    line-height: 50px;
  }

  ::v-deep .el-tabs__active-bar {
    height: 3px;
  }

  ::v-deep .el-tabs__content {
    width: 100%;
  }
}

// Tab 容器样式
.tabs-container {
  position: relative;
  width: 100%;
}

// 科目下拉框样式
.subject-select-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  height: 50px;
}

</style>


