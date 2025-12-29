<template>
  <div class="left-panel">
    <div class="panel-header" v-if="!hideTabs">
      <h3>数据源选择</h3>
    </div>

    <!-- 数据源切换按钮（仅在非隐藏模式下显示） -->
    <div v-if="!hideTabs" class="data-source-tabs">
      <el-button-group>
        <el-button
          :type="dataSourceType === 'chapter' ? 'primary' : ''"
          size="small"
          @click="switchDataSource('chapter')"
        >
          章节选择
        </el-button>
        <el-button
          :type="dataSourceType === 'knowledge' ? 'primary' : ''"
          size="small"
          @click="switchDataSource('knowledge')"
        >
          知识点选择
        </el-button>
        <el-button
          :type="dataSourceType === 'material' ? 'primary' : ''"
          size="small"
          @click="switchDataSource('material')"
        >
          教辅材料
        </el-button>
        <el-button
          :type="dataSourceType === 'photo' ? 'primary' : ''"
          size="small"
          @click="switchDataSource('photo')"
        >
          拍照搜题
        </el-button>
        <el-button
          :type="dataSourceType === 'thirdParty' ? 'primary' : ''"
          size="small"
          @click="switchDataSource('thirdParty')"
        >
          菁优网搜题
        </el-button>
      </el-button-group>
    </div>

    <!-- 章节选择 -->
    <div v-if="dataSourceType === 'chapter'" class="data-source-content">
      <div class="source-title">章节选择</div>
      <!-- 版本选择下拉框 -->
      <div class="version-selector">
        <el-select
          v-model="localSelectedVersion"
          :placeholder="versionPlaceholder"
          size="small"
          style="width: 100%"
          @change="handleVersionChange"
          clearable
        >
          <el-option
            v-for="version in versionOptions"
            :key="version.value"
            :label="version.label"
            :value="version.value"
          />
        </el-select>
      </div>
      <div class="chapter-tree">
        <div v-if="chapterOptions.length === 0" class="no-chapters">
          <i class="el-icon-document"></i>
          <p>暂无数据</p>
          <p class="no-data-tip">正在加载章节数据...</p>
        </div>
        <el-tree
          v-else
          :data="chapterOptions"
          :props="chapterProps"
          node-key="value"
          :expand-on-click-node="true"
          @node-click="handleChapterClick"
          :highlight-current="true"
          :default-expand-all="false"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span :title="node.label">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </div>

    <!-- 知识点选择 -->
    <div v-if="dataSourceType === 'knowledge'" class="data-source-content">
      <div class="source-title">知识点选择</div>

      <!-- 知识点搜索下拉框 -->
      <div class="knowledge-search-bar">
        <el-autocomplete
          v-model="localKnowledgeSearchKeyword"
          :fetch-suggestions="queryKnowledgeSearch"
          placeholder="搜索知识点"
          @select="handleKnowledgeSelect"
          @input="handleKnowledgeSearchInput"
          clearable
          class="knowledge-search-input"
          :popper-class="'knowledge-autocomplete-popper'"
          value-key="label"
        >
          <template slot-scope="{ item }">
            <div class="knowledge-autocomplete-item">{{ item.label }}</div>
          </template>
        </el-autocomplete>
      </div>

      <!-- 知识点树 -->
      <div class="knowledge-tree">
        <el-tree
          :data="knowledgeOptions"
          :props="knowledgeProps"
          node-key="value"
          :expand-on-click-node="true"
          @node-click="handleKnowledgeClick"
          :highlight-current="true"
          :default-expand-all="false"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span :title="node.label">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </div>

    <!-- 教辅材料选择 -->
    <div v-if="dataSourceType === 'material'" class="data-source-content">
      <div class="source-title">
        <span class="back-button" @click="handleBackToCardView" title="返回图形化视图">
          <i class="el-icon-arrow-left"></i> 返回
        </span>
        <span class="title-text">教辅材料选择</span>
      </div>

      <div class="material-list">
        <div v-if="loadingMaterials" class="loading-materials">
          <i class="el-icon-loading"></i>
          <p>正在加载教辅材料...</p>
        </div>
        <div v-else-if="!isAdmin && !teacherSubjectName" class="no-materials">
          <i class="el-icon-info"></i>
          <p>正在获取教师信息...</p>
        </div>
        <div v-else-if="isAdmin && !selectedSubjectForMaterial" class="no-materials">
          <i class="el-icon-info"></i>
          <p>请先选择科目</p>
        </div>
        <div v-else-if="materialOptions.length === 0" class="no-materials">
          <i class="el-icon-document"></i>
          <p>该科目暂无教辅材料数据</p>
        </div>
        <div v-else class="material-tree">
          <el-tree
            ref="materialTree"
            :data="materialOptions"
            :props="materialProps"
            node-key="id"
            :expand-on-click-node="true"
            @node-click="handleMaterialClick"
            :highlight-current="true"
            :default-expand-all="false"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span class="tree-node-label" :title="node.label">{{ node.label }}</span>
            </span>
          </el-tree>
        </div>
      </div>
    </div>

    <!-- 拍照搜题 -->
    <div v-if="dataSourceType === 'photo'" class="data-source-content">
      <slot name="photo-search"></slot>
    </div>

    <!-- 菁优网搜题 -->
    <div v-if="dataSourceType === 'thirdParty'" class="data-source-content">
      <slot name="third-party-search"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataSourceSelector',
  props: {
    dataSourceType: {
      type: String,
      default: 'chapter'
    },
    hideTabs: {
      type: Boolean,
      default: false
    },
    chapterOptions: {
      type: Array,
      default: () => []
    },
    knowledgeOptions: {
      type: Array,
      default: () => []
    },
    knowledgeList: {
      type: Array,
      default: () => []
    },
    knowledgeSearchKeyword: {
      type: String,
      default: ''
    },
    materialOptions: {
      type: Array,
      default: () => []
    },
    loadingMaterials: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    teacherSubjectName: {
      type: String,
      default: ''
    },
    selectedSubjectForMaterial: {
      type: String,
      default: ''
    },
    materialSubjectOptions: {
      type: Array,
      default: () => []
    },
    selectedSeriesType: {
      type: String,
      default: ''
    },
    seriesSearchKeyword: {
      type: String,
      default: ''
    },
    seriesTypeOptions: {
      type: Array,
      default: () => [
        { label: '书', value: '书' },
        { label: '试卷', value: '试卷' },
        { label: '视频', value: '视频' }
      ]
    },
    versionOptions: {
      type: Array,
      default: () => []
    },
    selectedVersion: {
      type: String,
      default: ''
    },
    schoolName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      localSelectedSeriesType: this.selectedSeriesType,
      localSeriesSearchKeyword: this.seriesSearchKeyword,
      localKnowledgeSearchKeyword: this.knowledgeSearchKeyword,
      localSelectedVersion: this.selectedVersion,
      chapterProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true,
        emitPath: false,
        expandTrigger: 'click'
      },
      knowledgeProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true,
        emitPath: false,
        expandTrigger: 'click'
      },
      materialProps: {
        label: 'label',
        value: 'id',
        children: 'children'
      }
    }
  },
  computed: {
    versionPlaceholder() {
      if (this.schoolName) {
        return `${this.schoolName}教材`
      }
      return '请选择版本'
    }
  },
  watch: {
    selectedSeriesType(newVal) {
      this.localSelectedSeriesType = newVal
    },
    seriesSearchKeyword(newVal) {
      this.localSeriesSearchKeyword = newVal
    },
    knowledgeSearchKeyword(newVal) {
      this.localKnowledgeSearchKeyword = newVal
    },
    selectedVersion(newVal) {
      this.localSelectedVersion = newVal
    }
  },
  methods: {
    switchDataSource(type) {
      this.$emit('switch-data-source', type)
    },
    handleChapterClick(data, node) {
      this.$emit('chapter-click', data, node)
    },
    handleKnowledgeClick(data, node) {
      this.$emit('knowledge-click', data, node)
    },
    handleMaterialClick(data, node) {
      this.$emit('material-click', data, node)
    },
    onSeriesTypeChange(seriesType) {
      this.$emit('series-type-change', seriesType)
    },
    onSeriesSearch(keyword) {
      this.$emit('series-search', keyword)
    },
    // 知识点搜索查询（用于 el-autocomplete）
    queryKnowledgeSearch(queryString, cb) {
      if (!this.knowledgeList || !Array.isArray(this.knowledgeList)) {
        cb([])
        return
      }

      const results = this.knowledgeList
        .filter(item => {
          if (!queryString || !queryString.trim()) {
            return true
          }
          // 支持对象格式（knowledge_flat）和字符串格式（旧格式）
          const label = typeof item === 'string' ? item : (item.label || item.name || '')
          return label && label.toLowerCase().includes(queryString.trim().toLowerCase())
        })
        .map(item => {
          // 如果是对象格式（knowledge_flat），保留完整信息
          if (typeof item === 'object' && item.code) {
            return {
              label: item.label || item.name,
              value: item.value || item.path || item.code,
              code: item.code,
              path: item.path,
              id: item.id
            }
          }
          // 如果是字符串格式（旧格式），转换为对象
          return { label: item, value: item }
        })

      // 限制显示数量，避免下拉框过长
      const maxResults = 100
      cb(results.slice(0, maxResults))
    },
    // 处理知识点选择
    handleKnowledgeSelect(item) {
      if (item && item.label) {
        // 将选中的知识点显示在搜索框中
        this.localKnowledgeSearchKeyword = item.label
        this.$emit('knowledge-search-input', item.label)
        // 触发知识点点击事件，传递完整的 item 对象（包含 code）
        this.$emit('knowledge-list-item-click', item)
      }
    },
    handleKnowledgeSearchInput(value) {
      this.$emit('knowledge-search-input', value)
    },
    // 处理版本选择变化
    handleVersionChange(version) {
      this.$emit('version-change', version)
    },
    // 处理返回图形化视图
    handleBackToCardView() {
      this.$emit('back-to-card-view')
    }
  }
}
</script>

