import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'
import htmlDocx from 'html-docx-js/dist/html-docx'
import TurndownService from 'turndown'

/**
 * 将Markdown转换为DOCX格式并下载
 * @param {string} markdown - markdown内容
 * @param {string} fileName - 文件名（不包含扩展名）
 * @param {string} fileType - 文件类型（'docx' 或 'doc'）
 */
export async function convertMarkdownToDocx(markdown, fileName, fileType = 'docx') {
  try {
    const blob = await convertMarkdownToDocxBlob(markdown)
    
    // 设置文件名
    const finalFileName = `${fileName}.${fileType}`
    
    // 下载文件
    saveAs(blob, finalFileName)
    
    return true
  } catch (error) {
    console.error('转换失败:', error)
    return false
  }
}

/**
 * 将Markdown转换为DOCX的Blob（不触发下载）
 * @param {string} markdown
 * @returns {Promise<Blob>} DOCX Blob
 */
export async function convertMarkdownToDocxBlob(markdown) {
  if (!markdown) {
    throw new Error('Markdown内容为空')
  }
  
  // 使用 docx 库生成标准DOCX格式（与mammoth兼容性更好）
  const doc = new Document({
    sections: [{
      properties: {},
      children: convertMarkdownToDocxElements(markdown)
    }]
  })
  const blob = await Packer.toBlob(doc)
  
  if (!blob || blob.size === 0) {
    throw new Error('DOCX生成失败')
  }
  
  return blob
}

/**
 * 将Markdown内容转换为DOCX元素
 * @param {string} markdown - markdown内容
 * @returns {Array} DOCX元素数组
 */
function convertMarkdownToDocxElements(markdown) {
  if (!markdown) return []
  
  const lines = markdown.split('\n')
  const elements = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      // 空行
      elements.push(new Paragraph({}))
      continue
    }
    
    // 处理标题
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)[0].length
      const text = line.replace(/^#+\s*/, '')
      
      let headingLevel
      switch (level) {
        case 1:
          headingLevel = HeadingLevel.HEADING_1
          break
        case 2:
          headingLevel = HeadingLevel.HEADING_2
          break
        case 3:
          headingLevel = HeadingLevel.HEADING_3
          break
        case 4:
          headingLevel = HeadingLevel.HEADING_4
          break
        case 5:
          headingLevel = HeadingLevel.HEADING_5
          break
        case 6:
          headingLevel = HeadingLevel.HEADING_6
          break
        default:
          headingLevel = HeadingLevel.HEADING_1
      }
      
      elements.push(new Paragraph({
        text: text,
        heading: headingLevel,
        spacing: { after: 200 }
      }))
      continue
    }
    
    // 处理分隔线
    if (line.match(/^[-*_]{3,}$/)) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: '─'.repeat(50) })]
      }))
      continue
    }
    
    // 处理列表
    if (line.match(/^[\s]*[-*+]\s/)) {
      const text = line.replace(/^[\s]*[-*+]\s/, '')
      elements.push(new Paragraph({
        text: `• ${text}`,
        spacing: { after: 100 }
      }))
      continue
    }
    
    // 处理有序列表
    if (line.match(/^[\s]*\d+\.\s/)) {
      const text = line.replace(/^[\s]*\d+\.\s/, '')
      elements.push(new Paragraph({
        text: text,
        spacing: { after: 100 }
      }))
      continue
    }
    
    // 处理引用
    if (line.startsWith('> ')) {
      const text = line.replace(/^>\s*/, '')
      elements.push(new Paragraph({
        text: text,
        spacing: { before: 100, after: 100 },
        indent: { left: 720 } // 0.5 inch
      }))
      continue
    }
    
    // 处理代码块
    if (line.startsWith('```')) {
      // 开始代码块
      let codeContent = ''
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeContent += lines[i] + '\n'
        i++
      }
      
      elements.push(new Paragraph({
        text: codeContent.trim(),
        spacing: { before: 200, after: 200 },
        indent: { left: 720, right: 720 }
      }))
      continue
    }
    
    // 处理行内代码
    if (line.includes('`')) {
      const processedText = line.replace(/`([^`]+)`/g, '$1')
      elements.push(new Paragraph({
        text: processedText,
        spacing: { after: 100 }
      }))
      continue
    }
    
    // 处理粗体和斜体
    let processedText = line
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '$1') // 粗体
    processedText = processedText.replace(/\*(.*?)\*/g, '$1') // 斜体
    
    // 普通段落
    elements.push(new Paragraph({
      text: processedText,
      spacing: { after: 100 }
    }))
  }
  
  return elements
}

// 将 Markdown 转换为更适合 Word 的 HTML，并注入基础样式
function markdownToHtmlForDocx(markdown) {
  // 使用我们已有的简易规则先转为 HTML
  let html = markdown || ''
  html = html.replace(/^---$/gm, '<hr>')
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (m, lang, code) => `<pre><code>${code.trim()}</code></pre>`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
  html = html.replace(/\n\n/g, '</p><p>')
  html = `<p>${html}</p>`

  const style = `
    <style>
      body { font-family: SimSun, '宋体', Arial; }
      p { line-height: 1.6; margin: 6pt 0; }
      h1,h2,h3 { font-weight: 700; margin: 10pt 0 6pt; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 4pt 6pt; }
      code { font-family: 'Courier New', monospace; background: #f6f8fa; }
      pre { background: #f6f8fa; padding: 8pt; }
    </style>
  `
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${style}</head><body>${html}</body></html>`
}

/**
 * 显示文件名修改弹窗
 * @param {string} defaultFileName - 默认文件名
 * @param {Function} onConfirm - 确认回调函数
 * @param {Object} vm - Vue实例，用于调用$msgbox
 */
export function showFileNameDialog(defaultFileName, onConfirm, vm) {
  if (!vm || !vm.$msgbox) {
    console.error('Vue实例未提供或$msgbox不可用')
    return
  }
  
  vm.$msgbox.prompt('请输入文件名', '修改文件名', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: defaultFileName,
    inputPattern: /^[a-zA-Z0-9\u4e00-\u9fa5_\-\s]+$/,
    inputErrorMessage: '文件名只能包含字母、数字、中文、下划线、连字符和空格'
  }).then(({ value }) => {
    if (value && value.trim()) {
      onConfirm(value.trim())
    }
  }).catch(() => {
    // 用户取消
  })
} 