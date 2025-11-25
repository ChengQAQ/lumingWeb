<template>
  <div class="app-container">
    <!-- 页面标签切换 -->
    <div class="page-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="资源列表" name="resourceList">
          <!-- 原有的资源列表内容 -->
          <div class="tab-content">
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

            <!-- 文件列表 -->
            <el-card class="list-card" shadow="hover">
              <div slot="header" class="card-header">
                <span>资源列表</span>
                <div class="header-actions">
                  <el-select v-model="categoryFilter" placeholder="选择分类" style="width: 150px; margin-right: 10px" clearable @change="handleCategoryFilter">
                    <el-option label="全部类型" value=""></el-option>
                    <el-option label="教案" value="教案"></el-option>
                    <el-option label="课件" value="课件"></el-option>
                    <el-option label="作业" value="作业"></el-option>
                    <el-option label="听力" value="听力"></el-option>
                    <el-option label="教学视频" value="教学视频"></el-option>
                    <el-option label="学案" value="学案"></el-option>
                    <el-option label="教辅材料" value="教辅材料"></el-option>
                    <el-option label="自定义作业" value="自定义作业"></el-option>
                    <el-option label="自定义试卷" value="自定义试卷"></el-option>
                  </el-select>
                  <el-select v-model="gradeFilter" placeholder="选择年级" style="width: 120px; margin-right: 10px" clearable @change="handleGradeFilter">
                    <el-option label="全部年级" value=""></el-option>
                    <el-option label="初中" value="初中"></el-option>
                    <el-option label="高中" value="高中"></el-option>
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
                <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
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
        </el-tab-pane>
        
        <el-tab-pane label="校本资源库" name="schoolBased">
          <div class="tab-content">
            <!-- 校本资源库分类统计卡片 -->
            <div class="category-stats">
              <div class="stats-title">校本资源库 - 管理学校共享的教学资源文件</div>
              <div class="stats-cards">
                <div 
                  v-for="category in schoolBasedCategoryStats" 
                  :key="category.type"
                  class="stat-card"
                  :class="{ active: schoolBasedCategoryFilter === category.label || (!schoolBasedCategoryFilter && category.type === 'all') }"
                  @click="handleSchoolBasedCategoryCardClick(category)"
                >
                  <div class="stat-icon" :style="{ backgroundColor: category.color }">
                    <i :class="category.icon"></i>
                  </div>
                  <div class="stat-number">{{ category.count }}</div>
                  <div class="stat-label">{{ category.label }}</div>
                </div>
              </div>
            </div>

            <!-- 校本资源库文件列表 -->
            <el-card class="list-card" shadow="hover">
              <div slot="header" class="card-header">
                <span style="min-width: 100px;">校本资源库</span>
                <div class="header-actions">
                  <el-select v-model="schoolBasedCategoryFilter" placeholder="选择分类" style="width: 150px; margin-right: 10px" clearable @change="handleSchoolBasedCategoryFilter">
                    <el-option label="全部类型" value=""></el-option>
                    <el-option label="教案" value="教案"></el-option>
                    <el-option label="课件" value="课件"></el-option>
                    <el-option label="作业" value="作业"></el-option>
                    <el-option label="听力" value="听力"></el-option>
                    <el-option label="教学视频" value="教学视频"></el-option>
                    <el-option label="学案" value="学案"></el-option>
                    <el-option label="教辅材料" value="教辅材料"></el-option>
                    <el-option label="自定义作业" value="自定义作业"></el-option>
                    <el-option label="自定义试卷" value="自定义试卷"></el-option>
                  </el-select>

                  <el-select v-model="gradeFilter" placeholder="选择年级" style="width: 120px; margin-right: 10px" clearable @change="handleGradeFilter">
                    <el-option label="全部年级" value=""></el-option>
                    <el-option label="初中" value="初中"></el-option>
                    <el-option label="高中" value="高中"></el-option>
                  </el-select>
                  
                  <!-- 系列类型选择器 -->
                  <el-select
                    v-model="schoolBasedSeriesType"
                    placeholder="选择系列类型"
                    style="width: 120px; margin-right: 10px;"
                    clearable
                    @change="handleSchoolBasedSeriesTypeChange"
                  >
                    <el-option
                      v-for="type in seriesTypeOptions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    >
                    </el-option>
                  </el-select>
                  
                  <!-- 系列选择器 -->
                  <el-select
                    v-model="schoolBasedSeries"
                    filterable
                    placeholder="选择系列"
                    style="width: 200px; margin-right: 10px;"
                    clearable
                    @change="handleSchoolBasedSeriesChange"
                    @focus="loadSchoolBasedSeriesList"
                  >
                    <el-option
                      v-for="seriesItem in filteredSchoolBasedSeriesList"
                      :key="seriesItem.id"
                      :label="seriesItem.series"
                      :value="seriesItem.id"
                    >
                      <span style="float: left">{{ seriesItem.series }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{ seriesItem.subjectName || seriesItem.subject_name }}</span>
                    </el-option>
                  </el-select>
                  
                  <!-- 系列路径选择按钮 -->
                  <el-button 
                    type="primary" 
                    plain 
                    @click="openSchoolBasedSeriesPathSelector"
                    :disabled="!schoolBasedSeries"
                    style="margin-right: 10px;"
                  >
                    <i class="el-icon-location"></i>
                    {{ schoolBasedSeriesPath || '选择章节路径' }}
                  </el-button>
                  
                  <el-input
                    v-model="schoolBasedSearchKeyword"
                    placeholder="搜索文件名"
                    style="width: 200px; margin-right: 10px"
                    clearable
                    @keyup.enter.native="handleSchoolBasedSearch"
                  >
                    <el-button slot="append" icon="el-icon-search" @click="handleSchoolBasedSearch"></el-button>
                  </el-input>
                  <el-button type="primary" icon="el-icon-refresh" @click="getSchoolBasedAllData">刷新</el-button>
                </div>
              </div>

              <el-table v-loading="schoolBasedLoading" :data="schoolBasedList">
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
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
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
                      icon="el-icon-download"
                      @click="handleSchoolBasedDownload(scope.row)"
                      class="download-btn"
                    >下载</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>

            <pagination
              v-show="schoolBasedTotal>0"
              :total="schoolBasedTotal"
              :page.sync="schoolBasedQueryParams.pageNum"
              :limit.sync="schoolBasedQueryParams.pageSize"
              @pagination="handleSchoolBasedPagination"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
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
        <el-form-item label="年级" prop="grade">
          <el-select
            v-model="form.grade"
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
            v-if="isAdmin"
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
              :value="subject.subjectName"
            />
          </el-select>
          <el-input
            v-else
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
    
    <!-- 系列路径选择对话框 -->
    <AllSeriesPathDialog
      :visible="schoolBasedSeriesPathDialogVisible"
      :seriesData="selectedSchoolBasedSeriesData"
      @confirm="handleSchoolBasedSeriesPathSelectionConfirm"
      @close="handleSchoolBasedSeriesPathDialogClose"
    />
  </div>
