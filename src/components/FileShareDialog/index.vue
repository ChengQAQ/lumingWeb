<template>
  <el-dialog
    title="分享文件"
    :visible.sync="dialogVisible"
    width="600px"
    class="share-dialog"
    @close="handleClose"
  >
    <el-form ref="shareForm" :model="shareForm" :rules="shareRules" label-width="100px" class="share-form">
      <!-- 选中的文件列表 -->
      <div class="selected-files">
        <h4>已选文件：</h4>
        <div v-for="file in selectedFiles" :key="file.fileId" class="file-item">
          <div class="file-info">
            <i :class="getFileTypeIcon(file.fileType)" class="file-icon"></i>
            <span class="file-name">{{ file.userFname }}</span>
          </div>
          <i class="el-icon-close remove-btn" @click="removeFile(file)"></i>
        </div>
      </div>

      <el-form-item label="权限范围类型" prop="scope">
        <el-select v-model="shareForm.scope" placeholder="请选择权限范围" style="width: 100%" @change="handleScopeChange">
          <el-option label="年级" value="0"></el-option>
          <el-option label="班级" value="1"></el-option>
          <el-option label="老师" value="2"></el-option>
          <el-option label="学校" value="3"></el-option>
          <el-option label="备课组" value="4"></el-option>
          <el-option label="教研组" value="5"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="具体类型" prop="scopeType">
        <el-select
          v-if="shareForm.scope === '3'"
          v-model="shareForm.scopeType"
          placeholder="请选择学校"
          style="width: 100%"
        >
          <el-option
            v-for="option in scopeTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-select
          v-else
          v-model="shareForm.scopeType"
          placeholder="请选择具体类型"
          style="width: 100%"
          multiple
          filterable
          :filter-method="filterOptions"
        >
          <el-option
            v-for="option in scopeTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitShare">确 定</el-button>
      <el-button @click="handleCancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { shareFiles, getTeacherList, getClassList, getPreparationGroupList, getTeachingResearchGroupList } from '@/api/system/knowledge'

