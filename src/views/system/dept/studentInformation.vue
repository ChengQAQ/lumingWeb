<template>
  <div class="app-container">
    <div class="page-header">
      <h2>学生信息管理</h2>
      <p class="page-description">选择班级查看学生信息</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧班级列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>班级列表</h3>
        </div>
        <div class="class-list">
          <div
            v-for="classItem in classList"
            :key="classItem.id"
            :class="['class-item', { active: selectedClassId === classItem.id }]"
            @click="handleClassSelect(classItem)"
          >
            <i class="el-icon-school"></i>
            <span class="class-name">{{ classItem.className }}</span>
            <span class="student-count">({{ getStudentCount(classItem.id) }}人)</span>
          </div>
          <div v-if="classList.length === 0" class="empty-class">
            <i class="el-icon-info"></i>
            <p>暂无班级数据</p>
          </div>
        </div>
      </div>

      <!-- 右侧学生列表 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>{{ selectedClassName || '请选择班级' }}</h3>
          <div class="header-actions" v-if="selectedClassId">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd">新增学生</el-button>
<!--            <el-button type="success" size="mini" icon="el-icon-edit" :disabled="single" @click="handleUpdate">修改</el-button>-->
<!--            <el-button type="danger" size="mini" icon="el-icon-delete" :disabled="multiple" @click="handleDelete">删除</el-button>-->
          </div>
        </div>

        <!-- 学生信息表格 -->
        <div class="student-table-container">
          <el-table
            v-if="selectedClassId"
            v-loading="loading"
            :data="studentList"
            @selection-change="handleSelectionChange"
            style="width: 100%"
            height="500"
          >
