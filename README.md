# 口袋翻译
口袋翻译 微信小程序

微信搜索：**简e翻译**

或扫描二维码：
![](https://evenyao-1257191344.cos.ap-chengdu.myqcloud.com/%E4%BA%8C%E7%BB%B4%E7%A0%81%E5%B0%8F%E7%A8%8B%E5%BA%8F.png)

- 使用百度翻译api
需要申请 appid 与 key 并在 `api.js` 设置

## 版本
1.0.0 版本: 初版；基本功能实现。

1.0.1 版本: 优化翻译历史功能，增添清除历史痕迹功能。

# 项目相关
## index 页
### navigator
`navigator` 等同于 `a`链接，通过`navigator`跳转到小程序的其他页面
详见 [navigator](https://developers.weixin.qq.com/miniprogram/dev/component/navigator.html)
<br>

### iconfont
通过引入 `iconfont.wxss` ,使用外链的 icon-font 图标，引入与使用方法和 HTML 几乎无分别
- 在 `app.wxss` 公共样式当中 `@import "./assets/iconfont/iconfont.wxss";` 引入 `iconfont.wxss`
- 将 `iconfont.wxss` 内容修改为如下代码(iconfont中css链接使用浏览器打开后得到下列代码)，将 `url` 地址改为 `https` 后缀为 `ttf`：

```CSS
@font-face {font-family: "iconfont";
  src: url('https://at.alicdn.com/t/font_811118_f7oh8iao9yd.ttf') format('truetype')
}

.iconfont {
  font-family:"iconfont" !important;
  font-size:16px;
  font-style:normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-down:before { content: "\e600"; }

.icon-close:before { content: "\e78f"; }

.icon-arrow-right:before { content: "\e682"; }

.icon-duihao:before { content: "\e601"; }

.icon-right:before { content: "\e790"; }
```

### input
`input` 栏通过 `hidden="{{hideClearIcon}}"` 控制 iconfont 的 `X` 是否隐藏
- `hideClearIcon: true` 隐藏
- `hideClearIcon: false` 展示

事件绑定为 `bindtap='onTapClose'`: 当用户点击的时候，执行 `onTapClose`

`textarea` 中 `bindinput='onInput' bindconfirm='onConfirm' bindblur='onConfirm'`为用户做了什么操作之后，进行翻译操作
```HTML
<textarea placeholder='请输入要翻译的文本' placeholder-style='color: #8995a1'  bindinput='onInput' bindconfirm='onConfirm' bindblur='onConfirm'  value="{{query}}"></textarea>
```

使用 `<text selectable="true">{{item.dst}}</text>` 使翻译结果可选择，可复制


### 翻译api
- 请求使用 `wx.request()`
[wx.request](https://developers.weixin.qq.com/miniprogram/dev/api/network-request.html)

- 翻译api 使用百度的接口
```JavaScript
wx.request({
  url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
  data: {
    q,  //输入文本
    from,  //需要翻译的
    to,   //翻译为
    appid,
    salt,
    sign   //拼接 MD5进行加密
  },
  success(res) {
    if (res.data && res.data.trans_result) {
      resolve(res.data)
    } else {
      reject({ status: 'error', msg: '翻译失败' })
      wx.showToast({
        title: '翻译失败',
        icon: 'none',
        duration: 3000
      })
    }
  },
  fail() {
    reject({ status: 'error', msg: '翻译失败' })
    wx.showToast({
      title: '网络异常',
      icon: 'none',
      duration: 3000
    })
  }
})
```
- 设置百度翻译api之前需要先到微信小程序设置 `request合法域名`

### text-area 翻译结果
`<view class="text-result" wx:for="{{result}}" wx:key="index">`

类似于 `Vuejs` 的语法格式，进行数组循环展示。

`<text selectable="true">{{item.dst}}</text>`

设置用户可选择

### tabBar
必须放置在底部`"position": "bottom",`，才能使用 icon 图标。
用`"iconPath"`和`"selectedIconPath"`设置 tabBar 图标和被选中的图标。
```JSON
"tabBar": {   
  "borderStyle": "white",
  "position": "bottom",
  "color": "#bfbfbf",
  "selectedColor": "#1c1b21",
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "翻译",
      "iconPath": "imgs/icon-1.png",
      "selectedIconPath": "imgs/sel-icon-1.png"
    },
    {
      "pagePath": "pages/history/history",
      "text": "历史",
      "iconPath": "imgs/icon-2.png",
      "selectedIconPath": "imgs/sel-icon-2.png"
    }
  ]
}
```

## change 页
### globalData
设置默认语言`curlang`，和历史选择过的缓存语言`wx.getStorageSync('curLang')`

### item 列表
change页的item语言列表当中，绑定`bindtap='onTapItem'`事件
```JavaScript
onTapItem: function (e) {
  let langObj = e.currentTarget.dataset
  wx.setStorageSync('language', langObj)
  this.setData({ 'curLang': langObj })
  app.globalData.curLang = langObj
  wx.switchTab({ url: '/pages/index/index' })   //使用 switchTab 回到 tabBar
}
```

使用 `hover-class="view-hover"` 设置选择之后的样式效果

使用 `<text class="iconfont icon-duihao" wx:if="{{index===curLang.index}}"></text>` 添加选择语言后 ✅ 字体图标并通过 `wx:if` 选择渲染条件

### onShow
进行 change 页面渲染的时候，获取当前的语言
```JavaScript
onShow: function () {
    this.setData({ curLang: app.globalData.curLang })
  }
```

## history 页
### index.js 中有关history存储的
```JavaScript
let history = wx.getStorageSync('history') || []
history.unshift({ query: this.data.query, result: res.trans_result[0].dst })
history.length = history.length > 10 ? 10 : history.length
wx.setStorageSync('history', history)
```


### onTapItem
点击跳转 `index页`，并附带 query
```JavaScript
onTapItem: function (e) {
  wx.reLaunch({
    url: `/pages/index/index?query=${e.currentTarget.dataset.query}`
  })
}
```
因为使用了`reLaunch`，所以`index页`会重新加载，使用 `index.js` 的 `onLoad`
```JavaScript
onLoad: function (options) {  //翻译历史页通过 reLaunch 跳转，重新加载
  console.log('onload..')
  console.log(options)
  if (options.query) {
    this.setData({ query: options.query })
    this.setData({ 'hideClearIcon': false })   //让icon-close显现
  }
}
```
