<template>
    <el-dialog
      title="题目编辑与上传"
      :visible.sync="dialogVisible"
      width="85%"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
      top="2vh !important"
      height="96vh"
      style="overflow: visible;"
      append-to-body
      :modal="true"
      :modal-append-to-body="true"
      @close="handleDialogClose"
    >
      <!-- 全局设置区域 -->
      <!-- 全局设置按钮 -->
      <div class="global-settings-button-section">
        <el-button 
          type="primary" 
          plain 
          @click="openGlobalSettingsDialog"
          class="global-settings-button"
        >
          <i class="el-icon-setting"></i>
          {{ getGlobalSettingsDisplayText() }}
        </el-button>
        <el-button-group class="creation-mode-button-group">
          <el-button 
            type="success" 
            :class="{ 'is-active': creationMode === 'homework' }"
            @click="setCreationMode('homework')"
            :disabled="selectedQuestionIndices.length === 0 || !globalSettings.subject"
          >
            <i class="el-icon-document-add"></i>
            组卷 ({{ selectedQuestionIndices.length }})
          </el-button>
          <el-button 
            type="warning" 
            :class="{ 'is-active': creationMode === 'paper' }"
            @click="setCreationMode('paper')"
            :disabled="selectedQuestionIndices.length === 0 || !globalSettings.subject"
          >
            <i class="el-icon-document-add"></i>
            试卷 ({{ selectedQuestionIndices.length }})
          </el-button>
        </el-button-group>
        <el-button 
          type="primary" 
          plain
          @click="toggleSelectAll"
          :disabled="questions.length === 0"
          class="select-all-button"
        >
          <i class="el-icon-check"></i>
          {{ isAllSelected ? '取消全选' : '一键全选' }}
        </el-button>
      </div>
      
      <!-- 全局设置弹窗 -->
      <el-dialog
        title="全局设置"
        :visible.sync="globalSettingsDialogVisible"
        width="800px"
        append-to-body
        :close-on-click-modal="false"
      >
        <div class="global-settings-dialog-content">
          <el-form :model="globalSettings" label-width="100px">
            <el-form-item label="题库类型:">
              <el-select
                v-model="globalSettings.series_type"
                placeholder="选择题库类型（可多选）"
                style="width: 200px;"
                multiple
                @change="handleSeriesTypeChange"
              >
                <el-option
                  v-for="type in seriesTypeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            
            <!-- 科目下拉框：所有模式都显示 -->
            <el-form-item label="科目:">
              <el-select
                v-model="globalSettings.subject"
                filterable
                placeholder="选择科目"
                style="width: 200px;"
                @change="handleSubjectChange"
                :loading="subjectLoading"
                :disabled="!globalSettings.series_type || globalSettings.series_type.length === 0"
              >
                <el-option
                  v-for="subjectItem in subjectList"
                  :key="subjectItem.subjectId || subjectItem.id"
                  :label="subjectItem.subjectName || subjectItem.name"
                  :value="subjectItem.subjectName || subjectItem.name"
                >
                </el-option>
              </el-select>
            </el-form-item>
            
            <!-- 教辅材料模式：显示系列类型、系列、系列路径 -->
            <template v-if="globalSettings.series_type && globalSettings.series_type.includes('教辅材料')">
              <el-form-item label="教材类型:">
                <el-select
                  v-model="globalSettings.material_type"
                  placeholder="选择教材类型"
                  style="width: 200px;"
                  @change="handleMaterialTypeChange"
                >
                  <el-option
                    v-for="type in materialTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="教材:">
                <el-select
                  v-model="globalSettings.series"
                  filterable
                  placeholder="选择教材"
                  style="width: 300px;"
                  @change="handleGlobalSeriesChange"
                  :loading="seriesLoading"
                  :disabled="!globalSettings.material_type || !globalSettings.subject"
                >
                  <el-option
                    v-for="seriesItem in filteredSeriesList"
                    :key="seriesItem.id"
                    :label="seriesItem.series"
                    :value="seriesItem.id"
                  >
                    <span style="float: left">{{ seriesItem.series }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ seriesItem.subjectName || seriesItem.subject_name }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="教材路径:">
                <el-button 
                  type="primary" 
                  plain 
                  @click="openSeriesPathSelector"
                  :disabled="!globalSettings.series"
                  class="series-path-select-button"
                >
                  <i class="el-icon-location"></i>
                  {{ globalSettings.series_path || '点击选择教材路径' }}
                </el-button>
              </el-form-item>
            </template>
            
            <!-- 章节选择模式：显示版本选择和章节路径框 -->
            <template v-if="globalSettings.series_type && globalSettings.series_type.includes('章节选择')">
              <el-form-item label="章节版本:">
                <el-select
                  v-model="globalSettings.chapter_version"
                  filterable
                  placeholder="选择版本"
                  style="width: 300px;"
                  @change="handleChapterVersionChange"
                  :disabled="!globalSettings.subject"
                  :loading="versionLoading"
                >
                  <el-option
                    v-for="versionItem in versionList"
                    :key="versionItem.value"
                    :label="versionItem.label"
                    :value="versionItem.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="章节路径:">
                <el-button 
                  type="primary" 
                  plain 
                  @click="openChapterPathSelector"
                  :disabled="!globalSettings.subject || !globalSettings.chapter_version"
                  class="chapter-path-select-button"
                >
                  <i class="el-icon-folder-opened"></i>
                  {{ globalSettings.chapter_path || '点击选择章节路径' }}
                </el-button>
              </el-form-item>
            </template>
            
            <!-- 知识点选择模式：显示知识点下拉框 -->
            <template v-if="globalSettings.series_type && globalSettings.series_type.includes('知识点选择')">
              <el-form-item label="知识点:">
                <el-select
                  v-model="globalSettings.knowledge_name"
                  filterable
                  placeholder="选择知识点"
                  style="width: 300px;"
                  @change="handleKnowledgeNameChange"
                  :disabled="!globalSettings.subject"
                  :loading="knowledgeLoading"
                >
                  <el-option
                    v-for="knowledgeItem in knowledgeList"
                    :key="knowledgeItem.code"
                    :label="knowledgeItem.name"
                    :value="knowledgeItem.name"
                  >
                    <span>{{ knowledgeItem.name }}</span>
                    <!-- <span style="float: right; color: #8492a6; font-size: 13px">{{ knowledgeItem.code }}</span> -->
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeGlobalSettingsDialog">取消</el-button>
          <el-button type="primary" @click="confirmGlobalSettings">确定</el-button>
        </div>
      </el-dialog>
  
      <div class="question-editor-container">
        <!-- 题目列表 -->
        <div class="question-list-section">
          <div class="section-header">
            <div class="header-top">
              <div class="header-left">
                <h4>题目列表</h4>
                <el-tag type="info">{{ questions.length }} 道题目</el-tag>
              </div>
            </div>
            <div class="header-actions">
              <el-button 
                type="primary" 
                size="small" 
                icon="el-icon-plus"
                @click="addNewQuestion"
              >
                新增题目
              </el-button>
              <el-button 
                type="success" 
                size="small" 
                icon="el-icon-plus"
                @click="addSubQuestion"
                :disabled="!currentQuestion || currentQuestionIndex.includes('-')"
              >
                新增子题
              </el-button>
            </div>
          </div>
          
          <div class="question-list-vertical">
            <div 
              v-for="(question, index) in questions" 
              :key="index"
              class="question-group"
            >
              <!-- 主题目 -->
              <div 
                class="question-item main-question"
                :class="{ 'active': currentQuestionIndex === index.toString() }"
                @click="selectQuestion(index)"
              >
                <!-- 选中框 -->
                <el-checkbox
                  :value="isQuestionSelected(index)"
                  @change="(val) => toggleQuestionSelection(index, val)"
                  @click.stop
                  class="question-checkbox"
                ></el-checkbox>
                <div class="question-preview">
                  <h5>
                    题目 {{ question.mainQuestionIndex + 1 }}
                    <el-tag v-if="question.hasSubQuestions" size="mini" type="info" style="margin-left: 8px;">
                      含 {{ question.children ? question.children.length : 0 }} 道子题
                    </el-tag>
                  </h5>
                  <div class="question-content">
                    <div class="question-text">
                      {{ question.question || '题目内容为空' }}
                    </div>
                  </div>
                  <div class="question-meta">
                    <el-tag size="mini" type="primary">{{ question.qtype || '未知题型' }}</el-tag>
                    <el-tag size="mini" type="success">{{ question.subject_name || '未知学科' }}</el-tag>
                    <el-button 
                      type="text" 
                      size="mini" 
                      icon="el-icon-delete"
                      @click.stop="deleteQuestion(index)"
                      class="delete-question-btn"
                      style="margin-left: 8px; color: #f56c6c;"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
              
              <!-- 子题目拖拽容器 -->
              <draggable 
                v-if="question.children && question.children.length > 0"
                v-model="question.children"
                group="subQuestions"
                animation="200"
                ghost-class="ghost-question"
                chosen-class="chosen-question"
                drag-class="drag-question"
                handle=".drag-handle"
                @start="onSubQuestionDragStart"
                @end="onSubQuestionDragEnd(index)"
                class="sub-questions-container"
              >
                <div 
                  v-for="(subQuestion, subIndex) in question.children" 
                  :key="`${index}-${subIndex}`"
                  class="question-item sub-question"
                  :class="{ 'active': currentQuestionIndex === `${index}-${subIndex}` }"
                >
                  <!-- 拖拽手柄 -->
                  <div class="drag-handle" @click.stop>
                    <i class="el-icon-rank"></i>
                  </div>
                  
                  <!-- 插入按钮 -->
                  <div class="insert-buttons">
                    <el-button 
                      type="text" 
                      size="mini" 
                      icon="el-icon-plus"
                      @click.stop="insertSubQuestion(index, subIndex)"
                      class="insert-btn"
                      title="在此位置插入子题"
                    >
                    </el-button>
                  </div>
                  
                  <div class="question-preview" @click="selectSubQuestion(index, subIndex)">
                    <h5>
                      子题 {{ question.mainQuestionIndex + 1 }}-{{ subIndex + 1 }}
                      <el-tag size="mini" type="warning" style="margin-left: 8px;">子题</el-tag>
                    </h5>
                    
                    <!-- 题型和分数 -->
                    <div class="question-meta">
                      <el-tag size="mini" type="info" v-if="subQuestion.score || subQuestion.Score">
                        分数: {{ subQuestion.score || subQuestion.Score }}
                      </el-tag>
                    </div>
                    
                    <!-- 题目内容 -->
                    <div class="question-content">
                      <div class="question-text">
                        {{ subQuestion.content || subQuestion.question || '子题内容为空' }}
                      </div>
                    </div>
                    <div class="question-meta">
                      <el-tag size="mini" type="primary">{{ subQuestion.qtype || '未知题型' }}</el-tag>
                      <el-button 
                        type="text" 
                        size="mini" 
                        icon="el-icon-delete"
                        @click.stop="deleteSubQuestion(index, subIndex)"
                        class="delete-question-btn"
                        style="color: #f56c6c;"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
              </draggable>
              
              <!-- 在子题列表末尾添加插入按钮 -->
              <div v-if="question.children && question.children.length > 0" class="add-subquestion-at-end">
                <el-button 
                  type="dashed" 
                  size="small" 
                  icon="el-icon-plus"
                  @click="insertSubQuestion(index, question.children.length)"
                  class="add-subquestion-btn"
                >
                  在末尾添加子题
                </el-button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 题目编辑区域 -->
        <div class="question-edit-section" v-if="currentQuestion">
          <div class="edit-header">
            <h4>
              <span v-if="currentQuestion.isMainQuestion">
                编辑题目 {{ currentQuestion.mainQuestionIndex + 1 }}
                <el-tag v-if="currentQuestion.hasSubQuestions" size="mini" type="info" style="margin-left: 8px;">
                  主题目 (含 {{ currentQuestion.children ? currentQuestion.children.length : 0 }} 道子题)
                </el-tag>
              </span>
              <span v-else>
                编辑子题 {{ currentQuestion.mainQuestionIndex + 1 }}-{{ currentQuestion.subQuestionIndex + 1 }}
                <el-tag size="mini" type="warning" style="margin-left: 8px;">子题</el-tag>
              </span>
            </h4>
            <div class="edit-actions">
              <el-button size="small" @click="resetQuestionContent">
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </div>
          </div>
  
          <!-- 题目基本信息 -->
          <div class="question-basic-info">
            <el-form ref="elForm" :model="currentQuestion">
              <el-row :gutter="20">
                <!-- 主题目显示完整信息 -->
                <template v-if="currentQuestion.isMainQuestion">
                  <el-col :span="4">
                    <el-form-item label="学科">
                      <el-select 
                        v-model="currentQuestion.subject_name" 
                        placeholder="请选择学科" 
                        style="width: 100%" 
                        @change="handleQuestionSubjectChange"
                        :loading="subjectLoading"
                        filterable
                      >
                        <el-option
                          v-for="subjectItem in subjectList"
                          :key="subjectItem.subjectId || subjectItem.id"
                          :label="subjectItem.subjectName || subjectItem.name"
                          :value="subjectItem.subjectName || subjectItem.name"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4">
                    <el-form-item label="题型">
                      <el-select 
                        v-model="currentQuestion.qtype" 
                        placeholder="请选择题型"
                        style="width: 100%"
                        :loading="questionTypesLoading"
                        @change="handleQuestionTypeChange"
                      >
                        <el-option
                          v-for="option in questionTypeOptions"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="5">
                    <el-form-item label="分数">
                      <el-input-number 
                        v-model="currentQuestion.score" 
                        :min="0" 
                        :max="100" 
                        placeholder="请输入分数"
                        style="width: 100%"
                        @change="handleScoreChange"
                      ></el-input-number>
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item label="试题来源">
                      <div class="label-input-container">
                        <el-input 
                          v-model="currentQuestion.label" 
                          placeholder="请输入试题来源"
                          @change="handleLabelChange"
                          @input="handleLabelInput"
                          :class="{ 'label-error': isImageParseFailed(currentQuestion.label) }"
                        ></el-input>
                        <div v-if="isImageParseFailed(currentQuestion.label)" class="label-error-tip">
                          <i class="el-icon-warning"></i>
                          内容为"图片解析失败"，请修改试题来源
                        </div>
                      </div>
                    </el-form-item>
                  </el-col>
                </template>
                
                <!-- 子题目只显示题型和分数 -->
                <template v-else>
                  <el-col :span="12">
                    <el-form-item label="题型">
                      <el-select 
                        v-model="currentQuestion.qtype" 
                        placeholder="请选择题型"
                        style="width: 100%"
                        :loading="questionTypesLoading"
                        @change="handleQuestionTypeChange"
                      >
                        <el-option
                          v-for="option in questionTypeOptions"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="分数">
                      <el-input-number 
                        v-model="currentQuestion.score" 
                        :min="0" 
                        :max="100" 
                        style="width: 100%"
                        @change="handleScoreChange"
                      ></el-input-number>
                    </el-form-item>
                  </el-col>
                </template>
              </el-row>
            </el-form>
          </div>
  
          <!-- 题目内容 -->
          <div class="question-content-section">
            <div class="field-header">
              <span class="field-label">题目</span>
              <el-button size="mini" type="primary" @click="openEditDialog('question')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="current-question-content">
                <div v-if="!currentQuestion.isMainQuestion" class="sub-question-label">
                  <el-tag size="mini" type="warning">子题内容</el-tag>
                </div>
                <div class="content-preview" v-html="renderMarkdown(currentQuestion.content || currentQuestion.question || '题目内容为空')"></div>
              </div>
            </div>
          </div>
          
          <!-- 选项编辑（如果是选择题） -->
          <div class="options-section" v-if="isChoiceQuestion(currentQuestion)">
            <div class="field-header">
              <span class="field-label">选项</span>
              <el-button size="mini" type="primary" @click="openEditDialog('options')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="options-preview">
                <div v-if="currentQuestion.options && currentQuestion.options.length > 0">
                  <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="option-content" v-html="renderMarkdown(option)"></span>
                  </div>
                </div>
                <div v-else class="no-options-tip">
                  <i class="el-icon-info"></i>
                  <span>暂无选项，请点击"修改/编辑"添加选项</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 答案编辑 -->
          <div class="answer-section">
            <div class="field-header">
              <span class="field-label">答案</span>
              <el-button size="mini" type="primary" @click="openEditDialog('answer')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="content-preview" v-html="renderMarkdown(getAnswerContent())"></div>
            </div>
          </div>
  
          <!-- 解析内容（仅主题目显示） -->
          <div v-if="currentQuestion.isMainQuestion" class="analysis-content-section">
            <div class="field-header">
              <span class="field-label">解析</span>
              <el-button size="mini" type="primary" @click="openEditDialog('analysis')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="content-preview" v-html="renderMarkdown(currentQuestion.Analyse || '解析内容为空')"></div>
            </div>
          </div>
  
          <!-- 方法内容（仅主题目显示） -->
          <div v-if="currentQuestion.isMainQuestion" class="method-content-section">
            <div class="field-header">
              <span class="field-label">方法</span>
              <el-button size="mini" type="primary" @click="openEditDialog('method')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="content-preview" v-html="renderMarkdown(currentQuestion.Method || '方法内容为空')"></div>
            </div>
          </div>
  
          <!-- 讨论内容（仅主题目显示） -->
          <div v-if="currentQuestion.isMainQuestion" class="discuss-content-section">
            <div class="field-header">
              <span class="field-label">讨论</span>
              <el-button size="mini" type="primary" @click="openEditDialog('discuss')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="content-preview" v-html="renderMarkdown(currentQuestion.Discuss || '讨论内容为空')"></div>
            </div>
          </div>
  
          <!-- 知识点选择（仅主题目显示） -->
          <div v-if="currentQuestion.isMainQuestion" class="knowledge-points-section">
            <div class="field-header">
              <span class="field-label">知识点:</span>
            </div>
            <div class="field-content">
              <el-select
                v-model="currentQuestion.knowledge_points"
                multiple
                filterable
                placeholder="选择知识点"
                style="width: 100%"
                @change="handleKnowledgePointsChange"
                @focus="handleKnowledgePointsFocus"
                :loading="knowledgePointsLoading"
              >
                <el-option
                  v-for="point in availableKnowledgePoints"
                  :key="point"
                  :label="point"
                  :value="point"
                >
                </el-option>
              </el-select>
            </div>
          </div>
  
          <!-- 标签选择（仅主题目显示） -->
          <div v-if="currentQuestion.isMainQuestion" class="tags-section">
            <div class="field-header">
              <span class="field-label">标签:</span>
            </div>
            <div class="field-content">
              <el-select
                v-model="currentQuestion.tags"
                multiple
                filterable
                allow-create
                placeholder="输入或选择标签"
                style="width: 100%"
                @change="handleTagsChange"
              >
                <el-option
                  v-for="tag in availableTags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                >
                </el-option>
              </el-select>
            </div>
          </div>
  
          <!-- 主题/话题选择（仅主题目显示） -->
          <div v-if="currentQuestion.isMainQuestion" class="topic-section">
            <div class="field-header">
              <span class="field-label">主题/话题:</span>
            </div>
            <div class="field-content">
              <el-select
                v-model="currentQuestion.topic"
                multiple
                filterable
                allow-create
                placeholder="输入或选择主题/话题"
                style="width: 100%"
                @change="handleTopicChange"
              >
                <el-option
                  v-for="topic in availableTopics"
                  :key="topic"
                  :label="topic"
                  :value="topic"
                >
                </el-option>
              </el-select>
            </div>
          </div>
  
          <!-- 难度系数（仅主题目显示） -->
          <div v-if="currentQuestion.isMainQuestion" class="degree-section">
            <div class="field-header">
              <span class="field-label">难度系数:</span>
            </div>
            <div class="field-content">
              <el-slider
                v-model="currentQuestion.degree"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                :format-tooltip="formatDegreeTooltip"
                style="width: 100%"
                @input="handleDegreeChange"
              ></el-slider>
              <div class="degree-tips">
                <span class="tip-item">困难: 0.0-0.3</span>
                <span class="tip-item">中等: 0.3-0.7</span>
                <span class="tip-item">简单: 0.7-1.0</span>
              </div>
            </div>
          </div>
  
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="warning" @click="validateAllQuestions">
          <i class="el-icon-check"></i>
          验证格式
        </el-button>
        <el-button 
          type="primary" 
          :loading="uploadingQuestions"
          @click="uploadAllQuestions"
        >
          <i class="el-icon-upload"></i>
          {{ uploadingQuestions ? '上传中...' : '上传所有题目' }}
        </el-button>
      </div>
  
      <!-- 内容编辑弹窗 -->
      <ContentEditDialog
        :visible="editDialogVisible"
        :title="editDialogTitle"
        :content="editingContent"
        :placeholder="editPlaceholder"
        :edit-type="editDialogType"
        :question-data="currentQuestion"
        @confirm="handleContentEditConfirm"
        @close="handleContentEditClose"
      />
  
      <!-- 系列路径选择弹窗 -->
      <SeriesPathDialog
        :visible="seriesPathDialogVisible"
        :series-data="selectedSeriesData"
        @confirm="handleSeriesPathSelectionConfirm"
        @close="handleSeriesPathDialogClose"
      />
      
      <!-- 章节路径选择弹窗 -->
      <ChapterSelectorDialog
        :visible="chapterPathDialogVisible"
        :subject-name="selectedChapterSubject"
        :chapter-tree-data="chapterTreeData"
        @confirm="handleChapterPathSelectionConfirm"
        @close="handleChapterPathDialogClose"
      />
      
      <!-- 知识点路径选择弹窗（复用章节选择器，但使用知识点树数据） -->
      <ChapterSelectorDialog
        :visible="knowledgePathDialogVisible"
        :subject-name="selectedKnowledgeSubject"
        :chapter-tree-data="knowledgeTreeData"
        @confirm="handleKnowledgePathSelectionConfirm"
        @close="handleKnowledgePathDialogClose"
      />
      
      
    </el-dialog>
  </template>
  
  <script>
  import ContentEditDialog from '@/components/Dialogs/ContentEditDialog'
  import SeriesPathDialog from '@/components/Dialogs/SeriesPathDialog'
  import ChapterSelectorDialog from '@/components/Dialogs/ChapterSelectorDialog'
  import { marked } from 'marked'
  import { uploadQuestion } from '@/api/system/teachingMaterials'
  import { listSeries } from '@/api/system/series'
  import { addTable } from '@/api/system/table'
  import { addPaper } from '@/api/system/paper'
  import { getKnowledgePoints } from '@/api/system/teachingMaterials'
  import { getChapterMap } from '@/api/system/chapterTitle'
  import { listSubject } from '@/api/system/subject'
  import { getAllSubjectVersions, getDirectoryTree, getKnowledgeLeafNodes } from '@/api/system/problems'
  import draggable from 'vuedraggable'
  import { getToken } from '@/utils/auth'
  import { QUESTION_TYPE_MAPPINGS, getQuestionTypes as getQuestionTypesFromUtils, getQuestionTypeCode, formatQuestionTypeOptions, getQuestionTypeByCode } from "@/utils/questionTypeMappings"
  import katex from 'katex'
  import 'katex/dist/katex.min.css'
  
  export default {
    name: 'QuestionEditorDialog',
    components: {
      ContentEditDialog,
      SeriesPathDialog,
      ChapterSelectorDialog,
      draggable
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      questions: {
        type: Array,
        default: () => []
      },
      currentTaskId: {
        type: [String, Number],
        default: null
      },
      userRole: {
        type: [String, Number],
        default: 0
      }
    },
    data() {
      return {
        dialogVisible: false,
        
        // 题目编辑相关
        currentQuestionIndex: '0',
        uploadingQuestions: false,
        availableKnowledgePoints: [],
        knowledgePointsLoading: false,
        
        // 拖拽相关
        draggingSubQuestion: false,
        
        // 题型选择相关
        questionTypes: [],
        questionTypesLoading: false,
        questionTypeOptions: [],
        
        // 新增参数相关
        availableTags: [],
        availableTopics: [],
        seriesList: [],
        seriesLoading: false,
        
        // 题库类型选项
        seriesTypeOptions: [
          { label: '章节选择', value: '章节选择' },
          { label: '知识点选择', value: '知识点选择' },
          { label: '教辅材料', value: '教辅材料' }
        ],
        
        // 全局设置
        globalSettings: {
          subject: '',
          series_type: [], // 改为数组，支持多选
          material_type: '', // 教辅材料的系列类型：书、试卷、视频
          series: null,
          series_path: '',
          chapter_version: '',
          chapter_path: '',
          knowledge_name: '' // 存储知识点的名称
        },
        
        // 系列类型选项（教辅材料用）
        materialTypeOptions: [
          { label: '书', value: '书' },
          { label: '试卷', value: '试卷' },
          { label: '视频', value: '视频' }
        ],
        
        // 科目相关
        subjectList: [],
        subjectLoading: false,
        
        // 版本相关（章节选择用）
        versionList: [],
        versionLoading: false,
        
        // 知识点列表
        knowledgeList: [],
        knowledgeLoading: false,
        
        // 章节路径选择相关
        chapterPathDialogVisible: false,
        selectedChapterSubject: '',
        chapterTreeData: [], // 存储章节树数据
        
        // 知识点路径选择相关
        knowledgePathDialogVisible: false,
        selectedKnowledgeSubject: '',
        knowledgeTreeData: [], // 存储知识点树数据
        
        // 全局设置弹窗
        globalSettingsDialogVisible: false,
        
        // 编辑弹窗相关
        editDialogVisible: false,
        editDialogType: '',
        editDialogTitle: '',
        editingContent: '',
        editPlaceholder: '',
        
        // 系列路径选择
        seriesPathDialogVisible: false,
        selectedSeriesData: null,
        
        // 题目选中状态管理
        selectedQuestionIndices: [], // 使用数组存储选中的题目索引
        
        // 创建模式相关（组卷或试卷）
        creationMode: null, // 'homework' 或 'paper' 或 null
        storedSubject: '', // 存储的科目（当用户选中题目时存储）
        
        // 科目代码映射字典
        SUBJECT_CODE_DICT: {
          // 小学学科
          "小学数学": "10",
          "小学语文": "11", 
          "小学英语": "12",
          "小学科学": "14",
          "小学道德与法治": "15",
          // 初中学科
          "初中数学": "20",
          "初中物理": "21",
          "初中化学": "22",
          "初中生物": "23",
          "初中科学": "24",
          "初中地理": "25",
          "初中语文": "26",
          "初中英语": "27",
          "初中道德与法治": "28",
          "初中历史": "29",
          // 高中学科
          "高中数学": "30",
          "高中物理": "31",
          "高中化学": "32",
          "高中生物": "33",
          "高中地理": "35",
          "高中语文": "36",
          "高中英语": "37",
          "高中政治": "38",
          "高中历史": "39",
          "高中信息": "42",
          "高中通用": "43"
        }
      }
    },
    computed: {
      // 检查是否全部选中
      isAllSelected() {
        if (this.questions.length === 0) {
          return false
        }
        return this.selectedQuestionIndices.length === this.questions.length
      },
      currentQuestion() {
        console.log('计算currentQuestion:', {
          currentQuestionIndex: this.currentQuestionIndex,
          questionsLength: this.questions.length
        })
        
        // 确保currentQuestionIndex是字符串类型
        if (typeof this.currentQuestionIndex !== 'string') {
          this.currentQuestionIndex = String(this.currentQuestionIndex)
        }
        
        // 检查是否是子题索引格式 "mainIndex-subIndex"
        if (this.currentQuestionIndex.includes('-')) {
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            const subQuestion = mainQuestion.children[subIndex]
            // 为子题添加父题目信息，并复用父题目的学科信息
            return {
              ...subQuestion,
              isMainQuestion: false,
              mainQuestionIndex: mainIndex,
              subQuestionIndex: subIndex,
              // 如果子题没有学科信息，复用父题目的学科信息
              subject_name: subQuestion.subject_name || mainQuestion.subject_name || mainQuestion.subject,
              parentQuestion: {
                question: mainQuestion.question,
                qtype: mainQuestion.qtype,
                subject: mainQuestion.subject,
                subject_name: mainQuestion.subject_name
              }
            }
          }
          return null
        } else {
          // 主题目
          const index = parseInt(this.currentQuestionIndex)
          const mainQuestion = this.questions[index]
          if (mainQuestion) {
            return {
              ...mainQuestion,
              isMainQuestion: true,
              mainQuestionIndex: index
            }
          }
          return null
        }
      },
      filteredSeriesList() {
        // 接口已经根据科目和系列类型过滤了，直接返回系列列表
        return this.seriesList || []
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
      questions: {
        handler(newVal) {
          if (newVal && newVal.length > 0) {
            this.initAvailableData()
          }
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      // 初始化弹窗
      initDialog() {
        this.currentQuestionIndex = '0'
        // 清空选中状态
        this.selectedQuestionIndices = []
        // 如果有题目数据，根据第一个题目的学科加载题型
        if (this.questions && this.questions.length > 0 && this.questions[0].subject_name) {
          this.loadQuestionTypes(this.questions[0].subject_name)
        } else {
          // 否则加载通用题型
          this.loadQuestionTypes()
        }
        // 加载科目列表
        this.loadSubjectList()
        // 加载系列列表
        this.loadSeriesList()
        this.initAvailableData()
      },
      
      // 切换题目选中状态
      toggleQuestionSelection(index, checked) {
        const indexInArray = this.selectedQuestionIndices.indexOf(index)
        if (checked && indexInArray === -1) {
          this.selectedQuestionIndices.push(index)
          // 当用户选中题目时，存储全局设置里的科目
          if (this.globalSettings.subject) {
            this.storedSubject = this.globalSettings.subject
          }
        } else if (!checked && indexInArray !== -1) {
          this.selectedQuestionIndices.splice(indexInArray, 1)
          // 如果所有题目都取消选中，清空存储的科目和创建模式
          if (this.selectedQuestionIndices.length === 0) {
            this.storedSubject = ''
            this.creationMode = null
          }
        }
      },
      
      // 检查题目是否被选中
      isQuestionSelected(index) {
        return this.selectedQuestionIndices.includes(index)
      },
      
      // 一键全选/取消全选
      toggleSelectAll() {
        if (this.questions.length === 0) {
          this.$message.warning('没有题目可选')
          return
        }
        
        if (this.isAllSelected) {
          // 取消全选
          this.selectedQuestionIndices = []
          this.storedSubject = ''
          this.creationMode = null
          this.$message.info('已取消全选')
        } else {
          // 全选所有题目
          this.selectedQuestionIndices = this.questions.map((_, index) => index)
          // 当用户全选题目时，存储全局设置里的科目
          if (this.globalSettings.subject) {
            this.storedSubject = this.globalSettings.subject
          }
          this.$message.success(`已全选 ${this.questions.length} 道题目`)
        }
      },
      
      // 设置创建模式（组卷或试卷）
      setCreationMode(mode) {
        if (this.selectedQuestionIndices.length === 0) {
          this.$message.warning('请先选择要添加的题目')
          return
        }
        if (!this.globalSettings.subject) {
          this.$message.warning('请先在全局设置中选择科目')
          return
        }
        
        // 如果点击的是已经选中的模式，则取消选中
        if (this.creationMode === mode) {
          this.creationMode = null
          this.$message.info('已取消创建模式')
          return
        }
        
        // 否则设置为新的模式
        this.creationMode = mode
        this.storedSubject = this.globalSettings.subject
        this.$message.success(`已设置为${mode === 'homework' ? '组卷' : '试卷'}模式，将在上传完成后自动创建`)
      },
      
      // 打开全局设置弹窗
      openGlobalSettingsDialog() {
        this.globalSettingsDialogVisible = true
      },
      
      // 关闭全局设置弹窗
      closeGlobalSettingsDialog() {
        this.globalSettingsDialogVisible = false
      },
      
      // 确认全局设置
      confirmGlobalSettings() {
        // 验证必填字段
        if (!this.globalSettings.series_type || this.globalSettings.series_type.length === 0) {
          this.$message.warning('请选择题库类型')
          return
        }
        
        // 验证教辅材料相关字段
        if (this.globalSettings.series_type.includes('教辅材料')) {
          if (!this.globalSettings.material_type) {
            this.$message.warning('请选择系列类型')
            return
          }
          if (!this.globalSettings.series) {
            this.$message.warning('请选择系列')
            return
          }
          if (!this.globalSettings.series_path) {
            this.$message.warning('请选择系列路径')
            return
          }
        }
        
        // 验证章节选择相关字段
        if (this.globalSettings.series_type.includes('章节选择')) {
          if (!this.globalSettings.subject) {
            this.$message.warning('请选择科目')
            return
          }
          if (!this.globalSettings.chapter_version) {
            this.$message.warning('请选择版本')
            return
          }
          if (!this.globalSettings.chapter_path) {
            this.$message.warning('请选择章节路径')
            return
          }
        }
        
        // 验证知识点选择相关字段
        if (this.globalSettings.series_type.includes('知识点选择')) {
          if (!this.globalSettings.subject) {
            this.$message.warning('请选择科目')
            return
          }
          if (!this.globalSettings.knowledge_name) {
            this.$message.warning('请选择知识点')
            return
          }
        }
        
        this.$message.success('全局设置已保存')
        this.closeGlobalSettingsDialog()
      },
      
      // 获取全局设置显示文本
      getGlobalSettingsDisplayText() {
        if (!this.globalSettings.series_type || this.globalSettings.series_type.length === 0) {
          return '点击设置全局配置'
        }
        
        const types = Array.isArray(this.globalSettings.series_type) 
          ? this.globalSettings.series_type.join('、') 
          : this.globalSettings.series_type
        let text = `题库类型: ${types}`
        
        // 显示科目（如果有）
        if (this.globalSettings.subject) {
          text += ` | 科目: ${this.globalSettings.subject}`
        }
        
        // 显示教辅材料相关信息
        if (this.globalSettings.series_type.includes('教辅材料') && this.globalSettings.series) {
          const seriesItem = this.seriesList.find(item => item.id === this.globalSettings.series)
          if (seriesItem) {
            text += ` | 系列: ${seriesItem.series}`
          }
        }
        
        // 显示章节选择相关信息
        if (this.globalSettings.series_type.includes('章节选择') && this.globalSettings.chapter_version) {
          text += ` | 版本: ${this.globalSettings.chapter_version}`
        }
        
        return text
      },
      
      // 加载科目列表（在打开弹窗时调用，不在每次打开下拉框时调用）
      loadSubjectList() {
        // 如果已经加载过且列表不为空，不再重复加载
        if (this.subjectList.length > 0) {
          return
        }
        if (this.subjectLoading) return
        this.subjectLoading = true
        listSubject().then(response => {
          if (response && response.code === 200) {
            const options = response.rows || response.data || []
            this.subjectList = Array.isArray(options) ? options : []
          } else {
            this.subjectList = []
            this.$message.error('获取科目列表失败：' + (response.msg || '未知错误'))
          }
          this.subjectLoading = false
        }).catch(error => {
          console.error('获取科目列表失败:', error)
          this.$message.error('获取科目列表失败：' + (error.message || '网络错误'))
          this.subjectList = []
          this.subjectLoading = false
        })
      },
      
      // 处理科目变化
      async handleSubjectChange(subjectName) {
        console.log('科目变化:', subjectName)
        this.globalSettings.subject = subjectName
        
        // 根据科目更新章节和知识点路径选择器的学科
        this.selectedChapterSubject = subjectName
        this.selectedKnowledgeSubject = subjectName
        
        // 如果是教辅材料模式，重新加载系列列表
        if (this.globalSettings.series_type && this.globalSettings.series_type.includes('教辅材料') && subjectName) {
          this.globalSettings.series = null
          this.globalSettings.series_path = ''
          // 如果系列类型已选择，重新加载系列列表
          if (this.globalSettings.material_type) {
            await this.loadSeriesList()
          }
        }
        // 如果是章节选择模式，重新加载版本列表
        if (this.globalSettings.series_type && this.globalSettings.series_type.includes('章节选择') && subjectName) {
          this.globalSettings.chapter_version = ''
          this.globalSettings.chapter_path = ''
          this.loadVersionList()
        }
        // 如果是知识点选择模式，重新加载知识点列表
        if (this.globalSettings.series_type && this.globalSettings.series_type.includes('知识点选择') && subjectName) {
          this.globalSettings.knowledge_name = ''
          // 重新加载知识点列表
          await this.loadKnowledgeListByVersion()
        }
      },
      
      // 加载版本列表（章节选择用）
      async loadVersionList() {
        if (!this.globalSettings.subject) {
          this.versionList = []
          return
        }
        
        if (this.versionLoading) return
        this.versionLoading = true
        
        try {
          // 构建请求参数：{subjects: ["高中数学"]}
          const requestData = {
            subjects: [this.globalSettings.subject]
          }
          
          const response = await getAllSubjectVersions(requestData)
          
          // 处理响应数据
          let subjectsData = null
          if (response && response.code === 200) {
            if (response.data && response.data.subjects) {
              subjectsData = response.data.subjects
            } else if (response.subjects) {
              subjectsData = response.subjects
            }
          } else if (response && response.subjects) {
            subjectsData = response.subjects
          }
          
          if (subjectsData && typeof subjectsData === 'object') {
            const versionList = []
            const subjectName = this.globalSettings.subject
            
            // 从响应中提取该科目的版本列表
            if (subjectsData[subjectName] && subjectsData[subjectName].version_groups) {
              Object.keys(subjectsData[subjectName].version_groups).forEach(versionName => {
                const versionGroup = subjectsData[subjectName].version_groups[versionName]
                if (versionGroup && versionGroup.version_name) {
                  versionList.push({
                    label: versionGroup.version_name,
                    value: versionGroup.version_name
                  })
                }
              })
            }
            
            this.versionList = versionList
            console.log('版本列表已加载:', this.versionList)
          } else {
            console.warn('版本列表数据格式不正确:', response)
            this.versionList = []
          }
        } catch (error) {
          console.error('加载版本列表失败:', error)
          this.$message.error('获取版本列表失败：' + (error.message || '网络错误'))
          this.versionList = []
        } finally {
          this.versionLoading = false
        }
      },
      
      // 处理版本变化
      async handleChapterVersionChange(versionName) {
        console.log('版本变化:', versionName)
        this.globalSettings.chapter_version = versionName
        this.globalSettings.chapter_path = ''
        
        // 选择版本后，加载章节树
        if (versionName && this.globalSettings.subject) {
          await this.loadChapterTreeByVersion()
        }
      },
      
      // 根据版本加载章节树
      async loadChapterTreeByVersion() {
        if (!this.globalSettings.subject || !this.globalSettings.chapter_version) {
          return
        }
        
        try {
          // 构建请求参数：{subject: "高中数学", version_name: "人教B版（2019）"}
          const requestData = {
            subject: this.globalSettings.subject,
            version_name: this.globalSettings.chapter_version,
            root_code: null
          }
          
          const response = await getDirectoryTree(requestData)
          
          // 处理响应数据
          if (response && response.code === 200) {
            const treeData = response.data || response.tree || []
            // 转换数据格式为 ChapterSelectorDialog 需要的格式
            this.chapterTreeData = this.convertChapterTreeData(treeData)
            console.log('章节树已加载:', this.chapterTreeData)
          } else {
            console.warn('章节树数据格式不正确:', response)
            this.chapterTreeData = []
          }
        } catch (error) {
          console.error('加载章节树失败:', error)
          this.$message.error('获取章节树失败：' + (error.message || '网络错误'))
          this.chapterTreeData = []
        }
      },
      
      // 转换章节树数据格式
      convertChapterTreeData(nodes) {
        if (!Array.isArray(nodes)) {
          return []
        }
        
        return nodes.map(node => {
          const converted = {
            label: node.name || node.label || '',
            value: node.code || node.value || '',
            children: []
          }
          
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            converted.children = this.convertChapterTreeData(node.children)
          }
          
          return converted
        })
      },
      
      // 获取上传时使用的路径（根据题库类型返回对应的路径）
      // 注意：多选模式下，优先返回第一个选中的类型的路径
      getPathForUpload() {
        if (!this.globalSettings.series_type || this.globalSettings.series_type.length === 0) {
          return ''
        }
        
        // 按优先级返回路径：章节选择 > 知识点选择 > 教辅材料
        if (this.globalSettings.series_type.includes('章节选择')) {
          return this.globalSettings.chapter_path || ''
        }
        if (this.globalSettings.series_type.includes('知识点选择')) {
          // 知识点选择使用 knowledge_name 作为路径
          return this.globalSettings.knowledge_name || ''
        }
        if (this.globalSettings.series_type.includes('教辅材料')) {
          return this.globalSettings.series_path || ''
        }
        return ''
      },
  
      // 初始化可用数据
      initAvailableData() {
        this.initAvailableTopics()
        this.initAvailableTags()
        this.initAvailableKnowledgePoints()
      },
  
      // 关闭弹窗
      handleDialogClose() {
        this.dialogVisible = false
        this.$emit('close')
      },
  
      // 加载题型列表
      async loadQuestionTypes(subjectName) {
        if (!subjectName) {
          // 如果没有指定学科，使用通用题型
          this.questionTypeOptions = []
          return
        }
        
        try {
          this.questionTypesLoading = true
          // 使用独立的题型映射工具函数
          const typeMapping = getQuestionTypesFromUtils(subjectName)
          if (typeMapping && Object.keys(typeMapping).length > 0) {
            this.questionTypes = typeMapping
            // 使用工具函数格式化题型数据为选项格式
            this.questionTypeOptions = formatQuestionTypeOptions(subjectName)
            console.log(`学科 ${subjectName} 的题型选项:`, this.questionTypeOptions)
          } else {
            console.warn(`未找到学科 ${subjectName} 的题型映射，使用通用题型`)
            // 如果找不到特定学科的题型映射，使用通用题型
            this.questionTypeOptions = []
          }
        } catch (error) {
          console.error('加载题型列表失败:', error)
          this.$message.error('加载题型列表失败，请稍后重试')
          // 出错时使用通用题型
          this.questionTypeOptions = []
        } finally {
          this.questionTypesLoading = false
        }
      },
  
      // 加载系列列表（教辅材料模式，根据科目和系列类型过滤）
      async loadSeriesList() {
        // 只有在教辅材料模式下才需要加载系列列表
        if (!this.globalSettings.series_type || !this.globalSettings.series_type.includes('教辅材料')) {
          return
        }
        
        // 如果科目或系列类型未选择，清空系列列表
        if (!this.globalSettings.subject || !this.globalSettings.material_type) {
          this.seriesList = []
          return
        }
        
        try {
          this.seriesLoading = true
          const params = {
            pageNum: 1,
            pageSize: 1000,
            role: this.userRole,
            subjectName: this.globalSettings.subject, // 传递科目名称
            type: this.globalSettings.material_type   // 传递系列类型（书、试卷、视频）
          }
          const response = await listSeries(params)
          if (response.code === 200) {
            this.seriesList = response.rows || []
            console.log('加载系列列表成功:', {
              subject: this.globalSettings.subject,
              materialType: this.globalSettings.material_type,
              seriesCount: this.seriesList.length
            })
          } else {
            this.$message.error('加载系列列表失败: ' + (response.msg || '未知错误'))
            this.seriesList = []
          }
        } catch (error) {
          console.error('加载系列列表失败:', error)
          this.$message.error('加载系列列表失败: ' + error.message)
          this.seriesList = []
        } finally {
          this.seriesLoading = false
        }
      },
  
      // 初始化可用主题/话题列表
      initAvailableTopics() {
        const allTopics = new Set()
        this.questions.forEach(question => {
          if (question.topic && Array.isArray(question.topic)) {
            question.topic.forEach(topic => {
              if (topic && topic.trim()) {
                allTopics.add(topic.trim())
              }
            })
          }
          // 也检查子题
          if (question.children && Array.isArray(question.children)) {
            question.children.forEach(subQuestion => {
              if (subQuestion.topic && Array.isArray(subQuestion.topic)) {
                subQuestion.topic.forEach(topic => {
                  if (topic && topic.trim()) {
                    allTopics.add(topic.trim())
                  }
                })
              }
            })
          }
        })
        this.availableTopics = Array.from(allTopics)
        // console.log('初始化可用主题/话题列表:', this.availableTopics)
      },
  
      // 初始化可用标签列表
      initAvailableTags() {
        const allTags = new Set()
        this.questions.forEach(question => {
          if (question.tags && Array.isArray(question.tags)) {
            question.tags.forEach(tag => {
              if (tag && tag.trim()) {
                allTags.add(tag.trim())
              }
            })
          }
          // 也检查子题
          if (question.children && Array.isArray(question.children)) {
            question.children.forEach(subQuestion => {
              if (subQuestion.tags && Array.isArray(subQuestion.tags)) {
                subQuestion.tags.forEach(tag => {
                  if (tag && tag.trim()) {
                    allTags.add(tag.trim())
                  }
                })
              }
            })
          }
        })
        this.availableTags = Array.from(allTags)
        console.log('初始化可用标签列表:', this.availableTags)
      },

      // 初始化可用知识点列表
      initAvailableKnowledgePoints() {
        const allKnowledgePoints = new Set()
        this.questions.forEach(question => {
          if (question.knowledge_points && Array.isArray(question.knowledge_points)) {
            question.knowledge_points.forEach(point => {
              if (point && point.trim()) {
                allKnowledgePoints.add(point.trim())
              }
            })
          }
          // 也检查子题
          if (question.children && Array.isArray(question.children)) {
            question.children.forEach(subQuestion => {
              if (subQuestion.knowledge_points && Array.isArray(subQuestion.knowledge_points)) {
                subQuestion.knowledge_points.forEach(point => {
                  if (point && point.trim()) {
                    allKnowledgePoints.add(point.trim())
                  }
                })
              }
            })
          }
        })
        this.availableKnowledgePoints = Array.from(allKnowledgePoints)
        console.log('初始化可用知识点列表:', this.availableKnowledgePoints)
      },

      // 处理题库类型变化（多选）
      handleSeriesTypeChange(selectedTypes) {
        console.log('题库类型变化:', selectedTypes)
        
        // 获取之前选中的类型
        const previousTypes = this.globalSettings.series_type || []
        
        // 找出新增和移除的类型
        const addedTypes = selectedTypes.filter(type => !previousTypes.includes(type))
        const removedTypes = previousTypes.filter(type => !selectedTypes.includes(type))
        
        this.globalSettings.series_type = selectedTypes || []
        
        // 如果移除了某个类型，清空该类型相关的字段
        if (removedTypes.includes('教辅材料')) {
          this.globalSettings.material_type = ''
          this.globalSettings.series = null
          this.globalSettings.series_path = ''
          this.seriesList = []
        }
        if (removedTypes.includes('章节选择')) {
          this.globalSettings.chapter_version = ''
          this.globalSettings.chapter_path = ''
          this.versionList = []
        }
        if (removedTypes.includes('知识点选择')) {
          this.globalSettings.knowledge_name = ''
          this.knowledgeList = []
          this.knowledgeTreeData = []
        }
        
        // 如果所有类型都被移除，清空科目
        if (selectedTypes.length === 0) {
          this.globalSettings.subject = ''
        }
      },

      // 处理系列类型变化（教辅材料用）
      async handleMaterialTypeChange(materialType) {
        console.log('系列类型变化:', materialType)
        this.globalSettings.material_type = materialType
        // 清空系列和系列路径，让用户重新选择
        this.globalSettings.series = null
        this.globalSettings.series_path = ''
        // 如果科目已选择，重新加载系列列表
        if (this.globalSettings.subject) {
          await this.loadSeriesList()
        }
      },

      // 处理全局系列变化
      handleGlobalSeriesChange(seriesId) {
        console.log('全局系列变化:', seriesId)
        this.globalSettings.series = seriesId
        // 清空系列路径，让用户通过选择器来选择
        this.globalSettings.series_path = ''
        
        // 从系列列表中获取对应的系列信息
        const selectedSeries = this.seriesList.find(item => item.id === seriesId)
        if (selectedSeries) {
          console.log('选中的系列信息:', selectedSeries)
          this.$message.info('请点击"系列路径"按钮选择具体的章节路径')
        }
      },

      // 打开系列路径选择器
      openSeriesPathSelector() {
        if (!this.globalSettings.series) {
          this.$message.warning('请先选择系列')
          return
        }
        
        const selectedSeries = this.seriesList.find(item => item.id === this.globalSettings.series)
        if (selectedSeries) {
          this.selectedSeriesData = selectedSeries
          this.seriesPathDialogVisible = true
        } else {
          this.$message.error('未找到选中的系列信息')
        }
      },

      // 处理系列路径选择确认
      handleSeriesPathSelectionConfirm(data) {
        console.log('系列路径选择确认:', data)
        this.globalSettings.series_path = data.seriesPath
        this.$message.success('系列路径已设置')
      },

      // 关闭系列路径选择弹窗
      handleSeriesPathDialogClose() {
        this.seriesPathDialogVisible = false
        this.selectedSeriesData = null
      },
      
      // 加载章节列表
      loadChapterList() {
        if (this.chapterLoading) return
        this.chapterLoading = true
        getChapterMap().then(response => {
          if (response && response.code === 200) {
            const chapterData = response.data || []
            // 将章节树数据转换为下拉选项（扁平化处理）
            this.chapterList = this.flattenChapterTree(chapterData)
          } else {
            this.chapterList = []
          }
          this.chapterLoading = false
        }).catch(error => {
          console.error('获取章节列表失败:', error)
          this.$message.error('获取章节列表失败')
          this.chapterList = []
          this.chapterLoading = false
        })
      },
      
      // 扁平化章节树为下拉选项
      flattenChapterTree(nodes, result = []) {
        nodes.forEach(node => {
          result.push({
            label: node.label,
            value: node.value
          })
          if (node.children && node.children.length > 0) {
            this.flattenChapterTree(node.children, result)
          }
        })
        return result
      },
      
      // 处理章节变化
      handleChapterChange(chapterValue) {
        console.log('章节变化:', chapterValue)
        this.globalSettings.chapter = chapterValue
        this.globalSettings.chapter_path = ''
        // 从章节列表中找到对应的章节，获取学科信息
        const selectedChapter = this.chapterList.find(item => item.value === chapterValue)
        if (selectedChapter) {
          // 这里可以根据需要设置学科，暂时留空，由用户在选择路径时选择
          this.$message.info('请点击"章节路径"按钮选择具体的章节路径')
        }
      },
      
      // 打开章节路径选择器
      async openChapterPathSelector() {
        if (!this.globalSettings.subject) {
          this.$message.warning('请先选择科目')
          return
        }
        if (!this.globalSettings.chapter_version) {
          this.$message.warning('请先选择版本')
          return
        }
        
        // 如果章节树数据为空，先加载
        if (!this.chapterTreeData || this.chapterTreeData.length === 0) {
          await this.loadChapterTreeByVersion()
        }
        
        // 使用全局设置的科目
        this.selectedChapterSubject = this.globalSettings.subject
        this.chapterPathDialogVisible = true
      },
      
      // 处理章节路径选择确认
      handleChapterPathSelectionConfirm(data) {
        console.log('章节路径选择确认:', data)
        this.globalSettings.chapter_path = data.chapterPath
        this.$message.success('章节路径已设置')
      },
      
      // 关闭章节路径选择弹窗
      handleChapterPathDialogClose() {
        this.chapterPathDialogVisible = false
        this.selectedChapterSubject = ''
      },
      
      // 清除章节路径
      clearChapterPath() {
        this.globalSettings.chapter_path = ''
        this.$message.info('已清除章节路径')
      },
      
      // 加载知识点列表
      loadKnowledgeList() {
        if (this.knowledgeLoading) return
        this.knowledgeLoading = true
        getChapterMap().then(response => {
          if (response && response.code === 200) {
            const knowledgeData = response.data || []
            // 知识点通常是章节树的叶子节点，需要提取所有叶子节点
            this.knowledgeList = this.extractKnowledgeNodes(knowledgeData)
          } else {
            this.knowledgeList = []
          }
          this.knowledgeLoading = false
        }).catch(error => {
          console.error('获取知识点列表失败:', error)
          this.$message.error('获取知识点列表失败')
          this.knowledgeList = []
          this.knowledgeLoading = false
        })
      },
      
      // 提取知识点节点（叶子节点）
      extractKnowledgeNodes(nodes, result = []) {
        nodes.forEach(node => {
          if (!node.children || node.children.length === 0) {
            // 叶子节点，作为知识点
            result.push({
              label: node.label,
              value: node.value
            })
          } else {
            // 非叶子节点，递归处理子节点
            this.extractKnowledgeNodes(node.children, result)
          }
        })
        return result
      },
      
      // 处理知识点变化
      handleKnowledgeChange(knowledgeValue) {
        console.log('知识点变化:', knowledgeValue)
        this.globalSettings.knowledge = knowledgeValue
        this.globalSettings.knowledge_name = ''
        // 从知识点列表中找到对应的知识点
        const selectedKnowledge = this.knowledgeList.find(item => item.value === knowledgeValue)
        if (selectedKnowledge) {
          this.$message.info('请点击"知识点路径"按钮选择具体的知识点路径')
        }
      },
      
      
      // 加载知识点列表（直接使用 knowledge_flat）
      async loadKnowledgeListByVersion() {
        if (!this.globalSettings.subject) {
          this.knowledgeList = []
          return
        }
        
        this.knowledgeLoading = true
        try {
          // 构建请求参数：传递学科名称 {subjects: ["高中英语"]}
          const requestData = {
            subjects: [this.globalSettings.subject]
          }
          
          const response = await getKnowledgeLeafNodes(requestData)
          
          // 直接使用 res.knowledge_flat，没有 data 包装
          let knowledgeFlat = null
          if (response && response.knowledge_flat) {
            knowledgeFlat = response.knowledge_flat
          }
          
          const subject = this.globalSettings.subject
          
          // knowledge_flat 是一个对象，键是科目名，值是知识点数组
          if (knowledgeFlat && knowledgeFlat[subject] && Array.isArray(knowledgeFlat[subject])) {
            // 获取该学科的知识点数组
            const subjectKnowledgeList = knowledgeFlat[subject]
            
            // 将知识点数组转换为下拉框格式
            this.knowledgeList = subjectKnowledgeList.map(item => ({
              name: item.name || `知识点${item.id}`,
              code: item.code,
              path: item.path || '',
              id: item.id,
              is_leaf: item.is_leaf,
              subject: item.subject || subject
            }))
            
            console.log('知识点列表已加载:', {
              subject,
              knowledgeCount: this.knowledgeList.length
            })
          } else {
            console.warn('知识点数据格式不正确或该学科没有知识点:', {
              subject,
              response,
              knowledgeFlat
            })
            this.knowledgeList = []
          }
        } catch (error) {
          console.error('加载知识点列表失败:', error)
          this.$message.error('获取知识点列表失败：' + (error.message || '网络错误'))
          this.knowledgeList = []
        } finally {
          this.knowledgeLoading = false
        }
      },
      
      // 从知识点树中提取所有标签（用于下拉框，参考鹿鸣题库）
      extractLabelsFromKnowledgeTree(knowledgeNodes, parentPath = '') {
        if (!knowledgeNodes || !Array.isArray(knowledgeNodes)) {
          return []
        }
        
        const labels = []
        
        knowledgeNodes.forEach(node => {
          const currentPath = node.path || parentPath
          const label = node.name || `知识点${node.id}`
          
          // 添加当前节点到标签列表
          labels.push({
            label: label,
            value: node.path || node.code || `knowledge_${node.id}`,
            path: node.path,
            code: node.code,
            isLeaf: node.is_leaf === 1
          })
          
          // 递归处理子节点
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            const childLabels = this.extractLabelsFromKnowledgeTree(node.children, currentPath)
            labels.push(...childLabels)
          }
        })
        
        return labels
      },
      
      // 处理知识点名称变化（下拉框选择后）
      async handleKnowledgeNameChange(knowledgeName) {
        if (!knowledgeName) {
          this.globalSettings.knowledge_name = ''
          return
        }
        
        // 直接使用选择的知识点名称
        console.log('知识点选择:', knowledgeName)
        this.globalSettings.knowledge_name = knowledgeName
      },
      
      // 清除知识点
      clearKnowledgePath() {
        this.globalSettings.knowledge_name = ''
        this.$message.info('已清除知识点')
      },
      
      // 打开知识点路径选择器
      async openKnowledgePathSelector() {
        if (!this.globalSettings.subject) {
          this.$message.warning('请先选择科目')
          return
        }
        
        // 如果知识点树数据为空，先加载
        if (!this.knowledgeTreeData || this.knowledgeTreeData.length === 0) {
          await this.loadKnowledgeTreeData()
        }
        
        // 使用全局设置的科目
        this.selectedKnowledgeSubject = this.globalSettings.subject
        this.knowledgePathDialogVisible = true
      },
      
      // 加载知识点树数据（参考鹿鸣题库的处理方式）
      async loadKnowledgeTreeData() {
        if (!this.globalSettings.subject) {
          this.knowledgeTreeData = []
          return
        }
        
        this.knowledgeLoading = true
        try {
          // 构建请求参数：传递学科名称 {subjects: ["高中数学"]}
          const requestData = {
            subjects: [this.globalSettings.subject]
          }
          
          const response = await getKnowledgeLeafNodes(requestData)
          
          // 处理响应数据（参考鹿鸣题库的处理方式）
          let knowledgeTrees = null
          
          // 提取 knowledge_trees
          if (response && response.knowledge_trees) {
            knowledgeTrees = response.knowledge_trees
          } else if (response && response.data && response.data.knowledge_trees) {
            knowledgeTrees = response.data.knowledge_trees
          } else if (response && response.code === 200 && response.data && response.data.knowledge_trees) {
            knowledgeTrees = response.data.knowledge_trees
          }
          
          const subject = this.globalSettings.subject
          
          if (knowledgeTrees && knowledgeTrees[subject] && Array.isArray(knowledgeTrees[subject])) {
            // 获取该学科的知识点树
            const subjectKnowledgeTree = knowledgeTrees[subject]
            
            // 跳过科目节点，直接使用其子节点
            // 通常第一个节点是科目节点（name 等于 subject），需要跳过
            let actualKnowledgeTree = subjectKnowledgeTree
            if (subjectKnowledgeTree.length > 0 && subjectKnowledgeTree[0].name === subject) {
              // 如果第一个节点是科目节点，使用其 children
              actualKnowledgeTree = subjectKnowledgeTree[0].children || []
            }
            
            // 转换为组件需要的格式（树形结构）
            this.knowledgeTreeData = this.convertKnowledgeTreeToOptions(actualKnowledgeTree)
            
            console.log('知识点树已加载:', {
              subject,
              total: response.total || 0,
              treeNodes: this.knowledgeTreeData.length
            })
          } else {
            console.warn('知识点数据格式不正确或该学科没有知识点:', {
              subject,
              response
            })
            this.knowledgeTreeData = []
          }
        } catch (error) {
          console.error('加载知识点树失败:', error)
          this.$message.error('获取知识点树失败：' + (error.message || '网络错误'))
          this.knowledgeTreeData = []
        } finally {
          this.knowledgeLoading = false
        }
      },
      
      // 将知识点树转换为组件需要的格式
      convertKnowledgeTreeToOptions(knowledgeNodes) {
        if (!knowledgeNodes || !Array.isArray(knowledgeNodes)) {
          return []
        }
        
        return knowledgeNodes.map(node => {
          const treeNode = {
            label: node.name || `知识点${node.id}`,
            value: node.path || node.code || `knowledge_${node.id}`,
            code: node.code,
            path: node.path,
            isLeaf: node.is_leaf === 1,
            children: []
          }
          
          // 递归处理子节点
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            treeNode.children = this.convertKnowledgeTreeToOptions(node.children)
          }
          
          return treeNode
        })
      },
      
      // 处理知识点路径选择确认（已废弃，现在使用下拉框直接选择）
      handleKnowledgePathSelectionConfirm(data) {
        console.log('知识点路径选择确认:', data)
        
        // ChapterSelectorDialog 返回的数据格式：{chapterPath, chapterData}
        // 对于知识点，chapterData 就是知识点数据
        const knowledge = data.chapterData || data
        if (!knowledge) {
          this.$message.warning('未找到知识点数据')
          return
        }
        
        // 使用知识点的名称（label 或 name）
        const knowledgeName = knowledge.label || knowledge.name || ''
        if (!knowledgeName) {
          this.$message.warning('未找到知识点名称')
          return
        }
        
        this.globalSettings.knowledge_name = knowledgeName
        this.$message.success('知识点已设置')
      },
      
      // 关闭知识点路径选择弹窗
      handleKnowledgePathDialogClose() {
        this.knowledgePathDialogVisible = false
        this.selectedKnowledgeSubject = ''
      },
      
      // 选择题目
      selectQuestion(index) {
        console.log('选择主题目:', index)
        this.currentQuestionIndex = index.toString()
      },

      // 选择子题
      selectSubQuestion(mainIndex, subIndex) {
        console.log('选择子题:', mainIndex, subIndex)
        this.currentQuestionIndex = `${mainIndex}-${subIndex}`
      },

      // 新增题目
      addNewQuestion() {
        console.log('新增题目')
        // 从已有题目中获取学科信息
        const existingQuestion = this.getExistingQuestionInfo()
        
        // 获取科目名称和对应的科目代码
        const subjectName = existingQuestion.subject_name || '未指定科目'
        const subjectCode = this.getSubjectCode(subjectName)
        const questionType = existingQuestion.qtype || '选择题'
        
        // 根据学科和题型获取cate值
        let cateValue = 0
        if (subjectName && subjectName !== '未指定科目') {
          cateValue = getQuestionTypeCode(subjectName, questionType)
          if (cateValue === 0) {
            console.warn(`未找到学科 ${subjectName} 的题型 ${questionType} 对应的cate值`)
          }
        }
        
        const newQuestion = {
          sid: this.generateRandomSid(),
          subject_name: subjectName,
          question: '',
          qtype: questionType,
          score: 0,
          label: '',
          answers: [],
          displayanswer: '',
          degree: existingQuestion.degree || 0.5,
          topic: existingQuestion.topic || [],
          tags: existingQuestion.tags || [],
          knowledge_points: existingQuestion.knowledge_points || [],
          options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
          Analyse: '',
          Method: '',
          Discuss: '',
          children: [],
          hasSubQuestions: false,
          mainQuestionIndex: this.questions.length,
          // 从已有题目获取学科相关信息
          level: existingQuestion.level || 'middle',
          subject_code: subjectCode, // 使用映射字典获取的科目代码
          cate: cateValue, // 使用题型映射获取的cate值
          catename: questionType, // 确保catename与qtype同步
          points: existingQuestion.points || [],
          knowledge_name: existingQuestion.knowledge_name || '',
          path: existingQuestion.path || '',
          source: '麓鸣上传',
          series: this.globalSettings.series || 1,
          series_path: this.globalSettings.series_path || '',
          series_type: Array.isArray(this.globalSettings.series_type) 
            ? (this.globalSettings.series_type.length > 0 ? this.globalSettings.series_type[0] : '教辅材料')
            : (this.globalSettings.series_type || '教辅材料'),
          // 统一使用 path 字段传递路径
          path: this.getPathForUpload()
        }
        
        this.questions.push(newQuestion)
        this.currentQuestionIndex = (this.questions.length - 1).toString()
        // 初始化可用主题列表
        this.initAvailableData()
        this.$message.success('新增题目成功')
        console.log('新增题目:', newQuestion)
      },

      // 新增子题
      addSubQuestion() {
        if (!this.currentQuestion || this.currentQuestionIndex.includes('-')) {
          this.$message.warning('请先选择主题目')
          return
        }
        
        const mainIndex = parseInt(this.currentQuestionIndex)
        const mainQuestion = this.questions[mainIndex]
        
        // 确保children数组存在
        if (!mainQuestion.children) {
          this.$set(mainQuestion, 'children', [])
        }
        
        // 从已有题目中获取学科信息
        const existingQuestion = this.getExistingQuestionInfo()
        
        // 获取科目名称和对应的科目代码
        const subjectName = existingQuestion.subject_name || mainQuestion.subject_name || '未指定科目'
        const subjectCode = this.getSubjectCode(subjectName)
        const questionType = existingQuestion.qtype || mainQuestion.qtype || '选择题'
        
        // 根据学科和题型获取cate值
        let cateValue = 0
        if (subjectName && subjectName !== '未指定科目') {
          cateValue = getQuestionTypeCode(subjectName, questionType)
          if (cateValue === 0) {
            console.warn(`未找到学科 ${subjectName} 的题型 ${questionType} 对应的cate值`)
          }
        }
        
        const newSubQuestion = {
          // 子题不需要sid
          subject_name: subjectName,
          content: '',
          question: '',
          qtype: questionType,
          options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
          answers: [],
          subQuestionIndex: mainQuestion.children.length,
          Score: 0, // 子题默认分数
          score: 0, // 子题默认分数（小写，用于模板绑定）
          Analyse: '',
          Method: '',
          Discuss: '',
          knowledge_points: [],
          source: '麓鸣上传',
          series: mainQuestion.series || this.globalSettings.series || 1,
          series_path: mainQuestion.series_path || this.globalSettings.series_path || '',
          // 统一使用 path 字段传递路径
          path: mainQuestion.path || this.getPathForUpload(),
          tags: [],
          // 从已有题目获取学科相关信息
          level: existingQuestion.level || mainQuestion.level || 'middle',
          subject_code: subjectCode, // 使用映射字典获取的科目代码
          cate: cateValue, // 使用题型映射获取的cate值
          catename: questionType, // 确保catename与qtype同步
          label: '',
          points: existingQuestion.points || mainQuestion.points || [],
          knowledge_name: existingQuestion.knowledge_name || mainQuestion.knowledge_name || '',
          path: existingQuestion.path || mainQuestion.path || '',
          displayanswer: 'A',
          degree: existingQuestion.degree || mainQuestion.degree || 0.5,
          topic: existingQuestion.topic || mainQuestion.topic || []
        }
        
        mainQuestion.children.push(newSubQuestion)
        mainQuestion.hasSubQuestions = true
        
        // 选中新创建的子题
        this.currentQuestionIndex = `${mainIndex}-${mainQuestion.children.length - 1}`
        this.$message.success('新增子题成功')
        console.log('新增子题:', newSubQuestion)
        
        // 强制更新视图以确保实时刷新
        this.$forceUpdate()
      },

      // 插入子题
      insertSubQuestion(mainIndex, subIndex) {
        console.log('插入子题:', mainIndex, subIndex)
        const mainQuestion = this.questions[mainIndex]
        
        if (!mainQuestion.children) {
          this.$set(mainQuestion, 'children', [])
        }
        
        const newSubQuestion = {
          content: '',
          qtype: '',
          score: 0,
          answers: [],
          displayanswer: '',
          subject_name: mainQuestion.subject_name || '',
          subQuestionIndex: subIndex
        }
        
        mainQuestion.children.splice(subIndex, 0, newSubQuestion)
        mainQuestion.hasSubQuestions = true
        
        // 更新子题索引
        this.updateSubQuestionIndexes(mainIndex)
        
        // 选择新插入的子题
        this.currentQuestionIndex = `${mainIndex}-${subIndex}`
        this.$message.success('插入子题成功')
      },

      // 删除题目
      deleteQuestion(index) {
        this.$confirm('确定要删除这道题目吗？删除后无法恢复。', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.questions.splice(index, 1)
          
          // 更新题目索引
          this.questions.forEach((question, idx) => {
            question.mainQuestionIndex = idx
          })
          
          // 重置当前选择的题目
          if (this.questions.length === 0) {
            this.currentQuestionIndex = '0'
          } else if (parseInt(this.currentQuestionIndex) >= this.questions.length) {
            this.currentQuestionIndex = (this.questions.length - 1).toString()
          }
          
          this.$message.success('题目删除成功')
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },

      // 删除子题
      deleteSubQuestion(mainIndex, subIndex) {
        this.$confirm('确定要删除这道子题吗？删除后无法恢复。', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion.children) {
            mainQuestion.children.splice(subIndex, 1)
            
            // 更新子题索引
            this.updateSubQuestionIndexes(mainIndex)
            
            // 如果删除了所有子题，更新hasSubQuestions
            if (mainQuestion.children.length === 0) {
              mainQuestion.hasSubQuestions = false
              // 如果当前选择的是子题，切换到主题目
              if (this.currentQuestionIndex.includes('-')) {
                this.currentQuestionIndex = mainIndex.toString()
              }
            } else {
              // 如果当前选择的是被删除的子题，切换到第一个子题
              if (this.currentQuestionIndex === `${mainIndex}-${subIndex}`) {
                this.currentQuestionIndex = `${mainIndex}-0`
              }
            }
          }
          
          this.$message.success('子题删除成功')
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },

      // 更新子题索引
      updateSubQuestionIndexes(mainIndex) {
        const mainQuestion = this.questions[mainIndex]
        if (mainQuestion.children) {
          mainQuestion.children.forEach((subQuestion, index) => {
            subQuestion.subQuestionIndex = index
          })
        }
      },

      // 子题拖拽开始
      onSubQuestionDragStart(evt) {
        console.log('子题拖拽开始:', evt.oldIndex)
        this.draggingSubQuestion = true
      },

      // 子题拖拽结束
      onSubQuestionDragEnd(mainIndex) {
        console.log('子题拖拽结束')
        this.draggingSubQuestion = false
        
        // 更新子题索引
        this.updateSubQuestionIndexes(mainIndex)
        
        // 更新当前选中的子题索引
        if (this.currentQuestionIndex.includes('-')) {
          const [mainIdx, subIdx] = this.currentQuestionIndex.split('-').map(Number)
          if (mainIdx === mainIndex) {
            // 如果当前选中的是正在拖拽的主题目的子题，需要重新计算索引
            // 这里可以根据需要实现更复杂的索引更新逻辑
          }
        }
        
        this.$message.success('子题顺序已更新')
      },

      // 处理题目学科变化
      handleQuestionSubjectChange(subjectName) {
        console.log('题目学科变化:', subjectName)
        if (this.currentQuestion) {
          // 获取对应的科目代码
          const subjectCode = this.getSubjectCode(subjectName)
          
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
              const subQuestion = mainQuestion.children[subIndex]
              subQuestion.subject_name = subjectName
              subQuestion.subject_code = subjectCode
              console.log('子题学科已更新:', subjectName, '科目代码:', subjectCode)
            }
          } else {
            // 主题目：保存到原始数据结构中
            const index = parseInt(this.currentQuestionIndex)
            const mainQuestion = this.questions[index]
            if (mainQuestion) {
              mainQuestion.subject_name = subjectName
              mainQuestion.subject_code = subjectCode
              console.log('主题学科已更新:', subjectName, '科目代码:', subjectCode)
            }
          }
          
          // 学科变化时重新加载题型选项
          this.loadQuestionTypes(subjectName)
        }
      },

      // 处理题型变化
      handleQuestionTypeChange(value) {
        console.log('题型变化:', value)
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
              const subQuestion = mainQuestion.children[subIndex]
              subQuestion.qtype = value
              subQuestion.catename = value
              
              // 根据学科和题型更新cate字段
              const subjectName = subQuestion.subject_name
              if (subjectName && subjectName !== '未指定科目') {
                const cateValue = getQuestionTypeCode(subjectName, value)
                if (cateValue > 0) {
                  subQuestion.cate = cateValue
                  console.log(`子题题型更新 - 学科: ${subjectName}, 题型: ${value}, cate: ${cateValue}`)
                } else {
                  console.warn(`未找到学科 ${subjectName} 的题型 ${value} 对应的cate值`)
                  subQuestion.cate = 0 // 默认值
                }
              } else {
                console.warn(`子题学科未指定或无效: ${subjectName}`)
                subQuestion.cate = 0 // 默认值
              }
              
              console.log('子题题型已更新:', value)
            }
          } else {
            // 主题目：保存到原始数据结构中
            const index = parseInt(this.currentQuestionIndex)
            const mainQuestion = this.questions[index]
            if (mainQuestion) {
              mainQuestion.qtype = value
              mainQuestion.catename = value
              
              // 根据学科和题型更新cate字段
              const subjectName = mainQuestion.subject_name
              if (subjectName && subjectName !== '未指定科目') {
                const cateValue = getQuestionTypeCode(subjectName, value)
                if (cateValue > 0) {
                  mainQuestion.cate = cateValue
                  console.log(`主题题型更新 - 学科: ${subjectName}, 题型: ${value}, cate: ${cateValue}`)
                } else {
                  console.warn(`未找到学科 ${subjectName} 的题型 ${value} 对应的cate值`)
                  mainQuestion.cate = 0 // 默认值
                }
              } else {
                console.warn(`主题学科未指定或无效: ${subjectName}`)
                mainQuestion.cate = 0 // 默认值
              }
              
              console.log('主题题型已更新:', value)
            }
          }
        }
      },

      // 处理分数变化
      handleScoreChange(value) {
        console.log('分数变化:', value)
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
              const subQuestion = mainQuestion.children[subIndex]
              subQuestion.score = value
              subQuestion.Score = value
              console.log('子题分数已更新:', value)
            }
          } else {
            // 主题目：保存到原始数据结构中
            const index = parseInt(this.currentQuestionIndex)
            const mainQuestion = this.questions[index]
            if (mainQuestion) {
              mainQuestion.score = value
              mainQuestion.Score = value
              console.log('主题分数已更新:', value)
            }
          }
        }
      },

      // 处理标签变化
      handleLabelChange(value) {
        console.log('标签变化:', value)
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
              mainQuestion.children[subIndex].label = value
              console.log('子题标签已更新:', value)
            }
          } else {
            // 主题目：保存到原始数据结构中
            const index = parseInt(this.currentQuestionIndex)
            if (this.questions[index]) {
              this.questions[index].label = value
              console.log('主题标签已更新:', value)
            }
          }
        }
      },

      // 处理标签实时输入变化
      handleLabelInput(value) {
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
              mainQuestion.children[subIndex].label = value
            }
          } else {
            // 主题目：保存到原始数据结构中
            const index = parseInt(this.currentQuestionIndex)
            if (this.questions[index]) {
              this.questions[index].label = value
            }
          }
        }
      },

      // 处理主题/话题变化
      handleTopicChange(selectedTopics) {
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion.children && mainQuestion.children[subIndex]) {
              mainQuestion.children[subIndex].topic = selectedTopics
            }
          } else {
            // 主题目：直接保存
            const index = parseInt(this.currentQuestionIndex)
            if (this.questions[index]) {
              this.questions[index].topic = selectedTopics
            }
          }
          console.log('主题/话题已更新:', selectedTopics)
        }
      },

      // 处理难度系数变化
      handleDegreeChange(degree) {
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion.children && mainQuestion.children[subIndex]) {
              this.$set(mainQuestion.children[subIndex], 'degree', degree)
            }
          } else {
            // 主题目：直接保存
            const index = parseInt(this.currentQuestionIndex)
            if (this.questions[index]) {
              this.$set(this.questions[index], 'degree', degree)
            }
          }
          console.log('难度系数已更新:', degree)
        }
      },

      // 处理知识点变化
      handleKnowledgePointsChange(selectedPoints) {
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
              mainQuestion.children[subIndex].knowledge_points = selectedPoints
            }
          } else {
            // 主题目：保存到原始数据结构中
            const index = parseInt(this.currentQuestionIndex)
            if (this.questions[index]) {
              this.questions[index].knowledge_points = selectedPoints
            }
          }
          console.log('知识点已更新:', selectedPoints)
        }
      },

      // 处理知识点下拉框焦点事件
      async handleKnowledgePointsFocus() {
        console.log('知识点下拉框获得焦点')
        
        // 获取当前题目的学科信息
        let subjectName = null
        if (this.currentQuestion && this.currentQuestion.subject_name) {
          subjectName = this.currentQuestion.subject_name
        }
        
        // 检查是否是英语或语文科目
        if (subjectName && (subjectName.includes('英语') || subjectName.includes('语文'))) {
          console.log('检测到英语或语文科目，准备获取知识点:', subjectName)
          await this.loadKnowledgePointsForSubject(subjectName)
        } else {
          console.log('非英语或语文科目，使用默认知识点列表')
        }
      },

      // 加载指定学科的知识点
      async loadKnowledgePointsForSubject(subjectName) {
        try {
          this.knowledgePointsLoading = true
          console.log('开始加载知识点，学科:', subjectName)
          
          const response = await getKnowledgePoints(subjectName)
          console.log('知识点API响应:', response)
          
          if (response.code === 0 && response.data && Array.isArray(response.data)) {
            // 将API返回的数据转换为知识点名称列表
            const knowledgePoints = response.data.map(item => {
              // 从path中提取知识点名称，取最后一个路径部分
              const pathParts = item.path.split('/')
              return pathParts[pathParts.length - 1] || item.path
            })
            
            // 合并到现有知识点列表中，去重
            const existingPoints = new Set(this.availableKnowledgePoints)
            knowledgePoints.forEach(point => {
              if (point && point.trim()) {
                existingPoints.add(point.trim())
              }
            })
            
            this.availableKnowledgePoints = Array.from(existingPoints)
            console.log('知识点加载成功，总数:', this.availableKnowledgePoints.length)
          } else {
            console.warn('知识点API返回数据格式不正确:', response)
            this.$message.warning('获取知识点失败，请稍后重试')
          }
        } catch (error) {
          console.error('加载知识点失败:', error)
          this.$message.error('获取知识点失败：' + (error.message || '网络错误'))
        } finally {
          this.knowledgePointsLoading = false
        }
      },

      // 处理标签变化
      handleTagsChange(value) {
        console.log('标签变化:', value)
        if (this.currentQuestion) {
          // 检查是否是子题
          if (this.currentQuestionIndex.includes('-')) {
            // 子题：保存到原始数据结构中
            const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
            const mainQuestion = this.questions[mainIndex]
            if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
              mainQuestion.children[subIndex].tags = value
            }
          } else {
            // 主题目：保存到原始数据结构中
            const index = parseInt(this.currentQuestionIndex)
            if (this.questions[index]) {
              this.questions[index].tags = value
            }
          }
        }
      },

      // 格式化难度系数提示
      formatDegreeTooltip(value) {
        if (value <= 0.3) {
          return `困难 (${value})`
        } else if (value <= 0.7) {
          return `中等 (${value})`
        } else {
          return `简单 (${value})`
        }
      },

      // 打开编辑弹窗
      openEditDialog(type) {
        console.log('打开编辑弹窗:', type)
        
        let title = ''
        let content = ''
        let placeholder = ''
        
        switch (type) {
          case 'question':
            title = '编辑题目内容'
            content = this.currentQuestion.content || this.currentQuestion.question || ''
            placeholder = '请输入题目内容...'
            break
          case 'options':
            title = '编辑选项'
            content = Array.isArray(this.currentQuestion.options) ? this.currentQuestion.options.join('\n') : ''
            placeholder = '请输入选项，每行一个选项...'
            break
          case 'answer':
            title = '编辑答案'
            // 使用getAnswerContent方法获取拼接后的子题答案
            content = this.getAnswerContent()
            // 如果显示的是"答案为空"，则清空内容
            if (content === '答案为空') {
              content = ''
            }
            placeholder = '请输入答案，每行一个子题答案，格式如：\n1. A\n2. B, C\n3. D'
            break
          case 'analysis':
            title = '编辑解析'
            content = this.currentQuestion.Analyse || ''
            placeholder = '请输入解析内容...'
            break
          case 'method':
            title = '编辑方法'
            content = this.currentQuestion.Method || ''
            placeholder = '请输入方法内容...'
            break
          case 'discuss':
            title = '编辑讨论'
            content = this.currentQuestion.Discuss || ''
            placeholder = '请输入讨论内容...'
            break
          default:
            this.$message.error('未知的编辑类型')
            return
        }
        
        this.editDialogType = type
        this.editDialogTitle = title
        this.editingContent = content
        this.editPlaceholder = placeholder
        this.editDialogVisible = true
      },

      // 处理内容编辑确认
      handleContentEditConfirm(data) {
        console.log('内容编辑确认:', data)
        
        if (!this.currentQuestion) {
          this.$message.error('没有选中的题目')
          return
        }
        
        const content = data.content
        
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            const subQuestion = mainQuestion.children[subIndex]
            
            switch (this.editDialogType) {
              case 'question':
                subQuestion.content = content
                subQuestion.question = content
                break
              case 'options':
                // 使用Vue的响应式更新方法
                this.$set(subQuestion, 'options', content.split('\n').filter(opt => opt.trim()))
                break
              case 'answer':
                subQuestion.displayanswer = content
                // 如果答案包含逗号分隔的多个答案，则分割成数组
                if (content.includes(',')) {
                  subQuestion.answers = content.split(',').map(ans => ans.trim()).filter(ans => ans)
                } else {
                  subQuestion.answers = [content]
                }
                break
              default:
                this.$message.warning('子题不支持编辑此类型内容')
                return
            }
          }
        } else {
          // 主题目：保存到原始数据结构中
          const index = parseInt(this.currentQuestionIndex)
          const mainQuestion = this.questions[index]
          if (mainQuestion) {
            switch (this.editDialogType) {
              case 'question':
                mainQuestion.question = content
                break
              case 'options':
                // 使用Vue的响应式更新方法
                this.$set(mainQuestion, 'options', content.split('\n').filter(opt => opt.trim()))
                break
              case 'answer':
                mainQuestion.displayanswer = content
                // 如果答案包含逗号分隔的多个答案，则分割成数组
                if (content.includes(',')) {
                  mainQuestion.answers = content.split(',').map(ans => ans.trim()).filter(ans => ans)
                } else {
                  mainQuestion.answers = [content]
                }
                
                // 如果主题目有子题，将答案内容解析并同步到子题
                if (mainQuestion.children && mainQuestion.children.length > 0) {
                  this.syncMainAnswerToSubQuestions(mainQuestion, content)
                }
                break
              case 'analysis':
                mainQuestion.Analyse = content
                break
              case 'method':
                mainQuestion.Method = content
                break
              case 'discuss':
                mainQuestion.Discuss = content
                break
            }
          }
        }
        
        this.$message.success('内容保存成功')
        
        // 强制更新视图以确保实时刷新
        this.$forceUpdate()
      },

      // 处理内容编辑关闭
      handleContentEditClose() {
        this.editDialogVisible = false
        this.editDialogType = ''
        this.editDialogTitle = ''
        this.editingContent = ''
        this.editPlaceholder = ''
      },

      // 重置题目内容
      resetQuestionContent() {
        this.$confirm('确定要重置当前题目的内容吗？', '确认重置', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 这里可以实现重置逻辑
          this.$message.success('题目内容已重置')
        }).catch(() => {
          this.$message.info('已取消重置')
        })
      },

      // 使用marked渲染Markdown
      renderMarkdown(markdown) {
        if (!markdown) return ''
        
        // 如果是数组，转换为字符串
        let markdownText = markdown
        if (Array.isArray(markdown)) {
          markdownText = markdown.join('\n')
        } else if (typeof markdown !== 'string') {
          markdownText = String(markdown)
        }
        
        const options = { 
          breaks: true, 
          gfm: true, 
          headerIds: false, 
          mangle: false, 
          tables: true 
        }
        let html = marked.parse(markdownText, options)
        html = html.replace(/<table>/g, '<table border="1" style="border-collapse: collapse;">')
        
        // 渲染数学公式
        html = this.renderMathFormulas(html)
        
        return html
      },

      // 渲染数学公式
      renderMathFormulas(html) {
        if (!html) return html
        
        try {
          // 预处理：去除化学公式中的 \ce 前缀
          html = html.replace(/\\ce\{([^}]+)\}/g, (match, formula) => {
            return formula // 直接返回化学公式内容，去除 \ce 前缀
          })
          
          // 渲染LaTeX行内公式 \(...\)
          html = html.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: false,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX LaTeX inline formula error:', e, 'Formula:', formula)
              return `<span class="math-error" title="公式渲染错误: ${e.message}">\\(${formula}\\)</span>`
            }
          })
          
          // 渲染LaTeX块级公式 \[...\]
          html = html.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX LaTeX display formula error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\[${formula}\\]</div>`
            }
          })
          
          // 渲染行内公式 $...$
          html = html.replace(/\$([^$]+)\$/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: false,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX inline formula error:', e, 'Formula:', formula)
              return `<span class="math-error" title="公式渲染错误: ${e.message}">$${formula}$</span>`
            }
          })
          
          // 渲染块级公式 $$...$$
          html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
            try {
              return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX display formula error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">$$${formula}$$</div>`
            }
          })
          
          // 渲染LaTeX环境 \begin{equation}...\end{equation}
          html = html.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (match, formula) => {
            try {
              return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX equation error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{equation}${formula}\\end{equation}</div>`
            }
          })
          
          // 渲染LaTeX环境 \begin{align}...\end{align}
          html = html.replace(/\\begin\{align\}([\s\S]*?)\\end\{align\}/g, (match, formula) => {
            try {
              return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX align error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{align}${formula}\\end{align}</div>`
            }
          })
          
          // 渲染LaTeX环境 \begin{pmatrix}...\end{pmatrix}
          html = html.replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g, (match, formula) => {
            try {
              return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX pmatrix error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{pmatrix}${formula}\\end{pmatrix}</div>`
            }
          })
          
          // 渲染LaTeX环境 \begin{bmatrix}...\end{bmatrix}
          html = html.replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g, (match, formula) => {
            try {
              return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX bmatrix error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{bmatrix}${formula}\\end{bmatrix}</div>`
            }
          })
          
          // 渲染LaTeX环境 \begin{vmatrix}...\end{vmatrix}
          html = html.replace(/\\begin\{vmatrix\}([\s\S]*?)\\end\{vmatrix\}/g, (match, formula) => {
            try {
              return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX vmatrix error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{vmatrix}${formula}\\end{vmatrix}</div>`
            }
          })
          
          // 渲染LaTeX环境 \begin{Vmatrix}...\end{Vmatrix}
          html = html.replace(/\\begin\{Vmatrix\}([\s\S]*?)\\end\{Vmatrix\}/g, (match, formula) => {
            try {
              return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX Vmatrix error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{Vmatrix}${formula}\\end{Vmatrix}</div>`
            }
          })
          
          // 渲染LaTeX环境 \begin{cases}...\end{cases}
          html = html.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (match, formula) => {
            try {
              return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: true,
                strict: false
              })
            } catch (e) {
              console.warn('KaTeX cases error:', e, 'Formula:', formula)
              return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{cases}${formula}\\end{cases}</div>`
            }
          })
          
        } catch (e) {
          console.error('Math formula rendering error:', e)
        }
        
        return html
      },

      // 确保字符串类型
      ensureString(value) {
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        // 如果值为 null 或 undefined，返回一个特殊标记
        if (value === null || value === undefined) {
          return '__NULL_VALUE__'
        }
        return String(value)
      },

      // 获取答案内容，正确处理 null 值
      getAnswerContent() {
        if (!this.currentQuestion) {
          return '答案为空'
        }
        
        // 如果是主题目且有子题，将子题答案拼接给主题目
        if (this.currentQuestion.isMainQuestion && this.currentQuestion.children && this.currentQuestion.children.length > 0) {
          const subQuestionAnswers = []
          
          this.currentQuestion.children.forEach((subQuestion, index) => {
            let subAnswer = ''
            if (subQuestion.displayanswer && subQuestion.displayanswer.trim()) {
              subAnswer = subQuestion.displayanswer.trim()
            } else if (subQuestion.answers && subQuestion.answers.length > 0) {
              subAnswer = subQuestion.answers.join(', ')
            } else if (subQuestion.answer && subQuestion.answer.trim()) {
              subAnswer = subQuestion.answer.trim()
            }
            
            if (subAnswer) {
              subQuestionAnswers.push(`${index + 1}. ${subAnswer}`)
            }
          })
          
          // 如果有子题答案，返回拼接后的答案
          if (subQuestionAnswers.length > 0) {
            return subQuestionAnswers.join('\n')
          }
        }
        
        // 优先使用 displayanswer，如果没有则使用 answers，最后检查 answer
        let answerContent = ''
        if (this.currentQuestion.displayanswer && this.currentQuestion.displayanswer.trim()) {
          answerContent = this.currentQuestion.displayanswer.trim()
        } else if (this.currentQuestion.answers && this.currentQuestion.answers.length > 0) {
          answerContent = this.currentQuestion.answers.join(', ')
        } else if (this.currentQuestion.answer && this.currentQuestion.answer.trim()) {
          answerContent = this.currentQuestion.answer.trim()
        }
        
        return answerContent || '答案为空'
      },

      // 检查label是否为图片解析失败
      isImageParseFailed(label) {
        if (!label || typeof label !== 'string') {
          return false
        }
        
        const failedKeywords = [
          '图片解析失败',
          '图片解析错误',
          '图片处理失败',
          '图片处理错误',
          'image parse failed',
          'image processing failed',
          '图片无法解析',
          '图片识别失败'
        ]
        
        return failedKeywords.some(keyword => 
          label.toLowerCase().includes(keyword.toLowerCase())
        )
      },

      // 验证所有题目
      validateAllQuestions() {
        try {
          // 先验证题库类型
          if (!this.globalSettings.series_type || this.globalSettings.series_type.length === 0) {
            this.$message.error('请选择题库类型')
            return false
          }
          
          // 根据不同的题库类型验证对应的路径字段
          // 验证教辅材料相关字段
          if (this.globalSettings.series_type && this.globalSettings.series_type.includes('教辅材料')) {
            if (!this.globalSettings.series) {
              this.$message.error('请选择系列')
              return false
            }
            if (!this.globalSettings.series_path) {
              this.$message.error('请选择系列路径')
              return false
            }
          }
          
          // 验证章节选择相关字段
          if (this.globalSettings.series_type && this.globalSettings.series_type.includes('章节选择')) {
            if (!this.globalSettings.subject) {
              this.$message.error('请选择科目')
              return false
            }
            if (!this.globalSettings.chapter_version) {
              this.$message.error('请选择版本')
              return false
            }
            if (!this.globalSettings.chapter_path) {
              this.$message.error('请选择章节路径')
              return false
            }
          }
          
          // 验证知识点选择相关字段
          if (this.globalSettings.series_type && this.globalSettings.series_type.includes('知识点选择')) {
            if (!this.globalSettings.subject) {
              this.$message.error('请选择科目')
              return false
            }
            if (!this.globalSettings.knowledge_name) {
              this.$message.error('请选择知识点')
              return false
            }
          }
          
          // 确保所有题目的答案字段同步
          this.questions.forEach(question => {
            this.ensureAnswerSync(question)
          })
          
          let validCount = 0
          let invalidQuestions = []
          
          this.questions.forEach((question, index) => {
            if (!question.question || !question.question.trim()) {
              invalidQuestions.push(`题目 ${index + 1}: 题目内容为空`)
            } else {
              validCount++
            }
            
            // 验证答案字段 - 检查多个可能的答案字段
            const hasAnswer = this.checkQuestionHasAnswer(question)
            if (!hasAnswer) {
              invalidQuestions.push(`题目 ${index + 1}: 答案为空，请填写答案`)
            }
            
            // 验证科目字段（教辅材料模式下不验证科目）
            // 如果只选择了教辅材料，不验证科目；如果选择了其他类型，需要验证科目
            if (!this.globalSettings.series_type || 
                !this.globalSettings.series_type.includes('教辅材料') || 
                this.globalSettings.series_type.length > 1) {
              if (!question.subject_name || question.subject_name === '未指定科目') {
                invalidQuestions.push(`题目 ${index + 1}: 科目为"未指定科目"，请选择具体的科目`)
              }
            }
            
            // 验证label字段
            if (question.label && this.isImageParseFailed(question.label)) {
              invalidQuestions.push(`题目 ${index + 1}: 标签内容为"图片解析失败"，请修改标签内容`)
            }
            
            // 验证子题
            if (question.children && question.children.length > 0) {
              question.children.forEach((subQuestion, subIndex) => {
                // 检查子题内容，优先检查content字段，如果没有则检查question字段
                const subQuestionContent = subQuestion.content || subQuestion.question
                if (!subQuestionContent || !subQuestionContent.trim()) {
                  invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 子题内容为空`)
                } else {
                  validCount++
                }
                
                // 验证子题答案字段 - 检查多个可能的答案字段
                const subHasAnswer = this.checkQuestionHasAnswer(subQuestion)
                if (!subHasAnswer) {
                  invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 子题答案为空，请填写答案`)
                }
                
                // 验证子题科目字段（教辅材料模式下不验证科目）
                // 如果只选择了教辅材料，不验证科目；如果选择了其他类型，需要验证科目
                if (!this.globalSettings.series_type || 
                    !this.globalSettings.series_type.includes('教辅材料') || 
                    this.globalSettings.series_type.length > 1) {
                  if (!subQuestion.subject_name || subQuestion.subject_name === '未指定科目') {
                    invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 科目为"未指定科目"，请选择具体的科目`)
                  }
                }
                
                // 验证子题label字段
                if (subQuestion.label && this.isImageParseFailed(subQuestion.label)) {
                  invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 标签内容为"图片解析失败"，请修改标签内容`)
                }
              })
            }
          })
          
          if (invalidQuestions.length > 0) {
            this.$message.warning(`发现 ${invalidQuestions.length} 道题目有问题：\n${invalidQuestions.join('\n')}`)
            return false
          } else {
            this.$message.success(`验证通过，共 ${validCount} 道题目（知识点为可选项）`)
            return true
          }
        } catch (error) {
          this.$message.error('验证失败：' + error.message)
          return false
        }
      },

      // 上传所有题目
      async uploadAllQuestions() {
        try {
          // 先验证格式
          if (!this.validateAllQuestions()) {
            return
          }
          
          // 检查是否有当前任务ID
          if (!this.currentTaskId) {
            this.$message.error('没有找到当前任务，无法上传题目。请重新打开题目编辑器。')
            return
          }
          
          // 确保所有题目的答案字段同步
          this.questions.forEach(question => {
            this.ensureAnswerSync(question)
          })
          
          // 先验证所有题目
          let validationErrors = []
          for (let i = 0; i < this.questions.length; i++) {
            const question = this.questions[i]
            try {
              this.formatQuestionForUpload(question)
            } catch (error) {
              validationErrors.push(`题目 ${i + 1}: ${error.message}`)
            }
          }
          
          if (validationErrors.length > 0) {
            this.$message.error(`发现 ${validationErrors.length} 道题目有问题，无法上传：\n${validationErrors.join('\n')}`)
            return
          }
          
          this.uploadingQuestions = true
          let successCount = 0
          let failCount = 0
          
          // 一道题一道题上传
          for (let i = 0; i < this.questions.length; i++) {
            const originalQuestion = this.questions[i]
            const formattedQuestion = this.formatQuestionForUpload(originalQuestion)
            
            console.log(`正在上传第 ${i + 1}/${this.questions.length} 题:`, formattedQuestion)
            
            try {
              console.log(`发送请求到API，数据:`, JSON.stringify(formattedQuestion, null, 2))
              const response = await uploadQuestion(formattedQuestion)
              console.log(`API响应:`, response)
              
              if (response.code === 200) {
                successCount++
                this.$message.success(`题目 ${i + 1} 上传成功！`)
              } else {
                failCount++
                console.error(`API返回错误:`, response)
                // 尝试获取详细的错误信息
                let errorMsg = '未知错误'
                if (response.msg) {
                  errorMsg = response.msg
                } else if (response.message) {
                  errorMsg = response.message
                } else if (response.detail) {
                  errorMsg = response.detail
                } else if (response.data && response.data.msg) {
                  errorMsg = response.data.msg
                } else if (response.data && response.data.detail) {
                  errorMsg = response.data.detail
                }
                // 清理错误信息，移除长串ID
                errorMsg = this.cleanErrorMessage(errorMsg)
                this.$message.error(`题目 ${i + 1} 上传失败: ${errorMsg}`)
              }
            } catch (uploadError) {
              failCount++
              console.error(`上传题目 ${i + 1} 失败:`, uploadError)
              console.error(`错误详情:`, uploadError.response)
              // 尝试获取网络错误的详细信息
              let errorMsg = '网络错误'
              if (uploadError.message) {
                errorMsg = uploadError.message
              } else if (uploadError.response && uploadError.response.data) {
                if (uploadError.response.data.msg) {
                  errorMsg = uploadError.response.data.msg
                } else if (uploadError.response.data.detail) {
                  errorMsg = uploadError.response.data.detail
                } else if (uploadError.response.data.message) {
                  errorMsg = uploadError.response.data.message
                }
              }
              // 清理错误信息，移除长串ID
              errorMsg = this.cleanErrorMessage(errorMsg)
              this.$message.error(`题目 ${i + 1} 上传异常: ${errorMsg}`)
            }
          }
          
          // 根据上传结果更新任务进度
          if (this.currentTaskId) {
            let progressStatus = ''
            let taskStatus = ''
            
            if (failCount === 0) {
              progressStatus = '已完成'
              taskStatus = '处理完成'
            } else if (successCount === 0) {
              progressStatus = '上传出错'
              taskStatus = '上传失败'
            } else {
              progressStatus = '上传出错'
              taskStatus = '部分失败'
            }
            
            const failureReason = failCount > 0 ? `部分题目上传失败，成功${successCount}题，失败${failCount}题` : ''
            
            // 通知父组件更新任务进度
            this.$emit('task-progress-update', {
              taskId: this.currentTaskId,
              progressStatus,
              successCount,
              failCount,
              failureReason,
              taskStatus
            })
          }
          
          // 显示上传结果
          this.$alert(`共上传 ${this.questions.length} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
            confirmButtonText: '确定',
            type: successCount === this.questions.length ? 'success' : (failCount === this.questions.length ? 'error' : 'warning')
          })
          
          // 如果设置了创建模式（组卷或试卷），且所有题目都上传成功（failCount === 0），则调用创建接口
          if (failCount === 0 && successCount === this.questions.length && this.creationMode && this.storedSubject && this.selectedQuestionIndices.length > 0) {
            await this.createHomeworkOrPaper()
          } else if (this.creationMode && failCount > 0) {
            // 如果有题目上传失败，提示用户
            this.$message.warning('部分题目上传失败，无法创建组卷/试卷。请确保所有题目都上传成功后再试。')
          }
          
          // 上传完成后关闭弹窗（只有全部成功时才关闭）
          if (failCount === 0 && successCount === this.questions.length) {
            this.handleDialogClose()
          }
          
        } catch (error) {
          console.error('上传题目过程中发生错误:', error)
          this.$message.error('上传题目过程中发生错误：' + error.message)
        } finally {
          this.uploadingQuestions = false
        }
      },

      // 创建作业或组卷
      async createHomeworkOrPaper() {
        try {
          // 获取选中的题目ID
          const selectedQuestionIds = []
          this.selectedQuestionIndices.forEach(index => {
            if (typeof index === 'number') {
              // 主题目
              const question = this.questions[index]
              if (question && (question.sid || question.SID || question.questionSid)) {
                selectedQuestionIds.push(question.sid || question.SID || question.questionSid)
              }
            } else if (typeof index === 'string' && index.includes('-')) {
              // 子题目
              const [mainIndex, subIndex] = index.split('-').map(i => parseInt(i))
              const mainQuestion = this.questions[mainIndex]
              if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
                const subQuestion = mainQuestion.children[subIndex]
                if (subQuestion.sid || subQuestion.SID || subQuestion.questionSid) {
                  selectedQuestionIds.push(subQuestion.sid || subQuestion.SID || subQuestion.questionSid)
                }
              }
            }
          })

          if (selectedQuestionIds.length === 0) {
            this.$message.warning('没有找到选中的题目ID，无法创建')
            return
          }

          // 生成任务名称：存储的科目 + 时间 + 作业/试卷
          const now = new Date()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          const day = String(now.getDate()).padStart(2, '0')
          const typeName = this.creationMode === 'homework' ? '作业' : '试卷'
          const customPaperName = `${this.storedSubject}${month}.${day}${typeName}`

          // 构建提交数据
          const submitData = {
            subject: this.storedSubject,
            customPaperName: customPaperName,
            questionIds: selectedQuestionIds.join(','),
            knowledgePointIds: ''
          }

          // 根据创建模式调用不同的API
          if (this.creationMode === 'homework') {
            // 创建作业
            const response = await addTable(submitData)
            if (response && (response.code === 200 || response.status === 200 || response.success)) {
              this.$message.success(`组卷创建成功：${customPaperName}`)
            } else {
              this.$message.error('组卷创建失败：' + (response.msg || '未知错误'))
            }
          } else {
            // 创建试卷
            const response = await addPaper(submitData)
            if (response && (response.code === 200 || response.status === 200 || response.success)) {
              this.$message.success(`试卷创建成功：${customPaperName}`)
            } else {
              this.$message.error('试卷创建失败：' + (response.msg || '未知错误'))
            }
          }

          // 清空创建模式和选中状态
          this.creationMode = null
          this.storedSubject = ''
          this.selectedQuestionIndices = []
        } catch (error) {
          console.error('创建作业或组卷失败:', error)
          this.$message.error('创建失败：' + (error.message || '网络错误'))
        }
      },

      // 格式化题目数据用于上传
      formatQuestionForUpload(question) {
        if (!question) {
          throw new Error('题目数据为空')
        }
        
        console.log('原始题目数据:', question)
        
        // 先转义所有字符串字段中的双引号
        const escapedQuestion = this.escapeQuotesInObject(question)
        console.log('转义双引号后的题目数据:', escapedQuestion)
        
        // 特别检查question字段的转义情况
        if (question.question && question.question.includes('"')) {
          console.log('原始question包含双引号:', question.question)
          console.log('转义后question:', escapedQuestion.question)
        }
        
        const formatted = {
          sid: escapedQuestion.sid || '',
          subject_name: escapedQuestion.subject || escapedQuestion.subject_name || '',
          level: escapedQuestion.level || '',
          question: escapedQuestion.question || '',
          options: escapedQuestion.options || [],
          qtype: escapedQuestion.qtype || '',
          subject_code: escapedQuestion.subject_code || '',
          cate: escapedQuestion.cate || '',
          catename: escapedQuestion.catename || '',
          label: escapedQuestion.label || '',
          // points选择整个knowledge_points数组
          points: escapedQuestion.knowledge_points || [],
          
          // knowledge_name：如果是知识点选择模式，使用全局设置的knowledge_name；否则从knowledge_points数组获取第一个
          knowledge_name: (this.globalSettings.series_type && this.globalSettings.series_type.includes('知识点选择') && this.globalSettings.knowledge_name)
                            ? this.globalSettings.knowledge_name
                            : ((escapedQuestion.knowledge_points && escapedQuestion.knowledge_points.length > 0) 
                               ? (typeof escapedQuestion.knowledge_points[0] === 'string' 
                                  ? escapedQuestion.knowledge_points[0] 
                                  : (escapedQuestion.knowledge_points[0].label || escapedQuestion.knowledge_points[0].name || ''))
                               : ''),
          
          path: escapedQuestion.path || '',
          answers: escapedQuestion.answers || [],
          displayanswer: escapedQuestion.displayanswer || (escapedQuestion.answers && escapedQuestion.answers.length > 0 ? escapedQuestion.answers.join(', ') : ''),
          degree: escapedQuestion.degree || 0.5,
          topic: escapedQuestion.topic || [],
          
          children: this.formatChildrenForUpload(escapedQuestion.children || []),
          Analyse: escapedQuestion.Analyse || '',
          Method: escapedQuestion.Method || '',
          Discuss: escapedQuestion.Discuss || '',
          Score: escapedQuestion.Score || 0,
          
          // 新增参数
          source: escapedQuestion.source || '麓鸣上传',
          series_type: Array.isArray(this.globalSettings.series_type) 
            ? (this.globalSettings.series_type.length > 0 ? this.globalSettings.series_type[0] : '教辅材料')
            : (this.globalSettings.series_type || '教辅材料'),
          series: this.globalSettings.series || 1,
          tags: escapedQuestion.tags || [],
          
          // 根据题库类型传递不同的字段
          // 章节选择：使用 path 字段传递 chapter_path
          path: (this.globalSettings.series_type && this.globalSettings.series_type.includes('章节选择')) 
            ? (this.globalSettings.chapter_path || '') 
            : '',
          // 知识点选择：使用 knowledge_name 字段传递（已在上面设置）
          // 教辅材料：使用 series_path 字段传递
          series_path: (this.globalSettings.series_type && this.globalSettings.series_type.includes('教辅材料')) 
            ? (this.globalSettings.series_path || '') 
            : ''
        }
        
        // 确保 options 是字符串数组
        if (formatted.options && !formatted.options.every(opt => typeof opt === 'string')) {
          formatted.options = formatted.options.map(opt => String(opt))
        }
        // 确保 answers 是字符串数组
        if (formatted.answers && !formatted.answers.every(ans => typeof ans === 'string')) {
          formatted.answers = formatted.answers.map(ans => String(ans))
        }
        
        // 确保必要字段不为空
        if (!formatted.question || formatted.question.trim() === '') {
          console.warn('题目内容为空:', formatted)
        }
        if (!formatted.sid || formatted.sid.trim() === '') {
          console.warn('题目ID为空:', formatted)
        }
        
        // 验证答案字段 - 检查多个可能的答案字段
        const hasAnswer = this.checkQuestionHasAnswer(formatted)
        if (!hasAnswer) {
          console.warn('题目答案为空:', formatted)
          throw new Error('题目答案不能为空，请填写答案后再上传')
        }
        
        console.log('格式化后的题目数据:', formatted)
        return formatted
      },

      // 格式化子题数据用于上传
      formatChildrenForUpload(children) {
        if (!children || !Array.isArray(children)) {
          return []
        }
        
        return children.map(child => {
          const formattedChild = { ...child }
          
          // 将question字段转换为content字段
          if (formattedChild.question) {
            formattedChild.content = formattedChild.question
          }
          
          // 同步子题答案：当displayanswer有值但answers为null时，将displayanswer的值同步给answers
          if (formattedChild.displayanswer && formattedChild.displayanswer.trim() && 
              (!formattedChild.answers || formattedChild.answers === null || 
               (Array.isArray(formattedChild.answers) && formattedChild.answers.length === 0))) {
            // 如果displayanswer包含逗号分隔的多个答案，则分割成数组
            if (formattedChild.displayanswer.includes(',')) {
              formattedChild.answers = formattedChild.displayanswer.split(',').map(ans => ans.trim()).filter(ans => ans)
            } else {
              formattedChild.answers = [formattedChild.displayanswer]
            }
            console.log('子题答案同步：将displayanswer同步到answers', {
              displayanswer: formattedChild.displayanswer,
              answers: formattedChild.answers
            })
          }
          
          return formattedChild
        })
      },

      // 清理错误信息
      cleanErrorMessage(errorMsg) {
        if (!errorMsg || typeof errorMsg !== 'string') {
          return errorMsg
        }
        
        // 移除长串ID，保留前50个字符
        if (errorMsg.length > 100) {
          return errorMsg.substring(0, 100) + '...'
        }
        
        return errorMsg
      },

      // 获取已有题目信息
      getExistingQuestionInfo() {
        // 优先从当前选中的题目获取信息
        if (this.currentQuestion) {
          return {
            subject_name: this.currentQuestion.subject_name,
            qtype: this.currentQuestion.qtype,
            level: this.currentQuestion.level,
            subject_code: this.currentQuestion.subject_code,
            cate: this.currentQuestion.cate,
            catename: this.currentQuestion.catename,
            label: this.currentQuestion.label,
            points: this.currentQuestion.points,
            knowledge_name: this.currentQuestion.knowledge_name,
            path: this.currentQuestion.path,
            degree: this.currentQuestion.degree,
            topic: this.currentQuestion.topic,
            tags: this.currentQuestion.tags,
            knowledge_points: this.currentQuestion.knowledge_points
          }
        }
        
        // 如果没有当前题目，从题目列表中获取第一个题目的信息
        if (this.questions.length > 0) {
          const firstQuestion = this.questions[0]
          return {
            subject_name: firstQuestion.subject_name,
            qtype: firstQuestion.qtype,
            level: firstQuestion.level,
            subject_code: firstQuestion.subject_code,
            cate: firstQuestion.cate,
            catename: firstQuestion.catename,
            label: firstQuestion.label,
            points: firstQuestion.points,
            knowledge_name: firstQuestion.knowledge_name,
            path: firstQuestion.path,
            degree: firstQuestion.degree,
            topic: firstQuestion.topic,
            tags: firstQuestion.tags,
            knowledge_points: firstQuestion.knowledge_points
          }
        }
        
        // 如果没有任何题目，返回默认值
        return {
          subject_name: '未指定科目',
          qtype: '选择题',
          level: '中等',
          subject_code: '',
          cate: '',
          catename: '',
          label: '',
          points: [],
          knowledge_name: '',
          path: '',
          degree: 0.5,
          topic: [],
          tags: [],
          knowledge_points: []
        }
      },

      // 根据科目名称获取科目代码
      getSubjectCode(subjectName) {
        if (!subjectName || typeof subjectName !== 'string') {
          return ''
        }
        return this.SUBJECT_CODE_DICT[subjectName] || ''
      },

      // 转义字符串中的双引号
      escapeQuotes(str) {
        if (typeof str !== 'string') {
          return str
        }
        // 将双引号转义为 /quote_
        return str.replace(/"/g, "/quote_")
      },

      // 检查对象中是否包含双引号
      checkObjectForQuotes(obj) {
        if (!obj || typeof obj !== 'object') {
          return false
        }
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key]
            if (typeof value === 'string') {
              if (value.includes('"')) {
                return true
              }
            } else if (Array.isArray(value)) {
              // 检查数组中的字符串
              for (const item of value) {
                if (typeof item === 'string' && item.includes('"')) {
                  return true
                } else if (typeof item === 'object' && item !== null && this.checkObjectForQuotes(item)) {
                  return true
                }
              }
            } else if (typeof value === 'object' && value !== null) {
              // 递归检查嵌套对象
              if (this.checkObjectForQuotes(value)) {
                return true
              }
            }
          }
        }
        return false
      },

      // 检查并转义对象中所有字符串字段的双引号
      escapeQuotesInObject(obj) {
        if (!obj || typeof obj !== 'object') {
          return obj
        }
        
        const escaped = {}
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key]
            if (typeof value === 'string') {
              // 检查是否包含双引号
              if (value.includes('"')) {
                console.log(`发现双引号，正在转义字段 ${key}:`, value)
                escaped[key] = this.escapeQuotes(value)
                console.log(`转义后:`, escaped[key])
              } else {
                escaped[key] = value
              }
            } else if (Array.isArray(value)) {
              // 处理数组中的字符串
              escaped[key] = value.map(item => {
                if (typeof item === 'string') {
                  if (item.includes('"')) {
                    console.log(`发现双引号，正在转义数组项 ${key}:`, item)
                    const escapedItem = this.escapeQuotes(item)
                    console.log(`转义后:`, escapedItem)
                    return escapedItem
                  }
                  return item
                } else if (typeof item === 'object' && item !== null) {
                  return this.escapeQuotesInObject(item)
                }
                return item
              })
            } else if (typeof value === 'object' && value !== null) {
              // 递归处理嵌套对象
              escaped[key] = this.escapeQuotesInObject(value)
            } else {
              escaped[key] = value
            }
          }
        }
        return escaped
      },

      // 生成随机SID
      generateRandomSid() {
        return 'Q' + Date.now() + Math.random().toString(36).substr(2, 9)
      },

      // 判断是否是选择题
      isChoiceQuestion(question) {
        if (!question) return false
        
        const choiceTypes = ['选择题', '多选题', '单选题', '多选题', '不定项选择题']
        return choiceTypes.includes(question.qtype) || 
               (question.options && question.options.length > 0)
      },

      // 检查题目是否有答案的通用方法
      checkQuestionHasAnswer(question) {
        if (!question) {
          return false
        }
             
        // 检查 displayanswer 字段
        if (question.displayanswer && question.displayanswer.trim()) {
          return true
        }
        
        // 检查 answers 数组字段
        if (question.answers && Array.isArray(question.answers) && question.answers.length > 0) {
          const hasValidAnswer = question.answers.some(ans => ans && ans.trim())
          if (hasValidAnswer) {
            return true
          }
        }
        
        // 检查其他可能的答案字段
        if (question.answer && question.answer.trim()) {
          return true
        }
        
        // 检查子题答案（如果是主题目且有子题）
        if (question.children && Array.isArray(question.children) && question.children.length > 0) {
          const hasSubAnswer = question.children.some(subQuestion => this.checkQuestionHasAnswer(subQuestion))
          return hasSubAnswer
        }
        
        return false
      },

      // 将主题目答案同步到子题
      syncMainAnswerToSubQuestions(mainQuestion, content) {
        if (!content || !mainQuestion.children || mainQuestion.children.length === 0) {
          return
        }
        
        // 按行分割答案内容
        const answerLines = content.split('\n').filter(line => line.trim())
        
        mainQuestion.children.forEach((subQuestion, index) => {
          if (index < answerLines.length) {
            // 提取子题答案（去掉序号前缀，如 "1. "）
            let subAnswer = answerLines[index].trim()
            if (subAnswer.match(/^\d+\.\s*/)) {
              subAnswer = subAnswer.replace(/^\d+\.\s*/, '')
            }
            
            // 同步到子题
            subQuestion.displayanswer = subAnswer
            // 如果答案包含逗号分隔的多个答案，则分割成数组
            if (subAnswer.includes(',')) {
              subQuestion.answers = subAnswer.split(',').map(ans => ans.trim()).filter(ans => ans)
            } else {
              subQuestion.answers = [subAnswer]
            }
            
            console.log(`同步子题 ${index + 1} 答案:`, subAnswer)
          }
        })
        
        console.log('主题目答案已同步到子题')
      },

      // 确保答案字段同步的方法
      ensureAnswerSync(question) {
        if (!question) return
        
        // 确保 displayanswer 和 answers 字段同步
        if (question.displayanswer && question.displayanswer.trim()) {
          // 如果 displayanswer 有值但 answers 为空，同步到 answers
          if (!question.answers || question.answers.length === 0) {
            if (question.displayanswer.includes(',')) {
              question.answers = question.displayanswer.split(',').map(ans => ans.trim()).filter(ans => ans)
            } else {
              question.answers = [question.displayanswer]
            }
          }
        } else if (question.answers && question.answers.length > 0) {
          // 如果 answers 有值但 displayanswer 为空，同步到 displayanswer
          if (!question.displayanswer || !question.displayanswer.trim()) {
            question.displayanswer = question.answers.join(', ')
          }
        }
        
        // 递归处理子题
        if (question.children && Array.isArray(question.children)) {
          question.children.forEach(subQuestion => {
            this.ensureAnswerSync(subQuestion)
          })
        }
      }
    }
  }
