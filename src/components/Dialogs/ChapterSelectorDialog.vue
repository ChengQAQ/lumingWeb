<template>
  <el-dialog
    title="选择章节路径"
    :visible.sync="dialogVisible"
    width="60%"
    :before-close="handleDialogClose"
    @close="handleDialogClose"
    append-to-body
    :modal-append-to-body="true"
  >
    <div class="chapter-selection">
      <div class="chapter-tree">
        <div v-if="chapterTreeData.length === 0" class="no-data">
          <div class="no-data-content">
            <i class="el-icon-document"></i>
            <p>暂无章节树数据</p>
            <p class="no-data-tip">请检查学科选择或联系管理员</p>
          </div>
        </div>
        <el-tree
          v-else
          ref="chapterTree"
          :data="chapterTreeData"
          :props="chapterTreeProps"
          node-key="value"
          :default-expand-all="false"
          :default-expanded-keys="expandedKeys"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-click="handleChapterNodeClick"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span :class="{ 
              'selectable-node': isSelectableChapterNode(data), 
              'leaf-node': !data.children || data.children.length === 0, 
              'parent-node': data.children && data.children.length > 0 && !isSelectableChapterNode(data) 
            }">
              {{ node.label }}
              <span v-if="isSelectableChapterNode(data)" class="selectable-indicator">✓</span>
              <span v-else-if="!data.children || data.children.length === 0" class="leaf-indicator"></span>
              <span v-else class="parent-indicator">📁</span>
            </span>
          </span>
        </el-tree>
      </div>
      
      <div class="selected-chapter">
        <h4>已选择章节路径：</h4>
        <p class="chapter-path">{{ selectedChapterPath || '未选择' }}</p>
        <div v-if="selectedChapterData" class="selected-info">
          <p><strong>选择的节点：</strong>{{ selectedChapterData.label }}</p>
          <p><strong>节点值：</strong>{{ selectedChapterData.value }}</p>
        </div>
        <div class="selection-tip">
          <i class="el-icon-info"></i>
          <span>请选择章节级别（带✓标记的蓝色节点），可以选择：章、节、小节等层级，包括最后的子节点，但不能选择：年级级别。完成后将发送到MQ进行响应</span>
        </div>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button 
        type="primary" 
        :disabled="!selectedChapterPath"
        @click="confirmSelection"
      >
        确认选择
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getChapterMap } from '@/api/system/chapterTitle'

