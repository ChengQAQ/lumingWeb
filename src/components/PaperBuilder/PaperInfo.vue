<template>
  <div class="paper-info">
    <div class="panel-header">
      <h3>{{ isHomework ? '作业信息' : '试卷信息' }}</h3>
    </div>
    <div class="info-form">
      <div class="form-tip">请选择科目并设置{{ isHomework ? '作业' : '试卷' }}名称</div>
      <el-form :model="form" :rules="rules" ref="paperForm" label-width="80px">
        <el-form-item label="科目" prop="subject">
          <el-select v-model="form.subject" placeholder="请选择科目" style="width: 100%">
            <el-option
              v-for="item in subjectOptions"
              :key="item.subjectCode"
              :label="item.subjectName"
              :value="item.subjectCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="isHomework ? '作业名称' : '试卷名称'" prop="customPaperName">
          <el-input v-model="form.customPaperName" :placeholder="`请输入${isHomework ? '作业' : '试卷'}名称`" />
        </el-form-item>
      </el-form>
      <el-button 
        type="primary" 
        @click="generatePaper" 
        :disabled="selectedQuestions.length === 0" 
        style="width: 100%; margin-top: 10px;"
      >
        {{ isHomework ? '创建作业' : '生成试卷' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { getTeacherInfo } from '@/api/system/teacher'

export default {
  name: 'PaperInfo',
  props: {
    form: {
      type: Object,
      required: true
    },
    subjectOptions: {
      type: Array,
      default: () => []
    },
    selectedQuestions: {
      type: Array,
      default: () => []
    },
    isHomework: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rules: {
        subject: [{ required: true, message: "科目不能为空", trigger: "blur" }],
        customPaperName: [{ required: true, message: this.isHomework ? "作业名称不能为空" : "试卷名称不能为空", trigger: "blur" }]
      },
      teacherInfo: null
    }
  },
  computed: {
    // 获取教师科目信息
    teacherSubject() {
      return this.teacherInfo?.subjectNames || null
    }
  },
  created() {
    this.loadTeacherInfo()
  },
  methods: {
    // 加载教师信息
    loadTeacherInfo() {
      getTeacherInfo().then(res => {
        if (res.code === 200) {
          this.teacherInfo = res.data
          this.autoMatchSubject()
        }
      }).catch(error => {
        console.error('获取教师信息失败:', error)
      })
    },
    
    // 自动匹配科目
    autoMatchSubject() {
      if (!this.teacherSubject || this.form.subject) {
        return // 如果没有教师科目信息或已经选择了科目，则不自动匹配
      }
      
      // 根据教师科目名称匹配对应的科目代码
      const matchedSubject = this.findMatchingSubject(this.teacherSubject)
      if (matchedSubject) {
        this.form.subject = matchedSubject.subjectCode
        // 如果作业名称还没有设置，也可以根据科目自动设置
        // if (!this.form.customPaperName) {
        //   this.form.customPaperName = matchedSubject.subjectName
        // }
        // console.log('自动匹配科目:', matchedSubject)
      }
    },
    
    // 查找匹配的科目
    findMatchingSubject(teacherSubjectName) {
      if (!teacherSubjectName || !this.subjectOptions.length) {
        return null
      }
      
      // 直接匹配科目名称
      let matchedSubject = this.subjectOptions.find(subject => 
        subject.subjectName === teacherSubjectName
      )
      
      if (matchedSubject) {
        return matchedSubject
      }
      
      // 如果直接匹配失败，尝试模糊匹配
      // 例如：教师科目是"高中数学"，匹配科目名称包含"数学"的科目
      const subjectKeywords = this.extractSubjectKeywords(teacherSubjectName)
      for (const keyword of subjectKeywords) {
        matchedSubject = this.subjectOptions.find(subject => 
          subject.subjectName.includes(keyword)
        )
        if (matchedSubject) {
          return matchedSubject
        }
      }
      
      return null
    },
    
    // 提取科目关键词
    extractSubjectKeywords(teacherSubjectName) {
      const keywords = []
      
      // 常见的科目关键词映射
      const subjectKeywordMap = {
        '数学': ['数学', 'math'],
        '语文': ['语文', 'chinese'],
        '英语': ['英语', 'english'],
        '物理': ['物理', 'physics'],
        '化学': ['化学', 'chemistry'],
        '生物': ['生物', 'biology'],
        '历史': ['历史', 'history'],
        '地理': ['地理', 'geography'],
        '政治': ['政治', 'politics'],
        '思想品德': ['思想品德', 'moral']
      }
      
      // 遍历关键词映射，找到匹配的关键词
      for (const [key, values] of Object.entries(subjectKeywordMap)) {
        if (teacherSubjectName.includes(key)) {
          keywords.push(...values)
        }
      }
      
      return keywords
    },
    
    generatePaper() {
      this.$refs.paperForm.validate((valid) => {
        if (valid) {
          this.$emit('generate-paper', this.form)
        } else {
          this.$message.warning('请完善试卷信息')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.paper-info {
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
  min-height: 200px;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.info-form {
  padding: 15px;
}

.info-form .el-form {
  margin-bottom: 15px;
}

.info-form .el-form-item {
  margin-bottom: 15px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
  text-align: center;
}
</style>