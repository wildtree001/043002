<template>
  <div class="theme-container">
    <div class="theme-trigger" @click="togglePanel">
      <i class="fa fa-paint-brush"></i>
      <span class="trigger-text">主题</span>
    </div>
    
    <div class="theme-panel" v-show="isPanelVisible" transition="panel-slide">
      <div class="panel-header">
        <h4 class="panel-title">主题设置</h4>
        <button class="panel-close" @click="togglePanel">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <div class="preset-themes">
        <h5 class="section-title">预设主题</h5>
        <div class="themes-grid">
          <div 
            v-for="theme in presetThemes"
            :key="theme.id"
            class="theme-card"
            :class="{'active': currentTheme === theme.id, 'previewing': previewTheme === theme.id}"
            @mouseenter="startPreview(theme.id)"
            @mouseleave="stopPreview"
            @click="selectTheme(theme.id)"
          >
            <div class="theme-preview" :style="getThemePreviewStyle(theme)">
              <div class="preview-top" :style="{background: theme.colors.primary}"></div>
              <div class="preview-content">
                <div class="preview-sidebar" :style="{background: theme.colors.background || '#fff'}"></div>
                <div class="preview-main">
                  <div class="preview-item" :style="{background: theme.colors.primary + '20'}"></div>
                  <div class="preview-item" :style="{background: theme.colors.primary + '10'}"></div>
                  <div class="preview-item" :style="{background: theme.colors.primary + '15'}"></div>
                </div>
              </div>
            </div>
            <div class="theme-info">
              <span class="theme-name">{{theme.name}}</span>
              <span class="check-icon" v-show="currentTheme === theme.id">
                <i class="fa fa-check"></i>
              </span>
            </div>
            <div class="theme-colors">
              <span 
                v-for="color in theme.colorList"
                :key="color"
                class="color-dot"
                :style="{background: color}"
              ></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="custom-theme-section">
        <h5 class="section-title">自定义主题</h5>
        <div class="custom-controls">
          <div class="color-input-group">
            <label class="color-label">主色调</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="customPrimary"
                @input="updateCustomTheme"
                class="color-input"
              />
              <span class="color-hex">{{customPrimary}}</span>
            </div>
          </div>
          
          <div class="color-input-group">
            <label class="color-label">背景色</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="customBackground"
                @input="updateCustomTheme"
                class="color-input"
              />
              <span class="color-hex">{{customBackground}}</span>
            </div>
          </div>
          
          <div class="color-input-group">
            <label class="color-label">文字色</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="customText"
                @input="updateCustomTheme"
                class="color-input"
              />
              <span class="color-hex">{{customText}}</span>
            </div>
          </div>
        </div>
        
        <div class="custom-preview" :style="getCustomPreviewStyle()">
          <div class="preview-bar" :style="{background: customPrimary}"></div>
          <div class="preview-content">
            <p class="preview-text" :style="{color: customText}">预览文本示例</p>
            <button class="preview-button" :style="{background: customPrimary}">按钮</button>
          </div>
        </div>
        
        <div class="custom-actions">
          <button class="apply-custom-btn" @click="applyCustomTheme">
            应用自定义主题
          </button>
          <button class="reset-custom-btn" @click="resetCustomTheme">
            重置
          </button>
        </div>
      </div>
      
      <div class="quick-colors">
        <h5 class="section-title">快速选色</h5>
        <div class="color-palette">
          <button 
            v-for="color in quickColors"
            :key="color"
            class="palette-color"
            :class="{'active': customPrimary === color}"
            :style="{background: color}"
            @click="selectQuickColor(color)"
          ></button>
        </div>
      </div>
      
      <div class="theme-settings">
        <div class="setting-item">
          <label class="setting-label">保存主题偏好</label>
          <div class="setting-toggle" :class="{'active': saveToLocal}" @click="toggleSaveToLocal">
            <div class="toggle-handle"></div>
          </div>
        </div>
        <div class="setting-item">
          <label class="setting-label">主题切换动画</label>
          <div class="setting-toggle" :class="{'active': enableAnimation}" @click="toggleAnimation">
            <div class="toggle-handle"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="theme-overlay" 
         v-show="isTransitioning"
         :style="getTransitionStyle()"
    ></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isPanelVisible: false,
      currentTheme: 'orange',
      previewTheme: null,
      isTransitioning: false,
      transitionProgress: 0,
      transitionFromColor: '#ff6700',
      transitionToColor: '#ff6700',
      saveToLocal: true,
      enableAnimation: true,
      customPrimary: '#ff6700',
      customBackground: '#ffffff',
      customText: '#333333',
      presetThemes: [
        {
          id: 'orange',
          name: '小米橙',
          colorList: ['#ff6700', '#ff8c00', '#ffac13', '#ffffff'],
          colors: {
            primary: '#ff6700',
            secondary: '#ff8c00',
            accent: '#ffac13',
            background: '#ffffff',
            text: '#333333'
          }
        },
        {
          id: 'dark',
          name: '科技黑',
          colorList: ['#64b5f6', '#42a5f5', '#2196f3', '#1a1a1a'],
          colors: {
            primary: '#64b5f6',
            secondary: '#42a5f5',
            accent: '#2196f3',
            background: '#1a1a1a',
            text: '#e0e0e0'
          }
        },
        {
          id: 'pink',
          name: '青春粉',
          colorList: ['#ff69b4', '#ff85c1', '#ff6eb4', '#fff5f8'],
          colors: {
            primary: '#ff69b4',
            secondary: '#ff85c1',
            accent: '#ff6eb4',
            background: '#fff5f8',
            text: '#333333'
          }
        },
        {
          id: 'blue',
          name: '海洋蓝',
          colorList: ['#2196f3', '#42a5f5', '#64b5f6', '#e3f2fd'],
          colors: {
            primary: '#2196f3',
            secondary: '#42a5f5',
            accent: '#64b5f6',
            background: '#e3f2fd',
            text: '#1a237e'
          }
        },
        {
          id: 'green',
          name: '自然绿',
          colorList: ['#4caf50', '#66bb6a', '#81c784', '#e8f5e9'],
          colors: {
            primary: '#4caf50',
            secondary: '#66bb6a',
            accent: '#81c784',
            background: '#e8f5e9',
            text: '#1b5e20'
          }
        }
      ],
      quickColors: [
        '#ff6700', '#ff4081', '#e040fb', '#7c4dff',
        '#536dfe', '#448aff', '#40c4ff', '#18ffff',
        '#69f0ae', '#b2ff59', '#eeff41', '#ffd740',
        '#ffab40', '#ff6e40', '#f50057', '#c51162'
      ]
    }
  },
  ready () {
    this.loadSavedTheme()
  },
  methods: {
    findThemeById: function (themeId) {
      for (var i = 0; i < this.presetThemes.length; i++) {
        if (this.presetThemes[i].id === themeId) {
          return this.presetThemes[i]
        }
      }
      return null
    },
    togglePanel () {
      this.isPanelVisible = !this.isPanelVisible
    },
    startPreview (themeId) {
      if (this.enableAnimation) {
        this.previewTheme = themeId
        var theme = this.findThemeById(themeId)
        if (theme) {
          this.$broadcast('themeChange', themeId)
        }
      }
    },
    stopPreview () {
      if (this.enableAnimation && this.previewTheme) {
        this.previewTheme = null
        this.$broadcast('themeChange', this.currentTheme)
      }
    },
    selectTheme (themeId) {
      if (themeId === this.currentTheme) return
      
      var theme = this.findThemeById(themeId)
      if (!theme) return
      
      if (this.enableAnimation) {
        this.playThemeTransition(themeId)
      } else {
        this.applyTheme(themeId)
      }
    },
    playThemeTransition (themeId) {
      var currentThemeObj = this.findThemeById(this.currentTheme)
      var newThemeObj = this.findThemeById(themeId)
      
      this.transitionFromColor = currentThemeObj ? currentThemeObj.colors.primary : '#ff6700'
      this.transitionToColor = newThemeObj ? newThemeObj.colors.primary : '#ff6700'
      this.isTransitioning = true
      this.transitionProgress = 0
      
      const duration = 600
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        this.transitionProgress = Math.min(elapsed / duration, 1)
        
        if (this.transitionProgress >= 1) {
          this.applyTheme(themeId)
          this.isTransitioning = false
          return
        }
        
        requestAnimationFrame(animate)
      }
      
      animate()
    },
    getTransitionStyle () {
      const progress = this.transitionProgress
      const scale = 1 + progress * 3
      const opacity = 1 - progress
      
      return {
        background: `radial-gradient(circle, ${this.transitionToColor} 0%, ${this.transitionFromColor} 100%)`,
        transform: `scale(${scale})`,
        opacity: opacity
      }
    },
    applyTheme (themeId) {
      this.currentTheme = themeId
      this.previewTheme = null
      this.$broadcast('themeChange', themeId)
      this.$dispatch('themeChanged', themeId)
      
      var theme = this.findThemeById(themeId)
      if (theme) {
        this.customPrimary = theme.colors.primary
        this.customBackground = theme.colors.background
        this.customText = theme.colors.text
      }
      
      if (this.saveToLocal) {
        this.saveThemeToLocal()
      }
    },
    getThemePreviewStyle (theme) {
      return {
        borderColor: theme.colors.primary + '40'
      }
    },
    updateCustomTheme () {
    },
    getCustomPreviewStyle () {
      return {
        background: this.customBackground,
        borderColor: this.customPrimary
      }
    },
    applyCustomTheme () {
      const customThemeId = `custom_${Date.now()}`
      const customTheme = {
        id: customThemeId,
        name: '自定义主题',
        colors: {
          primary: this.customPrimary,
          secondary: this.lightenColor(this.customPrimary, 20),
          accent: this.darkenColor(this.customPrimary, 10),
          background: this.customBackground,
          text: this.customText
        }
      }
      
      this.presetThemes.push(customTheme)
      this.selectTheme(customThemeId)
    },
    resetCustomTheme () {
      var theme = this.findThemeById(this.currentTheme)
      if (theme) {
        this.customPrimary = theme.colors.primary
        this.customBackground = theme.colors.background
        this.customText = theme.colors.text
      }
    },
    selectQuickColor (color) {
      this.customPrimary = color
    },
    toggleSaveToLocal () {
      this.saveToLocal = !this.saveToLocal
    },
    toggleAnimation () {
      this.enableAnimation = !this.enableAnimation
    },
    saveThemeToLocal () {
      try {
        localStorage.setItem('miTheme', JSON.stringify({
          currentTheme: this.currentTheme,
          customPrimary: this.customPrimary,
          customBackground: this.customBackground,
          customText: this.customText,
          saveToLocal: this.saveToLocal,
          enableAnimation: this.enableAnimation
        }))
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e)
      }
    },
    loadSavedTheme () {
      try {
        const saved = localStorage.getItem('miTheme')
        if (saved) {
          const data = JSON.parse(saved)
          if (data.currentTheme) {
            this.currentTheme = data.currentTheme
          }
          if (data.customPrimary) {
            this.customPrimary = data.customPrimary
          }
          if (data.customBackground) {
            this.customBackground = data.customBackground
          }
          if (data.customText) {
            this.customText = data.customText
          }
          if (data.saveToLocal !== undefined) {
            this.saveToLocal = data.saveToLocal
          }
          if (data.enableAnimation !== undefined) {
            this.enableAnimation = data.enableAnimation
          }
          
          this.$broadcast('themeChange', this.currentTheme)
        }
      } catch (e) {
        console.warn('Failed to load theme from localStorage:', e)
      }
    },
    lightenColor (color, percent) {
      const num = parseInt(color.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = (num >> 8 & 0x00FF) + amt
      const B = (num & 0x0000FF) + amt
      return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      ).toString(16).slice(1)
    },
    darkenColor (color, percent) {
      return this.lightenColor(color, -percent)
    }
  }
}
</script>

