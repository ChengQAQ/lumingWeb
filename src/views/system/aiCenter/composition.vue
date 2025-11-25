<template>
  <div class="app-container">
    <div class="page-header">
      <h2>AI作文批改</h2>
      <p class="page-description">上传学生作文，AI将为您提供专业的批改建议</p>
    </div>
    <div class="main-content">
      <div class="left-panel">
        <div class="upload-section">
          <h3>作文上传</h3>
          <div class="essay-type-section">
            <h4>作文类型</h4>
            <el-radio-group v-model="essayType" @change="handleEssayTypeChange">
              <el-radio label="chinese">中文作文</el-radio>
              <el-radio label="english">英文作文</el-radio>
            </el-radio-group>
          </div>
          <div class="upload-area">
            <el-upload ref="upload" :action="uploadAction" :before-upload="beforeUpload" :on-success="handleUploadSuccess" :on-error="handleUploadError" :on-change="handleFileChange" :file-list="fileList" :limit="1" :auto-upload="false" accept=".txt,.png,.jpg,.jpeg" drag>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将作文文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">支持 TXT、JPG、JPEG、PNG 格式，单个文件不超过 50MB</div>
            </el-upload>
          </div>
          <div class="action-section">
            <el-button v-if="!generating" type="primary" size="large" :disabled="!canGenerate" @click="generateComposition" style="width: 100%">生成批改建议</el-button>
            <div v-else class="generating-actions">
              <el-button type="warning" size="large" @click="cancelGeneration" style="width: calc(100% - 120px)">取消生成</el-button>
              <el-button type="info" size="large" :loading="true" style="width: 110px">生成中...</el-button>
            </div>
            <div v-if="!canGenerate" style="margin-top: 10px; font-size: 12px; color: #909399;">
              <div v-if="!essayType">请先选择作文类型</div>
              <div v-else-if="!selectedFile">请先选择作文文件</div>
            </div>
          </div>
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
          <h3>批改预览</h3>
          <div class="preview-actions">
            <el-button type="primary" size="small" @click="toggleEdit" :disabled="!currentMarkdown">{{ isEditing ? '预览' : '编辑' }}</el-button>
            <el-button type="success" size="small" @click="downloadDocx" :disabled="!currentMarkdown">下载</el-button>
            <el-button type="warning" size="small" @click="saveToMyFiles" :disabled="!currentMarkdown">保存到我的文件</el-button>
          </div>
        </div>
        <div class="preview-content">
          <div v-if="isEditing && currentMarkdown" class="edit-mode">
            <mavon-editor ref="mdEditor" v-model="editingMarkdown" :toolbars="toolbars" :boxShadow="false" :subfield="true" :defaultOpen="'preview'" :editable="true" :toolbarsFlag="true" :navigation="false" :shortCut="false" :codeStyle="'github'" :ishljs="true" :autofocus="false" :placeholder="'在这里编辑批改内容...'" :scrollStyle="true" :boxShadowStyle="'0 2px 12px 0 rgba(0, 0, 0, 0.1)'" :transition="true" :previewBackground="'#fff'" :html="false" :xssOptions="xssOptions" @save="saveEdit" style="height: 100%;"/>
            <div class="edit-actions"><el-button @click="cancelEdit">取消</el-button><el-button type="primary" @click="saveEdit">保存</el-button></div>
            </div>
          <div v-else-if="currentMarkdown" class="preview-mode"><div ref="markdownContainer" class="markdown-preview" v-html="renderedMarkdown"></div></div>
          <div v-else class="empty-state"><el-empty description="请上传作文并生成批改建议"></el-empty></div>
        </div>
      </div>
    </div>
    <el-dialog title="保存到我的文件" :visible.sync="saveDialogVisible" width="500px">
      <el-form :model="saveForm" :rules="saveRules" ref="saveForm" label-width="120px">
        <el-form-item label="*文件用途" prop="filePurpose"><el-input v-model="saveForm.filePurpose" placeholder="作文批改" disabled /></el-form-item>
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
import { convertTeachplan, gradeCNEssay, gradeEssay } from "@/api/system/aiCenter"
import { saveAs } from 'file-saver'
import { convertMarkdownToDocx, convertMarkdownToDocxBlob, showFileNameDialog } from '@/utils/markdownToDocx'
import * as marked from 'marked'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { listSubject } from "@/api/system/subject"
import { sysGetchaptermap } from "@/api/system/knowledge"
import request from '@/utils/request'
export default {
  name: 'Composition',
  components: { mavonEditor },
  data(){return{uploadAction:'#',fileList:[],selectedFile:null,essayType:'',selectedProvider:'kimi',generating:false,cancelSource:null,currentMarkdown:'',editingMarkdown:'',isEditing:false,historyList:[],saveDialogVisible:false,saving:false,subjectList:[],chapterOptions:[],chapterProps:{label:'label',value:'value',children:'children',checkStrictly:true},saveForm:{filePurpose:'作文批改',userFname:'',subjectName:'',knowledge:''},saveRules:{userFname:[{required:true,message:'请输入用户自定义文件名',trigger:'blur'}],subjectName:[{required:true,message:'请选择课程名',trigger:'change'}]},toolbars:{bold:true,italic:true,header:true,underline:true,strikethrough:true,mark:true,superscript:true,subscript:true,quote:true,ol:true,ul:true,link:true,imagelink:true,code:true,table:true,help:true,save:false},xssOptions:{whiteList:{h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],p:[],div:[],span:[],strong:[],em:[],b:[],i:[],ul:[],ol:[],li:[],blockquote:[],code:[],pre:[],table:[],thead:[],tbody:[],tr:[],th:[],td:[],a:['href','title'],img:['src','alt','title'],hr:[],br:[]}}}},
  computed:{canGenerate(){return this.essayType&&this.selectedFile},renderedMarkdown(){if(!this.currentMarkdown)return'';const o={breaks:true,gfm:true,headerIds:false,mangle:false,tables:true};let html=marked.parse(this.currentMarkdown,o);html=html.replace(/<table>/g,'<table border="1" style="border-collapse: collapse;">');return html}},
  created(){this.loadHistoryFromStorage();this.loadSubjectList();this.loadChapterList()},
  methods:{
    beforeUpload(file){const ok=['text/plain','image/png','image/jpeg','image/jpg'].includes(file.type);const lt=file.size/1024/1024<50;if(!ok){this.$message.error('只能上传 TXT、JPG、JPEG、PNG 格式的文件!');return false}if(!lt){this.$message.error('文件大小不能超过 50MB!');return false}this.selectedFile=file;this.$message.success('作文选择成功，可以开始生成批改建议');return false},
    handleUploadSuccess(r,f){this.$message.success('作文上传成功');this.selectedFile=f},
    handleUploadError(){this.$message.error('作文上传失败')},
    handleFileChange(file){if(file&&file.raw){this.selectedFile=file.raw;this.$message.success('作文选择成功，可以开始生成批改建议')}},
    async generateComposition(){if(!this.essayType){this.$message.warning('请先选择作文类型');return}if(!this.selectedFile){this.$message.warning('请先选择作文文件');return}this.generating=true;try{const fd=new FormData();fd.append('essay',this.selectedFile);this.$message({message:'AI正在生成批改建议，请耐心等待...',type:'info',duration:0,showClose:false});const CancelToken=(await import('axios')).default.CancelToken;this.cancelSource=CancelToken.source();let res;if(this.essayType==='chinese'){res=await gradeCNEssay(fd,{cancelToken:this.cancelSource.token})}else{res=await gradeEssay(fd,{cancelToken:this.cancelSource.token})}this.$message.closeAll();if(res&&res.feedback&&res.original_essay){const feedback=res.feedback;const originalEssay=res.original_essay;const markdown=`# 作文批改报告\n\n## 📝 原文\n\n<div class="original-essay">\n\n${originalEssay}\n\n</div>\n\n## 📊 批改意见\n\n<div class="feedback-section">\n\n${feedback}\n\n</div>`;this.currentMarkdown=markdown;this.editingMarkdown=markdown;this.$message({message:'批改建议生成成功',type:'success',showClose:true});this.saveToHistory({id:Date.now(),fileName:this.selectedFile.name,markdown:markdown,essayType:this.essayType,createTime:new Date().toISOString()})}else{this.$message.error('生成失败：返回数据格式不正确')}}catch(e){this.$message.closeAll();if(e&&(e.code==='ERR_CANCELED'||e.message==='canceled')){this.$message.info('已取消生成')}else if(e.message&&e.message.includes('timeout'))this.$message.error('生成超时，请稍后重试或联系管理员');else if(e.message&&e.message.includes('Network Error'))this.$message.error('网络连接异常，请检查网络后重试');else this.$message.error('生成失败：'+(e.message||'网络错误'))}finally{this.generating=false;this.cancelSource=null}},
    async toggleEdit(){if(this.isEditing){this.isEditing=false;return}this.editingMarkdown=this.currentMarkdown;this.isEditing=true;this.$nextTick(()=>{const editor=this.$refs.mdEditor;if(editor){try{editor.focus()}catch(e){}}})},
    cancelEdit(){this.isEditing=false},
    async saveEdit(){this.currentMarkdown=this.editingMarkdown;this.isEditing=false;this.$message.success('编辑保存成功')},
    async downloadDocx(){if(!this.currentMarkdown)return;const latest=this.isEditing?this.editingMarkdown:this.currentMarkdown;const blob=await convertMarkdownToDocxBlob(latest);const def=`${this.selectedFile?.name?.replace(/\.[^/.]+$/, '')||'作文批改'}_作文批改`;showFileNameDialog(def,(name)=>{saveAs(blob,`${name}.docx`);this.$message.success('文件下载成功')},this)},
    saveToMyFiles(){if(!this.currentMarkdown)return;this.saveForm.userFname=`${this.selectedFile?.name?.replace(/\.[^/.]+$/,'')||'作文批改'}_作文批改`;this.saveForm.filePurpose='作文批改';this.saveDialogVisible=true},
    async confirmSave(){this.$refs.saveForm.validate(async(valid)=>{if(!valid)return;this.saving=true;try{const latest=this.isEditing?this.editingMarkdown:this.currentMarkdown;const docxBlob=await convertMarkdownToDocxBlob(latest);let knowledgeValue='';if(this.saveForm.knowledge&&this.saveForm.knowledge.length>0)knowledgeValue=Array.isArray(this.saveForm.knowledge)?this.saveForm.knowledge.join('/') : this.saveForm.knowledge;const formData=new FormData();formData.append('filePurpose',this.saveForm.filePurpose);formData.append('filePath',`/teacher/${this.saveForm.userFname}.docx`);formData.append('knowledge',knowledgeValue);formData.append('subjectName',this.saveForm.subjectName);formData.append('userFname',this.saveForm.userFname);formData.append('file',docxBlob,`${this.saveForm.userFname}.docx`);const response=await request({url:'/system/teacher/addFile',method:'post',data:formData,headers:{'Content-Type':'multipart/form-data'}});if(response.code===200){this.$message.success('保存成功');this.saveDialogVisible=false;this.resetSaveForm()}else{this.$message.error(response.msg||'保存失败')}}catch(e){this.$message.error('保存失败：'+(e.message||'网络错误'))}finally{this.saving=false}})},
    resetSaveForm(){this.saveForm={filePurpose:'作文批改',userFname:'',subjectName:'',knowledge:''}},
    loadHistoryFromStorage(){const h=localStorage.getItem('compositionHistory');this.historyList=h?JSON.parse(h):[]},
    saveToHistory(item){this.historyList.unshift(item);if(this.historyList.length>20)this.historyList=this.historyList.slice(0,20);localStorage.setItem('compositionHistory',JSON.stringify(this.historyList))},
    loadHistoryItem(item){if(!item||!item.markdown){this.$message.warning('历史记录数据不完整，无法加载');return}this.currentMarkdown=item.markdown;this.editingMarkdown=item.markdown;this.essayType=item.essayType||'chinese';this.$message.success('已加载历史记录')},
    deleteHistory(item){this.$confirm('确定要删除这条历史记录吗？','提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(()=>{const i=this.historyList.findIndex(h=>h.id===item.id);if(i>-1){this.historyList.splice(i,1);localStorage.setItem('compositionHistory',JSON.stringify(this.historyList));this.$message.success('删除成功')}})},
    loadSubjectList(){listSubject().then(r=>{this.subjectList=r.rows||[]}).catch(()=>{this.$message.error('获取课程数据失败')})},
    loadChapterList(){sysGetchaptermap().then(r=>{if(r.code===200)this.chapterOptions=r.data||[];else this.$message.error('获取章节列表失败：'+r.msg)}).catch(e=>{this.$message.error('获取章节列表失败：'+e.message)})},
    cancelGeneration(){try{if(this.cancelSource)this.cancelSource.cancel('canceled')}finally{this.generating=false;this.cancelSource=null;this.$message.closeAll();this.$message.info('已取消生成')}},
    handleEssayTypeChange(type){this.selectedFile=null;this.fileList=[];this.$message.info(`已切换作文类型为：${type==='chinese'?'中文作文':'英文作文'}`)},
    // 时间格式化
    formatTime(timeStr){return new Date(timeStr).toLocaleString()}
  }
}
</script>
<style scoped>
/* 复用教案样式 */
.page-header{margin-bottom:20px;padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 12px 0 rgba(0,0,0,0.1)}
.page-header h2{margin:0 0 10px 0;color:#303133;font-size:24px;font-weight:600}
.page-description{margin:0;color:#909399;font-size:14px}
.main-content{display:flex;gap:20px;height:calc(100vh - 200px)}
.left-panel{width:400px;flex-shrink:0;display:flex;flex-direction:column;gap:20px}
.right-panel{flex:1;display:flex;flex-direction:column;background:#fff;border-radius:8px;box-shadow:0 2px 12px 0 rgba(0,0,0,0.1)}
.upload-section,.history-section{background:#fff;border-radius:8px;padding:20px;box-shadow:0 2px 12px 0 rgba(0,0,0,0.1)}
.upload-section h3,.history-section h3{margin:0 0 15px 0;color:#303133;font-size:18px;font-weight:600}
.essay-type-section{margin-bottom:20px;padding:15px;background:#f8f9fa;border-radius:6px;border:1px solid #e4e7ed}
.essay-type-section h4{margin:0 0 10px 0;color:#303133;font-size:16px;font-weight:600}
.essay-type-section .el-radio-group{display:flex;gap:20px}
.essay-type-section .el-radio{font-size:14px;color:#606266}
.essay-type-section .el-radio__input.is-checked+.el-radio__label{color:#409eff}
.upload-area{margin-bottom:20px}
.action-section{margin-bottom:20px}
.history-list{max-height:300px;overflow-y:auto}
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
.markdown-preview h3{font-size:18px;color:#409eff;font-weight:600}
.markdown-preview p{margin-bottom:12px}
.markdown-preview strong{color:#409eff;font-weight:600}
.markdown-preview em{color:#67c23a;font-style:italic}
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
.markdown-preview blockquote{background:#f8f9fa;border-left:4px solid #409eff;padding:12px 16px;margin:15px 0;border-radius:0 6px 6px 0}
.markdown-preview blockquote p{margin:0;color:#606266}
.markdown-preview .score-highlight{background:linear-gradient(135deg,#67c23a,#85ce61);color:#fff;padding:4px 8px;border-radius:4px;font-weight:600;display:inline-block;margin:0 4px}
.markdown-preview .feedback-section{background:#f0f9ff;border:1px solid #b3d8ff;border-radius:8px;padding:16px;margin:15px 0}
.markdown-preview .original-essay{background:#fff7e6;border:1px solid #ffd591;border-radius:8px;padding:16px;margin:15px 0;font-style:italic}
.empty-state{display:flex;justify-content:center;align-items:center;height:100%;color:#909399}
.history-list::-webkit-scrollbar,.preview-content::-webkit-scrollbar{width:6px}
.history-list::-webkit-scrollbar-thumb,.preview-content::-webkit-scrollbar-thumb{background:#c0c4cc;border-radius:3px}
.history-list::-webkit-scrollbar-track,.preview-content::-webkit-scrollbar-track{background:#f5f7fa}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 200px);
  }
  
  .left-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .upload-section,
  .history-section {
    flex: 1;
    min-width: 300px;
  }
  
  .history-section {
    min-width: 100%;
    order: 2;
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
  .history-section {
    min-width: auto;
    padding: 15px;
  }
  
  .upload-section h3,
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
  .history-section {
    padding: 12px;
  }
  
  .upload-section h3,
  .history-section h3 {
    font-size: 15px;
    margin-bottom: 10px;
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
  
  .markdown-preview .original-essay {
    padding: 12px;
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
  
  .markdown-preview .original-essay {
    padding: 10px;
  }
}

</style>