export default {
  name: 'ChapterSelectorDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    subjectName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      chapterTreeData: [],
      chapterTreeProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      expandedKeys: [],
      selectedChapterPath: '',
      selectedChapterData: null,
      loading: false
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
        if (newVal) {
          this.initDialog()
        }
      },
      immediate: true
    },
    subjectName: {
      handler(newVal) {
        if (newVal && this.visible) {
          this.loadChapterTreeData()
        }
      }
    }
  },
  methods: {
    // 初始化弹窗
    initDialog() {
      this.selectedChapterPath = ''
      this.selectedChapterData = null
      
      // 如果没有选择学科，先加载空数据
      if (!this.subjectName) {
        this.chapterTreeData = []
        this.setDefaultExpandedKeys()
        this.$message.warning('请先选择学科')
        return
      }
      
      this.loadChapterTreeData()
    },

    // 加载章节树数据
    async loadChapterTreeData() {
      if (!this.subjectName) {
        this.$message.warning('请先选择学科')
        return
      }

      this.loading = true
      try {
        const response = await getChapterMap()
        console.log('章节树API响应:', response)
        
        if (response && response.code === 200) {
          this.chapterTreeData = this.filterLastLevelNodes(response.data || [])
          console.log('章节树数据设置:', this.chapterTreeData)
          
          if (this.chapterTreeData.length === 0) {
            this.chapterTreeData = []
          }
          
          // 过滤特定学科的章节数据
          this.chapterTreeData = this.filterChapterTreeBySubject(this.chapterTreeData, this.subjectName)
          console.log('过滤后的章节树数据:', this.chapterTreeData)
          
          if (this.chapterTreeData.length === 0) {
            this.chapterTreeData = []
          }
          
          // 设置默认展开的节点（针对过滤后的数据）
          this.setDefaultExpandedKeys()
        } else {
          this.chapterTreeData = []
          // 设置默认展开的节点
          this.setDefaultExpandedKeys()
        }
      } catch (error) {
        console.error('加载章节树数据失败:', error)
        this.chapterTreeData = []
        // 设置默认展开的节点
        this.setDefaultExpandedKeys()
        this.$message.error('加载章节树数据失败')
      } finally {
        this.loading = false
      }
    },

    // 设置默认展开的节点
    setDefaultExpandedKeys() {
      this.expandedKeys = []
      
      // 如果没有学科名称，展开所有年级节点
      if (!this.subjectName) {
        const findAndCollectExpandKeys = (nodes, currentDepth = 0) => {
          nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
              // 只展开到第2层（年级和必修层级）
              if (currentDepth < 2) {
                this.expandedKeys.push(node.value)
                findAndCollectExpandKeys(node.children, currentDepth + 1)
              }
            }
          })
        }
        findAndCollectExpandKeys(this.chapterTreeData)
      } else {
        // 如果有学科名称，只展开对应学科的节点
        this.expandSubjectNodes(this.chapterTreeData, this.subjectName)
      }
      
      console.log('需要展开的节点keys:', this.expandedKeys)
    },

    // 展开对应学科的节点
    expandSubjectNodes(nodes, subjectName) {
      if (!nodes || !Array.isArray(nodes)) return
      
      nodes.forEach(node => {
        // 检查是否是年级节点（初中、高中）
        if (node.label === '初中' || node.label === '高中') {
          // 展开年级节点
          this.expandedKeys.push(node.value)
          
          // 查找对应的学科节点
          if (node.children && node.children.length > 0) {
            node.children.forEach(subjectNode => {
              // 检查学科名称是否匹配
              if (this.isSubjectMatch(subjectNode.label, subjectName)) {
                // 展开学科节点
                this.expandedKeys.push(subjectNode.value)
                
                // 如果有子节点，也展开第一层子节点（如必修、章节等）
                if (subjectNode.children && subjectNode.children.length > 0) {
                  subjectNode.children.forEach(childNode => {
                    this.expandedKeys.push(childNode.value)
                  })
                }
              }
            })
          }
        }
      })
    },

    // 检查学科名称是否匹配
    isSubjectMatch(nodeLabel, subjectName) {
      if (!nodeLabel || !subjectName) return false
      
      // 直接匹配
      if (nodeLabel === subjectName) return true
      
      // 包含匹配
      if (nodeLabel.includes(subjectName)) return true
      
      // 反向包含匹配
      if (subjectName.includes(nodeLabel)) return true
      
      // 学科关键词匹配
      const subjectKeywords = ['数学', '物理', '化学', '生物', '语文', '英语', '历史', '政治', '地理', '科学', '信息', '通用']
      
      for (const keyword of subjectKeywords) {
        if (nodeLabel.includes(keyword) && subjectName.includes(keyword)) {
          return true
        }
      }
      
      return false
    },

    // 处理章节节点点击
    handleChapterNodeClick(data, node) {
      console.log('章节节点被点击:', data)
      
      // 检查是否为可选择的节点
      const isSelectableNode = this.isSelectableChapterNode(data)
      console.log('是否为可选择的章节节点:', isSelectableNode)
      
      if (isSelectableNode) {
        const path = this.buildChapterPath(data)
        console.log('构建的路径:', path)
        if (path) {
          this.selectedChapterPath = path
          this.selectedChapterData = data
          console.log('设置的章节路径:', this.selectedChapterPath)
          this.$message.success('已选择章节：' + data.label)
        } else {
          console.error('路径构建失败')
          this.$message.error('路径构建失败')
        }
      } else {
        this.selectedChapterPath = ''
        this.selectedChapterData = null
        console.log('不可选择的节点，清空选择')
        
        const nodeLabel = data.label || ''
        let warningMessage = ''
        
        if (nodeLabel === '初中' || nodeLabel === '高中') {
          warningMessage = '年级级别（' + nodeLabel + '）不能选择，请选择具体的章节'
        } else {
          warningMessage = '当前选择的节点不可选择，请选择其他节点'
        }
        
        this.$message.warning(warningMessage)
      }
    },

    // 判断是否为可选择的章节节点
    isSelectableChapterNode(node) {
      if (!node) return false
      
      const nodeLabel = node.label || ''
      
      // 年级级别不能选择（初中、高中）
      if (nodeLabel === '初中' || nodeLabel === '高中') {
        // console.log('节点:', nodeLabel, '是年级级别，不可选择')
        return false
      }
      
      // 学科级别（如数学、物理、化学等）可以选择
      const subjectKeywords = ['数学', '物理', '化学', '生物', '语文', '英语', '历史', '政治', '地理', '科学', '信息', '通用']
      const isSubject = subjectKeywords.some(keyword => nodeLabel.includes(keyword))
      
      if (isSubject) {
        // console.log('节点:', nodeLabel, '是学科级别，可以选择')
        return true
      }
      
      // 叶子节点（没有子节点的节点）可以选择
      if (!node.children || node.children.length === 0) {
        // console.log('节点:', nodeLabel, '是叶子节点，可以选择')
        return true
      }
      
      // 其他有子节点的节点也可以选择（如必修、章节等）
    //   console.log('节点:', nodeLabel, '有子节点，可以选择')
      return true
    },


    // 构建章节路径
    buildChapterPath(chapter) {
      console.log('构建章节路径，输入章节:', chapter)
      
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
      const chinesePath = findPath(this.chapterTreeData, chapter.value) || chapter.label
      console.log('找到的中文路径:', chinesePath)
      
      // 转换为英文路径格式
      const englishPath = this.convertToEnglishPath(chinesePath)
      console.log('转换后的英文路径:', englishPath)
      return englishPath
    },

    // 将中文路径转换为英文路径格式
    convertToEnglishPath(chinesePath) {
      if (!chinesePath) return ''
      
      // 科目映射表
      const subjectMap = {
        '物理': 'physics',
        '数学': 'math',
        '化学': 'chemistry',
        '生物': 'biology',
        '科学': 'science',
        '语文': 'chinese',
        '英语': 'english',
        '信息': 'tech',
        '通用': 'common',
        '历史': 'history',
        '政治': 'politics',
        '地理': 'geography',
        'python': 'python'
      }
      
      // 学段映射表
      const stageMap = {
        '高中': 'high',
        '初中': 'middle'
      }
      
      // 分割路径
      const pathParts = chinesePath.split('/')
      if (pathParts.length < 2) return chinesePath
      
      // 转换学段
      let stage = pathParts[0]
      if (stageMap[stage]) {
        stage = stageMap[stage]
      }
      
      // 转换科目
      let subject = pathParts[1]
      if (subjectMap[subject]) {
        subject = subjectMap[subject]
      }
      
      // 构建英文路径
      const englishPath = `./knowledge_tree/${stage}/${subject}/${pathParts.slice(2).join('/')}`
      
      console.log('路径转换:', {
        原始路径: chinesePath,
        转换后路径: englishPath,
        学段: pathParts[0] + ' -> ' + stage,
        科目: pathParts[1] + ' -> ' + subject
      })
      
      return englishPath
    },

    // 确认选择
    confirmSelection() {
      if (!this.selectedChapterPath) {
        this.$message.error('请选择章节路径')
        return
      }
      
      // 再次检查是否选择了合适的章节节点
      if (!this.selectedChapterData || !this.isSelectableChapterNode(this.selectedChapterData)) {
        this.$message.error('请选择到合适的章节层级（带✓标记的蓝色节点）')
        return
      }
      
      // 触发确认事件，传递选择的章节数据
      this.$emit('confirm', {
        chapterPath: this.selectedChapterPath,
        chapterData: this.selectedChapterData
      })
      
      // 关闭弹窗
      this.handleDialogClose()
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false
      this.selectedChapterPath = ''
      this.selectedChapterData = null
      this.$emit('close')
    },

    // 过滤最后一级节点
    filterLastLevelNodes(nodes) {
      return nodes.map(node => {
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: this.filterLastLevelNodes(node.children)
          }
        }
        return node
      })
    },



    // 根据学科过滤章节树
    filterChapterTreeBySubject(allChapterData, subjectName) {
      if (!subjectName) return allChapterData
      
      console.log('开始过滤学科:', subjectName)
      console.log('原始章节数据:', allChapterData)
      
      // 解析学科名称，提取年级和学科
      const { stage, subject } = this.parseSubjectName(subjectName)
      console.log('解析结果 - 年级:', stage, '学科:', subject)
      
      // 查找匹配的年级和学科
      for (const stageNode of allChapterData) {
        // 检查年级是否匹配
        if (stage && stageNode.label && stageNode.label.includes(stage)) {
          console.log('找到匹配的年级:', stageNode.label)
          
          if (stageNode.children) {
            for (const subjectNode of stageNode.children) {
              // 检查学科是否匹配
              if (subject && subjectNode.label && subjectNode.label.includes(subject)) {
                console.log('找到匹配的学科:', subjectNode.label)
                return [{
                  label: stageNode.label,
                  value: stageNode.value,
                  children: [subjectNode]
                }]
              }
            }
          }
        }
      }
      
      console.log('未找到匹配的学科，返回原始数据')
      return allChapterData
    },

    // 解析学科名称
    parseSubjectName(subjectName) {
      if (!subjectName) return { stage: null, subject: null }
      
      let stage = null
      let subject = subjectName
      
      // 检查是否包含年级信息
      if (subjectName.includes('初中')) {
        stage = '初中'
        subject = subjectName.replace('初中', '').trim()
      } else if (subjectName.includes('高中')) {
        stage = '高中'
        subject = subjectName.replace('高中', '').trim()
      }
      
      return { stage, subject }
    }
  }
}
</script>

