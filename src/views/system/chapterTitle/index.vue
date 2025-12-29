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
      <el-form-item label="章节名称" prop="customPaperName">
        <el-input
          v-model="queryParams.customPaperName"
          placeholder="请输入章节名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-input
          v-model="queryParams.creator"
          placeholder="请输入创建人"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['system:chapterTitle:add']"
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
          v-hasPermi="['system:chapterTitle:edit']"
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
          v-hasPermi="['system:chapterTitle:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:chapterTitle:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" stripe>
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="章节ID" align="center" prop="id" width="80" /> -->
      <el-table-column label="科目" align="center" prop="subject" width="120">
        <template slot-scope="scope">
          <el-tag type="primary" size="small">{{ getSubjectName(scope.row.subject) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="章节名称" align="center" prop="customPaperName" min-width="200">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.customPaperName" placement="top">
            <span class="chapter-name">{{ scope.row.customPaperName }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="题目数量" align="center" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.questionIds" type="info" size="small">
            {{ scope.row.questionIds.split(',').filter(id => id.trim()).length }}题
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="关联章节" align="center" width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.relatedChapterPath" type="success" size="small" :title="scope.row.relatedChapterPath">
            {{ scope.row.relatedChapterPath.split('/').pop() }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="creator" width="120">
        <template slot-scope="scope">
          <el-avatar size="small">
            {{ getCreatorName(scope.row.creator).charAt(0) || '?' }}
          </el-avatar>
          <span style="margin-left: 5px;">{{ getCreatorName(scope.row.creator) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="360">
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
            v-hasPermi="['system:chapterTitle:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:chapterTitle:remove']"
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

    <!-- 添加或修改章节对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="520px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <!-- <el-form-item label="科目" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入科目" />
        </el-form-item> -->
        <el-form-item label="章节名称" prop="customPaperName">
          <el-input v-model="form.customPaperName" placeholder="请输入章节名称" />
        </el-form-item>
        <!-- <el-form-item label="题目ID集合" prop="questionIds">
          <el-input v-model="form.questionIds" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
        <!-- <el-form-item label="关联章节路径" prop="relatedChapterPath">
          <el-input v-model="form.relatedChapterPath" placeholder="请输入关联章节路径" />
        </el-form-item> -->
        <!-- <el-form-item label="创建人" prop="creator">
          <el-input v-model="form.creator" placeholder="请输入创建人" />
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 章节详情弹窗 -->
    <el-dialog
      title="章节详情"
      :visible.sync="detailVisible"
      width="800px"
      append-to-body
      @close="closeDetail"
    >
      <div v-if="currentChapter" class="chapter-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="章节ID">{{ currentChapter.id }}</el-descriptions-item>
          <el-descriptions-item label="科目">
            <el-tag type="primary">{{ getSubjectName(currentChapter.subject) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="章节名称" :span="2">{{ currentChapter.customPaperName }}</el-descriptions-item>
          <el-descriptions-item label="创建人">
            <el-avatar size="small">
              {{ getCreatorName(currentChapter.creator).charAt(0) || '?' }}
            </el-avatar>
            <span style="margin-left: 5px;">{{ getCreatorName(currentChapter.creator) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(currentChapter.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>关联章节信息</h4>
          <div v-if="currentChapter.relatedChapterPath">
            <el-tag type="success" size="small" style="margin: 2px;" :title="`${currentChapter.relatedChapterPath}`">
              <!-- {{ currentChapter.relatedChapterPath }} -->
              {{ currentChapter.relatedChapterPath.length > 50 ? currentChapter.relatedChapterPath.substring(0, 50) + '...' : currentChapter.relatedChapterPath }}
            </el-tag>
            <!-- <div class="chapter-count">
              关联章节路径
            </div> -->
          </div>
          <span v-else class="no-data">暂无关联章节</span>
        </div>

        <div class="detail-section">
          <h4>题目信息</h4>
          <div v-if="chapterQuestions.length > 0" class="question-cards">
            <div
              v-for="(question, index) in chapterQuestions"
              :key="question.SID || index"
              class="question-card"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-type">{{ question.CateName || question.cate || question.type }}</span>
                <span class="question-difficulty">难度: {{ question.Degree || question.difficulty || question.degree }}</span>
              </div>
              <div class="question-content">
                <div class="question-text">
                  <span v-if="question.Label || question.label" class="question-label">{{ question.Label || question.label }}</span>
                  <span v-html="processQuestionContent(question.question || question.Content || question.content)"></span>
                </div>
                <div class="question-options" v-if="question.Options && question.Options.length > 0">
                  <div
                    v-for="(option, optIndex) in question.Options"
                    :key="optIndex"
                    class="option-item"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                    <span class="option-content" v-html="processQuestionContent(option)"></span>
                  </div>
                </div>
                <div class="question-options" v-else-if="question.options || question.Options">
                  <div
                    v-for="(option, optIndex) in parseOptions(question.options || question.Options)"
                    :key="optIndex"
                    class="option-item"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                    <span class="option-content" v-html="processQuestionContent(option)"></span>
                  </div>
                </div>
                <div class="question-info">
                  <span class="info-item">知识点: {{ formatKnowledgePoints(question.Points || question.points) }}</span>
                  <span class="info-item">答案: <span v-html="processAnswerContent(question)"></span></span>
                </div>
                <div class="question-analysis" v-if="question.Analyse || question.analyse">
                  <div class="analysis-title">解析:</div>
                  <div class="analysis-content" v-html="processQuestionContent(question.Analyse || question.analyse)"></div>
                </div>
                <div class="question-discussion" v-if="question.Discuss || question.discuss">
                  <div class="discussion-title">讨论:</div>
                  <div class="discussion-content" v-html="processQuestionContent(question.Discuss || question.discuss)"></div>
                </div>
                <div class="question-method" v-if="question.Method || question.method">
                  <div class="method-title">解答:</div>
                  <div class="method-content" v-html="processQuestionContent(question.Method || question.method)"></div>
                </div>
              </div>
            </div>
            <div class="question-count">
              共 {{ chapterQuestions.length }} 个题目
            </div>
          </div>
          <span v-else class="no-data">暂无题目</span>
        </div>

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
import { listTable, getTable, delTable, addTable, updateTable } from "@/api/system/chapterTitle"
import { getQuestionsBySids } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import { sysUserList } from "@/api/system/knowledge"
import { parseMathFormula } from "@/utils/mathFormula"
import { WordGenerator } from "@/utils/wordGenerator"

export default {
  name: "ChapterTitle",
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
      // 章节表格数据
      tableList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 详情弹窗显示状态
      detailVisible: false,
      // 当前查看的章节
      currentChapter: null,
      // 章节题目列表
      chapterQuestions: [],
      // Word下载弹窗相关
      wordDownloadDialogVisible: false,
      wordDownloadOptions: {
        includeAnswerAnalysis: false
      },
      currentDownloadRow: null,
      // 科目选项
      subjectOptions: [],
      // 用户列表
      userList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        subject: null,
        customPaperName: null,
        questionIds: null,
        relatedChapterPath: null,
        creator: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        subject: [
          { required: true, message: "科目不能为空", trigger: "blur" }
        ],
        customPaperName: [
          { required: true, message: "章节名称不能为空", trigger: "blur" }
        ],
        questionIds: [
          { required: true, message: "题目ID集合不能为空", trigger: "blur" }
        ],
        creator: [
          { required: true, message: "创建人不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
    this.loadSubjectOptions()
    this.loadUserList()
  },
  mounted() {
    // 检查是否从主页跳转过来并需要自动查看
    this.checkAutoViewMode()

    // 监听路由变化，当从新增页面返回时刷新列表
    this.$watch('$route', (to, from) => {
      if (to.path === '/system/chapterTitle' && from.path === '/system/chapterTitle/addChapterQuestion') {
        this.getList()
      }
    })
  },
  activated() {
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

    /** 查询章节列表 */
    getList() {
      this.loading = true
      listTable(this.queryParams).then(response => {
        console.log('章节题列表响应:', response);
        if (response.code === 200) {
          this.tableList = response.rows || [];
          this.total = response.total || 0;
        } else {
          this.tableList = [];
          this.total = 0;
          console.error('获取章节题列表失败:', response);
        }
        this.loading = false
      }).catch(error => {
        console.error('获取章节题列表失败:', error);
        this.tableList = [];
        this.total = 0;
        this.loading = false;
      })
    },
    // 加载科目选项
    loadSubjectOptions() {
      listSubject().then(response => {
        this.subjectOptions = response.rows || []
      })
    },
    // 加载用户列表
    loadUserList() {
      sysUserList().then(response => {
        this.userList = response.rows || []
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
        relatedChapterPath: null,
        creator: null,
        createTime: null
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
      this.$router.push('/system/chapterTitle/addChapterQuestion')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getTable(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改章节"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTable(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addTable(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除章节编号为"' + ids + '"的数据项？').then(function() {
        return delTable(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/table/export', {
        ...this.queryParams
      }, `chapterTitle_${new Date().getTime()}.xlsx`)
    },
    // 获取科目名称
    getSubjectName(subjectCode) {
      if (!subjectCode) return '';
      const subject = this.subjectOptions.find(item => item.subjectCode === subjectCode);
      return subject ? subject.subjectName : subjectCode;
    },
    // 获取创建人名称
    getCreatorName(creatorId) {
      if (!creatorId) return '未知用户';
      const user = this.userList.find(item => item.userId === creatorId);
      const userName = user ? user.nickName : creatorId;
      return userName ? String(userName) : '未知用户';
    },

    // 检查自动查看模式
    checkAutoViewMode() {
      const autoViewMode = sessionStorage.getItem('autoViewMode')
      if (autoViewMode === 'true') {
        // 立即清除标记，防止重复处理
        sessionStorage.removeItem('autoViewMode')

        // 获取选中的项目
        const selectedItemStr = sessionStorage.getItem('selectedChapterItem')

        if (selectedItemStr) {
          try {
            const selectedItem = JSON.parse(selectedItemStr)
            console.log('从主页传递的选中项目:', selectedItem)

            // 立即清除存储的数据，防止重复处理
            sessionStorage.removeItem('selectedChapterItem')

            // 等待数据加载完成后再查找对应的项目
            const checkDataLoaded = () => {
              if (this.tableList && this.tableList.length > 0) {
                // 在表格中查找对应的项目
                const targetItem = this.tableList.find(item =>
                  item.customPaperName === selectedItem.customPaperName ||
                  item.id === selectedItem.id
                )

                if (targetItem) {
                  console.log('找到匹配的项目，自动触发查看:', targetItem)
                  // 自动触发查看功能
                  this.handleView(targetItem)
                } else {
                  console.log('未找到匹配的项目，当前列表数据:', this.tableList)
                  console.log('查找条件:', { customPaperName: selectedItem.customPaperName, id: selectedItem.id })
                  this.$message.warning('未找到对应的章节题项目')
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
            sessionStorage.removeItem('selectedChapterItem')
          }
        }
      }
    },
    // 查看章节详情
    handleView(row) {
      this.currentChapter = row;
      this.detailVisible = true;
      this.chapterQuestions = []; // 清空之前加载的题目
      if (this.currentChapter.questionIds) {
        const questionIds = this.currentChapter.questionIds.split(',').filter(id => id.trim());
        if (questionIds.length > 0) {
          this.loadQuestionDetails(questionIds);
        }
      }
    },
    // 关闭详情弹窗
    closeDetail() {
      this.detailVisible = false;
      this.currentChapter = null;
      this.chapterQuestions = []; // 清空题目详情数据
    },

    // 下载Word文档 - 显示选择弹窗
    handleDownloadWord(row) {
      this.currentDownloadRow = row
      this.wordDownloadOptions.includeAnswerAnalysis = false // 重置选项
      this.wordDownloadDialogVisible = true
    },

    // 确认下载Word文档
    async confirmDownloadWord() {
      try {
        this.$message.info('正在生成Word文档，请稍候...')

        // 获取章节详情和题目数据
        const chapterResponse = await getTable(this.currentDownloadRow.id)
        console.log('章节详情响应:', chapterResponse)

        if (chapterResponse.code !== 200) {
          this.$message.error('获取章节详情失败：' + (chapterResponse.msg || '未知错误'))
          return
        }

        const chapter = chapterResponse.data
        console.log('章节数据:', chapter)

        if (!chapter.questionIds) {
          this.$message.warning('该章节没有题目数据')
          return
        }

        // 获取题目数据
        const questionIds = chapter.questionIds.split(',').filter(id => id.trim())
        console.log('题目ID列表:', questionIds)

        const questions = await this.getQuestionsData(questionIds, chapter.subject)
        console.log('获取到的题目数据:', questions)

        if (questions.length === 0) {
          this.$message.warning('没有找到题目数据')
          return
        }

        // 生成Word文档，传递答案解析选项
        console.log('开始生成Word文档，章节数据:', chapter, '题目数量:', questions.length)

        this.$message.info('正在生成Word文档，图片处理中...')
        await WordGenerator.generateChapterDocument(chapter, questions, this.wordDownloadOptions.includeAnswerAnalysis)
        this.$message.success('Word文档生成成功！已优化图片处理')

        // 关闭弹窗
        this.wordDownloadDialogVisible = false

      } catch (error) {
        console.error('生成Word文档失败，详细错误:', error)
        console.error('错误堆栈:', error.stack)
        this.$message.error('生成Word文档失败：' + (error.message || '未知错误'))
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

        // 获取章节详情和题目数据
        const chapterResponse = await getTable(row.id)
        if (chapterResponse.code !== 200) {
          this.$message.error('获取章节详情失败')
          return
        }

        const chapter = chapterResponse.data
        if (!chapter.questionIds) {
          this.$message.warning('该章节没有题目数据')
          return
        }

        // 获取题目数据
        const questionIds = chapter.questionIds.split(',').filter(id => id.trim())
        const questions = await this.getQuestionsData(questionIds, chapter.subject)

        if (questions.length === 0) {
          this.$message.warning('没有找到题目数据')
          return
        }

        // 生成打印预览HTML
        const html = await WordGenerator.generatePrintHTML(chapter, questions, 'chapter')

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
        console.log('题目数据响应:', questionsResponse)

        // 检查多种可能的响应格式
        if (questionsResponse && questionsResponse.code === 200) {
          // 标准格式：有code字段且为200
          if (questionsResponse.data && questionsResponse.data.questions) {
            console.log('返回questions字段的题目数据:', questionsResponse.data.questions)
            return questionsResponse.data.questions || []
          } else {
            console.log('返回data字段的题目数据:', questionsResponse.data)
            return questionsResponse.data || []
          }
        } else if (questionsResponse && questionsResponse.questions) {
          // 直接返回题目数据的格式：{questions: Array, question_count: number}
          console.log('直接返回questions字段的题目数据:', questionsResponse.questions)
          return questionsResponse.questions || []
        } else if (Array.isArray(questionsResponse)) {
          // 直接返回题目数组的格式
          console.log('直接返回题目数组:', questionsResponse)
          return questionsResponse
        } else {
          console.error('获取题目数据失败，响应格式:', questionsResponse)
          this.$message.error('获取题目数据失败：响应格式不正确')
          return []
        }
      } catch (error) {
        console.error('获取题目数据失败，详细错误:', error)
        console.error('错误堆栈:', error.stack)
        this.$message.error('获取题目数据失败：' + (error.message || '未知错误'))
        return []
      }
    },

    // 加载题目详情
    loadQuestionDetails(questionIds) {
      this.loading = true;
      // 首先获取章节详情
      getTable(this.currentChapter.id).then(response => {
        if (response.code === 200) {
          const chapter = response.data;
          if (chapter.questionIds) {
            // 将题目ID字符串转换为数组
            const sids = chapter.questionIds.split(',').filter(id => id.trim());
            // 使用本地方法获取科目名称
            const subjectName = this.getSubjectName(chapter.subject) || chapter.subject;
            // 获取题目数据
            const requestData = {
              sids: sids,
              subject_name: subjectName
            };
            return getQuestionsBySids(requestData);
          } else {
            this.chapterQuestions = [];
            this.loading = false;
            return Promise.resolve({ code: 200, data: { questions: [] } });
          }
        } else {
          this.$message.error('获取章节详情失败');
          this.chapterQuestions = [];
          this.loading = false;
          throw new Error('获取章节详情失败');
        }
      }).then(questionsResponse => {
        // 检查响应格式，支持多种可能的返回格式
        if (questionsResponse) {
          // 如果响应有 code 字段，检查是否为 200
          if (questionsResponse.code !== undefined) {
            if (questionsResponse.code === 200) {
              // 检查是否有 questions 字段
              if (questionsResponse.data && questionsResponse.data.questions) {
                this.chapterQuestions = questionsResponse.data.questions || [];
              } else {
                this.chapterQuestions = questionsResponse.data || [];
              }
            } else {
              this.$message.error('获取题目数据失败：' + (questionsResponse.msg || '未知错误'));
              this.chapterQuestions = [];
            }
          } else if (questionsResponse.questions) {
            // 如果响应有 questions 字段，使用 questions 数组
            this.chapterQuestions = questionsResponse.questions || [];
          } else {
            // 如果没有 code 字段，直接使用响应数据
            this.chapterQuestions = Array.isArray(questionsResponse) ? questionsResponse : [];
          }
        } else {
          this.$message.error('获取题目数据失败：响应为空');
          this.chapterQuestions = [];
        }
        this.loading = false;
      }).catch(error => {
        console.error('Error loading question details:', error);
        this.$message.error('获取题目详情失败：' + error.message);
        this.chapterQuestions = [];
        this.loading = false;
      });
    },

    // 处理题目内容
    processQuestionContent(content) {
      if (!content) return '';
      // 先解码HTML实体，确保sub/sup等标签正确显示
      let processedContent = this.decodeHtmlEntities(content);
      // 处理数学公式
      processedContent = parseMathFormula(processedContent);
      // 处理bdo标签
      processedContent = this.processBdoTags(processedContent);
      // 处理可编辑答案输入区域 - 支持多种格式
      return processedContent
        .replace(
          /<!--BA--><div (?:class="quizPutTag"|class="\\quizPutTag\\") contenteditable="true">\s*(&nbsp;)?<\/div><!--EA-->/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        )
        .replace(
          /<div class='quizPutTag' contenteditable='true'>&nbsp;<\/div>/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        );
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

      // 先解码HTML实体
      let processedContent = this.decodeHtmlEntities(answerContent);
      // 处理数学公式
      processedContent = parseMathFormula(processedContent);
      // 处理bdo标签
      processedContent = this.processBdoTags(processedContent);

      return processedContent;
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
    }
  }
}
</script>

<style scoped>
.chapter-name {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-detail {
  padding: 20px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  color: #409EFF;
  margin-bottom: 15px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 5px;
}

.question-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.question-number {
  font-weight: bold;
  color: #409EFF;
  min-width: 30px;
}

.question-type {
  background: #67c23a;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-difficulty {
  color: #909399;
  font-size: 12px;
}

.question-content {
  margin-top: 10px;
}

.question-text {
  margin-bottom: 10px;
  line-height: 1.6;
}

.question-label {
  background: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-right: 8px;
}

.question-options {
  margin: 10px 0;
}

.option-item {
  display: flex;
  margin: 5px 0;
  align-items: flex-start;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 20px;
}

.option-content {
  flex: 1;
  line-height: 1.5;
}

.question-info {
  margin-top: 10px;
  padding: 8px;
  background: #f0f9ff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item {
  font-size: 13px;
  color: #606266;
}

.question-analysis {
  margin-top: 10px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.analysis-title {
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.analysis-content {
  line-height: 1.6;
  color: #606266;
}

.question-discussion {
  margin-top: 10px;
  padding: 10px;
  background: #fff7e6;
  border-radius: 4px;
  border-left: 3px solid #e6a23c;
}

.discussion-title {
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 5px;
}

.discussion-content {
  line-height: 1.6;
  color: #606266;
}

.question-method {
  margin-top: 10px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.method-title {
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 5px;
}

.method-content {
  line-height: 1.6;
  color: #606266;
}

.question-count {
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409EFF;
  font-weight: bold;
}

.chapter-count {
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409EFF;
  font-weight: bold;
}

.no-data {
  color: #909399;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.answer-input, .blank-input, .fill-input {
  display: inline-block;
  min-width: 60px;
  height: 20px;
  border-bottom: 2px solid #409EFF;
  margin: 0 2px;
  text-align: center;
  font-weight: bold;
  color: #409EFF;
}

.answer-input-area {
  border-bottom: 1px solid black;
  display: inline-block;
  min-width: 100px;
}

/* Word下载弹窗样式 */
.download-options {
  padding: 20px 0;
}

.option-item {
  display: flex;
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
