<template>
  <div class="app-container">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="hover">
      <div slot="header" class="card-header">
        <div class="header-content">
          <i class="el-icon-search header-icon"></i>
          <span class="header-title">智能题目搜索</span>
          <span class="header-subtitle">支持关键词搜索和拍照搜题</span>
        </div>
      </div>
      
      <!-- 搜索方式切换 -->
      <el-tabs v-model="activeTab" type="card" class="custom-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="关键词搜索" name="keyword">
          <div class="search-content">
            <div class="search-input-section">
              <!-- 主搜索框 -->
              <div class="main-search-box">
                <el-input
                  v-model="keywordQuery"
                  placeholder="请输入题目关键词、题目内容或题目类型..."
                  size="large"
                  clearable
                  class="search-input"
                  @keyup.enter.native="handleKeywordSearch"
                >
                  <el-button 
                    slot="append" 
                    icon="el-icon-search"
                    :loading="loading"
                    type="primary"
                    @click="handleKeywordSearch"
                    class="search-btn"
                  >
                    {{ loading ? '搜索中...' : '搜索' }}
                  </el-button>
                </el-input>
              </div>
              
              <!-- 搜索选项 -->
              <div class="search-options">
                <el-row :gutter="24">
                  <el-col :span="8">
                    <div class="option-item">
                      <label class="option-label">选择科目</label>
                      <el-select v-model="subjectType" placeholder="请选择科目" clearable class="full-width">
                        <el-option label="初中数学" value="初中数学"></el-option>
                        <el-option label="高中数学" value="高中数学"></el-option>
                        <el-option label="初中语文" value="初中语文"></el-option>
                        <el-option label="高中语文" value="高中语文"></el-option>
                        <el-option label="初中英语" value="初中英语"></el-option>
                        <el-option label="高中英语" value="高中英语"></el-option>
                        <el-option label="初中物理" value="初中物理"></el-option>
                        <el-option label="高中物理" value="高中物理"></el-option>
                        <el-option label="初中化学" value="初中化学"></el-option>
                        <el-option label="高中化学" value="高中化学"></el-option>
                      </el-select>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="option-item">
                      <label class="option-label">难度系数</label>
                      <div class="difficulty-range">
                        <el-input-number 
                          v-model="minDegree" 
                          :min="0" 
                          :max="1" 
                          :step="0.1" 
                          :precision="1"
                          size="small"
                          placeholder="最小值"
                          class="range-input"
                        ></el-input-number>
                        <span class="range-separator">至</span>
                        <el-input-number 
                          v-model="maxDegree" 
                          :min="0" 
                          :max="1" 
                          :step="0.1" 
                          :precision="1"
                          size="small"
                          placeholder="最大值"
                          class="range-input"
                        ></el-input-number>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="option-item">
                      <label class="option-label">题目类型</label>
                      <el-select v-model="questionType" placeholder="请选择题目类型" clearable class="full-width">
                        <el-option label="选择题" value="选择题"></el-option>
                        <el-option label="填空题" value="填空题"></el-option>
                        <el-option label="解答题" value="解答题"></el-option>
                        <el-option label="判断题" value="判断题"></el-option>
                      </el-select>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="拍照搜题" name="photo">
          <div class="search-content">
            <div class="photo-search-section">
              <!-- 上传区域 -->
              <div class="upload-area-container">
                <div v-if="!photoImage" class="upload-area" @click="handlePhotoUpload">
                  <div class="upload-icon">
                    <i class="el-icon-camera"></i>
                  </div>
                  <p class="upload-text">点击上传图片搜题</p>
                  <p class="upload-hint">支持jpg、png格式，建议图片清晰</p>
                  <div class="upload-features">
                    <span class="feature-item">
                      <i class="el-icon-picture"></i>
                      智能识别
                    </span>
                    <span class="feature-item">
                      <i class="el-icon-time"></i>
                      快速搜索
                    </span>
                    <span class="feature-item">
                      <i class="el-icon-check"></i>
                      准确匹配
                    </span>
                  </div>
                </div>
                <div v-else class="image-preview">
                  <div class="preview-container">
                    <img :src="photoImage" alt="题目图片" class="preview-image">
                    <div class="image-overlay">
                      <el-button size="small" type="primary" @click="handleRetakePhoto">
                        <i class="el-icon-refresh"></i> 重新上传
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 课程选择和搜题按钮 -->
              <div v-if="photoImage" class="search-actions">
                <div class="subject-select">
                  <el-select v-model="photoSubjectType" placeholder="请选择课程" clearable>
                    <el-option label="初中数学" value="初中数学"></el-option>
                    <el-option label="高中数学" value="高中数学"></el-option>
                    <el-option label="初中语文" value="初中语文"></el-option>
                    <el-option label="高中语文" value="高中语文"></el-option>
                    <el-option label="初中英语" value="初中英语"></el-option>
                    <el-option label="高中英语" value="高中英语"></el-option>
                    <el-option label="初中物理" value="初中物理"></el-option>
                    <el-option label="高中物理" value="高中物理"></el-option>
                    <el-option label="初中化学" value="初中化学"></el-option>
                    <el-option label="高中化学" value="高中化学"></el-option>
                  </el-select>
                </div>
                <el-button 
                  type="primary" 
                  size="large" 
                  :loading="photoLoading"
                  :disabled="!photoSubjectType"
                  @click="handlePhotoSearch"
                  class="photo-search-btn"
                >
                  <i class="el-icon-search"></i> {{ photoLoading ? '识别中...' : '开始搜题' }}
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 搜索结果区域 -->
    <el-card v-if="searchResults.length > 0 || (hasSearched && loading)" class="results-card" shadow="hover">
      <div slot="header" class="card-header">
        <div class="header-content">
          <i class="el-icon-document header-icon"></i>
          <span class="header-title">搜索结果</span>
          <span class="result-count">共找到 {{ totalCount }} 道题目</span>
        </div>
      </div>
      
      <div class="search-results">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner">
            <i class="el-icon-loading"></i>
          </div>
          <p class="loading-text">正在搜索题目，请稍候...</p>
        </div>
        
        <!-- 搜索结果列表 -->
        <div v-else class="results-list">
          <div 
            v-for="(item, index) in searchResults" 
            :key="index" 
            class="result-item"
          >
            <div class="question-content">
              <div class="question-header">
                <div class="question-meta">
                  <el-tag :type="getQuestionTypeColor(item)" size="small" class="question-type">
                    {{ item.qtype || item.questionType || item.type || item.category || '未知类型' }}
                  </el-tag>
                  <el-tag type="warning" size="small" class="question-difficulty">
                    难度: {{ item.degree || '未知' }}
                  </el-tag>
                  <el-tag v-if="item.knowledge_name" type="info" size="small" class="question-knowledge">
                    知识点: {{ item.knowledge_name }}
                  </el-tag>
                </div>
                <div class="question-actions">
                  <el-button
                    type="text"
                    size="small"
                    @click="showAnalysis(item)"
                    class="analysis-btn"
                  >
                    <i class="el-icon-view"></i> 查看解析
                  </el-button>
                </div>
              </div>
              
              <!-- 题目内容 -->
              <div class="question-text">
                <span v-if="item.label" class="question-label">{{ item.label }}</span>
                <span v-html="processQuestionContent(item.question || item.content || item.title || '题目内容加载中...')"></span>
              </div>
              
              <!-- 选择题选项 -->
              <div v-if="isChoiceQuestion(item) && item.options" class="question-options">
                <div 
                  v-for="(option, optIndex) in parseOptions(item.options)" 
                  :key="optIndex" 
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  <span class="option-content" v-html="processQuestionContent(option)"></span>
                </div>
              </div>
              
              <!-- 子题目 -->
              <div v-if="parseChildren(item.children).length > 0" class="sub-questions">
                <div 
                  v-for="(subQuestion, subIndex) in parseChildren(item.children)" 
                  :key="subIndex" 
                  class="sub-question-item"
                >
                  <div class="sub-question-header">
                    <span class="sub-question-number">{{ subIndex + 1 }}.</span>
                    <el-tag size="mini" type="success">{{ subQuestion.qtype || subQuestion.type || subQuestion.catename || '子题' }}</el-tag>
                  </div>
                  <div class="sub-question-content" v-html="processQuestionContent(subQuestion.question || subQuestion.content)"></div>
                  
                  <!-- 子题目选项 -->
                  <div v-if="isChoiceQuestion(subQuestion) && subQuestion.options" class="sub-question-options">
                    <div 
                      v-for="(option, optIndex) in parseOptions(subQuestion.options)" 
                      :key="optIndex" 
                      class="option-item"
                    >
                      <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                      <span class="option-content" v-html="processQuestionContent(option)"></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 答案 -->
              <div v-if="item.displayanswer" class="question-answer">
                <div class="answer-content">
                  <h4><i class="el-icon-check"></i> 答案:</h4>
                  <div v-html="processQuestionContent(item.displayanswer)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>
    
    <!-- 无搜索结果提示 -->
    <el-card v-else-if="hasSearched" class="no-results-card" shadow="hover">
      <div class="no-results">
        <div class="no-results-icon">
          <i class="el-icon-search"></i>
        </div>
        <p class="no-results-text">未找到相关题目</p>
        <p class="no-results-hint">请尝试调整搜索关键词或搜索条件</p>
        <div class="no-results-suggestions">
          <p>建议：</p>
          <ul>
            <li>检查关键词拼写是否正确</li>
            <li>尝试使用更简单的关键词</li>
            <li>调整科目或题目类型筛选条件</li>
            <li>扩大难度系数范围</li>
          </ul>
        </div>
      </div>
    </el-card>
    
    <!-- 解析弹窗 -->
    <el-dialog
      title="题目解析"
      :visible.sync="analysisVisible"
      width="800px"
      append-to-body
      class="analysis-dialog"
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
            <div class="info-row">
              <span class="info-label">题型:</span>
              <span class="info-value">{{ questionDetail.CateName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">来源:</span>
              <span class="info-value">{{ questionDetail.Label }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">难度:</span>
              <span class="info-value">{{ questionDetail.Degree }}</span>
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
              <span class="option-content" v-html="option"></span>
            </div>
          </div>

          <!-- 答案 -->
          <div class="answer-section">
            <h4>正确答案</h4>
            <div class="answer-display">
              <span v-if="questionDetail.DisplayAnswer" class="answer-tag correct">
                <span v-html="decodeHtmlEntities(questionDetail.DisplayAnswer)"></span>
              </span>
              <div v-else-if="questionDetail.Method && questionDetail.CateName === '解答题'" class="answer-text">
                <div v-html="extractAnswerFromMethod(questionDetail.Method)"></div>
              </div>
            </div>
          </div>

          <!-- 解析 -->
          <div v-if="questionDetail.Method" class="analysis-section">
            <h4>解析</h4>
            <div class="analysis-content" v-html="questionDetail.Method"></div>
          </div>

          <!-- 分析 -->
          <div v-if="questionDetail.Analyse" class="analyse-section">
            <h4>分析</h4>
            <div class="analyse-content" v-html="questionDetail.Analyse"></div>
          </div>

          <!-- 讨论 -->
          <div v-if="questionDetail.Discuss" class="discuss-section">
            <h4>讨论</h4>
            <div class="discuss-content" v-html="decodeHtmlEntities(questionDetail.Discuss)"></div>
          </div>

          <!-- 知识点 -->
          <div v-if="questionDetail.Points" class="points-section">
            <h4>知识点</h4>
            <div class="points-content">{{ questionDetail.Points }}</div>
          </div>
        </div>

        <!-- 加载失败或无数据 -->
        <div v-else class="no-detail">
          <el-empty description="暂无题目详情数据"></el-empty>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { searchProblems, ocrSearch } from '@/api/system/problems'
import { getQuestionDetail } from '@/api/system/paper'
import { parseMathFormula } from '@/utils/mathFormula'

export default {
  name: 'SearchQuestions',
  data() {
    return {
      activeTab: 'keyword',
      keywordQuery: '',
      subjectType: '',
      minDegree: 0,
      maxDegree: 1,
      questionType: '',
      photoImage: '',
      photoFile: null,
      photoSubjectType: '',
      photoLoading: false,
      searchResults: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
             hasSearched: false,
       loading: false,
       // 解析弹窗
       analysisVisible: false,
       currentQuestion: null,
       questionDetail: null,
       loadingDetail: false
    }
  },
  methods: {
    // 标签页切换
    handleTabClick(tab) {
      console.log('切换到:', tab.name)
    },
    
    // 关键词搜索
    async handleKeywordSearch() {
      if (!this.keywordQuery.trim()) {
        this.$message.warning('请输入搜索关键词')
        return
      }
      
      this.hasSearched = true
      this.currentPage = 1
      this.loading = true
      
      try {
        // 构建搜索参数，按照图片中的JSON结构
        const searchParams = {
                     conditions: {
             keywords: this.keywordQuery.trim(),
             subject_names: this.subjectType ? [this.subjectType] : [],
             is_chapter_exercise: false,
             cates: this.questionType ? [this.questionType] : [],
             min_degree: this.minDegree,
             max_degree: this.maxDegree,
             path: ""
           },
          pagination: {
            page: this.currentPage,
            per_page: this.pageSize
          }
        }
        
        // 调用搜索API
        const response = await searchProblems(searchParams)
        
        console.log('API响应:', response)
        
                 // 处理API响应数据
         if (response && response.questions) {
           // 直接返回题目数据的格式
           this.searchResults = response.questions || []
           this.totalCount = response.statistics?.total_questions || 0
           
           if (this.searchResults.length === 0) {
             this.$message.info('未找到相关题目')
           } else {
             this.$message.success(`找到 ${this.totalCount} 道相关题目`)
           }
        } else if (response && response.code === 200) {
          // 标准API响应格式
          let data = response.data || response
          let results = []
          let total = 0
          
          // 处理不同的响应格式
          if (data && data.data) {
            // 格式1: { code: 200, data: { data: [...], total: 100 } }
            results = data.data || []
            total = data.total || 0
          } else if (data && Array.isArray(data)) {
            // 格式2: { code: 200, data: [...] }
            results = data
            total = response.total || data.length
          } else if (data && data.rows) {
            // 格式3: { code: 200, data: { rows: [...], total: 100 } }
            results = data.rows || []
            total = data.total || 0
          } else if (response.rows) {
            // 格式4: { code: 200, rows: [...], total: 100 }
            results = response.rows || []
            total = response.total || 0
          } else {
            // 默认格式
            results = data || []
            total = response.total || data?.total || 0
          }
          
          this.searchResults = results
          this.totalCount = total
          
          if (this.searchResults.length === 0) {
            this.$message.info('未找到相关题目')
          } else {
            this.$message.success(`找到 ${this.totalCount} 道相关题目`)
          }
        } else {
          this.$message.error(response?.msg || response?.message || '搜索失败')
          this.searchResults = []
          this.totalCount = 0
        }
      } catch (error) {
        console.error('搜索出错:', error)
        this.$message.error('搜索失败，请稍后重试')
        this.searchResults = []
        this.totalCount = 0
      } finally {
        this.loading = false
      }
      
             console.log('关键词搜索:', {
         keyword: this.keywordQuery,
         subject: this.subjectType,
         minDegree: this.minDegree,
         maxDegree: this.maxDegree,
         type: this.questionType
       })
    },
    
    // 拍照搜题
    async handlePhotoSearch() {
      if (!this.photoImage) {
        this.$message.warning('请先上传图片')
        return
      }
      
      if (!this.photoSubjectType) {
        this.$message.warning('请选择课程')
        return
      }
      
      this.hasSearched = true
      this.currentPage = 1
      this.photoLoading = true
      
             try {
         // 构建FormData
         const formData = new FormData()
         formData.append('file', this.photoFile)
         formData.append('string', '')
         
         // 调用OCR接口
         const response = await ocrSearch(formData, this.photoSubjectType)
        
        console.log('OCR响应:', response)
        
        // 处理OCR响应数据
        if (response && response.success) {
          if (response.search_results && response.search_results.length > 0) {
            this.searchResults = response.search_results
            this.totalCount = response.search_results.length
            this.$message.success(`识别成功，找到 ${this.totalCount} 道相关题目`)
          } else {
            this.searchResults = []
            this.totalCount = 0
            this.$message.info('未找到相关题目')
          }
        } else {
          this.$message.error(response?.message || '识别失败')
          this.searchResults = []
          this.totalCount = 0
        }
      } catch (error) {
        console.error('OCR搜题出错:', error)
        this.$message.error('识别失败，请稍后重试')
        this.searchResults = []
        this.totalCount = 0
      } finally {
        this.photoLoading = false
      }
         },
    
    // 处理图片上传
    handlePhotoUpload() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          // 验证文件类型
          if (!file.type.startsWith('image/')) {
            this.$message.error('请选择图片文件')
            return
          }
          
          // 验证文件大小（限制为5MB）
          if (file.size > 5 * 1024 * 1024) {
            this.$message.error('图片大小不能超过5MB')
            return
          }
          
          // 保存文件对象
          this.photoFile = file
          
          // 创建预览URL
          const reader = new FileReader()
          reader.onload = (e) => {
            this.photoImage = e.target.result
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    },
    
    // 重新上传
    handleRetakePhoto() {
      this.photoImage = ''
      this.photoFile = null
      this.photoSubjectType = ''
    },
    

    
    // 分页大小改变
    handleSizeChange(size) {
      this.pageSize = size
      this.handleKeywordSearch()
    },
    
    // 当前页改变
    handleCurrentChange(page) {
      this.currentPage = page
      this.handleKeywordSearch()
    },
    
         // 处理题目内容 - 完全复用新增组卷界面的逻辑
     processQuestionContent(content) {
       if (!content) return ''
       // 先解码HTML实体，确保sub/sup等标签正确显示
       let processedContent = this.decodeHtmlEntities(content)
       // 处理数学公式
       processedContent = parseMathFormula(processedContent)
       
       // 处理可编辑答案输入区域 - 支持多种格式
       return processedContent
         // 简化且更精确的替换逻辑
         .replace(
           /<!--BA--><div class='quizPutTag' contenteditable='true'>&nbsp;<\/div><!--EA-->/g,
           '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
         )
         .replace(
           /<!--BA--><div class="quizPutTag" contenteditable="true">&nbsp;<\/div><!--EA-->/g,
           '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
         )
         .replace(
           /<div class='quizPutTag' contenteditable='true'>&nbsp;<\/div>/g,
           '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
         )
         .replace(
           /<div class="quizPutTag" contenteditable="true">&nbsp;<\/div>/g,
           '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
         )
         // 更通用的替换逻辑作为备用
         .replace(
           /<!--BA--><div[^>]*class=['"]?quizPutTag['"]?[^>]*contenteditable=['"]?true['"]?[^>]*>\s*(?:&nbsp;)?\s*<\/div><!--EA-->/g,
           '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
         )
         .replace(
           /<div[^>]*class=['"]?quizPutTag['"]?[^>]*contenteditable=['"]?true['"]?[^>]*>\s*(?:&nbsp;)?\s*<\/div>/g,
           '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
         )
     },

    

    // 解码HTML实体
    decodeHtmlEntities(text) {
      if (!text) return '';
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    },

         // 判断是否为选择题
     isChoiceQuestion(question) {
       const choiceTypes = ['选择题', '单选题', '多选题', 'choice', 'single_choice', 'multiple_choice'];
       const questionType = question.qtype || question.type || question.questionType || question.category || '';
       return choiceTypes.some(type => questionType.includes(type));
     },

     // 解析选项数组
     parseOptions(options) {
       if (!options) return [];
       if (Array.isArray(options)) return options;
       
       try {
         // 尝试解析JSON字符串
         const parsed = JSON.parse(options);
         return Array.isArray(parsed) ? parsed : [];
       } catch (error) {
         console.warn('解析选项失败:', error);
         return [];
       }
     },

     // 解析子题目数组
     parseChildren(children) {
       if (!children) return [];
       if (Array.isArray(children)) return children;
       
       try {
         // 尝试解析JSON字符串
         const parsed = JSON.parse(children);
         return Array.isArray(parsed) ? parsed : [];
       } catch (error) {
         console.warn('解析子题目失败:', error);
         return [];
       }
     },

           // 获取难度等级显示文本
      getDifficultyText(level) {
        const difficultyMap = {
          'easy': '简单',
          'middle': '中等',
          'hard': '困难'
        }
        return difficultyMap[level] || level
      },
      
      // 显示解析弹窗
      showAnalysis(question) {
        this.currentQuestion = question
        this.analysisVisible = true
        this.loadingDetail = true
        this.questionDetail = null
        
        // 构建请求数据
        const requestData = {
          subject: this.getSubjectFromSearch(question),
          sid: question.sid || question.id
        }
        
        // 调用API获取题目详情
        getQuestionDetail(requestData).then(res => {
          console.log('API响应:', res)
          // 检查响应数据格式
          if (res && res.SID) {
            // 直接返回题目详情数据
            this.questionDetail = res
          } else if (res && res.code === 200 && res.data) {
            // 标准格式：{code: 200, data: {...}}
            this.questionDetail = res.data
          } else {
            this.$message.error('获取题目详情失败: 数据格式错误')
          }
        }).catch(error => {
          console.error('获取题目详情失败:', error)
          this.$message.error('获取题目详情失败: ' + (error.message || '网络错误'))
        }).finally(() => {
          this.loadingDetail = false
        })
      },
      
      // 从搜索结果中获取科目信息
      getSubjectFromSearch(question) {
        // 从题目数据中提取科目信息
        if (question.subject_name) {
          return question.subject_name
        } else if (question.subject) {
          return question.subject
        } else if (this.subjectType) {
          return this.subjectType
        }
        // 如果没有科目信息，返回默认值
        return '高中数学'
      },
      
      // 判断选项是否为正确答案
      isCorrectOption(index, answers) {
        if (!answers || !Array.isArray(answers)) return false
        return answers.includes(index.toString())
      },
      
      // 从解析中提取答案
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
      
      // 获取题目类型对应的颜色
      getQuestionTypeColor(question) {
        const type = question.qtype || question.questionType || question.type || question.category || ''
        const typeMap = {
          '选择题': 'primary',
          '单选题': 'primary',
          '多选题': 'success',
          '填空题': 'warning',
          '解答题': 'danger',
          '判断题': 'info'
        }
        return typeMap[type] || 'info'
      },
    
    // 模拟搜索结果
    mockSearchResults() {
      const mockData = [
        {
          id: 1,
          type: '选择题',
          difficulty: '中等',
          subject: '数学',
          content: '已知函数f(x)=x²+ax+b，若f(1)=0，f(2)=0，则a+b的值为（ ）'
        },
        {
          id: 2,
          type: '填空题',
          difficulty: '简单',
          subject: '语文',
          content: '《红楼梦》的作者是_____，这部作品被誉为中国古典小说的巅峰之作。'
        },
        {
          id: 3,
          type: '解答题',
          difficulty: '困难',
          subject: '物理',
          content: '一个质量为2kg的物体在水平面上受到10N的水平拉力，摩擦系数为0.3，求物体的加速度。'
        }
      ]
      
      this.searchResults = mockData
      this.totalCount = 3
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  
  .search-card {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-content {
        display: flex;
        align-items: center;
        
        .header-icon {
          font-size: 20px;
          margin-right: 8px;
          color: #409eff;
        }
        
        .header-title {
          font-size: 18px;
          font-weight: bold;
          color: #303133;
        }
        
        .header-subtitle {
          font-size: 14px;
          color: #909399;
          margin-left: 10px;
        }
      }
    }
    
    .search-content {
      padding: 20px 0;
      
      .search-input-section {
        .main-search-box {
          margin-bottom: 30px;
          
          .search-input {
            width: 100%;
            
            .el-input__inner {
              border-radius: 25px;
              padding: 12px 20px;
              font-size: 16px;
              border: 2px solid #e4e7ed;
              transition: all 0.3s ease;
              
              &:focus {
                border-color: #409eff;
                box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
              }
            }
            
            .search-btn {
              border-radius: 0 25px 25px 0;
              height: 100%;
              padding: 12px 20px;
              font-weight: 500;
            }
          }
        }
        
        .search-options {
           margin-top: 20px;
           
           .option-item {
             margin-bottom: 15px;
             
             .option-label {
               display: block;
               font-size: 14px;
               color: #606266;
               margin-bottom: 5px;
             }
             
             .full-width .el-select {
               width: 100%;
             }
             
             .difficulty-range {
               display: flex;
               align-items: center;
               .range-input {
                 width: 100px;
                 margin-right: 8px;
               }
               .range-separator {
                 margin: 0 8px;
                 color: #909399;
               }
             }
           }
         }
       }
      
             .photo-search-section {
         text-align: center;
         
         .upload-area-container {
           margin-bottom: 30px;
           
           .upload-area {
             border: 2px dashed #d9d9d9;
             border-radius: 16px;
             padding: 80px 20px;
             cursor: pointer;
             transition: all 0.3s ease;
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: center;
             background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
             
             &:hover {
               border-color: #409eff;
               background: linear-gradient(135deg, #f0f9ff 0%, #e1f3d8 100%);
               transform: translateY(-2px);
               box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
             }
             
             .upload-icon {
               font-size: 64px;
               color: #409eff;
               margin-bottom: 20px;
               
               i {
                 background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
                 -webkit-background-clip: text;
                 -webkit-text-fill-color: transparent;
                 background-clip: text;
               }
             }
             
             .upload-text {
               margin: 10px 0 5px;
               font-size: 16px;
               color: #606266;
             }
             
                            .upload-hint {
                 font-size: 12px;
                 color: #909399;
                 margin-bottom: 20px;
               }
               
               .upload-features {
                 display: flex;
                 gap: 15px;
                 margin-top: 15px;
                 
                 .feature-item {
                   display: flex;
                   align-items: center;
                   gap: 5px;
                   font-size: 12px;
                   color: #606266;
                   padding: 4px 8px;
                   background: rgba(64, 158, 255, 0.1);
                   border-radius: 12px;
                   
                   i {
                     color: #409eff;
                   }
                 }
               }

           }
           
           .image-preview {
             .preview-container {
               position: relative;
               .preview-image {
                 max-width: 100%;
                 max-height: 300px;
                 border-radius: 8px;
                 border: 1px solid #d9d9d9;
               }
               .image-overlay {
                 position: absolute;
                 top: 0;
                 left: 0;
                 width: 100%;
                 height: 100%;
                 background: rgba(0, 0, 0, 0.5);
                 border-radius: 8px;
                 display: flex;
                 justify-content: center;
                 align-items: center;
                 opacity: 0;
                 transition: opacity 0.3s;
               }
               &:hover .image-overlay {
                 opacity: 1;
               }
             }
           }
         }
         
         .search-actions {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 20px;
           
           .subject-select {
             width: 200px;
           }
           
           .photo-search-btn {
             min-width: 120px;
           }
         }
       }
    }
  }
  
  .results-card {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-content {
        display: flex;
        align-items: center;
        
        .header-icon {
          font-size: 20px;
          margin-right: 8px;
          color: #409eff;
        }
        
        .header-title {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
        }
        
        .result-count {
          font-size: 14px;
          color: #909399;
        }
      }
    }
    
    .search-results {
      .loading-container {
        text-align: center;
        padding: 80px 20px;
        
        .loading-spinner {
          margin-bottom: 20px;
          
          i {
            font-size: 48px;
            color: #409eff;
            animation: pulse 1.5s ease-in-out infinite;
          }
        }
        
        .loading-text {
          margin-top: 15px;
          font-size: 16px;
          color: #606266;
          font-weight: 500;
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.7;
        }
      }
      
      .results-list {
        .result-item {
          border: 1px solid #ebeef5;
          border-radius: 12px;
          margin-bottom: 20px;
          padding: 25px;
          transition: all 0.3s ease;
          background: white;
          
          &:hover {
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            border-color: #409eff;
          }
          
          .question-content {
            .question-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              
              .question-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .question-type {
                  background-color: #e1f3d8;
                  color: #67c23a;
                }
                
                .question-difficulty {
                  background-color: #fdf6ec;
                  color: #e6a23c;
                }
                
                .question-knowledge {
                  background-color: #fdf6ec;
                  color: #e6a23c;
                }
              }
              
              .question-actions {
                .analysis-btn {
                  color: #409eff;
                  font-size: 14px;
                  i {
                    margin-right: 5px;
                  }
                }
              }
            }
            
            .question-text {
              font-size: 14px;
              line-height: 1.6;
              color: #303133;
              margin-bottom: 15px;
              
              .question-label {
                display: inline-block;
                padding: 2px 8px;
                background-color: #f0f9ff;
                color: #409eff;
                border-radius: 4px;
                font-size: 12px;
                font-style: italic;
                margin-right: 8px;
              }
              
              .answer-input-area {
                border-bottom: 1px solid black;
                display: inline-block;
                min-width: 100px;
                padding: 2px 4px;
              }
              
              // 处理图片溢出
              img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
              }
            }
            
            .question-options {
              margin: 15px 0;
              
              .option-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 8px;
                padding: 8px 12px;
                background-color: #f8f9fa;
                border-radius: 4px;
                border-left: 3px solid #409eff;
                
                .option-label {
                  font-weight: bold;
                  color: #409eff;
                  margin-right: 8px;
                  min-width: 20px;
                }
                
                .option-content {
                  flex: 1;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #303133;
                  
                  img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                  }
                }
              }
            }
            
            .sub-questions {
              margin: 15px 0;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #e4e7ed;
              
              .sub-question-item {
                margin-bottom: 20px;
                padding: 15px;
                background-color: white;
                border-radius: 6px;
                border: 1px solid #e4e7ed;
                
                &:last-child {
                  margin-bottom: 0;
                }
                
                .sub-question-header {
                  margin-bottom: 10px;
                  
                  .sub-question-number {
                    font-weight: bold;
                    color: #409eff;
                    margin-right: 8px;
                  }
                  
                  .sub-question-type {
                    display: inline-block;
                    padding: 2px 8px;
                    background-color: #e1f3d8;
                    color: #67c23a;
                    border-radius: 4px;
                    font-size: 12px;
                  }
                }
                
                .sub-question-content {
                  font-size: 14px;
                  line-height: 1.6;
                  color: #303133;
                  margin-bottom: 10px;
                  
                  img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                  }
                }
                
                .sub-question-options {
                  margin-top: 10px;
                  
                  .option-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 6px;
                    padding: 6px 10px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    border-left: 3px solid #67c23a;
                    
                    .option-label {
                      font-weight: bold;
                      color: #67c23a;
                      margin-right: 8px;
                      min-width: 20px;
                    }
                    
                    .option-content {
                      flex: 1;
                      font-size: 14px;
                      line-height: 1.6;
                      color: #303133;
                      
                      img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 4px;
                      }
                    }
                  }
                }
              }
            }
            
            .question-answer {
              border-top: 1px solid #f0f0f0;
              padding-top: 15px;
              margin-top: 15px;
              
              .answer-content {
                h4 {
                  font-size: 14px;
                  font-weight: bold;
                  color: #67c23a;
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  i {
                    margin-right: 5px;
                  }
                }
                
                div {
                  font-size: 14px;
                  line-height: 1.6;
                  color: #303133;
                  background-color: #f8f9fa;
                  padding: 10px;
                  border-radius: 4px;
                  border-left: 3px solid #67c23a;
                }
              }
            }
          }
        }
      }
    }
    
    .pagination-wrapper {
      text-align: center;
      margin-top: 30px;
      padding: 20px 0;
      border-top: 1px solid #f0f0f0;
      
      .el-pagination {
        .el-pager li {
          border-radius: 8px;
          margin: 0 2px;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: #409eff;
            color: white;
            transform: translateY(-1px);
          }
          
          &.active {
            background-color: #409eff;
            color: white;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
          }
        }
        
        .btn-prev,
        .btn-next {
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: #409eff;
            color: white;
            transform: translateY(-1px);
          }
        }
      }
    }
  }
  
  .no-results-card {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .no-results {
      text-align: center;
      padding: 80px 20px;
      
      .no-results-icon {
        margin-bottom: 30px;
        
        i {
          font-size: 80px;
          color: #c0c4cc;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
      
      .no-results-text {
        font-size: 24px;
        color: #606266;
        margin: 20px 0 15px;
        font-weight: 500;
      }
      
      .no-results-hint {
        font-size: 16px;
        color: #909399;
        margin-bottom: 30px;
      }
      
      .no-results-suggestions {
        text-align: left;
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #409eff;
        
        p {
          font-weight: 500;
          color: #303133;
          margin-bottom: 10px;
        }
        
        ul {
          list-style: none;
          padding: 0;
          
          li {
            padding: 5px 0;
            color: #606266;
            position: relative;
            padding-left: 20px;
            
            &:before {
              content: "•";
              color: #409eff;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
          }
        }
      }
    }
  }
   
   // 解析弹窗样式已移至全局样式块
   
   // 查看解析按钮样式
   .question-actions {
     margin-top: 15px;
     padding-top: 15px;
     border-top: 1px solid #f0f0f0;
     text-align: right;
   }
   
   // 响应式设计
   @media (max-width: 768px) {
     .search-card,
     .results-card,
     .no-results-card {
       margin: 10px;
       border-radius: 8px;
     }
     
     .search-content {
       padding: 15px 0;
     }
     
     .main-search-box .search-input .el-input__inner {
       border-radius: 20px;
       padding: 10px 15px;
       font-size: 14px;
     }
     
     .search-options .el-row {
       .el-col {
         margin-bottom: 15px;
       }
     }
     
     .result-item {
       padding: 15px;
       margin-bottom: 15px;
     }
     
     .upload-area {
       padding: 40px 15px;
     }
     
     .upload-features {
       flex-direction: column;
       gap: 10px;
     }
   }
   
   @media (max-width: 480px) {
     .app-container {
       padding: 10px;
     }
     
     .header-title {
       font-size: 16px;
     }
     
     .header-subtitle {
       display: none;
     }
     
     .search-options .el-row {
       .el-col {
         width: 100%;
         margin-bottom: 15px;
       }
     }
   }
 }
 </style>

<!-- 全局样式，用于解析弹窗 -->
<style lang="scss">
// 解析弹窗样式 - 全局样式，确保能作用到append-to-body的弹窗
.analysis-content {
  // max-height: 500px;
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
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: bold;
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  flex: 1;
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
  content: " ";
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

.answer-tag {
  display: inline-block;
  // background: #fff;
  color: black;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
  font-size: 12px;
}

.answer-tag.correct {
  color: black;
  font-weight: bold;
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
  padding: 15px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
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

