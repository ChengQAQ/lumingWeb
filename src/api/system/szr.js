import request from '@/utils/request'

// 照片驱动视频生成
export function initPhotoDrivenVideoTask(formData) {
  return request({
    url: '/system/szr/initPhotoDrivenVideoTask',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 视频驱动视频生成
export function initVideoGenerationTask(formData) {
  return request({
    url: '/system/szr/initVideoGenerationTask',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取任务列表
export function getRecentTaskList(query) {
  return request({
    url: '/system/szr/getRecentTaskList',
    method: 'get',
    params: query
  })
}

// 查询异步任务的处理和进度
export function queryTaskStatusAndProgress(taskId) {
  return request({
    url: '/system/szr/queryTaskStatusAndProgress',
    method: 'get',
    params: {
      task_id: taskId
    }
  })
}

// 获取生成的视频文件
export function getGeneratedVideoFile(filename) {
  return request({
    url: '/system/szr/getGeneratedVideoFile',
    method: 'get',
    params: {
      filename: filename
    },
    responseType: 'blob'
  })
}

// 获取教师专属数字人形象
export function getTeacherDigitalHuman(teacherId) {
  const formData = new FormData()
  formData.append('teacher_id', teacherId)
  
  return request({
    url: '/system/szr/getTeacherDigitalHuman',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除教师专属数字人形象
export function deleteTeacherDigitalHuman(teacherId) {
  const formData = new FormData()
  formData.append('teacher_id', teacherId)
  
  return request({
    url: '/system/szr/deleteTeacherDigitalHuman',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 使用教师资源生成视频
export function generateTeacherVideo(teacherId, text) {
  const formData = new FormData()
  formData.append('teacher_id', teacherId)
  formData.append('text', text)
  
  return request({
    url: '/system/szr/generateTeacherVideo',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除任务
export function deleteTask(taskId) {
  return request({
    url: `/system/szr/deleteTask/${taskId}`,
    method: 'delete'
  })
}

// 获取队列状态
export function getQueueStatus() {
  return request({
    url: '/system/szr/getQueueStatus',
    method: 'get'
  })
}