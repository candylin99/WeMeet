//wx-drawer
var common = require('../../utils/common.js')
var Bmob = require("../../utils/bmob.js");
var util = require('../../utils/util.js');
var app = getApp()
var curIndex  = 0 ;
var that;

let istop = true;

var my_nick = wx.getStorageSync('my_nick')
var my_sex = wx.getStorageSync('my_sex')
var my_avatar=wx.getStorageSync('my_avatar')
Page({
  data: {
    animation: "",
    my_nick: my_nick,
    my_sex: my_sex,
    my_avatar: my_avatar,
    userInfo: [],
    dialog:false,
    autoplay:false,
    status: false,
    text1style: "color:#2A6693;font-size:19px",
    text2style: "",
  
    buttonClicked: false, //是否点击跳转
    //--------首页显示内容---------
    storeList: [], 
    postsList: [], //总的活动
    postsShowSwiperList: [], //轮播图显示的活动
    storeSwiperList:[],
    currentPage: 0, //要跳过查询的页数
    storecurrentPage:0,
    limitPage: 3,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
    isEmpty: false, //当前查询出来的数据是否为空
    totalCount: 0, //总活动数量
    endPage: 0, //最后一页加载多少条
    totalPage: 0, //总页数
    curIndex: 0,

    
  },
  //donghua
  onShow: function () {
    console.log('index---------onShow()')
    this.animation = wx.createAnimation({
      duration: 1400,
      timingFunction: 'linear', // "linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
      delay: 0,
      transformOrigin: '50% 50% 0',
      success: function (res) {
        console.log("res")
      }
    })
  },
  rotateAni: function (n) {
    console.log("rotate==" + n)
    this.animation.rotate(180 * (n)).step()
    this.setData({
      animation: this.animation.export()
    })
  },

  //首页切换图片
  onSwiperChange:function(event) {
    curIndex = event.detail.current
    this.changeCurIndex()
  },
  changeCurIndex:function(){
    this.setData({
      curIndex:curIndex
    })
  },
  onHide:function(){
    this.setData({
      autoplay:false
    })
  },

 


  onLoad(t) {
    console.log('onload执行了')
    var self = this;
    //this.getAll();
    //this.fetchTopThreePosts(); //获取轮播图的3篇文章
    try {
      let res = wx.getSystemInfoSync()
     
    } catch (e) {
    }
  },

  onShow: function (e) {
    console.log('onshow执行了')

    this.getAll();
    this.fetchStoreData();
    this.fetchStoreThreePosts();
    this.fetchTopThreePosts(); //获取轮播图的3篇文章
    //this.onLoad();
    console.log('加载头像')
    var that = this
    
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight1: res.windowHeight,
          windowWidth1: res.windowWidth,
          autoplay: true
        })
      }
    })
  },

  //数据存储
  onSetData: function (data) {
    console.log(data.length);
    let page = this.data.currentPage + 1;
    let stpage = this.data.storecurrentPage + 1;
    //设置数据
    data = data || [];
    
    this.setData({
      postsList: page === 1 || page === undefined ? data : this.data.postsList.concat(data),

    });
    console.log(this.data.storeSwiperList)
    console.log(this.data.storeList, stpage);

  },

  //获取总的活动数
  getAll: function () {
    self = this;
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    query.equalTo("isShow",1); //只统计公开显示的活动
    query.count({
      success: function (count) {
        var totalPage = 0;
        var endPage = 0;
        if (count % self.data.limitPage == 0) {//如果总数的为偶数
          totalPage = parseInt(count / self.data.limitPage);
        } else {
          var lowPage = parseInt(count / self.data.limitPage);
          endPage = count - (lowPage * self.data.limitPage);
          totalPage = lowPage + 1;
        }
        self.setData({
          totalCount: count,
          endPage: endPage,
          totalPage: totalPage
        })
        console.log("共有" + count + " 条记录");
        console.log("共有" + totalPage + "页");
        console.log("最后一页加载" + endPage + "条");
      },
    });
  },




  //获取轮播图的文章,点赞数最多的前3个
  fetchTopThreePosts: function () {
    var self = this;
    var molist = new Array();
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    query.equalTo("isShow", 1); //公开显示的
    query.descending("likenum");
    query.include("publisher");
    query.limit(3);
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          var publisherId = results[i].get("publisher").objectId;
          var title = results[i].get("title");
          var content = results[i].get("content");
          var acttype = results[i].get("acttype");
          var isShow = results[i].get("isShow");
          var endtime = results[i].get("endtime");
          var address = results[i].get("address");
          var addressdetail = results[i].get("addressdetail");
          var peoplenum = results[i].get("peoplenum");
          var likenum = results[i].get("likenum");
          var liker = results[i].get("liker");
          var isLike = 0;
          var commentnum = results[i].get("commentnum");
          
          var id = results[i].id;
          var createdAt = results[i].createdAt;
          var pubtime = util.getDateDiff(createdAt);
          var _url
          var actpic = results[i].get("actpic");
          if(actpic){
            _url = results[i].get("actpic")._url;
          }else {
            _url = "http://bmob-cdn-22812.b0.upaiyun.com/2019/04/22/878ffe3c40f2a8c6800f2e2d6bdc62de.jpg";
          }
          var publisherName = results[i].get("publisher").nickname;
          var publisherPic = results[i].get("publisher").userPic;
          var jsonA;
          jsonA = {
            "title": title || '',
            "content": content || '',
            "acttype": acttype || '',
            "isShow": isShow,
            "endtime": endtime || '',
            "address": address || '',
            "addressdetail": addressdetail || '',
            "peoplenum": peoplenum || '',
            "id": id || '',
            "publisherPic": publisherPic || '',
            "publisherName": publisherName || '',
            "publisherId": publisherId || '',
            "pubtime": pubtime || '',
            "actPic": _url || '',
            "likenum": likenum,
            "commentnum": commentnum,
            "is_liked": isLike || ''
          }
          molist.push(jsonA);
        }
        self.setData({
          postsShowSwiperList: molist
        })
      
     self.fetchPostsData(self.data); //加载首页信息
       
        
      },
      error: function (error) {
        console.log(error)
      }
    })
  },

  //获取首页列表文章
  fetchPostsData: function (data) {
    var self = this;
    //获取详询活动信息
    var molist = new Array();
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    query.equalTo("isShow", 1); //公开显示的
    query.limit(self.data.limitPage);
    console.log(self.data.limitPage);
    query.skip( 3 * self.data.currentPage);
    query.descending("createdAt"); //按照时间降序
    query.include("publisher");
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          var publisherId = results[i].get("publisher").objectId;
          var title = results[i].get("title");
          var content = results[i].get("content");
          var acttype = results[i].get("acttype");
          var endtime = results[i].get("endtime");
          var address = results[i].get("address");
          var acttypename = getTypeName(acttype); //根据类型id获取类型名称
          var isShow = results[i].get("isShow");
          var peoplenum = results[i].get("peoplenum");
          var likenum = results[i].get("likenum");
          var liker = results[i].get("liker");
          var isLike = 0;
          var commentnum = results[i].get("commentnum");
          var id = results[i].id;
          var createdAt = results[i].createdAt;
          var pubtime = util.getDateDiff(createdAt);
          var _url
          var actpic = results[i].get("actpic");
          if (actpic) {
            _url = results[i].get("actpic")._url;
          } else {
            _url = "http://bmob-cdn-22812.b0.upaiyun.com/2019/04/22/878ffe3c40f2a8c6800f2e2d6bdc62de.jpg";
          }
          var publisherName = results[i].get("publisher").nickname;
          var publisherPic = results[i].get("publisher").userPic;
          var jsonA;
          jsonA = {
            "title": title || '',
            "content": content || '',
            "acttype": acttype || '',
            "acttypename": acttypename || '',
            "isShow": isShow,
            "endtime": endtime || '',
            "address": address || '',
            "peoplenum": peoplenum || '',
            "id": id || '',
            "publisherPic": publisherPic || '',
            "publisherName": publisherName || '',
            "publisherId": publisherId || '',
            "pubtime": pubtime || '',
            "actPic": _url || '',
            "likenum": likenum,
            "commentnum": commentnum,
            "is_liked": isLike || ''
          }
          molist.push(jsonA);
        }
        self.onSetData(molist, self.data.currentPage);

        setTimeout(function () {
          wx.hideLoading();
        }, 900);
      },
      error: function (error) {
        console.log(error)
      }
    })
  },



  //获取好店轮播图,点赞数最多的前3个
  fetchStoreThreePosts: function () {
    var self = this;
    var molist = new Array();
    var Diary = Bmob.Object.extend("StoreEvents");
    var query = new Bmob.Query(Diary);
    query.descending("likenum");
    query.limit(3);
  
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          var publisherId = results[i].get("publisher").objectId;
          var title = results[i].get("title");
          var content = results[i].get("content");
          var acttype = results[i].get("acttype");
          var isShow = results[i].get("isShow");
          var endtime = results[i].get("endtime");
          var address = results[i].get("address");
          var price = results[i].get("price"); 
          var addressdetail = results[i].get("addressdetail");
          var peoplenum = results[i].get("peoplenum");
          var likenum = results[i].get("likenum");
          var liker = results[i].get("liker");
          var isLike = 0;
          var commentnum = results[i].get("commentnum");

          var id = results[i].id;
          var createdAt = results[i].createdAt;
          var pubtime = util.getDateDiff(createdAt);
          var _url
          var actpic = results[i].get("actpic");
          if (actpic) {
            _url = results[i].get("actpic")._url;
          } else {
            _url = "http://bmob-cdn-14867.b0.upaiyun.com/2017/12/01/89a6eba340008dce801381c4550787e4.png";
          }
          var publisherName = results[i].get("publisher").nickname;
          var publisherPic = results[i].get("publisher").userPic;
          var jsonA;
          jsonA = {
            "title": title || '',
            "content": content || '',
            "acttype": acttype || '',
            "isShow": isShow,
            "endtime": endtime || '',
            "address": address || '',
            "addressdetail": addressdetail || '',
            "peoplenum": peoplenum || '',
            "id": id || '',
            "publisherId": publisherId || '',
            "price": price,

            "publisherPic": publisherPic || '',
            "publisherName": publisherName || '',
            "pubtime": pubtime || '',
            "actPic": _url || '',
            "likenum": likenum,
            "commentnum": commentnum,
            "is_liked": isLike || ''
          }
          molist.push(jsonA);
        }
        console.log(jsonA);
        self.setData({
        storeSwiperList: molist
        })
