<template>
  <div class="app-container">
    <div class="paper-builder">
      <!-- 左侧：数据源选择区域 -->
      <DataSourceSelector
        :data-source-type="dataSourceType"
        :chapter-options="chapterOptions"
        :knowledge-options="knowledgeOptions"
        :material-options="materialOptions"
        :loading-materials="loadingMaterials"
        :is-admin="isAdmin"
        :teacher-subject-name="teacherSubjectName"
        :selected-subject-for-material="selectedSubjectForMaterial"
        :material-subject-options="materialSubjectOptions"
        :selected-series-type="selectedSeriesType"
        :series-search-keyword="seriesSearchKeyword"
        :series-type-options="seriesTypeOptions"
        @switch-data-source="switchDataSource"
        @chapter-click="handleChapterClick"
        @knowledge-click="handleKnowledgeClick"
        @material-click="handleMaterialClick"
        @subject-change="onSubjectChange"
        @series-type-change="onSeriesTypeChange"
        @series-search="onSeriesSearch"
      >
        <!-- 拍照搜题插槽 -->
        <template #photo-search>
          <PhotoSearch
            :is-admin="isAdmin"
            :teacher-subject-name="teacherSubjectName"
            @search-success="handlePhotoSearchSuccess"
            @search-error="handlePhotoSearchError"
          />
        </template>
        
        <!-- 菁优网搜题插槽 -->
        <template #third-party-search>
          <ThirdPartySearch
            :is-admin="isAdmin"
            :teacher-subject-name="teacherSubjectName"
            :knowledge-options="knowledgeOptions"
            @search-success="handleThirdPartySearchSuccess"
            @search-error="handleThirdPartySearchError"
          />
        </template>
      </DataSourceSelector>

      <!-- 中间：题目展示区域 -->
      <QuestionList
        ref="questionListRef"
        :questions="filteredQuestions"
        :question-types="questionTypes"
        :selected-questions="selectedQuestions"
        :process-question-content="processQuestionContent"
        @show-analysis="showAnalysis"
        @add-to-paper="addToPaper"
      />

      <!-- 右侧：试卷信息区域 -->
      <div class="right-panel">
        <!-- 试卷信息 -->
        <PaperInfo
          :form="form"
          :subject-options="subjectOptions"
          :selected-questions="selectedQuestions"
          @generate-paper="generatePaper"
        />

        <!-- 已选题目 -->
        <SelectedQuestions
          :selected-questions="selectedQuestions"
          :process-question-content="processQuestionContent"
          @show-analysis="showAnalysis"
          @remove-from-paper="removeFromPaper"
        />
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
  </div>
</template>

<script>
import { addPaper, getQuestionDetail, getQuestionDetailByKnowledge } from "@/api/system/paper"
import latexRenderer from '@/utils/latexRenderer'
import { addLog } from "@/api/system/log.js"
import '@/assets/styles/latex-renderer.scss'

// 导入组件
import DataSourceSelector from '@/components/PaperBuilder/DataSourceSelector.vue'
import QuestionList from '@/components/PaperBuilder/QuestionList.vue'
import PaperInfo from '@/components/PaperBuilder/PaperInfo.vue'
import SelectedQuestions from '@/components/PaperBuilder/SelectedQuestions.vue'
import QuestionAnalysisDialog from '@/components/PaperBuilder/QuestionAnalysisDialog.vue'
import PhotoSearch from '@/components/PaperBuilder/PhotoSearch.vue'
import ThirdPartySearch from '@/components/PaperBuilder/ThirdPartySearch.vue'
import questionSearchMixin from '@/components/PaperBuilder/questionSearchMixin.js'

