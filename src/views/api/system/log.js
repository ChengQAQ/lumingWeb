import request from '@/utils/request'

// 查询操作日志，记录调用、阅读、点击及使用状态信息列表
export function listLog(query) {
  return request({
    url: '/system/log/list',
    method: 'get',
    params: query
  })
}

// 查询操作日志，记录调用、阅读、点击及使用状态信息详细
export function getLog(id) {
  return request({
    url: '/system/log/' + id,
    method: 'get'
  })
}

// 新增操作日志，记录调用、阅读、点击及使用状态信息
export function addLog(data) {
  return request({
    url: '/system/log',
    method: 'post',
    data: data
  })
}

// 修改操作日志，记录调用、阅读、点击及使用状态信息
export function updateLog(data) {
  return request({
    url: '/system/log',
    method: 'put',
    data: data
  })
}

// 删除操作日志，记录调用、阅读、点击及使用状态信息
export function delLog(id) {
  return request({
    url: '/system/log/' + id,
    method: 'delete'
  })
}
