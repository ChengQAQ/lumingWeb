<template>
  <div class="app-container">
    <!-- 查询考试系列详细成绩状态模块 -->
    <el-card class="box-card search-card">
      <div slot="header" class="clearfix">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="card-title">查询考试系列详细成绩状态</span>
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </div>
      </div>

      <!-- 搜索表单 -->
      <el-form
        ref="searchForm"
        :model="searchForm"
        :rules="searchRules"
        label-width="120px"
        class="search-form"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="年级" prop="grade">
              <el-select
                v-model="searchForm.grade"
                placeholder="请选择年级"
                style="width: 100%"
                clearable
              >
                <el-option label="高一" value="高一" />
                <el-option label="高二" value="高二" />
                <el-option label="高三" value="高三" />
                <el-option label="初一" value="初一" />
                <el-option label="初二" value="初二" />
                <el-option label="初三" value="初三" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="考试名称" prop="exam_name">
              <el-input
                v-model="searchForm.exam_name"
                placeholder="请输入考试名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="考试时间" prop="exam_time">
              <el-date-picker
                v-model="searchForm.exam_time"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择考试时间"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" @click="handleSearch">搜索</el-button>
          <el-button @click="handleSearchReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 搜索结果 -->
      <div v-if="searchResultData" class="search-result">
        <div class="result-content">
          <!-- 有数据时显示科目列表和删除按钮 -->
          <div 
            v-if="searchResultData.success && 
                  ((searchResultData.exams_with_detail_score && searchResultData.exams_with_detail_score.length > 0) ||
                   (searchResultData.exams_without_detail_score && searchResultData.exams_without_detail_score.length > 0))"
            style="display: flex; align-items: center; gap: 20px;"
          >
            <!-- 科目列表显示 -->
            <div class="subject-list-display" style="flex: 1; display: flex; flex-direction: column; gap: 12px; line-height: 32px; font-size: 14px;">
              <!-- 已上传的考试成绩科目 -->
              <div>
                <span v-if="searchResultData.exams_with_detail_score && searchResultData.exams_with_detail_score.length > 0">
                  <span style="color: #67C23A; font-weight: 500;">已上传的考试成绩科目：</span>
                  <span style="color: #303133;">
                    <span
                      v-for="(exam, index) in searchResultData.exams_with_detail_score"
                      :key="exam.exam_id"
                    >
                      <span>{{ exam.subject_name }}</span>
                      <span v-if="index < searchResultData.exams_with_detail_score.length - 1">、</span>
                    </span>
                  </span>
                </span>
                <span v-else style="color: #909399;">
                  <span style="font-weight: 500;">已上传的考试成绩科目：</span>
                  <span>无</span>
                </span>
              </div>

              <!-- 未上传的考试成绩科目 -->
              <div>
                <span v-if="searchResultData.exams_without_detail_score && searchResultData.exams_without_detail_score.length > 0">
                  <span style="color: #E6A23C; font-weight: 500;">未上传的考试成绩科目：</span>
                  <span style="color: #303133;">
                    <span
                      v-for="(exam, index) in searchResultData.exams_without_detail_score"
                      :key="exam.exam_id"
                    >
                      <span>{{ exam.subject_name }}</span>
                      <span v-if="index < searchResultData.exams_without_detail_score.length - 1">、</span>
                    </span>
                  </span>
                </span>
                <span v-else style="color: #909399;">
                  <span style="font-weight: 500;">未上传的考试成绩科目：</span>
                  <span>无</span>
                </span>
              </div>
            </div>
            <!-- 操作按钮 -->
            <div style="flex-shrink: 0; display: flex; gap: 10px;">
              <el-button 
                type="primary" 
                @click="handleViewReport"
                :disabled="!canViewReport"
              >
                考试详情
              </el-button>
              <el-button 
                type="danger" 
                :loading="deleteLoading" 
                :disabled="!canDelete"
                @click="handleDelete"
              >
                删除考试系列
              </el-button>
            </div>
          </div>

          <!-- 无数据提示 -->
          <el-empty
            v-else-if="searchResultData.success"
            description="暂无考试数据"
            style="margin-top: 20px;"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getExamSeriesDetailScoreStatus, deleteExamSeries } from '@/api/system/exam'

