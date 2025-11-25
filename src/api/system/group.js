import request from '@/utils/request'

// 查询教研备课组主（类似群聊）列表
export function listGroup(query) {
  return request({
    url: '/system/group/list',
    method: 'get',
    params: query
  })
}

// 查询教研备课组主（类似群聊）详细
export function getGroup(id) {
  return request({
    url: '/system/group/' + id,
    method: 'get'
  })
}

// 新增教研备课组主（类似群聊）
export function addGroup(data) {
  return request({
    url: '/system/group',
    method: 'post',
    data: data
  })
}

// 修改教研备课组主（类似群聊）
export function updateGroup(data) {
  return request({
    url: '/system/group',
    method: 'put',
    data: data
  })
}

// 删除教研备课组主（类似群聊）
export function delGroup(id) {
  return request({
    url: '/system/group/' + id,
    method: 'delete'
  })
}

// 查询备课组列表（用于文件上传选择）
export function listGroup1(query) {
  return request({
    url: '/system/group/list1',
    method: 'get',
    params: query
  })
}

// 查询小组文件列表
export function getGroupFiles(id) {
  return request({
    url: '/system/group/file',
    method: 'get',
    params: { id }
  })
}

// 查看成员列表
export function getGroupMembers(groupId) {
  return request({
    url: '/system/member/list1',
    method: 'post',
    data: { groupId }
  })
}

// 删除成员
export function deleteMember(id) {
  return request({
    url: '/system/member/remove',
    method: 'delete',
    params: { 
      id: id
    }
  })
}

// 删除文件
export function deleteFile(id) {
  return request({
    url: '/system/member/remove',
    method: 'delete',
    params: { 
      id: id
    }
  })
}

// 添加成员
export function addMember(data) {
  return request({
    url: '/system/member',
    method: 'post',
    data: data
  })
}

// 获取可添加的老师列表
export function getAvailableTeachers() {
  return request({
    url: '/system/teacher/getTeacher',
    method: 'get'
  })
}

// 获取用户列表
export function getUserList() {
  return request({
    url: '/system/sysUser/list',
    method: 'get'
  })
}
