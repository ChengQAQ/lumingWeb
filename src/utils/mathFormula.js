// 数学公式解析工具
export function parseMathFormula(content) {
  if (!content) return content
  
  // 引入数学公式样式
  importMathFormulaStyles()
  
  // 处理MathJye格式的数学公式
  return content.replace(
    /<span class="MathJye"[^>]*>([\s\S]*?)<\/span>/g,
    (match, formulaContent) => {
      // 解析数学公式内容
      return parseMathJyeFormula(formulaContent)
    }
  )
}

function parseMathJyeFormula(formulaContent) {
  // 处理表格形式的分数
  formulaContent = formulaContent.replace(
    /<table[^>]*cellpadding="-1"[^>]*>([\s\S]*?)<\/table>/g,
    (match, tableContent) => {
      return parseFractionTable(tableContent)
    }
  )
  
  return `<span class="MathJye">${formulaContent}</span>`
}

function parseFractionTable(tableContent) {
  // 解析分数表格
  const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g)
  if (rows && rows.length >= 2) {
    const numerator = extractTextFromRow(rows[0])
    const denominator = extractTextFromRow(rows[1])
    return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`
  }
  return tableContent
}

function extractTextFromRow(rowContent) {
  // 提取行中的文本内容
  return rowContent.replace(/<[^>]*>/g, '').trim()
}

function importMathFormulaStyles() {
  // 动态引入数学公式样式
  if (!document.getElementById('math-formula-styles')) {
    const style = document.createElement('style')
    style.id = 'math-formula-styles'
    style.textContent = `
      .MathJye {
        border: 0 none;
        direction: ltr;
        line-height: normal;
        display: inline-block;
        float: none;
        font-family: 'Times New Roman','宋体';
        font-size: 15px;
        font-style: normal;
        font-weight: normal;
        letter-spacing: 1px;
        line-height: normal;
        margin: 0;
        padding: 0;
        text-align: left;
        text-indent: 0;
        text-transform: none;
        white-space: nowrap;
        word-spacing: normal;
        word-wrap: normal;
        -webkit-text-size-adjust: none;
      }
      
      .MathJye div, .MathJye span {
        border: 0 none;
        margin: 0;
        padding: 0;
        line-height: normal;
        text-align: left;
        height: auto;
        white-space: normal;
      }
      
      .MathJye table {
        border-collapse: collapse;
        margin: 0;
        padding: 0;
        text-align: center;
        vertical-align: middle;
        line-height: normal;
        font-size: inherit;
        font-style: normal;
        font-weight: normal;
        border: 0;
        float: none;
        display: inline-block;
      }
      
      .MathJye table td {
        padding: 0;
        font-size: inherit;
        line-height: normal;
        white-space: nowrap;
        border: 0 none;
        width: auto;
      }
      
      .MathJye_mi {
        font-style: italic;
      }
      
      .fraction {
        display: inline-block;
        vertical-align: middle;
        text-align: center;
      }
      
      .fraction .numerator {
        display: block;
        border-bottom: 1px solid black;
        padding-bottom: 1px;
        font-size: 90%;
      }
      
      .fraction .denominator {
        display: block;
        padding-top: 1px;
        font-size: 90%;
      }
    `
    document.head.appendChild(style)
  }
} 