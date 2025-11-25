import request from '@/utils/request'

// 查询用户笔记列表
export function listNote(query) {
  return request({
    url: '/system/note/list',
    method: 'get',
    params: query
  })
}

// 查询用户笔记详细
export function getNote(id) {
  return request({
    url: '/system/note/' + id,
    method: 'get'
  })
}

// 新增用户笔记
export function addNote(data) {
  return request({
    url: '/system/note',
    method: 'post',
    data: data
  })
}

// 修改用户笔记
export function updateNote(data) {
  return request({
    url: '/system/note',
    method: 'put',
    data: data
  })
}

// 删除用户笔记
export function delNote(id) {
  return request({
    url: '/system/note/' + id,
    method: 'delete'
  })
}
