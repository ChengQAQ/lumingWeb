/**
 * 题目搜索公共逻辑 Mixin
 * 用于提取 addCombinedHomework、addCombinedPaper 和 searchQuestions 的公共逻辑
 */
import { getQuestionDetail, getQuestionDetailByKnowledge, getQuestionTypes } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import { sysGetchaptermap } from "@/api/system/knowledge"
import { getChapterMap, getQuestionsByChapterPath } from "@/api/system/chapterTitle"
import { listSid } from "@/api/system/task"
import { listSeries } from "@/api/system/series"
import { searchBySeries, getTeacherInfo } from "@/api/system/teacher"
import { getSupportedSubjects } from "@/utils/questionTypeMappings"
import { addLog } from "@/api/system/log.js"

export default {
  data() {
    return {
      // 科目相关
      subjectOptions: [],
      // 章节相关
      chapterOptions: [],
      // 数据源选择
      dataSourceType: 'chapter', // 默认选择章节
      // 知识点相关
      knowledgeOptions: [],
      originalKnowledgeOptions: [], // 保存原始完整知识点数据（包含年级和科目）
      knowledgeList: [], // 知识点列表（用于搜索）
      currentKnowledge: null,
      knowledgeSearchKeyword: '', // 知识点搜索关键词
      showKnowledgeList: false, // 是否显示知识点列表搜索
      // 教辅材料相关
      materialOptions: [],
      currentMaterial: null,
      loadingMaterials: false,
      selectedSubjectForMaterial: null,
      teacherInfo: null,
      isAdmin: false,
      materialSubjectOptions: [],
      // 系列类型和搜索相关
      selectedSeriesType: '',
      seriesSearchKeyword: '',
      originalMaterialOptions: [],
      seriesTypeOptions: [
        { label: '书', value: '书' },
        { label: '试卷', value: '试卷' },
        { label: '视频', value: '视频' },
      ],
      // 题型筛选
      questionType: '',
      difficultyLevel: '',
      questionTypes: [],
      // 题目相关
      allQuestions: [],
      filteredQuestions: [],
      questionSearch: '',
      currentChapter: null,
      // 分页相关
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
    }
  },
  computed: {
    // 从 store 获取教师年级学科信息
    teacherGrade() {
      return this.$store.getters.teacherGrade || ''
    },
    teacherSubject() {
      return this.$store.getters.teacherSubject || ''
    },
    teacherSubjectName() {
      return this.$store.getters.teacherSubjectName || ''
    }
  },
  methods: {
    // 获取科目选项
    getSubjectOptions() {
      listSubject().then(res => {
        this.subjectOptions = res.rows || []
      }).catch(error => {
        console.error('获取科目列表失败:', error)
        this.subjectOptions = []
      })
    },
    
    // 加载章节列表
    loadChapterList(subject = null) {
      getChapterMap().then(res => {
        if (res && res.code === 200) {
          if (res.data && Array.isArray(res.data)) {
            let filteredData = this.filterLastLevelNodes(res.data, [])
            // 如果指定了科目，则按科目过滤
            if (subject) {
              filteredData = this.filterBySubject(filteredData, subject, [])
            }
            // 对章节数据进行排序
            filteredData = this.sortTreeData(filteredData)
            this.chapterOptions = filteredData
          } else {
            console.warn('章节数据为空或格式不正确:', res.data)
            this.chapterOptions = []
          }
        } else {
          console.error('获取章节列表失败，响应码:', res?.code, '响应数据:', res)
          this.chapterOptions = []
        }
      }).catch(error => {
        console.error('获取章节列表失败:', error)
        this.chapterOptions = []
      })
    },
    
    // 加载知识点列表
    loadKnowledgeList(subject = null) {
      // 先清空知识点列表，避免显示旧数据
      this.knowledgeList = []
      this.knowledgeOptions = []
      this.originalKnowledgeOptions = []
      
      const query = subject ? { subjectNameGrade: subject } : {}
      sysGetchaptermap(query).then(res => {
        if (res.code === 200) {
          // 新数据结构：包含 label（知识点列表）和 treeData（知识点树）
          if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
            // 处理知识点树
            let knowledgeData = res.data.treeData || []
            
            // 保存原始完整知识点数据（包含年级和科目）
            this.originalKnowledgeOptions = knowledgeData || []
            
            // 如果指定了科目，则按科目过滤（仅用于显示）
            if (subject && knowledgeData.length > 0) {
              knowledgeData = this.filterKnowledgeBySubject(knowledgeData, subject, [])
            }
            // 对知识点数据进行排序
            if (knowledgeData.length > 0) {
              knowledgeData = this.sortTreeData(knowledgeData)
            }
            this.knowledgeOptions = knowledgeData || []
            
            // 处理知识点列表（用于搜索）- 优先使用 API 返回的 label
            if (res.data.label && Array.isArray(res.data.label)) {
              // 使用 API 返回的 label 数组（已经是按科目过滤后的）
              this.knowledgeList = res.data.label
            } else {
              // 如果没有 label，从树形数据中提取所有标签
              // 如果指定了科目，从过滤后的树中提取；否则从原始树中提取
              const sourceTree = subject && knowledgeData.length > 0 ? knowledgeData : this.originalKnowledgeOptions
              this.knowledgeList = this.extractLabelsFromTree(sourceTree)
            }
          } else if (Array.isArray(res.data)) {
            // 兼容旧格式：直接返回数组
            let knowledgeData = res.data || []
            this.originalKnowledgeOptions = knowledgeData
            if (subject) {
              knowledgeData = this.filterKnowledgeBySubject(knowledgeData, subject, [])
            }
            knowledgeData = this.sortTreeData(knowledgeData)
            this.knowledgeOptions = knowledgeData
            // 从树形数据中提取所有标签
            this.knowledgeList = this.extractLabelsFromTree(knowledgeData)
          } else {
            console.error('知识点数据格式不正确:', res.data)
            this.knowledgeOptions = []
            this.originalKnowledgeOptions = []
            this.knowledgeList = []
          }
        } else {
          console.error('获取知识点列表失败:', res)
          this.knowledgeOptions = []
          this.originalKnowledgeOptions = []
          this.knowledgeList = []
        }
      }).catch(error => {
        console.error('获取知识点列表失败:', error)
        this.knowledgeOptions = []
        this.originalKnowledgeOptions = []
        this.knowledgeList = []
      })
    },
    
    // 从树形数据中提取所有标签
    extractLabelsFromTree(treeData) {
      const labels = []
      const traverse = (nodes) => {
        if (!Array.isArray(nodes)) return
        nodes.forEach(node => {
          if (node && node.label) {
            labels.push(node.label)
          }
          if (node && node.children && Array.isArray(node.children)) {
            traverse(node.children)
          }
        })
      }
      traverse(treeData)
      return labels
    },
    
    // 根据搜索关键词过滤知识点列表
    filterKnowledgeList(keyword) {
      if (!keyword || !keyword.trim()) {
        return this.knowledgeList
      }
      const searchKey = keyword.trim().toLowerCase()
      return this.knowledgeList.filter(label => 
        label && label.toLowerCase().includes(searchKey)
      )
    },
    
    // 从知识点列表中查找对应的树节点
    findKnowledgeNodeByLabel(label) {
      const findNode = (nodes, targetLabel) => {
        for (const node of nodes) {
          if (node.label === targetLabel) {
            return node
          }
          if (node.children && Array.isArray(node.children)) {
            const found = findNode(node.children, targetLabel)
            if (found) return found
          }
        }
        return null
      }
      return findNode(this.originalKnowledgeOptions, label)
    },
    
    // 按科目过滤章节树，直接返回匹配科目的子节点
    filterBySubject(nodes, subject, currentPath = []) {
      if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        return []
      }
      
      for (const node of nodes) {
        if (!node || typeof node !== 'object' || !node.label) {
          continue
        }
        
        const newPath = [...currentPath, node.label]
        const nodeSubject = this.extractSubjectFromPath(newPath)
        
        // 检查当前节点是否匹配科目
        const matchesSubject = nodeSubject === subject || 
                              (nodeSubject && subject && nodeSubject.includes(subject)) ||
                              (subject && nodeSubject && subject.includes(nodeSubject))
        
        if (matchesSubject) {
          // 如果当前节点匹配科目，直接返回其子节点（如果有）
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            return node.children
          }
          // 如果没有子节点，返回当前节点本身
          return [node]
        }
        
        // 如果当前节点不匹配，继续递归查找子节点
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const result = this.filterBySubject(node.children, subject, newPath)
          if (result.length > 0) {
            return result
          }
        }
      }
      
      return []
    },
    
    // 按科目过滤知识点树，直接返回匹配科目的子节点
    filterKnowledgeBySubject(nodes, subject, currentPath = []) {
      if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        return []
      }
      
      for (const node of nodes) {
        if (!node || typeof node !== 'object' || !node.label) {
          continue
        }
        
        const newPath = [...currentPath, node.label]
        const nodeSubject = this.extractSubjectFromPath(newPath)
        
        // 检查当前节点是否匹配科目
        const matchesSubject = nodeSubject === subject || 
                              (nodeSubject && subject && nodeSubject.includes(subject)) ||
                              (subject && nodeSubject && subject.includes(nodeSubject))
        
        if (matchesSubject) {
          // 如果当前节点匹配科目，直接返回其子节点（如果有）
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            return node.children
          }
          // 如果没有子节点，返回当前节点本身
          return [node]
        }
        
        // 如果当前节点不匹配，继续递归查找子节点
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const result = this.filterKnowledgeBySubject(node.children, subject, newPath)
          if (result.length > 0) {
            return result
          }
        }
      }
      
      return []
    },
    
    // 加载教师信息
    loadTeacherInfo() {
      getTeacherInfo().then(res => {
        if (res.code === 200) {
          // 将教师信息保存到 store，store 会自动计算年级、学科和年级+学科
          this.$store.commit('setTeacherInfo', res.data)
          this.teacherInfo = res.data
          this.isAdmin = this.checkIsAdmin()
        } else {
          console.error('获取教师信息失败:', res)
        }
      }).catch(error => {
        console.error('获取教师信息失败:', error)
      })
    },
    
    // 检查是否为管理员
    checkIsAdmin() {
      const roles = this.$store.getters.roles || []
      return roles.some(role => role.includes('admin') || role.includes('管理员'))
    },
    
    // 加载教辅材料科目选项
    loadMaterialSubjectOptions() {
      const supportedSubjects = getSupportedSubjects()
      this.materialSubjectOptions = supportedSubjects.map(subject => ({
        label: subject,
        value: subject
      }))
    },
    
    // 过滤最后一级节点
    filterLastLevelNodes(nodes, currentPath = []) {
      if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        console.warn('filterLastLevelNodes: 输入数据无效', nodes)
        return []
      }
      
      return nodes.map(node => {
        if (!node || typeof node !== 'object') {
          console.warn('filterLastLevelNodes: 节点数据无效', node)
          return null
        }
        
        if (!node.label) {
          console.warn('filterLastLevelNodes: 节点缺少label', node)
          return null
        }
        
        const newPath = [...currentPath, node.label]
        const subjectName = this.extractSubjectFromPath(newPath)
        
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const filteredChildren = this.filterLastLevelNodes(node.children, newPath)
          return {
            ...node,
            children: filteredChildren
          }
        }
        
        if (this.isChineseOrEnglish(subjectName)) {
          return node
        } else {
          return null
        }
      }).filter(node => node !== null)
    },
    
    // 从路径中提取科目名称
    extractSubjectFromPath(path) {
      if (!Array.isArray(path)) {
        return ''
      }
      
      // 如果路径长度小于2，说明还没有到学科层级，返回空字符串（不打印警告）
      if (path.length < 2) {
        return ''
      }
      
      // 检查路径元素是否有效
      if (!path[0] || !path[1]) {
        return ''
      }
      
      return String(path[0]) + String(path[1])
    },
    
    // 判断是否为语文或英语科目
    isChineseOrEnglish(subjectName) {
      if (!subjectName || typeof subjectName !== 'string') {
        return false
      }
      
      const lowerSubject = subjectName.toLowerCase()
      return lowerSubject.includes('语文') || 
             lowerSubject.includes('英语') || 
             lowerSubject.includes('chinese') || 
             lowerSubject.includes('english')
    },
    
    // 加载题型列表
    loadQuestionTypes() {
      let subjectName = '高中生物'
      
      // 优先使用顶部选择的科目（管理员选择或老师科目）
      if (this.isAdmin && this.selectedSubject) {
        subjectName = this.selectedSubject
      } else if (!this.isAdmin && this.teacherSubjectName) {
        subjectName = this.teacherSubjectName
      } else if (this.dataSourceType === 'chapter' && this.currentChapter) {
        // 如果没有选择科目，尝试从章节路径中提取
        const chapterPath = this.buildChapterPath(this.currentChapter)
        const pathParts = chapterPath.split('/')
        if (pathParts.length >= 2) {
          subjectName = pathParts[0] + pathParts[1]
        } else if (pathParts.length === 1) {
          subjectName = pathParts[0]
        }
      } else if (this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        // 如果没有选择科目，尝试从知识点路径中提取
        const knowledgePath = this.buildKnowledgePath(this.currentKnowledge)
        const pathParts = knowledgePath.split('/')
        if (pathParts.length >= 2) {
          subjectName = pathParts[0] + pathParts[1]
        } else if (pathParts.length === 1) {
          subjectName = pathParts[0]
        }
      } else if (this.dataSourceType === 'material') {
        if (this.isAdmin && this.selectedSubjectForMaterial) {
          subjectName = this.selectedSubjectForMaterial
        } else if (!this.isAdmin && this.teacherSubjectName) {
          subjectName = this.teacherSubjectName
        } else {
          subjectName = '高中通用'
        }
      }
      
      // 如果没有科目信息，给出提示
      if (!subjectName || subjectName === '高中生物') {
        console.warn('无法确定科目，使用默认科目获取题型')
      }
      
      getQuestionTypes(subjectName).then(res => {
        if (res.message === 'success' && res.question_types) {
          this.questionTypes = Object.keys(res.question_types).map(name => ({
            name,
            count: res.question_types[name]
          }))
        } else {
          console.error('获取题型列表失败:', res)
          this.questionTypes = []
        }
      }).catch(error => {
        console.error('获取题型列表失败:', error)
        this.questionTypes = []
      })
    },
    
    // 数据源切换
    switchDataSource(type) {
      this.dataSourceType = type
      this.currentChapter = null
      this.currentKnowledge = null
      this.currentMaterial = null
      this.allQuestions = []
      this.filteredQuestions = []
      // 重置分页信息
      this.pagination = {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
      
      if (type === 'material') {
        // 切换到教辅材料时，根据用户类型设置科目并加载教辅材料列表
        if (this.isAdmin && this.selectedSubject) {
          // 管理员：使用选择的科目
          this.selectedSubjectForMaterial = this.selectedSubject
          this.loadMaterialList()
        } else if (!this.isAdmin && this.teacherSubjectName) {
          // 老师：使用教师科目
          this.selectedSubjectForMaterial = this.teacherSubjectName
          this.loadMaterialList()
        } else {
          // 没有科目信息，清空教辅材料列表
          this.selectedSubjectForMaterial = null
          this.materialOptions = []
        }
      }
      // 所有数据源类型切换时，如果有科目，都立即加载题型
      if ((this.isAdmin && this.selectedSubject) || (!this.isAdmin && this.teacherSubjectName)) {
        this.loadQuestionTypes()
      }
    },
    
    // 章节点击处理
    handleChapterClick(data, node) {
      this.currentChapter = data
      // 重置分页到第一页
      this.pagination.pageNum = 1
      this.loadQuestionsByChapter(data, 1, this.pagination.pageSize)
      this.loadQuestionTypes()
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },
    
    // 知识点点击处理
    handleKnowledgeClick(data, node) {
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
    
    // 教辅材料点击处理
    handleMaterialClick(data, node) {
      this.currentMaterial = data
      // 重置分页到第一页
      this.pagination.pageNum = 1
      this.loadQuestionsByMaterial(data, 1, this.pagination.pageSize)
      this.loadQuestionTypes()
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },
    
    // 通过章节加载题目
    loadQuestionsByChapter(chapter, pageNum = 1, pageSize = 10) {
      this.pagination.pageNum = pageNum
      this.pagination.pageSize = pageSize
      
      getQuestionsByChapterPath(chapter.value, pageNum, pageSize).then(res => {
        let questions = []
        let total = 0
        
        // 处理响应数据
        if (res.questions && Array.isArray(res.questions)) {
          questions = res.questions
        } else if (res.data && Array.isArray(res.data)) {
          questions = res.data
        } else if (Array.isArray(res)) {
          questions = res
        }
        
        // 获取总数
        if (res.statistics && res.statistics.total_questions) {
          total = res.statistics.total_questions
        } else if (res.total) {
          total = res.total
        } else {
          total = questions.length
        }
        
        this.allQuestions = questions
        this.filteredQuestions = [...this.allQuestions]
        this.pagination.total = total
        this.filterQuestions()
        
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
      }).catch(error => {
        console.error('获取题目失败:', error)
        this.$message.error('获取题目失败')
        this.allQuestions = []
        this.filteredQuestions = []
        this.pagination.total = 0
      })
    },
    
    // 通过知识点加载题目
    loadQuestionsByKnowledge(knowledge, pageNum = 1, pageSize = 10) {
      this.pagination.pageNum = pageNum
      this.pagination.pageSize = pageSize
      
      const knowledgePath = this.buildKnowledgePath(knowledge)
      const requestData = knowledgePath ? { 
        a: knowledgePath,
        pageNum: pageNum,
        pageSize: pageSize
      } : {
        pageNum: pageNum,
        pageSize: pageSize
      }
      
      listSid(requestData).then(res => {
        let questions = []
        let total = 0
        
        // 处理响应数据
        if (res.questions && Array.isArray(res.questions)) {
          questions = res.questions
        } else if (res.data && Array.isArray(res.data)) {
          questions = res.data
        } else if (Array.isArray(res)) {
          questions = res
        }
        
        // 获取总数
        if (res.statistics && res.statistics.total_questions) {
          total = res.statistics.total_questions
        } else if (res.total) {
          total = res.total
        } else {
          total = questions.length
        }
        
        this.allQuestions = questions
        this.filteredQuestions = [...this.allQuestions]
        this.pagination.total = total
        this.filterQuestions()
        
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
      }).catch(error => {
        console.error('获取题目失败:', error)
        this.$message.error('获取题目失败: ' + (error.message || '网络错误'))
        this.allQuestions = []
        this.filteredQuestions = []
        this.pagination.total = 0
      })
    },
    
    // 通过教辅材料加载题目
    loadQuestionsByMaterial(material, pageNum = 1, pageSize = 10) {
      this.pagination.pageNum = pageNum
      this.pagination.pageSize = pageSize
      
      let seriesId = material.id
      let seriesPath = this.buildMaterialPath(material)
      
      if (material.parentId) {
        seriesId = material.parentId
      }
      
      const requestData = {
        series_conditions: {
          series: parseInt(seriesId),
          series_path: seriesPath
        },
        pagination: {
          page: pageNum,
          per_page: pageSize
        }
      }
      
      searchBySeries(requestData).then(res => {
        let questions = []
        let total = 0
        
        // 处理响应数据
        if (res && res.questions && Array.isArray(res.questions)) {
          questions = res.questions
        } else if (res && res.data && Array.isArray(res.data)) {
          questions = res.data
        } else if (res && Array.isArray(res)) {
          questions = res
        }
        
        // 获取总数
        if (res && res.statistics && res.statistics.total_questions) {
          total = res.statistics.total_questions
        } else if (res && res.total) {
          total = res.total
        } else {
          total = questions.length
        }
        
        this.allQuestions = questions
        this.filteredQuestions = [...this.allQuestions]
        this.pagination.total = total
        
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
        
        this.$message.success(`找到 ${total} 道题目，当前显示 ${questions.length} 道`)
      }).catch(error => {
        console.error('获取教辅材料题目失败:', error)
        this.$message.error('获取教辅材料题目失败: ' + (error.message || '网络错误'))
        this.allQuestions = []
        this.filteredQuestions = []
        this.pagination.total = 0
      })
    },
    
    // 构建章节路径
    buildChapterPath(chapter) {
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
      return findPath(this.chapterOptions, chapter.value) || chapter.label
    },
    
    // 构建知识点路径（使用原始完整数据，包含年级和科目）
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
      // 优先从原始完整数据中查找路径（包含年级和科目）
      if (this.originalKnowledgeOptions && this.originalKnowledgeOptions.length > 0) {
        const fullPath = findPath(this.originalKnowledgeOptions, knowledge.value)
        if (fullPath) {
          return fullPath
        }
      }
      // 如果原始数据中没有找到，再从过滤后的数据中查找（作为备选）
      return findPath(this.knowledgeOptions, knowledge.value) || knowledge.label
    },
    
    // 构建教辅材料路径
    buildMaterialPath(material) {
      const findPath = (materials, targetId, path = []) => {
        for (let mat of materials) {
          const currentPath = [...path, mat.label]
          
          if (mat.id === targetId) {
            return currentPath
          }
          
          if (mat.children && mat.children.length > 0) {
            const foundPath = findPath(mat.children, targetId, currentPath)
            if (foundPath) {
              return foundPath
            }
          }
        }
        return null
      }
      
      const fullPath = findPath(this.materialOptions, material.id)
      
      if (fullPath && fullPath.length > 1) {
        const lastNode = fullPath[fullPath.length - 1]
        const expectedNode = material.title || material.label
        
        if (lastNode !== expectedNode) {
          return expectedNode
        }
        
        return fullPath.slice(1).join('/')
      }
      
      return material.title || material.label || `节点${material.id}`
    },
    
    // 加载教辅材料列表
    loadMaterialList() {
      this.loadingMaterials = true
      
      const queryParams = {}
      
      if (!this.isAdmin) {
        if (this.teacherSubjectName) {
          queryParams.subjectName = this.teacherSubjectName
        } else {
          setTimeout(() => {
            this.loadMaterialList()
          }, 500)
          return
        }
      } else if (this.selectedSubjectForMaterial) {
        queryParams.subjectName = this.selectedSubjectForMaterial
      }
      
      listSeries(queryParams).then(res => {
        if (res.code === 200 && res.rows) {
          this.originalMaterialOptions = this.buildMaterialTree(res.rows)
          this.applyMaterialFilters()
        } else {
          console.error('获取教辅材料列表失败:', res)
          this.originalMaterialOptions = []
          this.materialOptions = []
        }
      }).catch(error => {
        console.error('获取教辅材料列表失败:', error)
        this.originalMaterialOptions = []
        this.materialOptions = []
      }).finally(() => {
        this.loadingMaterials = false
      })
    },
    
    // 应用教辅材料筛选条件
    applyMaterialFilters() {
      if (!this.originalMaterialOptions || this.originalMaterialOptions.length === 0) {
        this.materialOptions = []
        return
      }

      let filteredMaterials = [...this.originalMaterialOptions]

      if (this.selectedSeriesType) {
        filteredMaterials = filteredMaterials.filter(material => {
          return material.type === this.selectedSeriesType
        })
      }

      if (this.seriesSearchKeyword) {
        const keyword = this.seriesSearchKeyword.toLowerCase()
        filteredMaterials = filteredMaterials.filter(material => {
          const seriesMatch = material.series && material.series.toLowerCase().includes(keyword)
          const labelMatch = material.label && material.label.toLowerCase().includes(keyword)
          return seriesMatch || labelMatch
        })
      }

      this.materialOptions = filteredMaterials
    },
    
    // 构建教辅材料树
    buildMaterialTree(materials) {
      return materials.map(material => {
        const treeNode = {
          id: material.id,
          label: material.series || material.subjectName || `教辅材料${material.id}`,
          series: material.series,
          subjectName: material.subjectName,
          type: material.type,
          contents: material.contents,
          children: []
        }
        
        if (material.contents) {
          try {
            let contents = material.contents
            if (typeof contents === 'string') {
              contents = JSON.parse(contents)
            }
            
            if (Array.isArray(contents)) {
              treeNode.children = this.parseContentsToTree(contents, material.id)
            } else if (contents && typeof contents === 'object') {
              treeNode.children = this.parseContentsToTree([contents], material.id)
            }
          } catch (e) {
            console.error('解析教辅材料contents失败:', e, '原始数据:', material.contents)
          }
        }
        
        return treeNode
      })
    },
    
    // 解析 contents 为树形结构
    parseContentsToTree(contents, parentId = null) {
      return contents.map((item, index) => {
        const node = {
          id: `${item.id || index}`,
          label: item.title || `章节${index + 1}`,
          title: item.title,
          level: item.level || 1,
          parentId: parentId,
          children: []
        }
        
        if (item.children && Array.isArray(item.children)) {
          node.children = this.parseContentsToTree(item.children, parentId)
        }
        
        return node
      })
    },
    
    // 科目变更处理
    onSubjectChange(subjectCode) {
      if (!this.isAdmin) {
        this.$message.warning('只有管理员可以选择科目')
        return
      }
      this.selectedSubjectForMaterial = subjectCode
      this.selectedSeriesType = ''
      this.seriesSearchKeyword = ''
      this.currentMaterial = null
      this.allQuestions = []
      this.filteredQuestions = []
      this.loadMaterialList()
    },
    
    // 系列类型变化处理
    onSeriesTypeChange(seriesType) {
      this.selectedSeriesType = seriesType
      this.applyMaterialFilters()
    },
    
    // 系列搜索处理
    onSeriesSearch(keyword) {
      this.seriesSearchKeyword = keyword
      this.applyMaterialFilters()
    },
    
    // 筛选题目
    filterQuestions() {
      let filtered = [...this.allQuestions]
      
      if (this.questionType) {
        filtered = filtered.filter(question => {
          const questionType = this.getQuestionType(question)
          return questionType.toLowerCase() === this.questionType.toLowerCase()
        })
      }
      
      if (this.difficultyLevel) {
        filtered = filtered.filter(question => {
          const difficulty = this.getDifficultyLevel(question.difficulty || question.degree || question.Degree)
          return difficulty === this.difficultyLevel
        })
      }
      
      if (this.questionSearch) {
        filtered = filtered.filter(question => 
          question.question.toLowerCase().includes(this.questionSearch.toLowerCase()) ||
          this.getQuestionType(question).toLowerCase().includes(this.questionSearch.toLowerCase())
        )
      }
      
      this.filteredQuestions = filtered
    },
    
    // 获取题目类型
    getQuestionType(question) {
      return question.cate || question.catename || question.CateName || question.qtype || '未知题型'
    },
    
    // 获取难度等级
    getDifficultyLevel(difficulty) {
      const diff = parseFloat(difficulty)
      if (diff > 0 && diff <= 0.2) return 'hard'
      if (diff > 0.2 && diff <= 0.4) return 'harder'
      if (diff > 0.4 && diff <= 0.6) return 'medium'
      if (diff > 0.6 && diff <= 0.8) return 'easier'
      if (diff > 0.8 && diff <= 1) return 'easy'
      return 'medium'
    },
    
    // 从章节获取科目
    getSubjectFromChapter(question) {
      let path = ''
      
      if (this.dataSourceType === 'chapter' && this.currentChapter) {
        path = this.buildChapterPath(this.currentChapter)
      } else if (this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        path = this.buildKnowledgePath(this.currentKnowledge)
      } else if (this.dataSourceType === 'material') {
        if (this.isAdmin && this.selectedSubjectForMaterial) {
          return this.selectedSubjectForMaterial
        } else if (!this.isAdmin && this.teacherSubjectName) {
          return this.teacherSubjectName
        } else {
          return '高中通用'
        }
      }
      
      if (path) {
        const pathParts = path.split('/')
        if (pathParts.length >= 2) {
          return pathParts[0] + pathParts[1]
        } else if (pathParts.length === 1) {
          return pathParts[0]
        }
      }
      
      return '高中生物'
    },
    
    // 重置题目列表滚动条（需要在子组件中实现）
    resetQuestionListScroll() {
      // 子组件需要实现此方法
    },
    
    // 获取日志表名（需要在子组件中实现）
    getLogTableName() {
      // 子组件需要实现此方法，返回 '作业' 或 '组卷' 等
      return '题目'
    },
    
    // 处理分页切换
    handlePaginationChange(pageData) {
      if (!pageData || typeof pageData !== 'object') {
        return
      }
      
      const pageNum = pageData.page || pageData.pageNum || 1
      const pageSize = pageData.limit || pageData.pageSize || 10
      
      // 根据当前数据源类型重新加载数据
      if (this.dataSourceType === 'chapter' && this.currentChapter) {
        this.loadQuestionsByChapter(this.currentChapter, pageNum, pageSize)
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      } else if (this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        this.loadQuestionsByKnowledge(this.currentKnowledge, pageNum, pageSize)
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      } else if (this.dataSourceType === 'material' && this.currentMaterial) {
        this.loadQuestionsByMaterial(this.currentMaterial, pageNum, pageSize)
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      }
    },
    
    /**
     * 对树形数据进行排序
     * @param {Array} treeData - 树形数据
     * @returns {Array} - 排序后的树形数据
     */
    sortTreeData(treeData) {
      if (!Array.isArray(treeData)) return treeData
      
      // 扩展的中文数字映射（支持更多数字）
      const chineseNumbers = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
      }
      
      // 获取排序权重
      const getSortWeight = (label) => {
        if (!label || typeof label !== 'string') return 999999
        
        const labelTrimmed = label.trim()
        
        // 第一优先级：类型权重（必修 > 选修 > 其他）
        let typeWeight = 0
        if (labelTrimmed.includes('必修')) {
          typeWeight = 0
        } else if (labelTrimmed.includes('选修')) {
          typeWeight = 10000
        } else {
          typeWeight = 20000
        }
        
        // 第二优先级：提取数字
        let numberWeight = 9999
        
        // 1. 优先匹配"必修一"、"选修二"等模式
        let patternMatch = labelTrimmed.match(/(?:必修|选修)([一二三四五六七八九十]+|\d+)/)
        if (patternMatch) {
          const numStr = patternMatch[1]
          if (chineseNumbers[numStr] !== undefined) {
            numberWeight = chineseNumbers[numStr]
          } else if (!isNaN(numStr)) {
            numberWeight = parseInt(numStr)
          }
        } else {
          // 2. 匹配"第一章"、"第二章"等模式
          patternMatch = labelTrimmed.match(/第([一二三四五六七八九十]+|\d+)章/)
          if (patternMatch) {
            const numStr = patternMatch[1]
            if (chineseNumbers[numStr] !== undefined) {
              numberWeight = chineseNumbers[numStr]
            } else if (!isNaN(numStr)) {
              numberWeight = parseInt(numStr)
            }
          } else {
            // 3. 匹配"第X节"、"第X单元"等
            patternMatch = labelTrimmed.match(/第([一二三四五六七八九十]+|\d+)[节单元]/)
            if (patternMatch) {
              const numStr = patternMatch[1]
              if (chineseNumbers[numStr] !== undefined) {
                numberWeight = chineseNumbers[numStr]
              } else if (!isNaN(numStr)) {
                numberWeight = parseInt(numStr)
              }
            } else {
              // 4. 尝试匹配开头的数字（如"1.1"、"2.3"等）
              patternMatch = labelTrimmed.match(/^(\d+)\.(\d+)/)
              if (patternMatch) {
                const major = parseInt(patternMatch[1])
                const minor = parseInt(patternMatch[2])
                numberWeight = major * 1000 + minor
              } else {
                // 5. 尝试匹配中文数字（按长度从长到短，避免"十"匹配到"十一"中的"十"）
                const sortedKeys = Object.keys(chineseNumbers).sort((a, b) => b.length - a.length)
                for (const key of sortedKeys) {
                  if (labelTrimmed.includes(key)) {
                    numberWeight = chineseNumbers[key]
                    break
                  }
                }
                
                // 6. 如果还没找到，尝试匹配阿拉伯数字
                if (numberWeight === 9999) {
                  const numberMatch = labelTrimmed.match(/(\d+)/)
                  if (numberMatch) {
                    numberWeight = parseInt(numberMatch[1])
                  }
                }
              }
            }
          }
        }
        
        return typeWeight + numberWeight
      }
      
      // 递归排序函数
      const sortNodes = (nodes) => {
        if (!Array.isArray(nodes)) return nodes
        
        // 对当前层级排序
        const sorted = [...nodes].sort((a, b) => {
          const weightA = getSortWeight(a.label)
          const weightB = getSortWeight(b.label)
          
          if (weightA !== weightB) {
            return weightA - weightB
          }
          
          // 如果权重相同，按label中文字符顺序排序
          return (a.label || '').localeCompare(b.label || '', 'zh-CN')
        })
        
        // 递归排序子节点
        return sorted.map(node => {
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            return {
              ...node,
              children: sortNodes(node.children)
            }
          }
          return node
        })
      }
      
      return sortNodes(treeData)
    }
  }
}

