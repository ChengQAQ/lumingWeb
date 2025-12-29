<template>
  <div class="center-panel" ref="questionListPanel">
    <div class="panel-header">
      <h3>题目列表</h3>
      <div class="search-box">
        <template v-if="!shouldHideFilters">
          <span class="filter-label">题型：</span>
          <el-select 
            v-model="questionType" 
            placeholder="全部题型" 
            @change="filterQuestions"
            style="width: 120px; margin-right: 10px;"
          >
            <el-option label="全部" value=""></el-option>
            <el-option 
              v-for="type in questionTypes" 
              :key="type.name" 
              :label="type.name" 
              :value="type.name"
            />
          </el-select>
          <span class="filter-label">难度：</span>
          <el-select 
            v-model="difficultyLevel" 
            placeholder="全部难度" 
            @change="filterQuestions"
            style="width: 100px; margin-right: 10px;"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="困难" value="hard"></el-option>
            <el-option label="较难" value="harder"></el-option>
            <el-option label="中等" value="medium"></el-option>
            <el-option label="较易" value="easier"></el-option>
            <el-option label="简单" value="easy"></el-option>
          </el-select>
        </template>
        <el-input
          v-model="questionSearch"
          placeholder="搜索题目..."
          prefix-icon="el-icon-search"
          clearable
          @input="handleSearchInput"
          @clear="handleSearchInput"
          style="flex: 1;"
        />
      </div>
    </div>
    <div class="question-list">
      <div
        v-for="(question, index) in filteredQuestions"
        :key="question.sid || question.SID || question.questionSid || index"
        class="question-card"
      >
        <div class="question-header">
          <div class="question-header-left">
            <span class="question-type">{{ getQuestionType(question) }}</span>
            <span class="question-difficulty">难度: {{ getQuestionDifficulty(question) }}</span>
          </div>
          <div class="question-actions">
            <el-button
              type="text"
              size="small"
              @click="showAnalysis(question)"
              class="view-detail-btn"
            >
              查看解析
            </el-button>
            <el-button
              v-if="showEditButton"
              type="text"
              size="small"
              @click="editQuestion(question)"
              class="edit-btn"
            >
              修改
            </el-button>
            <el-button
              type="text"
              size="small"
              :class="{ 'is-favorite': question.isFavorite }"
              @click="toggleFavorite(question)"
              class="favorite-btn"
            >
              <i :class="question.isFavorite ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
              {{ question.isFavorite ? '已收藏' : '收藏' }}
            </el-button>
            <el-button
              v-if="!isQuestionSelected(question.sid)"
              type="text"
              size="small"
              @click="addToPaper(question)"
              class="add-to-paper-btn"
            >
              添加题目
            </el-button>
            <el-button
              v-else
              type="text"
              size="small"
              @click="removeFromPaper(question)"
              class="remove-from-paper-btn"
            >
              移除题目
            </el-button>
          </div>
        </div>
        <div class="question-content">
          <div class="question-text">
            <span v-if="question.label" class="question-label">{{ question.label }}</span>
            <span v-html="processQuestionContent(question.question)"></span>
          </div>
          <div class="question-options" v-if="question.options">
            <div
              v-for="(option, index) in parseOptions(question.options)"
              :key="index"
              class="option-item"
            >
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <span class="option-content" v-html="processQuestionContent(removeOptionPrefix(option, index))"></span>
            </div>
          </div>
          <!-- 子题目显示 -->
          <div v-if="question.children && parseChildren(question.children).length > 0" class="sub-questions">
            <div
              v-for="(subQuestion, index) in parseChildren(question.children)"
              :key="index"
              class="sub-question-item"
            >
              <div class="sub-question-header">
                <span class="sub-question-number">（{{ index + 1 }}）</span>
                <span class="sub-question-type">{{ subQuestion.catename || subQuestion.qtype }}</span>
              </div>
              <div class="sub-question-content" v-html="processQuestionContent(subQuestion.content)"></div>
              
              <!-- 子题目的选择题选项显示 -->
              <div class="sub-question-options" v-if="subQuestion.options">
                <div
                  v-for="(option, optionIndex) in parseOptions(subQuestion.options)"
                  :key="optionIndex"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                  <span class="option-content" v-html="processQuestionContent(removeOptionPrefix(option, optionIndex))"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="filteredQuestions.length === 0" class="no-data">
        <el-empty description="暂无题目数据"></el-empty>
      </div>
    </div>
    <!-- 分页组件 -->
    <div v-if="showPagination && total > 0" class="pagination-wrapper">
      <Pagination
        :total="total"
        :page="pageNum"
        :limit="pageSize"
        :page-sizes="normalizedPageSizes"
        @pagination="handlePagination"
      />
    </div>
    <!-- 菁优网搜题上一页/下一页按钮 -->
    <div v-if="showThirdPartyPagination" class="third-party-pagination-wrapper">
      <el-button 
        :disabled="currentPage <= 1" 
        @click="handlePrevPage"
        size="small"
      >
        <i class="el-icon-arrow-left"></i> 上一页
      </el-button>
      <span class="page-info">第 {{ currentPage }} 页</span>
      <el-button 
        @click="handleNextPage"
        size="small"
      >
        下一页 <i class="el-icon-arrow-right"></i>
      </el-button>
    </div>
  </div>
