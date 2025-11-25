// 环境配置
export const envConfig = {
  // 当前环境
  currentEnv: process.env.NODE_ENV || 'development',
  
  // 开发环境配置
  development: {
    showTestMenu: true,
    showMonitorMenu: true,
    showSystemMenu: true,
    showToolMenu: true
  },
  
  // 生产环境配置
  production: {
    showTestMenu: true,        // 测试菜单在生产环境显示
    showMonitorMenu: true,      // 系统监控菜单在生产环境显示
    showSystemMenu: true,       // 系统管理菜单在生产环境显示
    showToolMenu: true          // 系统工具菜单在生产环境显示
  },
  
  // 测试环境配置
  test: {
    showTestMenu: true,        // 测试菜单在测试环境显示
    showMonitorMenu: true,      // 系统监控菜单在测试环境显示
    showSystemMenu: true,       // 系统管理菜单在测试环境显示
    showToolMenu: true          // 系统工具菜单在测试环境显示
  }
}

// 获取当前环境的配置
export function getCurrentEnvConfig() {
  return envConfig[envConfig.currentEnv] || envConfig.development
} 