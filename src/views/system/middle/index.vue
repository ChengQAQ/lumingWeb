<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <!-- <el-form-item label="关联用户表的唯一标识" prop="userId" label-width="auto">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入关联用户表的唯一标识"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="用户姓名" prop="userName" label-width="auto">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数学能力评分" prop="math" label-width="auto" v-if="shouldShowSubject('数学')">
        <el-select v-model.number="queryParams.math" placeholder="请选择数学能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="科学综合能力评分" prop="science" label-width="auto" v-if="shouldShowSubject('科学')">
        <el-select v-model.number="queryParams.science" placeholder="请选择科学综合能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="语文能力评分" prop="chinese" label-width="auto" v-if="shouldShowSubject('语文')">
        <el-select v-model.number="queryParams.chinese" placeholder="请选择语文能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="英语能力评分" prop="english" label-width="auto" v-if="shouldShowSubject('英语')">
        <el-select v-model.number="queryParams.english" placeholder="请选择英语能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="历史能力评分" prop="history" label-width="auto" v-if="shouldShowSubject('历史')">
        <el-select v-model.number="queryParams.history" placeholder="请选择历史能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="政治" prop="politics" label-width="auto" v-if="shouldShowSubject('政治')">
        <el-select v-model.number="queryParams.politics" placeholder="请选择政治等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="地理能力评分" prop="geography" label-width="auto" v-if="shouldShowSubject('地理')">
        <el-select v-model.number="queryParams.geography" placeholder="请选择地理能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="Python编程能力评分" prop="python" label-width="auto" v-if="shouldShowSubject('Python')">
        <el-select v-model.number="queryParams.python" placeholder="请选择Python编程能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="综合思维能力评分" prop="theta" label-width="auto" v-if="shouldShowSubject('综合')">
        <el-select v-model.number="queryParams.theta" placeholder="请选择综合思维能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
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
          v-hasPermi="['system:middle:add']"
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
          v-hasPermi="['system:middle:edit']"
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
          v-hasPermi="['system:middle:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:middle:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="middleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键，自增唯一标识" align="center" prop="id" /> -->
      <!-- <el-table-column label="关联用户表的唯一标识" align="center" prop="userId" /> -->
      <el-table-column label="用户姓名" align="center" prop="userName" />
      <el-table-column label="数学能力评分" align="center" v-if="shouldShowSubject('数学')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.math" :type="getLevelTagType(getScoreLevel(scope.row.math))" size="mini">
            {{ getScoreLevel(scope.row.math) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="科学综合能力评分" align="center" v-if="shouldShowSubject('科学综合')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.science" :type="getLevelTagType(getScoreLevel(scope.row.science))" size="mini">
            {{ getScoreLevel(scope.row.science) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="语文能力评分" align="center" v-if="shouldShowSubject('语文')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.chinese" :type="getLevelTagType(getScoreLevel(scope.row.chinese))" size="mini">
            {{ getScoreLevel(scope.row.chinese) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="英语能力评分" align="center" v-if="shouldShowSubject('英语')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.english" :type="getLevelTagType(getScoreLevel(scope.row.english))" size="mini">
            {{ getScoreLevel(scope.row.english) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="历史能力评分" align="center" v-if="shouldShowSubject('历史')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.history" :type="getLevelTagType(getScoreLevel(scope.row.history))" size="mini">
            {{ getScoreLevel(scope.row.history) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="政治" align="center" v-if="shouldShowSubject('政治')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.politics" :type="getLevelTagType(getScoreLevel(scope.row.politics))" size="mini">
            {{ getScoreLevel(scope.row.politics) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="地理能力评分" align="center" v-if="shouldShowSubject('地理')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.geography" :type="getLevelTagType(getScoreLevel(scope.row.geography))" size="mini">
            {{ getScoreLevel(scope.row.geography) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Python编程能力评分" align="center" v-if="shouldShowSubject('Python')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.python" :type="getLevelTagType(getScoreLevel(scope.row.python))" size="mini">
            {{ getScoreLevel(scope.row.python) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="综合思维能力评分" align="center" v-if="shouldShowSubject('综合')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.theta" :type="getLevelTagType(getScoreLevel(scope.row.theta))" size="mini">
            {{ getScoreLevel(scope.row.theta) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:middle:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:middle:remove']"
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

    <!-- 添加或修改初中学生能力评估对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="关联用户表的唯一标识" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入关联用户表的唯一标识" />
        </el-form-item> -->
        <el-form-item label="用户姓名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户姓名" />
        </el-form-item>
        <el-form-item label="数学能力评分" prop="math" v-if="shouldShowSubject('数学')">
          <el-select v-model.number="form.math" placeholder="请选择数学能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="科学综合能力评分" prop="science" v-if="shouldShowSubject('科学')">
          <el-select v-model.number="form.science" placeholder="请选择科学综合能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="语文能力评分" prop="chinese" v-if="shouldShowSubject('语文')">
          <el-select v-model.number="form.chinese" placeholder="请选择语文能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="英语能力评分" prop="english" v-if="shouldShowSubject('英语')">
          <el-select v-model.number="form.english" placeholder="请选择英语能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="历史能力评分" prop="history" v-if="shouldShowSubject('历史')">
          <el-select v-model.number="form.history" placeholder="请选择历史能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="政治" prop="politics" v-if="shouldShowSubject('政治')">
          <el-select v-model.number="form.politics" placeholder="请选择政治等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="地理能力评分" prop="geography" v-if="shouldShowSubject('地理')">
          <el-select v-model.number="form.geography" placeholder="请选择地理能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="Python编程能力评分" prop="python" v-if="shouldShowSubject('python')">
          <el-select v-model.number="form.python" placeholder="请选择Python编程能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="综合思维能力评分" prop="theta" v-if="shouldShowSubject('综合')">
          <el-select v-model.number="form.theta" placeholder="请选择综合思维能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
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
import { listMiddle, getMiddle, delMiddle, addMiddle, updateMiddle } from "@/api/system/middle"
import { shouldShowSubject as checkShouldShowSubject } from "@/utils/subjectMapping"

export default {
  name: "Middle",
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
      // 初中学生能力评估表格数据
      middleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        math: null,
        science: null,
        chinese: null,
        english: null,
        history: null,
        politics: null,
        geography: null,
        python: null,
        theta: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "关联用户表的唯一标识不能为空", trigger: "blur" }
        ],
        userName: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" }
        ],
        math: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('数学能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        science: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('科学综合能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        chinese: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('语文能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        english: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('英语能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        history: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('历史能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        politics: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('政治评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        geography: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('地理能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        python: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('Python编程能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        theta: [
          { 
            validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value)
                if (isNaN(numValue) || numValue < 0.000001 || numValue > 0.99999999) {
                  callback(new Error('综合思维能力评分必须在0.000001到0.99999999之间'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
      },
      // 评分等级映射表
      subjectMap: {
        "0.0-0.49": "四级",
        "0.5-0.69": "三级", 
        "0.7-0.79": "二级",
        "0.8-0.89999999": "一级",
        "0.9-9999": "特级宇航员"
      }
    }
  },
  created() {
    this.getList()
  },
  computed: {
    // 获取教师信息
    teacherInfo() {
      return this.$store.getters.teacherInfo || {}
    },
    
    // 教师科目
    teacherSubject() {
      return this.teacherInfo.subjectNames || null
    }
  },
  methods: {
    /** 查询初中学生能力评估列表 */
    getList() {
      this.loading = true
      listMiddle(this.queryParams).then(response => {
        console.log('初中学生能力分层API响应:', response)
        
        if (response.code === 200) {
          // 适配新的数据格式：{code: 200, msg: "查询成功", total: 52, rows: [...]}
          if (response.rows && Array.isArray(response.rows)) {
            this.middleList = response.rows
            this.total = response.total || 0
          } else if (response.data && Array.isArray(response.data)) {
            // 兼容旧格式
            this.middleList = response.data
            this.total = response.total || response.data.length
          } else {
            this.middleList = []
            this.total = 0
          }
        } else {
          this.middleList = []
          this.total = 0
          this.$message.error(response.msg || '获取数据失败')
        }
        
        this.loading = false
      }).catch(error => {
        console.error('获取初中学生能力分层数据失败:', error)
        this.middleList = []
        this.total = 0
        this.loading = false
        this.$message.error('获取数据失败')
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
        userName: null,
        math: null,
        science: null,
        chinese: null,
        english: null,
        history: null,
        politics: null,
        geography: null,
        python: null,
        theta: null,
        createTime: null,
        updateTime: null
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
      this.title = "添加初中学生能力评估"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getMiddle(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改初中学生能力评估"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMiddle(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addMiddle(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除初中学生能力评估编号为"' + ids + '"的数据项？').then(function() {
        return delMiddle(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/middle/export', {
        ...this.queryParams
      }, `middle_${new Date().getTime()}.xlsx`)
    },
    /** 根据评分获取等级 */
    getScoreLevel(score) {
      if (!score || isNaN(score)) {
        return ""
      }
      const numScore = parseFloat(score)
      
      if (numScore >= 0.0 && numScore <= 0.49) {
        return this.subjectMap["0.0-0.49"]
      } else if (numScore >= 0.5 && numScore <= 0.69) {
        return this.subjectMap["0.5-0.69"]
      } else if (numScore >= 0.7 && numScore <= 0.79) {
        return this.subjectMap["0.7-0.79"]
      } else if (numScore >= 0.8 && numScore < 0.9) {
        return this.subjectMap["0.8-0.89999999"]
      } else if (numScore >= 0.9) {
        return this.subjectMap["0.9-9999"]
      }
      
      return ""
    },
    /** 根据等级获取标签类型 */
    getLevelTagType(level) {
      switch (level) {
        case "特级宇航员":
          return "danger"
        case "一级":
          return "warning"
        case "二级":
          return "success"
        case "三级":
          return "primary"
        case "四级":
          return "info"
        default:
          return ""
      }
    },
    /** 检查是否应该显示某个科目 */
    shouldShowSubject(subjectName) {
      return checkShouldShowSubject(subjectName, this.teacherSubject, 'middle')
    }
    
  }
}
</script>
