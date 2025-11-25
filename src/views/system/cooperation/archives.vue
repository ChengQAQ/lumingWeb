<template>
  <div class="app-container">
    <div class="page-header">
      <h2>教研组活动档案库</h2>
      <p class="page-description">管理教研组活动相关的教学材料</p>
    </div>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >上传文件</el-button>
          </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
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
        >删除</el-button>
           </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleDownload"
        >下载</el-button>
           </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-share"
          size="mini"
          :disabled="multiple"
          @click="handleShare"
        >分享文件</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getFileList"></right-toolbar>
         </el-row>

           <!-- 文件列表 -->
     <el-card class="list-card" shadow="hover">
       <div slot="header" class="card-header">
         <span>文件列表</span>
         <div class="header-actions">
           <el-select
             v-model="selectedGroupId"
             placeholder="请选择要查询的小组"
             style="width: 200px; margin-right: 10px"
             clearable
             @change="handleGroupChange"
           >
             <el-option
               v-for="group in groupList"
               :key="group.id"
               :label="group.groupName"
               :value="group.id"
             />
           </el-select>
           <el-input
             v-model="searchKeyword"
             placeholder="搜索文件名"
             style="width: 200px; margin-right: 10px"
             clearable
             @keyup.enter.native="handleSearch"
           >
             <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
           </el-input>
           <el-button type="primary" icon="el-icon-refresh" @click="getFileList" :disabled="!selectedGroupId">刷新</el-button>
         </div>
       </div>

       <file-list
         :file-list-data="fileListData"
         :loading="loading"
         :total="total"
         :query-params="queryParams"
         :subject-list="subjectList"
         @selection-change="handleSelectionChange"
         @pagination="handlePagination"
         @preview="handlePreview"
         @update="handleUpdate"
         @refresh="getFileList"
       />
    </el-card>

    <!-- 文件上传和预览组件 -->
    <file-upload-preview
      ref="fileUploadPreview"
      :default-file-purpose="'教研材料'"
      :group-label="'教研组'"
      :subject-list="subjectList"
      :group-list="groupList"
      :show-subject-select="true"
      :show-group-select="true"
      :default-subject-code="userSubject"
      @refresh="getFileList"
    />

    <!-- 分享文件弹窗 -->
    <file-share-dialog
      :visible.sync="shareVisible"
      :selected-files="selectedFiles"
      @remove-file="handleRemoveFile"
      @success="handleShareSuccess"
      @close="handleShareClose"
    />
  </div>
</template>

<script>
import { sysSubjectList } from '@/api/system/knowledge'
import { listGroup1, getGroupFiles } from '@/api/system/group'
import { listMember } from '@/api/system/member'
import { getTeacherInfo } from '@/api/system/teacher'
import FileUploadPreview from '@/components/FileUploadPreview'
import FileList from '@/components/FileList'
import FileShareDialog from '@/components/FileShareDialog'
import RightToolbar from '@/components/RightToolbar'

