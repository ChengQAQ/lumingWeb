# 麓鸣管理系统 - UniApp平板端

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
# H5版本（推荐用于开发调试）
npm run dev:h5

# 微信小程序版本
npm run dev:mp-weixin

# App版本（需要HBuilderX）
npm run dev:app
```

### 3. 使用HBuilderX进行真机调试
1. 使用HBuilderX打开`uniapp`目录
2. 连接平板设备
3. 点击"运行到手机或模拟器"

## 📱 已实现功能

### ✅ 登录界面
- 现代化的UI设计，适配平板端
- 用户名/密码输入验证
- 验证码支持
- 记住密码功能
- 登录状态管理

### ✅ 基础架构
- Vue 3 + UniApp 3.x
- Pinia状态管理
- uView UI组件库
- 请求拦截器和响应拦截器
- 用户认证和权限管理

## 🎨 界面特性

### 登录页面
- 渐变背景和毛玻璃效果
- 响应式设计，适配不同屏幕尺寸
- 流畅的动画和交互效果
- 错误提示和加载状态

### 平板端优化
- 大尺寸触摸友好的按钮
- 优化的输入框和表单布局
- 适合横屏和竖屏显示

## 🔧 技术栈

- **框架**: UniApp 3.x + Vue 3
- **状态管理**: Pinia
- **UI组件**: uView UI 2.0
- **构建工具**: Vite
- **样式**: SCSS

## 📁 项目结构

```
uniapp/
├── src/
│   ├── pages/           # 页面文件
│   │   ├── login/       # 登录页面
│   │   ├── index/       # 首页
│   │   └── search/      # 搜索页面
│   ├── api/             # API接口
│   │   └── auth.js      # 认证相关API
│   ├── store/           # 状态管理
│   │   └── user.js      # 用户状态
│   ├── utils/           # 工具函数
│   │   └── request.js   # 请求工具
│   └── styles/          # 样式文件
├── static/              # 静态资源
└── pages.json          # 页面配置
```

## 🌐 API配置

在`src/utils/request.js`中配置后端API地址：

```javascript
const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080'  // 开发环境
  : 'https://your-production-domain.com'  // 生产环境
```

## 📱 打包发布

### H5版本
```bash
npm run build:h5
```

### 微信小程序
```bash
npm run build:mp-weixin
```

### App版本
使用HBuilderX进行打包：
1. 打开项目
2. 点击"发行"
3. 选择"原生App-云打包"

## 🔍 调试技巧

1. **H5调试**: 使用浏览器开发者工具
2. **真机调试**: 使用HBuilderX的真机运行功能
3. **网络调试**: 检查API请求和响应
4. **样式调试**: 使用浏览器元素检查器

## 🐛 常见问题

### 1. 登录失败
- 检查后端API是否正常运行
- 确认API地址配置是否正确
- 检查网络连接

### 2. 样式不显示
- 确认SCSS文件是否正确编译
- 检查样式路径是否正确

### 3. 真机调试问题
- 确认设备已正确连接
- 检查HBuilderX版本是否最新
- 尝试重启HBuilderX和设备

## 📞 技术支持

如有问题，请查看：
1. UniApp官方文档
2. uView UI文档
3. 项目代码注释

---

**开发团队**: 麓鸣教育科技
**版本**: v1.0.0
**更新时间**: 2024年 