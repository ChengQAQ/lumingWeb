<template>
  <div class="test-page">
    <h1>文件上传接口测试</h1>
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="showInput('monkeyocr')">monkeyocr</el-button>
      <el-button type="primary" @click="showInput('md2json')">md2json</el-button>
      <el-button type="primary" @click="showInput('ocr2json')">ocr2json</el-button>
      <el-button type="primary" @click="showInput('ocr05')">ocr05自动标注</el-button>
      <el-button type="primary" @click="showInput('ocr04')">上传json文件，执行自动标注</el-button>
    </div>

    <!-- 拖拽上传弹窗 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="30%">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        :accept="acceptType"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">{{ uploadTip }}</div>
      </el-upload>

      <!-- 显示已选择的文件名 -->
      <div v-if="currentFile" style="margin-top: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px; text-align: left;">
        <i class="el-icon-document"></i> 已选择文件：{{ currentFile.name }}
        <el-button
          type="text"
          size="mini"
          style="margin-left: 10px; color: #f56c6c;"
          @click="clearFile"
        >
          移除
        </el-button>
      </div>

      <div v-if="currentType === 'ocr05' || currentType === 'ocr04'" style="margin-top: 20px;">
        <el-input
          v-model="subjectId"
          placeholder="请输入 subject_id"
          style="width: 100%;"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitFile" :disabled="!currentFile || (['ocr05', 'ocr04'].includes(currentType) && !subjectId)">
          确 定
        </el-button>
      </div>
    </el-dialog> <!-- 补充了el-dialog的结束标签 -->

    <!-- 将结果展示区域也包含在根元素内 -->
    <div v-if="apiResult" style="margin-top: 20px;">
      <h3>请求成功：</h3>
      <pre>{{ apiResult }}</pre>
    </div>
    <div v-if="apiError" style="margin-top: 20px;">
      <h3 style="color:red">请求失败：</h3>
      <pre>{{ apiError }}</pre>
    </div>
  </div> <!-- 这是唯一的根元素 -->
</template>

<script>
// 引入封装的API方法
import {
  uploadMonkeyOcr,
  uploadMd2Json,
  uploadOcr2Json,
  uploadOcr05,
  uploadOcr04
} from '@/api/system/test3'

export default {
  name: 'TestOcrUpload',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      currentType: '',
      currentFile: null,
      acceptType: '',
      uploadTip: '',
      subjectId: '',
      apiResult: null,
      apiError: null
    }
  },
  methods: {
    showInput(type) {
      // 保持原有逻辑不变
      this.currentType = type;
      this.currentFile = null;
      this.subjectId = '';

      switch(type) {
        case 'monkeyocr':
          this.dialogTitle = 'monkeyocr 文件上传';
          this.acceptType = '.doc,.docx,.pdf';
          this.uploadTip = '只能上传doc/docx/pdf文件';
          break;
        case 'md2json':
          this.dialogTitle = 'md2json 文件上传';
          this.acceptType = '.md';
          this.uploadTip = '只能上传md文件';
          break;
        case 'ocr2json':
          this.dialogTitle = 'ocr2json 文件上传';
          this.acceptType = '';
          this.uploadTip = '请选择文件';
          break;
        case 'ocr05':
          this.dialogTitle = 'ocr05自动标注 文件上传';
          this.acceptType = '.doc,.docx,.pdf';
          this.uploadTip = '只能上传doc/docx/pdf文件';
          break;
        case 'ocr04':
          this.dialogTitle = '上传json文件，执行自动标注';
          this.acceptType = '.json';
          this.uploadTip = '只能上传json文件';
          break;
      }

      this.dialogVisible = true;
    },
    handleFileChange(file) {
      this.currentFile = file.raw;
    },
    clearFile() {
      this.currentFile = null;
    },
    submitFile() {
      if (!this.currentFile) return;
      if (['ocr05', 'ocr04'].includes(this.currentType) && !this.subjectId) return;

      // 构建FormData（文件上传专用格式）
      const formData = new FormData();
      formData.append('file', this.currentFile); // 添加文件
      // 若需要subject_id，追加到formData
      if (['ocr05', 'ocr04'].includes(this.currentType)) {
        formData.append('subject_id', this.subjectId);
      }

      // 根据当前类型调用对应API
      let requestPromise;
      switch(this.currentType) {
        case 'monkeyocr':
          requestPromise = uploadMonkeyOcr(formData);
          break;
        case 'md2json':
          requestPromise = uploadMd2Json(formData);
          break;
        case 'ocr2json':
          requestPromise = uploadOcr2Json(formData);
          break;
        case 'ocr05':
          requestPromise = uploadOcr05(formData);
          break;
        case 'ocr04':
          requestPromise = uploadOcr04(formData);
          break;
        default:
          return;
      }

      // 执行请求
      requestPromise
        .then(res => {
          this.apiResult = res.data;
          this.apiError = null;
          this.dialogVisible = false;
        })
        .catch(err => {
          this.apiResult = null;
          this.apiError = err.message || '请求失败';
          if (err.response && err.response.data) {
            this.apiError = JSON.stringify(err.response.data, null, 2);
          }
        });

      // 重置表单
      this.currentFile = null;
      this.subjectId = '';
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 40px;
  text-align: center;
}
.upload-demo {
  text-align: center;
}
pre {
  text-align: left;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