export default {
  name: "Archives",
  components: {
    FileUploadPreview,
    FileList,
    FileShareDialog,
    RightToolbar
  },
  data() {
    return {
               // 上传表单
             uploadForm: {
        filePurpose: '教研材料',
        userFname: '',
        filePath: null,
        subjectName: '',
        teachingIds: []
      },
      uploadRules: {
        filePurpose: [
          { required: true, message: '文件用途不能为空', trigger: 'blur' }
        ],
        userFname: [
          { required: true, message: '文件名不能为空', trigger: 'blur' }
        ],
        subjectName: [
          { required: false, message: '请输入课程名', trigger: 'blur' }
        ],
        filePath: [
          { required: true, message: '请选择文件', trigger: 'change' }
        ],
        teachingIds: [
          { required: true, message: '请选择教研组', trigger: 'change' }
        ]
      },

               // 教研组列表
       groupList: [],
       
       // 课程列表
       subjectList: [],

               // 列表相关
       loading: false,
       total: 0,
       fileListData: [],
       originalFileListData: [], // 保存原始数据用于搜索
       searchKeyword: '',
       selectedFiles: [],

               // 查询参数
       queryParams: {
         pageNum: 1,
         pageSize: 10,
         keyword: ''
       },
       
       // 选中的小组ID
       selectedGroupId: null,

       // 弹窗相关
       open: false,
       title: '',
       form: {
         fileId: null,
         filePurpose: '教研材料',
         userFname: '',
         filePath: null,
         subjectName: '',
         grade: '',
         knowledge: [],
         teachingIds: []
       },
       rules: {
         filePurpose: [
           { required: true, message: '文件用途不能为空', trigger: 'blur' }
         ],
         userFname: [
           { required: true, message: '文件名不能为空', trigger: 'blur' }
         ],
        subjectName: [
          { required: false, message: '请输入课程名', trigger: 'blur' }
        ],
         filePath: [
           { required: true, message: '请选择文件', trigger: 'change' }
         ],
         teachingIds: [
           { required: true, message: '请选择教研组', trigger: 'change' }
         ]
       },

       // 章节相关
       chapterOptions: [],
       cascaderProps: {
         label: 'label',
         value: 'value',
         children: 'children',
         checkStrictly: true
       },

       // 年级选项
       gradeOptions: [
         { value: '初中', label: '初中' },
         { value: '高中', label: '高中' }
       ],

       // 列表相关
       ids: [],
       single: true,
       multiple: true,
       showSearch: true,

       // 预览相关数据
       previewVisible: false,
       currentPreviewFile: null,
       previewUrl: '',
       textContent: '',
       docxLoading: false,
       previewRetryCount: 0,
       maxRetryCount: 2,
       docxKey: 0,
       docxTimeoutId: null,
       docxRenderError: false,

       // 分享相关数据
       shareVisible: false,
       selectedFiles: [],

       // 用户学科信息
       userSubject: null
    }
  },
       created() {
     this.loadGroupList()
     this.loadSubjectList()
     this.loadUserGroupsAndFiles()
     this.loadTeacherInfo()
  },
       methods: {
     // 加载课程列表
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
     
     // 获取老师信息并设置学科
     async loadTeacherInfo() {
       try {
         const response = await getTeacherInfo();
         if (response.code === 200 && response.data) {
           const teacherData = response.data;
           if (teacherData.subjectNames) {
             // 将中文学科名转换为英文代码
             this.userSubject = this.convertSubjectToCode(teacherData.subjectNames);
           }
         }
       } catch (error) {
         console.error('获取老师信息失败:', error);
         // 如果获取失败，使用默认值
         this.userSubject = null;
       }
     },
     
     // 将中文学科名转换为英文代码
     convertSubjectToCode(subjectName) {
       const subjectMap = {
         "物理": "physics",
         "数学": "math", 
         "化学": "chemistry",
         "生物": "biology",
         "科学": "science",
         "语文": "chinese",
         "英语": "english",
         "信息": "tech",
         "通用": "common",
         "历史": "history",
         "政治": "politics",
         "地理": "geography",
         "python": "python"
       };
       
       return subjectMap[subjectName] || null;
     },
     
              // 加载教研组列表
       loadGroupList() {
         console.log('开始加载教研组列表...')
         listGroup1().then(response => {
           if (response.code === 200) {
             // 过滤只显示groupType为2的教研组
             this.groupList = (response.rows || []).filter(group => group.groupType === 2)
           } else {
             this.$message.error('获取教研组列表失败：' + response.msg)
           }
         }).catch(error => {
           this.$message.error('获取教研组列表失败：' + error.message)
         })
       },

       // 新增方法：加载用户所属的组和文件
       loadUserGroupsAndFiles() {
         console.log('开始加载用户所属的组和文件...')
         
         // 获取当前用户ID - 优先使用store中的userId
         const userId = this.$store.getters.userId || this.$store.getters.id
         console.log('当前用户ID:', userId)
         console.log('Store中的用户信息:', this.$store.getters)
         
         if (!userId) {
           console.error('无法获取用户ID')
           this.$message.warning('无法获取用户信息，请手动选择小组')
           return
         }
         
         // 获取用户所属的组成员信息
         listMember({ userId: userId }).then(memberResponse => {
           console.log('listMember API响应:', memberResponse)
           
           if (memberResponse.code === 200 && memberResponse.rows && memberResponse.rows.length > 0) {
             console.log('用户所属的组:', memberResponse.rows)
             
             // 获取所有组的详细信息来获取groupType
             const groupIds = memberResponse.rows.map(member => member.groupId)
             console.log('需要查询的组ID列表:', groupIds)
             
             // 查询所有组的详细信息
             const groupPromises = groupIds.map(groupId => {
               return listGroup1().then(response => {
                 if (response.code === 200) {
                   const group = response.rows.find(g => g.id === groupId)
                   return group ? { ...memberResponse.rows.find(m => m.groupId === groupId), ...group } : null
                 }
                 return null
               }).catch(error => {
                 console.error(`查询组 ${groupId} 详细信息失败:`, error)
                 return null
               })
             })
             
             Promise.all(groupPromises).then(groupsWithDetails => {
               const validGroups = groupsWithDetails.filter(group => group !== null)
               console.log('获取到详细信息的组:', validGroups)
               
               // 详细打印每个组的信息
               validGroups.forEach((member, index) => {
                 console.log(`组 ${index + 1}:`, {
                   groupId: member.groupId,
                   groupType: member.groupType,
                   groupName: member.groupName,
                   userId: member.userId
                 })
               })
               
               // 过滤教研组（groupType === 2）
               const userGroups = validGroups.filter(member => 
                 member.groupType === 2 && member.groupId
               )
               
               console.log('过滤后的教研组:', userGroups)
               
               if (userGroups.length > 0) {
                 console.log('用户所属的教研组:', userGroups)
                 
                 // 自动选择第一个教研组
                 const firstGroup = userGroups[0]
                 this.selectedGroupId = firstGroup.groupId
                 console.log('自动选择的组ID:', this.selectedGroupId)
                 
                 // 加载该组的文件
                 this.loadGroupFiles(firstGroup.groupId)
                 
                 // 更新组列表显示
                 this.updateGroupListDisplay(userGroups)
               } else {
                 console.log('用户不属于任何教研组')
                 console.log('所有组的groupType:', validGroups.map(m => m.groupType))
                 this.$message.info('您当前不属于任何教研组')
               }
             }).catch(error => {
               console.error('获取组详细信息失败:', error)
               this.$message.warning('无法获取组详细信息，请手动选择小组')
             })
           } else {
             console.log('用户不属于任何组')
             this.$message.info('您当前不属于任何教研组')
           }
         }).catch(error => {
           console.error('获取用户组成员信息失败:', error)
           this.$message.warning('无法获取您的组信息，请手动选择小组')
         })
       },

       // 新增方法：加载指定组的文件
       loadGroupFiles(groupId) {
         if (!groupId) return
         
         this.loading = true
         console.log('加载组文件，组ID:', groupId)
         
         getGroupFiles(groupId).then(response => {
           if (response.code === 200) {
             this.originalFileListData = response.rows || []
             this.fileListData = [...this.originalFileListData]
             this.total = response.total || 0
             console.log('成功加载组文件，总数:', this.total)
           } else {
             this.$message.error('获取文件列表失败：' + response.msg)
             this.fileListData = []
             this.originalFileListData = []
             this.total = 0
           }
           this.loading = false
         }).catch(error => {
           console.error('获取文件列表失败:', error)
           this.$message.error('获取文件列表失败：' + error.message)
           this.fileListData = []
           this.originalFileListData = []
           this.total = 0
           this.loading = false
         })
       },

       // 新增方法：更新组列表显示
       updateGroupListDisplay(userGroups) {
         // 更新组列表，只显示用户所属的组
         const groupIds = userGroups.map(member => member.groupId)
         this.groupList = this.groupList.filter(group => groupIds.includes(group.id))
         console.log('更新后的组列表:', this.groupList)
       },

    // 上传相关方法
    submitUpload() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          // 检查文件是否已上传
          if (!this.uploadForm.filePath) {
            this.$modal.msgError('请先上传文件')
            return
          }
          
          let formData = Object.assign({}, this.uploadForm);
          
          // 处理文件路径，确保只取第一个文件
          if (formData.filePath && formData.filePath.includes(',')) {
            formData.filePath = formData.filePath.split(',')[0]
          }
          
          // 处理teachingIds，将数组转换为逗号分隔的字符串
          if (formData.teachingIds && Array.isArray(formData.teachingIds)) {
            formData.teachingIds = formData.teachingIds.join(',')
          }
          
          // 设置上传时间
          formData.uploadTime = new Date().toISOString().split('T')[0];
          
          // 调用knowledge接口上传文件
          addKnowledge(formData).then(response => {
            if (response.code === 200) {
              this.$modal.msgSuccess("文件上传成功")
              this.resetUploadForm()
              this.getFileList()
            } else {
              this.$modal.msgError(response.msg || '文件上传失败')
            }
          }).catch(error => {
            this.$modal.msgError('文件上传失败：' + error.message)
          })
        }
      })
    },

               resetUploadForm() {
      this.uploadForm = {
        filePurpose: '教研材料',
        userFname: '',
        filePath: null,
        subjectName: '',
        teachingIds: []
      }
      this.$refs.uploadForm.resetFields()
    },

                    // 列表相关方法
       getFileList() {
         if (!this.selectedGroupId) {
           this.$message.warning('请先选择要查询的小组')
           return
         }
         
         this.loading = true
         getGroupFiles(this.selectedGroupId).then(response => {
           if (response.code === 200) {
             this.originalFileListData = response.rows || []
             this.fileListData = [...this.originalFileListData]
             this.total = response.total || 0
           } else {
             this.$message.error('获取文件列表失败：' + response.msg)
           }
           this.loading = false
         }).catch(error => {
           this.$message.error('获取文件列表失败：' + error.message)
           this.loading = false
         })
       },
     
              // 处理小组选择变化
       handleGroupChange(groupId) {
         if (groupId) {
           this.getFileList()
         } else {
           this.fileListData = []
           this.originalFileListData = []
           this.total = 0
         }
       },
       
       // 处理分页
       handlePagination() {
         // 由于使用本地数据，分页逻辑在表格中自动处理
         // 这里可以添加自定义分页逻辑如果需要
       },

                    handleSearch() {
         // 在本地数据中搜索
         if (!this.selectedGroupId) {
           this.$message.warning('请先选择要查询的小组')
           return
         }
         
         if (this.searchKeyword.trim()) {
           const filteredData = this.originalFileListData.filter(file => 
             file.userFname && file.userFname.toLowerCase().includes(this.searchKeyword.toLowerCase())
           )
           this.fileListData = filteredData
           this.total = filteredData.length
         } else {
           // 如果搜索关键词为空，恢复原始数据
           this.fileListData = [...this.originalFileListData]
           this.total = this.originalFileListData.length
         }
       },

    handleDownload(file) {
      let filesToDownload = []
      
      if (file && file.fileId) {
        // 从表格行点击下载
        filesToDownload = [file]
      } else if (this.ids && this.ids.length > 0) {
        // 从顶部按钮点击下载，使用选中的文件
        filesToDownload = this.fileListData.filter(item => this.ids.includes(item.fileId))
      } else {
        this.$message.warning('请选择要下载的文件')
        return
      }
      
      if (filesToDownload.length === 0) {
        this.$message.warning('请选择要下载的文件')
        return
      }
      
      const fileIdList = filesToDownload.map(f => f.fileId)
      this.$modal.confirm('是否确认下载选中的文件？').then(() => {
        const formData = { fileIdList }
        return downloadFiles1(formData)
      }).then(response => {
        this.handleDownloadResponse(response)
      }).catch(error => {
        this.handleDownloadError(error)
      })
    },

    handleDownloadResponse(response, fileName) {
      let downloadFileName = fileName || 'download'

      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const match1 = contentDisposition.match(/filename="([^"]+)"/)
        const match2 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)

        if (match1) {
          downloadFileName = match1[1]
        } else if (match2) {
          downloadFileName = decodeURIComponent(match2[1])
        } else {
          const rawMatch = contentDisposition.split('filename=').pop().split(';')[0].replace(/"/g, '')
          downloadFileName = decodeURIComponent(rawMatch)
        }
      }

      const isZipFile =
        response.headers['content-type'] === 'application/zip' ||
        response.headers['content-type'] === 'application/x-zip-compressed' ||
        (downloadFileName && downloadFileName.toLowerCase().endsWith('.zip'))

      if (isZipFile) {
        downloadFileName = 'download.zip'
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadFileName
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      this.$modal.msgSuccess("下载成功")
    },

    handleDownloadError(error) {
      console.error('下载失败:', error)

      if (error !== 'cancel') {
        if (error.response && error.response.data instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result)
              this.$modal.msgError(errorData.msg || '下载失败')
            } catch (e) {
              this.$modal.msgError(reader.result || '文件下载失败')
            }
          }
          reader.readAsText(error.response.data)
        } else if (error.response && error.response.data) {
          this.$modal.msgError(error.response.data.msg || '下载失败')
        } else {
          this.$modal.msgError(error.message || '网络错误，无法连接到服务器')
        }
      }
    },

    handleDelete(file) {
      let filesToDelete = []
      
      if (file && file.fileId) {
        // 从表格行点击删除
        filesToDelete = [file]
      } else if (this.ids && this.ids.length > 0) {
        // 从顶部按钮点击删除，使用选中的文件
        filesToDelete = this.fileListData.filter(item => this.ids.includes(item.fileId))
      } else {
        this.$message.warning('请选择要删除的文件')
        return
      }
      
      if (filesToDelete.length === 0) {
        this.$message.warning('请选择要删除的文件')
        return
      }
      
      const fileNames = filesToDelete.map(f => f.userFname || f.fileName).join('、')
      this.$confirm(`确定要删除文件"${fileNames}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 批量删除
        const deletePromises = filesToDelete.map(file => delKnowledge(file.fileId))
        Promise.all(deletePromises).then(() => {
        this.$message.success('删除成功')
        this.getFileList() // 重新加载文件列表
        }).catch(error => {
          this.$message.error('删除失败：' + (error.message || '未知错误'))
        })
      }).catch(error => {
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + (error.message || '未知错误'))
        }
      })
    },

    // 工具方法
    getFileIcon(fileType) {
      const iconMap = {
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'pdf': 'el-icon-document-copy',
        'ppt': 'el-icon-picture-outline',
        'pptx': 'el-icon-picture-outline',
        'xls': 'el-icon-tickets',
        'xlsx': 'el-icon-tickets',
        'txt': 'el-icon-document',
        'zip': 'el-icon-folder',
        'rar': 'el-icon-folder'
      }
      return iconMap[fileType] || 'el-icon-document'
    },

           formatFileSize(bytes) {
       if (bytes === 0) return '0 B'
       const k = 1024
       const sizes = ['B', 'KB', 'MB', 'GB']
       const i = Math.floor(Math.log(bytes) / Math.log(k))
       return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
     },
     
     // 获取课程显示名称
     getSubjectDisplay(subjectCode) {
       if (!subjectCode) return '-'
       const subject = this.subjectList.find(item => item.subjectCode === subjectCode)
       return subject ? `${subject.subjectName}` : subjectCode
    },

    // 新增方法：处理文件类型图标
    getFileTypeIcon(fileType) {
      if (!fileType) return 'el-icon-document'
      
      const type = fileType.toLowerCase().trim()
      
      // 图片文件
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].some(t => type.includes(t))) {
        return 'el-icon-picture'
      }
      
      // 文档文件
      if (['doc', 'docx', 'pdf', 'txt', 'rtf'].some(t => type.includes(t))) {
        return 'el-icon-document'
      }
      
      // 表格文件
      if (['xls', 'xlsx', 'csv'].some(t => type.includes(t))) {
        return 'el-icon-s-grid'
      }
      
      // 演示文件
      if (['ppt', 'pptx', 'pptm', 'potx', 'potm'].some(t => type.includes(t))) {
        return 'el-icon-reading'
      }
      
      // 视频文件
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].some(t => type.includes(t))) {
        return 'el-icon-video-camera'
      }
      
      // 音频文件
      if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].some(t => type.includes(t))) {
        return 'el-icon-microphone'
      }
      
      // 压缩文件
      if (['zip', 'rar', '7z', 'tar', 'gz'].some(t => type.includes(t))) {
        return 'el-icon-folder'
      }
      
      // 代码文件
      if (['js', 'html', 'css', 'xml', 'json', 'py', 'java', 'cpp', 'c'].some(t => type.includes(t))) {
        return 'el-icon-cpu'
      }
      
      // 默认图标
      return 'el-icon-document'
    },

    // 新增方法：处理文件用途图标
    getFilePurposeIcon(filePurpose) {
      if (!filePurpose) return 'el-icon-document'
      
      const purpose = filePurpose.toLowerCase()
      
      // 教研材料
      if (purpose.includes('教研材料')) {
        return 'el-icon-notebook-1'
      }
      
      // 默认图标
      return 'el-icon-document'
    },

    // 新增方法：处理添加文件
    handleAdd() {
      this.$refs.fileUploadPreview.openAddDialog()
    },

    // 新增方法：处理修改文件
    handleUpdate(row) {
      let fileId
      if (row && row.fileId) {
        // 从表格行点击修改
        fileId = row.fileId
      } else if (this.ids && this.ids.length === 1) {
        // 从顶部按钮点击修改，使用选中的文件
        fileId = this.ids[0]
      } else {
        this.$message.warning('请选择要修改的文件')
        return
      }
      
      this.$refs.fileUploadPreview.openEditDialog(fileId)
    },

    // 新增方法：根据label数组查找value数组
    findValuePathByLabels(options, labels) {
      let path = []
      let currentOptions = options
      
      for (let label of labels) {
        const node = currentOptions.find(opt => opt.label === label)
        if (!node) {
          console.warn('找不到匹配的章节节点:', label)
          return []
        }
        path.push(node.value)
        currentOptions = node.children || []
      }
      
      return path
    },

    // 新增方法：提交表单
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let formData = Object.assign({}, this.form)
          if (formData.knowledge && Array.isArray(formData.knowledge)) {
            formData.knowledge = formData.knowledge[formData.knowledge.length - 1]
          }
          
          // 处理teachingIds，将数组转换为逗号分隔的字符串
          if (formData.teachingIds && Array.isArray(formData.teachingIds)) {
            formData.teachingIds = formData.teachingIds.join(',')
          }

          if (this.form.fileId != null) {
            updateKnowledge(formData).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功")
                this.open = false
                this.getFileList()
              } else {
                this.$modal.msgError("修改失败：" + (response.msg || "未知错误"))
              }
            }).catch(error => {
              console.error("修改文件失败:", error)
              this.$modal.msgError("修改失败：" + (error.message || "网络错误"))
            })
          } else {
            formData.uploadUserId = this.$store.getters.userId || 1
            formData.uploadTime = new Date().toISOString().split('T')[0]
            addKnowledge(formData).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("新增成功")
                this.open = false
                this.getFileList()
              } else {
                this.$modal.msgError("新增失败：" + (response.msg || "未知错误"))
              }
            }).catch(error => {
              console.error("新增文件失败:", error)
              this.$modal.msgError("新增失败：" + (error.message || "网络错误"))
            })
          }
        }
      })
    },

    // 新增方法：取消操作
    cancel() {
      this.open = false
      this.reset()
    },

    // 新增方法：重置表单
    reset() {
      this.form = {
        fileId: null,
        filePurpose: '教研材料',
        userFname: '',
        filePath: null,
        subjectName: '',
        teachingIds: []
      }
      this.resetForm("form")
    },

    // 新增方法：处理课程变化
    handleSubjectChange(value) {
      if (value) {
        // 根据选择的课程加载对应的章节
        this.loadChapterOptions(value)
      } else {
        this.chapterOptions = []
      }
    },

    // 新增方法：加载章节选项
    loadChapterOptions(subjectCode) {
      sysGetchaptermap(subjectCode).then(response => {
        if (response.code === 200) {
          this.chapterOptions = response.data || []
        } else {
          this.$message.error('获取章节列表失败：' + response.msg)
        }
      }).catch(error => {
        this.$message.error('获取章节列表失败：' + error.message)
      })
    },

    // 新增方法：处理表格选择变化
    handleSelectionChange(data) {
      // 处理从 FileList 组件传递过来的数据
      if (data && typeof data === 'object') {
        this.ids = data.ids || []
        this.single = data.single !== undefined ? data.single : true
        this.multiple = data.multiple !== undefined ? data.multiple : true
        this.selectedFiles = data.selection || []
      } else {
        // 兼容旧的直接传递数组的方式
        const selection = Array.isArray(data) ? data : []
        this.ids = selection.map(item => item.fileId)
        this.single = selection.length !== 1
        this.multiple = !selection.length
        this.selectedFiles = selection
      }
    },

    // 新增方法：处理预览
    handlePreview(row) {
      this.$refs.fileUploadPreview.handlePreview(row)
    },


    // 处理分享
    handleShare() {
      if (this.ids.length === 0) {
        this.$message.warning('请先选择要分享的文件')
        return
      }
      
      this.selectedFiles = this.fileListData.filter(file => 
        this.ids.includes(file.fileId)
      )
      
      this.shareVisible = true
    },

    // 移除文件
    handleRemoveFile(file) {
      const index = this.selectedFiles.findIndex(f => f.fileId === file.fileId)
      if (index > -1) {
        this.selectedFiles.splice(index, 1)
        this.ids = this.selectedFiles.map(f => f.fileId)
      }
    },

    // 分享成功回调
    handleShareSuccess() {
      // 可以在这里添加分享成功后的操作，比如刷新列表
    },

    // 分享关闭回调
    handleShareClose() {
      // 可以在这里添加关闭后的清理操作
    },

    // 新增方法：Word文档组件挂载回调
    onDocxMounted() {
      console.log('Word文档组件已挂载')
      setTimeout(() => {
        if (this.docxLoading) {
          console.log('Word文档组件挂载完成，但仍在加载中')
        }
      }, 1000)
    },

    // 新增方法：Word文档加载状态回调
    onDocxLoading(loading) {
      this.docxLoading = loading
      console.log('Word文档加载状态:', loading)
    },

    // 新增方法：Word文档渲染完成回调
    onDocxRendered() {
      console.log('Word文档渲染完成')
      this.docxLoading = false
      this.previewRetryCount = 0
      
      if (this.docxTimeoutId) {
        clearTimeout(this.docxTimeoutId)
        this.docxTimeoutId = null
      }
      
      this.$message.success('Word文档加载完成')
    },

    // 新增方法：Excel渲染完成回调
    onExcelRendered() {
      console.log('Excel表格渲染完成')
    },

    // 新增方法：PowerPoint渲染完成回调
    onPptxRendered() {
      console.log('PowerPoint演示文稿渲染完成')
    },

    // 新增方法：Office文档渲染错误回调
    onOfficeError(error) {
      this.docxLoading = false
      
      if (this.docxTimeoutId) {
        clearTimeout(this.docxTimeoutId)
        this.docxTimeoutId = null
      }
      
      if (error && error.message) {
        const isComplexError = error.message.includes('appendChild') || 
                              error.message.includes('beginChar') ||
                              error.message.includes('innerHTML') ||
                              error.message.includes('renderMmlDelimiter') ||
                              error.message.includes('Cannot read properties of undefined')
        
        if (isComplexError) {
          console.warn('检测到复杂DOM操作错误，启用降级模式')
          this.docxRenderError = true
          this.$message.warning('该文档格式复杂，无法在线预览')
          return
        }
      }
      
      let errorMessage = '文档预览失败'
      let shouldRetry = false
      
      if (error && error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络后重试'
          shouldRetry = true
        } else if (error.message.includes('format') || error.message.includes('parse')) {
          errorMessage = '文档格式不支持或文件损坏，请尝试下载文件查看'
        } else {
          errorMessage = `文档预览失败：${error.message}`
        }
      }
      
      if (shouldRetry && this.previewRetryCount < this.maxRetryCount) {
        console.log('尝试重新渲染组件')
        this.retryPreview(this.currentPreviewFile)
        return
      }
      
      this.docxRenderError = true
      this.$message.error('文档预览失败，请下载文件查看')
      
      if (this.currentPreviewFile) {
        addLog({
          calledTableName: '文件预览错误',
          calledTableId: this.currentPreviewFile.fileId,
          isRead: 0,
          isClickRead: 0,
          isUsed: 0,
          errorInfo: error.message || '未知错误'
        })
      }
    },

    // 新增方法：处理预览弹窗关闭事件
    handlePreviewDialogClose() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause()
        this.$refs.videoPlayer.currentTime = 0
      }
      
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.pause()
        this.$refs.audioPlayer.currentTime = 0
      }
      
      this.currentPreviewFile = null
      this.previewUrl = ''
      this.textContent = ''
      this.docxLoading = false
      this.docxRenderError = false
      this.previewRetryCount = 0
      
      if (this.docxTimeoutId) {
        clearTimeout(this.docxTimeoutId)
        this.docxTimeoutId = null
      }
      
      console.log('预览弹窗已关闭，媒体播放已停止')
    }
  },

  computed: {
    // 判断是否为图片文件
    isImageFile() {
      if (!this.currentPreviewFile) return false
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return imageTypes.includes(fileType)
    },
    
    isPdfFile() {
      if (!this.currentPreviewFile) return false
      return this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase() === 'pdf'
    },
    
    isTextFile() {
      if (!this.currentPreviewFile) return false
      const textTypes = ['txt', 'md', 'json', 'xml', 'csv', 'log']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return textTypes.includes(fileType)
    },
    
    isVideoFile() {
      if (!this.currentPreviewFile) return false
      const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return videoTypes.includes(fileType)
    },
    
    isAudioFile() {
      if (!this.currentPreviewFile) return false
      const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return audioTypes.includes(fileType)
    },
    
    isDocxFile() {
      if (!this.currentPreviewFile) return false
      const docxTypes = ['docx', 'doc']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return docxTypes.includes(fileType)
    },
    
    isXlsxFile() {
      if (!this.currentPreviewFile) return false
      const xlsxTypes = ['xlsx', 'xls']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return xlsxTypes.includes(fileType)
    },
    
    isPptxFile() {
      if (!this.currentPreviewFile) return false
      const pptxTypes = ['pptx', 'ppt']
      const fileType = this.currentPreviewFile.fileType && this.currentPreviewFile.fileType.toLowerCase()
      return pptxTypes.includes(fileType)
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 文件类型和用途图标样式 */
.file-type-icon {
  font-size: 18px;
  margin-right: 8px;
}

.file-purpose-icon {
  font-size: 16px;
  margin-right: 6px;
}

/* 预览弹窗样式 */
/* 预览弹窗样式 */
.preview-dialog {
  margin-top: -2vh;
}

.preview-dialog .el-dialog__body {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

.preview-container {
  height: 80vh;
  margin-top: -20px;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.file-name-display {
  text-align: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name-display h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0px;
  background: #fff;
}

/* 文件类型预览样式 */
.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* PDF预览样式 */
.pdf-preview {
  flex: 1;
  padding: 0px;
}

.preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

/* 视频和音频预览样式 */
.video-preview, .audio-preview {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
}

.preview-video, .preview-audio {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 文本预览样式 */
.text-preview {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: white;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-text {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

/* Office文档预览样式 */
.office-preview {
  flex: 1;
  padding: 20px;
  min-height: 500px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.docx-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
}

.docx-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
}

/* 分享弹窗样式 */
.share-dialog {
  max-width: 600px;
}

.selected-files {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  background-color: #f9f9f9;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex: 1;
  margin-right: 8px;
  font-size: 14px;
}

.remove-file-btn {
  padding: 2px 6px;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-dialog {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .preview-content {
    max-height: 60vh;
  }
  
  .preview-pdf {
    height: 60vh;
  }
  
  .office-preview {
    height: 60vh;
  }
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.upload-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.upload-tip i {
  margin-right: 4px;
  color: #409EFF;
}
</style>