</template>

<script>
import latexRenderer from '@/utils/latexRenderer'
import Pagination from '@/components/Pagination'
import { checkQuestionCollect, saveQuestionTag } from '@/api/system/problems'

export default {
  name: 'QuestionList',
  components: {
    Pagination
  },
  props: {
    questions: {
      type: Array,
      default: () => []
    },
    questionTypes: {
      type: Array,
      default: () => []
    },
    selectedQuestions: {
      type: Array,
      default: () => []
    },
    processQuestionContent: {
      type: Function,
      required: true
    },
    // 分页相关props
    showPagination: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    // 菁优网搜题分页相关props
    showThirdPartyPagination: {
      type: Boolean,
      default: false
    },
    // 是否是菁优网搜题模式（用于隐藏题型和难度筛选）
    isThirdPartyMode: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    // 是否在取消收藏前需要确认（用于收藏列表）
    confirmBeforeUnfavorite: {
      type: Boolean,
      default: false
    },
    // 分页每页条数选项
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    // 是否禁用收藏状态检查（用于收藏列表，因为收藏列表中的题目都是已收藏的）
    disableFavoriteStatusCheck: {
      type: Boolean,
      default: false
    },
    // 科目名称（用于收藏时传递）
    subjectName: {
      type: String,
      default: ''
    },
    // 是否启用后端搜索（当选择题型/难度/关键词时触发搜索事件）
    enableBackendSearch: {
      type: Boolean,
      default: false
    },
    // 是否显示修改按钮（仅在章节、知识点和教辅材料模式下显示）
    showEditButton: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      questionType: '',
      difficultyLevel: '',
      questionSearch: '',
      filteredQuestions: [],
      favoriteTag: '默认收藏', // 默认收藏标签
      favoriteStatusLoading: false, // 收藏状态加载中标记，防止重复请求
      lastQuestionIds: '', // 上次请求的题目ID，用于去重
      searchTimer: null, // 搜索防抖定时器
      isSearching: false // 搜索进行中标记，防止重复触发
    }
  },
  computed: {
    // 标准化分页每页条数选项，确保当前 pageSize 在选项中
    normalizedPageSizes() {
      const sizes = [...this.pageSizes]
      // 如果当前的 pageSize 不在选项中，添加到选项中并排序
      if (!sizes.includes(this.pageSize)) {
        sizes.push(this.pageSize)
        sizes.sort((a, b) => a - b)
      }
      return sizes
    },
    // 判断是否是菁优网搜题模式（优先使用 prop，如果没有则使用 showThirdPartyPagination）
    shouldHideFilters() {
      return this.isThirdPartyMode || this.showThirdPartyPagination
    }
  },
  watch: {
    questions: {
      handler(newQuestions, oldQuestions) {
        // 检查题目列表是否真的发生了变化
        const questionsChanged = !oldQuestions || 
          newQuestions.length !== oldQuestions.length ||
          newQuestions.some((q, index) => {
            const oldQ = oldQuestions[index]
            if (!oldQ) return true
            const newId = q.sid || q.SID || q.questionSid
            const oldId = oldQ.sid || oldQ.SID || oldQ.questionSid
            return newId !== oldId
          })
        
        this.filteredQuestions = [...newQuestions]
        
        // 如果启用了后端搜索，不要在这里调用 filterQuestions
        // 因为搜索应该由用户操作（选择题型/难度/输入关键词）触发，而不是由数据更新触发
        if (!this.enableBackendSearch) {
          this.filterQuestions()
        }
        
        // 加载收藏状态（如果禁用了收藏状态检查，则跳过，用于收藏列表）
        // 只有当题目列表真正发生变化时才加载收藏状态
        if (!this.disableFavoriteStatusCheck && newQuestions && newQuestions.length > 0 && questionsChanged) {
          // 清除上次的题目ID缓存，强制重新加载收藏状态
          this.lastQuestionIds = ''
          this.$nextTick(() => {
            this.loadFavoriteStatus()
          })
        }
      },
      immediate: true,
      deep: true
    },
    // 监听 store 中的已选题目变化，强制更新组件
    '$store.getters.selectedQuestions': {
      handler() {
        // 强制更新组件，使按钮状态正确显示
        this.$forceUpdate()
      },
      deep: true
    }
  },
  methods: {
    // 重置滚动条到顶部
    resetScroll() {
      const questionList = this.$refs.questionListPanel?.querySelector('.question-list')
      if (questionList) {
        questionList.scrollTop = 0
      }
    },
    parseOptions(optionsStr) {
      try {
        // 如果已经是数组，直接返回
        if (Array.isArray(optionsStr)) {
          return optionsStr
        }
        // 如果是字符串，尝试JSON解析
        if (typeof optionsStr === 'string') {
          return JSON.parse(optionsStr)
        }
        return []
      } catch (e) {
        return []
      }
    },
    parseChildren(children) {
      if (!children) return []
      if (Array.isArray(children)) return children
      if (typeof children === 'string') {
        try {
          return JSON.parse(children)
        } catch (e) {
          return []
        }
      }
      return []
    },
    getQuestionType(question) {
      return question.catename || question.CateName || question.qtype || '未知题型'
    },
    getQuestionDifficulty(question) {
      const difficulty = question.difficulty || question.degree || question.Degree
      if (difficulty === undefined || difficulty === null || difficulty === '') {
        return '未知'
      }
      
      // 如果已经是文字描述，直接返回
      if (typeof difficulty === 'string' && ['简单', '较易', '中等', '较难', '困难', 'easy', 'easier', 'medium', 'harder', 'hard'].includes(difficulty)) {
        return difficulty
      }
      
      // 如果是数字，转换为文字描述
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
    getDifficultyLevel(difficulty) {
      // 处理空值
      if (difficulty === undefined || difficulty === null || difficulty === '') {
        return null
      }
      
      // 如果是字符串格式的难度，先转换为英文
      if (typeof difficulty === 'string') {
        const difficultyMap = {
          '困难': 'hard',
          '较难': 'harder',
          '中等': 'medium',
          '中档': 'medium',
          '较易': 'easier',
          '简单': 'easy',
          '易': 'easy',
          'hard': 'hard',
          'harder': 'harder',
          'medium': 'medium',
          'easier': 'easier',
          'easy': 'easy'
        }
        
        if (difficultyMap[difficulty]) {
          return difficultyMap[difficulty]
        }
      }
      
      // 如果是数字，转换为英文难度值
      const diff = parseFloat(difficulty)
      if (!isNaN(diff)) {
        if (diff > 0 && diff <= 0.2) return 'hard'
        if (diff > 0.2 && diff <= 0.4) return 'harder'
        if (diff > 0.4 && diff <= 0.6) return 'medium'
        if (diff > 0.6 && diff <= 0.8) return 'easier'
        if (diff > 0.8 && diff <= 1) return 'easy'
      }
      
      // 如果无法识别，返回null而不是默认值，避免错误匹配
      return null
    },
    filterQuestions() {
      // 如果启用了后端搜索，触发搜索事件
      if (this.enableBackendSearch) {
        // 防止重复触发搜索
        if (this.isSearching) {
          return
        }
        this.isSearching = true
        this.$emit('search', {
          keywords: this.questionSearch || '',
          questionType: this.questionType || '',
          difficultyLevel: this.difficultyLevel || ''
        })
        // 延迟重置搜索标记，避免快速连续触发
        setTimeout(() => {
          this.isSearching = false
        }, 1000)
        return
      }
      
      // 否则使用前端过滤
      let filtered = [...this.questions]
      
      // 题型筛选
      if (this.questionType) {
        filtered = filtered.filter(question => {
          const questionType = this.getQuestionType(question)
          return questionType.toLowerCase() === this.questionType.toLowerCase()
        })
      }
      
      // 难度筛选
      if (this.difficultyLevel) {
        filtered = filtered.filter(question => {
          // 尝试从多个可能的字段获取难度
          const difficultyValue = question.difficulty || question.degree || question.Degree
          const difficulty = this.getDifficultyLevel(difficultyValue)
          return difficulty === this.difficultyLevel
        })
      }
      
      // 搜索关键字筛选
      if (this.questionSearch) {
        filtered = filtered.filter(question => 
          question.question.toLowerCase().includes(this.questionSearch.toLowerCase()) ||
          this.getQuestionType(question).toLowerCase().includes(this.questionSearch.toLowerCase())
        )
      }
      
      // 检查筛选后的题目列表是否发生变化
      const filteredChanged = this.filteredQuestions.length !== filtered.length ||
        filtered.some((q, index) => {
          const oldQ = this.filteredQuestions[index]
          if (!oldQ) return true
          const newId = q.sid || q.SID || q.questionSid
          const oldId = oldQ.sid || oldQ.SID || oldQ.questionSid
          return newId !== oldId
        })
      
      this.filteredQuestions = filtered
      
      // 如果筛选后的题目列表发生变化，且题目数量大于0，重新加载收藏状态
      if (filteredChanged && !this.disableFavoriteStatusCheck && filtered.length > 0) {
        // 清除上次的题目ID缓存，强制重新加载收藏状态
        this.lastQuestionIds = ''
        this.$nextTick(() => {
          this.loadFavoriteStatus()
        })
      }
    },
    isQuestionSelected(sid) {
      if (!sid) return false
      // 优先从 store 获取已选题目列表（如果 store 可用）
      let selectedQuestions = []
      if (this.$store && this.$store.getters) {
        selectedQuestions = this.$store.getters.selectedQuestions || []
      } else if (this.selectedQuestions) {
        // 降级：使用 props
        selectedQuestions = this.selectedQuestions
      }
      
      return selectedQuestions.some(q => {
        const qSid = q.sid || q.SID || q.questionSid
        return qSid === sid || String(qSid) === String(sid)
      })
    },
    showAnalysis(question) {
      this.$emit('show-analysis', question)
    },
    editQuestion(question) {
      this.$emit('edit-question', question)
    },
    addToPaper(question) {
      this.$emit('add-to-paper', question)
    },
    removeFromPaper(question) {
      this.$emit('remove-from-paper', question.sid || question.SID || question.questionSid)
    },
    // 加载收藏状态
    async loadFavoriteStatus() {
      if (!this.filteredQuestions || this.filteredQuestions.length === 0) {
        return
      }
      
      // 如果正在加载中，直接返回，避免重复请求
      if (this.favoriteStatusLoading) {
        return
      }
      
      try {
        // 收集所有题目的ID
        const questionIds = this.filteredQuestions
          .map(q => q.sid || q.SID || q.questionSid)
          .filter(id => id)
        
        if (questionIds.length === 0) {
          return
        }
        
        // 生成题目ID的字符串，用于判断是否需要重新请求
        const questionIdsStr = questionIds.sort().join(',')
        
        // 如果题目ID和上次一样，不需要重复请求
        if (this.lastQuestionIds === questionIdsStr) {
          return
        }
        
        // 设置加载标记和当前题目ID
        this.favoriteStatusLoading = true
        this.lastQuestionIds = questionIdsStr
        
        // 调用API查询收藏状态
        const response = await checkQuestionCollect(questionIds)
        if (response && response.code === 200) {
          const collectData = response.data || {}
          
          // 更新每个题目的收藏状态
          this.filteredQuestions.forEach(question => {
            const questionId = question.sid || question.SID || question.questionSid
            if (questionId) {
              // API 返回格式：{ questionId: true/false }
              // 直接通过 questionId 作为键获取布尔值
              const isFavorite = collectData[questionId] === true || collectData[String(questionId)] === true
              this.$set(question, 'isFavorite', isFavorite)
            }
          })
        }
      } catch (error) {
        console.error('查询收藏状态失败:', error)
      } finally {
        // 重置加载标记
        this.favoriteStatusLoading = false
      }
    },
    // 切换收藏状态
    async toggleFavorite(question) {
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        this.$message.warning('题目ID不存在')
        return
      }
      
      try {
        if (question.isFavorite) {
          // 取消收藏
          // 如果需要确认，先触发 before-unfavorite 事件，让父组件处理确认逻辑
          if (this.confirmBeforeUnfavorite) {
            // 触发事件，传递题目和确认回调函数
            // 确认回调返回 Promise，以便父组件可以等待操作完成
            this.$emit('before-unfavorite', question, () => {
              // 确认回调：执行取消收藏操作并返回 Promise
              return this.executeUnfavorite(question, questionId)
            })
            return
          } else {
            // 不需要确认，直接执行取消收藏
            await this.executeUnfavorite(question, questionId)
          }
        } else {
          // 添加收藏
          const requestData = {
            questionSid: String(questionId),
            tags: this.favoriteTag
          }
          
          // 如果有科目名称，添加到请求参数中
          if (this.subjectName) {
            requestData.subjectName = this.subjectName
          }
          
          const response = await saveQuestionTag(requestData)
          if (response && response.code === 200) {
            this.$set(question, 'isFavorite', true)
            // 清除上次请求的题目ID，以便下次可以重新请求
            this.lastQuestionIds = ''
            this.$message.success('收藏成功')
            this.$emit('favorite-changed', question, true)
          } else {
            this.$message.error('收藏失败：' + (response.msg || '未知错误'))
          }
        }
      } catch (error) {
        console.error('操作收藏失败:', error)
        this.$message.error('操作失败：' + (error.message || '网络错误'))
      }
    },
    // 执行取消收藏操作
    async executeUnfavorite(question, questionId) {
      const { deleteQuestionFavorite } = await import('@/api/system/problems')
      const formData = new FormData()
      formData.append('questionSid', String(questionId))
      
      const response = await deleteQuestionFavorite(formData)
      if (response && response.code === 200) {
        this.$set(question, 'isFavorite', false)
        // 清除上次请求的题目ID，以便下次可以重新请求
        this.lastQuestionIds = ''
        this.$message.success('取消收藏成功')
        this.$emit('favorite-changed', question, false)
      } else {
        this.$message.error('取消收藏失败：' + (response.msg || '未知错误'))
      }
    },
    removeOptionPrefix(option, index) {
      return latexRenderer.removeOptionPrefix(option, index)
    },
    handlePagination(pageData) {
      this.$emit('pagination-change', pageData)
    },
    handlePrevPage() {
      this.$emit('prev-page')
    },
    handleNextPage() {
      this.$emit('next-page')
    },
    // 处理搜索输入（防抖处理）
    handleSearchInput() {
      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      // 设置新的定时器，500ms后触发搜索
      this.searchTimer = setTimeout(() => {
        this.filterQuestions()
      }, 500)
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  }
}
</script>