export default {
  name: "AddPaper",
  mixins: [questionSearchMixin],
  components: {
    DataSourceSelector,
    QuestionList,
    PaperInfo,
    SelectedQuestions,
    QuestionAnalysisDialog,
    PhotoSearch,
    ThirdPartySearch
  },
  data() {
    return {
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
      loadingDetail: false
    }
  },
  created() {
    // mixin 中的方法
    this.getSubjectOptions()
    this.loadChapterList()
    this.loadKnowledgeList()
    this.loadTeacherInfo()
    this.loadMaterialSubjectOptions()
  },
  methods: {
    // 处理拍照搜题成功
    handlePhotoSearchSuccess(questions) {
      this.allQuestions = questions || []
      this.filteredQuestions = [...this.allQuestions]
      this.filterQuestions()
      // 记录日志
      if (this.filteredQuestions.length > 0) {
        const ids = this.filteredQuestions.map(item => item.sid).join(',')
        addLog({
          calledTableName: '组卷',
          calledTableId: ids,
          isRead: 1,
          isClickRead: 0,
          isUsed: 0
        })
      }
      // 重置滚动条
      this.$nextTick(() => {
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
      this.filterQuestions()
      // 记录日志
      if (this.filteredQuestions.length > 0) {
        const ids = this.filteredQuestions.map(item => item.sid).join(',')
        addLog({
          calledTableName: '组卷',
          calledTableId: ids,
          isRead: 1,
          isClickRead: 0,
          isUsed: 0
        })
      }
      // 重置滚动条
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },
    
    // 处理菁优网搜题错误
    handleThirdPartySearchError(error) {
      this.allQuestions = []
      this.filteredQuestions = []
    },
    
    // mixin 中已包含的方法，这里只需要实现特有的方法
    loadTeacherInfo() {
      // 获取教师信息
      getTeacherInfo().then(res => {
        if (res.code === 200) {
          this.teacherInfo = res.data
          // 组合科目名称：年级 + 科目
          if (res.data.grade && res.data.subjectNames) {
            this.teacherSubjectName = res.data.grade + res.data.subjectNames
          }
          // 检查是否为管理员（可以根据角色或其他标识判断）
          this.isAdmin = this.checkIsAdmin()
        } else {
          console.error('获取教师信息失败:', res)
        }
      }).catch(error => {
        console.error('获取教师信息失败:', error)
      })
    },
    checkIsAdmin() {
      // 检查用户角色，判断是否为管理员
      const roles = this.$store.getters.roles || []
      return roles.some(role => role.includes('admin') || role.includes('管理员'))
    },
    loadMaterialSubjectOptions() {
      // 从questionTypeMappings获取支持的学科列表
      const supportedSubjects = getSupportedSubjects()
      this.materialSubjectOptions = supportedSubjects.map(subject => ({
        label: subject,
        value: subject
      }))
    },
         loadChapterList() {
       // 加载真正的章节树结构
       getChapterMap().then(res => {
         console.log('章节数据API响应:', res)
         
         if (res && res.code === 200) {
           // 检查返回的数据是否有效
           if (res.data && Array.isArray(res.data)) {
             // 过滤掉最后一级的节点（知识点节点），只保留章节节点
             // 语文和英语可以选到底层节点，其他科目只能选到底层上一层
             this.chapterOptions = this.filterLastLevelNodes(res.data, [])
             console.log('处理后的章节选项:', this.chapterOptions)
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
         // 添加一些默认章节数据，避免界面空白
         this.chapterOptions = []
       })
     },
     loadKnowledgeList() {
       // 加载知识点列表 - 使用知识点专用API
       sysGetchaptermap().then(res => {
         if (res.code === 200) {
           let knowledgeData = res.data || []
           // 保存原始完整知识点数据（包含年级和科目）
           this.originalKnowledgeOptions = knowledgeData
           this.knowledgeOptions = knowledgeData
         } else {
           console.error('获取知识点列表失败:', res)
           this.knowledgeOptions = []
           this.originalKnowledgeOptions = []
         }
       }).catch(error => {
         console.error('获取知识点列表失败:', error)
         this.knowledgeOptions = []
         this.originalKnowledgeOptions = []
       })
     },
     // 过滤掉最后一级的节点（知识点节点）
     // 语文和英语可以选到底层节点，其他科目只能选到底层上一层
     filterLastLevelNodes(nodes, currentPath = []) {
       // 严格的null和类型检查
       if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
         console.warn('filterLastLevelNodes: 输入数据无效', nodes)
         return []
       }
       
       return nodes.map(node => {
         // 检查节点是否有效
         if (!node || typeof node !== 'object') {
           console.warn('filterLastLevelNodes: 节点数据无效', node)
           return null
         }
         
         // 确保node.label存在
         if (!node.label) {
           console.warn('filterLastLevelNodes: 节点缺少label', node)
           return null
         }
         
         const newPath = [...currentPath, node.label]
         const subjectName = this.extractSubjectFromPath(newPath)
         
         // 如果节点有children，递归过滤children
         if (node.children && Array.isArray(node.children) && node.children.length > 0) {
           const filteredChildren = this.filterLastLevelNodes(node.children, newPath)
           // 保留这个节点，但使用过滤后的children
           return {
             ...node,
             children: filteredChildren
           }
         }
         
         // 对于叶子节点的处理
         // 语文和英语：保留所有叶子节点（可以选到底层）
         // 其他科目：过滤掉叶子节点（只能选到底层上一层）
         if (this.isChineseOrEnglish(subjectName)) {
           return node // 语文和英语保留叶子节点
         } else {
           return null // 其他科目过滤掉叶子节点
         }
       }).filter(node => node !== null) // 过滤掉null值
     },
     
     // 从路径中提取科目名称
     extractSubjectFromPath(path) {
       if (!Array.isArray(path) || path.length < 2) {
         console.warn('extractSubjectFromPath: 路径数据无效', path)
         return ''
       }
       
       // 检查路径元素是否有效
       if (!path[0] || !path[1]) {
         console.warn('extractSubjectFromPath: 路径元素无效', path)
         return ''
       }
       
       // 路径格式通常是 ["高中", "数学", "第一章", ...]
       // 提取学段和学科组合，如 "高中数学"
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
             loadQuestionTypes() {
      // 获取题型列表
      let subjectName = '高中生物' // 默认值
      
      if (this.dataSourceType === 'chapter' && this.currentChapter) {
        const chapterPath = this.buildChapterPath(this.currentChapter)
        const pathParts = chapterPath.split('/')
        // 根据路径格式 "高中/数学/第一章 基础概念"，需要提取出"高中数学"这样的格式
        if (pathParts.length >= 2) {
          // 取第一部分（学段）+ 第二部分（学科）组合成完整科目名称
          subjectName = pathParts[0] + pathParts[1] // 如"高中" + "数学" = "高中数学"
        } else if (pathParts.length === 1) {
          subjectName = pathParts[0] // 如果只有一部分，直接使用
        }
      } else if (this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        const knowledgePath = this.buildKnowledgePath(this.currentKnowledge)
        const pathParts = knowledgePath.split('/')
        if (pathParts.length >= 2) {
          subjectName = pathParts[0] + pathParts[1]
        } else if (pathParts.length === 1) {
          subjectName = pathParts[0]
        }
      } else if (this.dataSourceType === 'material') {
        // 对于教辅材料，使用当前选择的科目
        if (this.isAdmin && this.selectedSubjectForMaterial) {
          subjectName = this.selectedSubjectForMaterial
        } else if (!this.isAdmin && this.teacherSubjectName) {
          subjectName = this.teacherSubjectName
        } else {
          subjectName = '高中通用'
        }
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
      // 清空当前选择，但保留已选题目
      this.currentChapter = null
      this.currentKnowledge = null
      this.currentMaterial = null
      this.allQuestions = []
      this.filteredQuestions = []
      // 如果切换到教辅材料
      if (type === 'material') {
        // 切换到教辅材料时，根据用户类型设置科目并加载教辅材料列表
        if (this.isAdmin && this.selectedSubjectForMaterial) {
          // 管理员：如果已经选择了科目，直接加载教辅材料列表
          this.loadMaterialList()
        } else if (!this.isAdmin && this.teacherSubjectName) {
          // 老师：使用教师科目，自动加载教辅材料
          this.selectedSubjectForMaterial = this.teacherSubjectName
          this.loadMaterialList()
        } else {
          // 没有科目信息，清空教辅材料列表
          this.selectedSubjectForMaterial = null
          this.materialOptions = []
        }
      }
    },
    // 科目变更处理（仅管理员可用）
    onSubjectChange(subjectCode) {
      if (!this.isAdmin) {
        this.$message.warning('只有管理员可以选择科目')
        return
      }
      this.selectedSubjectForMaterial = subjectCode
      // 重置筛选条件
      this.selectedSeriesType = ''
      this.seriesSearchKeyword = ''
      // 清空当前教辅材料选择
      this.currentMaterial = null
      this.allQuestions = []
      this.filteredQuestions = []
      // 重新加载教辅材料列表
      this.loadMaterialList()
    },
    handleChapterClick(data, node) {
      this.currentChapter = data
      this.loadQuestionsByChapter(data)
      this.loadQuestionTypes() // 加载题型列表
      // 重置题目列表滚动条到顶部
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },
    handleKnowledgeClick(data, node) {
      this.currentKnowledge = data
      
      // 检查是否为叶子节点（没有子节点）
      if (!data.children || data.children.length === 0) {
        // 只有叶子节点才加载题目
        this.loadQuestionsByKnowledge(data)
        this.loadQuestionTypes() // 加载题型列表
        // 重置题目列表滚动条到顶部
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      } else {
        // 非叶子节点清空题目列表
        this.allQuestions = []
        this.filteredQuestions = []
        this.$message.info('请选择具体的知识点节点查看题目')
        // 重置题目列表滚动条到顶部
        this.$nextTick(() => {
          this.resetQuestionListScroll()
        })
      }
    },
    handleMaterialClick(data, node) {
      this.currentMaterial = data
      
      // 所有节点都可以选择并加载题目，因为都可能有题目
      this.loadQuestionsByMaterial(data)
      this.loadQuestionTypes() // 加载题型列表
      // 重置题目列表滚动条到顶部
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
    },
    loadQuestionsByChapter(chapter) {
      // 使用章节路径加载题目
      getQuestionsByChapterPath(chapter.value).then(res => {
        if (res.questions && Array.isArray(res.questions)) {
          this.allQuestions = res.questions
        } else if (res.data && Array.isArray(res.data)) {
          this.allQuestions = res.data
        } else if (Array.isArray(res)) {
          this.allQuestions = res
        } else {
          this.allQuestions = []
        }
        this.filteredQuestions = [...this.allQuestions]
        // 新增：查询后记录日志
        if (this.filteredQuestions.length > 0) {
          const ids = this.filteredQuestions.map(item => item.sid).join(',');
          addLog({
            calledTableName: '组卷',
            calledTableId: ids,
            isRead: 1,
            isClickRead: 0,
            isUsed: 0
          });
        }
      }).catch(error => {
        console.error('获取题目失败:', error)
        this.$message.error('获取题目失败')
        this.allQuestions = []
        this.filteredQuestions = []
      })
    },
    loadQuestionsByKnowledge(knowledge) {
      // 使用知识点路径加载题目 - 使用知识点专用API
      const knowledgePath = this.buildKnowledgePath(knowledge)
      
      // 尝试不同的参数传递方式
      const requestData = knowledgePath ? { a: knowledgePath } : {}
      
      listSid(requestData).then(res => {
        this.allQuestions = Array.isArray(res) ? res : []
        this.filteredQuestions = [...this.allQuestions]
        // 新增：查询后记录日志
        if (this.filteredQuestions.length > 0) {
          const ids = this.filteredQuestions.map(item => item.sid).join(',');
          addLog({
            calledTableName: '组卷',
            calledTableId: ids,
            isRead: 1,
            isClickRead: 0,
            isUsed: 0
          });
        }
      }).catch(error => {
        console.error('获取题目失败:', error)
        this.$message.error('获取题目失败: ' + (error.message || '网络错误'))
        this.allQuestions = []
        this.filteredQuestions = []
      })
    },
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
    loadMaterialList() {
      // 加载教辅材料列表
      this.loadingMaterials = true
      
      // 构建查询参数
      const queryParams = {}
      
      // 如果不是管理员，使用教师的科目名称
      if (!this.isAdmin) {
        if (this.teacherSubjectName) {
          queryParams.subjectName = this.teacherSubjectName
        } else {
          // 如果教师信息还没加载完成，等待一下再重试
          setTimeout(() => {
            this.loadMaterialList()
          }, 500)
          return
        }
      } else if (this.selectedSubjectForMaterial) {
        // 管理员可以选择特定科目，直接使用选择的科目名称
        queryParams.subjectName = this.selectedSubjectForMaterial
      }
      
      listSeries(queryParams).then(res => {
        if (res.code === 200 && res.rows) {
          // 处理教辅材料数据，构建树形结构
          this.originalMaterialOptions = this.buildMaterialTree(res.rows)
          // 应用当前的筛选条件
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

      // 按系列类型筛选
      if (this.selectedSeriesType) {
        filteredMaterials = filteredMaterials.filter(material => {
          return material.type === this.selectedSeriesType
        })
      }

      // 按系列名称搜索
      if (this.seriesSearchKeyword) {
        const keyword = this.seriesSearchKeyword.toLowerCase()
        filteredMaterials = filteredMaterials.filter(material => {
          // 检查系列名称是否包含关键词
          const seriesMatch = material.series && material.series.toLowerCase().includes(keyword)
          // 检查标签是否包含关键词
          const labelMatch = material.label && material.label.toLowerCase().includes(keyword)
          return seriesMatch || labelMatch
        })
      }

      this.materialOptions = filteredMaterials
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
    buildMaterialTree(materials) {
      // 构建教辅材料树形结构
      return materials.map(material => {
        const treeNode = {
          id: material.id,
          label: material.series || material.subjectName || `教辅材料${material.id}`,
          series: material.series,
          subjectName: material.subjectName,
          type: material.type, // 保存系列类型
          contents: material.contents,
          children: []
        }
        
        // 解析contents字段，构建章节树
        if (material.contents) {
          try {
            // 处理可能的字符串格式
            let contents = material.contents
            if (typeof contents === 'string') {
              contents = JSON.parse(contents)
            }
            
            if (Array.isArray(contents)) {
              treeNode.children = this.parseContentsToTree(contents, material.id)
            } else if (contents && typeof contents === 'object') {
              // 如果contents是单个对象，包装成数组
              treeNode.children = this.parseContentsToTree([contents], material.id)
            }
          } catch (e) {
            console.error('解析教辅材料contents失败:', e, '原始数据:', material.contents)
          }
        }
        
        return treeNode
      })
    },
    parseContentsToTree(contents, parentId = null) {
      // 将contents解析为树形结构
      return contents.map((item, index) => {
        const node = {
          id: `${item.id || index}`,
          label: item.title || `章节${index + 1}`,
          title: item.title,
          level: item.level || 1,
          parentId: parentId, // 记录父级教辅材料ID
          children: []
        }
        
        // 如果有子章节，递归处理
        if (item.children && Array.isArray(item.children)) {
          node.children = this.parseContentsToTree(item.children, parentId)
        }
        
        return node
      })
    },
    buildMaterialPath(material) {
      // 构建教辅材料的完整章节路径
      
      // 递归查找父节点和构建完整路径
      const findPath = (materials, targetId, path = []) => {
        for (let mat of materials) {
          const currentPath = [...path, mat.label]
          
          // 检查当前节点是否为目标节点
          if (mat.id === targetId) {
            return currentPath
          }
          
          // 递归查找子节点
          if (mat.children && mat.children.length > 0) {
            const foundPath = findPath(mat.children, targetId, currentPath)
            if (foundPath) {
              return foundPath
            }
          }
        }
        return null
      }
      
      // 查找完整路径
      const fullPath = findPath(this.materialOptions, material.id)
      
      if (fullPath && fullPath.length > 1) {
        // 检查是否找到了正确的节点路径
        const lastNode = fullPath[fullPath.length - 1]
        const expectedNode = material.title || material.label
        
        // 如果路径最后节点与期望节点不匹配，说明找到了错误的路径
        if (lastNode !== expectedNode) {
          // 直接使用当前节点的标题，避免错误的路径匹配
          return expectedNode
        }
        
        // 返回章节路径，去掉书名（第一个元素），只保留章节层级
        const resultPath = fullPath.slice(1).join('/')
        return resultPath
      }
      
      // 如果找不到路径，返回当前节点的标题
      const fallbackPath = material.title || material.label || `节点${material.id}`
      return fallbackPath
    },
    loadQuestionsByMaterial(material) {
      // 使用教辅材料信息加载题目
      // 需要找到根级教辅材料的ID，而不是当前节点的ID
      let seriesId = material.id
      
      // 构建章节路径，只拼接上一级父节点名称，避免重复的子节点名字
      let seriesPath = this.buildMaterialPath(material)
      
      // 如果当前节点是子节点，需要找到父级教辅材料的ID
      if (material.parentId) {
        seriesId = material.parentId
      } else {
      }
      
      const requestData = {
        series_conditions: {
          series: parseInt(seriesId),
          series_path: seriesPath
        },
        pagination: {
          page: 1,
          per_page: 100
        }
      }
      
      searchBySeries(requestData).then(res => {
        // 处理响应数据
        let questions = []
        if (res && res.data && Array.isArray(res.data)) {
          questions = res.data
        } else if (res && Array.isArray(res)) {
          questions = res
        } else if (res && res.questions && Array.isArray(res.questions)) {
          questions = res.questions
        }
        
        this.allQuestions = questions
        this.filteredQuestions = [...this.allQuestions]
        
        // 查询后记录日志
        if (this.filteredQuestions.length > 0) {
          const ids = this.filteredQuestions.map(item => item.sid).join(',');
          addLog({
            calledTableName: '组卷',
            calledTableId: ids,
            isRead: 1,
            isClickRead: 0,
            isUsed: 0
          });
        }
        
        this.$message.success(`找到 ${questions.length} 道题目`)
      }).catch(error => {
        console.error('获取教辅材料题目失败:', error)
        this.$message.error('获取教辅材料题目失败: ' + (error.message || '网络错误'))
        this.allQuestions = []
        this.filteredQuestions = []
      })
    },
    showAnalysis(question) {
      this.currentQuestion = question
      this.analysisVisible = true
      this.loadingDetail = true
      this.questionDetail = null
      // 新增：解析记录日志
      addLog({
        calledTableName: '组卷',
        calledTableId: question.sid,
        isRead: 0,
        isClickRead: 1,
        isUsed: 0
      });
      
      // 构建新的API请求参数 - 使用知识点查询接口
      const requestData = {
        request: {
          node_ids: this.extractNodeIds(question),
          limit: 20
        },
        pagination: {
          page: 1,
          per_page: 50
        }
      }
      
      // 调用新的知识点查询API
      getQuestionDetailByKnowledge(requestData).then(res => {
        // 检查响应数据格式
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          // 新的API格式：{questions: [...]}，取第一个题目
          this.questionDetail = res.questions[0]
        } else if (res && res.question_count === 0) {
          // 如果没有找到题目，尝试使用原来的接口作为备选
          this.fallbackToOriginalAPI(question)
        } else {
          this.$message.error('获取题目详情失败: 数据格式错误')
        }
      }).catch(error => {
        console.error('知识点查询失败:', error)
        // 如果新接口失败，尝试使用原来的接口作为备选
        this.fallbackToOriginalAPI(question)
      }).finally(() => {
        this.loadingDetail = false
      })
    },
    closeAnalysis() {
      this.analysisVisible = false
      this.currentQuestion = null
      this.questionDetail = null
    },
    // 从题目对象中提取知识点ID
    extractNodeIds(question) {
      // 尝试从题目对象中提取知识点ID
      // 可能的字段名：node_id, knowledge_id, knowledge_code, topic等
      const possibleIds = [
        question.node_id,
        question.knowledge_id,
        question.knowledge_code,
        question.topic,
        question.knowledge_name
      ].filter(id => id && id.trim())
      
      // 如果找到了知识点ID，返回数组
      if (possibleIds.length > 0) {
        return possibleIds
      }
      
      // 如果没有找到，尝试从当前选中的知识点中获取
      if (this.currentKnowledge && this.currentKnowledge.value) {
        return [this.currentKnowledge.value]
      }
      
      // 如果都没有，返回默认值（可能需要根据实际情况调整）
      return ['0208010401b', '0208010402c'] // 使用图片中的示例值
    },
    
    // 备选方案：使用原来的API
    fallbackToOriginalAPI(question) {
      const requestData = {
        subject_name: this.getSubjectFromChapter(question),
        sids: [question.sid]
      }
      
      getQuestionDetail(requestData).then(res => {
        // 检查响应数据格式
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          // 新的API格式：{questions: [...]}，取第一个题目
          this.questionDetail = res.questions[0]
        } else if (res && res.SID) {
          // 直接返回题目详情数据
          this.questionDetail = res
        } else if (res && res.code === 200 && res.data) {
          // 标准格式：{code: 200, data: {...}}
          this.questionDetail = res.data
        } else if (res && res.Cate) {
          // 旧格式：直接返回题目详情数据
          this.questionDetail = res
        } else {
          this.$message.error('获取题目详情失败: 数据格式错误')
        }
      }).catch(error => {
        console.error('备选API也失败:', error)
        this.$message.error('获取题目详情失败: ' + (error.message || '网络错误'))
      })
    },
    addToPaper(question) {
      if (!this.isQuestionSelected(question.sid)) {
        this.selectedQuestions.push(question)
        // 新增：添加到试卷记录日志
        addLog({
          calledTableName: '组卷',
          calledTableId: question.sid,
          isRead: 0,
          isClickRead: 0,
          isUsed: 1
        });
      }
    },
    removeFromPaper(sid) {
      const index = this.selectedQuestions.findIndex(q => q.sid === sid)
      if (index > -1) {
        this.selectedQuestions.splice(index, 1)
      }
    },
    isQuestionSelected(sid) {
      return this.selectedQuestions.some(q => q.sid === sid)
    },
    generatePaper(form) {
      if (this.selectedQuestions.length === 0) {
        this.$message.warning('请先选择题目')
        return
      }

          // 构建提交数据
          const submitData = {
        subject: form.subject,
        customPaperName: form.customPaperName,
            questionIds: this.selectedQuestions.map(q => q.sid).join(','),
            knowledgePointIds: this.currentChapter ? this.buildChapterPath(this.currentChapter) : ''
          }

          addPaper(submitData).then(() => {
            this.$modal.msgSuccess('试卷生成成功')
            this.goBack()
          }).catch(error => {
            this.$message.error('试卷生成失败：' + error.message)
      })
    },
    getSubjectFromChapter(question) {
      // 根据当前选择的数据源类型提取科目信息
      let path = ''
      
      if (this.dataSourceType === 'chapter' && this.currentChapter) {
        path = this.buildChapterPath(this.currentChapter)
      } else if (this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        path = this.buildKnowledgePath(this.currentKnowledge)
      } else if (this.dataSourceType === 'material') {
        // 对于教辅材料，使用当前选择的科目
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
        // 根据路径格式 "高中/生物/必修一/第1章 走近"，需要提取出"高中生物"这样的格式
        if (pathParts.length >= 2) {
          // 取第一部分（学段）+ 第二部分（学科）组合成完整科目名称
          return pathParts[0] + pathParts[1] // 如"高中" + "生物" = "高中生物"
        } else if (pathParts.length === 1) {
          return pathParts[0] // 如果只有一部分，直接使用
        }
      }
      
      // 如果没有路径信息，返回默认值
      return '高中生物'
    },
    processQuestionContent(content) {
      return latexRenderer.processQuestionContent(content)
    },
    goBack() {
      this.$router.push('/student/paper')
      // 添加一个标记，表示需要刷新列表
      this.$store.commit('setNeedRefresh', true)
    },
    // 重置题目列表滚动条
    resetQuestionListScroll() {
      if (this.$refs.questionListRef) {
        this.$refs.questionListRef.resetScroll()
      }
    },
    
    // 获取日志表名（mixin 需要）
    getLogTableName() {
      return '组卷'
    }
  }
}
</script>

<style scoped>
.paper-builder {
  display: flex;
  height: calc(100vh - 200px);
  gap: 20px;
}

.right-panel {
  width: 350px;
  flex-shrink: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
}

/* LaTeX数学公式样式已移至 @/assets/styles/latex-renderer.scss */
</style>