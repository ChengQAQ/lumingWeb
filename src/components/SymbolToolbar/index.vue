<template>
  <div class="symbol-toolbar">
    <!-- 工具栏头部 -->
    <div class="toolbar-header" @click="toggleDropdown">
      <div class="header-content">
        <i class="el-icon-magic-stick"></i>
        <span class="header-title">快捷符号</span>
        <span class="symbol-count">({{ totalSymbols }}个符号)</span>
      </div>
      <i :class="['el-icon-arrow-down', 'toggle-icon', { 'is-expanded': isExpanded }]"></i>
    </div>
    
    <!-- 符号内容区域 -->
    <el-collapse-transition>
      <div v-show="isExpanded" class="symbol-content">
        <!-- 数学公式分隔符 -->
        <div class="toolbar-section">
          <span class="section-title">公式分隔：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$$')" title="数学公式块">$$</el-button>
            <el-button size="mini" @click="insertSymbol('$')" title="行内公式">$</el-button>
            <el-button size="mini" @click="insertSymbol('\\(')" title="行内公式开始">\\(</el-button>
            <el-button size="mini" @click="insertSymbol('\\)')" title="行内公式结束">\\)</el-button>
            <el-button size="mini" @click="insertSymbol('\\[')" title="块级公式开始">\\[</el-button>
            <el-button size="mini" @click="insertSymbol('\\]')" title="块级公式结束">\\]</el-button>
          </div>
        </div>
        
        <!-- 希腊字母 -->
        <div class="toolbar-section">
          <span class="section-title">希腊字母：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\alpha$')" title="希腊字母α">α</el-button>
            <el-button size="mini" @click="insertSymbol('$\\beta$')" title="希腊字母β">β</el-button>
            <el-button size="mini" @click="insertSymbol('$\\gamma$')" title="希腊字母γ">γ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\delta$')" title="希腊字母δ">δ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\Delta$')" title="希腊字母Δ">Δ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\epsilon$')" title="希腊字母ε">ε</el-button>
            <el-button size="mini" @click="insertSymbol('$\\theta$')" title="希腊字母θ">θ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\lambda$')" title="希腊字母λ">λ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mu$')" title="希腊字母μ">μ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\pi$')" title="圆周率π">π</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sigma$')" title="希腊字母σ">σ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\phi$')" title="希腊字母φ">φ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\omega$')" title="希腊字母ω">ω</el-button>
          </div>
        </div>
        
        <!-- LaTeX公式符号 -->
        <div class="toolbar-section">
          <span class="section-title">LaTeX公式：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$_{}$')" title="下标">x₂</el-button>
            <el-button size="mini" @click="insertSymbol('$^{}$')" title="上标">x²</el-button>
            <el-button size="mini" @click="insertSymbol('$\\frac{}{}')" title="分数">a/b</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sqrt{}$')" title="根号">√x</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sqrt[n]{}$')" title="n次根号">ⁿ√x</el-button>
            <el-button size="mini" @click="insertSymbol('$\\log$')" title="对数">log</el-button>
            <el-button size="mini" @click="insertSymbol('$\\ln$')" title="自然对数">ln</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sin$')" title="正弦">sin</el-button>
            <el-button size="mini" @click="insertSymbol('$\\cos$')" title="余弦">cos</el-button>
            <el-button size="mini" @click="insertSymbol('$\\tan$')" title="正切">tan</el-button>
            <el-button size="mini" @click="insertSymbol('$\\lim$')" title="极限">lim</el-button>
            <el-button size="mini" @click="insertSymbol('$\\rightarrow$')" title="趋向于">→</el-button>
          </div>
        </div>
        
        <!-- 数学运算符 -->
        <div class="toolbar-section">
          <span class="section-title">数学运算：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\times$')" title="乘号">×</el-button>
            <el-button size="mini" @click="insertSymbol('$\\div$')" title="除号">÷</el-button>
            <el-button size="mini" @click="insertSymbol('$\\pm$')" title="正负号">±</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mp$')" title="负正号">∓</el-button>
            <el-button size="mini" @click="insertSymbol('$\\cdot$')" title="点乘">·</el-button>
            <el-button size="mini" @click="insertSymbol('$\\ast$')" title="星号">∗</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sum$')" title="求和">∑</el-button>
            <el-button size="mini" @click="insertSymbol('$\\prod$')" title="求积">∏</el-button>
            <el-button size="mini" @click="insertSymbol('$\\int$')" title="积分">∫</el-button>
            <el-button size="mini" @click="insertSymbol('$\\oint$')" title="环路积分">∮</el-button>
            <el-button size="mini" @click="insertSymbol('$\\lim$')" title="极限">lim</el-button>
            <el-button size="mini" @click="insertSymbol('$\\max$')" title="最大值">max</el-button>
            <el-button size="mini" @click="insertSymbol('$\\min$')" title="最小值">min</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sup$')" title="上确界">sup</el-button>
            <el-button size="mini" @click="insertSymbol('$\\inf$')" title="下确界">inf</el-button>
          </div>
        </div>
        
        <!-- 关系符号 -->
        <div class="toolbar-section">
          <span class="section-title">关系符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\neq$')" title="不等于">≠</el-button>
            <el-button size="mini" @click="insertSymbol('$\\leq$')" title="小于等于">≤</el-button>
            <el-button size="mini" @click="insertSymbol('$\\geq$')" title="大于等于">≥</el-button>
            <el-button size="mini" @click="insertSymbol('$\\ll$')" title="远小于">≪</el-button>
            <el-button size="mini" @click="insertSymbol('$\\gg$')" title="远大于">≫</el-button>
            <el-button size="mini" @click="insertSymbol('$\\approx$')" title="约等于">≈</el-button>
            <el-button size="mini" @click="insertSymbol('$\\equiv$')" title="恒等于">≡</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sim$')" title="相似">∼</el-button>
            <el-button size="mini" @click="insertSymbol('$\\propto$')" title="正比于">∝</el-button>
            <el-button size="mini" @click="insertSymbol('$\\in$')" title="属于">∈</el-button>
            <el-button size="mini" @click="insertSymbol('$\\notin$')" title="不属于">∉</el-button>
            <el-button size="mini" @click="insertSymbol('$\\subset$')" title="子集">⊂</el-button>
            <el-button size="mini" @click="insertSymbol('$\\supset$')" title="超集">⊃</el-button>
          </div>
        </div>
        
        <!-- 化学符号 -->
        <div class="toolbar-section">
          <span class="section-title">化学符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{\\Delta}$')" title="加热符号">加热</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{点燃}$')" title="点燃符号">点燃</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{催化剂}$')" title="催化剂符号">催化剂</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{高温}$')" title="高温符号">高温</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{光照}$')" title="光照符号">光照</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{电解}$')" title="电解符号">电解</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{加压}$')" title="加压符号">加压</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{减压}$')" title="减压符号">减压</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{浓硫酸}$')" title="浓硫酸符号">浓硫酸</el-button>
            <el-button size="mini" @click="insertSymbol('$\\xlongequal{稀硫酸}$')" title="稀硫酸符号">稀硫酸</el-button>
          </div>
        </div>
        
        <!-- 特殊符号 -->
        <div class="toolbar-section">
          <span class="section-title">特殊符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\infty$')" title="无穷大">∞</el-button>
            <el-button size="mini" @click="insertSymbol('$\\partial$')" title="偏导数">∂</el-button>
            <el-button size="mini" @click="insertSymbol('$\\nabla$')" title="梯度算子">∇</el-button>
            <el-button size="mini" @click="insertSymbol('$\\hbar$')" title="约化普朗克常数">ℏ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\ell$')" title="花体l">ℓ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\Re$')" title="实部">ℜ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\Im$')" title="虚部">ℑ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\aleph$')" title="阿列夫">ℵ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\emptyset$')" title="空集">∅</el-button>
            <el-button size="mini" @click="insertSymbol('$\\varnothing$')" title="空集">∅</el-button>
          </div>
        </div>
        
        <!-- 单位符号 -->
        <div class="toolbar-section">
          <span class="section-title">单位符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\degree$')" title="度数">°</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{°C}$')" title="摄氏度">°C</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{°F}$')" title="华氏度">°F</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{°K}$')" title="开尔文">°K</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{mol}$')" title="摩尔">mol</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{kg}$')" title="千克">kg</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{m}$')" title="米">m</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{s}$')" title="秒">s</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{A}$')" title="安培">A</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{V}$')" title="伏特">V</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{W}$')" title="瓦特">W</el-button>
            <el-button size="mini" @click="insertSymbol('$\\text{J}$')" title="焦耳">J</el-button>
          </div>
        </div>
        
        <!-- 几何符号 -->
        <div class="toolbar-section">
          <span class="section-title">几何符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\angle$')" title="角度">∠</el-button>
            <el-button size="mini" @click="insertSymbol('$\\triangle$')" title="三角形">△</el-button>
            <el-button size="mini" @click="insertSymbol('$\\square$')" title="正方形">□</el-button>
            <el-button size="mini" @click="insertSymbol('$\\diamond$')" title="菱形">◇</el-button>
            <el-button size="mini" @click="insertSymbol('$\\circ$')" title="圆">○</el-button>
            <el-button size="mini" @click="insertSymbol('$\\bullet$')" title="实心圆">●</el-button>
            <el-button size="mini" @click="insertSymbol('$\\parallel$')" title="平行">∥</el-button>
            <el-button size="mini" @click="insertSymbol('$\\perp$')" title="垂直">⊥</el-button>
            <el-button size="mini" @click="insertSymbol('$\\cong$')" title="全等">≅</el-button>
            <el-button size="mini" @click="insertSymbol('$\\sim$')" title="相似">∼</el-button>
          </div>
        </div>
        
        <!-- 矩阵符号 -->
        <div class="toolbar-section">
          <span class="section-title">矩阵符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$')" title="2x2单位矩阵">I₂</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$')" title="2x2矩阵">2×2</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{pmatrix} \\\\ \\end{pmatrix}$')" title="圆括号矩阵">( )</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{bmatrix} \\\\ \\end{bmatrix}$')" title="方括号矩阵">[ ]</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{vmatrix} \\\\ \\end{vmatrix}$')" title="行列式">| |</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{Vmatrix} \\\\ \\end{Vmatrix}$')" title="双线行列式">‖ ‖</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{cases} \\\\ \\end{cases}$')" title="分段函数">{ }</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{align} \\\\ \\end{align}$')" title="对齐公式">align</el-button>
            <el-button size="mini" @click="insertSymbol('$\\begin{matrix} \\\\ \\end{matrix}$')" title="矩阵">matrix</el-button>
          </div>
        </div>
        
        <!-- 物理符号 -->
        <div class="toolbar-section">
          <span class="section-title">物理符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\vec{F}$')" title="力矢量">F⃗</el-button>
            <el-button size="mini" @click="insertSymbol('$\\vec{v}$')" title="速度矢量">v⃗</el-button>
            <el-button size="mini" @click="insertSymbol('$\\vec{a}$')" title="加速度矢量">a⃗</el-button>
            <el-button size="mini" @click="insertSymbol('$\\vec{E}$')" title="电场强度">E⃗</el-button>
            <el-button size="mini" @click="insertSymbol('$\\vec{B}$')" title="磁感应强度">B⃗</el-button>
            <el-button size="mini" @click="insertSymbol('$\\hbar$')" title="约化普朗克常数">ℏ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\varepsilon_0$')" title="真空介电常数">ε₀</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mu_0$')" title="真空磁导率">μ₀</el-button>
            <el-button size="mini" @click="insertSymbol('$c$')" title="光速">c</el-button>
            <el-button size="mini" @click="insertSymbol('$e$')" title="元电荷">e</el-button>
          </div>
        </div>
        
        <!-- 箭头符号 -->
        <div class="toolbar-section">
          <span class="section-title">箭头符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\rightarrow$')" title="右箭头">→</el-button>
            <el-button size="mini" @click="insertSymbol('$\\leftarrow$')" title="左箭头">←</el-button>
            <el-button size="mini" @click="insertSymbol('$\\leftrightarrow$')" title="双向箭头">↔</el-button>
            <el-button size="mini" @click="insertSymbol('$\\Rightarrow$')" title="双线右箭头">⇒</el-button>
            <el-button size="mini" @click="insertSymbol('$\\Leftarrow$')" title="双线左箭头">⇐</el-button>
            <el-button size="mini" @click="insertSymbol('$\\Leftrightarrow$')" title="双线双向箭头">⇔</el-button>
            <el-button size="mini" @click="insertSymbol('$\\uparrow$')" title="上箭头">↑</el-button>
            <el-button size="mini" @click="insertSymbol('$\\downarrow$')" title="下箭头">↓</el-button>
            <el-button size="mini" @click="insertSymbol('$\\updownarrow$')" title="上下箭头">↕</el-button>
            <el-button size="mini" @click="insertSymbol('$\\nearrow$')" title="右上箭头">↗</el-button>
            <el-button size="mini" @click="insertSymbol('$\\nwarrow$')" title="左上箭头">↖</el-button>
            <el-button size="mini" @click="insertSymbol('$\\searrow$')" title="右下箭头">↘</el-button>
            <el-button size="mini" @click="insertSymbol('$\\swarrow$')" title="左下箭头">↙</el-button>
          </div>
        </div>
        
        <!-- 逻辑符号 -->
        <div class="toolbar-section">
          <span class="section-title">逻辑符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\land$')" title="逻辑与">∧</el-button>
            <el-button size="mini" @click="insertSymbol('$\\lor$')" title="逻辑或">∨</el-button>
            <el-button size="mini" @click="insertSymbol('$\\lnot$')" title="逻辑非">¬</el-button>
            <el-button size="mini" @click="insertSymbol('$\\forall$')" title="全称量词">∀</el-button>
            <el-button size="mini" @click="insertSymbol('$\\exists$')" title="存在量词">∃</el-button>
            <el-button size="mini" @click="insertSymbol('$\\nexists$')" title="不存在">∄</el-button>
            <el-button size="mini" @click="insertSymbol('$\\therefore$')" title="因此">∴</el-button>
            <el-button size="mini" @click="insertSymbol('$\\because$')" title="因为">∵</el-button>
            <el-button size="mini" @click="insertSymbol('$\\iff$')" title="当且仅当">⟺</el-button>
            <el-button size="mini" @click="insertSymbol('$\\implies$')" title="蕴含">⟹</el-button>
          </div>
        </div>
        
        <!-- 集合符号 -->
        <div class="toolbar-section">
          <span class="section-title">集合符号：</span>
          <div class="symbol-buttons">
            <el-button size="mini" @click="insertSymbol('$\\cup$')" title="并集">∪</el-button>
            <el-button size="mini" @click="insertSymbol('$\\cap$')" title="交集">∩</el-button>
            <el-button size="mini" @click="insertSymbol('$\\setminus$')" title="差集">∖</el-button>
            <el-button size="mini" @click="insertSymbol('$\\triangle$')" title="对称差">△</el-button>
            <el-button size="mini" @click="insertSymbol('$\\emptyset$')" title="空集">∅</el-button>
            <el-button size="mini" @click="insertSymbol('$\\varnothing$')" title="空集">∅</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mathbb{N}$')" title="自然数集">ℕ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mathbb{Z}$')" title="整数集">ℤ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mathbb{Q}$')" title="有理数集">ℚ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mathbb{R}$')" title="实数集">ℝ</el-button>
            <el-button size="mini" @click="insertSymbol('$\\mathbb{C}$')" title="复数集">ℂ</el-button>
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
export default {
  name: 'SymbolToolbar',
  data() {
    return {
      isExpanded: false, // 控制下拉框展开/折叠状态
      totalSymbols: 150 // 符号总数
    }
  },
  methods: {
    insertSymbol(symbol) {
      // 向父组件发送插入符号的事件，包含光标位置信息
      this.$emit('insert-symbol', {
        symbol: symbol,
        insertAtCursor: true
      })
    },
    
    toggleDropdown() {
      this.isExpanded = !this.isExpanded
    }
  }
}
</script>

