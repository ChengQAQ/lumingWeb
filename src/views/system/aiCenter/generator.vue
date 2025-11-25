<template>
  <div class="app-container">
    <div class="page-header">
      <h2>AI阅读题生成器</h2>
      <p class="page-description">上传阅读材料，AI将为您生成专业的阅读理解题目</p>
    </div>
    <div class="main-content">
      <div class="left-panel">
        <div class="upload-section">
          <h3>材料上传</h3>
          <div class="upload-area">
            <el-upload ref="upload" :action="uploadAction" :before-upload="beforeUpload" :on-success="handleUploadSuccess" :on-error="handleUploadError" :on-change="handleFileChange" :file-list="fileList" :limit="1" :auto-upload="false" accept=".txt,.png,.jpg,.jpeg" drag>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将阅读材料拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">支持 TXT、JPG、JPEG、PNG 格式，单个文件不超过 50MB</div>
            </el-upload>
          </div>
        </div>

        <div class="params-section">
          <h3>题目参数配置</h3>
          <el-form :model="questionParams" label-width="120px" size="small">
            <el-form-item label="选择题数量">
              <el-input-number 
                v-model="questionParams.choice" 
                :min="0" 
                :max="20" 
                controls-position="right"
                style="width: 100%"
                placeholder="0-20"
              />
              <div class="param-tip">选择题数量范围0~20</div>
            </el-form-item>
            <el-form-item label="是非题数量">
              <el-input-number 
                v-model="questionParams.truefalse" 
                :min="0" 
                :max="20" 
                controls-position="right"
                style="width: 100%"
                placeholder="0-20"
              />
              <div class="param-tip">是非题数量范围0~20</div>
            </el-form-item>
            <el-form-item label="填空题数量">
              <el-input-number 
                v-model="questionParams.blank" 
                :min="0" 
                :max="20" 
                controls-position="right"
                style="width: 100%"
                placeholder="0-20"
              />
              <div class="param-tip">填空题数量范围0~20</div>
            </el-form-item>
            <el-form-item label="简答题数量">
              <el-input-number 
                v-model="questionParams.shorta" 
                :min="0" 
                :max="20" 
                controls-position="right"
                style="width: 100%"
                placeholder="0-20"
              />
              <div class="param-tip">简答题数量范围0~20</div>
            </el-form-item>
          </el-form>
        </div>

        <div class="action-section">
          <el-button v-if="!generating" type="primary" size="large" :disabled="!canGenerate" @click="generateQuestions" style="width: 100%">生成阅读题</el-button>
          <div v-else class="generating-actions">
            <el-button type="warning" size="large" @click="cancelGeneration" style="width: calc(100% - 120px)">取消生成</el-button>
            <el-button type="info" size="large" :loading="true" style="width: 110px">生成中...</el-button>
          </div>
          <div v-if="!canGenerate" style="margin-top: 10px; font-size: 12px; color: #909399;"><div v-if="!selectedFile">请先选择阅读材料</div></div>
        </div>
        <div class="history-section">
          <h3>生成历史</h3>
          <div class="history-list">
            <div v-for="item in historyList" :key="item.id" class="history-item" @click="loadHistoryItem(item)">
              <div class="history-info"><div class="history-title">{{ item.fileName }}</div><div class="history-time">{{ formatTime(item.createTime) }}</div></div>
              <div class="history-actions"><el-button type="text" size="small" @click.stop="deleteHistory(item)">删除</el-button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-panel">
        <div class="preview-header">
          <h3>阅读题预览</h3>
          <div class="preview-actions">
            <el-button type="primary" size="small" @click="toggleEdit" :disabled="!currentMarkdown">{{ isEditing ? '预览' : '编辑' }}</el-button>
            <el-button type="success" size="small" @click="downloadDocx" :disabled="!currentMarkdown">下载</el-button>
            <el-button type="warning" size="small" @click="saveToMyFiles" :disabled="!currentMarkdown">保存到我的文件</el-button>
          </div>
        </div>
        <div class="preview-content">
          <div v-if="isEditing && currentMarkdown" class="edit-mode">
            <mavon-editor ref="mdEditor" v-model="editingMarkdown" :toolbars="toolbars" :boxShadow="false" :subfield="true" :defaultOpen="'preview'" :editable="true" :toolbarsFlag="true" :navigation="false" :shortCut="false" :codeStyle="'github'" :ishljs="true" :autofocus="false" :placeholder="'在这里编辑阅读题内容...'" :scrollStyle="true" :boxShadowStyle="'0 2px 12px 0 rgba(0, 0, 0, 0.1)'" :transition="true" :previewBackground="'#fff'" :html="false" :xssOptions="xssOptions" @save="saveEdit" style="height: 100%;"/>
            <div class="edit-actions"><el-button @click="cancelEdit">取消</el-button><el-button type="primary" @click="saveEdit">保存</el-button></div>
          </div>
          <div v-else-if="currentMarkdown" class="preview-mode"><div ref="markdownContainer" class="markdown-preview" v-html="renderedMarkdown"></div></div>
          <div v-else class="empty-state"><el-empty description="请上传阅读材料并生成阅读题"></el-empty></div>
        </div>
      </div>
    </div>
    <el-dialog title="保存到我的文件" :visible.sync="saveDialogVisible" width="500px">
      <el-form :model="saveForm" :rules="saveRules" ref="saveForm" label-width="120px">
        <el-form-item label="*文件用途" prop="filePurpose"><el-input v-model="saveForm.filePurpose" placeholder="阅读题" disabled /></el-form-item>
        <el-form-item label="*用户自定义文件名" prop="userFname"><el-input v-model="saveForm.userFname" placeholder="请输入用户自定义文件名" /></el-form-item>
        <el-form-item label="*课程名" prop="subjectName">
          <el-select v-model="saveForm.subjectName" placeholder="请选择课程名" clearable style="width: 100%">
            <el-option v-for="subject in subjectList" :key="subject.subjectCode" :label="`${subject.subjectCode} - ${subject.subjectName}`" :value="subject.subjectCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="章节" prop="knowledge"><el-cascader v-model="saveForm.knowledge" :options="chapterOptions" :props="chapterProps" placeholder="请选择章节（选填）" clearable :show-all-levels="true"></el-cascader></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button @click="saveDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmSave" :loading="saving">{{ saving ? '保存中...' : '确定' }}</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { convertTeachplan, generateQuestions } from "@/api/system/aiCenter"
