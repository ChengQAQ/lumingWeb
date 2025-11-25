import request from '@/utils/request'

// 查询app更新列表
export function listUpdate(query) {
  return request({
    url: '/system/update/list',
    method: 'get',
    params: query
  })
}

// 查询app更新详细
export function getUpdate(id) {
  return request({
    url: '/system/update/' + id,
    method: 'get'
  })
}

// 新增app更新
export function addUpdate(data) {
  return request({
    url: '/system/update',
    method: 'post',
    data: data
  })
}

// 修改app更新
export function updateUpdate(data) {
  return request({
    url: '/system/update',
    method: 'put',
    data: data
  })
}

// 删除app更新
export function delUpdate(id) {
  return request({
    url: '/system/update/' + id,
    method: 'delete'
  })
}