<style scoped>
/* 符号工具栏样式 */
.symbol-toolbar {
  margin-bottom: 15px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  /* overflow: auto; */
}

/* 工具栏头部 */
.toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.toolbar-header:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-content i {
  color: #409eff;
  font-size: 16px;
}

.header-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.symbol-count {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

.toggle-icon {
  color: #909399;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.toggle-icon.is-expanded {
  transform: rotate(180deg);
}

/* 符号内容区域 */
.symbol-content {
  padding: 12px 16px;
  background: #fafbfc;
  border-top: 1px solid #e4e7ed;
  max-height: 150px;
  overflow-y: auto;
}

.toolbar-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.toolbar-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-weight: 600;
  color: #2c3e50;
  min-width: 70px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(45deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 2px;
}

.symbol-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.symbol-toolbar .el-button {
  margin: 0;
  padding: 3px 6px;
  min-width: auto;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  background: #fff;
  color: #606266;
  transition: all 0.2s ease;
  font-weight: 500;
}

.symbol-toolbar .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
  color: #409eff;
  background: #f0f9ff;
}

.symbol-toolbar .el-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 不同分类的按钮颜色 */
.toolbar-section:nth-child(1) .el-button:hover {
  border-color: #e6a23c;
  color: #e6a23c;
  background: #fdf6ec;
}

.toolbar-section:nth-child(2) .el-button:hover {
  border-color: #67c23a;
  color: #67c23a;
  background: #f0f9ff;
}

.toolbar-section:nth-child(3) .el-button:hover {
  border-color: #f56c6c;
  color: #f56c6c;
  background: #fef0f0;
}

.toolbar-section:nth-child(4) .el-button:hover {
  border-color: #909399;
  color: #909399;
  background: #f4f4f5;
}

.toolbar-section:nth-child(5) .el-button:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

.toolbar-section:nth-child(6) .el-button:hover {
  border-color: #9c27b0;
  color: #9c27b0;
  background: #f3e5f5;
}

.toolbar-section:nth-child(7) .el-button:hover {
  border-color: #ff9800;
  color: #ff9800;
  background: #fff3e0;
}

.toolbar-section:nth-child(8) .el-button:hover {
  border-color: #607d8b;
  color: #607d8b;
  background: #eceff1;
}
</style>