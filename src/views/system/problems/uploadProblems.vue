<template>
  <div class="app-container">
    <el-card class="upload-card">
      <div slot="header" class="card-header">
        <span class="header-title">自定义题库</span>
        <span class="header-subtitle">上传文件生成题目</span>
      </div>
      
      <!-- 上传模式切换 -->
      <el-tabs v-model="uploadMode" type="card" @tab-click="handleModeChange">
        <el-tab-pane label="自动上传模式" name="auto">
          <div class="upload-section">
            <el-upload
              ref="upload"
              :action="uploadUrl"
              :headers="headers"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :on-change="handleFileChange"
              :file-list="fileList"
              :auto-upload="false"
              :limit="1"
              accept=".doc,.docx,.pdf,.txt"
              drag
              class="upload-area"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <div class="el-upload__tip" slot="tip">
                支持 .doc, .docx, .pdf, .txt 格式文件，文件大小不超过 5000MB
              </div>
            </el-upload>
            
            <!-- 生成题目按钮 -->
            <div class="generate-section" v-if="fileList.length > 0">
              <el-button 
                type="primary" 
                size="large" 
                icon="el-icon-magic-stick"
                :loading="generating"
                @click="generateProblems"
                class="generate-btn"
              >
                {{ generating ? '正在生成题目...' : '生成题目' }}
              </el-button>
              
              <!-- 测试按钮 -->
              <el-button 
                type="success" 
                size="large" 
                icon="el-icon-view"
                @click="loadTestData"
                class="test-btn"
                style="margin-left: 16px;"
              >
                加载测试数据
              </el-button>
              
              <!-- 历史记录按钮 -->
              <el-button 
                type="info" 
                size="large" 
                icon="el-icon-time"
                @click="openHistoryDialog"
                class="history-btn"
                style="margin-left: 16px;"
              >
                生成历史
              </el-button>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="手动上传模式" name="manual">
          <div class="manual-upload-section">
            <div class="manual-upload-header">
              <h3>手动添加题目</h3>
              <p class="upload-desc">通过表单填写题目信息，手动添加到题库中</p>
            </div>
            
            <!-- 手动添加题目表单 -->
                         <el-form 
               ref="manualForm" 
               :model="manualForm" 
               :rules="manualFormRules" 
               label-width="120px"
               class="manual-form"
             >
               <!-- 学科和题目类型并排 -->
               <el-row :gutter="20">
                 <el-col :span="12">
                   <el-form-item label="学科名称" prop="subject_name">
                     <el-select 
                       v-model="manualForm.subject_name" 
                       placeholder="请选择学科" 
                       style="width: 100%"
                       :disabled="subjectOptions.length === 1"
                       @change="handleSubjectChange"
                     >
                       <el-option 
                         v-for="option in subjectOptions" 
                         :key="option.gradeAndSubject"
                         :label="option.gradeAndSubject" 
                         :value="option.gradeAndSubject"
                       ></el-option>
                     </el-select>
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="题目类型" prop="qtype">
                     <el-select v-model="manualForm.qtype" placeholder="请选择题目类型" style="width: 100%">
                       <el-option label="选择题" value="选择题"></el-option>
                       <el-option label="多选题" value="多选题"></el-option>
                       <el-option label="填空题" value="填空题"></el-option>
                       <el-option label="判断题" value="判断题"></el-option>
                       <el-option label="阅读题" value="阅读题"></el-option>
                       <el-option label="解答题" value="解答题"></el-option>
                     </el-select>
                   </el-form-item>
                 </el-col>
               </el-row>
               
               <!-- 标签和难度并排 -->
               <el-row :gutter="20">
                 <el-col :span="12">
                   <el-form-item label="标签" prop="label">
                     <el-input v-model="manualForm.label" placeholder="请输入标签（选填）"></el-input>
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="难度" prop="degree">
                     <el-slider 
                       v-model="manualForm.degree" 
                       :min="0" 
                       :max="1" 
                       :step="0.1" 
                       show-input
                       :format-tooltip="formatDifficulty"
                       :reverse="true"
                     ></el-slider>
                   </el-form-item>
                 </el-col>
               </el-row>
               
                               <el-form-item label="题目内容" prop="question">
                  <div class="input-with-latex">
                    <div class="math-toolbar">
                      <div class="toolbar-section">
                        <span class="section-title">基础符号：</span>
                        <el-button size="mini" @click="insertSymbol('question', '+')">+</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '-')">−</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '×')">×</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '÷')">÷</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '=')">=</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '≠')">≠</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '≤')">≤</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '≥')">≥</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '≈')">≈</el-button>
                        <el-button size="mini" @click="insertSymbol('question', '±')">±</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">数学符号：</span>
                        <el-button size="mini" @click="insertLatex('question', 'x^2')">x²</el-button>
                        <el-button size="mini" @click="insertLatex('question', 'x^3')">x³</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\sqrt{x}')">√x</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\sqrt[3]{x}')">∛x</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\frac{a}{b}')">分数</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\sum_{i=1}^{n}')">求和</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\int_{a}^{b}')">积分</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\lim_{x \\to a}')">极限</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">希腊字母：</span>
                        <el-button size="mini" @click="insertLatex('question', '\\alpha')">α</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\beta')">β</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\gamma')">γ</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\delta')">δ</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\theta')">θ</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\pi')">π</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\sigma')">σ</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\omega')">ω</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\infty')">∞</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">集合符号：</span>
                        <el-button size="mini" @click="insertLatex('question', '\\in')">∈</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\notin')">∉</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\subset')">⊂</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\cup')">∪</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\cap')">∩</el-button>
                        <el-button size="mini" @click="insertLatex('question', '\\emptyset')">∅</el-button>
                      </div>
                    </div>
                    <el-input 
                      ref="questionInput"
                      type="textarea" 
                      v-model="manualForm.question" 
                      :rows="4" 
                      placeholder="请输入题目内容，支持 LaTeX 语法，如 $x^2 + y^2 = 1$"
                      maxlength="2000"
                      show-word-limit
                    ></el-input>
                  </div>
                </el-form-item>
              
                                            <!-- 选择题和多选题选项 -->
               <div v-if="manualForm.qtype === '选择题' || manualForm.qtype === '多选题'" class="options-section">
                 <el-form-item label="选项设置">
                   <div class="options-container">
                     <div 
                       v-for="(option, index) in manualForm.options" 
                       :key="index"
                       class="option-item"
                     >
                       <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                       <div class="input-with-latex" style="flex: 1; margin: 0 10px;">
                         <div class="math-toolbar">
                           <div class="toolbar-section">
                             <span class="section-title">基础符号：</span>
                             <el-button size="mini" @click="insertSymbolToOption(index, '+')">+</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '-')">−</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '×')">×</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '÷')">÷</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '=')">=</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '≠')">≠</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '≤')">≤</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '≥')">≥</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '≈')">≈</el-button>
                             <el-button size="mini" @click="insertSymbolToOption(index, '±')">±</el-button>
                           </div>
                           <div class="toolbar-section">
                             <span class="section-title">数学符号：</span>
                             <el-button size="mini" @click="insertLatexToOption(index, 'x^2')">x²</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, 'x^3')">x³</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\sqrt{x}')">√x</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\sqrt[3]{x}')">∛x</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\frac{a}{b}')">分数</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\sum_{i=1}^{n}')">求和</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\int_{a}^{b}')">积分</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\lim_{x \\to a}')">极限</el-button>
                           </div>
                           <div class="toolbar-section">
                             <span class="section-title">希腊字母：</span>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\alpha')">α</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\beta')">β</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\gamma')">γ</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\delta')">δ</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\theta')">θ</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\pi')">π</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\sigma')">σ</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\omega')">ω</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\infty')">∞</el-button>
                           </div>
                           <div class="toolbar-section">
                             <span class="section-title">集合符号：</span>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\in')">∈</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\notin')">∉</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\subset')">⊂</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\cup')">∪</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\cap')">∩</el-button>
                             <el-button size="mini" @click="insertLatexToOption(index, '\\emptyset')">∅</el-button>
                           </div>
                         </div>
                         <el-input 
                           :ref="`optionInput${index}`"
                           v-model="manualForm.options[index]" 
                           :placeholder="`选项${String.fromCharCode(65 + index)}`"
                         ></el-input>
                       </div>
                       <el-button 
                         type="danger" 
                         size="small" 
                         icon="el-icon-delete"
                         @click="removeOption(index)"
                         :disabled="manualForm.options.length <= 4"
                       ></el-button>
                     </div>
                     <el-button 
                       type="primary" 
                       size="small" 
                       icon="el-icon-plus"
                       @click="addOption"
                       style="margin-top: 10px;"
                     >
                       添加选项
                     </el-button>
                   </div>
                 </el-form-item>
               </div>
               
               <!-- 解答题子题目 -->
               <div v-if="manualForm.qtype === '解答题'" class="sub-questions-section">
                 <el-form-item label="子题目设置">
                   <div class="sub-questions-container">
                     <div 
                       v-for="(subQuestion, index) in manualForm.children" 
                       :key="index"
                       class="sub-question-item"
                     >
                       <span class="sub-question-label">{{ index + 1 }}.</span>
                                               <div class="input-with-latex" style="flex: 1; margin: 0 10px;">
                          <div class="math-toolbar">
                            <div class="toolbar-section">
                              <span class="section-title">基础符号：</span>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '+')">+</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '-')">−</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '×')">×</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '÷')">÷</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '=')">=</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '≠')">≠</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '≤')">≤</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '≥')">≥</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '≈')">≈</el-button>
                              <el-button size="mini" @click="insertSymbolToSubQuestion(index, '±')">±</el-button>
                            </div>
                            <div class="toolbar-section">
                              <span class="section-title">数学符号：</span>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, 'x^2')">x²</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, 'x^3')">x³</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\sqrt{x}')">√x</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\sqrt[3]{x}')">∛x</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\frac{a}{b}')">分数</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\sum_{i=1}^{n}')">求和</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\int_{a}^{b}')">积分</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\lim_{x \\to a}')">极限</el-button>
                            </div>
                            <div class="toolbar-section">
                              <span class="section-title">希腊字母：</span>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\alpha')">α</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\beta')">β</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\gamma')">γ</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\delta')">δ</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\theta')">θ</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\pi')">π</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\sigma')">σ</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\omega')">ω</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\infty')">∞</el-button>
                            </div>
                            <div class="toolbar-section">
                              <span class="section-title">集合符号：</span>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\in')">∈</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\notin')">∉</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\subset')">⊂</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\cup')">∪</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\cap')">∩</el-button>
                              <el-button size="mini" @click="insertLatexToSubQuestion(index, '\\emptyset')">∅</el-button>
                            </div>
                          </div>
                          <el-input 
                            :ref="`subQuestionInput${index}`"
                            v-model="manualForm.children[index]" 
                            :placeholder="`子题目${index + 1}，支持 LaTeX 语法`"
                          ></el-input>
                        </div>
                       <el-button 
                         type="danger" 
                         size="small" 
                         icon="el-icon-delete"
                         @click="removeSubQuestion(index)"
                       ></el-button>
                     </div>
                     <el-button 
                       type="primary" 
                       size="small" 
                       icon="el-icon-plus"
                       @click="addSubQuestion"
                       style="margin-top: 10px;"
                     >
                       添加子题目
                     </el-button>
                   </div>
                 </el-form-item>
               </div>
              
                                                                                          <!-- 答案独占一行 -->
               <el-form-item label="答案" prop="displayanswer">
                 <!-- 选择题和多选题使用选项选择 -->
                 <el-select 
                   v-if="manualForm.qtype === '选择题' || manualForm.qtype === '多选题'"
                   v-model="manualForm.displayanswer" 
                   :multiple="manualForm.qtype === '多选题'"
                   placeholder="请选择答案"
                   style="width: 100%"
                 >
                   <el-option 
                     v-for="(option, index) in manualForm.options" 
                     :key="index"
                     :label="`${String.fromCharCode(65 + index)}. ${option}`"
                     :value="String.fromCharCode(65 + index)"
                     :disabled="!option.trim()"
                   ></el-option>
                 </el-select>
                 <!-- 判断题使用对错选择 -->
                 <el-select 
                   v-else-if="manualForm.qtype === '判断题'"
                   v-model="manualForm.displayanswer" 
                   placeholder="请选择答案"
                   style="width: 100%"
                 >
                   <el-option label="对" value="对"></el-option>
                   <el-option label="错" value="错"></el-option>
                 </el-select>
                                   <!-- 其他题型使用文本输入 -->
                  <div class="input-with-latex">
                    <div class="math-toolbar">
                      <div class="toolbar-section">
                        <span class="section-title">基础符号：</span>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '+')">+</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '-')">−</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '×')">×</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '÷')">÷</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '=')">=</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '≠')">≠</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '≤')">≤</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '≥')">≥</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '≈')">≈</el-button>
                        <el-button size="mini" @click="insertSymbol('displayanswer', '±')">±</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">数学符号：</span>
                        <el-button size="mini" @click="insertLatex('displayanswer', 'x^2')">x²</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', 'x^3')">x³</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\sqrt{x}')">√x</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\sqrt[3]{x}')">∛x</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\frac{a}{b}')">分数</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\sum_{i=1}^{n}')">求和</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\int_{a}^{b}')">积分</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\lim_{x \\to a}')">极限</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">希腊字母：</span>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\alpha')">α</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\beta')">β</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\gamma')">γ</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\delta')">δ</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\theta')">θ</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\pi')">π</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\sigma')">σ</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\omega')">ω</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\infty')">∞</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">集合符号：</span>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\in')">∈</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\notin')">∉</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\subset')">⊂</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\cup')">∪</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\cap')">∩</el-button>
                        <el-button size="mini" @click="insertLatex('displayanswer', '\\emptyset')">∅</el-button>
                      </div>
                    </div>
                    <el-input 
                      ref="answerInput"
                      v-model="getDisplayAnswerString" 
                      placeholder="请输入答案，支持 LaTeX 语法，如 $x = 2$"
                      @input="handleDisplayAnswerInput"
                    ></el-input>
                  </div>
               </el-form-item>
              
                                             
               
                               <el-form-item label="关联章节" prop="path">
                  <el-cascader
                    v-model="manualForm.path"
                    :options="chapterOptions"
                    :props="chapterProps"
                    placeholder="请选择关联章节（必填）"
                    clearable
                    @change="handleChapterChange"
                    :show-all-levels="true"
                    style="width: 100%"
                  ></el-cascader>
                  <div class="form-tip">
                    <i class="tip-icon el-icon-info"></i>
                    建议选择到具体的章节节点，避免选择父级目录
                  </div>
                </el-form-item>
                
                                 <el-form-item label="关联知识点" prop="knowledge_name">
                   <el-cascader
                     v-model="manualForm.knowledge_name"
                     :options="knowledgeOptions"
                     :props="knowledgeProps"
                     placeholder="请选择关联知识点（选填）"
                     clearable
                     @change="handleKnowledgeChange"
                     :show-all-levels="true"
                     style="width: 100%"
                   ></el-cascader>
                   <div class="form-tip">
                     <i class="tip-icon el-icon-info"></i>
                     建议选择到具体的知识点节点，避免选择父级目录
                   </div>
                 </el-form-item>
              
                                                           <el-form-item label="解析" prop="parse">
                  <div class="input-with-latex">
                    <div class="math-toolbar">
                      <div class="toolbar-section">
                        <span class="section-title">基础符号：</span>
                        <el-button size="mini" @click="insertSymbol('parse', '+')">+</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '-')">−</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '×')">×</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '÷')">÷</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '=')">=</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '≠')">≠</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '≤')">≤</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '≥')">≥</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '≈')">≈</el-button>
                        <el-button size="mini" @click="insertSymbol('parse', '±')">±</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">数学符号：</span>
                        <el-button size="mini" @click="insertLatex('parse', 'x^2')">x²</el-button>
                        <el-button size="mini" @click="insertLatex('parse', 'x^3')">x³</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\sqrt{x}')">√x</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\sqrt[3]{x}')">∛x</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\frac{a}{b}')">分数</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\sum_{i=1}^{n}')">求和</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\int_{a}^{b}')">积分</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\lim_{x \\to a}')">极限</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">希腊字母：</span>
                        <el-button size="mini" @click="insertLatex('parse', '\\alpha')">α</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\beta')">β</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\gamma')">γ</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\delta')">δ</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\theta')">θ</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\pi')">π</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\sigma')">σ</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\omega')">ω</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\infty')">∞</el-button>
                      </div>
                      <div class="toolbar-section">
                        <span class="section-title">集合符号：</span>
                        <el-button size="mini" @click="insertLatex('parse', '\\in')">∈</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\notin')">∉</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\subset')">⊂</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\cup')">∪</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\cap')">∩</el-button>
                        <el-button size="mini" @click="insertLatex('parse', '\\emptyset')">∅</el-button>
                      </div>
                    </div>
                    <el-input 
                      ref="parseInput"
                      type="textarea" 
                      v-model="manualForm.parse" 
                      :rows="3" 
                      placeholder="请输入题目解析（必填），支持 LaTeX 语法，如 $x^2 + y^2 = 1$"
                      maxlength="1000"
                      show-word-limit
                    ></el-input>
                  </div>
                </el-form-item>
                
                <!-- 方法说明 -->
                <el-form-item label="方法说明" prop="method">
                  <el-input 
                    type="textarea" 
                    v-model="manualForm.method" 
                    :rows="2" 
                    placeholder="请输入解题方法说明（选填）"
                    maxlength="500"
                    show-word-limit
                  ></el-input>
                </el-form-item>
                
                <!-- 讨论 -->
                <el-form-item label="讨论" prop="discuss">
                  <el-input 
                    type="textarea" 
                    v-model="manualForm.discuss" 
                    :rows="2" 
                    placeholder="请输入题目讨论（选填）"
                    maxlength="500"
                    show-word-limit
                  ></el-input>
                </el-form-item>
                
                <!-- 分值 -->
                <el-form-item label="分值" prop="score">
                  <el-input-number 
                    v-model="manualForm.score" 
                    :min="1" 
                    :max="100" 
                    :step="1"
                    placeholder="请输入题目分值"
                    style="width: 200px;"
                  ></el-input-number>
                  <span style="margin-left: 10px; color: #909399;">分</span>
                </el-form-item>
              
              <!-- 操作按钮 -->
              <el-form-item>
                <el-button 
                  type="primary" 
                  size="large" 
                  icon="el-icon-plus"
                  @click="handleManualSave"
                  :loading="manualSaving"
                  class="manual-save-btn"
                >
                  {{ manualSaving ? '保存中...' : '保存题目' }}
                </el-button>
                <el-button 
                  size="large" 
                  icon="el-icon-refresh"
                  @click="resetManualForm"
                  class="reset-btn"
                >
                  重置表单
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 题目展示区域 -->
    <el-card v-if="problems.length > 0" class="problems-card">
      <div slot="header" class="card-header">
        <span class="header-title">生成的题目</span>
        <span class="problem-count">共 {{ problems.length }} 道题目</span>
      </div>
      
      <div class="problems-container">
        <div 
          v-for="(problem, index) in problems" 
          :key="index"
          class="problem-item"
        >
          <!-- 题目头部 -->
          <div class="problem-header">
            <div class="problem-number">
              <span class="number-badge">{{ index + 1 }}</span>
                             <span class="problem-type">{{ getProblemType(problem.qtype) }}</span>
            </div>
                         <div class="problem-meta">
               <el-tag size="small" type="info">难度: {{ getDifficultyText(problem.degree) }}</el-tag>
               <el-tag size="small" type="warning" v-if="problem.subject">{{ problem.subject }}</el-tag>
               <el-tag size="small" type="success" v-if="problem.catename">{{ problem.catename }}</el-tag>
             </div>
          </div>
          
          <!-- 题目内容 -->
          <div class="problem-content">
            <div class="question-text" v-html="parseContent(problem.question)"></div>
            
                         <!-- 选择题选项 -->
             <div v-if="problem.qtype === '选择题' && problem.options && problem.options.length > 0" class="options-container">
               <div 
                 v-for="(option, optIndex) in problem.options" 
                 :key="optIndex"
                 class="option-item"
               >
                 <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                 <span class="option-text" v-html="parseContent(option)"></span>
               </div>
             </div>
            
                         <!-- 答案 -->
             <div class="answer-section">
               <div class="answer-label">答案：</div>
               <div class="answer-content" v-html="parseContent(formatAnswers(problem.answers))"></div>
             </div>
             
             <!-- 解析 -->
             <div v-if="problem.parse" class="analysis-section">
               <div class="analysis-label">解析：</div>
               <div class="analysis-content" v-html="parseContent(problem.parse)"></div>
             </div>
             
                          <!-- 知识点标签 -->
             <div v-if="problem.topics && problem.topics.length > 0" class="topics-section">
               <div class="topics-label">知识点：</div>
               <div class="topics-content">
                 <el-tag 
                   v-for="topic in problem.topics" 
                   :key="topic"
                   size="small" 
                   type="info"
                   class="topic-tag"
                 >
                   {{ topic }}
                 </el-tag>
               </div>
             </div>
             
             <!-- 保存按钮 -->
             <div class="save-section">
               <el-button 
                 type="primary" 
                 size="small" 
                 icon="el-icon-download"
                 @click="openSaveDialog(problem)"
                 class="save-btn"
               >
                 保存题目
               </el-button>
             </div>
           </div>
         </div>
             </div>
     </el-card>
     
     <!-- 保存题目弹窗 -->
     <el-dialog
       title="保存题目到题库"
       :visible.sync="saveDialogVisible"
       width="600px"
       :close-on-click-modal="false"
     >
       <el-form :model="saveForm" label-width="120px" ref="saveForm">
         <el-form-item label="题目ID" prop="sid">
           <el-input v-model="saveForm.sid" placeholder="请输入题目ID"></el-input>
         </el-form-item>
         <el-form-item label="学科名称" prop="subject_name">
           <el-select v-model="saveForm.subject_name" placeholder="请选择学科">
             <el-option label="初中数学" value="初中数学"></el-option>
             <el-option label="高中数学" value="高中数学"></el-option>
             <el-option label="初中语文" value="初中语文"></el-option>
             <el-option label="高中语文" value="高中语文"></el-option>
             <el-option label="初中英语" value="初中英语"></el-option>
             <el-option label="高中英语" value="高中英语"></el-option>
           </el-select>
         </el-form-item>
         <el-form-item label="年级" prop="level">
           <el-select v-model="saveForm.level" placeholder="请选择年级">
             <el-option label="初中" value="middle"></el-option>
             <el-option label="高中" value="high"></el-option>
           </el-select>
         </el-form-item>
         <el-form-item label="题目内容" prop="question">
           <el-input type="textarea" v-model="saveForm.question" :rows="3" placeholder="题目内容"></el-input>
         </el-form-item>
         <el-form-item label="题目类型" prop="qtype">
           <el-select v-model="saveForm.qtype" placeholder="请选择题目类型">
             <el-option label="选择题" value="选择题"></el-option>
             <el-option label="填空题" value="填空题"></el-option>
             <el-option label="解答题" value="解答题"></el-option>
           </el-select>
         </el-form-item>
         <el-form-item label="学科代码" prop="subject_code">
           <el-input v-model="saveForm.subject_code" placeholder="请输入学科代码"></el-input>
         </el-form-item>
         <el-form-item label="分类" prop="cate">
           <el-input v-model="saveForm.cate" placeholder="请输入分类"></el-input>
         </el-form-item>
         <el-form-item label="分类名称" prop="catename">
           <el-input v-model="saveForm.catename" placeholder="请输入分类名称"></el-input>
         </el-form-item>
         <el-form-item label="标签" prop="label">
           <el-input v-model="saveForm.label" placeholder="请输入标签"></el-input>
         </el-form-item>
         <el-form-item label="知识点" prop="knowledge_name">
           <el-input v-model="saveForm.knowledge_name" placeholder="请输入知识点"></el-input>
         </el-form-item>
         <el-form-item label="路径" prop="path">
           <el-input v-model="saveForm.path" placeholder="请输入路径"></el-input>
         </el-form-item>
         <el-form-item label="答案" prop="answers">
           <el-input v-model="saveForm.displayanswer" placeholder="请输入答案"></el-input>
         </el-form-item>
         <el-form-item label="难度" prop="degree">
           <el-slider v-model="saveForm.degree" :min="0" :max="1" :step="0.1" show-input></el-slider>
         </el-form-item>
         <el-form-item label="主题" prop="topic">
           <el-input v-model="saveForm.topic" placeholder="请输入主题"></el-input>
         </el-form-item>
         <el-form-item label="解析" prop="analyse">
           <el-input type="textarea" v-model="saveForm.analyse" :rows="3" placeholder="请输入题目解析"></el-input>
         </el-form-item>
         <el-form-item label="方法说明" prop="method">
           <el-input type="textarea" v-model="saveForm.method" :rows="2" placeholder="请输入解题方法说明"></el-input>
         </el-form-item>
         <el-form-item label="讨论" prop="discuss">
           <el-input type="textarea" v-model="saveForm.discuss" :rows="2" placeholder="请输入题目讨论"></el-input>
         </el-form-item>
         <el-form-item label="分值" prop="score">
           <el-input-number v-model="saveForm.score" :min="1" :max="100" :step="1" placeholder="请输入题目分值"></el-input-number>
           <span style="margin-left: 10px; color: #909399;">分</span>
         </el-form-item>
       </el-form>
                <div slot="footer" class="dialog-footer">
           <el-button @click="saveDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="handleSaveProblem" :loading="saving">确 定</el-button>
         </div>
       </el-dialog>
       
       <!-- 生成历史弹窗 -->
       <el-dialog
         title="生成历史记录"
         :visible.sync="historyVisible"
         width="800px"
         :close-on-click-modal="false"
       >
         <div class="history-container">
           <el-table
             :data="historyList"
             v-loading="historyLoading"
             style="width: 100%"
             :header-cell-style="{ background: '#f5f7fa' }"
           >
             <el-table-column prop="fileName" label="文件名" min-width="120">
               <template slot-scope="scope">
                 <el-tooltip :content="scope.row.fileName" placement="top">
                   <span>{{ scope.row.fileName.length > 15 ? scope.row.fileName.substring(0, 15) + '...' : scope.row.fileName }}</span>
                 </el-tooltip>
               </template>
             </el-table-column>
             <el-table-column prop="questionCount" label="题目数量" width="100" align="center">
               <template slot-scope="scope">
                 <el-tag type="success">{{ scope.row.questionCount }} 道</el-tag>
               </template>
             </el-table-column>
             <el-table-column prop="generateTime" label="生成时间" width="180" align="center">
               <template slot-scope="scope">
                 {{ formatDateTime(scope.row.generateTime) }}
               </template>
             </el-table-column>
             <el-table-column prop="status" label="状态" width="100" align="center">
               <template slot-scope="scope">
                 <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                   {{ scope.row.status === 'success' ? '成功' : '失败' }}
                 </el-tag>
               </template>
             </el-table-column>
             <el-table-column label="操作" width="120" align="center">
               <template slot-scope="scope">
                 <el-button
                   size="mini"
                   type="text"
                   icon="el-icon-view"
                   @click="viewHistoryDetail(scope.row)"
                 >
                   查看详情
                 </el-button>
               </template>
             </el-table-column>
           </el-table>
           
           <!-- 分页 -->
           <div class="pagination-container">
             <el-pagination
               @size-change="handleHistorySizeChange"
               @current-change="handleHistoryCurrentChange"
               :current-page="historyQuery.pageNum"
               :page-sizes="[10, 20, 50, 100]"
               :page-size="historyQuery.pageSize"
               layout="total, sizes, prev, pager, next, jumper"
               :total="historyQuery.total"
             >
             </el-pagination>
           </div>
         </div>
       </el-dialog>
     </div>
   </template>

