import request from '@/utils/request'

// 教案转换接口
export function convertTeachplan(data, config = {}) {
  return request({
    url: '/system/teacher/convertTeachplan',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000, // 10分钟超时
    ...config
  })
}

// 学案转换接口
export function convertStudyplan(data, config = {}) {
  return request({
    url: '/system/teacher/convertNote',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000,
    ...config
  })
}

// 思维导图转换接口
export function convertMindmap(data, config = {}) {
  return request({
    url: '/system/teacher/convertMindmap',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000,
    ...config
  })
}

// 作文批改接口
export function convertComposition(data, config = {}) {
  return request({
    url: '/system/teacher/convertComposition',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000,
    ...config
  })
}

// 中文作文批改接口
export function gradeCNEssay(data, config = {}) {
  return request({
    url: '/system/teacher/gradeCNEssay',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000,
    ...config
  })
}

// 英文作文批改接口
export function gradeEssay(data, config = {}) {
  return request({
    url: '/system/teacher/gradeEssay',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000,
    ...config
  })
}

// 试卷生成接口
export function convertExampaper(data, config = {}) {
  return request({
    url: '/system/teacher/convertExampaper',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000,
    ...config
  })
}


// 新的阅读题生成接口
export function generateQuestions(data, config = {}) {
  return request({
    url: '/system/teacher/generateQuestions',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000,
    ...config
  })
} 