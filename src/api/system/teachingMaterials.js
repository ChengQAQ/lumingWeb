import request from '@/utils/request'

// Word转JSON
export function wordToJson(data) {
  return request({
    url: '/system/mqAi/wordToJson',
    method: 'post',
    data: data,
    timeout: 300000 // 5分钟超时
  })
}

// PDF转MD
export function pdfToMd(data) {
  return request({
    url: '/system/mqAi/pdfToMd',
    method: 'post',
    data: data,
    timeout: 300000 // 5分钟超时
  })
}

// 格式化JSON
export function formatJson(data) {
  return request({
    url: '/system/mqAi/formatJson',
    method: 'post',
    data: data,
    timeout: 300000 // 5分钟超时
  })
}

// 添加知识点
export function addKnowledge(data) {
  return request({
    url: '/system/mqAi/addknowledge',
    method: 'post',
    data: data,
    timeout: 300000 // 5分钟超时
  })
}

// 检查MQ任务状态
export function checkTaskStatus(taskId) {
  return request({
    url: `/system/mqAi/taskStatus/${taskId}`,
    method: 'get',
    timeout: 30000
  })
}

// 获取题型列表
export function getQuestionTypes(subjectName) {
  return request({
    url: `/system/teacher/chapterMap/`,
    method: 'get',
    params: {
      subject_name: subjectName
    }
  })
}

// 获取章节树
export function getChapterTree() {
  return request({
    url: '/system/getchaptermap/getchaptermap',
    method: 'get',
    timeout: 30000
  })
}

// 获取任务列表
export function getTaskList(params) {
  return request({
    url: '/system/taskai/list1',
    method: 'get',
    params: params,
    timeout: 30000
  })
}

// 获取任务JSON数据
export function getTaskJson(taskId) {
  return request({
    url: `/system/mqAi/task/${taskId}`,
    method: 'get',
    timeout: 30000
  })
}

// 删除任务
export function deleteTask(taskId) {
  return request({
    url: `/system/taskai/${taskId}`,
    method: 'delete',
    timeout: 30000
  })
}

// 上传题目数据
export function uploadQuestion(questionData) {
  return request({
    url: '/system/questionDocumentUpload/addQuestion1',
    method: 'post',
    data: questionData,
    timeout: 30000
  })
}

// 更新题目数据
export function updateQuestion(questionData) {
  return request({
    url: '/system/questionDocumentUpload/updateQuestion',
    method: 'put',
    data: questionData,
    timeout: 30000
  })
}

// 获取学科题型类型
export function getSubjectQuestionTypes(subjectName) {
  return request({
    url: '/system/newquestionapi/subjectQuestionType',
    method: 'get',
    params: {
      subject_name: subjectName
    },
    timeout: 30000
  })
}

// 更新任务进度
export function updateTaskProgress(data) {
  return request({
    url: '/system/progress',
    method: 'put',
    data: data,
    timeout: 30000
  })
}

// 获取知识点
export function getKnowledgePoints(subjectName) {
  return request({
    url: '/system/sysUser/reward/knowledgePoints',
    method: 'post',
    data: {
      subject_name: subjectName
    },
    timeout: 30000
  })
}

// pdf转md
export function pdfParse(data) {
  return request({
    url: '/system/ocr2/parse',
    method: 'post',
    data: data,
    timeout: 300000 // 5分钟超时
  })
}

// OCR解析PDF
export function ocrParse(data) {
  return request({
    url: '/system/mqAi/ocrParse',
    method: 'post',
    data: data,
    timeout: 300000 // 5分钟超时
  })
}

// 解析题目分隔
export function parseQuestionSplit(data) {
  return request({
    url: '/system/parse-question/parse-split',
    method: 'post',
    data: data,
    timeout: 300000 // 5分钟超时
  })
}

// Markdown文本转JSON
export function markdownTextToJson(formData) {
  return request({
    url: '/system/mqAi/markdownTextToJson',
    method: 'post',
    data: formData,
    timeout: 300000 // 5分钟超时
  })
}
