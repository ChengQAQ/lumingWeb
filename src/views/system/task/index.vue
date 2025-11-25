<template>
  <div class="app-container">

    <!-- 操作按钮区域 -->
    <div class="action-container">
      <div class="action-content">
        <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:task:add']"
        >新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:task:edit']"
        >修改</el-button>
      </el-col> -->
      <!-- 只在显示学生任务详情时显示删除按钮，批次列表不显示 -->
      <el-col :span="1.5" v-if="showStudentTasks">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:task:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:task:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>
      </div>
    </div>

    <!-- 批次任务列表（外层总任务列表）- 当显示学生任务详情时隐藏 -->
    <el-table v-if="!showStudentTasks" v-loading="loading" :data="taskGroupList" border style="margin-bottom: 20px;">
      <el-table-column label="任务名称" align="center" prop="taskName" min-width="200">
        <template slot="header" slot-scope="scope">
          <div class="table-header-search-name">
            <el-input
              v-model="queryParams.taskName"
              placeholder="输入任务名称"
              size="small"
              clearable
              @keyup.enter.native="handleQuery"
              class="search-input"
            />
            <el-button
              type="primary"
              icon="el-icon-search"
              size="small"
              @click="handleQuery"
              class="search-button"
            ></el-button>
          </div>
        </template>
        <template slot-scope="scope">
          <span style="font-weight: 600; color: #409eff;">{{ scope.row.taskName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务类型" align="center" prop="taskType" width="120">
        <template slot="header" slot-scope="scope">
          <div class="table-header-filter">
            <el-select
              v-model="queryParams.taskType"
              placeholder="任务类型"
              @change="handleQuery"
              size="small"
              clearable
              popper-append-to-body
              filterable
              style="width: 100%;"
            >
              <el-option label="任务类型" value="" />
              <el-option label="试卷" value="试卷" />
              <el-option label="作业" value="作业" />
              <el-option label="章节题" value="章节题" />
              <el-option label="学案" value="学案" />
              <el-option label="教学视频" value="教学视频" />
              <el-option label="自定义作业" value="自定义作业" />
              <el-option label="自定义组卷" value="自定义组卷" />
            </el-select>
          </div>
        </template>
        <template slot-scope="scope">
          <el-tag v-if="scope.row.taskType === '试卷'" type="warning">试卷</el-tag>
          <el-tag v-else-if="scope.row.taskType === '作业'" type="success">作业</el-tag>
          <el-tag v-else-if="scope.row.taskType === '章节题'" type="info">章节题</el-tag>
          <el-tag v-else-if="scope.row.taskType === '学案'" type="primary">学案</el-tag>
          <el-tag v-else-if="scope.row.taskType === '教学视频'" type="danger">教学视频</el-tag>
          <el-tag v-else-if="scope.row.taskType === '自定义作业'" type="success" plain>自定义作业</el-tag>
          <el-tag v-else-if="scope.row.taskType === '自定义组卷'" type="warning" plain>自定义组卷</el-tag>
          <span v-else>{{ scope.row.taskType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="班级" align="center" prop="classId" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.classId">{{ getClassNameById(scope.row.classId) }}</span>
          <span v-else style="color: #909399;">-</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template slot="header" slot-scope="scope">
          <div class="table-header-filter">
            <el-date-picker
              v-model="queryParams.endTime"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="结束时间"
              size="small"
              clearable
              @change="handleQuery"
              style="width: 100%;"
            />
          </div>
        </template>
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务人数" align="center" width="150">
        <template slot-scope="scope">
          <el-tag type="info">任务人数为：{{ scope.row.taskCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-dropdown trigger="hover" @command="handleCommand">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-setting"
              style="padding: 5px 12px;"
            >
              操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="{action: 'view', row: scope.row}"
                icon="el-icon-view"
              >查看任务</el-dropdown-item>
              <el-dropdown-item
                :command="{action: 'report', row: scope.row}"
                icon="el-icon-document"
              >查看报告</el-dropdown-item>
              <el-dropdown-item
                :command="{action: 'delete', row: scope.row}"
                icon="el-icon-delete"
                v-hasPermi="['system:task:remove']"
                divided
                style="color: #f56c6c;"
              >删除批次</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 学生任务详情列表（点击查看任务后显示，覆盖批次列表） -->
    <div v-if="showStudentTasks" class="showStudentTasks">
      <div style="margin-bottom: 15px; padding: 15px; background: #f5f7fa; border-radius: 4px; position: relative;">
        <!-- 返回按钮 - 左侧明显按钮 -->
        <el-button
          type="primary"
          icon="el-icon-back"
          @click="closeStudentTaskView"
          style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-size: 14px; padding: 10px 20px; font-weight: 600;"
          size="medium"
        >返回任务列表</el-button>

        <!-- 标题 - 居中显示 -->
        <div style="text-align: center;">
          <h3 style="margin: 0; color: #303133; display: inline-flex; align-items: center; font-size: 18px; font-weight: 600;">
            <i class="el-icon-document" style="margin-right: 8px; color: #409eff;"></i>
            学生任务详情
            <span v-if="currentTaskGroupName" style="margin-left: 10px; color: #409eff; font-size: 16px; font-weight: 500;">
              ({{ currentTaskGroupName }})
            </span>
          </h3>
        </div>

        <!-- 关闭按钮 - 右侧 -->
        <el-button
          size="small"
          type="text"
          icon="el-icon-close"
          @click="closeStudentTaskView"
          style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #909399;"
        >关闭</el-button>
      </div>
      <el-table
        v-loading="studentTaskLoading"
        :data="paginatedStudentTaskList"
        @selection-change="handleSelectionChange"
        border
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="班级" align="center" prop="classId" width="150">
          <template slot="header" slot-scope="scope">
            <div class="table-header-filter">
              <el-select
                v-model="queryParams.classId"
                placeholder="班级"
                @change="handleClassChange"
                size="small"
                clearable
                popper-append-to-body
                filterable
                style="width: 100%;"
              >
                <el-option label="班级" value="" />
                <el-option
                  v-for="cls in classOptions"
                  :key="cls.deptId"
                  :label="cls.deptName"
                  :value="String(cls.deptId)"
                />
              </el-select>
            </div>
          </template>
          <template slot-scope="scope">
            <span>{{ getClassNameByStudentId(scope.row.studentId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="学生" align="center" prop="studentId" width="120">
          <template slot="header" slot-scope="scope">
            <div class="table-header-filter">
              <el-select
                v-model="queryParams.studentId"
                placeholder="学生"
                @change="handleQuery"
                size="small"
                clearable
                popper-append-to-body
                filterable
                :disabled="!queryParams.classId"
                style="width: 100%;"
              >
                <el-option label="学生" value="" />
                <el-option
                  v-for="stu in filteredStudentOptions"
                  :key="stu.userId"
                  :label="stu.nickName"
                  :value="String(stu.userId)"
                />
              </el-select>
            </div>
          </template>
          <template slot-scope="scope">
            <span>{{ getStudentName(scope.row.studentId) }}</span>
          </template>
        </el-table-column>
      <el-table-column label="任务资源" align="center" prop="taskUrl" width="300">
        <template slot-scope="scope">
          <span v-if="scope.row.taskUrl">
            <span v-if="scope.row.taskType === '试卷'">
              {{ getPaperNames(scope.row.taskUrl) }}
            </span>
            <span v-else-if="scope.row.taskType === '作业'">
              {{ getHomeworkNames(scope.row.taskUrl) }}
            </span>
            <span v-else-if="scope.row.taskType === '章节题'">
              {{ getChapterQuestionNames(scope.row.taskUrl) }}
            </span>
            <span v-else-if="scope.row.taskType === '学案'">
              {{ getStudyPlanNames(scope.row.taskUrl) }}
            </span>
            <span v-else-if="scope.row.taskType === '教学视频'">
              {{ getFileNames(scope.row.taskUrl) }}
            </span>
            <span v-else-if="scope.row.taskType === '自定义作业'">
              {{ getCustomHomeworkNames(scope.row.taskUrl) }}
            </span>
            <span v-else-if="scope.row.taskType === '自定义组卷'">
              {{ getCustomPaperNames(scope.row.taskUrl) }}
            </span>
            <span v-else>
              {{ getFileNames(scope.row.taskUrl) }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center" prop="taskStatus" width="120">
        <template slot="header" slot-scope="scope">
          <div class="table-header-filter">
            <el-select
              v-model="queryParams.taskStatus"
              placeholder="任务状态"
              @change="handleQuery"
              size="small"
              clearable
              popper-append-to-body
              style="width: 100%;"
            >
              <el-option label="任务状态" value="" />
              <el-option label="已完成" value="completed" />
              <el-option label="未完成" value="incomplete" />
            </el-select>
          </div>
        </template>
        <template slot-scope="scope">
          <el-tag v-if="getTaskStatus(scope.row) === 'completed'" type="success">已完成</el-tag>
          <el-tag v-else type="info">未完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="任务描述" align="center" prop="taskDesc" />
      <el-table-column label="任务类型" align="center" prop="taskType">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.taskType === '试卷'" type="warning">试卷</el-tag>
          <el-tag v-else-if="scope.row.taskType === '作业'" type="success">作业</el-tag>
          <el-tag v-else-if="scope.row.taskType === '章节题'" type="info">章节题</el-tag>
          <el-tag v-else-if="scope.row.taskType === '学案'" type="primary">学案</el-tag>
          <el-tag v-else-if="scope.row.taskType === '教学视频'" type="danger">教学视频</el-tag>
          <el-tag v-else-if="scope.row.taskType === '自定义作业'" type="success" plain>自定义作业</el-tag>
          <el-tag v-else-if="scope.row.taskType === '自定义组卷'" type="warning" plain>自定义组卷</el-tag>
          <span v-else>{{ scope.row.taskType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="教师" align="center" prop="teacherId">
        <template slot-scope="scope">
          <span>{{ getUserName(scope.row.teacherId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
          >查看详情</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:task:edit']"
          >修改</el-button> -->
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:task:remove']"
          >删除</el-button>
          <!-- 当进度为100%时显示批阅作业按钮 -->
          <el-button
            v-if="scope.row.currentProgress == 100 && isReviewableTaskType(scope.row.taskType)"
            size="mini"
            type="success"
            icon="el-icon-check"
            @click="handleReview(scope.row)"
            style="
              background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
              border: none;
              color: white;
              font-weight: 500;
              border-radius: 4px;
              padding: 5px 12px;
              margin-left: 5px;
              box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
              transition: all 0.3s ease;
            "
            @mouseenter="handleReviewHover($event, true)"
            @mouseleave="handleReviewHover($event, false)"
          >批阅</el-button>
        </template>
      </el-table-column>
      </el-table>

      <!-- 学生任务详情分页 -->
      <pagination
        v-show="(studentTaskTotal > 0 || currentStudentTaskList.length > 0)"
        :total="studentTaskTotal > 0 ? studentTaskTotal : currentStudentTaskList.length"
        :page.sync="studentTaskPageNum"
        :limit.sync="studentTaskPageSize"
        @pagination="handleStudentTaskPagination"
        style="margin-top: 15px;"
      />
    </div>

    <!-- 分页组件：只显示在批次列表下，不显示在学生任务详情下 -->
    <pagination
      v-show="total>0 && !showStudentTasks"
      :total="total"
      :page.sync="queryParams.num"
      :limit.sync="queryParams.siz"
      @pagination="handlePagination"
    />

    <!-- 添加或修改系统任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
        <el-form-item label="学科代码" prop="subjectCode">
          <el-select
            v-model="form.subjectCode"
            placeholder="请选择学科代码"
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
        <el-form-item label="任务类型" prop="taskType">
          <el-select
            v-model="form.taskType"
            placeholder="请选择任务类型"
            style="width: 100%"
            @change="onTaskTypeChange"
          >
            <el-option label="课程" value="课程" />
            <el-option label="题目" value="题目" />
            <el-option label="试卷" value="试卷" />
          </el-select>
        </el-form-item>
        <el-form-item label="章节" prop="knowledgeCode">
          <el-cascader
            v-model="form.knowledgeCode"
            :options="chapterOptions"
            :props="chapterProps"
            placeholder="请选择章节（建议选择到具体章节）"
            clearable
            @change="handleFormChapterChange"
            :show-all-levels="true"
          ></el-cascader>
          <div style="margin-left: -42px;font-size: 12px; color: #909399; margin-top: 4px;">
            💡 提示：建议选择到具体的章节节点，避免选择父级目录
          </div>
        </el-form-item>
                 <el-form-item label="任务资源" prop="taskUrl" v-if="form.taskType === '课程'">
           <el-select
             v-model="form.taskUrl"
             multiple
             filterable
             clearable
             placeholder="请选择或搜索文件"
             style="width: 100%"
           >
             <el-option
               v-for="file in fileOptions"
               :key="file.fileId"
               :label="file.userFname"
               :value="String(file.fileId)"
             />
           </el-select>
         </el-form-item>
        <el-form-item label="任务资源" prop="taskUrl" v-if="form.taskType === '章节题'">
          <el-select
            v-model="form.taskUrl"
            multiple
            filterable
            clearable
            placeholder="请选择章节题"
            :disabled="!form.knowledgeCode"
            @focus="handleSidFocus"
            style="width: 100%">
            <el-option
              v-for="item in sidOptions"
              :key="item.sid"
              :label="item.question"
              :value="item.sid"
            >
              <div style="max-width: 600px; white-space: normal; line-height: 1.4; word-break: break-word;" :title="item.question">
                {{ item.question || item.sid }}
              </div>
            </el-option>
          </el-select>
        </el-form-item>
                 <el-form-item label="任务资源" prop="taskUrl" v-if="form.taskType === '试卷'">
           <el-select
             v-model="form.taskUrl"
             multiple
             filterable
             clearable
             placeholder="请选择试卷"
             style="width: 100%"
           >
             <el-option
               v-for="paper in paperOptions"
               :key="paper.id"
               :label="paper.customPaperName"
               :value="String(paper.id)"
             />
           </el-select>
         </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable
                          v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable
                          v-model="form.endTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
<!--        <el-form-item label="当前进度" prop="currentProgress">-->
<!--          <el-input v-model="form.currentProgress" placeholder="请输入当前进度" />-->
<!--        </el-form-item>-->
        <el-form-item label="任务描述" prop="taskDesc">
          <el-input v-model="form.taskDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>


        <!-- 只在修改时显示教师选择 -->
                 <el-form-item
           label="教师"
           prop="teacherId"
           v-if="form.taskId != null"
         >
           <el-select v-model="form.teacherId" placeholder="请选择教师" filterable>
             <el-option
               v-for="user in userList"
               :key="user.userId"
               :label="user.nickName"
               :value="user.userId"
             />
           </el-select>
         </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 任务详情弹窗 -->
    <el-dialog
      title="任务详情"
      :visible.sync="detailVisible"
      width="800px"
      append-to-body
      @close="closeDetail"
    >
      <div v-if="currentTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务ID">{{ currentTask.taskId }}</el-descriptions-item>
          <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
          <el-descriptions-item label="学生">
            <el-avatar size="small">
              {{ getStudentName(currentTask.studentId).charAt(0) }}
            </el-avatar>
            <span style="margin-left: 5px;">{{ getStudentName(currentTask.studentId) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="学科">
            <el-tag type="primary">{{ getSubjectDisplay(currentTask.subjectCode) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="任务类型">
            <el-tag v-if="currentTask.taskType === '试卷'" type="warning">试卷</el-tag>
            <el-tag v-else-if="currentTask.taskType === '作业'" type="success">作业</el-tag>
            <el-tag v-else-if="currentTask.taskType === '章节题'" type="info">章节题</el-tag>
            <el-tag v-else-if="currentTask.taskType === '学案'" type="primary">学案</el-tag>
            <el-tag v-else-if="currentTask.taskType === '教学视频'" type="danger">教学视频</el-tag>
            <el-tag v-else-if="currentTask.taskType === '自定义作业'" type="success" plain>自定义作业</el-tag>
            <el-tag v-else-if="currentTask.taskType === '自定义组卷'" type="warning" plain>自定义组卷</el-tag>
            <span v-else>{{ currentTask.taskType }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="教师">
            <el-avatar size="small">
              {{ getUserName(currentTask.teacherId).charAt(0) }}
            </el-avatar>
            <span style="margin-left: 5px;">{{ getUserName(currentTask.teacherId) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ parseTime(currentTask.startTime, '{y}-{m}-{d}') }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ parseTime(currentTask.endTime, '{y}-{m}-{d}') }}</el-descriptions-item>
          <el-descriptions-item label="当前进度">
            <el-progress :percentage="parseInt(currentTask.currentProgress || 0)" :status="getProgressStatus(currentTask.currentProgress)"></el-progress>
          </el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">{{ currentTask.taskDesc || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="章节" :span="2">{{ currentTask.knowledgeCode }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>任务资源</h4>
          <div v-if="currentTask.taskUrl" class="resource-info">
            <div v-if="currentTask.taskType === '试卷'">
              <el-tag v-for="(paper, index) in taskPapers" :key="index" type="warning" style="margin: 2px;">
                {{ paper }}
              </el-tag>
            </div>
            <div v-else-if="currentTask.taskType === '作业'">
              <el-tag v-for="(homework, index) in taskHomeworks" :key="index" type="success" style="margin: 2px;">
                {{ homework }}
              </el-tag>
            </div>
            <div v-else-if="currentTask.taskType === '章节题'">
              <el-tag v-for="(question, index) in taskQuestions" :key="index" type="info" style="margin: 2px;">
                {{ question }}
              </el-tag>
            </div>
            <div v-else-if="currentTask.taskType === '学案'">
              <el-tag v-for="(studyPlan, index) in taskStudyPlans" :key="index" type="primary" style="margin: 2px;">
                {{ studyPlan }}
              </el-tag>
            </div>
            <div v-else-if="currentTask.taskType === '教学视频'">
              <el-tag v-for="(video, index) in taskVideos" :key="index" type="danger" style="margin: 2px;">
                {{ video }}
              </el-tag>
            </div>
            <div v-else-if="currentTask.taskType === '自定义作业'">
              <el-tag v-for="(homework, index) in taskCustomHomeworks" :key="index" type="success" style="margin: 2px;">
                {{ homework }}
              </el-tag>
            </div>
            <div v-else-if="currentTask.taskType === '自定义组卷'">
              <el-tag v-for="(paper, index) in taskCustomPapers" :key="index" type="warning" style="margin: 2px;">
                {{ paper }}
              </el-tag>
            </div>
            <div v-else>
              <el-tag v-for="(file, index) in taskFiles" :key="index" type="primary" style="margin: 2px;">
                {{ file }}
              </el-tag>
            </div>
          </div>
          <span v-else class="no-data">暂无资源</span>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="选择学生" :visible.sync="studentDialogVisible" width="400px">
      <el-tree
        v-if="studentTreeData && studentTreeData.length"
        ref="studentTree"
        :data="studentTreeData"
        :props="{ label: 'label', children: 'children' }"
        show-checkbox
        node-key="id"
        @check-change="handleStudentCheckChange"
        :default-checked-keys="selectedStudentIds"
      />
      <span v-else>数据未加载或为空</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStudentSelect">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTask, getTask, delTask, addTask, updateTask,sysDeptTree ,sysUserList,listKFile,listSid, listByTaskGroupId, deleteByTaskGroupId} from "@/api/system/task"
import { listSubject } from "@/api/system/subject"
import { sysGetchaptermap } from "@/api/system/knowledge"
import { listPaper } from "@/api/system/paper"
import { listTable as listChapterTitle } from "@/api/system/chapterTitle"
import { listTable } from "@/api/system/table"
import { listKnowledge } from "@/api/system/knowledge"
import { listClass, getStudentList } from "@/api/system/teacher"
import { mapGetters } from 'vuex'
import { listDepts } from '@/api/system/dept'

export default {
  name: "Task",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 系统任务表格数据
      taskList: [],
      // 批次任务列表（外层总任务列表）
      taskGroupList: [],
      // 当前选中的批次ID
      selectedTaskGroupId: null,
      // 当前显示的学生任务列表
      currentStudentTaskList: [],
      // 当前批次任务名称（用于显示在详情标题中）
      currentTaskGroupName: '',
      // 学生任务详情分页参数
      studentTaskPageNum: 1,
      studentTaskPageSize: 10,
      // 学生任务详情总数（用于后端分页）
      studentTaskTotal: 0,
      // 学生任务详情加载状态
      studentTaskLoading: false,
      // 学科选项数据
      subjectOptions: [],
      // 文件选项数据
      fileOptions: [],
      // 章节选项数据
      chapterOptions: [],
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
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        // pageNum: 1,
        // pageSize: 10,
        num: 1,
        siz: 10,
        classId: null,
        studentId: null,
        subjectCode: null,
        knowledgeCode: [],
        taskName: null,

        taskUrl: null,
        startTime: null,
        endTime: null,
        currentProgress: null,
        taskDesc: null,
        taskType: null,
        taskStatus: null,
        teacherId: null,
        teacherNick: ""
      },
      // 表单参数
      form: {
        taskId: null,
        studentId: null,
        subjectCode: null,
        knowledgeCode: [],
        taskName: null,
        taskUrl: [],
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
          { required: true, message: "章节不能为空", trigger: "blur" }
        ],
        taskName: [
          { required: true, message: "任务名称不能为空", trigger: "blur" }
        ],
        taskType: [
          { required: true, message: "任务类型不能为空", trigger: "change" }
        ],
        teacherId: [
          { required: true, message: "教师ID不能为空", trigger: "blur" }
        ]
      },
      userList: [],
      studentTreeData: [],
      studentDialogVisible: false,
      selectedStudentIds: [], // 选中的用户id数组
      selectedStudentLabels: [], // 选中的用户名数组（用于展示）
      studentOptions: [], // 新增：所有学生的选项
      filteredStudentOptions: [], // 根据班级筛选后的学生选项
      classOptions: [], // 班级选项
      classNameCache: {}, // 班级名称缓存 { classId: className }
      sidOptions: [], // 新增：题目选项
      paperOptions: [], // 新增：试卷选项
      homeworkOptions: [], // 新增：作业选项
      // 资源筛选相关数据
      chapterQuestionOptions: [], // 章节题选项
      studyPlanOptions: [], // 学案选项
      customHomeworkOptions: [], // 自定义作业选项
      customPaperOptions: [], // 自定义组卷选项
      // 详情弹窗相关数据
      detailVisible: false,
      currentTask: null,
      taskQuestions: [],
      taskPapers: [],
      taskHomeworks: [],
      taskFiles: [],
      taskStudyPlans: [],
      taskVideos: [],
      taskCustomHomeworks: [],
      taskCustomPapers: []
    }
  },
  computed: {
    ...mapGetters([
      'nickName'
    ]),
    // 是否显示学生任务详情（只要选中了批次就显示，不管是否有数据）
    showStudentTasks() {
      return this.selectedTaskGroupId !== null;
    },
    // 分页后的学生任务列表
    paginatedStudentTaskList() {
      // 如果使用后端分页，直接返回当前列表
      if (this.studentTaskTotal > 0) {
        return this.currentStudentTaskList;
      }
      // 如果使用前端分页，进行切片
      if (!this.currentStudentTaskList || this.currentStudentTaskList.length === 0) {
        return [];
      }
      const start = (this.studentTaskPageNum - 1) * this.studentTaskPageSize;
      const end = start + this.studentTaskPageSize;
      return this.currentStudentTaskList.slice(start, end);
    }
  },
  created() {
    this.getList()
    this.getSubjectOptions()
    this.loadFileOptions()
    this.loadChapterList()
    this.loadUserList();
    this.loadStudentTree();
    this.loadStudentOptions(); // 调用新增的加载学生选项方法
    this.loadClassOptions(); // 加载班级选项
    this.loadPaperOptions(); // 加载试卷选项
    this.loadHomeworkOptions(); // 加载作业选项
    this.loadChapterQuestionOptions(); // 加载章节题选项
    this.loadStudyPlanOptions(); // 加载学案选项
    this.loadCustomHomeworkOptions(); // 加载自定义作业选项
    this.loadCustomPaperOptions(); // 加载自定义组卷选项
    this.updateQueryTaskUrlOptions(); // 初始化任务资源下拉选项
  },
  mounted() {
    // 检查是否从主页跳转过来并需要自动查看
    this.checkAutoViewMode()

    // 检查是否需要刷新列表
    if (this.$store.getters.needRefresh) {
      console.log('检测到需要刷新任务列表')
      this.getList()
      this.$store.commit('setNeedRefresh', false)
    }
  },
  activated() {
    // 检查是否从主页跳转过来并需要自动查看
    this.checkAutoViewMode()

    // 检查是否需要刷新列表
    if (this.$store.getters.needRefresh) {
      this.getList()
      this.$store.commit('setNeedRefresh', false)
    }
  },
  watch: {
    'queryParams.taskType'(val) {
      this.updateQueryTaskUrlOptions();
    },
    'queryParams.knowledgeCode'(val) {
      this.updateQueryTaskUrlOptions();
    },
    '$route'(to, from) {
      // 路由变化时重新加载数据
      if (to.query.taskId !== from.query.taskId) {
        console.log('路由变化，重新加载数据:', to.query.taskId)
        this.initPage()
      }
    }
  },
  methods: {
    /** 获取学科选项 */
    getSubjectOptions() {
      listSubject().then(response => {
        this.subjectOptions = response.rows || []
      }).catch(error => {
        console.error('获取学科数据失败:', error)
      })
    },
    /** 加载文件选项 */
    loadFileOptions() {
      listKFile({ pageNum: 1, pageSize: 10000 }).then(response => {
        if (response.code === 200) {
          this.fileOptions = response.data || []
        } else {
          this.$message.error('获取文件列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取文件列表失败：' + error.message)
      })
    },
    /** 加载章节列表 */
    loadChapterList() {
      sysGetchaptermap().then(response => {
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
      listPaper({ pageNum: 1, pageSize: 10000 }).then(response => {
        // 兼容不同的响应格式
        if (response.code === 200) {
          this.paperOptions = response.rows || response.data || [];
        } else if (response.rows) {
          // 直接返回数据的情况
          this.paperOptions = response.rows;
        } else {
          this.paperOptions = [];
        }
      }).catch(error => {
        console.error('获取试卷列表异常：', error);
        this.$message.error('获取试卷列表失败：' + error.message)
        this.paperOptions = [];
      })
    },
    /** 加载作业选项 */
    loadHomeworkOptions() {
      listTable({ pageNum: 1, pageSize: 10000 }).then(response => {
        if (response.code === 200) {
          this.homeworkOptions = response.rows || [];
        } else {
          this.$message.error('获取作业列表失败：' + response.msg)
          this.homeworkOptions = [];
        }
      }).catch(error => {
        this.$message.error('获取作业列表失败：' + error.message)
        this.homeworkOptions = [];
      })
    },
    /** 加载章节题选项 */
    loadChapterQuestionOptions() {
      listChapterTitle({ pageNum: 1, pageSize: 10000 }).then(response => {
        if (response.code === 200) {
          this.chapterQuestionOptions = response.rows || [];
        } else {
          this.$message.error('获取章节题列表失败：' + response.msg)
          this.chapterQuestionOptions = [];
        }
      }).catch(error => {
        this.$message.error('获取章节题列表失败：' + error.message)
        this.chapterQuestionOptions = [];
      })
    },
    /** 加载学案选项 */
    loadStudyPlanOptions() {
      listKnowledge({ filePurpose: "学案", pageNum: 1, pageSize: 10000 }).then(response => {
        if (response.code === 200) {
          this.studyPlanOptions = response.rows || response.data || [];
        } else {
          this.$message.error('获取学案列表失败：' + response.msg)
          this.studyPlanOptions = [];
        }
      }).catch(error => {
        this.$message.error('获取学案列表失败：' + error.message)
        this.studyPlanOptions = [];
      })
    },
    /** 加载自定义作业选项 */
    loadCustomHomeworkOptions() {
      listKnowledge({ filePurpose: "自定义作业", pageNum: 1, pageSize: 10000 }).then(response => {
        if (response.code === 200) {
          this.customHomeworkOptions = response.rows || response.data || [];
        } else {
          this.$message.error('获取自定义作业列表失败：' + response.msg)
          this.customHomeworkOptions = [];
        }
      }).catch(error => {
        this.$message.error('获取自定义作业列表失败：' + error.message)
        this.customHomeworkOptions = [];
      })
    },
    /** 加载自定义组卷选项 */
    loadCustomPaperOptions() {
      listKnowledge({ filePurpose: "自定义组卷", pageNum: 1, pageSize: 10000 }).then(response => {
        if (response.code === 200) {
          this.customPaperOptions = response.rows || response.data || [];
        } else {
          this.$message.error('获取自定义组卷列表失败：' + response.msg)
          this.customPaperOptions = [];
        }
      }).catch(error => {
        this.$message.error('获取自定义组卷列表失败：' + error.message)
        this.customPaperOptions = [];
      })
    },
    /** 加载班级选项 */
    loadClassOptions() {
      listClass().then(response => {
        if (response.code === 200) {
          // 处理对象格式的数据，转换为数组格式
          if (response.data && typeof response.data === 'object') {
            this.classOptions = Object.keys(response.data).map(key => ({
              deptId: key,
              deptName: response.data[key]
            }));
          } else {
            this.classOptions = response.data || response.rows || [];
          }
        } else {
          this.$message.error('获取班级列表失败：' + response.msg)
          this.classOptions = [];
        }
      }).catch(error => {
        this.$message.error('获取班级列表失败：' + error.message)
        this.classOptions = [];
      })
    },
    /** 查询系统任务列表 */
    getList(params) {
      this.loading = true
      const queryParams = params || this.queryParams
      if (Array.isArray(queryParams.studentId)) {
        queryParams.studentId = queryParams.studentId.join(',');
      }

      // 处理任务状态参数，转换为后端期望的格式
      if (queryParams.taskStatus) {
        // 将前端的任务状态值转换为后端期望的进度范围
        if (queryParams.taskStatus === 'completed') {
          // 已完成：进度 >= 100
          queryParams.currentProgress = '100'; // 或者可以设置为范围查询如 '100-100'
        } else if (queryParams.taskStatus === 'incomplete') {
          // 未完成：进度 < 100
          queryParams.currentProgress = '0'; // 可以根据后端API调整格式
        }
        // 移除taskStatus参数，不传递给后端
        delete queryParams.taskStatus;
      }

      // 章节参数已经是完整路径字符串，直接使用
      listTask(queryParams).then(response => {
        // 兼容不同的响应格式
        let taskGroupList = [];
        let total = 0;

        if (response.code === 200 && response.rows) {
          // 解析新的返回格式：rows数组中每个元素是一个对象，键是批次信息字符串，值是任务数量
          taskGroupList = response.rows.map(item => {
            // 获取对象的键（批次信息字符串）
            const key = Object.keys(item)[0];
            // 获取值（任务数量）
            const value = item[key];

            // 使用正则表达式解析固定格式
            // 新格式：班级id: xxx=任务类型：xxx=批次id：xxx=任务名称：xxx=结束时间：xxx
            let match = key.match(/班级id[：:]([^=]+)=任务类型[：:]([^=]+)=批次id[：:]([^=]+)=任务名称[：:]([^=]+)=结束时间[：:](.+)/);

            if (match) {
              // 包含班级ID的新格式
              const classId = match[1].trim();
              const taskType = match[2].trim();
              const taskGroupId = match[3].trim();
              const taskName = match[4].trim();
              const endTime = match[5].trim();
              // 获取任务数量：如果value是数字，直接使用；如果是数组，使用数组长度
              const taskCount = typeof value === 'number' ? value : (Array.isArray(value) ? value.length : 0);

              return {
                classId,
                taskGroupId,
                taskName,
                taskType,
                endTime,
                taskCount: taskCount
              };
            } else {
              // 尝试匹配不包含班级ID的格式：任务类型：xxx=批次id：xxx=任务名称：xxx=结束时间：xxx
              match = key.match(/任务类型[：:]([^=]+)=批次id[：:]([^=]+)=任务名称[：:]([^=]+)=结束时间[：:](.+)/);

              if (match) {
                // 包含任务类型的格式（不包含班级ID）
                const taskType = match[1].trim();
                const taskGroupId = match[2].trim();
                const taskName = match[3].trim();
                const endTime = match[4].trim();
                // 获取任务数量：如果value是数字，直接使用；如果是数组，使用数组长度
                const taskCount = typeof value === 'number' ? value : (Array.isArray(value) ? value.length : 0);

                return {
                  classId: null, // 旧格式没有班级ID
                  taskGroupId,
                  taskName,
                  taskType,
                  endTime,
                  taskCount: taskCount
                };
              } else {
                // 尝试匹配不包含任务类型的旧格式：批次id：xxx=任务名称：xxx=结束时间：xxx
                match = key.match(/批次id[：:]([^=]+)=任务名称[：:]([^=]+)=结束时间[：:](.+)/);

                if (match) {
                  const taskGroupId = match[1].trim();
                  const taskName = match[2].trim();
                  const endTime = match[3].trim();
                  // 获取任务数量：如果value是数字，直接使用；如果是数组，使用数组长度
                  const taskCount = typeof value === 'number' ? value : (Array.isArray(value) ? value.length : 0);

                  return {
                    classId: null, // 旧格式没有班级ID
                    taskGroupId,
                    taskName,
                    taskType: '', // 旧格式没有任务类型
                    endTime,
                    taskCount: taskCount
                  };
                } else {
                  // 如果正则匹配失败，返回默认值
                  console.warn('批次信息格式解析失败:', key);
                  return {
                    classId: null,
                    taskGroupId: '',
                    taskName: key,
                    taskType: '',
                    endTime: '',
                    taskCount: typeof value === 'number' ? value : 0
                  };
                }
              }
            }
          });
          total = response.total || 0;
        } else if (response.rows) {
          // 兼容旧格式：直接是任务数组
          this.taskList = response.rows;
          total = response.total || 0;
          this.loading = false;
          return;
        } else {
          taskGroupList = [];
          total = 0;
        }

        this.taskGroupList = taskGroupList;
        this.total = total;
        // 收集所有唯一的班级ID并批量加载班级名称
        const uniqueClassIds = [...new Set(taskGroupList.map(item => item.classId).filter(id => id))];
        if (uniqueClassIds.length > 0) {
          this.loadClassNamesByIds(uniqueClassIds);
        }
        // 清空当前选中的批次和学生任务列表
        this.selectedTaskGroupId = null;
        this.currentStudentTaskList = [];
        this.currentTaskGroupName = '';
        this.studentTaskPageNum = 1;
        this.studentTaskPageSize = 10;
        this.studentTaskTotal = 0;
        this.loading = false
      }).catch(error => {
        console.error('获取系统任务列表失败:', error);
        this.$message.error('获取系统任务列表失败：' + error.message);
        this.taskGroupList = [];
        this.total = 0;
        this.selectedTaskGroupId = null;
        this.currentStudentTaskList = [];
        this.currentTaskGroupName = '';
        this.studentTaskPageNum = 1;
        this.studentTaskPageSize = 10;
        this.studentTaskTotal = 0;
        this.loading = false;
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        taskId: null,
        studentId: null,
        subjectCode: null,
        knowledgeCode: [],
        taskName: null,
        taskUrl: [],
        startTime: null,
        endTime: null,
        currentProgress: null,
        goal: null,
        taskDesc: null,
        taskType: null,
        teacherId: null,
        userFname: null
      }
      this.resetForm("form")
      this.selectedStudentIds = [];
      this.selectedStudentLabels = [];
      this.sidOptions = []; // 重置题目选项
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // 如果显示学生任务详情，搜索学生任务
      if (this.showStudentTasks && this.selectedTaskGroupId) {
        this.studentTaskPageNum = 1;
        const searchParams = { ...this.queryParams };
        // 处理学生ID数组
        if (Array.isArray(searchParams.studentId)) {
          searchParams.studentId = searchParams.studentId.join(',');
        }
        // 处理任务状态参数
        if (searchParams.taskStatus) {
          if (searchParams.taskStatus === 'completed') {
            searchParams.currentProgress = '100';
          } else if (searchParams.taskStatus === 'incomplete') {
            searchParams.currentProgress = '0';
          }
          delete searchParams.taskStatus;
        }
        // 移除批次搜索不需要的参数
        delete searchParams.num;
        delete searchParams.siz;
        this.loadStudentTaskList(this.selectedTaskGroupId, searchParams);
        return;
      }

      // 批次列表搜索：使用任务名称、任务类型和结束时间
      this.queryParams.num = 1;
      const queryParams = { ...this.queryParams };
      // 只保留批次搜索需要的参数（任务名称、任务类型、结束时间）
      const batchQueryParams = {
        num: queryParams.num,
        siz: queryParams.siz,
        taskName: queryParams.taskName || null,
        taskType: queryParams.taskType || null,
        endTime: queryParams.endTime || null
      };
      this.getList(batchQueryParams);
    },
    /** 搜索表单章节选择处理 */
    handleChapterChange(value) {
      if (value) {
        // 构建完整路径
        const fullPath = this.buildChapterPath(value)
        this.queryParams.knowledgeCode = fullPath

        // 检查是否为叶子节点，给出友好提示
        const lastVal = Array.isArray(value) ? value[value.length - 1] : value;
        const isLeaf = this.isLeafNode(lastVal);
        console.log('章节选择调试 - value:', value, 'lastVal:', lastVal, 'isLeaf:', isLeaf);
        if (!isLeaf) {
          this.$message({
            message: '您选择了父级目录，建议选择到具体的章节节点以获得更精确的结果',
            type: 'info',
            duration: 3000
          })
        }
      }
      this.handleQuery()
    },
    /** 表单章节选择处理 */
    handleFormChapterChange(value) {
      if (value) {
        // 检查是否为叶子节点，给出友好提示
        const lastVal = Array.isArray(value) ? value[value.length - 1] : value;
        const isLeaf = this.isLeafNode(lastVal);
        if (!isLeaf) {
          this.$message({
            message: '您选择了父级目录，建议选择到具体的章节节点以获得更精确的结果',
            type: 'info',
            duration: 3000
          });
        }
        // 章节变化时，任务类型为章节题自动请求题目列表
        if (this.form.taskType === '章节题') {
          const chapterPath = Array.isArray(value) ? value : [value];
          // 如果cascader value是label路径，直接join；如果是id路径，需做label转id
          listSid({ a: chapterPath.join('/') }).then(res => {
            this.sidOptions = Array.isArray(res) ? res : [];
          });
        }
      } else {
        this.sidOptions = [];
      }
    },
    /** 构建章节完整路径 */
    buildChapterPath(value) {
      const findPath = (options, targetValue, currentPath = []) => {
        for (let option of options) {
          const newPath = [...currentPath, option.label]

          if (option.value === targetValue) {
            return newPath.join('/')
          }

          if (option.children && option.children.length > 0) {
            const found = findPath(option.children, targetValue, newPath)
            if (found) return found
          }
        }
        return null
      }

      return findPath(this.chapterOptions, value) || value
    },
    /** 检查是否为叶子节点 */
    isLeafNode(value) {
      const findNode = (options, targetValue) => {
        for (let option of options) {
          if (option.value === targetValue) {
            return !option.children || option.children.length === 0
          }
          if (option.children && option.children.length > 0) {
            const found = findNode(option.children, targetValue)
            if (found !== null) return found
          }
        }
        return null
      }
      const result = findNode(this.chapterOptions, value)
      // 如果找不到节点，默认认为是叶子节点（避免误报）
      return result === null ? true : result
    },


    /** 重置按钮操作 */
    resetQuery() {
      // 确保章节重置为数组
      this.queryParams.knowledgeCode = []
      this.queryParams.classId = null // 重置班级ID为null
      this.queryParams.studentId = null // 重置学生ID为null
      this.queryParams.teacherNick = ""
      this.queryParams.teacherId = null
      this.queryParams.taskUrl = null
      this.queryParams.taskStatus = null
      this.queryParams.currentProgress = null // 重置进度查询参数
      this.queryParams.taskType = null // 重置任务类型（批次搜索和学生任务搜索共用）
      this.queryParams.taskName = null // 重置任务名称
      this.queryParams.endTime = null // 重置结束时间
      this.filteredStudentOptions = [] // 重置筛选后的学生选项
      // 清空批次相关状态
      this.selectedTaskGroupId = null
      this.currentStudentTaskList = []
      this.currentTaskGroupName = ''
      this.studentTaskPageNum = 1
      this.studentTaskPageSize = 10
      this.studentTaskTotal = 0
      this.handleQuery()
    },
    /** 班级变化处理 */
    handleClassChange(classId) {
      // 清空学生选择
      this.queryParams.studentId = null;

      if (classId) {
        // 根据班级ID获取学生列表
        this.loadStudentsByClass(classId).then(() => {
          // 加载完学生列表后自动触发搜索
          this.handleQuery();
        });
      } else {
        // 如果没有选择班级，清空学生选项
        this.filteredStudentOptions = [];
        // 触发搜索
        this.handleQuery();
      }
    },
    /** 根据班级ID加载学生列表 */
    loadStudentsByClass(classId) {
      return getStudentList({
        deptId: classId,
        pageNum: 1,
        pageSize: 1000
      }).then(response => {
        if (response.code === 200) {
          this.filteredStudentOptions = response.rows || response.data || [];
        } else {
          this.$message.error('获取班级学生列表失败：' + response.msg);
          this.filteredStudentOptions = [];
        }
        return Promise.resolve();
      }).catch(error => {
        this.$message.error('获取班级学生列表失败：' + error.message);
        this.filteredStudentOptions = [];
        return Promise.reject(error);
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.taskId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push('/system/task/addTask')
    },
    async handleUpdate(row) {
      this.reset();
      const taskId = row.taskId || this.ids;
      const response = await getTask(taskId);
      this.form = response.data;

      // 确保章节options已加载
      if (!this.chapterOptions || this.chapterOptions.length === 0) {
        await this.loadChapterList(); // 你已有的加载章节方法
      }

      // 处理学科代码回显，现在已经是单个值
      if (!this.form.subjectCode) {
        this.form.subjectCode = null
      }

      // 章节回显：数据库返回字符串，需要切割成数组用于cascader
      if (this.form.knowledgeCode && typeof this.form.knowledgeCode === 'string') {
        // 切割字符串为label数组
        const labelArr = this.form.knowledgeCode.split('/').filter(Boolean);
        // 将label数组转换为value数组用于cascader回显
        this.form.knowledgeCode = this.findValuePathByLabels(this.chapterOptions, labelArr);
      } else if (!this.form.knowledgeCode) {
        this.form.knowledgeCode = [];
      }

      // 回显学生
      if (this.form.studentId) {
        this.selectedStudentIds = this.form.studentId.split(',');
        // 需要根据 studentTreeData 找到 label
        const findLabels = (tree, ids) => {
          let labels = [];
          tree.forEach(node => {
            if (node.type === 'user' && ids.includes(String(node.id))) {
              labels.push(node.label);
            }
            if (node.children && node.children.length) {
              labels = labels.concat(findLabels(node.children, ids));
            }
          });
          return labels;
        };
        this.selectedStudentLabels = findLabels(this.studentTreeData, this.selectedStudentIds);
      } else {
        this.selectedStudentIds = [];
        this.selectedStudentLabels = [];
      }

      // 处理任务资源回显，将逗号分隔的字符串转换为数组
      if (this.form.taskUrl) {
        this.form.taskUrl = this.form.taskUrl.split(',').filter(item => item.trim() !== '')
      } else {
        this.form.taskUrl = []
      }

      // 回显任务类型
      this.form.taskType = row.taskType;

      // 回显题目选项（如果任务类型为章节题且有章节）
      if (this.form.taskType === '章节题' && this.form.knowledgeCode && this.form.knowledgeCode.length > 0) {
        const chapterPath = this.form.knowledgeCode.join('/');
        listSid({ a: chapterPath }).then(res => {
          this.sidOptions = Array.isArray(res) ? res : [];
        });
      } else {
        this.sidOptions = [];
      }

      this.open = true;
      this.title = "修改系统任务";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 处理学科代码，现在已经是单个值
          const formData = { ...this.form }
          // 处理章节代码，存储完整路径
          if (Array.isArray(formData.knowledgeCode)) {
            formData.knowledgeCode = formData.knowledgeCode.join('/')
          } else if (formData.knowledgeCode && typeof formData.knowledgeCode === 'string') {
            // 如果已经是字符串，直接使用
            formData.knowledgeCode = formData.knowledgeCode
          }

          // 处理学生ID，将数组转换为逗号分隔的字符串
          if (Array.isArray(formData.studentId)) {
            formData.studentId = formData.studentId.join(',');
          }

          // 处理任务资源，将数组转换为逗号分隔的字符串
          if (Array.isArray(formData.taskUrl)) {
            formData.taskUrl = formData.taskUrl.join(',');
          }

          if (this.form.taskId != null) {
            updateTask(formData).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addTask(formData).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const taskIds = row.taskId || this.ids

      // 获取学生姓名用于提示
      let studentName = '';
      if (row && row.studentId) {
        // 单个删除：直接从 row 中获取学生ID
        studentName = this.getStudentName(row.studentId);
      } else if (this.ids && this.ids.length > 0) {
        // 批量删除：从当前学生任务列表中查找第一个任务的学生姓名
        if (this.currentStudentTaskList && this.currentStudentTaskList.length > 0) {
          const selectedTask = this.currentStudentTaskList.find(task => task.taskId === this.ids[0]);
          if (selectedTask && selectedTask.studentId) {
            studentName = this.getStudentName(selectedTask.studentId);
          }
        }
      }

      // 构建确认消息
      let confirmMessage = '';
      if (studentName) {
        if (this.ids && this.ids.length > 1) {
          // 批量删除多个任务
          confirmMessage = `是否确认删除学生"${studentName}"等 ${this.ids.length} 个任务？`;
        } else {
          // 单个删除
          confirmMessage = `是否确认删除学生"${studentName}"的任务？`;
        }
      } else {
        // 无法获取学生姓名时，使用默认提示
        if (this.ids && this.ids.length > 1) {
          confirmMessage = `是否确认删除 ${this.ids.length} 个任务？`;
        } else {
          confirmMessage = `是否确认删除系统任务编号为"${taskIds}"的数据项？`;
        }
      }

      this.$modal.confirm(confirmMessage).then(() => {
        return delTask(taskIds)
      }).then(() => {
        this.$modal.msgSuccess("删除成功")
        // 如果当前在学生任务详情视图，刷新学生任务列表；否则刷新批次列表
        if (this.showStudentTasks && this.selectedTaskGroupId) {
          // 保留当前搜索条件重新加载学生任务列表
          const searchParams = { ...this.queryParams };
          if (Array.isArray(searchParams.studentId)) {
            searchParams.studentId = searchParams.studentId.join(',');
          }
          if (searchParams.taskStatus) {
            if (searchParams.taskStatus === 'completed') {
              searchParams.currentProgress = '100';
            } else if (searchParams.taskStatus === 'incomplete') {
              searchParams.currentProgress = '0';
            }
            delete searchParams.taskStatus;
          }
          delete searchParams.num;
          delete searchParams.siz;
          this.loadStudentTaskList(this.selectedTaskGroupId, searchParams);
        } else {
          // 在批次列表视图，刷新批次列表
          this.getList()
        }
      }).catch(() => {})
    },
    /** 删除批次任务 */
    handleDeleteTaskGroup(row) {
      if (!row.taskGroupId) {
        this.$message.error('批次ID不能为空');
        return;
      }

      const taskName = row.taskName || '该批次';
      const taskCount = row.taskCount || 0;

      this.$modal.confirm(
        `是否确认删除批次任务"${taskName}"？\n删除后将同时删除该批次下的 ${taskCount} 个学生任务，此操作不可恢复！`
      ).then(() => {
        return deleteByTaskGroupId(row.taskGroupId)
      }).then(() => {
        this.$modal.msgSuccess("删除成功")
        // 如果当前正在查看该批次的学生任务详情，关闭详情视图
        if (this.selectedTaskGroupId === row.taskGroupId) {
          this.closeStudentTaskView()
        }
        // 刷新批次列表
        this.getList()
      }).catch(() => {})
    },
    /** 处理下拉菜单命令 */
    handleCommand(command) {
      if (command.action === 'view') {
        this.handleViewTaskGroup(command.row);
      } else if (command.action === 'report') {
        this.handleReport(command.row);
      } else if (command.action === 'delete') {
        this.handleDeleteTaskGroup(command.row);
      }
    },
    /** 跳转到作业报告页面 */
    handleReport(row) {
      if (!row.classId) {
        this.$message.warning('该批次任务没有关联班级，无法查看作业报告');
        return;
      }
      if (!row.taskGroupId) {
        this.$message.warning('批次ID不能为空');
        return;
      }
      this.$router.push({
        path: '/system/task/report',
        query: {
          class_id: row.classId,
          task_group_id: row.taskGroupId,
          task_type: row.taskType || ''
        }
      });
    },
    /** 根据章节代码获取章节显示名称 */
    getChapterDisplay(chapterCode) {
      if (!chapterCode) return ''
      // 递归查找章节名称
      const findChapterName = (options, targetValue) => {
        for (let option of options) {
          if (option.value === targetValue) {
            return option.label
          }
          if (option.children && option.children.length > 0) {
            const found = findChapterName(option.children, targetValue)
            if (found) return found
          }
        }
        return targetValue
      }
      return findChapterName(this.chapterOptions, chapterCode)
    },
    /** 根据章节代码查找完整的章节路径 */
    findChapterPath(chapterCode) {
      if (!chapterCode) return []

      const findPath = (options, targetValue, currentPath = []) => {
        for (let option of options) {
          const newPath = [...currentPath, option.value]

          if (option.value === targetValue) {
            return newPath
          }

          if (option.children && option.children.length > 0) {
            const found = findPath(option.children, targetValue, newPath)
            if (found) return found
          }
        }
        return null
      }

      return findPath(this.chapterOptions, chapterCode) || [chapterCode]
    },
    /** 根据文件ID获取文件名 */
    getFileNames(fileIds) {
      if (!fileIds) return ''
      const ids = fileIds.split(',').filter(id => id.trim() !== '')
      const names = ids.map(id => {
        const file = this.fileOptions.find(item => String(item.fileId) === String(id.trim()))
        return file ? `${file.userFname} (ID: ${file.fileId})` : id
      })
      return names.join(', ')
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/task/export', {
        ...this.queryParams
      }, `task_${new Date().getTime()}.xlsx`)
    },
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
    getUserName(userId) {
      if (!userId) return '-'
      const user = this.userList.find(u => u.userId === userId)
      return user ? user.nickName : `未知教师(${userId})`
    },
    queryTeacherSearch(queryString, callback) {
      const results = queryString
        ? this.userList.filter(user => {
          const nicknameMatch = user.nickName.toLowerCase().includes(queryString.toLowerCase())
          const idMatch = user.userId.toString().includes(queryString)
          return nicknameMatch || idMatch
        })
        : [...this.userList]
      callback(results.map(user => ({
        value: `${user.nickName} (ID: ${user.userId})`,
        id: user.userId,
        nickName: user.nickName
      })))
    },
    handleTeacherSelect(item) {
      this.queryParams.teacherNick = item.nickName;
      this.queryParams.teacherId = item.id;
    },
    // 加载树数据
    loadStudentTree() {
      sysDeptTree({ level: '不限' }).then(response => {
        console.log('sysDeptTree接口原始返回', response);
        // 直接赋值为 response（就是数组）
        this.studentTreeData = response;
        console.log('学生树数据', this.studentTreeData, Array.isArray(this.studentTreeData));
      }).catch(error => {
        this.$message.error('获取学生树数据失败：' + error.message)
      })
    },

    // 选中变化时
    handleStudentCheckChange(checkedNodes, checkedKeys) {
      // 只收集type为user的叶子节点
      const getLeafUserIds = (nodes) => {
        let ids = [];
        nodes.forEach(node => {
          if (node.type === 'user') {
            ids.push(node.id);
          }
          if (node.children && node.children.length) {
            ids = ids.concat(getLeafUserIds(node.children));
          }
        });
        return ids;
      };
      // 获取所有选中的user节点
      const checkedUserNodes = this.$refs.studentTree.getCheckedNodes(true).filter(n => n.type === 'user');
      this.selectedStudentIds = checkedUserNodes.map(n => n.id);
      this.selectedStudentLabels = checkedUserNodes.map(n => n.label);
      // 存到form
      this.form.studentId = this.selectedStudentIds.join(',');
    },

    // 打开弹窗
    openStudentDialog() {
      // 如果数据没加载，弹窗打开时再加载一次
      if (!this.studentTreeData || this.studentTreeData.length === 0) {
        this.loadStudentTree();
      }
      this.studentDialogVisible = true;
      this.$nextTick(() => {
        if (this.$refs.studentTree) {
          this.$refs.studentTree.setCheckedKeys(this.selectedStudentIds);
        }
      });
      console.log('弹窗打开时 studentTreeData', this.studentTreeData, Array.isArray(this.studentTreeData));
    },

    // 确认选择
    confirmStudentSelect() {
      // 获取所有被勾选的节点
      const checkedNodes = this.$refs.studentTree.getCheckedNodes(true);

      // 递归收集所有 type=user 的叶子节点 id
      function collectUserIds(nodes) {
        let ids = [];
        nodes.forEach(node => {
          if (node.type === 'user') {
            ids.push(node.id);
          }
          if (node.children && node.children.length) {
            ids = ids.concat(collectUserIds(node.children));
          }
        });
        return ids;
      }

      // 1. 先收集所有直接勾选的用户id
      let userIds = checkedNodes.filter(n => n.type === 'user').map(n => n.id);

      // 2. 对于被勾选的部门节点，递归收集其下所有用户id
      checkedNodes
        .filter(n => !n.type || n.type !== 'user')
        .forEach(deptNode => {
          userIds = userIds.concat(collectUserIds([deptNode]));
        });

      // 3. 去重
      userIds = Array.from(new Set(userIds));

      // 4. 存到表单
      this.form.studentId = userIds.join(',');
      this.selectedStudentIds = userIds;
      this.selectedStudentLabels = this.getUserLabelsByIds(this.selectedStudentIds);
      this.studentDialogVisible = false;
    },

    // 辅助方法：根据id获取label
    getUserLabelsByIds(ids) {
      // 遍历 studentTreeData，找到所有 type=user 且 id 在 ids 里的节点，返回 label
      const labels = [];
      function walk(nodes) {
        nodes.forEach(node => {
          if (node.type === 'user' && ids.includes(String(node.id))) {
            labels.push(node.label);
          }
          if (node.children && node.children.length) {
            walk(node.children);
          }
        });
      }
      walk(this.studentTreeData);
      return labels;
    },
    // 新增：加载所有学生选项
    loadStudentOptions() {
      sysUserList().then(response => {
        // 假设 response.data 是数组，且有 userId, nick_name 字段
        this.studentOptions = response.data || [];
        // 初始化时不显示任何学生，需要先选择班级
        this.filteredStudentOptions = [];
      });
    },
    // 新增：根据学生ID字符串获取学生名称
    getStudentName(studentId) {
      if (!studentId) return '';
      // 优先从筛选后的学生列表中查找，如果没有则从全部学生列表中查找
      let stu = this.filteredStudentOptions.find(stu => String(stu.userId) === String(studentId));
      if (!stu) {
        stu = this.studentOptions.find(stu => String(stu.userId) === String(studentId));
      }
      return stu ? stu.nickName : studentId;
    },
    // 根据学生ID获取班级名称
    getClassNameByStudentId(studentId) {
      if (!studentId) return '-';
      // 从筛选后的学生列表中查找，如果找到则返回对应的班级名称
      const stu = this.filteredStudentOptions.find(stu => String(stu.userId) === String(studentId));
      if (stu && stu.deptId) {
        return this.getClassNameById(stu.deptId);
      }
      // 如果没找到，尝试从全部学生列表中查找
      const allStu = this.studentOptions.find(stu => String(stu.userId) === String(studentId));
      if (allStu && allStu.deptId) {
        return this.getClassNameById(allStu.deptId);
      }
      return '-';
    },
    // 根据班级ID获取班级名称（使用缓存）
    getClassNameById(classId) {
      if (!classId) return '-';
      // 只从缓存中获取，不自动加载（避免与批量加载重复）
      if (this.classNameCache[classId]) {
        return this.classNameCache[classId];
      }
      // 如果缓存中没有，返回班级ID作为临时显示
      // 批量加载会统一处理，不需要单独请求
      return `班级ID: ${classId}`;
    },
    // 批量加载班级名称（一次性传递数组，支持单个或多个ID）
    async loadClassNamesByIds(classIds) {
      if (!classIds || classIds.length === 0) return;

      // 过滤掉已经缓存的ID，并转换为数字或字符串数组
      const uncachedIds = classIds.filter(id => id && !this.classNameCache[id]);
      if (uncachedIds.length === 0) return;

      try {
        // 一次性传递数组给后端（直接传递数组，类似getUserInfos的方式）
        const response = await listDepts(uncachedIds);
        if (response.code === 200 && response.data && Array.isArray(response.data)) {
          // 处理返回结果，更新缓存
          response.data.forEach(item => {
            if (item && item.deptId) {
              const classId = String(item.deptId);
              const className = item.deptName || `班级ID: ${classId}`;
              this.$set(this.classNameCache, classId, className);
            }
          });
          
          // 对于没有返回结果的ID，设置默认值
          uncachedIds.forEach(id => {
            const idStr = String(id);
            if (!this.classNameCache[idStr]) {
              this.$set(this.classNameCache, idStr, `班级ID: ${idStr}`);
            }
          });
        } else {
          // 如果返回格式不符合预期，为所有ID设置默认值
          uncachedIds.forEach(id => {
            this.$set(this.classNameCache, String(id), `班级ID: ${id}`);
          });
        }
      } catch (error) {
        console.error('批量获取班级名称失败:', error);
        // 出错时为所有ID设置默认值
        uncachedIds.forEach(id => {
          this.$set(this.classNameCache, String(id), `班级ID: ${id}`);
        });
      }
    },
    // 新增：任务类型变化时，清空任务资源
    onTaskTypeChange() {
      console.log('任务类型变化为:', this.form.taskType);
      this.form.taskUrl = [];
      this.sidOptions = [];
      if (this.form.taskType === '试卷') {
        console.log('当前paperOptions:', this.paperOptions);
        console.log('paperOptions长度:', this.paperOptions.length);
      }
      // 如果是试卷类型，不需要清空paperOptions，因为已经加载了
    },
    onChapterChange(val) {
      // 章节变化时，如果是章节题类型，加载题目选项
      if (this.form.taskType === '章节题' && val) {
        listSid({ a: val }).then(res => {
          this.sidOptions = res;
        });
      } else {
        this.sidOptions = [];
      }
    },
    handleSidFocus() {
      if (!this.form.taskType) {
        this.$message.warning('请先选择任务类型');
        return;
      }
      if (this.form.taskType === '章节题' && !this.form.knowledgeCode) {
        this.$message.warning('请先选择章节');
        return;
      }
    },
    handleQueryTaskUrlFocus() {
      if (!this.queryParams.taskType) {
        this.$message.warning('请先选择任务类型');
      } else if (this.queryParams.taskType === '章节题' && !this.queryParams.knowledgeCode) {
        this.$message.warning('请先选择章节');
      }
      // 试卷类型不需要额外提示
    },
    updateQueryTaskUrlOptions() {
      console.log('更新查询任务资源选项，当前任务类型:', this.queryParams.taskType);
      if (this.queryParams.taskType === '章节题' && this.queryParams.knowledgeCode) {
        listSid({ a: this.queryParams.knowledgeCode }).then(res => {
          this.sidOptions = Array.isArray(res) ? res : [];
        });
      } else if (this.queryParams.taskType === '试卷') {
        console.log('试卷类型，当前paperOptions:', this.paperOptions);
        // 试卷类型不需要额外处理，paperOptions已加载
      } else {
        this.sidOptions = [];
      }
      // 其他类型时不需要处理，fileOptions已加载
    },
    /** 递归查找 label 路径对应的 value 路径 */
    findValuePathByLabels(options, labels) {
      let path = [];
      let currentOptions = options;
      for (let label of labels) {
        const node = currentOptions.find(opt => opt.label === label);
        if (!node) return [];
        path.push(node.value);
        currentOptions = node.children || [];
        console.log('当前options:', currentOptions, '查找label:', label);
      }
      return path;
    },
    handleQueryChapterChange(value) {
      if (value) {
        // 检查是否为叶子节点，给出友好提示
        const isLeaf = this.isLeafNode(value[value.length - 1] || value);
        if (!isLeaf) {
          this.$message({
            message: '您选择了父级目录，建议选择到具体的章节节点以获得更精确的结果',
            type: 'info',
            duration: 3000
          });
        }
      }
      this.handleChapterChange(value);
    },
    /** 根据学科代码获取学科名称 */
    getSubjectDisplay(subjectCode) {
      const subject = this.subjectOptions.find(item => item.subjectCode === subjectCode);
      return subject ? subject.subjectName : subjectCode;
    },
    /** 根据章节题ID获取章节题名称 */
    getChapterQuestionNames(questionIds) {
      if (!questionIds) return '';
      const ids = questionIds.split(',').filter(id => id.trim() !== '');
      const questions = ids.map(id => {
        const question = this.chapterQuestionOptions.find(item => String(item.id) === String(id.trim()));
        return question ? question.customPaperName : id;
      });
      return questions.join(', ');
    },
         /** 根据试卷ID获取试卷名称 */
     getPaperNames(paperIds) {
       if (!paperIds) return '';
       const ids = paperIds.split(',').filter(id => id.trim() !== '');
       const paperNames = ids.map(id => {
         const paper = this.paperOptions.find(item => String(item.id) === String(id.trim()));
         return paper ? paper.customPaperName : id;
       });
       return paperNames.join(', ');
     },
     /** 根据作业ID获取作业名称 */
     getHomeworkNames(homeworkIds) {
       if (!homeworkIds) return '';
       const ids = homeworkIds.split(',').filter(id => id.trim() !== '');
       const homeworkNames = ids.map(id => {
         const homework = this.homeworkOptions.find(item => String(item.id) === String(id.trim()));
         return homework ? homework.customPaperName : id;
       });
       return homeworkNames.join(', ');
     },
         /** 根据文件ID获取文件名称 */
     getFileNames(fileIds) {
       if (!fileIds) return '';
       const ids = fileIds.split(',').filter(id => id.trim() !== '');
       const fileNames = ids.map(id => {
         const file = this.fileOptions.find(item => String(item.fileId) === String(id.trim()));
         return file ? file.userFname : id;
       });
       return fileNames.join(', ');
     },
     /** 根据学案ID获取学案名称 */
     getStudyPlanNames(studyPlanIds) {
       if (!studyPlanIds) return '';
       const ids = studyPlanIds.split(',').filter(id => id.trim() !== '');
       const studyPlanNames = ids.map(id => {
         const studyPlan = this.studyPlanOptions.find(item => String(item.fileId) === String(id.trim()));
         return studyPlan ? studyPlan.userFname : id;
       });
       return studyPlanNames.join(', ');
     },
     /** 根据自定义作业ID获取自定义作业名称 */
     getCustomHomeworkNames(homeworkIds) {
       if (!homeworkIds) return '';
       const ids = homeworkIds.split(',').filter(id => id.trim() !== '');
       const homeworkNames = ids.map(id => {
         const homework = this.customHomeworkOptions.find(item => String(item.fileId) === String(id.trim()));
         return homework ? homework.userFname : id;
       });
       return homeworkNames.join(', ');
     },
     /** 根据自定义组卷ID获取自定义组卷名称 */
     getCustomPaperNames(paperIds) {
       if (!paperIds) return '';
       const ids = paperIds.split(',').filter(id => id.trim() !== '');
       const paperNames = ids.map(id => {
         const paper = this.customPaperOptions.find(item => String(item.fileId) === String(id.trim()));
         return paper ? paper.userFname : id;
       });
       return paperNames.join(', ');
     },
    // 查看任务详情
    handleView(row) {
      this.currentTask = row;
      this.detailVisible = true;
      this.loadTaskResourceDetails(row);
    },
    // 关闭详情弹窗
    closeDetail() {
      this.detailVisible = false;
      this.currentTask = null;
      this.taskQuestions = [];
      this.taskPapers = [];
      this.taskHomeworks = [];
      this.taskFiles = [];
      this.taskStudyPlans = [];
      this.taskVideos = [];
      this.taskCustomHomeworks = [];
      this.taskCustomPapers = [];
    },
    // 加载任务资源详情
    loadTaskResourceDetails(task) {
      if (!task.taskUrl) {
        this.taskQuestions = [];
        this.taskPapers = [];
        this.taskHomeworks = [];
        this.taskFiles = [];
        this.taskStudyPlans = [];
        this.taskVideos = [];
        this.taskCustomHomeworks = [];
        this.taskCustomPapers = [];
        return;
      }

      const ids = task.taskUrl.split(',').filter(id => id.trim() !== '');

      if (task.taskType === '试卷') {
        this.taskPapers = ids.map(id => {
          const paper = this.paperOptions.find(item => String(item.id) === String(id.trim()));
          return paper ? paper.customPaperName : id;
        });
      } else if (task.taskType === '作业') {
        this.taskHomeworks = ids.map(id => {
          const homework = this.homeworkOptions.find(item => String(item.id) === String(id.trim()));
          return homework ? homework.customPaperName : id;
        });
      } else if (task.taskType === '章节题') {
        this.taskQuestions = ids.map(id => {
          const question = this.chapterQuestionOptions.find(item => String(item.id) === String(id.trim()));
          return question ? question.customPaperName : id;
        });
      } else if (task.taskType === '学案') {
        this.taskStudyPlans = ids.map(id => {
          const studyPlan = this.studyPlanOptions.find(item => String(item.fileId) === String(id.trim()));
          return studyPlan ? studyPlan.userFname : id;
        });
      } else if (task.taskType === '教学视频') {
        this.taskVideos = ids.map(id => {
          const video = this.fileOptions.find(item => String(item.fileId) === String(id.trim()));
          return video ? video.userFname : id;
        });
      } else if (task.taskType === '自定义作业') {
        this.taskCustomHomeworks = ids.map(id => {
          const homework = this.customHomeworkOptions.find(item => String(item.fileId) === String(id.trim()));
          return homework ? homework.userFname : id;
        });
      } else if (task.taskType === '自定义组卷') {
        this.taskCustomPapers = ids.map(id => {
          const paper = this.customPaperOptions.find(item => String(item.fileId) === String(id.trim()));
          return paper ? paper.userFname : id;
        });
      } else {
        this.taskFiles = ids.map(id => {
          const file = this.fileOptions.find(item => String(item.fileId) === String(id.trim()));
          return file ? file.userFname : id;
        });
      }
    },
    // 获取进度状态
    getProgressStatus(progress) {
      const p = parseInt(progress || 0);
      if (p >= 100) return 'success';
      if (p >= 50) return 'warning';
      return 'exception';
    },
    /** 获取任务状态 */
    getTaskStatus(task) {
      if (!task) return 'incomplete';

      const progress = parseInt(task.currentProgress || 0);

      // 根据进度判断状态：进度>=100为已完成，否则为未完成
      return progress >= 100 ? 'completed' : 'incomplete';
    },
    /** 判断任务类型是否可批阅 */
    isReviewableTaskType(taskType) {
      const reviewableTypes = ['试卷', '作业', '章节题']
      return reviewableTypes.includes(taskType)
    },
    // 检查自动查看模式
    checkAutoViewMode() {
      const autoViewMode = sessionStorage.getItem('autoViewMode')
      if (autoViewMode === 'true') {
        // 立即清除标记，防止重复处理
        sessionStorage.removeItem('autoViewMode')

        // 获取选中的项目
        const selectedItemStr = sessionStorage.getItem('selectedTaskItem')

        if (selectedItemStr) {
          try {
            const selectedItem = JSON.parse(selectedItemStr)
            console.log('从主页传递的选中任务:', selectedItem)

            // 立即清除存储的数据，防止重复处理
            sessionStorage.removeItem('selectedTaskItem')

            // 等待数据加载完成后再查找对应的项目
            const checkDataLoaded = () => {
              if (this.taskGroupList && this.taskGroupList.length > 0) {
                // 在批次列表中查找对应的批次
                let targetTaskGroup = null;
                let targetTask = null;

                // 先查找批次
                for (const group of this.taskGroupList) {
                  if (group.taskName === selectedItem.taskName) {
                    targetTaskGroup = group;
                    // 如果有批次ID，加载学生任务详情并查找具体任务
                    if (group.taskGroupId) {
                      this.handleViewTaskGroup(group);
                      // 等待学生任务列表加载完成后查找具体任务
                      this.$nextTick(() => {
                        setTimeout(() => {
                          if (this.currentStudentTaskList && this.currentStudentTaskList.length > 0) {
                            targetTask = this.currentStudentTaskList.find(task =>
                              task.taskId === selectedItem.taskId ||
                              task.taskName === selectedItem.taskName
                            );
                            if (targetTask) {
                              this.handleView(targetTask);
                            }
                          }
                        }, 500);
                      });
                    }
                    break;
                  }
                }

                if (!targetTaskGroup) {
                  this.$message.warning('未找到对应的任务项目');
                }
              } else {
                // 如果数据还没加载完成，等待100ms后再次检查
                setTimeout(checkDataLoaded, 100)
              }
            }

            // 开始检查数据是否加载完成
            checkDataLoaded()

          } catch (error) {
            console.error('解析选中任务失败:', error)
            sessionStorage.removeItem('selectedTaskItem')
          }
        }
      }
    },
    /** 批阅作业 */
    handleReview(row) {
      // 跳转到批阅页面，传递taskId参数
      this.$router.push({
        path: '/system/task/review',
        query: {
          taskId: row.taskId,
          taskName: row.taskName,
          studentId: row.studentId
        }
      })

      // 跳转后立即发送请求获取新的做题记录
      this.$nextTick(() => {
        // 通过事件总线通知批阅页面刷新数据
        this.$bus.$emit('refreshReviewData', {
          taskId: row.taskId,
          taskName: row.taskName,
          studentId: row.studentId
        })
      })
    },
    /** 批阅按钮悬停效果 */
    handleReviewHover(event, isHover) {
      const button = event.target;
      if (isHover) {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 8px rgba(103, 194, 58, 0.4)';
        button.style.background = 'linear-gradient(135deg, #85ce61 0%, #95d475 100%)';
      } else {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 4px rgba(103, 194, 58, 0.3)';
        button.style.background = 'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)';
      }
    },
    /** 处理分页事件 */
    handlePagination(pagination) {
      // 将分页组件的 page/limit 参数转换为 num/siz 参数
      const queryParams = { ...this.queryParams }
      queryParams.num = pagination.page
      queryParams.siz = pagination.limit

      if (Array.isArray(queryParams.studentId)) {
        queryParams.studentId = queryParams.studentId.join(',');
      }
      // 章节参数使用完整路径
      if (Array.isArray(queryParams.knowledgeCode)) {
        queryParams.knowledgeCode = queryParams.knowledgeCode.join('/')
      }

      this.getList(queryParams)
    },
    /** 查看批次任务详情 */
    handleViewTaskGroup(taskGroup) {
      // 设置选中的批次ID
      this.selectedTaskGroupId = taskGroup.taskGroupId;
      // 设置当前批次任务名称
      this.currentTaskGroupName = taskGroup.taskName || '';
      // 重置学生任务分页
      this.studentTaskPageNum = 1;
      this.studentTaskPageSize = 10;
      this.studentTaskTotal = 0;
      // 调用接口获取学生任务详情
      this.loadStudentTaskList(taskGroup.taskGroupId);
    },
    /** 加载学生任务详情列表 */
    loadStudentTaskList(taskGroupId, searchParams) {
      if (!taskGroupId) {
        this.$message.error('批次ID不能为空');
        return;
      }

      this.studentTaskLoading = true;
      const params = {
        taskGroupId: taskGroupId,
        pageNum: this.studentTaskPageNum,
        pageSize: this.studentTaskPageSize
      };

      // 如果有搜索参数，添加到请求中
      if (searchParams) {
        Object.assign(params, searchParams);
      }

      listByTaskGroupId(params).then(response => {
        if (response.code === 200) {
          this.currentStudentTaskList = response.rows || [];
          this.studentTaskTotal = response.total || 0;
        } else {
          this.$message.error('获取学生任务详情失败：' + response.msg);
          this.currentStudentTaskList = [];
          this.studentTaskTotal = 0;
        }
        this.studentTaskLoading = false;
      }).catch(error => {
        console.error('获取学生任务详情失败:', error);
        this.$message.error('获取学生任务详情失败：' + error.message);
        this.currentStudentTaskList = [];
        this.studentTaskTotal = 0;
        this.studentTaskLoading = false;
      });
    },
    /** 关闭学生任务视图 */
    closeStudentTaskView() {
      this.selectedTaskGroupId = null;
      this.currentStudentTaskList = [];
      this.currentTaskGroupName = '';
      this.studentTaskPageNum = 1;
      this.studentTaskPageSize = 10;
      this.studentTaskTotal = 0;
      // 返回总任务列表时，刷新批次任务列表
      this.getList();
    },
    /** 处理学生任务分页 */
    handleStudentTaskPagination(pagination) {
      this.studentTaskPageNum = pagination.page;
      this.studentTaskPageSize = pagination.limit;
      // 如果使用后端分页，重新加载数据（保留当前搜索条件）
      if (this.studentTaskTotal > 0 && this.selectedTaskGroupId) {
        // 构建搜索参数
        const searchParams = { ...this.queryParams };
        if (Array.isArray(searchParams.studentId)) {
          searchParams.studentId = searchParams.studentId.join(',');
        }
        if (searchParams.taskStatus) {
          if (searchParams.taskStatus === 'completed') {
            searchParams.currentProgress = '100';
          } else if (searchParams.taskStatus === 'incomplete') {
            searchParams.currentProgress = '0';
          }
          delete searchParams.taskStatus;
        }
        delete searchParams.num;
        delete searchParams.siz;
        this.loadStudentTaskList(this.selectedTaskGroupId, searchParams);
      }
    }
  }
}
</script>

<style scoped lang="scss">
// 表格列头筛选样式
.table-header-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .el-select {
    width: 100%;
  }
}

// 表格列头搜索名称样式
.table-header-search-name {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 5px;

  .search-input {
    width: 60%;
    max-width: 200px;
    padding-right: 5px;
  }

  .search-button {
    flex-shrink: 0;
    padding: 8px 9px;
  }
}



.task-detail {
  .detail-section {
    margin-top: 20px;

    h4 {
      margin: 0 0 15px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
      border-bottom: 2px solid #409eff;
      padding-bottom: 8px;
    }

    .resource-info {
      .el-tag {
        margin: 2px;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .no-data {
      color: #909399;
      font-style: italic;
    }
  }
}
</style>

<!-- 全局样式：下拉框选项居中对齐 -->
<style lang="scss">
// 由于 Element UI 的下拉框挂载到 body，需要使用全局样式
.el-select-dropdown__item {
  text-align: center !important;

  span {
    display: block;
    text-align: center !important;
    width: 100%;
  }
}

// 下拉菜单项样式
.el-dropdown-menu__item {
  &:hover {
    background-color: #f5f7fa;
  }

  // 删除按钮样式（红色文字项）
  &[style*="color: #f56c6c"],
  &[style*="color:#f56c6c"] {
    &:hover {
      background-color: #fef0f0;
    }
  }
}
</style>
