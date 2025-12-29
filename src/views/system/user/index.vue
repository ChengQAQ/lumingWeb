<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <!--部门数据-->
        <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="deptName" placeholder="请输入班级名称" clearable size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px" />
            </div>
            <div class="head-container">
              <el-tree :data="deptOptions" :props="defaultProps" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" node-key="id" default-expand-all highlight-current @node-click="handleNodeClick" />
            </div>
          </el-col>
        </pane>
        <!--用户数据-->
        <pane size="84">
          <el-col>
            <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
              <el-form-item label="用户名称" prop="userName">
                <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable style="width: 240px" @keyup.enter.native="handleQuery" />
              </el-form-item>
              <el-form-item label="手机号码" prop="phonenumber">
                <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 240px" @keyup.enter.native="handleQuery" />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
                  <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="创建时间">
                <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:user:edit']">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport" v-hasPermi="['system:user:import']">导入</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['system:user:export']">导出</el-button>
              </el-col>
              <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" align="center" />
              <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
              <el-table-column label="用户名称" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
              <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
              <el-table-column label="部门" align="center" key="deptName" prop="dept.deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" />
              <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="120" />
              <el-table-column label="等级" align="center" key="level" prop="level" v-if="columns[5].visible" width="80" />
              <el-table-column label="年级" align="center" key="grade" prop="grade" v-if="columns[6].visible" width="80" />
              <el-table-column label="状态" align="center" key="status" v-if="columns[7].visible">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[8].visible" width="160">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
                <template slot-scope="scope" v-if="scope.row.userId !== 1">
                  <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']">修改</el-button>
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']">删除</el-button>
                  <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:user:resetPwd', 'system:user:edit']">
                    <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="handleResetPwd" icon="el-icon-key" v-hasPermi="['system:user:resetPwd']">重置密码</el-dropdown-item>
                      <el-dropdown-item command="handleAuthRole" icon="el-icon-circle-check" v-hasPermi="['system:user:edit']">分配角色</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>

            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
          </el-col>
        </pane>
      </splitpanes>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <treeselect v-model="form.deptId" :options="enabledDeptOptions" :show-count="true" placeholder="请选择归属部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别" prop="sex">
              <el-select v-model="form.sex" placeholder="请选择性别">
                <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="科目" prop="subjectIds">
              <el-select v-model="form.subjectIds" multiple placeholder="请选择科目">
                <el-option v-for="item in subjectOptions" :key="item.subjectId" :label="item.subjectName" :value="item.subjectId" :disabled="item.status == 1" ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户等级">
              <el-select v-model="form.level" placeholder="请选择用户等级" clearable>
                <el-option label="见习" value="见习"></el-option>
                <el-option label="4级" value="4级"></el-option>
                <el-option label="3级" value="3级"></el-option>
                <el-option label="2级" value="2级"></el-option>
                <el-option label="1级" value="1级"></el-option>
                <el-option label="特级" value="特级"></el-option>
                <el-option label="宇航长" value="宇航长"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-select v-model="form.grade" placeholder="请选择年级" clearable :disabled="isTeacherRole">
                <el-option label="初一" value="初一"></el-option>
                <el-option label="初二" value="初二"></el-option>
                <el-option label="初三" value="初三"></el-option>
                <el-option label="高一" value="高一"></el-option>
                <el-option label="高二" value="高二"></el-option>
                <el-option label="高三" value="高三"></el-option>
                <el-option label="教师" value="教师"></el-option>
                <el-option label="管理员" value="管理员"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="form.userId != undefined && (currentRowGrade === '教师' || currentRowGrade === '管理员')"
          type="success"
          icon="el-icon-view"
          @click="handleViewClass"
          size="medium"
          style="margin-right: 10px;"
        >查看所在班级</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看所在班级对话框 -->
    <el-dialog
      title="所在班级信息"
      :visible.sync="classDialogVisible"
      width="600px"
      append-to-body
      custom-class="class-info-dialog"
      :close-on-click-modal="false"
    >
      <div class="class-info-content">
        <div class="class-count-info">
          <el-tag type="info" size="medium">
            <i class="el-icon-school"></i>
            共 {{ classList.length }} 个班级
          </el-tag>
        </div>

        <el-table
          v-loading="classLoading"
          :data="classList"
          style="width: 100%"
          class="class-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          :row-class-name="tableRowClassName"
        >
          <el-table-column prop="className" label="班级名称" min-width="200">
            <template slot-scope="scope">
              <div class="class-name-cell">
                <i class="el-icon-office-building"></i>
                <span class="class-name">{{ scope.row.className }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleRemoveClass(scope.row.id)"
                class="delete-btn"
                round
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="classList.length === 0 && !classLoading" class="empty-state">
          <i class="el-icon-folder-opened"></i>
          <p>暂无班级信息</p>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAddClass"
          class="add-class-btn"
          size="medium"
        >添加班级</el-button>
        <el-button
          @click="classDialogVisible = false"
          size="medium"
        >关闭</el-button>
      </div>
    </el-dialog>

    <!-- 添加班级对话框 -->
    <el-dialog
      title="添加班级"
      :visible.sync="addClassDialogVisible"
      width="500px"
      append-to-body
      custom-class="add-class-dialog"
      :close-on-click-modal="false"
    >
      <div class="add-class-content">
        <div class="form-header">
          <i class="el-icon-plus"></i>
          <span>请选择要添加班级的部门</span>
        </div>

        <el-form ref="addClassForm" :model="addClassForm" :rules="addClassRules" label-width="80px">
          <el-form-item label="选择部门" prop="deptId">
            <el-select
              v-model="addClassForm.deptId"
              placeholder="请选择部门（可多选）"
              multiple
              clearable
              style="width: 100%"
              filterable
              class="dept-select"
            >
              <el-option
                v-for="dept in deptTreeList"
                :key="dept.deptId"
                :label="dept.deptName"
                :value="dept.deptId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="submitAddClass"
          class="submit-btn"
          size="medium"
        >确 定</el-button>
        <el-button
          @click="cancelAddClass"
          size="medium"
        >取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers" :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, changeUserStatus, deptTreeSelect } from "@/api/system/user"
import { listDept, getClassList, addClass, removeClass } from "@/api/system/dept"
import { getToken } from "@/utils/auth"
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"
import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"

export default {
  name: "User",
  dicts: ['sys_normal_disable', 'sys_user_sex'],
  components: { Treeselect, Splitpanes, Pane },
  data() {
    return {
      teacheruserId: '',
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
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 所有部门树选项
      deptOptions: undefined,
      // 过滤掉已禁用部门树选项
      enabledDeptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 科目选项
      subjectOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      // 当前编辑行的原始年级（用于控制按钮显示）
      currentRowGrade: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/user/importData"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined
      },
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户名称`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `部门`, visible: true },
        { key: 4, label: `手机号码`, visible: true },
        { key: 5, label: `等级`, visible: true },
        { key: 6, label: `年级`, visible: true },
        { key: 7, label: `状态`, visible: true },
        { key: 8, label: `创建时间`, visible: true }
      ],
      // 班级对话框相关
      classDialogVisible: false,
      classLoading: false,
      classList: [],
      // 添加班级对话框相关
      addClassDialogVisible: false,
      addClassForm: {
        deptId: [],
        grade: undefined
      },
      addClassRules: {
        deptId: [
          { required: true, message: "请至少选择一个部门", trigger: "change", type: "array", min: 1 }
        ]
      },
      deptTreeList: [], // 用于添加班级对话框的部门树数据
      // 表单校验
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' },
          { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
        ],
        deptId: [
          { required: true, message: "归属部门不能为空", trigger: "blur" }
        ],
        sex: [
          { required: true, message: "用户性别不能为空", trigger: "blur" }
        ],
        roleIds: [
          { required: true, message: "角色不能为空", trigger: "blur" }
        ],
        grade: [
          { required: true, message: "年级不能为空", trigger: "blur" }
        ],
        subjectIds: [
          {
            validator: (rule, value, callback) => {
              // 检查是否选择了老师角色
              const hasTeacherRole = this.form.roleIds && this.form.roleIds.some(roleId => {
                const role = this.roleOptions.find(r => r.roleId === roleId);
                return role && role.roleName === '老师';
              });

              if (hasTeacherRole && (!value || value.length === 0)) {
                callback(new Error('当角色选择为老师时，科目为必选项'));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ]
      }
    }
  },
  computed: {
    isTeacherRole() {
      if (!this.form.roleIds || this.form.roleIds.length === 0) {
        return false;
      }
      return this.form.roleIds.some(roleId => {
        const role = this.roleOptions.find(r => r.roleId === roleId);
        return role && role.roleName === '老师';
      });
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val)
    },
    // 监听角色变化，触发科目验证和年级设置
    'form.roleIds': {
      handler(newVal) {
        // 当角色变化时，重新验证科目字段
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.validateField('subjectIds')
        })

        // 检查是否选择了老师角色，如果是则设置年级为教师
        if (newVal && newVal.length > 0) {
          const hasTeacherRole = newVal.some(roleId => {
            const role = this.roleOptions.find(r => r.roleId === roleId);
            return role && role.roleName === '老师';
          });

          if (hasTeacherRole) {
            this.form.grade = '教师';
          }
        }
      },
      deep: true
    }
  },
  created() {

    this.getList()
    this.getDeptTree()
    this.getConfigKey("sys.user.initPassword").then(response => {
      this.initPassword = response.msg
    })
  },
  methods: {

    /** 查询用户列表 */
    getList() {
      this.loading = true
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.userList = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },

    /** 查询部门下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then(response => {
        this.deptOptions = response.data
        this.enabledDeptOptions = this.filterDisabledDept(JSON.parse(JSON.stringify(response.data)))
      })
    },
    // 过滤禁用的部门
    filterDisabledDept(deptList) {
      return deptList.filter(dept => {
        if (dept.disabled) {
          return false
        }
        if (dept.children && dept.children.length) {
          dept.children = this.filterDisabledDept(dept.children)
        }
        return true
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id
      this.handleQuery()
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用"
      this.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗？').then(function() {
        return changeUserStatus(row.userId, row.status)
      }).then(() => {
        this.$modal.msgSuccess(text + "成功")
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0"
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
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        subjectIds: [],
        roleIds: [],
        level: "见习",
        grade: ""
      }
      this.currentRowGrade = undefined // 重置当前行的年级
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm("queryForm")
      this.queryParams.deptId = undefined
      this.$refs.tree.setCurrentKey(null)
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row)
          break
        case "handleAuthRole":
          this.handleAuthRole(row)
          break
        default:
          break
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      getUser().then(response => {
        this.subjectOptions = response.subjects
        this.roleOptions = response.roles
        this.open = true
        this.title = "添加用户"
        this.form.password = this.initPassword
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const userId = row.userId || this.ids
      this.teacheruserId = userId
      // 保存当前行的年级信息（用于控制按钮显示）
      this.currentRowGrade = row.grade
      getUser(userId).then(response => {
        console.log('获取用户数据:', response.data) // 调试信息
        console.log('用户Level:', response.data.level) // 调试信息
        console.log('用户Grade:', response.data.grade) // 调试信息
        this.form = response.data
        this.subjectOptions = response.subjects
        this.roleOptions = response.roles
        this.$set(this.form, "subjectIds", response.subjectIds)
        this.$set(this.form, "roleIds", response.roleIds)
        // 使用nextTick确保DOM更新后再设置值
        this.$nextTick(() => {
          if (response.data.level) {
            this.form.level = response.data.level
          }
          if (response.data.grade) {
            this.form.grade = response.data.grade
          }
          console.log('最终表单数据:', this.form) // 调试信息
        })
        this.open = true
        this.title = "修改用户"
        this.form.password = ""
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
        inputValidator: (value) => {
          if (/<|>|"|'|\||\\/.test(value)) {
            return "不能包含非法字符：< > \" ' \\\ |"
          }
        },
      }).then(({ value }) => {
          resetUserPwd(row.userId, value).then(response => {
            this.$modal.msgSuccess("修改成功，新密码是：" + value)
          })
        }).catch(() => {})
    },
    /** 分配角色操作 */
    handleAuthRole: function(row) {
      const userId = row.userId
      this.$router.push("/system/user-auth/role/" + userId)
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addUser(this.form).then(response => {
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
      const userIds = row.userId || this.ids
      this.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？').then(function() {
        return delUser(userIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/user/export', {
        ...this.queryParams
      }, `user_${new Date().getTime()}.xlsx`)
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入"
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('system/user/importTemplate', {
      }, `user_template_${new Date().getTime()}.xlsx`)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    /** 查看所在班级操作 */
    handleViewClass() {
      this.classDialogVisible = true
      this.getClassList()
    },
    /** 获取班级列表 */
    getClassList() {
      console.log()
      this.classLoading = true
      getClassList(this.teacheruserId).then(response => {
        const classMap = response.data || {}
        // 将对象转换为数组格式，便于表格渲染
        this.classList = Object.entries(classMap).map(([id, className]) => ({
          id: parseInt(id),
          className: className
        }))
        this.classLoading = false
      }).catch(error => {
        this.classLoading = false
        this.$modal.msgError("获取班级列表失败：" + (error.message || error))
      })
    },
    /** 添加班级操作 */
    handleAddClass() {
      this.addClassDialogVisible = true
      this.addClassForm.deptId = [] // 清空选择
      // 根据当前用户的归属部门判断年级
      this.determineGradeFromDept()
      // 获取部门树数据，传递年级参数用于过滤
      this.getDeptTreeList(this.addClassForm.grade)
    },
    /** 根据归属部门判断年级 */
    determineGradeFromDept() {
      if (!this.form.deptId) {
        this.addClassForm.grade = undefined
        return
      }

      // 从部门树中查找当前用户的部门信息
      const findDeptInTree = (depts, deptId) => {
        if (!depts || !Array.isArray(depts)) {
          return null
        }
        for (const dept of depts) {
          // 兼容不同的数据结构：id 或 deptId
          if (dept.id === deptId || dept.deptId === deptId) {
            return dept
          }
          if (dept.children && dept.children.length > 0) {
            const found = findDeptInTree(dept.children, deptId)
            if (found) return found
          }
        }
        return null
      }

      // 优先从 enabledDeptOptions 中查找，如果没有则从 deptOptions 中查找
      let userDept = findDeptInTree(this.enabledDeptOptions || [], this.form.deptId)
      if (!userDept) {
        userDept = findDeptInTree(this.deptOptions || [], this.form.deptId)
      }

      if (userDept) {
        const deptName = userDept.label || userDept.deptName || ''
        // 判断部门名称中是否包含"初"或"高"
        if (deptName.includes('初')) {
          this.addClassForm.grade = '初中'
        } else if (deptName.includes('高')) {
          this.addClassForm.grade = '高中'
        } else {
          this.addClassForm.grade = undefined
        }
      } else {
        this.addClassForm.grade = undefined
      }
    },
    /** 获取部门树数据 */
    getDeptTreeList(grade) {
      const params = {}
      // 如果传入了年级参数（初中或高中），添加到查询参数中
      if (grade && (grade === '初中' || grade === '高中')) {
        params.grade = grade
      }
      listDept(params).then(response => {
        // 直接使用接口返回的数据，只展示 deptName
        const deptList = response.data || []
        // 直接映射数据，保留 deptId 和 deptName
        this.deptTreeList = deptList.map(dept => ({
          deptId: dept.deptId,
          deptName: dept.deptName || ''
        }))
        console.log('部门列表数据:', this.deptTreeList) // 调试用
      }).catch(error => {
        console.error('获取部门列表失败:', error)
        this.$modal.msgError("获取部门列表失败：" + (error.message || error))
      })
    },
    /** 构建部门树形结构 */
    buildDeptTree(deptList) {
      if (!deptList || !Array.isArray(deptList) || deptList.length === 0) {
        return []
      }

      const map = {};
      const tree = [];

      // 首先创建映射，确保 deptId 和 parentId 类型一致
      deptList.forEach(dept => {
        if (dept.deptId == null) return // 跳过无效数据
        const deptId = Number(dept.deptId)
        if (isNaN(deptId)) return // 跳过无效的 deptId
        map[deptId] = { ...dept, deptId: deptId, children: [] };
      });

      // 构建树形结构
      deptList.forEach(dept => {
        if (dept.deptId == null) return // 跳过无效数据
        const deptId = Number(dept.deptId)
        if (isNaN(deptId)) return // 跳过无效的 deptId

        const parentId = dept.parentId != null ? Number(dept.parentId) : 0

        if (!parentId || parentId === 0 || isNaN(parentId)) {
          // 根节点
          if (map[deptId]) {
            tree.push(map[deptId]);
          }
        } else {
          // 子节点
          const parent = map[parentId];
          if (parent && map[deptId]) {
            parent.children.push(map[deptId]);
          }
        }
      });

      // 递归处理子节点，将树形结构扁平化为选择列表
      const flattenDeptList = [];
      const flattenDept = (depts, level = 0) => {
        depts.forEach(dept => {
          const prefix = '　'.repeat(level); // 使用全角空格作为缩进
          const hasChildren = dept.children && dept.children.length > 0;
          flattenDeptList.push({
            ...dept,
            deptName: prefix + dept.deptName,
            level: level,
            hasChildren: hasChildren
          });
          if (hasChildren) {
            flattenDept(dept.children, level + 1);
          }
        });
      };

      flattenDept(tree);
      return flattenDeptList;
    },
    /** 提交添加班级 */
    submitAddClass() {
      this.$refs["addClassForm"].validate(valid => {
        if (valid) {
          const deptIds = Array.isArray(this.addClassForm.deptId)
            ? this.addClassForm.deptId
            : [this.addClassForm.deptId]

          if (deptIds.length === 0) {
            this.$modal.msgError("请至少选择一个部门")
            return
          }

          // 构建提交数据数组，格式：[{"deptId": 123}, {"deptId": 456}]
          const submitData = deptIds.map(deptId => ({
            deptId: deptId,
            userId:this.teacheruserId
          }))

          // 直接发送数组
          addClass(submitData).then(response => {
            this.$modal.msgSuccess(`成功添加 ${deptIds.length} 个班级`)
            this.addClassDialogVisible = false
            this.getClassList() // 刷新班级列表
            this.resetAddClassForm()
          }).catch(error => {
            this.$modal.msgError("添加班级失败：" + (error.message || error))
          })
        }
      })
    },
    /** 取消添加班级 */
    cancelAddClass() {
      this.addClassDialogVisible = false
      this.resetAddClassForm()
    },
    /** 重置添加班级表单 */
    resetAddClassForm() {
      this.addClassForm = {
        deptId: [],
        grade: undefined
      }
      this.resetForm("addClassForm")
    },
    /** 删除班级操作 */
    handleRemoveClass(id) {
      this.$modal.confirm('是否确认删除该班级？').then(function() {
        return removeClass(id)
      }).then(() => {
        this.getClassList() // 刷新班级列表
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 表格行样式 */
    tableRowClassName({ row, rowIndex }) {
      if (row.level === 0) { // 根节点
        return 'el-table-row-root';
      }
      return '';
    }
  }
}
</script>
