import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx'
import { saveAs } from 'file-saver'

/**
 * Word文档生成工具类
 */
export class WordGenerator {
  /**
   * 将HTTP URL转换为HTTPS URL（解决混合内容问题）
   * @param {String} url 原始URL
   * @returns {String} HTTPS URL
   */
  static convertToHttps(url) {
    if (!url) return url
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }
    if (url.startsWith('//')) {
      return 'https:' + url
    }
    return url
  }

  /**
   * 生成多种URL变体用于图片加载（解决混合内容问题）
   * @param {String} imageUrl 原始图片URL
   * @returns {Array<String>} URL变体数组
   */
  static generateUrlVariants(imageUrl) {
    if (!imageUrl) return []
    
    const variants = [imageUrl]
    
    // 添加HTTPS版本
    if (imageUrl.startsWith('http://')) {
      variants.push(imageUrl.replace('http://', 'https://'))
    }
    
    // 添加协议相对URL的HTTPS版本
    if (imageUrl.startsWith('//')) {
      variants.push('https:' + imageUrl)
    }
    
    return variants.filter(Boolean)
  }
  /**
   * 生成试卷Word文档
   * @param {Object} paperData 试卷数据
   * @param {Array} questions 题目列表
   * @param {Boolean} includeAnswerAnalysis 是否包含答案和解析，默认为false
   * @param {Boolean} answersAtEnd 是否将答案放在页尾，默认为false
   */
  static async generatePaperDocument(paperData, questions, includeAnswerAnalysis = false, answersAtEnd = false) {
    const { questionContent, answers } = await this.generateQuestionsContent(questions, includeAnswerAnalysis, answersAtEnd)
    
    const children = [
      // 试卷标题
      new Paragraph({
        text: paperData.customPaperName || '试卷',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
          before: 400
        }
      }),
      
      // 题目内容
      ...questionContent
    ]
    
    // 如果答案在页尾，添加答案部分
    if (answersAtEnd && answers && answers.length > 0) {
      children.push(...this.generateAnswersSection(answers))
    }
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    })

    // 生成文档并下载
    const blob = await Packer.toBlob(doc)
    // const fileName = `${paperData.customPaperName || '试卷'}_${new Date().getTime()}.docx`
    const fileName = `${paperData.customPaperName || '试卷'}.docx`
    saveAs(blob, fileName)
  }

  /**
   * 生成作业Word文档
   * @param {Object} homeworkData 作业数据
   * @param {Array} questions 题目列表
   * @param {Boolean} includeAnswerAnalysis 是否包含答案和解析，默认为false
   * @param {Boolean} answersAtEnd 是否将答案放在页尾，默认为false
   */
  static async generateHomeworkDocument(homeworkData, questions, includeAnswerAnalysis = false, answersAtEnd = false) {
    const { questionContent, answers } = await this.generateQuestionsContent(questions, includeAnswerAnalysis, answersAtEnd)
    
    const children = [
      // 作业标题
      new Paragraph({
        text: homeworkData.customPaperName || '作业',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
          before: 400
        }
      }),
      
      // 作业信息
      new Paragraph({
        children: [
          new TextRun({
            text: `科目：${homeworkData.subject || ''}`,
            size: 24
          })
        ],
        spacing: {
          after: 200
        }
      }),
      
      // 题目内容
      ...questionContent
    ]
    
    // 如果答案在页尾，添加答案部分
    if (answersAtEnd && answers && answers.length > 0) {
      children.push(...this.generateAnswersSection(answers))
    }
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    })

    // 生成文档并下载
    const blob = await Packer.toBlob(doc)
    // const fileName = `${homeworkData.customPaperName || '作业'}_${new Date().getTime()}.docx`
    const fileName = `${homeworkData.customPaperName || '作业'}.docx`
    saveAs(blob, fileName)
  }

  /**
   * 生成章节题Word文档
   * @param {Object} chapterData 章节数据
   * @param {Array} questions 题目列表
   * @param {Boolean} includeAnswerAnalysis 是否包含答案和解析，默认为false
   * @param {Boolean} answersAtEnd 是否将答案放在页尾，默认为false
   */
  static async generateChapterDocument(chapterData, questions, includeAnswerAnalysis = false, answersAtEnd = false) {
    console.log('生成章节题Word文档，章节数据:', chapterData, '题目数量:', questions.length)
    
    const { questionContent, answers } = await this.generateQuestionsContent(questions, includeAnswerAnalysis, answersAtEnd)
    
    const children = [
      // 章节标题
      new Paragraph({
        text: chapterData.chapterTitle || '章节题目',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
          before: 400
        }
      }),
      
      // 章节信息
      new Paragraph({
        children: [
          new TextRun({
            text: `科目：${chapterData.subject || ''}`,
            size: 24
          })
        ],
        spacing: {
          after: 200
        }
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: `章节：${chapterData.chapterPath || ''}`,
            size: 24
          })
        ],
        spacing: {
          after: 200
        }
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: `题目数量：${questions.length}题`,
            size: 24
          })
        ],
        spacing: {
          after: 400
        }
      }),
      
      // 题目内容
      ...questionContent
    ]
    
    // 如果答案在页尾，添加答案部分
    if (answersAtEnd && answers && answers.length > 0) {
      children.push(...this.generateAnswersSection(answers))
    }
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    })

    // 生成并下载文档
    const blob = await Packer.toBlob(doc)
    // const fileName = `${chapterData.customPaperName || '章节题目'}_${new Date().getTime()}.docx`
    const fileName = `${chapterData.customPaperName || '章节题目'}.docx`
    saveAs(blob, fileName)
  }

  /**
   * 生成题目内容
   * @param {Array} questions 题目列表
   * @param {Boolean} includeAnswerAnalysis 是否包含答案和解析，默认为false
   * @param {Boolean} answersAtEnd 是否将答案放在页尾，默认为false
   * @returns {Object} 包含questionContent和answers的对象
   */
  static async generateQuestionsContent(questions, includeAnswerAnalysis = false, answersAtEnd = false) {
    console.log('WordGenerator接收到的题目数据:', questions)
    const children = []
    const answers = [] // 存储答案数据，用于页尾显示
    
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index]
      console.log(`处理第${index + 1}题:`, question)
      
      // 题目内容（支持图片）- 将题序号与题干放在一行
      if (question.Content || question.questionContent) {
        const content = question.Content || question.questionContent
        console.log(`第${index + 1}题内容:`, content)
        
        const contentParagraphs = await this.processContentWithImages(content, `${index + 1}. `)
        // 如果是第一个段落，调整间距
        if (contentParagraphs.length > 0) {
          contentParagraphs[0].spacing = {
            ...contentParagraphs[0].spacing,
            before: index === 0 ? 0 : 300
          }
        }
        children.push(...contentParagraphs)
      }
      
      // 题目图片
      if (question.questionImage && question.questionImage.length > 0) {
        question.questionImage.forEach(image => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[图片：${image}]`,
                  size: 20,
                  color: '666666'
                })
              ],
              spacing: {
                after: 100
              }
            })
          )
        })
      }
      
      // 选项（如果是选择题）
      if (question.Options && question.Options.length > 0) {
        for (let optionIndex = 0; optionIndex < question.Options.length; optionIndex++) {
          const option = question.Options[optionIndex]
          const optionLabel = String.fromCharCode(65 + optionIndex) // A, B, C, D...
          let optionContent = option.Content || option.content || option
          
          // 去掉选项内容中可能存在的重复选项标记（A.、B.、C.、D.等）
          optionContent = this.removeDuplicateOptionLabels(optionContent)
          
          const optionParagraphs = await this.processContentWithImages(optionContent, `${optionLabel}. `)
          children.push(...optionParagraphs)
        }
      }
      
      // 答案处理逻辑
      if (includeAnswerAnalysis && (question.DisplayAnswer || question.Method)) {
        const answerContent = question.DisplayAnswer === '见解答' ? question.Method : question.DisplayAnswer
        if (answerContent) {
          if (answersAtEnd) {
            // 答案在页尾，保存答案数据
            answers.push({
              index: index + 1,
              answerContent: answerContent,
              analyse: question.Analyse || null
            })
          } else {
            // 答案跟在题目后面
            const answerParagraphs = await this.processContentWithImages(answerContent, '答案：', '0066CC')
            children.push(...answerParagraphs)
          }
        }
      }
      
      // 解析 - 只在答案不在页尾时显示在题目后面
      if (includeAnswerAnalysis && question.Analyse && !answersAtEnd) {
        const analysisParagraphs = await this.processContentWithImages(question.Analyse, '解析：', '009900')
        children.push(...analysisParagraphs)
      }
      
      // 分割线
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '─'.repeat(50),
              size: 20,
              color: 'CCCCCC'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 300,
            before: 100
          }
        })
      )
    }
    
    return {
      questionContent: children,
      answers: answers
    }
  }
  
  /**
   * 生成答案部分（用于页尾）
   * @param {Array} answers 答案数组，每个元素包含 {index, answerContent, analyse}
   * @returns {Array} 文档段落数组
   */
  static async generateAnswersSection(answers) {
    const children = []
    
    // 分页符
    children.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true
      })
    )
    
    // 答案部分标题
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '参考答案',
            bold: true,
            size: 32,
            color: '0066CC'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
          before: 400
        }
      })
    )
    
    // 生成每个题目的答案 - 将题号与答案放在一行
    for (const answerItem of answers) {
      // 答案内容 - 将题号作为前缀
      if (answerItem.answerContent) {
        const answerParagraphs = await this.processContentWithImages(answerItem.answerContent, `${answerItem.index}. 答案：`, '0066CC')
        // 如果是第一个段落，调整间距
        if (answerParagraphs.length > 0) {
          answerParagraphs[0].spacing = {
            ...answerParagraphs[0].spacing,
            before: 200
          }
        }
        children.push(...answerParagraphs)
      } else {
        // 如果没有答案内容，至少显示题号
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${answerItem.index}. `,
                bold: true,
                size: 28,
                color: '0066CC'
              })
            ],
            spacing: {
              after: 200,
              before: 200
            }
          })
        )
      }
      
      // 解析（如果有）
      if (answerItem.analyse) {
        const analysisParagraphs = await this.processContentWithImages(answerItem.analyse, '解析：', '009900')
        children.push(...analysisParagraphs)
      }
      
      // 分割线
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '─'.repeat(50),
              size: 20,
              color: 'CCCCCC'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 300,
            before: 100
          }
        })
      )
    }
    
    return children
  }

  /**
   * 处理包含图片的内容
   * @param {String} content 内容
   * @param {String} prefix 前缀文本
   * @param {String} color 文本颜色
   * @returns {Array} 段落数组
   */
  static async processContentWithImages(content, prefix = '', color = '000000') {
    if (!content) return []
    
    console.log('处理内容:', content)
    
    const paragraphs = []
    
    // 创建临时DOM元素来解析HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    
    // 查找所有图片
    const images = tempDiv.querySelectorAll('img')
    console.log('发现图片数量:', images.length)
    
    if (images.length === 0) {
      // 没有图片，直接处理文本
      let textContent = this.cleanHtmlContent(content)
      textContent = this.processMathFormulas(textContent)
      textContent = this.sanitizeLatexForWord(textContent)
      
      if (textContent.trim()) {
        const textRuns = []
        if (prefix) {
          textRuns.push(new TextRun({
            text: prefix,
            bold: true,
            size: 24,
            color: color
          }))
        }
        textRuns.push(new TextRun({
          text: textContent,
          size: 24
        }))
        
        paragraphs.push(new Paragraph({
          children: textRuns,
          spacing: { after: 200 }
        }))
      }
      
      return paragraphs
    }
    
    // 有图片，需要分别处理
    const imageElements = Array.from(images)
    
    // 添加前缀文本（如果有的话）
    let beforeText = this.getTextBeforeImages(tempDiv, imageElements[0])
    if (beforeText.trim() || prefix) {
      let processedText = this.processMathFormulas(this.cleanHtmlContent(beforeText))
      processedText = this.sanitizeLatexForWord(processedText)
      
      const textRuns = []
      if (prefix) {
        textRuns.push(new TextRun({
          text: prefix,
          bold: true,
          size: 24,
          color: color
        }))
      }
      if (processedText.trim()) {
        textRuns.push(new TextRun({
          text: processedText,
          size: 24
        }))
      }
      
      if (textRuns.length > 0) {
        paragraphs.push(new Paragraph({
          children: textRuns,
          spacing: { after: 100 }
        }))
      }
    }
    
    // 处理每个图片
    for (let i = 0; i < imageElements.length; i++) {
      const img = imageElements[i]
      const src = img.src || img.getAttribute('src')
      
      if (src) {
        console.log(`处理图片${i + 1}:`, src)
        
        // 尝试添加图片（使用Base64方法）
        try {
          const base64Data = await this.getImageAsBase64(src)
          if (base64Data && base64Data.length > 0) {
            console.log('成功获取图片Base64数据，长度:', base64Data.length)
            
            paragraphs.push(new Paragraph({
              children: [
                new ImageRun({
                  data: base64Data, // 直接使用Base64数据
                  transformation: {
                    width: 200,
                    height: 150
                  }
                })
              ],
              spacing: { after: 200, before: 100 }
            }))
          } else {
            // 图片获取失败，添加图片链接
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({
                  text: `[图片: ${src}]`,
                  size: 20,
                  color: '666666',
                  italics: true
                })
              ],
              spacing: { after: 200, before: 100 }
            }))
          }
        } catch (error) {
          console.error('处理图片失败:', error)
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({
                text: `[图片加载失败: ${src}]`,
                size: 20,
                color: 'FF0000'
              })
            ],
            spacing: { after: 200, before: 100 }
          }))
        }
        
        // 移除已处理的图片元素
        img.remove()
      }
    }
    
    // 处理剩余的文本内容
    const remainingText = this.cleanHtmlContent(tempDiv.innerHTML)
    if (remainingText.trim()) {
      let processedText = this.processMathFormulas(remainingText)
      processedText = this.sanitizeLatexForWord(processedText)
      
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: processedText,
            size: 24
          })
        ],
        spacing: { after: 200 }
      }))
    }
    
    return paragraphs
  }

  /**
   * 获取图片前面的文本内容
   * @param {Element} container 容器元素
   * @param {Element} firstImage 第一个图片元素
   * @returns {String} 文本内容
   */
  static getTextBeforeImages(container, firstImage) {
    if (!firstImage) return container.textContent || ''
    
    let text = ''
    let walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )
    
    let node
    while (node = walker.nextNode()) {
      if (node.compareDocumentPosition(firstImage) & Node.DOCUMENT_POSITION_FOLLOWING) {
        text += node.textContent
      }
    }
    
    return text
  }

  /**
   * 获取图片数据为Base64编码（推荐方法）
   * @param {String} imageUrl 图片URL
   * @returns {Promise<String>} Base64编码的图片数据
   */
  static async getImageAsBase64(imageUrl) {
    console.log('开始获取图片Base64:', imageUrl)
    
    try {
      // 方法1: 使用Canvas转换图片为Base64（推荐）
      const base64Data = await this.loadImageAsBase64ViaCanvas(imageUrl)
      if (base64Data) {
        console.log('通过Canvas成功获取图片Base64')
        return base64Data
      }
    } catch (error) {
      console.log('Canvas Base64方法失败:', error.message)
    }
    
    try {
      // 方法2: 使用FileReader转换（备用方法）
      const base64Data = await this.loadImageAsBase64ViaFileReader(imageUrl)
      if (base64Data) {
        console.log('通过FileReader成功获取图片Base64')
        return base64Data
      }
    } catch (error) {
      console.log('FileReader方法失败:', error.message)
    }
    
    console.log('所有方法都失败，返回null')
    return null
  }

  /**
   * 通过Canvas加载图片为Base64
   * @param {String} imageUrl 图片URL
   * @returns {Promise<String>} Base64编码的图片数据
   */
  static async loadImageAsBase64ViaCanvas(imageUrl) {
    console.log('尝试通过Canvas加载图片为Base64:', imageUrl)
    
    // 尝试多种图片URL格式
    const urlVariants = this.generateUrlVariants(imageUrl)
    
    for (const url of urlVariants) {
      try {
        console.log('尝试URL:', url)
        const base64Data = await this.loadSingleImageAsBase64ViaCanvas(url, false) // 不使用CORS
        if (base64Data) {
          console.log('Canvas Base64加载成功')
          return base64Data
        }
      } catch (error) {
        console.log(`Canvas Base64加载失败 (${url}):`, error.message)
      }
    }
    
    throw new Error('所有Canvas Base64加载方法都失败')
  }

  /**
   * 加载单个图片通过Canvas转为Base64
   * @param {String} imageUrl 图片URL
   * @param {Boolean} useCors 是否使用CORS
   * @returns {Promise<String>} Base64编码的图片数据
   */
  static async loadSingleImageAsBase64ViaCanvas(imageUrl, useCors = false) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      if (useCors) {
        img.crossOrigin = 'anonymous'
      }
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 设置合适的画布大小
          const maxSize = 600 // 限制最大尺寸
          let { width, height } = img
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height)
            width *= ratio
            height *= ratio
          }
          
          canvas.width = width
          canvas.height = height
          
          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height)
          
          // 直接转换为Base64（推荐方法）
          const base64Data = canvas.toDataURL('image/jpeg', 0.8)
          console.log('Canvas转换Base64成功，长度:', base64Data.length)
          resolve(base64Data)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = (error) => {
        reject(new Error(`Image load failed: ${error.message || 'Unknown error'}`))
      }
      
      // 设置超时
      setTimeout(() => {
        reject(new Error('Image load timeout'))
      }, 8000)
      
      img.src = imageUrl
    })
  }

  /**
   * 通过FileReader加载图片为Base64（备用方法）
   * @param {String} imageUrl 图片URL
   * @returns {Promise<String>} Base64编码的图片数据
   */
  static async loadImageAsBase64ViaFileReader(imageUrl) {
    console.log('尝试通过FileReader加载图片为Base64:', imageUrl)
    
    // 尝试多种图片URL格式
    const urlVariants = this.generateUrlVariants(imageUrl)
    
    for (const url of urlVariants) {
      try {
        console.log('尝试URL:', url)
        // 先fetch图片数据
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        
        // 使用FileReader转换为Base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            console.log('FileReader Base64转换成功')
            resolve(reader.result) // 这里已经是 data:image/jpeg;base64,... 格式
          }
          reader.onerror = () => reject(new Error('FileReader failed'))
          reader.readAsDataURL(blob)
        })
        
        if (base64Data) {
          console.log('FileReader Base64加载成功')
          return base64Data
        }
      } catch (error) {
        console.log(`URL ${url} 加载失败:`, error.message)
        continue // 尝试下一个URL
      }
    }
    
    throw new Error('所有URL变体都加载失败')
  }

  /**
   * 测试图片Base64转换（调试用）
   * @param {String} imageUrl 图片URL
   * @returns {Promise<void>}
   */
  static async testImageBase64(imageUrl) {
    
    try {
      const base64Data = await this.getImageAsBase64(imageUrl)
      if (base64Data) {
        // 创建一个临时的Image元素来验证Base64数据
        const testImg = new Image()
        testImg.onload = () => {
          console.log('✓ Base64数据验证成功，图片尺寸:', testImg.width, 'x', testImg.height)
        }
        testImg.onerror = () => {
          console.log('✗ Base64数据验证失败')
        }
        testImg.src = base64Data
      } else {
        console.log('✗ Base64转换失败')
      }
    } catch (error) {
      console.log('✗ Base64转换异常:', error.message)
    }
    
    console.log('=== 图片Base64转换测试结束 ===')
  }

  /**
   * 去掉选项内容中重复的选项标记
   * @param {String} content 选项内容
   * @returns {String} 清理后的内容
   */
  static removeDuplicateOptionLabels(content) {
    if (!content) return content
    
    // 去掉开头的选项标记（A.、B.、C.、D.等，支持中英文句号和中文顿号）
    let cleanedContent = content.replace(/^[A-Z][\.。、]\s*/, '')
    
    // 去掉可能存在的多个选项标记
    cleanedContent = cleanedContent.replace(/^[A-Z][\.。、]\s*/g, '')
    
    return cleanedContent.trim()
  }

  /**
   * 处理数学公式
   * @param {String} content 内容
   * @returns {String} 处理后的内容
   */
  static processMathFormulas(content) {
    if (!content) return ''
    
    // 处理 $ 符号包裹的数学公式，转换为 \begin{equation} 格式
    content = content.replace(/\$([^$]+)\$/g, (match, formula) => {
      // 处理 \xlongequal{x} -> \frac{\underline{x}}{\text{}} 的转换
      // let processedFormula = formula.replace(/\\xlongequal\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '\\frac{\\underline{$1}}{\\text{}}')
      let processedFormula = formula.replace(/\\xlongequal\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '\\frac{\\underset{\\text{————} }{$1} }{}')
      
      // 处理 \xrightarrow{内容} -> \overset{内容}{\rightarrow} 的转换
      processedFormula = processedFormula.replace(/\\xrightarrow\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '\\overset{$1}{\\rightarrow}')
      
      // 为$$环境
      return `$${processedFormula}$`
    })
    
    // 处理常见的数学符号
    const replacements = {
      '&alpha;': 'α', '&beta;': 'β', '&gamma;': 'γ', '&delta;': 'δ',
      '&pi;': 'π', '&theta;': 'θ', '&lambda;': 'λ', '&mu;': 'μ',
      '&sigma;': 'σ', '&phi;': 'φ', '&omega;': 'ω',
      '&plusmn;': '±', '&times;': '×', '&divide;': '÷',
      '&ne;': '≠', '&le;': '≤', '&ge;': '≥',
      '&infin;': '∞', '&sum;': '∑', '&int;': '∫',
      '&radic;': '√', '&nbsp;': ' '
    }
    
    Object.entries(replacements).forEach(([entity, symbol]) => {
      content = content.replace(new RegExp(entity, 'g'), symbol)
    })
    
    // 在HTML生成中保留上标下标标签，不进行转换
    // content = content.replace(/<sup>(.*?)<\/sup>/gi, '^($1)')
    // content = content.replace(/<sub>(.*?)<\/sub>/gi, '_($1)')
    
    return content
  }

  /**
   * 清洗LaTeX语法以便Word端更好显示（不依赖KaTeX渲染）。
   * 仅做安全替换，尽量保持可读性。
   */
  static sanitizeLatexForWord(content) {
    if (!content) return ''
    let text = content
    // 去壳：\\mathrm{X}、\\text{X}、\\operatorname{X}、\\mathbf{X}、\\mathit{X}
    const unwrap = ['mathrm', 'text', 'operatorname', 'mathbf', 'mathit']
    unwrap.forEach(cmd => {
      const re = new RegExp(`\\\\${cmd}\\{([^{}]*)\\}`, 'g')
      text = text.replace(re, '$1')
    })
    // 去除 \\left / \\right 伸缩指示
    text = text.replace(/\\left\s*/g, '')
    text = text.replace(/\\right\s*/g, '')
    // 统一分数命令
    text = text.replace(/\\dfrac/g, '\\frac')
    text = text.replace(/\\tfrac/g, '\\frac')
    // 箭头/等价等转为易读文本
    text = text.replace(/\\xrightarrow\{([^{}]*)\}/g, '→($1)')
    text = text.replace(/\\xlongequal\{([^{}]*)\}/g, '≙($1)')
    // 统一范围符号
    text = text.replace(/\s*~\s*/g, ' ~ ')
    // 去除环境外壳，保留内部
    const envs = ['pmatrix', 'bmatrix', 'vmatrix', 'Vmatrix', 'cases', 'align', 'equation']
    envs.forEach(env => {
      const re = new RegExp(`\\\\begin\\{${env}\\}([\\s\\S]*?)\\\\end\\{${env}\\}`, 'g')
      text = text.replace(re, '$1')
    })
    // 清理多余反斜杠空格与连续空白
    text = text.replace(/\\\s+/g, '\\')
    text = text.replace(/\s{2,}/g, ' ')
    return text
  }

  /**
   * 清理HTML内容，转换为纯文本
   * @param {String} htmlContent HTML内容
   * @returns {String} 清理后的文本
   */
  static cleanHtmlContent(htmlContent) {
    if (!htmlContent) return ''
    
    // 移除HTML标签
    let text = htmlContent.replace(/<[^>]*>/g, '')
    
    // 解码HTML实体
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")
    
    // 移除多余的空白字符
    text = text.replace(/\s+/g, ' ').trim()
    
    return text
  }

  /**
   * 生成打印预览HTML
   * @param {Object} data 试卷或作业数据
   * @param {Array} questions 题目列表
   * @param {String} type 类型：'paper' 或 'homework'
   * @param {Boolean} includeAnswerAnalysis 是否包含答案解析
   * @param {Boolean} answersAtEnd 是否将答案放在页尾，默认为false
   * @returns {String} HTML字符串
   */
  static generatePrintHTML(data, questions, type = 'paper', includeAnswerAnalysis = false, answersAtEnd = false) {
    const title = type === 'paper' ? '试卷' : '作业'
    const name = data.customPaperName || title
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${name}</title>
        <style>
          body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .info {
            font-size: 14px;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 2px solid #333;
            margin: 20px 0;
          }
          .question {
            margin-bottom: 30px;
          }
          .question-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .question-content {
            margin-bottom: 10px;
          }
          .options {
            margin-left: 20px;
          }
          .option {
            margin-bottom: 5px;
          }
          .answer {
            margin-top: 10px;
            font-weight: bold;
          }
          .analysis {
            margin-top: 10px;
            color: #666;
          }
          .question-divider {
            border-top: 1px solid #ccc;
            margin: 20px 0;
          }
          sup {
            vertical-align: super;
            font-size: 0.8em;
          }
          sub {
            vertical-align: sub;
            font-size: 0.8em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${name}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="questions">
    `
    
    const answers = [] // 存储答案数据，用于页尾显示
    
    questions.forEach((question, index) => {
      // 处理题目内容：先规范化，再做Word端清洗
      const processedContent = this.sanitizeLatexForWord(
        this.processMathFormulas(question.Content || question.questionContent || '')
      )
      
      html += `
        <div class="question">
          <div class="question-content">${index + 1}. ${processedContent}</div>
      `
      
      // 选项
      if (question.Options && question.Options.length > 0) {
        html += '<div class="options">'
        question.Options.forEach((option, optionIndex) => {
          const optionLabel = String.fromCharCode(65 + optionIndex)
          let optionContent = option.Content || option.content || option
          // 去掉选项内容中可能存在的重复选项标记（A.、B.、C.、D.等）
          optionContent = this.removeDuplicateOptionLabels(optionContent)
          // 处理选项内容：规范化 + Word清洗
          const processedOptionContent = this.sanitizeLatexForWord(this.processMathFormulas(optionContent))
          html += `<div class="option">${optionLabel}. ${processedOptionContent}</div>`
        })
        html += '</div>'
      }
      
      // 答案解析 - 根据参数决定是否包含
      if (includeAnswerAnalysis) {
        // 答案处理逻辑
        if (question.DisplayAnswer || question.Method) {
          const answerContent = question.DisplayAnswer === '见解答' ? question.Method : question.DisplayAnswer
          if (answerContent) {
            if (answersAtEnd) {
              // 答案在页尾，保存答案数据
              answers.push({
                index: index + 1,
                answerContent: answerContent,
                analyse: question.Analyse || null
              })
            } else {
              // 答案跟在题目后面
              const processedAnswerContent = this.sanitizeLatexForWord(this.processMathFormulas(answerContent))
              html += `<div class="answer">答案：${processedAnswerContent}</div>`
            }
          }
        }
        
        // 解析 - 只在答案不在页尾时显示在题目后面
        if (question.Analyse && !answersAtEnd) {
          const processedAnalysisContent = this.sanitizeLatexForWord(this.processMathFormulas(question.Analyse))
          html += `<div class="analysis">解析：${processedAnalysisContent}</div>`
        }
      }
      
      html += '</div>'
      
      if (index < questions.length - 1) {
        html += '<div class="question-divider"></div>'
      }
    })
    
    // 如果答案在页尾，添加答案部分
    if (answersAtEnd && answers.length > 0) {
      html += `
        <div style="page-break-before: always; margin-top: 50px;">
          <div class="title" style="text-align: center; color: #0066CC; margin-bottom: 30px;">参考答案</div>
      `
      
      answers.forEach((answerItem, answerIndex) => {
        html += `
          <div class="question">
        `
        
        if (answerItem.answerContent) {
          const processedAnswerContent = this.sanitizeLatexForWord(this.processMathFormulas(answerItem.answerContent))
          html += `<div class="answer">${answerItem.index}. 答案：${processedAnswerContent}</div>`
        } else {
          html += `<div class="question-title" style="color: #0066CC;">${answerItem.index}.</div>`
        }
        
        if (answerItem.analyse) {
          const processedAnalysisContent = this.sanitizeLatexForWord(this.processMathFormulas(answerItem.analyse))
          html += `<div class="analysis">解析：${processedAnalysisContent}</div>`
        }
        
        html += '</div>'
        
        if (answerIndex < answers.length - 1) {
          html += '<div class="question-divider"></div>'
        }
      })
      
      html += '</div>'
    }
    
    html += `
        </div>
      </body>
      </html>
    `
    
    return html
  }
} 