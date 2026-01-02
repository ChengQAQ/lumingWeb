import request from '@/utils/request'

// 获取访问分析汇总数据
export function getRecordAnalysisSummary(query) {
  return request({
    url: '/system/recordAnalysis/summary',
    method: 'get',
    params: query
  })
}

// 导出访问分析数据为Excel
export function exportRecordAnalysis(query) {
  return request({
    url: '/system/recordAnalysis/summary/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

