<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学生用户ID" prop="studentUserId">
        <el-autocomplete
          v-model="queryParams.studentUserNick"
          :fetch-suggestions="queryStudentSearch"
          :trigger-on-focus="true"
          clearable
          placeholder="请输入或选择学生用户"
          @select="handleStudentSelect"
          style="width: 100%;"
        ></el-autocomplete>
        <input type="hidden" v-model="queryParams.studentUserId" />
      </el-form-item>
      <el-form-item label="科目英文编码" prop="subjectCode">
        <el-select
          v-model="queryParams.subjectCode"
          placeholder="请选择科目英文编码"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="subject in subjectList"
            :key="subject.subjectCode"
            :label="`${subject.subjectCode}（${subject.subjectName}）`"
            :value="subject.subjectCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学习开始时间" prop="startTime">
        <el-date-picker clearable
                        v-model="queryParams.startTime"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="请选择学习开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="学习结束时间" prop="endTime">
        <el-date-picker clearable
                        v-model="queryParams.endTime"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="请选择学习结束时间">
        </el-date-picker>
      </el-form-item>
<!--      <el-form-item label="学习时长" prop="durationMinutes">-->
<!--        <el-input-->
<!--          v-model="queryParams.durationMinutes"-->
<!--          placeholder="请输入学习时长"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="记录是否有效" prop="isValid">
        <el-select
          v-model="queryParams.isValid"
          placeholder="请选择记录是否有效"
          clearable
          @change="handleQuery"
        >
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
<!--      <el-form-item label="记录上传时间" prop="createTime">-->
<!--        <el-date-picker clearable-->
<!--                        v-model="queryParams.createTime"-->
<!--                        type="datetime"-->
<!--                        value-format="yyyy-MM-dd HH:mm:ss"-->
<!--                        placeholder="请选择记录上传时间">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="记录更新时间" prop="updateTime">-->
<!--        <el-date-picker clearable-->
<!--                        v-model="queryParams.updateTime"-->
<!--                        type="datetime"-->
<!--                        value-format="yyyy-MM-dd HH:mm:ss"-->
<!--                        placeholder="请选择记录更新时间">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
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
          v-hasPermi="['system:record:add']"
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
          v-hasPermi="['system:record:edit']"
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
          v-hasPermi="['system:record:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:record:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键ID" align="center" prop="id" /> -->
      <el-table-column label="学生用户ID" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.studentUserId }} ({{ getStudentName(scope.row.studentUserId) || '未知学生' }})</span>
        </template>
      </el-table-column>
      <el-table-column label="科目信息" align="center">
        <template slot-scope="scope">
          <span>
            {{ scope.row.subjectCode }}（
            {{ getSubjectName(scope.row.subjectCode) || '未知科目' }}
            ）
          </span>
        </template>
      </el-table-column>
      <el-table-column label="学习开始时间" align="center" prop="startTime" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学习结束时间" align="center" prop="endTime" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学习时长" align="center" prop="durationMinutes" />
      <el-table-column label="学习内容备注" align="center" prop="studyContent" />
      <el-table-column label="记录是否有效" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.isValid === 1 ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="记录上传时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="记录更新时间" align="center" prop="updateTime" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:record:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:record:remove']"
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

    <!-- 添加或修改学生学习时间记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学生用户ID" prop="studentUserId">
          <el-autocomplete
            v-model="form.studentUserNick"
            :fetch-suggestions="queryStudentSearch"
            :trigger-on-focus="true"
            clearable
            placeholder="请输入或选择学生用户"
            @select="handleStudentSelectForForm"
            style="width: 100%;"
          ></el-autocomplete>
          <input type="hidden" v-model="form.studentUserId" />
        </el-form-item>
        <el-form-item label="科目英文编码" prop="subjectCode">
          <el-select
            v-model="form.subjectCode"
            placeholder="请选择科目英文编码"
          >
            <el-option
              v-for="subject in subjectList"
              :key="subject.subjectCode"
              :label="`${subject.subjectCode}（${subject.subjectName}）`"
              :value="subject.subjectCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学习开始时间" prop="startTime">
          <el-date-picker clearable
                          v-model="form.startTime"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="请选择学习开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="学习结束时间" prop="endTime">
          <el-date-picker clearable
                          v-model="form.endTime"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="请选择学习结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="学习内容备注">
          <el-input
            v-model="form.studyContent"
            placeholder="请输入学习内容备注"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="记录是否有效" prop="isValid">
          <el-select
            v-model="form.isValid"
            placeholder="请选择记录是否有效"
          >
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
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
import { listRecord, getRecord, delRecord, addRecord, updateRecord, sysSubjectList, sysUserList } from "@/api/system/record"

