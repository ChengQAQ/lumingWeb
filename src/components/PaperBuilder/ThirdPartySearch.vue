<template>
  <div class="third-party-search">
    <div class="source-title">菁优网搜题</div>
    
    <div class="search-content">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="small">
        <!-- 知识点选择 - 必填项 -->
        <el-form-item prop="knowledge_name" class="knowledge-form-item">
          <div class="knowledge-selector-header">
            <span class="knowledge-label">选择知识点 <span class="required-mark">*</span></span>
            <el-tag 
              v-if="form.knowledge_name"
              type="success" 
              size="small" 
              class="selected-knowledge-tag"
              :title="form.knowledge_name"
            >
              {{ form.knowledge_name }}
            </el-tag>
            <el-button 
              v-if="form.knowledge_name"
              type="text" 
              size="mini" 
              icon="el-icon-close"
              @click="clearKnowledge"
              class="clear-knowledge-btn"
            >
            </el-button>
          </div>
          <div class="knowledge-tree-container">
            <el-tree
              :data="knowledgeOptions"
              :props="{ label: 'label', children: 'children' }"
              node-key="value"
              @node-click="handleKnowledgeSelect"
              :highlight-current="true"
              :default-expand-all="false"
              :expand-on-click-node="true"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span :title="node.label">{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { thirdPartySearch, getQuestionTypeDistribution } from '@/api/system/problems'

export default {
  name: 'ThirdPartySearch',
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    },
    teacherSubjectName: {
      type: String,
      default: ''
    },
    adminSubject: {
      type: String,
      default: ''
    },
    knowledgeOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        subject: '',
        knowledge_name: '',
        knowledge_full_path: '',
        difficulty: 0,
        questionType: '',
        question_type_distribution: {},
        max_questions: 10,
        page: 1,
        gc: false,
        sc: false,
        rc: false,
        yc: false,
        ec: false,
        er: false,
        rg: '',
        so: '',
        yr: ''
      },
      rules: {
        knowledge_name: [
          { required: true, message: '请选择知识点（必须选择最底层节点）', trigger: 'change' }
        ]
      },
      loading: false,
      questionTypes: [],
      // 来源类型
      sourceTypes: [
        { label: '全部', value: '全部' },
        { label: '中考真题', value: '中考真题' },
        { label: '自主招生', value: '自主招生' },
        { label: '中考模拟', value: '中考模拟' },
        { label: '中考复习', value: '中考复习' },
        { label: '期末试题', value: '期末试题' },
        { label: '期中试题', value: '期中试题' },
        { label: '月考试题', value: '月考试题' },
        { label: '开学试题', value: '开学试题' },
        { label: '单元测验', value: '单元测验' },
        { label: '同步练习', value: '同步练习' },
        { label: '竞赛试题', value: '竞赛试题' },
        { label: '假期作业', value: '假期作业' },
        { label: '初高衔接', value: '初高衔接' }
      ],
      selectedSources: ['全部'],
      // 年份选项
      yearOptions: [
        { label: '全部', value: '全部' },
        { label: '2025', value: '2025' },
        { label: '2024', value: '2024' },
        { label: '2023', value: '2023' },
        { label: '2022', value: '2022' },
        { label: '2021', value: '2021' },
        { label: '更早', value: '更早' }
      ],
      selectedYears: ['全部'],
      // 高级选项
      advancedOptions: [
        { label: '全部', value: 'all' },
        { label: '好题集', value: 'gc' },
        { label: '真题集', value: 'sc' },
        { label: '常考题', value: 'rc' },
        { label: '压轴题', value: 'yc' },
        { label: '易错题', value: 'ec' },
        { label: '用户错题', value: 'er' }
      ],
      selectedAdvancedOptions: ['all']
    }
  },
  computed: {
    canSearch() {
      if (!this.form.knowledge_name) return false
      if (!this.form.questionType) return false
      // 优先使用 adminSubject（即用户选择的科目）
      const subject = this.adminSubject || this.form.subject
      return !!subject
    },
    filteredSourceTypes() {
      // 优先使用 adminSubject（即用户选择的科目）
      const subject = this.adminSubject || this.form.subject
      const isHighSchool = subject && subject.startsWith('高中')
      
      if (isHighSchool) {
        // 高中科目：隐藏前四项（中考真题、自主招生、中考模拟、中考复习）
        return this.sourceTypes.filter(source => 
          !['中考真题', '自主招生', '中考模拟', '中考复习'].includes(source.value)
        )
      } else {
        // 初中科目：显示所有来源类型
        return this.sourceTypes
      }
    }
  },
  methods: {
    handleSubjectChange() {
      this.loadQuestionTypes()
      this.form.knowledge_name = ''
      this.form.questionType = ''
      // 重置筛选条件
      this.selectedSources = ['全部']
      this.selectedYears = ['全部']
      this.selectedAdvancedOptions = ['all']
      // 通知父组件筛选条件变化
      this.emitFilterChange()
    },
    
    handleQuestionTypeChange() {
      // 题目类型变化时的处理
      this.emitFilterChange()
      
      // 如果满足搜索条件，自动触发搜题
      this.$nextTick(() => {
        if (this.canSearch && this.form.knowledge_name) {
          this.handleSearch()
        }
      })
    },
    
    // 通知父组件筛选条件变化
    emitFilterChange() {
      this.$emit('filter-change', {
        difficulty: this.form.difficulty,
        questionType: this.form.questionType,
        selectedSources: this.selectedSources,
        selectedYears: this.selectedYears,
        selectedAdvancedOptions: this.selectedAdvancedOptions,
        questionTypes: this.questionTypes,
        filteredSourceTypes: this.filteredSourceTypes,
        yearOptions: this.yearOptions,
        advancedOptions: this.advancedOptions,
        canSearch: this.canSearch,
        loading: this.loading
      })
    },
    
    toggleSource(sourceValue) {
      if (sourceValue === '全部') {
        this.selectedSources = ['全部']
      } else {
        // 如果选择其他选项，移除"全部"
        const allIndex = this.selectedSources.indexOf('全部')
        if (allIndex > -1) {
          this.selectedSources.splice(allIndex, 1)
        }
        
        const index = this.selectedSources.indexOf(sourceValue)
        if (index > -1) {
          this.selectedSources.splice(index, 1)
          // 如果没有选择任何选项，自动选择"全部"
          if (this.selectedSources.length === 0) {
            this.selectedSources = ['全部']
          }
        } else {
          this.selectedSources.push(sourceValue)
        }
      }
      this.emitFilterChange()
    },
    
    toggleYear(yearValue) {
      if (yearValue === '全部') {
        this.selectedYears = ['全部']
      } else {
        // 如果选择其他选项，移除"全部"
        const allIndex = this.selectedYears.indexOf('全部')
        if (allIndex > -1) {
          this.selectedYears.splice(allIndex, 1)
        }
        
        const index = this.selectedYears.indexOf(yearValue)
        if (index > -1) {
          this.selectedYears.splice(index, 1)
          // 如果没有选择任何选项，自动选择"全部"
          if (this.selectedYears.length === 0) {
            this.selectedYears = ['全部']
          }
        } else {
          this.selectedYears.push(yearValue)
        }
      }
      this.emitFilterChange()
    },
    
    toggleAdvancedOption(optionValue) {
      if (optionValue === 'all') {
        this.selectedAdvancedOptions = ['all']
      } else {
        // 如果选择其他选项，移除"全部"
        const allIndex = this.selectedAdvancedOptions.indexOf('all')
        if (allIndex > -1) {
          this.selectedAdvancedOptions.splice(allIndex, 1)
        }
        
        const index = this.selectedAdvancedOptions.indexOf(optionValue)
        if (index > -1) {
          this.selectedAdvancedOptions.splice(index, 1)
          // 如果没有选择任何选项，自动选择"全部"
          if (this.selectedAdvancedOptions.length === 0) {
            this.selectedAdvancedOptions = ['all']
          }
        } else {
          this.selectedAdvancedOptions.push(optionValue)
        }
      }
      
      // 更新表单值
      this.form.gc = this.selectedAdvancedOptions.includes('gc')
      this.form.sc = this.selectedAdvancedOptions.includes('sc')
      this.form.rc = this.selectedAdvancedOptions.includes('rc')
      this.form.yc = this.selectedAdvancedOptions.includes('yc')
      this.form.ec = this.selectedAdvancedOptions.includes('ec')
      this.form.er = this.selectedAdvancedOptions.includes('er')
      this.emitFilterChange()
    },
    
    async loadQuestionTypes() {
      // 优先使用 adminSubject（即用户选择的科目）
      const subject = this.adminSubject || this.form.subject
      if (!subject) return
      
      try {
        const res = await getQuestionTypeDistribution(subject)
        if (res && res.question_types) {
          this.questionTypes = Object.keys(res.question_types)
          // 通知父组件题型变化
          this.emitFilterChange()
        }
      } catch (error) {
        console.error('获取题目类型失败:', error)
      }
    },
    
    handleKnowledgeSelect(data) {
      // 只允许选择叶子节点
      if (data.children && data.children.length > 0) {
        this.$message.warning('请选择最底层的知识点节点')
        return
      }
      
      this.form.knowledge_name = data.label
      this.form.knowledge_full_path = this.buildKnowledgePath(data)
      
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.formRef.validateField('knowledge_name')
      })
      
      // 选择知识点后，如果还没有选择题目类型，自动选择第一个
      if (this.questionTypes.length > 0 && !this.form.questionType) {
        this.form.questionType = this.questionTypes[0]
      }
      this.emitFilterChange()
      
      // 如果满足搜索条件，自动触发搜题
      this.$nextTick(() => {
        if (this.canSearch) {
          this.handleSearch()
        }
      })
    },
    
    buildKnowledgePath(knowledge) {
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
      return findPath(this.knowledgeOptions, knowledge.value) || knowledge.label
    },
    
    clearKnowledge() {
      this.form.knowledge_name = ''
      this.form.knowledge_full_path = ''
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.formRef.validateField('knowledge_name')
      })
      this.emitFilterChange()
    },
    
    // 暴露方法供父组件调用，获取当前筛选条件
    getFilterData() {
      return {
        difficulty: this.form.difficulty,
        questionType: this.form.questionType,
        selectedSources: this.selectedSources,
        selectedYears: this.selectedYears,
        selectedAdvancedOptions: this.selectedAdvancedOptions,
        questionTypes: this.questionTypes,
        filteredSourceTypes: this.filteredSourceTypes,
        yearOptions: this.yearOptions,
        advancedOptions: this.advancedOptions,
        canSearch: this.canSearch,
        loading: this.loading
      }
    },
    
    // 获取当前页码
    getCurrentPage() {
      return this.form.page || 1
    },
    
    // 设置页码
    setPage(page) {
      this.form.page = page
    },
    
    // 暴露方法供父组件调用，设置筛选条件
    setFilterData(filterData) {
      if (filterData.difficulty !== undefined) {
        this.form.difficulty = filterData.difficulty
      }
      if (filterData.questionType !== undefined) {
        this.form.questionType = filterData.questionType
        // 如果满足搜索条件，自动触发搜题
        this.$nextTick(() => {
          if (this.canSearch && this.form.knowledge_name) {
            this.handleSearch()
          }
        })
      }
      if (filterData.selectedSources) {
        this.selectedSources = filterData.selectedSources
      }
      if (filterData.selectedYears) {
        this.selectedYears = filterData.selectedYears
      }
      if (filterData.selectedAdvancedOptions) {
        this.selectedAdvancedOptions = filterData.selectedAdvancedOptions
        // 更新表单值
        this.form.gc = this.selectedAdvancedOptions.includes('gc')
        this.form.sc = this.selectedAdvancedOptions.includes('sc')
        this.form.rc = this.selectedAdvancedOptions.includes('rc')
        this.form.yc = this.selectedAdvancedOptions.includes('yc')
        this.form.ec = this.selectedAdvancedOptions.includes('ec')
        this.form.er = this.selectedAdvancedOptions.includes('er')
      }
    },
    
    // 暴露搜索方法供父组件调用
    triggerSearch() {
      this.handleSearch()
    },
    
    async handleSearch() {
      // 如果知识点未选择，不继续执行
      if (!this.form.knowledge_name) {
        this.$message.warning('请选择知识点（必须选择最底层节点）')
        // 触发表单验证，显示错误信息
        this.$refs.formRef.validateField('knowledge_name')
        return
      }
      
      if (!this.canSearch) {
        this.$message.warning('请完善搜索条件：请选择题目类型')
        return
      }
      
      // 优先使用 adminSubject（即用户选择的科目）
      const subject = this.adminSubject || this.form.subject
      
      // 构建题目类型分布
      const distribution = {}
      if (this.form.questionType) {
        distribution[this.form.questionType] = this.form.max_questions
      }
      
      // 处理来源类型
      let so = ''
      if (this.selectedSources.length > 0 && !this.selectedSources.includes('全部')) {
        so = this.selectedSources.join(',')
      }
      
      // 处理年份范围
      let yr = ''
      if (this.selectedYears.length > 0 && !this.selectedYears.includes('全部')) {
        yr = this.selectedYears.join(',')
      }
      
      this.loading = true
      this.emitFilterChange() // 通知父组件 loading 状态变化
      
      try {
        const requestData = {
          subject: subject,
          knowledge_name: this.form.knowledge_name,
          knowledge_full_path: this.form.knowledge_full_path,
          difficulty: this.form.difficulty,
          question_type_distribution: distribution,
          max_questions: this.form.max_questions,
          page: this.form.page,
          gc: this.form.gc,
          sc: this.form.sc,
          rc: this.form.rc,
          yc: this.form.yc,
          ec: this.form.ec,
          er: this.form.er,
          rg: this.form.rg,
          so: so,
          yr: yr
        }
        
        const response = await thirdPartySearch(requestData)
        
        // 首先检查响应中是否包含错误信息（如"尝试5次后,仍未能成功获取"）
        const errorMsg = response?.msg || response?.message || response?.detail || ''
        if (errorMsg && (errorMsg.includes('尝试') && errorMsg.includes('次') && errorMsg.includes('未能成功获取'))) {
          // 这是后端返回的"没有题目"的错误，转换为友好提示
          this.$message.warning('当前题型暂无题目，请尝试其他题型')
          this.$emit('search-success', [], 0)
          return
        }
        
        // 检查响应码，如果不是200且有错误信息，也进行判断
        if (response && response.code && response.code !== 200) {
          const codeErrorMsg = response.msg || response.message || response.detail || ''
          if (codeErrorMsg && (codeErrorMsg.includes('尝试') && codeErrorMsg.includes('次') && codeErrorMsg.includes('未能成功获取'))) {
            this.$message.warning('当前题型暂无题目，请尝试其他题型')
            this.$emit('search-success', [], 0)
            return
          }
        }
        
        // 处理响应数据 - 支持多种数据格式
        let questions = []
        let total = 0
        
        if (Array.isArray(response)) {
          // 格式1: 直接返回数组
          questions = response
          total = response.total || response.length
        } else if (response && response.data && Array.isArray(response.data)) {
          // 格式2: { data: [...], total: 10 }
          questions = response.data
          total = response.total || response.data.length
        } else if (response && response.questions && Array.isArray(response.questions)) {
          // 格式3: { questions: [...], total: 10 }
          questions = response.questions
          total = response.total || response.questions.length
        } else if (response && response.code === 200 && response.data && Array.isArray(response.data)) {
          // 格式4: { code: 200, data: [...], total: 10 }
          questions = response.data
          total = response.total || response.data.length
        } else {
          // 检查是否是后端返回的错误信息（如"尝试5次后,仍未能成功获取"）
          const errorMsg = response?.msg || response?.message || ''
          if (errorMsg && (errorMsg.includes('尝试') && errorMsg.includes('次') && errorMsg.includes('未能成功获取'))) {
            // 这是后端返回的"没有题目"的错误，转换为友好提示
            this.$message.warning('当前题型暂无题目，请尝试其他题型')
            this.$emit('search-success', [], 0)
            return
          }
          console.error('响应格式异常:', response)
          this.$message.error('响应格式异常，请查看控制台')
          this.$emit('search-error', new Error('响应格式异常'))
          return
        }
        
        if (questions.length > 0) {
          // 标准化题目数据格式，确保字段统一
          const processedQuestions = questions.map(item => ({
            ...item,
            // 统一题型字段
            qtype: item.qtype || item.catename || '未知类型',
            cate: item.qtype || item.catename || '未知类型',
            catename: item.qtype || item.catename || '未知类型',
            // 统一题目内容字段
            question: item.question || item.content || '',
            // 统一难度字段
            degree: item.degree || item.difficulty || 0.5,
            difficulty: item.degree || item.difficulty || 0.5,
            // 统一选项字段（确保是字符串格式）
            options: typeof item.options === 'string' ? item.options : (Array.isArray(item.options) ? JSON.stringify(item.options) : '[]'),
            // 统一答案字段
            answers: typeof item.answers === 'string' ? item.answers : (Array.isArray(item.answers) ? JSON.stringify(item.answers) : '[]'),
            // 统一子题目字段
            children: typeof item.children === 'string' ? item.children : (Array.isArray(item.children) ? JSON.stringify(item.children) : '[]'),
            // 其他字段
            displayanswer: item.displayanswer || '',
            sid: item.sid || item.id || '',
            subject_name: item.subject_name || item.subject || ''
          }))
          
          this.$emit('search-success', processedQuestions, total)
          this.$message.success(`搜索成功，找到 ${total} 道题目`)
        } else {
          this.$message.info('未找到相关题目')
          this.$emit('search-success', [], 0)
        }
      } catch (error) {
        console.error('三方题库搜题失败:', error)
        
        // 检查错误信息中是否包含"尝试"、"次"、"未能成功获取"等关键词
        const errorMsg = error?.message || error?.msg || String(error || '')
        if (errorMsg && (errorMsg.includes('尝试') && errorMsg.includes('次') && errorMsg.includes('未能成功获取'))) {
          // 这是后端返回的"没有题目"的错误，转换为友好提示
          this.$message.warning('当前题型暂无题目，请尝试其他题型')
          this.$emit('search-success', [], 0)
        } else {
          // 其他错误，显示通用错误提示
          this.$message.error('搜索失败，请稍后重试')
          this.$emit('search-error', error)
        }
      } finally {
        this.loading = false
        this.emitFilterChange() // 通知父组件 loading 状态变化
      }
    }
  },
  watch: {
    knowledgeOptions: {
      handler() {
        // 当知识点选项变化时，可以做一些处理
      },
      immediate: true
    },
    // 监听老师科目名称变化，自动加载题目类型
    teacherSubjectName: {
      handler(newVal) {
        if (!this.isAdmin && newVal) {
          // 老师用户，科目名称变化时自动加载题目类型
          this.loadQuestionTypes()
        }
      },
      immediate: true
    },
    // 监听管理员科目变化（从外部传入，所有用户都使用这个）
    adminSubject: {
      handler(newVal, oldVal) {
        if (newVal) {
          // 更新内部表单的科目
          this.form.subject = newVal
          // 如果科目发生变化，清空知识点和题目类型
          if (oldVal && oldVal !== newVal) {
            this.form.knowledge_name = ''
            this.form.questionType = ''
            // 重置筛选条件
            this.selectedSources = ['全部']
            this.selectedYears = ['全部']
            this.selectedAdvancedOptions = ['all']
            // 科目变化时加载题目类型（只在科目真正变化时调用，避免重复）
            this.loadQuestionTypes()
          }
        } else if (!newVal) {
          // 科目被清空时，也清空相关字段
          this.form.subject = ''
          this.form.knowledge_name = ''
          this.form.questionType = ''
          this.questionTypes = []
        }
      },
      immediate: false  // 改为 false，避免在初始化时重复调用
    }
  },
  mounted() {
    // 组件挂载时，如果有选择的科目，自动加载题目类型（只在挂载时调用一次）
    if (this.adminSubject || this.form.subject) {
      this.loadQuestionTypes()
    }
    // 初始化时通知父组件筛选数据
    this.$nextTick(() => {
      this.emitFilterChange()
    })
  }
}
</script>

