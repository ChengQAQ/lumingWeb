<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="900px"
    append-to-body
    @opened="modalOpened"
    @close="closeDialog"
    :close-on-click-modal="false"
  >
    <el-row>
      <el-col :span="24" :style="{height: '500px', position: 'relative', overflow: 'hidden', background: '#000'}">
        <div
          v-if="isShowImg"
          class="cropper-container"
          :style="containerStyle"
          @wheel="handleWheel"
          @mousedown="handleImageMouseDown"
          @mousemove="handleImageMouseMove"
          @mouseup="handleImageMouseUp"
          @mouseleave="handleImageMouseUp"
        >
          <div
            class="cropper-content"
            :style="contentStyle"
          >
            <img
              :src="imageSrc"
              :style="imageStyle"
              @load="handleImageLoad"
              draggable="false"
            />
            <!-- 裁剪框 -->
            <div
              class="cropper-crop-box"
              :style="cropBoxStyle"
              @mousedown.stop="handleCropBoxMouseDown"
            >
              <div class="cropper-view-box">
                <div class="cropper-dashed-h"></div>
                <div class="cropper-dashed-v"></div>
                <!-- 边框线 -->
                <div class="cropper-line cropper-line-t" data-drag="top" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-line cropper-line-r" data-drag="right" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-line cropper-line-b" data-drag="bottom" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-line cropper-line-l" data-drag="left" @mousedown.stop="handleDragStart"></div>
                <!-- 控制点 -->
                <div class="cropper-point point-t" data-drag="top" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-point point-tr" data-drag="topRight" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-point point-r" data-drag="right" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-point point-rb" data-drag="rightBottom" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-point point-b" data-drag="bottom" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-point point-bl" data-drag="bottomLeft" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-point point-l" data-drag="left" @mousedown.stop="handleDragStart"></div>
                <div class="cropper-point point-lt" data-drag="leftTop" @mousedown.stop="handleDragStart"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading-placeholder">
          <i class="el-icon-loading"></i>
          <span>加载中...</span>
        </div>
      </el-col>
    </el-row>
    <br />
    <el-row>
      <el-col :span="24" style="text-align: center;">
        <el-button-group>
          <el-button size="small" icon="el-icon-plus" @click="changeScale(1.1)" title="放大"></el-button>
          <el-button size="small" icon="el-icon-minus" @click="changeScale(0.9)" title="缩小"></el-button>
          <el-button size="small" icon="el-icon-refresh" @click="reset" title="重置"></el-button>
        </el-button-group>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="confirmCrop" :loading="loading || detecting">
        {{ detecting ? '检测中...' : '确 定' }}
      </el-button>
    </div>
    <!-- 隐藏的 canvas 用于裁剪 -->
    <canvas ref="canvas" style="display: none;"></canvas>
  </el-dialog>
</template>

<script>
import { debounce } from '@/utils'
import { detectImage, saveAnnotatio } from '@/api/system/problems'

