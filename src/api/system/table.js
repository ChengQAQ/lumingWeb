import request from '@/utils/request'

// 查询作业列表
export function listTable(query) {
  return request({
    url: '/system/table/list',
    method: 'get',
    params: query
  })
}

// 查询作业详细
export function getTable(id) {
  return request({
    url: '/system/table/' + id,
    method: 'get'
  })
}

// 新增作业
export function addTable(data) {
  return request({
    url: '/system/table',
    method: 'post',
    data: data
  })
}

// 修改作业
export function updateTable(data) {
  return request({
    url: '/system/table',
    method: 'put',
    data: data
  })
}

// 删除作业
export function delTable(id) {
  return request({
    url: '/system/table/' + id,
    method: 'delete'
  })
}
