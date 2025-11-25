<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="应用名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入应用名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用版本号" prop="version">
        <el-input
          v-model="queryParams.version"
          placeholder="请输入应用版本号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="文件包下载地址" prop="url">
        <el-input
          v-model="queryParams.url"
          placeholder="请输入文件包下载地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="应用类型" prop="appType">
        <el-select
          v-model="queryParams.appType"
          placeholder="请选择应用类型"
          clearable
          @keyup.enter.native="handleQuery"
        >
          <el-option label="教师端" value="教师端"></el-option>
          <el-option label="学生端" value="学生端"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="更新类型：apk或wgt" prop="updateCategory">
        <el-input
          v-model="queryParams.updateCategory"
          placeholder="请输入更新类型：apk或wgt"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="更新备注" prop="updateRemark">
        <el-input
          v-model="queryParams.updateRemark"
          placeholder="请输入更新备注"
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
          v-hasPermi="['system:update:add']"
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
          v-hasPermi="['system:update:edit']"
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
          v-hasPermi="['system:update:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:update:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="updateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="${comment}" align="center" prop="id" /> -->
      <el-table-column label="应用名称" align="center" prop="name" />
      <el-table-column label="应用版本号" align="center" prop="version" />
      <el-table-column label="应用类型" align="center" prop="appType" />
      <el-table-column label="更新方式：0=不更新，1=热更新app包，2=下载整包" align="center" prop="updateType" />
      <el-table-column label="文件包下载地址" align="center" prop="url" />
      <el-table-column label="更新类型：apk或wgt" align="center" prop="updateCategory" />
      <el-table-column label="更新备注" align="center" prop="updateRemark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:update:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:update:remove']"
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

    <!-- 添加或修改app更新对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="应用版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入应用版本号" />
        </el-form-item>
        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="form.appType" placeholder="请选择应用类型" style="width: 100%">
            <el-option label="教师端" value="教师端"></el-option>
            <el-option label="学生端" value="学生端"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="更新方式" prop="updateType">
          <el-select v-model="form.updateType" placeholder="请选择更新方式" style="width: 100%" @change="handleUpdateTypeChange">
            <el-option label="不更新" :value="0"></el-option>
            <el-option label="热更新app包" :value="1"></el-option>
            <el-option label="下载整包" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="更新类型" prop="updateCategory">
          <el-input v-model="form.updateCategory" placeholder="根据更新方式自动选择" disabled />
        </el-form-item>
        <el-form-item label="更新备注" prop="updateRemark">
          <el-input v-model="form.updateRemark" type="textarea" :rows="3" placeholder="请输入更新备注" />
        </el-form-item>
        <el-form-item label="文件上传" prop="file">
          <el-upload
            ref="upload"
            :action="uploadUrl"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            :auto-upload="false"
            :limit="1"
            :accept="fileAccept"
          >
            <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">{{ fileUploadTip }}</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="submitting">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUpdate, getUpdate, delUpdate, addUpdate, updateUpdate } from "@/api/system/update"
import request from '@/utils/request'

