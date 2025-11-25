<template>
  <div class="app-container">

    <el-tabs v-model="activeTab" class="report-tabs">
      <!-- 统计概览 Tab -->
      <el-tab-pane label="统计概览" name="overview">
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
          <div class="stat-card card-success" @click="showCorrectionRateDialog">
            <div class="card-icon">✓</div>
            <div class="card-content">
              <div class="stat-value">{{ formatCorrectionRate() }}</div>
              <div class="stat-label">批改率</div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>

          <!-- 应考/实考/缺考人数 -->
          <div class="stat-card card-info" @click="showAbsentStudentsDialog">
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

          <!-- 班级优秀率 -->
          <div class="stat-card card-primary">
            <div class="card-icon">⭐</div>
            <div class="card-content">
              <div class="stat-value">{{ formatPercent(statistics.excellent_rate) }}</div>
              <div class="stat-label">班级优秀率</div>
              <div class="stat-sublabel" v-if="reportData.gradeExcellentRate !== undefined">
                年级优秀率: {{ formatPercent(reportData.gradeExcellentRate) }}
              </div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>

          <!-- 班级良好率 -->
          <div class="stat-card card-success">
            <div class="card-icon">👍</div>
            <div class="card-content">
              <div class="stat-value">{{ formatPercent(statistics.good_rate) }}</div>
              <div class="stat-label">班级良好率</div>
              <div class="stat-sublabel" v-if="reportData.gradeGoodRate !== undefined">
                年级良好率: {{ formatPercent(reportData.gradeGoodRate) }}
              </div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>

          <!-- 班级及格率 -->
          <div class="stat-card card-warning">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <div class="stat-value">{{ formatPercent(statistics.pass_rate) }}</div>
              <div class="stat-label">班级及格率</div>
              <div class="stat-sublabel" v-if="reportData.gradePassRate !== undefined">
                年级及格率: {{ formatPercent(reportData.gradePassRate) }}
              </div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>

          <!-- 班级不及格率 -->
          <div class="stat-card card-danger">
            <div class="card-icon">⚠️</div>
            <div class="card-content">
              <div class="stat-value">{{ formatPercent(statistics.fail_rate) }}</div>
              <div class="stat-label">班级不及格率</div>
              <div class="stat-sublabel" v-if="reportData.gradeFailRate !== undefined">
                年级不及格率: {{ formatPercent(reportData.gradeFailRate) }}
              </div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>
        </template>

        <!-- 作业类型：只显示指定数据 -->
        <template v-else>
          <!-- 批改率 -->
          <div class="stat-card card-success" @click="showCorrectionRateDialog">
            <div class="card-icon">✓</div>
            <div class="card-content">
              <div class="stat-value">{{ formatCorrectionRate() }}</div>
              <div class="stat-label">批改率</div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>

          <!-- 正确率 -->
          <div class="stat-card card-primary">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <div class="stat-value">{{ formatCorrectRate() }}</div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>

          <!-- 平均正确率 -->
          <div class="stat-card card-info">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <div class="stat-value">{{ formatAvgCorrectRate() }}</div>
              <div class="stat-label">平均正确率</div>
            </div>
            <div class="card-bg-decoration"></div>
          </div>

          <!-- 最高正确题数 -->
          <div class="stat-card card-warning">
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
      </el-tab-pane>

      <!-- 题目分析 Tab -->
      <el-tab-pane label="题目分析" name="analysis">
        <div v-loading="loading" class="question-analysis-content">
          <!-- 颜色图例 -->
          <div class="score-rate-legend">
            <span class="legend-text">得分率越低, 颜色越深</span>
            <div class="legend-gradient">
              <span>0</span>
              <div class="gradient-bar"></div>
              <span>100%</span>
            </div>
          </div>

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
      </el-tab-pane>

      <!-- 题型分析 Tab -->
      <el-tab-pane label="题型分析" name="typeAnalysis">
        <div v-loading="loading" class="type-analysis-content">
          <!-- 班级整体表格 -->
          <div class="type-analysis-section">
            <h3 class="section-title">班级整体</h3>
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
                <el-table-column :label="className || '当前班级'" align="center" min-width="200">
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
          <div class="type-analysis-section">
            <h3 class="section-title">学生明细</h3>
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
                <el-table-column :label="className || '当前班级'" align="center" min-width="200">
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
                  v-for="(student, studentIndex) in studentList"
                  :key="'student-' + studentIndex"
                  :label="student.name"
                  align="center"
                  min-width="200"
                >
                  <el-table-column :prop="'students.' + studentIndex + '.score'" label="得分" align="center" min-width="100">
                    <template slot-scope="scope">
                      <span v-if="scope.row.students && scope.row.students[studentIndex] && scope.row.students[studentIndex].score !== null && scope.row.students[studentIndex].score !== undefined">
                        {{ formatScore(scope.row.students[studentIndex].score) }}
                      </span>
                      <span v-else>--</span>
                    </template>
                  </el-table-column>
                  <el-table-column :prop="'students.' + studentIndex + '.scoreRate'" label="得分率" align="center" min-width="100">
                    <template slot-scope="scope">
                      <span v-if="scope.row.students && scope.row.students[studentIndex] && scope.row.students[studentIndex].scoreRate !== null && scope.row.students[studentIndex].scoreRate !== undefined" :style="getScoreRateStyle(scope.row.students[studentIndex].scoreRate)">
                        {{ formatPercent(scope.row.students[studentIndex].scoreRate) }}
                      </span>
                      <span v-else>--</span>
                    </template>
                  </el-table-column>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

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
import { listDepts} from '@/api/system/dept'

