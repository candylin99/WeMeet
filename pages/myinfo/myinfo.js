
var common = require('../../utils/common.js')
 var Bmob = require("../../utils/bmob.js");
 var util = require('../../utils/util.js');
var app = getApp()
var that;
var ogcontactValue='';
var ogrealname='';
Page({
  data: {
    userInfo: {},
    nameMaxLen: 4,
    nameNowLen:0,//备注当前字数
    phoneMaxLen: 11,
    phoneNowLen: 0,//备注当前字数

  },
    // 获取输入框的文字长度
  bindInputChange(e){
    console.log(e)
    let value = e.detail.value,
      len = value.length,
      status = e.target.dataset.status;
    console.log(status, len)
    if (status === "0"){
        if (len > this.nameMaxLen) return;
        this.setData({
          nameNowLen: len,
        })
      }else if(status === "1"){
        if (len > this.phoneMaxLen) return;
        this.setData({
          phoneNowLen: len,
        })
      }
  },
  queryinfo: function () {
    self = this;
    var Diary = Bmob.Object.extend("_User");
    var query = new Bmob.Query(Diary);
    var me = new Bmob.User();
    me.id = wx.getStorageSync("user_id");
    query.equalTo("objectId", me); //只统计公开显示的活动
    query.get(me.id, {
      success: function (results) {
        ogrealname = results.get("realname");
        ogcontactValue = results.get("mobilePhoneNumber");


      },
    });
  },
  
  formSubmit: function (event){
  var self = this;
  var Diary = Bmob.Object.extend("_User");
  var query = new Bmob.Query(Diary);
  var me = new Bmob.User();
  var phone = event.detail.value.phone;
  var realname = event.detail.value.realname;
    var phReg = /^(13|14|15|17|18)[0-9]{9}/;
  var nameReg = new RegExp("^[\u4e00-\u9fa5]{2,4}$");

  if(realname == "") {
    wx.showModal({
      title: '提示',
      content: '请输入真实姓名'
    })
} else if (realname != "" && !nameReg.test(realname)) {
    wx.showModal({
      title: '提示',
      content: '真实姓名一般为2-4位汉字'
  });
} else if (phone == "") {
    wx.showModal({
      title: '提示',
      content:'请输入联系方式'
  });
  } else if (phone.length != 11 || !phReg.test(phone)) {
    wx.showModal({
      title: '提示',
      content: '手机号格式不正确'
    });
  }
  else{
    console.log('校验完毕');
    // that.setData({
    //   isLoading: true,
    //   isdisabled: true
    // })
  
  me.id = wx.getStorageSync("user_id");
  query.equalTo("objectId", me);
  query.get(me.id, {
      success: function (result) {
        console.log(result)
        // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了
        result.set('mobilePhoneNumber', phone);
        result.set('realname', realname);

        result.save().then(function (res) {
         // 修改本地缓存
          var currentUser = Bmob.User.current();
          if (currentUser) {
            currentUser.set("mobilePhoneNumber", phone);
            result.set('realname', realname);

            Bmob.User._saveCurrentUser(currentUser);
          }
          // The object was retrieved successfully.
          common.showTip("保存信息成功", "success", function () {
            setTimeout(function () {
              console.log("修改成功");
              wx.navigateBack();
            }, 1000)
          });
        }, function (err) {
          // The object was retrieved successfully.
          console.log(err)
        });
      
      }
  }
  
  
          )}},
  // var User = Bmob.Object.extend("_User");
  // var query = new Bmob.Query(User);
  // var userQuery = new Bmob.Query(Bmob.User);
  // userQuery.equalTo("objectId", "ff8b23a36a");
  //   query.get(objectId, {
  //     success: function (result) {
  //       // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了
  //       result.set('mobilePhoneNumber', phone);
  //       result.save().then(function (res) {
  //         // 修改本地缓存
  //         var currentUser = Bmob.User.current();
  //         if (currentUser) {
  //           currentUser.set("mobilePhoneNumber", 1375023333);
  //           Bmob.User._saveCurrentUser(currentUser);
  //         }
  //         // The object was retrieved successfully.
  //         common.showTip("修改手机号成功", "success", function () {
  //           setTimeout(function () {
  //             wx.navigateBack();
  //           }, 1000)
  //         });
  //       }, function (err) {
  //         // The object was retrieved successfully.
  //         console.log(err)
  //       });
  //     }
  // }
  //   )},





  tobypay: function (e) {
    wx.navigateTo({
      url: '../myinfo/bypay/bypay'
    })
  },
  tobycard: function (e) {
    wx.navigateTo({
      url: '../myinfo/bycard/bycard'
    })
  },



  onLoad: function (options) {
this.queryinfo();
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