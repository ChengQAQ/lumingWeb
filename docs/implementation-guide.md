# UniApp平板端迁移实施指南

## 🚀 快速开始

### 1. 项目结构重组

```bash
# 创建新的项目结构
mkdir -p uniapp shared docs
mv src web/src
mv public web/public
mv package.json web/package.json
mv vue.config.js web/vue.config.js
```

### 2. 初始化UniApp项目

```bash
# 进入uniapp目录
cd uniapp

# 使用Vue CLI创建UniApp项目
npx degit dcloudio/uni-preset-vue#vite .

# 安装依赖
npm install

# 安装UI组件库
npm install uview-ui@2.0.31 pinia @dcloudio/uni-ui
```

### 3. 配置UniApp项目

#### pages.json 配置
```json
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
```

#### vite.config.js 配置
```javascript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/shared': resolve(__dirname, '../shared')
    }
  }
})
```

### 4. 核心页面开发

#### 搜索页面 (src/pages/search/index.vue)
```vue
<template>
  <view class="search-container">
    <!-- 搜索输入框 -->
    <view class="search-header">
      <u-search
        v-model="keywordQuery"
        placeholder="请输入题目关键词..."
        @search="handleSearch"
      ></u-search>
      
      <!-- 搜索选项 -->
      <view class="search-options">
        <u-select v-model="subjectType" :list="subjectOptions"></u-select>
        <u-select v-model="questionType" :list="questionTypeOptions"></u-select>
        <u-slider v-model="difficultyRange" range></u-slider>
      </view>
    </view>
    
    <!-- 搜索结果 -->
    <view class="search-results">
      <view 
        class="result-item"
        v-for="item in searchResults"
        :key="item.id"
        @click="viewDetail(item)"
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
import { searchProblems } from '@/api/problems'

const keywordQuery = ref('')
const subjectType = ref('')
const questionType = ref('')
const difficultyRange = ref([0, 1])
const searchResults = ref([])

const handleSearch = async () => {
  try {
    const params = {
      conditions: {
        keywords: keywordQuery.value,
        subject_names: subjectType.value ? [subjectType.value] : [],
        cates: questionType.value ? [questionType.value] : [],
        min_degree: difficultyRange.value[0],
        max_degree: difficultyRange.value[1]
      },
      pagination: { page: 1, per_page: 20 }
    }
    
    const response = await searchProblems(params)
    searchResults.value = response.questions || []
  } catch (error) {
    uni.showToast({ title: '搜索失败', icon: 'error' })
  }
}

const viewDetail = (item: any) => {
  uni.navigateTo({
    url: `/pages/problems/detail?id=${item.id}`
  })
}
</script>

<style lang="scss" scoped>
.search-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.search-header {
  background: white;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.search-results {
  padding: 0 40rpx;
}

.result-item {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 平板适配 */
@media screen and (min-width: 768px) {
  .search-container {
    display: grid;
    grid-template-columns: 400rpx 1fr;
    gap: 40rpx;
    padding: 40rpx;
  }
}
</style>
```

### 5. API接口共享

#### shared/api/problems.ts
```typescript
export interface SearchParams {
  conditions: {
    keywords: string
    subject_names: string[]
    cates: string[]
    min_degree: number
    max_degree: number
  }
  pagination: {
    page: number
    per_page: number
  }
}

export const searchProblems = (params: SearchParams) => {
  return uni.request({
    url: '/system/teacher/questionsSearch',
    method: 'POST',
    data: params
  })
}
```

### 6. 状态管理

#### src/store/problems.ts
```typescript
import { defineStore } from 'pinia'

export const useProblemsStore = defineStore('problems', {
  state: () => ({
    searchResults: [],
    totalCount: 0,
    loading: false
  }),
  
  actions: {
    setSearchResults(results: any[], total: number) {
      this.searchResults = results
      this.totalCount = total
    }
  }
})
```

### 7. 平板端优化

#### 触屏优化
```scss
/* 增大点击区域 */
.touch-target {
  min-height: 88rpx;
  min-width: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 横屏适配 */
@media screen and (orientation: landscape) {
  .search-container {
    display: grid;
    grid-template-columns: 300rpx 1fr;
    gap: 40rpx;
  }
}
```

#### 手势操作
```typescript
// src/utils/gestures.ts
export class GestureHandler {
  // 滑动切换题目
  handleSwipe(direction: 'left' | 'right') {
    // 实现滑动逻辑
  }
  
  // 双指缩放
  handlePinch(scale: number) {
    // 实现缩放逻辑
  }
}
```

### 8. 离线功能

#### 缓存管理
```typescript
// src/utils/cache.ts
export class OfflineCache {
  // 本地存储搜索历史
  saveSearchHistory(keyword: string) {
    const history = uni.getStorageSync('searchHistory') || []
    history.unshift(keyword)
    uni.setStorageSync('searchHistory', history.slice(0, 10))
  }
  
  // 离线题目数据
  saveOfflineQuestions(questions: any[]) {
    uni.setStorageSync('offlineQuestions', questions)
  }
}
```

### 9. 性能优化

#### 代码分割
```json
// pages.json
{
  "subPackages": [
    {
      "root": "pages/problems",
      "pages": ["list", "detail", "upload", "edit"]
    }
  ]
}
```

#### 图片优化
```typescript
// src/utils/image.ts
export const optimizeImage = (url: string) => {
  // 图片压缩和懒加载
  return url + '?compress=true'
}
```

### 10. 测试和部署

#### 开发测试
```bash
# 启动开发服务器
npm run dev:app

# 构建生产版本
npm run build:app
```

#### 真机测试
```bash
# Android
npm run dev:app-android

# iOS
npm run dev:app-ios
```

## 📱 核心功能清单

### ✅ 已完成
- [x] 项目结构搭建
- [x] 基础页面框架
- [x] 搜索功能
- [x] API接口集成
- [x] 状态管理

### 🔄 进行中
- [ ] 题目详情页面
- [ ] 题目上传功能
- [ ] 组卷功能
- [ ] 用户认证

### 📋 待开发
- [ ] 拍照搜题
- [ ] 手写识别
- [ ] 离线缓存
- [ ] 性能优化

## 🎯 成功指标

### 技术指标
- 应用启动时间 < 3秒
- 页面切换时间 < 500ms
- 内存占用 < 200MB

### 用户体验指标
- 用户满意度 > 4.5/5
- 功能完成率 > 95%
- 错误率 < 1%

## 📞 技术支持

如有问题，请参考：
1. [UniApp官方文档](https://uniapp.dcloud.net.cn/)
2. [uView UI文档](https://www.uviewui.com/)
3. 项目内部文档 