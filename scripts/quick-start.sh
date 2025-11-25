#!/bin/bash

echo "🚀 RuoYiFrontEnd UniApp平板端快速启动脚本"
echo "=========================================="

# 检查是否已存在uniapp目录
if [ -d "uniapp" ]; then
    echo "⚠️  uniapp目录已存在，是否要重新初始化？(y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🗑️  删除现有uniapp目录..."
        rm -rf uniapp
    else
        echo "❌ 操作已取消"
        exit 1
    fi
fi

# 创建uniapp项目
echo "📱 创建UniApp项目..."
npx degit dcloudio/uni-preset-vue#vite uniapp

# 进入uniapp目录
cd uniapp

# 安装依赖
echo "📦 安装依赖..."
npm install

# 安装UI组件库
echo "🎨 安装UI组件库..."
npm install uview-ui@2.0.31 pinia @dcloudio/uni-ui

# 创建基础目录结构
echo "📁 创建目录结构..."
mkdir -p src/pages/search
mkdir -p src/pages/problems
mkdir -p src/pages/paper
mkdir -p src/components
mkdir -p src/utils
mkdir -p src/api
mkdir -p src/store
mkdir -p src/styles

# 创建基础配置文件
echo "⚙️  创建配置文件..."

# 创建pages.json
cat > pages.json << 'EOF'
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "麓鸣管理系统",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/search/index",
      "style": {
        "navigationBarTitleText": "题目搜索"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages/problems",
      "pages": ["list", "detail", "upload", "edit"]
    },
    {
      "root": "pages/paper",
      "pages": ["create", "edit", "preview", "export"]
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "麓鸣管理系统",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  }
}
EOF

# 创建搜索页面
cat > src/pages/search/index.vue << 'EOF'
<template>
  <view class="search-container">
    <view class="search-header">
      <u-search
        v-model="keywordQuery"
        placeholder="请输入题目关键词..."
        @search="handleSearch"
      ></u-search>
    </view>
    
    <view class="search-results">
      <view 
        class="result-item"
        v-for="item in searchResults"
        :key="item.id"
      >
        <view class="result-header">
          <u-tag :text="item.qtype" type="primary"></u-tag>
          <u-tag :text="`难度: ${item.degree}`" type="warning"></u-tag>
        </view>
        <view class="result-content">
          <text class="question-text">{{ item.question }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keywordQuery = ref('')
const searchResults = ref([])

const handleSearch = () => {
  uni.showToast({
    title: '搜索功能开发中...',
    icon: 'none'
  })
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
    }
    
    .question-text {
      font-size: 32rpx;
      line-height: 1.6;
      color: #303133;
    }
  }
}
</style>
EOF

# 创建首页
cat > src/pages/index/index.vue << 'EOF'
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
          <u-icon :name="action.icon" size="60" color="#409EFF"></u-icon>
        </view>
        <text class="action-title">{{ action.title }}</text>
        <text class="action-desc">{{ action.description }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const quickActions = ref([
  {
    id: 1,
    title: '题目搜索',
    description: '快速搜索题目',
    icon: 'search',
    path: '/pages/search/index'
  },
  {
    id: 2,
    title: '题目管理',
    description: '管理题目库',
    icon: 'list',
    path: '/pages/problems/list'
  },
  {
    id: 3,
    title: '组卷',
    description: '创建试卷',
    icon: 'file-text',
    path: '/pages/paper/create'
  }
])

const navigateTo = (path: string) => {
  uni.navigateTo({
    url: path
  })
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
  
  .action-icon {
    margin-bottom: 32rpx;
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
EOF

# 创建App.vue
cat > src/App.vue << 'EOF'
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<template>
  <view>
    <router-view></router-view>
  </view>
</template>

<style lang="scss">
page {
  min-height: 100%;
  display: flex;
  font-size: 16px;
  line-height: 1.8;
}

@import "uview-ui/index.scss";
</style>
EOF

# 创建main.js
cat > src/main.js << 'EOF'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  
  const pinia = createPinia()
  app.use(pinia)
  
  app.use(uviewPlus)
  
  return {
    app
  }
}
EOF

# 返回根目录
cd ..

echo ""
echo "✅ UniApp项目创建完成！"
echo ""
echo "📋 下一步操作："
echo "1. 进入uniapp目录：cd uniapp"
echo "2. 启动开发服务器：npm run dev:app"
echo "3. 在HBuilderX中打开项目进行真机调试"
echo ""
echo "🎯 项目特性："
echo "- 基于UniApp 3.x + Vue 3"
echo "- 使用uView UI组件库"
echo "- 支持平板端优化"
echo "- 集成Pinia状态管理"
echo ""
echo "📱 已创建页面："
echo "- 首页 (pages/index/index)"
echo "- 搜索页面 (pages/search/index)"
echo ""
echo "🔧 开发工具："
echo "- 推荐使用HBuilderX进行开发"
echo "- 支持真机调试和热更新"
echo "- 可打包为Android/iOS应用" 