export default {
  name: 'ImageCrop',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    imageSrc: {
      type: String,
      default: ''
    },
    imageFile: {
      type: File,
      default: null
    },
    title: {
      type: String,
      default: '图片裁剪'
    }
  },
  data() {
    return {
      dialogVisible: false,
      isShowImg: false,
      loading: false,
      detecting: false,
      hasDetected: false, // 标记是否已经调用过检测接口

      // 容器尺寸
      containerWidth: 900,
      containerHeight: 500,

      // 图片信息
      originalImageW: 0,
      originalImageH: 0,
      displayImageW: 0,
      displayImageH: 0,
      imageRatio: 1,

      // 图片位置和缩放
      imageLeft: 0,
      imageTop: 0,
      currentScale: 1,
      minScale: 0.5,
      maxScale: 3,

      // 裁剪框位置（使用 left, top, right, bottom）
      cutL: 0,
      cutT: 0,
      cutR: 0,
      cutB: 0,

      // 拖拽状态
      isDragging: false,
      dragType: null, // 'image', 'cropBox', 'top', 'right', 'bottom', 'left', 'topRight', etc.
      dragStartX: 0,
      dragStartY: 0,
      dragStartCutL: 0,
      dragStartCutT: 0,
      dragStartCutR: 0,
      dragStartCutB: 0,
      dragStartImageLeft: 0,
      dragStartImageTop: 0,

      resizeHandler: null
    }
  },
  computed: {
    containerStyle() {
      return {
        width: this.containerWidth + 'px',
        height: this.containerHeight + 'px',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        userSelect: 'none'
      }
    },
    contentStyle() {
      return {
        position: 'absolute',
        left: this.imageLeft + 'px',
        top: this.imageTop + 'px',
        width: this.displayImageW + 'px',
        height: this.displayImageH + 'px',
        transform: `scale(${this.currentScale})`,
        transformOrigin: 'center center'
      }
    },
    imageStyle() {
      return {
        width: '100%',
        height: '100%',
        display: 'block',
        userSelect: 'none',
        pointerEvents: 'none'
      }
    },
    cropBoxStyle() {
      return {
        position: 'absolute',
        left: this.cutL + 'px',
        top: this.cutT + 'px',
        right: this.cutR + 'px',
        bottom: this.cutB + 'px',
        background: 'rgba(255, 255, 255, 0.3)',
        zIndex: 2,
        cursor: this.isDragging ? 'move' : 'default'
      }
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
      if (newVal && this.imageSrc) {
        this.loadImage()
      }
    },
    imageSrc(newVal) {
      if (newVal && this.dialogVisible) {
        this.loadImage()
      }
    }
  },
  methods: {
    modalOpened() {
      this.containerWidth = 900
      this.containerHeight = 500
      if (!this.resizeHandler) {
        this.resizeHandler = debounce(() => {
          this.handleResize()
        }, 100)
      }
      window.addEventListener("resize", this.resizeHandler)
      this.loadImage()
    },

    handleResize() {
      // 可以在这里处理窗口大小变化
    },

    loadImage() {
      if (!this.imageSrc) {
        this.isShowImg = false
        return
      }

      this.isShowImg = false

      const img = new Image()
      img.onload = () => {
        this.originalImageW = img.width
        this.originalImageH = img.height
        this.imageRatio = img.width / img.height

        // 计算显示尺寸（适应容器）
        const containerAspect = this.containerWidth / this.containerHeight
        const imageAspect = this.imageRatio

        if (imageAspect > containerAspect) {
          this.displayImageW = this.containerWidth * 0.9
          this.displayImageH = this.displayImageW / imageAspect
        } else {
          this.displayImageH = this.containerHeight * 0.9
          this.displayImageW = this.displayImageH * imageAspect
        }

        // 居中显示
        this.imageLeft = (this.containerWidth - this.displayImageW) / 2
        this.imageTop = (this.containerHeight - this.displayImageH) / 2

        // 初始化裁剪框（默认居中，大小为图片的80%）
        const initSize = Math.min(this.displayImageW, this.displayImageH) * 0.8
        this.cutL = (this.displayImageW - initSize) / 2
        this.cutT = (this.displayImageH - initSize) / 2
        this.cutR = this.cutL
        this.cutB = this.cutT

        this.currentScale = 1

        this.isShowImg = true

        // 加载完成后调用检测（只调用一次）
        if (!this.hasDetected) {
          this.$nextTick(() => {
        this.detectImage()
          })
        }
      }
      img.onerror = () => {
        this.$message.error('图片加载失败')
        this.isShowImg = false
      }
      img.src = this.imageSrc
    },

    handleImageLoad() {
      // 图片加载完成
    },

    // 图片检测
    async detectImage() {
      if (!this.imageFile || this.hasDetected) {
        return
      }

      this.hasDetected = true
      this.detecting = true

      try {
        const formData = new FormData()
        formData.append('file', this.imageFile)

        const response = await detectImage(formData)

        if (response && response.success && response.detections && response.detections.length > 0) {
          // 找到 confidence 最大的检测结果
          const bestDetection = response.detections.reduce((prev, current) => {
            return (prev.confidence > current.confidence) ? prev : current
          })

          // 等待图片渲染完成后再设置裁剪框
          this.$nextTick(() => {
            setTimeout(() => {
              this.setCropBoxFromDetection(bestDetection.bbox)
            }, 300)
          })
        }
      } catch (error) {
        console.error('图片检测失败:', error)
        this.$message.warning('图片检测失败，请手动调整裁剪框')
      } finally {
        this.detecting = false
      }
    },

    // 根据检测结果设置裁剪框
    setCropBoxFromDetection(bbox) {
      if (!bbox || !this.originalImageW || !this.originalImageH) {
        console.warn('无法设置裁剪框：缺少必要参数')
    return
  }

      // 验证bbox坐标
      if (bbox.x1 >= bbox.x2 || bbox.y1 >= bbox.y2) {
        console.warn('bbox坐标无效:', bbox)
            return
          }

      // 限制坐标在有效范围内
      const x1 = Math.max(0, Math.min(bbox.x1, this.originalImageW))
      const y1 = Math.max(0, Math.min(bbox.y1, this.originalImageH))
      const x2 = Math.max(x1, Math.min(bbox.x2, this.originalImageW))
      const y2 = Math.max(y1, Math.min(bbox.y2, this.originalImageH))

          // 计算缩放比例（显示尺寸 / 原始尺寸）
      const scale = (this.displayImageW / this.originalImageW) * this.currentScale

      // 将原始坐标转换为显示坐标
      const displayX1 = x1 * scale
      const displayY1 = y1 * scale
      const displayX2 = x2 * scale
      const displayY2 = y2 * scale

      // 计算裁剪框位置（相对于图片容器）
      const cropWidth = displayX2 - displayX1
      const cropHeight = displayY2 - displayY1

      // 设置裁剪框（使用 left, top, right, bottom）
      this.cutL = Math.max(0, displayX1)
      this.cutT = Math.max(0, displayY1)
      this.cutR = Math.max(0, this.displayImageW - displayX2)
      this.cutB = Math.max(0, this.displayImageH - displayY2)

      // 验证裁剪框尺寸
      if (cropWidth <= 0 || cropHeight <= 0) {
        console.warn('裁剪框尺寸无效')
        return
      }

      console.log('裁剪框已设置:', {
        bbox: { x1, y1, x2, y2 },
        display: { x1: displayX1, y1: displayY1, x2: displayX2, y2: displayY2 },
        crop: { cutL: this.cutL, cutT: this.cutT, cutR: this.cutR, cutB: this.cutB }
      })
    },

    // 鼠标滚轮缩放
    handleWheel(e) {
      e.preventDefault()
      // 向下滚动缩小（deltaY > 0），向上滚动放大（deltaY < 0）
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      // 获取鼠标在容器中的位置
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = e.clientX - rect.left
      const centerY = e.clientY - rect.top
      this.changeScale(delta, centerX, centerY)
    },

    // 改变缩放
    changeScale(scale, centerX, centerY) {
      const oldScale = this.currentScale
      let newScale = this.currentScale * scale
      newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale))

      if (newScale === oldScale) return

      // 如果有中心点，以该点为中心缩放
      if (centerX !== undefined && centerY !== undefined) {
        // 计算缩放比例变化
        const scaleChange = newScale / oldScale

        // 鼠标在容器中的位置
        const mouseX = centerX
        const mouseY = centerY

        // 鼠标相对于当前图片左上角的位置（考虑当前缩放）
        const relativeX = (mouseX - this.imageLeft) / oldScale
        const relativeY = (mouseY - this.imageTop) / oldScale

        // 计算新的图片位置，使鼠标指向的点在缩放后仍然在鼠标位置
        this.imageLeft = mouseX - relativeX * newScale
        this.imageTop = mouseY - relativeY * newScale
      }

      this.currentScale = newScale
    },

    // 重置
    reset() {
      this.currentScale = 1
      this.imageLeft = (this.containerWidth - this.displayImageW) / 2
      this.imageTop = (this.containerHeight - this.displayImageH) / 2

      // 重置裁剪框
      const initSize = Math.min(this.displayImageW, this.displayImageH) * 0.8
      this.cutL = (this.displayImageW - initSize) / 2
      this.cutT = (this.displayImageH - initSize) / 2
      this.cutR = this.cutL
      this.cutB = this.cutT
    },

    // 图片拖拽
    handleImageMouseDown(e) {
      if (e.target.tagName === 'IMG' || e.target.classList.contains('cropper-content')) {
        this.isDragging = true
        this.dragType = 'image'
        this.dragStartX = e.clientX
        this.dragStartY = e.clientY
        this.dragStartImageLeft = this.imageLeft
        this.dragStartImageTop = this.imageTop
        e.preventDefault()
      }
    },

    handleImageMouseMove(e) {
      if (this.isDragging && this.dragType === 'image') {
        const deltaX = e.clientX - this.dragStartX
        const deltaY = e.clientY - this.dragStartY
        this.imageLeft = this.dragStartImageLeft + deltaX
        this.imageTop = this.dragStartImageTop + deltaY
      } else if (this.isDragging && this.dragType === 'cropBox') {
        this.handleDragMove(e)
      }
    },

    handleImageMouseUp() {
      this.isDragging = false
      this.dragType = null
    },

    // 裁剪框拖拽
    handleCropBoxMouseDown(e) {
      // 如果点击的是控制点或边框线，不处理（由 handleDragStart 处理）
      if (e.target.classList.contains('cropper-point') || e.target.classList.contains('cropper-line')) {
        return
      }

      this.isDragging = true
      this.dragType = 'cropBox'
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      this.dragStartCutL = this.cutL
      this.dragStartCutT = this.cutT
      this.dragStartCutR = this.cutR
      this.dragStartCutB = this.cutB
      e.preventDefault()
      e.stopPropagation()

      // 添加全局事件监听
      document.addEventListener('mousemove', this.handleDragMove)
      document.addEventListener('mouseup', this.handleDragEnd)
    },

    // 调整裁剪框大小
    handleDragStart(e) {
      this.isDragging = true
      this.dragType = e.target.dataset.drag
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      this.dragStartCutL = this.cutL
      this.dragStartCutT = this.cutT
      this.dragStartCutR = this.cutR
      this.dragStartCutB = this.cutB
      e.preventDefault()
      e.stopPropagation()

      // 添加全局事件监听
      document.addEventListener('mousemove', this.handleDragMove)
      document.addEventListener('mouseup', this.handleDragEnd)
    },

    handleDragMove(e) {
      if (!this.isDragging) return

      const deltaX = (this.dragStartX - e.clientX)
      const deltaY = (this.dragStartY - e.clientY)

      switch (this.dragType) {
        case 'cropBox':
          // 移动整个裁剪框
          this.cutL = Math.max(0, Math.min(this.dragStartCutL - deltaX, this.displayImageW - (this.displayImageW - this.cutL - this.cutR)))
          this.cutT = Math.max(0, Math.min(this.dragStartCutT - deltaY, this.displayImageH - (this.displayImageH - this.cutT - this.cutB)))
          this.cutR = this.displayImageW - this.cutL - (this.displayImageW - this.dragStartCutL - this.dragStartCutR)
          this.cutB = this.displayImageH - this.cutT - (this.displayImageH - this.dragStartCutT - this.dragStartCutB)
          break
        case 'right':
          this.cutR = Math.max(0, this.dragStartCutR + deltaX)
          break
        case 'left':
          this.cutL = Math.max(0, Math.min(this.dragStartCutL - deltaX, this.displayImageW - this.cutR))
          break
        case 'top':
          this.cutT = Math.max(0, Math.min(this.dragStartCutT - deltaY, this.displayImageH - this.cutB))
          break
        case 'bottom':
          this.cutB = Math.max(0, this.dragStartCutB + deltaY)
          break
        case 'topRight':
          this.cutT = Math.max(0, Math.min(this.dragStartCutT - deltaY, this.displayImageH - this.cutB))
          this.cutR = Math.max(0, this.dragStartCutR + deltaX)
          break
        case 'rightBottom':
          this.cutR = Math.max(0, this.dragStartCutR + deltaX)
          this.cutB = Math.max(0, this.dragStartCutB + deltaY)
          break
        case 'bottomLeft':
          this.cutB = Math.max(0, this.dragStartCutB + deltaY)
          this.cutL = Math.max(0, Math.min(this.dragStartCutL - deltaX, this.displayImageW - this.cutR))
          break
        case 'leftTop':
          this.cutL = Math.max(0, Math.min(this.dragStartCutL - deltaX, this.displayImageW - this.cutR))
          this.cutT = Math.max(0, Math.min(this.dragStartCutT - deltaY, this.displayImageH - this.cutB))
          break
      }
    },

    handleDragEnd() {
      this.isDragging = false
      this.dragType = null
      document.removeEventListener('mousemove', this.handleDragMove)
      document.removeEventListener('mouseup', this.handleDragEnd)
    },

    // 确认裁剪
    confirmCrop() {
      // 计算裁剪框的左上角和右下角坐标
      const topLeftX = this.cutL
      const topLeftY = this.cutT
      const bottomRightX = this.displayImageW - this.cutR
      const bottomRightY = this.displayImageH - this.cutB

      console.log('裁剪框坐标：', {
        x1:topLeftX, y1:topLeftY,
        x2:bottomRightX, y2:bottomRightY
      })

      this.loading = true

      // 使用 canvas 裁剪图片
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // 计算裁剪区域在原始图片中的坐标
        const scale = (this.displayImageW / this.originalImageW) * this.currentScale

        // 裁剪框在显示图片中的位置
        const cropX = this.cutL
        const cropY = this.cutT
        const cropW = this.displayImageW - this.cutL - this.cutR
        const cropH = this.displayImageH - this.cutT - this.cutB

        // 转换为原始图片坐标
        const sourceX = cropX / scale
        const sourceY = cropY / scale
        const sourceW = cropW / scale
        const sourceH = cropH / scale

        // 调用保存标注接口
        this.saveAnnotationToServer(sourceX, sourceY, sourceX + sourceW, sourceY + sourceH)

        // 设置 canvas 尺寸
        canvas.width = sourceW
        canvas.height = sourceH

        // 绘制裁剪后的图片
        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH)

        // 转换为 base64
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onloadend = () => {
              const dataURL = reader.result

              // 触发事件
        this.$emit('crop-success', {
          blob: blob,
                dataURL: dataURL,
          file: this.blobToFile(blob, 'cropped-image.png')
        })

        this.loading = false
        this.closeDialog()
            }
            reader.readAsDataURL(blob)
          } else {
            this.$message.error('裁剪失败')
            this.loading = false
          }
        }, 'image/png', 1.0)
      }

      img.onerror = () => {
        this.$message.error('图片加载失败')
        this.loading = false
      }

      img.src = this.imageSrc
    },

    // 保存标注到服务器
    async saveAnnotationToServer(x1, y1, x2, y2) {
      if (!this.imageFile) {
        console.warn('没有图片文件，无法保存标注')
        return
      }

      try {
        // 构建 annotations JSON 对象
        const annotationsData = {
          annotations: [
            {
              class_id: 0,
              x1: Math.round(x1),
              y1: Math.round(y1),
              x2: Math.round(x2),
              y2: Math.round(y2)
            }
          ],
          image_width: this.originalImageW,
          image_height: this.originalImageH
        }

        // 创建 FormData
        const formData = new FormData()
        formData.append('file', this.imageFile)
        formData.append('annotations', JSON.stringify(annotationsData))

        // 调用接口
        await saveAnnotatio(formData)
        console.log('标注保存成功', annotationsData)
      } catch (error) {
        console.error('保存标注失败:', error)
        // 不显示错误提示，避免影响用户操作
      }
    },

    // 将Blob转换为File
    blobToFile(blob, fileName) {
      return new File([blob], fileName, { type: blob.type })
    },

    // 关闭窗口
    closeDialog() {
      this.dialogVisible = false
      this.isShowImg = false
      // 重置状态
      this.currentScale = 1
      this.cutL = 0
      this.cutT = 0
      this.cutR = 0
      this.cutB = 0
      this.isDragging = false
      this.dragType = null
      this.hasDetected = false // 重置检测标志

      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler)
      }

      // 移除全局事件监听
      document.removeEventListener('mousemove', this.handleDragMove)
      document.removeEventListener('mouseup', this.handleDragEnd)

      this.$emit('update:visible', false)
      this.$emit('close')
    }
  },

  beforeDestroy() {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler)
    }
    document.removeEventListener('mousemove', this.handleDragMove)
    document.removeEventListener('mouseup', this.handleDragEnd)
  }
}
</script>

