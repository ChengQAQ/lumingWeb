<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>访问分析</h2>
      <p class="page-description">查看页面访问与接口调用的统计分析数据</p>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>筛选条件</span>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button type="success" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading">导出</el-button>
        </div>
      </div>

      <el-form :model="queryParams" :inline="true" size="small" label-width="100px">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="queryParams.startTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择开始时间"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="queryParams.endTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择结束时间"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item label="页面名称">
          <el-input
            v-model="queryParams.routeName"
            placeholder="请输入页面名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="页面路由">
          <el-input
            v-model="queryParams.pageRoute"
            placeholder="请输入页面路由"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户">
          <el-select
            v-model="queryParams.userId"
            placeholder="请选择或搜索用户"
            filterable
            clearable
            style="width: 200px"
            :filter-method="filterTeacher"
            @change="handleUserChange"
          >
            <el-option
              v-for="teacher in filteredTeacherList"
              :key="teacher.userId"
              :label="`${teacher.nickName || teacher.userName || '未知'} (ID: ${teacher.userId})`"
              :value="teacher.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="页面排行数量">
          <el-input-number
            v-model="queryParams.topPageUsage"
            :min="1"
            :max="100"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="停留时长排行">
          <el-input-number
            v-model="queryParams.topDurationRanking"
            :min="1"
            :max="100"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="接口排行数量">
          <el-input-number
            v-model="queryParams.topApiUsage"
            :min="1"
            :max="100"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="活跃用户数">
          <el-input-number
            v-model="queryParams.topUserListSize"
            :min="1"
            :max="50"
            style="width: 120px"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 汇总统计卡片 -->
    <div class="summary-cards" v-loading="loading">
      <el-card class="summary-card" shadow="hover">
        <div class="card-content">
          <div class="card-icon" style="background: linear-gradient(135deg, #409eff, #66b1ff);">
            <i class="el-icon-view"></i>
          </div>
          <div class="card-info">
            <div class="card-label">页面访问总次数</div>
            <div class="card-value">{{ formatNumber(summaryData.totalPageVisits) }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="summary-card" shadow="hover">
        <div class="card-content">
          <div class="card-icon" style="background: linear-gradient(135deg, #67c23a, #85ce61);">
            <i class="el-icon-time"></i>
          </div>
          <div class="card-info">
            <div class="card-label">页面总停留时长</div>
            <div class="card-value">{{ summaryData.totalStayDurationDisplay || '-' }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="summary-card" shadow="hover">
        <div class="card-content">
          <div class="card-icon" style="background: linear-gradient(135deg, #e6a23c, #f0a020);">
            <i class="el-icon-connection"></i>
          </div>
          <div class="card-info">
            <div class="card-label">接口调用总次数</div>
            <div class="card-value">{{ formatNumber(summaryData.totalApiCalls) }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 排行榜区域 -->
    <el-row :gutter="20" v-loading="loading">
      <!-- 页面访问排行 -->
      <el-col :span="12">
        <el-card class="ranking-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-view"></i> 页面访问排行</span>
          </div>
          <div class="ranking-content">
            <el-table
              :data="summaryData.pageUsage"
              style="width: 100%"
              border
              :max-height="500"
              empty-text="暂无数据"
            >
              <el-table-column type="index" label="排名" width="60" align="center" />
              <el-table-column label="页面名称" prop="routeName" min-width="150" show-overflow-tooltip />
              <el-table-column label="页面路由" prop="pageRoute" min-width="200" show-overflow-tooltip />
              <el-table-column label="访问次数" prop="visitCount" width="100" align="center">
                <template slot-scope="scope">
                  {{ formatNumber(scope.row.visitCount) }}
                </template>
              </el-table-column>
              <el-table-column label="独立用户" prop="uniqueUserCount" width="100" align="center">
                <template slot-scope="scope">
                  {{ formatNumber(scope.row.uniqueUserCount) }}
                </template>
              </el-table-column>
              <el-table-column label="活跃用户TOP N" min-width="200">
                <template slot-scope="scope">
                  <div v-if="scope.row.topUsers && scope.row.topUsers.length > 0" class="top-users">
                    <el-tag
                      v-for="(user, index) in scope.row.topUsers"
                      :key="index"
                      size="small"
                      style="margin-right: 5px; margin-bottom: 5px;"
                    >
                      {{ user.userName }}({{ user.callCount }})
                    </el-tag>
                  </div>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 页面停留时长排行 -->
      <el-col :span="12">
        <el-card class="ranking-card" shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-time"></i> 页面停留时长排行</span>
          </div>
          <div class="ranking-content">
            <el-table
              :data="summaryData.pageDurationRanking"
              style="width: 100%"
              border
              :max-height="500"
              empty-text="暂无数据"
            >
              <el-table-column type="index" label="排名" width="60" align="center" />
              <el-table-column label="页面名称" prop="routeName" min-width="150" show-overflow-tooltip />
              <el-table-column label="页面路由" prop="pageRoute" min-width="200" show-overflow-tooltip />
              <el-table-column label="停留时长" prop="totalStayDurationDisplay" width="180" align="center" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 接口调用排行 -->
    <el-card class="ranking-card" shadow="hover" style="margin-top: 20px;">
      <div slot="header" class="card-header">
        <span><i class="el-icon-connection"></i> 接口调用排行</span>
      </div>
      <div class="ranking-content">
        <el-table
          :data="summaryData.apiUsage"
          style="width: 100%"
          border
          :max-height="500"
          empty-text="暂无数据"
        >
          <el-table-column type="index" label="排名" width="60" align="center" />
          <el-table-column label="接口路径" prop="apiFullPath" min-width="250" show-overflow-tooltip />
          <el-table-column label="请求方法" prop="requestMethod" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getMethodType(scope.row.requestMethod)" size="small">
                {{ scope.row.requestMethod }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="调用次数" prop="callCount" width="120" align="center">
            <template slot-scope="scope">
              {{ formatNumber(scope.row.callCount) }}
            </template>
          </el-table-column>
          <el-table-column label="独立用户" prop="uniqueUserCount" width="120" align="center">
            <template slot-scope="scope">
              {{ formatNumber(scope.row.uniqueUserCount) }}
            </template>
          </el-table-column>
          <el-table-column label="活跃用户TOP N" min-width="200">
            <template slot-scope="scope">
              <div v-if="scope.row.topUsers && scope.row.topUsers.length > 0" class="top-users">
                <el-tag
                  v-for="(user, index) in scope.row.topUsers"
                  :key="index"
                  size="small"
                  style="margin-right: 5px; margin-bottom: 5px;"
                >
                  {{ user.userName }}({{ user.callCount }})
                </el-tag>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getRecordAnalysisSummary, exportRecordAnalysis } from '@/api/system/recordAnalysis'
import { getTeacherList } from '@/api/system/knowledge'

export default {
  name: 'LearningAnalysis',
  data() {
    return {
      loading: false,
      exportLoading: false,
      queryParams: {
        startTime: null,
        endTime: null,
        routeName: null,
        pageRoute: null,
        userId: null,
        topPageUsage: 10,
        topDurationRanking: 10,
        topApiUsage: 10,
        topUserListSize: 5
      },
      summaryData: {
        pageUsage: [],
        pageDurationRanking: [],
        apiUsage: [],
        totalPageVisits: 0,
        totalStayDuration: 0,
        totalStayDurationDisplay: '',
        totalApiCalls: 0
      },
      // 教师列表
      teacherList: [],
      filteredTeacherList: [],
      teacherSearchKeyword: ''
    }
  },
  created() {
    // 设置默认时间范围（最近30天）
    const endTime = new Date()
    const startTime = new Date()
    startTime.setDate(startTime.getDate() - 30)
    
    this.queryParams.endTime = this.formatDateTime(endTime)
    this.queryParams.startTime = this.formatDateTime(startTime)
    
    // 加载教师列表
    this.loadTeacherList()
    // 加载数据
    this.loadData()
  },
  methods: {
    // 加载教师列表
    async loadTeacherList() {
      try {
        const response = await getTeacherList()
        
        // 处理不同的响应格式
        let teacherData = []
        
        if (response.code !== undefined) {
          if (response.code === 200) {
            if (Array.isArray(response.data)) {
              teacherData = response.data
            } else if (response.data && typeof response.data === 'object') {
              teacherData = [response.data]
            } else {
              teacherData = response.rows || response.data || []
            }
          } else {
            console.error('获取教师列表失败:', response.msg)
            this.teacherList = []
            this.filteredTeacherList = []
            return
          }
        } else if (Array.isArray(response)) {
          teacherData = response
        } else if (response && typeof response === 'object' && response.userId) {
          teacherData = [response]
        } else {
          teacherData = []
        }
        
        this.teacherList = Array.isArray(teacherData) ? teacherData : []
        this.filteredTeacherList = [...this.teacherList]
      } catch (error) {
        console.error('获取教师列表失败:', error)
        this.teacherList = []
        this.filteredTeacherList = []
      }
    },
    // 过滤教师列表
    filterTeacher(query) {
      this.teacherSearchKeyword = query || ''
      if (!query) {
        this.filteredTeacherList = [...this.teacherList]
      } else {
        const keyword = query.toLowerCase()
        this.filteredTeacherList = this.teacherList.filter(teacher => {
          const nickName = (teacher.nickName || teacher.userName || '').toLowerCase()
          const userId = String(teacher.userId || '')
          return nickName.includes(keyword) || userId.includes(keyword)
        })
      }
    },
    // 用户选择变化
    handleUserChange(value) {
      this.queryParams.userId = value
    },
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = { ...this.queryParams }
        
        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === '' || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await getRecordAnalysisSummary(params)
        
        if (response.code === 200) {
          this.summaryData = {
            pageUsage: response.data?.pageUsage || [],
            pageDurationRanking: response.data?.pageDurationRanking || [],
            apiUsage: response.data?.apiUsage || [],
            totalPageVisits: response.data?.totalPageVisits || 0,
            totalStayDuration: response.data?.totalStayDuration || 0,
            totalStayDurationDisplay: response.data?.totalStayDurationDisplay || '',
            totalApiCalls: response.data?.totalApiCalls || 0
          }
        } else {
          this.$message.error('获取数据失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('获取访问分析数据失败:', error)
        this.$message.error('获取数据失败：' + (error.message || '网络错误'))
      } finally {
        this.loading = false
      }
    },
    // 查询
    handleQuery() {
      this.loadData()
    },
    // 重置
    resetQuery() {
      // 重置时间范围（最近30天）
      const endTime = new Date()
      const startTime = new Date()
      startTime.setDate(startTime.getDate() - 30)
      
      this.queryParams = {
        startTime: this.formatDateTime(startTime),
        endTime: this.formatDateTime(endTime),
        routeName: null,
        pageRoute: null,
        userId: null,
        topPageUsage: 10,
        topDurationRanking: 10,
        topApiUsage: 10,
        topUserListSize: 5
      }
      this.loadData()
    },
    // 导出
    async handleExport() {
      this.exportLoading = true
      try {
        const params = { ...this.queryParams }
        
        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === '' || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await exportRecordAnalysis(params)
        
        // 处理文件下载
        // 由于 responseType 为 'blob' 时，响应拦截器直接返回 res.data（blob 数据）
        // 所以 response 直接就是 blob 数据，不是完整的响应对象
        let blobData = response
        let fileName = '访问分析数据'
        
        // 检查 response 是否是完整的响应对象（有 headers）
        if (response && response.headers) {
          blobData = response.data || response
          // 尝试从 headers 获取文件名
          const contentDisposition = response.headers['content-disposition']
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
            if (fileNameMatch && fileNameMatch[1]) {
              fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''))
              // 移除 .xlsx 扩展名（如果有），后面会统一添加时间戳
              fileName = fileName.replace(/\.xlsx?$/i, '')
            }
          }
        } else if (response instanceof Blob) {
          // response 直接是 Blob 对象
          blobData = response
        }

        // 生成带时间戳的文件名
        const now = new Date()
        const timestamp = now.getFullYear() + 
          String(now.getMonth() + 1).padStart(2, '0') + 
          String(now.getDate()).padStart(2, '0') + 
          String(now.getHours()).padStart(2, '0') + 
          String(now.getMinutes()).padStart(2, '0') + 
          String(now.getSeconds()).padStart(2, '0')
        fileName = `${fileName}_${timestamp}.xlsx`

        const blob = new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败：' + (error.message || '网络错误'))
      } finally {
        this.exportLoading = false
      }
    },
    // 格式化数字（添加千分位）
    formatNumber(num) {
      if (num === null || num === undefined) return '0'
      return Number(num).toLocaleString()
    },
    // 格式化日期时间
    formatDateTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    // 获取请求方法标签类型
    getMethodType(method) {
      const typeMap = {
        'GET': 'success',
        'POST': 'primary',
        'PUT': 'warning',
        'DELETE': 'danger',
        'PATCH': 'info'
      }
      return typeMap[method] || 'info'
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 汇总统计卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  word-break: break-all;
}

/* 排行榜卡片 */
.ranking-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.ranking-content {
  padding: 10px 0;
}

.top-users {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-card .el-form {
    display: flex;
    flex-direction: column;
  }
  
  .filter-card .el-form-item {
    width: 100%;
  }
}
</style>