import { saveAs } from 'file-saver'
import { convertMarkdownToDocx, convertMarkdownToDocxBlob, showFileNameDialog } from '@/utils/markdownToDocx'
import * as marked from 'marked'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { listSubject } from "@/api/system/subject"
import { sysGetchaptermap } from "@/api/system/knowledge"
import request from '@/utils/request'
export default {
  name: 'ReadingGenerator',
  components: { mavonEditor },
  data(){return{uploadAction:'#',fileList:[],selectedFile:null,selectedProvider:'kimi',generating:false,cancelSource:null,currentMarkdown:'',editingMarkdown:'',isEditing:false,historyList:[],saveDialogVisible:false,saving:false,subjectList:[],chapterOptions:[],chapterProps:{label:'label',value:'value',children:'children',checkStrictly:true},saveForm:{filePurpose:'阅读题',userFname:'',subjectName:'',knowledge:''},saveRules:{userFname:[{required:true,message:'请输入用户自定义文件名',trigger:'blur'}],subjectName:[{required:true,message:'请选择课程名',trigger:'change'}]},toolbars:{bold:true,italic:true,header:true,underline:true,strikethrough:true,mark:true,superscript:true,subscript:true,quote:true,ol:true,ul:true,link:true,imagelink:true,code:true,table:true,help:true,save:false},xssOptions:{whiteList:{h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],p:[],div:[],span:[],strong:[],em:[],b:[],i:[],ul:[],ol:[],li:[],blockquote:[],code:[],pre:[],table:[],thead:[],tbody:[],tr:[],th:[],td:[],a:['href','title'],img:['src','alt','title'],hr:[],br:[]}},questionParams:{choice:1,truefalse:1,blank:1,shorta:1}}},
  computed:{canGenerate(){return this.selectedFile},renderedMarkdown(){if(!this.currentMarkdown)return'';const o={breaks:true,gfm:true,headerIds:false,mangle:false,tables:true};let html=marked.parse(this.currentMarkdown,o);html=html.replace(/<table>/g,'<table border="1" style="border-collapse: collapse;">');return html}},
  created(){this.loadHistoryFromStorage();this.loadSubjectList();this.loadChapterList()},
  methods:{
    beforeUpload(file){const ok=['text/plain','image/png','image/jpeg','image/jpg'].includes(file.type);const lt=file.size/1024/1024<50;if(!ok){this.$message.error('只能上传 TXT、JPG、JPEG、PNG 格式的文件!');return false}if(!lt){this.$message.error('文件大小不能超过 50MB!');return false}this.selectedFile=file;this.$message.success('材料选择成功，可以开始生成阅读题');return false},
    handleUploadSuccess(r,f){this.$message.success('材料上传成功');this.selectedFile=f},
    handleUploadError(){this.$message.error('材料上传失败')},
    handleFileChange(file){if(file&&file.raw){this.selectedFile=file.raw;this.$message.success('材料选择成功，可以开始生成阅读题')}},
    async generateQuestions() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择阅读材料')
        return
      }
      this.generating = true
      try {
        const fd = new FormData()
        fd.append('material', this.selectedFile)
        fd.append('choice', this.questionParams.choice)
        fd.append('truefalse', this.questionParams.truefalse)
        fd.append('blank', this.questionParams.blank)
        fd.append('shorta', this.questionParams.shorta)
        
        this.$message({
          message: 'AI正在生成阅读题，请耐心等待...',
          type: 'info',
          duration: 0,
          showClose: false
        })
        
        const CancelToken = (await import('axios')).default.CancelToken
        this.cancelSource = CancelToken.source()
        
        const res = await generateQuestions(fd, { cancelToken: this.cancelSource.token })
        this.$message.closeAll()
        
        // 处理不同的API响应格式
        let responseData
        // 如果res直接包含extracted_text和generated_questions（直接返回数据格式）
        if (res.extracted_text && res.generated_questions) {
          responseData = res
        }
        // 如果res.code === 200且res.data包含extracted_text和generated_questions
        else if (res.code === 200 && res.data && res.data.extracted_text && res.data.generated_questions) {
          responseData = res.data
        } 
        // 如果res.data.data包含extracted_text和generated_questions
        else if (res.code === 200 && res.data && res.data.data && res.data.data.extracted_text && res.data.data.generated_questions) {
          responseData = res.data.data
        }
        
        if (responseData) {
          
          // 将生成的题目转换为Markdown格式
          const markdown = this.convertQuestionsToMarkdown(responseData)
          this.currentMarkdown = markdown
          this.editingMarkdown = markdown
          this.$message({
            message: '阅读题生成成功',
            type: 'success',
            showClose: true
          })
          this.saveToHistory({
            id: Date.now(),
            fileName: this.selectedFile.name,
            markdown: markdown,
            params: this.questionParams,
            createTime: new Date().toISOString()
          })
                 } else {
           this.$message.error('生成的数据格式不正确')
         }
      } catch (e) {
        this.$message.closeAll()
        if (e && (e.code === 'ERR_CANCELED' || e.message === 'canceled')) {
          this.$message.info('已取消生成')
        } else if (e.message && e.message.includes('timeout')) {
          this.$message.error('生成超时，请稍后重试或联系管理员')
        } else if (e.message && e.message.includes('Network Error')) {
          this.$message.error('网络连接异常，请检查网络后重试')
        } else {
          this.$message.error('生成失败：' + (e.message || '网络错误'))
        }
      } finally {
        this.generating = false
        this.cancelSource = null
      }
    },
    cancelGeneration(){try{if(this.cancelSource)this.cancelSource.cancel('canceled')}finally{this.generating=false;this.cancelSource=null;this.$message.closeAll()}},
    async toggleEdit(){if(this.isEditing){this.isEditing=false;return}this.editingMarkdown=this.currentMarkdown;this.isEditing=true;this.$nextTick(()=>{const editor=this.$refs.mdEditor;if(editor){try{editor.focus()}catch(e){}}})},
    cancelEdit(){this.isEditing=false},
    async saveEdit(){this.currentMarkdown=this.editingMarkdown;this.isEditing=false;this.$message.success('编辑保存成功')},
    async downloadDocx(){if(!this.currentMarkdown)return;const latest=this.isEditing?this.editingMarkdown:this.currentMarkdown;const blob=await convertMarkdownToDocxBlob(latest);const def=`${this.selectedFile?.name?.replace(/\.[^/.]+$/, '')||'阅读题'}_阅读题`;showFileNameDialog(def,(name)=>{saveAs(blob,`${name}.docx`);this.$message.success('文件下载成功')},this)},
    saveToMyFiles(){if(!this.currentMarkdown)return;this.saveForm.userFname=`${this.selectedFile?.name?.replace(/\.[^/.]+$/,'')||'阅读题'}_阅读题`;this.saveForm.filePurpose='阅读题';this.saveDialogVisible=true},
    async confirmSave(){this.$refs.saveForm.validate(async(valid)=>{if(!valid)return;this.saving=true;try{const latest=this.isEditing?this.editingMarkdown:this.currentMarkdown;const docxBlob=await convertMarkdownToDocxBlob(latest);let knowledgeValue='';if(this.saveForm.knowledge&&this.saveForm.knowledge.length>0)knowledgeValue=Array.isArray(this.saveForm.knowledge)?this.saveForm.knowledge.join('/') : this.saveForm.knowledge;const formData=new FormData();formData.append('filePurpose',this.saveForm.filePurpose);formData.append('filePath',`/teacher/${this.saveForm.userFname}.docx`);formData.append('knowledge',knowledgeValue);formData.append('subjectName',this.saveForm.subjectName);formData.append('userFname',this.saveForm.userFname);formData.append('file',docxBlob,`${this.saveForm.userFname}.docx`);const response=await request({url:'/system/teacher/addFile',method:'post',data:formData,headers:{'Content-Type':'multipart/form-data'}});if(response.code===200){this.$message.success('保存成功');this.saveDialogVisible=false;this.resetSaveForm()}else{this.$message.error(response.msg||'保存失败')}}catch(e){this.$message.error('保存失败：'+(e.message||'网络错误'))}finally{this.saving=false}})},
    resetSaveForm(){this.saveForm={filePurpose:'阅读题',userFname:'',subjectName:'',knowledge:''}},
    loadHistoryFromStorage(){const h=localStorage.getItem('readingGeneratorHistory');this.historyList=h?JSON.parse(h):[]},
    saveToHistory(item){this.historyList.unshift(item);if(this.historyList.length>20)this.historyList=this.historyList.slice(0,20);localStorage.setItem('readingGeneratorHistory',JSON.stringify(this.historyList))},
    loadHistoryItem(item){if(!item||!item.markdown){this.$message.warning('历史记录数据不完整，无法加载');return}this.currentMarkdown=item.markdown;this.editingMarkdown=item.markdown;this.selectedProvider=item.provider||'kimi';this.$message.success('已加载历史记录')},
    deleteHistory(item){this.$confirm('确定要删除这条历史记录吗？','提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(()=>{const i=this.historyList.findIndex(h=>h.id===item.id);if(i>-1){this.historyList.splice(i,1);localStorage.setItem('readingGeneratorHistory',JSON.stringify(this.historyList));this.$message.success('删除成功')}})},
    loadSubjectList(){listSubject().then(r=>{this.subjectList=r.rows||[]}).catch(()=>{this.$message.error('获取课程数据失败')})},
    loadChapterList(){sysGetchaptermap().then(r=>{if(r.code===200)this.chapterOptions=r.data||[];else this.$message.error('获取章节列表失败：'+r.msg)}).catch(e=>{this.$message.error('获取章节列表失败：'+e.message)})},
    // 时间格式化（用于历史记录显示）
    formatTime(timeStr){ return new Date(timeStr).toLocaleString() },

    // 将API返回的题目数据转换为Markdown格式
    convertQuestionsToMarkdown(responseData) {
      let markdown = '# 阅读理解题\n\n'
      
      // 添加提取的文本
      if (responseData.extracted_text) {
        markdown += '## 阅读材料\n\n'
        markdown += responseData.extracted_text + '\n\n'
      }
      
             // 处理生成的题目
       if (responseData.generated_questions) {
         try {
           // 尝试解析JSON字符串，处理可能的markdown代码块格式
           let questionsData
           if (typeof responseData.generated_questions === 'string') {
             // 如果是字符串，先尝试移除markdown代码块标记
             let jsonStr = responseData.generated_questions
             if (jsonStr.startsWith('```json\n')) {
               jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '')
             }
             questionsData = JSON.parse(jsonStr)
           } else {
             questionsData = responseData.generated_questions
           }
          
          markdown += '## 题目\n\n'
          
                     // 处理子题目
           if (questionsData.children && Array.isArray(questionsData.children)) {
             questionsData.children.forEach((question, index) => {
              markdown += `### ${index + 1}. ${question.question}\n\n`
              
              // 根据题目类型添加不同的内容
              if (question.qtype === 1 && question.options && question.options.length > 0) {
                // 选择题
                question.options.forEach((option, optIndex) => {
                  const optionLabel = String.fromCharCode(65 + optIndex) // A, B, C, D...
                  markdown += `${optionLabel}. ${option}\n`
                })
                markdown += '\n'
              } else if (question.qtype === 9) {
                // 是非题或简答题
                if (question.answers && question.answers.length > 0) {
                  markdown += '**答案：** ' + question.answers.join(', ') + '\n\n'
                }
              } else if (question.qtype === 2) {
                // 填空题
                if (question.answers && question.answers.length > 0) {
                  markdown += '**答案：** ' + question.answers.join(', ') + '\n\n'
                }
              }
                         })
           } else {
             markdown += '**未找到有效的题目数据**\n\n'
           }
         } catch (error) {
           markdown += '**题目数据解析失败，请检查API返回格式**\n\n'
         }
       } else {
         markdown += '**未找到题目数据**\n\n'
       }
      
      return markdown
    }
  }
}
</script>
<style scoped>
/* 复用教案样式 */
.page-header{margin-bottom:20px;padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 12px 0 rgba(0, 0, 0, 0.1)}
.page-header h2{margin:0 0 10px 0;color:#303133;font-size:24px;font-weight:600}
.page-description{margin:0;color:#909399;font-size:14px}
.main-content{display:flex;gap:20px;min-height:calc(100vh - 200px)}
.left-panel{width:400px;flex-shrink:0;display:flex;flex-direction:column;gap:20px;overflow-y:auto;max-height:calc(100vh - 240px)}
.right-panel{flex:1;display:flex;flex-direction:column;background:#fff;border-radius:8px;box-shadow:0 2px 12px 0 rgba(0, 0, 0, 0.1)}
.upload-section,.history-section,.params-section{background:#fff;border-radius:8px;padding:20px;box-shadow:0 2px 12px 0 rgba(0, 0, 0, 0.1);flex-shrink:0}
.upload-section h3,.history-section h3,.params-section h3{margin:0 0 15px 0;color:#303133;font-size:18px;font-weight:600}
.param-tip{font-size:12px;color:#909399;margin-top:4px}
.upload-area{margin-bottom:20px}
.action-section{margin-bottom:20px;flex-shrink:0}
.history-section{flex:1;min-height:200px;display:flex;flex-direction:column}
.history-list{flex:1;overflow-y:auto;min-height:150px}
.history-item{display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e4e7ed;border-radius:6px;margin-bottom:8px;background:#fafafa;cursor:pointer;transition:all .3s}
.history-item:hover{background:#f0f9ff;border-color:#409eff}
.history-info{flex:1}
.history-title{font-size:14px;color:#303133;margin-bottom:4px}
.history-time{font-size:12px;color:#909399}
.history-actions{display:flex;gap:8px}
.preview-header{padding:20px;border-bottom:1px solid #e4e7ed;display:flex;justify-content:space-between;align-items:center}
.preview-header h3{margin:0;color:#303133;font-size:18px;font-weight:600}
.preview-actions{display:flex;gap:10px}
.preview-content{flex:1;padding:20px;overflow-y:auto}
.edit-mode{height:100%;display:flex;flex-direction:column}
.edit-mode .v-note-wrapper{height:100%!important;border:1px solid #e4e7ed;border-radius:6px}
.edit-mode .v-note-wrapper .v-note-op{background:#f8f9fa;border-bottom:1px solid #e4e7ed}
.edit-mode .v-note-wrapper .v-note-show{background:#fff}
.edit-mode .v-note-wrapper .v-note-edit{background:#fff;font-family:'Courier New',Consolas,Monaco,monospace}
.edit-actions{margin-top:15px;display:flex;justify-content:flex-end;gap:10px}
.preview-mode{height:100%}
.markdown-preview{line-height:1.6;color:#303133;padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.markdown-preview h1,.markdown-preview h2,.markdown-preview h3,.markdown-preview h4,.markdown-preview h5,.markdown-preview h6{margin-top:20px;margin-bottom:10px;color:#303133}
.markdown-preview h1{font-size:24px;border-bottom:2px solid #409eff;padding-bottom:8px}
.markdown-preview h2{font-size:20px;border-bottom:1px solid #e4e7ed;padding-bottom:6px}
.markdown-preview h3{font-size:18px}
.markdown-preview p{margin-bottom:12px}
.markdown-preview table{width:100%;border-collapse:collapse;margin:15px 0;border:3px solid #409eff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);background:#fff}
.markdown-preview th,.markdown-preview td{border:2px solid #409eff!important;padding:12px 16px;text-align:left;vertical-align:top;position:relative}
.markdown-preview th{background:#409eff!important;font-weight:600;color:#fff!important;border-bottom:2px solid #409eff!important}
.markdown-preview td{background:#fff!important;border:2px solid #409eff!important}
.markdown-preview tr:hover td{background:#f0f9ff!important}
.markdown-preview table,.markdown-preview table *{border-color:#409eff!important}
.markdown-preview table{border-spacing:0!important;border-collapse:collapse!important}
.markdown-preview table th,.markdown-preview table td{border:2px solid #409eff!important;border-collapse:collapse!important}
.markdown-preview table[border="1"]{border:3px solid #409eff!important}
.markdown-preview table[border="1"] th,.markdown-preview table[border="1"] td{border:2px solid #409eff!important}
.markdown-preview .math{font-family:'Times New Roman',serif;font-size:1.1em;line-height:1.4}
.markdown-preview .math-inline{display:inline;padding:0 4px}
.markdown-preview .math-display{display:block;text-align:center;margin:15px 0;padding:10px;background:#f8f9fa;border:1px solid #e4e7ed;border-radius:6px}
.markdown-preview pre{background:#f6f8fa;border:1px solid #e1e4e8;border-radius:6px;padding:16px;overflow-x:auto;margin:15px 0;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;line-height:1.45;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
.markdown-preview code{background:#f8f9fa;padding:2px 6px;border-radius:4px;font-family:'Courier New',monospace}
.markdown-preview .code-block{background:#f6f8fa;border:1px solid #e1e4e8;border-radius:6px;padding:16px;overflow-x:auto;margin:15px 0;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;line-height:1.45}
.markdown-preview .code-block code{background:transparent;padding:0;border-radius:0;font-family:inherit;font-size:inherit}
.markdown-preview ul,.markdown-preview ol{margin:10px 0;padding-left:20px}
.markdown-preview li{margin:5px 0;line-height:1.6}
.markdown-preview hr{border:none;border-top:1px solid #e4e7ed;margin:20px 0}
.empty-state{display:flex;justify-content:center;align-items:center;height:100%;color:#909399}
.history-list::-webkit-scrollbar,.preview-content::-webkit-scrollbar{width:6px}
.history-list::-webkit-scrollbar-thumb,.preview-content::-webkit-scrollbar-thumb{background:#c0c4cc;border-radius:3px}
.history-list::-webkit-scrollbar-track,.preview-content::-webkit-scrollbar-track{background:#f5f7fa}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .left-panel {
    width: 100%;
    max-height: none;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .upload-section,
  .params-section,
  .action-section {
    flex: 1;
    min-width: 300px;
  }
  
  .history-section {
    flex: 1;
    min-width: 100%;
    order: 3;
  }
  
  .right-panel {
    min-height: 500px;
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .page-header h2 {
    font-size: 20px;
  }
  
  .page-description {
    font-size: 13px;
  }
  
  .left-panel {
    flex-direction: column;
    gap: 12px;
  }
  
  .upload-section,
  .params-section,
  .action-section,
  .history-section {
    min-width: auto;
    padding: 15px;
  }
  
  .upload-section h3,
  .params-section h3,
  .history-section h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .preview-header {
    padding: 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .preview-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .preview-content {
    padding: 15px;
  }
  
  .edit-actions {
    margin-top: 12px;
    flex-direction: column;
    gap: 8px;
  }
  
  .edit-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .page-header {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .page-header h2 {
    font-size: 18px;
  }
  
  .page-description {
    font-size: 12px;
  }
  
  .main-content {
    gap: 12px;
  }
  
  .left-panel {
    gap: 10px;
  }
  
  .upload-section,
  .params-section,
  .action-section,
  .history-section {
    padding: 12px;
  }
  
  .upload-section h3,
  .params-section h3,
  .history-section h3 {
    font-size: 15px;
    margin-bottom: 10px;
  }
  
  .param-tip {
    font-size: 11px;
  }
  
  .preview-header {
    padding: 12px;
  }
  
  .preview-header h3 {
    font-size: 16px;
  }
  
  .preview-actions {
    gap: 8px;
  }
  
  .preview-actions .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .preview-content {
    padding: 12px;
  }
  
  .history-item {
    padding: 10px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .history-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .markdown-preview {
    padding: 15px;
  }
  
  .markdown-preview h1 {
    font-size: 20px;
  }
  
  .markdown-preview h2 {
    font-size: 18px;
  }
  
  .markdown-preview h3 {
    font-size: 16px;
  }
  
  .markdown-preview table {
    font-size: 12px;
  }
  
  .markdown-preview th,
  .markdown-preview td {
    padding: 8px 10px;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 8px;
  }
  
  .page-header {
    padding: 10px;
  }
  
  .page-header h2 {
    font-size: 16px;
  }
  
  .upload-section,
  .params-section,
  .action-section,
  .history-section {
    padding: 10px;
  }
  
  .preview-header {
    padding: 10px;
  }
  
  .preview-content {
    padding: 10px;
  }
  
  .preview-actions .el-button {
    font-size: 11px;
    padding: 6px 10px;
  }
  
  .markdown-preview {
    padding: 12px;
  }
  
  .markdown-preview h1 {
    font-size: 18px;
  }
  
  .markdown-preview h2 {
    font-size: 16px;
  }
  
  .markdown-preview h3 {
    font-size: 14px;
  }
  
  .markdown-preview table {
    font-size: 11px;
  }
  
  .markdown-preview th,
  .markdown-preview td {
    padding: 6px 8px;
  }
}

</style>