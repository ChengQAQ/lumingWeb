<template>
  <div class="app-container">
    <div class="page-header">
      <h2>发展中心</h2>
      <p class="page-description">管理教师专业发展相关的资源文件</p>
    </div>

    <!-- 分类统计卡片 - 移到列表上方 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4">
        <el-card class="stats-card" shadow="hover" @click.native="filterByCategory('')" :class="{ active: !categoryFilter }">
          <div class="stats-content">
            <div class="stats-icon all">
              <i class="el-icon-folder"></i>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalCount }}</div>
              <div class="stats-label">全部</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stats-card" shadow="hover" @click.native="filterByCategory('课题研究')" :class="{ active: categoryFilter === '课题研究' }">
          <div class="stats-content">
            <div class="stats-icon research">
              <i class="el-icon-reading"></i>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.researchCount }}</div>
              <div class="stats-label">课题研究</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stats-card" shadow="hover" @click.native="filterByCategory('学术论文')" :class="{ active: categoryFilter === '学术论文' }">
          <div class="stats-content">
            <div class="stats-icon paper">
              <i class="el-icon-notebook-1"></i>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.paperCount }}</div>
              <div class="stats-label">学术论文</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stats-card" shadow="hover" @click.native="filterByCategory('教学能力竞赛')" :class="{ active: categoryFilter === '教学能力竞赛' }">
          <div class="stats-content">
            <div class="stats-icon competition">
              <i class="el-icon-collection"></i>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.competitionCount }}</div>
              <div class="stats-label">教学能力竞赛</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stats-card" shadow="hover" @click.native="filterByCategory('命题研究资料')" :class="{ active: categoryFilter === '命题研究资料' }">
          <div class="stats-content">
            <div class="stats-icon exam">
              <i class="el-icon-monitor"></i>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.examCount }}</div>
              <div class="stats-label">命题研究资料</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >上传文件</el-button>
          </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
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
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleDownload"
        >下载</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-share"
          size="mini"
          :disabled="multiple"
          @click="handleShare"
        >分享文件</el-button>
          </el-col> -->
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getFileList"></right-toolbar>
        </el-row>

    <!-- 文件列表 -->
    <el-card class="list-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>资源列表</span>
        <div class="header-actions">
          <el-select v-model="categoryFilter" placeholder="选择分类" style="width: 150px; margin-right: 10px" clearable @change="handleCategoryFilter">
            <el-option label="全部" value=""></el-option>
            <el-option label="课题研究" value="课题研究"></el-option>
            <el-option label="学术论文" value="学术论文"></el-option>
            <el-option label="教学能力竞赛" value="教学能力竞赛"></el-option>
            <el-option label="命题研究资料" value="命题研究资料"></el-option>
          </el-select>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文件名"
            style="width: 200px; margin-right: 10px"
            clearable
            @keyup.enter.native="handleSearch"
          >
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
          <el-button type="primary" icon="el-icon-refresh" @click="getFileList">刷新</el-button>
        </div>
      </div>

      <file-list
        :file-list-data="fileListData"
        :loading="loading"
        :total="total"
        :query-params="queryParams"
        :subject-list="subjectList"
        @selection-change="handleSelectionChange"
        @pagination="handlePagination"
        @preview="handlePreview"
        @update="handleUpdate"
        @refresh="getFileList"
      />
    </el-card>

    <!-- 文件上传和预览组件 -->
    <file-upload-preview
      ref="fileUploadPreview"
      :default-file-purpose="'课题研究'"
      :group-label="'发展组'"
      :subject-list="subjectList"
      :group-list="[]"
      :show-subject-select="true"
      :show-group-select="false"
      :default-subject-code="userSubject"
      @refresh="getFileList"
    />

    <!-- 分享文件对话框 -->
    <file-share-dialog
      :visible.sync="shareVisible"
      :selected-files="selectedFiles"
      @remove-file="handleRemoveFile"
      @success="handleShareSuccess"
      @close="handleShareClose"
    />
  </div>
