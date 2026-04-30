<template>
  <div class="floating-cart-wrapper">
    <div 
      class="floating-cart"
      :class="{'is-dragging-over': isDraggingOver}"
      @click="toggleCartPanel"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="cart-icon-wrapper">
        <i class="fa fa-shopping-cart cart-icon"></i>
        <span class="cart-badge" v-show="totalItems > 0">{{totalItems}}</span>
      </div>
      <div class="cart-hint">拖拽商品至此处</div>
    </div>
    
    <div class="floating-cart-panel" v-show="isPanelVisible">
      <div class="panel-header">
        <h4 class="panel-title">购物车 ({{totalItems}}件)</h4>
        <button class="panel-close" @click.stop="toggleCartPanel">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <div class="panel-content" v-if="cartItems.length === 0">
        <div class="empty-cart">
          <i class="fa fa-shopping-bag empty-icon"></i>
          <p>购物车还是空的</p>
          <p class="hint">拖拽商品到悬浮购物车添加</p>
        </div>
      </div>
      
      <div class="panel-content has-items" v-else>
        <div class="cart-items-list">
          <div 
            v-for="(item, index) in cartItems"
            :key="item.id"
            class="cart-item"
            draggable="true"
            @dragstart="handleItemDragStart($event, item)"
          >
            <img :src="item.imgUrl" :alt="item.title" class="item-img" />
            <div class="item-info">
              <h5 class="item-title">{{item.title}}</h5>
              <div class="item-meta">
                <span class="item-price">¥{{item.price}}</span>
                <span class="item-quantity">x{{item.quantity}}</span>
              </div>
            </div>
            <button class="remove-btn" @click.stop="removeItem(index)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="price-trend-section" v-if="cartItems.length > 0">
          <h5 class="trend-title">价格趋势</h5>
          <div class="trend-chart-container">
            <svg :width="chartWidth" :height="chartHeight" class="trend-chart">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" :style="{stopColor: chartLineColor}"></stop>
                  <stop offset="100%" :style="{stopColor: chartLineColor, stopOpacity: 0.5}"></stop>
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" :style="{stopColor: chartLineColor, stopOpacity: 0.3}"></stop>
                  <stop offset="100%" :style="{stopColor: chartLineColor, stopOpacity: 0}"></stop>
                </linearGradient>
              </defs>
              
              <g class="grid">
                <line v-for="i in 5" :key="'h'+i"
                  :x1="40" :y1="20 + (i-1) * (chartHeight - 40) / 4"
                  :x2="chartWidth - 20" :y2="20 + (i-1) * (chartHeight - 40) / 4"
                  stroke="#e0e0e0" stroke-width="1" />
              </g>
              
              <polyline 
                v-if="chartPoints"
                :points="chartPoints"
                fill="none" 
                :stroke="chartLineColor" 
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              
              <polygon 
                v-if="chartAreaPoints"
                :points="chartAreaPoints"
                fill="url(#areaGradient)"
              />
              
              <circle 
                v-for="(point, idx) in chartDataPoints"
                :key="idx"
                :cx="point.x" 
                :cy="point.y" 
                r="4"
                :fill="chartLineColor"
              />
              
              <text 
                v-for="(point, idx) in chartDataPoints"
                :key="'label'+idx"
                :x="point.x" 
                :y="point.y - 10"
                text-anchor="middle"
                font-size="10"
                fill="#666"
              >{{priceHistoryData[idx]}}</text>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="panel-footer" v-if="cartItems.length > 0">
        <div class="total-info">
          <span class="total-label">合计：</span>
          <span class="total-price">¥{{totalPrice}}</span>
        </div>
        <button class="checkout-btn">去结算</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isPanelVisible: false,
      isDraggingOver: false,
      cartItems: [],
      draggedItem: null,
      chartWidth: 260,
      chartHeight: 120,
      priceHistoryData: [1999, 1899, 1799, 1849, 1799, 1899, 1949]
    }
  },
  computed: {
    totalItems: function () {
      var total = 0
      for (var i = 0; i < this.cartItems.length; i++) {
        total += this.cartItems[i].quantity
      }
      return total
    },
    totalPrice: function () {
      var total = 0
      for (var i = 0; i < this.cartItems.length; i++) {
        total += parseFloat(this.cartItems[i].price) * this.cartItems[i].quantity
      }
      return total.toFixed(2)
    },
    chartLineColor: function () {
      return '#ff6700'
    },
    chartPoints: function () {
      if (!this.priceHistoryData || this.priceHistoryData.length === 0) return ''
      
      var minVal = Math.min.apply(null, this.priceHistoryData)
      var maxVal = Math.max.apply(null, this.priceHistoryData)
      var range = maxVal - minVal || 1
      
      var points = []
      for (var idx = 0; idx < this.priceHistoryData.length; idx++) {
        var val = this.priceHistoryData[idx]
        var x = 40 + idx * (this.chartWidth - 60) / (this.priceHistoryData.length - 1)
        var y = this.chartHeight - 20 - ((val - minVal) / range) * (this.chartHeight - 40)
        points.push(x + ',' + y)
      }
      return points.join(' ')
    },
    chartDataPoints: function () {
      if (!this.priceHistoryData || this.priceHistoryData.length === 0) return []
      
      var minVal = Math.min.apply(null, this.priceHistoryData)
      var maxVal = Math.max.apply(null, this.priceHistoryData)
      var range = maxVal - minVal || 1
      
      var points = []
      for (var idx = 0; idx < this.priceHistoryData.length; idx++) {
        var val = this.priceHistoryData[idx]
        points.push({
          x: 40 + idx * (this.chartWidth - 60) / (this.priceHistoryData.length - 1),
          y: this.chartHeight - 20 - ((val - minVal) / range) * (this.chartHeight - 40)
        })
      }
      return points
    },
    chartAreaPoints: function () {
      if (!this.chartPoints || this.chartDataPoints.length === 0) return ''
      
      var firstPoint = this.chartDataPoints[0]
      var lastPoint = this.chartDataPoints[this.chartDataPoints.length - 1]
      
      return this.chartPoints + ' ' + lastPoint.x + ',' + (this.chartHeight - 20) + ' ' + firstPoint.x + ',' + (this.chartHeight - 20)
    }
  },
  ready () {
    var self = this
    this.$on('addToCart', function (item) {
      self.addToCart(item)
    })
  },
  methods: {
    toggleCartPanel () {
      this.isPanelVisible = !this.isPanelVisible
    },
    handleDragOver: function (e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      this.isDraggingOver = true
    },
    handleDragLeave: function () {
      this.isDraggingOver = false
    },
    handleDrop: function (e) {
      e.preventDefault()
      this.isDraggingOver = false
      
      try {
        var data = JSON.parse(e.dataTransfer.getData('text/plain'))
        if (data && data.title && data.price) {
          this.addToCart(data)
        }
      } catch (err) {
        console.log('Drop data parse error:', err)
      }
    },
    addToCart: function (item) {
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
        this.cartItems.push(newItem)
      }
      
      this.$dispatch('cartUpdated', this.cartItems)
    },
    removeItem: function (index) {
      this.cartItems.splice(index, 1)
    },
    handleItemDragStart: function (e, item) {
      this.draggedItem = item
      e.dataTransfer.effectAllowed = 'move'
    }
  }
}
</script>