export default {
  name: "Record",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      recordList: [],
      title: "",
      open: false,
      // 科目列表数据
      subjectList: [],
      // 学生用户列表
      studentList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        studentUserId: null,
        studentUserNick: "", // 用于显示的学生用户昵称
        subjectCode: null,
        startTime: null,
        endTime: null,
        durationMinutes: null,
        isValid: null,
        createTime: null,
        updateTime: null
      },
      form: {
        id: null,
        studentUserId: null,
        studentUserNick: "", // 用于显示的学生用户昵称
        subjectCode: null,
        startTime: null,
        endTime: null,
        durationMinutes: null,
        studyContent: null,
        isValid: null,
        createTime: null,
        updateTime: null
      },
      rules: {
        studentUserId: [
          { required: true, message: "请选择学生用户", trigger: "change" }
        ],
        subjectCode: [
          { required: true, message: "请选择科目英文编码", trigger: "change" }
        ],
        startTime: [
          { required: true, message: "学习开始时间不能为空", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "学习结束时间不能为空", trigger: "blur" }
        ],
        isValid: [
          { required: true, message: "请选择记录是否有效", trigger: "change" }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.loadSubjectList()
    this.loadStudentList() // 加载学生用户列表
  },
  methods: {
    // 加载学生用户列表数据
    loadStudentList() {
      sysUserList().then(response => {
        this.studentList = response.data || []
      })
    },

    // 加载科目列表数据
    loadSubjectList() {
      sysSubjectList().then(response => {
        this.subjectList = response.data || []
      })
    },

    // 根据学生用户ID获取学生用户名
    getStudentName(studentUserId) {
      if (!studentUserId) return '-'
      const student = this.studentList.find(u => u.userId === studentUserId)
      return student ? student.nickName : `未知用户(${studentUserId})`
    },

    // 根据科目编码获取科目名称
    getSubjectName(subjectCode) {
      const subject = this.subjectList.find(item => item.subjectCode === subjectCode)
      return subject ? subject.subjectName : null
    },

    // 学生用户自动补全核心方法
    queryStudentSearch(queryString, callback) {
      const results = queryString
        ? this.studentList.filter(student => {
          // 匹配规则：昵称包含输入内容（不区分大小写）或用户ID包含输入内容
          const nicknameMatch = student.nickName.toLowerCase().includes(queryString.toLowerCase())
          const idMatch = student.userId.toString().includes(queryString)
          return nicknameMatch || idMatch
        })
        : [...this.studentList]  // 空输入时返回所有用户

      // 格式化结果：下拉选项显示“昵称 (ID: xxx)”，但携带纯昵称用于输入框显示
      callback(results.map(student => ({
        value: `${student.nickName} (ID: ${student.userId})`, // 下拉框显示：带ID的完整文本
        id: student.userId,
        nickName: student.nickName // 额外存储纯昵称，用于选择后显示
      })))
    },

    // 搜索框选择学生用户时触发（查询表单）
    handleStudentSelect(item) {
      this.queryParams.studentUserNick = item.nickName; // 输入框显示：纯昵称
      this.queryParams.studentUserId = item.id; // 实际提交：用户ID
    },

    // 搜索框选择学生用户时触发（表单对话框）
    handleStudentSelectForForm(item) {
      this.form.studentUserNick = item.nickName; // 输入框显示：纯昵称
      this.form.studentUserId = item.id; // 实际提交：用户ID
    },

    // 查询学生学习时间记录列表
    getList() {
      this.loading = true
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows
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
        studentUserId: null,
        studentUserNick: "",
        subjectCode: null,
        startTime: null,
        endTime: null,
        durationMinutes: null,
        studyContent: null,
        isValid: null,
        createTime: null,
        updateTime: null
      }
      this.resetForm("form")
    },

    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    // 重置按钮操作
    resetQuery() {
      this.resetForm("queryForm")
      this.queryParams.studentUserNick = ""
      this.queryParams.studentUserId = null
      this.handleQuery()
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },

    // 新增按钮操作
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加学生学习时间记录"
    },

    // 修改按钮操作
    handleUpdate(row) {
      this.reset()
      const id = row ? row.id : (this.ids.length > 0 ? this.ids[0] : null)
      if (!id) {
        this.$message.warning("请选择一条记录进行修改")
        return
      }
      getRecord(id).then(response => {
        this.form = response.data
        // 设置学生用户昵称显示
        this.form.studentUserNick = this.getStudentName(this.form.studentUserId)
        this.open = true
        this.title = "修改学生学习时间记录"
      })
    },

    // 提交按钮
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 计算学习时长（分钟）


          if (this.form.id) {
            updateRecord(this.form).then(() => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            // 新增时自动补充当前时间作为创建时间
            this.form.createTime = new Date().toISOString().split('T')[0] + ' 00:00:00'
            addRecord(this.form).then(() => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },

    // 删除按钮操作
    handleDelete(row) {
      const ids = row ? [row.id] : this.ids
      if (ids.length === 0) {
        this.$message.warning("请选择要删除的记录")
        return
      }
      this.$modal.confirm(`是否确认删除选中的${ids.length}条记录？`).then(() => {
        return delRecord(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },

    // 导出按钮操作
    handleExport() {
      this.download('system/record/export', {
        ...this.queryParams
      }, `record_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
