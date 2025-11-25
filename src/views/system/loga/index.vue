<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="登录账号" prop="loginAccount">
        <el-input
          v-model="queryParams.loginAccount"
          placeholder="请输入登录账号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录时间" prop="loginTime">
        <el-date-picker clearable
          v-model="queryParams.loginTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择登录时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="退出登录时间" prop="logoutTime">
        <el-date-picker clearable
          v-model="queryParams.logoutTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择退出登录时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="登录地点" prop="loginLocation">
        <el-input
          v-model="queryParams.loginLocation"
          placeholder="请输入登录地点"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录设备" prop="loginDevice">
        <el-input
          v-model="queryParams.loginDevice"
          placeholder="请输入登录设备"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录Token" prop="loginToken">
        <el-input
          v-model="queryParams.loginToken"
          placeholder="请输入登录Token"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录备注" prop="loginRemark">
        <el-input
          v-model="queryParams.loginRemark"
          placeholder="请输入登录备注"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="ip" prop="ip">
        <el-input
          v-model="queryParams.ip"
          placeholder="请输入ip"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最近一次开始挂机时间" prop="lastHangUpStartTime">
        <el-date-picker clearable
          v-model="queryParams.lastHangUpStartTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择最近一次开始挂机时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="最近一次结束挂机时间" prop="lastHangUpEndTime">
        <el-date-picker clearable
          v-model="queryParams.lastHangUpEndTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择最近一次结束挂机时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="挂机备注" prop="hangUpRemark">
        <el-input
          v-model="queryParams.hangUpRemark"
          placeholder="请输入挂机备注"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="挂机分钟数" prop="hangUpMinutes">
        <el-input
          v-model="queryParams.hangUpMinutes"
          placeholder="请输入挂机分钟数"
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
          v-hasPermi="['system:loga:add']"
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
          v-hasPermi="['system:loga:edit']"
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
          v-hasPermi="['system:loga:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:loga:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="logaList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志ID" align="center" prop="id" />
      <el-table-column label="登录账号" align="center" prop="loginAccount" />
      <el-table-column label="登录时间" align="center" prop="loginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退出登录时间" align="center" prop="logoutTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.logoutTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录地点" align="center" prop="loginLocation" />
      <el-table-column label="登录设备" align="center" prop="loginDevice" />
      <el-table-column label="登录Token" align="center" prop="loginToken" />
      <el-table-column label="登录备注" align="center" prop="loginRemark" />
      <el-table-column label="登录状态：1-登录成功，2-登录失败，3-已退出 4-挂机中" align="center" prop="loginStatus" />
      <el-table-column label="ip" align="center" prop="ip" />
      <el-table-column label="最近一次开始挂机时间" align="center" prop="lastHangUpStartTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastHangUpStartTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近一次结束挂机时间" align="center" prop="lastHangUpEndTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastHangUpEndTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="挂机备注" align="center" prop="hangUpRemark" />
      <el-table-column label="挂机分钟数" align="center" prop="hangUpMinutes" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:loga:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:loga:remove']"
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

    <!-- 添加或修改学生端登录日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="登录账号" prop="loginAccount">
          <el-input v-model="form.loginAccount" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="登录时间" prop="loginTime">
          <el-date-picker clearable
            v-model="form.loginTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择登录时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="退出登录时间" prop="logoutTime">
          <el-date-picker clearable
            v-model="form.logoutTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择退出登录时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="登录地点" prop="loginLocation">
          <el-input v-model="form.loginLocation" placeholder="请输入登录地点" />
        </el-form-item>
        <el-form-item label="登录设备" prop="loginDevice">
          <el-input v-model="form.loginDevice" placeholder="请输入登录设备" />
        </el-form-item>
        <el-form-item label="登录Token" prop="loginToken">
          <el-input v-model="form.loginToken" placeholder="请输入登录Token" />
        </el-form-item>
        <el-form-item label="登录备注" prop="loginRemark">
          <el-input v-model="form.loginRemark" placeholder="请输入登录备注" />
        </el-form-item>
        <el-form-item label="ip" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入ip" />
        </el-form-item>
        <el-form-item label="最近一次开始挂机时间" prop="lastHangUpStartTime">
          <el-date-picker clearable
            v-model="form.lastHangUpStartTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择最近一次开始挂机时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="最近一次结束挂机时间" prop="lastHangUpEndTime">
          <el-date-picker clearable
            v-model="form.lastHangUpEndTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择最近一次结束挂机时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="挂机备注" prop="hangUpRemark">
          <el-input v-model="form.hangUpRemark" placeholder="请输入挂机备注" />
        </el-form-item>
        <el-form-item label="挂机分钟数" prop="hangUpMinutes">
          <el-input v-model="form.hangUpMinutes" placeholder="请输入挂机分钟数" />
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
import { listLoga, getLoga, delLoga, addLoga, updateLoga } from "@/api/system/loga"

export default {
  name: "Loga",
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
      // 学生端登录日志表格数据
      logaList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        loginAccount: null,
        loginTime: null,
        logoutTime: null,
        loginLocation: null,
        loginDevice: null,
        loginToken: null,
        loginRemark: null,
        loginStatus: null,
        ip: null,
        lastHangUpStartTime: null,
        lastHangUpEndTime: null,
        hangUpRemark: null,
        hangUpMinutes: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        loginAccount: [
          { required: true, message: "登录账号不能为空", trigger: "blur" }
        ],
        loginTime: [
          { required: true, message: "登录时间不能为空", trigger: "blur" }
        ],
        loginToken: [
          { required: true, message: "登录Token不能为空", trigger: "blur" }
        ],
        loginStatus: [
          { required: true, message: "登录状态：1-登录成功，2-登录失败，3-已退出 4-挂机中不能为空", trigger: "change" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询学生端登录日志列表 */
    getList() {
      this.loading = true
      listLoga(this.queryParams).then(response => {
        this.logaList = response.rows
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
        loginAccount: null,
        loginTime: null,
        logoutTime: null,
        loginLocation: null,
        loginDevice: null,
        loginToken: null,
        loginRemark: null,
        loginStatus: null,
        createTime: null,
        ip: null,
        lastHangUpStartTime: null,
        lastHangUpEndTime: null,
        hangUpRemark: null,
        hangUpMinutes: null
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
      this.title = "添加学生端登录日志"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getLoga(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改学生端登录日志"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateLoga(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addLoga(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除学生端登录日志编号为"' + ids + '"的数据项？').then(function() {
        return delLoga(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/loga/export', {
        ...this.queryParams
      }, `loga_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