export default {
  name: 'ExamUpload',
  data() {
    return {
      // 查询考试系列详细成绩状态
      searchForm: {
        grade: '',
        exam_name: '',
        exam_time: ''
      },
      searchRules: {
        grade: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        exam_time: [
          { required: true, message: '请选择考试时间', trigger: 'change' }
        ]
      },
      searchLoading: false,
      searchResultData: null,
      deleteLoading: false
    }
  },
  computed: {
    // 判断是否可以删除（需要有查询结果数据）
    canDelete() {
      return (
        this.searchResultData &&
        this.searchResultData.success &&
        this.searchResultData.exam_series_info &&
        (this.searchResultData.exams_with_detail_score?.length > 0 || 
         this.searchResultData.exams_without_detail_score?.length > 0)
      )
    },
    // 判断是否可以查看报告（需要有查询结果数据）
    canViewReport() {
      return (
        this.searchResultData &&
        this.searchResultData.success &&
        this.searchResultData.exam_series_info &&
        (this.searchResultData.exams_with_detail_score?.length > 0 || 
         this.searchResultData.exams_without_detail_score?.length > 0)
      )
    }
  },
  methods: {
    /** 新增按钮 - 跳转到上传页面 */
    handleAdd() {
      this.$router.push({
        name: 'ExamUploadForm'
      })
    },
    /** 搜索考试系列详细成绩状态 */
    handleSearch() {
      this.$refs.searchForm.validate(valid => {
        if (valid) {
          this.searchLoading = true
          this.searchResultData = null

          getExamSeriesDetailScoreStatus({
            grade: this.searchForm.grade,
            exam_name: this.searchForm.exam_name,
            exam_time: this.searchForm.exam_time
          })
            .then(response => {
              this.searchLoading = false
              // 处理返回数据，支持两种格式：直接返回data或包装在response中
              if (response && (response.success || response.code === 200)) {
                // 如果返回的数据中有data字段，使用data字段；否则直接使用response
                this.searchResultData = response.data || response
                // 确保success字段存在
                if (!this.searchResultData.success && response.success) {
                  this.searchResultData.success = true
                }
                this.$message.success(response.message || this.searchResultData.message || '查询成功')
              } else {
                this.$message.error(response.message || '查询失败')
                this.searchResultData = response
              }
            })
            .catch(error => {
              this.searchLoading = false
              console.error('查询考试系列详细成绩状态失败:', error)
              this.$message.error('查询失败：' + (error.message || '网络错误'))
            })
        } else {
          this.$message.warning('请完善搜索条件')
          return false
        }
      })
    },
    /** 重置搜索表单 */
    handleSearchReset() {
      this.searchForm.grade = ''
      this.searchForm.exam_name = ''
      this.searchForm.exam_time = ''

      if (this.$refs.searchForm) {
        this.$refs.searchForm.resetFields()
      }

      this.searchResultData = null
    },
    /** 删除考试系列 */
    handleDelete() {
      this.$confirm('确定要删除该考试系列吗？删除后无法恢复！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteLoading = true

        // 从查询结果中获取数据
        const examSeriesInfo = this.searchResultData.exam_series_info
        if (!examSeriesInfo) {
          this.$message.warning('查询结果中缺少考试系列信息')
          this.deleteLoading = false
          return
        }

        // 从 exams_with_detail_score 或 exams_without_detail_score 中获取 type
        let examType = ''
        if (this.searchResultData.exams_with_detail_score && this.searchResultData.exams_with_detail_score.length > 0) {
          examType = this.searchResultData.exams_with_detail_score[0].type || ''
        } else if (this.searchResultData.exams_without_detail_score && this.searchResultData.exams_without_detail_score.length > 0) {
          examType = this.searchResultData.exams_without_detail_score[0].type || ''
        }

        if (!examType) {
          this.$message.warning('无法获取考试类型，无法删除')
          this.deleteLoading = false
          return
        }

        deleteExamSeries({
          exam_time: examSeriesInfo.exam_time,
          exam_name: examSeriesInfo.exam_name,
          grade: examSeriesInfo.grade,
          type: examType
        })
          .then(response => {
            this.deleteLoading = false
            if (response && (response.success || response.code === 200)) {
              this.$message.success(response.message || '删除成功')
              // 删除成功后，清空搜索结果
              this.searchResultData = null
            } else {
              this.$message.error(response.message || '删除失败')
            }
          })
          .catch(error => {
            this.deleteLoading = false
            console.error('删除考试系列失败:', error)
            this.$message.error('删除失败：' + (error.message || '网络错误'))
          })
      }).catch(() => {
        // 用户取消删除
        this.$message.info('已取消删除')
      })
    },
    /** 查看考试详情 */
    handleViewReport() {
      if (!this.searchResultData) {
        this.$message.warning('查询结果数据不存在')
        return
      }

      // 获取 exams_with_detail_score 数据
      const examsWithDetailScore = this.searchResultData.exams_with_detail_score || []
      
      if (examsWithDetailScore.length === 0) {
        this.$message.warning('暂无已上传详细成绩的考试数据')
        return
      }

      // 将数据存储到 localStorage
      localStorage.setItem('examsWithDetailScore', JSON.stringify(examsWithDetailScore))

      // 跳转到报告页面
      this.$router.push({
        name: 'ExamReport'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.box-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.search-form {
  margin-top: 20px;
}

.search-result {
  margin-top: 20px;
}

.subject-list-display {
  line-height: 32px;
  font-size: 14px;
}
</style>
