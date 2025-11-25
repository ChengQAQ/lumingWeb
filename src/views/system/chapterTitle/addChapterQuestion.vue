<template>
  <div class="app-container">
    <div class="chapter-builder">
      <!-- 左侧：章节选择区域 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>章节选择</h3>
        </div>
        <div class="chapter-tree">
          <el-tree
            :data="chapterOptions"
            :props="chapterProps"
            node-key="value"
            :expand-on-click-node="true"
            @node-click="handleChapterClick"
            :highlight-current="true"
            :default-expand-all="false"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
            </span>
          </el-tree>
        </div>
      </div>

      <!-- 中间：题目展示区域 -->
      <div class="center-panel">
        <div class="panel-header">
          <h3>题目列表</h3>
          <div class="search-box">
            <el-select 
              v-model="questionType" 
              placeholder="全部题型" 
              @change="filterQuestions"
              style="width: 120px; margin-right: 10px;"
            >
              <el-option label="全部" value=""></el-option>
              <el-option 
                v-for="type in questionTypes" 
                :key="type.name" 
                :label="type.name" 
                :value="type.name"
              />
            </el-select>
            <el-select 
              v-model="difficultyLevel" 
              placeholder="全部难度" 
              @change="filterQuestions"
              style="width: 100px; margin-right: 10px;"
            >
              <el-option label="全部" value=""></el-option>
              <el-option label="困难" value="hard"></el-option>
              <el-option label="较难" value="harder"></el-option>
              <el-option label="中等" value="medium"></el-option>
              <el-option label="较易" value="easier"></el-option>
              <el-option label="简单" value="easy"></el-option>
            </el-select>
            <el-input
              v-model="questionSearch"
              placeholder="搜索题目..."
              prefix-icon="el-icon-search"
              clearable
              @input="filterQuestions"
              style="flex: 1;"
            />
          </div>
        </div>
        <div class="question-list">
          <div
            v-for="question in filteredQuestions"
            :key="question.sid"
            class="question-card"
          >
            <div class="question-header">
              <span class="question-type">{{ question.cate || question.qtype }}</span>
              <span class="question-difficulty">难度: {{ question.degree || question.difficulty || '未知' }}</span>
            </div>
            <div class="question-footer">
              <el-button
                type="text"
                size="small"
                @click="showAnalysis(question)"
              >
                查看解析
              </el-button>
              <el-button
                size="mini"
                type="primary"
                @click="addToSelected(question)"
                :disabled="isQuestionSelected(question.sid)"
              >
                {{ isQuestionSelected(question.sid) ? '已选择' : '选择' }}
              </el-button>
            </div>
            <div class="question-content">
              <div class="question-text">
                <span v-if="question.label" class="question-label">{{ question.label }}</span>
                <span v-html="processQuestionContent(question.question)"></span>
              </div>
                             <div class="question-options" v-if="question.options && parseOptions(question.options).length > 0">
                 <div
                   v-for="(option, index) in parseOptions(question.options)"
                   :key="index"
                   class="option-item"
                 >
                   <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                   <span class="option-content" v-html="processQuestionContent(option)"></span>
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
                    <span class="sub-question-number">{{ index + 1 }}.</span>
                    <span class="sub-question-type">{{ subQuestion.cate }}</span>
                  </div>
                  <div class="sub-question-content" v-html="processQuestionContent(subQuestion.question)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

             <!-- 右侧：章节信息和已选题目区域 -->
       <div class="right-panel">
         <!-- 章节信息表单 -->
         <div class="chapter-form">
           <div class="panel-header">
             <h3>章节题信息</h3>
           </div>
           <div class="form-content">
             <el-form ref="chapterForm" :model="chapterForm" :rules="chapterRules" label-width="80px">
               <el-form-item label="科目" prop="subject">
                 <el-select
                   v-model="chapterForm.subject"
                   placeholder="请选择科目"
                   style="width: 100%"
                 >
                   <el-option
                     v-for="item in subjectOptions"
                     :key="item.subjectCode"
                     :label="item.subjectName"
                     :value="item.subjectCode"
                   />
                 </el-select>
               </el-form-item>
               <el-form-item label="章节题名称" prop="customPaperName">
                 <el-input
                   v-model="chapterForm.customPaperName"
                   placeholder="请输入章节题名称"
                 />
               </el-form-item>
                               <el-form-item label="关联章节" prop="relatedChapter">
                  <el-cascader
                    v-model="chapterForm.relatedChapter"
                    :options="chapterOptions"
                    :props="cascaderProps"
                    placeholder="请选择关联章节"
                    style="width: 100%"
                    clearable
                  />
                  <div class="form-tip">
                    <i class="el-icon-info"></i>
                    可选择任意层级的章节，如：初中/科学/七年级上/第1章 科学入门
                  </div>
                </el-form-item>
               
               <el-form-item>
                 <el-button type="primary" @click="saveChapter" :loading="saving">
                   保存章节题
                 </el-button>
                 <el-button @click="goBack">返回</el-button>
               </el-form-item>
             </el-form>
           </div>
         </div>
         
         <!-- 已选题目区域 -->
         <div class="selected-questions-section">
           <div class="panel-header">
             <h3>已选题目</h3>
             <div class="selected-count">
               已选择 {{ selectedQuestions.length }} 题
             </div>
           </div>
           <div class="selected-questions">
             <div
               v-for="(question, index) in selectedQuestions"
               :key="question.sid"
               class="selected-question-card"
             >
               <div class="selected-question-header">
                 <span class="question-number">{{ index + 1 }}.</span>
                 <span class="question-type">{{ question.cate || question.qtype }}</span>
                 <el-button
                   size="mini"
                   type="danger"
                   @click="removeFromSelected(question.sid)"
                 >
                   移除
                 </el-button>
               </div>
               <div class="selected-question-content">
                 <div class="question-text">
                   <span v-if="question.label" class="question-label">{{ question.label }}</span>
                   <span v-html="processQuestionContent(question.question)"></span>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>

    <!-- 解析弹窗 -->
    <el-dialog
      title="题目解析"
      :visible.sync="analysisVisible"
      width="800px"
      append-to-body
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
import { getSubjectName, getQuestionDetail, getQuestionDetailByKnowledge, getQuestionTypes } from "@/api/system/paper"
import { listSubject } from "@/api/system/subject"
import { addTable, getChapterMap, getQuestionsByChapterPath } from "@/api/system/chapterTitle"
import { parseMathFormula } from "@/utils/mathFormula"
import { addLog } from "@/api/system/log.js"

