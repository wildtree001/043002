<template>
  <div class="viewer-container" :class="[themeClassName]" ref="viewerContainer">
    <div class="viewer-main" @mousedown="handleMouseDown" @touchstart="handleTouchStart">
      <div class="viewer-canvas" :style="canvasStyle">
        <img
          v-for="(img, index) in images"
          :src="img"
          :key="index"
          :class="{'active': currentIndex === index}"
          class="product-image"
        />
      </div>

      <div class="rotation-indicator">
        <div class="progress-bar">
          <div class="progress-fill" :style="{width: progressPercent + '%'}"></div>
        </div>
        <span class="progress-text">{{currentIndex + 1}}/{{images.length}}</span>
      </div>

      <div class="zoom-controls">
        <button @click.stop="zoomIn" class="zoom-btn"><i class="fa fa-search-plus"></i></button>
        <button @click.stop="zoomOut" class="zoom-btn"><i class="fa fa-search-minus"></i></button>
        <button @click.stop="resetView" class="zoom-btn"><i class="fa fa-refresh"></i></button>
      </div>

      <div class="auto-rotate-control">
        <button @click.stop="toggleAutoRotate" class="auto-btn" :class="{'active': isAutoRotating}">
          <i class="fa" :class="isAutoRotating ? 'fa-pause' : 'fa-play'"></i>
          {{isAutoRotating ? '停止' : '自动旋转'}}
        </button>
      </div>
    </div>

    <div class="accessories-panel" v-show="showAccessories">
      <h4 class="panel-title">当前角度推荐配件</h4>
      <div class="accessories-list">
        <div
          v-for="accessory in currentAccessories"
          :key="accessory.id"
          class="accessory-item"
          @click="selectAccessory(accessory)"
        >
          <img :src="accessory.imgUrl" :alt="accessory.title" />
          <div class="accessory-info">
            <h5 class="accessory-title">{{accessory.title}}</h5>
            <p class="accessory-price">¥{{accessory.price}}</p>
            <button class="add-btn" @click.stop="addToCart(accessory)">
              <i class="fa fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="viewer-hint">
      <i class="fa fa-hand-pointer-o"></i>
      拖拽旋转 | 滚轮缩放 | 双击重置
    </div>
  </div>
</template>

