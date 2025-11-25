import request from '@/utils/request'

// 查询教研备课组成员列表
export function listMember(query) {
  return request({
    url: '/system/member/list',
    method: 'get',
    params: query
  })
}

// 查询教研备课组成员详细
export function getMember(id) {
  return request({
    url: '/system/member/' + id,
    method: 'get'
  })
}

// 新增教研备课组成员
export function addMember(data) {
  return request({
    url: '/system/member',
    method: 'post',
    data: data
  })
}

// 修改教研备课组成员
export function updateMember(data) {
  return request({
    url: '/system/member',
    method: 'put',
    data: data
  })
}

// 删除教研备课组成员
export function delMember(id) {
  return request({
    url: '/system/member/' + id,
    method: 'delete'
  })
}