<script>
import { getToken } from '@/utils/auth'
import { generateProblems, saveProblem, saveGenerationHistory, getGenerationHistory } from '@/api/system/problems'
import { getChapterMap } from '@/api/system/chapterTitle'
import { sysGetchaptermap } from '@/api/system/knowledge'
import { listSubject } from '@/api/system/subject'

export default {
  name: 'UploadProblems',
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + '/system/teacher/ocr03', // OCR文件上传接口
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      fileList: [],
      generating: false,
      problems: [],
      saveDialogVisible: false,
      currentProblem: null,
      saveForm: {
        sid: '',
        subject_name: '',
        level: '',
        question: '',
        options: [],
        qtype: '',
        subject_code: '',
        cate: '',
        catename: '',
        label: '',
        points: [],
        knowledge_name: '',
        path: '',
        answers: [],
        displayanswer: '',
        degree: 0.5,
        topic: '',
        analyse: '',
        method: '',
        discuss: '',
        score: 100,
        is_chapter_exercise: false,
        children: []
      },
      saving: false,
      historyVisible: false,
      historyList: [],
      historyLoading: false,
      historyQuery: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
             // 新增：上传模式相关数据
       uploadMode: 'auto',
       manualSaving: false,
       // 章节选择相关数据
       chapterOptions: [],
       chapterProps: {
         label: 'label',
         value: 'value',
         children: 'children',
         checkStrictly: true,
         lazy: false,
         multiple: false,
         emitPath: true,
         expandTrigger: 'click'
       },
               // 知识点选择相关数据
        knowledgeOptions: [],
        knowledgeProps: {
          label: 'label',
          value: 'value',
          children: 'children',
          checkStrictly: true,
          lazy: false,
          multiple: false,
          emitPath: true,
          expandTrigger: 'click'
        },
        // 科目选择相关数据
        subjectOptions: [],
              manualForm: {
          sid: '',
          subject_name: '',
          level: '',
          question: '',
          options: ['', '', '', ''], // 默认四个选项
          qtype: '',
          subject_code: '', // 科目代码为空
          cate: '', // 分类代码为空
          catename: '', // 分类名称为空
          label: '', // 标签为用户选填
          knowledge_name: '',
          path: '', // 关联章节，必填
          answers: [],
          displayanswer: '',
          degree: 0.5,
          topic: '', // 主题为空
          parse: '',
          method: '', // 方法说明
          discuss: '', // 讨论
          score: 100, // 分值
          is_chapter_exercise: false,
          children: []
        },
                             manualFormRules: {
           subject_name: [
             { required: true, message: '请选择学科', trigger: 'change' }
           ],
           qtype: [
             { required: true, message: '请选择题目类型', trigger: 'change' }
           ],
           question: [
             { required: true, message: '请输入题目内容', trigger: 'blur' },
             { min: 5, message: '题目内容至少5个字符', trigger: 'blur' }
           ],
           displayanswer: [
             { required: true, message: '请输入答案', trigger: 'blur' }
           ],
           path: [
             { required: true, message: '请选择关联章节', trigger: 'change' }
           ],
           parse: [
             { required: true, message: '请输入题目解析', trigger: 'blur' }
           ]
         }
         }
   },
       created() {
      // 预加载章节、知识点和科目数据
      this.loadChapterList()
      this.loadKnowledgeList()
      this.loadSubjectList()
    },
      watch: {
           // 监听题目类型变化，重置选项
      'manualForm.qtype'(newType) {
        if (newType === '选择题' || newType === '多选题') {
          if (this.manualForm.options.length < 4) {
            this.manualForm.options = ['', '', '', '']
          }
          // 清空答案，让用户重新选择
          this.manualForm.displayanswer = newType === '多选题' ? [] : ''
          // 清空子题目
          this.manualForm.children = []
        } else if (newType === '判断题') {
          this.manualForm.options = []
          // 清空答案，让用户重新选择
          this.manualForm.displayanswer = ''
          // 清空子题目
          this.manualForm.children = []
        } else if (newType === '解答题') {
          this.manualForm.options = []
          // 清空答案
          this.manualForm.displayanswer = ''
          // 清空子题目数组，不初始化
          this.manualForm.children = []
        } else {
          this.manualForm.options = []
          // 清空答案
          this.manualForm.displayanswer = ''
          // 清空子题目
          this.manualForm.children = []
        }
      }
   },
  computed: {
    // 获取答案的字符串表示，用于输入框显示
    getDisplayAnswerString() {
      if (Array.isArray(this.manualForm.displayanswer)) {
        return this.manualForm.displayanswer.join('、')
      }
      return this.manualForm.displayanswer || ''
    }
  },
  methods: {
               // 模式切换处理
      handleModeChange(tab) {
        console.log('切换到模式:', tab.name)
        if (tab.name === 'manual') {
          this.resetManualForm()
          // 加载章节、知识点和科目数据
          this.loadChapterList()
          this.loadKnowledgeList()
          this.loadSubjectList()
        }
      },
     
           // 加载章节列表
      loadChapterList() {
        getChapterMap().then(response => {
          console.log('章节列表API响应:', response)
          if (response && response.code === 200) {
            this.chapterOptions = response.data || []
          } else if (response && response.data) {
            this.chapterOptions = response.data
          } else if (Array.isArray(response)) {
            this.chapterOptions = response
          } else {
            this.chapterOptions = []
          }
          console.log('处理后的章节选项:', this.chapterOptions)
        }).catch(error => {
          console.error('获取章节列表失败:', error)
          this.$message.error('获取章节列表失败：' + (error.message || '网络错误'))
          this.chapterOptions = []
        })
             },
      
            // 加载知识点列表
       loadKnowledgeList() {
         sysGetchaptermap().then(response => {
           console.log('知识点列表API响应:', response)
           if (response && response.code === 200) {
             this.knowledgeOptions = response.data || []
           } else if (response && response.data) {
             this.knowledgeOptions = response.data
           } else if (Array.isArray(response)) {
             this.knowledgeOptions = response
           } else {
             this.knowledgeOptions = []
           }
           console.log('处理后的知识点选项:', this.knowledgeOptions)
         }).catch(error => {
           console.error('获取知识点列表失败:', error)
           this.$message.error('获取知识点列表失败：' + (error.message || '网络错误'))
           this.knowledgeOptions = []
         })
       },
       
               // 加载科目列表
        loadSubjectList() {
          listSubject().then(response => {
            console.log('科目列表API响应:', response)
            // listSubject 返回格式可能是 { rows: [...] } 或 { data: [...] }
            const subjects = response.rows || response.data || []
            this.subjectOptions = subjects.map(subject => ({
              ...subject,
              gradeAndSubject: subject.subjectName || (subject.grade ? subject.grade + subject.subjectName : '')
            }))
            
            // 如果只有一个科目，自动选择并禁用选择框，同时设置年级
            if (this.subjectOptions.length === 1) {
              this.manualForm.subject_name = this.subjectOptions[0].gradeAndSubject || this.subjectOptions[0].subjectName
              this.handleSubjectChange(this.manualForm.subject_name)
            }
            console.log('处理后的科目选项:', this.subjectOptions)
          }).catch(error => {
            console.error('获取科目列表失败:', error)
            this.$message.error('获取科目列表失败：' + (error.message || '网络错误'))
            this.subjectOptions = []
          })
        },
     
     // 处理章节选择变化
     handleChapterChange(value) {
       console.log('选择的章节:', value)
       if (value && value.length > 0) {
         // 构建章节路径
         const path = this.buildChapterPath(value)
         this.manualForm.path = path
         console.log('构建的章节路径:', path)
       } else {
         this.manualForm.path = ''
       }
     },
     
           // 处理学科选择变化
      handleSubjectChange(value) {
        console.log('选择的学科:', value)
        if (value) {
          // 提取学科名称的前两个字来判断年级
          const grade = value.substring(0, 2)
          if (grade === '初中') {
            this.manualForm.level = 'middle'
          } else if (grade === '高中') {
            this.manualForm.level = 'high'
          } else {
            // 默认值
            this.manualForm.level = 'middle'
          }
          console.log('自动设置的年级:', this.manualForm.level)
        }
      },
      
      // 处理知识点选择变化
      handleKnowledgeChange(value) {
        console.log('选择的知识点:', value)
        if (value && value.length > 0) {
          // 构建知识点路径
          const path = this.buildKnowledgePath(value)
          this.manualForm.knowledge_name = path
          console.log('构建的知识点路径:', path)
        } else {
          this.manualForm.knowledge_name = ''
        }
      },
      
      // 处理答案输入框的输入事件
      handleDisplayAnswerInput(value) {
        // 当题目类型不是选择题或多选题时，直接设置字符串值
        if (this.manualForm.qtype !== '选择题' && this.manualForm.qtype !== '多选题') {
          this.manualForm.displayanswer = value
        }
      },
     
     // 构建章节路径
     buildChapterPath(selectedValues) {
       if (!selectedValues || selectedValues.length === 0) return ''
       
       const pathParts = []
       let currentOptions = this.chapterOptions
       
       for (const value of selectedValues) {
         const findNode = (options) => {
           for (const option of options) {
             if (option.value === value) {
               pathParts.push(option.label)
               return option.children
             }
             if (option.children) {
               const result = findNode(option.children)
               if (result !== null) return result
             }
           }
           return null
         }
         
         currentOptions = findNode(currentOptions)
         if (!currentOptions) break
       }
       
       return pathParts.join('/')
     },
     
     // 构建知识点路径
     buildKnowledgePath(selectedValues) {
       if (!selectedValues || selectedValues.length === 0) return ''
       
       const pathParts = []
       let currentOptions = this.knowledgeOptions
       
       for (const value of selectedValues) {
         const findNode = (options) => {
           for (const option of options) {
             if (option.value === value) {
               pathParts.push(option.label)
               return option.children
             }
             if (option.children) {
               const result = findNode(option.children)
               if (result !== null) return result
             }
           }
           return null
         }
         
         currentOptions = findNode(currentOptions)
         if (!currentOptions) break
       }
       
       return pathParts.join('/')
     },
    
         // 格式化难度显示
     formatDifficulty(val) {
       if (val >= 0.7) return '简单'
       if (val >= 0.3) return '中等'
       return '困难'
     },
    
    // 添加选项
    addOption() {
      if (this.manualForm.options.length < 8) {
        this.manualForm.options.push('')
      } else {
        this.$message.warning('最多只能添加8个选项')
      }
    },
    
         // 删除选项
     removeOption(index) {
       if (this.manualForm.options.length > 4) {
         this.manualForm.options.splice(index, 1)
       }
     },
     
     // 添加子题目
     addSubQuestion() {
       if (this.manualForm.children.length < 10) {
         this.manualForm.children.push('')
       } else {
         this.$message.warning('最多只能添加10个子题目')
       }
     },
     
     // 删除子题目
     removeSubQuestion(index) {
       if (this.manualForm.children.length > 1) {
         this.manualForm.children.splice(index, 1)
       }
     },
     
     // 插入 LaTeX 到指定字段
     insertLatex(field, latex) {
       const inputRef = this.$refs[field + 'Input']
       if (inputRef && inputRef.$el) {
         const textarea = inputRef.$el.querySelector('textarea') || inputRef.$el.querySelector('input')
         if (textarea) {
           const start = textarea.selectionStart
           const end = textarea.selectionEnd
           let value = this.manualForm[field]
           
           // 如果是数组，转换为字符串
           if (Array.isArray(value)) {
             value = value.join('、')
           }
           
           // 插入带美元符号的 LaTeX 语法
           const latexWithDollars = `$${latex}$`
           const newValue = value.substring(0, start) + latexWithDollars + value.substring(end)
           
           // 根据题目类型设置值
           if (field === 'displayanswer' && (this.manualForm.qtype === '选择题' || this.manualForm.qtype === '多选题')) {
             // 选择题和多选题保持数组格式
             this.manualForm[field] = [newValue]
           } else {
             this.manualForm[field] = newValue
           }
           
           // 设置光标位置到 LaTeX 内部
           this.$nextTick(() => {
             textarea.focus()
             const newPosition = start + 1 // 光标放在第一个 $ 后面
             textarea.setSelectionRange(newPosition, newPosition)
           })
         }
       }
     },
     
     // 插入 LaTeX 到子题目
     insertLatexToSubQuestion(index, latex) {
       const inputRef = this.$refs[`subQuestionInput${index}`]
       if (inputRef && inputRef.$el) {
         const textarea = inputRef.$el.querySelector('textarea') || inputRef.$el.querySelector('input')
         if (textarea) {
           const start = textarea.selectionStart
           const end = textarea.selectionEnd
           const value = this.manualForm.children[index]
           
           // 插入带美元符号的 LaTeX 语法
           const latexWithDollars = `$${latex}$`
           this.manualForm.children[index] = value.substring(0, start) + latexWithDollars + value.substring(end)
           
           // 设置光标位置到 LaTeX 内部
           this.$nextTick(() => {
             textarea.focus()
             const newPosition = start + 1 // 光标放在第一个 $ 后面
             textarea.setSelectionRange(newPosition, newPosition)
           })
         }
       }
     },
     
     // 插入普通符号到指定字段
     insertSymbol(field, symbol) {
       const inputRef = this.$refs[field + 'Input']
       if (inputRef && inputRef.$el) {
         const textarea = inputRef.$el.querySelector('textarea') || inputRef.$el.querySelector('input')
         if (textarea) {
           const start = textarea.selectionStart
           const end = textarea.selectionEnd
           let value = this.manualForm[field]
           
           // 如果是数组，转换为字符串
           if (Array.isArray(value)) {
             value = value.join('、')
           }
           
           // 直接插入符号
           const newValue = value.substring(0, start) + symbol + value.substring(end)
           
           // 根据题目类型设置值
           if (field === 'displayanswer' && (this.manualForm.qtype === '选择题' || this.manualForm.qtype === '多选题')) {
             // 选择题和多选题保持数组格式
             this.manualForm[field] = [newValue]
           } else {
             this.manualForm[field] = newValue
           }
           
           // 设置光标位置到符号后面
           this.$nextTick(() => {
             textarea.focus()
             const newPosition = start + symbol.length
             textarea.setSelectionRange(newPosition, newPosition)
           })
         }
       }
     },
     
     // 插入普通符号到子题目
     insertSymbolToSubQuestion(index, symbol) {
       const inputRef = this.$refs[`subQuestionInput${index}`]
       if (inputRef && inputRef.$el) {
         const textarea = inputRef.$el.querySelector('textarea') || inputRef.$el.querySelector('input')
         if (textarea) {
           const start = textarea.selectionStart
           const end = textarea.selectionEnd
           const value = this.manualForm.children[index]
           
           // 直接插入符号
           this.manualForm.children[index] = value.substring(0, start) + symbol + value.substring(end)
           
           // 设置光标位置到符号后面
           this.$nextTick(() => {
             textarea.focus()
             const newPosition = start + symbol.length
             textarea.setSelectionRange(newPosition, newPosition)
           })
         }
       }
     },
     
     // 插入 LaTeX 到选择题选项
     insertLatexToOption(index, latex) {
       const inputRef = this.$refs[`optionInput${index}`]
       if (inputRef && inputRef.$el) {
         const textarea = inputRef.$el.querySelector('input')
         if (textarea) {
           const start = textarea.selectionStart
           const end = textarea.selectionEnd
           const value = this.manualForm.options[index]
           
           // 插入带美元符号的 LaTeX 语法
           const latexWithDollars = `$${latex}$`
           this.manualForm.options[index] = value.substring(0, start) + latexWithDollars + value.substring(end)
           
           // 设置光标位置到 LaTeX 内部
           this.$nextTick(() => {
             textarea.focus()
             const newPosition = start + 1 // 光标放在第一个 $ 后面
             textarea.setSelectionRange(newPosition, newPosition)
           })
         }
       }
     },
     
     // 插入普通符号到选择题选项
     insertSymbolToOption(index, symbol) {
       const inputRef = this.$refs[`optionInput${index}`]
       if (inputRef && inputRef.$el) {
         const textarea = inputRef.$el.querySelector('input')
         if (textarea) {
           const start = textarea.selectionStart
           const end = textarea.selectionEnd
           const value = this.manualForm.options[index]
           
           // 直接插入符号
           this.manualForm.options[index] = value.substring(0, start) + symbol + value.substring(end)
           
           // 设置光标位置到符号后面
           this.$nextTick(() => {
             textarea.focus()
             const newPosition = start + symbol.length
             textarea.setSelectionRange(newPosition, newPosition)
           })
         }
       }
     },
    
                   // 重置手动表单
      resetManualForm() {
        this.manualForm = {
          sid: '',
          subject_name: '',
          level: '',
          question: '',
          options: ['', '', '', ''], // 默认四个选项
          qtype: '',
          subject_code: '', // 科目代码为空
          cate: '', // 分类代码为空
          catename: '', // 分类名称为空
          label: '', // 标签为用户选填
          knowledge_name: '',
          path: '', // 清空关联章节，让用户重新选择
          answers: [],
          displayanswer: '',
          degree: 0.5,
          topic: '', // 主题为空
          parse: '',
          method: '', // 方法说明
          discuss: '', // 讨论
          score: 100, // 分值
          is_chapter_exercise: false,
          children: [] // 子题目数组
        }
       
               // 如果只有一个科目，自动选择并设置年级
        if (this.subjectOptions.length === 1) {
          this.manualForm.subject_name = this.subjectOptions[0].gradeAndSubject
          this.handleSubjectChange(this.manualForm.subject_name)
        }
       
       this.$nextTick(() => {
         this.$refs.manualForm && this.$refs.manualForm.clearValidate()
       })
     },
    
         // 手动保存题目
     async handleManualSave() {
       this.$refs.manualForm.validate(async (valid) => {
         if (valid) {
           this.manualSaving = true
           try {
             // 处理选择题和多选题选项
             if (this.manualForm.qtype === '选择题' || this.manualForm.qtype === '多选题') {
               // 过滤空选项
               this.manualForm.options = this.manualForm.options.filter(option => option.trim() !== '')
               if (this.manualForm.options.length < 4) {
                 this.$message.warning('选择题和多选题至少需要4个选项')
                 this.manualSaving = false
                 return
               }
             }
             
             // 处理解答题子题目
             if (this.manualForm.qtype === '解答题') {
               // 过滤空子题目
               this.manualForm.children = this.manualForm.children.filter(child => child.trim() !== '')
               if (this.manualForm.children.length === 0) {
                 this.$message.warning('解答题至少需要1个子题目')
                 this.manualSaving = false
                 return
               }
             }
             
             // 自动生成题目ID
             this.manualForm.sid = this.generateSid()
             
             // 构建符合后端格式的数据
             const saveData = {
               sid: this.manualForm.sid,
               subject_name: this.manualForm.subject_name,
               level: this.manualForm.level,
               question: this.manualForm.question,
               options: this.manualForm.options || [],
               qtype: this.manualForm.qtype,
               subject_code: this.manualForm.subject_code || "20",
               cate: this.manualForm.cate || "1",
               catename: this.manualForm.catename || this.manualForm.qtype,
               label: this.manualForm.label || "",
               points: [],
               knowledge_name: this.manualForm.knowledge_name || "",
               path: this.manualForm.path || "custom/problems",
               answers: [],
               displayanswer: "",
               degree: this.manualForm.degree || 0.5,
               topic: [],
               is_chapter_exercise: false,
               children: this.manualForm.children || [],
               Analyse: this.manualForm.parse || "",
               Method: this.manualForm.method || "",
               Discuss: this.manualForm.discuss || "",
               Score: this.manualForm.score ? this.manualForm.score.toString() : "100"
             }
             
             // 处理答案格式
             if (this.manualForm.qtype === '选择题' || this.manualForm.qtype === '多选题') {
               if (Array.isArray(this.manualForm.displayanswer)) {
                 // 多选题：数组格式
                 saveData.answers = this.manualForm.displayanswer
                 saveData.displayanswer = this.manualForm.displayanswer.join('、')
               } else {
                 // 单选题：字符串格式
                 saveData.answers = [this.manualForm.displayanswer]
                 saveData.displayanswer = this.manualForm.displayanswer
               }
             } else {
               // 其他题型：确保答案是字符串格式
               let answer = this.manualForm.displayanswer
               if (Array.isArray(answer)) {
                 answer = answer.join('、')
               }
               saveData.answers = [answer]
               saveData.displayanswer = answer
             }
             
             // 处理知识点
             if (this.manualForm.knowledge_name) {
               saveData.topic = [this.manualForm.knowledge_name]
             }
             
             console.log('手动保存题目数据:', saveData)
             
             // 调用真实的保存接口
             const response = await saveProblem(saveData)
             if (response.success || response.code === 200) {
               this.$message.success('题目保存成功！')
               this.resetManualForm()
             } else {
               this.$message.error(response.message || response.msg || '保存失败')
             }
             
           } catch (error) {
             console.error('手动保存题目错误:', error)
             this.$message.error('保存题目失败，请稍后重试')
           } finally {
             this.manualSaving = false
           }
         } else {
           this.$message.warning('请完善必填信息')
         }
       })
     },
    
    // 上传前检查
    beforeUpload(file) {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 5000

      if (!isValidType) {
        this.$message.error('只能上传 Word、PDF 或 TXT 格式的文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 5000MB!')
        return false
      }
      return true
    },

    // 上传成功
    handleUploadSuccess(response, file, fileList) {
      this.$message.success('文件上传成功')
      this.fileList = fileList
    },

    // 文件选择变化
    handleFileChange(file, fileList) {
      this.fileList = fileList
      console.log('文件列表更新:', fileList)
    },

    // 上传失败
    handleUploadError(err, file, fileList) {
      this.$message.error('文件上传失败')
      console.error('上传错误:', err)
    },

    // 生成题目
    async generateProblems() {
      if (this.fileList.length === 0) {
        this.$message.warning('请先上传文件')
        return
      }

      this.generating = true
      try {
        // 创建FormData对象，按照OCR接口要求传递文件
        const formData = new FormData()
        const file = this.fileList[0].raw || this.fileList[0]
        formData.append('file', file)

        // 调用OCR接口生成题目
        const response = await generateProblems(formData)

        console.log('OCR接口响应:', response)
        
                 if (response.success || response.code === 200) {
           // 根据OCR接口的返回格式处理数据
           this.problems = response.data?.json_data || response.results?.json_data || []
           this.$message.success(`成功生成 ${this.problems.length} 道题目`)
           
           // 保存生成历史
           this.saveHistoryRecord(true, this.problems.length)
         } else {
           this.$message.error(response.message || response.msg || '生成题目失败')
           // 保存失败历史
           this.saveHistoryRecord(false, 0)
         }
             } catch (error) {
         console.error('生成题目错误:', error)
         this.$message.error('生成题目失败，请稍后重试')
         // 保存失败历史
         this.saveHistoryRecord(false, 0)
       } finally {
         this.generating = false
       }
     },

     // 保存生成历史到本地存储
     saveHistoryRecord(success, questionCount) {
       const historyRecord = {
         id: Date.now(),
         fileName: this.fileList[0]?.name || '未知文件',
         questionCount: questionCount,
         generateTime: new Date().toISOString(),
         status: success ? 'success' : 'failed',
         problems: success ? this.problems : []
       }
       
       // 获取现有历史记录
       const existingHistory = JSON.parse(localStorage.getItem('problemGenerationHistory') || '[]')
       
       // 添加新记录到开头
       existingHistory.unshift(historyRecord)
       
       // 只保留最近50条记录
       if (existingHistory.length > 50) {
         existingHistory.splice(50)
       }
       
       // 保存到本地存储
       localStorage.setItem('problemGenerationHistory', JSON.stringify(existingHistory))
     },

     // 打开历史记录弹窗
     openHistoryDialog() {
       this.historyVisible = true
       this.loadHistoryData()
     },

     // 加载历史数据
     loadHistoryData() {
       this.historyLoading = true
       
       // 从本地存储获取历史记录
       const allHistory = JSON.parse(localStorage.getItem('problemGenerationHistory') || '[]')
       
       // 计算分页
       const start = (this.historyQuery.pageNum - 1) * this.historyQuery.pageSize
       const end = start + this.historyQuery.pageSize
       
       this.historyList = allHistory.slice(start, end)
       this.historyQuery.total = allHistory.length
       
       this.historyLoading = false
     },

     // 分页大小改变
     handleHistorySizeChange(size) {
       this.historyQuery.pageSize = size
       this.historyQuery.pageNum = 1
       this.loadHistoryData()
     },

     // 当前页改变
     handleHistoryCurrentChange(page) {
       this.historyQuery.pageNum = page
       this.loadHistoryData()
     },

     // 查看历史详情
     viewHistoryDetail(record) {
       if (record.problems && record.problems.length > 0) {
         this.problems = record.problems
         this.historyVisible = false
         this.$message.success(`已加载 ${record.problems.length} 道题目`)
       } else {
         this.$message.warning('该记录没有保存题目数据')
       }
     },

     // 格式化日期时间
     formatDateTime(dateString) {
       const date = new Date(dateString)
       return date.toLocaleString('zh-CN', {
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit'
       })
     },

    // 获取题目类型显示文本
    getProblemType(qtype) {
      const typeMap = {
        '选择题': '选择题',
        '填空题': '填空题',
        '解答题': '解答题',
        'choice': '选择题',
        'multiple': '多选题',
        'fill': '填空题',
        'essay': '简答题',
        'calculation': '计算题'
      }
      return typeMap[qtype] || '未知类型'
    },

    // 解析内容（处理HTML实体和数学公式）
    parseContent(content) {
      if (!content) return ''
      
      // 解码HTML实体
      let decoded = this.decodeHtmlEntities(content)
      
      // 处理数学公式（如果有的话）
      decoded = this.parseMathFormula(decoded)
      
      return decoded
    },

    // 解码HTML实体
    decodeHtmlEntities(text) {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = text
      return textarea.value
    },

    // 解析数学公式
    parseMathFormula(text) {
      if (!text) return text
      
      // 简单的 LaTeX 公式处理
      // 将 $...$ 格式的公式转换为更友好的显示
      return text.replace(/\$([^$]+)\$/g, (match, formula) => {
        // 这里可以集成 MathJax 或 KaTeX 来渲染数学公式
        // 目前先用简单的样式处理
        return `<span class="math-formula">${formula}</span>`
      })
    },

         // 获取难度文本
     getDifficultyText(degree) {
       if (degree >= 0.7) return '简单'
       if (degree >= 0.3) return '中等'
       return '困难'
     },

    // 格式化答案
    formatAnswers(answers) {
      if (!answers || !Array.isArray(answers)) return '暂无答案'
      return answers.join('、')
    },

    // 加载测试数据
    loadTestData() {
      const testData = {
        "success": true,
        "message": "文档解析和转换成功完成！",
        "results": {
          "directory_url": "/static/abc_20250808161608",
          "markdown_url": "/static/abc_20250808161608/abc_20250808161608.md",
          "json_url": "/static/abc_20250808161608/abc_20250808161608.json",
          "images_url": "/static/abc_20250808161608/images",
          "image_count": 1,
          "question_count": 22,
          "json_data": [
            {
              "question": "1．（2023·鼓楼区校级开学）下列方程是二元一次方程的是（ ）",
              "options": [
                "A. $x^{2}-2\\pi=0$",
                "B. $x+2y=1$",
                "C. $x-y+z=0$",
                "D. $2x-3=4+x$"
              ],
              "qtype": "选择题",
              "sid": "",
              "subject": "数学",
              "cate": 1,
              "catename": "单项选择题",
              "label": "（2023·鼓楼区校级开学）",
              "topics": [
                "二元一次方程",
                "方程定义",
                "变量数量"
              ],
              "answers": [
                "B"
              ],
              "displayanswer": "",
              "degree": 0.5,
              "children": [],
              "parse": "<p><strong>【分析】</strong>含有两个未知数，并且含有未知数的项的次数都为１的方程即为二元一次方程，据此进行判断 即可．</p><p><strong>【解答】</strong>解：A．x^{2}-2\\pi=0是一元二次方程，故本选项不符合题意； B．x+2y=1，符合二元一次方程的定义，故本选项符合题意； C．x-y+z=0，含有三个未知数，不是二元一次方程，故本选项不符合题意； D．2x-3=4+x是一元一次方程，故本选项不符合题意． 故选：B．</p><p><strong>【点评】</strong>本题考查二元一次方程的定义，熟练掌握并理解其定义是解题的关键．</p>"
            },
            {
              "question": "6．若 $ax-3y=12+6x$ 是二元一次方程，则a________．",
              "options": [],
              "qtype": "填空题",
              "sid": "",
              "subject": "数学",
              "cate": 2,
              "catename": "填空题",
              "label": "",
              "topics": [
                "二元一次方程",
                "方程的定义"
              ],
              "answers": [
                "≠6"
              ],
              "displayanswer": "",
              "degree": 0.5,
              "children": [],
              "parse": "<p>根据等式中含有两个未知数，且未知数的次数是一次的方程是二元一次方程，可得答案。</p><p>解：方程 $ax-3y=12+6x$ 是二元一次方程，$a-6\\neq6$，$a\\neq6$，故答案为：$\\neq6$。</p><p>本题考查了二元一次方程，注意未知数的系数不能为0。</p>"
            },
            {
              "question": "9．若方程 $2x^{2a-1}+y^{b-2}=1$ 是二元一次方程，求 $a+b$ 的值．",
              "options": [],
              "qtype": "解答题",
              "sid": "",
              "subject": "数学",
              "cate": 9,
              "catename": "解答题",
              "label": "",
              "topics": [
                "二元一次方程",
                "指数运算",
                "方程条件分析"
              ],
              "answers": [],
              "displayanswer": "",
              "degree": 0.5,
              "children": [],
              "parse": "<p>由二元一次方程的定义可得出关于a和b的方程求出a、b的值，代入计算即可。</p><p>解：由二元一次方程的定义可得2a-1=1，b-2=1， 解得a=1，b=3， 所以a+b=4.</p><p>本题主要考查二元一次方程的定义，即含有两个未知数，且未知含的次数为１的方程。</p>"
            }
          ]
        }
      }
      
             this.problems = testData.results.json_data
       this.$message.success(`成功加载 ${this.problems.length} 道测试题目`)
     },

     // 打开保存弹窗
     openSaveDialog(problem) {
       this.currentProblem = problem
       this.saveDialogVisible = true
       
       // 预填充表单数据
       this.saveForm = {
         sid: this.generateSid(),
         subject_name: problem.subject || '高中数学',
         level: 'high',
         question: problem.question || '',
         options: problem.options || [],
         qtype: problem.qtype || '选择题',
         subject_code: '20',
         cate: problem.cate || '1',
         catename: problem.catename || '选择题',
         label: problem.label || '',
         points: [],
         knowledge_name: problem.topics ? problem.topics.join(',') : '',
         path: 'custom/problems',
         answers: problem.answers || [],
         displayanswer: this.formatAnswers(problem.answers),
         degree: problem.degree || 0.5,
         topic: problem.topics ? problem.topics[0] : '基础数学',
         analyse: problem.parse || '',
         method: '',
         discuss: '',
         score: 100,
         is_chapter_exercise: false,
         children: []
       }
     },

           // 生成题目ID - 格式：日期+时间+6位随机字符
      generateSid() {
        const now = new Date()
        const dateStr = now.getFullYear().toString() + 
                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                       now.getDate().toString().padStart(2, '0')
        const timeStr = now.getHours().toString().padStart(2, '0') + 
                       now.getMinutes().toString().padStart(2, '0') + 
                       now.getSeconds().toString().padStart(2, '0')
        const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase()
        return dateStr + timeStr + randomStr
      },

     // 保存题目
     async handleSaveProblem() {
       this.saving = true
       try {
         // 构建符合后端格式的数据
         const saveData = {
           sid: this.saveForm.sid,
           subject_name: this.saveForm.subject_name,
           level: this.saveForm.level,
           question: this.saveForm.question,
           options: this.saveForm.options || [],
           qtype: this.saveForm.qtype,
           subject_code: this.saveForm.subject_code || "20",
           cate: this.saveForm.cate || "1",
           catename: this.saveForm.catename || this.saveForm.qtype,
           label: this.saveForm.label || "",
           points: [],
           knowledge_name: this.saveForm.knowledge_name || "",
           path: this.saveForm.path || "custom/problems",
           answers: [],
           displayanswer: "",
           degree: this.saveForm.degree || 0.5,
           topic: [],
           is_chapter_exercise: false,
           children: this.saveForm.children || [],
           Analyse: this.saveForm.analyse || "",
           Method: this.saveForm.method || "",
           Discuss: this.saveForm.discuss || "",
           Score: this.saveForm.score ? this.saveForm.score.toString() : "100"
         }
         
         // 处理答案格式
         if (this.saveForm.displayanswer) {
           if (Array.isArray(this.saveForm.displayanswer)) {
             saveData.answers = this.saveForm.displayanswer
             saveData.displayanswer = this.saveForm.displayanswer.join('、')
           } else {
             saveData.answers = [this.saveForm.displayanswer]
             saveData.displayanswer = this.saveForm.displayanswer
           }
         }
         
         // 处理知识点
         if (this.saveForm.knowledge_name) {
           saveData.topic = [this.saveForm.knowledge_name]
         }
         
         console.log('保存题目数据:', saveData)
         
         const response = await saveProblem(saveData)
         if (response.success || response.code === 200) {
           this.$message.success('题目保存成功')
           this.saveDialogVisible = false
         } else {
           this.$message.error(response.message || '保存失败')
         }
       } catch (error) {
         console.error('保存题目错误:', error)
         this.$message.error('保存题目失败，请稍后重试')
       } finally {
         this.saving = false
       }
     }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.upload-card, .problems-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
    
    .header-subtitle {
      font-size: 14px;
      color: #909399;
    }
    
    .problem-count {
      font-size: 14px;
      color: #409eff;
      font-weight: 500;
    }
  }
}