<script>
export default {
  props: {
    productId: {
      type: String,
      default: 'default'
    },
    images: {
      type: Array,
      default: function () {
        return [
          '//i1.mifile.cn/a1/T1HcAQBgDT1RXrhCrK!220x220.jpg',
          '//i1.mifile.cn/a1/T1OVC_ByY_1RXrhCrK!220x220.jpg',
          '//i1.mifile.cn/a1/T17FCQByWv1RXrhCrK!220x220.jpg',
          '//i3.mifile.cn/a4/T1zTK_Bbhv1RXrhCrK.jpg',
          '//i1.mifile.cn/a1/pms_1464615180.86261317!220x220.jpg',
          '//i1.mifile.cn/a1/pms_1470730028.12443689!220x220.jpg',
          '//i1.mifile.cn/a1/T1HcAQBgDT1RXrhCrK!220x220.jpg',
          '//i1.mifile.cn/a1/T1OVC_ByY_1RXrhCrK!220x220.jpg'
        ]
      }
    },
    accessories: {
      type: Object,
      default: function () {
        return {
          0: [
            {id: 1, title: '小米手机5 保护壳', price: '49', imgUrl: '//i1.mifile.cn/a1/T12AWgB5Vv1RXrhCrK!220x220.jpg'},
            {id: 2, title: '小米手机5 钢化膜', price: '29', imgUrl: '//i1.mifile.cn/a1/T1t2K_B4L_1RXrhCrK!220x220.jpg'}
          ],
          45: [
            {id: 3, title: '小米移动电源 10000mAh', price: '79', imgUrl: '//i2.mifile.cn/a1/T12HJvByEv1RXrhCrK.jpg?width=150&height=150'},
            {id: 4, title: '小米圈铁耳机', price: '99', imgUrl: '//i2.mifile.cn/a1/T1ycK_BjYv1RXrhCrK.jpg?width=150&height=150'}
          ],
          90: [
            {id: 5, title: '小米手环2', price: '149', imgUrl: '//i1.mifile.cn/a1/T1HcAQBgDT1RXrhCrK!220x220.jpg'},
            {id: 6, title: '小米蓝牙音箱', price: '199', imgUrl: '//i1.mifile.cn/a1/T15hZ_BsDv1RXrhCrK!220x220.jpg'}
          ],
          135: [
            {id: 7, title: '小米插线板', price: '49', imgUrl: '//i2.mifile.cn/a1/pms_1463579883.27084326.jpg?width=150&height=150'},
            {id: 8, title: '小米路由器3', price: '149', imgUrl: '//i3.mifile.cn/a4/T1rQAgB7Av1RXrhCrK.jpg'}
          ],
          180: [
            {id: 9, title: '小米空气净化器2', price: '699', imgUrl: '//i1.mifile.cn/a1/pms_1464615180.86261317!220x220.jpg'},
            {id: 10, title: '小米净水器', price: '1299', imgUrl: '//i3.mifile.cn/a4/T1zTK_Bbhv1RXrhCrK.jpg'}
          ]
        }
      }
    }
  },
  data () {
    return {
      currentIndex: 0,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
      isAutoRotating: false,
      autoRotateTimer: null,
      rotationSpeed: 2,
      showAccessories: true,
      currentTheme: 'orange'
    }
  },
  computed: {
    themeClassName: function () {
      return 'theme-' + this.currentTheme
    },
    progressPercent: function () {
      return Math.round((this.currentIndex / (this.images.length - 1)) * 100)
    },
    canvasStyle: function () {
      return {
        transform: 'scale(' + this.scale + ') translate(' + this.translateX + 'px, ' + this.translateY + 'px)',
        transition: this.isDragging ? 'none' : 'transform 0.3s ease'
      }
    },
    currentAccessories: function () {
      var angle = this.currentIndex * (360 / this.images.length)
      var keys = Object.keys(this.accessories).map(Number).sort(function (a, b) { return a - b })
      var closestKey = 0
      var minDiff = 360

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var diff = Math.abs(angle - key)
        if (diff < minDiff) {
          minDiff = diff
          closestKey = key
        }
      }

      return this.accessories[closestKey] || this.accessories[0] || []
    }
  },
  ready () {
    this.bindEvents()
    var self = this
    this.$on('themeChange', function (theme) {
      self.currentTheme = theme
    })
  },
  beforeDestroy () {
    this.unbindEvents()
    if (this.autoRotateTimer) {
      clearInterval(this.autoRotateTimer)
    }
  },
  methods: {
    bindEvents () {
      var container = this.$els.viewerContainer || this.$refs.viewerContainer
      if (!container) return

      window.addEventListener('mousemove', this.handleMouseMove)
      window.addEventListener('mouseup', this.handleMouseUp)
      window.addEventListener('touchmove', this.handleTouchMove)
      window.addEventListener('touchend', this.handleTouchEnd)
      container.addEventListener('wheel', this.handleWheel)
      container.addEventListener('dblclick', this.resetView)
    },
    unbindEvents () {
      window.removeEventListener('mousemove', this.handleMouseMove)
      window.removeEventListener('mouseup', this.handleMouseUp)
      window.removeEventListener('touchmove', this.handleTouchMove)
      window.removeEventListener('touchend', this.handleTouchEnd)
    },
    handleMouseDown: function (e) {
      this.isDragging = true
      this.lastX = e.clientX
      this.lastY = e.clientY
      if (this.isAutoRotating) {
        this.toggleAutoRotate()
      }
    },
    handleMouseMove: function (e) {
      if (!this.isDragging) return

      var deltaX = e.clientX - this.lastX
      var deltaY = e.clientY - this.lastY

      if (e.shiftKey) {
        this.translateX += deltaX
        this.translateY += deltaY
      } else {
        this.rotateByDelta(deltaX)
      }

      this.lastX = e.clientX
      this.lastY = e.clientY
    },
    handleMouseUp: function () {
      this.isDragging = false
    },
    handleTouchStart: function (e) {
      if (e.touches.length === 1) {
        this.isDragging = true
        this.lastX = e.touches[0].clientX
        this.lastY = e.touches[0].clientY
        if (this.isAutoRotating) {
          this.toggleAutoRotate()
        }
      }
    },
    handleTouchMove: function (e) {
      if (!this.isDragging || e.touches.length !== 1) return

      var deltaX = e.touches[0].clientX - this.lastX
      this.rotateByDelta(deltaX)

      this.lastX = e.touches[0].clientX
      this.lastY = e.touches[0].clientY
    },
    handleTouchEnd: function () {
      this.isDragging = false
    },
    handleWheel: function (e) {
      e.preventDefault()
      var delta = e.deltaY > 0 ? -0.1 : 0.1
      this.scale = Math.max(0.5, Math.min(3, this.scale + delta))
    },
    rotateByDelta: function (deltaX) {
      var threshold = 20
      var steps = Math.floor(Math.abs(deltaX) / threshold)

      if (steps > 0) {
        var direction = deltaX > 0 ? 1 : -1
        for (var i = 0; i < steps; i++) {
          this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length
        }
      }
    },
    zoomIn: function () {
      this.scale = Math.min(3, this.scale + 0.2)
    },
    zoomOut: function () {
      this.scale = Math.max(0.5, this.scale - 0.2)
    },
    resetView: function () {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
    },
    toggleAutoRotate: function () {
      var self = this
      this.isAutoRotating = !this.isAutoRotating

      if (this.isAutoRotating) {
        this.autoRotateTimer = setInterval(function () {
          self.currentIndex = (self.currentIndex + 1) % self.images.length
        }, 500 / this.rotationSpeed)
      } else {
        if (this.autoRotateTimer) {
          clearInterval(this.autoRotateTimer)
          this.autoRotateTimer = null
        }
      }
    },
    selectAccessory: function (accessory) {
      this.$dispatch('accessorySelected', accessory)
    },
    addToCart: function (accessory) {
      this.$dispatch('addToCart', {
        id: accessory.id,
        title: accessory.title,
        price: accessory.price,
        imgUrl: accessory.imgUrl,
        quantity: 1
      })
    }
  }
}
</script>

