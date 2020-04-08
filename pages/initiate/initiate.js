//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../template/getCode.js')
var that;
var myDate = new Date();
var text ="";
var realname = "";
var contactValue = "";
const plugin = requirePlugin("WechatSI")
const manager = plugin.getRecordRecognitionManager()

//格式化日期
function formate_data(myDate) {
  let month_add = myDate.getMonth() + 1;
  var formate_result = myDate.getFullYear() + '-'
    + month_add + '-'
    + myDate.getDate()
  return formate_result;
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    gifsrc:"/assets/images/1.png",
    text_status:true, //控制是否打开语音识别面板
    notice_status: false,
    accounts: ["微信号", "手机号"],
    accountIndex: 0,
    peostatus: false,
    isAgree: false,
    date: formate_data(myDate),
    address: '点击选择位置',
    longitude: 0, //经度
    latitude: 0,//纬度
    showTopTips: false,
    TopTips: '',
    noteMaxLen: 3000,//最多字数
    content: "",
    noteNowLen: 0,//备注当前字数
    types: ["运动", "游戏", "交友", "旅行", "读书", "竞赛", "电影", "音乐", "其他"],
    typeIndex: "0",
    showInput: false,//显示输入真实姓名,
    currentText: '',

  },
  taps2t: function (e) {
    if (e.target.id == 'notice') {
      this.hides2t();
    }
  },




  shows2t: function (e) {
    var that = this;
    setTimeout(function () {
    that.setData({
      'text_status': false,
  

    });
    }, 300)
  },
  hides2t: function (e) {
    this.setData({
      'text_status': true,
    });
  },


  tapNotice: function (e) {
    if (e.target.id == 'notice') {
      this.hideNotice();
    }
  },
  showNotice: function (e) {
    this.setData({
      'notice_status': true
    });
  },
  hideNotice: function (e) {
    this.setData({
      'notice_status': false
    });
  },


  //字数改变触发事件
  bindTextAreaChange: function (e) {
    var _this = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    _this.setData({
      content: value, noteNowLen: len
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        that = this;
    this.initRecord();
  
    that.setData({//初始化数据
      src: "",
      isSrc: false,
      ishide: "0",
      autoFocus: true,
      isLoading: false,
      loading: true,
      isdisabled: false,
      text:"1"
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    var myInterval = setInterval(getReturn, 500); ////半秒定时查询
    this.queryinfo();
    function getReturn() {
      wx.getStorage({
        key: 'user_openid',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval)
            that.setData({
              loading: true
            })
          }
        }
      })
    }
  },

  queryinfo: function () {
    self = this;
    var Diary = Bmob.Object.extend("_User");
    var query = new Bmob.Query(Diary);
    var me = new Bmob.User();
    me.id = wx.getStorageSync("user_id");
    query.equalTo("objectId",me ); //只统计公开显示的活动
    query.get(me.id,{
      success: function (results) {
        realname = results.get("realname");
         contactValue = results.get("mobilePhoneNumber");
         
   
      },
    });
  },




  // 语音识别的动画开始 
  streamRecord: function () {
    manager.start({
      lang: 'zh_CN',
    }),
    this.setData({
      gifsrc: "/assets/images/2.gif"
    })
  },
  // 动画
  endStreamRecord: function () {
    manager.stop()
    this.setData({
      gifsrc: "/assets/images/1.png"
    })
  },

  initRecord: function () {
    //有新的识别内容返回，则会调用此事件
    manager.onRecognize = (res) => {
     let text = res.result;
     console.log(text);
      that.setData({

        currentText: text,
        content:text
      })
    }
    // 识别结束事件
    manager.onStop = (res) => {
      let text = res.result
      if (text == '') {
        // 用户没有说话，可以做一下提示处理...
        return
      }
    }
    this.setData({
      currentText: text,
    })
  },
  //上传活动图片
  uploadPic: function () {//选择图标
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          isSrc: true,
          src: tempFilePaths
        })
      }
    })
  },

  //删除图片
  clearPic: function () {//删除图片
    that.setData({
      isSrc: false,
      src: ""
    })
  },

  //上传活动群二维码
  uploadCodePic: function () {//选择图标
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'],//压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          isCodeSrc: true,
          codeSrc: tempFilePaths
        })
      }
    })
  },

  //删除活动群二维码
  clearCodePic: function () {
    that.setData({
      isCodeSrc: false,
      codeSrc: ""
    })
  },

  //限制人数
  advancedSwitch: function (e) {
    if (e.detail.value == false) {
      this.setData({
        peostatus: false
      })
    } else if (e.detail.value == true) {
      this.setData({
        peostatus: true
      })
    }
  },

  //改变时间
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  //改变活动类别
  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  //选择地点
  addressChange: function (e) {
    var that = this;
    console.log(e);
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          address: res.name,
          longitude: res.longitude, //经度
          latitude: res.latitude,//纬度
        })
        if (e.detail && e.detail.value) {
          this.data.address = e.detail.value;
        }
      },
      fail: function (e) {
      },
      complete: function (e) {
      }
    })
  },

  //改变联系方式
  bindAccountChange: function (e) {
    this.setData({
      accountIndex: e.detail.value
    })
  },


  //表单验证
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  //提交活动 检测
  submitForm: function (e) {
    var that = this;
    console.log(realname);
    if (realname == "" || contactValue == "") { //如果没补充基本信息
      wx.showModal({
        title: '提示',
        content: '你还没认证基本信息哦，发起活动前需要补充个人真实信息，点击确定进入【认证】页面补充信息。',
        showCancel: true,
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../myinfo/myinfo',
            })

          }

        }
      })
    }
   
  
    var title = e.detail.value.title;
    var endtime = this.data.date;
    var typeIndex = this.data.typeIndex;
    var acttype = 1 + parseInt(typeIndex);
    var acttypename = getTypeName(acttype); //获得类型名称
    var address = this.data.address;
    var longitude = this.data.longitude; //经度
    var latitude = this.data.latitude;//纬度
    var switchHide = e.detail.value.switchHide;
    var peoplenum = e.detail.value.peoplenum;
    var content = e.detail.value.content;

    if (title == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入主题'
      });
    } else if (address == '点击选择位置') {
      this.setData({
        showTopTips: true,
        TopTips: '请选择地点'
      });
    } else if (switchHide == true && peoplenum == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入人数'
      });
    } else if (content == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入活动内容'
      });
 

    } else {
      console.log('校验完毕');
      that.setData({
        isLoading: true,
        isdisabled: true
      })
      //向 Events 表中新增一条数据
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          var Diary = Bmob.Object.extend("Events");
          var diary = new Diary();
          var me = new Bmob.User();
          me.id = ress.data;
          diary.set("title", title);
          diary.set("endtime", endtime);
          diary.set("acttype", acttype + "");
          diary.set("isShow",1);
          diary.set("address", address);
          diary.set("longitude", longitude);//经度
          diary.set("latitude", latitude);//纬度\
          if (that.data.peopleHide) { //如果设置了人数
            diary.set("peoplenum", peoplenum);
          } else if (!that.data.peopleHide) {
            diary.set("peoplenum", "-1");
          }
          diary.set("content", content);
          diary.set("publisher", me);
          diary.set("likenum", 0);
          diary.set("commentnum", 0);
          diary.set("liker", []);
          diary.set("joinnumber", 0); //发布后初始加入人数为0
          diary.set("joinArray", []);
          if (that.data.isSrc == true) {
            var name = that.data.src; //上传图片的别名
            var file = new Bmob.File(name, that.data.src);
            file.save();
            diary.set("actpic", file);
          }
          //新增操作
          diary.save(null, {
            success: function (result) {
              //活动扩展表中添加一条记录
              var Diary = Bmob.Object.extend("EventMore");
              var query = new Diary();
              var Events = Bmob.Object.extend("Events");
              var event = new Events();
              event.id = result.id;
              query.set("Status", 0);
              query.set("Statusname", "准备中");
              query.set("event", event);
              //如果上传了群二维码
              if (that.data.isCodeSrc == true) {
                var name = that.data.codeSrc; //上传图片的别名
                var file = new Bmob.File(name, that.data.codeSrc);
                file.save();
                query.set("qrcode", file);
              }
              query.save();

              //再将发布者的信息添加到联系表中
              wx.getStorage({
                key: 'user_id',
                success: function (ress) {
                  var Contacts = Bmob.Object.extend("Contacts");
                  var contact = new Contacts();
                  var Events = Bmob.Object.extend("Events");
                  var event = new Events();
                  
                  event.id = result.id;
                  var me = new Bmob.User();
                  me.id = ress.data;
                  contact.set("publisher", me); //发布人是自己
                  contact.set("currentUser", me); //参加的人也是自己
                  contact.set("event", event);
                  contact.set("realname", realname);
                  contact.set("contactValue", contactValue);
                  contact.save();
                },
              })

              console.log("发布成功,objectId:" + result.id);
              that.setData({
                isLoading: false,
                isdisabled: false,
                eventId: result.id,
              })
              //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
              common.dataLoading("发起成功", "success", function () {
                //重置表单
                that.setData({
                  title: '',
                  typeIndex: 0,
                  address: '点击选择位置',
                  longitude: 0, //经度
                  latitude: 0,//纬度
                  data: formate_data(myDate),
                  isHide: true,
                  peoplenum: 0,
                  peopleHide: false,
                  isAgree: false,
                  accountIndex: 0,
                 
                  content: "",
                
                  noteNowLen: 0,
                  showInput: false,
                  src: "",
                  isSrc: false,
                  codeSrc: "",
                  isCodeSrc: false

                })
              });
            },
            error: function (result, error) {
              //添加失败
              console.log("发布失败=" + error);
              common.dataLoading("发起失败", "loading");
              that.setData({
                isLoading: false,
                isdisabled: false
              })
            }
          })
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

//根据活动类型获取活动类型名称
function getTypeName(acttype) {
  var acttypeName = "";
  if (acttype == 1) acttypeName = "运动";
  else if (acttype == 2) acttypeName = "游戏";
  else if (acttype == 3) acttypeName = "交友";
  else if (acttype == 4) acttypeName = "旅行";
  else if (acttype == 5) acttypeName = "读书";
  else if (acttype == 6) acttypeName = "竞赛";
  else if (acttype == 7) acttypeName = "电影";
  else if (acttype == 8) acttypeName = "音乐";
  else if (acttype == 9) acttypeName = "其他";
  return acttypeName;
}