<style scoped>
.chapter-selection {
  display: flex;
  gap: 20px;
  height: 500px;
}

.chapter-tree {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.no-data-content {
  text-align: center;
}

.no-data-content i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.no-data-content p {
  margin: 8px 0;
  font-size: 14px;
}

.no-data-tip {
  font-size: 12px;
  color: #c0c4cc;
}

.selected-chapter {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f9fa;
}

.selected-chapter h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.chapter-path {
  font-weight: bold;
  color: #409eff;
  margin: 10px 0;
  padding: 8px;
  background-color: #ecf5ff;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
}

.selected-info {
  margin: 15px 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.selected-info p {
  margin: 5px 0;
  font-size: 13px;
}

.selection-tip {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.selection-tip i {
  color: #409eff;
  margin-right: 5px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.selectable-node {
  color: #409eff;
  font-weight: bold;
  cursor: pointer;
}

.selectable-node:hover {
  background-color: #ecf5ff;
  border-radius: 3px;
  padding: 2px 4px;
}

.parent-node {
  color: #606266;
  cursor: pointer;
}

.leaf-node {
  color: #909399;
  cursor: default;
}

.selectable-indicator {
  color: #67c23a;
  font-weight: bold;
  margin-left: 5px;
}

.parent-indicator {
  margin-left: 5px;
  font-size: 12px;
}

.leaf-indicator {
  margin-left: 5px;
  color: #c0c4cc;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}
</style>