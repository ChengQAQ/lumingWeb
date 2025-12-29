import request from '@/utils/request'

// 根据部门ID获取学生列表
export function getStudentList(params) {
  return request({
    url: '/system/teacher/getStudentList',
    method: 'get',
    params: params
  })
}

// 获取试题中心数据
export function getQuestionCenter() {
  return request({
    url: '/system/teacher/getQuestionCenter',
    method: 'get'
  })
}

// 获取今日课程数据
export function getTodayCourse() {
  return request({
    url: '/system/teacher/getTodayCourse',
    method: 'get'
  })
}

// 获取我的任务数据
export function getMyTask() {
  return request({
    url: '/system/task/getMyTask',
    method: 'get'
  })
}

// 获取最近文件数据
export function getRecentFiles() {
  return request({
    url: '/system/teacher/getRecentFiles',
    method: 'get'
  })
}

// 获取教师信息
export function getTeacherInfo() {
  return request({
    url: '/system/teacher/getTeacherInfo',
    method: 'get'
  })
}

// 推荐相似题目
export function recommendSimilarPaperUpdate(data) {
  return request({
    url: '/system/teacher/recommendSimilarPaperUpdate',
    method: 'post',
    data: data
  })
}

// 根据章节列表生成试卷
export function generatePaperByChapterList(data) {
  return request({
    url: '/system/teacher/generatePaperByChapterList',
    method: 'post',
    data: data
  })
}

// 获取班级列表
export function listClass() {
  return request({
    url: '/system/class/listClass',
    method: 'get'
  })
}

// 获取学生做题记录
export function getStudentRecords(taskIds) {
  // 确保taskIds是数组格式，后端接收ArrayList<String>
  const taskIdsArray = Array.isArray(taskIds) ? taskIds : [taskIds]

  // 构建URL参数 - 将数组转换为多个同名参数
  const params = taskIdsArray.map(id => `taskids=${encodeURIComponent(id)}`).join('&')
  const url = `/system/teacher/getStudentRecords?${params}`

  return request({
    url: url,
    method: 'get'
  })
}
// 批阅学生做题记录
export function updateRecord(data) {
  return request({
    url: '/system/teacher/updateRecord',
    method: 'post',
    data: data
  })
}

// 新的批阅接口 - 更新学生答题记录
export function updateAnswerRecords(data) {
  return request({
    url: '/system/teacher/record/AnswerRecordsUpdate',
    method: 'post',
    data: data
  })
}
export function gradeText(data) {
  return request({
    url: '/system/teacher/gradeText',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传图片
export function uploadImage(data) {
  return request({
    url: '/system/image',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 根据教辅材料搜索题目
export function searchBySeries(data) {
  return request({
    url: '/system/teacher/SearchBySeries',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 根据用户ID获取用户信息
export function getUserInfo(userId) {
  return request({
    url: '/system/teacher/getUserInfo',
    method: 'get',
    params: { userId }
  })
}

// 预览接口，获取 subject_name
export function getPreviewSubjectName(params) {
  return request({
    url: '/system/teacher/preview',
    method: 'get',
    params: {
      SubjectCode: params.SubjectCode,
      userId: params.userId
    }
  })
}

// 根据学生ID数组获取用户信息
export function getUserInfos(userIds) {
  // 手动构建URL参数，将数组转换为多个同名参数：userIds=1&userIds=2&userIds=3
  let url = '/system/teacher/getUserInfos'
  if (Array.isArray(userIds) && userIds.length > 0) {
    const params = userIds.map(id => `userIds=${encodeURIComponent(id)}`).join('&')
    url += '?' + params
  }
  
  return request({
    url: url,
    method: 'get',
    params: {} // 空对象，因为参数已经在URL中了
  })
}
