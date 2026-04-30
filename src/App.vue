<template>
  <div id="app" :class="[themeClassName]">
    <top-bar></top-bar>
    <top-header></top-header>
    <top-banner></top-banner>
    <top-sub></top-sub>
    
    <div class="new-features-section" v-if="showNewFeatures">
      <div class="features-header">
        <h3 class="features-title">
          <i class="fa fa-star"></i>
          新功能演示
        </h3>
        <div class="feature-tabs">
          <button 
            class="tab-btn" 
            :class="{'active': activeTab === '3d'}"
            @click="activeTab = '3d'"
          >
            <i class="fa fa-cube"></i>
            3D预览
          </button>
          <button 
            class="tab-btn" 
            :class="{'active': activeTab === 'cart'}"
            @click="activeTab = 'cart'"
          >
            <i class="fa fa-shopping-cart"></i>
            智能购物车
          </button>
          <button 
            class="tab-btn" 
            :class="{'active': activeTab === 'theme'}"
            @click="activeTab = 'theme'"
          >
            <i class="fa fa-paint-brush"></i>
            主题切换
          </button>
        </div>
        <button class="toggle-features" @click="showNewFeatures = !showNewFeatures">
          <i class="fa" :class="showNewFeatures ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
      </div>
      
      <div class="features-content">
        <div class="feature-panel" v-show="activeTab === '3d'">
          <div class="panel-description">
            <h4>商品3D预览交互</h4>
            <ul>
              <li><i class="fa fa-check"></i> 360度旋转预览，支持鼠标/手势拖拽</li>
              <li><i class="fa fa-check"></i> 缩放（滚轮/按钮）和平移（Shift+拖拽）</li>
              <li><i class="fa fa-check"></i> 旋转进度指示器</li>
              <li><i class="fa fa-check"></i> 自动旋转模式</li>
              <li><i class="fa fa-check"></i> 不同角度显示对应配件推荐</li>
            </ul>
          </div>
          <product-3d-viewer></product-3d-viewer>
        </div>
        
        <div class="feature-panel" v-show="activeTab === 'cart'">
          <div class="panel-description">
            <h4>智能购物车推荐</h4>
            <ul>
              <li><i class="fa fa-check"></i> 基于浏览历史的商品推荐</li>
              <li><i class="fa fa-check"></i> 拖拽添加购物车，支持排序</li>
              <li><i class="fa fa-check"></i> 自定义组合套餐（折扣计算）</li>
              <li><i class="fa fa-check"></i> 价格趋势图表</li>
              <li><i class="fa fa-check"></i> 价格对比弹窗</li>
            </ul>
          </div>
          <div class="shopping-cart-demo">
            <p class="demo-hint">购物车功能已集成到顶部导航栏，点击右上角购物车图标查看</p>
            <div class="demo-products">
              <div 
                v-for="product in demoProducts"
                :key="product.id"
                class="demo-product"
                @click="addDemoProduct(product)"
              >
                <img :src="product.imgUrl" :alt="product.title" />
                <h5>{{product.title}}</h5>
                <p class="price">¥{{product.price}}</p>
                <button class="add-to-cart-btn">
                  <i class="fa fa-plus"></i>
                  添加购物车
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="feature-panel" v-show="activeTab === 'theme'">
          <div class="panel-description">
            <h4>多主题实时切换</h4>
            <ul>
              <li><i class="fa fa-check"></i> 5种预设主题（小米橙、科技黑、青春粉、海洋蓝、自然绿）</li>
              <li><i class="fa fa-check"></i> 实时切换无需刷新</li>
              <li><i class="fa fa-check"></i> 主题色影响所有组件</li>
              <li><i class="fa fa-check"></i> 支持自定义主题色</li>
              <li><i class="fa fa-check"></i> 保存主题偏好到本地</li>
              <li><i class="fa fa-check"></i> 主题切换动画效果</li>
            </ul>
          </div>
          <div class="theme-demo">
            <p class="demo-hint">主题切换功能已集成到顶部导航栏，点击右上角主题图标体验</p>
            <div class="theme-preview-grid">
              <div 
                v-for="theme in themeList"
                :key="theme.id"
                class="theme-preview-card"
                :class="{'active': currentTheme === theme.id}"
                @click="switchTheme(theme.id)"
              >
                <div class="theme-color-strip" :style="{background: theme.color}"></div>
                <span class="theme-name">{{theme.name}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <goods></goods>
    <temp-footer></temp-footer>
    <play-video :play-config="playConfig"></play-video>
  </div>
</template>

<script>
import TopBar from './components/TopBar'
import TopHeader from './components/TopHeader'
import TopBanner from './components/TopBanner'
import TopSub from './components/TopSub'
import Goods from './components/Goods'
import TempFooter from './components/TempFooter'
import PlayVideo from './components/common/PlayVideo'
import Product3DViewer from './components/Product3DViewer'

export default {
  data () {
    return {
      playConfig: {},
      showNewFeatures: true,
      activeTab: '3d',
      currentTheme: 'orange',
      demoProducts: [
        {id: 201, title: '小米移动电源 10000mAh', price: '79', imgUrl: '//i2.mifile.cn/a1/T12HJvByEv1RXrhCrK.jpg?width=150&height=150'},
        {id: 202, title: '小米圈铁耳机', price: '99', imgUrl: '//i2.mifile.cn/a1/T1ycK_BjYv1RXrhCrK.jpg?width=150&height=150'},
        {id: 203, title: '小米手环2', price: '149', imgUrl: '//i1.mifile.cn/a1/T1HcAQBgDT1RXrhCrK!220x220.jpg'},
        {id: 204, title: '小米路由器3', price: '149', imgUrl: '//i3.mifile.cn/a4/T1rQAgB7Av1RXrhCrK.jpg'}
      ],
      themeList: [
        {id: 'orange', name: '小米橙', color: '#ff6700'},
        {id: 'dark', name: '科技黑', color: '#64b5f6'},
        {id: 'pink', name: '青春粉', color: '#ff69b4'},
        {id: 'blue', name: '海洋蓝', color: '#2196f3'},
        {id: 'green', name: '自然绿', color: '#4caf50'}
      ]
    }
  },
  computed: {
    themeClassName: function () {
      return 'theme-' + this.currentTheme
    }
  },
  ready () {
    this.recivePlayVideo()
    this.listenThemeChange()
  },
  methods: {
    recivePlayVideo () {
      this.$on('play', function (opts) {
        this.playConfig = opts
      })
    },
    listenThemeChange () {
      const self = this
      this.$on('themeChanged', function (themeId) {
        self.currentTheme = themeId
      })
    },
    addDemoProduct (product) {
      var item = {}
      for (var key in product) {
        item[key] = product[key]
      }
      item.quantity = 1
      this.$broadcast('addToCart', item)
    },
    switchTheme (themeId) {
      this.currentTheme = themeId
      this.$broadcast('themeChange', themeId)
    }
  },
  components: {
    'top-bar': TopBar,
    'top-header': TopHeader,
    'top-banner': TopBanner,
    'top-sub': TopSub,
    'goods': Goods,
    'temp-footer': TempFooter,
    'play-video': PlayVideo,
    'product-3d-viewer': Product3DViewer
  }
}
</script>

<style>
@import './assets/css/base.css';

.new-features-section {
  width: 1226px;
  margin: 20px auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.features-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #ff6700 0%, #ff8c00 100%);
}

.features-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.features-title i {
  font-size: 20px;
}

.feature-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tab-btn.active {
  background: #fff;
  color: #ff6700;
}

.toggle-features {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-features:hover {
  background: rgba(255, 255, 255, 0.3);
}

.features-content {
  padding: 24px;
}

.feature-panel {
  display: flex;
  gap: 24px;
}

.panel-description {
  flex: 0 0 280px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.panel-description h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #ff6700;
}

.panel-description ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.panel-description li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.panel-description li i {
  color: #4caf50;
  margin-top: 2px;
}

.shopping-cart-demo,
.theme-demo {
  flex: 1;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.demo-hint {
  margin: 0 0 16px 0;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 6px;
  font-size: 13px;
  color: #1565c0;
}

.demo-products {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.demo-product {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.demo-product:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #ff6700;
}

.demo-product img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-bottom: 12px;
}

.demo-product h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #333;
  font-weight: normal;
}

.demo-product .price {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ff6700;
}

.add-to-cart-btn {
  width: 100%;
  padding: 8px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-to-cart-btn:hover {
  background: #ff8c00;
}

.theme-preview-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.theme-preview-card {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.theme-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.theme-preview-card.active {
  border-color: #ff6700;
}

.theme-color-strip {
  height: 40px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.theme-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.theme-orange .features-header {
  background: linear-gradient(135deg, #ff6700 0%, #ff8c00 100%);
}

.theme-orange .tab-btn.active {
  color: #ff6700;
}

.theme-orange .panel-description h4 {
  border-bottom-color: #ff6700;
}

.theme-orange .demo-product:hover,
.theme-orange .theme-preview-card.active {
  border-color: #ff6700;
}

.theme-orange .demo-product .price,
.theme-orange .add-to-cart-btn {
  color: #ff6700;
}

.theme-orange .add-to-cart-btn {
  background: #ff6700;
  color: #fff;
}

.theme-orange .add-to-cart-btn:hover {
  background: #ff8c00;
}

.theme-pink .features-header {
  background: linear-gradient(135deg, #ff69b4 0%, #ff85c1 100%);
}

.theme-pink .tab-btn.active {
  color: #ff69b4;
}

.theme-pink .panel-description h4 {
  border-bottom-color: #ff69b4;
}

.theme-pink .demo-product:hover,
.theme-pink .theme-preview-card.active {
  border-color: #ff69b4;
}

.theme-pink .demo-product .price {
  color: #ff69b4;
}

.theme-pink .add-to-cart-btn {
  background: #ff69b4;
}

.theme-pink .add-to-cart-btn:hover {
  background: #ff85c1;
}

.theme-blue .features-header {
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
}

.theme-blue .tab-btn.active {
  color: #2196f3;
}

.theme-blue .panel-description h4 {
  border-bottom-color: #2196f3;
}

.theme-blue .demo-product:hover,
.theme-blue .theme-preview-card.active {
  border-color: #2196f3;
}

.theme-blue .demo-product .price {
  color: #2196f3;
}

.theme-blue .add-to-cart-btn {
  background: #2196f3;
}

.theme-blue .add-to-cart-btn:hover {
  background: #42a5f5;
}

.theme-green .features-header {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.theme-green .tab-btn.active {
  color: #4caf50;
}

.theme-green .panel-description h4 {
  border-bottom-color: #4caf50;
}

.theme-green .demo-product:hover,
.theme-green .theme-preview-card.active {
  border-color: #4caf50;
}

.theme-green .demo-product .price {
  color: #4caf50;
}

.theme-green .add-to-cart-btn {
  background: #4caf50;
}

.theme-green .add-to-cart-btn:hover {
  background: #66bb6a;
}

.theme-dark .features-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

.theme-dark .tab-btn.active {
  color: #64b5f6;
}

.theme-dark .panel-description h4 {
  border-bottom-color: #64b5f6;
}

.theme-dark .demo-product:hover,
.theme-dark .theme-preview-card.active {
  border-color: #64b5f6;
}

.theme-dark .demo-product .price {
  color: #64b5f6;
}

.theme-dark .add-to-cart-btn {
  background: #64b5f6;
}

.theme-dark .add-to-cart-btn:hover {
  background: #42a5f5;
}
</style>