console.log(molist);
        self.fetchStoreData(self.data); //加载首页信息


      },
      error: function (error) {
        console.log(error)
      }
    })
  },






  fetchStoreData: function (data) {
    var self = this;
    //获取详询活动信息
    var storemolist = new Array();
    var Diary = Bmob.Object.extend("StoreEvents");
    var query = new Bmob.Query(Diary);
    query.include("publisher");

    query.descending("createdAt"); //按照时间降序

    console.log(query);
    // query.limit(self.data.limitPage);
    //  console.log(self.data.limitPage);
    //  query.skip(3 * self.data.storecurrentPage);
    query.find({
      
      success: function (results) {

        for (var i = 0; i < results.length; i++) {
          
          var title = results[i].get("title");
          var content = results[i].get("content");
          var attention = results[i].get("attention");
          var publisherId = results[i].get("publisher").objectId;

          var endtime = results[i].get("endtime");
          var address = results[i].get("address");
          var isShow = results[i].get("isShow");
          var peoplenum = results[i].get("peoplenum");
          var likenum = results[i].get("likenum");
          var isLike = 0;
          var commentnum = results[i].get("commentnum");
          var id = results[i].id;
          var createdAt = results[i].createdAt;
          var pubtime = util.getDateDiff(createdAt);
          var _url
          var actpic = results[i].get("actpic");
          if (actpic) {
            _url = results[i].get("actpic")._url;
          } else {
            _url = "http://bmob-cdn-22812.b0.upaiyun.com/2019/04/18/ce2cdde9404d35018099ae77195ffc6a.png";
          }
          var jsonA;
          var publisherName = results[i].get("publisher").nickname;
          var publisherPic = results[i].get("publisher").userPic;
          jsonA = {
            "title": title || '',
            "content": content || '',
            "attention": attention || '',

            "isShow": isShow,
            "endtime": endtime || '',
            "address": address || '',
            "peoplenum": peoplenum || '',
            "id": id || '',
            "publisherPic": publisherPic || '',

            "publisherName": publisherName || '',
            "publisherId": publisherId || '',


            "pubtime": pubtime || '',
            "actPic": _url || '',
            "likenum": likenum,
            "commentnum": commentnum          }
          storemolist.push(jsonA);
        }
        self.setData({
         storeList:storemolist
        })
        console.log(storemolist)
        console.log(storemolist.publisherId)
        // self.onSetData(storemolist, self.data.currentPage);
       

        setTimeout(function () {
          wx.hideLoading();
        }, 900);
      },
      error: function (error) {
        console.log(error)
      }
    })
  },


  //商店页面
  tapstore: function (e) {
    var that = this;
    setTimeout(function () {
      that.setData({
        'text_status': false,
        'status': true

      });
    }, 300)
  },
  tapdiscovery: function (e) {
    var that = this;
    setTimeout(function () {
      that.setData({
        'text_status': true,
        'status': false

      });
    }, 300)
  },

 
  //加载下一页
  loadMore: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    //一秒后关闭加载提示框
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    var self = this;
    self.setData({
      currentPage: self.data.currentPage + 1
    });
    console.log("当前页"+self.data.currentPage);
    //先判断是不是最后一页
    if (self.data.currentPage + 1 == self.data.totalPage){
      self.setData({
        isEmpty: true
      })
      if (self.data.endPage != 0) { //如果最后一页的加载不等于0
        self.setData({
          limitPage: self.data.endPage,
        })
      }
      this.fetchPostsData(self.data);
      // this.fetchStoreData(self.data);
    }else{
      this.fetchPostsData(self.data);
      // this.fetchStoreData(self.data);

    }
  },

  onPullDownRefresh: function () {
    console.log(" pull up refresh")
    wx.showNavigationBarLoading()
    //在标题栏中显示加载
    wx.showLoading({
      title: '正在刷新',
      mask: false
    });
    //一秒后关闭加载提示框
    setTimeout(function () {
      wx.hideLoading()
      wx.hideNavigationBarLoading();//隐藏导航条加载动画。

      wx.stopPullDownRefresh();//停止当前页面下拉刷新。
    }, 800)
    this.setData({
      postsList: [], //总的活动
      postsShowSwiperList: [], //轮播图显示的活动
      storeSwiperList:[],
      currentPage: 0, //要跳过查询的页数
      limitPage: 3,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
      isEmpty: false, //当前查询出来的数据是否为空
      totalCount: 0, //总活动数量
      endPage: 0, //最后一页加载多少条
      totalPage: 0, //总页数
      curIndex: 0,
      windowHeight1: 0,
      windowWidth1: 0,
    })
    this.onShow();
  },

  //点击刷新
  refresh: function () {
    console.log(" pull up refresh")
    wx.showNavigationBarLoading() 
    //在标题栏中显示加载
    wx.showLoading({
      title: '正在刷新',
      mask: false
    });
    //一秒后关闭加载提示框
    setTimeout(function () {
      wx.hideLoading()
    }, 800)
    this.setData({
      postsList: [], //总的活动
      postsShowSwiperList: [], //轮播图显示的活动
      storeSwiperList:[],
      currentPage: 0, //要跳过查询的页数
      limitPage: 3,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
      isEmpty: false, //当前查询出来的数据是否为空
      totalCount: 0, //总活动数量
      endPage: 0, //最后一页加载多少条
      totalPage: 0, //总页数
      curIndex: 0,
      windowHeight1: 0,
      windowWidth1: 0,
    })
    this.onShow();
  },
 
  // 点击活动进入活动详情页面
  click_activity: function (e) {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      let actid = e.currentTarget.dataset.actid;
      let pubid = e.currentTarget.dataset.pubid;
      let user_key = wx.getStorageSync('user_key');
      wx.navigateTo({
        url: '/pages/detail/detail?actid=' + actid + "&pubid=" + pubid
      });
    }
  },
  click_store_activity: function (e) {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      let actid = e.currentTarget.dataset.actid;
      // let pubid = e.currentTarget.dataset.pubid;
      let user_key = wx.getStorageSync('user_key');
      wx.navigateTo({
        url: '/pages/storedetail/storedetail?actid=' + actid 
        // + "&pubid=" + pubid
      });
    }
  },
  //点击搜索
  click_search: function () {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      console.log(getCurrentPages()) 
      wx.navigateTo({
        url: '/pages/search/search',
      });
    }
  },
  

  //滚动条到top
  doScrollTop(e) {
    istop = this.data.isTop
    if (e.detail.scrollTop < 10) {

      if (!istop) {
        this.setData({
          isTop: true
        })
      }
    } else {
      if (istop) {
        this.setData({
          isTop: false
        })
      }
    }
  },
  

  //--------------------------------------------------------------------------------------------------------

  
 
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