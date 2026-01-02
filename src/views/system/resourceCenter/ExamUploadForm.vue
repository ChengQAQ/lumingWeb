<template>
  <div class="app-container" :class="{ 'layout-collapsed': isSeriesCreated, 'layout-uploaded': isTotalUploaded }">
    <!-- 上传遮罩层 -->
    <div v-if="uploadLoading || detailUploadLoading" class="upload-mask">
      <div class="upload-mask-content">
        <i class="el-icon-loading"></i>
        <p>正在上传，请稍候...</p>
      </div>
    </div>

    <div class="cards-wrapper">
      <!-- 创建考试系列板块 -->
      <el-card
        class="box-card series-card"
        :class="{ 'collapsed': isSeriesCreated }"
      >
        <div slot="header" class="clearfix">
          <span class="card-title">创建考试系列</span>
        </div>

      <!-- 表单区域：创建成功后隐藏 -->
      <el-form
        v-if="!isSeriesCreated"
        ref="examForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="exam-form"
      >
        <el-form-item label="考试时间" prop="exam_time">
          <el-date-picker
            v-model="form.exam_time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择考试时间"
            style="width: 100%"
            clearable
          />
        </el-form-item>

        <el-form-item label="考试名称" prop="exam_name">
          <el-input
            v-model="form.exam_name"
            placeholder="请输入考试名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="年级" prop="grade">
          <el-select
            v-model="form.grade"
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

        <el-form-item label="考试类型" prop="type">
          <el-input
            v-model="form.type"
            placeholder="请输入考试类型（如：月考、期中考试、期末考试等）"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :disabled="!canSubmit"
            :loading="loading"
            @click="handleSubmit"
          >
            生成
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 结果显示区域：创建成功后显示 -->
      <div v-if="resultData && isSeriesCreated" class="result-section">
        <el-divider content-position="left">生成结果</el-divider>
        <el-alert
          :title="resultData.message"
          :type="resultData.success ? 'success' : 'error'"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />

        <div v-if="resultData.success" class="result-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="考试名称">
              {{ resultData.exam_name }}
            </el-descriptions-item>
            <el-descriptions-item label="考试时间">
              {{ resultData.exam_time }}
            </el-descriptions-item>
            <el-descriptions-item label="年级">
              {{ resultData.grade }}
            </el-descriptions-item>
            <el-descriptions-item label="插入记录数">
              <el-tag type="success">{{ resultData.inserted_count }} 条</el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="resultData.subjects && resultData.subjects.length > 0" class="subjects-list">
            <h4 style="margin: 20px 0 10px 0; color: #606266">包含科目：</h4>
            <el-tag
              v-for="(subject, index) in resultData.subjects"
              :key="index"
              style="margin: 5px"
            >
              {{ subject }}
            </el-tag>
          </div>
        </div>
      </div>
      </el-card>

      <!-- 总表和分表容器 -->
      <div class="upload-cards-container" :class="{ 'expanded': isSeriesCreated, 'uploaded': isTotalUploaded }" style="justify-content: space-between;">
        <!-- 上传成绩总表板块 -->
        <el-card
          class="box-card upload-card"
          :class="{ 'expanded': isSeriesCreated }"
        >
        <div slot="header" class="clearfix">
          <span class="card-title">上传成绩总表</span>
        </div>

        <!-- 初始状态：只显示标题，隐藏表单 -->
        <div
          v-if="!isSeriesCreated"
          class="upload-card-placeholder"
          style="padding-top: 20px; cursor: pointer;"
          @click="handleUploadCardClick"
        >
          <div class="placeholder-content">
            <i class="el-icon-upload2"></i>
            <p>等待创建考试系列后使用</p>
            <p>若已创建过考试系列，请点击本窗口即可显示表单</p>
          </div>
        </div>

        <!-- 创建成功后且未上传：显示完整表单 -->
        <el-form
          v-if="isSeriesCreated && !isTotalUploaded"
          ref="uploadForm"
          :model="uploadForm"
          :rules="uploadRules"
          label-width="120px"
          class="exam-form"
        >
        <el-form-item label="考试时间" prop="exam_time">
          <el-date-picker
            v-model="uploadForm.exam_time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择考试时间"
            style="width: 100%"
            clearable
          />
        </el-form-item>

        <el-form-item label="考试名称" prop="exam_name">
          <el-input
            v-model="uploadForm.exam_name"
            placeholder="请输入考试名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="年级" prop="grade">
          <el-select
            v-model="uploadForm.grade"
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

        <el-form-item label="成绩文件" prop="file">
          <el-upload
            ref="upload"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-exceed="handleFileExceed"
            :file-list="fileList"
            :limit="1"
            accept=".xls,.xlsx,.csv"
            drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :disabled="!canUpload"
            :loading="uploadLoading"
            @click="handleUpload"
          >
            上传
          </el-button>
          <el-button @click="handleUploadReset">重置</el-button>
        </el-form-item>
      </el-form>

        <!-- 上传结果显示区域：上传成功后显示 -->
        <div v-if="uploadResultData && isSeriesCreated && isTotalUploaded" class="result-section">
        <el-divider content-position="left">上传结果</el-divider>
        <el-alert
          :title="uploadResultData.detail || uploadResultData.message"
          :type="uploadResultData.success ? 'success' : 'error'"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />

        <div v-if="uploadResultData.success" class="result-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="插入学生成绩">
              <el-tag type="success">{{ uploadResultData.inserted_count || 0 }} 条</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="跳过重复记录">
              <el-tag type="warning">{{ uploadResultData.skipped_count || 0 }} 条</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="插入班级统计">
              <el-tag type="info">{{ uploadResultData.class_stats_inserted_count || 0 }} 条</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="更新年级均分">
              <el-tag>{{ uploadResultData.grade_average_updated_count || 0 }} 个</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="更新学生排名">
              <el-tag type="success">{{ uploadResultData.ranking_updated_count || 0 }} 个</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="更新考试分数线">
              <el-tag type="primary">{{ uploadResultData.updated_exams_count || 0 }} 个</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="总耗时" :span="2">
              <el-tag type="info">
                {{ (uploadResultData.total_processing_time || 0).toFixed(2) }} 秒
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          </div>
        </div>
        </el-card>

        <!-- 上传成绩分表板块 -->
        <el-card
          class="box-card detail-card"
          :class="{ 'expanded': isTotalUploaded }"
        >
          <div slot="header" class="clearfix">
            <span class="card-title">上传成绩分表</span>
          </div>

          <!-- 初始状态：只显示标题，隐藏表单 -->
          <div
            v-if="!isTotalUploaded"
            class="upload-card-placeholder"
            style="cursor: pointer;"
            @click="handleDetailCardClick"
          >
            <div class="placeholder-content">
              <i class="el-icon-upload2"></i>
              <p>等待上传成绩总表后使用</p>
              <p>若已创建过考试系列、并上传过总表，请点击本窗口即可显示表单</p>
            </div>
          </div>

          <!-- 总表上传成功后：显示完整表单 -->
          <el-form
            v-if="isTotalUploaded"
            ref="detailUploadForm"
            :model="detailUploadForm"
            :rules="detailUploadRules"
            label-width="120px"
            class="exam-form"
          >
            <el-form-item label="考试时间" prop="exam_time">
              <el-date-picker
                v-model="detailUploadForm.exam_time"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择考试时间"
                style="width: 100%"
                clearable
              />
            </el-form-item>

            <el-form-item label="考试名称" prop="exam_name">
              <el-input
                v-model="detailUploadForm.exam_name"
                placeholder="请输入考试名称"
                clearable
              />
            </el-form-item>

            <el-form-item label="年级" prop="grade">
              <el-select
                v-model="detailUploadForm.grade"
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

            <el-form-item label="成绩文件" prop="file">
              <el-upload
                ref="detailUpload"
                action="#"
                :auto-upload="false"
                :on-change="handleDetailFileChange"
                :on-remove="handleDetailFileRemove"
                :on-exceed="handleDetailFileExceed"
                :file-list="detailFileList"
                :limit="1"
                accept=".xls,.xlsx,.csv"
                drag
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
              </el-upload>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :disabled="!canDetailUpload"
                :loading="detailUploadLoading"
                @click="handleDetailUpload"
              >
                上传
              </el-button>
              <el-button @click="handleDetailUploadReset">重置</el-button>
            </el-form-item>
          </el-form>

          <!-- 上传结果显示区域 -->
          <div v-if="detailUploadResultData && isTotalUploaded" class="result-section">
            <el-divider content-position="left">上传结果</el-divider>
            <el-alert
              :title="detailUploadResultData.message"
              :type="detailUploadResultData.success ? 'success' : 'error'"
              :closable="false"
              show-icon
              style="margin-bottom: 20px"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { createExamSeries, uploadTotalScoreFile, uploadDetailScoreFile } from '@/api/system/exam'

