import request from '@/utils/request'

// 查询章节列表
export function listTable(query) {
  return request({
    url: '/system/chapterTitle/list',
    method: 'get',
    params: query
  })
}

// 查询章节详细
export function getTable(id) {
  return request({
    url: '/system/chapterTitle/' + id,
    method: 'get'
  })
}

// 新增章节
export function addTable(data) {
  return request({
    url: '/system/chapterTitle',
    method: 'post',
    data: data
  })
}

// 修改章节
export function updateTable(data) {
  return request({
    url: '/system/chapterTitle',
    method: 'put',
    data: data
  })
}

// 删除章节
export function delTable(id) {
  return request({
    url: '/system/chapterTitle/' + id,
    method: 'delete'
  })
}

// 获取章节树结构
export function getChapterMap() {
  return request({
    url: '/system/getchaptermap/getchaptermap',
    method: 'get'
  })
}

// 根据章节路径获取题目
export function getQuestionsByChapterPath(processedPath, pageNum = 1, pageSize = 10) {
  return request({
    url: '/system/getchaptermap/getchaptermapSid',
    method: 'get',
    params: {
      processedPath: processedPath,
      pageNum: pageNum,
      pageSize: pageSize
    }
  })
}
