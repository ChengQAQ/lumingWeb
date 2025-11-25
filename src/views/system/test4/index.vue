<template>
  <div class="file-download-container">
    <el-form :inline="true" class="mb-4">
      <el-form-item label="选择文件ID">
        <el-select
          v-model="selectedFileIds"
          multiple
          collapse-tags
          placeholder="请选择文件ID（200-220）"
          style="width: 300px"
        >
          <el-option
            v-for="id in fileIdOptions"
            :key="id"
            :label="id.toString()"
            :value="id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="handleDownload"
          :loading="isLoading"
          :disabled="selectedFileIds.length === 0"
        >
          <i class="el-icon-download"></i> 下载选中文件
        </el-button>
      </el-form-item>
    </el-form>

    <el-loading
      :visible="isLoading"
      text="正在准备下载..."
      spinner="el-icon-loading"
      background="rgba(0, 0, 0, 0.7)"
    ></el-loading>
  </div>
</template>

<script>
// 导入封装的下载接口函数
import { downloadFiles } from '@/api/system/test4'

export default {
  data() {
    return {
      fileIdOptions: Array.from({ length: 174 }, (_, i) => 101 + i),
      selectedFileIds: [],
      isLoading: false
    }
  },
  methods: {
    handleDownload() {
      if (this.selectedFileIds.length === 0) {
        this.$message.warning('请至少选择一个文件ID')
        return
      }
      this.isLoading = true
      // 调用封装的接口函数
      downloadFiles({ fileIdList: this.selectedFileIds })
        .then(response => this.handleDownloadResponse(response))
        .catch(error => this.handleDownloadError(error))
        .finally(() => this.isLoading = false)
    },

    handleDownloadResponse(response) {
      // 1. 打印完整响应头到控制台
      console.log('===== 响应头信息 =====')
      console.log('Content-Disposition:', response.headers['content-disposition'])
      console.log('Content-Type:', response.headers['content-type'])
      console.log('所有响应头:', response.headers)
      console.log('======================')

      let fileName = 'download'; // 默认值

      // 2. 解析文件名
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        console.log('开始解析文件名:', contentDisposition)

        const match1 = contentDisposition.match(/filename="([^"]+)"/); // 格式1: filename="xxx.xx"
        const match2 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/); // 格式2: filename*=UTF-8''xxx.xx

        if (match1) {
          console.log('匹配格式1: filename="xxx.xx"，提取的文件名:', match1[1])
          fileName = match1[1];
        } else if (match2) {
          console.log('匹配格式2: filename*=UTF-8xxx.xx，提取的文件名:', match2[1])
          fileName = decodeURIComponent(match2[1]);
        } else {
          console.warn('未匹配到标准格式，尝试原始提取:', contentDisposition)
          const rawMatch = contentDisposition.split('filename=').pop().split(';')[0].replace(/"/g, '');
          fileName = decodeURIComponent(rawMatch);
        }

        console.log('解析后的最终文件名:', fileName)
      } else {
        console.warn('响应头中未找到 Content-Disposition，使用默认文件名')
      }

      // 3. 判断是否为ZIP压缩包，使用固定文件名
      const isZipFile =
        response.headers['content-type'] === 'application/zip' ||
        response.headers['content-type'] === 'application/x-zip-compressed' ||
        (fileName && fileName.toLowerCase().endsWith('.zip'));

      if (isZipFile) {
        fileName = 'download.zip';
        console.log('检测到ZIP压缩包，使用固定文件名:', fileName);
      }

      // 4. 执行下载
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // 5. 清理资源
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    },

    handleDownloadError(error) {
      console.error('下载失败:', error);

      if (error.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            this.$message.error(errorData.msg || '下载失败');
          } catch (e) {
            this.$message.error(reader.result || '文件下载失败');
          }
        };
        reader.readAsText(error.response.data);
      } else if (error.response?.data) {
        this.$message.error(error.response.data.msg || '下载失败');
      } else {
        this.$message.error(error.message || '网络错误，无法连接到服务器');
      }
    }
  }
}
</script>

<style scoped>
.file-download-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
