<template>
  <div class="favorite-question-list" v-loading="loading">
    <QuestionList
      :questions="normalizedQuestions"
      :question-types="questionTypes"
      :selected-questions="selectedQuestions"
      :process-question-content="processQuestionContent"
      :show-pagination="true"
      :total="total"
      :page-num="pageNum"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20, 30, 50]"
      :show-question-type-filter="false"
      :confirm-before-unfavorite="true"
      :disable-favorite-status-check="true"
      @show-analysis="handleViewDetail"
      @add-to-paper="handleAddToPaper"
      @remove-from-paper="handleRemoveFromPaper"
      @favorite-changed="handleFavoriteChanged"
      @before-unfavorite="handleBeforeUnfavorite"
      @pagination-change="handlePagination"
    />
  </div>
</template>

<script>
import QuestionList from '@/components/PaperBuilder/QuestionList.vue'
import latexRenderer from '@/utils/latexRenderer'

export default {
  name: 'FavoriteQuestionList',
  components: {
    QuestionList
  },
  props: {
    questions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 5
    },
    selectedQuestions: {
      type: Array,
      default: () => []
    },
    processQuestionContent: {
      type: Function,
      default: (content) => {
        return latexRenderer.processQuestionContent(content)
      }
    },
    questionTypes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    // 将收藏列表的数据格式转换为 QuestionList 需要的格式
    normalizedQuestions() {
      if (!this.questions || !Array.isArray(this.questions)) {
        return []
      }
      
      return this.questions.map(question => {
        // 标准化题目数据格式
        const normalized = {
          // ID 字段统一
          sid: question.sid || question.SID || question.questionSid,
          questionSid: question.questionSid || question.sid || question.SID,
          // 题目内容字段统一
          question: question.question || question.Content || question.content || '',
          // 题型字段统一
          cate: question.cate || question.CateName || question.cateName || question.qtype || '',
          catename: question.catename || question.CateName || question.cateName || question.qtype || '',
          // 难度字段统一
          difficulty: question.difficulty || question.degree || question.Degree,
          degree: question.degree || question.difficulty || question.Degree,
          // 选项字段统一
          options: question.options || question.Options || [],
          // 子题目字段统一
          children: question.children || question.Children || [],
          // 标签字段
          label: question.label || '',
          // 确保收藏状态为 true（因为这是收藏列表）
          isFavorite: true,
          // 保留原始数据
          ...question
        }
        
        return normalized
      })
    }
  },
  data() {
    return {
      confirmingQuestionId: null // 正在确认的题目ID，防止重复弹出对话框
    }
  },
  methods: {
    handleViewDetail(question) {
      this.$emit('view-detail', question)
    },
    handleAddToPaper(question) {
      this.$emit('add-to-paper', question)
    },
    handleRemoveFromPaper(questionId) {
      // QuestionList 传递的是 sid，需要转换为完整的 question 对象
      const id = questionId?.sid || questionId?.SID || questionId?.questionSid || questionId
      const fullQuestion = this.questions.find(q => {
        const qId = q.sid || q.SID || q.questionSid
        return qId === id || String(qId) === String(id)
      })
      // 如果找到了完整的题目对象，传递它；否则传递原始 questionId
      this.$emit('remove-from-paper', fullQuestion || { sid: id, SID: id, questionSid: id })
    },
    // 处理取消收藏前的确认
    handleBeforeUnfavorite(question, confirmCallback) {
      const questionId = question.sid || question.SID || question.questionSid
      
      // 防止重复弹出对话框：如果正在确认同一个题目，直接返回
      if (this.confirmingQuestionId === questionId) {
        return
      }
      
      // 设置正在确认的题目ID
      this.confirmingQuestionId = questionId
      
      // 弹出确认对话框
      this.$modal.confirm('是否确认删除该收藏？').then(async () => {
        // 用户确认，执行取消收藏操作
        try {
          // 执行取消收藏操作（可能是异步的）
          const result = confirmCallback()
          // 如果返回 Promise，等待其完成
          if (result && typeof result.then === 'function') {
            await result
          }
          // 等待一小段时间确保状态更新完成
          await this.$nextTick()
          // 触发 cancel-favorite 事件，让父组件重新加载列表
          this.$emit('cancel-favorite', question)
        } catch (error) {
          console.error('取消收藏失败:', error)
          // 即使失败也清除确认状态
        }
      }).catch(() => {
        // 用户取消，不做任何操作
      }).finally(() => {
        // 延迟清除 confirmingQuestionId，防止快速连续点击
        setTimeout(() => {
          if (this.confirmingQuestionId === questionId) {
            this.confirmingQuestionId = null
          }
        }, 300)
      })
    },
    handleFavoriteChanged(question, isFavorite) {
      // 在收藏列表中，取消收藏的逻辑已经在 handleBeforeUnfavorite 中处理
      // 这里不需要再触发 cancel-favorite 事件，避免重复加载
      // 保留此方法是为了兼容性，但不会执行任何操作
    },
    handlePagination(pageData) {
      this.$emit('pagination-change', pageData)
    }
  }
}
</script>

<style scoped lang="scss">
.favorite-question-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px); // 根据实际页面布局调整，留出顶部导航和底部空间
  min-height: calc(100vh - 200px); // 最小高度
  
  // 确保 QuestionList 组件能够正确继承高度
  ::v-deep .center-panel {
    height: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  // 确保题目列表区域能够滚动
  ::v-deep .question-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0; // 重要：允许 flex 子元素收缩
  }
}
</style>

