import request from '@/utils/request'

// 查询组卷作业主表列表
export function listPaperAssignment(query) {
  return request({
    url: '/system/paperAssignment/list',
    method: 'get',
    params: query
  })
}

// 查询主表及其子表题目
export function getPaperAssignment(id) {
  return request({
    url: '/system/paperAssignment/' + id,
    method: 'get'
  })
}

// 新增组卷作业（主表+子表）
export function addPaperAssignment(data) {
  return request({
    url: '/system/paperAssignment',
    method: 'post',
    data: data
  })
}

// 修改组卷作业（主表+子表）
export function updatePaperAssignment(data) {
  return request({
    url: '/system/paperAssignment',
    method: 'put',
    data: data
  })
}

// 删除组卷作业（主表+所有子表）
export function delPaperAssignment(ids) {
  return request({
    url: '/system/paperAssignment/' + ids,
    method: 'delete'
  })
}

// 添加子表题目
export function addPaperAssignmentDetail(mainId, data) {
  return request({
    url: '/system/paperAssignment/' + mainId + '/details',
    method: 'post',
    data: data
  })
}

// 移除子表题目
export function removePaperAssignmentDetail(mainId, detailIds) {
  return request({
    url: '/system/paperAssignment/' + mainId + '/details/' + detailIds,
    method: 'delete'
  })
}

// 导出主表列表
export function exportPaperAssignment(query) {
  return request({
    url: '/system/paperAssignment/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

