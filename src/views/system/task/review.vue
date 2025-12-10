<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <i class="el-icon-arrow-left"></i>
          <span>返回任务列表</span>
        </div>
        <div class="task-info">
          <h2>批阅任务：{{ taskName }}</h2>
          <div class="task-meta">
            <el-tag type="primary">任务ID: {{ currentTaskId || taskId }}</el-tag>
            <el-tag type="success" v-if="studentName">学生: {{ studentName }}</el-tag>
            <el-tag type="info" v-if="subjectName">学科: {{ subjectName }}</el-tag>
            <el-tag type="warning" v-if="totalCount > 0">
              已批阅: {{ reviewedCount }}/{{ totalCount }}题
            </el-tag>
            <el-button 
              type="success" 
              icon="el-icon-check" 
              @click="triggerAutoReview"
              :loading="autoReviewLoading"
              :disabled="!hasUnreviewedRecords"
              class="auto-review-btn"
              size="small"
            >
              自动批阅 (选择题/判断题)
            </el-button>
          </div>
        </div>
        
        <!-- 学生导航 -->
        <div class="student-navigation">
          <div class="student-list-wrapper">
            <div class="student-list">
              <div 
                v-for="student in studentList" 
                :key="student.id"
                class="student-item"
                :class="{ 
                  active: student.id === currentStudentId,
                  disabled: !student.hasRecords
                }"
                @click="student.hasRecords ? switchStudent(student.id) : null"
              >
                {{ student.name }}
                <span v-if="!student.hasRecords" class="no-records-tip">(无记录)</span>
              </div>
            </div>
          </div>
          <div class="navigation-controls">
            <el-button 
              type="text" 
              @click="previousStudent"
              :disabled="!hasPreviousStudent"
              class="nav-btn"
            >
              上一个学生
            </el-button>
            <el-button 
              type="text" 
              @click="nextStudent"
              :disabled="!hasNextStudent"
              class="nav-btn"
            >
              下一个学生
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-loading-spinner></el-loading-spinner>
      <p>正在加载学生做题记录...</p>
    </div>

    <!-- 学生做题记录列表 -->
    <div v-else-if="studentRecords.length > 0" class="records-container">
      <el-table :data="studentRecords" border style="width: 100%">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="题目内容" prop="question_id" min-width="600" align="left">
          <template slot-scope="scope">
            <div class="question-card">
              <!-- 题目头部信息 -->
              <div class="question-header">
                <div class="question-meta">
                  <span class="question-type">{{ getQuestionType(scope.row.question_id) }}</span>
                  <span class="question-difficulty">难度: {{ getQuestionDifficulty(scope.row.question_id) }}</span>
                </div>
                <div class="question-actions">
                  <span class="knowledge-point">{{ getQuestionPoints(scope.row.question_id) }}</span>
                  <el-button
                    type="text"
                    size="small"
                    @click="showAnalysis(scope.row)"
                    class="analysis-btn"
                  >
                    查看解析
                  </el-button>
                </div>
              </div>
              
              <!-- 题目内容 -->
              <div class="question-content">
                <div class="question-text" v-html="processQuestionContent(scope.row.question_id)"></div>
                
                <!-- 选项（如果是选择题） -->
                <div class="question-options" v-if="getQuestionOptions(scope.row.question_id)">
                  <div 
                    v-for="(option, index) in getQuestionOptions(scope.row.question_id)" 
                    :key="index"
                    class="option-item"
                    :class="{ 
                      'correct-option': isCorrectOption(scope.row.question_id, index),
                      'student-answer': isStudentAnswer(scope.row.answer_content, index),
                      'student-answer-correct': isStudentAnswer(scope.row.answer_content, index) && isCorrectOption(scope.row.question_id, index),
                      'student-answer-wrong': isStudentAnswer(scope.row.answer_content, index) && !isCorrectOption(scope.row.question_id, index)
                    }"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
                    <span class="option-content" v-html="processOptionContent(option, index)"></span>
                  </div>
                </div>
                
                <!-- 答案信息 -->
                <div class="answer-section">
                  <span class="answer-info">正确答案: <span v-html="getQuestionAnswer(scope.row.question_id)"></span></span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学生答案" prop="answer_content" width="200" align="center">
          <template slot-scope="scope">
            <div class="answer-card">
              <div class="answer-content">
                <span v-if="scope.row.answer_content" class="answer-text">
                  {{ scope.row.answer_content }}
                </span>
                <span v-else class="no-answer">暂无答案</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="答题时间" prop="answer_time" width="180" align="center">
          <template slot-scope="scope">
            <span>{{ formatTime(scope.row.answer_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="批阅状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag 
              v-if="scope.row.is_correct === null" 
              type="warning" 
              size="small"
              class="status-tag"
            >
              <i class="el-icon-time"></i> 待批阅
            </el-tag>
            <el-tag 
              v-else-if="scope.row.is_correct === 1" 
              type="success" 
              size="small"
              class="status-tag"
            >
              <i class="el-icon-check"></i> 正确
            </el-tag>
            <el-tag 
              v-else 
              type="danger" 
              size="small"
              class="status-tag"
            >
              <i class="el-icon-close"></i> 错误
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="reviewQuestion(scope.row)"
            >
              {{ scope.row.is_correct === null ? '批阅' : '重新批阅' }}
            </el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-magic-stick"
              @click="aiReviewQuestion(scope.row)"
              :loading="scope.row.aiReviewLoading"
              style="margin-left: 5px;"
            >
              AI批阅
            </el-button>
            <!-- <el-button
              size="mini"
              type="info"
              @click="viewQuestionDetail(scope.row)"
            >
              查看详情
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="no-data">
      <el-empty description="暂无做题记录"></el-empty>
    </div>

    <!-- 批阅弹窗 -->
    <el-dialog
      title="批阅题目"
      :visible.sync="reviewDialogVisible"
      width="800px"
      :before-close="handleReviewDialogClose"
      @close="handleReviewDialogClose"
    >
      <div v-if="currentQuestion" class="review-form">
        <div class="question-info">
          <!-- <h4>题目信息</h4> -->
          <!-- <p><strong>题目ID:</strong> {{ currentQuestion.question_id }}</p> -->
          <div class="answer-comparison">
            <div class="answer-item">
              <div class="answer-label">
                <i class="el-icon-user"></i>
                <span>学生答案</span>
              </div>
              <div class="answer-content student-answer">
                {{ currentQuestion.answer_content || '暂无答案' }}
              </div>
            </div>
            <div class="answer-item">
              <div class="answer-label">
                <i class="el-icon-check"></i>
                <span>正确答案</span>
              </div>
              <div class="answer-content correct-answer" v-html="getQuestionAnswer(currentQuestion.question_id)">
              </div>
            </div>
          </div>
          <div class="answer-meta">
            <p><strong>答题时间:</strong> {{ formatTime(currentQuestion.answer_time) }}</p>
          </div>
        </div>
        
        <el-form :model="reviewForm" :rules="reviewRules" ref="reviewForm" label-width="100px" style="line-height: 36px;">
          <el-form-item label="批阅结果" prop="isCorrect">
            <el-radio-group v-model="reviewForm.isCorrect" @change="handleCorrectnessChange">
              <el-radio :label="true">正确</el-radio>
              <el-radio :label="false">错误</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="分数设置" class="score-form-item">
            <div class="score-inputs">
              <div class="score-input-group">
                <label class="score-label">题目总分</label>
                <el-input-number
                  v-model="reviewForm.score"
                  :min="0"
                  :max="100"
                  :precision="1"
                  :step="0.5"
                  placeholder="总分"
                  style="width: 140px;"
                ></el-input-number>
              </div>
              
              <div class="score-separator">
                <i class="el-icon-arrow-right"></i>
              </div>
              
              <div class="score-input-group">
                <label class="score-label">学生得分</label>
                <el-input-number
                  v-model="reviewForm.point"
                  :min="0"
                  :max="reviewForm.score || 100"
                  :precision="1"
                  :step="0.5"
                  placeholder="得分"
                  style="width: 140px;"
                ></el-input-number>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item 
            v-if="reviewForm.isCorrect === false" 
            label="错误原因" 
            prop="error_cause"
          >
            <el-select
              v-model="reviewForm.error_cause"
              placeholder="请选择错误原因"
              clearable
              style="width: 100%;"
            >
              <el-option label="粗心错误" :value="1"></el-option>
              <el-option label="不熟练" :value="2"></el-option>
              <el-option label="不理解" :value="3"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item 
            v-if="reviewForm.isCorrect === false" 
            label="错误评语" 
            prop="origin_cause"
          >
            <el-input
              v-model="reviewForm.origin_cause"
              type="textarea"
              :rows="3"
              placeholder="请输入错误评语"
              maxlength="200"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submittingReview">
          提交批阅
        </el-button>
      </div>
    </el-dialog>

    <!-- 题目详情弹窗 -->
    <el-dialog
      title="题目详情"
      :visible.sync="detailDialogVisible"
      width="800px"
    >
      <div v-if="currentQuestion" class="question-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="题目ID">{{ currentQuestion.question_id }}</el-descriptions-item>
          <el-descriptions-item label="学生ID">{{ currentQuestion.student_id }}</el-descriptions-item>
          <el-descriptions-item label="学科代码">{{ currentQuestion.subject_code }}</el-descriptions-item>
          <el-descriptions-item label="答题时间">{{ formatTime(currentQuestion.answer_time) }}</el-descriptions-item>
          <el-descriptions-item label="学生答案" :span="2">
            <div class="answer-display">
              {{ currentQuestion.answer_content || '暂无答案' }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="题目内容" :span="2">
            <div class="answer-display">
              {{ getQuestionContent(currentQuestion.question_id) }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="题目类型">
            {{ getQuestionType(currentQuestion.question_id) }}
          </el-descriptions-item>
          <el-descriptions-item label="知识点">
            {{ getQuestionPoints(currentQuestion.question_id) }}
          </el-descriptions-item>
          <el-descriptions-item label="批阅状态" :span="2">
            <el-tag v-if="currentQuestion.is_correct === null" type="warning">待批阅</el-tag>
            <el-tag v-else-if="currentQuestion.is_correct === true" type="success">正确</el-tag>
            <el-tag v-else type="danger">错误</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 解析弹窗 -->
    <el-dialog
      title="题目解析"
      :visible.sync="detailVisible"
      width="800px"
      append-to-body
      style="overflow: hidden;"
    >
      <div v-if="currentQuestion" class="analysis-content">
        <!-- 加载状态 -->
        <div v-if="loadingDetail" class="loading-section">
          <div class="loading-spinner">
            <i class="el-icon-loading"></i>
          </div>
          <p>正在加载题目详情...</p>
        </div>
        
        <!-- 题目详情内容 -->
        <div v-else-if="questionDetail" class="detail-content">
          <!-- 题目基本信息 -->
          <div class="question-info">
            <div class="info-row">
              <span class="info-label">题型:</span>
              <span class="info-value">{{ questionDetail.CateName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">来源:</span>
              <span class="info-value">{{ questionDetail.Label }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">难度:</span>
              <span class="info-value">{{ questionDetail.Degree }}</span>
            </div>
          </div>

          <!-- 题目内容 -->
          <div class="question-section">
            <h4>题目内容</h4>
            <div class="question-content" v-html="processQuestionContent(questionDetail.SID)"></div>
          </div>

          <!-- 选项 -->
          <div v-if="questionDetail.Options && questionDetail.Options.length > 0" class="options-section">
            <h4>选项</h4>
            <div
              v-for="(option, index) in questionDetail.Options"
              :key="index"
              class="option-item"
              :class="{ 
                'correct-option': isCorrectOption(questionDetail.SID, index),
                'student-answer': currentQuestion && isStudentAnswer(currentQuestion.answer_content, index),
                'student-answer-correct': currentQuestion && isStudentAnswer(currentQuestion.answer_content, index) && isCorrectOption(questionDetail.SID, index),
                'student-answer-wrong': currentQuestion && isStudentAnswer(currentQuestion.answer_content, index) && !isCorrectOption(questionDetail.SID, index)
              }"
            >
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <span class="option-content" v-html="processOptionContent(option, index)"></span>
            </div>
          </div>

          <!-- 答案 -->
          <div class="answer-section">
            <h4>正确答案</h4>
            <div class="answer-display">
              <span v-if="questionDetail.DisplayAnswer" class="answer-tag correct">
                <span v-html="processAnswerContent(questionDetail.DisplayAnswer)"></span>
              </span>
            </div>
          </div>

          <!-- 解析 -->
          <div v-if="questionDetail.Method" class="analysis-section">
            <h4>解析</h4>
            <div class="analysis-content" v-html="processAnalysisContent(questionDetail.Method)"></div>
          </div>

          <!-- 分析 -->
          <div v-if="questionDetail.Analyse" class="analyse-section">
            <h4>分析</h4>
            <div class="analyse-content" v-html="processAnalysisContent(questionDetail.Analyse)"></div>
          </div>

          <!-- 讨论 -->
          <div v-if="questionDetail.Discuss" class="discuss-section">
            <h4>讨论</h4>
            <div class="discuss-content" v-html="processAnalysisContent(questionDetail.Discuss)"></div>
          </div>

          <!-- 知识点 -->
          <div v-if="questionDetail.Points" class="points-section">
            <h4>知识点</h4>
            <div class="points-content" v-html="formatPoints(questionDetail.Points)"></div>
          </div>
        </div>

        <!-- 加载失败或无数据 -->
        <div v-else class="no-detail">
          <el-empty description="暂无题目详情数据"></el-empty>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getStudentRecords, updateRecord, updateAnswerRecords, gradeText, getUserInfo, getTeacherInfo } from '@/api/system/teacher'
import { pageByStudentIdTask } from '@/api/system/task'
import { getQuestionDetail } from '@/api/system/paper'
import { getGradeAndSubject } from '@/api/system/problems' // 新增导入
import { parseMathFormula } from '@/utils/mathFormula'
import latexRenderer from '@/utils/latexRenderer' // 引入LaTeX渲染器
import { getSubjectNameFromCode } from '@/utils/subjectMapping' // 引入学科映射工具

export default {
  name: 'TaskReview',
  data() {
    return {
      // 路由参数
      taskId: null,
      taskName: '',
      studentId: null,
      studentName: '',
      currentTaskId: null, // 当前使用的任务ID（可能因学生切换而变化）
      
      // 数据相关
      loading: true,
      studentRecords: [],
      totalCount: 0,
      
      // 弹窗相关
      reviewDialogVisible: false,
      detailDialogVisible: false,
      currentQuestion: null,
      
      // 批阅表单
      reviewForm: {
        isCorrect: null,
        point: null,
        score: null,
        error_cause: null,
        origin_cause: null
      },
      reviewRules: {
        isCorrect: [
          { required: true, message: '请选择批阅结果', trigger: 'change' }
        ],
        point: [
          { required: true, message: '请输入题目总分', trigger: 'blur' },
          { type: 'number', min: 0, max: 100, message: '总分范围为0-100分', trigger: 'blur' }
        ],
        score: [
          { required: true, message: '请输入学生得分', trigger: 'blur' },
          { type: 'number', min: 0, message: '得分不能小于0', trigger: 'blur' }
        ],
        error_cause: [
          { 
            validator: (rule, value, callback) => {
              if (this.reviewForm.isCorrect === false && !value) {
                callback(new Error('请选择错误原因'))
              } else {
                callback()
              }
            }, 
            trigger: 'change' 
          }
        ],
        origin_cause: [
          { 
            validator: (rule, value, callback) => {
              if (this.reviewForm.isCorrect === false && !value) {
                callback(new Error('请输入错误评语'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      },
      submittingReview: false,

      // 题目详情数据
      questionDetails: [], // 存储题目详细信息

      // 自动批阅相关
      autoReviewLoading: false,

      // 解析弹窗相关
      detailVisible: false,
      currentQuestion: null,
      questionDetail: null,
      loadingDetail: false,

      // 学科相关
      subjectName: '', // 默认值，后续通过接口获取
      loadingSubject: false, // 学科加载状态
      teacherInfo: null, // 老师信息
      loadingTeacherInfo: false, // 老师信息加载状态

      // AI批阅相关
      aiReviewLoading: false,

      // 学生姓名缓存
      studentNames: {}, // 缓存学生ID对应的姓名
      
      // 学生导航相关
      studentList: [], // 学生列表
      currentStudentId: null, // 当前学生ID
      currentStudentIndex: 0, // 当前学生在列表中的索引
    }
  },
  
  computed: {
    // 是否有未批阅的记录
    hasUnreviewedRecords() {
      return this.studentRecords.some(record => record.is_correct === null)
    },
    
    // 已批阅的题目数量
    reviewedCount() {
      return this.studentRecords.filter(record => record.is_correct !== null).length
    },
    
    // 是否有上一个有做题记录的学生
    hasPreviousStudent() {
      for (let i = this.currentStudentIndex - 1; i >= 0; i--) {
        if (this.studentList[i] && this.studentList[i].hasRecords) {
          return true
        }
      }
      return false
    },
    
    // 是否有下一个有做题记录的学生
    hasNextStudent() {
      for (let i = this.currentStudentIndex + 1; i < this.studentList.length; i++) {
        if (this.studentList[i] && this.studentList[i].hasRecords) {
          return true
        }
      }
      return false
    }
  },
  
  created() {
    // 直接获取路由参数并发送请求，不依赖任何缓存
    const { taskId, taskName, studentId } = this.$route.query
    console.log('页面创建，获取参数:', { taskId, taskName, studentId })
    
    if (taskId) {
      // 强制清空数据
      this.studentRecords = []
      this.questionDetails = []
      this.loading = true
      
      // 设置参数
      this.taskId = taskId
      this.taskName = taskName || '未知任务'
      this.studentId = studentId
      // 异步获取学生姓名
      if (studentId) {
        this.getStudentName(studentId).then(name => {
          this.studentName = name
        })
      }
      
      // 先获取老师信息，再加载学生列表和学生记录
      this.getTeacherInfo().then(() => {
        this.loadStudentList().then(() => {
          this.loadStudentRecords()
        })
      })
    } else {
    //   this.$message.error('缺少任务ID参数')
      this.goBack()
    }
  },

  watch: {
    '$route'(to, from) {
      // 路由变化时重新发送请求
      if (to.query.taskId !== from.query.taskId) {
        console.log('路由变化，重新请求数据:', to.query.taskId)
        this.initPage()
      }
    }
  },
  
  methods: {
    // 初始化页面
    async initPage() {
      // 获取路由参数
      const { taskId, taskName, studentId } = this.$route.query
      console.log('初始化页面参数:', { taskId, taskName, studentId })
      
      if (taskId) {
        // 强制清空之前的数据
        this.studentRecords = []
        this.questionDetails = []
        this.loading = true
        
        this.taskId = taskId
        this.taskName = taskName || '未知任务'
        this.studentId = studentId
        // 异步获取学生姓名
        if (studentId) {
          this.getStudentName(studentId).then(name => {
            this.studentName = name
          })
        }
        
        // 先获取老师信息，再加载做题记录
        await this.getTeacherInfo()
        await this.loadStudentRecords()
      } else {
        // this.$message.error('缺少任务ID参数')
        this.goBack()
      }
    },
    
    // 加载学生做题记录
    async loadStudentRecords() {
      try {
        this.loading = true
        
        // 使用新的API接口，传入当前学生的taskId
        const currentStudent = this.studentList.find(s => s.id === this.currentStudentId)
        const taskIdToUse = this.currentTaskId || (currentStudent ? currentStudent.taskId : this.taskId)
        
        
        // 强制刷新，避免缓存
        const response = await getStudentRecords(taskIdToUse)
        
        if (response.code === 0) {
          // 处理新的数据结构：data.{studentId}.knowledge_points[].questions[].attempts[]
          this.studentRecords = []
          this.totalCount = 0
          
          if (response.data) {
            // 遍历所有学生
            for (const studentId in response.data) {
              const studentData = response.data[studentId]
              
              // 遍历该学生的所有知识点
              if (studentData.knowledge_points && Array.isArray(studentData.knowledge_points)) {
                studentData.knowledge_points.forEach(knowledgePoint => {
                  // 遍历每个知识点的题目
                  if (knowledgePoint.questions && Array.isArray(knowledgePoint.questions)) {
                    knowledgePoint.questions.forEach(question => {
                      // 遍历每个题目的答题记录
                      if (question.attempts && Array.isArray(question.attempts)) {
                        question.attempts.forEach(attempt => {
                          // 构建统一的记录格式
                          const record = {
                            id: attempt.id,
                            student_id: attempt.student_id,
                            question_id: question.question_id,
                            answer_content: attempt.answer_content,
                            answer_time: attempt.answer_time,
                            is_correct: attempt.is_correct,
                            is_judge: attempt.is_judge,
                            knowledge_id: knowledgePoint.knowledge_id,
                            subject_code: knowledgePoint.subject_code,
                            error_cause: attempt.error_cause,
                            has_error: attempt.has_error,
                            origin_cause: attempt.origin_cause,
                            point: attempt.point,
                            question_children: attempt.question_children,
                            score: attempt.score,
                            error_attempts: attempt.error_attempts,
                            error_rate: attempt.error_rate,
                            latest_attempt_time: attempt.latest_attempt_time,
                            total_attempts: attempt.total_attempts
                          }
                          
                          this.studentRecords.push(record)
                          this.totalCount++
                        })
                      }
                    })
                  }
                })
              }
            }
          }
          
          // 使用老师信息中的学科，如果没有则从学生记录中提取
          if (this.teacherInfo && (this.teacherInfo.gradeAndSubject || (this.teacherInfo.grade && this.teacherInfo.subjectNames))) {
            // 如果已经有拼接好的学科信息，直接使用
            if (this.subjectName) {
              console.log('学科信息已从老师信息中获取:', this.subjectName)
            }
          } else if (this.studentRecords.length > 0 && this.studentRecords[0].subject_code) {
            this.subjectName = this.getSubjectNameFromCode(this.studentRecords[0].subject_code)
          } else {
            // 如果都没有学科信息，尝试从接口获取
            await this.getSubjectInfo()
          }
          
          // 如果有学生ID，可以在这里获取学生姓名
          if (this.studentId) {
            this.getStudentName(this.studentId).then(name => {
              this.studentName = name
            })
          }
          
          // 解析题目详情
          await this.loadQuestionDetails()
          
          // 对选择题进行自动批阅
          await this.autoReviewMultipleChoice()
        } else {
          this.$message.error(response.message || '获取做题记录失败')
        }
      } catch (error) {
        console.error('获取做题记录失败:', error)
        this.$message.error('获取做题记录失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    // 获取学生姓名
    async getStudentName(studentId) {
      if (!studentId) return '未知学生'
      
      // 如果缓存中已有，直接返回
      if (this.studentNames[studentId]) {
        return this.studentNames[studentId]
      }
      
      try {
        const response = await getUserInfo(studentId)
        if (response.code === 200 && response.data) {
          // 使用 nickName 作为学生姓名
          const studentName = response.data.nickName || response.data.userName || `学生${studentId}`
          this.studentNames[studentId] = studentName
          return studentName
        }
      } catch (error) {
        console.error('获取学生姓名失败:', error)
      }
      
      // 如果获取失败，返回默认值
      return `学生${studentId}`
    },
    
    // 返回任务列表
    goBack() {
      // 确保跳转到正确的任务列表页面
      this.$router.push({
        path: '/task',
        query: {} // 清空所有查询参数
      })
    },
    
    // 批阅题目
    reviewQuestion(question) {
      this.currentQuestion = question
      this.reviewForm = {
        isCorrect: null,
        point: null,
        score: null,
        error_cause: null,
        origin_cause: null
      }
      this.reviewDialogVisible = true
    },
    
    // 处理批阅结果变化
    handleCorrectnessChange(value) {
      // 如果选择正确，清空错误相关字段
      if (value === true) {
        this.reviewForm.error_cause = null
        this.reviewForm.origin_cause = null
      }
      // 清除相关字段的验证错误
      this.$nextTick(() => {
        if (this.$refs.reviewForm) {
          this.$refs.reviewForm.clearValidate(['error_cause', 'origin_cause'])
        }
      })
    },
    
    // 查看题目详情
    viewQuestionDetail(question) {
      this.currentQuestion = question
      this.detailDialogVisible = true
    },
    
    // 提交批阅
    async submitReview() {
      try {
        const valid = await this.$refs.reviewForm.validate()
        if (!valid) return
        
        this.submittingReview = true
        
        // 确保学科信息已获取
        if (!this.subjectName) {
          console.warn('学科信息未获取，尝试获取老师信息')
          await this.getTeacherInfo()
          if (!this.subjectName) {
            this.$message.error('无法获取学科信息，批阅失败')
            return
          }
        }
        
        // 构建新的批阅数据格式
        const reviewData = {
          student_id: this.currentQuestion.student_id,
          subject: this.getCurrentSubjectName(this.currentQuestion),
          question_answers: [
            {
              sid: this.currentQuestion.question_id,
              answer_content: this.currentQuestion.answer_content || '',
              answer_time: this.formatTimeForAPI(this.currentQuestion.answer_time),
              is_judge: true,
              teacher_judge: 1,
              error_cause: this.reviewForm.error_cause, // 错误原因：1-粗心错误，2-不熟练，3-不理解
              knowledge_id: this.currentQuestion.knowledge_id || '无知识点',
              score: this.reviewForm.score, // 题目总分
              point: this.reviewForm.point, // 学生得分
              origin_cause: this.reviewForm.origin_cause, // 评语
              question_children: 0,
              is_correct: this.reviewForm.isCorrect ? 1 : 0 // 1代表正确，0代表错误
            }
          ]
        }
        
        console.log('提交批阅数据:', reviewData)
        
        // 调用新的批阅接口
        const response = await updateAnswerRecords(reviewData)
        
        if (response.code === 200 || response.code === 0) {
          this.$message.success('批阅成功')
          this.reviewDialogVisible = false
          
          // 批阅成功后重新加载做题记录
          await this.loadStudentRecords()
        } else {
          this.$message.error(response.message || '批阅失败')
        }
        
      } catch (error) {
        console.error('批阅失败:', error)
        this.$message.error('批阅失败：' + (error.message || '网络错误'))
      } finally {
        this.submittingReview = false
      }
    },
    
    // 批量批阅
    batchReview() {
      this.$message.info('批量批阅功能开发中...')
    },
    
    // 关闭批阅弹窗
    handleReviewDialogClose() {
      this.reviewForm = {
        isCorrect: null,
        point: null,
        score: null,
        error_cause: null,
        origin_cause: null
      }
      this.currentQuestion = null
      this.reviewDialogVisible = false
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '-'
      try {
        const date = new Date(timeStr)
        return date.toLocaleString('zh-CN')
      } catch (error) {
        return timeStr
      }
    },

    // 格式化时间为后端需要的格式 YYYY-MM-DD HH:MM:SS
    formatTimeForAPI(timeStr) {
      if (!timeStr) return ''
      try {
        const date = new Date(timeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('时间格式转换失败:', error)
        return timeStr
      }
    },

    // 加载题目详情
    async loadQuestionDetails() {
      try {
        // 确保学科信息已获取
        if (!this.subjectName) {
          console.warn('学科信息未获取，使用默认值')
          this.subjectName = '高中物理'
        }
        
        // 提取所有题目ID
        const questionIds = this.studentRecords.map(record => record.question_id).filter(id => id)
        
        if (questionIds.length === 0) {
          this.questionDetails = []
          return
        }
        
        // 批量获取题目详情，使用sids数组和subject_name
        try {
          const response = await getQuestionDetail({
            subject_name: this.subjectName, // 使用subject_name字段
            sids: questionIds // 传递题目ID数组
          })
          
          console.log('API响应:', response)
          
          // 处理新的响应格式：{questions: [...], question_count: 2, ...}
          if (response && response.questions && Array.isArray(response.questions)) {
            this.questionDetails = response.questions
            console.log('成功获取题目详情:', this.questionDetails)
          } else if (response && Array.isArray(response)) {
            // 兼容直接返回数组的格式
            this.questionDetails = response
          } else if (response && response.data && Array.isArray(response.data)) {
            // 兼容嵌套data格式
            this.questionDetails = response.data
          } else {
            console.warn('API返回数据格式异常，尝试逐个获取')
            // 如果批量获取失败，回退到逐个获取
            await this.loadQuestionDetailsIndividually(questionIds)
          }
        } catch (error) {
          console.error('批量获取题目详情失败，尝试逐个获取:', error)
          // 如果批量获取失败，回退到逐个获取
          await this.loadQuestionDetailsIndividually(questionIds)
        }
        
        console.log('题目详情加载成功:', this.questionDetails)
      } catch (error) {
        console.error('加载题目详情失败:', error)
      }
    },

    // 逐个获取题目详情（备用方法）
    async loadQuestionDetailsIndividually(questionIds) {
      const questionDetails = []
      for (const questionId of questionIds) {
        try {
          const response = await getQuestionDetail({
            subject_name: this.subjectName,
            sids: [questionId] // 单个题目也使用数组格式
          })
          
          // 处理新的响应格式：{questions: [...], question_count: 2, ...}
          if (response && response.questions && Array.isArray(response.questions) && response.questions.length > 0) {
            questionDetails.push(response.questions[0])
          } else if (response && Array.isArray(response) && response.length > 0) {
            questionDetails.push(response[0])
          } else if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            questionDetails.push(response.data[0])
          }
        } catch (error) {
          console.error(`获取题目${questionId}详情失败:`, error)
        }
      }
      this.questionDetails = questionDetails
    },

    // 根据题目ID获取题目内容
    getQuestionContent(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      if (question) {
        // 返回题目的Content字段，并处理HTML标签
        return this.stripHtmlTags(question.Content)
      }
      return questionId
    },

    // 获取题目内容（保留HTML格式）
    getQuestionContentHtml(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      if (question && question.Content) {
        // 处理HTML内容，确保正确显示
        return question.Content.replace(/<sup>/g, '<sup>').replace(/<\/sup>/g, '</sup>')
      }
      return questionId
    },

    // 去除HTML标签的辅助方法
    stripHtmlTags(html) {
      if (!html) return ''
      // 创建一个临时div元素来解析HTML
      const temp = document.createElement('div')
      temp.innerHTML = html
      return temp.textContent || temp.innerText || ''
    },

    // 获取题目类型
    getQuestionType(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      return question ? question.CateName : '未知类型'
    },

    // 获取题目知识点
    getQuestionPoints(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      if (question && question.Points) {
        try {
          // 尝试解析JSON数组格式
          if (question.Points.startsWith('[') && question.Points.endsWith(']')) {
            const pointsArray = JSON.parse(question.Points)
            if (Array.isArray(pointsArray) && pointsArray.length > 0) {
              // 只显示第一个知识点，避免过长
              return pointsArray[0]
            }
          }
          // 如果不是JSON格式，按逗号分割
          return question.Points.split(',')[0]
        } catch (error) {
          console.warn('解析知识点失败:', error)
          // 解析失败时，按逗号分割
          return question.Points.split(',')[0]
        }
      }
      return '无知识点'
    },

    // 获取题目标准答案
    getQuestionAnswer(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      let answer = ''
      
      if (question && question.DisplayAnswer) {
        answer = question.DisplayAnswer
      } else if (question && question.Answers && question.Answers.length > 0) {
        answer = question.Answers.join(', ')
      } else {
        return '暂无答案'
      }
      
      // 处理数学符号和HTML内容
      return this.processAnswerContent(answer)
    },

    // 处理选项内容，移除重复前缀并渲染数学公式
    processOptionContent(content, index) {
      if (!content) return ''
      
      try {
        // 使用latexRenderer的processOptionContent方法
        return latexRenderer.processOptionContent(content, index)
      } catch (error) {
        console.warn('处理选项内容时出错:', error)
        return content || ''
      }
    },

    // 处理答案内容，确保数学符号正确显示
    processAnswerContent(content) {
      if (!content) return ''
      
      try {
        // 先解码HTML实体
        let processedContent = this.decodeHtmlEntities(content)
        
        // 处理图片尺寸，限制最大宽度和高度
        processedContent = this.processImageSize(processedContent)
        
        // 使用latexRenderer处理LaTeX公式
        processedContent = latexRenderer.renderMathFormulas(processedContent)
        
        // 如果内容包含MathJye格式或HTML标签，使用mathFormula处理
        if (processedContent.includes('<span class="MathJye">') || 
            processedContent.includes('<') && processedContent.includes('>')) {
          return parseMathFormula(processedContent)
        }
        
        // 对于纯文本，不进行换行处理，保持原始格式
        return processedContent
      } catch (error) {
        console.warn('处理答案内容时出错:', error)
        return content || ''
      }
    },

    // 获取题目难度
    getQuestionDifficulty(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      return question ? (question.Degree || 0.5).toFixed(1) : '0.5'
    },

    // 获取题目来源
    getQuestionSource(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      return question ? question.Label : ''
    },

    // 获取题目选项（选择题）
    getQuestionOptions(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      if (question && question.Options) {
        return question.Options
      }
      return null
    },

    // 判断是否为正确选项
    isCorrectOption(questionId, optionIndex) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      if (!question) return false
      
      // 优先使用DisplayAnswer
      if (question.DisplayAnswer) {
        const correctAnswer = question.DisplayAnswer.toString().toUpperCase().trim()
        const optionLetter = String.fromCharCode(65 + optionIndex)
        return correctAnswer === optionLetter
      }
      
      // 其次使用Answers数组
      if (question.Answers && question.Answers.length > 0) {
        const correctAnswer = question.Answers[0]
        
        // 如果是数字索引格式（如 "3" 对应选项D）
        if (!isNaN(correctAnswer)) {
          const correctIndex = parseInt(correctAnswer)
          return correctIndex === optionIndex
        }
        
        // 如果是字母格式（如 "C"）
        const optionLetter = String.fromCharCode(65 + optionIndex)
        return correctAnswer.toString().toUpperCase().trim() === optionLetter
      }
      
      return false
    },

    // 判断是否为学生答案
    isStudentAnswer(studentAnswer, optionIndex) {
      if (!studentAnswer) return false
      
      // 将选项索引转换为字母（0->A, 1->B, 2->C, 3->D）
      const optionLetter = String.fromCharCode(65 + optionIndex)
      
      // 直接比较字母（如 "A", "B", "C", "D"）
      return studentAnswer.toUpperCase() === optionLetter.toUpperCase()
    },

    // 自动批阅选择题和判断题
    async autoReviewMultipleChoice() {
      console.log('开始自动批阅选择题和判断题')
      
      // 确保学科信息已获取
      if (!this.subjectName) {
        console.warn('学科信息未获取，尝试获取老师信息')
        await this.getTeacherInfo()
        if (!this.subjectName) {
          console.error('无法获取学科信息，自动批阅失败')
          return
        }
      }
      
      const recordsToUpdate = []
      
      // 遍历所有学生记录
      for (const record of this.studentRecords) {
        // 检查是否为选择题或判断题且未批阅
        if (this.isMultipleChoice(record.question_id) && 
            record.is_correct === null && 
            record.answer_content) {
          
          // 获取正确答案
          const correctAnswer = this.getCorrectAnswer(record.question_id)
          if (correctAnswer) {
            // 判断学生答案是否正确
            const isCorrect = this.compareAnswers(record.answer_content, correctAnswer)
            
            console.log(`题目 ${record.question_id}: 学生答案=${record.answer_content}, 正确答案=${correctAnswer}, 结果=${isCorrect}`)
            
            // 构建新的更新数据格式
            const updateData = {
              student_id: record.student_id,
              subject: this.getCurrentSubjectName(record),
              question_answers: [
                {
                  sid: record.question_id,
                  answer_content: record.answer_content || '',
                  answer_time: this.formatTimeForAPI(record.answer_time),
                  is_judge: true,
                  teacher_judge: 1,
                  error_cause: null,
                  knowledge_id: record.knowledge_id || '无知识点',
                  score: null, // 题目总分
                  point: null, // 学生得分
                  origin_cause: null,
                  question_children: 0,
                  is_correct: isCorrect ? 1 : 0
                }
              ]
            }
            
            recordsToUpdate.push({
              record: record,
              updateData: updateData,
              isCorrect: isCorrect
            })
          }
        }
      }
      
      // 批量提交自动批阅结果
      if (recordsToUpdate.length > 0) {
        console.log(`发现 ${recordsToUpdate.length} 道选择题需要自动批阅`)
        
        for (const { record, updateData, isCorrect } of recordsToUpdate) {
          try {
            const response = await updateAnswerRecords(updateData)
            
            if (response.code === 200 || response.code === 0) {
              // 更新本地记录状态
              record.is_correct = isCorrect ? 1 : 0
              record.is_judge = 1
              console.log(`自动批阅成功: 题目 ${record.question_id}, 结果: ${isCorrect ? '正确' : '错误'}`)
            } else {
              console.error(`自动批阅失败: 题目 ${record.question_id}, 错误: ${response.message}`)
            }
          } catch (error) {
            console.error(`自动批阅异常: 题目 ${record.question_id}, 错误:`, error)
          }
        }
        
        this.$message.success(`已完成 ${recordsToUpdate.length} 道题目（选择题/判断题）的自动批阅`)
      } else {
        console.log('没有需要自动批阅的选择题或判断题')
      }
    },

    // 判断是否为选择题或判断题（可自动批阅的题目）
    isMultipleChoice(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      if (!question) return false
      
      // 检查题目类型和选项
      const isChoiceType = question.CateName && 
        (question.CateName.includes('选择') || 
         question.CateName.includes('单选') || 
         question.CateName.includes('多选'))
      
      const isJudgmentType = question.CateName && 
        (question.CateName.includes('判断') || 
         question.CateName.includes('是非'))
      
      const hasOptions = question.Options && question.Options.length > 0
      
      return isChoiceType || isJudgmentType || hasOptions
    },

    // 获取正确答案
    getCorrectAnswer(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      if (!question) return null
      
      // 优先使用DisplayAnswer
      if (question.DisplayAnswer) {
        return question.DisplayAnswer
      }
      
      // 其次使用Answers数组
      if (question.Answers && question.Answers.length > 0) {
        const answer = question.Answers[0]
        // 如果是数字索引，转换为字母
        if (!isNaN(answer)) {
          return String.fromCharCode(65 + parseInt(answer))
        }
        return answer
      }
      
      return null
    },

    // 比较答案是否正确
    compareAnswers(studentAnswer, correctAnswer) {
      if (!studentAnswer || !correctAnswer) return false
      
      // 规范化判断题答案
      const student = this.normalizeJudgmentAnswer(studentAnswer)
      const correct = this.normalizeJudgmentAnswer(correctAnswer)
      
      // 如果是判断题答案，进行特殊处理
      if (student === 'correct' || student === 'incorrect') {
        return student === correct
      }
      
      // 转换为大写进行比较
      const studentUpper = studentAnswer.toString().toUpperCase().trim()
      const correctUpper = correctAnswer.toString().toUpperCase().trim()
      
      return studentUpper === correctUpper
    },

    // 规范化判断题答案
    normalizeJudgmentAnswer(answer) {
      if (!answer) {
        return null
      }
      
      // 转换为字符串并去除空格
      const normalized = answer.toString().trim().toUpperCase()
      
      // 正确答案关键词：正确/对/√/YES/TRUE/1
      if (/^(正确|对|√|YES|TRUE|1|T)$/i.test(normalized)) {
        return 'correct'
      }
      
      // 错误答案关键词：错误/错/×/NO/FALSE/0/F
      if (/^(错误|错|×|X|NO|FALSE|0|F)$/i.test(normalized)) {
        return 'incorrect'
      }
      
      // 返回原始值（可能是选项字母）
      return normalized
    },

    // 手动触发自动批阅
    async triggerAutoReview() {
      try {
        this.autoReviewLoading = true
        await this.autoReviewMultipleChoice()
      } catch (error) {
        console.error('手动触发自动批阅失败:', error)
        this.$message.error('自动批阅失败：' + (error.message || '网络错误'))
      } finally {
        this.autoReviewLoading = false
      }
    },

    // 获取题目解析
    getQuestionAnalysis(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      return question ? question.Analyse : ''
    },

    // 获取题目讨论
    getQuestionDiscussion(questionId) {
      const question = this.questionDetails.find(q => q.SID === questionId)
      return question ? question.Discuss : ''
    },

    // 处理题目内容（参考addCombinedPaper.vue）
    processQuestionContent(questionId) {
      console.log('处理题目内容 - questionId:', questionId)
      console.log('当前题目详情数据:', this.questionDetails)
      
      const question = this.questionDetails.find(q => q.SID === questionId)
      console.log('找到的题目详情:', question)
      
      if (!question || !question.Content) {
        console.warn('题目详情未找到或内容为空:', questionId)
        return `<div class="no-question-content">
          <i class="el-icon-warning"></i>
          <span>题目内容加载中...</span>
          <div class="question-id-info">题目ID: ${questionId}</div>
        </div>`
      }
      
      let content = this.decodeHtmlEntities(question.Content)
      
      // 处理图片尺寸，限制最大宽度和高度
      content = this.processImageSize(content)
      
      // 处理可编辑答案输入区域
      content = content.replace(
        /<!--BA--><div (?:class="quizPutTag"|class="\\quizPutTag\\") contenteditable="true">\s*(&nbsp;)?<\/div><!--EA-->/g,
        '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
      ).replace(
        /<div class='quizPutTag' contenteditable='true'>&nbsp;<\/div>/g,
        '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
      )
      
      // 使用latexRenderer处理LaTeX公式
      content = latexRenderer.renderMathFormulas(content)
      
      // 处理MathJye格式的数学公式
      return parseMathFormula(content)
    },

    // 处理解析内容，包括MathJye格式
    processAnalysisContent(content) {
      if (!content) return ''
      
      try {
        // 先解码HTML实体
        let processedContent = this.decodeHtmlEntities(content)
        
        // 处理图片尺寸，限制最大宽度和高度
        processedContent = this.processImageSize(processedContent)
        
        // 使用latexRenderer处理LaTeX公式
        processedContent = latexRenderer.renderMathFormulas(processedContent)
        
        // 使用mathFormula处理MathJye格式
        return parseMathFormula(processedContent)
      } catch (error) {
        console.warn('处理解析内容时出错:', error)
        return content || ''
      }
    },

    // 解码HTML实体
    decodeHtmlEntities(text) {
      if (!text) return ''
      const textarea = document.createElement('textarea')
      textarea.innerHTML = text
      return textarea.value
    },

    // 处理图片尺寸，限制最大宽度和高度
    processImageSize(content) {
      if (!content) return ''
      
      // 使用正则表达式匹配所有img标签
      return content.replace(/<img([^>]*)>/gi, (match, attributes) => {
        // 检查是否已经有style属性
        const styleMatch = attributes.match(/style\s*=\s*["']([^"']*)["']/)
        let existingStyle = styleMatch ? styleMatch[1] : ''
        
        // 添加或更新图片尺寸限制样式
        const imageStyle = this.addImageSizeLimit(existingStyle)
        
        if (styleMatch) {
          // 如果已有style属性，替换它
          return match.replace(/style\s*=\s*["'][^"']*["']/, `style="${imageStyle}"`)
        } else {
          // 如果没有style属性，添加一个
          return `<img${attributes} style="${imageStyle}">`
        }
      })
    },

    // 添加图片尺寸限制样式
    addImageSizeLimit(existingStyle) {
      // 解析现有样式
      const styles = {}
      if (existingStyle) {
        existingStyle.split(';').forEach(style => {
          const [property, value] = style.split(':').map(s => s.trim())
          if (property && value) {
            styles[property] = value
          }
        })
      }
      
      // 添加或更新图片尺寸限制
      styles['max-width'] = '100%'
      styles['max-height'] = '300px'
      styles['width'] = 'auto'
      styles['height'] = 'auto'
      styles['object-fit'] = 'contain'
      // styles['display'] = 'block'
      styles['margin'] = '8px auto'
      
      // 将样式对象转换回字符串
      return Object.entries(styles)
        .map(([property, value]) => `${property}: ${value}`)
        .join('; ')
    },

    // 显示解析（参考addCombinedPaper.vue的解析弹窗）
    showAnalysis(record) {
      this.currentQuestion = record
      this.detailVisible = true
      this.loadingDetail = true
      this.questionDetail = null
      
      // 确保学科信息已获取
      if (!this.subjectName) {
        console.warn('学科信息未获取，使用默认值')
        this.subjectName = '高中物理'
      }
      
      // 调用API获取题目详情，使用sids数组和subject_name
      const requestData = {
        subject_name: this.subjectName, // 使用subject_name字段
        sids: [record.question_id] // 传递题目ID数组
      }
      
      getQuestionDetail(requestData).then(res => {
        console.log('题目详情API响应:', res)
        // 处理新的响应格式：{questions: [...], question_count: 2, ...}
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          this.questionDetail = res.questions[0]
        } else if (res && Array.isArray(res) && res.length > 0) {
          this.questionDetail = res[0]
        } else if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.questionDetail = res.data[0]
        } else if (res && res.SID) {
          // 兼容旧的单个对象返回格式
          this.questionDetail = res
        } else if (res && res.code === 200 && res.data) {
          // 兼容旧的嵌套data格式
          this.questionDetail = res.data
        } else {
          this.$message.error('获取题目详情失败: 数据格式错误')
        }
      }).catch(error => {
        console.error('获取题目详情失败:', error)
        this.$message.error('获取题目详情失败: ' + (error.message || '网络错误'))
      }).finally(() => {
        this.loadingDetail = false
      })
    },

    // 根据学科代码获取学科名称（使用工具函数）
    getSubjectNameFromCode(subjectCode) {
      return getSubjectNameFromCode(subjectCode)
    },

    // 获取当前记录的学科名称（用于批阅）
    getCurrentSubjectName(record) {
      if (record && record.subject_code) {
        return this.getSubjectNameFromCode(record.subject_code)
      }
      // 如果没有记录，尝试从学生记录中获取
      if (this.studentRecords.length > 0 && this.studentRecords[0].subject_code) {
        return this.getSubjectNameFromCode(this.studentRecords[0].subject_code)
      }
      return '未知学科'
    },

    // 获取老师信息
    async getTeacherInfo() {
      try {
        this.loadingTeacherInfo = true
        const response = await getTeacherInfo()
        
        if (response.code === 200 && response.data) {
          this.teacherInfo = response.data
          console.log('获取到老师信息:', this.teacherInfo)
          
          // 拼接年级和学科信息
          if (this.teacherInfo.grade && this.teacherInfo.subjectNames) {
            this.subjectName = this.teacherInfo.grade + this.teacherInfo.subjectNames
            console.log('使用老师信息中的学科:', this.subjectName)
          } else if (this.teacherInfo.gradeAndSubject) {
            // 兼容旧的字段名
            this.subjectName = this.teacherInfo.gradeAndSubject
            console.log('使用老师信息中的学科(兼容字段):', this.subjectName)
          }
        } else {
          console.warn('获取老师信息失败:', response)
        }
      } catch (error) {
        console.error('获取老师信息失败:', error)
      } finally {
        this.loadingTeacherInfo = false
      }
    },

    // 获取用户年级和科目（使用 getTeacherInfo）
    async getSubjectInfo() {
      try {
        this.loadingSubject = true
        const response = await getTeacherInfo()
        
        if (response.code === 200 && response.data) {
          const teacherData = response.data
          // 从 getTeacherInfo 返回的数据中提取 grade 和 subjectNames，拼接成 gradeAndSubject
          if (teacherData.grade && teacherData.subjectNames) {
            this.subjectName = teacherData.grade + teacherData.subjectNames
          } else if (teacherData.gradeAndSubject) {
            this.subjectName = teacherData.gradeAndSubject
          } else {
            console.warn('获取学科信息失败，使用默认值:', response)
            this.subjectName = '高中物理' // 保持默认值
          }
          console.log('获取到学科信息:', this.subjectName)
        } else {
          console.warn('获取学科信息失败，使用默认值:', response)
          this.subjectName = '高中物理' // 保持默认值
        }
      } catch (error) {
        console.error('获取学科信息失败:', error)
        this.subjectName = '高中物理' // 保持默认值
      } finally {
        this.loadingSubject = false
      }
    },

    // AI批阅题目
    async aiReviewQuestion(record) {
      console.log('AI批阅方法被调用', record)
      console.log('当前题目详情数据:', this.questionDetails)
      
      try {
        // 设置当前记录的加载状态
        this.$set(record, 'aiReviewLoading', true)
        
        // 获取题目详情
        const question = this.questionDetails.find(q => q.SID === record.question_id)
        console.log('找到的题目详情:', question)
        
        if (!question) {
          this.$message.error('题目详情未找到，无法进行AI批阅')
          return
        }
        
        // 获取正确答案
        const correctAnswer = this.getQuestionAnswer(record.question_id)
        
        // 构建FormData
        const formData = new FormData()
        formData.append('question', question.Content || '')
        formData.append('student_answer', record.answer_content || '')
        formData.append('rubric', question.Method || '')
        formData.append('answer', correctAnswer || '')
        
        console.log('AI批阅请求数据:', {
          question: question.Content,
          student_answer: record.answer_content,
          rubric: question.Method,
          answer: correctAnswer
        })
        
        // 调用AI批阅接口
        const response = await gradeText(formData)
        console.log('AI批阅接口响应:', response)
        
        // 检查响应是否有grading_result字段
        if (response.grading_result) {
          // AI批阅成功，显示结果
          this.showAIReviewResult(record, response)
        } else {
          this.$message.error('AI批阅失败：未返回批阅结果')
        }
        
      } catch (error) {
        console.error('AI批阅失败:', error)
        this.$message.error('AI批阅失败：' + (error.message || '网络错误'))
      } finally {
        // 清除加载状态
        this.$set(record, 'aiReviewLoading', false)
      }
    },

    // 显示AI批阅结果
    showAIReviewResult(record, response) {
      console.log('显示AI批阅结果:', response)
      
      let aiResult = ''
      let isCorrect = null
      
      // 解析AI返回的结果
      if (response.grading_result) {
        try {
          const gradingData = JSON.parse(response.grading_result)
          console.log('解析后的AI批阅数据:', gradingData)
          
          aiResult = `答题结果：${gradingData.答题结果}\n评分理由：${gradingData.评分理由}`
          
          // 将汉字"对"/"错"转换为1/0
          if (gradingData.答题结果 === '对') {
            isCorrect = 1
          } else if (gradingData.答题结果 === '错') {
            isCorrect = 0
          }
          
          console.log('转换后的正确性:', isCorrect)
        } catch (error) {
          console.error('解析AI批阅结果失败:', error)
          aiResult = response.grading_result || 'AI批阅结果解析失败'
        }
      } else {
        aiResult = 'AI批阅结果为空'
      }
      
      console.log('准备显示弹窗，内容:', aiResult)
      
      // 显示AI批阅结果弹窗
      this.$confirm(aiResult, 'AI批阅结果', {
        confirmButtonText: '应用AI解答',
        cancelButtonText: '取消',
        type: 'info',
        dangerouslyUseHTMLString: false,
        customClass: 'ai-review-dialog'
      }).then(() => {
        console.log('用户点击了应用AI解答')
        // 用户点击"应用AI解答"
        if (isCorrect !== null) {
          this.applyAIReview(record, isCorrect)
        } else {
          this.$message.warning('AI批阅结果无法确定正确性，请手动批阅')
        }
      }).catch(() => {
        // 用户点击"取消"，不做任何操作
        console.log('用户取消应用AI批阅结果')
      })
    },

    // 应用AI批阅结果
    async applyAIReview(record, isCorrect) {
      try {
        // 确保学科信息已获取
        if (!this.subjectName) {
          console.warn('学科信息未获取，尝试获取老师信息')
          await this.getTeacherInfo()
          if (!this.subjectName) {
            this.$message.error('无法获取学科信息，AI批阅失败')
            return
          }
        }
        
        // 构建新的批阅数据格式
        const reviewData = {
          student_id: record.student_id,
          subject: this.getCurrentSubjectName(record),
          question_answers: [
            {
              sid: record.question_id,
              answer_content: record.answer_content || '',
              answer_time: this.formatTimeForAPI(record.answer_time),
              is_judge: true,
              teacher_judge: 1,
              error_cause: null,
              knowledge_id: record.knowledge_id || '无知识点',
              score: null, // 题目总分
              point: null, // 学生得分
              origin_cause: null,
              question_children: 0,
              is_correct: isCorrect // 直接使用转换后的1或0
            }
          ]
        }
        
        console.log('应用AI批阅数据:', reviewData)
        
        // 调用新的批阅接口
        const response = await updateAnswerRecords(reviewData)
        console.log('批阅接口响应:', response)
        
        if (response.code === 200 || response.code === 0) {
          this.$message.success('AI批阅应用成功')
          // 重新加载做题记录
          await this.loadStudentRecords()
        } else {
          this.$message.error(response.message || 'AI批阅应用失败')
        }
        
      } catch (error) {
        console.error('应用AI批阅失败:', error)
        this.$message.error('应用AI批阅失败：' + (error.message || '网络错误'))
      }
    },

    // 格式化知识点显示
    formatPoints(points) {
      if (!points || points === '[]') return '无知识点'
      
      try {
        // 尝试解析JSON数组格式
        if (points.startsWith('[') && points.endsWith(']')) {
          const pointsArray = JSON.parse(points)
          if (Array.isArray(pointsArray) && pointsArray.length > 0) {
            // 将知识点数组转换为标签显示
            return pointsArray.map(point => 
              `<span class="point-tag">${point}</span>`
            ).join('、')
          }
        }
        // 如果不是JSON格式，按逗号分割
        const pointsList = points.split(',').map(p => p.trim()).filter(p => p)
        if (pointsList.length > 0) {
          return pointsList.map(point => 
            `<span class="point-tag">${point}</span>`
          ).join('、')
        }
      } catch (error) {
        console.warn('解析知识点失败:', error)
        // 解析失败时，按逗号分割
        const pointsList = points.split(',').map(p => p.trim()).filter(p => p)
        if (pointsList.length > 0) {
          return pointsList.map(point => 
            `<span class="point-tag">${point}</span>`
          ).join('、')
        }
      }
      
      return '无知识点'
    },

    // 学生导航相关方法
    async loadStudentList() {
      try {
        
        // 调用API获取任务下的所有学生列表
        const response = await pageByStudentIdTask(this.taskId)
        
        if (response.code === 200 && response.data && Array.isArray(response.data)) {
          this.studentList = response.data.map(item => ({
            id: item.studentId,
            name: `学生${item.studentId}`, // 临时显示，后续会获取真实姓名
            taskId: item.taskID,
            progress: item.currentProgress,
            hasRecords: false // 初始化为false，后续会检查是否有做题记录
          }))
          
          // 设置当前学生
          if (this.studentId) {
            this.currentStudentId = this.studentId
            this.currentStudentIndex = this.studentList.findIndex(s => s.id === this.studentId)
            if (this.currentStudentIndex === -1) {
              this.currentStudentIndex = 0
              this.currentStudentId = this.studentList[0].id
            }
          } else {
            this.currentStudentId = this.studentList[0].id
            this.currentStudentIndex = 0
          }
          
          // 设置当前任务ID
          const currentStudent = this.studentList.find(s => s.id === this.currentStudentId)
          if (currentStudent) {
            this.currentTaskId = currentStudent.taskId
            this.studentName = currentStudent.name
          }
          
          // 批量获取学生姓名
          await this.loadStudentNames()
          
          // 批量检查学生做题记录
          await this.checkAllStudentRecords()
          
        } else {
          console.warn('获取学生列表失败:', response)
          this.$message.error('获取学生列表失败')
        }
      } catch (error) {
        console.error('加载学生列表失败:', error)
        this.$message.error('加载学生列表失败：' + error.message)
      }
    },

    // 批量获取学生姓名
    async loadStudentNames() {
      try {
        const namePromises = this.studentList.map(async (student) => {
          try {
            const name = await this.getStudentName(student.id)
            student.name = name
            return { id: student.id, name }
          } catch (error) {
            console.warn(`获取学生${student.id}姓名失败:`, error)
            return { id: student.id, name: `学生${student.id}` }
          }
        })
        
        await Promise.all(namePromises)
      } catch (error) {
        console.error('批量获取学生姓名失败:', error)
      }
    },

    // 检查学生是否有做题记录
    async checkStudentRecords(student) {
      try {
        const response = await getStudentRecords(student.taskId)
        if (response.code === 0 && response.data) {
          // 检查是否有任何学生的做题记录
          let hasRecords = false
          for (const studentId in response.data) {
            const studentData = response.data[studentId]
            if (studentData.knowledge_points && Array.isArray(studentData.knowledge_points)) {
              for (const knowledgePoint of studentData.knowledge_points) {
                if (knowledgePoint.questions && Array.isArray(knowledgePoint.questions)) {
                  for (const question of knowledgePoint.questions) {
                    if (question.attempts && Array.isArray(question.attempts) && question.attempts.length > 0) {
                      hasRecords = true
                      break
                    }
                  }
                  if (hasRecords) break
                }
              }
              if (hasRecords) break
            }
          }
          student.hasRecords = hasRecords
          return hasRecords
        }
        student.hasRecords = false
        return false
      } catch (error) {
        console.warn(`检查学生${student.id}做题记录失败:`, error)
        student.hasRecords = false
        return false
      }
    },

    // 批量检查学生做题记录
    async checkAllStudentRecords() {
      try {
        const checkPromises = this.studentList.map(async (student) => {
          await this.checkStudentRecords(student)
        })
        
        await Promise.all(checkPromises)
        console.log('学生做题记录检查完成:', this.studentList.map(s => ({ id: s.id, name: s.name, hasRecords: s.hasRecords })))
      } catch (error) {
        console.error('批量检查学生做题记录失败:', error)
      }
    },

    async switchStudent(studentId) {
      if (studentId === this.currentStudentId) return
      
      // 检查学生是否有做题记录
      const student = this.studentList.find(s => s.id === studentId)
      if (!student || !student.hasRecords) {
        this.$message.warning('该学生暂无做题记录')
        return
      }
      
      try {
        this.currentStudentId = studentId
        this.currentStudentIndex = this.studentList.findIndex(s => s.id === studentId)
        
        // 更新学生姓名和任务ID
        if (student) {
          this.studentName = student.name
          // 更新当前使用的任务ID
          this.currentTaskId = student.taskId
          console.log('切换学生:', studentId, student.name, '任务ID:', student.taskId)
        }
        
        // 重新加载该学生的做题记录
        await this.loadStudentRecords()
        
      } catch (error) {
        console.error('切换学生失败:', error)
        this.$message.error('切换学生失败')
      }
    },

    async previousStudent() {
      if (!this.hasPreviousStudent) return
      
      // 找到上一个有做题记录的学生
      let targetIndex = this.currentStudentIndex - 1
      while (targetIndex >= 0) {
        if (this.studentList[targetIndex].hasRecords) {
          await this.switchStudent(this.studentList[targetIndex].id)
          return
        }
        targetIndex--
      }
      
      this.$message.warning('前面没有有做题记录的学生')
    },

    async nextStudent() {
      if (!this.hasNextStudent) return
      
      // 找到下一个有做题记录的学生
      let targetIndex = this.currentStudentIndex + 1
      while (targetIndex < this.studentList.length) {
        if (this.studentList[targetIndex].hasRecords) {
          await this.switchStudent(this.studentList[targetIndex].id)
          return
        }
        targetIndex++
      }
      
      this.$message.warning('后面没有有做题记录的学生')
    },
  }
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.page-header {
  background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(102, 179, 255, 0.3);
  
  .header-content {
    display: flex;
    align-items: center;
    padding: 24px;
    position: relative;
    
    .back-btn {
      display: flex;
      align-items: center;
      color: white;
      cursor: pointer;
      margin-right: 30px;
      padding: 10px 18px;
      border-radius: 6px;
      transition: all 0.3s ease;
      font-weight: 500;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateX(-2px);
      }
      
      i {
        margin-right: 8px;
        font-size: 16px;
      }
    }
    
    .task-info {
      color: white;
      
      h2 {
        margin: 0 0 12px 0;
        font-size: 28px;
        font-weight: 700;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .task-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        
        .el-tag {
          margin-right: 0;
          font-weight: 500;
          border-radius: 20px;
          padding: 0px 12px;
          
          &.el-tag--warning {
            background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
            border: none;
            color: white;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
            animation: pulse 2s infinite;
          }
        }
        
        .auto-review-btn {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          border: none;
          border-radius: 20px;
          font-weight: 600;
          font-size: 12px;
          padding: 6px 16px;
          box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
            
            &::before {
              left: 100%;
            }
          }
          
          &:active {
            transform: translateY(0);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: 0 1px 4px rgba(103, 194, 58, 0.2);
          }
          
          i {
            margin-right: 6px;
            font-size: 14px;
          }
        }
      }
    }
    
    // 学生导航样式
    .student-navigation {
      position: absolute;
      top: 12px;
      right: 20px;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 16px;
      max-width: 500px;
      background: rgba(255, 255, 255, 0.15);
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      
      .student-list-wrapper {
        max-height: 70px;
        overflow-y: auto;
        padding-right: 8px;
        flex-grow: 1;
        
        // 自定义滚动条样式
        &::-webkit-scrollbar {
          width: 6px;
        }
        
        &::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 3px;
        }
        
        &::-webkit-scrollbar-track {
          background-color: transparent;
        }
      }
      
      .student-list {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-start;
        
        .student-item {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          white-space: nowrap;
          position: relative;
          
          &:hover:not(.disabled) {
            background: rgba(255, 255, 255, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          &.active {
            background: white;
            color: #409eff;
            font-weight: 600;
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          }
          
          &.disabled {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
            cursor: not-allowed;
            opacity: 0.6;
            
            &:hover {
              background: rgba(255, 255, 255, 0.1);
              transform: none;
              box-shadow: none;
            }
            
            .no-records-tip {
              font-size: 11px;
              color: rgba(255, 255, 255, 0.7);
              font-style: italic;
              margin-left: 4px;
            }
          }
        }
      }
      
      .navigation-controls {
        margin-top: 5px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
        flex-shrink: 0;
        
        .nav-btn {
          color: white;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          font-weight: 500;
          min-width: 80px;
          
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }
        }
      }
    }
  }
}

.loading-container {
  text-align: center;
  padding: 60px 0;
  
  p {
    margin-top: 20px;
    color: #909399;
  }
}

.records-container {
  margin-top: 20px;
}

.question-id {
  font-family: monospace;
  color: #606266;
}

.answer-content {
  .no-answer {
    color: #909399;
    font-style: italic;
  }
}

.no-data {
  text-align: center;
  padding: 60px 0;
}

.review-form {
  .question-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 10px 0;
      color: #303133;
    }
    
    p {
      margin: 5px 0;
      color: #606266;
    }
    
    // 答案对比样式
    .answer-comparison {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      
      .answer-item {
        flex: 1;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        min-width: 0; // 防止flex项目溢出
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .answer-label {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 14px;
          color: white;
          
          i {
            margin-right: 8px;
            font-size: 16px;
          }
        }
        
        .answer-content {
          padding: 16px;
          font-size: 14px;
          line-height: 1.6;
          min-height: 80px;
          display: block;
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          overflow: hidden;
          
          // 确保数学公式和化学方程式正确显示
          .katex,
          .MathJye,
          img {
            max-width: 100% !important;
            height: auto !important;
            display: inline-block;
            vertical-align: middle;
          }
          
          // 处理化学方程式
          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto;
            border-collapse: collapse;
            
            td {
              padding: 2px 4px;
              text-align: center;
              vertical-align: middle;
              white-space: nowrap;
            }
          }
          
          // 处理上标下标
          sup, sub {
            font-size: 0.8em;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
          }
          
          sup {
            top: -0.5em;
          }
          
          sub {
            bottom: -0.25em;
          }
        }
        
        // 学生答案样式
        &:first-child {
          .answer-label {
            background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
          }
          
          .answer-content {
            background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
            color: #2c3e50;
            border-left: 4px solid #66B3FF;
          }
        }
        
        // 正确答案样式
        &:last-child {
          .answer-label {
            background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          }
          
          .answer-content {
            background: linear-gradient(135deg, #f0fff4 0%, #e8f5e8 100%);
            color: #2c3e50;
            border-left: 4px solid #67c23a;
          }
        }
      }
    }
    
    .answer-meta {
      padding-top: 12px;
      border-top: 1px solid #e8e8e8;
      
      p {
        margin: 0;
        color: #606266;
        font-size: 13px;
      }
    }
  }
}

.question-detail {
  .answer-display {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.dialog-footer {
  text-align: right;
}

.question-content {
  .question-text {
    margin-bottom: 8px;
    line-height: 1.4;
    word-break: break-word;
  }
  
  .question-meta {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .no-question {
    color: #909399;
    font-style: italic;
  }
}

// 题目卡片样式 - 现代化设计
.question-card {
  border: none;
  border-radius: 16px;
  margin-bottom: 20px;
  background: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #66B3FF, #99CCFF, #409EFF, #67c23a);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(102, 179, 255, 0.2);
  }
  
  .question-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #66B3FF, transparent);
    }
    
    .question-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      
      .question-type {
        background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(102, 179, 255, 0.3);
      }
      
      .question-difficulty {
        color: #666;
        font-size: 13px;
        font-weight: 500;
        background: #f0f0f0;
        padding: 4px 10px;
        border-radius: 12px;
      }
    }
    
    .question-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      
      .knowledge-point {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        color: #1976d2;
        padding: 6px 12px;
        border-radius: 16px;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
        font-size: 12px;
      }
      
      .analysis-btn {
        color: #66B3FF;
        font-weight: 600;
        font-size: 13px;
        padding: 6px 12px;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(102, 179, 255, 0.1);
          color: #409EFF;
        }
      }
    }
  }
  
  .question-content {
    padding: 20px;
    background: white;
    
    .question-text {
      margin-bottom: 16px;
      line-height: 1.8;
      color: #2c3e50;
      font-size: 15px;
      font-weight: 400;
      overflow: hidden;
      
      // 处理填空位置
      .answer-input-area {
        border-bottom: 2px solid #66B3FF;
        display: inline-block;
        min-width: 120px;
        min-height: 24px;
        padding: 4px 8px;
        margin: 0 4px;
        background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
        color: #2c3e50;
        font-style: normal;
        font-weight: 500;
        text-align: center;
        vertical-align: middle;
        line-height: 1.4;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:focus {
          outline: none;
          border-bottom-color: #409EFF;
          background: linear-gradient(135deg, #e6f3ff 0%, #d6ebff 100%);
          box-shadow: 0 2px 8px rgba(102, 179, 255, 0.2);
        }
      }
      
      .answer-input-area:empty:before {
        content: "请输入答案...";
        color: #a0a0a0;
        font-style: italic;
        font-weight: normal;
      }
    }
    
    .question-options {
      margin-top: 16px;
      
      .option-item {
        margin-bottom: 12px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
        border-radius: 12px;
        border-left: 4px solid #66B3FF;
        display: flex;
        align-items: flex-start;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 179, 255, 0.05) 0%, rgba(153, 204, 255, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        &:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(102, 179, 255, 0.15);
          
          &::before {
            opacity: 1;
          }
        }
        
        &.correct-option {
          background: linear-gradient(135deg, #f0fff4 0%, #e8f5e8 100%);
          border-left-color: #67c23a;
          border: 2px solid #67c23a;
          
          &::before {
            background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(133, 206, 97, 0.1) 100%);
          }
        }

        // 学生答案样式
        &.student-answer {
          transform: translateX(2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          border-width: 3px;
          
          &::before {
            opacity: 1;
          }
        }

        // 学生答案正确（绿色）
        &.student-answer-correct {
          background: linear-gradient(135deg, #f0fff4 0%, #e8f5e8 100%);
          border-left-color: #67c23a;
          border: 3px solid #67c23a;
          box-shadow: 0 6px 20px rgba(103, 194, 58, 0.3);
          
          &::before {
            background: linear-gradient(135deg, rgba(103, 194, 58, 0.2) 0%, rgba(133, 206, 97, 0.2) 100%);
            opacity: 1;
          }

          .option-label {
            background: #67c23a;
            color: white;
            box-shadow: 0 3px 8px rgba(103, 194, 58, 0.4);
            transform: scale(1.1);
          }
        }

        // 学生答案错误（红色）
        &.student-answer-wrong {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
          border-left-color: #f56c6c;
          border: 3px solid #f56c6c;
          box-shadow: 0 6px 20px rgba(245, 108, 108, 0.3);
          
          &::before {
            background: linear-gradient(135deg, rgba(245, 108, 108, 0.2) 0%, rgba(247, 137, 137, 0.2) 100%);
            opacity: 1;
          }

          .option-label {
            background: #f56c6c;
            color: white;
            box-shadow: 0 3px 8px rgba(245, 108, 108, 0.4);
            transform: scale(1.1);
          }
        }
        
        .option-label {
          font-weight: 700;
          color: #66B3FF;
          margin-right: 12px;
          min-width: 24px;
          display: inline-block;
          font-size: 14px;
          background: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          text-align: center;
          line-height: 24px;
          box-shadow: 0 2px 4px rgba(102, 179, 255, 0.2);
        }
        
        &.correct-option .option-label {
          color: #67c23a;
          background: #67c23a;
          color: white;
        }
        
        .option-content {
          flex: 1;
          line-height: 1.6;
          color: #2c3e50;
          font-size: 14px;
        }
      }
    }
    
    .answer-section {
      margin-top: 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%);
      border-radius: 8px;
      border-left: 3px solid #66B3FF;
      
      .answer-info {
        // background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
        // color: #7b1fa2;
        padding: 6px 12px;
        border-radius: 16px;
        font-weight: 500;
        // box-shadow: 0 2px 4px rgba(123, 31, 162, 0.2);
        font-size: 13px;
      }
    }
  }
}

// 解析弹窗样式 - 参考addCombinedPaper.vue
.analysis-content {
  // max-height: 700px;
  overflow-y: auto;
}

.loading-section {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.loading-spinner {
  margin-bottom: 15px;
  
  i {
    font-size: 24px;
    color: #409eff;
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.question-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-weight: bold;
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  flex: 1;
}

.question-section,
.options-section,
.answer-section,
.analysis-section,
.analyse-section,
.discuss-section,
.points-section {
  margin-bottom: 20px;
  
  h4 {
    margin-bottom: 10px;
    color: #303133;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 2px solid #409eff;
    padding-bottom: 5px;
  }
}

.question-content {
  line-height: 1.6;
  color: #303133;
  font-size: 14px;
}

.answer-tag {
  display: inline-block;
  // background: #67c23a;
  color: black;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
  font-size: 12px;
  
  &.correct {
    // background: #67c23a;
    font-weight: bold;
  }
}

.analysis-content,
.analyse-content,
.discuss-content,
.points-content {
  line-height: 1.6;
  color: #606266;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.no-detail {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

// 答案卡片样式 - 现代化设计
.answer-card {
  .answer-content {
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
    border: 2px solid #e8e8e8;
    border-radius: 12px;
    padding: 12px 16px;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 179, 255, 0.05) 0%, rgba(153, 204, 255, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      // transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 179, 255, 0.15);
      border-color: #66B3FF;
      
      &::before {
        opacity: 1;
      }
    }
    
    .answer-text {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      word-break: break-all;
      position: relative;
      z-index: 1;
    }
    
    .no-answer {
      color: #a0a0a0;
      font-style: italic;
      font-size: 13px;
      position: relative;
      z-index: 1;
    }
  }
}

// 状态标签样式 - 现代化设计
.status-tag {
  font-weight: 600;
  border-radius: 20px;
  padding: 2px 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  i {
    margin-right: 6px;
    font-size: 13px;
  }
  
  // 待批阅状态
  &.el-tag--warning {
    background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
    border: none;
    color: white;
  }
  
  // 正确状态
  &.el-tag--success {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    border: none;
    color: white;
  }
  
  // 错误状态
  &.el-tag--danger {
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
    border: none;
    color: white;
  }
}

// 表格优化 - 现代化设计
.el-table {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: none;
  background: white;
  
  .el-table__header {
    background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #66B3FF, #99CCFF, #409EFF, #67c23a);
    }
    
    th {
      background: transparent !important;
      color: white !important;
      font-weight: 700;
      border: none;
      font-size: 15px;
      padding: 20px 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
      }
    }
  }
  
  .el-table__body {
    tr {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      
      &:hover {
        background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 179, 255, 0.15);
      }
      
      &:nth-child(even) {
        background: #f8f9ff;
      }
      
      &:nth-child(odd) {
        background: white;
      }
    }
    
    td {
      border-bottom: 1px solid #f0f0f0;
      padding: 20px 12px;
      vertical-align: top;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 0;
        background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
        transition: width 0.3s ease;
      }
      
      &:hover::before {
        width: 3px;
      }
    }
  }
}

// 操作按钮优化 - 现代化设计
.el-button--mini {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &.el-button--primary {
    background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(102, 179, 255, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 179, 255, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  &.el-button--success {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(103, 194, 58, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(103, 194, 58, 0.4);
    }
  }
  
  &.el-button--info {
    background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(144, 147, 153, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(144, 147, 153, 0.4);
    }
  }
  
  &.el-button--warning {
    background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(230, 162, 60, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(230, 162, 60, 0.4);
    }
  }
  
  &.el-button--danger {
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(245, 108, 108, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 108, 108, 0.4);
    }
  }
}



// 记录容器优化
.records-container {
  margin-top: 20px;
}

// 题目内容加载状态样式
.no-question-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border: 1px dashed #ddd;
  border-radius: 6px;
  color: #666;
  
  i {
    font-size: 24px;
    color: #f39c12;
    margin-bottom: 8px;
  }
  
  span {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .question-id-info {
    font-size: 12px;
    color: #999;
    font-family: monospace;
  }
}

// 数学公式样式优化
.MathJye {
  display: inline-block;
  vertical-align: middle;
  
  table {
    display: inline-table;
    vertical-align: middle;
  }
  
  td {
    text-align: center;
    vertical-align: middle;
  }
}

// 根号符号优化
[dealflag="1"] {
  .MathJye {
    position: relative;
    
    div[hassize] {
      display: inline-block;
      vertical-align: middle;
    }
  }
}

// AI批阅弹窗样式 - 现代化设计
.ai-review-dialog {
  .el-message-box__content {
    white-space: pre-line; // 支持换行显示
    line-height: 1.6;
    font-size: 14px;
  }
  
  .el-message-box__message {
    padding: 24px;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
    border-radius: 12px;
    border-left: 4px solid #66B3FF;
    box-shadow: 0 4px 20px rgba(102, 179, 255, 0.1);
  }
  
  .el-message-box__btns {
    padding: 24px;
    
    .el-button--primary {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border: none;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(103, 194, 58, 0.3);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(103, 194, 58, 0.4);
      }
    }
  }
}

// 全局动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

// 页面加载动画
.app-container {
  animation: fadeInUp 0.6s ease-out;
}

.records-container {
  animation: slideInLeft 0.8s ease-out;
}

// 题目卡片进入动画
.question-card {
  animation: fadeInUp 0.4s ease-out;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }
}

// 按钮点击动画
.el-button {
  &:active {
    animation: pulse 0.3s ease-in-out;
  }
}

// 加载状态优化
.loading-container {
  .el-loading-spinner {
    animation: pulse 1.5s ease-in-out infinite;
  }
}

// KaTeX 数学公式样式优化
.katex {
  font-size: 1.1em;
  
  .katex-html {
    display: inline-block;
    vertical-align: middle;
  }
}

.katex-display {
  margin: 1em 0;
  text-align: center;
  
  .katex {
    display: inline-block;
  }
}

// 数学公式错误提示样式
.math-error {
  color: #f56c6c;
  background: #fef0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  border: 1px dashed #f56c6c;
}

// 响应式设计优化
@media (max-width: 768px) {
  .question-card {
    margin-bottom: 16px;
    
    .question-header {
      padding: 12px 16px;
      
      .question-meta {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
    }
    
    .question-content {
      padding: 16px;
    }
    
    .question-footer {
      padding: 12px 16px;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  }
  
  .el-table {
    .el-table__header th {
      padding: 12px 8px;
      font-size: 13px;
    }
  
    .el-table__body td {
      padding: 12px 8px;
    }
  }
  
  // 移动端数学公式字体调整
  .katex {
    font-size: 1em;
  }
  
  // 批阅弹窗响应式
  .review-form {
    .question-info {
      .answer-comparison {
        flex-direction: column;
        gap: 16px;
        
        .answer-item {
          .answer-content {
            min-height: 60px;
            font-size: 13px;
            padding: 12px;
            
            // 移动端化学方程式处理
            .MathJye {
              table {
                font-size: 0.9em;
                
                td {
                  padding: 1px 2px;
                }
              }
            }
            
            // 移动端数学公式处理
            .katex {
              font-size: 0.9em;
            }
          }
        }
      }
    }
  }
}

// 题目内容中的图片样式优化
.question-content,
.analysis-content,
.analyse-content,
.discuss-content,
.answer-display {
  img {
    max-width: 100% !important;
    max-height: 300px !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    margin: 8px auto !important;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }
}

// 题目选项中的图片样式
.option-content {
  img {
    max-width: 100% !important;
    max-height: 200px !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    margin: 6px auto !important;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

// 图片加载状态
img {
  &[src=""],
  &:not([src]) {
    display: none;
  }
  
  // 图片加载失败时的占位符
  &::before {
    content: '图片加载失败';
    display: block;
    padding: 20px;
    text-align: center;
    color: #999;
    background: #f5f5f5;
    border-radius: 4px;
  }
}

// 知识点标签样式
.point-tag {
  display: inline-block;
  background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
  color: white;
  padding: 4px 12px;
  margin: 2px 4px 2px 0;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(102, 179, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 179, 255, 0.4);
  }
}

// 批阅弹窗中的特殊内容处理
.review-form {
  // 分数输入字段样式
  .el-form-item {
    margin-bottom: 20px;
    
    .el-form-item__label {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }
    
    .el-input-number {
      .el-input__inner {
        border-radius: 8px;
        border: 2px solid #e8e8e8;
        transition: all 0.3s ease;
        
        &:focus {
          border-color: #66B3FF;
          box-shadow: 0 0 0 2px rgba(102, 179, 255, 0.2);
        }
      }
      
      .el-input-number__decrease,
      .el-input-number__increase {
        border-color: #e8e8e8;
        background: #f8f9fa;
        color: #66B3FF;
        transition: all 0.3s ease;
        
        &:hover {
          background: #66B3FF;
          color: white;
          border-color: #66B3FF;
        }
      }
    }
  }
  
  // 分数设置一行显示样式
  .score-form-item {
    .el-form-item__label {
      font-weight: 700;
      color: #2c3e50;
      font-size: 15px;
      margin-bottom: 12px;
      display: block;
    }
    
    .score-inputs {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 12px;
      padding: 10px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%);
      border-radius: 12px;
      border: 2px solid #e8e8e8;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #66B3FF;
        box-shadow: 0 4px 16px rgba(102, 179, 255, 0.1);
      }
    }
    
    .score-input-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
      
      .score-label {
        line-height: normal;
        font-weight: 600;
        color: #66B3FF;
        font-size: 12px;
        text-align: center;
        margin: 0;
        padding: 4px 8px;
        background: rgba(102, 179, 255, 0.1);
        border-radius: 6px;
        min-width: 80px;
      }
      
      .el-input-number {
        width: 100% !important;
        
        .el-input__inner {
          text-align: center;
          font-weight: 600;
          font-size: 16px;
          color: #2c3e50;
          background: white;
          
          &::placeholder {
            color: #c0c4cc;
            font-weight: normal;
          }
        }
      }
    }
    
    .score-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #66B3FF;
      font-size: 18px;
      font-weight: bold;
      min-width: 24px;
      
      i {
        animation: pulse 2s infinite;
      }
    }
  }
  
  // 错误原因和评语样式
  .el-form-item {
    &:has(.el-select) {
      .el-select {
        .el-input__inner {
          border-radius: 8px;
          border: 2px solid #e8e8e8;
          transition: all 0.3s ease;
          
          &:focus {
            border-color: #66B3FF;
            box-shadow: 0 0 0 2px rgba(102, 179, 255, 0.2);
          }
        }
      }
    }
    
    &:has(.el-textarea) {
      .el-textarea {
        .el-textarea__inner {
          border-radius: 8px;
          border: 2px solid #e8e8e8;
          transition: all 0.3s ease;
          font-family: inherit;
          line-height: 1.6;
          
          &:focus {
            border-color: #66B3FF;
            box-shadow: 0 0 0 2px rgba(102, 179, 255, 0.2);
          }
          
          &::placeholder {
            color: #c0c4cc;
            font-style: italic;
          }
        }
      }
    }
  }
  
  // 处理化学方程式和数学公式的显示
  .answer-content {
    // 确保化学方程式正确显示
    .MathJye {
      display: inline-block;
      vertical-align: middle;
      max-width: 100%;
      overflow: visible;
      
      table {
        display: inline-table;
        width: auto !important;
        max-width: none !important;
        margin: 0 auto;
        
        td {
          padding: 1px 3px;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
          font-size: inherit;
        }
      }
      
      // 处理化学方程式中的上标下标
      sup, sub {
        font-size: 0.75em;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
      }
      
      sup {
        top: -0.4em;
      }
      
      sub {
        bottom: -0.2em;
      }
    }
    
    // 处理KaTeX公式
    .katex {
      font-size: 1em;
      display: inline-block;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      
      .katex-html {
        display: inline-block;
        vertical-align: middle;
      }
    }
    
    // 处理图片
    img {
      max-width: 100% !important;
      height: auto !important;
      display: block;
      margin: 4px auto;
      border-radius: 4px;
    }
    
    // 处理文本溢出
    &.correct-answer {
      overflow-x: auto;
      overflow-y: visible;
      
      // 为化学方程式添加水平滚动
      .MathJye {
        min-width: fit-content;
      }
    }
  }
}
</style> 