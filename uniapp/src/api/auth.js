import request from '@/utils/request'

// 登录方法
export function login(data) {
  return request({
    url: '/login',
    method: 'POST',
    data: data,
    headers: {
      'isToken': false,
      'repeatSubmit': false
    }
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    method: 'POST',
    data: data,
    headers: {
      'isToken': false
    }
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'GET'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'POST'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'GET',
    headers: {
      'isToken': false
    },
    timeout: 20000
  })
}

// 刷新token
export function refreshToken() {
  return request({
    url: '/refreshToken',
    method: 'POST'
  })
}

// 检查token是否有效
export function checkToken() {
  return request({
    url: '/checkToken',
    method: 'GET'
  })
} 