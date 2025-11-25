# Word文档生成器 - Base64图片处理

## 概述

本文档说明了如何在Vue应用中使用`wordGenerator.js`生成包含图片的Word文档，采用了推荐的Base64编码方法。

## 核心特性

### 1. Base64图片处理
- **Canvas转换**：使用Canvas将图片转换为Base64编码
- **FileReader备用**：当Canvas失败时使用FileReader作为备用方法
- **跨域支持**：自动处理HTTP→HTTPS转换，绕过跨域限制

### 2. 智能图片检测
- 自动解析HTML中的`<img>`标签
- 提取图片URL并进行Base64转换
- 支持菁优网等外部图片源

### 3. 优雅降级
- 图片加载成功：嵌入Word文档
- 图片加载失败：显示图片链接文本
- 错误处理：显示错误信息但不影响文档生成

## 使用方法

### 基础用法

```javascript
import { WordGenerator } from '@/utils/wordGenerator'

// 生成包含图片的Word文档
await WordGenerator.generateChapterDocument(chapterData, questions)
```

### 测试图片Base64转换

```javascript
// 测试单个图片的Base64转换
await WordGenerator.testImageBase64('http://img.jyeoo.net/quiz/images/svg/202405/374/6f2e698c.png')
```

### 处理包含图片的内容

```javascript
// 处理HTML内容中的图片
const paragraphs = await WordGenerator.processContentWithImages(htmlContent, '前缀：')
```

## 技术实现

### Canvas方法（推荐）

```javascript
static async loadSingleImageAsBase64ViaCanvas(imageUrl, useCors = false) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置画布尺寸并绘制图片
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // 直接转换为Base64
      const base64Data = canvas.toDataURL('image/jpeg', 0.8)
      resolve(base64Data)
    }
    
    img.src = imageUrl
  })
}
```

### FileReader备用方法

```javascript
static async loadImageAsBase64ViaFileReader(imageUrl) {
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}
```

### ImageRun使用

```javascript
new ImageRun({
  data: base64Data, // Base64编码的图片数据
  transformation: {
    width: 400,    // 图片宽度
    height: 300    // 图片高度
  }
})
```

## 调试功能

### 控制台日志
- 图片URL检测结果
- Base64转换状态
- 图片尺寸信息
- 错误详情

### 测试方法
```javascript
// 测试特定图片的处理
await WordGenerator.testImageBase64(imageUrl)
```

## 支持的图片格式

- PNG
- JPEG/JPG
- SVG
- GIF
- WebP

## 常见问题

### Q: 图片不显示怎么办？
A: 查看控制台日志，确认Base64转换是否成功。

### Q: 跨域问题如何解决？
A: 系统自动尝试HTTPS版本和无CORS模式。

### Q: 图片太大导致文档过大？
A: 系统自动限制图片最大尺寸为600px。

## 示例

```javascript
// 完整示例：生成包含菁优网图片的Word文档
const content = `
  <img src="http://img.jyeoo.net/quiz/images/svg/202405/374/6f2e698c.png" />
  如图所示，在"探究弹簧弹力与形变量的关系"实验中...
`

const questions = [{
  Content: content,
  CateName: '选择题',
  Options: ['A. 选项1', 'B. 选项2'],
  DisplayAnswer: 'A',
  Analyse: '解析内容...'
}]

await WordGenerator.generateChapterDocument({
  chapterTitle: '物理实验题',
  subject: '物理'
}, questions)
```

## 更新日志

### v2.0 (当前版本)
- 采用Base64编码方法处理图片
- 添加Canvas和FileReader双重支持
- 优化菁优网图片处理
- 增强错误处理和调试功能

### v1.0
- 基础Word文档生成
- ArrayBuffer图片处理（已废弃）