<style scoped>
.theme-container {
  position: relative;
  display: inline-block;
}

.theme-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-trigger:hover {
  background: rgba(255, 103, 0, 0.1);
}

.theme-trigger i {
  font-size: 16px;
  color: #ff6700;
}

.trigger-text {
  font-size: 13px;
  color: #333;
}

.theme-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 500px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow-y: auto;
}

.panel-slide-transition {
  transition: all 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.panel-slide-enter,
.panel-slide-leave {
  opacity: 0;
  transform: translateY(-10px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.panel-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  font-size: 14px;
  transition: all 0.2s ease;
}

.panel-close:hover {
  background: #f0f0f0;
  color: #333;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.preset-themes,
.custom-theme-section,
.quick-colors,
.theme-settings {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.theme-card {
  position: relative;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-card:hover {
  border-color: #ff6700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-card.active {
  border-color: #ff6700;
  box-shadow: 0 0 0 2px rgba(255, 103, 0, 0.2);
}

.theme-card.previewing {
  transform: scale(1.02);
}

.theme-preview {
  height: 80px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-top {
  height: 16px;
}

.preview-content {
  display: flex;
  height: calc(100% - 16px);
}

.preview-sidebar {
  width: 30%;
  background: #f5f5f5;
}

.preview-main {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item {
  height: 12px;
  border-radius: 2px;
}

.theme-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
}

.theme-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.check-icon {
  color: #ff6700;
  font-size: 14px;
}

.theme-colors {
  display: flex;
  gap: 4px;
  padding: 0 10px 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.custom-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.color-input-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-label {
  font-size: 12px;
  color: #666;
  min-width: 60px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 40px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.color-hex {
  font-size: 11px;
  color: #999;
  font-family: monospace;
  min-width: 60px;
}

.custom-preview {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.preview-bar {
  height: 24px;
}

.custom-preview .preview-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-text {
  margin: 0;
  font-size: 13px;
}

.preview-button {
  align-self: flex-start;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.custom-actions {
  display: flex;
  gap: 10px;
}

.apply-custom-btn,
.reset-custom-btn {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-custom-btn {
  background: #ff6700;
  color: #fff;
  border: none;
}

.apply-custom-btn:hover {
  background: #ff8c00;
}

.reset-custom-btn {
  background: #fff;
  color: #666;
  border: 1px solid #e0e0e0;
}

.reset-custom-btn:hover {
  border-color: #999;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.palette-color {
  width: 100%;
  padding-bottom: 100%;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.palette-color:hover {
  transform: scale(1.1);
}

.palette-color.active {
  border-color: #333;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
}

.theme-settings {
  border-bottom: none;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.setting-label {
  font-size: 13px;
  color: #333;
}

.setting-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.setting-toggle.active {
  background: #ff6700;
}

.toggle-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.setting-toggle.active .toggle-handle {
  transform: translateX(20px);
}

.theme-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform-origin: center center;
}
</style>