export default {
  name: "AddChapterQuestion",
  data() {
    return {
      // 章节选项
      chapterOptions: [],
      chapterProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
             // 级联选择器配置
       cascaderProps: {
         children: 'children',
         label: 'label',
         value: 'value',
         checkStrictly: true, // 允许选择任意层级
         multiple: false
       },
      // 当前选中的章节
      selectedChapter: null,
      // 题目列表
      questions: [],
      // 已选题目
      selectedQuestions: [],
      // 筛选条件
      questionType: '',
      difficultyLevel: '',
      questionSearch: '',
      // 题目类型选项
      questionTypes: [],
      // 科目选项
      subjectOptions: [],
             // 章节表单
       chapterForm: {
         subject: '',
         customPaperName: '',
         questionIds: '',
         creator: '',
         relatedChapter: [] // 关联章节
       },
      // 表单验证规则
      chapterRules: {
        subject: [
          { required: true, message: '请选择科目', trigger: 'change' }
        ],
        customPaperName: [
          { required: true, message: '请输入章节名称', trigger: 'blur' }
        ],
        relatedChapter: [
          { required: true, message: '请选择关联章节', trigger: 'change' }
        ]
      },
      // 保存状态
      saving: false,
      // 解析弹窗
      analysisVisible: false,
      currentQuestion: null,
      questionDetail: null,
      loadingDetail: false
    }
  },
  computed: {
    // 过滤后的题目列表
    filteredQuestions() {
      let filtered = this.questions;
      
      // 按题型筛选
      if (this.questionType) {
        filtered = filtered.filter(q => {
          const questionType = q.cate || q.qtype || q.catename || '';
          return questionType.toLowerCase() === this.questionType.toLowerCase();
        });
      }
      
      // 按难度筛选
      if (this.difficultyLevel) {
        filtered = filtered.filter(q => {
          const difficulty = this.getDifficultyLevel(q.degree || q.difficulty);
          return difficulty === this.difficultyLevel;
        });
      }
      
      // 按搜索关键词筛选
      if (this.questionSearch) {
        const searchLower = this.questionSearch.toLowerCase();
        filtered = filtered.filter(q => 
          (q.question && q.question.toLowerCase().includes(searchLower)) ||
          (q.label && q.label.toLowerCase().includes(searchLower)) ||
          (q.cate && q.cate.toLowerCase().includes(searchLower)) ||
          (q.qtype && q.qtype.toLowerCase().includes(searchLower)) ||
          (q.catename && q.catename.toLowerCase().includes(searchLower))
        );
      }
      
      return filtered;
    }
  },
  created() {
    this.loadSubjectOptions();
    this.loadChapterOptions();
    this.chapterForm.creator = this.$store.getters.userId;
  },
  methods: {
    // 加载科目选项
    loadSubjectOptions() {
      listSubject().then(response => {
        this.subjectOptions = response.rows || [];
      });
    },
    
    // 加载章节选项
    loadChapterOptions() {
      getChapterMap().then(res => {
        if (res.code === 200) {
          // 过滤掉最后一级的节点（没有children的节点）
          this.chapterOptions = this.filterLastLevelNodes(res.data || [], []);
          console.log('Loaded chapter options:', this.chapterOptions);
        } else {
          console.error('获取章节列表失败:', res);
          this.$message.error('获取章节信息失败');
          this.chapterOptions = [];
        }
      }).catch(error => {
        console.error('获取章节列表失败:', error);
        this.$message.error('获取章节信息失败');
        this.chapterOptions = [];
        // 添加一些默认章节数据，避免界面空白
        this.chapterOptions = [];
      });
    },
    
    // 过滤掉最后一级的节点（知识点节点）
    // 语文和英语可以选到底层节点，其他科目只能选到底层上一层
    filterLastLevelNodes(nodes, currentPath = []) {
      // 严格的null和类型检查
      if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        console.warn('filterLastLevelNodes: 输入数据无效', nodes)
        return []
      }
      
      return nodes.map(node => {
        // 检查节点是否有效
        if (!node || typeof node !== 'object') {
          console.warn('filterLastLevelNodes: 节点数据无效', node)
          return null
        }
        
        // 确保node.label存在
        if (!node.label) {
          console.warn('filterLastLevelNodes: 节点缺少label', node)
          return null
        }
        
        const newPath = [...currentPath, node.label]
        const subjectName = this.extractSubjectFromPath(newPath)
        
        // 如果节点有children，递归过滤children
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const filteredChildren = this.filterLastLevelNodes(node.children, newPath)
          // 保留这个节点，但使用过滤后的children
          return {
            ...node,
            children: filteredChildren
          }
        }
        
        // 对于叶子节点的处理
        // 语文和英语：保留所有叶子节点（可以选到底层）
        // 其他科目：过滤掉叶子节点（只能选到底层上一层）
        if (this.isChineseOrEnglish(subjectName)) {
          return node // 语文和英语保留叶子节点
        } else {
          return null // 其他科目过滤掉叶子节点
        }
      }).filter(node => node !== null) // 过滤掉null值
    },
    
    // 从路径中提取科目名称
    extractSubjectFromPath(path) {
      if (!Array.isArray(path) || path.length < 2) {
        console.warn('extractSubjectFromPath: 路径数据无效', path)
        return ''
      }
      
      // 检查路径元素是否有效
      if (!path[0] || !path[1]) {
        console.warn('extractSubjectFromPath: 路径元素无效', path)
        return ''
      }
      
      // 路径格式通常是 ["高中", "数学", "第一章", ...]
      // 提取学段和学科组合，如 "高中数学"
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
    
    // 处理章节点击
    handleChapterClick(data) {
      this.selectedChapter = data;
      // 使用章节的完整路径作为参数
      this.loadQuestionsByChapter(data.value);
      this.loadQuestionTypes(); // 加载题型列表
    },
    
    // 根据章节加载题目
    loadQuestionsByChapter(chapterPath) {
      if (!chapterPath) {
        this.$message.warning('请选择章节');
        return;
      }
      getQuestionsByChapterPath(chapterPath).then(response => {
        if (response.questions && Array.isArray(response.questions)) {
          this.questions = response.questions;
        } else if (response.data && Array.isArray(response.data)) {
          this.questions = response.data;
        } else if (Array.isArray(response)) {
          this.questions = response;
        } else {
          this.questions = [];
        }
        // 新增：查询后记录日志
        if (this.questions.length > 0) {
          const ids = this.questions.map(item => item.sid).join(',');
          addLog({
            calledTableName: '章节题',
            calledTableId: ids,
            isRead: 1,
            isClickRead: 0,
            isUsed: 0
          });
        }
      }).catch(error => {
        console.error('获取题目失败:', error);
        this.$message.error('获取题目失败');
        this.questions = [];
      });
    },
    
    // 加载题型列表
    loadQuestionTypes() {
      // 获取题型列表
      let subjectName = '高中生物' // 默认值
      if (this.selectedChapter) {
        const chapterPath = this.buildChapterPath(this.selectedChapter);
        const pathParts = chapterPath.split('/');
        // 根据路径格式 "高中/数学/第一章 基础概念"，需要提取出"高中数学"这样的格式
        if (pathParts.length >= 2) {
          // 取第一部分（学段）+ 第二部分（学科）组合成完整科目名称
          subjectName = pathParts[0] + pathParts[1]; // 如"高中" + "数学" = "高中数学"
        } else if (pathParts.length === 1) {
          subjectName = pathParts[0]; // 如果只有一部分，直接使用
        }
      }
      
      getQuestionTypes(subjectName).then(res => {
        if (res.message === 'success' && res.question_types) {
          this.questionTypes = Object.keys(res.question_types).map(name => ({
            name, 
            count: res.question_types[name]
          }));
          console.log('获取到的题型列表:', this.questionTypes);
        } else {
          console.error('获取题型列表失败:', res);
          this.questionTypes = [];
        }
      }).catch(error => {
        console.error('获取题型列表失败:', error);
        this.questionTypes = [];
      });
    },

    // 构建章节路径
    buildChapterPath(chapter) {
      const findPath = (options, targetValue, path = []) => {
        for (let opt of options) {
          const newPath = [...path, opt.label];
          if (opt.value === targetValue) return newPath.join('/');
          if (opt.children) {
            const found = findPath(opt.children, targetValue, newPath);
            if (found) return found;
          }
        }
        return null;
      };
      return findPath(this.chapterOptions, chapter.value) || chapter.label;
    },

    // 获取难度等级
    getDifficultyLevel(difficulty) {
      const diff = parseFloat(difficulty);
      if (diff > 0 && diff <= 0.2) return 'hard';
      if (diff > 0.2 && diff <= 0.4) return 'harder';
      if (diff > 0.4 && diff <= 0.6) return 'medium';
      if (diff > 0.6 && diff <= 0.8) return 'easier';
      if (diff > 0.8 && diff <= 1) return 'easy';
      return 'medium'; // 默认值
    },

    // 筛选题目
    filterQuestions() {
      // 通过computed属性自动筛选
    },
    
    // 添加题目到已选列表
    addToSelected(question) {
      if (!this.isQuestionSelected(question.sid)) {
        this.selectedQuestions.push(question);
        // 新增：选择记录日志
        addLog({
          calledTableName: '章节题',
          calledTableId: question.sid,
          isRead: 0,
          isClickRead: 0,
          isUsed: 1
        });
      }
    },
    
    // 从已选列表中移除题目
    removeFromSelected(questionId) {
      const index = this.selectedQuestions.findIndex(q => q.sid === questionId);
      if (index > -1) {
        this.selectedQuestions.splice(index, 1);
      }
    },
    
    // 检查题目是否已选择
    isQuestionSelected(questionId) {
      return this.selectedQuestions.some(q => q.sid === questionId);
    },
    
    // 解析选项
    parseOptions(options) {
      if (!options) return [];
      
      // 尝试解析JSON格式的选项
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // 如果不是JSON，按换行符分割
      }
      
      // 按换行符分割
      return options.split('\n').filter(option => option.trim());
    },
    
    // 解析子题目
    parseChildren(children) {
      if (!children) return [];
      try {
        return JSON.parse(children);
      } catch {
        return [];
      }
    },
    
    // 处理题目内容
    processQuestionContent(content) {
      if (!content) return '';
      
      // 先解码HTML实体
      let processedContent = this.decodeHtmlEntities(content);
      // 处理数学公式
      processedContent = parseMathFormula(processedContent);
      // 处理bdo标签
      processedContent = this.processBdoTags(processedContent);
      // 处理可编辑答案输入区域
      return processedContent
        .replace(/<input[^>]*class="[^"]*answer-input[^"]*"[^>]*>/g, '<span class="answer-input">_____</span>')
        .replace(/<input[^>]*class="[^"]*blank-input[^"]*"[^>]*>/g, '<span class="blank-input">_____</span>')
        .replace(/<input[^>]*class="[^"]*fill-input[^"]*"[^>]*>/g, '<span class="fill-input">_____</span>');
    },
    
    // 处理bdo标签
    processBdoTags(content) {
      if (!content) return content;
      
      return content
        .replace(/<bdo[^>]*class="[^"]*"[^>]*>/g, '<bdo>')
        .replace(/<bdo[^>]*>/g, '<bdo>')
        .replace(/<br\s*\/?>/gi, '<br>')
        .replace(/&nbsp;/g, ' ');
    },
    
    // 显示解析
    showAnalysis(question) {
      this.currentQuestion = question;
      this.analysisVisible = true;
      this.loadingDetail = true;
      this.questionDetail = null;
      // 新增：解析记录日志
      addLog({
        calledTableName: '章节题',
        calledTableId: question.sid,
        isRead: 0,
        isClickRead: 1,
        isUsed: 0
      });
      
      // 构建新的API请求参数 - 使用知识点查询接口
      const requestData = {
        request: {
          node_ids: this.extractNodeIds(question),
          limit: 20
        },
        pagination: {
          page: 1,
          per_page: 50
        }
      };
      
      console.log('知识点查询请求参数:', requestData);
      
      // 调用新的知识点查询API
      getQuestionDetailByKnowledge(requestData).then(res => {
        console.log('知识点查询API响应:', res);
        // 检查响应数据格式
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          // 新的API格式：{questions: [...]}，取第一个题目
          this.questionDetail = res.questions[0];
        } else if (res && res.question_count === 0) {
          // 如果没有找到题目，尝试使用原来的接口作为备选
          this.fallbackToOriginalAPI(question);
        } else {
          this.$message.error('获取题目详情失败: 数据格式错误');
        }
      }).catch(error => {
        console.error('知识点查询失败:', error);
        // 如果新接口失败，尝试使用原来的接口作为备选
        this.fallbackToOriginalAPI(question);
      }).finally(() => {
        this.loadingDetail = false;
      });
    },
    
    // 从题目对象中提取知识点ID
    extractNodeIds(question) {
      // 尝试从题目对象中提取知识点ID
      const possibleIds = [
        question.node_id,
        question.knowledge_id,
        question.knowledge_code,
        question.topic,
        question.knowledge_name
      ].filter(id => id && id.trim());
      
      // 如果找到了知识点ID，返回数组
      if (possibleIds.length > 0) {
        return possibleIds;
      }
      
      // 如果没有找到，尝试从当前选中的章节中获取
      if (this.selectedChapter && this.selectedChapter.value) {
        return [this.selectedChapter.value];
      }
      
      // 如果都没有，返回默认值
      return ['0208010401b', '0208010402c'];
    },
    
    // 备选方案：使用原来的API
    fallbackToOriginalAPI(question) {
      console.log('使用备选API获取题目详情');
      const requestData = {
        subject: this.getSubjectFromChapter(question),
        sid: question.sid
      };
      
      getQuestionDetail(requestData).then(res => {
        console.log('备选API响应:', res);
        // 检查响应数据格式
        if (res && res.SID) {
          // 直接返回题目详情数据
          this.questionDetail = res;
        } else if (res && res.code === 200 && res.data) {
          // 标准格式：{code: 200, data: {...}}
          this.questionDetail = res.data;
        } else {
          this.$message.error('获取题目详情失败: 数据格式错误');
        }
      }).catch(error => {
        console.error('备选API也失败:', error);
        this.$message.error('获取题目详情失败: ' + (error.message || '网络错误'));
      });
    },

    // 从章节中获取科目信息
    getSubjectFromChapter(question) {
      // 从当前选中的章节中提取科目信息
      if (this.selectedChapter) {
        const chapterPath = this.buildChapterPath(this.selectedChapter);
        const pathParts = chapterPath.split('/');
        // 根据路径格式 "高中/数学/第一章 基础概念"，需要提取出"高中数学"这样的格式
        if (pathParts.length >= 2) {
          // 取第一部分（学段）+ 第二部分（学科）组合成完整科目名称
          return pathParts[0] + pathParts[1]; // 如"高中" + "数学" = "高中数学"
        } else if (pathParts.length === 1) {
          return pathParts[0]; // 如果只有一部分，直接使用
        }
      }
      // 如果没有章节信息，返回默认值
      return '高中数学';
    },

    // 判断选项是否为正确答案
    isCorrectOption(index, answers) {
      // 判断选项是否为正确答案
      if (!answers || !Array.isArray(answers)) return false;
      return answers.includes(index.toString());
    },

    // 从解析中提取答案
    extractAnswerFromMethod(method) {
      if (!method) return '';
      // 从解析中提取答案部分
      const answerMatch = method.match(/故选[：:]\s*([^<]+)/);
      if (answerMatch) {
        const answer = this.decodeHtmlEntities(answerMatch[1]);
        return `<strong>答案：</strong>${answer}`;
      }
      // 如果没有找到"故选"，尝试其他模式
      const otherMatch = method.match(/答案[：:]\s*([^<]+)/);
      if (otherMatch) {
        const answer = this.decodeHtmlEntities(otherMatch[1]);
        return `<strong>答案：</strong>${answer}`;
      }
      return method;
    },

    // 解码HTML实体
    decodeHtmlEntities(text) {
      if (!text) return text;
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    },
    
         // 保存章节
     saveChapter() {
       this.$refs.chapterForm.validate(valid => {
         if (valid) {
           if (this.selectedQuestions.length === 0) {
             this.$message.warning('请至少选择一个题目');
             return;
           }
           
           this.saving = true;
           
           // 构建题目ID字符串
           const questionIds = this.selectedQuestions.map(q => q.sid).join(',');
           this.chapterForm.questionIds = questionIds;
           
           // 处理关联章节 - 取数组的最后一个元素作为路径
           if (this.chapterForm.relatedChapter && this.chapterForm.relatedChapter.length > 0) {
             this.chapterForm.relatedChapterPath = this.chapterForm.relatedChapter[this.chapterForm.relatedChapter.length - 1];
           }
           
                       // 构建提交数据，不包含 knowledgePointIds 和 relatedChapter
            const submitData = {
              subject: this.chapterForm.subject,
              customPaperName: this.chapterForm.customPaperName,
              questionIds: this.chapterForm.questionIds,
              creator: this.chapterForm.creator,
              relatedChapterPath: this.chapterForm.relatedChapterPath
            };
           
                       addTable(submitData).then(response => {
              this.$modal.msgSuccess('章节题创建成功');
              // 跳转到章节题首页并刷新列表
              this.$router.push('/system/chapterTitle');
            }).catch(() => {
              this.saving = false;
            });
         }
       });
     },
    
    // 返回上一页
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.chapter-builder {
  display: flex;
  height: calc(100vh - 120px);
  gap: 20px;
}

