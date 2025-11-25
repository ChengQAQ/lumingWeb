<template>
  <view class="search-container">
    <view class="search-header">
      <view class="search-input-wrapper">
        <input
          v-model="keywordQuery"
          class="search-input"
          type="text"
          placeholder="请输入题目关键词..."
          @confirm="handleSearch"
        />
        <button class="search-button" @click="handleSearch">搜索</button>
      </view>
    </view>
    
    <view class="search-results">
      <view 
        class="result-item"
        v-for="item in searchResults"
        :key="item.id"
      >
        <view class="result-header">
          <text class="tag primary">{{ item.qtype }}</text>
          <text class="tag warning">难度: {{ item.degree }}</text>
        </view>
        <view class="result-content">
          <text class="question-text">{{ item.question }}</text>
        </view>
      </view>
      
      <view v-if="searchResults.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">暂无搜索结果</text>
        <text class="empty-desc">请输入关键词开始搜索</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Search',
  data() {
    return {
      keywordQuery: '',
      searchResults: []
    }
  },
  methods: {
    handleSearch() {
      if (!this.keywordQuery.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }
      
      uni.showToast({
        title: '搜索功能开发中...',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40rpx;
}

.search-header {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
  display: flex;
  gap: 20rpx;
  
  .search-input {
    flex: 1;
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
  
  .search-button {
    width: 160rpx;
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

.search-results {
  .result-item {
    background: white;
    border-radius: 16rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .result-header {
      display: flex;
      gap: 20rpx;
      margin-bottom: 20rpx;
      
      .tag {
        padding: 8rpx 16rpx;
        border-radius: 8rpx;
        font-size: 24rpx;
        font-weight: 600;
        
        &.primary {
          background: #e6f7ff;
          color: #1890ff;
        }
        
        &.warning {
          background: #fff7e6;
          color: #fa8c16;
        }
      }
    }
    
    .question-text {
      font-size: 32rpx;
      line-height: 1.6;
      color: #303133;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 120rpx 40rpx;
    
    .empty-icon {
      font-size: 120rpx;
      display: block;
      margin-bottom: 40rpx;
    }
    
    .empty-text {
      font-size: 36rpx;
      color: #606266;
      display: block;
      margin-bottom: 16rpx;
    }
    
    .empty-desc {
      font-size: 28rpx;
      color: #909399;
    }
  }
}
</style>
