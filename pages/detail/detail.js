var common = require('../template/getCode.js');
var Bmob = require("../../utils/bmob.js");
var util = require('../../utils/util.js');
var app = getApp();
var that;
var optionId; //活动的Id
var publisherId; //活动发布者的Id
var joinpId; //如果当前用户已经加入，该活动在联系表中的Id
var eventMoreId; //当前活动的活动扩展表Id
var commentlist;
var joinlist;
var likerlist;
let commentText; //评论输入框内容
var realname = "";
var contactValue = "";
Page({
  data: {
    accountIndex: 0,
    statusIndex:0,
    realname: "",
    contactValue: "",
    showTopTips: false, //是否显示提示
    TopTips: '', //提示的内容
    linkmainHe: false,
    linkjoinHe: false,
    //----------------
    tag_select: 0,
    limit: 5,
    showImage: false,
    loading: false,
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
    commentstatus:false,
    status: 0,//tab切换按钮
    adminId: "",
    adminname: "",
   adcontactValue: "",
    showCommentDialog: false,//评论输入框显示
    commentInputHolder: "请输入评论内容",//评论输入框提示
    //----------------------------------
    index: 2,
    opened: !1,
    style_img: ''
  },

clickcommit:function (){
  
that.setData({
  commentstatus:true
  
})

},
 shutcommit: function () {

    that.setData({
      commentstatus: false
    })
    console.log("关闭按钮点击成功")

  },
  stopPageScroll(){
    return
  },
  //生成活动二维码
showSharecode: function () {
    var path = '/pages/detail/detail?actid=' + optionId + "&pubid=" + publisherId;
    var width = 40;
    var that = this;
    Bmob.generateCode({ "path": path, "width": width }).then(function (obj) {
      console.log(obj);
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
  //活动群联系客服弹窗
  showgroup: function () {
    var that = this;
    console.log(this.data.join)
    if (that.data.join ==0) { //未加入状态 不允许查看

    wx.showModal({
      title: '温馨提示',
      content: '请加入活动后再查看哦',
    })
    }
    else{

    this.setData({
      groupview: true
    })
    }
  },
  closegroup: function () {
    var that = this;

    this.setData({
      groupview: false
      
    })
  },
shownoneqr:function () {
  wx.showModal({
    title: '温馨提示',
    content: '请加入活动后再查看哦',
})
},



 

  
  onLoad: function (options) {
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

    console.log('this is options.actid=' + options.actid);
    console.log('this is options.pubid=' + options.pubid);
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
    this.queryinfo();

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
            var Diary = Bmob.Object.extend("Events");
            var query = new Bmob.Query(Diary);
            query.equalTo("objectId", optionId);
            query.include("publisher");
            query.find({
              success: function (result) {
                var groupnum = result[0].get("groupnum")
                var title = result[0].get("title");
                var publisher = result[0].get("publisher");
                var content = result[0].get("content");
                var isShow = result[0].get("isShow");
                var endtime = result[0].get("endtime");
                var createdAt = result[0].createdAt;
                var pubtime = util.getDateDiff(createdAt);
                var address = result[0].get("address");
                var longitude = result[0].get("longitude");
                var latitude = result[0].get("latitude");
                var peoplenum = result[0].get("peoplenum");
                var joinnumber = result[0].get("joinnumber"); 
                var agreeNum = result[0].get("likenum");
                var liker = result[0].get("liker");
                var commentNum = result[0].get("commentnum");
                var publisherName = publisher.nickname;
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
                  url = "http://bmob-cdn-22812.b0.upaiyun.com/2019/04/22/878ffe3c40f2a8c6800f2e2d6bdc62de.jpg";
                }
                if (publisher.id == ress.data) {
                  that.setData({
                    isMine: true
                  })
                } that.setData({
                  eventTitle: title,
                  groupnum: groupnum,
                  listContent: content,
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
                  loading: true
                })
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
                that.commentQuery(result[0]);
                that.joinDetail(result[0]);
                that.likerDetail(result[0]);
                that.eventMore(result[0]);
              },
              error: function (error) {
                that.setData({
                  loading: true
                })
                console.log(error);
              }
            })
          }
        },
      })
    }
  },