</script>

<style scoped>
/* 全局设置区域样式 */
/* 全局设置按钮区域 */
.global-settings-button-section {
  margin-bottom: 20px;
  padding: 10px 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.global-settings-button {
  flex: 1;
  text-align: left;
  justify-content: flex-start;
}

/* 胶囊状按钮组样式 */
.creation-mode-button-group {
  display: inline-flex;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.creation-mode-button-group .el-button {
  border-radius: 0;
  margin: 0;
  border: none;
  position: relative;
}

.creation-mode-button-group .el-button:first-child {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.creation-mode-button-group .el-button:last-child {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}

.creation-mode-button-group .el-button.is-active {
  background-color: #409eff;
  color: #fff;
  font-weight: 500;
}

.creation-mode-button-group .el-button.is-active:hover {
  background-color: #66b1ff;
}

.creation-mode-button-group .el-button:not(.is-active) {
  background-color: #f5f7fa;
  color: #606266;
}

.creation-mode-button-group .el-button:not(.is-active):hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.creation-mode-button-group .el-button:disabled {
  background-color: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 一键全选按钮样式 */
.select-all-button {
  margin-left: 10px;
  border-radius: 20px;
  border-color: #409eff;
  color: #409eff;
}

.select-all-button:hover {
  background-color: #ecf5ff;
  border-color: #66b1ff;
  color: #66b1ff;
}

.select-all-button:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 全局设置弹窗内容 */
.global-settings-dialog-content {
  padding: 20px 0;
}

.global-settings-dialog-content .el-form-item {
  margin-bottom: 20px;
}

/* 系列设置行样式 */
.series-settings-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.series-settings-row > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 第二行样式 */
.chapter-path-select-row,
.knowledge-path-select-row {
  width: 100%;
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
}

.subject-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subject-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.series-type-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.series-type-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.series-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.series-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.series-path-select {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 300px;
}

.series-path-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.series-path-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

/* 章节选择相关样式 */
.chapter-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.chapter-path-select {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 300px;
  flex-direction: column;
  align-items: flex-start;
}

.chapter-path-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.chapter-path-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

/* 知识点选择相关样式 */
.knowledge-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.knowledge-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.knowledge-path-select-row {
  width: 100%;
  margin-top: 10px;
}

.knowledge-path-select {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 300px;
  flex-direction: column;
  align-items: flex-start;
}

.knowledge-path-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin: 0;
}

.knowledge-path-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

/* 路径显示样式 */
.selected-path-display {
  margin-top: 8px;
  width: 100%;
}

.selected-path-display .el-tag {
  max-width: 100%;
  word-break: break-all;
}

/* 加载和空数据样式 */
.loading-container,
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
}

.loading-container i {
  font-size: 32px;
  margin-bottom: 10px;
  animation: rotate 1s linear infinite;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 题目编辑器样式 */
.question-editor-container {
  display: flex;
  gap: 20px;
  height: 65vh;
  min-height: 500px;
}

.question-list-section {
  width: 25%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.question-edit-section {
  width: 75%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow-y: auto;
}

.section-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  justify-content: center!important;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

/* 竖向题目列表样式 */
.question-list-vertical {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.question-group {
  width: 90% ;
  margin-bottom: 15px;
}

.question-item {
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
}

.question-checkbox {
  flex-shrink: 0;
  margin-top: 2px;
}

.question-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
}

.question-item.active {
  border-color: #409EFF;
  background: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.question-item .question-preview {
  flex: 1;
  padding: 5px 0;
  min-width: 0;
}

.question-item h5 {
  margin: 0 0 8px 0;
  color: #409EFF;
  font-size: 14px;
  font-weight: 600;
}

.question-item .question-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.question-item .question-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 题目层级样式 */
.question-item.main-question {
  border-left: 4px solid #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.question-item.sub-question {
  border-left: 4px solid #e6a23c;
  background: linear-gradient(135deg, #fdf6ec 0%, #ffffff 100%);
  margin-left: 20px;
  position: relative;
}

.question-item.sub-question::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  width: 15px;
  height: 1px;
  background: #e6a23c;
  transform: translateY(-50%);
}

.question-item.sub-question::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  width: 1px;
  height: 50%;
  background: #e6a23c;
}

/* 编辑区域样式 */
.question-edit-section {
  padding: 20px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.edit-header h4 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.question-basic-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.question-content-section,
.analysis-content-section,
.method-content-section,
.discuss-content-section,
.knowledge-points-section,
.tags-section,
.options-section,
.answer-section {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
}

.field-label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.field-content {
  padding: 20px;
}

.content-preview {
  min-height: 60px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  line-height: 1.6;
  color: #606266;
}

.content-preview:empty::before {
  content: "内容为空";
  color: #c0c4cc;
  font-style: italic;
}

.options-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  align-items: center;
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  margin-right: 10px;
  min-width: 20px;
}

.option-content {
  flex: 1;
  color: #606266;
  line-height: 1.5;
}

/* 无选项提示样式 */
.no-options-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  color: #909399;
  font-size: 14px;
  text-align: center;
  justify-content: center;
}

.no-options-tip i {
  font-size: 16px;
  color: #409eff;
}

/* 标签输入容器样式 */
.label-input-container {
  width: 100%;
}

.label-input-container .el-input {
  width: 100%;
}

.label-input-container .el-input.is-focus .el-input__inner {
  border-color: #409eff;
}

/* 标签错误样式 */
.label-error .el-input__inner {
  border-color: #f56c6c !important;
  background-color: #fef0f0;
}

.label-error .el-input__inner:focus {
  border-color: #f56c6c !important;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

/* 标签错误提示样式 */
.label-error-tip {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  font-size: 12px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.label-error-tip i {
  font-size: 14px;
}

/* 主题/话题选择样式 */
.topic-section {
  margin-bottom: 20px;
}

.degree-section {
  margin-bottom: 20px;
}

.degree-tips {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.degree-tips .tip-item {
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

/* 删除按钮样式 */
.delete-question-btn {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.delete-question-btn:hover {
  opacity: 1;
  background-color: #fef0f0;
  border-radius: 4px;
}

.question-item:hover .delete-question-btn {
  opacity: 1;
}

/* 拖拽相关样式 */
.sub-questions-container {
  position: relative;
}

.drag-handle {
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: move;
  color: #909399;
  font-size: 12px;
  transition: all 0.3s ease;
  z-index: 10;
}

.drag-handle:hover {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.insert-buttons {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.insert-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  min-height: 20px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  color: #409eff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.3s ease;
}

.insert-btn:hover {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.add-subquestion-at-end {
  margin-left: 20px;
  margin-top: 8px;
  padding: 10px 0;
  text-align: center;
}

.add-subquestion-btn {
  width: 100%;
  border-style: dashed;
  color: #909399;
  background: #fafafa;
  border-color: #d9d9d9;
}

.add-subquestion-btn:hover {
  color: #409eff;
  border-color: #409eff;
  background: #f0f9ff;
}

/* 拖拽状态样式 */
.ghost-question {
  opacity: 0.5;
  background: #f0f9ff;
  border: 2px dashed #409eff;
}

.chosen-question {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.drag-question {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: rotate(2deg);
}

/* 子题拖拽时的特殊样式 */
.sub-question.dragging {
  opacity: 0.8;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 子题标签样式 */
.sub-question-label {
  margin-bottom: 10px;
}

.sub-question-label .el-tag {
  font-weight: 500;
}

/* 滚动条样式 */
.question-list-vertical::-webkit-scrollbar,
.question-edit-section::-webkit-scrollbar {
  width: 6px;
}

.question-list-vertical::-webkit-scrollbar-thumb,
.question-edit-section::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.question-list-vertical::-webkit-scrollbar-track,
.question-edit-section::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .drag-handle {
    left: -25px;
    width: 18px;
    height: 18px;
    font-size: 10px;
  }
  
  .insert-buttons {
    right: -25px;
  }
  
  .insert-btn {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }
  
  .question-editor-container {
    flex-direction: column;
    height: auto;
  }
  
  .question-list-section,
  .question-edit-section {
    width: 100%;
  }
  
  .question-list-section {
    height: 300px;
  }
}

/* Markdown预览样式 */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin: 20px 0 10px 0;
  color: #303133;
}

.markdown-preview p {
  margin: 10px 0;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.markdown-preview table th,
.markdown-preview table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-preview table th {
  background-color: #f5f5f5;
}

.markdown-preview code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.markdown-preview pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-preview blockquote {
  border-left: 4px solid #409eff;
  margin: 10px 0;
  padding-left: 15px;
  color: #606266;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 图片样式 */
.content-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

/* KaTeX数学公式样式 */
.content-preview .katex {
  font-size: 1.1em;
  line-height: 1.2;
}

.content-preview .katex-display {
  margin: 1em 0;
  text-align: center;
  padding: 0.5em 0;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.content-preview .katex-display .katex {
  font-size: 1.2em;
}

.content-preview .math-error {
  color: #f56c6c;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  display: inline-block;
  margin: 0 2px;
}

.content-preview .math-error:hover {
  background: #fde2e2;
}

/* 行内数学公式样式 */
.content-preview .katex-inline {
  display: inline;
  margin: 0 2px;
}

/* 块级数学公式样式 */
.content-preview .katex-block {
  display: block;
  margin: 15px 0;
  text-align: center;
}

/* 数学公式容器样式 */
.content-preview .math-container {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.content-preview .math-container .katex-display {
  margin: 0;
  background: transparent;
  border: none;
  padding: 0;
}

/* 数学公式在表格中的样式 */
.content-preview table .katex {
  font-size: 0.9em;
}

.content-preview table .katex-display {
  margin: 0.5em 0;
  padding: 0.3em 0;
}

/* 选项预览中的数学公式样式 */
.option-content .katex {
  font-size: 1em;
  line-height: 1.3;
}

.option-content .katex-display {
  margin: 0.5em 0;
  padding: 0.3em 0;
  background: #f0f2f5;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}
</style>