</template>

<script>
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge, sysUserList, sysSubjectList, sysGetchaptermap, downloadFiles1, getPreviewPathPC, getSchoolBasedList } from "@/api/system/knowledge"
import { getTeacherInfo } from "@/api/system/teacher"
import { addLog } from "@/api/system/log.js"
import { listSeries } from "@/api/system/series"
import { parseTime } from "@/utils/ruoyi"
import AllSeriesPathDialog from '@/components/Dialogs/AllSeriesPathDialog'
import FilePreview from '@/components/FilePreview'
import FileShareDialog from '@/components/FileShareDialog'

export default {
  name: "ResourceLibrary",
  components: {
    AllSeriesPathDialog,
    FilePreview,
    FileShareDialog
  },
  data() {
    return {
      // 添加页面切换相关数据
      activeTab: 'resourceList', // 当前激活的标签页
      
      // 校本资源库相关数据
      schoolBasedList: [], // 校本资源库文件列表
      schoolBasedTotal: 0, // 校本资源库总数
      schoolBasedLoading: false, // 校本资源库加载状态
      schoolBasedQueryParams: {
        pageNum: 1,
        pageSize: 10,
        userFname: '',
        fileType: '',
        knowledge: '',
        subjectName: '',
        filePurpose: '',
        hashtag: '',
        series: ''
      },
      // 校本资源库分类过滤和搜索
      schoolBasedCategoryFilter: '',
      schoolBasedSearchKeyword: '',
      schoolBasedAllData: [], // 存储校本资源库所有数据用于统计
      
      // 校本资源库系列相关数据
      schoolBasedSeriesType: '', // 系列类型
      schoolBasedSeries: null, // 系列ID
      schoolBasedSeriesList: [], // 系列列表
      schoolBasedSeriesLoading: false, // 系列加载状态
      schoolBasedSeriesPath: '', // 系列路径
      schoolBasedSeriesPathDialogVisible: false, // 系列路径对话框显示状态
      selectedSchoolBasedSeriesData: null, // 选中的系列数据
      
      // 系列类型选项
      seriesTypeOptions: [
        { label: '书', value: '书' },
        { label: '试卷', value: '试卷' },
        { label: '视频', value: '视频' }
      ],
      
      // 文件用途选项
      filePurposeOptions: ['教案', '课件', '作业', '听力', '教学视频', '学案', '教辅材料', '自定义作业', '自定义试卷'],
      // 年级选项
      gradeOptions: [
        { value: '初中', label: '初中' },
        { value: '高中', label: '高中' }
      ],
      // 分类定义
      categories: [
        { type: 'all', label: '全部', icon: 'el-icon-folder', color: '#909399' },
        { type: 'lesson-plan', label: '教案', icon: 'el-icon-edit-outline', color: '#8B5CF6' },
        { type: 'courseware', label: '课件', icon: 'el-icon-present', color: '#EC4899' },
        { type: 'homework', label: '作业', icon: 'el-icon-edit', color: '#F59E0B' },
        { type: 'digital-resource', label: '听力', icon: 'el-icon-microphone', color: '#3B82F6' },
        { type: 'video', label: '教学视频', icon: 'el-icon-video-camera', color: '#10B981' },
        { type: 'learning-case', label: '学案', icon: 'el-icon-reading', color: '#06B6D4' },
        { type: 'teaching-materials', label: '教辅材料', icon: 'el-icon-document', color: '#E67E22' },
        { type: 'custom-homework', label: '自定义作业', icon: 'el-icon-edit-outline', color: '#F97316' },
        { type: 'custom-paper', label: '自定义试卷', icon: 'el-icon-document-copy', color: '#8B5CF6' }
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
    this.loadSchoolBasedSeriesList(); // 加载系列列表
    this.getAllData();
  },
  computed: {
    // 判断是否为管理员
    isAdmin() {
      const roles = this.$store.getters.roles || []
      return roles.includes('admin')
    },
    // 判断是否显示 paperType 下拉框
    showPaperType() {
      const purpose = this.form.filePurpose
      return purpose === '教辅材料' || purpose === '自定义作业' || purpose === '自定义试卷'
    },
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
    // 校本资源库分类统计数据
    schoolBasedCategoryStats() {
      return this.categories.map(category => {
        let count = 0;
        if (this.schoolBasedAllData && Array.isArray(this.schoolBasedAllData)) {
          if (category.type === 'all') {
            // 全部类型显示所有文件数量
            count = this.schoolBasedAllData.length;
          } else {
            // 其他类型显示对应文件数量
            count = this.schoolBasedAllData.filter(item => 
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
    // 过滤后的校本资源库系列列表
    filteredSchoolBasedSeriesList() {
      if (!this.schoolBasedSeriesType || !this.schoolBasedSeriesList.length) {
        return this.schoolBasedSeriesList
      }
      
      return this.schoolBasedSeriesList.filter(series => {
        // 直接根据type字段匹配
        return series.type === this.schoolBasedSeriesType
      })
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
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.filterData();
    },

    // 分类过滤处理
    handleCategoryFilter(value) {
      this.categoryFilter = value;
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.filterData();
    },

    // 年级过滤处理
    handleGradeFilter(value) {
      this.gradeFilter = value;
      // 根据当前标签页重置对应的页码
      if (this.activeTab === 'resourceList') {
        this.queryParams.pageNum = 1;
        this.filterData();
      } else if (this.activeTab === 'schoolBased') {
        this.schoolBasedQueryParams.pageNum = 1;
        this.filterSchoolBasedData();
      }
    },

    // 搜索处理
    handleSearch() {
      // 重置页码到第一页
      this.queryParams.pageNum = 1;
      this.filterData();
    },

    // 过滤数据
    filterData() {
      let filteredData = [...this.allData];
      
      // 按分类过滤
      if (this.categoryFilter && this.categoryFilter !== '') {
        filteredData = filteredData.filter(item => 
          item && item.filePurpose === this.categoryFilter
        );
      }
      
      // 按年级过滤
      if (this.gradeFilter && this.gradeFilter !== '') {
        filteredData = filteredData.filter(item => 
          item && item.grade === this.gradeFilter
        );
      }
      
      // 按关键词搜索
      if (this.searchKeyword && this.searchKeyword.trim() !== '') {
        const keyword = this.searchKeyword.toLowerCase().trim();
        filteredData = filteredData.filter(item => 
          item && item.userFname && 
          item.userFname.toLowerCase().includes(keyword)
        );
      }
      
      // 分页处理
      const startIndex = (this.queryParams.pageNum - 1) * this.queryParams.pageSize;
      const endIndex = startIndex + this.queryParams.pageSize;
      this.knowledgeList = filteredData.slice(startIndex, endIndex);
      this.total = filteredData.length;
      
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
        subjectName: this.isAdmin ? null : this.getCurrentUserSubject(),
        grade: this.isAdmin ? null : (this.getUserGrade() || null),
        paperType: null
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
        this.categoryFilter = ''
        this.gradeFilter = ''
        this.searchKeyword = ''
        this.getAllData()
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
        
        // 确保年级字段正确显示
        if (!this.form.grade) {
          this.form.grade = this.getUserGrade() || null;
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
    
    // 标签页切换处理
    handleTabClick(tab) {
      if (tab.name === 'schoolBased') {
        this.loadSchoolBasedSeriesList(); // 加载系列列表
        this.getSchoolBasedAllData();
      }
    },
    
    // 获取校本资源库列表
    getSchoolBasedList() {
      this.schoolBasedLoading = true;
      getSchoolBasedList(this.schoolBasedQueryParams).then(response => {
        if (response.code === 200) {
          this.schoolBasedList = response.rows || [];
          this.schoolBasedTotal = response.total || 0;
        } else {
          this.$message.error('获取校本资源库失败：' + response.msg);
          this.schoolBasedList = [];
          this.schoolBasedTotal = 0;
        }
      }).catch(error => {
        this.$message.error('获取校本资源库失败：' + error.message);
        this.schoolBasedList = [];
        this.schoolBasedTotal = 0;
      }).finally(() => {
        this.schoolBasedLoading = false;
      });
    },
    
    // 获取校本资源库全部数据用于统计
    getSchoolBasedAllData() {
      this.schoolBasedLoading = true;
      // 获取所有数据，不分页，不应用任何筛选条件
      const params = {
        pageNum: 1,
        pageSize: 10000 // 设置一个很大的数字来获取所有数据
      };
      
      getSchoolBasedList(params).then(response => {
        if (response.code === 200) {
          this.schoolBasedAllData = response.rows || [];
          // 重置分页到第一页
          this.schoolBasedQueryParams.pageNum = 1;
          // 初始化显示数据
          this.filterSchoolBasedData();
        } else {
          this.$message.error('获取校本资源库失败：' + response.msg);
          this.schoolBasedAllData = [];
          this.filterSchoolBasedData();
        }
        this.schoolBasedLoading = false;
      }).catch(error => {
        this.$message.error('获取校本资源库失败：' + error.message);
        this.schoolBasedAllData = [];
        this.filterSchoolBasedData();
        this.schoolBasedLoading = false;
      });
    },
    
    // 点击校本资源库分类卡片处理
    handleSchoolBasedCategoryCardClick(category) {
      if (category.type === 'all') {
        this.schoolBasedCategoryFilter = '';
      } else {
        this.schoolBasedCategoryFilter = category.label;
      }
      // 重置页码到第一页
      this.schoolBasedQueryParams.pageNum = 1;
      this.filterSchoolBasedData();
    },

    // 校本资源库分类过滤处理
    handleSchoolBasedCategoryFilter(value) {
      this.schoolBasedCategoryFilter = value;
      // 重置页码到第一页
      this.schoolBasedQueryParams.pageNum = 1;
      this.filterSchoolBasedData();
    },

    // 校本资源库搜索处理
    handleSchoolBasedSearch() {
      // 重置页码到第一页
      this.schoolBasedQueryParams.pageNum = 1;
      this.filterSchoolBasedData();
    },

    // 处理校本资源库系列类型变化
    handleSchoolBasedSeriesTypeChange(seriesType) {
      this.schoolBasedSeriesType = seriesType
      // 清空系列选择，让用户重新选择
      this.schoolBasedSeries = null
      
      // 重新加载系列列表，并根据用户角色和学科进行过滤
      this.loadSchoolBasedSeriesList()
      
      // 重置页码到第一页
      this.schoolBasedQueryParams.pageNum = 1;
      // 重新过滤数据
      this.filterSchoolBasedData()
    },

    // 处理校本资源库系列变化
    handleSchoolBasedSeriesChange(seriesId) {
      this.schoolBasedSeries = seriesId
      
      // 清空系列路径，让用户重新选择
      this.schoolBasedSeriesPath = ''
      
      // 从系列列表中获取对应的系列信息
      const selectedSeries = this.schoolBasedSeriesList.find(item => item.id === seriesId)
      if (selectedSeries) {
        this.selectedSchoolBasedSeriesData = selectedSeries
        this.$message.info('请点击"选择章节路径"按钮选择具体的章节路径')
      }
      
      // 重置页码到第一页
      this.schoolBasedQueryParams.pageNum = 1;
      // 重新过滤数据
      this.filterSchoolBasedData()
    },

    // 打开校本资源库系列路径选择器
    openSchoolBasedSeriesPathSelector() {
      if (!this.schoolBasedSeries) {
        this.$message.warning('请先选择系列')
        return
      }
      
      const selectedSeries = this.schoolBasedSeriesList.find(item => item.id === this.schoolBasedSeries)
      if (selectedSeries) {
        this.selectedSchoolBasedSeriesData = selectedSeries
        this.schoolBasedSeriesPathDialogVisible = true
      } else {
        this.$message.error('未找到选中的系列信息')
      }
    },

    // 处理校本资源库系列路径选择确认
    handleSchoolBasedSeriesPathSelectionConfirm(data) {
      this.schoolBasedSeriesPath = data.seriesPath
      this.$message.success('系列路径已设置')
      
      // 重置页码到第一页
      this.schoolBasedQueryParams.pageNum = 1;
      // 重新过滤数据
      this.filterSchoolBasedData()
    },

    // 关闭校本资源库系列路径对话框
    handleSchoolBasedSeriesPathDialogClose() {
      this.schoolBasedSeriesPathDialogVisible = false
    },

    // 加载校本资源库系列列表
    async loadSchoolBasedSeriesList() {
      try {
        this.schoolBasedSeriesLoading = true
        const params = {
          pageNum: 1,
          pageSize: 1000
        }
        const response = await listSeries(params)
        if (response.code === 200) {
          let seriesList = response.rows || []
          
          // 根据用户角色和学科过滤系列列表
          seriesList = this.filterSeriesByUserRoleAndSubject(seriesList)
          
          this.schoolBasedSeriesList = seriesList
        } else {
          this.$message.error('加载系列列表失败: ' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('加载系列列表失败:', error)
        this.$message.error('加载系列列表失败: ' + error.message)
      } finally {
        this.schoolBasedSeriesLoading = false
      }
    },

    // 根据用户角色和学科过滤系列列表
    filterSeriesByUserRoleAndSubject(seriesList) {
      if (!seriesList || seriesList.length === 0) {
        return seriesList
      }

      // 获取用户角色信息
      const roles = this.$store.getters.roles || []
      const isAdmin = roles.includes('admin')
      
      // 如果是管理员，显示所有系列
      if (isAdmin) {
        return seriesList
      }

      // 非管理员用户，根据年级和学科过滤
      const userSubject = this.userSubject || this.getCurrentUserSubject()
      if (!userSubject) {
        console.warn('无法获取用户学科信息，显示所有系列')
        return seriesList
      }

      // 将用户学科转换为中文名称进行匹配
      const userSubjectName = this.convertCodeToSubject(userSubject)
      
      // 获取用户年级信息（从store或teacherInfo中获取）
      const userGrade = this.$store.getters.grade || this.getUserGrade()
      
      // 拼接年级和学科，如"高中数学"
      const userGradeSubject = userGrade ? `${userGrade}${userSubjectName}` : userSubjectName
      
      // 过滤系列列表，只显示用户对应年级和学科的系列
      const filteredSeries = seriesList.filter(series => {
        // 检查系列的学科名称是否与用户年级+学科匹配
        const seriesSubjectName = series.subjectName || series.subject_name
        if (!seriesSubjectName) {
          return false
        }
        
        // 支持多种匹配方式：完全匹配、包含匹配、反向包含匹配
        return seriesSubjectName === userGradeSubject ||
               seriesSubjectName.includes(userGradeSubject) || 
               userGradeSubject.includes(seriesSubjectName) ||
               // 也支持只匹配学科（兼容没有年级信息的情况）
               seriesSubjectName.includes(userSubjectName) ||
               userSubjectName.includes(seriesSubjectName)
      })

      return filteredSeries
    },

    // 过滤校本资源库数据
    filterSchoolBasedData() {
      let filteredData = [...this.schoolBasedAllData];
      
      // 按分类过滤
      if (this.schoolBasedCategoryFilter && this.schoolBasedCategoryFilter !== '') {
        filteredData = filteredData.filter(item => 
          item && item.filePurpose === this.schoolBasedCategoryFilter
        );
      }
      
      // 按关键词搜索
      if (this.schoolBasedSearchKeyword && this.schoolBasedSearchKeyword.trim() !== '') {
        const keyword = this.schoolBasedSearchKeyword.toLowerCase().trim();
        filteredData = filteredData.filter(item => 
          item && item.userFname && 
          item.userFname.toLowerCase().includes(keyword)
        );
      }
      
      // 按系列过滤
      if (this.schoolBasedSeries) {
        filteredData = filteredData.filter(item => 
          item && item.series && 
          item.series === this.schoolBasedSeries
        );
      }
      
      // 按系列路径过滤
      if (this.schoolBasedSeriesPath) {
        if (this.schoolBasedSeriesPath === 'ALL_CHAPTERS') {
          // 选择所有章节，不进行路径过滤，但确保是同一系列
        } else {
          // 选择具体路径，进行路径匹配
          filteredData = filteredData.filter(item => 
            item && item.directoryPath && 
            item.directoryPath.includes(this.schoolBasedSeriesPath)
          );
        }
      }
      
      // 分页处理
      const startIndex = (this.schoolBasedQueryParams.pageNum - 1) * this.schoolBasedQueryParams.pageSize;
      const endIndex = startIndex + this.schoolBasedQueryParams.pageSize;
      this.schoolBasedList = filteredData.slice(startIndex, endIndex);
      this.schoolBasedTotal = filteredData.length;
      
    },
    
    // 搜索校本资源库
    searchSchoolBased() {
      this.schoolBasedQueryParams.pageNum = 1;
      this.filterSchoolBasedData();
    },
    
    // 重置校本资源库查询条件
    resetSchoolBasedQuery() {
      this.schoolBasedCategoryFilter = '';
      this.schoolBasedSearchKeyword = '';
      this.schoolBasedSeriesType = '';
      this.schoolBasedSeries = null;
      this.schoolBasedSeriesPath = '';
      this.selectedSchoolBasedSeriesData = null;
      this.schoolBasedQueryParams = {
        pageNum: 1,
        pageSize: 10,
        userFname: '',
        fileType: '',
        knowledge: '',
        subjectName: '',
        filePurpose: '',
        hashtag: '',
        series: ''
      };
      this.getSchoolBasedAllData();
    },
    
    // 校本资源库分页处理
    handleSchoolBasedPagination(pageData) {
      this.schoolBasedQueryParams.pageNum = pageData.page;
      this.schoolBasedQueryParams.pageSize = pageData.limit;
      this.filterSchoolBasedData();
    },
    
    // 校本资源库文件下载
    handleSchoolBasedDownload(row) {
      const formData = { fileIdList: [row.fileId] };
      // 记录下载日志
      addLog({
        calledTableName: '校本资源库文件',
        calledTableId: row.fileId,
        isRead: 0,
        isClickRead: 0,
        isUsed: 1
      });
      downloadFiles1(formData).then(response => {
        this.handleDownloadResponse(response);
      }).catch(error => {
        this.handleDownloadError(error);
      });
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
  grid-template-columns: repeat(5, 1fr);
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
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
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