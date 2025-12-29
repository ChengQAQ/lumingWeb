<template>
  <el-dialog
    title="选择系列路径"
    :visible.sync="dialogVisible"
    width="60%"
    :before-close="handleDialogClose"
    @close="handleDialogClose"
    append-to-body
    :modal="true"
    :modal-append-to-body="true"
  >
    <div class="series-path-selection">
      <div class="series-path-tree">
        <div v-if="seriesPathTreeData.length === 0" class="no-data">
          <div class="no-data-content">
            <i class="el-icon-document"></i>
            <p>暂无系列路径数据</p>
            <p class="no-data-tip">请先选择系列或联系管理员</p>
          </div>
        </div>
        <el-tree
          v-else
          ref="seriesPathTree"
          :data="seriesPathTreeData"
          :props="seriesPathTreeProps"
          node-key="value"
          :default-expand-all="false"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-click="handleSeriesPathNodeClick"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span :class="{
              'selectable-node': isSelectableSeriesPathNode(data),
              'leaf-node': !data.children || data.children.length === 0,
              'parent-node': data.children && data.children.length > 0 && !isSelectableSeriesPathNode(data)
            }">
              {{ node.label }}
              <span v-if="isSelectableSeriesPathNode(data)" class="selectable-indicator">✓</span>
              <span v-else-if="!data.children || data.children.length === 0" class="leaf-indicator"></span>
              <span v-else class="parent-indicator">📁</span>
            </span>
          </span>
        </el-tree>
      </div>

      <div class="selected-series-path">
        <h4>已选择系列路径：</h4>
        <p class="series-path-text">{{ selectedSeriesPath || '未选择' }}</p>
        <div v-if="selectedSeriesPathData" class="selected-info">
          <p><strong>选择的节点：</strong>{{ selectedSeriesPathData.label }}</p>
          <p><strong>节点值：</strong>{{ selectedSeriesPathData.value }}</p>
        </div>
        <div class="selection-tip">
          <i class="el-icon-info"></i>
          <span>请选择系列路径级别（带✓标记的蓝色节点），可以选择：章、节、小节等层级，但不能选择：年级、必修、学科级别或具体的知识点。</span>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button
        type="primary"
        :disabled="!selectedSeriesPath"
        @click="confirmSelection"
      >
        确认选择
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SeriesPathDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    seriesData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      seriesPathTreeData: [],
      seriesPathTreeProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      selectedSeriesPath: '',
      selectedSeriesPathData: null,
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
    seriesData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0 && this.visible) {
          this.loadSeriesPathTreeData()
        }
      },
      deep: true
    }
  },
  methods: {
    // 初始化弹窗
    initDialog() {
      this.selectedSeriesPath = ''
      this.selectedSeriesPathData = null

      // 如果没有系列数据，先加载空数据
      if (!this.seriesData || Object.keys(this.seriesData).length === 0) {
        this.seriesPathTreeData = []
        this.$message.warning('请先选择系列')
        return
      }

      this.loadSeriesPathTreeData()
    },

    // 加载系列路径树数据
    async loadSeriesPathTreeData() {
      if (!this.seriesData || Object.keys(this.seriesData).length === 0) {
        this.$message.warning('请先选择系列')
        return
      }

      this.loading = true
      try {
        console.log('系列数据:', this.seriesData)

        // 解析contents字段构建树形结构
        this.seriesPathTreeData = this.parseSeriesContentsToTree(this.seriesData)
        console.log('解析后的系列路径树数据:', this.seriesPathTreeData)

        if (this.seriesPathTreeData.length === 0) {
          this.$message.warning('该系列暂无路径数据')
        }
      } catch (error) {
        console.error('加载系列路径树数据失败:', error)
        this.seriesPathTreeData = []
        this.$message.error('加载系列路径树数据失败')
      } finally {
        this.loading = false
      }
    },

    // 解析系列contents字段为树形结构
    parseSeriesContentsToTree(seriesData) {
      if (!seriesData.contents) {
        return []
      }

      try {
        let contents = seriesData.contents
        if (typeof contents === 'string') {
          contents = JSON.parse(contents)
        }

        // 构建基础路径信息
        const basePath = {
          series: seriesData.series || '',
          subjectName: seriesData.subjectName || seriesData.subject_name || '',
          grade: seriesData.grade || '',
          year: seriesData.year || ''
        }

        // 将contents转换为树形结构
        return this.convertContentsToTree(contents, basePath)
      } catch (error) {
        console.error('解析系列contents失败:', error)
        return []
      }
    },

    // 将contents数据转换为树形结构
    convertContentsToTree(contents, basePath) {
      if (!Array.isArray(contents)) {
        return []
      }

      return contents.map((item, index) => {
        const node = {
          label: item.title || `章节${index + 1}`,
          value: item.id || `chapter_${index}`,
          level: item.level || 1,
          children: []
        }

        // 递归处理子节点
        if (item.children && Array.isArray(item.children)) {
          node.children = this.convertContentsToTree(item.children, basePath)
        }

        return node
      })
    },

    // 处理系列路径节点点击
    handleSeriesPathNodeClick(data, node) {
      console.log('系列路径节点被点击:', data)
      console.log('节点信息:', node)

      // 检查是否为可选择的节点
      const isSelectableNode = this.isSelectableSeriesPathNode(data)
      console.log('是否为可选择的系列路径节点:', isSelectableNode)

      if (isSelectableNode) {
        // 构建路径
        const path = this.buildSeriesPath(data)
        console.log('构建的系列路径:', path)
        if (path) {
          this.selectedSeriesPath = path
          this.selectedSeriesPathData = data
          console.log('设置的系列路径:', this.selectedSeriesPath)
        } else {
          console.error('系列路径构建失败')
          this.$message.error('系列路径构建失败')
        }
      } else {
        // 不可选择的节点
        this.selectedSeriesPath = ''
        this.selectedSeriesPathData = null
        console.log('不可选择的节点，清空选择')
      }
    },

    // 判断是否为可选择的系列路径节点
    isSelectableSeriesPathNode(data) {
      // 有子节点的不能选择（层级过高）
      if (data.children && data.children.length > 0) {
        return false
      }

      // 没有子节点的可以选择（具体章节级别）
      return true
    },

    // 构建系列路径
    buildSeriesPath(data) {
      console.log('构建系列路径，输入数据:', data)

      // 只返回章节路径
      const chapterPath = this.findNodePath(this.seriesPathTreeData, data.value)
      return chapterPath || ''
    },

    // 查找节点在树中的路径
    findNodePath(treeData, targetValue, path = []) {
      for (let node of treeData) {
        const newPath = [...path, node.label]
        if (node.value === targetValue) {
          return newPath.join('/')
        }
        if (node.children && node.children.length > 0) {
          const found = this.findNodePath(node.children, targetValue, newPath)
          if (found) return found
        }
      }
      return null
    },

    // 确认选择
    confirmSelection() {
      if (!this.selectedSeriesPath) {
        this.$message.error('请选择系列路径')
        return
      }

      // 再次检查是否选择了合适的系列路径节点
      if (!this.selectedSeriesPathData || !this.isSelectableSeriesPathNode(this.selectedSeriesPathData)) {
        this.$message.error('请选择到合适的系列路径层级（带✓标记的蓝色节点）')
        return
      }

      // 触发确认事件，传递选择的系列路径数据
      this.$emit('confirm', {
        seriesPath: this.selectedSeriesPath,
        seriesPathData: this.selectedSeriesPathData
      })

      // 关闭弹窗
      this.handleDialogClose()
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false
      this.selectedSeriesPath = ''
      this.selectedSeriesPathData = null
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.series-path-selection {
  display: flex;
  gap: 20px;
  height: 500px;
}

.series-path-tree {
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

.selected-series-path {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f9fa;
}

.selected-series-path h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.series-path-text {
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
  background-color: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
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
