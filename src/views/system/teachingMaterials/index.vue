<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>教辅材料上传</h2>
      <p class="page-description">支持Word文档和PDF文档上传，自动解析生成题目内容</p>
    </div>


    <!-- Word文档上传 -->
    <el-card v-if="uploadType === 'word'" class="upload-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document header-icon"></i>
        <span class="header-title">Word文档上传</span>
        <span class="header-subtitle">支持.docx格式，自动转换为JSON格式</span>
      </div>

      <div class="upload-content">
        <div class="upload-type-selector">
          <el-radio-group v-model="uploadType" @change="handleUploadTypeChange">
            <el-radio-button label="word">Word文档上传</el-radio-button>
            <el-radio-button label="pdf">PDF文档上传</el-radio-button>
          </el-radio-group>
        </div>
        <!-- 学科选择和章节路径选择 -->


        <!-- 文件上传 -->
        <div class="form-section" style="display: flex">

          <el-upload
            ref="wordUpload"
            class="upload-dragger"
            drag
            :action="uploadAction"
            :headers="uploadHeaders"
            :data="wordUploadData"
            :before-upload="beforeWordUpload"
            :on-success="onWordUploadSuccess"
            :on-error="onWordUploadError"
            :on-change="handleWordFileChange"
            :file-list="wordFileList"
            :auto-upload="false"
            accept=".docx"
          >
            <i class="el-icon-upload"></i>
            <h3>上传Word文档</h3>
            <div class="el-upload__text">将Word文档拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传一个.docx文件，且不超过1000MB</div>
          </el-upload>
          <div class="form-section" style="align-content: center">
            <div class="form-row" style="display: block">
            <!-- 学科选择 -->
            <div class="form-item">
              <h3>选择学科</h3>
              <el-select v-model="wordForm.subject_name" placeholder="请选择学科" class="full-width" @change="handleSubjectChange">
                <el-option-group label="初中科目">
                  <el-option label="初中数学" value="初中数学"></el-option>
                  <el-option label="初中科学" value="初中科学"></el-option>
                  <el-option label="初中语文" value="初中语文"></el-option>
                  <el-option label="初中英语" value="初中英语"></el-option>
                  <el-option label="初中历史" value="初中历史"></el-option>
                  <el-option label="初中政治" value="初中政治"></el-option>
                  <el-option label="初中地理" value="初中地理"></el-option>
                </el-option-group>
                <el-option-group label="高中科目">
                  <el-option label="高中物理" value="高中物理"></el-option>
                  <el-option label="高中数学" value="高中数学"></el-option>
                  <el-option label="高中化学" value="高中化学"></el-option>
                  <el-option label="高中生物" value="高中生物"></el-option>
                  <el-option label="高中语文" value="高中语文"></el-option>
                  <el-option label="高中英语" value="高中英语"></el-option>
                  <el-option label="高中通用" value="高中通用"></el-option>
                  <el-option label="高中历史" value="高中历史"></el-option>
                  <el-option label="高中政治" value="高中政治"></el-option>
                  <el-option label="高中地理" value="高中地理"></el-option>
                  <el-option label="高中信息" value="高中信息"></el-option>
                </el-option-group>
              </el-select>
            </div>

            <!-- 章节路径选择 -->
              <div class="form-item" style="margin-top: 20px">
              <h3>选择章节路径</h3>
              <div class="chapter-selector">
                <el-button
                  type="primary"
                  plain
                  @click="openChapterSelector"
                  :disabled="!wordForm.subject_name"
                  class="chapter-select-button"
                >
                  <i class="el-icon-folder-opened"></i>
                  {{ wordForm.chapter_path || '点击选择章节路径' }}
                </el-button>
                <div v-if="wordForm.chapter_path" class="selected-path-display">
                  <el-tag type="success" size="small" closable @close="clearChapterPath">
                    {{ wordForm.chapter_path }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- 上传按钮 -->
        <div class="upload-actions">
          <el-button
            type="primary"
            size="large"
            :loading="wordUploading"
            :disabled="!wordForm.subject_name || !wordForm.chapter_path || wordFileList.length === 0"
            @click="handleWordUpload"
          >
            <i class="el-icon-upload"></i>
            {{ wordUploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- PDF文档上传 -->
    <el-card v-if="uploadType === 'pdf'" class="upload-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document header-icon"></i>
        <span class="header-title">PDF文档上传</span>
        <span class="header-subtitle">分别上传题目和解析文档</span>
      </div>

      <div class="upload-content">
        <div class="upload-type-selector">
          <el-radio-group v-model="uploadType" @change="handleUploadTypeChange">
            <el-radio-button label="word">Word文档上传</el-radio-button>
            <el-radio-button label="pdf">PDF文档上传</el-radio-button>
          </el-radio-group>
        </div>
        <div class="upload-layout">
          <!-- 左侧：上传区域 -->
          <div class="upload-left">
        <div class="pdf-upload-sections">
          <!-- 题目文档上传 -->
          <div class="pdf-section">
            <el-upload
              ref="questionUpload"
              class="upload-dragger"
              drag
              :action="uploadAction"
              :headers="uploadHeaders"
              :data="pdfQuestionUploadData"
              :before-upload="beforePdfUpload"
              :on-success="onPdfQuestionUploadSuccess"
              :on-error="onPdfUploadError"
              :on-change="handlePdfQuestionFileChange"
              :file-list="pdfQuestionFileList"
              :auto-upload="false"
              accept=".pdf"
            >
              <i class="el-icon-upload"></i>
                  <h3>题目文档</h3>
              <div class="el-upload__text">将题目PDF拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传一个.pdf文件，且不超过1000MB</div>
            </el-upload>
          </div>

          <!-- 解析文档上传 -->
          <div class="pdf-section">
            <el-upload
              ref="analysisUpload"
              class="upload-dragger"
              drag
              :action="uploadAction"
              :headers="uploadHeaders"
              :data="pdfAnalysisUploadData"
              :before-upload="beforePdfUpload"
              :on-success="onPdfAnalysisUploadSuccess"
              :on-error="onPdfUploadError"
              :on-change="handlePdfAnalysisFileChange"
              :file-list="pdfAnalysisFileList"
              :auto-upload="false"
              accept=".pdf"
            >
              <i class="el-icon-upload"></i>
                  <h3>解析文档</h3>
              <div class="el-upload__text">将解析PDF拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传一个.pdf文件，且不超过1000MB</div>
            </el-upload>
          </div>
        </div>

        <!-- 上传按钮 -->
        <div class="upload-actions">
          <el-button
            type="primary"
            size="large"
            :loading="pdfUploading"
            :disabled="pdfQuestionFileList.length === 0 || pdfAnalysisFileList.length === 0"
            @click="handlePdfUpload"
          >
            <i class="el-icon-upload"></i>
            {{ pdfUploading ? '上传中...' : '开始上传' }}
          </el-button>
            </div>
          </div>

          <!-- 右侧：队列显示 -->
          <div class="queue-right">
            <div class="queue-header">
              <h3>
                <i class="el-icon-time"></i>
                OCR解析队列
              </h3>
              <el-button
                size="mini"
                icon="el-icon-refresh"
                :loading="ocrQueueLoading"
                @click="loadOcrQueue"
              >
                刷新
              </el-button>
            </div>
            <div class="queue-content">
              <el-table
                :data="ocrQueueList"
                v-loading="ocrQueueLoading"
                stripe
                size="small"
                max-height="500"
                style="width: 100%;"
              >
<!--                <el-table-column prop="id" label="任务ID" width="100"></el-table-column>-->
                <el-table-column prop="taskStatus" label="状态" width="80" align="center">
                  <template slot-scope="scope">
                    <el-tag :type="getOcrTaskStatusType(scope.row)" size="small">
                      {{ getOcrTaskStatusText(scope.row) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="resourceUrl" label="资源" min-width="70" show-overflow-tooltip align="center">
                  <template slot-scope="scope">
                    <div v-if="getPairedResourceNames(scope.row).length > 0" class="resource-names">
                      <div
                        v-for="(name, index) in getPairedResourceNames(scope.row)"
                        :key="index"
                        class="resource-name-item"
                      >
                        <span class="resource-link">{{ name }}</span>
                      </div>
                    </div>
                    <span v-else-if="scope.row.resourceUrl" class="resource-link">
                      {{ getFileNameFromUrl(scope.row.resourceUrl) }}
                    </span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="150" align="center"></el-table-column>
                <el-table-column label="操作" width="200" fixed="right" align="center">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      size="mini"
                      icon="el-icon-edit"
                      @click="handleEditOcrTask(scope.row)"
                    >
                      修改
                    </el-button>
                    <el-button
                      type="danger"
                      size="mini"
                      icon="el-icon-delete"
                      @click="handleDeleteOcrTask(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <!-- 分页组件 -->
              <div class="ocr-queue-pagination">
                <el-pagination
                  @size-change="handleOcrQueueSizeChange"
                  @current-change="handleOcrQueueCurrentChange"
                  :current-page="ocrQueuePageNum"
                  :page-sizes="[2, 4, 6, 8]"
                  :page-size="ocrQueuePageSize / 2"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="ocrQueueTotal"
                  small
                >
                </el-pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="task-list-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-list header-icon"></i>
        <span class="header-title">任务列表</span>
        <el-button
          type="primary"
          size="small"
          :loading="taskListLoading"
          @click="loadTaskList"
        >
          <i class="el-icon-refresh"></i>
          刷新列表
        </el-button>
      </div>

      <el-table
        :data="taskList"
        v-loading="taskListLoading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="任务ID" width="80" align="center"></el-table-column>
        <el-table-column prop="taskType" label="任务类型" width="120" align="center"></el-table-column>
        <el-table-column prop="taskStatus" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTaskStatusType(scope.row.taskStatus)" size="small">
              {{ getTaskStatusText(scope.row.taskStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="taskProgress" label="任务进度" width="120" align="center">
          <template slot-scope="scope">
            <div class="task-progress-container">
              <el-tag :type="getTaskProgressType(scope.row.taskProgress)" size="small" style="margin: auto;">
                <span class="failure-reason-text">
                    {{ getTaskProgressText(scope.row.taskProgress) }}
                  </span>
                <!-- <el-tooltip :content="scope.row.taskProgress.failureReason" placement="top" effect="dark">
                </el-tooltip> -->
              </el-tag>
              <div v-if="scope.row.taskProgress && (scope.row.taskProgress.successCount !== undefined || scope.row.taskProgress.failureCount !== undefined)" class="progress-details">
                <span class="success-count">成功: {{ scope.row.taskProgress.successCount || 0 }}</span>
                <span class="failure-count">失败: {{ scope.row.taskProgress.failureCount || 0 }}</span>
              </div>
              <!-- <div v-if="scope.row.taskProgress && scope.row.taskProgress.failureReason && scope.row.taskProgress.failureReason.trim()" class="failure-reason">
                <el-tooltip :content="scope.row.taskProgress.failureReason" placement="top" effect="dark">
                  <span class="failure-reason-text">
                    <i class="el-icon-warning"></i>
                    失败原因: {{ scope.row.taskProgress.failureReason.length > 50 ? scope.row.taskProgress.failureReason.substring(0, 50) + '...' : scope.row.taskProgress.failureReason }}
                  </span>
                </el-tooltip>
              </div> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="uploadType !== 'pdf'" prop="resourceUrl" label="原始资源" min-width="200" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <a v-if="scope.row.resourceUrl" :href="scope.row.resourceUrl" target="_blank" class="resource-link">
              {{ getFileNameFromUrl(scope.row.resourceUrl) }}
            </a>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="newResourceUrl" label="生成资源" min-width="200" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.newResourceUrl">
              <div v-if="isJsonData(scope.row.newResourceUrl)" class="json-data-preview">
                <el-tag type="success" size="mini">JSON数据</el-tag>
                <span class="data-preview">{{ getJsonDataPreview(scope.row.newResourceUrl) }}</span>
              </div>
              <a v-else :href="scope.row.newResourceUrl" target="_blank" class="resource-link">
                {{ getFileNameFromUrl(scope.row.newResourceUrl) }}
              </a>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" align="center"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.taskStatus === 1 && isJsonData(scope.row.newResourceUrl)"
              type="primary"
              size="mini"
              @click="openQuestionEditor(scope.row)"
            >
              校验上传
            </el-button>
            <el-button
              v-if="scope.row.taskStatus === 1 && !isJsonData(scope.row.newResourceUrl)"
              type="info"
              size="mini"
              disabled
            >
              等待处理
            </el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDeleteTask(scope.row)"
              style="margin-left: 5px;"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleTaskListSizeChange"
          @current-change="handleTaskListCurrentChange"
          :current-page="taskListParams.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="taskListParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="taskListTotal"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 章节选择弹窗 -->
    <ChapterSelectorDialog
      :visible="chapterDialogVisible"
      :subject-name="wordForm.subject_name"
      @confirm="handleChapterSelectionConfirm"
      @close="handleChapterDialogClose"
    />

    <!-- 系列路径选择弹窗 -->
    <SeriesPathDialog
      :visible="seriesPathDialogVisible"
      :series-data="selectedSeriesData"
      @confirm="handleSeriesPathSelectionConfirm"
      @close="handleSeriesPathDialogClose"
    />

    <!-- 题目编辑弹窗 -->
    <QuestionEditorDialog
      :visible="questionEditorVisible"
      :questions="questions"
      :current-task-id="currentTaskId"
      :user-role="userRole"
      @close="handleQuestionEditorClose"
      @task-progress-update="handleTaskProgressUpdate"
    />

    <!-- 内容编辑弹窗 -->
    <ContentEditDialog
      :visible="editDialogVisible"
      :title="editDialogTitle"
      :content="editingContent"
      :placeholder="editPlaceholder"
      :edit-type="editDialogType"
      :question-data="currentQuestion"
      @confirm="handleEditDialogConfirm"
      @close="handleEditDialogClose"
      @content-change="handleEditContentChange"
    />

    <!-- Markdown文件编辑弹窗 -->
    <MarkdownEditDialog
      :visible="markdownEditDialogVisible"
      :title="markdownEditDialogTitle"
      :markdown-data="currentMarkdownData"
      @confirm="handleMarkdownEditConfirm"
      @close="handleMarkdownEditClose"
      @content-change="handleMarkdownContentChange"
      @refresh-task-list="loadTaskList"
    />

    <!-- 图片上传弹框已移至ContentEditDialog组件内部 -->
  </div>
</template>

<script>
import { addKnowledge, checkTaskStatus, getChapterTree, getTaskList, pdfParse, ocrParse,
  deleteTask, getTaskJson, uploadQuestion, updateTaskProgress, getKnowledgePoints } from "@/api/system/teachingMaterials"
import { listSeries } from "@/api/system/series"
import { getToken } from "@/utils/auth"
import { getInfo } from "@/api/login"
// getTeacherInfo, uploadImage 已移至ContentEditDialog组件
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import latexRenderer from '@/utils/latexRenderer'
import '@/assets/styles/latex-renderer.scss'
import { getQuestionTypes as getQuestionTypesFromUtils, getQuestionTypeCode, formatQuestionTypeOptions, getQuestionTypeByCode } from "@/utils/questionTypeMappings"
import draggable from 'vuedraggable'
import SymbolToolbar from '@/components/SymbolToolbar'
import ContentEditDialog from '@/components/Dialogs/ContentEditDialog'
import ChapterSelectorDialog from '@/components/Dialogs/ChapterSelectorDialog'
import SeriesPathDialog from '@/components/Dialogs/SeriesPathDialog'
import QuestionEditorDialog from '@/components/Dialogs/QuestionEditorDialog'
import MarkdownEditDialog from '@/components/Dialogs/MarkdownEditDialog'

export default {
  name: "TeachingMaterials",
  components: {
    mavonEditor,
    draggable,
    SymbolToolbar,
    ContentEditDialog,
    ChapterSelectorDialog,
    SeriesPathDialog,
    QuestionEditorDialog,
    MarkdownEditDialog
  },
  data() {
    return {
      userId: '',
      // 上传类型
      uploadType: 'word',

      // Word上传相关
      wordForm: {
        subject_name: '',
        chapter_path: ''
      },
      wordFileList: [],
      wordUploading: false,

      // PDF上传相关
      pdfQuestionFileList: [],
      pdfAnalysisFileList: [],
      pdfUploading: false,

      // OCR解析队列相关
      ocrQueueList: [],
      ocrQueueLoading: false,
      // 保存完整的OCR队列数据，用于状态判断
      ocrQueueFullData: [],
      // OCR队列分页相关
      ocrQueuePageNum: 1,
      ocrQueuePageSize: 4, // 每页获取4条原始数据，配对后显示2条
      ocrQueueTotal: 0,

      // 任务监控
      currentTaskId: null,
      currentTaskData: null,
      taskStatus: 'pending',
      checkingStatus: false,

      // 任务列表
      taskList: [],
      taskListLoading: false,
      showTaskList: true,
      taskListParams: {
        pageNum: 1,
        pageSize: 10
      },
      taskListTotal: 0,

      // 章节选择
      chapterDialogVisible: false,

      // 系列路径选择
      seriesPathDialogVisible: false,


      // mavon-editor配置
      toolbars: {
        bold: true,
        italic: true,
        header: true,
        underline: true,
        strikethrough: true,
        mark: true,
        superscript: true,
        subscript: true,
        quote: true,
        ol: true,
        ul: true,
        link: true,
        imagelink: false, // 禁用图片链接功能
        code: true,
        table: true,
        fullscreen: true,
        readmodel: true,
        htmlcode: true,
        help: true,
        undo: true,
        redo: true,
        trash: true,
        save: false,
        navigation: true,
        alignleft: true,
        aligncenter: true,
        alignright: true,
        subfield: true,
        preview: true
      },

      // 自定义工具栏按钮已移至ContentEditDialog组件

      // 上传配置
      uploadAction: process.env.VUE_APP_BASE_API + '/system/mqAi/wordToJson',
      uploadHeaders: {
        'Authorization': 'Bearer ' + getToken()
      },

      // 题目编辑相关
      questionEditorVisible: false,
      questions: [],
      currentQuestionIndex: '0',
      // questionEditing 已移至 ContentEditDialog 组件内部
      uploadingQuestions: false,
      availableKnowledgePoints: [],
      knowledgePointsLoading: false, // 知识点加载状态

      // 用户角色信息
      userRole: null, // 用户角色：0-老师，1-管理员，2-普通管理员

      // 拖拽相关
      draggingSubQuestion: false,

      // 题型选择相关
      questionTypes: [],
      questionTypesLoading: false,
      questionTypeOptions: [], // 格式化的题型选项

      // 新增参数相关
      availableTags: [],
      availableTopics: [], // 可用主题/话题列表
      availableSources: ['麓鸣上传'],
      seriesList: [],
      seriesLoading: false,

      // 系列类型选项
      seriesTypeOptions: [
        { label: '书', value: '书' },
        { label: '试卷', value: '试卷' },
        { label: '视频', value: '视频' }
      ],

      // 全局设置
      globalSettings: {
        series_type: '', // 系列类型：书/试卷/视频
        series: null,
        series_path: ''
      },

      // 编辑弹窗相关
      editDialogVisible: false,
      editDialogType: '', // question, analysis, options, answer
      editDialogTitle: '',
      editingContent: '',
      editPlaceholder: '',

      // Markdown编辑弹窗相关
      markdownEditDialogVisible: false,
      markdownEditDialogTitle: '',
      currentMarkdownData: null,
      pendingAnalysisMarkdownData: null, // 保存待查看的解析文档数据
      shouldRefreshTaskListOnClose: false, // 标记是否需要在弹窗关闭后刷新任务列表

      // 图片上传相关已移至ContentEditDialog组件

      // 题目编辑器工具栏配置已移至ContentEditDialog组件
    }
  },
  computed: {
    wordUploadData() {
      return {
        subject_name: this.wordForm.subject_name,
        path: this.wordForm.chapter_path
      }
    },
    currentQuestion() {
      console.log('计算currentQuestion:', {
        currentQuestionIndex: this.currentQuestionIndex,
        questionsLength: this.questions.length
      })

      // 检查是否是子题索引格式 "mainIndex-subIndex"
      if (this.currentQuestionIndex.includes('-')) {
        const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
        const mainQuestion = this.questions[mainIndex]
        if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
          const subQuestion = mainQuestion.children[subIndex]
          // 为子题添加父题目信息，并复用父题目的学科信息
          return {
            ...subQuestion,
            isMainQuestion: false,
            mainQuestionIndex: mainIndex,
            subQuestionIndex: subIndex,
            // 如果子题没有学科信息，复用父题目的学科信息
            subject_name: subQuestion.subject_name || mainQuestion.subject_name || mainQuestion.subject,
            parentQuestion: {
              question: mainQuestion.question,
              qtype: mainQuestion.qtype,
              subject: mainQuestion.subject,
              subject_name: mainQuestion.subject_name
            }
          }
        }
        return null
      } else {
        // 主题目
        const index = parseInt(this.currentQuestionIndex)
        const mainQuestion = this.questions[index]
        if (mainQuestion) {
          return {
            ...mainQuestion,
            isMainQuestion: true,
            mainQuestionIndex: index
          }
        }
        return null
      }
    },
    pdfQuestionUploadData() {
      return {
        type: 'question'
      }
    },
    pdfAnalysisUploadData() {
      return {
        type: 'analysis'
      }
    },
    // 根据系列类型过滤系列列表
    filteredSeriesList() {
      if (!this.globalSettings.series_type || !this.seriesList.length) {
        return this.seriesList
      }

      return this.seriesList.filter(series => {
        // 直接根据type字段匹配
        return series.type === this.globalSettings.series_type
      })
    },
    // 获取当前选择的系列数据
    selectedSeriesData() {
      if (!this.globalSettings.series || !this.seriesList.length) {
        return {}
      }

      return this.seriesList.find(item => item.id === this.globalSettings.series) || {}
    },
    // xssOptions已移至ContentEditDialog组件
  },
  mounted() {
    // 先获取用户角色，再加载对应的任务列表和系列列表
    this.getUserRole().then(() => {
      // 用户角色获取成功后，加载任务列表和系列列表
      this.loadTaskList()
      this.loadSeriesList()
      // 加载OCR解析队列
      this.loadOcrQueue()
    }).catch(error => {
      console.error('获取用户角色失败:', error)
      // 即使获取用户角色失败，也尝试加载任务列表（使用默认角色）
      this.loadTaskList()
      this.loadSeriesList()
      // 加载OCR解析队列
      this.loadOcrQueue()
    })

  },
  methods: {
    // 获取用户角色信息
    async getUserRole() {
      try {
        const response = await getInfo()
        if (response.code === 200 && response.user) {
          const roles = response.user.roles || []
          this.userId = response.user.userId
          // 根据角色判断用户类型
          if (roles.includes('admin')) {
            this.userRole = 1 // 管理员
          } else if (roles.includes('teacher')) {
            this.userRole = 0 // 老师
          } else {
            this.userRole = 2 // 普通管理员
          }
        } else {
          console.warn('获取用户信息失败，使用默认角色')
          this.userRole = 0 // 默认老师角色
        }
      } catch (error) {
        console.error('获取用户角色失败:', error)
        this.userRole = 0 // 默认老师角色
      }

      // 确保返回一个Promise，以便在then中继续执行
      return Promise.resolve()
    },

    // 获取题型列表
    loadQuestionTypes(subjectName) {
      if (!subjectName) {
        this.questionTypeOptions = []
        return
      }

      this.questionTypesLoading = true
      try {
        // 使用独立的题型映射工具函数
        const typeMapping = getQuestionTypesFromUtils(subjectName)
        if (typeMapping && Object.keys(typeMapping).length > 0) {
          this.questionTypes = typeMapping
          // 使用工具函数格式化题型数据为选项格式
          this.questionTypeOptions = formatQuestionTypeOptions(subjectName)
          console.log(`学科 ${subjectName} 的题型选项:`, this.questionTypeOptions)
        } else {
          console.warn(`未找到学科 ${subjectName} 的题型映射`)
          this.questionTypeOptions = []
          this.$message.warning(`暂不支持学科 ${subjectName} 的题型选择`)
        }
      } catch (error) {
        console.error('获取题型列表失败:', error)
        this.$message.error('获取题型列表失败，请稍后重试')
        this.questionTypeOptions = []
      } finally {
        this.questionTypesLoading = false
      }
    },

    // 处理学科变化
    handleSubjectChange(subjectName) {
      console.log('学科变化:', subjectName)
      // 清空章节路径
      this.wordForm.chapter_path = ''
      // 重新加载题型选项
      this.loadQuestionTypes(subjectName)

      // 如果选择了学科，自动打开章节选择弹窗
      if (subjectName) {
        this.openChapterSelectorWithSubject(subjectName)
      }
    },

    // 处理题型变化
    handleQuestionTypeChange(value) {
      console.log('题型变化:', value)
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            const subQuestion = mainQuestion.children[subIndex]
            subQuestion.qtype = value
            subQuestion.catename = value

            // 根据学科和题型更新cate字段
            const subjectName = subQuestion.subject_name
            if (subjectName && subjectName !== '未指定科目') {
              const cateValue = getQuestionTypeCode(subjectName, value)
              if (cateValue > 0) {
                subQuestion.cate = cateValue
                console.log(`子题题型更新 - 学科: ${subjectName}, 题型: ${value}, cate: ${cateValue}`)
              } else {
                console.warn(`未找到学科 ${subjectName} 的题型 ${value} 对应的cate值`)
                subQuestion.cate = 0 // 默认值
              }
            } else {
              console.warn(`子题学科未指定或无效: ${subjectName}`)
              subQuestion.cate = 0 // 默认值
            }

            // 可以根据题型变化做一些特殊处理
            this.handleQuestionTypeSpecificChanges(value, subQuestion)
          }
        } else {
          // 主题目：保存到原始数据结构中
          const index = parseInt(this.currentQuestionIndex)
          const mainQuestion = this.questions[index]
          if (mainQuestion) {
            mainQuestion.qtype = value
            mainQuestion.catename = value

            // 根据学科和题型更新cate字段
            const subjectName = mainQuestion.subject_name
            if (subjectName && subjectName !== '未指定科目') {
              const cateValue = getQuestionTypeCode(subjectName, value)
              if (cateValue > 0) {
                mainQuestion.cate = cateValue
                console.log(`主题题型更新 - 学科: ${subjectName}, 题型: ${value}, cate: ${cateValue}`)
              } else {
                console.warn(`未找到学科 ${subjectName} 的题型 ${value} 对应的cate值`)
                mainQuestion.cate = 0 // 默认值
              }
            } else {
              console.warn(`主题学科未指定或无效: ${subjectName}`)
              mainQuestion.cate = 0 // 默认值
            }

            // 可以根据题型变化做一些特殊处理
            this.handleQuestionTypeSpecificChanges(value, mainQuestion)
          }
        }
      }
    },

    // 处理题目学科变化
    handleQuestionSubjectChange(subjectName) {
      console.log('题目学科变化:', subjectName)
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            const subQuestion = mainQuestion.children[subIndex]
            subQuestion.subject_name = subjectName

            // 如果学科变化，重新加载题型选项
            this.loadQuestionTypes(subjectName)

            // 根据学科和当前题型更新cate字段
            if (subQuestion.qtype && subjectName && subjectName !== '未指定科目') {
              const cateValue = getQuestionTypeCode(subjectName, subQuestion.qtype)
              if (cateValue > 0) {
                subQuestion.cate = cateValue
                subQuestion.catename = subQuestion.qtype
                console.log(`子题学科更新 - 学科: ${subjectName}, 题型: ${subQuestion.qtype}, cate: ${cateValue}`)
              } else {
                console.warn(`未找到学科 ${subjectName} 的题型 ${subQuestion.qtype} 对应的cate值`)
                subQuestion.cate = 0 // 默认值
              }
            }
          }
        } else {
          // 主题目：保存到原始数据结构中
          const index = parseInt(this.currentQuestionIndex)
          const mainQuestion = this.questions[index]
          if (mainQuestion) {
            mainQuestion.subject_name = subjectName

            // 如果学科变化，重新加载题型选项
            this.loadQuestionTypes(subjectName)

            // 根据学科和当前题型更新cate字段
            if (mainQuestion.qtype && subjectName && subjectName !== '未指定科目') {
              const cateValue = getQuestionTypeCode(subjectName, mainQuestion.qtype)
              if (cateValue > 0) {
                mainQuestion.cate = cateValue
                mainQuestion.catename = mainQuestion.qtype
                console.log(`主题学科更新 - 学科: ${subjectName}, 题型: ${mainQuestion.qtype}, cate: ${cateValue}`)
              } else {
                console.warn(`未找到学科 ${subjectName} 的题型 ${mainQuestion.qtype} 对应的cate值`)
                mainQuestion.cate = 0 // 默认值
              }
            }
          }
        }
      }
    },

    // 根据题型进行特殊处理
    handleQuestionTypeSpecificChanges(questionType, questionObj = null) {
      const targetQuestion = questionObj || this.currentQuestion
      if (!targetQuestion) return

      // 根据不同的题型进行特殊处理
      if (questionType === '选择题' || questionType === '多选题') {
        // 选择题需要选项
        if (!targetQuestion.options || targetQuestion.options.length === 0) {
          targetQuestion.options = ['', '', '', '']
        }
      } else if (questionType === '填空题') {
        // 填空题可能需要特殊处理
        if (!targetQuestion.answers || targetQuestion.answers.length === 0) {
          targetQuestion.answers = ['']
        }
      }
    },

    // 处理上传类型变化
    handleUploadTypeChange(type) {
      console.log(this.uploadType);
      this.loadTaskList()
      this.resetUploadData()
    },

    // 重置上传数据
    resetUploadData() {
      this.wordFileList = []
      this.pdfQuestionFileList = []
      this.pdfAnalysisFileList = []
      this.wordForm.subject_name = ''
      this.wordForm.chapter_path = ''
      this.currentTaskId = null
      this.currentTaskData = null
      this.taskStatus = 'pending'
      // 清空系列相关字段
      this.globalSettings.series_type = ''
      this.globalSettings.series = null
      this.globalSettings.series_path = ''
    },

    // 打开章节选择器
    openChapterSelector() {
      if (!this.wordForm.subject_name) {
        this.$message.warning('请先选择学科')
        return
      }

      this.chapterDialogVisible = true
      this.$message.info('请选择章节路径')
    },

    // 根据学科打开章节选择器
    openChapterSelectorWithSubject(subjectName) {
      console.log('根据学科打开章节选择器:', subjectName)

      this.chapterDialogVisible = true
      this.$message.info(`请选择${subjectName}的章节路径`)
    },

    // 清除章节路径
    clearChapterPath() {
      this.wordForm.chapter_path = ''
      this.$message.info('已清除章节路径')
    },

    // 打开系列路径选择器
    openSeriesPathSelector() {
      if (!this.globalSettings.series) {
        this.$message.warning('请先选择系列')
        return
      }

      this.seriesPathDialogVisible = true

      this.$message.info('请选择系列路径')
    },

    // 清除系列路径**
    clearSeriesPath() {
      this.globalSettings.series_path = ''
      this.$message.info('已清除系列路径')
    },

    // Word上传前检查
    beforeWordUpload(file) {
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      const isLt1000M = file.size / 1024 / 1024 < 1000

      if (!isDocx) {
        this.$message.error('只能上传.docx格式的Word文档!')
        return false
      }
      if (!isLt1000M) {
        this.$message.error('上传文件大小不能超过 1000MB!')
        return false
      }
      return true
    },

    // PDF上传前检查
    beforePdfUpload(file) {
      const isPdf = file.type === 'application/pdf'
      const isLt1000M = file.size / 1024 / 1024 < 1000

      if (!isPdf) {
        this.$message.error('只能上传.pdf格式的PDF文档!')
        return false
      }
      if (!isLt1000M) {
        this.$message.error('上传文件大小不能超过 1000MB!')
        return false
      }
      return true
    },

    // 处理Word文件选择变化
    handleWordFileChange(file, fileList) {
      // 只保留最后一个文件，实现覆盖效果
      this.wordFileList = fileList.slice(-1)
    },

    // 处理PDF题目文件选择变化
    handlePdfQuestionFileChange(file, fileList) {
      // 只保留最后一个文件，实现覆盖效果
      this.pdfQuestionFileList = fileList.slice(-1)
    },

    // 处理PDF解析文件选择变化
    handlePdfAnalysisFileChange(file, fileList) {
      // 只保留最后一个文件，实现覆盖效果
      this.pdfAnalysisFileList = fileList.slice(-1)
    },

    // 处理Word上传
    handleWordUpload() {
      if (!this.wordForm.subject_name) {
        this.$message.error('请选择学科')
        return
      }
      if (!this.wordForm.chapter_path) {
        this.$message.error('请选择章节路径')
        return
      }
      if (this.wordFileList.length === 0) {
        this.$message.error('请选择要上传的Word文档')
        return
      }

      this.wordUploading = true
      this.$refs.wordUpload.submit()
    },

    // Word上传成功
    onWordUploadSuccess(response, file, fileList) {
      this.wordUploading = false
      if (response.code === 200) {
        this.currentTaskId = response.data
        this.taskStatus = 'processing'
        this.$message.success('Word文档上传成功，开始转换处理...')
        this.$message.info('请等待转换完成，可以点击"检查状态"查看进度')
        // 上传成功后自动刷新任务列表
        this.loadTaskList()
        // 清空上传表单数据和文件列表
        this.resetUploadData()
      } else {
        this.$message.error('上传失败：' + response.msg)
      }
    },

    // Word上传失败
    onWordUploadError(error) {
      this.wordUploading = false
      this.$message.error('上传失败：' + error.message)
    },

    // 处理PDF上传
    async handlePdfUpload() {
      if (this.pdfQuestionFileList.length === 0) {
        this.$message.error('请选择题目PDF文档')
        return
      }
      if (this.pdfAnalysisFileList.length === 0) {
        this.$message.error('请选择解析PDF文档')
        return
      }

      this.pdfUploading = true

      try {
        // 获取题目PDF文件
        const questionFile = this.pdfQuestionFileList[0].raw || this.pdfQuestionFileList[0]
        // 获取解析PDF文件
        const analysisFile = this.pdfAnalysisFileList[0].raw || this.pdfAnalysisFileList[0]

        // 生成UUID用于标识这一对文件
        const filePairUuid = crypto.randomUUID()
        console.log('生成的文件配对UUID:', filePairUuid)

        // 创建题目PDF的FormData
        const questionFormData = new FormData()
        questionFormData.append('file', questionFile)
        questionFormData.append('resourceUrl1', filePairUuid)

        // 创建解析PDF的FormData
        const analysisFormData = new FormData()
        analysisFormData.append('file', analysisFile)
        analysisFormData.append('resourceUrl1', filePairUuid)

        // 调用两次ocrParse接口
        const [questionResponse, analysisResponse] = await Promise.all([
          ocrParse(questionFormData),
          ocrParse(analysisFormData)
        ])

        // 提取文件ID（用于显示成功消息）
        let questionFileId = null
        let analysisFileId = null

        if (questionResponse && questionResponse.code === 200) {
          // data可能是ID数字，也可能是对象
          if (typeof questionResponse.data === 'number') {
            questionFileId = questionResponse.data
          } else if (questionResponse.data && typeof questionResponse.data === 'object') {
            questionFileId = questionResponse.data.id || questionResponse.data.fileId
          }
        }

        if (analysisResponse && analysisResponse.code === 200) {
          // data可能是ID数字，也可能是对象
          if (typeof analysisResponse.data === 'number') {
            analysisFileId = analysisResponse.data
          } else if (analysisResponse.data && typeof analysisResponse.data === 'object') {
            analysisFileId = analysisResponse.data.id || analysisResponse.data.fileId
          }
        }

        // 处理响应 - 适配多种数据格式
        // 格式1: {code: 200, data: {...}} - 标准格式
        // 格式2: {success: true, content: ..., markdown: ...} - 直接返回数据
        // 格式3: 直接返回数据对象

        // 提取实际数据 - 如果响应有data字段，使用data；否则使用响应本身
        let questionData = questionResponse
        let analysisData = analysisResponse

        // 如果响应是标准格式 {code: 200, data: {...}}
        if (questionResponse && questionResponse.code === 200 && questionResponse.data) {
          // 如果data是数字（文件ID），需要重新获取数据
          if (typeof questionResponse.data === 'number') {
            // data是文件ID，可能需要通过其他接口获取实际数据
            // 这里先使用响应本身，后续可能需要调用获取文件详情的接口
            questionData = questionResponse
          } else {
            questionData = questionResponse.data
          }
        }
        if (analysisResponse && analysisResponse.code === 200 && analysisResponse.data) {
          // 如果data是数字（文件ID），需要重新获取数据
          if (typeof analysisResponse.data === 'number') {
            analysisData = analysisResponse
          } else {
            analysisData = analysisResponse.data
          }
        }

        console.log('提取后的题目数据:', questionData)
        console.log('提取后的解析数据:', analysisData)

        // 判断是否成功 - 接口返回格式: {code: 200, data: 652, msg: "操作成功"}
        // 只要code是200就认为上传成功，data是文件ID
        const isQuestionSuccess = questionResponse && questionResponse.code === 200
        const isAnalysisSuccess = analysisResponse && analysisResponse.code === 200

        if (isQuestionSuccess && isAnalysisSuccess) {
          // this.$message.success(`PDF文档上传成功！题目文件ID: ${questionFileId}，解析文件ID: ${analysisFileId}`)

          // 上传成功后立即刷新OCR队列
          await this.loadOcrQueue()

          this.$message.info('文件已上传，请等待处理完成后查看结果')

          // 清空上传表单数据和文件列表
          this.resetUploadData()
        } else {
          // 错误处理 - 适配不同的错误格式
          const questionError = !isQuestionSuccess ? (
            questionResponse?.msg ||
            questionResponse?.message ||
            questionResponse?.error ||
            '题目PDF解析失败'
          ) : null

          const analysisError = !isAnalysisSuccess ? (
            analysisResponse?.msg ||
            analysisResponse?.message ||
            analysisResponse?.error ||
            '解析PDF解析失败'
          ) : null

          const errorMsg = questionError || analysisError || 'PDF解析失败'
          this.$message.error(errorMsg)
          console.error('PDF解析失败详情:', { questionResponse, analysisResponse })
        }
      } catch (error) {
        console.error('PDF解析失败:', error)
        this.$message.error('PDF解析失败：' + (error.message || '未知错误'))
      } finally {
        this.pdfUploading = false
      }
    },

    // PDF题目上传成功
    onPdfQuestionUploadSuccess(response, file, fileList) {
      if (response.code === 200) {
        // 题目上传成功后，上传解析文档
        this.$refs.analysisUpload.submit()
      } else {
        this.pdfUploading = false
        this.$message.error('题目文档上传失败：' + response.msg)
      }
    },

    // PDF解析上传成功
    onPdfAnalysisUploadSuccess(response, file, fileList) {
      this.pdfUploading = false
      if (response.code === 200) {
        this.currentTaskId = response.data
        this.taskStatus = 'processing'
        this.$message.success('PDF文档上传成功，开始转换处理...')
        this.$message.info('请等待转换完成，可以点击"检查状态"查看进度')
        // 上传成功后自动刷新任务列表
        this.loadTaskList()
        // 清空上传表单数据和文件列表
        this.resetUploadData()
      } else {
        this.$message.error('解析文档上传失败：' + response.msg)
      }
    },

    // PDF上传失败
    onPdfUploadError(error) {
      this.pdfUploading = false
      this.$message.error('上传失败：' + error.message)
    },

    // 检查任务状态
    async checkTaskStatus() {
      if (!this.currentTaskId) {
        this.$message.error('没有可检查的任务')
        return
      }

      this.checkingStatus = true
      try {
        const response = await checkTaskStatus(this.currentTaskId)
        if (response.code === 200) {
          const status = response.data.status
          this.taskStatus = status

          if (status === 1) {
            this.$message.success('任务处理成功！可以开始格式化JSON')
          } else if (status === 2) {
            this.$message.error('任务处理失败：' + (response.data.error || '未知错误'))
          } else if (status === 0) {
            this.$message.info('任务仍在处理中，请稍后再检查...')
          } else {
            this.$message.info('任务状态未知，请稍后再检查...')
          }
        } else {
          this.$message.error('检查任务状态失败：' + response.msg)
        }
      } catch (error) {
        this.$message.error('检查任务状态失败：' + error.message)
      } finally {
        this.checkingStatus = false
      }
    },

    // 获取任务状态类型
    getTaskStatusType(status) {
      const statusMap = {
        0: 'warning',   // 处理中
        1: 'success',   // 处理成功
        2: 'danger'     // 处理失败
      }
      return statusMap[status] || 'info'
    },

    // 获取任务状态文本
    getTaskStatusText(status) {
      const statusMap = {
        0: '处理中',
        1: '处理成功',
        2: '处理失败'
      }
      return statusMap[status] || '未知'
    },

    // 获取任务进度类型
    getTaskProgressType(progress) {
      // 处理progress对象或字符串
      let progressValue = ''
      if (typeof progress === 'object' && progress !== null) {
        progressValue = progress.taskProgress || ''
      } else {
        progressValue = progress || ''
      }

      const progressMap = {
        '未完成': 'warning',
        '已完成': 'success',
        '上传出错': 'danger'
      }
      return progressMap[progressValue] || 'info'
    },

    // 获取任务进度文本
    getTaskProgressText(progress) {
      // 处理progress对象或字符串
      if (typeof progress === 'object' && progress !== null) {
        return progress.taskProgress || '未完成'
      } else {
        return progress || '未完成'
      }
    },

    // 从URL中提取文件名
    getFileNameFromUrl(url) {
      if (!url) return '-'
      const parts = url.split('/')
      return parts[parts.length - 1] || url
    },

    // 判断是否为可选择的章节节点

    // 判断任务是否已响应（有JSON数据且已添加章节路径）**
    isTaskResponded(task) {
      if (!task.newResourceUrl) return false

      try {
        let data = task.newResourceUrl
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }

        // 检查是否是成功消息（表示文档解析完成但未添加章节路径）
        if (data && data.success && data.message) {
          console.log('检测到成功消息，但未添加章节路径:', data.message)
          return false
        }

        // 检查是否有题目数据（表示已添加章节路径）
        if (Array.isArray(data)) {
          return data.length > 0
        } else if (data && data.question_data && Array.isArray(data.question_data)) {
          return data.question_data.length > 0
        } else if (data && data.results && data.results.json_data && Array.isArray(data.results.json_data)) {
          return data.results.json_data.length > 0
        } else if (data && data.json_data && Array.isArray(data.json_data)) {
          return data.json_data.length > 0
        }

        return false
      } catch (e) {
        console.log('解析newResourceUrl失败:', e)
        return false
      }
    },

    // 判断任务是否已完成知识点选择（resourceUrl中的knowledge_points为一个）**
    isKnowledgePointsSelected(task) {
      // 新的判断逻辑：检查原始资源是否包含knowledge_points信息
      if (!task.resourceUrl) return false

      try {
        // 检查原始资源字符串是否包含knowledge_points
        const resourceStr = String(task.resourceUrl)
        if (resourceStr.includes('knowledge_points')) {
          console.log('检测到knowledge_points，任务:', task.id, '原始资源:', resourceStr.substring(0, 100) + '...')
          return true
        }

        // 如果原始资源中没有，再检查解析后的数据
        let data = task.resourceUrl
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }

        // 检查resourceUrl中是否有knowledge_points且为一个
        if (Array.isArray(data)) {
          // 如果是数组，检查每个题目是否都有knowledge_points且为一个
          return data.every(question => {
            return question.knowledge_points &&
              Array.isArray(question.knowledge_points) &&
              question.knowledge_points.length === 1
          })
        } else if (data && data.question_data && Array.isArray(data.question_data)) {
          // 检查question_data中的knowledge_points
          return data.question_data.every(question => {
            return question.knowledge_points &&
              Array.isArray(question.knowledge_points) &&
              question.knowledge_points.length === 1
          })
        } else if (data && data.results && data.results.json_data && Array.isArray(data.results.json_data)) {
          // 检查results.json_data中的knowledge_points
          return data.results.json_data.every(question => {
            return question.knowledge_points &&
              Array.isArray(question.knowledge_points) &&
              question.knowledge_points.length === 1
          })
        } else if (data && data.json_data && Array.isArray(data.json_data)) {
          // 检查json_data中的knowledge_points
          return data.json_data.every(question => {
            return question.knowledge_points &&
              Array.isArray(question.knowledge_points) &&
              question.knowledge_points.length === 1
          })
        }

        return false
      } catch (e) {
        console.log('解析resourceUrl失败:', e)
        return false
      }
    },

    // 判断是否为JSON数据
    isJsonData(data) {
      if (!data) return false
      try {
        // 如果是字符串，尝试解析
        if (typeof data === 'string') {
          const parsed = JSON.parse(data)
          // 检查是否是成功消息
          if (parsed && parsed.success && parsed.message) {
            return true // 显示为JSON数据，但实际是成功消息
          }
          return Array.isArray(parsed) || (parsed && typeof parsed === 'object')
        }
        // 如果已经是对象或数组
        return Array.isArray(data) || (data && typeof data === 'object')
      } catch (e) {
        return false
      }
    },

    // 获取JSON数据预览
    getJsonDataPreview(data) {
      if (!data) return '-'
      try {
        let parsed
        if (typeof data === 'string') {
          parsed = JSON.parse(data)
        } else {
          parsed = data
        }

        // 检查是否是成功消息
        if (parsed && parsed.success && parsed.message) {
          return '文档解析完成，等待校验上传'
        }

        if (Array.isArray(parsed)) {
          return `包含 ${parsed.length} 个题目`
        } else if (parsed && parsed.question_data && Array.isArray(parsed.question_data)) {
          return `包含 ${parsed.question_data.length} 个题目`
        } else if (parsed && parsed.results && parsed.results.json_data && Array.isArray(parsed.results.json_data)) {
          return `包含 ${parsed.results.json_data.length} 个题目`
        } else {
          return '文件解析失败'
        }
      } catch (e) {
        return '数据解析错误'
      }
    },


    // 加载任务列表
    async loadTaskList() {
      this.taskListLoading = true
      if(this.uploadType === 'pdf') {
        this.taskListParams.taskType = 'Markdown文本转JSON'
      } else if(this.uploadType === 'word') {
        this.taskListParams.taskType = 'word转json'
      }
      try {
        // 添加role参数
        const params = {
          ...this.taskListParams,
          role: this.userRole,
          taskType: this.taskListParams.taskType
        }
        const response = await getTaskList(params)

        if (response.code === 200) {
          let taskData = []
          let totalCount = 0

          // 处理不同的数据结构
          if (response.rows && Array.isArray(response.rows)) {
            // 如果response直接包含rows和total
            taskData = response.rows || []
            totalCount = response.total || 0
            console.log('数据结构: response.rows/total, 数据量:', taskData.length, '总数:', totalCount)
          }

          // 为每个任务添加默认的任务进度字段
          taskData = taskData.map(task => ({
            ...task,
            taskProgress: task.taskProgress || {
              id: null,
              taskTableId: task.id,
              taskProgress: '未完成',
              successCount: 0,
              failureCount: 0,
              failureReason: null,
              taskStatus: null,
              createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
              createBy: null,
              updateTime: null,
              updateBy: null,
              remark: null
            }
          }))

          this.taskList = taskData
          this.taskListTotal = totalCount

          // 根据数据情况显示不同的消息
          if (taskData.length > 0) {
            this.$message.success(`任务列表加载成功，共 ${totalCount} 条记录`)
          } else {
            this.$message.info('任务列表加载成功，暂无数据')
          }

          console.log('最终设置的数据:', { taskList: this.taskList, total: this.taskListTotal })
        } else {
          this.$message.error('加载任务列表失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('任务列表加载错误:', error) // 调试日志
        this.$message.error('加载任务列表失败：' + error.message)
      } finally {
        this.taskListLoading = false
      }
    },

    // 删除任务
    async handleDeleteTask(task) {
      try {
        await this.$confirm(`确定要删除任务 ID ${task.id} 吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.taskListLoading = true
        const response = await deleteTask(task.id)

        if (response.code === 200) {
          this.$message.success('任务删除成功')
          // 删除成功后刷新任务列表
          await this.loadTaskList()
        } else {
          this.$message.error('删除失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除任务失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      } finally {
        this.taskListLoading = false
      }
    },

    // 添加章节路径（第一步）**
    addChapterPath(task) {
      console.log('添加章节路径按钮被点击，任务数据:', task)
      this.currentTaskId = task.id
      this.taskStatus = task.taskStatus
      this.currentTaskData = task

      // 重置章节选择状态
      this.selectedChapterPath = ''
      this.selectedChapterData = null

      this.chapterDialogVisible = true
      console.log('设置弹窗可见:', this.chapterDialogVisible)

      // 弹窗打开时重新加载章节树数据（已组件化，无需手动加载）

      // 添加一个提示消息
      this.$message.info('请选择章节路径，完成后将发送到MQ进行响应')
    },

    // 选择知识点（第二步）


    // 处理分页大小变化
    handleTaskListSizeChange(val) {
      this.taskListParams.pageSize = val
      this.taskListParams.pageNum = 1
      this.loadTaskList()
    },

    // 处理当前页变化
    handleTaskListCurrentChange(val) {
      this.taskListParams.pageNum = val
      this.loadTaskList()
    },

    // 处理添加知识点**
    handleAddKnowledge() {
      console.log('处理添加知识点，当前任务ID:', this.currentTaskId)
      if (!this.currentTaskId) {
        this.$message.error('没有可用的任务数据')
        return
      }

      // 从任务列表中查找当前任务的数据
      const currentTask = this.taskList.find(task => task.id === this.currentTaskId)
      if (currentTask) {
        this.currentTaskData = currentTask
        console.log('找到任务数据:', currentTask)
      } else {
        this.$message.error('未找到任务数据')
        return
      }

      // 重置章节选择状态
      this.selectedChapterPath = ''
      this.selectedChapterData = null

      this.chapterDialogVisible = true
      console.log('设置弹窗可见:', this.chapterDialogVisible)

      // 弹窗打开时重新加载章节树数据（已组件化，无需手动加载）

      // 添加一个提示消息
      this.$message.info('请选择章节路径')
    },

    // 强制刷新章节树**
    refreshChapterTree() {
      this.$nextTick(() => {
        if (this.$refs.chapterTree) {
          this.$refs.chapterTree.$forceUpdate()
        }
      })
    },


    // 保留所有节点，包括叶子节点
    filterLastLevelNodes(nodes) {
      if (!Array.isArray(nodes)) return []

      return nodes.map(node => {
        // 如果节点有children，递归处理children
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const processedChildren = this.filterLastLevelNodes(node.children)
          // 保留这个节点，使用处理后的children
          return {
            ...node,
            children: processedChildren
          }
        }
        // 叶子节点也保留
        return node
      })
    },

    // 获取默认章节树数据
    getDefaultChapterTree() {
      return [
        {
          label: '高中物理',
          value: 'high_physics',
          children: [
            {
              label: '必修三',
              value: 'physics_3',
              children: [
                {
                  label: '第十二章电能能量守恒定律',
                  value: 'physics_3_12',
                  children: [
                    {
                      label: '2.闭合电路的欧姆定律',
                      value: 'physics_3_12_2'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: '高中数学',
          value: 'high_math',
          children: [
            {
              label: '必修一',
              value: 'math_1',
              children: [
                {
                  label: '第一章集合与函数概念',
                  value: 'math_1_1',
                  children: [
                    {
                      label: '1.1集合',
                      value: 'math_1_1_1'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    // 根据学科过滤章节树数据**
    filterChapterTreeBySubject(chapterData, subjectName) {
      if (!Array.isArray(chapterData) || !subjectName) {
        return chapterData
      }

      console.log('开始根据学科过滤章节数据:', subjectName)

      // 学科名称映射
      const subjectMapping = {
        '初中数学': { level: '初中', subject: '数学' },
        '初中科学': { level: '初中', subject: '科学' },
        '初中语文': { level: '初中', subject: '语文' },
        '初中英语': { level: '初中', subject: '英语' },
        '初中历史': { level: '初中', subject: '历史' },
        '初中政治': { level: '初中', subject: '政治' },
        '初中地理': { level: '初中', subject: '地理' },
        '高中数学': { level: '高中', subject: '数学' },
        '高中物理': { level: '高中', subject: '物理' },
        '高中化学': { level: '高中', subject: '化学' },
        '高中生物': { level: '高中', subject: '生物' },
        '高中语文': { level: '高中', subject: '语文' },
        '高中英语': { level: '高中', subject: '英语' },
        '高中通用': { level: '高中', subject: '通用' },
        '高中历史': { level: '高中', subject: '历史' },
        '高中政治': { level: '高中', subject: '政治' },
        '高中地理': { level: '高中', subject: '地理' },
        '高中信息': { level: '高中', subject: '信息' }
      }

      const targetMapping = subjectMapping[subjectName]
      if (!targetMapping) {
        console.log('未找到学科映射，返回原始数据')
        return chapterData
      }

      console.log('目标映射:', targetMapping)

      // 深度克隆数据以避免修改原始数据
      const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj
        if (obj instanceof Date) return new Date(obj.getTime())
        if (obj instanceof Array) return obj.map(item => deepClone(item))
        if (typeof obj === 'object') {
          const clonedObj = {}
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              clonedObj[key] = deepClone(obj[key])
            }
          }
          return clonedObj
        }
      }

      const clonedData = deepClone(chapterData)

      // 递归过滤函数 - 只保留目标年级和目标学科
      const filterNodes = (nodes) => {
        if (!Array.isArray(nodes)) return []

        return nodes.filter(node => {
          const nodeLabel = node.label || ''
          console.log('检查节点:', nodeLabel)

          // 检查是否是目标年级
          if (nodeLabel.includes(targetMapping.level)) {
            console.log('找到匹配的年级节点:', nodeLabel)
            // 如果是目标年级，检查其子节点中是否有目标学科
            if (node.children && node.children.length > 0) {
              const filteredChildren = node.children.filter(child => {
                const childLabel = child.label || ''
                console.log('检查年级子节点:', childLabel)
                return childLabel.includes(targetMapping.subject)
              })

              if (filteredChildren.length > 0) {
                // 如果找到目标学科，保留年级节点并更新其子节点
                node.children = filteredChildren
                console.log('保留年级节点及其目标学科子节点:', nodeLabel)
                return true
              }
            }
            return false
          }

          return false
        })
      }

      const filteredData = filterNodes(clonedData)
      console.log('过滤后的数据:', filteredData)
      return filteredData
    },

    // 根据学科获取默认章节树数据**
    getDefaultChapterTreeForSubject(subjectName) {
      const defaultTrees = {
        '初中数学': [
          {
            label: '初中数学',
            value: 'junior_math',
            children: [
              {
                label: '七年级',
                value: 'junior_math_7',
                children: [
                  {
                    label: '第一章 有理数',
                    value: 'junior_math_7_1',
                    children: [
                      {
                        label: '1.1 正数和负数',
                        value: 'junior_math_7_1_1'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        '高中数学': [
          {
            label: '高中数学',
            value: 'high_math',
            children: [
              {
                label: '必修一',
                value: 'math_1',
                children: [
                  {
                    label: '第一章集合与函数概念',
                    value: 'math_1_1',
                    children: [
                      {
                        label: '1.1集合',
                        value: 'math_1_1_1'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }

      return defaultTrees[subjectName] || this.getDefaultChapterTree()
    },

    // 自动展开对应学科的节点**
    autoExpandSubjectNode(subjectName) {
      console.log('开始自动展开学科节点:', subjectName)

      // 清空之前的展开状态
      this.expandedKeys = []

      // 学科名称映射
      const subjectMapping = {
        '初中数学': { level: '初中', subject: '数学' },
        '初中科学': { level: '初中', subject: '科学' },
        '初中语文': { level: '初中', subject: '语文' },
        '初中英语': { level: '初中', subject: '英语' },
        '初中历史': { level: '初中', subject: '历史' },
        '初中政治': { level: '初中', subject: '政治' },
        '初中地理': { level: '初中', subject: '地理' },
        '高中数学': { level: '高中', subject: '数学' },
        '高中物理': { level: '高中', subject: '物理' },
        '高中化学': { level: '高中', subject: '化学' },
        '高中生物': { level: '高中', subject: '生物' },
        '高中语文': { level: '高中', subject: '语文' },
        '高中英语': { level: '高中', subject: '英语' },
        '高中通用': { level: '高中', subject: '通用' },
        '高中历史': { level: '高中', subject: '历史' },
        '高中政治': { level: '高中', subject: '政治' },
        '高中地理': { level: '高中', subject: '地理' },
        '高中信息': { level: '高中', subject: '信息' }
      }

      const targetMapping = subjectMapping[subjectName]
      if (!targetMapping) {
        console.log('未找到学科映射')
        return
      }

      // 查找匹配的节点并收集需要展开的节点
      const findAndCollectExpandKeys = (nodes, parentKeys = []) => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]
          const currentKeys = [...parentKeys, node.value]

          // 检查是否是目标年级
          if (node.label && node.label.includes(targetMapping.level)) {
            console.log('找到匹配的年级节点，准备展开:', node.label)
            // 将年级节点添加到展开列表
            this.expandedKeys.push(node.value)

            // 继续查找该年级下的学科节点
            if (node.children && node.children.length > 0) {
              findAndCollectExpandKeys(node.children, currentKeys)
            }
            return true
          }

          // 检查是否是目标学科（在正确的年级下）
          if (node.label && node.label.includes(targetMapping.subject)) {
            console.log('找到匹配的学科节点，准备展开:', node.label)
            // 将路径上的所有节点都添加到展开列表中
            this.expandedKeys = [...this.expandedKeys, ...currentKeys]
            return true
          }

          if (node.children && node.children.length > 0) {
            if (findAndCollectExpandKeys(node.children, currentKeys)) {
              return true
            }
          }
        }
        return false
      }

      findAndCollectExpandKeys(this.chapterTreeData)

      console.log('需要展开的节点keys:', this.expandedKeys)
    },

    // 处理章节节点点击**
    handleChapterNodeClick(data, node) {
      console.log('章节节点被点击:', data)
      console.log('节点信息:', node)
      console.log('节点是否有子节点:', !!(data.children && data.children.length > 0))

      // 检查是否为可选择的节点（最多到章节级别，不能超过年级和必修）
      const isSelectableNode = this.isSelectableChapterNode(data)
      console.log('是否为可选择的章节节点:', isSelectableNode)

      if (isSelectableNode) {
        // 最多到章节级别的节点可以选择
        const path = this.buildChapterPath(data)
        console.log('构建的路径:', path)
        if (path) {
          this.selectedChapterPath = path
          this.selectedChapterData = data
          console.log('设置的章节路径:', this.selectedChapterPath)
          console.log('设置的章节数据:', this.selectedChapterData)
          this.$message.success('已选择章节：' + data.label)
        } else {
          console.error('路径构建失败')
          this.$message.error('路径构建失败')
        }
      } else {
        // 不可选择的节点，提示用户选择到合适的层级
        this.selectedChapterPath = ''
        this.selectedChapterData = null
        console.log('不可选择的节点，清空选择')

        const nodeLabel = data.label || ''
        let warningMessage = ''

        if (nodeLabel === '初中' || nodeLabel === '高中') {
          warningMessage = '年级级别（' + nodeLabel + '）不能选择，请选择具体的章节'
        } else {
          warningMessage = '当前选择的节点不可选择，请选择其他节点'
        }

        this.$message.warning(warningMessage)
      }
    },

    // 构建章节路径
    buildChapterPath(chapter) {
      console.log('构建章节路径，输入章节:', chapter)
      console.log('章节树数据:', this.chapterTreeData)

      const findPath = (options, targetValue, path = []) => {
        for (let opt of options) {
          const newPath = [...path, opt.label]
          if (opt.value === targetValue) return newPath.join('/')
          if (opt.children) {
            const found = findPath(opt.children, targetValue, newPath)
            if (found) return found
          }
        }
        return null
      }
      const chinesePath = findPath(this.chapterTreeData, chapter.value) || chapter.label
      console.log('找到的中文路径:', chinesePath)

      // 转换为英文路径格式
      const englishPath = this.convertToEnglishPath(chinesePath)
      console.log('转换后的英文路径:', englishPath)
      return englishPath
    },

    // 将中文路径转换为英文路径格式
    convertToEnglishPath(chinesePath) {
      if (!chinesePath) return ''

      // 科目映射表
      const subjectMap = {
        '物理': 'physics',
        '数学': 'math',
        '化学': 'chemistry',
        '生物': 'biology',
        '科学': 'science',
        '语文': 'chinese',
        '英语': 'english',
        '信息': 'tech',
        '通用': 'common',
        '历史': 'history',
        '政治': 'politics',
        '地理': 'geography',
        'python': 'python'
      }

      // 学段映射表
      const stageMap = {
        '高中': 'high',
        '初中': 'middle'
      }

      // 分割路径
      const pathParts = chinesePath.split('/')
      if (pathParts.length < 2) return chinesePath

      // 转换学段
      let stage = pathParts[0]
      if (stageMap[stage]) {
        stage = stageMap[stage]
      }

      // 转换科目
      let subject = pathParts[1]
      if (subjectMap[subject]) {
        subject = subjectMap[subject]
      }

      // 构建英文路径
      const englishPath = `./knowledge_tree/${stage}/${subject}/${pathParts.slice(2).join('/')}`

      console.log('路径转换:', {
        原始路径: chinesePath,
        转换后路径: englishPath,
        学段: pathParts[0] + ' -> ' + stage,
        科目: pathParts[1] + ' -> ' + subject
      })

      return englishPath
    },

    // 处理章节选择确认
    async handleChapterSelectionConfirm(chapterData) {
      console.log('章节选择确认:', chapterData)

      // 保存选择的章节路径到表单
      this.wordForm.chapter_path = chapterData.chapterPath
      this.$message.success('章节路径已选择：' + chapterData.chapterPath)

      // 如果是在上传表单中选择章节，直接返回
      if (!this.currentTaskData) {
        return
      }

      try {
        // 从当前任务数据中获取newResourceUrl
        if (!this.currentTaskData || !this.currentTaskData.newResourceUrl) {
          this.$message.error('未找到任务数据或生成资源')
          return
        }

        console.log('当前任务数据:', this.currentTaskData)
        console.log('newResourceUrl:', this.currentTaskData.newResourceUrl)

        // 解析newResourceUrl中的JSON数据
        let questionData = []
        let newResourceData = this.currentTaskData.newResourceUrl

        // 如果newResourceUrl是字符串，尝试解析
        if (typeof newResourceData === 'string') {
          try {
            newResourceData = JSON.parse(newResourceData)
          } catch (e) {
            console.warn('newResourceUrl不是有效的JSON字符串:', e)
            this.$message.error('生成资源数据格式错误')
            return
          }
        }

        // 根据不同的数据结构提取题目数据
        if (Array.isArray(newResourceData)) {
          questionData = newResourceData
        } else if (newResourceData && newResourceData.question_data && Array.isArray(newResourceData.question_data)) {
          questionData = newResourceData.question_data
        } else if (newResourceData && newResourceData.results && newResourceData.results.json_data && Array.isArray(newResourceData.results.json_data)) {
          questionData = newResourceData.results.json_data
        } else if (newResourceData && newResourceData.json_data && Array.isArray(newResourceData.json_data)) {
          questionData = newResourceData.json_data
        } else {
          console.warn('未找到预期的题目数据结构:', newResourceData)
          this.$message.error('未找到有效的题目数据')
          return
        }

        if (questionData.length === 0) {
          this.$message.error('题目数据为空')
          return
        }

        // 检查是否有知识点数据 - 更灵活的检查方式
        const hasKnowledgePoints = questionData.some(q => {
          // 检查多种可能的知识点字段名
          return (q.knowledge_points && q.knowledge_points.length > 0) ||
            (q.knowledgePoints && q.knowledgePoints.length > 0) ||
            (q.knowledge && q.knowledge.length > 0) ||
            (q.topics && q.topics.length > 0)
        })

        console.log('是否有知识点数据:', hasKnowledgePoints)
        console.log('题目数据详情:', questionData.map(q => ({
          question: q.question?.substring(0, 50) + '...',
          hasKnowledgePoints: !!(q.knowledge_points && q.knowledge_points.length > 0),
          hasKnowledgePointsAlt: !!(q.knowledgePoints && q.knowledgePoints.length > 0),
          hasKnowledge: !!(q.knowledge && q.knowledge.length > 0),
          hasTopics: !!(q.topics && q.topics.length > 0),
          knowledgePoints: q.knowledge_points,
          knowledgePointsAlt: q.knowledgePoints,
          knowledge: q.knowledge,
          topics: q.topics,
          confidence: q.confidence
        })))

        // 第一步：只发送章节路径到MQ进行响应
        console.log('发送章节路径到MQ进行响应')
        await this.sendChapterPathToMQ(questionData)
      } catch (error) {
        console.error('添加知识点过程出错:', error)
        this.$message.error('添加知识点失败：' + error.message)
      }
    },

    // 关闭章节选择弹窗
    handleChapterDialogClose() {
      this.chapterDialogVisible = false
    },

    // 加载系列路径树数据

    // 处理系列路径选择确认（组件回调）
    async handleSeriesPathSelectionConfirm(result) {
      if (!result || !result.seriesPath) {
        this.$message.warning('请选择系列路径')
        return
      }

      try {
        // 设置全局系列路径
        this.globalSettings.series_path = result.seriesPath

        console.log('确认选择的系列路径:', result.seriesPath)
        this.$message.success('系列路径选择成功：' + result.seriesPath)

        // 应用到所有题目
        this.applyGlobalSettingsToAllQuestions()

      } catch (error) {
        console.error('确认系列路径选择失败:', error)
        this.$message.error('确认系列路径选择失败：' + error.message)
      }
    },

    // 关闭系列路径选择弹窗
    handleSeriesPathDialogClose() {
      this.seriesPathDialogVisible = false
    },

    // 提取知识点数据

    // 发送章节路径到MQ进行响应
    async sendChapterPathToMQ(questionData) {
      try {
        // 构建请求数据，只包含章节路径
        const requestData = {
          question_data: questionData,
          path: this.selectedChapterPath
        }

        console.log('发送章节路径到MQ请求数据:', requestData)
        console.log('选择的章节路径:', this.selectedChapterPath)
        console.log('题目数量:', questionData.length)

        // 发送章节路径到MQ
        const response = await addKnowledge(requestData)

        if (response.code === 200) {
          this.$message.success('章节路径已发送到MQ，请等待响应完成后再进行知识点选择')
          this.chapterDialogVisible = false
          this.resetUploadData()
          // 刷新任务列表
          this.loadTaskList()
        } else {
          this.$message.error('章节路径发送失败：' + response.msg)
        }
      } catch (error) {
        console.error('发送章节路径到MQ失败:', error)
        this.$message.error('章节路径发送失败：' + error.message)
      }
    },

    // 发送知识点请求（第二步）**
    async sendKnowledgeRequest(questionData) {
      try {
        // 构建请求数据，不包含章节路径（因为已经在第一步处理了）
        const requestData = {
          question_data: questionData
        }

        console.log('发送知识点请求数据:', requestData)
        console.log('题目数量:', questionData.length)

        // 发送知识点请求
        const response = await addKnowledge(requestData)

        if (response.code === 200) {
          this.$message.success('知识点添加成功！')
          this.resetUploadData()
          // 刷新任务列表
          this.loadTaskList()
        } else {
          this.$message.error('知识点添加失败：' + response.msg)
        }
      } catch (error) {
        console.error('发送知识点请求失败:', error)
        this.$message.error('知识点添加失败：' + error.message)
      }
    },


    // 同步所有题目的cate和catename
    syncAllQuestionsCateAndCatename() {
      if (!this.questions || this.questions.length === 0) {
        console.warn('没有可同步的题目数据')
        return
      }

      this.questions.forEach((question, mainIndex) => {
        // 同步主题目
        if (question.subject_name && question.subject_name !== '未指定科目') {
          // 优先根据cate值映射到qtype和catename
          if (question.cate && question.cate > 0) {
            const qtypeFromCate = getQuestionTypeByCode(question.subject_name, question.cate)
            if (qtypeFromCate) {
              question.qtype = qtypeFromCate
              question.catename = qtypeFromCate
              console.log(`根据cate映射主题目 - 学科: ${question.subject_name}, cate: ${question.cate}, 题型: ${qtypeFromCate}`)
            }
          } else if (question.qtype) {
            // 如果没有cate但有qtype，则根据qtype设置cate
            const cateValue = getQuestionTypeCode(question.subject_name, question.qtype)
            if (cateValue > 0) {
              question.cate = cateValue
              question.catename = question.qtype
              console.log(`根据qtype设置主题目 - 学科: ${question.subject_name}, 题型: ${question.qtype}, cate: ${cateValue}`)
            }
          }
        }

        // 同步子题目
        if (question.children && question.children.length > 0) {
          question.children.forEach((subQuestion, subIndex) => {
            const subSubjectName = subQuestion.subject_name || question.subject_name
            if (subSubjectName && subSubjectName !== '未指定科目') {
              // 优先根据cate值映射到qtype和catename
              if (subQuestion.cate && subQuestion.cate > 0) {
                const subQtypeFromCate = getQuestionTypeByCode(subSubjectName, subQuestion.cate)
                if (subQtypeFromCate) {
                  subQuestion.qtype = subQtypeFromCate
                  subQuestion.catename = subQtypeFromCate
                  console.log(`根据cate映射子题目 - 学科: ${subSubjectName}, cate: ${subQuestion.cate}, 题型: ${subQtypeFromCate}`)
                }
              } else if (subQuestion.qtype) {
                // 如果没有cate但有qtype，则根据qtype设置cate
                const subCateValue = getQuestionTypeCode(subSubjectName, subQuestion.qtype)
                if (subCateValue > 0) {
                  subQuestion.cate = subCateValue
                  subQuestion.catename = subQuestion.qtype
                  console.log(`根据qtype设置子题目 - 学科: ${subSubjectName}, 题型: ${subQuestion.qtype}, cate: ${subCateValue}`)
                }
              }
            }
          })
        }
      })

      console.log('已同步所有题目的cate和catename')
    },

    // 同步编辑后的数据到currentQuestionData**
    syncEditedDataToCurrentQuestionData() {
      if (!this.questions || this.questions.length === 0) {
        console.warn('没有可同步的题目数据')
        return
      }

      // 先同步所有题目的cate和catename
      this.syncAllQuestionsCateAndCatename()

      // 将编辑后的questions数据同步到currentQuestionData
      this.currentQuestionData = this.questions.map(question => {
        const syncedQuestion = { ...question }

        // 确保cate和catename同步
        if (syncedQuestion.qtype && syncedQuestion.subject_name) {
          const cateValue = getQuestionTypeCode(syncedQuestion.subject_name, syncedQuestion.qtype)
          if (cateValue > 0) {
            syncedQuestion.cate = cateValue
            syncedQuestion.catename = syncedQuestion.qtype
            console.log(`同步数据 - 学科: ${syncedQuestion.subject_name}, 题型: ${syncedQuestion.qtype}, cate: ${cateValue}`)
          }
        }

        // 处理子题目
        if (syncedQuestion.children && syncedQuestion.children.length > 0) {
          syncedQuestion.children = syncedQuestion.children.map(subQuestion => {
            const syncedSubQuestion = { ...subQuestion }

            // 确保子题目的cate和catename同步
            if (syncedSubQuestion.qtype && syncedSubQuestion.subject_name) {
              const subCateValue = getQuestionTypeCode(syncedSubQuestion.subject_name, syncedSubQuestion.qtype)
              if (subCateValue > 0) {
                syncedSubQuestion.cate = subCateValue
                syncedSubQuestion.catename = syncedSubQuestion.qtype
                console.log(`同步子题目数据 - 学科: ${syncedSubQuestion.subject_name}, 题型: ${syncedSubQuestion.qtype}, cate: ${subCateValue}`)
              }
            }

            return syncedSubQuestion
          })
        }

        return syncedQuestion
      })

      console.log('已同步编辑后的数据到currentQuestionData')
    },

    // 确认知识点选择

    // 清理错误信息，移除长串ID
    cleanErrorMessage(errorMsg) {
      if (!errorMsg || typeof errorMsg !== 'string') {
        return errorMsg
      }

      // 如果是"题目已存在"类型的错误，只保留到"题目已存在"部分
      if (errorMsg.includes('题目已存在:')) {
        return errorMsg.split('题目已存在:')[0] + '题目已存在'
      }

      // 移除UUID格式的长串ID（包含多个连字符的长字符串）
      return errorMsg.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '')
        .replace(/[a-f0-9]{32,}/gi, '') // 移除32位以上的十六进制字符串
        .replace(/:\s*$/, '') // 移除末尾的冒号和空格
    },

    // 格式化题目数据以便上传
    // 转义字符串中的双引号
    escapeQuotes(str) {
      if (typeof str !== 'string') {
        return str
      }
      // 将双引号转义为 \"
      return str.replace(/"/g, "/quote_")
    },

    // 检查对象中是否包含双引号
    checkObjectForQuotes(obj) {
      if (!obj || typeof obj !== 'object') {
        return false
      }

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key]
          if (typeof value === 'string') {
            if (value.includes('"')) {
              return true
            }
          } else if (Array.isArray(value)) {
            // 检查数组中的字符串
            for (const item of value) {
              if (typeof item === 'string' && item.includes('"')) {
                return true
              } else if (typeof item === 'object' && item !== null && this.checkObjectForQuotes(item)) {
                return true
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            // 递归检查嵌套对象
            if (this.checkObjectForQuotes(value)) {
              return true
            }
          }
        }
      }
      return false
    },

    // 检查并转义对象中所有字符串字段的双引号
    escapeQuotesInObject(obj) {
      if (!obj || typeof obj !== 'object') {
        return obj
      }

      const escaped = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key]
          if (typeof value === 'string') {
            // 检查是否包含双引号
            if (value.includes('"')) {
              console.log(`发现双引号，正在转义字段 ${key}:`, value)
              escaped[key] = this.escapeQuotes(value)
              console.log(`转义后:`, escaped[key])
            } else {
              escaped[key] = value
            }
          } else if (Array.isArray(value)) {
            // 处理数组中的字符串
            escaped[key] = value.map(item => {
              if (typeof item === 'string') {
                if (item.includes('"')) {
                  console.log(`发现双引号，正在转义数组项 ${key}:`, item)
                  const escapedItem = this.escapeQuotes(item)
                  console.log(`转义后:`, escapedItem)
                  return escapedItem
                }
                return item
              } else if (typeof item === 'object' && item !== null) {
                return this.escapeQuotesInObject(item)
              }
              return item
            })
          } else if (typeof value === 'object' && value !== null) {
            // 递归处理嵌套对象
            escaped[key] = this.escapeQuotesInObject(value)
          } else {
            escaped[key] = value
          }
        }
      }
      return escaped
    },

    formatQuestionForUpload(originalQuestion) {
      console.log('原始题目数据:', originalQuestion)

      // 先转义所有字符串字段中的双引号
      const escapedQuestion = this.escapeQuotesInObject(originalQuestion)
      console.log('转义双引号后的题目数据:', escapedQuestion)

      // 特别检查question字段的转义情况
      if (originalQuestion.question && originalQuestion.question.includes('"')) {
        console.log('原始question包含双引号:', originalQuestion.question)
        console.log('转义后question:', escapedQuestion.question)
      }

      const formatted = {
        sid: escapedQuestion.sid || '', // 直接使用resourceUrl中的sid，不生成
        subject_name: escapedQuestion.subject || escapedQuestion.subject_name || '', // Subject改为subject_name
        level: escapedQuestion.level || '',
        question: escapedQuestion.question || '',
        options: escapedQuestion.options || [],
        qtype: escapedQuestion.qtype || '',
        subject_code: escapedQuestion.subject_code || '',
        cate: escapedQuestion.cate || '',
        catename: escapedQuestion.catename || '',
        label: escapedQuestion.label || '',
        // points选择整个knowledge_points数组
        points: escapedQuestion.knowledge_points || [],

        // knowledge_name选择第一个知识点
        knowledge_name: (escapedQuestion.knowledge_points && escapedQuestion.knowledge_points.length > 0)
          ? (typeof escapedQuestion.knowledge_points[0] === 'string'
            ? escapedQuestion.knowledge_points[0]
            : (escapedQuestion.knowledge_points[0].label || escapedQuestion.knowledge_points[0].name || ''))
          : '',

        path: escapedQuestion.path || '',
        answers: escapedQuestion.answers || [],
        displayanswer: escapedQuestion.displayanswer || (escapedQuestion.answers && escapedQuestion.answers.length > 0 ? escapedQuestion.answers.join(', ') : ''),
        degree: escapedQuestion.degree || 0.5,
        topic: escapedQuestion.topic || [],


        children: this.formatChildrenForUpload(escapedQuestion.children || []),
        Analyse: escapedQuestion.Analyse || '',
        Method: escapedQuestion.Method || '',
        Discuss: escapedQuestion.Discuss || '',
        Score: escapedQuestion.Score || 0, // 使用用户输入的分数，默认为空

        // 新增参数
        source: escapedQuestion.source || '麓鸣上传', // 上传方式
        // series_type: escapedQuestion.series_type || '书', // 系列类型
        series: escapedQuestion.series || 1, // 系列ID
        tags: escapedQuestion.tags || [], // 标签数组
        series_path: escapedQuestion.series_path || '测试系列的路径', // 系列路径

      }

      // 确保 options 是字符串数组
      if (formatted.options && !formatted.options.every(opt => typeof opt === 'string')) {
        formatted.options = formatted.options.map(opt => String(opt))
      }
      // 确保 answers 是字符串数组
      if (formatted.answers && !formatted.answers.every(ans => typeof ans === 'string')) {
        formatted.answers = formatted.answers.map(ans => String(ans))
      }

      // 确保必要字段不为空
      if (!formatted.question || formatted.question.trim() === '') {
        console.warn('题目内容为空:', formatted)
      }
      if (!formatted.sid || formatted.sid.trim() === '') {
        console.warn('题目ID为空:', formatted)
      }

      // 验证答案字段
      const hasAnswer = (formatted.displayanswer && formatted.displayanswer.trim()) ||
        (formatted.answers && formatted.answers.length > 0 && formatted.answers.some(ans => ans && ans.trim()))
      if (!hasAnswer) {
        console.warn('题目答案为空:', formatted)
        throw new Error('题目答案不能为空，请填写答案后再上传')
      }

      console.log('格式化后的题目数据:', formatted)
      return formatted
    },

    // 格式化子题数据用于上传，将question字段转换为content字段
    formatChildrenForUpload(children) {
      if (!children || !Array.isArray(children)) {
        return []
      }

      return children.map(child => {
        const formattedChild = { ...child }

        // 将question字段转换为content字段，参考菁优网格式
        if (formattedChild.question) {
          formattedChild.content = formattedChild.question
          // 保留question字段以兼容，但优先使用content
        }

        // 同步子题答案：当displayanswer有值但answers为null时，将displayanswer的值同步给answers
        if (formattedChild.displayanswer && formattedChild.displayanswer.trim() &&
          (!formattedChild.answers || formattedChild.answers === null ||
            (Array.isArray(formattedChild.answers) && formattedChild.answers.length === 0))) {
          // 如果displayanswer包含逗号分隔的多个答案，则分割成数组
          if (formattedChild.displayanswer.includes(',')) {
            formattedChild.answers = formattedChild.displayanswer.split(',').map(ans => ans.trim()).filter(ans => ans)
          } else {
            formattedChild.answers = [formattedChild.displayanswer]
          }
          console.log('子题答案同步：将displayanswer同步到answers', {
            displayanswer: formattedChild.displayanswer,
            answers: formattedChild.answers
          })
        }

        return formattedChild
      })
    },

    // 检查内容中是否包含选项**

    // 从任务列表中直接解析上传**
    async parseAndUploadFromTask(task) {
      console.log('从任务列表解析上传，任务数据:', task)

      if (!task || !task.resourceUrl) {
        this.$message.warning('没有可上传的题目数据')
        return
      }

      this.uploadingQuestions = true
      let successCount = 0
      let failCount = 0

      try {
        // 解析resourceUrl中的题目数据
        let questionData = []
        let resourceData = task.resourceUrl

        if (typeof resourceData === 'string') {
          try {
            resourceData = JSON.parse(resourceData)
          } catch (e) {
            console.warn('resourceUrl不是有效的JSON字符串:', e)
            this.$message.error('题目数据格式错误')
            return
          }
        }

        // 根据不同的数据结构提取题目数据
        if (Array.isArray(resourceData)) {
          questionData = resourceData
        } else if (resourceData && resourceData.question_data && Array.isArray(resourceData.question_data)) {
          questionData = resourceData.question_data
        } else if (resourceData && resourceData.results && resourceData.results.json_data && Array.isArray(resourceData.results.json_data)) {
          questionData = resourceData.results.json_data
        } else if (resourceData && resourceData.json_data && Array.isArray(resourceData.json_data)) {
          questionData = resourceData.json_data
        } else {
          this.$message.error('未找到有效的题目数据')
          return
        }

        if (questionData.length === 0) {
          this.$message.error('题目数据为空')
          return
        }

        const totalQuestions = questionData.length
        console.log(`开始上传 ${totalQuestions} 道题目`)

        // 先验证所有题目
        let validationErrors = []
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          try {
            this.formatQuestionForUpload(originalQuestion)
          } catch (error) {
            validationErrors.push(`题目 ${i + 1}: ${error.message}`)
          }
        }

        if (validationErrors.length > 0) {
          this.$message.error(`发现 ${validationErrors.length} 道题目有问题，无法上传：\n${validationErrors.join('\n')}`)
          this.uploadingQuestions = false
          return
        }

        // 一道题一道题上传
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          const formattedQuestion = this.formatQuestionForUpload(originalQuestion)

          console.log(`正在上传第 ${i + 1}/${totalQuestions} 题:`, formattedQuestion)

          try {
            console.log(`发送请求到API，数据:`, JSON.stringify(formattedQuestion, null, 2))
            const response = await uploadQuestion(formattedQuestion)
            console.log(`API响应:`, response)

            if (response.code === 200) {
              successCount++
              this.$message.success(`题目 ${i + 1} 上传成功！`)
            } else {
              failCount++
              console.error(`API返回错误:`, response)
              // 尝试获取详细的错误信息
              let errorMsg = '未知错误'
              if (response.msg) {
                errorMsg = response.msg
              } else if (response.message) {
                errorMsg = response.message
              } else if (response.detail) {
                errorMsg = response.detail
              } else if (response.data && response.data.msg) {
                errorMsg = response.data.msg
              } else if (response.data && response.data.detail) {
                errorMsg = response.data.detail
              }
              // 清理错误信息，移除长串ID
              errorMsg = this.cleanErrorMessage(errorMsg)
              this.$message.error(`题目 ${i + 1} 上传失败: ${errorMsg}`)
            }
          } catch (uploadError) {
            failCount++
            console.error(`上传题目 ${i + 1} 失败:`, uploadError)
            console.error(`错误详情:`, uploadError.response)
            // 尝试获取网络错误的详细信息
            let errorMsg = '网络错误'
            if (uploadError.message) {
              errorMsg = uploadError.message
            } else if (uploadError.response && uploadError.response.data) {
              if (uploadError.response.data.msg) {
                errorMsg = uploadError.response.data.msg
              } else if (uploadError.response.data.detail) {
                errorMsg = uploadError.response.data.detail
              } else if (uploadError.response.data.message) {
                errorMsg = uploadError.response.data.message
              }
            }
            // 清理错误信息，移除长串ID
            errorMsg = this.cleanErrorMessage(errorMsg)
            this.$message.error(`题目 ${i + 1} 上传异常: ${errorMsg}`)
          }
        }

        // 显示上传结果
        this.$alert(`共上传 ${totalQuestions} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
          confirmButtonText: '确定',
          type: successCount === totalQuestions ? 'success' : (failCount === totalQuestions ? 'error' : 'warning')
        })

      } catch (error) {
        console.error('解析上传题目过程中发生错误:', error)
        this.$message.error('解析上传题目过程中发生错误：' + error.message)
      } finally {
        this.uploadingQuestions = false
        this.loadTaskList() // 刷新任务列表
      }
    },

    // 解析并上传题目数据（第三步）**
    async parseAndUploadQuestions() {
      if (!this.currentTaskData || !this.currentTaskData.resourceUrl) {
        this.$message.warning('没有可上传的题目数据')
        return
      }

      this.uploadingQuestions = true
      let successCount = 0
      let failCount = 0

      try {
        // 解析resourceUrl中的题目数据
        let questionData = []
        let resourceData = this.currentTaskData.resourceUrl

        if (typeof resourceData === 'string') {
          try {
            resourceData = JSON.parse(resourceData)
          } catch (e) {
            console.warn('resourceUrl不是有效的JSON字符串:', e)
            this.$message.error('题目数据格式错误')
            return
          }
        }

        // 根据不同的数据结构提取题目数据
        if (Array.isArray(resourceData)) {
          questionData = resourceData
        } else if (resourceData && resourceData.question_data && Array.isArray(resourceData.question_data)) {
          questionData = resourceData.question_data
        } else if (resourceData && resourceData.results && resourceData.results.json_data && Array.isArray(resourceData.results.json_data)) {
          questionData = resourceData.results.json_data
        } else if (resourceData && resourceData.json_data && Array.isArray(resourceData.json_data)) {
          questionData = resourceData.json_data
        } else {
          this.$message.error('未找到有效的题目数据')
          return
        }

        if (questionData.length === 0) {
          this.$message.error('题目数据为空')
          return
        }

        const totalQuestions = questionData.length
        console.log(`开始上传 ${totalQuestions} 道题目`)

        // 先验证所有题目
        let validationErrors = []
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          try {
            this.formatQuestionForUpload(originalQuestion)
          } catch (error) {
            validationErrors.push(`题目 ${i + 1}: ${error.message}`)
          }
        }

        if (validationErrors.length > 0) {
          this.$message.error(`发现 ${validationErrors.length} 道题目有问题，无法上传：\n${validationErrors.join('\n')}`)
          this.uploadingQuestions = false
          return
        }

        // 一道题一道题上传
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          const formattedQuestion = this.formatQuestionForUpload(originalQuestion)

          console.log(`正在上传第 ${i + 1}/${totalQuestions} 题:`, formattedQuestion)

          try {
            console.log(`发送请求到API，数据:`, JSON.stringify(formattedQuestion, null, 2))
            const response = await uploadQuestion(formattedQuestion)
            console.log(`API响应:`, response)

            if (response.code === 200) {
              successCount++
              this.$message.success(`题目 ${i + 1} 上传成功！`)
            } else {
              failCount++
              console.error(`API返回错误:`, response)
              // 尝试获取详细的错误信息
              let errorMsg = '未知错误'
              if (response.msg) {
                errorMsg = response.msg
              } else if (response.message) {
                errorMsg = response.message
              } else if (response.detail) {
                errorMsg = response.detail
              } else if (response.data && response.data.msg) {
                errorMsg = response.data.msg
              } else if (response.data && response.data.detail) {
                errorMsg = response.data.detail
              }
              // 清理错误信息，移除长串ID
              errorMsg = this.cleanErrorMessage(errorMsg)
              this.$message.error(`题目 ${i + 1} 上传失败: ${errorMsg}`)
            }
          } catch (uploadError) {
            failCount++
            console.error(`上传题目 ${i + 1} 失败:`, uploadError)
            console.error(`错误详情:`, uploadError.response)
            // 尝试获取网络错误的详细信息
            let errorMsg = '网络错误'
            if (uploadError.message) {
              errorMsg = uploadError.message
            } else if (uploadError.response && uploadError.response.data) {
              if (uploadError.response.data.msg) {
                errorMsg = uploadError.response.data.msg
              } else if (uploadError.response.data.detail) {
                errorMsg = uploadError.response.data.detail
              } else if (uploadError.response.data.message) {
                errorMsg = uploadError.response.data.message
              }
            }
            // 清理错误信息，移除长串ID
            errorMsg = this.cleanErrorMessage(errorMsg)
            this.$message.error(`题目 ${i + 1} 上传异常: ${errorMsg}`)
          }
        }

        // 显示上传结果
        this.$alert(`共上传 ${totalQuestions} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
          confirmButtonText: '确定',
          type: successCount === totalQuestions ? 'success' : (failCount === totalQuestions ? 'error' : 'warning')
        })

      } catch (error) {
        console.error('解析上传题目过程中发生错误:', error)
        this.$message.error('解析上传题目过程中发生错误：' + error.message)
      } finally {
        this.uploadingQuestions = false
        this.showParseUploadButton = false // 上传完成后隐藏按钮
        this.resetUploadData() // 重置相关数据
        this.loadTaskList() // 刷新任务列表
      }
    },

    // 关闭知识点选择弹窗

    // ========== 校对编辑相关方法 ==========

    // JSON转Markdown**

    // 确保数据是字符串类型
    ensureString(data) {
      if (!data) return ''
      if (Array.isArray(data)) {
        return data.join('\n')
      }
      if (typeof data !== 'string') {
        return String(data)
      }
      return data
    },


    // 渲染数学公式
    renderMathFormulas(html) {
      return latexRenderer.renderMathFormulas(html)
    },

    // ========== 题目编辑相关方法 ==========

    // 处理题目数据，保持children结构
    processQuestions(questions) {
      const processed = []

      questions.forEach((question, index) => {
        // 处理主题目的cate映射
        const mainSubjectName = question.subject_name || question.subject
        let mainCate = question.cate
        let syncedCateName = question.catename || question.qtype

        // 优先根据cate值映射到qtype和catename
        if (mainCate && mainCate > 0 && mainSubjectName) {
          const qtypeFromCate = getQuestionTypeByCode(mainSubjectName, mainCate)
          if (qtypeFromCate) {
            syncedCateName = qtypeFromCate
            console.log(`主题目根据cate映射 - 学科: ${mainSubjectName}, cate: ${mainCate}, 题型: ${qtypeFromCate}`)
          } else {
            console.warn(`主题目cate映射失败 - 学科: ${mainSubjectName}, cate: ${mainCate}`)
          }
        } else if (syncedCateName && mainSubjectName) {
          // 如果没有cate但有catename/qtype，则根据qtype设置cate
          mainCate = getQuestionTypeCode(mainSubjectName, syncedCateName)
          if (mainCate > 0) {
            console.log(`主题目根据qtype设置cate - 学科: ${mainSubjectName}, 题型: ${syncedCateName}, cate: ${mainCate}`)
          } else {
            console.warn(`主题目qtype映射失败 - 学科: ${mainSubjectName}, 题型: ${syncedCateName}`)
            mainCate = 0
          }
        }

        // 处理主题目
        const mainQuestion = {
          ...question,
          // 确保cate字段有值
          cate: mainCate || 0,
          // 确保catename与qtype同步
          catename: syncedCateName,
          // 确保knowledge_points是数组
          knowledge_points: Array.isArray(question.knowledge_points) ? question.knowledge_points : (question.knowledge_points ? [question.knowledge_points] : []),
          // 确保confidence是数组
          confidence: Array.isArray(question.confidence) ? question.confidence : (question.confidence ? [question.confidence] : []),
          // 新增参数的默认值
          Score: question.Score || 0,
          score: question.score || question.Score || 0, // 确保小写score字段有默认值
          source: question.source || '麓鸣上传',
          series_type: question.series_type || this.globalSettings.series_type,
          series: question.series || this.globalSettings.series,
          tags: Array.isArray(question.tags) ? question.tags : (question.tags ? [question.tags] : []),
          series_path: question.series_path || this.globalSettings.series_path,
          // 添加层级标识
          isMainQuestion: true,
          mainQuestionIndex: index,
          subQuestionIndex: null,
          hasSubQuestions: question.children && question.children.length > 0,
          // 处理子题目，保持children结构
          children: question.children && question.children.length > 0 ?
            question.children.map((subQuestion, subIndex) => {
              // 处理子题目的cate映射
              const subSubjectName = subQuestion.subject_name || question.subject_name || question.subject
              let subCate = subQuestion.cate
              let syncedSubCateName = subQuestion.catename || subQuestion.qtype

              // 优先根据cate值映射到qtype和catename
              if (subCate && subCate > 0 && subSubjectName) {
                const subQtypeFromCate = getQuestionTypeByCode(subSubjectName, subCate)
                if (subQtypeFromCate) {
                  syncedSubCateName = subQtypeFromCate
                  console.log(`子题目根据cate映射 - 学科: ${subSubjectName}, cate: ${subCate}, 题型: ${subQtypeFromCate}`)
                } else {
                  console.warn(`子题目cate映射失败 - 学科: ${subSubjectName}, cate: ${subCate}`)
                }
              } else if (syncedSubCateName && subSubjectName) {
                // 如果没有cate但有catename/qtype，则根据qtype设置cate
                subCate = getQuestionTypeCode(subSubjectName, syncedSubCateName)
                if (subCate > 0) {
                  console.log(`子题目根据qtype设置cate - 学科: ${subSubjectName}, 题型: ${syncedSubCateName}, cate: ${subCate}`)
                } else {
                  console.warn(`子题目qtype映射失败 - 学科: ${subSubjectName}, 题型: ${syncedSubCateName}`)
                  subCate = 0
                }
              }

              return {
                ...subQuestion,
                // 确保cate字段有值
                cate: subCate || 0,
                // 确保catename与qtype同步
                catename: syncedSubCateName,
                // 将question字段转换为content字段，参考菁优网格式
                content: subQuestion.question || subQuestion.content || '',
                // 确保子题有学科信息，如果没有则从父题目继承
                subject_name: subSubjectName,
                // 确保knowledge_points是数组
                knowledge_points: Array.isArray(subQuestion.knowledge_points) ? subQuestion.knowledge_points : (subQuestion.knowledge_points ? [subQuestion.knowledge_points] : []),
                // 确保confidence是数组
                confidence: Array.isArray(subQuestion.confidence) ? subQuestion.confidence : (subQuestion.confidence ? [subQuestion.confidence] : []),
                // 新增参数的默认值
                Score: subQuestion.Score || 0,
                score: subQuestion.score || subQuestion.Score || 0, // 确保小写score字段有默认值
                source: subQuestion.source || '麓鸣上传',
                series_type: subQuestion.series_type || this.globalSettings.series_type,
                series: subQuestion.series || this.globalSettings.series,
                tags: Array.isArray(subQuestion.tags) ? subQuestion.tags : (subQuestion.tags ? [subQuestion.tags] : []),
                series_path: subQuestion.series_path || this.globalSettings.series_path,
                // 添加层级标识
                isMainQuestion: false,
                mainQuestionIndex: index,
                subQuestionIndex: subIndex,
                hasSubQuestions: false
              }
            }) : []
        }

        processed.push(mainQuestion)
      })

      return processed
    },

    // 打开题目编辑器
    openQuestionEditor(task) {
      console.log('打开题目编辑器，任务数据:', task)

      if (!task || (!task.newResourceUrl)) {
        this.$message.warning('没有可编辑的题目数据')
        return
      }

      // 设置当前任务ID
      this.currentTaskId = task.id
      this.currentTaskData = task
      console.log('设置当前任务ID:', this.currentTaskId)

      // 解析题目数据
      let questionData = []
      let resourceData = task.newResourceUrl

      if (typeof resourceData === 'string') {
        try {
          resourceData = JSON.parse(resourceData)
        } catch (e) {
          console.warn('newResourceUrl不是有效的JSON字符串:', e)
          this.$message.error('题目数据格式错误')
          return
        }
      }

      // 根据不同的数据结构提取题目数据
      if (Array.isArray(resourceData)) {
        questionData = resourceData
      } else if (resourceData && resourceData.question_data && Array.isArray(resourceData.question_data)) {
        questionData = resourceData.question_data
      } else if (resourceData && resourceData.results && resourceData.results.json_data && Array.isArray(resourceData.results.json_data)) {
        questionData = resourceData.results.json_data
      } else if (resourceData && resourceData.json_data && Array.isArray(resourceData.json_data)) {
        questionData = resourceData.json_data
      } else {
        this.$message.error('未找到有效的题目数据')
        return
      }

      if (questionData.length === 0) {
        this.$message.error('题目数据为空')
        return
      }

      // 处理题目数据，保持children结构
      const processedQuestions = this.processQuestions(questionData)

      // 设置题目数据
      this.questions = processedQuestions

      console.log('处理后的题目数据:', this.questions)
      console.log('第一道题目:', this.questions[0])

      // 同步所有题目的cate和catename
      this.syncAllQuestionsCateAndCatename()

      // 提取所有知识点
      this.extractAllKnowledgePoints(this.questions)

      // 显示编辑器
      this.questionEditorVisible = true
      this.currentQuestionIndex = '0'

      // 自动加载系列列表
      this.loadSeriesList()

      // 加载题型数据
      if (this.questions.length > 0 && this.questions[0].subject_name) {
        this.loadQuestionTypes(this.questions[0].subject_name)
      }

      // 初始化可用主题列表
      this.initAvailableTopics()

      console.log('编辑器状态:', {
        questionEditorVisible: this.questionEditorVisible,
        currentQuestionIndex: this.currentQuestionIndex,
        questionsLength: this.questions.length
      })

      this.$message.success(`已加载 ${this.questions.length} 道题目，可以开始编辑`)
    },

    // 提取所有知识点
    extractAllKnowledgePoints(questions) {
      const allPoints = new Set()
      questions.forEach(question => {
        if (question.knowledge_points && Array.isArray(question.knowledge_points)) {
          question.knowledge_points.forEach(point => allPoints.add(point))
        }
      })
      this.availableKnowledgePoints = Array.from(allPoints)
    },

    // 处理题目标签切换**
    handleQuestionTabClick(tab) {
      // 保存当前题目的分数修改
      this.saveCurrentQuestionScore()
      this.currentQuestionIndex = tab.name
      console.log('切换到题目:', tab.name)
    },

    // 处理分数变化
    handleScoreChange(value) {
      if (value !== null && value !== undefined) {
        // 立即保存分数到原始数据
        this.saveCurrentQuestionScore()
      }
    },

    // 保存当前题目的分数
    saveCurrentQuestionScore() {
      if (!this.currentQuestion) return

      // 统一使用score字段（小写）
      const score = this.currentQuestion.score

      if (score !== null && score !== undefined) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            // 更新子题分数
            mainQuestion.children[subIndex].score = score
            // 保持兼容性，同时更新Score字段
            mainQuestion.children[subIndex].Score = score
          }
        } else {
          // 主题目
          const index = parseInt(this.currentQuestionIndex)
          const mainQuestion = this.questions[index]
          if (mainQuestion) {
            // 更新主题目分数
            mainQuestion.score = score
            // 保持兼容性，同时更新Score字段
            mainQuestion.Score = score
          }
        }
      }
    },

    // 切换编辑模式

    // 重置题目内容
    resetQuestionContent() {
      if (this.currentQuestion) {
        // 这里可以从原始数据恢复，暂时简单处理
        this.$message.info('题目内容已重置')
      }
    },

    // 重置滚动条到顶部
    resetScrollToTop() {
      // 查找题目编辑区域的滚动容器
      const editSection = document.querySelector('.question-edit-section')
      if (editSection) {
        editSection.scrollTop = 0
      }

      // 如果题目编辑区域在弹窗中，也重置弹窗的滚动
      const dialogBody = document.querySelector('.el-dialog__body')
      if (dialogBody) {
        dialogBody.scrollTop = 0
      }
    },

    // 选择题目
    selectQuestion(index) {
      // 保存当前题目的分数修改
      this.saveCurrentQuestionScore()
      this.currentQuestionIndex = index.toString()
      // 重置滚动条到顶部
      this.$nextTick(() => {
        this.resetScrollToTop()
      })
      console.log('选择题目:', index + 1)
    },

    // 选择子题
    selectSubQuestion(mainIndex, subIndex) {
      // 保存当前题目的分数修改
      this.saveCurrentQuestionScore()
      this.currentQuestionIndex = `${mainIndex}-${subIndex}`

      // 确保子题目的分数有默认值
      const mainQuestion = this.questions[mainIndex]
      if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
        const subQuestion = mainQuestion.children[subIndex]
        if (subQuestion.score === undefined || subQuestion.score === null) {
          subQuestion.score = 0
        }
        if (subQuestion.Score === undefined || subQuestion.Score === null) {
          subQuestion.Score = 0
        }
      }

      // 重置滚动条到顶部
      this.$nextTick(() => {
        this.resetScrollToTop()
      })

      console.log('选择子题:', mainIndex + 1, subIndex + 1)
    },

    // 删除题目
    async deleteQuestion(index) {
      try {
        const question = this.questions[index]
        const questionTitle = `题目 ${question.mainQuestionIndex + 1}`

        await this.$confirm(
          `确定要删除 ${questionTitle} 吗？\n\n题目内容：${question.question.substring(0, 50)}...`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        )

        // 删除题目
        this.questions.splice(index, 1)

        // 重新计算索引
        this.questions.forEach((q, i) => {
          q.mainQuestionIndex = i
        })

        // 调整当前选中的题目
        if (parseInt(this.currentQuestionIndex) >= this.questions.length) {
          this.currentQuestionIndex = Math.max(0, this.questions.length - 1).toString()
        }

        this.$message.success('题目删除成功')
        console.log('删除题目后的列表:', this.questions)

      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除题目失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      }
    },

    // 删除子题
    async deleteSubQuestion(mainIndex, subIndex) {
      try {
        const mainQuestion = this.questions[mainIndex]
        const subQuestion = mainQuestion.children[subIndex]

        await this.$confirm(
          `确定要删除子题 ${mainIndex + 1}-${subIndex + 1} 吗？\n\n子题内容：${(subQuestion.content || subQuestion.question || '').substring(0, 50)}...`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        )

        // 删除子题
        mainQuestion.children.splice(subIndex, 1)

        // 更新子题索引
        mainQuestion.children.forEach((sub, index) => {
          sub.subQuestionIndex = index
        })

        // 更新主题目的子题数量标识
        mainQuestion.hasSubQuestions = mainQuestion.children.length > 0

        // 调整当前选中的题目
        if (this.currentQuestionIndex === `${mainIndex}-${subIndex}`) {
          this.currentQuestionIndex = mainIndex.toString()
        }

        this.$message.success('子题删除成功')
        console.log('删除子题后的列表:', this.questions)

      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除子题失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      }
    },

    // 生成随机sid
    generateRandomSid() {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      return `q_${timestamp}_${random}`
    },

    // 新增题目
    addNewQuestion() {
      // 从已有题目中获取学科信息
      const existingQuestion = this.getExistingQuestionInfo()

      const newQuestion = {
        sid: this.generateRandomSid(),
        subject_name: existingQuestion.subject_name || '未指定科目',
        question: '',
        qtype: existingQuestion.qtype || '选择题', // 使用已有题目的题型
        options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
        answers: ['A'],
        children: [],
        hasSubQuestions: false,
        mainQuestionIndex: this.questions.length,
        Score: 0, // 默认分数
        score: 0, // 默认分数（小写，用于模板绑定）
        Analyse: '',
        Method: '',
        Discuss: '',
        knowledge_points: [],
        source: '麓鸣上传',
        series: this.globalSettings.series || 1,
        series_path: this.globalSettings.series_path || '',
        tags: [],
        // 从已有题目获取学科相关信息
        level: existingQuestion.level || 'middle',
        subject_code: existingQuestion.subject_code || '',
        cate: existingQuestion.cate || '',
        catename: existingQuestion.catename || '',
        label: '',
        points: existingQuestion.points || [],
        knowledge_name: existingQuestion.knowledge_name || '',
        path: existingQuestion.path || '',
        displayanswer: 'A',
        degree: existingQuestion.degree || 0.5,
        topic: existingQuestion.topic || []
      }

      this.questions.push(newQuestion)
      this.currentQuestionIndex = (this.questions.length - 1).toString()
      // 初始化可用主题列表
      this.initAvailableTopics()
      this.$message.success('新增题目成功')
      console.log('新增题目:', newQuestion)
    },

    // 新增子题
    addSubQuestion() {
      if (!this.currentQuestion || this.currentQuestionIndex.includes('-')) {
        this.$message.warning('请先选择主题目')
        return
      }

      const mainIndex = parseInt(this.currentQuestionIndex)
      const mainQuestion = this.questions[mainIndex]

      // 确保children数组存在
      if (!mainQuestion.children) {
        mainQuestion.children = []
      }

      // 从已有题目中获取学科信息
      const existingQuestion = this.getExistingQuestionInfo()

      const newSubQuestion = {
        // 子题不需要sid
        subject_name: existingQuestion.subject_name || mainQuestion.subject_name,
        question: '',
        qtype: existingQuestion.qtype || mainQuestion.qtype || '选择题', // 使用已有题目的题型
        options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
        answers: ['A'],
        subQuestionIndex: mainQuestion.children.length,
        Score: 0, // 子题默认分数
        score: 0, // 子题默认分数（小写，用于模板绑定）
        Analyse: '',
        Method: '',
        Discuss: '',
        knowledge_points: [],
        source: '麓鸣上传',
        series: mainQuestion.series || this.globalSettings.series || 1,
        series_path: mainQuestion.series_path || this.globalSettings.series_path || '',
        tags: [],
        // 从已有题目获取学科相关信息
        level: existingQuestion.level || mainQuestion.level || 'middle',
        subject_code: existingQuestion.subject_code || mainQuestion.subject_code || '',
        cate: existingQuestion.cate || mainQuestion.cate || '',
        catename: existingQuestion.catename || mainQuestion.catename || '',
        label: '',
        points: existingQuestion.points || mainQuestion.points || [],
        knowledge_name: existingQuestion.knowledge_name || mainQuestion.knowledge_name || '',
        path: existingQuestion.path || mainQuestion.path || '',
        displayanswer: 'A',
        degree: existingQuestion.degree || mainQuestion.degree || 0.5,
        topic: existingQuestion.topic || mainQuestion.topic || []
      }

      mainQuestion.children.push(newSubQuestion)
      mainQuestion.hasSubQuestions = true

      // 选中新创建的子题
      this.currentQuestionIndex = `${mainIndex}-${mainQuestion.children.length - 1}`
      this.$message.success('新增子题成功')
      console.log('新增子题:', newSubQuestion)
    },

    // 从已有题目中获取学科信息
    getExistingQuestionInfo() {
      // 优先从当前选中的题目获取信息
      if (this.currentQuestion) {
        return {
          subject_name: this.currentQuestion.subject_name,
          qtype: this.currentQuestion.qtype,
          level: this.currentQuestion.level,
          subject_code: this.currentQuestion.subject_code,
          cate: this.currentQuestion.cate,
          catename: this.currentQuestion.catename,
          label: this.currentQuestion.label,
          points: this.currentQuestion.points,
          knowledge_name: this.currentQuestion.knowledge_name,
          path: this.currentQuestion.path,
          degree: this.currentQuestion.degree,
          topic: this.currentQuestion.topic
        }
      }

      // 如果没有当前题目，从题目列表中获取第一个题目的信息
      if (this.questions.length > 0) {
        const firstQuestion = this.questions[0]
        return {
          subject_name: firstQuestion.subject_name,
          qtype: firstQuestion.qtype,
          level: firstQuestion.level,
          subject_code: firstQuestion.subject_code,
          cate: firstQuestion.cate,
          catename: firstQuestion.catename,
          label: firstQuestion.label,
          points: firstQuestion.points,
          knowledge_name: firstQuestion.knowledge_name,
          path: firstQuestion.path,
          degree: firstQuestion.degree,
          topic: firstQuestion.topic
        }
      }

      // 如果没有任何题目，返回默认值
      return {
        subject_name: '未指定科目',
        qtype: '选择题',
        level: '中等',
        subject_code: '',
        cate: '',
        catename: '',
        label: '',
        points: [],
        knowledge_name: '',
        path: '',
        degree: 0.5,
        topic: []
      }
    },

    // 在指定位置插入子题
    insertSubQuestion(mainIndex, insertIndex) {
      if (!this.currentQuestion || this.currentQuestionIndex.includes('-')) {
        this.$message.warning('请先选择主题目')
        return
      }

      const mainQuestion = this.questions[mainIndex]

      // 确保children数组存在
      if (!mainQuestion.children) {
        mainQuestion.children = []
      }

      // 从已有题目中获取学科信息
      const existingQuestion = this.getExistingQuestionInfo()

      const newSubQuestion = {
        // 子题不需要sid
        subject_name: existingQuestion.subject_name || mainQuestion.subject_name,
        question: '',
        qtype: existingQuestion.qtype || mainQuestion.qtype || '选择题', // 使用已有题目的题型
        options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
        answers: ['A'],
        subQuestionIndex: insertIndex,
        Score: 0, // 子题默认分数（大写，兼容旧版本）
        score: 0, // 子题默认分数（小写，新版本）
        Analyse: '',
        Method: '',
        Discuss: '',
        knowledge_points: [],
        source: '麓鸣上传',
        series: mainQuestion.series || this.globalSettings.series || 1,
        series_path: mainQuestion.series_path || this.globalSettings.series_path || '',
        tags: [],
        // 从已有题目获取学科相关信息
        level: existingQuestion.level || mainQuestion.level || 'middle',
        subject_code: existingQuestion.subject_code || mainQuestion.subject_code || '',
        cate: existingQuestion.cate || mainQuestion.cate || '',
        catename: existingQuestion.catename || mainQuestion.catename || '',
        label: '',
        points: existingQuestion.points || mainQuestion.points || [],
        knowledge_name: existingQuestion.knowledge_name || mainQuestion.knowledge_name || '',
        path: existingQuestion.path || mainQuestion.path || '',
        displayanswer: 'A',
        degree: existingQuestion.degree || mainQuestion.degree || 0.5,
        topic: existingQuestion.topic || mainQuestion.topic || []
      }

      // 在指定位置插入子题
      mainQuestion.children.splice(insertIndex, 0, newSubQuestion)
      mainQuestion.hasSubQuestions = true

      // 更新所有子题的索引
      this.updateSubQuestionIndexes(mainIndex)

      // 选中新创建的子题
      this.currentQuestionIndex = `${mainIndex}-${insertIndex}`
      this.$message.success('插入子题成功')
      console.log('插入子题:', newSubQuestion)
    },

    // 更新子题索引
    updateSubQuestionIndexes(mainIndex) {
      const mainQuestion = this.questions[mainIndex]
      if (mainQuestion.children) {
        mainQuestion.children.forEach((subQuestion, index) => {
          subQuestion.subQuestionIndex = index
        })
      }
    },

    // 子题拖拽开始
    onSubQuestionDragStart(evt) {
      console.log('子题拖拽开始:', evt.oldIndex)
      this.draggingSubQuestion = true
    },

    // 子题拖拽结束
    onSubQuestionDragEnd(mainIndex) {
      console.log('子题拖拽结束')
      this.draggingSubQuestion = false

      // 更新子题索引
      this.updateSubQuestionIndexes(mainIndex)

      // 更新当前选中的子题索引
      if (this.currentQuestionIndex.includes('-')) {
        const [mainIdx, subIdx] = this.currentQuestionIndex.split('-').map(Number)
        if (mainIdx === mainIndex) {
          // 如果当前选中的是正在拖拽的主题目的子题，需要重新计算索引
          // 这里可以根据需要实现更复杂的索引更新逻辑
        }
      }

      this.$message.success('子题顺序已更新')
    },

    // 从系列信息获取学科名称**
    getSubjectFromSeries() {
      if (this.globalSettings.series_type) {
        return this.globalSettings.series_type
      }
      return '未指定科目'
    },

    // 处理主题/话题变化
    handleTopicChange(selectedTopics) {
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion.children && mainQuestion.children[subIndex]) {
            mainQuestion.children[subIndex].topic = selectedTopics
          }
        } else {
          // 主题目：直接保存
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.questions[index].topic = selectedTopics
          }
        }
        console.log('主题/话题已更新:', selectedTopics)
      }
    },

    // 处理难度系数变化
    handleDegreeChange(degree) {
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion.children && mainQuestion.children[subIndex]) {
            this.$set(mainQuestion.children[subIndex], 'degree', degree)
          }
        } else {
          // 主题目：直接保存
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.$set(this.questions[index], 'degree', degree)
          }
        }
        console.log('难度系数已更新:', degree)
      }
    },

    // 处理标签变化
    handleLabelChange(value) {
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion.children && mainQuestion.children[subIndex]) {
            mainQuestion.children[subIndex].label = value
          }
        } else {
          // 主题目：直接保存
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.questions[index].label = value
          }
        }
        console.log('标签已更新:', value)
      }
    },

    // 处理标签实时输入变化
    handleLabelInput(value) {
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion.children && mainQuestion.children[subIndex]) {
            mainQuestion.children[subIndex].label = value
          }
        } else {
          // 主题目：直接保存
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.questions[index].label = value
          }
        }
      }
    },

    // 格式化难度系数提示
    formatDegreeTooltip(value) {
      if (value <= 0.3) {
        return `困难 (${value})`
      } else if (value <= 0.7) {
        return `中等 (${value})`
      } else {
        return `简单 (${value})`
      }
    },

    // 初始化可用主题/话题列表
    initAvailableTopics() {
      // 从已有题目中提取所有主题/话题
      const allTopics = new Set()
      this.questions.forEach(question => {
        if (question.topic && Array.isArray(question.topic)) {
          question.topic.forEach(topic => {
            if (topic && topic.trim()) {
              allTopics.add(topic.trim())
            }
          })
        }
        // 也检查子题
        if (question.children && Array.isArray(question.children)) {
          question.children.forEach(subQuestion => {
            if (subQuestion.topic && Array.isArray(subQuestion.topic)) {
              subQuestion.topic.forEach(topic => {
                if (topic && topic.trim()) {
                  allTopics.add(topic.trim())
                }
              })
            }
          })
        }
      })
      this.availableTopics = Array.from(allTopics)
      // console.log('初始化可用主题/话题列表:', this.availableTopics)
    },

    // 处理知识点变化
    handleKnowledgePointsChange(selectedPoints) {
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            mainQuestion.children[subIndex].knowledge_points = selectedPoints
          }
        } else {
          // 主题目：保存到原始数据结构中
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.questions[index].knowledge_points = selectedPoints
          }
        }
        console.log('知识点已更新:', selectedPoints)
      }
    },

    // 处理知识点下拉框焦点事件
    async handleKnowledgePointsFocus() {
      console.log('知识点下拉框获得焦点')

      // 获取当前题目的学科信息
      let subjectName = null
      if (this.currentQuestion && this.currentQuestion.subject_name) {
        subjectName = this.currentQuestion.subject_name
      } else if (this.wordForm && this.wordForm.subject_name) {
        subjectName = this.wordForm.subject_name
      }

      // 检查是否是英语或语文科目
      if (subjectName && (subjectName.includes('英语') || subjectName.includes('语文'))) {
        console.log('检测到英语或语文科目，准备获取知识点:', subjectName)
        await this.loadKnowledgePointsForSubject(subjectName)
      } else {
        console.log('非英语或语文科目，使用默认知识点列表')
      }
    },

    // 加载指定学科的知识点
    async loadKnowledgePointsForSubject(subjectName) {
      try {
        this.knowledgePointsLoading = true
        console.log('开始加载知识点，学科:', subjectName)

        const response = await getKnowledgePoints(subjectName)
        console.log('知识点API响应:', response)

        if (response.code === 0 && response.data && Array.isArray(response.data)) {
          // 将API返回的数据转换为知识点名称列表
          const knowledgePoints = response.data.map(item => {
            // 从path中提取知识点名称，取最后一个路径部分
            const pathParts = item.path.split('/')
            return pathParts[pathParts.length - 1] || item.path
          })

          // 合并到现有知识点列表中，去重
          const existingPoints = new Set(this.availableKnowledgePoints)
          knowledgePoints.forEach(point => {
            if (point && point.trim()) {
              existingPoints.add(point.trim())
            }
          })

          this.availableKnowledgePoints = Array.from(existingPoints)
          console.log('知识点加载成功，总数:', this.availableKnowledgePoints.length)
        } else {
          console.warn('知识点API返回数据格式不正确:', response)
          this.$message.warning('获取知识点失败，请稍后重试')
        }
      } catch (error) {
        console.error('加载知识点失败:', error)
        this.$message.error('获取知识点失败：' + (error.message || '网络错误'))
      } finally {
        this.knowledgePointsLoading = false
      }
    },

    // 处理标签变化
    handleTagsChange(value) {
      console.log('标签变化:', value)
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            mainQuestion.children[subIndex].tags = value
          }
        } else {
          // 主题目：保存到原始数据结构中
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.questions[index].tags = value
          }
        }
      }
    },

    // 处理系列类型变化
    handleSeriesTypeChange(seriesType) {
      console.log('系列类型变化:', seriesType)
      this.globalSettings.series_type = seriesType
      // 清空系列和系列路径，让用户重新选择
      this.globalSettings.series = null
      this.globalSettings.series_path = ''

      // 重新加载系列列表
      this.loadSeriesList()

      this.$message.info('请选择系列和系列路径')
    },

    // 处理全局系列变化
    handleGlobalSeriesChange(seriesId) {
      console.log('全局系列变化:', seriesId)
      this.globalSettings.series = seriesId
      // 清空系列路径，让用户通过选择器来选择
      this.globalSettings.series_path = ''

      // 从系列列表中获取对应的系列信息
      const selectedSeries = this.seriesList.find(item => item.id === seriesId)
      if (selectedSeries) {
        console.log('选中的系列信息:', selectedSeries)
        this.$message.info('请点击"系列路径"按钮选择具体的章节路径')
      }
    },

    // 将全局设置应用到所有题目
    applyGlobalSettingsToAllQuestions() {
      this.questions.forEach(question => {
        question.series_type = this.globalSettings.series_type
        question.series = this.globalSettings.series
        question.series_path = this.globalSettings.series_path
      })
      console.log('全局设置已应用到所有题目')
    },

    // 加载系列列表
    async loadSeriesList() {
      if (this.seriesList.length > 0) {
        return // 已经加载过了
      }

      try {
        this.seriesLoading = true
        // 添加role参数
        const params = {
          pageNum: 1,
          pageSize: 1000,
          role: this.userRole
        }
        const response = await listSeries(params)
        if (response.code === 200) {
          this.seriesList = response.rows || []
          console.log('加载系列列表成功:', this.seriesList)
        } else {
          this.$message.error('加载系列列表失败: ' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('加载系列列表失败:', error)
        this.$message.error('加载系列列表失败: ' + error.message)
      } finally {
        this.seriesLoading = false
      }
    },

    // 解析系列路径**
    parseSeriesPath(seriesData) {
      // 此方法不再用于构建完整的系列路径，仅用于兼容
      return ''
    },

    // 验证所有题目
    validateAllQuestions() {
      try {
        // 先验证系列相关字段
        if (!this.globalSettings.series_type) {
          this.$message.error('请选择系列类型')
          return false
        }
        if (!this.globalSettings.series) {
          this.$message.error('请选择系列')
          return false
        }
        if (!this.globalSettings.series_path) {
          this.$message.error('请选择系列路径')
          return false
        }

        let validCount = 0
        let invalidQuestions = []

        this.questions.forEach((question, index) => {
          if (!question.question || !question.question.trim()) {
            invalidQuestions.push(`题目 ${index + 1}: 题目内容为空`)
          } else {
            validCount++
          }

          // 验证答案字段
          const hasAnswer = (question.displayanswer && question.displayanswer.trim()) ||
            (question.answers && question.answers.length > 0 && question.answers.some(ans => ans && ans.trim()))
          if (!hasAnswer) {
            invalidQuestions.push(`题目 ${index + 1}: 答案为空，请填写答案`)
          }

          // 验证科目字段
          if (!question.subject_name || question.subject_name === '未指定科目') {
            invalidQuestions.push(`题目 ${index + 1}: 科目为"未指定科目"，请选择具体的科目`)
          }

          // 验证label字段
          if (question.label && this.isImageParseFailed(question.label)) {
            invalidQuestions.push(`题目 ${index + 1}: 标签内容为"图片解析失败"，请修改标签内容`)
          }

          // 验证子题
          if (question.children && question.children.length > 0) {
            question.children.forEach((subQuestion, subIndex) => {
              // 检查子题内容，优先检查content字段，如果没有则检查question字段
              const subQuestionContent = subQuestion.content || subQuestion.question
              if (!subQuestionContent || !subQuestionContent.trim()) {
                invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 子题内容为空`)
              } else {
                validCount++
              }

              // 验证子题答案字段
              const subHasAnswer = (subQuestion.displayanswer && subQuestion.displayanswer.trim()) ||
                (subQuestion.answers && subQuestion.answers.length > 0 && subQuestion.answers.some(ans => ans && ans.trim()))
              if (!subHasAnswer) {
                invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 子题答案为空，请填写答案`)
              }

              // 验证子题科目字段
              if (!subQuestion.subject_name || subQuestion.subject_name === '未指定科目') {
                invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 科目为"未指定科目"，请选择具体的科目`)
              }

              // 验证子题label字段
              if (subQuestion.label && this.isImageParseFailed(subQuestion.label)) {
                invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 标签内容为"图片解析失败"，请修改标签内容`)
              }
            })
          }
        })

        if (invalidQuestions.length > 0) {
          this.$message.warning(`发现 ${invalidQuestions.length} 道题目有问题：\n${invalidQuestions.join('\n')}`)
          return false
        } else {
          this.$message.success(`验证通过，共 ${validCount} 道题目（知识点为可选项）`)
          return true
        }
      } catch (error) {
        this.$message.error('验证失败：' + error.message)
        return false
      }
    },

    // 检查label是否为图片解析失败
    isImageParseFailed(label) {
      if (!label || typeof label !== 'string') {
        return false
      }

      const failedKeywords = [
        '图片解析失败',
        '图片解析错误',
        '图片处理失败',
        '图片处理错误',
        'image parse failed',
        'image processing failed',
        '图片无法解析',
        '图片识别失败'
      ]

      return failedKeywords.some(keyword =>
        label.toLowerCase().includes(keyword.toLowerCase())
      )
    },

    // 上传所有题目
    async uploadAllQuestions() {
      try {
        // 先验证格式
        if (!this.validateAllQuestions()) {
          return
        }

        // 检查是否有当前任务ID
        if (!this.currentTaskId) {
          this.$message.error('没有找到当前任务，无法上传题目。请重新打开题目编辑器。')
          return
        }

        // 先验证所有题目
        let validationErrors = []
        for (let i = 0; i < this.questions.length; i++) {
          const question = this.questions[i]
          try {
            this.formatQuestionForUpload(question)
          } catch (error) {
            validationErrors.push(`题目 ${i + 1}: ${error.message}`)
          }
        }

        if (validationErrors.length > 0) {
          this.$message.error(`发现 ${validationErrors.length} 道题目有问题，无法上传：\n${validationErrors.join('\n')}`)
          return
        }

        // 检查题目数据中是否包含双引号，如果有则提示用户
        let hasQuotes = false
        for (let i = 0; i < this.questions.length; i++) {
          const question = this.questions[i]
          if (this.checkObjectForQuotes(question)) {
            hasQuotes = true
            break
          }
        }

        if (hasQuotes) {
          console.log('检测到题目数据中包含双引号，将自动进行转义处理')
          this.$message.info('检测到题目数据中包含双引号，系统将自动进行转义处理')
        }

        this.uploadingQuestions = true
        let successCount = 0
        let failCount = 0
        let failureReasons = []

        // 更新任务进度为"处理中"
        console.log('开始上传，更新任务进度为"处理中"，当前任务ID:', this.currentTaskId)
        await this.updateTaskProgressStatus('处理中', successCount, failCount, '')
        this.updateLocalTaskProgress('处理中', successCount, failCount, '')

        // 逐题上传
        for (let i = 0; i < this.questions.length; i++) {
          const question = this.questions[i]
          const formattedQuestion = this.formatQuestionForUpload(question)

          console.log(`正在上传第 ${i + 1}/${this.questions.length} 题:`, formattedQuestion)

          try {
            const response = await uploadQuestion(formattedQuestion)
            console.log(`API响应:`, response)

            if (response.code === 200) {
              successCount++
              this.$message.success(`题目 ${i + 1} 上传成功！`)
            } else {
              failCount++
              let errorMsg = '未知错误'
              if (response.msg) errorMsg = response.msg
              else if (response.message) errorMsg = response.message
              else if (response.detail) errorMsg = response.detail

              errorMsg = this.cleanErrorMessage(errorMsg)
              const detailedReason = `题目 ${i + 1}: ${errorMsg}`
              failureReasons.push(detailedReason)
              this.$message.error(`题目 ${i + 1} 上传失败: ${errorMsg}`)
            }
          } catch (uploadError) {
            failCount++
            console.error(`上传题目 ${i + 1} 失败:`, uploadError)
            let errorMsg = '网络错误'
            if (uploadError.message) {
              errorMsg = uploadError.message
            }
            errorMsg = this.cleanErrorMessage(errorMsg)
            const detailedReason = `题目 ${i + 1}: ${errorMsg}`
            failureReasons.push(detailedReason)
            this.$message.error(`题目 ${i + 1} 上传异常: ${errorMsg}`)
          }
        }

        // 根据上传结果更新任务进度
        if (this.currentTaskId) {
          let progressStatus = ''
          let taskStatus = ''

          if (failCount === 0) {
            progressStatus = '已完成'
            taskStatus = '处理完成'
          } else if (successCount === 0) {
            progressStatus = '上传出错'
            taskStatus = '上传失败'
          } else {
            progressStatus = '上传出错'
            taskStatus = '部分失败'
          }

          const failureReason = failureReasons.length > 0 ? failureReasons.join('; ') : ''
          console.log('上传完成，准备更新任务进度:', {
            progressStatus,
            successCount,
            failCount,
            failureReason,
            taskStatus,
            currentTaskId: this.currentTaskId
          })

          await this.updateTaskProgressStatus(progressStatus, successCount, failCount, failureReason, taskStatus)

          // 立即更新本地任务列表中的进度数据
          console.log('开始更新本地任务进度数据')
          this.updateLocalTaskProgress(progressStatus, successCount, failCount, failureReason)
        }

        // 显示上传结果
        this.$alert(`共上传 ${this.questions.length} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
          confirmButtonText: '确定',
          type: successCount === this.questions.length ? 'success' : (failCount === this.questions.length ? 'error' : 'warning')
        })

        // 只有全部上传成功时才关闭弹窗并刷新列表
        if (successCount === this.questions.length) {
          this.questionEditorVisible = false
          this.loadTaskList()
          // 清空系列相关字段
          this.globalSettings.series_type = ''
          this.globalSettings.series = null
          this.globalSettings.series_path = ''
        }

      } catch (error) {
        console.error('上传所有题目失败:', error)
        this.$message.error('上传失败：' + error.message)

        // 更新任务进度为"上传出错"
        if (this.currentTaskId) {
          await this.updateTaskProgressStatus('上传出错', 0, this.questions.length, '上传过程中发生异常: ' + error.message, '上传失败')
          // 立即更新本地任务列表中的进度数据
          this.updateLocalTaskProgress('上传出错', 0, this.questions.length, '上传过程中发生异常: ' + error.message)
        } else {
          console.error('异常发生时也没有当前任务ID')
        }
      } finally {
        this.uploadingQuestions = false
      }
    },

    // 更新任务进度状态
    async updateTaskProgressStatus(taskProgress, successCount, failureCount, failureReason, taskStatus = '') {
      try {
        if (!this.currentTaskId) {
          console.warn('没有当前任务ID，无法更新任务进度')
          return
        }

        // 确保taskProgress对象存在且有ID
        if (!this.currentTaskData || !this.currentTaskData.taskProgress || !this.currentTaskData.taskProgress.id) {
          console.error('无法获取taskProgress的ID，请检查currentTaskData或taskProgress对象')
          return
        }

        const progressData = {
          id: this.currentTaskData.taskProgress.id, // 使用taskProgress对象自身的ID
          taskTableId: this.currentTaskData.id, // 使用父任务的ID作为taskTableId
          taskProgress: taskProgress,
          successCount: successCount,
          failureCount: failureCount,
          failureReason: failureReason,
          taskStatus: taskStatus
        }

        console.log('更新任务进度:', progressData)
        console.log('使用的ID信息:', {
          taskProgressId: this.currentTaskData.taskProgress.id,
          parentTaskId: this.currentTaskData.id,
          currentTaskId: this.currentTaskId
        })

        const response = await updateTaskProgress(progressData)
        console.log('任务进度更新响应:', response)

        if (response.code === 200) {
          console.log('任务进度更新成功')
        } else {
          console.error('任务进度更新失败:', response.msg || response.message)
        }
      } catch (error) {
        console.error('更新任务进度异常:', error)
      }
    },

    // 更新本地任务列表中的进度数据
    updateLocalTaskProgress(taskProgress, successCount, failureCount, failureReason) {
      console.log('开始更新本地任务进度:', {
        currentTaskId: this.currentTaskId,
        taskProgress,
        successCount,
        failureCount,
        failureReason
      })

      if (!this.currentTaskId) {
        console.warn('没有当前任务ID，无法更新本地任务进度')
        return
      }

      // 找到当前任务并更新其进度数据
      const taskIndex = this.taskList.findIndex(task => task.id === this.currentTaskId)
      console.log('找到任务索引:', taskIndex, '任务列表长度:', this.taskList.length)

      if (taskIndex !== -1) {
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

        // 确保taskProgress对象存在
        if (!this.taskList[taskIndex].taskProgress) {
          console.log('创建新的taskProgress对象')
          this.taskList[taskIndex].taskProgress = {
            id: null,
            taskTableId: this.currentTaskId,
            taskProgress: '未完成',
            successCount: 0,
            failureCount: 0,
            failureReason: null,
            taskStatus: null,
            createTime: currentTime,
            createBy: null,
            updateTime: null,
            updateBy: null,
            remark: null
          }
        }

        console.log('更新前的taskProgress:', this.taskList[taskIndex].taskProgress)

        // 更新任务进度对象的所有相关字段
        this.taskList[taskIndex].taskProgress = {
          ...this.taskList[taskIndex].taskProgress,
          taskProgress: taskProgress,           // 进度状态：未完成/已完成/上传出错
          successCount: successCount,           // 成功数量
          failureCount: failureCount,           // 失败数量
          failureReason: failureReason,         // 失败原因
          updateTime: currentTime               // 更新时间
        }

        console.log('更新后的taskProgress:', this.taskList[taskIndex].taskProgress)

        // 使用Vue.set确保响应式更新
        this.$set(this.taskList, taskIndex, { ...this.taskList[taskIndex] })

        console.log('本地任务进度已更新完成')
      } else {
        console.error('未找到对应的任务，任务ID:', this.currentTaskId)
      }
    },

    // 关闭题目编辑器
    handleQuestionEditorClose() {
      this.questionEditorVisible = false
      this.questions = []
      this.currentQuestionIndex = '0'
      this.availableKnowledgePoints = []
      // 清空系列相关字段
      this.globalSettings.series_type = ''
      this.globalSettings.series = null
      this.globalSettings.series_path = ''
    },

    // 处理题目编辑器的任务进度更新
    async handleTaskProgressUpdate(progressData) {
      console.log('收到任务进度更新事件:', progressData)

      try {
        // 更新服务器端的任务进度
        await this.updateTaskProgressStatus(
          progressData.progressStatus,
          progressData.successCount,
          progressData.failCount,
          progressData.failureReason,
          progressData.taskStatus
        )

        // 更新本地任务列表中的进度数据
        this.updateLocalTaskProgress(
          progressData.progressStatus,
          progressData.successCount,
          progressData.failCount,
          progressData.failureReason
        )

        // 刷新任务列表
        this.loadTaskList()

        console.log('任务进度更新完成')
      } catch (error) {
        console.error('更新任务进度失败:', error)
        this.$message.error('更新任务进度失败：' + error.message)
      }
    },

    // ========== 编辑弹窗相关方法 ==========

    // 打开编辑弹窗
    openEditDialog(type) {
      if (!this.currentQuestion) {
        this.$message.warning('没有可编辑的题目')
        return
      }

      this.editDialogType = type

      // 根据类型设置标题和内容
      switch (type) {
        case 'question':
          this.editDialogTitle = '编辑题目内容'
          this.editingContent = this.ensureString(this.currentQuestion.content || this.currentQuestion.question)
          this.editPlaceholder = '请输入题目内容...'
          break
        case 'analysis':
          this.editDialogTitle = '编辑解析内容'
          this.editingContent = this.ensureString(this.currentQuestion.Analyse)
          this.editPlaceholder = '请输入解析内容...'
          break
        case 'method':
          this.editDialogTitle = '编辑方法内容'
          this.editingContent = this.ensureString(this.currentQuestion.Method)
          this.editPlaceholder = '请输入方法内容...'
          break
        case 'discuss':
          this.editDialogTitle = '编辑讨论内容'
          this.editingContent = this.ensureString(this.currentQuestion.Discuss)
          this.editPlaceholder = '请输入讨论内容...'
          break
        case 'options':
          this.editDialogTitle = '编辑选项内容'
          this.editingContent = this.currentQuestion.options ? this.currentQuestion.options.join('\n') : ''
          this.editPlaceholder = '每行一个选项...'
          break
        case 'answer':
          this.editDialogTitle = '编辑答案'
          this.editingContent = this.ensureString(this.currentQuestion.displayanswer || this.currentQuestion.answers)
          this.editPlaceholder = '在这里编辑答案...'
          break
        case 'label':
          this.editDialogTitle = '编辑标签'
          this.editingContent = this.ensureString(this.currentQuestion.label)
          this.editPlaceholder = '在这里编辑标签内容...'
          break
        default:
          this.$message.error('未知的编辑类型')
          return
      }

      // 渲染预览（已移至组件内部处理）

      // 显示弹窗
      this.editDialogVisible = true
    },

    // 自动保存编辑内容（当内容变化时调用）- 已移至组件内部**
    autoSaveEditContent() {
      // 此方法已移至ContentEditDialog组件内部，保留此方法以兼容其他可能的调用
    },

    // 处理内容编辑弹窗确认事件
    handleEditDialogConfirm(data) {
      if (!this.currentQuestion) {
        this.$message.error('没有可保存的题目')
        return
      }

      const { content, editType } = data
      this.editingContent = content
      this.editDialogType = editType

      // 检查是否是子题
      if (this.currentQuestionIndex.includes('-')) {
        // 子题：保存到原始数据结构中
        const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
        const mainQuestion = this.questions[mainIndex]
        if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
          const subQuestion = mainQuestion.children[subIndex]

          // 确保子题有学科信息，如果没有则从父题目继承
          if (!subQuestion.subject_name) {
            subQuestion.subject_name = mainQuestion.subject_name || mainQuestion.subject
          }

          // 根据类型保存内容到原始子题数据
          switch (editType) {
            case 'question':
              subQuestion.content = content
              subQuestion.question = content  // 同时保存到question字段以保持兼容性
              break
            case 'analysis':
              subQuestion.Analyse = content
              break
            case 'method':
              subQuestion.Method = content
              break
            case 'discuss':
              subQuestion.Discuss = content
              break
            case 'options':
              // 将文本按行分割为选项数组
              subQuestion.options = content.split('\n').filter(option => option.trim())
              break
            case 'answer':
              subQuestion.displayanswer = content
              // 如果内容包含逗号分隔的多个答案，则分割成数组
              if (content.includes(',')) {
                subQuestion.answers = content.split(',').map(ans => ans.trim()).filter(ans => ans)
              } else {
                subQuestion.answers = [content]
              }
              break
            case 'label':
              subQuestion.label = content
              break
          }
        }
      } else {
        // 主题目：保存到原始数据结构中
        const index = parseInt(this.currentQuestionIndex)
        const mainQuestion = this.questions[index]
        if (mainQuestion) {
          // 根据类型保存内容到原始主题目数据
          switch (editType) {
            case 'question':
              mainQuestion.question = content
              break
            case 'analysis':
              mainQuestion.Analyse = content
              break
            case 'method':
              mainQuestion.Method = content
              break
            case 'discuss':
              mainQuestion.Discuss = content
              break
            case 'options':
              // 将文本按行分割为选项数组
              mainQuestion.options = content.split('\n').filter(option => option.trim())
              break
            case 'answer':
              mainQuestion.displayanswer = content
              // 如果内容包含逗号分隔的多个答案，则分割成数组
              if (content.includes(',')) {
                mainQuestion.answers = content.split(',').map(ans => ans.trim()).filter(ans => ans)
              } else {
                mainQuestion.answers = [content]
              }
              break
            case 'label':
              mainQuestion.label = content
              break
          }
        }
      }

      this.$message.success('修改已保存')
    },

    // 处理内容变化事件
    handleEditContentChange(content) {
      this.editingContent = content
    },

    // 保存编辑内容（保留原方法名以兼容其他调用）
    saveEditContent() {
      this.handleEditDialogConfirm({
        content: this.editingContent,
        editType: this.editDialogType
      })
    },

    // 关闭编辑弹窗
    handleEditDialogClose() {
      this.editDialogVisible = false
      this.editDialogType = ''
      this.editDialogTitle = ''
      this.editingContent = ''
      this.editPlaceholder = ''
    },

    // 合并两个Markdown数据
    mergeMarkdownData(questionData, analysisData) {
      let mergedContent = ''
      let mergedMarkdown = null
      let mergedImages = null

      // 处理题目文档内容
      if (questionData) {
        let questionContent = ''
        if (questionData.content) {
          questionContent = questionData.content
        } else if (questionData.markdown && questionData.markdown.download_url) {
          // 如果只有下载地址，会在弹窗中异步加载
          questionContent = '' // 标记需要从URL加载
        }

        if (questionContent) {
          mergedContent += '# 题目文档\n\n'
          mergedContent += questionContent
          mergedContent += '\n\n---\n\n'
        }

        // 保存题目文档的markdown信息
        if (questionData.markdown) {
          mergedMarkdown = questionData.markdown
        }

        // 保存题目文档的图片信息
        if (questionData.images) {
          mergedImages = questionData.images
        }
      }

      // 处理解析文档内容
      if (analysisData) {
        let analysisContent = ''
        if (analysisData.content) {
          analysisContent = analysisData.content
        } else if (analysisData.markdown && analysisData.markdown.download_url) {
          // 如果只有下载地址，会在弹窗中异步加载
          analysisContent = '' // 标记需要从URL加载
        }

        if (analysisContent) {
          mergedContent += '# 解析文档\n\n'
          mergedContent += analysisContent
          mergedContent += '\n\n'
        }

        // 如果解析文档有markdown信息但题目文档没有，使用解析文档的
        if (!mergedMarkdown && analysisData.markdown) {
          mergedMarkdown = analysisData.markdown
        }

        // 如果解析文档有图片信息但题目文档没有，使用解析文档的
        if (!mergedImages && analysisData.images) {
          mergedImages = analysisData.images
        }
      }

      // 构建合并后的数据对象
      const mergedData = {
        content: mergedContent.trim(),
        markdown: mergedMarkdown,
        images: mergedImages,
        // 保存原始数据，以便在需要时分别加载
        _questionData: questionData,
        _analysisData: analysisData
      }

      return mergedData
    },

    // 打开Markdown编辑弹窗
    openMarkdownEditDialog(markdownData, title = 'Markdown文件编辑') {
      this.currentMarkdownData = markdownData
      this.markdownEditDialogTitle = title
      this.markdownEditDialogVisible = true
    },

    // 处理Markdown编辑确认
    handleMarkdownEditConfirm(data) {
      console.log('Markdown编辑确认:', data)
      // 这里可以添加保存Markdown内容的逻辑
      // 例如：更新后端、保存到本地等
      this.$message.success('Markdown内容已保存')
    },

    // 关闭Markdown编辑弹窗
    handleMarkdownEditClose() {
      this.markdownEditDialogVisible = false
      this.markdownEditDialogTitle = ''
      this.currentMarkdownData = null
      this.pendingAnalysisMarkdownData = null

      // 如果标记了需要刷新任务列表，则在弹窗关闭后刷新
      if (this.shouldRefreshTaskListOnClose) {
        this.shouldRefreshTaskListOnClose = false
        this.loadTaskList()
        this.loadOcrQueue()
      }
    },

    // 处理Markdown内容变化
    handleMarkdownContentChange(content) {
      // 可以在这里实时保存或处理内容变化
      console.log('Markdown内容变化:', content.length, '字符')
    },

    // 加载OCR解析队列
    async loadOcrQueue() {
      this.ocrQueueLoading = true
      try {
        const params = {
          pageNum: this.ocrQueuePageNum,
          pageSize: this.ocrQueuePageSize, // 传给后端的是原始数据数量（配对前的）
          taskType: 'OCR解析',
          role: this.userRole,
          userId: this.userId
        }
        const response = await getTaskList(params)

        if (response.code === 200) {
          let taskData = []
          let totalCount = 0

          // 处理不同的数据结构
          if (response.rows && Array.isArray(response.rows)) {
            taskData = response.rows || []
            // total是原始数据总数，配对后显示的数量是总数的一半
            // 但需要向上取整，因为可能有未配对的单条数据
            totalCount = Math.ceil(response.total / 2)
          }

          // 保存完整数据用于状态判断
          this.ocrQueueFullData = taskData
          this.ocrQueueTotal = totalCount

          // 根据resourceUrl1字段过滤，每组只显示一条记录
          const groupedByResourceUrl1 = {}
          taskData.forEach(item => {
            const resourceUrl1 = item.resourceUrl1 || ''
            if (resourceUrl1) {
              // 如果这个resourceUrl1还没有记录，或者当前记录的ID更小（优先显示ID小的）
              if (!groupedByResourceUrl1[resourceUrl1] ||
                  (item.id && groupedByResourceUrl1[resourceUrl1].id &&
                   item.id < groupedByResourceUrl1[resourceUrl1].id)) {
                groupedByResourceUrl1[resourceUrl1] = item
              }
            } else {
              // 没有resourceUrl1的记录，直接添加
              groupedByResourceUrl1[`single_${item.id}`] = item
            }
          })

          // 转换为数组
          this.ocrQueueList = Object.values(groupedByResourceUrl1)
        } else {
          this.$message.error('加载OCR队列失败：' + (response.msg || '未知错误'))
          this.ocrQueueList = []
          this.ocrQueueTotal = 0
        }
      } catch (error) {
        console.error('加载OCR队列失败:', error)
        this.$message.error('加载OCR队列失败：' + (error.message || '未知错误'))
        this.ocrQueueList = []
        this.ocrQueueTotal = 0
      } finally {
        this.ocrQueueLoading = false
      }
    },

    // 处理OCR队列分页大小变化
    // val是用户选择的配对后的显示数量（2, 4, 6, 8），需要转换为原始数据数量
    handleOcrQueueSizeChange(val) {
      this.ocrQueuePageSize = val * 2 // 配对后的数量 * 2 = 原始数据数量
      this.ocrQueuePageNum = 1
      this.loadOcrQueue()
    },

    // 处理OCR队列当前页变化
    handleOcrQueueCurrentChange(val) {
      this.ocrQueuePageNum = val
      this.loadOcrQueue()
    },

    // 删除OCR任务（根据resourceUrl1删除配对的两条数据）
    async handleDeleteOcrTask(task) {
      try {
        const resourceUrl1 = task.resourceUrl1 || ''

        // 查找相同resourceUrl1的所有任务
        let tasksToDelete = []
        if (resourceUrl1) {
          tasksToDelete = this.ocrQueueFullData.filter(item =>
            (item.resourceUrl1 || '') === resourceUrl1
          )
        } else {
          // 如果没有resourceUrl1，只删除当前任务
          tasksToDelete = [task]
        }

        // 构建确认消息
        let confirmMessage = ''
        if (tasksToDelete.length > 1) {
          const taskIds = tasksToDelete.map(t => t.id).join('、')
          confirmMessage = `确定要删除任务 ID ${taskIds} 吗？这将删除配对的两条数据。`
        } else {
          confirmMessage = `确定要删除任务 ID ${task.id} 吗？`
        }

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 批量删除所有配对的任务
        const deletePromises = tasksToDelete.map(t => deleteTask(t.id))
        const responses = await Promise.all(deletePromises)

        // 检查删除结果
        const allSuccess = responses.every(res => res.code === 200)
        const failedCount = responses.filter(res => res.code !== 200).length

        if (allSuccess) {
          this.$message.success(
            tasksToDelete.length > 1
              ? `成功删除 ${tasksToDelete.length} 条配对任务`
              : '任务删除成功'
          )
        } else {
          this.$message.warning(
            `部分删除失败：成功 ${tasksToDelete.length - failedCount} 条，失败 ${failedCount} 条`
          )
        }

        // 刷新OCR队列
        await this.loadOcrQueue()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除OCR任务失败:', error)
          this.$message.error('删除失败：' + (error.message || '未知错误'))
        }
      }
    },

    // 获取配对记录的资源名称列表
    getPairedResourceNames(task) {
      const resourceUrl1 = task.resourceUrl1 || ''
      if (!resourceUrl1) {
        // 没有resourceUrl1，只返回当前记录的资源名称
        return task.resourceUrl ? [this.getFileNameFromUrl(task.resourceUrl)] : []
      }

      // 查找相同resourceUrl1的所有数据
      const pairedTasks = this.ocrQueueFullData.filter(item =>
        (item.resourceUrl1 || '') === resourceUrl1
      )

      // 提取所有配对记录的资源名称
      const resourceNames = pairedTasks
        .map(item => item.resourceUrl ? this.getFileNameFromUrl(item.resourceUrl) : null)
        .filter(name => name !== null)

      return resourceNames.length > 0 ? resourceNames : []
    },

    // 获取OCR任务状态类型（根据resourceUrl1相同的两条数据判断）
    getOcrTaskStatusType(task) {
      const resourceUrl1 = task.resourceUrl1 || ''
      if (!resourceUrl1) {
        // 没有resourceUrl1，使用单条数据的状态
        return this.getTaskStatusType(task.taskStatus)
      }

      // 查找相同resourceUrl1的所有数据
      const pairedTasks = this.ocrQueueFullData.filter(item =>
        (item.resourceUrl1 || '') === resourceUrl1
      )

      // 如果只有一条数据，使用单条数据的状态
      if (pairedTasks.length === 1) {
        return this.getTaskStatusType(task.taskStatus)
      }

      // 如果有多条数据，判断是否都成功
      const allSuccess = pairedTasks.every(item => item.taskStatus === 1)
      const allFailed = pairedTasks.every(item => item.taskStatus === 2)
      const hasProcessing = pairedTasks.some(item => item.taskStatus === 0)

      if (allSuccess) {
        return 'success' // 都成功
      } else if (allFailed) {
        return 'danger' // 都失败
      } else if (hasProcessing) {
        return 'warning' // 有处理中的
      } else {
        return 'info' // 部分成功
      }
    },

    // 获取OCR任务状态文本（根据resourceUrl1相同的两条数据判断）
    getOcrTaskStatusText(task) {
      const resourceUrl1 = task.resourceUrl1 || ''
      if (!resourceUrl1) {
        // 没有resourceUrl1，使用单条数据的状态
        return this.getTaskStatusText(task.taskStatus)
      }

      // 查找相同resourceUrl1的所有数据
      const pairedTasks = this.ocrQueueFullData.filter(item =>
        (item.resourceUrl1 || '') === resourceUrl1
      )

      // 如果只有一条数据，使用单条数据的状态
      if (pairedTasks.length === 1) {
        return this.getTaskStatusText(task.taskStatus)
      }

      // 如果有多条数据，判断是否都成功
      const allSuccess = pairedTasks.every(item => item.taskStatus === 1)
      const allFailed = pairedTasks.every(item => item.taskStatus === 2)
      const hasProcessing = pairedTasks.some(item => item.taskStatus === 0)

      if (allSuccess) {
        return '解析完成' // 都成功
      } else if (allFailed) {
        return '解析失败' // 都失败
      } else if (hasProcessing) {
        return '处理中' // 有处理中的
      } else {
        return '部分完成' // 部分成功
      }
    },

    // 修改OCR任务
    async handleEditOcrTask(task) {
      try {
        const resourceUrl1 = task.resourceUrl1 || ''
        if (!resourceUrl1) {
          this.$message.warning('该任务没有配对信息，无法修改')
          return
        }

        // 根据resourceUrl1获取相同resourceUrl1的所有数据
        const params = {
          pageNum: 1,
          pageSize: 100,
          taskType: 'OCR解析',
          role: this.userRole,
          userId: this.userId
        }
        const response = await getTaskList(params)

        if (response.code !== 200) {
          this.$message.error('获取任务数据失败：' + (response.msg || '未知错误'))
          return
        }

        let taskData = []
        // 处理不同的数据结构
        if (response.rows && Array.isArray(response.rows)) {
          taskData = response.rows || []
        } else if (response.data && Array.isArray(response.data)) {
          taskData = response.data
        } else if (response.data && response.data.rows) {
          taskData = response.data.rows || []
        } else if (response.data && response.data.list) {
          taskData = response.data.list || []
        } else {
          taskData = response.data || []
        }

        // 筛选相同resourceUrl1的数据
        const pairedTasks = taskData.filter(item =>
          (item.resourceUrl1 || '') === resourceUrl1
        )

        if (pairedTasks.length === 0) {
          this.$message.warning('未找到配对的任务数据')
          return
        }

        // 提取两条数据的newResourceUrl字段
        // 优先查找包含"题目"的任务，否则使用ID较小的作为题目任务
        let questionTask = pairedTasks.find(item =>
          item.resourceUrl && item.resourceUrl.includes('题目')
        )
        if (!questionTask) {
          questionTask = pairedTasks.find(item =>
            item.id === Math.min(...pairedTasks.map(t => t.id || 0))
          ) || pairedTasks[0]
        }

        const analysisTask = pairedTasks.find(item =>
          item.id !== questionTask.id
        ) || (pairedTasks.length > 1 ? pairedTasks[1] : pairedTasks[0])

        // 解析newResourceUrl字段，提取content
        const parseContent = (newResourceUrl) => {
          if (!newResourceUrl) return ''

          try {
            // 如果是字符串，尝试解析为JSON
            let data = newResourceUrl
            if (typeof data === 'string') {
              data = JSON.parse(data)
            }

            // 提取content字段
            if (data && data.content) {
              return data.content
            }

            // 如果没有content字段，可能是直接就是内容字符串
            if (typeof data === 'string') {
              return data
            }

            return ''
          } catch (e) {
            // 如果解析失败，可能是直接的内容字符串
            console.warn('解析newResourceUrl失败，尝试作为字符串使用:', e)
            return typeof newResourceUrl === 'string' ? newResourceUrl : ''
          }
        }

        // 提取两条数据的content字段
        const questionContent = parseContent(questionTask.newResourceUrl)
        const analysisContent = parseContent(analysisTask.newResourceUrl)

        if (!questionContent && !analysisContent) {
          this.$message.warning('任务数据尚未生成，请等待处理完成')
          return
        }

        // 合并内容
        let mergedContent = ''
        if (questionContent) {
          mergedContent += '# 题目文档\n\n'
          mergedContent += questionContent
          mergedContent += '\n\n---\n\n'
        }
        if (analysisContent) {
          mergedContent += '# 解析文档\n\n'
          mergedContent += analysisContent
        }

        // 构建传递给弹窗的数据
        const markdownData = {
          content: mergedContent,
          _questionData: {
            content: questionContent
          },
          _analysisData: {
            content: analysisContent
          },
          resourceUrl1: resourceUrl1
        }

        // 打开Markdown编辑弹窗
        this.openMarkdownEditDialog(markdownData, '编辑PDF解析结果 - Markdown编辑')
      } catch (error) {
        console.error('获取任务数据失败:', error)
        this.$message.error('获取任务数据失败：' + (error.message || '未知错误'))
      }
    },

    // 图片上传相关方法已移至ContentEditDialog组件


  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.upload-type-card,
