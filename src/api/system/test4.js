import request from '@/utils/requesta'
/**
 * 下载文件（单个或批量）
 * @param {Object} formData - 包含fileIdList的对象
 * @returns {Promise} - 返回Promise对象
 */
export function downloadFiles(formData) {
  return request({
    url: '/system/webKnowledge/download',
    method: 'post',
    data: formData,
    responseType: 'blob', // 关键：指定响应类型为二进制流
    headers: { 'Content-Type': 'application/json' }
  })
}
export function downloadFiles1(formData) {
  return request({
    url: '/system/webMailbox/download',
    method: 'post',
    data: formData,
    responseType: 'blob', // 关键：指定响应类型为二进制流
    headers: { 'Content-Type': 'application/json' }
  })
}