<style scoped>
.third-party-search {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.source-title {
  padding: 10px 15px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
  color: #303133;
  font-size: 14px;
}

.search-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.teacher-subject-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-hint {
  font-size: 12px;
  color: #909399;
}

.knowledge-form-item {
  margin-bottom: 0;
}

.knowledge-form-item >>> .el-form-item__error {
  position: relative;
  padding-top: 5px;
}

.knowledge-selector-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.knowledge-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.required-mark {
  color: #f56c6c;
  margin-left: 2px;
}

.selected-knowledge-tag {
  margin-left: 0;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.clear-knowledge-btn {
  padding: 0;
  color: #909399;
  font-size: 12px;
}

.clear-knowledge-btn:hover {
  color: #f56c6c;
}

.knowledge-tree-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  background: #fff;
}

.knowledge-tree-container >>> .el-tree {
  background: transparent;
}

.knowledge-tree-container >>> .el-tree-node__content {
  height: 32px;
  line-height: 32px;
}

.knowledge-tree-container >>> .el-tree-node__content:hover {
  background-color: #f5f7fa;
}

.knowledge-tree-container >>> .el-tree-node.is-current > .el-tree-node__content {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

/* 滚动条样式 */
.knowledge-tree-container::-webkit-scrollbar {
  width: 6px;
}

.knowledge-tree-container::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.knowledge-tree-container::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.question-type-distribution {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-radio {
  margin-right: 15px;
  margin-bottom: 10px;
}

.type-distribution-hint {
  margin-top: 10px;
  padding: 8px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 12px;
  color: #1890ff;
}

.source-type-selector,
.year-selector,
.advanced-options-selector {
  margin-top: 5px;
}

.source-tags,
.year-tags,
.advanced-options-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.source-tag,
.year-tag,
.advanced-option-tag {
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

.source-tag:hover,
.year-tag:hover,
.advanced-option-tag:hover {
  border-color: #409eff;
  color: #409eff;
}

.source-tag.active,
.year-tag.active,
.advanced-option-tag.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}
</style>

