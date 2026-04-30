<template>
  <div class="cart-container" :class="[themeClassName]">
    <div 
      class="cart-trigger"
      @mouseenter="showCartPanel"
      @mouseleave="hideCartPanel"
      @click="toggleCart"
    >
      <i class="fa fa-shopping-cart icon-cart"></i>
      <span class="cart-count">{{totalItems}}</span>
      <span class="cart-label">购物车</span>
      <i class="fa fa-chevron-down chevron"></i>
    </div>
    
    <div 
      class="cart-panel"
      v-show="isPanelVisible"
      @mouseenter="showCartPanel"
      @mouseleave="hideCartPanel"
      transition="panel-fade"
    >
      <div v-if="cartItems.length === 0" class="empty-cart">
        <i class="fa fa-shopping-bag empty-icon"></i>
        <p>购物车还是空的，快去选购吧！</p>
      </div>


      <div v-else class="cart-content">
        <div class="cart-header">
          <h4 class="header-title">购物车 ({{totalItems}}件商品)</h4>
          <span class="total-price">¥{{totalPrice}}</span>
        </div>
  

        <div class="cart-items" ref="cartItems">
          <div 
            v-for="(item, index) in cartItems"
            :key="item.id"
            class="cart-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragover="handleDragOver"
            @drop="handleDrop($event, index)"
          >
            <img :src="item.imgUrl" :alt="item.title" class="item-img" />
            <div class="item-info">
              <h5 class="item-title">{{item.title}}</h5>
              <div class="item-controls">
                <div class="quantity-control">
                  <button @click="decreaseQuantity(item)" class="qty-btn">
                    <i class="fa fa-minus"></i>
                  </button>
                  <span class="qty-value">{{item.quantity}}</span>
                  <button @click="increaseQuantity(item)" class="qty-btn">
                    <i class="fa fa-plus"></i>
                  </button>
                </div>
                <span class="item-price">¥{{(item.price * item.quantity).toFixed(2)}}</span>
              </div>
            </div>
            <button @click="removeItem(index)" class="remove-btn">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
  

        <div class="package-section" v-if="canCreatePackage">
          <h5 class="package-title">
            <i class="fa fa-gift"></i>
            组合套餐
          </h5>
          <div class="package-options">
            <div 
              v-for="pkg in availablePackages"
              :key="pkg.id"
              class="package-card"
              @click="selectPackage(pkg)"
            >
              <h6 class="pkg-name">{{pkg.name}}</h6>
              <p class="pkg-desc">{{pkg.description}}</p>
              <div class="pkg-price">
                <span class="original">¥{{pkg.originalPrice}}</span>
                <span class="current">¥{{pkg.packagePrice}}</span>
                <span class="savings">省¥{{(pkg.originalPrice - pkg.packagePrice).toFixed(2)}}</span>
              </div>
              <button class="pkg-add-btn">添加套餐</button>
            </div>
          </div>
        </div>
  

        <div class="recommendation-section" v-if="recommendations.length > 0">
          <h5 class="recommend-title">
            <i class="fa fa-lightbulb-o"></i>
            根据浏览历史推荐
          </h5>
          <div class="recommend-list">
            <div 
              v-for="item in recommendations"
              :key="item.id"
              class="recommend-item"
              draggable="true"
              @dragstart="handleRecDragStart($event, item)"
            >
              <img :src="item.imgUrl" :alt="item.title" class="rec-img" />
              <div class="rec-info">
                <h6 class="rec-title">{{item.title}}</h6>
                <span class="rec-price">¥{{item.price}}</span>
              </div>
              <button @click="addRecommendation(item)" class="rec-add-btn">
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
  

        <div class="chart-section" v-if="showPriceChart">
          <h5 class="chart-title" @click="togglePriceChart">
            <i class="fa fa-line-chart"></i>
            价格趋势
            <i class="fa" :class="showPriceChart ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </h5>
          <div class="chart-container" v-show="showPriceChart">
            <div class="price-chart" ref="priceChart">
              <svg :width="chartWidth" :height="chartHeight">
                <g class="grid">
                  <line v-for="i in 5" :key="'h'+i"
                    :x1="40" :y1="i * chartHeight / 5"
                    :x2="chartWidth - 20" :y2="i * chartHeight / 5"
                    stroke="#e0e0e0" stroke-width="1" />
                </g>
                <polyline 
                  :points="chartPoints"
                  fill="none" 
                  :stroke="chartLineColor"
                  stroke-width="3"
                  stroke-linejoin="round"
                />
                <circle 
                  v-for="(point, idx) in chartDataPoints"
                  :key="'c'+idx"
                  :cx="point.x" 
                  :cy="point.y" 
                  r="4"
                  :fill="chartLineColor"
                />
                <text v-for="(label, idx) in chartLabels"
                  :key="'l'+idx"
                  :x="40 + idx * (chartWidth - 60) / (chartLabels.length - 1)"
                  :y="chartHeight - 5"
                  text-anchor="middle"
                  font-size="10"
                  fill="#999"
                >{{label}}</text>
              </svg>
            </div>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot" :style="{background: chartLineColor}"></span>
                当前价格趋势
              </span>
            </div>
          </div>
        </div>
  

        <button 
          class="compare-btn"
          @click="showCompareModal = true"
          v-if="cartItems.length >= 2"
        >
          <i class="fa fa-exchange"></i>
          价格对比
        </button>
  

        <div class="cart-footer">
          <div class="cart-summary">
            <span class="summary-text">共 {{totalItems}} 件商品</span>
            <span class="summary-total">
              总计: <strong>¥{{totalPrice}}</strong>
            </span>
          </div>
          <button class="checkout-btn">去结算</button>
        </div>
      </div>
    </div>
    
    <div class="compare-modal" v-show="showCompareModal">
      <div class="modal-backdrop" @click="showCompareModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>价格对比</h3>
          <button class="modal-close" @click="showCompareModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="compare-table">
          <table>
            <thead>
              <tr>
                <th>商品</th>
                <th>现价</th>
                <th>历史最低</th>
                <th>历史最高</th>
                <th>30天均价</th>
                <th>价格趋势</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartItems" :key="item.id">
                <td>
                  <div class="compare-item">
                    <img :src="item.imgUrl" :alt="item.title" />
                    <span>{{item.title}}</span>
                  </div>
                </td>
                <td class="price-current">¥{{item.price}}</td>
                <td class="price-low">¥{{item.priceHistory ? item.priceHistory.low : item.price}}</td>
                <td class="price-high">¥{{item.priceHistory ? item.priceHistory.high : item.price}}</td>
                <td class="price-avg">¥{{item.priceHistory ? item.priceHistory.avg : item.price}}</td>
                <td>
                  <span class="trend-indicator" :class="getTrendClass(item)">
                    <i class="fa" :class="getTrendIcon(item)"></i>
                    {{getTrendText(item)}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    browseHistory: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    return {
      cartItems: [],
      isPanelVisible: false,
      hideTimer: null,
      showCompareModal: false,
      showPriceChart: true,
      chartWidth: 280,
      chartHeight: 120,
      priceHistoryData: [1299, 1399, 1349, 1299, 1249, 1199, 1249],
      chartLabels: ['7天前', '6天前', '5天前', '4天前', '3天前', '2天前', '今天'],
      recommendations: [],
      availablePackages: [],
      currentTheme: 'orange',
      draggedItem: null
    }
  },
  computed: {
    themeClassName: function () {
      return 'theme-' + this.currentTheme
    },
    totalItems: function () {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalPrice: function () {
      return this.cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)
    },
    canCreatePackage: function () {
      return this.cartItems.length >= 2
    },
    chartPoints: function () {
      if (!this.priceHistoryData || this.priceHistoryData.length === 0) return ''


      var minVal = Math.min.apply(null, this.priceHistoryData)
      var maxVal = Math.max.apply(null, this.priceHistoryData)
      const range = maxVal - minVal || 1


      return this.priceHistoryData.map((val, idx) => {
        const x = 40 + idx * (this.chartWidth - 60) / (this.priceHistoryData.length - 1)
        const y = this.chartHeight - 20 - ((val - minVal) / range) * (this.chartHeight - 40)
        return `${x},${y}`
      }).join(' ')
    },
    chartDataPoints: function () {
      if (!this.priceHistoryData || this.priceHistoryData.length === 0) return []


      var minVal = Math.min.apply(null, this.priceHistoryData)
      var maxVal = Math.max.apply(null, this.priceHistoryData)
      const range = maxVal - minVal || 1


      return this.priceHistoryData.map((val, idx) => ({
        x: 40 + idx * (this.chartWidth - 60) / (this.priceHistoryData.length - 1),
        y: this.chartHeight - 20 - ((val - minVal) / range) * (this.chartHeight - 40)
      }))
    },
    chartLineColor: function () {
      const colors = {
        orange: '#ff6700',
        dark: '#64b5f6',
        pink: '#ff69b4',
        blue: '#2196f3',
        green: '#4caf50'
      }
      return colors[this.currentTheme] || '#ff6700'
    }
  },
  ready () {
    this.generateRecommendations()
    this.generatePackages()
    this.$on('themeChange', (theme) => {
      this.currentTheme = theme
    })
    this.$on('addToCart', (item) => {
      this.addToCart(item)
    })
  },
  methods: {
    showCartPanel () {
      clearTimeout(this.hideTimer)
      this.isPanelVisible = true
    },
    hideCartPanel () {
      const self = this
      this.hideTimer = setTimeout(() => {
        self.isPanelVisible = false
      }, 300)
    },
    toggleCart () {
      this.isPanelVisible = !this.isPanelVisible
    },
    addToCart (item) {
      var existingIndex = -1
      for (var i = 0; i < this.cartItems.length; i++) {
        if (this.cartItems[i].id === item.id) {
          existingIndex = i
          break
        }
      }

      if (existingIndex >= 0) {
        this.cartItems[existingIndex].quantity++
      } else {
        var newItem = {}
        for (var key in item) {
          newItem[key] = item[key]
        }
        newItem.quantity = item.quantity || 1
        newItem.imgUrl = newItem.imgUrl || '//i1.mifile.cn/a1/T1HcAQBgDT1RXrhCrK!220x220.jpg'
        newItem.priceHistory = {
          low: (parseFloat(item.price) * 0.85).toFixed(2),
          high: (parseFloat(item.price) * 1.2).toFixed(2),
          avg: (parseFloat(item.price) * 0.95).toFixed(2),
          trend: 'stable'
        }
        this.cartItems.push(newItem)
      }


      this.generateRecommendations()
      this.generatePackages()
    },
    removeItem (index) {
      this.cartItems.splice(index, 1)
      this.generateRecommendations()
      this.generatePackages()
    },
    increaseQuantity (item) {
      item.quantity++
    },
    decreaseQuantity (item) {
      if (item.quantity > 1) {
        item.quantity--
      }
    },
    generateRecommendations () {
      var allProducts = [
        {id: 101, title: '小米移动电源 10000mAh', price: '79', imgUrl: '//i2.mifile.cn/a1/T12HJvByEv1RXrhCrK.jpg?width=150&height=150', category: 'power'},
        {id: 102, title: '小米圈铁耳机', price: '99', imgUrl: '//i2.mifile.cn/a1/T1ycK_BjYv1RXrhCrK.jpg?width=150&height=150', category: 'audio'},
        {id: 103, title: '小米手环2', price: '149', imgUrl: '//i1.mifile.cn/a1/T1HcAQBgDT1RXrhCrK!220x220.jpg', category: 'wearable'},
        {id: 104, title: '小米插线板', price: '49', imgUrl: '//i2.mifile.cn/a1/pms_1463579883.27084326.jpg?width=150&height=150', category: 'power'},
        {id: 105, title: '小米路由器3', price: '149', imgUrl: '//i3.mifile.cn/a4/T1rQAgB7Av1RXrhCrK.jpg', category: 'network'},
        {id: 106, title: '小米蓝牙音箱', price: '199', imgUrl: '//i1.mifile.cn/a1/T15hZ_BsDv1RXrhCrK!220x220.jpg', category: 'audio'}
      ]


      var cartCategories = []
      for (var c = 0; c < this.cartItems.length; c++) {
        var cat = this.cartItems[c].category || 'other'
        if (cartCategories.indexOf(cat) === -1) {
          cartCategories.push(cat)
        }
      }


      var filtered = []
      for (var p = 0; p < allProducts.length; p++) {
        var product = allProducts[p]
        var isInCart = false
        for (var ci = 0; ci < this.cartItems.length; ci++) {
          if (this.cartItems[ci].id === product.id) {
            isInCart = true
            break
          }
        }
        if (!isInCart) {
          filtered.push(product)
        }
      }


      var self = this
      filtered.sort(function (a, b) {
        var aMatch = cartCategories.indexOf(a.category) >= 0 ? 0 : 1
        var bMatch = cartCategories.indexOf(b.category) >= 0 ? 0 : 1
        return aMatch - bMatch
      })


      self.recommendations = filtered.slice(0, 4)
    },
    generatePackages () {
      if (this.cartItems.length < 2) {
        this.availablePackages = []
        return
      }


      const totalPrice = this.cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0)


      this.availablePackages = [
        {
          id: 1,
          name: '精选套装',
          description: '包含所有已选商品',
          originalPrice: totalPrice,
          packagePrice: (totalPrice * 0.9).toFixed(2)
        },
        {
          id: 2,
          name: '超值组合',
          description: '加送配件优惠',
          originalPrice: totalPrice + 50,
          packagePrice: (totalPrice * 0.85 + 30).toFixed(2)
        }
      ]
    },
    addRecommendation (item) {
      this.addToCart(item)
    },
    selectPackage (pkg) {
      console.log('Selected package:', pkg)
    },
    togglePriceChart () {
      this.showPriceChart = !this.showPriceChart
    },
    getTrendClass (item) {
      const trend = item.priceHistory ? item.priceHistory.trend : 'stable'
      return `trend-${trend}`
    },
    getTrendIcon (item) {
      const trend = item.priceHistory ? item.priceHistory.trend : 'stable'
      const icons = {
        up: 'fa-arrow-up',
        down: 'fa-arrow-down',
        stable: 'fa-minus'
      }
      return icons[trend] || icons.stable
    },
    getTrendText (item) {
      const trend = item.priceHistory ? item.priceHistory.trend : 'stable'
      const texts = {
        up: '上涨',
        down: '下降',
        stable: '平稳'
      }
      return texts[trend] || texts.stable
    },
    handleDragStart (e, item) {
      this.draggedItem = item
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', JSON.stringify(item))
    },
    handleDragOver (e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    },
    handleDrop (e, index) {
      e.preventDefault()
      if (!this.draggedItem) return

      var fromIndex = -1
      for (var i = 0; i < this.cartItems.length; i++) {
        if (this.cartItems[i].id === this.draggedItem.id) {
          fromIndex = i
          break
        }
      }
      if (fromIndex >= 0 && fromIndex !== index) {
        var item = this.cartItems.splice(fromIndex, 1)[0]
        this.cartItems.splice(index, 0, item)
      }
      this.draggedItem = null
    },
    handleRecDragStart (e, item) {
      var dataObj = {}
      for (var key in item) {
        dataObj[key] = item[key]
      }
      dataObj.isRecommendation = true
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('text/plain', JSON.stringify(dataObj))
    }
  }
}
</script>

