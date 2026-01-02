<template>
  <div class="app-container">
    <!-- 操作按钮区域 -->
    <div class="action-container">
      <div class="action-content">
        <div class="action-header">
          <!-- 类型切换 -->
          <div class="type-switch-tabs">
            <span
              class="type-tab"
              :class="{ 'active': currentType === 'homework' }"
              @click="handleTypeChange('homework')"
            >
              作业
            </span>
            <span
              class="type-tab"
              :class="{ 'active': currentType === 'paper' }"
              @click="handleTypeChange('paper')"
            >
              试卷
            </span>
            <span
              class="type-tab"
              :class="{ 'active': currentType === 'favorite' }"
              @click="handleTypeChange('favorite')"
            >
              收藏
            </span>
          </div>
          <!-- 新增按钮（收藏页面隐藏） -->
          <el-button
            v-if="currentType !== 'favorite'"
            type="primary"
            icon="el-icon-plus"
            size="medium"
            @click="handleAdd"
            class="add-button"
          >新增</el-button>
          <!-- 新接口页面按钮（收藏页面隐藏） -->
<!--         <el-button-->
<!--           v-if="currentType !== 'favorite'"-->
<!--           type="success"-->
<!--           icon="el-icon-document"-->
<!--           size="medium"-->
<!--           @click="handleGoToNewPage"-->
<!--           class="add-button"-->
<!--         >新接口页面</el-button>-->

          <!-- 科目选择（仅收藏页面显示，通过接口获取科目列表） -->
          <div v-if="currentType === 'favorite'" class="subject-selector-top">
            <span class="control-label">选择科目：</span>
            <el-select
              v-model="selectedSubject"
              placeholder="请选择科目"
              size="medium"
              style="width: 200px"
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

          <!-- 购物篮图标和菜单容器（仅收藏页面显示） -->
          <div
            v-if="currentType === 'favorite'"
            class="shopping-cart-container"
            @mouseenter="handleCartMouseEnter"
            @mouseleave="handleCartMouseLeave"
          >
            <div class="shopping-cart-icon">
              <img src="@/assets/images/Product.png" alt="购物篮" class="cart-icon-img" />
              <span v-if="selectedQuestions && selectedQuestions.length > 0" class="cart-badge">{{ selectedQuestions.length }}</span>
            </div>

            <!-- 购物篮菜单 -->
            <div
              v-if="showCartMenu"
              class="cart-menu"
              @mouseenter="handleCartMouseEnter"
              @mouseleave="handleCartMouseLeave"
            >
              <div class="cart-menu-content">
                <!-- 题目列表（按题型分组） -->
                <div class="cart-question-groups">
                  <template v-if="Object.keys(groupedQuestions).length > 0">
                    <div
                      v-for="(group, type) in groupedQuestions"
                      :key="type"
                      class="cart-question-group"
                    >
                      <div class="group-header">
                        <span class="group-type">{{ type }}</span>
                        <span class="group-count">{{ Array.isArray(group) ? group.length : 0 }}道</span>
                        <el-button
                          type="text"
                          size="mini"
                          @click="removeQuestionsByType(type)"
                          class="delete-btn"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </template>
                  <div v-else class="no-groups-hint">
                    <span>暂无试题</span>
                  </div>
                </div>

                <!-- 底部操作栏 -->
                <div class="cart-menu-footer">
                  <span class="total-count">共{{ selectedQuestions ? selectedQuestions.length : 0 }}道</span>
                  <el-button
                    type="text"
                    size="small"
                    @click="clearAllQuestions"
                    class="delete-all-btn"
                    :disabled="!selectedQuestions || selectedQuestions.length === 0"
                  >
                    全部删除
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    @click="showPreviewDialog"
                    class="preview-btn"
                    :disabled="!selectedQuestions || selectedQuestions.length === 0"
                  >
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 收藏页面 -->
    <div v-if="currentType === 'favorite'" class="favorite-container">
      <div class="favorite-content">
        <!-- 左侧标签列表 -->
        <!-- <div class="favorite-tags-panel">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleCreateNewTag"
            class="new-tag-btn"
          >
            新建标签
          </el-button>

          <div class="tags-list">
            <div
              v-if="isCreatingNewTag && editingTag === '__new__'"
              class="tag-item editing new-tag-item"
            >
              <el-input
                v-model="editingTagName"
                size="small"
                placeholder="请输入标签名称"
                @keyup.enter.native="handleSaveTag"
                @keyup.esc.native="handleCancelEditTag"
                ref="tagInput"
                class="tag-input"
              />
              <div class="tag-actions">
                <i class="el-icon-check tag-action-icon" @click="handleSaveTag"></i>
                <i class="el-icon-close tag-action-icon" @click="handleCancelEditTag"></i>
              </div>
            </div>

            <div
              v-for="tag in favoriteTags"
              :key="tag"
              class="tag-item"
              :class="{ 'active': selectedTag === tag, 'editing': editingTag === tag }"
            >
              <template v-if="editingTag === tag">
                <el-input
                  v-model="editingTagName"
                  size="small"
                  @keyup.enter.native="handleSaveTag"
                  @keyup.esc.native="handleCancelEditTag"
                  ref="tagInput"
                  class="tag-input"
                />
                <div class="tag-actions">
                  <i class="el-icon-check tag-action-icon" @click="handleSaveTag"></i>
                  <i class="el-icon-close tag-action-icon" @click="handleCancelEditTag"></i>
                </div>
              </template>
              <template v-else>
                <span class="tag-name" @click="handleTagClick(tag)">{{ tag }}</span>
                <div class="tag-actions-display">
                  <i class="el-icon-edit tag-edit-icon" @click.stop="handleEditTag(tag)"></i>
                  <i
                    class="el-icon-delete tag-delete-icon"
                    @click.stop="handleDeleteTag(tag)"
                  ></i>
                </div>
              </template>
            </div>
          </div>
        </div> -->

        <!-- 右侧题目列表 -->
        <div class="favorite-questions-panel">
          <!-- 未选择科目时的提示 -->
          <div v-if="!selectedSubject" class="no-subject-tip">
            <el-empty description="请先选择科目">
              <template slot="image">
                <i class="el-icon-warning-outline" style="font-size: 80px; color: #909399;"></i>
              </template>
              <p class="tip-text">请在上方"选择科目"下拉框中选择科目后查看收藏的题目</p>
            </el-empty>
          </div>
          <!-- 已选择科目时显示题目列表 -->
          <FavoriteQuestionList
            v-else
            :questions="favoriteQuestions"
            :loading="favoriteLoading"
            :total="favoriteTotal"
            :page-num="favoriteQueryParams.pageNum"
            :page-size="favoriteQueryParams.pageSize"
            :selected-questions="selectedQuestions"
            :process-question-content="processQuestionContent"
            :question-types="normalizedQuestionTypes"
            :show-edit-button="true"
            @view-detail="handleViewDetail"
            @add-to-paper="handleAddToPaper"
            @remove-from-paper="handleRemoveFromPaper"
            @cancel-favorite="handleDeleteFavorite"
            @pagination-change="handleFavoritePagination"
            @edit-question="handleEditQuestion"
          />
        </div>
      </div>
    </div>

    <!-- 解析弹窗 -->
    <QuestionAnalysisDialog
      :visible.sync="analysisVisible"
      :current-question="currentQuestion"
      :question-detail="questionDetail"
      :loading-detail="loadingQuestionDetail"
      :process-question-content="processQuestionContent"
      @close="closeAnalysis"
    />

    <!-- 题目编辑弹窗 -->
    <QuestionEditDialoq
      :visible="questionEditDialogVisible"
      :question="editingQuestion"
      :loading="loadingQuestion"
      :process-question-content="processQuestionContent"
      @save="handleQuestionSave"
      @close="handleQuestionEditClose"
    />

    <!-- 预览弹窗（仅收藏页面） -->
    <PreviewDialog
      v-if="currentType === 'favorite'"
      :visible.sync="previewDialogVisible"
      :selected-questions="selectedQuestions"
      :preview-creation-mode.sync="previewCreationMode"
      :preview-custom-paper-name.sync="previewCustomPaperName"
      :subject="selectedSubject || ''"
      :is-admin="isAdmin"
      :teacher-subject-name="teacherSubjectName"
      :selected-subject="selectedSubject"
      :get-subject-from-chapter="getSubjectFromChapter"
      @confirm="handlePreviewConfirm"
      @close="handlePreviewClose"
    />

    <!-- 作业/试卷表格区域 -->
    <el-table
      v-if="currentType !== 'favorite'"
      v-loading="loading"
      :data="tableList"
      stripe
      border
      @sort-change="handleSortChange"
      :default-sort="{prop: 'createTime', order: 'ascending'}"
    >
      <el-table-column label="科目" align="center" prop="subject" width="150">
        <template slot="header" slot-scope="scope">
          <div class="table-header-filter">
            <el-select
              v-model="queryParams.subject"
              placeholder="科目"
              @change="handleQuery"
              size="small"
              clearable
              popper-append-to-body
              filterable
              style="width: 100%;"
            >
              <el-option label="科目" value="" />
              <el-option
                v-for="item in subjectOptions"
                :key="'subject-option-' + item.subjectCode"
                :label="item.subjectName"
                :value="item.subjectCode"
              />
            </el-select>
          </div>
        </template>
        <template slot-scope="scope">
          <el-tag type="primary" size="small">{{ getSubjectName(scope.row.subject) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="currentType === 'homework' ? '作业名称' : '试卷名称'" align="center" prop="customPaperName" min-width="200">
        <template slot="header" slot-scope="scope">
          <div class="table-header-search-name">
            <el-input
              v-model="queryParams.customPaperName"
              :placeholder="currentType === 'homework' ? '输入作业名称' : '输入试卷名称'"
              size="small"
              clearable
              @keyup.enter.native="handleQuery"
              class="search-input"
            />
            <el-button
              type="primary"
              icon="el-icon-search"
              size="small"
              @click="handleQuery"
              class="search-button"
            ></el-button>
          </div>
        </template>
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.customPaperName" placement="top">
            <span class="name-text">{{ scope.row.customPaperName }}</span>
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
      <el-table-column label="创建人" align="center" prop="creator" width="200" >
        <template slot="header" slot-scope="scope">
          <div class="table-header-filter">
            <el-select
              v-model="queryParams.creator"
              placeholder="创建人"
              @change="handleQuery"
              size="small"
              clearable
              popper-append-to-body
              filterable
              style="width: 80%;"
            >
              <el-option label="创建人" value="" />
              <el-option
                v-for="user in userList"
                :key="'creator-option-' + user.userId"
                :label="user.nickName"
                :value="String(user.userId)"
              />
            </el-select>
          </div>
        </template>
        <template slot-scope="scope">
          <el-avatar size="small">
            {{ (getCreatorName(scope.row.creator) || '-').charAt(0) }}
          </el-avatar>
          <span style="margin-left: 5px;">{{ getCreatorName(scope.row.creator) || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="200"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
      >
        <template slot="header">
          <el-tooltip :content="queryParams.order === '1' ? '点击降序' : '点击升序'" placement="top">
            <span>创建时间</span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
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
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handleDownloadWord(scope.row)"
          >下载Word</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0 && currentType !== 'favorite'"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 详情弹窗 -->
    <el-dialog
      :title="currentType === 'homework' ? '作业详情' : '试卷详情'"
      :visible.sync="detailVisible"
      width="1000px"
      height="90vh"
      append-to-body
      @close="closeDetail"
      style="overflow: hidden;"
    >
      <div v-if="currentItem" class="detail-content">
        <div class="detail-header">
          <div class="detail-title-section">
            <h3 class="detail-title">{{ currentItem.customPaperName }}</h3>
            <div class="detail-meta-tags">
              <el-tag type="primary" size="medium" class="meta-tag">
                <i class="el-icon-collection-tag"></i>
                {{ getSubjectName(currentItem.subject) }}
              </el-tag>
              <el-tag type="info" size="medium" class="meta-tag">
                <i class="el-icon-user"></i>
                {{ getCreatorName(currentItem.creator) || '-' }}
              </el-tag>
              <el-tag type="success" size="medium" class="meta-tag">
                <i class="el-icon-time"></i>
                {{ parseTime(currentItem.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>题目信息</h4>
          <div v-loading="loadingDetail" element-loading-text="加载题目中...">
            <div v-if="!loadingDetail && itemQuestions.length > 0" class="question-cards">
              <div
                v-for="(question, index) in itemQuestions"
                :key="question.SID || index"
                class="question-card"
              >
                <div class="question-header">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <span class="question-type">{{ question.CateName }}</span>
                  <span class="question-difficulty">难度: {{ getQuestionDifficulty(question) }}</span>
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
                  <!--                  <div class="question-info">-->
                  <!--                    <span class="info-item">知识点: {{ formatKnowledgePoints(question.Points) }}</span>-->
                  <!--                    <span class="info-item">答案: <span v-html="processAnswerContent(question)"></span></span>-->
                  <!--                  </div>-->
                  <div class="question-analysis" v-if="question.Method" style="border-left: 3px solid #82848a">
                    <div class="analysis-title" style="color:#82848a;">答案:</div>
                    <div class="analysis-content" v-html="processAnswerContent(question)"></div>
                  </div>
                  <div class="question-analysis" v-if="question.Points" style="border-left: 3px solid #e64242">
                    <div class="analysis-title" style="color:#e64242;">知识点:</div>
                    <div class="analysis-content" v-html="formatKnowledgePoints(question.Points)"></div>
                  </div>
                  <div class="question-analysis" v-if="question.Method">
                    <div class="analysis-title">解析:</div>
                    <div class="analysis-content" v-html="processQuestionContent(question.Method)"></div>
                  </div>
                  <div class="question-analysis" v-if="question.Analyse" style="border-left: 3px solid #409eff;">
                    <div class="analysis-title" style="color: #409eff;">分析:</div>
                    <div class="analysis-content" v-html="processQuestionContent(question.Analyse)"></div>
                  </div>
                  <div class="question-discussion" v-if="question.Discuss">
                    <div class="discussion-title">讨论:</div>
                    <div class="discussion-content" v-html="processQuestionContent(question.Discuss)"></div>
                  </div>
                </div>
              </div>
              <div class="question-count">
                共 {{ itemQuestions.length }} 个题目
              </div>
            </div>
            <span v-else-if="!loadingDetail && itemQuestions.length === 0" class="no-data">暂无题目</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Word下载选择弹窗 -->
    <el-dialog
      title="Word内容生成选项"
      :visible.sync="wordDownloadDialogVisible"
      width="500px"
      :before-close="cancelDownloadWord"
    >
      <div class="download-options">
        <div class="option-item">
          <el-checkbox v-model="wordDownloadOptions.includeAnswerAnalysis">
            包含答案和解析(不勾选只包含题目内容)
          </el-checkbox>
          <div class="option-description">
            <!-- <p>勾选此项将在Word文档中包含题目的答案和解析内容</p>
            <p>不勾选则只包含题目内容，适合作为{{ currentType === 'homework' ? '作业' : '试卷' }}使用</p> -->
          </div>
        </div>
        <div class="option-item" v-if="wordDownloadOptions.includeAnswerAnalysis">
          <el-checkbox v-model="wordDownloadOptions.answersAtEnd">
            将所有答案放在页尾(不勾选答案和解析会跟在每个题目后面显示)
          </el-checkbox>
          <div class="option-description">
            <!-- <p>勾选此项后，所有题目的答案和解析将统一放在"参考答案"部分</p>
            <p>不勾选则答案和解析会跟在每个题目后面显示</p> -->
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

    <!-- 修改作业/试卷弹窗 -->
    <el-dialog
      :title="currentType === 'homework' ? '修改作业' : '修改试卷'"
      :visible.sync="updateDialogVisible"
      width="520px"
      append-to-body
    >
      <el-form ref="updateForm" :model="updateForm" :rules="getUpdateRules()" label-width="100px">
        <el-form-item :label="currentType === 'homework' ? '作业名称' : '试卷名称'" prop="customPaperName">
          <el-input
            v-model="updateForm.customPaperName"
            :placeholder="currentType === 'homework' ? '请输入作业名称' : '请输入试卷名称'"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelUpdate">取 消</el-button>
        <el-button type="primary" @click="submitUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTable, getTable, delTable, addTable, updateTable } from "@/api/system/table"
import { listPaper, getPaper, delPaper, addPaper, updatePaper, getQuestionsBySids, htmlToWord, getQuestionDetail } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import { getTeacherList } from "@/api/system/knowledge"
import { getTeacherInfo, getPreviewSubjectName } from "@/api/system/teacher"
import { WordGenerator } from "@/utils/wordGenerator"
import latexRenderer from '@/utils/latexRenderer'
import { listQuestionFavorites, deleteQuestionFavorite, getQuestionTypeDistribution, listQuestionTags, updateQuestionTag } from "@/api/system/problems"
import FavoriteQuestionList from '@/components/PaperBuilder/FavoriteQuestionList'
import QuestionAnalysisDialog from '@/components/PaperBuilder/QuestionAnalysisDialog'
import QuestionEditDialoq from '@/components/PaperBuilder/QuestionEditDialoq'
import PreviewDialog from '@/components/PaperBuilder/PreviewDialog'

export default {
  name: "MyQuestionBank",
  components: {
    FavoriteQuestionList,
    QuestionAnalysisDialog,
    QuestionEditDialoq,
    PreviewDialog
  },
  data() {
    return {
      // 当前类型：homework-作业，paper-试卷
      currentType: 'homework',
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      tableList: [],
      // Word下载弹窗相关
      wordDownloadDialogVisible: false,
      wordDownloadOptions: {
        includeAnswerAnalysis: false,
        answersAtEnd: false
      },
      currentDownloadRow: null,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        subject: '', // 默认为空字符串，表示"全部"
        customPaperName: '', // 使用空字符串，el-input 需要字符串类型
        creator: '', // 默认为空字符串，表示"全部"
        order: '1', // 排序参数：'1' 升序，'2' 降序，默认升序
      },
      // 名称搜索类型（用于下拉框显示）
      nameSearchType: 'all',
      // 科目选项
      subjectOptions: [],
      // 用户列表数据
      userList: [],
      // 详情弹窗相关
      detailVisible: false,
      currentItem: null,
      // 题目详情数据
      itemQuestions: [],
      // 详情弹窗加载状态
      loadingDetail: false,
      // 解析弹窗相关
      analysisVisible: false,
      currentQuestion: null,
      questionDetail: null,
      loadingQuestionDetail: false,
      // 题目编辑弹窗相关
      questionEditDialogVisible: false,
      editingQuestion: null,
      loadingQuestion: false,
      // 修改弹窗相关
      updateDialogVisible: false,
      updateForm: {
        id: null,
        customPaperName: null
      },
      // 收藏相关数据
      questionTypes: ['全部'], // 题型列表
      selectedQuestionType: '全部', // 选中的题型
      favoriteQuestions: [], // 收藏题目列表
      favoriteTotal: 0, // 收藏题目总数
      favoriteLoading: false, // 收藏列表加载状态
      favoriteQueryParams: {
        pageNum: 1,
        pageSize: 5
      },
      teacherSubjectName: '', // 教师科目名称（格式：年级+学科，如"高中物理"）
      isAdmin: false, // 是否是管理员
      selectedSubject: '', // 管理员选择的科目
      teacherInfo: null, // 教师信息
      // 标签相关
      favoriteTags: [], // 收藏标签列表
      selectedTag: '', // 当前选中的标签（空字符串表示查询全部收藏）
      editingTag: '', // 正在编辑的标签
      editingTagName: '', // 编辑中的标签名称
      isCreatingNewTag: false, // 是否正在创建新标签
      // 收藏页面题目选择相关（已选题目列表从 store 获取，不再使用本地 data）
      showCartMenu: false, // 购物篮菜单显示状态
      cartMenuTimer: null, // 购物篮菜单隐藏定时器
      previewDialogVisible: false, // 预览弹窗显示状态
      previewCreationMode: 'homework', // 预览弹窗中的创建模式
      previewCustomPaperName: '' // 预览弹窗中的任务名称
    }
  },
  computed: {
    // 计算属性确保数据响应式
    computedSubjectOptions() {
      return this.subjectOptions || []
    },
    computedUserList() {
      return this.userList || []
    },
    // 从 store 获取已选题目列表
    selectedQuestions: {
      get() {
        return this.$store.getters.selectedQuestions || []
      },
      set(value) {
        this.$store.commit('setSelectedQuestions', value)
      }
    },
    // 将题型列表转换为 QuestionList 需要的格式
    normalizedQuestionTypes() {
      if (!this.questionTypes || !Array.isArray(this.questionTypes)) {
        return []
      }
      // 过滤掉"全部"选项，因为 QuestionList 会自动添加
      return this.questionTypes
        .filter(type => type !== '全部')
        .map(type => ({
          name: typeof type === 'string' ? type : (type.name || type)
        }))
    },
    // 按题型分组题目
    groupedQuestions() {
      const groups = {}
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      if (!selectedQuestions || !Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
        return groups
      }
      selectedQuestions.forEach(question => {
        if (!question) return
        const type = this.getQuestionType(question) || '其他'
        if (!groups[type]) {
          groups[type] = []
        }
        groups[type].push(question)
      })
      // 确保每个组都是数组
      Object.keys(groups).forEach(key => {
        if (!Array.isArray(groups[key])) {
          groups[key] = []
        }
      })
      return groups
    }
  },
  created() {
    // 如果访问的是旧的 student/myQuestionBank 路径，重定向到新路径
    if (this.$route.path === '/student/myQuestionBank' || this.$route.path === '/student/myQuestionBank/index') {
      const query = this.$route.query || {}
      this.$router.replace({
        path: '/system/myQuestionBank/index',
        query: query
      })
      return
    }

    // 检查路由查询参数，如果有类型参数则设置当前类型
    if (this.$route.query && this.$route.query.type) {
      const targetType = this.$route.query.type
      if (targetType === 'homework' || targetType === 'paper') {
        this.currentType = targetType
      }
    }

    // 先加载科目选项和列表数据，不等待用户列表
    this.getSubjectOptions().then(() => {
      // 数据加载完成后再加载列表，确保 currentType 已设置
      this.$nextTick(() => {
        this.getList()
      })
    })

    // 在空闲时间异步加载用户列表，不影响页面初始渲染
    this.loadUserListLazy()
  },
  mounted() {
    // 检查是否需要刷新列表
    this.checkAndRefresh()
  },
  activated() {
    // 检查是否需要刷新列表（用于 keep-alive 缓存的组件）
    this.checkAndRefresh()
  },
  watch: {
    // 监听科目列表变化，自动选择第一个科目（仅在收藏页面）
    subjectOptions: {
      handler(newVal) {
        // 如果当前在收藏页面，科目列表有数据，且没有选择科目，自动选择第一个
        if (this.currentType === 'favorite' && newVal && Array.isArray(newVal) && newVal.length > 0 && !this.selectedSubject) {
          const firstSubject = newVal[0]
          if (firstSubject && firstSubject.subjectName) {
            this.$nextTick(() => {
              this.selectedSubject = firstSubject.subjectName
              // 设置当前科目，加载对应科目的题目列表
              this.$store.commit('setCurrentSubject', firstSubject.subjectName)
              // 加载题型列表和收藏列表
              this.loadQuestionTypes()
              this.getFavoriteList()
            })
          }
        }
      },
      immediate: true
    },
    // 监听科目变化，同步到 store
    selectedSubject: {
      handler(newVal, oldVal) {
        if (newVal) {
          // 当科目变化时，保存当前科目的题目列表并加载对应科目的题目列表
          this.$store.commit('setCurrentSubject', newVal)
          // 如果科目发生变化，且当前在收藏页面，重新加载题型列表
          if (oldVal !== newVal && this.currentType === 'favorite') {
            this.loadQuestionTypes()
          }
        }
      },
      immediate: true
    },
    // 监听路由变化，当路由变化时检查是否需要刷新
    '$route'(to, from) {
      // 如果访问的是旧的 student/myQuestionBank 路径，重定向到新路径
      if (to.path === '/student/myQuestionBank' || to.path === '/student/myQuestionBank/index') {
        const query = to.query || {}
        this.$router.replace({
          path: '/system/myQuestionBank/index',
          query: query
        })
        return
      }

      // 如果跳转到我的题库页面，检查是否需要刷新
      if (to.path === '/system/myQuestionBank/index') {
        // 检查是否有类型参数，如果有则切换到对应的标签
        let typeChanged = false
        if (to.query && to.query.type) {
          const targetType = to.query.type
          if (targetType === 'homework' || targetType === 'paper') {
            if (this.currentType !== targetType) {
              this.currentType = targetType
              typeChanged = true
            }
          }
        }
        // 延迟检查，确保 store 状态已更新
        this.$nextTick(() => {
          // 如果类型改变了，需要重新加载列表
          if (typeChanged) {
            this.queryParams.pageNum = 1
            this.queryParams.order = '1'
            this.getList()
          } else {
            // 如果类型没改变，检查是否需要刷新列表（从麓鸣题库跳转过来时）
            this.checkAndRefresh()
          }
        })
      }
    }
  },
  methods: {
    /** 格式化知识点显示 */
    formatKnowledgePoints(points) {
      if (!points || points === '' || points === '[]' || (Array.isArray(points) && points.length === 0)) {
        return '无'
      }
      if (Array.isArray(points)) {
        return points.join(', ')
      }
      return points
    },

    /** 查询列表 */
    getList() {
      this.loading = true
      const apiMethod = this.currentType === 'homework' ? listTable : listPaper
      // 构建查询参数，将空字符串转换为null
      const params = {
        ...this.queryParams,
        subject: this.queryParams.subject === '' ? null : this.queryParams.subject,
        creator: this.queryParams.creator === '' ? null : this.queryParams.creator,
        // 处理 customPaperName：如果为空字符串或只有空格，则设为 null
        customPaperName: (this.queryParams.customPaperName &&
          this.queryParams.customPaperName.trim() !== '')
          ? this.queryParams.customPaperName.trim()
          : null,
        // 传递 order 参数（如果为 null 则不传递）
        order: this.queryParams.order || undefined
      }
      // 移除 undefined 值，避免发送无效参数
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key]
        }
      })
      apiMethod(params).then(response => {
        this.tableList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      }).catch(error => {
        console.error('获取列表失败:', error)
        this.$message.error('获取列表失败：' + (error.message || '网络错误'))
        this.tableList = []
        this.total = 0
        this.loading = false
      })
    },

    /** 查询科目列表 */
    getSubjectOptions() {
      return listSubject().then(response => {
        // 确保数据是数组格式
        const options = response.rows || response.data || []
        const subjectList = Array.isArray(options) ? options : []
        // 使用 Vue.set 确保响应式
        this.$set(this, 'subjectOptions', subjectList)

        // 如果当前在收藏页面且没有选择科目，自动选择第一个科目
        if (this.currentType === 'favorite' && !this.selectedSubject && subjectList.length > 0) {
          const firstSubject = subjectList[0]
          if (firstSubject && firstSubject.subjectName) {
            this.$nextTick(() => {
              this.selectedSubject = firstSubject.subjectName
              // 设置当前科目，加载对应科目的题目列表
              this.$store.commit('setCurrentSubject', firstSubject.subjectName)
              // 加载题型列表和收藏列表
              this.loadQuestionTypes()
              this.getFavoriteList()
            })
          }
        }

        return Promise.resolve()
      }).catch(error => {
        console.error('获取科目数据失败:', error)
        this.$set(this, 'subjectOptions', [])
        return Promise.resolve()
      })
    },

    /** 延迟加载用户列表（在空闲时间加载，不影响页面初始渲染） */
    loadUserListLazy() {
      // 使用 requestIdleCallback 在浏览器空闲时加载，如果不支持则使用 setTimeout
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          this.loadUserList()
        }, { timeout: 3000 }) // 最多等待3秒
      } else {
        // 降级方案：延迟500ms后加载，给页面渲染留出时间
        setTimeout(() => {
          this.loadUserList()
        }, 500)
      }
    },

    /** 加载用户列表（使用 getTeacher API） */
    loadUserList() {
      return getTeacherList().then(response => {
        // 处理不同的响应格式
        let userData = []

        // 如果响应有 code 字段，说明是标准格式
        if (response.code !== undefined) {
          if (response.code === 200) {
            // 如果 data 是数组，直接使用
            if (Array.isArray(response.data)) {
              userData = response.data
            }
            // 如果 data 是单个对象，包装成数组
            else if (response.data && typeof response.data === 'object') {
              userData = [response.data]
            }
            // 兼容其他格式
            else {
              userData = response.rows || response.data || []
            }
          } else {
            console.error('获取教师列表失败:', response.msg)
            // 静默失败，不显示错误提示，避免影响用户体验
            this.$set(this, 'userList', [])
            return Promise.resolve()
          }
        }
        // 如果直接返回数组
        else if (Array.isArray(response)) {
          userData = response
        }
        // 如果直接返回单个对象
        else if (response && typeof response === 'object' && response.userId) {
          userData = [response]
        }
        // 其他情况
        else {
          userData = []
        }

        // 确保是数组格式
        const userList = Array.isArray(userData) ? userData : []

        // 使用 Vue.set 确保响应式
        this.$set(this, 'userList', userList)
        return Promise.resolve()
      }).catch(error => {
        console.error('获取教师列表失败:', error)
        // 静默失败，不显示错误提示，避免影响用户体验
        this.$set(this, 'userList', [])
        return Promise.resolve()
      })
    },

    /** 检查并刷新列表 */
    checkAndRefresh() {
      // 检查是否需要刷新列表
      if (this.$store && this.$store.getters && this.$store.getters.needRefresh) {
        // 刷新列表
        this.getList()
        // 清除刷新标记
        this.$store.commit('setNeedRefresh', false)
      }
    },

    /** 类型切换 */
    handleTypeChange(type) {
      // 如果传入了类型参数，直接设置；否则使用当前值
      if (type) {
        this.currentType = type
      }
      if (type === 'favorite') {
        // 切换到收藏页面时，如果科目列表有数据且未选择科目，自动选择第一个科目
        if (!this.selectedSubject && this.subjectOptions && this.subjectOptions.length > 0) {
          const firstSubject = this.subjectOptions[0]
          if (firstSubject && firstSubject.subjectName) {
            this.selectedSubject = firstSubject.subjectName
            // 设置当前科目，加载对应科目的题目列表
            this.$store.commit('setCurrentSubject', firstSubject.subjectName)
          }
        }

        // 切换到收藏页面时，固定使用"默认收藏"标签
        // 如果还没有加载教师信息，先加载
        if (!this.teacherInfo) {
          this.loadTeacherInfo()
        } else {
          // 如果已经加载过，直接加载题型
          this.loadQuestionTypes()
        }
        // 加载标签列表
        this.loadFavoriteTags()
        // 加载收藏列表
        this.getFavoriteList()
      } else {
        this.queryParams.pageNum = 1
        this.queryParams.order = '1' // 切换类型时恢复为升序
        this.getList()
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.subject = ''
      this.queryParams.customPaperName = ''
      this.queryParams.creator = ''
      this.queryParams.order = '1' // 重置时恢复为升序
      this.nameSearchType = 'all'
      this.handleQuery()
    },

    /** 排序变化处理 */
    handleSortChange({ column, prop, order }) {
      // 只处理创建时间列的排序
      if (prop === 'createTime') {
        if (order === 'ascending') {
          // 升序
          this.queryParams.order = '1'
        } else if (order === 'descending') {
          // 降序
          this.queryParams.order = '2'
        }
        // 重置到第一页并重新查询
        this.queryParams.pageNum = 1
        this.getList()
      }
    },

    /** 新增按钮操作 */
    handleAdd() {
      if (this.currentType === 'homework') {
        // 跳转到麓鸣题库，模式为作业
        this.$router.push({
          path: '/student/lumingQuestionBank/index',
          query: { mode: 'homework' }
        })
      } else {
        // 跳转到麓鸣题库，模式为组卷
        this.$router.push({
          path: '/student/lumingQuestionBank/index',
          query: { mode: 'paper' }
        })
      }
    },

    /** 跳转到新接口页面 */
    handleGoToNewPage() {
      // 跳转到新接口页面，传递当前类型参数
      this.$router.push({
        path: '/system/myQuestionBank/new',
        query: { type: this.currentType }
      })
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id
      const apiMethod = this.currentType === 'homework' ? getTable : getPaper
      apiMethod(id).then(response => {
        if (response.code === 200) {
          this.updateForm = {
            id: response.data.id,
            customPaperName: response.data.customPaperName
          }
          this.updateDialogVisible = true
          // 重置表单验证状态
          this.$nextTick(() => {
            if (this.$refs.updateForm) {
              this.$refs.updateForm.clearValidate()
            }
          })
        } else {
          this.$message.error('获取数据失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取数据失败：' + error.message)
      })
    },

    /** 提交修改 */
    submitUpdate() {
      this.$refs.updateForm.validate(valid => {
        if (valid) {
          const apiMethod = this.currentType === 'homework' ? updateTable : updatePaper
          const formData = {
            id: this.updateForm.id,
            customPaperName: this.updateForm.customPaperName
          }
          apiMethod(formData).then(response => {
            this.$modal.msgSuccess("修改成功")
            this.updateDialogVisible = false
            this.getList()
          }).catch(error => {
            this.$message.error('修改失败：' + (error.message || '网络错误'))
          })
        }
      })
    },

    /** 取消修改 */
    cancelUpdate() {
      this.updateDialogVisible = false
      this.resetUpdateForm()
    },

    /** 重置修改表单 */
    resetUpdateForm() {
      this.updateForm = {
        id: null,
        customPaperName: null
      }
      if (this.$refs.updateForm) {
        this.$refs.updateForm.clearValidate()
      }
    },

    /** 获取修改表单验证规则 */
    getUpdateRules() {
      const typeName = this.currentType === 'homework' ? '作业名称' : '试卷名称'
      return {
        customPaperName: [
          { required: true, message: typeName + '不能为空', trigger: 'blur' }
        ]
      }
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      const typeName = this.currentType === 'homework' ? '作业' : '试卷'
      this.$modal.confirm(`是否确认删除${typeName}编号为"${id}"的数据项？`).then(() => {
        const apiMethod = this.currentType === 'homework' ? delTable : delPaper
        return apiMethod(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },

    // 查看详情
    handleView(row) {
      this.currentItem = row
      this.detailVisible = true
      this.itemQuestions = []
      this.loadingDetail = true
      if (this.currentItem.questionIds) {
        const questionIds = this.currentItem.questionIds.split(',').filter(id => id.trim())
        if (questionIds.length > 0) {
          this.loadQuestionDetails(questionIds)
        } else {
          this.loadingDetail = false
        }
      } else {
        this.loadingDetail = false
      }
    },

    // 关闭详情弹窗
    closeDetail() {
      this.detailVisible = false
      this.currentItem = null
      this.itemQuestions = []
      this.loadingDetail = false
    },

    // 加载题目详情
    loadQuestionDetails(questionIds) {
      this.loadingDetail = true
      const getMethod = this.currentType === 'homework' ? getTable : getPaper
      getMethod(this.currentItem.id).then(response => {
        if (response.code === 200) {
          const item = response.data
          if (item.questionIds) {
            const sids = item.questionIds.split(',').filter(id => id.trim())
            // 获取 creator 和 subject，然后调用 preview 接口获取 subject_name
            const subjectCode = item.subject || item.subjectCode
            const userId = item.creator || item.creatorId || item.userId

            if (subjectCode && userId) {
              // 调用 preview 接口获取 subject_name
              getPreviewSubjectName({
                SubjectCode: subjectCode,
                userId: userId
              }).then(previewResponse => {
                if (previewResponse) {
                  let subjectName = null
                  if (previewResponse.data) {
                    if (typeof previewResponse.data === 'string') {
                      subjectName = previewResponse.data
                    } else if (typeof previewResponse.data === 'object') {
                      subjectName = previewResponse.data.subjectName ||
                        previewResponse.data.subject_name ||
                        previewResponse.data
                    }
                  } else if (previewResponse.subjectName) {
                    subjectName = previewResponse.subjectName
                  } else if (previewResponse.subject_name) {
                    subjectName = previewResponse.subject_name
                  }

                  if (subjectName) {
                    // preview 接口返回的就是科目名称，直接使用
                    const requestData = {
                      sids: sids,
                      subject_name: subjectName
                    }
                    return getQuestionsBySids(requestData)
                  } else {
                    // 使用 subjectCode 转换为科目名称作为降级方案
                    const fallbackSubjectName = this.getSubjectName(subjectCode) || subjectCode
                    const requestData = {
                      sids: sids,
                      subject_name: fallbackSubjectName
                    }
                    return getQuestionsBySids(requestData)
                  }
                } else {
                  // 如果 preview 接口失败，使用 subjectCode 作为降级方案
                  const fallbackSubjectName = this.getSubjectName(subjectCode) || subjectCode
                  const requestData = {
                    sids: sids,
                    subject_name: fallbackSubjectName
                  }
                  return getQuestionsBySids(requestData)
                }
              }).catch(error => {
                console.warn('调用 preview 接口失败：', error)
                // 如果 preview 接口失败，使用 subjectCode 作为降级方案
                const fallbackSubjectName = this.getSubjectName(subjectCode) || subjectCode
                const requestData = {
                  sids: sids,
                  subject_name: fallbackSubjectName
                }
                return getQuestionsBySids(requestData)
              }).then(questionsResponse => {
                if (questionsResponse) {
                  if (questionsResponse.code !== undefined) {
                    if (questionsResponse.code === 200) {
                      if (questionsResponse.data && questionsResponse.data.questions) {
                        this.itemQuestions = questionsResponse.data.questions || []
                      } else {
                        this.itemQuestions = questionsResponse.data || []
                      }
                    } else {
                      this.$message.error('获取题目数据失败：' + (questionsResponse.msg || '未知错误'))
                      this.itemQuestions = []
                    }
                  } else if (questionsResponse.questions) {
                    this.itemQuestions = questionsResponse.questions || []
                  } else {
                    this.itemQuestions = Array.isArray(questionsResponse) ? questionsResponse : []
                  }
                } else {
                  this.$message.error('获取题目数据失败：响应为空')
                  this.itemQuestions = []
                }
              }).catch(error => {
                this.$message.error('获取题目详情失败：' + error.message)
                this.itemQuestions = []
              }).finally(() => {
                this.loadingDetail = false
              })
            } else {
              // 如果没有 creator 或 subject，使用 subject 作为降级方案
              const fallbackSubjectName = this.getSubjectName(item.subject || subjectCode) || item.subject || subjectCode
              const requestData = {
                sids: sids,
                subject_name: fallbackSubjectName
              }
              getQuestionsBySids(requestData).then(questionsResponse => {
                if (questionsResponse) {
                  if (questionsResponse.code !== undefined) {
                    if (questionsResponse.code === 200) {
                      if (questionsResponse.data && questionsResponse.data.questions) {
                        this.itemQuestions = questionsResponse.data.questions || []
                      } else {
                        this.itemQuestions = questionsResponse.data || []
                      }
                    } else {
                      this.$message.error('获取题目数据失败：' + (questionsResponse.msg || '未知错误'))
                      this.itemQuestions = []
                    }
                  } else if (questionsResponse.questions) {
                    this.itemQuestions = questionsResponse.questions || []
                  } else {
                    this.itemQuestions = Array.isArray(questionsResponse) ? questionsResponse : []
                  }
                } else {
                  this.$message.error('获取题目数据失败：响应为空')
                  this.itemQuestions = []
                }
              }).catch(error => {
                this.$message.error('获取题目详情失败：' + error.message)
                this.itemQuestions = []
              }).finally(() => {
                this.loadingDetail = false
              })
            }
          } else {
            this.itemQuestions = []
            this.loadingDetail = false
          }
        } else {
          this.$message.error('获取详情失败：' + response.msg)
          this.itemQuestions = []
          this.loadingDetail = false
        }
      }).catch(error => {
        this.$message.error('获取详情失败：' + error.message)
        this.itemQuestions = []
        this.loadingDetail = false
      })
    },

    // 下载Word文档 - 显示选择弹窗
    handleDownloadWord(row) {
      this.currentDownloadRow = row
      this.wordDownloadOptions.includeAnswerAnalysis = false
      this.wordDownloadOptions.answersAtEnd = false
      this.wordDownloadDialogVisible = true
    },

    // 确认生成HTML内容并下载Word文档
    async confirmDownloadWord() {
      try {
        this.$message.info('正在生成Word文档，请稍候...')

        const getMethod = this.currentType === 'homework' ? getTable : getPaper
        const itemResponse = await getMethod(this.currentDownloadRow.id)
        if (itemResponse.code !== 200) {
          this.$message.error('获取详情失败')
          return
        }

        const item = itemResponse.data
        if (!item.questionIds) {
          this.$message.warning('该' + (this.currentType === 'homework' ? '作业' : '试卷') + '没有题目数据')
          return
        }

        const questionIds = item.questionIds.split(',').filter(id => id.trim())
        const questions = await this.getQuestionsData(questionIds, item.subject, item.creator)

        if (questions.length === 0) {
          this.$message.warning('没有找到题目数据')
          return
        }

        const htmlContent = WordGenerator.generatePrintHTML(
          item,
          questions,
          this.currentType === 'homework' ? 'homework' : 'paper',
          this.wordDownloadOptions.includeAnswerAnalysis,
          this.wordDownloadOptions.answersAtEnd
        )

        const requestData = {
          html: htmlContent,
          file_name: item.customPaperName || (this.currentType === 'homework' ? '作业文档' : '试卷文档')
        }

        const response = await htmlToWord(requestData)

        if (response instanceof Blob) {
          const url = window.URL.createObjectURL(response)
          const link = document.createElement('a')
          link.href = url
          link.download = `${item.customPaperName || (this.currentType === 'homework' ? '作业文档' : '试卷文档')}_${new Date().getTime()}.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          this.$message.success('Word文档下载成功！')
        } else {
          this.$message.error('下载失败：响应格式不正确')
        }

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

    // 获取题目数据的通用方法
    async getQuestionsData(questionIds, subject, creator) {
      try {
        const subjectCode = subject
        const userId = creator

        let subjectName = null

        // 如果有 creator 和 subject，优先使用 preview 接口
        if (subjectCode && userId) {
          try {
            const previewResponse = await getPreviewSubjectName({
              SubjectCode: subjectCode,
              userId: userId
            })

            if (previewResponse) {
              if (previewResponse.data) {
                if (typeof previewResponse.data === 'string') {
                  subjectName = previewResponse.data
                } else if (typeof previewResponse.data === 'object') {
                  subjectName = previewResponse.data.subjectName ||
                    previewResponse.data.subject_name ||
                    previewResponse.data
                }
              } else if (previewResponse.subjectName) {
                subjectName = previewResponse.subjectName
              } else if (previewResponse.subject_name) {
                subjectName = previewResponse.subject_name
              }

              // preview 接口返回的就是科目名称，直接使用
            }
          } catch (error) {
            console.warn('调用 preview 接口失败，使用降级方案：', error)
          }
        }

        // 如果 preview 接口失败或没有 creator，使用降级方案
        if (!subjectName) {
          subjectName = this.getSubjectName(subjectCode) || subjectCode
        }

        const requestData = {
          sids: questionIds,
          subject_name: subjectName
        }

        const questionsResponse = await getQuestionsBySids(requestData)

        if (questionsResponse) {
          if (questionsResponse.code !== undefined) {
            if (questionsResponse.code === 200) {
              const questions = questionsResponse.data && questionsResponse.data.questions
                ? questionsResponse.data.questions
                : questionsResponse.data || []
              return questions
            } else {
              throw new Error(questionsResponse.msg || '获取题目数据失败')
            }
          } else if (questionsResponse.questions) {
            return questionsResponse.questions || []
          } else {
            return Array.isArray(questionsResponse) ? questionsResponse : []
          }
        } else {
          throw new Error('获取题目数据失败：响应为空')
        }
      } catch (error) {
        console.error('获取题目数据失败:', error)
        throw error
      }
    },

    // 处理题目内容中的HTML标签
    processQuestionContent(content) {
      if (!content) return ''
      return latexRenderer.processQuestionContent(content)
    },

    // 处理答案内容
    processAnswerContent(question) {
      if (!question) return ''

      let answerContent = ''

      if ((question.DisplayAnswer === '见解答' || question.DisplayAnswer === '见试题解答内容') && question.Method) {
        answerContent = question.Method
      } else if (question.DisplayAnswer) {
        answerContent = question.DisplayAnswer
      } else if (question.Method) {
        answerContent = question.Method
      }

      if (!answerContent) return ''

      return latexRenderer.processQuestionContent(answerContent)
    },

    // 移除选项前缀
    removeOptionPrefix(option, index) {
      return latexRenderer.removeOptionPrefix(option, index)
    },

    // 获取科目名称
    getSubjectName(subjectCode) {
      if (!subjectCode) return ''
      const subject = this.subjectOptions.find(item => item.subjectCode === subjectCode)
      return subject ? subject.subjectName : subjectCode
    },

    // 获取创建人名称
    getCreatorName(creatorId) {
      // 如果 creatorId 为空，返回空字符串
      if (!creatorId && creatorId !== 0) {
        return ''
      }

      // 将 creatorId 转换为字符串和数字两种格式进行匹配
      const creatorIdStr = String(creatorId)
      const creatorIdNum = Number(creatorId)

      // 在用户列表中查找匹配的用户
      const user = this.userList.find(item => {
        // 同时匹配字符串和数字格式
        return item.userId === creatorId ||
          item.userId === creatorIdStr ||
          item.userId === creatorIdNum ||
          String(item.userId) === creatorIdStr
      })

      // 如果找到用户，返回昵称（确保是字符串）
      if (user) {
        return user.nickName || user.userName || String(user.userId) || ''
      }

      // 如果没找到，返回 creatorId 的字符串形式
      return String(creatorId || '')
    },

    // ========== 收藏相关方法 ==========

    /** 加载教师信息 */
    loadTeacherInfo() {
      getTeacherInfo().then(res => {
        if (res.code === 200 && res.data) {
          this.teacherInfo = res.data
          this.isAdmin = this.checkIsAdmin()

          // 根据 getTeacherInfo 返回的数据拼接老师学科
          // 数据格式：{ grade: "高中", roleName: "老师", subjectNames: "数学" }
          if (res.data.grade && res.data.subjectNames) {
            this.teacherSubjectName = res.data.grade + res.data.subjectNames
          } else if (res.data.gradeAndSubject) {
            // 兼容旧的字段名
            this.teacherSubjectName = res.data.gradeAndSubject
          }

          // 不再自动加载题型列表，由用户选择科目后手动触发
        } else {
          console.error('获取教师信息失败:', res)
        }
      }).catch(error => {
        console.error('获取教师信息失败:', error)
      })
    },

    /** 检查是否为管理员 */
    checkIsAdmin() {
      const roles = this.$store.getters.roles || []
      return roles.includes('admin') || roles.includes('administrator')
    },

    /** 科目变化处理（管理员） */
    handleSubjectChange(subject) {
      this.selectedSubject = subject
      // 切换科目时，保存当前科目的题目列表并加载对应科目的题目列表
      this.$store.commit('setCurrentSubject', subject)
      // 重新加载题型列表
      this.loadQuestionTypes()
      // 如果当前在收藏页面，重新获取收藏列表和题目详情
      if (this.currentType === 'favorite') {
        // 重置分页到第一页
        this.favoriteQueryParams.pageNum = 1
        // 重新获取收藏列表（会重新加载题目详情）
        this.getFavoriteList()
      }
    },

    /** 加载题型列表 */
    async loadQuestionTypes() {
      // 使用用户选择的科目
      const subjectName = this.selectedSubject

      // 如果没有科目，不加载题型
      if (!subjectName) {
        this.questionTypes = ['全部']
        return
      }

      try {
        const response = await getQuestionTypeDistribution(subjectName)
        if (response && response.message === 'success' && response.question_types) {
          // 提取题型名称（从对象键中获取）
          const typeNames = ['全部', ...Object.keys(response.question_types)]
          this.questionTypes = typeNames
        } else if (response && response.code === 200 && response.data) {
          // 兼容其他返回格式
          const types = response.data
          const typeNames = ['全部']
          if (Array.isArray(types)) {
            types.forEach(type => {
              if (typeof type === 'string') {
                typeNames.push(type)
              } else if (type && type.name) {
                typeNames.push(type.name)
              }
            })
          } else if (typeof types === 'object') {
            typeNames.push(...Object.keys(types))
          }
          this.questionTypes = typeNames
        } else {
          // 默认题型列表
          this.questionTypes = ['全部', '单选题', '多选题', '填空题', '判断题', '解答题']
        }
      } catch (error) {
        console.error('获取题型列表失败:', error)
        this.questionTypes = ['全部', '单选题', '多选题', '填空题', '判断题', '解答题']
      }
    },

    /** 题型点击 */
    handleQuestionTypeClick(type) {
      this.selectedQuestionType = type
      this.favoriteQueryParams.pageNum = 1
      this.getFavoriteList()
    },

    /** 获取收藏列表 */
    async getFavoriteList() {
      this.favoriteLoading = true
      try {
        // 先获取所有收藏列表（不进行题型筛选，因为收藏列表数据中没有题型信息）
        const params = {
          ...this.favoriteQueryParams,
          PageNum: this.favoriteQueryParams.pageNum,
          pageSize: this.favoriteQueryParams.pageSize,
          tags: this.selectedTag || '', // 使用选中的标签，空字符串表示查询全部收藏
          subjectName: this.selectedSubject || '' // 传递选择的科目
        }

        const response = await listQuestionFavorites(params)
        if (response && response.code === 200) {
          const favorites = response.rows || response.data || []

          // 如果有收藏数据，先批量获取题目详情（详情中包含题型信息）
          if (favorites.length > 0) {
            await this.loadFavoriteQuestionDetails(favorites)

            // 使用原始总数
            this.favoriteTotal = response.total || favorites.length
          } else {
            this.favoriteQuestions = []
            this.favoriteTotal = 0
          }
        } else {
          this.$message.error('获取收藏列表失败：' + (response.msg || '未知错误'))
          this.favoriteQuestions = []
          this.favoriteTotal = 0
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        this.$message.error('获取收藏列表失败：' + error.message)
        this.favoriteQuestions = []
        this.favoriteTotal = 0
      } finally {
        this.favoriteLoading = false
      }
    },

    /** 加载收藏题目的详情 */
    async loadFavoriteQuestionDetails(favorites) {
      try {
        // 获取科目名称（使用用户选择的科目）
        let subjectName = this.selectedSubject || ''
        if (!subjectName) {
          // 如果没有科目信息，使用默认值
          subjectName = '高中物理' // 默认值，实际应该从用户信息获取
        }

        // 收集所有题目的 questionSid
        const questionSids = favorites
          .map(fav => fav.questionSid)
          .filter(sid => sid)

        if (questionSids.length === 0) {
          this.favoriteQuestions = favorites
          return
        }

        // 批量获取题目详情
        const requestData = {
          subject_name: subjectName,
          sids: questionSids
        }

        const detailResponse = await getQuestionDetail(requestData)

        // 处理响应数据
        let questionDetails = []
        if (detailResponse && detailResponse.questions && Array.isArray(detailResponse.questions)) {
          questionDetails = detailResponse.questions
        } else if (detailResponse && Array.isArray(detailResponse)) {
          questionDetails = detailResponse
        } else if (detailResponse && detailResponse.data && Array.isArray(detailResponse.data)) {
          questionDetails = detailResponse.data
        }

        // 将题目详情合并到收藏列表中
        this.favoriteQuestions = favorites.map(favorite => {
          // 查找对应的题目详情
          const detail = questionDetails.find(q =>
            (q.sid || q.SID) === favorite.questionSid
          )

          if (detail) {
            // 合并收藏信息和题目详情
            return {
              ...favorite,
              ...detail,
              // 保留收藏的标签信息
              tags: favorite.tags,
              questionSid: favorite.questionSid
            }
          } else {
            // 如果没有找到详情，返回原始收藏数据
            return favorite
          }
        })
      } catch (error) {
        console.error('加载题目详情失败:', error)
        // 即使加载详情失败，也显示收藏列表
        this.favoriteQuestions = favorites
      }
    },

    /** 删除收藏 */
    handleDeleteFavorite(question) {
      // 注意：确认对话框已经在 FavoriteQuestionList 的 handleBeforeUnfavorite 中处理
      // 这里只需要重新加载列表即可
      // 重新加载列表
      this.getFavoriteList()
    },

    /** 查看详情 */
    handleViewDetail(question) {
      this.currentQuestion = question
      this.analysisVisible = true
      this.loadingQuestionDetail = true
      this.questionDetail = null

      // 获取科目名称（使用用户选择的科目）
      const subjectName = this.selectedSubject || '高中物理' // 默认值

      // 构建请求数据
      const requestData = {
        subject_name: subjectName,
        sids: [question.sid || question.SID || question.questionSid]
      }

      // 调用API获取题目详情
      getQuestionDetail(requestData).then(res => {
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          this.questionDetail = res.questions[0]
        } else if (res && res.SID) {
          this.questionDetail = res
        } else if (res && res.code === 200 && res.data) {
          this.questionDetail = res.data
        } else {
          this.$message.error('获取题目详情失败: 数据格式错误')
        }
      }).catch(error => {
        console.error('获取题目详情失败:', error)
        this.$message.error('获取题目详情失败: ' + (error.message || '网络错误'))
      }).finally(() => {
        this.loadingQuestionDetail = false
      })
    },

    /** 关闭解析弹窗 */
    closeAnalysis() {
      this.analysisVisible = false
      this.currentQuestion = null
      this.questionDetail = null
    },

    /** 处理修改题目 */
    handleEditQuestion(question) {
      // 设置要编辑的题目（先使用传入的题目数据）
      this.editingQuestion = question
      // 打开编辑弹窗
      this.questionEditDialogVisible = true
      // 设置加载状态
      this.loadingQuestion = true

      // 使用选择的科目作为 subject_name
      const subjectName = this.selectedSubject || ''

      // 构建请求数据
      const requestData = {
        subject_name: subjectName,
        sids: [question.sid || question.SID || question.questionSid]
      }

      // 调用API获取题目详情
      getQuestionDetail(requestData).then(res => {
        // 检查响应数据格式
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          this.editingQuestion = res.questions[0]
        } else if (res && res.SID) {
          this.editingQuestion = res
        } else if (res && res.code === 200 && res.data) {
          this.editingQuestion = res.data
        } else {
          // 如果获取失败，使用原始题目数据
          console.warn('获取题目详情失败，使用原始数据')
          this.$message.warning('获取题目详情失败，使用当前数据')
        }
      }).catch(error => {
        console.error('获取题目详情失败:', error)
        // 如果获取失败，使用原始题目数据
        this.$message.warning('获取题目详情失败，使用当前数据: ' + (error.message || '网络错误'))
      }).finally(() => {
        this.loadingQuestion = false
      })
    },

    /** 处理题目保存 */
    async handleQuestionSave(updatedQuestion) {
      // 保存成功后，重新加载收藏列表
      try {
        // 重新获取收藏列表
        await this.getFavoriteList()
        this.$message.success('题目保存成功，列表已刷新')
      } catch (error) {
        console.error('刷新题目列表失败:', error)
        // 即使刷新失败，也更新本地列表
        const questionIndex = this.favoriteQuestions.findIndex(q =>
          (q.sid && q.sid === updatedQuestion.sid) ||
          (q.SID && q.SID === updatedQuestion.SID) ||
          (q.questionSid && q.questionSid === updatedQuestion.questionSid)
        )

        if (questionIndex !== -1) {
          // 更新题目数据
          this.$set(this.favoriteQuestions, questionIndex, updatedQuestion)
        }
        this.$message.success('题目保存成功')
      }
    },

    /** 处理题目编辑弹窗关闭 */
    handleQuestionEditClose() {
      this.questionEditDialogVisible = false
      this.editingQuestion = null
    },

    /** 添加题目到已选列表 */
    handleAddToPaper(question) {
      if (!this.isQuestionSelected(question.sid || question.SID || question.questionSid)) {
        this.$store.commit('addSelectedQuestion', question)
        this.$message.success('题目已添加到已选列表')
      } else {
        this.$message.warning('该题目已在已选列表中')
      }
    },

    /** 从已选列表移除题目 */
    handleRemoveFromPaper(question) {
      // 兼容处理：question 可能是对象或 ID
      const questionId = question?.sid || question?.SID || question?.questionSid || question
      if (!questionId) return

      this.$store.commit('removeSelectedQuestion', questionId)
      this.$message.success('题目已从已选列表移除')
    },

    /** 检查题目是否已选择 */
    isQuestionSelected(sid) {
      if (!sid) return false
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      return selectedQuestions.some(q => {
        const qSid = q.sid || q.SID || q.questionSid
        return qSid === sid || String(qSid) === String(sid)
      })
    },

    /** 按题型删除题目 */
    removeQuestionsByType(type) {
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      if (!selectedQuestions || !Array.isArray(selectedQuestions)) {
        this.$store.commit('setSelectedQuestions', [])
        return
      }
      const filtered = selectedQuestions.filter(q => {
        const questionType = this.getQuestionType(q)
        return questionType !== type
      })
      this.$store.commit('setSelectedQuestions', filtered)
    },

    /** 清空所有题目 */
    clearAllQuestions() {
      this.$store.commit('clearSelectedQuestions')
      this.showCartMenu = false
    },

    /** 显示预览弹窗 */
    showPreviewDialog() {
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      if (!selectedQuestions || !Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
        this.$message.warning('请先选择题目')
        return
      }
      // 初始化预览弹窗的数据
      this.previewCreationMode = 'homework'
      this.previewCustomPaperName = ''
      this.previewDialogVisible = true
      this.showCartMenu = false
    },

    /** 关闭预览弹窗 */
    handlePreviewClose() {
      this.previewDialogVisible = false
    },

    /** 确认创建 */
    handlePreviewConfirm(data) {
      // 更新创建模式和任务名称
      const creationMode = data.creationMode || 'homework'
      const customPaperName = data.customPaperName || ''

      // 更新题目顺序（如果拖拽了）
      if (data.questions && Array.isArray(data.questions)) {
        this.$store.commit('setSelectedQuestions', data.questions)
      }

      // 设置科目（使用用户选择的科目）
      const subject = this.selectedSubject || ''

      // 获取已选题目
      const selectedQuestions = this.$store.getters.selectedQuestions || []

      // 构建提交数据
      const submitData = {
        subject: subject,
        customPaperName: customPaperName,
        questionIds: selectedQuestions.map(q => q.sid || q.SID || q.questionSid).join(',')
      }

      // 关闭预览弹窗
      this.previewDialogVisible = false

      // 根据创建模式调用不同的API
      const apiMethod = creationMode === 'homework' ? addTable : addPaper
      apiMethod(submitData).then(() => {
        this.$modal.msgSuccess(creationMode === 'homework' ? '作业创建成功' : '组卷创建成功')
        // 清空已选题目
        this.$store.commit('clearSelectedQuestions')
        // 切换到对应的标签页
        this.currentType = creationMode === 'homework' ? 'homework' : 'paper'
        // 重置查询参数并刷新列表
        this.queryParams.pageNum = 1
        this.queryParams.order = '1'
        this.getList()
      }).catch(error => {
        this.$message.error((creationMode === 'homework' ? '作业' : '组卷') + '创建失败：' + error.message)
      })
    },

    /** 处理购物篮鼠标进入 */
    handleCartMouseEnter() {
      // 清除延迟隐藏的定时器
      if (this.cartMenuTimer) {
        clearTimeout(this.cartMenuTimer)
        this.cartMenuTimer = null
      }
      this.showCartMenu = true
    },

    /** 处理购物篮鼠标离开 */
    handleCartMouseLeave() {
      // 延迟隐藏，给鼠标移动到菜单的时间
      this.cartMenuTimer = setTimeout(() => {
        this.showCartMenu = false
        this.cartMenuTimer = null
      }, 200) // 200ms 延迟
    },

    /** 获取题目类型 */
    getQuestionType(question) {
      return question.CateName || question.cateName || question.cate || question.qtype || '未知题型'
    },

    /** 获取题目难度（转换为中文描述） */
    getQuestionDifficulty(question) {
      const difficulty = question.Degree || question.degree || question.difficulty || question.Difficulty
      if (difficulty === undefined || difficulty === null || difficulty === '') {
        return '未知'
      }

      // 如果已经是文字描述，直接返回
      if (typeof difficulty === 'string' && ['简单', '较易', '中等', '较难', '困难', 'easy', 'easier', 'medium', 'harder', 'hard'].includes(difficulty)) {
        const difficultyMap = {
          'easy': '简单',
          'easier': '较易',
          'medium': '中等',
          'harder': '较难',
          'hard': '困难'
        }
        return difficultyMap[difficulty] || difficulty
      }

      // 如果是数字，转换为文字描述
      const diff = parseFloat(difficulty)
      if (!isNaN(diff)) {
        if (diff >= 0 && diff <= 0.2) return '困难'
        if (diff > 0.2 && diff <= 0.4) return '较难'
        if (diff > 0.4 && diff <= 0.6) return '中等'
        if (diff > 0.6 && diff <= 0.8) return '较易'
        if (diff > 0.8 && diff <= 1) return '简单'
      }

      return '未知'
    },

    /** 从章节路径获取科目（用于预览弹窗） */
    getSubjectFromChapter(question) {
      // 收藏的题目可能没有章节信息，直接返回当前选择的科目
      return this.selectedSubject || ''
    },

    /** 收藏分页处理 */
    handleFavoritePagination(pageData) {
      if (pageData && typeof pageData === 'object') {
        if (pageData.page !== undefined) {
          this.favoriteQueryParams.pageNum = pageData.page
        }
        if (pageData.limit !== undefined) {
          this.favoriteQueryParams.pageSize = pageData.limit
        }
      }
      this.getFavoriteList()
    },

    /** 加载收藏标签列表 */
    async loadFavoriteTags() {
      try {
        const response = await listQuestionTags()
        if (response && response.code === 200) {
          // 处理响应数据，可能是数组或对象
          let tags = []
          if (Array.isArray(response.data)) {
            tags = response.data
          } else if (response.data && typeof response.data === 'object') {
            // 如果是对象，提取标签值
            tags = Object.values(response.data)
          } else if (Array.isArray(response.rows)) {
            tags = response.rows
          }

          // 去重并排序
          const uniqueTags = [...new Set(tags)]
          this.favoriteTags = uniqueTags

          // 如果当前选中的标签不在列表中，切换到空标签（查询全部）
          if (this.selectedTag && !this.favoriteTags.includes(this.selectedTag)) {
            this.selectedTag = ''
          }
        } else {
          // 如果获取失败，使用空标签列表
          this.favoriteTags = []
          this.selectedTag = ''
        }
      } catch (error) {
        console.error('获取标签列表失败:', error)
        // 如果获取失败，使用空标签列表
        this.favoriteTags = []
        this.selectedTag = ''
      }
    },

    /** 标签点击切换 */
    handleTagClick(tag) {
      if (this.editingTag === tag) {
        return // 正在编辑时，点击标签不切换
      }
      this.selectedTag = tag
      // 重置分页并重新加载收藏列表
      this.favoriteQueryParams.pageNum = 1
      this.getFavoriteList()
    },

    /** 创建新标签 */
    handleCreateNewTag() {
      // 如果正在编辑其他标签，先取消
      if (this.editingTag) {
        this.handleCancelEditTag()
      }
      this.isCreatingNewTag = true
      this.editingTag = '__new__'
      this.editingTagName = ''
      this.$nextTick(() => {
        // 聚焦到输入框
        const inputs = this.$refs.tagInput
        if (inputs) {
          const inputArray = Array.isArray(inputs) ? inputs : [inputs]
          if (inputArray.length > 0) {
            const input = inputArray[inputArray.length - 1]
            if (input && input.$el) {
              const inputEl = input.$el.querySelector('input')
              if (inputEl) {
                inputEl.focus()
              }
            }
          }
        }
      })
    },

    /** 编辑标签 */
    handleEditTag(tag) {
      // 如果正在编辑其他标签，先取消
      if (this.editingTag && this.editingTag !== tag) {
        this.handleCancelEditTag()
      }
      this.isCreatingNewTag = false
      this.editingTag = tag
      this.editingTagName = tag
      this.$nextTick(() => {
        // 聚焦到输入框
        const inputs = this.$refs.tagInput
        if (inputs && inputs.length > 0) {
          const input = inputs.find(inp => inp && inp.$el)
          if (input) {
            input.focus()
            input.select()
          }
        }
      })
    },

    /** 保存标签 */
    async handleSaveTag() {
      const newTagName = this.editingTagName.trim()

      if (!newTagName) {
        this.$message.warning('标签名称不能为空')
        return
      }

      // 检查标签是否已存在
      if (this.favoriteTags.includes(newTagName) && (this.isCreatingNewTag || newTagName !== this.editingTag)) {
        this.$message.warning('标签已存在')
        return
      }

      try {
        if (this.isCreatingNewTag) {
          // 新建标签：使用 PUT 方法创建新标签
          await updateQuestionTag({
            tags: newTagName
          })

          // 重新加载标签列表（确保与服务器同步）
          await this.loadFavoriteTags()

          // 切换到新标签
          this.selectedTag = newTagName
          this.$message.success('标签创建成功')

          // 切换到新标签并加载收藏列表
          this.favoriteQueryParams.pageNum = 1
          this.getFavoriteList()
        } else {
          // 修改标签：使用 PUT 方法
          const oldTagName = this.editingTag
          await updateQuestionTag({
            tags: newTagName
          })

          // 更新标签列表
          const index = this.favoriteTags.indexOf(oldTagName)
          if (index !== -1) {
            this.$set(this.favoriteTags, index, newTagName)
          }

          // 如果当前选中的是正在编辑的标签，更新选中状态
          if (this.selectedTag === oldTagName) {
            this.selectedTag = newTagName
          }

          this.$message.success('标签修改成功')

          // 如果修改了标签，需要重新加载收藏列表
          this.favoriteQueryParams.pageNum = 1
          this.getFavoriteList()
        }

        // 退出编辑模式
        this.editingTag = ''
        this.editingTagName = ''
        this.isCreatingNewTag = false
      } catch (error) {
        console.error('保存标签失败:', error)
        this.$message.error('保存标签失败：' + (error.message || '网络错误'))
      }
    },

    /** 删除标签 */
    async handleDeleteTag(tag) {
      try {
        // 确认删除
        await this.$confirm(`确定要删除标签"${tag}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 删除标签：使用 PUT 方法，传入空字符串来删除标签
        // 注意：删除标签可能需要删除该标签下的所有收藏，或者通过特殊API
        // 这里先尝试使用 PUT 方法传入空字符串
        await updateQuestionTag({
          tags: '' // 传入空字符串表示删除
        })

        // 重新加载标签列表（确保与服务器同步）
        await this.loadFavoriteTags()

        // 如果删除的是当前选中的标签，切换到空标签（查询全部）
        if (this.selectedTag === tag) {
          this.selectedTag = ''
          this.favoriteQueryParams.pageNum = 1
          this.getFavoriteList()
        }

        this.$message.success('标签删除成功')
      } catch (error) {
        if (error === 'cancel') {
          return // 用户取消删除
        }
        console.error('删除标签失败:', error)
        this.$message.error('删除标签失败：' + (error.message || '网络错误'))
      }
    },

    /** 取消编辑标签 */
    handleCancelEditTag() {
      if (this.isCreatingNewTag) {
        // 如果是新建标签，从列表中移除
        // 注意：新建标签还没有真正创建，所以不需要从列表中移除
      }
      this.editingTag = ''
      this.editingTagName = ''
      this.isCreatingNewTag = false
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.cartMenuTimer) {
      clearTimeout(this.cartMenuTimer)
      this.cartMenuTimer = null
    }
  }
}
</script>

<style scoped lang="scss">
// 表格列头筛选样式
.table-header-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .el-select {
    width: 100%;
  }
}

// 下拉框选项居中对齐（使用深度选择器）
::v-deep .el-select-dropdown__item {
  text-align: center !important;

  span {
    display: block;
    text-align: center !important;
    width: 100%;
  }
}

.table-header-search-name {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 5px;

  .search-input {
    width: 60%;
    max-width: 200px;
    padding-right: 5px;
  }

  .search-button {
    flex-shrink: 0;
    // margin-left: 5px;
    padding: 8px 9px;
  }
}

// 操作区域样式
.action-container {
  margin-bottom: 10px;

  .action-content {
    background: white;
    padding: 5px 15px;
    border-radius: 4px;
    border: 1px solid #e9ecef;

    .action-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
  }
}

// 类型切换标签样式优化
.type-switch-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f7fa;
  padding: 4px;
  border-radius: 8px;
}

.type-tab {
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
  position: relative;
}

.type-tab:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.type-tab.active {
  color: #409eff;
  background: #fff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
  font-weight: 600;
}

.type-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 3px;
  background: #409eff;
  border-radius: 2px 2px 0 0;
}

// 新增按钮样式
.add-button {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.name-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-content {
  height: 75vh;
  overflow-y: auto;
  padding: 10px;
}

.detail-header {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
}

.detail-title-section {
  display: flex;
  // flex-direction: column;
  gap: 15px;
}

.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.detail-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 6px;
}

.meta-tag i {
  font-size: 14px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.no-data {
  color: #909399;
  font-style: italic;
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

.question-label {
  background-color: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  border: 1px solid #d1e7ff;
}

.question-options {
  margin: 12px 0;
}

.option-item {
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

/* 收藏页面样式 */
.favorite-container {
  background: white;
  // border: 1px solid #e9ecef;
  // padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.favorite-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0; // 重要：允许 flex 子元素收缩
  gap: 20px;
}

/* 标签面板样式 */
.favorite-tags-panel {
  width: 250px;
  min-width: 250px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  // align-items: center;
}

.new-tag-btn {
  width: 50%;
  // margin-bottom: 10px;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 36px;

  &:hover {
    border-color: #409eff;
    background: #f0f9ff;
  }

  &.active {
    border-color: #409eff;
    background: #ecf5ff;
    color: #409eff;
    font-weight: 500;
  }

  &.editing {
    border-color: #409eff;
    padding: 4px;
  }
}

.tag-name {
  flex: 1;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.tag-input {
  flex: 1;
  margin-right: 8px;
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.tag-actions-display {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tag-item:hover .tag-actions-display {
  opacity: 1;
}

.tag-action-icon {
  cursor: pointer;
  font-size: 16px;
  color: #409eff;
  transition: color 0.3s;

  &:hover {
    color: #66b1ff;
  }
}

.tag-edit-icon {
  cursor: pointer;
  font-size: 14px;
  color: #909399;
  transition: color 0.3s;

  &:hover {
    color: #409eff;
  }
}

.tag-delete-icon {
  cursor: pointer;
  font-size: 14px;
  color: #f56c6c;
  transition: color 0.3s;

  &:hover {
    color: #f78989;
  }
}

.new-tag-item {
  border-style: dashed;
  border-color: #409eff;
}

/* 题目列表面板样式 */
.favorite-questions-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 科目选择（顶部导航栏，仅收藏页面） */
.subject-selector-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  white-space: nowrap;
}

.teacher-subject-display-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-hint-top {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.no-subject-hint-top {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
}

.no-subject-hint-top i {
  font-size: 16px;
}

/* 未选择科目提示样式 */
.no-subject-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.no-subject-tip .tip-text {
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
  text-align: center;
}

/* 购物篮样式 */
.shopping-cart-container {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 10px;
  margin-right: 20px;
}

.shopping-cart-icon {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.cart-icon-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6600;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

.cart-menu {
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  z-index: 1000;
  min-width: 220px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  margin-top: 0;
}

.cart-menu-content {
  display: flex;
  flex-direction: column;
}

.cart-question-groups {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.cart-question-group {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.cart-question-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.no-groups-hint {
  padding: 10px 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.group-type {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  flex: 1;
  min-width: 0;
}

.group-count {
  font-size: 12px;
  color: #909399;
  margin: 0 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.delete-btn {
  color: #409eff;
  padding: 0;
  font-size: 12px;
}

.delete-btn:hover {
  color: #66b1ff;
}

.cart-menu-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.delete-all-btn {
  color: #409eff;
  padding: 0 10px;
  font-size: 12px;
}

.delete-all-btn:hover {
  color: #66b1ff;
}

.preview-btn {
  background: #ff6600;
  border-color: #ff6600;
  color: #fff;
}

.preview-btn:hover {
  background: #ff8533;
  border-color: #ff8533;
}
</style>

<!-- 全局样式：下拉框选项居中对齐 -->
<style lang="scss">
// 由于 Element UI 的下拉框挂载到 body，需要使用全局样式
.el-select-dropdown__item {
  text-align: center !important;

  span {
    display: block;
    text-align: center !important;
    width: 100%;
  }
}
</style>
