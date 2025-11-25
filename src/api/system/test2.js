import request from '@/utils/request'

// 获取指定会话的历史记录，可限制返回轮数
export function getSessionHistoryBySessionId(params) {
  return request({
    url: '/system/chat/getSessionHistoryBySessionId',
    method: 'get',
    params: params
  })
}

// 获取所有支持的场景提示词
export function getAllSupportedScenarioPrompts() {
  return request({
    url: '/system/chat/getAllSupportedScenarioPrompts',
    method: 'get'
  })
}

// 清除指定会话的历史记录与生成的音频文件
export function clearSessionHistoryAndAudioFiles(params) {
  return request({
    url: '/system/chat/clearSessionHistoryAndAudioFiles',
    method: 'delete',
    params: params
  })
}

// 创建新的会话，返回唯一的 session_id
export function newSessionId(data) {
  return request({
    url: '/system/chat/newSessionId',
    method: 'post',
    data: data
  })
}

// 提交文本或音频对话内容，获得 AI 的文本回复，并可选返回语音路径
export function submitDialogueAndGetReply(data) {
  return request({
    url: '/system/chat/submitDialogueAndGetReply',
    method: 'post',
    data: data
  })
}