<style scoped>
.cart-container {
  position: relative;
  display: inline-block;
}

.cart-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-trigger:hover {
  background: rgba(255, 103, 0, 0.1);
}

.icon-cart {
  font-size: 18px;
  color: #ff6700;
}

.cart-count {
  background: #ff6700;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.cart-label {
  color: #333;
  font-size: 14px;
}

.chevron {
  color: #999;
  font-size: 12px;
}

.cart-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 360px;
  max-height: 600px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.panel-fade-transition {
  transition: all 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.panel-fade-enter,
.panel-fade-leave {
  opacity: 0;
  transform: translateY(-10px);
}

.empty-cart {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #e0e0e0;
  margin-bottom: 16px;
}

.empty-cart p {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.cart-content {
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.header-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.total-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6700;
}

.cart-items {
  max-height: 250px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: grab;
  transition: background 0.2s ease;
}

.cart-item:hover {
  background: #f9f9f9;
}

.cart-item:active {
  cursor: grabbing;
}

.item-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  border-color: #ff6700;
  color: #ff6700;
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #ff6700;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ffebe0;
  color: #ff6700;
}

.package-section,
.recommendation-section,
.chart-section {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.package-title,
.recommend-title,
.chart-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.package-title i,
.recommend-title i,
.chart-title i {
  color: #ff6700;
}

.package-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.package-card {
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.package-card:hover {
  border-color: #ff6700;
  box-shadow: 0 2px 8px rgba(255, 103, 0, 0.1);
}

.pkg-name {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.pkg-desc {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.pkg-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pkg-price .original {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.pkg-price .current {
  font-size: 15px;
  font-weight: 600;
  color: #ff6700;
}

.pkg-price .savings {
  font-size: 11px;
  color: #e53935;
  background: #ffebee;
  padding: 2px 6px;
  border-radius: 4px;
}

.pkg-add-btn {
  width: 100%;
  padding: 6px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.pkg-add-btn:hover {
  background: #ff8c00;
}

.recommend-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  cursor: grab;
  transition: all 0.2s ease;
}

.recommend-item:hover {
  border-color: #ff6700;
}

.rec-img {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
}

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-title {
  margin: 0 0 2px 0;
  font-size: 11px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-price {
  font-size: 12px;
  font-weight: 600;
  color: #ff6700;
}

.rec-add-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ff6700;
  background: #fff;
  color: #ff6700;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.rec-add-btn:hover {
  background: #ff6700;
  color: #fff;
}

.chart-container {
  background: #fff;
  border-radius: 4px;
  padding: 8px;
}

.price-chart {
  width: 100%;
  overflow: hidden;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.compare-btn {
  margin: 8px 16px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.compare-btn:hover {
  border-color: #ff6700;
  color: #ff6700;
}

.cart-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-text {
  font-size: 13px;
  color: #666;
}

.summary-total {
  font-size: 13px;
  color: #333;
}

.summary-total strong {
  font-size: 18px;
  color: #ff6700;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.checkout-btn:hover {
  background: #ff8c00;
}

.compare-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.compare-table {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px 20px;
}

.compare-table table {
  width: 100%;
  border-collapse: collapse;
}

.compare-table th,
.compare-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.compare-table th {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #fafafa;
}

.compare-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compare-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.compare-item span {
  font-size: 13px;
  color: #333;
}

.price-current {
  font-size: 14px;
  font-weight: 600;
  color: #ff6700;
}

.price-low {
  color: #4caf50;
  font-size: 14px;
}

.price-high {
  color: #e53935;
  font-size: 14px;
}

.price-avg {
  color: #666;
  font-size: 14px;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  background: #ffebee;
  color: #e53935;
}

.trend-down {
  background: #e8f5e9;
  color: #4caf50;
}

.trend-stable {
  background: #f5f5f5;
  color: #666;
}

.theme-pink .cart-count,
.theme-pink .total-price,
.theme-pink .item-price,
.theme-pink .rec-price,
.theme-pink .pkg-price .current,
.theme-pink .summary-total strong,
.theme-pink .price-current {
  color: #ff69b4;
}

.theme-pink .cart-count,
.theme-pink .qty-btn:hover,
.theme-pink .remove-btn:hover,
.theme-pink .pkg-add-btn,
.theme-pink .rec-add-btn,
.theme-pink .checkout-btn {
  background: #ff69b4;
}

.theme-pink .rec-add-btn,
.theme-pink .compare-btn:hover,
.theme-pink .package-card:hover {
  border-color: #ff69b4;
}

.theme-pink .rec-add-btn:hover,
.theme-pink .checkout-btn:hover,
.theme-pink .pkg-add-btn:hover {
  background: #ff85c1;
}

.theme-blue .cart-count,
.theme-blue .total-price,
.theme-blue .item-price,
.theme-blue .rec-price,
.theme-blue .pkg-price .current,
.theme-blue .summary-total strong,
.theme-blue .price-current {
  color: #2196f3;
}

.theme-blue .cart-count,
.theme-blue .qty-btn:hover,
.theme-blue .remove-btn:hover,
.theme-blue .pkg-add-btn,
.theme-blue .rec-add-btn,
.theme-blue .checkout-btn {
  background: #2196f3;
}

.theme-blue .rec-add-btn,
.theme-blue .compare-btn:hover,
.theme-blue .package-card:hover {
  border-color: #2196f3;
}

.theme-blue .rec-add-btn:hover,
.theme-blue .checkout-btn:hover,
.theme-blue .pkg-add-btn:hover {
  background: #42a5f5;
}

.theme-green .cart-count,
.theme-green .total-price,
.theme-green .item-price,
.theme-green .rec-price,
.theme-green .pkg-price .current,
.theme-green .summary-total strong,
.theme-green .price-current {
  color: #4caf50;
}

.theme-green .cart-count,
.theme-green .qty-btn:hover,
.theme-green .remove-btn:hover,
.theme-green .pkg-add-btn,
.theme-green .rec-add-btn,
.theme-green .checkout-btn {
  background: #4caf50;
}

.theme-green .rec-add-btn,
.theme-green .compare-btn:hover,
.theme-green .package-card:hover {
  border-color: #4caf50;
}

.theme-green .rec-add-btn:hover,
.theme-green .checkout-btn:hover,
.theme-green .pkg-add-btn:hover {
  background: #66bb6a;
}
</style>
