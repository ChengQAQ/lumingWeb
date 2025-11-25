// 基础配置
const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://your-production-domain.com'

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加token
  const token = uni.getStorageSync('token')
  if (token && !config.headers.isToken) {
    config.header = {
      ...config.header,
      'Authorization': 'Bearer ' + token
    }
  }
  
  // 添加基础URL
  if (!config.url.startsWith('http')) {
    config.url = baseURL + config.url
  }
  
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  if (statusCode === 200) {
    return data
  } else if (statusCode === 401) {
    // token过期，跳转到登录页
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    uni.reLaunch({
      url: '/pages/login/index'
    })
    return Promise.reject(new Error('登录已过期，请重新登录'))
  } else {
    return Promise.reject(new Error(data.msg || '请求失败'))
  }
}

// 错误处理
const errorHandler = (error) => {
  console.error('请求错误:', error)
  
  // 网络错误
  if (error.errMsg && error.errMsg.includes('request:fail')) {
    uni.showToast({
      title: '网络连接失败，请检查网络设置',
      icon: 'none',
      duration: 3000
    })
  } else {
    uni.showToast({
      title: error.message || '请求失败',
      icon: 'none',
      duration: 2000
    })
  }
  
  return Promise.reject(error)
}

// 主请求函数
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 应用请求拦截器
    const config = requestInterceptor(options)
    
    // 发起请求
    uni.request({
      url: config.url,
      method: config.method || 'GET',
      data: config.data || {},
      header: config.header || {},
      timeout: config.timeout || 10000,
      success: (response) => {
        try {
          const result = responseInterceptor(response)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        errorHandler(error)
        reject(error)
      }
    })
  })
}

// 导出请求方法
export default request

// 导出便捷方法
export const get = (url, params = {}, config = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...config
  })
}

export const post = (url, data = {}, config = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...config
  })
}

export const put = (url, data = {}, config = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

export const del = (url, config = {}) => {
  return request({
    url,
    method: 'DELETE',
    ...config
  })
} 