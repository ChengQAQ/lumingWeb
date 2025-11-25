import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * LaTeX数学公式渲染工具类
 * 提供统一的数学公式渲染功能，支持多种LaTeX格式
 */
class LatexRenderer {
  constructor() {
    this.defaultOptions = {
      throwOnError: false,
      strict: false
    }
  }

  /**
   * 渲染HTML内容中的数学公式
   * @param {string} html - 包含LaTeX公式的HTML内容
   * @returns {string} - 渲染后的HTML内容
   */
  renderMathFormulas(html) {
    if (!html) return html
    
    try {
      // 预处理：处理MathML格式的数学公式
      html = this.preprocessMathMLFormats(html)
      
      // 预处理：去除化学公式中的 \ce 前缀
      html = html.replace(/\\ce\{([^}]+)\}/g, (match, formula) => {
        return formula // 直接返回化学公式内容，去除 \ce 前缀
      })

      // 预处理：处理特殊的数学符号，如 \sim
      html = this.preprocessSpecialSymbols(html)

      // 执行基本的LaTeX渲染
      html = this.performBasicLatexRendering(html)
      
      // 处理未渲染的化学公式
      html = this.handleUnrenderedChemicalFormulas(html)
      
    } catch (e) {
      console.error('Math formula rendering error:', e)
    }
    