export default {
  name: "FileShareDialog",
  props: {
    // 是否显示对话框
    visible: {
      type: Boolean,
      default: false
    },
    // 选中的文件列表
    selectedFiles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      shareForm: {
        fileIds: '',
        scope: '',
        scopeType: []
      },
      shareRules: {
        scope: [
          { required: true, message: '请选择权限范围类型', trigger: 'change' }
        ],
        scopeType: [
          { required: true, message: '请选择具体类型', trigger: 'change' }
        ]
      },
      scopeTypeOptions: [],
      
      // 年级选项
      gradeOptions: [
        { value: '初中', label: '初中' },
        { value: '高中', label: '高中' }
      ],
      
      // 学校选项
      schoolOptions: [
        { value: '高中', label: '高中' },
        { value: '初中', label: '初中' }
      ],
      
      // 缓存的数据
      teacherList: [],
      classList: [],
      preparationGroupList: [],
      teachingResearchGroupList: []
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
      if (newVal) {
        this.initForm()
      }
    },
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      const fileIds = this.selectedFiles.map(file => file.fileId).join(',')
      this.shareForm = {
        fileIds: fileIds,
        scope: '',
        scopeType: []
      }
      this.scopeTypeOptions = []
      if (this.$refs.shareForm) {
        this.$refs.shareForm.clearValidate()
      }
    },
    
    // 权限范围类型变化处理
    handleScopeChange(value) {
      this.shareForm.scopeType = []
      this.scopeTypeOptions = []
      
      switch (value) {
        case '0': // 年级
          this.scopeTypeOptions = [...this.gradeOptions]
          break
        case '1': // 班级
          this.loadClassList()
          break
        case '2': // 老师
          this.loadTeacherList()
          break
        case '3': // 学校
          this.scopeTypeOptions = [...this.schoolOptions]
          break
        case '4': // 备课组
          this.loadPreparationGroupList()
          break
        case '5': // 教研组
          this.loadTeachingResearchGroupList()
          break
      }
    },
    
    // 加载老师列表
    loadTeacherList() {
      getTeacherList().then(response => {
        if (response.code === 200) {
          this.teacherList = response.data || []
          this.scopeTypeOptions = this.teacherList.map(teacher => ({
            value: teacher.userId,
            label: teacher.nickName || teacher.userName
          }))
        } else {
          this.$message.error('获取老师列表失败：' + response.msg)
          this.scopeTypeOptions = []
        }
      }).catch(error => {
        this.$message.error('获取老师列表失败：' + error.message)
        this.scopeTypeOptions = []
      })
    },
    
    // 加载班级列表
    loadClassList() {
      getClassList().then(response => {
        if (response.code === 200) {
          this.classList = response.data || []
          this.scopeTypeOptions = this.classList.map(cls => ({
            value: cls.deptId,
            label: cls.deptName
          }))
        } else {
          this.$message.error('获取班级列表失败：' + response.msg)
          this.scopeTypeOptions = []
        }
      }).catch(error => {
        this.$message.error('获取班级列表失败：' + error.message)
        this.scopeTypeOptions = []
      })
    },
    
    // 加载备课组列表
    loadPreparationGroupList() {
      getPreparationGroupList().then(response => {
        if (response.code === 200) {
          this.preparationGroupList = response.data || []
          this.scopeTypeOptions = this.preparationGroupList.map(group => ({
            value: group.id,
            label: group.groupName
          }))
        } else {
          this.$message.error('获取备课组列表失败：' + response.msg)
          this.scopeTypeOptions = []
        }
      }).catch(error => {
        this.$message.error('获取备课组列表失败：' + error.message)
        this.scopeTypeOptions = []
      })
    },
    
    // 加载教研组列表
    loadTeachingResearchGroupList() {
      getTeachingResearchGroupList().then(response => {
        if (response.code === 200) {
          this.teachingResearchGroupList = response.data || []
          this.scopeTypeOptions = this.teachingResearchGroupList.map(group => ({
            value: group.id,
            label: group.groupName
          }))
        } else {
          this.$message.error('获取教研组列表失败：' + response.msg)
          this.scopeTypeOptions = []
        }
      }).catch(error => {
        this.$message.error('获取教研组列表失败：' + error.message)
        this.scopeTypeOptions = []
      })
    },
    
    // 通用筛选方法
    filterOptions(query) {
      const scope = this.shareForm.scope
      switch (scope) {
        case '1': // 班级
          this.filterClasses(query)
          break
        case '2': // 老师
          this.filterTeachers(query)
          break
        case '4': // 备课组
          this.filterPreparationGroups(query)
          break
        case '5': // 教研组
          this.filterTeachingResearchGroups(query)
          break
        default:
          break
      }
    },
    
    // 班级筛选方法
    filterClasses(query) {
      if (!query) {
        this.scopeTypeOptions = this.classList.map(cls => ({
          value: cls.deptId,
          label: cls.deptName
        }))
      } else {
        this.scopeTypeOptions = this.classList
          .filter(cls => cls.deptName.includes(query))
          .map(cls => ({
            value: cls.deptId,
            label: cls.deptName
          }))
      }
    },
    
    // 老师筛选方法
    filterTeachers(query) {
      if (!query) {
        this.scopeTypeOptions = this.teacherList.map(teacher => ({
          value: teacher.userId,
          label: teacher.nickName || teacher.userName
        }))
      } else {
        this.scopeTypeOptions = this.teacherList
          .filter(teacher => (teacher.nickName || teacher.userName || '').includes(query))
          .map(teacher => ({
            value: teacher.userId,
            label: teacher.nickName || teacher.userName
          }))
      }
    },
    
    // 备课组筛选方法
    filterPreparationGroups(query) {
      if (!query) {
        this.scopeTypeOptions = this.preparationGroupList.map(group => ({
          value: group.id,
          label: group.groupName
        }))
      } else {
        this.scopeTypeOptions = this.preparationGroupList
          .filter(group => group.groupName.includes(query))
          .map(group => ({
            value: group.id,
            label: group.groupName
          }))
      }
    },
    
    // 教研组筛选方法
    filterTeachingResearchGroups(query) {
      if (!query) {
        this.scopeTypeOptions = this.teachingResearchGroupList.map(group => ({
          value: group.id,
          label: group.groupName
        }))
      } else {
        this.scopeTypeOptions = this.teachingResearchGroupList
          .filter(group => group.groupName.includes(query))
          .map(group => ({
            value: group.id,
            label: group.groupName
          }))
      }
    },
    
    // 移除选中的文件
    removeFile(file) {
      this.$emit('remove-file', file)
    },
    
    // 获取文件类型图标
    getFileTypeIcon(fileType) {
      if (!fileType) return 'el-icon-document'
      
      const type = fileType.toLowerCase().trim()
      
      // 图片文件
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].some(t => type.includes(t))) {
        return 'el-icon-picture'
      }
      
      // 文档文件
      if (['doc', 'docx', 'pdf', 'txt', 'rtf'].some(t => type.includes(t))) {
        return 'el-icon-document'
      }
      
      // 表格文件
      if (['xls', 'xlsx', 'csv'].some(t => type.includes(t))) {
        return 'el-icon-s-grid'
      }
      
      // 演示文件
      if (['ppt', 'pptx', 'pptm', 'potx', 'potm'].some(t => type.includes(t))) {
        return 'el-icon-reading'
      }
      
      // 视频文件
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].some(t => type.includes(t))) {
        return 'el-icon-video-camera'
      }
      
      // 音频文件
      if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].some(t => type.includes(t))) {
        return 'el-icon-microphone'
      }
      
      // 压缩文件
      if (['zip', 'rar', '7z', 'tar', 'gz'].some(t => type.includes(t))) {
        return 'el-icon-folder'
      }
      
      // 默认图标
      return 'el-icon-document'
    },
    
    // 提交分享
    submitShare() {
      this.$refs['shareForm'].validate(valid => {
        if (valid) {
          if (this.selectedFiles.length === 0) {
            this.$message.warning('请选择要分享的文件')
            return
          }
          
          let scopeTypeValue = this.shareForm.scopeType
          
          if (this.shareForm.scope === '3') {
            scopeTypeValue = this.shareForm.scopeType
          } else {
            if (Array.isArray(this.shareForm.scopeType)) {
              scopeTypeValue = this.shareForm.scopeType.join(',')
            }
          }
          
          const params = {
            fileIds: this.shareForm.fileIds,
            scope: this.shareForm.scope,
            scopeType: scopeTypeValue
          }
          
          this.$modal.confirm('确定要分享选中的文件吗？').then(() => {
            return shareFiles(params)
          }).then(response => {
            this.$modal.msgSuccess('分享成功')
            this.$emit('success')
            this.handleClose()
          }).catch(error => {
            if (error !== 'cancel') {
              this.$modal.msgError('分享失败：' + (error.message || '未知错误'))
            }
          })
        }
      })
    },
    
    // 取消分享
    handleCancel() {
      this.handleClose()
    },
    
    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.share-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.share-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.selected-files {
  margin-bottom: 20px;
}

.selected-files h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 16px;
  color: #409EFF;
  flex-shrink: 0;
}

.file-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  color: #f56c6c;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  margin-left: 8px;
}

.remove-btn:hover {
  color: #f78989;
}
</style>

