var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    config = require('./lib/config'),
    session = require('express-session'),
    sessionStore = require('./lib/sessionStore'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    _ = require('lodash'),
    humanize = require('humanize'),
    postNormalize = require('./lib/postNormalize'),

    routes = require('./routes/index'),
    users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.locals._ = _;
app.locals.humanize = humanize;

if(app.get('env') == 'development') {
  app.locals.pretty = true;
}

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: config.get('sessionSecret'),
  resave: true,
  saveUninitialized: false,
  store: sessionStore
}));

app.use(postNormalize);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