    return html
  }

  /**
   * 预处理MathML格式的数学公式
   * @param {string} html - HTML内容
   * @returns {string} - 处理后的HTML内容
   */
  preprocessMathMLFormats(html) {
    if (!html) return html
    
    // 处理形如 "th/MathML">0~+10\simt_10~11" 的格式
    html = html.replace(/th\/MathML">([^<"]+)/g, (match, content) => {
      // console.log('处理MathML格式:', match, '->', content)
      
      // 将特殊字符转换为LaTeX格式
      let mathContent = content
        .replace(/~/g, '\\sim')  // ~ 转换为 \sim
        .replace(/_(\d+)/g, '_{$1}')  // _数字 转换为 _{数字}
        .replace(/_([a-zA-Z]+)/g, '_{$1}')  // _字母 转换为 _{字母}
        .replace(/\+/g, '+')  // 保持加号
        .replace(/-/g, '-')   // 保持减号
      
      // 包装在数学环境中
      const result = '$' + mathContent + '$'
      // console.log('MathML转换结果:', result)
      return result
    })
    
    // 处理其他可能的MathML格式
    html = html.replace(/<math[^>]*>([^<]+)<\/math>/g, (match, content) => {
      return '$' + content + '$'
    })
    
    return html
  }

  /**
   * 预处理特殊数学符号
   * @param {string} html - HTML内容
   * @returns {string} - 处理后的HTML内容
   */
  preprocessSpecialSymbols(html) {
    if (!html) return html
    
    // 调试：记录原始内容
    const originalHtml = html
    
    // 首先处理转义问题，将 \\sim 和 \\~ 转换为 \sim（必须先处理，避免后续逻辑混乱）
    html = html.replace(/\\\\sim/g, '\\sim')
    // 处理 \\~ 符号，将其转换为 \sim（如 8\\~10s 显示为 8~10s）
    html = html.replace(/\\~/g, '~')
    
    // 处理单独的 \sim 符号，确保它们被正确包装在数学环境中
    // 重要：需要检查是否已经在数学环境中（$...$, $$...$$, \(...\), \[...\]）
    
    // 1. 处理 \sim 后面直接跟字母或数字的情况，如 \simt, \sim1 等
    // 但要排除已经在 $...$ 或 $$...$$ 中的情况
    html = html.replace(/\\sim([a-zA-Z0-9]+)/g, (match, variable, offset, string) => {
      // 检查是否已经在数学环境中
      if (this.isInMathEnvironment(string, offset)) {
        return match // 已经在数学环境中，不处理
      }
      const result = '$\\sim ' + variable + '$'
      // console.log('处理 \\sim 变量:', match, '->', result)
      return result
    })
    
    // 2. 处理数字和 \sim 的组合，如 "0\sim t_1"
    // 同样需要检查是否已经在数学环境中
    html = html.replace(/(\w+)\s*\\sim\s*(\w+(?:_\{[^}]+\})?)/g, (match, left, right, offset, string) => {
      // 检查是否已经在数学环境中
      if (this.isInMathEnvironment(string, offset)) {
        return match // 已经在数学环境中，不处理
      }
      // 将匹配的内容包装在 $...$ 中，确保KaTeX能够正确渲染
      const result = '$' + left + '\\sim ' + right + '$'
      // console.log('处理 \\sim 表达式:', match, '->', result)
      return result
    })
    
    // 3. 处理孤立的 \sim 符号
    html = html.replace(/\s\\sim\s/g, (match, offset, string) => {
      if (this.isInMathEnvironment(string, offset)) {
        return match
      }
      return ' $\\sim$ '
    })
    
    // 4. 处理MathML相关的特殊格式，如 "th/MathML">0~+10\simt_10~11"
    html = html.replace(/th\/MathML">([^<]+)/g, (match, content) => {
      // 提取数学内容并包装在$...$中
      const mathContent = content.replace(/~/g, '\\sim').replace(/_/g, '_{').replace(/(\d+)/g, '$1}')
      return '$' + mathContent + '$'
    })
    
    // 5. 处理其他可能未包装的数学符号
    // 5.1 处理形如 "8~10s" 的格式（数字~数字+字母）
    html = html.replace(/(\d+)\s*~\s*(\d+)([a-zA-Z]+)/g, (match, num1, num2, unit, offset, string) => {
      if (this.isInMathEnvironment(string, offset)) {
        return match
      }
      const result = '$' + num1 + '\\sim ' + num2 + '$' + unit
      // console.log('处理数字范围+单位:', match, '->', result)
      return result
    })
    
    // 5.2 处理形如 "8~10" 的格式（纯数字范围）
    html = html.replace(/(\d+)\s*~\s*(\+|-)?\s*(\d+)(?![a-zA-Z])/g, (match, num1, sign, num2, offset, string) => {
      if (this.isInMathEnvironment(string, offset)) {
        return match
      }
      const result = '$' + num1 + '\\sim ' + (sign || '') + num2 + '$'
      // console.log('处理数字范围:', match, '->', result)
      return result
    })
    
    // 调试：如果内容发生了变化，记录变化
    if (originalHtml !== html) {
      // console.log('特殊符号预处理完成，内容已更新')
    }
    
    return html
  }

  /**
   * 检查指定位置是否在数学环境中
   * @param {string} str - 完整字符串
   * @param {number} offset - 当前位置
   * @returns {boolean} - 是否在数学环境中
   */
  isInMathEnvironment(str, offset) {
    // 检查前面最近的 $ 或 $$ 符号
    const before = str.substring(0, offset)
    const after = str.substring(offset)
    
    // 检查是否在 $...$ 中
    const dollarsBefore = (before.match(/(?<!\$)\$(?!\$)/g) || []).length
    const dollarsAfter = (after.match(/(?<!\$)\$(?!\$)/g) || []).length
    if (dollarsBefore % 2 === 1 && dollarsAfter > 0) {
      return true
    }
    
    // 检查是否在 $$...$$ 中
    const doubleDollarsBefore = (before.match(/\$\$/g) || []).length
    const doubleDollarsAfter = (after.match(/\$\$/g) || []).length
    if (doubleDollarsBefore % 2 === 1 && doubleDollarsAfter > 0) {
      return true
    }
    
    // 检查是否在 \(...\) 中
    const parenOpenBefore = (before.match(/\\\(/g) || []).length
    const parenCloseBefore = (before.match(/\\\)/g) || []).length
    const parenCloseAfter = (after.match(/\\\)/g) || []).length
    if (parenOpenBefore > parenCloseBefore && parenCloseAfter > 0) {
      return true
    }
    
    // 检查是否在 \[...\] 中
    const bracketOpenBefore = (before.match(/\\\[/g) || []).length
    const bracketCloseBefore = (before.match(/\\\]/g) || []).length
    const bracketCloseAfter = (after.match(/\\\]/g) || []).length
    if (bracketOpenBefore > bracketCloseBefore && bracketCloseAfter > 0) {
      return true
    }
    
    return false
  }

  /**
   * 执行基本的LaTeX渲染
   * @param {string} html - HTML内容
   * @returns {string} - 渲染后的HTML内容
   */
  performBasicLatexRendering(html) {
    // 渲染LaTeX行内公式 \(...\)
    html = html.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          ...this.defaultOptions,
          displayMode: false
        })
      } catch (e) {
        console.warn('KaTeX LaTeX inline formula error:', e, 'Formula:', formula)
        return `<span class="math-error" title="公式渲染错误: ${e.message}">\\(${formula}\\)</span>`
      }
    })
    
    // 渲染LaTeX块级公式 \[...\]
    html = html.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX LaTeX display formula error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\[${formula}\\]</div>`
      }
    })
    
    // 渲染行内公式 $...$
    html = html.replace(/\$([^$]+)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          ...this.defaultOptions,
          displayMode: false
        })
      } catch (e) {
        console.warn('KaTeX inline formula error:', e, 'Formula:', formula)
        return `<span class="math-error" title="公式渲染错误: ${e.message}">$${formula}$</span>`
      }
    })
    
    // 渲染块级公式 $$...$$
    html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX display formula error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">$$${formula}$$</div>`
      }
    })
    
    // 渲染LaTeX环境 \begin{equation}...\end{equation}
    html = html.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX equation error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{equation}${formula}\\end{equation}</div>`
      }
    })
    
    // 渲染LaTeX环境 \begin{align}...\end{align}
    html = html.replace(/\\begin\{align\}([\s\S]*?)\\end\{align\}/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX align error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{align}${formula}\\end{align}</div>`
      }
    })
    
    // 渲染LaTeX环境 \begin{pmatrix}...\end{pmatrix}
    html = html.replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX pmatrix error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{pmatrix}${formula}\\end{pmatrix}</div>`
      }
    })
    
    // 渲染LaTeX环境 \begin{bmatrix}...\end{bmatrix}
    html = html.replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX bmatrix error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{bmatrix}${formula}\\end{bmatrix}</div>`
      }
    })
    
    // 渲染LaTeX环境 \begin{vmatrix}...\end{vmatrix}
    html = html.replace(/\\begin\{vmatrix\}([\s\S]*?)\\end\{vmatrix\}/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX vmatrix error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{vmatrix}${formula}\\end{vmatrix}</div>`
      }
    })
    
    // 渲染LaTeX环境 \begin{Vmatrix}...\end{Vmatrix}
    html = html.replace(/\\begin\{Vmatrix\}([\s\S]*?)\\end\{Vmatrix\}/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX Vmatrix error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{Vmatrix}${formula}\\end{Vmatrix}</div>`
      }
    })
    
    // 渲染LaTeX环境 \begin{cases}...\end{cases}
    html = html.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          ...this.defaultOptions,
          displayMode: true
        })
      } catch (e) {
        console.warn('KaTeX cases error:', e, 'Formula:', formula)
        return `<div class="math-error" title="公式渲染错误: ${e.message}">\\begin{cases}${formula}\\end{cases}</div>`
      }
    })
    
    return html
  }

  /**
   * 处理未渲染的化学公式
   * @param {string} html - HTML内容
   * @returns {string} - 处理后的HTML内容
   */
  handleUnrenderedChemicalFormulas(html) {
    // 查找可能未渲染的化学公式模式
    // 匹配形如 X_{Y} 或 X^{Y} 的模式，支持复杂的化学方程式
    // 包括：Ca(OH)_{2}, H_{2}SO_{4}, CaCl_{2} 等
    const chemicalPattern = /([A-Za-z0-9()]+(?:_\{[^{}]+\}|\^\{[^{}]+\})+)/g
    
    let processedHtml = html
    let matchCount = 0
    
    processedHtml = processedHtml.replace(chemicalPattern, (match, formula) => {
      matchCount++
      
      // 检查这个匹配是否已经被KaTeX渲染过
      if (this.isAlreadyRendered(match, processedHtml)) {
        return match
      }
      
      // 尝试用KaTeX渲染这个化学公式
      try {
        const rendered = katex.renderToString(formula, {
          ...this.defaultOptions,
          displayMode: false
        })
        return rendered
      } catch (e) {
        console.warn(`❌ 渲染化学公式失败: ${formula}`, e)
        return match // 如果渲染失败，返回原始内容
      }
    })
    
    return processedHtml
  }

  /**
   * 判断内容是否已经被渲染
   * @param {string} match - 匹配的内容
   * @param {string} html - HTML内容
   * @returns {boolean} - 是否已经被渲染
   */
  isAlreadyRendered(match, html) {
    const index = html.indexOf(match)
    if (index === -1) return false
    
    // 检查前后是否有KaTeX的渲染结果特征
    const before = html.substring(Math.max(0, index - 100), index)
    const after = html.substring(index + match.length, Math.min(html.length, index + match.length + 100))
    
    // 更严格的判断：检查是否在KaTeX渲染的HTML结构中
    const isInKatexSpan = before.includes('<span class="katex') && after.includes('</span>')
    const isInKatexDiv = before.includes('<div class="katex') && after.includes('</div>')
    const isInMathError = before.includes('class="math-error"') || after.includes('class="math-error"')
    
    return isInKatexSpan || isInKatexDiv || isInMathError
  }

  /**
   * 处理解析/分析/讨论内容，包括HTML解码和LaTeX渲染
   * @param {string} content - 解析/分析/讨论内容
   * @returns {string} - 处理后的内容
   */
  processAnalysisContent(content) {
    if (!content) return ''
    
    // 先解码HTML实体，确保sub/sup等标签正确显示
    let processedContent = this.decodeHtmlEntities(content)
    
    // 处理图片大小 - 限制图片不超出容器
    processedContent = this.processImages(processedContent)
    
    // 处理数学公式 - 使用增强的LaTeX渲染
    processedContent = this.renderMathFormulas(processedContent)
    
    return processedContent
  }

  /**
   * 处理题目内容，包括HTML解码和LaTeX渲染
   * @param {string} content - 题目内容
   * @returns {string} - 处理后的内容
   */
  processQuestionContent(content) {
    if (!content) return ''
    
    // 先解码HTML实体，确保sub/sup等标签正确显示
    let processedContent = this.decodeHtmlEntities(content)
    
    // 处理图片大小 - 限制图片不超出容器
    processedContent = this.processImages(processedContent)
    
    // 处理数学公式 - 使用增强的LaTeX渲染
    processedContent = this.renderMathFormulas(processedContent)
    
    // 处理可编辑答案输入区域 - 支持多种格式
    return processedContent
      .replace(
        /<!--BA--><div[^>]*class=['"]?quizPutTag['"]?[^>]*contenteditable=['"]?true['"]?[^>]*>\s*(?:&nbsp;)?\s*<\/div><!--EA-->/g,
        '______'
      )
      .replace(
        /<!--BA--><div (?:class="quizPutTag"|class="\\quizPutTag\\") contenteditable="true">\s*(&nbsp;)?<\/div><!--EA-->/g,
        '______'
      )
      .replace(
        /<div class='quizPutTag' contenteditable='true'>&nbsp;<\/div>/g,
        '______'
      )
      .replace(
        /<div class="quizPutTag" contenteditable="true">\s*(&nbsp;)?<\/div>/g,
        '______'
      )
      .replace(
        /<div[^>]*class=['"]?quizPutTag['"]?[^>]*contenteditable=['"]?true['"]?[^>]*>\s*(?:&nbsp;)?\s*<\/div>/g,
        '______'
      )
      .replace(
        /<essay\s*\/?>/g,
        '________________________________________________________________________________'
      )
  }

  /**
   * 移除选项前缀
   * @param {string} option - 选项内容
   * @param {number} index - 选项索引（0=A, 1=B, 2=C, 3=D...）
   * @returns {string} - 移除前缀后的选项内容
   */
  removeOptionPrefix(option, index) {
    if (!option) return ''
    
    // 获取选项字母前缀
    const optionLetter = String.fromCharCode(65 + index) // A, B, C, D...
    
    // 创建匹配模式，匹配 "A. A. 内容" 或 "A.A.内容" 或 "A. 内容" 等格式
    const patterns = [
      new RegExp(`^${optionLetter}\\.\\s*${optionLetter}\\.\\s*`, 'i'), // A. A. 内容
      new RegExp(`^${optionLetter}\\.${optionLetter}\\.\\s*`, 'i'),     // A.A. 内容
      new RegExp(`^${optionLetter}\\.${optionLetter}\\、\\s*`, 'i'),     // A.A、 内容
      new RegExp(`^${optionLetter}\\.\\s*`, 'i'),                       // A. 内容
      new RegExp(`^${optionLetter}\\、\\s*`, 'i'),                       // A、 内容
      new RegExp(`^${optionLetter}\\s*${optionLetter}\\s*`, 'i'),       // A A 内容
      new RegExp(`^${optionLetter}${optionLetter}\\s*`, 'i')            // AA 内容
    ]
    
    let cleanedOption = option
    
    // 尝试匹配并移除前缀
    for (const pattern of patterns) {
      if (pattern.test(cleanedOption)) {
        cleanedOption = cleanedOption.replace(pattern, '')
        break
      }
    }
    
    return cleanedOption.trim()
  }

  /**
   * 处理选项内容，移除重复的选项前缀
   * @param {string} content - 选项内容
   * @param {number} index - 选项索引
   * @returns {string} - 处理后的选项内容
   */
  processOptionContent(content, index) {
    if (!content) return ''
    
    // 先移除选项前缀
    let processedContent = this.removeOptionPrefix(content, index)
    
    // 然后进行数学公式渲染
    processedContent = this.renderMathFormulas(processedContent)
    
    return processedContent
  }

  /**
   * 处理图片大小，限制图片不超出容器
   * @param {string} html - HTML内容
   * @returns {string} - 处理后的HTML内容
   */
  processImages(html) {
    if (!html) return html
    
    // 处理所有img标签，添加样式限制大小
    html = html.replace(/<img([^>]*)>/gi, (match, attributes) => {
      // 检查是否已经有style属性
      if (attributes.includes('style=')) {
        // 如果已有style属性，添加max-width和height限制
        attributes = attributes.replace(
          /style=['"]([^'"]*)['"]/gi,
          (styleMatch, styleContent) => {
            // 检查是否已经有max-width
            if (!styleContent.includes('max-width')) {
              styleContent += '; max-width: 100%'
            }
            // 检查是否已经有height: auto
            if (!styleContent.includes('height:') || (!styleContent.includes('height: auto') && !styleContent.includes('height:auto'))) {
              styleContent += '; height: auto'
            }
            return `style="${styleContent}"`
          }
        )
      } else {
        // 如果没有style属性，添加新的style属性
        attributes += ' style="max-width: 100%; height: auto; display: block; margin: 8px 0;"'
      }
      
      return `<img${attributes}>`
    })
    
    return html
  }

  /**
   * 解码HTML实体
   * @param {string} text - 包含HTML实体的文本
   * @returns {string} - 解码后的文本
   */
  decodeHtmlEntities(text) {
    if (!text) return text
    
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }
}

// 创建单例实例
const latexRenderer = new LatexRenderer()

// 导出单例实例和类
export default latexRenderer
export { LatexRenderer }