<style scoped>
.floating-cart-wrapper {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
}

.floating-cart {
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.floating-cart:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(255, 103, 0, 0.3);
}

.floating-cart.is-dragging-over {
  background: #fff5f0;
  border: 2px dashed #ff6700;
  transform: scale(1.15);
}

.cart-icon-wrapper {
  position: relative;
}

.cart-icon {
  font-size: 24px;
  color: #ff6700;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  min-width: 18px;
  height: 18px;
  background: #ff6700;
  color: #fff;
  border-radius: 9px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.cart-hint {
  position: absolute;
  bottom: -24px;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.floating-cart-panel {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ff6700 0%, #ff8c00 100%);
}

.panel-title {
  margin: 0;
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.panel-close {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.panel-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.panel-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.panel-content.has-items {
  padding: 0;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #e0e0e0;
  margin-bottom: 16px;
}

.empty-cart p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.empty-cart .hint {
  margin-top: 8px;
  font-size: 12px;
  color: #ff6700;
}

.cart-items-list {
  max-height: 200px;
  overflow-y: auto;
  border-bottom: 1px solid #e0e0e0;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: grab;
  transition: background 0.2s ease;
}

.cart-item:hover {
  background: #fafafa;
}

.cart-item:active {
  cursor: grabbing;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
}

.item-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.item-title {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #333;
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #ff6700;
}

.item-quantity {
  font-size: 12px;
  color: #999;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ffebee;
  color: #f44336;
}

.price-trend-section {
  padding: 12px 16px;
  background: #fafafa;
}

.trend-title {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.trend-chart-container {
  background: #fff;
  border-radius: 4px;
  padding: 8px;
}

.trend-chart {
  display: block;
  width: 100%;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-label {
  font-size: 13px;
  color: #666;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6700;
}

.checkout-btn {
  padding: 8px 24px;
  background: #ff6700;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.checkout-btn:hover {
  background: #ff8c00;
}
</style>
