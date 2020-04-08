// pages/mine/mine.js
var app=getApp();
Page({
  data: {
    userInfo: {},
  },
  /* 
   *  跳转到我的消息页面
   */
  toorders:function(e) {
    wx.navigateTo({
      url: '../orders/orders',
    })
  },
  tomyNews:function(e) {
    wx.navigateTo({
      url:'../mine/message/message'
    })
  },
  minehost: function (e) {
    wx.navigateTo({
      url: '../mine/myhost/myhost'
    })
  },
  minejoin: function (e) {
    wx.navigateTo({
      url: '../mine/myjoin/myjoin'
    })
  },

  mineadvice: function (e) {
    wx.navigateTo({
      url: '../mine/issues/issues'
    })
  },
  mineabout: function (e) {
    wx.navigateTo({
      url: '../mine/about/about'
    })
  },
  showShareMenu() {
    wx.showShareMenu();
    console.log("显示了当前页面的转发按钮");
  },
  editme: function(e) {
    wx.navigateTo({
      url: '../myinfo/myinfo',
    })
  },
  onShareAppMessage: function (res) {
    
      console.log(res.target)
    
    return {
      title: '大学城有你意想不到的活动，你确定不来看看吗？',
      path: '/pages/mine/mine'
    }

  },
  onLoad: function (options) {
  
  },

  onShow: function () {
    console.log('onLoad')
    var that = this
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
  },


})