<style scoped>
.viewer-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.viewer-main {
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
  cursor: grab;
  user-select: none;
  overflow: hidden;
}

.viewer-main:active {
  cursor: grabbing;
}

.viewer-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
}

.product-image {
  position: absolute;
  max-width: 80%;
  max-height: 80%;
  opacity: 0;
  transition: opacity 0.2s ease;
  object-fit: contain;
}

.product-image.active {
  opacity: 1;
}

.rotation-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 20px;
}

.progress-bar {
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff6700;
  transition: width 0.2s ease;
}

.progress-text {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.zoom-controls {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zoom-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  font-size: 16px;
}

.zoom-btn:hover {
  background: #ff6700;
  color: #fff;
  transform: scale(1.1);
}

.auto-rotate-control {
  position: absolute;
  left: 20px;
  top: 20px;
}

.auto-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.auto-btn:hover,
.auto-btn.active {
  background: #ff6700;
  color: #fff;
}

.auto-btn.active {
  box-shadow: 0 2px 12px rgba(255, 103, 0, 0.4);
}

.accessories-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 280px;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-left: 1px solid #e0e0e0;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.panel-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #ff6700;
}

.accessories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.accessory-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.accessory-item:hover {
  background: #fff5f0;
  box-shadow: 0 2px 8px rgba(255, 103, 0, 0.2);
}

.accessory-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.accessory-info {
  flex: 1;
  min-width: 0;
}

.accessory-title {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.accessory-price {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #ff6700;
}

.add-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #ff6700;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #ff8c00;
  transform: scale(1.1);
}

.viewer-hint {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.viewer-hint i {
  color: #ff6700;
}

.theme-dark .viewer-container {
  background: #1a1a1a;
}

.theme-dark .viewer-main {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
}

.theme-pink .progress-fill,
.theme-pink .auto-btn:hover,
.theme-pink .auto-btn.active,
.theme-pink .add-btn,
.theme-pink .panel-title {
  border-bottom-color: #ff69b4;
  background: #ff69b4;
}

.theme-pink .accessory-item:hover {
  background: #fff0f5;
  box-shadow: 0 2px 8px rgba(255, 105, 180, 0.2);
}

.theme-blue .progress-fill,
.theme-blue .auto-btn:hover,
.theme-blue .auto-btn.active,
.theme-blue .add-btn,
.theme-blue .panel-title {
  border-bottom-color: #2196f3;
  background: #2196f3;
}

.theme-blue .accessory-item:hover {
  background: #e3f2fd;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.theme-green .progress-fill,
.theme-green .auto-btn:hover,
.theme-green .auto-btn.active,
.theme-green .add-btn,
.theme-green .panel-title {
  border-bottom-color: #4caf50;
  background: #4caf50;
}

.theme-green .accessory-item:hover {
  background: #e8f5e9;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}
</style>
