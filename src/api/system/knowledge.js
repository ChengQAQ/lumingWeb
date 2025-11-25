import request from '@/utils/requesta'

// 查询文件列表
export function listKnowledge(query) {
  return request({
    url: '/system/knowledge/list',
    method: 'get',
    params: query
  })
}

// 查询文件详细
export function getKnowledge(fileId) {
  return request({
    url: '/system/knowledge/' + fileId,
    method: 'get'
  })
}

// 新增文件
export function addKnowledge(data) {
  return request({
    url: '/system/knowledge',
    method: 'post',
    data: data
  })
}

// 修改文件
export function updateKnowledge(data) {
  return request({
    url: '/system/knowledge',
    method: 'put',
    data: data
  })
}

// 删除文件
export function delKnowledge(fileId) {
  return request({
    url: '/system/knowledge/' + fileId,
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
export function sysGetchaptermap(query) {  // 知识点树
  return request({
    url: '/system/sysUser/getchaptermapV2',
    method: 'get',
    params: query
  })
}
export function downloadFiles1(formData) {
  return request({
    url: '/system/knowledge/download',
    method: 'post',
    data: formData,
    responseType: 'blob', // 关键：指定响应类型为二进制流
    headers: { 'Content-Type': 'application/json' }
  })
}
export function getDeptIdByClassName(query) {
  return request({
    url: '/system/teacher/getDeptIdByClassName',
    method: 'get',
    params: query
  })
}

// 获取文件预览路径
export function getPreviewPathPC(fileId) {
  return request({
    url: '/system/knowledge/getPreviewPathPC',
    method: 'get',
    params: { fileId }
  })
}
// 获取老师列表
export function getTeacherList(query) {
  return request({
    url: '/system/knowledge/getTeacher',
    method: 'get',
    params: query
  })
}

// 获取班级列表
export function getClassList(query) {
  return request({
    url: '/system/class/listClass1',
    method: 'get',
    params: query
  })
}

// 获取备课组列表
export function getPreparationGroupList(query) {
  return request({
    url: '/system/group/list2',
    method: 'get',
    params: { a: 1, ...query }
  })
}

// 获取教研组列表
export function getTeachingResearchGroupList(query) {
  return request({
    url: '/system/group/list2',
    method: 'get',
    params: { a: 2, ...query }
  })
}

// 获取校本资源库列表
export function getSchoolBasedList(query) {
  return request({
    url: '/system/knowledge/SchoolBased',
    method: 'get',
    params: query
  })
}

// 分享文件
export function shareFiles(params) {
  return request({
    url: '/system/knowledge/shareFiles',
    method: 'get',
    params: params
  })
}
