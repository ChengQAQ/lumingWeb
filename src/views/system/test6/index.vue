<template>
  <div class="app-container">
    <!-- 居中按钮区域 -->
    <div class="button-container">
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
        class="operation-btn"
      >
        发布
      </el-button>
      <el-button
        type="info"
        plain
        icon="el-icon-search"
        size="mini"
        @click="openQueryDialog"
        class="operation-btn"
      >
        查询个人发布
      </el-button>
    </div>

    <!-- 发布弹窗 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="被投递人" prop="receiverId">
          <!-- 显示昵称，但值固定为1且不可修改 -->
          <el-select
            v-model="form.receiverId"
            placeholder="请选择被投递人"
            disabled
          style="width: 100%"
          >
          <el-option
            v-for="user in userList"
            :key="user.userId"
            :label="user.nickName"
            :value="user.userId.toString()"
          />
          </el-select>
          <!-- 隐藏的input存储实际提交的receiverId=1（确保表单验证通过） -->
          <input type="hidden" v-model="form.receiverId" />
        </el-form-item>
        <el-form-item label="投递标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="投递内容" prop="content">
          <editor v-model="form.content" :min-height="120" />
        </el-form-item>
        <el-form-item label="附件">
          <file-upload v-model="form.attachment" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确认发布</el-button>
      </div>
    </el-dialog>

    <!-- 查询弹窗（内容不变） -->
    <el-dialog title="个人发布记录" :visible.sync="queryDialogVisible" width="900px">
      <el-table
        v-loading="queryLoading"
        :data="mailboxList"
        border
        style="width: 100%"
      >
        <template slot="empty">
          <el-empty description="暂无数据" />
        </template>
        <el-table-column label="邮件ID" align="center" prop="id" />
        <el-table-column label="投递人" align="center">
          <template slot-scope="scope">
            {{ getNickName(scope.row.senderId) }}
          </template>
        </el-table-column>
        <el-table-column label="被投递人" align="center">
          <template slot-scope="scope">
            {{ getNickName(scope.row.receiverId) }}
          </template>
        </el-table-column>
        <el-table-column label="投递标题" align="center" prop="title" />
        <el-table-column label="投递内容" align="center" prop="content" />
        <el-table-column label="附件存储路径" align="center" prop="attachment" />
        <el-table-column label="投递时间" align="center" prop="sendTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.sendTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-dialog>
  </div>
</template>

<script>
import { listMailboxByUser, addMailbox, sysUserList } from "@/api/system/mailbox";

export default {
  name: "Mailbox",
  data() {
    return {
      loading: false,
      queryLoading: false,
      total: 0,
      mailboxList: [],
      title: "",
      open: false,
      queryDialogVisible: false,
      userList: [], // 用户列表数据

      queryParams: {
        pageNum: 1,
        pageSize: 10,
        senderId: null,
        receiverId: null,
        title: null,
        content: null,
        attachment: null,
        sendTime: null
      },
      form: {
        receiverId: "1", // 默认值固定为1（字符串类型，适配下拉框）
        title: "",
        content: "",
        attachment: ""
      },
      rules: {
        receiverId: [
          { required: true, message: "接收人不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "投递内容不能为空", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              // 移除HTML标签后检查纯文本长度
              const textContent = value ? value.replace(/<[^>]*>/g, '').trim() : '';
              if (textContent.length < 5) {
                callback(new Error('投递内容至少需要5个字'));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.loadUserList(); // 加载用户列表
  },
  methods: {
    // 加载用户列表
    loadUserList() {
      sysUserList().then(response => {
        if (response.code === 200) {
          this.userList = response.data || [];
        }
      }).catch(error => {
        console.error("加载用户列表失败：", error);
        this.$modal.msgError("加载用户信息失败，请刷新页面重试");
      });
    },

    // 根据userId获取nickName
    getNickName(userId) {
      if (!userId) return "未知用户";
      const user = this.userList.find(u => u.userId.toString() === userId.toString());
      return user ? user.nickName : `未知用户(${userId})`;
    },

    // 其他方法（getList、parseTime、openQueryDialog等保持不变）
    getList() {
      this.queryLoading = true;
      listMailboxByUser(this.queryParams).then(response => {
        if (response.code === 200) {
          this.mailboxList = response.data || [];
        }
        this.queryLoading = false;
      }).catch(() => {
        this.queryLoading = false;
      });
    },

    parseTime(time) {
      if (!time) return "";
      try {
        const date = new Date(time);
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } catch (e) {
        return time;
      }
    },

    openQueryDialog() {
      this.queryDialogVisible = true;
      this.queryParams.pageNum = 1;
      this.getList();
    },

    handleAdd() {
      this.form = {
        ...this.form, // 保留默认receiverId=1
        title: "",
        content: "",
        attachment: ""
      };
      this.open = true;
      this.title = "发布信息";
    },

    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 额外检查内容长度
          const textContent = this.form.content ? this.form.content.replace(/<[^>]*>/g, '').trim() : '';
          if (textContent.length < 5) {
            this.$message.error('投递内容至少需要5个字');
            return;
          }

          addMailbox({
            ...this.form,
            sendTime: new Date().toISOString()
          }).then(response => {
            if (response.code === 200) {
              this.$modal.msgSuccess("发布成功");
              this.open = false;
            } else {
              this.$modal.msgError(response.msg || "发布失败");
            }
          }).catch(error => {
            this.$modal.msgError(error.msg || "请求失败");
          });
        }
      });
    },

    cancel() {
      this.open = false;
    }
  }
};
</script>

<style scoped>
/* 样式保持不变 */
.app-container {
  padding: 20px;
  min-height: 100vh;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 150px;
  margin-bottom: 20px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.operation-btn {
  width: 120px;
  margin: 0 10px;
}

@media screen and (max-width: 768px) {
  .button-container {
    margin-top: 100px;
  }
  .operation-btn {
    width: 100px;
    margin: 0 5px;
  }
}
</style>
