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
            <div class="keyword-search-layout">
              <!-- 左侧：搜索条件 -->
              <div class="left-panel">
                <div class="panel-header">
                  <h3>搜索条件</h3>
                  <span class="panel-subtitle">配置关键词搜索参数</span>
                </div>
                
                <div class="search-conditions">
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
                    <el-form class="search-form">
                      <el-form-item label="选择科目">
                        <!-- 老师身份：显示固定科目 -->
                        <div v-if="userRole === 'teacher' && teacherSubject" class="teacher-subject-display">
                          <el-tag type="primary" size="medium">{{ teacherSubject }}</el-tag>
                          <span class="subject-hint">（老师专用科目）</span>
                        </div>
                        <!-- 管理员身份：显示完整科目选择器 -->
                        <el-select v-else-if="userRole === 'admin'" v-model="subjectType" placeholder="请选择科目" clearable class="full-width" @change="handleKeywordSubjectChange">
                          <!-- 初中科目 -->
                          <el-option-group label="初中科目">
                            <el-option label="初中数学" value="初中数学"></el-option>
                            <el-option label="初中科学" value="初中科学"></el-option>
                            <el-option label="初中语文" value="初中语文"></el-option>
                            <el-option label="初中英语" value="初中英语"></el-option>
                            <el-option label="初中历史" value="初中历史"></el-option>
                            <el-option label="初中政治" value="初中政治"></el-option>
                            <el-option label="初中地理" value="初中地理"></el-option>
                          </el-option-group>
                          <!-- 高中科目 -->
                          <el-option-group label="高中科目">
                            <el-option label="高中物理" value="高中物理"></el-option>
                            <el-option label="高中数学" value="高中数学"></el-option>
                            <el-option label="高中化学" value="高中化学"></el-option>
                            <el-option label="高中生物" value="高中生物"></el-option>
                            <el-option label="高中语文" value="高中语文"></el-option>
                            <el-option label="高中英语" value="高中英语"></el-option>
                            <el-option label="高中通用" value="高中通用"></el-option>
                            <el-option label="高中历史" value="高中历史"></el-option>
                            <el-option label="高中政治" value="高中政治"></el-option>
                            <el-option label="高中地理" value="高中地理"></el-option>
                            <el-option label="高中信息" value="高中信息"></el-option>
                          </el-option-group>
                        </el-select>
                        <!-- 加载中状态 -->
                        <div v-else class="loading-subject">
                          <i class="el-icon-loading"></i>
                          <span>加载科目中...</span>
                        </div>
                      </el-form-item>
                      
                      <el-form-item label="难度系数">
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
                      </el-form-item>
                      <span class="subject-hint">（系数越小，难度越大）</span>
                      
                      <el-form-item label="题目类型">
                        <el-select v-model="questionType" placeholder="请选择题目类型" clearable class="full-width" :loading="loadingQuestionTypes">
                          <el-option label="全部类型" value=""></el-option>
                          <el-option 
                            v-for="type in keywordQuestionTypes" 
                            :key="type" 
                            :label="type" 
                            :value="type"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                      
                      <!-- <el-form-item label="来源类型">
                        <el-select v-model="selectedSources" multiple placeholder="请选择来源" clearable class="full-width">
                          <el-option
                            v-for="source in sourceTypes"
                            :key="source.value"
                            :label="source.label"
                            :value="source.value"
                          />
                        </el-select>
                      </el-form-item> -->
                      
                      <el-form-item>
                        <div class="search-actions">
                          <el-button type="primary" @click="handleKeywordSearch" :loading="loading">
                            <i class="el-icon-search"></i> {{ loading ? '搜索中...' : '搜索' }}
                          </el-button>
                          <el-button @click="resetKeywordSearchForm">
                            <i class="el-icon-refresh"></i> 重置
                          </el-button>
                        </div>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </div>

              <!-- 中间：搜索结果 -->
              <div class="center-panel">
                <div class="panel-header">
                  <h3>搜索结果</h3>
                  <span class="panel-subtitle">关键词搜索题目结果</span>
                </div>
                
                <!-- 搜索结果卡片 -->
                <el-card v-if="searchResults.length > 0 || (hasSearched && loading)" class="results-card" shadow="hover">
                  <div slot="header" class="card-header">
                    <div class="header-content">
                      <div class="header-left">
                        <i class="el-icon-search header-icon"></i>
                        <span class="header-title">关键词搜索结果</span>
                        <span class="result-count" v-if="!loading">({{ totalCount }} 道题目)</span>
                      </div>
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
                    <div v-else-if="searchResults.length > 0" class="results-list-container">
                      <div class="results-list">
                        <div 
                          v-for="(item, index) in searchResults" 
                          :key="index" 
                          class="result-item"
                        >
                          <!-- 题目头部信息 -->
                          <div class="question-header">
                            <div class="question-meta">
                              <span class="question-type" :class="getQuestionTypeColor(item)">
                                {{ item.qtype || item.catename || '未知类型' }}
                              </span>
                              <span class="question-difficulty">
                                难度: {{ getDifficultyText(item.degree) }}
                              </span>
                              <span class="question-subject">
                                {{ item.subject_name || '未知科目' }}
                              </span>
                            </div>
                            <!-- 右侧：操作按钮 -->
                            <div class="question-actions-right">
                              <div class="action-buttons">
                                <el-button
                                  type="primary"
                                  size="small"
                                  @click="addToSharedSelection(item)"
                                  :disabled="isInSharedSelection(item.sid)"
                                  class="action-btn"
                                >
                                  <i class="el-icon-plus"></i>
                                  {{ isInSharedSelection(item.sid) ? '已添加' : '添加到已选' }}
                                </el-button>
                              </div>
                            </div>
                          </div>
                          
                          <!-- 题目主体内容 -->
                          <div class="question-main-content">
                            <!-- 左侧：题目内容 -->
                            <div class="question-content-left">
                              <!-- 题目内容 -->
                              <div class="question-content">
                                <div class="question-text" v-html="processQuestionContent(item.question)"></div>
                                
                                <!-- 选项 -->
                                <div v-if="isChoiceQuestion(item)" class="question-options">
                                  <div
                                    v-for="(option, optIndex) in parseOptions(item.options)"
                                    :key="optIndex"
                                    class="option-item"
                                  >
                                    <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                                    <span class="option-content" v-html="processOptionContent(option, optIndex)"></span>
                                  </div>
                                </div>
                                
                                <!-- 子题目 -->
                                <div v-if="item.children && parseChildren(item.children).length > 0" class="sub-questions">
                                  <div
                                    v-for="(subQuestion, subIndex) in parseChildren(item.children)"
                                    :key="subIndex"
                                    class="sub-question-item"
                                  >
                                    <div class="sub-question-header">
                                      <span class="sub-question-number">（{{ subIndex + 1 }}）</span>
                                      <span class="sub-question-type">{{ subQuestion.qtype || '子题' }}</span>
                                    </div>
                                    <div class="sub-question-content" v-html="processQuestionContent(subQuestion.content)"></div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- 题目底部信息 -->
                              <div class="question-footer">
                                <div class="question-info">
                                  <span class="knowledge-point">知识点: {{ item.knowledge_name || '未知' }}</span>
                                </div>
                                <div class="question-buttons">
                                  <el-button
                                    type="text"
                                    size="mini"
                                    @click="showAnalysis(item)"
                                  >
                                    查看解析
                                  </el-button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 分页 -->
                      <pagination
                        v-show="totalCount>0"
                        :total="totalCount"
                        :page.sync="currentPage"
                        :limit.sync="pageSize"
                        @pagination="handlePagination"
                      />
                    </div>
                    
                    <!-- 空状态 -->
                    <div v-else-if="hasSearched" class="empty-state">
                      <div class="empty-icon">
                        <i class="el-icon-search"></i>
                      </div>
                      <div class="empty-text">未找到相关题目</div>
                      <div class="empty-hint">请尝试调整搜索条件或使用其他关键词</div>
                    </div>
                  </div>
                </el-card>
                
                <!-- 初始状态 -->
                <div v-else class="initial-state">
                  <div class="initial-icon">
                    <i class="el-icon-search"></i>
                  </div>
                  <div class="initial-text">请输入搜索条件开始搜索</div>
                  <div class="initial-hint">支持关键词、科目、难度等多种搜索条件</div>
                </div>
              </div>

              <!-- 右侧：已选信息 -->
              <div class="right-panel">
                <div class="panel-header">
                  <h3>已选信息</h3>
                  <span class="panel-subtitle">管理已选题目和创建内容</span>
        </div>
                
                <!-- 切换创建作业和试卷功能 -->
                <!-- <div class="creation-mode-switch">
                  <el-radio-group v-model="addMode" size="medium" class="mode-radio-group">
                    <el-radio label="paper" class="mode-radio">
                      <i class="el-icon-document"></i>
                      创建试卷
                    </el-radio>
                    <el-radio label="homework" class="mode-radio">
                      <i class="el-icon-edit-outline"></i>
                      创建作业
                    </el-radio>
                  </el-radio-group>
                </div> -->

                <!-- 创建模式切换 -->
                <div class="creation-mode-selector">
                  <el-radio-group v-model="currentCreationMode" size="small">
                    <el-radio label="paper">创建试卷</el-radio>
                    <el-radio label="homework">创建作业</el-radio>
                  </el-radio-group>
                </div>

                <!-- 创建表单 -->
                <div class="creation-form">
                  <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="80px">
                    <!-- 科目选择 -->
                    <el-form-item label="科目" prop="subject">
                      <el-select 
                        v-model="generateForm.subject" 
                        placeholder="请选择科目"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="subject in subjectOptions"
                          :key="subject.value"
                          :label="subject.label"
                          :value="subject.value"
                        />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item :label="currentCreationMode === 'paper' ? '试卷名称' : '作业名称'" prop="name">
                      <el-input
                        v-model="generateForm.name"
                        :placeholder="currentCreationMode === 'paper' ? '请输入试卷名称' : '请输入作业名称'"
                        maxlength="50"
                        show-word-limit
                      />
                    </el-form-item>
                  </el-form>
                </div>

                
                <!-- 已选题目统计 -->
                <div class="selected-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ sharedSelectedQuestions.length }}</div>
                    <div class="stat-label">已选题目</div>
                  </div>
                  <!-- <div class="stat-item">
                    <div class="stat-number">{{ thirdPartyForm.max_questions }}</div>
                    <div class="stat-label">目标题目</div>
                  </div> -->
                </div>

                <!-- 已选题目列表 -->
                <div class="selected-questions-preview" v-if="sharedSelectedQuestions.length > 0">
                  <div class="preview-header">
                    <span class="preview-title">已选题目预览</span>
                    <div class="preview-actions">
                      <el-button type="text" size="small" @click="previewSelectedQuestions">
                        <i class="el-icon-view"></i>
                        预览
                      </el-button>
                      <el-button type="text" size="small" @click="clearSharedSelectedQuestions">
                        <i class="el-icon-delete"></i>
                        清空
                      </el-button>
                    </div>
                  </div>
                  <div class="preview-list">
                    <div 
                      v-for="(question, index) in sharedSelectedQuestions" 
                      :key="question.sid"
                      class="preview-item"
                    >
                      <div class="preview-content">
                        <div class="preview-text" :title="question.question">
                          {{ question.question.length > 30 ? question.question.substring(0, 30) + '...' : question.question }}
                        </div>
                        <div class="preview-meta">
                          <el-tag size="mini" :type="getQuestionTypeColor(question).type">
                            {{ question.qtype || question.catename || '未知类型' }}
                          </el-tag>
                          <span class="preview-difficulty">难度: {{ getDifficultyText(question.degree) }}</span>
                        </div>
                      </div>
                      <div class="preview-actions">
                        <el-button
                          type="text" 
                          size="mini" 
                          @click="showAnalysis(question)"
                          class="analysis-btn"
                        >
                          <i class="el-icon-view"></i>
                          解析
                        </el-button>
                        <el-button
                          type="danger"
                          size="mini" 
                          icon="el-icon-delete"
                          @click="removeFromSharedSelection(question.sid)"
                          class="remove-btn"
                          style="color:azure"
                        >
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div class="empty-state" v-else>
                  <div class="empty-icon">
                    <i class="el-icon-files"></i>
                  </div>
                  <div class="empty-text">暂无已选题目</div>
                  <div class="empty-hint">搜索题目后可添加到已选列表中</div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons" v-if="sharedSelectedQuestions.length > 0">
                  <el-button 
                    type="primary" 
                    size="medium" 
                    @click="generatePaperOrHomework"
                    class="generate-btn"
                    :disabled="!generateForm.subject || !generateForm.name"
                  >
                    <i class="el-icon-plus"></i>
                    生成试卷/作业
          </el-button>
        </div>
      </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="拍照搜题" name="photo">
          <div class="search-content">
            <div class="photo-search-layout">
              <!-- 左侧：拍照上传 -->
              <div class="left-panel">
                <div class="panel-header">
                  <h3>拍照上传</h3>
                  <span class="panel-subtitle">上传题目图片进行智能识别</span>
                </div>
                
                <div class="photo-upload-section">
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
                    <div class="subject-display">
                      <!-- 老师身份：显示固定科目 -->
                      <div v-if="userRole === 'teacher' && teacherSubject" class="teacher-subject-display">
                        <div class="subject-info">
                          <span class="subject-label">科目：</span>
                          <el-tag type="primary" size="medium">{{ teacherSubject }}</el-tag>
                          <span class="subject-hint">（老师科目，自动设置）</span>
                        </div>
                      </div>
                      <!-- 管理员身份：显示科目选择器 -->
                      <div v-else-if="userRole === 'admin'" class="subject-select">
                        <el-select v-model="photoSubjectType" placeholder="请选择课程" clearable class="full-width">
                          <!-- 初中科目 -->
                          <el-option-group label="初中科目">
                            <el-option label="初中数学" value="初中数学"></el-option>
                            <el-option label="初中科学" value="初中科学"></el-option>
                            <el-option label="初中语文" value="初中语文"></el-option>
                            <el-option label="初中英语" value="初中英语"></el-option>
                            <el-option label="初中历史" value="初中历史"></el-option>
                            <el-option label="初中政治" value="初中政治"></el-option>
                            <el-option label="初中地理" value="初中地理"></el-option>
                          </el-option-group>
                          <!-- 高中科目 -->
                          <el-option-group label="高中科目">
                            <el-option label="高中物理" value="高中物理"></el-option>
                            <el-option label="高中数学" value="高中数学"></el-option>
                            <el-option label="高中化学" value="高中化学"></el-option>
                            <el-option label="高中生物" value="高中生物"></el-option>
                            <el-option label="高中语文" value="高中语文"></el-option>
                            <el-option label="高中英语" value="高中英语"></el-option>
                            <el-option label="高中通用" value="高中通用"></el-option>
                            <el-option label="高中历史" value="高中历史"></el-option>
                            <el-option label="高中政治" value="高中政治"></el-option>
                            <el-option label="高中地理" value="高中地理"></el-option>
                            <el-option label="高中信息" value="高中信息"></el-option>
                          </el-option-group>
                        </el-select>
                      </div>
                      <!-- 加载中状态 -->
                      <div v-else class="loading-subject">
                        <i class="el-icon-loading"></i>
                        <span>加载科目中...</span>
                      </div>
                    </div>
                    <el-button 
                      type="primary" 
                      size="large" 
                      :loading="photoLoading"
                      :disabled="userRole === 'teacher' ? !teacherSubject : !photoSubjectType"
                      @click="handlePhotoSearch"
                      class="photo-search-btn"
                      style="width: 100%; margin-top: 15px;"
                    >
                      <i class="el-icon-search"></i> {{ photoLoading ? '识别中...' : '开始搜题' }}
                    </el-button>
                  </div>
                  
                  <!-- 拍照搜题提示 -->
                  <div class="photo-tips">
                    <h4>使用提示：</h4>
                    <ul>
                      <li>确保图片清晰，文字清晰可见</li>
                      <li>建议使用白色背景的题目图片</li>
                      <li>避免图片过于复杂或包含多余内容</li>
                      <li>支持数学公式、化学式等专业符号</li>
                      <li>图片大小建议不超过5MB</li>
                      <li>支持jpg、png等常见图片格式</li>
                    </ul>
                    
                    <!-- 搜索状态提示 -->
                    <div v-if="photoLoading" class="search-status">
                      <i class="el-icon-loading"></i>
                      <span>正在识别题目，请稍候...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 中间：搜索结果 -->
              <div class="center-panel">
                <div class="panel-header">
                  <h3>搜索结果</h3>
                  <span class="panel-subtitle">拍照识别题目结果</span>
                </div>
                
                <!-- 搜索结果卡片 -->
                <el-card v-if="searchResults.length > 0 || (hasSearched && photoLoading)" class="results-card" shadow="hover">
                  <div slot="header" class="card-header">
                    <div class="header-content">
                      <div class="header-left">
                        <i class="el-icon-camera header-icon"></i>
                        <span class="header-title">拍照搜题结果</span>
                        <span class="result-count" v-if="!photoLoading">({{ totalCount }} 道题目)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="search-results">
                    <!-- 加载状态 -->
                    <div v-if="photoLoading" class="loading-container">
                      <div class="loading-spinner">
                        <i class="el-icon-loading"></i>
                      </div>
                      <p class="loading-text">正在识别题目，请稍候...</p>
                    </div>
                    
                    <!-- 搜索结果列表 -->
                    <div v-else-if="searchResults.length > 0" class="results-list-container">
                      <div class="results-list">
                        <div 
                          v-for="(item, index) in searchResults" 
                          :key="index" 
                          class="result-item"
                        >
                          <!-- 题目头部信息 -->
                          <div class="question-header">
                            <div class="question-meta">
                              <span class="question-type" :class="getQuestionTypeColor(item)">
                                {{ item.qtype || item.catename || '未知类型' }}
                              </span>
                              <span class="question-difficulty">
                                难度: {{ getDifficultyText(item.degree) }}
                              </span>
                              <span class="question-subject">
                                {{ item.subject_name || '未知科目' }}
                              </span>
                            </div>
                            <!-- 右侧：操作按钮 -->
                            <div class="question-actions-right">
                              <div class="action-buttons">
                                <el-button
                                  type="primary"
                                  size="small"
                                  @click="addToSharedSelection(item)"
                                  :disabled="isInSharedSelection(item.sid)"
                                  class="action-btn"
                                >
                                  <i class="el-icon-plus"></i>
                                  {{ isInSharedSelection(item.sid) ? '已添加' : '添加到已选' }}
                                </el-button>
                              </div>
                            </div>
                          </div>
                          
                          <!-- 题目主体内容 -->
                          <div class="question-main-content">
                            <!-- 左侧：题目内容 -->
                            <div class="question-content-left">
                              <!-- 题目内容 -->
                              <div class="question-content">
                                <div class="question-text" v-html="processQuestionContent(item.question)"></div>
                                
                                <!-- 选项 -->
                                <div v-if="isChoiceQuestion(item)" class="question-options">
                                  <div
                                    v-for="(option, optIndex) in parseOptions(item.options)"
                                    :key="optIndex"
                                    class="option-item"
                                  >
                                    <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                                    <span class="option-content" v-html="processOptionContent(option, optIndex)"></span>
                                  </div>
                                </div>
                                
                                <!-- 子题目 -->
                                <div v-if="item.children && parseChildren(item.children).length > 0" class="sub-questions">
                                  <div
                                    v-for="(subQuestion, subIndex) in parseChildren(item.children)"
                                    :key="subIndex"
                                    class="sub-question-item"
                                  >
                                    <div class="sub-question-header">
                                      <span class="sub-question-number">（{{ subIndex + 1 }}）</span>
                                      <span class="sub-question-type">{{ subQuestion.qtype || '子题' }}</span>
                                    </div>
                                    <div class="sub-question-content" v-html="processQuestionContent(subQuestion.content)"></div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- 题目底部信息 -->
                              <div class="question-footer">
                                <div class="question-info">
                                  <span class="knowledge-point">知识点: {{ item.knowledge_name || '未知' }}</span>
                                </div>
                                <div class="question-buttons">
                                  <el-button
                                    type="text"
                                    size="mini"
                                    @click="showAnalysis(item)"
                                  >
                                    查看解析
                                  </el-button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 分页 -->
                      <pagination
                        v-show="totalCount>0"
                        :total="totalCount"
                        :page.sync="currentPage"
                        :limit.sync="pageSize"
                        @pagination="handlePagination"
                      />
                    </div>
                    
                    <!-- 空状态 -->
                    <div v-else-if="hasSearched" class="empty-state">
                      <div class="empty-icon">
                        <i class="el-icon-camera"></i>
                      </div>
                      <div class="empty-text">未找到相关题目</div>
                      <div class="empty-hint">请尝试重新拍照或调整图片清晰度</div>
                    </div>
                  </div>
                </el-card>
                
                <!-- 初始状态 -->
                <div v-else class="initial-state">
                  <div class="initial-icon">
                    <i class="el-icon-camera"></i>
                  </div>
                  <div class="initial-text">请上传题目图片开始搜题</div>
                  <div class="initial-hint">支持拍照识别、图片上传等多种方式</div>
                </div>
              </div>

              <!-- 右侧：已选信息 -->
              <div class="right-panel">
                <div class="panel-header">
                  <h3>已选信息</h3>
                  <span class="panel-subtitle">管理已选题目和创建内容</span>
        </div>
                
                <!-- 切换创建作业和试卷功能 -->
                <!-- <div class="creation-mode-switch">
                  <el-radio-group v-model="addMode" size="medium" class="mode-radio-group">
                    <el-radio label="paper" class="mode-radio">
                      <i class="el-icon-document"></i>
                      创建试卷
                    </el-radio>
                    <el-radio label="homework" class="mode-radio">
                      <i class="el-icon-edit-outline"></i>
                      创建作业
                    </el-radio>
                  </el-radio-group>
                </div> -->

                <!-- 创建模式切换 -->
                <div class="creation-mode-selector">
                  <el-radio-group v-model="currentCreationMode" size="small">
                    <el-radio label="paper">创建试卷</el-radio>
                    <el-radio label="homework">创建作业</el-radio>
                  </el-radio-group>
                </div>

                <!-- 创建表单 -->
                <div class="creation-form">
                  <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="80px">
                    <!-- 科目选择 -->
                    <el-form-item label="科目" prop="subject">
                      <el-select 
                        v-model="generateForm.subject" 
                        placeholder="请选择科目"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="subject in subjectOptions"
                          :key="subject.value"
                          :label="subject.label"
                          :value="subject.value"
                        />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item :label="currentCreationMode === 'paper' ? '试卷名称' : '作业名称'" prop="name">
                      <el-input
                        v-model="generateForm.name"
                        :placeholder="currentCreationMode === 'paper' ? '请输入试卷名称' : '请输入作业名称'"
                        maxlength="50"
                        show-word-limit
                      />
                    </el-form-item>
                  </el-form>
                </div>

                
                <!-- 已选题目统计 -->
                <div class="selected-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ sharedSelectedQuestions.length }}</div>
                    <div class="stat-label">已选题目</div>
                  </div>
                  <!-- <div class="stat-item">
                    <div class="stat-number">{{ thirdPartyForm.max_questions }}</div>
                    <div class="stat-label">目标题目</div>
                  </div> -->
                </div>

                <!-- 已选题目列表 -->
                <div class="selected-questions-preview" v-if="sharedSelectedQuestions.length > 0">
                  <div class="preview-header">
                    <span class="preview-title">已选题目预览</span>
                    <div class="preview-actions">
                      <el-button type="text" size="small" @click="previewSelectedQuestions">
                        <i class="el-icon-view"></i>
                        预览
                      </el-button>
                      <el-button type="text" size="small" @click="clearSharedSelectedQuestions">
                        <i class="el-icon-delete"></i>
                        清空
                      </el-button>
                    </div>
                  </div>
                  <div class="preview-list">
                    <div 
                      v-for="(question, index) in sharedSelectedQuestions" 
                      :key="question.sid"
                      class="preview-item"
                    >
                      <div class="preview-content">
                        <div class="preview-text" :title="question.question">
                          {{ question.question.length > 30 ? question.question.substring(0, 30) + '...' : question.question }}
                        </div>
                        <div class="preview-meta">
                          <el-tag size="mini" :type="getQuestionTypeColor(question).type">
                            {{ question.qtype || question.catename || '未知类型' }}
                          </el-tag>
                          <span class="preview-difficulty">难度: {{ getDifficultyText(question.degree) }}</span>
                        </div>
                      </div>
                      <div class="preview-actions">
                        <el-button
                          type="text" 
                          size="mini" 
                          @click="showAnalysis(question)"
                          class="analysis-btn"
                        >
                          <i class="el-icon-view"></i>
                          解析
                        </el-button>
                        <el-button
                          type="danger"
                          size="mini" 
                          icon="el-icon-delete"
                          @click="removeFromSharedSelection(question.sid)"
                          class="remove-btn"
                          style="color:azure"
                        >
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div class="empty-state" v-else>
                  <div class="empty-icon">
                    <i class="el-icon-files"></i>
                  </div>
                  <div class="empty-text">暂无已选题目</div>
                  <div class="empty-hint">搜索题目后可添加到已选列表中</div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons" v-if="sharedSelectedQuestions.length > 0">
                  <el-button 
                    type="primary" 
                    size="medium" 
                    @click="generatePaperOrHomework"
                    class="generate-btn"
                    :disabled="!generateForm.subject || !generateForm.name"
                  >
                    <i class="el-icon-plus"></i>
                    生成试卷/作业
          </el-button>
        </div>
      </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="三方题库搜题" name="thirdParty">
          <div class="search-content">
            <div class="third-party-search-layout-new">
              <!-- 第一行：题目类型及搜索规则 -->
              <div class="second-row-layout">
                <div class="search-rules-panel">
                  <div class="panel-header">
                    <h3>题目类型及搜索规则</h3>
                    <span class="panel-subtitle">配置搜索参数和题目类型分布</span>
                  </div>
                
                  <!-- 搜索规则折叠面板 -->
                  <el-collapse v-model="activeCollapse" accordion class="search-rules-collapse">
                    <el-collapse-item title="搜索规则配置" name="search-rules">
                      <el-form :model="thirdPartyForm" :rules="thirdPartyRules" ref="thirdPartyForm" label-width="110px" class="search-rules-form">
                        <!-- 难度等级选择 -->
                        <el-form-item label="难度等级" prop="difficulty">
                          <el-radio-group v-model="thirdPartyForm.difficulty" class="difficulty-radio-group">
                            <el-radio :label="0">不限</el-radio>
                            <el-radio :label="11">易</el-radio>
                            <el-radio :label="12">较易</el-radio>
                            <el-radio :label="13">中档</el-radio>
                            <el-radio :label="14">较难</el-radio>
                            <el-radio :label="15">难</el-radio>
                          </el-radio-group>
                        </el-form-item>

                        <!-- 科目选择 -->
                        <el-form-item label="选择科目">
                          <!-- 老师身份：显示固定科目 -->
                          <div v-if="userRole === 'teacher' && teacherSubject" class="teacher-subject-display">
                            <el-tag type="primary" size="medium">{{ teacherSubject }}</el-tag>
                            <span class="subject-hint">（老师专用科目）</span>
                          </div>
                          <!-- 管理员身份：显示科目选择器 -->
                          <el-select 
                            v-else-if="userRole === 'admin'"
                            v-model="thirdPartyForm.subject" 
                            placeholder="请选择科目"
                            @change="handleSubjectChange"
                            style="width: 100%"
                          >
                            <!-- 初中科目 -->
                            <el-option-group label="初中科目">
                              <el-option label="初中数学" value="初中数学"></el-option>
                              <el-option label="初中科学" value="初中科学"></el-option>
                              <el-option label="初中语文" value="初中语文"></el-option>
                              <el-option label="初中英语" value="初中英语"></el-option>
                              <el-option label="初中历史" value="初中历史"></el-option>
                              <el-option label="初中政治" value="初中政治"></el-option>
                              <el-option label="初中地理" value="初中地理"></el-option>
                            </el-option-group>
                            <!-- 高中科目 -->
                            <el-option-group label="高中科目">
                              <el-option label="高中物理" value="高中物理"></el-option>
                              <el-option label="高中数学" value="高中数学"></el-option>
                              <el-option label="高中化学" value="高中化学"></el-option>
                              <el-option label="高中生物" value="高中生物"></el-option>
                              <el-option label="高中语文" value="高中语文"></el-option>
                              <el-option label="高中英语" value="高中英语"></el-option>
                              <el-option label="高中通用" value="高中通用"></el-option>
                              <el-option label="高中历史" value="高中历史"></el-option>
                              <el-option label="高中政治" value="高中政治"></el-option>
                              <el-option label="高中地理" value="高中地理"></el-option>
                              <el-option label="高中信息" value="高中信息"></el-option>
                            </el-option-group>
                          </el-select>
                          <!-- 加载中状态 -->
                          <div v-else class="loading-subject">
                            <i class="el-icon-loading"></i>
                            <span>加载科目中...</span>
                          </div>
                        </el-form-item>
                        
                        <!-- 知识点选择 -->
                        <el-form-item label="选择知识点" prop="knowledge_name">
                          <div class="knowledge-selector">
                            <el-input
                              v-model="thirdPartyForm.knowledge_name"
                              placeholder="请点击选择知识点（必须选择最底层节点）"
                              readonly
                              class="knowledge-input"
                              @click.native="openKnowledgeDialog"
                            >
                              <el-button 
                                slot="append" 
                                icon="el-icon-folder-opened"
                                @click="openKnowledgeDialog"
                              >
                                选择知识点
                              </el-button>
                            </el-input>
                            <div v-if="thirdPartyForm.knowledge_name" class="selected-knowledge-display">
                              <el-tag type="success" size="small" closable @close="clearSelectedKnowledge" style="margin-top: 8px;">
                                {{ getKnowledgeDisplayName(thirdPartyForm.knowledge_name) }}
                              </el-tag>
                            </div>
                          </div>
                        </el-form-item>
                        
                        <!-- 题目类型分布 -->
                        <el-form-item label="题目类型分布" v-if="isSubjectLoaded && questionTypes.length > 0">
                          <div class="question-type-distribution">
                            <div class="type-item" v-for="(type, index) in questionTypes" :key="index">
                              <el-radio 
                                v-model="selectedQuestionType" 
                                :label="type" 
                                @change="handleQuestionTypeChange"
                                class="type-radio"
                              >
                                {{ type }}
                              </el-radio>
                            </div>
                          </div>
                          <div class="type-distribution-hint">
                            💡 选择题目类型后，下方搜索的题目类型为该类型
                          </div>
                        </el-form-item>
                      
                        <!-- 来源类型 -->
                        <el-form-item label="来源类型(多选)">
                          <div class="source-type-selector">
                            <div class="source-tags">
                              <div 
                                v-for="source in filteredSourceTypes" 
                                :key="source.value"
                                class="source-tag"
                                :class="{ 'active': selectedSources.includes(source.value) }"
                                @click="toggleSource(source.value)"
                              >
                                {{ source.label }}
                              </div>
                            </div>
                          </div>
                        </el-form-item>

                        <!-- 年份范围 -->
                        <el-form-item label="年份范围(多选)">
                          <div class="year-selector">
                            <div class="year-tags">
                              <div 
                                v-for="year in yearOptions" 
                                :key="year.value"
                                class="year-tag"
                                :class="{ 'active': selectedYears.includes(year.value) }"
                                @click="toggleYear(year.value)"
                              >
                                {{ year.label }}
                              </div>
                            </div>
                          </div>
                        </el-form-item>

                        <!-- 高级选项 -->
                        <el-form-item label="高级选项(多选)">
                          <div class="advanced-options-selector">
                            <div class="advanced-options-tags">
                              <div 
                                v-for="option in advancedOptions" 
                                :key="option.value"
                                class="advanced-option-tag"
                                :class="{ 'active': selectedAdvancedOptions.includes(option.value) }"
                                @click="toggleAdvancedOption(option.value)"
                              >
                                {{ option.label }}
                              </div>
                            </div>
                          </div>
                        </el-form-item>
                        
                        <!-- 搜索按钮 -->
                        <div class="search-buttons-container">
                          <el-button 
                            type="primary" 
                            size="large" 
                            :loading="thirdPartyLoading"
                            :disabled="!thirdPartyForm.knowledge_name || !selectedQuestionType"
                            @click="handleThirdPartySearch"
                            class="third-party-search-btn"
                          >
                            <i class="el-icon-search"></i> {{ thirdPartyLoading ? '搜索中...' : '开始搜题' }}
                          </el-button>
                        </div>
                      </el-form>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>

              <!-- 第二行：已选题目 -->
              <div class="first-row-layout">
                <!-- 已选题目 -->
                <div class="selected-panel">
                  <div class="panel-header">
                    <h3>已选信息</h3>
                    <span class="panel-subtitle">管理已选题目和创建内容</span>
                  </div>
                  
                  <!-- 创建模式切换 -->
                  <div class="creation-mode-selector">
                    <el-radio-group v-model="currentCreationMode" size="small">
                      <el-radio label="paper">创建试卷</el-radio>
                      <el-radio label="homework">创建作业</el-radio>
                    </el-radio-group>
                  </div>

                  <!-- 创建表单 -->
                  <div class="creation-form">
                    <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="80px">
                      <!-- 科目选择 -->
                      <el-form-item label="科目" prop="subject">
                        <el-select 
                          v-model="generateForm.subject" 
                          placeholder="请选择科目"
                          style="width: 100%"
                        >
                          <el-option
                            v-for="subject in subjectOptions"
                            :key="subject.value"
                            :label="subject.label"
                            :value="subject.value"
                          />
                        </el-select>
                      </el-form-item>
                      
                      <el-form-item :label="currentCreationMode === 'paper' ? '试卷名称' : '作业名称'" prop="name">
                        <el-input
                          v-model="generateForm.name"
                          :placeholder="currentCreationMode === 'paper' ? '请输入试卷名称' : '请输入作业名称'"
                          maxlength="50"
                          show-word-limit
                        />
                      </el-form-item>
                    </el-form>
                  </div>
                  
                  <!-- 已选题目统计 -->
                  <div class="selected-stats">
                    <div class="stat-item">
                      <div class="stat-number">{{ sharedSelectedQuestions.length }}</div>
                      <div class="stat-label">已选题目</div>
                    </div>
                  </div>

                  <!-- 已选题目列表 -->
                  <div class="selected-questions-preview" v-if="sharedSelectedQuestions.length > 0">
                    <div class="preview-header">
                      <span class="preview-title">已选题目预览</span>
                      <div class="preview-actions">
                        <el-button type="text" size="small" @click="previewSelectedQuestions">
                          <i class="el-icon-view"></i>
                          预览
                        </el-button>
                        <el-button type="text" size="small" @click="clearSharedSelectedQuestions">
                          <i class="el-icon-delete"></i>
                          清空
                        </el-button>
                      </div>
                    </div>
                    <div class="preview-list">
                      <div 
                        v-for="(question, index) in sharedSelectedQuestions" 
                        :key="question.sid"
                        class="preview-item"
                      >
                        <div class="preview-content">
                          <div class="preview-text" :title="question.question">
                            {{ question.question.length > 30 ? question.question.substring(0, 30) + '...' : question.question }}
                          </div>
                          <div class="preview-meta">
                            <el-tag size="mini" :type="getQuestionTypeColor(question).type">
                              {{ question.qtype || question.catename || '未知类型' }}
                            </el-tag>
                            <span class="preview-difficulty">难度: {{ getDifficultyText(question.degree) }}</span>
                          </div>
                        </div>
                        <div class="preview-actions">
                          <el-button
                            type="text" 
                            size="mini" 
                            @click="showAnalysis(question)"
                            class="analysis-btn"
                          >
                            <i class="el-icon-view"></i>
                            解析
                          </el-button>
                          <el-button
                            type="danger"
                            size="mini" 
                            icon="el-icon-delete"
                            @click="removeFromSharedSelection(question.sid)"
                            class="remove-btn"
                            style="color:azure"
                          >
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 空状态 -->
                  <div class="empty-state" v-else>
                    <div class="empty-icon">
                      <i class="el-icon-files"></i>
                    </div>
                    <div class="empty-text">暂无已选题目</div>
                    <div class="empty-hint">搜索题目后可添加到已选列表中</div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="action-buttons" v-if="sharedSelectedQuestions.length > 0">
                    <el-button 
                      type="primary" 
                      size="medium" 
                      @click="generatePaperOrHomework"
                      class="generate-btn"
                      :disabled="!generateForm.subject || !generateForm.name"
                    >
                      <i class="el-icon-plus"></i>
                      生成试卷/作业
                    </el-button>
                  </div>
                </div>
              </div>


              <!-- 第三行：搜索结果 -->
              <div class="third-row-layout">
                <!-- 三方题库搜题结果 -->
                <el-card class="results-card" v-if="thirdPartyResults.length > 0 || thirdPartyLoading || (thirdPartyResults.length === 0 && !thirdPartyLoading && thirdPartyForm.knowledge_name)">
                  <div slot="header" class="card-header">
                    <div class="header-content">
                      <div class="header-left">
                        <i class="el-icon-document header-icon"></i>
                        <span class="header-title">三方题库搜题结果</span>
                        <span class="result-count" v-if="!thirdPartyLoading">({{ thirdPartyTotal }} 道题目)</span>
                      </div>
                      <!-- <div class="header-right">
                        <el-button 
                          type="success" 
                          size="small" 
                          :loading="refreshLoading"
                          :disabled="!thirdPartyForm.knowledge_name || !selectedQuestionType || thirdPartyResults.length === 0"
                          @click="handleRefreshQuestions"
                          class="refresh-questions-btn-header"
                        >
                          <i class="el-icon-refresh"></i> {{ refreshLoading ? '刷新中...' : '刷新题目' }}
                        </el-button>
                      </div> -->
                    </div>
                  </div>
                  
                  <div class="search-results">
                    <!-- 加载状态 -->
                    <div v-if="thirdPartyLoading" class="loading-container">
                      <div class="loading-spinner">
                        <i class="el-icon-loading"></i>
                      </div>
                      <p class="loading-text">正在搜索题目，请稍候...</p>
                    </div>
                    
                    <!-- 搜索结果列表 - 固定高度滚动 -->
                    <div v-else-if="thirdPartyResults.length > 0" class="results-list-container">
                      <div class="results-list">
                        <div 
                          v-for="(item, index) in thirdPartyResults" 
                          :key="index" 
                          class="result-item"
                        >
                          <!-- 题目头部信息 -->
                          <div class="question-header">
                            <div class="question-meta">
                              <span class="question-type" :class="getQuestionTypeColor(item)">
                                {{ item.qtype || item.catename || '未知类型' }}
                              </span>
                              <span class="question-difficulty">
                                难度: {{ getDifficultyText(item.degree) }}
                              </span>
                              <span class="question-subject">
                                {{ item.subject_name || '未知科目' }}
                              </span>
                            </div>
                            <!-- 右侧：操作按钮 -->
                            <div class="question-actions-right">
                              <div class="action-buttons">
                                <el-button
                                  type="primary"
                                  size="small"
                                  @click="addToSharedSelection(item)"
                                  :disabled="isInSharedSelection(item.sid)"
                                  class="action-btn"
                                >
                                  <i class="el-icon-plus"></i>
                                  {{ isInSharedSelection(item.sid) ? '已添加' : '添加到已选' }}
                                </el-button>
                              </div>
                            </div>
                          </div>
                          
                          <!-- 题目主体内容 -->
                          <div class="question-main-content">
                            <!-- 左侧：题目内容 -->
                            <div class="question-content-left">
                              <!-- 题目内容 -->
                              <div class="question-content">
                                <div class="question-text" v-html="processQuestionContent(item.question)"></div>
                                
                                <!-- 选项 -->
                                <div v-if="isChoiceQuestion(item)" class="question-options">
                                  <div
                                    v-for="(option, optIndex) in parseOptions(item.options)"
                                    :key="optIndex"
                                    class="option-item"
                                  >
                                    <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                                    <span class="option-content" v-html="processOptionContent(option, optIndex)"></span>
                                  </div>
                                </div>
                                
                                <!-- 子题目 -->
                                <div v-if="item.children && parseChildren(item.children).length > 0" class="sub-questions">
                                  <div
                                    v-for="(subQuestion, subIndex) in parseChildren(item.children)"
                                    :key="subIndex"
                                    class="sub-question-item"
                                  >
                                    <div class="sub-question-header">
                                      <span class="sub-question-number">（{{ subIndex + 1 }}）</span>
                                      <span class="sub-question-type">{{ subQuestion.qtype || '子题' }}</span>
                                    </div>
                                    <div class="sub-question-content" v-html="processQuestionContent(subQuestion.content)"></div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- 题目底部信息 -->
                              <div class="question-footer">
                                <div class="question-info">
                                  <span class="knowledge-point">知识点: {{ item.knowledge_name || '未知' }}</span>
                                </div>
                                <div class="question-buttons">
                                  <el-button
                                    type="text"
                                    size="mini"
                                    @click="showAnalysis(item)"
                                  >
                                    查看解析
                                  </el-button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 手动分页按钮 -->
                      <div class="manual-pagination" v-show="thirdPartyTotal > 0">
                        <div class="pagination-info">
                          <span>第 {{ thirdPartyForm.page }} 页</span>
                        </div>
                        <div class="pagination-buttons">
                          <el-button 
                            type="primary" 
                            size="small" 
                            :disabled="thirdPartyForm.page <= 1"
                            @click="handlePreviousPage"
                            icon="el-icon-arrow-left"
                          >
                            上一页
                          </el-button>
                          <el-button 
                            type="primary" 
                            size="small" 
                            @click="handleNextPage"
                            icon="el-icon-arrow-right"
                          >
                            下一页
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 已选题目预览弹窗 -->
    <el-dialog
      :title="`${currentCreationMode === 'paper' ? '试卷' : '作业'}预览 - ${generateForm.name || '未命名'}`"
      :visible.sync="previewDialogVisible"
      width="80%"
      height="80vh"
      :before-close="handlePreviewClose"
      class="preview-dialog"
    >
      <div class="preview-dialog-content" style="height: 70vh; overflow-y: auto; padding: 5px;">
        <div class="preview-header-info">
          <div class="preview-title">
            <span class="label">类型：</span>
            <el-tag :type="currentCreationMode === 'paper' ? 'primary' : 'success'">
              {{ currentCreationMode === 'paper' ? '试卷' : '作业' }}
            </el-tag>
          </div>
          <div class="preview-subject">
            <span class="label">科目：</span>
            <span>{{ generateForm.subject || '未选择' }}</span>
          </div>
          <div class="preview-name">
            <span class="label">名称：</span>
            <span>{{ generateForm.name || '未填写' }}</span>
          </div>
          <div class="preview-count">
            <span class="label">题目数量：</span>
            <span>{{ sharedSelectedQuestions.length }}</span>
          </div>
        </div>
        
        <div class="preview-questions-list">
          <div 
            v-for="(question, index) in sharedSelectedQuestions" 
          :key="question.sid"
            class="preview-question-item"
          >
            <div class="question-header">
              <div class="question-number">第{{ index + 1 }}题</div>
              <div class="question-meta">
                <el-tag size="mini" :type="getQuestionTypeColor(question).type">
                  {{ question.qtype || question.catename || '未知类型' }}
                </el-tag>
              <span class="question-difficulty">难度: {{ getDifficultyText(question.degree) }}</span>
                <span class="question-subject">科目: {{ question.subject_name || '未知' }}</span>
            </div>
          </div>
            
            <div class="question-content">
              <div class="question-text" v-html="processQuestionContent(question.question)"></div>
              
              <!-- 选项 -->
              <div v-if="isChoiceQuestion(question)" class="question-options">
                <div
                  v-for="(option, optIndex) in parseOptions(question.options)"
                  :key="optIndex"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  <span class="option-content" v-html="processOptionContent(option, optIndex)"></span>
                </div>
              </div>
              
              <!-- 子题目 -->
              <div v-if="question.children && parseChildren(question.children).length > 0" class="sub-questions">
                <div
                  v-for="(subQuestion, subIndex) in parseChildren(question.children)"
                  :key="subIndex"
                  class="sub-question-item"
                >
                  <div class="sub-question-header">
                    <span class="sub-question-number">（{{ subIndex + 1 }}）</span>
                    <span class="sub-question-type">{{ subQuestion.qtype || '子题' }}</span>
                  </div>
                  <div class="sub-question-content" v-html="processQuestionContent(subQuestion.content)"></div>
                </div>
              </div>
            </div>
            
            <div class="question-footer">
              <div class="question-info">
                <span class="knowledge-point">知识点: {{ question.knowledge_name || '未知' }}</span>
              </div>
              <div class="question-actions">
                <el-button
                  type="text"
                  size="mini"
                  @click="showAnalysis(question)"
                >
                  查看解析
                </el-button>
            <el-button
              type="danger"
              size="mini"
                  @click="removeFromSharedSelection(question.sid)"
            >
              移除
            </el-button>
          </div>
        </div>
      </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="generatePaperOrHomework"
          :disabled="!generateForm.subject || !generateForm.name"
        >
          {{ addMode === 'paper' ? '生成试卷' : '创建作业' }}
        </el-button>
      </div>
    </el-dialog>
    
    <!-- 生成试卷/作业弹窗 -->
    <el-dialog
      :title="currentCreationMode === 'paper' ? '生成试卷' : '创建作业'"
      :visible.sync="generateDialogVisible"
      width="500px"
      append-to-body
      @close="resetGenerateForm"
    >
      <el-form :model="generateForm" :rules="generateRules" ref="generateForm" label-width="80px">
        <el-form-item label="科目" prop="subject">
          <el-select v-model="generateForm.subject" placeholder="请选择科目" style="width: 100%">
            <el-option
              v-for="item in subjectOptions"
              :key="item.subjectCode"
              :label="item.subjectName"
              :value="item.subjectCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="addMode === 'paper' ? '试卷名称' : '作业名称'" prop="name">
          <el-input v-model="generateForm.name" :placeholder="addMode === 'paper' ? '请输入试卷名称' : '请输入作业名称'" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="generating"
          @click="confirmGenerate"
        >
          {{ generating ? '生成中...' : '确认生成' }}
        </el-button>
      </div>
    </el-dialog>
    
    <!-- 知识点选择弹窗 -->
    <el-dialog
      title="选择知识点"
      :visible.sync="knowledgeDialogVisible"
      width="600px"
      append-to-body
      class="knowledge-dialog"
    >
      <div class="knowledge-dialog-content">
        <div class="knowledge-dialog-hint">
          <i class="el-icon-warning"></i>
          <span>请选择最底层的知识点节点（没有子节点的节点）才能进行搜索</span>
        </div>
        <div v-if="chapterOptions.length === 0" class="loading-placeholder">
          <el-empty description="正在加载知识点列表..." :image-size="80">
            <el-button type="primary" @click="loadChapterList">重新加载</el-button>
          </el-empty>
        </div>
        <el-tree
          v-else
          ref="knowledgeTree"
          :data="chapterOptions"
          :props="cascaderProps"
          node-key="value"
          :expand-on-click-node="true"
          @node-click="handleTreeNodeClick"
          :highlight-current="true"
          :default-expand-all="false"
          class="knowledge-tree"
        >
          <span 
            class="custom-tree-node" 
            slot-scope="{ node, data }" 
            :class="{ 'leaf-node': isLeafNode(node), 'non-leaf-node': !isLeafNode(node) }"
          >
            <span>{{ node.label }}</span>
            <span v-if="!isLeafNode(node)" class="non-leaf-hint">（请选择子节点）</span>
          </span>
        </el-tree>
        <div v-if="thirdPartyForm.knowledge_name" class="selected-knowledge-display">
          <div class="selected-label">已选择：</div>
          <el-tag type="success" size="medium">
            {{ getKnowledgeDisplayName(thirdPartyForm.knowledge_name) }}
          </el-tag>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="knowledgeDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmKnowledgeSelection"
          :disabled="!thirdPartyForm.knowledge_name"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
    
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
              <span class="option-content" v-html="processOptionContent(option, index)"></span>
            </div>
          </div>

          <!-- 答案 -->
          <div class="answer-section">
            <h4>正确答案</h4>
            <div class="answer-display">
              <span v-if="questionDetail.DisplayAnswer" class="answer-tag correct">
                <span v-html="processAnswerContent(questionDetail.DisplayAnswer)"></span>
              </span>
              <div v-else-if="questionDetail.Method && questionDetail.CateName === '解答题'" class="answer-text">
                <div v-html="processAnswerContent(extractAnswerFromMethod(questionDetail.Method))"></div>
              </div>
            </div>
          </div>

          <!-- 解析 -->
          <div v-if="questionDetail.Method" class="analysis-section">
            <h4>解析</h4>
            <div class="analysis-content" v-html="processAnalysisContent(questionDetail.Method)"></div>
          </div>

          <!-- 分析 -->
          <div v-if="questionDetail.Analyse" class="analyse-section">
            <h4>分析</h4>
            <div class="analyse-content" v-html="processAnalysisContent(questionDetail.Analyse)"></div>
          </div>

          <!-- 讨论 -->
          <div v-if="questionDetail.Discuss" class="discuss-section">
            <h4>讨论</h4>
            <div class="discuss-content" v-html="processAnalysisContent(questionDetail.Discuss)"></div>
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
import { thirdPartySearch, searchProblems, ocrSearch, getQuestionTypeDistribution, getGradeAndSubject } from '@/api/system/problems'
import { getQuestionDetail } from '@/api/system/paper'
import { parseMathFormula } from '@/utils/mathFormula'
import { sysGetchaptermap } from "@/api/system/knowledge"
import latexRenderer from '@/utils/latexRenderer'

