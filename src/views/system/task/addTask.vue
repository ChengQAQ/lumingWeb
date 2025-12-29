<template>
  <div class="app-container task-container">
    <!-- 页面标题和说明 -->
    <div class="page-header">
      <h2>创建新任务</h2>
      <p class="page-description">请填写任务基本信息并选择相应的资源</p>
    </div>

    <div class="task-builder">
      <!-- 左侧：基本信息区域 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>基本信息</h3>
        </div>
        <div class="info-form">
          <el-form :model="form" :rules="rules" ref="taskForm" label-width="100px">
            <el-form-item label="学生" prop="studentId">
              <el-input
                :value="selectedStudentLabels.join(',')"
                placeholder="请选择学生"
                readonly
                @focus="openStudentDialog"
                @click="openStudentDialog"
              >
                <el-button slot="append" icon="el-icon-search" @click="openStudentDialog"></el-button>
              </el-input>
              <input type="hidden" v-model="form.studentId" />
            </el-form-item>

            <el-form-item label="任务名称" prop="taskName">
              <el-input
                v-model="form.taskName"
                placeholder="请输入任务名称"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="学科代码" prop="subjectCode">
              <el-select
                v-model="form.subjectCode"
                placeholder="请选择学科代码"
                style="width: 100%"
                @change="onSubjectCodeChange"
              >
                <el-option
                  v-for="item in subjectOptions"
                  :key="item.subjectCode"
                  :label="item.subjectName"
                  :value="item.subjectCode"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="任务类型" prop="taskType">
              <el-select
                v-model="form.taskType"
                placeholder="请选择任务类型"
                style="width: 100%"
                @change="onTaskTypeChange"
              >
                <el-option label="试卷" value="试卷" />
                <el-option label="作业" value="作业" />
                <el-option label="学案" value="学案" />
                <el-option label="教学视频" value="教学视频" />
                <el-option label="自定义作业" value="自定义作业" />
                <el-option label="自定义组卷" value="自定义组卷" />
                <el-option label="新作业" value="新作业" />
                <el-option label="新组卷" value="新组卷" />
              </el-select>
            </el-form-item>

            <el-form-item label="关联章节" prop="knowledgeCode">
              <el-cascader
                v-model="form.knowledgeCode"
                :options="chapterOptions"
                :props="chapterProps"
                placeholder="请选择关联章节（可选）"
                clearable
                @change="handleFormChapterChange"
                :show-all-levels="true"
                style="width: 100%"
              ></el-cascader>
              <div style="font-size: 12px; color: #909399; margin-top: 4px;">
                💡 提示：可选择关联章节，帮助更好地组织任务内容
              </div>
            </el-form-item>

            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择开始时间"
                style="width: 100%"
                @change="handleStartTimeChange">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择结束时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="任务描述" prop="taskDesc">
              <el-input
                v-model="form.taskDesc"
                type="textarea"
                placeholder="请输入任务描述"
                style="height: 70px;"
                :rows="4" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 右侧：任务资源选择区域 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>任务资源</h3>
        </div>

        <!-- 试卷/作业/新作业/新组卷资源选择 -->
        <div v-if="isPaperOrHomeworkType || isNewPaperHomeworkType" class="resource-section">
          <div class="section-title">选择{{ currentPaperHomeworkConfig.label }} ({{ currentPaperHomeworkConfig.total }}个可用)</div>
          <div class="section-tip">请点击选择要分配给学生的{{ currentPaperHomeworkConfig.label }}</div>

          <!-- 搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="currentPaperHomeworkConfig.queryParams" :inline="true" size="small">
              <el-form-item :label="currentPaperHomeworkConfig.searchLabel">
                <el-input
                  v-model="currentPaperHomeworkConfig.queryParams.customPaperName"
                  :placeholder="currentPaperHomeworkConfig.searchPlaceholder"
                  clearable
                  @keyup.enter.native="handlePaperHomeworkQuery(currentPaperHomeworkConfig.taskType)"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handlePaperHomeworkQuery(currentPaperHomeworkConfig.taskType)">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetPaperHomeworkQuery(currentPaperHomeworkConfig.taskType)">重置</el-button>
              </el-form-item>
              <!-- 已选资源显示 -->
              <el-form-item v-if="getSelectedResources().length > 0" class="selected-resources-inline">
                <div class="selected-resources-inline-container">
                  <span class="selected-label">已选：</span>
                  <div class="selected-cards-inline">
                    <div
                      v-for="resource in getSelectedResources()"
                      :key="resource.id"
                      class="selected-card-inline"
                      :data-type="resource.type"
                    >
                      <div class="selected-card-icon-inline">
                        <i :class="currentPaperHomeworkConfig.iconClass"></i>
                      </div>
                      <div class="selected-card-content-inline">
                        <div class="selected-card-title-inline">{{ resource.name }}</div>
                        <div class="selected-card-type-inline">{{ resource.type }}</div>
                      </div>
                      <div class="selected-card-actions-inline">
                        <el-button
                          type="primary"
                          size="mini"
                          icon="el-icon-view"
                          @click="previewResource(resource)"
                          title="预览"
                        ></el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="currentPaperHomeworkConfig.loading" class="resource-cards">
              <div
                v-for="item in currentPaperHomeworkConfig.list"
                :key="item[currentPaperHomeworkConfig.idField]"
                class="resource-card"
                :class="{ 'selected': currentPaperHomeworkConfig.currentRow && currentPaperHomeworkConfig.currentRow[currentPaperHomeworkConfig.idField] === item[currentPaperHomeworkConfig.idField] }"
                @click="selectPaperHomework(currentPaperHomeworkConfig.taskType, item)"
              >
                <div class="card-icon" :class="getResourceIconClass(currentPaperHomeworkConfig.taskType)">
                  <i :class="currentPaperHomeworkConfig.iconClass"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ item[currentPaperHomeworkConfig.nameField] }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(item.subject || item.subjectCode) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ getCreatorName(item.creator) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(item.createTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewPaperHomeworkFromTable(currentPaperHomeworkConfig.taskType, item)"
                    :title="'预览' + currentPaperHomeworkConfig.label"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handlePaperHomeworkSizeChange(currentPaperHomeworkConfig.taskType, $event)"
                @current-change="handlePaperHomeworkCurrentChange(currentPaperHomeworkConfig.taskType, $event)"
                :current-page="currentPaperHomeworkConfig.queryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="currentPaperHomeworkConfig.queryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="currentPaperHomeworkConfig.total"
              />
            </div>
          </div>
        </div>

        <!-- 知识类资源选择（学案/教学视频/自定义作业/自定义组卷） -->
        <div v-if="isKnowledgeResourceType" class="resource-section">
          <div class="section-title">
            <span>选择{{ currentKnowledgeConfig.label }} ({{ currentKnowledgeConfig.total }}个可用)</span>
            <div class="source-switch">
              <el-select 
                :value="currentKnowledgeConfig.type" 
                placeholder="选择类型" 
                style="width: 120px" 
                  clearable
                @change="handleKnowledgeResourceTypeSelectChange($event, currentKnowledgeConfig.taskType)"
              >
                <el-option label="全部" value=""></el-option>
                <el-option label="个人" value="个人"></el-option>
                <el-option label="系统" value="系统"></el-option>
                <el-option label="校本" value="校本"></el-option>
              </el-select>
                      </div>
                      </div>
          <div class="section-tip">请选择要分配给学生的{{ currentKnowledgeConfig.label }}</div>

          <!-- 搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="currentKnowledgeConfig.queryParams" :inline="true" size="small">
              <el-form-item :label="currentKnowledgeConfig.searchLabel">
                <el-input
                  v-model="currentKnowledgeConfig.queryParams[currentKnowledgeConfig.searchField]"
                  :placeholder="currentKnowledgeConfig.searchPlaceholder"
                  clearable
                  @keyup.enter.native="handleKnowledgeResourceQuery(currentKnowledgeConfig.taskType)"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleKnowledgeResourceQuery(currentKnowledgeConfig.taskType)">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetKnowledgeResourceQuery(currentKnowledgeConfig.taskType)">重置</el-button>
              </el-form-item>
              <!-- 已选资源显示 -->
              <el-form-item v-if="getSelectedResources().length > 0" class="selected-resources-inline">
                <div class="selected-resources-inline-container">
                  <span class="selected-label">已选：</span>
                  <div class="selected-cards-inline">
                    <div
                      v-for="resource in getSelectedResources()"
                      :key="resource.id"
                      class="selected-card-inline"
                      :data-type="resource.type"
                    >
                      <div class="selected-card-icon-inline">
                        <i :class="currentKnowledgeConfig.iconClass"></i>
                      </div>
                      <div class="selected-card-content-inline">
                        <div class="selected-card-title-inline">{{ resource.name }}</div>
                        <div class="selected-card-type-inline">{{ resource.type }}</div>
                      </div>
                      <div class="selected-card-actions-inline">
                        <el-button
                          type="primary"
                          size="mini"
                          icon="el-icon-view"
                          @click="previewResource(resource)"
                          title="预览"
                        ></el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="currentKnowledgeConfig.loading" class="resource-cards">
              <div
                v-for="item in currentKnowledgeConfig.list"
                :key="item[currentKnowledgeConfig.idField]"
                class="resource-card"
                :class="{ 'selected': currentKnowledgeConfig.currentRow && currentKnowledgeConfig.currentRow[currentKnowledgeConfig.idField] === item[currentKnowledgeConfig.idField] }"
                @click="selectKnowledgeResource(currentKnowledgeConfig.taskType, item)"
              >
                <div class="card-icon" :class="getResourceIconClass(currentKnowledgeConfig.taskType)">
                  <i :class="currentKnowledgeConfig.iconClass"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ formatKnowledgeResourceLabel(item, currentKnowledgeConfig) }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(item.subjectName) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ getCreatorName(item.uploadUserId) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(item.uploadTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewKnowledgeResourceFromTable(currentKnowledgeConfig.taskType, item)"
                    :title="'预览' + currentKnowledgeConfig.label"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleKnowledgeResourceSizeChange(currentKnowledgeConfig.taskType, $event)"
                @current-change="handleKnowledgeResourceCurrentChange(currentKnowledgeConfig.taskType, $event)"
                :current-page="currentKnowledgeConfig.queryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="currentKnowledgeConfig.queryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="currentKnowledgeConfig.total"
              />
            </div>
          </div>
        </div>

        <!-- 未选择任务类型时的提示 -->
        <div v-if="!form.taskType" class="resource-section">
          <div class="no-task-type">
            <el-empty description="请先在左侧选择任务类型"></el-empty>
          </div>
        </div>

      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-actions">
      <el-button @click="goBack" :disabled="loading">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">创建任务</el-button>
    </div>

    <!-- 学生选择弹窗 -->
    <el-dialog title="选择学生" :visible.sync="studentDialogVisible" width="500px">
      <!-- 能力等级筛选 -->
      <div class="ability-filter-section">
        <div class="filter-label">
          <i class="el-icon-medal"></i>
          <span>新增评估能力</span>
        </div>
        <el-select
          v-model="abilityLevelFilter"
          placeholder="请选择能力等级筛选学生"
          style="width: 100%"
          @change="handleAbilityLevelChange"
        >
          <el-option label="不限" value="不限" />
          <el-option label="四级" value="四级" />
          <el-option label="三级" value="三级" />
          <el-option label="二级" value="二级" />
          <el-option label="一级" value="一级" />
          <el-option label="特级宇航长" value="特级宇航长" />
        </el-select>
        <div class="filter-tip">
          <i class="el-icon-info"></i>
          <span v-if="abilityLevelFilter && abilityLevelFilter !== '不限'">
            已筛选 {{ abilityLevelFilter }} 能力等级的学生
          </span>
          <span v-else>显示所有学生（不限能力等级）</span>
        </div>
      </div>

      <!-- 学生树形选择 -->
      <div class="student-tree-section">
        <el-tree
          v-if="studentTreeData && studentTreeData.length"
          ref="studentTree"
          :data="studentTreeData"
          show-checkbox
          node-key="id"
          :props="{ label: 'label', children: 'children' }"
          @check-change="handleStudentCheckChange"
          :default-checked-keys="selectedStudentIds"
        />
        <div v-else class="empty-students">
          <el-empty
            :description="abilityLevelFilter && abilityLevelFilter !== '不限' ? `暂无${abilityLevelFilter}能力等级的学生` : '数据未加载或为空'"
            :image-size="80"
          />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStudentSelect">确定</el-button>
      </div>
    </el-dialog>

    <!-- 资源预览弹窗 -->
    <el-dialog
      :title="`${previewResourceData.type}预览 - ${previewResourceData.name}`"
      :visible.sync="previewDialogVisible"
      width="800px"
      append-to-body
      @close="closePreview"
    >
      <div v-if="previewQuestions.length > 0" class="preview-content">
        <div class="preview-header">
          <div class="resource-info">
            <span class="resource-name">{{ previewResourceData.name }}</span>
            <span class="resource-type">{{ previewResourceData.type }}</span>
          </div>
          <div class="question-count">共 {{ previewQuestions.length }} 个题目</div>
        </div>

        <div class="question-list">
          <div
            v-for="(question, index) in previewQuestions"
            :key="question.SID || index"
            class="question-card"
          >
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <span class="question-type">{{ question.CateName || question.cate || question.type }}</span>
              <span class="question-difficulty">难度: {{ question.Degree || question.difficulty || question.degree }}</span>
            </div>
            <div class="question-content">
              <div class="preview-question-text">
                <span v-if="question.Label || question.label" class="question-label">{{ question.Label || question.label }}</span>
                <span v-html="processQuestionContent(question.question || question.Content || question.content)"></span>
              </div>
              <div class="question-options" v-if="question.Options && question.Options.length > 0">
                <div
                  v-for="(option, optIndex) in question.Options"
                  :key="optIndex"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  <span class="option-content" v-html="processOptionContent(option, optIndex)"></span>
                </div>
              </div>
              <div class="question-options" v-else-if="question.options || question.Options">
                <div
                  v-for="(option, optIndex) in parseOptions(question.options || question.Options)"
                  :key="optIndex"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  <span class="option-content" v-html="processOptionContent(option, optIndex)"></span>
                </div>
              </div>
              <div class="question-info">
                <span class="info-item">知识点: {{ formatKnowledgePoints(question.Points || question.points) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="previewLoading" class="preview-loading">
        <i class="el-icon-loading" style="font-size: 24px; margin-bottom: 10px;"></i>
        <p>正在加载题目内容...</p>
      </div>
      <div v-else class="preview-no-data">
        <el-empty description="暂无题目内容"></el-empty>
      </div>
    </el-dialog>


    <!-- 文件预览组件 -->
    <FilePreview
      :visible="previewVisible"
      :file="currentPreviewFile"
      @close="handlePreviewClose"
    />
  </div>
</template>

<script>
import { addTask, sysDeptTree, sysUserList } from "@/api/system/task"
import { listSubject } from "@/api/system/subject"
import { getChapterMap } from "@/api/system/chapterTitle"
import { listPaper, getPaper, getQuestionsBySids } from "@/api/system/paper"
import { listTable, getTable } from "@/api/system/table"
import { listKnowledge, getKnowledge } from "@/api/system/knowledge"
import { listPaperAssignment, getPaperAssignment } from "@/api/system/paperAssignment"
import { mapGetters } from 'vuex'
import latexRenderer from "@/utils/latexRenderer"
import request from "@/utils/request"
import { getUserInfo, getPreviewSubjectName } from "@/api/system/teacher"
import { getSubjectCodeFromName } from "@/utils/subjectMapping"
import FilePreview from '@/components/FilePreview'

export default {
  name: "AddTask",
  components: {
    FilePreview
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 表单参数
      form: {
        taskId: null,
        studentId: null,
        subjectCode: null,
        knowledgeCode: [],
        taskName: null,
        taskUrl: null, // 试卷单选，初始为null
        startTime: (() => {
          // 设置默认开始时间为今天
          return new Date().toISOString().split('T')[0]
        })(),
        endTime: (() => {
          // 设置默认结束时间为当前时间后一天
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return tomorrow.toISOString().split('T')[0]
        })(),
        currentProgress: null,
        goal: null,
        taskDesc: null,
        taskType: '试卷', // 设置默认任务类型为试卷
        teacherId: null,
        userFname: null
      },
      // 表单校验
      rules: {
        studentId: [
          { required: true, message: "学生ID不能为空", trigger: "blur" }
        ],
        subjectCode: [
          { required: true, message: "学科代码不能为空", trigger: "blur" }
        ],
        knowledgeCode: [
          { required: false, message: "章节不能为空", trigger: "blur" }
        ],
        taskName: [
          { required: true, message: "任务名称不能为空", trigger: "blur" }
        ],
        taskType: [
          { required: true, message: "任务类型不能为空", trigger: "change" }
        ],
        startTime: [
          { required: true, message: "开始时间不能为空", trigger: "change" }
        ],
        endTime: [
          { required: true, message: "结束时间不能为空", trigger: "change" },
          {
            validator: (rule, value, callback) => {
              if (value && this.form.startTime && value <= this.form.startTime) {
                callback(new Error('结束时间必须晚于开始时间'));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ]
      },
      // 选项数据
      subjectOptions: [],
      chapterOptions: [],
      paperOptions: [],
      homeworkOptions: [],
      studyPlanOptions: [],
      teachingVideoOptions: [],
      customHomeworkOptions: [],
      customPaperOptions: [],
      userList: [],
      studentTreeData: [],
        teacherInfo: null, // 存储教师信息

      // 预览相关数据
      previewVisible: false,
      currentPreviewFile: null,

      // 试卷分页相关数据
      paperList: [],
      paperTotal: 0,
      paperLoading: false,
      paperQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subject: null,
        customPaperName: null
      },
      currentPaperRow: null,

      // 作业分页相关数据
      homeworkList: [],
      homeworkTotal: 0,
      homeworkLoading: false,
      homeworkQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subject: null,
        customPaperName: null
      },
      currentHomeworkRow: null,

      // 学案分页相关数据
      studyPlanList: [],
      studyPlanTotal: 0,
      studyPlanLoading: false,
      studyPlanQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subject: null,
        fileName: null
      },
      currentStudyPlanRow: null,
      // 学案类型：'个人'、'系统'、'校本'，空字符串表示全部
      studyPlanType: '',

      // 教学视频分页相关数据
      teachingVideoList: [],
      teachingVideoTotal: 0,
      teachingVideoLoading: false,
      teachingVideoQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subject: null,
        fileName: null
      },
      currentTeachingVideoRow: null,
      // 教学视频类型：'个人'、'系统'、'校本'，空字符串表示全部
      teachingVideoType: '',

      // 自定义作业分页相关数据
      customHomeworkList: [],
      customHomeworkTotal: 0,
      customHomeworkLoading: false,
      customHomeworkQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subject: null,
        userFname: null
      },
      currentCustomHomeworkRow: null,
      // 自定义作业类型：'个人'、'系统'、'校本'，空字符串表示全部
      customHomeworkType: '',

      // 自定义组卷分页相关数据
      customPaperList: [],
      customPaperTotal: 0,
      customPaperLoading: false,
      customPaperQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subject: null,
        userFname: null
      },
      currentCustomPaperRow: null,
      // 自定义组卷类型：'个人'、'系统'、'校本'，空字符串表示全部
      customPaperType: '',

      // 新作业分页相关数据
      newHomeworkList: [],
      newHomeworkTotal: 0,
      newHomeworkLoading: false,
      newHomeworkQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subjectCode: null,
        customPaperName: null
      },
      currentNewHomeworkRow: null,

      // 新组卷分页相关数据
      newPaperList: [],
      newPaperTotal: 0,
      newPaperLoading: false,
      newPaperQueryParams: {
        pageNum: 1,
        pageSize: 8,
        subjectCode: null,
        customPaperName: null
      },
      currentNewPaperRow: null,

      // 章节级联选择器配置
      chapterProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        checkStrictly: true,
        lazy: false,
        multiple: false,
        emitPath: false,
        expandTrigger: 'click'
      },

      // 学生选择相关
      studentDialogVisible: false,
      selectedStudentIds: [],
      selectedStudentLabels: [],
      studentClassMap: {}, // 存储学生ID和班级信息的映射 { studentId: { classId, className } }
      abilityLevelFilter: '不限', // 能力等级筛选，默认为不限

      // 预览相关
      previewDialogVisible: false,
      previewResourceData: {
        id: null,
        name: '',
        type: ''
      },
      previewQuestions: [],
      previewLoading: false,

    }
  },
  computed: {
    ...mapGetters([
      'nickName'
    ]),
    /** 统一的资源配置对象 - 用于管理所有资源类型的配置 */
    resourceConfigs() {
      return {
        '试卷': {
          listKey: 'paperList',
          totalKey: 'paperTotal',
          loadingKey: 'paperLoading',
          queryParamsKey: 'paperQueryParams',
          rowKey: 'currentPaperRow',
          loadMethod: 'getPaperList',
          idField: 'id',
          nameField: 'customPaperName',
          formatLabel: null, // 使用默认名称字段
          iconClass: 'el-icon-document'
        },
        '作业': {
          listKey: 'homeworkList',
          totalKey: 'homeworkTotal',
          loadingKey: 'homeworkLoading',
          queryParamsKey: 'homeworkQueryParams',
          rowKey: 'currentHomeworkRow',
          loadMethod: 'getHomeworkList',
          idField: 'id',
          nameField: 'customPaperName',
          formatLabel: null,
          iconClass: 'el-icon-edit-outline'
        },
        '学案': {
          listKey: 'studyPlanList',
          totalKey: 'studyPlanTotal',
          loadingKey: 'studyPlanLoading',
          queryParamsKey: 'studyPlanQueryParams',
          rowKey: 'currentStudyPlanRow',
          typeKey: 'studyPlanType',
          loadMethod: 'getKnowledgeResourceList',
          loadMethodParam: '学案',
          idField: 'fileId',
          nameField: 'userFname',
          formatLabel: 'formatStudyPlanLabel',
          iconClass: 'el-icon-folder-opened'
        },
        '教学视频': {
          listKey: 'teachingVideoList',
          totalKey: 'teachingVideoTotal',
          loadingKey: 'teachingVideoLoading',
          queryParamsKey: 'teachingVideoQueryParams',
          rowKey: 'currentTeachingVideoRow',
          typeKey: 'teachingVideoType',
          loadMethod: 'getKnowledgeResourceList',
          loadMethodParam: '教学视频',
          idField: 'fileId',
          nameField: 'userFname',
          formatLabel: 'formatTeachingVideoLabel',
          iconClass: 'el-icon-video-play'
        },
        '自定义作业': {
          listKey: 'customHomeworkList',
          totalKey: 'customHomeworkTotal',
          loadingKey: 'customHomeworkLoading',
          queryParamsKey: 'customHomeworkQueryParams',
          rowKey: 'currentCustomHomeworkRow',
          typeKey: 'customHomeworkType',
          loadMethod: 'getKnowledgeResourceList',
          loadMethodParam: '自定义作业',
          idField: 'fileId',
          nameField: 'userFname',
          formatLabel: 'formatCustomHomeworkLabel',
          iconClass: 'el-icon-edit'
        },
        '自定义组卷': {
          listKey: 'customPaperList',
          totalKey: 'customPaperTotal',
          loadingKey: 'customPaperLoading',
          queryParamsKey: 'customPaperQueryParams',
          rowKey: 'currentCustomPaperRow',
          typeKey: 'customPaperType',
          loadMethod: 'getKnowledgeResourceList',
          loadMethodParam: '自定义组卷',
          idField: 'fileId',
          nameField: 'userFname',
          formatLabel: 'formatCustomPaperLabel',
          iconClass: 'el-icon-document-copy'
        },
        '新作业': {
          listKey: 'newHomeworkList',
          totalKey: 'newHomeworkTotal',
          loadingKey: 'newHomeworkLoading',
          queryParamsKey: 'newHomeworkQueryParams',
          rowKey: 'currentNewHomeworkRow',
          loadMethod: 'getNewPaperHomeworkList',
          loadMethodParam: 2, // type=2表示作业
          idField: 'id',
          nameField: 'customPaperName',
          formatLabel: null,
          iconClass: 'el-icon-edit-outline'
        },
        '新组卷': {
          listKey: 'newPaperList',
          totalKey: 'newPaperTotal',
          loadingKey: 'newPaperLoading',
          queryParamsKey: 'newPaperQueryParams',
          rowKey: 'currentNewPaperRow',
          loadMethod: 'getNewPaperHomeworkList',
          loadMethodParam: 1, // type=1表示组卷
          idField: 'id',
          nameField: 'customPaperName',
          formatLabel: null,
          iconClass: 'el-icon-document'
        }
      }
    },
    /** 判断当前任务类型是否为知识类资源 */
    isKnowledgeResourceType() {
      return ['学案', '教学视频', '自定义作业', '自定义组卷'].includes(this.form.taskType)
    },
    /** 判断当前任务类型是否为试卷或作业 */
    isPaperOrHomeworkType() {
      return ['试卷', '作业'].includes(this.form.taskType)
    },
    /** 判断当前任务类型是否为新作业或新组卷 */
    isNewPaperHomeworkType() {
      return ['新作业', '新组卷'].includes(this.form.taskType)
    },
    /** 当前知识类资源的配置 */
    currentKnowledgeConfig() {
      if (!this.isKnowledgeResourceType) {
        return null
      }
      const config = this.resourceConfigs[this.form.taskType]
      if (!config) {
        return null
      }
      
      // 知识类资源的配置映射
      const knowledgeConfigMap = {
        '学案': {
          label: '学案',
          searchLabel: '学案名称',
          searchField: 'fileName',
          searchPlaceholder: '请输入学案名称'
        },
        '教学视频': {
          label: '教学视频',
          searchLabel: '视频名称',
          searchField: 'fileName',
          searchPlaceholder: '请输入视频名称'
        },
        '自定义作业': {
          label: '自定义作业',
          searchLabel: '作业名称',
          searchField: 'userFname',
          searchPlaceholder: '请输入作业名称'
        },
        '自定义组卷': {
          label: '自定义组卷',
          searchLabel: '组卷名称',
          searchField: 'userFname',
          searchPlaceholder: '请输入组卷名称'
        }
      }
      
      const knowledgeConfig = knowledgeConfigMap[this.form.taskType] || {}
      
      return {
        taskType: this.form.taskType,
        label: knowledgeConfig.label || this.form.taskType,
        searchLabel: knowledgeConfig.searchLabel || '名称',
        searchField: knowledgeConfig.searchField || 'userFname',
        searchPlaceholder: knowledgeConfig.searchPlaceholder || '请输入名称',
        type: this[config.typeKey] || '',
        list: this[config.listKey] || [],
        total: this[config.totalKey] || 0,
        loading: this[config.loadingKey] || false,
        queryParams: this[config.queryParamsKey] || {},
        currentRow: this[config.rowKey] || null,
        idField: config.idField,
        nameField: config.nameField,
        formatLabel: config.formatLabel,
        iconClass: config.iconClass
      }
    },
    /** 当前试卷/作业资源的配置 */
    currentPaperHomeworkConfig() {
      if (!this.isPaperOrHomeworkType && !this.isNewPaperHomeworkType) {
        return null
      }
      const config = this.resourceConfigs[this.form.taskType]
      if (!config) {
        return null
      }
      
      // 试卷/作业的配置映射
      const paperHomeworkConfigMap = {
        '试卷': {
          label: '试卷',
          searchLabel: '试卷名称',
          searchPlaceholder: '请输入试卷名称'
        },
        '作业': {
          label: '作业',
          searchLabel: '作业名称',
          searchPlaceholder: '请输入作业名称'
        },
        '新作业': {
          label: '新作业',
          searchLabel: '作业名称',
          searchPlaceholder: '请输入作业名称'
        },
        '新组卷': {
          label: '新组卷',
          searchLabel: '组卷名称',
          searchPlaceholder: '请输入组卷名称'
        }
      }
      
      const paperHomeworkConfig = paperHomeworkConfigMap[this.form.taskType] || {}
      
      return {
        taskType: this.form.taskType,
        label: paperHomeworkConfig.label || this.form.taskType,
        searchLabel: paperHomeworkConfig.searchLabel || '名称',
        searchPlaceholder: paperHomeworkConfig.searchPlaceholder || '请输入名称',
        list: this[config.listKey] || [],
        total: this[config.totalKey] || 0,
        loading: this[config.loadingKey] || false,
        queryParams: this[config.queryParamsKey] || {},
        currentRow: this[config.rowKey] || null,
        idField: config.idField,
        nameField: config.nameField,
        iconClass: config.iconClass
      }
    }
  },
     created() {
     // 先加载基础数据
     this.getSubjectOptions()
     this.loadChapterList()
     this.loadUserList()
     this.loadStudentTree()
     
     // 初始化知识类资源选项（使用 $nextTick 确保计算属性已初始化）
     this.$nextTick(() => {
       ['学案', '教学视频', '自定义作业', '自定义组卷'].forEach(type => {
         this.initKnowledgeResourceOptions(type)
       })
     })
     
     // 注意：资源列表的加载将在学科代码设置完成后进行（在 loadTeacherInfo 的回调中）
      // 任务名称将在教师信息加载完成后自动生成
     // 学科选项加载完成后会自动调用 loadTeacherInfo()
   },
  methods: {
    /** 格式化知识点显示 */
    formatKnowledgePoints(points) {
      // 如果是空值、空字符串、空数组，显示"无"
      if (!points || points === '[]' || (Array.isArray(points) && points.length === 0)) {
        return '无'
      }

      // 如果是数组，用逗号连接
      if (Array.isArray(points)) {
        return points.join(', ')
      }

      // 如果是字符串，直接返回
      return points
    },

    /** 处理开始时间变化 */
    handleStartTimeChange() {
      // 当开始时间改变时，重新验证结束时间
      if (this.form.endTime) {
        this.$nextTick(() => {
          this.$refs.taskForm.validateField('endTime')
        })
      }
    },

    /** 获取学科选项 */
    getSubjectOptions() {
      listSubject().then(response => {
        this.subjectOptions = response.rows || []
        // 学科选项加载完成后，自动加载教师信息并设置学科代码
        this.loadTeacherInfo()
      }).catch(error => {
        console.error('获取学科数据失败:', error)
      })
    },

         /** 加载章节列表 */
     loadChapterList() {
       // 使用新的接口 /system/getchaptermap/getchaptermap
       request.get('/system/getchaptermap/getchaptermap').then(response => {
         if (response.code === 200) {
           this.chapterOptions = response.data || []
         } else {
           this.$message.error('获取章节列表失败：' + response.msg)
         }
       }).catch(error => {
         this.$message.error('获取章节列表失败：' + error.message)
       })
     },
    /** 加载试卷选项 */
    loadPaperOptions() {
      this.getPaperList()
    },

    /** 获取试卷列表（分页） */
    getPaperList() {
      this.paperLoading = true
      listPaper(this.paperQueryParams).then(response => {
        if (response.code === 200) {
          this.paperList = response.rows || []
          this.paperTotal = response.total || 0
        } else {
          this.$message.error('获取试卷列表失败：' + response.msg)
          this.paperList = []
          this.paperTotal = 0
        }
        this.paperLoading = false
      }).catch(error => {
        this.$message.error('获取试卷列表失败：' + error.message)
        this.paperList = []
        this.paperTotal = 0
        this.paperLoading = false
      })
    },

    /** 试卷搜索 */
    handlePaperQuery() {
      this.paperQueryParams.pageNum = 1
      this.getPaperList()
    },

    /** 通用的试卷/作业查询方法 */
    handlePaperHomeworkQuery(taskType) {
      if (taskType === '试卷') {
        this.handlePaperQuery()
      } else if (taskType === '作业') {
        this.handleHomeworkQuery()
      } else if (taskType === '新作业' || taskType === '新组卷') {
        this.getNewPaperHomeworkList(taskType === '新组卷' ? 1 : 2)
      }
    },

    /** 通用的试卷/作业重置方法 */
    resetPaperHomeworkQuery(taskType) {
      if (taskType === '试卷') {
        this.resetPaperQuery()
      } else if (taskType === '作业') {
        this.resetHomeworkQuery()
      } else if (taskType === '新作业') {
        this.newHomeworkQueryParams = {
          pageNum: 1,
          pageSize: 8,
          subjectCode: null,
          customPaperName: null
        }
        this.getNewPaperHomeworkList(2)
      } else if (taskType === '新组卷') {
        this.newPaperQueryParams = {
          pageNum: 1,
          pageSize: 8,
          subjectCode: null,
          customPaperName: null
        }
        this.getNewPaperHomeworkList(1)
      }
    },

    /** 通用的试卷/作业分页大小变化方法 */
    handlePaperHomeworkSizeChange(taskType, val) {
      if (taskType === '试卷') {
        this.handlePaperSizeChange(val)
      } else if (taskType === '作业') {
        this.handleHomeworkSizeChange(val)
      } else if (taskType === '新作业') {
        this.newHomeworkQueryParams.pageSize = val
        this.newHomeworkQueryParams.pageNum = 1
        this.getNewPaperHomeworkList(2)
      } else if (taskType === '新组卷') {
        this.newPaperQueryParams.pageSize = val
        this.newPaperQueryParams.pageNum = 1
        this.getNewPaperHomeworkList(1)
      }
    },

    /** 通用的试卷/作业当前页变化方法 */
    handlePaperHomeworkCurrentChange(taskType, val) {
      if (taskType === '试卷') {
        this.handlePaperCurrentChange(val)
      } else if (taskType === '作业') {
        this.handleHomeworkCurrentChange(val)
      } else if (taskType === '新作业') {
        this.newHomeworkQueryParams.pageNum = val
        this.getNewPaperHomeworkList(2)
      } else if (taskType === '新组卷') {
        this.newPaperQueryParams.pageNum = val
        this.getNewPaperHomeworkList(1)
      }
    },

    /** 通用的试卷/作业选择方法 */
    selectPaperHomework(taskType, row) {
      if (taskType === '试卷') {
        this.selectPaper(row)
      } else if (taskType === '作业') {
        this.selectHomework(row)
      } else if (taskType === '新作业') {
        this.currentNewHomeworkRow = row
        this.form.taskUrl = String(row.id)
      } else if (taskType === '新组卷') {
        this.currentNewPaperRow = row
        this.form.taskUrl = String(row.id)
      }
    },

    /** 通用的试卷/作业预览方法 */
    previewPaperHomeworkFromTable(taskType, row) {
      if (taskType === '试卷') {
        this.previewPaperFromTable(row)
      } else if (taskType === '作业') {
        this.previewHomeworkFromTable(row)
      } else if (taskType === '新作业' || taskType === '新组卷') {
        this.previewNewPaperHomeworkFromTable(taskType, row)
      }
    },

    /** 重置试卷搜索 */
    resetPaperQuery() {
      this.paperQueryParams = {
        pageNum: 1,
        pageSize: 8,
        subject: null,
        customPaperName: null
      }
      this.getPaperList()
    },

    /** 试卷分页大小变化 */
    handlePaperSizeChange(val) {
      this.paperQueryParams.pageSize = val
      this.paperQueryParams.pageNum = 1
      this.getPaperList()
    },

    /** 试卷当前页变化 */
    handlePaperCurrentChange(val) {
      this.paperQueryParams.pageNum = val
      this.getPaperList()
    },

    /** 选择试卷 */
    selectPaper(row) {
      this.currentPaperRow = row
      this.form.taskUrl = String(row.id)
    },

    /** 预览试卷 */
    previewPaperFromTable(row) {
      this.previewResourceData = {
        id: row.id,
        name: row.customPaperName,
        type: '试卷'
      }
      this.previewDialogVisible = true
      this.previewQuestions = []
      this.previewLoading = true
      this.previewPaper(row.id)
    },
    /** 加载作业选项 */
    loadHomeworkOptions() {
      this.getHomeworkList()
    },

    /** 获取作业列表（分页） */
    getHomeworkList() {
      this.homeworkLoading = true
      listTable(this.homeworkQueryParams).then(response => {
        if (response.code === 200) {
          this.homeworkList = response.rows || []
          this.homeworkTotal = response.total || 0
        } else {
          this.$message.error('获取作业列表失败：' + response.msg)
          this.homeworkList = []
          this.homeworkTotal = 0
        }
        this.homeworkLoading = false
      }).catch(error => {
        this.$message.error('获取作业列表失败：' + error.message)
        this.homeworkList = []
        this.homeworkTotal = 0
        this.homeworkLoading = false
      })
    },

    /** 获取新作业/新组卷列表（分页） */
    getNewPaperHomeworkList(type) {
      // type: 1-组卷, 2-作业
      const isNewPaper = type === 1
      const config = isNewPaper ? {
        listKey: 'newPaperList',
        totalKey: 'newPaperTotal',
        loadingKey: 'newPaperLoading',
        queryParamsKey: 'newPaperQueryParams'
      } : {
        listKey: 'newHomeworkList',
        totalKey: 'newHomeworkTotal',
        loadingKey: 'newHomeworkLoading',
        queryParamsKey: 'newHomeworkQueryParams'
      }

      this[config.loadingKey] = true
      const params = {
        ...this[config.queryParamsKey],
        type: type
      }

      listPaperAssignment(params).then(response => {
        if (response.code === 200) {
          this[config.listKey] = response.rows || []
          this[config.totalKey] = response.total || 0
        } else {
          this.$message.error(`获取${isNewPaper ? '新组卷' : '新作业'}列表失败：${response.msg}`)
          this[config.listKey] = []
          this[config.totalKey] = 0
        }
        this[config.loadingKey] = false
      }).catch(error => {
        this.$message.error(`获取${isNewPaper ? '新组卷' : '新作业'}列表失败：${error.message}`)
        this[config.listKey] = []
        this[config.totalKey] = 0
        this[config.loadingKey] = false
      })
    },

    /** 作业搜索 */
    handleHomeworkQuery() {
      this.homeworkQueryParams.pageNum = 1
      this.getHomeworkList()
    },

    /** 重置作业搜索 */
    resetHomeworkQuery() {
      this.homeworkQueryParams = {
        pageNum: 1,
        pageSize: 10,
        subject: null,
        customPaperName: null
      }
      this.getHomeworkList()
    },

    /** 作业分页大小变化 */
    handleHomeworkSizeChange(val) {
      this.homeworkQueryParams.pageSize = val
      this.homeworkQueryParams.pageNum = 1
      this.getHomeworkList()
    },

    /** 作业当前页变化 */
    handleHomeworkCurrentChange(val) {
      this.homeworkQueryParams.pageNum = val
      this.getHomeworkList()
    },

    /** 选择作业 */
    selectHomework(row) {
      this.currentHomeworkRow = row
      this.form.taskUrl = String(row.id)
    },

    /** 预览作业 */
    previewHomeworkFromTable(row) {
      this.previewResourceData = {
        id: row.id,
        name: row.customPaperName,
        type: '作业'
      }
      this.previewDialogVisible = true
      this.previewQuestions = []
      this.previewLoading = true
      this.previewHomework(row.id)
    },
    /** 初始化知识类资源选项（统一方法） */
    initKnowledgeResourceOptions(resourceType) {
      try {
        // 确保 resourceConfigs 已初始化
        if (!this.resourceConfigs) {
          return
        }
        const config = this.resourceConfigs[resourceType]
        if (config && config.listKey && config.totalKey) {
          // 初始化列表和总数
          if (this[config.listKey] === undefined) {
            this.$set(this, config.listKey, [])
          } else {
            this[config.listKey] = []
          }
          if (this[config.totalKey] === undefined) {
            this.$set(this, config.totalKey, 0)
          } else {
            this[config.totalKey] = 0
          }
        }
      } catch (error) {
        console.warn(`初始化${resourceType}资源选项失败:`, error)
      }
     },

    /** 加载用户列表 */
    loadUserList() {
      sysUserList().then(response => {
        if (response.code === 200) {
          this.userList = response.data || []
        } else {
          this.$message.error('获取用户列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取用户列表失败：' + error.message)
      })
    },

    /** 加载教师信息并自动设置学科代码 */
    loadTeacherInfo() {
      // 先获取当前用户信息，然后获取教师详细信息
      this.getCurrentUserInfo().then(userInfo => {
        const userId = userInfo.userId
        return getUserInfo(userId)
      }).then(response => {
        if (response.code === 200 && response.data) {
          const teacherInfo = response.data
          // 保存教师信息到组件数据中，用于生成任务名称
          this.teacherInfo = teacherInfo

          // 获取教师所教学科，支持多种字段名
          const teacherSubject = teacherInfo.subjectNames || teacherInfo.subject || teacherInfo.subjectName || teacherInfo.gradeAndSubject

          if (teacherSubject) {
            // 先尝试从学科选项中直接查找匹配的学科
            let matchedSubject = this.subjectOptions.find(item =>
              item.subjectName === teacherSubject ||
              item.subjectName.includes(teacherSubject) ||
              teacherSubject.includes(item.subjectName)
            )

            if (matchedSubject) {
              this.form.subjectCode = matchedSubject.subjectCode
              this.$message.success(`已自动选择您的所教学科：${matchedSubject.subjectName}`)
              // 学科代码设置后，生成任务名称
              this.generateDefaultTaskName()
              // 学科代码设置后，加载对应学科的资源列表
              this.loadResourceListByTaskType()
            } else {
              // 如果学科选项中没有找到，尝试使用映射工具
              const subjectCode = getSubjectCodeFromName(teacherSubject)

              if (subjectCode) {
                // 检查映射的代码是否在学科选项中存在
                const codeExists = this.subjectOptions.find(item => item.subjectCode === subjectCode)
                if (codeExists) {
                  this.form.subjectCode = subjectCode
                  this.$message.success(`已自动选择您的所教学科：${teacherSubject}`)
                  // 学科代码设置后，生成任务名称
                  this.generateDefaultTaskName()
                  // 学科代码设置后，加载对应学科的资源列表
                  this.loadResourceListByTaskType()
                } else {
                  console.warn('映射的学科代码不在学科选项中：', subjectCode)
                  this.$message.warning(`无法识别您的所教学科"${teacherSubject}"，请手动选择学科代码`)
                }
              } else {
                console.warn('无法识别的学科名称：', teacherSubject)
                this.$message.warning(`无法识别您的所教学科"${teacherSubject}"，请手动选择学科代码`)
              }
            }
          } else {
            console.warn('教师信息中未找到学科信息')
          }
        } else {
          console.warn('获取教师信息失败：', response.msg)
        }
      }).catch(error => {
        console.warn('获取教师信息失败：', error.message)
        // 静默处理错误，不影响页面正常使用
      })
    },

    /** 获取当前用户信息 */
    getCurrentUserInfo() {
      return new Promise((resolve, reject) => {
        // 如果store中已有用户信息，直接返回
        if (this.$store.getters.userId) {
          resolve({
            userId: this.$store.getters.userId,
            nickName: this.$store.getters.nickName
          })
          return
        }

        // 否则调用getInfo API获取用户信息
        request.get('/getInfo').then(response => {
          if (response.code === 200 && response.user) {
            const userInfo = response.user
            resolve(userInfo)
          } else {
            reject(new Error('获取用户信息失败'))
          }
        }).catch(error => {
          console.error('调用getInfo失败：', error)
          reject(error)
        })
      })
    },

    /** 生成默认任务名称 */
    generateDefaultTaskName() {
      if (!this.form.taskType) {
        return
      }

      try {
        // 从学生选择中获取班级信息
        let className = ''
        if (this.selectedStudentIds && this.selectedStudentIds.length > 0) {
          // 获取第一个学生的班级信息
          const firstStudentId = this.selectedStudentIds[0]
          const classInfo = this.studentClassMap[firstStudentId]
          if (classInfo && classInfo.className) {
            className = classInfo.className
          }
        }

        // 获取学科名称
        const subjectName = this.getSubjectDisplay(this.form.subjectCode) || '未知学科'

        // 获取当前日期（格式：MM.DD）
        const today = new Date()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const dateStr = `${month}.${day}`

        // 生成任务名称：班级名称+科目+日期+类型
        // 如果班级信息为空，则只使用学科+日期+类型
        const taskName = className ? `${className}${subjectName}${dateStr}${this.form.taskType}` : `${subjectName}${dateStr}${this.form.taskType}`

        this.form.taskName = taskName
      } catch (error) {
        console.error('生成任务名称失败：', error)
        // 如果生成失败，使用默认名称
        this.form.taskName = this.nickName ? `${this.nickName}的任务` : '新任务'
      }
    },

    /** 处理文件预览 */
    handleFilePreview(resource) {
      // 避免重复预览同一个文件
      if (this.currentPreviewFile && this.currentPreviewFile.fileId === resource.fileId && this.previewVisible) {
        return
      }

      // 构造文件对象，符合 FilePreview 组件的要求
      // 直接传递完整的资源对象，确保所有字段都正确传递
      this.currentPreviewFile = {
        ...resource,
        // 确保必要的字段存在
        fileId: resource.fileId,
        userFname: resource.userFname || resource.knowledge || '未命名文件',
        fileType: resource.fileType || this.getFileTypeFromPath(resource.filePath),
        filePath: resource.filePath
      }
      this.previewVisible = true
    },

    /** 从文件路径获取文件类型 */
    getFileTypeFromPath(filePath) {
      if (!filePath) return ''
      const extension = filePath.split('.').pop().toLowerCase()
      return extension
    },

    /** 处理预览关闭 */
    handlePreviewClose() {
      this.previewVisible = false
      this.currentPreviewFile = null
    },

    /** 根据任务类型加载资源列表（统一方法） */
    loadResourceListByTaskType() {
      if (!this.form.taskType) {
        return
      }
      
      const config = this.resourceConfigs[this.form.taskType]
      if (!config || !config.loadMethod) {
        return
      }
      
      // 更新查询参数中的学科代码
      if (this.form.subjectCode) {
        if (config.queryParamsKey) {
          // 对于试卷和作业，使用 subject 字段
          if (this.form.taskType === '试卷' || this.form.taskType === '作业') {
            this[config.queryParamsKey].subject = this.form.subjectCode
          }
          // 对于新作业和新组卷，使用 subjectCode 字段
          if (this.form.taskType === '新作业' || this.form.taskType === '新组卷') {
            this[config.queryParamsKey].subjectCode = this.form.subjectCode
          }
        }
      }
      
      // 加载资源列表
      if (config.loadMethodParam) {
        // 知识类资源或新作业/新组卷，需要传递参数
        if (this.form.taskType === '新作业' || this.form.taskType === '新组卷') {
          // 新作业和新组卷需要传递type值
          this[config.loadMethod](config.loadMethodParam)
        } else {
          // 知识类资源，传递资源类型字符串
          this[config.loadMethod](config.loadMethodParam)
        }
      } else {
        // 试卷/作业，直接调用
        this[config.loadMethod]()
      }
    },

    /** 学科代码变化处理 */
    onSubjectCodeChange() {
      // 学科代码变化时，重新生成任务名称
      this.paperQueryParams.subject = this.form.subjectCode
      this.homeworkQueryParams.subject = this.form.subjectCode
      this.newHomeworkQueryParams.subjectCode = this.form.subjectCode
      this.newPaperQueryParams.subjectCode = this.form.subjectCode
      this.generateDefaultTaskName()
      
      // 根据当前任务类型重新加载资源列表
      this.loadResourceListByTaskType()
    },

    /** 过滤树形数据，只保留年级层级（高一、高二、高三等）及以下层级 */
    filterTreeFromGradeOne(treeData) {
      if (!treeData || !Array.isArray(treeData)) {
        return []
      }

      // 判断节点是否是年级层级（高一、高二、高三、初一等）
      const isGradeLevel = (label) => {
        if (!label) return false
        // 匹配年级模式：高一、高二、高三、初一、初二、初三等
        const gradePattern = /^高[一二三四五六七八九十]+|^初[一二三四五六七八九十]+|^[一二三四五六七八九十]+年级/
        return gradePattern.test(label)
      }

      // 处理子节点（保留所有子节点，不做过滤）
      const processChildren = (children) => {
        if (!children || !Array.isArray(children)) {
          return []
        }
        return children.map(child => {
          const newChild = { ...child }
          if (child.children && Array.isArray(child.children) && child.children.length > 0) {
            newChild.children = processChildren(child.children)
          }
          return newChild
        })
      }

      // 递归查找所有年级层级节点（不保留父节点）
      const findGradeLevelNodes = (nodes) => {
        const result = []

        if (!nodes || !Array.isArray(nodes)) {
          return result
        }

        nodes.forEach(node => {
          const label = node.label || node.name || ''
          const isGrade = isGradeLevel(label)

          if (isGrade) {
            // 找到年级层级节点，直接添加到结果中（不保留父节点）
            const newNode = { ...node }
            // 递归处理子节点，保留所有子节点
            if (node.children && Array.isArray(node.children) && node.children.length > 0) {
              newNode.children = processChildren(node.children)
            }
            result.push(newNode)
          } else if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            // 继续在子节点中查找年级层级节点
            const childResults = findGradeLevelNodes(node.children)
            result.push(...childResults)
          }
        })

        return result
      }

      // 从根节点开始查找所有年级层级节点
      return findGradeLevelNodes(treeData)
    },

    /** 加载学生树数据 */
    loadStudentTree(level = null) {
      const params = { level: '不限' }
      if (level && level !== '') {
        params.level = level
      }

      sysDeptTree(params).then(response => {
        // 过滤数据，只保留"高一"及以下层级
        this.studentTreeData = this.filterTreeFromGradeOne(response)
      }).catch(error => {
        this.$message.error('获取学生树数据失败：' + error.message)
      })
    },
     /** 任务类型变化处理 - 使用统一配置优化 */
     onTaskTypeChange() {
       if (!this.form.taskType) {
         this.form.taskUrl = null
         return
       }

       const config = this.resourceConfigs[this.form.taskType]

       // 重置taskUrl和当前选中行
         this.form.taskUrl = null
       if (config) {
         this[config.rowKey] = null
       }

       // 根据配置加载列表
       if (config && config.loadMethod) {
         if (config.loadMethodParam) {
           // 知识类资源，需要传递参数
           this[config.loadMethod](config.loadMethodParam)
       } else {
           // 试卷/作业，直接调用
           this[config.loadMethod]()
         }
       }

        // 任务类型变化时，重新生成任务名称
        this.generateDefaultTaskName()
     },
         /** 表单章节选择处理 */
     handleFormChapterChange(value) {
       // 章节选择处理，可根据需要扩展
     },
    /** 学生选择相关方法 */
    openStudentDialog() {
      if (!this.studentTreeData || this.studentTreeData.length === 0) {
        this.loadStudentTree()
      }
      this.studentDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.studentTree) {
          this.$refs.studentTree.setCheckedKeys(this.selectedStudentIds)
        }
      })
    },
    handleStudentCheckChange(checkedNodes, checkedKeys) {
      const getLeafUserIds = (nodes) => {
        let ids = []
        nodes.forEach(node => {
          if (node.type === 'user') {
            ids.push(node.id)
          }
          if (node.children && node.children.length) {
            ids = ids.concat(getLeafUserIds(node.children))
          }
        })
        return ids
      }
      const checkedUserNodes = this.$refs.studentTree.getCheckedNodes(true).filter(n => n.type === 'user')
      this.selectedStudentIds = checkedUserNodes.map(n => n.id)
      this.selectedStudentLabels = checkedUserNodes.map(n => n.label)
      this.form.studentId = this.selectedStudentIds.join(',')

      // 如果有选择学生，清除验证错误
      if (this.selectedStudentIds.length > 0) {
        this.$nextTick(() => {
          if (this.$refs.taskForm) {
            this.$refs.taskForm.clearValidate('studentId')
          }
        })
      }
    },
    confirmStudentSelect() {
      const checkedNodes = this.$refs.studentTree.getCheckedNodes(true)

      // 查找节点的父节点（班级节点）- 从树形数据中查找
      const findParentClass = (nodeId, treeData, parent = null) => {
        for (const node of treeData) {
          if (String(node.id) === String(nodeId)) {
            // 如果当前节点是学生节点，返回父节点（班级节点）
            if (node.type === 'user') {
              return parent ? { classId: parent.id, className: parent.label || parent.name } : null
            }
            // 如果当前节点不是学生节点，返回它自己（可能是班级节点）
            return { classId: node.id, className: node.label || node.name }
          }
          if (node.children && node.children.length > 0) {
            // 如果当前节点不是学生节点，将其作为父节点传递
            const newParent = node.type !== 'user' ? node : parent
            const result = findParentClass(nodeId, node.children, newParent)
            if (result) return result
          }
        }
        return null
      }

      function collectUserIds(nodes) {
        let ids = []
        nodes.forEach(node => {
          if (node.type === 'user') {
            ids.push(node.id)
          }
          if (node.children && node.children.length) {
            ids = ids.concat(collectUserIds(node.children))
          }
        })
        return ids
      }

      let userIds = checkedNodes.filter(n => n.type === 'user').map(n => n.id)
      checkedNodes
        .filter(n => !n.type || n.type !== 'user')
        .forEach(deptNode => {
          userIds = userIds.concat(collectUserIds([deptNode]))
        })
      userIds = Array.from(new Set(userIds))

      // 构建学生和班级的映射关系
      this.studentClassMap = {}
      userIds.forEach(studentId => {
        const classInfo = findParentClass(studentId, this.studentTreeData)
        if (classInfo) {
          this.studentClassMap[studentId] = classInfo
        }
      })

      this.form.studentId = userIds.join(',')
      this.selectedStudentIds = userIds
      this.selectedStudentLabels = this.getUserLabelsByIds(this.selectedStudentIds)
      this.studentDialogVisible = false

      // 学生选择确认后，更新任务名称
      if (this.form.subjectCode && this.form.taskType) {
        this.generateDefaultTaskName()
      }

      // 清除学生ID字段的验证错误
      this.$nextTick(() => {
        if (this.$refs.taskForm) {
          this.$refs.taskForm.clearValidate('studentId')
        }
      })
    },

    /** 能力等级筛选相关方法 */
    handleAbilityLevelChange(level) {
      // 重置学生选择
      this.selectedStudentIds = []
      this.selectedStudentLabels = []
      this.studentClassMap = {}
      this.form.studentId = null

      // 根据能力等级重新加载学生数据
      // 如果选择"不限"，传递空字符串而不是null
      const levelParam = level === '不限' ? '' : level
      this.loadStudentTree(levelParam)

      // 更新树形选择器的选中状态
      this.$nextTick(() => {
        if (this.$refs.studentTree) {
          this.$refs.studentTree.setCheckedKeys([])
        }
      })
    },
    getUserLabelsByIds(ids) {
      const labels = []
      function walk(nodes) {
        nodes.forEach(node => {
          if (node.type === 'user' && ids.includes(String(node.id))) {
            labels.push(node.label)
          }
          if (node.children && node.children.length) {
            walk(node.children)
          }
        })
      }
      walk(this.studentTreeData)
      return labels
    },

    /** 科目名称显示 */
    getSubjectDisplay(subjectCode) {
      const subject = this.subjectOptions.find(item => item.subjectCode === subjectCode)
      return subject ? subject.subjectName : subjectCode
    },

    /** 创建人名称显示 */
    getCreatorName(userId) {
      if (!userId && userId !== 0) {
        return '未知'
      }
      const user = this.userList.find(item => item.userId === userId || String(item.userId) === String(userId))
      return user ? (user.nickName || user.userName || '未知') : '未知'
    },

    /** 获取资源图标对应的CSS类名 */
    getResourceIconClass(taskType) {
      const iconClassMap = {
        '试卷': 'document-icon',
        '作业': 'homework-icon',
        '学案': 'study-plan-icon',
        '教学视频': 'teaching-video-icon',
        '自定义作业': 'custom-homework-icon',
        '自定义组卷': 'custom-paper-icon',
        '新作业': 'homework-icon',
        '新组卷': 'document-icon'
      }
      return iconClassMap[taskType] || 'document-icon'
    },


    /** 资源管理方法 */
    getSelectedResources() {
      if (!this.form.taskType || !this.form.taskUrl) {
        return []
      }

      const config = this.resourceConfigs[this.form.taskType]
      if (!config) {
        return []
      }

      const id = Array.isArray(this.form.taskUrl) ? this.form.taskUrl[0] : this.form.taskUrl
      const currentRow = this[config.rowKey]
      const list = this[config.listKey]
      const resource = currentRow || list.find(item => String(item[config.idField]) === String(id))

      if (!resource) {
        return []
      }

      let name = id
      if (config.formatLabel && this[config.formatLabel]) {
        name = this[config.formatLabel](resource)
      } else {
        name = resource[config.nameField] || id
      }

      return [{
        id: id,
        name: name,
        type: this.form.taskType
      }]
    },


    // 预览资源
    previewResource(resource) {
      this.previewResourceData = resource
      this.previewDialogVisible = true
      this.previewQuestions = []
      this.previewLoading = true

      if (resource.type === '试卷') {
        this.previewPaper(resource.id)
      } else if (resource.type === '作业') {
        this.previewHomework(resource.id)
      } else if (resource.type === '学案') {
        this.previewStudyPlan(resource.id)
      } else if (resource.type === '教学视频') {
        this.previewTeachingVideo(resource.id)
      } else if (resource.type === '自定义作业') {
        this.previewCustomHomework(resource.id)
      } else if (resource.type === '自定义组卷') {
        this.previewCustomPaper(resource.id)
      } else if (resource.type === '新作业') {
        this.previewNewPaperHomework(resource.id, 2)
      } else if (resource.type === '新组卷') {
        this.previewNewPaperHomework(resource.id, 1)
      }
    },

    // 预览试卷
    previewPaper(paperId) {
      getPaper(paperId).then(response => {
        if (response.code === 200) {
          const paper = response.data
          if (paper.questionIds) {
            const questionIds = paper.questionIds.split(',').filter(id => id.trim())
            // 获取 creator 和 subject，然后调用 preview 接口获取 subject_name
            const subjectCode = paper.subject || paper.subjectCode
            const userId = paper.creator || paper.creatorId || paper.userId
            
            if (subjectCode && userId) {
              // 调用 preview 接口获取 subject_name
              getPreviewSubjectName({
                SubjectCode: subjectCode,
                userId: userId
              }).then(previewResponse => {
                if (previewResponse) {
                  let subjectName = null
                  
                  if (previewResponse.data) {
                    if (typeof previewResponse.data === 'string') {
                      // data 是字符串，直接使用
                      subjectName = previewResponse.data
                    } else if (typeof previewResponse.data === 'object') {
                      // data 是对象，尝试多种字段名
                      subjectName = previewResponse.data.subjectName || 
                                   previewResponse.data.subject_name ||
                                   previewResponse.data
                    }
                  } else if (previewResponse.subjectName) {
                    // 直接在响应根级别
                    subjectName = previewResponse.subjectName
                  } else if (previewResponse.subject_name) {
                    subjectName = previewResponse.subject_name
                  }
                  
                  if (subjectName) {
                    // preview 接口返回的就是科目名称，直接使用
                    this.loadQuestionsBySidsWithSubjectName(questionIds, subjectName)
                  } else {
                    console.warn('preview 接口返回的 subjectName 为空，使用默认方式')
                    // 使用 subjectCode 转换为科目名称
                    const fallbackSubjectName = this.getSubjectDisplay(subjectCode) || subjectCode
                    this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
                  }
                } else {
                  // 如果 preview 接口失败，使用 subjectCode 转换为科目名称作为降级方案
                  const fallbackSubjectName = this.getSubjectDisplay(subjectCode) || subjectCode
                  this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
                }
              }).catch(error => {
                console.warn('调用 preview 接口失败：', error)
                // 如果 preview 接口失败，使用 subjectCode 转换为科目名称作为降级方案
                const fallbackSubjectName = this.getSubjectDisplay(subjectCode) || subjectCode
                this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
              })
            } else {
              // 如果没有 creator 或 subject，使用 subject 转换为科目名称作为降级方案
              const fallbackSubjectName = this.getSubjectDisplay(paper.subject || subjectCode) || paper.subject || subjectCode
              this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
            }
          } else {
            this.previewQuestions = []
            this.previewLoading = false
          }
        } else {
          this.$message.error('获取试卷详情失败')
          this.previewLoading = false
        }
      }).catch(error => {
        this.$message.error('获取试卷详情失败：' + error.message)
        this.previewLoading = false
      })
    },

    // 预览作业
    previewHomework(homeworkId) {
      getTable(homeworkId).then(response => {
        if (response.code === 200) {
          const homework = response.data
          if (homework.questionIds) {
            const questionIds = homework.questionIds.split(',').filter(id => id.trim())
            // 获取 creator 和 subject，然后调用 preview 接口获取 subject_name
            const subjectCode = homework.subject || homework.subjectCode
            const userId = homework.creator || homework.creatorId || homework.userId
            
            if (subjectCode && userId) {
              // 调用 preview 接口获取 subject_name
              getPreviewSubjectName({
                SubjectCode: subjectCode,
                userId: userId
              }).then(previewResponse => {
                if (previewResponse) {
                  let subjectName = null
                  if (previewResponse.data) {
                    if (typeof previewResponse.data === 'string') {
                      // data 是字符串，直接使用
                      subjectName = previewResponse.data
                    } else if (typeof previewResponse.data === 'object') {
                      // data 是对象，尝试多种字段名
                      subjectName = previewResponse.data.subjectName || 
                                   previewResponse.data.subject_name ||
                                   previewResponse.data
                    }
                  } else if (previewResponse.subjectName) {
                    // 直接在响应根级别
                    subjectName = previewResponse.subjectName
                  } else if (previewResponse.subject_name) {
                    subjectName = previewResponse.subject_name
                  }
                  
                  if (subjectName) {
                    // 如果返回的是科目代码（如 "math"），需要转换为科目名称（如 "高中数学"）
                    const matchedSubject = this.subjectOptions.find(item => item.subjectCode === subjectName)
                    if (matchedSubject) {
                      // 是科目代码，转换为科目名称
                      subjectName = matchedSubject.subjectName
                    } else {
                      // 检查是否已经是科目名称（在 subjectOptions 的 subjectName 中能找到）
                      const isSubjectName = this.subjectOptions.some(item => item.subjectName === subjectName)
                      if (!isSubjectName) {
                        // 既不是代码也不是名称，尝试使用 getSubjectDisplay 转换
                        const displayName = this.getSubjectDisplay(subjectName)
                        if (displayName && displayName !== subjectName) {
                          subjectName = displayName
                        }
                      }
                    }
                    this.loadQuestionsBySidsWithSubjectName(questionIds, subjectName)
                  } else {
                    console.warn('preview 接口返回的 subjectName 为空，使用默认方式')
                    // 使用 subjectCode 转换为科目名称
                    const fallbackSubjectName = this.getSubjectDisplay(subjectCode) || subjectCode
                    this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
                  }
                } else {
                  // 如果 preview 接口失败，使用 subjectCode 作为降级方案
                  this.loadQuestionsBySidsWithSubjectName(questionIds, subjectCode)
                }
              }).catch(error => {
                console.warn('调用 preview 接口失败：', error)
                // 如果 preview 接口失败，使用 subjectCode 作为降级方案
                this.loadQuestionsBySidsWithSubjectName(questionIds, subjectCode)
              })
            } else {
              // 如果没有 creator 或 subject，使用 subject 作为降级方案
              this.loadQuestionsBySidsWithSubjectName(questionIds, homework.subject || subjectCode)
            }
          } else {
            this.previewQuestions = []
            this.previewLoading = false
          }
        } else {
          this.$message.error('获取作业详情失败')
          this.previewLoading = false
        }
      }).catch(error => {
        this.$message.error('获取作业详情失败：' + error.message)
        this.previewLoading = false
      })
    },

    // 预览学案
    previewStudyPlan(studyPlanId) {
      getKnowledge(studyPlanId).then(response => {
        if (response.code === 200) {
          const studyPlan = response.data
          // 学案通常包含文件内容或描述信息
          if (studyPlan.content || studyPlan.description) {
            // 如果学案有内容，直接显示
            this.previewQuestions = [{
              SID: studyPlanId,
              question: studyPlan.content || studyPlan.description || '学案内容',
              CateName: '学案',
              Degree: '标准',
              Points: studyPlan.knowledge || studyPlan.subjectName || '通用'
            }]
          } else {
            // 如果没有具体内容，显示基本信息
            this.previewQuestions = [{
              SID: studyPlanId,
              question: `学案：${this.formatStudyPlanLabel(studyPlan)}`,
              CateName: '学案',
              Degree: '标准',
              Points: studyPlan.knowledge || studyPlan.subjectName || '通用'
            }]
          }
          this.previewLoading = false
        } else {
          this.$message.error('获取学案详情失败')
          this.previewLoading = false
        }
      }).catch(error => {
        this.$message.error('获取学案详情失败：' + error.message)
        this.previewLoading = false
      })
    },

    // 预览教学视频
    previewTeachingVideo(teachingVideoId) {
      getKnowledge(teachingVideoId).then(response => {
        if (response.code === 200) {
          const teachingVideo = response.data
          // 教学视频通常包含文件内容或描述信息
          if (teachingVideo.content || teachingVideo.description) {
            // 如果教学视频有内容，直接显示
            this.previewQuestions = [{
              SID: teachingVideoId,
              question: teachingVideo.content || teachingVideo.description || '教学视频内容',
              CateName: '教学视频',
              Degree: '标准',
              Points: teachingVideo.knowledge || teachingVideo.subjectName || '通用'
            }]
          } else {
            // 如果没有具体内容，显示基本信息
            this.previewQuestions = [{
              SID: teachingVideoId,
              question: `教学视频：${this.formatTeachingVideoLabel(teachingVideo)}`,
              CateName: '教学视频',
              Degree: '标准',
              Points: teachingVideo.knowledge || teachingVideo.subjectName || '通用'
            }]
          }
          this.previewLoading = false
        } else {
          this.$message.error('获取教学视频详情失败')
          this.previewLoading = false
        }
      }).catch(error => {
        this.$message.error('获取教学视频详情失败：' + error.message)
        this.previewLoading = false
      })
    },

    // 预览自定义作业
    previewCustomHomework(customHomeworkId) {
      getKnowledge(customHomeworkId).then(response => {
        if (response.code === 200) {
          const customHomework = response.data
          // 自定义作业通常包含文件内容或描述信息
          if (customHomework.content || customHomework.description) {
            // 如果自定义作业有内容，直接显示
            this.previewQuestions = [{
              SID: customHomeworkId,
              question: customHomework.content || customHomework.description || '自定义作业内容',
              CateName: '自定义作业',
              Degree: '标准',
              Points: customHomework.knowledge || customHomework.subjectName || '通用'
            }]
          } else {
            // 如果没有具体内容，显示基本信息
            this.previewQuestions = [{
              SID: customHomeworkId,
              question: `自定义作业：${this.formatCustomHomeworkLabel(customHomework)}`,
              CateName: '自定义作业',
              Degree: '标准',
              Points: customHomework.knowledge || customHomework.subjectName || '通用'
            }]
          }
          this.previewLoading = false
        } else {
          this.$message.error('获取自定义作业详情失败')
          this.previewLoading = false
        }
      }).catch(error => {
        this.$message.error('获取自定义作业详情失败：' + error.message)
        this.previewLoading = false
      })
    },

    // 预览自定义组卷
    previewCustomPaper(customPaperId) {
      getKnowledge(customPaperId).then(response => {
        if (response.code === 200) {
          const customPaper = response.data
          // 自定义组卷通常包含文件内容或描述信息
          if (customPaper.content || customPaper.description) {
            // 如果自定义组卷有内容，直接显示
            this.previewQuestions = [{
              SID: customPaperId,
              question: customPaper.content || customPaper.description || '自定义组卷内容',
              CateName: '自定义组卷',
              Degree: '标准',
              Points: customPaper.knowledge || customPaper.subjectName || '通用'
            }]
          } else {
            // 如果没有具体内容，显示基本信息
            this.previewQuestions = [{
              SID: customPaperId,
              question: `自定义组卷：${this.formatCustomPaperLabel(customPaper)}`,
              CateName: '自定义组卷',
              Degree: '标准',
              Points: customPaper.knowledge || customPaper.subjectName || '通用'
            }]
          }
          this.previewLoading = false
        } else {
          this.$message.error('获取自定义组卷详情失败')
          this.previewLoading = false
        }
      }).catch(error => {
        this.$message.error('获取自定义组卷详情失败：' + error.message)
        this.previewLoading = false
      })
    },

    // 根据题目ID加载题目详情（直接使用 subject_name）
    loadQuestionsBySidsWithSubjectName(questionIds, subjectName) {
      if (!subjectName) {
        this.$message.error('科目名称不能为空');
        this.previewQuestions = [];
        this.previewLoading = false;
        return;
      }

      const requestData = {
        sids: questionIds,
        subject_name: subjectName
      };

      getQuestionsBySids(requestData).then(questionsResponse => {
        if (questionsResponse) {
          if (questionsResponse.code !== undefined) {
            if (questionsResponse.code === 200) {
              if (questionsResponse.data && questionsResponse.data.questions) {
                this.previewQuestions = questionsResponse.data.questions || [];
              } else {
                this.previewQuestions = questionsResponse.data || [];
              }
            } else {
              this.$message.error('获取题目数据失败：' + (questionsResponse.msg || '未知错误'));
              this.previewQuestions = [];
            }
          } else if (questionsResponse.questions) {
            this.previewQuestions = questionsResponse.questions || [];
          } else {
            this.previewQuestions = Array.isArray(questionsResponse) ? questionsResponse : [];
          }
        } else {
          this.$message.error('获取题目数据失败：响应为空');
          this.previewQuestions = [];
        }
        this.previewLoading = false;
      }).catch(error => {
        this.$message.error('获取题目详情失败：' + error.message);
        this.previewQuestions = [];
        this.previewLoading = false;
      });
    },

    // 关闭预览
    closePreview() {
      this.previewDialogVisible = false;
      this.previewResourceData = {
        id: null,
        name: '',
        type: ''
      };
      this.previewQuestions = [];
      this.previewLoading = false;
    },

    // 处理题目内容
    processQuestionContent(content) {
      if (!content) return '';
      // 先解码HTML实体，确保sub/sup等标签正确显示
      let processedContent = this.decodeHtmlEntities(content);
      // 处理数学公式 - 使用 latexRenderer 进行渲染
      processedContent = latexRenderer.renderMathFormulas(processedContent);
      // 处理bdo标签
      processedContent = this.processBdoTags(processedContent);
      // 为img标签添加max-width样式，防止图片超出边界
      processedContent = this.addImageMaxWidth(processedContent);
      // 处理可编辑答案输入区域 - 支持多种格式
      return processedContent
        .replace(
          /<!--BA--><div (?:class="quizPutTag"|class="\\quizPutTag\\") contenteditable="true">\s*(&nbsp;)?<\/div><!--EA-->/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        )
        .replace(
          /<div class='quizPutTag' contenteditable='true'>&nbsp;<\/div>/g,
          '<span class="answer-input-area" contenteditable="true" style="border-bottom: 1px solid black; display: inline-block; min-width: 100px;"></span>'
        );
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
    processBdoTags(content) {
      if (!content) return content;

      return content
        // 处理bdo标签，移除class属性但保留内容
        .replace(/<bdo[^>]*class="[^"]*"[^>]*>/g, '<bdo>')
        .replace(/<bdo[^>]*>/g, '<bdo>')
        // 处理br标签，确保正确显示
        .replace(/<br\s*\/?>/gi, '<br>')
        // 处理&nbsp;实体
        .replace(/&nbsp;/g, ' ');
    },

    // 为img标签添加max-width样式
    addImageMaxWidth(content) {
      if (!content) return content;

      return content.replace(/<img([^>]*)>/gi, (match, attributes) => {
        // 检查是否已经有style属性
        if (attributes.includes('style=')) {
          // 如果已有style属性，检查是否已有max-width
          if (attributes.includes('max-width')) {
            return match; // 如果已有max-width，直接返回
          }
          // 在现有style中添加max-width
          return match.replace(/style="([^"]*)"/, 'style="$1; max-width: 100%; height: auto;"');
        } else {
          // 如果没有style属性，添加新的style属性
          return `<img${attributes} style="max-width: 100%; height: auto;">`;
        }
      });
    },

    // 解码HTML实体
    decodeHtmlEntities(text) {
      if (!text) return '';
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    },

    // 解析选项内容
    parseOptions(options) {
      if (!options) return [];
      // 如果options是字符串，尝试解析为JSON
      if (typeof options === 'string') {
        try {
          return JSON.parse(options);
        } catch (e) {
          return [];
        }
      }
      // 如果options是数组，直接返回
      if (Array.isArray(options)) {
        return options;
      }
      return [];
    },
    /** 提交表单 */
    submitForm() {
      this.$refs["taskForm"].validate(valid => {
        if (valid) {
          // 验证必填字段
          if (!this.form.studentId) {
            this.$message.warning('请选择学生')
            return
          }
          if (!this.form.subjectCode) {
            this.$message.warning('请选择学科代码')
            return
          }
                     if (!this.form.taskType) {
             this.$message.warning('请选择任务类型')
             return
           }
           if (!this.form.taskName) {
             this.$message.warning('请输入任务名称')
             return
           }

          this.loading = true

          // 处理章节代码，存储完整路径
          let knowledgeCode = this.form.knowledgeCode
          if (Array.isArray(knowledgeCode)) {
            knowledgeCode = knowledgeCode.join('/')
          }

          // 处理任务资源，将数组转换为逗号分隔的字符串
          let taskUrl = this.form.taskUrl
          if (Array.isArray(taskUrl)) {
            taskUrl = taskUrl.join(',')
          } else if (taskUrl && typeof taskUrl === 'string') {
            // 试卷单选时，taskUrl已经是字符串，直接使用
            taskUrl = taskUrl
          }

          // 按班级分组学生
          const studentsByClass = {}
          if (this.selectedStudentIds && this.selectedStudentIds.length > 0) {
            this.selectedStudentIds.forEach(studentId => {
              const classInfo = this.studentClassMap[studentId]
              if (classInfo) {
                const classId = classInfo.classId
                if (!studentsByClass[classId]) {
                  studentsByClass[classId] = {
                    classId: classId,
                    className: classInfo.className,
                    studentIds: []
                  }
                }
                studentsByClass[classId].studentIds.push(studentId)
              } else {
                // 如果没有找到班级信息，放到一个默认分组中
                if (!studentsByClass['default']) {
                  studentsByClass['default'] = {
                    classId: 'default',
                    className: '未分组',
                    studentIds: []
                  }
                }
                studentsByClass['default'].studentIds.push(studentId)
              }
            })
          }

          // 如果没有班级分组信息，使用原来的方式（单个任务）
          const classGroups = Object.values(studentsByClass)
          if (classGroups.length === 0) {
            // 没有学生选择，使用原来的逻辑
            const formData = { ...this.form }
            if (Array.isArray(formData.knowledgeCode)) {
              formData.knowledgeCode = formData.knowledgeCode.join('/')
            }
            if (Array.isArray(formData.studentId)) {
              formData.studentId = formData.studentId.join(',')
            }
            if (Array.isArray(formData.taskUrl)) {
              formData.taskUrl = formData.taskUrl.join(',')
            } else if (formData.taskUrl && typeof formData.taskUrl === 'string') {
              formData.taskUrl = formData.taskUrl
            }

            addTask(formData).then(response => {
              this.loading = false
              this.$modal.msgSuccess("新增成功")
              this.$router.push('/task').then(() => {
                this.$store.commit('setNeedRefresh', true)
              })
            }).catch(error => {
              this.loading = false
              this.$message.error('新增失败：' + error.message)
            })
            return
          }

          // 如果有多个班级，为每个班级分别创建任务
          if (classGroups.length > 1) {
            // 多个班级，分别创建任务
            const promises = classGroups.map(classGroup => {
              // 为每个班级生成任务名称：班级名称+科目+时间+类型
              const taskName = this.generateTaskNameForClass(classGroup.className)
              const formData = {
                ...this.form,
                studentId: classGroup.studentIds.join(','),
                taskName: taskName,
                knowledgeCode: knowledgeCode,
                taskUrl: taskUrl
              }
              return addTask(formData)
            })

            Promise.all(promises).then(responses => {
              this.loading = false
              this.$modal.msgSuccess(`成功为 ${classGroups.length} 个班级创建任务`)
              this.$router.push('/task').then(() => {
                this.$store.commit('setNeedRefresh', true)
              })
            }).catch(error => {
              this.loading = false
              this.$message.error('创建任务失败：' + (error.message || '部分任务创建失败'))
            })
          } else {
            // 只有一个班级，使用原来的方式
            const classGroup = classGroups[0]
            // 为班级生成任务名称：班级名称+科目+时间+类型
            const taskName = this.generateTaskNameForClass(classGroup.className)
            const formData = {
              ...this.form,
              studentId: classGroup.studentIds.join(','),
              taskName: taskName,
              knowledgeCode: knowledgeCode,
              taskUrl: taskUrl
            }

            addTask(formData).then(response => {
              this.loading = false
              this.$modal.msgSuccess("新增成功")
              this.$router.push('/task').then(() => {
                this.$store.commit('setNeedRefresh', true)
              })
            }).catch(error => {
              this.loading = false
              this.$message.error('新增失败：' + error.message)
            })
          }
        }
      })
    },
    /** 为指定班级生成任务名称：班级名称+科目+时间+类型 */
    generateTaskNameForClass(className) {
      // 获取学科名称
      const subjectName = this.getSubjectDisplay(this.form.subjectCode) || '未知学科'

      // 获取当前日期（格式：MM.DD）
      const today = new Date()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const dateStr = `${month}.${day}`

      // 生成任务名称：班级名称+科目+日期+类型
      return className ? `${className}${subjectName}${dateStr}${this.form.taskType}` : `${subjectName}${dateStr}${this.form.taskType}`
    },
    /** 返回上一页 */
    goBack() {
      this.$router.push('/task')
    },

    /** 通用的格式化知识类资源标签显示 - 替换四个重复的方法 */
    formatKnowledgeLabel(resource, defaultName) {
      if (!resource) return defaultName || '未命名资源'

      // 优先使用 userFname，如果没有则使用 knowledge 的最后部分
      let displayName = resource.userFname

      if (!displayName && resource.knowledge) {
        // 从 knowledge 字段提取章节名称，格式如 "/middle/python/第一章:为什么做这个"
        const parts = resource.knowledge.split('/')
        if (parts.length > 0) {
          displayName = parts[parts.length - 1] // 取最后一部分作为显示名称
        }
      }

      // 如果还是没有名称，使用默认值
      if (!displayName) {
        displayName = defaultName || '未命名资源'
      }

      // 添加学科信息
      let subjectInfo = ''
      if (resource.subjectName) {
        const subjectMap = {
          'chinese': '语文',
          'math': '数学',
          'english': '英语',
          'python': 'Python',
          'middle': '初中'
        }
        subjectInfo = ` [${subjectMap[resource.subjectName] || resource.subjectName}]`
      }

      // 添加上传时间
      let timeInfo = ''
      if (resource.uploadTime) {
        timeInfo = ` (${resource.uploadTime})`
      }

      return `${displayName}${subjectInfo}${timeInfo}`
    },

    /** 格式化学案标签显示 */
    formatStudyPlanLabel(studyPlan) {
      return this.formatKnowledgeLabel(studyPlan, '未命名学案')
    },

    /** 格式化教学视频标签显示 */
    formatTeachingVideoLabel(teachingVideo) {
      return this.formatKnowledgeLabel(teachingVideo, '未命名教学视频')
    },

    /** 格式化自定义作业标签显示 */
    formatCustomHomeworkLabel(customHomework) {
      return this.formatKnowledgeLabel(customHomework, '未命名自定义作业')
    },

    /** 格式化自定义组卷标签显示 */
    formatCustomPaperLabel(customPaper) {
      return this.formatKnowledgeLabel(customPaper, '未命名自定义组卷')
    },

    /** 通用的知识类资源标签格式化方法 */
    formatKnowledgeResourceLabel(item, config) {
      if (!item || !config) {
        return '未知'
      }
      // 如果有自定义格式化方法，使用它
      if (config.formatLabel && this[config.formatLabel]) {
        return this[config.formatLabel](item)
      }
      // 否则使用默认字段
      return item[config.nameField] || '未命名'
    },

    /** 通用的获取知识类资源列表方法 - 使用 type 参数切换类型 */
    getKnowledgeResourceList(resourceType) {
      const resourceConfig = this.resourceConfigs[resourceType]
      if (!resourceConfig || !resourceConfig.typeKey) {
        console.error(`未知的资源类型或配置不完整: ${resourceType}`)
        return
      }

      // 文件用途映射
      const filePurposeMap = {
        '学案': '学案',
        '教学视频': '教学视频',
        '自定义作业': '自定义作业',
        '自定义组卷': '自定义组卷'
      }

      this[resourceConfig.loadingKey] = true
      const queryParams = this[resourceConfig.queryParamsKey]
      const params = {
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
        filePurpose: filePurposeMap[resourceType]
      }

      // 处理文件名参数：将 fileName 映射为 userFname（接口使用 userFname）
      if (queryParams.fileName) {
        params.userFname = queryParams.fileName
      }
      if (queryParams.userFname) {
        params.userFname = queryParams.userFname
      }
      if (queryParams.subject) {
        params.subjectName = queryParams.subject
      }

      // 添加科目代码参数（从表单中获取）
      // 接口使用 subjectName 作为参数名，但值应该是 subjectCode
      if (this.form.subjectCode) {
        params.subjectName = this.form.subjectCode
      }

      // 添加 type 参数（如果选择了类型）
      if (this[resourceConfig.typeKey] && this[resourceConfig.typeKey] !== '') {
        params.type = this[resourceConfig.typeKey]
      }

      listKnowledge(params).then(response => {
        if (response.code === 200) {
          this[resourceConfig.listKey] = response.rows || response.data || []
          this[resourceConfig.totalKey] = response.total || 0
        } else {
          this.$message.error(`获取${resourceType}列表失败：${response.msg}`)
          this[resourceConfig.listKey] = []
          this[resourceConfig.totalKey] = 0
        }
        this[resourceConfig.loadingKey] = false
      }).catch(error => {
        this.$message.error(`获取${resourceType}列表失败：${error.message}`)
        this[resourceConfig.listKey] = []
        this[resourceConfig.totalKey] = 0
        this[resourceConfig.loadingKey] = false
      })
    },

    /** 通用的搜索、重置、分页、切换数据源方法 */
    handleKnowledgeResourceQuery(resourceType) {
      const queryParamsKeyMap = {
        '学案': 'studyPlanQueryParams',
        '教学视频': 'teachingVideoQueryParams',
        '自定义作业': 'customHomeworkQueryParams',
        '自定义组卷': 'customPaperQueryParams'
      }
      const queryParamsKey = queryParamsKeyMap[resourceType]
      if (queryParamsKey) {
        this[queryParamsKey].pageNum = 1
        this.getKnowledgeResourceList(resourceType)
      }
    },

    resetKnowledgeResourceQuery(resourceType) {
      const resetConfig = {
        '学案': () => ({ pageNum: 1, pageSize: 8, subject: null, fileName: null }),
        '教学视频': () => ({ pageNum: 1, pageSize: 8, subject: null, fileName: null }),
        '自定义作业': () => ({ pageNum: 1, pageSize: 8, subject: null, userFname: null }),
        '自定义组卷': () => ({ pageNum: 1, pageSize: 8, subject: null, userFname: null })
      }

      const queryParamsKeyMap = {
        '学案': 'studyPlanQueryParams',
        '教学视频': 'teachingVideoQueryParams',
        '自定义作业': 'customHomeworkQueryParams',
        '自定义组卷': 'customPaperQueryParams'
      }

      if (resetConfig[resourceType] && queryParamsKeyMap[resourceType]) {
        this[queryParamsKeyMap[resourceType]] = resetConfig[resourceType]()
        this.getKnowledgeResourceList(resourceType)
      }
    },

    handleKnowledgeResourceSizeChange(resourceType, val) {
      const queryParamsKeyMap = {
        '学案': 'studyPlanQueryParams',
        '教学视频': 'teachingVideoQueryParams',
        '自定义作业': 'customHomeworkQueryParams',
        '自定义组卷': 'customPaperQueryParams'
      }
      const queryParamsKey = queryParamsKeyMap[resourceType]
      if (queryParamsKey) {
        this[queryParamsKey].pageSize = val
        this[queryParamsKey].pageNum = 1
        this.getKnowledgeResourceList(resourceType)
      }
    },

    handleKnowledgeResourceCurrentChange(resourceType, val) {
      const queryParamsKeyMap = {
        '学案': 'studyPlanQueryParams',
        '教学视频': 'teachingVideoQueryParams',
        '自定义作业': 'customHomeworkQueryParams',
        '自定义组卷': 'customPaperQueryParams'
      }
      const queryParamsKey = queryParamsKeyMap[resourceType]
      if (queryParamsKey) {
        this[queryParamsKey].pageNum = val
        this.getKnowledgeResourceList(resourceType)
      }
    },

    /** 处理类型选择变化 */
    handleKnowledgeResourceTypeSelectChange(value, resourceType) {
      const typeKeyMap = {
        '学案': 'studyPlanType',
        '教学视频': 'teachingVideoType',
        '自定义作业': 'customHomeworkType',
        '自定义组卷': 'customPaperType'
      }
      const typeKey = typeKeyMap[resourceType]
      if (typeKey) {
        this[typeKey] = value
        this.handleKnowledgeResourceTypeChange(resourceType)
      }
    },

    /** 处理类型变化 */
    handleKnowledgeResourceTypeChange(resourceType) {
      const config = {
        '学案': {
          queryParamsKey: 'studyPlanQueryParams',
          rowKey: 'currentStudyPlanRow'
        },
        '教学视频': {
          queryParamsKey: 'teachingVideoQueryParams',
          rowKey: 'currentTeachingVideoRow'
        },
        '自定义作业': {
          queryParamsKey: 'customHomeworkQueryParams',
          rowKey: 'currentCustomHomeworkRow'
        },
        '自定义组卷': {
          queryParamsKey: 'customPaperQueryParams',
          rowKey: 'currentCustomPaperRow'
        }
      }

      const resourceConfig = config[resourceType]
      if (resourceConfig) {
        this[resourceConfig.queryParamsKey].pageNum = 1
        this[resourceConfig.rowKey] = null
        if (this.form.taskType === resourceType) {
          this.form.taskUrl = null
        }
        this.getKnowledgeResourceList(resourceType)
      }
    },

    selectKnowledgeResource(resourceType, row) {
      const config = {
        '学案': { rowKey: 'currentStudyPlanRow', defaultName: '未命名学案' },
        '教学视频': { rowKey: 'currentTeachingVideoRow', defaultName: '未命名教学视频' },
        '自定义作业': { rowKey: 'currentCustomHomeworkRow', defaultName: '未命名自定义作业' },
        '自定义组卷': { rowKey: 'currentCustomPaperRow', defaultName: '未命名自定义组卷' }
      }

      const resourceConfig = config[resourceType]
      if (resourceConfig) {
        this[resourceConfig.rowKey] = row
        this.form.taskUrl = String(row.fileId)
        const label = this.formatKnowledgeLabel(row, resourceConfig.defaultName)
      }
    },

    previewKnowledgeResourceFromTable(resourceType, row) {
      // 使用 FilePreview 组件预览文件
      this.handleFilePreview(row)
    },

    /** 预览新作业/新组卷（从表格） */
    previewNewPaperHomeworkFromTable(taskType, row) {
      const type = taskType === '新组卷' ? 1 : 2
      this.previewResourceData = {
        id: row.id,
        name: row.customPaperName,
        type: taskType
      }
      this.previewDialogVisible = true
      this.previewQuestions = []
      this.previewLoading = true
      this.previewNewPaperHomework(row.id, type)
    },

    /** 预览新作业/新组卷 */
    previewNewPaperHomework(id, type) {
      getPaperAssignment(id).then(response => {
        if (response.code === 200) {
          const data = response.data
          // 根据API文档，返回的数据结构是 { main: {...}, details: [...] }
          const main = data.main || data
          const details = data.details || []
          
          // 从details中提取所有的sid作为questionIds
          const questionIds = details.map(detail => detail.sid).filter(sid => sid && sid.trim())
          
          if (questionIds && questionIds.length > 0) {
            const subjectCode = main.subjectCode
            const userId = main.creator || main.creatorId || main.userId
            
            if (subjectCode && userId) {
              // 调用 preview 接口获取 subject_name
              getPreviewSubjectName({
                SubjectCode: subjectCode,
                userId: userId
              }).then(previewResponse => {
                if (previewResponse) {
                  let subjectName = null
                  
                  if (previewResponse.data) {
                    if (typeof previewResponse.data === 'string') {
                      subjectName = previewResponse.data
                    } else if (typeof previewResponse.data === 'object') {
                      subjectName = previewResponse.data.subjectName || 
                                   previewResponse.data.subject_name ||
                                   previewResponse.data
                    }
                  } else if (previewResponse.subjectName) {
                    subjectName = previewResponse.subjectName
                  } else if (previewResponse.subject_name) {
                    subjectName = previewResponse.subject_name
                  }
                  
                  if (subjectName) {
                    // 如果返回的是科目代码（如 "math"），需要转换为科目名称（如 "高中数学"）
                    const matchedSubject = this.subjectOptions.find(item => item.subjectCode === subjectName)
                    if (matchedSubject) {
                      // 是科目代码，转换为科目名称
                      subjectName = matchedSubject.subjectName
                    } else {
                      // 检查是否已经是科目名称（在 subjectOptions 的 subjectName 中能找到）
                      const isSubjectName = this.subjectOptions.some(item => item.subjectName === subjectName)
                      if (!isSubjectName) {
                        // 既不是代码也不是名称，尝试使用 getSubjectDisplay 转换
                        const displayName = this.getSubjectDisplay(subjectName)
                        if (displayName && displayName !== subjectName) {
                          subjectName = displayName
                        }
                      }
                    }
                    this.loadQuestionsBySidsWithSubjectName(questionIds, subjectName)
                  } else {
                    const fallbackSubjectName = this.getSubjectDisplay(subjectCode) || subjectCode
                    this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
                  }
                } else {
                  const fallbackSubjectName = this.getSubjectDisplay(subjectCode) || subjectCode
                  this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
                }
              }).catch(error => {
                console.warn('调用 preview 接口失败：', error)
                const fallbackSubjectName = this.getSubjectDisplay(subjectCode) || subjectCode
                this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
              })
            } else {
              // 如果没有 creator 或 subject，使用 subjectCode 转换为科目名称作为降级方案
              const fallbackSubjectName = this.getSubjectDisplay(main.subjectCode || subjectCode) || main.subjectCode || subjectCode
              this.loadQuestionsBySidsWithSubjectName(questionIds, fallbackSubjectName)
            }
          } else {
            this.previewQuestions = []
            this.previewLoading = false
          }
        } else {
          this.$message.error(`获取${type === 1 ? '新组卷' : '新作业'}详情失败`)
          this.previewLoading = false
        }
      }).catch(error => {
        this.$message.error(`获取${type === 1 ? '新组卷' : '新作业'}详情失败：${error.message}`)
        this.previewLoading = false
      })
    },


    /** 重置表单 */
    resetForm() {
      // 重置表单数据
      // 设置默认结束时间为当前时间后一天
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      this.form = {
        taskId: null,
        studentId: null,
        subjectCode: null,
        knowledgeCode: [],
        taskName: this.nickName ? `${this.nickName}的任务` : '新任务',
        taskUrl: null, // 试卷单选，初始为null
        startTime: new Date().toISOString().split('T')[0],
        endTime: tomorrow.toISOString().split('T')[0],
        currentProgress: null,
        goal: null,
        taskDesc: null,
        taskType: '试卷',
        teacherId: null,
        userFname: null
      }

      // 重置学生选择
      this.selectedStudentIds = []
      this.selectedStudentLabels = []

      // 重置资源选择
      this.form.taskUrl = null

      // 重置表单验证
      this.$nextTick(() => {
        if (this.$refs.taskForm) {
          this.$refs.taskForm.clearValidate()
        }
      })

      // 重新加载选项数据
      this.loadPaperOptions()
      this.loadHomeworkOptions()
      // 初始化知识类资源选项
      ['学案', '教学视频', '自定义作业', '自定义组卷'].forEach(type => {
        this.initKnowledgeResourceOptions(type)
      })
    }
  }
}
</script>