<style scoped lang="scss">
.cropper-container {
  position: relative;
  overflow: hidden;
  background: #000;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: move;
}

.cropper-content {
  position: absolute;
  transform-origin: center center;
}

.cropper-content img {
  display: block;
  user-select: none;
  pointer-events: none;
}

.cropper-crop-box {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  z-index: 2;
  cursor: move;
  touch-action: none;
}

.cropper-view-box {
  position: relative;
  width: 100%;
  height: 100%;
  outline: 1px solid #69f;
  outline-color: rgba(102, 153, 255, 0.75);
}

/* 虚线 */
.cropper-dashed-h {
  position: absolute;
  top: 33.333%;
  left: 0;
  width: 100%;
  height: 33.333%;
  border-top: 1px dashed rgba(255, 255, 255, 0.5);
  border-bottom: 1px dashed rgba(255, 255, 255, 0.5);
}

.cropper-dashed-v {
  position: absolute;
  left: 33.333%;
  top: 0;
  width: 33.333%;
  height: 100%;
  border-left: 1px dashed rgba(255, 255, 255, 0.5);
  border-right: 1px dashed rgba(255, 255, 255, 0.5);
}

/* 边框线 */
.cropper-line {
  position: absolute;
  background-color: #69f;
  opacity: 0.1;
  touch-action: none;
}

