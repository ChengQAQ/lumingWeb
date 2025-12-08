<template>
  <div class="app-container">
    <!-- 资源列表 -->
    <div class="page-content">
            <!-- 分类统计卡片 -->
            <div class="category-stats">
              <div class="stats-title">管理教师专业发展相关的资源文件</div>
              <div class="stats-cards">
                <transition-group name="category-expand" tag="div" class="stats-cards-wrapper">
                  <div
                    v-for="category in categoryStats"
                    :key="category.type"
                    class="stat-card"
                    :class="{
                      active: categoryFilter === category.label,
                      'other-button': category.isOtherButton,
                      'other-category': category.isOtherCategory
                    }"
                    @click="handleCategoryCardClick(category)"
                  >
                    <div class="stat-icon" :style="{ backgroundColor: category.color }">
                      <i :class="category.icon"></i>
                    </div>
                    <!-- <div class="stat-number">{{ category.count }}</div> -->
                    <div class="stat-label">
                      {{ category.label }}
                      <i
                        v-if="category.isOtherButton"
                        :class="showOtherCategories ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
                        class="expand-icon"
                      ></i>
                    </div>
                  </div>
                </transition-group>
              </div>
            </div>

            <!-- 文件列表 -->
            <el-card class="list-card" shadow="hover">
              <div slot="header" class="card-header">
                <span>资源列表</span>
                <div class="header-actions">
                  <el-select v-model="resourceType" placeholder="选择类型" style="width: 120px; margin-right: 10px" clearable @change="handleResourceTypeChange">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="个人" value="个人"></el-option>
                    <el-option label="系统" value="系统"></el-option>
                    <el-option label="校本" value="校本"></el-option>
                  </el-select>
                  <el-select v-model="categoryFilter" placeholder="选择分类" style="width: 150px; margin-right: 10px" clearable @change="handleCategoryFilter">
                    <el-option label="全部类型" value=""></el-option>
                    <el-option
                      v-for="purpose in filePurposeOptions"
                      :key="purpose"
                      :label="purpose"
                      :value="purpose"
                    ></el-option>
                  </el-select>
                  <!-- <el-select v-model="gradeFilter" placeholder="选择年级" style="width: 120px; margin-right: 10px" clearable @change="handleGradeFilter">
                    <el-option label="全部年级" value=""></el-option>
                    <el-option label="初中" value="初中"></el-option>
                    <el-option label="高中" value="高中"></el-option>
                  </el-select> -->
                  <el-select v-model="subjectNameFilter" placeholder="选择课程名" style="width: 150px; margin-right: 10px" clearable @change="handleSubjectNameFilter">
                    <el-option label="全部课程" value=""></el-option>
                    <el-option
                      v-for="subject in subjectList"
                      :key="subject.subjectCode"
                      :label="subject.subjectName"
                      :value="subject.subjectCode"
                    />
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

              <!-- 原有的操作按钮和表格 -->
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
                <!-- <el-col :span="1.5">
                  <el-button
                    type="warning"
                    plain
                    icon="el-icon-download"
                    size="mini"
                    @click="handleExport"
                    v-hasPermi="['system:knowledge:export']"
                  >导出</el-button>
                </el-col> -->
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
                <!-- <el-col :span="1.5">
                  <el-button
                    type="info"
                    plain
                    icon="el-icon-share"
                    size="mini"
                    :disabled="multiple"
                    @click="handleShare"
                    v-hasPermi="['system:knowledge:share']"
                  >分享文件</el-button>
                </el-col> -->
              </el-row>

              <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">
                <!-- 原有的表格列 -->
                <el-table-column type="selection" width="55" align="center" />
                <!-- <el-table-column label="文件ID" align="center" prop="fileId" /> -->
                <el-table-column label="文件类型" align="center" prop="fileType" width="120">
                  <template slot-scope="scope">
                    <div class="file-type-cell">
                      <i :class="getFileTypeIcon(scope.row.fileType)" class="file-type-icon" :title="scope.row.fileType"></i>
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
                <el-table-column label="章节" align="center" prop="knowledge" />
                <el-table-column label="目录路径" align="center" prop="directoryPath" width="200">
                  <template slot-scope="scope">
                    <span v-if="scope.row.directoryPath" :title="scope.row.directoryPath">
                      {{ scope.row.directoryPath }}
                    </span>
                    <span v-else>-</span>
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
    </div>

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
        <!-- paperType 下拉框，仅在选择教辅材料/自定义作业/自定义试卷时显示 -->
        <el-form-item
          v-if="showPaperType"
          label="试卷类型"
          prop="paperType"
        >
          <el-select
            v-model="form.paperType"
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
          <el-input v-model="form.userFname" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item label="文件" prop="filePath">
          <file-upload v-model="form.filePath"/>
        </el-form-item>
        <el-form-item label="课程名" prop="subjectName">
          <el-select
            v-model="form.subjectName"
            placeholder="请选择课程名"
            clearable
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="subject in subjectList"
              :key="subject.subjectCode"
              :label="subject.subjectName"
              :value="subject.subjectCode"
            />
          </el-select>
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文件预览组件 -->
    <FilePreview
      :visible="previewVisible"
      :file="currentPreviewFile"
      @close="handlePreviewClose"
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
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge, sysUserList, sysGetchaptermap, downloadFiles1, getPreviewPathPC, selectFilePurpose } from "@/api/system/knowledge"
import { listSubject } from "@/api/system/subject"
import { getTeacherInfo } from "@/api/system/teacher"
import { addLog } from "@/api/system/log.js"
import { parseTime } from "@/utils/ruoyi"
import FilePreview from '@/components/FilePreview'
import FileShareDialog from '@/components/FileShareDialog'

