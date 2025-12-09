/**
 * 题目搜索公共逻辑 Mixin
 * 用于提取 addCombinedHomework、addCombinedPaper 和 searchQuestions 的公共逻辑
 */
import { getQuestionDetail, getQuestionDetailByKnowledge, getQuestionTypes } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import { listQuestionFavorites, getAllLatestVersionsContents, getAllSubjectVersions, getDirectoryTree, getQuestionsByPath, searchProblems, getKnowledgeLeafNodes, getQuestionsByKnowledgeCodes } from "@/api/system/problems"
import { sysGetchaptermap } from "@/api/system/knowledge"
import { getQuestionsByChapterPath } from "@/api/system/chapterTitle"
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
      versionChapterOptions: [], // 版本内容章节选项
      versionOptions: [], // 版本下拉选项列表
      selectedVersion: '', // 当前选择的版本
      allVersionChapterOptions: [], // 所有版本的章节选项（用于过滤）
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
      // 搜索相关（用于章节搜索时的关键词、题型、难度）
      searchKeywords: '',
      searchQuestionType: '',
      searchDifficultyLevel: '',
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
    // 获取科目选项（通过 system/question/list 获取用户自身科目）
    async getSubjectOptions() {
      try {
        // 调用 system/question/list 接口获取用户自身的科目列表
        // 不传 subjectName 参数，接口会返回用户可访问的科目列表
        const res = await listQuestionFavorites({ pageNum: 1, pageSize: 0 })
        
        if (res && res.code === 200) {
          // 如果接口直接返回科目列表
          if (res.subjects && Array.isArray(res.subjects)) {
            this.subjectOptions = res.subjects
            return
          }
          
          if (res.data && res.data.subjects && Array.isArray(res.data.subjects)) {
            this.subjectOptions = res.data.subjects
            return
          }
          
          // 如果接口返回了题目数据，从题目中提取唯一的科目
          const rows = res.rows || res.data || []
          if (rows.length > 0) {
            const subjectMap = new Map()
            rows.forEach(item => {
              if (item.subjectName) {
                // 使用 subjectName 作为 key，避免重复
                if (!subjectMap.has(item.subjectName)) {
                  subjectMap.set(item.subjectName, {
                    subjectName: item.subjectName,
                    subjectCode: item.subjectCode || item.subjectName
                  })
                }
              }
            })
            
            if (subjectMap.size > 0) {
              this.subjectOptions = Array.from(subjectMap.values())
              return
            }
          }
        }
        
        // 如果无法从接口获取科目，回退到使用 listSubject 获取所有科目
        this.fallbackToAllSubjects()
      } catch (error) {
        console.error('通过 system/question/list 获取科目列表失败:', error)
        // 出错时回退到使用 listSubject
        this.fallbackToAllSubjects()
      }
    },
    
    // 回退方法：获取所有科目列表
    fallbackToAllSubjects() {
      listSubject().then(res => {
        this.subjectOptions = res.rows || []
      }).catch(error => {
        console.error('获取科目列表失败:', error)
        this.subjectOptions = []
      })
    },
    
    // 加载章节列表（使用版本内容API）
    loadChapterList(subject = null) {
      console.log('loadChapterList 被调用，subject:', subject)
      // 如果有科目，重新加载该科目的版本列表（不自动选择版本）
      if (subject) {
        this.loadVersionList(subject)
      }
      
      // 如果已选择版本，使用 getDirectoryTree 加载章节树
      if (this.selectedVersion) {
        this.loadChapterTreeByVersion(this.selectedVersion)
      } else {
        // 如果没有选择版本，使用旧的逻辑加载所有版本内容（作为备选）
        this.loadVersionContents(subject).then(() => {
          // 版本内容加载完成后，保存所有版本的章节数据
          this.allVersionChapterOptions = this.versionChapterOptions || []
          // 根据选择的版本过滤章节树（如果已选择版本）
          this.filterChapterOptionsByVersion()
        }).catch(error => {
          console.error('加载版本内容失败:', error)
          this.chapterOptions = []
        })
      }
    },
    
    // 加载版本列表（默认加载所有版本，不传科目参数）
    async loadVersionList(subject = null) {
      try {
        // 构建请求参数，如果有科目则传递，否则不传（获取所有版本）
        const requestData = subject ? { subjects: [subject] } : {}
        
        const response = await getAllSubjectVersions(requestData)
        
        // 处理不同的响应格式
        let subjectsData = null
        
        if (response && response.code === 200) {
          if (response.data && response.data.subjects) {
            subjectsData = response.data.subjects
          } else if (response.subjects) {
            subjectsData = response.subjects
          }
        } else if (response && response.subjects) {
          subjectsData = response.subjects
        }
        
        if (subjectsData && typeof subjectsData === 'object') {
          const versionList = []
          
          // 遍历学科，提取所有版本名称
          Object.keys(subjectsData).forEach(subjectName => {
            const subjectData = subjectsData[subjectName]
            if (subjectData && subjectData.version_groups) {
              Object.keys(subjectData.version_groups).forEach(versionName => {
                const versionGroup = subjectData.version_groups[versionName]
                if (versionGroup && versionGroup.version_name) {
                  // 检查是否已存在，避免重复
                  if (!versionList.find(v => v.value === versionGroup.version_name)) {
                    versionList.push({
                      label: versionGroup.version_name,
                      value: versionGroup.version_name
                    })
                  }
                }
              })
            }
          })
          
          this.versionOptions = versionList
          console.log('版本列表已更新:', this.versionOptions)
          
          // 移除自动选择第一个版本的逻辑，让用户手动选择
        } else {
          console.warn('版本列表数据格式不正确或为空:', response)
          this.versionOptions = []
        }
      } catch (error) {
        console.error('加载版本列表失败:', error)
        this.versionOptions = []
      }
    },
    
    // 根据选择的版本过滤章节树
    filterChapterOptionsByVersion() {
      if (!this.selectedVersion) {
        // 如果没有选择版本，显示所有版本
        this.chapterOptions = this.allVersionChapterOptions || []
        return
      }
      
      // 过滤出匹配的版本节点
      const filteredOptions = []
      
      this.allVersionChapterOptions.forEach(versionNode => {
        if (versionNode.value === this.selectedVersion || versionNode.label === this.selectedVersion) {
          filteredOptions.push(versionNode)
        }
      })
      
      this.chapterOptions = filteredOptions
      console.log('根据版本过滤后的章节选项:', this.chapterOptions)
    },
    
    // 版本选择变化处理
    handleVersionChange(version) {
      this.selectedVersion = version
      
      // 只清空当前选中的章节，不重置题目列表（题目列表只在点击章节时更新）
      this.currentChapter = null
      
      // 如果选择了版本，使用 getDirectoryTree 加载章节树
      if (version) {
        this.loadChapterTreeByVersion(version)
      } else {
        // 如果版本选择为空，重新查询当前科目与用户学校的版本内容
        const subject = this.selectedSubject || this.teacherSubjectName || null
        this.loadVersionContents(subject).then(() => {
          // 版本内容加载完成后，直接使用版本内容作为章节选项
          this.chapterOptions = this.versionChapterOptions || []
          console.log('版本选择为空，已加载学校版本内容，chapterOptions:', this.chapterOptions)
          
          // 重新初始化题目列表（使用 searchQuestions API）
          this.initializeQuestionList()
        }).catch(error => {
          console.error('加载版本内容失败:', error)
          this.chapterOptions = []
        })
      }
    },
    
    // 根据版本和学科加载章节树
    async loadChapterTreeByVersion(versionName) {
      try {
        // 获取当前选择的学科
        const subject = this.selectedSubject || this.teacherSubjectName || ''
        
        if (!subject) {
          console.warn('未选择学科，无法加载章节树')
          this.chapterOptions = []
          return
        }
        
        if (!versionName) {
          console.warn('未选择版本，无法加载章节树')
          this.chapterOptions = []
          return
        }
        
        // 构建请求参数
        const requestData = {
          subject: subject,
          version_name: versionName,
          root_code: null
        }
        
        console.log('加载章节树，请求参数:', requestData)
        
        // 调用API获取章节树
        const response = await getDirectoryTree(requestData)
        
        console.log('章节树API响应:', response)
        
        // 处理响应数据
        if (response && response.code === 200) {
          const data = response.data || response
          console.log('处理章节树数据，data:', data)
          
          // 格式1: 包含 results_by_version（旧格式）
          if (data && data.results_by_version) {
            this.chapterOptions = this.convertDirectoryTreeToChapterTree(data.results_by_version, versionName)
            console.log('转换后的章节树（results_by_version格式）:', this.chapterOptions)
          }
          // 格式2: 直接包含 textbooks 数组（新格式）
          else if (data && data.textbooks && Array.isArray(data.textbooks)) {
            this.chapterOptions = this.convertTextbooksToChapterTree(data.textbooks)
            console.log('转换后的章节树（textbooks格式）:', this.chapterOptions)
          }
          // 格式3: 直接返回 textbooks 数组
          else if (Array.isArray(data)) {
            this.chapterOptions = this.convertTextbooksToChapterTree(data)
            console.log('转换后的章节树（数组格式）:', this.chapterOptions)
          } else {
            console.warn('章节树数据格式不正确:', response)
            this.chapterOptions = []
          }
        } else if (response && response.results_by_version) {
          // 兼容直接返回 results_by_version 的情况
          this.chapterOptions = this.convertDirectoryTreeToChapterTree(response.results_by_version, versionName)
        } else if (response && response.textbooks && Array.isArray(response.textbooks)) {
          // 兼容直接返回 textbooks 数组的情况
          this.chapterOptions = this.convertTextbooksToChapterTree(response.textbooks)
        } else {
          console.warn('章节树数据格式不正确或为空:', response)
          this.chapterOptions = []
        }
      } catch (error) {
        console.error('加载章节树失败:', error)
        this.chapterOptions = []
      }
    },
    
    // 将 getDirectoryTree 返回的数据转换为章节树结构
    convertDirectoryTreeToChapterTree(resultsByVersion, versionName) {
      const chapterTree = []
      
      if (!resultsByVersion || typeof resultsByVersion !== 'object') {
        return chapterTree
      }
      
      // 如果指定了版本名，只处理该版本的数据
      if (versionName && resultsByVersion[versionName]) {
        const versionData = resultsByVersion[versionName]
        // 将版本数据转换为树节点
        const versionNode = this.convertDirectoryNodeToTreeNode(versionData)
        if (versionNode) {
          chapterTree.push(versionNode)
        }
      } else {
        // 如果没有指定版本名，处理所有版本
        Object.keys(resultsByVersion).forEach(vName => {
          const versionData = resultsByVersion[vName]
          const versionNode = this.convertDirectoryNodeToTreeNode(versionData)
          if (versionNode) {
            chapterTree.push(versionNode)
          }
        })
      }
      
      return chapterTree
    },
    
    // 将单个目录节点转换为树节点
    convertDirectoryNodeToTreeNode(node, parentPath = '') {
      if (!node) {
        return null
      }
      
      // 构建当前节点的路径
      const currentPath = node.content || parentPath
      
      // 创建树节点（保留原始 content 字段，同时设置 value）
      const treeNode = {
        label: node.title || `节点${node.id}`,
        value: node.content || currentPath,
        content: node.content || currentPath, // 保留原始 content 字段
        children: []
      }
      
      // 递归处理子节点
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        treeNode.children = node.children
          .map(child => this.convertDirectoryNodeToTreeNode(child, currentPath))
          .filter(child => child !== null)
      }
      
      return treeNode
    },
    
    // 将 textbooks 数组转换为章节树结构（新格式）
    convertTextbooksToChapterTree(textbooks) {
      const chapterTree = []
      
      if (!textbooks || !Array.isArray(textbooks)) {
        console.warn('convertTextbooksToChapterTree: textbooks 数据无效', textbooks)
        return chapterTree
      }
      
      console.log('转换 textbooks 数组，数量:', textbooks.length)
      
      // 遍历每个教材
      textbooks.forEach(textbook => {
        if (!textbook) {
          console.warn('教材数据为空')
          return
        }
        
        console.log('处理教材:', textbook)
        
        // 创建教材节点
        const textbookNode = {
          label: textbook.textbook_name || `教材${textbook.textbook_id || '未知'}`,
          value: textbook.textbook_name || `教材${textbook.textbook_id}`,
          children: []
        }
        
        // 优先处理 trees 字段（新格式）
        if (textbook.trees && Array.isArray(textbook.trees)) {
          console.log(`教材 ${textbookNode.label} 有 ${textbook.trees.length} 个章节（trees格式）`)
          textbookNode.children = textbook.trees
            .map(treeNode => this.convertDirectoryNodeToTreeNode(treeNode, textbookNode.value))
            .filter(child => child !== null)
        }
        // 如果教材有 contents 字段，递归处理内容（章节）
        else if (textbook.contents && Array.isArray(textbook.contents)) {
          console.log(`教材 ${textbookNode.label} 有 ${textbook.contents.length} 个章节`)
          textbookNode.children = this.convertContentsToTreeNodes(
            textbook.contents,
            textbookNode.value
          )
        } 
        // 兼容使用 children 字段的情况
        else if (textbook.children && Array.isArray(textbook.children)) {
          console.log(`教材 ${textbookNode.label} 有 ${textbook.children.length} 个子节点`)
          textbookNode.children = textbook.children
            .map(child => this.convertDirectoryNodeToTreeNode(child, textbookNode.value))
            .filter(child => child !== null)
        } else {
          console.warn(`教材 ${textbookNode.label} 没有 trees、contents 或 children 字段，将作为空节点添加`)
        }
        
        // 始终添加教材节点，即使没有子节点（教材本身可能也是可选择的）
        chapterTree.push(textbookNode)
      })
      
      console.log('最终生成的章节树（textbooks格式）:', chapterTree)
      return chapterTree
    },
    
    // 加载学校版本内容
    async loadVersionContents(subject = null) {
      try {
        // 获取学校名称（从教师信息中获取）
        const schoolName = this.teacherInfo?.schoolName || this.teacherInfo?.school || ''
        
        // 如果没有学校名称，跳过版本内容加载
        if (!schoolName) {
          console.warn('未获取到学校名称，跳过版本内容加载')
          this.versionChapterOptions = []
          this.chapterOptions = []
          return Promise.resolve()
        }
        
        // 构建请求参数
        const requestData = {}
        if (subject) {
          requestData.subjects = [subject]
        }
        requestData.school_name = schoolName
        
        console.log('加载版本内容，请求参数:', requestData)
        
        // 调用API获取版本内容
        const response = await getAllLatestVersionsContents(requestData)
        
        console.log('版本内容API响应:', response)
        
        // 处理不同的响应格式
        let subjectsData = null
        
        // 格式1: { code: 200, data: { subjects: {...} } }
        if (response && response.code === 200) {
          if (response.data && response.data.subjects) {
            subjectsData = response.data.subjects
          } else if (response.subjects) {
            subjectsData = response.subjects
          }
        }
        // 格式2: 直接返回 { subjects: {...} }
        else if (response && response.subjects) {
          subjectsData = response.subjects
        }
        
        if (subjectsData && typeof subjectsData === 'object') {
          console.log('开始转换章节树，subjects数据:', subjectsData)
          // 将版本内容转换为章节树结构
          const chapterTree = this.convertVersionContentsToChapterTree(subjectsData)
          console.log('转换后的章节树:', chapterTree)
          this.versionChapterOptions = chapterTree
        } else {
          console.warn('版本内容数据格式不正确或为空:', response)
          this.versionChapterOptions = []
        }
      } catch (error) {
        console.error('加载版本内容失败:', error)
        this.versionChapterOptions = []
      }
    },
    
    // 将版本内容转换为章节树结构（不包含科目名，直接从版本组开始）
    convertVersionContentsToChapterTree(subjects) {
      const chapterTree = []
      
      if (!subjects || typeof subjects !== 'object') {
        console.warn('convertVersionContentsToChapterTree: subjects 数据无效', subjects)
        return chapterTree
      }
      
      // 遍历每个学科
      Object.keys(subjects).forEach(subjectName => {
        const subjectData = subjects[subjectName]
        console.log(`处理学科 ${subjectName}:`, subjectData)
        
        if (!subjectData) {
          console.warn(`学科 ${subjectName} 数据为空`)
          return
        }
        
        if (!subjectData.version_groups) {
          console.warn(`学科 ${subjectName} 没有 version_groups`)
          return
        }
        
        // 不创建学科节点，直接遍历版本组作为顶级节点
        // 遍历每个版本组
        Object.keys(subjectData.version_groups).forEach(versionName => {
          const versionGroup = subjectData.version_groups[versionName]
          console.log(`处理版本组 ${versionName}:`, versionGroup)
          
          if (!versionGroup) {
            console.warn(`版本组 ${versionName} 数据为空`)
            return
          }
          
          if (!versionGroup.textbooks) {
            console.warn(`版本组 ${versionName} 没有 textbooks 字段`)
            return
          }
          
          // 创建版本节点（作为顶级节点，不包含科目名）
          const versionNode = {
            label: versionName,
            value: versionName,
            children: []
          }
          
          // 确保 textbooks 是数组
          const textbooks = Array.isArray(versionGroup.textbooks) 
            ? versionGroup.textbooks 
            : []
          
          console.log(`版本组 ${versionName} 有 ${textbooks.length} 个教材`)
          
          // 遍历每个教材
          textbooks.forEach(textbook => {
            if (!textbook) {
              console.warn('教材数据为空')
              return
            }
            
            console.log('处理教材:', textbook)
            
            // 创建教材节点（value 不包含科目名）
            const textbookNode = {
              label: textbook.textbook_name || `教材${textbook.textbook_id || '未知'}`,
              value: `${versionName}/${textbook.textbook_name || textbook.textbook_id}`,
              children: []
            }
            
            // 递归处理内容（章节）
            if (textbook.contents && Array.isArray(textbook.contents)) {
              console.log(`教材 ${textbookNode.label} 有 ${textbook.contents.length} 个章节`)
              textbookNode.children = this.convertContentsToTreeNodes(
                textbook.contents,
                textbookNode.value
              )
            } else {
              console.warn(`教材 ${textbookNode.label} 没有 contents 或 contents 不是数组`)
            }
            
            versionNode.children.push(textbookNode)
          })
          
          if (versionNode.children.length > 0) {
            chapterTree.push(versionNode)
          }
        })
      })
      
      console.log('最终生成的章节树:', chapterTree)
      return chapterTree
    },
    
    // 递归转换内容为树节点
    convertContentsToTreeNodes(contents, parentPath = '') {
      if (!contents || !Array.isArray(contents)) {
        return []
      }
      
      return contents.map(content => {
        const node = {
          label: content.title || `章节${content.id}`,
          value: content.content || `${parentPath}/${content.title}`,
          content: content.content || `${parentPath}/${content.title}`, // 保留原始 content 字段
          children: []
        }
        
        // 如果有子节点，递归处理
        if (content.children && Array.isArray(content.children) && content.children.length > 0) {
          node.children = this.convertContentsToTreeNodes(
            content.children,
            node.value
          )
        }
        
        return node
      })
    },
    
    // 加载知识点列表
    async loadKnowledgeList(subject = null) {
      // 先清空知识点列表，避免显示旧数据
      this.knowledgeList = []
      this.knowledgeOptions = []
      this.originalKnowledgeOptions = []
      
      // 如果没有指定科目，不加载知识点
      if (!subject) {
        return
      }
      
      try {
        // 使用新的 API：getKnowledgeLeafNodes
        const requestData = {
          subjects: [subject]
        }
        
        const response = await getKnowledgeLeafNodes(requestData)
        
        // 处理响应数据
        let knowledgeTrees = null
        let knowledgeFlat = null
        
        // 提取 knowledge_trees
        if (response && response.knowledge_trees) {
          knowledgeTrees = response.knowledge_trees
        } else if (response && response.data && response.data.knowledge_trees) {
          knowledgeTrees = response.data.knowledge_trees
        } else if (response && response.code === 200 && response.data && response.data.knowledge_trees) {
          knowledgeTrees = response.data.knowledge_trees
        }
        
        // 提取 knowledge_flat（扁平化列表，用于搜索）
        if (response && response.knowledge_flat) {
          knowledgeFlat = response.knowledge_flat
        } else if (response && response.data && response.data.knowledge_flat) {
          knowledgeFlat = response.data.knowledge_flat
        } else if (response && response.code === 200 && response.data && response.data.knowledge_flat) {
          knowledgeFlat = response.data.knowledge_flat
        }
        
        if (knowledgeTrees && knowledgeTrees[subject] && Array.isArray(knowledgeTrees[subject])) {
          // 获取该学科的知识点树
          const subjectKnowledgeTree = knowledgeTrees[subject]
          
          // 跳过科目节点，直接使用其子节点
          // 通常第一个节点是科目节点（name 等于 subject），需要跳过
          let actualKnowledgeTree = subjectKnowledgeTree
          if (subjectKnowledgeTree.length > 0 && subjectKnowledgeTree[0].name === subject) {
            // 如果第一个节点是科目节点，使用其 children
            actualKnowledgeTree = subjectKnowledgeTree[0].children || []
          }
          
          // 转换为组件需要的格式
          const convertedTree = this.convertKnowledgeTreeToOptions(actualKnowledgeTree)
          
          // 保存原始数据（包含科目节点，用于路径构建）
          this.originalKnowledgeOptions = this.convertKnowledgeTreeToOptions(subjectKnowledgeTree)
          this.knowledgeOptions = convertedTree
          
          // 优先使用 knowledge_flat 作为搜索列表
          if (knowledgeFlat && Array.isArray(knowledgeFlat) && knowledgeFlat.length > 0) {
            // 将 knowledge_flat 转换为搜索列表格式
            this.knowledgeList = knowledgeFlat.map(item => ({
              label: item.name || `知识点${item.id}`,
              value: item.path || item.code || `knowledge_${item.id}`,
              code: item.code,
              path: item.path,
              id: item.id,
              isLeaf: item.is_leaf === 1
            }))
          } else {
            // 如果没有 knowledge_flat，从树形数据中提取所有标签（用于搜索，跳过科目节点）
            this.knowledgeList = this.extractLabelsFromKnowledgeTree(actualKnowledgeTree)
          }
          
          console.log('知识点加载成功:', {
            subject,
            total: response.total || 0,
            treeNodes: convertedTree.length,
            searchItems: this.knowledgeList.length,
            hasKnowledgeFlat: !!knowledgeFlat
          })
        } else {
          console.warn('知识点数据格式不正确或该学科没有知识点:', {
            subject,
            response
          })
          this.knowledgeOptions = []
          this.originalKnowledgeOptions = []
          this.knowledgeList = []
        }
      } catch (error) {
        console.error('获取知识点列表失败:', error)
        // 如果新 API 失败，回退到旧 API
        this.loadKnowledgeListFallback(subject)
      }
    },
    
    // 回退方法：使用旧 API 加载知识点
    loadKnowledgeListFallback(subject = null) {
      const query = subject ? { currentSelectedSubject: subject } : {}
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
    
    // 将知识点树转换为组件需要的格式
    convertKnowledgeTreeToOptions(knowledgeNodes) {
      if (!knowledgeNodes || !Array.isArray(knowledgeNodes)) {
        return []
      }
      
      return knowledgeNodes.map(node => {
        const treeNode = {
          label: node.name || `知识点${node.id}`,
          value: node.path || node.code || `knowledge_${node.id}`,
          code: node.code,
          path: node.path,
          isLeaf: node.is_leaf === 1,
          children: []
        }
        
        // 递归处理子节点
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          treeNode.children = this.convertKnowledgeTreeToOptions(node.children)
        }
        
        return treeNode
      })
    },
    
    // 从知识点树中提取所有标签（用于搜索）
    extractLabelsFromKnowledgeTree(knowledgeNodes, parentPath = '') {
      if (!knowledgeNodes || !Array.isArray(knowledgeNodes)) {
        return []
      }
      
      const labels = []
      
      knowledgeNodes.forEach(node => {
        const currentPath = node.path || parentPath
        const label = node.name || `知识点${node.id}`
        
        // 添加当前节点到标签列表
        labels.push({
          label: label,
          value: node.path || node.code || `knowledge_${node.id}`,
          path: node.path,
          code: node.code,
          isLeaf: node.is_leaf === 1
        })
        
        // 递归处理子节点
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const childLabels = this.extractLabelsFromKnowledgeTree(node.children, currentPath)
          labels.push(...childLabels)
        }
      })
      
      return labels
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
      return this.knowledgeList.filter(item => {
        // 支持对象格式（knowledge_flat）和字符串格式（旧格式）
        const label = typeof item === 'string' ? item : (item.label || item.name || '')
        return label && label.toLowerCase().includes(searchKey)
      })
    },
    
    // 从知识点列表中查找对应的节点（支持 knowledge_flat 格式）
    findKnowledgeNodeByLabel(label) {
      // 首先从 knowledgeList 中查找（如果是 knowledge_flat 格式，直接返回）
      if (this.knowledgeList && Array.isArray(this.knowledgeList)) {
        const found = this.knowledgeList.find(item => {
          const itemLabel = typeof item === 'string' ? item : (item.label || item.name || '')
          return itemLabel === label
        })
        if (found) {
          // 如果是对象格式（knowledge_flat），直接返回
          if (typeof found === 'object' && found.code) {
            return {
              label: found.label || found.name,
              value: found.value || found.path || found.code,
              code: found.code,
              path: found.path,
              id: found.id,
              isLeaf: found.isLeaf || found.is_leaf === 1
            }
          }
          // 如果是字符串格式，继续从树中查找
        }
      }
      
      // 如果 knowledgeList 中没有找到，从树形结构中查找
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
      return getTeacherInfo().then(res => {
        if (res.code === 200) {
          // 将教师信息保存到 store，store 会自动计算年级、学科和年级+学科
          this.$store.commit('setTeacherInfo', res.data)
          this.teacherInfo = res.data
          this.isAdmin = this.checkIsAdmin()
          
          // 教师信息加载完成后，重新加载章节列表（包含版本内容）
          // 如果有科目，传递科目参数；如果没有科目，不传参数，加载所有科目的章节
          const subject = this.selectedSubject || this.teacherSubjectName || null
          this.loadChapterList(subject)
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
      // 优先使用顶部选择的科目
      let subjectName = this.selectedSubject || ''
      
      // 如果没有选择科目，尝试从章节或知识点路径中提取
      if (!subjectName && this.dataSourceType === 'chapter' && this.currentChapter) {
        const chapterPath = this.buildChapterPath(this.currentChapter)
        const pathParts = chapterPath.split('/')
        if (pathParts.length >= 2) {
          subjectName = pathParts[0] + pathParts[1]
        } else if (pathParts.length === 1) {
          subjectName = pathParts[0]
        }
      } else if (!subjectName && this.dataSourceType === 'knowledge' && this.currentKnowledge) {
        const knowledgePath = this.buildKnowledgePath(this.currentKnowledge)
        const pathParts = knowledgePath.split('/')
        if (pathParts.length >= 2) {
          subjectName = pathParts[0] + pathParts[1]
        } else if (pathParts.length === 1) {
          subjectName = pathParts[0]
        }
      } else if (!subjectName && this.dataSourceType === 'material') {
        // 教辅材料模式：优先使用教辅材料选择的科目，否则使用顶部选择的科目
        subjectName = this.selectedSubjectForMaterial || this.selectedSubject || '高中通用'
      }
      
      // 如果没有科目信息，给出提示并使用默认值
      if (!subjectName) {
        console.warn('无法确定科目，使用默认科目获取题型')
        subjectName = '高中通用'
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
      // 所有数据源类型切换时，如果有科目，都立即加载题型（菁优网搜题由组件自己处理）
      if (type !== 'thirdParty' && ((this.isAdmin && this.selectedSubject) || (!this.isAdmin && this.teacherSubjectName))) {
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
      
      // 所有节点都可以选择，不需要限制
      // 重置分页到第一页
      this.pagination.pageNum = 1
      this.loadQuestionsByKnowledge(data, 1, this.pagination.pageSize)
      this.loadQuestionTypes()
      this.$nextTick(() => {
        this.resetQuestionListScroll()
      })
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
    
    // 通过章节加载题目（返回 Promise 版本，用于 await）
    async loadQuestionsByChapterPromise(chapter, pageNum = 1, pageSize = 10) {
      return new Promise((resolve, reject) => {
        this.loadQuestionsByChapter(chapter, pageNum, pageSize, resolve, reject)
      })
    },
    
    // 通过章节加载题目
    loadQuestionsByChapter(chapter, pageNum = 1, pageSize = 10, onSuccess, onError) {
      this.pagination.pageNum = pageNum
      this.pagination.pageSize = pageSize
      
      // 获取科目名称
      const subject = this.selectedSubject || this.teacherSubjectName || ''
      if (!subject) {
        this.$message.warning('请先选择科目')
        return
      }
      
      // 获取章节的 content 字段作为 path（优先使用 content，否则使用 value）
      const fullPath = chapter.content || chapter.value
      if (!fullPath) {
        this.$message.warning('章节路径不存在')
        console.error('章节数据:', chapter)
        return
      }
      
      // 提取版本名之后的路径部分（删除 middle/math/ 和版本名）
      // 原始路径格式: "middle/math/版本名/教材名/章节名/..."
      // 目标路径格式: "教材名/章节名/..." (从版本名之后开始)
      const processedPath = this.extractPathAfterVersion(fullPath)
      
      // 构建请求参数
      const requestData = {
        paths: [processedPath], // 使用版本名之后的路径
        subject: subject,
        page: pageNum,
        per_page: pageSize
      }
      
      console.log('加载章节题目，请求参数:', requestData)
      console.log('路径处理:', {
        原始路径: fullPath,
        处理后路径: processedPath
      })
      
      // 添加关键词筛选（优先使用 searchKeywords）
      const keywordsToUse = this.searchKeywords || ''
      if (keywordsToUse) {
        requestData.keywords = keywordsToUse
      }
      
      // 添加题型筛选（优先使用 searchQuestionType，否则使用 questionType）
      const questionTypeToUse = this.searchQuestionType || this.questionType
      if (questionTypeToUse) {
        requestData.cates = [questionTypeToUse]
      }
      
      // 添加难度筛选（优先使用 searchDifficultyLevel，否则使用 difficultyLevel）
      const difficultyLevelToUse = this.searchDifficultyLevel || this.difficultyLevel
      if (difficultyLevelToUse) {
        const minDegree = this.getMinDegree(difficultyLevelToUse)
        const maxDegree = this.getMaxDegree(difficultyLevelToUse)
        if (minDegree !== undefined) {
          requestData.min_degree = minDegree
        }
        if (maxDegree !== undefined) {
          requestData.max_degree = maxDegree
        }
      }
      
      // 使用新的 API
      getQuestionsByPath(requestData).then(res => {
        let questions = []
        let total = 0
        
        // 处理响应数据
        if (res.questions && Array.isArray(res.questions)) {
          questions = res.questions
        } else if (res.data && res.data.questions && Array.isArray(res.data.questions)) {
          questions = res.data.questions
        } else if (res.data && Array.isArray(res.data)) {
          questions = res.data
        } else if (Array.isArray(res)) {
          questions = res
        }
        
        // 获取总数
        if (res.statistics && res.statistics.total_questions) {
          total = res.statistics.total_questions
        } else if (res.data && res.data.statistics && res.data.statistics.total_questions) {
          total = res.data.statistics.total_questions
        } else if (res.total) {
          total = res.total
        } else {
          total = questions.length
        }
        
        this.allQuestions = questions
        this.filteredQuestions = [...this.allQuestions]
        this.pagination.total = total
        
        // 如果组件没有启用后端搜索，进行本地过滤
        if (!this.shouldEnableBackendSearch) {
          this.filterQuestions()
        }
        
        // 如果题目列表为空，显示提示
        if (this.filteredQuestions.length === 0) {
          const chapterName = chapter.label || chapter.name || '章节'
          this.$message({
            message: `当前选择的"${chapterName}"暂无题目数据`,
            type: 'info',
            duration: 3000,
            showClose: true
          })
        }
        
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
          if (this.loadFavoriteStatus && typeof this.loadFavoriteStatus === 'function') {
            this.loadFavoriteStatus()
          }
        })
        
        // 如果有成功回调，调用它
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(res)
        }
      }).catch(error => {
        console.error('获取题目失败:', error)
        this.$message.error('获取题目失败')
        this.allQuestions = []
        this.filteredQuestions = []
        this.pagination.total = 0
        
        // 如果有错误回调，调用它
        if (onError && typeof onError === 'function') {
          onError(error)
        }
      })
    },
    
    // 通过知识点加载题目
    loadQuestionsByKnowledge(knowledge, pageNum = 1, pageSize = 10) {
      this.pagination.pageNum = pageNum
      this.pagination.pageSize = pageSize
      
      // 获取知识点的 code 字段
      const knowledgeCode = knowledge.code
      if (!knowledgeCode) {
        this.$message.warning('知识点代码不存在')
        console.error('知识点数据:', knowledge)
        return
      }
      
      // 构建请求参数
      const requestData = {
        knowledge_codes: [knowledgeCode], // 使用知识点的 code 作为 knowledge_codes
        page: pageNum,
        per_page: pageSize
      }
      
      // 添加关键词筛选（优先使用 searchKeywords）
      const keywordsToUse = this.searchKeywords || ''
      if (keywordsToUse) {
        requestData.keywords = keywordsToUse
      }
      
      // 添加题型筛选（优先使用 searchQuestionType，否则使用 questionType）
      const questionTypeToUse = this.searchQuestionType || this.questionType
      if (questionTypeToUse) {
        requestData.cates = [questionTypeToUse]
      }
      
      // 添加难度筛选（优先使用 searchDifficultyLevel，否则使用 difficultyLevel）
      const difficultyLevelToUse = this.searchDifficultyLevel || this.difficultyLevel
      if (difficultyLevelToUse) {
        const minDegree = this.getMinDegree(difficultyLevelToUse)
        const maxDegree = this.getMaxDegree(difficultyLevelToUse)
        if (minDegree !== undefined) {
          requestData.min_degree = minDegree
        }
        if (maxDegree !== undefined) {
          requestData.max_degree = maxDegree
        }
      }
      
      console.log('加载知识点题目，请求参数:', requestData)
      
      // 使用新的 API
      getQuestionsByKnowledgeCodes(requestData).then(res => {
        let questions = []
        let total = 0
        
        // 处理响应数据
        if (res.questions && Array.isArray(res.questions)) {
          questions = res.questions
        } else if (res.data && res.data.questions && Array.isArray(res.data.questions)) {
          questions = res.data.questions
        } else if (res.data && Array.isArray(res.data)) {
          questions = res.data
        } else if (Array.isArray(res)) {
          questions = res
        }
        
        // 获取总数
        if (res.statistics && res.statistics.total_questions) {
          total = res.statistics.total_questions
        } else if (res.data && res.data.statistics && res.data.statistics.total_questions) {
          total = res.data.statistics.total_questions
        } else if (res.total) {
          total = res.total
        } else {
          total = questions.length
        }
        
        this.allQuestions = questions
        this.filteredQuestions = [...this.allQuestions]
        this.pagination.total = total
        
        // 如果组件没有启用后端搜索，进行本地过滤
        if (!this.shouldEnableBackendSearch) {
          this.filterQuestions()
        }
        
        // 如果题目列表为空，显示提示
        if (this.filteredQuestions.length === 0) {
          const knowledgeName = knowledge.label || knowledge.name || '知识点'
          this.$message({
            message: `当前选择的"${knowledgeName}"暂无题目数据`,
            type: 'info',
            duration: 3000,
            showClose: true
          })
        }
        
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
          if (this.loadFavoriteStatus && typeof this.loadFavoriteStatus === 'function') {
            this.loadFavoriteStatus()
          }
        })
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
        
        // 加载收藏状态
        this.$nextTick(() => {
          if (this.loadFavoriteStatus && typeof this.loadFavoriteStatus === 'function') {
            this.loadFavoriteStatus()
          }
        })
        
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
      // 优先使用新 API 返回的 path 字段
      if (knowledge.path) {
        return knowledge.path
      }
      
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
      
      // 统一使用 selectedSubject（用户选择的单个科目）
      // 如果 selectedSubjectForMaterial 存在且是单个科目，也可以使用，但优先使用 selectedSubject
      let subjectName = this.selectedSubject || ''
      
      // 如果 selectedSubject 为空，尝试使用 selectedSubjectForMaterial（但必须是单个科目，不能是数组）
      if (!subjectName && this.selectedSubjectForMaterial) {
        // 检查是否是数组或包含逗号（多个科目）
        if (typeof this.selectedSubjectForMaterial === 'string' && !this.selectedSubjectForMaterial.includes(',')) {
          subjectName = this.selectedSubjectForMaterial
        }
      }
      
      // 如果选择了科目，传递科目参数；如果没有选择科目，不传递参数，显示所有教辅材料
      if (subjectName) {
        queryParams.subjectName = subjectName
      }
      // 如果没有选择科目，不传递 subjectName 参数，后端会返回所有教辅材料
      
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
    },
    
    // 根据难度等级获取最小难度值
    getMinDegree(difficultyLevel) {
      if (!difficultyLevel) return undefined
      const difficultyMap = {
        'easy': 0.8,
        'easier': 0.6,
        'medium': 0.4,
        'harder': 0.2,
        'hard': 0
      }
      return difficultyMap[difficultyLevel] !== undefined ? difficultyMap[difficultyLevel] : undefined
    },
    
    // 根据难度等级获取最大难度值
    getMaxDegree(difficultyLevel) {
      if (!difficultyLevel) return undefined
      const difficultyMap = {
        'easy': 1,
        'easier': 0.8,
        'medium': 0.6,
        'harder': 0.4,
        'hard': 0.2
      }
      return difficultyMap[difficultyLevel] !== undefined ? difficultyMap[difficultyLevel] : undefined
    },
    
    // 提取版本名之后的路径部分
    extractPathAfterVersion(fullPath) {
      if (!fullPath || typeof fullPath !== 'string') {
        return fullPath
      }
      
      const pathParts = fullPath.split('/').filter(part => part.trim() !== '')
      
      // 版本名通常是第三个部分（索引为2）
      if (pathParts.length <= 3) {
        // 如果路径太短，可能格式不对，返回原路径
        console.warn('路径格式可能不正确:', fullPath)
        return fullPath
      }
      
      // 删除前3个部分（学段、科目、版本名），保留版本名之后的部分
      const pathAfterVersion = pathParts.slice(3).join('/')
      
      return pathAfterVersion
    },
    
    // 初始化题目列表（当版本选择为空，返回学校版本时调用）
    async initializeQuestionList() {
      // 只在章节选择模式下执行
      if (this.dataSourceType !== 'chapter') {
        return
      }
      
      // 如果已经选择了章节，不执行初始搜索
      if (this.currentChapter) {
        return
      }
      
      // 获取科目信息
      const subjectName = this.selectedSubject || this.teacherSubjectName || ''
      
      // 如果没有选择科目，不执行搜索
      if (!subjectName) {
        return
      }
      
      try {
        // 构建搜索参数（使用 searchQuestions API）
        const searchParams = {
          subject_names: [subjectName],
          keywords: '',
          min_degree: undefined,
          max_degree: undefined,
          cates: [],
          page: this.pagination.pageNum || 1,
          per_page: this.pagination.pageSize || 10
        }
        
        console.log('初始化题目列表，请求参数:', searchParams)
        
        // 调用搜索API
        const response = await searchProblems(searchParams)
        
        // 处理响应数据
        if (response && response.questions) {
          this.allQuestions = response.questions || []
          this.filteredQuestions = [...this.allQuestions]
          this.pagination.total = response.statistics?.total_questions || 0
          this.pagination.pageNum = searchParams.page
          this.pagination.pageSize = searchParams.per_page
          
          // 加载收藏状态
          this.$nextTick(() => {
            if (this.loadFavoriteStatus && typeof this.loadFavoriteStatus === 'function') {
              this.loadFavoriteStatus()
            }
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
            this.pagination.pageNum = searchParams.page
            this.pagination.pageSize = searchParams.per_page
          }
          
          // 加载收藏状态
          this.$nextTick(() => {
            if (this.loadFavoriteStatus && typeof this.loadFavoriteStatus === 'function') {
              this.loadFavoriteStatus()
            }
          })
        }
      } catch (error) {
        console.error('初始化题目列表失败:', error)
        // 不显示错误提示，避免干扰用户
      }
    }
  }
}