export default {
  name: 'ExamUploadForm',
  data() {
    return {
      // 创建考试系列表单
      form: {
        exam_time: '',
        exam_name: '',
        grade: '',
        type: ''
      },
      rules: {
        exam_time: [
          { required: true, message: '请选择考试时间', trigger: 'change' }
        ],
        exam_name: [
          { required: true, message: '请输入考试名称', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请输入考试类型', trigger: 'blur' }
        ]
      },
      loading: false,
      resultData: null,
      isSeriesCreated: false, // 标记考试系列是否创建成功

      // 上传成绩文件表单
      uploadForm: {
        exam_time: '',
        exam_name: '',
        grade: ''
      },
      uploadRules: {
        exam_time: [
          { required: true, message: '请选择考试时间', trigger: 'change' }
        ],
        exam_name: [
          { required: true, message: '请输入考试名称', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        file: [
          {
            required: true,
            message: '请选择要上传的文件',
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (this.fileList && this.fileList.length > 0) {
                callback()
              } else {
                callback(new Error('请选择要上传的文件'))
              }
            }
          }
        ]
      },
      fileList: [],
      uploadLoading: false,
      uploadResultData: null,
      isTotalUploaded: false, // 标记总表是否上传成功

      // 上传成绩分表表单
      detailUploadForm: {
        exam_time: '',
        exam_name: '',
        grade: ''
      },
      detailUploadRules: {
        exam_time: [
          { required: true, message: '请选择考试时间', trigger: 'change' }
        ],
        exam_name: [
          { required: true, message: '请输入考试名称', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        file: [
          {
            required: true,
            message: '请选择要上传的文件',
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (this.detailFileList && this.detailFileList.length > 0) {
                callback()
              } else {
                callback(new Error('请选择要上传的文件'))
              }
            }
          }
        ]
      },
      detailFileList: [],
      detailUploadLoading: false,
      detailUploadResultData: null
    }
  },
  computed: {
    // 判断是否可以提交（所有字段都必须填写）
    canSubmit() {
      return (
        this.form.exam_time &&
        this.form.exam_name &&
        this.form.grade &&
        this.form.type
      )
    },
    // 判断是否可以上传（所有字段都必须填写且文件已选择）
    canUpload() {
      return (
        this.uploadForm.exam_time &&
        this.uploadForm.exam_name &&
        this.uploadForm.grade &&
        this.fileList.length > 0
      )
    },
    // 判断是否可以上传分表（所有字段都必须填写且文件已选择）
    canDetailUpload() {
      return (
        this.detailUploadForm.exam_time &&
        this.detailUploadForm.exam_name &&
        this.detailUploadForm.grade &&
        this.detailFileList.length > 0
      )
    }
  },
  methods: {
    /** 提交表单 */
    handleSubmit() {
      this.$refs.examForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.resultData = null

          createExamSeries({
            exam_time: this.form.exam_time,
            exam_name: this.form.exam_name,
            grade: this.form.grade,
            type: this.form.type
          })
            .then(response => {
              this.loading = false
              if (response && response.success) {
                this.resultData = response
                this.isSeriesCreated = true // 标记为已创建，触发动画

                // 将返回的数据填充到上传成绩总表的表单中
                if (response.exam_time) {
                  this.uploadForm.exam_time = response.exam_time
                }
                if (response.exam_name) {
                  this.uploadForm.exam_name = response.exam_name
                }
                if (response.grade) {
                  this.uploadForm.grade = response.grade
                }

                this.$message.success(response.message || '生成成功')
                // 延迟一下，让用户看到成功提示后再执行动画
                this.$nextTick(() => {
                  // 动画会在 CSS 中自动执行
                })
              } else {
                this.$message.error(response.message || '生成失败')
                this.resultData = response
              }
            })
            .catch(error => {
              this.loading = false
              console.error('生成考试系列失败:', error)
              this.$message.error('生成失败：' + (error.message || '网络错误'))
            })
        } else {
          this.$message.warning('请完善表单信息')
          return false
        }
      })
    },
    /** 重置表单 */
    handleReset() {
      this.$refs.examForm.resetFields()
      this.resultData = null
      this.isSeriesCreated = false // 重置状态，恢复初始布局
    },
    /** 文件变化处理 */
    handleFileChange(file, fileList) {
      // 确保文件对象有 raw 属性
      if (file.raw) {
        this.fileList = fileList
      } else if (file) {
        // 如果没有 raw，使用 file 本身
        this.fileList = [file]
      } else {
        this.fileList = fileList
      }

      // 手动触发表单验证
      this.$nextTick(() => {
        if (this.$refs.uploadForm) {
          this.$refs.uploadForm.validateField('file')
        }
      })
    },
    /** 文件移除处理 */
    handleFileRemove(file, fileList) {
      this.fileList = fileList

      // 手动触发表单验证
      this.$nextTick(() => {
        if (this.$refs.uploadForm) {
          this.$refs.uploadForm.validateField('file')
        }
      })
    },
    /** 文件超出限制处理 - 替换旧文件 */
    handleFileExceed(files, fileList) {
      // 移除旧文件，只保留新上传的文件
      // files[0] 是新选择的文件对象（File 对象）
      // 需要转换为 Element UI 需要的格式
      const newFile = files[0]
      this.fileList = [{
        name: newFile.name,
        raw: newFile
      }]

      // 手动触发表单验证
      this.$nextTick(() => {
        if (this.$refs.uploadForm) {
          this.$refs.uploadForm.validateField('file')
        }
      })
    },
    /** 上传文件 */
    handleUpload() {
      // 先检查文件是否已选择
      if (this.fileList.length === 0) {
        this.$message.warning('请选择要上传的文件')
        if (this.$refs.uploadForm) {
          this.$refs.uploadForm.validateField('file')
        }
        return
      }

      this.$refs.uploadForm.validate(valid => {
        if (valid) {
          this.uploadLoading = true
          this.uploadResultData = null

          // 创建 FormData 对象
          const formData = new FormData()
          // 获取文件对象，优先使用 raw，否则使用文件本身
          const file = this.fileList[0].raw || this.fileList[0]
          if (!file) {
            this.$message.warning('文件对象不存在，请重新选择文件')
            this.uploadLoading = false
            return
          }
          formData.append('file', file)
          formData.append('exam_time', this.uploadForm.exam_time)
          formData.append('exam_name', this.uploadForm.exam_name)
          formData.append('grade', this.uploadForm.grade)

          uploadTotalScoreFile(formData)
            .then(response => {
              this.uploadLoading = false
              if (response && response.success) {
                this.uploadResultData = response
                this.isTotalUploaded = true // 标记总表已上传成功

                // 将数据填充到分表表单中
                if (this.uploadForm.exam_time) {
                  this.detailUploadForm.exam_time = this.uploadForm.exam_time
                }
                if (this.uploadForm.exam_name) {
                  this.detailUploadForm.exam_name = this.uploadForm.exam_name
                }
                if (this.uploadForm.grade) {
                  this.detailUploadForm.grade = this.uploadForm.grade
                }

                this.$message.success(response.message || '上传成功')
              } else {
                this.$message.error(response.message || '上传失败')
                this.uploadResultData = response
              }
            })
            .catch(error => {
              this.uploadLoading = false
              console.error('上传成绩文件失败:', error)
              this.$message.error('上传失败：' + (error.message || '网络错误'))
            })
        } else {
          this.$message.warning('请完善表单信息')
          return false
        }
      })
    },
    /** 重置上传表单 */
    handleUploadReset() {
      // 清空三个条件
      this.uploadForm.exam_time = ''
      this.uploadForm.exam_name = ''
      this.uploadForm.grade = ''

      // 重置表单验证状态
      if (this.$refs.uploadForm) {
        this.$refs.uploadForm.resetFields()
      }

      // 清空文件列表
      this.fileList = []
      this.uploadResultData = null
      this.isTotalUploaded = false // 重置上传状态

      // 清空上传组件的文件列表
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },
    /** 分表文件变化处理 */
    handleDetailFileChange(file, fileList) {
      if (file.raw) {
        this.detailFileList = fileList
      } else if (file) {
        this.detailFileList = [file]
      } else {
        this.detailFileList = fileList
      }

      this.$nextTick(() => {
        if (this.$refs.detailUploadForm) {
          this.$refs.detailUploadForm.validateField('file')
        }
      })
    },
    /** 分表文件移除处理 */
    handleDetailFileRemove(file, fileList) {
      this.detailFileList = fileList

      this.$nextTick(() => {
        if (this.$refs.detailUploadForm) {
          this.$refs.detailUploadForm.validateField('file')
        }
      })
    },
    /** 分表文件超出限制处理 - 替换旧文件 */
    handleDetailFileExceed(files, fileList) {
      // 移除旧文件，只保留新上传的文件
      // files[0] 是新选择的文件对象（File 对象）
      // 需要转换为 Element UI 需要的格式
      const newFile = files[0]
      this.detailFileList = [{
        name: newFile.name,
        raw: newFile
      }]

      // 手动触发表单验证
      this.$nextTick(() => {
        if (this.$refs.detailUploadForm) {
          this.$refs.detailUploadForm.validateField('file')
        }
      })
    },
    /** 上传分表文件 */
    handleDetailUpload() {
      if (this.detailFileList.length === 0) {
        this.$message.warning('请选择要上传的文件')
        if (this.$refs.detailUploadForm) {
          this.$refs.detailUploadForm.validateField('file')
        }
        return
      }

      this.$refs.detailUploadForm.validate(valid => {
        if (valid) {
          this.detailUploadLoading = true
          this.detailUploadResultData = null

          const formData = new FormData()
          const file = this.detailFileList[0].raw || this.detailFileList[0]
          if (!file) {
            this.$message.warning('文件对象不存在，请重新选择文件')
            this.detailUploadLoading = false
            return
          }
          formData.append('file', file)
          formData.append('exam_time', this.detailUploadForm.exam_time)
          formData.append('exam_name', this.detailUploadForm.exam_name)
          formData.append('grade', this.detailUploadForm.grade)

          // 调用分表上传接口
          uploadDetailScoreFile(formData).then(response => {
              this.detailUploadLoading = false
                this.detailUploadResultData = response
                this.$message.success(response.message)
            }).catch(error => {
              this.detailUploadLoading = false
              console.error('上传成绩分表失败:', error)
              this.$message.error('上传失败：' + (error.message))
            })
        } else {
          this.$message.warning('请完善表单信息')
          return false
        }
      })
    },
    /** 重置分表上传表单 */
    handleDetailUploadReset() {
      this.detailUploadForm.exam_time = ''
      this.detailUploadForm.exam_name = ''
      this.detailUploadForm.grade = ''

      if (this.$refs.detailUploadForm) {
        this.$refs.detailUploadForm.resetFields()
      }

      this.detailFileList = []
      this.detailUploadResultData = null

      if (this.$refs.detailUpload) {
        this.$refs.detailUpload.clearFiles()
      }
    },
    /** 点击总表卡片 - 执行总表放大动画 */
    handleUploadCardClick() {
      // 直接执行放大动画
      this.isSeriesCreated = true

      // 如果已经创建过考试系列（有结果数据），自动填充表单字段
      if (this.resultData && this.resultData.success) {
        if (this.resultData.exam_time) {
          this.uploadForm.exam_time = this.resultData.exam_time
        }
        if (this.resultData.exam_name) {
          this.uploadForm.exam_name = this.resultData.exam_name
        }
        if (this.resultData.grade) {
          this.uploadForm.grade = this.resultData.grade
        }
      }
    },
    /** 点击分表卡片 - 执行分表放大动画 */
    handleDetailCardClick() {
      // 如果还没有创建考试系列，先设置创建状态，以便触发正确的布局
      if (!this.isSeriesCreated) {
        this.isSeriesCreated = true
      }

      // 直接执行放大动画
      this.isTotalUploaded = true

      // 如果已经上传过总表（有上传结果数据），自动填充表单字段
      if (this.uploadResultData && this.uploadResultData.success) {
        if (this.uploadForm.exam_time) {
          this.detailUploadForm.exam_time = this.uploadForm.exam_time
        }
        if (this.uploadForm.exam_name) {
          this.detailUploadForm.exam_name = this.uploadForm.exam_name
        }
        if (this.uploadForm.grade) {
          this.detailUploadForm.grade = this.uploadForm.grade
        }
      }

      // 如果已经创建过考试系列（有结果数据），自动填充总表表单字段
      if (this.resultData && this.resultData.success) {
        if (this.resultData.exam_time && !this.uploadForm.exam_time) {
          this.uploadForm.exam_time = this.resultData.exam_time
        }
        if (this.resultData.exam_name && !this.uploadForm.exam_name) {
          this.uploadForm.exam_name = this.resultData.exam_name
        }
        if (this.resultData.grade && !this.uploadForm.grade) {
          this.uploadForm.grade = this.resultData.grade
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px 0;
  min-height: 100vh;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.cards-wrapper {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 auto;
  width: 100%;
  position: relative;
}

// 总表和分表容器
.upload-cards-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

// 初始状态：创建考试系列居中，上传卡片在右侧（只显示标题，不影响居中）
.app-container:not(.layout-collapsed) {
  .cards-wrapper {
    flex-direction: row;
    justify-content: center; // 创建考试系列居中
    align-items: flex-start;
    padding: 0 20px;
  }

  .series-card {
    flex: 0 0 800px;
    width: 800px;
    max-width: 800px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0 auto; // 确保居中
  }

  .upload-cards-container {
    position: absolute; // 使用绝对定位，不影响居中
    right: 20px; // 贴紧右侧
    top: 0;
    flex-direction: column; // 垂直排列
    align-items: flex-end; // 右对齐
  }

  .upload-card {
    flex: 0 0 200px;
    width: 200px;
    max-width: 200px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.85;

    // 只显示标题的样式
    ::v-deep .el-card__body {
      padding: 0 15px 15px 15px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-title {
      font-size: 16px;
      text-align: center;
    }

    // 隐藏表单内容
    .exam-form {
      display: none;
    }

    .result-section {
      display: none;
    }
  }

  .detail-card {
    flex: 0 0 200px;
    width: 200px;
    max-width: 200px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.85;

    // 只显示标题的样式
    ::v-deep .el-card__body {
      padding: 15px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-title {
      font-size: 16px;
      text-align: center;
    }

    // 隐藏表单内容
    .exam-form {
      display: none;
    }

    .result-section {
      display: none;
    }

    // 分表放大状态（初始状态下也能放大）
    &.expanded {
      flex: 0 0 800px;
      width: 800px;
      max-width: 800px;
      opacity: 1;

      // 恢复完整样式
      ::v-deep .el-card__body {
        padding: 20px;
        min-height: auto;
        display: block;
      }

      .card-title {
        font-size: 18px;
        text-align: left;
      }

      // 显示表单内容
      .exam-form {
        display: block;
      }

      .result-section {
        display: block;
      }

      // 隐藏占位符
      .upload-card-placeholder {
        display: none;
      }
    }
  }
}

// 创建成功后的状态：创建考试系列贴左侧缩小，总表居中放大，分表在右侧缩小
.app-container.layout-collapsed:not(.layout-uploaded) {
  .cards-wrapper {
    flex-direction: row;
    justify-content: space-between; // 左右分布
    align-items: flex-start;
    padding: 0 20px;
  }

  .series-card {
    flex: 0 0 420px;
    width: 420px;
    max-width: 420px;
    margin: 0; // 贴紧左侧
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    &.collapsed {
      margin-right: 20px;
    }

    // 缩小后的样式调整
    ::v-deep .el-card__body {
      padding: 0 18px 18px 18px;
    }

    .card-title {
      font-size: 16px;
    }
  }

  .upload-cards-container {
    position: relative; // 使用相对定位
    flex: 1; // 占据剩余空间
    display: flex;
    flex-direction: row; // 横向排列
    justify-content: center; // 总表居中
    align-items: flex-start;
    gap: 20px;
  }

  .upload-card {
    flex: 0 0 800px;
    width: 800px;
    max-width: 800px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;

    &.expanded {
      // 恢复完整样式
      ::v-deep .el-card__body {
        padding: 20px;
        min-height: auto;
        display: block;
      }

      .card-title {
        font-size: 18px;
        text-align: left;
      }

      // 显示表单内容
      .exam-form {
        display: block;
      }

      .result-section {
        display: block;
      }

      // 隐藏占位符
      .upload-card-placeholder {
        display: none;
      }
    }
  }

  .detail-card {
    position: absolute; // 使用绝对定位，贴紧右侧
    right: 0;
    top: 0;
    flex: 0 0 200px;
    width: 200px;
    max-width: 200px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.85;

    // 只显示标题的样式
    ::v-deep .el-card__body {
      padding: 15px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-title {
      font-size: 16px;
      text-align: center;
    }

    .exam-form {
      display: none;
    }

    .result-section {
      display: none;
    }

    // 分表放大状态（创建成功后也能放大）
    &.expanded {
      flex: 0 0 800px;
      width: 800px;
      max-width: 800px;
      opacity: 1;
      position: static; // 改为静态定位，参与布局

      // 恢复完整样式
      ::v-deep .el-card__body {
        padding: 20px;
        min-height: auto;
        display: block;
      }

      .card-title {
        font-size: 18px;
        text-align: left;
      }

      // 显示表单内容
      .exam-form {
        display: block;
      }

      .result-section {
        display: block;
      }

      // 隐藏占位符
      .upload-card-placeholder {
        display: none;
      }
    }
  }
}

// 总表上传成功后的状态：总表向右移动，分表向上移动到总表位置并放大居中
.app-container.layout-collapsed.layout-uploaded {
  .cards-wrapper {
    flex-direction: row;
    justify-content: flex-start; // 贴紧左侧
    align-items: flex-start;
    padding: 0 20px;
  }

  .series-card {
    flex: 0 0 420px;
    width: 420px;
    max-width: 420px;
    // margin-right: 20px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .upload-cards-container {
    position: static;
    flex-direction: column; // 保持垂直排列
    align-items: flex-start;

    &.uploaded {
      flex-direction: row; // 总表上传成功后改为横向排列
      align-items: flex-start;

      // 总表上传成功后，总表缩小，分表移动到总表位置
      .upload-card {
        order: 2; // 总表在后面
        flex: 0 0 420px;
        width: 420px;
        max-width: 420px;
        // margin-right: 20px;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 1;

        // 只显示结果
        ::v-deep .el-card__body {
          padding: 20px;
          min-height: auto;
          display: block;
        }

        .card-title {
          font-size: 16px;
          text-align: left;
        }

        // 隐藏表单内容
        .exam-form {
          display: none;
        }

        // 显示结果
        .result-section {
          display: block;
        }

        .upload-card-placeholder {
          display: none;
        }
      }

      .detail-card {
        order: 1; // 分表在前面（视觉上向上移动到总表位置）
        flex: 0 0 800px;
        width: 800px;
        max-width: 800px;
        // margin-right: 20px;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 1;

        &.expanded {
          // 恢复完整样式
          ::v-deep .el-card__body {
            padding: 20px;
            min-height: auto;
            display: block;
          }

          .card-title {
            font-size: 18px;
            text-align: left;
          }

          // 显示表单内容
          .exam-form {
            display: block;
          }

          .result-section {
            display: block;
          }

          // 隐藏占位符
          .upload-card-placeholder {
            display: none;
          }
        }
      }
    }
  }

  .upload-card {
    flex: 0 0 800px;
    width: 800px;
    max-width: 800px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;

    &.expanded {
      // 恢复完整样式
      ::v-deep .el-card__body {
        padding: 20px;
        min-height: auto;
        display: block;
      }

      .card-title {
        font-size: 18px;
        text-align: left;
      }

      // 显示表单内容
      .exam-form {
        display: block;
      }

      .result-section {
        display: block;
      }

      // 隐藏占位符
      .upload-card-placeholder {
        display: none;
      }
    }
  }

  .detail-card {
    flex: 0 0 200px;
    width: 200px;
    max-width: 200px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.85;

    // 只显示标题的样式
    ::v-deep .el-card__body {
      padding: 15px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-title {
      font-size: 16px;
      text-align: center;
    }

    .exam-form {
      display: none;
    }

    .result-section {
      display: none;
    }
  }
}

.box-card {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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

.exam-form {
  margin-top: 20px;
  transition: all 0.3s ease;
}

.result-section {
  // margin-top: 30px;
  // padding-top: 20px;
  animation: fadeIn 0.5s ease-in;
}

.result-info {
  margin-top: 20px;
}

.subjects-list {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.performance-tip {
  margin-top: 10px;
}

// 上传卡片在初始状态下的样式优化
.app-container:not(.layout-collapsed) .upload-card {
  ::v-deep .el-form-item {
    margin-bottom: 15px;
  }

  ::v-deep .el-upload-dragger {
    padding: 20px;
  }

  .result-section {
    font-size: 13px;
  }

  ::v-deep .el-descriptions {
    font-size: 13px;
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 卡片进入动画
.series-card,
.upload-card {
  animation: slideIn 0.5s ease-out;
}

// 占位符样式
.upload-card-placeholder {
  padding: 0 ;
  text-align: center;
  color: #909399;

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100px;

    i {
      font-size: 32px;
      margin-bottom: 10px;
      color: #c0c4cc;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .app-container:not(.layout-collapsed) {
    .cards-wrapper {
      align-items: center;
    }

    .upload-card {
      align-self: center;
      margin-right: 0;
    }
  }

  .app-container.layout-collapsed {
    .cards-wrapper {
      flex-direction: column;
      align-items: center;
    }

    .series-card {
      width: 100%;
      max-width: 100%;
      margin-right: 0;
      margin-bottom: 20px;
    }

    .upload-card {
      width: 100%;
      max-width: 100%;
    }
  }
}

::v-deep .el-descriptions {
  margin-top: 10px;
}

// 上传遮罩层
.upload-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  .upload-mask-content {
    background: #fff;
    padding: 30px 50px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

    i {
      font-size: 32px;
      color: #409eff;
      display: block;
      margin-bottom: 15px;
      animation: rotating 2s linear infinite;
    }

    p {
      margin: 0;
      font-size: 16px;
      color: #606266;
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