export default {
  name: "ResourceLibrary",
  components: {
    FilePreview,
    FileShareDialog
  },
  data() {
    return {
      // 资源类型选择（个人/系统/校本）
      resourceType: '', // 资源类型：个人、系统、校本

      // 文件用途选项（从接口获取）
      filePurposeOptions: [],
      // 年级选项
      gradeOptions: [
        { value: '初中', label: '初中' },
        { value: '高中', label: '高中' }
      ],
      // 分类定义（动态生成）
      categories: [],
      // 分类展开/收起状态
      showOtherCategories: false, // 是否显示"其他"分类
      // 主要分类顺序（按指定顺序显示）
      mainCategoryOrder: ['作业', '试卷', '教案', '学案', '课件', '教辅材料', '教辅书籍', '教学视频'],
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
        subjectName: null,
        hashtag: null,
        series: null
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
        subjectName: null,
        grade: null,
        paperType: null // 试卷类型
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
          { required: true, message: "课程名不能为空", trigger: ["change", "blur"] }
        ],
        uploadTime: [
          { required: true, message: "上传时间不能为空", trigger: "change" }
        ]
      },
      // 预览相关数据
      previewVisible: false,
      currentPreviewFile: null,

      // 分类过滤和搜索
      categoryFilter: '',
      gradeFilter: '',
      subjectNameFilter: '', // 课程名过滤（资源列表）
      searchKeyword: '',

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
    this.loadFilePurposeList(); // 加载文件用途列表
    this.getAllData(); // 获取所有数据用于统计（分类统计卡片）
    this.getList(); // 加载资源列表
  },
  computed: {
    // 判断是否为管理员或校级管理员
    isAdmin() {
      const roles = this.$store.getters.roles || []
      // 检查是否为超级管理员或校级管理员
      return roles.includes('admin') || roles.includes('xjgly') || roles.includes('administrator') || roles.includes('school_admin')
    },
    // 判断是否显示 paperType 下拉框
    showPaperType() {
      const purpose = this.form.filePurpose
      return purpose === '教辅材料' || purpose === '自定义作业' || purpose === '自定义试卷'
    },
    // 分类统计数据
    categoryStats() {
      const stats = this.categories.map(category => {
        let count = 0;
        if (this.allData && Array.isArray(this.allData)) {
          // 计算对应文件数量
          count = this.allData.filter(item =>
            item && item.filePurpose === category.label
          ).length;
        }
        return {
          ...category,
          count
        };
      });

      // 分离主要分类和其他分类（不包含"全部"）
      const mainCategories = stats.filter(cat => cat.isMainCategory);
      const otherCategories = stats.filter(cat => cat.isOtherCategory);

      // 构建最终分类列表
      const finalCategories = [...mainCategories];

      // 如果展开，先添加其他分类
      if (this.showOtherCategories && otherCategories.length > 0) {
        finalCategories.push(...otherCategories);
      }

      // 如果有其他分类，最后添加"其他"按钮（始终保持在最后）
      if (otherCategories.length > 0) {
        // 计算其他分类的总数
        const otherCount = otherCategories.reduce((sum, cat) => sum + cat.count, 0);
        finalCategories.push({
          type: 'other',
          label: '其他',
          icon: 'el-icon-more',
          color: '#909399',
          count: otherCount,
          isOtherButton: true
        });
      }

      return finalCategories;
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

    // 加载文件用途列表
    async loadFilePurposeList() {
      try {
        const response = await selectFilePurpose();
        if (response.code === 200 && response.data && Array.isArray(response.data)) {
          // 去重并清理数据（去除换行符等）
          const uniquePurposes = [...new Set(response.data.map(item => item.trim().replace(/\r\n/g, '').replace(/\n/g, '')))].filter(item => item);

          // 更新文件用途选项
          this.filePurposeOptions = uniquePurposes;

          // 动态生成分类列表
          this.categories = this.generateCategories(uniquePurposes);
        } else {
          console.error('获取文件用途列表失败:', response.msg);
          // 使用默认值
          this.filePurposeOptions = ['教案', '课件', '作业', '听力', '教学视频', '学案', '教辅材料', '自定义作业', '自定义试卷'];
          this.categories = this.generateCategories(this.filePurposeOptions);
        }
      } catch (error) {
        console.error('获取文件用途列表失败:', error);
        // 使用默认值
        this.filePurposeOptions = ['教案', '课件', '作业', '听力', '教学视频', '学案', '教辅材料', '自定义作业', '自定义试卷'];
        this.categories = this.generateCategories(this.filePurposeOptions);
      }
    },

    // 根据文件用途列表生成分类配置
    generateCategories(purposeList) {
      // 预定义的颜色和图标映射
      const purposeConfig = {
        '教案': { icon: 'el-icon-edit-outline', color: '#8B5CF6' },
        '课件': { icon: 'el-icon-present', color: '#EC4899' },
        '作业': { icon: 'el-icon-edit', color: '#F59E0B' },
        '听力': { icon: 'el-icon-microphone', color: '#3B82F6' },
        '教学视频': { icon: 'el-icon-video-camera', color: '#10B981' },
        '学案': { icon: 'el-icon-reading', color: '#06B6D4' },
        '教辅材料': { icon: 'el-icon-document', color: '#E67E22' },
        '教辅书籍': { icon: 'el-icon-document', color: '#E67E22' },
        '书': { icon: 'el-icon-notebook-2', color: '#FF9800' }, // 添加"书"类型图标
        '自定义作业': { icon: 'el-icon-edit-outline', color: '#F97316' },
        '自定义试卷': { icon: 'el-icon-document-copy', color: '#8B5CF6' },
        '自定义组卷': { icon: 'el-icon-document-copy', color: '#8B5CF6' }, // 添加"自定义组卷"类型图标
        '配音': { icon: 'el-icon-microphone', color: '#9C27B0' },
        '笔记': { icon: 'el-icon-edit', color: '#FF9800' },
        '思维导图': { icon: 'el-icon-share', color: '#4CAF50' },
        '社会试题': { icon: 'el-icon-document', color: '#2196F3' },
        '学术论文': { icon: 'el-icon-notebook-1', color: '#607D8B' },
        '备课材料': { icon: 'el-icon-folder', color: '#795548' },
        '音频': { icon: 'el-icon-headphones', color: '#00BCD4' },
        '试卷': { icon: 'el-icon-document-copy', color: '#FF5722' },
        '课题研究': { icon: 'el-icon-reading', color: '#3F51B5' },
        '教研材料': { icon: 'el-icon-folder-opened', color: '#009688' },
        '阅读题': { icon: 'el-icon-reading', color: '#E91E63' },
        '其他': { icon: 'el-icon-more', color: '#909399' } // 添加"其他"类型图标
      };

      // 预定义的颜色列表（用于未匹配的用途）
      const defaultColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#3B82F6', '#10B981', '#06B6D4', '#E67E22', '#F97316', '#9C27B0', '#FF9800', '#4CAF50', '#2196F3', '#607D8B', '#795548', '#00BCD4', '#FF5722', '#3F51B5', '#009688', '#E91E63'];
      const defaultIcons = ['el-icon-document', 'el-icon-folder', 'el-icon-edit', 'el-icon-reading', 'el-icon-present', 'el-icon-video-camera', 'el-icon-microphone', 'el-icon-headphones', 'el-icon-notebook-1', 'el-icon-folder-opened'];

      // 生成分类列表（不包含"全部"）
      const categories = [];

      // 按照指定顺序排序
      const sortedPurposes = [];
      const otherPurposes = [];

      // 先添加主要分类（按顺序）
      this.mainCategoryOrder.forEach(mainCategory => {
        if (purposeList.includes(mainCategory)) {
          sortedPurposes.push(mainCategory);
        }
      });

      // 添加其他分类
      purposeList.forEach(purpose => {
        if (!this.mainCategoryOrder.includes(purpose)) {
          otherPurposes.push(purpose);
        }
      });

      // 合并：主要分类 + 其他分类
      const finalPurposes = [...sortedPurposes, ...otherPurposes];

      // 为每个文件用途生成分类配置
      finalPurposes.forEach((purpose, index) => {
        const config = purposeConfig[purpose] || {
          icon: defaultIcons[index % defaultIcons.length],
          color: defaultColors[index % defaultColors.length]
        };
        categories.push({
          type: `purpose-${index}`,
          label: purpose,
          icon: config.icon,
          color: config.color,
          isMainCategory: this.mainCategoryOrder.includes(purpose),
          isOtherCategory: !this.mainCategoryOrder.includes(purpose)
        });
      });

      return categories;
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

    // 加载老师科目列表（通过 /system/subject/list 获取）
    loadSubjectList() {
      listSubject().then(response => {
        // 兼容不同的响应格式
        if (response && response.code === 200) {
          // 优先使用 rows，如果没有则使用 data
          this.subjectList = response.rows || response.data || []
        } else if (response && response.rows) {
          this.subjectList = response.rows
        } else if (Array.isArray(response)) {
          this.subjectList = response
        } else {
          this.subjectList = []
        }
      }).catch(error => {
        console.error('获取老师科目列表失败:', error)
        this.$message.error('获取课程列表失败：' + (error.message || '网络错误'))
        this.subjectList = []
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
      // 如果是"其他"按钮，切换展开/收起状态
      if (category.isOtherButton) {
        this.showOtherCategories = !this.showOtherCategories;
        return;
      }

      // 设置分类过滤
      this.categoryFilter = category.label;
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.getList();
    },

    // 分类过滤处理
    handleCategoryFilter(value) {
      this.categoryFilter = value;
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.getList();
    },

    // 资源类型切换处理
    handleResourceTypeChange(value) {
      this.resourceType = value;
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.getList();
    },

    // 年级过滤处理（已注释）
    // handleGradeFilter(value) {
    //   this.gradeFilter = value;
    //   this.queryParams.pageNum = 1;
    //   this.getList();
    // },

    // 课程名过滤处理（资源列表）
    handleSubjectNameFilter(value) {
      this.subjectNameFilter = value;
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.getList();
    },

    // 搜索处理
    handleSearch() {
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.getList();
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
      this.getList();
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



      // 获取全部数据用于统计（仅用于分类统计卡片）
      getAllData() {
        // 获取所有数据，不分页，不应用任何筛选条件，仅用于统计
        const params = {
          pageNum: 1,
          pageSize: 10000 // 设置一个很大的数字来获取所有数据
        }

        listKnowledge(params).then(response => {
          if (response.code === 200) {
            this.allData = response.rows || []
          } else {
            this.allData = []
          }
        }).catch(error => {
          console.error('获取统计数据失败：', error)
          this.allData = []
        })
      },

    // 获取列表数据（通过API传参搜索）
    getList() {
      this.loading = true;
      
      // 构建查询参数
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      };

      // 添加资源类型参数（个人/系统/校本）
      if (this.resourceType && this.resourceType !== '') {
        params.type = this.resourceType;
      }

      // 添加文件用途参数
      if (this.categoryFilter && this.categoryFilter !== '') {
        params.filePurpose = this.categoryFilter;
      }

      // 添加文件类型参数
      if (this.queryParams.fileType && this.queryParams.fileType !== '') {
        params.fileType = this.queryParams.fileType;
      }

      // 添加年级参数（已注释）
      // if (this.gradeFilter && this.gradeFilter !== '') {
      //   params.grade = this.gradeFilter;
      // }

      // 添加课程名参数（直接使用 subjectCode）
      if (this.subjectNameFilter && this.subjectNameFilter !== '') {
        params.subjectName = this.subjectNameFilter;
      }

      // 添加文件名搜索参数
      if (this.searchKeyword && this.searchKeyword.trim() !== '') {
        params.userFname = this.searchKeyword.trim();
      }

      // 添加上传时间参数
      if (this.queryParams.uploadTime && this.queryParams.uploadTime !== '') {
        params.uploadTime = this.queryParams.uploadTime;
      }

      // 添加标签参数
      if (this.queryParams.hashtag && this.queryParams.hashtag !== '') {
        params.hashtag = this.queryParams.hashtag;
      }

      // 添加系列ID参数
      if (this.queryParams.series && this.queryParams.series !== '') {
        params.series = this.queryParams.series;
      }

      // 移除空值参数
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      listKnowledge(params).then(response => {
        if (response.code === 200) {
          this.knowledgeList = response.rows || [];
          this.total = response.total || 0;
          
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
        } else {
          this.$message.error('获取文件列表失败：' + response.msg);
          this.knowledgeList = [];
          this.total = 0;
        }
        this.loading = false;
      }).catch(error => {
        this.$message.error('获取文件列表失败：' + error.message);
        this.knowledgeList = [];
        this.total = 0;
        this.loading = false;
      });
    },

    cancel() {
      this.open = false
      this.reset()
    },

    reset() {
      // 先清除表单验证状态，避免触发警告
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
      this.form = {
        fileId: null,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadTime: null,
        subjectName: null,
        paperType: null
      }
      // 使用 $nextTick 确保表单已重置后再清除验证
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
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
        this.categoryFilter = ''
        // this.gradeFilter = ''
        this.subjectNameFilter = ''
        this.searchKeyword = ''
        this.queryParams.pageNum = 1
        this.getList()
      },

    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.fileId)
      this.single = selection.length !== 1
      this.multiple = !selection.length

      // 更新选中文件列表用于分享
      this.selectedFiles = selection
    },

    handleAdd() {
      this.reset()
      this.title = "添加文件"
      // 使用 $nextTick 确保对话框打开后再处理验证
      this.$nextTick(() => {
        this.open = true
        // 对话框打开后，清除可能触发的验证警告
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
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

        // subjectName 已经是 subjectCode，直接使用，不需要转换

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

          // subjectName 已经是 subjectCode，直接使用

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
                this.getAllData(); // 更新统计数据
                this.getList(); // 更新列表数据
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
                this.getAllData(); // 更新统计数据
                this.getList(); // 更新列表数据
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
          this.getAllData(); // 更新统计数据
          this.getList(); // 更新列表数据
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
    },
    // 处理预览关闭
    handlePreviewClose() {
      this.previewVisible = false
      this.currentPreviewFile = null
    },

    // 处理分享
    handleShare() {
      if (this.ids.length === 0) {
        this.$message.warning('请先选择要分享的文件');
        return;
      }

      this.selectedFiles = this.knowledgeList.filter(file =>
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
/* 全局样式 - 强制覆盖Element UI tabs样式 */
::v-deep .page-tabs .el-tabs__item {
  font-size: 16px !important;
  font-weight: 500 !important;
  padding: 0 30px !important;
  height: 50px !important;
  line-height: 50px !important;
  transition: all 0.3s ease !important;
  border-radius: 8px 8px 0 0 !important;
  margin-right: 4px !important;
  position: relative !important;
  background-color: transparent !important;
  border: 1px solid transparent !important;
}

::v-deep .page-tabs .el-tabs__item:hover {
  background-color: #f5f7fa !important;
  color: #409EFF !important;
  border-color: #e4e7ed !important;
  transform: translateY(-1px) !important;
}

::v-deep .page-tabs .el-tabs__item.is-active {
  color: #409EFF !important;
  font-weight: 600 !important;
  background-color: #ecf5ff !important;
  border: 1px solid #409EFF !important;
  border-bottom: 1px solid #fff !important;
  z-index: 10 !important;
  box-shadow: 0 -2px 8px rgba(64, 158, 255, 0.2) !important;
  transform: translateY(0px) !important;
}

::v-deep .page-tabs .el-tabs__active-bar {
  background: linear-gradient(90deg, #409EFF, #66b1ff) !important;
  height: 3px !important;
  border-radius: 2px !important;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3) !important;
}

::v-deep .page-tabs .el-tabs__nav-wrap {
  background: #fff !important;
  border-radius: 8px 8px 0 0 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  margin: 0 20px !important;
}

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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 15px;
  width: 100%;
}

.stats-cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 15px;
  width: 100%;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0; /* 防止内容溢出 */
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
  position: relative;
}

.stat-label .expand-icon {
  margin-left: 5px;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.stat-card.other-button {
  border-style: dashed;
  border-width: 2px;
}

.stat-card.other-button:hover {
  border-color: #409EFF;
  background-color: #f0f8ff;
}

.stat-card.other-category {
  animation: scaleIn 0.3s ease;
}

/* 分类展开动画 */
.category-expand-enter-active,
.category-expand-leave-active {
  transition: all 0.3s ease;
}

.category-expand-enter {
  opacity: 0;
  transform: scale(0.8);
}

.category-expand-enter-to {
  opacity: 1;
  transform: scale(1);
}

.category-expand-leave {
  opacity: 1;
  transform: scale(1);
}

.category-expand-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 缩放进入动画 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-name-display {
  text-align: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-name-display h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
  word-break: break-all;
}

.preview-actions {
  text-align: center;
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* 图片预览样式 */
.image-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 20px;
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
  flex: 1;
  padding: 20px;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
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

.text-content {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 视频预览样式 */
.video-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.media-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-info i {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 10px;
}

.media-info h3 {
  margin: 10px 0;
  color: #303133;
  font-size: 18px;
}

.media-info .file-info {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.media-player {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.video-player {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.media-actions {
  text-align: center;
}

.media-actions .el-button {
  margin: 0 10px;
}

/* 音频预览样式 */
.audio-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.audio-player {
  width: 100%;
  max-width: 600px;
  height: 60px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-player {
    max-width: 100%;
    max-height: 60vh;
  }

  .audio-player {
    max-width: 100%;
  }

  .media-info {
    padding: 15px;
  }

  .media-info h3 {
    font-size: 16px;
  }

  .media-info .file-info {
    font-size: 12px;
  }
}

/* 不支持预览的样式 */
.unsupported-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  background: white;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  .stats-cards,
  .stats-cards-wrapper {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }

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

/* 分享文件对话框样式 */
.share-dialog .el-dialog__body {
  padding: 20px;
}

.selected-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.file-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.no-files {
  color: #909399;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

/* 分享按钮样式 */
.share-btn {
  color: #67c23a !important;
}

.share-btn:hover {
  color: #85ce61 !important;
}

/* 页面标签样式 */
.page-tabs {
  margin-bottom: 20px;
}

.page-tabs .el-tabs__header {
  margin-bottom: 0;
}

.page-tabs .el-tabs__nav-wrap {
  background: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 深度选择器备用方案 */
.page-tabs ::v-deep .el-tabs__nav.is-top {
  left: 50% !important;
  transform: translateX(-50%) !important;
}

.page-tabs .el-tabs__item {
  font-size: 16px;
  font-weight: 500;
  padding: 0 30px;
  height: 50px;
  line-height: 50px;
}

.page-tabs .el-tabs__item.is-active {
  color: #409EFF;
  font-weight: 600;
}

.tab-content {
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0 20px 20px 20px;
}

/* 筛选卡片样式 */
.filter-card {
  margin-bottom: 20px;
}

.filter-form .el-form-item {
  margin-bottom: 15px;
}

.filter-form .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 校本资源库操作按钮样式 */
.download-btn {
  color: #67c23a !important;
}

.download-btn:hover {
  color: #85ce61 !important;
}

/* Office文档预览样式 */
.office-preview {
  flex: 1;
  background: white;
  margin: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #606266;
}

.loading-container i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #409EFF;
  animation: rotate 1s linear infinite;
}

.loading-container p {
  font-size: 14px;
  margin: 0;
}

.loading-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.error-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* Word文档包装器样式 */
.docx-wrapper {
  flex: 1;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 覆盖vue-office-docx内部样式，解除宽度限制 */
.docx-wrapper ::v-deep .docx-wrapper {
  max-width: 100% !important;
  width: 100% !important;
}

.docx-wrapper ::v-deep .docx {
  max-width: 100% !important;
  width: 100% !important;
  margin: 0 auto;
  padding: 20px;
}

.docx-wrapper ::v-deep .docx-wrapper > section {
  max-width: 100% !important;
  width: 100% !important;
}

.docx-wrapper ::v-deep section.docx {
  max-width: 100% !important;
  width: 100% !important;
}

/* 覆盖文档内容区域宽度 */
.docx-wrapper ::v-deep article {
  max-width: 100% !important;
  width: 100% !important;
}

/* 确保表格和其他内容也能全宽显示 */
.docx-wrapper ::v-deep table {
  max-width: 100% !important;
  width: 100% !important;
}

.docx-wrapper ::v-deep .docx > section {
  max-width: none !important;
  width: 100% !important;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #F56C6C;
}

.error-container i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #F56C6C;
}

.error-container p {
  font-size: 14px;
  margin: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.office-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.office-header i {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 10px;
}

.office-header h3 {
  margin: 10px 0;
  color: #303133;
  font-size: 18px;
}

.office-header .file-info {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.office-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
  overflow: auto;
}

.office-actions {
  text-align: center;
}

.office-actions .el-button {
  margin: 0 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-tabs .el-tabs__item {
    padding: 0 15px;
    font-size: 14px;
  }

  .filter-form .el-col {
    margin-bottom: 10px;
  }

  .office-container {
    padding: 10px;
  }

  .office-header {
    padding: 15px;
  }

  .office-header h3 {
    font-size: 16px;
  }

  .office-header .file-info {
    font-size: 12px;
  }
}

/* 年级选择器提示文本样式 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}
</style>
