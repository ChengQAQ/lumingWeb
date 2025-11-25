<template>
  <div class="app-container">
    <!-- 任务列表和数字人形象区域 -->
    <div class="main-layout">
      <!-- 左侧任务列表区域 -->
      <div class="left-panel">
        <el-card class="box-card">
          <div slot="header" class="task-list-header">
            <span class="card-title">任务列表</span>
            <div v-if="queueMessage" class="queue-status-inline">
              <el-alert
                :title="queueMessage"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
            <el-button class="refresh-btn" type="text" @click="loadTaskList">刷新</el-button>
          </div>

          <el-table :data="taskList" v-loading="taskListLoading" style="width: 100%" :max-height="400" size="small">
            <el-table-column prop="taskId" label="任务ID" min-width="200"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="180">
              <template slot-scope="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="120">
              <template slot-scope="scope">
                <span v-if="scope.row.progress !== undefined">{{ scope.row.progress }}%</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280">
              <template slot-scope="scope">
                <el-button size="mini" @click="viewTaskDetail(scope.row)">查看详情</el-button>
                <el-button
                  v-if="scope.row.status === 'completed'"
                  size="mini"
                  type="success"
                  @click="downloadVideo(scope.row)"
                >
                  下载视频
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDeleteTask(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="taskQuery.page"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="taskQuery.page_size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="taskTotal"
              :small="false"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧数字人形象管理区域 -->
      <div class="right-panel">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span class="card-title">数字人形象</span>
          </div>

          <!-- 当前用户形象 -->
          <div v-if="userImage" class="current-image-section">
            <div class="image-card">
              <!-- 图片区域 - 顶部中央 -->
              <div class="image-icon">
                <i class="el-icon-user-solid"></i>
              </div>

              <!-- 形象文本 - 中间 -->
              <div class="image-text">
                <div class="text-label">形象文本：</div>
                <div class="text-content">{{ userImage.description || userImage.prompt_text || '暂无描述' }}</div>
              </div>

              <!-- 操作按钮 - 底部 -->
              <div class="image-actions">
                <el-button size="small" type="primary" @click="editImage">
                  <i class="el-icon-edit"></i> 使用该形象
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteTeacherDigitalHuman">
                  <i class="el-icon-delete"></i> 删除该形象
                </el-button>
              </div>
            </div>
          </div>

          <!-- 无形象状态 -->
          <div v-else class="no-image-state">
            <div class="empty-content">
              <i class="el-icon-picture-outline"></i>
              <h4>暂无数字人形象</h4>
              <p>您还没有创建数字人形象，点击下方按钮开始创建</p>
              <el-button type="primary" size="large" @click="createNewImage">
                <i class="el-icon-plus"></i> 创建数字人形象
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 数字人形象生成弹窗 -->
    <el-dialog
      title="数字人形象生成"
      :visible.sync="createImageVisible"
      width="70%"
      :before-close="handleCloseCreateImage"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="form" label-width="120px" class="szr-form">
        <!-- 需生成文稿和参考素材 - 一行显示 -->
        <el-row :gutter="20" class="text-reference-row">
          <el-col :span="12">
            <el-form-item label="需生成文稿" prop="text" class="text-item">
              <el-input
                v-model="form.text"
                type="textarea"
                :rows="8"
                placeholder="请输入需要生成的文稿内容"
                maxlength="2000"
                show-word-limit
                class="text-textarea"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参考素材" prop="referenceFile" class="reference-upload-item">
              <el-upload
                ref="referenceUpload"
                :auto-upload="false"
                :on-change="handleReferenceChange"
                :on-remove="handleReferenceRemove"
                :before-upload="beforeReferenceUpload"
                :file-list="referenceFileList"
                :limit="1"
                :on-exceed="handleReferenceExceed"
                accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv"
                drag
                class="reference-upload"
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将视频或照片拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">
                  支持格式：照片(jpg/jpeg/png/gif) 或 视频(mp4/avi/mov/wmv)，文件大小不超过200MB
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 音频文稿和音频文件 - 一行显示 -->
        <el-row :gutter="20" class="audio-row">
          <el-col :span="12">
            <el-form-item label="音频文件" prop="prompt_wav" class="audio-upload-item">
              <el-upload
                ref="audioUpload"
                :auto-upload="false"
                :on-change="handleAudioChange"
                :on-remove="handleAudioRemove"
                :before-upload="beforeAudioUpload"
                :file-list="audioFileList"
                :limit="1"
                accept=".wav,.mp3,.m4a,.aac"
                drag
                class="audio-upload"
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将音频文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传wav/mp3/m4a/aac格式的音频文件，且不超过50MB</div>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="音频对应文稿" prop="prompt_text" class="audio-text-item">
              <el-input
                v-model="form.prompt_text"
                type="textarea"
                :rows="8"
                placeholder="请输入音频文稿内容"
                maxlength="1000"
                show-word-limit
                class="audio-textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 文件类型显示 -->
        <el-form-item v-if="fileType" label="文件类型" style="padding: 0;">
          <el-tag :type="fileType === 'photo' ? 'success' : 'primary'">
            {{ fileType === 'photo' ? '照片文件' : '视频文件' }}
          </el-tag>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCloseCreateImage">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading" :disabled="!canSubmit">
          {{ fileType === 'photo' ? '照片驱动数字人形象' : '视频驱动数字人形象' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 任务详情弹窗 -->
    <el-dialog
      title="任务详情"
      :visible.sync="taskDetailVisible"
      width="60%"
      :before-close="handleCloseTaskDetail"
    >
      <div v-if="currentTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务ID">{{ currentTask.taskId }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentTask.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTask.status)">
              {{ getStatusText(currentTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="进度">
            <span v-if="currentTask.progress !== undefined">{{ currentTask.progress }}%</span>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 提示信息 -->
        <div v-if="currentTask.message" class="message-section">
          <el-alert :title="currentTask.message" :type="currentTask.status === 'completed' ? 'success' : 'info'" show-icon :closable="false"></el-alert>
        </div>

        <!-- 原始文本和处理后文本 - 左右排版 -->
        <div v-if="(currentTask.results && currentTask.results.original_text) || currentTask.text || (currentTask.results && currentTask.results.cleaned_text)" class="text-section">
          <h4>文本内容</h4>
          <el-row :gutter="20" class="text-row">
            <!-- 左侧：原始文本 -->
            <el-col :span="12" v-if="(currentTask.results && currentTask.results.original_text) || currentTask.text">
              <div class="text-content">
                <div class="text-item">
                  <div class="text-label">{{ currentTask.results && currentTask.results.original_text ? '原始文本：' : '输入文本：' }}</div>
                  <div class="text-value">{{ currentTask.results && currentTask.results.original_text ? currentTask.results.original_text : currentTask.text }}</div>
                </div>
              </div>
            </el-col>
            <!-- 右侧：处理后文本 -->
            <el-col :span="12" v-if="currentTask.results && currentTask.results.cleaned_text">
              <div class="text-content">
                <div class="text-item">
                  <div class="text-label">处理后文本：</div>
                  <div class="text-value">{{ currentTask.results.cleaned_text }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="currentTask.progresss !== undefined" class="progress-section">
          <h4>任务进度</h4>
          <el-progress :percentage="currentTask.progress" :status="getProgressStatus(currentTask.status)"></el-progress>
        </div>

        <div v-if="currentTask.download_links" class="download-links-section">
          <h4>生成结果</h4>

          <!-- 视频下载 -->
          <div v-if="currentTask.download_links.video" class="video-section">
            <h5>视频文件</h5>
            <div class="file-info">
              <i class="el-icon-video-camera"></i>
              <span>视频文件已生成</span>
              <el-button type="primary" @click="downloadVideo(currentTask.download_links.video)" style="margin-left: 10px;">
                <i class="el-icon-download"></i> 下载视频
              </el-button>
            </div>
          </div>

        </div>

        <!-- 兼容旧版本videoUrl字段 -->
        <div v-else-if="currentTask.videoUrl" class="video-section">
          <h4>生成结果</h4>
          <video :src="currentTask.videoUrl" controls style="max-width: 100%; max-height: 300px;"></video>
          <div style="margin-top: 10px;">
            <el-button type="primary" @click="downloadVideo(currentTask.videoUrl)">
              <i class="el-icon-download"></i> 下载视频
            </el-button>
          </div>
        </div>

        <div v-if="currentTask.errorMessage" class="error-section">
          <h4>错误信息</h4>
          <el-alert :title="currentTask.errorMessage" type="error" show-icon></el-alert>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="taskDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="refreshTaskDetail">刷新状态</el-button>
      </div>
    </el-dialog>

    <!-- 编辑数字人形象弹窗 -->
    <el-dialog
      title="使用形象生成数字人视频"
      :visible.sync="editImageVisible"
      width="60%"
      :before-close="handleCloseEditImage"
    >
      <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="120px">
        <!-- 文稿输入 -->
        <el-form-item label="需生成文稿" prop="text">
          <el-input
            v-model="editForm.text"
            type="textarea"
            :rows="6"
            placeholder="请输入需要生成的文稿内容（支持latex公式和数学符号）"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editImageVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm" :loading="editLoading">
          生成数字人视频
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  initPhotoDrivenVideoTask,
  initVideoGenerationTask,
  getTaskStatus,
  getTaskResult,
  getRecentTaskList,
  queryTaskStatusAndProgress,
  getGeneratedVideoFile,
  getTeacherDigitalHuman,
  deleteTeacherDigitalHuman,
  generateTeacherVideo,
  deleteTask,
  getQueueStatus
} from '@/api/system/szr'

export default {
  name: 'SzrVideoGeneration',
  data() {
    return {
      form: {
        text: '',
        prompt_text: '',
        prompt_wav: null, // 改为保存文件对象
        referenceFile: null // 改为保存文件对象
      },
      rules: {
        text: [
          { required: true, message: '请输入生成文稿', trigger: 'blur' },
          { min: 10, max: 2000, message: '文稿长度在 10 到 2000 个字符', trigger: 'blur' }
        ],
        prompt_text: [
          { required: true, message: '请输入音频文稿', trigger: 'blur' },
          { min: 5, max: 1000, message: '音频文稿长度在 5 到 1000 个字符', trigger: 'blur' }
        ],
        prompt_wav: [
          { required: true, message: '请上传音频文件', trigger: 'change' },
          { validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请上传音频文件'))
              } else {
                callback()
              }
            }, trigger: 'change' }
        ],
        referenceFile: [
          { required: true, message: '请上传参考视频或照片', trigger: 'change' },
          { validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请上传参考视频或照片'))
              } else {
                callback()
              }
            }, trigger: 'change' }
        ]
      },
      loading: false,
      fileType: null, // 'photo' 或 'video'
      audioFileList: [],
      referenceFileList: [],
      statusTimer: null,
      // 任务列表相关
      taskList: [],
      taskListLoading: false,
      taskDetailVisible: false,
      currentTask: null,
      taskQuery: {
        page: 1,
        page_size: 10
      },
      taskTotal: 0,
      // 队列状态
      queueMessage: '',
      // 数字人形象相关
      userImage: null,
      // 创建形象弹窗
      createImageVisible: false,
      // 编辑形象弹窗相关
      editImageVisible: false,
      editLoading: false,
      editForm: {
        text: ''
      },
      editRules: {
        text: [
          { required: true, message: '请输入需生成文稿', trigger: 'blur' },
          { min: 1, max: 2000, message: '文稿长度在 1 到 2000 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    // 监听音频文件列表变化，确保文件对象被正确保存
    audioFileList: {
      handler(newList) {
        if (newList && newList.length > 0) {
          const file = newList[0]
          if (file) {
            const fileObj = file.raw || file
            if (fileObj instanceof File || fileObj instanceof Blob) {
              this.form.prompt_wav = fileObj
            } else if (fileObj && fileObj.uid) {
              // 如果是 el-upload 的文件对象，也保存
              this.form.prompt_wav = fileObj
            }
          }
        } else if (!newList || newList.length === 0) {
          this.form.prompt_wav = null
        }
      },
      immediate: true,
      deep: true
    },
    // 监听参考文件列表变化，确保文件对象被正确保存
    referenceFileList: {
      handler(newList) {
        if (newList && newList.length > 0) {
          const file = newList[0]
          if (file) {
            const fileObj = file.raw || file
            if (fileObj instanceof File || fileObj instanceof Blob) {
              this.form.referenceFile = fileObj

              // 判断并设置文件类型
              const isImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(fileObj.type)
              const isVideo = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'].includes(fileObj.type)
              if (isImage) {
                this.fileType = 'photo'
              } else if (isVideo) {
                this.fileType = 'video'
              }
            } else if (fileObj && fileObj.uid) {
              // 如果是 el-upload 的文件对象，也保存
              this.form.referenceFile = fileObj

              // 尝试从文件名判断类型
              const fileName = fileObj.name || ''
              if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
                this.fileType = 'photo'
              } else if (fileName.match(/\.(mp4|avi|mov|wmv)$/i)) {
                this.fileType = 'video'
              }
            }
          }
        } else if (!newList || newList.length === 0) {
          this.form.referenceFile = null
          this.fileType = null
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    canSubmit() {
      const hasText = this.form.text && this.form.text.trim().length >= 10
      const hasPromptText = this.form.prompt_text && this.form.prompt_text.trim().length >= 5
      const hasAudioFile = this.form.prompt_wav !== null && this.form.prompt_wav !== undefined
      const hasReferenceFile = this.form.referenceFile !== null && this.form.referenceFile !== undefined
      const hasFileType = this.fileType !== null && this.fileType !== undefined

      return hasText && hasPromptText && hasAudioFile && hasReferenceFile && hasFileType
    }
  },
  methods: {
    // 音频文件上传前验证
    beforeAudioUpload(file) {
      const isAudio = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/aac'].includes(file.type)
      const isLt50M = file.size / 1024 / 1024 < 50

      if (!isAudio) {
        this.$message.error('只能上传音频文件!')
        return false
      }
      if (!isLt50M) {
        this.$message.error('音频文件大小不能超过 50MB!')
        return false
      }
      return true
    },

    // 参考文件上传前验证
    beforeReferenceUpload(file) {
      const isImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)
      const isVideo = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'].includes(file.type)
      const isLt200M = file.size / 1024 / 1024 < 200

      if (!isImage && !isVideo) {
        this.$message.error('只能上传图片或视频文件!')
        return false
      }
      if (!isLt200M) {
        this.$message.error('文件大小不能超过 200MB!')
        return false
      }

      // 设置文件类型（即使 auto-upload=false，这个钩子也会被调用）
      this.fileType = isImage ? 'photo' : 'video'

      // 直接保存文件对象（每次选择新文件时都会替换）
      this.form.referenceFile = file

      return true
    },

    // 音频文件选择变化
    handleAudioChange(file, fileList) {
      this.audioFileList = fileList

      // 当 auto-upload=false 时，文件状态可能是 'ready' 或其他状态
      // 只要文件存在就保存
      if (file) {
        // 保存文件对象（优先使用 raw，如果没有则使用 file 本身）
        const fileObj = file.raw || file
        if (fileObj instanceof File || fileObj instanceof Blob) {
          this.form.prompt_wav = fileObj
        } else if (fileObj && fileObj.uid) {
          // 如果 fileObj 是 el-upload 的文件对象，尝试获取原始文件
          this.form.prompt_wav = fileObj
        }

        // 触发表单验证
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.validateField('prompt_wav')
          }
        })
      } else if (fileList.length === 0) {
        // 如果没有文件，清空
        this.form.prompt_wav = null
      }
    },

    // 音频文件移除
    handleAudioRemove(file, fileList) {
      this.form.prompt_wav = null
      this.audioFileList = fileList
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.form.validateField('prompt_wav')
      })
    },

    // 参考文件选择变化
    handleReferenceChange(file, fileList) {
      // 如果文件列表长度超过1，说明用户选择了新文件，需要替换原有文件
      if (fileList.length > 1) {
        // 只保留最后一个文件（新文件），移除旧文件
        const newFile = fileList[fileList.length - 1]
        this.referenceFileList = [newFile]
        file = newFile
        // 清空上传组件的文件列表，只保留新文件
        this.$nextTick(() => {
          if (this.$refs.referenceUpload) {
            this.$refs.referenceUpload.clearFiles()
            this.$refs.referenceUpload.handleStart(file.raw || file)
          }
        })
      } else {
        // 直接更新文件列表
        this.referenceFileList = fileList
      }

      // 当 auto-upload=false 时，文件状态可能是 'ready' 或其他状态
      // 只要文件存在就保存
      if (file) {
        // 保存文件对象（优先使用 raw，如果没有则使用 file 本身）
        const fileObj = file.raw || file
        if (fileObj instanceof File || fileObj instanceof Blob) {
          this.form.referenceFile = fileObj

          // 判断并设置文件类型
          const isImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(fileObj.type)
          const isVideo = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'].includes(fileObj.type)
          if (isImage) {
            this.fileType = 'photo'
          } else if (isVideo) {
            this.fileType = 'video'
          }
        } else if (fileObj && fileObj.uid) {
          // 如果 fileObj 是 el-upload 的文件对象，尝试获取原始文件
          this.form.referenceFile = fileObj

          // 尝试从文件名判断类型
          const fileName = fileObj.name || ''
          if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
            this.fileType = 'photo'
          } else if (fileName.match(/\.(mp4|avi|mov|wmv)$/i)) {
            this.fileType = 'video'
          }
        }

        // 触发表单验证
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.validateField('referenceFile')
          }
        })
      } else if (fileList.length === 0) {
        // 如果没有文件，清空
        this.form.referenceFile = null
        this.fileType = null
      }
    },

    // 参考文件移除
    handleReferenceRemove(file, fileList) {
      this.form.referenceFile = null
      this.fileType = null
      this.referenceFileList = fileList
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.form.validateField('referenceFile')
      })
    },

    // 参考文件超出限制时的处理（替换文件）
    handleReferenceExceed(files, fileList) {
      // 当选择新文件时，先清空旧文件，再添加新文件
      this.$refs.referenceUpload.clearFiles()
      // 添加新文件
      const newFile = files[0]
      // 手动触发文件添加
      this.$refs.referenceUpload.handleStart(newFile)
      // 更新文件列表和文件对象
      this.referenceFileList = [newFile]
      this.form.referenceFile = newFile
      // 判断文件类型
      const isImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(newFile.type)
      this.fileType = isImage ? 'photo' : 'video'
      this.$message.warning('已替换原有文件')
    },

    // 提交表单
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true

          try {
            // 获取当前用户ID作为teacher_id
            const teacherId = this.$store.getters.id
            if (!teacherId) {
              this.$message.error('无法获取用户ID，请先登录')
              this.loading = false
              return
            }

            // 创建FormData对象
            const formData = new FormData()
            formData.append('teacher_id', teacherId.toString())
            formData.append('text', this.form.text)
            formData.append('prompt_text', this.form.prompt_text)

            // 直接添加音频文件对象
            if (this.form.prompt_wav) {
              formData.append('prompt_wav', this.form.prompt_wav)
            }

            // 根据文件类型添加对应的字段
            if (this.fileType === 'photo') {
              if (this.form.referenceFile) {
                formData.append('reference_photo', this.form.referenceFile)
              }
              this.callPhotoDrivenAPI(formData)
            } else {
              if (this.form.referenceFile) {
                formData.append('reference_video', this.form.referenceFile)
              }
              this.callVideoDrivenAPI(formData)
            }
          } catch (error) {
            this.$message.error('准备提交数据失败：' + error.message)
            this.loading = false
          }
        }
      })
    },

    // 调用照片驱动接口
    async callPhotoDrivenAPI(formData) {
      try {
        const response = await initPhotoDrivenVideoTask(formData)
        if (response.task_id) {
          this.$message.success('照片驱动视频生成任务已提交')
          // 关闭弹窗
          this.createImageVisible = false
          // 重置表单
          this.resetForm()
          // 刷新任务列表
          this.loadTaskList()
          // 上传完毕并生成数字人后，获取教师专属数字人形象
          await this.loadTeacherDigitalHuman()
        } else {
          this.$message.error(response.message || '任务提交失败')
        }
      } catch (error) {
        this.$message.error('任务提交失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 调用视频驱动接口
    async callVideoDrivenAPI(formData) {
      try {
        const response = await initVideoGenerationTask(formData)
        if (response.task_id) {
          this.$message.success('视频驱动视频生成任务已提交')
          // 关闭弹窗
          this.createImageVisible = false
          // 重置表单
          this.resetForm()
          // 刷新任务列表
          this.loadTaskList()
          // 上传完毕并生成数字人后，获取教师专属数字人形象
          await this.loadTeacherDigitalHuman()
        } else {
          this.$message.error(response.message || '任务提交失败')
        }
      } catch (error) {
        this.$message.error('任务提交失败：' + error.message)
      } finally {
        this.loading = false
      }
    },


    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        'pending': 'info',
        'processing': 'warning',
        'completed': 'success',
        'failed': 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '等待中',
        'processing': '处理中',
        'completed': '已完成',
        'failed': '失败'
      }
      return statusMap[status] || '未知'
    },

    // 重置表单
    resetForm() {
      this.$refs.form.resetFields()
      this.form.prompt_wav = null
      this.form.referenceFile = null
      this.audioFileList = []
      this.referenceFileList = []
      this.fileType = null
      // 清空上传组件的文件列表
      if (this.$refs.audioUpload) {
        this.$refs.audioUpload.clearFiles()
      }
      if (this.$refs.referenceUpload) {
        this.$refs.referenceUpload.clearFiles()
      }
      if (this.statusTimer) {
        clearInterval(this.statusTimer)
        this.statusTimer = null
      }
    },

    // 加载任务列表
    async loadTaskList() {
      this.taskListLoading = true
      try {
        // 获取当前用户ID作为teacher_id
        const teacherId = this.$store.getters.id
        if (!teacherId) {
          this.$message.warning('无法获取用户ID，请先登录')
          this.taskListLoading = false
          return
        }

        // 构建查询参数，包含分页和teacher_id
        const queryParams = {
          page: this.taskQuery.page,
          page_size: this.taskQuery.page_size,
          teacher_id: teacherId.toString()
        }

        const response = await getRecentTaskList(queryParams)
        // 根据实际API返回的数据结构处理
        if (response.tasks) {
          // 映射字段名，将 task_id 映射为 taskId
          this.taskList = (response.tasks || []).map(task => ({
            ...task,
            taskId: task.task_id || task.taskId,
            createTime: task.create_time || task.createTime,
            videoUrl: task.video_url || task.videoUrl,
            download_links: task.download_links || task.downloadLinks
          }))
          // 优先从pagination中获取total，如果没有则从response.total获取，最后使用tasks数组长度
          if (response.pagination && response.pagination.total !== undefined) {
            this.taskTotal = response.pagination.total
          } else {
            this.taskTotal = response.total !== undefined ? response.total : (response.tasks ? response.tasks.length : 0)
          }
        } else if (response.code === 200) {
          // 如果返回的是data数组
          if (Array.isArray(response.data)) {
            this.taskList = (response.data || []).map(task => ({
              ...task,
              taskId: task.task_id || task.taskId,
              createTime: task.created_at || task.create_time || task.createTime,
              videoUrl: task.video_url || task.videoUrl,
              download_links: task.download_links || task.downloadLinks
            }))
            // 优先从pagination中获取total
            if (response.pagination && response.pagination.total !== undefined) {
              this.taskTotal = response.pagination.total
            } else {
              this.taskTotal = response.total !== undefined ? response.total : (response.data ? response.data.length : 0)
            }
          } else if (response.data && response.data.tasks) {
            // 如果data是对象，包含tasks数组
            this.taskList = (response.data.tasks || []).map(task => ({
              ...task,
              taskId: task.task_id || task.taskId,
              createTime: task.created_at || task.create_time || task.createTime,
              videoUrl: task.video_url || task.videoUrl,
              download_links: task.download_links || task.downloadLinks
            }))
            // 优先从pagination中获取total
            if (response.data.pagination && response.data.pagination.total !== undefined) {
              this.taskTotal = response.data.pagination.total
            } else if (response.pagination && response.pagination.total !== undefined) {
              this.taskTotal = response.pagination.total
            } else {
              this.taskTotal = response.data.total !== undefined ? response.data.total : (response.total !== undefined ? response.total : (response.data.tasks ? response.data.tasks.length : 0))
            }
          } else {
            this.taskList = []
            this.taskTotal = 0
          }
        } else {
          this.$message.error(response.msg || response.message || '获取任务列表失败')
          this.taskList = []
          this.taskTotal = 0
        }
      } catch (error) {
        this.$message.error('获取任务列表失败：' + error.message)
      } finally {
        this.taskListLoading = false
      }
      // 加载任务列表后，同时加载队列状态
      this.loadQueueStatus()
    },

    // 加载队列状态
    async loadQueueStatus() {
      try {
        const response = await getQueueStatus()
        if (response.message) {
          this.queueMessage = response.message
        } else if (response.queue_status) {
          const status = response.queue_status.queue_status || 'unknown'
          const pending = response.queue_status.pending_tasks || 0
          this.queueMessage = `当前队列状态: ${status}, 等待任务: ${pending}个`
        } else {
          this.queueMessage = ''
        }
      } catch (error) {
        console.error('获取队列状态失败:', error)
        this.queueMessage = ''
      }
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.taskQuery.page_size = val
      this.taskQuery.page = 1
      this.loadTaskList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.taskQuery.page = val
      this.loadTaskList()
    },

    // 查看任务详情
    async viewTaskDetail(task) {
      this.currentTask = { ...task }
      this.taskDetailVisible = true
      await this.refreshTaskDetail()
    },

    // 刷新任务详情
    async refreshTaskDetail() {
      if (!this.currentTask || !this.currentTask.taskId) return

      try {
        const response = await queryTaskStatusAndProgress(this.currentTask.taskId)

        // 根据实际API返回的数据结构处理
        if (response.task_id) {
          // 直接返回任务数据的情况
          this.currentTask = { ...this.currentTask, ...response }
        } else if (response.code === 200 && response.data) {
          // 包装在data中的情况
          this.currentTask = { ...this.currentTask, ...response.data }
        } else {
          this.$message.error(response.msg || '获取任务详情失败')
          return
        }

        // 更新任务列表中的对应项
        const index = this.taskList.findIndex(item => item.taskId === this.currentTask.taskId)
        if (index !== -1) {
          this.$set(this.taskList, index, { ...this.currentTask })
        }
      } catch (error) {
        this.$message.error('刷新任务状态失败：' + error.message)
      }
    },

    // 下载视频
    async downloadVideo(task) {
      let videoUrl = null

      // 处理不同的参数类型
      if (typeof task === 'string') {
        videoUrl = task
      } else if (task && task.download_links && task.download_links.video) {
        videoUrl = task.download_links.video
      } else if (task && task.videoUrl) {
        videoUrl = task.videoUrl
      }

      if (!videoUrl) {
        // 如果任务已完成但没有视频URL，尝试刷新任务状态获取最新信息
        if (task && task.taskId && task.status === 'completed') {
          try {
            this.$message.info('正在获取视频信息...')
            const response = await queryTaskStatusAndProgress(task.taskId)

            // 更新任务信息
            if (response.task_id) {
              const updatedTask = { ...task, ...response }
              const index = this.taskList.findIndex(item => item.taskId === task.taskId)
              if (index !== -1) {
                this.$set(this.taskList, index, updatedTask)
              }

              // 重新尝试获取视频URL
              if (updatedTask.download_links && updatedTask.download_links.video) {
                videoUrl = updatedTask.download_links.video
              } else if (updatedTask.videoUrl) {
                videoUrl = updatedTask.videoUrl
              }
            }
          } catch (error) {
            console.error('刷新任务状态失败:', error)
          }
        }

        if (!videoUrl) {
          this.$message.error('视频文件不存在，请稍后再试或联系管理员')
          return
        }
      }

      try {
        // 从video URL中提取文件名
        const filename = this.extractFilenameFromUrl(videoUrl)
        if (!filename) {
          this.$message.error('无法获取视频文件名')
          return
        }

        const response = await getGeneratedVideoFile(filename)

        // 创建下载链接
        const blob = new Blob([response], { type: 'video/mp4' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success('视频下载开始')
      } catch (error) {
        this.$message.error('下载视频失败：' + error.message)
      }
    },


    // 从URL中提取文件名
    extractFilenameFromUrl(url) {
      // 匹配 /api/digital-human/video/digital_human_3912248780481769072.mp4 格式
      const match = url.match(/\/api\/digital-human\/video\/(digital_human_\d+\.mp4)/)
      return match ? match[1] : null
    },

    // 添加形象（从任务创建）
    addImage(task) {
      if (this.userImage) {
        this.$confirm('您已有一个数字人形象，是否要替换？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.createImageFromTask(task)
        }).catch(() => {
          this.$message.info('已取消操作')
        })
      } else {
        this.createImageFromTask(task)
      }
    },

    // 从任务创建形象
    async createImageFromTask(task) {
      // 先调用接口获取教师专属数字人形象
      await this.loadTeacherDigitalHuman()

      // 如果接口返回了形象，使用接口返回的数据
      // 如果没有返回，则使用任务数据创建本地形象（兼容旧逻辑）
      if (!this.userImage) {
        this.userImage = {
          id: Date.now(),
          name: `数字人形象_${task.taskId?.substring(0, 8) || '新形象'}`,
          description: task.prompt_text || '从任务创建的数字人形象',
          thumbnail: task.referenceFile || null,
          videoUrl: task.download_links?.video || task.videoUrl || null,
          audioUrl: task.prompt_wav || null,
          taskId: task.taskId,
          createTime: new Date().toLocaleString(),
          // 保存任务的原始信息
          originalTask: {
            prompt_text: task.prompt_text,
            prompt_wav: task.prompt_wav,
            referenceFile: task.referenceFile,
            download_links: task.download_links,
            videoUrl: task.videoUrl
          }
        }
      }

      this.$message.success('数字人形象创建成功！')
    },

    // 创建新形象
    createNewImage() {
      // 打开数字人形象生成弹窗
      this.createImageVisible = true
    },

    // 关闭创建形象弹窗
    handleCloseCreateImage() {
      this.createImageVisible = false
      this.resetForm()
    },

    // 编辑形象
    editImage() {
      this.editImageVisible = true
      // 清空表单
      this.editForm.text = ''
    },

    // 提交编辑表单
    async submitEditForm() {
      this.$refs.editForm.validate(async (valid) => {
        if (valid) {
          this.editLoading = true

          try {
            // 获取当前用户ID作为teacher_id
            const teacherId = this.$store.getters.id
            if (!teacherId) {
              this.$message.error('无法获取用户ID，请先登录')
              this.editLoading = false
              return
            }

            // 调用使用教师资源生成视频接口
            const response = await generateTeacherVideo(teacherId.toString(), this.editForm.text)
            if (response.task_id) {
              this.$message.success('数字人视频生成任务已提交')
              this.editImageVisible = false
              this.resetEditForm()
              // 刷新任务列表
              this.loadTaskList()
              // 刷新数字人形象（如果生成了新的形象）
              await this.loadTeacherDigitalHuman()
            } else {
              this.$message.error(response.msg || response.message || '任务提交失败')
            }
          } catch (error) {
            this.$message.error('任务提交失败：' + error.message)
          } finally {
            this.editLoading = false
          }
        }
      })
    },

    // 重置编辑表单
    resetEditForm() {
      this.editForm = {
        text: ''
      }
      if (this.$refs.editForm) {
        this.$refs.editForm.resetFields()
      }
    },

    // 关闭编辑弹窗
    handleCloseEditImage() {
      this.editImageVisible = false
      this.resetEditForm()
    },



    // 获取进度状态
    getProgressStatus(status) {
      const statusMap = {
        'completed': 'success',
        'failed': 'exception',
        'processing': 'active',
        'pending': 'active'
      }
      return statusMap[status] || 'active'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString('zh-CN')
    },

    // 关闭任务详情弹窗
    handleCloseTaskDetail() {
      this.taskDetailVisible = false
      this.currentTask = null
    },

    // 将文件添加到FormData
    async appendFileToFormData(formData, fieldName, fileUrl) {
      try {
        // 从URL获取文件
        const response = await fetch(fileUrl)
        const blob = await response.blob()

        // 从URL中提取文件名
        const filename = this.extractFilenameFromUrl(fileUrl) || 'file'

        // 创建File对象
        const file = new File([blob], filename, { type: blob.type })

        // 添加到FormData
        formData.append(fieldName, file)
      } catch (error) {
        console.error('处理文件失败:', error)
        this.$message.error('处理文件失败：' + error.message)
      }
    },

    // 加载教师数字人形象
    async loadTeacherDigitalHuman() {
      try {
        const teacherId = this.$store.getters.id
        if (!teacherId) {
          return
        }

        const response = await getTeacherDigitalHuman(teacherId.toString())
        if (response.status === 'success' && response.data) {
          this.userImage = {
            id: response.data.teacher_id,
            name: `数字人形象_${response.data.teacher_id}`,
            description: response.data.prompt_text || '教师专属数字人形象',
            thumbnail: response.data.reference_photo || response.data.reference_video || null,
            videoUrl: response.data.reference_video || null,
            audioUrl: response.data.prompt_wav || null,
            taskId: null,
            createTime: response.data.create_time || new Date().toLocaleString(),
            teacherId: response.data.teacher_id
          }
        } else if (response.code === 200 && response.data) {
          this.userImage = {
            id: response.data.teacher_id,
            name: `数字人形象_${response.data.teacher_id}`,
            description: response.data.prompt_text || '教师专属数字人形象',
            thumbnail: response.data.reference_photo || response.data.reference_video || null,
            videoUrl: response.data.reference_video || null,
            audioUrl: response.data.prompt_wav || null,
            taskId: null,
            createTime: response.data.create_time || new Date().toLocaleString(),
            teacherId: response.data.teacher_id
          }
        } else {
          // 资源不存在，清空
          this.userImage = null
        }
      } catch (error) {
        // 如果资源不存在，会返回404，这是正常的
        if (error.response && error.response.status === 404) {
          this.userImage = null
        } else {
          console.error('获取教师数字人形象失败:', error)
        }
      }
    },

    // 删除教师数字人形象
    async handleDeleteTeacherDigitalHuman() {
      if (!this.userImage || !this.userImage.teacherId) {
        this.$message.warning('没有可删除的数字人形象')
        return
      }

      this.$confirm('确定要删除当前数字人形象吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteTeacherDigitalHuman(this.userImage.teacherId)
          if (response.status === 'success' || response.code === 200) {
            this.$message.success('数字人形象删除成功')
            this.userImage = null
          } else {
            this.$message.error(response.msg || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败：' + error.message)
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 使用教师资源生成视频
    async generateVideoWithTeacherResource(text) {
      try {
        const teacherId = this.$store.getters.id
        if (!teacherId) {
          this.$message.error('无法获取用户ID，请先登录')
          return
        }

        const response = await generateTeacherVideo(teacherId.toString(), text)
        if (response.task_id) {
          this.$message.success('数字人视频生成任务已提交')
          // 刷新任务列表
          this.loadTaskList()
        } else {
          this.$message.error(response.msg || '任务提交失败')
        }
      } catch (error) {
        this.$message.error('任务提交失败：' + error.message)
      }
    },

    // 删除任务
    async handleDeleteTask(task) {
      if (!task || !task.taskId) {
        this.$message.warning('无法获取任务ID')
        return
      }

      this.$confirm('确定要删除此任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteTask(task.taskId)
          // 支持多种响应格式：success: true, status: 'success', code: 200
          if (response.success === true || response.status === 'success' || response.code === 200) {
            this.$message.success(response.message || '任务删除成功')
            // 刷新任务列表
            this.loadTaskList()
          } else {
            this.$message.error(response.msg || response.message || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败：' + error.message)
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  },
  async mounted() {
    // 页面加载时获取任务列表
    this.loadTaskList()
    // 加载队列状态
    this.loadQueueStatus()
    // 加载教师数字人形象
    await this.loadTeacherDigitalHuman()
    // 如果没有数字人形象，自动弹出创建弹窗
    if (!this.userImage) {
      this.$nextTick(() => {
        this.createImageVisible = true
      })
    }
  },
  beforeDestroy() {
    if (this.statusTimer) {
      clearInterval(this.statusTimer)
    }
  }
}
</script>

<style scoped>
.szr-form {
  /* max-width: 800px; */
  margin: 0 auto;
}


.card-title {
  font-size: 18px;
  font-weight: bold;
}


.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.task-detail {
  padding: 20px 0;
}

.progress-section {
  margin: 20px 0;
}

.progress-section h4 {
  margin-bottom: 10px;
  color: #606266;
}

.video-section {
  margin: 20px 0;
}

.video-section h4 {
  margin-bottom: 10px;
  color: #606266;
}

.error-section {
  margin: 20px 0;
}

.error-section h4 {
  margin-bottom: 10px;
  color: #F56C6C;
}

/* 提示信息区域样式 */
.message-section {
  margin: 20px 0;
}

.message-section h4 {
  margin-bottom: 10px;
  color: #606266;
  font-size: 16px;
  font-weight: 600;
}

/* 文本内容区域样式 */
.text-section {
  margin: 20px 0;
}

.text-section h4 {
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
  font-weight: 600;
}

/* 文本左右排版样式 */
.text-row {
  display: flex;
  align-items: stretch;
}

.text-row .el-col {
  display: flex;
  flex-direction: column;
}

.text-content {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.text-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.text-label {
  color: #909399;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.text-value {
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
  background-color: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  flex: 1;
  min-height: 100px;
}

.download-links-section {
  margin: 20px 0;
}

.download-links-section h4 {
  margin-bottom: 15px;
  color: #606266;
}

.download-links-section h5 {
  margin: 15px 0 10px 0;
  color: #909399;
  font-size: 14px;
}

.audio-section {
  margin: 15px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #67C23A;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #67C23A;
}

.file-info i {
  color: #67C23A;
  font-size: 16px;
}

.file-info span {
  color: #606266;
  font-size: 14px;
}

.video-section .file-info {
  border-left-color: #409EFF;
}

.video-section .file-info i {
  color: #409EFF;
}

/* 主布局样式 */
.main-layout {
  display: flex;
  gap: 20px;
  /* min-height: 600px; */
  max-height: 80vh;
}

.left-panel {
  flex: 0 0 68%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 0 0 32%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.left-panel .box-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.left-panel .box-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.right-panel .box-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.right-panel .box-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 表格宽度优化 */
.left-panel .el-table {
  width: 100% !important;
}

.left-panel .el-table__body-wrapper {
  width: 100%;
}

.left-panel .el-table__header-wrapper {
  width: 100%;
}

/* 数字人形象管理样式 */
.current-image-section {
  padding: 20px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-image-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-image-section h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.image-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-height: 0;
}

/* 图片区域 - 顶部中央 */
.image-icon {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  margin-bottom: 20px;
}

.image-icon i {
  font-size: 60px;
  color: #fff;
}

/* 形象文本区域 - 中间 */
.image-text {
  width: 100%;
  margin-bottom: 20px;
}

.text-label {
  color: #909399;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.text-content {
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  min-height: 60px;
}

/* 操作按钮 - 底部 */
.image-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

.task-info {
  margin: 15px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.info-item {
  display: flex;
  margin-bottom: 5px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #606266;
  font-size: 12px;
  font-weight: 500;
  min-width: 70px;
}

.info-item .value {
  color: #303133;
  font-size: 12px;
  font-family: monospace;
}

.no-image-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
}

.empty-content i {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.empty-content h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.empty-content p {
  margin: 0 0 30px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

/* 任务列表头部样式 */
.task-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.task-list-header .card-title {
  flex: 0 0 auto;
  margin-right: 20px;
}

/* 队列状态内联显示样式 */
.queue-status-inline {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
}

.queue-status-inline .el-alert {
  padding: 8px 16px;
  margin: 0;
  width: 100%;
}

/* 刷新按钮样式 */
.task-list-header .refresh-btn {
  flex: 0 0 auto;
  padding: 3px 0;
  margin-left: 20px;
}

/* 分页样式 */
.pagination-container {
  margin-top: 15px;
  text-align: right;
}

/* 需生成文稿和参考素材一行布局样式 */
.text-reference-row {
  display: flex;
  align-items: stretch;
  margin-bottom: 20px;
}

.text-reference-row .el-col {
  display: flex;
  flex-direction: column;
}

.text-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.text-item .el-form-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.text-textarea {
  flex: 1;
}

.text-textarea .el-textarea__inner {
  height: 100% !important;
  min-height: 200px;
}

.reference-upload-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.reference-upload-item .el-form-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reference-upload {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reference-upload .el-upload-dragger {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 200px;
}

/* 音频文稿和音频文件一行布局样式 */
.audio-row {
  display: flex;
  align-items: stretch;
}

.audio-row .el-col {
  display: flex;
  flex-direction: column;
}

.audio-text-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.audio-text-item .el-form-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.audio-textarea {
  flex: 1;
}

.audio-textarea .el-textarea__inner {
  height: 100% !important;
  min-height: 200px;
}

.audio-upload-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.audio-upload-item .el-form-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.audio-upload {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.audio-upload .el-upload-dragger {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 200px;
}

/* 参考素材上传区域样式优化 */
.reference-upload {
  width: 100%;
}

/* 优化文件列表显示，让上传的文件更明显 */
.reference-upload .el-upload-list {
  margin-top: 15px;
}

.reference-upload .el-upload-list__item {
  background-color: #f0f9ff;
  border: 2px solid #409EFF;
  border-radius: 6px;
  padding: 12px 15px;
  margin-top: 10px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.reference-upload .el-upload-list__item:hover {
  background-color: #ecf5ff;
  border-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.reference-upload .el-upload-list__item-name {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reference-upload .el-upload-list__item-status-label {
  margin-left: 8px;
  color: #67c23a;
  font-size: 12px;
  font-weight: 500;
}

.reference-upload .el-upload-list__item-delete {
  color: #909399;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
  padding: 4px;
}

.reference-upload .el-upload-list__item-delete:hover {
  color: #f56c6c;
  transform: scale(1.1);
}

/* 音频文件列表样式优化 */
.audio-upload .el-upload-list {
  margin-top: 15px;
}

.audio-upload .el-upload-list__item {
  background-color: #f0f9ff;
  border: 2px solid #409EFF;
  border-radius: 6px;
  padding: 12px 15px;
  margin-top: 10px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.audio-upload .el-upload-list__item:hover {
  background-color: #ecf5ff;
  border-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.audio-upload .el-upload-list__item-name {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-upload .el-upload-list__item-status-label {
  margin-left: 8px;
  color: #67c23a;
  font-size: 12px;
  font-weight: 500;
}

.audio-upload .el-upload-list__item-delete {
  color: #909399;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
  padding: 4px;
}

.audio-upload .el-upload-list__item-delete:hover {
  color: #f56c6c;
  transform: scale(1.1);
}
</style>
