<template>
  <div class="generated-question-list" ref="questionListPanel">
    <div class="question-list">
      <div
        v-for="(question, index) in questions"
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
              type="text"
              size="small"
              @click="showSimilarQuestions(question)"
              class="similar-questions-btn"
            >
              相似题目
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
              v-if="!isQuestionSelected(question.sid || question.SID || question.questionSid || question.id)"
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
      <div v-if="questions.length === 0" class="no-data">
        <el-empty description="暂无题目数据"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import latexRenderer from '@/utils/latexRenderer'
import { checkQuestionCollect, saveQuestionTag } from '@/api/system/problems'
import { deleteQuestionFavorite } from '@/api/system/problems'

export default {
  name: 'GeneratedQuestionList',
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
    // 科目名称（用于收藏时传递）
    subjectName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      favoriteTag: '默认收藏', // 默认收藏标签
      favoriteStatusLoading: false, // 收藏状态加载中标记，防止重复请求
      lastQuestionIds: '' // 上次请求的题目ID，用于去重
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

        // 加载收藏状态
        // 只有当题目列表真正发生变化时才加载收藏状态
        if (newQuestions && newQuestions.length > 0 && questionsChanged) {
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
    // 获取题型
    getQuestionType(question) {
      return question.catename || question.qtype || question.questionType || '未知题型'
    },
    // 获取难度
    getQuestionDifficulty(question) {
      const difficultyMap = {
        'easy': '简单',
        'easier': '较易',
        'medium': '中等',
        'harder': '较难',
        'hard': '困难',
        11: '易',
        12: '较易',
        13: '中档',
        14: '较难',
        15: '难'
      }
      // 优先检查 degree 字段（数字难度值）
      const difficulty = question.degree || question.difficulty || question.difficultyLevel

      // 如果难度是数字（0-1之间），转换为中文描述
      if (difficulty !== undefined && difficulty !== null && difficulty !== '') {
        const diff = parseFloat(difficulty)
        if (!isNaN(diff) && diff >= 0 && diff <= 1) {
          if (diff >= 0 && diff <= 0.2) return '困难'
          if (diff > 0.2 && diff <= 0.4) return '较难'
          if (diff > 0.4 && diff <= 0.6) return '中等'
          if (diff > 0.6 && diff <= 0.8) return '较易'
          if (diff > 0.8 && diff <= 1) return '简单'
        }
        // 如果是字符串且已在映射表中，直接返回
        if (difficultyMap[difficulty] !== undefined) {
          return difficultyMap[difficulty]
        }
        // 如果是字符串且是已知的难度描述，直接返回
        if (typeof difficulty === 'string' && ['简单', '较易', '中等', '较难', '困难', 'easy', 'easier', 'medium', 'harder', 'hard'].includes(difficulty)) {
          return difficulty
        }
      }

      return difficulty || '未知'
    },
    // 解析选项
    parseOptions(options) {
      if (!options) return []
      if (typeof options === 'string') {
        try {
          const parsed = JSON.parse(options)
          return Array.isArray(parsed) ? parsed : [options]
        } catch {
          return [options]
        }
      }
      return Array.isArray(options) ? options : []
    },
    // 移除选项前缀
    removeOptionPrefix(option, index) {
      if (typeof option !== 'string') return option
      // 移除类似 "A." 或 "A、" 这样的前缀
      return option.replace(/^[A-Z][\.、]\s*/, '')
    },
    // 解析子题目
    parseChildren(children) {
      if (!children) return []
      if (typeof children === 'string') {
        try {
          const parsed = JSON.parse(children)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }
      return Array.isArray(children) ? children : []
    },
    // 检查题目是否已选中
    isQuestionSelected(questionId) {
      if (!questionId) return false
      const selectedQuestions = this.selectedQuestions || this.$store.getters.selectedQuestions || []
      return selectedQuestions.some(q => {
        const qId = q.sid || q.SID || q.questionSid || q.id
        return qId && (qId === questionId || String(qId) === String(questionId))
      })
    },
    // 添加到试卷
    addToPaper(question) {
      // 直接触发事件，让父组件处理添加逻辑
      this.$emit('toggle-selection', question)
    },
    // 从试卷移除
    removeFromPaper(question) {
      // 直接触发事件，让父组件处理移除逻辑
      this.$emit('toggle-selection', question)
    },
    // 显示解析
    showAnalysis(question) {
      this.$emit('show-analysis', question)
    },
    // 显示相似题目
    showSimilarQuestions(question) {
      this.$emit('show-similar-questions', question)
    },
    // 切换收藏状态
    async toggleFavorite(question) {
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        this.$message.warning('题目ID不存在，无法收藏')
        return
      }

      try {
        if (question.isFavorite) {
          // 取消收藏
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
        console.error('收藏操作失败:', error)
        this.$message.error('操作失败：' + (error.message || '网络错误'))
      }
    },
    // 加载收藏状态
    async loadFavoriteStatus() {
      if (this.favoriteStatusLoading || !this.questions || this.questions.length === 0) {
        return
      }

      // 获取所有题目的ID（汇总 sid）
      const questionIds = this.questions
        .map(q => q.sid || q.SID || q.questionSid)
        .filter(id => id)

      if (questionIds.length === 0) {
        console.warn('没有找到有效的题目ID，无法加载收藏状态')
        return
      }

      // 生成题目ID的字符串，用于判断是否需要重新请求
      const questionIdsStr = questionIds.sort().join(',')

      // 如果题目ID和上次一样，不需要重复请求
      if (this.lastQuestionIds === questionIdsStr) {
        return
      }

      console.log('加载收藏状态，题目ID:', questionIds)
      this.lastQuestionIds = questionIdsStr
      this.favoriteStatusLoading = true

      try {
        // 调用API查询收藏状态（传入题目ID数组）
        const response = await checkQuestionCollect(questionIds)
        console.log('收藏状态查询结果:', response)

        if (response && response.code === 200) {
          const collectData = response.data || {}

          // 更新每个题目的收藏状态
          this.questions.forEach(question => {
            const questionId = question.sid || question.SID || question.questionSid
            if (questionId) {
              // API 返回格式可能是 { questionId: true/false } 或数组格式
              let isFavorite = false
              if (typeof collectData === 'object' && !Array.isArray(collectData)) {
                // 对象格式：{ questionId: true/false }
                isFavorite = collectData[questionId] === true || collectData[String(questionId)] === true
              } else if (Array.isArray(collectData)) {
                // 数组格式：查找对应的项
                const item = collectData.find(item => {
                  const itemId = item.questionId || item.sid || item.SID || item.questionSid
                  return itemId && (itemId === questionId || String(itemId) === String(questionId))
                })
                isFavorite = item && (item.isFavorite === true || item.isFavorite === 1)
              }

              this.$set(question, 'isFavorite', isFavorite)
            }
          })

          console.log('收藏状态更新完成')
        } else {
          console.error('查询收藏状态失败:', response)
        }
      } catch (error) {
        console.error('加载收藏状态失败:', error)
      } finally {
        this.favoriteStatusLoading = false
      }
    }
  }
}
</script>

<style scoped>
.generated-question-list {
  flex: 1;
  min-width: 400px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  font-size: 12px;
  color: #606266;
}

.view-detail-btn,
.edit-btn,
.favorite-btn,
.add-to-paper-btn,
.remove-from-paper-btn {
  padding: 4px 8px;
  font-size: 12px;
}

.favorite-btn.is-favorite {
  color: #f56c6c;
}

.question-content {
  padding: 15px;
}

.question-text {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 15px;
}

.question-label {
  font-weight: bold;
  margin-right: 8px;
}

.question-options {
  margin-top: 15px;
}

.option-item {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.8;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
  min-width: 24px;
}

.option-content {
  flex: 1;
  color: #303133;
}

.sub-questions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #e4e7ed;
}

.sub-question-item {
  margin-bottom: 20px;
}

.sub-question-item:last-child {
  margin-bottom: 0;
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sub-question-number {
  font-weight: bold;
  color: #409eff;
}

.sub-question-type {
  background: #e6f7ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.sub-question-content {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 10px;
}

.sub-question-options {
  margin-top: 10px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* 滚动条样式 */
.question-list::-webkit-scrollbar {
  width: 8px;
}

.question-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.question-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}
</style>

