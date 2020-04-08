import { request, setConfig } from './wx-promise-request';
const app = getApp()

Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
}

// 微信登陆接口
const wx_login = (baseUrl) => {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: (res) => {
        let code = res.code
        wx.getUserInfo({
          lang: 'zh_CN',
          success: (res) => {
            request({
              url: baseUrl + 'appv5_1/login/wechatapp',
              data: {
                code: code,
                user_info: {
                  nickName: res.userInfo.nickName,
                  avatarUrl: res.userInfo.avatarUrl,
                  gender: res.userInfo.gender,
                  city: res.userInfo.city,
                  province: res.userInfo.province,
                  country: res.userInfo.country,
                  language: res.userInfo.language
                }
              },
              method: 'POST'
            }).then(res => {
              switch (res.data.status) {
                case 1:
                  wx.setStorageSync('token', res.data.data.token)
                  resolve()
                  break;
                default:
                  wx.showToast({ title: '截图给客服，登陆接口坏了。', icon: 'none', duration: 2000 })
                  reject()
              }
            })
          },
          fail: (res) => {
            // wx.showToast({
            //   title: '没有授权',
            //   icon: 'error',
            //   duration: 1000
            // })
          }
        })
      },
      fail: (res) => {
        wx.showToast({ title: '微信登陆失败！', icon: 'loading', duration: 2000 })
        reject()
      }
    })
  })
}
// 封装请求接口
const req = (baseUrl, url, data, method, showLoadingStatus, call) => {
  return new Promise(function (resolve, reject) {
    if (!showLoadingStatus){
      wx.showNavigationBarLoading()
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    if (call) {
      var callback = call
    }
    request({
      url: baseUrl + url,
      data: data,
      method: method,
      header: {
        'Authorization': wx.getStorageSync('token')
      }
    }).then(res => {
      if (!showLoadingStatus) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }
      if (res.statusCode == 200) {
        switch (res.data.status) {
          case 1:
            resolve(res.data)
            break;
          default:
            wx.showToast({ title: res.data.info.toString(), icon: 'none', duration: 2000 })
        }
      } else if (res.statusCode == 401) {
        // 请求登陆
        wx_login(baseUrl)
        // 在用户登录过期后，需要回调更新页面状态
        if (callback) {
          callback()
        }
      }
    }).catch(error => {
      reject(error)
      if (!showLoadingStatus) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }
    })
  })
}

module.exports = {
  req: req,
  wx_login: wx_login
}
