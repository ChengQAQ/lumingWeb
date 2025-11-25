<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系列名称" prop="series">
        <el-input
          v-model="queryParams.series"
          placeholder="请输入系列名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学科名称" prop="subjectName">
        <el-input
          v-model="queryParams.subjectName"
          placeholder="请输入学科名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="年级" prop="grade">
        <el-input
          v-model="queryParams.grade"
          placeholder="请输入年级"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="年份" prop="year">
        <el-input
          v-model="queryParams.year"
          placeholder="请输入年份"
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
          v-hasPermi="['system:series:add']"
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
          v-hasPermi="['system:series:edit']"
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
          v-hasPermi="['system:series:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:series:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="seriesList" @selection-change="handleSelectionChange" style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="用户ID" align="center" prop="userId" width="100" />
      <el-table-column label="系列类型" align="center" prop="type" width="120">
        <template slot-scope="scope">
          <el-tag :type="getSeriesTypeTagType(scope.row.type)" size="small">
            {{ getSeriesTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="系列名称" align="left" prop="series" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="series-name">
            <el-link @click="viewSeriesDetails(scope.row)" type="primary" v-if="scope.row.series">
              <i class="el-icon-view"></i>
              {{ scope.row.series }}
            </el-link>
            <span v-else class="text-muted">无</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="学科信息" align="center" min-width="120">
        <template slot-scope="scope">
          <div class="subject-info">
            <div v-if="scope.row.subjectName" class="subject-name">
              <el-tag size="mini" type="success">{{ scope.row.subjectName }}</el-tag>
            </div>
            <div v-if="scope.row.grade" class="grade-info">
              <el-tag size="mini" type="info">{{ scope.row.grade }}</el-tag>
            </div>
            <div v-if="scope.row.year" class="year-info">
              <el-tag size="mini" type="warning">{{ scope.row.year }}</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="内容预览" align="center" prop="contents" min-width="200">
        <template slot-scope="scope">
          <div class="content-preview">
            <el-button 
              size="mini" 
              type="text" 
              icon="el-icon-view" 
              @click="viewContentDetails(scope.row)"
              v-if="scope.row.contents"
            >
              查看内容
            </el-button>
            <el-button 
              size="mini" 
              type="text" 
              icon="el-icon-copy-document" 
              @click="copyContent(scope.row.contents)"
              v-if="scope.row.contents"
            >
              复制内容
            </el-button>
            <span v-else class="text-muted">无内容</span>
          </div>
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
            @click="viewSeriesDetails(scope.row)"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:series:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:series:remove']"
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

    <!-- 添加或修改系列数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="系列类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择系列类型" style="width: 100%">
            <el-option label="文本" value="text"></el-option>
            <el-option label="图片" value="image"></el-option>
            <el-option label="视频" value="video"></el-option>
            <el-option label="音频" value="audio"></el-option>
            <el-option label="混合" value="mixed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系列名称" prop="series">
          <el-input v-model="form.series" placeholder="请输入系列名称" />
        </el-form-item>
        <el-form-item label="系列内容描述" prop="contents">
          <el-input v-model="form.contents" type="textarea" :rows="4" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="学科名称" prop="subjectName">
          <el-input v-model="form.subjectName" placeholder="请输入学科名称" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input v-model="form.year" placeholder="请输入年份" />
        </el-form-item>
        <el-form-item label="备注" prop="sids">
          <el-input v-model="form.sids" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 系列详情对话框 -->
    <el-dialog title="系列详情" :visible.sync="detailDialogVisible" width="80%" append-to-body>
      <div class="series-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-section">
              <h4>基本信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="系列ID">{{ currentSeries.id }}</el-descriptions-item>
                <el-descriptions-item label="用户ID">{{ currentSeries.userId || '无' }}</el-descriptions-item>
                <el-descriptions-item label="系列类型">
                  <el-tag :type="getSeriesTypeTagType(currentSeries.type)" size="small">
                    {{ getSeriesTypeText(currentSeries.type) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="系列名称">{{ currentSeries.series || '无' }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDate(currentSeries.createTime) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatDate(currentSeries.updateTime) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-section">
              <h4>学科信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="学科名称">
                  <el-tag v-if="currentSeries.subjectName" type="success" size="small">
                    {{ currentSeries.subjectName }}
                  </el-tag>
                  <span v-else class="text-muted">无</span>
                </el-descriptions-item>
                <el-descriptions-item label="年级">
                  <el-tag v-if="currentSeries.grade" type="info" size="small">
                    {{ currentSeries.grade }}
                  </el-tag>
                  <span v-else class="text-muted">无</span>
                </el-descriptions-item>
                <el-descriptions-item label="年份">
                  <el-tag v-if="currentSeries.year" type="warning" size="small">
                    {{ currentSeries.year }}
                  </el-tag>
                  <span v-else class="text-muted">无</span>
                </el-descriptions-item>
                <el-descriptions-item label="备注">
                  <span v-if="currentSeries.sids">{{ currentSeries.sids }}</span>
                  <span v-else class="text-muted">无</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>
        
        <!-- 内容详情展示 -->
        <div class="detail-section" v-if="currentSeries.contents">
          <h4>系列内容详情</h4>
          <div class="content-viewer">
            <el-button size="small" @click="copyContent(currentSeries.contents)" style="margin-bottom: 10px;">
              <i class="el-icon-copy-document"></i>
              复制内容
            </el-button>
            <div class="content-display">
              <pre v-if="isJsonContent(currentSeries.contents)" class="json-content">{{ formatJsonContent(currentSeries.contents) }}</pre>
              <div v-else class="text-content">{{ currentSeries.contents }}</div>
            </div>
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
import { listSeries, getSeries, delSeries, addSeries, updateSeries } from "@/api/system/series"

export default {
  name: "Series",
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
      // 系列数据表格数据
      seriesList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 详情对话框显示状态
      detailDialogVisible: false,
      // 当前查看的系列
      currentSeries: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        type: null,
        series: null,
        contents: null,
        subjectName: null,
        grade: null,
        year: null,
        sids: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户ID不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "系列类型不能为空", trigger: "change" }
        ],
        series: [
          { required: true, message: "系列名称不能为空", trigger: "blur" }
        ],
        subjectName: [
          { required: true, message: "学科名称不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询系列数据列表 */
    getList() {
      this.loading = true
      listSeries(this.queryParams).then(response => {
        this.seriesList = response.rows
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
        userId: null,
        type: null,
        series: null,
        contents: null,
        subjectName: null,
        grade: null,
        year: null,
        createTime: null,
        updateTime: null,
        sids: null
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
      this.title = "添加系列数据"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getSeries(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改系列数据"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSeries(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addSeries(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除系列数据编号为"' + ids + '"的数据项？').then(function() {
        return delSeries(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/series/export', {
        ...this.queryParams
      }, `series_${new Date().getTime()}.xlsx`)
    },
    
    // ========== 新增的优化方法 ==========
    
    /** 获取系列类型标签类型 */
    getSeriesTypeTagType(type) {
      const typeMap = {
        'text': 'primary',
        'image': 'success',
        'video': 'warning',
        'audio': 'info',
        'mixed': 'danger'
      }
      return typeMap[type] || 'info'
    },
    
    /** 获取系列类型文本 */
    getSeriesTypeText(type) {
      const typeMap = {
        'text': '文本',
        'image': '图片',
        'video': '视频',
        'audio': '音频',
        'mixed': '混合'
      }
      return typeMap[type] || type || '未知'
    },
    
    /** 格式化日期 */
    formatDate(date) {
      if (!date) return '无'
      return new Date(date).toLocaleString('zh-CN')
    },
    
    /** 查看系列详情 */
    viewSeriesDetails(row) {
      this.currentSeries = row
      this.detailDialogVisible = true
    },
    
    /** 查看内容详情 */
    viewContentDetails(row) {
      this.currentSeries = row
      this.detailDialogVisible = true
    },
    
    /** 复制内容 */
    copyContent(content) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(content).then(() => {
          this.$message.success('内容已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopyTextToClipboard(content)
        })
      } else {
        this.fallbackCopyTextToClipboard(content)
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
    
    /** 判断是否为JSON内容 */
    isJsonContent(content) {
      if (!content) return false
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content
        return typeof parsed === 'object' && parsed !== null
      } catch (e) {
        return false
      }
    },
    
    /** 格式化JSON内容 */
    formatJsonContent(content) {
      if (!content) return '无内容'
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content
        return JSON.stringify(parsed, null, 2)
      } catch (e) {
        return content
      }
    }
  }
}
</script>

<style scoped>
/* 表格优化样式 */
.series-name {
  max-width: 150px;
}

.series-name .el-link {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subject-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.subject-info > div {
  margin: 2px 0;
}

.content-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.content-preview .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.text-muted {
  color: #909399;
  font-style: italic;
}

/* 详情对话框样式 */
.series-detail {
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

.content-viewer {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
}

.content-display {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.json-content {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-all;
}

.text-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
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
.content-preview .el-button + .el-button {
  margin-left: 0;
}

/* 学科信息标签样式 */
.subject-info .el-tag {
  margin: 2px;
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
  
  .text-content {
    font-size: 13px;
  }
  
  .subject-info {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
