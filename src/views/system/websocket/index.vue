<template>
  <div class="websocket-container">
    <!-- 连接状态指示器 -->
    <div class="connection-status">
      <el-tag 
        :type="connectionStatus === 'connected' ? 'success' : connectionStatus === 'connecting' ? 'warning' : 'danger'"
        size="small"
      >
        {{ getStatusText() }}
      </el-tag>
    </div>

    <!-- 消息通知组件 -->
    <el-badge :value="unreadCount" class="notification-badge" :hidden="unreadCount === 0">
      <el-button 
        type="primary" 
        icon="el-icon-bell" 
        @click="showMessageList"
        :disabled="connectionStatus !== 'connected'"
      >
        消息通知
      </el-button>
    </el-badge>

    <!-- 消息列表抽屉 -->
    <el-drawer
      title="消息列表"
      :visible.sync="drawerVisible"
      direction="rtl"
      size="400px"
    >
      <div class="message-list">
        <div v-if="messages.length === 0" class="no-messages">
          暂无消息
        </div>
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message-item"
          :class="{ unread: !message.read }"
        >
          <div class="message-header">
            <span class="message-type">{{ getMessageTypeText(message.type) }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">{{ message.message }}</div>
        </div>
      </div>
    </el-drawer>

    <!-- 测试按钮（开发环境） -->
    <div v-if="isDevelopment" class="test-buttons">
      <el-button size="small" @click="testConnection">测试连接</el-button>
      <el-button size="small" @click="debugUserInfo">调试用户信息</el-button>
      <el-button size="small" @click="clearMessages">清空消息</el-button>
    </div>
  </div>
</template>

<script>
import WebSocketService from '@/utils/WebSocketService';
import Vue from 'vue';

export default {
  name: 'WebSocketNotification',
  data() {
    return {
      // WebSocket服务实例
      webSocketService: null,
      // 未读消息数量
      unreadCount: 0,
      // 连接状态：connecting, connected, disconnected, error
      connectionStatus: 'disconnected',
      // 消息列表
      messages: [],
      // 抽屉显示状态
      drawerVisible: false,
      // 是否为开发环境
      isDevelopment: process.env.NODE_ENV === 'development'
    }
  },
  
  created() {
    // 初始化全局事件总线
    this.initEventBus();
    
    // 注册事件监听器
    this.registerEventListeners();
    
    // 延迟初始化WebSocket，确保用户信息已加载
    this.$nextTick(() => {
      this.initWebSocketWithRetry();
    });
  },
  
  beforeDestroy() {
    // 组件销毁前清理资源
    this.cleanup();
  },
  
  methods: {
    /**
     * 带重试机制的WebSocket初始化
     */
    initWebSocketWithRetry() {
      const maxRetries = 5;
      let retryCount = 0;
      
      const tryInit = () => {
        const userId = this.getUserId();
        
        if (userId) {
          this.initWebSocket();
          return;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(tryInit, 1000 * retryCount);
        } else {
          console.error('用户ID获取失败');
          this.connectionStatus = 'error';
          this.$message.error('用户信息获取失败，请重新登录');
        }
      };
      
      tryInit();
    },

    /**
     * 初始化WebSocket连接
     */
    initWebSocket() {
      try {
        // 从Vuex或本地存储获取用户ID
        const userId = this.getUserId();
        
        if (!userId) {
          console.error('无法获取用户ID，无法建立WebSocket连接');
          this.connectionStatus = 'error';
          this.$message.error('用户信息获取失败，无法建立消息连接');
          return;
        }

        // 创建WebSocket服务实例
        this.webSocketService = new WebSocketService();
        
        // 设置连接状态为连接中
        this.connectionStatus = 'connecting';
        
        // 初始化WebSocket连接
        this.webSocketService.initWebSocket(userId);
        
      } catch (error) {
        console.error('WebSocket初始化失败:', error);
        this.connectionStatus = 'error';
        this.$message.error('消息连接初始化失败');
      }
    },

    /**
     * 获取用户ID
     * @returns {string|null} 用户ID
     */
    getUserId() {
      // 优先从Vuex获取用户ID
      if (this.$store && this.$store.getters.id) {
        return this.$store.getters.id;
      }
      
      // 从Vuex state直接获取
      if (this.$store && this.$store.state.user && this.$store.state.user.id) {
        return this.$store.state.user.id;
      }
      
      // 从本地存储获取
      const userId = localStorage.getItem('userId');
      if (userId) {
        return userId;
      }
      
      // 从sessionStorage获取
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        return sessionUserId;
      }
      
      return null;
    },

    /**
     * 初始化全局事件总线
     */
    initEventBus() {
      if (!window.eventBus) {
        // 使用导入的Vue创建事件总线
        window.eventBus = new Vue();
      }
    },

    /**
     * 注册事件监听器
     */
    registerEventListeners() {
      if (!window.eventBus) {
        console.error('事件总线未初始化');
        return;
      }

      // 监听连接成功事件
      window.eventBus.$on('connected', this.handleConnected);
      
      // 监听个人通知事件
      window.eventBus.$on('personal-notification', this.handlePersonalNotification);
      
      // 监听邮箱通知事件
      window.eventBus.$on('mailbox-notification', this.handleMailboxNotification);
      
      // 监听广播消息事件
      window.eventBus.$on('broadcast-message', this.handleBroadcastMessage);
      
      // 监听重连失败事件
      window.eventBus.$on('reconnect-failed', this.handleReconnectFailed);
      
      // 监听连接错误事件
      window.eventBus.$on('connection-error', this.handleConnectionError);
    },

    /**
     * 处理连接成功事件
     * @param {Object} data - 连接数据
     */
    handleConnected(data) {
      console.log('WebSocket连接成功:', data);
      this.connectionStatus = 'connected';
      this.$message.success('消息连接已建立');
    },

    /**
     * 处理个人通知事件
     * @param {Object} data - 通知数据
     */
    handlePersonalNotification(data) {
      console.log('收到个人通知:', data);
      this.addMessage(data);
      this.updateUnreadCount();
      this.showNotification(data);
    },

    /**
     * 处理邮箱通知事件
     * @param {Object} data - 邮箱通知数据
     */
    handleMailboxNotification(data) {
      console.log('收到邮箱通知:', data);
      this.addMessage(data);
      this.updateUnreadCount();
      this.showNotification(data);
    },

    /**
     * 处理广播消息事件
     * @param {Object} data - 广播消息数据
     */
    handleBroadcastMessage(data) {
      console.log('收到广播消息:', data);
      this.addMessage(data);
      this.updateUnreadCount();
      this.showNotification(data);
    },

    /**
     * 处理重连失败事件
     * @param {Object} data - 重连失败数据
     */
    handleReconnectFailed(data) {
      console.log('WebSocket重连失败:', data);
      this.connectionStatus = 'error';
      this.$message.error('消息连接失败，请刷新页面重试');
    },

    /**
     * 处理连接错误事件
     * @param {Object} error - 连接错误
     */
    handleConnectionError(error) {
      console.log('WebSocket连接错误:', error);
      this.connectionStatus = 'error';
      this.$message.error(`连接错误: ${error.message || '未知错误'}`);
    },

    /**
     * 添加消息到列表
     * @param {Object} messageData - 消息数据
     */
    addMessage(messageData) {
      const message = {
        id: Date.now() + Math.random(),
        type: messageData.type || 'unknown',
        message: messageData.message || '未知消息',
        timestamp: messageData.timestamp || Date.now(),
        read: false
      };
      
      // 将新消息添加到列表开头
      this.messages.unshift(message);
      
      // 限制消息列表长度，最多保留50条
      if (this.messages.length > 50) {
        this.messages = this.messages.slice(0, 50);
      }
    },

    /**
     * 更新未读消息数量
     */
    updateUnreadCount() {
      this.unreadCount = this.messages.filter(msg => !msg.read).length;
    },

    /**
     * 显示通知
     * @param {Object} data - 通知数据
     */
    showNotification(data) {
      this.$notify({
        title: this.getMessageTypeText(data.type),
        message: data.message,
        type: 'info',
        duration: 5000,
        position: 'top-right'
      });
    },

    /**
     * 显示消息列表
     */
    showMessageList() {
      this.drawerVisible = true;
      // 标记所有消息为已读
      this.messages.forEach(msg => msg.read = true);
      this.updateUnreadCount();
    },

    /**
     * 获取连接状态文本
     * @returns {string} 状态文本
     */
    getStatusText() {
      const statusMap = {
        'connecting': '连接中...',
        'connected': '已连接',
        'disconnected': '未连接',
        'error': '连接错误'
      };
      return statusMap[this.connectionStatus] || '未知状态';
    },

    /**
     * 获取消息类型文本
     * @param {string} type - 消息类型
     * @returns {string} 类型文本
     */
    getMessageTypeText(type) {
      const typeMap = {
        'new_mailbox': '新邮件',
        'new_message': '新消息',
        'broadcast': '广播消息'
      };
      return typeMap[type] || '系统消息';
    },

    /**
     * 格式化时间
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化后的时间
     */
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // 小于1分钟
      if (diff < 60000) {
        return '刚刚';
      }
      
      // 小于1小时
      if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
      }
      
      // 小于24小时
      if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
      }
      
      // 超过24小时
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    /**
     * 测试连接（开发环境）
     */
    testConnection() {
      if (this.webSocketService && this.webSocketService.getConnectionStatus()) {
        this.$message.success('WebSocket连接正常');
      } else {
        this.$message.error('WebSocket连接异常');
      }
    },

    /**
     * 调试用户信息（开发环境）
     */
    debugUserInfo() {
      console.log('=== 用户信息调试 ===');
      console.log('Vuex store:', this.$store);
      console.log('Vuex state.user:', this.$store ? this.$store.state.user : 'store不存在');
      console.log('Vuex getters.id:', this.$store ? this.$store.getters.id : 'getters不存在');
      console.log('localStorage userId:', localStorage.getItem('userId'));
      console.log('sessionStorage userId:', sessionStorage.getItem('userId'));
      console.log('当前获取的用户ID:', this.getUserId());
      console.log('==================');
      
      this.$message.info('用户信息已输出到控制台');
    },

    /**
     * 清空消息（开发环境）
     */
    clearMessages() {
      this.messages = [];
      this.unreadCount = 0;
      this.$message.success('消息已清空');
    },



    /**
     * 清理资源
     */
    cleanup() {
      // 关闭WebSocket连接
      if (this.webSocketService) {
        this.webSocketService.close();
        this.webSocketService = null;
      }

      // 移除事件监听器
      if (window.eventBus) {
        window.eventBus.$off('connected', this.handleConnected);
        window.eventBus.$off('personal-notification', this.handlePersonalNotification);
        window.eventBus.$off('mailbox-notification', this.handleMailboxNotification);
        window.eventBus.$off('broadcast-message', this.handleBroadcastMessage);
        window.eventBus.$off('reconnect-failed', this.handleReconnectFailed);
        window.eventBus.$off('connection-error', this.handleConnectionError);
      }
    }
  }
}
</script>

<style scoped>
.websocket-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.connection-status {
  margin-right: 10px;
}

.notification-badge {
  margin-right: 10px;
}

.test-buttons {
  display: flex;
  gap: 5px;
}

.message-list {
  padding: 10px;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 20px;
}

.message-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  cursor: pointer;
}

.message-item:hover {
  background-color: #f5f5f5;
}

.message-item.unread {
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.message-type {
  font-weight: bold;
  color: #409eff;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-content {
  color: #333;
  line-height: 1.4;
}
</style>
