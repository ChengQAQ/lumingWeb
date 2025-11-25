<template>
  <div class="material-card-view">
    <!-- 筛选栏 -->
    <div class="material-filter-bar">
      <div class="filter-row">
        <!-- 系列类型筛选 -->
        <el-select 
          v-model="localSelectedSeriesType" 
          placeholder="选择系列类型" 
          @change="handleSeriesTypeChange"
          class="series-type-select"
          clearable
          size="medium"
        >
          <el-option
            v-for="item in seriesTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        
        <!-- 年份筛选 -->
        <el-select 
          v-model="localSelectedYear" 
          placeholder="选择年份" 
          @change="handleYearChange"
          class="year-select"
          clearable
          size="medium"
        >
          <el-option
            v-for="year in availableYears"
            :key="year"
            :label="`${year}年`"
            :value="year"
          />
        </el-select>
        
        <!-- 系列搜索 -->
        <el-input
          v-model="localSeriesSearchKeyword"
          placeholder="搜索系列名称"
          @input="handleSeriesSearch"
          class="series-search-input"
          clearable
          size="medium"
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <i class="el-icon-loading"></i>
      <p>正在加载教辅材料...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredMaterials.length === 0" class="empty-container">
      <i class="el-icon-document"></i>
      <p>暂无教辅材料数据</p>
    </div>

    <!-- 卡片网格和分页 -->
    <div v-else class="material-content-wrapper">
      <div class="material-cards-grid">
        <div
          v-for="material in paginatedMaterials"
          :key="material.id"
          class="material-card"
          @click="handleCardClick(material)"
        >
          <!-- 书籍封面背景 -->
          <div class="book-cover">
            <img src="@/assets/images/book.png" alt="教辅材料" class="book-background" />
            
            <!-- 类型标签 -->
            <div class="card-type-badge" :class="getTypeClass(material.type)">
              {{ getTypeText(material.type) }}
            </div>
            
            <!-- 年份和学科 -->
            <div class="book-year-subject">
              <span v-if="material.year">{{ material.year }}年</span>
              <span v-if="material.year && material.subjectName">·</span>
              <span v-if="material.subjectName">{{ material.subjectName }}</span>
            </div>
            
            <!-- 系列名称（标题）- 居中显示 -->
            <div class="book-title">
              {{ material.series || material.label || '未命名教辅材料' }}
            </div>
            
            <!-- 详细信息（年级、册数等） -->
            <div class="book-details" v-if="getMaterialDetails(material)">
              {{ getMaterialDetails(material) }}
            </div>
            
            <!-- 出版社/版本 -->
            <div class="book-publisher" v-if="getPublisher(material)">
              {{ getPublisher(material) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页组件 -->
      <div class="material-pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[12, 24, 36, 48]"
          :page-size="pageSize"
          :total="filteredMaterials.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialCardView',
  props: {
    materials: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
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
    }
  },
  data() {
    return {
      localSelectedSeriesType: this.selectedSeriesType,
      localSeriesSearchKeyword: this.seriesSearchKeyword,
      localSelectedYear: '',
      currentPage: 1,
      pageSize: 12
    }
  },
  computed: {
    // 获取所有可用的年份列表（去重并排序）
    availableYears() {
      if (!this.materials || this.materials.length === 0) {
        return []
      }
      const years = this.materials
        .map(material => material.year)
        .filter(year => year && year !== null && year !== undefined && year !== '')
        .map(year => String(year).trim())
      // 去重并排序（降序，最新的年份在前）
      return [...new Set(years)].sort((a, b) => {
        const numA = parseInt(a)
        const numB = parseInt(b)
        if (!isNaN(numA) && !isNaN(numB)) {
          return numB - numA
        }
        return b.localeCompare(a)
      })
    },
    // 过滤后的教辅材料列表
    filteredMaterials() {
      if (!this.materials || this.materials.length === 0) {
        return []
      }

      let filtered = [...this.materials]

      // 按系列类型过滤
      if (this.localSelectedSeriesType) {
        filtered = filtered.filter(material => {
          return material.type === this.localSelectedSeriesType
        })
      }

      // 按年份过滤
      if (this.localSelectedYear) {
        filtered = filtered.filter(material => {
          return String(material.year).trim() === String(this.localSelectedYear).trim()
        })
      }

      // 按搜索关键词过滤
      if (this.localSeriesSearchKeyword) {
        const keyword = this.localSeriesSearchKeyword.toLowerCase()
        filtered = filtered.filter(material => {
          const seriesMatch = material.series && material.series.toLowerCase().includes(keyword)
          const labelMatch = material.label && material.label.toLowerCase().includes(keyword)
          return seriesMatch || labelMatch
        })
      }

      return filtered
    },
    // 当前页显示的材料列表
    paginatedMaterials() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredMaterials.slice(start, end)
    }
  },
  watch: {
    selectedSeriesType(newVal) {
      this.localSelectedSeriesType = newVal
      // 筛选条件变化时，重置到第一页
      this.currentPage = 1
    },
    seriesSearchKeyword(newVal) {
      this.localSeriesSearchKeyword = newVal
      // 搜索关键词变化时，重置到第一页
      this.currentPage = 1
    },
    // 监听过滤后的材料列表变化，如果当前页超出范围，重置到第一页
    filteredMaterials() {
      const totalPages = Math.ceil(this.filteredMaterials.length / this.pageSize)
      if (this.currentPage > totalPages && totalPages > 0) {
        this.currentPage = 1
      }
    },
    // 监听年份变化，重置到第一页
    localSelectedYear() {
      this.currentPage = 1
    }
  },
  methods: {
    // 处理系列类型变化
    handleSeriesTypeChange(seriesType) {
      this.$emit('series-type-change', seriesType)
    },
    // 处理系列搜索
    handleSeriesSearch(keyword) {
      this.$emit('series-search', keyword)
    },
    // 处理年份变化
    handleYearChange(year) {
      // 年份变化时，重置到第一页
      this.currentPage = 1
    },
    // 处理卡片点击
    handleCardClick(material) {
      this.$emit('material-click', material)
    },
    // 获取类型样式类
    getTypeClass(type) {
      const typeMap = {
        '书': 'type-book',
        '试卷': 'type-paper',
        '视频': 'type-video'
      }
      return typeMap[type] || 'type-default'
    },
    // 获取类型文本
    getTypeText(type) {
      return type || '未知'
    },
    // 获取材料详细信息（年级、册数等）
    getMaterialDetails(material) {
      const details = []
      
      // 从 series 中尝试提取册数信息（优先）
      if (material.series) {
        // 匹配各种册数格式：第一册、第1册、第一册、必修第一册等
        const volumePatterns = [
          /(第[一二三四五六七八九十\d]+册)/,
          /(必修\s*第?[一二三四五六七八九十\d]+册)/,
          /(选修\s*第?[一二三四五六七八九十\d]+册)/,
          /([上下]册)/,
          /(第[一二三四五六七八九十\d]+卷)/
        ]
        
        for (const pattern of volumePatterns) {
          const match = material.series.match(pattern)
          if (match && match[1]) {
            const volume = match[1].trim()
            if (!details.includes(volume)) {
              details.push(volume)
              break // 找到第一个匹配就停止
            }
          }
        }
      }
      
      // 如果从 series 没找到，从 contents 中解析
      if (details.length === 0 && material.contents) {
        try {
          let contents = material.contents
          if (typeof contents === 'string') {
            contents = JSON.parse(contents)
          }
          
          if (Array.isArray(contents) && contents.length > 0) {
            const firstItem = contents[0]
            if (firstItem && firstItem.title) {
              const titleMatch = firstItem.title.match(/(第[一二三四五六七八九十\d]+册|必修\s*第?[一二三四五六七八九十\d]+册?|选修\s*第?[一二三四五六七八九十\d]+册?)/)
              if (titleMatch && titleMatch[1]) {
                details.push(titleMatch[1].trim())
              }
            }
          }
        } catch (e) {
          // 解析失败，忽略
        }
      }
      
      // 如果还是没有，尝试从 grade 字段获取年级信息
      if (details.length === 0 && material.grade) {
        details.push(material.grade)
      }
      
      return details.length > 0 ? `(${details[0]})` : ''
    },
    // 获取出版社/版本信息
    getPublisher(material) {
      // 尝试从 series 中提取出版社信息
      if (material.series) {
        // 匹配如：人教版(2019)、人教版（2019）等
        const publisherMatch = material.series.match(/([^（(]+)(\(|（)(\d{4})(\)|）)/)
        if (publisherMatch && publisherMatch[1]) {
          const publisher = publisherMatch[1].trim()
          const year = publisherMatch[3]
          // 过滤掉常见的非出版社词汇
          if (!['年', '册', '必修', '选修'].includes(publisher) && publisher.length > 0) {
            return `${publisher}(${year})`
          }
        }
        
        // 如果没有匹配到年份，尝试只匹配出版社名称
        const simpleMatch = material.series.match(/(人教版|苏教版|北师大版|浙教版|沪教版|鲁教版|冀教版|湘教版|外研版|译林版)/)
        if (simpleMatch) {
          return simpleMatch[1]
        }
      }
      
      // 如果没有匹配到，返回空
      return ''
    },
    // 处理每页数量变化
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    // 处理当前页变化
    handleCurrentChange(val) {
      this.currentPage = val
      // 滚动到顶部
      const gridElement = this.$el.querySelector('.material-cards-grid')
      if (gridElement) {
        gridElement.scrollTop = 0
      }
    }
  }
}
</script>

