<template>
  <view class="login-test">
    <view class="login-card">
      <view class="header">
        <text class="title">麓鸣东方 管理端</text>
        <text class="subtitle">UniApp平板端 - 登录测试</text>
      </view>
      
      <view class="form">
        <view class="input-group">
          <text class="label">用户名</text>
          <input 
            v-model="username" 
            class="input" 
            placeholder="请输入用户名"
          />
        </view>
        
        <view class="input-group">
          <text class="label">密码</text>
          <input 
            v-model="password" 
            class="input" 
            type="password"
            placeholder="请输入密码"
          />
        </view>
        
        <button class="login-btn" @click="handleLogin">
          登录测试
        </button>
      </view>
      
      <view class="info">
        <text class="info-text">✅ UniApp项目运行正常</text>
        <text class="info-text">📱 这是平板端登录界面</text>
        <text class="info-text">🎨 使用原生uni-app组件</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LoginTest',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      uni.showToast({
        title: '登录功能测试成功！',
        icon: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-test {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-card {
  background: white;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  width: 100%;
  max-width: 600rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #303133;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #409EFF;
  }
}

.form {
  margin-bottom: 60rpx;
  
  .input-group {
    margin-bottom: 40rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #606266;
      margin-bottom: 16rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      padding: 0 24rpx;
      border: 2rpx solid #e4e7ed;
      border-radius: 12rpx;
      font-size: 32rpx;
      background: #f8f9fa;
      
      &:focus {
        border-color: #409EFF;
        background: white;
      }
    }
  }
  
  .login-btn {
    width: 100%;
    height: 80rpx;
    background: #409EFF;
    color: white;
    border: none;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: 600;
    
    &:active {
      background: #337ecc;
    }
  }
}

.info {
  text-align: center;
  
  .info-text {
    display: block;
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 8rpx;
  }
}
</style> 