export default {
  name: "Update",
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
      // app更新表格数据
      updateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 提交状态
      submitting: false,
      // 上传配置
      uploadUrl: '/system/update',
      uploadHeaders: {
        'Content-Type': 'multipart/form-data'
      },
      uploadData: {},
      fileList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        version: null,
        updateType: null,
        url: null,
        updateCategory: null,
        updateRemark: null,
        appType: null
      },
      // 表单参数
      form: {
        name: '',
        version: '',
        appType: '',
        updateType: 2,
        updateCategory: 'wgt',
        updateRemark: '',
        file: null
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "应用名称不能为空", trigger: "blur" }
        ],
        version: [
          { required: true, message: "应用版本号不能为空", trigger: "blur" }
        ],
        appType: [
          { required: true, message: "应用类型不能为空", trigger: "change" }
        ],
        updateType: [
          { required: true, message: "更新方式不能为空", trigger: "change" }
        ],
        updateCategory: [
          { required: true, message: "更新类型不能为空", trigger: "change" }
        ],
        updateRemark: [
          { required: true, message: "更新备注不能为空", trigger: "blur" }
        ],
        file: [
          { required: true, message: "请选择要上传的文件", trigger: "change" }
        ]
      }
    }
  },
  computed: {
    // 根据更新方式确定文件类型
    fileAccept() {
      if (this.form.updateType === 1) {
        return '.wgt'  // 热更新只接受wgt文件
      } else {
        return '.apk'  // 不更新和下载整包只接受apk文件
      }
    },
    // 文件上传提示信息
    fileUploadTip() {
      if (this.form.updateType === 1) {
        return '只能上传wgt文件，且不超过1000MB'
      } else {
        return '只能上传apk文件，且不超过1000MB'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询app更新列表 */
    getList() {
      this.loading = true
      listUpdate(this.queryParams).then(response => {
        this.updateList = response.rows
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
        name: '',
        version: '',
        appType: '',
        updateType: 2,
        updateCategory: 'apk',  // 默认下载整包，使用apk
        updateRemark: '',
        file: null
      }
      this.fileList = []
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
      this.title = "添加app更新"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getUpdate(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改app更新"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (!this.form.file) {
            this.$message.warning('请选择要上传的文件')
            return
          }
          
          this.submitting = true
          
          // 创建FormData对象
          const formData = new FormData()
          formData.append('name', this.form.name)
          formData.append('version', this.form.version)
          formData.append('appType', this.form.appType)
          formData.append('updateType', this.form.updateType)
          formData.append('updateCategory', this.form.updateCategory)
          formData.append('updateRemark', this.form.updateRemark)
          formData.append('file', this.form.file)
          
          console.log('提交数据:', {
            name: this.form.name,
            version: this.form.version,
            appType: this.form.appType,
            updateType: this.form.updateType,
            updateCategory: this.form.updateCategory,
            updateRemark: this.form.updateRemark,
            file: this.form.file
          })
          
          // 使用request发送POST请求
          request({
            url: '/system/update',
            method: 'post',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(response => {
            console.log('提交成功:', response)
            this.$modal.msgSuccess("新增成功")
            this.open = false
            this.getList()
            this.submitting = false
          }).catch(error => {
            console.error('提交失败:', error)
            this.$modal.msgError("提交失败，请重试")
            this.submitting = false
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除app更新编号为"' + ids + '"的数据项？').then(function() {
        return delUpdate(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/update/export', {
        ...this.queryParams
      }, `update_${new Date().getTime()}.xlsx`)
    },
    
    /** 更新方式变化处理 */
    handleUpdateTypeChange(value) {
      // 根据更新方式自动设置更新类型
      if (value === 1) {
        this.form.updateCategory = 'wgt'  // 热更新使用wgt
      } else {
        this.form.updateCategory = 'apk'  // 不更新和下载整包使用apk
      }
      
      // 清空已选择的文件，因为文件类型可能不匹配
      this.fileList = []
      this.form.file = null
      
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.form.validateField('updateCategory')
        this.$refs.form.validateField('file')
      })
    },

    /** 文件上传前处理 */
    beforeUpload(file) {
      const isApk = file.name.endsWith('.apk')
      const isWgt = file.name.endsWith('.wgt')
      const isLt100M = file.size / 1024 / 1024 < 1000

      // 根据更新方式验证文件类型
      if (this.form.updateType === 1) {
        // 热更新只接受wgt文件
        if (!isWgt) {
          this.$message.error('热更新只能上传wgt格式的文件!')
          return false
        }
      } else {
        // 不更新和下载整包只接受apk文件
        if (!isApk) {
          this.$message.error('不更新/下载整包只能上传apk格式的文件!')
          return false
        }
      }
      
      if (!isLt100M) {
        this.$message.error('上传文件大小不能超过 1000MB!')
        return false
      }
      
      return false // 阻止自动上传，我们手动控制
    },
    
    /** 文件选择变化 */
    handleFileChange(file, fileList) {
      console.log('文件选择变化:', file, fileList)
      
      if (file.status === 'ready') {
        // 验证文件
        const isApk = file.name.endsWith('.apk')
        const isWgt = file.name.endsWith('.wgt')
        const isLt100M = file.size / 1024 / 1024 < 1000

        // 根据更新方式验证文件类型
        if (this.form.updateType === 1) {
          // 热更新只接受wgt文件
          if (!isWgt) {
            this.$message.error('热更新只能上传wgt格式的文件!')
            this.fileList = []
            this.form.file = null
            return
          }
        } else {
          // 不更新和下载整包只接受apk文件
          if (!isApk) {
            this.$message.error('不更新/下载整包只能上传apk格式的文件!')
            this.fileList = []
            this.form.file = null
            return
          }
        }
        
        if (!isLt100M) {
          this.$message.error('上传文件大小不能超过 1000MB!')
          this.fileList = []
          this.form.file = null
          return
        }
        
        // 更新文件列表和表单
        this.fileList = fileList
        this.form.file = file.raw || file
        this.$message.success('文件选择成功')
        
        // 手动触发表单验证
        this.$nextTick(() => {
          this.$refs.form.validateField('file')
        })
      }
    },
    
    /** 文件移除 */
    handleFileRemove(file, fileList) {
      console.log('文件移除:', file, fileList)
      this.fileList = fileList
      this.form.file = null
      this.$message.info('文件已移除')
      
      // 手动触发表单验证
      this.$nextTick(() => {
        this.$refs.form.validateField('file')
      })
    }
  }
}
</script>

<style scoped>
.el-upload__tip {
  color: #606266;
  font-size: 12px;
  margin-top: 7px;
}

.el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

.el-upload {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
  height: 120px;
}

.el-upload-dragger .el-icon-upload {
  font-size: 28px;
  color: #c0c4cc;
  margin: 40px 0 16px;
  line-height: 50px;
}

.el-upload-dragger .el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.el-upload-dragger .el-upload__text em {
  color: #409eff;
  font-style: normal;
}

/* 禁用状态样式 */
.el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

.el-input.is-disabled .el-input__inner::placeholder {
  color: #c0c4cc;
}
</style>
