<template>
  <div class="app-container">

    <!-- 数据源和科目选择 -->
    <div class="top-controls">
      <!-- 数据源和科目选择（同一行） -->
      <div class="data-source-subject-row">
        <!-- 数据源切换 -->
        <div class="data-source-selector">
          <!-- <span class="control-label">数据源：</span> -->
          <div class="data-source-tabs">
            <span
              v-for="item in dataSourceOptions"
              :key="item.value"
              class="data-source-tab"
              :class="{ 'active': dataSourceType === item.value }"
              @click="handleDataSourceChange(item.value)"
            >
              {{ item.label }}
            </span>
          </div>
        </div>

        <!-- 科目选择（所有用户可见，通过接口获取科目列表） -->
        <div class="subject-selector">
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
        <!-- 购物篮图标和菜单容器 -->
        <div
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

    <div class="question-bank-builder">
      <!-- 左侧：数据源内容区域 -->
      <!-- 教辅材料模式下，如果显示图形化视图，则不显示左侧面板 -->
      <DataSourceSelector
        v-if="dataSourceType !== 'material' || !showMaterialCardView"
        ref="dataSourceSelectorRef"
        :data-source-type="dataSourceType"
        :chapter-options="chapterOptions"
        :knowledge-options="knowledgeOptions"
        :knowledge-list="knowledgeList"
        :knowledge-search-keyword="knowledgeSearchKeyword"
        :material-options="materialOptions"
        :loading-materials="loadingMaterials"
        :is-admin="isAdmin"
        :teacher-subject-name="teacherSubjectName"
        :selected-subject-for-material="dataSourceType === 'material' ? selectedSubject : selectedSubjectForMaterial"
        :material-subject-options="materialSubjectOptions"
        :selected-series-type="selectedSeriesType"
        :series-search-keyword="seriesSearchKeyword"
        :series-type-options="seriesTypeOptions"
        :hide-tabs="true"
        @switch-data-source="switchDataSource"
        @chapter-click="handleChapterClick"
        @knowledge-click="handleKnowledgeClick"
        @knowledge-list-item-click="handleKnowledgeListItemClick"
        @knowledge-search-input="handleKnowledgeSearchInput"
        @material-click="handleMaterialClick"
        @series-type-change="onSeriesTypeChange"
        @series-search="onSeriesSearch"
        @back-to-card-view="handleBackToCardView"
      >
        <!-- 拍照搜题插槽 -->
        <template #photo-search>
          <PhotoSearch
            :is-admin="isAdmin"
            :teacher-subject-name="teacherSubjectName"
            :admin-subject="selectedSubject || ''"
            @search-success="handlePhotoSearchSuccess"
            @search-error="handlePhotoSearchError"
          />
        </template>

        <!-- 菁优网搜题插槽 -->
        <template #third-party-search>
          <ThirdPartySearch
            ref="thirdPartySearchRef"
            :is-admin="isAdmin"
            :teacher-subject-name="teacherSubjectName"
            :admin-subject="selectedSubject || ''"
            :knowledge-options="knowledgeOptions"
            @search-success="handleThirdPartySearchSuccess"
            @search-error="handleThirdPartySearchError"
            @filter-change="handleThirdPartyFilterChange"
          />
        </template>
      </DataSourceSelector>

      <!-- 中间：题目展示区域 -->
      <!-- 教辅材料图形化视图 -->
      <div v-if="dataSourceType === 'material' && showMaterialCardView" class="material-card-view-wrapper">
        <MaterialCardView
          :materials="rawMaterialList"
          :loading="loadingMaterials"
          :selected-series-type="selectedSeriesType"
          :series-search-keyword="seriesSearchKeyword"
          :series-type-options="seriesTypeOptions"
          @material-click="handleMaterialCardClick"
          @series-type-change="onSeriesTypeChange"
          @series-search="onSeriesSearch"
        />
      </div>

      <!-- 题目列表视图 -->
      <div v-else class="center-panel-wrapper">
        <!-- 菁优网搜题筛选区域（仅在菁优网搜题模式下显示） -->
        <div v-if="dataSourceType === 'thirdParty'" class="third-party-filter-panel">
          <!-- 筛选面板标题栏 -->
          <div class="filter-panel-header" @click="toggleFilterPanel">
            <span class="filter-panel-title">筛选条件</span>
            <div class="filter-panel-right">
              <!-- 搜索动画 -->
              <div v-if="thirdPartyFilterData.loading" class="search-loading-animation">
                <i class="el-icon-loading"></i>
                <span class="search-loading-text">搜索中...</span>
              </div>
              <i :class="filterPanelExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" class="filter-panel-toggle-icon"></i>
            </div>
          </div>
          <!-- 筛选内容区域 -->
          <div v-show="filterPanelExpanded" class="filter-panel-content">
          <!-- 难度等级 -->
          <div class="filter-section">
            <span class="filter-label">难度等级：</span>
            <div class="filter-tags">
              <span
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.difficulty === 0 }"
                @click="handleThirdPartyDifficultyToggle(0)"
              >
                不限
              </span>
              <span
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.difficulty === 11 }"
                @click="handleThirdPartyDifficultyToggle(11)"
              >
                易
              </span>
              <span
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.difficulty === 12 }"
                @click="handleThirdPartyDifficultyToggle(12)"
              >
                较易
              </span>
              <span
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.difficulty === 13 }"
                @click="handleThirdPartyDifficultyToggle(13)"
              >
                中档
              </span>
              <span
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.difficulty === 14 }"
                @click="handleThirdPartyDifficultyToggle(14)"
              >
                较难
              </span>
              <span
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.difficulty === 15 }"
                @click="handleThirdPartyDifficultyToggle(15)"
              >
                难
              </span>
            </div>
          </div>

          <!-- 题目类型分布 -->
          <div class="filter-section" v-if="thirdPartyFilterData.questionTypes.length > 0">
            <span class="filter-label">题目类型：</span>
            <div class="filter-tags">
              <span
                v-for="type in displayedQuestionTypes"
                :key="type"
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.questionType === type }"
                @click="handleThirdPartyQuestionTypeToggle(type)"
              >
                {{ type }}
              </span>
              <!-- 更多/收起按钮 -->
              <span
                v-if="thirdPartyFilterData.questionTypes.length > 10"
                class="filter-tag-more"
                @click="toggleQuestionTypeExpand"
              >
                {{ questionTypeExpanded ? '收起' : '更多' }}
                <i :class="questionTypeExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </span>
            </div>
          </div>

          <!-- 来源类型 -->
          <div class="filter-section">
            <span class="filter-label">来源类型：</span>
            <div class="filter-tags">
              <span
                v-for="source in displayedSourceTypes"
                :key="source.value"
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.selectedSources.includes(source.value) }"
                @click="handleThirdPartySourceToggle(source.value)"
              >
                {{ source.label }}
              </span>
              <!-- 更多/收起按钮 -->
              <span
                v-if="thirdPartyFilterData.filteredSourceTypes.length > 10"
                class="filter-tag-more"
                @click="toggleSourceTypeExpand"
              >
                {{ sourceTypeExpanded ? '收起' : '更多' }}
                <i :class="sourceTypeExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </span>
            </div>
          </div>

          <!-- 年份范围 -->
          <div class="filter-section">
            <span class="filter-label">年份范围：</span>
            <div class="filter-tags">
              <span
                v-for="year in thirdPartyFilterData.yearOptions"
                :key="year.value"
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.selectedYears.includes(year.value) }"
                @click="handleThirdPartyYearToggle(year.value)"
              >
                {{ year.label }}
              </span>
            </div>
          </div>

          <!-- 高级选项 -->
          <div class="filter-section">
            <span class="filter-label">高级选项：</span>
            <div class="filter-tags">
              <span
                v-for="option in thirdPartyFilterData.advancedOptions"
                :key="option.value"
                class="filter-tag"
                :class="{ 'active': thirdPartyFilterData.selectedAdvancedOptions.includes(option.value) }"
                @click="handleThirdPartyAdvancedToggle(option.value)"
              >
                {{ option.label }}
              </span>
            </div>
          </div>
          </div>
        </div>

        <div class="question-list-wrapper" :class="{ 'searching': dataSourceType === 'thirdParty' && thirdPartyFilterData.loading }">
          <!-- 搜索遮罩层 -->
          <div v-if="dataSourceType === 'thirdParty' && thirdPartyFilterData.loading" class="search-overlay">
            <div class="search-loading-animation-large">
              <i class="el-icon-loading"></i>
              <span class="search-loading-text-large">搜索中...</span>
            </div>
          </div>
          <!-- 未选择科目提示 -->
          <div v-if="!selectedSubject" class="no-subject-hint">
            <el-empty description="请先选择科目">
              <template slot="image">
                <i class="el-icon-warning-outline" style="font-size: 80px; color: #909399;"></i>
              </template>
              <template slot="description">
                <p style="color: #606266; font-size: 14px; margin: 10px 0;">请在上方选择科目后查看题目</p>
              </template>
            </el-empty>
          </div>
          <QuestionList
            v-else
            ref="questionListRef"
            :questions="filteredQuestions"
            :question-types="questionTypes"
            :selected-questions="selectedQuestions"
            :process-question-content="processQuestionContent"
            :subject-name="selectedSubject"
            :show-pagination="shouldShowPagination"
            :total="pagination.total"
            :page-num="pagination.pageNum"
            :page-size="pagination.pageSize"
            :show-third-party-pagination="dataSourceType === 'thirdParty' && allQuestions.length > 0"
            :is-third-party-mode="dataSourceType === 'thirdParty'"
            :current-page="thirdPartyFilterData.currentPage || 1"
            :can-go-prev="true"
            :can-go-next="true"
            @show-analysis="showAnalysis"
            @add-to-paper="addToSelection"
            @remove-from-paper="removeFromSelection"
            @pagination-change="handlePaginationChange"
            @prev-page="handleThirdPartyPrevPage"
            @next-page="handleThirdPartyNextPage"
          />
        </div>
      </div>
    </div>

    <!-- 解析弹窗 -->
    <QuestionAnalysisDialog
      :visible="analysisVisible"
      :current-question="currentQuestion"
      :question-detail="questionDetail"
      :loading-detail="loadingDetail"
      :process-question-content="processQuestionContent"
      @close="closeAnalysis"
    />

    <!-- 预览弹窗 -->
    <PreviewDialog
      :visible.sync="previewDialogVisible"
      :selected-questions="selectedQuestions"
      :preview-creation-mode.sync="previewCreationMode"
      :preview-custom-paper-name.sync="previewCustomPaperName"
      :subject="form.subject || selectedSubject || teacherSubjectName || ''"
      :is-admin="isAdmin"
      :teacher-subject-name="teacherSubjectName"
      :selected-subject="selectedSubject"
      :get-subject-from-chapter="getSubjectFromChapter"
      @confirm="handlePreviewConfirm"
      @close="handlePreviewClose"
    />
  </div>
