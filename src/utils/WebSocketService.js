import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import { getToken } from '@/utils/auth';

export default class WebSocketService {
  constructor() {
    // WebSocket连接对象
    this.stompClient = null;
    // 用户ID
    this.userId = null;
    // 重连定时器
    this.reconnectTimer = null;
    // 重连尝试次数
    this.reconnectAttempts = 0;
    // 最大重连次数
    this.maxReconnectAttempts = 5; // 增加重连次数
    // 重连间隔时间（毫秒）
    this.reconnectInterval = 30000; // 增加重连间隔到30秒
    // 连接状态
    this.isConnected = false;
    // 消息处理器映射
    this.messageHandlers = new Map();
    // 心跳定时器
    this.heartbeatTimer = null;
    // 心跳间隔（毫秒）
    this.heartbeatInterval = 25000; // 25秒发送一次心跳
  }

  /**
   * 获取认证token
   * @returns {string|null} 认证token
   */
  getAuthToken() {
    // 使用项目统一的token获取方法
    const token = getToken();
    if (token) {
      console.log('获取到认证token:', token.substring(0, 10) + '...');
      return token;
    }

    console.warn('未找到认证token');
    return null;
  }

  /**
   * 初始化WebSocket连接
   * @param {string} userId - 用户ID
   */
  initWebSocket(userId) {
    this.userId = userId;
    console.log('WebSocket初始化，用户ID:', userId);

    try {
      // 构建WebSocket URL - 直接使用后端地址
      const wsUrl = 'http://localhost:8080/ws/message';

      // 创建SockJS连接，禁用credentials避免CORS问题
      const socket = new SockJS(wsUrl, null, {
        withCredentials: false,
        timeout: 30000, // 30秒连接超时
        heartbeat: 25000 // 25秒心跳间隔
      });

      // 创建STOMP客户端
      this.stompClient = Stomp.over(socket);

      // 设置连接参数 - 只发送userId
      const connectHeaders = {};
      
      // 只发送userId，不需要token
      if (userId) {
        connectHeaders['userId'] = userId;
      }

      // 建立STOMP连接
      this.stompClient.connect(
        connectHeaders,
        this.onConnect.bind(this),
        this.onError.bind(this)
      );

    } catch (error) {
      console.error('WebSocket连接创建失败:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * STOMP连接成功回调
   * @param {Object} frame - 连接帧信息
   */
  onConnect(frame) {
    console.log('STOMP连接成功:', frame);
    console.log('连接详情:', {
      sessionId: frame.headers['session-id'],
      server: frame.headers['server'],
      version: frame.headers['version']
    });
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // 订阅个人通知频道
    this.subscribeToPersonalNotifications();

    // 订阅广播频道（可选）
    this.subscribeToBroadcast();

    // 启动心跳
    this.startHeartbeat();

    // 触发连接成功事件
    this.triggerEvent('connected', frame);
  }

  /**
   * STOMP连接错误回调
   * @param {Object} error - 错误信息
   */
  onError(error) {
    console.error('STOMP连接错误:', error);
    this.isConnected = false;
    this.stopHeartbeat();
    this.triggerEvent('connection-error', error);
    this.scheduleReconnect();
  }

  /**
   * 启动心跳检测
   */
  startHeartbeat() {
    this.stopHeartbeat(); // 先停止之前的心跳
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.stompClient) {
        try {
          // 发送心跳消息
          this.stompClient.send('/app/heartbeat', {}, JSON.stringify({
            userId: this.userId,
            timestamp: Date.now()
          }));
          console.log('发送心跳消息');
        } catch (error) {
          console.error('发送心跳失败:', error);
          this.onError(error);
        }
      }
    }, this.heartbeatInterval);
  }

  /**
   * 停止心跳检测
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 订阅个人通知频道
   */
  subscribeToPersonalNotifications() {
    if (!this.stompClient || !this.isConnected) {
      console.error('STOMP客户端未连接，无法订阅通知');
      return;
    }

    // 订阅个人通知频道：/user/{userId}/notification
    const subscription = this.stompClient.subscribe(
      `/user/${this.userId}/notification`,
      this.handlePersonalNotification.bind(this),
      { userId: this.userId }
    );

    console.log('已订阅个人通知频道:', `/user/${this.userId}/notification`);
  }

