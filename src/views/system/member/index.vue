<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所属教研备课组ID" prop="groupId" label-width="auto">
        <el-input
          v-model="queryParams.groupId"
          placeholder="请输入所属教研备课组ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="成员用户ID" prop="userId" label-width="auto">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入成员用户ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否为组长" prop="isLeader"  label-width="auto">
        <el-select
          v-model="queryParams.isLeader"
          placeholder="请选择组长状态"
          clearable
          @change="handleQuery"
          style="width: 120px;"
        >
          <el-option label="全部" :value="null" />
          <el-option label="是组长" :value="1" />
          <el-option label="否组长" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="加入时间" prop="joinTime">
        <el-date-picker clearable
          v-model="queryParams.joinTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择加入时间">
        </el-date-picker>
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
          v-hasPermi="['system:member:add']"
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
          v-hasPermi="['system:member:edit']"
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
          v-hasPermi="['system:member:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:member:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="memberList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="所属教研备课组ID" align="center" prop="groupId" />
      <el-table-column label="成员用户ID" align="center" prop="userId" />
      <el-table-column label="组长状态" align="center" prop="isLeader" width="100">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isLeader === 1 ? 'success' : 'info'"
            size="small"
            effect="dark"
          >
            {{ scope.row.isLeader === 1 ? '组长' : '成员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="加入时间" align="center" prop="joinTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.joinTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:member:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:member:remove']"
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

    <!-- 添加或修改教研备课组成员对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="所属教研备课组ID" prop="groupId">
          <el-input v-model="form.groupId" placeholder="请输入所属教研备课组ID" />
        </el-form-item>
        <el-form-item label="成员用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入成员用户ID" />
        </el-form-item>
        <el-form-item label="组长状态" prop="isLeader">
          <el-radio-group v-model="form.isLeader" style="margin-top: 10px;">
            <el-radio :label="0">普通成员</el-radio>
            <el-radio :label="1">组长</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="加入时间" prop="joinTime">
          <el-date-picker clearable
            v-model="form.joinTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择加入时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMember, getMember, delMember, addMember, updateMember } from "@/api/system/member"

export default {
  name: "Member",
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
      // 教研备课组成员表格数据
      memberList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        groupId: null,
        userId: null,
        isLeader: null,
        joinTime: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        groupId: [
          { required: true, message: "所属教研备课组ID不能为空", trigger: "blur" }
        ],
        userId: [
          { required: true, message: "成员用户ID不能为空", trigger: "blur" }
        ],
        isLeader: [
          { required: true, message: "请选择组长状态", trigger: "change" }
        ],
        joinTime: [
          { required: true, message: "加入时间不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询教研备课组成员列表 */
    getList() {
      this.loading = true
      listMember(this.queryParams).then(response => {
        this.memberList = response.rows
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
        groupId: null,
        userId: null,
        isLeader: 0, // 默认为普通成员
        joinTime: null
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
      this.title = "添加教研备课组成员"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getMember(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改教研备课组成员"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMember(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addMember(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除教研备课组成员编号为"' + ids + '"的数据项？').then(function() {
        return delMember(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/member/export', {
        ...this.queryParams
      }, `member_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
/* 组长状态标签样式 */
.el-tag--success {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
}

.el-tag--info {
  background-color: #909399;
  border-color: #909399;
  color: white;
}

/* 表单样式优化 */
.el-form-item {
  margin-bottom: 20px;
}

.el-radio-group {
  display: flex;
  gap: 20px;
}

.el-radio {
  margin-right: 0;
}

/* 表格样式优化 */
.el-table .el-table__row:hover {
  background-color: #f5f7fa;
}

/* 搜索表单样式 */
.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 15px;
}

/* 弹窗样式优化 */
.el-dialog__body {
  padding: 20px 30px;
}

.el-dialog__footer {
  padding: 15px 30px;
  border-top: 1px solid #ebeef5;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .el-form--inline .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .el-radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
