var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var fileUpload = require('express-fileupload');
async = require("async");

// Connect database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/test2');

// Front-End
var home = require('./routes/home');
var product = require('./routes/product');
var cart = require('./routes/cart');
var account = require('./routes/account');
var brand = require('./routes/brand');

// Back-End
var loginAdmin = require('./routes/admin/login');
var categoryAdmin = require('./routes/admin/category');
var productAdmin = require('./routes/admin/product');
var brandAdmin = require('./routes/admin/brand');
var roleAdmin = require('./routes/admin/role');
var orderAdmin = require('./routes/admin/order');
var accountAdmin = require('./routes/admin/account');
var settingAdmin = require('./routes/admin/setting');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({resave: true, saveUninitialized: true, secret: 'octopuscodes', cookie: { maxAge: 60000 }}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// Make our db accessible to our router
app.use(function(req, res, next){
    req.db = db;
    res.locals.session = req.session;
    next();
});

// Front-End
app.use('/', home);
app.use('/home', home);
app.use('/product', product);
app.use('/cart', cart);
app.use('/account', account);
app.use('/brand', brand);

// Back-End
app.use('/admin/login', loginAdmin);
app.use('/admin/category', requireRole("admin"), categoryAdmin);
app.use('/admin/product', requireRole("admin"), productAdmin);
app.use('/admin/brand', requireRole("admin"), brandAdmin);
app.use('/admin/role', requireRole("admin"), roleAdmin);
app.use('/admin/order', requireRole("admin"), orderAdmin);
app.use('/admin/account', requireRole("admin"), accountAdmin);
app.use('/admin/setting', requireRole("admin"), settingAdmin);

function requireRole(role) {
    return function(req, res, next) {
        if(req.session.user && req.session.user.roleId === role)
            next();
        else
            res.redirect('/admin/login');
    }
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(5000, function(){
  console.log("Server is listening port 5000")
});