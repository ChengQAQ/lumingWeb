import request from '@/utils/request'

// 查询初中学生能力评估列表
export function listMiddle(query) {
  return request({
    url: '/system/middle/list',
    method: 'get',
    params: query
  })
}

// 查询初中学生能力评估详细
export function getMiddle(id) {
  return request({
    url: '/system/middle/' + id,
    method: 'get'
  })
}

// 新增初中学生能力评估
export function addMiddle(data) {
  return request({
    url: '/system/middle',
    method: 'post',
    data: data
  })
}

// 修改初中学生能力评估
export function updateMiddle(data) {
  return request({
    url: '/system/middle',
    method: 'put',
    data: data
  })
}

// 删除初中学生能力评估
export function delMiddle(id) {
  return request({
    url: '/system/middle/' + id,
    method: 'delete'
  })
}