.upload-section {
  .upload-area {
    .el-upload-dragger {
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      background: #fafafa;
      transition: all 0.3s;
      
      &:hover {
        border-color: #409eff;
        background: #f0f9ff;
      }
      
      .el-icon-upload {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 16px;
      }
      
      .el-upload__text {
        color: #606266;
        font-size: 16px;
        
        em {
          color: #409eff;
          font-style: normal;
        }
      }
      
      .el-upload__tip {
        color: #909399;
        font-size: 12px;
        margin-top: 8px;
      }
    }
  }
  
  .generate-section {
    margin-top: 20px;
    text-align: center;
    
    .generate-btn {
      padding: 12px 32px;
      font-size: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
      }
    }
  }
}

// 手动上传模式样式
.manual-upload-section {
  padding: 20px 0;
  
  .manual-upload-header {
    text-align: center;
    margin-bottom: 30px;
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .upload-desc {
      font-size: 14px;
      color: #909399;
    }
  }
  
  .manual-form {
    max-width: 800px;
    margin: 0 auto;
    
         .options-section {
       .options-container {
         .option-item {
           display: flex;
           align-items: center;
           margin-bottom: 12px;
           padding: 8px 12px;
           background: #f8f9fa;
           border-radius: 6px;
           border: 1px solid #e9ecef;
           
           .option-label {
             font-weight: 600;
             color: #409eff;
             margin-right: 10px;
             min-width: 20px;
           }
           
           .el-button {
             margin-left: 10px;
           }
         }
       }
     }
     
     .sub-questions-section {
       .sub-questions-container {
         .sub-question-item {
           display: flex;
           align-items: center;
           margin-bottom: 12px;
           padding: 8px 12px;
           background: #f0f9ff;
           border-radius: 6px;
           border: 1px solid #b3d8ff;
           
           .sub-question-label {
             font-weight: 600;
             color: #67c23a;
             margin-right: 10px;
             min-width: 20px;
           }
           
           .el-button {
             margin-left: 10px;
           }
         }
       }
     }
    
    .manual-save-btn {
      padding: 12px 32px;
      font-size: 16px;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }
    
         .reset-btn {
       margin-left: 16px;
       padding: 12px 24px;
       font-size: 16px;
       border-radius: 8px;
       transition: all 0.3s;
       
       &:hover {
         transform: translateY(-2px);
         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
       }
     }
     
     // 级联选择器样式优化
     .el-cascader {
       .el-input__inner {
         border-radius: 6px;
         transition: all 0.3s;
         
         &:focus {
           border-color: #409eff;
           box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
         }
       }
     }
     
           // 提示文字样式
      .form-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
        line-height: 1.4;
        
        .tip-icon {
          margin-right: 4px;
          color: #409eff;
        }
      }
      
      // LaTeX 工具栏样式
      .input-with-latex {
        position: relative;
        
        .latex-toolbar {
          margin-top: 8px;
          padding: 8px;
          background: #f0f9ff;
          border: 1px solid #b3d8ff;
          border-radius: 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          
          .el-button {
            min-width: 36px;
            height: 28px;
            padding: 0 8px;
            font-size: 12px;
            font-weight: 600;
            border-radius: 4px;
            background: #ffffff;
            border: 1px solid #d1ecf1;
            color: #0c5460;
            transition: all 0.2s;
            
            &:hover {
              transform: scale(1.05);
              box-shadow: 0 2px 4px rgba(12, 84, 96, 0.2);
              background: #d1ecf1;
              border-color: #0c5460;
            }
          }
        }
      }
  }
}

