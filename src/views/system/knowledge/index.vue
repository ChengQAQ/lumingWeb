
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文件用途" prop="filePurpose">
        <el-select
          v-model="queryParams.filePurpose"
          placeholder="请选择或输入文件用途"
          clearable
          allow-create
          filterable
          @change="handleQuery"
        >
          <el-option
            v-for="item in filePurposeOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件类型" prop="fileType">
        <el-input
          v-model="queryParams.fileType"
          placeholder="请输入文件类型"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="章节" prop="knowledge">
        <!-- 原el-input替换为el-cascader -->
        <el-cascader
          v-model="queryParams.knowledge"
          :options="chapterOptions"
          :props="chapterProps"
          placeholder="请选择章节"
          clearable
          @change="handleQuery"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="上传用户" prop="uploadUserId">
        <el-autocomplete
          v-model="queryParams.uploadUserNick"
          :fetch-suggestions="querySearch"
          :trigger-on-focus="true"
          clearable
          placeholder="请输入或选择上传用户"
          @select="handleUserSelect"
          style="width: 100%;"
        ></el-autocomplete>
        <input type="hidden" v-model="queryParams.uploadUserId" />
      </el-form-item>
      <el-form-item label="上传时间" prop="uploadTime">
        <el-date-picker clearable
                        v-model="queryParams.uploadTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择上传时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="课程名" prop="subjectName">
        <el-select
          v-model="queryParams.subjectName"
          placeholder="请选择课程名"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="subject in subjectList"
            :key="subject.subjectCode"
            :label="`${subject.subjectCode} - ${subject.subjectName}`"
            :value="subject.subjectCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户自定义文件名" prop="userFname">
        <el-input
          v-model="queryParams.userFname"
          placeholder="请输入用户自定义文件名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:knowledge:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:knowledge:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:knowledge:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:knowledge:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleDownload"
          v-hasPermi="['system:knowledge:export']"
        >下载</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件ID" align="center" prop="fileId" />
      <el-table-column label="文件类型" align="center" prop="fileType" />
      <el-table-column label="文件用途" align="center" prop="filePurpose" />
      <el-table-column label="用户自定义文件名" align="center" prop="userFname" />
      <!-- <el-table-column label="文件存储路径" align="center" prop="filePath" /> -->
      <el-table-column label="章节" align="center" prop="knowledge" />
      <el-table-column label="上传时间" align="center" prop="uploadTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.uploadTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="课程名" align="center" prop="subjectName">
        <template slot-scope="scope">
          <span>{{ getSubjectDisplay(scope.row.subjectName) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传用户" align="center">
        <template slot-scope="scope">
          <span>{{ getUserName(scope.row.uploadUserId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:knowledge:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:knowledge:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改文件对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="文件用途" prop="filePurpose">
          <el-select
            v-model="form.filePurpose"
            placeholder="请选择或输入文件用途"
            clearable
            allow-create
            filterable
          >
            <el-option
              v-for="item in filePurposeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户自定义文件名" prop="userFname">
          <el-input v-model="form.userFname" placeholder="请输入用户自定义文件名" />
        </el-form-item>
        <el-form-item label="文件存储路径" prop="filePath">
          <file-upload v-model="form.filePath"/>
        </el-form-item>
        <!-- 添加/修改对话框中的章节字段 -->
        <el-form-item label="章节" prop="knowledge">
          <!-- 原el-input替换为el-cascader -->
          <el-cascader
            v-model="form.knowledge"
            :options="chapterOptions"
            :props="chapterProps"
            placeholder="请选择章节"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="课程名" prop="subjectName">
          <el-select
            v-model="form.subjectName"
            placeholder="请选择课程名"
          >
            <el-option
              v-for="subject in subjectList"
              :key="subject.subjectCode"
              :label="`${subject.subjectCode} - ${subject.subjectName}`"
              :value="subject.subjectCode"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge, sysUserList, sysSubjectList,sysGetchaptermap,downloadFiles1} from "@/api/system/knowledge"

export default {
  name: "Knowledge",
  data() {
    return {
      // 文件用途选项
      filePurposeOptions: ['教案', '课件', '思维导图', '教学视频', '作业', '教学音频', '学案', '自定义作业', '自定义组卷'],
      chapterOptions: [], // 存储sysGetchaptermap返回的多级选项
      // 新增：配置级联选择器的属性（根据实际接口返回字段调整）
      chapterProps: {
        label: 'label', // 显示的文本字段（例如"第一章"）
        value: 'value', // 选中的值字段（例如"1"）
        children: 'children', // 子级数据字段（嵌套的多级数据）
        checkStrictly: true
      },
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      knowledgeList: [],
      title: "",
      open: false,
      userList: [],
      subjectList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadUserNick: "",
        uploadTime: null,
        subjectName: null
      },
      form: {
        fileId: null,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadTime: null,
        subjectName: null
      },
      rules: {
        fileType: [
          { required: true, message: "文件类型不能为空", trigger: "change" }
        ],
        filePurpose: [
          { required: true, message: "文件用途不能为空", trigger: "blur" }
        ],
        userFname: [
          { required: true, message: "用户自定义文件名不能为空", trigger: "blur" }
        ],
        filePath: [
          { required: true, message: "文件存储路径不能为空", trigger: "blur" }
        ],
        knowledge: [
          { required: true, message: "章节不能为空", trigger: "blur" }
        ],
        subjectName: [
          { required: true, message: "课程名不能为空", trigger: "change" }
        ]
      }
    }
  },
    created() {
      this.loadUserList();
      this.loadSubjectList();
      this.loadChapterList(); // 新增：加载章节数据
      this.getList();
  },
  methods: {
    loadChapterList() {
      sysGetchaptermap().then(response => {
        if (response.code === 200) {
          this.chapterOptions = response.data || []; // 存储多级数据
        } else {
          this.$message.error('获取章节列表失败：' + response.msg);
        }
      }).catch(error => {
        this.$message.error('获取章节列表失败：' + error.message);
      });
    },

    loadUserList() {
      sysUserList().then(response => {
        if (response.code === 200) {
          this.userList = response.data || []
        } else {
          this.$message.error('获取用户列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取用户列表失败：' + error.message)
      })
    },
    loadSubjectList() {
      sysSubjectList().then(response => {
        if (response.code === 200) {
          this.subjectList = response.data || []
        } else {
          this.$message.error('获取课程列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取课程列表失败：' + error.message)
      })
    },
    getUserName(userId) {
      if (!userId) return '-'
      const user = this.userList.find(u => u.userId === userId)
      return user ? user.nickName : `未知用户(${userId})`
    },
    getSubjectDisplay(subjectCode) {
      if (!subjectCode) return '-'
      const subject = this.subjectList.find(item => item.subjectCode === subjectCode)
      return subject ? `${subject.subjectCode} - ${subject.subjectName}` : `未知课程(${subjectCode})`
    },
    querySearch(queryString, callback) {
      const results = queryString
        ? this.userList.filter(user => {
          const nicknameMatch = user.nickName.toLowerCase().includes(queryString.toLowerCase())
          const idMatch = user.userId.toString().includes(queryString)
          return nicknameMatch || idMatch
        })
        : [...this.userList]
      callback(results.map(user => ({
        value: `${user.nickName} (ID: ${user.userId})`,
        id: user.userId,
        nickName: user.nickName
      })))
    },
    handleUserSelect(item) {
      this.queryParams.uploadUserNick = item.nickName;
      this.queryParams.uploadUserId = item.id;
    },
    getList() {
      this.loading = true
      listKnowledge(this.queryParams).then(response => {
        this.knowledgeList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        fileId: null,
        fileType: null,
        filePurpose: null,
        userFname: null,
        filePath: null,
        knowledge: null,
        uploadUserId: null,
        uploadTime: null,
        subjectName: null
      }
      this.resetForm("form")
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      // 关键：将知识路径数组转为字符串
      if (this.queryParams.knowledge && this.queryParams.knowledge.length) {
        this.queryParams.knowledge = this.queryParams.knowledge[this.queryParams.knowledge.length - 1];
      }
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm")
      this.queryParams.uploadUserNick = ""
      this.queryParams.uploadUserId = null
      this.queryParams.subjectName = null
      this.queryParams.userFname = null
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.fileId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加文件"
    },
    handleUpdate(row) {
      this.reset()
      const fileId = row.fileId || this.ids
      getKnowledge(fileId).then(response => {
        this.form = { ...response.data }

        // 章节回显：数据库返回字符串，需要切割成数组用于cascader
        if (this.form.knowledge && typeof this.form.knowledge === 'string') {
          // 切割字符串为label数组
          const labelArr = this.form.knowledge.split('/').filter(Boolean);
          // 将label数组转换为value数组用于cascader回显
          this.form.knowledge = this.findValuePathByLabels(this.chapterOptions, labelArr);
        } else if (!this.form.knowledge) {
          this.form.knowledge = [];
        }

        this.open = true
        this.title = "修改文件"
      })
    },
    // 根据label数组查找value数组
    findValuePathByLabels(options, labels) {
      let path = [];
      let currentOptions = options;

      for (let label of labels) {
        const node = currentOptions.find(opt => opt.label === label);
        if (!node) {
          console.warn('找不到匹配的章节节点:', label);
          return [];
        }
        path.push(node.value);
        currentOptions = node.children || [];
      }

      return path;
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 处理knowledge字段，确保传递给后端的是字符串而不是数组
          let formData = Object.assign({}, this.form);
          if (formData.knowledge && Array.isArray(formData.knowledge)) {
            formData.knowledge = formData.knowledge[formData.knowledge.length - 1];
          }

          if (this.form.fileId != null) {
            const originalData = this.knowledgeList.find(item => item.fileId === this.form.fileId)
            if (originalData) {
              formData.uploadUserId = originalData.uploadUserId
            }
            updateKnowledge(formData).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            formData.uploadUserId = 1;
            formData.uploadTime = new Date().toISOString().split('T')[0]
            addKnowledge(formData).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    handleDelete(row) {
      const fileIds = row.fileId || this.ids
      this.$modal.confirm('是否确认删除文件编号为"' + fileIds + '"的数据项？').then(function() {
        return delKnowledge(fileIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    handleExport() {
      this.download('system/knowledge/export', {
        ...this.queryParams
      }, `knowledge_${new Date().getTime()}.xlsx`)
    },
    handleDownload() {
      const fileIdList = this.ids;
      if (!fileIdList || fileIdList.length === 0) {
        this.$message.warning("请至少选择一个文件");
        return;
      }

      this.$modal.confirm('是否确认下载选中的文件？').then(() => {
        const formData = { fileIdList };
        return downloadFiles1(formData);
      }).then(response => {
        // 使用与test4页面一致的处理方式
        this.handleDownloadResponse(response);
      }).catch(error => {
        this.handleDownloadError(error);
      });
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

      this.$modal.msgSuccess("下载成功");
    },

    handleDownloadError(error) {
      console.error('下载失败:', error);

      if (error !== 'cancel') {
        if (error.response?.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              this.$modal.msgError(errorData.msg || '下载失败');
            } catch (e) {
              this.$modal.msgError(reader.result || '文件下载失败');
            }
          };
          reader.readAsText(error.response.data);
        } else if (error.response?.data) {
          this.$modal.msgError(error.response.data.msg || '下载失败');
        } else {
          this.$modal.msgError(error.message || '网络错误，无法连接到服务器');
        }
      }
    }
  }
}
</script>

