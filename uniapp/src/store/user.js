import { defineStore } from 'pinia'
import { getInfo, logout } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || {},
    roles: [],
    permissions: []
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    hasRole: (state) => (role) => state.roles.includes(role),
    hasPermission: (state) => (permission) => state.permissions.includes(permission)
  },
  
  actions: {
    // 设置token
    setToken(token) {
      this.token = token
      uni.setStorageSync('token', token)
    },
    
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      this.roles = userInfo.roles || []
      this.permissions = userInfo.permissions || []
      uni.setStorageSync('userInfo', userInfo)
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await getInfo()
        if (res.code === 200) {
          this.setUserInfo(res.user)
          return res.user
        } else {
          throw new Error(res.msg || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
    
    // 退出登录
    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.clearUserData()
      }
    },
    
    // 清除用户数据
    clearUserData() {
      this.token = ''
      this.userInfo = {}
      this.roles = []
      this.permissions = []
      
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('savedUsername')
      uni.removeStorageSync('savedPassword')
      uni.removeStorageSync('rememberMe')
    },
    
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      if (!token) {
        return false
      }
      
      // 这里可以添加token有效性检查
      // 例如检查token是否过期等
      
      return true
    }
  }
}) 