<style scoped>
.center-panel {
  flex: 1;
  min-width: 400px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.search-box {
  display: flex;
  align-items: center;
  width: 600px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
  white-space: nowrap;
}

.question-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 15px;
  background: #fff;
  transition: all 0.3s;
}

.question-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.question-header {
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.question-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.question-type {
  background: #409eff;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.question-difficulty {
  color: #606266;
  font-size: 12px;
  font-weight: 500;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.question-content {
  padding: 15px;
}

.question-text {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #303133;
  overflow: hidden;
}

/* 图片适配样式 */
.question-card ::v-deep img {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 8px 0 !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-content ::v-deep img {
  margin: 5px 0 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.question-label {
  display: inline-block;
  background: #f0f9ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  border: 1px solid #d1e7ff;
}

.question-options {
  margin-top: 10px;
}

.sub-questions {
  margin-top: 15px;
  border-top: 1px solid #e4e7ed;
  padding-top: 10px;
}

.sub-question-item {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.sub-question-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.sub-question-number {
  font-weight: bold;
  color: #67c23a;
  margin-right: 8px;
}

.sub-question-type {
  background: #67c23a;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.sub-question-content {
  line-height: 1.5;
  color: #606266;
}

.sub-question-options {
  margin-top: 10px;
}

.sub-question-options .option-item {
  margin-bottom: 6px;
  padding: 6px;
  background: #f0f9ff;
  border-radius: 3px;
  border-left: 3px solid #67c23a;
  display: flex;
  align-items: flex-start;
}

.sub-question-options .option-label {
  margin-top: 2px;
  font-weight: bold;
  color: #67c23a;
  margin-right: 6px;
  min-width: 18px;
  display: inline-block;
  font-size: 12px;
}

.sub-question-options .option-content {
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
}

.option-item {
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: flex-start;
}

.option-label {
  margin-top: 3px;
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
  display: inline-block;
}

.option-content {
  flex: 1;
}

.view-detail-btn {
  color: #409eff;
}

.view-detail-btn:hover {
  color: #66b1ff;
}

.favorite-btn {
  color: #606266;
}

.favorite-btn.is-favorite {
  color: #f56c6c;
}

.favorite-btn.is-favorite:hover {
  color: #f78989;
}

.favorite-btn:hover {
  color: #409eff;
}

.add-to-paper-btn {
  color: #67c23a;
}

.add-to-paper-btn:hover {
  color: #85ce61;
}

.remove-from-paper-btn {
  color: #e6a23c;
}

.remove-from-paper-btn:hover {
  color: #ebb563;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
}

/* 滚动条样式 */
.question-list::-webkit-scrollbar {
  width: 6px;
}

.question-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.question-list::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.pagination-wrapper {
  padding: 10px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
}

.third-party-pagination-wrapper {
  padding: 15px;
  border-top: 1px solid #e4e7ed;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.page-info {
  color: #606266;
  font-size: 14px;
  min-width: 80px;
  text-align: center;
}
</style>