</template>

<script>
import { listKnowledge, addKnowledge, updateKnowledge, getKnowledge, delKnowledge, downloadFiles1, sysUserList, sysSubjectList, sysGetchaptermap, getPreviewPathPC } from "@/api/system/knowledge"
import { getTeacherInfo } from "@/api/system/teacher"
import { addLog } from "@/api/system/log.js"
import { parseTime } from "@/utils/ruoyi"
import FileUploadPreview from '@/components/FileUploadPreview'
import FileList from '@/components/FileList'
import FileShareDialog from '@/components/FileShareDialog'
import RightToolbar from '@/components/RightToolbar'

export default {
  name: "DevelopmentCenter",
  components: {
    FileUploadPreview,
    FileList,
    FileShareDialog,
    RightToolbar
  },
  data() {
    return {
      // 文件用途选项
      filePurposeOptions: ['课题研究', '学术论文', '教学能力竞赛', '命题研究资料'],
      
      // 弹窗相关
      title: "",
      open: false,
      form: {
        fileId: null,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadTime: null,
        subjectName: null
      },
      rules: {
        fileType: [
          { required: true, message: "文件类型不能为空", trigger: "change" }
        ],
        filePurpose: [
          { required: true, message: "文件用途不能为空", trigger: "blur" }
        ],
        userFname: [
          { required: true, message: "文件名不能为空", trigger: "blur" }
        ],
        filePath: [
          { required: true, message: "文件不能为空", trigger: "blur" }
        ],
        knowledge: [
          { required: false, message: "章节不能为空", trigger: "blur" }
        ],
        uploadTime: [
          { required: true, message: "上传时间不能为空", trigger: "change" }
        ]
      },

      // 课程列表
      subjectList: [],
      chapterOptions: [], // 存储sysGetchaptermap返回的多级选项
      // 配置级联选择器的属性
      chapterProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true
      },

      // 列表相关
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      fileListData: [],
      searchKeyword: '',
      categoryFilter: '',
      selectedFiles: [],

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadUserNick: "",
        uploadTime: null,
        subjectName: null
      },

      // 统计信息
      stats: {
        totalCount: 0,
        researchCount: 0,
        paperCount: 0,
        competitionCount: 0,
        examCount: 0
      },
      
      // 全部数据缓存
      allData: [],

      // 预览相关数据
      previewVisible: false,
      currentPreviewFile: null,
      previewUrl: '',
      textContent: '',
      docxLoading: false,
      previewRetryCount: 0,
      maxRetryCount: 2, // 减少重试次数
      docxKey: 0, // 用于强制重新渲染组件
      docxTimeoutId: null, // 用于存储超时检查的ID
      docxRenderError: false, // Word文档渲染错误状态

      // 用户学科信息
      userSubject: null,

      // 分享相关数据
      shareVisible: false,
      selectedFiles: []
    }
  },
  created() {
    this.loadUserList();
    this.loadSubjectList();
    this.loadChapterList();
    this.loadTeacherInfo(); // 获取老师学科信息
    this.getAllData();
  },
  computed: {
    // 判断是否为管理员
    isAdmin() {
      const roles = this.$store.getters.roles || []
      return roles.includes('admin')
    },
    // 判断是否为图片文件
    isImageFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      return imageTypes.some(type => 
        this.currentPreviewFile.fileType.toLowerCase().includes(type)
      )
    },
    // 判断是否为PDF文件
    isPdfFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      return this.currentPreviewFile.fileType.toLowerCase().includes('pdf')
    },
    // 判断是否为文本文件
    isTextFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      const textTypes = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js']
      return textTypes.some(type => 
        this.currentPreviewFile.fileType.toLowerCase().includes(type)
      )
    },
    // 判断是否为视频文件
    isVideoFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v']
      return videoTypes.some(type => 
        this.currentPreviewFile.fileType.toLowerCase().includes(type)
      )
    },
    // 判断是否为音频文件
    isAudioFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']
      return audioTypes.some(type => 
        this.currentPreviewFile.fileType.toLowerCase().includes(type)
      )
    },
    // 判断是否为Word文档
    isDocxFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      const docxTypes = ['docx', 'doc']
      return docxTypes.some(type => 
        this.currentPreviewFile.fileType.toLowerCase().includes(type)
      )
    },
    // 判断是否为Excel文件
    isXlsxFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      const xlsxTypes = ['xlsx', 'xls']
      return xlsxTypes.some(type => 
        this.currentPreviewFile.fileType.toLowerCase().includes(type)
      )
    },
    // 判断是否为PowerPoint文件
    isPptxFile() {
      if (!this.currentPreviewFile || !this.currentPreviewFile.fileType) return false
      const pptxTypes = ['pptx', 'ppt']
      return pptxTypes.some(type => 
        this.currentPreviewFile.fileType.toLowerCase().includes(type)
      )
    }
  },
  methods: {
    // 获取当前用户的学科（显示用，返回中文名称）
    getCurrentUserSubject() {
      // 如果有缓存的学科信息，直接返回中文名称
      if (this.userSubject) {
        return this.convertCodeToSubject(this.userSubject);
      }
      
      // 从用户信息中获取学科，如果没有则使用默认值
      const userSubject = this.$store.getters.subject || this.$store.getters.deptSubject || 'MATH';
      return this.convertCodeToSubject(userSubject);
    },
    
    // 获取老师信息并设置学科
    async loadTeacherInfo() {
      try {
        // 调用 getTeacherInfo API 获取老师信息
        const response = await getTeacherInfo();
        if (response.code === 200 && response.data) {
          const teacherData = response.data;
          if (teacherData.subjectNames) {
            // 将中文学科名转换为英文代码
            this.userSubject = this.convertSubjectToCode(teacherData.subjectNames);
          }
          
          // 存储年级信息到store中，方便后续使用
          if (teacherData.grade) {
            this.$store.dispatch('user/setGrade', teacherData.grade);
          }
          
        }
      } catch (error) {
        console.error('获取老师信息失败:', error);
        // 如果获取失败，使用默认值
        this.userSubject = 'MATH';
      }
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
      
      return subjectMap[subjectName] || 'MATH'; // 如果找不到映射，返回默认值
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
      
      return subjectMap[subjectCode] || subjectCode; // 如果找不到映射，返回原值
    },
    
    // 获取用户年级信息
    getUserGrade() {
      // 从store中获取年级信息
      const grade = this.$store.getters.grade
      if (grade) {
        return grade
      }
      
      // 如果store中没有，尝试从teacherInfo中获取
      const teacherInfo = this.$store.getters.teacherInfo
      if (teacherInfo && teacherInfo.grade) {
        return teacherInfo.grade
      }
      
      // 如果都没有，返回null
      return null
    },
    
    loadChapterList() {
      sysGetchaptermap().then(response => {
        if (response.code === 200) {
          this.chapterOptions = response.data || [];
        } else {
          this.$message.error('获取章节列表失败：' + response.msg);
        }
      }).catch(error => {
        this.$message.error('获取章节列表失败：' + error.message);
      });
    },

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

    // 加载课程列表
    loadSubjectList() {
      sysSubjectList().then(response => {
        if (response.code === 200) {
          this.subjectList = response.data || []
        } else {
          this.$message.error('获取课程列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取课程列表失败：' + error.message)
      })
    },

    getUserName(userId) {
      if (!userId) return '-'
      const user = this.userList.find(u => u.userId === userId)
      return user ? user.nickName : `未知用户(${userId})`
    },

    getSubjectDisplay(subjectCode) {
      if (!subjectCode) return '-'
      
      // 优先使用科目列表中的信息
      const subject = this.subjectList.find(item => item.subjectCode === subjectCode)
      if (subject) {
        return subject.subjectName;
      }
      
      // 如果科目列表中没有找到，使用我们的映射表
      return this.convertCodeToSubject(subjectCode);
    },

    // 点击分类卡片处理
    filterByCategory(category) {
      this.categoryFilter = category
      this.queryParams.category = category
      this.queryParams.pageNum = 1
      this.getFileList()
    },

    handleCategoryFilter(value) {
      this.queryParams.category = value
      this.queryParams.pageNum = 1
      this.getFileList()
    },

    handleSearch() {
      this.queryParams.keyword = this.searchKeyword
      this.queryParams.pageNum = 1
      this.getFileList()
    },

    handleAdd() {
      this.$refs.fileUploadPreview.openAddDialog()
    },

    handleUpdate(row) {
      let fileId
      if (row && row.fileId) {
        // 从表格行点击修改
        fileId = row.fileId
      } else if (this.ids && this.ids.length === 1) {
        // 从顶部按钮点击修改，使用选中的文件
        fileId = this.ids[0]
      } else {
        this.$message.warning('请选择要修改的文件')
            return
          }
          
      this.$refs.fileUploadPreview.openEditDialog(fileId)
    },

    // 新增方法：处理预览
    handlePreview(row) {
      this.$refs.fileUploadPreview.handlePreview(row)
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

    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let formData = Object.assign({}, this.form);
          if (formData.knowledge && Array.isArray(formData.knowledge)) {
            formData.knowledge = formData.knowledge[formData.knowledge.length - 1];
          }

          // 将中文科目名称转换为英文代码进行传参
          if (formData.subjectName) {
            formData.subjectName = this.convertSubjectToCode(formData.subjectName);
          }

          if (this.form.fileId != null) {
            const originalData = this.fileListData.find(item => item.fileId === this.form.fileId)
            if (originalData) {
              formData.uploadUserId = originalData.uploadUserId
            }
            // 确保修改时也有上传时间
            if (!formData.uploadTime) {
              formData.uploadTime = new Date().toISOString().split('T')[0];
            }
            updateKnowledge(formData).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getAllData();
              } else {
                this.$modal.msgError("修改失败：" + (response.msg || "未知错误"));
              }
            }).catch(error => {
              console.error("修改文件失败:", error);
              this.$modal.msgError("修改失败：" + (error.message || "网络错误"));
            });
          } else {
            // 新增文件时，上传用户默认为当前用户
          formData.uploadUserId = this.$store.getters.userId || 1;
          formData.uploadTime = new Date().toISOString().split('T')[0];
            // 课程名已经在 reset 中自动设置为当前用户学科
          addKnowledge(formData).then(response => {
            if (response.code === 200) {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                // 重置分页到第一页
                this.queryParams.pageNum = 1;
                // 重新获取数据
                this.getAllData();
            } else {
                this.$modal.msgError("新增失败：" + (response.msg || "未知错误"));
            }
          }).catch(error => {
              console.error("新增文件失败:", error);
              this.$modal.msgError("新增失败：" + (error.message || "网络错误"));
            });
          }
        }
      })
    },

    cancel() {
      this.open = false
      this.reset()
    },

    reset() {
      this.form = {
        fileId: null,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadTime: null,
        subjectName: this.getCurrentUserSubject()
      }
      this.resetForm("form")
    },

    // 获取全部数据用于统计
    getAllData() {
      this.loading = true
      // 获取所有数据，不分页
      const params = {
        pageNum: 1,
        pageSize: 10000, // 设置一个很大的数字来获取所有数据
        userFname: this.queryParams.keyword,
        filePurpose: this.queryParams.category
      }
      
      listKnowledge(params).then(response => {
        if (response.code === 200) {
          // 过滤只显示四种指定分类的文件
          const validCategories = ['课题研究', '学术论文', '教学能力竞赛', '命题研究资料']
          this.allData = (response.rows || []).filter(file => 
            file && validCategories.includes(file.filePurpose)
          )
          
          // 更新统计数据
          this.getStats()
          // 获取当前页数据
          this.getFileList()
        } else {
          this.$message.error('获取文件列表失败：' + response.msg)
          this.allData = []
          this.getStats()
          this.getFileList()
        }
        this.loading = false
      }).catch(error => {
        this.$message.error('获取文件列表失败：' + error.message)
        this.allData = []
        this.getStats()
        this.getFileList()
        this.loading = false
      })
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 分页处理
    handlePagination(pageData) {
      this.queryParams.pageNum = pageData.page;
      this.queryParams.pageSize = pageData.limit;
      this.getFileList();
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
      
      // 演示文件 - 确保PPTX文件正确识别
      if (['ppt', 'pptx', 'pptm', 'potx', 'potm'].some(t => type.includes(t))) {
        return 'el-icon-reading'
      }
      
      // 视频文件
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].some(t => type.includes(t))) {
        return 'el-icon-video-camera'
      }
      
      // 音频文件 - 确保MP3文件正确识别
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
      
      // 课题研究
      if (purpose.includes('课题研究')) {
        return 'el-icon-reading'
      }
      
      // 学术论文
      if (purpose.includes('学术论文')) {
        return 'el-icon-notebook-1'
      }
      
      // 教学能力竞赛
      if (purpose.includes('教学能力竞赛')) {
        return 'el-icon-collection'
      }
      
      // 命题研究资料
      if (purpose.includes('命题研究资料')) {
        return 'el-icon-monitor'
      }
      
      // 默认图标
      return 'el-icon-document'
    },

    // 列表相关方法
    getFileList() {
      this.loading = true
      // 从全部数据中筛选当前页数据
      let filteredData = []
      
      if (this.allData && Array.isArray(this.allData)) {
        filteredData = [...this.allData]
        
        // 根据分类筛选
        if (this.queryParams.category) {
          filteredData = filteredData.filter(file => file && file.filePurpose === this.queryParams.category)
        }
        
        // 根据关键词筛选
        if (this.queryParams.keyword) {
          filteredData = filteredData.filter(file => 
            file && file.userFname && file.userFname.toLowerCase().includes(this.queryParams.keyword.toLowerCase())
          )
        }
      }
      
      // 计算总数
      this.total = filteredData.length
      
      // 分页处理
      const startIndex = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      const endIndex = startIndex + this.queryParams.pageSize
      this.fileListData = filteredData.slice(startIndex, endIndex)
      
      this.loading = false
    },

    getStats() {
      // 从全部数据中计算各分类的数量
      const stats = {
        totalCount: 0,
        researchCount: 0,
        paperCount: 0,
        competitionCount: 0,
        examCount: 0
      }
      
      // 统计全部数据中各分类的数量
      if (this.allData && Array.isArray(this.allData)) {
        this.allData.forEach(file => {
          if (file) {
            stats.totalCount++
            switch (file.filePurpose) {
              case '课题研究':
                stats.researchCount++
                break
              case '学术论文':
                stats.paperCount++
                break
              case '教学能力竞赛':
                stats.competitionCount++
                break
              case '命题研究资料':
                stats.examCount++
                break
            }
          }
        })
      }
      
      this.stats = stats
    },

    // 分类筛选
    filterByCategory(category) {
      this.categoryFilter = category
      this.queryParams.category = category
      this.queryParams.pageNum = 1
      this.getFileList()
    },

    handleCategoryFilter(value) {
      this.queryParams.category = value
      this.queryParams.pageNum = 1
      this.getFileList()
    },

    handleSearch() {
      this.queryParams.keyword = this.searchKeyword
      this.queryParams.pageNum = 1
      this.getFileList()
    },

    handleSelectionChange(data) {
      // 处理从 FileList 组件传递过来的数据
      if (data && typeof data === 'object') {
        this.ids = data.ids || []
        this.single = data.single !== undefined ? data.single : true
        this.multiple = data.multiple !== undefined ? data.multiple : true
        this.selectedFiles = data.selection || []
      } else {
        // 兼容旧的直接传递数组的方式
        const selection = Array.isArray(data) ? data : []
        this.ids = selection.map(item => item.fileId)
        this.single = selection.length !== 1
        this.multiple = !selection.length
        this.selectedFiles = selection
      }
    },

    handleDownload(file) {
      let filesToDownload = []
      
      if (file && file.fileId) {
        // 从表格行点击下载
        filesToDownload = [file]
      } else if (this.ids && this.ids.length > 0) {
        // 从顶部按钮点击下载，使用选中的文件
        filesToDownload = this.fileListData.filter(item => this.ids.includes(item.fileId))
      } else {
        this.$message.warning('请选择要下载的文件')
        return
      }
      
      if (filesToDownload.length === 0) {
        this.$message.warning('请选择要下载的文件')
        return
      }
      
      const fileIdList = filesToDownload.map(f => f.fileId)
      this.$modal.confirm('是否确认下载选中的文件？').then(() => {
        const formData = { fileIdList }
        return downloadFiles1(formData)
      }).then(response => {
        this.handleDownloadResponse(response)
      }).catch(error => {
        this.handleDownloadError(error)
      })
    },

    handleDownloadResponse(response, fileName) {
      console.log('===== 响应头信息 =====')
      console.log('Content-Disposition:', response.headers['content-disposition'])
      console.log('Content-Type:', response.headers['content-type'])
      console.log('所有响应头:', response.headers)
      console.log('======================')

      let downloadFileName = fileName || 'download'

      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        console.log('开始解析文件名:', contentDisposition)

        const match1 = contentDisposition.match(/filename="([^"]+)"/)
        const match2 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)

        if (match1) {
          console.log('匹配格式1: filename="xxx.xx"，提取的文件名:', match1[1])
          downloadFileName = match1[1]
        } else if (match2) {
          console.log('匹配格式2: filename*=UTF-8xxx.xx，提取的文件名:', match2[1])
          downloadFileName = decodeURIComponent(match2[1])
        } else {
          console.warn('未匹配到标准格式，尝试原始提取:', contentDisposition)
          const rawMatch = contentDisposition.split('filename=').pop().split(';')[0].replace(/"/g, '')
          downloadFileName = decodeURIComponent(rawMatch)
        }

        console.log('解析后的最终文件名:', downloadFileName)
      } else {
        console.warn('响应头中未找到 Content-Disposition，使用默认文件名')
      }

      const isZipFile =
        response.headers['content-type'] === 'application/zip' ||
        response.headers['content-type'] === 'application/x-zip-compressed' ||
        (downloadFileName && downloadFileName.toLowerCase().endsWith('.zip'))

      if (isZipFile) {
        downloadFileName = 'download.zip'
        console.log('检测到ZIP压缩包，使用固定文件名:', downloadFileName)
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadFileName
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      this.$modal.msgSuccess("下载成功")
    },

    handleDownloadError(error) {
      console.error('下载失败:', error)

      if (error !== 'cancel') {
        if (error.response?.data instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result)
              this.$modal.msgError(errorData.msg || '下载失败')
            } catch (e) {
              this.$modal.msgError(reader.result || '文件下载失败')
            }
          }
          reader.readAsText(error.response.data)
        } else if (error.response?.data) {
          this.$modal.msgError(error.response.data.msg || '下载失败')
        } else {
          this.$modal.msgError(error.message || '网络错误，无法连接到服务器')
        }
      }
    },

    handleDelete(file) {
      let filesToDelete = []
      
      if (file && file.fileId) {
        // 从表格行点击删除
        filesToDelete = [file]
      } else if (this.ids && this.ids.length > 0) {
        // 从顶部按钮点击删除，使用选中的文件
        filesToDelete = this.fileListData.filter(item => this.ids.includes(item.fileId))
      } else {
        this.$message.warning('请选择要删除的文件')
        return
      }
      
      if (filesToDelete.length === 0) {
        this.$message.warning('请选择要删除的文件')
        return
      }
      
      const fileNames = filesToDelete.map(f => f.userFname || f.fileName).join('、')
      this.$confirm(`确定要删除文件"${fileNames}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 批量删除
        const deletePromises = filesToDelete.map(file => delKnowledge(file.fileId))
        Promise.all(deletePromises).then(() => {
        // 从全部数据中删除
          filesToDelete.forEach(file => {
        this.allData = this.allData.filter(item => item.fileId !== file.fileId)
          })
        // 更新统计数据
        this.getStats()
        // 重新获取当前页数据
        this.getFileList()
        this.$message.success('删除成功')
        }).catch(error => {
          this.$message.error('删除失败：' + (error.message || '未知错误'))
        })
      }).catch(() => {})
    },






    handleDownload() {
      const fileIdList = this.ids;
      if (!fileIdList || fileIdList.length === 0) {
        this.$message.warning("请至少选择一个文件");
        return;
      }
      // 新增：批量下载记录日志
      addLog({
        calledTableName: '文件',
        calledTableId: fileIdList.join(','),
        isRead: 0,
        isClickRead: 0,
        isUsed: 1
      });
      this.$modal.confirm('是否确认下载选中的文件？').then(() => {
        const formData = { fileIdList };
        return downloadFiles1(formData);
      }).then(response => {
        this.handleDownloadResponse(response);
      }).catch(error => {
        this.handleDownloadError(error);
      });
    },

    handleDownloadResponse(response) {
      let fileName = 'download';

      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        // 改进的文件名解析逻辑，支持更多格式
        const patterns = [
          // 格式1: filename="filename.ext"
          /filename="([^"]+)"/,
          // 格式2: filename*=UTF-8''filename.ext
          /filename\*=UTF-8''([^;]+)/,
          // 格式3: filename*=UTF-8'zh-CN'filename.ext
          /filename\*=UTF-8'[^']*'([^;]+)/,
          // 格式4: filename*=GBK''filename.ext
          /filename\*=[^']*''([^;]+)/,
          // 格式5: filename=filename.ext
          /filename=([^;]+)/
        ];

        let matched = false;
        for (let i = 0; i < patterns.length; i++) {
          const match = contentDisposition.match(patterns[i]);
          if (match) {
            try {
              // 尝试解码文件名
              fileName = decodeURIComponent(match[1]);
              // 处理可能的编码问题
              if (fileName.includes('%')) {
                fileName = decodeURIComponent(fileName);
              }
              matched = true;
              break;
            } catch (e) {
              console.warn('文件名解码失败，尝试下一个格式:', e)
              continue;
            }
          }
        }

        if (!matched) {
          console.warn('未匹配到标准格式，尝试原始提取:', contentDisposition)
          try {
            const rawMatch = contentDisposition.split('filename=').pop().split(';')[0].replace(/"/g, '');
            fileName = decodeURIComponent(rawMatch);
          } catch (e) {
            console.error('原始提取也失败:', e)
            fileName = 'download';
          }
        }

      } else {
        console.warn('响应头中未找到 Content-Disposition，使用默认文件名')
      }

      // 检查文件名是否包含乱码字符
      if (fileName && /[\u0000-\u001F\u007F-\u009F]/.test(fileName)) {
        console.warn('检测到文件名包含控制字符，进行清理')
        fileName = fileName.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      }

      // 如果文件名为空或只包含空白字符，使用默认文件名
      if (!fileName || fileName.trim() === '') {
        fileName = 'download';
      }

      const isZipFile =
        response.headers['content-type'] === 'application/zip' ||
        response.headers['content-type'] === 'application/x-zip-compressed' ||
        (fileName && fileName.toLowerCase().endsWith('.zip'));

      if (isZipFile) {
        fileName = 'download.zip';
      }

      // 确保文件名是安全的
      fileName = this.sanitizeFileName(fileName);

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      this.$modal.msgSuccess("下载成功");
    },
    
    // 清理文件名，确保安全
    sanitizeFileName(fileName) {
      if (!fileName) return 'download';
      
      // 移除或替换不安全的字符
      let sanitized = fileName
        .replace(/[<>:"/\\|?*]/g, '_') // 替换Windows不允许的字符
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
        .replace(/\s+/g, '_') // 替换多个空格为下划线
        .trim();
      
      // 确保文件名不为空
      if (!sanitized || sanitized === '') {
        sanitized = 'download';
      }
      
      // 限制文件名长度
      if (sanitized.length > 200) {
        const ext = sanitized.split('.').pop();
        const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
        sanitized = name.substring(0, 200 - ext.length - 1) + '.' + ext;
      }
      
      return sanitized;
    },

    handleExport() {
      // 导出功能暂时禁用，因为没有download方法
      this.$message.warning('导出功能暂未实现')
    },

    // 处理分享
    handleShare() {
      if (this.ids.length === 0) {
        this.$message.warning('请先选择要分享的文件');
        return;
      }
      
      this.selectedFiles = this.fileListData.filter(file => 
        this.ids.includes(file.fileId)
      );
      
      this.shareVisible = true;
    },

    // 移除文件
    handleRemoveFile(file) {
      const index = this.selectedFiles.findIndex(f => f.fileId === file.fileId);
      if (index > -1) {
        this.selectedFiles.splice(index, 1);
        this.ids = this.selectedFiles.map(f => f.fileId);
      }
    },

    // 分享成功回调
    handleShareSuccess() {
      // 可以在这里添加分享成功后的操作，比如刷新列表
    },

    // 分享关闭回调
    handleShareClose() {
      // 可以在这里添加关闭后的清理操作
    },

  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

/* 文件类型和用途图标样式 */
.file-type-cell, .file-purpose-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.file-type-icon, .file-purpose-icon {
  font-size: 16px;
  color: #409EFF;
}

.file-type-text, .file-purpose-text {
  font-size: 12px;
  color: #606266;
}

/* 预览按钮样式 */
.preview-btn {
  color: #409EFF;
}

.preview-btn:hover {
  color: #66b1ff;
}

/* 预览弹窗样式 */
.preview-dialog {
  margin-top: -2vh;
}

.preview-dialog .el-dialog__body {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

.preview-container {
  height: 80vh;
  margin-top: -20px;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.file-name-display {
  text-align: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name-display h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
  background: #fff;
}

.preview-header {
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-content {
  flex: 1;
  overflow: auto;
  /* padding: 20px; */
  background: #fff;
}

.preview-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
}

.preview-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #f56c6c;
}

.preview-error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.preview-error-text {
  font-size: 14px;
  margin-bottom: 16px;
}

.preview-error-actions {
  display: flex;
  gap: 10px;
}

/* 文件类型预览样式 */
/* 文件类型预览样式 */
.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* PDF预览样式 */
.pdf-preview {
  flex: 1;
  /* padding: 20px; */
}

.preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

/* 视频和音频预览样式 */
.video-preview, .audio-preview {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /* padding: 20px; */
}

.preview-video, .preview-audio {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 文本预览样式 */
.text-preview {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: white;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

/* Office文档预览样式 */
.office-preview {
  flex: 1;
  padding: 20px;
  min-height: 500px;
}

/* 分享弹窗样式 */
.share-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.share-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.selected-files {
  margin-bottom: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 16px;
  color: #409EFF;
}

.file-name {
  font-size: 14px;
  color: #303133;
}

.remove-btn {
  color: #f56c6c;
  cursor: pointer;
}

.remove-btn:hover {
  color: #f78989;
}

/* 级联选择器样式 */
.cascader-container {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .preview-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
  /* padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
} */

.page-header h2 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 100px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: white;
}

.stats-icon.research {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.paper {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.competition {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.exam {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-icon.all {
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
}

.stats-card.active {
  border: 2px solid #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 3px;
}

.stats-label {
  font-size: 13px;
  color: #909399;
}

.upload-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.el-upload {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
  height: 150px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.upload-tip i {
  margin-right: 4px;
  color: #409EFF;
}
</style>