<style scoped>
.material-card-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.material-filter-bar {
  padding: 10px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.filter-row {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: flex-end;
}

.series-type-select {
  width: 150px;
}

.year-select {
  width: 130px;
}

.series-search-input {
  flex: 1;
  max-width: 300px;
}

.loading-container,
.empty-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-container i,
.empty-container i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

.loading-container i {
  animation: rotate 1s linear infinite;
}

.loading-container p,
.empty-container p {
  margin: 8px 0;
  font-size: 14px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.material-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.material-cards-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  align-content: start;
}

@media (max-width: 1600px) {
  .material-cards-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1200px) {
  .material-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .material-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .material-cards-grid {
    grid-template-columns: 1fr;
  }
}

.material-pagination {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.material-card {
  position: relative;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  aspect-ratio: 3 / 4;
  height: 280px;
}

.material-card:hover {
  border-color: #409eff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
  transform: translateY(-4px);
}

/* 书籍封面样式 */
.book-cover {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.book-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  z-index: 0;
  pointer-events: none;
}

/* 类型标签 */
.card-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  z-index: 3;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  white-space: nowrap;
}

.type-book {
  background: #409eff;
}

.type-paper {
  background: #67c23a;
}

.type-video {
  background: #e6a23c;
}

.type-default {
  background: #909399;
}

/* 年份和学科 */
.book-year-subject {
  position: relative;
  padding: 15px 14px 0 30px;
  font-size: 12px;
  color: #303133;
  font-weight: 600;
  z-index: 2;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  line-height: 1.3;
}

.book-year-subject span {
  margin: 0 1px;
}

/* 系列名称（标题）- 居中显示 */
.book-title {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 28px);
  padding: 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  line-height: 1.6;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  z-index: 2;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  word-break: break-word;
  /* max-height: 80px; */
}

/* 详细信息（册数等，显示在底部） */
.book-details {
  position: relative;
  padding: 0 14px 8px 14px;
  font-size: 12px;
  color: #606266;
  line-height: 1.3;
  z-index: 2;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-top: auto;
}

/* 出版社/版本（如果有，显示在详细信息下方） */
.book-publisher {
  position: relative;
  padding: 0 14px 10px 14px;
  font-size: 11px;
  color: #909399;
  z-index: 2;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
}

/* 滚动条样式 */
.material-cards-grid::-webkit-scrollbar {
  width: 6px;
}

.material-cards-grid::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.material-cards-grid::-webkit-scrollbar-track {
  background: #f5f7fa;
}
</style>
