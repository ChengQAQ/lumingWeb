import request from '@/utils/request'

// 查询邮箱列表
export function listMailbox(query) {
  return request({
    url: '/system/mailbox/list',
    method: 'get',
    params: query
  })
}
export function listMailboxByUser(query) {
  return request({
    url: '/system/mailbox/select1',
    method: 'get',
    params: query
  })
}
export function sysUserList(query) {
  return request({
    url: '/system/sysUser/list',
    method: 'get',
    params: query
  })
}
// 查询邮箱详细
export function getMailbox(id) {
  return request({
    url: '/system/mailbox/' + id,
    method: 'get'
  })
}

// 新增邮箱
export function addMailbox(data) {
  return request({
    url: '/system/mailbox',
    method: 'post',
    data: data
  })
}

// 修改邮箱
export function updateMailbox(data) {
  return request({
    url: '/system/mailbox',
    method: 'put',
    data: data
  })
}

// 删除邮箱
export function delMailbox(id) {
  return request({
    url: '/system/mailbox/' + id,
    method: 'delete'
  })
}

// 获取附件预览路径
export function getAttachmentPreviewPath(fileId) {
  return request({
    url: '/system/mailbox/getPreviewPathPC',
    method: 'get',
    params: { fileId }
  })
}
