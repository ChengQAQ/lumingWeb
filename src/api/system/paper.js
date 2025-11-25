import request from '@/utils/request'

// 查询组卷列表
export function listPaper(query) {
  return request({
    url: '/system/paper/list',
    method: 'get',
    params: query
  })
}

// 查询组卷详细
export function getPaper(id) {
  return request({
    url: '/system/paper/' + id,
    method: 'get'
  })
}

// 新增组卷
export function addPaper(data) {
  return request({
    url: '/system/paper',
    method: 'post',
    data: data
  })
}

// 修改组卷
export function updatePaper(data) {
  return request({
    url: '/system/paper',
    method: 'put',
    data: data
  })
}

// 删除组卷
export function delPaper(id) {
  return request({
    url: '/system/paper/' + id,
    method: 'delete'
  })
}

// 获取题目完整详情
export function getQuestionDetail(data) {
  return request({
    url: '/system/sysUser/getdetailbysidAdmin',
    method: 'post',
    data: data,
    timeout: 600000
  })
}

// 根据知识点获取题目详情
export function getQuestionDetailByKnowledge(data) {
  return request({
    url: '/system/newquestionapi/questionByKnowledges',
    method: 'post',
    data: data,
    timeout: 600000
  })
}

// 获取题型列表
export function getQuestionTypes(subjectName) {
  return request({
    url: '/system/teacher/chapterMap/',
    method: 'get',
    params: { subject_name: subjectName }
  })
}

// 根据题目ID数组获取题目数据
export function getQuestionsBySids(data) {
  return request({
    url: '/system/teacher/getquestionbysids',
    method: 'post',
    data: data
  })
}

// 获取科目名称
export function getSubjectName(data) {
  return request({
    url: '/system/teacher/getgradeandsubject',
    method: 'get',
    params: data
  })
}

// 导出试卷为Word
export function exportTestPaper(data) {
  return request({
    url: '/system/paper/exportTestPaper',
    method: 'post',
    data: data,
    responseType: 'blob',
    timeout: 600000
  })
}

// HTML转Word文档
export function htmlToWord(data) {
  // 创建FormData对象
  const formData = new FormData()
  
  // 添加html参数
  if (data.html) {
    formData.append('html', data.html)
  }
  
  // 添加file_name参数
  if (data.file_name) {
    formData.append('file_name', data.file_name)
  }
  
  return request({
    url: '/system/teacher/htmlToWord',
    method: 'post',
    data: formData,
    responseType: 'blob',
    timeout: 600000,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
