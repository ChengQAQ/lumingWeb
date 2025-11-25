import request from '@/utils/request'

// 上传文件 (OCR接口)
export function uploadFile(data) {
  return request({
    url: '/system/teacher/ocr03',
    method: 'post',
    data: data
  })
}

// 生成题目 (OCR接口)
export function generateProblems(data) {
  return request({
    url: 'http://192.168.1.11:8080/system/teacher/ocr03', // 直接使用完整URL
    method: 'post',
    data: data,
    timeout: 600000, // 10分钟超时 (600秒 * 1000毫秒)
    headers: {
      'Content-Type': undefined, // 让浏览器自动设置Content-Type
      'repeatSubmit': false // 禁用防重复提交检查，因为FormData无法JSON.stringify
    },
    transformRequest: [function (data) {
      return data // 不转换FormData
    }]
  })
}

// 获取题目列表
export function listProblems(query) {
  return request({
    url: '/system/problems/list',
    method: 'get',
    params: query
  })
}

// 获取题目详情
export function getProblem(problemId) {
  return request({
    url: '/system/problems/' + problemId,
    method: 'get'
  })
}

// 修改题目
export function updateProblem(data) {
  return request({
    url: '/system/problems',
    method: 'put',
    data: data
  })
}

// 删除题目
export function delProblem(problemId) {
  return request({
    url: '/system/problems/' + problemId,
    method: 'delete'
  })
}

// 保存题目到题库
export function saveProblem(data) {
  return request({
    url: '/system/teacher/addQuestion',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 搜索题目
export function searchProblems(data) {
  return request({
    url: '/system/teacher/questionsSearch',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// OCR搜题接口
export function ocrSearch(formData, subject) {
  return request({
    url: `/system/ocr2/image_research?subject=${encodeURIComponent(subject)}`,
    method: 'post',
    data: formData,
    timeout: 600000, // 10分钟超时
    headers: {
      'Content-Type': undefined, // 让浏览器自动设置Content-Type
      'repeatSubmit': false // 禁用防重复提交检查
    },
    transformRequest: [function (data) {
      return data // 不转换FormData
    }]
  })
}

// 获取题目类型分布
export function getQuestionTypeDistribution(subjectName) {
  return request({
    url: '/system/teacher/chapterMap/',
    method: 'get',
    params: { subject_name: subjectName }
  })
}

// 三方题库搜题
export function thirdPartySearch(data) {
  return request({
    url: '/system/TeacherSide/question/fetchQuestionsJyeoo',
    method: 'post',
    data: data,
    timeout: 120000  // 单独设置2分钟超时
  })
}

// 获取用户年级和科目
export function getGradeAndSubject() {
  return request({
    url: '/system/teacher/getgradeandsubject',
    method: 'get'
  })
}

// 保存题目
export function saveQuestion(data) {
  return request({
    url: '/system/problems',
    method: 'post',
    data: data
  })
}

// 获取收藏标签列表
export function listQuestionTags() {
  return request({
    url: '/system/question/listTag',
    method: 'get'
  })
}

// 添加收藏（POST，需要 questionSid 和 tags）
export function addQuestionTag(data) {
  return request({
    url: '/system/question',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 修改收藏标签（PUT，修改已有收藏的标签）
export function updateQuestionTag(data) {
  return request({
    url: '/system/question',
    method: 'put',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 添加收藏（兼容方法，添加收藏时总是使用 POST）
export function saveQuestionTag(data) {
  // 添加收藏时，即使有 questionSid 也使用 POST
  // 只有当明确需要修改标签时才使用 PUT
  if (data.isUpdate) {
    return updateQuestionTag(data)
  }
  return addQuestionTag(data)
}

// 获取收藏题目列表
export function listQuestionFavorites(query) {
  return request({
    url: '/system/question/list',
    method: 'get',
    params: query
  })
}

// 删除收藏
export function deleteQuestionFavorite(data) {
  return request({
    url: '/system/question/delete',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': undefined, // 让浏览器自动设置Content-Type为multipart/form-data
      'repeatSubmit': false // 禁用防重复提交检查
    },
    transformRequest: [function (data) {
      return data // 不转换FormData
    }]
  })
}

// 查询题目是否已收藏
export function checkQuestionCollect(questionIds) {
  // 如果 questionIds 是数组，需要转换为字符串格式
  let questionIdsParam = questionIds
  if (Array.isArray(questionIds)) {
    questionIdsParam = questionIds.join(',')
  }
  return request({
    url: '/system/question/isCollect',
    method: 'get',
    params: {
      questionIds: questionIdsParam
    }
  })
}

// 图片检测接口
export function detectImage(formData) {
  return request({
    url: '/system/imageDetection/detect-image',
    method: 'post',
    data: formData,
    timeout: 30000, // 30秒超时
    headers: {
      'Content-Type': undefined, // 让浏览器自动设置Content-Type
      'repeatSubmit': false // 禁用防重复提交检查
    },
    transformRequest: [function (data) {
      return data // 不转换FormData
    }]
  })
}

// 发送给ai裁剪后结果，不需要返回值
export function saveAnnotatio(formData) {
  return request({
    url: '/system/imageDetection/save-annotation',
    method: 'post',
    data: formData,
    timeout: 30000, // 30秒超时
    headers: {
      'Content-Type': undefined, // 让浏览器自动设置Content-Type
      'repeatSubmit': false // 禁用防重复提交检查
    },
    transformRequest: [function (data) {
      return data // 不转换FormData
    }]
  })
}
