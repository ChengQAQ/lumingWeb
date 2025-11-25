# RuoYiFrontEnd UniApp平板端迁移方案

## 🎯 迁移目标
- 保留现有Web端功能完整性
- 开发原生平板端应用
- 实现双端数据同步
- 提供一致的用户体验

## 📁 项目结构

```
RuoYiFrontEnd/
├── web/                    # 现有Web端（保持不变）
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vue.config.js
├── uniapp/                 # 新建UniApp平板端
│   ├── src/
│   │   ├── pages/         # 页面文件
│   │   ├── components/    # 组件
│   │   ├── utils/         # 工具函数
│   │   ├── api/           # API接口
│   │   ├── store/         # 状态管理
│   │   ├── static/        # 静态资源
│   │   └── App.vue
│   ├── pages.json         # 页面配置
│   ├── manifest.json      # 应用配置
│   └── package.json
├── shared/                 # 共享资源
│   ├── api/               # 共享API接口
│   ├── utils/             # 共享工具函数
│   ├── constants/         # 共享常量
│   └── types/             # 类型定义
└── docs/                  # 文档
    ├── migration-guide.md
    └── api-docs.md
```

## 🔧 技术栈选择

### Web端（保持不变）
- Vue 2.6.12
- Element UI 2.15.14
- Vuex 3.6.0
- Axios 1.6.8

### UniApp平板端（新建）
- UniApp 3.x
- Vue 3
- Pinia（状态管理）
- uView UI 2.0（UI组件库）
- TypeScript

## 📱 UniApp端核心功能模块

### 1. 用户认证模块
```typescript
// uniapp/src/pages/login/index.vue
- 登录界面（适配平板横屏）
- 指纹/面容识别登录
- 离线登录缓存
- 自动登录功能
```

### 2. 题目搜索模块
```typescript
// uniapp/src/pages/search/index.vue
- 关键词搜索（优化触屏体验）
- 拍照搜题（调用平板摄像头）
- 手写识别搜题
- 语音搜索
- 离线搜索历史
```

### 3. 题目管理模块
```typescript
// uniapp/src/pages/problems/
├── list.vue          # 题目列表
├── detail.vue        # 题目详情
├── upload.vue        # 题目上传
└── edit.vue          # 题目编辑
```

### 4. 组卷功能模块
```typescript
// uniapp/src/pages/paper/
├── create.vue        # 创建试卷
├── edit.vue          # 编辑试卷
├── preview.vue       # 预览试卷
└── export.vue        # 导出试卷
```

## 🔄 数据同步策略

### 1. API接口共享
```typescript
// shared/api/problems.ts
export interface SearchParams {
  conditions: {
    keywords: string
    subject_names: string[]
    is_chapter_exercise: boolean
    cates: string[]
    min_degree: number
    max_degree: number
    path: string
  }
  pagination: {
    page: number
    per_page: number
  }
}

export const searchProblems = (params: SearchParams) => {
  // 统一的API调用逻辑
}
```

### 2. 状态管理同步
```typescript
// shared/store/problems.ts
export interface ProblemsState {
  searchResults: any[]
  totalCount: number
  currentPage: number
  pageSize: number
  loading: boolean
}

// Web端：Vuex
// UniApp端：Pinia
```

### 3. 离线数据缓存
```typescript
// uniapp/src/utils/cache.ts
export class OfflineCache {
  // 本地存储搜索历史
  // 离线题目数据
  // 用户偏好设置
}
```

## 🎨 UI/UX适配策略

### 1. 响应式设计
```scss
// uniapp/src/styles/responsive.scss
/* 平板横屏适配 */
@media screen and (orientation: landscape) {
  .search-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
  }
}

/* 平板竖屏适配 */
@media screen and (orientation: portrait) {
  .search-container {
    flex-direction: column;
  }
}
```

