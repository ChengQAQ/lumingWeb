import request from '@/utils/request'

// 查询学生学习时间记录列表
export function listRecord(query) {
  return request({
    url: '/system/record/list',
    method: 'get',
    params: query
  })
}

// 查询学生学习时间记录详细
export function getRecord(id) {
  return request({
    url: '/system/record/' + id,
    method: 'get'
  })
}

// 新增学生学习时间记录
export function addRecord(data) {
  return request({
    url: '/system/record',
    method: 'post',
    data: data
  })
}

// 修改学生学习时间记录
export function updateRecord(data) {
  return request({
    url: '/system/record',
    method: 'put',
    data: data
  })
}

// 删除学生学习时间记录
export function delRecord(id) {
  return request({
    url: '/system/record/' + id,
    method: 'delete'
  })
}
export function sysUserList(query) {
  return request({
    url: '/system/sysUser/list',
    method: 'get',
    params: query
  })
}
export function sysSubjectList(query) {
  return request({
    url: '/system/sysUser/list1',
    method: 'get',
    params: query
  })
}
