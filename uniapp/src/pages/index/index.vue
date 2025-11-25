<template>
  <view class="index-container">
    <view class="header">
      <text class="title">麓鸣东方 管理端</text>
      <text class="subtitle">平板端</text>
    </view>
    
    <view class="quick-actions">
      <view 
        class="action-item" 
        v-for="action in quickActions" 
        :key="action.id"
        @click="navigateTo(action.path)"
      >
        <view class="action-icon">
          <text class="icon-text">{{ action.icon }}</text>
        </view>
        <text class="action-title">{{ action.title }}</text>
        <text class="action-desc">{{ action.description }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      quickActions: [
        {
          id: 1,
          title: '题目搜索',
          description: '快速搜索题目',
          icon: '🔍',
          path: '/pages/search/index'
        },
        {
          id: 2,
          title: '题目管理',
          description: '管理题目库',
          icon: '📝',
          path: '/pages/problems/list'
        },
        {
          id: 3,
          title: '组卷',
          description: '创建试卷',
          icon: '📄',
          path: '/pages/paper/create'
        }
      ]
    }
  },
  methods: {
    navigateTo(path) {
      uni.navigateTo({
        url: path
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
  
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #303133;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 32rpx;
    color: #909399;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
  gap: 40rpx;
}

.action-item {
  background: white;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  }
  
  .action-icon {
    margin-bottom: 32rpx;
    
    .icon-text {
      font-size: 80rpx;
    }
  }
  
  .action-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #303133;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .action-desc {
    font-size: 28rpx;
    color: #909399;
  }
}
</style>