export default {
  name: 'SearchQuestions',
  data() {
    return {
      activeTab: 'keyword',
      activeCollapse: 'search-rules', // 折叠面板激活状态
      knowledgeDialogVisible: false, // 知识点选择弹窗控制
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
      // 关键词搜索题目类型相关
      keywordQuestionTypes: [], // 关键词搜索的题目类型列表
      loadingQuestionTypes: false, // 加载题目类型状态
       // 解析弹窗
       analysisVisible: false,
       currentQuestion: null,
       questionDetail: null,
       loadingDetail: false,
       // 三方题库搜索表单
       thirdPartyForm: {
         subject: '',
         knowledge_name: '', // 搜题时使用：叶子节点名称
         knowledge_full_path: '', // 添加到试卷/作业时使用：完整路径
         question_type_distribution: {},
         difficulty: 0,
         max_questions: 10, // 默认刷新10道题
         gc: false,
         sc: false,
         rc: false,
         yc: false,
         ec: false,
         er: false,
         rg: '',
         so: '',
         yr: '',
         page: 1 // 当前页码
       },
       thirdPartyRules: {
         subject: [
           { required: true, message: '请选择科目', trigger: 'change' }
         ],
         knowledge_name: [
           { required: true, message: '请选择知识点（必须选择最底层节点）', trigger: 'change' }
         ],
         difficulty: [
           { required: true, message: '请选择难度等级', trigger: 'change' }
         ]
       },
       // 来源类型选择器
       sourceTypes: [
         { label: '全部', value: '全部' },
         { label: '中考真题', value: '中考真题' },
         { label: '自主招生', value: '自主招生' },
         { label: '中考模拟', value: '中考模拟' },
         { label: '中考复习', value: '中考复习' },
         { label: '期末试题', value: '期末试题' },
         { label: '期中试题', value: '期中试题' },
         { label: '月考试题', value: '月考试题' },
         { label: '开学试题', value: '开学试题' },
         { label: '单元测验', value: '单元测验' },
         { label: '同步练习', value: '同步练习' },
         { label: '竞赛试题', value: '竞赛试题' },
         { label: '假期作业', value: '假期作业' },
         { label: '初高衔接', value: '初高衔接' }
       ],
       selectedSources: ['全部'],
       enableMultipleSource: false,
       // 年份选择器
       yearOptions: [
         { label: '全部', value: '全部' },
         { label: '2025', value: '2025' },
         { label: '2024', value: '2024' },
         { label: '2023', value: '2023' },
         { label: '2022', value: '2022' },
         { label: '2021', value: '2021' },
         { label: '更早', value: '更早' }
       ],
       selectedYears: ['全部'],
       enableMultipleYear: false,
       
       // 高级选项选择器
       advancedOptions: [
         { label: '全部', value: 'all' },
         { label: '好题集', value: 'gc' },
         { label: '真题集', value: 'sc' },
         { label: '常考题', value: 'rc' },
         { label: '压轴题', value: 'yc' },
         { label: '易错题', value: 'ec' },
         { label: '用户错题', value: 'er' }
       ],
       selectedAdvancedOptions: ['all'],
       
       // 搜题结果弹窗
       searchResultsDialogVisible: false,
       sharedSelectedQuestions: [], // 共享的已选题目
       currentCreationMode: 'paper', // 当前创建模式：paper-试卷，homework-作业
       // 知识点选项
       chapterOptions: [],
       cascaderProps: {
         value: 'value',
         label: 'label',
         children: 'children',
         checkStrictly: true, // 允许选择任意节点，显示单选圆圈
         emitPath: false, // 只返回选中的值
         expandTrigger: 'click', // 点击时展开
         multiple: false // 单选模式
       },
       selectedKnowledgePath: [], // 存储选中的知识点路径
       // 题目类型分布 - 动态获取
       questionTypes: [],
       questionTypeDistribution: {}, // 存储题型分布数据
       // 用户身份和科目相关
       userRole: 'teacher', // 'teacher' 或 'admin'
       teacherSubject: '', // 老师专用科目
       isSubjectLoaded: false, // 科目是否已加载
       // 三方题库搜题相关
       thirdPartyLoading: false, // 搜题加载状态
       refreshLoading: false, // 刷新题目加载状态
       thirdPartyResults: [], // 搜题结果
       thirdPartyTotal: 0, // 搜题结果总数
       addMode: 'paper', // 添加模式
       subjectOptions: [], // 科目选项
       selectedPaperQuestions: [], // 已选试卷题目
       selectedHomeworkQuestions: [], // 已选作业题目
       generateDialogVisible: false, // 生成试卷/作业弹窗可见性
       previewDialogVisible: false, // 预览弹窗可见性
       generateForm: {
         subject: '',
         name: ''
       },
       generateRules: {
         subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
         name: [{ required: true, message: '请输入名称', trigger: 'change' }]
       },
       generating: false, // 生成中状态
       selectedQuestionType: '' // 选中的题目类型
    }
  },
  computed: {
    // 根据科目过滤来源类型
    filteredSourceTypes() {
      const isHighSchool = this.thirdPartyForm.subject && this.thirdPartyForm.subject.startsWith('高中')
      
      if (isHighSchool) {
        // 高中科目：隐藏前四项（中考真题、自主招生、中考模拟、中考复习）
        return this.sourceTypes.filter(source => 
          !['中考真题', '自主招生', '中考模拟', '中考复习'].includes(source.value)
        )
      } else {
        // 初中科目：显示所有来源类型
        return this.sourceTypes
      }
    }
  },
  watch: {
    // 监听科目变化，自动更新来源类型选择
    'thirdPartyForm.subject'(newSubject) {
      if (newSubject) {
        // 科目改变时，默认选择"全部"选项
        this.selectedSources = ['全部']
        
        console.log('科目变化，默认选择全部:', this.selectedSources)
      }
    }
  },
  created() {
    this.loadChapterList()
    this.loadUserSubject()
    this.loadSubjectOptions() // 加载科目选项
    
    // 初始化高级选项表单值
    this.updateAdvancedOptionsFormValue()
    
    // 延迟检查知识点列表是否加载成功
    setTimeout(() => {
      this.ensureChapterListLoaded()
    }, 2000)
  },
  methods: {
    // 标签页切换
    handleTabClick(tab) {
      console.log('切换到:', tab.name)
      
      // 清空搜索结果和搜索状态
      this.searchResults = []
      this.thirdPartyResults = []
      this.totalCount = 0
      this.currentPage = 1
      this.hasSearched = false
      this.loading = false
      this.photoLoading = false
      this.thirdPartyLoading = false
      this.refreshLoading = false
      
      // 清空搜索表单
      if (tab.name === 'keyword') {
        // 关键词搜索：清空搜索条件
        this.keywordQuery = ''
        // 老师身份不清空科目，管理员身份清空科目
        if (this.userRole === 'admin') {
          this.subjectType = ''
        }
        this.minDegree = 0
        this.maxDegree = 1
        this.questionType = ''
        this.selectedSources = ['全部']
        this.selectedYears = ['全部']
        this.selectedAdvancedOptions = ['all']
        // 清空关键词搜索题目类型
        this.keywordQuestionTypes = []
      } else if (tab.name === 'photo') {
        // 拍照搜题：清空图片和科目选择
        this.photoImage = ''
        this.photoFile = null
        // 注意：不清空 photoSubjectType，因为老师身份时这是固定的
      } else if (tab.name === 'thirdParty') {
        // 三方题库搜题：清空表单
        this.thirdPartyForm.knowledge_name = ''
        this.thirdPartyForm.knowledge_full_path = ''
        this.thirdPartyForm.question_type_distribution = {}
        this.thirdPartyForm.difficulty = 0
        this.thirdPartyForm.gc = false
        this.thirdPartyForm.sc = false
        this.thirdPartyForm.rc = false
        this.thirdPartyForm.yc = false
        this.thirdPartyForm.ec = false
        this.thirdPartyForm.er = false
        this.thirdPartyForm.rg = ''
        this.thirdPartyForm.so = ''
        this.thirdPartyForm.yr = ''
        this.selectedQuestionType = ''
        this.thirdPartyTotal = 0
        this.selectedKnowledgePath = []
        this.questionTypes = []
        this.questionTypeDistribution = {}
        // 不清空知识点列表，保持已加载的数据
        // this.chapterOptions = []
        this.isSubjectLoaded = false
        
        // 重新加载知识点列表和科目信息
        this.loadChapterList()
        this.loadUserSubject()
        this.loadSubjectOptions()
      }
      
      // 清空已选题目
      this.clearSharedSelectedQuestions()
      
      // 重置生成表单
      this.resetGenerateForm()
      
      console.log('已清空搜索结果和搜索状态')
    },
    
    // 知识点节点点击处理（仅用于叶子节点）
    handleKnowledgeNodeClick(node, data) {
      // 再次检查是否为叶子节点（双重验证）
      const isLeaf = this.isLeafNode(node)
      
      if (!isLeaf) {
        // 不应该到这里，但为了安全还是检查一下
        // this.$message.warning('请选择最底层的知识点节点！只有叶子节点（没有子节点的节点）才能进行搜索。')
        // 清空之前的选择
        this.thirdPartyForm.knowledge_name = ''
        this.thirdPartyForm.knowledge_full_path = ''
        this.selectedKnowledgePath = []
        // 清除树的高亮状态
        this.$nextTick(() => {
          if (this.$refs.knowledgeTree) {
            this.$refs.knowledgeTree.setCurrentKey(null)
          }
        })
        return
      }
      
      // 是叶子节点，允许选择
      // el-tree 中 node.data 是节点数据对象，包含 value 和 label
      const nodeValue = data?.value || node.data?.value || node.value || node.label
      const nodeLabel = node.label || data?.label || node.data?.label
      
      // 构建完整路径
      let fullPath = ''
      try {
        // 尝试使用 node 对象构建路径
        if (node.parent) {
          fullPath = this.buildKnowledgeFullPath(node)
        } else {
          // 如果无法从 node 构建，尝试从数据构建
          fullPath = this.buildKnowledgeFullPathFromValue(nodeValue)
        }
      } catch (e) {
        console.warn('构建路径失败，使用标签:', e)
        fullPath = nodeLabel
      }
      
      this.thirdPartyForm.knowledge_name = nodeLabel
      this.thirdPartyForm.knowledge_full_path = fullPath || nodeLabel
      
      // 设置树的高亮状态为当前选中的叶子节点
      this.$nextTick(() => {
        if (this.$refs.knowledgeTree && nodeValue) {
          this.$refs.knowledgeTree.setCurrentKey(nodeValue)
        }
      })
      
      // 不自动触发搜索，让用户手动点击搜索按钮

      
      // 如果在弹窗中选择，给出提示
      if (this.knowledgeDialogVisible) {
        this.$message.success('知识点选择成功')
      }
    },
    
    // 打开知识点选择弹窗
    openKnowledgeDialog() {
      this.ensureChapterListLoaded()
      this.knowledgeDialogVisible = true
    },
    
    // 确认知识点选择
    confirmKnowledgeSelection() {
      if (!this.thirdPartyForm.knowledge_name) {
        this.$message.warning('请先选择知识点')
        return
      }
      
      // 验证当前选择的知识点是否为叶子节点
      // 通过遍历树数据查找对应的节点并验证
      const isLeaf = this.validateSelectedKnowledgeIsLeaf()
      if (!isLeaf) {
        // this.$message.warning('请选择最底层的知识点节点！只有叶子节点（没有子节点的节点）才能进行搜索。')
        // 清空选择
        this.thirdPartyForm.knowledge_name = ''
        this.thirdPartyForm.knowledge_full_path = ''
        this.selectedKnowledgePath = []
        return
      }
      
      this.knowledgeDialogVisible = false
      this.$message.success('知识点选择成功')
    },
    
    // 验证当前选择的知识点是否为叶子节点
    validateSelectedKnowledgeIsLeaf() {
      if (!this.thirdPartyForm.knowledge_name || !this.chapterOptions || this.chapterOptions.length === 0) {
        return false
      }
      
      // 递归查找节点并验证是否为叶子节点
      const findAndValidateNode = (nodes, targetName) => {
        for (let node of nodes) {
          if (node.label === this.thirdPartyForm.knowledge_name) {
            // 找到匹配的节点，检查是否为叶子节点
            const isLeaf = !node.children || node.children.length === 0
            return isLeaf
          }
          if (node.children && node.children.length > 0) {
            const result = findAndValidateNode(node.children, targetName)
            if (result !== null) {
              return result
            }
          }
        }
        return null
      }
      
      const result = findAndValidateNode(this.chapterOptions, this.thirdPartyForm.knowledge_name)
      return result === true
    },
    
    // 从节点值构建完整路径（备用方法）
    buildKnowledgeFullPathFromValue(nodeValue) {
      if (!nodeValue || !this.chapterOptions) return ''
      
      const findPath = (nodes, targetValue, path = []) => {
        for (let node of nodes) {
          const currentPath = [...path, node.label]
          if (node.value === targetValue) {
            return currentPath.join(' > ')
          }
          if (node.children && node.children.length > 0) {
            const result = findPath(node.children, targetValue, currentPath)
            if (result) return result
          }
        }
        return null
      }
      
      return findPath(this.chapterOptions, nodeValue) || ''
    },
    
    // 判断节点是否为叶子节点
    isLeafNode(node) {
      if (!node) return false
      // 检查节点是否有子节点
      // node.childNodes 是 el-tree 的内部属性，表示子节点数组
      // node.data 是节点数据，可能包含 children 属性
      const hasChildren = (node.childNodes && node.childNodes.length > 0) || 
                         (node.data && node.data.children && node.data.children.length > 0) ||
                         (node.children && node.children.length > 0)
      return !hasChildren
    },
    
    // 处理树节点点击事件（统一处理，阻止非叶子节点选择）
    handleTreeNodeClick(node, data, component) {
      // 检查是否为叶子节点
      const isLeaf = this.isLeafNode(node)
      
      if (!isLeaf) {
        // 非叶子节点：不允许选择
        // this.$message.warning('请选择最底层的知识点节点！只有叶子节点（没有子节点的节点）才能进行搜索。')
        // 清空之前的选择
        this.thirdPartyForm.knowledge_name = ''
        this.thirdPartyForm.knowledge_full_path = ''
        this.selectedKnowledgePath = []
        // 清除树的高亮状态
        this.$nextTick(() => {
          if (this.$refs.knowledgeTree) {
            this.$refs.knowledgeTree.setCurrentKey(null)
          }
        })
        return
      }
      
      // 叶子节点：允许选择
      this.handleKnowledgeNodeClick(node, data)
    },
    
    // 处理知识点选择错误（公共方法）
    // errorOrResponse: 可以是错误对象或响应对象
    // defaultErrorMessage: 默认错误消息（当不是知识点错误时显示）
    handleKnowledgeError(errorOrResponse, defaultErrorMessage = '操作失败，请稍后重试') {
      let errorMessage = ''
      
      // 如果是错误对象
      if (errorOrResponse?.response?.data) {
        errorMessage = errorOrResponse.response.data.detail || 
                      errorOrResponse.response.data.msg || 
                      errorOrResponse.response.data.message || ''
      } else if (errorOrResponse?.message) {
        // 错误对象的 message 属性
        errorMessage = errorOrResponse.message
      } else if (typeof errorOrResponse === 'string') {
        // 直接是字符串
        errorMessage = errorOrResponse
      } else if (errorOrResponse) {
        // 响应对象（可能包含 detail、msg、message）
        errorMessage = errorOrResponse.detail || 
                      errorOrResponse.msg || 
                      errorOrResponse.message || 
                      ''
      }
      
      // 转换为字符串进行匹配
      const errorString = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      
      // 检查错误信息是否包含知识点相关的错误（如NoneType、split等）
      if (errorString.includes('NoneType') || 
          errorString.includes('split') || 
          errorString.includes('知识点') ||
          errorString.includes('获取试题时出错')) {
        this.$message.warning('请选择子节点知识点')
        return true // 返回 true 表示是知识点错误
      } else {
        this.$message.error(defaultErrorMessage)
        return false // 返回 false 表示不是知识点错误
      }
    },
    
    // 确保知识点列表已加载
    ensureChapterListLoaded() {
      if (!this.chapterOptions || this.chapterOptions.length === 0) {
        console.log('知识点列表为空，重新加载...')
        this.loadChapterList()
      }
    },
    
    // 获取知识点显示名称
    getKnowledgeDisplayName(knowledgeName) {
      return knowledgeName
    },
    
    // 构建知识点完整路径
    buildKnowledgeFullPath(node) {
      if (!node) return ''
      let path = node.label
      let parent = node.parent
      while (parent) {
        path = parent.label + ' > ' + path
        parent = parent.parent
      }
      return path
    },
    
    // 清除已选知识点
    clearSelectedKnowledge() {
      this.thirdPartyForm.knowledge_name = ''
      this.thirdPartyForm.knowledge_full_path = ''
    },
    
    // 题目类型变化处理 - 单选模式：选择对应题型时，将其他类型题目重置为0
    handleQuestionTypeChange(value) {
      console.log('=== 题目类型变化处理开始 ===')
      console.log('选中值:', value)
      console.log('变化前的分布:', JSON.parse(JSON.stringify(this.thirdPartyForm.question_type_distribution)))
      console.log('当前选中的题目类型:', this.selectedQuestionType)
      
      // 确保是单选模式：创建新的分布对象，选中类型为5，其他类型为0
      const newDistribution = {}
      Object.keys(this.thirdPartyForm.question_type_distribution).forEach(type => {
        if (type === value) {
          // 选中的题目类型数量为5道题
          newDistribution[type] = 10
          console.log(`✅ 设置题目类型 "${type}" 数量为: 10`)
        } else {
          // 其他题目类型数量重置为0
          newDistribution[type] = 0
          console.log(`🔄 重置题目类型 "${type}" 数量为: 0`)
        }
      })
      
      // 更新选中的题目类型
      this.selectedQuestionType = value
      
      // 直接赋值整个对象，触发Vue响应式更新
      this.thirdPartyForm.question_type_distribution = newDistribution
      
      console.log('变化后的分布:', this.thirdPartyForm.question_type_distribution)
      console.log('更新后的选中题目类型:', this.selectedQuestionType)
      
      // 验证单选逻辑：确保只有一个类型的数量为5，其他都为0
      const selectedTypes = Object.entries(newDistribution).filter(([type, count]) => count > 0)
      if (selectedTypes.length === 1 && selectedTypes[0][1] === 10) {
        console.log('✅ 单选逻辑验证通过：只有一个题目类型被选中，数量为10')
      } else {
        console.error('❌ 单选逻辑验证失败：', selectedTypes)
      }
      
      // 验证数据类型
      const allValid = Object.values(this.thirdPartyForm.question_type_distribution).every(count => {
        const isValid = typeof count === 'number' && count >= 0
        if (!isValid) {
          console.error(`❌ 类型 ${count} 无效:`, count, '类型:', typeof count)
        }
        return isValid
      })
      
      if (!allValid) {
        console.error('❌ 题目类型分布数据类型验证失败')
      } else {
        console.log('✅ 题目类型分布数据类型验证通过')
      }
      
      console.log('=== 题目类型变化处理结束 ===')
    },
    
    // 切换来源类型选择
    toggleSource(sourceValue) {
      if (sourceValue === '全部') {
        // 处理"全部"选项
        const isHighSchool = this.thirdPartyForm.subject && this.thirdPartyForm.subject.startsWith('高中')
        
        if (isHighSchool) {
          // 高中科目：全部选项不包括前四项，也不包括"全部"本身
          this.selectedSources = this.filteredSourceTypes
            .filter(source => source.value !== '全部')
            .map(source => source.value)
        } else {
          // 初中科目：全部选项包括所有来源类型，但不包括"全部"本身
          this.selectedSources = this.sourceTypes
            .filter(source => source.value !== '全部')
            .map(source => source.value)
        }
      } else {
        // 处理其他选项
        if (this.enableMultipleSource) {
          // 多选模式
          const index = this.selectedSources.indexOf(sourceValue)
          if (index > -1) {
            this.selectedSources.splice(index, 1)
          } else {
            this.selectedSources.push(sourceValue)
          }
        } else {
          // 单选模式
          this.selectedSources = [sourceValue]
        }
      }
      console.log('已选来源类型:', this.selectedSources)
    },
    
    // 切换年份选择
    toggleYear(yearValue) {
      if (this.enableMultipleYear) {
        // 多选模式
        const index = this.selectedYears.indexOf(yearValue)
        if (index > -1) {
          this.selectedYears.splice(index, 1)
        } else {
          this.selectedYears.push(yearValue)
        }
      } else {
        // 单选模式
        this.selectedYears = [yearValue]
      }
      console.log('已选年份范围:', this.selectedYears)
    },
    

    
    // 加载知识点列表
    loadChapterList() {
      console.log('开始加载知识点列表...')
      sysGetchaptermap().then(res => {
        console.log('知识点API响应:', res)
        if (res.code === 200) {
          // API返回的数据已经是正确的树形结构，直接使用
          this.chapterOptions = res.data || []
          console.log('知识点数据加载成功:', this.chapterOptions)
          console.log('知识点数据结构:', JSON.stringify(this.chapterOptions, null, 2))
        } else {
          console.error('获取知识点列表失败:', res)
          this.chapterOptions = []
        }
      }).catch(error => {
        console.error('获取知识点列表失败:', error)
        this.chapterOptions = []
        // 添加一些默认知识点数据，避免界面空白
        this.chapterOptions = [
          {
            label: '第一章 基础概念',
            value: 'chapter1',
            children: [
              { label: '1.1 基本定义', value: '1.1' },
              { label: '1.2 核心原理', value: '1.2' }
            ]
          },
          {
            label: '第二章 进阶应用',
            value: 'chapter2',
            children: [
              { label: '2.1 实际应用', value: '2.1' },
              { label: '2.2 案例分析', value: '2.2' }
            ]
          }
        ]
        console.log('使用默认知识点数据:', this.chapterOptions)
      })
    },
    
    // 构建知识点树形结构 - 不再需要，API直接返回树形结构
    buildChapterTree(chapterList) {
      // API返回的数据已经是正确的树形结构，直接返回
      return chapterList
    },
    // 扁平化知识点数据，用于el-select
    flattenChapterData(chapterList) {
      const result = []
      const flatten = (items, parentLabel = '') => {
        items.forEach(item => {
          if (item.children && item.children.length > 0) {
            // 如果有子节点，递归处理
            flatten(item.children, parentLabel + item.label + ' > ')
          } else {
            // 如果是叶子节点，添加到结果中
            result.push({
              label: parentLabel + item.label,
              value: item.value || item.label
            })
          }
        })
      }
      flatten(chapterList)
      return result
    },
    // 关键词搜索
    async handleKeywordSearch() {
      if (!this.keywordQuery.trim()) {
        this.$message.warning('请输入搜索关键词')
        return
      }
      
      // 只有在第一次搜索时才重置页码，分页时保持当前页码
      if (!this.hasSearched) {
        this.currentPage = 1
      }
      
      this.hasSearched = true
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
      
      // 根据用户身份确定科目
      let searchSubject = ''
      if (this.userRole === 'teacher') {
        if (!this.teacherSubject) {
          this.$message.warning('老师科目未设置，请先配置科目信息')
          return
        }
        searchSubject = this.teacherSubject
      } else if (this.userRole === 'admin') {
        if (!this.photoSubjectType) {
          this.$message.warning('请选择课程')
          return
        }
        searchSubject = this.photoSubjectType
      } else {
        this.$message.warning('用户身份未识别')
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
        const response = await ocrSearch(formData, searchSubject)
        
        console.log('OCR响应:', response)
        console.log('使用科目:', searchSubject)
        
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
    
    // 处理题目内容 - 使用latexRenderer进行完整的LaTeX渲染
    processQuestionContent(content) {
      if (!content) return ''
      
      try {
        // 使用latexRenderer的processQuestionContent方法进行完整的LaTeX渲染
        return latexRenderer.processQuestionContent(content)
      } catch (error) {
        console.warn('处理题目内容时出错:', error)
        return content || ''
      }
    },

    // 解码HTML实体
    decodeHtmlEntities(text) {
      if (!text) return '';
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    },
    
    // 处理选项内容，移除重复前缀并渲染数学公式
    processOptionContent(content, index) {
      if (!content) return ''
      
      try {
        // 使用latexRenderer的processOptionContent方法
        return latexRenderer.processOptionContent(content, index)
      } catch (error) {
        console.warn('处理选项内容时出错:', error)
        return content || ''
      }
    },
    processAnswerContent(content) {
      if (!content) return ''
      
      try {
        // 先解码HTML实体
        let processedContent = this.decodeHtmlEntities(content)
        
        // 使用 mathFormula.js 处理数学公式
        processedContent = parseMathFormula(processedContent)
        
        return processedContent
      } catch (error) {
        console.warn('处理答案内容时出错:', error)
        return content || ''
      }
    },

    // 处理解析/分析/讨论内容，使用latexRenderer进行完整的LaTeX渲染
    processAnalysisContent(content) {
      if (!content) return ''
      
      try {
        // 使用latexRenderer的processAnalysisContent方法进行完整的LaTeX渲染
        return latexRenderer.processAnalysisContent(content)
      } catch (error) {
        console.warn('处理解析内容时出错:', error)
        return content || ''
      }
    },

    // 判断是否为选择题
    isChoiceQuestion(question) {
      if (!question) return false
      
      const qtype = question.qtype || question.questionType || question.type || question.category || ''
      const catename = question.catename || ''
      
      // 检查题目类型
      if (qtype.includes('选择') || catename.includes('选择')) {
        return true
      }
      
      // 检查是否有选项
      const options = question.options || '[]'
      if (options && options !== '[]') {
        try {
          const parsedOptions = JSON.parse(options)
          return Array.isArray(parsedOptions) && parsedOptions.length > 0
        } catch (error) {
          return false
        }
      }
      
      return false
    },

    // 解析选择题选项
    parseOptions(options) {
      if (!options) return []
      
      try {
        // 如果是字符串，尝试解析JSON
        if (typeof options === 'string') {
          const parsed = JSON.parse(options)
          if (Array.isArray(parsed)) {
            return parsed
          }
        }
        
        // 如果是数组，直接返回
        if (Array.isArray(options)) {
          return options
        }
        
        return []
      } catch (error) {
        console.warn('解析选项失败:', error, options)
        return []
      }
    },
    
    // 解析子题目
    parseChildren(children) {
      if (!children) return []
      
      try {
        // 如果是字符串，尝试解析JSON
        if (typeof children === 'string') {
          const parsed = JSON.parse(children)
          if (Array.isArray(parsed)) {
            return parsed
          }
        }
        
        // 如果是数组，直接返回
        if (Array.isArray(children)) {
          return children
        }
        
        return []
      } catch (error) {
        console.warn('解析子题目失败:', error, children)
        return []
      }
    },
    
    // 三方题库搜题
    async handleThirdPartySearch() {
      try {
        console.log('=== 开始三方题库搜题 ===')
        
        // 表单验证
        const valid = await this.$refs.thirdPartyForm.validate()
        if (!valid) {
          console.log('表单验证失败')
          return
        }
        
        // 检查必填字段
        if (!this.thirdPartyForm.subject) {
          this.$message.error('请选择科目')
          return
        }
        
        if (!this.thirdPartyForm.knowledge_name) {
          this.$message.error('请选择知识点')
          return
        }
        
        if (!this.selectedQuestionType) {
          this.$message.error('请选择题目类型')
          return
        }
    
        // 验证题目类型分布是否有选中的类型
        const hasValidDistribution = Object.values(this.thirdPartyForm.question_type_distribution).some(count => parseInt(count) > 0)
        if (!hasValidDistribution) {
          this.$message.error('请至少选择一个题目类型')
          return
        }
        
        // 验证题目类型分布数据结构
        console.log('验证前的题目类型分布:', this.thirdPartyForm.question_type_distribution)
        
        // 强制修复数据格式问题 - 确保单选逻辑：只有选中的类型为1，其他都为0
        const fixedDistribution = {}
        Object.entries(this.thirdPartyForm.question_type_distribution).forEach(([type, count]) => {
          if (typeof count === 'string' && count === type) {
            // 如果值是字符串且等于类型名，说明数据有问题，设为0
            fixedDistribution[type] = 0
            console.warn(`修复题目类型 "${type}" 的无效值:`, count)
          } else {
            // 正常情况，确保是数字类型，但强制重置为0（除了选中的类型）
            fixedDistribution[type] = 0
          }
        })
        
        // 确保选中的题目类型数量为5，其他所有类型强制为0
        if (this.selectedQuestionType) {
          fixedDistribution[this.selectedQuestionType] = 10
          console.log(`✅ 强制设置选中题目类型 "${this.selectedQuestionType}" 数量为10`)
          
          // 强制其他所有类型为0
          Object.keys(fixedDistribution).forEach(type => {
            if (type !== this.selectedQuestionType) {
              fixedDistribution[type] = 0
              console.log(`🔄 强制重置题目类型 "${type}" 数量为0`)
            }
          })
        }
        
        // 更新表单数据
        this.thirdPartyForm.question_type_distribution = fixedDistribution
        
        console.log('修复后的题目类型分布:', this.thirdPartyForm.question_type_distribution)
        
        const invalidTypes = Object.entries(this.thirdPartyForm.question_type_distribution).filter(([type, count]) => {
          const numCount = parseInt(count)
          const isValid = !isNaN(numCount) && numCount >= 0
          if (!isValid) {
            console.warn(`题目类型 "${type}" 的数量值无效:`, count, '类型:', typeof count)
          }
          return !isValid
        })
        
        if (invalidTypes.length > 0) {
          console.error('题目类型分布数据仍然无效:', invalidTypes)
          this.$message.error('题目类型分布数据格式错误，请重新选择')
          return
        }
        
    
        // 验证题目类型分布 - 已有默认选择，无需验证
        
        // 清空之前的结果
        this.thirdPartyResults = []
        this.thirdPartyTotal = 0
        
        // 设置加载状态
        this.thirdPartyLoading = true
        console.log('设置loading状态为true')
        
        // 数据验证和清理
        const cleanedQuestionTypeDistribution = {}
        Object.keys(this.thirdPartyForm.question_type_distribution).forEach(type => {
          const value = this.thirdPartyForm.question_type_distribution[type]
          // 确保所有值都是数字类型
          cleanedQuestionTypeDistribution[type] = parseInt(value) || 0
        })
        
        console.log('清理后的题目类型分布:', cleanedQuestionTypeDistribution)
        
        // 最终验证：确保单选逻辑 - 只有一个类型数量为5，其他都为0
        const finalDistribution = {}
        let selectedTypeCount = 0
        let selectedTypeName = ''
        
        Object.keys(cleanedQuestionTypeDistribution).forEach(type => {
          const count = cleanedQuestionTypeDistribution[type]
          if (count > 0) {
            selectedTypeCount++
            selectedTypeName = type
            finalDistribution[type] = 10  // 设置为5道题
          } else {
            finalDistribution[type] = 0
          }
        })
        
        // 如果发现多个类型被选中，强制重置为单选
        if (selectedTypeCount > 1) {
          console.warn(`⚠️ 发现多个题目类型被选中 (${selectedTypeCount}个)，强制重置为单选模式`)
          Object.keys(finalDistribution).forEach(type => {
            finalDistribution[type] = 0
          })
          // 使用当前选中的题目类型
          if (this.selectedQuestionType) {
            finalDistribution[this.selectedQuestionType] = 10
            console.log(`✅ 强制重置后，选中题目类型 "${this.selectedQuestionType}" 数量为10`)
          }
        } else if (selectedTypeCount === 1) {
          console.log(`✅ 单选验证通过：题目类型 "${selectedTypeName}" 数量为10`)
        } else {
          console.warn('⚠️ 没有题目类型被选中，使用默认选中类型')
          if (this.selectedQuestionType) {
            finalDistribution[this.selectedQuestionType] = 10
            console.log(`✅ 使用默认选中题目类型 "${this.selectedQuestionType}" 数量为10`)
          }
        }
        
        console.log('最终验证后的题目类型分布:', finalDistribution)
        
        // 构建请求参数
        const requestData = {
          subject: this.thirdPartyForm.subject,
          knowledge_name: this.thirdPartyForm.knowledge_name, // 叶子节点名称
          question_type_distribution: finalDistribution,
          difficulty: parseInt(this.thirdPartyForm.difficulty) || 0,
          max_questions: this.thirdPartyForm.max_questions, // 最大刷新10道题
          gc: Boolean(this.thirdPartyForm.gc),
          sc: Boolean(this.thirdPartyForm.sc),
          rc: Boolean(this.thirdPartyForm.rc),
          yc: Boolean(this.thirdPartyForm.yc),
          ec: Boolean(this.thirdPartyForm.ec),
          er: Boolean(this.thirdPartyForm.er),
          rg: this.thirdPartyForm.rg || '',
          so: this.selectedSources.join(','), // 使用选中的来源类型
          yr: this.selectedYears.join(','), // 使用选中的年份范围
          page: this.thirdPartyForm.page // 当前页码
        }
        
        console.log('搜题请求参数:', requestData)
        console.log('原始题目类型分布:', this.thirdPartyForm.question_type_distribution)
        console.log('清理后题目类型分布:', cleanedQuestionTypeDistribution)
        console.log('知识点字段说明:')
        console.log('- knowledge_name (叶子节点):', this.thirdPartyForm.knowledge_name)
        console.log('- knowledge_full_path (完整路径):', this.thirdPartyForm.knowledge_full_path)
        
        // 调用API
        const response = await thirdPartySearch(requestData)
        console.log('API响应:', response)
        console.log('响应类型:', typeof response)
        console.log('是否为数组:', Array.isArray(response))
        
        // 设置loading为false
        this.thirdPartyLoading = false
        console.log('API调用完成，设置loading为false')
        
        // 处理响应数据
        let results = []
        let total = 0
        
        if (Array.isArray(response)) {
          console.log('响应是数组，直接使用')
          results = response
          total = response.total || response.length // 优先使用total字段
        } else if (response && response.data && Array.isArray(response.data)) {
          console.log('响应是对象，使用data字段')
          results = response.data
          total = response.total || response.data.length // 优先使用total字段
        } else if (response && response.code === 200 && response.data && Array.isArray(response.data)) {
          console.log('响应是标准格式，使用data字段')
          results = response.data
          total = response.total || response.data.length // 优先使用total字段
        } else {
          console.error('响应格式异常:', response)
          this.handleKnowledgeError(response, '响应格式异常')
          this.thirdPartyResults = []
          this.thirdPartyTotal = 0
          return
        }
        
        console.log('处理后的结果数组:', results)
        console.log('结果数量:', total)
        
        if (results.length > 0) {
          // 处理数据格式
          const processedResults = results.map(item => ({
            ...item,
            qtype: item.qtype || item.catename || '未知类型',
            question: item.question || item.content || '',
            degree: item.degree || 0.5,
            knowledge_name: item.knowledge_name || '',
            options: item.options || '[]',
            children: item.children || '[]',
            answers: item.answers || '[]',
            displayanswer: item.displayanswer || ''
          }))
          
          console.log('处理后的结果:', processedResults)
          
          // 设置结果数据
          this.thirdPartyResults = processedResults
          this.thirdPartyTotal = total
          
          console.log('数据设置完成:')
          console.log('- thirdPartyResults长度:', this.thirdPartyResults.length)
          console.log('- thirdPartyTotal:', this.thirdPartyTotal)
          
          this.$message.success(`搜索成功，共找到 ${total} 道题目`)
          
          // 显示弹窗
          this.searchResultsDialogVisible = true
          
          // 强制更新视图
          this.$nextTick(() => {
            console.log('视图更新完成')
            console.log('当前thirdPartyResults:', this.thirdPartyResults)
          })
          
        } else {
          this.thirdPartyResults = []
          this.thirdPartyTotal = 0
          this.$message.warning('未找到相关题目，请尝试调整搜索条件')
        }
        
      } catch (error) {
        console.error('搜题失败:', error)
        this.handleKnowledgeError(error, '搜题失败，请稍后重试')
        this.thirdPartyResults = []
        this.thirdPartyTotal = 0
        this.thirdPartyLoading = false
      }
    },
    
    // 刷新题目 - 获取新的题目（最大10道题）
    async handleRefreshQuestions() {
      try {
        console.log('=== 开始刷新题目 ===')
        
        // 检查必填字段
        if (!this.thirdPartyForm.subject) {
          this.$message.error('请选择科目')
          return
        }
        
        if (!this.thirdPartyForm.knowledge_name) {
          this.$message.error('请选择知识点')
          return
        }
        
        if (!this.selectedQuestionType) {
          this.$message.error('请选择题目类型')
          return
        }
        
        // 设置刷新加载状态
        this.refreshLoading = true
        console.log('设置刷新loading状态为true')
        
        // 构建刷新请求参数 - 与搜题参数相同，使用最大刷新数
        const requestData = {
          subject: this.thirdPartyForm.subject,
          knowledge_name: this.thirdPartyForm.knowledge_name,
          question_type_distribution: this.thirdPartyForm.question_type_distribution,
          difficulty: parseInt(this.thirdPartyForm.difficulty) || 0,
          max_questions: this.thirdPartyForm.max_questions, // 使用最大刷新数10道题
          gc: Boolean(this.thirdPartyForm.gc),
          sc: Boolean(this.thirdPartyForm.sc),
          rc: Boolean(this.thirdPartyForm.rc),
          yc: Boolean(this.thirdPartyForm.yc),
          ec: Boolean(this.thirdPartyForm.ec),
          er: Boolean(this.thirdPartyForm.er),
          rg: this.thirdPartyForm.rg || '',
          so: this.selectedSources.join(','),
          yr: this.selectedYears.join(','),
          page: this.thirdPartyForm.page // 当前页码
        }
        
        console.log('刷新题目请求参数:', requestData)
        
        // 调用API获取新的题目
        const response = await thirdPartySearch(requestData)
        console.log('刷新API响应:', response)
        
        // 处理响应数据
        let results = []
        let total = 0
        
        if (Array.isArray(response)) {
          results = response
          total = response.total || response.length // 优先使用total字段
        } else if (response && response.data && Array.isArray(response.data)) {
          results = response.data
          total = response.total || response.data.length // 优先使用total字段
        } else if (response && response.code === 200 && response.data && Array.isArray(response.data)) {
          results = response.data
          total = response.total || response.data.length // 优先使用total字段
        } else {
          console.error('刷新响应格式异常:', response)
          this.handleKnowledgeError(response, '刷新失败：响应格式异常')
          return
        }
        
        if (results.length > 0) {
          // 处理数据格式
          const processedResults = results.map(item => ({
            ...item,
            qtype: item.qtype || item.catename || '未知类型',
            question: item.question || item.content || '',
            degree: item.degree || 0.5,
            knowledge_name: item.knowledge_name || '',
            options: item.options || '[]',
            children: item.children || '[]',
            answers: item.answers || '[]',
            displayanswer: item.displayanswer || ''
          }))
          
          // 更新结果数据
          this.thirdPartyResults = processedResults
          this.thirdPartyTotal = total
          
          console.log('刷新完成，新的题目数量:', total)
          this.$message.success(`刷新成功，获取到 ${total} 道新题目`)
          
        } else {
          this.$message.warning('未找到新的题目，请尝试调整搜索条件')
        }
        
      } catch (error) {
        console.error('刷新题目失败:', error)
        this.handleKnowledgeError(error, '刷新失败，请稍后重试')
      } finally {
        // 重置刷新加载状态
        this.refreshLoading = false
        console.log('刷新完成，设置loading为false')
      }
    },
    
    // 上一页
    async handlePreviousPage() {
      if (this.thirdPartyForm.page > 1) {
        this.thirdPartyForm.page--
        console.log('切换到上一页，页码:', this.thirdPartyForm.page)
        await this.handleThirdPartySearch()
        // 滚动到搜索结果列表顶部
        this.scrollToResultsTop()
      }
    },
    
    // 下一页
    async handleNextPage() {
      this.thirdPartyForm.page++
      console.log('切换到下一页，页码:', this.thirdPartyForm.page)
      await this.handleThirdPartySearch()
      // 滚动到搜索结果列表顶部
      this.scrollToResultsTop()
    },
    
    // 滚动到搜索结果列表顶部
    scrollToResultsTop() {
      this.$nextTick(() => {
        const resultsContainer = document.querySelector('.results-list-container')
        if (resultsContainer) {
          resultsContainer.scrollTop = 0
          console.log('已滚动到搜索结果列表顶部')
        }
      })
    },
    
    // 从解析中提取答案
    extractAnswerFromMethod(method) {
      if (!method) return ''
      
      try {
        // 如果method是字符串，直接返回
        if (typeof method === 'string') {
          return method
        }
        
        // 如果method是数组，尝试转换为字符串
        if (Array.isArray(method)) {
          return method.join(', ')
        }
        
        // 其他情况，返回空字符串
        return ''
      } catch (error) {
        console.warn('处理答案时出错:', error)
        return ''
      }
    },
    
    
    // 判断是否为选择题
    isChoiceQuestion(question) {
      const type = question.qtype || question.catename || ''
      return type.includes('选择') || type.includes('选择')
    },
    
    // 解析选项
    parseOptions(options) {
      if (!options) return []
      
      try {
        if (typeof options === 'string') {
          // 尝试解析JSON字符串
          if (options.startsWith('[') && options.endsWith(']')) {
            return JSON.parse(options)
          }
          // 如果是普通字符串，按逗号分割
          return options.split(',').map(opt => opt.trim())
        }
        
        if (Array.isArray(options)) {
          return options
        }
        
        return []
      } catch (error) {
        console.warn('解析选项时出错:', error)
        return []
      }
    },
    
    // 解析子题目
    parseChildren(children) {
      if (!children) return []
      
      try {
        if (typeof children === 'string') {
          if (children.startsWith('[') && children.endsWith(']')) {
            return JSON.parse(children)
          }
          return []
        }
        
        if (Array.isArray(children)) {
          return children
        }
        
        return []
      } catch (error) {
        console.warn('解析子题目时出错:', error)
        return []
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
    
    // 显示题目解析
    showAnalysis(question) {
      let analysis = ''
      
      if (question.analysis) {
        analysis = question.analysis
      } else if (question.displayanswer) {
        analysis = question.displayanswer
      } else if (question.answers) {
        analysis = this.extractAnswerFromMethod(question.answers)
      } else {
        analysis = '暂无解析'
      }
      
      this.$alert(analysis, '题目解析', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
        customClass: 'analysis-dialog'
      })
    },
    
    // 从搜索结果中获取科目信息
    getSubjectFromSearch(question) {
      // 优先使用当前搜索的科目信息
      if (this.userRole === 'teacher' && this.teacherSubject) {
        // 老师身份：使用老师科目
        return this.teacherSubject
      } else if (this.userRole === 'admin' && this.thirdPartyForm.subject) {
        // 管理员身份：使用三方表单科目
        return this.thirdPartyForm.subject
      } else if (this.subjectType) {
        // 关键词搜题使用的科目
        return this.subjectType
      } else if (this.photoSubjectType) {
        // 拍照搜题使用的科目
        return this.photoSubjectType
      }
      
      // 从题目数据中提取科目信息（备用）
      if (question.subject_name) {
        return question.subject_name
      } else if (question.subject) {
        return question.subject
      }
      
      // 如果没有科目信息，返回默认值
      return '高中数学'
    },
    

    
    // 构建知识点树形结构 - 不再需要，API直接返回树形结构
    buildChapterTree(chapterList) {
      // API返回的数据已经是正确的树形结构，直接返回
      return chapterList
    },
    
    // 处理知识点选择变化
    handleKnowledgeChange(value) {
      if (!value) {
        this.thirdPartyForm.knowledge_name = ''
        this.thirdPartyForm.knowledge_full_path = ''
        return
      }
      
      // 检查是否为叶子节点（没有子节点的节点）
      const isLeafNode = this.checkIfLeafNode(value)
      
      if (!isLeafNode) {
        // 不是叶子节点，弹框提示
        this.$message.error('请选择最底层的知识点节点！只有叶子节点才能获取到题目。')
        // 清空选择
        this.thirdPartyForm.knowledge_name = ''
        this.thirdPartyForm.knowledge_full_path = ''
        return
      }
      
      // 是叶子节点，设置知识点名称和完整路径
      // 叶子节点名称：只取最后一部分
      this.thirdPartyForm.knowledge_name = this.extractLeafNodeName(value)
      // 完整路径：构建完整路径
      this.thirdPartyForm.knowledge_full_path = this.buildKnowledgeFullPath(value)
      
      console.log('选中的知识点值:', value)
      console.log('叶子节点名称:', this.thirdPartyForm.knowledge_name)
      console.log('完整知识点路径:', this.thirdPartyForm.knowledge_full_path)
    },
    
    // 提取叶子节点名称（最后一部分）
    extractLeafNodeName(value) {
      console.log('提取叶子节点名称，输入值:', value)
      
      // 如果value是路径格式，取最后一部分
      if (typeof value === 'string' && value.includes('/')) {
        const pathParts = value.split('/')
        const leafName = pathParts[pathParts.length - 1]
        console.log('路径格式，提取的叶子节点名称:', leafName)
        return leafName
      }
      
      // 如果value是节点值，需要查找对应的标签
      const nodeLabel = this.findNodeLabel(value)
      console.log('节点值格式，查找的标签:', nodeLabel)
      return nodeLabel || value
    },
    
    // 查找节点对应的标签
    findNodeLabel(nodeValue) {
      const findLabel = (options, targetValue) => {
        for (let option of options) {
          if (option.value === targetValue) {
            return option.label
          }
          if (option.children && option.children.length > 0) {
            const found = findLabel(option.children, targetValue)
            if (found) return found
          }
        }
        return null
      }
      
      return findLabel(this.chapterOptions, nodeValue)
    },
    
    // 构建知识点的完整路径
    buildKnowledgeFullPath(leafNodeValue) {
      console.log('构建完整路径，输入值:', leafNodeValue)
      
      const findPath = (options, targetValue, path = []) => {
        for (let option of options) {
          const newPath = [...path, option.label]
          if (option.value === targetValue) {
            const fullPath = newPath.join('/')
            console.log('找到节点，构建的完整路径:', fullPath)
            return fullPath
          }
          if (option.children && option.children.length > 0) {
            const found = findPath(option.children, targetValue, newPath)
            if (found) return found
          }
        }
        return null
      }
      
      const fullPath = findPath(this.chapterOptions, leafNodeValue)
      console.log('最终完整路径:', fullPath || leafNodeValue)
      return fullPath || leafNodeValue
    },
    
    // 检查是否为叶子节点
    checkIfLeafNode(value) {
      // 在知识点树中查找对应的节点
      const findNode = (options, targetValue) => {
        for (let option of options) {
          if (option.value === targetValue) {
            // 检查是否有子节点
            return !option.children || option.children.length === 0
          }
          if (option.children && option.children.length > 0) {
            const result = findNode(option.children, targetValue)
            if (result !== undefined) {
              return result
            }
          }
        }
        return undefined
      }
      
      const isLeaf = findNode(this.chapterOptions, value)
      console.log('节点是否为叶子节点:', isLeaf)
      return isLeaf
    },
    
    // 切换来源类型选择
    toggleSource(source) {
      if (source === '全部') {
        // 如果选择"全部"，清空其他选择
        this.selectedSources = ['全部'];
      } else {
        // 如果选择其他选项，移除"全部"
        const allIndex = this.selectedSources.indexOf('全部');
        if (allIndex > -1) {
          this.selectedSources.splice(allIndex, 1);
        }
        
        const index = this.selectedSources.indexOf(source);
        if (index > -1) {
          this.selectedSources.splice(index, 1);
          // 如果没有选择任何选项，自动选择"全部"
          if (this.selectedSources.length === 0) {
            this.selectedSources = ['全部'];
          }
        } else {
          this.selectedSources.push(source);
        }
      }
      
      // 更新表单值
      this.updateSourceFormValue();
    },
    
    // 更新来源类型表单值
    updateSourceFormValue() {
      if (this.enableMultipleSource) {
        // 多选模式：用逗号分隔
        this.thirdPartyForm.so = this.selectedSources.join(',');
      } else {
        // 单选模式：只取第一个选中的值
        this.thirdPartyForm.so = this.selectedSources[0] || '';
      }
    },
    
    // 切换多选来源类型模式
    toggleMultipleSource() {
      this.enableMultipleSource = !this.enableMultipleSource;
      this.updateSourceFormValue();
    },
    
    // 切换年份选择
    toggleYear(year) {
      if (year === '全部') {
        // 如果选择"全部"，清空其他选择
        this.selectedYears = ['全部'];
      } else {
        // 如果选择其他选项，移除"全部"
        const allIndex = this.selectedYears.indexOf('全部');
        if (allIndex > -1) {
          this.selectedYears.splice(allIndex, 1);
        }
        
        const index = this.selectedYears.indexOf(year);
        if (index > -1) {
          this.selectedYears.splice(index, 1);
          // 如果没有选择任何选项，自动选择"全部"
          if (this.selectedYears.length === 0) {
            this.selectedYears = ['全部'];
          }
        } else {
          this.selectedYears.push(year);
        }
      }
      
      // 更新表单值
      this.updateYearFormValue();
    },
    
    // 更新年份表单值
    updateYearFormValue() {
      if (this.enableMultipleYear) {
        // 多选模式：用逗号分隔
        this.thirdPartyForm.yr = this.selectedYears.join(',');
      } else {
        // 单选模式：只取第一个选中的值
        this.thirdPartyForm.yr = this.selectedYears[0] || '';
      }
    },
    
    // 切换多选年份模式
    toggleMultipleYear() {
      this.enableMultipleYear = !this.enableMultipleYear;
      this.updateYearFormValue();
    },
    
    // 切换高级选项选择
    toggleAdvancedOption(optionValue) {
      if (optionValue === 'all') {
        // 如果选择"全部"，清空其他选择
        this.selectedAdvancedOptions = ['all'];
      } else {
        // 如果选择其他选项，移除"全部"
        const allIndex = this.selectedAdvancedOptions.indexOf('all');
        if (allIndex > -1) {
          this.selectedAdvancedOptions.splice(allIndex, 1);
        }
        
        const index = this.selectedAdvancedOptions.indexOf(optionValue);
        if (index > -1) {
          this.selectedAdvancedOptions.splice(index, 1);
          // 如果没有选择任何选项，自动选择"全部"
          if (this.selectedAdvancedOptions.length === 0) {
            this.selectedAdvancedOptions = ['all'];
          }
        } else {
          this.selectedAdvancedOptions.push(optionValue);
        }
      }
      
      // 更新表单值
      this.updateAdvancedOptionsFormValue();
    },
    
    // 更新高级选项表单值
    updateAdvancedOptionsFormValue() {
      // 将选中的高级选项转换为表单字段
      this.thirdPartyForm.gc = this.selectedAdvancedOptions.includes('gc');
      this.thirdPartyForm.sc = this.selectedAdvancedOptions.includes('sc');
      this.thirdPartyForm.rc = this.selectedAdvancedOptions.includes('rc');
      this.thirdPartyForm.yc = this.selectedAdvancedOptions.includes('yc');
      this.thirdPartyForm.ec = this.selectedAdvancedOptions.includes('ec');
      this.thirdPartyForm.er = this.selectedAdvancedOptions.includes('er');
    },
    
    // 添加题目到共享已选列表
    addToSharedSelection(item) {
      const existingIndex = this.sharedSelectedQuestions.findIndex(q => q.sid === item.sid);
      if (existingIndex === -1) {
        this.sharedSelectedQuestions.push(item);
        this.$message.success('题目已添加到已选列表');
      } else {
        this.$message.warning('该题目已在已选列表中');
      }
    },
    
    // 从共享已选列表中移除题目
    removeFromSharedSelection(sid) {
      const index = this.sharedSelectedQuestions.findIndex(q => q.sid === sid);
      if (index > -1) {
        this.sharedSelectedQuestions.splice(index, 1);
        this.$message.success('题目已从已选列表中移除');
      }
    },
    
    // 检查题目是否已在共享已选列表中
    isInSharedSelection(sid) {
      return this.sharedSelectedQuestions.some(q => q.sid === sid);
    },
    
    // 关闭搜题结果弹窗
    closeSearchResultsDialog() {
      this.searchResultsDialogVisible = false;
    },
    showAnalysis(item) {
      // 查看解析逻辑
      console.log('查看解析:', item)
      this.currentQuestion = item
      this.analysisVisible = true
      this.loadingDetail = true
      this.questionDetail = null
      
      // 构建请求数据
      const requestData = {
        subject_name: this.getSubjectFromSearch(item),
        sids: [item.sid || item.id]
      }
      
      // 调用API获取题目详情
      getQuestionDetail(requestData).then(res => {
        console.log('API响应:', res)
        // 检查响应数据格式
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          // 新格式：{questions: [{SID, Content, Analyse, ...}]}
          this.questionDetail = res.questions[0] // 取第一个题目
        } else if (res && res.SID) {
          // 直接返回题目详情数据
          this.questionDetail = res
        } else if (res && res.code === 200 && res.data) {
          // 标准格式：{code: 200, data: {...}}
          this.questionDetail = res.data
        } else {
          console.warn('未识别的数据格式:', res)
          this.$message.error('获取题目详情失败: 数据格式错误')
        }
      }).catch(error => {
        console.error('获取题目详情失败:', error)
        this.$message.error('获取题目详情失败: ' + (error.message || '网络错误'))
      }).finally(() => {
        this.loadingDetail = false
      })
    },
    isCorrectOption(index, answers) {
      return answers.includes(index)
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
      return typeMap[question] || 'info'
    },
    
    // 获取题目类型分布
    loadQuestionTypeDistribution(subjectName) {
      console.log('开始加载题型分布，科目:', subjectName)
      if (!subjectName) {
        console.warn('科目名称为空，跳过题型分布加载')
        return
      }
      
      getQuestionTypeDistribution(subjectName).then(res => {
        console.log('题型分布API响应:', res)
        if (res.message === 'success' && res.question_types) {
          // 存储原始数据
          this.questionTypeDistribution = res.question_types
          // 提取题型名称（只取中文名称，忽略数值）
          this.questionTypes = Object.keys(res.question_types)
          console.log('提取的题型名称:', this.questionTypes)
          
          // 初始化题目类型分布表单
          this.initQuestionTypeDistribution()
          
          // 设置科目已加载状态
          this.isSubjectLoaded = true
          console.log('题型分布加载完成，isSubjectLoaded:', this.isSubjectLoaded)
        } else {
          console.error('获取题型分布失败:', res)
          this.questionTypes = []
          this.questionTypeDistribution = {}
          this.isSubjectLoaded = false
        }
      }).catch(error => {
        console.error('获取题型分布失败:', error)
        this.questionTypes = []
        this.questionTypeDistribution = {}
        this.isSubjectLoaded = false
      })
    },

    // 为关键词搜索加载题目类型
    loadKeywordQuestionTypes(subjectName) {
      console.log('开始为关键词搜索加载题目类型，科目:', subjectName)
      if (!subjectName) {
        console.warn('科目名称为空，跳过关键词搜索题目类型加载')
        this.keywordQuestionTypes = []
        return
      }
      this.loadingQuestionTypes = true
      getQuestionTypeDistribution(subjectName).then(res => {
        console.log('关键词搜索题目类型API响应:', res)
        if (res.message === 'success' && res.question_types) {
          this.keywordQuestionTypes = Object.keys(res.question_types)
          console.log('关键词搜索题目类型加载完成:', this.keywordQuestionTypes)
        } else {
          console.error('获取关键词搜索题目类型失败:', res)
          this.keywordQuestionTypes = []
        }
      }).catch(error => {
        console.error('获取关键词搜索题目类型失败:', error)
        this.keywordQuestionTypes = []
      }).finally(() => {
        this.loadingQuestionTypes = false
      })
    },
    
    // 初始化题目类型分布表单 - 单选模式：默认选择第一个题型，数量为5，其他为0
    initQuestionTypeDistribution() {
      console.log('=== 开始初始化题目类型分布 ===')
      console.log('题型列表:', this.questionTypes)
      
      // 创建新的分布对象，确保所有值都是数字类型
      const newDistribution = {}
      
      // 为每个题型初始化数量为0
      this.questionTypes.forEach(type => {
        newDistribution[type] = 0
        console.log(`🔄 初始化题目类型 "${type}" 数量为: 0`)
      })
      
      // 默认选择第一个题型，设置数量为5（单选模式）
      if (this.questionTypes.length > 0) {
        const defaultType = this.questionTypes[0]
        newDistribution[defaultType] = 10
        this.selectedQuestionType = defaultType
        console.log(`✅ 默认选择题目类型 "${defaultType}" 数量为: 10`)
      }
      
      // 直接赋值整个对象
      this.thirdPartyForm.question_type_distribution = newDistribution
      
      console.log('初始化后的题型分布表单:', this.thirdPartyForm.question_type_distribution)
      
      // 验证单选逻辑：确保只有一个类型的数量为5，其他都为0
      const selectedTypes = Object.entries(newDistribution).filter(([type, count]) => count > 0)
      if (selectedTypes.length === 1 && selectedTypes[0][1] === 10) {
        console.log('✅ 初始化单选逻辑验证通过：只有一个题目类型被选中，数量为10')
      } else {
        console.error('❌ 初始化单选逻辑验证失败：', selectedTypes)
      }
      
      // 验证数据类型
      const allValid = Object.values(this.thirdPartyForm.question_type_distribution).every(count => {
        const isValid = typeof count === 'number' && count >= 0
        if (!isValid) {
          console.error(`❌ 初始化后类型 ${count} 无效:`, count, '类型:', typeof count)
        }
        return isValid
      })
      
      if (!allValid) {
        console.error('❌ 初始化题目类型分布数据类型验证失败')
      } else {
        console.log('✅ 初始化题目类型分布数据类型验证通过')
      }
      
      console.log('=== 初始化题目类型分布完成 ===')
    },
    handleSubjectChange(value) {
      if (value) {
        this.loadQuestionTypeDistribution(value)
      }
    },

    // 处理关键词搜索科目变化
    handleKeywordSubjectChange(value) {
      console.log('关键词搜索科目变化:', value)
      if (value) {
        this.loadKeywordQuestionTypes(value)
      } else {
        this.keywordQuestionTypes = []
      }
      this.questionType = '' // 重置题目类型选择
    },

    // 处理关键词搜索科目变化
    handleKeywordSubjectChange(value) {
      console.log('关键词搜索科目变化:', value)
      if (value) {
        this.loadKeywordQuestionTypes(value)
      } else {
        this.keywordQuestionTypes = []
      }
      this.questionType = '' // 重置题目类型选择
    },
    
    // 加载用户科目信息
    async loadUserSubject() {
      try {
        const response = await getGradeAndSubject()
        console.log('用户科目信息:', response)
        
        if (response && response.data && Array.isArray(response.data)) {
          if (response.data.length === 1) {
            // 教师角色 - 只有一个科目
            this.userRole = 'teacher'
            this.teacherSubject = response.data[0].gradeAndSubject
            this.thirdPartyForm.subject = this.teacherSubject
            this.thirdPartyForm.subjectType = this.teacherSubject
            
            // 自动加载题型分布
            await this.loadQuestionTypeDistribution(this.teacherSubject)
            // 自动加载关键词搜索题目类型
            await this.loadKeywordQuestionTypes(this.teacherSubject)
            // 设置关键词搜索的科目类型
            this.subjectType = this.teacherSubject
            
          } else {
            // 管理员角色 - 多个科目
            this.userRole = 'admin'
            this.teacherSubject = ''
            
            // 为admin账号设置默认科目并加载题目类型分布
            if (response.data.length > 0) {
              const defaultSubject = response.data[0].gradeAndSubject
              this.thirdPartyForm.subject = defaultSubject
              this.thirdPartyForm.subjectType = defaultSubject
              
              // 自动加载默认科目的题型分布
              await this.loadQuestionTypeDistribution(defaultSubject)
              // 自动加载关键词搜索题目类型
              await this.loadKeywordQuestionTypes(defaultSubject)
            }
          }
        }
        
        this.isSubjectLoaded = true
        
      } catch (error) {
        console.error('获取用户科目失败:', error)
        this.userRole = 'admin'
        this.teacherSubject = ''
        this.isSubjectLoaded = true
      }
    },
    addToPaper(item) {
      // 添加到试卷
      if (!this.isQuestionSelected(item.sid, 'paper')) {
        this.selectedPaperQuestions.push(item)
        this.$message.success('已添加到试卷')
      }
    },
    
    addToHomework(item) {
      // 添加到作业
      if (!this.isQuestionSelected(item.sid, 'homework')) {
        this.selectedHomeworkQuestions.push(item)
        this.$message.success('已添加到作业')
      }
    },
    
    isQuestionSelected(sid, type) {
      // 检查题目是否已被选择
      if (type === 'paper') {
        return this.selectedPaperQuestions.some(q => q.sid === sid)
      } else if (type === 'homework') {
        return this.selectedHomeworkQuestions.some(q => q.sid === sid)
      }
      return false
    },
    
    async generatePaperOrHomework() {
      try {
        // 验证表单
        const valid = await this.$refs.generateFormRef.validate()
        if (!valid) {
          console.log('表单验证失败')
          return
        }
        
        // 检查是否有已选题目
        if (this.sharedSelectedQuestions.length === 0) {
          this.$message.error('请先选择题目')
          return
        }
        
        console.log('生成表单数据:', this.generateForm)
        console.log('已选题目:', this.sharedSelectedQuestions)
        
        // 数据验证和清理
        console.log('🔍 开始数据验证...')
        console.log('表单数据:', this.generateForm)
        console.log('已选题目数量:', this.sharedSelectedQuestions.length)
        console.log('知识点路径:', this.thirdPartyForm.knowledge_full_path)
        
        // 验证必要字段
        if (!this.generateForm.subject || this.generateForm.subject.trim() === '') {
          this.$message.error('请选择科目')
          return
        }
        if (!this.generateForm.name || this.generateForm.name.trim() === '') {
          this.$message.error('请输入名称')
          return
        }
        if (this.sharedSelectedQuestions.length === 0) {
          this.$message.error('请先选择题目')
          return
        }
        
        console.log('✅ 数据验证通过')
        
        // 根据当前搜题方式填充表单信息
        this.generateForm.searchType = this.activeTab
        if (this.activeTab === 'keyword') {
          this.generateForm.searchKeywords = this.keywordQuery || ''
          this.generateForm.searchSubject = this.subjectType || ''
          this.generateForm.difficultyRange = `${this.minDegree}-${this.maxDegree}`
          this.generateForm.questionType = this.questionType || ''
        } else if (this.activeTab === 'photo') {
          this.generateForm.searchKeywords = '拍照搜题'
          // 拍照搜题时，老师身份使用teacherSubject，管理员使用photoSubjectType
          if (this.userRole === 'teacher' && this.teacherSubject) {
            this.generateForm.searchSubject = this.teacherSubject
          } else {
            this.generateForm.searchSubject = this.photoSubjectType || ''
          }
          this.generateForm.difficultyRange = ''
          this.generateForm.questionType = ''
        } else if (this.activeTab === 'thirdParty') {
          this.generateForm.searchKeywords = this.thirdPartyForm.knowledge_name || ''
          this.generateForm.searchSubject = this.thirdPartyForm.subject || ''
          this.generateForm.difficultyRange = this.thirdPartyForm.difficulty || ''
          this.generateForm.questionType = this.selectedQuestionType || ''
        }
        
        console.log('填充后的表单数据:', this.generateForm)
        
        // 显示加载状态
        this.$message.info('正在生成中，请稍候...')
        
        // 根据类型调用不同的API
        if (this.currentCreationMode === 'paper') {
          // 调用生成试卷API
          await this.createPaper()
        } else {
          // 调用创建作业API
          await this.createHomework()
        }
        
      } catch (error) {
        console.error('生成失败:', error)
        this.$message.error('生成失败: ' + (error.message || '未知错误'))
      }
    },
    
    // 预览已选题目
    previewSelectedQuestions() {
      if (!this.generateForm.subject || !this.generateForm.name) {
        this.$message.warning('请先填写科目和名称')
        return
      }
      
      if (this.sharedSelectedQuestions.length === 0) {
        this.$message.warning('暂无已选题目')
        return
      }
      
      this.previewDialogVisible = true
    },
    
    // 处理预览弹窗关闭
    handlePreviewClose(done) {
      this.previewDialogVisible = false
      done()
    },
    
    // 处理分页
    async handlePagination(pageData) {
      
      if (pageData && typeof pageData === 'object') {
        // 更新当前页码和每页数量
        if (pageData.page !== undefined) {
          this.currentPage = pageData.page
        }
        if (pageData.limit !== undefined) {
          this.pageSize = pageData.limit
        }

        // 根据当前激活的标签页重新加载数据
        if (this.activeTab === 'keyword') {
          // 关键词搜索：重新执行搜索
          if (this.hasSearched) {
            await this.handleKeywordSearch()
            // 滚动到搜索结果列表顶部
            this.scrollToResultsTop()
          } else {
          }
        } else if (this.activeTab === 'photo') {
          // 拍照搜题：重新执行搜索
          if (this.hasSearched) {
            await this.handlePhotoSearch()
            // 滚动到搜索结果列表顶部
            this.scrollToResultsTop()
          } else {
          }
        } else if (this.activeTab === 'thirdParty') {
          // 三方题库搜题：重新执行搜索
          if (this.thirdPartyResults.length > 0 || this.thirdPartyForm.knowledge_name) {
            // 更新三方题库的页码
            this.thirdPartyForm.page = pageData.page
            await this.handleThirdPartySearch()
            // 滚动到搜索结果列表顶部
            this.scrollToResultsTop()
          } else {
          }
        } else {
        }
      } else {
        console.warn('分页数据格式不正确:', pageData)
      }
    },
    
    // 重置关键词搜索表单
    resetKeywordSearchForm() {
      this.keywordQuery = ''
      // 老师身份不清空科目，管理员身份清空科目
      if (this.userRole === 'admin') {
        this.subjectType = ''
      }
      this.minDegree = 0
      this.maxDegree = 1
      this.questionType = ''
      this.selectedSources = ['全部']
      this.selectedYears = ['全部']
      this.selectedAdvancedOptions = ['all']
      
      // 清空搜索结果
      this.searchResults = []
      this.totalCount = 0
      this.currentPage = 1
      this.hasSearched = false
      this.loading = false
      
      // 清空关键词搜索题目类型
      this.keywordQuestionTypes = []
    },
    
    // 重置生成表单
    resetGenerateForm() {
      this.generateForm = {
        subject: '',
        name: '',
        searchType: '',
        searchKeywords: '',
        searchSubject: '',
        difficultyRange: '',
        questionType: ''
      }
      // 清除表单验证状态
      if (this.$refs.generateFormRef) {
        this.$refs.generateFormRef.clearValidate()
      }
    },
    
    // 确认生成试卷或作业
    async confirmGenerate() {
      try {
        const valid = await this.$refs.generateForm.validate()
        if (!valid) return
        
        this.generating = true
        
        // 这里可以调用相应的API来生成试卷或作业
        // 暂时模拟成功
        setTimeout(() => {
          this.generating = false
          this.generateDialogVisible = false
          const successMessage = this.generateSuccessMessage();
          this.$message.success(successMessage);
          
          // 清空已选题目
          this.clearSharedSelectedQuestions()
        }, 1000)
        
      } catch (error) {
        console.error('生成失败:', error)
        this.$message.error('生成失败，请稍后重试')
        this.generating = false
      }
    },
    

    
    async confirmGenerate() {
      // 确认生成试卷或作业
      try {
        const valid = await this.$refs.generateForm.validate()
        if (!valid) return
        
        this.generating = true
        
        if (this.currentCreationMode === 'paper') {
          await this.createPaper()
        } else if (this.currentCreationMode === 'homework') {
          await this.createHomework()
        }
        
        this.generateDialogVisible = false
        const successMessage = this.generateSuccessMessage();
        this.$message.success(successMessage);
        
        // 清空选择
        this.clearSharedSelectedQuestions()
        // 重置表单
        this.resetGenerateForm()
        
      } catch (error) {
        console.error('生成失败:', error)
        this.$message.error('生成失败: ' + (error.message || '未知错误'))
      } finally {
        this.generating = false
      }
    },
    
    async createPaper() {
      try {
        // 根据不同的搜题方式构建不同的数据
        let knowledgePointIds = ''
        let knowledgeCode = []
        
        if (this.activeTab === 'thirdParty') {
          // 三方题库搜题：使用知识点路径
          knowledgePointIds = String(this.thirdPartyForm.knowledge_full_path || '')
          knowledgeCode = []
        } else if (this.activeTab === 'keyword') {
          // 关键词搜题：使用搜索关键词和科目信息
          knowledgePointIds = `关键词搜题: ${this.generateForm.searchKeywords || '无关键词'} | 科目: ${this.generateForm.searchSubject || '未指定'} | 难度: ${this.generateForm.difficultyRange || '未指定'} | 类型: ${this.generateForm.questionType || '未指定'}`
          knowledgeCode = []
        } else if (this.activeTab === 'photo') {
          // 拍照搜题：使用科目信息
          knowledgePointIds = `拍照搜题 | 科目: ${this.generateForm.searchSubject || '未指定'}`
          knowledgeCode = []
        }
        
        // 创建试卷数据
        const paperData = {
          subject: String(this.generateForm.subject || ''),
          customPaperName: String(this.generateForm.name || ''),
          questionIds: this.sharedSelectedQuestions.map(q => String(q.sid || '')).join(','),
          knowledgePointIds: null,
          knowledgeCode: knowledgeCode,
          questionUrl: []
        }
      
        console.log('🚀 开始调用试卷创建API...')
      console.log('创建试卷数据:', paperData)
        console.log('数据类型检查:', {
          subject: typeof paperData.subject,
          customPaperName: typeof paperData.customPaperName,
          questionIds: typeof paperData.questionIds,
          knowledgePointIds: typeof paperData.knowledgePointIds,
          knowledgeCode: Array.isArray(paperData.knowledgeCode),
          questionUrl: Array.isArray(paperData.questionUrl)
        })
        
        // 确保所有字段都是正确的类型
        const finalPaperData = {
          subject: String(paperData.subject || ''),
          customPaperName: String(paperData.customPaperName || ''),
          questionIds: String(paperData.questionIds || ''),
          knowledgePointIds: String(paperData.knowledgePointIds || ''),
          knowledgeCode: [],
          questionUrl: []
        }
        
        console.log('最终发送的试卷数据:', finalPaperData)
      
      // 调用试卷API
      const { addPaper } = await import('@/api/system/paper')
        const response = await addPaper(finalPaperData)
        
        console.log('📡 试卷创建API响应:', response)
        
        // 检查响应是否成功
        if (response && (response.code === 200 || response.status === 200 || response.success)) {
          const successMessage = this.generateSuccessMessage();
          this.$message.success(successMessage);
          console.log('✅ 试卷创建成功:', successMessage);
          
          // 清空已选题目
          this.clearSharedSelectedQuestions()
          
          // 重置表单
          this.resetGenerateForm()
          
          // 设置刷新标志，确保目标页面刷新数据
          this.$store.commit('setNeedRefresh', true)
          
          // 跳转到试卷管理页面
          setTimeout(() => {
            this.$router.push('/student/paper')
          }, 1500)
        } else {
          console.warn('⚠️ API返回状态异常:', response)
          this.$message.warning('试卷创建状态异常，请检查数据')
        }
        
      } catch (error) {
        console.error('创建试卷失败:', error)
        this.$message.error('创建试卷失败: ' + (error.message || '未知错误'))
        throw error
      }
    },
    
    async createHomework() {
      try {
        // 根据不同的搜题方式构建不同的数据
        let knowledgePointIds = ''
        let knowledgeCode = []
        
        if (this.activeTab === 'thirdParty') {
          // 三方题库搜题：使用知识点路径
          knowledgePointIds = String(this.thirdPartyForm.knowledge_full_path || '')
          knowledgeCode = []
        } else if (this.activeTab === 'keyword') {
          // 关键词搜题：使用搜索关键词和科目信息
          knowledgePointIds = `关键词搜题: ${this.generateForm.searchKeywords || '无关键词'} | 科目: ${this.generateForm.searchSubject || '未指定'} | 难度: ${this.generateForm.difficultyRange || '未指定'} | 类型: ${this.generateForm.questionType || '未指定'}`
          knowledgeCode = []
        } else if (this.activeTab === 'photo') {
          // 拍照搜题：使用科目信息
          knowledgePointIds = `拍照搜题 | 科目: ${this.generateForm.searchSubject || '未指定'}`
          knowledgeCode = []
        }
        
        // 创建作业数据
        const homeworkData = {
          subject: String(this.generateForm.subject || ''),
          customPaperName: String(this.generateForm.name || ''),
          questionIds: this.sharedSelectedQuestions.map(q => String(q.sid || '')).join(','),
          knowledgePointIds: null,
          knowledgeCode: knowledgeCode,
          questionUrl: []
        }
      
        console.log('🚀 开始调用作业创建API...')
      console.log('创建作业数据:', homeworkData)
        console.log('数据类型检查:', {
          subject: typeof homeworkData.subject,
          customPaperName: typeof homeworkData.customPaperName,
          questionIds: typeof homeworkData.questionIds,
          knowledgePointIds: typeof homeworkData.knowledgePointIds,
          knowledgeCode: Array.isArray(homeworkData.knowledgeCode),
          questionUrl: Array.isArray(homeworkData.questionUrl)
        })
        
        // 确保所有字段都是正确的类型
        const finalHomeworkData = {
          subject: String(homeworkData.subject || ''),
          customPaperName: String(homeworkData.customPaperName || ''),
          questionIds: String(homeworkData.questionIds || ''),
          knowledgePointIds: String(homeworkData.knowledgePointIds || ''),
          knowledgeCode: [],
          questionUrl: []
        }
        
        console.log('最终发送的作业数据:', finalHomeworkData)
      
      // 调用作业API
      const { addTable } = await import('@/api/system/table')
        const response = await addTable(finalHomeworkData)
        
        console.log('📡 作业创建API响应:', response)
        
        // 检查响应是否成功
        if (response && (response.code === 200 || response.status === 200 || response.success)) {
          const successMessage = this.generateSuccessMessage();
          this.$message.success(successMessage);
          console.log('✅ 作业创建成功:', successMessage);
          
          // 清空已选题目
          this.clearSharedSelectedQuestions()
          
          // 重置表单
          this.resetGenerateForm()
          
          // 设置刷新标志，确保目标页面刷新数据
          this.$store.commit('setNeedRefresh', true)
          
          // 跳转到作业管理页面
          setTimeout(() => {
            this.$router.push('/student/table')
          }, 1500)
        } else {
          console.warn('⚠️ API返回状态异常:', response)
          this.$message.warning('作业创建状态异常，请检查数据')
        }
        
      } catch (error) {
        console.error('创建作业失败:', error)
        this.$message.error('创建作业失败: ' + (error.message || '未知错误'))
        throw error
      }
    },
    // 加载科目选项
    loadSubjectOptions() {
      // 动态导入科目API
      import('@/api/system/subject').then(({ listSubject }) => {
        listSubject().then(res => {
          console.log('科目API响应:', res)
          if (res && res.rows) {
            // 处理科目数据格式
            this.subjectOptions = res.rows.map(item => ({
              value: item.subjectCode || item.subjectId || item.value,
              label: item.subjectName || item.label || item.name
            }))
          } else if (res && res.data) {
            // 备用数据格式
            this.subjectOptions = res.data.map(item => ({
              value: item.subjectCode || item.subjectId || item.value,
              label: item.subjectName || item.label || item.name
            }))
          } else {
            this.subjectOptions = []
          }
          console.log('处理后的科目选项:', this.subjectOptions)
          
          // 如果是admin账号且还没有设置默认科目，设置第一个科目为默认值
          if (this.userRole === 'admin' && this.subjectOptions.length > 0 && !this.thirdPartyForm.subject) {
            const defaultSubject = this.subjectOptions[0].value
            this.thirdPartyForm.subject = defaultSubject
            this.thirdPartyForm.subjectType = defaultSubject
            
            // 加载默认科目的题目类型分布
            this.loadQuestionTypeDistribution(defaultSubject)
            // 加载关键词搜索题目类型
            this.loadKeywordQuestionTypes(defaultSubject)
          }
          
          // 设置科目已加载状态
          this.isSubjectLoaded = true
          console.log('科目选项加载完成，isSubjectLoaded:', this.isSubjectLoaded)
        }).catch(error => {
          console.error('获取科目列表失败:', error)
          // 添加一些默认科目选项
          this.subjectOptions = [
            { value: 'math', label: '数学' },
            { value: 'chinese', label: '语文' },
            { value: 'english', label: '英语' },
            { value: 'physics', label: '物理' },
            { value: 'chemistry', label: '化学' }
          ]
          
          // 如果是admin账号，设置默认科目并加载题目类型分布
          if (this.userRole === 'admin' && this.subjectOptions.length > 0) {
            const defaultSubject = this.subjectOptions[0].value
            this.thirdPartyForm.subject = defaultSubject
            this.thirdPartyForm.subjectType = defaultSubject
            
            // 加载默认科目的题目类型分布
            this.loadQuestionTypeDistribution(defaultSubject)
            // 加载关键词搜索题目类型
            this.loadKeywordQuestionTypes(defaultSubject)
          }
          
          // 设置科目已加载状态
          this.isSubjectLoaded = true
          console.log('科目选项加载完成（错误处理），isSubjectLoaded:', this.isSubjectLoaded)
        })
      }).catch(error => {
        console.error('导入科目API失败:', error)
        // 如果API导入失败，使用默认科目
        this.subjectOptions = [
          { value: 'math', label: '数学' },
          { value: 'chinese', label: '语文' },
          { value: 'english', label: '英语' },
          { value: 'physics', label: '物理' },
          { value: 'chemistry', label: '化学' }
        ]
        
        // 如果是admin账号，设置默认科目并加载题目类型分布
        if (this.userRole === 'admin' && this.subjectOptions.length > 0) {
          const defaultSubject = this.subjectOptions[0].value
          this.thirdPartyForm.subject = defaultSubject
          this.thirdPartyForm.subjectType = defaultSubject
          
                      // 加载默认科目的题目类型分布
            this.loadQuestionTypeDistribution(defaultSubject)
            // 加载关键词搜索题目类型
            this.loadKeywordQuestionTypes(defaultSubject)
          }
          
          // 设置科目已加载状态
          this.isSubjectLoaded = true
          console.log('科目选项加载完成（API导入失败处理），isSubjectLoaded:', this.isSubjectLoaded)
      })
    },
    resetGenerateForm() {
      this.generateForm = {
        subject: '',
        name: ''
      }
    },

    getKnowledgeDisplayName(knowledgeName) {
      return knowledgeName.split(' > ').pop()
    },
    handleQuestionTypeChange(value) {
      // 确保是单选模式：创建新的分布对象，选中类型为5，其他类型为0
      const newDistribution = {}
      Object.keys(this.thirdPartyForm.question_type_distribution).forEach(type => {
        if (type === value) {
          // 选中的题目类型数量为5道题
          newDistribution[type] = 10
        } else {
          // 其他题目类型数量重置为0
          newDistribution[type] = 0
        }
      })
      
      // 更新选中的题目类型
      this.selectedQuestionType = value
      
      // 直接赋值整个对象，触发Vue响应式更新
      this.thirdPartyForm.question_type_distribution = newDistribution
    },
    
    // 添加题目到共享已选列表
    addToSharedSelection(item) {
      const existingIndex = this.sharedSelectedQuestions.findIndex(q => q.sid === item.sid);
      if (existingIndex === -1) {
        this.sharedSelectedQuestions.push(item);
        this.$message.success('题目已添加到已选列表');
      } else {
        this.$message.warning('该题目已在已选列表中');
      }
    },
    
    // 从共享已选列表中移除题目
    removeFromSharedSelection(sid) {
      const index = this.sharedSelectedQuestions.findIndex(q => q.sid === sid);
      if (index > -1) {
        this.sharedSelectedQuestions.splice(index, 1);
        this.$message.success('题目已从已选列表中移除');
      }
    },
    
    // 检查题目是否已在共享已选列表中
    isInSharedSelection(sid) {
      return this.sharedSelectedQuestions.some(q => q.sid === sid);
    },
    
    // 清空共享已选题目
    clearSharedSelectedQuestions() {
      const count = this.sharedSelectedQuestions.length;
      this.sharedSelectedQuestions = [];
      if (count > 0) {
        // this.$message.success(`已清空${count}道已选题目`);
      }
    },
    
    // 切换创建模式
    switchCreationMode(mode) {
      this.currentCreationMode = mode;
      // 切换模式时不影响已选题目，只是改变显示和生成逻辑
    },
    
    // 获取科目名称
    getSubjectName(subjectCode) {
      if (!subjectCode) return '未知科目';
      const subject = this.subjectOptions.find(item => item.value === subjectCode);
      return subject ? subject.label : subjectCode;
    },
    
    // 生成成功消息
    generateSuccessMessage() {
      const type = this.currentCreationMode === 'paper' ? '试卷' : '作业';
      const subjectName = this.getSubjectName(this.generateForm.subject);
      const name = this.generateForm.name || '未命名';
      const questionCount = this.sharedSelectedQuestions.length;
      const knowledgeName = this.thirdPartyForm.knowledge_name || '未指定';
      
      // 输出详细的生成信息到控制台
      console.log('📋 生成详情:', {
        类型: type,
        名称: name,
        科目: subjectName,
        知识点: knowledgeName,
        题目数量: questionCount,
        创建模式: this.currentCreationMode
      });
      
      // 单行版本，更简洁
      return `${type}《${name}》生成成功！科目：${subjectName}，知识点：${knowledgeName}，题目数量：${questionCount}道`;
    },

  }
}
</script>

<style lang="scss" scoped>
.knowledge-sidebar {
  width: 100%;
  transition: all 0.3s ease;
  background: #f8f8f8;
  border-right: 1px solid #eee;
  position: relative;
}
.knowledge-sidebar.collapsed {
  height: 60px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 50px;
  }
  
  .panel-header {
    margin-bottom: 0;
  }
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}
.sidebar-content {
  padding: 12px;
}
.app-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 91vh;
  
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
        justify-content: space-between;
        align-items: center;
        width: 100%;
        
        .header-left {
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
          
          .result-count {
            font-size: 14px;
            color: #909399;
            margin-left: 10px;
          }
        }
        
        .header-right {
          .refresh-questions-btn-header {
            background: #67c23a;
            border-color: #67c23a;
            color: white;
            border-radius: 4px;
            transition: all 0.3s ease;
            
            &:hover {
              background: #85ce61;
              border-color: #85ce61;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
            }
          }
        }
      }
    }
    
    .search-content {
      padding: 10px 0;
      
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
            
            .full-width {
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
      
      .third-party-search-layout-new {
        display: flex;
        flex-direction: column;
        gap: 20px;
        
        /* 第二行：已选题目 */
        .first-row-layout {
          width: 100%;
          
          .selected-panel {
            flex: 1;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 20px;
            
            @media (max-width: 768px) {
              padding: 15px;
              border-radius: 8px;
            }
            
            .panel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              
              h3 {
                font-size: 16px;
                font-weight: bold;
                color: #303133;
                margin: 0;
              }
              
              .panel-subtitle {
                font-size: 14px;
                color: #909399;
              }
            }
            
            .creation-mode-selector {
              margin-bottom: 20px;
              
              .el-radio-group {
                width: 100%;
                
                .el-radio {
                  margin-right: 20px;
                }
              }
            }
            
            .creation-form {
              margin-bottom: 20px;
              
              .el-form-item {
                margin-bottom: 16px;
              }
            }
            
            .selected-stats {
              display: flex;
              justify-content: center;
              margin-bottom: 20px;
              
              .stat-item {
                text-align: center;
                
                .stat-number {
                  font-size: 24px;
                  font-weight: bold;
                  color: #409eff;
                  margin-bottom: 5px;
                }
                
                .stat-label {
                  font-size: 14px;
                  color: #909399;
                }
              }
            }
            
            .selected-questions-preview {
              .preview-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                
                .preview-title {
                  font-size: 14px;
                  font-weight: bold;
                  color: #606266;
                }
                
                .preview-actions {
                  display: flex;
                  gap: 8px;
                }
              }
              
              .preview-list {
                max-height: 300px;
                overflow-y: auto;
                
                .preview-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 12px;
                  margin-bottom: 8px;
                  background: #f8f9fa;
                  border-radius: 8px;
                  border: 1px solid #e9ecef;
                  
                  .preview-content {
                    flex: 1;
                    
                    .preview-text {
                      font-size: 14px;
                      color: #303133;
                      margin-bottom: 5px;
                      line-height: 1.4;
                    }
                    
                    .preview-meta {
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      
                      .preview-difficulty {
                        font-size: 12px;
                        color: #909399;
                      }
                    }
                  }
                  
                  .preview-actions {
                    display: flex;
                    gap: 5px;
                  }
                }
              }
            }
            
            .empty-state {
              text-align: center;
              padding: 40px 20px;
              
              .empty-icon {
                font-size: 48px;
                color: #c0c4cc;
                margin-bottom: 16px;
              }
              
              .empty-text {
                font-size: 16px;
                color: #606266;
                margin-bottom: 8px;
              }
              
              .empty-hint {
                font-size: 14px;
                color: #909399;
              }
            }
            
            .action-buttons {
              margin-top: 20px;
              text-align: center;
              
              .generate-btn {
                width: 100%;
                font-size: 16px;
                padding: 12px 24px;
              }
            }
          }
        }
        
        /* 第二行：题目类型及搜索规则 */
        .second-row-layout {
          .search-rules-panel {
            width: 100%;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 20px;
            
            @media (max-width: 768px) {
              padding: 15px;
              border-radius: 8px;
            }
            
            .panel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              
              h3 {
                font-size: 16px;
                font-weight: bold;
                color: #303133;
                margin: 0;
              }
              
              .panel-subtitle {
                font-size: 14px;
                color: #909399;
              }
            }
            
            .search-rules-collapse {
              .el-collapse-item__header {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 12px 16px;
                font-weight: 600;
                color: #303133;
                border: 1px solid #e9ecef;
                
                &:hover {
                  background: #e9ecef;
                }
              }
              
              .el-collapse-item__content {
                padding: 20px 0;
              }
              
              .search-rules-form {
                .el-form-item {
                  margin-bottom: 20px;
                }
                
                .difficulty-radio-group {
                  margin-top: 10px;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 15px;
                  
                  .el-radio {
                    margin-right: 0;
                  }
                }
                
                .question-type-distribution {
                  margin-top: 10px;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 15px;
                  
                  .type-item {
                    .type-radio {
                      margin-right: 0;
                    }
                  }
                }
                
                .type-distribution-hint {
                  margin-top: 10px;
                  padding: 8px 12px;
                  background: #f0f9ff;
                  border-radius: 6px;
                  font-size: 13px;
                  color: #409eff;
                  border: 1px solid #b3d8ff;
                }
                
                .source-type-selector,
                .year-selector,
                .advanced-options-selector {
                  .source-tags,
                  .year-tags,
                  .advanced-options-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    
                    .source-tag,
                    .year-tag,
                    .advanced-option-tag {
                      line-height: normal;
                      padding: 6px 12px;
                      border: 1px solid #dcdfe6;
                      border-radius: 16px;
                      background: #f8f9fa;
                      cursor: pointer;
                      transition: all 0.3s;
                      font-size: 13px;
                      color: #606266;
                      
                      &:hover {
                        background: #e9ecef;
                        border-color: #409eff;
                      }
                      
                      &.active {
                        background: #409eff;
                        border-color: #409eff;
                        color: white;
                      }
                    }
                  }
                }
                
                .knowledge-selector {
                  width: 100%;
                  
                  .knowledge-input {
                    width: 100%;
                    cursor: pointer;
                    
                    .el-input__inner {
                      cursor: pointer;
                    }
                  }
                  
                  .selected-knowledge-display {
                    margin-top: 8px;
                    
                    .el-tag {
                      font-size: 13px;
                    }
                  }
                }
                
                .search-buttons-container {
                  text-align: center;
                  margin: 30px 0 20px;
                  
                  .third-party-search-btn {
                    padding: 12px 40px;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 8px;
                  }
                }
                
                .search-tips {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 12px 16px;
                  background: #fef7e0;
                  border-radius: 8px;
                  border: 1px solid #f5d659;
                  color: #e6a23c;
                  font-size: 13px;
                  
                  .el-icon-info {
                    font-size: 16px;
                  }
                }
              }
            }
          }
        }
        
        /* 第三行：搜索结果 */
        .third-row-layout {
          width: 100%;
          
          .results-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            
            .card-header {
              .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                .header-left {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  
                  .header-icon {
                    font-size: 18px;
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
                
                .header-right {
                  .refresh-questions-btn-header {
                    border-radius: 6px;
                  }
                }
              }
            }
            
            .search-results {
              .loading-container {
                text-align: center;
                padding: 60px 20px;
                
                .loading-spinner {
                  font-size: 32px;
                  color: #409eff;
                  margin-bottom: 16px;
                  
                  .el-icon-loading {
                    animation: rotating 2s linear infinite;
                  }
                }
                
                .loading-text {
                  font-size: 16px;
                  color: #606266;
                }
              }
              
              .results-list-container {
                .results-list {
                  // max-height: 600px;
                  overflow-y: auto;
                  padding: 10px 0;
                  
                  .result-item {
                    margin-bottom: 20px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 1px solid #e9ecef;
                    transition: all 0.3s;
                    
                    &:hover {
                      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                      border-color: #409eff;
                    }
                    
                    &:last-child {
                      margin-bottom: 0;
                    }
                  }
                }
                
                // 手动分页样式
                .manual-pagination {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 15px 20px;
                  background: #f8f9fa;
                  border-top: 1px solid #e9ecef;
                  margin-top: 10px;
                  
                  .pagination-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    
                    span {
                      font-size: 14px;
                      color: #606266;
                    }
                    
                    .total-info {
                      font-size: 12px;
                      color: #909399;
                    }
                  }
                  
                  .pagination-buttons {
                    display: flex;
                    gap: 10px;
                  }
                }
              }
            }
          }
        }
        
        /* 垂直布局优化 */
        @media (max-width: 768px) {
          gap: 15px;
        }
      }

      .third-party-search-layout {
        display: flex;
        flex-direction: column;
        gap: 20px;
        
        /* 垂直布局优化 */
        @media (max-width: 768px) {
          gap: 15px;
        }
        
        .left-panel {
          width: 100%;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px;
          order: 1;
          
          @media (max-width: 768px) {
            padding: 15px;
            border-radius: 8px;
          }
          
          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0px;
            
            .header-title {
              font-size: 16px;
              font-weight: bold;
              color: #303133;
            }
            
            .panel-subtitle {
              font-size: 14px;
              color: #909399;
            }
          }
          
          .knowledge-tree-container {
            min-height: 200px;
            max-height: 400px;
            display: flex;
            flex-direction: column;
            
            .loading-placeholder {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
              
              .el-empty {
                .el-empty__description {
                  color: #909399;
                  font-size: 14px;
                }
              }
            }
            
            .knowledge-tree {
              max-height: 300px;
              overflow-y: auto;
              
              .custom-tree-node {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 5px 0;
                
                &:hover {
                  background: #f0f9ff;
                }
                
                .el-checkbox {
                  margin-right: 5px;
                }
              }
            }
          }
          
          .selected-knowledge-info {
            margin-top: 20px;
            
            .info-title {
                font-size: 14px;
              font-weight: bold;
                color: #606266;
              margin-bottom: 10px;
            }
            
            .el-tag {
              margin-right: 10px;
            }
          }
        }
        
        .center-panel {
          width: 100%;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px;
          order: 2;
          
          @media (max-width: 768px) {
            padding: 15px;
            border-radius: 8px;
          }
          
          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            
            .header-title {
              font-size: 16px;
              font-weight: bold;
              color: #303133;
            }
            
            .panel-subtitle {
              font-size: 14px;
              color: #909399;
            }
          }
          
          // 搜索规则折叠面板样式
          .search-rules-collapse {
            margin-bottom: 20px;
            
            .el-collapse-item__header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 8px 8px 0 0;
              padding: 15px 20px;
              font-size: 16px;
              font-weight: 600;
              border: none;
              
              &:hover {
                background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
              }
            }
            
            .el-collapse-item__content {
              padding: 0;
              border: none;
            }
          }
          
          .search-rules-form {
            // 紧凑的表单样式
            .el-form-item {
              margin-bottom: 15px;
              
              .el-form-item__label {
                font-weight: 500;
                color: #606266;
                font-size: 13px;
              }
            }
            
            .question-type-distribution {
            display: flex;
            flex-wrap: wrap;
              gap: 12px;
              
              .type-item {
                display: flex;
                align-items: center;
                gap: 6px;
                
                .type-label {
                  font-size: 13px;
                  color: #606266;
                  min-width: 55px;
                }
              }
            }
            

          
                    .third-party-search-btn,
          .refresh-questions-btn {
            // width: 100%;
            margin-top: 15px;
            padding: 10px 18px;
            font-size: 15px;
            border-radius: 6px;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-1px);
                box-shadow: 0 3px 10px rgba(64, 158, 255, 0.3);
              }
            }
            
            // 刷新按钮特殊样式
            &.refresh-questions-btn {
              background: #67c23a;
              border-color: #67c23a;
              
              &:hover {
                background: #85ce61;
                border-color: #85ce61;
                box-shadow: 0 3px 10px rgba(103, 194, 58, 0.3);
              }
            }
          }
        }
        
        .right-panel {
          flex: 1;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px;
          
          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            
            .header-title {
              font-size: 16px;
              font-weight: bold;
              color: #303133;
            }
            
            .panel-subtitle {
              font-size: 14px;
              color: #909399;
            }
          }
          
          
          .selected-stats {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            
            .stat-item {
              text-align: center;
              
              .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #409eff;
              }
              
              .stat-label {
                font-size: 14px;
                color: #909399;
              }
            }
          }
          
          .selected-questions-preview {
            .preview-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              
              .preview-title {
                font-size: 14px;
                font-weight: bold;
                color: #606266;
              }
            }
            
            .preview-list {
              .preview-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 6px;
                margin-bottom: 10px;
                
                .preview-content {
                  flex: 1;
                  
                  .preview-text {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #303133;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }
                  
                  .preview-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 5px;
                    
                    .preview-difficulty {
                      font-size: 12px;
                      color: #909399;
                    }
                  }
                }
                
                .remove-btn {
                  font-size: 16px;
                  color: #f56c6c;
                  cursor: pointer;
                }
              }
            }
          }
          
          .empty-state {
            text-align: center;
            padding: 40px 0;
            color: #909399;
            
            .empty-icon {
              font-size: 64px;
              color: #c0c4cc;
            }
            
            .empty-text {
              font-size: 16px;
              margin-top: 10px;
            }
            
            .empty-hint {
              font-size: 14px;
              color: #909399;
            }
          }
          
          .action-buttons {
            display: flex;
            justify-content: center;
            margin-top: 20px;
            
            .generate-btn {
              font-size: 16px;
              padding: 10px 20px;
              border-radius: 6px;
              background: #409eff;
              color: #fff;
              cursor: pointer;
            }
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
      // 搜索结果容器 - 固定高度滚动
      .results-list-container {
        max-height: 600px;
        overflow-y: auto;
        padding: 20px;
        
        // 自定义滚动条样式
        &::-webkit-scrollbar {
          width: 8px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #c0c4cc 0%, #909399 100%);
          border-radius: 4px;
          
          &:hover {
            background: linear-gradient(135deg, #909399 0%, #606266 100%);
          }
        }
        
        &::-webkit-scrollbar-track {
          background: #f5f7fa;
          border-radius: 4px;
        }
      }
      
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
          border: 1px solid #e4e7ed;
          border-radius: 12px;
          margin-bottom: 20px;
          background: white;
          transition: all 0.3s ease;
          overflow: hidden;
          
          &:hover {
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            border-color: #409eff;
          }
          
          // 题目主体内容布局
          .question-main-content {
            display: flex;
            gap: 20px;
            padding: 20px;
            
            .question-content-left {
              flex: 1;
              min-width: 0;
            }
            
            .question-actions-right {
              width: 140px;
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              padding-top: 10px;
              
              .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                width: 100%;
                
                .action-btn {
                  width: 100%;
                  border-radius: 6px;
                  font-size: 12px;
                  padding: 8px 12px;
                }
              }
            }
          }
          
          .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 1px solid #e4e7ed;
            
            .question-meta {
              display: flex;
              align-items: center;
              gap: 12px;
              flex-wrap: wrap;
              
              .question-type {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                color: white;
                background: #409eff;
                
                &.primary { background: #409eff; }
                &.success { background: #67c23a; }
                &.warning { background: #e6a23c; }
                &.danger { background: #f56c6c; }
                &.info { background: #909399; }
              }
              
              .question-difficulty {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                color: #606266;
                background: #f0f2f5;
                border: 1px solid #d9d9d9;
              }
              
              .question-subject {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                color: #67c23a;
                background: #f0f9ff;
                border: 1px solid #b3d8ff;
              }
            }
          }
          
          .question-main-content {
            display: flex;
            gap: 20px;
            padding: 20px;
            
            .question-content-left {
              flex: 1;
              min-width: 0; // 防止内容溢出
            }
            
            .question-actions-right {
              width: 140px;
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              padding-top: 10px;
              
              .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                width: 100%;
                
                .action-btn {
                  width: 100%;
                  border-radius: 6px;
                  font-size: 12px;
                  padding: 8px 12px;
                  transition: all 0.3s ease;
                  
                  &:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  }
                  
                  &.is-disabled {
                    opacity: 0.6;
                  }
                  
                  i {
                    margin-right: 4px;
                  }
                }
              }
            }
          }
          
          .question-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: #fafafa;
            border-top: 1px solid #e4e7ed;
            border-radius: 0 0 8px 8px;
            
            .question-info {
              .knowledge-point {
                font-size: 13px;
                color: #909399;
                background: #f0f2f5;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #d9d9d9;
              }
            }
            
            .question-buttons {
              .el-button {
                font-size: 13px;
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
            margin-top: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #409eff;
            
            .answer-header {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              font-weight: 600;
              color: #409eff;
              
              .el-icon-edit-outline {
                margin-right: 8px;
                font-size: 16px;
              }
            }
            
            .answer-content {
              color: #606266;
              line-height: 1.6;
              
              ::v-deep {
                p {
                  margin: 5px 0;
                }
                
                strong {
                  color: #409eff;
                }
              }
            }
          }
          
          .question-subject {
            background-color: #67c23a;
            border-color: #67c23a;
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
  
  // 来源类型选择器样式 - 优化后更紧凑
  .source-type-selector {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;

    .source-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 6px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
      min-height: 40px;
      align-items: flex-start;
    }

    .source-tag {
      background-color: #ffffff;
      color: #606266;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e4e7ed;
      user-select: none;
      min-width: 50px;

      &.active {
        background-color: #409eff;
        color: white;
        border-color: #409eff;
        box-shadow: 0 1px 3px rgba(64, 158, 255, 0.2);
      }

      &:hover {
        background-color: #f0f9ff;
        border-color: #409eff;
        color: #409eff;
      }

      &:first-child {
        // "全部"选项特殊样式
        &.active {
          background-color: #67c23a;
          border-color: #67c23a;
          box-shadow: 0 1px 3px rgba(103, 194, 58, 0.2);
        }
        
        &:hover {
          background-color: #f0f9eb;
          border-color: #67c23a;
          color: #67c23a;
        }
      }
    }

    .source-multiple {
      margin-top: 3px;
      font-size: 12px;
      color: #606266;
      
      .el-checkbox {
        margin-right: 0;
        
        .el-checkbox__label {
          color: #606266;
          font-size: 12px;
        }
      }
    }
  }

  // 年份选择器样式 - 优化后更紧凑
  .year-selector {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;

    .year-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 6px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
      min-height: 40px;
      align-items: flex-start;
    }

    .year-tag {
      background-color: #ffffff;
      color: #606266;
      padding: 3px 6px;
      border-radius: 3px;
      font-size: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e4e7ed;
      user-select: none;
      min-width: 40px;
      text-align: center;

      &.active {
        background-color: #409eff;
        color: white;
        border-color: #409eff;
        box-shadow: 0 1px 3px rgba(64, 158, 255, 0.2);
      }

      &:hover {
        background-color: #f0f9ff;
        border-color: #409eff;
        color: #409eff;
      }

      &:first-child {
        // "全部"选项特殊样式
        &.active {
          background-color: #67c23a;
          border-color: #67c23a;
          box-shadow: 0 1px 3px rgba(103, 194, 58, 0.2);
        }
        
        &:hover {
          background-color: #f0f9eb;
          border-color: #67c23a;
          color: #67c23a;
        }
      }
    }

    .year-multiple {
      margin-top: 3px;
      font-size: 12px;
      color: #606266;
      
      .el-checkbox {
        margin-right: 0;
        
        .el-checkbox__label {
          color: #606266;
          font-size: 12px;
        }
      }
    }
  }
  
  // 高级选项选择器样式 - 与年份选择器保持一致
  .advanced-options-selector {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;

    .advanced-options-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 6px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
      min-height: 40px;
      align-items: flex-start;
    }

    .advanced-option-tag {
      background-color: #ffffff;
      line-height: 20px;
      color: #606266;
      padding: 3px 6px;
      border-radius: 3px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e4e7ed;
      user-select: none;
      min-width: 40px;
      text-align: center;

      &.active {
        background-color: #409eff;
        color: white;
        border-color: #409eff;
        box-shadow: 0 1px 3px rgba(64, 158, 255, 0.2);
      }

      &:hover {
        background-color: #f0f9ff;
        border-color: #409eff;
        color: #409eff;
      }

    }
  }
  
  // 响应式设计
  @media (max-width: 1200px) {
    .keyword-search-layout,
    .photo-search-layout {
      flex-direction: column;
      
      .left-panel,
      .center-panel,
      .right-panel {
        flex: none;
        width: 100%;
        margin-bottom: 20px;
      }
    }
  }
  
  @media (max-width: 992px) and (min-width: 769px) {
    .keyword-search-layout,
    .photo-search-layout {
      .left-panel {
        padding: 18px;
        
        .search-conditions {
          .search-options {
            .search-form {
              .el-form-item {
                .difficulty-range {
                  flex-direction: row;
                  justify-content: space-between;
                  
                  .range-input {
                    flex: 1;
                    max-width: 120px;
                  }
                  
                  .range-separator {
                    margin: 0 10px;
                    line-height: 32px;
                  }
                }
              }
            }
          }
        }
        
        .photo-upload-section {
          .upload-area-container {
            .upload-area {
              .upload-features {
                flex-direction: row;
                justify-content: space-around;
                flex-wrap: wrap;
              }
            }
          }
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .app-container {
      padding: 10px;
    }
    
    .search-card .search-content {
      padding: 15px 0;
    }
    
    .keyword-search-layout,
    .photo-search-layout {
      gap: 15px;
      
      .left-panel {
        padding: 15px;
        
        .panel-header {
          margin-bottom: 15px;
          
          h3 {
            font-size: 15px;
          }
          
          .panel-subtitle {
            font-size: 13px;
          }
        }
        
        .search-conditions {
          .main-search-box {
            margin-bottom: 15px;
            
            .search-input {
              .el-input__inner {
                font-size: 14px;
              }
            }
          }
          
          .search-options {
            .search-form {
              .el-form-item {
                margin-bottom: 15px;
                
                .el-form-item__label {
                  font-size: 13px;
                  line-height: 1.4;
                }
                
                .el-select,
                .el-input-number {
                  width: 100%;
                }
                
                .difficulty-range {
                  flex-direction: column;
                  gap: 8px;
                  
                  .range-input {
                    width: 100%;
                  }
                  
                  .range-separator {
                    text-align: center;
                    font-size: 12px;
                  }
                }
              }
            }
          }
          
          .search-actions {
            flex-direction: column;
            gap: 10px;
            
            .el-button {
              width: 100%;
            }
          }
        }
        
        .photo-upload-section {
          .upload-area-container {
            .upload-area {
              padding: 20px 15px;
              
              .upload-icon {
                font-size: 32px;
                margin-bottom: 10px;
              }
              
              .upload-text {
                font-size: 14px;
                margin-bottom: 8px;
              }
              
              .upload-hint {
                font-size: 12px;
                margin-bottom: 15px;
              }
              
              .upload-features {
                flex-direction: column;
                gap: 8px;
                
                .feature-item {
                  font-size: 12px;
                  padding: 6px 12px;
                }
              }
            }
            
            .image-preview {
              .preview-container {
                .preview-image {
                  max-height: 200px;
                }
                
                .image-overlay {
                  .el-button {
                    font-size: 12px;
                    padding: 6px 12px;
                  }
                }
              }
            }
          }
          
          .search-actions {
            .subject-display {
              margin-bottom: 15px;
              
              .teacher-subject-display,
              .admin-subject-display {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
                
                .subject-info {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 5px;
                }
              }
            }
            
            .search-buttons {
              flex-direction: column;
              gap: 10px;
              
              .el-button {
                width: 100%;
              }
            }
          }
        }
      }
    }
    
    .source-type-selector .source-tags,
    .year-selector .year-tags {
      gap: 6px;
      padding: 6px;
      
      .source-tag,
      .year-tag {
        padding: 4px 8px;
        font-size: 11px;
        min-width: 50px;
      }
    }
    
    // 搜索结果响应式
    .results-card {
      .search-results {
        .results-list-container {
          .results-list {
            .result-item {
              .question-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
                
                .question-meta {
                  flex-wrap: wrap;
                  gap: 8px;
                  
                  .question-type,
                  .question-difficulty,
                  .question-subject {
                    font-size: 12px;
                    padding: 4px 8px;
                  }
                }
                
                .question-actions-right {
                  width: 100%;
                  justify-content: center;
                  
                  .action-buttons {
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                    
                    .action-btn {
                      width: 100%;
                      font-size: 12px;
                    }
                  }
                }
              }
              
              .question-content {
                padding: 15px;
                
                .question-text {
                  font-size: 14px;
                  line-height: 1.5;
                }
                
                .question-options {
                  .option-item {
                    padding: 10px 12px;
                    margin-bottom: 8px;
                    
                    .option-label {
                      font-size: 12px;
                      width: 20px;
                      height: 20px;
                      line-height: 20px;
                    }
                    
                    .option-content {
                      font-size: 13px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  // 题目类型分布样式
  .question-type-distribution {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    
    .type-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .type-label {
        font-size: 14px;
        color: #606266;
        white-space: nowrap;
        min-width: 60px;
      }
      

    }
  }
}

.detail-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

// 全局修复el-input-number的样式问题
.el-input-number {
  .el-input__inner {
    color: #606266 !important;
    background-color: #ffffff !important;
    border-color: #dcdfe6 !important;
    
    &:focus {
      border-color: #409eff !important;
      color: #606266 !important;
    }
    
    &:disabled {
      background-color: #f5f7fa !important;
      border-color: #dcdfe6 !important;
      color: #c0c4cc !important;
    }
  }
  
  .el-input-number__decrease,
  .el-input-number__increase {
    background-color: #f5f7fa !important;
    border-color: #dcdfe6 !important;
    color: #606266 !important;
    
    &:hover:not(:disabled) {
      background-color: #409eff !important;
      border-color: #409eff !important;
      color: white !important;
    }
    
    &:disabled {
      background-color: #f5f7fa !important;
      border-color: #dcdfe6 !important;
      color: #c0c4cc !important;
      cursor: not-allowed;
    }
  }
  
  &.is-disabled {
    .el-input__inner {
      background-color: #f5f7fa !important;
      border-color: #dcdfe6 !important;
      color: #c0c4cc !important;
      cursor: not-allowed;
    }
  }
}

// 科目选择器样式优化
.el-select {
  .el-select-dropdown__item {
    &.is-disabled {
      color: #c0c4cc;
      cursor: not-allowed;
      background-color: #f5f7fa;
    }
  }
  
  .el-select-group__wrap {
    .el-select-group__title {
      color: #909399;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 20px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
    }
    
    .el-select-group__list {
      .el-select-dropdown__item {
        padding-left: 30px;
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        &.selected {
          background-color: #409eff;
          color: white;
          
          &:hover {
            background-color: #66b1ff;
          }
        }
      }
    }
  }
}

.teacher-subject-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  
  .el-tag {
    font-weight: 600;
    border: none;
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
  }
  

}
.subject-hint {
    font-size: 12px;
    color: #909399;
    font-style: italic;
}

.loading-subject {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #909399;
  font-size: 14px;
  
  .el-icon-loading {
    font-size: 16px;
    color: #409eff;
    animation: rotating 2s linear infinite;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.debug-info {
  margin-bottom: 20px;
  
  .el-alert {
    border-radius: 8px;
    
    .el-alert__title {
      font-weight: 600;
    }
    
    .el-alert__description {
      margin-top: 8px;
      
      p {
        margin: 4px 0;
        font-size: 13px;
        color: #606266;
      }
    }
  }
}

.knowledge-hint {
  margin-top: 12px;
  
  .knowledge-field {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .field-label {
      font-size: 12px;
      color: #606266;
      margin-right: 8px;
      min-width: 60px;
      font-weight: 500;
    }
    
    .el-tag {
      border-radius: 4px;
      font-size: 12px;
      
      &.el-tag--info {
        background: #f0f9ff;
        border-color: #b3d8ff;
        color: #409eff;
      }
      
      &.el-tag--success {
        background: #f0f9ff;
        border-color: #b3d8ff;
        color: #67c23a;
      }
    }
  }
}

.add-mode-selector {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  
  .el-radio-group {
    display: flex;
    gap: 20px;
    
    .el-radio {
      margin-right: 0;
      
      .el-radio__label {
        font-weight: 500;
        color: #606266;
      }
    }
  }
}

.selected-questions-card {
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid #e4e7ed;
    border-radius: 12px 12px 0 0;
    
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
    }
    
    .header-actions {
      display: flex;
      gap: 10px;
      
      .el-button {
        border-radius: 6px;
        font-weight: 500;
      }
    }
  }
  
  .selected-questions-list {
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
    
    .selected-question-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
      padding: 15px;
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
        transform: translateY(-1px);
      }
      
      .selected-question-content {
        flex: 1;
        margin-right: 15px;
        
        .selected-question-text {
          font-size: 14px;
          line-height: 1.6;
          color: #303133;
          margin-bottom: 8px;
          max-height: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        
        .selected-question-info {
          display: flex;
          gap: 15px;
          align-items: center;
          
          .question-type {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            color: white;
            background: #409eff;
            font-weight: 500;
          }
          
          .question-difficulty {
            font-size: 12px;
            color: #909399;
            background: #f0f2f5;
            padding: 3px 8px;
            border-radius: 4px;
            border: 1px solid #d9d9d9;
          }
        }
      }
      
      .selected-question-actions {
        .el-button {
          border-radius: 4px;
          font-size: 12px;
        }
      }
    }
  }
}

/* 弹窗样式优化 */
.el-dialog {
  border-radius: 12px;
  overflow: hidden;
  
  .el-dialog__header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 20px;
    border-bottom: 1px solid #e4e7ed;
    
    .el-dialog__title {
      font-weight: 600;
      color: #303133;
    }
  }
  
  .el-dialog__body {
    padding: 30px;
  }
  
  .el-dialog__footer {
    padding: 20px;
    border-top: 1px solid #e4e7ed;
    background: #fafafa;
    
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      
      .el-button {
        border-radius: 6px;
        font-weight: 500;
      }
    }
  }
}

/* 滚动条样式 */
.selected-questions-list::-webkit-scrollbar {
  width: 6px;
}

.selected-questions-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.selected-questions-list::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 题目样式 */
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  
  .question-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .question-type {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: white;
      background: #409eff;
      
      &.primary { background: #409eff; }
      &.success { background: #67c23a; }
      &.warning { background: #e6a23c; }
      &.danger { background: #f56c6c; }
      &.info { background: #909399; }
    }
    
    .question-difficulty {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #606266;
      background: #f0f2f5;
      border: 1px solid #d9d9d9;
    }
    
    .question-subject {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #67c23a;
      background: #f0f9ff;
      border: 1px solid #b3d8ff;
    }
  }
  
  .question-actions {
    display: flex;
    gap: 8px;
  }
}

.question-content {
  padding: 20px;
  
  .question-text {
    font-size: 15px;
    line-height: 1.8;
    color: #303133;
    margin-bottom: 15px;
  }
  
  .question-options {
    margin: 15px 0;
    
    .option-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #409eff;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f0f9ff;
        transform: translateX(2px);
      }
      
      .option-label {
        font-weight: bold;
        color: #409eff;
        margin-right: 12px;
        min-width: 24px;
        font-size: 14px;
      }
      
      .option-content {
        flex: 1;
        line-height: 1.6;
        color: #303133;
      }
    }
  }
  
  .sub-questions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #f0f2f5;
    
    .sub-question-item {
      margin-bottom: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #67c23a;
      
      .sub-question-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        
        .sub-question-number {
          font-weight: bold;
          color: #67c23a;
          margin-right: 10px;
          font-size: 14px;
        }
        
        .sub-question-type {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          color: white;
          background: #67c23a;
        }
      }
      
      .sub-question-content {
        line-height: 1.6;
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px solid #e4e7ed;
  border-radius: 0 0 8px 8px;
  
  .question-info {
    .knowledge-point {
      font-size: 13px;
      color: #909399;
      background: #f0f2f5;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
    }
  }
  
  .question-buttons {
    .el-button {
      font-size: 13px;
    }
  }
}

/* 知识点选择器样式优化 */
.el-cascader {
  .el-cascader__label {
    color: #606266;
  }
  
  &.is-error {
    .el-input__inner {
      border-color: #f56c6c;
    }
  }
}

/* 错误提示样式 */
.el-form-item.is-error {
  .el-cascader {
    .el-input__inner {
      border-color: #f56c6c;
    }
  }
  
  .el-form-item__error {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }
}

/* 题目主体内容布局 - 强制应用 */
.question-main-content {
  display: flex !important;
  gap: 20px !important;
  padding: 20px !important;
  flex-direction: row !important;
  
  .question-content-left {
    flex: 1 !important;
    min-width: 0 !important;
    // max-width: calc(100% - 160px) !important;
  }
  
  .question-actions-right {
    width: 140px !important;
    flex-shrink: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    padding-top: 10px !important;
    position: relative !important;
    
    .action-buttons {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
      width: 100% !important;
      position: sticky !important;
      top: 20px !important;
      
      .action-btn {
        width: 100% !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        padding: 8px 12px !important;
        transition: all 0.3s ease !important;
        
        &:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        &.is-disabled {
          opacity: 0.6 !important;
        }
        
        i {
          margin-right: 4px !important;
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .question-main-content {
    flex-direction: column;
    
    .question-actions-right {
      width: 100%;
      flex-direction: row;
      justify-content: center;
      padding-top: 15px;
      border-top: 1px solid #f0f2f5;
      
      .action-buttons {
        flex-direction: row;
        gap: 15px;
        
        .action-btn {
          width: auto;
          min-width: 120px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .question-main-content {
    padding: 15px;
    
    .question-actions-right {
      .action-buttons {
        flex-direction: column;
        gap: 10px;
        
        .action-btn {
          width: 100%;
          min-width: auto;
        }
      }
    }
  }
  
  .question-header {
    padding: 12px 15px;
    
    .question-meta {
      gap: 8px;
      
      .question-type,
      .question-difficulty,
      .question-subject {
        font-size: 11px;
        padding: 3px 6px;
      }
    }
  }
}

/* 强制覆盖可能的冲突样式 */
.question-main-content {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  
  .question-content-left {
    flex: 1 !important;
    margin-right: 20px !important;
  }
  
  .question-actions-right {
    width: 140px !important;
    flex-shrink: 0 !important;
  }
}

/* 关键词搜索和拍照搜题三栏布局样式 */
.keyword-search-layout,
.photo-search-layout {
  display: flex;
  gap: 20px;
  
  .left-panel {
    flex: 1;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px;
    
    .panel-header {
      margin-bottom: 20px;
      
      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .panel-subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .search-conditions {
      .main-search-box {
        margin-bottom: 20px;
        
        .search-input {
          .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;
            
            &:focus {
              border-color: #409eff;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
            }
          }
          
          .search-btn {
            border-radius: 0 8px 8px 0;
            border-left: none;
          }
        }
      }
      
      .search-options {
        .search-form {
          .el-form-item {
            margin-bottom: 15px;
            
            .el-form-item__label {
              font-weight: 500;
              color: #606266;
            }
          }
          
          .difficulty-range {
            display: flex;
            align-items: center;
            gap: 10px;
            
            .range-input {
              flex: 1;
            }
            
            .range-separator {
              color: #909399;
              font-size: 14px;
            }
          }
          
          .search-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            
            .el-button {
              flex: 1;
              border-radius: 6px;
            }
          }
        }
      }
    }
    
    .photo-upload-section {
      .upload-area-container {
        margin-bottom: 20px;
        
        .upload-area {
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            border-color: #409eff;
            background: #f0f9ff;
          }
          
          .upload-icon {
            font-size: 48px;
            color: #c0c4cc;
            margin-bottom: 15px;
          }
          
          .upload-text {
            font-size: 16px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 8px;
          }
          
          .upload-hint {
            font-size: 14px;
            color: #909399;
            margin-bottom: 20px;
          }
          
          .upload-features {
            display: flex;
            justify-content: center;
            gap: 20px;
            
            .feature-item {
              display: flex;
              align-items: center;
              gap: 5px;
              font-size: 12px;
              color: #606266;
              
              i {
                color: #409eff;
              }
            }
          }
        }
        
        .image-preview {
          .preview-container {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            
            .preview-image {
              width: 100%;
              height: auto;
              display: block;
            }
            
            .image-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;
              
              &:hover {
                opacity: 1;
              }
            }
          }
        }
      }
      
      .search-actions {
        margin-bottom: 20px;
        
        .subject-display {
          margin-bottom: 15px;
          
          .teacher-subject-display {
            .subject-info {
              display: flex;
              align-items: center;
              gap: 10px;
              
              .subject-label {
                font-size: 14px;
                color: #606266;
                font-weight: 500;
              }
              
              .subject-hint {
                font-size: 12px;
                color: #909399;
                font-style: italic;
              }
            }
          }
          
          .subject-select {
            margin-bottom: 15px;
          }
          
          .loading-subject {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #909399;
            font-size: 14px;
            
            i {
              color: #409eff;
            }
          }
        }
      }
      
      .photo-tips {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        
        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #606266;
        }
        
        ul {
          margin: 0;
          padding-left: 20px;
          
          li {
            font-size: 12px;
            color: #909399;
            margin-bottom: 5px;
            
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
        
        .search-status {
          margin-top: 15px;
          padding: 10px;
          background: #f0f9ff;
          border-radius: 6px;
          border-left: 3px solid #409eff;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #409eff;
          font-size: 14px;
        }
      }
    }
  }
  
  .center-panel {
    flex: 2;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px;
    
    .panel-header {
      margin-bottom: 20px;
      
      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .panel-subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .results-card {
      .card-header {
        .header-content {
          .header-left {
            display: flex;
            align-items: center;
            gap: 10px;
            
            .header-icon {
              font-size: 20px;
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
      }
      
      .search-results {
        .loading-container {
          text-align: center;
          padding: 40px 0;
          
          .loading-spinner {
            margin-bottom: 15px;
            
            i {
              font-size: 32px;
              color: #409eff;
              animation: rotate 1s linear infinite;
            }
          }
          
          .loading-text {
            color: #909399;
            font-size: 14px;
          }
        }
        
        .results-list-container {
          .results-list {
            .result-item {
              border: 1px solid #e4e7ed;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              background: #fff;
              transition: all 0.3s;
              
              &:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
              }
              
              .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
                
                .question-meta {
                  display: flex;
                  gap: 15px;
                  align-items: center;
                  
                  .question-type {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    
                    &.选择题 {
                      background: #e1f3d8;
                      color: #67c23a;
                    }
                    
                    &.填空题 {
                      background: #fdf6ec;
                      color: #e6a23c;
                    }
                    
                    &.解答题 {
                      background: #f0f9ff;
                      color: #409eff;
                    }
                    
                    &.判断题 {
                      background: #fef0f0;
                      color: #f56c6c;
                    }
                  }
                  
                  .question-difficulty,
                  .question-subject {
                    font-size: 12px;
                    color: #909399;
                  }
                }
                
                .question-actions-right {
                  .action-buttons {
                    .action-btn {
                      border-radius: 6px;
                      font-size: 12px;
                    }
                  }
                }
              }
              
              .question-main-content {
                .question-content-left {
                  .question-content {
                    .question-text {
                      font-size: 14px;
                      line-height: 1.6;
                      color: #303133;
                      margin-bottom: 15px;
                    }
                    
                    .question-options {
                      margin-bottom: 15px;
                      
                      .option-item {
                        display: flex;
                        margin-bottom: 8px;
                        
                        .option-label {
                          font-weight: bold;
                          margin-right: 10px;
                          color: #409eff;
                          min-width: 20px;
                        }
                        
                        .option-content {
                          flex: 1;
                          line-height: 1.5;
                        }
                      }
                    }
                    
                    .sub-questions {
                      margin-top: 15px;
                      padding-left: 20px;
                      border-left: 2px solid #e4e7ed;
                      
                      .sub-question-item {
                        margin-bottom: 15px;
                        
                        .sub-question-header {
                          margin-bottom: 8px;
                          
                          .sub-question-number {
                            font-weight: bold;
                            color: #409eff;
                            margin-right: 8px;
                          }
                          
                          .sub-question-type {
                            color: #909399;
                            font-size: 12px;
                          }
                        }
                        
                        .sub-question-content {
                          line-height: 1.5;
                          color: #606266;
                        }
                      }
                    }
                  }
                  
                  .question-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 15px;
                    border-top: 1px solid #f0f0f0;
                    
                    .question-info {
                      .knowledge-point {
                        color: #909399;
                        font-size: 12px;
                      }
                    }
                    
                    .question-buttons {
                      .el-button {
                        color: #409eff;
                        
                        &:hover {
                          color: #66b1ff;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 0;
          color: #909399;
          
          .empty-icon {
            font-size: 64px;
            color: #c0c4cc;
            margin-bottom: 20px;
          }
          
          .empty-text {
            font-size: 18px;
            margin-bottom: 10px;
            color: #606266;
          }
          
          .empty-hint {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
    
    .initial-state {
      text-align: center;
      padding: 80px 0;
      color: #909399;
      
      .initial-icon {
        font-size: 64px;
        color: #c0c4cc;
        margin-bottom: 20px;
      }
      
      .initial-text {
        font-size: 18px;
        margin-bottom: 10px;
        color: #606266;
      }
      
      .initial-hint {
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .right-panel {
    flex: 1;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px;
    
    .panel-header {
      margin-bottom: 20px;
      
      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .panel-subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .creation-mode-selector {
      margin-bottom: 20px;
      text-align: center;
      
      .el-radio-group {
        .el-radio {
          margin-right: 15px;
          
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
    
    .creation-form {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .el-form-item {
        margin-bottom: 15px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .selected-stats {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
      
      .stat-item {
        text-align: center;
        
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #409eff;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
    
    .selected-questions-preview {
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        .preview-title {
          font-size: 14px;
          font-weight: bold;
          color: #606266;
        }
        
        .preview-actions {
          .el-button {
            font-size: 12px;
            padding: 4px 8px;
          }
        }
      }
      
      .preview-list {
        max-height: 300px;
        overflow-y: auto;
        
        .preview-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 10px;
          border: 1px solid #e4e7ed;
          
          .preview-content {
            flex: 1;
            margin-right: 10px;
            
            .preview-text {
              font-size: 13px;
              line-height: 1.4;
              color: #303133;
              margin-bottom: 8px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            
            .preview-meta {
              display: flex;
              align-items: center;
              gap: 8px;
              
              .preview-difficulty {
                font-size: 11px;
                color: #909399;
              }
            }
          }
          
          .preview-actions {
            display: flex;
            flex-direction: column;
            gap: 5px;
            
            .analysis-btn {
              font-size: 11px;
              padding: 2px 6px;
              color: #409eff;
            }
            
            .remove-btn {
              font-size: 11px;
              padding: 2px 6px;
              color: #f56c6c;
            }
          }
        }
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 0;
      color: #909399;
      
      .empty-icon {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 15px;
      }
      
      .empty-text {
        font-size: 16px;
        margin-bottom: 8px;
        color: #606266;
      }
      
      .empty-hint {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      
      .generate-btn {
        width: 100%;
        font-size: 16px;
        padding: 12px 20px;
        border-radius: 8px;
        background: #409eff;
        color: #fff;
        transition: all 0.3s;
        
        &:hover {
          background: #66b1ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
        }
        
        &:disabled {
          background: #c0c4cc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }
    }
  }
}

/* 三方题库搜题布局样式 */
.third-party-search-layout {
  display: flex;
  gap: 20px;
  // margin-top: 20px;
  
  .left-panel {
    flex: 1;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px;
    
    .panel-header {
      margin-bottom: 20px;
      
      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .panel-subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .knowledge-tree-container {
      .knowledge-tree {
        .custom-tree-node {
          display: flex;
          align-items: center;
          padding: 5px 0;
          
          &:hover {
            background: #f0f9ff;
          }
          
          // 叶子节点样式（可选择）
          &.leaf-node {
            cursor: pointer;
            
            &:hover {
              background: #e6f7ff;
              color: #1890ff;
            }
          }
          
          // 非叶子节点样式（不可选择）
          &.non-leaf-node {
            cursor: not-allowed;
            opacity: 0.6;
            color: #909399;
            
            &:hover {
              background: #f5f5f5;
            }
            
            .non-leaf-hint {
              margin-left: 8px;
              font-size: 12px;
              color: #c0c4cc;
              font-style: italic;
            }
          }
        }
      }
    }
    
    .selected-knowledge-info {
      margin-top: 20px;
      
      .info-title {
        font-size: 14px;
        font-weight: bold;
        color: #606266;
        margin-bottom: 10px;
      }
      
      .el-tag {
        margin-right: 10px;
      }
    }
  }
  
  .center-panel {
    flex: 2;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px;
    
    .panel-header {
      margin-bottom: 20px;
      
      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .panel-subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .search-rules-form {
      .difficulty-radio-group {
        display: flex;
        margin-top: 10px;
        flex-wrap: wrap;
        gap: 10px;
        
        .el-radio {
          margin-right: 0;
          
          .el-radio__label {
            font-size: 13px;
            color: #606266;
          }
        }
      }
      
      .max-questions-display {
        display: flex;
        align-items: center;
        
        .el-tag {
          font-size: 14px;
          padding: 8px 16px;
        }
      }
      
      .max-questions-hint {
        font-size: 12px;
        color: #909399;
        margin-top: 5px;
      }
      
      .question-type-distribution {
        display: flex;
        margin-top: 10px;
        flex-wrap: wrap;
        gap: 10px;
        
        .type-item {
          display: flex;
          align-items: center;
          
          .type-radio {
            margin-right: 0;
            
            .el-radio__label {
              font-size: 13px;
              color: #606266;
            }
          }
        }
      }
      
      .type-distribution-hint {
        font-size: 12px;
        color: #909399;
        margin-top: 6px;
        // padding: 6px;
        background: #f0f9ff;
        border-radius: 3px;
        border-left: 2px solid #409eff;
      }
      
      .source-type-selector,
      .year-selector {
        .source-tags,
        .year-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
          
          .source-tag,
          .year-tag {
            // padding: 6px 12px;
            border: 1px solid #dcdfe6;
            line-height: 20px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 12px;
            
            &:hover {
              border-color: #409eff;
              color: #409eff;
            }
            
            &.active {
              background: #409eff;
              color: #fff;
              border-color: #409eff;
            }
          }
        }
        
        .source-multiple,
        .year-multiple {
          .el-checkbox {
            margin-right: 0;
          }
        }
      }
      
      .advanced-options {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        
        .el-checkbox {
          margin-right: 0;
        }
      }
      
      .third-party-search-btn {
        width: auto;
        margin-top: 20px;
        padding: 12px 20px;
        font-size: 16px;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
        }
      }
    }
  }
  
  .right-panel {
    flex: 1;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px;
    
    .panel-header {
      margin-bottom: 20px;
      
      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .panel-subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
    
    
    .selected-stats {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
      
      .stat-item {
        text-align: center;
        
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
    
    .selected-questions-preview {
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        
        .preview-title {
          font-size: 14px;
          font-weight: bold;
          color: #606266;
        }
      }
      
      .preview-list {
        .preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 10px;
          
          .preview-content {
            flex: 1;
            
            .preview-text {
              font-size: 14px;
              line-height: 1.6;
              color: #303133;
              max-width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .preview-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 5px;
              
              .preview-difficulty {
                font-size: 12px;
                color: #909399;
              }
            }
          }
          
          .remove-btn {
            font-size: 16px;
            color: #f56c6c;
            cursor: pointer;
          }
        }
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 0;
      color: #909399;
      
      .empty-icon {
        font-size: 64px;
        color: #c0c4cc;
      }
      
      .empty-text {
        font-size: 16px;
        margin-top: 10px;
      }
      
      .empty-hint {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      
      .generate-btn {
        font-size: 16px;
        padding: 10px 20px;
        border-radius: 6px;
        background: #409eff;
        color: #fff;
        cursor: pointer;
      }
    }
    
    .search-tips {
      background: #f0f9ff;
      border: 1px solid #b3d8ff;
      border-radius: 6px;
      padding: 12px 16px;
      color: #1890ff;
      margin-top: 15px;
      
      .el-icon-info {
        margin-right: 8px;
        font-size: 16px;
      }
      
      span {
        font-weight: 500;
        font-size: 14px;
        line-height: 1.4;
      }
    }
    
    // 创建表单样式
    .creation-form {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .el-form-item {
        margin-bottom: 10px;
      }
    }
    
    // 预览弹窗样式
    .preview-dialog {
      .preview-dialog-content {
        height: 75vh;
        overflow-y: auto;
      }
      
      .preview-header-info {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        
        .label {
          font-weight: bold;
          color: #606266;
          margin-right: 8px;
        }
      }
      
      .preview-questions-list {
        .preview-question-item {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          background: #fff;
          
          .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e4e7ed;
            
            .question-number {
              font-size: 16px;
              font-weight: bold;
              color: #303133;
            }
            
            .question-meta {
              display: flex;
              gap: 15px;
              align-items: center;
              
              .question-difficulty,
              .question-subject {
                color: #909399;
                font-size: 12px;
              }
            }
          }
          
          .question-content {
            margin-bottom: 15px;
            
            .question-text {
              line-height: 1.6;
              color: #303133;
              margin-bottom: 15px;
            }
            
            .question-options {
              margin-bottom: 15px;
              
              .option-item {
                display: flex;
                margin-bottom: 8px;
                
                .option-label {
                  font-weight: bold;
                  margin-right: 10px;
                  color: #409eff;
                  min-width: 20px;
                }
                
                .option-content {
                  flex: 1;
                  line-height: 1.5;
                }
              }
            }
            
            .sub-questions {
              margin-top: 15px;
              padding-left: 20px;
              border-left: 2px solid #e4e7ed;
              
              .sub-question-item {
                margin-bottom: 15px;
                
                .sub-question-header {
                  margin-bottom: 8px;
                  
                  .sub-question-number {
                    font-weight: bold;
                    color: #409eff;
                    margin-right: 8px;
                  }
                  
                  .sub-question-type {
                    color: #909399;
                    font-size: 12px;
                  }
                }
                
                .sub-question-content {
                  line-height: 1.5;
                  color: #606266;
                }
              }
            }
          }
          
          .question-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 15px;
            border-top: 1px solid #e4e7ed;
            
            .question-info {
              .knowledge-point {
                color: #909399;
                font-size: 12px;
              }
            }
            
            .question-actions {
              display: flex;
              gap: 10px;
            }
          }
        }
      }
    }
    
    // 预览操作按钮样式
    .preview-actions {
      display: flex;
      gap: 10px;
      align-items: center;
      
      .analysis-btn {
        color: #409eff;
        
        &:hover {
          color: #66b1ff;
        }
      }
      
      .remove-btn {
        color: #f56c6c;
        
        &:hover {
          color: #f78989;
        }
      }
    }
    
    // 解析弹窗样式 - 与新增组卷保持一致
    .analysis-dialog {
      .analysis-content {
        max-height: 500px;
        overflow-y: auto;
      }
      
      .loading-section {
        text-align: center;
        padding: 40px 0;
        color: #909399;
        
        .loading-spinner {
          margin-bottom: 15px;
          
          i {
            font-size: 24px;
            color: #409eff;
            animation: rotate 1s linear infinite;
          }
        }
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
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
          
          &:last-child {
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
        }
      }
      
      .question-section,
      .options-section,
      .answer-section,
      .analysis-section,
      .analyse-section,
      .discuss-section,
      .points-section {
        margin-bottom: 20px;
        
        h4 {
          margin-bottom: 10px;
          color: #303133;
          font-size: 16px;
          font-weight: bold;
          border-bottom: 2px solid #409eff;
          padding-bottom: 5px;
        }
      }
      
      .question-content {
        line-height: 1.6;
        color: #303133;
        font-size: 14px;
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
        
        &.correct-option {
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
        
        .correct-option & .option-label {
          color: #67c23a;
        }
        
        .option-content {
          flex: 1;
          line-height: 1.5;
        }
      }
      
      .answer-display {
        margin-top: 10px;
        
        .answer-tag {
          display: inline-block;
          color: black;
          padding: 4px 8px;
          border-radius: 4px;
          margin-right: 5px;
          font-size: 12px;
          
          &.correct {
            background: #67c23a;
            font-weight: bold;
          }
        }
        
        .answer-text {
          background: #f0f9ff;
          padding: 10px;
          border-radius: 4px;
          border-left: 3px solid #67c23a;
          margin-top: 10px;
        }
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
      
      // 滚动条样式
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
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .third-party-search-layout {
    flex-direction: column;
    
    .left-panel,
    .center-panel,
    .right-panel {
      flex: none;
      width: 100%;
    }
  }
}

  // 共享已选题目面板样式
  .shared-selected-questions-card {
    margin-top: 20px;
    
    .shared-selected-questions-list {
      .shared-selected-question-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        background-color: #f8f9fa;
        
        .shared-selected-question-content {
          flex: 1;
          margin-right: 10px;
          
          .shared-selected-question-text {
            margin-bottom: 5px;
            line-height: 1.5;
            color: #303133;
          }
          
          .shared-selected-question-info {
            display: flex;
            gap: 10px;
            font-size: 12px;
            color: #909399;
          }
        }
        
        .shared-selected-question-actions {
          flex-shrink: 0;
        }
      }
    }
  }
  
  // 创建模式选择器样式
  .creation-mode-selector {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    
    .el-radio-group {
      display: flex;
      gap: 20px;
      
      .el-radio {
        margin-right: 0;
        
        .el-radio__label {
          font-size: 14px;
          color: #606266;
        }
      }
  }
}

// 知识点选择弹窗样式
.knowledge-dialog {
  .knowledge-dialog-content {
    min-height: 400px;
    max-height: 500px;
    
    .knowledge-dialog-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f0f9ff;
      border-left: 4px solid #409eff;
      border-radius: 4px;
      margin-bottom: 20px;
      color: #606266;
      font-size: 14px;
      
      i {
        color: #409eff;
        font-size: 16px;
      }
    }
    
    .loading-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }
    
    .knowledge-tree {
      max-height: 350px;
      overflow-y: auto;
      padding: 10px 0;
      
      .custom-tree-node {
        display: flex;
        align-items: center;
        padding: 5px 0;
        
        &:hover {
          background: #f0f9ff;
        }
        
        // 叶子节点样式（可选择）
        &.leaf-node {
          cursor: pointer;
          
          &:hover {
            background: #e6f7ff;
            color: #1890ff;
          }
        }
        
        // 非叶子节点样式（不可选择）
        &.non-leaf-node {
          cursor: not-allowed;
          opacity: 0.6;
          color: #909399;
          
          &:hover {
            background: #f5f5f5;
          }
          
          .non-leaf-hint {
            margin-left: 8px;
            font-size: 12px;
            color: #c0c4cc;
            font-style: italic;
          }
        }
      }
    }
    
    .selected-knowledge-display {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e4e7ed;
      display: flex;
      align-items: center;
      gap: 10px;
      
      .selected-label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
}

</style>