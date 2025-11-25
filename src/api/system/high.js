import request from '@/utils/request'

// 查询高中学生能力评估列表
export function listHigh(query) {
  return request({
    url: '/system/high/list',
    method: 'get',
    params: query
  })
}

// 查询高中学生能力评估详细
export function getHigh(id) {
  return request({
    url: '/system/high/' + id,
    method: 'get'
  })
}

// 新增高中学生能力评估
export function addHigh(data) {
  return request({
    url: '/system/high',
    method: 'post',
    data: data
  })
}

// 修改高中学生能力评估
export function updateHigh(data) {
  return request({
    url: '/system/high',
    method: 'put',
    data: data
  })
}

// 删除高中学生能力评估
export function delHigh(id) {
  return request({
    url: '/system/high/' + id,
    method: 'delete'
  })
}
