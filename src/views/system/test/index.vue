<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <div style="margin-bottom: 20px;">
      <button v-for="btn in buttons" :key="btn.label" @click="btn.action" style="margin-right: 10px;">
        {{ btn.label }}
      </button>
    </div>
    <div style="margin-bottom: 20px;">
      <button v-for="btn in studentButtons" :key="btn.label" @click="btn.action" style="margin-right: 10px;">
        {{ btn.label }}
      </button>
    </div>
    <!-- 节点ID输入框 -->
    <div v-if="showNodeIdInput" style="margin-bottom: 20px;">
      <label>请输入 node_id：</label>
      <input v-model="customNodeId" placeholder="请输入 node_id 0101020101b" />
      <button @click="handleConfirmNodeId">确定</button>
    </div>
    <!-- 学生ID输入框 -->
    <div v-if="showStudentIdInput" style="margin-bottom: 20px;">
      <label>请输入学生ID：</label>
      <input v-model.number="studentIdForm.student_id" placeholder="123" type="number" />
      <button @click="handleConfirmStudentId">确定</button>
    </div>
    <!-- 题库参数输入框 -->
    <div v-if="showQuestionBankInput" style="margin-bottom: 20px;">
      <div>
        <label>subject：</label>
        <input v-model="questionBankForm.subject" :placeholder="defaultQuestionBank.subject" />
      </div>
      <div>
        <label>knowledge_no：</label>
        <input v-model="questionBankForm.knowledge_no" :placeholder="defaultQuestionBank.knowledge_no" />
      </div>
      <div>
        <label>knowledge_name：</label>
        <input v-model="questionBankForm.knowledge_name" :placeholder="defaultQuestionBank.knowledge_name" />
      </div>
      <div>
        <label>max_questions：</label>
        <input v-model.number="questionBankForm.max_questions" :placeholder="defaultQuestionBank.max_questions" type="number" />
      </div>
      <div>
        <label>difficulty：</label>
        <input v-model.number="questionBankForm.difficulty" :placeholder="defaultQuestionBank.difficulty" type="number" />
      </div>
      <div>
        <label>choice：</label>
        <input v-model.number="questionBankForm.question_type_distribution.choice" :placeholder="defaultQuestionBank.question_type_distribution.choice" type="number" step="0.01" />
      </div>
      <div>
        <label>fill：</label>
        <input v-model.number="questionBankForm.question_type_distribution.fill" :placeholder="defaultQuestionBank.question_type_distribution.fill" type="number" step="0.01" />
      </div>
      <div>
        <label>tp：</label>
        <input v-model.number="questionBankForm.tp" :placeholder="defaultQuestionBank.tp" type="number" />
      </div>
      <div>
        <label>sc：</label>
        <input type="checkbox" v-model="questionBankForm.sc" />
      </div>
      <div>
        <label>gc：</label>
        <input type="checkbox" v-model="questionBankForm.gc" />
      </div>
      <button @click="handleConfirmQuestionBank">确定</button>
    </div>
    <!-- 筛选题目输入框 -->
    <div v-if="showFilterQuestionsInput" style="margin-bottom: 20px;">
      <div>
        <label>node_id：</label>
        <input v-model="filterQuestionsForm.node_id" placeholder="0101020101b" />
      </div>
      <div>
        <label>limit：</label>
        <input v-model.number="filterQuestionsForm.limit" placeholder="2" type="number" />
      </div>
      <button @click="handleConfirmFilterQuestions">确定</button>
    </div>
    <p>这是一个用于测试的新建 Vue 页面。</p>
    <!-- 结果展示 -->
    <div v-if="apiResult !== null">
      <h3>请求成功：</h3>
      <pre>{{ apiResult }}</pre>
    </div>
    <div v-if="apiError !== null">
      <h3 style="color:red">请求失败：</h3>
      <pre>{{ apiError }}</pre>
    </div>
  </div>
</template>

<script>
// 引入封装的API（注意：避免与methods中的函数重名）
import {
  requestRootApi,
  requestKnowledgeApi,
  requestQuestionBankApi,
  requestFilterQuestionsApi,
  requestKnowledgeTreeApi,
  requestStudentWrongQuestionsApi
} from '@/api/system/test'

