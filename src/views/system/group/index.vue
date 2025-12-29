<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="备课组/教研组名称" prop="groupName" label-width="auto">
        <el-input
          v-model="queryParams.groupName"
          placeholder="请输入备课组/教研组名称"
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
          v-hasPermi="['system:group:add']"
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
          v-hasPermi="['system:group:edit']"
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
          v-hasPermi="['system:group:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:group:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键ID" align="center" prop="id" /> -->
      <el-table-column label="备课组/教研组名称" align="center" prop="groupName" />
      <el-table-column label="群组类型" align="center" prop="groupType">
        <template slot-scope="scope">
          <span v-if="scope.row.groupType === 1">备课组</span>
          <span v-else-if="scope.row.groupType === 2">教研组</span>
          <span v-else>{{ scope.row.groupType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:group:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:group:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleViewMembers(scope.row)"
          >查看成员</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-user-solid"
            @click="handleAddMember(scope.row)"
          >增加成员</el-button>
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

    <!-- 添加或修改教研备课组主（类似群聊）对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="650px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="备课组/教研组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入备课组/教研组名称" />
        </el-form-item>
        <el-form-item label="群组类型" prop="groupType">
          <el-select v-model="form.groupType" placeholder="请选择群组类型" style="width: 100%">
            <el-option label="备课组" :value="1" />
            <el-option label="教研组" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看成员对话框 -->
    <el-dialog title="查看成员" :visible.sync="membersOpen" width="800px" append-to-body>
      <el-table v-loading="membersLoading" :data="membersList">
        <el-table-column label="成员ID" align="center" prop="userId" width="80" />
        <el-table-column label="成员名称" align="center" prop="memberName" width="150">
          <template slot-scope="scope">
            <div>
              <div v-if="scope.row.nickName" style="font-weight: bold; color: #303133;">{{ scope.row.nickName }}</div>
              <div v-if="scope.row.userName && scope.row.userName !== scope.row.nickName" style="font-size: 12px; color: #909399;">{{ scope.row.userName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属部门" align="center" prop="deptName" width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.deptName" style="color: #606266;">{{ scope.row.deptName }}</span>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="是否组长" align="center" prop="isLeader" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isLeader === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="加入时间" align="center" prop="joinTime" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDeleteMember(scope.row)"
            >删除成员</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="membersOpen = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 增加成员对话框 -->
    <el-dialog title="增加成员" :visible.sync="addMemberOpen" width="600px" append-to-body>
      <el-form ref="addMemberForm" :model="addMemberForm" :rules="addMemberRules" label-width="100px">
        <el-form-item label="选择老师" prop="userId">
          <el-select v-model="addMemberForm.userId" placeholder="请选择要添加的老师" style="width: 100%">
            <el-option
              v-for="teacher in availableTeachers"
              :key="teacher.userId"
              :label="`${teacher.nickName || teacher.userName} (ID: ${teacher.userId})`"
              :value="teacher.userId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAddMember">确 定</el-button>
        <el-button @click="addMemberOpen = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listGroup, getGroup, delGroup, addGroup, updateGroup, getGroupMembers, deleteMember, addMember, getAvailableTeachers, getUserList } from "@/api/system/group"

export default {
  name: "Group",
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
      // 教研备课组主（类似群聊）表格数据
      groupList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        groupName: null,
        groupType: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        groupName: [
          { required: true, message: "备课组/教研组名称不能为空", trigger: "blur" }
        ],
        groupType: [
          { required: true, message: "请选择群组类型", trigger: "change" }
        ]
      },
      // 成员管理相关
      membersOpen: false,
      membersLoading: false,
      membersList: [],
      currentGroup: null,
      addMemberOpen: false,
      addMemberForm: {
        groupId: null,
        userId: null
      },
      addMemberRules: {
        userId: [
          { required: true, message: "请选择要添加的老师", trigger: "change" }
        ]
      },
      availableTeachers: [],
      // 缓存用户列表
      userListCache: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询教研备课组主（类似群聊）列表 */
    getList() {
      this.loading = true
      listGroup(this.queryParams).then(response => {
        this.groupList = response.rows
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
        groupName: null,
        groupType: null
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
      this.title = "添加教研备课组主（类似群聊）"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getGroup(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改教研备课组主（类似群聊）"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateGroup(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addGroup(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除教研备课组主（类似群聊）编号为"' + ids + '"的数据项？').then(function() {
        return delGroup(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/group/export', {
        ...this.queryParams
      }, `group_${new Date().getTime()}.xlsx`)
    },

    /** 查看成员按钮操作 */
    handleViewMembers(row) {
      this.currentGroup = row
      this.membersOpen = true
      this.loadMembers(row.id)
    },

    /** 加载成员列表 */
    async loadMembers(groupId) {
      this.membersLoading = true
      try {
        const response = await getGroupMembers(groupId)
        if (response.code === 200) {
          // 根据API返回的数据结构，数据在response.rows中
          const memberRelations = response.rows || []

          // 获取所有成员的用户ID
          const userIds = memberRelations.map(item => item.userId)

          if (userIds.length > 0) {
            // 获取用户详细信息
            await this.loadUserDetails(memberRelations)
          } else {
            this.membersList = []
          }
        } else {
          this.$modal.msgError(response.msg || '获取成员列表失败')
          this.membersList = []
        }
      } catch (error) {
        console.error('加载成员列表失败:', error)
        this.$modal.msgError('获取成员列表失败')
        this.membersList = []
      } finally {
        this.membersLoading = false
      }
    },

    /** 加载用户详细信息 */
    async loadUserDetails(memberRelations) {
      try {
        // 如果缓存中没有用户列表，则获取
        if (!this.userListCache) {
          const userResponse = await getUserList()
          if (userResponse.code === 200) {
            // 根据您提供的数据格式，用户数据在response.data中
            this.userListCache = userResponse.data || []
          } else {
            this.userListCache = []
          }
        }

        // 根据userId匹配用户信息
        this.membersList = memberRelations.map(item => {
          const user = this.userListCache.find(u => u.userId === item.userId)
          return {
            ...item,
            memberName: user ? (user.nickName || user.userName || `用户${item.userId}`) : `用户${item.userId}`,
            nickName: user ? user.nickName : null,
            userName: user ? user.userName : null,
            deptName: user && user.dept ? user.dept.deptName : null
          }
        })
      } catch (error) {
        console.error('加载用户详情失败:', error)
        // 如果获取用户详情失败，至少显示基本信息
        this.membersList = memberRelations.map(item => ({
          ...item,
          memberName: `用户${item.userId}`,
          nickName: null,
          userName: null,
          deptName: null
        }))
      }
    },

    /** 删除成员按钮操作 */
    handleDeleteMember(row) {
      this.$modal.confirm('是否确认删除成员"' + row.memberName + '"？').then(function() {
        return deleteMember(row.id)
      }).then(() => {
        this.loadMembers(this.currentGroup.id)
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },

    /** 增加成员按钮操作 */
    async handleAddMember(row) {
      this.currentGroup = row
      this.addMemberForm.groupId = row.id
      this.addMemberForm.userId = null
      this.addMemberOpen = true
      await this.loadAvailableTeachers()
    },

    /** 加载可添加的老师列表 */
    async loadAvailableTeachers() {
      try {
        const response = await getAvailableTeachers()
        if (response.code === 200) {
          // 根据API返回的数据结构，数据在response.data中
          this.availableTeachers = response.data || []
        } else {
          this.$modal.msgError(response.msg || '获取老师列表失败')
          this.availableTeachers = []
        }
      } catch (error) {
        console.error('加载老师列表失败:', error)
        this.$modal.msgError('获取老师列表失败')
        this.availableTeachers = []
      }
    },

    /** 提交添加成员 */
    submitAddMember() {
      this.$refs["addMemberForm"].validate(valid => {
        if (valid) {
          addMember(this.addMemberForm).then(response => {
            this.$modal.msgSuccess("添加成员成功")
            this.addMemberOpen = false
            // 如果当前正在查看成员列表，则刷新成员列表
            if (this.membersOpen && this.currentGroup) {
              this.loadMembers(this.currentGroup.id)
            }
          }).catch(error => {
            console.error('添加成员失败:', error)
            this.$modal.msgError('添加成员失败')
          })
        }
      })
    }
  }
}
</script>