</template>

<script>
import { addTable } from "@/api/system/table"
import { addPaper, getQuestionDetail } from "@/api/system/paper"
import latexRenderer from '@/utils/latexRenderer'
import { addLog } from "@/api/system/log.js"
import { searchProblems } from "@/api/system/problems"
import { listSeries } from "@/api/system/series"

// 导入组件
import DataSourceSelector from '@/components/PaperBuilder/DataSourceSelector.vue'
import QuestionList from '@/components/PaperBuilder/QuestionList.vue'
import QuestionAnalysisDialog from '@/components/PaperBuilder/QuestionAnalysisDialog.vue'
import PhotoSearch from '@/components/PaperBuilder/PhotoSearch.vue'
import ThirdPartySearch from '@/components/PaperBuilder/ThirdPartySearch.vue'
import questionSearchMixin from '@/components/PaperBuilder/questionSearchMixin.js'
import PreviewDialog from '@/components/PaperBuilder/PreviewDialog.vue'
import MaterialCardView from '@/components/PaperBuilder/MaterialCardView.vue'

export default {
  name: "LumingQuestionBank",
  mixins: [questionSearchMixin],
  components: {
    DataSourceSelector,
    QuestionList,
    QuestionAnalysisDialog,
    PhotoSearch,
    ThirdPartySearch,
    PreviewDialog,
    MaterialCardView
  },
  data() {
    return {
      // 创建模式：homework-作业，paper-组卷（在预览弹窗中选择）
      creationMode: 'homework', // 默认创建作业
      // 预览弹窗中的创建模式
      previewCreationMode: 'homework',
      // 预览弹窗中的任务名称
      previewCustomPaperName: '',
      // 科目选择（仅管理员使用，所有搜题模式共用）
      selectedSubject: '',
      form: {
        subject: null,
        customPaperName: null,
        questionIds: null,
        knowledgePointIds: null,
        knowledgeCode: [],
        questionUrl: []
      },
      // 解析弹窗
      analysisVisible: false,
      currentQuestion: null,
      questionDetail: null,
      loadingDetail: false,
      // 购物篮菜单
      showCartMenu: false,
      // 预览弹窗
      previewDialogVisible: false,
      // 菁优网搜题筛选数据
      thirdPartyFilterData: {
        difficulty: 0,
        questionType: '',
        selectedSources: ['全部'],
        selectedYears: ['全部'],
        selectedAdvancedOptions: ['all'],
        questionTypes: [],
        filteredSourceTypes: [],
        yearOptions: [],
        advancedOptions: [],
        canSearch: false,
        loading: false,
        currentPage: 1,
        total: 0
      },
      // 题目类型展开/收起状态
      questionTypeExpanded: false,
      // 来源类型展开/收起状态
      sourceTypeExpanded: false,
      // 筛选面板展开/收起状态
      filterPanelExpanded: true,
      // 数据源选项
      dataSourceOptions: [
        { label: '章节选择', value: 'chapter' },
        { label: '知识点选择', value: 'knowledge' },
        { label: '教辅材料', value: 'material' },
        { label: '拍照搜题', value: 'photo' },
        { label: '菁优网搜题', value: 'thirdParty' }
      ],
      // 保存初始加载的搜索条件，用于分页切换
      initialSearchConditions: null,
      // 教辅材料图形化视图显示状态
      showMaterialCardView: true,
      // 原始教辅材料数据（用于图形化展示）
      rawMaterialList: []
    }
  },
  created() {
    // mixin 中的方法
    this.getSubjectOptions()
    this.loadChapterList()
    this.loadKnowledgeList()
    this.loadTeacherInfo()
    this.loadMaterialSubjectOptions()

    // 等待科目加载后加载题型和初始题目（所有数据源）
    // 注意：初始进入不需要选择科目，只有用户选择科目后才加载题目
    // this.$nextTick(() => {
    //   // 延迟一下，确保科目已经加载
    //   setTimeout(() => {
    //     if ((this.isAdmin && this.selectedSubject) || (!this.isAdmin && this.teacherSubjectName)) {
    //       // 如果是教辅材料模式，加载图形化数据
    //       if (this.dataSourceType === 'material') {
    //         this.loadMaterialListForCardView()
    //       } else {
    //         // 如果是章节选择或知识点选择，加载题型
    //         if (this.dataSourceType === 'chapter' || this.dataSourceType === 'knowledge') {
    //           this.loadQuestionTypes()
    //         }
    //         // 初始加载题目（教辅材料不需要初始加载）
    //         this.loadInitialQuestions()
    //       }
    //     }
    //   }, 800)
    // })
  },
  watch: {
    // 监听科目变化，重新加载章节和知识点列表
    selectedSubject: {
      handler(newVal, oldVal) {
        // 当科目变化时，保存当前科目的题目列表并加载对应科目的题目列表
        if (newVal) {
          this.$store.commit('setCurrentSubject', newVal)
        }

        // 如果科目发生变化，清空当前选中的章节和知识点
        if (oldVal && oldVal !== newVal) {
          this.currentChapter = null
          this.currentKnowledge = null
          this.currentMaterial = null
          this.allQuestions = []
          this.filteredQuestions = []
          // 清空知识点列表和选项（切换科目时需要重新加载）
          this.knowledgeList = []
          this.knowledgeOptions = []
          this.originalKnowledgeOptions = []
          // 如果是教辅材料模式，返回到图形化视图
          if (this.dataSourceType === 'material') {
            this.showMaterialCardView = true
          }
        }

        if (newVal) {
          // 重新加载章节和知识点列表（按科目过滤）
          this.loadChapterList(newVal)
          // 重新加载知识点列表，传递科目参数以获取对应科目的知识点
          this.loadKnowledgeList(newVal)
          // 如果是教辅材料模式，加载图形化数据
          if (this.dataSourceType === 'material') {
            this.loadMaterialListForCardView()
          }
          // 如果有科目，立即加载题型（菁优网搜题由组件自己处理，不需要在这里调用）
          if (this.dataSourceType !== 'thirdParty') {
            this.loadQuestionTypes()
          }

          // 如果不是教辅材料、拍照搜题、菁优网搜题模式，且没有选择具体章节/知识点，则加载初始题目
          if (this.dataSourceType !== 'material' &&
              this.dataSourceType !== 'photo' &&
              this.dataSourceType !== 'thirdParty' &&
              !this.currentChapter &&
              !this.currentKnowledge) {
            // 延迟一下，确保题型和章节列表已加载
            this.$nextTick(() => {
              setTimeout(() => {
                this.loadInitialQuestions()
              }, 500)
            })
          }
        } else {
          // 科目清空时，清空知识点列表并加载全部数据
          this.knowledgeList = []
          this.knowledgeOptions = []
          this.originalKnowledgeOptions = []
          this.loadChapterList()
          this.loadKnowledgeList()
        }
      }
    },
    // 监听老师科目名称（不再自动设置，由用户手动选择）
    // teacherSubjectName: {
    //   handler(newVal) {
    //     if (!this.isAdmin && newVal) {
    //       // 老师用户，自动设置科目
    //       this.selectedSubject = newVal
    //       // 如果是教辅材料模式，也需要更新 selectedSubjectForMaterial
    //       if (this.dataSourceType === 'material') {
    //         this.selectedSubjectForMaterial = newVal
    //         // 只加载图形化数据（如果显示图形化视图）
    //         if (this.showMaterialCardView) {
    //           this.loadMaterialListForCardView()
    //         }
    //         // 注意：不调用 loadMaterialList()，避免重复调用 API
    //       }
    //       // 重新加载章节和知识点列表（按科目过滤）
    //       this.loadChapterList(newVal)
    //       this.loadKnowledgeList(newVal)
    //       // 如果有科目，立即加载题型（所有数据源类型都需要）
    //       this.loadQuestionTypes()
    //       // 初始加载时，如果没有选择具体条件，自动搜索题目（教辅材料除外）
    //       if (this.dataSourceType !== 'material') {
    //         this.loadInitialQuestions()
    //       }
    //     }
    //   },
    //   immediate: true
    // },
    // 监听数据源类型变化（需要选择科目后才加载题目）
    dataSourceType: {
      handler(newVal) {
        // 教辅材料不需要初始加载题目
        if (newVal === 'material') {
          return
        }
        // 只有选择了科目才加载题目
        if (this.selectedSubject) {
          // 延迟一下，确保相关数据已加载
          this.$nextTick(() => {
            setTimeout(() => {
              this.loadInitialQuestions()
            }, 500)
          })
        }
      }
    },
    // 监听科目列表变化，自动选择第一个科目
    subjectOptions: {
      handler(newVal) {
        // 如果科目列表有数据，且当前没有选择科目，自动选择第一个
        if (newVal && Array.isArray(newVal) && newVal.length > 0 && !this.selectedSubject) {
          // 使用 subjectName 作为值
          const firstSubject = newVal[0]
          if (firstSubject && firstSubject.subjectName) {
            this.$nextTick(() => {
              this.selectedSubject = firstSubject.subjectName
              // 设置当前科目，加载对应科目的题目列表
              this.$store.commit('setCurrentSubject', firstSubject.subjectName)
            })
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始加载题目（当没有选择具体条件时）
    async loadInitialQuestions() {
      // 拍照搜题、菁优网搜题和教辅材料不需要初始加载（需要用户主动操作）
      if (this.dataSourceType === 'photo' || this.dataSourceType === 'thirdParty' || this.dataSourceType === 'material') {
        return
      }

      // 章节选择：如果已经选择了章节，不执行初始搜索
      if (this.dataSourceType === 'chapter' && this.currentChapter) {
        return
      }

      // 知识点选择：如果已经选择了知识点，不执行初始搜索
      if (this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        return
      }

      // 如果已经有题目数据，不重复加载
      // 注意：科目切换时会先清空 allQuestions，所以这里不会阻止重新加载
      if (this.allQuestions && this.allQuestions.length > 0) {
        return
      }

      // 获取科目信息（只使用选择的科目）
      const subjectName = this.selectedSubject || ''

      // 如果没有选择科目，不执行搜索
      if (!subjectName) {
        return
      }

      try {
        // 构建搜索参数
        const searchParams = {
          conditions: {
            keywords: '',
            subject_names: [subjectName],
            is_chapter_exercise: false,
            cates: [],
            min_degree: null,
            max_degree: null,
            path: ""
          },
          pagination: {
            page: this.pagination.pageNum || 1,
            per_page: this.pagination.pageSize || 10
          }
        }

        // 保存搜索条件，用于分页切换
        this.initialSearchConditions = {
          conditions: { ...searchParams.conditions },
          subjectName: subjectName
        }

        // 调用搜索API
        const response = await searchProblems(searchParams)

        // 处理响应数据
        if (response && response.questions) {
          // 直接返回题目数据的格式
          this.allQuestions = response.questions || []
          this.filteredQuestions = [...this.allQuestions]
          this.pagination.total = response.statistics?.total_questions || 0
          this.pagination.pageNum = searchParams.pagination.page
          this.pagination.pageSize = searchParams.pagination.per_page

          // 加载收藏状态
          this.$nextTick(() => {
            this.loadFavoriteStatus()
          })
        } else if (response && response.code === 200 && response.data) {
          // 兼容其他响应格式
          if (Array.isArray(response.data)) {
            this.allQuestions = response.data
            this.filteredQuestions = [...this.allQuestions]
          } else if (response.data.questions) {
            this.allQuestions = response.data.questions || []
            this.filteredQuestions = [...this.allQuestions]
            this.pagination.total = response.data.statistics?.total_questions || 0
            this.pagination.pageNum = searchParams.pagination.page
            this.pagination.pageSize = searchParams.pagination.per_page

            // 加载收藏状态
            this.$nextTick(() => {
              this.loadFavoriteStatus()
            })
          }
        }
      } catch (error) {
        console.error('初始加载题目失败:', error)
      }
    },
    // 重写章节点击处理，清除初始搜索条件
    handleChapterClick(data, node) {
      // 清除初始搜索条件
      this.initialSearchConditions = null
      // 执行 mixin 中的逻辑
      this.currentChapter = data
      // 重置分页到第一页
      this.pagination.pageNum = 1
      this.loadQuestionsByChapter(data, 1, this.pagination.pageSize)
      this.loadQuestionTypes()
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },

    // 重写知识点点击处理，清除初始搜索条件
    handleKnowledgeClick(data, node) {
      // 清除初始搜索条件
      this.initialSearchConditions = null
      // 执行 mixin 中的逻辑
      this.currentKnowledge = data

      if (!data.children || data.children.length === 0) {
        // 重置分页到第一页
        this.pagination.pageNum = 1
        this.loadQuestionsByKnowledge(data, 1, this.pagination.pageSize)
        this.loadQuestionTypes()
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      } else {
        this.allQuestions = []
        this.filteredQuestions = []
        this.pagination.total = 0
        this.$message.info('请选择具体的知识点节点查看题目')
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      }
    },

    // 重写教辅材料点击处理，清除初始搜索条件
    handleMaterialClick(data, node) {
      // 清除初始搜索条件
      this.initialSearchConditions = null
      // 执行 mixin 中的逻辑
      this.currentMaterial = data
      // 切换到列表视图
      this.showMaterialCardView = false
      // 重置分页到第一页
      this.pagination.pageNum = 1
      this.loadQuestionsByMaterial(data, 1, this.pagination.pageSize)
      this.loadQuestionTypes()
      this.$nextTick(() => {
        this.resetQuestionListScroll()
        // 设置树形结构选中当前节点
        if (data && data.id) {
          this.setMaterialTreeCurrentNode(data.id, data.parentId)
        }
      })
    },

    // 处理图形化卡片点击
    handleMaterialCardClick(material) {
      // 将原始材料数据转换为树节点格式
      const materialNode = {
        id: material.id,
        label: material.series || material.subjectName || `教辅材料${material.id}`,
        series: material.series,
        subjectName: material.subjectName,
        type: material.type,
        contents: material.contents,
        year: material.year,
        grade: material.grade,
        children: []
      }

      // 如果有 contents，解析为 children
      if (material.contents) {
        try {
          let contents = material.contents
          if (typeof contents === 'string') {
            contents = JSON.parse(contents)
          }
          if (Array.isArray(contents)) {
            materialNode.children = this.parseContentsToTree(contents, material.id)
          } else if (contents && typeof contents === 'object') {
            materialNode.children = this.parseContentsToTree([contents], material.id)
          }
        } catch (e) {
          console.error('解析教辅材料contents失败:', e)
        }
      }

      // 只显示当前选中的教辅材料的节点树
      // 将 materialOptions 设置为只包含当前选中的教辅材料
      this.materialOptions = [materialNode]
      this.originalMaterialOptions = [materialNode]

      // 切换到列表视图
      this.showMaterialCardView = false

      // 如果有子节点，自动加载第一个子节点；否则加载父节点
      if (materialNode.children && materialNode.children.length > 0) {
        // 直接使用第一个子节点
        const firstChild = materialNode.children[0]
        // 设置父节点ID，用于构建路径
        firstChild.parentId = materialNode.id
        // 加载第一个子节点
        this.currentMaterial = firstChild
        this.initialSearchConditions = null
        this.pagination.pageNum = 1
        this.loadQuestionsByMaterial(firstChild, 1, this.pagination.pageSize)
        this.loadQuestionTypes()

        // 等待DOM更新后，设置树形结构的高亮和展开
        this.$nextTick(() => {
          this.resetQuestionListScroll()
          // 设置树形结构选中第一个子节点
          this.setMaterialTreeCurrentNode(firstChild.id, materialNode.id)
        })
      } else {
        // 没有子节点，直接加载父节点
        this.handleMaterialClick(materialNode, null)
        // 设置树形结构选中父节点
        this.$nextTick(() => {
          this.setMaterialTreeCurrentNode(materialNode.id)
        })
      }
    },

    // 处理返回图形化视图
    handleBackToCardView() {
      // 返回到图形化视图
      this.showMaterialCardView = true
      // 清空当前选中的教辅材料
      this.currentMaterial = null
      // 清空题目列表
      this.allQuestions = []
      this.filteredQuestions = []
      this.pagination = {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
      // 清空 materialOptions，恢复显示所有教辅材料（重新加载图形化数据）
      this.materialOptions = []
      this.originalMaterialOptions = []
      // 重新加载图形化数据（无论是否选择科目都加载，未选择科目时显示所有教辅材料）
      this.loadMaterialListForCardView()
    },

    // 设置教辅材料树形结构的当前选中节点
    setMaterialTreeCurrentNode(nodeId, parentId = null) {
      // 延迟一下，确保树形结构已经渲染完成
      setTimeout(() => {
        if (this.$refs.dataSourceSelectorRef && this.$refs.dataSourceSelectorRef.$refs.materialTree) {
          const tree = this.$refs.dataSourceSelectorRef.$refs.materialTree
          try {
            // 如果有父节点，先展开父节点
            if (parentId && tree.store && tree.store.nodesMap && tree.store.nodesMap[parentId]) {
              const parentNode = tree.store.nodesMap[parentId]
              if (parentNode && !parentNode.expanded) {
                parentNode.expand(null, true)
              }
            }
            // 设置当前选中的节点
            if (nodeId) {
              tree.setCurrentKey(nodeId)
            }
          } catch (e) {
            console.warn('设置树形结构选中节点失败:', e)
          }
        }
      }, 100)
    },

    // 为图形化视图加载教辅材料数据
    async loadMaterialListForCardView() {
      this.loadingMaterials = true

      const queryParams = {}

      // 如果选择了科目，传递科目参数；如果没有选择科目，不传递参数，显示所有教辅材料
      if (this.selectedSubject) {
        queryParams.subjectName = this.selectedSubject
      }
      // 如果没有选择科目，不传递 subjectName 参数，后端会返回所有教辅材料

      try {
        const res = await listSeries(queryParams)
        if (res.code === 200 && res.rows) {
          // 保存原始数据用于图形化展示
          this.rawMaterialList = res.rows.map(material => ({
            id: material.id,
            series: material.series,
            subjectName: material.subjectName,
            type: material.type,
            year: material.year,
            grade: material.grade,
            contents: material.contents,
            label: material.series || material.subjectName || `教辅材料${material.id}`
          }))
        } else {
          console.error('获取教辅材料列表失败:', res)
          this.rawMaterialList = []
        }
      } catch (error) {
        console.error('获取教辅材料列表失败:', error)
        this.rawMaterialList = []
      } finally {
        this.loadingMaterials = false
      }
    },

    // 处理知识点列表项点击
    handleKnowledgeListItemClick(label) {
      // 通过 label 查找对应的树节点
      const node = this.findKnowledgeNodeByLabel(label)
      if (node) {
        // 触发知识点点击事件，复用现有的处理逻辑
        this.handleKnowledgeClick(node, null)
      } else {
        this.$message.warning(`未找到知识点 "${label}" 对应的节点`)
      }
    },

    // 处理知识点搜索输入
    handleKnowledgeSearchInput(keyword) {
      this.knowledgeSearchKeyword = keyword
    },

    // 数据源切换处理（重写 mixin 中的方法，避免重复调用）
    handleDataSourceChange(type) {
      // 清除初始搜索条件（切换数据源时）
      this.initialSearchConditions = null

      // 切换到教辅材料时，显示图形化视图并预加载数据
      if (type === 'material') {
        // 手动设置数据源类型，避免调用 mixin 中的 switchDataSource（它会调用 loadMaterialList）
        this.dataSourceType = type
        this.currentChapter = null
        this.currentKnowledge = null
        this.currentMaterial = null
        this.allQuestions = []
        this.filteredQuestions = []
        this.pagination = {
          pageNum: 1,
          pageSize: 10,
          total: 0
        }
        this.showMaterialCardView = true
        // 加载题型（统一使用 selectedSubject）
        if (this.selectedSubject) {
          this.loadQuestionTypes()
        }
        // 预加载教辅材料数据（只调用一次）
        this.loadMaterialListForCardView()
      } else {
        // 切换到其他数据源时，使用 mixin 中的方法
        this.switchDataSource(type)
        // 隐藏图形化视图
        this.showMaterialCardView = false
        // 切换数据源后，如果有题目数据，加载收藏状态
        this.$nextTick(() => {
          if (this.filteredQuestions && this.filteredQuestions.length > 0) {
            this.loadFavoriteStatus()
          }
        })
      }

      // 切换到菁优网搜题时，初始化筛选数据
      if (type === 'thirdParty') {
        this.$nextTick(() => {
          // 等待组件完全挂载后再获取数据
          setTimeout(() => {
            if (this.$refs.thirdPartySearchRef) {
              const filterData = this.$refs.thirdPartySearchRef.getFilterData()
              if (filterData) {
                this.thirdPartyFilterData = {
                  ...this.thirdPartyFilterData,
                  ...filterData,
                  questionTypes: filterData.questionTypes || [],
                  filteredSourceTypes: filterData.filteredSourceTypes || [],
                  yearOptions: filterData.yearOptions || this.thirdPartyFilterData.yearOptions,
                  advancedOptions: filterData.advancedOptions || this.thirdPartyFilterData.advancedOptions
                }
              }
            }
          }, 100)
        })
      }
    },

    // 科目变化处理（所有搜题模式共用）
    handleSubjectChange(subject) {
      this.selectedSubject = subject

      // 切换科目时，保存当前科目的题目列表并加载对应科目的题目列表
      this.$store.commit('setCurrentSubject', subject)

      // 清空当前选中的章节、知识点、教辅材料
      this.currentChapter = null
      this.currentKnowledge = null
      this.currentMaterial = null

      // 清空题目列表和分页
      this.allQuestions = []
      this.filteredQuestions = []
      this.pagination = {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
      this.initialSearchConditions = null

      // 根据不同的数据源类型，更新对应的科目字段
      if (this.dataSourceType === 'material') {
        // 教辅材料：更新 selectedSubjectForMaterial
        this.selectedSubjectForMaterial = subject
        // 切换科目时，返回到图形化视图
        this.showMaterialCardView = true
        // 触发教辅材料列表重新加载（无论是否选择科目都加载，未选择科目时显示所有教辅材料）
        this.loadMaterialListForCardView()
      }

      // 所有数据源类型在科目变化时都需要重新加载题型
      this.loadQuestionTypes()

      // 如果科目已选择，重新加载初始题目（教辅材料除外）
      if (subject && this.dataSourceType !== 'material') {
        this.$nextTick(() => {
          // 延迟一下，确保题型已加载
          setTimeout(() => {
            this.loadInitialQuestions()
          }, 300)
        })
      }

      // 拍照搜题和菁优网搜题的科目会通过 props 传递，组件内部会处理
    },

    // 处理拍照搜题成功
    handlePhotoSearchSuccess(questions) {
      this.allQuestions = questions || []
      this.filteredQuestions = [...this.allQuestions]
      // 拍照搜题不需要分页，重置分页信息
      this.pagination = {
        pageNum: 1,
        pageSize: 10,
        total: this.allQuestions.length
      }
      this.filterQuestions()
      // 记录日志
      if (this.filteredQuestions.length > 0) {
        const ids = this.filteredQuestions.map(item => item.sid).join(',')
        addLog({
          calledTableName: this.getLogTableName(),
          calledTableId: ids,
          isRead: 1,
          isClickRead: 0,
          isUsed: 0
        })
      }
      // 加载收藏状态
      this.$nextTick(() => {
        this.loadFavoriteStatus()
        this.resetQuestionListScroll()
      })
    },

    // 处理拍照搜题错误
    handlePhotoSearchError(error) {
      this.allQuestions = []
      this.filteredQuestions = []
    },

    // 处理菁优网搜题成功
    handleThirdPartySearchSuccess(questions, total) {
      this.allQuestions = questions || []
      this.filteredQuestions = [...this.allQuestions]
      // 菁优网搜题通过上一页/下一页调整page参数，不需要显示分页组件
      // 但需要保存总数和当前页以便后续使用
      this.pagination = {
        pageNum: 1,
        pageSize: 20,
        total: total || this.allQuestions.length
      }
      // 更新thirdPartyFilterData中的当前页和总数
      if (this.$refs.thirdPartySearchRef) {
        const currentPage = this.$refs.thirdPartySearchRef.getCurrentPage()
        this.thirdPartyFilterData.currentPage = currentPage || 1
        this.thirdPartyFilterData.total = total || this.allQuestions.length
      }
      this.filterQuestions()
      // 记录日志
      if (this.filteredQuestions.length > 0) {
        const ids = this.filteredQuestions.map(item => item.sid).join(',')
        addLog({
          calledTableName: this.getLogTableName(),
          calledTableId: ids,
          isRead: 1,
          isClickRead: 0,
          isUsed: 0
        })
      }
      // 加载收藏状态
      this.$nextTick(() => {
        this.loadFavoriteStatus()
        this.resetQuestionListScroll()
      })
    },

    // 处理菁优网搜题错误
    handleThirdPartySearchError(error) {
      this.allQuestions = []
      this.filteredQuestions = []
    },

    // 处理菁优网搜题筛选条件变化
    handleThirdPartyFilterChange(filterData) {
      this.thirdPartyFilterData = {
        ...this.thirdPartyFilterData,
        ...filterData,
        questionTypes: filterData.questionTypes || this.thirdPartyFilterData.questionTypes || [],
        filteredSourceTypes: filterData.filteredSourceTypes || this.thirdPartyFilterData.filteredSourceTypes || [],
        yearOptions: filterData.yearOptions || this.thirdPartyFilterData.yearOptions,
        advancedOptions: filterData.advancedOptions || this.thirdPartyFilterData.advancedOptions
      }
    },

    // 处理难度等级切换（单选）
    handleThirdPartyDifficultyToggle(difficulty) {
      this.thirdPartyFilterData.difficulty = difficulty
      if (this.$refs.thirdPartySearchRef) {
        this.$refs.thirdPartySearchRef.setFilterData({ difficulty })
      }
    },

    // 处理题目类型切换（单选）
    handleThirdPartyQuestionTypeToggle(questionType) {
      this.thirdPartyFilterData.questionType = questionType
      if (this.$refs.thirdPartySearchRef) {
        this.$refs.thirdPartySearchRef.setFilterData({ questionType })
      }
    },

    // 切换题目类型展开/收起
    toggleQuestionTypeExpand() {
      this.questionTypeExpanded = !this.questionTypeExpanded
    },

    // 切换来源类型展开/收起
    toggleSourceTypeExpand() {
      this.sourceTypeExpanded = !this.sourceTypeExpanded
    },

    // 切换筛选面板展开/收起
    toggleFilterPanel() {
      this.filterPanelExpanded = !this.filterPanelExpanded
    },

    // 处理来源类型切换
    handleThirdPartySourceToggle(sourceValue) {
      if (this.$refs.thirdPartySearchRef) {
        this.$refs.thirdPartySearchRef.toggleSource(sourceValue)
      }
    },

    // 处理年份切换
    handleThirdPartyYearToggle(yearValue) {
      if (this.$refs.thirdPartySearchRef) {
        this.$refs.thirdPartySearchRef.toggleYear(yearValue)
      }
    },

    // 处理高级选项切换
    handleThirdPartyAdvancedToggle(optionValue) {
      if (this.$refs.thirdPartySearchRef) {
        this.$refs.thirdPartySearchRef.toggleAdvancedOption(optionValue)
      }
    },

    // 触发菁优网搜题搜索
    handleThirdPartySearch() {
      if (this.$refs.thirdPartySearchRef) {
        this.$refs.thirdPartySearchRef.triggerSearch()
      }
    },

    // 添加到选择列表
    addToSelection(question) {
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        this.$message.warning('题目ID不存在')
        return
      }

      if (!this.isQuestionSelected(questionId)) {
        // 添加到 store
        this.$store.commit('addSelectedQuestion', question)
        this.$message.success('题目已添加到已选列表')
        // 记录日志
        addLog({
          calledTableName: this.getLogTableName(),
          calledTableId: questionId,
          isRead: 0,
          isClickRead: 0,
          isUsed: 1
        })
      } else {
        this.$message.warning('该题目已在已选列表中')
      }
    },

    // 从选择列表移除
    removeFromSelection(sid) {
      if (!sid) return

      this.$store.commit('removeSelectedQuestion', sid)
      this.$message.success('题目已从已选列表移除')
    },

    // 检查题目是否已选择
    isQuestionSelected(sid) {
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      return selectedQuestions.some(q => {
        const qSid = q.sid || q.SID || q.questionSid
        return qSid === sid || String(qSid) === String(sid)
      })
    },

    // 显示解析
    showAnalysis(question) {
      this.currentQuestion = question
      this.analysisVisible = true
      this.loadingDetail = true
      this.questionDetail = null
      // 记录日志
      addLog({
        calledTableName: this.getLogTableName(),
        calledTableId: question.sid,
        isRead: 0,
        isClickRead: 1,
        isUsed: 0
      })

      // 优先使用选择的科目作为 subject_name
      let subjectName = this.selectedSubject || ''

      // 如果没有选择科目，尝试使用教师科目
      if (!subjectName && !this.isAdmin && this.teacherSubjectName) {
        subjectName = this.teacherSubjectName
      }

      // 如果还是没有科目，则从章节路径中提取（作为备选）
      if (!subjectName) {
        subjectName = this.getSubjectFromChapter(question)
      }

      // 构建请求数据
      const requestData = {
        subject_name: subjectName,
        sids: [question.sid]
      }

      // 调用API获取题目详情
      getQuestionDetail(requestData).then(res => {
        // 检查响应数据格式
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
        this.loadingDetail = false
      })
    },

    // 关闭解析弹窗
    closeAnalysis() {
      this.analysisVisible = false
      this.currentQuestion = null
      this.questionDetail = null
    },

    // 生成作业或组卷
    generateContent(form) {
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      if (selectedQuestions.length === 0) {
        this.$message.warning('请先选择题目')
        return
      }

      // 构建提交数据
      const submitData = {
        subject: form.subject,
        customPaperName: form.customPaperName,
        questionIds: selectedQuestions.map(q => q.sid || q.SID || q.questionSid).join(','),
        knowledgePointIds: this.currentChapter ? this.buildChapterPath(this.currentChapter) : ''
      }

      if (this.creationMode === 'homework') {
        // 创建作业
        addTable(submitData).then(() => {
          this.$modal.msgSuccess('作业创建成功')
          // 清空已选题目
          this.$store.commit('clearSelectedQuestions')
          this.goBack()
        }).catch(error => {
          this.$message.error('作业创建失败：' + error.message)
        })
      } else {
        // 创建组卷
        addPaper(submitData).then(() => {
          this.$modal.msgSuccess('组卷创建成功')
          // 清空已选题目
          this.$store.commit('clearSelectedQuestions')
          this.goBack()
        }).catch(error => {
          this.$message.error('组卷创建失败：' + error.message)
        })
      }
    },

    // 处理题目内容
    processQuestionContent(content) {
      if (!content) return ''

      // 使用latexRenderer组件处理题目内容
      let processedContent = latexRenderer.processQuestionContent(content)

      // 处理可编辑答案输入区域
      return processedContent
        .replace(
          /<!--BA--><div (?:class="quizPutTag"|class="\\quizPutTag\\") contenteditable="true">\s*(&nbsp;)?<\/div><!--EA-->/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        )
        .replace(
          /<div class='quizPutTag' contenteditable='true'>&nbsp;<\/div>/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        )
    },

    // 返回上一页
    goBack() {
      // 先添加一个标记，表示需要刷新列表
      this.$store.commit('setNeedRefresh', true)
      // 根据创建类型跳转到对应的标签页
      const type = this.creationMode === 'homework' ? 'homework' : 'paper'
      // 跳转到我的题库页面，并传递类型参数
      this.$router.push({
        path: '/system/myQuestionBank/index',
        query: { type: type }
      })
    },

    // 重置题目列表滚动条
    resetQuestionListScroll() {
      if (this.$refs.questionListRef) {
        this.$refs.questionListRef.resetScroll()
      }
    },

    // 获取日志表名（mixin 需要）
    getLogTableName() {
      return this.creationMode === 'homework' ? '作业' : '组卷'
    },

    // 获取题目类型
    getQuestionType(question) {
      return question.cate || question.catename || question.CateName || question.qtype || '未知题型'
    },

    // 获取题目难度
    getQuestionDifficulty(question) {
      const difficulty = question.difficulty || question.degree || question.Degree
      if (typeof difficulty === 'string' && ['简单', '较易', '中等', '较难', '困难', 'easy', 'easier', 'medium', 'harder', 'hard'].includes(difficulty)) {
        return difficulty
      }
      const diff = parseFloat(difficulty)
      if (!isNaN(diff)) {
        if (diff > 0 && diff <= 0.2) return '困难'
        if (diff > 0.2 && diff <= 0.4) return '较难'
        if (diff > 0.4 && diff <= 0.6) return '中等'
        if (diff > 0.6 && diff <= 0.8) return '较易'
        if (diff > 0.8 && diff <= 1) return '简单'
      }
      return '未知'
    },

    // 解析选项
    parseOptions(options) {
      if (!options) return []
      if (Array.isArray(options)) return options
      if (typeof options === 'string') {
        try {
          const parsed = JSON.parse(options)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return options.split(',').filter(opt => opt.trim())
        }
      }
      return []
    },

    // 移除选项前缀
    removeOptionPrefix(option, index) {
      if (!option) return ''
      const prefix = String.fromCharCode(65 + index) + '.'
      if (option.trim().startsWith(prefix)) {
        return option.trim().substring(prefix.length).trim()
      }
      return option
    },

    // 按题型删除题目
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

    // 清空所有题目
    clearAllQuestions() {
      this.$store.commit('clearSelectedQuestions')
      this.showCartMenu = false
    },

    // 显示预览弹窗
    showPreviewDialog() {
      const selectedQuestions = this.$store.getters.selectedQuestions || []
      if (!selectedQuestions || !Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
        this.$message.warning('请先选择题目')
        return
      }
      // 初始化预览弹窗的数据
      this.previewCreationMode = this.creationMode || 'homework'
      this.previewCustomPaperName = this.form.customPaperName || ''
      this.previewDialogVisible = true
      this.showCartMenu = false
    },

    // 关闭预览弹窗
    handlePreviewClose() {
      this.previewDialogVisible = false
    },

    // 确认创建
    handlePreviewConfirm(data) {
      // 更新创建模式和任务名称
      this.creationMode = data.creationMode
      this.form.customPaperName = data.customPaperName

      // 更新题目顺序（如果拖拽了）
      if (data.questions && Array.isArray(data.questions)) {
        this.$store.commit('setSelectedQuestions', data.questions)
      }

      // 设置科目
      if (this.isAdmin && this.selectedSubject) {
        this.form.subject = this.selectedSubject
      } else if (!this.isAdmin && this.teacherSubjectName) {
        this.form.subject = this.teacherSubjectName
      }

      // 关闭预览弹窗
      this.previewDialogVisible = false

      // 生成作业或组卷
      this.generateContent(this.form)
    },

    // 处理购物篮鼠标进入
    handleCartMouseEnter() {
      // 清除延迟隐藏的定时器
      if (this.cartMenuTimer) {
        clearTimeout(this.cartMenuTimer)
        this.cartMenuTimer = null
      }
      this.showCartMenu = true
    },

    // 处理购物篮鼠标离开
    handleCartMouseLeave() {
      // 延迟隐藏，给鼠标移动到菜单的时间
      this.cartMenuTimer = setTimeout(() => {
        this.showCartMenu = false
        this.cartMenuTimer = null
      }, 200) // 200ms 延迟
    },

    // 处理菁优网搜题上一页
    handleThirdPartyPrevPage() {
      if (this.$refs.thirdPartySearchRef) {
        const currentPage = this.thirdPartyFilterData.currentPage || 1
        if (currentPage > 1) {
          const newPage = currentPage - 1
          this.$refs.thirdPartySearchRef.setPage(newPage)
          this.$refs.thirdPartySearchRef.triggerSearch()
        }
      }
    },

    // 处理菁优网搜题下一页
    handleThirdPartyNextPage() {
      if (this.$refs.thirdPartySearchRef) {
        const currentPage = this.thirdPartyFilterData.currentPage || 1
        const newPage = currentPage + 1
        this.$refs.thirdPartySearchRef.setPage(newPage)
        this.$refs.thirdPartySearchRef.triggerSearch()
      }
    },

    // 重写分页切换方法，添加对初始化加载的处理
    handlePaginationChange(pageData) {
      if (!pageData || typeof pageData !== 'object') {
        return
      }

      const pageNum = pageData.page || pageData.pageNum || 1
      const pageSize = pageData.limit || pageData.pageSize || 10

      // 更新分页信息
      this.pagination.pageNum = pageNum
      this.pagination.pageSize = pageSize

      // 根据当前数据源类型重新加载数据
      if (this.dataSourceType === 'chapter' && this.currentChapter) {
        // 章节选择：使用 mixin 中的方法
        this.loadQuestionsByChapter(this.currentChapter, pageNum, pageSize)
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      } else if (this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        // 知识点选择：使用 mixin 中的方法
        this.loadQuestionsByKnowledge(this.currentKnowledge, pageNum, pageSize)
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      } else if (this.dataSourceType === 'material' && this.currentMaterial) {
        // 教辅材料：使用 mixin 中的方法
        this.loadQuestionsByMaterial(this.currentMaterial, pageNum, pageSize)
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      } else if (this.initialSearchConditions) {
        // 初始化加载情况：使用保存的搜索条件重新调用 API
        this.loadInitialQuestionsWithPagination(pageNum, pageSize)
      }
    },

    // 使用分页参数加载初始题目
    async loadInitialQuestionsWithPagination(pageNum, pageSize) {
      if (!this.initialSearchConditions) {
        return
      }

      // 获取科目信息（只使用选择的科目）
      const subjectName = this.selectedSubject || this.initialSearchConditions?.subjectName || ''

      if (!subjectName) {
        return
      }

      try {
        // 构建搜索参数，使用保存的条件和新的分页参数
        const searchParams = {
          conditions: { ...this.initialSearchConditions.conditions },
          pagination: {
            page: pageNum,
            per_page: pageSize
          }
        }

        // 确保科目信息是最新的
        searchParams.conditions.subject_names = [subjectName]

        // 调用搜索API
        const response = await searchProblems(searchParams)

        // 处理响应数据
        if (response && response.questions) {
          this.allQuestions = response.questions || []
          this.filteredQuestions = [...this.allQuestions]
          this.pagination.total = response.statistics?.total_questions || 0
          this.pagination.pageNum = pageNum
          this.pagination.pageSize = pageSize
        } else if (response && response.code === 200 && response.data) {
          if (Array.isArray(response.data)) {
            this.allQuestions = response.data
            this.filteredQuestions = [...this.allQuestions]
          } else if (response.data.questions) {
            this.allQuestions = response.data.questions || []
            this.filteredQuestions = [...this.allQuestions]
            this.pagination.total = response.data.statistics?.total_questions || 0
            this.pagination.pageNum = pageNum
            this.pagination.pageSize = pageSize
          }
        }

        // 加载收藏状态
        this.$nextTick(() => {
          this.loadFavoriteStatus()
          this.resetQuestionListScroll()
        })
      } catch (error) {
        console.error('分页加载题目失败:', error)
        this.$message.error('加载题目失败：' + (error.message || '网络错误'))
      }
    },

    // 加载收藏状态（调用 QuestionList 组件的方法）
    loadFavoriteStatus() {
      if (this.$refs.questionListRef && this.filteredQuestions && this.filteredQuestions.length > 0) {
        this.$refs.questionListRef.loadFavoriteStatus()
      }
    }
  },
  computed: {
    // 从 store 获取已选题目列表（使用 getter 确保响应式）
    selectedQuestions() {
      return this.$store.getters.selectedQuestions || []
    },
    // 显示的题目类型（根据展开状态决定显示前10个还是全部）
    displayedQuestionTypes() {
      if (!this.thirdPartyFilterData.questionTypes || this.thirdPartyFilterData.questionTypes.length === 0) {
        return []
      }
      if (this.thirdPartyFilterData.questionTypes.length <= 10) {
        return this.thirdPartyFilterData.questionTypes
      }
      return this.questionTypeExpanded
        ? this.thirdPartyFilterData.questionTypes
        : this.thirdPartyFilterData.questionTypes.slice(0, 10)
    },
    // 显示的来源类型（根据展开状态决定显示前10个还是全部）
    displayedSourceTypes() {
      if (!this.thirdPartyFilterData.filteredSourceTypes || this.thirdPartyFilterData.filteredSourceTypes.length === 0) {
        return []
      }
      if (this.thirdPartyFilterData.filteredSourceTypes.length <= 10) {
        return this.thirdPartyFilterData.filteredSourceTypes
      }
      return this.sourceTypeExpanded
        ? this.thirdPartyFilterData.filteredSourceTypes
        : this.thirdPartyFilterData.filteredSourceTypes.slice(0, 10)
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
    },
    // 判断是否应该显示分页（拍照搜题和菁优网搜题不需要分页）
    shouldShowPagination() {
      return this.dataSourceType === 'chapter' ||
             this.dataSourceType === 'knowledge' ||
             this.dataSourceType === 'material'
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

<style scoped>
.app-container {
  padding: 0 20px;
}

.top-controls {
  min-width: 1420px;
  margin-top: 20px;
  margin-bottom: 10px;
  /* padding: 20px; */
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mode-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.data-source-subject-row {
  justify-content: space-between;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.data-source-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.data-source-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7fa;
  padding: 4px;
  border-radius: 8px;
}

.data-source-tab {
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
  position: relative;
}

.data-source-tab:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.data-source-tab.active {
  color: #409eff;
  background: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  font-weight: 600;
}

.data-source-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: #409eff;
  border-radius: 2px 2px 0 0;
}

.subject-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

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
  /* 确保菜单可以接收鼠标事件 */
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


.control-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.teacher-subject-display-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-hint-top {
  font-size: 12px;
  color: #909399;
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

.question-bank-builder {
  display: flex;
  height: calc(100vh - 200px);
  gap: 20px;
}

.material-card-view-wrapper {
  flex: 1;
  min-width: 1050px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.center-panel-wrapper {
  flex: 1;
  min-width: 1050px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.third-party-filter-panel {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.filter-panel-header {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;
}

.filter-panel-header:hover {
  background: #e8ebef;
}

.filter-panel-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.filter-panel-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-loading-animation {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  font-size: 13px;
}

.search-loading-animation .el-icon-loading {
  font-size: 14px;
  animation: rotating 2s linear infinite;
}

.search-loading-text {
  color: #409eff;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.filter-panel-toggle-icon {
  font-size: 14px;
  color: #909399;
  transition: transform 0.3s;
}

.filter-panel-content {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-list-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.no-subject-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.no-subject-hint-material {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.question-list-wrapper.searching {
  pointer-events: none;
}

.search-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 4px;
}

.search-loading-animation-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #409eff;
}

.search-loading-animation-large .el-icon-loading {
  font-size: 48px;
  animation: rotating 2s linear infinite;
}

.search-loading-text-large {
  color: #409eff;
  font-size: 16px;
  font-weight: 500;
}

.filter-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  padding-top: 5px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.filter-tag {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  user-select: none;
}

.filter-tag:hover {
  border-color: #409eff;
  color: #409eff;
}

.filter-tag.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.filter-tag-more {
  padding: 6px 12px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #fff;
  color: #409eff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.filter-tag-more:hover {
  background: #ecf5ff;
  border-color: #66b1ff;
  color: #66b1ff;
}

.filter-tag-more i {
  font-size: 12px;
}

/* 数学公式错误样式 */
.math-error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  display: inline-block;
  margin: 0 2px;
}

/* KaTeX 数学公式样式优化 */
.katex {
  font-size: 1.1em;
}

.katex-display {
  margin: 1em 0;
  text-align: center;
}

/* 确保数学公式在选项中的正确显示 */
.option-content .katex,
.question-content .katex,
.analysis-content .katex,
.analyse-content .katex,
.discuss-content .katex {
  font-size: 1em;
  line-height: 1.2;
}
</style>

