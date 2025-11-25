<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="线上资源路径" prop="resourceUrl">
        <el-input
          v-model="queryParams.resourceUrl"
          placeholder="请输入线上资源路径"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="生成后的资源" prop="newResourceUrl">
        <el-input
          v-model="queryParams.newResourceUrl"
          placeholder="请输入生成后的资源"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上传多个文件使用" prop="resourceUrl1">
        <el-input
          v-model="queryParams.resourceUrl1"
          placeholder="请输入上传多个文件使用"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:taskai:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:taskai:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:taskai:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:taskai:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskaiList" @selection-change="handleSelectionChange" style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="任务类型" align="center" prop="taskType" width="120">
        <template slot-scope="scope">
          <el-tag :type="getTaskTypeTagType(scope.row.taskType)" size="small">
            {{ scope.row.taskType || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center" prop="taskStatus" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.taskStatus)" size="small">
            {{ getStatusText(scope.row.taskStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="资源路径" align="left" prop="resourceUrl" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="resource-url">
            <el-link :href="scope.row.resourceUrl" target="_blank" type="primary" v-if="scope.row.resourceUrl">
              <i class="el-icon-link"></i>
              {{ formatUrl(scope.row.resourceUrl) }}
            </el-link>
            <span v-else class="text-muted">无</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="生成结果" align="center" prop="newResourceUrl" min-width="200">
        <template slot-scope="scope">
          <div class="generated-resource">
            <el-button 
              size="mini" 
              type="text" 
              icon="el-icon-view" 
              @click="viewGeneratedResource(scope.row)"
              v-if="scope.row.newResourceUrl"
            >
              查看详情
            </el-button>
            <el-button 
              size="mini" 
              type="text" 
              icon="el-icon-copy-document" 
              @click="copyResourceUrl(scope.row.newResourceUrl)"
              v-if="scope.row.newResourceUrl"
            >
              复制链接
            </el-button>
            <span v-else class="text-muted">无结果</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="userId" width="100" />
      <el-table-column label="数据类型" align="center" prop="receiptType" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.receiptType === 'JSON' ? 'success' : 'info'" size="small">
            {{ scope.row.receiptType || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ formatDate(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="viewDetails(scope.row)"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:taskai:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:taskai:remove']"
            style="color: #f56c6c"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改AI任务，记录各类AI任务的基本信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="线上资源路径" prop="resourceUrl">
          <el-input v-model="form.resourceUrl" placeholder="请输入线上资源路径" />
        </el-form-item>
        <el-form-item label="生成后的资源" prop="newResourceUrl">
          <el-input v-model="form.newResourceUrl" placeholder="请输入生成后的资源" />
        </el-form-item>
        <el-form-item label="用户id" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户id" />
        </el-form-item>
        <el-form-item label="上传多个文件使用" prop="resourceUrl1">
          <el-input v-model="form.resourceUrl1" placeholder="请输入上传多个文件使用" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog title="任务详情" :visible.sync="detailDialogVisible" width="80%" append-to-body>
      <div class="task-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-section">
              <h4>基本信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
                <el-descriptions-item label="任务类型">
                  <el-tag :type="getTaskTypeTagType(currentTask.taskType)" size="small">
                    {{ currentTask.taskType || '未知' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="任务状态">
                  <el-tag :type="getStatusTagType(currentTask.taskStatus)" size="small">
                    {{ getStatusText(currentTask.taskStatus) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="用户ID">{{ currentTask.userId || '无' }}</el-descriptions-item>
                <el-descriptions-item label="数据类型">
                  <el-tag :type="currentTask.receiptType === 'JSON' ? 'success' : 'info'" size="small">
                    {{ currentTask.receiptType || '未知' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDate(currentTask.createTime) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-section">
              <h4>资源信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="原始资源">
                  <el-link :href="currentTask.resourceUrl" target="_blank" type="primary" v-if="currentTask.resourceUrl">
                    <i class="el-icon-link"></i>
                    查看原始资源
                  </el-link>
                  <span v-else class="text-muted">无</span>
                </el-descriptions-item>
                <el-descriptions-item label="生成结果">
                  <el-link :href="currentTask.newResourceUrl" target="_blank" type="success" v-if="currentTask.newResourceUrl">
                    <i class="el-icon-link"></i>
                    查看生成结果
                  </el-link>
                  <span v-else class="text-muted">无结果</span>
                </el-descriptions-item>
                <el-descriptions-item label="多文件资源">
                  <el-link :href="currentTask.resourceUrl1" target="_blank" type="info" v-if="currentTask.resourceUrl1">
                    <i class="el-icon-link"></i>
                    查看多文件资源
                  </el-link>
                  <span v-else class="text-muted">无</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>
        
        <!-- JSON数据展示 -->
        <div class="detail-section" v-if="currentTask.newResourceUrl && isJsonData(currentTask.newResourceUrl)">
          <h4>生成结果详情</h4>
          <div class="json-viewer">
            <el-button size="small" @click="copyJsonData" style="margin-bottom: 10px;">
              <i class="el-icon-copy-document"></i>
              复制JSON数据
            </el-button>
            <pre class="json-content">{{ formatJsonData(currentTask.newResourceUrl) }}</pre>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTaskai, getTaskai, delTaskai, addTaskai, updateTaskai } from "@/api/system/taskai"

export default {
  name: "Taskai",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // AI任务，记录各类AI任务的基本信息表格数据
      taskaiList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 详情对话框显示状态
      detailDialogVisible: false,
      // 当前查看的任务
      currentTask: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskType: null,
        resourceUrl: null,
        taskStatus: null,
        newResourceUrl: null,
        userId: null,
        receiptType: null,
        resourceUrl1: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        taskType: [
          { required: true, message: "任务类型不能为空", trigger: "change" }
        ],
        createTime: [
          { required: true, message: "任务创建时间，默认当前时间不能为空", trigger: "blur" }
        ],
        taskStatus: [
          { required: true, message: "MQ任务状态不能为空", trigger: "change" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询AI任务，记录各类AI任务的基本信息列表 */
    getList() {
      this.loading = true
      listTaskai(this.queryParams).then(response => {
        this.taskaiList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        taskType: null,
        createTime: null,
        resourceUrl: null,
        taskStatus: null,
        newResourceUrl: null,
        userId: null,
        receiptType: null,
        resourceUrl1: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加AI任务，记录各类AI任务的基本信息"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getTaskai(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改AI任务，记录各类AI任务的基本信息"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTaskai(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addTaskai(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除AI任务，记录各类AI任务的基本信息编号为"' + ids + '"的数据项？').then(function() {
        return delTaskai(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/taskai/export', {
        ...this.queryParams
      }, `taskai_${new Date().getTime()}.xlsx`)
    },
    
    // ========== 新增的优化方法 ==========
    
    /** 获取任务类型标签类型 */
    getTaskTypeTagType(taskType) {
      const typeMap = {
        '文档解析': 'primary',
        '题目生成': 'success',
        '试卷生成': 'warning',
        '作文批改': 'info',
        '思维导图': 'danger'
      }
      return typeMap[taskType] || 'info'
    },
    
    /** 获取状态标签类型 */
    getStatusTagType(status) {
      const statusMap = {
        'pending': 'info',
        'processing': 'warning',
        'completed': 'success',
        'failed': 'danger',
        'cancelled': 'info'
      }
      return statusMap[status] || 'info'
    },
    
    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        'pending': '等待中',
        'processing': '处理中',
        'completed': '已完成',
        'failed': '失败',
        'cancelled': '已取消'
      }
      return statusMap[status] || status || '未知'
    },
    
    /** 格式化URL显示 */
    formatUrl(url) {
      if (!url) return '无'
      if (url.length > 50) {
        return url.substring(0, 47) + '...'
      }
      return url
    },
    
    /** 格式化日期 */
    formatDate(date) {
      if (!date) return '无'
      return new Date(date).toLocaleString('zh-CN')
    },
    
    /** 查看生成结果详情 */
    viewGeneratedResource(row) {
      this.currentTask = row
      this.detailDialogVisible = true
    },
    
    /** 查看任务详情 */
    viewDetails(row) {
      this.currentTask = row
      this.detailDialogVisible = true
    },
    
    /** 复制资源链接 */
    copyResourceUrl(url) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          this.$message.success('链接已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopyTextToClipboard(url)
        })
      } else {
        this.fallbackCopyTextToClipboard(url)
      }
    },
    
    /** 复制JSON数据 */
    copyJsonData() {
      const jsonData = this.formatJsonData(this.currentTask.newResourceUrl)
      if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonData).then(() => {
          this.$message.success('JSON数据已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopyTextToClipboard(jsonData)
        })
      } else {
        this.fallbackCopyTextToClipboard(jsonData)
      }
    },
    
    /** 备用复制方法 */
    fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    },
    
    /** 判断是否为JSON数据 */
    isJsonData(data) {
      if (!data) return false
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        return typeof parsed === 'object' && parsed !== null
      } catch (e) {
        return false
      }
    },
    
    /** 格式化JSON数据 */
    formatJsonData(data) {
      if (!data) return '无数据'
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        return JSON.stringify(parsed, null, 2)
      } catch (e) {
        return data
      }
    }
  }
}
</script>

<style scoped>
/* 表格优化样式 */
.resource-url {
  max-width: 200px;
}

.resource-url .el-link {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.generated-resource {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.generated-resource .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.text-muted {
  color: #909399;
  font-style: italic;
}

/* 详情对话框样式 */
.task-detail {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.json-viewer {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
}

.json-content {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 表格行悬停效果 */
.el-table tbody tr:hover > td {
  background-color: #f5f7fa !important;
}

/* 状态标签样式优化 */
.el-tag {
  font-weight: 500;
}

/* 链接样式优化 */
.el-link {
  text-decoration: none;
}

.el-link:hover {
  text-decoration: underline;
}

/* 按钮组样式 */
.generated-resource .el-button + .el-button {
  margin-left: 0;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .detail-section {
    margin-bottom: 20px;
  }
  
  .json-content {
    font-size: 11px;
    max-height: 300px;
  }
}
</style>
