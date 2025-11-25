import request from '@/utils/request'

// 查询学生端登录日志列表
export function listLoga(query) {
  return request({
    url: '/system/loga/list',
    method: 'get',
    params: query
  })
}

// 查询学生端登录日志详细
export function getLoga(id) {
  return request({
    url: '/system/loga/' + id,
    method: 'get'
  })
}

// 新增学生端登录日志
export function addLoga(data) {
  return request({
    url: '/system/loga',
    method: 'post',
    data: data
  })
}

// 修改学生端登录日志
export function updateLoga(data) {
  return request({
    url: '/system/loga',
    method: 'put',
    data: data
  })
}

// 删除学生端登录日志
export function delLoga(id) {
  return request({
    url: '/system/loga/' + id,
    method: 'delete'
  })
}
