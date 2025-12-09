<template>
  <div class="app-container home">
    <!-- 欢迎标题 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎使用麓鸣东方 管理端</h1>
      <p class="welcome-subtitle">高效的教学管理平台</p>
    </div>

    <!-- 第一行：课程卡片和试题中心卡片 -->
    <div class="main-cards-row">
      <el-row :gutter="20">
                 <!-- 我的今日课程 -->
         <el-col :xs="24" :sm="12" :lg="12">
           <div class="module-card today-courses" shadow="hover"> 
            <div class="module-icon">
              <i class="el-icon-date"></i>
            </div>
              <div class="module-content">
               <h3 class="module-title">我的今日课程</h3>
               <div class="module-info">
                 <div class="course-count">{{ todayCourses.length }} 门课程</div>
                 <div class="course-list">
                   <div v-for="course in sortedTodayCourses" :key="course.scheduleId" class="course-item data-item" @click.stop="showCourseDetail(course)">
                     <div class="course-info">
                       <span class="course-time">{{ formatTime(course.startTime) }}</span>
                       <span class="course-name">{{ getSubjectDisplay(course.subject) }}</span>
                     </div>
                     <span class="course-location">{{ course.location || '地点待定' }}</span>
                   </div>
                 </div>
                 <div class="view-all-btn" @click="navigateToSchedule">
                   <i class="el-icon-arrow-right"></i>
                   <span>查看全部课程 ({{ todayCourses.length }}门)</span>
                 </div>
               </div>
             </div>
          </div>
        </el-col>

        <!-- 我的试题中心 -->
        <el-col :xs="24" :sm="12" :lg="12">
          <div class="question-center-card" shadow="hover">
            <div class="section-header">
              <span class="section-title">我的试题中心</span>
            </div>
            <div class="question-center-content">
              <el-row :gutter="20">
                <!-- <el-col :span="8">
                  <el-card class="data-card chapter-card" shadow="hover" >
                    <div slot="header" class="card-header">
                      <span class="card-title ellipsis">最新章节题</span>
                      <el-button type="text" @click="navigateToChapterQuestions">查看更多</el-button>
                    </div>
                                         <div class="data-content">
                       <div v-if="questionCenterData.chapterTables && questionCenterData.chapterTables.length > 0" class="data-list">
                         <div v-for="item in questionCenterData.chapterTables.slice(0, 5)" :key="item.id" class="data-item" @click="navigateToChapterQuestionsWithView(item)">
                           <div class="item-name">{{ item.customPaperName }}</div>
                           <div class="item-time">{{ formatDateTime(item.createTime) }}</div>
                         </div>
                       </div>
                       <div v-else class="empty-data">
                         <i class="el-icon-document"></i>
                         <p>暂无章节题数据</p>
                       </div>
                     </div>
                  </el-card>
                </el-col> -->
                
                <el-col :span="12">
                  <el-card class="data-card assignment-card" shadow="hover">
                    <div slot="header" class="card-header">
                      <span class="card-title ellipsis">最新作业</span>
                      <el-button type="text" @click="navigateToAssignments">查看更多</el-button>
                    </div>
                                         <div class="data-content">
                       <div v-if="questionCenterData.assignmentTables && questionCenterData.assignmentTables.length > 0" class="data-list">
                         <div v-for="item in questionCenterData.assignmentTables.slice(0, 5)" :key="item.id" class="data-item" @click="navigateToAssignmentsWithView(item)">
                           <div class="item-name">{{ item.customPaperName }}</div>
                           <div class="item-time">{{ formatDateTime(item.createTime) }}</div>
                         </div>
                       </div>
                       <div v-else class="empty-data">
                         <i class="el-icon-edit-outline"></i>
                         <p>暂无作业数据</p>
                       </div>
                     </div>
                  </el-card>
                </el-col>
                
                <el-col :span="12">
                  <el-card class="data-card exam-card" shadow="hover">
                    <div slot="header" class="card-header">
                      <span class="card-title ellipsis">最新组卷</span>
                      <el-button type="text" @click="navigateToExamPapers">查看更多</el-button>
                    </div>
                                         <div class="data-content">
                       <div v-if="questionCenterData.examPaperList && questionCenterData.examPaperList.length > 0" class="data-list">
                         <div v-for="item in questionCenterData.examPaperList.slice(0, 5)" :key="item.id" class="data-item" @click="navigateToExamPapersWithView(item)">
                           <div class="item-name">{{ item.customPaperName }}</div>
                           <div class="item-time">{{ formatDateTime(item.createTime) }}</div>
                         </div>

                       </div>
                       <div v-else class="empty-data">
                         <i class="el-icon-tickets"></i>
                         <p>暂无组卷数据</p>
                       </div>
                     </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 第二行：任务卡片和资源卡片 -->
    <div class="main-cards-row">
      <el-row :gutter="20">
        <!-- 我发布的任务 -->
        <el-col :xs="24" :sm="12" :lg="12">
          <div class="task-card" shadow="hover">
            <div class="section-header">
              <span class="section-title">我发布的任务</span>
            </div>
            <div class="task-content">
              <div class="task-description">
                <span>未过期的任务</span>
              </div>
              <div class="task-list">
                <div v-for="task in recentTasks.slice(0, 4)" :key="task.taskId" class="task-item" @click="navigateToTasksWithView(task)">
                  <div class="task-info">
                    <div class="task-name">{{ task.taskName }}</div>
                    <div class="task-details">
                      <span class="task-subject">{{ getSubjectDisplay(task.subjectCode) }}</span>
                      <span class="task-type">{{ task.taskType }}</span>
                    </div>
                  </div>
                  <div class="task-status-info">
                    <span class="task-status" :class="getTaskStatusClass(task)">
                      {{ getTaskStatusText(task) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 我的教材资源 -->
        <el-col :xs="24" :sm="12" :lg="12">
          <div class="resource-card" shadow="hover">
            <div class="section-header">
              <span class="section-title">我的教材资源</span>
            </div>
            <div class="resource-content">
              <div class="resource-stats-row">
                <div class="stat-item">
                  <span class="stat-number">{{ resourceStats.total }}</span>
                  <span class="stat-label">总文件</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ resourceStats.recent }}</span>
                  <span class="stat-label">最近上传</span>
                </div>
              </div>
              <div class="resource-list">
                <div v-if="recentFiles.length === 0" class="empty-resources">
                  <i class="el-icon-folder"></i>
                  <p>暂无资源文件</p>
                </div>
                <div v-else>
                  <div v-for="file in recentFiles.slice(0, 4)" :key="file.fileId || file.id" class="resource-item" @click="navigateToResources">
                    <div class="resource-info">
                      <div class="resource-name">{{ file.userFname || file.fileName || file.name || '未知文件' }}</div>
                      <div class="resource-details">
                        <span class="resource-subject">{{ file.subjectName || file.subject || '未分类' }}</span>
                        <span class="resource-purpose">{{ file.filePurpose || file.purpose || '教学资源' }}</span>
                      </div>
                    </div>
                    <div class="resource-meta">
                      <span class="resource-time">{{ formatDate(file.uploadTime || file.createTime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

           <!-- 系统信息 -->
     <div class="system-info">
       <el-row :gutter="20">
         <el-col :span="24">
           <el-card class="info-card">
             <div slot="header" class="card-header">
               <span>系统信息</span>
             </div>
             <div class="info-content">
               <!-- <p><strong>当前版本:</strong> <span>v{{ version }}</span></p> -->
               <p><strong>系统介绍:</strong> 麓鸣管理系统是一款专为教育行业设计的智能管理平台，提供课程管理、资源管理、学生管理等核心功能。系统界面简洁、操作便捷，支持多端访问，为教育工作者提供高效的管理工具。</p>
               <p><strong>使用文档:</strong> <a href="https://admin.lumina-edu.cn:8070/note-images/麓鸣爱学PC端使用文档_20250902165943.pdf" target="_blank" class="doc-link">麓鸣东方PC端使用文档</a></p>
               <p><strong>功能文档:</strong> <a href="https://admin.lumina-edu.cn:8070/note-images/麓鸣AI教师端：一站式智能教学助手.pdf" target="_blank" class="doc-link">麓鸣AI教师端：一站式智能教学助手</a></p>
               <div class="tags">
                 <el-tag type="success">高效稳定</el-tag>
                 <el-tag type="info">易于扩展</el-tag>
                 <el-tag type="warning">功能丰富</el-tag>
               </div>
             </div>
           </el-card>
         </el-col>
       </el-row>
     </div>

     <!-- 课程详情弹窗 -->
     <el-dialog 
       title="课程详情" 
       :visible.sync="courseDetailVisible" 
       width="600px" 
       append-to-body
       @close="closeCourseDetail"
       custom-class="course-detail-dialog"
     >
       <div v-if="selectedCourse" class="course-detail">
         <div class="detail-section">
           <h4>基本信息</h4>
           <div class="detail-row">
             <span class="detail-label">班级：</span>
             <span class="detail-value">{{ getClassName(selectedCourse.classId) }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">课程科目：</span>
             <span class="detail-value">{{ getSubjectDisplay(selectedCourse.subject) }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">授课教师：</span>
             <span class="detail-value">{{ getUserName(selectedCourse.teacherId) }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">课程日期：</span>
             <span class="detail-value">{{ formatDate(selectedCourse.courseDate) }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">开始时间：</span>
             <span class="detail-value">{{ selectedCourse.startTime || '-' }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">结束时间：</span>
             <span class="detail-value">{{ selectedCourse.endTime || '-' }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">上课地点：</span>
             <span class="detail-value">{{ selectedCourse.location || '地点待定' }}</span>
           </div>
           <div class="detail-row" v-if="selectedCourse.remark">
             <span class="detail-label">备注：</span>
             <span class="detail-value">{{ selectedCourse.remark }}</span>
           </div>
         </div>
       </div>
       <div slot="footer" class="dialog-footer">
         <el-button @click="courseDetailVisible = false">关闭</el-button>
         <el-button type="primary" @click="navigateToScheduleFromDialog">查看课程表</el-button>
       </div>
     </el-dialog>
   </div>
 </template>

<script>
import { listSchedule } from "@/api/system/schedule"
import { listTask, sysUserList } from "@/api/system/task"
import { listKnowledge } from "@/api/system/knowledge"
import { listPaper } from "@/api/system/paper"
import { sysSubjectList } from "@/api/system/knowledge"
import { listDept } from "@/api/system/dept"
import { getQuestionCenter, getTodayCourse, getMyTask, getRecentFiles, getTeacherInfo } from "@/api/system/teacher"

export default {
  name: "Index",
  data() {
    return {
      version: "1.0.0",
      // 今日课程数据
      todayCourses: [],

      // 任务统计数据
      taskStats: {
        active: 0,
        completed: 0,
        expired: 0
      },
      recentTasks: [],
      // 资源统计数据
      resourceStats: {
        total: 0,
        recent: 0
      },
      recentFiles: [],
      // 科目列表
      subjectList: [],
      // 用户列表
      userList: [],
      // 班级列表
      classList: [],
             // 试题中心数据
       questionCenterData: {
         chapterTables: [],
         assignmentTables: [],
         examPaperList: []
       },
       // 课程详情弹窗相关数据
       courseDetailVisible: false,
       selectedCourse: null,
       // 教师信息测试相关数据
       showTeacherInfoTest: true
    }
  },
  computed: {
    // 按时间排序的今日课程
    sortedTodayCourses() {
      return [...this.todayCourses].sort((a, b) => {
        const timeA = a.startTime || '00:00:00'
        const timeB = b.startTime || '00:00:00'
        return timeA.localeCompare(timeB)
      })
    },
    
    // 教师信息
    teacherInfo() {
      return this.$store.getters.teacherInfo || {}
    },
    
    // 是否应该显示高中学生能力评估
    shouldShowHighSchool() {
      const teacherInfo = this.teacherInfo
      if (!teacherInfo || !teacherInfo.grade) {
        return true
      }
      return teacherInfo.grade === '高中'
    },
    
    // 是否应该显示初中学生能力评估
    shouldShowMiddleSchool() {
      const teacherInfo = this.teacherInfo
      if (!teacherInfo || !teacherInfo.grade) {
        return true
      }
      return teacherInfo.grade === '初中'
    }
  },
  created() {
    this.loadTodayCourses()
    this.loadTaskStats()
    this.loadResourceStats()
    this.loadSubjectList()
    this.loadUserList()
    this.loadClassList()
    this.loadQuestionCenterData()
    this.loadTeacherInfo()
  },
  methods: {
    // 加载今日课程
    async loadTodayCourses() {
      try {
        const response = await getTodayCourse()
        if (response.code === 200) {
          this.todayCourses = response.data || []
        } else {
          console.error('获取今日课程失败:', response.msg)
          this.todayCourses = []
        }
      } catch (error) {
        console.error('加载今日课程失败:', error)
        this.todayCourses = []
      }
    },



    // 加载任务统计
    async loadTaskStats() {
      try {
        const response = await getMyTask()
        if (response.code === 200) {
          const tasks = response.data || []
          
          const now = new Date()
          // 只显示未过期的任务
          this.recentTasks = tasks.filter(task => {
            const endTime = new Date(task.endTime)
            return endTime > now
          }).slice(0, 5)
          
          // 统计信息（虽然不显示，但保留数据结构）
          this.taskStats = {
            active: tasks.filter(task => {
              const endTime = new Date(task.endTime)
              return endTime > now && parseInt(task.currentProgress) < 100
            }).length,
            completed: tasks.filter(task => parseInt(task.currentProgress) === 100).length,
            expired: tasks.filter(task => {
              const endTime = new Date(task.endTime)
              return endTime < now
            }).length
          }
        } else {
          console.error('获取任务数据失败:', response.msg)
          this.taskStats = { active: 0, completed: 0, expired: 0 }
          this.recentTasks = []
        }
      } catch (error) {
        console.error('加载任务统计失败:', error)
        this.taskStats = { active: 0, completed: 0, expired: 0 }
        this.recentTasks = []
      }
    },

    // 加载资源统计
    async loadResourceStats() {
      try {
        // 获取总文件数
        const totalResponse = await listKnowledge({ pageSize: 10000 })
        // 获取最近文件
        const recentResponse = await getRecentFiles()
        
        if (totalResponse.code === 200) {
          const totalFiles = totalResponse.data || totalResponse.rows || []
          this.resourceStats.total = totalFiles.length
        } else {
          console.error('获取总文件数失败:', totalResponse.msg)
          this.resourceStats.total = 0
        }
        
        if (recentResponse.code === 200) {
          const recentFiles = recentResponse.data || []
          this.resourceStats.recent = recentFiles.filter(file => {
            const uploadTime = new Date(file.uploadTime || file.createTime)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return uploadTime > weekAgo
          }).length
          
          this.recentFiles = recentFiles.slice(0, 5)
        } else {
          console.error('获取最近文件失败:', recentResponse.msg)
          this.resourceStats.recent = 0
          this.recentFiles = []
        }
      } catch (error) {
        console.error('加载资源统计失败:', error)
        this.resourceStats = { total: 0, recent: 0 }
        this.recentFiles = []
      }
    },

    // 加载科目列表
    async loadSubjectList() {
      try {
        const response = await sysSubjectList()
        this.subjectList = response.data || []
      } catch (error) {
        console.error('加载科目列表失败:', error)
      }
    },

    // 加载用户列表
    async loadUserList() {
      try {
        const response = await sysUserList()
        console.log('首页用户列表API响应:', response)
        if (response.code === 200) {
          this.userList = response.data || response.rows || []
          console.log('首页用户列表加载完成:', this.userList)
        } else {
          console.error('获取用户列表失败:', response.msg)
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
      }
    },

    // 加载班级列表
    async loadClassList() {
      try {
        const response = await listDept()
        console.log('首页班级列表API响应:', response)
        if (response.code === 200) {
          // 过滤出班级数据（通常班级的deptType为2或者有特定的标识）
          this.classList = (response.data || []).filter(dept => 
            dept.deptType === 2 || dept.deptName.includes('班') || dept.deptName.includes('年级')
          )
          console.log('首页班级列表加载完成:', this.classList)
        } else {
          console.error('获取班级列表失败:', response.msg)
        }
      } catch (error) {
        console.error('加载班级列表失败:', error)
      }
    },

    // 加载试题中心数据
    async loadQuestionCenterData() {
      try {
        const response = await getQuestionCenter()
        if (response.code === 200) {
          this.questionCenterData = response.data || {
            chapterTables: [],
            assignmentTables: [],
            examPaperList: []
          }
        } else {
          console.error('获取试题中心数据失败:', response.msg)
        }
      } catch (error) {
        console.error('加载试题中心数据失败:', error)
      }
    },

    // 加载教师信息
    async loadTeacherInfo() {
      try {
        const response = await getTeacherInfo()
        console.log('教师信息API响应:', response)
        if (response.code === 200) {
          console.log('教师信息数据:', response.data)
          // 保存教师信息到store和localStorage
          this.$store.commit('setTeacherInfo', response.data)
          localStorage.setItem('teacherInfo', JSON.stringify(response.data))
        } else {
          console.error('获取教师信息失败:', response.msg)
        }
      } catch (error) {
        console.error('加载教师信息失败:', error)
      }
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      return timeStr.substring(0, 5)
    },

    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return ''
      const date = new Date(dateTimeStr)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `${month}-${day} ${hour}:${minute}`
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${month}-${day}`
    },

         // 获取科目显示名称
     getSubjectDisplay(subjectCode) {
       const subject = this.subjectList.find(s => s.subjectCode === subjectCode)
       return subject ? subject.subjectName : subjectCode
     },

     // 获取班级名称
     getClassName(deptId) {
       if (!deptId) return '-'
       const classItem = this.classList.find(item => 
         item.deptId === deptId || 
         item.deptId === parseInt(deptId) ||
         item.id === deptId ||
         item.id === parseInt(deptId)
       )
       if (classItem) {
         console.log(`首页找到班级 ${deptId}:`, classItem)
         return classItem.deptName || classItem.name || `班级${deptId}`
       }
       console.log(`首页未找到班级 ${deptId}, 班级列表:`, this.classList)
       return `班级${deptId}`
     },

     // 获取用户名称
     getUserName(userId) {
       if (!userId) return '-'
       const user = this.userList.find(u => u.userId === userId || u.userId === parseInt(userId))
       if (user) {
         console.log(`首页找到用户 ${userId}:`, user)
         return user.nickName || user.userName || user.loginName || `用户${userId}`
       }
       console.log(`首页未找到用户 ${userId}, 用户列表:`, this.userList)
       return `用户${userId}`
     },

    // 获取任务状态类名
    getTaskStatusClass(task) {
      if (parseInt(task.currentProgress) === 100) return 'status-completed'
      return 'status-active'
    },

    // 获取任务状态文本
    getTaskStatusText(task) {
      if (parseInt(task.currentProgress) === 100) return '已完成'
      return '进行中'
    },

         // 显示课程详情
     showCourseDetail(course) {
       this.selectedCourse = course
       this.courseDetailVisible = true
     },

     // 关闭课程详情
     closeCourseDetail() {
       this.selectedCourse = null
       this.courseDetailVisible = false
     },

     // 导航到课程表
     navigateToSchedule() {
       this.$router.push('/schedule')
     },

     // 从课程详情弹窗导航到课程表
     navigateToScheduleFromDialog() {
       // 先关闭弹窗
       this.closeCourseDetail()
       // 然后跳转到课程表页面
       this.$router.push('/schedule')
     },

         // 导航到章节题并触发查看
     navigateToChapterQuestionsWithView(item) {
       // 将选中的项目存储到 sessionStorage，供目标页面使用
       sessionStorage.setItem('selectedChapterItem', JSON.stringify(item))
       sessionStorage.setItem('autoViewMode', 'true')
       this.$router.push('/student/chapterTitle')
     },

     // 导航到作业并触发查看
     navigateToAssignmentsWithView(item) {
       // 将选中的项目存储到 sessionStorage，供目标页面使用
       sessionStorage.setItem('selectedAssignmentItem', JSON.stringify(item))
       sessionStorage.setItem('autoViewMode', 'true')
       this.$router.push({
         path: '/system/myQuestionBank/index',
         query: { type: 'homework' }
       })
     },

     // 导航到组卷并触发查看
     navigateToExamPapersWithView(item) {
       // 将选中的项目存储到 sessionStorage，供目标页面使用
       sessionStorage.setItem('selectedExamItem', JSON.stringify(item))
       sessionStorage.setItem('autoViewMode', 'true')
       this.$router.push({
         path: '/system/myQuestionBank/index',
         query: { type: 'paper' }
       })
     },

     // 导航到章节题
     navigateToChapterQuestions() {
       this.$router.push('/student/chapterTitle')
     },

     // 导航到作业
     navigateToAssignments() {
       this.$router.push({
         path: '/system/myQuestionBank/index',
         query: { type: 'homework' }
       })
     },

     // 导航到组卷
     navigateToExamPapers() {
       this.$router.push({
         path: '/system/myQuestionBank/index',
         query: { type: 'paper' }
       })
     },

    // 导航到任务管理
    navigateToTasks() {
      this.$router.push('/task')
    },

    // 导航到任务管理并触发查看
    navigateToTasksWithView(task) {
      // 将选中的任务存储到 sessionStorage，供目标页面使用
      sessionStorage.setItem('selectedTaskItem', JSON.stringify(task))
      sessionStorage.setItem('autoViewMode', 'true')
      this.$router.push('/task')
    },

         // 导航到资源管理
     navigateToResources() {
       this.$router.push('/resourceCenter/resourceLibrary')
     },
     
     // 刷新教师信息
     async refreshTeacherInfo() {
       await this.loadTeacherInfo()
       this.$message.success('教师信息已刷新')
     }
  }
}
</script>

<style scoped lang="scss">
// 新增/修改的样式部分
$primary-blue: #409EFF;
$light-blue: #ecf5ff;

.ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .welcome-section {
    text-align: center;
    margin-bottom: 30px;
    padding: 40px 20px;
    background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
    border-radius: 12px;
    color: white;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

    .welcome-title {
      font-size: 36px;
      font-weight: 600;
      margin: 0 0 10px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .welcome-subtitle {
      font-size: 18px;
      margin: 0;
      opacity: 0.9;
    }
  }

  .main-cards-row {
    margin-bottom: 30px;

    .module-card {
      background: #409eff;
      border-radius: 12px;
      padding: 24px;
      height: 450px; // 增加卡片高度，确保所有内容都能正常显示
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      }

      .module-icon {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        // background: gray;
        background: rgb(235 226 226 / 50%);

        .el-icon-date::before {
          color: #4facfe;
        }
      }

      .module-content {
        height: 100%;
        display: flex;
        flex-direction: column;

        .module-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #303133;
        }

        .module-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start; // 改为flex-start，确保内容从顶部开始排列
        }
      }

      // 今日课程样式
      &.today-courses {
        background: white;
        color: #409eff;

        .module-icon {
          background: rgb(235 226 226 / 50%);
        }

        .module-title {
          color: #409eff;
        }

        .course-count {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 15px;
        }

          .course-list {
            min-height: 240px;
           max-height: 240px; // 减少最大高度，为按钮留出更多空间
           overflow-y: auto;
           padding-right: 8px;
           padding-bottom: 8px; // 添加底部内边距，确保按钮不被遮挡
           
           &::-webkit-scrollbar {
             width: 6px;
           }
           
           &::-webkit-scrollbar-track {
             background: rgba(255, 255, 255, 0.1);
             border-radius: 3px;
           }
           
           &::-webkit-scrollbar-thumb {
             background: rgba(255, 255, 255, 0.4);
             border-radius: 3px;
             
             &:hover {
               background: rgba(255, 255, 255, 0.6);
             }
           }

           .course-item {
             display: flex;
             justify-content: space-between;
             align-items: center;
            //  border: 1px solid #e6ebf5;
               border-radius: 8px;
               background: #f7fbff;
             margin-bottom: 6px;
             padding:10px 12px;
             border-radius: 8px;
             transition: all 0.3s ease;


             &:hover {
                transform: translateX(5px);
                background-color: #f5f7fa;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
             }

             &:last-child {
               border-bottom: none;
               margin-bottom: 0;
             }

             .course-info {
               display: flex;
               flex-direction: column;
               flex: 1;

               .course-time {
                 font-weight: 500;
                 color: #303133;
                 font-size: 14px;
                 margin-bottom: 4px;
               }

               .course-name {
                 font-weight: 600;
                 font-size: 16px;
                 color: #303133;
               }
             }

              .course-location {
                font-size: 12px;
                color: #303133;
                background: rgba(255, 255, 255, 0.45);
                padding: 4px 8px;
                border-radius: 4px;
                white-space: nowrap;
                max-width: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }

          .view-all-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #99CCFF;
            gap: 8px;
            margin-top: 20px; // 增加上边距，确保按钮不被遮挡
            padding: 12px 20px;
            background: #66B3FF;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: sticky; // 使按钮粘性定位
            bottom: 0; // 固定在底部
            z-index: 10; // 确保按钮在最上层
            background: #66B3FF; // 确保背景色完整显示
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // 添加默认阴影

            &:hover {
              background: #409eff;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            i {
              font-size: 16px;
              color: white;
            }

            span {
              font-size: 14px;
              font-weight: 500;
              color: white;
            }

            .el-icon-arrow-right::before {
              color: white;
            }
          }
        }
      }
    }

         .question-center-card {
       background: white;
       border-radius: 12px;
       padding: 24px;
       height: 450px;
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
       overflow: hidden;

       .section-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
         font-weight: 600;
         color: #303133;
         margin-bottom: 20px;

         .section-title {
           font-size: 20px;
           color: #409eff;
         }
       }

       .question-center-content {
         height: calc(100% - 60px);
        //  overflow-y: auto;
         
         &::-webkit-scrollbar {
           width: 6px;
         }
         
         &::-webkit-scrollbar-track {
           background: #f1f1f1;
           border-radius: 3px;
         }
         
         &::-webkit-scrollbar-thumb {
           background: #c1c1c1;
           border-radius: 3px;
           
           &:hover {
             background: #a8a8a8;
           }
         }
       }

      .data-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        height: 320px;
        margin-bottom: 0;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #303133;
          padding: 12px 0px;
          border-bottom: 1px solid #f0f0f0;
        }

                 .data-content {
           height: calc(100% - 50px);
           overflow-y: auto;
           
           &::-webkit-scrollbar {
             width: 4px;
           }
           
           &::-webkit-scrollbar-track {
             background: #f1f1f1;
             border-radius: 2px;
           }
           
           &::-webkit-scrollbar-thumb {
             background: #c1c1c1;
             border-radius: 2px;
             
             &:hover {
               background: #a8a8a8;
             }
           }

           .data-list {
              .data-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 16px;
              border-bottom: 1px solid #f0f0f0 ;
              transition: all 0.3s ease;
              cursor: pointer;

              &:hover {
                background: #f8f9fa;
                padding-left: 20px;
                padding-right: 20px;
                border-radius: 6px;
                transform: translateY(-5px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }

               &:last-child {
                 border-bottom: none;
               }

               .item-name {
                 flex: 1;
                 font-weight: 500;
                 color: #303133;
                 overflow: hidden;
                 text-overflow: ellipsis;
                 white-space: nowrap;
                 margin-right: 12px;
               }

               .item-time {
                 font-size: 12px;
                 color: #909399;
                 white-space: nowrap;
               }
             }
           }

          .empty-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #909399;

            i {
              font-size: 48px;
              margin-bottom: 16px;
              opacity: 0.5;
            }

            p {
              margin: 0;
              font-size: 14px;
            }
          }
        }
      }

      // 章节题卡片样式
      .chapter-card {
        .card-header {
          color: #409eff;
        }
      }

      // 作业卡片样式
      .assignment-card {
        .card-header {
          color: #67c23a;
        }
      }

      // 组卷卡片样式
      .exam-card {
        .card-header {
          color: #e6a23c;
        }
      }
    }

         .task-card {
       background: white;
       border-radius: 12px;
       padding: 24px;
       height: 400px;
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
       overflow: hidden;

       .section-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
         font-weight: 600;
         color: #303133;
         margin-bottom: 20px;

         .section-title {
           font-size: 20px;
           color: #4facfe;
         }
       }

       .task-content {
         height: calc(100% - 60px);
         overflow-y: auto;
         
         &::-webkit-scrollbar {
           width: 6px;
         }
         
         &::-webkit-scrollbar-track {
           background: #f1f1f1;
           border-radius: 3px;
         }
         
         &::-webkit-scrollbar-thumb {
           background: #c1c1c1;
           border-radius: 3px;
           
           &:hover {
             background: #a8a8a8;
           }
         }

        .task-description {
          display: flex;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
          border-radius: 8px;
          margin-bottom: 20px;

          span {
            font-size: 18px;
            font-weight: 600;
            color: white;
          }
        }

        .task-list {
          .task-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: #f8f9fa;
              transform: translateY(-5px);
            }

            &:last-child {
              border-bottom: none;
            }

            .task-info {
              flex: 1;
              margin-right: 20px;

              .task-name {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 8px;
              }

              .task-details {
                display: flex;
                gap: 12px;

                .task-subject {
                  font-size: 12px;
                  color: #409eff;
                  background: rgba(64, 158, 255, 0.1);
                  padding: 2px 8px;
                  border-radius: 4px;
                }

                .task-type {
                  font-size: 12px;
                  color: #67c23a;
                  background: rgba(103, 194, 58, 0.1);
                  padding: 2px 8px;
                  border-radius: 4px;
                }
              }
            }

            .task-status-info {
              .task-status {
                font-size: 12px;
                padding: 4px 12px;
                border-radius: 12px;
                font-weight: 500;

                &.status-active {
                  background: rgba(64, 158, 255, 0.1);
                  color: #409eff;
                }

                &.status-completed {
                  background: rgba(103, 194, 58, 0.1);
                  color: #67c23a;
                }
              }
            }
          }
        }
      }
    }

    .resource-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      height: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;

        .section-title {
          font-size: 20px;
          color: #4facfe;
        }
      }

      .resource-content {
        height: calc(100% - 60px);
        display: flex;
        flex-direction: column;
        
        .resource-stats-row {
          flex-shrink: 0;
          display: flex;
          justify-content: space-around;
          padding: 6px 20px;
          background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
          border-radius: 8px;
          margin-bottom: 20px;

          .stat-item {
            text-align: center;
            color: white;

            .stat-number {
              display: block;
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 5px;
            }

            .stat-label {
              font-size: 14px;
              opacity: 0.8;
            }
          }
        }
        
        .resource-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
          
          &::-webkit-scrollbar {
            width: 6px;
          }
          
          &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
            
            &:hover {
              background: #a8a8a8;
            }
          }
        }
      }

      .resource-list {
        .empty-resources {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #909399;
          padding: 40px 20px;

          i {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          p {
            margin: 0;
            font-size: 14px;
          }
        }
        
        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: #f8f9fa;
            // transform: translateX(5px);
            transform: translateY(-5px);
          }

          &:last-child {
            border-bottom: none;
          }

          .resource-info {
            flex: 1;
            margin-right: 20px;

            .resource-name {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 8px;
            }

            .resource-details {
              display: flex;
              gap: 12px;

              .resource-subject {
                font-size: 12px;
                color: #66B3FF;
                background: rgba(168, 237, 234, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
              }

              .resource-purpose {
                font-size: 12px;
                color: #67c23a;
                background: rgba(254, 214, 227, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
              }
            }
          }

          .resource-meta {
            .resource-time {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }

  .system-info {
    .info-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      .card-header {
        font-weight: 600;
        color: #303133;
      }

      .info-content {
        p {
          line-height: 1.8;
          margin-bottom: 15px;
          color: #606266;
        }

        .tags {
          margin-top: 20px;

          .el-tag {
            margin-right: 10px;
          }
        }

        .doc-link {
          color: #409eff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;

          &:hover {
            color: #66b1ff;
            text-decoration: underline;
          }
        }
      }
    }
  }

  // 课程详情弹窗样式
  .course-detail-dialog {
    .el-dialog__header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px 25px;
      margin: 0;
      border-radius: 12px 12px 0 0;
    }

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white;
      font-size: 20px;
    }

    .el-dialog__headerbtn:hover .el-dialog__close {
      color: #f0f0f0;
    }

    .el-dialog__body {
      padding: 0;
      background: #f8f9fa;
    }

    .el-dialog__footer {
      background: white;
      padding: 20px 25px;
      border-top: 1px solid #e4e7ed;
      border-radius: 0 0 12px 12px;
    }
  }

  .course-detail {
    padding: 30px;
    background: white;
  }

  .detail-section {
    margin-bottom: 0;
  }

  .detail-section h4 {
    margin: 0 0 25px 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
    border-bottom: 2px solid #667eea;
    padding-bottom: 12px;
    position: relative;
  }

  .detail-section h4::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: #e6a23c;
  }

  .detail-row {
    display: flex;
    margin-bottom: 18px;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s ease;
  }

  .detail-row:hover {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px 12px;
    margin: 0 -12px 18px -12px;
  }

  .detail-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .detail-label {
    font-weight: 600;
    color: #606266;
    width: 120px;
    flex-shrink: 0;
    font-size: 14px;
    position: relative;
    padding-left: 20px;
  }

  .detail-label::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: bold;
    font-size: 18px;
  }

  .detail-value {
    color: #303133;
    flex: 1;
    word-break: break-all;
    font-size: 14px;
    line-height: 1.6;
    padding-left: 15px;
  }

  .dialog-footer .el-button {
    border-radius: 8px;
    font-weight: 500;
    padding: 12px 24px;
    transition: all 0.3s ease;
  }

  .dialog-footer .el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }


// 响应式设计
@media (max-width: 768px) {
  .home {
    padding: 15px;

    .welcome-section {
      padding: 30px 15px;

      .welcome-title {
        font-size: 28px;
      }

      .welcome-subtitle {
        font-size: 16px;
      }
    }

    .main-cards-row {
      .module-card {
        height: 320px;
        padding: 20px;

        .module-content {
          .module-title {
            font-size: 18px;
          }
        }
      }

      .question-center-card {
        height: 320px;
        padding: 20px;

        .data-card {
          height: 240px;
          margin-bottom: 20px;
        }
      }

      .task-card {
        height: 320px;
        padding: 20px;

        .task-content {
          .task-description {
            padding: 15px;
            
            span {
              font-size: 16px;
            }
          }
          
          .task-list {
            .task-item {
              padding: 12px 15px;
              
              .task-info {
                .task-name {
                  font-size: 14px;
                }
                
                .task-details {
                  gap: 8px;
                  
                  .task-subject,
                  .task-type {
                    font-size: 11px;
                    padding: 1px 6px;
                  }
                }
              }
            }
          }
        }
      }

      .resource-card {
        height: 320px;
        padding: 20px;

        .resource-content {
          .resource-stats-row {
            padding: 15px;
            
            .stat-item {
              .stat-number {
                font-size: 20px;
              }
              
              .stat-label {
                font-size: 12px;
              }
            }
          }
          
          .resource-list {
            .resource-item {
              padding: 12px 15px;
              
              .resource-info {
                .resource-name {
                  font-size: 14px;
                }
                
                .resource-details {
                  gap: 8px;
                  
                  .resource-subject,
                  .resource-purpose {
                    font-size: 11px;
                    padding: 1px 6px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  // 移动端优化今日课程卡片
  @media (max-width: 768px) {
    .module-card.today-courses {
      height: 500px; // 移动端增加高度
      
      .course-list {
        min-height: 300px;
        max-height: 300px; // 移动端增加课程列表高度
        padding-bottom: 100px; // 移动端增加底部内边距
      }
      
      .view-all-btn {
        margin-top: 25px; // 移动端增加按钮上边距
        padding: 15px 20px; // 移动端增加按钮内边距
      }
    }
  }
}
</style>

