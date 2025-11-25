# 菜单配置说明

## 概述
本配置文件用于控制前端菜单的显示和隐藏，支持根据环境动态配置。

## 文件结构
- `menu.js` - 菜单隐藏配置
- `env.js` - 环境配置
- `README.md` - 说明文档

## 使用方法

### 1. 隐藏特定菜单项
在 `src/config/menu.js` 中修改 `hiddenMenus` 数组：

```javascript
hiddenMenus: [
  '测试',
  '系统监控', 
  '树',
  '系统管理',
  '系统工具'
]
```

### 2. 隐藏特定路径的菜单
在 `src/config/menu.js` 中修改 `hiddenPaths` 数组：

```javascript
hiddenPaths: [
  '/monitor',
  '/tool',
  '/system'
]
```

### 3. 根据环境控制菜单显示
在 `src/config/env.js` 中配置不同环境的菜单显示：

```javascript
development: {
  showTestMenu: true,      // 开发环境显示测试菜单
  showMonitorMenu: true,   // 开发环境显示监控菜单
  showSystemMenu: true,    // 开发环境显示系统菜单
  showToolMenu: true       // 开发环境显示工具菜单
},
production: {
  showTestMenu: false,     // 生产环境隐藏测试菜单
  showMonitorMenu: false,  // 生产环境隐藏监控菜单
  showSystemMenu: false,   // 生产环境隐藏系统菜单
  showToolMenu: false      // 生产环境隐藏工具菜单
}
```

### 4. 启用/禁用菜单隐藏功能
在 `src/config/menu.js` 中设置：

```javascript
enableMenuHide: true  // true: 启用, false: 禁用
```

## 注意事项

1. 修改配置后需要重新启动项目或刷新页面
2. 菜单隐藏是基于菜单标题的模糊匹配
3. 路径隐藏是基于路径前缀的精确匹配
4. 环境配置会自动根据 `NODE_ENV` 变量选择对应配置

## 常见问题

### Q: 为什么修改配置后菜单没有隐藏？
A: 请检查：
- 配置是否正确保存
- 是否重新启动了项目
- 浏览器缓存是否已清除

### Q: 如何临时禁用菜单隐藏功能？
A: 将 `enableMenuHide` 设置为 `false`

### Q: 如何添加新的隐藏菜单项？
A: 在 `hiddenMenus` 数组中添加菜单标题关键词 