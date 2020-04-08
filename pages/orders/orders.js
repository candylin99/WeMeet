// pages/orders/orders.js
const app = getApp()
const util = require('../../utils/util.js')
import { req } from '../../utils/api.js'


//假数据
// const order = require('../../data/order.js')

Page({

  data: {
    orderType: 0,
    orderTitle: ['全部订单', '待付款', '待发货', '待收货'],
    ordersItem: [],
    scrollTop: 0,
    orderPages: 1,
    isHideLoadMore: false,
    orderStatus: false
  },

  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: this.data.orderTitle[options.type]
    })
    this.setData({
      orderType: options.type
    })
    this.getOrderList(options.type)
  },
  // tab 切换
  orderTab: function(e) {
    const orderType = e.target.dataset.type
    this.setData({
      orderType: orderType,
      ordersItem: [],
      scrollTop: 0,
      orderPages: 1,
      orderStatus: false
    })
    this.getOrderList()
  },
  // 订单详情
  navigateToOrderInfo: function(e) {
    console.log(e.target.dataset.id)
    let id = e.target.dataset.id
    const url = '/pages/orderInfo/orderInfo?id=' + id
    wx.navigateTo({
      url: url
    })
  },
  // 获取数据
  getOrderList: function() {
    if (this.data.isHideLoadMore) return
    if (this.data.orderStatus) {
      return wx.showToast({
        title: '没有更多订单',
        icon: 'none',
        duration: 1000
      })
    }
    this.setData({
      isHideLoadMore: true
    })
    const urlArr = ['appv5/orders/all/buyer', 'appv5/orders/unpaid/buyer', 'appv5/orders/todeliver/buyer', 'appv5/orders/receiving/buyer']
    const n = this.data.orderType
    req(app.globalData.bastUrl, urlArr[n], {
      page: this.data.orderPages,
      size: 20
    }, "GET").then(res => {
      let orderStatus = false
      if (this.data.orderPages == res.data.totalPages) {
        orderStatus = true
      }
      this.setData({
        ordersItem: this.data.ordersItem.concat(res.data.orders),
        orderPages: this.data.orderPages + 1,
        orderStatus: orderStatus,
        isHideLoadMore: false
      })
    })
  },
  // 滚动底部监控
  scrolltolower: function() {
    this.getOrderList()
  },
  // 立即付款
  immediatePayment: function() {
    console.log('立即付款')
  },
  // 取消订单 传ordernumner
  clearOrder: function(e) {
    const orderNumber = e.target.dataset.ordernumner
    wx.showModal({
      title: '提示',
      content: '是否取消订单？',
      success: function (res) {
        if (res.confirm) {
          req(app.globalData.bastUrl, 'appv5/order/cancel/' + orderNumber, {}, "POST", true).then(res => {
            wx.showToast({
              title: '操作成功',
              icon: 'none',
              duration: 1000
            })
          })
        }
      }
    })
  },
  remindDeliver: function(e) {
    const orderid = e.target.dataset.orderid
    req(app.globalData.bastUrl, 'appv5/orders/' + orderid + '/urge', {}, "POST", true).then(res => {
      wx.showToast({
        title: '已提醒卖家',
        icon: 'none',
        duration: 1000
      })
    })
  },
  // 确认收货 传ordernumner
  takeDelivery: function(e) {
    const orderNumber = e.target.dataset.ordernumner
    wx.showModal({
      title: '提示',
      content: '是否确认收货？',
      success: function (res) {
        if (res.confirm) {
          req(app.globalData.bastUrl, 'appv2_1/orders/' + orderNumber + '/received', {
            uid: app.globalData.userInfo.id
          }, "POST", true).then(res => {
            wx.showToast({
              title: '确认收货成功',
              icon: 'none',
              duration: 1000
            })
          })
        }
      }
    })
  },
  // 删除订单 传id
  deleteOrder: function(e) {
    const orderId = e.target.dataset.orderid
    const index = e.target.dataset.index
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定删除订单？',
      success: function (res) {
        if (res.confirm) {
          req(app.globalData.bastUrl, 'appv5/orders/' + orderId, {
            uid: app.globalData.userInfo.id
          }, "DELETE", true).then(res => {
            wx.showToast({
              title: '删除订单成功',
              icon: 'none',
              duration: 1000
            })
            that.data.ordersItem.splice(index, 1)
            that.setData({
              ordersItem: that.data.ordersItem
            })
          })
        }
      }
    })
  },
  // 返回首页
  returnIndex: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  // 跳转
  goodRefund: function () {
    wx.navigateTo({
      url: '/pages/refund/refund',
    })
  }
})