  /**
   * 订阅广播频道
   */
  subscribeToBroadcast() {
    if (!this.stompClient || !this.isConnected) {
      return;
    }

    // 订阅广播频道：/topic/broadcast
    this.stompClient.subscribe(
      '/topic/broadcast',
      this.handleBroadcastMessage.bind(this)
    );

    console.log('已订阅广播频道: /topic/broadcast');
  }

  /**
   * 处理个人通知消息
   * @param {Object} message - 接收到的消息
   */
  handlePersonalNotification(message) {
    try {
      const data = JSON.parse(message.body);
      console.log('收到个人通知:', data);

      // 根据消息类型进行不同处理
      switch (data.type) {
        case 'new_mailbox':
          this.handleMailboxNotification(data);
          break;
        case 'new_message':
          this.handleGeneralNotification(data);
          break;
        case 'heartbeat':
          console.log('收到心跳响应:', data);
          break;
        default:
          console.log('未知消息类型:', data.type);
      }

      // 触发全局事件
      this.triggerEvent('personal-notification', data);

    } catch (error) {
      console.error('处理个人通知失败:', error);
    }
  }

  /**
   * 处理广播消息
   * @param {Object} message - 接收到的广播消息
   */
  handleBroadcastMessage(message) {
    try {
      const data = JSON.parse(message.body);
      console.log('收到广播消息:', data);

      // 触发广播事件
      this.triggerEvent('broadcast-message', data);

    } catch (error) {
      console.error('处理广播消息失败:', error);
    }
  }

  /**
   * 处理邮箱通知
   * @param {Object} data - 通知数据
   */
  handleMailboxNotification(data) {
    console.log('处理邮箱通知:', data.message);
    // 可以在这里添加特定的邮箱通知处理逻辑
    this.triggerEvent('mailbox-notification', data);
  }

  /**
   * 处理一般通知
   * @param {Object} data - 通知数据
   */
  handleGeneralNotification(data) {
    console.log('处理一般通知:', data.message);
    // 可以在这里添加一般通知的处理逻辑
    this.triggerEvent('general-notification', data);
  }

  /**
   * 安排重连
   */
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      this.reconnectTimer = setTimeout(() => {
        this.initWebSocket(this.userId);
      }, this.reconnectInterval);
    } else {
      console.log('WebSocket重连失败，停止重连');
      this.triggerEvent('reconnect-failed', {
        attempts: this.reconnectAttempts
      });
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {Object} data - 事件数据
   */
  triggerEvent(eventName, data) {
    // 使用Vue的事件总线通知整个应用
    if (window.eventBus) {
      window.eventBus.$emit(eventName, data);
    }

    // 调用注册的消息处理器
    const handlers = this.messageHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('事件处理器执行失败:', error);
        }
      });
    }
  }

  /**
   * 注册事件处理器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 处理器函数
   */
  on(eventName, handler) {
    if (!this.messageHandlers.has(eventName)) {
      this.messageHandlers.set(eventName, []);
    }
    this.messageHandlers.get(eventName).push(handler);
  }

  /**
   * 移除事件处理器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 处理器函数
   */
  off(eventName, handler) {
    const handlers = this.messageHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 发送消息
   * @param {string} destination - 目标地址
   * @param {Object} message - 消息内容
   */
  sendMessage(destination, message) {
    if (this.isConnected && this.stompClient) {
      this.stompClient.send(destination, {}, JSON.stringify(message));
    } else {
      console.error('WebSocket未连接，无法发送消息');
    }
  }

  /**
   * 获取连接状态
   * @returns {boolean} 连接状态
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * 关闭连接
   */
  close() {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.stompClient) {
      this.stompClient.disconnect();
      this.stompClient = null;
    }

    this.isConnected = false;
    console.log('WebSocket连接已关闭');
  }
}
