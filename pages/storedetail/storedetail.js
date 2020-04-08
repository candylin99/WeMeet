var WxParse = require('../../wxParse/wxParse.js');  

var common = require('../template/getCode.js');
var Bmob = require("../../utils/bmob.js");
var util = require('../../utils/util.js');
var app = getApp();
var that;
var optionId; //活动的Id
var publisherId; //活动发布者的Id
var joinpId; //如果当前用户已经加入，该活动在联系表中的Id
var goodtitle;
var goodprice;
var goodpic;
var goodname;
var eventMoreId; //当前活动的活动扩展表Id
var commentlist;
var joinlist;
var likerlist;
var idtopnum;
let commentText; //评论输入框内容

Page({
  data: {
    tarBarFixed:false,
    scrollHeight:0,
    accountIndex: 0,
 
    statusIndex: 0,
    realname: "",
    contactValue: "",
    showTopTips: false, //是否显示提示
    TopTips: '', //提示的内容
  
    //----------------
    tag_select: 0,
    limit: 5,
    showImage: false,
    loading: true,
    isdisabled: false,
    commentLoading: false,
    isdisabled1: false,
    recommentLoading: false,
    commentList: [],
    joinList: [],
    likerList: [],
    agree: 0,
    favo: 0,
    join: 0,
    isMe: false,
    isToResponse: false,
    price:0,
    scrollTop:0,
    status: 0,//tab切换按钮
    adminId: "",
    adminname: "",
    adcontactWay: "",
    adcontactValue: "",
    showCommentDialog: false,//评论输入框显示
    commentInputHolder: "请输入评论内容",//评论输入框提示
    //----------------------------------
    index: 2,
    opened: !1,
    style_img: '',
       toView: "headtitle",

  },

  queryMultipleNodes: function () {
    var nodequery = wx.createSelectorQuery()
    nodequery.select('#idtitle').boundingClientRect()
    nodequery.selectViewport().scrollOffset()
    nodequery.exec(function (res) {
      idtopnum=res[0].top;
      if (idtopnum <= -310) {
      that.setData({
        tarBarFixed: true,
      });
    } else{
      that.setData({
        tarBarFixed: false,
      });
    }
    })
  },

  // onPageScroll: function (res) {
  //   var scrollTop = res.scrollTop;
  //   console.log(scrollTop);
  //   if (scrollTop >= 100) {
  //     this.setData({
  //       tarBarFixed: true,
  //     });
  //   } else {
  //     this.setData({
  //       tarBarFixed: false,
  //     });
  //   }
  // },

  //生成活动二维码
  showQrcode: function () {
    var path = '/pages/detail/detail?actid=' + optionId + "&pubid=" + publisherId;
    var width = 40;
    var that = this;
    Bmob.generateCode({ "path": path, "width": width }).then(function (obj) {
      
      that.setData({
        imageBytes: obj.imageBytes,
        codeHehe: true
      })
    }, function (err) {
      common.showTip('生成二维码失败' + err);
    });
  },

  //关闭二维码弹窗
  closeCode: function () {
    this.setData({
      codeHehe: false
    })
  },
  //打开活动群二维码弹窗
  showqrcode: function () {
    this.setData({
      qrcodeHe: true
    })
  },

  //关闭活动群二维码弹窗
  closeqrcode: function () {
    this.setData({
      qrcodeHe: false
    })
  },



  

  //切换tab操作
 toproductinfo: function (e) {
    let id = e.target.id;
    this.setData({
      status: id,
       toView: 'viewa'
    });
 
  },
  toattention: function (e) {
    let id = e.target.id;
    this.setData({
      status: id,
      toView: 'viewb'
    });
 
  },
  tofareinfo: function (e) {
    let id = e.target.id;
    this.setData({
      status: id,
      toView: 'viewc'
    });
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initButton()
    that = this;
    var openid = wx.getStorageSync("user_openid");
    optionId = options.actid;
    publisherId = options.pubid;
    var buttons2 = new Array()
    wx.getStorage({ //判断当前发布人是不是自己
      key: 'user_id',
      success: function (ress) {
        if (publisherId == ress.data) {

          that.setData({
            favo: 3, //表示无法收藏
            join: 3, //已经无法加入
            isMe: true,
          })
          console.log("这是我的发起");
        }
      },
    })
    // var that=this;
    // article_content: WxParse.wxParse('article_content', 'html', that.listContent, th sd dasds 萨达  萨达 5;
    console.log('this is options.actid=' + options.actid);
    console.log('this is options.pubid=' + options.pubid);
    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    

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
    var myInterval = setInterval(getReturn, 500);//半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval); //清除定时器
            //确定收藏状态与加入状态
            //如果这条发起不是自己发的
            if (that.data.isMe == false) {
              var userQuery = new Bmob.Query(Bmob.User);
              userQuery.equalTo("objectId", ress.data);
              userQuery.find({
                success: function (result) {
                  var favoArray = result[0].get("eventFavo");
                  var joinArray = result[0].get("eventJoin");
                  var isFavo = false;
                  var isJoin = false;
                  if (favoArray != null) {
                    if (favoArray.length > 0) {
                      for (var i = 0; i < favoArray.length; i++) {
                        if (favoArray[i] == optionId) {
                          favoArray.splice(i, 1);
                          isFavo = true;
                          break;
                        }
                      }
                    }
                  }
                  if (joinArray != null) {
                    if (joinArray.length > 0) {
                      for (var i = 0; i < joinArray.length; i++) {
                        if (joinArray[i] == optionId) {
                          joinArray.splice(i, 1);
                          isJoin = true;
                          break;
                        }
                      }
                    }
                  }
                  if (isFavo == "1") {
                    that.setData({
                      favo: 1
                    })
                  } else if (isFavo == "0") {
                    that.setData({
                      favo: 0
                    })
                  }
                  if (isJoin == "1") {
                    that.setData({
                      join: 1
                    })
                  } else if (isJoin == "0") {
                    that.setData({
                      join: 0
                    })
                  }
                },
                error: function (error) {
                  console.log(error)
                }
              });
            }
            //查询活动信息
            var Diary = Bmob.Object.extend("StoreEvents");
            var query = new Bmob.Query(Diary);
            query.equalTo("objectId", optionId);
            query.include("publisher");
            query.find({
              success: function (result) {

               var price = result[0].get("price");
                var attention = result[0].get("attention");
                var name = result[0].get("name");
                var fareinfo=result[0].get("fareinfo");
                var phonenumber = result[0].get("phonenumber");
                var title = result[0].get("title");
                var content = result[0].get("content");
                var publisher = result[0].get("publisher");
                var isShow = result[0].get("isShow");
                var endtime = result[0].get("endtime");
                var createdAt = result[0].createdAt;
                var pubtime = util.getDateDiff(createdAt);
                var address = result[0].get("address");
                var longitude = result[0].get("longitude");//经度
                var latitude = result[0].get("latitude");//纬度
                var peoplenum = result[0].get("peoplenum");
                var joinnumber = result[0].get("joinnumber"); //已经加入的人数
                var agreeNum = result[0].get("likenum");
                var liker = result[0].get("liker");
                var commentNum = result[0].get("commentnum");
                var publisherName = publisher.nickname;
                var objectIds = publisher.id;
                var publisherPic;
                var url;
                if (publisher.userPic) {
                  publisherPic = publisher.userPic;
                }
                else {
                  publisherPic = "/static/images/icon/user_defaulthead@2x.png";
                }
                if (result[0].get("actpic")) {
                  url = result[0].get("actpic")._url;
                }
                else {
                  url = "http://bmob-cdn-22812.b0.upaiyun.com/2019/04/18/ce2cdde9404d35018099ae77195ffc6a.png";
                }
                if (publisher.id == ress.data) {
                  that.setData({
                    isMine: true
                  })
                }
              
                 that.setData({
                  fareinfo:fareinfo,
                  listTitle: title,
                  listAttention:attention,
                  listContent: content,
                  name:name,
                  phonenumber:phonenumber,
                  publishTime: pubtime,
                  listPic: url,
                  agreeNum: agreeNum,
                  commNum: commentNum,
                  isShow: isShow,
                  endtime: endtime,
                  address: address,
                  longitude: longitude,//经度
                  latitude: latitude,//纬度
                  peoplenum: peoplenum,
                  joinnumber: joinnumber,
                  publisherPic: publisherPic,
                  publisherName: publisherName,
                  objectIds: objectIds,
                  price:price,
    
                  loading: true
                })
                goodtitle = title;
                 goodprice = price;
                 goodpic = url;
                 goodname =name;
                publisherPic = publisherPic,
                console.log(goodtitle);
                WxParse.wxParse('article', 'html', content, that, 5);

         
                for (var i = 0; i < liker.length; i++) {
                  var isLike = 0;
                  if (liker[i] == ress.data) {
                    isLike = 1;
                    that.setData({
                      agree: isLike
                    })
                    break;
                  }
                }
   
               
              },
              error: function (error) {
                that.setData({
                  loading: true,
                })
                console.log(error);
              }
            })
          }
        },
      })
    }
  },
 

  //查看发起大图
  seeActBig: function (e) {
    wx.previewImage({
      current: that.data.listPic, // 当前显示图片的http链接
      urls: [that.data.listPic] // 需要预览的图片http链接列表
    })
  },
  //查看发起大图
  seeqrCodeBig: function (e) {
    wx.previewImage({
      current: that.data.qrcode, // 当前显示图片的http链接
      urls: [that.data.qrcode] // 需要预览的图片http链接列表
    })
  },

  //查看活动地图位置
  viewActAddress: function () {
    let latitude = this.data.latitude;
    let longitude = this.data.longitude;
    wx.openLocation({ latitude: latitude, longitude: longitude })
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
    wx.stopPullDownRefresh()
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
    console.log(this.data.listTitle);
    return {
      title: this.data.listTitle,
      path: '/pages/storedetail/storedetail?actid=' + optionId + "&pubid" + publisherId,
      imageUrl: this.data.istPic,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success'
        });
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '转发失败',
          icon: 'fail'
        });
      }
    }
  },

//跳转到订单页面
  navigateToCreateOrder: function (e) {
   var that=this;  

   console.log(goodtitle);
console.log("21111111")

    wx.setStorageSync('goodtitle', goodtitle);
    wx.setStorageSync('goodprice', goodprice);
    wx.setStorageSync('goodpic', goodpic);
    wx.setStorageSync('goodname', goodname);
    const url = '/pages/createOrder/createOrder?type=0' 
    //   + "&goodtitle=" + goodtitle + "&goodprice=" + goodprice
    // console.log(goodtitle)
    wx.navigateTo({
      url: url
    })
  },



  initButton() {
    this.setData({
      opened: !1,
    })

    this.button = init('br', {
      callback(vm, opened) {
        vm.setData({
          opened,
        })
      },
    })
  },
 

})
