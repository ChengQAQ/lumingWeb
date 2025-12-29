<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>教辅材料上传</h2>
      <p class="page-description">支持Word文档和PDF文档上传，自动解析生成题目内容</p>
    </div>

    <!-- 上传类型选择 -->
    <el-card class="upload-type-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-upload header-icon"></i>
        <span class="header-title">选择上传类型</span>
      </div>

      <div class="upload-type-selector">
        <el-radio-group v-model="uploadType" @change="handleUploadTypeChange">
          <el-radio-button label="word">Word文档上传</el-radio-button>
          <el-radio-button label="pdf">PDF文档上传</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- Word文档上传 -->
    <el-card v-if="uploadType === 'word'" class="upload-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document header-icon"></i>
        <span class="header-title">Word文档上传</span>
        <span class="header-subtitle">支持.docx格式，自动转换为JSON格式</span>
      </div>

      <div class="upload-content">
        <!-- 学科选择和章节路径选择 -->
        <div class="form-section">
          <div class="form-row">
            <!-- 学科选择 -->
            <div class="form-item">
              <h3>选择学科</h3>
              <el-select v-model="wordForm.subject_name" placeholder="请选择学科" class="full-width" @change="handleSubjectChange">
                <el-option-group label="初中科目">
                  <el-option label="初中数学" value="初中数学"></el-option>
                  <el-option label="初中科学" value="初中科学"></el-option>
                  <el-option label="初中语文" value="初中语文"></el-option>
                  <el-option label="初中英语" value="初中英语"></el-option>
                  <el-option label="初中历史" value="初中历史"></el-option>
                  <el-option label="初中政治" value="初中政治"></el-option>
                  <el-option label="初中地理" value="初中地理"></el-option>
                </el-option-group>
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

            <!-- 章节路径选择 -->
            <div class="form-item">
              <h3>选择章节路径</h3>
              <div class="chapter-selector">
                <el-button
                  type="primary"
                  plain
                  @click="openChapterSelector"
                  :disabled="!wordForm.subject_name"
                  class="chapter-select-button"
                >
                  <i class="el-icon-folder-opened"></i>
                  {{ wordForm.chapter_path || '点击选择章节路径' }}
                </el-button>
                <div v-if="wordForm.chapter_path" class="selected-path-display">
                  <el-tag type="success" size="small" closable @close="clearChapterPath">
                    {{ wordForm.chapter_path }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件上传 -->
        <div class="form-section">
          <h3>上传Word文档</h3>
          <el-upload
            ref="wordUpload"
            class="upload-dragger"
            drag
            :action="uploadAction"
            :headers="uploadHeaders"
            :data="wordUploadData"
            :before-upload="beforeWordUpload"
            :on-success="onWordUploadSuccess"
            :on-error="onWordUploadError"
            :on-change="handleWordFileChange"
            :file-list="wordFileList"
            :auto-upload="false"
            accept=".docx"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将Word文档拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传一个.docx文件，且不超过1000MB</div>
          </el-upload>
        </div>

        <!-- 上传按钮 -->
        <div class="upload-actions">
          <el-button
            type="primary"
            size="large"
            :loading="wordUploading"
            :disabled="!wordForm.subject_name || !wordForm.chapter_path || wordFileList.length === 0"
            @click="handleWordUpload"
          >
            <i class="el-icon-upload"></i>
            {{ wordUploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- PDF文档上传 -->
    <el-card v-if="uploadType === 'pdf'" class="upload-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document header-icon"></i>
        <span class="header-title">PDF文档上传</span>
        <span class="header-subtitle">分别上传题目和解析文档</span>
      </div>

      <div class="upload-content">
        <div class="pdf-upload-sections">
          <!-- 题目文档上传 -->
          <div class="pdf-section">
            <h3>题目文档</h3>
            <el-upload
              ref="questionUpload"
              class="upload-dragger"
              drag
              :action="uploadAction"
              :headers="uploadHeaders"
              :data="pdfQuestionUploadData"
              :before-upload="beforePdfUpload"
              :on-success="onPdfQuestionUploadSuccess"
              :on-error="onPdfUploadError"
              :on-change="handlePdfQuestionFileChange"
              :file-list="pdfQuestionFileList"
              :auto-upload="false"
              accept=".pdf"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将题目PDF拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传一个.pdf文件，且不超过1000MB</div>
            </el-upload>
          </div>

          <!-- 解析文档上传 -->
          <div class="pdf-section">
            <h3>解析文档</h3>
            <el-upload
              ref="analysisUpload"
              class="upload-dragger"
              drag
              :action="uploadAction"
              :headers="uploadHeaders"
              :data="pdfAnalysisUploadData"
              :before-upload="beforePdfUpload"
              :on-success="onPdfAnalysisUploadSuccess"
              :on-error="onPdfUploadError"
              :on-change="handlePdfAnalysisFileChange"
              :file-list="pdfAnalysisFileList"
              :auto-upload="false"
              accept=".pdf"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将解析PDF拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传一个.pdf文件，且不超过1000MB</div>
            </el-upload>
          </div>
        </div>

        <!-- 上传按钮 -->
        <div class="upload-actions">
          <el-button
            type="primary"
            size="large"
            :loading="pdfUploading"
            :disabled="pdfQuestionFileList.length === 0 || pdfAnalysisFileList.length === 0"
            @click="handlePdfUpload"
          >
            <i class="el-icon-upload"></i>
            {{ pdfUploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="task-list-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-list header-icon"></i>
        <span class="header-title">任务列表</span>
        <el-button
          type="primary"
          size="small"
          :loading="taskListLoading"
          @click="loadTaskList"
        >
          <i class="el-icon-refresh"></i>
          刷新列表
        </el-button>
      </div>

      <el-table
        :data="taskList"
        v-loading="taskListLoading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
        <el-table-column prop="taskType" label="任务类型" width="120"></el-table-column>
        <el-table-column prop="taskStatus" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTaskStatusType(scope.row.taskStatus)" size="small">
              {{ getTaskStatusText(scope.row.taskStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="taskProgress" label="任务进度" width="120">
          <template slot-scope="scope">
            <div class="task-progress-container">
              <el-tag :type="getTaskProgressType(scope.row.taskProgress)" size="small" style="margin: auto;">
                <el-tooltip :content="scope.row.taskProgress.failureReason" placement="top" effect="dark">
                  <span class="failure-reason-text">
                    {{ getTaskProgressText(scope.row.taskProgress) }}
                  </span>
                </el-tooltip>
              </el-tag>
              <div v-if="scope.row.taskProgress && (scope.row.taskProgress.successCount !== undefined || scope.row.taskProgress.failureCount !== undefined)" class="progress-details">
                <span class="success-count">成功: {{ scope.row.taskProgress.successCount || 0 }}</span>
                <span class="failure-count">失败: {{ scope.row.taskProgress.failureCount || 0 }}</span>
              </div>
              <!-- <div v-if="scope.row.taskProgress && scope.row.taskProgress.failureReason && scope.row.taskProgress.failureReason.trim()" class="failure-reason">
                <el-tooltip :content="scope.row.taskProgress.failureReason" placement="top" effect="dark">
                  <span class="failure-reason-text">
                    <i class="el-icon-warning"></i>
                    失败原因: {{ scope.row.taskProgress.failureReason.length > 50 ? scope.row.taskProgress.failureReason.substring(0, 50) + '...' : scope.row.taskProgress.failureReason }}
                  </span>
                </el-tooltip>
              </div> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="resourceUrl" label="原始资源" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <a v-if="scope.row.resourceUrl" :href="scope.row.resourceUrl" target="_blank" class="resource-link">
              {{ getFileNameFromUrl(scope.row.resourceUrl) }}
            </a>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="newResourceUrl" label="生成资源" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.newResourceUrl">
              <div v-if="isJsonData(scope.row.newResourceUrl)" class="json-data-preview">
                <el-tag type="success" size="mini">JSON数据</el-tag>
                <span class="data-preview">{{ getJsonDataPreview(scope.row.newResourceUrl) }}</span>
              </div>
              <a v-else :href="scope.row.newResourceUrl" target="_blank" class="resource-link">
              {{ getFileNameFromUrl(scope.row.newResourceUrl) }}
            </a>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.taskStatus === 1 && isJsonData(scope.row.newResourceUrl)"
              type="primary"
              size="mini"
              @click="openQuestionEditor(scope.row)"
            >
              校验上传
            </el-button>
            <el-button
              v-if="scope.row.taskStatus === 1 && !isJsonData(scope.row.newResourceUrl)"
              type="info"
              size="mini"
              disabled
            >
              等待处理
            </el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDeleteTask(scope.row)"
              style="margin-left: 5px;"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleTaskListSizeChange"
          @current-change="handleTaskListCurrentChange"
          :current-page="taskListParams.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="taskListParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="taskListTotal"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 章节选择弹窗 -->
    <el-dialog
      title="选择章节路径"
      :visible.sync="chapterDialogVisible"
      width="60%"
      :before-close="handleChapterDialogClose"
    >
      <div class="chapter-selection">
        <div class="chapter-tree">
          <el-tree
            ref="chapterTree"
            :data="chapterTreeData"
            :props="chapterTreeProps"
            node-key="value"
            :default-expand-all="false"
            :default-expanded-keys="expandedKeys"
            :expand-on-click-node="false"
            :highlight-current="true"
            @node-click="handleChapterNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span :class="{
                'selectable-node': isSelectableChapterNode(data),
                'leaf-node': !data.children || data.children.length === 0,
                'parent-node': data.children && data.children.length > 0 && !isSelectableChapterNode(data)
              }">
                {{ node.label }}
                <span v-if="isSelectableChapterNode(data)" class="selectable-indicator">✓</span>
                <span v-else-if="!data.children || data.children.length === 0" class="leaf-indicator"></span>
                <span v-else class="parent-indicator">📁</span>
              </span>
            </span>
          </el-tree>
        </div>

        <div class="selected-chapter">
          <h4>已选择章节路径：</h4>
          <p class="chapter-path">{{ selectedChapterPath || '未选择' }}</p>
          <div v-if="selectedChapterData" class="selected-info">
            <p><strong>选择的节点：</strong>{{ selectedChapterData.label }}</p>
            <p><strong>节点值：</strong>{{ selectedChapterData.value }}</p>
          </div>
          <div class="selection-tip">
            <i class="el-icon-info"></i>
            <span>请选择章节级别（带✓标记的蓝色节点），可以选择：章、节、小节等层级，包括最后的子节点，但不能选择：年级级别。完成后将发送到MQ进行响应</span>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleChapterDialogClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedChapterPath"
          @click="confirmChapterSelection"
        >
          确认选择
        </el-button>
      </div>
    </el-dialog>

    <!-- 系列路径选择弹窗 -->
    <el-dialog
      title="选择系列路径"
      :visible.sync="seriesPathDialogVisible"
      width="60%"
      :before-close="handleSeriesPathDialogClose"
    >
      <div class="series-path-selection">
        <div class="series-path-tree">
          <el-tree
            ref="seriesPathTree"
            :data="seriesPathTreeData"
            :props="seriesPathTreeProps"
            node-key="value"
            :default-expand-all="false"
            :expand-on-click-node="false"
            :highlight-current="true"
            @node-click="handleSeriesPathNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span :class="{
                'selectable-node': isSelectableSeriesPathNode(data),
                'leaf-node': !data.children || data.children.length === 0,
                'parent-node': data.children && data.children.length > 0 && !isSelectableSeriesPathNode(data)
              }">
                {{ node.label }}
                <span v-if="isSelectableSeriesPathNode(data)" class="selectable-indicator">✓</span>
                <span v-else-if="!data.children || data.children.length === 0" class="leaf-indicator"></span>
                <span v-else class="parent-indicator">📁</span>
              </span>
            </span>
          </el-tree>
        </div>

        <div class="selected-series-path">
          <h4>已选择系列路径：</h4>
          <p class="series-path-text">{{ selectedSeriesPath || '未选择' }}</p>
          <div v-if="selectedSeriesPathData" class="selected-info">
            <p><strong>选择的节点：</strong>{{ selectedSeriesPathData.label }}</p>
            <p><strong>节点值：</strong>{{ selectedSeriesPathData.value }}</p>
          </div>
          <div class="selection-tip">
            <i class="el-icon-info"></i>
            <span>请选择系列路径级别（带✓标记的蓝色节点），可以选择：章、节、小节等层级，但不能选择：年级、必修、学科级别或具体的知识点。</span>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleSeriesPathDialogClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedSeriesPath"
          @click="confirmSeriesPathSelection"
        >
          确认选择
        </el-button>
      </div>
    </el-dialog>

    <!-- 校对编辑弹窗 -->
    <el-dialog
      title="校对编辑题目内容"
      :visible.sync="reviewDialogVisible"
      width="90%"
      :before-close="handleReviewDialogClose"
      top="5vh"
    >
      <div class="review-container">
        <div class="review-header">
          <div class="header-info">
            <h4>题目校对编辑</h4>
            <p class="header-tip">
              <i class="el-icon-info"></i>
              请仔细校对题目内容，修改后点击"确认并上传"完成题目上传
            </p>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="toggleEdit">
              <i :class="isEditing ? 'el-icon-view' : 'el-icon-edit'"></i>
              {{ isEditing ? '预览' : '编辑' }}
            </el-button>
            <el-button size="small" @click="resetMarkdownContent">
              <i class="el-icon-refresh"></i>
              重置内容
            </el-button>
          </div>
        </div>

        <div class="review-content">
          <!-- 编辑模式：使用mavon-editor -->
          <div v-if="isEditing" class="edit-mode">
            <!-- 自定义工具栏 -->
            <div class="custom-toolbar">
              <el-button size="small" @click="showImageUploadDialog">
                <i class="el-icon-picture"></i>
                上传图片
              </el-button>
              <span class="toolbar-tip">支持Markdown格式编辑,可以插入图片、表格、公式等</span>
            </div>

            <!-- 符号工具栏 -->
            <SymbolToolbar @insert-symbol="insertQuickText" />

            <mavon-editor
              ref="mdEditor"
              v-model="editingMarkdown"
              :toolbars="toolbars"
              :boxShadow="false"
              :subfield="true"
              :defaultOpen="'preview'"
              :editable="true"
              :toolbarsFlag="true"
              :navigation="false"
              :shortCut="false"
              :codeStyle="'github'"
              :ishljs="true"
              :autofocus="false"
              :placeholder="'请输入题目内容...'"
              :scrollStyle="true"
              :boxShadowStyle="'0 2px 12px 0 rgba(0, 0, 0, 0.1)'"
              :transition="true"
              :previewBackground="'#fff'"
              :html="false"
              :xssOptions="xssOptions"
              @save="saveEdit"
              style="height: 100%;"
            />
          </div>

          <!-- 预览模式：使用marked渲染 -->
          <div v-else class="preview-mode">
            <div ref="markdownContainer" class="markdown-preview" v-html="renderedMarkdown"></div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleReviewDialogClose">取消</el-button>
        <el-button type="warning" @click="validateMarkdownContent">
          <i class="el-icon-check"></i>
          验证格式
        </el-button>
        <el-button
          type="primary"
          :loading="uploadingFromReview"
          @click="confirmReviewAndUpload"
        >
          <i class="el-icon-upload"></i>
          {{ uploadingFromReview ? '上传中...' : '确认并上传' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 知识点选择弹窗 -->
    <el-dialog
      title="选择知识点"
      :visible.sync="knowledgePointsDialogVisible"
      width="80%"
      :before-close="handleKnowledgePointsDialogClose"
    >
      <div class="knowledge-points-selection">
        <div class="selection-header">
          <h4>为每个题目选择对应的知识点</h4>
          <p class="selection-tip">
            <i class="el-icon-info"></i>
            章节路径已添加完成，现在请为每个题目选择最合适的知识点，系统已根据AI分析提供了推荐选项
          </p>
        </div>

        <div class="questions-container">
          <div
            v-for="(selection, index) in questionKnowledgeSelections"
            :key="index"
            class="question-item"
          >
            <div class="question-header">
              <h5>题目 {{ index + 1 }}</h5>
              <div class="confidence-info" v-if="selection.confidence.length > 0">
                <el-tag
                  v-for="(conf, confIndex) in selection.confidence"
                  :key="confIndex"
                  :type="conf >= 0.8 ? 'success' : conf >= 0.6 ? 'warning' : 'danger'"
                  size="mini"
                >
                  {{ (conf * 100).toFixed(0) }}%
                </el-tag>
              </div>
            </div>

            <div class="question-content">
              <p class="question-text">{{ selection.question }}</p>
            </div>

            <div class="knowledge-points-selection">
              <h6>推荐知识点：</h6>
              <div class="available-points">
                <el-tag
                  v-for="(point, pointIndex) in selection.availablePoints"
                  :key="pointIndex"
                  :type="selection.selectedPoints.includes(point) ? 'success' : 'info'"
                  :effect="selection.selectedPoints.includes(point) ? 'dark' : 'plain'"
                  class="knowledge-tag"
                  @click="toggleKnowledgePoint(index, point)"
                >
                  {{ point }}
                  <span v-if="selection.confidence[pointIndex]" class="confidence-score">
                    ({{ (selection.confidence[pointIndex] * 100).toFixed(0) }}%)
                  </span>
                </el-tag>
              </div>

              <div class="custom-selection">
                <h6>或从所有知识点中选择：</h6>
                <el-select
                  v-model="selection.selectedPoints"
                  multiple
                  placeholder="选择知识点"
                  @change="handleKnowledgePointChange(index, $event)"
                  style="width: 100%"
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
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleKnowledgePointsDialogClose">取消</el-button>
        <el-button
          type="primary"
          @click="confirmKnowledgePointsSelection"
        >
          确认选择
        </el-button>
      </div>
    </el-dialog>

    <!-- 题目编辑弹窗 -->
    <el-dialog
      title="题目编辑与上传"
      :visible.sync="questionEditorVisible"
      width="85%"
      :before-close="handleQuestionEditorClose"
      :close-on-click-modal="false"
      top="2vh !important"
      height="96vh !important"
      style="overflow: visible;"
    >
      <!-- 全局设置区域 -->
      <div class="global-settings-section">
        <div class="settings-content">
          <el-form :model="globalSettings">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item style="margin: 10px!important;">
                  <div class="series-settings-row">
                    <div class="series-type-select">
                      <label class="series-type-label">系列类型:</label>
                      <el-select
                        v-model="globalSettings.series_type"
                        placeholder="选择系列类型"
                        style="width: 120px; margin-right: 20px;"
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
                    </div>
                    <div class="series-select">
                      <label class="series-label">系列:</label>
                      <el-select
                        v-model="globalSettings.series"
                        filterable
                        placeholder="选择系列"
                        style="width: 200px; margin-right: 20px;"
                        @change="handleGlobalSeriesChange"
                        @focus="loadSeriesList"
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
                    </div>
                    <div class="series-path-select">
                      <label class="series-path-label">系列路径:</label>
                      <el-button
                        type="primary"
                        plain
                        @click="openSeriesPathSelector"
                        :disabled="!globalSettings.series"
                        class="series-path-select-button"
                      >
                        <i class="el-icon-location"></i>
                        {{ globalSettings.series_path || '点击选择系列路径' }}
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>

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
                :options="{
                  group: 'subQuestions',
                  animation: 200,
                  ghostClass: 'ghost-question',
                  chosenClass: 'chosen-question',
                  dragClass: 'drag-question',
                  handle: '.drag-handle'
                }"
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
                      <!-- <el-tag size="mini" type="primary">{{ subQuestion.qtype || subQuestion.catename || '未知题型' }}</el-tag> -->
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
                      <!-- <el-tag size="mini" type="success">{{ subQuestion.subject_name || question.subject_name || question.subject || '未知学科' }}</el-tag> -->
                      <!-- <el-tag size="mini" type="warning">子题</el-tag> -->
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
                      <el-select v-model="currentQuestion.subject_name" placeholder="请选择学科" style="width: 100%" @change="handleQuestionSubjectChange">
                        <el-option-group label="初中科目">
                          <el-option label="初中数学" value="初中数学"></el-option>
                          <el-option label="初中科学" value="初中科学"></el-option>
                          <el-option label="初中语文" value="初中语文"></el-option>
                          <el-option label="初中英语" value="初中英语"></el-option>
                          <el-option label="初中历史" value="初中历史"></el-option>
                          <el-option label="初中政治" value="初中政治"></el-option>
                          <el-option label="初中地理" value="初中地理"></el-option>
                        </el-option-group>
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
              <!-- 父题目信息（仅子题目显示）
              <div v-if="!currentQuestion.isMainQuestion && currentQuestion.parentQuestion" class="parent-question-section">
                <div class="parent-question-header">
                  <i class="el-icon-info"></i>
                  <span>父题目信息</span>
                </div>
                <div class="parent-question-content">
                  <div class="content-preview" v-html="renderMarkdown(currentQuestion.parentQuestion.question)"></div>
                </div>
              </div> -->

              <!-- 当前题目内容 -->
              <div class="current-question-content">
                <div v-if="!currentQuestion.isMainQuestion" class="sub-question-label">
                  <el-tag size="mini" type="warning">子题内容</el-tag>
                </div>
                <div class="content-preview" v-html="renderMarkdown(currentQuestion.content || currentQuestion.question || '题目内容为空')"></div>
              </div>
            </div>
          </div>

          <!-- 选项编辑（如果是选择题） -->
          <div class="options-section" v-if="currentQuestion.options && currentQuestion.options.length > 0">
            <div class="field-header">
              <span class="field-label">选项</span>
              <el-button size="mini" type="primary" @click="openEditDialog('options')">
                <i class="el-icon-edit"></i>
                修改/编辑
              </el-button>
            </div>
            <div class="field-content">
              <div class="options-preview">
                <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
                  <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                  <span class="option-content" v-html="renderMarkdown(option)"></span>
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
              <div class="content-preview" v-html="renderMarkdown(ensureString(currentQuestion.displayanswer || currentQuestion.answers) || '答案为空')"></div>
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
        <el-button @click="handleQuestionEditorClose">取消</el-button>
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
    </el-dialog>

    <!-- 内容编辑弹窗 -->
    <el-dialog
      :title="editDialogTitle"
      :visible.sync="editDialogVisible"
      width="80%"
      :before-close="handleEditDialogClose"
      top="5vh"
    >
      <div class="edit-dialog-container">
        <div class="edit-header">
          <div class="header-info">
            <h4>{{ editDialogTitle }}</h4>
            <p class="header-tip">
              <i class="el-icon-info"></i>
              支持Markdown格式编辑，可以插入图片、表格、公式等
            </p>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="toggleEditMode">
              <i :class="questionEditing ? 'el-icon-view' : 'el-icon-edit'"></i>
              {{ questionEditing ? '预览' : '编辑' }}
            </el-button>
            <el-button size="small" @click="resetEditContent">
              <i class="el-icon-refresh"></i>
              重置内容
            </el-button>
          </div>
        </div>

        <div class="edit-content">
          <!-- 编辑模式：使用mavon-editor -->
          <div v-if="questionEditing" class="edit-mode">
            <!-- 自定义工具栏 -->
            <div class="custom-toolbar">
              <el-button size="small" @click="showImageUploadDialog">
                <i class="el-icon-picture"></i>
                上传图片
              </el-button>
              <span class="toolbar-tip">支持Markdown格式编辑,可以插入图片、表格、公式等</span>

              <!-- 图片预览区域 -->
              <div v-if="imageUrl" class="image-preview-section">
                <div class="image-preview-wrapper">
                  <img
                    :src="imageUrl"
                    :alt="selectedFile ? selectedFile.name : '图片预览'"
                    class="toolbar-image-preview"
                    @error="handleImageError"
                  />
                  <div class="image-actions">
                    <el-button size="mini" @click="copyImageUrl" icon="el-icon-copy-document">复制链接</el-button>
                    <el-button size="mini" @click="insertImageToEditor" type="primary" icon="el-icon-picture">插入图片</el-button>
                    <el-button size="mini" @click="clearImagePreview" icon="el-icon-close">清除</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 符号工具栏 -->
            <SymbolToolbar @insert-symbol="insertQuickTextToEditor" />

            <mavon-editor
              ref="editEditor"
              v-model="editingContent"
              :toolbars="questionToolbars"
              :boxShadow="false"
              :subfield="true"
              :defaultOpen="'edit'"
              :editable="true"
              :toolbarsFlag="true"
              :navigation="false"
              :shortCut="false"
              :codeStyle="'github'"
              :ishljs="true"
              :autofocus="false"
              :placeholder="editPlaceholder"
              :scrollStyle="true"
              :boxShadowStyle="'0 2px 12px 0 rgba(0, 0, 0, 0.1)'"
              :transition="true"
              @change="autoSaveEditContent"
              :previewBackground="'#fff'"
              :html="false"
              :xssOptions="xssOptions"
              style="height: 400px;"
            />
          </div>

          <!-- 预览模式：使用marked渲染 -->
          <div v-else class="preview-mode">
            <div ref="editMarkdownContainer" class="markdown-preview" v-html="renderedEditMarkdown"></div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleEditDialogClose">取消</el-button>
        <el-button type="primary" @click="saveEditContent">
          <i class="el-icon-check"></i>
          保存修改
        </el-button>
      </div>
    </el-dialog>

    <!-- 图片上传弹框 -->
    <el-dialog
      title="上传图片"
      :visible.sync="imageUploadVisible"
      width="500px"
      :before-close="handleImageUploadClose"
    >
      <div class="image-upload-container">
        <div class="upload-section">
          <h4>选择学科</h4>
          <el-select
            v-model="selectedSubject"
            placeholder="请选择学科"
            class="full-width"
            :loading="teacherInfoLoading"
          >
            <el-option
              v-for="subject in subjectOptions"
              :key="subject"
              :label="subject"
              :value="subject"
            />
          </el-select>
          <div v-if="selectedSubject && currentQuestion && currentQuestion.subject_name"
               class="auto-selected-tip">
            <i class="el-icon-check"></i>
            已自动选择当前题目的学科：{{ selectedSubject }}
            <span v-if="currentQuestion.subject_name !== selectedSubject" class="original-subject">
              (原科目：{{ currentQuestion.subject_name }})
            </span>
          </div>
        </div>

        <div class="upload-section">
          <h4>选择图片文件</h4>
          <el-upload
            class="image-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-success="handleImageUploadSuccess"
            :on-error="handleImageUploadError"
            :on-change="handleFileChange"
            action=""
            :auto-upload="false"
            accept="image/*"
          >
            <el-button size="small" type="primary" :disabled="!selectedSubject">
              <i class="el-icon-upload"></i>
              选择图片
            </el-button>
          </el-upload>
          <p class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</p>
          <div v-if="selectedFile" class="file-info">
            <p><strong>已选择文件：</strong>{{ selectedFile.name }}</p>
            <p><strong>文件大小：</strong>{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>

        <div v-if="imageUrl" class="upload-section">
          <h4>图片预览</h4>
          <div class="image-preview-container">
            <img
              :src="imageUrl"
              :alt="selectedFile ? selectedFile.name : '图片预览'"
              class="image-preview"
              @error="handleImageError"
            />
            <div class="image-link-section">
              <h5>图片链接</h5>
              <el-input
                v-model="imageUrl"
                readonly
                placeholder="图片上传后将显示链接"
                class="image-link-input"
              >
                <el-button slot="append" @click="copyImageUrl">复制</el-button>
              </el-input>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleImageUploadClose">取消</el-button>
        <el-button
          type="primary"
          @click="insertImageToEditor"
          :disabled="!selectedFile || !selectedSubject"
        >
          <i class="el-icon-picture"></i>
          插入图片
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { wordToJson, formatJson, addKnowledge, checkTaskStatus, getChapterTree, getTaskList, deleteTask, getTaskJson, uploadQuestion, getQuestionTypes, updateTaskProgress, getKnowledgePoints } from "@/api/system/teachingMaterials"
import { getChapterMap } from "@/api/system/chapterTitle"
import { listSeries } from "@/api/system/series"
import { getToken } from "@/utils/auth"
import { getInfo } from "@/api/login"
import { getTeacherInfo, uploadImage } from "@/api/system/teacher"
import { mavonEditor } from 'mavon-editor'
import * as marked from 'marked'
import 'mavon-editor/dist/css/index.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { QUESTION_TYPE_MAPPINGS, getQuestionTypes as getQuestionTypesFromUtils, getQuestionTypeCode, formatQuestionTypeOptions, getQuestionTypeByCode } from "@/utils/questionTypeMappings"
import draggable from 'vuedraggable'
import SymbolToolbar from '@/components/SymbolToolbar'

export default {
  name: "TeachingMaterials",
  components: {
    mavonEditor,
    draggable,
    SymbolToolbar
  },
  data() {
    return {
      // 上传类型
      uploadType: 'word',

      // Word上传相关
      wordForm: {
        subject_name: '',
        chapter_path: ''
      },
      wordFileList: [],
      wordUploading: false,

      // PDF上传相关
      pdfQuestionFileList: [],
      pdfAnalysisFileList: [],
      pdfUploading: false,

      // 任务监控
      currentTaskId: null,
      currentTaskData: null,
      taskStatus: 'pending',
      checkingStatus: false,

      // 任务列表
      taskList: [],
      taskListLoading: false,
      showTaskList: true,
      taskListParams: {
        pageNum: 1,
        pageSize: 10
      },
      taskListTotal: 0,

      // 章节选择
      chapterDialogVisible: false,
      chapterTreeData: [],
      chapterTreeProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      selectedChapterPath: '',
      selectedChapterData: null,
      expandedKeys: [], // 用于控制树节点的展开状态

      // 系列路径选择
      seriesPathDialogVisible: false,
      seriesPathTreeData: [],
      seriesPathTreeProps: {
        children: 'children',
        label: 'label',
        value: 'value'
      },
      selectedSeriesPath: '',
      selectedSeriesPathData: null,

      // 知识点选择
      knowledgePointsDialogVisible: false,
      availableKnowledgePoints: [],
      questionKnowledgeSelections: [], // 存储每个题目选择的知识点
      currentQuestionData: [], // 当前处理的题目数据
      knowledgePointsLoading: false, // 知识点加载状态

      // 校对编辑相关
      reviewDialogVisible: false,
      markdownContent: '',
      renderedMarkdown: '',
      editingMarkdown: '',
      isEditing: false,
      originalQuestionData: [], // 原始题目数据
      uploadingFromReview: false,

      // mavon-editor配置
      toolbars: {
        bold: true,
        italic: true,
        header: true,
        underline: true,
        strikethrough: true,
        mark: true,
        superscript: true,
        subscript: true,
        quote: true,
        ol: true,
        ul: true,
        link: true,
        imagelink: false, // 禁用图片链接功能
        code: true,
        table: true,
        fullscreen: true,
        readmodel: true,
        htmlcode: true,
        help: true,
        undo: true,
        redo: true,
        trash: true,
        save: false,
        navigation: true,
        alignleft: true,
        aligncenter: true,
        alignright: true,
        subfield: true,
        preview: true
      },

      // 自定义工具栏按钮
      customToolbars: [
        {
          name: 'upload-image',
          icon: 'el-icon-picture',
          title: '上传图片',
          action: this.showImageUploadDialog
        }
      ],

      // 上传配置
      uploadAction: process.env.VUE_APP_BASE_API + '/system/mqAi/wordToJson',
      uploadHeaders: {
        'Authorization': 'Bearer ' + getToken()
      },

      // 题目编辑相关
      questionEditorVisible: false,
      questions: [],
      currentQuestionIndex: '0',
      questionEditing: true, // 重命名为questionEditing避免冲突
      uploadingQuestions: false,
      availableKnowledgePoints: [],

      // 用户角色信息
      userRole: null, // 用户角色：0-老师，1-管理员，2-普通管理员

      // 拖拽相关
      draggingSubQuestion: false,

      // 题型选择相关
      questionTypes: [],
      questionTypesLoading: false,
      questionTypeOptions: [], // 格式化的题型选项

      // 新增参数相关
      availableTags: [],
      availableTopics: [], // 可用主题/话题列表
      availableSources: ['麓鸣上传'],
      seriesList: [],
      seriesLoading: false,

      // 系列类型选项
      seriesTypeOptions: [
        { label: '书', value: '书' },
        { label: '试卷', value: '试卷' },
        { label: '视频', value: '视频' }
      ],

      // 全局设置
      globalSettings: {
        series_type: '', // 系列类型：书/试卷/视频
        series: null,
        series_path: ''
      },

      // 编辑弹窗相关
      editDialogVisible: false,
      editDialogType: '', // question, analysis, options, answer
      editDialogTitle: '',
      editingContent: '',
      editPlaceholder: '',
      renderedEditMarkdown: '',

      // 图片上传相关
      teacherInfo: null,
      teacherInfoLoading: false,
      imageUploadVisible: false,
      imageFile: null,
      selectedFile: null,
      imageUrl: '',
      selectedSubject: '',
      subjectOptions: [],

      // 题目编辑器工具栏配置
      questionToolbars: {
        bold: true,
        italic: true,
        header: true,
        underline: true,
        strikethrough: true,
        mark: true,
        superscript: true,
        subscript: true,
        quote: true,
        ol: true,
        ul: true,
        link: true,
        imagelink: false, // 禁用图片链接功能
        code: true,
        table: true,
        fullscreen: true,
        readmodel: true,
        htmlcode: true,
        help: true,
        undo: true,
        redo: true,
        trash: true,
        save: false,
        navigation: true,
        alignleft: true,
        aligncenter: true,
        alignright: true,
        subfield: true,
        preview: true
      }
    }
  },
  computed: {
    wordUploadData() {
      return {
        subject_name: this.wordForm.subject_name,
        path: this.wordForm.chapter_path
      }
    },
    currentQuestion() {
      console.log('计算currentQuestion:', {
        currentQuestionIndex: this.currentQuestionIndex,
        questionsLength: this.questions.length
      })

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
    pdfQuestionUploadData() {
      return {
        type: 'question'
      }
    },
    pdfAnalysisUploadData() {
      return {
        type: 'analysis'
      }
    },
    // 根据系列类型过滤系列列表
    filteredSeriesList() {
      if (!this.globalSettings.series_type || !this.seriesList.length) {
        return this.seriesList
      }

      return this.seriesList.filter(series => {
        // 直接根据type字段匹配
        return series.type === this.globalSettings.series_type
      })
    },
    xssOptions() {
      return {
        whiteList: {
          h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
          p: [], div: [], span: [], strong: [], em: [], b: [], i: [],
          ul: [], ol: [], li: [], blockquote: [], code: [], pre: [],
          table: [], thead: [], tbody: [], tr: [], th: [], td: [],
          a: ['href', 'title'], img: ['src', 'alt', 'title'],
          hr: [], br: []
        }
      }
    }
  },
  mounted() {
    this.loadChapterTree()
    // 先获取用户角色信息，再加载任务列表和系列列表
    this.getUserRole().then(() => {
      this.testApiConnection().then(() => {
        this.loadTaskList()
      })
      // 加载系列列表
      this.loadSeriesList()
    })

    // 测试LaTeX渲染功能
    this.testLatexRendering()

    // 测试题型映射导入
    console.log('题型映射导入测试:', {
      QUESTION_TYPE_MAPPINGS: Object.keys(QUESTION_TYPE_MAPPINGS),
      getQuestionTypesFromUtils: typeof getQuestionTypesFromUtils,
      getQuestionTypeCode: typeof getQuestionTypeCode,
      formatQuestionTypeOptions: typeof formatQuestionTypeOptions
    })
  },
  methods: {
    // 获取用户角色信息
    async getUserRole() {
      try {
        const response = await getInfo()
        if (response.code === 200 && response.user) {
          const roles = response.user.roles || []
          console.log('用户角色信息:', roles)

          // 根据角色判断用户类型
          if (roles.includes('admin')) {
            this.userRole = 1 // 管理员
          } else if (roles.includes('teacher')) {
            this.userRole = 0 // 老师
          } else {
            this.userRole = 2 // 普通管理员
          }

          console.log('用户角色映射:', this.userRole)
        } else {
          console.warn('获取用户信息失败，使用默认角色')
          this.userRole = 0 // 默认老师角色
        }
      } catch (error) {
        console.error('获取用户角色失败:', error)
        this.userRole = 0 // 默认老师角色
      }
    },

    // 获取题型列表
    loadQuestionTypes(subjectName) {
      if (!subjectName) {
        this.questionTypeOptions = []
        return
      }

      this.questionTypesLoading = true
      try {
        // 使用独立的题型映射工具函数
        const typeMapping = getQuestionTypesFromUtils(subjectName)
        if (typeMapping && Object.keys(typeMapping).length > 0) {
          this.questionTypes = typeMapping
          // 使用工具函数格式化题型数据为选项格式
          this.questionTypeOptions = formatQuestionTypeOptions(subjectName)
          console.log(`学科 ${subjectName} 的题型选项:`, this.questionTypeOptions)
        } else {
          console.warn(`未找到学科 ${subjectName} 的题型映射`)
          this.questionTypeOptions = []
          this.$message.warning(`暂不支持学科 ${subjectName} 的题型选择`)
        }
      } catch (error) {
        console.error('获取题型列表失败:', error)
        this.$message.error('获取题型列表失败，请稍后重试')
        this.questionTypeOptions = []
      } finally {
        this.questionTypesLoading = false
      }
    },

    // 处理学科变化
    handleSubjectChange(subjectName) {
      console.log('学科变化:', subjectName)
      // 清空章节路径
      this.wordForm.chapter_path = ''
      // 重新加载题型选项
      this.loadQuestionTypes(subjectName)

      // 如果选择了学科，自动打开章节选择弹窗
      if (subjectName) {
        this.openChapterSelectorWithSubject(subjectName)
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

            // 可以根据题型变化做一些特殊处理
            this.handleQuestionTypeSpecificChanges(value, subQuestion)
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

            // 可以根据题型变化做一些特殊处理
            this.handleQuestionTypeSpecificChanges(value, mainQuestion)
          }
        }
      }
    },

    // 处理题目学科变化
    handleQuestionSubjectChange(subjectName) {
      console.log('题目学科变化:', subjectName)
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            const subQuestion = mainQuestion.children[subIndex]
            subQuestion.subject_name = subjectName

            // 如果学科变化，重新加载题型选项
            this.loadQuestionTypes(subjectName)

            // 根据学科和当前题型更新cate字段
            if (subQuestion.qtype && subjectName && subjectName !== '未指定科目') {
              const cateValue = getQuestionTypeCode(subjectName, subQuestion.qtype)
              if (cateValue > 0) {
                subQuestion.cate = cateValue
                subQuestion.catename = subQuestion.qtype
                console.log(`子题学科更新 - 学科: ${subjectName}, 题型: ${subQuestion.qtype}, cate: ${cateValue}`)
              } else {
                console.warn(`未找到学科 ${subjectName} 的题型 ${subQuestion.qtype} 对应的cate值`)
                subQuestion.cate = 0 // 默认值
              }
            }
          }
        } else {
          // 主题目：保存到原始数据结构中
          const index = parseInt(this.currentQuestionIndex)
          const mainQuestion = this.questions[index]
          if (mainQuestion) {
            mainQuestion.subject_name = subjectName

            // 如果学科变化，重新加载题型选项
            this.loadQuestionTypes(subjectName)

            // 根据学科和当前题型更新cate字段
            if (mainQuestion.qtype && subjectName && subjectName !== '未指定科目') {
              const cateValue = getQuestionTypeCode(subjectName, mainQuestion.qtype)
              if (cateValue > 0) {
                mainQuestion.cate = cateValue
                mainQuestion.catename = mainQuestion.qtype
                console.log(`主题学科更新 - 学科: ${subjectName}, 题型: ${mainQuestion.qtype}, cate: ${cateValue}`)
              } else {
                console.warn(`未找到学科 ${subjectName} 的题型 ${mainQuestion.qtype} 对应的cate值`)
                mainQuestion.cate = 0 // 默认值
              }
            }
          }
        }
      }
    },

    // 根据题型进行特殊处理
    handleQuestionTypeSpecificChanges(questionType, questionObj = null) {
      const targetQuestion = questionObj || this.currentQuestion
      if (!targetQuestion) return

      // 根据不同的题型进行特殊处理
      if (questionType === '选择题' || questionType === '多选题') {
        // 选择题需要选项
        if (!targetQuestion.options || targetQuestion.options.length === 0) {
          targetQuestion.options = ['', '', '', '']
        }
      } else if (questionType === '填空题') {
        // 填空题可能需要特殊处理
        if (!targetQuestion.answers || targetQuestion.answers.length === 0) {
          targetQuestion.answers = ['']
        }
      }
    },

    // 处理上传类型变化
    handleUploadTypeChange(type) {
      this.resetUploadData()
    },

    // 重置上传数据
    resetUploadData() {
      this.wordFileList = []
      this.pdfQuestionFileList = []
      this.pdfAnalysisFileList = []
      this.wordForm.subject_name = ''
      this.wordForm.chapter_path = ''
      this.currentTaskId = null
      this.currentTaskData = null
      this.taskStatus = 'pending'
      // 清空系列相关字段
      this.globalSettings.series_type = ''
      this.globalSettings.series = null
      this.globalSettings.series_path = ''
    },

    // 打开章节选择器
    openChapterSelector() {
      if (!this.wordForm.subject_name) {
        this.$message.warning('请先选择学科')
        return
      }

      // 重置章节选择状态
      this.selectedChapterPath = ''
      this.selectedChapterData = null
      this.expandedKeys = []

      this.chapterDialogVisible = true

      // 弹窗打开时重新加载章节树数据
      this.loadChapterTree()

      this.$message.info('请选择章节路径')
    },

    // 根据学科打开章节选择器
    openChapterSelectorWithSubject(subjectName) {
      console.log('根据学科打开章节选择器:', subjectName)

      // 重置章节选择状态
      this.selectedChapterPath = ''
      this.selectedChapterData = null
      this.expandedKeys = []

      this.chapterDialogVisible = true

      // 加载并过滤章节树数据
      this.loadChapterTreeForSubject(subjectName)

      this.$message.info(`请选择${subjectName}的章节路径`)
    },

    // 清除章节路径
    clearChapterPath() {
      this.wordForm.chapter_path = ''
      this.$message.info('已清除章节路径')
    },

    // 打开系列路径选择器
    openSeriesPathSelector() {
      if (!this.globalSettings.series) {
        this.$message.warning('请先选择系列')
        return
      }

      // 重置系列路径选择状态
      this.selectedSeriesPath = ''
      this.selectedSeriesPathData = null

      this.seriesPathDialogVisible = true

      // 弹窗打开时重新加载系列路径树数据
      this.loadSeriesPathTree()

      this.$message.info('请选择系列路径')
    },

    // 清除系列路径
    clearSeriesPath() {
      this.globalSettings.series_path = ''
      this.$message.info('已清除系列路径')
    },

    // Word上传前检查
    beforeWordUpload(file) {
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      const isLt1000M = file.size / 1024 / 1024 < 1000

      if (!isDocx) {
        this.$message.error('只能上传.docx格式的Word文档!')
        return false
      }
      if (!isLt1000M) {
        this.$message.error('上传文件大小不能超过 1000MB!')
        return false
      }
      return true
    },

    // PDF上传前检查
    beforePdfUpload(file) {
      const isPdf = file.type === 'application/pdf'
      const isLt1000M = file.size / 1024 / 1024 < 1000

      if (!isPdf) {
        this.$message.error('只能上传.pdf格式的PDF文档!')
        return false
      }
      if (!isLt1000M) {
        this.$message.error('上传文件大小不能超过 1000MB!')
        return false
      }
      return true
    },

    // 处理Word文件选择变化
    handleWordFileChange(file, fileList) {
      // 只保留最后一个文件，实现覆盖效果
      this.wordFileList = fileList.slice(-1)
    },

    // 处理PDF题目文件选择变化
    handlePdfQuestionFileChange(file, fileList) {
      // 只保留最后一个文件，实现覆盖效果
      this.pdfQuestionFileList = fileList.slice(-1)
    },

    // 处理PDF解析文件选择变化
    handlePdfAnalysisFileChange(file, fileList) {
      // 只保留最后一个文件，实现覆盖效果
      this.pdfAnalysisFileList = fileList.slice(-1)
    },

    // 处理Word上传
    handleWordUpload() {
      if (!this.wordForm.subject_name) {
        this.$message.error('请选择学科')
        return
      }
      if (!this.wordForm.chapter_path) {
        this.$message.error('请选择章节路径')
        return
      }
      if (this.wordFileList.length === 0) {
        this.$message.error('请选择要上传的Word文档')
        return
      }

      this.wordUploading = true
      this.$refs.wordUpload.submit()
    },

    // Word上传成功
    onWordUploadSuccess(response, file, fileList) {
      this.wordUploading = false
      if (response.code === 200) {
        this.currentTaskId = response.data
        this.taskStatus = 'processing'
        this.$message.success('Word文档上传成功，开始转换处理...')
        this.$message.info('请等待转换完成，可以点击"检查状态"查看进度')
        // 上传成功后自动刷新任务列表
        this.loadTaskList()
        // 清空上传表单数据和文件列表
        this.resetUploadData()
      } else {
        this.$message.error('上传失败：' + response.msg)
      }
    },

    // Word上传失败
    onWordUploadError(error) {
      this.wordUploading = false
      this.$message.error('上传失败：' + error.message)
    },

    // 处理PDF上传
    handlePdfUpload() {
      if (this.pdfQuestionFileList.length === 0) {
        this.$message.error('请选择题目PDF文档')
        return
      }
      if (this.pdfAnalysisFileList.length === 0) {
        this.$message.error('请选择解析PDF文档')
        return
      }

      this.pdfUploading = true
      // 先上传题目文档
      this.$refs.questionUpload.submit()
    },

    // PDF题目上传成功
    onPdfQuestionUploadSuccess(response, file, fileList) {
      if (response.code === 200) {
        // 题目上传成功后，上传解析文档
        this.$refs.analysisUpload.submit()
      } else {
        this.pdfUploading = false
        this.$message.error('题目文档上传失败：' + response.msg)
      }
    },

    // PDF解析上传成功
    onPdfAnalysisUploadSuccess(response, file, fileList) {
      this.pdfUploading = false
      if (response.code === 200) {
        this.currentTaskId = response.data
        this.taskStatus = 'processing'
        this.$message.success('PDF文档上传成功，开始转换处理...')
        this.$message.info('请等待转换完成，可以点击"检查状态"查看进度')
        // 上传成功后自动刷新任务列表
        this.loadTaskList()
        // 清空上传表单数据和文件列表
        this.resetUploadData()
      } else {
        this.$message.error('解析文档上传失败：' + response.msg)
      }
    },

    // PDF上传失败
    onPdfUploadError(error) {
      this.pdfUploading = false
      this.$message.error('上传失败：' + error.message)
    },

    // 检查任务状态
    async checkTaskStatus() {
      if (!this.currentTaskId) {
        this.$message.error('没有可检查的任务')
        return
      }

      this.checkingStatus = true
      try {
        const response = await checkTaskStatus(this.currentTaskId)
        if (response.code === 200) {
          const status = response.data.status
          this.taskStatus = status

          if (status === 1) {
            this.$message.success('任务处理成功！可以开始格式化JSON')
          } else if (status === 2) {
            this.$message.error('任务处理失败：' + (response.data.error || '未知错误'))
          } else if (status === 0) {
            this.$message.info('任务仍在处理中，请稍后再检查...')
          } else {
            this.$message.info('任务状态未知，请稍后再检查...')
          }
        } else {
          this.$message.error('检查任务状态失败：' + response.msg)
        }
      } catch (error) {
        this.$message.error('检查任务状态失败：' + error.message)
      } finally {
        this.checkingStatus = false
      }
    },

    // 获取任务状态类型
    getTaskStatusType(status) {
      const statusMap = {
        0: 'warning',   // 处理中
        1: 'success',   // 处理成功
        2: 'danger'     // 处理失败
      }
      return statusMap[status] || 'info'
    },

    // 获取任务状态文本
    getTaskStatusText(status) {
      const statusMap = {
        0: '处理中',
        1: '处理成功',
        2: '处理失败'
      }
      return statusMap[status] || '未知'
    },

    // 获取任务进度类型
    getTaskProgressType(progress) {
      // 处理progress对象或字符串
      let progressValue = ''
      if (typeof progress === 'object' && progress !== null) {
        progressValue = progress.taskProgress || ''
      } else {
        progressValue = progress || ''
      }

      const progressMap = {
        '未完成': 'warning',
        '已完成': 'success',
        '上传出错': 'danger'
      }
      return progressMap[progressValue] || 'info'
    },

    // 获取任务进度文本
    getTaskProgressText(progress) {
      // 处理progress对象或字符串
      if (typeof progress === 'object' && progress !== null) {
        return progress.taskProgress || '未完成'
      } else {
        return progress || '未完成'
      }
    },

    // 从URL中提取文件名
    getFileNameFromUrl(url) {
      if (!url) return '-'
      const parts = url.split('/')
      return parts[parts.length - 1] || url
    },

    // 判断是否为可选择的章节节点
    isSelectableChapterNode(node) {
      const nodeLabel = node.label || ''

      // 年级级别不能选择（初中、高中）
      if (nodeLabel === '初中' || nodeLabel === '高中') {
        console.log('节点:', nodeLabel, '是年级级别，不可选择')
        return false
      }

      // 其他节点都可以选择，包括叶子节点（最后的子节点）
      console.log('节点:', nodeLabel, '可以选择')
      return true
    },


    // 获取节点深度（从根节点开始计算）
    getNodeDepth(node) {
      return this.calculateDepthFromRoot(node, this.chapterTreeData, 0)
    },

    // 从根节点计算深度
    calculateDepthFromRoot(targetNode, treeNodes, currentDepth) {
      for (const node of treeNodes) {
        if (node.value === targetNode.value) {
          return currentDepth + 1
        }
        if (node.children && node.children.length > 0) {
          const found = this.calculateDepthFromRoot(targetNode, node.children, currentDepth + 1)
          if (found > 0) {
            return found
          }
        }
      }
      return 0
    },

    // 判断任务是否已响应（有JSON数据且已添加章节路径）
    isTaskResponded(task) {
      if (!task.newResourceUrl) return false

      try {
        let data = task.newResourceUrl
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }

        // 检查是否是成功消息（表示文档解析完成但未添加章节路径）
        if (data && data.success && data.message) {
          console.log('检测到成功消息，但未添加章节路径:', data.message)
          return false
        }

        // 检查是否有题目数据（表示已添加章节路径）
        if (Array.isArray(data)) {
          return data.length > 0
        } else if (data && data.question_data && Array.isArray(data.question_data)) {
          return data.question_data.length > 0
        } else if (data && data.results && data.results.json_data && Array.isArray(data.results.json_data)) {
          return data.results.json_data.length > 0
        } else if (data && data.json_data && Array.isArray(data.json_data)) {
          return data.json_data.length > 0
        }

        return false
      } catch (e) {
        console.log('解析newResourceUrl失败:', e)
        return false
      }
    },

    // 判断任务是否已完成知识点选择（resourceUrl中的knowledge_points为一个）
    isKnowledgePointsSelected(task) {
      // 新的判断逻辑：检查原始资源是否包含knowledge_points信息
      if (!task.resourceUrl) return false

      try {
        // 检查原始资源字符串是否包含knowledge_points
        const resourceStr = String(task.resourceUrl)
        if (resourceStr.includes('knowledge_points')) {
          console.log('检测到knowledge_points，任务:', task.id, '原始资源:', resourceStr.substring(0, 100) + '...')
          return true
        }

        // 如果原始资源中没有，再检查解析后的数据
        let data = task.resourceUrl
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }

        // 检查resourceUrl中是否有knowledge_points且为一个
        if (Array.isArray(data)) {
          // 如果是数组，检查每个题目是否都有knowledge_points且为一个
          return data.every(question => {
            return question.knowledge_points &&
                   Array.isArray(question.knowledge_points) &&
                   question.knowledge_points.length === 1
          })
        } else if (data && data.question_data && Array.isArray(data.question_data)) {
          // 检查question_data中的knowledge_points
          return data.question_data.every(question => {
            return question.knowledge_points &&
                   Array.isArray(question.knowledge_points) &&
                   question.knowledge_points.length === 1
          })
        } else if (data && data.results && data.results.json_data && Array.isArray(data.results.json_data)) {
          // 检查results.json_data中的knowledge_points
          return data.results.json_data.every(question => {
            return question.knowledge_points &&
                   Array.isArray(question.knowledge_points) &&
                   question.knowledge_points.length === 1
          })
        } else if (data && data.json_data && Array.isArray(data.json_data)) {
          // 检查json_data中的knowledge_points
          return data.json_data.every(question => {
            return question.knowledge_points &&
                   Array.isArray(question.knowledge_points) &&
                   question.knowledge_points.length === 1
          })
        }

        return false
      } catch (e) {
        console.log('解析resourceUrl失败:', e)
        return false
      }
    },

    // 判断是否为JSON数据
    isJsonData(data) {
      if (!data) return false
      try {
        // 如果是字符串，尝试解析
        if (typeof data === 'string') {
          const parsed = JSON.parse(data)
          // 检查是否是成功消息
          if (parsed && parsed.success && parsed.message) {
            return true // 显示为JSON数据，但实际是成功消息
          }
          return Array.isArray(parsed) || (parsed && typeof parsed === 'object')
        }
        // 如果已经是对象或数组
        return Array.isArray(data) || (data && typeof data === 'object')
      } catch (e) {
        return false
      }
    },

    // 获取JSON数据预览
    getJsonDataPreview(data) {
      if (!data) return '-'
      try {
        let parsed
        if (typeof data === 'string') {
          parsed = JSON.parse(data)
        } else {
          parsed = data
        }

        // 检查是否是成功消息
        if (parsed && parsed.success && parsed.message) {
          return '文档解析完成，等待校验上传'
        }

        if (Array.isArray(parsed)) {
          return `包含 ${parsed.length} 个题目`
        } else if (parsed && parsed.question_data && Array.isArray(parsed.question_data)) {
          return `包含 ${parsed.question_data.length} 个题目`
        } else if (parsed && parsed.results && parsed.results.json_data && Array.isArray(parsed.results.json_data)) {
          return `包含 ${parsed.results.json_data.length} 个题目`
        } else {
          return '文件解析失败'
        }
      } catch (e) {
        return '数据解析错误'
      }
    },


    // 加载任务列表
    async loadTaskList() {
      this.taskListLoading = true
      try {
        // 添加role参数
        const params = {
          ...this.taskListParams,
          role: this.userRole
        }
        const response = await getTaskList(params)
        console.log('任务列表API响应:', response) // 调试日志
        console.log('请求参数:', this.taskListParams) // 调试日志

        if (response.code === 200) {
          let taskData = []
          let totalCount = 0

          // 处理不同的数据结构
          if (response.rows && Array.isArray(response.rows)) {
            // 如果response直接包含rows和total
            taskData = response.rows || []
            totalCount = response.total || 0
            console.log('数据结构: response.rows/total, 数据量:', taskData.length, '总数:', totalCount)
          } else if (response.data && Array.isArray(response.data)) {
            // 如果data直接是数组
            taskData = response.data
            totalCount = response.data.length
            console.log('数据结构: 直接数组, 数据量:', taskData.length)
          } else if (response.data && response.data.rows) {
            // 如果data包含rows和total
            taskData = response.data.rows || []
            totalCount = response.data.total || 0
            console.log('数据结构: data.rows/total, 数据量:', taskData.length, '总数:', totalCount)
          } else if (response.data && response.data.list) {
            // 如果data包含list
            taskData = response.data.list || []
            totalCount = response.data.total || response.data.list.length
            console.log('数据结构: data.list, 数据量:', taskData.length, '总数:', totalCount)
          } else {
            // 其他情况，尝试直接使用data
            taskData = response.data || []
            totalCount = Array.isArray(response.data) ? response.data.length : 0
            console.log('数据结构: 其他, 数据量:', taskData.length, '总数:', totalCount)
          }

          // 为每个任务添加默认的任务进度字段
          taskData = taskData.map(task => ({
            ...task,
            taskProgress: task.taskProgress || {
              id: null,
              taskTableId: task.id,
              taskProgress: '未完成',
              successCount: 0,
              failureCount: 0,
              failureReason: null,
              taskStatus: null,
              createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
              createBy: null,
              updateTime: null,
              updateBy: null,
              remark: null
            }
          }))

          this.taskList = taskData
          this.taskListTotal = totalCount

          // 根据数据情况显示不同的消息
          if (taskData.length > 0) {
            this.$message.success(`任务列表加载成功，共 ${totalCount} 条记录`)
          } else {
            this.$message.info('任务列表加载成功，暂无数据')
          }

          console.log('最终设置的数据:', { taskList: this.taskList, total: this.taskListTotal })
        } else {
          this.$message.error('加载任务列表失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('任务列表加载错误:', error) // 调试日志
        this.$message.error('加载任务列表失败：' + error.message)
      } finally {
        this.taskListLoading = false
      }
    },

    // 删除任务
    async handleDeleteTask(task) {
      try {
        await this.$confirm(`确定要删除任务 ID ${task.id} 吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.taskListLoading = true
        const response = await deleteTask(task.id)

        if (response.code === 200) {
          this.$message.success('任务删除成功')
          // 删除成功后刷新任务列表
          await this.loadTaskList()
        } else {
          this.$message.error('删除失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除任务失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      } finally {
        this.taskListLoading = false
      }
    },

    // 添加章节路径（第一步）
    addChapterPath(task) {
      console.log('添加章节路径按钮被点击，任务数据:', task)
      this.currentTaskId = task.id
      this.taskStatus = task.taskStatus
      this.currentTaskData = task

      // 重置章节选择状态
      this.selectedChapterPath = ''
      this.selectedChapterData = null

      this.chapterDialogVisible = true
      console.log('设置弹窗可见:', this.chapterDialogVisible)

      // 弹窗打开时重新加载章节树数据
      this.loadChapterTree()

      // 添加一个提示消息
      this.$message.info('请选择章节路径，完成后将发送到MQ进行响应')
    },

    // 选择知识点（第二步）
    selectKnowledgePoints(task) {
      console.log('选择知识点按钮被点击，任务数据:', task)
      this.currentTaskId = task.id
      this.taskStatus = task.taskStatus
      this.currentTaskData = task

      // 解析任务数据
      let questionData = []
      let newResourceData = task.newResourceUrl

      if (typeof newResourceData === 'string') {
        try {
          newResourceData = JSON.parse(newResourceData)
        } catch (e) {
          console.warn('newResourceUrl不是有效的JSON字符串:', e)
          this.$message.error('生成资源数据格式错误')
          return
        }
      }

      // 提取题目数据
      if (Array.isArray(newResourceData)) {
        questionData = newResourceData
      } else if (newResourceData && newResourceData.question_data && Array.isArray(newResourceData.question_data)) {
        questionData = newResourceData.question_data
      } else if (newResourceData && newResourceData.results && newResourceData.results.json_data && Array.isArray(newResourceData.results.json_data)) {
        questionData = newResourceData.results.json_data
      } else if (newResourceData && newResourceData.json_data && Array.isArray(newResourceData.json_data)) {
        questionData = newResourceData.json_data
        } else {
        this.$message.error('未找到有效的题目数据')
        return
      }

      if (questionData.length === 0) {
        this.$message.error('题目数据为空')
        return
      }

      console.log('准备显示知识点选择弹窗，题目数据:', questionData)

      // 直接显示知识点选择弹窗
      this.currentQuestionData = questionData
      this.extractKnowledgePoints(questionData)
      this.knowledgePointsDialogVisible = true

      console.log('知识点弹窗显示状态:', this.knowledgePointsDialogVisible)
    },


    // 处理分页大小变化
    handleTaskListSizeChange(val) {
      this.taskListParams.pageSize = val
      this.taskListParams.pageNum = 1
      this.loadTaskList()
    },

    // 处理当前页变化
    handleTaskListCurrentChange(val) {
      this.taskListParams.pageNum = val
      this.loadTaskList()
    },

    // 测试API连接
    async testApiConnection() {
      try {
        console.log('测试API连接...')
        const response = await getTaskList({ pageNum: 1, pageSize: 5 })
        console.log('API测试响应:', response)
        return response
      } catch (error) {
        console.error('API测试失败:', error)
        return null
      }
    },

    // 测试LaTeX渲染功能
    testLatexRendering() {
      console.log('开始测试LaTeX渲染功能...')

      // 测试各种LaTeX公式
      const testCases = [
        {
          type: '题目内容',
          content: '计算 $x^2 + y^2 = z^2$ 的值，其中 $x = 3$，$y = 4$'
        },
        {
          type: '选项A',
          content: 'A. $\\frac{1}{2}$ B. $\\sqrt{2}$ C. $\\pi$ D. $e$'
        },
        {
          type: '选项B',
          content: '根据公式 $E = mc^2$ 计算能量'
        },
        {
          type: '答案',
          content: '答案：$z = 5$，因为 $3^2 + 4^2 = 9 + 16 = 25 = 5^2$'
        },
        {
          type: '解析',
          content: '解析：使用勾股定理 $a^2 + b^2 = c^2$，其中 $a = 3$，$b = 4$，所以 $c = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$'
        },
        {
          type: '复杂公式',
          content: '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$'
        },
        {
          type: '化学公式',
          content: '化学反应：$\\ce{2H2 + O2 -> 2H2O}$'
        },
        {
          type: '物理公式',
          content: '牛顿第二定律：$F = ma$，其中 $F$ 是力，$m$ 是质量，$a$ 是加速度'
        }
      ]

      testCases.forEach((testCase, index) => {
        console.log(`测试 ${index + 1} - ${testCase.type}:`, testCase.content)
        try {
          const rendered = this.renderMarkdown(testCase.content)
          console.log(`渲染结果 ${index + 1}:`, rendered)

          // 检查是否包含错误信息
          if (rendered.includes('math-error')) {
            console.warn(`${testCase.type} 渲染失败:`, testCase.content)
          } else {
            console.log(`${testCase.type} 渲染成功`)
          }
        } catch (error) {
          console.error(`${testCase.type} 渲染异常:`, error, testCase.content)
        }
      })

      console.log('LaTeX渲染功能测试完成')
    },

    // 处理添加知识点
    handleAddKnowledge() {
      console.log('处理添加知识点，当前任务ID:', this.currentTaskId)
      if (!this.currentTaskId) {
        this.$message.error('没有可用的任务数据')
        return
      }

      // 从任务列表中查找当前任务的数据
      const currentTask = this.taskList.find(task => task.id === this.currentTaskId)
      if (currentTask) {
        this.currentTaskData = currentTask
        console.log('找到任务数据:', currentTask)
      } else {
        this.$message.error('未找到任务数据')
        return
      }

      // 重置章节选择状态
      this.selectedChapterPath = ''
      this.selectedChapterData = null

      this.chapterDialogVisible = true
      console.log('设置弹窗可见:', this.chapterDialogVisible)

      // 弹窗打开时重新加载章节树数据
      this.loadChapterTree()

      // 添加一个提示消息
      this.$message.info('请选择章节路径')
    },

    // 强制刷新章节树
    refreshChapterTree() {
      this.$nextTick(() => {
        if (this.$refs.chapterTree) {
          this.$refs.chapterTree.$forceUpdate()
        }
      })
    },

    // 加载章节树
    async loadChapterTree() {
      try {
        console.log('开始加载章节树...')
        const response = await getChapterMap()
        console.log('章节树API响应:', response)

        if (response.code === 200) {
          // 过滤掉最后一级的节点（没有children的节点）
          this.chapterTreeData = this.filterLastLevelNodes(response.data || [])
          console.log('章节树数据设置:', this.chapterTreeData)
          console.log('章节树数据详情:', JSON.stringify(this.chapterTreeData, null, 2))

          if (this.chapterTreeData.length === 0) {
            console.log('API返回空数据，使用默认数据')
            this.chapterTreeData = this.getDefaultChapterTree()
          } else {
            // 检查数据结构是否符合el-tree的要求
            this.chapterTreeData.forEach((item, index) => {
              console.log(`章节项 ${index}:`, {
                label: item.label,
                value: item.value,
                children: item.children,
                hasChildren: !!item.children
              })
            })
          }

          // 强制刷新树组件
          this.refreshChapterTree()
        } else {
          this.$message.error('加载章节树失败：' + response.msg)
          console.log('API返回错误，使用默认数据')
          // 使用默认数据作为备选
          this.chapterTreeData = this.getDefaultChapterTree()
          this.refreshChapterTree()
        }
      } catch (error) {
        this.$message.error('加载章节树失败：' + error.message)
        console.error('章节树加载错误:', error)
        console.log('发生错误，使用默认数据')
        // 使用默认数据作为备选
        this.chapterTreeData = this.getDefaultChapterTree()
        this.refreshChapterTree()
      }
    },

    // 根据学科加载章节树
    async loadChapterTreeForSubject(subjectName) {
      try {
        console.log('开始根据学科加载章节树:', subjectName)
        const response = await getChapterMap()
        console.log('章节树API响应:', response)

        if (response.code === 200) {
          // 先过滤掉最后一级的节点
          let allChapterData = this.filterLastLevelNodes(response.data || [])

          // 根据学科过滤章节数据
          this.chapterTreeData = this.filterChapterTreeBySubject(allChapterData, subjectName)
          console.log('过滤后的章节树数据:', this.chapterTreeData)

          if (this.chapterTreeData.length === 0) {
            console.log('未找到对应学科的章节数据，使用默认数据')
            this.chapterTreeData = this.getDefaultChapterTreeForSubject(subjectName)
          }

          // 强制刷新树组件
          this.refreshChapterTree()

          // 自动展开对应学科的节点
          this.$nextTick(() => {
            this.autoExpandSubjectNode(subjectName)
          })
        } else {
          this.$message.error('加载章节树失败：' + response.msg)
          console.log('API返回错误，使用默认数据')
          // 使用默认数据作为备选
          this.chapterTreeData = this.getDefaultChapterTreeForSubject(subjectName)
          this.refreshChapterTree()
        }
      } catch (error) {
        this.$message.error('加载章节树失败：' + error.message)
        console.error('章节树加载错误:', error)
        console.log('发生错误，使用默认数据')
        // 使用默认数据作为备选
        this.chapterTreeData = this.getDefaultChapterTreeForSubject(subjectName)
        this.refreshChapterTree()
      }
    },

    // 保留所有节点，包括叶子节点
    filterLastLevelNodes(nodes) {
      if (!Array.isArray(nodes)) return []

      return nodes.map(node => {
        // 如果节点有children，递归处理children
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const processedChildren = this.filterLastLevelNodes(node.children)
          // 保留这个节点，使用处理后的children
          return {
            ...node,
            children: processedChildren
          }
        }
        // 叶子节点也保留
        return node
      })
    },

    // 获取默认章节树数据
    getDefaultChapterTree() {
      return [
        {
          label: '高中物理',
          value: 'high_physics',
          children: [
            {
              label: '必修三',
              value: 'physics_3',
              children: [
                {
                  label: '第十二章电能能量守恒定律',
                  value: 'physics_3_12',
                  children: [
                    {
                      label: '2.闭合电路的欧姆定律',
                      value: 'physics_3_12_2'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: '高中数学',
          value: 'high_math',
          children: [
            {
              label: '必修一',
              value: 'math_1',
              children: [
                {
                  label: '第一章集合与函数概念',
                  value: 'math_1_1',
                  children: [
                    {
                      label: '1.1集合',
                      value: 'math_1_1_1'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    // 根据学科过滤章节树数据
    filterChapterTreeBySubject(chapterData, subjectName) {
      if (!Array.isArray(chapterData) || !subjectName) {
        return chapterData
      }

      console.log('开始根据学科过滤章节数据:', subjectName)

      // 学科名称映射
      const subjectMapping = {
        '初中数学': { level: '初中', subject: '数学' },
        '初中科学': { level: '初中', subject: '科学' },
        '初中语文': { level: '初中', subject: '语文' },
        '初中英语': { level: '初中', subject: '英语' },
        '初中历史': { level: '初中', subject: '历史' },
        '初中政治': { level: '初中', subject: '政治' },
        '初中地理': { level: '初中', subject: '地理' },
        '高中数学': { level: '高中', subject: '数学' },
        '高中物理': { level: '高中', subject: '物理' },
        '高中化学': { level: '高中', subject: '化学' },
        '高中生物': { level: '高中', subject: '生物' },
        '高中语文': { level: '高中', subject: '语文' },
        '高中英语': { level: '高中', subject: '英语' },
        '高中通用': { level: '高中', subject: '通用' },
        '高中历史': { level: '高中', subject: '历史' },
        '高中政治': { level: '高中', subject: '政治' },
        '高中地理': { level: '高中', subject: '地理' },
        '高中信息': { level: '高中', subject: '信息' }
      }

      const targetMapping = subjectMapping[subjectName]
      if (!targetMapping) {
        console.log('未找到学科映射，返回原始数据')
        return chapterData
      }

      console.log('目标映射:', targetMapping)

      // 深度克隆数据以避免修改原始数据
      const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj
        if (obj instanceof Date) return new Date(obj.getTime())
        if (obj instanceof Array) return obj.map(item => deepClone(item))
        if (typeof obj === 'object') {
          const clonedObj = {}
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              clonedObj[key] = deepClone(obj[key])
            }
          }
          return clonedObj
        }
      }

      const clonedData = deepClone(chapterData)

      // 递归过滤函数 - 只保留目标年级和目标学科
      const filterNodes = (nodes) => {
        if (!Array.isArray(nodes)) return []

        return nodes.filter(node => {
          const nodeLabel = node.label || ''
          console.log('检查节点:', nodeLabel)

          // 检查是否是目标年级
          if (nodeLabel.includes(targetMapping.level)) {
            console.log('找到匹配的年级节点:', nodeLabel)
            // 如果是目标年级，检查其子节点中是否有目标学科
            if (node.children && node.children.length > 0) {
              const filteredChildren = node.children.filter(child => {
                const childLabel = child.label || ''
                console.log('检查年级子节点:', childLabel)
                return childLabel.includes(targetMapping.subject)
              })

              if (filteredChildren.length > 0) {
                // 如果找到目标学科，保留年级节点并更新其子节点
                node.children = filteredChildren
                console.log('保留年级节点及其目标学科子节点:', nodeLabel)
                return true
              }
            }
            return false
          }

          return false
        })
      }

      const filteredData = filterNodes(clonedData)
      console.log('过滤后的数据:', filteredData)
      return filteredData
    },

    // 根据学科获取默认章节树数据
    getDefaultChapterTreeForSubject(subjectName) {
      const defaultTrees = {
        '初中数学': [
          {
            label: '初中数学',
            value: 'junior_math',
            children: [
              {
                label: '七年级',
                value: 'junior_math_7',
                children: [
                  {
                    label: '第一章 有理数',
                    value: 'junior_math_7_1',
                    children: [
                      {
                        label: '1.1 正数和负数',
                        value: 'junior_math_7_1_1'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        '高中数学': [
          {
            label: '高中数学',
            value: 'high_math',
            children: [
              {
                label: '必修一',
                value: 'math_1',
                children: [
                  {
                    label: '第一章集合与函数概念',
                    value: 'math_1_1',
                    children: [
                      {
                        label: '1.1集合',
                        value: 'math_1_1_1'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }

      return defaultTrees[subjectName] || this.getDefaultChapterTree()
    },

    // 自动展开对应学科的节点
    autoExpandSubjectNode(subjectName) {
      console.log('开始自动展开学科节点:', subjectName)

      // 清空之前的展开状态
      this.expandedKeys = []

      // 学科名称映射
      const subjectMapping = {
        '初中数学': { level: '初中', subject: '数学' },
        '初中科学': { level: '初中', subject: '科学' },
        '初中语文': { level: '初中', subject: '语文' },
        '初中英语': { level: '初中', subject: '英语' },
        '初中历史': { level: '初中', subject: '历史' },
        '初中政治': { level: '初中', subject: '政治' },
        '初中地理': { level: '初中', subject: '地理' },
        '高中数学': { level: '高中', subject: '数学' },
        '高中物理': { level: '高中', subject: '物理' },
        '高中化学': { level: '高中', subject: '化学' },
        '高中生物': { level: '高中', subject: '生物' },
        '高中语文': { level: '高中', subject: '语文' },
        '高中英语': { level: '高中', subject: '英语' },
        '高中通用': { level: '高中', subject: '通用' },
        '高中历史': { level: '高中', subject: '历史' },
        '高中政治': { level: '高中', subject: '政治' },
        '高中地理': { level: '高中', subject: '地理' },
        '高中信息': { level: '高中', subject: '信息' }
      }

      const targetMapping = subjectMapping[subjectName]
      if (!targetMapping) {
        console.log('未找到学科映射')
        return
      }

      // 查找匹配的节点并收集需要展开的节点
      const findAndCollectExpandKeys = (nodes, parentKeys = []) => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]
          const currentKeys = [...parentKeys, node.value]

          // 检查是否是目标年级
          if (node.label && node.label.includes(targetMapping.level)) {
            console.log('找到匹配的年级节点，准备展开:', node.label)
            // 将年级节点添加到展开列表
            this.expandedKeys.push(node.value)

            // 继续查找该年级下的学科节点
            if (node.children && node.children.length > 0) {
              findAndCollectExpandKeys(node.children, currentKeys)
            }
            return true
          }

          // 检查是否是目标学科（在正确的年级下）
          if (node.label && node.label.includes(targetMapping.subject)) {
            console.log('找到匹配的学科节点，准备展开:', node.label)
            // 将路径上的所有节点都添加到展开列表中
            this.expandedKeys = [...this.expandedKeys, ...currentKeys]
            return true
          }

          if (node.children && node.children.length > 0) {
            if (findAndCollectExpandKeys(node.children, currentKeys)) {
              return true
            }
          }
        }
        return false
      }

      findAndCollectExpandKeys(this.chapterTreeData)

      console.log('需要展开的节点keys:', this.expandedKeys)
    },

    // 处理章节节点点击
    handleChapterNodeClick(data, node) {
      console.log('章节节点被点击:', data)
      console.log('节点信息:', node)
      console.log('节点是否有子节点:', !!(data.children && data.children.length > 0))

      // 检查是否为可选择的节点（最多到章节级别，不能超过年级和必修）
      const isSelectableNode = this.isSelectableChapterNode(data)
      console.log('是否为可选择的章节节点:', isSelectableNode)

      if (isSelectableNode) {
        // 最多到章节级别的节点可以选择
        const path = this.buildChapterPath(data)
        console.log('构建的路径:', path)
        if (path) {
          this.selectedChapterPath = path
          this.selectedChapterData = data
          console.log('设置的章节路径:', this.selectedChapterPath)
          console.log('设置的章节数据:', this.selectedChapterData)
          this.$message.success('已选择章节：' + data.label)
        } else {
          console.error('路径构建失败')
          this.$message.error('路径构建失败')
        }
      } else {
        // 不可选择的节点，提示用户选择到合适的层级
        this.selectedChapterPath = ''
        this.selectedChapterData = null
        console.log('不可选择的节点，清空选择')

        const nodeLabel = data.label || ''
        let warningMessage = ''

        if (nodeLabel === '初中' || nodeLabel === '高中') {
          warningMessage = '年级级别（' + nodeLabel + '）不能选择，请选择具体的章节'
        } else {
          warningMessage = '当前选择的节点不可选择，请选择其他节点'
        }

        this.$message.warning(warningMessage)
      }
    },

    // 构建章节路径
    buildChapterPath(chapter) {
      console.log('构建章节路径，输入章节:', chapter)
      console.log('章节树数据:', this.chapterTreeData)

      const findPath = (options, targetValue, path = []) => {
        for (let opt of options) {
          const newPath = [...path, opt.label]
          if (opt.value === targetValue) return newPath.join('/')
          if (opt.children) {
            const found = findPath(opt.children, targetValue, newPath)
            if (found) return found
          }
        }
        return null
      }
      const chinesePath = findPath(this.chapterTreeData, chapter.value) || chapter.label
      console.log('找到的中文路径:', chinesePath)

      // 转换为英文路径格式
      const englishPath = this.convertToEnglishPath(chinesePath)
      console.log('转换后的英文路径:', englishPath)
      return englishPath
    },

    // 将中文路径转换为英文路径格式
    convertToEnglishPath(chinesePath) {
      if (!chinesePath) return ''

      // 科目映射表
      const subjectMap = {
        '物理': 'physics',
        '数学': 'math',
        '化学': 'chemistry',
        '生物': 'biology',
        '科学': 'science',
        '语文': 'chinese',
        '英语': 'english',
        '信息': 'tech',
        '通用': 'common',
        '历史': 'history',
        '政治': 'politics',
        '地理': 'geography',
        'python': 'python'
      }

      // 学段映射表
      const stageMap = {
        '高中': 'high',
        '初中': 'middle'
      }

      // 分割路径
      const pathParts = chinesePath.split('/')
      if (pathParts.length < 2) return chinesePath

      // 转换学段
      let stage = pathParts[0]
      if (stageMap[stage]) {
        stage = stageMap[stage]
      }

      // 转换科目
      let subject = pathParts[1]
      if (subjectMap[subject]) {
        subject = subjectMap[subject]
      }

      // 构建英文路径
      const englishPath = `./knowledge_tree/${stage}/${subject}/${pathParts.slice(2).join('/')}`

      console.log('路径转换:', {
        原始路径: chinesePath,
        转换后路径: englishPath,
        学段: pathParts[0] + ' -> ' + stage,
        科目: pathParts[1] + ' -> ' + subject
      })

      return englishPath
    },

    // 确认章节选择
    async confirmChapterSelection() {
      if (!this.selectedChapterPath) {
        this.$message.error('请选择章节路径')
        return
      }

      // 再次检查是否选择了合适的章节节点
      if (!this.selectedChapterData || !this.isSelectableChapterNode(this.selectedChapterData)) {
        this.$message.error('请选择到合适的章节层级（带✓标记的蓝色节点）')
        return
      }

      // 额外检查：确保选择的节点确实是可选择的节点
      const isSelectableNode = this.isSelectableChapterNode(this.selectedChapterData)
      if (!isSelectableNode) {
        this.$message.error('选择的节点不是合适的章节层级，请选择带✓标记的蓝色节点')
        return
      }

      // 保存选择的章节路径到表单
      this.wordForm.chapter_path = this.selectedChapterPath
      this.chapterDialogVisible = false
      this.$message.success('章节路径已选择：' + this.selectedChapterPath)

      // 如果是在上传表单中选择章节，直接返回
      if (!this.currentTaskData) {
        return
      }

      try {
        // 从当前任务数据中获取newResourceUrl
        if (!this.currentTaskData || !this.currentTaskData.newResourceUrl) {
          this.$message.error('未找到任务数据或生成资源')
          return
        }

        console.log('当前任务数据:', this.currentTaskData)
        console.log('newResourceUrl:', this.currentTaskData.newResourceUrl)

        // 解析newResourceUrl中的JSON数据
        let questionData = []
        let newResourceData = this.currentTaskData.newResourceUrl

        // 如果newResourceUrl是字符串，尝试解析
        if (typeof newResourceData === 'string') {
          try {
            newResourceData = JSON.parse(newResourceData)
          } catch (e) {
            console.warn('newResourceUrl不是有效的JSON字符串:', e)
            this.$message.error('生成资源数据格式错误')
            return
          }
        }

        // 根据不同的数据结构提取题目数据
        if (Array.isArray(newResourceData)) {
          questionData = newResourceData
        } else if (newResourceData && newResourceData.question_data && Array.isArray(newResourceData.question_data)) {
          questionData = newResourceData.question_data
        } else if (newResourceData && newResourceData.results && newResourceData.results.json_data && Array.isArray(newResourceData.results.json_data)) {
          questionData = newResourceData.results.json_data
        } else if (newResourceData && newResourceData.json_data && Array.isArray(newResourceData.json_data)) {
          questionData = newResourceData.json_data
        } else {
          console.warn('未找到预期的题目数据结构:', newResourceData)
          this.$message.error('未找到有效的题目数据')
          return
        }

        if (questionData.length === 0) {
          this.$message.error('题目数据为空')
          return
        }

        // 检查是否有知识点数据 - 更灵活的检查方式
        const hasKnowledgePoints = questionData.some(q => {
          // 检查多种可能的知识点字段名
          return (q.knowledge_points && q.knowledge_points.length > 0) ||
                 (q.knowledgePoints && q.knowledgePoints.length > 0) ||
                 (q.knowledge && q.knowledge.length > 0) ||
                 (q.topics && q.topics.length > 0)
        })

        console.log('是否有知识点数据:', hasKnowledgePoints)
        console.log('题目数据详情:', questionData.map(q => ({
          question: q.question?.substring(0, 50) + '...',
          hasKnowledgePoints: !!(q.knowledge_points && q.knowledge_points.length > 0),
          hasKnowledgePointsAlt: !!(q.knowledgePoints && q.knowledgePoints.length > 0),
          hasKnowledge: !!(q.knowledge && q.knowledge.length > 0),
          hasTopics: !!(q.topics && q.topics.length > 0),
          knowledgePoints: q.knowledge_points,
          knowledgePointsAlt: q.knowledgePoints,
          knowledge: q.knowledge,
          topics: q.topics,
          confidence: q.confidence
        })))

        // 第一步：只发送章节路径到MQ进行响应
        console.log('发送章节路径到MQ进行响应')
        await this.sendChapterPathToMQ(questionData)
      } catch (error) {
        console.error('添加知识点过程出错:', error)
        this.$message.error('添加知识点失败：' + error.message)
      }
    },

    // 关闭章节选择弹窗
    handleChapterDialogClose() {
      this.chapterDialogVisible = false
      this.selectedChapterPath = ''
      this.selectedChapterData = null
    },

    // 加载系列路径树数据
    loadSeriesPathTree() {
      if (!this.globalSettings.series) {
        this.$message.warning('请先选择系列')
        return
      }

      // 从系列列表中获取选中的系列数据
      const selectedSeries = this.seriesList.find(item => item.id === this.globalSettings.series)
      if (!selectedSeries) {
        this.$message.error('未找到选中的系列数据')
        return
      }

      console.log('选中的系列数据:', selectedSeries)

      // 解析contents字段构建树形结构
      this.seriesPathTreeData = this.parseSeriesContentsToTree(selectedSeries)
      console.log('解析后的系列路径树数据:', this.seriesPathTreeData)
    },

    // 解析系列contents字段为树形结构
    parseSeriesContentsToTree(seriesData) {
      if (!seriesData.contents) {
        return []
      }

      try {
        let contents = seriesData.contents
        if (typeof contents === 'string') {
          contents = JSON.parse(contents)
        }

        // 构建基础路径信息
        const basePath = {
          series: seriesData.series || '',
          subjectName: seriesData.subjectName || seriesData.subject_name || '',
          grade: seriesData.grade || '',
          year: seriesData.year || ''
        }

        // 将contents转换为树形结构
        return this.convertContentsToTree(contents, basePath)
      } catch (error) {
        console.error('解析系列contents失败:', error)
        return []
      }
    },

    // 将contents数据转换为树形结构
    convertContentsToTree(contents, basePath) {
      if (!Array.isArray(contents)) {
        return []
      }

      return contents.map((item, index) => {
        const node = {
          label: item.title || `章节${index + 1}`,
          value: item.id || `chapter_${index}`,
          level: item.level || 1,
          children: []
        }

        // 递归处理子节点
        if (item.children && Array.isArray(item.children)) {
          node.children = this.convertContentsToTree(item.children, basePath)
        }

        return node
      })
    },

    // 处理系列路径节点点击
    handleSeriesPathNodeClick(data, node) {
      console.log('系列路径节点被点击:', data)
      console.log('节点信息:', node)

      // 检查是否为可选择的节点
      const isSelectableNode = this.isSelectableSeriesPathNode(data)
      console.log('是否为可选择的系列路径节点:', isSelectableNode)

      if (isSelectableNode) {
        // 构建路径
        const path = this.buildSeriesPath(data)
        console.log('构建的系列路径:', path)
        if (path) {
          this.selectedSeriesPath = path
          this.selectedSeriesPathData = data
          console.log('设置的系列路径:', this.selectedSeriesPath)
          this.$message.success('已选择系列路径：' + data.label)
        } else {
          console.error('系列路径构建失败')
          this.$message.error('系列路径构建失败')
        }
      } else {
        // 不可选择的节点
        this.selectedSeriesPath = ''
        this.selectedSeriesPathData = null
        console.log('不可选择的节点，清空选择')

        if (data.children && data.children.length > 0) {
          this.$message.warning('请选择具体的章节级别，当前选择的是：' + data.label + '（此层级过高）')
        } else {
          this.$message.warning('请选择章节节点，当前选择的是：' + data.label)
        }
      }
    },

    // 判断是否为可选择的系列路径节点
    isSelectableSeriesPathNode(data) {
      // 有子节点的不能选择（层级过高）
      if (data.children && data.children.length > 0) {
        return false
      }

      // 没有子节点的可以选择（具体章节级别）
      return true
    },

    // 构建系列路径
    buildSeriesPath(data) {
      console.log('构建系列路径，输入数据:', data)

      // 只返回章节路径
      const chapterPath = this.findNodePath(this.seriesPathTreeData, data.value)
      return chapterPath || ''
    },

    // 查找节点在树中的路径
    findNodePath(treeData, targetValue, path = []) {
      for (let node of treeData) {
        const newPath = [...path, node.label]
        if (node.value === targetValue) {
          return newPath.join('/')
        }
        if (node.children && node.children.length > 0) {
          const found = this.findNodePath(node.children, targetValue, newPath)
          if (found) return found
        }
      }
      return null
    },

    // 确认系列路径选择
    async confirmSeriesPathSelection() {
      if (!this.selectedSeriesPath) {
        this.$message.warning('请选择系列路径')
        return
      }

      try {
        // 设置全局系列路径
        this.globalSettings.series_path = this.selectedSeriesPath

        console.log('确认选择的系列路径:', this.selectedSeriesPath)
        this.$message.success('系列路径选择成功：' + this.selectedSeriesPath)

        // 应用到所有题目
        this.applyGlobalSettingsToAllQuestions()

        // 关闭弹窗
        this.seriesPathDialogVisible = false
        this.selectedSeriesPath = ''
        this.selectedSeriesPathData = null

      } catch (error) {
        console.error('确认系列路径选择失败:', error)
        this.$message.error('确认系列路径选择失败：' + error.message)
      }
    },

    // 关闭系列路径选择弹窗
    handleSeriesPathDialogClose() {
      this.seriesPathDialogVisible = false
      this.selectedSeriesPath = ''
      this.selectedSeriesPathData = null
    },

    // 提取知识点数据
    extractKnowledgePoints(questionData) {
      console.log('开始提取知识点数据:', questionData)

      // 收集所有唯一的知识点
      const allKnowledgePoints = new Set()
      questionData.forEach((question, index) => {
        // 尝试多种可能的知识点字段名
        let knowledgePoints = question.knowledge_points || question.knowledgePoints || question.knowledge || question.topics || []
        console.log(`题目 ${index} 的知识点:`, knowledgePoints)

        if (Array.isArray(knowledgePoints)) {
          knowledgePoints.forEach(point => allKnowledgePoints.add(point))
        }
      })

      this.availableKnowledgePoints = Array.from(allKnowledgePoints)
      console.log('收集到的所有知识点:', this.availableKnowledgePoints)

      // 初始化每个题目的知识点选择
      this.questionKnowledgeSelections = questionData.map((question, index) => {
        // 尝试多种可能的知识点字段名
        let knowledgePoints = question.knowledge_points || question.knowledgePoints || question.knowledge || question.topics || []
        let confidence = question.confidence || []

        // 如果没有知识点数据，保持为空，不提供默认选项
        // if (knowledgePoints.length === 0) {
        //   knowledgePoints = ['基础概念', '应用分析', '综合运用']
        //   confidence = [0.8, 0.8, 0.8]
        // }

        const defaultSelection = [] // 默认不选择任何知识点

        const selection = {
          questionIndex: index,
          question: question.question,
          availablePoints: knowledgePoints,
          confidence: confidence,
          selectedPoints: defaultSelection
        }

        console.log(`题目 ${index} 选择初始化:`, selection)
        return selection
      })

      console.log('所有题目知识点选择初始化完成:', this.questionKnowledgeSelections)
      console.log('当前弹窗状态 - 章节弹窗:', this.chapterDialogVisible, '知识点弹窗:', this.knowledgePointsDialogVisible)
    },

    // 发送章节路径到MQ进行响应
    async sendChapterPathToMQ(questionData) {
      try {
        // 构建请求数据，只包含章节路径
        const requestData = {
          question_data: questionData,
          path: this.selectedChapterPath
        }

        console.log('发送章节路径到MQ请求数据:', requestData)
        console.log('选择的章节路径:', this.selectedChapterPath)
        console.log('题目数量:', questionData.length)

        // 发送章节路径到MQ
        const response = await addKnowledge(requestData)

        if (response.code === 200) {
          this.$message.success('章节路径已发送到MQ，请等待响应完成后再进行知识点选择')
          this.chapterDialogVisible = false
          this.resetUploadData()
          // 刷新任务列表
          this.loadTaskList()
        } else {
          this.$message.error('章节路径发送失败：' + response.msg)
        }
      } catch (error) {
        console.error('发送章节路径到MQ失败:', error)
        this.$message.error('章节路径发送失败：' + error.message)
      }
    },

    // 发送知识点请求（第二步）
    async sendKnowledgeRequest(questionData) {
      try {
        // 构建请求数据，不包含章节路径（因为已经在第一步处理了）
        const requestData = {
          question_data: questionData
        }

        console.log('发送知识点请求数据:', requestData)
        console.log('题目数量:', questionData.length)

        // 发送知识点请求
        const response = await addKnowledge(requestData)

        if (response.code === 200) {
          this.$message.success('知识点添加成功！')
          this.knowledgePointsDialogVisible = false
          this.resetUploadData()
          // 刷新任务列表
          this.loadTaskList()
        } else {
          this.$message.error('知识点添加失败：' + response.msg)
        }
      } catch (error) {
        console.error('发送知识点请求失败:', error)
        this.$message.error('知识点添加失败：' + error.message)
      }
    },

    // 处理知识点选择变化
    handleKnowledgePointChange(questionIndex, selectedPoints) {
      console.log(`题目 ${questionIndex} 知识点选择变化:`, selectedPoints)
      this.questionKnowledgeSelections[questionIndex].selectedPoints = selectedPoints
    },

    // 切换知识点选择
    toggleKnowledgePoint(questionIndex, point) {
      const selection = this.questionKnowledgeSelections[questionIndex]
      const currentSelection = selection.selectedPoints || []

      if (currentSelection.includes(point)) {
        // 如果已选择，则取消选择
        selection.selectedPoints = currentSelection.filter(p => p !== point)
      } else {
        // 如果未选择，则添加选择
        selection.selectedPoints = [...currentSelection, point]
      }

      console.log(`题目 ${questionIndex} 切换知识点 ${point}:`, selection.selectedPoints)
    },

    // 同步所有题目的cate和catename
    syncAllQuestionsCateAndCatename() {
      if (!this.questions || this.questions.length === 0) {
        console.warn('没有可同步的题目数据')
        return
      }

      this.questions.forEach((question, mainIndex) => {
        // 同步主题目
        if (question.subject_name && question.subject_name !== '未指定科目') {
          // 优先根据cate值映射到qtype和catename
          if (question.cate && question.cate > 0) {
            const qtypeFromCate = getQuestionTypeByCode(question.subject_name, question.cate)
            if (qtypeFromCate) {
              question.qtype = qtypeFromCate
              question.catename = qtypeFromCate
              console.log(`根据cate映射主题目 - 学科: ${question.subject_name}, cate: ${question.cate}, 题型: ${qtypeFromCate}`)
            }
          } else if (question.qtype) {
            // 如果没有cate但有qtype，则根据qtype设置cate
            const cateValue = getQuestionTypeCode(question.subject_name, question.qtype)
            if (cateValue > 0) {
              question.cate = cateValue
              question.catename = question.qtype
              console.log(`根据qtype设置主题目 - 学科: ${question.subject_name}, 题型: ${question.qtype}, cate: ${cateValue}`)
            }
          }
        }

        // 同步子题目
        if (question.children && question.children.length > 0) {
          question.children.forEach((subQuestion, subIndex) => {
            const subSubjectName = subQuestion.subject_name || question.subject_name
            if (subSubjectName && subSubjectName !== '未指定科目') {
              // 优先根据cate值映射到qtype和catename
              if (subQuestion.cate && subQuestion.cate > 0) {
                const subQtypeFromCate = getQuestionTypeByCode(subSubjectName, subQuestion.cate)
                if (subQtypeFromCate) {
                  subQuestion.qtype = subQtypeFromCate
                  subQuestion.catename = subQtypeFromCate
                  console.log(`根据cate映射子题目 - 学科: ${subSubjectName}, cate: ${subQuestion.cate}, 题型: ${subQtypeFromCate}`)
                }
              } else if (subQuestion.qtype) {
                // 如果没有cate但有qtype，则根据qtype设置cate
                const subCateValue = getQuestionTypeCode(subSubjectName, subQuestion.qtype)
                if (subCateValue > 0) {
                  subQuestion.cate = subCateValue
                  subQuestion.catename = subQuestion.qtype
                  console.log(`根据qtype设置子题目 - 学科: ${subSubjectName}, 题型: ${subQuestion.qtype}, cate: ${subCateValue}`)
                }
              }
            }
          })
        }
      })

      console.log('已同步所有题目的cate和catename')
    },

    // 同步编辑后的数据到currentQuestionData
    syncEditedDataToCurrentQuestionData() {
      if (!this.questions || this.questions.length === 0) {
        console.warn('没有可同步的题目数据')
        return
      }

      // 先同步所有题目的cate和catename
      this.syncAllQuestionsCateAndCatename()

      // 将编辑后的questions数据同步到currentQuestionData
      this.currentQuestionData = this.questions.map(question => {
        const syncedQuestion = { ...question }

        // 确保cate和catename同步
        if (syncedQuestion.qtype && syncedQuestion.subject_name) {
          const cateValue = getQuestionTypeCode(syncedQuestion.subject_name, syncedQuestion.qtype)
          if (cateValue > 0) {
            syncedQuestion.cate = cateValue
            syncedQuestion.catename = syncedQuestion.qtype
            console.log(`同步数据 - 学科: ${syncedQuestion.subject_name}, 题型: ${syncedQuestion.qtype}, cate: ${cateValue}`)
          }
        }

        // 处理子题目
        if (syncedQuestion.children && syncedQuestion.children.length > 0) {
          syncedQuestion.children = syncedQuestion.children.map(subQuestion => {
            const syncedSubQuestion = { ...subQuestion }

            // 确保子题目的cate和catename同步
            if (syncedSubQuestion.qtype && syncedSubQuestion.subject_name) {
              const subCateValue = getQuestionTypeCode(syncedSubQuestion.subject_name, syncedSubQuestion.qtype)
              if (subCateValue > 0) {
                syncedSubQuestion.cate = subCateValue
                syncedSubQuestion.catename = syncedSubQuestion.qtype
                console.log(`同步子题目数据 - 学科: ${syncedSubQuestion.subject_name}, 题型: ${syncedSubQuestion.qtype}, cate: ${subCateValue}`)
              }
            }

            return syncedSubQuestion
          })
        }

        return syncedQuestion
      })

      console.log('已同步编辑后的数据到currentQuestionData')
    },

    // 确认知识点选择
    async confirmKnowledgePointsSelection() {
      try {
        // 检查是否所有题目都选择了知识点
        const hasUnselected = this.questionKnowledgeSelections.some(selection =>
          !selection.selectedPoints || selection.selectedPoints.length === 0
        )

        if (hasUnselected) {
          this.$message.error('请为所有题目选择知识点')
          return
        }

        // 先同步编辑后的数据
        this.syncEditedDataToCurrentQuestionData()

        // 更新题目数据中的知识点
        const updatedQuestionData = this.currentQuestionData.map((question, index) => {
          const selection = this.questionKnowledgeSelections[index]
          return {
            ...question,
            knowledge_points: selection.selectedPoints,
            // 根据选择的知识点更新confidence
            confidence: this.calculateConfidence(question, selection.selectedPoints)
          }
        })

        console.log('更新后的题目数据:', updatedQuestionData)

        // 关闭知识点选择弹窗
        this.knowledgePointsDialogVisible = false

        // 发送知识点更新请求，更新服务器的resourceUrl
        await this.sendKnowledgeRequest(updatedQuestionData)

      } catch (error) {
        console.error('确认知识点选择失败:', error)
        this.$message.error('知识点选择失败：' + error.message)
      }
    },

    // 计算置信度
    calculateConfidence(question, selectedPoints) {
      if (!question.confidence || !Array.isArray(question.confidence)) {
        return selectedPoints.map(() => 0.8) // 默认置信度
      }

      // 根据选择的知识点返回对应的置信度
      return selectedPoints.map(selectedPoint => {
        const originalIndex = question.knowledge_points ? question.knowledge_points.indexOf(selectedPoint) : -1
        return originalIndex >= 0 && originalIndex < question.confidence.length
          ? question.confidence[originalIndex]
          : 0.8
      })
    },

    // 清理错误信息，移除长串ID
    cleanErrorMessage(errorMsg) {
      if (!errorMsg || typeof errorMsg !== 'string') {
        return errorMsg
      }

      // 如果是"题目已存在"类型的错误，只保留到"题目已存在"部分
      if (errorMsg.includes('题目已存在:')) {
        return errorMsg.split('题目已存在:')[0] + '题目已存在'
      }

      // 移除UUID格式的长串ID（包含多个连字符的长字符串）
      return errorMsg.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '')
                    .replace(/[a-f0-9]{32,}/gi, '') // 移除32位以上的十六进制字符串
                    .replace(/:\s*$/, '') // 移除末尾的冒号和空格
    },

    // 格式化题目数据以便上传
    // 转义字符串中的双引号
    escapeQuotes(str) {
      if (typeof str !== 'string') {
        return str
      }
      // 将双引号转义为 \"
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

    formatQuestionForUpload(originalQuestion) {
      console.log('原始题目数据:', originalQuestion)

      // 先转义所有字符串字段中的双引号
      const escapedQuestion = this.escapeQuotesInObject(originalQuestion)
      console.log('转义双引号后的题目数据:', escapedQuestion)

      // 特别检查question字段的转义情况
      if (originalQuestion.question && originalQuestion.question.includes('"')) {
        console.log('原始question包含双引号:', originalQuestion.question)
        console.log('转义后question:', escapedQuestion.question)
      }

      const formatted = {
        sid: escapedQuestion.sid || '', // 直接使用resourceUrl中的sid，不生成
        subject_name: escapedQuestion.subject || escapedQuestion.subject_name || '', // Subject改为subject_name
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

        // knowledge_name选择第一个知识点
        knowledge_name: (escapedQuestion.knowledge_points && escapedQuestion.knowledge_points.length > 0)
                          ? (typeof escapedQuestion.knowledge_points[0] === 'string'
                             ? escapedQuestion.knowledge_points[0]
                             : (escapedQuestion.knowledge_points[0].label || escapedQuestion.knowledge_points[0].name || ''))
                          : '',

        path: escapedQuestion.path || '',
        answers: escapedQuestion.answers || [],
        displayanswer: escapedQuestion.displayanswer || (escapedQuestion.answers && escapedQuestion.answers.length > 0 ? escapedQuestion.answers[0] : ''),
        degree: escapedQuestion.degree || 0.5,
        topic: escapedQuestion.topic || [],


        children: this.formatChildrenForUpload(escapedQuestion.children || []),
        Analyse: escapedQuestion.Analyse || '',
        Method: escapedQuestion.Method || '',
        Discuss: escapedQuestion.Discuss || '',
        Score: escapedQuestion.Score || 0, // 使用用户输入的分数，默认为空

        // 新增参数
        source: escapedQuestion.source || '麓鸣上传', // 上传方式
        // series_type: escapedQuestion.series_type || '书', // 系列类型
        series: escapedQuestion.series || 1, // 系列ID
        tags: escapedQuestion.tags || [], // 标签数组
        series_path: escapedQuestion.series_path || '测试系列的路径', // 系列路径

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

      // 验证答案字段
      const hasAnswer = (formatted.displayanswer && formatted.displayanswer.trim()) ||
                       (formatted.answers && formatted.answers.length > 0 && formatted.answers.some(ans => ans && ans.trim()))
      if (!hasAnswer) {
        console.warn('题目答案为空:', formatted)
        throw new Error('题目答案不能为空，请填写答案后再上传')
      }

      console.log('格式化后的题目数据:', formatted)
      return formatted
    },

    // 格式化子题数据用于上传，将question字段转换为content字段
    formatChildrenForUpload(children) {
      if (!children || !Array.isArray(children)) {
        return []
      }

      return children.map(child => {
        const formattedChild = { ...child }

        // 将question字段转换为content字段，参考菁优网格式
        if (formattedChild.question) {
          formattedChild.content = formattedChild.question
          // 保留question字段以兼容，但优先使用content
        }

        // 同步子题答案：当displayanswer有值但answers为null时，将displayanswer的值同步给answers
        if (formattedChild.displayanswer && formattedChild.displayanswer.trim() &&
            (!formattedChild.answers || formattedChild.answers === null ||
             (Array.isArray(formattedChild.answers) && formattedChild.answers.length === 0))) {
          formattedChild.answers = [formattedChild.displayanswer]
          console.log('子题答案同步：将displayanswer同步到answers', {
            displayanswer: formattedChild.displayanswer,
            answers: formattedChild.answers
          })
        }

        return formattedChild
      })
    },

    // 检查内容中是否包含选项
    hasOptionsInContent(content) {
      if (!content) return false
      // 检查是否包含A.、B.、C.、D.等选项标记
      return /[A-D]\./.test(content)
    },

    // 从内容中解析选项
    parseOptionsFromContent(content) {
      if (!content) return []

      const options = []
      // 匹配A.、B.、C.、D.等选项
      const optionRegex = /([A-D])\.\s*([^A-D]*?)(?=[A-D]\.|$)/g
      let match

      while ((match = optionRegex.exec(content)) !== null) {
        const optionText = match[2].trim()
        if (optionText) {
          options.push(optionText)
        }
      }

      return options
    },

    // 从任务列表中直接解析上传
    async parseAndUploadFromTask(task) {
      console.log('从任务列表解析上传，任务数据:', task)

      if (!task || !task.resourceUrl) {
        this.$message.warning('没有可上传的题目数据')
        return
      }

      this.uploadingQuestions = true
      let successCount = 0
      let failCount = 0

      try {
        // 解析resourceUrl中的题目数据
        let questionData = []
        let resourceData = task.resourceUrl

        if (typeof resourceData === 'string') {
          try {
            resourceData = JSON.parse(resourceData)
          } catch (e) {
            console.warn('resourceUrl不是有效的JSON字符串:', e)
            this.$message.error('题目数据格式错误')
            return
          }
        }

        // 根据不同的数据结构提取题目数据
        if (Array.isArray(resourceData)) {
          questionData = resourceData
        } else if (resourceData && resourceData.question_data && Array.isArray(resourceData.question_data)) {
          questionData = resourceData.question_data
        } else if (resourceData && resourceData.results && resourceData.results.json_data && Array.isArray(resourceData.results.json_data)) {
          questionData = resourceData.results.json_data
        } else if (resourceData && resourceData.json_data && Array.isArray(resourceData.json_data)) {
          questionData = resourceData.json_data
        } else {
          this.$message.error('未找到有效的题目数据')
          return
        }

        if (questionData.length === 0) {
          this.$message.error('题目数据为空')
          return
        }

        const totalQuestions = questionData.length
        console.log(`开始上传 ${totalQuestions} 道题目`)

        // 先验证所有题目
        let validationErrors = []
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          try {
            this.formatQuestionForUpload(originalQuestion)
          } catch (error) {
            validationErrors.push(`题目 ${i + 1}: ${error.message}`)
          }
        }

        if (validationErrors.length > 0) {
          this.$message.error(`发现 ${validationErrors.length} 道题目有问题，无法上传：\n${validationErrors.join('\n')}`)
          this.uploadingQuestions = false
          return
        }

        // 一道题一道题上传
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          const formattedQuestion = this.formatQuestionForUpload(originalQuestion)

          console.log(`正在上传第 ${i + 1}/${totalQuestions} 题:`, formattedQuestion)

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

        // 显示上传结果
        this.$alert(`共上传 ${totalQuestions} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
          confirmButtonText: '确定',
          type: successCount === totalQuestions ? 'success' : (failCount === totalQuestions ? 'error' : 'warning')
        })

      } catch (error) {
        console.error('解析上传题目过程中发生错误:', error)
        this.$message.error('解析上传题目过程中发生错误：' + error.message)
      } finally {
        this.uploadingQuestions = false
        this.loadTaskList() // 刷新任务列表
      }
    },

    // 解析并上传题目数据（第三步）
    async parseAndUploadQuestions() {
      if (!this.currentTaskData || !this.currentTaskData.resourceUrl) {
        this.$message.warning('没有可上传的题目数据')
        return
      }

      this.uploadingQuestions = true
      let successCount = 0
      let failCount = 0

      try {
        // 解析resourceUrl中的题目数据
        let questionData = []
        let resourceData = this.currentTaskData.resourceUrl

        if (typeof resourceData === 'string') {
          try {
            resourceData = JSON.parse(resourceData)
          } catch (e) {
            console.warn('resourceUrl不是有效的JSON字符串:', e)
            this.$message.error('题目数据格式错误')
            return
          }
        }

        // 根据不同的数据结构提取题目数据
        if (Array.isArray(resourceData)) {
          questionData = resourceData
        } else if (resourceData && resourceData.question_data && Array.isArray(resourceData.question_data)) {
          questionData = resourceData.question_data
        } else if (resourceData && resourceData.results && resourceData.results.json_data && Array.isArray(resourceData.results.json_data)) {
          questionData = resourceData.results.json_data
        } else if (resourceData && resourceData.json_data && Array.isArray(resourceData.json_data)) {
          questionData = resourceData.json_data
        } else {
          this.$message.error('未找到有效的题目数据')
          return
        }

        if (questionData.length === 0) {
          this.$message.error('题目数据为空')
          return
        }

        const totalQuestions = questionData.length
        console.log(`开始上传 ${totalQuestions} 道题目`)

        // 先验证所有题目
        let validationErrors = []
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          try {
            this.formatQuestionForUpload(originalQuestion)
          } catch (error) {
            validationErrors.push(`题目 ${i + 1}: ${error.message}`)
          }
        }

        if (validationErrors.length > 0) {
          this.$message.error(`发现 ${validationErrors.length} 道题目有问题，无法上传：\n${validationErrors.join('\n')}`)
          this.uploadingQuestions = false
          return
        }

        // 一道题一道题上传
        for (let i = 0; i < totalQuestions; i++) {
          const originalQuestion = questionData[i]
          const formattedQuestion = this.formatQuestionForUpload(originalQuestion)

          console.log(`正在上传第 ${i + 1}/${totalQuestions} 题:`, formattedQuestion)

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

        // 显示上传结果
        this.$alert(`共上传 ${totalQuestions} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
          confirmButtonText: '确定',
          type: successCount === totalQuestions ? 'success' : (failCount === totalQuestions ? 'error' : 'warning')
        })

      } catch (error) {
        console.error('解析上传题目过程中发生错误:', error)
        this.$message.error('解析上传题目过程中发生错误：' + error.message)
      } finally {
        this.uploadingQuestions = false
        this.showParseUploadButton = false // 上传完成后隐藏按钮
        this.resetUploadData() // 重置相关数据
        this.loadTaskList() // 刷新任务列表
      }
    },

    // 关闭知识点选择弹窗
    handleKnowledgePointsDialogClose() {
      this.knowledgePointsDialogVisible = false
      this.questionKnowledgeSelections = []
      this.currentQuestionData = []
      this.availableKnowledgePoints = []
    },

    // ========== 校对编辑相关方法 ==========

    // JSON转Markdown
    convertJsonToMarkdown(questionData) {
      if (!Array.isArray(questionData) || questionData.length === 0) {
        return '# 题目数据为空\n\n没有找到有效的题目数据。'
      }

      let markdown = `# 题目校对编辑\n\n**共 ${questionData.length} 道题目**\n\n`
      markdown += `---\n\n`

      questionData.forEach((question, index) => {
        markdown += `## 题目 ${index + 1}\n\n`

        // 基本信息
        markdown += `**题目ID:** ${question.sid || '未设置'}\n\n`
        markdown += `**学科:** ${question.subject || question.subject_name || '未设置'}\n\n`
        markdown += `**题型:** ${question.qtype || '未设置'}\n\n`
        markdown += `**难度:** ${question.level || '未设置'}\n\n`

        // 题目内容
        markdown += `### 题目内容\n\n${question.question || '题目内容为空'}\n\n`

        // 选项（如果是选择题）
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
          markdown += `### 选项\n\n`
          question.options.forEach((option, optIndex) => {
            const optionLabel = String.fromCharCode(65 + optIndex) // A, B, C, D...
            markdown += `${optionLabel}. ${option}\n`
          })
          markdown += `\n`
        }

        // 答案
        if (question.answers && Array.isArray(question.answers) && question.answers.length > 0) {
          markdown += `### 答案\n\n${question.answers.join(', ')}\n\n`
        } else if (question.displayanswer) {
          markdown += `### 答案\n\n${question.displayanswer}\n\n`
        }

        // 知识点
        if (question.knowledge_points && Array.isArray(question.knowledge_points) && question.knowledge_points.length > 0) {
          markdown += `### 知识点\n\n${question.knowledge_points.join(', ')}\n\n`
        }

        // 解析
        if (question.Analyse) {
          markdown += `### 解析\n\n${question.Analyse}\n\n`
        }

        // 方法
        if (question.Method) {
          markdown += `### 方法\n\n${question.Method}\n\n`
        }

        // 讨论
        if (question.Discuss) {
          markdown += `### 讨论\n\n${question.Discuss}\n\n`
        }

        // 其他信息
        if (question.path) {
          markdown += `**章节路径:** ${question.path}\n\n`
        }

        if (question.degree) {
          markdown += `**置信度:** ${question.degree}\n\n`
        }

        markdown += `---\n\n`
      })

      return markdown
    },

    // Markdown转JSON
    convertMarkdownToJson(markdown) {
      try {
        if (!markdown || markdown.trim() === '') {
          console.error('Markdown内容为空')
          throw new Error('Markdown内容为空')
        }

        console.log('开始转换Markdown到JSON，内容长度:', markdown.length)
        const lines = markdown.split('\n')
        const questions = []
        let currentQuestion = null
        let currentSection = ''
        let optionIndex = 0

        console.log('Markdown行数:', lines.length)

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()

          // 调试：显示前几行的内容
          if (i < 10) {
            console.log(`第${i}行: "${line}"`)
          }

          // 跳过分隔线和空行
          if (line.startsWith('---') || line === '') {
            continue
          }

          // 跳过一级标题（但不是二级标题）
          if (line.startsWith('#') && !line.startsWith('##')) {
            continue
          }

          // 检测题目开始（二级标题）
          if (line.startsWith('## 题目')) {
            console.log(`找到题目开始标记: "${line}"`)
            if (currentQuestion) {
              questions.push(currentQuestion)
            }
            currentQuestion = {
              sid: '',
              subject_name: '',
              level: '',
              question: '',
              options: [],
              qtype: '',
              answers: [],
              knowledge_points: [],
              Analyse: '',
              Method: '',
              Discuss: '',
              path: '',
              degree: 0.5,
              is_upload: true,
              tags: []
            }
            optionIndex = 0
            continue
          }

          if (!currentQuestion) continue

          // 解析基本信息
          if (line.startsWith('**题目ID:**')) {
            currentQuestion.sid = line.replace('**题目ID:**', '').trim()
            console.log('解析题目ID:', currentQuestion.sid)
          } else if (line.startsWith('**学科:**')) {
            currentQuestion.subject_name = line.replace('**学科:**', '').trim()
            console.log('解析学科:', currentQuestion.subject_name)
          } else if (line.startsWith('**题型:**')) {
            currentQuestion.qtype = line.replace('**题型:**', '').trim()
            console.log('解析题型:', currentQuestion.qtype)
          } else if (line.startsWith('**难度:**')) {
            currentQuestion.level = line.replace('**难度:**', '').trim()
            console.log('解析难度:', currentQuestion.level)
          } else if (line.startsWith('**章节路径:**')) {
            currentQuestion.path = line.replace('**章节路径:**', '').trim()
            console.log('解析章节路径:', currentQuestion.path)
          } else if (line.startsWith('**置信度:**')) {
            const degree = parseFloat(line.replace('**置信度:**', '').trim())
            currentQuestion.degree = isNaN(degree) ? 0.5 : degree
            console.log('解析置信度:', currentQuestion.degree)
          }

          // 检测章节标题
          else if (line.startsWith('### 题目内容')) {
            currentSection = 'question'
            console.log('进入题目内容章节')
          } else if (line.startsWith('### 选项')) {
            currentSection = 'options'
            console.log('进入选项章节')
          } else if (line.startsWith('### 答案')) {
            currentSection = 'answers'
            console.log('进入答案章节')
          } else if (line.startsWith('### 知识点')) {
            currentSection = 'knowledge_points'
            console.log('进入知识点章节')
          } else if (line.startsWith('### 解析')) {
            currentSection = 'Analyse'
            console.log('进入解析章节')
          } else if (line.startsWith('### 方法')) {
            currentSection = 'Method'
            console.log('进入方法章节')
          } else if (line.startsWith('### 讨论')) {
            currentSection = 'Discuss'
            console.log('进入讨论章节')
          }

          // 解析内容
          else if (currentSection && !line.startsWith('###') && !line.startsWith('**')) {
            if (currentSection === 'question') {
              currentQuestion.question += (currentQuestion.question ? '\n' : '') + line
            } else if (currentSection === 'options' && line.match(/^[A-Z]\./)) {
              currentQuestion.options.push(line.substring(2).trim())
            } else if (currentSection === 'answers') {
              const answers = line.split(',').map(a => a.trim())
              currentQuestion.answers = answers
              currentQuestion.displayanswer = answers[0] || ''
            } else if (currentSection === 'knowledge_points') {
              const points = line.split(',').map(p => p.trim())
              currentQuestion.knowledge_points = points
              currentQuestion.points = points
              currentQuestion.knowledge_name = points[0] || ''
            } else if (currentSection === 'Analyse') {
              currentQuestion.Analyse += (currentQuestion.Analyse ? '\n' : '') + line
            } else if (currentSection === 'Method') {
              currentQuestion.Method += (currentQuestion.Method ? '\n' : '') + line
            } else if (currentSection === 'Discuss') {
              currentQuestion.Discuss += (currentQuestion.Discuss ? '\n' : '') + line
            }
          }
        }

        // 添加最后一个题目
        if (currentQuestion) {
          questions.push(currentQuestion)
          console.log('添加最后一个题目:', currentQuestion.sid || '未知ID')
        }

        console.log('Markdown转换完成，共解析出', questions.length, '道题目')
        console.log('解析的题目详情:', questions.map(q => ({
          id: q.sid,
          question: q.question ? q.question.substring(0, 50) + '...' : '无题目内容',
          hasOptions: !!(q.options && q.options.length > 0),
          hasAnswers: !!(q.answers && q.answers.length > 0)
        })))

        return questions
      } catch (error) {
        console.error('Markdown转JSON失败:', error)
        throw new Error('Markdown格式解析失败，请检查格式是否正确: ' + error.message)
      }
    },

    // 确保数据是字符串类型
    ensureString(data) {
      if (!data) return ''
      if (Array.isArray(data)) {
        return data.join('\n')
      }
      if (typeof data !== 'string') {
        return String(data)
      }
      return data
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

    // 处理Markdown内容变化
    handleMarkdownChange() {
      this.renderedMarkdown = this.renderMarkdown(this.markdownContent)
    },

    // 切换编辑/预览模式
    toggleEdit() {
      if (this.isEditing) {
        // 从编辑模式切换到预览模式
        this.markdownContent = this.editingMarkdown
        this.handleMarkdownChange()
        console.log('切换到预览模式，同步编辑内容')
      } else {
        // 从预览模式切换到编辑模式
        this.editingMarkdown = this.markdownContent
        console.log('切换到编辑模式，同步预览内容')
      }
      this.isEditing = !this.isEditing
    },

    // 保存编辑
    saveEdit() {
      this.markdownContent = this.editingMarkdown
      this.handleMarkdownChange()
      this.isEditing = false
      this.$message.success('内容已保存')
    },

    // 重置Markdown内容
    resetMarkdownContent() {
      if (this.originalQuestionData.length > 0) {
        this.markdownContent = this.convertJsonToMarkdown(this.originalQuestionData)
        this.editingMarkdown = this.markdownContent
        this.handleMarkdownChange()
        this.$message.info('内容已重置为原始数据')
      }
    },

    // 验证Markdown内容
    validateMarkdownContent() {
      try {
        // 获取当前编辑器中的内容
        const currentContent = this.isEditing ? this.editingMarkdown : this.markdownContent
        console.log('验证Markdown内容，当前模式:', this.isEditing ? '编辑模式' : '预览模式')
        console.log('验证的内容长度:', currentContent ? currentContent.length : 0)

        if (!currentContent || currentContent.trim() === '') {
          this.$message.warning('没有可验证的内容')
          return false
        }

        const questions = this.convertMarkdownToJson(currentContent)
        console.log('转换后的题目数据:', questions)

        if (questions.length === 0) {
          this.$message.warning('未找到有效的题目数据')
          return false
        }

        // 检查必要字段
        const invalidQuestions = questions.filter(q => !q.question || !q.question.trim())
        if (invalidQuestions.length > 0) {
          this.$message.warning(`发现 ${invalidQuestions.length} 道题目缺少题目内容`)
          return false
        }

        // 检查科目验证
        const unspecifiedSubjectQuestions = questions.filter(q => !q.subject_name || q.subject_name === '未指定科目')
        if (unspecifiedSubjectQuestions.length > 0) {
          this.$message.error(`发现 ${unspecifiedSubjectQuestions.length} 道题目的科目为"未指定科目"，请选择具体的科目`)
          return false
        }

        // 检查试题来源内容（类似现有的标签验证）
        const invalidTagQuestions = questions.filter(q => q.tags && q.tags.some(tag => tag === '图片解析失败'))
        if (invalidTagQuestions.length > 0) {
          this.$message.error(`发现 ${invalidTagQuestions.length} 道题目的标签内容为"图片解析失败"，请修改标签内容`)
          return false
        }

        this.$message.success(`验证通过，共 ${questions.length} 道题目`)
        return true
      } catch (error) {
        console.error('验证失败:', error)
        this.$message.error('验证失败：' + error.message)
        return false
      }
    },

    // 确认校对并上传
    async confirmReviewAndUpload() {
      try {
        // 先验证格式
        if (!this.validateMarkdownContent()) {
          return
        }

        // 获取当前编辑器中的内容
        const currentContent = this.isEditing ? this.editingMarkdown : this.markdownContent
        console.log('上传Markdown内容，当前模式:', this.isEditing ? '编辑模式' : '预览模式')
        console.log('上传的内容长度:', currentContent ? currentContent.length : 0)

        // 转换Markdown为JSON
        const questions = this.convertMarkdownToJson(currentContent)
        console.log('转换后的题目数据:', questions)

        // 先验证所有题目
        let validationErrors = []
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i]
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

        this.uploadingFromReview = true
        let successCount = 0
        let failCount = 0

        // 逐题上传
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i]
          const formattedQuestion = this.formatQuestionForUpload(question)

          console.log(`正在上传第 ${i + 1}/${questions.length} 题:`, formattedQuestion)

          try {
            const response = await uploadQuestion(formattedQuestion)
            console.log(`API响应:`, response)

            if (response.code === 200) {
              successCount++
              this.$message.success(`题目 ${i + 1} 上传成功！`)
            } else {
              failCount++
              let errorMsg = '未知错误'
              if (response.msg) errorMsg = response.msg
              else if (response.message) errorMsg = response.message
              else if (response.detail) errorMsg = response.detail

              errorMsg = this.cleanErrorMessage(errorMsg)
              this.$message.error(`题目 ${i + 1} 上传失败: ${errorMsg}`)
            }
          } catch (uploadError) {
            failCount++
            console.error(`上传题目 ${i + 1} 失败:`, uploadError)
            let errorMsg = '网络错误'
            if (uploadError.message) {
              errorMsg = uploadError.message
            }
            errorMsg = this.cleanErrorMessage(errorMsg)
            this.$message.error(`题目 ${i + 1} 上传异常: ${errorMsg}`)
          }
        }

        // 显示上传结果
        this.$alert(`共上传 ${questions.length} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
          confirmButtonText: '确定',
          type: successCount === questions.length ? 'success' : (failCount === questions.length ? 'error' : 'warning')
        })

        // 关闭弹窗并刷新列表
        this.reviewDialogVisible = false
        this.loadTaskList()

      } catch (error) {
        console.error('确认校对并上传失败:', error)
        this.$message.error('上传失败：' + error.message)
      } finally {
        this.uploadingFromReview = false
      }
    },

    // 关闭校对编辑弹窗
    handleReviewDialogClose() {
      this.reviewDialogVisible = false
      this.markdownContent = ''
      this.renderedMarkdown = ''
      this.editingMarkdown = ''
      this.isEditing = false
      this.originalQuestionData = []
    },

    // 打开校对编辑弹窗
    openReviewDialog(task) {
      console.log('打开校对编辑弹窗，任务数据:', task)

      if (!task || (!task.resourceUrl && !task.newResourceUrl)) {
        this.$message.warning('没有可编辑的题目数据')
        return
      }

      // 解析题目数据
      let questionData = []
      let resourceData = task.resourceUrl

      // 优先使用resourceUrl，如果没有则尝试newResourceUrl
      if (!resourceData && task.newResourceUrl) {
        resourceData = task.newResourceUrl
        console.log('使用newResourceUrl作为数据源')
      }

      console.log('原始resourceUrl:', resourceData)
      console.log('resourceUrl类型:', typeof resourceData)

      if (typeof resourceData === 'string') {
        try {
          resourceData = JSON.parse(resourceData)
          console.log('解析后的resourceData:', resourceData)
        } catch (e) {
          console.warn('resourceUrl不是有效的JSON字符串:', e)
          this.$message.error('题目数据格式错误')
          return
        }
      }

      // 根据不同的数据结构提取题目数据
      console.log('开始查找题目数据，数据结构:', {
        isArray: Array.isArray(resourceData),
        hasQuestionData: !!(resourceData && resourceData.question_data),
        hasResults: !!(resourceData && resourceData.results),
        hasJsonData: !!(resourceData && resourceData.json_data),
        resourceDataKeys: resourceData ? Object.keys(resourceData) : []
      })

      // 检查是否是成功消息（表示文档解析完成但未添加章节路径）
      if (resourceData && resourceData.success && resourceData.message) {
        console.log('检测到成功消息，但未添加章节路径:', resourceData.message)
        this.$message.error('文档解析完成，但尚未添加章节路径，请先完成章节路径选择')
        return
      }

      if (Array.isArray(resourceData)) {
        questionData = resourceData
        console.log('使用数组格式，题目数量:', questionData.length)
      } else if (resourceData && resourceData.question_data && Array.isArray(resourceData.question_data)) {
        questionData = resourceData.question_data
        console.log('使用question_data格式，题目数量:', questionData.length)
      } else if (resourceData && resourceData.results && resourceData.results.json_data && Array.isArray(resourceData.results.json_data)) {
        questionData = resourceData.results.json_data
        console.log('使用results.json_data格式，题目数量:', questionData.length)
      } else if (resourceData && resourceData.json_data && Array.isArray(resourceData.json_data)) {
        questionData = resourceData.json_data
        console.log('使用json_data格式，题目数量:', questionData.length)
      } else {
        console.error('未找到有效的题目数据，resourceData结构:', resourceData)
        this.$message.error('未找到有效的题目数据，请检查数据结构。数据格式：' + (typeof resourceData))
        return
      }

      if (questionData.length === 0) {
        this.$message.error('题目数据为空')
        return
      }

      // 保存原始数据
      this.originalQuestionData = JSON.parse(JSON.stringify(questionData))

      // 转换为Markdown
      this.markdownContent = this.convertJsonToMarkdown(questionData)
      this.editingMarkdown = this.markdownContent
      this.handleMarkdownChange()

      // 显示弹窗
      this.reviewDialogVisible = true
      this.isEditing = false // 默认显示预览模式

      this.$message.info('请仔细校对题目内容，修改后点击"确认并上传"')
    },

    // ========== 题目编辑相关方法 ==========

    // 处理题目数据，保持children结构
    processQuestions(questions) {
      const processed = []

      questions.forEach((question, index) => {
        // 处理主题目的cate映射
        const mainSubjectName = question.subject_name || question.subject
        let mainCate = question.cate
        let syncedCateName = question.catename || question.qtype

        // 优先根据cate值映射到qtype和catename
        if (mainCate && mainCate > 0 && mainSubjectName) {
          const qtypeFromCate = getQuestionTypeByCode(mainSubjectName, mainCate)
          if (qtypeFromCate) {
            syncedCateName = qtypeFromCate
            console.log(`主题目根据cate映射 - 学科: ${mainSubjectName}, cate: ${mainCate}, 题型: ${qtypeFromCate}`)
          } else {
            console.warn(`主题目cate映射失败 - 学科: ${mainSubjectName}, cate: ${mainCate}`)
          }
        } else if (syncedCateName && mainSubjectName) {
          // 如果没有cate但有catename/qtype，则根据qtype设置cate
          mainCate = getQuestionTypeCode(mainSubjectName, syncedCateName)
          if (mainCate > 0) {
            console.log(`主题目根据qtype设置cate - 学科: ${mainSubjectName}, 题型: ${syncedCateName}, cate: ${mainCate}`)
          } else {
            console.warn(`主题目qtype映射失败 - 学科: ${mainSubjectName}, 题型: ${syncedCateName}`)
            mainCate = 0
          }
        }

        // 处理主题目
        const mainQuestion = {
          ...question,
          // 确保cate字段有值
          cate: mainCate || 0,
          // 确保catename与qtype同步
          catename: syncedCateName,
          // 确保knowledge_points是数组
          knowledge_points: Array.isArray(question.knowledge_points) ? question.knowledge_points : (question.knowledge_points ? [question.knowledge_points] : []),
          // 确保confidence是数组
          confidence: Array.isArray(question.confidence) ? question.confidence : (question.confidence ? [question.confidence] : []),
          // 新增参数的默认值
          Score: question.Score || 0,
          score: question.score || question.Score || 0, // 确保小写score字段有默认值
          source: question.source || '麓鸣上传',
          series_type: question.series_type || this.globalSettings.series_type,
          series: question.series || this.globalSettings.series,
          tags: Array.isArray(question.tags) ? question.tags : (question.tags ? [question.tags] : []),
          series_path: question.series_path || this.globalSettings.series_path,
          // 添加层级标识
          isMainQuestion: true,
          mainQuestionIndex: index,
          subQuestionIndex: null,
          hasSubQuestions: question.children && question.children.length > 0,
          // 处理子题目，保持children结构
          children: question.children && question.children.length > 0 ?
            question.children.map((subQuestion, subIndex) => {
              // 处理子题目的cate映射
              const subSubjectName = subQuestion.subject_name || question.subject_name || question.subject
              let subCate = subQuestion.cate
              let syncedSubCateName = subQuestion.catename || subQuestion.qtype

              // 优先根据cate值映射到qtype和catename
              if (subCate && subCate > 0 && subSubjectName) {
                const subQtypeFromCate = getQuestionTypeByCode(subSubjectName, subCate)
                if (subQtypeFromCate) {
                  syncedSubCateName = subQtypeFromCate
                  console.log(`子题目根据cate映射 - 学科: ${subSubjectName}, cate: ${subCate}, 题型: ${subQtypeFromCate}`)
                } else {
                  console.warn(`子题目cate映射失败 - 学科: ${subSubjectName}, cate: ${subCate}`)
                }
              } else if (syncedSubCateName && subSubjectName) {
                // 如果没有cate但有catename/qtype，则根据qtype设置cate
                subCate = getQuestionTypeCode(subSubjectName, syncedSubCateName)
                if (subCate > 0) {
                  console.log(`子题目根据qtype设置cate - 学科: ${subSubjectName}, 题型: ${syncedSubCateName}, cate: ${subCate}`)
                } else {
                  console.warn(`子题目qtype映射失败 - 学科: ${subSubjectName}, 题型: ${syncedSubCateName}`)
                  subCate = 0
                }
              }

              return {
                ...subQuestion,
                // 确保cate字段有值
                cate: subCate || 0,
                // 确保catename与qtype同步
                catename: syncedSubCateName,
                // 将question字段转换为content字段，参考菁优网格式
                content: subQuestion.question || subQuestion.content || '',
                // 确保子题有学科信息，如果没有则从父题目继承
                subject_name: subSubjectName,
                // 确保knowledge_points是数组
                knowledge_points: Array.isArray(subQuestion.knowledge_points) ? subQuestion.knowledge_points : (subQuestion.knowledge_points ? [subQuestion.knowledge_points] : []),
                // 确保confidence是数组
                confidence: Array.isArray(subQuestion.confidence) ? subQuestion.confidence : (subQuestion.confidence ? [subQuestion.confidence] : []),
                // 新增参数的默认值
                Score: subQuestion.Score || 0,
                score: subQuestion.score || subQuestion.Score || 0, // 确保小写score字段有默认值
                source: subQuestion.source || '麓鸣上传',
                series_type: subQuestion.series_type || this.globalSettings.series_type,
                series: subQuestion.series || this.globalSettings.series,
                tags: Array.isArray(subQuestion.tags) ? subQuestion.tags : (subQuestion.tags ? [subQuestion.tags] : []),
                series_path: subQuestion.series_path || this.globalSettings.series_path,
                // 添加层级标识
                isMainQuestion: false,
                mainQuestionIndex: index,
                subQuestionIndex: subIndex,
                hasSubQuestions: false
              }
            }) : []
        }

        processed.push(mainQuestion)
      })

      return processed
    },

    // 打开题目编辑器
    openQuestionEditor(task) {
      console.log('打开题目编辑器，任务数据:', task)

      if (!task || (!task.newResourceUrl)) {
        this.$message.warning('没有可编辑的题目数据')
        return
      }

      // 设置当前任务ID
      this.currentTaskId = task.id
      this.currentTaskData = task
      console.log('设置当前任务ID:', this.currentTaskId)

      // 解析题目数据
      let questionData = []
      let resourceData = task.newResourceUrl

      if (typeof resourceData === 'string') {
        try {
          resourceData = JSON.parse(resourceData)
        } catch (e) {
          console.warn('newResourceUrl不是有效的JSON字符串:', e)
          this.$message.error('题目数据格式错误')
          return
        }
      }

      // 根据不同的数据结构提取题目数据
      if (Array.isArray(resourceData)) {
        questionData = resourceData
      } else if (resourceData && resourceData.question_data && Array.isArray(resourceData.question_data)) {
        questionData = resourceData.question_data
      } else if (resourceData && resourceData.results && resourceData.results.json_data && Array.isArray(resourceData.results.json_data)) {
        questionData = resourceData.results.json_data
      } else if (resourceData && resourceData.json_data && Array.isArray(resourceData.json_data)) {
        questionData = resourceData.json_data
      } else {
        this.$message.error('未找到有效的题目数据')
        return
      }

      if (questionData.length === 0) {
        this.$message.error('题目数据为空')
        return
      }

      // 处理题目数据，保持children结构
      const processedQuestions = this.processQuestions(questionData)

      // 设置题目数据
      this.questions = processedQuestions

      console.log('处理后的题目数据:', this.questions)
      console.log('第一道题目:', this.questions[0])

      // 同步所有题目的cate和catename
      this.syncAllQuestionsCateAndCatename()

      // 提取所有知识点
      this.extractAllKnowledgePoints(this.questions)

      // 显示编辑器
      this.questionEditorVisible = true
      this.currentQuestionIndex = '0'
      this.questionEditing = true

      // 自动加载系列列表
      this.loadSeriesList()

      // 加载题型数据
      if (this.questions.length > 0 && this.questions[0].subject_name) {
        this.loadQuestionTypes(this.questions[0].subject_name)
      }

      // 初始化可用主题列表
      this.initAvailableTopics()

      console.log('编辑器状态:', {
        questionEditorVisible: this.questionEditorVisible,
        currentQuestionIndex: this.currentQuestionIndex,
        questionsLength: this.questions.length
      })

      this.$message.success(`已加载 ${this.questions.length} 道题目，可以开始编辑`)
    },

    // 提取所有知识点
    extractAllKnowledgePoints(questions) {
      const allPoints = new Set()
      questions.forEach(question => {
        if (question.knowledge_points && Array.isArray(question.knowledge_points)) {
          question.knowledge_points.forEach(point => allPoints.add(point))
        }
      })
      this.availableKnowledgePoints = Array.from(allPoints)
    },

    // 处理题目标签切换
    handleQuestionTabClick(tab) {
      // 保存当前题目的分数修改
      this.saveCurrentQuestionScore()
      this.currentQuestionIndex = tab.name
      console.log('切换到题目:', tab.name)
    },

    // 处理分数变化
    handleScoreChange(value) {
      if (value !== null && value !== undefined) {
        // 立即保存分数到原始数据
        this.saveCurrentQuestionScore()
      }
    },

    // 保存当前题目的分数
    saveCurrentQuestionScore() {
      if (!this.currentQuestion) return

      // 统一使用score字段（小写）
      const score = this.currentQuestion.score

      if (score !== null && score !== undefined) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
            // 更新子题分数
            mainQuestion.children[subIndex].score = score
            // 保持兼容性，同时更新Score字段
            mainQuestion.children[subIndex].Score = score
          }
        } else {
          // 主题目
          const index = parseInt(this.currentQuestionIndex)
          const mainQuestion = this.questions[index]
          if (mainQuestion) {
            // 更新主题目分数
            mainQuestion.score = score
            // 保持兼容性，同时更新Score字段
            mainQuestion.Score = score
          }
        }
      }
    },

    // 切换编辑模式

    // 重置题目内容
    resetQuestionContent() {
      if (this.currentQuestion) {
        // 这里可以从原始数据恢复，暂时简单处理
        this.$message.info('题目内容已重置')
      }
    },

    // 重置滚动条到顶部
    resetScrollToTop() {
      // 查找题目编辑区域的滚动容器
      const editSection = document.querySelector('.question-edit-section')
      if (editSection) {
        editSection.scrollTop = 0
      }

      // 如果题目编辑区域在弹窗中，也重置弹窗的滚动
      const dialogBody = document.querySelector('.el-dialog__body')
      if (dialogBody) {
        dialogBody.scrollTop = 0
      }
    },

    // 选择题目
    selectQuestion(index) {
      // 保存当前题目的分数修改
      this.saveCurrentQuestionScore()
      this.currentQuestionIndex = index.toString()
      // 重置滚动条到顶部
      this.$nextTick(() => {
        this.resetScrollToTop()
      })
      console.log('选择题目:', index + 1)
    },

    // 选择子题
    selectSubQuestion(mainIndex, subIndex) {
      // 保存当前题目的分数修改
      this.saveCurrentQuestionScore()
      this.currentQuestionIndex = `${mainIndex}-${subIndex}`

      // 确保子题目的分数有默认值
      const mainQuestion = this.questions[mainIndex]
      if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
        const subQuestion = mainQuestion.children[subIndex]
        if (subQuestion.score === undefined || subQuestion.score === null) {
          subQuestion.score = 0
        }
        if (subQuestion.Score === undefined || subQuestion.Score === null) {
          subQuestion.Score = 0
        }
      }

      // 重置滚动条到顶部
      this.$nextTick(() => {
        this.resetScrollToTop()
      })

      console.log('选择子题:', mainIndex + 1, subIndex + 1)
    },

    // 删除题目
    async deleteQuestion(index) {
      try {
        const question = this.questions[index]
        const questionTitle = `题目 ${question.mainQuestionIndex + 1}`

        await this.$confirm(
          `确定要删除 ${questionTitle} 吗？\n\n题目内容：${question.question.substring(0, 50)}...`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        )

        // 删除题目
        this.questions.splice(index, 1)

        // 重新计算索引
        this.questions.forEach((q, i) => {
          q.mainQuestionIndex = i
        })

        // 调整当前选中的题目
        if (parseInt(this.currentQuestionIndex) >= this.questions.length) {
          this.currentQuestionIndex = Math.max(0, this.questions.length - 1).toString()
        }

        this.$message.success('题目删除成功')
        console.log('删除题目后的列表:', this.questions)

      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除题目失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      }
    },

    // 删除子题
    async deleteSubQuestion(mainIndex, subIndex) {
      try {
        const mainQuestion = this.questions[mainIndex]
        const subQuestion = mainQuestion.children[subIndex]

        await this.$confirm(
          `确定要删除子题 ${mainIndex + 1}-${subIndex + 1} 吗？\n\n子题内容：${(subQuestion.content || subQuestion.question || '').substring(0, 50)}...`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        )

        // 删除子题
        mainQuestion.children.splice(subIndex, 1)

        // 更新子题索引
        mainQuestion.children.forEach((sub, index) => {
          sub.subQuestionIndex = index
        })

        // 更新主题目的子题数量标识
        mainQuestion.hasSubQuestions = mainQuestion.children.length > 0

        // 调整当前选中的题目
        if (this.currentQuestionIndex === `${mainIndex}-${subIndex}`) {
          this.currentQuestionIndex = mainIndex.toString()
        }

        this.$message.success('子题删除成功')
        console.log('删除子题后的列表:', this.questions)

      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除子题失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      }
    },

    // 生成随机sid
    generateRandomSid() {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      return `q_${timestamp}_${random}`
    },

    // 新增题目
    addNewQuestion() {
      // 从已有题目中获取学科信息
      const existingQuestion = this.getExistingQuestionInfo()

      const newQuestion = {
        sid: this.generateRandomSid(),
        subject_name: existingQuestion.subject_name || '未指定科目',
        question: '',
        qtype: existingQuestion.qtype || '选择题', // 使用已有题目的题型
        options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
        answers: ['A'],
        children: [],
        hasSubQuestions: false,
        mainQuestionIndex: this.questions.length,
        Score: 0, // 默认分数
        score: 0, // 默认分数（小写，用于模板绑定）
        Analyse: '',
        Method: '',
        Discuss: '',
        knowledge_points: [],
        source: '麓鸣上传',
        series: this.globalSettings.series || 1,
        series_path: this.globalSettings.series_path || '',
        tags: [],
        // 从已有题目获取学科相关信息
        level: existingQuestion.level || 'middle',
        subject_code: existingQuestion.subject_code || '',
        cate: existingQuestion.cate || '',
        catename: existingQuestion.catename || '',
        label: '',
        points: existingQuestion.points || [],
        knowledge_name: existingQuestion.knowledge_name || '',
        path: existingQuestion.path || '',
        displayanswer: 'A',
        degree: existingQuestion.degree || 0.5,
        topic: existingQuestion.topic || []
      }

      this.questions.push(newQuestion)
      this.currentQuestionIndex = (this.questions.length - 1).toString()
      // 初始化可用主题列表
      this.initAvailableTopics()
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
        mainQuestion.children = []
      }

      // 从已有题目中获取学科信息
      const existingQuestion = this.getExistingQuestionInfo()

      const newSubQuestion = {
        // 子题不需要sid
        subject_name: existingQuestion.subject_name || mainQuestion.subject_name,
        question: '',
        qtype: existingQuestion.qtype || mainQuestion.qtype || '选择题', // 使用已有题目的题型
        options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
        answers: ['A'],
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
        tags: [],
        // 从已有题目获取学科相关信息
        level: existingQuestion.level || mainQuestion.level || 'middle',
        subject_code: existingQuestion.subject_code || mainQuestion.subject_code || '',
        cate: existingQuestion.cate || mainQuestion.cate || '',
        catename: existingQuestion.catename || mainQuestion.catename || '',
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
    },

    // 从已有题目中获取学科信息
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
          topic: this.currentQuestion.topic
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
          topic: firstQuestion.topic
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
        topic: []
      }
    },

    // 在指定位置插入子题
    insertSubQuestion(mainIndex, insertIndex) {
      if (!this.currentQuestion || this.currentQuestionIndex.includes('-')) {
        this.$message.warning('请先选择主题目')
        return
      }

      const mainQuestion = this.questions[mainIndex]

      // 确保children数组存在
      if (!mainQuestion.children) {
        mainQuestion.children = []
      }

      // 从已有题目中获取学科信息
      const existingQuestion = this.getExistingQuestionInfo()

      const newSubQuestion = {
        // 子题不需要sid
        subject_name: existingQuestion.subject_name || mainQuestion.subject_name,
        question: '',
        qtype: existingQuestion.qtype || mainQuestion.qtype || '选择题', // 使用已有题目的题型
        options: ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
        answers: ['A'],
        subQuestionIndex: insertIndex,
        Score: 0, // 子题默认分数（大写，兼容旧版本）
        score: 0, // 子题默认分数（小写，新版本）
        Analyse: '',
        Method: '',
        Discuss: '',
        knowledge_points: [],
        source: '麓鸣上传',
        series: mainQuestion.series || this.globalSettings.series || 1,
        series_path: mainQuestion.series_path || this.globalSettings.series_path || '',
        tags: [],
        // 从已有题目获取学科相关信息
        level: existingQuestion.level || mainQuestion.level || 'middle',
        subject_code: existingQuestion.subject_code || mainQuestion.subject_code || '',
        cate: existingQuestion.cate || mainQuestion.cate || '',
        catename: existingQuestion.catename || mainQuestion.catename || '',
        label: '',
        points: existingQuestion.points || mainQuestion.points || [],
        knowledge_name: existingQuestion.knowledge_name || mainQuestion.knowledge_name || '',
        path: existingQuestion.path || mainQuestion.path || '',
        displayanswer: 'A',
        degree: existingQuestion.degree || mainQuestion.degree || 0.5,
        topic: existingQuestion.topic || mainQuestion.topic || []
      }

      // 在指定位置插入子题
      mainQuestion.children.splice(insertIndex, 0, newSubQuestion)
      mainQuestion.hasSubQuestions = true

      // 更新所有子题的索引
      this.updateSubQuestionIndexes(mainIndex)

      // 选中新创建的子题
      this.currentQuestionIndex = `${mainIndex}-${insertIndex}`
      this.$message.success('插入子题成功')
      console.log('插入子题:', newSubQuestion)
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

    // 从系列信息获取学科名称
    getSubjectFromSeries() {
      if (this.globalSettings.series_type) {
        return this.globalSettings.series_type
      }
      return '未指定科目'
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

    // 处理标签变化
    handleLabelChange(value) {
      if (this.currentQuestion) {
        // 检查是否是子题
        if (this.currentQuestionIndex.includes('-')) {
          // 子题：保存到原始数据结构中
          const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
          const mainQuestion = this.questions[mainIndex]
          if (mainQuestion.children && mainQuestion.children[subIndex]) {
            mainQuestion.children[subIndex].label = value
          }
        } else {
          // 主题目：直接保存
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.questions[index].label = value
          }
        }
        console.log('标签已更新:', value)
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
          if (mainQuestion.children && mainQuestion.children[subIndex]) {
            mainQuestion.children[subIndex].label = value
          }
        } else {
          // 主题目：直接保存
          const index = parseInt(this.currentQuestionIndex)
          if (this.questions[index]) {
            this.questions[index].label = value
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

    // 初始化可用主题/话题列表
    initAvailableTopics() {
      // 从已有题目中提取所有主题/话题
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
      console.log('初始化可用主题/话题列表:', this.availableTopics)
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
      } else if (this.wordForm && this.wordForm.subject_name) {
        subjectName = this.wordForm.subject_name
      }

      // 检查是否是英语或语文科目
      if (subjectName && (subjectName.includes('英语') || subjectName.includes('语文'))) {
        console.log('检测到英语或语文科目，准备获取知识点:', subjectName)
        await this.loadKnowledgePointsForSubject(subjectName)
      } else {
        console.log('非英语或语文科目，使用默认知识点列表')
      }
    },

    // 根据学科加载知识点
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

    // 处理系列类型变化
    handleSeriesTypeChange(seriesType) {
      console.log('系列类型变化:', seriesType)
      this.globalSettings.series_type = seriesType
      // 清空系列和系列路径，让用户重新选择
      this.globalSettings.series = null
      this.globalSettings.series_path = ''

      // 重新加载系列列表
      this.loadSeriesList()

      this.$message.info('请重新选择系列和系列路径')
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

    // 将全局设置应用到所有题目
    applyGlobalSettingsToAllQuestions() {
      this.questions.forEach(question => {
        question.series_type = this.globalSettings.series_type
        question.series = this.globalSettings.series
        question.series_path = this.globalSettings.series_path
      })
      console.log('全局设置已应用到所有题目')
    },

    // 加载系列列表
    async loadSeriesList() {
      if (this.seriesList.length > 0) {
        return // 已经加载过了
      }

      try {
        this.seriesLoading = true
        // 添加role参数
        const params = {
          pageNum: 1,
          pageSize: 1000,
          role: this.userRole
        }
        const response = await listSeries(params)
        if (response.code === 200) {
          this.seriesList = response.rows || []
          console.log('加载系列列表成功:', this.seriesList)
        } else {
          this.$message.error('加载系列列表失败: ' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('加载系列列表失败:', error)
        this.$message.error('加载系列列表失败: ' + error.message)
      } finally {
        this.seriesLoading = false
      }
    },

    // 解析系列路径
    parseSeriesPath(seriesData) {
      // 此方法不再用于构建完整的系列路径，仅用于兼容
      return ''
    },

    // 验证所有题目
    validateAllQuestions() {
      try {
        // 先验证系列相关字段
        if (!this.globalSettings.series_type) {
          this.$message.error('请选择系列类型')
          return false
        }
        if (!this.globalSettings.series) {
          this.$message.error('请选择系列')
          return false
        }
        if (!this.globalSettings.series_path) {
          this.$message.error('请选择系列路径')
          return false
        }

        let validCount = 0
        let invalidQuestions = []

        this.questions.forEach((question, index) => {
          if (!question.question || !question.question.trim()) {
            invalidQuestions.push(`题目 ${index + 1}: 题目内容为空`)
          } else {
            validCount++
          }

          // 验证答案字段
          const hasAnswer = (question.displayanswer && question.displayanswer.trim()) ||
                           (question.answers && question.answers.length > 0 && question.answers.some(ans => ans && ans.trim()))
          if (!hasAnswer) {
            invalidQuestions.push(`题目 ${index + 1}: 答案为空，请填写答案`)
          }

          // 验证科目字段
          if (!question.subject_name || question.subject_name === '未指定科目') {
            invalidQuestions.push(`题目 ${index + 1}: 科目为"未指定科目"，请选择具体的科目`)
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

              // 验证子题答案字段
              const subHasAnswer = (subQuestion.displayanswer && subQuestion.displayanswer.trim()) ||
                                 (subQuestion.answers && subQuestion.answers.length > 0 && subQuestion.answers.some(ans => ans && ans.trim()))
              if (!subHasAnswer) {
                invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 子题答案为空，请填写答案`)
              }

              // 验证子题科目字段
              if (!subQuestion.subject_name || subQuestion.subject_name === '未指定科目') {
                invalidQuestions.push(`题目 ${index + 1}-${subIndex + 1}: 科目为"未指定科目"，请选择具体的科目`)
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

        // 检查题目数据中是否包含双引号，如果有则提示用户
        let hasQuotes = false
        for (let i = 0; i < this.questions.length; i++) {
          const question = this.questions[i]
          if (this.checkObjectForQuotes(question)) {
            hasQuotes = true
            break
          }
        }

        if (hasQuotes) {
          console.log('检测到题目数据中包含双引号，将自动进行转义处理')
          this.$message.info('检测到题目数据中包含双引号，系统将自动进行转义处理')
        }

        this.uploadingQuestions = true
        let successCount = 0
        let failCount = 0
        let failureReasons = []

        // 更新任务进度为"处理中"
        console.log('开始上传，更新任务进度为"处理中"，当前任务ID:', this.currentTaskId)
        await this.updateTaskProgressStatus('处理中', successCount, failCount, '')
        this.updateLocalTaskProgress('处理中', successCount, failCount, '')

        // 逐题上传
        for (let i = 0; i < this.questions.length; i++) {
          const question = this.questions[i]
          const formattedQuestion = this.formatQuestionForUpload(question)

          console.log(`正在上传第 ${i + 1}/${this.questions.length} 题:`, formattedQuestion)

          try {
            const response = await uploadQuestion(formattedQuestion)
            console.log(`API响应:`, response)

            if (response.code === 200) {
              successCount++
              this.$message.success(`题目 ${i + 1} 上传成功！`)
            } else {
              failCount++
              let errorMsg = '未知错误'
              if (response.msg) errorMsg = response.msg
              else if (response.message) errorMsg = response.message
              else if (response.detail) errorMsg = response.detail

              errorMsg = this.cleanErrorMessage(errorMsg)
              const detailedReason = `题目 ${i + 1}: ${errorMsg}`
              failureReasons.push(detailedReason)
              this.$message.error(`题目 ${i + 1} 上传失败: ${errorMsg}`)
            }
          } catch (uploadError) {
            failCount++
            console.error(`上传题目 ${i + 1} 失败:`, uploadError)
            let errorMsg = '网络错误'
            if (uploadError.message) {
              errorMsg = uploadError.message
            }
            errorMsg = this.cleanErrorMessage(errorMsg)
            const detailedReason = `题目 ${i + 1}: ${errorMsg}`
            failureReasons.push(detailedReason)
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

          const failureReason = failureReasons.length > 0 ? failureReasons.join('; ') : ''
          console.log('上传完成，准备更新任务进度:', {
            progressStatus,
            successCount,
            failCount,
            failureReason,
            taskStatus,
            currentTaskId: this.currentTaskId
          })

          await this.updateTaskProgressStatus(progressStatus, successCount, failCount, failureReason, taskStatus)

          // 立即更新本地任务列表中的进度数据
          console.log('开始更新本地任务进度数据')
          this.updateLocalTaskProgress(progressStatus, successCount, failCount, failureReason)
        }

        // 显示上传结果
        this.$alert(`共上传 ${this.questions.length} 题，成功 ${successCount} 题，失败 ${failCount} 题。`, '上传结果', {
          confirmButtonText: '确定',
          type: successCount === this.questions.length ? 'success' : (failCount === this.questions.length ? 'error' : 'warning')
        })

        // 只有全部上传成功时才关闭弹窗并刷新列表
        if (successCount === this.questions.length) {
          this.questionEditorVisible = false
          this.loadTaskList()
          // 清空系列相关字段
          this.globalSettings.series_type = ''
          this.globalSettings.series = null
          this.globalSettings.series_path = ''
        }

      } catch (error) {
        console.error('上传所有题目失败:', error)
        this.$message.error('上传失败：' + error.message)

        // 更新任务进度为"上传出错"
        if (this.currentTaskId) {
          await this.updateTaskProgressStatus('上传出错', 0, this.questions.length, '上传过程中发生异常: ' + error.message, '上传失败')
          // 立即更新本地任务列表中的进度数据
          this.updateLocalTaskProgress('上传出错', 0, this.questions.length, '上传过程中发生异常: ' + error.message)
        } else {
          console.error('异常发生时也没有当前任务ID')
        }
      } finally {
        this.uploadingQuestions = false
      }
    },

    // 更新任务进度状态
    async updateTaskProgressStatus(taskProgress, successCount, failureCount, failureReason, taskStatus = '') {
      try {
        if (!this.currentTaskId) {
          console.warn('没有当前任务ID，无法更新任务进度')
          return
        }

        // 确保taskProgress对象存在且有ID
        if (!this.currentTaskData || !this.currentTaskData.taskProgress || !this.currentTaskData.taskProgress.id) {
          console.error('无法获取taskProgress的ID，请检查currentTaskData或taskProgress对象')
          return
        }

        const progressData = {
          id: this.currentTaskData.taskProgress.id, // 使用taskProgress对象自身的ID
          taskTableId: this.currentTaskData.id, // 使用父任务的ID作为taskTableId
          taskProgress: taskProgress,
          successCount: successCount,
          failureCount: failureCount,
          failureReason: failureReason,
          taskStatus: taskStatus
        }

        console.log('更新任务进度:', progressData)
        console.log('使用的ID信息:', {
          taskProgressId: this.currentTaskData.taskProgress.id,
          parentTaskId: this.currentTaskData.id,
          currentTaskId: this.currentTaskId
        })

        const response = await updateTaskProgress(progressData)
        console.log('任务进度更新响应:', response)

        if (response.code === 200) {
          console.log('任务进度更新成功')
        } else {
          console.error('任务进度更新失败:', response.msg || response.message)
        }
      } catch (error) {
        console.error('更新任务进度异常:', error)
      }
    },

    // 更新本地任务列表中的进度数据
    updateLocalTaskProgress(taskProgress, successCount, failureCount, failureReason) {
      console.log('开始更新本地任务进度:', {
        currentTaskId: this.currentTaskId,
        taskProgress,
        successCount,
        failureCount,
        failureReason
      })

      if (!this.currentTaskId) {
        console.warn('没有当前任务ID，无法更新本地任务进度')
        return
      }

      // 找到当前任务并更新其进度数据
      const taskIndex = this.taskList.findIndex(task => task.id === this.currentTaskId)
      console.log('找到任务索引:', taskIndex, '任务列表长度:', this.taskList.length)

      if (taskIndex !== -1) {
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

        // 确保taskProgress对象存在
        if (!this.taskList[taskIndex].taskProgress) {
          console.log('创建新的taskProgress对象')
          this.taskList[taskIndex].taskProgress = {
            id: null,
            taskTableId: this.currentTaskId,
            taskProgress: '未完成',
            successCount: 0,
            failureCount: 0,
            failureReason: null,
            taskStatus: null,
            createTime: currentTime,
            createBy: null,
            updateTime: null,
            updateBy: null,
            remark: null
          }
        }

        console.log('更新前的taskProgress:', this.taskList[taskIndex].taskProgress)

        // 更新任务进度对象的所有相关字段
        this.taskList[taskIndex].taskProgress = {
          ...this.taskList[taskIndex].taskProgress,
          taskProgress: taskProgress,           // 进度状态：未完成/已完成/上传出错
          successCount: successCount,           // 成功数量
          failureCount: failureCount,           // 失败数量
          failureReason: failureReason,         // 失败原因
          updateTime: currentTime               // 更新时间
        }

        console.log('更新后的taskProgress:', this.taskList[taskIndex].taskProgress)

        // 使用Vue.set确保响应式更新
        this.$set(this.taskList, taskIndex, { ...this.taskList[taskIndex] })

        console.log('本地任务进度已更新完成')
      } else {
        console.error('未找到对应的任务，任务ID:', this.currentTaskId)
      }
    },

    // 关闭题目编辑器
    handleQuestionEditorClose() {
      this.questionEditorVisible = false
      this.questions = []
      this.currentQuestionIndex = '0'
      this.questionEditing = true
      this.availableKnowledgePoints = []
      // 清空系列相关字段
      this.globalSettings.series_type = ''
      this.globalSettings.series = null
      this.globalSettings.series_path = ''
    },

    // ========== 编辑弹窗相关方法 ==========

    // 打开编辑弹窗
    openEditDialog(type) {
      if (!this.currentQuestion) {
        this.$message.warning('没有可编辑的题目')
        return
      }

      this.editDialogType = type

      // 根据类型设置标题和内容
      switch (type) {
        case 'question':
          this.editDialogTitle = '编辑题目内容'
          this.editingContent = this.ensureString(this.currentQuestion.content || this.currentQuestion.question)
          this.editPlaceholder = '请输入题目内容...'
          break
        case 'analysis':
          this.editDialogTitle = '编辑解析内容'
          this.editingContent = this.ensureString(this.currentQuestion.Analyse)
          this.editPlaceholder = '请输入解析内容...'
          break
        case 'method':
          this.editDialogTitle = '编辑方法内容'
          this.editingContent = this.ensureString(this.currentQuestion.Method)
          this.editPlaceholder = '请输入方法内容...'
          break
        case 'discuss':
          this.editDialogTitle = '编辑讨论内容'
          this.editingContent = this.ensureString(this.currentQuestion.Discuss)
          this.editPlaceholder = '请输入讨论内容...'
          break
        case 'options':
          this.editDialogTitle = '编辑选项内容'
          this.editingContent = this.currentQuestion.options ? this.currentQuestion.options.join('\n') : ''
          this.editPlaceholder = '每行一个选项...'
          break
        case 'answer':
          this.editDialogTitle = '编辑答案'
          this.editingContent = this.ensureString(this.currentQuestion.displayanswer || this.currentQuestion.answers)
          this.editPlaceholder = '在这里编辑答案...'
          break
        case 'label':
          this.editDialogTitle = '编辑标签'
          this.editingContent = this.ensureString(this.currentQuestion.label)
          this.editPlaceholder = '在这里编辑标签内容...'
          break
        default:
          this.$message.error('未知的编辑类型')
          return
      }

      // 渲染预览
      this.renderedEditMarkdown = this.renderMarkdown(this.editingContent)

      // 显示弹窗
      this.editDialogVisible = true
      this.questionEditing = true
    },

    // 切换编辑模式
    toggleEditMode() {
      if (this.questionEditing) {
        // 从编辑模式切换到预览模式
        this.renderedEditMarkdown = this.renderMarkdown(this.editingContent)
      }
      this.questionEditing = !this.questionEditing
      console.log('切换编辑模式:', this.questionEditing ? '编辑' : '预览')
    },

    // 重置编辑内容
    resetEditContent() {
      if (!this.currentQuestion) return

      switch (this.editDialogType) {
        case 'question':
          this.editingContent = this.ensureString(this.currentQuestion.content || this.currentQuestion.question)
          break
        case 'analysis':
          this.editingContent = this.ensureString(this.currentQuestion.Analyse)
          break
        case 'method':
          this.editingContent = this.ensureString(this.currentQuestion.Method)
          break
        case 'discuss':
          this.editingContent = this.ensureString(this.currentQuestion.Discuss)
          break
        case 'options':
          this.editingContent = this.currentQuestion.options ? this.currentQuestion.options.join('\n') : ''
          break
        case 'answer':
          this.editingContent = this.ensureString(this.currentQuestion.displayanswer || this.currentQuestion.answers)
          break
        case 'label':
          this.editingContent = this.ensureString(this.currentQuestion.label)
          break
      }

      this.renderedEditMarkdown = this.renderMarkdown(this.editingContent)
      this.$message.info('内容已重置')
    },

    // 自动保存编辑内容（当内容变化时调用）
    autoSaveEditContent() {
      if (!this.currentQuestion || !this.editDialogVisible) {
        return
      }

      // 检查是否是子题
      if (this.currentQuestionIndex.includes('-')) {
        // 子题：保存到原始数据结构中
        const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
        const mainQuestion = this.questions[mainIndex]
        if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
          const subQuestion = mainQuestion.children[subIndex]

          // 根据类型保存内容到原始子题数据
          switch (this.editDialogType) {
            case 'question':
              subQuestion.content = this.editingContent
              subQuestion.question = this.editingContent  // 同时保存到question字段以保持兼容性
              break
          }
        }
      }
    },

    // 保存编辑内容
    saveEditContent() {
      if (!this.currentQuestion) {
        this.$message.error('没有可保存的题目')
        return
      }

      // 检查是否是子题
      if (this.currentQuestionIndex.includes('-')) {
        // 子题：保存到原始数据结构中
        const [mainIndex, subIndex] = this.currentQuestionIndex.split('-').map(i => parseInt(i))
        const mainQuestion = this.questions[mainIndex]
        if (mainQuestion && mainQuestion.children && mainQuestion.children[subIndex]) {
          const subQuestion = mainQuestion.children[subIndex]

          // 确保子题有学科信息，如果没有则从父题目继承
          if (!subQuestion.subject_name) {
            subQuestion.subject_name = mainQuestion.subject_name || mainQuestion.subject
          }

          // 根据类型保存内容到原始子题数据
          switch (this.editDialogType) {
            case 'question':
              subQuestion.content = this.editingContent
              subQuestion.question = this.editingContent  // 同时保存到question字段以保持兼容性
              break
            case 'analysis':
              subQuestion.Analyse = this.editingContent
              break
            case 'method':
              subQuestion.Method = this.editingContent
              break
            case 'discuss':
              subQuestion.Discuss = this.editingContent
              break
            case 'options':
              // 将文本按行分割为选项数组
              subQuestion.options = this.editingContent.split('\n').filter(option => option.trim())
              break
            case 'answer':
              subQuestion.displayanswer = this.editingContent
              if (!subQuestion.answers) {
                subQuestion.answers = [this.editingContent]
              } else {
                subQuestion.answers[0] = this.editingContent
              }
              break
            case 'label':
              subQuestion.label = this.editingContent
              break
          }
        }
      } else {
        // 主题目：保存到原始数据结构中
        const index = parseInt(this.currentQuestionIndex)
        const mainQuestion = this.questions[index]
        if (mainQuestion) {
          // 根据类型保存内容到原始主题目数据
          switch (this.editDialogType) {
            case 'question':
              mainQuestion.question = this.editingContent
              break
            case 'analysis':
              mainQuestion.Analyse = this.editingContent
              break
            case 'method':
              mainQuestion.Method = this.editingContent
              break
            case 'discuss':
              mainQuestion.Discuss = this.editingContent
              break
            case 'options':
              // 将文本按行分割为选项数组
              mainQuestion.options = this.editingContent.split('\n').filter(option => option.trim())
              break
            case 'answer':
              mainQuestion.displayanswer = this.editingContent
              if (!mainQuestion.answers) {
                mainQuestion.answers = [this.editingContent]
              } else {
                mainQuestion.answers[0] = this.editingContent
              }
              break
            case 'label':
              mainQuestion.label = this.editingContent
              break
          }
        }
      }

      // 关闭弹窗
      this.editDialogVisible = false
      this.$message.success('修改已保存')
    },

    // 关闭编辑弹窗
    handleEditDialogClose() {
      this.editDialogVisible = false
      this.editDialogType = ''
      this.editDialogTitle = ''
      this.editingContent = ''
      this.editPlaceholder = ''
      this.renderedEditMarkdown = ''
    },

    // 图片上传相关方法
    async showImageUploadDialog() {
      this.imageUploadVisible = true
      this.imageUrl = ''
      this.selectedSubject = ''

      // 获取老师信息
      try {
        this.teacherInfoLoading = true
        const response = await getTeacherInfo()
        if (response && response.data) {
          this.teacherInfo = response.data
          // 获取科目列表
          if (response.data.subjectNames && Array.isArray(response.data.subjectNames)) {
            this.subjectOptions = response.data.subjectNames
          } else {
            // 使用完整的科目列表
            this.subjectOptions = [
              '语文', '数学', '英语', '物理', '化学', '生物', '信息',
              '素质教育', '科学', '通用', '历史', '政治', '地理',
              'python', '体育', '音乐', '心理', '美术', '劳技', '社会'
            ]
          }
        }
      } catch (error) {
        console.error('获取老师信息失败:', error)
        this.$message.error('获取老师信息失败')
        // 使用默认科目列表
        this.subjectOptions = [
          '语文', '数学', '英语', '物理', '化学', '生物', '信息',
          '素质教育', '科学', '通用', '历史', '政治', '地理',
          'python', '体育', '音乐', '心理', '美术', '劳技', '社会'
        ]
      } finally {
        this.teacherInfoLoading = false
      }

      // 自动设置当前题目的科目
      if (this.currentQuestion && this.currentQuestion.subject_name) {
        const currentSubject = this.currentQuestion.subject_name
        // 提取基础学科名称（去掉"高中"、"初中"等前缀）
        const baseSubject = this.extractBaseSubject(currentSubject)

        // 检查基础科目是否在可选科目列表中
        if (this.subjectOptions.includes(baseSubject)) {
          this.selectedSubject = baseSubject
          console.log('自动设置科目为:', baseSubject, '(原科目:', currentSubject, ')')
        } else {
          console.log('当前题目科目不在可选列表中:', baseSubject, '(原科目:', currentSubject, ')')
          // 如果当前科目不在列表中，可以选择第一个科目或保持为空
          if (this.subjectOptions.length > 0) {
            this.selectedSubject = this.subjectOptions[0]
            console.log('使用默认科目:', this.subjectOptions[0])
          }
        }
      } else {
        console.log('没有当前题目或科目信息')
        // 如果没有当前题目，可以选择第一个科目
        if (this.subjectOptions.length > 0) {
          this.selectedSubject = this.subjectOptions[0]
          console.log('使用默认科目:', this.subjectOptions[0])
        }
      }
    },

    // 提取基础学科名称（去掉"高中"、"初中"等前缀）
    extractBaseSubject(subjectName) {
      if (!subjectName) return ''

      // 定义需要去掉的前缀
      const prefixes = ['高中', '初中']

      // 遍历前缀，找到匹配的就去掉
      for (const prefix of prefixes) {
        if (subjectName.startsWith(prefix)) {
          return subjectName.substring(prefix.length)
        }
      }

      // 如果没有匹配的前缀，直接返回原名称
      return subjectName
    },

    handleFileChange(file, fileList) {
      // 文件选择时的处理
      if (file && file.raw) {
        this.selectedFile = file.raw
        this.imageFile = file.raw
      }
    },

    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      if (!this.selectedSubject) {
        this.$message.error('请先选择学科!')
        return false
      }

      // 保存选中的文件
      this.selectedFile = file
      this.imageFile = file

      // 不在这里自动上传，等用户点击"插入图片"时再上传
      return false // 阻止自动上传
    },

    async uploadImageFile(file) {
      try {
        // 生成带时间戳的文件名
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        const newFileName = `${fileNameWithoutExt}_${timestamp}.${fileExtension}`

        // 创建新的文件对象，使用带时间戳的文件名
        const fileWithTimestamp = new File([file], newFileName, {
          type: file.type,
          lastModified: file.lastModified
        })

        const formData = new FormData()
        formData.append('file', fileWithTimestamp)
        formData.append('subjectName', this.selectedSubject)

        const response = await uploadImage(formData)
        if (response && response.code === 200) {
          this.imageUrl = response.data
          this.$message.success('图片上传成功!')
        } else {
          this.$message.error(response.msg || '图片上传失败!')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败!')
      }
    },

    handleImageUploadSuccess(response, file, fileList) {
      // 这个方法不会被调用，因为我们阻止了自动上传
    },

    handleImageUploadError(error, file, fileList) {
      this.$message.error('图片上传失败!')
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    handleImageError(event) {
      console.error('图片加载失败:', event)
      this.$message.error('图片加载失败，请检查链接是否正确')
    },

    clearImagePreview() {
      this.imageUrl = ''
      this.selectedFile = null
      this.imageFile = null
      this.$message.success('图片预览已清除')
    },

    copyImageUrl() {
      if (this.imageUrl) {
        navigator.clipboard.writeText(this.imageUrl).then(() => {
          this.$message.success('图片链接已复制到剪贴板!')
        }).catch(() => {
          // 降级处理
          const textArea = document.createElement('textarea')
          textArea.value = this.imageUrl
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          this.$message.success('图片链接已复制到剪贴板!')
        })
      }
    },

    async insertImageToEditor() {
      if (!this.selectedFile || !this.selectedSubject) {
        this.$message.warning('请先选择学科和图片文件!')
        return
      }

      // 如果没有imageUrl，先上传图片
      if (!this.imageUrl) {
        try {
          this.$message.info('正在上传图片，请稍候...')
          await this.uploadImageFile(this.selectedFile)

          // 上传失败时直接返回
          if (!this.imageUrl) {
            return
          }
        } catch (error) {
          this.$message.error('图片上传失败!')
          return
        }
      }

      // 插入图片到mavon-editor
      // const imageMarkdown = `![图片](${this.imageUrl})`
      // 文件名已包含时间戳，直接使用
      const imageHtml = `<img src="${this.imageUrl}">`

      // 根据当前活跃的弹框选择编辑器实例
      let editor = null
      let contentProperty = ''

      if (this.editDialogVisible) {
        // 题目编辑弹框
        editor = this.$refs.editEditor
        contentProperty = 'editingContent'
      } else if (this.reviewDialogVisible) {
        // 校对编辑弹框
        editor = this.$refs.mdEditor
        contentProperty = 'editingMarkdown'
      }

      try {
        // 直接添加到内容中，避免insertText方法的问题
        if (contentProperty === 'editingContent') {
          this.editingContent += imageHtml
        } else if (contentProperty === 'editingMarkdown') {
          this.editingMarkdown += imageHtml
        }
        this.$message.success('图片已添加到内容中!')
      } catch (error) {
        console.error('插入图片失败:', error)
        this.$message.error('插入图片失败!')
      }

      // 插入成功后关闭弹框
      this.handleImageUploadClose()
    },

    // 插入快捷文本到校对编辑器
    insertQuickText(data) {
      try {
        const symbol = typeof data === 'string' ? data : data.symbol

        // 获取mavon-editor实例
        const editor = this.$refs.mdEditor
        if (editor) {
          // 使用mavon-editor的insert方法在光标位置插入
          this.insertTextAtCursor(editor, symbol)
          this.$message.success(`已插入符号: ${symbol}`)
        } else {
          // 降级处理：如果无法获取编辑器实例，则添加到末尾
          this.editingMarkdown += symbol
          this.$message.success(`已插入符号: ${symbol}`)
        }
      } catch (error) {
        console.error('插入快捷文本失败:', error)
        this.$message.error('插入快捷文本失败!')
      }
    },

    // 插入快捷文本到题目编辑器
    insertQuickTextToEditor(data) {
      try {
        const symbol = typeof data === 'string' ? data : data.symbol

        // 获取mavon-editor实例
        const editor = this.$refs.editEditor
        if (editor) {
          // 使用mavon-editor的insert方法在光标位置插入
          this.insertTextAtCursor(editor, symbol)
          this.$message.success(`已插入符号: ${symbol}`)
        } else {
          // 降级处理：如果无法获取编辑器实例，则添加到末尾
          this.editingContent += symbol
          this.$message.success(`已插入符号: ${symbol}`)
        }
      } catch (error) {
        console.error('插入快捷文本失败:', error)
        this.$message.error('插入快捷文本失败!')
      }
    },

    // 在光标位置插入文本的通用方法
    insertTextAtCursor(editor, text) {
      try {
        // 方法1：直接操作DOM中的textarea元素（最可靠的方法）
        const editorElement = editor.$el
        if (editorElement) {
          const textarea = editorElement.querySelector('textarea')
          if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const content = textarea.value || ''

            // 在光标位置插入文本
            const newContent = content.substring(0, start) + text + content.substring(end)
            textarea.value = newContent

            // 触发input事件以更新v-model
            const inputEvent = new Event('input', { bubbles: true })
            textarea.dispatchEvent(inputEvent)

            // 设置新的光标位置
            const newCursorPos = start + text.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
            textarea.focus()
            return
          }
        }

        // 方法2：通过mavon-editor的内部结构操作
        if (editor.$refs.textarea && editor.$refs.textarea.$refs.textarea) {
          const textareaElement = editor.$refs.textarea.$refs.textarea
          const start = textareaElement.selectionStart
          const end = textareaElement.selectionEnd
          const content = textareaElement.value || ''

          // 在光标位置插入文本
          const newContent = content.substring(0, start) + text + content.substring(end)
          textareaElement.value = newContent

          // 触发input事件
          const inputEvent = new Event('input', { bubbles: true })
          textareaElement.dispatchEvent(inputEvent)

          // 设置新的光标位置
          const newCursorPos = start + text.length
          textareaElement.setSelectionRange(newCursorPos, newCursorPos)
          textareaElement.focus()
          return
        }

        // 方法3：使用mavon-editor的工具栏方法（需要正确的参数）
        if (editor.$refs.toolbar_left && editor.$refs.toolbar_left.insertText) {
          try {
            // 使用正确的参数格式调用insertText
            editor.$refs.toolbar_left.insertText(editor, text, '')
            return
          } catch (toolbarError) {
            console.warn('工具栏方法失败:', toolbarError)
          }
        }

        // 方法4：直接更新v-model并触发更新
        if (editor.value !== undefined) {
          const currentContent = editor.value || ''
          const start = 0 // 如果无法获取光标位置，则插入到开头
          const newContent = currentContent.substring(0, start) + text + currentContent.substring(start)
          editor.value = newContent

          // 触发更新事件
          editor.$emit('input', newContent)
          editor.$emit('change', newContent)
          return
        }

        // 最终降级处理：添加到末尾
        if (editor.value !== undefined) {
          editor.value += text
        }

      } catch (error) {
        console.error('insertTextAtCursor方法执行失败:', error)
        // 最终降级处理
        if (editor.value !== undefined) {
          editor.value += text
        }
      }
    },

    handleImageUploadClose() {
      this.imageUploadVisible = false
      // 保留图片URL和相关数据，不清除
      // this.imageUrl = ''
      // this.selectedSubject = ''
      // this.selectedFile = null
      // this.imageFile = null
    }

  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.upload-type-card,
.upload-card,
.task-monitor-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 18px;
  color: #409EFF;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-subtitle {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

/* 任务进度样式 */
.task-progress-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-details {
  margin: auto;
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.success-count {
  color: #67C23A;
  font-weight: 500;
}

.failure-count {
  color: #F56C6C;
  font-weight: 500;
}

.failure-reason {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #FEF0F0;
  border: 1px solid #FDE2E2;
  border-radius: 4px;
  font-size: 12px;
}

.failure-reason-text {
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

.failure-reason-text i {
  font-size: 14px;
}

.upload-type-selector {
  text-align: center;
  padding: 20px 0;
}

.upload-content {
  padding: 20px 0;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
}

.form-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.form-item {
  flex: 1;
  min-width: 0;
}

.full-width {
  width: 100%;
}

.chapter-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.series-path-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.series-path-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

/* 系列设置行样式 */
.series-settings-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
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

/* 全局设置区域样式 */
.global-settings-section {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.settings-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.settings-header h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.settings-header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.settings-content {
  padding:0px 20px;
}

/* 题目编辑器样式 */
.question-editor-container {
  display: flex;
  gap: 20px;
  height: 65vh;
  min-height: 500px;

  img {
    max-width: 800px;
  }
}

.question-list-section {
  width: 35%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.question-edit-section {
  width: 65%;
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
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
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

.section-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* 竖向题目列表样式 */
.question-list-vertical {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.question-item {
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
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
  padding: 15px;
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
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.field-content {
  margin-bottom: 15px;
}

.content-preview {
  padding: 15px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  min-height: 60px;
  line-height: 1.6;

}

.options-preview {
  padding: 15px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.option-item {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  min-width: 20px;
}

.option-content {
  flex: 1;
  line-height: 1.6;
}

.chapter-select-button {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

.selected-path-display {
  margin-top: 8px;
}

.selected-path-display .el-tag {
  max-width: 100%;
  word-break: break-all;
}

.upload-dragger {
  width: 33%;
}

.upload-actions {
  text-align: center;
  margin-top: 30px;
}

/* 任务列表样式 */
.task-list-card {
  margin-top: 20px;
}

.task-list-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-list-card .header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.resource-link {
  color: #409EFF;
  text-decoration: none;
}

.resource-link:hover {
  text-decoration: underline;
}

.pdf-upload-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.pdf-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
}

.task-monitor-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.task-status {
  flex: 1;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.chapter-selection {
  display: flex;
  gap: 30px;
  height: 400px;
}

.chapter-tree {
  flex: 1;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
}

.selected-chapter {
  flex: 1;
  padding: 20px;
  background-color: #F5F7FA;
  border-radius: 4px;
}

.selected-chapter h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.chapter-path {
  margin: 0;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.selection-tip {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409EFF;
  display: flex;
  align-items: center;
  gap: 6px;
}

.selection-tip i {
  font-size: 14px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.selectable-node {
  color: #409EFF;
  font-weight: 600;
  cursor: pointer;
  background-color: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
}

.leaf-node {
  color: #909399;
  cursor: pointer;
}

.parent-node {
  color: #909399;
  cursor: pointer;
}

.selectable-indicator {
  margin-left: 5px;
  color: #409EFF;
  font-weight: bold;
}

.leaf-indicator {
  margin-left: 5px;
  color: #909399;
}

.parent-indicator {
  margin-left: 5px;
  color: #909399;
}

/* 系列路径选择样式 */
.series-path-selection {
  display: flex;
  gap: 30px;
  height: 400px;
}

.series-path-tree {
  flex: 1;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
}

.selected-series-path {
  flex: 1;
  padding: 20px;
  background-color: #F5F7FA;
  border-radius: 4px;
}

.selected-series-path h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.series-path-text {
  margin: 0;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.json-data-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-preview {
  font-size: 12px;
  color: #606266;
  font-style: italic;
}

.selected-info {
  margin: 10px 0;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
}

.selected-info p {
  margin: 5px 0;
  color: #409EFF;
}

/* 知识点选择弹窗样式 */
.knowledge-points-selection {
  max-height: 600px;
  overflow-y: auto;
}

.selection-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.selection-header h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.selection-header .selection-tip {
  margin: 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-item {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  padding: 20px;
  background-color: #FAFAFA;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-header h5 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.confidence-info {
  display: flex;
  gap: 5px;
}

.question-content {
  margin-bottom: 20px;
}

.question-text {
  margin: 0;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

.knowledge-points-selection h6 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.available-points {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge-tag {
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.knowledge-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.confidence-score {
  font-size: 11px;
  opacity: 0.8;
}

.custom-selection {
  margin-top: 15px;
}

.custom-selection h6 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 13px;
}

/* 校对编辑弹窗样式 - 复用学案样式 */
.review-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.header-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.header-tip {
  margin: 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.review-content {
  flex: 1;
  overflow-y: auto;
}

.edit-mode {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* mavon-editor 自定义样式 */
.edit-mode .v-note-wrapper {
  height: 100% !important;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.edit-mode .v-note-wrapper .v-note-op {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.edit-mode .v-note-wrapper .v-note-show {
  background: #fff;
}

.edit-mode .v-note-wrapper .v-note-edit {
  background: #fff;
  font-family: 'Courier New', Consolas, Monaco, monospace;
}

.preview-mode {
  height: 100%;
}

/* 学案样式markdown预览 */
.markdown-preview {
  line-height: 1.6;
  color: #303133;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.markdown-preview h1 {
  font-size: 24px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.markdown-preview h2 {
  font-size: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 6px;
}

.markdown-preview h3 {
  font-size: 18px;
}

.markdown-preview p {
  margin-bottom: 12px;
}

.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  border: 3px solid #409eff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: #fff;
}

.markdown-preview th,
.markdown-preview td {
  border: 2px solid #409eff !important;
  padding: 12px 16px;
  text-align: left;
  vertical-align: top;
  position: relative;
}

.markdown-preview th {
  background: #409eff !important;
  font-weight: 600;
  color: #fff !important;
  border-bottom: 2px solid #409eff !important;
}

.markdown-preview td {
  background: #fff !important;
  border: 2px solid #409eff !important;
}

.markdown-preview tr:hover td {
  background: #f0f9ff !important;
}

.markdown-preview table,
.markdown-preview table * {
  border-color: #409eff !important;
}

.markdown-preview table {
  border-spacing: 0 !important;
  border-collapse: collapse !important;
}

.markdown-preview table th,
.markdown-preview table td {
  border: 2px solid #409eff !important;
  border-collapse: collapse !important;
}

.markdown-preview table[border="1"] {
  border: 3px solid #409eff !important;
}

.markdown-preview table[border="1"] th,
.markdown-preview table[border="1"] td {
  border: 2px solid #409eff !important;
}

.markdown-preview .math {
  font-family: 'Times New Roman', serif;
  font-size: 1.1em;
  line-height: 1.4;
}

.markdown-preview .math-inline {
  display: inline;
  padding: 0 4px;
}

.markdown-preview .math-display {
  display: block;
  text-align: center;
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.markdown-preview pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 15px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.markdown-preview code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.markdown-preview .code-block {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 15px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.45;
}

.markdown-preview .code-block code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-family: inherit;
  font-size: inherit;
}

.markdown-preview ul,
.markdown-preview ol {
  margin: 10px 0;
  padding-left: 20px;
}

.markdown-preview li {
  margin: 5px 0;
  line-height: 1.6;
}

.markdown-preview hr {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 20px 0;
}

.markdown-preview blockquote {
  border-left: 4px solid #409eff;
  padding-left: 15px;
  margin: 15px 0;
  color: #606266;
  background: #f0f9ff;
  padding: 10px 15px;
  border-radius: 4px;
}

/* 滚动条样式 */
.review-content::-webkit-scrollbar {
  width: 6px;
}

.review-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.review-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.debug-info {
  font-size: 10px;
  color: #999;
  margin-left: 10px;
}

/* 题目编辑器样式 */
.question-editor-container {
  display: flex;
  gap: 20px;
  height: 65vh;
}

.question-list-section {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  padding-right: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.section-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.question-tabs {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.question-preview {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 10px;
}

.question-preview h5 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.question-edit-section {
  flex: 1;
  overflow-y: auto;
  padding-left: 20px;
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
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.question-basic-info,
.knowledge-points-section,
.question-content-edit,
.options-edit,
.answer-edit,
.analysis-edit {
  margin-bottom: 20px;
}

.option-item {
  margin-bottom: 10px;
}

.edit-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.preview-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  background: #fff;
  min-height: 100px;
}

/* 题目编辑器滚动条 */
.question-list-section::-webkit-scrollbar,
.question-edit-section::-webkit-scrollbar {
  width: 6px;
}

.question-list-section::-webkit-scrollbar-thumb,
.question-edit-section::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.question-list-section::-webkit-scrollbar-track,
.question-edit-section::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 题目字段样式 */
.question-content-section,
.analysis-content-section,
.method-content-section,
.discuss-content-section,
.knowledge-points-section,
.options-section,
.answer-section {
  margin-bottom: 25px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
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

/* 编辑弹窗样式 */
.edit-dialog-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.header-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.header-tip {
  margin: 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-content {
  flex: 1;
  overflow-y: auto;
}

.edit-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.preview-mode {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  background: #fff;
  min-height: 400px;
}

/* 编辑弹窗滚动条 */
.edit-content::-webkit-scrollbar {
  width: 6px;
}

.edit-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.edit-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 数学公式测试区域样式 */
.math-test-card {
  margin-bottom: 20px;
}

.math-test-content {
  padding: 20px 0;
}

.test-formulas h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
}

.formula-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.formula-item {
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.formula-item h5 {
  margin: 0 0 10px 0;
  color: #409EFF;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #409EFF;
  padding-bottom: 5px;
}

.formula-item p {
  margin: 8px 0;
  line-height: 1.6;
  color: #606266;
}

/* KaTeX数学公式样式 */
.markdown-preview .katex {
  font-size: 1.1em;
  line-height: 1.2;
}

.markdown-preview .katex-display {
  margin: 1em 0;
  text-align: center;
  padding: 0.5em 0;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.markdown-preview .katex-display .katex {
  font-size: 1.2em;
}

.markdown-preview .math-error {
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

.markdown-preview .math-error:hover {
  background: #fde2e2;
}

/* 行内数学公式样式 */
.markdown-preview .katex-inline {
  display: inline;
  margin: 0 2px;
}

/* 块级数学公式样式 */
.markdown-preview .katex-block {
  display: block;
  margin: 15px 0;
  text-align: center;
}

/* 数学公式容器样式 */
.markdown-preview .math-container {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.markdown-preview .math-container .katex-display {
  margin: 0;
  background: transparent;
  border: none;
  padding: 0;
}

/* 数学公式在表格中的样式 */
.markdown-preview table .katex {
  font-size: 0.9em;
}

.markdown-preview table .katex-display {
  margin: 0.5em 0;
  padding: 0.3em 0;
}

/* 数学公式在代码块中的样式 */
.markdown-preview pre .katex {
  font-size: 0.8em;
}

/* 数学公式在引用块中的样式 */
.markdown-preview blockquote .katex {
  font-size: 1em;
}

.markdown-preview blockquote .katex-display {
  margin: 0.8em 0;
  padding: 0.4em 0;
}

/* 图片上传弹框样式 */
.image-upload-container {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 25px;
}

.upload-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.auto-selected-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #67c23a;
  border-radius: 4px;
  color: #67c23a;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.auto-selected-tip i {
  margin-right: 6px;
  font-size: 16px;
}

.original-subject {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

.image-uploader {
  margin-bottom: 10px;
}

.upload-tip {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.file-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
}

.file-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #409eff;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: contain;
  background-color: #fafafa;
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

.parent-question-info {
  margin-bottom: 8px;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #e6a23c;
}

.question-text {
  margin-top: 8px;
}

.question-item.main-question .question-preview h5 {
  color: #409eff;
  font-weight: 600;
}

.question-item.sub-question .question-preview h5 {
  color: #e6a23c;
  font-weight: 500;
}

/* 父题目信息样式 */
.parent-question-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  border-left: 4px solid #e6a23c;
}

.parent-question-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  color: #e6a23c;
}

.parent-question-header i {
  margin-right: 6px;
  font-size: 14px;
}

.parent-question-content {
  background: #ffffff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.current-question-content {
  position: relative;
}

.sub-question-label {
  margin-bottom: 10px;
}

.sub-question-label .el-tag {
  font-weight: 500;
}

.image-link-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 15px;
}

.image-link-section h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.image-link-input {
  margin-top: 5px;
}

/* 自定义工具栏样式 */
.custom-toolbar {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  flex-wrap: wrap;
}

.toolbar-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
  flex: 1;
}

.image-preview-section {
  width: 100%;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.image-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.toolbar-image-preview {
  max-width: 120px;
  max-height: 80px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  object-fit: contain;
  background-color: #fafafa;
}

.image-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}


/* 图片预览样式 */
.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-top: 10px;
}

/* 题目组样式 */
.question-group {
  margin-bottom: 15px;
}

.question-group .question-item.main-question {
  border-left: 4px solid #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.question-group .question-item.sub-question {
  border-left: 4px solid #e6a23c;
  background: linear-gradient(135deg, #fdf6ec 0%, #ffffff 100%);
  margin-left: 20px;
  margin-top: 8px;
  position: relative;
}

.question-group .question-item.sub-question::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  width: 15px;
  height: 1px;
  background: #e6a23c;
  transform: translateY(-50%);
}

.question-group .question-item.sub-question::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  width: 1px;
  height: 50%;
  background: #e6a23c;
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
}
</style>
