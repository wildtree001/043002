<template>
  <header class="top-container" :class="[themeClassName]">
		<div class="top-bar clearfix">
			<div class="topbar-nav">
				<ul class="nav-wrap">
					<li v-for="item in navs" class="nav clearfix">
            <template v-if="item.name === '小米商城'">
              	<a :href="item.sourceUrl" class="nav-name">{{item.name}}</a>
            </template>
            <template v-else>
              <a :href="item.sourceUrl" class="nav-name" target="_blank">{{item.name}}</a>
            </template>
						<span class="nav-separate" v-show="$index !== 8">|</span>
					</li>
				</ul>
			</div>
			<div class="topbar-info">
				<a href="http://order.mi.com/site/login?redirectUrl=http://www.mi.com/index.html">登陆</a>
				<span class="nav-separate" v-show="$index !== 8">|</span>
				<a href="https://account.xiaomi.com/pass/register">注册</a>
			</div>
			
			<div class="right-controls">
				<theme-manager></theme-manager>
				<shopping-cart></shopping-cart>
			</div>

		</div>
  </header>
</template>

<script>
import ShoppingCart from './ShoppingCart'
import ThemeManager from './ThemeManager'

export default {
	data () {
		return {
			navs: [
				{name: '小米商城', sourceUrl: 'http://www.mi.com/index.html'},
				{name: 'MIUI', sourceUrl: 'http://www.miui.com/'},
				{name: '米聊', sourceUrl: 'http://www.miliao.com/'},
				{name: '游戏', sourceUrl: 'http://game.xiaomi.com/'},
				{name: '多看阅读', sourceUrl: 'http://www.duokan.com/'},
				{name: '云服务', sourceUrl: 'https://i.mi.com/'},
				{name: '小米网移动版', sourceUrl: 'http://www.mi.com/c/appdownload/'},
				{name: '问题反馈', sourceUrl: 'http://static.mi.com/feedback/'},
				{name: 'Select Region', sourceUrl: 'http://www.mi.com/index.html'}
			],
			currentTheme: 'orange'
		}
	},
  computed: {
    themeClassName: function () {
      return 'theme-' + this.currentTheme
    }
  },
  ready () {
    this.listenThemeChange()
  },
	methods: {
    listenThemeChange () {
      var self = this
      this.$on('themeChanged', function (themeId) {
        self.currentTheme = themeId
        self.$broadcast('themeChange', themeId)
      })
      this.$on('themeChange', function (themeId) {
        self.currentTheme = themeId
        self.$broadcast('themeChange', themeId)
      })
    }
	},
	components: {
		'shopping-cart': ShoppingCart,
		'theme-manager': ThemeManager
	}
}
</script>

<style scoped>

.top-container {
	width: 100%;
	height: 40px;
	background: #333;
}

.top-bar {
	position: relative;
	width: 1226px;
	margin: 0 auto;
	font-size: 12px;
  z-index: 11;
}

.topbar-nav {
	float: left;
	display: inline-block;
	height: 40px;
	line-height: 40px;
	overflow: hidden;
}

.nav-wrap {
	display: inline-block;
	margin: 0;
	padding: 0;
	list-style: none;
	.nav {
		display: inline-block;
		text-decoration: none;
		height: 40px;
		line-height: 40px;
		padding-left: 5px;
		& :hover {
			color: #fff;
		}
		.nav-name {
			display: inline-block;
			font-size: 12px;
			color: #b0b0b0;
			text-decoration: none;
		}
		.nav-separate {
			display: inline-block;
			color: #b0b0b0;
			margin-left: 5px;
		}
	}
}

.topbar-info {
	position: absolute;
	top: 0;
	right: 260px;
	height: 40px;
	line-height: 40px;
	a {
		color: #b0b0b0;
		text-decoration: none;
    &:hover {
      color: #fff;
    }
	}
	span {
		color: #b0b0b0;
	}
}

.right-controls {
	position: absolute;
	top: 0;
	right: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	height: 40px;
}
</style>
