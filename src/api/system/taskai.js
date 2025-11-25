import request from '@/utils/request'

// 查询AI任务，记录各类AI任务的基本信息列表
export function listTaskai(query) {
  return request({
    url: '/system/taskai/list',
    method: 'get',
    params: query
  })
}

// 查询AI任务，记录各类AI任务的基本信息详细
export function getTaskai(id) {
  return request({
    url: '/system/taskai/' + id,
    method: 'get'
  })
}

// 新增AI任务，记录各类AI任务的基本信息
export function addTaskai(data) {
  return request({
    url: '/system/taskai',
    method: 'post',
    data: data
  })
}

// 修改AI任务，记录各类AI任务的基本信息
export function updateTaskai(data) {
  return request({
    url: '/system/taskai',
    method: 'put',
    data: data
  })
}

// 删除AI任务，记录各类AI任务的基本信息
export function delTaskai(id) {
  return request({
    url: '/system/taskai/' + id,
    method: 'delete'
  })
}