.upload-card,
.task-monitor-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 18px;
  color: #409EFF;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-subtitle {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

/* 任务进度样式 */
.task-progress-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-details {
  margin: auto;
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.success-count {
  color: #67C23A;
  font-weight: 500;
}

.failure-count {
  color: #F56C6C;
  font-weight: 500;
}

.failure-reason {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #FEF0F0;
  border: 1px solid #FDE2E2;
  border-radius: 4px;
  font-size: 12px;
}

.failure-reason-text {
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

.failure-reason-text i {
  font-size: 14px;
}

.upload-type-selector {
  text-align: center;
  padding: 20px 0;
  padding-top: unset;
}

.upload-content {
  padding: 20px 0;
  padding-top: unset;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
}

.form-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.form-item {
  display: flex;
  flex: 1;
  min-width: 0;
  h3 {
    width: 100px;
    align-content: center;
    margin: 0 0 5px 0;
  }
}

.full-width {
  width: 100%;
}

.chapter-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.series-path-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.series-path-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

/* 系列设置行样式 */
.series-settings-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.series-type-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.series-type-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.series-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.series-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.series-path-select {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 300px;
}

.series-path-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

/* 全局设置区域样式 */
.global-settings-section {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.settings-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.settings-header h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.settings-header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.settings-content {
  padding:0px 20px;
}

/* 题目编辑器样式 */
.question-editor-container {
  display: flex;
  gap: 20px;
  height: 65vh;
  min-height: 500px;
}

.question-editor-container img {
  max-width: 800px;
}

.question-list-section {
  width: 35%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.question-edit-section {
  width: 65%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow-y: auto;
}

.section-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

/* 主题/话题选择样式 */
.topic-section {
  margin-bottom: 20px;
}

.degree-section {
  margin-bottom: 20px;
}

.degree-tips {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.degree-tips .tip-item {
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.section-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* 竖向题目列表样式 */
.question-list-vertical {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.question-item {
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.question-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
}

.question-item.active {
  border-color: #409EFF;
  background: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.question-item .question-preview {
  padding: 15px;
}

.question-item h5 {
  margin: 0 0 8px 0;
  color: #409EFF;
  font-size: 14px;
  font-weight: 600;
}

.question-item .question-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.question-item .question-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 编辑区域样式 */
.question-edit-section {
  padding: 20px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.edit-header h4 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.question-basic-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.question-content-section,
.analysis-content-section,
.method-content-section,
.discuss-content-section,
.knowledge-points-section,
.tags-section,
.options-section,
.answer-section {
  margin-bottom: 20px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.field-content {
  margin-bottom: 15px;
}

.content-preview {
  padding: 15px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  min-height: 60px;
  line-height: 1.6;

}

.options-preview {
  padding: 15px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.option-item {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  min-width: 20px;
}

.option-content {
  flex: 1;
  line-height: 1.6;
}

.chapter-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

.selected-path-display {
  margin-top: 8px;
}

.selected-path-display .el-tag {
  max-width: 100%;
  word-break: break-all;
}

.upload-dragger {
  width: 33%;
}

.upload-actions {
  text-align: center;
  margin-top: 30px;
}

/* 任务列表样式 */
.task-list-card {
  margin-top: 20px;
}

.task-list-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-list-card .header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.resource-link {
  color: #409EFF;
  text-decoration: none;
}

.resource-link:hover {
  text-decoration: underline;
}

.upload-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.upload-left {
  flex: 1;
}

.pdf-upload-sections {
  display: flex;
  gap: 30px;
}

.queue-right {
  width: 100%;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.queue-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.queue-header h3 i {
  color: #409eff;
}

.ocr-queue-pagination {
  margin-top: 15px;
  text-align: center;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.resource-names {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resource-name-item {
  display: flex;
  align-items: center;
}

.resource-name-item .resource-link {
  font-size: 12px;
  color: #409eff;
  word-break: break-all;
}


.empty-queue {
  padding: 40px 0;
  text-align: center;
}

.pdf-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
}

.task-monitor-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.task-status {
  flex: 1;
}

.task-actions {
  display: flex;
  gap: 10px;
}



/* 知识点选择弹窗样式 */

.markdown-preview h1 {
  font-size: 24px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.markdown-preview h2 {
  font-size: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 6px;
}

.markdown-preview h3 {
  font-size: 18px;
}

.markdown-preview p {
  margin-bottom: 12px;
}

.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  border: 3px solid #409eff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: #fff;
}

.markdown-preview th,
.markdown-preview td {
  border: 2px solid #409eff !important;
  padding: 12px 16px;
  text-align: left;
  vertical-align: top;
  position: relative;
}

.markdown-preview th {
  background: #409eff !important;
  font-weight: 600;
  color: #fff !important;
  border-bottom: 2px solid #409eff !important;
}

.markdown-preview td {
  background: #fff !important;
  border: 2px solid #409eff !important;
}

.markdown-preview tr:hover td {
  background: #f0f9ff !important;
}

.markdown-preview table,
.markdown-preview table * {
  border-color: #409eff !important;
}

.markdown-preview table {
  border-spacing: 0 !important;
  border-collapse: collapse !important;
}

.markdown-preview table th,
.markdown-preview table td {
  border: 2px solid #409eff !important;
  border-collapse: collapse !important;
}

.markdown-preview table[border="1"] {
  border: 3px solid #409eff !important;
}

.markdown-preview table[border="1"] th,
.markdown-preview table[border="1"] td {
  border: 2px solid #409eff !important;
}

.markdown-preview .math {
  font-family: 'Times New Roman', serif;
  font-size: 1.1em;
  line-height: 1.4;
}

.markdown-preview .math-inline {
  display: inline;
  padding: 0 4px;
}

.markdown-preview .math-display {
  display: block;
  text-align: center;
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.markdown-preview pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 15px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.markdown-preview code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.markdown-preview .code-block {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 15px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.45;
}

.markdown-preview .code-block code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-family: inherit;
  font-size: inherit;
}

.markdown-preview ul,
.markdown-preview ol {
  margin: 10px 0;
  padding-left: 20px;
}

.markdown-preview li {
  margin: 5px 0;
  line-height: 1.6;
}

.markdown-preview hr {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 20px 0;
}

.markdown-preview blockquote {
  border-left: 4px solid #409eff;
  padding-left: 15px;
  margin: 15px 0;
  color: #606266;
  background: #f0f9ff;
  padding: 10px 15px;
  border-radius: 4px;
}

/* 滚动条样式 */
.review-content::-webkit-scrollbar {
  width: 6px;
}

.review-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.review-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.debug-info {
  font-size: 10px;
  color: #999;
  margin-left: 10px;
}

/* 题目编辑器样式 */
.question-editor-container {
  display: flex;
  gap: 20px;
  height: 65vh;
}

.question-list-section {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  padding-right: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.section-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.question-tabs {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.question-preview {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 10px;
}

.question-preview h5 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.question-edit-section {
  flex: 1;
  overflow-y: auto;
  padding-left: 20px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.edit-header h4 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.question-basic-info,
.knowledge-points-section,
.question-content-edit,
.options-edit,
.answer-edit,
.analysis-edit {
  margin-bottom: 20px;
}

.option-item {
  margin-bottom: 10px;
}

.edit-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.preview-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  background: #fff;
  min-height: 100px;
}

/* 题目编辑器滚动条 */
.question-list-section::-webkit-scrollbar,
.question-edit-section::-webkit-scrollbar {
  width: 6px;
}

.question-list-section::-webkit-scrollbar-thumb,
.question-edit-section::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.question-list-section::-webkit-scrollbar-track,
.question-edit-section::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 题目字段样式 */
.question-content-section,
.analysis-content-section,
.method-content-section,
.discuss-content-section,
.knowledge-points-section,
.options-section,
.answer-section {
  margin-bottom: 25px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

/* 标签输入容器样式 */
.label-input-container {
  width: 100%;
}

.label-input-container .el-input {
  width: 100%;
}

.label-input-container .el-input.is-focus .el-input__inner {
  border-color: #409eff;
}

/* 标签错误样式 */
.label-error .el-input__inner {
  border-color: #f56c6c !important;
  background-color: #fef0f0;
}

.label-error .el-input__inner:focus {
  border-color: #f56c6c !important;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

/* 标签错误提示样式 */
.label-error-tip {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  font-size: 12px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.label-error-tip i {
  font-size: 14px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
}

.field-label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.field-content {
  padding: 20px;
}

.content-preview {
  min-height: 60px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  line-height: 1.6;
  color: #606266;
}

.content-preview:empty::before {
  content: "内容为空";
  color: #c0c4cc;
  font-style: italic;
}

.options-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  align-items: center;
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  margin-right: 10px;
  min-width: 20px;
}

.option-content {
  flex: 1;
  color: #606266;
  line-height: 1.5;
}

/* 编辑弹窗样式 */
.edit-dialog-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.header-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.header-tip {
  margin: 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-content {
  flex: 1;
  overflow-y: auto;
}

.edit-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.preview-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  background: #fff;
  min-height: 400px;
}

/* 编辑弹窗滚动条 */
.edit-content::-webkit-scrollbar {
  width: 6px;
}

.edit-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.edit-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 数学公式测试区域样式 */
.math-test-card {
  margin-bottom: 20px;
}

.math-test-content {
  padding: 20px 0;
}

.test-formulas h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
}

.formula-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.formula-item {
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.formula-item h5 {
  margin: 0 0 10px 0;
  color: #409EFF;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #409EFF;
  padding-bottom: 5px;
}

.formula-item p {
  margin: 8px 0;
  line-height: 1.6;
  color: #606266;
}

/* LaTeX数学公式样式已移至 @/assets/styles/latex-renderer.scss */

/* 图片上传弹框样式 */
.image-upload-container {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 25px;
}

.upload-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.auto-selected-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #67c23a;
  border-radius: 4px;
  color: #67c23a;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.auto-selected-tip i {
  margin-right: 6px;
  font-size: 16px;
}

.original-subject {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

.image-uploader {
  margin-bottom: 10px;
}

.upload-tip {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.file-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
}

.file-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #409eff;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: contain;
  background-color: #fafafa;
}

/* 题目层级样式 */
.question-item.main-question {
  border-left: 4px solid #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.question-item.sub-question {
  border-left: 4px solid #e6a23c;
  background: linear-gradient(135deg, #fdf6ec 0%, #ffffff 100%);
  margin-left: 20px;
  position: relative;
}

.question-item.sub-question::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  width: 15px;
  height: 1px;
  background: #e6a23c;
  transform: translateY(-50%);
}

.question-item.sub-question::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  width: 1px;
  height: 50%;
  background: #e6a23c;
}

.parent-question-info {
  margin-bottom: 8px;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #e6a23c;
}

.question-text {
  margin-top: 8px;
}

.question-item.main-question .question-preview h5 {
  color: #409eff;
  font-weight: 600;
}

.question-item.sub-question .question-preview h5 {
  color: #e6a23c;
  font-weight: 500;
}

/* 父题目信息样式 */
.parent-question-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  border-left: 4px solid #e6a23c;
}

.parent-question-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  color: #e6a23c;
}

.parent-question-header i {
  margin-right: 6px;
  font-size: 14px;
}

.parent-question-content {
  background: #ffffff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.current-question-content {
  position: relative;
}

.sub-question-label {
  margin-bottom: 10px;
}

.sub-question-label .el-tag {
  font-weight: 500;
}

.image-link-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 15px;
}

.image-link-section h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.image-link-input {
  margin-top: 5px;
}

/* 自定义工具栏样式 */
.custom-toolbar {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  flex-wrap: wrap;
}

.toolbar-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
  flex: 1;
}

.image-preview-section {
  width: 100%;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.image-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.toolbar-image-preview {
  max-width: 120px;
  max-height: 80px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  object-fit: contain;
  background-color: #fafafa;
}

.image-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}


/* 图片预览样式 */
.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-top: 10px;
}

/* 题目组样式 */
.question-group {
  margin-bottom: 15px;
}

.question-group .question-item.main-question {
  border-left: 4px solid #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.question-group .question-item.sub-question {
  border-left: 4px solid #e6a23c;
  background: linear-gradient(135deg, #fdf6ec 0%, #ffffff 100%);
  margin-left: 20px;
  margin-top: 8px;
  position: relative;
}

.question-group .question-item.sub-question::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  width: 15px;
  height: 1px;
  background: #e6a23c;
  transform: translateY(-50%);
}

.question-group .question-item.sub-question::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  width: 1px;
  height: 50%;
  background: #e6a23c;
}

/* 删除按钮样式 */
.delete-question-btn {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.delete-question-btn:hover {
  opacity: 1;
  background-color: #fef0f0;
  border-radius: 4px;
}

.question-item:hover .delete-question-btn {
  opacity: 1;
}

/* 拖拽相关样式 */
.sub-questions-container {
  position: relative;
}

.drag-handle {
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: move;
  color: #909399;
  font-size: 12px;
  transition: all 0.3s ease;
  z-index: 10;
}

.drag-handle:hover {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.insert-buttons {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.insert-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  min-height: 20px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  color: #409eff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.3s ease;
}

.insert-btn:hover {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.add-subquestion-at-end {
  margin-left: 20px;
  margin-top: 8px;
  padding: 10px 0;
  text-align: center;
}

.add-subquestion-btn {
  width: 100%;
  border-style: dashed;
  color: #909399;
  background: #fafafa;
  border-color: #d9d9d9;
}

.add-subquestion-btn:hover {
  color: #409eff;
  border-color: #409eff;
  background: #f0f9ff;
}

/* 拖拽状态样式 */
.ghost-question {
  opacity: 0.5;
  background: #f0f9ff;
  border: 2px dashed #409eff;
}

.chosen-question {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.drag-question {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: rotate(2deg);
}

/* 子题拖拽时的特殊样式 */
.sub-question.dragging {
  opacity: 0.8;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .drag-handle {
    left: -25px;
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .insert-buttons {
    right: -25px;
  }

  .insert-btn {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }
}
</style>
