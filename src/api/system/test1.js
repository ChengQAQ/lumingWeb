import request from '@/utils/request'

// 传入学生ID+学科ID，筛选该学生在特定学科下的错题
export function getStudentWrongQuestionsBySubject(data) {
  return request({
    url: '/system/correct/getStudentWrongQuestionsBySubject',
    method: 'post',
    data: data
  })
}

// 传入知识点ID，查询关联该知识点的已批改题目
export function getCorrectedQuestionsByKnowledgeId(data) {
  return request({
    url: '/system/correct/getCorrectedQuestionsByKnowledgeId',
    method: 'post',
    data: data
  })
}

// 查询系统中所有知识点的基础信息（名称、编码、层级等）
export function getAllKnowledgePointsBasicInfo(data) {
  return request({
    url: '/system/correct/getAllKnowledgePointsBasicInfo',
    method: 'post',
    data: data
  })
}

// 返回学生对应每个知识点的错题数
export function countWrongQuestionsPerKnowledgePoint(data) {
  return request({
    url: '/system/correct/countWrongQuestionsPerKnowledgePoint',
    method: 'post',
    data: data
  })
}

// 返回学生的每个层级的错误率
export function calculateErrorRateByLevel(data) {
  return request({
    url: '/system/correct/calculateErrorRateByLevel',
    method: 'post',
    data: data
  })
}
