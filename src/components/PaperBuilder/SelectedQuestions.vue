<template>
  <div class="selected-questions">
    <div class="panel-header">
      <h3>已选题目 ({{ selectedQuestions.length }})</h3>
      <div class="search-box">
        <el-input
          v-model="selectedSearch"
          placeholder="搜索已选题目..."
          prefix-icon="el-icon-search"
          clearable
          @input="filterSelectedQuestions"
        />
      </div>
    </div>
    <div class="selected-list">
      <div
        v-for="question in filteredSelectedQuestions"
        :key="question.sid"
        class="selected-item"
      >
        <div class="selected-content">
          <div class="selected-text" v-html="processQuestionContent(question.question)"></div>
          <div class="selected-info">
            <span class="question-type">{{ getQuestionType(question) }}</span>
            <span class="question-difficulty">难度: {{ getQuestionDifficulty(question) }}</span>
          </div>
        </div>
        <div class="selected-actions">
          <el-button
            type="text"
            size="small"
            @click="showAnalysis(question)"
          >
            解析
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="removeFromPaper(question.sid)"
          >
            移除
          </el-button>
        </div>
      </div>
      <div v-if="filteredSelectedQuestions.length === 0" class="no-data">
        <el-empty description="暂无已选题目"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectedQuestions',
  props: {
    selectedQuestions: {
      type: Array,
      default: () => []
    },
    processQuestionContent: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      selectedSearch: '',
      filteredSelectedQuestions: []
    }
  },
  watch: {
    selectedQuestions: {
      handler(newQuestions) {
        this.filterSelectedQuestions()
      },
      immediate: true
    }
  },
  methods: {
    getQuestionType(question) {
      return question.cate || question.catename || question.CateName || question.qtype || '未知题型'
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
        if (diff >= 0 && diff <= 0.2) return '困难'
        if (diff > 0.2 && diff <= 0.4) return '较难'
        if (diff > 0.4 && diff <= 0.6) return '中等'
        if (diff > 0.6 && diff <= 0.8) return '较易'
        if (diff > 0.8 && diff <= 1) return '简单'
      }

      return '未知'
    },
    filterSelectedQuestions() {
      if (!this.selectedSearch) {
        this.filteredSelectedQuestions = [...this.selectedQuestions]
      } else {
        this.filteredSelectedQuestions = this.selectedQuestions.filter(question =>
          question.question.toLowerCase().includes(this.selectedSearch.toLowerCase()) ||
          this.getQuestionType(question).toLowerCase().includes(this.selectedSearch.toLowerCase())
        )
      }
    },
    showAnalysis(question) {
      this.$emit('show-analysis', question)
    },
    removeFromPaper(sid) {
      this.$emit('remove-from-paper', sid)
    }
  }
}
</script>

<style scoped>
.selected-questions {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  min-height: 300px;
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
}

.selected-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  min-height: 0;
}

.selected-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 10px;
  background: #fff;
  transition: all 0.3s;
}

.selected-item:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

.selected-content {
  padding: 10px 15px;
}

.selected-text {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #303133;
  font-size: 14px;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.selected-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.selected-info .question-type {
  background: #67c23a;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  display: inline-block;
  min-width: 50px;
  text-align: center;
}

.selected-info .question-difficulty {
  color: #606266;
  font-size: 11px;
  font-weight: 500;
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.selected-actions {
  padding: 8px 15px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
}

/* 滚动条样式 */
.selected-list::-webkit-scrollbar {
  width: 6px;
}

.selected-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.selected-list::-webkit-scrollbar-track {
  background: #f5f7fa;
}
</style>
