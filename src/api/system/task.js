import request from '@/utils/request'

// 查询系统任务列表
export function listTask(query) {
  return request({
    url: '/system/task/list',
    method: 'get',
    params: query
  })
}

// 查询系统任务详细
export function getTask(taskId) {
  return request({
    url: '/system/task/' + taskId,
    method: 'get'
  })
}

// 新增系统任务
export function addTask(data) {
  return request({
    url: '/system/task',
    method: 'post',
    data: data
  })
}

// 修改系统任务
export function updateTask(data) {
  return request({
    url: '/system/task',
    method: 'put',
    data: data
  })
}

// 删除系统任务
export function delTask(taskId) {
  return request({
    url: '/system/task/' + taskId,
    method: 'delete'
  })
}
export function sysSubjectList(query) {
  return request({
    url: '/system/sysUser/list1',
    method: 'get',
    params: query
  })
}
export function sysDeptTree(params) {
  return request({
    url: '/system/teacher/deptTree',
    method: 'get',
    params: params
  })
}
export function sysUserList(query) {
  return request({
    url: '/system/sysUser/list',
    method: 'get',
    params: query
  })
}
export function listKFile(data) {
  return request({
    url: '/system/knowledge/select',
    method: 'POST',
    data: data
  })
}
export function listSid(data) {
  // 确保包含分页参数
  const params = {
    ...data,
    pageNum: data.pageNum || 1,
    pageSize: data.pageSize || 10
  }
  return request({
    url: '/system/sysUser/getchaptermap1',
    method: 'get',
    params: params
  })
}

// 根据任务ID获取学生列表
export function pageByStudentIdTask(taskID) {
  return request({
    url: '/system/task/pageByStudentIdTask',
    method: 'get',
    params: { taskID }
  })
}

// 根据批次ID获取学生任务详情列表
export function listByTaskGroupId(params) {
  return request({
    url: '/system/task/listByTaskGroupId',
    method: 'get',
    params: params
  })
}

// 根据批次ID删除批次任务
export function deleteByTaskGroupId(taskGroupId) {
  return request({
    url: `/system/task/batch/deleteByTaskGroupId/${taskGroupId}`,
    method: 'delete'
  })
}

// 获取班级任务分布报告
export function getClassDistribution(data) {
  return request({
    url: '/system/taskDistribution/class_distribution',
    method: 'POST',
    data: data
  })
}

// 获取班级学习分析数据
export function getClassAnalysis(data) {
  return request({
    url: '/system/learning-analysis/analyse/class/analysis',
    method: 'POST',
    data: data
  })
}

// 获取分数分布数据
export function getScoreDistribution(data) {
  return request({
    url: '/system/exam/getScoreDistribution',
    method: 'POST',
    data: data
  })
}

// 获取题目分布数据
export function getQuestionDistribution(data) {
  return request({
    url: '/system/exam/questionDistribution',
    method: 'POST',
    data: data
  })
}