.cropper-line-t {
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  cursor: n-resize;
}

.cropper-line-t::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 100%;
  transform: translateY(-50%);
  height: 20px;
  background: transparent;
  z-index: 11;
}

.cropper-line-r {
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  cursor: e-resize;
}

.cropper-line-r::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 20px;
  transform: translateX(-50%);
  height: 100%;
  background: transparent;
  z-index: 11;
}

.cropper-line-b {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  cursor: s-resize;
}

.cropper-line-b::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 100%;
  transform: translateY(-50%);
  height: 20px;
  background: transparent;
  z-index: 11;
}

.cropper-line-l {
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  cursor: w-resize;
}

.cropper-line-l::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 20px;
  transform: translateX(-50%);
  height: 100%;
  background: transparent;
  z-index: 11;
}

/* 控制点 */
.cropper-point {
  position: absolute;
  width: 5px;
  height: 5px;
  background-color: #69f;
  opacity: 0.75;
  z-index: 3;
  touch-action: none;
}

.point-t {
  top: -3px;
  left: 50%;
  margin-left: -3px;
  cursor: n-resize;
}

.point-tr {
  top: -3px;
  right: -3px;
  cursor: ne-resize;
}

.point-r {
  top: 50%;
  right: -3px;
  margin-top: -3px;
  cursor: e-resize;
}

.point-rb {
  right: -3px;
  bottom: -3px;
  cursor: se-resize;
  width: 18px;
  height: 18px;
  background-color: #69f;
  opacity: 1;
  z-index: 1112;
}

.point-b {
  bottom: -3px;
  left: 50%;
  margin-left: -3px;
  cursor: s-resize;
}

.point-bl {
  bottom: -3px;
  left: -3px;
  cursor: sw-resize;
}

.point-l {
  top: 50%;
  left: -3px;
  margin-top: -3px;
  cursor: w-resize;
}

.point-lt {
  top: -3px;
  left: -3px;
  cursor: nw-resize;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;

  i {
    font-size: 24px;
    margin-bottom: 10px;
  }
}

.dialog-footer {
  text-align: right;

}
</style>