<style scoped>
/* 全局容器样式，防止超出视口 */
.task-container {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.task-builder {
  display: flex;
  /* height: calc(100vh - 335px); */
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.left-panel {
  width: 400px;
  flex-shrink: 0;
}

.right-panel {
  flex: 1;
  min-width: 500px;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #66B3FF 0%, #99CCFF 100%);
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
}

.info-form {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.info-form .el-form-item {
  margin-bottom: 20px;
}

.resource-section {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.source-switch {
  display: flex;
  align-items: center;
}

.source-switch .el-radio-group {
  margin-left: 10px;
}

.section-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 15px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.resource-select {
  margin-bottom: 15px;
}

.question-list {
  overflow-y: auto;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.3s;
  cursor: pointer;
}

.question-item:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.question-item.selected {
  border-color: #409eff;
  background: #f0f9ff;
}

.question-content {
  padding: 15px;
}

.question-text {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #303133;
  font-size: 14px;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.question-info {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.question-type {
  background: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
}

.question-difficulty {
  color: #909399;
}

.question-label {
  background: #f0f9ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid #d1e7ff;
}



.option-preview {
  margin-bottom: 5px;
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  color: #606266;
}

.option-preview .option-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 5px;
  min-width: 15px;
  display: inline-block;
}

.option-preview .option-content {
  flex: 1;
  line-height: 1.4;
}

.question-answer {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid #b7eb8f;
}

.question-knowledge {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid #ffd591;
}

.question-actions {
  padding: 10px 15px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
}

.selected-resources {
  padding: 20px;
}

.selected-list {
  max-height: 300px;
  overflow-y: auto;
}

.selected-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fff;
  transition: all 0.3s;
}

.selected-item:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

.selected-content {
  padding: 12px 15px;
}

.selected-text {
  margin-bottom: 5px;
  line-height: 1.5;
  color: #303133;
  font-size: 14px;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.selected-type {
  font-size: 12px;
  color: #909399;
}

.selected-actions {
  padding: 8px 15px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
}

.no-task-type {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #909399;
}

.bottom-actions {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  gap: 15px;
}

.analysis-content {
  max-height: 500px;
  overflow-y: auto;
}

.question-section,
.answer-section,
.knowledge-section {
  margin-bottom: 20px;
}

.question-section h4,
.answer-section h4,
.knowledge-section h4 {
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
}

.options-section h5 {
  margin: 10px 0 5px 0;
  color: #606266;
  font-size: 14px;
}

.option-item {
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: flex-start;
}

.option-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
  display: inline-block;
}

.option-content {
  flex: 1;
}

.answer-tag {
  display: inline-block;
  background: #67c23a;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
  font-size: 12px;
}

.question-label {
  display: inline-block;
  background: #f0f9ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  border: 1px solid #d1e7ff;
}

/* 滚动条样式 */
.question-list::-webkit-scrollbar,
.selected-list::-webkit-scrollbar,
.info-form::-webkit-scrollbar {
  width: 6px;
}

.question-list::-webkit-scrollbar-thumb,
.selected-list::-webkit-scrollbar-thumb,
.info-form::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.question-list::-webkit-scrollbar-track,
.selected-list::-webkit-scrollbar-track,
.info-form::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 预览弹窗样式 */
.preview-content {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resource-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.resource-type {
  background: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.question-count {
  font-size: 14px;
  color: #909399;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.preview-no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 15px;
  min-height: auto;
  overflow: visible;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.question-number {
  font-weight: bold;
  color: #409eff;
  min-width: 30px;
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
  overflow: visible;
  min-height: auto;
}

.question-text {
  margin-bottom: 10px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.preview-question-text {
  margin-bottom: 10px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  /* 确保预览对话框中的题目文本不被截断 */
  max-height: none;
  overflow: visible;
  text-overflow: unset;
  display: block;
  -webkit-line-clamp: unset;
  -webkit-box-orient: unset;
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
  overflow: visible;
  min-height: auto;
}

.option-item {
  display: flex;
  margin: 5px 0;
  align-items: flex-start;
  min-height: auto;
  overflow: visible;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 20px;
}

.option-content {
  flex: 1;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.question-info {
  margin-top: 10px;
  padding: 8px;
  background: #f0f9ff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: visible;
  min-height: auto;
}

.info-item {
  font-size: 13px;
  color: #606266;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.answer-input-area {
  border-bottom: 1px solid black;
  display: inline-block;
  min-width: 100px;
}

/* 能力等级筛选样式 */
.ability-filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #303133;
}

.filter-label i {
  margin-right: 8px;
  color: #409eff;
  font-size: 16px;
}

.filter-tip {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.filter-tip i {
  margin-right: 4px;
  font-size: 14px;
}

.student-tree-section {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-students {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* 资源筛选样式 */
.resource-filter {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.resource-filter .el-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.resource-filter .el-form-item {
  margin-bottom: 0px;
  display: flex;
  align-items: center;
}

/* 资源表格样式 */
.resource-table {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.resource-table .el-table {
  border: none;
}

.resource-table .el-table th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.resource-table .el-table tr:hover {
  background: #f0f9ff;
}

.resource-table .el-table .current-row {
  background: #e6f7ff !important;
}

/* 分页容器样式 */
.pagination-container {
  padding: 15px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.pagination-container .el-pagination {
  justify-content: center;
}

/* 资源卡片样式 */
.resource-cards-container {
  margin-top: 15px;
}

.resource-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  min-height: 200px;
  box-sizing: border-box;
  width: 100%;
}

.resource-card {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 100%;
}

.resource-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.resource-card.selected {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.resource-card.selected::before {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resource-card.selected::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 试卷图标特殊样式 */
.card-icon.document-icon {
  background: linear-gradient(135deg, #409eff, #67c23a);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 作业图标特殊样式 */
.card-icon.homework-icon {
  background: linear-gradient(135deg, #e6a23c, #f56c6c);
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

/* 学案图标特殊样式 */
.card-icon.study-plan-icon {
  background: linear-gradient(135deg, #9c27b0, #e91e63);
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
}

/* 教学视频图标特殊样式 */
.card-icon.teaching-video-icon {
  background: linear-gradient(135deg, #ff5722, #ff9800);
  box-shadow: 0 2px 8px rgba(255, 87, 34, 0.3);
}

/* 自定义作业图标特殊样式 */
.card-icon.custom-homework-icon {
  background: linear-gradient(135deg, #795548, #607d8b);
  box-shadow: 0 2px 8px rgba(121, 85, 72, 0.3);
}

/* 自定义组卷图标特殊样式 */
.card-icon.custom-paper-icon {
  background: linear-gradient(135deg, #3f51b5, #2196f3);
  box-shadow: 0 2px 8px rgba(63, 81, 181, 0.3);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.info-item i {
  color: #909399;
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.info-item span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-actions .el-button {
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.card-actions .el-button:hover {
  background: #409eff;
  color: white;
}

/* 内联已选资源样式 */
.selected-resources-inline {
  line-height: 16px;
  margin-left: auto;
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.selected-resources-inline-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-label {
  font-size: 16px;
  color: #606266;
  font-weight: 700;
  white-space: nowrap;
}

.selected-cards-inline {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.selected-card-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  background: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  max-width: 300px;
}

.selected-card-inline:hover {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

/* 试卷已选资源样式 */
.selected-card-inline[data-type="试卷"] {
  background: #f0f9ff;
  border: 1px solid #409eff;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.2);
}

.selected-card-inline[data-type="试卷"]:hover {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.selected-card-inline[data-type="试卷"] .selected-card-type-inline {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

/* 作业已选资源样式 */
.selected-card-inline[data-type="作业"] {
  background: #fef7e6;
  border: 1px solid #e6a23c;
  box-shadow: 0 1px 4px rgba(230, 162, 60, 0.2);
}

.selected-card-inline[data-type="作业"]:hover {
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

.selected-card-inline[data-type="作业"] .selected-card-type-inline {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

/* 学案已选资源样式 */
.selected-card-inline[data-type="学案"] {
  background: #f3e5f5;
  border: 1px solid #9c27b0;
  box-shadow: 0 1px 4px rgba(156, 39, 176, 0.2);
}

.selected-card-inline[data-type="学案"]:hover {
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
}

.selected-card-inline[data-type="学案"] .selected-card-type-inline {
  color: #9c27b0;
  background: rgba(156, 39, 176, 0.1);
}

/* 教学视频已选资源样式 */
.selected-card-inline[data-type="教学视频"] {
  background: #fff3e0;
  border: 1px solid #ff5722;
  box-shadow: 0 1px 4px rgba(255, 87, 34, 0.2);
}

.selected-card-inline[data-type="教学视频"]:hover {
  box-shadow: 0 2px 8px rgba(255, 87, 34, 0.3);
}

.selected-card-inline[data-type="教学视频"] .selected-card-type-inline {
  color: #ff5722;
  background: rgba(255, 87, 34, 0.1);
}

/* 自定义作业已选资源样式 */
.selected-card-inline[data-type="自定义作业"] {
  background: #f5f5f5;
  border: 1px solid #795548;
  box-shadow: 0 1px 4px rgba(121, 85, 72, 0.2);
}

.selected-card-inline[data-type="自定义作业"]:hover {
  box-shadow: 0 2px 8px rgba(121, 85, 72, 0.3);
}

.selected-card-inline[data-type="自定义作业"] .selected-card-type-inline {
  color: #795548;
  background: rgba(121, 85, 72, 0.1);
}

/* 自定义组卷已选资源样式 */
.selected-card-inline[data-type="自定义组卷"] {
  background: #e8eaf6;
  border: 1px solid #3f51b5;
  box-shadow: 0 1px 4px rgba(63, 81, 181, 0.2);
}

.selected-card-inline[data-type="自定义组卷"]:hover {
  box-shadow: 0 2px 8px rgba(63, 81, 181, 0.3);
}

.selected-card-inline[data-type="自定义组卷"] .selected-card-type-inline {
  color: #3f51b5;
  background: rgba(63, 81, 181, 0.1);
}

.selected-card-icon-inline {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 试卷图标样式 */
.selected-card-inline[data-type="试卷"] .selected-card-icon-inline {
  background: linear-gradient(135deg, #409eff, #67c23a);
}

/* 作业图标样式 */
.selected-card-inline[data-type="作业"] .selected-card-icon-inline {
  background: linear-gradient(135deg, #e6a23c, #f56c6c);
}

/* 学案图标样式 */
.selected-card-inline[data-type="学案"] .selected-card-icon-inline {
  background: linear-gradient(135deg, #9c27b0, #e91e63);
}

/* 教学视频图标样式 */
.selected-card-inline[data-type="教学视频"] .selected-card-icon-inline {
  background: linear-gradient(135deg, #ff5722, #ff9800);
}

/* 自定义作业图标样式 */
.selected-card-inline[data-type="自定义作业"] .selected-card-icon-inline {
  background: linear-gradient(135deg, #795548, #607d8b);
}

/* 自定义组卷图标样式 */
.selected-card-inline[data-type="自定义组卷"] .selected-card-icon-inline {
  background: linear-gradient(135deg, #3f51b5, #2196f3);
}

.selected-card-content-inline {
  line-height: 16px;
  flex: 1;
  min-width: 0;
  max-width: 100px;
}

.selected-card-title-inline {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-card-type-inline {
  font-size: 10px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 1px 4px;
  border-radius: 2px;
  display: inline-block;
}

.selected-card-actions-inline {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.selected-card-actions-inline .el-button {
  padding: 4px;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.selected-card-actions-inline .el-button:hover {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .resource-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .resource-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-builder {
    flex-direction: column;
    gap: 15px;
  }

  .left-panel {
    width: 100%;
    min-width: auto;
  }

  .right-panel {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .task-builder {
    flex-direction: column;
    gap: 10px;
    padding: 0 10px;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    min-width: auto;
  }

  .panel-header {
    padding: 15px;
  }

  .panel-header h3 {
    font-size: 16px;
  }

  .info-form {
    padding: 15px;
  }

  .resource-section {
    padding: 15px;
  }

  .section-title {
    font-size: 14px;
  }

  .resource-cards {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }

  .resource-card {
    padding: 12px;
    flex-direction: column;
    text-align: center;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin: 0 auto 8px auto;
  }

  .card-title {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .card-info {
    gap: 6px;
  }

  .info-item {
    font-size: 12px;
    justify-content: center;
  }

  .card-actions {
    margin-top: 8px;
  }

  .resource-filter {
    padding: 10px;
  }

  .resource-filter .el-form {
    flex-direction: column;
    align-items: stretch;
  }

  .resource-filter .el-form-item {
    margin-bottom: 8px;
    width: 100%;
  }

  .resource-filter .el-form-item .el-select,
  .resource-filter .el-form-item .el-input {
    width: 100%;
  }

  .selected-resources-inline {
    margin-left: 0;
    margin-top: 10px;
    flex: none;
    justify-content: flex-start;
  }

  .selected-resources-inline-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .selected-cards-inline {
    width: 100%;
    justify-content: flex-start;
  }

  .selected-card-inline {
    max-width: 100%;
    width: 100%;
  }

  .pagination-container {
    padding: 10px;
  }

  .pagination-container .el-pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .bottom-actions {
    padding: 15px;
    flex-direction: column;
    gap: 10px;
  }

  .bottom-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 15px;
    margin-bottom: 15px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .task-builder {
    padding: 0 5px;
  }

  .left-panel,
  .right-panel {
    border-radius: 6px;
  }

  .panel-header {
    padding: 12px;
  }

  .info-form {
    padding: 12px;
  }

  .resource-section {
    padding: 12px;
  }

  .resource-cards {
    padding: 8px;
    gap: 8px;
  }

  .resource-card {
    padding: 10px;
  }

  .card-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .card-title {
    font-size: 13px;
  }

  .info-item {
    font-size: 11px;
  }

  .resource-filter {
    padding: 8px;
  }

  .section-tip {
    font-size: 11px;
    padding: 6px 10px;
  }

  .pagination-container {
    padding: 8px;
  }

  .bottom-actions {
    padding: 12px;
  }
}

/* 已选资源卡片样式 */
.selected-resources {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.selected-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
}

.selected-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 2px solid #409eff;
  border-radius: 8px;
  min-width: 280px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.selected-card:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

.selected-card-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.selected-card-content {
  flex: 1;
  min-width: 0;
}

.selected-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-card-type {
  font-size: 12px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.selected-card-actions {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
}

.selected-card-actions .el-button {
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.selected-card-actions .el-button:hover {
  transform: scale(1.1);
}

/* 响应式设计 - 已选资源 */
@media (max-width: 768px) {
  .selected-resources {
    padding: 15px;
    margin-top: 15px;
  }

  .selected-cards {
    flex-direction: column;
    gap: 10px;
  }

  .selected-card {
    min-width: auto;
    width: 100%;
    padding: 10px 12px;
  }

  .selected-card-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .selected-card-title {
    font-size: 13px;
  }

  .selected-card-type {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .selected-resources {
    padding: 12px;
    margin-top: 12px;
  }

  .selected-card {
    padding: 8px 10px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .selected-card-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
    margin: 0 auto;
  }

  .selected-card-content {
    text-align: center;
  }

  .selected-card-title {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .selected-card-type {
    font-size: 10px;
  }

  .selected-card-actions {
    justify-content: center;
  }
}

/* 未选择章节时的样式 */
.no-chapter-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
</style>
