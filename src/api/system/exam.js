import request from '@/utils/request'

// 创建考试系列
export function createExamSeries(data) {
  return request({
    url: '/system/exam/create_exam_series',
    method: 'post',
    data: data
  })
}

// 上传成绩总表文件
export function uploadTotalScoreFile(formData) {
  return request({
    url: '/system/exam/upload_total_score_file',
    method: 'post',
    data: formData,
    timeout: 120000
  })
}

// 上传成绩分表文件
export function uploadDetailScoreFile(formData) {
  return request({
    url: '/system/exam/upload_detail_score_file',
    method: 'post',
    data: formData,
    timeout: 120000
  })
}

// 查询考试系列详细成绩状态
export function getExamSeriesDetailScoreStatus(data) {
  return request({
    url: '/system/textbookVersion/getExamSeriesDetailScoreStatus',
    method: 'post',
    data: data
  })
}

// 删除考试系列
export function deleteExamSeries(data) {
  return request({
    url: '/system/exam/delete_exam_series',
    method: 'post',
    data: data
  })
}

// 获取考试分数分布数据
export function getScoreDistribution(data) {
  return request({
    url: '/system/exam/getScoreDistribution',
    method: 'post',
    data: data
  })
}

// 获取考试题目分析数据
export function getExamQuestionAnalysis(data) {
  return request({
    url: '/system/exam/get_exam_question_analysis',
    method: 'post',
    data: data
  })
}

// 获取考试统计数据
export function getExamStatistics(examId) {
  return request({
    url: `/system/exam/exam_statistics/${examId}`,
    method: 'get'
  })
}

