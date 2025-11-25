<template>
  <el-dialog
    title="题目解析"
    :visible.sync="dialogVisibleComputed"
    width="800px"
    append-to-body
    @close="handleClose"
  >
    <div v-if="currentQuestion" class="analysis-content">
      <!-- 加载状态 -->
      <div v-if="loadingDetail" class="loading-section">
        <div class="loading-spinner">
          <i class="el-icon-loading"></i>
        </div>
        <p>正在加载题目详情...</p>
      </div>
      
      <!-- 题目详情内容 -->
      <div v-else-if="questionDetail" class="detail-content">
        <!-- 题目基本信息 -->
        <div class="question-info">
          <div class="info-tags">
            <el-tag v-if="questionDetail.CateName" type="primary" size="medium" class="info-tag">
              <i class="el-icon-document"></i>
              {{ questionDetail.CateName }}
            </el-tag>
            <el-tag v-if="questionDetail.Label" type="info" size="medium" class="info-tag">
              <i class="el-icon-location-outline"></i>
              {{ questionDetail.Label }}
            </el-tag>
            <el-tag v-if="questionDetail.Degree" type="warning" size="medium" class="info-tag">
              <i class="el-icon-star-on"></i>
              难度: {{ questionDetail.Degree }}
            </el-tag>
          </div>
        </div>

        <!-- 题目内容 -->
        <div class="question-section">
          <h4>题目内容</h4>
          <div class="question-content" v-html="processQuestionContent(questionDetail.Content)"></div>
        </div>

        <!-- 选项 -->
        <div v-if="questionDetail.Options && questionDetail.Options.length > 0" class="options-section">
          <h4>选项</h4>
          <div
            v-for="(option, index) in questionDetail.Options"
            :key="index"
            class="option-item"
            :class="{ 'correct-option': isCorrectOption(index, questionDetail.Answers) }"
          >
            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
            <span class="option-content" v-html="processQuestionContent(removeOptionPrefix(option, index))"></span>
          </div>
        </div>

        <!-- 答案 -->
        <div class="answer-section">
          <h4>正确答案</h4>
          <div class="answer-display">
            <span v-if="questionDetail.DisplayAnswer" class="answer-tag correct">
              <span v-html="processQuestionContent(questionDetail.DisplayAnswer)"></span>
            </span>
            <div v-else-if="questionDetail.Method && questionDetail.CateName === '解答题'" class="answer-text">
              <div v-html="processQuestionContent(extractAnswerFromMethod(questionDetail.Method))"></div>
            </div>
          </div>
        </div>

        <!-- 解析 -->
        <div v-if="questionDetail.Method" class="analysis-section">
          <h4>解析</h4>
          <div class="analysis-content" v-html="processQuestionContent(questionDetail.Method)"></div>
        </div>

        <!-- 分析 -->
        <div v-if="questionDetail.Analyse" class="analyse-section">
          <h4>分析</h4>
          <div class="analyse-content" v-html="processQuestionContent(questionDetail.Analyse)"></div>
        </div>

        <!-- 讨论 -->
        <div v-if="questionDetail.Discuss" class="discuss-section">
          <h4>讨论</h4>
          <div class="discuss-content" v-html="processQuestionContent(questionDetail.Discuss)"></div>
        </div>

        <!-- 知识点 -->
        <div v-if="questionDetail.Points" class="points-section">
          <h4>知识点</h4>
          <div class="points-content">
            <div class="points-tags">
              <span 
                v-for="(point, index) in formatPoints(questionDetail.Points)" 
                :key="index" 
                class="point-tag"
              >
                <i class="el-icon-collection-tag"></i>
                {{ point }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载失败或无数据 -->
      <div v-else class="no-detail">
        <el-empty description="暂无题目详情数据"></el-empty>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import latexRenderer from '@/utils/latexRenderer'

export default {
  name: 'QuestionAnalysisDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentQuestion: {
      type: Object,
      default: null
    },
    questionDetail: {
      type: Object,
      default: null
    },
    loadingDetail: {
      type: Boolean,
      default: false
    },
    processQuestionContent: {
      type: Function,
      required: true
    }
  },
  computed: {
    dialogVisibleComputed: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  watch: {
    visible(newVal) {
      if (!newVal) {
        this.$emit('close')
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    isCorrectOption(index, answers) {
      // 判断选项是否为正确答案
      if (!answers || !Array.isArray(answers)) return false
      return answers.includes(index.toString())
    },
    extractAnswerFromMethod(method) {
      if (!method) return ''
      // 从解析中提取答案部分
      const answerMatch = method.match(/故选[：:]\s*([^<]+)/)
      if (answerMatch) {
        const answer = this.decodeHtmlEntities(answerMatch[1])
        return `<strong>答案：</strong>${answer}`
      }
      // 如果没有找到"故选"，尝试其他模式
      const otherMatch = method.match(/答案[：:]\s*([^<]+)/)
      if (otherMatch) {
        const answer = this.decodeHtmlEntities(otherMatch[1])
        return `<strong>答案：</strong>${answer}`
      }
      return method
    },
    decodeHtmlEntities(text) {
      if (!text) return ''
      const textarea = document.createElement('textarea')
      textarea.innerHTML = text
      return textarea.value
    },
    formatPoints(points) {
      if (!points) return []
      
      // 如果points是字符串，尝试解析为数组
      if (typeof points === 'string') {
        try {
          // 尝试解析JSON格式
          const parsed = JSON.parse(points)
          if (Array.isArray(parsed)) {
            return parsed
          }
        } catch (e) {
          // 如果不是JSON，按逗号分割
          return points.split(',').map(p => p.trim()).filter(p => p)
        }
      }
      
      // 如果points是数组，直接返回
      if (Array.isArray(points)) {
        return points
      }
      
      return []
    },
    removeOptionPrefix(option, index) {
      return latexRenderer.removeOptionPrefix(option, index)
    }
  }
}
</script>

<style scoped>
.analysis-content {
  /* max-height: 500px; */
  overflow-y: auto;
}

.loading-section {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.loading-spinner {
  margin-bottom: 15px;
}

.loading-spinner i {
  font-size: 24px;
  color: #409eff;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.question-info {
  background: #f8f9fa;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 6px;
}

.info-tag i {
  font-size: 14px;
}

.question-section,
.options-section,
.answer-section,
.analysis-section,
.analyse-section,
.discuss-section,
.points-section {
  margin-bottom: 20px;
}

.question-section h4,
.options-section h4,
.answer-section h4,
.analysis-section h4,
.analyse-section h4,
.discuss-section h4,
.points-section h4 {
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 2px solid #409eff;
  padding-bottom: 5px;
}

.question-content {
  line-height: 1.6;
  color: #303133;
  font-size: 14px;
}

.answer-input-area {
  border-bottom: 1px solid black;
  display: inline-block;
  min-width: 100px;
  min-height: 20px;
  padding: 2px 4px;
  margin: 0 2px;
  background: transparent;
  color: #333;
  font-style: normal;
  font-weight: normal;
  text-align: center;
  vertical-align: middle;
  line-height: 1.2;
  border-radius: 2px;
}

.answer-input-area:empty:before {
  content: "请输入答案...";
  color: #c0c4cc;
  font-style: italic;
}

.answer-input-area:focus {
  outline: none;
  border-bottom-color: #409eff;
  border-bottom-width: 2px;
  background: #f0f9ff;
}

.option-item {
  margin-bottom: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: flex-start;
  transition: all 0.3s;
}

.option-item.correct-option {
  background: #f0f9ff;
  border-left-color: #67c23a;
  border: 1px solid #67c23a;
}

.option-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
  display: inline-block;
}

.correct-option .option-label {
  color: #67c23a;
}

.option-content {
  flex: 1;
  line-height: 1.5;
}

.answer-display {
  margin-top: 10px;
}

.answer-text {
  background: #f0f9ff;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
  margin-top: 10px;
}

.analysis-content,
.analyse-content,
.discuss-content,
.points-content {
  line-height: 1.6;
  color: #606266;
  background: #f8f9fa;
  padding: 15px 0px 15px 15px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.points-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.point-tag {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #409eff, #409eff);
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(230, 162, 60, 0.3);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.point-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(230, 162, 60, 0.4);
  background: linear-gradient(135deg, #409eff, #409eff);
}

.point-tag i {
  margin-right: 4px;
  font-size: 12px;
}

.no-detail {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

/* 滚动条样式 */
.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}
</style>