<style scoped>
.left-panel {
  width: 350px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
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

.data-source-tabs {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.data-source-content {
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.version-selector {
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #409eff;
  font-size: 14px;
  font-weight: normal;
  transition: color 0.3s;
  user-select: none;
}

.back-button:hover {
  color: #66b1ff;
}

.back-button i {
  font-size: 16px;
}

.title-text {
  flex: 1;
}

.chapter-tree,
.knowledge-tree {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  min-width: 0;
}

.custom-tree-node > span {
  flex: 1;
  min-width: 0;
}

.tree-node-label {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.material-filter {
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-row-combined {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-item {
  flex: 1;
  min-width: 0;
}

.series-type-select {
  flex: 0 0 auto;
  min-width: 100px;
  max-width: 120px;
}

.series-search-input {
  flex: 1;
  min-width: 0;
}

.teacher-subject-display {
  flex: 1;
}

.teacher-subject-info {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 14px;
}

.teacher-subject-info i {
  margin-right: 8px;
  font-size: 16px;
}

.subject-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.no-subject-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fef0f0;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}

.no-subject-hint i {
  font-size: 16px;
}

.material-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.material-tree {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.loading-materials,
.no-materials,
.no-chapters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
}

.loading-materials i,
.no-materials i,
.no-chapters i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

.loading-materials i {
  animation: rotate 1s linear infinite;
}

.loading-materials p,
.no-materials p,
.no-chapters p {
  margin: 8px 0;
  font-size: 14px;
}

.no-data-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 5px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 滚动条样式 */
.chapter-tree::-webkit-scrollbar,
.knowledge-tree::-webkit-scrollbar,
.material-tree::-webkit-scrollbar {
  width: 6px;
}

.chapter-tree::-webkit-scrollbar-thumb,
.knowledge-tree::-webkit-scrollbar-thumb,
.material-tree::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.chapter-tree::-webkit-scrollbar-track,
.knowledge-tree::-webkit-scrollbar-track,
.material-tree::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 知识点搜索相关样式 */
.knowledge-search-bar {
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.knowledge-search-input {
  width: 100%;
}

.knowledge-autocomplete-item {
  font-size: 14px;
  color: #303133;
  padding: 5px 0;
}
</style>

<style>
/* 知识点自动完成下拉框样式 */
.knowledge-autocomplete-popper {
  max-height: 400px !important;
}

.knowledge-autocomplete-popper .el-autocomplete-suggestion__wrap {
  max-height: 400px !important;
  overflow-y: auto !important;
}

.knowledge-autocomplete-popper .el-autocomplete-suggestion__list {
  max-height: none !important;
  padding: 0 !important;
}

.knowledge-autocomplete-popper .el-autocomplete-suggestion__item {
  padding: 10px 15px;
  font-size: 14px;
  line-height: 1.5;
  white-space: normal;
  word-break: break-all;
}

.knowledge-autocomplete-popper .el-autocomplete-suggestion__item.highlighted {
  background-color: #f5f7fa;
}
</style>
