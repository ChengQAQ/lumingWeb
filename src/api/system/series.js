import request from '@/utils/request'

// 查询系列数据列表
export function listSeries(query) {
  return request({
    url: '/system/series/list',
    method: 'get',
    params: query
  })
}

// 查询系列数据详细
export function getSeries(id) {
  return request({
    url: '/system/series/' + id,
    method: 'get'
  })
}

// 新增系列数据
export function addSeries(data) {
  return request({
    url: '/system/series',
    method: 'post',
    data: data
  })
}

// 修改系列数据
export function updateSeries(data) {
  return request({
    url: '/system/series',
    method: 'put',
    data: data
  })
}

// 删除系列数据
export function delSeries(id) {
  return request({
    url: '/system/series/' + id,
    method: 'delete'
  })
}