export default {
  name: 'TestPage',
  data() {
    return {
      message: 'Hello, 这是测试页面！',
      apiResult: null, // 初始化为null，确保响应式
      apiError: null,
      buttons: [],
      showNodeIdInput: false,
      customNodeId: '',
      showQuestionBankInput: false,
      showFilterQuestionsInput: false,
      showStudentIdInput: false,
      // 默认题库参数（深拷贝初始化，避免引用问题）
      defaultQuestionBank: {
        subject: '初中数学',
        knowledge_no: '2216c',
        knowledge_name: '分式的混合运算',
        max_questions: 20,
        difficulty: 0,
        question_type_distribution: { choice: 0.5, fill: 0.5 },
        tp: 2,
        sc: true,
        gc: true
      },
      // 表单数据（与默认参数结构一致）
      questionBankForm: {
        subject: '初中数学',
        knowledge_no: '2216c',
        knowledge_name: '分式的混合运算',
        max_questions: 20,
        difficulty: 0,
        question_type_distribution: { choice: 0.5, fill: 0.5 },
        tp: 2,
        sc: true,
        gc: true
      },
      filterQuestionsForm: { node_id: '0101020101b', limit: 2 },
      studentIdForm: { student_id: 123 }
    }
  },
  methods: {
    // 根API请求
    handleRootApi() {
      this.resetFormState(); // 重置表单状态
      requestRootApi()
        .then(res => {
          console.log('根API请求成功：', res.data);
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          console.error('根API请求失败：', err);
          this.handleRequestError(err);
        });
    },
    // 知识点信息请求（显示输入框）
    handleKnowledgeApi() {
      this.resetFormState();
      this.showNodeIdInput = true;
    },
    // 确认节点ID并请求
    handleConfirmNodeId() {
      if (!this.customNodeId.trim()) {
        this.apiError = '请输入有效的 node_id';
        return;
      }
      requestKnowledgeApi({ node_id: this.customNodeId })
        .then(res => {
          console.log('知识点信息请求成功：', res.data);
          this.apiResult = res.data;
          this.apiError = null;
          this.showNodeIdInput = false;
        })
        .catch(err => {
          console.error('知识点信息请求失败：', err);
          this.handleRequestError(err);
        });
    },
    // 获取三方题库数据（显示输入框）
    handleQuestionBankApi() {
      this.resetFormState();
      this.showQuestionBankInput = true;
      // 深拷贝默认参数，避免修改影响defaultQuestionBank
      this.questionBankForm = JSON.parse(JSON.stringify(this.defaultQuestionBank));
    },
    // 确认题库参数并请求
    handleConfirmQuestionBank() {
      requestQuestionBankApi(this.questionBankForm)
        .then(res => {
          console.log('三方题库数据请求成功：', res.data);
          this.apiResult = res.data;
          this.apiError = null;
          this.showQuestionBankInput = false;
        })
        .catch(err => {
          console.error('三方题库数据请求失败：', err);
          this.handleRequestError(err);
        });
    },
    // 筛选题目（显示输入框）
    handleFilterQuestionsApi() {
      this.resetFormState();
      this.showFilterQuestionsInput = true;
    },
    // 确认筛选参数并请求
    handleConfirmFilterQuestions() {
      requestFilterQuestionsApi(this.filterQuestionsForm)
        .then(res => {
          console.log('筛选题目请求成功：', res.data);
          this.apiResult = res.data;
          this.apiError = null;
          this.showFilterQuestionsInput = false;
        })
        .catch(err => {
          console.error('筛选题目请求失败：', err);
          this.handleRequestError(err);
        });
    },
    // 获取题目知识点
    handleKnowledgeTreeApi() {
      this.resetFormState();
      requestKnowledgeTreeApi()
        .then(res => {
          console.log('题目知识点请求成功：', res.data);
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          console.error('题目知识点请求失败：', err);
          this.handleRequestError(err);
        });
    },
    // 学生错题查询（显示输入框）
    handleStudentWrongQuestionsApi() {
      this.resetFormState();
      this.showStudentIdInput = true;
    },
    // 确认学生ID并请求
    handleConfirmStudentId() {
      if (!this.studentIdForm.student_id) {
        this.apiError = '请输入有效的学生ID';
        return;
      }
      requestStudentWrongQuestionsApi(this.studentIdForm)
        .then(res => {
          console.log('学生错题查询成功：', res.data);
          this.apiResult = res.data;
          this.apiError = null;
          this.showStudentIdInput = false;
        })
        .catch(err => {
          console.error('学生错题查询失败：', err);
          this.handleRequestError(err);
        });
    },
    // 重置表单状态（关闭所有输入框，清空结果）
    resetFormState() {
      this.showNodeIdInput = false;
      this.showQuestionBankInput = false;
      this.showFilterQuestionsInput = false;
      this.showStudentIdInput = false;
      this.customNodeId = '';
      this.apiResult = null;
      this.apiError = null;
    },
    // 统一处理请求错误
    handleRequestError(err) {
      this.apiResult = null;
      if (err.response && err.response.data) {
        // 显示后端返回的错误信息
        this.apiError = typeof err.response.data === 'object'
          ? JSON.stringify(err.response.data, null, 2)
          : err.response.data;
      } else {
        // 显示前端错误信息
        this.apiError = err.message || '请求失败，请稍后重试';
      }
    }
  },
  created() {
    // 初始化按钮配置（避免methods中的函数与API重名）
    this.buttons = [
      { label: '根API', action: this.handleRootApi },
      { label: '知识点信息', action: this.handleKnowledgeApi },
      { label: '获取三方题库数据', action: this.handleQuestionBankApi },
      { label: '筛选题目', action: this.handleFilterQuestionsApi },
      { label: '获取题目知识点', action: this.handleKnowledgeTreeApi }
    ];
    this.studentButtons = [
      { label: '传入学生ID，查询该学生所有错题', action: this.handleStudentWrongQuestionsApi }
    ];
  }
}
</script>

<style scoped>
.test-page {
  padding: 40px;
  text-align: center;
}
pre {
  text-align: left;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap; /* 自动换行 */
}
input {
  margin: 0 10px;
  padding: 4px 8px;
}
button {
  padding: 4px 12px;
  cursor: pointer;
}
</style>
