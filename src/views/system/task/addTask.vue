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

        <!-- 试卷资源选择 -->
        <div v-if="form.taskType === '试卷'" class="resource-section">
          <div class="section-title">选择试卷 ({{ paperTotal }}个可用)</div>
          <div class="section-tip">请点击选择要分配给学生的试卷</div>

          <!-- 试卷搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="paperQueryParams" :inline="true" size="small">
              <el-form-item label="试卷名称">
                <el-input
                  v-model="paperQueryParams.customPaperName"
                  placeholder="请输入试卷名称"
                  clearable
                  @keyup.enter.native="handlePaperQuery"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handlePaperQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetPaperQuery">重置</el-button>
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
                        <i class="el-icon-document"></i>
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

          <!-- 试卷卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="paperLoading" class="resource-cards">
              <div
                v-for="paper in paperList"
                :key="paper.id"
                class="resource-card"
                :class="{ 'selected': currentPaperRow && currentPaperRow.id === paper.id }"
                @click="selectPaper(paper)"
              >
                <div class="card-icon">
                  <i class="el-icon-document"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ paper.customPaperName }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(paper.subject) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ getCreatorName(paper.creator) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(paper.createTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewPaperFromTable(paper)"
                    title="预览试卷"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 试卷分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handlePaperSizeChange"
                @current-change="handlePaperCurrentChange"
                :current-page="paperQueryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="paperQueryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="paperTotal"
              />
            </div>
          </div>
        </div>

        <!-- 作业资源选择 -->
        <div v-if="form.taskType === '作业'" class="resource-section">
          <div class="section-title">选择作业 ({{ homeworkTotal }}个可用)</div>
          <div class="section-tip">请点击选择要分配给学生的作业</div>

          <!-- 作业搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="homeworkQueryParams" :inline="true" size="small">
              <el-form-item label="作业名称">
                <el-input
                  v-model="homeworkQueryParams.customPaperName"
                  placeholder="请输入作业名称"
                  clearable
                  @keyup.enter.native="handleHomeworkQuery"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleHomeworkQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetHomeworkQuery">重置</el-button>
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
                        <i class="el-icon-edit-outline"></i>
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

          <!-- 作业卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="homeworkLoading" class="resource-cards">
              <div
                v-for="homework in homeworkList"
                :key="homework.id"
                class="resource-card"
                :class="{ 'selected': currentHomeworkRow && currentHomeworkRow.id === homework.id }"
                @click="selectHomework(homework)"
              >
                <div class="card-icon homework-icon">
                  <i class="el-icon-edit-outline"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ homework.customPaperName }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(homework.subject) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ getCreatorName(homework.creator) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(homework.createTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewHomeworkFromTable(homework)"
                    title="预览作业"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 作业分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleHomeworkSizeChange"
                @current-change="handleHomeworkCurrentChange"
                :current-page="homeworkQueryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="homeworkQueryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="homeworkTotal"
              />
            </div>
          </div>
        </div>

        <!-- 学案资源选择 -->
        <div v-if="form.taskType === '学案'" class="resource-section">
          <div class="section-title">
            <span>选择学案 ({{ studyPlanTotal }}个可用)</span>
            <div class="source-switch">
              <el-radio-group v-model="studyPlanSourceType" size="small" @change="switchStudyPlanSource">
                <el-radio-button label="resourceList">资源列表</el-radio-button>
                <el-radio-button label="schoolBased">校本资源库</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="section-tip">请选择要分配给学生的学案</div>

          <!-- 学案搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="studyPlanQueryParams" :inline="true" size="small">
              <el-form-item label="学案名称">
                <el-input
                  v-model="studyPlanQueryParams.fileName"
                  placeholder="请输入学案名称"
                  clearable
                  @keyup.enter.native="handleStudyPlanQuery"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleStudyPlanQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetStudyPlanQuery">重置</el-button>
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
                        <i class="el-icon-folder-opened"></i>
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

          <!-- 学案卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="studyPlanLoading" class="resource-cards">
              <div
                v-for="studyPlan in studyPlanList"
                :key="studyPlan.fileId"
                class="resource-card"
                :class="{ 'selected': currentStudyPlanRow && currentStudyPlanRow.fileId === studyPlan.fileId }"
                @click="selectStudyPlan(studyPlan)"
              >
                <div class="card-icon study-plan-icon">
                  <i class="el-icon-folder-opened"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ formatStudyPlanLabel(studyPlan) }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(studyPlan.subjectName) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ studyPlan.creator || '未知' }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(studyPlan.uploadTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewStudyPlanFromTable(studyPlan)"
                    title="预览学案"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 学案分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleStudyPlanSizeChange"
                @current-change="handleStudyPlanCurrentChange"
                :current-page="studyPlanQueryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="studyPlanQueryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="studyPlanTotal"
              />
            </div>
          </div>
        </div>

        <!-- 教学视频资源选择 -->
        <div v-if="form.taskType === '教学视频'" class="resource-section">
          <div class="section-title">
            <span>选择教学视频 ({{ teachingVideoTotal }}个可用)</span>
            <div class="source-switch">
              <el-radio-group v-model="teachingVideoSourceType" size="small" @change="switchTeachingVideoSource">
                <el-radio-button label="resourceList">资源列表</el-radio-button>
                <el-radio-button label="schoolBased">校本资源库</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="section-tip">请选择要分配给学生的教学视频</div>

          <!-- 教学视频搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="teachingVideoQueryParams" :inline="true" size="small">
              <el-form-item label="视频名称">
                <el-input
                  v-model="teachingVideoQueryParams.fileName"
                  placeholder="请输入视频名称"
                  clearable
                  @keyup.enter.native="handleTeachingVideoQuery"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleTeachingVideoQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetTeachingVideoQuery">重置</el-button>
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
                        <i class="el-icon-video-play"></i>
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

          <!-- 教学视频卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="teachingVideoLoading" class="resource-cards">
              <div
                v-for="teachingVideo in teachingVideoList"
                :key="teachingVideo.fileId"
                class="resource-card"
                :class="{ 'selected': currentTeachingVideoRow && currentTeachingVideoRow.fileId === teachingVideo.fileId }"
                @click="selectTeachingVideo(teachingVideo)"
              >
                <div class="card-icon teaching-video-icon">
                  <i class="el-icon-video-play"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ formatTeachingVideoLabel(teachingVideo) }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(teachingVideo.subjectName) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ teachingVideo.creator || '未知' }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(teachingVideo.uploadTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewTeachingVideoFromTable(teachingVideo)"
                    title="预览视频"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 教学视频分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleTeachingVideoSizeChange"
                @current-change="handleTeachingVideoCurrentChange"
                :current-page="teachingVideoQueryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="teachingVideoQueryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="teachingVideoTotal"
              />
            </div>
          </div>
        </div>

        <!-- 自定义作业资源选择 -->
        <div v-if="form.taskType === '自定义作业'" class="resource-section">
          <div class="section-title">
            <span>选择自定义作业 ({{ customHomeworkTotal }}个可用)</span>
            <div class="source-switch">
              <el-radio-group v-model="customHomeworkSourceType" size="small" @change="switchCustomHomeworkSource">
                <el-radio-button label="resourceList">资源列表</el-radio-button>
                <el-radio-button label="schoolBased">校本资源库</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="section-tip">请选择要分配给学生的自定义作业</div>

          <!-- 自定义作业搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="customHomeworkQueryParams" :inline="true" size="small">
              <el-form-item label="作业名称">
                <el-input
                  v-model="customHomeworkQueryParams.userFname"
                  placeholder="请输入作业名称"
                  clearable
                  @keyup.enter.native="handleCustomHomeworkQuery"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleCustomHomeworkQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetCustomHomeworkQuery">重置</el-button>
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
                        <i class="el-icon-edit"></i>
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

          <!-- 自定义作业卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="customHomeworkLoading" class="resource-cards">
              <div
                v-for="customHomework in customHomeworkList"
                :key="customHomework.fileId"
                class="resource-card"
                :class="{ 'selected': currentCustomHomeworkRow && currentCustomHomeworkRow.fileId === customHomework.fileId }"
                @click="selectCustomHomework(customHomework)"
              >
                <div class="card-icon custom-homework-icon">
                  <i class="el-icon-edit"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ formatCustomHomeworkLabel(customHomework) }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(customHomework.subjectName) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ customHomework.creator || '未知' }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(customHomework.uploadTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewCustomHomeworkFromTable(customHomework)"
                    title="预览作业"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 自定义作业分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleCustomHomeworkSizeChange"
                @current-change="handleCustomHomeworkCurrentChange"
                :current-page="customHomeworkQueryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="customHomeworkQueryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="customHomeworkTotal"
              />
            </div>
          </div>
        </div>

        <!-- 自定义组卷资源选择 -->
        <div v-if="form.taskType === '自定义组卷'" class="resource-section">
          <div class="section-title">
            <span>选择自定义组卷 ({{ customPaperTotal }}个可用)</span>
            <div class="source-switch">
              <el-radio-group v-model="customPaperSourceType" size="small" @change="switchCustomPaperSource">
                <el-radio-button label="resourceList">资源列表</el-radio-button>
                <el-radio-button label="schoolBased">校本资源库</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="section-tip">请选择要分配给学生的自定义组卷</div>

          <!-- 自定义组卷搜索筛选 -->
          <div class="resource-filter">
            <el-form :model="customPaperQueryParams" :inline="true" size="small">
              <el-form-item label="组卷名称">
                <el-input
                  v-model="customPaperQueryParams.userFname"
                  placeholder="请输入组卷名称"
                  clearable
                  @keyup.enter.native="handleCustomPaperQuery"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleCustomPaperQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetCustomPaperQuery">重置</el-button>
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
                        <i class="el-icon-document-copy"></i>
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

          <!-- 自定义组卷卡片列表 -->
          <div class="resource-cards-container">
            <div v-loading="customPaperLoading" class="resource-cards">
              <div
                v-for="customPaper in customPaperList"
                :key="customPaper.fileId"
                class="resource-card"
                :class="{ 'selected': currentCustomPaperRow && currentCustomPaperRow.fileId === customPaper.fileId }"
                @click="selectCustomPaper(customPaper)"
              >
                <div class="card-icon custom-paper-icon">
                  <i class="el-icon-document-copy"></i>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ formatCustomPaperLabel(customPaper) }}</div>
                  <div class="card-info">
                    <div class="info-item">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ getSubjectDisplay(customPaper.subjectName) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-user"></i>
                      <span>{{ customPaper.creator || '未知' }}</span>
                    </div>
                    <div class="info-item">
                      <i class="el-icon-time"></i>
                      <span>{{ parseTime(customPaper.uploadTime, '{y}-{m}-{d}') }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click.stop="previewCustomPaperFromTable(customPaper)"
                    title="预览组卷"
                  ></el-button>
                </div>
              </div>
            </div>

            <!-- 自定义组卷分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleCustomPaperSizeChange"
                @current-change="handleCustomPaperCurrentChange"
                :current-page="customPaperQueryParams.pageNum"
                :page-sizes="[8, 16, 32, 64]"
                :page-size="customPaperQueryParams.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="customPaperTotal"
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
import { listPaper, getPaper, getQuestionsBySids, getSubjectName } from "@/api/system/paper"
import { listTable, getTable } from "@/api/system/table"
import { listKnowledge, getKnowledge, getSchoolBasedList } from "@/api/system/knowledge"
import { mapGetters } from 'vuex'
import latexRenderer from "@/utils/latexRenderer"
import request from "@/utils/request"
import { getUserInfo } from "@/api/system/teacher"
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
        startTime: null,
        endTime: null,
        currentProgress: null,
        goal: null,
        taskDesc: null,
        taskType: null,
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
      // 学案数据源类型：'resourceList' 资源列表, 'schoolBased' 校本资源库
      studyPlanSourceType: 'resourceList',

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
      // 教学视频数据源类型：'resourceList' 资源列表, 'schoolBased' 校本资源库
      teachingVideoSourceType: 'resourceList',

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
      // 自定义作业数据源类型：'resourceList' 资源列表, 'schoolBased' 校本资源库
      customHomeworkSourceType: 'resourceList',

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
      // 自定义组卷数据源类型：'resourceList' 资源列表, 'schoolBased' 校本资源库
      customPaperSourceType: 'resourceList',

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
          sourceTypeKey: 'studyPlanSourceType',
          loadMethod: 'getStudyPlanList',
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
          sourceTypeKey: 'teachingVideoSourceType',
          loadMethod: 'getTeachingVideoList',
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
          sourceTypeKey: 'customHomeworkSourceType',
          loadMethod: 'getCustomHomeworkList',
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
          sourceTypeKey: 'customPaperSourceType',
          loadMethod: 'getCustomPaperList',
          idField: 'fileId',
          nameField: 'userFname',
          formatLabel: 'formatCustomPaperLabel',
          iconClass: 'el-icon-document-copy'
        }
      }
    }
  },
     created() {
     this.getSubjectOptions()
     this.loadChapterList()
     this.loadUserList()
     this.loadStudentTree()
     this.loadPaperOptions()
     this.loadHomeworkOptions()
     this.loadStudyPlanOptions()
     this.loadTeachingVideoOptions()
     this.loadCustomHomeworkOptions()
     this.loadCustomPaperOptions()
      // 任务名称将在教师信息加载完成后自动生成
     // 设置默认开始时间为今天
     this.form.startTime = new Date().toISOString().split('T')[0]
     // 设置默认结束时间为当前时间后一天
     const tomorrow = new Date()
     tomorrow.setDate(tomorrow.getDate() + 1)
     this.form.endTime = tomorrow.toISOString().split('T')[0]
     // 设置默认任务类型为试卷
     this.form.taskType = '试卷'
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
        console.log(this.paperQueryParams)
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
         /** 加载学案选项 */
     loadStudyPlanOptions() {
       // 学案选项初始为空，等待用户选择任务类型后再加载
       this.studyPlanOptions = []
       this.studyPlanList = []
       this.studyPlanTotal = 0
     },

     /** 获取学案列表（分页） */
     getStudyPlanList() {
       return this.getKnowledgeResourceList('学案')
     },

     /** 学案搜索 */
     handleStudyPlanQuery() {
       return this.handleKnowledgeResourceQuery('学案')
     },

     /** 重置学案搜索 */
     resetStudyPlanQuery() {
       return this.resetKnowledgeResourceQuery('学案')
     },

     /** 学案分页大小变化 */
     handleStudyPlanSizeChange(val) {
       return this.handleKnowledgeResourceSizeChange('学案', val)
     },

     /** 学案当前页变化 */
     handleStudyPlanCurrentChange(val) {
      return this.handleKnowledgeResourceCurrentChange('学案', val)
     },

     /** 选择学案 */
     selectStudyPlan(row) {
       return this.selectKnowledgeResource('学案', row)
     },

     /** 预览学案 */
     previewStudyPlanFromTable(row) {
       return this.previewKnowledgeResourceFromTable('学案', row)
     },

     /** 加载教学视频选项 */
     loadTeachingVideoOptions() {
       // 教学视频选项初始为空，等待用户选择任务类型后再加载
       this.teachingVideoOptions = []
       this.teachingVideoList = []
       this.teachingVideoTotal = 0
     },

     /** 获取教学视频列表（分页） */
     getTeachingVideoList() {
       return this.getKnowledgeResourceList('教学视频')
     },

     /** 教学视频搜索 */
     handleTeachingVideoQuery() {
       return this.handleKnowledgeResourceQuery('教学视频')
     },

     /** 重置教学视频搜索 */
     resetTeachingVideoQuery() {
       return this.resetKnowledgeResourceQuery('教学视频')
     },

     /** 教学视频分页大小变化 */
     handleTeachingVideoSizeChange(val) {
       return this.handleKnowledgeResourceSizeChange('教学视频', val)
     },

     /** 教学视频当前页变化 */
     handleTeachingVideoCurrentChange(val) {
      return this.handleKnowledgeResourceCurrentChange('教学视频', val)
     },

     /** 选择教学视频 */
     selectTeachingVideo(row) {
       return this.selectKnowledgeResource('教学视频', row)
     },

     /** 预览教学视频 */
     previewTeachingVideoFromTable(row) {
       return this.previewKnowledgeResourceFromTable('教学视频', row)
     },

     /** 加载自定义作业选项 */
     loadCustomHomeworkOptions() {
       // 自定义作业选项初始为空，等待用户选择任务类型后再加载
       this.customHomeworkOptions = []
       this.customHomeworkList = []
       this.customHomeworkTotal = 0
     },

     /** 获取自定义作业列表（分页） */
     getCustomHomeworkList() {
      return this.getKnowledgeResourceList('自定义作业')
     },

     /** 自定义作业搜索 */
     handleCustomHomeworkQuery() {
      return this.handleKnowledgeResourceQuery('自定义作业')
     },

     /** 重置自定义作业搜索 */
     resetCustomHomeworkQuery() {
       return this.resetKnowledgeResourceQuery('自定义作业')
     },

     /** 自定义作业分页大小变化 */
     handleCustomHomeworkSizeChange(val) {
      return this.handleKnowledgeResourceSizeChange('自定义作业', val)
     },

     /** 自定义作业当前页变化 */
     handleCustomHomeworkCurrentChange(val) {
      return this.handleKnowledgeResourceCurrentChange('自定义作业', val)
     },

     /** 选择自定义作业 */
     selectCustomHomework(row) {
       return this.selectKnowledgeResource('自定义作业', row)
     },

     /** 预览自定义作业 */
     previewCustomHomeworkFromTable(row) {
       return this.previewKnowledgeResourceFromTable('自定义作业', row)
     },

     /** 加载自定义组卷选项 */
     loadCustomPaperOptions() {
       // 自定义组卷选项初始为空，等待用户选择任务类型后再加载
       this.customPaperOptions = []
       this.customPaperList = []
       this.customPaperTotal = 0
     },

     /** 获取自定义组卷列表（分页） */
     getCustomPaperList() {
       return this.getKnowledgeResourceList('自定义组卷')
     },

     /** 自定义组卷搜索 */
     handleCustomPaperQuery() {
       return this.handleKnowledgeResourceQuery('自定义组卷')
     },

     /** 重置自定义组卷搜索 */
     resetCustomPaperQuery() {
       return this.resetKnowledgeResourceQuery('自定义组卷')
     },

     /** 自定义组卷分页大小变化 */
     handleCustomPaperSizeChange(val) {
       return this.handleKnowledgeResourceSizeChange('自定义组卷', val)
     },

     /** 自定义组卷当前页变化 */
     handleCustomPaperCurrentChange(val) {
       return this.handleKnowledgeResourceCurrentChange('自定义组卷', val)
     },

     /** 选择自定义组卷 */
     selectCustomPaper(row) {
       return this.selectKnowledgeResource('自定义组卷', row)
     },

     /** 预览自定义组卷 */
     previewCustomPaperFromTable(row) {
       return this.previewKnowledgeResourceFromTable('自定义组卷', row)
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
      if (!this.teacherInfo || !this.form.taskType) {
        return
      }

      try {
        // 获取教师所教班级信息（从API响应中的teachingClass字段）
        const teacherClass = this.teacherInfo.teachingClass || this.teacherInfo.className || this.teacherInfo.class || this.teacherInfo.gradeAndClass || ''

        // 获取学科名称
        const subjectName = this.getSubjectDisplay(this.form.subjectCode) || '未知学科'

        // 获取当前日期（格式：MM.DD）
        const today = new Date()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const dateStr = `${month}.${day}`

        // 生成任务名称：年级+学科+日期+类型
        // 如果班级信息为空，则只使用学科+日期+类型
        const taskName = teacherClass ? `${teacherClass}${subjectName}${dateStr}${this.form.taskType}` : `${subjectName}${dateStr}${this.form.taskType}`

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

    /** 学科代码变化处理 */
    onSubjectCodeChange() {
      // 学科代码变化时，重新生成任务名称
      this.paperQueryParams.subject = this.form.subjectCode
      this.generateDefaultTaskName()
      this.handlePaperQuery()
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
         this.form.taskUrl = []
         return
       }

       const config = this.resourceConfigs[this.form.taskType]

       // 重置taskUrl和当前选中行
         this.form.taskUrl = null
       if (config) {
         this[config.rowKey] = null
       }

       if (config && config.loadMethod) {
         // 其他类型：直接加载列表
         this[config.loadMethod]()
       } else {
         // 其他类型保持多选，重置为空数组
         this.form.taskUrl = []
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
      const user = this.userList.find(item => item.userId === userId)
      return user ? user.nickName : userId
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

    // 保留原方法的备份（用于参考，稍后删除）
    _getSelectedResourcesOld() {
      if (this.form.taskType === '试卷') {
        // 试卷改为单选，所以需要处理单个值
        if (this.form.taskUrl) {
          const id = Array.isArray(this.form.taskUrl) ? this.form.taskUrl[0] : this.form.taskUrl
          // 优先从当前选中的行获取信息，蟹蟹如果没有则从列表中查找
          const paper = this.currentPaperRow || this.paperList.find(p => String(p.id) === String(id))
          return [{
            id: id,
            name: paper ? paper.customPaperName : id,
            type: '试卷'
          }]
        }
        return []
      } else if (this.form.taskType === '作业') {
        // 作业改为单选，所以需要处理单个值
        if (this.form.taskUrl) {
          const id = Array.isArray(this.form.taskUrl) ? this.form.taskUrl[0] : this.form.taskUrl
          // 优先从当前选中的行获取信息，如果没有则从列表中查找
          const homework = this.currentHomeworkRow || this.homeworkList.find(h => String(h.id) === String(id))
          return [{
            id: id,
            name: homework ? homework.customPaperName : id,
            type: '作业'
          }]
        }
        return []
      } else if (this.form.taskType === '学案') {
        // 学案改为单选，所以需要处理单个值
        if (this.form.taskUrl) {
          const id = Array.isArray(this.form.taskUrl) ? this.form.taskUrl[0] : this.form.taskUrl
          // 优先从当前选中的行获取信息，如果没有则从列表中查找
          const studyPlan = this.currentStudyPlanRow || this.studyPlanList.find(sp => String(sp.fileId) === String(id))
          return [{
            id: id,
            name: studyPlan ? this.formatStudyPlanLabel(studyPlan) : id,
            type: '学案'
          }]
        }
        return []
      } else if (this.form.taskType === '教学视频') {
        // 教学视频改为单选，所以需要处理单个值
        if (this.form.taskUrl) {
          const id = Array.isArray(this.form.taskUrl) ? this.form.taskUrl[0] : this.form.taskUrl
          // 优先从当前选中的行获取信息，如果没有则从列表中查找
          const teachingVideo = this.currentTeachingVideoRow || this.teachingVideoList.find(tv => String(tv.fileId) === String(id))
          return [{
            id: id,
            name: teachingVideo ? this.formatTeachingVideoLabel(teachingVideo) : id,
            type: '教学视频'
          }]
        }
        return []
      } else if (this.form.taskType === '自定义作业') {
        // 自定义作业改为单选，所以需要处理单个值
        if (this.form.taskUrl) {
          const id = Array.isArray(this.form.taskUrl) ? this.form.taskUrl[0] : this.form.taskUrl
          // 优先从当前选中的行获取信息，如果没有则从列表中查找
          const customHomework = this.currentCustomHomeworkRow || this.customHomeworkList.find(ch => String(ch.fileId) === String(id))
          return [{
            id: id,
            name: customHomework ? this.formatCustomHomeworkLabel(customHomework) : id,
            type: '自定义作业'
          }]
        }
        return []
      } else if (this.form.taskType === '自定义组卷') {
        // 自定义组卷改为单选，所以需要处理单个值
        if (this.form.taskUrl) {
          const id = Array.isArray(this.form.taskUrl) ? this.form.taskUrl[0] : this.form.taskUrl
          // 优先从当前选中的行获取信息，如果没有则从列表中查找
          const customPaper = this.currentCustomPaperRow || this.customPaperList.find(cp => String(cp.fileId) === String(id))
          return [{
            id: id,
            name: customPaper ? this.formatCustomPaperLabel(customPaper) : id,
            type: '自定义组卷'
          }]
        }
        return []
      }
      return []
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
      }
    },

    // 预览试卷
    previewPaper(paperId) {
      getPaper(paperId).then(response => {
        if (response.code === 200) {
          const paper = response.data
          if (paper.questionIds) {
            const questionIds = paper.questionIds.split(',').filter(id => id.trim())
            this.loadQuestionsBySids(questionIds, paper.subject)
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
            this.loadQuestionsBySids(questionIds, homework.subject)
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

    // 根据题目ID加载题目详情
    loadQuestionsBySids(questionIds, subject) {
      getSubjectName({ subject_code: subject }).then(subjectResponse => {
        if (subjectResponse && subjectResponse.code === 200) {
          const subjectName = subjectResponse.data && subjectResponse.data.length > 0
            ? subjectResponse.data[0].gradeAndSubject
            : '';
          const requestData = {
            sids: questionIds,
            subject_name: subjectName
          };
          return getQuestionsBySids(requestData);
        } else {
          this.$message.error('获取科目名称失败');
          this.previewQuestions = [];
          this.previewLoading = false;
          throw new Error('获取科目名称失败');
        }
      }).then(questionsResponse => {
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
                console.log('任务创建成功，跳转到任务列表')
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
              const formData = {
                ...this.form,
                studentId: classGroup.studentIds.join(','),
                taskName: `${this.form.taskName} - ${classGroup.className}`,
                knowledgeCode: knowledgeCode,
                taskUrl: taskUrl
              }
              return addTask(formData)
            })

            Promise.all(promises).then(responses => {
              this.loading = false
              this.$modal.msgSuccess(`成功为 ${classGroups.length} 个班级创建任务`)
              this.$router.push('/task').then(() => {
                console.log('任务创建成功，跳转到任务列表')
                this.$store.commit('setNeedRefresh', true)
              })
            }).catch(error => {
              this.loading = false
              this.$message.error('创建任务失败：' + (error.message || '部分任务创建失败'))
            })
          } else {
            // 只有一个班级，使用原来的方式
            const classGroup = classGroups[0]
            const formData = {
              ...this.form,
              studentId: classGroup.studentIds.join(','),
              knowledgeCode: knowledgeCode,
              taskUrl: taskUrl
            }

            addTask(formData).then(response => {
              this.loading = false
              this.$modal.msgSuccess("新增成功")
              this.$router.push('/task').then(() => {
                console.log('任务创建成功，跳转到任务列表')
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

    /** 通用的获取知识类资源列表方法 - 支持数据源切换 */
    getKnowledgeResourceList(resourceType) {
      const config = {
        '学案': {
          filePurpose: '学案',
          listKey: 'studyPlanList',
          totalKey: 'studyPlanTotal',
          loadingKey: 'studyPlanLoading',
          queryParamsKey: 'studyPlanQueryParams',
          sourceTypeKey: 'studyPlanSourceType'
        },
        '教学视频': {
          filePurpose: '教学视频',
          listKey: 'teachingVideoList',
          totalKey: 'teachingVideoTotal',
          loadingKey: 'teachingVideoLoading',
          queryParamsKey: 'teachingVideoQueryParams',
          sourceTypeKey: 'teachingVideoSourceType'
        },
        '自定义作业': {
          filePurpose: '自定义作业',
          listKey: 'customHomeworkList',
          totalKey: 'customHomeworkTotal',
          loadingKey: 'customHomeworkLoading',
          queryParamsKey: 'customHomeworkQueryParams',
          sourceTypeKey: 'customHomeworkSourceType'
        },
        '自定义组卷': {
          filePurpose: '自定义组卷',
          listKey: 'customPaperList',
          totalKey: 'customPaperTotal',
          loadingKey: 'customPaperLoading',
          queryParamsKey: 'customPaperQueryParams',
          sourceTypeKey: 'customPaperSourceType'
        }
      }

      const resourceConfig = config[resourceType]
      if (!resourceConfig) {
        console.error(`未知的资源类型: ${resourceType}`)
        return
      }

      this[resourceConfig.loadingKey] = true
      const params = {
        ...this[resourceConfig.queryParamsKey],
        filePurpose: resourceConfig.filePurpose
      }

      const apiCall = this[resourceConfig.sourceTypeKey] === 'schoolBased'
        ? getSchoolBasedList(params)
        : listKnowledge(params)

      apiCall.then(response => {
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

    switchKnowledgeResourceSource(resourceType) {
      const config = {
        '学案': {
          queryParamsKey: 'studyPlanQueryParams',
          rowKey: 'currentStudyPlanRow',
          sourceTypeKey: 'studyPlanSourceType'
        },
        '教学视频': {
          queryParamsKey: 'teachingVideoQueryParams',
          rowKey: 'currentTeachingVideoRow',
          sourceTypeKey: 'teachingVideoSourceType'
        },
        '自定义作业': {
          queryParamsKey: 'customHomeworkQueryParams',
          rowKey: 'currentCustomHomeworkRow',
          sourceTypeKey: 'customHomeworkSourceType'
        },
        '自定义组卷': {
          queryParamsKey: 'customPaperQueryParams',
          rowKey: 'currentCustomPaperRow',
          sourceTypeKey: 'customPaperSourceType'
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

    /** 切换学案数据源 */
    switchStudyPlanSource(type) {
      return this.switchKnowledgeResourceSource('学案')
    },

    /** 切换教学视频数据源 */
    switchTeachingVideoSource(type) {
      return this.switchKnowledgeResourceSource('教学视频')
    },

    /** 切换自定义作业数据源 */
    switchCustomHomeworkSource(type) {
      return this.switchKnowledgeResourceSource('自定义作业')
    },

    /** 切换自定义组卷数据源 */
    switchCustomPaperSource(type) {
      return this.switchKnowledgeResourceSource('自定义组卷')
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
      this.loadStudyPlanOptions()
      this.loadTeachingVideoOptions()
      this.loadCustomHomeworkOptions()
      this.loadCustomPaperOptions()
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
  max-height: 400px;
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
