var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var multer = require('multer');

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var hbs = require('express-handlebars');

var routes = require('./routes/index');
var settings = require('./settings');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//设置模板为hbs
//app.engine('hbs', exphbs({
//  layoutsDir: 'views',
//  defaultLayout: 'layout',//layout.hbs
//  extname:'.hbs'
//}));
//app.set('view engine', 'hbs');

app.use(flash());
//app.set('env', 'production');


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(session({
//  secret: settings.cookieSecret,
//  key: settings.db,//cookie name
//  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
//  store: new MongoStore({
//    db:settings.db,
//    host: settings.host,
//    port: settings.port
//  }),
//  resave: false,
//  saveUninitialized: true
//}));

app.use(session({
  secret: settings.cookieSecret,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  url: settings.connectURL
}))

app.use(multer({
  dest: './public/images',
  rename: function(fieldname, filename){
    //修改上传文件名
    console.log(fieldname+'|' + filename);
    var suffix = filename.split('.')[1];
    return Date.parse(new Date()).toString() + suffix;
  }
}));
app.use(logger('dev'));
//info日志
app.use(logger({stream: accessLog}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//error日志
app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
})

app.use(passport.initialize());
//app.use('/', routes);
//app.use('/users', users);
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //var err = new Error('Not Found');
  //err.status = 404;
  //next(err);
  res.render('404');
});

passport.use(new GithubStrategy({
  clientID: 'fc098b5fc6a1ffc093de',
  clientSecret: 'e8b9b591ff5ab36d54c8c6a2d7ba4e37d6be5084',
  callbackURL: 'http://localhost:3000/login/github/callback'
}, function (accessToken, refreshToken, profile, done) {
  //console.log('======oAuth=======\n'+accessToken +'|' + refreshToken + '|' + profile.toString())
  done(null, profile);
}));

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
