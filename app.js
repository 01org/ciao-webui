var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var uuid = require('node-uuid');

var index = require('./routes/index');
var components = require('./routes/components');
var tenant = require('./routes/tenant');
var admin = require('./routes/admin');
var data = require('./routes/data');
var authenticate = require('./routes/authenticate');

var sessionHandler = require('./core/session');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//trust proxy this is required if app is running on HTTPS
app.set('trust proxy', true);

//setup session framework
app.use(session({
    genid: function (req) {
        return uuid.v4();
    },
    secret: 'ciao-web-ui',
    resave: false,
    secure: true,
    saveUninitialized: false
}));

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'vendor')));
app.use(express.static(path.join(__dirname, 'build')));

// "components" view is for development & debugging purposes only.
// don't forget to remove
// In addition, main pages are considered to be tenant and admin.
// other views such as "machine detail" or "create tenant" may live inside these
// unless redefined

//object that contains available urls.
var urls_config = {
    index: '/',
    components: '/components',
    tenant: '/tenant',
    admin: '/admin',
    data: '/data',
    authenticate: '/authenticate'
};

// set up globals
// WARNING: only set strictly necessary variables.
// WARNING: Api functionality, urls, and available data might change until
// requested endpoints/services are fully implemented.
global.URLS_CONFIG = urls_config;

app.use(urls_config.index, index);
app.use(urls_config.components, components);
app.use(urls_config.tenant, tenant);
app.use(urls_config.data, data);
app.use(urls_config.admin, admin);
app.use(urls_config.authenticate, authenticate);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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
