<template>
  <div class="chat-container">
    <div class="messages">
      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.type]">
        <div class="sender">{{ msg.sender }}</div>
        <div class="content" v-html="formatContent(msg.content)"></div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="dot-pulse"></div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="输入问题并按回车发送..."
        :disabled="isLoading"
        ref="inputRef"
      />
      <button @click="sendMessage" :disabled="isLoading">
        {{ isLoading ? '思考中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      userInput: '',
      isLoading: false,
      controller: null,
      incompleteLine: '',
      errorCount: 0
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      // 聚焦输入框
      this.$nextTick(() => {
        this.inputRef.focus();
      });

      // 添加用户消息
      this.messages.push({
        type: 'user',
        sender: '你',
        content: this.userInput.trim()
      });

      // 准备请求数据
      const requestData = {
        inputs: {},
        query: this.userInput.trim(),
        response_mode: 'streaming',
        conversation_id: '',
        user: 'test-user-123',
        files: []
      };

      // 清空输入框并设置加载状态
      this.userInput = '';
      this.isLoading = true;
      this.errorCount = 0;

      // 添加AI回复占位
      const aiMessageIndex = this.messages.length;
      this.messages.push({
        type: 'ai',
        sender: 'AI',
        content: ''
      });

      try {
        this.controller = new AbortController();

        // 发送请求
        const response = await fetch('http://localhost:8080/system/dify/sendChatMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData),
          signal: this.controller.signal
        });

        // 检查响应状态
        if (!response.ok) {
          throw new Error(`HTTP错误：${response.status}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          this.handleStreamChunk(chunk, aiMessageIndex);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.messages.push({
            type: 'error',
            sender: '系统',
            content: `请求失败: ${error.message}`
          });
          console.error('请求错误:', error);
        }
      } finally {
        this.isLoading = false;
        this.controller = null;
        this.incompleteLine = '';
      }
    },

    handleStreamChunk(chunk, aiMessageIndex) {
      let combinedData = this.incompleteLine + chunk;
      this.incompleteLine = '';

      const lines = combinedData.split('\n');
      if (!combinedData.endsWith('\n') && lines.length > 0) {
        this.incompleteLine = lines.pop();
      }

      lines.forEach(line => {
        if (!line.trim()) return;

        try {
          // 只移除一次data:前缀（后端已处理过）
          let dataLine = line.startsWith('data: ')
            ? line.substring(6)
            : line;

          const data = JSON.parse(dataLine);
          if (data.answer) {
            this.messages[aiMessageIndex].content += data.answer;
          }
        } catch (e) {
          console.error('解析错误:', e, '原始数据:', line);
          if (this.errorCount <= 3) {
            this.messages[aiMessageIndex].content += `<span class="error-highlight">[解析错误]</span>`;
            this.errorCount++;
          }
        }
      });
    },

    // 取消请求
    abortRequest() {
      if (this.controller) {
        this.controller.abort();
        this.isLoading = false;
      }
    },

    // 格式化内容（支持HTML）
    formatContent(content) {
      // 简单的HTML转义（防止XSS）
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    }
  },
  beforeDestroy() {
    // 组件销毁时取消请求
    this.abortRequest();
  }
};
</script>



<style scoped>
.chat-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.messages {
  height: 500px;
  overflow-y: auto;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.message {
  margin-bottom: 15px;
  padding: 12px 16px;
  border-radius: 10px;
  max-width: 85%;
  word-wrap: break-word;
  animation: fadeIn 0.3s ease-in-out;
}

.message.user {
  margin-left: auto;
  background-color: #e0f2fe;
  color: #0369a1;
}

.message.ai {
  margin-right: auto;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
}

.message.error {
  margin: 0 auto;
  background-color: #fee2e2;
  color: #b91c1c;
  font-size: 14px;
}

.sender {
  font-size: 12px;
  margin-bottom: 6px;
  color: #64748b;
  font-weight: 500;
}

.content {
  font-size: 16px;
  line-height: 1.6;
}

.error-highlight {
  color: #ef4444;
  font-weight: bold;
  background-color: #fef2f2;
  padding: 0 3px;
  border-radius: 3px;
}

.input-area {
  display: flex;
  gap: 12px;
}

input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

button {
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

button:not(:disabled):active {
  transform: translateY(0);
  box-shadow: none;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.dot-pulse {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #999;
  color: #999;
  animation: dotPulse 1.5s infinite linear;
  animation-delay: 0.25s;
}

.dot-pulse::before, .dot-pulse::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #999;
  color: #999;
}

.dot-pulse::before {
  left: -15px;
  animation: dotPulse 1.5s infinite linear;
  animation-delay: 0s;
}

.dot-pulse::after {
  left: 15px;
  animation: dotPulse 1.5s infinite linear;
  animation-delay: 0.5s;
}

@keyframes dotPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