<!--      <el-table-column type="selection" width="50" align="center" />-->
      <!-- <el-table-column label="用户ID" align="center" prop="userId" width="80" /> -->
      <el-table-column label="学号" align="center" prop="userName" width="185" />
      <el-table-column label="名字" align="center" prop="nickName" width="200" />
      <!-- <el-table-column label="等级" align="center" prop="level" width="80" /> -->
      <el-table-column label="年级" align="center" prop="grade" width="160" />
      <el-table-column label="性别" align="center" prop="sex" width="160">
        <template slot-scope="scope">
          <span v-if="scope.row.sex === '0'">男</span>
          <span v-else-if="scope.row.sex === '1'">女</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="手机号码" align="center" prop="phonenumber" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.phonenumber || '-' }}</span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="邮箱" align="center" prop="email" min-width="180" /> -->
      <el-table-column label="状态" align="center" prop="status" width="160">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后登录时间" align="center" prop="loginDate" width="250">
        <template slot-scope="scope">
          <span v-if="scope.row.loginDate">{{ formatDateTime(scope.row.loginDate) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" min-width="160" /> -->
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']">删除</el-button>
        </template>
          </el-table-column>
          </el-table>

          <!-- 空状态显示 -->
          <div v-else class="empty-state">
            <i class="el-icon-user"></i>
            <p>请选择班级查看学生信息</p>
          </div>

          <!-- 分页 -->
          <pagination
            v-show="selectedClassId && total > 0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />
        </div>
      </div>
    </div>

    <!-- 学生详情对话框 -->
    <el-dialog title="学生详情" :visible.sync="dialogVisible" width="600px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ currentStudent.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentStudent.userName }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentStudent.nickName }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{ currentStudent.level || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ currentStudent.grade || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <span v-if="currentStudent.sex === '0'">男</span>
          <span v-else-if="currentStudent.sex === '1'">女</span>
          <span v-else>未知</span>
        </el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ currentStudent.phonenumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentStudent.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentStudent.status === '0'" type="success">正常</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ currentStudent.loginIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间" :span="2">
          {{ currentStudent.loginDate ? formatDateTime(currentStudent.loginDate) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentStudent.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ currentStudent.updateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentStudent.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改学生配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属班级" prop="deptId">
              <el-select v-model="form.deptId" placeholder="请选择归属班级" style="width: 100%">
                <el-option
                  v-for="classItem in classList"
                  :key="classItem.id"
                  :label="classItem.className"
                  :value="classItem.id"
                />
              </el-select>
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
            <el-form-item v-if="form.userId == undefined" label="账号" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入账号" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别" prop="sex">
              <el-select v-model="form.sex" placeholder="请选择性别">
                <el-option label="男" value="0"></el-option>
                <el-option label="女" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="'0'">正常</el-radio>
                <el-radio :label="'1'">停用</el-radio>
              </el-radio-group>
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
              <el-select v-model="form.grade" placeholder="请选择年级" clearable>
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getStudentList, listClass } from "@/api/system/teacher"
import { listDept } from "@/api/system/dept"
import { listUser, getUser, delUser, addUser, updateUser } from "@/api/system/user"

export default {
  name: "StudentInformation",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      // 学生列表
      studentList: [],
      // 班级列表
      classList: [],
      // 选中的班级ID
      selectedClassId: null,
      // 选中的班级名称
      selectedClassName: '',
      // 学生数量缓存
      studentCountCache: {},
      // 学生数量加载状态
      studentCountLoading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        classId: null
      },
      // 对话框显示状态
      dialogVisible: false,
      // 当前查看的学生
      currentStudent: {},
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
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
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
        deptId: [
          { required: true, message: "归属班级不能为空", trigger: "blur" }
        ],
        sex: [
          { required: true, message: "用户性别不能为空", trigger: "blur" }
        ],
        grade: [
          { required: true, message: "年级不能为空", trigger: "blur" }
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
  created() {
    this.getClassList()
  },
  methods: {
    /** 获取班级列表 */
    async getClassList() {
      try {
        const response = await listClass()
        console.log('班级列表API响应:', response)

        if (response.code === 200) {
          // 处理不同的数据格式
          let classData = response.data

          if (Array.isArray(classData)) {
            // 数组格式
            this.classList = classData.map(item => ({
              id: item.id || item.classId,
              className: item.className || item.name
            }))
          } else if (classData && Array.isArray(classData.list)) {
            // 分页格式
            this.classList = classData.list.map(item => ({
              id: item.id || item.classId,
              className: item.className || item.name
            }))
          } else if (classData && typeof classData === 'object') {
            // 对象格式：{11011: '高三（1）班', 11012: '高三（2）班'}
            this.classList = Object.keys(classData).map(id => ({
              id: parseInt(id),
              className: classData[id]
            }))
            console.log('转换后的班级列表:', this.classList)
          } else {
            console.warn('班级数据格式不正确:', classData)
            this.classList = []
          }

          // 预加载所有班级的学生数量
          if (this.classList.length > 0) {
            await this.preloadStudentCounts()
          }
        } else {
          console.error('获取班级列表失败:', response.msg)
          this.$message.error(response.msg || '获取班级列表失败')
          this.classList = []
        }
      } catch (error) {
        console.error('获取班级列表失败:', error)
        this.$message.error('获取班级列表失败')
        this.classList = []
      }
    },

    /** 预加载所有班级的学生数量 */
    async preloadStudentCounts() {
      this.studentCountLoading = true

      try {
        // 并发获取所有班级的学生数量
        const countPromises = this.classList.map(async (classItem) => {
          try {
            // 使用新的API格式，只获取第一页来获取总数
            const params = {
              deptId: classItem.id,
              pageNum: 1,
              pageSize: 1 // 只获取1条记录，主要为了获取total
            }
            const response = await getStudentList(params)

            let count = 0
            if (response.code === 200) {
              // 新格式：使用total字段
              count = response.total || 0
            } else if (response.data && Array.isArray(response.data)) {
              // 兼容旧格式
              count = response.data.length
            }

            this.$set(this.studentCountCache, classItem.id, count)
            return { classId: classItem.id, count }
          } catch (error) {
            console.warn(`获取班级${classItem.className}学生数量失败:`, error)
            this.$set(this.studentCountCache, classItem.id, 0)
            return { classId: classItem.id, count: 0 }
          }
        })

        // 等待所有请求完成
        const results = await Promise.all(countPromises)
        console.log('学生数量预加载完成:', results)

      } catch (error) {
        console.error('预加载学生数量失败:', error)
      } finally {
        this.studentCountLoading = false
      }
    },
    /** 选择班级 */
    async handleClassSelect(classItem) {
      this.selectedClassId = classItem.id
      this.selectedClassName = classItem.className
      this.queryParams.classId = classItem.id
      // 重置分页参数
      this.queryParams.pageNum = 1
      await this.getStudentList(classItem.id)
    },

    /** 获取学生数量 */
    getStudentCount(classId) {
      if (this.studentCountCache.hasOwnProperty(classId)) {
        return this.studentCountCache[classId]
      }
      return this.studentCountLoading ? '...' : 0
    },
    /** 获取学生列表 */
    async getStudentList(classId) {
      if (!classId) return

      this.loading = true
      try {
        // 构建查询参数，包含分页信息
        const params = {
          deptId: classId,
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize
        }

        const response = await getStudentList(params)

        if (response.code === 200) {
          // 适配新的数据格式
          if (response.rows && Array.isArray(response.rows)) {
            this.studentList = response.rows
            this.total = response.total || 0
          } else if (response.data && Array.isArray(response.data)) {
            // 兼容旧格式
            this.studentList = response.data
            this.total = response.total || response.data.length
          } else {
            this.studentList = []
            this.total = 0
          }

          // 缓存学生数量（使用total字段）
          this.studentCountCache[classId] = this.total
        } else {
          this.studentList = []
          this.total = 0
          this.studentCountCache[classId] = 0
          this.$message.error(response.msg || '获取学生列表失败')
        }
      } catch (error) {
        console.error('获取学生列表失败:', error)
        this.$message.error('获取学生列表失败')
        this.studentList = []
        this.total = 0
        this.studentCountCache[classId] = 0
      } finally {
        this.loading = false
      }
    },

    /** 分页查询 */
    getList() {
      if (this.selectedClassId) {
        this.getStudentList(this.selectedClassId)
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置选择 */
    resetSelection() {
      this.selectedClassId = null
      this.selectedClassName = ''
      this.studentList = []
      this.total = 0
    },
    /** 查看学生详情 */
    handleView(row) {
      this.currentStudent = row
      this.dialogVisible = true
    },
    /** 格式化日期时间 */
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      // 如果有选中的班级，设置为默认值
      if (this.selectedClassId) {
        this.form.deptId = this.selectedClassId
      }
      this.open = true
      this.title = "添加学生"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const userId = row.userId || this.ids
      getUser(userId).then(response => {
        this.form = response.data
        // 确保 status 是字符串类型，与单选框的 label 类型一致
        if (this.form.status !== undefined && this.form.status !== null) {
          this.form.status = String(this.form.status)
        }
        this.open = true
        this.title = "修改学生"
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
        level: "见习",
        grade: ""
      }
      this.resetForm("form")
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
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.el-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.el-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 新增的样式 */
.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.left-panel {
  width: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.right-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.class-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.class-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s;
}

.class-item:hover {
  background-color: #f5f7fa;
}

.class-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.class-item i {
  margin-right: 8px;
  color: #1890ff;
  font-size: 16px;
}

.class-name {
  flex: 1;
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.student-count {
  font-size: 12px;
  color: #8c8c8c;
}

.empty-class {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-class i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.student-table-container {
  padding: 20px;
  height: calc(100% - 60px);
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #8c8c8c;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}
</style>
