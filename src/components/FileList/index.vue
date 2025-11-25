<template>
  <div>
    <!-- 文件列表表格 -->
    <el-table
      v-loading="loading"
      :data="fileListData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件类型" align="center" prop="fileType" width="120">
        <template slot-scope="scope">
          <div class="file-type-cell">
            <i :class="getFileTypeIcon(scope.row.fileType)" class="file-type-icon" :title="scope.row.fileType"></i>
            <span class="file-type-text">{{ scope.row.fileType }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="文件用途" align="center" prop="filePurpose" width="120">
        <template slot-scope="scope">
          <div class="file-purpose-cell">
            <i :class="getFilePurposeIcon(scope.row.filePurpose)" class="file-purpose-icon"></i>
            <span class="file-purpose-text">{{ scope.row.filePurpose }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="文件名" align="center" prop="userFname" />
      <el-table-column label="目录路径" align="center" prop="directoryPath" width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.directoryPath" :title="scope.row.directoryPath">
            {{ scope.row.directoryPath }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="课程名" align="center" prop="subjectName" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.subjectName" type="primary" size="small">
            {{ getSubjectDisplay(scope.row.subjectName) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" align="center" prop="uploadTime" width="160">
        <template slot-scope="scope">
          {{ scope.row.uploadTime ? parseTime(scope.row.uploadTime, '{y}-{m}-{d}') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template slot-scope="scope">
          <file-operations
            :file="scope.row"
            :show-preview="true"
            :show-update="true"
            :show-delete="true"
            :show-download="true"
            @preview="handlePreview"
            @update="handleUpdate"
            @refresh="handleRefresh"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="handlePagination"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { getSubjectDisplay } from '@/utils/subjectMapping'
import FileOperations from '@/components/FileOperations'
import Pagination from '@/components/Pagination'

export default {
  name: "FileList",
  components: {
    FileOperations,
    Pagination
  },
  props: {
    // 文件列表数据
    fileListData: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 总数
    total: {
      type: Number,
      default: 0
    },
    // 查询参数
    queryParams: {
      type: Object,
      default: () => ({
        pageNum: 1,
        pageSize: 10,
        keyword: ''
      })
    },
    // 课程列表
    subjectList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 表格选择
      ids: [],
      single: true,
      multiple: true
    }
  },
  methods: {
    // 处理表格选择变化
    handleSelectionChange(selection) {
      // 确保 selection 是数组
      if (!Array.isArray(selection)) {
        console.warn('handleSelectionChange received non-array selection:', selection)
        selection = []
      }
      
      this.ids = selection.map(item => item.fileId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      
      // 向父组件发送选择变化事件
      this.$emit('selection-change', {
        ids: this.ids,
        single: this.single,
        multiple: this.multiple,
        selection: selection
      })
    },

    // 处理分页
    handlePagination() {
      this.$emit('pagination', this.queryParams)
    },

    // 预览文件
    handlePreview(file) {
      this.$emit('preview', file)
    },

    // 修改文件
    handleUpdate(file) {
      this.$emit('update', file)
    },

    // 刷新列表
    handleRefresh() {
      this.$emit('refresh')
    },

    // 获取课程显示名称
    getSubjectDisplay(subjectCode) {
      if (!subjectCode) return '-'
      const subject = this.subjectList.find(item => item.subjectCode === subjectCode)
      return subject ? `${subject.subjectName}` : subjectCode
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
      
      // 代码文件
      if (['js', 'html', 'css', 'xml', 'json', 'py', 'java', 'cpp', 'c'].some(t => type.includes(t))) {
        return 'el-icon-cpu'
      }
      
      // 默认图标
      return 'el-icon-document'
    },

    // 获取文件用途图标
    getFilePurposeIcon(filePurpose) {
      if (!filePurpose) return 'el-icon-document'
      
      const purpose = filePurpose.toLowerCase()
      
      // 备课材料
      if (purpose.includes('备课材料')) {
        return 'el-icon-reading'
      }
      
      // 教研材料
      if (purpose.includes('教研材料')) {
        return 'el-icon-notebook-1'
      }
      
      // 默认图标
      return 'el-icon-document'
    }
  }
}
</script>

<style scoped>
/* 文件类型和用途图标样式 */
.file-type-cell, .file-purpose-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.file-type-icon, .file-purpose-icon {
  font-size: 16px;
  color: #409EFF;
}

.file-type-text, .file-purpose-text {
  font-size: 12px;
  color: #606266;
}
</style>
