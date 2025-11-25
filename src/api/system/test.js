import request from '@/utils/request'

// 根API请求
export function requestRootApi() {
  return request({
    url: '/system/api/rootapi',
    method: 'get'
  })
}

// 知识点信息请求
export function requestKnowledgeApi(data) {
  return request({
    url: '/system/api/knowledge',
    method: 'post',
    data: data
  })
}

// 获取三方题库数据
export function requestQuestionBankApi(data) {
  return request({
    url: '/system/api/questionBank',
    method: 'post',
    data: data
  })
}

// 筛选题目
export function requestFilterQuestionsApi(data) {
  return request({
    url: '/system/api/filterQuestions',
    method: 'post',
    data: data
  })
}

// 获取题目知识点
export function requestKnowledgeTreeApi() {
  return request({
    url: '/system/api/KnowledgeTree',
    method: 'post'
  })
}

// 传入学生ID，查询该学生所有错题
export function requestStudentWrongQuestionsApi(data) {
  return request({
    url: '/system/correct/students',
    method: 'post',
    data: data
  })
}
