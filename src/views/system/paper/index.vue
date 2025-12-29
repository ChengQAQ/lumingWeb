<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="科目" prop="subject">
        <el-select
          v-model="queryParams.subject"
          placeholder="请选择科目"
          clearable
          @change="handleQuery"
          style="width: 100%"
        >
          <el-option
            v-for="item in subjectOptions"
            :key="item.subjectCode"
            :label="item.subjectName"
            :value="item.subjectCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="试卷名称" prop="customPaperName">
        <el-input
          v-model="queryParams.customPaperName"
          placeholder="请输入试卷名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-autocomplete
          v-model="queryParams.creatorNick"
          :fetch-suggestions="queryCreatorSearch"
          :trigger-on-focus="true"
          clearable
          placeholder="请输入或选择创建人"
          @select="handleCreatorSelect"
          style="width: 100%;"
        ></el-autocomplete>
        <input type="hidden" v-model="queryParams.creator" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker clearable
          v-model="queryParams.createTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择创建时间">
        </el-date-picker>
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
          v-hasPermi="['system:paper:add']"
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
          v-hasPermi="['system:paper:edit']"
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
          v-hasPermi="['system:paper:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:paper:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="paperList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="试卷ID" align="center" prop="id" /> -->
      <el-table-column label="科目" align="center" prop="subject">
        <template slot-scope="scope">
          <span>{{ getSubjectDisplay(scope.row.subject) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="试卷名称" align="center" prop="customPaperName" />
      <!-- 题目集合 -->
      <!-- <el-table-column label="题目ID集合" align="center" prop="questionIds">
        <template slot-scope="scope">
          <div v-if="scope.row.questionIds">
            <el-tag
              v-for="(questionId, index) in scope.row.questionIds.split(',').filter(id => id.trim()).slice(0, 3)"
              :key="index"
              size="mini"
              style="margin: 2px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;"
              :title="`题目ID: ${questionId}`"
            >
              {{ questionId.length > 20 ? questionId.substring(0, 20) + '...' : questionId }}
            </el-tag>
            <div v-if="scope.row.questionIds.split(',').filter(id => id.trim()).length > 3" style="margin-top: 5px;">
              <el-button type="text" size="mini" @click="showAllQuestions(scope.row.questionIds)">
                查看更多 ({{ scope.row.questionIds.split(',').filter(id => id.trim()).length }}个题目)
              </el-button>
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="章节ID集合" align="center" prop="knowledgePointIds">
        <template slot-scope="scope">
          <div v-if="scope.row.knowledgePointIds">
            <el-tag
              v-for="(chapter, index) in scope.row.knowledgePointIds.split(',').filter(ch => ch.trim()).slice(0, 2)"
              :key="index"
              type="success"
              size="mini"
              style="margin: 2px; max-width: 300px; overflow: hidden; text-overflow: ellipsis;"
              :title="`章节路径: ${chapter}`"
            >
                {{ chapter.split('/').pop() }}
            </el-tag>
            <div v-if="scope.row.knowledgePointIds.split(',').filter(ch => ch.trim()).length > 2" style="margin-top: 5px;">
              <el-button type="text" size="mini" @click="showAllChapters(scope.row.knowledgePointIds)">
                查看更多 ({{ scope.row.knowledgePointIds.split(',').filter(ch => ch.trim()).length }}个章节)
              </el-button>
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column label="创建人" align="center" prop="creator">
        <template slot-scope="scope">
          <span>{{ getCreatorName(scope.row.creator) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handleDownloadWord(scope.row)"
          >Word</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-printer"
            @click="handlePrint(scope.row)"
          >打印</el-button> -->
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:paper:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:paper:remove']"
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

    <!-- 组卷详情弹窗 -->
    <el-dialog
      title="组卷详情"
      :visible.sync="detailVisible"
      width="1000px"
      height="90vh"
      append-to-body
      @close="closeDetail"
      style="overflow: hidden;"
    >
      <div v-if="currentPaper" class="paper-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="组卷ID">{{ currentPaper.id }}</el-descriptions-item>
          <el-descriptions-item label="科目">
            <el-tag type="primary">{{ getSubjectDisplay(currentPaper.subject) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="试卷名称" :span="2">{{ currentPaper.customPaperName }}</el-descriptions-item>
          <el-descriptions-item label="创建人">
            <el-avatar size="small">
              {{ getCreatorName(currentPaper.creator).charAt(0) }}
            </el-avatar>
            <span style="margin-left: 5px;">{{ getCreatorName(currentPaper.creator) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(currentPaper.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        </el-descriptions>

        <!-- <div class="detail-section">
          <h4>章节信息</h4>
          <div v-if="currentPaper.knowledgePointIds">
            <el-tag
              v-for="(chapter, index) in currentPaper.knowledgePointIds.split(',').filter(ch => ch.trim())"
              :key="index"
              type="success"
              size="small"
              style="margin: 2px;"
            >
              {{ chapter }}
            </el-tag>
            <div class="chapter-count">
              共 {{ currentPaper.knowledgePointIds.split(',').filter(ch => ch.trim()).length }} 个章节
            </div>
          </div>
          <span v-else class="no-data">暂无章节</span>
        </div> -->

        <div class="detail-section">
          <h4>题目信息</h4>
          <div v-if="paperQuestions.length > 0" class="question-cards">
            <div
              v-for="(question, index) in paperQuestions"
              :key="question.SID || index"
              class="question-card"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-type">{{ question.CateName }}</span>
                <span class="question-difficulty">难度: {{ question.Degree }}</span>
              </div>
              <div class="question-content">
                <div class="question-text">
                  <span v-if="question.Label" class="question-label">{{ question.Label }}</span>
                  <span v-html="processQuestionContent(question.Content)"></span>
                </div>
                <div class="question-options" v-if="question.Options && question.Options.length > 0">
                  <div
                    v-for="(option, optIndex) in question.Options"
                    :key="optIndex"
                    class="option-item"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                    <span class="option-content" v-html="processQuestionContent(removeOptionPrefix(option, optIndex))"></span>
                  </div>
                </div>
                <div class="question-info">
                  <span class="info-item">知识点: {{ formatKnowledgePoints(question.Points) }}</span>
                  <span class="info-item">答案: <span v-html="processAnswerContent(question)"></span></span>
                </div>
                <div class="question-analysis" v-if="question.Analyse">
                  <div class="analysis-title">解析:</div>
                  <div class="analysis-content" v-html="processQuestionContent(question.Analyse)"></div>
                </div>
                <div class="question-discussion" v-if="question.Discuss">
                  <div class="discussion-title">讨论:</div>
                  <div class="discussion-content" v-html="processQuestionContent(question.Discuss)"></div>
                </div>
              </div>
            </div>
            <div class="question-count">
              共 {{ paperQuestions.length }} 个题目
            </div>
          </div>
          <span v-else class="no-data">暂无题目</span>
        </div>

      </div>
    </el-dialog>

    <!-- 添加或修改组卷对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="科目" prop="subject">
          <el-select
            v-model="form.subject"
            placeholder="请选择科目"
            style="width: 100%"
          >
            <el-option
              v-for="item in subjectOptions"
              :key="item.subjectCode"
              :label="item.subjectName"
              :value="item.subjectCode"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label="试卷名称" prop="customPaperName">
          <el-input v-model="form.customPaperName" placeholder="请输入试卷名称" />
        </el-form-item>

        <!-- 章节选择区域 -->
        <!-- <el-form-item label="章节选择" prop="knowledgePointIds">
          <el-cascader
            v-model="form.knowledgeCode"
            :options="chapterOptions"
            :props="chapterProps"
            placeholder="请选择章节（建议选择到具体章节）"
            clearable
            @change="handleFormChapterChange"
            :show-all-levels="true"
            style="width: 300px; margin-right: 10px;"
          ></el-cascader>
          <div style="margin-left: -42px;font-size: 12px; color: #909399; margin-top: 4px;">
            💡 提示：建议选择到具体的章节节点，避免选择父级目录
          </div>
          <el-button type="primary" size="small" @click="addChapter" :disabled="!form.knowledgeCode || form.knowledgeCode.length === 0" style="margin-top: 10px;">
            添加章节
          </el-button>

          <div v-if="selectedChapters.length > 0" style="margin-top: 10px;">
            <div style="font-weight: bold; margin-bottom: 5px;">已选择的章节：</div>
            <el-tag
              v-for="(chapter, index) in selectedChapters"
              :key="index"
              closable
              @close="removeChapter(index)"
              :title="chapter"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ chapter.length > 20 ? chapter.substring(0, 20) + '...' : chapter }}
            </el-tag>
          </div>
        </el-form-item> -->

        <!-- 题目选择区域 -->
        <!-- <el-form-item label="题目选择" prop="questionIds">
          <el-select
            v-model="form.questionUrl"
            multiple
            filterable
            clearable
            placeholder="请选择题目"
            :disabled="!form.knowledgeCode"
            @focus="handleSidFocus"
            style="width: 100%">
            <el-option
              v-for="item in sidOptions"
              :key="item.sid"
              :label="item.question"
              :value="item.sid"
            />
          </el-select>
          <el-button type="primary" size="small" @click="addQuestion" :disabled="!form.questionUrl || form.questionUrl.length === 0" style="margin-top: 10px;">
            添加题目
          </el-button>

          <div v-if="selectedQuestions.length > 0" style="margin-top: 10px;">
            <div style="font-weight: bold; margin-bottom: 5px;">已选择的题目：</div>
            <el-tag
              v-for="(question, index) in selectedQuestions"
              :key="index"
              closable
              @close="removeQuestion(index)"
              :title="question"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ question.length > 20 ? question.substring(0, 20) + '...' : question }}
            </el-tag>
          </div>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- Word下载选择弹窗 -->
    <el-dialog
      title="Word文档下载选项"
      :visible.sync="wordDownloadDialogVisible"
      width="500px"
      :before-close="cancelDownloadWord"
    >
      <div class="download-options">
        <div class="option-item">
          <el-checkbox v-model="wordDownloadOptions.includeAnswerAnalysis">
            包含答案和解析
          </el-checkbox>
          <div class="option-description">
            <p>勾选此项将在Word文档中包含题目的答案和解析内容</p>
            <p>不勾选则只包含题目内容，适合作为试卷使用</p>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDownloadWord">取消</el-button>
        <el-button type="primary" @click="confirmDownloadWord" :loading="false">
          确认下载
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPaper, getPaper, delPaper, addPaper, updatePaper, getQuestionsBySids, htmlToWord } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import { sysGetchaptermap } from "@/api/system/knowledge"
import { listSid, sysUserList, sysSubjectList } from "@/api/system/task"
import { parseMathFormula } from "@/utils/mathFormula"
import { WordGenerator } from "@/utils/wordGenerator"
import latexRenderer from '@/utils/latexRenderer'

export default {
  name: "Paper",
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
      // 组卷表格数据
      paperList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        subject: null,
        customPaperName: null,
        questionIds: null,
        knowledgePointIds: null,
        creator: null,
        createTime: null,
        creatorNick: null // 新增创建人昵称字段
      },
      // 表单参数
      form: {
        id: null,
        subject: null,
        customPaperName: null,
        questionIds: null,
        knowledgePointIds: null,
        creator: null,
        createTime: null,
        knowledgeCode: [], // 添加章节字段，与task页面保持一致
        questionUrl: [] // 添加题目字段，与task页面保持一致
      },
      // 表单校验
      rules: {
        subject: [
          { required: true, message: "科目不能为空", trigger: "blur" }
        ],
        customPaperName: [
          { required: true, message: "试卷名称不能为空", trigger: "blur" }
        ],
        questionIds: [
          {
            validator: (rule, value, callback) => {
              if (this.selectedQuestions.length === 0) {
                callback(new Error('题目ID集合不能为空'));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        knowledgePointIds: [
          {
            validator: (rule, value, callback) => {
              if (this.selectedChapters.length === 0) {
                callback(new Error('章节ID集合不能为空'));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        creator: [
          { required: true, message: "创建人不能为空", trigger: "blur" }
        ],
      },
      // 科目选项
      subjectOptions: [],
      // 章节选项数据
      chapterOptions: [],
      // 章节级联选择器配置
      chapterProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true,
        lazy: false,
        multiple: false,
        emitPath: false,
        expandTrigger: 'click'
      },
      // 题目选项数据
      sidOptions: [],
      // 已选择的章节列表
      selectedChapters: [],
      // 已选择的题目列表
      selectedQuestions: [],
      // Word下载弹窗相关
      wordDownloadDialogVisible: false,
      wordDownloadOptions: {
        includeAnswerAnalysis: false
      },
      currentDownloadRow: null,
      // 当前选择的章节（用于获取题目）
      currentChapter: null,
      // 当前选择的题目（用于添加）
      currentQuestion: null,
      // 用户列表数据
      userList: [],
      // 预览相关数据
      detailVisible: false,
      currentPaper: null,
      paperQuestions: []
    }
  },
  created() {
    console.log('组卷界面 created 钩子执行');
    this.getList()
    this.getSubjectOptions()
    this.loadChapterList()
    this.loadUserList()
  },
  mounted() {
    // 检查是否从主页跳转过来并需要自动查看
    this.checkAutoViewMode()
  },
  activated() {
    // 检查是否需要刷新列表
    if (this.$store.getters.needRefresh) {
      this.getList()
      this.$store.commit('setNeedRefresh', false)
    }
    // 检查是否从主页跳转过来并需要自动查看
    this.checkAutoViewMode()
  },
  methods: {
    /** 格式化知识点显示 */
    formatKnowledgePoints(points) {
      // 如果是空值、空字符串、空数组，显示"无"
      if (!points || points === '' || points === '[]' || (Array.isArray(points) && points.length === 0)) {
        return '无'
      }

      // 如果是数组，用逗号连接
      if (Array.isArray(points)) {
        return points.join(', ')
      }

      // 如果是字符串，直接返回
      return points
    },

    /** 查询组卷列表 */
    getList() {
      console.log('开始获取组卷列表，查询参数:', this.queryParams);
      this.loading = true
      listPaper(this.queryParams).then(response => {
        console.log('组卷列表API响应:', response);
        // 兼容不同的响应格式
        if (response && response.code === 200) {
          this.paperList = response.rows || [];
          this.total = response.total || 0;
        } else if (response && response.rows) {
          this.paperList = response.rows;
          this.total = response.total || 0;
        } else if (Array.isArray(response)) {
          this.paperList = response;
          this.total = response.length;
        } else {
          this.paperList = [];
          this.total = 0;
        }
        console.log('处理后的组卷列表数据:', this.paperList);
        console.log('总数:', this.total);
        this.loading = false
      }).catch(error => {
        console.error('获取组卷列表失败:', error);
        this.$message.error('获取组卷列表失败：' + (error.message || '网络错误'));
        this.paperList = [];
        this.total = 0;
        this.loading = false;
      })
    },
    /** 查询科目列表 */
    getSubjectOptions() {
      listSubject().then(response => {
        console.log('科目列表API响应:', response);
        // 兼容不同的响应格式
        if (response && response.code === 200) {
          this.subjectOptions = response.rows || [];
        } else if (response && response.rows) {
          this.subjectOptions = response.rows;
        } else if (Array.isArray(response)) {
          this.subjectOptions = response;
        } else {
          this.subjectOptions = [];
        }
        console.log('处理后的科目选项:', this.subjectOptions);
      }).catch(error => {
        console.error('获取科目数据失败:', error);
        this.$message.error('获取科目数据失败：' + (error.message || '网络错误'));
        this.subjectOptions = [];
      })
    },
    /** 加载章节列表 */
    loadChapterList() {
      sysGetchaptermap().then(response => {
        console.log('章节列表API响应:', response);
        // 兼容不同的响应格式
        if (response && response.code === 200) {
          this.chapterOptions = response.data || [];
        } else if (response && response.data) {
          this.chapterOptions = response.data;
        } else if (Array.isArray(response)) {
          this.chapterOptions = response;
        } else {
          this.chapterOptions = [];
        }
        console.log('处理后的章节选项:', this.chapterOptions);
      }).catch(error => {
        console.error('获取章节列表失败:', error);
        this.$message.error('获取章节列表失败：' + (error.message || '网络错误'));
        this.chapterOptions = [];
      })
    },
    /** 加载用户列表 */
    loadUserList() {
      sysUserList().then(response => {
        console.log('用户列表API响应:', response);
        // 兼容不同的响应格式
        if (response && response.code === 200) {
          this.userList = response.data || [];
        } else if (response && response.data) {
          this.userList = response.data;
        } else if (Array.isArray(response)) {
          this.userList = response;
        } else {
          this.userList = [];
        }
        console.log('处理后的用户列表:', this.userList);
      }).catch(error => {
        console.error('获取用户列表失败:', error);
        this.$message.error('获取用户列表失败：' + (error.message || '网络错误'));
        this.userList = [];
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
        subject: null,
        customPaperName: null,
        questionIds: null,
        knowledgePointIds: null,
        creator: null,
        createTime: null,
        knowledgeCode: [], // 添加章节字段，与task页面保持一致
        questionUrl: [] // 添加题目字段，与task页面保持一致
      }
      this.resetForm("form")
      this.selectedChapters = []
      this.selectedQuestions = []
      this.currentQuestion = null
      this.sidOptions = []
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.queryParams.subject = null
      this.queryParams.creatorNick = ""
      this.queryParams.creator = null
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
      // 跳转到麓鸣题库，模式为组卷
      this.$router.push({
        path: '/student/lumingQuestionBank/index',
        query: { mode: 'paper' }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getPaper(id).then(response => {
        this.form = response.data

        // 回显章节数据
        if (this.form.knowledgePointIds) {
          this.selectedChapters = this.form.knowledgePointIds.split(',').filter(item => item.trim() !== '')
        } else {
          this.selectedChapters = []
        }

        // 回显题目数据
        if (this.form.questionIds) {
          this.selectedQuestions = this.form.questionIds.split(',').filter(item => item.trim() !== '')
        } else {
          this.selectedQuestions = []
        }

        this.open = true
        this.title = "修改组卷"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 将选择的章节和题目转换为逗号分隔的字符串并赋值给表单字段
          this.form.knowledgePointIds = this.selectedChapters.join(',')
          this.form.questionIds = this.selectedQuestions.join(',')

          if (this.form.id != null) {
            updatePaper(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addPaper(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除组卷编号为"' + ids + '"的数据项？').then(function() {
        return delPaper(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/paper/export', {
        ...this.queryParams
      }, `paper_${new Date().getTime()}.xlsx`)
    },
    // 科目名称显示
    getSubjectDisplay(subjectCode) {
      const subject = this.subjectOptions.find(item => item.subjectCode === subjectCode);
      return subject ? subject.subjectName : subjectCode;
    },
    // 创建人名称回显
    getCreatorName(userId) {
      const user = this.userList.find(item => item.userId === userId);
      return user ? user.nickName : userId;
    },
    // 添加章节
    addChapter() {
      if (this.form.knowledgeCode && this.form.knowledgeCode.length > 0) {
        // 构建完整路径
        const fullPath = this.buildChapterPath(this.form.knowledgeCode)
        if (!this.selectedChapters.includes(fullPath)) {
          this.selectedChapters.push(fullPath);
          this.form.knowledgeCode = []; // 清空当前选择的章节
        } else {
          this.$message.warning('该章节已添加');
        }
      } else {
        this.$message.warning('请选择一个章节');
      }
    },
    // 移除章节
    removeChapter(index) {
      this.selectedChapters.splice(index, 1);
    },
    // 添加题目
    addQuestion() {
      if (this.form.questionUrl && this.form.questionUrl.length > 0) {
        // 将选择的题目添加到已选择列表
        this.form.questionUrl.forEach(question => {
          if (!this.selectedQuestions.includes(question)) {
            this.selectedQuestions.push(question);
          }
        });
        this.form.questionUrl = []; // 清空当前选择的题目
      } else {
        this.$message.warning('请选择题目');
      }
    },
    // 移除题目
    removeQuestion(index) {
      this.selectedQuestions.splice(index, 1);
    },
    // 构建章节完整路径
    buildChapterPath(value) {
      // 如果value是数组，直接join
      if (Array.isArray(value)) {
        return value.join('/');
      }

      // 如果value是单个值，使用原来的逻辑
      const findPath = (options, targetValue, currentPath = []) => {
        for (let option of options) {
          const newPath = [...currentPath, option.label]

          if (option.value === targetValue) {
            return newPath.join('/')
          }

          if (option.children && option.children.length > 0) {
            const found = findPath(option.children, targetValue, newPath)
            if (found) return found
          }
        }
        return null
      }

      return findPath(this.chapterOptions, value) || value
    },
    // 处理章节选择变化 (用于表单)
    handleFormChapterChange(value) {
      if (value) {
        // 检查是否为叶子节点，给出友好提示
        const lastVal = Array.isArray(value) ? value[value.length - 1] : value;
        const isLeaf = this.isLeafNode(lastVal);
        if (!isLeaf) {
          this.$message({
            message: '您选择了父级目录，建议选择到具体的章节节点以获得更精确的结果',
            type: 'info',
            duration: 3000
          });
        }
        // 章节变化时，自动请求题目列表
        const chapterPath = Array.isArray(value) ? value : [value];
        // 如果cascader value是label路径，直接join；如果是id路径，需做label转id
        listSid({ a: chapterPath.join('/') }).then(res => {
          this.sidOptions = Array.isArray(res) ? res : [];
        });
      } else {
        this.sidOptions = [];
      }
    },
    // 检查是否为叶子节点
    isLeafNode(value) {
      const findNode = (options, targetValue) => {
        for (let option of options) {
          if (option.value === targetValue) {
            return !option.children || option.children.length === 0
          }
          if (option.children && option.children.length > 0) {
            const found = findNode(option.children, targetValue)
            if (found !== null) return found
          }
        }
        return null
      }
      return findNode(this.chapterOptions, value)
    },
    // 处理题目选择框聚焦
    handleSidFocus() {
      if (!this.form.knowledgeCode) {
        this.$message.warning('请先选择章节');
        return;
      }
    },
    // 显示所有题目
    showAllQuestions(questionIds) {
      const questions = questionIds.split(',').filter(id => id.trim());
      this.$alert(questions.join('\n'), '所有题目ID', {
        confirmButtonText: '确定',
        customClass: 'custom-alert'
      });
    },
    // 显示所有章节
    showAllChapters(knowledgePointIds) {
      const chapters = knowledgePointIds.split(',').filter(ch => ch.trim());
      this.$alert(chapters.join('\n'), '所有章节路径', {
        confirmButtonText: '确定',
        customClass: 'custom-alert'
      });
    },
    // 创建人搜索
    queryCreatorSearch(queryString, callback) {
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
    // 创建人选择
    handleCreatorSelect(item) {
      this.queryParams.creatorNick = item.nickName;
      this.queryParams.creator = item.id;
    },
    // 检查自动查看模式
    checkAutoViewMode() {
      const autoViewMode = sessionStorage.getItem('autoViewMode')
      if (autoViewMode === 'true') {
        // 立即清除标记，防止重复处理
        sessionStorage.removeItem('autoViewMode')

        // 获取选中的项目
        const selectedItemStr = sessionStorage.getItem('selectedExamItem')

        if (selectedItemStr) {
          try {
            const selectedItem = JSON.parse(selectedItemStr)
            console.log('从主页传递的选中项目:', selectedItem)

            // 立即清除存储的数据，防止重复处理
            sessionStorage.removeItem('selectedExamItem')

            // 等待数据加载完成后再查找对应的项目
            const checkDataLoaded = () => {
              if (this.paperList && this.paperList.length > 0) {
                // 在表格中查找对应的项目
                const targetItem = this.paperList.find(item =>
                  item.customPaperName === selectedItem.customPaperName ||
                  item.id === selectedItem.id
                )

                if (targetItem) {
                  console.log('找到匹配的项目，自动触发查看:', targetItem)
                  // 自动触发查看功能
                  this.handleView(targetItem)
                } else {
                  console.log('未找到匹配的项目，当前列表数据:', this.paperList)
                  console.log('查找条件:', { customPaperName: selectedItem.customPaperName, id: selectedItem.id })
                  this.$message.warning('未找到对应的组卷项目')
                }
              } else {
                // 如果数据还没加载完成，等待100ms后再次检查
                setTimeout(checkDataLoaded, 100)
              }
            }

            // 开始检查数据是否加载完成
            checkDataLoaded()

          } catch (error) {
            console.error('解析选中项目失败:', error)
            sessionStorage.removeItem('selectedExamItem')
          }
        }
      }
    },
    // 查看组卷详情
    handleView(row) {
      this.currentPaper = row;
      this.detailVisible = true;
      this.paperQuestions = []; // 清空之前加载的题目
      if (this.currentPaper.questionIds) {
        const questionIds = this.currentPaper.questionIds.split(',').filter(id => id.trim());
        if (questionIds.length > 0) {
          this.loadQuestionDetails(questionIds);
        }
      }
    },

    // 下载Word文档 - 显示选择弹窗
    handleDownloadWord(row) {
      this.currentDownloadRow = row
      this.wordDownloadOptions.includeAnswerAnalysis = false // 重置选项
      this.wordDownloadDialogVisible = true
    },

    // 确认生成HTML内容并下载Word文档
    async confirmDownloadWord() {
      try {
        this.$message.info('正在生成Word文档，请稍候...')

        // 获取试卷详情和题目数据
        const paperResponse = await getPaper(this.currentDownloadRow.id)
        if (paperResponse.code !== 200) {
          this.$message.error('获取试卷详情失败')
          return
        }

        const paper = paperResponse.data
        if (!paper.questionIds) {
          this.$message.warning('该试卷没有题目数据')
          return
        }

        // 获取题目数据
        const questionIds = paper.questionIds.split(',').filter(id => id.trim())
        const questions = await this.getQuestionsData(questionIds, paper.subject)

        if (questions.length === 0) {
          this.$message.warning('没有找到题目数据')
          return
        }

        // 生成HTML内容，传递答案解析选项
        const htmlContent = WordGenerator.generatePrintHTML(paper, questions, 'paper', this.wordDownloadOptions.includeAnswerAnalysis)

        // 准备API请求数据
        const requestData = {
          html: htmlContent,
          file_name: paper.customPaperName || '试卷文档'
        }

        console.log('=== 发送到API的数据 ===')
        console.log('文件名:', requestData.file_name)
        console.log('HTML长度:', htmlContent.length)
        console.log('包含答案解析:', this.wordDownloadOptions.includeAnswerAnalysis)

        // 调用htmlToWord接口
        const response = await htmlToWord(requestData)

        // 处理blob响应，下载Word文档
        if (response instanceof Blob) {
          // 创建下载链接
          const url = window.URL.createObjectURL(response)
          const link = document.createElement('a')
          link.href = url
          link.download = `${paper.customPaperName || '试卷文档'}_${new Date().getTime()}.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          this.$message.success('Word文档下载成功！')
        } else {
          console.log('响应不是Blob类型:', response)
          this.$message.error('下载失败：响应格式不正确')
        }

        // 关闭弹窗
        this.wordDownloadDialogVisible = false

      } catch (error) {
        console.error('生成Word文档失败:', error)
        this.$message.error('生成Word文档失败：' + error.message)
      }
    },

    // 取消下载Word文档
    cancelDownloadWord() {
      this.wordDownloadDialogVisible = false
      this.currentDownloadRow = null
    },

    // 打印预览
    async handlePrint(row) {
      try {
        this.$message.info('正在准备打印预览，请稍候...')

        // 获取试卷详情和题目数据
        const paperResponse = await getPaper(row.id)
        if (paperResponse.code !== 200) {
          this.$message.error('获取试卷详情失败')
          return
        }

        const paper = paperResponse.data
        if (!paper.questionIds) {
          this.$message.warning('该试卷没有题目数据')
          return
        }

        // 获取题目数据
        const questionIds = paper.questionIds.split(',').filter(id => id.trim())
        const questions = await this.getQuestionsData(questionIds, paper.subject)

        if (questions.length === 0) {
          this.$message.warning('没有找到题目数据')
          return
        }

        // 生成打印预览HTML
        const html = await WordGenerator.generatePrintHTML(paper, questions, 'paper')

        // 打开新窗口显示打印预览
        const printWindow = window.open('', '_blank')
        printWindow.document.write(html)
        printWindow.document.close()

      } catch (error) {
        console.error('生成打印预览失败:', error)
        this.$message.error('生成打印预览失败：' + error.message)
      }
    },

    // 获取题目数据的通用方法
    async getQuestionsData(questionIds, subject) {
      try {
        console.log('开始获取题目数据，题目ID:', questionIds, '科目:', subject)

        // 使用本地方法获取科目名称
        const subjectName = this.getSubjectName(subject) || subject

        console.log('获取到的科目名称:', subjectName)

        // 获取题目数据
        const requestData = {
          sids: questionIds,
          subject_name: subjectName
        }

        console.log('请求题目数据的参数:', requestData)

        const questionsResponse = await getQuestionsBySids(requestData)
        console.log('API返回的原始题目数据:', questionsResponse)

        // 处理响应数据
        if (questionsResponse) {
          if (questionsResponse.code !== undefined) {
            if (questionsResponse.code === 200) {
              const questions = questionsResponse.data && questionsResponse.data.questions
                ? questionsResponse.data.questions
                : questionsResponse.data || []
              console.log('处理后的题目数据:', questions)
              return questions
            } else {
              throw new Error(questionsResponse.msg || '获取题目数据失败')
            }
          } else if (questionsResponse.questions) {
            console.log('直接使用questions字段:', questionsResponse.questions)
            return questionsResponse.questions || []
          } else {
            const questions = Array.isArray(questionsResponse) ? questionsResponse : []
            console.log('使用数组格式的题目数据:', questions)
            return questions
          }
        } else {
          throw new Error('获取题目数据失败：响应为空')
        }
      } catch (error) {
        console.error('获取题目数据失败:', error)
        throw error
      }
    },
    // 关闭详情弹窗
    closeDetail() {
      this.detailVisible = false;
      this.currentPaper = null;
      this.paperQuestions = []; // 清空题目详情数据
    },
    // 加载题目详情
    loadQuestionDetails(questionIds) {
      this.loading = true;
      // 首先获取组卷详情
      getPaper(this.currentPaper.id).then(response => {
        if (response.code === 200) {
          const paper = response.data;
          if (paper.questionIds) {
            // 将题目ID字符串转换为数组
            const sids = paper.questionIds.split(',').filter(id => id.trim());
            // 使用本地方法获取科目名称
            const subjectName = this.getSubjectName(paper.subject) || paper.subject;
            // 获取题目数据
            const requestData = {
              sids: sids,
              subject_name: subjectName
            };
            return getQuestionsBySids(requestData);
          } else {
            this.paperQuestions = [];
            this.loading = false;
            throw new Error('组卷没有题目数据');
          }
        } else {
          this.$message.error('获取组卷详情失败：' + response.msg);
          this.paperQuestions = [];
          this.loading = false;
          throw new Error('获取组卷详情失败');
        }
      }).then(questionsResponse => {
        // 检查响应格式，支持多种可能的返回格式
        if (questionsResponse) {
          // 如果响应有 code 字段，检查是否为 200
          if (questionsResponse.code !== undefined) {
            if (questionsResponse.code === 200) {
              // 检查是否有 questions 字段
              if (questionsResponse.data && questionsResponse.data.questions) {
                this.paperQuestions = questionsResponse.data.questions || [];
              } else {
                this.paperQuestions = questionsResponse.data || [];
              }
            } else {
              this.$message.error('获取题目数据失败：' + (questionsResponse.msg || '未知错误'));
              this.paperQuestions = [];
            }
          } else if (questionsResponse.questions) {
            // 如果响应有 questions 字段，使用 questions 数组
            this.paperQuestions = questionsResponse.questions || [];
          } else {
            // 如果没有 code 字段，直接使用响应数据
            this.paperQuestions = Array.isArray(questionsResponse) ? questionsResponse : [];
          }
        } else {
          this.$message.error('获取题目数据失败：响应为空');
          this.paperQuestions = [];
        }
      }).catch(error => {
        this.$message.error('获取题目详情失败：' + error.message);
        this.paperQuestions = [];
      }).finally(() => {
        this.loading = false;
      });
    },
    // 处理题目内容中的HTML标签
    processQuestionContent(content) {
      if (!content) return '';
      // 使用latexRenderer处理题目内容，包括HTML解码和LaTeX渲染
      return latexRenderer.processQuestionContent(content);
    },

    // 处理答案内容
    processAnswerContent(question) {
      if (!question) return '';

      let answerContent = '';

      // 如果DisplayAnswer是"见解答"，则使用Method字段
      if ((question.DisplayAnswer === '见解答' || question.DisplayAnswer === '见试题解答内容') && question.Method) {
        answerContent = question.Method;
      } else if (question.DisplayAnswer) {
        answerContent = question.DisplayAnswer;
      } else if (question.Method) {
        answerContent = question.Method;
      }

      if (!answerContent) return '';

      // 使用latexRenderer处理答案内容，包括HTML解码和LaTeX渲染
      return latexRenderer.processQuestionContent(answerContent);
    },

    // 处理bdo标签
    processBdoTags(content) {
      if (!content) return content;

      return content
        // 处理bdo标签，移除class属性但保留内容
        .replace(/<bdo[^>]*class="[^"]*"[^>]*>/g, '<bdo>')
        .replace(/<bdo[^>]*>/g, '<bdo>')
        // 处理br标签，确保正确显示
        .replace(/<br\s*\/?>/gi, '<br>')
        // 处理&nbsp;实体
        .replace(/&nbsp;/g, ' ');
    },

    // 解码HTML实体
    decodeHtmlEntities(text) {
      if (!text) return '';
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    },
    // 解析选项内容
    parseOptions(options) {
      if (!options) return [];
      // 如果options是字符串，尝试解析为JSON
      if (typeof options === 'string') {
        try {
          return JSON.parse(options);
        } catch (e) {
          return [];
        }
      }
      // 如果options是数组，直接返回
      if (Array.isArray(options)) {
        return options;
      }
      return [];
    },
    // 解析子题目
    parseChildren(children) {
      if (!children) return [];
      // 如果children是字符串，尝试解析为JSON
      if (typeof children === 'string') {
        try {
          return JSON.parse(children);
        } catch (e) {
          return [];
        }
      }
      // 如果children是数组，直接返回
      if (Array.isArray(children)) {
        return children;
      }
      return [];
    },

    // 移除选项前缀 - 使用latexRenderer的统一方法
    removeOptionPrefix(option, index) {
      return latexRenderer.removeOptionPrefix(option, index)
    }
  }
}
</script>

<style scoped>
.custom-alert {
  max-width: 600px;
}

.custom-alert .el-message-box__content {
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-line;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
}

.el-tag {
  word-break: break-all;
}

/* 组卷详情样式 */
.paper-detail {
  height: 75vh;
  overflow-y: auto;
}

.detail-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.question-count,
.chapter-count {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}

.no-data {
  color: #909399;
  font-style: italic;
}

/* 题目列表样式 */
.question-list {
  max-height: 400px;
  overflow-y: auto;
}

.question-card {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.question-number {
  font-weight: bold;
  color: #409eff;
  /* margin-right: 10px; */
}

.question-type {
  background-color: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 10px;
}

.question-difficulty {
  color: #909399;
  font-size: 12px;
}

.question-content {
  margin-bottom: 10px;
}

.question-text {
  line-height: 1.6;
  margin-bottom: 10px;
}

.question-label {
  background-color: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.question-options {
  margin: 10px 0;
}

.option-item {
  /* display: flex; */
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  color: #409eff;
  min-width: 20px;
}

.option-content {
  flex: 1;
  line-height: 1.5;
}

.sub-questions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.sub-question-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.sub-question-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.sub-question-number {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
}

.sub-question-type {
  background-color: #67c23a;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.sub-question-content {
  line-height: 1.5;
}

/* 答案输入区域样式 */
.answer-input-area {
  border-bottom: 1px solid black;
  display: inline-block;
  min-width: 100px;
  min-height: 20px;
  padding: 2px 4px;
  margin: 0 2px;
  background: transparent;
  color: #333;
  font-style: normal;
  font-weight: normal;
  text-align: center;
  vertical-align: middle;
  line-height: 1.2;
  border-radius: 2px;
}

.answer-input-area:empty:before {
  content: "请输入答案...";
  color: #c0c4cc;
  font-style: italic;
}

.answer-input-area:focus {
  outline: none;
  border-bottom-color: #409eff;
  border-bottom-width: 2px;
  background: #f0f9ff;
}

/* 题目内容样式增强 */
.question-text {
  line-height: 1.6;
  margin-bottom: 10px;
  color: #303133;
}

.question-text img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 5px 0;
}

.question-label {
  background-color: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  border: 1px solid #d1e7ff;
}

/* 题目卡片样式 */
.question-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.question-number {
  font-weight: bold;
  color: #409eff;
  font-size: 16px;
  /* min-width: 30px; */
}

.question-type {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.question-difficulty {
  color: #909399;
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.question-content {
  color: #303133;
}

.question-text {
  line-height: 1.6;
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
}

.question-options {
  margin: 12px 0;
}

.option-item {
  /* display: flex; */
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
  white-space: nowrap; /* 防止选项和内容换行 */
}

.option-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
  flex-shrink: 0; /* 防止标签被压缩 */
}

.option-content {
  flex: 1;
  line-height: 1.5;
  color: #606266;
  white-space: normal; /* 允许内容内部换行 */
  word-wrap: break-word; /* 长单词自动换行 */
  overflow-wrap: break-word; /* 现代浏览器的换行支持 */
}

.question-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.info-item {
  background: #f0f9ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #d1e7ff;
}

.question-count {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 16px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.question-analysis,
.question-discussion {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
}

.analysis-title,
.discussion-title {
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 8px;
  font-size: 14px;
}

.analysis-content,
.discussion-content {
  line-height: 1.6;
  color: #606266;
  font-size: 13px;
}

.question-discussion {
  border-left-color: #e6a23c;
}

.discussion-title {
  color: #e6a23c;
}

/* Word下载弹窗样式 */
.download-options {
  padding: 20px 0;
}

.option-item {
  /* display: flex; */
  flex-direction: column;
  gap: 10px;
}

.option-description {
  margin-left: 24px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.option-description p {
  margin: 5px 0;
}
</style>