export default {
  name: 'TaskReport',
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
      classOptions: [], // 班级选项列表
      activeTab: 'overview', // 当前激活的 tab
      className: '', // 班级名称
      classNameLoaded: false // 标记班级名称是否已加载
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
  created() {
    this.loadClassOptions()
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
  methods: {
    /** 加载报告数据 */
    loadReportData() {
      const classId = this.$route.query.class_id
      const taskGroupId = this.$route.query.task_group_id

      if (!classId || !taskGroupId) {
        this.$message.error('缺少必要参数：班级ID或批次ID')
        return
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
          // 数据加载完成后，只获取一次班级名称
          if (!this.classNameLoaded) {
            this.loadClassName()
          } else {
            // 如果已经加载过，直接使用 reportData 中的班级名称
            this.className = this.reportData.className || this.className || '当前班级'
          }
        this.loading = false
      }).catch(error => {
        console.error('获取报告数据失败:', error)
        this.$message.error('获取报告数据失败：' + (error.message || '网络错误'))
        this.loading = false
      })
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
    /** 加载班级名称（只调用一次） */
    async loadClassName() {
      // 如果已经加载过，直接返回
      if (this.classNameLoaded) {
        return
      }
      
      // 优先使用 reportData 中的班级名称
      if (this.reportData && this.reportData.className) {
        this.className = this.reportData.className
        this.classNameLoaded = true
        return
      }
      
      const classId = this.$route.query.class_id
      if (classId) {
        try {
          this.className = await this.getClassNameById(classId)
          this.classNameLoaded = true
        } catch (error) {
          console.error('获取班级名称失败:', error)
          this.className = '当前班级'
          this.classNameLoaded = true // 即使失败也标记为已加载，避免重复请求
        }
      } else {
        this.className = '当前班级'
        this.classNameLoaded = true
      }
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
    /** 根据题型获取该题型下的所有题目 */
    getQuestionsByType(questionType) {
      const questionAnalysis = this.reportData.question_analysis || []
      return questionAnalysis.filter(item => item.question_type === questionType)
    },
    /** 处理题目分析数据，生成表格数据 */
    processQuestionAnalysis() {
      const questionAnalysis = this.reportData.question_analysis || []
      const questionTypeAnalysis = this.reportData.question_type_analysis || []
      const className = this.reportData.className || '当前班级'
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

      return [{
        className: className,
        rank: classRank,
        totalScore: {
          avgScore: parseFloat(totalAvgScore.toFixed(2)),
          scoreRate: totalMaxScore > 0 ? (totalAvgScore / totalMaxScore) : 0,
          fullScoreCount: totalFullScoreCount
        },
        typeData: typeData,
        questions: questionsData
      }]
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
    },
    // 题目分析表格数据
    questionAnalysisTableData() {
      return this.processQuestionAnalysis()
    },
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
    // 题型分析表格数据（从 question_type_analysis 获取）
    typeAnalysisTableData() {
      const questionTypeAnalysis = this.reportData.question_type_analysis || []
      
      if (!questionTypeAnalysis || questionTypeAnalysis.length === 0) {
        return []
      }
      
      // 计算总分，用于计算占比
      const totalScore = questionTypeAnalysis.reduce((sum, item) => {
        const score = item.total_score || item.max_possible_score || 0
        return sum + score
      }, 0)
      
      return questionTypeAnalysis.map(item => {
        const questionType = item.question_type || '其他'
        const scoreValue = item.total_score || item.max_possible_score || 0
        const proportion = totalScore > 0 ? (scoreValue / totalScore) : 0
        const difficulty = item.difficulty || 0
        const discrimination = item.discrimination || 0
        const avgScore = item.avg_score || 0
        const maxPossibleScore = item.max_possible_score || item.total_score || 0
        const scoreRate = maxPossibleScore > 0 ? (avgScore / maxPossibleScore) : (item.correct_rate || 0)
        
        return {
          questionType: questionType,
          scoreValue: scoreValue,
          proportion: proportion,
          difficulty: difficulty,
          discrimination: discrimination,
          avgScore: avgScore,
          scoreRate: scoreRate
        }
      })
    },
    // 学生列表（假数据，后续从接口获取）
    studentList() {
      return [
        { name: '岑添澄', id: 'student1' },
        { name: '岑欣芸', id: 'student2' },
        { name: '陈浩', id: 'student3' },
        { name: '陈馨园', id: 'student4' },
        { name: '陈芸', id: 'student5' },
        { name: '储某某', id: 'student6' }
      ]
    },
    // 学生明细表格数据（假数据，后续从接口获取）
    studentDetailTableData() {
      const questionTypeAnalysis = this.reportData.question_type_analysis || []
      
      if (!questionTypeAnalysis || questionTypeAnalysis.length === 0) {
        return []
      }
      
      // 计算总分，用于计算占比
      const totalScore = questionTypeAnalysis.reduce((sum, item) => {
        const score = item.total_score || item.max_possible_score || 0
        return sum + score
      }, 0)
      
      return questionTypeAnalysis.map(item => {
        const questionType = item.question_type || '其他'
        const scoreValue = item.total_score || item.max_possible_score || 0
        const proportion = totalScore > 0 ? (scoreValue / totalScore) : 0
        const difficulty = item.difficulty || 0
        const discrimination = item.discrimination || 0
        const avgScore = item.avg_score || 0
        const maxPossibleScore = item.max_possible_score || item.total_score || 0
        const classScoreRate = maxPossibleScore > 0 ? (avgScore / maxPossibleScore) : (item.correct_rate || 0)
        
        // 生成学生数据（假数据，根据图片中的数据）
        const students = this.studentList.map((student, index) => {
          // 根据题型生成不同的假数据
          let score = 0
          let scoreRate = 0
          
          if (questionType === '单选题') {
            // 单选题的假数据
            const scores = [0, 12, 8, 12, 8, 8] // 对应图片中的数据
            score = scores[index] || 0
            scoreRate = scoreValue > 0 ? (score / scoreValue) : 0
          } else if (questionType === '多选题') {
            // 多选题的假数据
            const scores = [0, 33, 42, 36, 36, 33]
            score = scores[index] || 0
            scoreRate = scoreValue > 0 ? (score / scoreValue) : 0
          } else if (questionType === '填空题') {
            // 填空题的假数据
            const scores = [0, 1, 2, 2, null, 1] // null 表示没有数据，显示 --
            score = scores[index]
            scoreRate = score !== null && scoreValue > 0 ? (score / scoreValue) : null
          } else if (questionType === '解答题') {
            // 解答题的假数据
            const scores = [26, 24, 34, 24, 28, 30]
            score = scores[index] || 0
            scoreRate = scoreValue > 0 ? (score / scoreValue) : 0
          }
          
          return {
            score: score,
            scoreRate: scoreRate
          }
        })
        
        return {
          questionType: questionType,
          scoreValue: scoreValue,
          proportion: proportion,
          difficulty: difficulty,
          discrimination: discrimination,
          classScore: avgScore,
          classScoreRate: classScoreRate,
          students: students
        }
      })
    }
  }
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

// 题目分析内容样式
.question-analysis-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

// 题型分析内容样式
.type-analysis-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  margin: 0;
}

// 题型分析区块样式
.type-analysis-section {
  margin-bottom: 30px;
  
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

// 题型分析表格样式
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
}

// 得分率图例样式
.score-rate-legend {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 15px;

  .legend-text {
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
  }

  .legend-gradient {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;

    span {
      font-size: 12px;
      color: #909399;
      min-width: 30px;
    }

    .gradient-bar {
      flex: 1;
      height: 20px;
      background: linear-gradient(to right,
        rgb(255, 240, 240) 0%,
        rgb(255, 200, 200) 25%,
        rgb(255, 150, 150) 50%,
        rgb(255, 100, 100) 75%,
        rgb(255, 50, 50) 100%
      );
      border-radius: 4px;
      border: 1px solid #e4e7ed;
    }
  }
}

// 题目分析表格样式
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
}
</style>