.problems-container {
  .problem-item {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .problem-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .problem-number {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .number-badge {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        
        .problem-type {
          font-size: 16px;
          font-weight: 500;
        }
      }
      
      .problem-meta {
        display: flex;
        gap: 8px;
        
        .el-tag {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
        }
      }
    }
    
    .problem-content {
      padding: 20px;
      
      .question-text {
        font-size: 16px;
        line-height: 1.6;
        color: #303133;
        margin-bottom: 20px;
        font-weight: 500;
      }
      
      .options-container {
        margin-bottom: 20px;
        
        .option-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          transition: background 0.3s;
          
          &:hover {
            background: #e9ecef;
          }
          
          .option-label {
            font-weight: 600;
            color: #409eff;
            margin-right: 12px;
            min-width: 20px;
          }
          
          .option-text {
            flex: 1;
            line-height: 1.5;
            color: #606266;
          }
        }
      }
      
      .answer-section, .analysis-section {
        margin-top: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #409eff;
        
        .answer-label, .analysis-label {
          font-weight: 600;
          color: #409eff;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .answer-content, .analysis-content {
          color: #303133;
          line-height: 1.6;
        }
      }
      
             .analysis-section {
         border-left-color: #67c23a;
         
         .analysis-label {
           color: #67c23a;
         }
       }
       
       .topics-section {
         margin-top: 16px;
         padding: 16px;
         background: #f0f9ff;
         border-radius: 6px;
         border-left: 4px solid #409eff;
         
         .topics-label {
           font-weight: 600;
           color: #409eff;
           margin-bottom: 8px;
           font-size: 14px;
         }
         
         .topics-content {
           display: flex;
           flex-wrap: wrap;
           gap: 8px;
           
           .topic-tag {
             margin: 0;
           }
         }
       }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .problem-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
     .problem-meta {
     justify-content: center;
   }
 }

// 数学公式样式
.math-formula {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  border: 1px solid #e9ecef;
  color: #495057;
}

// 保存按钮样式
.save-section {
  margin-top: 16px;
  text-align: right;
  
  .save-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}

// 历史记录样式
.history-container {
  .pagination-container {
    margin-top: 20px;
    text-align: center;
  }
}

// 历史按钮样式
.history-btn {
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
  border: none;
  color: white;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(144, 147, 153, 0.4);
  }
}

// 数学工具栏样式
.math-toolbar {
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .toolbar-section {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      display: inline-block;
      font-size: 12px;
      font-weight: 600;
      color: #495057;
      margin-right: 8px;
      min-width: 60px;
      background: #ffffff;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }
    
    .el-button {
      min-width: 32px;
      height: 24px;
      padding: 0 6px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      background: #ffffff;
      border: 1px solid #ced4da;
      color: #495057;
      transition: all 0.2s;
      margin-right: 4px;
      margin-bottom: 4px;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        background: #e9ecef;
        border-color: #adb5bd;
        color: #212529;
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// 输入框与数学工具栏的组合样式
.input-with-latex {
  .math-toolbar {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .el-input {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    
    .el-input__inner {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
  
  .el-textarea {
    .el-textarea__inner {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
</style>
