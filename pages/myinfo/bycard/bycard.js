// pages/mine/mine.js
var app=getApp();
Page({
  data: {
    userInfo: {},
  },
  /* 
   *  跳转到我的消息页面
   */
  tomyNews:function(e) {
    wx.navigateTo({
      url:'../message/message'
    })
  },
  minehost: function (e) {
    wx.navigateTo({
      url: '../my/mylaunch/mylaunch'
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