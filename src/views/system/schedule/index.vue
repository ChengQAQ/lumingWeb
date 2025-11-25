<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="班级" prop="classId">
        <el-autocomplete
          v-model="queryParams.className"
          :fetch-suggestions="queryClassSearch"
          :trigger-on-focus="true"
          clearable
          placeholder="请输入或选择班级"
          @select="handleClassSelect"
          style="width: 100%;"
        ></el-autocomplete>
        <input type="hidden" v-model="queryParams.classId" />
      </el-form-item>
      <!-- <el-form-item label="课程科目" prop="subject">
        <el-select
          v-model="queryParams.subject"
          placeholder="请选择课程科目"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="subject in subjectList"
            :key="subject.subjectCode"
            :label="`${subject.subjectName}`"
            :value="subject.subjectCode"
          />
        </el-select>
      </el-form-item> -->
      <!-- <el-form-item label="授课教师" prop="teacherId">
        <el-autocomplete
          v-model="queryParams.teacherNick"
          :fetch-suggestions="queryTeacherSearch"
          :trigger-on-focus="true"
          clearable
          placeholder="请输入或选择授课教师"
          @select="handleTeacherSelect"
          style="width: 100%;"
        ></el-autocomplete>
        <input type="hidden" v-model="queryParams.teacherId" />
      </el-form-item> -->
      <el-form-item label="课程日期" prop="courseDate">
        <el-date-picker clearable
          v-model="queryParams.courseDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择课程日期">
        </el-date-picker>
      </el-form-item>
      <!-- <el-form-item label="当天课程开始时间" prop="startTime" label-width="auto">
        <el-time-picker
          v-model="queryParams.startTime"
          value-format="HH:mm:ss"
          placeholder="请选择当天课程开始时间"
          clearable>
        </el-time-picker>
      </el-form-item>
      <el-form-item label="当天课程结束时间" prop="endTime" label-width="auto">
        <el-time-picker
          v-model="queryParams.endTime"
          value-format="HH:mm:ss"
          placeholder="请选择当天课程结束时间"
          clearable>
        </el-time-picker>
      </el-form-item> -->
      <el-form-item label="上课地点" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入上课地点"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

         <el-row :gutter="10" class="mb8">
       <el-col :span="1.5">
         <el-button
           type="primary"
           plain
           icon="el-icon-plus"
           size="mini"
           @click="handleAdd"
           v-hasPermi="['system:schedule:add']"
         >新增</el-button>
       </el-col>
       <el-col :span="1.5">
         <el-button
           type="warning"
           plain
           icon="el-icon-download"
           size="mini"
           @click="handleExport"
           v-hasPermi="['system:schedule:export']"
         >导出</el-button>
       </el-col>
       <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
     </el-row>

    <!-- 日历视图 -->
    <div class="calendar-container">
      <!-- 日历头部 -->
      <div class="calendar-header">
        <div class="calendar-nav">
          <el-button size="small" @click="goToToday">今天</el-button>
          <el-button size="small" icon="el-icon-arrow-left" @click="previousWeek"></el-button>
          <el-button size="small" icon="el-icon-arrow-right" @click="nextWeek"></el-button>
          <span class="current-week">{{ currentWeekText }}</span>
        </div>
        <!-- <div class="view-switcher">
          <el-button size="small" :type="viewType === 'day' ? 'primary' : ''" @click="switchView('day')">日</el-button>
          <el-button size="small" :type="viewType === 'week' ? 'primary' : ''" @click="switchView('week')">周</el-button>
          <el-button size="small" :type="viewType === 'month' ? 'primary' : ''" @click="switchView('month')">月</el-button>

        </div> -->
      </div>

      <!-- 日历网格 -->
      <div class="calendar-grid">
        <!-- 时间轴 -->
        <div class="time-axis">
          <div class="timezone-info">
            <!-- <div>GMT+8</div> -->
            <div style="font-size: 10px; color: #909399;">
              {{ getCurrentTimezoneInfo() }}
            </div>
          </div>
          <div 
            v-for="timeSlot in timeSlots" 
            :key="timeSlot.time"
            class="time-slot"
            :class="{ 
              'current-time': isCurrentTime(timeSlot.time),
              'section-header': timeSlot.isSection 
            }"
          >
            {{ getTimeSlotDisplay(timeSlot) }}
          </div>
        </div>

        <!-- 日期列 -->
        <div class="date-columns">
          <div 
            v-for="date in weekDates" 
            :key="date.date"
            class="date-column"
            :class="{ 'today': isToday(date.date) }"
          >
            <!-- 日期头部 -->
            <div class="date-header">
              <div class="day-name">{{ date.dayName }}</div>
              <div class="day-number">{{ date.dayNumber }}</div>
            </div>

            <!-- 时间槽 -->
            <div class="time-slots">
                                             <div 
                  v-for="timeSlot in timeSlots" 
                  :key="timeSlot.time"
                  class="time-slot-cell"
                  :class="{ 
                    'current-time': isCurrentTime(timeSlot.time) && isToday(date.date),
                    'has-schedule': getSchedulesForTimeSlot(date.date, timeSlot.time).length > 0,
                    'section-header': timeSlot.isSection
                  }"
                  @click="handleTimeSlotClick(date.date, timeSlot.time, getSchedulesForTimeSlot(date.date, timeSlot.time))"
                >
                   <!-- 课程方块 - 为所有课程显示统一的方块格式 -->
                   <div 
                     v-for="schedule in getSchedulesForTimeSlot(date.date, timeSlot.time)"
                     :key="schedule.scheduleId"
                     class="schedule-block"
                     :style="getScheduleBlockStyle(schedule)"
                     @click.stop="showScheduleDetail(schedule)"
                   >
                     <div class="schedule-content">
                       <div class="schedule-title">{{ getSchedulePreviewText(schedule) }}</div>
                     </div>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>

         <!-- 课程详情弹窗 -->
     <el-dialog 
       title="课程详情" 
       :visible.sync="scheduleDetailVisible" 
       width="600px" 
       append-to-body
       @close="closeScheduleDetail"
     >
       <div v-if="selectedSchedule" class="schedule-detail">
         <div class="detail-section">
           <h4>基本信息</h4>
           <div class="detail-row">
             <span class="detail-label">班级：</span>
             <span class="detail-value">{{ getClassName(selectedSchedule.classId) }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">课程科目：</span>
             <span class="detail-value">{{ getSubjectDisplay(selectedSchedule.subject) }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">授课教师：</span>
             <span class="detail-value">{{ getUserName(selectedSchedule.teacherId) }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">课程日期：</span>
             <span class="detail-value">{{ parseTime(selectedSchedule.courseDate, '{y}-{m}-{d}') }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">开始时间：</span>
             <span class="detail-value">{{ selectedSchedule.startTime || '-' }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">结束时间：</span>
             <span class="detail-value">{{ selectedSchedule.endTime || '-' }}</span>
           </div>
           <div class="detail-row">
             <span class="detail-label">上课地点：</span>
             <span class="detail-value">{{ selectedSchedule.location || '地点待定' }}</span>
           </div>
           <div class="detail-row" v-if="selectedSchedule.remark">
             <span class="detail-label">备注：</span>
             <span class="detail-value">{{ selectedSchedule.remark }}</span>
           </div>
         </div>
       </div>
       <div slot="footer" class="dialog-footer">
         <el-button @click="scheduleDetailVisible = false">关闭</el-button>
         <el-button type="primary" @click="editSchedule">编辑</el-button>
         <el-button type="danger" @click="deleteSchedule">删除</el-button>
       </div>
     </el-dialog>

           <!-- 时间槽课程详情弹窗 -->
      <el-dialog 
        title="时间槽课程详情" 
        :visible.sync="timeSlotDetailVisible" 
        width="600px" 
        append-to-body
        @close="timeSlotDetailVisible = false"
      >
        <div v-if="selectedSchedule" class="schedule-detail">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-row">
              <span class="detail-label">班级：</span>
              <span class="detail-value">{{ getClassName(selectedSchedule.classId) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">课程科目：</span>
              <span class="detail-value">{{ getSubjectDisplay(selectedSchedule.subject) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">授课教师：</span>
              <span class="detail-value">{{ getUserName(selectedSchedule.teacherId) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">课程日期：</span>
              <span class="detail-value">{{ parseTime(selectedSchedule.courseDate, '{y}-{m}-{d}') }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">开始时间：</span>
              <span class="detail-value">{{ selectedSchedule.startTime || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">结束时间：</span>
              <span class="detail-value">{{ selectedSchedule.endTime || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">上课地点：</span>
              <span class="detail-value">{{ selectedSchedule.location || '地点待定' }}</span>
            </div>
            <div class="detail-row" v-if="selectedSchedule.remark">
              <span class="detail-label">备注：</span>
              <span class="detail-value">{{ selectedSchedule.remark }}</span>
            </div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="timeSlotDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="editSelectedSchedule" :disabled="!selectedSchedule">编辑</el-button>
          <el-button type="danger" @click="deleteSelectedSchedule" :disabled="!selectedSchedule">删除</el-button>
        </div>
      </el-dialog>

     <!-- 添加或修改班级排课对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="班级" prop="classId">
          <el-autocomplete
            v-model="form.className"
            :fetch-suggestions="queryClassSearch"
            :trigger-on-focus="true"
            clearable
            placeholder="请输入或选择班级"
            @select="handleFormClassSelect"
            style="width: 100%;"
          ></el-autocomplete>
          <input type="hidden" v-model="form.classId" />
        </el-form-item>
        <el-form-item label="课程科目" prop="subject">
          <el-input
            :value="teacherSubjectNames || '正在获取您的教学科目...'"
            placeholder="正在获取您的教学科目..."
            readonly
            disabled
          >
            <template slot="prepend">
              <i class="el-icon-book"></i>
            </template>
          </el-input>
          <div class="form-tip">
            <i class="el-icon-info"></i>
            科目已自动设置为您的教学科目，无需手动选择
          </div>
        </el-form-item>
        <!-- <el-form-item label="授课教师ID" prop="teacherId">
          <el-input v-model="form.teacherId" placeholder="请输入授课教师ID（后端自动分配）" disabled />
        </el-form-item> -->
        <el-form-item label="课程日期" prop="courseDate">
          <el-date-picker clearable
            v-model="form.courseDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择课程日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="当天课程开始时间" prop="startTime">
          <el-time-picker
            v-model="form.startTime"
            value-format="HH:mm:ss"
            placeholder="请选择当天课程开始时间">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="当天课程结束时间" prop="endTime">
          <el-time-picker
            v-model="form.endTime"
            value-format="HH:mm:ss"
            placeholder="请选择当天课程结束时间">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入上课地点" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 表单提示样式 */
.form-tip {
  margin-top: 5px;
  padding: 5px 8px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.form-tip i {
  margin-right: 5px;
  font-size: 14px;
}

/* 只读输入框样式 */
.el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

/* 前置图标样式 */
.el-input-group__prepend {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
}
</style>

<script>
import { listSchedule, getSchedule, delSchedule, addSchedule, updateSchedule } from "@/api/system/schedule"
import { sysUserList, sysSubjectList } from "@/api/system/task"
import { getDeptIdByClassName } from "@/api/system/knowledge"
import { getTeacherInfo } from "@/api/system/teacher"
import { getActualCourseTime, getTimeSlots, getScheduleInfo } from "@/utils/scheduleTimeTable"

export default {
  name: "Schedule",
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
      // 班级排课表格数据
      scheduleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        classId: null,
        className: "", // 新增：班级名称
        subject: null,
        teacherId: null,
        teacherNick: "",
        courseDate: null,
        startTime: null,
        endTime: null,
        location: null,
      },
      // 表单参数
      form: {},
      // 教师信息
      teacherInfo: null,
      teacherSubjectNames: null,
      // 表单校验
      rules: {
        classId: [
          { required: true, message: "班级不能为空", trigger: "blur" }
        ],
        subject: [
          { required: true, message: "课程科目不能为空", trigger: "blur" }
        ],
        teacherId: [
          { required: true, message: "授课教师ID不能为空", trigger: "blur" }
        ],
        courseDate: [
          { required: true, message: "课程日期不能为空", trigger: "blur" }
        ],
        startTime: [
          { required: true, message: "当天课程开始时间不能为空", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "当天课程结束时间不能为空", trigger: "blur" }
        ],
      },
      // 课程科目列表
      subjectList: [],
      // 用户列表
      userList: [],
      // 班级列表
      classList: [],
      // 日历相关数据
      viewType: 'week', // 视图类型：day, week, month
      currentDate: new Date(),
             scheduleDetailVisible: false,
       selectedSchedule: null,
       timeSlotDetailVisible: false,
       timeSlotSchedules: [],
       timeSlotDate: '',
       timeSlotTime: '',
       timeSlots: [],
       weekDates: []
    }
  },
  created() {
    this.getList()
    this.getSubjectList()
    this.getUserList()
    this.getClassList()
    this.getTeacherInfo()
    this.initCalendar()
    this.showScheduleInfo()
  },
  computed: {
    currentWeekText() {
      if (this.weekDates.length === 0) return ''
      const startDate = this.weekDates[0].date
      const endDate = this.weekDates[6].date
      const start = new Date(startDate)
      const end = new Date(endDate)
      return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`
    }
  },
  methods: {
    /** 查询班级排课列表 */
    getList() {
      this.loading = true
      // 为日历视图获取所有课程数据，不分页
      const params = { ...this.queryParams }
      params.pageSize = 1000 // 设置一个较大的值以获取所有数据
      params.pageNum = 1
      
      listSchedule(params).then(response => {
        // 兼容不同的响应格式
        if (response.code === 200) {
          this.scheduleList = response.rows || [];
          this.total = response.total || 0;
        } else if (response.rows) {
          this.scheduleList = response.rows;
          this.total = response.total || 0;
        } else {
          this.scheduleList = [];
          this.total = 0;
        }
        
        // 修复日期格式问题：标准化所有课程的日期
        this.scheduleList.forEach(schedule => {
          if (schedule.courseDate) {
            schedule.courseDate = this.normalizeDate(schedule.courseDate);
          }
        });
        

        this.loading = false
      }).catch(error => {
        console.error('获取班级排课列表失败:', error);
        this.$message.error('获取班级排课列表失败：' + error.message);
        this.scheduleList = [];
        this.total = 0;
        this.loading = false;
      })
    },
    /** 查询课程科目列表 */
    getSubjectList() {
      sysSubjectList().then(response => {
        // 兼容不同的响应格式
        if (response.code === 200) {
          this.subjectList = response.data || [];
        } else if (response.data) {
          this.subjectList = response.data;
        } else {
          this.subjectList = [];
        }
      }).catch(error => {
        console.error('获取科目列表失败:', error);
        this.$message.error('获取科目列表失败：' + error.message);
        this.subjectList = [];
      })
    },
    /** 查询用户列表 */
    getUserList() {
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
    /** 查询班级列表 */
    getClassList() {
      getDeptIdByClassName().then(response => {
        if (response.code === 200) {
          this.classList = response.data || []

        } else {
          this.$message.error('获取班级列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取班级列表失败：' + error.message)
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
        scheduleId: null,
        classId: null,
        className: "", // 新增：班级名称
        subject: this.teacherSubjectNames || null, // 自动设置为教师科目名称
        teacherId: null,
        courseDate: null,
        startTime: null,
        endTime: null,
        location: null,
        remark: null,
        createTime: null
      }
      console.log('表单重置 - 科目名称:', this.teacherSubjectNames)
      
      // 如果科目名称为空，显示警告
      if (!this.teacherSubjectNames) {
        console.warn('教师科目名称为空，可能教师信息还未加载完成')
        this.$message.warning('正在获取您的教学科目信息，请稍后再试')
      }
      
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.queryParams.subject = null
      this.queryParams.teacherId = null
      this.queryParams.teacherNick = ""
      this.queryParams.className = ""
      this.queryParams.classId = null
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.scheduleId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
         /** 新增按钮操作 */
     handleAdd() {
       this.reset()
       this.open = true
       this.title = "添加班级排课"
     },
     /** 带时间槽信息的新增按钮操作 */
     handleAddWithTimeSlot(date, time) {
       this.reset()
       // 自动填充课程日期
       this.form.courseDate = date
       
       // 获取时间槽信息
       const timeSlot = this.timeSlots.find(ts => ts.time === time)
       
       if (timeSlot && timeSlot.isDynamic) {
         // 如果是动态时间槽，使用实际课程时间
         const actualTime = this.getActualCourseTime(date, timeSlot.period)
         if (actualTime) {
           this.form.startTime = actualTime.start + ':00'
           this.form.endTime = actualTime.end + ':00'
         } else {
           // 备用方案
           this.form.startTime = time + ':00'
           this.form.endTime = time + ':45:00'
         }
       } else {
         // 非动态时间槽，使用原来的逻辑
         this.form.startTime = time + ':00'
         const [hour, minute] = time.split(':').map(Number)
         const endTime = minute === 0 ? `${hour.toString().padStart(2, '0')}:30:00` : `${(hour + 1).toString().padStart(2, '0')}:00:00`
         this.form.endTime = endTime
       }
       
       this.open = true
       this.title = "添加班级排课"
     },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const scheduleId = row.scheduleId || this.ids
      getSchedule(scheduleId).then(response => {
        this.form = response.data
        // 回显班级名称
        if (this.form.classId) {
          const classItem = this.classList.find(item => item.deptId === this.form.classId);
          this.form.className = classItem ? classItem.deptName : "";
        }
        // 强制设置为当前教师科目，因为用户要求科目不可选且自动判断
        if (this.teacherSubjectNames) {
          this.form.subject = this.teacherSubjectNames;
        } else {
          console.warn('教师科目名称为空，无法自动设置科目')
          this.$message.warning('正在获取您的教学科目信息，请稍后再试')
        }
        
        this.open = true
        this.title = "修改班级排课"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.scheduleId != null) {
            updateSchedule(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addSchedule(this.form).then(response => {
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
      const scheduleIds = row.scheduleId || this.ids
      // this.$modal.confirm('是否确认删除班级排课编号为"' + scheduleIds + '"的数据项？').then(function() {
      this.$modal.confirm('是否确认删除班级排课数据？').then(function() {
        return delSchedule(scheduleIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/schedule/export', {
        ...this.queryParams
      }, `schedule_${new Date().getTime()}.xlsx`)
    },
    // 获取课程科目显示名称
    getSubjectDisplay(subjectCode) {
      const subject = this.subjectList.find(item => item.subjectCode === subjectCode);
      if (subject) {
        return subject.subjectName || subject.subjectCode;
      }
      // 如果没有找到对应的科目，返回科目代码
      return subjectCode || '-';
    },
    // 获取用户名称
    getUserName(userId) {
      if (!userId) return '-'
      const user = this.userList.find(u => u.userId === userId)
      return user ? user.nickName : `未知用户(${userId})`
    },
    // 获取班级名称
    getClassName(deptId) {
      const classItem = this.classList.find(item => item.deptId === deptId);
      if (classItem) {
        return `${classItem.deptName}`;
      }
      return `未知班级(${deptId})`;
    },
    // 获取课程预览文本（班级+地点）
    getSchedulePreviewText(schedule) {
      const className = this.getClassName(schedule.classId);
      const location = schedule.location || '地点待定';
      const subjectName = this.getSubjectDisplay(schedule.subject)
      // 如果班级名称太长，截取前几个字符
      const shortClassName = className.length > 6 ? className.substring(0, 6) + '...' : className;
      return `${shortClassName} | ${subjectName}`;
    },
    // 获取教师信息
    getTeacherInfo() {
      getTeacherInfo().then(response => {
        console.log('教师信息API完整响应:', response)
        if (response.code === 200) {
          this.teacherInfo = response.data
          this.teacherSubjectNames = response.data.subjectNames
          console.log('教师信息数据:', response.data)
          console.log('教师科目名称:', this.teacherSubjectNames)
          
          // 如果新增/修改对话框当前是打开状态，则更新科目显示
          if (this.open) {
            this.form.subject = this.teacherSubjectNames;
          }
        } else {
          console.error('获取教师信息失败:', response.msg)
          this.$message.error('获取教师信息失败：' + response.msg)
        }
      }).catch(error => {
        console.error('获取教师信息失败:', error)
        this.$message.error('获取教师信息失败：' + error.message)
      })
    },
    // 查询教师列表
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
    // 教师选择
    handleTeacherSelect(item) {
      this.queryParams.teacherId = item.userId;
      this.queryParams.teacherNick = item.nickName;
    },
    // 班级搜索
    queryClassSearch(queryString, callback) {
      const results = queryString
        ? this.classList.filter(classItem => {
          const nameMatch = classItem.deptName.toLowerCase().includes(queryString.toLowerCase())
          const idMatch = classItem.deptId.toString().includes(queryString)
          return nameMatch || idMatch
        })
        : [...this.classList]
      callback(results.map(classItem => ({
        value: `${classItem.deptName}`,
        id: classItem.deptId,
        name: classItem.deptName
      })))
    },
    // 班级选择
    handleClassSelect(item) {
      this.queryParams.classId = item.id;
      this.queryParams.className = item.name;
    },
    // 班级搜索 (新增/修改对话框)
    queryClassSearch(queryString, callback) {
      const results = queryString
        ? this.classList.filter(classItem => {
          const nameMatch = classItem.deptName.toLowerCase().includes(queryString.toLowerCase())
          const idMatch = classItem.deptId.toString().includes(queryString)
          return nameMatch || idMatch
        })
        : [...this.classList]
      callback(results.map(classItem => ({
        value: `${classItem.deptName}`,
        id: classItem.deptId,
        name: classItem.deptName
      })))
    },
    // 班级选择 (新增/修改对话框)
    handleFormClassSelect(item) {
      this.form.classId = item.id;
      this.form.className = item.name;
    },
    // 日历相关方法
    initCalendar() {
      this.generateTimeSlots()
      this.generateWeekDates()
      // 重新获取课程数据以确保日历显示最新数据
      this.getList()
    },
    generateTimeSlots() {
      // 使用独立的时间表配置
      this.timeSlots = getTimeSlots()
    },
    generateWeekDates() {
      this.weekDates = []
      // 使用currentDate而不是硬编码的today，这样前进后退按钮才能生效
      const targetDate = new Date(this.currentDate)
      targetDate.setHours(0, 0, 0, 0) // 重置时间为当天00:00:00
      
      const dayOfWeek = targetDate.getDay()
      const startOfWeek = new Date(targetDate)
      startOfWeek.setDate(targetDate.getDate() - dayOfWeek)
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        
        this.weekDates.push({
          date: this.formatDate(date),
          dayName: this.getDayName(date.getDay()),
          dayNumber: date.getDate()
        })
      }
    },
    formatDate(date) {
      // 修复时区问题：使用本地时间而不是UTC时间
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 标准化日期格式，确保与后端返回的格式一致
    normalizeDate(dateString) {
      if (!dateString) return '';
      
      // 如果是Date对象，先转换为字符串
      if (dateString instanceof Date) {
        return this.formatDate(dateString);
      }
      
      // 如果是字符串，确保格式为 YYYY-MM-DD
      if (typeof dateString === 'string') {
        // 处理可能的时区后缀
        const cleanDate = dateString.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
          return cleanDate;
        }
        
        // 尝试解析其他格式
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return this.formatDate(date);
        }
      }
      
      return dateString;
    },
    getDayName(day) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return days[day]
    },
    // 根据日期和节数获取实际课程时间 - 使用独立的时间表配置
    getActualCourseTime(date, period) {
      return getActualCourseTime(date, period)
    },
    // 获取时间槽显示文本
    getTimeSlotDisplay(timeSlot) {
      if (timeSlot.isSection) {
        return timeSlot.display
      }
      
      if (timeSlot.isDynamic && timeSlot.period) {
        // 对于动态时间槽，显示节数名称和当前时间提示
        const isCurrent = this.isCurrentTime(timeSlot.time)
        if (isCurrent) {
          return `${timeSlot.display}`
        }
        return timeSlot.display
      }
      
      return timeSlot.display
    },
    goToToday() {
      this.currentDate = new Date()
      this.generateWeekDates()
    },
    previousWeek() {
      this.currentDate.setDate(this.currentDate.getDate() - 7)
      this.generateWeekDates()
    },
    nextWeek() {
      this.currentDate.setDate(this.currentDate.getDate() + 7)
      this.generateWeekDates()
    },
    switchView(viewType) {
      this.viewType = viewType
      // 这里可以根据视图类型调整显示逻辑
    },
    isToday(date) {
      // 修复日期比较：确保使用本地时间
      const today = new Date()
      const todayFormatted = this.formatDate(today)

      return todayFormatted === date
    },
    isCurrentTime(time) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // 检查当前时间是否在当前时间槽的时间范围内
      const timeSlot = this.timeSlots.find(ts => ts.time === time)
      if (timeSlot && timeSlot.isDynamic) {
        // 对于动态时间槽，需要检查当前日期和节数
        const today = this.formatDate(now)
        const actualTime = this.getActualCourseTime(today, timeSlot.period)
        if (actualTime) {
          // 检查当前时间是否在课程时间范围内
          return currentTime >= actualTime.start && currentTime < actualTime.end
        }
      }
      
      // 对于时间段标题，不显示当前时间指示器
      if (timeSlot && timeSlot.isSection) {
        return false
      }
      
      // 备用逻辑：检查是否在时间槽的前后15分钟内
      const [hour, minute] = time.split(':').map(Number)
      const timeSlotMinutes = hour * 60 + minute
      const currentMinutes = currentHour * 60 + currentMinute
      return Math.abs(currentMinutes - timeSlotMinutes) <= 15
    },
    getSchedulesForTimeSlot(date, time) {
      // 如果是时间段标题，不显示课程
      const timeSlot = this.timeSlots.find(ts => ts.time === time)
      if (timeSlot && timeSlot.isSection) {
        return []
      }
      
      return this.scheduleList.filter(schedule => {
        // 修复日期比较：使用标准化的日期进行比较
        const normalizedScheduleDate = this.normalizeDate(schedule.courseDate);
        const normalizedTargetDate = this.normalizeDate(date);
        
        // 检查日期是否匹配
        if (normalizedScheduleDate !== normalizedTargetDate) return false
        
        // 检查时间是否在课程时间范围内
        const courseStartTime = schedule.startTime
        const courseEndTime = schedule.endTime
        
        // 格式化时间进行比较（去掉秒）
        const formattedStartTime = courseStartTime ? courseStartTime.substring(0, 5) : ''
        const formattedEndTime = courseEndTime ? courseEndTime.substring(0, 5) : ''
        
        // 如果时间槽是动态的，使用实际课程时间范围
        if (timeSlot && timeSlot.isDynamic) {
          const actualTime = this.getActualCourseTime(date, timeSlot.period)
          if (actualTime) {
            // 检查课程时间是否与当前节数的实际时间重叠
            if (formattedStartTime < actualTime.end && formattedEndTime > actualTime.start) {
              return true
            }
          }
        } else {
          // 对于非动态时间槽，使用原来的逻辑
          const [hour, minute] = time.split(':').map(Number)
          const timeSlotEnd = `${hour.toString().padStart(2, '0')}:45`
          
          // 检查课程时间与当前时间槽是否有重叠
          if (formattedStartTime < timeSlotEnd && formattedEndTime > time) {
            return true
          }
        }
        
        return false
      })
    },
    // 获取在指定时间开始的课程（用于显示课程方块）
    getSchedulesStartingAtTimeSlot(date, time) {
      return this.scheduleList.filter(schedule => {
        // 修复日期比较：使用标准化的日期进行比较
        const normalizedScheduleDate = this.normalizeDate(schedule.courseDate);
        const normalizedTargetDate = this.normalizeDate(date);
        

        
        // 检查日期是否匹配
        if (normalizedScheduleDate !== normalizedTargetDate) return false
        
        // 检查时间是否在课程时间范围内
        const courseStartTime = schedule.startTime
        
        // 格式化时间进行比较（去掉秒）
        const formattedStartTime = courseStartTime ? courseStartTime.substring(0, 5) : ''
        
        // 只在课程开始时间显示课程方块
        if (formattedStartTime === time) {
          return true
        }
        
        return false
      })
    },
    // 获取时间槽中显示的课程名称文本
    getScheduleSubjectText(date, time) {
      const schedules = this.getSchedulesForTimeSlot(date, time)
      if (schedules.length === 0) return ''
      
      // 获取第一个课程的班级+地点信息
      const schedule = schedules[0]
      return this.getSchedulePreviewText(schedule)
    },
    getScheduleBlockStyle(schedule) {
      return {
        height: '30px', // 固定高度30px
        backgroundColor: '#e6a23c', // 统一黄色
        zIndex: 15, // 确保课程方块在最上层
        position: 'absolute',
        left: '2px',
        right: '2px',
        top: '0'
      }
    },

    formatTime(time) {
      if (!time) return ''
      return time.substring(0, 5) // 只显示时:分
    },
         handleTimeSlotClick(date, time, schedules) {
       // 检查是否是时间段标题
       const timeSlot = this.timeSlots.find(ts => ts.time === time)
       if (timeSlot && timeSlot.isSection) {
         return // 时间段标题不可点击
       }
       
       // 如果时间槽有课程，显示课程详情；否则添加新课程
       if (schedules && schedules.length > 0) {
         // 显示该时间槽的所有课程详情
         this.showTimeSlotSchedules(date, time, schedules)
       } else {
         // 点击空时间槽可以添加新课程，并自动填充日期和时间
         this.handleAddWithTimeSlot(date, time)
       }
     },
    showScheduleDetail(schedule) {
      this.selectedSchedule = schedule
      this.scheduleDetailVisible = true
    },
    closeScheduleDetail() {
      this.selectedSchedule = null
      this.scheduleDetailVisible = false
    },
    editSchedule() {
      if (this.selectedSchedule) {
        this.handleUpdate(this.selectedSchedule)
        this.scheduleDetailVisible = false
      }
    },
    deleteSchedule() {
      if (this.selectedSchedule) {
        this.handleDelete(this.selectedSchedule)
        this.scheduleDetailVisible = false
      }
    },
                   // 显示时间槽中的课程详情
        showTimeSlotSchedules(date, time, schedules) {
          this.selectedSchedule = schedules.length > 0 ? schedules[0] : null
          this.timeSlotSchedules = schedules
          this.timeSlotDate = date
          this.timeSlotTime = time
          this.timeSlotDetailVisible = true
        },
               // 编辑选中的课程
        editSelectedSchedule() {
          if (this.selectedSchedule) {
            this.reset()
            const scheduleId = this.selectedSchedule.scheduleId
            getSchedule(scheduleId).then(response => {
              this.form = response.data
              // 回显班级名称
              if (this.form.classId) {
                const classItem = this.classList.find(item => item.deptId === this.form.classId);
                this.form.className = classItem ? classItem.deptName : "";
              }
              this.open = true
              this.title = "修改班级排课"
              this.timeSlotDetailVisible = false
            })
          }
        },
        // 删除选中的课程
        deleteSelectedSchedule() {
          if (this.selectedSchedule) {
            const scheduleId = this.selectedSchedule.scheduleId
            this.$modal.confirm('是否确认删除班级排课编号为"' + scheduleId + '"的数据项？').then(function() {
              return delSchedule(scheduleId)
            }).then(() => {
              this.getList()
              this.$modal.msgSuccess("删除成功")
              this.timeSlotDetailVisible = false
            }).catch(() => {})
          }
        },

       
       // 获取当前时区信息
       getCurrentTimezoneInfo() {
         const now = new Date();
         const offset = now.getTimezoneOffset();
         const offsetHours = Math.abs(Math.floor(offset / 60));
         const offsetMinutes = Math.abs(offset % 60);
         const sign = offset <= 0 ? '+' : '-';
         
         return `本地: ${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
       },
       
       // 显示作息时间表信息
       showScheduleInfo() {
         const scheduleInfo = getScheduleInfo();
         // 可以在这里添加用户提示，告知当前使用的作息时间表版本
        //  this.$message({
        //    message: `当前使用${scheduleInfo.title}，周日下午时间已修正`,
        //    type: 'info',
        //    duration: 3000,
        //    showClose: true
        //  });
       }
  }
}
</script>

<style scoped>
/* 日历容器 */
.calendar-container {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* 日历头部 */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-week {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-left: 15px;
}

.view-switcher {
  display: flex;
  gap: 5px;
}

/* 日历网格 */
.calendar-grid {
  display: flex;
  /* height: calc(100vh - 120px); */
  /* min-height: 1000px; */
  box-sizing: border-box;
}

/* 时间轴 */
.time-axis {
  width: 80px;
  border-right: 1px solid #e4e7ed;
  background: #f8f9fa;
  box-sizing: border-box;
}

.timezone-info {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.time-slot {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #606266;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  box-sizing: border-box;
}

.time-slot.section-header {
  height: 25px;
  background: #e8f5e8;
  color: #2e7d32;
  font-weight: bold;
  font-size: 13px;
  border-bottom: 2px solid #4caf50;
  box-sizing: border-box;
}

.time-slot.current-time {
  color: #66B3FF;
  font-weight: bold;
  background: linear-gradient(135deg, #e9f2ff 0%, #d4e7ff 100%);
}

.time-slot.current-time::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg, #66B3FF 0%, #4A9FFF 100%);
  z-index: 1;
  box-shadow: 0 0 4px rgba(102, 179, 255, 0.5);
}

/* 日期列 */
.date-columns {
  display: flex;
  flex: 1;
}

.date-column {
  flex: 1;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.date-column:last-child {
  border-right: none;
}

.date-column.today {
  background: #f0f9ff;
}

.date-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.day-name {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.day-number {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.date-column.today .day-number {
  color: #409eff;
  background: #409eff;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* 时间槽单元格 */
.time-slots {
  flex: 1;
  box-sizing: border-box;
}

.time-slot-cell {
  height: 40px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box;
}

.time-slot-cell.section-header {
  height: 25px;
  background: #e8f5e8;
  /* border-bottom: 2px solid #4caf50; */
  cursor: default;
  box-sizing: border-box;
}

.time-slot-cell:hover {
  background: #f5f7fa;
}

/* 确保时间轴和日期列的边框对齐 */
.time-slot,
.time-slot-cell {
  border-bottom-width: 1px;
  border-bottom-style: solid;
}

.time-slot.section-header,
.time-slot-cell.section-header {
  border-bottom-width: 2px;
  /* border-bottom-color: #e6a23c; */
}

.time-slot:not(.section-header),
.time-slot-cell:not(.section-header) {
  border-bottom-color: #f0f0f0;
}

.time-slot-cell.current-time {
  background: linear-gradient(135deg, #e9f2ff 0%, #d4e7ff 100%);
  border-left: 2px solid #66B3FF;
  border-right: 2px solid #66B3FF;
}

.time-slot-cell.current-time::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg, #66B3FF 0%, #4A9FFF 50%, #66B3FF 100%);
  z-index: 1;
  box-shadow: 0 0 4px rgba(102, 179, 255, 0.5);
}

.time-slot-cell.has-schedule {
  background: #f8f9fa;
  position: relative;
}



/* 课程方块 */
.schedule-block {
  position: absolute;
  left: 2px;
  right: 2px;
  top: 0;
  background: #66B3FF !important;
  border-radius: 4px;
  color: white;
  font-size: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 15;
  min-height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1px;
}

.schedule-block:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.schedule-content {
  padding: 3px 6px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
}

.schedule-title {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.1;
  text-align: center;
}



/* 课程详情弹窗 */
.schedule-detail {
  padding: 20px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin: -20px;
  padding: 30px;
}

.detail-section {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-section h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 3px solid #e6a23c;
  padding-bottom: 10px;
  position: relative;
}

.detail-section h4::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 50px;
  height: 3px;
  background: #409eff;
}

.detail-row {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.detail-row:hover {
  background: #f8f9fa;
  border-radius: 6px;
  padding-left: 10px;
  padding-right: 10px;
  margin-left: -10px;
  margin-right: -10px;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #606266;
  width: 120px;
  flex-shrink: 0;
  font-size: 14px;
  position: relative;
  padding-left: 15px;
}

.detail-label::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #e6a23c;
  font-weight: bold;
  font-size: 16px;
}

.detail-value {
  color: #303133;
  flex: 1;
  word-break: break-all;
  font-size: 14px;
  line-height: 1.5;
  padding-left: 10px;
}

/* 隐藏分页控件 */
.pagination-container {
  display: none !important;
}

/* 弹窗美化 */
.el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.el-dialog__header {
  background: linear-gradient(135deg, #e6a23c 0%, #f39c12 100%);
  padding: 20px 25px;
  margin: 0;
}

.el-dialog__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.el-dialog__headerbtn:hover .el-dialog__close {
  color: #f0f0f0;
}

.el-dialog__body {
  padding: 0;
  background: #f8f9fa;
}

.el-dialog__footer {
  background: white;
  padding: 20px 25px;
  border-top: 1px solid #e4e7ed;
}

.dialog-footer .el-button {
  border-radius: 6px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}



/* 响应式设计 */
@media (max-width: 1200px) {
  .calendar-grid {
    height: calc(100vh - 170px);
  }
  
  .time-axis {
    width: 60px;
  }
  
  .time-slot {
    font-size: 11px;
  }
  
  .day-name {
    font-size: 11px;
  }
  
  .day-number {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .calendar-nav {
    justify-content: center;
  }
  
  .view-switcher {
    justify-content: center;
  }
  
  .schedule-info {
    grid-template-columns: 1fr;
  }
}
</style>