.left-panel, .center-panel, .right-panel {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.left-panel {
  width: 300px;
  flex-shrink: 0;
}

.center-panel {
  flex: 1;
  min-width: 0;
}

.right-panel {
  width: 350px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.search-box {
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

.chapter-tree {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.question-list {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: #fafafa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.question-type {
  background: #67c23a;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-difficulty {
  color: #909399;
  font-size: 12px;
}

.question-content {
  margin-top: 10px;
}

.question-text {
  margin-bottom: 10px;
  line-height: 1.6;
}

.question-label {
  background: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-right: 8px;
}

.question-options {
  margin: 10px 0;
}

.option-item {
  display: flex;
  margin: 5px 0;
  align-items: flex-start;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 20px;
}

.option-content {
  flex: 1;
  line-height: 1.5;
}

.sub-questions {
  margin-top: 10px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
}

.sub-question-item {
  margin-bottom: 10px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.sub-question-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.sub-question-number {
  font-weight: bold;
  color: #409EFF;
  margin-right: 8px;
}

.sub-question-type {
  background: #409EFF;
  color: white;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.sub-question-content {
  line-height: 1.5;
}

.selected-count {
  font-size: 14px;
  color: #409EFF;
  font-weight: bold;
}

.selected-questions {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.selected-question-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  background: #f0f9ff;
}

.selected-question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.question-number {
  font-weight: bold;
  color: #409EFF;
  margin-right: 8px;
}

.selected-question-content {
  font-size: 13px;
  line-height: 1.4;
}

.chapter-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.form-content {
  padding: 15px;
  flex: 1;
}

.selected-questions-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.answer-input, .blank-input, .fill-input {
  display: inline-block;
  min-width: 60px;
  height: 20px;
  border-bottom: 2px solid #409EFF;
  margin: 0 2px;
  text-align: center;
  font-weight: bold;
  color: #409EFF;
}

/* 解析弹窗样式 */
.analysis-content {
  max-height: 600px;
  overflow-y: auto;
}

.loading-section {
  text-align: center;
  padding: 40px 0;
}

.loading-spinner {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 10px;
}

.detail-content {
  padding: 0;
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
  width: 80px;
  color: #606266;
}

.info-value {
  color: #303133;
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
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 5px;
}

.question-content {
  line-height: 1.6;
  color: #303133;
}

.option-item {
  display: flex;
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
  background: #f8f9fa;
}

.option-item.correct-option {
  background: #f0f9ff;
  border-left: 3px solid #67c23a;
}

.option-label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 25px;
  color: #409EFF;
}

.option-content {
  flex: 1;
  line-height: 1.5;
}

.answer-display {
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.answer-tag.correct {
  /* background: #fff; */
  color: black;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.answer-text {
  line-height: 1.6;
}

.analysis-content,
.analyse-content,
.discuss-content {
  line-height: 1.6;
  color: #303133;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.points-content {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  color: #606266;
}

.no-detail {
  text-align: center;
  padding: 40px 0;
}

/* 题目卡片底部按钮样式 */
.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
}

/* 表单提示信息样式 */
.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.form-tip i {
  margin-right: 4px;
  color: #409EFF;
}
</style>