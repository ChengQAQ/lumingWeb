import request from '@/utils/request'

//章节
export function chaptermap(data) {
  return request({
    url: '/system/getchaptermap/getchaptermap',
    method: 'get',
    params: data
  })
}
// 新增章节
export function addDirectoryToChaptermap(data) {
  return request({
    url: '/system/mapApi/addDirectoryToChaptermap',
    method: 'post',
    data
  })
}
// 删除章节
export function deleteDirectoryToChaptermap(params) {
  return request({
    url: '/system/mapApi/deleteDirectoryToChaptermap',
    method: 'delete',
    params
  })
}
// 修改章节
export function updateDirectoryPathToChaptermap(data) {
  return request({
    url: '/system/mapApi/updateDirectoryPathToChaptermap',
    method: 'put',
    data
  })
}

//知识点
export function dirmap(data) {
  return request({
    url: '/system/sysUser/getchaptermapV2',
    method: 'get',
    params: data
  })
}
// 新增知识点
export function addDirectoryToDirmap(data) {
  return request({
    url: '/system/mapApi/addDirectoryToDirmap',
    method: 'post',
    data
  })
}
// 删除知识点
export function deleteDirectoryToDirmap(params) {
  return request({
    url: '/system/mapApi/deleteDirectoryToDirmap',
    method: 'delete',
    params
  })
}
// 修改知识点
export function updateDirectoryToDirmap(data) {
  return request({
    url: '/system/mapApi/updateDirectoryPathToDirmap',
    method: 'put',
    data
  })
}
