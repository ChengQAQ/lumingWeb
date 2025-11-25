<template>
  <div class="test-page">
    <div style="margin-bottom: 20px;">
      <button @click="setActiveInput('student')">传入学生ID，筛选该学生的错题</button>
      <button @click="setActiveInput('knowledge')" style="margin-left: 10px;">传入知识点ID，查询关联该知识点的已批改题目</button>
      <button @click="setActiveInput('allKnowledge')" style="margin-left: 10px;">查询系统中所有知识点的基础信息（名称、编码、层级等）</button>
      <button @click="setActiveInput('countWrong')" style="margin-left: 10px;">返回学生对应每个知识点的错题数</button>
      <button @click="setActiveInput('errorRate')" style="margin-left: 10px;">返回学生的每个层级的错误率</button>
    </div>
    <div v-if="activeInput === 'student'" style="margin-bottom: 20px;">
      <label>请输入学生ID：</label>
      <input v-model.number="form.student_id" placeholder="123" type="number" />
      <label style="margin-left:10px;">请输入学科ID：</label>
      <input v-model="form.subject_code" placeholder="math" />
      <button @click="testApi">确定</button>
    </div>
    <div v-if="activeInput === 'knowledge'" style="margin-bottom: 20px;">
      <label>请输入知识点ID：</label>
      <input v-model="knowledgeForm.knowledge_point" placeholder="探究光合作用的条件和产物" />
      <label style="margin-left:10px;">最大返回数：</label>
      <input v-model.number="knowledgeForm.max_results" placeholder="1" type="number" />
      <button @click="testKnowledgeApi">确定</button>
    </div>
    <div v-if="activeInput === 'allKnowledge'" style="margin-bottom: 20px;">
      <label>请输入学科编码：</label>
      <input v-model="allKnowledgeForm.subject_code" placeholder="science" />
      <button @click="testAllKnowledgeApi">确定</button>
    </div>
    <div v-if="activeInput === 'countWrong'" style="margin-bottom: 20px;">
      <label>请输入学生ID：</label>
      <input v-model="countWrongForm.student_id" placeholder="1002" />
      <button @click="testCountWrongApi">确定</button>
    </div>
    <div v-if="activeInput === 'errorRate'" style="margin-bottom: 20px;">
      <label>请输入学生ID：</label>
      <input v-model.number="errorRateForm.student_id" placeholder="1002" type="number" />
      <button @click="testErrorRateApi">确定</button>
    </div>
    <div v-if="apiResult">
      <h3>请求成功：</h3>
      <pre>{{ apiResult }}</pre>
    </div>
    <div v-if="apiError">
      <h3 style="color:red">请求失败：</h3>
      <pre>{{ apiError }}</pre>
    </div>
  </div>
</template>

<script>
// 引入封装的API方法
import {
  getStudentWrongQuestionsBySubject,
  getCorrectedQuestionsByKnowledgeId,
  getAllKnowledgePointsBasicInfo,
  countWrongQuestionsPerKnowledgePoint,
  calculateErrorRateByLevel
} from '@/api/system/test1'

export default {
  name: 'TestStudentWrongQuestionsBySubject',
  data() {
    return {
      activeInput: '',
      form: {
        student_id: 123,
        subject_code: 'math'
      },
      knowledgeForm: {
        knowledge_point: '探究光合作用的条件和产物',
        max_results: 1
      },
      allKnowledgeForm: {
        subject_code: 'science'
      },
      countWrongForm: {
        student_id: '1002'
      },
      errorRateForm: {
        student_id: 1002
      },
      apiResult: null,
      apiError: null
    }
  },
  methods: {
    setActiveInput(type) {
      this.activeInput = type;
      this.apiResult = null;
      this.apiError = null;
    },
    // 传入学生ID+学科ID，筛选该学生在特定学科下的错题
    testApi() {
      getStudentWrongQuestionsBySubject(this.form)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.activeInput = '';
    },
    // 传入知识点ID，查询关联该知识点的已批改题目
    testKnowledgeApi() {
      getCorrectedQuestionsByKnowledgeId(this.knowledgeForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.activeInput = '';
    },
    // 查询系统中所有知识点的基础信息
    testAllKnowledgeApi() {
      getAllKnowledgePointsBasicInfo(this.allKnowledgeForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.activeInput = '';
    },
    // 返回学生对应每个知识点的错题数
    testCountWrongApi() {
      countWrongQuestionsPerKnowledgePoint(this.countWrongForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.activeInput = '';
    },
    // 返回学生的每个层级的错误率
    testErrorRateApi() {
      calculateErrorRateByLevel(this.errorRateForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.activeInput = '';
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 40px;
  text-align: center;
}
</style>
