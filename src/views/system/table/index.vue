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
      <el-form-item label="作业名称" prop="customPaperName">
        <el-input
          v-model="queryParams.customPaperName"
          placeholder="请输入作业名称"
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
          v-hasPermi="['system:table:add']"
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
          v-hasPermi="['system:table:edit']"
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
          v-hasPermi="['system:table:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:table:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" stripe>
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="作业ID" align="center" prop="id" width="80" /> -->
      <el-table-column label="科目" align="center" prop="subject" width="150">
        <template slot-scope="scope">
          <el-tag type="primary" size="small">{{ getSubjectName(scope.row.subject) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="作业名称" align="center" prop="customPaperName" min-width="200">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.customPaperName" placement="top">
            <span class="homework-name">{{ scope.row.customPaperName }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="题目数量" align="center" width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.questionIds" type="info" size="small">
            {{ scope.row.questionIds.split(',').filter(id => id.trim()).length }}题
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="章节数量" align="center" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.knowledgePointIds" type="success" size="small">
            {{ scope.row.knowledgePointIds.split(',').filter(ch => ch.trim()).length }}章
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column label="创建人" align="center" prop="creator" width="120">
        <template slot-scope="scope">
          <el-avatar size="small">
            {{ getCreatorName(scope.row.creator).charAt(0) }}
          </el-avatar>
          <span style="margin-left: 5px;">{{ getCreatorName(scope.row.creator) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
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
            icon="el-icon-download"
            @click="handleTestWordExport(scope.row)"
          >Word测试</el-button> -->
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
            v-hasPermi="['system:table:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:table:remove']"
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

    <!-- 添加或修改作业对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="520px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <!-- <el-form-item label="科目" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入科目" />
        </el-form-item> -->
        <el-form-item label="作业名称" prop="customPaperName">
          <el-input v-model="form.customPaperName" placeholder="请输入作业名称" />
        </el-form-item>
        <!-- <el-form-item label="题目ID集合" prop="questionIds">
          <el-input v-model="form.questionIds" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
        <!-- <el-form-item label="章节ID集合" prop="knowledgePointIds">
          <el-input v-model="form.knowledgePointIds" type="textarea" placeholder="请输入内容" />
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

    <!-- 作业详情弹窗 -->
    <el-dialog 
      title="作业详情" 
      :visible.sync="detailVisible" 
      width="1000px" 
      height="90vh"
      append-to-body
      @close="closeDetail"
      style="overflow: hidden;"
    >
      <div v-if="currentHomework" class="homework-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="作业ID">{{ currentHomework.id }}</el-descriptions-item>
          <el-descriptions-item label="科目">
            <el-tag type="primary">{{ getSubjectName(currentHomework.subject) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="作业名称" :span="2">{{ currentHomework.customPaperName }}</el-descriptions-item>
          <el-descriptions-item label="创建人">
            <el-avatar size="small">
              {{ getCreatorName(currentHomework.creator).charAt(0) }}
            </el-avatar>
            <span style="margin-left: 5px;">{{ getCreatorName(currentHomework.creator) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(currentHomework.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        </el-descriptions>

        <!-- <div class="detail-section">
          <h4>章节信息</h4>
          <div v-if="currentHomework.knowledgePointIds">
            <el-tag
              v-for="(chapter, index) in currentHomework.knowledgePointIds.split(',').filter(ch => ch.trim())"
              :key="index"
              type="success"
              size="small"
              style="margin: 2px;"
            >
              {{ chapter }}
            </el-tag>
            <div class="chapter-count">
              共 {{ currentHomework.knowledgePointIds.split(',').filter(ch => ch.trim()).length }} 个章节
            </div>
          </div>
          <span v-else class="no-data">暂无章节</span>
        </div> -->
        
        <div class="detail-section">
          <h4>题目信息</h4>
          <div v-if="homeworkQuestions.length > 0" class="question-cards">
            <div
              v-for="(question, index) in homeworkQuestions"
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
              共 {{ homeworkQuestions.length }} 个题目
            </div>
          </div>
          <span v-else class="no-data">暂无题目</span>
        </div>


      </div>
    </el-dialog>
    
    <!-- Word生成选择弹窗 -->
    <el-dialog
      title="Word内容生成选项"
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
            <p>勾选此项将在HTML中包含题目的答案和解析内容</p>
            <p>不勾选则只包含题目内容，适合作为试卷使用</p>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDownloadWord">取消</el-button>
        <el-button type="primary" @click="confirmDownloadWord" :loading="false">
          生成Word文档
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTable, getTable, addTable, updateTable, delTable } from "@/api/system/table"
import { getQuestionsBySids, getSubjectName, exportTestPaper, htmlToWord } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import { sysUserList } from "@/api/system/knowledge"
import { parseMathFormula } from "@/utils/mathFormula"
import { WordGenerator } from "@/utils/wordGenerator"
import latexRenderer from '@/utils/latexRenderer'

export default {
  name: "Table",
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
      // 作业表格数据
      tableList: [],
      // Word下载弹窗相关
      wordDownloadDialogVisible: false,
      wordDownloadOptions: {
        includeAnswerAnalysis: false
      },
      currentDownloadRow: null,
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
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        subject: [
          { required: true, message: "科目不能为空", trigger: "blur" }
        ],
        customPaperName: [
          { required: true, message: "作业名称不能为空", trigger: "blur" }
        ],
        questionIds: [
          { required: true, message: "题目ID集合不能为空", trigger: "blur" }
        ],
        knowledgePointIds: [
          { required: true, message: "章节ID集合不能为空", trigger: "blur" }
        ],
        creator: [
          { required: true, message: "创建人不能为空", trigger: "blur" }
        ],
      },
      // 详情弹窗相关
      detailVisible: false,
      currentHomework: null,
      // 科目选项
      subjectOptions: [],
      // 用户列表数据
      userList: [],
      // 题目详情数据
      homeworkQuestions: []
    }
  },
  created() {
    this.getList()
    this.getSubjectOptions()
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
    
    /** 查询作业列表 */
    getList() {
      this.loading = true
      listTable(this.queryParams).then(response => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 查询科目列表 */
    getSubjectOptions() {
      listSubject().then(response => {
        this.subjectOptions = response.rows || []
      }).catch(error => {
        console.error('获取科目数据失败:', error)
      })
    },
    /** 加载用户列表 */
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
      this.queryParams.subject = null
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
      // 跳转到麓鸣题库，模式为作业
      this.$router.push({
        path: '/student/lumingQuestionBank/index',
        query: { mode: 'homework' }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getTable(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改作业"
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
      this.$modal.confirm('是否确认删除作业编号为"' + ids + '"的数据项？').then(function() {
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
      }, `table_${new Date().getTime()}.xlsx`)
    },
    // 获取科目名称
    getSubjectName(subjectCode) {
      if (!subjectCode) return '';
      const subject = this.subjectOptions.find(item => item.subjectCode === subjectCode);
      return subject ? subject.subjectName : subjectCode;
    },
    // 获取创建人名称
    getCreatorName(creatorId) {
      const user = this.userList.find(item => item.userId === creatorId);
      return user ? user.nickName : creatorId;
    },

    // 检查自动查看模式
    checkAutoViewMode() {
      const autoViewMode = sessionStorage.getItem('autoViewMode')
      if (autoViewMode === 'true') {
        // 立即清除标记，防止重复处理
        sessionStorage.removeItem('autoViewMode')
        
        // 获取选中的项目
        const selectedItemStr = sessionStorage.getItem('selectedAssignmentItem')
        
        if (selectedItemStr) {
          try {
            const selectedItem = JSON.parse(selectedItemStr)
            console.log('从主页传递的选中项目:', selectedItem)
            
            // 立即清除存储的数据，防止重复处理
            sessionStorage.removeItem('selectedAssignmentItem')
            
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
                  this.$message.warning('未找到对应的作业项目')
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
            sessionStorage.removeItem('selectedAssignmentItem')
          }
        }
      }
    },
    // 查看作业详情
    handleView(row) {
      console.log('handleView called with row:', row);
      this.currentHomework = row;
      this.detailVisible = true;
      this.homeworkQuestions = []; // 清空之前加载的题目
      if (this.currentHomework.questionIds) {
        const questionIds = this.currentHomework.questionIds.split(',').filter(id => id.trim());
        console.log('questionIds:', questionIds);
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
        
        // 获取作业详情和题目数据
        const homeworkResponse = await getTable(this.currentDownloadRow.id)
        if (homeworkResponse.code !== 200) {
          this.$message.error('获取作业详情失败')
          return
        }
        
        const homework = homeworkResponse.data
        if (!homework.questionIds) {
          this.$message.warning('该作业没有题目数据')
          return
        }
        
        // 获取题目数据
        const questionIds = homework.questionIds.split(',').filter(id => id.trim())
        const questions = await this.getQuestionsData(questionIds, homework.subject)
        
        if (questions.length === 0) {
          this.$message.warning('没有找到题目数据')
          return
        }
        
        // 生成HTML内容，传递答案解析选项
        const htmlContent = WordGenerator.generatePrintHTML(homework, questions, 'homework', this.wordDownloadOptions.includeAnswerAnalysis)
        
        // 准备API请求数据
        const requestData = {
          html: htmlContent,
          file_name: homework.customPaperName || '作业文档'
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
          link.download = `${homework.customPaperName || '作业文档'}_${new Date().getTime()}.docx`
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
    
    // Word测试导出
    async handleTestWordExport(row) {
      try {
        this.$message.info('正在测试Word导出，请稍候...')
        
        // 检查是否有题目数据
        if (!row.questionIds) {
          this.$message.warning('该作业没有题目数据，无法导出')
          return
        }
        
        // 获取真实的sids和subject_name
        const sids = row.questionIds.split(',').filter(id => id.trim())
        const subjectName = this.getSubjectName(row.subject)
        
        const testData = {
          "sids": sids,
          "subject_name": subjectName
        }
        
        // 调用API
        const response = await exportTestPaper(testData)
        
        // 处理blob响应
        if (response instanceof Blob) {
          // 创建下载链接
          const url = window.URL.createObjectURL(response)
          const link = document.createElement('a')
          link.href = url
          link.download = `${row.customPaperName || '测试试卷'}_${new Date().getTime()}.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          this.$message.success('Word测试导出成功！')
        } else {
          console.log('响应不是Blob类型:', response)
          this.$message.info('API调用成功，但响应格式不是预期的文件格式')
        }
        
      } catch (error) {
        console.error('Word测试导出失败:', error)
        this.$message.error('Word测试导出失败：' + (error.message || error))
      }
    },
    
    // 打印预览
    async handlePrint(row) {
      try {
        this.$message.info('正在准备打印预览，请稍候...')
        
        // 获取作业详情和题目数据
        const homeworkResponse = await getTable(row.id)
        if (homeworkResponse.code !== 200) {
          this.$message.error('获取作业详情失败')
          return
        }
        
        const homework = homeworkResponse.data
        if (!homework.questionIds) {
          this.$message.warning('该作业没有题目数据')
          return
        }
        
        // 获取题目数据
        const questionIds = homework.questionIds.split(',').filter(id => id.trim())
        const questions = await this.getQuestionsData(questionIds, homework.subject)
        
        if (questions.length === 0) {
          this.$message.warning('没有找到题目数据')
          return
        }
        
        // 生成打印预览HTML
        const html = await WordGenerator.generatePrintHTML(homework, questions, 'homework')
        console.log('html:', html)
        
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
        
        // 获取科目名称
        const subjectResponse = await getSubjectName({ subject_code: subject })
        if (subjectResponse && subjectResponse.code === 200) {
          const subjectName = subjectResponse.data && subjectResponse.data.length > 0 
            ? subjectResponse.data[0].gradeAndSubject 
            : ''
          
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
        } else {
          throw new Error('获取科目名称失败')
        }
      } catch (error) {
        console.error('获取题目数据失败:', error)
        throw error
      }
    },
    // 关闭详情弹窗
    closeDetail() {
      this.detailVisible = false;
      this.currentHomework = null;
      this.homeworkQuestions = []; // 清空题目详情数据
    },

    // 加载题目详情
    loadQuestionDetails(questionIds) {
      this.loading = true;
      // 首先获取作业详情
      getTable(this.currentHomework.id).then(response => {
        if (response.code === 200) {
          const homework = response.data;
          if (homework.questionIds) {
            // 将题目ID字符串转换为数组
            const sids = homework.questionIds.split(',').filter(id => id.trim());
            // 获取科目名称
            return getSubjectName({ subject_code: homework.subject }).then(subjectResponse => {
              if (subjectResponse && subjectResponse.code === 200) {
                // 从返回的数组中提取第一个元素的 gradeAndSubject 字段
                const subjectName = subjectResponse.data && subjectResponse.data.length > 0 
                  ? subjectResponse.data[0].gradeAndSubject 
                  : '';
                // 获取题目数据
                const requestData = {
                  sids: sids,
                  subject_name: subjectName
                };
                console.log('getQuestionsBySids requestData:', requestData);
                return getQuestionsBySids(requestData);
              } else {
                this.$message.error('获取科目名称失败');
                this.homeworkQuestions = [];
                this.loading = false;
                throw new Error('获取科目名称失败');
              }
            });
          } else {
            this.homeworkQuestions = [];
            this.loading = false;
            throw new Error('作业没有题目数据');
          }
        } else {
          this.$message.error('获取作业详情失败：' + response.msg);
          this.homeworkQuestions = [];
          this.loading = false;
          throw new Error('获取作业详情失败');
        }
      }).then(questionsResponse => {
        console.log('getQuestionsBySids response:', questionsResponse);
        // 检查响应格式，支持多种可能的返回格式
        if (questionsResponse) {
          // 如果响应有 code 字段，检查是否为 200
          if (questionsResponse.code !== undefined) {
            if (questionsResponse.code === 200) {
              // 检查是否有 questions 字段
              if (questionsResponse.data && questionsResponse.data.questions) {
                this.homeworkQuestions = questionsResponse.data.questions || [];
              } else {
                this.homeworkQuestions = questionsResponse.data || [];
              }
            } else {
              this.$message.error('获取题目数据失败：' + (questionsResponse.msg || '未知错误'));
              this.homeworkQuestions = [];
            }
          } else if (questionsResponse.questions) {
            // 如果响应有 questions 字段，使用 questions 数组
            this.homeworkQuestions = questionsResponse.questions || [];
          } else {
            // 如果没有 code 字段，直接使用响应数据
            this.homeworkQuestions = Array.isArray(questionsResponse) ? questionsResponse : [];
          }
        } else {
          this.$message.error('获取题目数据失败：响应为空');
          this.homeworkQuestions = [];
        }
      }).catch(error => {
        this.$message.error('获取题目详情失败：' + error.message);
        this.homeworkQuestions = [];
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
.homework-name {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.homework-detail {
  height: 75vh;
  overflow-y: auto;
  padding: 10px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #303133;
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
  margin-right: 10px;
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

.no-data {
  color: #c0c4cc;
  font-style: italic;
}

.question-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9fafc;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.question-number {
  font-weight: bold;
  margin-right: 5px;
}

.question-type {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}

.question-difficulty {
  background-color: #fde2e2;
  color: #f56c6c;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.question-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 10px;
  white-space: pre-wrap; /* 保留换行 */
}

.question-options {
  margin-top: 10px;
  padding-left: 20px;
}

.option-item {
  margin-bottom: 5px;
  font-size: 15px;
  color: #606266;
}

.option-label {
  font-weight: bold;
  margin-right: 5px;
}

.option-content {
  display: inline-block;
  word-break: break-all;
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
  min-width: 30px;
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
}

.option-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
}

.option-content {
  flex: 1;
  line-height: 1.5;
  color: #606266;
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
