<template>
  <div class="app-container">
    <!-- 分类统计卡片 -->
    <div class="category-stats">
      <div class="stats-title">管理教师专业发展相关的资源文件</div>
      <div class="stats-cards">
        <div 
          v-for="category in categoryStats" 
          :key="category.type"
          class="stat-card"
          :class="{ active: categoryFilter === category.label || (!categoryFilter && category.type === 'all') }"
          @click="handleCategoryCardClick(category)"
        >
          <div class="stat-icon" :style="{ backgroundColor: category.color }">
            <i :class="category.icon"></i>
          </div>
          <div class="stat-number">{{ category.count }}</div>
          <div class="stat-label">{{ category.label }}</div>
        </div>
      </div>
    </div>

    <!-- 分类按钮 -->
    <!-- <div class="category-buttons">
      <el-button
        v-for="category in categories"
        :key="category.type"
        :type="selectedCategory === category.type ? 'primary' : 'default'"
        size="small"
        @click="selectCategory(category.type)"
        class="category-btn"
      >
        {{ category.label }}
      </el-button>
    </div> -->

    <!-- 文件列表 -->
    <el-card class="list-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>资源列表</span>
        <div class="header-actions">
          <el-select v-model="categoryFilter" placeholder="选择分类" style="width: 150px; margin-right: 10px" clearable @change="handleCategoryFilter">
            <el-option label="全部" value=""></el-option>
            <el-option label="教案" value="教案"></el-option>
            <el-option label="课件" value="课件"></el-option>
            <el-option label="作业" value="作业"></el-option>
            <el-option label="数字资源" value="数字资源"></el-option>
            <el-option label="教学视频" value="教学视频"></el-option>
            <el-option label="学案" value="学案"></el-option>
            <el-option label="自定义作业" value="自定义作业"></el-option>
            <el-option label="自定义试卷" value="自定义试卷"></el-option>
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
          <el-button type="primary" icon="el-icon-refresh" @click="getList">刷新</el-button>
        </div>
      </div>

      <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:knowledge:add']"
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
          v-hasPermi="['system:knowledge:edit']"
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
          v-hasPermi="['system:knowledge:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:knowledge:export']"
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
          v-hasPermi="['system:knowledge:export']"
        >下载</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件ID" align="center" prop="fileId" />
      <el-table-column label="文件类型" align="center" prop="fileType" width="120">
        <template slot-scope="scope">
          <div class="file-type-cell">
            <i :class="getFileTypeIcon(scope.row.fileType)" class="file-type-icon"></i>
            <span class="file-type-text">{{ scope.row.fileType }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="文件用途" align="center" prop="filePurpose" width="120">
        <template slot-scope="scope">
          <div class="file-purpose-cell">
            <i :class="getFilePurposeIcon(scope.row.filePurpose)" class="file-purpose-icon"></i>
            <span class="file-purpose-text">{{ scope.row.filePurpose }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="文件名" align="center" prop="userFname" />
      <!-- <el-table-column label="文件存储路径" align="center" prop="filePath" /> -->
      <el-table-column label="章节" align="center" prop="knowledge" />
      <el-table-column label="文件大小" align="center" prop="fileSize" width="120">
        <template slot-scope="scope">
          {{ scope.row.fileSize ? formatFileSize(scope.row.fileSize) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="课程名" align="center" prop="subjectName" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.subjectName" type="primary" size="small">
            {{ getSubjectDisplay(scope.row.subjectName) }}
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
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:knowledge:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:knowledge:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    </el-card>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="handlePagination"
    />

    <!-- 添加或修改文件对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="文件用途" prop="filePurpose">
          <el-select
            v-model="form.filePurpose"
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
        <el-form-item label="文件名" prop="userFname">
          <el-input v-model="form.userFname" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item label="文件" prop="filePath">
          <file-upload v-model="form.filePath"/>
        </el-form-item>
        <el-form-item label="课程名" prop="subjectName">
          <el-input
            v-model="form.subjectName"
            placeholder="当前用户学科"
            readonly
            disabled
          />
        </el-form-item>
        <el-form-item label="章节" prop="knowledge" :required="false">
          <el-cascader
            v-model="form.knowledge"
            :options="chapterOptions"
            :props="chapterProps"
            placeholder="请选择章节"
            clearable
          ></el-cascader>
        </el-form-item>
        <!-- <el-form-item label="上传时间" prop="uploadTime">
          <el-date-picker
            v-model="form.uploadTime"
            type="date"
            placeholder="选择上传时间"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文件预览弹窗 -->
    <el-dialog
      title="文件预览"
      :visible.sync="previewVisible"
      width="80%"
      :close-on-click-modal="false"
      class="preview-dialog"
    >
      <div class="preview-container">
        <!-- 图片预览 -->
        <div v-if="isImageFile" class="image-preview">
          <img :src="previewUrl" alt="文件预览" class="preview-image" />
        </div>
        
        <!-- PDF预览 -->
        <div v-else-if="isPdfFile" class="pdf-preview">
          <iframe :src="previewUrl" class="pdf-iframe"></iframe>
        </div>
        
        <!-- 文本预览 -->
        <div v-else-if="isTextFile" class="text-preview">
          <div class="text-content" v-html="textContent"></div>
        </div>
        
        <!-- 不支持预览的文件类型 -->
        <div v-else class="unsupported-preview">
          <i class="el-icon-document"></i>
          <p>该文件类型暂不支持预览</p>
          <p class="file-info">文件名：{{ currentPreviewFile && currentPreviewFile.userFname }}</p>
          <p class="file-info">文件类型：{{ currentPreviewFile && currentPreviewFile.fileType }}</p>
          <el-button type="primary" @click="downloadFile">下载文件</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge, sysUserList, sysSubjectList, sysGetchaptermap, downloadFiles1, getPreviewPath} from "@/api/system/knowledge"
import { getTeacherInfo } from "@/api/system/teacher"
import { addLog } from "@/api/system/log.js"
import { parseTime } from "@/utils/ruoyi"

export default {
  name: "ResourceLibrary",
  data() {
    return {
             // 文件用途选项
       filePurposeOptions: ['教案', '课件', '作业', '数字资源', '教学视频', '学案', '自定义作业', '自定义试卷'],
                    // 分类定义
        categories: [
          { type: 'all', label: '全部', icon: 'el-icon-folder', color: '#909399' },
          { type: 'lesson-plan', label: '教案', icon: 'el-icon-document', color: '#8B5CF6' },
          { type: 'courseware', label: '课件', icon: 'el-icon-document', color: '#EC4899' },
          { type: 'homework', label: '作业', icon: 'el-icon-document', color: '#F59E0B' },
          { type: 'digital-resource', label: '数字资源', icon: 'el-icon-document', color: '#3B82F6' },
          { type: 'video', label: '教学视频', icon: 'el-icon-video-camera', color: '#10B981' },
          { type: 'learning-case', label: '学案', icon: 'el-icon-document', color: '#06B6D4' },
          { type: 'custom-homework', label: '自定义作业', icon: 'el-icon-document', color: '#F97316' },
          { type: 'custom-paper', label: '自定义试卷', icon: 'el-icon-document', color: '#8B5CF6' }
        ],
      allData: [], // 存储所有数据用于统计
      chapterOptions: [], // 存储sysGetchaptermap返回的多级选项
      // 配置级联选择器的属性
      chapterProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true
      },
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      knowledgeList: [],
      title: "",
      open: false,
      userList: [],
      subjectList: [],
      subjectOptions: [], // 科目选项
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
        subjectName: [
          { required: true, message: "课程名不能为空", trigger: "change" }
        ],
        uploadTime: [
          { required: true, message: "上传时间不能为空", trigger: "change" }
        ]
      },
      // 预览相关数据
      previewVisible: false,
      currentPreviewFile: null,
      previewUrl: '',
      textContent: '',
      
      // 分类过滤和搜索
      categoryFilter: '',
      searchKeyword: '',
      
      // 用户学科信息
      userSubject: null
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
    // 分类统计数据
    categoryStats() {
      return this.categories.map(category => {
        let count = 0;
        if (this.allData && Array.isArray(this.allData)) {
          if (category.type === 'all') {
            // 全部类型显示所有文件数量
            count = this.allData.length;
          } else {
            // 其他类型显示对应文件数量
            count = this.allData.filter(item => 
              item && item.filePurpose === category.label
            ).length;
          }
        }
        return {
          ...category,
          count
        };
      });
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
            console.log('获取到老师学科:', teacherData.subjectNames, '转换为:', this.userSubject);
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
    handleCategoryCardClick(category) {
      if (category.type === 'all') {
        this.categoryFilter = '';
      } else {
        this.categoryFilter = category.label;
      }
      this.filterData();
    },

    // 分类过滤处理
    handleCategoryFilter(value) {
      this.categoryFilter = value;
      this.filterData();
    },

    // 搜索处理
    handleSearch() {
      this.filterData();
    },

    // 过滤数据
    filterData() {
      let filteredData = [...this.allData];
      
      console.log('filterData - 原始数据量:', this.allData.length);
      console.log('filterData - 当前分页参数:', this.queryParams.pageNum, this.queryParams.pageSize);
      
      // 按分类过滤
      if (this.categoryFilter && this.categoryFilter !== '') {
        filteredData = filteredData.filter(item => 
          item && item.filePurpose === this.categoryFilter
        );
        console.log('filterData - 分类过滤后数据量:', filteredData.length);
      }
      
      // 按关键词搜索
      if (this.searchKeyword && this.searchKeyword.trim() !== '') {
        const keyword = this.searchKeyword.toLowerCase().trim();
        filteredData = filteredData.filter(item => 
          item && item.userFname && 
          item.userFname.toLowerCase().includes(keyword)
        );
        console.log('filterData - 关键词过滤后数据量:', filteredData.length);
      }
      
      // 分页处理
      const startIndex = (this.queryParams.pageNum - 1) * this.queryParams.pageSize;
      const endIndex = startIndex + this.queryParams.pageSize;
      this.knowledgeList = filteredData.slice(startIndex, endIndex);
      this.total = filteredData.length;
      
      console.log('filterData - 最终显示数据量:', this.knowledgeList.length);
      console.log('filterData - 总数据量:', this.total);
      
      // 新增：查询后记录日志
      if (this.knowledgeList.length > 0) {
        const ids = this.knowledgeList.map(item => item.fileId).join(',');
        addLog({
          calledTableName: '文件',
          calledTableId: ids,
          isRead: 1,
          isClickRead: 0,
          isUsed: 0
        });
      }
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
      this.filterData();
    },

    // 获取文件类型图标
    getFileTypeIcon(fileType) {
      if (!fileType) return 'el-icon-document'
      
      const type = fileType.toLowerCase()
      
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
      if (['ppt', 'pptx'].some(t => type.includes(t))) {
        return 'el-icon-presentation'
      }
      
      // 视频文件
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].some(t => type.includes(t))) {
        return 'el-icon-video-camera'
      }
      
      // 音频文件
      if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].some(t => type.includes(t))) {
        return 'el-icon-headphones'
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
        return 'el-icon-presentation'
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

    querySearch(queryString, callback) {
      const results = queryString
        ? this.userList.filter(user => {
          const nicknameMatch = user.nickName.toLowerCase().includes(queryString.toLowerCase())
          const idMatch = user.userId.toString().includes(queryString)
          return nicknameMatch || idMatch
        })
        : [...this.userList]
      callback(results.map(user => ({
        value: `${user.nickName} (ID: ${user.userId})`,
        id: user.userId,
        nickName: user.nickName
      })))
    },

    handleUserSelect(item) {
      this.queryParams.uploadUserNick = item.nickName;
      this.queryParams.uploadUserId = item.id;
    },



               // 获取全部数据用于统计
      getAllData() {
        this.loading = true
        // 获取所有数据，不分页，不应用任何筛选条件
        const params = {
          pageNum: 1,
          pageSize: 10000 // 设置一个很大的数字来获取所有数据
        }
        
        listKnowledge(params).then(response => {
          if (response.code === 200) {
            this.allData = response.rows || []
            // 重置分页到第一页
            this.queryParams.pageNum = 1;
            // 初始化显示数据
            this.filterData()
            console.log('数据刷新成功，总数据量:', this.allData.length);
          } else {
            this.$message.error('获取文件列表失败：' + response.msg)
            this.allData = []
            this.filterData()
          }
          this.loading = false
        }).catch(error => {
          this.$message.error('获取文件列表失败：' + error.message)
          this.allData = []
          this.filterData()
          this.loading = false
        })
      },

           getList() {
        this.loading = true
        // 从全部数据中筛选当前页数据
        let filteredData = []
        if (this.allData && Array.isArray(this.allData)) {
          filteredData = [...this.allData]
          // 根据分类筛选
          if (this.queryParams.filePurpose) {
            filteredData = filteredData.filter(file => file && file.filePurpose === this.queryParams.filePurpose)
          }
          
          // 根据其他条件筛选
          if (this.queryParams.fileType) {
            filteredData = filteredData.filter(file => 
              file && file.fileType && file.fileType.toLowerCase().includes(this.queryParams.fileType.toLowerCase())
            )
          }
          
          if (this.queryParams.userFname) {
            filteredData = filteredData.filter(file => 
              file && file.userFname && file.userFname.toLowerCase().includes(this.queryParams.userFname.toLowerCase())
            )
          }
          
          if (this.queryParams.subjectName) {
            filteredData = filteredData.filter(file => file && file.subjectName === this.queryParams.subjectName)
          }
          
          if (this.queryParams.uploadUserId) {
            filteredData = filteredData.filter(file => file && file.uploadUserId === this.queryParams.uploadUserId)
          }
          
          if (this.queryParams.uploadTime) {
            filteredData = filteredData.filter(file => 
              file && file.uploadTime && file.uploadTime.startsWith(this.queryParams.uploadTime)
            )
          }
          
          if (this.queryParams.knowledge) {
            filteredData = filteredData.filter(file => 
              file && file.knowledge && file.knowledge.includes(this.queryParams.knowledge)
            )
          }
        }
        
        // 计算总数
        this.total = filteredData.length
        
        // 分页处理
        const startIndex = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
        const endIndex = startIndex + this.queryParams.pageSize
        this.knowledgeList = filteredData.slice(startIndex, endIndex)
        // 新增：查询后记录日志
        if (this.knowledgeList.length > 0) {
          const ids = this.knowledgeList.map(item => item.fileId).join(',');
          addLog({
            calledTableName: '文件',
            calledTableId: ids,
            isRead: 1,
            isClickRead: 0,
            isUsed: 0
          });
        }
        this.loading = false
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

    handleQuery() {
      this.queryParams.pageNum = 1;
      if (this.queryParams.knowledge && this.queryParams.knowledge.length) {
        this.queryParams.knowledge = this.queryParams.knowledge[this.queryParams.knowledge.length - 1];
      }
      this.getList();
    },

                   resetQuery() {
        this.resetForm("queryForm")
        this.queryParams.uploadUserNick = ""
        this.queryParams.uploadUserId = null
        this.queryParams.subjectName = null
        this.queryParams.userFname = null
        this.queryParams.filePurpose = null
        this.getAllData()
      },

    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.fileId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },

    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加文件"
    },

    handleUpdate(row) {
      this.reset()
      const fileId = row.fileId || this.ids
      getKnowledge(fileId).then(response => {
        this.form = { ...response.data }
        
        // 确保时间字段正确显示
        if (this.form.uploadTime) {
          // 如果数据库返回的是时间戳，转换为日期格式
          if (typeof this.form.uploadTime === 'number') {
            this.form.uploadTime = new Date(this.form.uploadTime).toISOString().split('T')[0];
          }
        }
        
        // 将英文学科代码转换为中文名称用于显示
        if (this.form.subjectName) {
          this.form.subjectName = this.convertCodeToSubject(this.form.subjectName);
        }
        
        // 章节回显：数据库返回字符串，需要切割成数组用于cascader
        if (this.form.knowledge && typeof this.form.knowledge === 'string') {
          // 切割字符串为label数组
          const labelArr = this.form.knowledge.split('/').filter(Boolean);
          // 将label数组转换为value数组用于cascader回显
          this.form.knowledge = this.findValuePathByLabels(this.chapterOptions, labelArr);
        } else if (!this.form.knowledge) {
          this.form.knowledge = [];
        }
        
        this.open = true
        this.title = "修改文件"
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
            const originalData = this.knowledgeList.find(item => item.fileId === this.form.fileId)
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

    handleDelete(row) {
      const fileIds = row.fileId || this.ids
      this.$modal.confirm('是否确认删除文件编号为"' + fileIds + '"的数据项？').then(function() {
        return delKnowledge(fileIds)
      }).then(response => {
        if (response.code === 200) {
          this.getAllData();
          this.$modal.msgSuccess("删除成功");
        } else {
          this.$modal.msgError("删除失败：" + (response.msg || "未知错误"));
        }
      }).catch(error => {
        console.error("删除文件失败:", error);
        this.$modal.msgError("删除失败：" + (error.message || "网络错误"));
      });
    },

    handleExport() {
      // 导出功能暂时禁用，因为没有download方法
      this.$message.warning('导出功能暂未实现')
    },

    // 下载文件
    downloadFile() {
      if (this.currentPreviewFile) {
        const formData = { fileIdList: [this.currentPreviewFile.fileId] }
        // 新增：下载记录日志
        addLog({
          calledTableName: '文件',
          calledTableId: this.currentPreviewFile.fileId,
          isRead: 0,
          isClickRead: 0,
          isUsed: 1
        });
        downloadFiles1(formData).then(response => {
          this.handleDownloadResponse(response)
        }).catch(error => {
          this.handleDownloadError(error)
        })
      }
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
      console.log('===== 响应头信息 =====')
      console.log('Content-Disposition:', response.headers['content-disposition'])
      console.log('Content-Type:', response.headers['content-type'])
      console.log('所有响应头:', response.headers)
      console.log('======================')

      let fileName = 'download';

      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        console.log('开始解析文件名:', contentDisposition)

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
            console.log(`匹配格式${i + 1}:`, match[1])
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

        console.log('解析后的最终文件名:', fileName)
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
        console.log('检测到ZIP压缩包，使用固定文件名:', fileName);
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

    handleDownloadError(error) {
      console.error('下载失败:', error);

      if (error !== 'cancel') {
        if (error.response?.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              this.$modal.msgError(errorData.msg || '下载失败');
            } catch (e) {
              this.$modal.msgError(reader.result || '文件下载失败');
            }
          };
          reader.readAsText(error.response.data);
        } else if (error.response?.data) {
          this.$modal.msgError(error.response.data.msg || '下载失败');
        } else {
          this.$modal.msgError(error.message || '网络错误，无法连接到服务器');
        }
      }
    },

         // 处理文件预览
     handlePreview(row) {
       this.currentPreviewFile = row
       this.previewVisible = true
       // 新增：预览记录日志
       addLog({
         calledTableName: '文件',
         calledTableId: row.fileId,
         isRead: 0,
         isClickRead: 1,
         isUsed: 0
       });
       
       // 使用新的API获取预览路径
       getPreviewPath(row.fileId).then(response => {
         if (response) {
           // 直接使用API返回的预览路径
           this.previewUrl = response
           
           // 根据文件类型设置预览
           if (this.isImageFile || this.isPdfFile) {
             // 对于图片和PDF，直接使用URL
           } else if (this.isTextFile) {
             // 对于文本文件，读取内容
             this.loadTextContentFromUrl(response)
           } else {
             // 不支持预览的文件类型
             this.previewUrl = ''
             this.textContent = ''
           }
         } else {
           // 如果API调用失败，回退到原来的方式
           this.fallbackPreview(row)
         }
       }).catch(error => {
         console.error('获取预览路径失败:', error)
         // 回退到原来的方式
         this.fallbackPreview(row)
       })
     },
    
    // 回退预览方法
    fallbackPreview(row) {
      // 根据文件类型设置预览URL
      if (this.isImageFile || this.isPdfFile) {
        // 对于图片和PDF，直接使用文件路径
        this.previewUrl = process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(row.filePath) + '&delete=' + false
      } else if (this.isTextFile) {
        // 对于文本文件，尝试读取内容
        this.loadTextContent(row.filePath)
      } else {
        // 不支持预览的文件类型
        this.previewUrl = ''
        this.textContent = ''
      }
    },

    // 加载文本文件内容
    async loadTextContent(filePath) {
      try {
        const response = await fetch(process.env.VUE_APP_BASE_API + '/common/download?fileName=' + encodeURIComponent(filePath) + '&delete=' + false)
        if (response.ok) {
          const text = await response.text()
          // 简单的文本格式化
          this.textContent = text.replace(/\n/g, '<br>').replace(/\s{2}/g, '&nbsp;&nbsp;')
        } else {
          this.textContent = '无法加载文件内容'
        }
      } catch (error) {
        console.error('加载文本文件失败:', error)
        this.textContent = '加载文件内容失败'
      }
    },
    
    // 从URL加载文本文件内容
    async loadTextContentFromUrl(url) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const text = await response.text()
          // 简单的文本格式化
          this.textContent = text.replace(/\n/g, '<br>').replace(/\s{2}/g, '&nbsp;&nbsp;')
        } else {
          this.textContent = '无法加载文件内容'
        }
      } catch (error) {
        console.error('从URL加载文本文件失败:', error)
        this.textContent = '加载文件内容失败'
      }
    },

    // 下载文件
    downloadFile() {
      if (this.currentPreviewFile) {
        const formData = { fileIdList: [this.currentPreviewFile.fileId] }
        // 新增：下载记录日志
        addLog({
          calledTableName: '文件',
          calledTableId: this.currentPreviewFile.fileId,
          isRead: 0,
          isClickRead: 0,
          isUsed: 1
        });
        downloadFiles1(formData).then(response => {
          this.handleDownloadResponse(response)
        }).catch(error => {
          this.handleDownloadError(error)
        })
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}

.fixed-width .el-button--mini {
  padding-left: 0;
  padding-right: 0;
  width: 60px;
}

/* 分类统计样式 */
.category-stats {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}

.stats-cards {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.active {
  border-color: #409EFF;
  background: #f0f8ff;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.stat-icon i {
  font-size: 24px;
  color: #fff;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

/* 分类按钮样式 */
.category-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 文件列表卡片样式 */
.list-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 文件类型单元格样式 */
.file-type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-type-icon {
  font-size: 16px;
  color: #409EFF;
}

.file-type-text {
  font-size: 12px;
  color: #606266;
}

/* 文件用途单元格样式 */
.file-purpose-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-purpose-icon {
  font-size: 16px;
  color: #67C23A;
}

.file-purpose-text {
  font-size: 12px;
  color: #606266;
}

.category-btn {
  margin-right: 10px;
  margin-bottom: 10px;
}

.category-btn.el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
}

/* 预览按钮样式 */
.preview-btn {
  color: #409EFF !important;
}

.preview-btn:hover {
  color: #66b1ff !important;
}

/* 预览弹窗样式 */
.preview-dialog .el-dialog__body {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

.preview-container {
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

/* 图片预览样式 */
.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* PDF预览样式 */
.pdf-preview {
  width: 100%;
  height: 100%;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

/* 文本预览样式 */
.text-preview {
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: auto;
  background: white;
}

.text-content {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 不支持预览的样式 */
.unsupported-preview {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.unsupported-preview i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.unsupported-preview p {
  margin: 8px 0;
  font-size: 14px;
}

.unsupported-preview .file-info {
  color: #606266;
  font-size: 12px;
}

.unsupported-preview .el-button {
  margin-top: 16px;
}

/* 文件类型和用途图标样式 */
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

/* 文件类型图标颜色 */
.file-type-icon.el-icon-picture {
  color: #67c23a;
}

.file-type-icon.el-icon-document {
  color: #409eff;
}

.file-type-icon.el-icon-s-grid {
  color: #e6a23c;
}

.file-type-icon.el-icon-presentation {
  color: #f56c6c;
}

.file-type-icon.el-icon-video-camera {
  color: #909399;
}

.file-type-icon.el-icon-headphones {
  color: #8b5cf6;
}

.file-type-icon.el-icon-folder {
  color: #06b6d4;
}

.file-type-icon.el-icon-cpu {
  color: #10b981;
}

/* 文件用途图标颜色 */
.file-purpose-icon.el-icon-edit-outline {
  color: #409eff;
}

.file-purpose-icon.el-icon-presentation {
  color: #e6a23c;
}

.file-purpose-icon.el-icon-share {
  color: #67c23a;
}

.file-purpose-icon.el-icon-video-camera {
  color: #f56c6c;
}

.file-purpose-icon.el-icon-notebook-2 {
  color: #8b5cf6;
}

.file-purpose-icon.el-icon-headphones {
  color: #06b6d4;
}

.file-purpose-icon.el-icon-reading {
  color: #10b981;
}

.file-type-text,
.file-purpose-text {
  font-size: 12px;
  color: #606266;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 悬停效果 */
.file-type-cell:hover .file-type-icon,
.file-purpose-cell:hover .file-purpose-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-type-cell,
  .file-purpose-cell {
    flex-direction: column;
    gap: 4px;
  }
  
  .file-type-text,
  .file-purpose-text {
    max-width: 60px;
    font-size: 11px;
  }
}
</style>