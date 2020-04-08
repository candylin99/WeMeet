// pages/createOrder/createOrder.js
const app = getApp()
const util = require('../../utils/util.js')
import {
  req
} from '../../utils/api.js'

Page({

  data: {
    orderType: 0, // 入口类型  0直接购买 1购物车购买 选中地址跳转时+ 方便返回
    goodtitle: "",
    goodprice: 0,
    goodpic: "",
    goodname: "",
    orderList: [], // orderType=1 设置数据
    totalPrice: 0, // 总价
    totalPostage: 0, // 总邮费
    addressInfo: null, // 默认地址 在支付时，addressInfo不能为空
    orderNumber: null, // 订单号 HS20180510144319VWW33O
    activityStatus: false
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '确认订单'
    })

    // options.type = 0
    // type 0 直接购买， 1购物车购买 缓存数据头像已经处理
    if (options.type == 0) {
      var goodtitle = wx.getStorageSync('goodtitle');
      var goodprice = wx.getStorageSync('goodprice');
      var goodpic = wx.getStorageSync('goodpic');
      var goodname = wx.getStorageSync("goodname")
      console.log(goodtitle)

      // 总价
      const countPrice = goodprice
      this.setData({
        orderType: 0,
        goodpic: goodpic,
        goodprice: goodprice,
        goodtitle: goodtitle,
        goodname: goodname,
        totalPostage: 0,
        totalPrice: countPrice,
      })
    }

    if (options.type == 1) {
      let orderList = wx.getStorageSync('chartData')

      orderList.forEach(function(item, index) {
        let maxPostage = 0
        var numItem = item.item.length
        item.item.forEach(function(good, i) {
          if (good.postage > maxPostage && good.selectStatus) {
            maxPostage = good.postage
          }
          // 如果售罄 下架 直接设置隐藏
          if (good['is_sku_deleted'] != 0 || good['remain'] <= 0) {
            good['selectStatus'] = false
            item['selectStatus'] = false
            numItem = numItem - 1
            // item['childOrderShow'] = false
          }
          // 如果有特价 重新设置price参数
          if (good['special_offer_end']) {
            good['price'] = good['special_offer_price']
          }
        })
        if (numItem <= 0) {
          item['childOrderShow'] = false
        }
        item['maxPostage'] = maxPostage
        item['desc'] = null
      })
      const countPrice = countTotalPrice(orderList, 1)
      this.setData({
        orderType: 1,
        orderList: orderList,
        totalPostage: countPrice.totalPostage,
        totalPrice: countPrice.totalPrice
      })
    }
    // 获取默认地址
    // "appv2/defaultaddress" morendizhi
    req(app.globalData.bastUrl, 'appv2/defaultaddress', {}).then(res => {
      if (res.status == 1) {
        this.setData({
          addressInfo: res.data
        })
      }
    })
  },
  // 添加备注
  descContent: function(e) {
    const content = e.detail.value
    if (this.data.orderType == 0) {
      this.data.singleOrder.newType[0]['desc'] = e.detail.value
    } else {
      const userid = e.target.dataset.userid
      let orderList = this.data.orderList
      orderList.forEach(function(item, index) {
        if (item.seller_user_id == userid) {
          item.desc = content
        }
      })
      this.setData({
        orderType: 1,
        orderList: orderList
      })
    }
  },
  // 支付生成订单进行支付（正常购买）
  payment: function() {
    // 先检测地址是否添加
    if (!this.data.addressInfo) {
      wx.showToast({
        title: '很抱歉因企业账号暂未申请，支付功能暂关闭',
        icon: 'none',
        duration: 2000
      })
    }

    var createOrderData = []
    // 多个订单 orderList 在orderList提取需要提交的数据
    if (this.data.orderType == 1) {
      this.data.orderList.forEach(function(item, index) {
        if (item.childOrderShow) {
          let newItem = []
          item.item.forEach(function(good, i) {
            if (good.selectStatus) {
              newItem.push({
                counts: good.numbers,
                item_id: good.item_id,
                mid: good.model_id
              })
            }
          })
          if (!item.desc) {
            item.desc = ''
          }
          createOrderData.push({
            attach: item.desc,
            items: newItem,
            seller_name: item.seller_name,
            seller_uid: item.seller_user_id
          })
        }
      })
    }

    // 直接从地址跳入购买
    if (this.data.orderType == 0) {
      // 因为后端的原因，attach不能为null，设成''空字符
      var desc = ''
      if (this.data.singleOrder.newType[0].desc) {
        desc = this.data.singleOrder.newType[0].desc
      }
      createOrderData = [{
        attach: desc,
        items: [{
          counts: this.data.singleOrder.newType[0].number,
          item_id: this.data.singleOrder.articleId,
          mid: this.data.singleOrder.newType[0].id
        }],
        seller_name: this.data.singleOrder.seller.name,
        seller_uid: this.data.singleOrder.seller.id
      }]
    }

    // 执行生成订单方法 this.data.orderType 参考
    this.createorder(createOrderData)
  },

  createorder: function(order) {
    req(app.globalData.bastUrl, 'appv3_1/createorder', {
      address_id: this.data.addressInfo.id,
      type: 1,
      orders: order,
      payment_type: 3
    }, 'POST').then(res => {
      if (res.code == 1) {
        this.buychecking(res.data)
      }
    })
  },
  buychecking: function(ordernumber) {
    // 订单号
    this.setData({
      orderNumber: ordernumber
    })
    console.log(ordernumber)
    req(app.globalData.bastUrl, 'appv2_1/buychecking', {
      order_number: ordernumber,
      payment_type: 3
    }, 'POST', true).then(res => {
      this.wxpayment(res.data)
    })
  },
  // 微信支付方法
  // ordernummber
  // 文档：https://developers.weixin.qq.com/miniprogram/dev/api/api-pay.html
  wxpayment: function(prepayId) {
    const orderNumber = this.data.orderNumber
    const that = this
    req(app.globalData.bastUrl, 'appv5_1/payment/getWxPaymentParam', {
      package: 'prepay_id=' + prepayId
    }, 'POST').then(res => {
      wx.requestPayment({
        timeStamp: res.data.timeStamp,
        nonceStr: res.data.nonceStr,
        package: res.data.package,
        signType: res.data.signType,
        paySign: res.data.paySign,
        success: function() {
          // wx.navigateTo({
          //   url: '/pages/orders/orders?type=0',
          // })
          // 推送 appv5_1/wxapp/payment/action
          req(app.globalData.bastUrl, 'appv2_1/buysuccess', {
            order_number: orderNumber
          }, 'POST')
          that.paymentSuccess(prepayId)
        },
        fail: function() {
          req(app.globalData.bastUrl, 'appv2_1/buyfailed', {
            order_number: orderNumber
          }, 'POST')
        }
      })
    })
  },
  // 支付成功后回调
  paymentSuccess: function(prepayId) {
    const orderNumber = this.data.orderNumber
    const activityStatus = this.data.activityStatus
    req(app.globalData.bastUrl, 'appv5_1/wxapp/payment/action', {
      order_number: orderNumber,
      prepay_id: prepayId
    }, 'POST', true).then(res => {
      // 活动期间 跳转至商品
      if (activityStatus) {
        req(app.globalData.bastUrl, 'appv5_1/tigger/payIncrCoin', {
          order: orderNumber
        }, 'POST').then(data => {
          if (data.data) {
            wx.reLaunch({
              url: '/pages/activity/activity',
            })
          }
        })
      } else {
        wx.reLaunch({
          url: '/pages/paySuccess/paySuccess',
        })
      }
    })
  },
  // 跳转添加地址
  navigateToAddress: function(e) {
    let orderType = this.data.orderType
    const url = '/pages/address/address?type=1&orderType=' + orderType
    wx.redirectTo({
      url: url
    })
  },
  // 修改商品数量
  subNum: function(e) {
    const orderType = this.data.orderType
    if (orderType == 1) {
      const id = e.target.dataset.id
      this.data.orderList.forEach(function(item, index) {
        item.item.forEach(function(good, i) {
          if (good.numbers <= 1 && good.id == id) {
            good.numbers = 1
            wx.showToast({
              title: '最少购买一个',
              icon: 'none',
              duration: 1000
            })
          } else if (good.numbers != 0 && good.id == id) {
            good.numbers = good.numbers - 1
          }
        })
      })
      const countPrice = countTotalPrice(this.data.orderList, orderType)
      this.setData({
        orderList: this.data.orderList,
        totalPostage: countPrice.totalPostage,
        totalPrice: countPrice.totalPrice
      })
    } else {
      let num = this.data.singleOrder.newType[0].number
      if (num <= 1) {
        wx.showToast({
          title: '最少购买一个',
          icon: 'none',
          duration: 1000
        })
        this.data.singleOrder.newType[0].number = 1
      } else {
        this.data.singleOrder.newType[0].number = this.data.singleOrder.newType[0].number - 1
      }
      const countPrice = countTotalPrice(this.data.singleOrder, orderType)
      // console.log(this.data.singleOrder)
      this.setData({
        singleOrder: this.data.singleOrder,
        totalPrice: countPrice.totalPrice
      })
    }
  },
  addNum: function(e) {
    const orderType = this.data.orderType
    if (orderType == 1) {
      const id = e.target.dataset.id
      const remain = e.target.dataset.remain
      this.data.orderList.forEach(function(item, index) {
        item.item.forEach(function(good, i) {
          if (good.numbers >= remain && good.id == id) {
            good.numbers = remain
            wx.showToast({
              title: '当前库存为' + remain,
              icon: 'none',
              duration: 1000
            })
          } else if (good.numbers != 0 && good.id == id) {
            good.numbers = good.numbers + 1
          }
        })
      })
      const countPrice = countTotalPrice(this.data.orderList, orderType)
      this.setData({
        orderList: this.data.orderList,
        totalPostage: countPrice.totalPostage,
        totalPrice: countPrice.totalPrice
      })
    } else {
      const remain = e.target.dataset.remain
      let num = this.data.singleOrder.newType[0].number
      if (num >= remain) {
        this.data.singleOrder.newType[0].number = remain
        wx.showToast({
          title: '当前库存为' + remain,
          icon: 'none',
          duration: 1000
        })
      } else {
        this.data.singleOrder.newType[0].number = this.data.singleOrder.newType[0].number + 1
      }
      const countPrice = countTotalPrice(this.data.singleOrder, orderType)
      this.setData({
        singleOrder: this.data.singleOrder,
        totalPrice: countPrice.totalPrice
      })
    }
  },
  // 修改订单信息进行付款（待付款订单进入付款）
  updatePayment: function() {

  }
})

function countTotalPrice(data, n) {
  if (n == 1) {
    let totalPostage = 0
    let totalPrice = 0
    // 邮费处理 增加备注字段
    data.forEach(function(item, index) {
      item.item.forEach(function(good, i) {
        if (good.selectStatus) {
          totalPrice += good['numbers'] * good['price']
        }
      })
      if (item.childOrderShow) {
        totalPostage += item['maxPostage']
        totalPrice += item['maxPostage']
      }
    })
    return {
      totalPostage: totalPostage,
      totalPrice: totalPrice
    }
  } else {
    let totalPrice = Number(data.newType[0].postage) + data.newType[0].price * data.newType[0].number
    return {
      totalPrice: totalPrice
    }
  }
}