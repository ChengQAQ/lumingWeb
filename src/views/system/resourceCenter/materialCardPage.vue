<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <div v-if="!showFileListView" class="material-filter-bar">
      <div class="filter-row">
        <!-- 新增按钮 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="medium"
          @click="handleAdd"
        >
          新增
        </el-button>
        <div style="display: flex; align-items: center; gap: 15px;">
          <!-- 科目选择 -->
          <div class="subject-selector">
            <span class="control-label">选择科目：</span>
            <!-- 科目下拉框（从接口获取，管理员和老师都使用） -->
            <el-select
              v-model="selectedSubject"
              placeholder="请选择科目"
              size="medium"
              style="width: 150px"
              @change="handleSubjectChange"
              clearable
            >
              <el-option
                v-for="subject in subjectOptions"
                :key="subject.subjectCode"
                :label="subject.subjectName"
                :value="subject.subjectName"
              />
            </el-select>
          </div>

          <!-- 系列类型筛选 -->
          <el-select
            v-model="localSelectedSeriesType"
            placeholder="选择系列类型"
            @change="handleSeriesTypeChange"
            class="series-type-select"
            clearable
            size="medium"
          >
            <el-option
              v-for="item in seriesTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <!-- 系列搜索 -->
          <el-input
            v-model="localSeriesSearchKeyword"
            placeholder="搜索系列名称"
            @input="handleSeriesSearchThrottled"
            class="series-search-input"
            clearable
            size="medium"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog
      :title="editDialogTitle"
      :visible.sync="addDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="类型" prop="type">
          <el-select
            v-model="addForm.type"
            placeholder="请选择类型"
            style="width: 100%"
          >
            <el-option label="试卷" value="试卷"></el-option>
            <el-option label="视频" value="视频"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="系列名称" prop="series">
          <el-input
            v-model="addForm.series"
            placeholder="请输入系列名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="科目" prop="subjectName">
          <el-select
            v-model="addForm.subjectName"
            placeholder="请选择科目"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="subject in subjectOptions"
              :key="subject.subjectCode"
              :label="subject.subjectName"
              :value="subject.subjectName"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitAdd" :loading="addLoading">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 文件列表视图 -->
    <div v-if="showFileListView" class="file-list-view">
      <div class="file-list-header">
        <div>
          <el-button
            icon="el-icon-arrow-left"
            size="medium"
            @click="handleBackToCardView"
          >
            返回系列列表
          </el-button>
          <span class="file-list-title">{{ currentSeriesName }}</span>
        </div>
        <div>
          <el-row :gutter="10" class="mb8" style="margin-bottom: unset">
            <el-col :span="1.5">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="handleFileAdd"
                v-hasPermi="['system:knowledge:add']"
              >上传文件</el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <el-card class="file-list-card" shadow="hover">
        <div v-loading="fileListLoading">
          <el-table
            :data="fileList"
            style="width: 100%"
            border
            @selection-change="handleFileSelectionChange"
          >
            <el-table-column label="文件类型" align="center" prop="fileType" width="120">
              <template slot-scope="scope">
                <div class="file-type-cell">
                  <i :class="getFileTypeIcon(scope.row.fileType)" class="file-type-icon" :title="scope.row.fileType"></i>
                  <span class="file-type-text">{{ scope.row.fileType || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="文件用途" align="center" prop="filePurpose" width="120">
              <template slot-scope="scope">
                <div class="file-purpose-cell">
                  <i :class="getFilePurposeIcon(scope.row.filePurpose)" class="file-purpose-icon"></i>
                  <span class="file-purpose-text">{{ scope.row.filePurpose || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="文件名" align="center" prop="userFname" show-overflow-tooltip />
            <el-table-column label="章节" align="center" prop="knowledge" show-overflow-tooltip />
            <el-table-column label="上传人" align="center" prop="uploadUserId" width="120">
              <template slot-scope="scope">
                {{ getUserName(scope.row.uploadUserId) }}
              </template>
            </el-table-column>
            <el-table-column label="科目" align="center" prop="subjectName" width="120">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.subjectName" type="primary" size="small">
                  {{ getSubjectDisplay(scope.row.subjectName) }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="年级" align="center" prop="grade" width="100">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.grade" type="success" size="small">
                  {{ scope.row.grade }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="上传时间" align="center" prop="uploadTime" width="160">
              <template slot-scope="scope">
                {{ scope.row.uploadTime ? parseTime(scope.row.uploadTime, '{y}-{m}-{d}') : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-view"
                  @click="handlePreview(scope.row)"
                  class="preview-btn"
                >预览</el-button>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleFileUpdate(scope.row)"
                  v-hasPermi="['system:knowledge:edit']"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleFileDelete(scope.row)"
                  v-hasPermi="['system:knowledge:remove']"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="file-list-pagination" v-if="fileListTotal > 0">
            <el-pagination
              @size-change="handleFileListSizeChange"
              @current-change="handleFileListCurrentChange"
              :current-page="fileListPageNum"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="fileListPageSize"
              :total="fileListTotal"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 卡片视图 -->
    <template v-else>
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <i class="el-icon-loading"></i>
        <p>正在加载数据...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredMaterials.length === 0" class="empty-container">
        <i class="el-icon-document"></i>
        <p>暂无数据</p>
      </div>

      <!-- 卡片网格和分页 -->
      <div v-else class="material-content-wrapper">
      <div class="material-cards-grid">
        <div
          v-for="material in paginatedMaterials"
          :key="material.id"
          class="material-card"
        >
          <!-- 书籍封面背景 -->
          <div class="book-cover">
            <img src="@/assets/images/book.png" alt="教辅材料" class="book-background" />

            <!-- 类型标签 -->
            <div class="card-type-badge" :class="getTypeClass(material.type)">
              {{ getTypeText(material.type) }}
            </div>

            <!-- 年份和学科 -->
            <div class="book-year-subject">
              <span v-if="material.year">{{ material.year }}年</span>
              <span v-if="material.year && material.subjectName">·</span>
              <span v-if="material.subjectName">{{ material.subjectName }}</span>
            </div>

            <!-- 系列名称（标题）- 居中显示 -->
            <div class="book-title">
              {{ material.series || material.label || '未命名教辅材料' }}
            </div>

            <!-- 详细信息（年级、册数等） -->
            <div class="book-details" v-if="getMaterialDetails(material)">
              {{ getMaterialDetails(material) }}
            </div>

            <!-- 出版社/版本 -->
            <div class="book-publisher" v-if="getPublisher(material)">
              {{ getPublisher(material) }}
            </div>

            <!-- 悬浮操作按钮 -->
            <div class="card-actions">
              <el-button
                circle
                type="primary"
                icon="el-icon-view"
                size="small"
                class="action-btn view-btn"
                @click.stop="handleView(material)"
                title="查看"
              ></el-button>
              <el-button
                circle
                type="warning"
                icon="el-icon-edit"
                size="small"
                class="action-btn edit-btn"
                @click.stop="handleEdit(material)"
                title="修改"
              ></el-button>
              <el-button
                circle
                type="danger"
                icon="el-icon-delete"
                size="small"
                class="action-btn delete-btn"
                @click.stop="handleDelete(material)"
                title="删除"
              ></el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="material-pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[12, 24, 36, 48]"
          :page-size="pageSize"
          :total="materialsTotal"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>
    </template>

    <!-- 文件预览弹窗 -->
    <FilePreview
      :visible="previewVisible"
      :file="currentPreviewFile"
      @close="handlePreviewClose"
    />

    <!-- 添加或修改文件对话框 -->
    <el-dialog :title="fileDialogTitle" :visible.sync="fileDialogVisible" width="750px" append-to-body>
      <el-form ref="fileForm" :model="fileForm" :rules="fileFormRules" label-width="120px">
        <el-form-item label="文件用途" prop="filePurpose">
          <el-select
            v-model="fileForm.filePurpose"
            placeholder="请选择或输入文件用途"
            clearable
            allow-create
            filterable
          >
            <el-option
              v-for="item in filePurposeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <!-- paperType 下拉框，仅在选择教辅材料/自定义作业/自定义试卷时显示 -->
        <el-form-item
          v-if="showPaperType"
          label="试卷类型"
          prop="paperType"
        >
          <el-select
            v-model="fileForm.paperType"
            placeholder="请选择试卷类型"
            clearable
            style="width: 100%"
          >
            <el-option label="月考" value="月考" />
            <el-option label="期中" value="期中" />
            <el-option label="期末" value="期末" />
            <el-option label="高考模考" value="高考模考" />
            <el-option label="高考真题" value="高考真题" />
            <el-option label="名校" value="名校" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件名" prop="userFname">
          <el-input v-model="fileForm.userFname" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item label="文件" prop="filePath">
          <file-upload v-model="fileForm.filePath"/>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select
            v-model="fileForm.grade"
            placeholder="请选择年级"
            clearable
          >
            <el-option
              v-for="grade in gradeOptions"
              :key="grade.value"
              :label="grade.label"
              :value="grade.value"
            />
          </el-select>
          <div v-if="!isAdmin" class="form-tip">
            年级将根据您的教师信息自动设置
          </div>
        </el-form-item>
        <el-form-item label="课程名" prop="subjectName">
          <el-select
            v-model="fileForm.subjectName"
            placeholder="请选择课程名"
            clearable
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="subject in subjectOptions"
              :key="subject.subjectCode"
              :label="subject.subjectName"
              :value="subject.subjectName"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="章节" prop="knowledge" :required="false">
          <el-cascader
            v-model="fileForm.knowledge"
            :options="Array.isArray(chapterOptions) ? chapterOptions : []"
            :props="chapterProps"
            placeholder="请选择章节"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="cancelFileForm">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addSeries, listSeries, getSeries, updateSeries, delSeries } from '@/api/system/series'
import { getTeacherInfo } from '@/api/system/teacher'
import { getFileBySeries, sysSubjectList, getKnowledge, delKnowledge, addKnowledge, updateKnowledge, sysGetchaptermap, selectFilePurpose, sysUserList } from '@/api/system/knowledge'
import { listSubject } from '@/api/system/subject'
import { parseTime } from '@/utils/ruoyi'
import FilePreview from '@/components/FilePreview'
import FileUpload from '@/components/FileUpload'

export default {
  name: 'MaterialCardPage',
  components: {
    FilePreview,
    FileUpload
  },
  data() {
    return {
      loading: false,
      localSelectedSeriesType: '',
      localSeriesSearchKeyword: '',
      currentPage: 1,
      pageSize: 12,
      // 数据列表
      materials: [],
      materialsTotal: 0, // 后端返回的总数
      seriesTypeOptions: [
        { label: '书', value: '书' },
        { label: '试卷', value: '试卷' },
        { label: '视频', value: '视频' }
      ],
      // 科目相关
      isAdmin: false,
      teacherSubjectName: '',
      selectedSubject: '',
      // 文件列表相关
      showFileListView: false, // 是否显示文件列表视图
      fileListLoading: false,
      fileList: [],
      fileListTotal: 0,
      fileListPageNum: 1,
      fileListPageSize: 10,
      currentSeriesId: null, // 当前选中的系列ID
      currentSeriesName: '', // 当前选中的系列名称
      // 预览相关
      previewVisible: false,
      currentPreviewFile: null,
      // 科目列表（用于显示科目名称）
      subjectList: [],
      // 科目选项（用于下拉框选择）
      subjectOptions: [],
      // 用户列表（用于显示上传人）
      userList: [],
      // 文件操作相关
      fileDialogVisible: false,
      fileDialogTitle: '添加文件',
      fileIds: [],
      fileForm: {
        fileId: null,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadTime: null,
        subjectName: null,
        grade: null,
        paperType: null,
        series: null // 添加系列字段
      },
      fileFormRules: {
        filePurpose: [
          { required: true, message: "文件用途不能为空", trigger: "blur" }
        ],
        userFname: [
          { required: true, message: "文件名不能为空", trigger: "blur" }
        ],
        filePath: [
          { required: true, message: "文件不能为空", trigger: "blur" }
        ],
        subjectName: [
          { required: true, message: "课程名不能为空", trigger: "change" }
        ],
        grade: [
          {
            validator: (rule, value, callback) => {
              if (!this.isAdmin && !value) {
                callback(new Error("年级不能为空"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ]
      },
      // 文件用途选项
      filePurposeOptions: [],
      // 年级选项
      gradeOptions: [
        { value: '初中', label: '初中' },
        { value: '高中', label: '高中' }
      ],
      // 章节选项
      chapterOptions: [],
      chapterProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true
      },
      // 新增/修改弹窗相关
      addDialogVisible: false,
      addLoading: false,
      isEditMode: false, // 是否为编辑模式
      editDialogTitle: '新增系列',
      addForm: {
        id: null,
        type: '',
        series: '',
        subjectName: ''
      },
      addFormRules: {
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        series: [
          { required: true, message: '请输入系列名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        subjectName: [
          { required: true, message: '请选择科目', trigger: 'change' }
        ]
      },
      // 节流定时器
      searchThrottleTimer: null
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.searchThrottleTimer) {
      clearTimeout(this.searchThrottleTimer)
      this.searchThrottleTimer = null
    }
  },
  created() {
    // 加载科目列表
    this.loadSubjectList()
    // 加载用户列表
    this.loadUserList()
    // 加载章节列表
    this.loadChapterList()
    // 加载文件用途列表
    this.loadFilePurposeList()
    // 先加载教师信息，然后加载数据
    this.loadTeacherInfo().then(() => {
      // 无论是否管理员，都加载数据（未选择科目时显示所有系列文件）
      this.loadData()
    })
  },
  computed: {
    // 判断是否显示 paperType 下拉框
    showPaperType() {
      const purpose = this.fileForm.filePurpose
      return purpose === '教辅材料' || purpose === '自定义作业' || purpose === '自定义试卷'
    },
    // 过滤后的材料列表（后端已分页，这里只做前端筛选，如果有的话）
    filteredMaterials() {
      if (!this.materials || this.materials.length === 0) {
        return []
      }
      // 后端已经分页和过滤，直接返回
      return this.materials
    },
    // 当前页显示的材料列表（后端已分页，直接返回）
    paginatedMaterials() {
      return this.filteredMaterials
    }
  },
  watch: {
    // 监听总数变化，如果当前页超出范围，重置到第一页
    materialsTotal() {
      const totalPages = Math.ceil(this.materialsTotal / this.pageSize)
      if (this.currentPage > totalPages && totalPages > 0) {
        this.currentPage = 1
        this.loadData()
      }
    }
  },
  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const queryParams = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }

        // 如果有筛选条件，添加到查询参数
        if (this.localSelectedSeriesType) {
          queryParams.type = this.localSelectedSeriesType
        }
        if (this.localSeriesSearchKeyword) {
          queryParams.series = this.localSeriesSearchKeyword
        }
        // 如果选择了科目，传递科目参数（包括"综合"）；未选择科目时不传递
        if (this.selectedSubject) {
          queryParams.subjectName = this.selectedSubject
        }

        const res = await listSeries(queryParams)

        if (res && res.code === 200) {
          let rows = []
          let total = 0
          
          if (res.rows && Array.isArray(res.rows)) {
            rows = res.rows
            total = res.total || 0
          } else if (res.data && res.data.rows && Array.isArray(res.data.rows)) {
            rows = res.data.rows
            total = res.data.total || res.total || 0
          } else if (Array.isArray(res.data)) {
            rows = res.data
            total = res.total || res.data.length
          }
          
          this.materials = rows.map(item => ({
            id: item.id,
            year: item.year,
            subjectName: item.subjectName,
            series: item.series,
            type: item.type,
            grade: item.grade,
            contents: item.contents
          }))
          this.materialsTotal = total
        } else {
          console.error('获取数据失败:', res)
          this.materials = []
          this.materialsTotal = 0
          if (res && res.msg) {
            this.$message.error('获取数据失败：' + res.msg)
          }
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败：' + (error.message || '网络错误'))
        this.materials = []
        this.materialsTotal = 0
      } finally {
        this.loading = false
      }
    },
    // 加载教师信息
    loadTeacherInfo() {
      return getTeacherInfo().then(res => {
        if (res.code === 200 && res.data) {
          this.isAdmin = this.checkIsAdmin()

          // 根据 getTeacherInfo 返回的数据拼接老师学科
          // 数据格式：{ grade: "高中", roleName: "老师", subjectNames: "数学" }
          if (res.data.grade && res.data.subjectNames) {
            this.teacherSubjectName = res.data.grade + res.data.subjectNames
          } else if (res.data.gradeAndSubject) {
            // 兼容旧的字段名
            this.teacherSubjectName = res.data.gradeAndSubject
          }
        } else {
          console.error('获取教师信息失败:', res)
        }
      }).catch(error => {
        console.error('获取教师信息失败:', error)
      })
    },
    // 检查是否为管理员
    checkIsAdmin() {
      const roles = this.$store.getters.roles || []
      return roles.includes('admin') || roles.includes('administrator')
    },
    // 处理科目变化
    handleSubjectChange(subject) {
      this.selectedSubject = subject
      this.currentPage = 1 // 重置到第一页
      this.loadData()
    },
    // 处理系列类型变化
    handleSeriesTypeChange(seriesType) {
      this.currentPage = 1 // 重置到第一页
      this.loadData()
    },
    // 处理系列搜索（节流版本）
    handleSeriesSearchThrottled() {
      // 清除之前的定时器
      if (this.searchThrottleTimer) {
        clearTimeout(this.searchThrottleTimer)
      }
      // 设置新的定时器，500ms后执行搜索
      this.searchThrottleTimer = setTimeout(() => {
        this.handleSeriesSearch()
      }, 800)
    },
    // 处理系列搜索
    handleSeriesSearch() {
      this.currentPage = 1 // 重置到第一页
      this.loadData()
    },
    // 处理查看（点击卡片）
    async handleView(material) {
      if (!material || !material.id) {
        this.$message.warning('系列信息不完整')
        return
      }

      this.currentSeriesId = material.id
      this.currentSeriesName = material.series || material.label || '未命名系列'
      this.fileListPageNum = 1
      this.showFileListView = true
      await this.loadFileList()
    },
    // 返回卡片视图
    handleBackToCardView() {
      this.showFileListView = false
      this.currentSeriesId = null
      this.currentSeriesName = ''
      this.fileList = []
      this.fileListTotal = 0
      this.fileListPageNum = 1
    },
    // 加载文件列表
    async loadFileList() {
      if (!this.currentSeriesId) {
        return
      }

      this.fileListLoading = true
      try {
        const params = {
          pageNum: this.fileListPageNum,
          pageSize: this.fileListPageSize,
          series: this.currentSeriesId
        }

        const res = await getFileBySeries(params)

        if (res && res.code === 200) {
          if (res.rows && Array.isArray(res.rows)) {
            this.fileList = res.rows
            this.fileListTotal = res.total || res.rows.length
          } else if (res.data && res.data.rows && Array.isArray(res.data.rows)) {
            this.fileList = res.data.rows
            this.fileListTotal = res.data.total || res.data.rows.length
          } else if (Array.isArray(res.data)) {
            this.fileList = res.data
            this.fileListTotal = res.total || res.data.length
          } else {
            this.fileList = []
            this.fileListTotal = 0
          }
        } else if (res && res.total !== undefined && res.rows !== undefined) {
          // 兼容直接返回 { total, rows } 的格式
          this.fileList = Array.isArray(res.rows) ? res.rows : []
          this.fileListTotal = res.total || 0
        } else {
          console.error('获取文件列表失败:', res)
          this.fileList = []
          this.fileListTotal = 0
          if (res && res.msg) {
            this.$message.error('获取文件列表失败：' + res.msg)
          }
        }
      } catch (error) {
        console.error('获取文件列表失败:', error)
        this.$message.error('获取文件列表失败：' + (error.message || '网络错误'))
        this.fileList = []
        this.fileListTotal = 0
      } finally {
        this.fileListLoading = false
      }
    },
    // 处理文件列表分页大小变化
    handleFileListSizeChange(val) {
      this.fileListPageSize = val
      this.fileListPageNum = 1
      this.loadFileList()
    },
    // 处理文件列表当前页变化
    handleFileListCurrentChange(val) {
      this.fileListPageNum = val
      this.loadFileList()
    },
    // 加载科目列表
    loadSubjectList() {
      // 使用 system/subject/list 接口获取用户科目列表
      listSubject().then(response => {
        if (response.code === 200) {
          const options = response.rows || response.data || []
          const subjectList = Array.isArray(options) ? options : []
          this.subjectList = subjectList
          // 添加"综合"选项到最前面
          this.subjectOptions = [
            { subjectCode: '综合', subjectName: '综合' },
            ...subjectList
          ]
        } else {
          this.$message.error('获取课程列表失败：' + response.msg)
          this.subjectList = []
          // 即使接口失败，也保留"综合"选项
          this.subjectOptions = [{ subjectCode: '综合', subjectName: '综合' }]
        }
      }).catch(error => {
        console.error('获取课程列表失败:', error)
        // 如果接口失败，尝试使用旧的接口作为后备
        sysSubjectList().then(response => {
          if (response.code === 200) {
            this.subjectList = response.data || []
            // 添加"综合"选项到最前面
            this.subjectOptions = [
              { subjectCode: '综合', subjectName: '综合' },
              ...(response.data || [])
            ]
          } else {
            this.subjectList = []
            // 即使接口失败，也保留"综合"选项
            this.subjectOptions = [{ subjectCode: '综合', subjectName: '综合' }]
          }
        }).catch(err => {
          this.$message.error('获取课程列表失败：' + (err.message || error.message))
          this.subjectList = []
          // 即使接口失败，也保留"综合"选项
          this.subjectOptions = [{ subjectCode: '综合', subjectName: '综合' }]
        })
      })
    },
    // 获取科目显示名称
    getSubjectDisplay(subjectCode) {
      if (!subjectCode) return '-'
      const subject = this.subjectList.find(item => item.subjectCode === subjectCode)
      return subject ? subject.subjectName : subjectCode
    },
    // 获取文件类型图标
    getFileTypeIcon(fileType) {
      if (!fileType) return 'el-icon-document'

      const type = fileType.toLowerCase().trim()

      // 图片文件
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].some(t => type.includes(t))) {
        return 'el-icon-picture'
      }

      // 文档文件
      if (['doc', 'docx', 'pdf', 'txt', 'rtf'].some(t => type.includes(t))) {
        return 'el-icon-document'
      }

      // 表格文件
      if (['xls', 'xlsx', 'csv'].some(t => type.includes(t))) {
        return 'el-icon-s-grid'
      }

      // 演示文件
      if (['ppt', 'pptx', 'pptm', 'potx', 'potm'].some(t => type.includes(t))) {
        return 'el-icon-reading'
      }

      // 视频文件
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].some(t => type.includes(t))) {
        return 'el-icon-video-camera'
      }

      // 音频文件
      if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].some(t => type.includes(t))) {
        return 'el-icon-microphone'
      }

      // 压缩文件
      if (['zip', 'rar', '7z', 'tar', 'gz'].some(t => type.includes(t))) {
        return 'el-icon-folder'
      }

      // 代码文件
      if (['js', 'html', 'css', 'xml', 'json', 'py', 'java', 'cpp', 'c'].some(t => type.includes(t))) {
        return 'el-icon-cpu'
      }

      // 默认图标
      return 'el-icon-document'
    },
    // 获取文件用途图标
    getFilePurposeIcon(filePurpose) {
      if (!filePurpose) return 'el-icon-document'

      const purpose = filePurpose.toLowerCase()

      // 教案
      if (purpose.includes('教案')) {
        return 'el-icon-edit-outline'
      }

      // 课件
      if (purpose.includes('课件')) {
        return 'el-icon-reading'
      }

      // 思维导图
      if (purpose.includes('思维导图')) {
        return 'el-icon-share'
      }

      // 教学视频
      if (purpose.includes('视频')) {
        return 'el-icon-video-camera'
      }

      // 作业
      if (purpose.includes('作业')) {
        return 'el-icon-notebook-2'
      }

      // 教学音频
      if (purpose.includes('音频')) {
        return 'el-icon-headphones'
      }

      // 学案
      if (purpose.includes('学案')) {
        return 'el-icon-reading'
      }

      // 教辅材料
      if (purpose.includes('教辅材料')) {
        return 'el-icon-document'
      }

      // 自定义作业
      if (purpose.includes('自定义作业')) {
        return 'el-icon-edit'
      }

      // 自定义组卷
      if (purpose.includes('自定义组卷')) {
        return 'el-icon-document-copy'
      }

      // 默认图标
      return 'el-icon-document'
    },
    // 处理文件预览
    handlePreview(row) {
      this.currentPreviewFile = row
      this.previewVisible = true
    },
    // 处理预览关闭
    handlePreviewClose() {
      this.previewVisible = false
      this.currentPreviewFile = null
    },
    // 加载用户列表
    loadUserList() {
      sysUserList().then(response => {
        if (response.code === 200) {
          this.userList = response.data || []
        } else {
          this.$message.error('获取用户列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取用户列表失败：' + error.message)
      })
    },
    // 获取用户名称
    getUserName(userId) {
      if (!userId) return '-'
      const user = this.userList.find(u => u.userId === userId)
      return user ? user.nickName : `未知用户(${userId})`
    },
    // 加载章节列表
    loadChapterList() {
      sysGetchaptermap().then(response => {
        if (response.code === 200) {
          // 新的数据格式：{ data: { label: [...], treeData: [...] } }
          if (response.data && response.data.treeData) {
            // 使用 treeData 作为章节选项
            if (Array.isArray(response.data.treeData)) {
              this.chapterOptions = response.data.treeData;
            } else {
              this.chapterOptions = [];
              console.warn('treeData 不是数组，已初始化为空数组');
            }
          } else if (Array.isArray(response.data)) {
            // 兼容旧的数据格式：直接返回数组
            this.chapterOptions = response.data;
          } else {
            this.chapterOptions = [];
            console.warn('章节列表数据格式不正确，已初始化为空数组');
          }
        } else {
          this.$message.error('获取章节列表失败：' + response.msg);
          this.chapterOptions = [];
        }
      }).catch(error => {
        this.$message.error('获取章节列表失败：' + error.message);
        this.chapterOptions = [];
      });
    },
    // 加载文件用途列表
    async loadFilePurposeList() {
      try {
        const response = await selectFilePurpose();
        if (response.code === 200 && response.data && Array.isArray(response.data)) {
          const uniquePurposes = [...new Set(response.data.map(item => item.trim().replace(/\r\n/g, '').replace(/\n/g, '')))].filter(item => item);
          this.filePurposeOptions = uniquePurposes;
        } else {
          console.error('获取文件用途列表失败:', response.msg);
          this.filePurposeOptions = ['教案', '课件', '作业', '听力', '教学视频', '学案', '教辅材料', '自定义作业', '自定义试卷'];
        }
      } catch (error) {
        console.error('获取文件用途列表失败:', error);
        this.filePurposeOptions = ['教案', '课件', '作业', '听力', '教学视频', '学案', '教辅材料', '自定义作业', '自定义试卷'];
      }
    },
    // 获取当前用户的学科（显示用，返回中文名称）
    getCurrentUserSubject() {
      if (this.teacherSubjectName) {
        return this.teacherSubjectName;
      }
      const userSubject = this.$store.getters.subject || this.$store.getters.deptSubject || 'MATH';
      return this.convertCodeToSubject(userSubject);
    },
    // 将英文学科代码转换为中文名称
    convertCodeToSubject(subjectCode) {
      const subjectMap = {
        "physics": "物理",
        "math": "数学",
        "chemistry": "化学",
        "biology": "生物",
        "science": "科学",
        "chinese": "语文",
        "english": "英语",
        "tech": "信息",
        "common": "通用",
        "history": "历史",
        "politics": "政治",
        "geography": "地理",
        "python": "Python编程"
      };
      return subjectMap[subjectCode] || subjectCode;
    },
    // 将中文学科名转换为英文代码
    convertSubjectToCode(subjectName) {
      const subjectMap = {
        "物理": "physics",
        "数学": "math",
        "化学": "chemistry",
        "生物": "biology",
        "科学": "science",
        "语文": "chinese",
        "英语": "english",
        "信息": "tech",
        "通用": "common",
        "历史": "history",
        "政治": "politics",
        "地理": "geography",
        "python": "python"
      };
      return subjectMap[subjectName] || 'MATH';
    },
    // 获取用户年级信息
    getUserGrade() {
      const grade = this.$store.getters.grade
      if (grade) {
        return grade
      }
      const teacherInfo = this.$store.getters.teacherInfo
      if (teacherInfo && teacherInfo.grade) {
        return teacherInfo.grade
      }
      return null
    },
    // 处理文件选择变化
    handleFileSelectionChange(selection) {
      this.fileIds = selection.map(item => item.fileId)
    },
    // 处理文件新增
    handleFileAdd() {
      this.resetFileForm()
      this.fileDialogTitle = "添加文件"
      this.fileDialogVisible = true
    },
    // 处理文件修改
    handleFileUpdate(row) {
      this.resetFileForm()
      const fileId = row ? row.fileId : this.fileIds[0]
      if (!fileId) {
        this.$message.warning('请选择要修改的文件')
        return
      }

      getKnowledge(fileId).then(response => {
        this.fileForm = { ...response.data }

        if (this.fileForm.uploadTime) {
          if (typeof this.fileForm.uploadTime === 'number') {
            this.fileForm.uploadTime = new Date(this.fileForm.uploadTime).toISOString().split('T')[0];
          }
        }

        if (this.fileForm.subjectName) {
          // 如果后端返回的是英文代码，尝试从 subjectOptions 中查找对应的中文名称
          const subject = this.subjectOptions.find(s => s.subjectCode === this.fileForm.subjectName)
          if (subject) {
            this.fileForm.subjectName = subject.subjectName
          } else {
            // 如果找不到，使用旧的转换方法作为后备
            this.fileForm.subjectName = this.convertCodeToSubject(this.fileForm.subjectName)
          }
        }

        if (!this.fileForm.grade) {
          this.fileForm.grade = this.getUserGrade() || null;
        }

        if (this.fileForm.knowledge && typeof this.fileForm.knowledge === 'string') {
          const labelArr = this.fileForm.knowledge.split('/').filter(Boolean);
          this.fileForm.knowledge = this.findValuePathByLabels(this.chapterOptions, labelArr);
        } else if (!this.fileForm.knowledge) {
          this.fileForm.knowledge = [];
        }

        this.fileForm.series = this.currentSeriesId

        this.fileDialogTitle = "修改文件"
        this.fileDialogVisible = true
      }).catch(error => {
        console.error('获取文件信息失败:', error)
        this.$message.error('获取文件信息失败：' + (error.message || '网络错误'))
      })
    },
    // 根据label数组查找value数组
    findValuePathByLabels(options, labels) {
      let path = [];
      let currentOptions = options;

      for (let label of labels) {
        const node = currentOptions.find(opt => opt.label === label);
        if (!node) {
          console.warn('找不到匹配的章节节点:', label);
          return [];
        }
        path.push(node.value);
        currentOptions = node.children || [];
      }

      return path;
    },
    // 处理文件删除
    handleFileDelete(row) {
      const fileIds = row ? row.fileId : this.fileIds
      if (!fileIds || (Array.isArray(fileIds) && fileIds.length === 0)) {
        this.$message.warning('请选择要删除的文件')
        return
      }

      const fileIdStr = Array.isArray(fileIds) ? fileIds.join(',') : fileIds
      this.$confirm('是否确认删除文件编号为"' + fileIdStr + '"的数据项？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return delKnowledge(fileIdStr)
      }).then(response => {
        if (response.code === 200) {
          this.$message.success("删除成功");
          this.loadFileList();
        } else {
          this.$message.error("删除失败：" + (response.msg || "未知错误"));
        }
      }).catch(error => {
        if (error !== 'cancel') {
          console.error("删除文件失败:", error);
          this.$message.error("删除失败：" + (error.message || "网络错误"));
        }
      });
    },
    // 重置文件表单
    resetFileForm() {
      this.fileForm = {
        fileId: null,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadTime: null,
        subjectName: null, // 统一不设置默认值，让用户从下拉框选择
        grade: this.isAdmin ? null : (this.getUserGrade() || null),
        paperType: null,
        series: this.currentSeriesId
      }
      this.$nextTick(() => {
        if (this.$refs.fileForm) {
          this.$refs.fileForm.clearValidate()
        }
      })
    },
    // 取消文件表单
    cancelFileForm() {
      this.fileDialogVisible = false
      this.resetFileForm()
    },
    // 提交文件表单
    submitFileForm() {
      this.$refs.fileForm.validate(valid => {
        if (valid) {
          let formData = Object.assign({}, this.fileForm);
          if (formData.knowledge && Array.isArray(formData.knowledge)) {
            formData.knowledge = formData.knowledge[formData.knowledge.length - 1];
          }

          // subjectName 直接传递选择的科目名（中文名称），不需要转换为英文代码
          // if (formData.subjectName) {
          //   formData.subjectName = this.convertSubjectToCode(formData.subjectName);
          // }

          formData.series = this.currentSeriesId

          if (this.fileForm.fileId != null) {
            const originalData = this.fileList.find(item => item.fileId === this.fileForm.fileId)
            if (originalData) {
              formData.uploadUserId = originalData.uploadUserId
            }
            if (!formData.uploadTime) {
              formData.uploadTime = new Date().toISOString().split('T')[0];
            }
            updateKnowledge(formData).then(response => {
              if (response.code === 200) {
                this.$message.success("修改成功");
                this.fileDialogVisible = false;
                this.loadFileList();
              } else {
                this.$message.error("修改失败：" + (response.msg || "未知错误"));
              }
            }).catch(error => {
              console.error("修改文件失败:", error);
              this.$message.error("修改失败：" + (error.message || "网络错误"));
            });
          } else {
            formData.uploadUserId = this.$store.getters.userId || 1;
            formData.uploadTime = new Date().toISOString().split('T')[0];
            formData.series = this.currentSeriesId
            addKnowledge(formData).then(response => {
              if (response.code === 200) {
                this.$message.success("新增成功");
                this.fileDialogVisible = false;
                this.loadFileList();
              } else {
                this.$message.error("新增失败：" + (response.msg || "未知错误"));
              }
            }).catch(error => {
              console.error("新增文件失败:", error);
              this.$message.error("新增失败：" + (error.message || "网络错误"));
            });
          }
        }
      })
    },
    // 获取类型样式类
    getTypeClass(type) {
      const typeMap = {
        '书': 'type-book',
        '试卷': 'type-paper',
        '视频': 'type-video'
      }
      return typeMap[type] || 'type-default'
    },
    // 获取类型文本
    getTypeText(type) {
      return type || '未知'
    },
    // 获取材料详细信息（年级、册数等）
    getMaterialDetails(material) {
      const details = []

      // 从 series 中尝试提取册数信息（优先）
      if (material.series) {
        // 匹配各种册数格式：第一册、第1册、第一册、必修第一册等
        const volumePatterns = [
          /(第[一二三四五六七八九十\d]+册)/,
          /(必修\s*第?[一二三四五六七八九十\d]+册)/,
          /(选修\s*第?[一二三四五六七八九十\d]+册)/,
          /([上下]册)/,
          /(第[一二三四五六七八九十\d]+卷)/
        ]

        for (const pattern of volumePatterns) {
          const match = material.series.match(pattern)
          if (match && match[1]) {
            const volume = match[1].trim()
            if (!details.includes(volume)) {
              details.push(volume)
              break // 找到第一个匹配就停止
            }
          }
        }
      }

      // 如果从 series 没找到，从 contents 中解析
      if (details.length === 0 && material.contents) {
        try {
          let contents = material.contents
          if (typeof contents === 'string') {
            contents = JSON.parse(contents)
          }

          if (Array.isArray(contents) && contents.length > 0) {
            const firstItem = contents[0]
            if (firstItem && firstItem.title) {
              const titleMatch = firstItem.title.match(/(第[一二三四五六七八九十\d]+册|必修\s*第?[一二三四五六七八九十\d]+册?|选修\s*第?[一二三四五六七八九十\d]+册?)/)
              if (titleMatch && titleMatch[1]) {
                details.push(titleMatch[1].trim())
              }
            }
          }
        } catch (e) {
          // 解析失败，忽略
        }
      }

      // 如果还是没有，尝试从 grade 字段获取年级信息
      if (details.length === 0 && material.grade) {
        details.push(material.grade)
      }

      return details.length > 0 ? `(${details[0]})` : ''
    },
    // 获取出版社/版本信息
    getPublisher(material) {
      // 尝试从 series 中提取出版社信息
      if (material.series) {
        // 匹配如：人教版(2019)、人教版（2019）等
        const publisherMatch = material.series.match(/([^（(]+)(\(|（)(\d{4})(\)|）)/)
        if (publisherMatch && publisherMatch[1]) {
          const publisher = publisherMatch[1].trim()
          const year = publisherMatch[3]
          // 过滤掉常见的非出版社词汇
          if (!['年', '册', '必修', '选修'].includes(publisher) && publisher.length > 0) {
            return `${publisher}(${year})`
          }
        }

        // 如果没有匹配到年份，尝试只匹配出版社名称
        const simpleMatch = material.series.match(/(人教版|苏教版|北师大版|浙教版|沪教版|鲁教版|冀教版|湘教版|外研版|译林版)/)
        if (simpleMatch) {
          return simpleMatch[1]
        }
      }

      // 如果没有匹配到，返回空
      return ''
    },
    // 处理每页数量变化
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1 // 重置到第一页
      this.loadData() // 重新加载数据
    },
    // 处理当前页变化
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData() // 重新加载数据
      // 滚动到顶部
      this.$nextTick(() => {
        const gridElement = this.$el.querySelector('.material-cards-grid')
        if (gridElement) {
          gridElement.scrollTop = 0
        }
      })
    },
    // 打开新增弹窗
    handleAdd() {
      this.isEditMode = false
      this.editDialogTitle = '新增系列'
      // 默认选择科目列表第一位
      const defaultSubject = this.subjectOptions && this.subjectOptions.length > 0
        ? this.subjectOptions[0].subjectName
        : ''
      this.addForm = {
        id: null,
        type: '',
        series: '',
        subjectName: defaultSubject
      }
      this.addDialogVisible = true
      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.addForm) {
          this.$refs.addForm.clearValidate()
        }
      })
    },
    // 处理修改
    async handleEdit(material) {
      if (!material || !material.id) {
        this.$message.warning('系列信息不完整')
        return
      }

      this.isEditMode = true
      this.editDialogTitle = '修改系列'
      this.addLoading = true
      this.addDialogVisible = true

      try {
        // 获取系列详情
        const res = await getSeries(material.id)
        if (res && res.code === 200 && res.data) {
          // 如果后端返回的是英文代码，尝试从 subjectOptions 中查找对应的中文名称
          let subjectName = res.data.subjectName || ''
          if (subjectName) {
            const subject = this.subjectOptions.find(s => s.subjectCode === subjectName)
            if (subject) {
              subjectName = subject.subjectName
            }
          } else if (this.subjectOptions && this.subjectOptions.length > 0) {
            // 如果科目为空，默认选择第一位
            subjectName = this.subjectOptions[0].subjectName
          }

          this.addForm = {
            id: res.data.id,
            type: res.data.type || '',
            series: res.data.series || '',
            subjectName: subjectName
          }
        } else {
          this.$message.error('获取系列信息失败：' + (res.msg || '未知错误'))
          this.addDialogVisible = false
        }
      } catch (error) {
        console.error('获取系列信息失败:', error)
        this.$message.error('获取系列信息失败：' + (error.message || '网络错误'))
        this.addDialogVisible = false
      } finally {
        this.addLoading = false
        // 清除表单验证
        this.$nextTick(() => {
          if (this.$refs.addForm) {
            this.$refs.addForm.clearValidate()
          }
        })
      }
    },
    // 处理删除
    handleDelete(material) {
      if (!material || !material.id) {
        this.$message.warning('系列信息不完整')
        return
      }

      this.$confirm('确认删除该系列吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await delSeries(material.id)
          if (res && res.code === 200) {
            this.$message.success('删除成功')
            // 重新加载数据
            await this.loadData()
          } else {
            this.$message.error('删除失败：' + (res.msg || '未知错误'))
          }
        } catch (error) {
          console.error('删除系列失败:', error)
          this.$message.error('删除失败：' + (error.message || '网络错误'))
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    // 提交新增/修改
    handleSubmitAdd() {
      this.$refs.addForm.validate(async (valid) => {
        if (!valid) {
          return false
        }

        // 验证科目不能为空
        if (!this.addForm.subjectName) {
          this.$message.error('请选择科目')
          return false
        }

        this.addLoading = true
        try {
          const submitData = {
            type: this.addForm.type,
            series: this.addForm.series,
            subjectName: this.addForm.subjectName
          }

          let res
          if (this.isEditMode) {
            // 修改模式，需要传递 id
            submitData.id = this.addForm.id
            res = await updateSeries(submitData)
            if (res && res.code === 200) {
              this.$message.success('修改成功')
              this.addDialogVisible = false
              await this.loadData()
            } else {
              this.$message.error('修改失败：' + (res.msg || '未知错误'))
            }
          } else {
            // 新增模式
            res = await addSeries(submitData)
            if (res && res.code === 200) {
              this.$message.success('新增成功')
              this.addDialogVisible = false
              await this.loadData()
            } else {
              this.$message.error('新增失败：' + (res.msg || '未知错误'))
            }
          }
        } catch (error) {
          console.error(this.isEditMode ? '修改失败:' : '新增失败:', error)
          this.$message.error((this.isEditMode ? '修改' : '新增') + '失败：' + (error.message || '网络错误'))
        } finally {
          this.addLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.material-filter-bar {
  padding: 15px 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
}

.subject-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.teacher-subject-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-hint {
  font-size: 12px;
  color: #909399;
}

.no-subject-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
}

.no-subject-hint i {
  font-size: 16px;
}

.series-type-select {
  width: 150px;
}

.year-select {
  width: 130px;
}

.series-search-input {
  flex: 1;
  max-width: 300px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.loading-container i,
.empty-container i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

.loading-container i {
  animation: rotate 1s linear infinite;
}

.loading-container p,
.empty-container p {
  margin: 8px 0;
  font-size: 14px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.material-content-wrapper {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.material-cards-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  align-content: start;
  min-height: 500px;
}

@media (max-width: 1600px) {
  .material-cards-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1200px) {
  .material-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .material-cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .material-cards-grid {
    grid-template-columns: 1fr;
  }
}

.material-pagination {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.material-card {
  position: relative;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  aspect-ratio: 3 / 4;
  height: 280px;
}

.material-card:hover {
  border-color: #409eff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
  transform: translateY(-4px);
}

/* 书籍封面样式 */
.book-cover {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.book-cover:hover .card-actions {
  opacity: 1;
  visibility: visible;
}

/* 悬浮操作按钮 */
.card-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  font-size: 16px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.view-btn:hover {
  background-color: #409EFF;
  border-color: #409EFF;
}

.edit-btn:hover {
  background-color: #E6A23C;
  border-color: #E6A23C;
}

.delete-btn:hover {
  background-color: #F56C6C;
  border-color: #F56C6C;
}

.book-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  z-index: 0;
  pointer-events: none;
}

/* 类型标签 */
.card-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  z-index: 3;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  white-space: nowrap;
}

.type-book {
  background: #409eff;
}

.type-paper {
  background: #67c23a;
}

.type-video {
  background: #e6a23c;
}

.type-default {
  background: #909399;
}

/* 年份和学科 */
.book-year-subject {
  position: relative;
  padding: 15px 14px 0 30px;
  font-size: 12px;
  color: #303133;
  font-weight: 600;
  z-index: 2;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  line-height: 1.3;
}

.book-year-subject span {
  margin: 0 1px;
}

/* 系列名称（标题）- 居中显示 */
.book-title {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 28px);
  padding: 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  line-height: 1.6;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  z-index: 2;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  word-break: break-word;
}

/* 详细信息（册数等，显示在底部） */
.book-details {
  position: relative;
  padding: 0 14px 8px 14px;
  font-size: 12px;
  color: #606266;
  line-height: 1.3;
  z-index: 2;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-top: auto;
}

/* 出版社/版本（如果有，显示在详细信息下方） */
.book-publisher {
  position: relative;
  padding: 0 14px 10px 14px;
  font-size: 11px;
  color: #909399;
  z-index: 2;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
}

/* 滚动条样式 */
.material-cards-grid::-webkit-scrollbar {
  width: 6px;
}

.material-cards-grid::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.material-cards-grid::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 文件列表视图样式 */
.file-list-view {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
}

.file-list-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
  justify-content: space-between;
}

.file-list-title {
  margin-left: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.file-list-card {
  margin-top: 0;
}

.file-list-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 文件类型和用途单元格样式 */
.file-type-cell,
.file-purpose-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.file-type-icon,
.file-purpose-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.file-type-text,
.file-purpose-text {
  font-size: 12px;
  color: #606266;
}

/* 预览按钮样式 */
.preview-btn {
  color: #409EFF !important;
}

.preview-btn:hover {
  color: #66b1ff !important;
}
</style>

