<template>
  <div class="photo-search">
    <div class="source-title">拍照搜题</div>

    <div class="photo-upload-section">
      <!-- 上传区域 -->
      <div class="upload-area-container">
        <div v-if="!photoImage" class="upload-area" @click="handlePhotoUpload">
          <div class="upload-icon">
            <i class="el-icon-camera"></i>
          </div>
          <p class="upload-text">点击上传图片搜题</p>
          <p class="upload-hint">支持jpg、png格式，建议图片清晰</p>
        </div>
        <div v-else class="image-preview">
          <div class="preview-container">
            <img :src="photoImage" alt="题目图片" class="preview-image">
            <div class="image-overlay">
              <el-button size="small" type="primary" @click="handleRetakePhoto">
                <i class="el-icon-refresh"></i> 重新上传
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 课程选择和搜题按钮 -->
      <div v-show="photoImage" class="search-actions">
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!canSearch"
          @click="handleSearch"
          style="width: 100%;"
        >
          <i class="el-icon-search"></i> {{ loading ? '识别中...' : '开始搜题' }}
        </el-button>
      </div>

      <!-- 使用提示 -->
      <div class="photo-tips">
        <h4>使用提示：</h4>
        <ul>
          <li>确保图片清晰，文字清晰可见</li>
          <li>建议使用白色背景的题目图片</li>
          <li>支持数学公式、化学式等专业符号</li>
        </ul>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 图片裁剪组件 -->
    <ImageCrop
      :visible="showCropDialog"
      :imageSrc="tempImageSrc"
      :imageFile="tempImageFile"
      title="图片裁剪"
      @crop-success="handleCropSuccess"
      @update:visible="showCropDialog = $event"
      @close="handleCropClose"
    />
  </div>
</template>

<script>
import { ocrSearch } from '@/api/system/problems'
import ImageCrop from './ImageCrop.vue'

export default {
  name: 'PhotoSearch',
  components: {
    ImageCrop
  },
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    },
    teacherSubjectName: {
      type: String,
      default: ''
    },
    adminSubject: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      photoImage: '',
      photoFile: null,
      loading: false,
      showCropDialog: false,
      tempImageSrc: '',
      tempImageFile: null // 临时保存上传的文件对象
    }
  },
  computed: {
    canSearch() {
      if (!this.photoImage) return false
      if (!this.isAdmin && this.teacherSubjectName) return true
      if (this.isAdmin && this.adminSubject) return true
      return false
    }
  },
  methods: {
    handlePhotoUpload() {
      this.$refs.fileInput.click()
    },

    handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        this.$message.warning('请上传图片文件')
        return
      }

      // 验证文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        this.$message.warning('图片大小不能超过5MB')
        return
      }

      // 保存文件对象
      this.tempImageFile = file

      // 读取图片并打开裁剪对话框
      const reader = new FileReader()
      reader.onload = (e) => {
        this.tempImageSrc = e.target.result
        this.showCropDialog = true
      }
      reader.readAsDataURL(file)
    },

    handleRetakePhoto() {
      this.photoImage = ''
      this.photoFile = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    // 裁剪成功回调
    handleCropSuccess(result) {
      // result 包含 { blob, dataURL, file }
      this.photoFile = result.file
      this.photoImage = result.dataURL
      this.showCropDialog = false
      this.tempImageSrc = ''
      this.$message.success('图片裁剪完成')
    },

    // 裁剪对话框关闭回调
    handleCropClose() {
      this.showCropDialog = false
      this.tempImageSrc = ''
      this.tempImageFile = null
      // 清空文件输入，允许重新选择
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    async handleSearch() {
      if (!this.canSearch) {
        this.$message.warning('请先上传图片并选择科目')
        return
      }

      // 确定搜索科目
      let searchSubject = ''
      if (!this.isAdmin && this.teacherSubjectName) {
        searchSubject = this.teacherSubjectName
      } else if (this.isAdmin && this.adminSubject) {
        searchSubject = this.adminSubject
      } else {
        this.$message.warning('请选择科目')
        return
      }

      this.loading = true

      try {
        const formData = new FormData()
        formData.append('file', this.photoFile)
        formData.append('string', '')

        const response = await ocrSearch(formData, searchSubject)

        if (response && response.success) {
          if (response.search_results && response.search_results.length > 0) {
            this.$emit('search-success', response.search_results)
            this.$message.success(`识别成功，找到 ${response.search_results.length} 道相关题目`)
          } else {
            this.$message.info('未找到相关题目')
            this.$emit('search-success', [])
          }
        } else {
          this.$message.error(response?.message || '识别失败')
          this.$emit('search-error', response?.message || '识别失败')
        }
      } catch (error) {
        console.error('OCR搜题出错:', error)
        this.$message.error('识别失败，请稍后重试')
        this.$emit('search-error', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.photo-search {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.source-title {
  padding: 10px 15px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
  color: #303133;
  font-size: 14px;
}

.photo-upload-section {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.upload-area-container {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 15px;
}

.upload-text {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.image-preview {
  position: relative;
}

.preview-container {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
}

.search-actions {
  margin-bottom: 20px;
}

.subject-display {
  margin-bottom: 15px;
}

.subject-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-label {
  font-size: 14px;
  color: #606266;
}

.photo-tips {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.photo-tips h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}

.photo-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 13px;
}

.photo-tips li {
  margin-bottom: 5px;
}

.subject-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.subject-hint-text {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #fef0f0;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}

.subject-hint-text i {
  font-size: 16px;
}
</style>