### 2. 触屏优化
```vue
<!-- uniapp/src/components/SearchInput.vue -->
<template>
  <view class="search-input">
    <!-- 增大点击区域 -->
    <!-- 添加触觉反馈 -->
    <!-- 优化键盘体验 -->
  </view>
</template>
```

### 3. 手势操作
```typescript
// uniapp/src/utils/gestures.ts
export class GestureHandler {
  // 滑动切换题目
  // 双指缩放
  // 长按操作菜单
}
```

## 📦 开发工具配置

### 1. UniApp项目初始化
```bash
# 创建UniApp项目
npx degit dcloudio/uni-preset-vue#vite uniapp

# 安装依赖
cd uniapp
npm install

# 安装UI组件库
npm install uview-ui@2.0.31
npm install pinia
npm install @dcloudio/uni-ui
```

### 2. 构建配置
```javascript
// uniapp/vite.config.js
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': '/src',
      '@/shared': '/../shared'
    }
  }
})
```

### 3. 跨端兼容处理
```typescript
// uniapp/src/utils/platform.ts
export const isTablet = () => {
  // 检测平板设备
  return uni.getSystemInfoSync().platform === 'ios' || 
         uni.getSystemInfoSync().platform === 'android'
}

export const isLandscape = () => {
  // 检测横屏状态
  return uni.getSystemInfoSync().windowWidth > uni.getSystemInfoSync().windowHeight
}
```

## 🚀 迁移实施步骤

### 第一阶段：项目初始化（1-2周）
1. 创建UniApp项目结构
2. 配置开发环境和构建工具
3. 设置共享API接口
4. 建立基础组件库

### 第二阶段：核心功能迁移（3-4周）
1. 用户认证模块
2. 题目搜索功能
3. 题目管理功能
4. 基础UI组件

### 第三阶段：高级功能开发（2-3周）
1. 拍照搜题优化
2. 手写识别功能
3. 离线缓存机制
4. 性能优化

### 第四阶段：测试和优化（1-2周）
1. 功能测试
2. 性能测试
3. 用户体验优化
4. 发布准备

## 📊 性能优化策略

### 1. 代码分割
```typescript
// uniapp/src/pages.json
{
  "pages": [
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
    }
  ]
}
```

### 2. 图片优化
```typescript
// uniapp/src/utils/image.ts
export const optimizeImage = (url: string) => {
  // 图片压缩
  // 懒加载
  // 缓存策略
}
```

### 3. 网络优化
```typescript
// uniapp/src/utils/network.ts
export class NetworkManager {
  // 请求缓存
  // 断网重连
  // 数据预加载
}
```

## 🔐 安全考虑

### 1. 数据加密
```typescript
// uniapp/src/utils/security.ts
export class SecurityManager {
  // 本地数据加密
  // 网络传输加密
  // 用户隐私保护
}
```

### 2. 权限管理
```typescript
// uniapp/src/utils/permission.ts
export class PermissionManager {
  // 摄像头权限
  // 存储权限
  // 网络权限
}
```

## 📈 监控和分析

### 1. 错误监控
```typescript
// uniapp/src/utils/monitor.ts
export class ErrorMonitor {
  // 错误收集
  // 性能监控
  // 用户行为分析
}
```

### 2. 数据统计
```typescript
// uniapp/src/utils/analytics.ts
export class Analytics {
  // 用户活跃度
  // 功能使用率
  // 性能指标
}
```

## 🎯 成功指标

### 技术指标
- 应用启动时间 < 3秒
- 页面切换时间 < 500ms
- 内存占用 < 200MB
- 离线功能可用性 > 90%

### 用户体验指标
- 用户满意度 > 4.5/5
- 功能完成率 > 95%
- 错误率 < 1%
- 用户留存率 > 80%

## 📝 后续维护

### 1. 版本管理
- 统一版本号管理
- 功能特性标记
- 兼容性测试

### 2. 更新策略
- 热更新机制
- 强制更新策略
- 灰度发布

### 3. 用户反馈
- 内置反馈系统
- 用户调研
- 持续优化 