//查询我的信息
  queryinfo: function () {
    self = this;
    var Diary = Bmob.Object.extend("_User");
    var query = new Bmob.Query(Diary);
    var me = new Bmob.User();
    me.id = wx.getStorageSync("user_id");
    query.equalTo("objectId", me); //只统计公开显示的活动
    query.get(me.id, {
      success: function (results) {
        realname = results.get("realname");
        contactValue = results.get("mobilePhoneNumber");


      },
    });
  },






  //查询额外信息
  eventMore: function (event) {
    var Diary = Bmob.Object.extend("EventMore");
    var query = new Bmob.Query(Diary);
    query.equalTo("event", event);
    query.find({
      success: function (result) {
        var id = result[0].id;
        eventMoreId = id;
        var statusname = result[0].get("Statusname");
        var actstatus = result[0].get("Status");
        var url;
        var qrcode = result[0].get("qrcode");
        if (qrcode) {
          url = result[0].get("qrcode")._url;
        }
        else {
          url = null;
        }
        that.setData({
          eventMoreId: id,
          statusname: statusname,
          actstatus: actstatus,
          statusIndex: actstatus,
          qrcode: url,
        })
      }
    })
  },
  //----------------------------------
  //查询评论
  commentQuery: function (event) {
    var self = this;
    commentlist = new Array();
    var Comments = Bmob.Object.extend("Comments");
    var queryComment = new Bmob.Query(Comments);
    queryComment.equalTo("event", event);
    queryComment.limit(self.data.comPage);
    queryComment.skip(self.data.comPage * self.data.comCurPage);
    queryComment.descending("createAt");
    queryComment.include("publisher");
    queryComment.find({
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          var id = result[i].id;
          var pid = result[i].get("olderComment"); //被评论的评论
          var uid = result[i].get("publisher").objectId; //评论人的id
          var content = result[i].get("content");
          var created_at = result[i].createdAt;
          var pubtime = util.getDateDiff(created_at);
          var olderUserName;
          var userPic = result[i].get("publisher").userPic;
          var nickname = result[i].get("publisher").nickname;
          if (pid) {
            pid = pid.id;
            olderUserName = result[i].get("olderUserName");
          }
          else {
            pid = 0;
            olderUserName = "";
          }
          var jsonA;
          jsonA = {
            "id": id || '',
            "content": content || '',
            "pid": pid || '',
            "uid": uid || '',
            "created_at": pubtime || '',
            "pusername": olderUserName || '',
            "username": nickname || '',
            "avatar": userPic || '',
          }
          commentlist.push(jsonA)
          that.setData({
            commentList: commentlist,
            loading: true
          })
        }
      },
      error: function (error) {
        common.dataLoadin(error, "loading");
        console.log(error);
      }
    });
  },
  //---------------------------------------------------
  //获取活动的加入详情信息
  joinDetail: function (event) {
    joinlist = new Array();
    var Contacts = Bmob.Object.extend("Contacts");
    var queryJoin = new Bmob.Query(Contacts);
    queryJoin.equalTo("event", event);
    queryJoin.include("currentUser");
    queryJoin.include("publisher");
    queryJoin.descending("createAt");
    queryJoin.find({
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          var joinuserid = result[i].get("currentUser").objectId; //加入的人的objectIdd
          var publisherid = result[i].get("publisher").objectId; //发起者的objectId
          //先获取发起人的联系信息
          if (joinuserid == publisherid) {
            console.log("获取发起者信息成功");
            var id = result[i].id;
            var adminname = result[i].get("realname"); //加入的人的真实姓名
            var adcontactValue = result[i].get("contactValue"); //联系方式
            that.setData({
              adminId: joinuserid,
              adminname: adminname,
              adcontactValue: adcontactValue,
              loading: true
            })
          } else {
            if (joinuserid == wx.getStorageSync("user_id")) {
              console.log("获取加入者信息成功");
              var id = result[i].id;
              joinpId = id;
              var joinname = result[i].get("realname"); //加入的人的真实姓名
              var jocontactValue = result[i].get("contactValue"); //联系方式
              that.setData({
                joinId: id,
                joinname: joinname,

                jocontactValue: jocontactValue,
                loading: true
              })
            }
            var id = result[i].id;
            var realname = result[i].get("realname"); //加入的人的真实姓名
            var contactWay = result[i].get("contactWay"); //联系方式名称
            var contactValue = result[i].get("contactValue"); //联系方式
            var joinusername = result[i].get("currentUser").username; //加入的人昵称
            var joinuserpic = result[i].get("currentUser").userPic; //加入的人头像
            var created_at = result[i].createdAt;
            var jointime = util.getDateDiff(created_at);
            var linkjoinHe = false;  
            var jsonA;
            jsonA = {
              "id": id,
              "realname": realname,
              "joinuserid": joinuserid,
              "joinusername": joinusername,
              "joinuserpic": joinuserpic,
              "contactWay": contactWay,
              "contactValue": contactValue,
              "jointime": jointime,
              "linkjoinHe": linkjoinHe,
            }
            joinlist.push(jsonA)
            that.setData({
              joinList: joinlist,
              loading: true
            })
          }
        }
      },
      error: function (error) {
        common.dataLoadin(error, "loading");
        console.log(error);
      }
    })
  },

  //获取活动的点赞详情信息
  likerDetail: function (event) {
    likerlist = new Array();
    var Likes = Bmob.Object.extend("Likes");
    var queryLike = new Bmob.Query(Likes);
    queryLike.equalTo("event", event);
    queryLike.include("liker");
    queryLike.descending("createAt");
    queryLike.find({
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          var id = result[i].id;
          var likerid = result[i].get("liker").objectId; //加入的人的id
          var likername = result[i].get("liker").username; //加入的人昵称
          var likerpic = result[i].get("liker").userPic; //加入的人头像
          var created_at = result[i].createdAt;
          var liketime = util.getDateDiff(created_at);
          var jsonA;
          jsonA = '{"id":"' + id + '","likerid":"' + likerid + '","likername":"' + likername + '","likerpic":"' + likerpic + '","liketime":"' + liketime + '"}';
          var jsonB = JSON.parse(jsonA);
          likerlist.push(jsonB)
          that.setData({
            likerList: likerlist,
            loading: true
          })
        }
      },
      error: function (error) {
        common.dataLoadin(error, "loading");
        console.log(error);
      }
    })
  },


  //点赞处理
  changeLike: function (event) {
    that.setData({
      style_img: 'transform:scale(1.5);'
    })
    setTimeout(function () {
      that.setData({
        style_img: 'transform:scale(1);'
      })
    }, 500)
    var isZan = false;
    var isLike = that.data.agree;
    var likeNum = parseInt(this.data.agreeNum);
    if (isLike == "0") { //点赞
      likeNum = likeNum + 1;
      that.setData({
        agree: 1,
        agreeNum: likeNum
      })
    } else if (isLike == "1") { //取消点赞
      likeNum = likeNum - 1;
      that.setData({
        agree: 0,
        agreeNum: likeNum
      })
    }
    wx.getStorage({
      key: 'user_id',
      success: function (ress) {
        var Diary = Bmob.Object.extend("Events");
        var queryLike = new Bmob.Query(Diary);
        queryLike.equalTo("objectId", optionId);
        queryLike.find({
          success: function (result) {
            var likerArray = result[0].get("liker");
            var isLiked = false;
            if (likerArray.length > 0) { //如果已经有人点过赞
              for (var i = 0; i < likerArray.length; i++) {
                if (likerArray[i] == ress.data) { //如果已经点过赞了,再次点击应该取消赞
                  likerArray.splice(i, 1);
                  isLiked = true;
                  isZan = true; // 表示已经赞了
                  that.downLike(ress); //删除点赞表里的数据
                  result[0].set('likenum', result[0].get('likenum') - 1);
                  break;
                }
              }
              if (isLiked == false) { //如果没有点过赞
                likerArray.push(ress.data);
                that.upLike(ress); //点赞表里的添加数据
                result[0].set('likenum', result[0].get('likenum') + 1);
              }
            } else { //没有人点赞
              likerArray.push(ress.data);
              that.upLike(ress); //点赞表里的添加数据
              result[0].set('likenum', result[0].get('likenum') + 1);
            }
            result[0].save();

            //在生成消息之前，先遍历消息表，如果要生成的消息在表中已经存在，则不生成消息
            var plyerQuery = Bmob.Object.extend("Plyre");
            var plyerQuery = new Bmob.Query(plyerQuery);
            var isme = new Bmob.User();
            isme.id = ress.data;
            if (!isZan) {//如果是点赞，查询是否存在点赞记录
              plyerQuery.equalTo("uid", isme);
              plyerQuery.equalTo("wid", optionId);
              plyerQuery.equalTo("behavior", 1);
              plyerQuery.find({
                success: function (result) {
                  console.log(result)
                  if (result.length == 0) { //如果消息表中不存在该条消息，则生成新消息
                    var value = wx.getStorageSync("my_avatar")
                    var my_username = wx.getStorageSync("my_username")
                    var Plyre = Bmob.Object.extend("Plyre");
                    var plyre = new Plyre();
                    plyre.set("behavior", 1); //消息通知方式
                    plyre.set("noticetype", "点赞");
                    plyre.set("bigtype", 1)//动态大类,消息类
                    plyre.set("avatar", value); //我的头像
                    plyre.set("username", my_username); // 我的名称
                    plyre.set("uid", isme);
                    plyre.set("wid", optionId); //活动ID
                    plyre.set("fid", publisherId); //
                    plyre.set("is_read", 0); //是否已读,0代表没有,1代表读了
                    plyre.save();
                  }
                }
              })
            } else { //如果是取消赞，查询是否存在点赞记录
              plyerQuery.equalTo("uid", isme);
              plyerQuery.equalTo("wid", optionId);
              plyerQuery.equalTo("behavior", 2);
              plyerQuery.find({
                success: function (result) {
                  console.log(result)
                  if (result.length == 0) { //如果消息表中不存在该条消息，则生成新消息
                    var value = wx.getStorageSync("my_avatar")
                    var my_username = wx.getStorageSync("my_username")
                    var Plyre = Bmob.Object.extend("Plyre");
                    var plyre = new Plyre();                                     
                    plyre.set("behavior", 2); //消息通知方式
                    plyre.set("noticetype", "取消赞");
                    plyre.set("bigtype", 1)//动态大类,消息类
                    plyre.set("avatar", value); //我的头像
                    plyre.set("username", my_username); // 我的名称
                    plyre.set("uid", isme);
                    plyre.set("wid", optionId); //活动ID
                    plyre.set("fid", publisherId); //
                    plyre.set("is_read", 0); //是否已读,0代表没有,1代表读了
                    plyre.save();
                  }
                }
              })
            }
          },
          error: function (error) {
            console.log("赞/取消赞失败");
            console.log(error)
          }
        });
        that.onShow();
      },
    })
  },
  //---------------------------------------------------------------------------------
  //点赞向likers 表中添加数据
  upLike: function (ress) {
    var Likes = Bmob.Object.extend("Likes");
    var like = new Likes();
    var me = new Bmob.User();
    me.id = ress.data;
    var Events = Bmob.Object.extend("Events");
    var event = new Events();
    event.id = optionId;
    like.set("liker", me);
    like.set("event", event);
    like.save(null, {
      success: function () {
        console.log("写入点赞表成功");
      },
      error: function (error) {
        console.log("写入点赞表失败");
        console.log(error);
      }
    });
  },
  //取消赞 向liker 表中删除数据
  downLike: function (ress) {
    var me = new Bmob.User();
    me.id = ress.data;
    var Events = Bmob.Object.extend("Events");
    var event = new Events();
    event.id = optionId;
    var Likes = Bmob.Object.extend("Likes");
    var like = new Bmob.Query(Likes);
    like.equalTo("liker", me);
    like.equalTo("event", event);
    like.destroyAll({
      success: function () {
        console.log("删除点赞表中的数据成功");
      },
      error: function (error) {
        console.log("删除点赞表的数据失败");
        console.log(error);
      }
    })
  },

  //-----------------------------------------------------------
  showCommentDialog: function (e) {//显示我要评论弹窗
    this.setData({
      showCommentDialog: true,
      commentInputHolder: typeof e == 'string' ? e : "请输入评论内容",
    })
  },
  hideCommentDialog: function () {//隐藏我要评论弹窗
    this.setData({
      showCommentDialog: false,
      isToResponse: false
    });
  },

  commentText: function (e) {//评论内容赋值
    commentText = e.detail.value
  },

  //点击评论itam
  commentTap: function (e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    let commentActions;
    if (item.uid == wx.getStorageSync('user_id')) {//自己的评论，可以删除
      commentActions = ["删除"]
    } else {
      commentActions = ["回复"]
    }
    wx.showActionSheet({
      itemList: commentActions,
      success: function (res) {
        let button = commentActions[res.tapIndex];
        if (button == "回复") {
          that.setData({
            pid: item.uid,
            isToResponse: true,
            responseName: item.username
          })

          that.showCommentDialog("回复" + item.username + "：");
        } else if (button == "删除") {
          //删除评论
          var Comments = Bmob.Object.extend("Comments");
          var comment = new Bmob.Query(Comments);
          comment.get(item.id, {
            success: function (result) {
              result.destroy({
                success: function (res) {
                  common.dataLoading("删除成功", "success");
                  console.log("删除成功");

                },
                error: function (res) {
                  console.log("删除评论错误");
                }
              })
            }
          })
          //活动表中评论数量-1
          var Events = Bmob.Object.extend("Events");
          var queryEvents = new Bmob.Query(Events);
          queryEvents.get(optionId, {
            success: function (object) {
              object.set("commentnum", object.get("commentnum") - 1);
              object.save();
            }
          })
          that.onShow();
        }
      }
    });
  },

  //评论活动
  publishComment: function (e) {
    let that = this;
    var isReply = false;
    if (!commentText || commentText.length == 0) {
      this.setData({
        showTopTips: true,
        TopTips: '请输入评论内容'
      });
      setTimeout(function () {
        that.setData({
          showTopTips: false
        });
      }, 3000);
    } else {
      that.setData({
        isdisabled: true,
        commentLoading: true
      })
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          that.setData({
            commentLoading: false
          })
          var queryUser = new Bmob.Query(Bmob.User);
          //查询单条数据,第一个参数是这条数据的objectId的值
          queryUser.get(ress.data, {
            success: function (userObject) {
              //查询成功,调用get 方法获取对应属性的值
              var Comments = Bmob.Object.extend("Comments");
              var comment = new Comments();
              var Events = Bmob.Object.extend("Events");
              var event = new Events();
              event.id = optionId;
              var me = new Bmob.User();
              me.id = ress.data;
              comment.set("publisher", me);
              comment.set("event", event);
              comment.set("content", commentText);
              console.log("commentText=" + commentText);
              if (that.data.isToResponse) { //如果是回复的评论
                isReply = true;
                var olderName = that.data.responseName;
                var Comments1 = Bmob.Object.extend("Comments");
                var comment1 = new Comments1();
                comment1.id = that.data.pid; //评论的评论Id
                comment.set("olderUserName", olderName);
                comment.set("olderComment", comment1);
              }
              //添加数据,第一个路口参数是null
              comment.save(null, {
                success: function (res) {
                  var queryEvents = new Bmob.Query(Events);
                  //查询单条数据,敌一个参数就是这条数据的objectId
                  queryEvents.get(optionId, {
                    success: function (object) {
                      object.set("commentnum", object.get("commentnum") + 1);
                      object.save();

                      var isme = new Bmob.User();
                      isme.id = ress.data;
                      var value = wx.getStorageSync("my_avatar")
                      var my_username = wx.getStorageSync("my_username")

                      var Plyre = Bmob.Object.extend("Plyre");
                      var plyre = new Plyre();
                      console.log("isReply=" + isReply);
                      if (isReply) {//如果是回复评论，则消息通知行为存4
                        plyre.set("behavior", 4); //消息通知方式
                        plyre.set("noticetype", "回复");
                      } else {//如果不是回复评论，则是评论活动，消息通知行为存3
                        plyre.set("behavior", 3); //消息通知方式
                        plyre.set("noticetype", "评论");
                      }
                      plyre.set("bigtype", 1)//动态大类,消息类
                      plyre.set("avatar", value);
                      plyre.set("username", my_username);
                      plyre.set("uid", isme);
                      plyre.set("wid", optionId);
                      plyre.set("fid", publisherId);
                      plyre.set("is_read", 0); //是否已读,0代表没有,1代表读了
                      //添加数据
                      plyre.save(null, {
                        success: function (result) {
                          //添加成功
                          console.log("isReply3=" + isReply);
                          if (isReply) {
                            common.dataLoading("回复成功", "success");
                            console.log("回复成功");
                          } else {
                            common.dataLoading("评论成功", "success");
                            console.log("评论成功");
                          }
                        },
                        error: function (result, error) {
                          console.log("评论失败");
                        }
                      });
                      that.setData({ commentText: '' })
                      that.hideCommentDialog();
                      that.onShow();
                    },
                    error: function (object, error) {
                      //查询失败
                      console.log(error);
                    }
                  });
                  that.setData({
                    publishContent: "",
                    isToResponse: false,
                    responeContent: "",
                    isdisabled: false,
                    commentLoading: false
                  })
                },
                error: function (gameScore, error) {
                  common.dataLoading(error, "loading");
                  that.setData({
                    publishContent: "",
                    isToResponse: false,
                    responeContent: "",
                    isdisabled: false,
                    commentLoading: false
                  })
                }
              });
            },
            error: function (object, error) {
              console.log(error);
            }
          });
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },

  bindKeyInput: function (e) {
    this.setData({
      publishContent: e.detail.value
    })
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
    console.log(this.data.eventTitle);
    return {
      title: this.data.eventTitle,
      path: '/pages/detail/detail?actid=' + optionId + "&pubid" + publisherId,
      imageUrl: this.data.istPic,
      success: function (res) {
        // 转发成功
        wx.showTloast({
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

  
  //加入与关闭
  clickjoin: function () {
    var join = that.data.join;
    if (that.data.peoplenum > 0 && (that.data.peoplenum - that.data.joinnumber) <= 0) { //如果人加入满了
      wx.showModal({
        title: '温馨提示',
        content: '此活动参加人数已满',
        showCancel: true,
      })
    } 

    if (join == "3") { //如果是自己的发起,弹出改变活动状态的弹窗

      var Diary = Bmob.Object.extend("Events");
      var query = new Bmob.Query(Diary);
      if (that.data.actstatus != 2 && that.data.isShow == 1) { //如果当前活动未结束且已经在首页展示
        wx.showModal({
          title: '是否撤离首页?',
          content: '撤离后您的发起将不会在首页展示',
          showCancel: true,
          success: function (res) {
            if (res.confirm) {
              query.get(optionId, {
                success: function (result) {
                  result.set("isShow", 0);
                  result.save();
                  console.log("撤离成功");
                  common.dataLoading("撤离成功", "success");
                },
                error: function (object, error) {
                  console.log("撤离失败" + error);
                }
              });
              that.onShow();
            }
          }
        })
      } else if (that.data.actstatus != 2 && that.data.isShow == 0) {//如果当前活动未结束且未在首页展示
        wx.showModal({
          title: '是否公开发起?',
          content: '公开后您的发起将会在首页展示',
          showCancel: true,
          success: function (res) {
            if (res.confirm) {
              query.get(optionId, {
                success: function (result) {
                  result.set("isShow", 1);
                  result.save();
                  console.log("公开成功");
                  common.dataLoading("公开成功", "success");
                },
                error: function (object, error) {
                  console.log("公开失败" + error);
                }
              });
              that.onShow();
            }
          }
        })
      }
    }

    if (join == "0") {//加入活动
    console.log(realname + contactValue);
      if (realname==""||contactValue=="") { //如果没补充基本信息
        wx.showModal({
          title: '温馨提示',
          content: '你还没认证基本信息哦，点击确定进入【认证】页面补充信息。',
          showCancel: true,
          success: function(res){
            if (res.confirm) {
            wx.navigateTo({
              url: '../myinfo/myinfo',
            })

            }

             }
        })
      } 
      else {
      that.setData({
        join: 1
      })

      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          var Contacts = Bmob.Object.extend("Contacts");
          var contact = new Contacts();
          var Events = Bmob.Object.extend("Events");
          var event = new Events();
          event.id = optionId;
          var me = new Bmob.User();
          me.id = ress.data;
          var pub = new Bmob.User();
          pub.id = publisherId;
          contact.set("publisher", pub);
          contact.set("currentUser", me);
          contact.set("event", event);
          contact.set("realname", realname);
          contact.set("contactValue", contactValue);
          console.log(contact);
          contact.save(null, {
            success: function () {
              console.log("写入联系表成功");
              that.setData({
                accountIndex: 0,
                contactValue: "",
                realname: ""
              })
            },
            error: function (error) {
              console.log(error);
            }
          });

          //加入之后生成消息存在表中，默认未未读
          var isme = new Bmob.User();
          isme.id = ress.data;
          var value = wx.getStorageSync("my_avatar")
          var my_username = wx.getStorageSync("my_username")
          var Plyre = Bmob.Object.extend("Plyre");
          var plyre = new Plyre();
          plyre.set("behavior", 5); //消息通知方式
          plyre.set("noticetype", "参加活动");
          plyre.set("bigtype", 2)//动态大类,消息类
          plyre.set("avatar", value); //我的头像
          plyre.set("username", my_username); // 我的名称
          plyre.set("uid", isme);
          plyre.set("wid", optionId); //活动ID
          plyre.set("fid", publisherId); //
          console.log("fid=" + publisherId)
          plyre.set("is_read", 0); //是否已读,0代表没有,1代表读了
          plyre.save();
          //将参加的人的消息写入活动表中,并更新参加人数
          var Diary = Bmob.Object.extend("Events");
          var queryLike = new Bmob.Query(Diary);
          queryLike.equalTo("objectId", optionId);
          queryLike.find({
            success: function (result) {
              var joinArray = result[0].get("joinArray");
              joinArray.push(ress.data);
              result[0].set('joinnumber', result[0].get('joinnumber') + 1);
              result[0].save();
            }
          })
        },
      })

      //报名成功后发送一条消息给当前用户
      wx.getStorage({
        key: 'user_openid',
        success: function (res) {
          var openid = res.data;
          //获取点击按钮的formId
          // var formId = event.detail.formId;
          let actid = optionId;
          let pubid = publisherId;
          var title = that.data.eventTitle;
          var address = that.data.address;
          var adminname = that.data.adminname;
          var adcontactValue = that.data.adcontactValue;
          var adcontact = adcontactValue;
          console.log("actid=" + optionId + ",pubid" + publisherId + ",title" + that.data.eventTitle + ",adminname=" + that.data.adminname + ",address" + that.data.address + ",adcontactValue=" + that.data.adcontactValue);
          //发送模板消息
          var temp = {
            "touser": openid,//这里是填写发送对象的openid
            "template_id": "NY0sFhJfxkA49EaRPhBYr17xiLqHKJ_XRAHMBQ52Y1c",//这里填写模板ID，可以在小程序后台配置
            //"page": "/pages/detail/detail?actid=" + actid + "&pubid=" + pubid,//点击后跳转的页面
            "page": "",
            // "form_id": formId,//这里填写formid
            "data": {
              "keyword1": {
                "value": title,
              },
              "keyword2": {
                "value": address
              },
              "keyword3": {
                "value": adminname
              },
              "keyword4": {
                "value": adcontact
              },
              "keyword5": {
                "value": "您已成功加入发起,请及时与发起人联系"
              }
            },
            "emphasis_keyword": ""
          }
          Bmob.sendMessage(temp).then(function (obj) {
            console.log('发送成功')
          },
            function (err) {
              console.log("发送失败")
            });
        },
      })

      wx.getStorage({
        key: 'my_username',
        success: function (ress) {
          var my_username = ress.data;
          wx.getStorage({
            key: 'user_openid',
            success: function (res) {
              var openid = res.data;
              var user = Bmob.User.logIn(my_username, openid, {
                success: function (user) {
                  var joinArray = user.get("eventJoin");
                  var isJoin = false;
                  if (joinArray == null) {
                    joinArray = [];
                  }
                  if (joinArray.length > 0) {
                    for (var i = 0; i < joinArray.length; i++) {
                      if (joinArray[i] == optionId) {
                        joinArray.splice(i, 1);
                        isJoin = true;
                        break;
                      }
                    }
                    if (isJoin == false) {
                      joinArray.push(optionId);
                    }
                  } else {
                    joinArray.push(optionId);
                  }
                  user.set("eventJoin", joinArray);
                  user.save(null, {
                    success: function () {
                      if (isJoin == false) {
                        common.dataLoading("参加成功", "success");
                      } else if (isJoin == true) {
                        common.dataLoading("取消参加成功", "success");
                      }
                    },
                    error: function (error) {
                      console.log("参加失败");
                    }
                  })
                  that.onShow();
                }
              });
            },
          })


        },
      })

      setTimeout(function () {
        that.setData({
          showTopTips: false
        });
      }, 1000);
      }

    } else if (join == "1") { //已加入点击取消加入）
       wx.showModal({
        title: '温馨提示',
        content: '确定取消加入吗？',
        showCancel: true,
        success: function (res) {
          if (res.confirm) {//如果点击确认
            that.setData({ 
              status: 0
            });
            //先删除联系表里的数据
            wx.getStorage({
              key: 'user_id',
              success: function (ress) {
                var me = new Bmob.User();
                me.id = ress.data;
                var Events = Bmob.Object.extend("Events");
                var event = new Events();
                event.id = optionId;
                var Diary = Bmob.Object.extend("Contacts");
                var query = new Bmob.Query(Diary);
                query.equalTo("currentUser", me);
                query.equalTo("event", event);
                query.destroyAll({
                  success: function () {
                    //删除成功
                    console.log("删除联系表中的数据成功");
                    that.setData({
                      join: 0,
                    })
                  },
                  error: function (err) {
                    console.log("删除联系表中的数据失败");
                    // 删除失败
                  }
                })
                //取消加入之后生成消息存在表中，默认未未读
                var isme = new Bmob.User();
                isme.id = ress.data;
                var value = wx.getStorageSync("my_avatar")
                var my_username = wx.getStorageSync("my_username")
                var Plyre = Bmob.Object.extend("Plyre");
                var plyre = new Plyre();
                plyre.set("behavior", 6); //消息通知方式
                plyre.set("noticetype", "取消参加");
                plyre.set("bigtype", 2)//动态大类,消息类
                plyre.set("avatar", value); //我的头像
                plyre.set("username", my_username); // 我的名称
                plyre.set("uid", isme);
                plyre.set("wid", optionId); //活动ID
                plyre.set("fid", publisherId); //
                plyre.set("is_read", 0); //是否已读,0代表没有,1代表读了
                plyre.save();
                //将取消参加的人的消息写入活动表中,并更新参加人数
                var Diary = Bmob.Object.extend("Events");
                var queryLike = new Bmob.Query(Diary);
                queryLike.equalTo("objectId", optionId);
                queryLike.find({
                  success: function (result) {
                    var joinArray = result[0].get("joinArray");
                    for (var i = 0; i < joinArray.length; i++) {
                      if (joinArray[i] == ress.data) {
                        joinArray.splice(i, 1);
                        result[0].set('joinnumber', result[0].get('joinnumber') - 1);
                        break;
                      }
                    }
                    result[0].save();
                  }
                })
              },
            })

            //从用户表中删除加入信息
            wx.getStorage({
              key: 'my_username',
              success: function (ress) {
                var my_username = ress.data;
                wx.getStorage({
                  key: 'user_openid',
                  success: function (res) { //将该文章的Id添加到我的收藏中，或者删除
                    var openid = res.data;
                    var user = Bmob.User.logIn(my_username, openid, {
                      success: function (user) {
                        var joinArray = user.get("eventJoin");
                        if (joinArray.length > 0) {
                          for (var i = 0; i < joinArray.length; i++) {
                            if (joinArray[i] == optionId) { //如果我已经收藏这个活动,再次点击应该是取消收藏
                              joinArray.splice(i, 1);
                              break;
                            }
                          }
                        }
                        user.set("eventJoin", joinArray);
                        user.save(null, {
                          success: function () {
                            common.dataLoading("取消参加成功", "success");
                          },
                          error: function (error) {
                            console.log("取消参加失败");
                          }
                        })
                        that.onShow();
                      }
                    });
                  },
                })
              },
            })
          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },
 
  //删除活动
  deleteEvent: function () {
    wx.showModal({
      title: '是否删除该活动?',
      content: '删除后将不能恢复',
      showCancel: true,
      confirmColor: "#a07c52",
      cancelColor: "#646464",
      success: function (res) {
        if (res.confirm) {
          //删除此活动后返回上一页
          var Diary = Bmob.Object.extend("Events");
          var queryEvent = new Bmob.Query(Diary);
          queryEvent.get(optionId, {
            success: function (result) {
              result.destroy({
                //删除成功
                success: function (myObject) {
                  common.dataLoading("删除成功", "success", function () {
                    wx.navigateBack({
                      delta: 1
                    })
                  });
                },
                //删除失败
                error: function (myObject, error) {
                  console.log(error);
                }
              })
            },
            error: function (object, error) {
              console.log(error);
            }
          });
        } else {

        }
      }
    })
  },
  //----------------------悬浮按钮操作--------------------------------------
  inButton() {
  
    this.button = $wuxButton.init('br', {
     
     
      callback(vm, opened) {
        vm.setData({
          opened,
        })
      },
    })
  },
  

})
