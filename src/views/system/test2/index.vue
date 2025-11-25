<template>
  <div class="test-page">
    <h1>会话与场景测试</h1>
    <div style="margin-bottom: 20px;">
      <button v-for="btn in buttons" :key="btn.label" @click="btn.action" style="margin-right: 10px;">
        {{ btn.label }}
      </button>
    </div>
    <div v-if="showSessionInput" style="margin-bottom: 20px;">
      <label>请输入 sessionId：</label>
      <input v-model="sessionForm.sessionId" placeholder="6d966f22-2f9e-43ac-860d-7bdd90012fa0" />
      <button @click="confirmSession">确定</button>
    </div>
    <div v-if="showDeleteInput" style="margin-bottom: 20px;">
      <label>请输入 sessionId：</label>
      <input v-model="deleteForm.sessionId" placeholder="6d966f22-2f9e-43ac-860d-7bdd90012fa0" />
      <button @click="confirmDelete">确定</button>
    </div>
    <div v-if="showUserIdInput" style="margin-bottom: 20px;">
      <label>请输入 user_id：</label>
      <input v-model="userIdForm.user_id" placeholder="user_123" />
      <button @click="confirmUserId">确定</button>
    </div>
    <div v-if="showDialogueInput" style="margin-bottom: 20px;">
      <label>session_id：</label>
      <input v-model="dialogueForm.session_id" placeholder="6d966f22-2f9e-43ac-860d-7bdd90012fa0" />
      <label style="margin-left:10px;">user_id：</label>
      <input v-model="dialogueForm.user_id" placeholder="user_123" />
      <label style="margin-left:10px;">消息内容：</label>
      <input v-model="dialogueForm.user_message[0].text" placeholder="Hello, how are you?" />
      <button @click="confirmDialogue">确定</button>
    </div>
    <div v-if="apiResult">
      <h3>请求成功：</h3>
      <pre>{{ apiResult }}</pre>
    </div>
    <div v-if="apiError">
      <h3 style="color:red">请求失败：</h3>
      <pre>{{ apiError }}</pre>
    </div>
  </div>
</template>

<script>
// 引入封装的API方法
import {
  getSessionHistoryBySessionId,
  getAllSupportedScenarioPrompts,
  clearSessionHistoryAndAudioFiles,
  newSessionId,
  submitDialogueAndGetReply
} from '@/api/system/test2'

export default {
  name: 'TestSessionAndScenario',
  data() {
    return {
      buttons: [],
      showSessionInput: false,
      showDeleteInput: false,
      showUserIdInput: false,
      showDialogueInput: false,
      sessionForm: {
        sessionId: '6d966f22-2f9e-43ac-860d-7bdd90012fa0'
      },
      deleteForm: {
        sessionId: '6d966f22-2f9e-43ac-860d-7bdd90012fa0'
      },
      userIdForm: {
        user_id: 'user_123'
      },
      dialogueForm: {
        session_id: '6d966f22-2f9e-43ac-860d-7bdd90012fa0',
        user_id: 'user_123',
        user_message: [
          { type: 'text', text: 'Hello, how are you?' }
        ],
        use_audio_output: true,
        max_history: 10,
        prompt_id: 'default',
        speaker_gender: 'male'
      },
      apiResult: null,
      apiError: null
    }
  },
  methods: {
    // 获取指定会话的历史记录，可限制返回轮数
    requestSessionHistory() {
      this.showSessionInput = true;
      this.showDeleteInput = false;
      this.showUserIdInput = false;
      this.showDialogueInput = false;
      this.apiResult = null;
      this.apiError = null;
    },
    confirmSession() {
      getSessionHistoryBySessionId(this.sessionForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.showSessionInput = false;
    },
    // 获取所有支持的场景提示词
    requestAllPrompts() {
      this.showSessionInput = false;
      this.showDeleteInput = false;
      this.showUserIdInput = false;
      this.showDialogueInput = false;
      this.apiResult = null;
      this.apiError = null;
      getAllSupportedScenarioPrompts()
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
    },
    // 清除指定会话的历史记录与生成的音频文件
    requestDeleteSession() {
      this.showDeleteInput = true;
      this.showSessionInput = false;
      this.showUserIdInput = false;
      this.showDialogueInput = false;
      this.apiResult = null;
      this.apiError = null;
    },
    confirmDelete() {
      clearSessionHistoryAndAudioFiles(this.deleteForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.showDeleteInput = false;
    },
    // 创建新的会话，返回唯一的 session_id
    requestNewSession() {
      this.showUserIdInput = true;
      this.showSessionInput = false;
      this.showDeleteInput = false;
      this.showDialogueInput = false;
      this.apiResult = null;
      this.apiError = null;
    },
    confirmUserId() {
      newSessionId(this.userIdForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.showUserIdInput = false;
    },
    // 提交文本或音频对话内容，获得 AI 的文本回复，并可选返回语音路径
    requestDialogue() {
      this.showDialogueInput = true;
      this.showSessionInput = false;
      this.showDeleteInput = false;
      this.showUserIdInput = false;
      this.apiResult = null;
      this.apiError = null;
    },
    confirmDialogue() {
      submitDialogueAndGetReply(this.dialogueForm)
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
        });
      this.showDialogueInput = false;
    }
  },
  created() {
    this.buttons = [
      { label: '获取指定会话的历史记录，可限制返回轮数', action: this.requestSessionHistory },
      { label: '获取所有支持的场景提示词', action: this.requestAllPrompts },
      { label: '清除指定会话的历史记录与生成的音频文件', action: this.requestDeleteSession },
      { label: '创建新的会话，返回唯一的 session_id', action: this.requestNewSession },
      { label: '提交文本或音频对话内容，获得 AI 的文本回复，并可选返回语音路径', action: this.requestDialogue }
    ];
  }
}
</script>

<style scoped>
.test-page {
  padding: 40px;
  text-align: center;
}
</style>
