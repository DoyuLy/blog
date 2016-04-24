
module.exports = function(app){

  var crypto = require('crypto'),
      User = require('../models/user.js'),
      Publish = require('../models/publish.js'),
      Comment = require('../models/comment.js');
  var passport = require('passport');


  app.get('/', function(req, res){

    var page = req.query.p ? parseInt(req.query.p) : 1;
    (new Publish()).getTen(null, page, function (err, pubs, total) {
      if(err) pubs = [];
        res.render('index', {
          title: '主页',
          user: req.session.user,
          pubs: pubs,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + pubs.length) == total,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
    });
    //(new Publish()).getAll(null, function (err, pubs) {
    //  if(err) pubs = [];
    //  res.render('index', {
    //    title: '主页',
    //    user: req.session.user,
    //    pubs: pubs,
    //    success: req.flash('success').toString(),
    //    error: req.flash('error').toString()
    //  });
    //});
  });

  app.get('/reg', checkNotLogin);
  app.get('/reg', function(req, res){
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function(req, res){
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'],
        email = req.body.email;
    if(password != password_re){
      req.flash('error', '两次输入的密码不一致！');
      return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5'),
        password_new = md5.update(password).digest('hex');
    console.log('----------------\n'+JSON.stringify(User));
    var u = new User({
      name: name,
      password: password_new,
      email: email
    });

    u.get(u.name, function (err, user) {
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }
      if(user){
        req.flash('error', '用户已存在！');
        return res.redirect('/reg');
      }

      u.save_1(function(err, user){
        if(err){
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功！');
        res.redirect('/')
      });
    });
  });

  app.get('/login/github', passport.authenticate('github', {session: false}));
  app.get('/login/github/callback', passport.authenticate('github', {
    session: false, //使用express的session
    failureRedirect: '/login'
    //successFlash: '登录成功？'
  }), function (req, res) {
    //passport 默认将数据放到req.user中
    //原理就是使用第三方账号登录,把用户相关信息返回来并写入
    var user = new User({username: req.user.username});
    user.get( req.user.username, function(err, user){
      if(!user){
        req.session.user = {name: req.user.username, head: 'http://cn.gravatar.com/avatar/' + req.user._json.gravatar_id + "?s=48"};//https://gravatar.com/avatar/
        req.flash('success', '登录成功！');
        res.redirect('/');
      }else{
        req.flash('error', '登录失败！');
        res.redirect('/login');
      }
    });
  });

  app.get('/login',checkNotLogin);
  app.get('/login', function(req, res){
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login',checkNotLogin);
  app.post('/login', function(req, res){
    var name = req.body.name,
        password = req.body.password;
    var md5 = crypto.createHash('md5');
    password = md5.update(password).digest('hex');
    var u = new User({
      name: name,
      password: password
    });
    u.get(u.name, function(err, user){
      if(!user){
        req.flash('error', '用户不存在！');
        return res.redirect('/login');
      }
      if(user.password != password){
        req.flash('error', '密码错误！');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登录成功！');
      res.redirect('/');
    })
  });

  app.get('/pub',checkLogin);
  app.get('/pub', function(req, res){
    res.render('pub', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/pub',checkLogin);
  app.post('/pub', function(req, res){
    var user = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
        pub = new Publish(user.name, req.body.title, req.body.content, tags, user.head);

    pub.save(function (err) {
      if(err){
        req.flash('err', err);
        return res.redirect('/');
      }
      req.flash('success', '发表成功！');
      res.redirect('/');
    })
  });

  app.get('/logout',checkLogin);
  app.get('/logout', function(req, res){
    req.session.user = null;
    req.flash('success', '登出成功！');
    res.redirect('/');
  });

  app.get('/upload',checkLogin);
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: '上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/upload',checkLogin);
  app.post('/upload', function (req, res) {
    req.flash('success', '文件上传成功！');
    res.redirect('/upload');
  });

  //点击用户查询当前用户所有文章
  app.get('/u/:name', function (req, res) {

    var page = req.query.p ? parseInt(req.query.p) : 1;

    (new User({})).get(req.params.name, function(err, user){
      //解决第三方登录无法进入用户的用户首页
      //if(!user){
      //  req.flash('error', '用户不存在！');
      //  return res.redirect('/');
      //}
      //兼容第三方登录获取用户名
      var name = user ? user.name : req.session.user.name;
      (new Publish()).getTen(name, page, function (err, pubs, total) {
        if(err){
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user', {
          title: name,
          user: req.session.user,
          pubs: pubs,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + pubs.length) == total,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  });

  //获取所有文章存档信息
  app.get('/archive', function (req, res) {

    (new Publish()).getArchive(function(err, pubs){
        if(err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('archive', {
          title: '存档',
          user: req.session.user,
          pubs: pubs,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
  });

  //获取所有标签
  app.get('/tags', function (req, res) {

    (new Publish()).getTags(function(err, tags){
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tags', {
        title: '标签',
        user: req.session.user,
        tags: tags,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //点击标签获取包含该标签的文章信息
  app.get('/tags/:tag', function (req, res) {
    var tag =req.params.tag;
    (new Publish()).getTag(tag, function(err, pubs){
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tag', {
        title: 'TAG：' + tag,
        user: req.session.user,
        pubs: pubs,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //跳转文章
  app.get('/u/:name/:day/:title', function (req, res) {
    var name = req.params.name || req.session.user.name,
        day = req.params.day,
        title = req.params.title;
    (new Publish()).getOne(name, day, title, function (err, pub) {
      if(err){
        //console.log('========error======'+ err.toString());
        req.flash('error', err);
        return res.redirect('/');
      }

      res.render('article', {
        title: name,
        user: req.session.user,
        pub: pub,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //留言
  app.post('/u/:name/:day/:title', function (req, res) {
    var date = new Date(),
        time = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
            + ' '
            + [date.getHours(), date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()].join(':'),
        md5 = crypto.createHash('md5'),
        email_md5 = md5.update(req.body.email.trim().toLowerCase()).digest('hex'),
        head =  'http://cn.gravatar.com/avatar/' + email_md5 + '?s=48';


    var comment = {
      name: req.body.name,
      email: req.body.email,
      website: req.body.website,
      time: time,
      content: req.body.content,
      head: head
    }
    var data = new Comment(req.params.name, req.params.day, req.params.title, comment);
    data.save(function (err) {
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '留言成功！');
      res.redirect('back');
    })
  });

  //编辑文章
  app.get('/edit/:name/:day/:title',checkLogin);
  app.get('/edit/:name/:day/:title', function (req, res) {
    var name = req.params.name || req.session.user.name,
        day = req.params.day,
        title = req.params.title;
    (new Publish()).edit(name, day, title, function (err, pub) {
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }

      res.render('edit', {
        title: '编辑',
        user: req.session.user,
        pub: pub,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //保存文章
  app.post('/edit/:name/:day/:title',checkLogin);
  app.post('/edit/:name/:day/:title', function (req, res) {
    var name = req.params.name || req.session.user.name,
        day = req.params.day,
        title = req.params.title,
        content = req.body.content;
    (new Publish()).update(name, day, title, content, function (err) {
      //注意不能使用encodeURIComponent()
      var url = encodeURI(['/u', name, day, title].join('/'));
      if(err){
        req.flash('error', err);
        return res.redirect(url);
      }
      req.flash('success', '修改成功！');
      res.redirect(url);
    });
  });

  //删除文章
  app.get('/remove/:name/:day/:title',checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var name = req.params.name || req.session.user.name,
        day = req.params.day,
        title = req.params.title;
    (new Publish()).remove(name, day, title, function (err) {
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功！');
      res.redirect('/');
    });
  });

  //全文搜索
  app.get('/search', function (req, res) {
    var keyword = req.query.keyword.trim();
    (new Publish()).search(keyword, function (err, pubs) {
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('search', {
        title: 'SEARCH',
        user: req.session.user,
        pubs: pubs,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/links', function (req, res) {
    res.render('links', {
      title: '友情链接',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  })

  function checkLogin(req, res, next){
    if(!req.session || !req.session.user){
      req.flash('error', '未登录！');
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(res, req, next){
    if(req.session && req.session.user){
      req.flash('error', '已登录！');
      res.redirect('back');
    }
    next();
  }
};