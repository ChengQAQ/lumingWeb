<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <!-- 投递人选择器（支持点击显示全部+输入筛选） -->
      <el-form-item label="投递人" prop="senderId">
        <el-autocomplete
          v-model="senderNick"
          :fetch-suggestions="querySenderSearch"
          :trigger-on-focus="true"
        clearable
        placeholder="请输入或选择投递人"
        @select="handleSenderSelect"
        style="width: 100%;"
        ></el-autocomplete>
      </el-form-item>

      <!-- 被投递人选择器（支持点击显示全部+输入筛选） -->
      <el-form-item label="被投递人" prop="receiverId">
        <el-autocomplete
          v-model="receiverNick"
          :fetch-suggestions="queryReceiverSearch"
          :trigger-on-focus="true"
        clearable
        placeholder="请输入或选择被投递人"
        @select="handleReceiverSelect"
        style="width: 100%;"
        ></el-autocomplete>
      </el-form-item>

      <el-form-item label="投递标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入投递标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="投递时间" prop="sendTime">
        <el-date-picker clearable
                        v-model="queryParams.sendTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择投递时间">
        </el-date-picker>
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
          v-hasPermi="['system:mailbox:add']"
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
          v-hasPermi="['system:mailbox:edit']"
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
          v-hasPermi="['system:mailbox:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:mailbox:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mailboxList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="邮件ID" align="center" prop="id" />
      <el-table-column label="投递人" align="center">
        <template slot-scope="scope">
          <span>{{ getUserName(scope.row.senderId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="被投递人" align="center">
        <template slot-scope="scope">
          <span>{{ getUserName(scope.row.receiverId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投递标题" align="center" prop="title" />
      <el-table-column label="投递内容" align="center" prop="content" />
      <el-table-column label="附件存储路径" align="center" prop="attachment">
        <template slot-scope="scope">
          <div v-if="scope.row.attachment && scope.row.attachment.trim() !== ''">
            <div style="margin-bottom: 5px;">
              <span style="font-size: 12px; color: #666;">{{ scope.row.attachment }}</span>
            </div>
            <div>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-link"
                @click="handleGetAttachmentUrl(scope.row)"
              >下载</el-button>
            </div>
          </div>
          <span v-else style="color: #999;">无附件</span>
        </template>
      </el-table-column>
      <el-table-column label="投递时间" align="center" prop="sendTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.sendTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否读取" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.readStatus === '1' ? 'success' : 'info'">
            {{ scope.row.readStatus === '1' ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:mailbox:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:mailbox:remove']"
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

    <!-- 添加或修改邮箱对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="投递人" prop="senderId">
          <el-autocomplete
            v-model="form.senderNick"
            :fetch-suggestions="querySenderSearch"
            :trigger-on-focus="true"
            clearable
            placeholder="请输入或选择投递人"
            @select="handleFormSenderSelect"
            style="width: 100%;"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="被投递人" prop="receiverId">
          <el-autocomplete
            v-model="form.receiverNick"
            :fetch-suggestions="queryReceiverSearch"
            :trigger-on-focus="true"
            clearable
            placeholder="请输入或选择被投递人"
            @select="handleFormReceiverSelect"
            style="width: 100%;"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="投递标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入投递标题" />
        </el-form-item>
        <el-form-item label="投递内容">
          <editor v-model="form.content" :min-height="120"/>
        </el-form-item>
        <el-form-item label="附件存储路径" prop="attachment">
          <file-upload v-model="form.attachment"/>
        </el-form-item>
        <el-form-item label="是否已读" v-if="form.id !== null">
          <el-switch
            v-model="form.readStatus"
            active-value="1"
            inactive-value="0"
            active-text="已读"
            inactive-text="未读">
          </el-switch>
        </el-form-item>
        <el-form-item label="投递时间" prop="sendTime">
          <el-date-picker clearable
                          v-model="form.sendTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择投递时间">
          </el-date-picker>
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
import { listMailbox, getMailbox, delMailbox, addMailbox, updateMailbox, sysUserList, getAttachmentPreviewPath } from "@/api/system/mailbox"

export default {
  name: "Mailbox",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 用户列表
      userList: [],
      // 总条数
      total: 0,
      // 邮箱表格数据
      mailboxList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        senderId: null,
        receiverId: null,
        title: null,
        content: null,
        attachment: null,
        sendTime: null,
        readStatus: null
      },
      // 搜索框显示的昵称（前端临时存储）
      senderNick: "",
      receiverNick: "",
      // 表单参数
      form: {
        id: null,
        senderId: null,
        senderNick: "",  // 表单中显示的投递人昵称
        receiverId: null,
        receiverNick: "", // 表单中显示的被投递人昵称
        title: null,
        content: null,
        attachment: null,
        sendTime: null,
        readStatus: null
      },
      // 表单校验
      rules: {
        senderId: [
          { required: true, message: "投递人不能为空", trigger: "change" }
        ],
        receiverId: [
          { required: true, message: "被投递人不能为空", trigger: "change" }
        ],
        title: [
          { required: true, message: "投递标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "投递内容不能为空", trigger: "blur" }
        ],
        sendTime: [
          { required: true, message: "投递时间不能为空", trigger: "blur" }
        ],
        readStatus: [
          { required: true, message: "是否读取不能为空", trigger: "change" }
        ]
      }
    }
  },
  created() {
    this.loadUserList()
    this.getList()
  },
  methods: {
    /** 加载用户列表 */
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

    /** 根据用户ID获取用户名 */
    getUserName(userId) {
      if (!userId) return '-'
      const user = this.userList.find(u => u.userId === userId)
      return user ? user.nickName : `未知用户(${userId})`
    },

    /** 投递人搜索逻辑（通用：搜索框和表单共用） */
    querySenderSearch(queryString, callback) {
      this.commonSearch(queryString, callback)
    },

    /** 被投递人搜索逻辑（通用：搜索框和表单共用） */
    queryReceiverSearch(queryString, callback) {
      this.commonSearch(queryString, callback)
    },

    /** 通用搜索逻辑：支持空输入显示全部，输入时筛选 */
    commonSearch(queryString, callback) {
      // 空输入时显示全部用户，有输入时按昵称筛选（不区分大小写）
      const results = queryString
        ? this.userList.filter(user =>
          user.nickName.toLowerCase().includes(queryString.toLowerCase())
        )
        : [...this.userList]  // 空输入返回所有用户

      // 格式化结果：显示昵称+ID，便于区分同名用户
      callback(results.map(user => ({
        value: `${user.nickName} (ID: ${user.userId})`,
        id: user.userId,
        nickName: user.nickName
      })))
    },

    /** 搜索框选择投递人 */
    handleSenderSelect(item) {
      this.senderNick = item.nickName
      this.queryParams.senderId = item.id
    },

    /** 搜索框选择被投递人 */
    handleReceiverSelect(item) {
      this.receiverNick = item.nickName
      this.queryParams.receiverId = item.id
    },

    /** 表单选择投递人 */
    handleFormSenderSelect(item) {
      this.form.senderNick = item.nickName
      this.form.senderId = item.id
    },

    /** 表单选择被投递人 */
    handleFormReceiverSelect(item) {
      this.form.receiverNick = item.nickName
      this.form.receiverId = item.id
    },

    /** 查询邮箱列表 */
    getList() {
      this.loading = true
      listMailbox(this.queryParams).then(response => {
        this.mailboxList = response.rows
        this.total = response.total
        this.loading = false
      })
    },

    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },

    // 表单重置
    reset() {
      this.form = {
        id: null,
        senderId: null,
        senderNick: "",
        receiverId: null,
        receiverNick: "",
        title: null,
        content: null,
        attachment: null,
        sendTime: null,
        readStatus: null
      }
      this.resetForm("form")
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      // 额外重置昵称显示和ID
      this.senderNick = ""
      this.receiverNick = ""
      this.queryParams.senderId = null
      this.queryParams.receiverId = null
      this.handleQuery()
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加邮箱"
    },

    /** 修改按钮操作：回显数据时同步显示昵称 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getMailbox(id).then(response => {
        this.form = { ...response.data }
        // 回显投递人昵称
        const sender = this.userList.find(u => u.userId === this.form.senderId)
        this.form.senderNick = sender ? sender.nickName : `未知用户(${this.form.senderId})`

        // 回显被投递人昵称
        const receiver = this.userList.find(u => u.userId === this.form.receiverId)
        this.form.receiverNick = receiver ? receiver.nickName : `未知用户(${this.form.receiverId})`

        this.open = true
        this.title = "修改邮箱"
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMailbox(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addMailbox(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },


    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除邮箱编号为"' + ids + '"的数据项？').then(function() {
        return delMailbox(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/mailbox/export', {
        ...this.queryParams
      }, `mailbox_${new Date().getTime()}.xlsx`)
    },

    /** 获取附件网址并跳转 */
    handleGetAttachmentUrl(row) {
      if (!row.attachment || row.attachment.trim() === '') {
        this.$message.warning('该邮件没有附件')
        return
      }
      
      // 使用邮件ID作为fileId参数
      const fileId = row.id
      
      if (!fileId) {
        this.$message.error('邮件ID不存在')
        return
      }

      this.loading = true
      getAttachmentPreviewPath(fileId).then(response => {
        this.loading = false
        if (response) {
          // 获取返回的网址并清理所有空格
          let attachmentUrl = response
          
          // 清理URL中的所有空格，特别是https:后的空格
          attachmentUrl = attachmentUrl.replace(/\s+/g, '')
          
          console.log('原始网址:', response)
          console.log('清理后的网址:', attachmentUrl)
          
          // 直接跳转到返回的网址
          window.location.href = attachmentUrl
          this.$message.success('正在跳转到附件页面...')
        } else {
          this.$message.error('获取附件网址失败：' + (response.msg || '未知错误'))
        }
      }).catch(error => {
        this.loading = false
        this.$message.error('获取附件网址失败：' + error.message)
      })
    }
  }
}
</script>
